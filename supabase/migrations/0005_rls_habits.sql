-- MONARQ OS — Phase 5: RLS for habits and check-ins
-- Run after 0004_habits.sql. Owner-only throughout — habits are personal
-- data with no current admin-visibility requirement.

alter table public.habits enable row level security;
alter table public.habit_check_ins enable row level security;

create policy "habits_select_own"
  on public.habits for select
  using (user_id = auth.uid());

create policy "habits_insert_own"
  on public.habits for insert
  with check (user_id = auth.uid());

create policy "habits_update_own"
  on public.habits for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "habits_delete_own"
  on public.habits for delete
  using (user_id = auth.uid());

create policy "habit_check_ins_select_own"
  on public.habit_check_ins for select
  using (user_id = auth.uid());

-- The habit-ownership check prevents a user from logging a check-in against
-- a habit_id that belongs to someone else, even though user_id itself is
-- self-supplied.
create policy "habit_check_ins_insert_own"
  on public.habit_check_ins for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.habits h
      where h.id = habit_id and h.user_id = auth.uid()
    )
  );

create policy "habit_check_ins_delete_own"
  on public.habit_check_ins for delete
  using (user_id = auth.uid());
