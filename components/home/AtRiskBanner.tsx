import { recoverMissedDay } from "@/app/(app)/home/actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function AtRiskBanner({
  atRisk,
  streak,
  graceTokensAvailable,
  recoverableDates,
}: {
  atRisk: boolean;
  streak: number;
  graceTokensAvailable: number;
  recoverableDates: string[];
}) {
  const showRecovery = graceTokensAvailable > 0 && recoverableDates.length > 0;

  if (!atRisk && !showRecovery) {
    return null;
  }

  return (
    <Card className="border-gold/40">
      {atRisk && (
        <p className="text-sm text-paper">
          Your {streak}-day streak is on the line — you haven&apos;t checked in
          today.
        </p>
      )}
      {showRecovery && (
        <div className={atRisk ? "mt-3" : undefined}>
          <p className="text-xs uppercase tracking-wider text-stone">
            Recover a missed day · {graceTokensAvailable} grace token
            {graceTokensAvailable === 1 ? "" : "s"} available
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {recoverableDates.map((date) => (
              <form key={date} action={recoverMissedDay.bind(null, date)}>
                <Button type="submit" variant="secondary" className="px-3 py-1.5 text-xs">
                  Recover {formatShortDate(date)}
                </Button>
              </form>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function formatShortDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
