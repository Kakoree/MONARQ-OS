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

export type MentorshipRequestItem = {
  id: string;
  otherUserId: string;
  otherDisplayName: string;
  message: string | null;
  status: string;
  scheduledAt: string | null;
  joinUrl: string | null;
  createdAt: string;
};

// A member's own outgoing requests — one row per mentor they've reached
// out to, newest first.
export async function getMyMentorshipRequests(): Promise<MentorshipRequestItem[] | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: requests } = await supabase
    .from("mentorship_requests")
    .select("id, mentor_id, message, status, scheduled_at, join_url, created_at")
    .eq("member_id", user.id)
    .order("created_at", { ascending: false });

  if (!requests || requests.length === 0) return [];

  const mentorIds = Array.from(new Set(requests.map((r) => r.mentor_id)));
  const { data: mentors } = await supabase
    .from("mentors")
    .select("id, user_id")
    .in("id", mentorIds);

  const mentorUserIds = (mentors ?? []).map((m) => m.user_id);
  const { data: profiles } = mentorUserIds.length
    ? await supabase.from("profiles").select("id, display_name").in("id", mentorUserIds)
    : { data: [] as { id: string; display_name: string | null }[] };

  const mentorUserIdByMentorId = new Map((mentors ?? []).map((m) => [m.id, m.user_id]));
  const nameByUserId = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));

  return requests.map((r) => {
    const mentorUserId = mentorUserIdByMentorId.get(r.mentor_id) ?? "";
    return {
      id: r.id,
      otherUserId: mentorUserId,
      otherDisplayName: nameByUserId.get(mentorUserId) ?? "Mentor",
      message: r.message,
      status: r.status,
      scheduledAt: r.scheduled_at,
      joinUrl: r.join_url,
      createdAt: r.created_at,
    };
  });
}

// The signed-in mentor's own incoming requests — every member who's
// reached out to them, newest first.
export async function getMentorInbox(): Promise<MentorshipRequestItem[] | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: mentor } = await supabase
    .from("mentors")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!mentor) return [];

  const { data: requests } = await supabase
    .from("mentorship_requests")
    .select("id, member_id, message, status, scheduled_at, join_url, created_at")
    .eq("mentor_id", mentor.id)
    .order("created_at", { ascending: false });

  if (!requests || requests.length === 0) return [];

  const memberIds = Array.from(new Set(requests.map((r) => r.member_id)));
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", memberIds);

  const nameByUserId = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));

  return requests.map((r) => ({
    id: r.id,
    otherUserId: r.member_id,
    otherDisplayName: nameByUserId.get(r.member_id) ?? "Member",
    message: r.message,
    status: r.status,
    scheduledAt: r.scheduled_at,
    joinUrl: r.join_url,
    createdAt: r.created_at,
  }));
}

export async function confirmMentorshipRequest(
  requestId: string,
  scheduledAt: string,
  joinUrl: string
): Promise<MentorActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("confirm_mentorship_request", {
    p_request_id: requestId,
    p_scheduled_at: scheduledAt,
    p_join_url: joinUrl,
  });

  if (error) return { error: "Could not confirm that request. Try again." };
  return { error: undefined };
}

export async function declineMentorshipRequest(requestId: string): Promise<MentorActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("decline_mentorship_request", {
    p_request_id: requestId,
  });

  if (error) return { error: "Could not decline that request. Try again." };
  return { error: undefined };
}

export async function completeMentorshipRequest(requestId: string): Promise<MentorActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("complete_mentorship_request", {
    p_request_id: requestId,
  });

  if (error) return { error: "Could not mark that session complete. Try again." };
  return { error: undefined };
}

export async function cancelMentorshipRequest(requestId: string): Promise<MentorActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_mentorship_request", {
    p_request_id: requestId,
  });

  if (error) return { error: "Could not cancel that session. Try again." };
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
