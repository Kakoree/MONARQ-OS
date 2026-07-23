-- MONARQ OS — Phase 7: RLS for challenges, participation, and XP
-- Run after 0009_challenges.sql.

alter table public.challenges enable row level security;
alter table public.challenge_participation enable row level security;
alter table public.xp_events enable row level security;

create policy "challenges_select_active_member"
  on public.challenges for select
  using (
    is_published
    and exists (
      select 1 from public.memberships
      where user_id = auth.uid() and status = 'active'
    )
  );

create policy "challenges_admin_all"
  on public.challenges for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "challenge_participation_select_own_or_admin"
  on public.challenge_participation for select
  using (user_id = auth.uid() or public.is_admin());

-- Joining is low-risk bookkeeping (no reward), so it's a plain self-service
-- insert. Completing is not — completed_at has no user-facing update policy
-- at all; it can only be set by complete_challenge(), which also grants the
-- XP atomically. See 0011_complete_challenge_function.sql.
create policy "challenge_participation_insert_own"
  on public.challenge_participation for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.challenges c
      where c.id = challenge_id and c.is_published
    )
  );

create policy "challenge_participation_admin_all"
  on public.challenge_participation for all
  using (public.is_admin())
  with check (public.is_admin());

-- xp_events: readable by any active member — a leaderboard is inherently
-- about visible standing, same reasoning as the profiles visibility change
-- in 0012. Writable only by complete_challenge() (security definer, bypasses
-- RLS) or an admin directly — never a direct client insert.
create policy "xp_events_select_active_member"
  on public.xp_events for select
  using (
    exists (
      select 1 from public.memberships
      where user_id = auth.uid() and status = 'active'
    )
  );

create policy "xp_events_admin_all"
  on public.xp_events for all
  using (public.is_admin())
  with check (public.is_admin());
