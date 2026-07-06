-- ============================================================================
-- PickleBuzz — 028_tournament_club_id.sql
-- Link tournaments to a club/venue record for discovery and booking.
-- Run AFTER 027_tournament_registration_url.sql.
-- ============================================================================

alter table public.tournaments
  add column if not exists club_id uuid references public.clubs(id) on delete set null;

create index if not exists idx_tournaments_club_id
  on public.tournaments(club_id)
  where club_id is not null;

comment on column public.tournaments.club_id is
  'Optional link to public.clubs — venue/address sync from the club row.';

update public.tournaments t
set
  club_id = c.id,
  venue = c.name,
  address = c.location
from public.clubs c
where t.name = 'Monsoon Pickleball Championship 4.0'
  and c.name = 'Nandanwan Lawn';
