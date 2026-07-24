import Link from "next/link";
import { EventTime } from "@/components/events/EventTime";
import { Badge } from "@/components/ui/Badge";
import type { EventSummary } from "@/lib/events";

export function UpcomingEventsPreview({ events }: { events: EventSummary[] }) {
  const upcoming = events.filter((e) => !e.isPast).slice(0, 3);

  if (upcoming.length === 0) {
    return <p className="text-sm text-stone">Nothing scheduled right now.</p>;
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-1">
        {upcoming.map((event) => (
          <li key={event.id}>
            <Link
              href={`/events/${event.id}`}
              className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-surface-raised"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-paper">{event.title}</p>
                <p className="text-xs text-stone">
                  <EventTime iso={event.startsAt} />
                </p>
              </div>
              {event.isRsvped && (
                <Badge className="shrink-0 border-gold/40 text-gold">Going</Badge>
              )}
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/events" className="block text-xs text-stone hover:text-paper">
        View all events →
      </Link>
    </div>
  );
}
