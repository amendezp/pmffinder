-- Migration: drop the Decision Tree stage. Journey is now 8 stages, not 9.
--
-- Run this AFTER pulling the matching code. Idempotent (safe to re-run).
--
-- What it does:
--   1. Deletes any rows where stage_number = 9 from stages / evidence /
--      stage_chats (this was the old Decision Tree stage).
--   2. Tightens the check constraint from `between 1 and 9` back to
--      `between 1 and 8`.
--
-- If you never ran migration 001 (your DB is fresh and schema.sql was the
-- first thing you ran), you don't need this migration either — the latest
-- schema.sql already has `between 1 and 8`.

begin;

-- 1. Drop stage-9 data first.
delete from stage_chats where stage_number = 9;
delete from evidence    where stage_number = 9;
delete from stages      where stage_number = 9;

-- 2. Swap the check constraints.
alter table stages       drop constraint if exists stages_stage_number_check;
alter table evidence     drop constraint if exists evidence_stage_number_check;
alter table stage_chats  drop constraint if exists stage_chats_stage_number_check;

alter table stages       add constraint stages_stage_number_check
  check (stage_number between 1 and 8);
alter table evidence     add constraint evidence_stage_number_check
  check (stage_number between 1 and 8);
alter table stage_chats  add constraint stage_chats_stage_number_check
  check (stage_number between 1 and 8);

commit;
