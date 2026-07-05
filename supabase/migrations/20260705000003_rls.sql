-- Row Level Security policies

alter table wards enable row level security;
alter table groups enable row level security;
alter table profiles enable row level security;
alter table group_members enable row level security;
alter table training_modules enable row level security;
alter table training_completions enable row level security;
alter table savings_records enable row level security;
alter table form_submissions enable row level security;
alter table documents enable row level security;
alter table document_download_requests enable row level security;
alter table audit_events enable row level security;

-- Helper: current user's role
create or replace function public.current_user_role()
returns user_role
language sql stable security definer set search_path = public
as $$
  select role from profiles where id = auth.uid()
$$;

create or replace function public.current_user_group_id()
returns uuid
language sql stable security definer set search_path = public
as $$
  select group_id from profiles where id = auth.uid()
$$;

create or replace function public.is_staff()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce(
    (select role in ('super_admin', 'program_manager', 'field_officer')
     from profiles where id = auth.uid()),
    false
  )
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce(
    (select role in ('super_admin', 'program_manager')
     from profiles where id = auth.uid()),
    false
  )
$$;

-- Wards & groups: public read active groups
create policy "Public read wards" on wards for select using (true);

create policy "Public read active groups" on groups
  for select using (status = 'active');

create policy "Staff manage groups" on groups
  for all using (public.is_staff());

-- Profiles
create policy "Users read own profile" on profiles
  for select using (auth.uid() = id);

create policy "Admins read all profiles" on profiles
  for select using (public.is_admin());

create policy "Admins update profiles" on profiles
  for update using (public.is_admin());

create policy "Users update own profile name" on profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

-- Group members: public read (anonymized view handled in app), leaders manage own group
create policy "Public read group members" on group_members
  for select using (true);

create policy "Staff manage members" on group_members
  for all using (public.is_staff());

create policy "Group leaders manage own group members" on group_members
  for all using (
    public.current_user_role() = 'group_leader'
    and group_id = public.current_user_group_id()
  );

-- Trainings
create policy "Public read training modules" on training_modules for select using (true);
create policy "Staff manage training modules" on training_modules for all using (public.is_staff());

create policy "Public read training completions" on training_completions for select using (true);
create policy "Staff manage training completions" on training_completions for all using (public.is_staff());

-- Savings
create policy "Staff read savings" on savings_records for select using (public.is_staff());
create policy "Group leaders read own savings" on savings_records
  for select using (
    group_id = public.current_user_group_id()
    and public.current_user_role() in ('group_leader', 'member')
  );
create policy "Staff manage savings" on savings_records for all using (public.is_staff());
create policy "Group leaders insert savings" on savings_records
  for insert with check (
    group_id = public.current_user_group_id()
    and public.current_user_role() = 'group_leader'
  );

-- Forms
create policy "Anyone can submit interest forms" on form_submissions
  for insert with check (form_type = 'interest_application');

create policy "Authenticated submit forms" on form_submissions
  for insert with check (auth.uid() is not null);

create policy "Staff read all submissions" on form_submissions
  for select using (public.is_staff());

create policy "Staff review submissions" on form_submissions
  for update using (public.is_admin() or public.current_user_role() = 'program_manager');

create policy "Submitters read own" on form_submissions
  for select using (submitted_by = auth.uid());

-- Documents
create policy "Public read public documents" on documents
  for select using (is_public = true);

create policy "Staff manage documents" on documents
  for all using (public.is_staff());

-- Download requests: server-side only via service role (no public insert policy)
create policy "Staff read download requests" on document_download_requests
  for select using (public.is_admin());

-- Audit
create policy "Admins read audit" on audit_events
  for select using (public.is_admin());

create policy "Staff insert audit" on audit_events
  for insert with check (public.is_staff());

-- Storage bucket policies (run in Supabase dashboard or separate migration)
-- insert into storage.buckets (id, name, public) values ('group-documents', 'group-documents', false);
