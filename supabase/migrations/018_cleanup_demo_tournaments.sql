-- ============================================================================
-- PickleBuzz — 018_cleanup_demo_tournaments.sql
-- Remove seed and mid-session demo tournaments from production.
-- Child rows cascade (registrations, fixtures, points_table, etc.).
-- Run AFTER 017_cleanup_demo_live_matches.sql.
-- ============================================================================

-- Notifications that only reference removed demo tournaments.
delete from public.notifications
where link like '/tournament/%'
  and link in (
    select '/tournament/' || t.id::text
    from public.tournaments t
    where t.name in (
      'Nashik Open 2026',
      'Pune Smash League',
      'Monsoon Cup',
      'Bangalore Open',
      'Mumbai'
    )
  );

delete from public.tournaments
where name in (
  'Nashik Open 2026',
  'Pune Smash League',
  'Monsoon Cup',
  'Bangalore Open',
  'Mumbai'
);
