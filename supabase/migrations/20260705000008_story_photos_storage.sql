-- Public bucket for homepage story photos

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'story-photos',
  'story-photos',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
on conflict (id) do nothing;

create policy "Public read story photos"
  on storage.objects for select
  using (bucket_id = 'story-photos');

create policy "Staff upload story photos"
  on storage.objects for insert
  with check (bucket_id = 'story-photos' and public.is_staff());

create policy "Staff update story photos"
  on storage.objects for update
  using (bucket_id = 'story-photos' and public.is_staff());

create policy "Staff delete story photos"
  on storage.objects for delete
  using (bucket_id = 'story-photos' and public.is_staff());
