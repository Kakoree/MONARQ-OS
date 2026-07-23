import { createClient } from "@/lib/supabase/server";
import { levelForXp } from "@/lib/progression";
import type { MembershipStatus, MemberRole } from "@/lib/supabase/types";

export type OwnProfile = {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  status: MembershipStatus;
  role: MemberRole;
  totalXp: number;
  level: number;
  createdAt: string;
};

export async function getOwnProfile(): Promise<OwnProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: profile }, { data: membership }, { data: xpEvents }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, display_name, avatar_url, bio, created_at")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("memberships")
        .select("status, role")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase.from("xp_events").select("amount").eq("user_id", user.id),
    ]);

  if (!profile || !membership) return null;

  const totalXp = (xpEvents ?? []).reduce((sum, e) => sum + e.amount, 0);

  return {
    id: profile.id,
    displayName: profile.display_name,
    avatarUrl: profile.avatar_url,
    bio: profile.bio,
    status: membership.status,
    role: membership.role,
    totalXp,
    level: levelForXp(totalXp),
    createdAt: profile.created_at,
  };
}

export type MemberCard = {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  level: number;
  totalXp: number;
};

export async function getMembers(): Promise<MemberCard[] | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: activeIds }, { data: profiles }, { data: xpEvents }] =
    await Promise.all([
      supabase.from("active_member_ids").select("user_id"),
      supabase.from("profiles").select("id, display_name, avatar_url, bio"),
      supabase.from("xp_events").select("user_id, amount"),
    ]);

  const activeIdSet = new Set((activeIds ?? []).map((a) => a.user_id));

  const totals = new Map<string, number>();
  for (const e of xpEvents ?? []) {
    totals.set(e.user_id, (totals.get(e.user_id) ?? 0) + e.amount);
  }

  return (profiles ?? [])
    .filter((p) => activeIdSet.has(p.id))
    .map((p) => {
      const totalXp = totals.get(p.id) ?? 0;
      return {
        id: p.id,
        displayName: p.display_name ?? "Member",
        avatarUrl: p.avatar_url,
        bio: p.bio,
        level: levelForXp(totalXp),
        totalXp,
      };
    });
}

export async function getMemberProfile(id: string): Promise<MemberCard | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: activeRow } = await supabase
    .from("active_member_ids")
    .select("user_id")
    .eq("user_id", id)
    .maybeSingle();

  if (!activeRow) return null;

  const [{ data: profile }, { data: xpEvents }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, display_name, avatar_url, bio")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("xp_events").select("amount").eq("user_id", id),
  ]);

  if (!profile) return null;

  const totalXp = (xpEvents ?? []).reduce((sum, e) => sum + e.amount, 0);

  return {
    id: profile.id,
    displayName: profile.display_name ?? "Member",
    avatarUrl: profile.avatar_url,
    bio: profile.bio,
    level: levelForXp(totalXp),
    totalXp,
  };
}
