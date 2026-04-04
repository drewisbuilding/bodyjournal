-- profiles: one row per user, created automatically on signup
create table profiles (
  id                       uuid primary key references auth.users(id) on delete cascade,
  created_at               timestamptz default now(),
  age                      int,
  height_inches            int,
  weight_lbs               numeric(5,1),
  goal                     text,
  gym_access_default       boolean default false,
  work_activity            text,
  equipment_home           text[],
  pain_notes               text,
  onboarding_completed_at  timestamptz
);

-- check_ins: one row per user per day (enforced by unique constraint)
create table check_ins (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references profiles(id) on delete cascade,
  created_at             timestamptz default now(),
  date                   date not null default current_date,
  gym_today              boolean default false,
  energy_level           int check (energy_level between 1 and 5),
  pain_level             int check (pain_level between 0 and 5),
  pain_location          text,
  time_available_minutes int,
  body_weight_lbs        numeric(5,1),
  meals_so_far           text,
  extra_notes            text,
  unique (user_id, date)
);

-- behavior_events: raw event log for the first 14 days
create table behavior_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id) on delete cascade,
  created_at  timestamptz default now(),
  event_name  text not null,
  metadata    jsonb
);

-- Row-level security: users only touch their own data
alter table profiles        enable row level security;
alter table check_ins       enable row level security;
alter table behavior_events enable row level security;

create policy "own profile"         on profiles        for all using (auth.uid() = id);
create policy "own check_ins"       on check_ins       for all using (auth.uid() = user_id);
create policy "own behavior_events" on behavior_events for all using (auth.uid() = user_id);

-- Automatically insert a blank profile row when a user signs up
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
