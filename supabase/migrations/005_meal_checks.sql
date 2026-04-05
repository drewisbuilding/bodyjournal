create table meal_checks (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references profiles(id) on delete cascade,
  created_at             timestamptz default now(),
  date                   date not null default current_date,
  meal_context           text,
  input_text             text not null,
  estimated_calories     int,
  estimated_protein_g    int,
  estimated_carbs_g      int,
  estimated_fats_g       int,
  confidence             text,
  status                 text,
  action                 text,
  recommendation_summary text,
  what_to_eat_next       jsonb,
  pre_post_workout       text,
  raw_ai_response        jsonb
);

alter table meal_checks enable row level security;
create policy "own meal_checks" on meal_checks
  for all using (auth.uid() = user_id);

create index meal_checks_user_id_idx   on meal_checks (user_id);
create index meal_checks_user_date_idx on meal_checks (user_id, date);
