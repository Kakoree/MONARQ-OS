import { TierBadge } from "@/components/ui/TierBadge";
import type { Season, Tier } from "@/lib/seasons";

export function SeasonModule({
  season,
  points,
  tier,
  nextTier,
}: {
  season: Season;
  points: number;
  tier: Tier | null;
  nextTier: { tier: Tier; pointsNeeded: number } | null;
}) {
  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(season.endsAt).getTime() - new Date().getTime()) / 86_400_000
    )
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-sm text-paper">{season.name}</p>
        <p className="mt-1 text-xs text-stone">
          {daysLeft > 0 ? `${daysLeft} days left` : "Ending today"} ·{" "}
          {points} pts this season
        </p>
      </div>
      <div className="flex items-center gap-3">
        {tier ? (
          <TierBadge tier={tier} />
        ) : (
          <span className="text-xs text-stone">Unranked</span>
        )}
        {nextTier && (
          <span className="text-xs text-stone">
            {nextTier.pointsNeeded} pts to {nextTier.tier.name}
          </span>
        )}
      </div>
    </div>
  );
}
