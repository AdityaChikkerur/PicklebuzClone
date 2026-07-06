-- ============================================================================
-- PickleBuzz — 024_nashik_venues.sql
-- Replace demo Nashik club with real pickleball venues in Nashik City.
-- Run AFTER 023_doubles_mixed_invite_rules.sql.
-- ============================================================================

-- Demo notifications tied to the placeholder Nashik club.
delete from public.notifications
where text ilike '%Godavari Club%'
   or text ilike '%Godavari Pickle Club%';

-- Courts and bookings cascade from clubs.
delete from public.clubs
where name = 'Godavari Pickle Club';

do $$
declare
  v_owner uuid;
  v_club  uuid;
begin
  select id into v_owner from public.profiles order by created_at limit 1;

  if v_owner is null then
    raise notice 'No profiles found — skipping Nashik venue seed. Create a user first.';
    return;
  end if;

  -- Nashik Sports Klub (Sports Complex)
  if not exists (select 1 from public.clubs where name = 'Nashik Sports Klub') then
    insert into public.clubs (owner_id, name, city, location, amenities, contact, rating)
    values (
      v_owner,
      'Nashik Sports Klub',
      'Nashik',
      'Suyojit Garden Bridge, Makhmalabad Rd, Bhagyodaya colony, Nashik, Maharashtra 422003',
      '["sports complex","parking","floodlights","coaching","changing rooms"]'::jsonb,
      '+91 97697 65125',
      4.8
    )
    returning id into v_club;

    insert into public.courts (club_id, name, surface, open_from, open_to) values
      (v_club, 'Court 1', 'Acrylic hard', '06:00', '23:00'),
      (v_club, 'Court 2', 'Acrylic hard', '06:00', '23:00');
  end if;

  -- The Nova Club (Pickleball Club)
  if not exists (select 1 from public.clubs where name = 'The Nova Club') then
    insert into public.clubs (owner_id, name, city, location, amenities, contact, rating)
    values (
      v_owner,
      'The Nova Club',
      'Nashik',
      'S NO 33, Besides Dmart, 1B/1/1, Engineer Prakash Chaudhary Marg, Kale Nagar, Vivekanand Nagar, Anandvalli, Nashik, Maharashtra 422013',
      '["pickleball club","pickleball courts","coaching","equipment rental","parking"]'::jsonb,
      '+91 81081 04005',
      5.0
    )
    returning id into v_club;

    insert into public.courts (club_id, name, surface, open_from, open_to) values
      (v_club, 'Court 1', 'Acrylic hard', '06:00', '23:59'),
      (v_club, 'Court 2', 'Acrylic hard', '06:00', '23:59');
  end if;

  -- Decathlon Sports - Nashik (Sports Store / Court)
  if not exists (select 1 from public.clubs where name = 'Decathlon Sports - Nashik') then
    insert into public.clubs (owner_id, name, city, location, amenities, contact, rating)
    values (
      v_owner,
      'Decathlon Sports - Nashik',
      'Nashik',
      '6/1/2, Vilholi Rd, opposite Jain Temple, Vilholi, Nashik, Maharashtra 422010',
      '["pro shop","equipment rental","indoor courts","sports store"]'::jsonb,
      '+91 77983 60284',
      4.3
    )
    returning id into v_club;

    insert into public.courts (club_id, name, surface, open_from, open_to) values
      (v_club, 'Court 1', 'Synthetic', '11:00', '21:00');
  end if;

  -- Pickleball Paradise by Ages Ventures (Sports Club)
  if not exists (select 1 from public.clubs where name = 'Pickleball Paradise by Ages Ventures') then
    insert into public.clubs (owner_id, name, city, location, amenities, contact, rating)
    values (
      v_owner,
      'Pickleball Paradise by Ages Ventures',
      'Nashik',
      'Lane, beside Rishi Hotel, Radha Vasudev Batavia Nagar, Govind Nagar, Nashik, Maharashtra 422008',
      '["sports club","pickleball courts","parking","coaching"]'::jsonb,
      null,
      4.8
    )
    returning id into v_club;

    insert into public.courts (club_id, name, surface, open_from, open_to) values
      (v_club, 'Court 1', 'Acrylic hard', '06:00', '23:59'),
      (v_club, 'Court 2', 'Acrylic hard', '06:00', '23:59');
  end if;

  -- Paradise Pickleball Hub Nashik (Pickleball Club)
  if not exists (select 1 from public.clubs where name = 'Paradise Pickleball Hub Nashik') then
    insert into public.clubs (owner_id, name, city, location, amenities, contact, rating)
    values (
      v_owner,
      'Paradise Pickleball Hub Nashik',
      'Nashik',
      'Chandshi, Nashik, Maharashtra 422003',
      '["pickleball club","pickleball courts","coaching"]'::jsonb,
      null,
      5.0
    )
    returning id into v_club;

    insert into public.courts (club_id, name, surface, open_from, open_to) values
      (v_club, 'Court 1', 'Acrylic hard', '16:00', '23:59'),
      (v_club, 'Court 2', 'Acrylic hard', '16:00', '23:59');
  end if;

  -- Big Bounce Sports Arena (Sports Arena)
  if not exists (select 1 from public.clubs where name = 'Big Bounce Sports Arena') then
    insert into public.clubs (owner_id, name, city, location, amenities, contact, rating)
    values (
      v_owner,
      'Big Bounce Sports Arena',
      'Nashik',
      'Link Road, near Shamsundar missal, Pundlik nagar, Makhmalabad, Nashik, Maharashtra 422003',
      '["sports arena","floodlights","parking","multi-sport","24 hours"]'::jsonb,
      '+91 70306 30601',
      4.8
    )
    returning id into v_club;

    insert into public.courts (club_id, name, surface, open_from, open_to) values
      (v_club, 'Court 1', 'Acrylic hard', '00:00', '23:59'),
      (v_club, 'Court 2', 'Acrylic hard', '00:00', '23:59');
  end if;

  -- The Spinshot - Padel, Pickleball Club
  if not exists (select 1 from public.clubs where name = 'The Spinshot - Padel, Pickleball Club') then
    insert into public.clubs (owner_id, name, city, location, amenities, contact, rating)
    values (
      v_owner,
      'The Spinshot - Padel, Pickleball Club',
      'Nashik',
      '2PGV+V63, Chandshi, Nashik, Jalalpur, Maharashtra 422003',
      '["padel","pickleball club","pickleball courts","coaching","parking"]'::jsonb,
      null,
      5.0
    )
    returning id into v_club;

    insert into public.courts (club_id, name, surface, open_from, open_to) values
      (v_club, 'Pickleball Court 1', 'Acrylic hard', '06:00', '23:59'),
      (v_club, 'Pickleball Court 2', 'Acrylic hard', '06:00', '23:59');
  end if;
end $$;
