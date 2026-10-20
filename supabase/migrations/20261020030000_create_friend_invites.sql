create table public.friend_invites (
  id uuid primary key default gen_random_uuid(),
  sender_username text not null references public.accounts(username) on delete cascade,
  recipient_username text not null references public.accounts(username) on delete cascade,
  created_at timestamptz not null default now(),
  check (sender_username <> recipient_username)
);

create unique index friend_invites_pair_idx on public.friend_invites
  (least(sender_username, recipient_username), greatest(sender_username, recipient_username));
create index friend_invites_recipient_idx on public.friend_invites (recipient_username);
create index friend_invites_sender_idx on public.friend_invites (sender_username);
alter table public.friend_invites enable row level security;
revoke all on table public.friend_invites from public, anon, authenticated;

create function public.send_friend_invite(p_actor text, p_recipient text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  existing public.friend_invites%rowtype;
  invitation_id uuid;
begin
  if p_actor = p_recipient then raise exception 'Cannot invite yourself.' using errcode = '22023'; end if;
  if not exists (select 1 from public.accounts where username = p_actor)
    or not exists (select 1 from public.accounts where username = p_recipient)
    then raise exception 'Account not found.' using errcode = 'P0002'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(least(p_actor, p_recipient) || ':' || greatest(p_actor, p_recipient), 0));
  if exists (select 1 from public.friendships where username_a = least(p_actor, p_recipient) and username_b = greatest(p_actor, p_recipient))
    then raise exception 'Already friends.' using errcode = '23505'; end if;
  select * into existing from public.friend_invites
    where least(sender_username, recipient_username) = least(p_actor, p_recipient)
      and greatest(sender_username, recipient_username) = greatest(p_actor, p_recipient);
  if found then
    if existing.sender_username = p_actor then return existing.id; end if;
    raise exception 'An incoming invite already exists.' using errcode = '23505';
  end if;
  insert into public.friend_invites (sender_username, recipient_username)
    values (p_actor, p_recipient) returning id into invitation_id;
  return invitation_id;
end;
$$;

create function public.respond_to_friend_invite(p_actor text, p_invite_id uuid, p_accept boolean)
returns boolean language plpgsql security definer set search_path = '' as $$
declare invitation public.friend_invites%rowtype;
begin
  select * into invitation from public.friend_invites where id = p_invite_id and recipient_username = p_actor;
  if not found then return false; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(least(invitation.sender_username, invitation.recipient_username) || ':' || greatest(invitation.sender_username, invitation.recipient_username), 0));
  select * into invitation from public.friend_invites where id = p_invite_id and recipient_username = p_actor for update;
  if not found then return false; end if;
  if p_accept then
    insert into public.friendships (username_a, username_b)
      values (least(invitation.sender_username, invitation.recipient_username), greatest(invitation.sender_username, invitation.recipient_username))
      on conflict do nothing;
  end if;
  delete from public.friend_invites where id = p_invite_id;
  return true;
end;
$$;

revoke all on function public.send_friend_invite(text, text) from public, anon, authenticated;
revoke all on function public.respond_to_friend_invite(text, uuid, boolean) from public, anon, authenticated;
grant execute on function public.send_friend_invite(text, text) to service_role;
grant execute on function public.respond_to_friend_invite(text, uuid, boolean) to service_role;
