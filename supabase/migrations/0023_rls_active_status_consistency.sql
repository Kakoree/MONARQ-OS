-- MONARQ OS — V1 hardening: require active membership on self-owned write
-- policies that were missing it.
--
-- The app layer (app/(app)/layout.tsx) already blocks any non-active member
-- from reaching these features through the UI. This closes the same gap at
-- the RLS layer, so a pending/suspended/revoked member's still-valid auth
-- session can't be used to write this data by calling Supabase directly,
-- bypassing the app entirely.
--
-- Scope: INSERT/UPDATE/DELETE policies only. SELECT-own policies are left
-- unchanged — restricting a member's visibility into their own historical
-- data while suspended is a separate product decision, not a mechanical
-- security fix. This migration only narrows access; nothing is broadened.

-- habits ---------------------------------------------------------------

alter policy "habits_insert_own"
  on public.habits
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.memberships
      where user_id = auth.uid() and status = 'active'
    )
  );

alter policy "habits_update_own"
  on public.habits
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.memberships
      where user_id = auth.uid() and status = 'active'
    )
  );

alter policy "habits_delete_own"
  on public.habits
  using (
    user_id = auth.uid()
    and exists (
      select 1 from public.memberships
      where user_id = auth.uid() and status = 'active'
    )
  );

-- habit_check_ins --------------------------------------------------------

alter policy "habit_check_ins_insert_own"
  on public.habit_check_ins
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.habits h
      where h.id = habit_id and h.user_id = auth.uid()
    )
    and exists (
      select 1 from public.memberships
      where user_id = auth.uid() and status = 'active'
    )
  );

alter policy "habit_check_ins_delete_own"
  on public.habit_check_ins
  using (
    user_id = auth.uid()
    and exists (
      select 1 from public.memberships
      where user_id = auth.uid() and status = 'active'
    )
  );

-- teaching_progress ---------------------------------------------------------

alter policy "teaching_progress_delete_own"
  on public.teaching_progress
  using (
    user_id = auth.uid()
    and exists (
      select 1 from public.memberships
      where user_id = auth.uid() and status = 'active'
    )
  );

-- challenge_participation ----------------------------------------------------

alter policy "challenge_participation_insert_own"
  on public.challenge_participation
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.challenges c
      where c.id = challenge_id and c.is_published
    )
    and exists (
      select 1 from public.memberships
      where user_id = auth.uid() and status = 'active'
    )
  );

-- event_rsvps -----------------------------------------------------------------

alter policy "event_rsvps_insert_own"
  on public.event_rsvps
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.events e
      where e.id = event_id and e.is_published
    )
    and exists (
      select 1 from public.memberships
      where user_id = auth.uid() and status = 'active'
    )
  );

alter policy "event_rsvps_update_own"
  on public.event_rsvps
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.memberships
      where user_id = auth.uid() and status = 'active'
    )
  );

alter policy "event_rsvps_delete_own"
  on public.event_rsvps
  using (
    user_id = auth.uid()
    and exists (
      select 1 from public.memberships
      where user_id = auth.uid() and status = 'active'
    )
  );

-- profiles --------------------------------------------------------------------

alter policy "profiles_update_own"
  on public.profiles
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and exists (
      select 1 from public.memberships
      where user_id = auth.uid() and status = 'active'
    )
  );

-- posts / comments / reactions — delete_own gets the same check their
-- sibling insert_own policies already had ------------------------------------

alter policy "posts_delete_own"
  on public.posts
  using (
    user_id = auth.uid()
    and exists (
      select 1 from public.memberships
      where user_id = auth.uid() and status = 'active'
    )
  );

alter policy "comments_delete_own"
  on public.comments
  using (
    user_id = auth.uid()
    and exists (
      select 1 from public.memberships
      where user_id = auth.uid() and status = 'active'
    )
  );

alter policy "reactions_delete_own"
  on public.reactions
  using (
    user_id = auth.uid()
    and exists (
      select 1 from public.memberships
      where user_id = auth.uid() and status = 'active'
    )
  );

-- avatars storage ---------------------------------------------------------------

alter policy "avatar_insert_own"
  on storage.objects
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
    and exists (
      select 1 from public.memberships
      where user_id = auth.uid() and status = 'active'
    )
  );

alter policy "avatar_update_own"
  on storage.objects
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
    and exists (
      select 1 from public.memberships
      where user_id = auth.uid() and status = 'active'
    )
  );

alter policy "avatar_delete_own"
  on storage.objects
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
    and exists (
      select 1 from public.memberships
      where user_id = auth.uid() and status = 'active'
    )
  );
