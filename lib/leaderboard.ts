import { createClient } from "@/lib/supabase/server";
import { levelForXp } from "@/lib/progression";

export type LeaderboardEntry = {
  userId: string;
  displayName: string;
  totalXp: number;
  level: number;
};

export async function getLeaderboard(): Promise<LeaderboardEntry[] | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: xpEvents }, { data: profiles }] = await Promise.all([
    supabase.from("xp_events").select("user_id, amount"),
    supabase.from("profiles").select("id, display_name"),
  ]);

  const totals = new Map<string, number>();
  for (const event of xpEvents ?? []) {
    totals.set(event.user_id, (totals.get(event.user_id) ?? 0) + event.amount);
  }

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));

  const entries: LeaderboardEntry[] = Array.from(totals.entries()).map(
    ([userId, totalXp]) => ({
      userId,
      displayName: nameById.get(userId) ?? "Member",
      totalXp,
      level: levelForXp(totalXp),
    })
  );

  entries.sort((a, b) => b.totalXp - a.totalXp);

  return entries;
}
