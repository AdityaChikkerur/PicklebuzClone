-- PickleBuzz — 003_phase2_has_referee.sql (Phase 2)
-- Persist referee flag from match setup wizard.

alter table public.matches
  add column if not exists has_referee boolean not null default false;
