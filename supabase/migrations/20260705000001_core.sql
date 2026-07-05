-- Core schema: wards, groups, profiles, members, trainings, savings, forms, audit

create type user_role as enum (
  'super_admin',
  'program_manager',
  'field_officer',
  'group_leader',
  'member'
);

create type group_tier as enum ('A', 'B', 'C');
create type group_status as enum ('active', 'pending', 'inactive');

create type submission_status as enum ('pending', 'approved', 'rejected');

create type form_type as enum (
  'interest_application',
  'group_registration',
  'member_registration',
  'savings_meeting',
  'training_completion'
);

create table wards (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  district text not null default 'Dar es Salaam',
  created_at timestamptz not null default now()
);

create table groups (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  ward_id uuid not null references wards(id),
  focus text not null,
  member_count int not null default 0,
  savings_total numeric not null default 0,
  savings_display text not null default 'TZS 0',
  readiness_score int not null default 0 check (readiness_score between 0 and 100),
  tier group_tier not null default 'C',
  cycle_number int not null default 1,
  cycle_label text not null default 'Cycle 1',
  repayment_rate text not null default '100%',
  status group_status not null default 'active',
  mentor_name text,
  meeting_day text,
  formed_year int,
  contact_phone text,
  loan_balance_display text,
  next_disbursement text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index groups_ward_id_idx on groups (ward_id);
create index groups_slug_idx on groups (slug);
create index groups_status_idx on groups (status);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  role user_role not null default 'member',
  ward_id uuid references wards(id),
  group_id uuid references groups(id),
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on profiles (role);
create index profiles_group_id_idx on profiles (group_id);

create table group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  profile_id uuid references profiles(id),
  full_name text not null,
  age int not null check (age >= 16),
  sex text not null check (sex in ('F', 'M')),
  member_role text not null default 'Member',
  education text not null,
  contribution_display text not null default 'TZS 0',
  contribution_amount numeric not null default 0,
  created_at timestamptz not null default now()
);

create index group_members_group_id_idx on group_members (group_id);

create table training_modules (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order int not null default 0
);

create table training_completions (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  module_id uuid not null references training_modules(id),
  members_completed int not null default 0,
  completed_at date not null default current_date,
  recorded_by uuid references profiles(id),
  unique (group_id, module_id, completed_at)
);

create table savings_records (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  meeting_date date not null,
  amount numeric not null default 0,
  notes text,
  recorded_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create index savings_records_group_id_idx on savings_records (group_id);

create table form_submissions (
  id uuid primary key default gen_random_uuid(),
  form_type form_type not null,
  status submission_status not null default 'pending',
  payload jsonb not null default '{}',
  group_id uuid references groups(id),
  submitted_by uuid references profiles(id),
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz not null default now()
);

create index form_submissions_type_idx on form_submissions (form_type);
create index form_submissions_status_idx on form_submissions (status);

create table audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id),
  action text not null,
  entity_type text not null,
  entity_id text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index audit_events_created_at_idx on audit_events (created_at desc);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'member')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger groups_updated_at before update on groups
  for each row execute function public.set_updated_at();

create trigger profiles_updated_at before update on profiles
  for each row execute function public.set_updated_at();
