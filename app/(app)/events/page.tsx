import { getEvents } from "@/lib/events";
import { Card } from "@/components/ui/Card";
import { EventCard } from "@/components/events/EventCard";

export default async function EventsPage() {
  const events = await getEvents();

  if (!events) {
    return null;
  }

  const upcoming = events.filter((e) => !e.isPast);
  const past = events.filter((e) => e.isPast);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-paper">Events</h1>
        <p className="mt-1 text-sm text-stone">
          Live calls and gatherings inside MONARQ.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-wider text-stone">
          Upcoming
        </h2>
        {upcoming.length === 0 ? (
          <Card>
            <p className="text-sm text-stone">
              Nothing scheduled right now.
            </p>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {upcoming.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>

      {past.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-medium uppercase tracking-wider text-stone">
            Past
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {past.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
