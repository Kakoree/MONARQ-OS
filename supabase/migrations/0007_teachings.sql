-- MONARQ OS — Phase 6: teachings library
-- Run after 0006_fix_redeem_role_upgrade.sql. Additive only.

create table public.teaching_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint teaching_categories_name_not_blank check (btrim(name) <> '')
);

create table public.teachings (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.teaching_categories (id) on delete set null,
  title text not null,
  summary text not null,
  required_role public.member_role not null default 'member',
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  constraint teachings_title_not_blank check (btrim(title) <> '')
);

create index teachings_category_id_idx on public.teachings (category_id);

-- Split from teachings so the full body can carry its own, stricter RLS
-- policy (role-gated) while title/summary metadata stays visible to any
-- active member so the library can show what's locked.
create table public.teaching_content (
  teaching_id uuid primary key references public.teachings (id) on delete cascade,
  body text not null
);

create table public.teaching_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  teaching_id uuid not null references public.teachings (id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (user_id, teaching_id)
);

create index teaching_progress_user_id_idx on public.teaching_progress (user_id);
