-- MONARQ OS — Phase 7: challenges, participation, and XP ledger
-- Run after 0001–0008. Additive only.

create table public.challenges (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  xp_reward integer not null default 50,
  starts_at timestamptz,
  ends_at timestamptz,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  constraint challenges_title_not_blank check (btrim(title) <> ''),
  constraint challenges_xp_reward_positive check (xp_reward > 0)
);

create table public.challenge_participation (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  challenge_id uuid not null references public.challenges (id) on delete cascade,
  joined_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (user_id, challenge_id)
);

create index challenge_participation_user_id_idx on public.challenge_participation (user_id);
create index challenge_participation_challenge_id_idx on public.challenge_participation (challenge_id);

-- Append-only XP ledger. Level is always derived from summing this table
-- (see lib/progression.ts) — never stored directly.
create table public.xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  amount integer not null,
  reason text not null,
  challenge_id uuid references public.challenges (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint xp_events_amount_positive check (amount > 0)
);

create index xp_events_user_id_idx on public.xp_events (user_id);
