-- Run in Supabase > SQL Editor.

create table if not exists public.registrations (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null check (char_length(btrim(full_name)) between 2 and 100),
  batch       text not null check (batch in ('2024', '2025', '2026')),
  student_id  text not null check (student_id ~ '^[0-9]{4,10}$'),
  created_at  timestamptz not null default now(),
  constraint registrations_student_id_key unique (student_id)  -- blocks duplicates
);

alter table public.registrations enable row level security;

-- Start from zero access, then grant INSERT only to the public (anon) role.
revoke all on public.registrations from anon, authenticated;
grant insert on public.registrations to anon;

drop policy if exists "Public can register" on public.registrations;
create policy "Public can register"
  on public.registrations
  for insert
  to anon
  with check (true);

-- No SELECT / UPDATE / DELETE policies exist, so records cannot be read or changed
-- with the anon key. View them in the Supabase dashboard (Table Editor) instead.
