"use server";

import { revalidatePath } from "next/cache";
import {
  applyToBeMentor,
  requestMentorship,
  updateOwnMentorProfile,
} from "@/lib/mentors";

export type MentorFormState = { error: string; success?: boolean } | undefined;

export async function applyToBeMentorAction(
  _prevState: MentorFormState,
  formData: FormData
): Promise<MentorFormState> {
  const headline = String(formData.get("headline") ?? "");
  const bio = String(formData.get("bio") ?? "");
  const focusAreas = String(formData.get("focus_areas") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const result = await applyToBeMentor({ headline, bio, focusAreas });
  if (result.error) return { error: result.error };

  revalidatePath("/mentors/apply");
  return { error: "", success: true };
}

export async function updateOwnMentorProfileAction(
  _prevState: MentorFormState,
  formData: FormData
): Promise<MentorFormState> {
  const headline = String(formData.get("headline") ?? "");
  const bio = String(formData.get("bio") ?? "");
  const focusAreas = String(formData.get("focus_areas") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const isAcceptingRequests = formData.get("is_accepting_requests") === "on";

  const result = await updateOwnMentorProfile({
    headline,
    bio,
    focusAreas,
    isAcceptingRequests,
  });
  if (result.error) return { error: result.error };

  revalidatePath("/mentors/apply");
  revalidatePath("/mentors");
  return { error: "", success: true };
}

export type RequestMentorshipState = { error: string; success?: boolean } | undefined;

export async function requestMentorshipAction(
  mentorId: string,
  _prevState: RequestMentorshipState,
  formData: FormData
): Promise<RequestMentorshipState> {
  const message = String(formData.get("message") ?? "");
  const result = await requestMentorship(mentorId, message);
  if (result.error) return { error: result.error };

  return { error: "", success: true };
}
