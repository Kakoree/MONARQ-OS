import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { anonClient, FIXTURES, signInAs } from "../setup/clients";
import { deleteTestUsers, hasServiceKey } from "../setup/admin";
import type { Database } from "../../lib/supabase/types";

// redeem_access_code() only does real work for a *pending* member — it
// early-returns for anyone already active (see the function body), so this
// path can't be exercised with the persistent fixtures at all. Each test
// run signs up fresh disposable accounts instead.
//
// Those accounts are now torn down in afterAll via the service-role admin
// API (tests/setup/admin.ts). Before V4 Phase 0 they could not be, and 12
// of them had accumulated in production data — enough to make the admin
// dashboard report 15 "active members" when only 3 were real.

let admin: SupabaseClient<Database>;
let dropId: string;
let codeId: string;
const TEST_CODE = `TESTCODE${Date.now()}`;
// A second, generous-use code so the throttle tests can prove a *valid*
// code is refused while locked out, without competing for TEST_CODE's
// single use.
const THROTTLE_CODE = `THROTTLE${Date.now()}`;
let throttleCodeId: string;

beforeAll(async () => {
  admin = await signInAs(FIXTURES.adminA.email, FIXTURES.adminA.password);

  const { data: drop, error: dropError } = await admin
    .from("drops")
    .insert({
      title: "Automated test drop",
      description: "Created by the Phase 0 test suite.",
      is_key_drop: true,
    })
    .select("id")
    .single();
  if (dropError) throw dropError;
  dropId = drop.id;

  const { data: code, error: codeError } = await admin
    .from("access_codes")
    .insert({ code: TEST_CODE, max_uses: 1, drop_id: dropId })
    .select("id")
    .single();
  if (codeError) throw codeError;
  codeId = code.id;

  const { data: throttleCode, error: throttleCodeError } = await admin
    .from("access_codes")
    .insert({ code: THROTTLE_CODE, max_uses: 50 })
    .select("id")
    .single();
  if (throttleCodeError) throw throttleCodeError;
  throttleCodeId = throttleCode.id;
});

afterAll(async () => {
  // Users first, deliberately. redemptions holds a foreign key to
  // access_codes, so deleting a redeemed code while its redemption still
  // exists fails — silently, since teardown ignores errors. That ordering
  // bug left six stale test codes in production data before it was caught.
  // Deleting the auth user cascades its profile, membership, redemptions
  // and access_code_attempts, which then frees the codes.
  if (!hasServiceKey()) {
    console.warn(
      "SUPABASE_SERVICE_ROLE_KEY not set — disposable test accounts will be left behind."
    );
  }
  await deleteTestUsers(disposableUserIds);

  await admin.from("access_codes").delete().eq("id", codeId);
  await admin.from("access_codes").delete().eq("id", throttleCodeId);
  await admin.from("drops").delete().eq("id", dropId);
});

const disposableUserIds: string[] = [];

async function signUpFreshPendingUser() {
  const client = anonClient();
  const email = `monarq-test-redeem-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
  const { data, error } = await client.auth.signUp({
    email,
    password: "Test-Password-123!",
  });
  if (error) throw error;
  if (data.user?.id) disposableUserIds.push(data.user.id);
  return client;
}

describe("redeem_access_code claims a linked drop", () => {
  it("activates membership and records a real drop_claims row", async () => {
    const freshUser = await signUpFreshPendingUser();

    const { error } = await freshUser.rpc("redeem_access_code", { p_code: TEST_CODE });
    expect(error).toBeNull();

    const { data: session } = await freshUser.auth.getUser();
    const userId = session.user!.id;

    const { data: claim } = await freshUser
      .from("drop_claims")
      .select("drop_id")
      .eq("user_id", userId)
      .eq("drop_id", dropId)
      .maybeSingle();
    expect(claim).toBeTruthy();
  });

  it("rejects a second redemption once the code's max_uses is exhausted", async () => {
    const secondUser = await signUpFreshPendingUser();
    const { error } = await secondUser.rpc("redeem_access_code", { p_code: TEST_CODE });
    expect(error).toBeTruthy();
    expect(error!.message).toMatch(/no remaining uses/i);
  });
});

// 0040 made code matching case-insensitive via upper(). Nothing covered
// that, and it was silently lost once while patching this function — the
// drop_claims test caught the other half of the same mistake, this one
// didn't exist yet. It does now.
it("matches codes case-insensitively", async () => {
  const freshUser = await signUpFreshPendingUser();

  const { data, error } = await freshUser.rpc("redeem_access_code", {
    p_code: THROTTLE_CODE.toLowerCase(),
  });

  expect(error).toBeNull();
  expect(data).toBe("active");
});

describe("access-code guess throttling (0044)", () => {
  it("returns the membership unchanged for a wrong code instead of raising", async () => {
    const freshUser = await signUpFreshPendingUser();

    const { data, error } = await freshUser.rpc("redeem_access_code", {
      p_code: "DEFINITELY-NOT-A-REAL-CODE",
    });

    // The whole point of not raising: an exception would roll back the
    // failed-attempt row logged alongside it.
    expect(error).toBeNull();
    expect(data).toBe("pending");
  });

  it("actually persists failed attempts rather than rolling them back", async () => {
    const freshUser = await signUpFreshPendingUser();
    const { data: session } = await freshUser.auth.getUser();
    const userId = session.user!.id;

    await freshUser.rpc("redeem_access_code", { p_code: "WRONG-1" });
    await freshUser.rpc("redeem_access_code", { p_code: "WRONG-2" });

    const { data: attempts } = await admin
      .from("access_code_attempts")
      .select("id")
      .eq("user_id", userId);
    expect(attempts).toHaveLength(2);
  });

  it("locks out after 10 failed guesses in an hour", async () => {
    const freshUser = await signUpFreshPendingUser();

    for (let i = 0; i < 10; i++) {
      const { error } = await freshUser.rpc("redeem_access_code", {
        p_code: `WRONG-${i}`,
      });
      expect(error).toBeNull();
    }

    const { error } = await freshUser.rpc("redeem_access_code", {
      p_code: "WRONG-11",
    });
    expect(error).toBeTruthy();
    expect(error!.message).toMatch(/too many attempts/i);
  });

  it("blocks a correct code too once locked out, not just wrong ones", async () => {
    const freshUser = await signUpFreshPendingUser();

    for (let i = 0; i < 10; i++) {
      await freshUser.rpc("redeem_access_code", { p_code: `WRONG-${i}` });
    }

    const { error } = await freshUser.rpc("redeem_access_code", {
      p_code: THROTTLE_CODE,
    });
    expect(error).toBeTruthy();
    expect(error!.message).toMatch(/too many attempts/i);
  });

  it("never lets a member read or clear their own attempt log", async () => {
    const freshUser = await signUpFreshPendingUser();
    await freshUser.rpc("redeem_access_code", { p_code: "WRONG-READ" });

    const { data: session } = await freshUser.auth.getUser();
    const userId = session.user!.id;

    // Readable by nobody but an admin — a member who could see or delete
    // these rows could reset their own limit.
    const { data: visible } = await freshUser
      .from("access_code_attempts")
      .select("id");
    expect(visible ?? []).toHaveLength(0);

    await freshUser.from("access_code_attempts").delete().eq("user_id", userId);

    const { data: stillThere } = await admin
      .from("access_code_attempts")
      .select("id")
      .eq("user_id", userId);
    expect(stillThere).toHaveLength(1);
  });
});

// If a run is killed mid-suite, teardown won't have executed. Prune with:
//
//   delete from auth.users where email like 'monarq-test-redeem-%@example.com';
