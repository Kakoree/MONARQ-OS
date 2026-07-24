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
