-- Supabase setup for the portfolio admin panel.
-- Run this in Supabase Dashboard -> SQL Editor.

create table if not exists public.cvs (
  lang text primary key check (lang in ('en', 'fr')),
  data jsonb,
  file_path text,
  file_name text,
  file_size bigint,
  file_url text,
  uploaded_at timestamptz,
  updated_at timestamptz default now()
);

alter table public.cvs enable row level security;

drop policy if exists "Public can read CV data" on public.cvs;
drop policy if exists "Authenticated users can insert CV data" on public.cvs;
drop policy if exists "Authenticated users can update CV data" on public.cvs;
drop policy if exists "Authenticated users can delete CV data" on public.cvs;

create policy "Public can read CV data"
on public.cvs
for select
to anon, authenticated
using (true);

create policy "Authenticated users can insert CV data"
on public.cvs
for insert
to authenticated
with check (true);

create policy "Authenticated users can update CV data"
on public.cvs
for update
to authenticated
using (true)
with check (true);

create policy "Authenticated users can delete CV data"
on public.cvs
for delete
to authenticated
using (true);

insert into storage.buckets (id, name, public)
values ('cvs', 'cvs', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public can read CV PDFs" on storage.objects;
drop policy if exists "Authenticated users can upload CV PDFs" on storage.objects;
drop policy if exists "Authenticated users can update CV PDFs" on storage.objects;
drop policy if exists "Authenticated users can delete CV PDFs" on storage.objects;

create policy "Public can read CV PDFs"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'cvs');

create policy "Authenticated users can upload CV PDFs"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'cvs');

create policy "Authenticated users can update CV PDFs"
on storage.objects
for update
to authenticated
using (bucket_id = 'cvs')
with check (bucket_id = 'cvs');

create policy "Authenticated users can delete CV PDFs"
on storage.objects
for delete
to authenticated
using (bucket_id = 'cvs');

