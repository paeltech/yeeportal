-- Field stories for the public homepage

create table stories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  excerpt text not null,
  ward_label text not null,
  image_url text not null,
  storage_path text,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index stories_published_sort_idx on stories (is_published, sort_order);

alter table stories enable row level security;

create policy "Public read published stories" on stories
  for select using (is_published = true);

create policy "Staff read all stories" on stories
  for select using (public.is_staff());

create policy "Staff manage stories" on stories
  for all using (public.is_staff());

create trigger stories_updated_at before update on stories
  for each row execute function public.set_updated_at();
