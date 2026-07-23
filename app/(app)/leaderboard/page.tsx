import { getLeaderboard } from "@/lib/leaderboard";
import { getCurrentMembership } from "@/lib/membership";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

export default async function LeaderboardPage() {
  const [entries, { user }] = await Promise.all([
    getLeaderboard(),
    getCurrentMembership(),
  ]);

  if (!entries) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-paper">Leaderboard</h1>
        <p className="mt-1 text-sm text-stone">
          Rank is earned through consistency, not noise.
        </p>
      </div>

      {entries.length === 0 ? (
        <Card>
          <p className="text-sm text-stone">No one has earned XP yet.</p>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-md border border-line">
          <div className="divide-y divide-line">
            {entries.map((entry, index) => {
              const isSelf = entry.userId === user?.id;
              return (
                <div
                  key={entry.userId}
                  className={cn(
                    "flex items-center justify-between px-6 py-4",
                    isSelf ? "bg-surface-raised" : "bg-surface"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <span className="w-6 text-sm text-stone">
                      {index + 1}
                    </span>
                    <span
                      className={cn(
                        "text-sm",
                        isSelf ? "text-gold" : "text-paper"
                      )}
                    >
                      {entry.displayName}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs uppercase tracking-wider text-stone">
                      Level {entry.level}
                    </span>
                    <span className="font-display text-lg text-gold">
                      {entry.totalXp} XP
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
