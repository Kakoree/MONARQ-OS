"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function rsvpToEvent(eventId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await supabase
    .from("event_rsvps")
    .insert({ user_id: user.id, event_id: eventId });

  revalidatePath("/events");
  revalidatePath(`/events/${eventId}`);
}

export async function cancelRsvp(eventId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await supabase
    .from("event_rsvps")
    .delete()
    .eq("event_id", eventId)
    .eq("user_id", user.id);

  revalidatePath("/events");
  revalidatePath(`/events/${eventId}`);
}

export async function markAttended(eventId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await supabase
    .from("event_rsvps")
    .update({ attended: true })
    .eq("event_id", eventId)
    .eq("user_id", user.id);

  revalidatePath("/events");
  revalidatePath(`/events/${eventId}`);
}
