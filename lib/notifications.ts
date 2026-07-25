import { createClient } from "@/lib/supabase/server";

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  actionUrl: string | null;
  readAt: string | null;
  createdAt: string;
};

// Called from other server-side actions (e.g. a reaction or comment being
// created) to notify a different member. Routed through the
// create_notification() RPC — see 0026_notifications.sql for why this isn't
// a direct table insert (no insert policy exists for `authenticated` at
// all, by design).
export async function createNotification(params: {
  userId: string;
  type: string;
  title: string;
  body?: string;
  actionUrl?: string;
}): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("create_notification", {
    p_user_id: params.userId,
    p_type: params.type,
    p_title: params.title,
    p_body: params.body,
    p_action_url: params.actionUrl,
  });

  if (error) {
    console.error("[notifications] create failed:", error.message);
  }
}

// Home-load-triggered nudge (no cron infra exists yet — see the at-risk
// detection design note in habits.ts). Guarded so a member only ever gets
// one "streak at risk" notification per calendar day, however many times
// they load Home before checking in.
export async function notifyStreakAtRiskOnce(userId: string): Promise<void> {
  const supabase = await createClient();
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("type", "streak_at_risk")
    .gte("created_at", todayStart.toISOString());

  if (count && count > 0) return;

  await createNotification({
    userId,
    type: "streak_at_risk",
    title: "Your streak is on the line",
    body: "You haven't checked in today — keep it going before the day ends.",
    actionUrl: "/home",
  });
}

export async function getNotifications(limit = 20): Promise<NotificationItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("id, type, title, body, action_url, read_at, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    actionUrl: n.action_url,
    readAt: n.read_at,
    createdAt: n.created_at,
  }));
}

export async function getUnreadNotificationCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .is("read_at", null);

  return count ?? 0;
}

export async function markNotificationRead(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .is("read_at", null);
}

export async function markAllNotificationsRead(): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .is("read_at", null);
}
