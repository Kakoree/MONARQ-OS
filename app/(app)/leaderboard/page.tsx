import { getLeaderboard } from "@/lib/leaderboard";
import { getCurrentMembership } from "@/lib/membership";
import {
  getActiveSeason,
  getMostRecentEndedSeason,
  getSeasonLeaderboard,
} from "@/lib/seasons";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/cn";

export default async function LeaderboardPage() {
  const [entries, { user }, activeSeason, endedSeason] = await Promise.all([
    getLeaderboard(),
    getCurrentMembership(),
    getActiveSeason(),
    getMostRecentEndedSeason(),
  ]);

  if (!entries) {
    return null;
  }

  const seasonEntries = activeSeason ? await getSeasonLeaderboard(activeSeason) : null;
  const recapEntries =
    endedSeason && endedSeason.id !== activeSeason?.id
      ? await getSeasonLeaderboard(endedSeason)
      : null;
  const recapRank = recapEntries
    ? recapEntries.findIndex((e) => e.userId === user?.id)
    : -1;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-paper">Leaderboard</h1>
        <p className="mt-1 text-sm text-stone">
          Rank is earned through consistency, not noise.
        </p>
      </div>

      {recapEntries && recapRank >= 0 && (
        <Card className="border-gold/40">
          <p className="text-xs uppercase tracking-wider text-stone">
            Last season · {endedSeason!.name}
          </p>
          <p className="mt-2 text-sm text-paper">
            You finished #{recapRank + 1}
            {recapEntries[recapRank].tier && (
              <> at {recapEntries[recapRank].tier!.name}</>
            )}{" "}
            with {recapEntries[recapRank].points} points.
          </p>
        </Card>
      )}

      {activeSeason && seasonEntries && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-medium uppercase tracking-wider text-stone">
              This season · {activeSeason.name}
            </h2>
            <p className="text-xs text-stone">
              Ends {new Date(activeSeason.endsAt).toLocaleDateString("en-US")}
            </p>
          </div>
          {seasonEntries.length === 0 ? (
            <Card>
              <p className="text-sm text-stone">
                No one has earned points this season yet.
              </p>
            </Card>
          ) : (
            <div className="overflow-hidden rounded-md border border-line">
              <div className="divide-y divide-line">
                {seasonEntries.map((entry, index) => {
                  const isSelf = entry.userId === user?.id;
                  return (
                    <Reveal key={entry.userId} delay={index * 0.02}>
                      <div
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
                          {entry.tier && (
                            <Badge className="border-gold/40 text-gold">
                              {entry.tier.name}
                            </Badge>
                          )}
                          <span className="font-display text-lg text-gold">
                            {entry.points} pts
                          </span>
                        </div>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        {activeSeason && (
          <h2 className="text-sm font-medium uppercase tracking-wider text-stone">
            Lifetime
          </h2>
        )}
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
                  <Reveal key={entry.userId} delay={index * 0.02}>
                    <div
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
                  </Reveal>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
