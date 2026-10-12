# your hirono

A private, multi-account HIRONO collection tracker built with Next.js, Tailwind CSS and Supabase.

## Local setup with OrbStack

Requirements: Node.js 20+, OrbStack running, and the project dependencies installed.

1. Start the local Supabase stack:

   ```sh
   npm run db:start
   ```

2. Print the local API URL and keys:

   ```sh
   npm run db:status
   ```

3. Copy `.env.example` to `.env.local` and set:

   - `HIRONO_SESSION_SECRET` to at least 32 random characters. You can generate one with `openssl rand -base64 32`.
   - `SUPABASE_URL` to the local API URL, configured for this project as `http://127.0.0.1:56321`.
   - `SUPABASE_SECRET_KEY` to the local `SECRET_KEY` shown by `npm run db:status`.

4. Start Next.js:

   ```sh
   npm run dev
   ```

The initial migration is applied by `supabase start`. HIRONO uses a dedicated port range so it can coexist with your other local Supabase projects. Local Studio is available at [http://127.0.0.1:56323](http://127.0.0.1:56323).

## Hosted Supabase setup

The hosted database is `min-hirono` (`dmufmfwkdwkhbhimumpb`) in `eu-central-1`. Link this repository and apply future migrations with:

```sh
npx supabase login
npm run db:link
npm run db:push
```

Set the same three environment variables in the Next.js hosting provider. Use `https://dmufmfwkdwkhbhimumpb.supabase.co` for `SUPABASE_URL` and the project's server-only `sb_secret_…` key for `SUPABASE_SECRET_KEY`. Never expose the secret key with a `NEXT_PUBLIC_` prefix. The legacy `SUPABASE_SERVICE_ROLE_KEY` name remains supported for older projects.

The app stores each account's progress separately in `collection_items`. Database access stays on the server behind the account login, and every collection query is scoped to the username in the signed session. Successful authentication creates a signed, HTTP-only, SameSite cookie containing the username and expiring after 30 days. Changing `HIRONO_SESSION_SECRET` immediately invalidates existing sessions.

Migration `20261012000000_scope_collections_by_account.sql` assigns every collection row that existed before accounts were introduced to `min`. Account credentials live in the private `accounts` table and passwords are stored only as salted bcrypt hashes. The app verifies passwords through a service-role-only database function, so password hashes are never sent to the browser.

To add an account in the Supabase SQL editor, run the following with a lowercase username and a private password. Its collection starts empty and remains isolated from every other account:

```sql
insert into public.accounts (username, password_hash)
values (
  'new_username',
  extensions.crypt('choose-a-private-password', extensions.gen_salt('bf', 12))
);
```

## Deploying with Vercel

Import the Git repository into Vercel as a Next.js project. The framework, build command and output settings can remain on Vercel's defaults.

In **Project → Settings → Environment Variables**, add these variables for the **Production** environment:

| Variable | Value |
| --- | --- |
| `HIRONO_SESSION_SECRET` | A stable random value of at least 32 characters. Generate one locally with `openssl rand -base64 48`. |
| `SUPABASE_URL` | `https://dmufmfwkdwkhbhimumpb.supabase.co` |
| `SUPABASE_SECRET_KEY` | The `sb_secret_…` key from **Supabase → min-hirono → Connect → App Frameworks/API Keys**. |

Apply the same three variables to **Preview** only if preview deployments should access the real account collections. Otherwise, do not share preview URLs and production secrets. Local development continues to use the ignored `.env.local` file and the OrbStack-backed database.

Important:

- Do not prefix any of these names with `NEXT_PUBLIC_`.
- Do not use the publishable or anon key for `SUPABASE_SECRET_KEY`.
- Keep `HIRONO_SESSION_SECRET` stable between production deployments. Rotating it signs everyone out.
- After adding or changing variables, redeploy the latest Vercel deployment so the new values take effect.
- Vercel provides HTTPS, so the production session cookie is automatically sent with its required `Secure` flag.

The same variables can be added from the Vercel CLI if preferred:

```sh
vercel env add HIRONO_SESSION_SECRET production --sensitive
vercel env add SUPABASE_URL production
vercel env add SUPABASE_SECRET_KEY production --sensitive
```

Each command prompts for the value without adding it to Git.

## Database commands

```sh
npm run db:start   # Start the local stack
npm run db:status  # Show local endpoints and keys
npm run db:reset   # Rebuild the local database from migrations
npm run db:stop    # Stop the local stack without deleting its data
npm run db:link    # Link to the hosted min-hirono project
npm run db:push    # Apply committed migrations to the linked hosted project
```
