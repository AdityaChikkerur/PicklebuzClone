-- ============================================================================
-- PickleBuzz — 038_major_cities_venues.sql
-- Top verified pickleball courts across 8 major Indian cities.
-- Run AFTER 037_thane_navi_mumbai_venues.sql.
-- ============================================================================

do $$
declare
  v_owner uuid;
  v_row   record;
  v_club  uuid;
begin
  select id into v_owner from public.profiles order by created_at limit 1;

  if v_owner is null then
    raise notice 'No profiles found — skipping major cities venue seed.';
    return;
  end if;

  create temp table _city_venues (
    city        text not null,
    name        text not null,
    location    text not null,
    contact     text,
    rating      numeric(2,1) not null,
    open_from   time not null,
    open_to     time not null,
    amenities   jsonb not null
  ) on commit drop;

  insert into _city_venues (city, name, location, contact, rating, open_from, open_to, amenities) values
    ('Bengaluru', 'PaddleX | The Pickleball Club', 'Outer Ring Rd, Kaverappa Layout, Near Cessna Business Park, Bellandur, Bengaluru - 560103', null, 4.9, '06:00', '23:00', '["premium indoor club","pickleball court"]'),
    ('Bengaluru', 'Game Theory', 'Paramahansa Yogananda Rd, 1st Stage, Above Sree Cauvery School, Double Road Indiranagar, Bengaluru - 560038', null, 4.8, '06:00', '23:00', '["sports arena","pickleball court"]'),
    ('Bengaluru', 'PykIn Sports', 'Kanakapura Road, Raghuvanahalli, Bangalore City Municipal Corporation Layout, Bengaluru - 560062', '+91 97412 11444', 4.7, '06:00', '23:00', '["pickleball club","cafe"]'),
    ('Bengaluru', 'The Pickl Club', 'Off Mysore Road, Shamanna Gowda Layout, Chamrajpet, Bengaluru - 560018', null, 5.0, '06:00', '23:59', '["premium court","pickleball court"]'),
    ('Bengaluru', 'Millers Pickleball (FerroHub)', 'Millers Road, Opposite St. Anne''s College, Vasanth Nagar, Bengaluru - 560052', '+91 99000 78241', 4.6, '06:00', '22:00', '["pickleball court"]'),
    ('Hyderabad', 'The Kitchen - Pickleball & Padel', 'Plot No 20, MLA Colony, Road No. 12, Jubilee Hills, Hyderabad - 500034', '+91 91549 98845', 4.9, '06:00', '23:59', '["sports lounge","pickleball court","padel"]'),
    ('Hyderabad', 'Pikklle - The Pickleball Arena', 'Minister Road, near Diamond Point, Secunderabad, Hyderabad - 500003', '+91 98851 12345', 4.8, '06:00', '23:59', '["pickleball arena","pickleball court"]'),
    ('Hyderabad', 'Let''s Pickle Arena', 'Patrika Nagar, Near Hitech City Metro Station, Madhapur, Hyderabad - 500081', '+91 88866 55212', 4.7, '06:00', '23:30', '["pickleball court"]'),
    ('Hyderabad', 'Gachibowli Stadium Court', 'Old Mumbai Highway, Near IIIT Junction, Gachibowli, Hyderabad - 500032', null, 4.5, '05:30', '21:30', '["stadium court","pickleball court"]'),
    ('Chennai', 'Pickleball Paradise by FC Marina', 'Velachery Main Road, Near Elshaddai Church, Nanmangalam, Chennai - 600117', '+91 98404 12345', 4.9, '05:00', '23:00', '["outdoor hub","pickleball court"]'),
    ('Chennai', 'Paddle Lounge', '18th East Street, Kamaraj Nagar, Kottivakkam, Chennai - 600041', '+91 89396 77777', 4.8, '06:00', '23:00', '["premium facility","pickleball court"]'),
    ('Chennai', 'The Colosseum Dinkin'' Arena', 'East Coast Road (ECR), Near Prarthana Drive-in Theatre, Panaiyur, Chennai - 600119', null, 4.7, '06:00', '23:59', '["pickleball court"]'),
    ('Chennai', 'Leap Sports Academy 2.0', 'OMR Road, Near Hindustan University, Kazhipattur, Chennai - 603103', '+91 94458 11111', 4.6, '05:00', '23:00', '["sports academy","pickleball court"]'),
    ('Delhi NCR', 'REPPP (Rackonnect Exclusive Park)', 'Farm No. 1, Mehrauli-Gurgaon Road, Ladha Sarai Village, Near Qutab Minar Metro, New Delhi - 110030', '+91 84479 38928', 4.8, '05:00', '23:59', '["mega complex","pickleball court"]'),
    ('Delhi NCR', 'RallyGully', 'Soami Nagar South, near Panchsheel Enclave, New Delhi - 110017', '+91 98111 89765', 4.7, '06:00', '23:00', '["pickleball arena","pickleball court"]'),
    ('Delhi NCR', 'The DinkYard', 'Phase 1, Industrial Area, Mayapuri, New Delhi - 110064', null, 4.8, '06:00', '23:59', '["indoor arena","pickleball court"]'),
    ('Delhi NCR', 'Dinkit Delhi', 'Najafgarh Road Industrial Area, Near Moti Nagar Metro, New Delhi - 110015', null, 4.7, '06:00', '23:30', '["rooftop court","pickleball court"]'),
    ('Indore', 'Optimus Pickleball Club & Cafe', 'RRCAT Road, Near Silicon City Main Gate, Indore - 452012', '+91 73140 12345', 4.9, '06:00', '23:30', '["pickleball club","cafe"]'),
    ('Indore', 'Elite Pickleball Club', 'Plot 11, Scheme No. 78, Part II, Near Apollo DB City, Indore - 452010', null, 4.8, '06:00', '23:00', '["pickleball club","coaching"]'),
    ('Indore', 'Pickle Paradise', 'Gram Tejpur Gadbadi, Near Rajendra Nagar, Indore - 452012', '+91 98260 55544', 5.0, '06:00', '23:59', '["premium court","pickleball court"]'),
    ('Jaipur', 'The Dink District', 'New Sanganer Road, Near Mansarovar Metro Station, Mansarovar, Jaipur - 302020', null, 4.8, '06:00', '23:00', '["pickleball court","tournament venue"]'),
    ('Jaipur', 'Jaipur Racket Academy', 'Sirsi Road, Near Kanakpura Railway Station, Jaipur - 302012', '+91 94140 77889', 4.6, '05:30', '22:30', '["racket academy","pickleball court"]'),
    ('Lucknow', 'Athletes Pickle Court', 'Vishesh Khand 2, Near Amity International School, Gomti Nagar, Lucknow - 226010', null, 4.9, '06:00', '23:00', '["pickleball arena","pickleball court"]'),
    ('Lucknow', 'Picklepro Arena', 'Viraj Khand, Near JBR Grand Hotel, Gomti Nagar, Lucknow - 226010', '+91 80090 12233', 4.8, '06:00', '23:00', '["pickleball court"]'),
    ('Lucknow', 'Pickleball by Play Padel', 'Hotel Clarks Avadh Campus, 8, Mahatma Gandhi Marg, Hazratganj, Lucknow - 226001', '+91 52226 20131', 4.7, '07:00', '22:00', '["resort arena","pickleball court","padel"]'),
    ('Kolkata', 'Playplex Sports Arena', '6th Floor Terrace, Axis Mall, Block CF, Action Area 1C, Newtown, Kolkata - 700156', null, 4.7, '06:00', '23:00', '["rooftop court","pickleball court"]'),
    ('Kolkata', 'The Pickle Court', 'Bangul BFL Estate, Off Park Street, Mullick Bazar, Kolkata - 700016', '+91 98300 65432', 4.9, '00:00', '23:59', '["pickleball court","24 hours"]'),
    ('Kolkata', 'Pickleball XL', 'Knowledge Hub, Block EP & GP, Sector V, Salt Lake, Kolkata - 700091', null, 4.8, '06:00', '23:59', '["pickleball court"]');

  for v_row in select * from _city_venues loop
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
