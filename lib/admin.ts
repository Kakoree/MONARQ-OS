import { notFound } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getCurrentMembership } from "@/lib/membership";
import type { MembershipStatus, MemberRole } from "@/lib/supabase/types";

export async function requireAdmin(): Promise<User> {
  const { user, status, role } = await getCurrentMembership();

  if (!user || status !== "active" || role !== "admin") {
    notFound();
  }

  return user;
}

export type AdminMemberRow = {
  userId: string;
  displayName: string | null;
  status: MembershipStatus;
  role: MemberRole;
  createdAt: string;
};

export async function getAllMembers(): Promise<AdminMemberRow[]> {
  const supabase = await createClient();

  const [{ data: profiles }, { data: memberships }] = await Promise.all([
    supabase.from("profiles").select("id, display_name, created_at"),
    supabase.from("memberships").select("user_id, status, role"),
  ]);

  const membershipByUser = new Map(
    (memberships ?? []).map((m) => [m.user_id, m])
  );

  return (profiles ?? []).map((p) => {
    const membership = membershipByUser.get(p.id);
    return {
      userId: p.id,
      displayName: p.display_name,
      status: membership?.status ?? "pending",
      role: membership?.role ?? "guest",
      createdAt: p.created_at,
    };
  });
}

export type AdminAccessCode = {
  id: string;
  code: string;
  label: string | null;
  maxUses: number;
  usesCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
};

export async function getAccessCodes(): Promise<AdminAccessCode[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("access_codes")
    .select("id, code, label, max_uses, uses_count, expires_at, is_active, created_at")
    .order("created_at", { ascending: false });

  return (data ?? []).map((c) => ({
    id: c.id,
    code: c.code,
    label: c.label,
    maxUses: c.max_uses,
    usesCount: c.uses_count,
    expiresAt: c.expires_at,
    isActive: c.is_active,
    createdAt: c.created_at,
  }));
}

export type AdminIdentityMarker = {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
};

export async function getIdentityMarkersAdmin(): Promise<AdminIdentityMarker[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("identity_markers")
    .select("id, name, description, sort_order, is_active, created_at")
    .order("sort_order", { ascending: true });

  return (data ?? []).map((m) => ({
    id: m.id,
    name: m.name,
    description: m.description,
    sortOrder: m.sort_order,
    isActive: m.is_active,
    createdAt: m.created_at,
  }));
}

export type AdminChallenge = {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  startsAt: string | null;
  endsAt: string | null;
  isPublished: boolean;
  isGroup: boolean;
  createdAt: string;
};

export async function getChallengesAdmin(): Promise<AdminChallenge[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("challenges")
    .select(
      "id, title, description, xp_reward, starts_at, ends_at, is_published, is_group, created_at"
    )
    .order("created_at", { ascending: false });

  return (data ?? []).map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    xpReward: c.xp_reward,
    startsAt: c.starts_at,
    endsAt: c.ends_at,
    isPublished: c.is_published,
    isGroup: c.is_group,
    createdAt: c.created_at,
  }));
}

export type AdminReport = {
  id: string;
  reporterName: string;
  reportedName: string;
  reportedUserId: string;
  reason: string;
  context: string | null;
  status: "open" | "resolved" | "dismissed";
  createdAt: string;
};

export async function getReports(status: "open" | "all" = "open"): Promise<AdminReport[]> {
  const supabase = await createClient();

  let query = supabase
    .from("reports")
    .select("id, reporter_id, reported_user_id, reason, context, status, created_at")
    .order("created_at", { ascending: false });

  if (status === "open") {
    query = query.eq("status", "open");
  }

  const { data: reports } = await query;

  const userIds = Array.from(
    new Set((reports ?? []).flatMap((r) => [r.reporter_id, r.reported_user_id]))
  );

  const { data: profiles } = userIds.length
    ? await supabase.from("profiles").select("id, display_name").in("id", userIds)
    : { data: [] as { id: string; display_name: string | null }[] };

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));

  return (reports ?? []).map((r) => ({
    id: r.id,
    reporterName: nameById.get(r.reporter_id) ?? "Member",
    reportedName: nameById.get(r.reported_user_id) ?? "Member",
    reportedUserId: r.reported_user_id,
    reason: r.reason,
    context: r.context,
    status: r.status as "open" | "resolved" | "dismissed",
    createdAt: r.created_at,
  }));
}

export type AdminMentor = {
  id: string;
  userId: string;
  displayName: string;
  headline: string;
  bio: string;
  focusAreas: string[];
  isApproved: boolean;
  isAcceptingRequests: boolean;
  createdAt: string;
};

export async function getMentorsAdmin(): Promise<AdminMentor[]> {
  const supabase = await createClient();

  const { data: mentors } = await supabase
    .from("mentors")
    .select(
      "id, user_id, headline, bio, focus_areas, is_approved, is_accepting_requests, created_at"
    )
    .order("created_at", { ascending: false });

  const userIds = (mentors ?? []).map((m) => m.user_id);
  const { data: profiles } = userIds.length
    ? await supabase.from("profiles").select("id, display_name").in("id", userIds)
    : { data: [] as { id: string; display_name: string | null }[] };

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));

  return (mentors ?? []).map((m) => ({
    id: m.id,
    userId: m.user_id,
    displayName: nameById.get(m.user_id) ?? "Member",
    headline: m.headline,
    bio: m.bio,
    focusAreas: m.focus_areas,
    isApproved: m.is_approved,
    isAcceptingRequests: m.is_accepting_requests,
    createdAt: m.created_at,
  }));
}

export type AuditLogEntry = {
  id: string;
  actorName: string;
  action: string;
  targetTable: string | null;
  targetId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export async function getAuditLog(): Promise<AuditLogEntry[]> {
  const supabase = await createClient();

  const { data: entries } = await supabase
    .from("audit_log")
    .select("id, actor_id, action, target_table, target_id, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const actorIds = Array.from(
    new Set(
      (entries ?? [])
        .map((e) => e.actor_id)
        .filter((id): id is string => !!id)
    )
  );

  const { data: profiles } = actorIds.length
    ? await supabase.from("profiles").select("id, display_name").in("id", actorIds)
    : { data: [] as { id: string; display_name: string | null }[] };

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));

  return (entries ?? []).map((e) => ({
    id: e.id,
    actorName: (e.actor_id && nameById.get(e.actor_id)) || "Unknown",
    action: e.action,
    targetTable: e.target_table,
    targetId: e.target_id,
    metadata: e.metadata,
    createdAt: e.created_at,
  }));
}
