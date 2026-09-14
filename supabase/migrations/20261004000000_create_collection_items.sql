create table public.collection_items (
  item_id text primary key check (char_length(item_id) between 1 and 160),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

comment on table public.collection_items is
  'The owned item IDs for the single shared HIRONO collection.';

alter table public.collection_items enable row level security;

-- This app deliberately does not expose Supabase credentials to the browser.
-- All reads and writes go through authenticated Next.js route handlers using
-- the server-only service role, so the public API roles receive no table access.
revoke all on table public.collection_items from anon, authenticated;
