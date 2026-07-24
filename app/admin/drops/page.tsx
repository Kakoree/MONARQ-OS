import { getDropsAdmin } from "@/lib/admin";
import { getTiers } from "@/lib/seasons";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { CreateDropForm } from "./CreateDropForm";
import { toggleDropPublished, toggleDropSoldOut } from "./actions";

export default async function AdminDropsPage() {
  const [drops, tiers] = await Promise.all([getDropsAdmin(), getTiers()]);
  const tierById = new Map(tiers.map((t) => [t.id, t]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-paper">Drops</h1>
        <p className="mt-1 text-sm text-stone">
          Tier-gate a drop for early access, or leave it open to everyone.
          Link a key drop to an access code from Access Codes.
        </p>
      </div>

      <CreateDropForm tiers={tiers} />

      {drops.length === 0 ? (
        <Card>
          <p className="text-sm text-stone">No drops yet.</p>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-md border border-line">
          <div className="divide-y divide-line">
            {drops.map((drop) => (
              <div
                key={drop.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div>
                  <p className="text-sm text-paper">
                    {drop.title}
                    {drop.isKeyDrop && (
                      <span className="ml-2 font-sans text-xs text-stone">key drop</span>
                    )}
                  </p>
                  <p className="text-xs text-stone">
                    {drop.priceCents != null && formatPrice(drop.priceCents, drop.currency)}
                    {drop.requiredTierId &&
                      ` · ${tierById.get(drop.requiredTierId)?.name ?? "tier"}+ gets ${drop.earlyAccessHours}h early access`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={cn(!drop.isSoldOut && "border-gold/40 text-gold")}>
                    {drop.isSoldOut ? "Sold out" : "In stock"}
                  </Badge>
                  <form action={toggleDropSoldOut.bind(null, drop.id, !drop.isSoldOut)}>
                    <button type="submit" className="text-xs text-stone hover:text-gold">
                      {drop.isSoldOut ? "Mark available" : "Mark sold out"}
                    </button>
                  </form>
                  <Badge className={cn(drop.isPublished && "border-gold/40 text-gold")}>
                    {drop.isPublished ? "Published" : "Draft"}
                  </Badge>
                  <form action={toggleDropPublished.bind(null, drop.id, !drop.isPublished)}>
                    <button type="submit" className="text-xs text-stone hover:text-gold">
                      {drop.isPublished ? "Unpublish" : "Publish"}
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
