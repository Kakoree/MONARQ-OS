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
};

export async function getDailyOS(): Promise<DailyOS | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const today = todayDateString();

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

  const distinctDates = new Set((checkIns ?? []).map((c) => c.completed_on));
  const streak = computeStreak(distinctDates, today);

  return {
    habits: habitsWithStatus,
    streak,
    completedTodayCount: todaysCompletedIds.size,
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

  const start = new Date(`${todayDateString()}T00:00:00Z`);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  const startDate = start.toISOString().slice(0, 10);

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

  const points: CompletionTrendPoint[] = [];
  const cursor = new Date(start);
  for (let i = 0; i < days; i++) {
    const dateStr = cursor.toISOString().slice(0, 10);
    const completed = countByDate.get(dateStr) ?? 0;
    points.push({
      date: dateStr,
      rate: activeCount > 0 ? Math.round((completed / activeCount) * 100) : 0,
    });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return points;
}

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

function computeStreak(distinctDates: Set<string>, today: string): number {
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
