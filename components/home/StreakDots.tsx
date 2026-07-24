import { cn } from "@/lib/cn";
import type { CompletionTrendPoint } from "@/lib/habits";

const DAY_INITIALS = ["S", "M", "T", "W", "T", "F", "S"];

export function StreakDots({ days }: { days: CompletionTrendPoint[] }) {
  return (
    <div className="flex gap-1.5">
      {days.map((d) => {
        const date = new Date(`${d.date}T00:00:00Z`);
        const complete = d.rate >= 100;
        return (
          <div key={d.date} className="flex flex-col items-center gap-1">
            <div
              className={cn("h-2 w-2 rounded-full", complete ? "bg-gold" : "bg-line")}
            />
            <span className="text-[9px] text-stone">
              {DAY_INITIALS[date.getUTCDay()]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
