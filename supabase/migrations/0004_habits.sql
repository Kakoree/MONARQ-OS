-- MONARQ OS — Phase 5: habits and daily check-ins
-- Run after 0001–0003. Additive only — does not alter any existing table.

create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint habits_name_not_blank check (btrim(name) <> '')
);

create index habits_user_id_idx on public.habits (user_id);

create table public.habit_check_ins (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  completed_on date not null,
  created_at timestamptz not null default now(),
  unique (habit_id, completed_on)
);

create index habit_check_ins_user_id_idx on public.habit_check_ins (user_id);
create index habit_check_ins_completed_on_idx on public.habit_check_ins (completed_on);
