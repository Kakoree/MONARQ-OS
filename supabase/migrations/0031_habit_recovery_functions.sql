-- MONARQ OS — V2 Phase 3: grace-token grant + consume functions
-- Run after 0001–0030.
--
-- habit_grace_tokens (0028) is schema-only with no write policy for
-- `authenticated` at all — by design, same pattern as redeem_access_code and
-- complete_challenge. Both functions here are the only way tokens are ever
-- granted or consumed; a member can never insert or update this table
-- directly, only read their own rows (0028's existing select policy).

-- Auto-called from the app layer after a check-in produces a 7-day streak
-- (streak computation lives in TS — see lib/habits.ts). Capped at 3
-- unconsumed tokens held at once, and at most one grant per calendar day,
-- both enforced here rather than trusted from the caller.
create function public.grant_grace_token(p_source text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_unconsumed_count integer;
  v_already_today boolean;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  select count(*) into v_unconsumed_count
  from public.habit_grace_tokens
  where user_id = v_user_id and consumed_at is null;

  if v_unconsumed_count >= 3 then
    return false;
  end if;

  select exists (
    select 1 from public.habit_grace_tokens
    where user_id = v_user_id
      and granted_at::date = current_date
  ) into v_already_today;

  if v_already_today then
    return false;
  end if;

  insert into public.habit_grace_tokens (user_id, source)
  values (v_user_id, p_source);

  return true;
end;
$$;

grant execute on function public.grant_grace_token(text) to authenticated;

-- Spends the oldest available token to cover a missed day (one with zero
-- check-ins) within the last 3 days. Covering a day means it counts toward
-- streak continuity — see the consumed_for_date union in
-- lib/habits.ts's streak computation — not a synthesized habit_check_ins
-- row, so per-habit completion history stays honest about what was
-- actually done versus recovered.
create function public.consume_grace_token(p_date date)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_status public.membership_status;
  v_token_id uuid;
  v_has_checkin boolean;
  v_already_recovered boolean;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  select status into v_status from public.memberships where user_id = v_user_id;
  if v_status is distinct from 'active' then
    raise exception 'membership not active';
  end if;

  if p_date > current_date - 1 then
    raise exception 'only past days can be recovered';
  end if;

  if p_date < current_date - 3 then
    raise exception 'that day is outside the recovery window';
  end if;

  select exists (
    select 1 from public.habit_check_ins
    where user_id = v_user_id and completed_on = p_date
  ) into v_has_checkin;

  if v_has_checkin then
    raise exception 'that day already has a check-in';
  end if;

  select exists (
    select 1 from public.habit_grace_tokens
    where user_id = v_user_id and consumed_for_date = p_date
  ) into v_already_recovered;

  if v_already_recovered then
    raise exception 'that day is already recovered';
  end if;

  select id into v_token_id
  from public.habit_grace_tokens
  where user_id = v_user_id and consumed_at is null
  order by granted_at asc
  limit 1
  for update;

  if v_token_id is null then
    raise exception 'no grace tokens available';
  end if;

  update public.habit_grace_tokens
  set consumed_at = now(), consumed_for_date = p_date
  where id = v_token_id;

  return true;
end;
$$;

grant execute on function public.consume_grace_token(date) to authenticated;
