-- ============================================================================
-- PickleBuzz — 045_gorilla_smash_trophy_chennai.sql
-- Sathyabama University (Chennai) venue; Gorilla Smash Trophy — Chennai 2026.
-- Run AFTER 044_discover_profile_boost_read.sql.
-- ============================================================================

do $$
declare
  v_owner uuid;
  v_club  uuid;
begin
  select id into v_owner from public.profiles order by created_at limit 1;

  if v_owner is null then
    raise notice 'No profiles found — skipping Chennai venue seed. Create a user first.';
    return;
  end if;

  -- Sathyabama Institute of Science and Technology (Chennai)
  if not exists (
    select 1 from public.clubs
    where name = 'Sathyabama Institute of Science and Technology'
  ) then
    insert into public.clubs (owner_id, name, city, location, amenities, contact, rating)
    values (
      v_owner,
      'Sathyabama Institute of Science and Technology',
      'Chennai',
      'Jeppiaar Nagar, Rajiv Gandhi Salai (OMR), Chennai, Tamil Nadu 600119',
      '["indoor courts","pickleball court","air-conditioned","tournament venue","sports academy"]'::jsonb,
      '+91 44 2450 3150',
      4.8
    )
    returning id into v_club;

    insert into public.courts (club_id, name, surface, open_from, open_to) values
      (v_club, 'Court 1', 'Acrylic hard', '06:00', '22:00'),
      (v_club, 'Court 2', 'Acrylic hard', '06:00', '22:00'),
      (v_club, 'Court 3', 'Acrylic hard', '06:00', '22:00'),
      (v_club, 'Court 4', 'Acrylic hard', '06:00', '22:00'),
      (v_club, 'Court 5', 'Acrylic hard', '06:00', '22:00'),
      (v_club, 'Court 6', 'Acrylic hard', '06:00', '22:00');
  end if;
end $$;

-- Gorilla Smash Trophy — Chennai 2026
do $$
declare
  v_owner       uuid;
  v_tournament  uuid;
  v_description text;
begin
  v_description :=
    'Gorilla Smash Trophy — Chennai 2026' || E'\n\n' ||
    'Presented by Twin Eagles × Gorilla Smash Club. An electrifying weekend of elite competition for Chennai''s ever-growing pickleball community.' || E'\n\n' ||
    'Categories' || E'\n' ||
    '- Open Singles' || E'\n' ||
    '- Open Doubles' || E'\n' ||
    '- Open Mixed Doubles' || E'\n' ||
    '- Super Mixed Doubles (4.0 & below)' || E'\n' ||
    '- Intermediate Doubles' || E'\n' ||
    '- Intermediate Singles' || E'\n' ||
    '- 35+ Doubles' || E'\n' ||
    '- Under 19 Doubles' || E'\n' ||
    '- Mixed Team Event (2 men, 1 woman; tie-breaker — 5-point team singles)' || E'\n\n' ||
    'Prize Pool' || E'\n' ||
    '- ₹3,00,000 cash prize pool' || E'\n\n' ||
    'Registration' || E'\n' ||
    '- Opens 8 July 2026' || E'\n' ||
    '- Early bird offer: 8 July – 22 July 2026' || E'\n' ||
    '- Free T-shirts for the first 50 entries' || E'\n\n' ||
    'Organizers: Twin Eagles × Gorilla Smash Club' || E'\n' ||
    'Venue: TBA — Chennai' || E'\n' ||
    'Registration: https://www.gorillasmashclub.com/' || E'\n' ||
    'Instagram: @gorillasmashclub';

  select id into v_owner
  from public.profiles
  where role = 'organizer'
  order by created_at
  limit 1;

  if v_owner is null then
    select id into v_owner from public.profiles order by created_at limit 1;
  end if;

  if v_owner is null then
    raise notice 'No profiles found — skipping Gorilla Smash Trophy seed.';
    return;
  end if;

  if exists (
    select 1 from public.tournaments
    where name = 'Gorilla Smash Trophy — Chennai 2026'
  ) then
    raise notice 'Gorilla Smash Trophy — Chennai 2026 already exists — skipping.';
    return;
  end if;

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
    'Gorilla Smash Trophy — Chennai 2026',
    v_description,
    'TBA',
    'Chennai',
    'Chennai, Tamil Nadu',
    '2026-08-15',
    '2026-08-16',
    '2026-08-10',
    256,
    'rally',
    11,
    3,
    2,
    2,
    60,
    true,
    'upcoming',
    'group_knockout',
    '₹3,00,000 cash prize pool',
    true,
    'https://www.gorillasmashclub.com/',
    null
  )
  returning id into v_tournament;

  insert into public.tournament_categories
    (tournament_id, name, category_type, skill_level, max_teams, entry_fee)
  values
    (v_tournament, 'Open Singles',                    'singles', '5.0+', 32, 0),
    (v_tournament, 'Open Doubles',                    'doubles', '5.0+', 32, 0),
    (v_tournament, 'Open Mixed Doubles',              'mixed',   '5.0+', 32, 0),
    (v_tournament, 'Super Mixed Doubles (4.0 & below)', 'mixed', '4.0',  32, 0),
    (v_tournament, 'Intermediate Doubles',            'doubles', '3.5',  32, 0),
    (v_tournament, 'Intermediate Singles',            'singles', '3.5',  32, 0),
    (v_tournament, '35+ Doubles',                     'doubles', '3.5',  32, 0),
    (v_tournament, 'Under 19 Doubles',                'doubles', '3.0',  32, 0),
    (v_tournament, 'Mixed Team Event',                'mixed',   '4.0',  32, 0);
end $$;
