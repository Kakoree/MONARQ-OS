-- MONARQ OS — V3 Phase 3: multi-member pods
-- Run after 0001–0041. Additive only.
--
-- The real "small pods" scope V2 Phase 6 deliberately scoped down from
-- (0034_connections.sql built the smallest possible pod — a pair). Pods
-- here are admin-curated: an admin creates a pod and assigns members to
-- it. There is deliberately no member-facing request/accept state machine
-- like connections has — membership is placed, not negotiated — so this
-- migration adds no member-callable write path at all. Members only read.
--
-- Messaging inside a pod is explicitly NOT part of this phase (V3 Phase 7).

create table public.pods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint pods_name_not_blank check (btrim(name) <> '')
);

create table public.pod_members (
  id uuid primary key default gen_random_uuid(),
  pod_id uuid not null references public.pods (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique (pod_id, user_id)
);

create index pod_members_pod_id_idx on public.pod_members (pod_id);
create index pod_members_user_id_idx on public.pod_members (user_id);

-- Security definer specifically to break RLS recursion: the pod_members
-- select policy below needs to ask "is the caller in this pod?", which is
-- itself a read of pod_members. Inlining that as a subquery in the policy
-- would re-trigger the same policy and fail with 42P17 (infinite
-- recursion). Reading it through a definer function bypasses RLS inside
-- the function and terminates. Exactly the shape is_admin() (0002) already
-- uses to read memberships from inside a memberships policy.
create function public.is_pod_member(p_pod_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.pod_members
    where pod_id = p_pod_id and user_id = auth.uid()
  );
$$;

grant execute on function public.is_pod_member(uuid) to authenticated;

alter table public.pods enable row level security;
alter table public.pod_members enable row level security;

-- Read-only for members, full control for admins. No member insert/update/
-- delete policy exists on either table, by design — pods are assigned.
create policy "pods_select_member_or_admin"
  on public.pods for select
  using (public.is_pod_member(id) or public.is_admin());

create policy "pods_admin_all"
  on public.pods for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "pod_members_select_same_pod_or_admin"
  on public.pod_members for select
  using (public.is_pod_member(pod_id) or public.is_admin());

create policy "pod_members_admin_all"
  on public.pod_members for all
  using (public.is_admin())
  with check (public.is_admin());

-- The only cross-member exposure of habit data in this codebase. All of
-- habits / habit_check_ins / habit_grace_tokens is otherwise strictly
-- own-only (0005, 0028), and this does NOT loosen any of those policies —
-- it reads them through a definer function that returns only what a pod
-- needs for accountability: whether each member checked in today, how many
-- active habits they have, and the dates they were active. Habit *names*
-- are never returned, so a pod can see that someone is slipping without
-- seeing what their actual routine is.
--
-- The authorization check below is the entire security boundary for that
-- exposure: without it, any authenticated member could read any pod's
-- habit activity by passing an arbitrary pod id.
--
-- Returns raw activity dates rather than a computed streak so the streak
-- stays computed in exactly one place (computeStreak in lib/habits.ts),
-- instead of a second SQL implementation that could drift from it.
create function public.get_pod_accountability(p_pod_id uuid)
returns table (
  member_id uuid,
  active_habit_count integer,
  checked_in_today boolean,
  activity_dates date[]
)
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if not (public.is_pod_member(p_pod_id) or public.is_admin()) then
    raise exception 'not authorized to view this pod';
  end if;

  return query
  select
    pm.user_id,
    (
      select count(*)::integer
      from public.habits h
      where h.user_id = pm.user_id and h.is_active
    ),
    exists (
      select 1
      from public.habit_check_ins c
      where c.user_id = pm.user_id
        and c.completed_on = (now() at time zone 'utc')::date
    ),
    coalesce(
      (
        select array_agg(distinct x.d)
        from (
          select c.completed_on as d
          from public.habit_check_ins c
          where c.user_id = pm.user_id
          union
          select g.consumed_for_date
          from public.habit_grace_tokens g
          where g.user_id = pm.user_id
            and g.consumed_at is not null
            and g.consumed_for_date is not null
        ) x
      ),
      '{}'::date[]
    )
  from public.pod_members pm
  where pm.pod_id = p_pod_id;
end;
$$;

grant execute on function public.get_pod_accountability(uuid) to authenticated;
