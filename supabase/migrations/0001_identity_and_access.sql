-- MONARQ OS — Phase 1: identity, membership, and access-gating schema
-- Run this migration first, before 0002_rls_identity_and_access.sql

-- Enums ----------------------------------------------------------------

create type public.membership_status as enum ('pending', 'active', 'suspended', 'revoked');
create type public.member_role as enum ('guest', 'member', 'moderator', 'admin');

-- Tables -----------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  status public.membership_status not null default 'pending',
  role public.member_role not null default 'guest',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.access_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  max_uses integer not null default 1,
  uses_count integer not null default 0,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint access_codes_max_uses_positive check (max_uses > 0),
  constraint access_codes_uses_count_valid check (uses_count >= 0 and uses_count <= max_uses)
);

create table public.redemptions (
  id uuid primary key default gen_random_uuid(),
  access_code_id uuid not null references public.access_codes (id) on delete restrict,
  user_id uuid not null references auth.users (id) on delete cascade,
  redeemed_at timestamptz not null default now(),
  unique (access_code_id, user_id)
);

-- Indexes ------------------------------------------------------------------

create index memberships_status_idx on public.memberships (status);
create index redemptions_user_id_idx on public.redemptions (user_id);
create index redemptions_access_code_id_idx on public.redemptions (access_code_id);

-- updated_at maintenance -----------------------------------------------------

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger memberships_set_updated_at
  before update on public.memberships
  for each row execute procedure public.set_updated_at();

-- New user provisioning -------------------------------------------------------
-- Runs as the table owner (security definer) because a brand-new auth user has
-- no RLS-granted privileges yet — this is the one place elevated rights are
-- required to bootstrap a profile + pending membership automatically.

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );

  insert into public.memberships (user_id, status, role)
  values (new.id, 'pending', 'guest');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
