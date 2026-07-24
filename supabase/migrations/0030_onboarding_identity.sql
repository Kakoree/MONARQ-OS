-- MONARQ OS — V2 Phase 2: onboarding identity marker
-- Run after 0001–0029. Additive only.

alter table public.profiles
  add column identity_marker text,
  add column onboarding_completed_at timestamptz;

create table public.identity_markers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint identity_markers_name_not_blank check (btrim(name) <> '')
);

create unique index identity_markers_name_idx on public.identity_markers (lower(name));
create index identity_markers_sort_order_idx on public.identity_markers (sort_order);

alter table public.identity_markers enable row level security;

-- Same active-member-only visibility pattern as seasons/tiers (0027) — the
-- marker list is chosen from during onboarding, before a member necessarily
-- has anywhere else in the app to see it, but "active" already covers that
-- (redemption happens in onboarding step 1, before the marker step renders).

create policy "identity_markers_select_active_member"
  on public.identity_markers for select
  using (
    exists (
      select 1 from public.memberships
      where user_id = auth.uid() and status = 'active'
    )
  );

create policy "identity_markers_admin_all"
  on public.identity_markers for all
  using (public.is_admin())
  with check (public.is_admin());

insert into public.identity_markers (name, description, sort_order) values
  ('Athlete', 'Discipline through the body — training, movement, physical mastery.', 1),
  ('Builder', 'Discipline through creation — building things that outlast the moment.', 2),
  ('Quiet Grinder', 'Discipline without an audience — consistency nobody has to see.', 3),
  ('Competitor', 'Discipline through comparison — measured against others and the clock.', 4),
  ('Creator', 'Discipline through expression — making, writing, producing.', 5);

-- alter default privileges (0025) already covers new tables automatically,
-- but this stays explicit rather than relying on that silently, matching
-- 0025's own reasoning for why it existed in the first place.
grant select, insert, update, delete on public.identity_markers to authenticated;
