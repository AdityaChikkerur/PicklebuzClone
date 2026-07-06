-- ============================================================================
-- PickleBuzz — 025_tournament_category_name.sql
-- Add display name to tournament categories (e.g. "Pro Mens Doubles").
-- Run AFTER 024_nashik_venues.sql.
-- ============================================================================

alter table public.tournament_categories
  add column if not exists name text;

comment on column public.tournament_categories.name is
  'Human-readable division label. Falls back to category_type + skill_level in the app when null.';
