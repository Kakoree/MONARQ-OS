-- MONARQ OS — Phase 12: RLS for the audit log
-- Run after 0021_admin_audit.sql.

alter table public.audit_log enable row level security;

create policy "audit_log_select_admin"
  on public.audit_log for select
  using (public.is_admin());

create policy "audit_log_insert_admin"
  on public.audit_log for insert
  with check (public.is_admin());

-- Deliberately no update or delete policy at all, for anyone, including
-- admins. The audit trail is immutable through the API by design — altering
-- or erasing history would defeat its purpose.
