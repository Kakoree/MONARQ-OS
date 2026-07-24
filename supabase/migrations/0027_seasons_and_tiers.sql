-- MONARQ OS — V2 Phase 1: seasonal tier schema
-- Run after 0001–0026. Additive only.
--
-- This is deliberately schema-only. A member's tier is *computed* from
-- xp_events within the active season's date range (min_points threshold),
-- the same way Level is computed from lifetime XP in lib/progression.ts —
-- never stored. Season leaderboard UI, challenge-to-season scoring, and the
-- admin season/tier management screens are V2 Phase 4, not here.

create table public.seasons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  constraint seasons_name_not_blank check (btrim(name) <> ''),
  constraint seasons_dates_valid check (ends_at > starts_at)
);

create index seasons_is_active_idx on public.seasons (is_active);

create table public.tiers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  min_points integer not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint tiers_name_not_blank check (btrim(name) <> ''),
  constraint tiers_min_points_non_negative check (min_points >= 0)
);

create index tiers_sort_order_idx on public.tiers (sort_order);

alter table public.seasons enable row level security;
alter table public.tiers enable row level security;

create policy "seasons_select_active_member"
  on public.seasons for select
  using (
    exists (
      select 1 from public.memberships
      where user_id = auth.uid() and status = 'active'
    )
  );

create policy "seasons_admin_all"
  on public.seasons for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "tiers_select_active_member"
  on public.tiers for select
  using (
    exists (
      select 1 from public.memberships
      where user_id = auth.uid() and status = 'active'
    )
  );

create policy "tiers_admin_all"
  on public.tiers for all
  using (public.is_admin())
  with check (public.is_admin());
