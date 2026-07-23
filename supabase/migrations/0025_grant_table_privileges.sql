-- MONARQ OS — fix: grant base table privileges to `authenticated`
--
-- Every table in this project has had row level security policies since
-- Phase 1, but RLS only restricts which rows a query can touch — Postgres
-- still requires the connecting role to hold an ordinary GRANT on the table
-- before RLS is even evaluated. No migration ever issued that GRANT for the
-- `authenticated` role (only two function-level `grant execute` calls and
-- one view exist), so every direct table query made as a signed-in user
-- (anonymous or password) has been failing with "permission denied for
-- table ..." — silently, wherever a null/missing row already looked like a
-- plausible result (e.g. a brand-new member's status reading as null either
-- way). This does not broaden access: existing RLS policies remain the only
-- thing that decides which rows are visible or writable.

grant usage on schema public to authenticated;

grant select, insert, update, delete on
  public.profiles,
  public.memberships,
  public.access_codes,
  public.redemptions,
  public.habits,
  public.habit_check_ins,
  public.teaching_categories,
  public.teachings,
  public.teaching_content,
  public.teaching_progress,
  public.challenges,
  public.challenge_participation,
  public.xp_events,
  public.posts,
  public.comments,
  public.reactions,
  public.audit_log,
  public.events,
  public.event_rsvps,
  public.drops
to authenticated;
