import { createClient } from "@/lib/supabase/server";
import { getActiveSeason, getSeasonPoints, getTiers, tierForPoints } from "@/lib/seasons";

export type DropStatus = "locked" | "upcoming" | "live" | "ended" | "sold_out";

export type DropSummary = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  isKeyDrop: boolean;
  priceCents: number | null;
  currency: string;
  externalUrl: string | null;
  status: DropStatus;
  requiredTierName: string | null;
  earlyAccessHours: number;
  publicAvailableFrom: string | null;
  isOwned: boolean;
};

type DropRow = {
  id: string;
  is_sold_out: boolean;
  available_from: string | null;
  available_until: string | null;
  required_tier_id: string | null;
  early_access_hours: number;
};

// A drop's own available_from is when it opens to everyone. If it's
// tier-gated with an early-access window, a qualifying member's effective
// open time is pulled earlier by early_access_hours; a non-qualifying
// member always sees the plain available_from. This is additive to the
// existing upcoming/live/ended/sold-out states, not a replacement — a
// gated drop still eventually opens to the whole club, per the plan's own
// "24-hour early access" framing rather than permanent exclusion.
function computeStatus(
  drop: DropRow,
  memberTierRankIndex: number | null,
  requiredTierRankIndex: number | null
): DropStatus {
  if (drop.is_sold_out) return "sold_out";

  const now = Date.now();
  const publicFrom = drop.available_from ? new Date(drop.available_from).getTime() : null;

  if (publicFrom !== null) {
    const qualifiesEarly =
      requiredTierRankIndex !== null &&
      memberTierRankIndex !== null &&
      memberTierRankIndex >= requiredTierRankIndex;

    const effectiveFrom = qualifiesEarly
      ? publicFrom - drop.early_access_hours * 3_600_000
      : publicFrom;

    if (effectiveFrom > now) {
      // Gated and not yet open even to a qualifying tier, or open to the
      // whole club later than a qualifying member would see it.
      return requiredTierRankIndex !== null && !qualifiesEarly ? "locked" : "upcoming";
    }
  }

  if (drop.available_until && new Date(drop.available_until).getTime() < now) {
    return "ended";
  }

  return "live";
}

async function getMemberTierRankIndex(): Promise<{
  memberTierRankIndex: number | null;
  tierRankIndexById: Map<string, number>;
}> {
  const activeSeason = await getActiveSeason();
  const tiers = await getTiers();
  const tierRankIndexById = new Map(tiers.map((t, index) => [t.id, index]));

  if (!activeSeason) {
    return { memberTierRankIndex: null, tierRankIndexById };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { memberTierRankIndex: null, tierRankIndexById };

  const points = await getSeasonPoints(user.id, activeSeason);
  const tier = tierForPoints(points, tiers);
  const memberTierRankIndex = tier ? (tierRankIndexById.get(tier.id) ?? null) : null;

  return { memberTierRankIndex, tierRankIndexById };
}

const DROP_COLUMNS =
  "id, title, description, image_url, is_key_drop, price_cents, currency, external_url, is_sold_out, available_from, available_until, required_tier_id, early_access_hours";

function publicAvailableFrom(drop: DropRow): string | null {
  return drop.available_from;
}

export async function getDrops(): Promise<DropSummary[] | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: drops }, { memberTierRankIndex, tierRankIndexById }, { data: claims }, tiers] =
    await Promise.all([
      supabase.from("drops").select(DROP_COLUMNS).order("available_from", {
        ascending: true,
        nullsFirst: false,
      }),
      getMemberTierRankIndex(),
      supabase.from("drop_claims").select("drop_id").eq("user_id", user.id),
      getTiers(),
    ]);

  const tierById = new Map(tiers.map((t) => [t.id, t]));
  const claimedDropIds = new Set((claims ?? []).map((c) => c.drop_id));

  return (drops ?? []).map((d) => {
    const requiredTierRankIndex = d.required_tier_id
      ? (tierRankIndexById.get(d.required_tier_id) ?? null)
      : null;

    return {
      id: d.id,
      title: d.title,
      description: d.description,
      imageUrl: d.image_url,
      isKeyDrop: d.is_key_drop,
      priceCents: d.price_cents,
      currency: d.currency,
      externalUrl: d.external_url,
      status: computeStatus(d, memberTierRankIndex, requiredTierRankIndex),
      requiredTierName: d.required_tier_id ? (tierById.get(d.required_tier_id)?.name ?? null) : null,
      earlyAccessHours: d.early_access_hours,
      publicAvailableFrom: publicAvailableFrom(d),
      isOwned: claimedDropIds.has(d.id),
    };
  });
}

export async function getDrop(id: string): Promise<DropSummary | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: drop }, { memberTierRankIndex, tierRankIndexById }, { data: claim }, tiers] =
    await Promise.all([
      supabase.from("drops").select(DROP_COLUMNS).eq("id", id).maybeSingle(),
      getMemberTierRankIndex(),
      supabase
        .from("drop_claims")
        .select("id")
        .eq("user_id", user.id)
        .eq("drop_id", id)
        .maybeSingle(),
      getTiers(),
    ]);

  if (!drop) return null;

  const tierById = new Map(tiers.map((t) => [t.id, t]));
  const requiredTierRankIndex = drop.required_tier_id
    ? (tierRankIndexById.get(drop.required_tier_id) ?? null)
    : null;

  return {
    id: drop.id,
    title: drop.title,
    description: drop.description,
    imageUrl: drop.image_url,
    isKeyDrop: drop.is_key_drop,
    priceCents: drop.price_cents,
    currency: drop.currency,
    externalUrl: drop.external_url,
    status: computeStatus(drop, memberTierRankIndex, requiredTierRankIndex),
    requiredTierName: drop.required_tier_id
      ? (tierById.get(drop.required_tier_id)?.name ?? null)
      : null,
    earlyAccessHours: drop.early_access_hours,
    publicAvailableFrom: publicAvailableFrom(drop),
    isOwned: !!claim,
  };
}

export type OwnedDrop = {
  dropId: string;
  title: string;
  imageUrl: string | null;
  isKeyDrop: boolean;
  claimedAt: string;
};

export async function getOwnedDrops(userId: string): Promise<OwnedDrop[]> {
  const supabase = await createClient();

  const { data: claims } = await supabase
    .from("drop_claims")
    .select("drop_id, claimed_at")
    .eq("user_id", userId)
    .order("claimed_at", { ascending: false });

  if (!claims || claims.length === 0) return [];

  const dropIds = claims.map((c) => c.drop_id);
  const { data: drops } = await supabase
    .from("drops")
    .select("id, title, image_url, is_key_drop")
    .in("id", dropIds);

  const dropById = new Map((drops ?? []).map((d) => [d.id, d]));

  return claims
    .filter((c) => dropById.has(c.drop_id))
    .map((c) => {
      const drop = dropById.get(c.drop_id)!;
      return {
        dropId: c.drop_id,
        title: drop.title,
        imageUrl: drop.image_url,
        isKeyDrop: drop.is_key_drop,
        claimedAt: c.claimed_at,
      };
    });
}
