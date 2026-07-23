-- MONARQ OS — Phase 10: events and RSVPs
-- Run after 0001–0016. Additive only.

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  join_url text,
  location text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  constraint events_title_not_blank check (btrim(title) <> '')
);

create index events_starts_at_idx on public.events (starts_at);

create table public.event_rsvps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  event_id uuid not null references public.events (id) on delete cascade,
  rsvped_at timestamptz not null default now(),
  attended boolean not null default false,
  unique (user_id, event_id)
);

create index event_rsvps_user_id_idx on public.event_rsvps (user_id);
create index event_rsvps_event_id_idx on public.event_rsvps (event_id);
