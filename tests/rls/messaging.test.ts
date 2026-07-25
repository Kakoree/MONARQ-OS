import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { FIXTURES, signInAs } from "../setup/clients";
import type { Database } from "../../lib/supabase/types";

let memberA: SupabaseClient<Database>;
let memberB: SupabaseClient<Database>;
let outsider: SupabaseClient<Database>; // mentorA — in no pod, connected to nobody
let admin: SupabaseClient<Database>;

let podId: string;
let connectionId: string;
const createdMessageIds: string[] = [];

beforeAll(async () => {
  memberA = await signInAs(FIXTURES.memberA.email, FIXTURES.memberA.password);
  memberB = await signInAs(FIXTURES.memberB.email, FIXTURES.memberB.password);
  outsider = await signInAs(FIXTURES.mentorA.email, FIXTURES.mentorA.password);
  admin = await signInAs(FIXTURES.adminA.email, FIXTURES.adminA.password);

  const { data: pod, error: podError } = await admin
    .from("pods")
    .insert({ name: "Messaging test pod" })
    .select("id")
    .single();
  if (podError) throw new Error(`pod setup failed: ${podError.message}`);
  podId = pod.id;

  const { error: memberError } = await admin.from("pod_members").insert([
    { pod_id: podId, user_id: FIXTURES.memberA.id },
    { pod_id: podId, user_id: FIXTURES.memberB.id },
  ]);
  if (memberError) throw new Error(`pod member setup failed: ${memberError.message}`);

  // A and B need an accepted connection for the DM half.
  const { data: connection, error: connError } = await admin
    .from("connections")
    .insert({
      requester_id: FIXTURES.memberA.id,
      recipient_id: FIXTURES.memberB.id,
      status: "accepted",
    })
    .select("id")
    .single();
  if (connError) throw new Error(`connection setup failed: ${connError.message}`);
  connectionId = connection.id;
});

afterAll(async () => {
  if (podId) await admin.from("pods").delete().eq("id", podId); // cascades messages
  for (const id of createdMessageIds) {
    await memberA.from("direct_messages").delete().eq("id", id);
    await memberB.from("direct_messages").delete().eq("id", id);
  }
  if (connectionId) await admin.from("connections").delete().eq("id", connectionId);
});

describe("pod_messages", () => {
  let messageId: string;

  it("lets a pod member post to their pod", async () => {
    const { data, error } = await memberA
      .from("pod_messages")
      .insert({ pod_id: podId, user_id: FIXTURES.memberA.id, body: "hello pod" })
      .select("id")
      .single();
    expect(error).toBeNull();
    messageId = data!.id;
  });

  it("lets another pod member read it", async () => {
    const { data } = await memberB.from("pod_messages").select("id").eq("pod_id", podId);
    expect(data).toHaveLength(1);
  });

  it("hides pod messages from someone not in the pod", async () => {
    const { data } = await outsider
      .from("pod_messages")
      .select("id")
      .eq("pod_id", podId);
    expect(data).toHaveLength(0);
  });

  it("refuses to let a non-member post into the pod", async () => {
    const { error } = await outsider
      .from("pod_messages")
      .insert({ pod_id: podId, user_id: FIXTURES.mentorA.id, body: "intruding" });
    expect(error).toBeTruthy();
  });

  it("refuses to let a member post under someone else's name", async () => {
    const { error } = await memberB
      .from("pod_messages")
      .insert({ pod_id: podId, user_id: FIXTURES.memberA.id, body: "impersonation" });
    expect(error).toBeTruthy();
  });

  it("refuses to let a pod-mate delete someone else's message", async () => {
    await memberB.from("pod_messages").delete().eq("id", messageId);

    const { data } = await admin.from("pod_messages").select("id").eq("id", messageId);
    expect(data).toHaveLength(1);
  });

  it("lets the author delete their own message", async () => {
    const { error } = await memberA.from("pod_messages").delete().eq("id", messageId);
    expect(error).toBeNull();

    const { data } = await admin.from("pod_messages").select("id").eq("id", messageId);
    expect(data).toHaveLength(0);
  });
});

describe("send_direct_message", () => {
  it("sends between two connected members", async () => {
    const { data, error } = await memberA.rpc("send_direct_message", {
      p_recipient_id: FIXTURES.memberB.id,
      p_body: "hello from A",
    });
    expect(error).toBeNull();
    createdMessageIds.push(data as string);
  });

  it("refuses to message a member you aren't connected to", async () => {
    const { error } = await memberA.rpc("send_direct_message", {
      p_recipient_id: FIXTURES.mentorA.id,
      p_body: "we have never connected",
    });
    expect(error).toBeTruthy();
    expect(error!.message).toMatch(/only message a connected member/i);
  });

  it("refuses to message yourself", async () => {
    const { error } = await memberA.rpc("send_direct_message", {
      p_recipient_id: FIXTURES.memberA.id,
      p_body: "talking to myself",
    });
    expect(error).toBeTruthy();
    expect(error!.message).toMatch(/cannot message yourself/i);
  });

  it("refuses an empty message", async () => {
    const { error } = await memberA.rpc("send_direct_message", {
      p_recipient_id: FIXTURES.memberB.id,
      p_body: "   ",
    });
    expect(error).toBeTruthy();
    expect(error!.message).toMatch(/cannot be empty/i);
  });

  it("notifies the recipient", async () => {
    const { data } = await memberB
      .from("notifications")
      .select("id, type")
      .eq("type", "direct_message");
    expect((data ?? []).length).toBeGreaterThan(0);
  });
});

describe("direct_messages privacy", () => {
  it("lets both parties read the conversation", async () => {
    const { data: asSender } = await memberA
      .from("direct_messages")
      .select("id")
      .in("id", createdMessageIds);
    expect(asSender).toHaveLength(createdMessageIds.length);

    const { data: asRecipient } = await memberB
      .from("direct_messages")
      .select("id")
      .in("id", createdMessageIds);
    expect(asRecipient).toHaveLength(createdMessageIds.length);
  });

  it("hides the conversation from an uninvolved member", async () => {
    const { data } = await outsider
      .from("direct_messages")
      .select("id")
      .in("id", createdMessageIds);
    expect(data).toHaveLength(0);
  });

  // direct_messages is the one table in this schema with no admin policy,
  // deliberately — an admin should not have a window into private
  // conversations. If someone ever adds an admin_all policy here, this
  // fails and forces the decision to be made on purpose.
  it("hides the conversation from an admin too", async () => {
    const { data } = await admin
      .from("direct_messages")
      .select("id")
      .in("id", createdMessageIds);
    expect(data).toHaveLength(0);
  });

  it("refuses to let the recipient delete the sender's message", async () => {
    await memberB.from("direct_messages").delete().in("id", createdMessageIds);

    const { data } = await memberA
      .from("direct_messages")
      .select("id")
      .in("id", createdMessageIds);
    expect(data).toHaveLength(createdMessageIds.length);
  });

  it("refuses a direct insert that bypasses the connection check", async () => {
    const { error } = await memberA.from("direct_messages").insert({
      sender_id: FIXTURES.memberA.id,
      recipient_id: FIXTURES.mentorA.id,
      body: "bypassing send_direct_message",
    });
    expect(error).toBeTruthy();
  });
});
