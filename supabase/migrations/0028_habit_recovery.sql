-- MONARQ OS — V2 Phase 1: habit recovery schema
-- Run after 0001–0027. Additive only.
--
-- Schema-only, matching the same boundary as 0027. This is a ledger of
-- grace tokens (a streak-freeze a member can spend to save a missed day),
-- append-only in spirit like xp_events. The actual granting rules (e.g.
-- "earn one every 7-day streak"), the missed-day recovery flow, and
-- at-risk detection are V2 Phase 3 — including the security-definer
-- functions that will grant and consume tokens. No write policy exists yet
-- for the same reason: Phase 3 owns those business rules, not Phase 1.

create table public.habit_grace_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  source text not null,
  granted_at timestamptz not null default now(),
  consumed_at timestamptz,
  consumed_for_date date,
  constraint habit_grace_tokens_source_not_blank check (btrim(source) <> '')
);

create index habit_grace_tokens_user_id_idx on public.habit_grace_tokens (user_id);

alter table public.habit_grace_tokens enable row level security;

create policy "habit_grace_tokens_select_own"
  on public.habit_grace_tokens for select
  using (user_id = auth.uid());
