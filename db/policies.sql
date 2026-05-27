-- PMFinder Row Level Security policies.
-- Run AFTER db/schema.sql.

-- =========================================================================
-- Enable RLS
-- =========================================================================
alter table projects     enable row level security;
alter table stages       enable row level security;
alter table evidence     enable row level security;
alter table stage_chats  enable row level security;
alter table memos        enable row level security;

-- =========================================================================
-- projects
-- =========================================================================
drop policy if exists "projects: owner all" on projects;
create policy "projects: owner all" on projects
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =========================================================================
-- stages
-- =========================================================================
drop policy if exists "stages: owner all" on stages;
create policy "stages: owner all" on stages
  for all using (
    exists (select 1 from projects p where p.id = stages.project_id and p.user_id = auth.uid())
  )
  with check (
    exists (select 1 from projects p where p.id = stages.project_id and p.user_id = auth.uid())
  );

-- =========================================================================
-- evidence
-- =========================================================================
drop policy if exists "evidence: owner all" on evidence;
create policy "evidence: owner all" on evidence
  for all using (
    exists (select 1 from projects p where p.id = evidence.project_id and p.user_id = auth.uid())
  )
  with check (
    exists (select 1 from projects p where p.id = evidence.project_id and p.user_id = auth.uid())
  );

-- =========================================================================
-- stage_chats
-- =========================================================================
drop policy if exists "stage_chats: owner all" on stage_chats;
create policy "stage_chats: owner all" on stage_chats
  for all using (
    exists (select 1 from projects p where p.id = stage_chats.project_id and p.user_id = auth.uid())
  )
  with check (
    exists (select 1 from projects p where p.id = stage_chats.project_id and p.user_id = auth.uid())
  );

-- =========================================================================
-- memos — owner all + public read when is_public
-- =========================================================================
drop policy if exists "memos: owner all" on memos;
create policy "memos: owner all" on memos
  for all using (
    exists (select 1 from projects p where p.id = memos.project_id and p.user_id = auth.uid())
  )
  with check (
    exists (select 1 from projects p where p.id = memos.project_id and p.user_id = auth.uid())
  );

-- Public read of memos when is_public = true (used by /m/[token]).
-- The route also checks is_public server-side as defense-in-depth.
drop policy if exists "memos: public read when shared" on memos;
create policy "memos: public read when shared" on memos
  for select using (is_public = true);

-- =========================================================================
-- Storage policies for the 'evidence' bucket
-- =========================================================================
-- Path convention: {user_id}/{project_id}/{stage_number}/{filename}
-- The first folder MUST equal auth.uid()::text.

drop policy if exists "evidence storage: owner read" on storage.objects;
create policy "evidence storage: owner read" on storage.objects
  for select using (
    bucket_id = 'evidence' and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "evidence storage: owner insert" on storage.objects;
create policy "evidence storage: owner insert" on storage.objects
  for insert with check (
    bucket_id = 'evidence' and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "evidence storage: owner delete" on storage.objects;
create policy "evidence storage: owner delete" on storage.objects
  for delete using (
    bucket_id = 'evidence' and auth.uid()::text = (storage.foldername(name))[1]
  );
