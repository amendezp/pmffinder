-- Migration: drop the standalone Savor the Surprise stage. Its content has
-- been absorbed as a single field on Stage 7 (MVP Metrics). Journey is now
-- 7 stages.
--
-- Run this AFTER pulling the matching code. Idempotent (safe to re-run).
--
-- What it does:
--   1. Deletes any rows where stage_number = 8 from stages / evidence /
--      stage_chats (the old Savor the Surprise stage).
--   2. Tightens the check constraint from `between 1 and 8` back to
--      `between 1 and 7`.
--
-- If you never ran migrations 001 or 002, you don't need this either —
-- the latest schema.sql already has `between 1 and 7`.

begin;

-- 1. Drop stage-8 data first.
delete from stage_chats where stage_number = 8;
delete from evidence    where stage_number = 8;
delete from stages      where stage_number = 8;

-- 2. Swap the check constraints.
alter table stages       drop constraint if exists stages_stage_number_check;
alter table evidence     drop constraint if exists evidence_stage_number_check;
alter table stage_chats  drop constraint if exists stage_chats_stage_number_check;

alter table stages       add constraint stages_stage_number_check
  check (stage_number between 1 and 7);
alter table evidence     add constraint evidence_stage_number_check
  check (stage_number between 1 and 7);
alter table stage_chats  add constraint stage_chats_stage_number_check
  check (stage_number between 1 and 7);

commit;
