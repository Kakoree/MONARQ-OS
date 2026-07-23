import { rsvpToEvent, cancelRsvp, markAttended } from "../actions";
import { Button } from "@/components/ui/Button";

export function RsvpButton({ eventId }: { eventId: string }) {
  return (
    <form action={rsvpToEvent.bind(null, eventId)}>
      <Button type="submit">RSVP</Button>
    </form>
  );
}

export function CancelRsvpButton({ eventId }: { eventId: string }) {
  return (
    <form action={cancelRsvp.bind(null, eventId)}>
      <Button type="submit" variant="ghost" className="px-0">
        Cancel RSVP
      </Button>
    </form>
  );
}

export function MarkAttendedButton({ eventId }: { eventId: string }) {
  return (
    <form action={markAttended.bind(null, eventId)}>
      <Button type="submit" variant="secondary">
        Mark as attended
      </Button>
    </form>
  );
}
