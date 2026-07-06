-- ============================================================================
-- PickleBuzz — 027_tournament_registration_url.sql
-- External registration link for tournaments hosted on partner platforms.
-- Run AFTER 026_monsoon_pickleball_championship.sql.
-- ============================================================================

alter table public.tournaments
  add column if not exists registration_url text;

comment on column public.tournaments.registration_url is
  'When set, Register sends players to this external URL (e.g. Global Sports).';

update public.tournaments t
set
  registration_url = 'https://app.globalsports.net.in/sl/GvCkm6qv',
  club_id = c.id,
  venue = c.name,
  address = c.location
from public.clubs c
where t.name = 'Monsoon Pickleball Championship 4.0'
  and c.name = 'Nandanwan Lawn';
