import { createClient } from "@/lib/supabase/server";
import { computeStreak, todayDateString } from "@/lib/habits";

export type PodSummary = {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
};

// No user_id filter needed: the pods select policy (0042) already restricts
// this to pods the caller is actually a member of.
export async function getMyPods(): Promise<PodSummary[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: pods } = await supabase
    .from("pods")
    .select("id, name, description")
    .eq("is_active", true)
    .order("name", { ascending: true });

  const podIds = (pods ?? []).map((p) => p.id);
  const { data: members } = podIds.length
    ? await supabase.from("pod_members").select("pod_id").in("pod_id", podIds)
    : { data: [] as { pod_id: string }[] };

  const countByPodId = new Map<string, number>();
  for (const m of members ?? []) {
    countByPodId.set(m.pod_id, (countByPodId.get(m.pod_id) ?? 0) + 1);
  }

  return (pods ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    memberCount: countByPodId.get(p.id) ?? 0,
  }));
}

export type PodMemberStatus = {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  isSelf: boolean;
  hasHabits: boolean;
  checkedInToday: boolean;
  streak: number;
};

export type PodDetail = {
  id: string;
  name: string;
  description: string | null;
  members: PodMemberStatus[];
  checkedInCount: number;
  trackingCount: number;
};

export async function getPod(podId: string): Promise<PodDetail | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Returns null for a pod the caller isn't in — RLS filters the row out
  // rather than erroring, which is what the page turns into a 404.
  const { data: pod } = await supabase
    .from("pods")
    .select("id, name, description")
    .eq("id", podId)
    .eq("is_active", true)
    .maybeSingle();

  if (!pod) return null;

  const [{ data: roster }, { data: accountability, error: accountabilityError }] =
    await Promise.all([
      supabase.from("pod_members").select("user_id").eq("pod_id", podId),
      supabase.rpc("get_pod_accountability", { p_pod_id: podId }),
    ]);

  // The RPC raises for a non-member caller rather than returning empty, so a
  // failure here means something is genuinely wrong — don't render a pod
  // page full of silently-empty accountability data.
  if (accountabilityError) return null;

  const userIds = (roster ?? []).map((r) => r.user_id);
  const { data: profiles } = userIds.length
    ? await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in("id", userIds)
    : { data: [] as { id: string; display_name: string | null; avatar_url: string | null }[] };

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));
  const statusByUserId = new Map((accountability ?? []).map((a) => [a.member_id, a]));
  const today = todayDateString();

  const members: PodMemberStatus[] = userIds.map((userId) => {
    const status = statusByUserId.get(userId);
    const profile = profileById.get(userId);
    const activityDates = new Set(status?.activity_dates ?? []);

    return {
      userId,
      displayName: profile?.display_name ?? "Member",
      avatarUrl: profile?.avatar_url ?? null,
      isSelf: userId === user.id,
      hasHabits: (status?.active_habit_count ?? 0) > 0,
      checkedInToday: status?.checked_in_today ?? false,
      streak: computeStreak(activityDates, today),
    };
  });

  // Sort by who needs attention first — not checked in, longest streak at
  // stake — since that's the whole point of looking at a pod.
  members.sort((a, b) => {
    if (a.checkedInToday !== b.checkedInToday) return a.checkedInToday ? 1 : -1;
    return b.streak - a.streak;
  });

  const tracking = members.filter((m) => m.hasHabits);

  return {
    id: pod.id,
    name: pod.name,
    description: pod.description,
    members,
    checkedInCount: tracking.filter((m) => m.checkedInToday).length,
    trackingCount: tracking.length,
  };
}
