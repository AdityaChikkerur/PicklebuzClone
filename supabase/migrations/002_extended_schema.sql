-- ============================================================================
-- PickleBuzz — 002_extended_schema.sql  (Phase 2)
-- Run AFTER 001_initial_schema.sql.
-- Adds: custom rules, result verification/disputes, tournament formats,
--       clubs/courts/bookings, rankings, notifications, monetization.
-- Plus: enum/column extensions, RLS on every new table, realtime, seed data.
-- Safe to re-run: uses IF NOT EXISTS / DO-block guards where practical.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. SHARED HELPERS
-- ----------------------------------------------------------------------------

-- Generic updated_at trigger (used by tables that carry updated_at).
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Helper: is the current user an admin? (avoids recursive RLS on profiles)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ----------------------------------------------------------------------------
-- 1. EXTEND EXISTING TABLES (from 001)
-- ----------------------------------------------------------------------------

alter table public.profiles
  add column if not exists looking_for_partner boolean not null default false,
  add column if not exists looking_for_match boolean not null default false,
  add column if not exists updated_at timestamptz not null default now();

alter table public.matches
  add column if not exists local_rules jsonb not null default '{}'::jsonb,
  add column if not exists tournament_id uuid references public.tournaments(id) on delete set null;

-- matches.status: add verification states. (001 may already have 'completed'.)
-- Stored as text + CHECK to avoid fragile enum ALTERs; adjust if 001 used an enum.
do $$
begin
  -- add columns if 001 didn't already define them
  if not exists (select 1 from information_schema.columns
                 where table_schema='public' and table_name='matches' and column_name='updated_at') then
    alter table public.matches add column updated_at timestamptz default now();
  end if;
end $$;

-- Ensure matches.status allows the verification lifecycle.
-- If 001 declared status as text without a constraint, this adds one.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'matches_status_check'
  ) then
    alter table public.matches
      add constraint matches_status_check
      check (status in ('scheduled','live','completed','pending','verified','disputed'));
  end if;
exception when others then
  -- if status is an enum type in 001, skip silently; handle via enum ALTER instead.
  null;
end $$;

create index if not exists idx_matches_tournament_id on public.matches(tournament_id);

-- tournaments.format
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'tournaments' and column_name = 'format'
  ) then
    alter table public.tournaments
      add column format text not null default 'knockout';
    alter table public.tournaments
      add constraint tournaments_format_check
      check (format in ('knockout','round_robin','league','group_knockout'));
  end if;
end $$;

alter table public.tournaments
  add column if not exists prize text,
  add column if not exists banner_url text,
  add column if not exists updated_at timestamptz default now();

-- tournament_registrations: doubles partner, seeding, approval state
alter table public.tournament_registrations
  add column if not exists partner_id uuid references public.profiles(id);

alter table public.tournament_registrations
  add column if not exists seed int;

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'tournament_registrations' and column_name = 'status'
  ) then
    alter table public.tournament_registrations
      add column status text not null default 'pending';
    alter table public.tournament_registrations
      add constraint tournament_registrations_status_check
      check (status in ('pending','approved','rejected'));
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- 2. CUSTOM RULES ENGINE
-- ----------------------------------------------------------------------------
-- 1:1 with matches. Drives useMatchState.ts (side-out vs rally + serve tracking).
create table if not exists public.match_rules (
  match_id          uuid primary key references public.matches(id) on delete cascade,
  scoring_type      text not null default 'side-out'
                    check (scoring_type in ('rally','side-out')),
  target_points     int  not null default 11,
  win_by            int  not null default 2,
  best_of           int  not null default 3,
  doubles           boolean not null default false,
  max_timeouts      int  not null default 2,
  timeout_duration  int  not null default 60,   -- seconds
  local_rules       jsonb not null default '{}'::jsonb
);

