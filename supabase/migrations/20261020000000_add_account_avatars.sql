alter table public.accounts add column avatar_path text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', false, 1048576, array['image/webp']);

comment on column public.accounts.avatar_path is
  'Current private avatars storage object. Uploads and downloads require an app session.';
