-- Documents table for group constitutions, registration certificates, and other files
-- Run when connecting Supabase; replaces in-memory store in src/lib/documents/store.ts

create type document_type as enum (
  'constitution',
  'registration_certificate',
  'other'
);

create table if not exists documents (
  id text primary key,
  group_slug text not null,
  group_name text not null,
  type document_type not null,
  title text not null,
  file_name text not null,
  file_url text not null,
  storage_path text,
  mime_type text not null default 'application/pdf',
  file_size_bytes bigint not null default 0,
  is_public boolean not null default true,
  uploaded_at timestamptz not null default now(),
  uploaded_by uuid references auth.users(id)
);

create index if not exists documents_group_slug_idx on documents (group_slug);
create index if not exists documents_type_idx on documents (type);

-- Track email-gated download requests
create table if not exists document_download_requests (
  id uuid primary key default gen_random_uuid(),
  document_id text not null references documents(id) on delete cascade,
  email text not null,
  token text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists document_download_requests_token_idx
  on document_download_requests (token);

-- RLS (enable after auth is connected)
-- alter table documents enable row level security;
-- Public can read public documents; admins/field officers can manage
