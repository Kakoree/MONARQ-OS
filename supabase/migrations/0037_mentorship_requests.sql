-- MONARQ OS — V2 Phase 7: mentorship request capture
-- Run after 0001–0036.
--
-- Schema built forward for Phase 8 (session request → confirmed → completed,
-- mentor admin panel, mentor analytics) so that phase extends this table
-- rather than replacing it — same "schema now, behavior later" pattern
-- Phase 1 used for seasons/tiers ahead of Phase 4. Phase 7 itself only ever
-- creates 'pending' rows (interest capture, no booking engine yet); the
-- confirm/decline transitions and their notifications are Phase 8's
-- respond_mentorship_request() function, not built here.

create type public.mentorship_request_status as enum (
  'pending', 'confirmed', 'completed', 'declined', 'cancelled'
);

create table public.mentorship_requests (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references public.mentors (id) on delete cascade,
  member_id uuid not null references auth.users (id) on delete cascade,
  message text,
  status public.mentorship_request_status not null default 'pending',
  scheduled_at timestamptz,
  join_url text,
  created_at timestamptz not null default now(),
  responded_at timestamptz
);

create index mentorship_requests_mentor_id_idx on public.mentorship_requests (mentor_id);
create index mentorship_requests_member_id_idx on public.mentorship_requests (member_id);

alter table public.mentorship_requests enable row level security;

-- A member sees their own requests; a mentor sees requests directed at
-- them (matched through their own mentors row); admin sees all.
create policy "mentorship_requests_select_own_or_mentor_or_admin"
  on public.mentorship_requests for select
  using (
    member_id = auth.uid()
    or exists (
      select 1 from public.mentors m
      where m.id = mentorship_requests.mentor_id and m.user_id = auth.uid()
    )
    or public.is_admin()
  );

create policy "mentorship_requests_insert_own"
  on public.mentorship_requests for insert
  with check (
    member_id = auth.uid()
    and exists (
      select 1 from public.memberships
      where user_id = auth.uid() and status = 'active'
    )
    and exists (
      select 1 from public.mentors m
      where m.id = mentorship_requests.mentor_id
        and m.is_approved
        and m.is_accepting_requests
    )
  );

create policy "mentorship_requests_admin_all"
  on public.mentorship_requests for all
  using (public.is_admin())
  with check (public.is_admin());
