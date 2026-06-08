create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null default 'Engineer',
  github_username text not null default '',
  bio text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  level text not null default 'Beginner',
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  focus text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.learning_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  status text not null default 'Planned',
  target_date date,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  stage text not null default 'Discovery',
  health text not null default 'Green',
  summary text not null default '',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.skills enable row level security;
alter table public.learning_goals enable row level security;
alter table public.projects enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "skills_crud_own" on public.skills;
drop policy if exists "learning_goals_crud_own" on public.learning_goals;
drop policy if exists "projects_crud_own" on public.projects;

create policy "profiles_select_own" on public.profiles
for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
for update using (auth.uid() = id);

create policy "skills_crud_own" on public.skills
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "learning_goals_crud_own" on public.learning_goals
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "projects_crud_own" on public.projects
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
