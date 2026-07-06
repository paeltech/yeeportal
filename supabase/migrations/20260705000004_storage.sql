-- Storage bucket for group document uploads (constitutions, certificates)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'group-documents',
  'group-documents',
  false,
  52428800,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Staff can upload and manage documents
create policy "Staff upload group documents"
  on storage.objects for insert
  with check (
    bucket_id = 'group-documents'
    and public.is_staff()
  );

create policy "Staff update group documents"
  on storage.objects for update
  using (bucket_id = 'group-documents' and public.is_staff());

create policy "Staff delete group documents"
  on storage.objects for delete
  using (bucket_id = 'group-documents' and public.is_staff());

-- Public read via signed URLs only (no direct public bucket access)
create policy "Staff read group documents"
  on storage.objects for select
  using (bucket_id = 'group-documents' and public.is_staff());

-- Service role bypasses RLS for server-side signed URL generation
