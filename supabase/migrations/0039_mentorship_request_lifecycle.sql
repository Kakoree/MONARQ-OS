-- MONARQ OS — V2 Phase 8: mentorship request lifecycle
-- Run after 0001–0038.
--
-- The requested → confirmed → completed flow the plan calls for, coordinated
-- via a join_url exactly like events (0017) already do — no payment
-- processing, no calendar integration, just a link and a time. All four
-- transitions are security-definer functions; mentorship_requests has no
-- direct update policy for a member or mentor (0037), only admin_all.

create function public.confirm_mentorship_request(
  p_request_id uuid,
  p_scheduled_at timestamptz,
  p_join_url text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_request record;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  select mr.id, mr.member_id, mr.status, m.user_id as mentor_user_id
    into v_request
    from public.mentorship_requests mr
    join public.mentors m on m.id = mr.mentor_id
    where mr.id = p_request_id;

  if v_request.id is null then
    raise exception 'request not found';
  end if;
  if v_request.mentor_user_id <> v_user_id then
    raise exception 'not authorized to confirm this request';
  end if;
  if v_request.status <> 'pending' then
    raise exception 'request is no longer pending';
  end if;
  if p_scheduled_at <= now() then
    raise exception 'scheduled time must be in the future';
  end if;

  update public.mentorship_requests
  set status = 'confirmed',
      scheduled_at = p_scheduled_at,
      join_url = p_join_url,
      responded_at = now()
  where id = p_request_id;

  perform public.create_notification(
    v_request.member_id,
    'mentorship_confirmed',
    'Mentorship session confirmed',
    'Your mentorship request was confirmed for ' || to_char(p_scheduled_at, 'FMMonth FMDD, HH24:MI') || '.',
    '/mentors'
  );

  return true;
end;
$$;

grant execute on function public.confirm_mentorship_request(uuid, timestamptz, text) to authenticated;

create function public.decline_mentorship_request(p_request_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_request record;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  select mr.id, mr.member_id, mr.status, m.user_id as mentor_user_id
    into v_request
    from public.mentorship_requests mr
    join public.mentors m on m.id = mr.mentor_id
    where mr.id = p_request_id;

  if v_request.id is null then
    raise exception 'request not found';
  end if;
  if v_request.mentor_user_id <> v_user_id then
    raise exception 'not authorized to decline this request';
  end if;
  if v_request.status <> 'pending' then
    raise exception 'request is no longer pending';
  end if;

  update public.mentorship_requests
  set status = 'declined', responded_at = now()
  where id = p_request_id;

  perform public.create_notification(
    v_request.member_id,
    'mentorship_declined',
    'Mentorship request declined',
    'The mentor wasn''t able to take this request right now.',
    '/mentors'
  );

  return true;
end;
$$;

grant execute on function public.decline_mentorship_request(uuid) to authenticated;

create function public.complete_mentorship_request(p_request_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_request record;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  select mr.id, mr.status, m.user_id as mentor_user_id
    into v_request
    from public.mentorship_requests mr
    join public.mentors m on m.id = mr.mentor_id
    where mr.id = p_request_id;

  if v_request.id is null then
    raise exception 'request not found';
  end if;
  if v_request.mentor_user_id <> v_user_id and not public.is_admin() then
    raise exception 'not authorized to complete this request';
  end if;
  if v_request.status <> 'confirmed' then
    raise exception 'only a confirmed session can be marked complete';
  end if;

  update public.mentorship_requests
  set status = 'completed'
  where id = p_request_id;

  return true;
end;
$$;

grant execute on function public.complete_mentorship_request(uuid) to authenticated;

-- Either side can cancel a pending or confirmed request — a member who no
-- longer needs it, or a mentor whose availability changed.
create function public.cancel_mentorship_request(p_request_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_request record;
  v_other_user_id uuid;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  select mr.id, mr.member_id, mr.status, m.user_id as mentor_user_id
    into v_request
    from public.mentorship_requests mr
    join public.mentors m on m.id = mr.mentor_id
    where mr.id = p_request_id;

  if v_request.id is null then
    raise exception 'request not found';
  end if;
  if v_request.member_id <> v_user_id and v_request.mentor_user_id <> v_user_id then
    raise exception 'not authorized to cancel this request';
  end if;
  if v_request.status not in ('pending', 'confirmed') then
    raise exception 'request cannot be cancelled from its current state';
  end if;

  update public.mentorship_requests
  set status = 'cancelled', responded_at = coalesce(responded_at, now())
  where id = p_request_id;

  v_other_user_id := case when v_user_id = v_request.member_id
    then v_request.mentor_user_id else v_request.member_id end;

  perform public.create_notification(
    v_other_user_id,
    'mentorship_cancelled',
    'Mentorship session cancelled',
    'A mentorship session was cancelled.',
    '/mentors'
  );

  return true;
end;
$$;

grant execute on function public.cancel_mentorship_request(uuid) to authenticated;
