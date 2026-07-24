import { createClient } from "@/lib/supabase/server";

export type MentorSummary = {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  headline: string;
  bio: string;
  focusAreas: string[];
  isAcceptingRequests: boolean;
};

export async function getMentorDirectory(): Promise<MentorSummary[] | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: mentors } = await supabase
    .from("mentors")
    .select("id, user_id, headline, bio, focus_areas, is_accepting_requests")
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  if (!mentors || mentors.length === 0) return [];

  const userIds = mentors.map((m) => m.user_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .in("id", userIds);

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  return mentors.map((m) => {
    const profile = profileById.get(m.user_id);
    return {
      id: m.id,
      userId: m.user_id,
      displayName: profile?.display_name ?? "Mentor",
      avatarUrl: profile?.avatar_url ?? null,
      headline: m.headline,
      bio: m.bio,
      focusAreas: m.focus_areas,
      isAcceptingRequests: m.is_accepting_requests,
    };
  });
}

export async function getMentorProfile(mentorId: string): Promise<MentorSummary | null> {
  const supabase = await createClient();

  const { data: mentor } = await supabase
    .from("mentors")
    .select("id, user_id, headline, bio, focus_areas, is_accepting_requests, is_approved")
    .eq("id", mentorId)
    .eq("is_approved", true)
    .maybeSingle();

  if (!mentor) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url")
    .eq("id", mentor.user_id)
    .maybeSingle();

  return {
    id: mentor.id,
    userId: mentor.user_id,
    displayName: profile?.display_name ?? "Mentor",
    avatarUrl: profile?.avatar_url ?? null,
    headline: mentor.headline,
    bio: mentor.bio,
    focusAreas: mentor.focus_areas,
    isAcceptingRequests: mentor.is_accepting_requests,
  };
}

export type OwnMentorStatus =
  | { state: "not_applied" }
  | { state: "pending" }
  | {
      state: "approved";
      id: string;
      headline: string;
      bio: string;
      focusAreas: string[];
      isAcceptingRequests: boolean;
    };

export async function getOwnMentorStatus(): Promise<OwnMentorStatus | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("mentors")
    .select("id, headline, bio, focus_areas, is_approved, is_accepting_requests")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) return { state: "not_applied" };
  if (!data.is_approved) return { state: "pending" };

  return {
    state: "approved",
    id: data.id,
    headline: data.headline,
    bio: data.bio,
    focusAreas: data.focus_areas,
    isAcceptingRequests: data.is_accepting_requests,
  };
}

export type MentorActionResult = { error: string } | { error: undefined };

export async function applyToBeMentor(params: {
  headline: string;
  bio: string;
  focusAreas: string[];
}): Promise<MentorActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You need to be signed in." };
  if (!params.headline.trim() || !params.bio.trim()) {
    return { error: "Headline and bio are required." };
  }

  const { error } = await supabase.from("mentors").insert({
    user_id: user.id,
    headline: params.headline.trim(),
    bio: params.bio.trim(),
    focus_areas: params.focusAreas,
  });

  if (error) {
    return { error: "Could not submit your application. Try again." };
  }

  return { error: undefined };
}

export async function updateOwnMentorProfile(params: {
  headline: string;
  bio: string;
  focusAreas: string[];
  isAcceptingRequests: boolean;
}): Promise<MentorActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("update_mentor_profile", {
    p_headline: params.headline,
    p_bio: params.bio,
    p_focus_areas: params.focusAreas,
    p_is_accepting_requests: params.isAcceptingRequests,
  });

  if (error) {
    return { error: "Could not update your mentor profile. Try again." };
  }

  return { error: undefined };
}

export async function requestMentorship(
  mentorId: string,
  message: string
): Promise<MentorActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You need to be signed in." };

  const { error } = await supabase.from("mentorship_requests").insert({
    mentor_id: mentorId,
    member_id: user.id,
    message: message.trim() || null,
  });

  if (error) {
    return { error: "Could not send that request. Try again." };
  }

  return { error: undefined };
}