-- ----------------------------------------------------------------------------
-- 3. RESULT VERIFICATION & DISPUTES
-- ----------------------------------------------------------------------------
create table if not exists public.disputes (
  id          uuid primary key default gen_random_uuid(),
  match_id    uuid not null references public.matches(id) on delete cascade,
  raised_by   uuid not null references public.profiles(id),
  reason      text,
  status      text not null default 'open' check (status in ('open','resolved')),
  resolution  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists idx_disputes_match on public.disputes(match_id);
create index if not exists idx_disputes_status on public.disputes(status);

drop trigger if exists trg_disputes_updated on public.disputes;
create trigger trg_disputes_updated before update on public.disputes
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 4. TOURNAMENT FORMATS — fixtures + points table
-- ----------------------------------------------------------------------------
create table if not exists public.fixtures (
  id            uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  category_id   uuid references public.tournament_categories(id) on delete cascade,
  round         text,                       -- 'R32','QF','SF','Final','RR'
  match_id      uuid references public.matches(id) on delete set null,
  team_a        text,
  team_b        text,
  created_at    timestamptz not null default now()
);
create index if not exists idx_fixtures_tournament on public.fixtures(tournament_id);

create table if not exists public.points_table (
  id               uuid primary key default gen_random_uuid(),
  tournament_id    uuid not null references public.tournaments(id) on delete cascade,
  category_id      uuid references public.tournament_categories(id) on delete cascade,
  team_id          text not null,           -- team name / synthetic id
  played           int not null default 0,
  wins             int not null default 0,
  losses           int not null default 0,
  points_for       int not null default 0,
  points_against   int not null default 0,
  point_difference int generated always as (points_for - points_against) stored,
  ranking          int,
  unique (tournament_id, category_id, team_id)
);
create index if not exists idx_points_tournament on public.points_table(tournament_id);

-- ----------------------------------------------------------------------------
-- 5. CLUB & COURT MODULE
-- ----------------------------------------------------------------------------
create table if not exists public.clubs (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  city        text,
  location    text,
  amenities   jsonb not null default '[]'::jsonb,
  contact     text,
  rating      numeric(2,1),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists idx_clubs_owner on public.clubs(owner_id);

create table if not exists public.courts (
  id             uuid primary key default gen_random_uuid(),
  club_id        uuid not null references public.clubs(id) on delete cascade,
  name           text not null,
  surface        text,
  price_per_hour int,
  open_from      time,
  open_to        time
);
create index if not exists idx_courts_club on public.courts(club_id);

create table if not exists public.court_bookings (
  id          uuid primary key default gen_random_uuid(),
  court_id    uuid not null references public.courts(id) on delete cascade,
  player_id   uuid not null references public.profiles(id) on delete cascade,
  start_at    timestamptz not null,
  end_at      timestamptz not null,
  status      text not null default 'pending'
              check (status in ('pending','confirmed','cancelled')),
  amount      int,
  created_at  timestamptz not null default now()
);
create index if not exists idx_bookings_court on public.court_bookings(court_id);
create index if not exists idx_bookings_player on public.court_bookings(player_id);

-- ----------------------------------------------------------------------------
-- 6. RANKINGS (precomputed boards) — optional cache
-- ----------------------------------------------------------------------------
create table if not exists public.rankings (
  id          uuid primary key default gen_random_uuid(),
  scope       text not null check (scope in ('city','club','tournament','global')),
  scope_ref   text,
  discipline  text not null check (discipline in ('singles','doubles')),
  player_id   uuid not null references public.profiles(id) on delete cascade,
  rating      int,
  rank        int,
  computed_at timestamptz not null default now()
);
create index if not exists idx_rankings_scope on public.rankings(scope, scope_ref, discipline);

-- ----------------------------------------------------------------------------
-- 7. NOTIFICATIONS
-- ----------------------------------------------------------------------------
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  icon        text,
  text        text not null,
  link        text,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists idx_notifications_user on public.notifications(user_id, read);

-- ----------------------------------------------------------------------------
-- 8. MONETIZATION PLACEHOLDERS
-- ----------------------------------------------------------------------------
create table if not exists public.payments_placeholder (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  kind        text not null check (kind in
              ('tournament_fee','court_booking','profile_boost','subscription')),
  ref_id      uuid,
  amount      int,
  status      text not null default 'pending' check (status in ('pending','paid')),
  created_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 9. updated_at triggers for the new tables that carry it
-- ----------------------------------------------------------------------------
drop trigger if exists trg_clubs_updated on public.clubs;
create trigger trg_clubs_updated before update on public.clubs
  for each row execute function public.set_updated_at();

drop trigger if exists trg_tournaments_updated on public.tournaments;
create trigger trg_tournaments_updated before update on public.tournaments
  for each row execute function public.set_updated_at();

drop trigger if exists trg_matches_updated on public.matches;
create trigger trg_matches_updated before update on public.matches
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 10. ROW-LEVEL SECURITY
-- ============================================================================
alter table public.match_rules          enable row level security;
alter table public.disputes             enable row level security;
alter table public.fixtures             enable row level security;
alter table public.points_table         enable row level security;
alter table public.clubs                enable row level security;
alter table public.courts               enable row level security;
alter table public.court_bookings       enable row level security;
alter table public.rankings             enable row level security;
alter table public.notifications        enable row level security;
alter table public.payments_placeholder enable row level security;

-- ---- match_rules: readable if the parent match is readable; writable by match creator ----
drop policy if exists "match_rules read" on public.match_rules;
create policy "match_rules read" on public.match_rules for select using (
  public.user_can_read_match(match_id) or public.is_admin()
);
drop policy if exists "match_rules write own" on public.match_rules;
create policy "match_rules write own" on public.match_rules for all using (
  exists (select 1 from public.matches m where m.id = match_id and m.created_by = auth.uid())
) with check (
  exists (select 1 from public.matches m where m.id = match_id and m.created_by = auth.uid())
);

-- ---- disputes: participants of the match can read; raiser inserts; admin manages ----
drop policy if exists "disputes read" on public.disputes;
create policy "disputes read" on public.disputes for select using (
  raised_by = auth.uid()
  or public.is_admin()
  or public.user_can_read_match(match_id)
);
drop policy if exists "disputes insert" on public.disputes;
create policy "disputes insert" on public.disputes for insert with check (
  raised_by = auth.uid()
  and exists (
    select 1 from public.match_players mp
    where mp.match_id = disputes.match_id and mp.player_id = auth.uid()
  )
);
drop policy if exists "disputes admin update" on public.disputes;
create policy "disputes admin update" on public.disputes for update using (public.is_admin());

-- ---- fixtures & points_table: public read; organizer (tournament owner) or admin writes ----
drop policy if exists "fixtures read" on public.fixtures;
create policy "fixtures read" on public.fixtures for select using (
  public.user_can_read_tournament(tournament_id) or public.is_admin()
);
drop policy if exists "fixtures write owner" on public.fixtures;
create policy "fixtures write owner" on public.fixtures for all using (
  public.is_admin() or exists (
    select 1 from public.tournaments t where t.id = tournament_id and t.created_by = auth.uid()
  )
) with check (
  public.is_admin() or exists (
    select 1 from public.tournaments t where t.id = tournament_id and t.created_by = auth.uid()
  )
);

drop policy if exists "points read" on public.points_table;
create policy "points read" on public.points_table for select using (
  public.user_can_read_tournament(tournament_id) or public.is_admin()
);
drop policy if exists "points write owner" on public.points_table;
create policy "points write owner" on public.points_table for all using (
  public.is_admin() or exists (
    select 1 from public.tournaments t where t.id = tournament_id and t.created_by = auth.uid()
  )
) with check (
  public.is_admin() or exists (
    select 1 from public.tournaments t where t.id = tournament_id and t.created_by = auth.uid()
  )
);

-- ---- clubs: public read; owner manages own ----
drop policy if exists "clubs read" on public.clubs;
create policy "clubs read" on public.clubs for select using (true);
drop policy if exists "clubs write owner" on public.clubs;
create policy "clubs write owner" on public.clubs for all
  using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());

-- ---- courts: public read; club owner manages ----
drop policy if exists "courts read" on public.courts;
create policy "courts read" on public.courts for select using (true);
drop policy if exists "courts write owner" on public.courts;
create policy "courts write owner" on public.courts for all using (
  public.is_admin() or exists (
    select 1 from public.clubs c where c.id = club_id and c.owner_id = auth.uid()
  )
) with check (
  public.is_admin() or exists (
    select 1 from public.clubs c where c.id = club_id and c.owner_id = auth.uid()
  )
);

-- ---- court_bookings: player sees own; club owner sees their courts' bookings ----
drop policy if exists "bookings read" on public.court_bookings;
create policy "bookings read" on public.court_bookings for select using (
  player_id = auth.uid()
  or public.is_admin()
  or exists (
    select 1 from public.courts ct join public.clubs c on c.id = ct.club_id
    where ct.id = court_id and c.owner_id = auth.uid()
  )
);
drop policy if exists "bookings insert own" on public.court_bookings;
create policy "bookings insert own" on public.court_bookings for insert with check (player_id = auth.uid());
drop policy if exists "bookings update owner_or_player" on public.court_bookings;
create policy "bookings update owner_or_player" on public.court_bookings for update using (
  player_id = auth.uid()
  or public.is_admin()
  or exists (
    select 1 from public.courts ct join public.clubs c on c.id = ct.club_id
    where ct.id = court_id and c.owner_id = auth.uid()
  )
);

-- ---- rankings: public read; admin writes (or service role via Edge Function) ----
drop policy if exists "rankings read" on public.rankings;
create policy "rankings read" on public.rankings for select using (true);
drop policy if exists "rankings admin write" on public.rankings;
create policy "rankings admin write" on public.rankings for all
  using (public.is_admin()) with check (public.is_admin());

-- ---- notifications: private to the user ----
drop policy if exists "notifications own" on public.notifications;
create policy "notifications own" on public.notifications for select
  using (user_id = auth.uid());
drop policy if exists "notifications update own" on public.notifications;
create policy "notifications update own" on public.notifications for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "notifications insert system" on public.notifications;
create policy "notifications insert system" on public.notifications for insert
  with check (true);

-- ---- payments_placeholder: private to the user ----
drop policy if exists "payments own" on public.payments_placeholder;
create policy "payments own" on public.payments_placeholder for all
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid());

-- ---- tournament registration approval by organizer ----
drop policy if exists "registrations update owner" on public.tournament_registrations;
create policy "registrations update owner" on public.tournament_registrations for update using (
  public.is_admin() or exists (
    select 1 from public.tournaments t where t.id = tournament_id and t.created_by = auth.uid()
  )
);

-- ============================================================================
-- 11. GRANTS
-- ============================================================================
grant select on public.match_rules to anon, authenticated;
grant select, insert, update, delete on public.match_rules to authenticated;

grant select on public.disputes to anon, authenticated;
grant select, insert, update on public.disputes to authenticated;

grant select on public.fixtures to anon, authenticated;
grant select, insert, update, delete on public.fixtures to authenticated;

grant select on public.points_table to anon, authenticated;
grant select, insert, update, delete on public.points_table to authenticated;

grant select on public.clubs to anon, authenticated;
grant select, insert, update, delete on public.clubs to authenticated;

grant select on public.courts to anon, authenticated;
grant select, insert, update, delete on public.courts to authenticated;

grant select on public.court_bookings to authenticated;
grant select, insert, update on public.court_bookings to authenticated;

grant select on public.rankings to anon, authenticated;

grant select, insert, update on public.notifications to authenticated;

grant select, insert on public.payments_placeholder to authenticated;

-- ============================================================================
-- 12. REALTIME PUBLICATION
-- ============================================================================
do $$
begin
  -- add each table if not already in the publication
  if not exists (select 1 from pg_publication_tables
                 where pubname='supabase_realtime' and schemaname='public' and tablename='match_events') then
    execute 'alter publication supabase_realtime add table public.match_events';
  end if;
  if not exists (select 1 from pg_publication_tables
                 where pubname='supabase_realtime' and schemaname='public' and tablename='matches') then
    execute 'alter publication supabase_realtime add table public.matches';
  end if;
  if not exists (select 1 from pg_publication_tables
                 where pubname='supabase_realtime' and schemaname='public' and tablename='notifications') then
    execute 'alter publication supabase_realtime add table public.notifications';
  end if;
end $$;

-- ============================================================================
-- 13. SEED / DEMO DATA
-- ----------------------------------------------------------------------------
-- NOTE: profiles.id references auth.users. You cannot freely insert profiles
-- without matching auth users. So seeding is split:
--   (A) Data that does NOT need a real auth user (clubs/courts use a demo owner
--       only if one exists) is inserted defensively.
--   (B) Per-user demo rows (notifications, bookings) are inserted for whatever
--       profiles already exist, so this block is safe on an empty or seeded DB.
-- Replace the demo owner lookup with your real seeded admin/owner as needed.
-- ============================================================================

do $$
declare
  v_owner  uuid;
  v_club   uuid;
  v_court  uuid;
  v_player uuid;
  v_tourn  uuid;
begin
  -- pick any existing profile as a stand-in club owner / player for demo rows
  select id into v_owner  from public.profiles order by created_at limit 1;
  select id into v_player from public.profiles order by created_at desc limit 1;

  if v_owner is null then
    raise notice 'No profiles found — skipping per-user seed. Create users first, then re-run section 13.';
    return;
  end if;

  -- ---- Club + courts (idempotent on name) ----
  select id into v_club from public.clubs where name = 'Godavari Pickle Club' limit 1;
  if v_club is null then
    insert into public.clubs (owner_id, name, city, location, amenities, contact, rating)
    values (v_owner, 'Godavari Pickle Club', 'Nashik', 'College Road, Nashik',
            '["Floodlights","Parking","Pro shop"]'::jsonb, '+91 90000 00001', 4.7)
    returning id into v_club;

    insert into public.courts (club_id, name, surface, price_per_hour, open_from, open_to) values
      (v_club, 'Court 1', 'Acrylic hard', 400, '06:00', '22:00'),
      (v_club, 'Court 2', 'Acrylic hard', 400, '06:00', '22:00'),
      (v_club, 'Court 3', 'Concrete',     350, '06:00', '22:00'),
      (v_club, 'Court 4', 'Concrete',     350, '06:00', '22:00');
  end if;

  select id into v_club from public.clubs where name = 'Deccan Paddle Arena' limit 1;
  if v_club is null then
    insert into public.clubs (owner_id, name, city, location, amenities, contact, rating)
    values (v_owner, 'Deccan Paddle Arena', 'Pune', 'Baner, Pune',
            '["AC indoor","Cafe","Coaching"]'::jsonb, '+91 90000 00002', 4.9)
    returning id into v_club;

    insert into public.courts (club_id, name, surface, price_per_hour, open_from, open_to) values
      (v_club, 'Court A', 'Indoor wood', 550, '06:00', '23:00'),
      (v_club, 'Court B', 'Indoor wood', 550, '06:00', '23:00');
  end if;

  -- ---- Tournaments: one per format (001 requires start/end/deadline dates) ----
  if not exists (select 1 from public.tournaments where name = 'Nashik Open 2026') then
    insert into public.tournaments
      (created_by, name, description, venue, city, address, format, prize,
       start_date, end_date, registration_deadline, max_participants,
       scoring_type, points_to_win, best_of, win_by, max_timeouts, timeout_duration,
       is_public, status)
    values
      (v_owner, 'Nashik Open 2026', 'Group stage then knockout.', 'Godavari Club',
       'Nashik', 'College Road', 'group_knockout', '₹25,000',
       current_date + 14, current_date + 21, current_date + 7, 32,
       'side-out', 11, 3, 2, 2, 60, true, 'upcoming');
  end if;

  if not exists (select 1 from public.tournaments where name = 'Pune Smash League') then
    insert into public.tournaments
      (created_by, name, description, venue, city, address, format, prize,
       start_date, end_date, registration_deadline, max_participants,
       scoring_type, points_to_win, best_of, win_by, max_timeouts, timeout_duration,
       is_public, status)
    values
      (v_owner, 'Pune Smash League', 'Round-robin league.', 'Deccan Arena',
       'Pune', 'Baner', 'round_robin', '₹18,000',
       current_date - 7, current_date + 7, current_date - 14, 16,
       'rally', 15, 3, 2, 1, 60, true, 'live')
    returning id into v_tourn;

    -- a tiny points table for the league demo
    insert into public.points_table (tournament_id, team_id, played, wins, losses, points_for, points_against, ranking) values
      (v_tourn, 'Shah / Desai',  3, 3, 0, 33, 21, 1),
      (v_tourn, 'Iyer / Khan',   3, 2, 1, 30, 26, 2),
      (v_tourn, 'Rao / Khan',    3, 1, 2, 25, 30, 3),
      (v_tourn, 'Shah / Rao',    3, 0, 3, 20, 31, 4);
  end if;

  if not exists (select 1 from public.tournaments where name = 'Monsoon Cup') then
    insert into public.tournaments
      (created_by, name, description, venue, city, address, format, prize,
       start_date, end_date, registration_deadline, max_participants,
       scoring_type, points_to_win, best_of, win_by, max_timeouts, timeout_duration,
       is_public, status)
    values
      (v_owner, 'Monsoon Cup', 'Single-elimination knockout.', 'Mumbai Sports Club',
       'Mumbai', 'Andheri', 'knockout', '₹30,000',
       current_date - 30, current_date - 28, current_date - 35, 64,
       'side-out', 11, 3, 2, 2, 60, true, 'completed');
  end if;

  -- ---- Notifications (one per type) for the demo player ----
  if not exists (select 1 from public.notifications where user_id = v_owner) then
    insert into public.notifications (user_id, icon, text, link, read) values
      (v_owner, '🏆', 'Your registration for Nashik Open 2026 is approved', '/tournament', false),
      (v_owner, '✅', 'Confirm the result of your last match',                '/match',      false),
      (v_owner, '📅', 'Court booked: Godavari Club, Court 2, 6:00 PM',        '/club',       true),
      (v_owner, '⚠️', 'A result dispute was raised on Mixed Doubles QF',      '/match',      false);
  end if;

  -- ---- A confirmed court booking for the demo player ----
  select id into v_court from public.courts where name = 'Court 2' limit 1;
  if v_court is not null and v_player is not null
     and not exists (select 1 from public.court_bookings where court_id = v_court and player_id = v_player) then
    insert into public.court_bookings (court_id, player_id, start_at, end_at, status, amount)
    values (v_court, v_player, now() + interval '1 day', now() + interval '1 day 1 hour', 'confirmed', 400);
  end if;

  raise notice 'PickleBuzz extended seed complete.';
end $$;

-- ============================================================================
-- END 002_extended_schema.sql
-- ============================================================================
