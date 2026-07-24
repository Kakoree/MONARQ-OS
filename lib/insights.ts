import { createClient } from "@/lib/supabase/server";
import { getActiveSeason } from "@/lib/seasons";

export type RetentionInsights = {
  churnRiskCount: number;
  seasonParticipationRate: number | null;
  teachingsCompletionRate: number;
  dropsClaimedCount: number;
  membersWithDropsCount: number;
};

// Pulls the retention/engagement signal every prior V2 phase already
// produced into one view, per Phase 10's own scope — no new tracking, just
// consolidation. activeCount/activeThisWeekCount are passed in since the
// admin Overview page already fetches both for its own stat cards.
export async function getRetentionInsights(
  activeCount: number,
  activeThisWeekCount: number
): Promise<RetentionInsights> {
  const supabase = await createClient();

  // Same members who haven't logged a check-in or XP event in the trailing
  // week that the "Active this week" stat already excludes.
  const churnRiskCount = Math.max(0, activeCount - activeThisWeekCount);

  const activeSeason = await getActiveSeason();
  let seasonParticipationRate: number | null = null;
  if (activeSeason && activeCount > 0) {
    const { data: xpEvents } = await supabase
      .from("xp_events")
      .select("user_id")
      .gte("created_at", activeSeason.startsAt)
      .lte("created_at", activeSeason.endsAt);
    const participants = new Set((xpEvents ?? []).map((e) => e.user_id)).size;
    seasonParticipationRate = Math.round((participants / activeCount) * 100);
  }

  const [{ data: progress }, { data: claims }] = await Promise.all([
    supabase.from("teaching_progress").select("user_id"),
    supabase.from("drop_claims").select("user_id"),
  ]);

  const membersWithTeachingProgress = new Set((progress ?? []).map((p) => p.user_id)).size;
  const teachingsCompletionRate =
    activeCount > 0 ? Math.round((membersWithTeachingProgress / activeCount) * 100) : 0;

  const membersWithDropsCount = new Set((claims ?? []).map((c) => c.user_id)).size;

  return {
    churnRiskCount,
    seasonParticipationRate,
    teachingsCompletionRate,
    dropsClaimedCount: claims?.length ?? 0,
    membersWithDropsCount,
  };
}
