-- MONARQ OS — V2 Phase 6: member-to-member connection
-- Run after 0001–0033.
--
-- A scoped "pairing" primitive, not the full pods/chat system sketched in
-- MONARQ's post-V1 notes and not real-time messaging (explicitly deferred
-- to V3). A connection is a mutual, request/accept relationship between two
-- members — the smallest possible "pod" (two people who've both opted in
-- to being visible to each other as accountability partners). Members never
-- insert/update this table directly; request_connection() and
-- respond_connection() are the only path, same reasoning as
-- redeem_access_code and complete_challenge.

create type public.connection_status as enum ('pending', 'accepted', 'declined');

create table public.connections (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users (id) on delete cascade,
  recipient_id uuid not null references auth.users (id) on delete cascade,
  status public.connection_status not null default 'pending',
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  constraint connections_not_self check (requester_id <> recipient_id)
);

create index connections_requester_id_idx on public.connections (requester_id);
create index connections_recipient_id_idx on public.connections (recipient_id);

alter table public.connections enable row level security;

create policy "connections_select_own_or_admin"
  on public.connections for select
  using (requester_id = auth.uid() or recipient_id = auth.uid() or public.is_admin());

create policy "connections_admin_all"
  on public.connections for all
  using (public.is_admin())
  with check (public.is_admin());

create function public.request_connection(p_recipient_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_status public.membership_status;
  v_recipient_status public.membership_status;
  v_existing_id uuid;
  v_id uuid;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;
  if v_user_id = p_recipient_id then
    raise exception 'cannot connect with yourself';
  end if;

  select status into v_status from public.memberships where user_id = v_user_id;
  if v_status is distinct from 'active' then
    raise exception 'membership not active';
  end if;

  select status into v_recipient_status
  from public.memberships where user_id = p_recipient_id;
  if v_recipient_status is distinct from 'active' then
    raise exception 'that member is not available to connect with';
  end if;

  select id into v_existing_id
  from public.connections
  where status in ('pending', 'accepted')
    and (
      (requester_id = v_user_id and recipient_id = p_recipient_id)
      or (requester_id = p_recipient_id and recipient_id = v_user_id)
    );

  if v_existing_id is not null then
    raise exception 'a connection already exists with that member';
  end if;

  insert into public.connections (requester_id, recipient_id)
  values (v_user_id, p_recipient_id)
  returning id into v_id;

  perform public.create_notification(
    p_recipient_id,
    'connection_request',
    'New connection request',
    (select coalesce(display_name, 'A member') from public.profiles where id = v_user_id)
      || ' wants to connect.',
    '/circle'
  );

  return v_id;
end;
$$;

grant execute on function public.request_connection(uuid) to authenticated;

create function public.respond_connection(p_connection_id uuid, p_accept boolean)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_connection record;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  select id, requester_id, recipient_id, status
    into v_connection
    from public.connections
    where id = p_connection_id;

  if v_connection.id is null then
    raise exception 'connection not found';
  end if;
  if v_connection.recipient_id <> v_user_id then
    raise exception 'not authorized to respond to this connection';
  end if;
  if v_connection.status <> 'pending' then
    raise exception 'connection already resolved';
  end if;

  update public.connections
  set status = case when p_accept then 'accepted' else 'declined' end::public.connection_status,
      responded_at = now()
  where id = p_connection_id;

  if p_accept then
    perform public.create_notification(
      v_connection.requester_id,
      'connection_accepted',
      'Connection accepted',
      (select coalesce(display_name, 'A member') from public.profiles where id = v_user_id)
        || ' accepted your connection request.',
      '/circle'
    );
  end if;

  return true;
end;
$$;

grant execute on function public.respond_connection(uuid, boolean) to authenticated;
