-- PMFinder schema
-- Run this in your Supabase SQL editor after creating a new project.
-- See db/policies.sql for Row Level Security policies (run after this).

-- =========================================================================
-- Tables
-- =========================================================================

create table if not exists projects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists projects_user_idx on projects(user_id);

create table if not exists stages (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid references projects(id) on delete cascade not null,
  stage_number  int  not null check (stage_number between 1 and 8),
  status        text not null default 'locked'
    check (status in ('locked', 'in_progress', 'passed')),
  responses     jsonb not null default '{}'::jsonb,
  last_feedback jsonb,
  attempts      int  not null default 0,
  passed_at     timestamptz,
  updated_at    timestamptz not null default now(),
  unique (project_id, stage_number)
);

create index if not exists stages_project_idx on stages(project_id);

create table if not exists evidence (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid references projects(id) on delete cascade not null,
  stage_number  int  not null check (stage_number between 1 and 8),
  kind          text not null check (kind in ('image', 'pdf', 'audio', 'note')),
  storage_path  text,
  caption       text,
  tag           text,
  body          text,
  created_at    timestamptz not null default now()
);

create index if not exists evidence_project_stage_idx on evidence(project_id, stage_number);

create table if not exists stage_chats (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid references projects(id) on delete cascade not null,
  stage_number  int  not null check (stage_number between 1 and 8),
  messages      jsonb not null default '[]'::jsonb,
  updated_at    timestamptz not null default now(),
  unique (project_id, stage_number)
);

create table if not exists memos (
  id              uuid primary key default gen_random_uuid(),
  project_id      uuid references projects(id) on delete cascade not null,
  content         jsonb not null,
  generated_at    timestamptz not null default now(),
  share_token     uuid unique not null default gen_random_uuid(),
  is_public       boolean not null default false,
  view_count      int not null default 0,
  last_viewed_at  timestamptz
);

create index if not exists memos_project_idx on memos(project_id);
create index if not exists memos_share_token_idx on memos(share_token);

-- =========================================================================
-- updated_at triggers
-- =========================================================================

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists projects_updated on projects;
create trigger projects_updated before update on projects
  for each row execute function set_updated_at();

drop trigger if exists stages_updated on stages;
create trigger stages_updated before update on stages
  for each row execute function set_updated_at();

drop trigger if exists stage_chats_updated on stage_chats;
create trigger stage_chats_updated before update on stage_chats
  for each row execute function set_updated_at();

-- =========================================================================
-- Storage bucket (run separately in Storage UI or via SQL)
-- =========================================================================
-- Create a private bucket named 'evidence' in Supabase Storage.
-- Files are organized as: {user_id}/{project_id}/{stage_number}/{filename}
-- Access is via signed URLs generated server-side; never make this bucket public.
insert into storage.buckets (id, name, public)
values ('evidence', 'evidence', false)
on conflict (id) do nothing;
