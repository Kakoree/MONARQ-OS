import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";
import type { LeaderboardEntry } from "@/lib/leaderboard";

export function LeaderboardPreview({
  entries,
  currentUserId,
}: {
  entries: LeaderboardEntry[];
  currentUserId: string | null;
}) {
  if (entries.length === 0) {
    return <p className="text-sm text-stone">No one has earned XP yet.</p>;
  }

  const top = entries.slice(0, 5);
  const selfIndex = entries.findIndex((e) => e.userId === currentUserId);
  const selfInTop = selfIndex >= 0 && selfIndex < 5;

  return (
    <div className="space-y-3">
      <ul className="space-y-1">
        {top.map((entry, index) => (
          <li
            key={entry.userId}
            className={cn(
              "flex items-center gap-3 rounded-md px-2 py-1.5",
              entry.userId === currentUserId && "bg-surface-raised"
            )}
          >
            <span className="w-4 text-xs text-stone">{index + 1}</span>
            <Avatar url={null} name={entry.displayName} size={28} />
            <span className="flex-1 truncate text-sm text-paper">
              {entry.displayName}
            </span>
            <span className="text-xs text-gold">{entry.totalXp} XP</span>
          </li>
        ))}
      </ul>
      {!selfInTop && selfIndex >= 0 && (
        <div className="flex items-center justify-between rounded-md border border-gold/30 bg-gold-dim px-3 py-2 text-sm">
          <span className="text-gold">Your rank — #{selfIndex + 1}</span>
          <span className="text-gold">{entries[selfIndex].totalXp} XP</span>
        </div>
      )}
      <Link href="/leaderboard" className="block text-xs text-stone hover:text-paper">
        View full leaderboard →
      </Link>
    </div>
  );
}
