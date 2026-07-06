-- ============================================================================
-- PickleBuzz — 026_monsoon_pickleball_championship.sql
-- Global Sports: Monsoon Pickleball Championship 4.0 (Nashik).
-- Run AFTER 025_tournament_category_name.sql.
-- ============================================================================

alter table public.tournaments
  add column if not exists registration_url text;

alter table public.tournaments
  add column if not exists club_id uuid references public.clubs(id) on delete set null;

do $$
declare
  v_owner       uuid;
  v_tournament  uuid;
  v_club_id     uuid;
  v_venue       text := 'Nandanwan Lawn';
  v_address     text := '2Q93+QW2, Atharv Colony, Savarkar Nagar, Nashik, Maharashtra 422013';
  v_description text;
begin
  select c.id, c.name, c.location
  into v_club_id, v_venue, v_address
  from public.clubs c
  where c.name = 'Nandanwan Lawn'
  limit 1;

  if v_club_id is null then
    select c.id, c.name, c.location
    into v_club_id, v_venue, v_address
    from public.clubs c
    where c.name = 'The Nova Club'
    limit 1;
  end if;

  v_description :=
    'Global Sports Presents: Monsoon Pickleball Championship 4.0' || E'\n\n' ||
    'Get ready to serve, rally, and compete in the most exciting pickleball event of the season! The Monsoon Pickleball Championship 4.0, proudly presented by Global Sports, brings together passionate players, spirited competition, and an unforgettable sporting experience.' || E'\n\n' ||
    'Whether you''re an experienced competitor or an enthusiastic amateur, this championship offers the perfect platform to showcase your skills, challenge yourself against quality opponents, and be part of a thriving pickleball community.' || E'\n\n' ||
    'Why Participate?' || E'\n' ||
    '- Competitive matches across multiple categories' || E'\n' ||
    '- Professionally managed tournament format' || E'\n' ||
    '- High-quality courts and event experience' || E'\n' ||
    '- Attractive trophies, prizes, and recognition' || E'\n' ||
    '- Networking and camaraderie with fellow pickleball enthusiasts' || E'\n' ||
    '- Exciting atmosphere filled with energy, sportsmanship, and fun' || E'\n\n' ||
    'Tournament Format' || E'\n' ||
    'Players will compete in structured league and knockout stages designed to ensure maximum play and fair competition. Every match counts as participants battle their way toward the championship title.' || E'\n\n' ||
    'Who Can Join?' || E'\n' ||
    'The tournament welcomes players across various age groups and skill levels, making it an inclusive event for the growing pickleball community.' || E'\n\n' ||
    'Event Highlights' || E'\n' ||
    '- Premium tournament organization' || E'\n' ||
    '- Live scoring and match updates' || E'\n' ||
    '- Exciting prizes and awards' || E'\n' ||
    '- Memorable player experience' || E'\n' ||
    '- Competitive yet friendly environment' || E'\n\n' ||
    'Limited slots available. Secure your entry today and join the action!' || E'\n\n' ||
    'Organizer: Global Sports Pickleball' || E'\n' ||
    'Official registration: https://app.globalsports.net.in/sl/GvCkm6qv' || E'\n' ||
    'Contact: Niraj Jain · +91 98191 60273 · pickleupdates@gmail.com' || E'\n' ||
    'WhatsApp Group: https://chat.whatsapp.com/DYeza7JpRGuF2YAmHzoR44';

  select id into v_owner
  from public.profiles
  where role = 'organizer'
  order by created_at
  limit 1;

  if v_owner is null then
    select id into v_owner from public.profiles order by created_at limit 1;
  end if;

  if v_owner is null then
    raise notice 'No profiles found — skipping Monsoon Pickleball Championship seed.';
    return;
  end if;

  if exists (
    select 1 from public.tournaments
    where name = 'Monsoon Pickleball Championship 4.0'
  ) then
    raise notice 'Monsoon Pickleball Championship 4.0 already exists — skipping.';
    return;
  end if;

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
    registration_url,
    club_id
  )
  values (
    v_owner,
    'Monsoon Pickleball Championship 4.0',
    v_description,
    v_venue,
    'Nashik',
    v_address,
    '2026-07-28',
    '2026-08-02',
    '2026-07-20',
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
    'Trophies, prizes & recognition across all categories',
    true,
    'https://app.globalsports.net.in/sl/GvCkm6qv',
    v_club_id
  )
  returning id into v_tournament;

  insert into public.tournament_categories
    (tournament_id, name, category_type, skill_level, max_teams, entry_fee)
  values
    (v_tournament, 'Pro Mens Doubles',              'doubles', '5.0+', 32, 5000.00),
    (v_tournament, 'Pro Mens Singles',              'singles', '5.0+', 32, 3500.00),
    (v_tournament, 'Pro Mixed Doubles',             'mixed',   '5.0+', 32, 5000.00),
    (v_tournament, 'Pro Womens Doubles',            'doubles', '5.0+', 32, 5000.00),
    (v_tournament, 'Pro Womens Singles',            'singles', '5.0+', 32, 3500.00),
    (v_tournament, 'Men Doubles - DUPR Upto 5',     'doubles', '4.5',  32, 4000.00),
    (v_tournament, 'Men Singles DUPR Upto 5',       'singles', '4.5',  32, 3000.00),
    (v_tournament, 'Mixed Doubles - DUPR Upto 5',   'mixed',   '4.5',  32, 4000.00),
    (v_tournament, 'Women Doubles - DUPR Upto 5',   'doubles', '4.5',  32, 4000.00),
    (v_tournament, 'Women Singles - DUPR Upto 5',   'singles', '4.5',  32, 3000.00),
    (v_tournament, 'Men Doubles - DUPR Upto 4',     'doubles', '4.0',  32, 2000.00),
    (v_tournament, 'Men Singles - DUPR Upto 4',     'singles', '4.0',  32, 1500.00),
    (v_tournament, 'Mixed Doubles - DUPR Upto 4',   'mixed',   '4.0',  32, 2000.00),
    (v_tournament, 'Women Doubles - DUPR Upto 4',   'doubles', '4.0',  32, 2000.00),
    (v_tournament, 'Women Singles - DUPR Upto 4',   'singles', '4.0',  32, 1500.00),
    (v_tournament, 'Men Doubles - DUPR Upto 3',     'doubles', '3.0',  32, 1500.00),
    (v_tournament, 'Men Singles - DUPR Upto 3',     'singles', '3.0',  32, 1000.00),
    (v_tournament, 'Mixed Doubles - DUPR Upto 3',   'mixed',   '3.0',  32, 1500.00),
    (v_tournament, 'Women Doubles - DUPR Upto 3',   'doubles', '3.0',  32, 1500.00),
    (v_tournament, 'Women Singles - DUPR Upto 3',   'singles', '3.0',  32, 1000.00),
    (v_tournament, 'Men Doubles - 35+',             'doubles', '3.5',  32, 3500.00),
    (v_tournament, 'Men Singles 35+',               'singles', '3.5',  32, 2500.00),
    (v_tournament, 'Mixed Doubles - 30+',           'mixed',   '3.5',  32, 3500.00),
    (v_tournament, 'Womens Doubles 30+',            'doubles', '3.5',  32, 3500.00),
    (v_tournament, 'Womens Singles 30+',            'singles', '3.5',  32, 2500.00),
    (v_tournament, 'Mens Doubles 50+',              'doubles', '3.5',  32, 2500.00),
    (v_tournament, 'Mens Singles 50+',              'singles', '3.5',  32, 1750.00),
    (v_tournament, 'Mixed Doubles 50+',             'mixed',   '3.5',  32, 2500.00),
    (v_tournament, 'Womens Doubles 50+',            'doubles', '3.5',  32, 2500.00),
    (v_tournament, 'Womens Singles 50+',            'singles', '3.5',  32, 1750.00),
    (v_tournament, 'Mens Doubles 60+',              'doubles', '3.5',  32, 2500.00),
    (v_tournament, 'Mens Singles 60+',              'singles', '3.5',  32, 1750.00),
    (v_tournament, 'Boys Doubles U12',              'doubles', '2.5',  32, 1800.00),
    (v_tournament, 'Boys Singles U12',              'singles', '2.5',  32, 1000.00),
    (v_tournament, 'Mixed Doubles U12',             'mixed',   '2.5',  32, 1800.00),
    (v_tournament, 'Girls Doubles U12',             'doubles', '2.5',  32, 1800.00),
    (v_tournament, 'Girls Singles U12',             'singles', '2.5',  32, 1000.00),
    (v_tournament, 'Boys Doubles U14',              'doubles', '2.5',  32, 1800.00),
    (v_tournament, 'Boys Singles U14',              'singles', '2.5',  32, 1000.00),
    (v_tournament, 'Mixed Doubles U14',             'mixed',   '2.5',  32, 1800.00),
    (v_tournament, 'Girls Doubles U14',             'doubles', '2.5',  32, 1800.00),
    (v_tournament, 'Girls Singles U14',             'singles', '2.5',  32, 1000.00),
    (v_tournament, 'Boys Doubles U16',              'doubles', '2.5',  32, 1800.00),
    (v_tournament, 'Boys Singles U16',              'singles', '2.5',  32, 1000.00),
    (v_tournament, 'Mixed Doubles U16',             'mixed',   '2.5',  32, 1800.00),
    (v_tournament, 'Girls Doubles U16',             'doubles', '2.5',  32, 1800.00),
    (v_tournament, 'Girls Singles U16',             'singles', '2.5',  32, 1000.00);
end $$;
