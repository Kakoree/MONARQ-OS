import { createClient } from "@/lib/supabase/server";
import type { AdminMemberRow } from "@/lib/admin";

export type XpTrendPoint = { date: string; amount: number };

// Real XP awarded per day over the trailing window, from the xp_events ledger.
export async function getXpTrend(days = 14): Promise<XpTrendPoint[]> {
  const supabase = await createClient();

  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - (days - 1));

  const { data: events } = await supabase
    .from("xp_events")
    .select("amount, created_at")
    .gte("created_at", start.toISOString());

  const amountByDate = new Map<string, number>();
  for (const e of events ?? []) {
    const date = e.created_at.slice(0, 10);
    amountByDate.set(date, (amountByDate.get(date) ?? 0) + e.amount);
  }

  const points: XpTrendPoint[] = [];
  const cursor = new Date(start);
  for (let i = 0; i < days; i++) {
    const dateStr = cursor.toISOString().slice(0, 10);
    points.push({ date: dateStr, amount: amountByDate.get(dateStr) ?? 0 });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return points;
}

export type WeeklySignups = { weekStart: string; count: number };

// Pure aggregation over already-fetched members (getAllMembers) — no extra
// query. Buckets by calendar week (Monday-start, UTC).
export function getMemberGrowthByWeek(
  members: Pick<AdminMemberRow, "createdAt">[],
  weeks = 8
): WeeklySignups[] {
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);
  const dayOfWeek = (now.getUTCDay() + 6) % 7; // 0 = Monday
  const currentWeekStart = new Date(now);
  currentWeekStart.setUTCDate(now.getUTCDate() - dayOfWeek);

  const buckets: { start: Date; end: Date }[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const start = new Date(currentWeekStart);
    start.setUTCDate(currentWeekStart.getUTCDate() - i * 7);
    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + 7);
    buckets.push({ start, end });
  }

  return buckets.map(({ start, end }) => ({
    weekStart: start.toISOString().slice(0, 10),
    count: members.filter((m) => {
      const created = new Date(m.createdAt);
      return created >= start && created < end;
    }).length,
  }));
}

export type MembershipBreakdown = {
  total: number;
  active: number;
  pending: number;
  suspended: number;
  revoked: number;
};

// Pure aggregation over already-fetched members — no extra query.
export function getMembershipBreakdown(
  members: Pick<AdminMemberRow, "status">[]
): MembershipBreakdown {
  const breakdown: MembershipBreakdown = {
    total: members.length,
    active: 0,
    pending: 0,
    suspended: 0,
    revoked: 0,
  };

  for (const m of members) {
    if (m.status === "active") breakdown.active += 1;
    else if (m.status === "pending") breakdown.pending += 1;
    else if (m.status === "suspended") breakdown.suspended += 1;
    else if (m.status === "revoked") breakdown.revoked += 1;
  }

  return breakdown;
}

// Distinct members with a habit check-in or an XP event in the trailing
// window — the closest honest read on "who's actually showing up" without
// a dedicated sessions/analytics table.
export async function getActiveMembersThisWeek(days = 7): Promise<number> {
  const supabase = await createClient();

  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  const startIso = start.toISOString();
  const startDate = startIso.slice(0, 10);

  const [{ data: checkIns }, { data: events }] = await Promise.all([
    supabase
      .from("habit_check_ins")
      .select("user_id")
      .gte("completed_on", startDate),
    supabase.from("xp_events").select("user_id").gte("created_at", startIso),
  ]);

  const activeIds = new Set<string>();
  for (const c of checkIns ?? []) activeIds.add(c.user_id);
  for (const e of events ?? []) activeIds.add(e.user_id);

  return activeIds.size;
}

export type ChallengeCompletionRate = { rate: number; completed: number; total: number };

// Real completion rate across all challenge participation to date —
// joined minus abandoned, not just "how many challenges exist."
export async function getChallengeCompletionRate(): Promise<ChallengeCompletionRate> {
  const supabase = await createClient();

  const { data: participation } = await supabase
    .from("challenge_participation")
    .select("completed_at");

  const total = participation?.length ?? 0;
  const completed = (participation ?? []).filter((p) => p.completed_at).length;

  return {
    rate: total > 0 ? Math.round((completed / total) * 100) : 0,
    completed,
    total,
  };
}

export type AuditLogPreviewEntry = {
  id: string;
  actorName: string;
  action: string;
  targetTable: string | null;
  createdAt: string;
};

// Compact real-data feed for the admin overview — same source as the full
// Audit Log page, just capped and re-shaped for a preview card.
export async function getRecentActivity(limit = 6): Promise<AuditLogPreviewEntry[]> {
  const supabase = await createClient();

  const { data: entries } = await supabase
    .from("audit_log")
    .select("id, actor_id, action, target_table, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  const actorIds = Array.from(
    new Set((entries ?? []).map((e) => e.actor_id).filter((id): id is string => !!id))
  );

  const { data: profiles } = actorIds.length
    ? await supabase.from("profiles").select("id, display_name").in("id", actorIds)
    : { data: [] as { id: string; display_name: string | null }[] };

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));

  return (entries ?? []).map((e) => ({
    id: e.id,
    actorName: (e.actor_id && nameById.get(e.actor_id)) || "System",
    action: e.action,
    targetTable: e.target_table,
    createdAt: e.created_at,
  }));
}

export type AccessCodeSummary = {
  activeCount: number;
  totalRedemptions: number;
  mostUsed: { code: string; usesCount: number; maxUses: number } | null;
};

// Pure aggregation over an already-fetched access code list.
export function getAccessCodeSummary(
  codes: { code: string; usesCount: number; maxUses: number; isActive: boolean }[]
): AccessCodeSummary {
  const active = codes.filter((c) => c.isActive);
  const totalRedemptions = codes.reduce((sum, c) => sum + c.usesCount, 0);
  const mostUsed = [...codes].sort((a, b) => b.usesCount - a.usesCount)[0];

  return {
    activeCount: active.length,
    totalRedemptions,
    mostUsed: mostUsed
      ? { code: mostUsed.code, usesCount: mostUsed.usesCount, maxUses: mostUsed.maxUses }
      : null,
  };
}
