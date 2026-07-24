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
  roleUnlocked: boolean;
  sequenceUnlocked: boolean;
  isUnlocked: boolean;
  isCompleted: boolean;
};

export type TeachingCategoryGroup = {
  id: string | null;
  name: string;
  mentorId: string | null;
  mentorName: string | null;
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
        .select("id, name, sort_order, mentor_id")
        .order("sort_order", { ascending: true }),
      supabase
        .from("teachings")
        .select("id, category_id, title, summary, required_role, sort_order")
        .order("sort_order", { ascending: true }),
      supabase.from("teaching_progress").select("teaching_id").eq("user_id", user.id),
    ]);

  const memberRoleRank = ROLE_RANK[membership?.role ?? "guest"];
  const completedIds = new Set((progress ?? []).map((p) => p.teaching_id));

  const mentorIds = Array.from(
    new Set((categories ?? []).map((c) => c.mentor_id).filter((id): id is string => !!id))
  );
  const { data: mentorRows } = mentorIds.length
    ? await supabase.from("mentors").select("id, user_id").in("id", mentorIds)
    : { data: [] as { id: string; user_id: string }[] };
  const mentorUserIds = (mentorRows ?? []).map((m) => m.user_id);
  const { data: mentorProfiles } = mentorUserIds.length
    ? await supabase.from("profiles").select("id, display_name").in("id", mentorUserIds)
    : { data: [] as { id: string; display_name: string | null }[] };
  const mentorNameByMentorId = new Map(
    (mentorRows ?? []).map((m) => [
      m.id,
      mentorProfiles?.find((p) => p.id === m.user_id)?.display_name ?? "Mentor",
    ])
  );

  // Groups a flat, role-gated list into progressive tracks: within a
  // category, a teaching only sequence-unlocks once the previous one (by
  // sort_order) is completed — the "leveled tracks" evolution from a flat
  // list, without inventing a separate levels table since sort_order
  // already defines the intended order.
  const groups: TeachingCategoryGroup[] = (categories ?? []).map((cat) => {
    const inTrack = (teachings ?? [])
      .filter((t) => t.category_id === cat.id)
      .sort((a, b) => a.sort_order - b.sort_order);

    const summaries: TeachingSummary[] = inTrack.map((t, index) => {
      const roleUnlocked = memberRoleRank >= ROLE_RANK[t.required_role];
      const sequenceUnlocked = index === 0 || completedIds.has(inTrack[index - 1].id);
      return {
        id: t.id,
        title: t.title,
        summary: t.summary,
        requiredRole: t.required_role,
        categoryId: t.category_id,
        roleUnlocked,
        sequenceUnlocked,
        isUnlocked: roleUnlocked && sequenceUnlocked,
        isCompleted: completedIds.has(t.id),
      };
    });

    return {
      id: cat.id,
      name: cat.name,
      mentorId: cat.mentor_id,
      mentorName: cat.mentor_id ? (mentorNameByMentorId.get(cat.mentor_id) ?? null) : null,
      teachings: summaries,
    };
  });

  const categorizedIds = new Set((categories ?? []).map((c) => c.id));
  const uncategorized = (teachings ?? [])
    .filter((t) => !t.category_id || !categorizedIds.has(t.category_id))
    .map((t) => {
      const roleUnlocked = memberRoleRank >= ROLE_RANK[t.required_role];
      return {
        id: t.id,
        title: t.title,
        summary: t.summary,
        requiredRole: t.required_role,
        categoryId: t.category_id,
        roleUnlocked,
        sequenceUnlocked: true,
        isUnlocked: roleUnlocked,
        isCompleted: completedIds.has(t.id),
      };
    });

  if (uncategorized.length > 0) {
    groups.push({ id: null, name: "General", mentorId: null, mentorName: null, teachings: uncategorized });
  }

  return groups.filter((g) => g.teachings.length > 0);
}

export type TeachingDetail = {
  id: string;
  title: string;
  summary: string;
  requiredRole: MemberRole;
  roleUnlocked: boolean;
  sequenceUnlocked: boolean;
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
        .select("id, category_id, title, summary, required_role, sort_order")
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
  const roleUnlocked = memberRoleRank >= ROLE_RANK[teaching.required_role];

  let sequenceUnlocked = true;
  if (teaching.category_id) {
    const { data: priorInTrack } = await supabase
      .from("teachings")
      .select("id")
      .eq("category_id", teaching.category_id)
      .lt("sort_order", teaching.sort_order)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (priorInTrack) {
      const { data: priorProgress } = await supabase
        .from("teaching_progress")
        .select("teaching_id")
        .eq("teaching_id", priorInTrack.id)
        .eq("user_id", user.id)
        .maybeSingle();
      sequenceUnlocked = !!priorProgress;
    }
  }

  const isUnlocked = roleUnlocked && sequenceUnlocked;

  return {
    id: teaching.id,
    title: teaching.title,
    summary: teaching.summary,
    requiredRole: teaching.required_role,
    roleUnlocked,
    sequenceUnlocked,
    isUnlocked,
    isCompleted: !!progressRow,
    body: isUnlocked ? (content?.body ?? null) : null,
  };
}
