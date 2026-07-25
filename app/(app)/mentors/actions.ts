"use server";

import { revalidatePath } from "next/cache";
import {
  applyToBeMentor,
  bookMentorshipSlot,
  cancelMentorshipRequest,
  completeMentorshipRequest,
  confirmMentorshipRequest,
  declineMentorshipRequest,
  publishAvailabilitySlot,
  requestMentorship,
  updateOwnMentorProfile,
  withdrawAvailabilitySlot,
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

export async function confirmRequestAction(requestId: string, formData: FormData) {
  const scheduledAt = String(formData.get("scheduled_at") ?? "");
  const joinUrl = String(formData.get("join_url") ?? "");

  if (!scheduledAt || !joinUrl) return;

  await confirmMentorshipRequest(requestId, new Date(scheduledAt).toISOString(), joinUrl);
  revalidatePath("/mentors/apply");
}

export async function declineRequestAction(requestId: string) {
  await declineMentorshipRequest(requestId);
  revalidatePath("/mentors/apply");
}

export async function completeRequestAction(requestId: string) {
  await completeMentorshipRequest(requestId);
  revalidatePath("/mentors/apply");
}

export async function cancelRequestAction(requestId: string) {
  await cancelMentorshipRequest(requestId);
  revalidatePath("/mentors/apply");
  revalidatePath("/mentors");
}

export type SlotFormState = { error: string; success?: boolean } | undefined;

export async function publishSlotAction(
  _prevState: SlotFormState,
  formData: FormData
): Promise<SlotFormState> {
  const startsAt = String(formData.get("starts_at") ?? "");
  const durationMinutes = Number(formData.get("duration_minutes") ?? 30);
  const joinUrl = String(formData.get("join_url") ?? "");

  const result = await publishAvailabilitySlot({ startsAt, durationMinutes, joinUrl });
  if (result.error) return { error: result.error };

  revalidatePath("/mentors/apply");
  revalidatePath("/mentors");
  return { error: "", success: true };
}

export async function withdrawSlotAction(slotId: string) {
  await withdrawAvailabilitySlot(slotId);
  revalidatePath("/mentors/apply");
  revalidatePath("/mentors");
}

export async function bookSlotAction(
  slotId: string,
  mentorId: string,
  _prevState: SlotFormState,
  formData: FormData
): Promise<SlotFormState> {
  const message = String(formData.get("message") ?? "");
  const result = await bookMentorshipSlot(slotId, message);
  if (result.error) return { error: result.error };

  revalidatePath(`/mentors/${mentorId}`);
  revalidatePath("/mentors");
  return { error: "", success: true };
}
