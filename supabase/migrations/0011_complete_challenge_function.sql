-- MONARQ OS — Phase 7: atomic challenge completion + XP award
-- Run after 0010_rls_challenges.sql.

create function public.complete_challenge(p_challenge_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_status public.membership_status;
  v_challenge record;
  v_participation record;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  select status into v_status
  from public.memberships
  where user_id = v_user_id;

  if v_status is distinct from 'active' then
    raise exception 'membership not active';
  end if;

  select id, xp_reward, is_published, starts_at, ends_at
    into v_challenge
    from public.challenges
    where id = p_challenge_id;

  if v_challenge.id is null or not v_challenge.is_published then
    raise exception 'challenge not found';
  end if;

  if v_challenge.starts_at is not null and v_challenge.starts_at > now() then
    raise exception 'challenge has not started yet';
  end if;

  if v_challenge.ends_at is not null and v_challenge.ends_at < now() then
    raise exception 'challenge has ended';
  end if;

  select id, completed_at into v_participation
  from public.challenge_participation
  where user_id = v_user_id and challenge_id = p_challenge_id;

  if v_participation.id is null then
    raise exception 'join this challenge before completing it';
  end if;

  if v_participation.completed_at is not null then
    raise exception 'challenge already completed';
  end if;

  update public.challenge_participation
  set completed_at = now()
  where id = v_participation.id;

  insert into public.xp_events (user_id, amount, reason, challenge_id)
  values (v_user_id, v_challenge.xp_reward, 'challenge_completed', p_challenge_id);

  return v_challenge.xp_reward;
end;
$$;

grant execute on function public.complete_challenge(uuid) to authenticated;
