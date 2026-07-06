-- ============================================================================
-- PickleBuzz — 031_nagpur_registration_url_fix.sql
-- Point Nagpur Grand Slam to the official Player Auction league page.
-- Run AFTER 030_nagpur_grand_slam_pickleball_league.sql.
-- ============================================================================

update public.tournaments
set
  registration_url = 'https://theplayerauction.com/auction/1351/nagpur-grand-slam-pickleball-league-2026',
  description = replace(
    description,
    'https://theplayerauction.com/auction/1351/nagpur-grand-slam-pickleball/register/3e313b9badf12632cdae5452d20e1af6',
    'https://theplayerauction.com/auction/1351/nagpur-grand-slam-pickleball-league-2026'
  )
where name = 'Nagpur Grand Slam Pickleball League 2026';
