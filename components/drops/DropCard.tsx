"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { InteractiveCard } from "@/components/motion/InteractiveCard";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { DropSummary } from "@/lib/drops";

const STATUS_LABEL: Record<DropSummary["status"], string> = {
  locked: "Tier-gated",
  upcoming: "Upcoming",
  live: "Available",
  ended: "Ended",
  sold_out: "Sold out",
};

export function DropCard({ drop }: { drop: DropSummary }) {
  const isInactive =
    drop.status === "ended" || drop.status === "sold_out" || drop.status === "locked";

  return (
    <InteractiveCard className="h-full">
      <Link href={`/drops/${drop.id}`}>
        <Card
          className={cn(
            "h-full space-y-3 transition-colors hover:border-gold/40",
            isInactive && "opacity-60"
          )}
        >
          {drop.imageUrl && (
            <div className="aspect-square overflow-hidden rounded-md border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-provided external URLs, not a first-party host suitable for next/image's remotePatterns allowlist */}
              <img
                src={drop.imageUrl}
                alt={drop.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-paper">{drop.title}</p>
            <div className="flex shrink-0 gap-1.5">
              {drop.isOwned && (
                <Badge className="border-gold/40 text-gold">Owned</Badge>
              )}
              {drop.isKeyDrop && <Badge>Key drop</Badge>}
            </div>
          </div>
          <p className="line-clamp-2 text-sm text-stone">{drop.description}</p>
          {drop.requiredTierName && (
            <p className="text-xs text-stone">
              {drop.requiredTierName}+ get {drop.earlyAccessHours}h early access
            </p>
          )}
          <div className="flex items-center justify-between">
            {drop.priceCents != null && (
              <span className="text-sm text-paper">
                {formatPrice(drop.priceCents, drop.currency)}
              </span>
            )}
            <Badge>{STATUS_LABEL[drop.status]}</Badge>
          </div>
        </Card>
      </Link>
    </InteractiveCard>
  );
}
