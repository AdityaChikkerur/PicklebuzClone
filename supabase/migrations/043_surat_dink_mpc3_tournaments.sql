-- ============================================================================
-- PickleBuzz — 043_surat_dink_mpc3_tournaments.sql
-- Surat + Navi Mumbai venues; DINK Grand Stand Championship 2026;
-- Monsoon Pickleball Championship 3.0 (MPC 3.0).
-- Run AFTER 042_goa_venues_gpbl.sql.
-- ============================================================================

do $$
declare
  v_owner uuid;
  v_club  uuid;
begin
  select id into v_owner from public.profiles order by created_at limit 1;

  if v_owner is null then
    raise notice 'No profiles found — skipping venue seed. Create a user first.';
    return;
  end if;

  -- DINK Pickle & Tennis Club (Surat)
  if not exists (select 1 from public.clubs where name = 'DINK Pickle & Tennis Club') then
    insert into public.clubs (owner_id, name, city, location, amenities, contact, rating)
    values (
      v_owner,
      'DINK Pickle & Tennis Club',
      'Surat',
      'VIP Road, behind Pavilion Restaurant, Vesu, Surat, Gujarat 395007',
      '["pickleball court","tennis court","indoor courts","coaching","parking"]'::jsonb,
      null,
      4.9
    )
    returning id into v_club;

    insert into public.courts (club_id, name, surface, open_from, open_to) values
      (v_club, 'Court 1', 'Acrylic hard', '06:00', '23:00'),
      (v_club, 'Court 2', 'Acrylic hard', '06:00', '23:00'),
      (v_club, 'Court 3', 'Acrylic hard', '06:00', '23:00'),
      (v_club, 'Court 4', 'Acrylic hard', '06:00', '23:00'),
      (v_club, 'Court 5', 'Acrylic hard', '06:00', '23:00'),
      (v_club, 'Court 6', 'Acrylic hard', '06:00', '23:00');
  end if;

  -- CIDCO Exhibition Centre (Navi Mumbai)
  if not exists (select 1 from public.clubs where name = 'CIDCO Exhibition Centre') then
    insert into public.clubs (owner_id, name, city, location, amenities, contact, rating)
    values (
      v_owner,
      'CIDCO Exhibition Centre',
      'Navi Mumbai',
      'Swami Pranabananda Marg, Sector 30-A, Vashi, Navi Mumbai, Maharashtra 400703',
      '["indoor courts","pickleball court","air-conditioned","exhibition centre"]'::jsonb,
      null,
      4.7
    )
    returning id into v_club;

    insert into public.courts (club_id, name, surface, open_from, open_to) values
      (v_club, 'Court 1',  'Acrylic hard', '08:00', '21:00'),
      (v_club, 'Court 2',  'Acrylic hard', '08:00', '21:00'),
      (v_club, 'Court 3',  'Acrylic hard', '08:00', '21:00'),
      (v_club, 'Court 4',  'Acrylic hard', '08:00', '21:00'),
      (v_club, 'Court 5',  'Acrylic hard', '08:00', '21:00'),
      (v_club, 'Court 6',  'Acrylic hard', '08:00', '21:00'),
      (v_club, 'Court 7',  'Acrylic hard', '08:00', '21:00'),
      (v_club, 'Court 8',  'Acrylic hard', '08:00', '21:00'),
      (v_club, 'Court 9',  'Acrylic hard', '08:00', '21:00'),
      (v_club, 'Court 10', 'Acrylic hard', '08:00', '21:00'),
      (v_club, 'Court 11', 'Acrylic hard', '08:00', '21:00'),
      (v_club, 'Court 12', 'Acrylic hard', '08:00', '21:00'),
      (v_club, 'Court 13', 'Acrylic hard', '08:00', '21:00'),
      (v_club, 'Court 14', 'Acrylic hard', '08:00', '21:00'),
      (v_club, 'Court 15', 'Acrylic hard', '08:00', '21:00'),
      (v_club, 'Court 16', 'Acrylic hard', '08:00', '21:00'),
      (v_club, 'Court 17', 'Acrylic hard', '08:00', '21:00');
  end if;
end $$;

-- DINK Grand Stand Championship 2026
do $$
declare
  v_owner       uuid;
  v_tournament  uuid;
  v_club_id     uuid;
  v_description text;
