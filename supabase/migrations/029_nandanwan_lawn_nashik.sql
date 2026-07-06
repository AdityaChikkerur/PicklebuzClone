-- ============================================================================
-- PickleBuzz — 029_nandanwan_lawn_nashik.sql
-- Add Nandanwan Lawn (8th Nashik venue) and link Monsoon Championship.
-- Safe to run even if 028_tournament_club_id.sql was skipped.
-- ============================================================================

alter table public.tournaments
  add column if not exists registration_url text;

alter table public.tournaments
  add column if not exists club_id uuid references public.clubs(id) on delete set null;

create index if not exists idx_tournaments_club_id
  on public.tournaments(club_id)
  where club_id is not null;

do $$
declare
  v_owner uuid;
  v_club  uuid;
begin
  select id into v_owner from public.profiles order by created_at limit 1;

  if v_owner is null then
    raise notice 'No profiles found — skipping Nandanwan Lawn seed.';
    return;
  end if;

  if not exists (select 1 from public.clubs where name = 'Nandanwan Lawn') then
    insert into public.clubs (owner_id, name, city, location, amenities, contact, rating)
    values (
      v_owner,
      'Nandanwan Lawn',
      'Nashik',
      '2Q93+QW2, Atharv Colony, Savarkar Nagar, Nashik, Maharashtra 422013',
      '["event lawn","pickleball courts","tournament venue","parking","floodlights"]'::jsonb,
      '+91 98191 60273',
      4.7
    )
    returning id into v_club;

    insert into public.courts (club_id, name, surface, open_from, open_to) values
      (v_club, 'Court 1', 'Acrylic hard', '06:00', '23:00'),
      (v_club, 'Court 2', 'Acrylic hard', '06:00', '23:00'),
      (v_club, 'Court 3', 'Acrylic hard', '06:00', '23:00'),
      (v_club, 'Court 4', 'Acrylic hard', '06:00', '23:00');
  end if;
end $$;

update public.tournaments t
set
  club_id = c.id,
  venue = c.name,
  address = c.location,
  registration_url = coalesce(
    t.registration_url,
    'https://app.globalsports.net.in/sl/GvCkm6qv'
  )
from public.clubs c
where t.name = 'Monsoon Pickleball Championship 4.0'
  and c.name = 'Nandanwan Lawn';
