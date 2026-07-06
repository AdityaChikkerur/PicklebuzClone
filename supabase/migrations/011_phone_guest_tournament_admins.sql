-- ============================================================================
-- PickleBuzz — 011_phone_guest_tournament_admins.sql
-- Phone lookup, guest players, tournament co-admins.
-- Run AFTER 010_match_scorers.sql.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. PHONE NORMALIZATION + INDEX
-- ----------------------------------------------------------------------------

create or replace function public.normalize_phone(p_phone text)
returns text
language sql
immutable
as $$
  select regexp_replace(
    regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g'),
    '^91',
    ''
  );
$$;

create index if not exists idx_profiles_phone_normalized
  on public.profiles (public.normalize_phone(phone))
  where phone is not null and phone <> '';

-- ----------------------------------------------------------------------------
-- 2. GUEST PLAYERS (add by phone when not registered — CricHeroes-style)
-- ----------------------------------------------------------------------------

create table if not exists public.guest_players (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  created_by uuid not null references public.profiles (id) on delete cascade,
  claimed_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_guest_players_phone
  on public.guest_players (public.normalize_phone(phone));

create index if not exists idx_guest_players_created_by
  on public.guest_players (created_by);

-- Allow match_players to reference either a registered profile or a guest
alter table public.match_players
  alter column player_id drop not null;

alter table public.match_players
  add column if not exists guest_id uuid references public.guest_players (id) on delete cascade;

alter table public.match_players
  drop constraint if exists match_players_player_or_guest_chk;

alter table public.match_players
  add constraint match_players_player_or_guest_chk
  check (
    (player_id is not null and guest_id is null)
    or (player_id is null and guest_id is not null)
  );

-- ----------------------------------------------------------------------------
-- 3. TOURNAMENT CO-ADMINS
-- ----------------------------------------------------------------------------

create table if not exists public.tournament_admins (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'admin'
    check (role in ('admin', 'scorer')),
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined', 'revoked')),
  invited_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  unique (tournament_id, user_id)
);

create index if not exists idx_tournament_admins_tournament
  on public.tournament_admins (tournament_id);

create index if not exists idx_tournament_admins_user
  on public.tournament_admins (user_id, status);

-- ----------------------------------------------------------------------------
-- 4. HELPER: can the current user manage a tournament?
-- ----------------------------------------------------------------------------

create or replace function public.user_can_manage_tournament(p_tournament_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.tournaments t
    where t.id = p_tournament_id
      and (
        t.created_by = auth.uid()
        or public.is_admin()
        or exists (
          select 1
          from public.tournament_admins ta
          where ta.tournament_id = p_tournament_id
            and ta.user_id = auth.uid()
            and ta.status = 'accepted'
        )
      )
  );
$$;

-- Extend read access so co-admins can see private tournaments they manage
create or replace function public.user_can_read_tournament(p_tournament_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.tournaments t
    where t.id = p_tournament_id
      and (
        t.is_public = true
        or t.created_by = auth.uid()
        or public.is_admin()
        or exists (
          select 1
          from public.tournament_admins ta
          where ta.tournament_id = p_tournament_id
            and ta.user_id = auth.uid()
            and ta.status = 'accepted'
        )
      )
  );
$$;

-- ----------------------------------------------------------------------------
-- 5. RLS — guest_players
-- ----------------------------------------------------------------------------

alter table public.guest_players enable row level security;

drop policy if exists "guest_players read" on public.guest_players;
create policy "guest_players read" on public.guest_players
  for select using (
    created_by = auth.uid()
    or public.is_admin()
    or exists (
      select 1
      from public.match_players mp
      inner join public.matches m on m.id = mp.match_id
      where mp.guest_id = guest_players.id
        and public.user_can_read_match(m.id)
    )
  );

drop policy if exists "guest_players insert" on public.guest_players;
create policy "guest_players insert" on public.guest_players
  for insert with check (created_by = auth.uid());

drop policy if exists "guest_players update own" on public.guest_players;
create policy "guest_players update own" on public.guest_players
  for update using (created_by = auth.uid() or public.is_admin());

-- ----------------------------------------------------------------------------
-- 6. RLS — tournament_admins
-- ----------------------------------------------------------------------------

alter table public.tournament_admins enable row level security;

drop policy if exists "tournament_admins read" on public.tournament_admins;
create policy "tournament_admins read" on public.tournament_admins
  for select using (
    user_id = auth.uid()
    or public.user_can_manage_tournament(tournament_id)
    or public.is_admin()
  );

drop policy if exists "tournament_admins insert" on public.tournament_admins;
create policy "tournament_admins insert" on public.tournament_admins
  for insert with check (
    public.user_can_manage_tournament(tournament_id)
    and invited_by = auth.uid()
  );

drop policy if exists "tournament_admins update" on public.tournament_admins;
create policy "tournament_admins update" on public.tournament_admins
  for update using (
    user_id = auth.uid()
    or public.user_can_manage_tournament(tournament_id)
    or public.is_admin()
  );

drop policy if exists "tournament_admins delete" on public.tournament_admins;
create policy "tournament_admins delete" on public.tournament_admins
  for delete using (
    public.user_can_manage_tournament(tournament_id)
    or public.is_admin()
  );

-- ----------------------------------------------------------------------------
-- 7. RLS — update tournament management policies to include co-admins
-- ----------------------------------------------------------------------------

drop policy if exists "fixtures write owner" on public.fixtures;
create policy "fixtures write owner" on public.fixtures for all using (
  public.is_admin() or public.user_can_manage_tournament(tournament_id)
) with check (
  public.is_admin() or public.user_can_manage_tournament(tournament_id)
);

drop policy if exists "points write owner" on public.points_table;
create policy "points write owner" on public.points_table for all using (
  public.is_admin() or public.user_can_manage_tournament(tournament_id)
) with check (
  public.is_admin() or public.user_can_manage_tournament(tournament_id)
);

-- Tournament categories (from 001 — replace insert/update/delete owner policies)
drop policy if exists "Tournament owners can manage categories" on public.tournament_categories;
drop policy if exists "Tournament owners can update categories" on public.tournament_categories;
drop policy if exists "Tournament owners can delete categories" on public.tournament_categories;
drop policy if exists "Tournament managers can insert categories" on public.tournament_categories;
drop policy if exists "Tournament managers can update categories" on public.tournament_categories;
drop policy if exists "Tournament managers can delete categories" on public.tournament_categories;
create policy "Tournament managers can insert categories"
  on public.tournament_categories
  for insert
  with check (public.user_can_manage_tournament(tournament_id));
create policy "Tournament managers can update categories"
  on public.tournament_categories
  for update
  using (public.user_can_manage_tournament(tournament_id))
  with check (public.user_can_manage_tournament(tournament_id));
create policy "Tournament managers can delete categories"
  on public.tournament_categories
  for delete
  using (public.user_can_manage_tournament(tournament_id));

-- Tournament registrations (approval/update by organizer or co-admin)
drop policy if exists "registrations update owner" on public.tournament_registrations;
drop policy if exists "registrations update manager" on public.tournament_registrations;
create policy "registrations update manager" on public.tournament_registrations
  for update using (public.user_can_manage_tournament(tournament_id));

drop policy if exists "Tournament owners can remove registrations" on public.tournament_registrations;
drop policy if exists "Tournament managers can remove registrations" on public.tournament_registrations;
create policy "Tournament managers can remove registrations"
  on public.tournament_registrations
  for delete
  using (public.user_can_manage_tournament(tournament_id));

-- Tournaments update (correct policy name from 001)
drop policy if exists "Tournament owners can update their tournaments" on public.tournaments;
drop policy if exists "Tournament owners can update own tournaments" on public.tournaments;
drop policy if exists "Tournament managers can update tournaments" on public.tournaments;
create policy "Tournament managers can update tournaments"
  on public.tournaments
  for update
  using (public.user_can_manage_tournament(id))
  with check (public.user_can_manage_tournament(id));
