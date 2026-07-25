import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { FIXTURES, signInAs } from "../setup/clients";
import type { Database } from "../../lib/supabase/types";

let memberA: SupabaseClient<Database>;
let memberB: SupabaseClient<Database>;
let admin: SupabaseClient<Database>;

let reportId: string;

beforeAll(async () => {
  memberA = await signInAs(FIXTURES.memberA.email, FIXTURES.memberA.password);
  memberB = await signInAs(FIXTURES.memberB.email, FIXTURES.memberB.password);
  admin = await signInAs(FIXTURES.adminA.email, FIXTURES.adminA.password);
});

afterAll(async () => {
  if (reportId) {
    await admin.from("reports").delete().eq("id", reportId);
  }
});

it("rejects reporting yourself (DB constraint)", async () => {
  const { error } = await memberA.from("reports").insert({
    reporter_id: FIXTURES.memberA.id,
    reported_user_id: FIXTURES.memberA.id,
    reason: "test",
  });
  expect(error).toBeTruthy();
});

it("lets member A report member B", async () => {
  const { data, error } = await memberA
    .from("reports")
    .insert({
      reporter_id: FIXTURES.memberA.id,
      reported_user_id: FIXTURES.memberB.id,
      reason: "automated test report",
    })
    .select("id")
    .single();

  expect(error).toBeNull();
  expect(data?.id).toBeTruthy();
  reportId = data!.id;
});

it("rejects an insert where reporter_id doesn't match the caller", async () => {
  const { error } = await memberA.from("reports").insert({
    reporter_id: FIXTURES.memberB.id, // spoofing another user as the reporter
    reported_user_id: FIXTURES.memberA.id,
    reason: "spoof attempt",
  });
  expect(error).toBeTruthy();
});

describe("reports SELECT policy — the privacy-sensitive case", () => {
  it("hides the report from the person it's about", async () => {
    const { data } = await memberB.from("reports").select("id").eq("id", reportId);
    expect(data).toHaveLength(0);
  });

  it("lets the reporter see their own report", async () => {
    const { data } = await memberA.from("reports").select("id").eq("id", reportId);
    expect(data).toHaveLength(1);
  });

  it("lets admin see and resolve the report", async () => {
    const { data: before } = await admin.from("reports").select("id").eq("id", reportId);
    expect(before).toHaveLength(1);

    const { error } = await admin
      .from("reports")
      .update({ status: "resolved", resolved_by: FIXTURES.adminA.id })
      .eq("id", reportId);
    expect(error).toBeNull();
  });
});
