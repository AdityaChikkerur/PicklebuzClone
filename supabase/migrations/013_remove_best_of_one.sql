-- ============================================================================
-- PickleBuzz — 013_remove_best_of_one.sql
-- Remove single-game (best of 1) format; minimum is best of 3.
-- Run AFTER 012_match_integrity.sql.
-- ============================================================================

update public.matches set best_of = 3 where best_of = 1;
update public.match_rules set best_of = 3 where best_of = 1;
update public.tournaments set best_of = 3 where best_of = 1;

alter table public.matches
  drop constraint if exists matches_best_of_check;

alter table public.matches
  add constraint matches_best_of_check
  check (best_of in (3, 5));

alter table public.tournaments
  drop constraint if exists tournaments_best_of_check;

alter table public.tournaments
  add constraint tournaments_best_of_check
  check (best_of in (3, 5));

alter table public.match_rules
  drop constraint if exists match_rules_best_of_check;

alter table public.match_rules
  add constraint match_rules_best_of_check
  check (best_of in (3, 5));
