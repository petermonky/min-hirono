create table public.wishlist_items (
  account_username text not null references public.accounts(username) on update cascade on delete cascade,
  item_id text not null check (char_length(item_id) between 1 and 160),
  created_at timestamptz not null default now(),
  primary key (account_username, item_id)
);

alter table public.wishlist_items enable row level security;
revoke all on table public.wishlist_items from anon, authenticated;

comment on table public.wishlist_items is
  'Account-specific wishlists, independent of collection ownership. Accessed through authenticated app routes.';
