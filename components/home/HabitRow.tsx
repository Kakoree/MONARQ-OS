import { toggleCheckIn, removeHabit } from "@/app/(app)/home/actions";
import type { HabitWithStatus } from "@/lib/habits";
import { cn } from "@/lib/cn";

export function HabitRow({ habit }: { habit: HabitWithStatus }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-line px-4 py-3">
      <form
        action={toggleCheckIn.bind(null, habit.id)}
        className="flex flex-1 items-center gap-3"
      >
        <button
          type="submit"
          aria-pressed={habit.completedToday}
          aria-label={
            habit.completedToday
              ? `Mark ${habit.name} as not done today`
              : `Mark ${habit.name} as done today`
          }
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded border text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ink",
            habit.completedToday
              ? "border-gold bg-gold-dim text-gold"
              : "border-line text-transparent hover:border-gold/60"
          )}
        >
          ✓
        </button>
        <span
          className={cn(
            "text-sm",
            habit.completedToday ? "text-paper" : "text-paper/80"
          )}
        >
          {habit.name}
        </span>
      </form>
      <form action={removeHabit.bind(null, habit.id)}>
        <button
          type="submit"
          className="text-xs text-stone transition-colors hover:text-danger focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold"
        >
          Remove
        </button>
      </form>
    </div>
  );
}
