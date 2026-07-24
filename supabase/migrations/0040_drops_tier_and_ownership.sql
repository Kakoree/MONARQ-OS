-- MONARQ OS — V2 Phase 9: drops tier-gating and real ownership
-- Run after 0001–0039.
--
-- "Owning a key" has never been a real database fact until now — 0019's own
-- comment explains key drops were operational-only (an admin creates a code
-- after an external purchase, no entitlement path). Faking ownership on a
-- profile without a real record would violate the brand doctrine's
-- explicit "nothing fake" rule, so this adds the missing linkage instead of
-- skipping the feature: an access_code can now name the drop it grants, and
-- redemption records a real drop_claims row — same "reuse the existing
-- redemption system" design the drops migration already committed to.

alter table public.drops
  add column required_tier_id uuid references public.tiers (id) on delete set null,
  add column early_access_hours integer not null default 0;

alter table public.access_codes
  add column drop_id uuid references public.drops (id) on delete set null;

create table public.drop_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  drop_id uuid not null references public.drops (id) on delete cascade,
  access_code_id uuid references public.access_codes (id) on delete set null,
  claimed_at timestamptz not null default now(),
  unique (user_id, drop_id)
);

create index drop_claims_user_id_idx on public.drop_claims (user_id);
create index drop_claims_drop_id_idx on public.drop_claims (drop_id);

alter table public.drop_claims enable row level security;

-- Ownership is visible the same way profiles/leaderboard already are —
-- any active member can see whose key it is, since a claimed drop is
-- meant to be a witnessed status marker, not private data.
create policy "drop_claims_select_active_member"
  on public.drop_claims for select
  using (
    exists (
      select 1 from public.memberships
      where user_id = auth.uid() and status = 'active'
    )
  );

create policy "drop_claims_admin_all"
  on public.drop_claims for all
  using (public.is_admin())
  with check (public.is_admin());

-- Patches redeem_access_code in place again (same function touched by 0006
-- and 0024) to additionally claim a drop when the code names one. Nothing
-- about the redemption logic itself changes.
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

  select id, drop_id into v_code_id, v_drop_id
  from public.access_codes
  where upper(code) = upper(p_code)
    and is_active
    and (expires_at is null or expires_at > now());

  if v_code_id is null then
    raise exception 'invalid or expired code';
  end if;

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
