-- ============================================================================
-- PickleBuzz — 036_mumbai_venues_additional.sql
-- Remaining verified pickleball courts across Mumbai (batch 2).
-- Run AFTER 035_mumbai_venues.sql.
-- ============================================================================

do $$
declare
  v_owner uuid;
  v_row   record;
  v_club  uuid;
begin
  select id into v_owner from public.profiles order by created_at limit 1;

  if v_owner is null then
    raise notice 'No profiles found — skipping Mumbai venue seed.';
    return;
  end if;

  create temp table _mumbai_venues (
    name        text not null,
    location    text not null,
    contact     text,
    rating      numeric(2,1) not null,
    open_from   time not null,
    open_to     time not null,
    amenities   jsonb not null
  ) on commit drop;

  insert into _mumbai_venues (name, location, contact, rating, open_from, open_to, amenities) values
    ('Lad Wadi Pickle Ball', 'V P Road, Off C P Tank Circle, Charni Road, Mumbai - 400004', null, 3.8, '06:00', '22:00', '["pickleball court"]'),
    ('Willingdon Outdoor Sports Arena', 'K K Marg, Haji Ali, Malviya Nagar, Mahalakshmi, Mumbai - 400034', null, 4.6, '06:00', '22:00', '["sports club","pickleball court"]'),
    ('Pickle Partners | Sahara Star', 'Hotel Sahara Star Terrace, Opp Domestic Airport, Vile Parle East, Mumbai - 400099', null, 5.0, '06:00', '23:00', '["pickleball court"]'),
    ('Urban Sports Padel and Pickleball - Saki Vihar', 'Saki Vihar Road, Muranjan Wadi, Paspoli, Andheri East, Mumbai - 400072', null, 4.5, '06:00', '23:59', '["padel","pickleball court"]'),
    ('Players Pickleball Courts Shere Punjab', 'Shere Punjab Gymkhana Grounds, Mahakali Caves Rd, Andheri East, Mumbai - 400093', null, 4.8, '06:00', '23:00', '["pickleball court"]'),
    ('Blossoms Pickleball', 'Marol Maroshi Road, near Seven Hills Hospital, Andheri East, Mumbai - 400059', null, 4.7, '06:00', '23:00', '["pickleball court"]'),
    ('Sportzella Turf And Pickleball', 'Aaram Society Road, Hind Nagar, Vakola Bridge, Santacruz East, Mumbai - 400055', null, 3.2, '06:00', '23:00', '["multi-sport","pickleball court"]'),
    ('Emma Sports Academy', 'Plot No. 103, Triandaz Village, Ayyappa Temple Rd, Hiranandani Complex, Powai, Mumbai - 400076', null, 4.3, '07:00', '23:59', '["sports academy","pickleball court"]'),
    ('Torba Pickleball Centre', 'Juhu Gymkhana Grounds, Devle Road, Juhu, Mumbai - 400049', null, 4.5, '06:00', '22:30', '["pickleball court"]'),
    ('KTTFA Juhu Millennium Club', 'Juhu Millennium Club, 1st Road, Juhu Scheme, Juhu, Mumbai - 400049', null, 4.4, '06:00', '22:00', '["sports club","pickleball court"]'),
    ('BandrArcade - Taj Lands End', 'Taj Lands End Terrace, Byramji Jeejeebhoy Road, Bandra West, Mumbai - 400050', null, 4.9, '07:00', '22:00', '["premium court","pickleball court"]'),
    ('District Sports Club', 'H Block BKC, Sion-Bandra Link Road, Sion, Mumbai - 400022', null, 4.1, '06:00', '23:00', '["sports club","pickleball court"]'),
    ('Pawar Public School (Chandivali)', 'Sangharsh Nagar, Chandivali Farm Road, Andheri East, Mumbai - 400072', null, 4.2, '06:00', '22:00', '["school arena","pickleball court","evenings/weekends"]'),
    ('The Sports Foundry', 'LBS Marg, near Shangrila Resort, Bhandup West, Mumbai - 400078', null, 4.3, '06:00', '23:59', '["sports complex","pickleball court"]'),
    ('Picklehaus Mulund', 'Commercial Terrace Enclave, LBS Marg, Mulund West, Mumbai - 400080', null, 5.0, '06:00', '23:30', '["pickleball court"]'),
    ('Shri Rajasthan Recreation Club', 'Plot 14, Link Road Extension, Malad West, Mumbai - 400064', null, 4.4, '07:00', '23:00', '["recreation club","pickleball court"]');

  for v_row in select * from _mumbai_venues loop
    if not exists (select 1 from public.clubs c where c.name = v_row.name and c.city = 'Mumbai') then
      insert into public.clubs (owner_id, name, city, location, amenities, contact, rating)
      values (v_owner, v_row.name, 'Mumbai', v_row.location, v_row.amenities, v_row.contact, v_row.rating)
      returning id into v_club;

      insert into public.courts (club_id, name, surface, open_from, open_to) values
        (v_club, 'Court 1', 'Acrylic hard', v_row.open_from, v_row.open_to),
        (v_club, 'Court 2', 'Acrylic hard', v_row.open_from, v_row.open_to);
    end if;
  end loop;
end $$;
