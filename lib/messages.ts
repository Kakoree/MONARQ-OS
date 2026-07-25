import { createClient } from "@/lib/supabase/server";

export type Message = {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  body: string;
  createdAt: string;
  isOwn: boolean;
};

type ProfileRow = { id: string; display_name: string | null; avatar_url: string | null };

async function profilesById(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userIds: string[]
): Promise<Map<string, ProfileRow>> {
  if (userIds.length === 0) return new Map();
  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .in("id", userIds);
  return new Map((data ?? []).map((p) => [p.id, p]));
}

// Oldest-first for reading; the query pulls newest-first so the limit takes
// the most recent N, then it's reversed for display.
export async function getPodMessages(podId: string, limit = 100): Promise<Message[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: rows } = await supabase
    .from("pod_messages")
    .select("id, user_id, body, created_at")
    .eq("pod_id", podId)
    .order("created_at", { ascending: false })
    .limit(limit);

  const messages = (rows ?? []).slice().reverse();
  const byId = await profilesById(
    supabase,
    Array.from(new Set(messages.map((m) => m.user_id)))
  );

  return messages.map((m) => {
    const profile = byId.get(m.user_id);
    return {
      id: m.id,
      userId: m.user_id,
      displayName: profile?.display_name ?? "Member",
      avatarUrl: profile?.avatar_url ?? null,
      body: m.body,
      createdAt: m.created_at,
      isOwn: m.user_id === user.id,
    };
  });
}

export type MessageActionResult = { error: string } | { error: undefined };

export async function postPodMessage(
  podId: string,
  body: string
): Promise<MessageActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You need to be signed in." };

  const trimmed = body.trim();
  if (!trimmed) return { error: "Write something first." };
  if (trimmed.length > 2000) return { error: "Keep messages under 2000 characters." };

  const { error } = await supabase
    .from("pod_messages")
    .insert({ pod_id: podId, user_id: user.id, body: trimmed });

  if (error) return { error: "Could not post that. Try again." };
  return { error: undefined };
}

export async function deletePodMessage(messageId: string): Promise<MessageActionResult> {
  const supabase = await createClient();
  // RLS restricts deletes to the author, so someone else's message is a
  // silent no-op rather than an error.
  const { error } = await supabase.from("pod_messages").delete().eq("id", messageId);

  if (error) return { error: "Could not delete that message." };
  return { error: undefined };
}

export type DirectThread = {
  otherUserId: string;
  displayName: string;
  avatarUrl: string | null;
  messages: Message[];
};

// Returns null when the two members aren't connected — the page turns that
// into a 404 rather than showing an empty thread you could never post to.
export async function getDirectThread(otherUserId: string): Promise<DirectThread | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id === otherUserId) return null;

  const { data: connection } = await supabase
    .from("connections")
    .select("id")
    .eq("status", "accepted")
    .or(
      `and(requester_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(requester_id.eq.${otherUserId},recipient_id.eq.${user.id})`
    )
    .maybeSingle();

  if (!connection) return null;

  const { data: rows } = await supabase
    .from("direct_messages")
    .select("id, sender_id, body, created_at")
    .or(
      `and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`
    )
    .order("created_at", { ascending: true })
    .limit(200);

  const byId = await profilesById(supabase, [user.id, otherUserId]);
  const other = byId.get(otherUserId);

  return {
    otherUserId,
    displayName: other?.display_name ?? "Member",
    avatarUrl: other?.avatar_url ?? null,
    messages: (rows ?? []).map((m) => {
      const profile = byId.get(m.sender_id);
      return {
        id: m.id,
        userId: m.sender_id,
        displayName: profile?.display_name ?? "Member",
        avatarUrl: profile?.avatar_url ?? null,
        body: m.body,
        createdAt: m.created_at,
        isOwn: m.sender_id === user.id,
      };
    }),
  };
}

export async function sendDirectMessage(
  recipientId: string,
  body: string
): Promise<MessageActionResult> {
  const trimmed = body.trim();
  if (!trimmed) return { error: "Write something first." };
  if (trimmed.length > 2000) return { error: "Keep messages under 2000 characters." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("send_direct_message", {
    p_recipient_id: recipientId,
    p_body: trimmed,
  });

  if (error) {
    if (error.message.includes("connected member")) {
      return { error: "You can only message members you're connected with." };
    }
    return { error: "Could not send that message. Try again." };
  }

  return { error: undefined };
}
