-- MONARQ OS — Phase 8: RLS for community feed
-- Run after 0013_community.sql.

alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.reactions enable row level security;

create policy "posts_select_active_member"
  on public.posts for select
  using (
    exists (
      select 1 from public.memberships
      where user_id = auth.uid() and status = 'active'
    )
  );

create policy "posts_insert_own"
  on public.posts for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.memberships
      where user_id = auth.uid() and status = 'active'
    )
  );

create policy "posts_delete_own"
  on public.posts for delete
  using (user_id = auth.uid());

create policy "posts_admin_all"
  on public.posts for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "comments_select_active_member"
  on public.comments for select
  using (
    exists (
      select 1 from public.memberships
      where user_id = auth.uid() and status = 'active'
    )
  );

create policy "comments_insert_own"
  on public.comments for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.memberships
      where user_id = auth.uid() and status = 'active'
    )
  );

create policy "comments_delete_own"
  on public.comments for delete
  using (user_id = auth.uid());

create policy "comments_admin_all"
  on public.comments for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "reactions_select_active_member"
  on public.reactions for select
  using (
    exists (
      select 1 from public.memberships
      where user_id = auth.uid() and status = 'active'
    )
  );

create policy "reactions_insert_own"
  on public.reactions for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.memberships
      where user_id = auth.uid() and status = 'active'
    )
  );

create policy "reactions_delete_own"
  on public.reactions for delete
  using (user_id = auth.uid());

create policy "reactions_admin_all"
  on public.reactions for all
  using (public.is_admin())
  with check (public.is_admin());
