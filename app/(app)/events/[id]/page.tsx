import { notFound } from "next/navigation";
import { getEvent } from "@/lib/events";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EventTime } from "@/components/events/EventTime";
import { RsvpButton, CancelRsvpButton, MarkAttendedButton } from "./ActionButtons";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEvent(id);

  if (!event) {
    notFound();
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="font-display text-3xl text-paper">{event.title}</h1>
          {event.isPast && <Badge>Past</Badge>}
        </div>
        <p className="mt-2 text-sm text-stone">
          <EventTime iso={event.startsAt} />
        </p>
        {event.location && (
          <p className="mt-1 text-sm text-stone">{event.location}</p>
        )}
      </div>

      <Card>
        <p className="whitespace-pre-wrap text-sm text-paper/90">
          {event.description}
        </p>
      </Card>

      <Card className="space-y-3">
        {!event.isRsvped ? (
          event.isPast ? (
            <p className="text-sm text-stone">
              This event has already happened.
            </p>
          ) : (
            <>
              <p className="text-sm text-stone">
                RSVP to get access to the join link.
              </p>
              <RsvpButton eventId={event.id} />
            </>
          )
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gold">You&apos;re going.</p>
            {event.joinUrl && !event.isPast && (
              <a
                href={event.joinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-gold hover:underline"
              >
                Join link →
              </a>
            )}
            {event.isPast && !event.hasAttended && (
              <MarkAttendedButton eventId={event.id} />
            )}
            {event.isPast && event.hasAttended && (
              <p className="text-xs uppercase tracking-wider text-stone">
                Attended
              </p>
            )}
            {!event.isPast && <CancelRsvpButton eventId={event.id} />}
          </div>
        )}
      </Card>
    </div>
  );
}
