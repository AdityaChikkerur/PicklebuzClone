-- ============================================================================
-- PickleBuzz — 017_cleanup_demo_live_matches.sql
-- Remove abandoned demo live matches (mid-session test data).
-- Child rows cascade; tournament fixtures unlink via ON DELETE SET NULL.
-- Run AFTER 016_public_live_visibility.sql.
-- ============================================================================

-- Orphaned invite/scoring notifications for matches we are removing.
delete from public.notifications n
using public.matches m
where m.status = 'live'
  and (
    n.link = '/live-scoring/' || m.id::text
    or n.link = '/match-invite/' || m.id::text
    or n.link = '/match/' || m.id::text
    or n.link = '/spectate/' || m.id::text
  );

delete from public.matches
where status = 'live';
