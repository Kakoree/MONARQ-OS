-- MONARQ OS — Phase 6: RLS for teachings
-- Run after 0007_teachings.sql.

alter table public.teaching_categories enable row level security;
alter table public.teachings enable row level security;
alter table public.teaching_content enable row level security;
alter table public.teaching_progress enable row level security;

-- teaching_categories: any active member can read; only admins write
create policy "teaching_categories_select_active_member"
  on public.teaching_categories for select
  using (
    exists (
      select 1 from public.memberships
      where user_id = auth.uid() and status = 'active'
    )
  );

create policy "teaching_categories_admin_write"
  on public.teaching_categories for all
  using (public.is_admin())
  with check (public.is_admin());

-- teachings: metadata (title/summary/required_role) visible to any active
-- member so the library can show locked items, not just unlocked ones.
-- Only published rows are visible to non-admins.
create policy "teachings_select_active_member"
  on public.teachings for select
  using (
    is_published
    and exists (
      select 1 from public.memberships
      where user_id = auth.uid() and status = 'active'
    )
  );

create policy "teachings_admin_all"
  on public.teachings for all
  using (public.is_admin())
  with check (public.is_admin());

-- teaching_content: this is the actual gated boundary — only readable when
-- the caller's role meets the teaching's required_role. member_role's enum
-- declaration order (guest < member < moderator < admin) makes >= a valid
-- rank comparison.
create policy "teaching_content_select_entitled"
  on public.teaching_content for select
  using (
    exists (
      select 1
      from public.teachings t
      join public.memberships m on m.user_id = auth.uid()
      where t.id = teaching_content.teaching_id
        and t.is_published
        and m.status = 'active'
        and m.role >= t.required_role
    )
  );

create policy "teaching_content_admin_all"
  on public.teaching_content for all
  using (public.is_admin())
  with check (public.is_admin());

-- teaching_progress: a member can read/write only their own, and only for
-- teachings they're actually entitled to (prevents recording "completed" on
-- content they were never allowed to read).
create policy "teaching_progress_select_own"
  on public.teaching_progress for select
  using (user_id = auth.uid());

create policy "teaching_progress_insert_own"
  on public.teaching_progress for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.teachings t
      join public.memberships m on m.user_id = auth.uid()
      where t.id = teaching_id
        and t.is_published
        and m.status = 'active'
        and m.role >= t.required_role
    )
  );

create policy "teaching_progress_delete_own"
  on public.teaching_progress for delete
  using (user_id = auth.uid());
