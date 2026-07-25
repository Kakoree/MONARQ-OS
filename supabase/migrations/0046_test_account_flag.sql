-- MONARQ OS — V4 Phase 0: mark non-real accounts
-- Run after 0001–0045. Additive only.
--
-- The admin dashboard has been reporting "15 active members" when only 3
-- accounts are real. The rest are RLS-test fixtures (which must stay
-- active — the suite needs them) and legacy anonymous sign-ins from
-- before V2 Phase 1 replaced that entry path.
--
-- Excluding them by email pattern would be brittle and would silently
-- break the day a real member's address happened to match. An explicit
-- flag says what is actually true about the row: this account is not a
-- member, it is infrastructure.

alter table public.profiles
  add column is_test_account boolean not null default false;

create index profiles_is_test_account_idx
  on public.profiles (is_test_account)
  where is_test_account;

-- Rewritten to exclude non-real accounts. This view backs the group
-- challenge progress function (0033), so leaving test fixtures in it
-- would keep skewing "X of Y members completed" too.
create or replace view public.active_member_ids as
select m.user_id
from public.memberships m
join public.profiles p on p.id = m.user_id
where m.status = 'active'
  and not p.is_test_account;
