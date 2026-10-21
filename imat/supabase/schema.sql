-- Run in Supabase > SQL Editor.
create table if not exists public.registrations (
  id          uuid primary key default gen_random_uuid(),
  full_name   text     not null check (char_length(btrim(full_name)) between 2 and 80),
  batch       smallint not null check (batch in (2024, 2025, 2026)),
  student_id  text     not null check (student_id ~ '^[0-9]{4,12}$'),
  created_at  timestamptz not null default now(),
  constraint registrations_student_id_key unique (student_id)
);

alter table public.registrations enable row level security;

-- Public visitors may INSERT only. No select/update/delete policies exist,
-- so records cannot be read or changed with the anon key.
drop policy if exists "public can register" on public.registrations;
create policy "public can register"
  on public.registrations for insert
  to anon
  with check (true);

revoke all on public.registrations from anon, authenticated;
grant insert on public.registrations to anon;
-- View registrations in the Supabase dashboard (Table Editor) or with the service role on a trusted machine.
