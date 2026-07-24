import { createClient } from "@/lib/supabase/server";

export type ChallengeSummary = {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  startsAt: string | null;
  endsAt: string | null;
  isGroup: boolean;
  isJoined: boolean;
  isCompleted: boolean;
  completedAt: string | null;
};

export async function getChallenges(): Promise<ChallengeSummary[] | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: challenges }, { data: participation }] = await Promise.all([
    supabase
      .from("challenges")
      .select("id, title, description, xp_reward, starts_at, ends_at, is_group")
      .order("created_at", { ascending: true }),
    supabase
      .from("challenge_participation")
      .select("challenge_id, completed_at")
      .eq("user_id", user.id),
  ]);

  const participationByChallenge = new Map(
    (participation ?? []).map((p) => [p.challenge_id, p.completed_at])
  );

  return (challenges ?? []).map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    xpReward: c.xp_reward,
    startsAt: c.starts_at,
    endsAt: c.ends_at,
    isGroup: c.is_group,
    isJoined: participationByChallenge.has(c.id),
    isCompleted: !!participationByChallenge.get(c.id),
    completedAt: participationByChallenge.get(c.id) ?? null,
  }));
}

export async function getChallenge(id: string): Promise<ChallengeSummary | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: challenge }, { data: participation }] = await Promise.all([
    supabase
      .from("challenges")
      .select("id, title, description, xp_reward, starts_at, ends_at, is_group")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("challenge_participation")
      .select("completed_at")
      .eq("challenge_id", id)
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (!challenge) return null;

  return {
    id: challenge.id,
    title: challenge.title,
    description: challenge.description,
    xpReward: challenge.xp_reward,
    startsAt: challenge.starts_at,
    endsAt: challenge.ends_at,
    isGroup: challenge.is_group,
    isJoined: !!participation,
    isCompleted: !!participation?.completed_at,
    completedAt: participation?.completed_at ?? null,
  };
}

export type GroupChallengeProgress = {
  completedCount: number;
  activeMemberCount: number;
};

export async function getGroupChallengeProgress(
  challengeId: string
): Promise<GroupChallengeProgress | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("get_group_challenge_progress", { p_challenge_id: challengeId })
    .single();

  if (error || !data) return null;

  return {
    completedCount: data.completed_count,
    activeMemberCount: data.active_member_count,
  };
}
