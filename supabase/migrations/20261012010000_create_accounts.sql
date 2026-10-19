create table public.accounts (
  username text primary key
    check (username ~ '^[a-z0-9][a-z0-9_-]{0,63}$'),
  password_hash text not null
    check (char_length(password_hash) between 20 and 200),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

comment on table public.accounts is
  'Private HIRONO accounts. Passwords are stored only as salted bcrypt hashes.';

alter table public.accounts enable row level security;
revoke all on table public.accounts from anon, authenticated;

alter table public.collection_items
  add constraint collection_items_account_username_fkey
  foreign key (account_username)
  references public.accounts (username)
  on update cascade
  on delete restrict;

create function public.verify_account_credentials(p_username text, p_password text)
returns text
language sql
security definer
set search_path = ''
as $$
  select username
  from public.accounts
  where username = p_username
    and password_hash = extensions.crypt(p_password, password_hash)
  limit 1;
$$;

revoke all on function public.verify_account_credentials(text, text) from public, anon, authenticated;
grant execute on function public.verify_account_credentials(text, text) to service_role;

comment on function public.verify_account_credentials(text, text) is
  'Checks an account password against its bcrypt hash without exposing password hashes to the app.';
