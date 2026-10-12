create function public.update_account_password(p_username text, p_password text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if char_length(p_password) < 6 or char_length(p_password) > 256 then
    raise exception 'Password must be between 6 and 256 characters.';
  end if;

  update public.accounts
  set
    password_hash = extensions.crypt(p_password, extensions.gen_salt('bf', 12)),
    updated_at = timezone('utc', now())
  where username = p_username;

  return found;
end;
$$;

revoke all on function public.update_account_password(text, text) from public, anon, authenticated;
grant execute on function public.update_account_password(text, text) to service_role;

comment on function public.update_account_password(text, text) is
  'Replaces an account password with a salted bcrypt hash without exposing password hashes to the app.';
