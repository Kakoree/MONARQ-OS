import { createClient } from "@/lib/supabase/server";

export type Season = {
  id: string;
  name: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
};

export type Tier = {
  id: string;
  name: string;
  minPoints: number;
  sortOrder: number;
};

export async function getAllSeasons(): Promise<Season[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("seasons")
    .select("id, name, starts_at, ends_at, is_active")
    .order("starts_at", { ascending: false });

  return (data ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    startsAt: s.starts_at,
    endsAt: s.ends_at,
    isActive: s.is_active,
  }));
}

export async function getActiveSeason(): Promise<Season | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("seasons")
    .select("id, name, starts_at, ends_at, is_active")
    .eq("is_active", true)
    .maybeSingle();

  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    startsAt: data.starts_at,
    endsAt: data.ends_at,
    isActive: data.is_active,
  };
}

export async function getTiers(): Promise<Tier[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tiers")
    .select("id, name, min_points, sort_order")
    .order("sort_order", { ascending: true });

  return (data ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    minPoints: t.min_points,
    sortOrder: t.sort_order,
  }));
}

// Points are computed from xp_events within the season's date range, not
// stored separately — same reasoning as lib/progression.ts deriving Level
// from lifetime XP rather than persisting it.
export async function getSeasonPoints(
  userId: string,
  season: Pick<Season, "startsAt" | "endsAt">
): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("xp_events")
    .select("amount")
    .eq("user_id", userId)
    .gte("created_at", season.startsAt)
    .lte("created_at", season.endsAt);

  return (data ?? []).reduce((sum, e) => sum + e.amount, 0);
}

// Highest tier whose threshold the points have cleared. `tiers` must be
// sorted ascending by minPoints (getTiers() already orders by sort_order,
// which is expected to agree with minPoints ordering).
export function tierForPoints(points: number, tiers: Tier[]): Tier | null {
  let current: Tier | null = null;
  for (const tier of tiers) {
    if (points >= tier.minPoints) {
      current = tier;
    }
  }
  return current;
}
