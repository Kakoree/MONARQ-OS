import { createClient } from "@/lib/supabase/server";

export type ChallengeSummary = {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  startsAt: string | null;
  endsAt: string | null;
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
      .select("id, title, description, xp_reward, starts_at, ends_at")
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
      .select("id, title, description, xp_reward, starts_at, ends_at")
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
    isJoined: !!participation,
    isCompleted: !!participation?.completed_at,
    completedAt: participation?.completed_at ?? null,
  };
}
