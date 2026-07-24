-- MONARQ OS — V2 Phase 6: member reporting
-- Run after 0001–0034. Additive only.
--
-- Light moderation extension so connection abuse (and, incidentally, any
-- other member-to-member issue) has somewhere to go beyond an admin
-- happening to notice. Scoped to reporting a member, not a specific post —
-- the existing admin Moderation page already covers direct post removal.

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users (id) on delete cascade,
  reported_user_id uuid not null references auth.users (id) on delete cascade,
  reason text not null,
  context text,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references auth.users (id) on delete set null,
  constraint reports_reason_not_blank check (btrim(reason) <> ''),
  constraint reports_status_valid check (status in ('open', 'resolved', 'dismissed')),
  constraint reports_not_self check (reporter_id <> reported_user_id)
);

create index reports_status_idx on public.reports (status);

alter table public.reports enable row level security;

create policy "reports_select_own_or_admin"
  on public.reports for select
  using (reporter_id = auth.uid() or public.is_admin());

create policy "reports_insert_own"
  on public.reports for insert
  with check (
    reporter_id = auth.uid()
    and exists (
      select 1 from public.memberships
      where user_id = auth.uid() and status = 'active'
    )
  );

create policy "reports_admin_all"
  on public.reports for all
  using (public.is_admin())
  with check (public.is_admin());
