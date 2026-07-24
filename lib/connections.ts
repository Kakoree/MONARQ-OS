import { createClient } from "@/lib/supabase/server";

export type ConnectionState =
  | "none"
  | "outgoing_pending"
  | "incoming_pending"
  | "connected";

export async function getConnectionState(otherUserId: string): Promise<{
  state: ConnectionState;
  connectionId: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id === otherUserId) {
    return { state: "none", connectionId: null };
  }

  const { data } = await supabase
    .from("connections")
    .select("id, requester_id, status")
    .or(
      `and(requester_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(requester_id.eq.${otherUserId},recipient_id.eq.${user.id})`
    )
    .in("status", ["pending", "accepted"])
    .maybeSingle();

  if (!data) return { state: "none", connectionId: null };

  if (data.status === "accepted") {
    return { state: "connected", connectionId: data.id };
  }

  return {
    state: data.requester_id === user.id ? "outgoing_pending" : "incoming_pending",
    connectionId: data.id,
  };
}

export type ConnectionMember = {
  connectionId: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
};

export type CircleData = {
  incoming: ConnectionMember[];
  connections: ConnectionMember[];
};

export async function getCircle(): Promise<CircleData | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: rows } = await supabase
    .from("connections")
    .select("id, requester_id, recipient_id, status")
    .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .in("status", ["pending", "accepted"]);

  const otherIds = Array.from(
    new Set(
      (rows ?? []).map((r) =>
        r.requester_id === user.id ? r.recipient_id : r.requester_id
      )
    )
  );

  const { data: profiles } = otherIds.length
    ? await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in("id", otherIds)
    : { data: [] as { id: string; display_name: string | null; avatar_url: string | null }[] };

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  const incoming: ConnectionMember[] = [];
  const connections: ConnectionMember[] = [];

  for (const r of rows ?? []) {
    const otherId = r.requester_id === user.id ? r.recipient_id : r.requester_id;
    const profile = profileById.get(otherId);
    const member: ConnectionMember = {
      connectionId: r.id,
      userId: otherId,
      displayName: profile?.display_name ?? "Member",
      avatarUrl: profile?.avatar_url ?? null,
    };

    if (r.status === "accepted") {
      connections.push(member);
    } else if (r.status === "pending" && r.recipient_id === user.id) {
      incoming.push(member);
    }
    // Outgoing pending requests aren't surfaced separately — the recipient
    // sees them as "incoming"; the requester just sees the button state
    // change on the member's profile (getConnectionState), no separate list.
  }

  return { incoming, connections };
}

export type ConnectionActionResult = { error: string } | { error: undefined };

export async function requestConnection(recipientId: string): Promise<ConnectionActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("request_connection", {
    p_recipient_id: recipientId,
  });

  if (error) {
    if (error.message.includes("already exists")) {
      return { error: "You already have a connection with that member." };
    }
    return { error: "Could not send that request. Try again." };
  }

  return { error: undefined };
}

export async function respondConnection(
  connectionId: string,
  accept: boolean
): Promise<ConnectionActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("respond_connection", {
    p_connection_id: connectionId,
    p_accept: accept,
  });

  if (error) {
    return { error: "Could not respond to that request. Try again." };
  }

  return { error: undefined };
}
