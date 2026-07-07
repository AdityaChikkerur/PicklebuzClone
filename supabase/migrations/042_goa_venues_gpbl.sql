-- ============================================================================
-- PickleBuzz — 042_goa_venues_gpbl.sql
-- Goa venues + Goa Pickleball League (GPBL) 2026.
-- Run AFTER 041_tournament_match_management.sql.
-- ============================================================================

do $$
declare
  v_owner      uuid;
  v_club       uuid;
  v_club_id    uuid;
  v_tournament uuid;
  v_description text;
begin
  select id into v_owner from public.profiles order by created_at limit 1;

  if v_owner is null then
    raise notice 'No profiles found — skipping Goa venue seed. Create a user first.';
    return;
  end if;

  -- Clube De Floresta (North Goa)
  if not exists (select 1 from public.clubs where name = 'Clube De Floresta') then
    insert into public.clubs (owner_id, name, city, location, amenities, contact, rating)
    values (
      v_owner,
      'Clube De Floresta',
      'Goa',
      'Plot SY 199/1, Bouta Waddo, Assagao, Bardez, North Goa 403507',
      '["pickleball court","padel","badminton","parking"]'::jsonb,
      '+91 90290 61288',
      4.8
    )
    returning id into v_club;

    insert into public.courts (club_id, name, surface, open_from, open_to) values
      (v_club, 'Court 1', 'Acrylic hard', '06:00', '23:00'),
      (v_club, 'Court 2', 'Acrylic hard', '06:00', '23:00'),
      (v_club, 'Court 3', 'Acrylic hard', '06:00', '23:00'),
      (v_club, 'Court 4', 'Acrylic hard', '06:00', '23:00');
  end if;

  -- The Racquet Clube by SOGOfit (South Goa)
  if not exists (select 1 from public.clubs where name = 'The Racquet Clube by SOGOfit') then
    insert into public.clubs (owner_id, name, city, location, amenities, contact, rating)
    values (
      v_owner,
      'The Racquet Clube by SOGOfit',
      'Goa',
      'Saint Joaquim Road, next to Kande Celestia, Borda, Madgaon, South Goa',
      '["pickleball court","indoor courts","coaching","cafe"]'::jsonb,
      '+91 92259 89803',
      4.9
    )
    returning id into v_club;

    insert into public.courts (club_id, name, surface, open_from, open_to) values
      (v_club, 'Court 1', 'Acrylic hard', '06:00', '23:00'),
      (v_club, 'Court 2', 'Acrylic hard', '06:00', '23:00'),
      (v_club, 'Court 3', 'Acrylic hard', '06:00', '23:00');
  end if;
end $$;

do $$
declare
  v_owner       uuid;
  v_tournament  uuid;
  v_club_id     uuid;
  v_description text;
begin
  v_description :=
    'Goa Pickleball League (GPBL) — Goa''s first franchise pickleball league.' || E'\n\n' ||
    'Six franchises. One month of competition. ₹3,00,000 prize pool.' || E'\n\n' ||
    'Venues' || E'\n' ||
    '- North Goa: Clube De Floresta, Assagao' || E'\n' ||
    '- South Goa: The Racquet Clube by SOGOfit, Madgaon' || E'\n\n' ||
    'League Weekends' || E'\n' ||
    '- 15 & 16 August 2026' || E'\n' ||
    '- 21 & 22 August 2026' || E'\n' ||
    '- 29 & 30 August 2026' || E'\n\n' ||
    'Player Auction' || E'\n' ||
    '- Inaugural GPBL Player Auction: 18 July 2026' || E'\n' ||
    '- Six franchise owners bid on registered players to build their squads' || E'\n' ||
    '- Players are assigned base prices (Marquee, Advance, or Intermediate) before the auction' || E'\n' ||
    '- Once registered, a player cannot refuse to play for the franchise that purchases them' || E'\n\n' ||
    'Registration & Eligibility' || E'\n' ||
    '- Individual registrations only — players enter the official GPBL Auction Pool' || E'\n' ||
    '- Open to residents of Goa; no age restrictions' || E'\n' ||
    '- Fee: ₹5,000 per player' || E'\n' ||
    '- Players not selected during the auction receive a 100% refund' || E'\n' ||
    '- No guarantee that doubles partners will be bought by the same franchise' || E'\n\n' ||
    'Team Structure' || E'\n' ||
    '- Minimum: 10 men & 3 women per franchise' || E'\n' ||
    '- Maximum: 12 men & 4 women per franchise' || E'\n' ||
    '- One female player may participate in two categories during a single fixture' || E'\n' ||
    '- Franchise owners may play as active players if registered' || E'\n\n' ||
    'Match Format' || E'\n' ||
    '- Each fixture: 7 matches (4 men''s doubles, 1 mixed doubles, 1 women''s doubles, 1 men''s singles)' || E'\n' ||
    '- Race to 77 cumulative scoring — every point from every match counts toward the team total' || E'\n' ||
    '- Individual matches played to 11 service points (rally scoring; only serving side scores)' || E'\n' ||
    '- Home and away fixtures across both venues' || E'\n\n' ||
    'Perks for GPBL Players' || E'\n' ||
    '- Gameplay across 3 weekends, prize money, sponsor goodies, trophies & medals' || E'\n' ||
    '- Auction Night, closing ceremony & parties' || E'\n' ||
    '- Official jerseys, complimentary refreshments, court access & media coverage' || E'\n\n' ||
    'Organizers: SOGOfit × Clube De Floresta' || E'\n' ||
    'Contact: Karan +91 90290 61288 · Nihaal +91 92259 89803 · Arjun +91 84080 64560 · Gaurav +91 98107 05254' || E'\n' ||
    'Instagram: @sogo.fit · @clubedefloresta';

  select id into v_owner
  from public.profiles
  where role = 'organizer'
  order by created_at
  limit 1;

  if v_owner is null then
    select id into v_owner from public.profiles order by created_at limit 1;
  end if;

  if v_owner is null then
    raise notice 'No profiles found — skipping GPBL seed.';
    return;
  end if;

  if exists (
    select 1 from public.tournaments
    where name = 'Goa Pickleball League (GPBL) 2026'
  ) then
    raise notice 'Goa Pickleball League (GPBL) 2026 already exists — skipping.';
    return;
  end if;

  select c.id into v_club_id
  from public.clubs c
  where c.name = 'Clube De Floresta'
  limit 1;

  insert into public.tournaments (
    created_by,
    name,
    description,
    venue,
    city,
    address,
    start_date,
    end_date,
    registration_deadline,
    max_participants,
    scoring_type,
    points_to_win,
    best_of,
    win_by,
    max_timeouts,
    timeout_duration,
    is_public,
    status,
    format,
    prize,
    featured,
    club_id
  )
  values (
    v_owner,
    'Goa Pickleball League (GPBL) 2026',
    v_description,
    'Clube De Floresta & The Racquet Clube by SOGOfit',
    'Goa',
    'North Goa: Clube De Floresta, Assagao · South Goa: The Racquet Clube by SOGOfit, Madgaon',
    '2026-08-15',
    '2026-08-30',
    '2026-07-17',
    128,
    'rally',
    11,
    3,
    2,
    2,
    60,
    true,
    'upcoming',
    'league',
    '₹3,00,000 prize pool',
    true,
    v_club_id
  )
  returning id into v_tournament;

  insert into public.tournament_categories
    (tournament_id, name, category_type, skill_level, max_teams, entry_fee)
  values
    (v_tournament, 'Player Auction Registration', 'singles', '3.5', 128, 5000.00);
end $$;
