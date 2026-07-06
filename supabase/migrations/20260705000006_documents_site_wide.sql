-- Allow programme-wide public documents (not tied to a group)

alter table documents alter column group_slug drop not null;
alter table documents alter column group_name drop not null;

alter table documents add constraint documents_group_scope_check check (
  (group_slug is null and group_name is null)
  or (group_slug is not null and group_name is not null)
);

create index if not exists documents_site_idx on documents (uploaded_at desc)
  where group_slug is null;
