-- ============================================================================
-- PickleBuzz — 033_pune_venues.sql
-- Replace demo Pune club with verified pickleball courts in Pune City.
-- Run AFTER 032_nagpur_venues.sql.
-- ============================================================================

delete from public.notifications
where text ilike '%Deccan Paddle Arena%'
   or text ilike '%Deccan Arena%';

delete from public.clubs
where name = 'Deccan Paddle Arena';

do $$
declare
  v_owner uuid;
  v_club  uuid;
begin
  select id into v_owner from public.profiles order by created_at limit 1;

  if v_owner is null then
    raise notice 'No profiles found — skipping Pune venue seed. Create a user first.';
    return;
  end if;

  -- The Pickle Point
  if not exists (select 1 from public.clubs where name = 'The Pickle Point') then
    insert into public.clubs (owner_id, name, city, location, amenities, contact, rating)
    values (
      v_owner,
      'The Pickle Point',
      'Pune',
      'P1/4, Phase 1, Rajiv Gandhi Infotech Park, Hinjawadi, Pune, Maharashtra 411057',
      '["pickleball court","parking","coaching"]'::jsonb,
      null,
      4.8
    )
    returning id into v_club;

    insert into public.courts (club_id, name, surface, open_from, open_to) values
      (v_club, 'Court 1', 'Acrylic hard', '06:00', '23:59'),
      (v_club, 'Court 2', 'Acrylic hard', '06:00', '23:59');
  end if;

  -- Ace Alley Pickleball, Viman Nagar
  if not exists (select 1 from public.clubs where name = 'Ace Alley Pickleball, Viman Nagar') then
    insert into public.clubs (owner_id, name, city, location, amenities, contact, rating)
    values (
      v_owner,
      'Ace Alley Pickleball, Viman Nagar',
      'Pune',
      'Survey no. 212, opp. Gera Foilage Society, next to Swapnil Tyres, Mhada Colony, Viman Nagar, Pune, Maharashtra 411014',
      '["pickleball court","parking","coaching"]'::jsonb,
      '+91 75587 55807',
      4.8
    )
    returning id into v_club;

    insert into public.courts (club_id, name, surface, open_from, open_to) values
      (v_club, 'Court 1', 'Acrylic hard', '06:00', '23:30'),
      (v_club, 'Court 2', 'Acrylic hard', '06:00', '23:30');
  end if;

  -- Pickleball One
  if not exists (select 1 from public.clubs where name = 'Pickleball One') then
    insert into public.clubs (owner_id, name, city, location, amenities, contact, rating)
    values (
      v_owner,
      'Pickleball One',
      'Pune',
      'New Airport Rd, near Dorabjee''s, Clover Park, Viman Nagar, Pune, Maharashtra 411014',
      '["pickleball court","parking","coaching"]'::jsonb,
      '+91 99759 60777',
      4.8
    )
    returning id into v_club;

    insert into public.courts (club_id, name, surface, open_from, open_to) values
      (v_club, 'Court 1', 'Acrylic hard', '07:00', '23:59'),
      (v_club, 'Court 2', 'Acrylic hard', '07:00', '23:59');
  end if;

  -- Backyard Pickleball Arena
  if not exists (select 1 from public.clubs where name = 'Backyard Pickleball Arena') then
    insert into public.clubs (owner_id, name, city, location, amenities, contact, rating)
    values (
      v_owner,
      'Backyard Pickleball Arena',
      'Pune',
      'Arun Park Rd, Thergaon, Pimpri-Chinchwad, Pune, Maharashtra 411033',
      '["pickleball arena","parking","floodlights"]'::jsonb,
      null,
      4.8
    )
    returning id into v_club;

    insert into public.courts (club_id, name, surface, open_from, open_to) values
      (v_club, 'Court 1', 'Acrylic hard', '06:00', '23:30'),
      (v_club, 'Court 2', 'Acrylic hard', '06:00', '23:30');
  end if;

  -- CrickFitNet Academy
  if not exists (select 1 from public.clubs where name = 'CrickFitNet Academy') then
    insert into public.clubs (owner_id, name, city, location, amenities, contact, rating)
    values (
      v_owner,
      'CrickFitNet Academy',
      'Pune',
      'Laxman, Gujar Nagar, Sai Colony, Thergaon, Pune, Pimpri-Chinchwad, Maharashtra 411033',
      '["sports academy","pickleball court","coaching"]'::jsonb,
      '+91 87889 70493',
      4.8
    )
    returning id into v_club;

    insert into public.courts (club_id, name, surface, open_from, open_to) values
      (v_club, 'Court 1', 'Acrylic hard', '07:00', '23:00'),
      (v_club, 'Court 2', 'Acrylic hard', '07:00', '23:00');
  end if;

  -- RallyGully Law College Road
  if not exists (
    select 1 from public.clubs
    where name = 'RallyGully I Law College Road I Best Pickleball Court in Pune'
  ) then
    insert into public.clubs (owner_id, name, city, location, amenities, contact, rating)
    values (
      v_owner,
      'RallyGully I Law College Road I Best Pickleball Court in Pune',
      'Pune',
      'Bounce Tennis Academy, Lane, Law College Rd, Shanti Sheela Society, Erandwane, Pune, Maharashtra 411038',
      '["pickleball court","coaching"]'::jsonb,
      null,
      4.7
    )
    returning id into v_club;

    insert into public.courts (club_id, name, surface, open_from, open_to) values
      (v_club, 'Court 1', 'Acrylic hard', '06:00', '22:00'),
      (v_club, 'Court 2', 'Acrylic hard', '06:00', '22:00');
  end if;

  -- Pickle Haus Arena NIBM
  if not exists (select 1 from public.clubs where name = 'Pickle Haus Arena NIBM') then
    insert into public.clubs (owner_id, name, city, location, amenities, contact, rating)
    values (
      v_owner,
      'Pickle Haus Arena NIBM',
      'Pune',
      'Survey No. 29, Highland Park, Plot No. 24, NIBM Rd, Mohammed Wadi, Pune, Maharashtra 411048',
      '["pickleball arena","parking","coaching","floodlights"]'::jsonb,
      null,
      4.9
    )
    returning id into v_club;

    insert into public.courts (club_id, name, surface, open_from, open_to) values
      (v_club, 'Court 1', 'Acrylic hard', '06:00', '23:00'),
      (v_club, 'Court 2', 'Acrylic hard', '06:00', '23:00');
  end if;
end $$;
