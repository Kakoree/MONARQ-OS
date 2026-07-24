import { formatRelativeTime } from "@/lib/format";
import type { ChallengeSummary } from "@/lib/challenges";

export function MilestonesList({ challenges }: { challenges: ChallengeSummary[] }) {
  const completed = challenges
    .filter((c) => c.isCompleted && c.completedAt)
    .sort(
      (a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
    )
    .slice(0, 5);

  if (completed.length === 0) {
    return (
      <p className="text-sm text-stone">
        No milestones yet — complete a challenge to start your timeline.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {completed.map((c) => (
        <li key={c.id} className="flex items-center justify-between gap-3 text-sm">
          <div className="min-w-0">
            <p className="truncate text-paper">{c.title}</p>
            <p className="text-xs text-stone">{formatRelativeTime(c.completedAt!)}</p>
          </div>
          <span className="shrink-0 text-xs text-gold">+{c.xpReward} XP</span>
        </li>
      ))}
    </ul>
  );
}
