-- MONARQ OS — V2 Phase 1: notification infrastructure
-- Run after 0001–0025. Additive only.
--
-- No insert policy is granted to `authenticated` at all — notifications are
-- only ever created through create_notification() below (security definer),
-- never a direct client insert. That closes the obvious abuse path: without
-- this, any member could forge a notification "from" anyone, aimed at
-- anyone, just by calling .from('notifications').insert(...) directly.

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  action_url text,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint notifications_type_not_blank check (btrim(type) <> ''),
  constraint notifications_title_not_blank check (btrim(title) <> '')
);

create index notifications_user_id_created_at_idx
  on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

create policy "notifications_select_own"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "notifications_update_own"
  on public.notifications for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create function public.create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_body text default null,
  p_action_url text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  insert into public.notifications (user_id, type, title, body, action_url)
  values (p_user_id, p_type, p_title, p_body, p_action_url)
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function public.create_notification(uuid, text, text, text, text)
  to authenticated;
