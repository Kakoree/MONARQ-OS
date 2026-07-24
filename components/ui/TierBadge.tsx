import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import type { Tier } from "@/lib/seasons";

// Renders nothing when there's no active season or the member hasn't
// cleared the first tier yet — a badge that can render "Unranked" everywhere
// would cheapen the ones that mean something, and status here is supposed
// to be earned and visible, not manufactured.
export function TierBadge({
  tier,
  className,
}: {
  tier: Tier | null | undefined;
  className?: string;
}) {
  if (!tier) return null;

  return (
    <Badge className={cn("border-gold/40 text-gold", className)}>
      {tier.name}
    </Badge>
  );
}
