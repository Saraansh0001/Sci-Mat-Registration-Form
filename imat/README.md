# Sci-Mat – Open Society registration

React + Vite + Tailwind CSS v4 + Supabase (Postgres). No custom backend.

## Setup
1. Create a project at supabase.com.
2. SQL Editor: paste and run `supabase/schema.sql` (creates the table, enables RLS, allows anonymous INSERT only).
3. Project Settings > API: copy the Project URL and the **anon public** key.
4. `cp .env.example .env` and fill in both values. Never use the `service_role` key here.
5. `npm install`, then `npm run dev` (or `npm run build` for production in `dist/`).

Without a `.env`, the app runs in clearly labelled demo mode and saves nothing.

## Security notes
- RLS is on; the only policy is INSERT for `anon`. The anon key cannot read, update or delete rows.
- Duplicates are blocked by a unique constraint on `student_id` (plus a client-side submit lock).
- View registrations in the Supabase dashboard Table Editor.
- The anon key ships in the browser by design; add CAPTCHA or rate limiting later if spam becomes an issue.
- Student ID is validated as 4–12 digits (client and DB). Edit both if your IDs differ.
- Deploying: set the same two `VITE_` variables in your host (Vercel, Netlify).
