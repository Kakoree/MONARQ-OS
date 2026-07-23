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
--
-- Scoped to the 4 tables that actually exist in this project as of this
-- migration (0001's tables only — 0004 onward were never applied here).
-- The `alter default privileges` line below makes this a one-time fix:
-- every table created by later migrations (0004+) inherits the same grant
-- automatically, with no per-table grant statement needed going forward.

grant usage on schema public to authenticated;

alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;

grant select, insert, update, delete on
  public.profiles,
  public.memberships,
  public.access_codes,
  public.redemptions
to authenticated;
