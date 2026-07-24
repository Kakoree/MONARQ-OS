import { getAllSeasons, getTiers } from "@/lib/seasons";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { CreateSeasonForm } from "./CreateSeasonForm";
import { CreateTierForm } from "./CreateTierForm";
import { setActiveSeason, deactivateAllSeasons } from "./actions";

export default async function AdminSeasonsPage() {
  const [seasons, tiers] = await Promise.all([getAllSeasons(), getTiers()]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl text-paper">Seasons &amp; Tiers</h1>
        <p className="mt-1 text-sm text-stone">
          Schema for V2&apos;s seasonal ranking layer. Season leaderboards and
          member-facing tier surfacing ship in a later phase — this defines
          the data admin will configure against.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-wider text-stone">
          Seasons
        </h2>
        <CreateSeasonForm />
        {seasons.length === 0 ? (
          <Card>
            <p className="text-sm text-stone">No seasons yet.</p>
          </Card>
        ) : (
          <div className="overflow-hidden rounded-md border border-line">
            <div className="divide-y divide-line">
              {seasons.map((season) => (
                <div
                  key={season.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                >
                  <div>
                    <p className="text-sm text-paper">{season.name}</p>
                    <p className="text-xs text-stone">
                      {new Date(season.startsAt).toLocaleDateString("en-US")} –{" "}
                      {new Date(season.endsAt).toLocaleDateString("en-US")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={cn(season.isActive && "border-gold/40 text-gold")}>
                      {season.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {season.isActive ? (
                      <form action={deactivateAllSeasons}>
                        <button
                          type="submit"
                          className="text-xs text-stone transition-colors hover:text-danger"
                        >
                          Deactivate
                        </button>
                      </form>
                    ) : (
                      <form action={setActiveSeason.bind(null, season.id)}>
                        <button
                          type="submit"
                          className="text-xs text-stone transition-colors hover:text-gold"
                        >
                          Activate
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-wider text-stone">
          Tiers
        </h2>
        <CreateTierForm />
        {tiers.length === 0 ? (
          <Card>
            <p className="text-sm text-stone">No tiers yet.</p>
          </Card>
        ) : (
          <div className="overflow-hidden rounded-md border border-line">
            <div className="divide-y divide-line">
              {tiers.map((tier) => (
                <div
                  key={tier.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <p className="text-sm text-paper">{tier.name}</p>
                  <p className="text-xs text-stone">{tier.minPoints}+ points</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
