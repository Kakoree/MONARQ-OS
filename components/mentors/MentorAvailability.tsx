"use client";

import { useActionState } from "react";
import {
  publishSlotAction,
  withdrawSlotAction,
  type SlotFormState,
} from "@/app/(app)/mentors/actions";
import type { AvailabilitySlot } from "@/lib/mentors";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

export function MentorAvailability({ slots }: { slots: AvailabilitySlot[] }) {
  const [state, action, pending] = useActionState<SlotFormState, FormData>(
    publishSlotAction,
    undefined
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-medium uppercase tracking-wider text-stone">
          Your availability
        </h2>
        <p className="mt-1 text-sm text-stone">
          Times you publish here are bookable directly — a member picks one
          and it&apos;s confirmed straight away, no back and forth.
        </p>
      </div>

      <Card>
        <form action={action} className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-stone">
              Date &amp; time
            </label>
            <Input name="starts_at" type="datetime-local" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-stone">
              Minutes
            </label>
            <Input
              name="duration_minutes"
              type="number"
              min={1}
              defaultValue={30}
              className="w-24"
            />
          </div>
          <div className="min-w-48 flex-1 space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-stone">
              Join link (optional)
            </label>
            <Input name="join_url" type="url" placeholder="https://..." />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Publishing..." : "Publish slot"}
          </Button>
          {state?.error && <p className="w-full text-sm text-danger">{state.error}</p>}
        </form>
      </Card>

      {slots.length === 0 ? (
        <Card>
          <p className="text-sm text-stone">
            No upcoming times published. Members can still send you an open
            request without one.
          </p>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-md border border-line">
          <div className="divide-y divide-line">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div>
                  <p className="text-sm text-paper">{formatSlot(slot.startsAt)}</p>
                  <p className="text-xs text-stone">
                    {slot.durationMinutes} min
                    {slot.joinUrl && " · link attached"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={cn(slot.isBooked && "border-gold/40 text-gold")}>
                    {slot.isBooked ? "Booked" : "Open"}
                  </Badge>
                  {!slot.isBooked && (
                    <form action={withdrawSlotAction.bind(null, slot.id)}>
                      <button
                        type="submit"
                        className="text-xs text-stone transition-colors hover:text-danger"
                      >
                        Withdraw
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatSlot(startsAt: string): string {
  return new Date(startsAt).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
