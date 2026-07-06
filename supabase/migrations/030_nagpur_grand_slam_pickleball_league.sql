-- ============================================================================
-- PickleBuzz — 030_nagpur_grand_slam_pickleball_league.sql
-- NCW × Alpha Sports: Nagpur Grand Slam Pickleball League 2026.
-- Run AFTER 029_nandanwan_lawn_nashik.sql.
-- ============================================================================

alter table public.tournaments
  add column if not exists registration_url text;

alter table public.tournaments
  add column if not exists club_id uuid references public.clubs(id) on delete set null;

alter table public.tournament_categories
  add column if not exists name text;

do $$
declare
  v_owner       uuid;
  v_tournament  uuid;
  v_description text;
begin
  v_description :=
    'Nagpur Grand Slam Pickleball League 2026 — Nagpur''s Elite Franchise Pickleball League.' || E'\n\n' ||
    'Player registrations are officially OPEN! Don''t miss your chance to showcase your skills in Nagpur''s elite franchise pickleball league.' || E'\n\n' ||
    'Prize Pool' || E'\n' ||
    '- Total prize pool: ₹7,00,000' || E'\n' ||
    '- Champions: ₹3,00,000 cash prize + Champions Trophy' || E'\n' ||
    '- Runners-up: ₹2,00,000 cash prize' || E'\n\n' ||
    'Every participant enjoys exclusive benefits:' || E'\n' ||
    '- Attractive individual prizes for top performers' || E'\n' ||
    '- Complimentary refreshments and beverages' || E'\n' ||
    '- On-ground medical facility for all players' || E'\n\n' ||
    'Registration Details' || E'\n' ||
    '- Fee: ₹1,000 (payable via UPI)' || E'\n' ||
    '- Unsold players receive a full refund' || E'\n' ||
    '- Complete the registration form and attach your successful payment screenshot to secure your spot on the auction list' || E'\n\n' ||
    'Organizers: Nagpur Cricket War (NCW) × Alpha Sports' || E'\n' ||
    'Official registration: https://theplayerauction.com/auction/1351/nagpur-grand-slam-pickleball-league-2026' || E'\n' ||
    'Contact: Rohit Mirani · +91 93709 98926' || E'\n\n' ||
    'Be a champion. Take home the glory!';

  select id into v_owner
  from public.profiles
  where role = 'organizer'
  order by created_at
  limit 1;

  if v_owner is null then
    select id into v_owner from public.profiles order by created_at limit 1;
  end if;

  if v_owner is null then
    raise notice 'No profiles found — skipping Nagpur Grand Slam seed.';
    return;
  end if;

  if exists (
    select 1 from public.tournaments
    where name = 'Nagpur Grand Slam Pickleball League 2026'
  ) then
    raise notice 'Nagpur Grand Slam Pickleball League 2026 already exists — skipping.';
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
    registration_url
  )
  values (
    v_owner,
    'Nagpur Grand Slam Pickleball League 2026',
    v_description,
    'Nagpur',
    'Nagpur',
    'Nagpur, Maharashtra, India',
    '2026-09-15',
    '2026-10-15',
    '2026-08-31',
    256,
    'rally',
    11,
    3,
    2,
    2,
    60,
    true,
    'upcoming',
    'league',
    '₹7,00,000 total · Champions ₹3,00,000 · Runners-up ₹2,00,000',
    true,
    'https://theplayerauction.com/auction/1351/nagpur-grand-slam-pickleball-league-2026'
  )
  returning id into v_tournament;

  insert into public.tournament_categories
    (tournament_id, name, category_type, skill_level, max_teams, entry_fee)
  values
    (v_tournament, 'Player Auction Registration', 'singles', '3.5', 256, 1000.00);
end $$;
