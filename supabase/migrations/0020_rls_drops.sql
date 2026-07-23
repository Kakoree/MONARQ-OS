-- MONARQ OS — Phase 11: RLS for drops
-- Run after 0019_drops.sql.

alter table public.drops enable row level security;

create policy "drops_select_active_member"
  on public.drops for select
  using (
    is_published
    and exists (
      select 1 from public.memberships
      where user_id = auth.uid() and status = 'active'
    )
  );

create policy "drops_admin_all"
  on public.drops for all
  using (public.is_admin())
  with check (public.is_admin());
