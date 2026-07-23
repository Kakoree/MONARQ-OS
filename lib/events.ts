import { createClient } from "@/lib/supabase/server";

export type EventSummary = {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string | null;
  location: string | null;
  isRsvped: boolean;
  isPast: boolean;
};

export async function getEvents(): Promise<EventSummary[] | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: events }, { data: rsvps }] = await Promise.all([
    supabase
      .from("events")
      .select("id, title, description, starts_at, ends_at, location")
      .order("starts_at", { ascending: true }),
    supabase.from("event_rsvps").select("event_id").eq("user_id", user.id),
  ]);

  const rsvpedIds = new Set((rsvps ?? []).map((r) => r.event_id));
  const now = Date.now();

  return (events ?? []).map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    startsAt: e.starts_at,
    endsAt: e.ends_at,
    location: e.location,
    isRsvped: rsvpedIds.has(e.id),
    isPast: new Date(e.ends_at ?? e.starts_at).getTime() < now,
  }));
}

export type EventDetail = EventSummary & {
  joinUrl: string | null;
  hasAttended: boolean;
};

export async function getEvent(id: string): Promise<EventDetail | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: event }, { data: rsvp }] = await Promise.all([
    supabase
      .from("events")
      .select("id, title, description, starts_at, ends_at, location, join_url")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("event_rsvps")
      .select("attended")
      .eq("event_id", id)
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (!event) return null;

  const now = Date.now();
  const isPast = new Date(event.ends_at ?? event.starts_at).getTime() < now;
  const isRsvped = !!rsvp;

  return {
    id: event.id,
    title: event.title,
    description: event.description,
    startsAt: event.starts_at,
    endsAt: event.ends_at,
    location: event.location,
    isRsvped,
    isPast,
    // Only handed to members who've actually committed to coming.
    joinUrl: isRsvped ? event.join_url : null,
    hasAttended: rsvp?.attended ?? false,
  };
}
