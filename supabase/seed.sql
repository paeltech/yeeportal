-- Seed wards
insert into wards (name, district) values
  ('Kinondoni', 'Dar es Salaam'),
  ('Temeke', 'Dar es Salaam'),
  ('Ilala', 'Dar es Salaam'),
  ('Ubungo', 'Dar es Salaam'),
  ('Kigamboni', 'Dar es Salaam')
on conflict (name) do nothing;

-- Seed training modules
insert into training_modules (name, sort_order) values
  ('Financial literacy', 1),
  ('Entrepreneurship', 2),
  ('GBV prevention', 3),
  ('SRHR', 4),
  ('Digital skills', 5),
  ('Life skills', 6),
  ('Market linkages', 7)
on conflict (name) do nothing;

-- Run scripts/seed-groups.ts after migrations to populate groups from static data
-- Or use: npx tsx scripts/seed-groups.ts