begin
  v_description :=
    'DINK Grand Stand Championship 2026 — Gujarat''s biggest pickleball event.' || E'\n\n' ||
    'The biggest pickleball showdown of Gujarat is here. Over 20 categories across all divisions.' || E'\n\n' ||
    'Divisions' || E'\n' ||
    '- PRO · ADVANCE · INTERMEDIATE · BEGINNER' || E'\n' ||
    '- 30+ OPEN · 40+ OPEN · SPLIT-AGE OPEN (35+/-)' || E'\n\n' ||
    'Prize Pool' || E'\n' ||
    '- Total prize pool: ₹11,00,000' || E'\n' ||
    '- Guaranteed cash prize: ₹7,00,000' || E'\n\n' ||
    'Early Bird Offer' || E'\n' ||
    '- Use code EB10 for 10% off registration (limited time)' || E'\n\n' ||
    'DUPR-affiliated tournament. Register now on Pllayer.' || E'\n\n' ||
    'Organizer: DINK Pickle & Tennis Club' || E'\n' ||
    'Venue: DINK Pickle & Tennis Club, Surat, Gujarat' || E'\n' ||
    'Registration: https://pllayer.com/' || E'\n' ||
    'Instagram: @dinkclubofficial';

  select id into v_owner
  from public.profiles
  where role = 'organizer'
  order by created_at
  limit 1;

  if v_owner is null then
    select id into v_owner from public.profiles order by created_at limit 1;
  end if;

  if v_owner is null then
    raise notice 'No profiles found — skipping DINK Grand Stand seed.';
    return;
  end if;

  if exists (
    select 1 from public.tournaments
    where name = 'DINK Grand Stand Championship 2026'
  ) then
    raise notice 'DINK Grand Stand Championship 2026 already exists — skipping.';
    return;
  end if;

  select c.id into v_club_id
  from public.clubs c
  where c.name = 'DINK Pickle & Tennis Club'
  limit 1;

  insert into public.tournaments (
    created_by, name, description, venue, city, address,
    start_date, end_date, registration_deadline,
    max_participants, scoring_type, points_to_win, best_of, win_by,
    max_timeouts, timeout_duration,
    is_public, status, format, prize, featured,
    registration_url, club_id
  )
  values (
    v_owner,
    'DINK Grand Stand Championship 2026',
    v_description,
    'DINK Pickle & Tennis Club',
    'Surat',
    'VIP Road, behind Pavilion Restaurant, Vesu, Surat, Gujarat 395007',
    '2026-07-16',
    '2026-07-19',
    '2026-07-10',
    512,
    'rally',
    11,
    3,
    2,
    2,
    60,
    true,
    'upcoming',
    'group_knockout',
    '₹11,00,000 total · ₹7,00,000 guaranteed',
    true,
    'https://pllayer.com/',
    v_club_id
  )
  returning id into v_tournament;

  insert into public.tournament_categories
    (tournament_id, name, category_type, skill_level, max_teams, entry_fee)
  values
    (v_tournament, 'Pro Mens Singles',       'singles', '5.0+', 32, 3500.00),
    (v_tournament, 'Pro Womens Singles',     'singles', '5.0+', 32, 3500.00),
    (v_tournament, 'Pro Mens Doubles',       'doubles', '5.0+', 32, 5000.00),
    (v_tournament, 'Pro Womens Doubles',     'doubles', '5.0+', 32, 5000.00),
    (v_tournament, 'Pro Mixed Doubles',      'mixed',   '5.0+', 32, 5000.00),
    (v_tournament, 'Advance Mens Doubles',   'doubles', '4.5',  32, 4000.00),
    (v_tournament, 'Advance Womens Doubles', 'doubles', '4.5',  32, 4000.00),
    (v_tournament, 'Advance Mixed Doubles',  'mixed',   '4.5',  32, 4000.00),
    (v_tournament, 'Intermediate Mens Doubles',   'doubles', '4.0', 32, 2500.00),
    (v_tournament, 'Intermediate Womens Doubles', 'doubles', '4.0', 32, 2500.00),
    (v_tournament, 'Intermediate Mixed Doubles',  'mixed',   '4.0', 32, 2500.00),
    (v_tournament, 'Beginner Mixed Doubles',      'mixed',   '3.0', 32, 1500.00),
    (v_tournament, '30+ Open Mens Doubles',       'doubles', '3.5', 32, 3500.00),
    (v_tournament, '30+ Open Womens Doubles',     'doubles', '3.5', 32, 3500.00),
    (v_tournament, '30+ Open Mixed Doubles',      'mixed',   '3.5', 32, 3500.00),
    (v_tournament, '40+ Open Mens Doubles',       'doubles', '3.5', 32, 3500.00),
    (v_tournament, '40+ Open Womens Doubles',     'doubles', '3.5', 32, 3500.00),
    (v_tournament, 'Split-Age Open Mixed Doubles (35+/-)', 'mixed', '3.5', 32, 3500.00);
end $$;

-- Monsoon Pickleball Championship 3.0 (MPC 3.0)
do $$
declare
  v_owner       uuid;
  v_tournament  uuid;
  v_club_id     uuid;
  v_description text;
