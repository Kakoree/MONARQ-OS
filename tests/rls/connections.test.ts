import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { FIXTURES, signInAs } from "../setup/clients";
import { clearNotificationsFor } from "../setup/admin";
import type { Database } from "../../lib/supabase/types";

let memberA: SupabaseClient<Database>;
let memberB: SupabaseClient<Database>;
let outsider: SupabaseClient<Database>; // mentorA, standing in for "not a party to this connection"
let admin: SupabaseClient<Database>;

let connectionId: string;

beforeAll(async () => {
  memberA = await signInAs(FIXTURES.memberA.email, FIXTURES.memberA.password);
  memberB = await signInAs(FIXTURES.memberB.email, FIXTURES.memberB.password);
  outsider = await signInAs(FIXTURES.mentorA.email, FIXTURES.mentorA.password);
  admin = await signInAs(FIXTURES.adminA.email, FIXTURES.adminA.password);
});

afterAll(async () => {
  // Best-effort cleanup via admin (admin_all RLS policy covers delete).
  if (connectionId) {
    await admin.from("connections").delete().eq("id", connectionId);
  }

  // request_connection / respond_connection both notify, and notifications
  // has no delete policy for anyone (0026).
  await clearNotificationsFor([
    FIXTURES.memberA.id,
    FIXTURES.memberB.id,
    FIXTURES.mentorA.id,
    FIXTURES.adminA.id,
  ]);
});

describe("request_connection", () => {
  it("rejects connecting to yourself", async () => {
    const { error } = await memberA.rpc("request_connection", {
      p_recipient_id: FIXTURES.memberA.id,
    });
    expect(error).toBeTruthy();
    expect(error!.message).toMatch(/cannot connect with yourself/i);
  });

  it("lets member A request a connection with member B", async () => {
    const { data, error } = await memberA.rpc("request_connection", {
      p_recipient_id: FIXTURES.memberB.id,
    });
    expect(error).toBeNull();
    expect(data).toBeTruthy();
    connectionId = data as string;
  });

  it("rejects a duplicate request while one is already pending", async () => {
    const { error } = await memberA.rpc("request_connection", {
      p_recipient_id: FIXTURES.memberB.id,
    });
    expect(error).toBeTruthy();
    expect(error!.message).toMatch(/already exists/i);
  });
});

describe("connections SELECT policy", () => {
  it("lets the requester see the connection", async () => {
    const { data } = await memberA.from("connections").select("id").eq("id", connectionId);
    expect(data).toHaveLength(1);
  });

  it("lets the recipient see the connection", async () => {
    const { data } = await memberB.from("connections").select("id").eq("id", connectionId);
    expect(data).toHaveLength(1);
  });

  it("hides the connection from a member who isn't a party to it", async () => {
    const { data } = await outsider.from("connections").select("id").eq("id", connectionId);
    expect(data).toHaveLength(0);
  });

  it("lets admin see the connection despite not being a party", async () => {
    const { data } = await admin.from("connections").select("id").eq("id", connectionId);
    expect(data).toHaveLength(1);
  });
});

describe("respond_connection", () => {
  it("rejects a response from someone other than the recipient", async () => {
    const { error } = await outsider.rpc("respond_connection", {
      p_connection_id: connectionId,
      p_accept: true,
    });
    expect(error).toBeTruthy();
    expect(error!.message).toMatch(/not authorized/i);
  });

  it("rejects a response from the requester themselves", async () => {
    const { error } = await memberA.rpc("respond_connection", {
      p_connection_id: connectionId,
      p_accept: true,
    });
    expect(error).toBeTruthy();
    expect(error!.message).toMatch(/not authorized/i);
  });

  it("lets the recipient accept", async () => {
    const { error } = await memberB.rpc("respond_connection", {
      p_connection_id: connectionId,
      p_accept: true,
    });
    expect(error).toBeNull();

    const { data } = await memberA.from("connections").select("status").eq("id", connectionId).single();
    expect(data?.status).toBe("accepted");
  });

  it("rejects responding to an already-resolved connection", async () => {
    const { error } = await memberB.rpc("respond_connection", {
      p_connection_id: connectionId,
      p_accept: false,
    });
    expect(error).toBeTruthy();
    expect(error!.message).toMatch(/already resolved/i);
  });
});
