-- MONARQ OS — throttle access-code guessing
-- Run after 0001–0043. Additive, plus a replace of redeem_access_code.
--
-- Supabase Auth's own rate limits only cover /auth/v1/* endpoints.
-- redeem_access_code is a PostgREST RPC (/rest/v1/rpc/), so none of them
-- apply to it — and with email confirmation off, anyone can create an
-- account, sit in 'pending', and guess invite codes from an authenticated
-- session as fast as they can send requests. Codes are admin-typed
-- strings, not generated secrets, so they are only as strong as whatever
-- was typed. For an invite-only product that is the front door.
--
-- Note on why the invalid-code path returns instead of raising: in
-- plpgsql a `raise exception` rolls back everything the function did,
-- including an INSERT logging the failed attempt. Logging and then
-- raising would silently discard every log row and the limiter would
-- never fire — the failure mode being defended against here would look
-- exactly like a working defence. So an invalid code now returns the
-- caller's unchanged membership status ('pending') and the application
-- treats "came back not active" as the failure signal.

create table public.access_code_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  attempted_at timestamptz not null default now()
);

create index access_code_attempts_user_id_attempted_at_idx
  on public.access_code_attempts (user_id, attempted_at desc);

alter table public.access_code_attempts enable row level security;

-- No policy for `authenticated` in either direction, deliberately — rows
-- are written only by redeem_access_code() below (security definer, so it
-- bypasses RLS) and never touched by a client. Same reasoning as
-- notifications (0026): a member who could write here could erase their
-- own failed attempts and reset the limit.
create policy "access_code_attempts_admin_select"
  on public.access_code_attempts for select
  using (public.is_admin());

-- Based on 0040's body, which is the authoritative version of this
-- function (it has now been patched by 0006, 0024, 0040 and this one).
-- 0040 added the drop_claims insert and case-insensitive `upper(code)`
-- matching — rebuilding from an older revision silently drops both.
create or replace function public.redeem_access_code(p_code text)
returns public.membership_status
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_code_id uuid;
  v_drop_id uuid;
  v_claimed_id uuid;
  v_current_status public.membership_status;
  v_recent_failures integer;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  select status into v_current_status
  from public.memberships
  where user_id = v_user_id;

  if v_current_status is null then
    raise exception 'membership record not found';
  end if;

  if v_current_status = 'active' then
    return v_current_status;
  end if;

  if v_current_status in ('suspended', 'revoked') then
    raise exception 'membership % — contact support', v_current_status;
  end if;

  select count(*) into v_recent_failures
  from public.access_code_attempts
  where user_id = v_user_id
    and attempted_at > now() - interval '1 hour';

  -- Raising here is safe: there is nothing to persist on this path, so the
  -- rollback costs nothing.
  if v_recent_failures >= 10 then
    raise exception 'too many attempts — wait an hour and try again';
  end if;

  select id, drop_id into v_code_id, v_drop_id
  from public.access_codes
  where upper(code) = upper(p_code)
    and is_active
    and (expires_at is null or expires_at > now());

  if v_code_id is null then
    insert into public.access_code_attempts (user_id) values (v_user_id);
    return v_current_status;
  end if;

  -- Past this point a valid code is already in hand, so these paths are
  -- not a guessing oracle and can keep raising as they always have.
  if exists (
    select 1 from public.redemptions
    where access_code_id = v_code_id and user_id = v_user_id
  ) then
    raise exception 'code already redeemed';
  end if;

  update public.access_codes
  set uses_count = uses_count + 1
  where id = v_code_id
    and uses_count < max_uses
  returning id into v_claimed_id;

  if v_claimed_id is null then
    raise exception 'code has no remaining uses';
  end if;

  insert into public.redemptions (access_code_id, user_id)
  values (v_code_id, v_user_id);

  if v_drop_id is not null then
    insert into public.drop_claims (user_id, drop_id, access_code_id)
    values (v_user_id, v_drop_id, v_code_id)
    on conflict (user_id, drop_id) do nothing;
  end if;

  update public.memberships
  set status = 'active',
      role = case when role = 'guest' then 'member' else role end
  where user_id = v_user_id
  returning status into v_current_status;

  return v_current_status;
end;
$$;
