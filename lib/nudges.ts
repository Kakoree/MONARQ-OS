import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { computeStreak, todayDateString } from "@/lib/habits";

type ServiceClient = SupabaseClient<Database>;

// Batched version of getDailyOS()'s atRisk check (lib/habits.ts) across
// every active member at once, for the cron scan — that function is scoped
// to the current signed-in user via cookies, which doesn't exist here.
export async function getAtRiskMemberIds(service: ServiceClient): Promise<string[]> {
  const today = todayDateString();

  const [membershipsRes, habitsRes, checkInsRes, graceTokensRes] = await Promise.all([
    service.from("memberships").select("user_id").eq("status", "active"),
    service.from("habits").select("id, user_id").eq("is_active", true),
    service.from("habit_check_ins").select("user_id, habit_id, completed_on"),
    service.from("habit_grace_tokens").select("user_id, consumed_at, consumed_for_date"),
  ]);

  // Surfaced loudly rather than defaulted to `[]` on error — this runs
  // unattended on a schedule, so a query failure (e.g. a permissions
  // regression) must fail the run, not silently report scanned:0.
  for (const res of [membershipsRes, habitsRes, checkInsRes, graceTokensRes]) {
    if (res.error) throw new Error(`getAtRiskMemberIds query failed: ${res.error.message}`);
  }

  const memberships = membershipsRes.data;
  const habits = habitsRes.data;
  const checkIns = checkInsRes.data;
  const graceTokens = graceTokensRes.data;

  const activeHabitCountByUser = new Map<string, number>();
  for (const h of habits ?? []) {
    activeHabitCountByUser.set(h.user_id, (activeHabitCountByUser.get(h.user_id) ?? 0) + 1);
  }

  const checkInDatesByUser = new Map<string, Set<string>>();
  const todaysCompletedByUser = new Map<string, Set<string>>();
  for (const c of checkIns ?? []) {
    const dates = checkInDatesByUser.get(c.user_id) ?? new Set<string>();
    dates.add(c.completed_on);
    checkInDatesByUser.set(c.user_id, dates);

    if (c.completed_on === today) {
      const habitIds = todaysCompletedByUser.get(c.user_id) ?? new Set<string>();
      habitIds.add(c.habit_id);
      todaysCompletedByUser.set(c.user_id, habitIds);
    }
  }

  const recoveredDatesByUser = new Map<string, Set<string>>();
  for (const t of graceTokens ?? []) {
    if (!t.consumed_at || !t.consumed_for_date) continue;
    const dates = recoveredDatesByUser.get(t.user_id) ?? new Set<string>();
    dates.add(t.consumed_for_date);
    recoveredDatesByUser.set(t.user_id, dates);
  }

  const atRiskIds: string[] = [];
  for (const m of memberships ?? []) {
    const activeHabitCount = activeHabitCountByUser.get(m.user_id) ?? 0;
    if (activeHabitCount === 0) continue;

    const completedToday = todaysCompletedByUser.get(m.user_id)?.size ?? 0;
    if (completedToday > 0) continue;

    const streakDates = new Set([
      ...(checkInDatesByUser.get(m.user_id) ?? []),
      ...(recoveredDatesByUser.get(m.user_id) ?? []),
    ]);
    const streak = computeStreak(streakDates, today);
    if (streak > 0) atRiskIds.push(m.user_id);
  }

  return atRiskIds;
}

// Direct insert, not the create_notification() RPC (0026_notifications.sql)
// — that function requires auth.uid(), which a service-role client never
// has. Service-role bypasses RLS by design, so this needs no new migration.
// Reuses the exact type/title/body/action_url notifyStreakAtRiskOnce()
// (lib/notifications.ts) already uses for the home-triggered version of
// this same nudge, so the two can never double-notify on the same day —
// both are guarded by the same "one streak_at_risk row per user per day"
// check.
export async function notifyAtRiskMembers(
  service: ServiceClient
): Promise<{ scanned: number; notified: number }> {
  const atRiskIds = await getAtRiskMemberIds(service);
  if (atRiskIds.length === 0) return { scanned: 0, notified: 0 };

  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const { data: alreadyNotified, error: lookupError } = await service
    .from("notifications")
    .select("user_id")
    .eq("type", "streak_at_risk")
    .gte("created_at", todayStart.toISOString())
    .in("user_id", atRiskIds);

  // Must fail loudly, not fall through to "nobody was notified yet" — that
  // would risk double-notifying on a retry instead of just skipping a run.
  if (lookupError) {
    throw new Error(`notifyAtRiskMembers idempotency lookup failed: ${lookupError.message}`);
  }

  const alreadyNotifiedIds = new Set((alreadyNotified ?? []).map((n) => n.user_id));
  const toNotify = atRiskIds.filter((id) => !alreadyNotifiedIds.has(id));
  if (toNotify.length === 0) return { scanned: atRiskIds.length, notified: 0 };

  const { error } = await service.from("notifications").insert(
    toNotify.map((userId) => ({
      user_id: userId,
      type: "streak_at_risk",
      title: "Your streak is on the line",
      body: "You haven't checked in today — keep it going before the day ends.",
      action_url: "/home",
    }))
  );

  if (error) {
    throw new Error(`notifyAtRiskMembers insert failed: ${error.message}`);
  }

  return { scanned: atRiskIds.length, notified: toNotify.length };
}
