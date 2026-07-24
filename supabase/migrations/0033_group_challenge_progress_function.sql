-- MONARQ OS — V2 Phase 4: group challenge progress function
-- Run after 0001–0032.
--
-- challenge_participation's RLS only lets a member see their own row
-- (challenge_participation_select_own_or_admin, 0010) — correct for
-- individual challenges, but a group challenge's shared "N of M active
-- members completed this" progress needs an aggregate across everyone.
-- Rather than broaden challenge_participation's SELECT policy (which would
-- expose who-completed-what to every active member), this returns only the
-- two counts, security definer, same shape as the active_member_ids view.

create function public.get_group_challenge_progress(p_challenge_id uuid)
returns table(completed_count integer, active_member_count integer)
language sql
security definer
set search_path = public
stable
as $$
  select
    (
      select count(*)::integer
      from public.challenge_participation cp
      join public.active_member_ids a on a.user_id = cp.user_id
      where cp.challenge_id = p_challenge_id and cp.completed_at is not null
    ),
    (
      select count(*)::integer from public.active_member_ids
    );
$$;

grant execute on function public.get_group_challenge_progress(uuid) to authenticated;
