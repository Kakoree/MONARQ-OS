import { beforeAll, describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { FIXTURES, signInAs } from "../setup/clients";
import type { Database } from "../../lib/supabase/types";

// habit_grace_tokens has no INSERT/UPDATE/DELETE RLS policy for anyone,
// including admin — grant_grace_token and consume_grace_token (both
// security definer) are the only way rows are ever written, and nothing
// can reset that state between runs without a service-role key. Given the
// chosen no-elevated-credential test strategy, these tests deliberately
// assert invariants that hold regardless of prior run history, rather than
// exact before/after state tied to a specific starting point — the suite
// is meant to be re-run freely (CI-style) without manual re-seeding.

let memberA: SupabaseClient<Database>;
let memberB: SupabaseClient<Database>;

function daysAgo(n: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

async function unconsumedCount(client: SupabaseClient<Database>, userId: string) {
  const { data, error } = await client
    .from("habit_grace_tokens")
    .select("id")
    .eq("user_id", userId)
    .is("consumed_at", null);
  if (error) throw error;
  return data.length;
}

beforeAll(async () => {
  memberA = await signInAs(FIXTURES.memberA.email, FIXTURES.memberA.password);
  memberB = await signInAs(FIXTURES.memberB.email, FIXTURES.memberB.password);
});

describe("habit_grace_tokens SELECT policy", () => {
  it("hides one member's tokens from another member", async () => {
    const count = await unconsumedCount(memberA, FIXTURES.memberB.id);
    expect(count).toBe(0);
  });
});

describe("grant_grace_token", () => {
  it("never lets a member hold more than 3 unconsumed tokens", async () => {
    // Member B carries seeded/accumulated tokens across runs by design (see
    // file header) — exactly the history needed to reach this cap
    // eventually without the suite ever writing to the table directly.
    const { error } = await memberB.rpc("grant_grace_token", { p_source: "test" });
    expect(error).toBeNull();

    const ownCount = await unconsumedCount(memberB, FIXTURES.memberB.id);
    expect(ownCount).toBeLessThanOrEqual(3);
  });

  it("never grants twice in the same calendar day", async () => {
    const first = await memberA.rpc("grant_grace_token", { p_source: "test" });
    const second = await memberA.rpc("grant_grace_token", { p_source: "test" });
    expect(first.error).toBeNull();
    expect(second.error).toBeNull();
    // Whatever the first call's outcome (depends on whether a prior test
    // run already granted today), the two calls can never both be true.
    expect(first.data === true && second.data === true).toBe(false);
  });
});

describe("consume_grace_token window validation", () => {
  it("rejects recovering today (not yet a missed day)", async () => {
    const { error } = await memberB.rpc("consume_grace_token", {
      p_date: daysAgo(0),
    });
    expect(error).toBeTruthy();
    expect(error!.message).toMatch(/only past days/i);
  });

  it("rejects recovering a date outside the 3-day window", async () => {
    const { error } = await memberB.rpc("consume_grace_token", {
      p_date: daysAgo(4),
    });
    expect(error).toBeTruthy();
    expect(error!.message).toMatch(/outside the recovery window/i);
  });

  it("never allows the same date to be recovered twice", async () => {
    const target = daysAgo(2);
    const first = await memberB.rpc("consume_grace_token", { p_date: target });
    // Either this run performed the recovery (true, no error) or a past run
    // already did (an "already recovered" error) — both are valid given
    // this table's state persists across runs. What must never happen is
    // success twice.
    if (first.error) {
      expect(first.error.message).toMatch(/already recovered|no grace tokens available/i);
    } else {
      expect(first.data).toBe(true);
    }

    const second = await memberB.rpc("consume_grace_token", { p_date: target });
    expect(second.error).toBeTruthy();
    expect(second.error!.message).toMatch(/already recovered/i);
  });
});
