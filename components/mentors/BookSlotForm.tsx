"use client";

import { useActionState, useState } from "react";
import { bookSlotAction, type SlotFormState } from "@/app/(app)/mentors/actions";
import type { AvailabilitySlot } from "@/lib/mentors";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export function BookSlotForm({
  mentorId,
  slots,
}: {
  mentorId: string;
  slots: AvailabilitySlot[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const boundAction = bookSlotAction.bind(null, selectedId ?? "", mentorId);
  const [state, action, pending] = useActionState<SlotFormState, FormData>(
    boundAction,
    undefined
  );

  if (state?.success) {
    return (
      <p className="text-sm text-gold">
        Booked. It&apos;s confirmed and on your list under Mentors.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wider text-stone">Open times</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {slots.map((slot) => {
            const isSelected = slot.id === selectedId;
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => setSelectedId(isSelected ? null : slot.id)}
                className={cn(
                  "rounded-md border px-3 py-2 text-left text-sm transition-colors",
                  isSelected
                    ? "border-gold/60 text-gold"
                    : "border-line text-paper/80 hover:border-gold/40 hover:text-paper"
                )}
              >
                <span className="block">{formatSlot(slot.startsAt)}</span>
                <span className="block text-xs text-stone">
                  {slot.durationMinutes} min
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedId && (
        <form action={action} className="space-y-3">
          <Textarea
            name="message"
            placeholder="Anything they should know beforehand? (optional)"
            rows={3}
          />
          <Button type="submit" disabled={pending}>
            {pending ? "Booking..." : "Book this time"}
          </Button>
          {state?.error && <p className="text-sm text-danger">{state.error}</p>}
        </form>
      )}
    </div>
  );
}

// Rendered client-side on purpose: starts_at is an instant, so this shows
// each member the time in their own timezone without the schema ever
// needing to know what that is.
function formatSlot(startsAt: string): string {
  return new Date(startsAt).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
