create table public.friendships (
  username_a text not null references public.accounts(username) on delete cascade on update cascade,
  username_b text not null references public.accounts(username) on delete cascade on update cascade,
  created_at timestamptz not null default now(),
  primary key (username_a, username_b),
  check (username_a < username_b)
);

create index friendships_username_b_idx on public.friendships (username_b);
alter table public.friendships enable row level security;
revoke all on table public.friendships from anon, authenticated;

comment on table public.friendships is
  'Mutual friendships, stored once per pair in username order. Managed through server-only access; new accounts have no friends by default.';
