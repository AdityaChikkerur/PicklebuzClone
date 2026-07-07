-- ============================================================================
-- PickleBuzz — 044_discover_profile_boost_read.sql
-- Allow authenticated users to read active profile boosts for Discover badges.
-- Run AFTER 043_surat_dink_mpc3_tournaments.sql.
-- ============================================================================

drop policy if exists "Authenticated read active boosts for discover" on public.profile_boosts;

create policy "Authenticated read active boosts for discover"
  on public.profile_boosts
  for select
  to authenticated
  using (
    expires_at is not null
    and expires_at > now()
  );

comment on policy "Authenticated read active boosts for discover" on public.profile_boosts is
  'Lets Discover show the Boosted badge on other players with an active boost. Own-boost reads still use "Users read own boost".';
