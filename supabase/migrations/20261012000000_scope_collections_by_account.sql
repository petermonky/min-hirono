alter table public.collection_items
  add column account_username text not null default 'min'
  check (char_length(account_username) between 1 and 64);

alter table public.collection_items
  drop constraint collection_items_pkey,
  add primary key (account_username, item_id);

comment on table public.collection_items is
  'Owned HIRONO item IDs, isolated by account username.';

comment on column public.collection_items.account_username is
  'The configured account that owns this collection item. Existing rows belong to min.';
