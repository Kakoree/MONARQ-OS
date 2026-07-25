-- MONARQ OS — V3 Phase 4: mentor availability slots
-- Run after 0001–0042. Additive only.
--
-- Replaces the blind "send a request and let the mentor pick a time"
-- flow (0037/0039) with real availability: a mentor publishes concrete
-- times they're free, and a member books one directly.
--
-- Deliberately concrete instants, not recurring weekly rules. A rule like
-- "every Tuesday 09:00" is meaningless without knowing whose 09:00, which
-- would force a per-mentor timezone column — a dimension this schema has
-- never carried (V3 Phase 2 hit the same wall choosing a cron hour). A
-- timestamptz is an unambiguous instant that every viewer's browser
-- renders in their own local time for free, exactly how events.starts_at
-- (0017) and mentorship_requests.scheduled_at (0037) already behave.
--
-- join_url lives on the slot rather than on the mentor or the request:
-- when you publish a time you already know where it happens, so a booked
-- request comes out with its link already attached and there's never a
-- confirmed session missing one.

create table public.mentor_availability_slots (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references public.mentors (id) on delete cascade,
  starts_at timestamptz not null,
  duration_minutes integer not null default 30,
  join_url text,
  booked_request_id uuid references public.mentorship_requests (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint mentor_availability_slots_duration_positive check (duration_minutes > 0),
  unique (mentor_id, starts_at)
);

create index mentor_availability_slots_mentor_id_starts_at_idx
  on public.mentor_availability_slots (mentor_id, starts_at);

alter table public.mentor_availability_slots enable row level security;

-- Browsable by any active member (that's the point — you can't book what
-- you can't see), but only for approved mentors. A mentor always sees
-- their own, approved or not.
create policy "mentor_availability_slots_select_active_member"
  on public.mentor_availability_slots for select
  using (
    (
      exists (
        select 1 from public.memberships
        where user_id = auth.uid() and status = 'active'
      )
      and exists (
        select 1 from public.mentors m
        where m.id = mentor_availability_slots.mentor_id and m.is_approved
      )
    )
    or exists (
      select 1 from public.mentors m
      where m.id = mentor_availability_slots.mentor_id and m.user_id = auth.uid()
    )
    or public.is_admin()
  );

-- Unlike update_mentor_profile (0036), a plain owner-scoped policy is
-- genuinely safe here: every column on this table belongs to the mentor
-- and none of them need protecting from the row's own writer. No
-- security-definer function is warranted for publishing a time.
create policy "mentor_availability_slots_insert_own"
  on public.mentor_availability_slots for insert
  with check (
    booked_request_id is null
    and exists (
      select 1 from public.mentors m
      where m.id = mentor_availability_slots.mentor_id
        and m.user_id = auth.uid()
        and m.is_approved
    )
  );

-- Editing and withdrawing are both restricted to slots nobody has booked
-- — a mentor can't move or delete a time out from under a member who has
-- already committed to it. Cancelling a booked session goes through
-- cancel_mentorship_request (0039) instead, which reopens the slot.
create policy "mentor_availability_slots_update_own_unbooked"
  on public.mentor_availability_slots for update
  using (
    booked_request_id is null
    and exists (
      select 1 from public.mentors m
      where m.id = mentor_availability_slots.mentor_id and m.user_id = auth.uid()
    )
  )
  with check (
    booked_request_id is null
    and exists (
      select 1 from public.mentors m
      where m.id = mentor_availability_slots.mentor_id and m.user_id = auth.uid()
    )
  );

create policy "mentor_availability_slots_delete_own_unbooked"
  on public.mentor_availability_slots for delete
  using (
    booked_request_id is null
    and exists (
      select 1 from public.mentors m
      where m.id = mentor_availability_slots.mentor_id and m.user_id = auth.uid()
    )
  );

create policy "mentor_availability_slots_admin_all"
  on public.mentor_availability_slots for all
  using (public.is_admin())
  with check (public.is_admin());

-- Booking is the one genuinely sensitive transition here: it spans two
-- actors and has a real race — two members hitting the same open slot at
-- once. The `for update` row lock is what makes double-booking
-- impossible; without it, both callers read the slot as open and both
-- write a request.
--
-- A slot whose booking was later cancelled or declined counts as open
-- again. Deriving that from the linked request's status, rather than
-- clearing booked_request_id, means 0039's four lifecycle functions need
-- no modification at all — cancelling reopens the slot as a side effect
-- of the status it already writes.
create function public.book_mentorship_slot(p_slot_id uuid, p_message text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_slot record;
  v_mentor record;
  v_existing_status public.mentorship_request_status;
  v_request_id uuid;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  if not exists (
    select 1 from public.memberships
    where user_id = v_user_id and status = 'active'
  ) then
    raise exception 'membership not active';
  end if;

  select id, mentor_id, starts_at, join_url, booked_request_id
    into v_slot
    from public.mentor_availability_slots
    where id = p_slot_id
    for update;

  if v_slot.id is null then
    raise exception 'slot not found';
  end if;

  select id, user_id, is_approved, is_accepting_requests
    into v_mentor
    from public.mentors
    where id = v_slot.mentor_id;

  if not v_mentor.is_approved or not v_mentor.is_accepting_requests then
    raise exception 'that mentor is not accepting requests';
  end if;
  if v_mentor.user_id = v_user_id then
    raise exception 'cannot book your own slot';
  end if;
  if v_slot.starts_at <= now() then
    raise exception 'that slot is in the past';
  end if;

  if v_slot.booked_request_id is not null then
    select status into v_existing_status
      from public.mentorship_requests
      where id = v_slot.booked_request_id;

    if v_existing_status is not null
       and v_existing_status not in ('cancelled', 'declined') then
      raise exception 'that slot is already booked';
    end if;
  end if;

  -- Created already confirmed: publishing the slot was the mentor
  -- committing to that time, so there is nothing left for them to accept.
  insert into public.mentorship_requests
    (mentor_id, member_id, message, status, scheduled_at, join_url, responded_at)
  values
    (v_slot.mentor_id, v_user_id, nullif(btrim(coalesce(p_message, '')), ''),
     'confirmed', v_slot.starts_at, v_slot.join_url, now())
  returning id into v_request_id;

  update public.mentor_availability_slots
  set booked_request_id = v_request_id
  where id = p_slot_id;

  perform public.create_notification(
    v_mentor.user_id,
    'mentorship_slot_booked',
    'A session was booked',
    (select coalesce(display_name, 'A member') from public.profiles where id = v_user_id)
      || ' booked your ' || to_char(v_slot.starts_at, 'FMMonth FMDD, HH24:MI') || ' slot.',
    '/mentors'
  );

  return v_request_id;
end;
$$;

grant execute on function public.book_mentorship_slot(uuid, text) to authenticated;
