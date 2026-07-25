import { createClient } from "@/lib/supabase/server";

export type HabitWithStatus = {
  id: string;
  name: string;
  completedToday: boolean;
};

export type DailyOS = {
  habits: HabitWithStatus[];
  streak: number;
  completedTodayCount: number;
  atRisk: boolean;
  graceTokensAvailable: number;
  recoverableDates: string[];
};

export async function getDailyOS(): Promise<DailyOS | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const today = todayDateString();

  const [{ data: habits }, { data: checkIns }, { data: graceTokens }] =
    await Promise.all([
      supabase
        .from("habits")
        .select("id, name")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: true }),
      supabase
        .from("habit_check_ins")
        .select("habit_id, completed_on")
        .eq("user_id", user.id),
      supabase
        .from("habit_grace_tokens")
        .select("consumed_at, consumed_for_date")
        .eq("user_id", user.id),
    ]);

  const todaysCompletedIds = new Set(
    (checkIns ?? [])
      .filter((c) => c.completed_on === today)
      .map((c) => c.habit_id)
  );

  const habitsWithStatus: HabitWithStatus[] = (habits ?? []).map((h) => ({
    id: h.id,
    name: h.name,
    completedToday: todaysCompletedIds.has(h.id),
  }));

  const checkInDates = new Set((checkIns ?? []).map((c) => c.completed_on));
  const recoveredDates = new Set(
    (graceTokens ?? [])
      .filter((t) => t.consumed_at && t.consumed_for_date)
      .map((t) => t.consumed_for_date as string)
  );

  // A recovered day counts toward streak continuity but is deliberately not
  // merged into checkInDates itself — per-habit trend/completion history
  // should keep reflecting what was actually done, not what was covered.
  const streakDates = new Set([...checkInDates, ...recoveredDates]);
  const streak = computeStreak(streakDates, today);

  const completedTodayCount = todaysCompletedIds.size;
  const atRisk = streak > 0 && completedTodayCount === 0 && habitsWithStatus.length > 0;

  const graceTokensAvailable = (graceTokens ?? []).filter((t) => !t.consumed_at).length;
  // Matches consume_grace_token's own window exactly (strictly before today,
  // up to 3 days back) — today itself is never recoverable since it isn't
  // "missed" until the day is over.
  const yesterday = daysAgo(1, today);
  const recoverableDates = lastNDates(3, yesterday).filter(
    (d) => !checkInDates.has(d) && !recoveredDates.has(d)
  );

  return {
    habits: habitsWithStatus,
    streak,
    completedTodayCount,
    atRisk,
    graceTokensAvailable,
    recoverableDates,
  };
}

export type CompletionTrendPoint = { date: string; rate: number };

// Real completion % per day over the trailing window, from habit_check_ins.
// Uses the *current* active-habit count as the denominator for every day —
// a reasonable approximation since we don't snapshot which habits existed
// on past days, and habit rosters here change rarely.
export async function getCompletionTrend(
  days = 14
): Promise<CompletionTrendPoint[] | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const startDate = daysAgo(days - 1, todayDateString());

  const [{ data: habits }, { data: checkIns }] = await Promise.all([
    supabase
      .from("habits")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_active", true),
    supabase
      .from("habit_check_ins")
      .select("completed_on")
      .eq("user_id", user.id)
      .gte("completed_on", startDate),
  ]);

  const activeCount = habits?.length ?? 0;

  const countByDate = new Map<string, number>();
  for (const c of checkIns ?? []) {
    countByDate.set(c.completed_on, (countByDate.get(c.completed_on) ?? 0) + 1);
  }

  return lastNDates(days, todayDateString()).map((date) => {
    const completed = countByDate.get(date) ?? 0;
    return {
      date,
      rate: activeCount > 0 ? Math.round((completed / activeCount) * 100) : 0,
    };
  });
}

export type HabitTrendSeries = {
  habitId: string;
  name: string;
  points: { date: string; completed: 0 | 1 }[];
};

// Per-habit version of getCompletionTrend — one 0/1 series per active habit
// instead of one aggregate rate, feeding the multi-line trend chart.
export async function getPerHabitTrend(days = 14): Promise<HabitTrendSeries[] | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const startDate = daysAgo(days - 1, todayDateString());

  const [{ data: habits }, { data: checkIns }] = await Promise.all([
    supabase
      .from("habits")
      .select("id, name")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: true }),
    supabase
      .from("habit_check_ins")
      .select("habit_id, completed_on")
      .eq("user_id", user.id)
      .gte("completed_on", startDate),
  ]);

  const completedByHabit = new Map<string, Set<string>>();
  for (const c of checkIns ?? []) {
    const set = completedByHabit.get(c.habit_id) ?? new Set<string>();
    set.add(c.completed_on);
    completedByHabit.set(c.habit_id, set);
  }

  const dates = lastNDates(days, todayDateString());

  return (habits ?? []).map((h) => {
    const completedDates = completedByHabit.get(h.id) ?? new Set<string>();
    return {
      habitId: h.id,
      name: h.name,
      points: dates.map((date) => ({
        date,
        completed: completedDates.has(date) ? (1 as const) : (0 as const),
      })),
    };
  });
}

// % of the trailing `days` window with at least one check-in or a recovered
// day, out of days elapsed. Exposed for Phase 4's seasonal rank — computed
// on demand, never stored, matching the XP/rank pattern.
async function getConsistencyScore(days: number): Promise<number | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const startDate = daysAgo(days - 1, todayDateString());

  const [{ data: checkIns }, { data: graceTokens }] = await Promise.all([
    supabase
      .from("habit_check_ins")
      .select("completed_on")
      .eq("user_id", user.id)
      .gte("completed_on", startDate),
    supabase
      .from("habit_grace_tokens")
      .select("consumed_for_date")
      .eq("user_id", user.id)
      .not("consumed_for_date", "is", null)
      .gte("consumed_for_date", startDate),
  ]);

  const coveredDates = new Set([
    ...(checkIns ?? []).map((c) => c.completed_on),
    ...(graceTokens ?? []).map((t) => t.consumed_for_date as string),
  ]);

  const windowDates = lastNDates(days, todayDateString());
  const coveredCount = windowDates.filter((d) => coveredDates.has(d)).length;

  return Math.round((coveredCount / windowDates.length) * 100);
}

export async function getWeeklyConsistency(): Promise<number | null> {
  return getConsistencyScore(7);
}

export async function getMonthlyConsistency(): Promise<number | null> {
  return getConsistencyScore(30);
}

export function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgo(n: number, fromDate: string): string {
  const d = new Date(`${fromDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

function lastNDates(n: number, throughDate: string): string[] {
  const dates: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    dates.push(daysAgo(i, throughDate));
  }
  return dates;
}

export function computeStreak(distinctDates: Set<string>, today: string): number {
  let streak = 0;
  const cursor = new Date(`${today}T00:00:00Z`);

  // If today has no check-in yet, an otherwise-intact streak shouldn't read
  // as broken before the day is even over — start counting from yesterday.
  if (!distinctDates.has(today)) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  while (distinctDates.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return streak;
}
