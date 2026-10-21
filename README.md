# Sci-Mat – Open Society: Registration

React + Vite + Tailwind CSS v4 + Supabase (PostgreSQL). No custom backend: the browser talks to Supabase directly, and Row Level Security limits the public key to inserting rows.

## Setup

1. **Create a Supabase project** at https://supabase.com.
2. **Create the table**: open *SQL Editor*, paste `supabase/schema.sql`, and run it.
3. **Add credentials**: copy `.env.example` to `.env` and fill in *Project Settings > API*:
   - `VITE_SUPABASE_URL` = Project URL
   - `VITE_SUPABASE_ANON_KEY` = the **anon / public** key (never the `service_role` key)
4. **Run**:
   ```bash
   npm install
   npm run dev      # http://localhost:5173
   npm run build    # production build in dist/
   ```
   Restart `npm run dev` after editing `.env`.

Without `.env`, the app runs in **demo mode**: a banner is shown, validation works, and nothing is saved or reported as saved.

## Security model

- RLS is enabled on `public.registrations`; the `anon` role has `INSERT` only, with no SELECT/UPDATE/DELETE policy. Records cannot be read with the public key. View them in the dashboard's Table Editor.
- The anon key is public by design and ships in the bundle. Safety comes from RLS, not from hiding the key.
- Table constraints enforce valid batch values, ID format, name length, and a unique `student_id`, so duplicates are rejected by the database even if someone bypasses the UI.
- Duplicate-submission protection in the UI: a ref lock, a disabled form while sending, and a locked success state.

## Deploy

Any static host works (Vercel, Netlify, Cloudflare Pages). Set the two `VITE_` variables in the host's environment settings and use `npm run build` with output dir `dist`.

## Optional hardening

Anyone holding the anon key can insert rows straight through the API, bypassing the form. To limit spam, put the site behind Cloudflare (Turnstile or WAF rate limiting) or rate-limit at your host.
