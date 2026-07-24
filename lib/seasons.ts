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

// Most recently ended season (by ends_at), for the "last season" recap —
// distinct from getActiveSeason(), which only ever returns the currently
// running one.
export async function getMostRecentEndedSeason(): Promise<Season | null> {
  const seasons = await getAllSeasons();
  const now = new Date().toISOString();
  const ended = seasons
    .filter((s) => s.endsAt < now)
    .sort((a, b) => (a.endsAt < b.endsAt ? 1 : -1));

  return ended[0] ?? null;
}

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

// Points still needed to reach the next tier up, for the Home season
// module's "120 pts to Gold" line. Null once a member has cleared every
// defined tier.
export function pointsToNextTier(
  points: number,
  tiers: Tier[]
): { tier: Tier; pointsNeeded: number } | null {
  const next = tiers.find((t) => t.minPoints > points);
  if (!next) return null;
  return { tier: next, pointsNeeded: next.minPoints - points };
}

export type SeasonLeaderboardEntry = {
  userId: string;
  displayName: string;
  points: number;
  tier: Tier | null;
};

// All-member version of getSeasonPoints — same xp_events-within-window
// math, aggregated instead of scoped to one user. Not filtered to active
// members, matching lib/leaderboard.ts's getLeaderboard() so the season and
// lifetime boards behave consistently with each other.
export async function getSeasonLeaderboard(
  season: Pick<Season, "startsAt" | "endsAt">
): Promise<SeasonLeaderboardEntry[]> {
  const supabase = await createClient();

  const [{ data: xpEvents }, { data: profiles }, tiers] = await Promise.all([
    supabase
      .from("xp_events")
      .select("user_id, amount")
      .gte("created_at", season.startsAt)
      .lte("created_at", season.endsAt),
    supabase.from("profiles").select("id, display_name"),
    getTiers(),
  ]);

  const totals = new Map<string, number>();
  for (const event of xpEvents ?? []) {
    totals.set(event.user_id, (totals.get(event.user_id) ?? 0) + event.amount);
  }

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));

  const entries: SeasonLeaderboardEntry[] = Array.from(totals.entries()).map(
    ([userId, points]) => ({
      userId,
      displayName: nameById.get(userId) ?? "Member",
      points,
      tier: tierForPoints(points, tiers),
    })
  );

  entries.sort((a, b) => b.points - a.points);

  return entries;
}

// Lookup form of getSeasonLeaderboard for call sites annotating many
// members at once (member directory, community feed) without an N+1 query
// per member.
export async function getSeasonTierByUserId(
  season: Pick<Season, "startsAt" | "endsAt">
): Promise<Map<string, Tier | null>> {
  const entries = await getSeasonLeaderboard(season);
  return new Map(entries.map((e) => [e.userId, e.tier]));
}
