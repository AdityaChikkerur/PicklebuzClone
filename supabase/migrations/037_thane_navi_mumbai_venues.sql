-- ============================================================================
-- PickleBuzz — 037_thane_navi_mumbai_venues.sql
-- Verified pickleball courts in Thane and Navi Mumbai (MMR).
-- Run AFTER 036_mumbai_venues_additional.sql.
-- Relocates House Of Pickleball : HOP from Mumbai → Thane with updated details.
-- ============================================================================

do $$
declare
  v_owner uuid;
  v_hop   uuid;
  v_row   record;
  v_club  uuid;
begin
  select id into v_owner from public.profiles order by created_at limit 1;

  if v_owner is null then
    raise notice 'No profiles found — skipping Thane / Navi Mumbai venue seed.';
    return;
  end if;

  -- Relocate duplicate HOP entry from Mumbai batch to Thane with canonical data
  select id into v_hop from public.clubs where name = 'House Of Pickleball : HOP' limit 1;

  if v_hop is not null then
    update public.clubs set
      name        = 'House of Pickle (HOP)',
      city        = 'Thane',
      location    = 'B-Wing, 2nd floor, Terrace, Dev Corpora, Cadbury Junction, Eastern Express Highway, Thane West - 400601',
      amenities   = '["premium pickleball club","pickleball court","24 hours"]'::jsonb,
      contact     = '+91 95943 25361',
      rating      = 4.3
    where id = v_hop;

    update public.courts set open_from = '00:00', open_to = '23:59' where club_id = v_hop;
  elsif not exists (select 1 from public.clubs where name = 'House of Pickle (HOP)' and city = 'Thane') then
    insert into public.clubs (owner_id, name, city, location, amenities, contact, rating)
    values (
      v_owner,
      'House of Pickle (HOP)',
      'Thane',
      'B-Wing, 2nd floor, Terrace, Dev Corpora, Cadbury Junction, Eastern Express Highway, Thane West - 400601',
      '["premium pickleball club","pickleball court","24 hours"]'::jsonb,
      '+91 95943 25361',
      4.3
    )
    returning id into v_hop;

    insert into public.courts (club_id, name, surface, open_from, open_to) values
      (v_hop, 'Court 1', 'Acrylic hard', '00:00', '23:59'),
      (v_hop, 'Court 2', 'Acrylic hard', '00:00', '23:59');
  end if;

  create temp table _mmr_venues (
    city        text not null,
    name        text not null,
    location    text not null,
    contact     text,
    rating      numeric(2,1),
    open_from   time not null,
    open_to     time not null,
    amenities   jsonb not null
  ) on commit drop;

  insert into _mmr_venues (city, name, location, contact, rating, open_from, open_to, amenities) values
    ('Thane', 'The Thane Club Pickleball', 'Teen Haath Naka, Opp. Raheja Garden, Thane West - 400601', '+91 22 4155 5400', 4.5, '06:00', '23:00', '["sports club","pickleball court"]'),
    ('Thane', 'Zion Performance Court', 'Swatantraveer Sawarkar Taran Talav, Chendani Bunder Road, Thane East - 400603', null, 4.5, '06:00', '23:00', '["pickleball arena","pickleball court"]'),
    ('Thane', 'Mark10 Pickleball Academy', 'Dhokali - Balkum Rd, near Pride Horizon, Thane West - 400608', null, 4.9, '06:00', '23:00', '["pickleball academy","coaching"]'),
    ('Thane', 'Pickledeck Thane', 'Terrace Area, Near Ghodbunder Road, Thane West - 400607', null, 5.0, '06:00', '23:59', '["pickleball court"]'),
    ('Thane', 'Pickleball Villa (Sorted Place)', 'Yeoor Hills, Upvan, Thane West - 400606', null, 2.8, '00:00', '23:59', '["pickleball court","24 hours"]'),
    ('Thane', 'Urban Sports Rustomjee', 'Rustomjee Urbania, Majiwada, Thane West - 400601', null, 4.2, '06:00', '23:00', '["multi-sport complex","pickleball court"]'),
    ('Navi Mumbai', 'Nerul Gymkhana Pickleball', 'Sector 28, Near Sector 12, Nerul, Navi Mumbai - 400706', '+91 93727 70136', 4.5, '07:00', '20:00', '["gymkhana","pickleball court"]'),
    ('Navi Mumbai', 'PicklePro Club (Raheja District)', 'Raheja District II, Juinagar, Navi Mumbai - 400705', null, 3.7, '06:00', '23:00', '["pickleball court"]'),
    ('Navi Mumbai', 'PicklePlay Arena (Vibgyor)', 'Vibgyor High School Campus, Sector 15, Kharghar, Navi Mumbai - 410210', null, 4.5, '06:00', '23:00', '["school sports arena","pickleball court","after school hours"]'),
    ('Navi Mumbai', 'CAP Club (Karnala Sports)', 'Karnala Sports Academy, Sector 7, Cidco Colony, New Panvel, Navi Mumbai - 410206', null, 4.1, '06:00', '23:30', '["sports academy","pickleball court"]'),
    ('Navi Mumbai', 'PicklePlay Arena (Jaipuriar)', 'Jaipuriar School, Sector 10, Sanpada, Navi Mumbai - 400705', null, 4.0, '06:00', '22:00', '["school arena","pickleball court"]'),
    ('Navi Mumbai', 'MatchPoint Pickleball Club', 'Sector 19, New Panvel, Navi Mumbai - 410206', null, 5.0, '06:00', '23:00', '["pickleball court"]'),
    ('Navi Mumbai', 'TSG x Phorce Sports Arena', 'CP Goenka International School, Ulwe, Navi Mumbai - 410206', null, null, '06:00', '23:00', '["sports arena","pickleball court"]');

  for v_row in select * from _mmr_venues loop
    if not exists (select 1 from public.clubs c where c.name = v_row.name and c.city = v_row.city) then
      insert into public.clubs (owner_id, name, city, location, amenities, contact, rating)
      values (v_owner, v_row.name, v_row.city, v_row.location, v_row.amenities, v_row.contact, v_row.rating)
      returning id into v_club;

      insert into public.courts (club_id, name, surface, open_from, open_to) values
        (v_club, 'Court 1', 'Acrylic hard', v_row.open_from, v_row.open_to),
        (v_club, 'Court 2', 'Acrylic hard', v_row.open_from, v_row.open_to);
    end if;
  end loop;
end $$;
