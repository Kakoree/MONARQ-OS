import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EventTime } from "@/components/events/EventTime";
import { cn } from "@/lib/cn";
import type { EventSummary } from "@/lib/events";

export function EventCard({ event }: { event: EventSummary }) {
  return (
    <Link href={`/events/${event.id}`}>
      <Card
        className={cn(
          "h-full transition-colors hover:border-gold/40",
          event.isPast && "opacity-60"
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-paper">{event.title}</p>
          {event.isRsvped && (
            <Badge className="border-gold/40 text-gold">Going</Badge>
          )}
        </div>
        <p className="mt-1 text-xs text-stone">
          <EventTime iso={event.startsAt} />
        </p>
        <p className="mt-2 text-sm text-stone">{event.description}</p>
      </Card>
    </Link>
  );
}
