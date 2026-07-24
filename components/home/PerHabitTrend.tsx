import { cn } from "@/lib/cn";
import type { HabitTrendSeries } from "@/lib/habits";

export function PerHabitTrend({ series }: { series: HabitTrendSeries[] }) {
  return (
    <div className="space-y-3">
      {series.map((habit) => (
        <div key={habit.habitId} className="flex items-center justify-between gap-3">
          <span className="min-w-0 flex-1 truncate text-sm text-paper/80">
            {habit.name}
          </span>
          <div className="flex shrink-0 gap-1">
            {habit.points.map((point) => (
              <div
                key={point.date}
                className={cn(
                  "h-2 w-2 rounded-full",
                  point.completed ? "bg-gold" : "bg-line"
                )}
                title={point.date}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
