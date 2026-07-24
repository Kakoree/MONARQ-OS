"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { toggleCheckIn, removeHabit } from "@/app/(app)/home/actions";
import { HoldButton } from "@/components/kokonutui/HoldButton";
import type { HabitWithStatus } from "@/lib/habits";
import { cn } from "@/lib/cn";

export function HabitRow({ habit }: { habit: HabitWithStatus }) {
  const removeFormRef = useRef<HTMLFormElement>(null);

  return (
    <div className="flex items-center justify-between rounded-md border border-line px-4 py-3">
      <form
        action={toggleCheckIn.bind(null, habit.id)}
        className="flex flex-1 items-center gap-3"
      >
        <motion.button
          type="submit"
          whileTap={{ scale: 0.9 }}
          aria-pressed={habit.completedToday}
          aria-label={
            habit.completedToday
              ? `Mark ${habit.name} as not done today`
              : `Mark ${habit.name} as done today`
          }
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ink",
            habit.completedToday
              ? "border-gold bg-gold-dim text-gold"
              : "border-line hover:border-gold/60"
          )}
        >
          <motion.svg viewBox="0 0 16 16" className="h-3 w-3" initial={false}>
            <motion.path
              d="M3 8.5L6.5 12L13 4.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={false}
              animate={{
                pathLength: habit.completedToday ? 1 : 0,
                opacity: habit.completedToday ? 1 : 0,
              }}
              transition={{ duration: 0.25, ease: [0.65, 0, 0.35, 1] }}
            />
          </motion.svg>
        </motion.button>
        <span
          className={cn(
            "text-sm",
            habit.completedToday ? "text-paper" : "text-paper/80"
          )}
        >
          {habit.name}
        </span>
      </form>
      <form ref={removeFormRef} action={removeHabit.bind(null, habit.id)}>
        <HoldButton
          idleLabel="Remove"
          holdingLabel="Keep holding…"
          onConfirm={() => removeFormRef.current?.requestSubmit()}
        />
      </form>
    </div>
  );
}
