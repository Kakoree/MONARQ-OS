-- MONARQ OS — Phase 8: community feed (posts, comments, reactions)
-- Run after 0001–0012. Additive only.

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint posts_body_not_blank check (btrim(body) <> ''),
  constraint posts_body_length check (char_length(body) <= 2000)
);

create index posts_created_at_idx on public.posts (created_at desc);
create index posts_user_id_idx on public.posts (user_id);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint comments_body_not_blank check (btrim(body) <> ''),
  constraint comments_body_length check (char_length(body) <= 1000)
);

create index comments_post_id_idx on public.comments (post_id);

create table public.reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create index reactions_post_id_idx on public.reactions (post_id);
