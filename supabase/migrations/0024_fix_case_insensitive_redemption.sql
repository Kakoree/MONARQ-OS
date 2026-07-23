-- MONARQ OS — fix: make access code redemption case-insensitive
-- Run after 0001–0023.
--
-- Codes created via the admin panel (app/admin/access-codes/actions.ts)
-- are normalized to uppercase on insert, but codes created via direct SQL
-- (bypassing that normalization) can end up in any case, and redemption's
-- lookup was a case-sensitive string comparison — a code stored lowercase
-- would only redeem if typed in that exact case, which the uppercase-styled
-- input fields (CSS text-transform, not an actual value transform) made
-- confusing to get right. This patches the function in place to compare
-- case-insensitively; everything else about redemption is unchanged from
-- 0006_fix_redeem_role_upgrade.sql.

create or replace function public.redeem_access_code(p_code text)
returns public.membership_status
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_code_id uuid;
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

  select id into v_code_id
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

  update public.memberships
  set status = 'active',
      role = case when role = 'guest' then 'member' else role end
  where user_id = v_user_id
  returning status into v_current_status;

  return v_current_status;
end;
$$;
