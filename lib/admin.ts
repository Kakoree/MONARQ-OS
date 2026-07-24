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
