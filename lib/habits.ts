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
