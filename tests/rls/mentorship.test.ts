import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { FIXTURES, signInAs } from "../setup/clients";
import type { Database } from "../../lib/supabase/types";

let memberA: SupabaseClient<Database>;
let memberB: SupabaseClient<Database>;
let mentor: SupabaseClient<Database>;
let admin: SupabaseClient<Database>;

let mentorRowId: string;
let requestId: string;

beforeAll(async () => {
  memberA = await signInAs(FIXTURES.memberA.email, FIXTURES.memberA.password);
  memberB = await signInAs(FIXTURES.memberB.email, FIXTURES.memberB.password);
  mentor = await signInAs(FIXTURES.mentorA.email, FIXTURES.mentorA.password);
  admin = await signInAs(FIXTURES.adminA.email, FIXTURES.adminA.password);

  const { data, error } = await memberA
    .from("mentors")
    .select("id")
    .eq("user_id", FIXTURES.mentorA.id)
    .single();
  if (error || !data) throw new Error("test-mentor fixture row not found — check provisioning");
  mentorRowId = data.id;
});

afterAll(async () => {
  if (requestId) {
    await admin.from("mentorship_requests").delete().eq("id", requestId);
  }
});

it("lets member A request mentorship", async () => {
  const { data, error } = await memberA
    .from("mentorship_requests")
    .insert({ mentor_id: mentorRowId, member_id: FIXTURES.memberA.id, message: "test request" })
    .select("id")
    .single();

  expect(error).toBeNull();
  requestId = data!.id;
});

describe("mentorship_requests SELECT policy", () => {
  it("hides the request from an unrelated member", async () => {
    const { data } = await memberB.from("mentorship_requests").select("id").eq("id", requestId);
    expect(data).toHaveLength(0);
  });

  it("lets the mentor see the request directed at them", async () => {
    const { data } = await mentor.from("mentorship_requests").select("id").eq("id", requestId);
    expect(data).toHaveLength(1);
  });
});

describe("confirm_mentorship_request auth check", () => {
  it("rejects confirmation from the requesting member themselves", async () => {
    const { error } = await memberA.rpc("confirm_mentorship_request", {
      p_request_id: requestId,
      p_scheduled_at: new Date(Date.now() + 86_400_000).toISOString(),
      p_join_url: "https://example.com/session",
    });
    expect(error).toBeTruthy();
    expect(error!.message).toMatch(/not authorized/i);
  });

  it("rejects confirmation from an unrelated member", async () => {
    const { error } = await memberB.rpc("confirm_mentorship_request", {
      p_request_id: requestId,
      p_scheduled_at: new Date(Date.now() + 86_400_000).toISOString(),
      p_join_url: "https://example.com/session",
    });
    expect(error).toBeTruthy();
    expect(error!.message).toMatch(/not authorized/i);
  });

  it("rejects a scheduled time in the past", async () => {
    const { error } = await mentor.rpc("confirm_mentorship_request", {
      p_request_id: requestId,
      p_scheduled_at: new Date(Date.now() - 86_400_000).toISOString(),
      p_join_url: "https://example.com/session",
    });
    expect(error).toBeTruthy();
    expect(error!.message).toMatch(/future/i);
  });

  it("lets the mentor confirm with a valid future time", async () => {
    const { error } = await mentor.rpc("confirm_mentorship_request", {
      p_request_id: requestId,
      p_scheduled_at: new Date(Date.now() + 86_400_000).toISOString(),
      p_join_url: "https://example.com/session",
    });
    expect(error).toBeNull();

    const { data } = await memberA
      .from("mentorship_requests")
      .select("status")
      .eq("id", requestId)
      .single();
    expect(data?.status).toBe("confirmed");
  });
});

describe("complete_mentorship_request", () => {
  it("rejects completion from a non-mentor, non-admin caller", async () => {
    const { error } = await memberA.rpc("complete_mentorship_request", {
      p_request_id: requestId,
    });
    expect(error).toBeTruthy();
    expect(error!.message).toMatch(/not authorized/i);
  });

  it("lets the mentor mark it completed", async () => {
    const { error } = await mentor.rpc("complete_mentorship_request", {
      p_request_id: requestId,
    });
    expect(error).toBeNull();

    const { data } = await memberA
      .from("mentorship_requests")
      .select("status")
      .eq("id", requestId)
      .single();
    expect(data?.status).toBe("completed");
  });

  it("rejects completing an already-completed request", async () => {
    const { error } = await mentor.rpc("complete_mentorship_request", {
      p_request_id: requestId,
    });
    expect(error).toBeTruthy();
    expect(error!.message).toMatch(/only a confirmed session/i);
  });
});
