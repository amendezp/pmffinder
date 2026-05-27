-- Migration: split Stage 2 (Value Hypothesis) into three stages — The What,
-- The Who, The How. Renumbers existing stages 3..7 to 5..9.
--
-- Run this AFTER pulling the matching code. Idempotent guards included.
--
-- Mapping:
--   old 1 (Sourcing)            → new 1 (Sourcing)             [unchanged]
--   old 2 (Value Hypothesis)    → new 2 (The What)             [responses partially preserved]
--                                NEW stage 3 (The Who)         [inserted, in_progress, empty]
--                                NEW stage 4 (The How)         [inserted, in_progress, empty]
--   old 3 (Problem Validation)  → new 5
--   old 4 (Implementation)      → new 6
--   old 5 (MVP Metrics)         → new 7
--   old 6 (Surprise)            → new 8
--   old 7 (Decision Tree)       → new 9
--
-- Old stage-2 `responses` JSON contained the_what + the_who + the_how fields
-- jumbled together. This migration keeps the row in place at stage_number=2;
-- the user will re-fill the new stages 3 and 4 on next visit. The grader
-- safely ignores unknown fields, so old data won't crash anything.

begin;

-- 1. Drop the old check constraint so renumbering doesn't violate it mid-flight.
alter table stages drop constraint if exists stages_stage_number_check;
alter table evidence drop constraint if exists evidence_stage_number_check;
alter table stage_chats drop constraint if exists stage_chats_stage_number_check;

-- 2. Shift old stages 3..7 → 5..9. Do it in reverse so we never collide.
--    For stages: we have a unique (project_id, stage_number) constraint, so
--    we have to be careful. Move highest first.
update stages set stage_number = 9 where stage_number = 7;
update stages set stage_number = 8 where stage_number = 6;
update stages set stage_number = 7 where stage_number = 5;
update stages set stage_number = 6 where stage_number = 4;
update stages set stage_number = 5 where stage_number = 3;

update evidence set stage_number = 9 where stage_number = 7;
update evidence set stage_number = 8 where stage_number = 6;
update evidence set stage_number = 7 where stage_number = 5;
update evidence set stage_number = 6 where stage_number = 4;
update evidence set stage_number = 5 where stage_number = 3;

update stage_chats set stage_number = 9 where stage_number = 7;
update stage_chats set stage_number = 8 where stage_number = 6;
update stage_chats set stage_number = 7 where stage_number = 5;
update stage_chats set stage_number = 6 where stage_number = 4;
update stage_chats set stage_number = 5 where stage_number = 3;

-- 3. Seed the new stages 3 (The Who) and 4 (The How) for every existing project
--    that has a stage 2 row, so the journey UI shows them as in_progress.
insert into stages (project_id, stage_number, status)
select project_id, 3, 'in_progress'
from stages
where stage_number = 2
  and not exists (
    select 1 from stages s2
    where s2.project_id = stages.project_id and s2.stage_number = 3
  );

insert into stages (project_id, stage_number, status)
select project_id, 4, 'in_progress'
from stages
where stage_number = 2
  and not exists (
    select 1 from stages s2
    where s2.project_id = stages.project_id and s2.stage_number = 4
  );

-- 4. Re-add check constraints with the new bounds.
alter table stages add constraint stages_stage_number_check
  check (stage_number between 1 and 9);
alter table evidence add constraint evidence_stage_number_check
  check (stage_number between 1 and 9);
alter table stage_chats add constraint stage_chats_stage_number_check
  check (stage_number between 1 and 9);

commit;
