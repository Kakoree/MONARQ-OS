-- MONARQ OS — Phase 9: active-member directory filter
-- Run after 0001–0014.
--
-- This view runs with the view owner's privileges (default view behavior,
-- not security_invoker), so it can read across all memberships despite the
-- caller only having RLS access to their own row. It exposes only user_id —
-- never status, role, or timestamps — so the app can filter the member
-- directory to active members without any member seeing why someone is or
-- isn't listed. Does not broaden any policy on the memberships table itself.

create view public.active_member_ids as
select user_id
from public.memberships
where status = 'active';

grant select on public.active_member_ids to authenticated;
