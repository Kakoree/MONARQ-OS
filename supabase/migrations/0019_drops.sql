-- MONARQ OS — Phase 11: drops (display-only, no payment processing)
-- Run after 0001–0018. Additive only.
--
-- No purchases table and no linkage column to access_codes — key drops
-- reuse the existing redemption system operationally (an admin creates a
-- code and communicates it after an external purchase), not through a new
-- database entitlement path. is_sold_out is a manual admin flag; there is
-- no real inventory tracking since there is no payment integration to drive it.

create table public.drops (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  image_url text,
  is_key_drop boolean not null default false,
  price_cents integer,
  currency text not null default 'USD',
  external_url text,
  is_sold_out boolean not null default false,
  available_from timestamptz,
  available_until timestamptz,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  constraint drops_title_not_blank check (btrim(title) <> ''),
  constraint drops_price_cents_non_negative check (price_cents is null or price_cents >= 0)
);

create index drops_available_from_idx on public.drops (available_from);
