-- MONARQ OS — Phase 1: RLS policies for identity, membership, and access-gating
-- Run this after 0001_identity_and_access.sql

alter table public.profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.access_codes enable row level security;
alter table public.redemptions enable row level security;

-- Helper: is the current user an active admin? --------------------------------
-- security definer so this can read memberships regardless of the caller's own
-- RLS visibility, avoiding recursive policy evaluation on the memberships table.

create function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.memberships
    where user_id = auth.uid()
      and role = 'admin'
      and status = 'active'
  );
$$;

-- profiles ---------------------------------------------------------------------
-- Every member can read their own profile and any admin can read all profiles
-- (needed later for the member directory / admin tools). Only the owner can
-- update their own profile. No insert/delete policy: rows are created only by
-- the handle_new_user trigger and are never deleted by application code.

create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- memberships --------------------------------------------------------------------
-- A member can see their own membership row (status/role) but cannot write to
-- it. Only admins can read all memberships and write to any of them. There is
-- deliberately no self-service update policy: activating a membership happens
-- through server-side redemption logic (Phase 3), not by a user editing their
-- own row directly.

create policy "memberships_select_own_or_admin"
  on public.memberships for select
  using (user_id = auth.uid() or public.is_admin());

create policy "memberships_admin_all"
  on public.memberships for all
  using (public.is_admin())
  with check (public.is_admin());

-- access_codes ---------------------------------------------------------------------
-- No regular-user access at all, in either direction. Codes are only ever
-- validated and consumed through server-side logic (Phase 3) that runs with
-- elevated privileges after checking expiry/max_uses/is_active — never through
-- a direct client read or write against this table.

create policy "access_codes_admin_only"
  on public.access_codes for all
  using (public.is_admin())
  with check (public.is_admin());

-- redemptions -----------------------------------------------------------------------
-- A member can see their own redemption history. Only admins can read all
-- redemptions or write to this table directly. Regular-user inserts happen only
-- through the server-side redemption flow (Phase 3), never a direct client
-- insert with an arbitrary access_code_id.

create policy "redemptions_select_own_or_admin"
  on public.redemptions for select
  using (user_id = auth.uid() or public.is_admin());

create policy "redemptions_admin_all"
  on public.redemptions for all
  using (public.is_admin())
  with check (public.is_admin());
