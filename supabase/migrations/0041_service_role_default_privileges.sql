-- MONARQ OS — V3 Phase 2: restore service_role default privileges
-- Run after 0001–0040. Additive only (grants, no schema change).
--
-- service_role already bypasses RLS (Postgres's rolbypassrls, set by
-- Supabase on this role by default) — but base table GRANTs are a
-- separate, independent gate, and this project's migrations never
-- granted them, leaving service_role with only structural privileges
-- (REFERENCES/TRIGGER/TRUNCATE) on every table. Nothing in this codebase
-- used a service-role client until now (lib/supabase/service.ts, V3
-- Phase 2's cron nudge scan), so the gap was invisible until then.
-- Restores the standard out-of-the-box Supabase behavior — service_role
-- is a backend-only, fully-trusted credential (never exposed to users),
-- so there's no meaningful security boundary in scoping its base grants
-- narrower than default; doing so only means every future service-role
-- use (payments webhooks, etc.) hits this same wall table-by-table.

alter default privileges in schema public
  grant all on tables to service_role;

alter default privileges in schema public
  grant all on sequences to service_role;

alter default privileges in schema public
  grant all on routines to service_role;

grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant all on all routines in schema public to service_role;