begin
  v_description :=
    'Global Sports Presents: Monsoon Pickleball Championship 3.0 (MPC 3.0)' || E'\n\n' ||
    'India''s biggest indoor pickleball tournament returns to Navi Mumbai.' || E'\n\n' ||
    'Event Highlights' || E'\n' ||
    '- 17 fully air-conditioned indoor courts' || E'\n' ||
    '- 800+ Indian and international players expected' || E'\n' ||
    '- $60,000 prize pool' || E'\n' ||
    '- World-class playing environment regardless of weather' || E'\n\n' ||
    'Categories include Pro, Advanced, 30+, 40+, Junior, Senior, and women''s team events.' || E'\n\n' ||
    'Organizer: Global Sports Pickleball' || E'\n' ||
    'Venue: CIDCO Exhibition Centre, Vashi, Navi Mumbai' || E'\n' ||
    'Official registration: https://app.globalsports.net.in/en/tournaments' || E'\n' ||
    'Instagram: @globalsports_pickleball';

  select id into v_owner
  from public.profiles
  where role = 'organizer'
  order by created_at
  limit 1;

  if v_owner is null then
    select id into v_owner from public.profiles order by created_at limit 1;
  end if;

  if v_owner is null then
    raise notice 'No profiles found — skipping MPC 3.0 seed.';
    return;
  end if;

  if exists (
    select 1 from public.tournaments
    where name = 'Monsoon Pickleball Championship 3.0'
  ) then
    raise notice 'Monsoon Pickleball Championship 3.0 already exists — skipping.';
    return;
  end if;

  select c.id into v_club_id
  from public.clubs c
  where c.name = 'CIDCO Exhibition Centre'
  limit 1;

  insert into public.tournaments (
    created_by, name, description, venue, city, address,
    start_date, end_date, registration_deadline,
    max_participants, scoring_type, points_to_win, best_of, win_by,
    max_timeouts, timeout_duration,
    is_public, status, format, prize, featured,
    registration_url, club_id
  )
  values (
    v_owner,
    'Monsoon Pickleball Championship 3.0',
    v_description,
    'CIDCO Exhibition Centre',
    'Navi Mumbai',
    'Swami Pranabananda Marg, Sector 30-A, Vashi, Navi Mumbai, Maharashtra 400703',
    '2025-07-29',
    '2025-08-03',
    '2025-07-20',
    1024,
    'rally',
    11,
    3,
    2,
    2,
    60,
    true,
    'completed',
    'group_knockout',
    '$60,000 prize pool',
    false,
    'https://app.globalsports.net.in/en/tournaments',
    v_club_id
  )
  returning id into v_tournament;

  insert into public.tournament_categories
    (tournament_id, name, category_type, skill_level, max_teams, entry_fee)
  values
    (v_tournament, 'Pro Mens Doubles',            'doubles', '5.0+', 32, 5000.00),
    (v_tournament, 'Pro Mens Singles',            'singles', '5.0+', 32, 3500.00),
    (v_tournament, 'Pro Mixed Doubles',           'mixed',   '5.0+', 32, 5000.00),
    (v_tournament, 'Pro Womens Doubles',          'doubles', '5.0+', 32, 5000.00),
    (v_tournament, 'Pro Womens Singles',          'singles', '5.0+', 32, 3500.00),
    (v_tournament, 'Men Doubles - DUPR Upto 5',   'doubles', '4.5',  32, 4000.00),
    (v_tournament, 'Men Singles DUPR Upto 5',     'singles', '4.5',  32, 3000.00),
    (v_tournament, 'Mixed Doubles - DUPR Upto 5', 'mixed',   '4.5',  32, 4000.00),
    (v_tournament, 'Women Doubles - DUPR Upto 5', 'doubles', '4.5',  32, 4000.00),
    (v_tournament, 'Women Singles - DUPR Upto 5', 'singles', '4.5',  32, 3000.00),
    (v_tournament, 'Men Doubles - DUPR Upto 4',   'doubles', '4.0',  32, 2000.00),
    (v_tournament, 'Mixed Doubles - DUPR Upto 4', 'mixed',   '4.0',  32, 2000.00),
    (v_tournament, 'Women Doubles - DUPR Upto 4', 'doubles', '4.0',  32, 2000.00),
    (v_tournament, 'Mixed Doubles - 30+',         'mixed',   '3.5',  32, 3500.00),
    (v_tournament, 'Womens Doubles 30+',          'doubles', '3.5',  32, 3500.00),
    (v_tournament, 'Mens Doubles 50+',              'doubles', '3.5',  32, 2500.00);
end $$;
