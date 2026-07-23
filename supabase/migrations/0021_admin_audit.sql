-- MONARQ OS — Phase 12: admin audit log
-- Run after 0001–0020. Additive only.
--
-- Scoped to admin actions only in v1 (not general member activity like
-- login/logout) — keeps the RLS surface simple (a single admin-only insert
-- policy) and the log's purpose crisp: what admins did, not everything
-- everyone did.

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users (id) on delete set null,
  action text not null,
  target_table text,
  target_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index audit_log_created_at_idx on public.audit_log (created_at desc);
create index audit_log_actor_id_idx on public.audit_log (actor_id);
