-- MONARQ OS — V3 Phase 7: lightweight messaging
-- Run after 0001–0044. Additive only.
--
-- Two scoped surfaces, deliberately not a chat platform (still deferred):
--   1. pod_messages   — a shared thread inside a pod (0042 gave pods a
--                       roster and nothing to actually do in them)
--   2. direct_messages — 1:1 between two members who have an accepted
--                       connection (0034)
--
-- No Supabase Realtime. Every read here is server-rendered on page load,
-- exactly like the rest of this codebase. That is a deliberate choice
-- rather than an omission: subscribing to these tables later is purely a
-- read-side addition and needs no schema change, so not reaching for a
-- second architectural layer now costs nothing later.

create table public.pod_messages (
  id uuid primary key default gen_random_uuid(),
  pod_id uuid not null references public.pods (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint pod_messages_body_not_blank check (btrim(body) <> ''),
  constraint pod_messages_body_length check (char_length(body) <= 2000)
);

create index pod_messages_pod_id_created_at_idx
  on public.pod_messages (pod_id, created_at desc);

alter table public.pod_messages enable row level security;

-- Reuses is_pod_member() (0042) for the same reason its own policies do:
-- asking "is the caller in this pod?" against pod_members from inside a
-- policy would otherwise recurse.
create policy "pod_messages_select_pod_member"
  on public.pod_messages for select
  using (public.is_pod_member(pod_id) or public.is_admin());

-- A plain insert policy is right here, unlike direct messages below —
-- posting into a pod you are already a member of has no precondition to
-- verify beyond membership, and nothing to notify.
create policy "pod_messages_insert_own"
  on public.pod_messages for insert
  with check (
    user_id = auth.uid()
    and public.is_pod_member(pod_id)
    and exists (
      select 1 from public.memberships
      where user_id = auth.uid() and status = 'active'
    )
  );

create policy "pod_messages_delete_own"
  on public.pod_messages for delete
  using (user_id = auth.uid());

create policy "pod_messages_admin_all"
  on public.pod_messages for all
  using (public.is_admin())
  with check (public.is_admin());

create table public.direct_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users (id) on delete cascade,
  recipient_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint direct_messages_not_self check (sender_id <> recipient_id),
  constraint direct_messages_body_not_blank check (btrim(body) <> ''),
  constraint direct_messages_body_length check (char_length(body) <= 2000)
);

create index direct_messages_pair_created_at_idx
  on public.direct_messages (sender_id, recipient_id, created_at desc);
create index direct_messages_recipient_idx
  on public.direct_messages (recipient_id);

alter table public.direct_messages enable row level security;

-- Only the two people in the conversation. Note there is deliberately NO
-- admin policy on this table, unlike every other table in this schema: a
-- private message between two members is the one thing here that being an
-- admin should not grant a window into. Moderation still works — reports
-- (0035) carry a free-text `context` field, so a member reporting a
-- message supplies it themselves rather than an admin browsing DMs.
create policy "direct_messages_select_party"
  on public.direct_messages for select
  using (sender_id = auth.uid() or recipient_id = auth.uid());

-- Sender can retract their own message. No update policy at all — an
-- edited message with no edit indicator is worse than no editing.
create policy "direct_messages_delete_own"
  on public.direct_messages for delete
  using (sender_id = auth.uid());

-- No insert policy for `authenticated` in either direction — sending goes
-- exclusively through send_direct_message() below, same reasoning as
-- notifications (0026). The function has to verify an accepted connection
-- and raise the notification in one transaction; a plain insert policy
-- could enforce the former but would leave the recipient with no way to
-- know a message ever arrived.
create function public.send_direct_message(p_recipient_id uuid, p_body text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_body text := btrim(coalesce(p_body, ''));
  v_message_id uuid;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;
  if v_user_id = p_recipient_id then
    raise exception 'cannot message yourself';
  end if;
  if v_body = '' then
    raise exception 'message cannot be empty';
  end if;
  if char_length(v_body) > 2000 then
    raise exception 'message is too long';
  end if;

  if not exists (
    select 1 from public.memberships
    where user_id = v_user_id and status = 'active'
  ) then
    raise exception 'membership not active';
  end if;

  -- Connection must be mutual and accepted. This is what keeps DMs from
  -- becoming an open channel to any member in the directory.
  if not exists (
    select 1 from public.connections c
    where c.status = 'accepted'
      and (
        (c.requester_id = v_user_id and c.recipient_id = p_recipient_id)
        or (c.requester_id = p_recipient_id and c.recipient_id = v_user_id)
      )
  ) then
    raise exception 'you can only message a connected member';
  end if;

  if not exists (
    select 1 from public.memberships
    where user_id = p_recipient_id and status = 'active'
  ) then
    raise exception 'that member is not available';
  end if;

  insert into public.direct_messages (sender_id, recipient_id, body)
  values (v_user_id, p_recipient_id, v_body)
  returning id into v_message_id;

  -- Reuses the existing notification bell rather than adding read
  -- receipts: "you have a message" is already a solved problem here, and
  -- a read_at column would need its own function to stop a recipient
  -- rewriting the body through the same update policy.
  perform public.create_notification(
    p_recipient_id,
    'direct_message',
    'New message',
    (select coalesce(display_name, 'A member') from public.profiles where id = v_user_id)
      || ' sent you a message.',
    '/circle/' || v_user_id::text
  );

  return v_message_id;
end;
$$;

grant execute on function public.send_direct_message(uuid, text) to authenticated;
