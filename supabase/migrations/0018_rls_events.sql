-- MONARQ OS — Phase 10: RLS for events and RSVPs
-- Run after 0017_events.sql.

alter table public.events enable row level security;
alter table public.event_rsvps enable row level security;

create policy "events_select_active_member"
  on public.events for select
  using (
    is_published
    and exists (
      select 1 from public.memberships
      where user_id = auth.uid() and status = 'active'
    )
  );

create policy "events_admin_all"
  on public.events for all
  using (public.is_admin())
  with check (public.is_admin());

-- RSVPs stay private (own + admin only) — no public attendee list in v1,
-- unlike xp_events, which is deliberately visible for the leaderboard.
create policy "event_rsvps_select_own_or_admin"
  on public.event_rsvps for select
  using (user_id = auth.uid() or public.is_admin());

create policy "event_rsvps_insert_own"
  on public.event_rsvps for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.events e
      where e.id = event_id and e.is_published
    )
  );

-- Covers the "mark attended" self-report toggle. No reward is attached to
-- this (unlike challenge completion), so plain RLS is sufficient — the app
-- only exposes the control once the event's end time has passed.
create policy "event_rsvps_update_own"
  on public.event_rsvps for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "event_rsvps_delete_own"
  on public.event_rsvps for delete
  using (user_id = auth.uid());

create policy "event_rsvps_admin_all"
  on public.event_rsvps for all
  using (public.is_admin())
  with check (public.is_admin());
