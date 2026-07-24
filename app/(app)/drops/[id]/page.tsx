import { notFound } from "next/navigation";
import { getDrop } from "@/lib/drops";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { buttonClassName } from "@/components/ui/buttonClassName";
import { formatPrice } from "@/lib/format";
import type { DropStatus } from "@/lib/drops";

const STATUS_LABEL: Record<DropStatus, string> = {
  upcoming: "Upcoming",
  live: "Available",
  ended: "Ended",
  sold_out: "Sold out",
};

export default async function DropDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const drop = await getDrop(id);

  if (!drop) {
    notFound();
  }

  const canShop = drop.status === "live" && !!drop.externalUrl;

  return (
    <div className="max-w-2xl space-y-6">
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

      <div>
        <div className="flex items-center gap-3">
          <h1 className="font-display text-3xl text-paper">{drop.title}</h1>
          {drop.isKeyDrop && (
            <Badge className="border-gold/40 text-gold">Key drop</Badge>
          )}
        </div>
        <div className="mt-2 flex items-center gap-3">
          {drop.priceCents != null && (
            <span className="text-sm text-paper">
              {formatPrice(drop.priceCents, drop.currency)}
            </span>
          )}
          <Badge>{STATUS_LABEL[drop.status]}</Badge>
        </div>
      </div>

      <Card>
        <p className="whitespace-pre-wrap text-sm text-paper/90">
          {drop.description}
        </p>
      </Card>

      {drop.isKeyDrop && (
        <Card>
          <p className="text-sm text-stone">
            Key drops include an access code. You&apos;ll receive it after
            purchase — redeem it the same way any invite code is redeemed to
            activate membership access.
          </p>
        </Card>
      )}

      <Card>
        {canShop ? (
          <a
            href={drop.externalUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClassName("primary", "w-full")}
          >
            Shop this drop →
          </a>
        ) : (
          <p className="text-sm text-stone">
            {drop.status === "upcoming" && "This drop isn't available yet."}
            {drop.status === "ended" && "This drop has ended."}
            {drop.status === "sold_out" && "This drop is sold out."}
            {drop.status === "live" &&
              !drop.externalUrl &&
              "No purchase link is set for this drop yet."}
          </p>
        )}
      </Card>
    </div>
  );
}
