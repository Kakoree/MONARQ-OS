import { createClient } from "@/lib/supabase/server";
import type { MemberRole } from "@/lib/supabase/types";

const ROLE_RANK: Record<MemberRole, number> = {
  guest: 0,
  member: 1,
  moderator: 2,
  admin: 3,
};

export type TeachingSummary = {
  id: string;
  title: string;
  summary: string;
  requiredRole: MemberRole;
  categoryId: string | null;
  isUnlocked: boolean;
  isCompleted: boolean;
};

export type TeachingCategoryGroup = {
  id: string | null;
  name: string;
  teachings: TeachingSummary[];
};

export async function getTeachingsLibrary(): Promise<
  TeachingCategoryGroup[] | null
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: membership }, { data: categories }, { data: teachings }, { data: progress }] =
    await Promise.all([
      supabase
        .from("memberships")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("teaching_categories")
        .select("id, name, sort_order")
        .order("sort_order", { ascending: true }),
      supabase
        .from("teachings")
        .select("id, category_id, title, summary, required_role, sort_order")
        .order("sort_order", { ascending: true }),
      supabase.from("teaching_progress").select("teaching_id").eq("user_id", user.id),
    ]);

  const memberRoleRank = ROLE_RANK[membership?.role ?? "guest"];
  const completedIds = new Set((progress ?? []).map((p) => p.teaching_id));

  const summaries: TeachingSummary[] = (teachings ?? []).map((t) => ({
    id: t.id,
    title: t.title,
    summary: t.summary,
    requiredRole: t.required_role,
    categoryId: t.category_id,
    isUnlocked: memberRoleRank >= ROLE_RANK[t.required_role],
    isCompleted: completedIds.has(t.id),
  }));

  const groups: TeachingCategoryGroup[] = (categories ?? []).map((cat) => ({
    id: cat.id,
    name: cat.name,
    teachings: summaries.filter((s) => s.categoryId === cat.id),
  }));

  const uncategorized = summaries.filter((s) => s.categoryId === null);
  if (uncategorized.length > 0) {
    groups.push({ id: null, name: "General", teachings: uncategorized });
  }

  return groups.filter((g) => g.teachings.length > 0);
}

export type TeachingDetail = {
  id: string;
  title: string;
  summary: string;
  requiredRole: MemberRole;
  isUnlocked: boolean;
  isCompleted: boolean;
  body: string | null;
};

export async function getTeaching(id: string): Promise<TeachingDetail | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: membership }, { data: teaching }, { data: content }, { data: progressRow }] =
    await Promise.all([
      supabase
        .from("memberships")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("teachings")
        .select("id, title, summary, required_role")
        .eq("id", id)
        .maybeSingle(),
      supabase.from("teaching_content").select("body").eq("teaching_id", id).maybeSingle(),
      supabase
        .from("teaching_progress")
        .select("teaching_id")
        .eq("teaching_id", id)
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

  if (!teaching) return null;

  const memberRoleRank = ROLE_RANK[membership?.role ?? "guest"];
  const isUnlocked = memberRoleRank >= ROLE_RANK[teaching.required_role];

  return {
    id: teaching.id,
    title: teaching.title,
    summary: teaching.summary,
    requiredRole: teaching.required_role,
    isUnlocked,
    isCompleted: !!progressRow,
    body: isUnlocked ? (content?.body ?? null) : null,
  };
}
