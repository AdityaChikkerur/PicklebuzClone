-- ============================================================================
-- PickleBuzz — 034_pune_venues_additional.sql
-- Additional verified dedicated pickleball courts in Pune City.
-- Run AFTER 033_pune_venues.sql.
-- ============================================================================

do $$
declare
  v_owner uuid;
  v_club  uuid;
begin
  select id into v_owner from public.profiles order by created_at limit 1;

  if v_owner is null then
    raise notice 'No profiles found — skipping additional Pune venue seed.';
    return;
  end if;

  if not exists (select 1 from public.clubs where name = 'The Foothill Arena - Pickleball Court') then
    insert into public.clubs (owner_id, name, city, location, amenities, contact, rating)
    values (
      v_owner,
      'The Foothill Arena - Pickleball Court',
      'Pune',
      'Paud Road, inside Vishwashanti Marg, next to The Foothill Arena, Kishkinda Nagar, Kothrud, Pune, Maharashtra 411038',
      '["pickleball court","parking","coaching"]'::jsonb,
      null,
      4.8
    )
    returning id into v_club;

    insert into public.courts (club_id, name, surface, open_from, open_to) values
      (v_club, 'Court 1', 'Acrylic hard', '06:00', '23:00'),
      (v_club, 'Court 2', 'Acrylic hard', '06:00', '23:00');
  end if;

  if not exists (select 1 from public.clubs where name = 'Boundary Bliss Sports') then
    insert into public.clubs (owner_id, name, city, location, amenities, contact, rating)
    values (
      v_owner,
      'Boundary Bliss Sports',
      'Pune',
      'Gat No- 1346/1, behind Hotel Shivsagar, Ubale Nagar, Wagholi, Pune, Maharashtra 412207',
      '["sports club","pickleball court","parking","coaching"]'::jsonb,
      '+91 95119 67373',
      4.8
    )
    returning id into v_club;

    insert into public.courts (club_id, name, surface, open_from, open_to) values
      (v_club, 'Court 1', 'Acrylic hard', '06:00', '23:30'),
      (v_club, 'Court 2', 'Acrylic hard', '06:00', '23:30');
  end if;

  if not exists (select 1 from public.clubs where name = 'Pickleball Arena Aundh') then
    insert into public.clubs (owner_id, name, city, location, amenities, contact, rating)
    values (
      v_owner,
      'Pickleball Arena Aundh',
      'Pune',
      'Survey No 161, Cts No 2483, next to Kumar Padmalaya, Suvarnayug Society, Ward No. 8, Aundh, Pune, Maharashtra 411067',
      '["pickleball court","parking","coaching"]'::jsonb,
      null,
      4.8
    )
    returning id into v_club;

    insert into public.courts (club_id, name, surface, open_from, open_to) values
      (v_club, 'Court 1', 'Acrylic hard', '06:00', '23:00'),
      (v_club, 'Court 2', 'Acrylic hard', '06:00', '23:00');
  end if;

  if not exists (select 1 from public.clubs where name = 'Ace Alley Pickleball, Aundh') then
    insert into public.clubs (owner_id, name, city, location, amenities, contact, rating)
    values (
      v_owner,
      'Ace Alley Pickleball, Aundh',
      'Pune',
      'Aundh - Baner Link Road, Sai Heritage, Royal Garage Lane, Opposite Aundh, Pune, Maharashtra 411067',
      '["pickleball court","parking","coaching"]'::jsonb,
      '+91 75587 55804',
      4.8
    )
    returning id into v_club;

    insert into public.courts (club_id, name, surface, open_from, open_to) values
      (v_club, 'Court 1', 'Acrylic hard', '06:00', '23:59'),
      (v_club, 'Court 2', 'Acrylic hard', '06:00', '23:59');
  end if;

  if not exists (select 1 from public.clubs where name = 'Pickleball Zone') then
    insert into public.clubs (owner_id, name, city, location, amenities, contact, rating)
    values (
      v_owner,
      'Pickleball Zone',
      'Pune',
      'Chondhe Patil Sports Zone, next to Prism Society, Rohan Nilay, Aundh, Pune, Maharashtra 411067',
      '["pickleball court","coaching"]'::jsonb,
      null,
      4.9
    )
    returning id into v_club;

    insert into public.courts (club_id, name, surface, open_from, open_to) values
      (v_club, 'Court 1', 'Acrylic hard', '07:00', '22:00'),
      (v_club, 'Court 2', 'Acrylic hard', '07:00', '22:00');
  end if;

  if not exists (select 1 from public.clubs where name = 'TOSS pickleball academy') then
    insert into public.clubs (owner_id, name, city, location, amenities, contact, rating)
    values (
      v_owner,
      'TOSS pickleball academy',
      'Pune',
      'MIT College, Back Gate Road, Paud Road, Shilpa Housing Society, Kothrud, Pune, Maharashtra 411038',
      '["pickleball academy","pickleball court","coaching"]'::jsonb,
      '+91 90282 57534',
      4.9
    )
    returning id into v_club;

    insert into public.courts (club_id, name, surface, open_from, open_to) values
      (v_club, 'Court 1', 'Acrylic hard', '06:00', '22:00'),
      (v_club, 'Court 2', 'Acrylic hard', '06:00', '22:00');
  end if;

  if not exists (select 1 from public.clubs where name = 'Bounzz Pickleden') then
    insert into public.clubs (owner_id, name, city, location, amenities, contact, rating)
    values (
      v_owner,
      'Bounzz Pickleden',
      'Pune',
      'HQHG+6HQ, near Kunal Aspiree, Balewadi Gaon, Balewadi, Pune, Maharashtra 411045',
      '["pickleball arena","parking","coaching","floodlights"]'::jsonb,
      '+91 98678 36337',
      4.9
    )
    returning id into v_club;

    insert into public.courts (club_id, name, surface, open_from, open_to) values
      (v_club, 'Court 1', 'Acrylic hard', '06:00', '23:00'),
      (v_club, 'Court 2', 'Acrylic hard', '06:00', '23:00');
  end if;

  if not exists (select 1 from public.clubs where name = 'Pickleball Arena Punawale') then
    insert into public.clubs (owner_id, name, city, location, amenities, contact, rating)
    values (
      v_owner,
      'Pickleball Arena Punawale',
      'Pune',
      'Life Republic Township, opposite Nora Society R17, Jambhe, Pimpri-Chinchwad, Maharashtra 411033',
      '["pickleball court","parking","coaching"]'::jsonb,
      '+91 86000 18022',
      4.8
    )
    returning id into v_club;

    insert into public.courts (club_id, name, surface, open_from, open_to) values
      (v_club, 'Court 1', 'Acrylic hard', '05:00', '23:59'),
      (v_club, 'Court 2', 'Acrylic hard', '05:00', '23:59');
  end if;
end $$;
