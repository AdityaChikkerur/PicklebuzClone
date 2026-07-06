-- ============================================================================
-- PickleBuzz — 032_nagpur_venues.sql
-- Seed verified pickleball clubs and courts in Nagpur City.
-- Run AFTER 031_nagpur_registration_url_fix.sql.
-- ============================================================================

do $$
declare
  v_owner uuid;
  v_club  uuid;
begin
  select id into v_owner from public.profiles order by created_at limit 1;

  if v_owner is null then
    raise notice 'No profiles found — skipping Nagpur venue seed. Create a user first.';
    return;
  end if;

  -- The Pickle Park
  if not exists (select 1 from public.clubs where name = 'The Pickle Park') then
    insert into public.clubs (owner_id, name, city, location, amenities, contact, rating)
    values (
      v_owner,
      'The Pickle Park',
      'Nagpur',
      'Plot no 396, beside VMV College, Wardhaman Nagar Colony, Nagpur, Maharashtra 440008',
      '["pickleball court","parking","coaching"]'::jsonb,
      '+91 80871 78937',
      4.3
    )
    returning id into v_club;

    insert into public.courts (club_id, name, surface, open_from, open_to) values
      (v_club, 'Court 1', 'Acrylic hard', '06:00', '23:30'),
      (v_club, 'Court 2', 'Acrylic hard', '06:00', '23:30');
  end if;

  -- Pickle Co
  if not exists (select 1 from public.clubs where name = 'Pickle Co') then
    insert into public.clubs (owner_id, name, city, location, amenities, contact, rating)
    values (
      v_owner,
      'Pickle Co',
      'Nagpur',
      'NIT Swimming Pool, N Ambazari Rd, near Science College, Dharampeth, Nagpur, Maharashtra 440010',
      '["pickleball court","indoor courts","coaching"]'::jsonb,
      '+91 89996 37883',
      4.8
    )
    returning id into v_club;

    insert into public.courts (club_id, name, surface, open_from, open_to) values
      (v_club, 'Court 1', 'Acrylic hard', '07:00', '23:59'),
      (v_club, 'Court 2', 'Acrylic hard', '07:00', '23:59');
  end if;

  -- The Crib - Taqueria | Pickleball | Rock Climbing
  if not exists (select 1 from public.clubs where name = 'The Crib - Taqueria | Pickleball | Rock Climbing') then
    insert into public.clubs (owner_id, name, city, location, amenities, contact, rating)
    values (
      v_owner,
      'The Crib - Taqueria | Pickleball | Rock Climbing',
      'Nagpur',
      '15, N Ambazari Rd, Ambazari, Nagpur, Maharashtra 440010',
      '["cafe","sports complex","pickleball courts","rock climbing"]'::jsonb,
      null,
      4.7
    )
    returning id into v_club;

    insert into public.courts (club_id, name, surface, open_from, open_to) values
      (v_club, 'Court 1', 'Acrylic hard', '14:00', '23:00');
  end if;

  -- Pickle Co Lite - Jaripatka
  if not exists (select 1 from public.clubs where name = 'Pickle Co Lite - Jaripatka') then
    insert into public.clubs (owner_id, name, city, location, amenities, contact, rating)
    values (
      v_owner,
      'Pickle Co Lite - Jaripatka',
      'Nagpur',
      '5th Floor, Ginger Mall, Ginger Square, Main Bazaar Rd, Jaripatka, Nagpur, Maharashtra 440014',
      '["pickleball court","indoor courts"]'::jsonb,
      null,
      4.8
    )
    returning id into v_club;

    insert into public.courts (club_id, name, surface, open_from, open_to) values
      (v_club, 'Court 1', 'Acrylic hard', '07:00', '23:59'),
      (v_club, 'Court 2', 'Acrylic hard', '07:00', '23:59');
  end if;

  -- Pickle Social Club Jaripatka
  if not exists (select 1 from public.clubs where name = 'Pickle Social Club Jaripatka') then
    insert into public.clubs (owner_id, name, city, location, amenities, contact, rating)
    values (
      v_owner,
      'Pickle Social Club Jaripatka',
      'Nagpur',
      'Plot No 68, behind Jaripatka Branch Post Office, Jaripatka, Nagpur, Maharashtra 440014',
      '["pickleball club","pickleball courts","coaching","parking"]'::jsonb,
      '+91 97648 66284',
      5.0
    )
    returning id into v_club;

    insert into public.courts (club_id, name, surface, open_from, open_to) values
      (v_club, 'Court 1', 'Acrylic hard', '06:30', '23:30'),
      (v_club, 'Court 2', 'Acrylic hard', '06:30', '23:30');
  end if;

  -- The Cage
  if not exists (select 1 from public.clubs where name = 'The Cage') then
    insert into public.clubs (owner_id, name, city, location, amenities, contact, rating)
    values (
      v_owner,
      'The Cage',
      'Nagpur',
      'Plot No.5, Saikrupa Housing Society, Koradi Rd, beside Eden Garden Restaurant, Bokara, Maharashtra 441111',
      '["pickleball court","parking","floodlights"]'::jsonb,
      '+91 95290 38047',
      4.3
    )
    returning id into v_club;

    insert into public.courts (club_id, name, surface, open_from, open_to) values
      (v_club, 'Court 1', 'Acrylic hard', '05:00', '23:59'),
      (v_club, 'Court 2', 'Acrylic hard', '05:00', '23:59');
  end if;

  -- The Pickle Club
  if not exists (select 1 from public.clubs where name = 'The Pickle Club') then
    insert into public.clubs (owner_id, name, city, location, amenities, contact, rating)
    values (
      v_owner,
      'The Pickle Club',
      'Nagpur',
      '45W2+86V, Pardi, Nagpur, Maharashtra 440035',
      '["pickleball club","pickleball courts","coaching"]'::jsonb,
      '+91 87679 04880',
      3.7
    )
    returning id into v_club;

    insert into public.courts (club_id, name, surface, open_from, open_to) values
      (v_club, 'Court 1', 'Acrylic hard', '06:00', '23:59'),
      (v_club, 'Court 2', 'Acrylic hard', '06:00', '23:59');
  end if;
end $$;
