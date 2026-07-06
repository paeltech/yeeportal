-- Standardized member roles and education levels

create table member_roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table education_levels (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into member_roles (name, sort_order) values
  ('Chairperson', 1),
  ('Secretary', 2),
  ('Treasurer', 3),
  ('Loan officer', 4),
  ('Member', 5);

insert into education_levels (name, sort_order) values
  ('Primary', 1),
  ('Secondary', 2),
  ('VETA', 3),
  ('Tertiary', 4);

alter table member_roles enable row level security;
alter table education_levels enable row level security;

create policy "Public read active member roles" on member_roles
  for select using (is_active = true);

create policy "Staff read all member roles" on member_roles
  for select using (public.is_staff());

create policy "Staff manage member roles" on member_roles
  for all using (public.is_staff());

create policy "Public read active education levels" on education_levels
  for select using (is_active = true);

create policy "Staff read all education levels" on education_levels
  for select using (public.is_staff());

create policy "Staff manage education levels" on education_levels
  for all using (public.is_staff());
