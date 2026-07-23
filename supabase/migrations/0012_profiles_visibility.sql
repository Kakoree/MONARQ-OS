-- MONARQ OS — Phase 7: broaden profile visibility for active members
-- Run after 0011_complete_challenge_function.sql.
--
-- Additive only — the existing "profiles_select_own_or_admin" policy from
-- Phase 1 is untouched. This adds a second permissive SELECT policy so any
-- active member can see other members' display_name/avatar_url/bio, needed
-- for the leaderboard to show real names. This is the same visibility
-- Phase 9 (Member Identity) will need for a member directory — not a
-- one-off exception. No other table's RLS changes.

create policy "profiles_select_active_member"
  on public.profiles for select
  using (
    exists (
      select 1 from public.memberships m
      where m.user_id = auth.uid() and m.status = 'active'
    )
  );
