import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { FIXTURES, signInAs } from "../setup/clients";
import type { Database } from "../../lib/supabase/types";

let memberA: SupabaseClient<Database>; // in the pod
let memberB: SupabaseClient<Database>; // in the pod
let outsider: SupabaseClient<Database>; // mentorA, deliberately not in the pod
let admin: SupabaseClient<Database>;

let podId: string;

beforeAll(async () => {
  memberA = await signInAs(FIXTURES.memberA.email, FIXTURES.memberA.password);
  memberB = await signInAs(FIXTURES.memberB.email, FIXTURES.memberB.password);
  outsider = await signInAs(FIXTURES.mentorA.email, FIXTURES.mentorA.password);
  admin = await signInAs(FIXTURES.adminA.email, FIXTURES.adminA.password);

  const { data, error } = await admin
    .from("pods")
    .insert({ name: "RLS test pod" })
    .select("id")
    .single();
  if (error) throw new Error(`pod fixture setup failed: ${error.message}`);
  podId = data.id;

  const { error: memberError } = await admin.from("pod_members").insert([
    { pod_id: podId, user_id: FIXTURES.memberA.id },
    { pod_id: podId, user_id: FIXTURES.memberB.id },
  ]);
  if (memberError) throw new Error(`pod member setup failed: ${memberError.message}`);
});

afterAll(async () => {
  // pod_members cascades from pods.
  if (podId) await admin.from("pods").delete().eq("id", podId);
});

describe("pods SELECT policy", () => {
  it("lets a pod member see the pod", async () => {
    const { data } = await memberA.from("pods").select("id").eq("id", podId);
    expect(data).toHaveLength(1);
  });

  it("hides the pod from a member who isn't in it", async () => {
    const { data } = await outsider.from("pods").select("id").eq("id", podId);
    expect(data).toHaveLength(0);
  });

  it("lets the pod's other member see it too", async () => {
    const { data } = await memberB.from("pods").select("id").eq("id", podId);
    expect(data).toHaveLength(1);
  });

  it("lets admin see the pod despite not being a member of it", async () => {
    const { data } = await admin.from("pods").select("id").eq("id", podId);
    expect(data).toHaveLength(1);
  });
});

describe("pod_members SELECT policy", () => {
  // The policy calls is_pod_member(), a security-definer function, precisely
  // so this read doesn't recurse into its own policy (42P17). If that ever
  // regresses these reads fail outright rather than returning wrong rows.
  it("lets a pod member see the full roster, not just their own row", async () => {
    const { data, error } = await memberA
      .from("pod_members")
      .select("user_id")
      .eq("pod_id", podId);
    expect(error).toBeNull();
    expect(data).toHaveLength(2);
  });

  it("hides the roster from a member who isn't in the pod", async () => {
    const { data } = await outsider
      .from("pod_members")
      .select("user_id")
      .eq("pod_id", podId);
    expect(data).toHaveLength(0);
  });
});

describe("pods/pod_members write policies", () => {
  it("refuses to let a non-admin member create a pod", async () => {
    const { error } = await memberA.from("pods").insert({ name: "member-made pod" });
    expect(error).toBeTruthy();
  });

  it("refuses to let a pod member add someone to their own pod", async () => {
    const { error } = await memberA
      .from("pod_members")
      .insert({ pod_id: podId, user_id: FIXTURES.mentorA.id });
    expect(error).toBeTruthy();
  });

  it("refuses to let a pod member remove a pod-mate", async () => {
    await memberA
      .from("pod_members")
      .delete()
      .eq("pod_id", podId)
      .eq("user_id", FIXTURES.memberB.id);

    // Delete is silently a no-op under RLS rather than an error, so assert on
    // the roster still being intact.
    const { data } = await admin.from("pod_members").select("user_id").eq("pod_id", podId);
    expect(data).toHaveLength(2);
  });

  it("refuses to let a pod member rename the pod", async () => {
    await memberA.from("pods").update({ name: "renamed by member" }).eq("id", podId);

    const { data } = await admin.from("pods").select("name").eq("id", podId).single();
    expect(data?.name).toBe("RLS test pod");
  });
});

describe("get_pod_accountability", () => {
  // This function is the only path through which one member can see another
  // member's habit activity anywhere in this codebase — habits,
  // habit_check_ins and habit_grace_tokens are all own-only (0005, 0028).
  // Its authorization check is therefore the entire boundary protecting that
  // data, which is what these two tests exist to hold in place.
  it("rejects a caller who isn't in the pod", async () => {
    const { error } = await outsider.rpc("get_pod_accountability", {
      p_pod_id: podId,
    });
    expect(error).toBeTruthy();
    expect(error!.message).toMatch(/not authorized/i);
  });

  it("returns a row per pod member for a caller who is in the pod", async () => {
    const { data, error } = await memberA.rpc("get_pod_accountability", {
      p_pod_id: podId,
    });
    expect(error).toBeNull();
    expect(data).toHaveLength(2);

    const memberIds = (data ?? []).map((r) => r.member_id).sort();
    expect(memberIds).toEqual([FIXTURES.memberA.id, FIXTURES.memberB.id].sort());
  });

  it("never exposes habit names, only counts and activity dates", async () => {
    const { data } = await memberA.rpc("get_pod_accountability", { p_pod_id: podId });
    const row = (data ?? [])[0];
    expect(Object.keys(row ?? {}).sort()).toEqual([
      "active_habit_count",
      "activity_dates",
      "checked_in_today",
      "member_id",
    ]);
  });

  it("lets admin read a pod they aren't a member of", async () => {
    const { error } = await admin.rpc("get_pod_accountability", { p_pod_id: podId });
    expect(error).toBeNull();
  });
});
