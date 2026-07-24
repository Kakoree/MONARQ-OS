-- MONARQ OS — V2 Phase 7: mentor role and profile
-- Run after 0001–0035.
--
-- Mentor status is deliberately its own table, not a member_role enum
-- value — member_role drives coarse permission checks (teaching
-- required_role comparisons, is_admin()) and folding "mentor" into that
-- ladder would force an artificial rank ordering against guest/member/
-- moderator/admin that has nothing to do with mentorship. A member applies
-- (self-service insert, always unapproved), an admin approves (direct
-- table update via mentors_admin_all — no function needed, matches the
-- access_codes/identity_markers admin-write pattern), and only approved
-- mentors appear in the directory.

create table public.mentors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  headline text not null,
  bio text not null,
  focus_areas text[] not null default '{}',
  is_approved boolean not null default false,
  is_accepting_requests boolean not null default true,
  approved_at timestamptz,
  approved_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint mentors_headline_not_blank check (btrim(headline) <> ''),
  constraint mentors_bio_not_blank check (btrim(bio) <> '')
);

create index mentors_is_approved_idx on public.mentors (is_approved);

alter table public.mentors enable row level security;

create policy "mentors_select_approved_or_own_or_admin"
  on public.mentors for select
  using (is_approved or user_id = auth.uid() or public.is_admin());

-- A member applies for themselves, always starting unapproved — the check
-- clause blocks self-approval even if is_approved is tampered with in the
-- insert payload.
create policy "mentors_insert_own"
  on public.mentors for insert
  with check (
    user_id = auth.uid()
    and is_approved = false
    and exists (
      select 1 from public.memberships
      where user_id = auth.uid() and status = 'active'
    )
  );

create policy "mentors_admin_all"
  on public.mentors for all
  using (public.is_admin())
  with check (public.is_admin());

-- Self-service edits to a mentor's own headline/bio/focus areas, without
-- ever touching is_approved — a plain owner-scoped UPDATE RLS policy can't
-- protect one column from the same row's writer, so this stays a
-- security-definer function instead, same reasoning as grant_grace_token.
create function public.update_mentor_profile(
  p_headline text,
  p_bio text,
  p_focus_areas text[],
  p_is_accepting_requests boolean
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;
  if btrim(p_headline) = '' or btrim(p_bio) = '' then
    raise exception 'headline and bio are required';
  end if;

  update public.mentors
  set headline = p_headline,
      bio = p_bio,
      focus_areas = p_focus_areas,
      is_accepting_requests = p_is_accepting_requests
  where user_id = v_user_id;

  if not found then
    raise exception 'no mentor profile found';
  end if;

  return true;
end;
$$;

grant execute on function public.update_mentor_profile(text, text, text[], boolean) to authenticated;
