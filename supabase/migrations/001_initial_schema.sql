-- PickleBuzz — initial database schema (Phase 1)
-- Run via Supabase CLI: supabase db push
-- Or paste into the Supabase SQL editor for a hosted project.

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enum types (aligned with src/types/)
-- ---------------------------------------------------------------------------

CREATE TYPE public.user_role AS ENUM (
  'player',
  'organizer',
  'referee',
  'club_owner',
  'admin'
);

CREATE TYPE public.skill_level AS ENUM (
  '2.0',
  '2.5',
  '3.0',
  '3.5',
  '4.0',
  '4.5',
  '5.0+'
);

CREATE TYPE public.match_type AS ENUM (
  'singles',
  'doubles',
  'mixed'
);

CREATE TYPE public.match_category AS ENUM (
  'friendly',
  'league',
  'tournament',
  'practice'
);

CREATE TYPE public.scoring_type AS ENUM (
  'rally',
  'side-out'
);

CREATE TYPE public.match_status AS ENUM (
  'draft',
  'live',
  'pending',
  'verified',
  'disputed',
  'completed'
);

CREATE TYPE public.team_side AS ENUM (
  'A',
  'B'
);

CREATE TYPE public.match_event_type AS ENUM (
  'point',
  'fault',
  'side_out',
  'timeout',
  'game_win',
  'match_win'
);

CREATE TYPE public.tournament_status AS ENUM (
  'draft',
  'upcoming',
  'live',
  'completed',
  'cancelled'
);

CREATE TYPE public.category_type AS ENUM (
  'singles',
  'doubles',
  'mixed'
);

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  avatar_url text,
  city text NOT NULL DEFAULT '',
  role public.user_role NOT NULL DEFAULT 'player',
  skill_level public.skill_level NOT NULL DEFAULT '3.0',
  dupr_rating numeric(4, 2) NOT NULL DEFAULT 3.00
    CHECK (dupr_rating >= 1.00 AND dupr_rating <= 8.00),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  match_type public.match_type NOT NULL,
  match_category public.match_category NOT NULL DEFAULT 'friendly',
  team_a_name text NOT NULL DEFAULT 'Team A',
  team_b_name text NOT NULL DEFAULT 'Team B',
  venue text NOT NULL DEFAULT '',
  court_number text,
  city text NOT NULL DEFAULT '',
  scoring_type public.scoring_type NOT NULL DEFAULT 'rally',
  target_points integer NOT NULL DEFAULT 11 CHECK (target_points > 0),
  best_of integer NOT NULL DEFAULT 3 CHECK (best_of IN (1, 3, 5)),
  win_by integer NOT NULL DEFAULT 2 CHECK (win_by IN (1, 2)),
  max_timeouts integer NOT NULL DEFAULT 2 CHECK (max_timeouts >= 0),
  timeout_duration integer NOT NULL DEFAULT 60 CHECK (timeout_duration > 0),
  is_public boolean NOT NULL DEFAULT true,
  status public.match_status NOT NULL DEFAULT 'draft',
  winner public.team_side,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE public.match_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES public.matches (id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  team public.team_side NOT NULL,
  server_number smallint CHECK (server_number IN (1, 2)),
  UNIQUE (match_id, player_id)
);

CREATE TABLE public.match_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES public.matches (id) ON DELETE CASCADE,
  event_type public.match_event_type NOT NULL,
  team public.team_side,
  description text NOT NULL DEFAULT '',
  score_a integer NOT NULL DEFAULT 0 CHECK (score_a >= 0),
  score_b integer NOT NULL DEFAULT 0 CHECK (score_b >= 0),
  game_number integer NOT NULL DEFAULT 1 CHECK (game_number > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.match_game_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES public.matches (id) ON DELETE CASCADE,
  game_number integer NOT NULL CHECK (game_number > 0),
  score_a integer NOT NULL DEFAULT 0 CHECK (score_a >= 0),
  score_b integer NOT NULL DEFAULT 0 CHECK (score_b >= 0),
  winner public.team_side,
  UNIQUE (match_id, game_number)
);

CREATE TABLE public.tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  venue text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  start_date date NOT NULL,
  end_date date NOT NULL,
  registration_deadline date NOT NULL,
  max_participants integer NOT NULL DEFAULT 32 CHECK (max_participants > 0),
  scoring_type public.scoring_type NOT NULL DEFAULT 'rally',
  points_to_win integer NOT NULL DEFAULT 11 CHECK (points_to_win > 0),
  best_of integer NOT NULL DEFAULT 3 CHECK (best_of IN (1, 3, 5)),
  win_by integer NOT NULL DEFAULT 2 CHECK (win_by IN (1, 2)),
  max_timeouts integer NOT NULL DEFAULT 2 CHECK (max_timeouts >= 0),
  timeout_duration integer NOT NULL DEFAULT 60 CHECK (timeout_duration > 0),
  is_public boolean NOT NULL DEFAULT true,
  status public.tournament_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_date >= start_date),
  CHECK (registration_deadline <= start_date)
);

CREATE TABLE public.tournament_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES public.tournaments (id) ON DELETE CASCADE,
  category_type public.category_type NOT NULL,
  skill_level public.skill_level NOT NULL,
  max_teams integer NOT NULL DEFAULT 16 CHECK (max_teams > 0),
  entry_fee numeric(10, 2) NOT NULL DEFAULT 0 CHECK (entry_fee >= 0)
);

CREATE TABLE public.tournament_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES public.tournaments (id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.tournament_categories (id) ON DELETE CASCADE,
  registered_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tournament_id, player_id, category_id)
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX idx_matches_created_by ON public.matches (created_by);
CREATE INDEX idx_matches_status ON public.matches (status);
CREATE INDEX idx_matches_is_public ON public.matches (is_public) WHERE is_public = true;
CREATE INDEX idx_matches_city ON public.matches (city);

CREATE INDEX idx_match_players_match_id ON public.match_players (match_id);
CREATE INDEX idx_match_players_player_id ON public.match_players (player_id);

CREATE INDEX idx_match_events_match_id ON public.match_events (match_id, created_at DESC);
CREATE INDEX idx_match_game_scores_match_id ON public.match_game_scores (match_id);

CREATE INDEX idx_tournaments_created_by ON public.tournaments (created_by);
CREATE INDEX idx_tournaments_is_public ON public.tournaments (is_public) WHERE is_public = true;
CREATE INDEX idx_tournaments_status ON public.tournaments (status);
CREATE INDEX idx_tournaments_city ON public.tournaments (city);

CREATE INDEX idx_tournament_categories_tournament_id
  ON public.tournament_categories (tournament_id);

CREATE INDEX idx_tournament_registrations_tournament_id
  ON public.tournament_registrations (tournament_id);
CREATE INDEX idx_tournament_registrations_player_id
  ON public.tournament_registrations (player_id);

CREATE INDEX idx_profiles_city ON public.profiles (city);
CREATE INDEX idx_profiles_role ON public.profiles (role);

-- ---------------------------------------------------------------------------
-- Helper: can the current user read a match?
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.user_can_read_match(p_match_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.matches m
    WHERE m.id = p_match_id
      AND (
        m.is_public = true
        OR m.created_by = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM public.match_players mp
          WHERE mp.match_id = m.id
            AND mp.player_id = auth.uid()
        )
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.user_can_read_tournament(p_tournament_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tournaments t
    WHERE t.id = p_tournament_id
      AND (t.is_public = true OR t.created_by = auth.uid())
  );
$$;

-- ---------------------------------------------------------------------------
-- Auto-create profile on signup
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    city,
    role,
    skill_level,
    dupr_rating
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'city', ''),
    COALESCE(
      (NEW.raw_user_meta_data ->> 'role')::public.user_role,
      'player'::public.user_role
    ),
    COALESCE(
      (NEW.raw_user_meta_data ->> 'skill_level')::public.skill_level,
      '3.0'::public.skill_level
    ),
    3.00
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Player rankings view
-- Only verified / completed matches with a declared winner count.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE VIEW public.player_rankings AS
WITH official_results AS (
  SELECT
    mp.player_id,
    m.id AS match_id,
    m.completed_at,
    CASE WHEN m.winner = mp.team THEN 1 ELSE 0 END AS won
  FROM public.match_players mp
  INNER JOIN public.matches m ON m.id = mp.match_id
  WHERE m.status IN ('verified', 'completed')
    AND m.winner IS NOT NULL
),
ranked_results AS (
  SELECT
    player_id,
    won,
    ROW_NUMBER() OVER (
      PARTITION BY player_id
      ORDER BY completed_at DESC NULLS LAST, match_id DESC
    ) AS recency
  FROM official_results
),
streaks AS (
  SELECT
    player_id,
    COALESCE(
      CASE
        WHEN MIN(CASE WHEN won = 0 THEN recency END) IS NULL
          THEN COUNT(*) FILTER (WHERE won = 1)
        WHEN MIN(CASE WHEN won = 0 THEN recency END) = 1
          THEN 0
        ELSE MIN(CASE WHEN won = 0 THEN recency END) - 1
      END,
      0
    )::integer AS current_streak
  FROM ranked_results
  GROUP BY player_id
),
aggregates AS (
  SELECT
    player_id,
    COUNT(*)::integer AS total_matches,
    COUNT(*) FILTER (WHERE won = 1)::integer AS wins,
    COUNT(*) FILTER (WHERE won = 0)::integer AS losses
  FROM official_results
  GROUP BY player_id
)
SELECT
  p.id,
  p.full_name,
  p.avatar_url,
  p.city,
  p.role,
  p.skill_level,
  p.dupr_rating,
  p.created_at,
  COALESCE(a.wins, 0) AS wins,
  COALESCE(a.total_matches, 0) AS total_matches,
  COALESCE(a.losses, 0) AS losses,
  CASE
    WHEN COALESCE(a.total_matches, 0) = 0 THEN 0::numeric
    ELSE ROUND((a.wins::numeric / a.total_matches::numeric) * 100, 1)
  END AS win_pct,
  COALESCE(s.current_streak, 0) AS current_streak
FROM public.profiles p
LEFT JOIN aggregates a ON a.player_id = p.id
LEFT JOIN streaks s ON s.player_id = p.id;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_game_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_registrations ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- matches
CREATE POLICY "Public matches are readable"
  ON public.matches
  FOR SELECT
  USING (
    is_public = true
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.match_players mp
      WHERE mp.match_id = matches.id
        AND mp.player_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create matches"
  ON public.matches
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Match owners can update their matches"
  ON public.matches
  FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Match owners can delete their matches"
  ON public.matches
  FOR DELETE
  USING (auth.uid() = created_by);

-- match_players
CREATE POLICY "Match players readable when match is readable"
  ON public.match_players
  FOR SELECT
  USING (public.user_can_read_match(match_id));

CREATE POLICY "Match owners can manage players"
  ON public.match_players
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.matches m
      WHERE m.id = match_id
        AND m.created_by = auth.uid()
    )
  );

CREATE POLICY "Match owners can update players"
  ON public.match_players
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.matches m
      WHERE m.id = match_id
        AND m.created_by = auth.uid()
    )
  );

CREATE POLICY "Match owners can remove players"
  ON public.match_players
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.matches m
      WHERE m.id = match_id
        AND m.created_by = auth.uid()
    )
  );

-- match_events
CREATE POLICY "Match events readable when match is readable"
  ON public.match_events
  FOR SELECT
  USING (public.user_can_read_match(match_id));

CREATE POLICY "Match owners can insert events"
  ON public.match_events
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.matches m
      WHERE m.id = match_id
        AND m.created_by = auth.uid()
    )
  );

CREATE POLICY "Match owners can update events"
  ON public.match_events
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.matches m
      WHERE m.id = match_id
        AND m.created_by = auth.uid()
    )
  );

CREATE POLICY "Match owners can delete events"
  ON public.match_events
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.matches m
      WHERE m.id = match_id
        AND m.created_by = auth.uid()
    )
  );

-- match_game_scores
CREATE POLICY "Game scores readable when match is readable"
  ON public.match_game_scores
  FOR SELECT
  USING (public.user_can_read_match(match_id));

CREATE POLICY "Match owners can insert game scores"
  ON public.match_game_scores
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.matches m
      WHERE m.id = match_id
        AND m.created_by = auth.uid()
    )
  );

CREATE POLICY "Match owners can update game scores"
  ON public.match_game_scores
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.matches m
      WHERE m.id = match_id
        AND m.created_by = auth.uid()
    )
  );

CREATE POLICY "Match owners can delete game scores"
  ON public.match_game_scores
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.matches m
      WHERE m.id = match_id
        AND m.created_by = auth.uid()
    )
  );

-- tournaments
CREATE POLICY "Public tournaments are readable"
  ON public.tournaments
  FOR SELECT
  USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Authenticated users can create tournaments"
  ON public.tournaments
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Tournament owners can update their tournaments"
  ON public.tournaments
  FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Tournament owners can delete their tournaments"
  ON public.tournaments
  FOR DELETE
  USING (auth.uid() = created_by);

-- tournament_categories
CREATE POLICY "Tournament categories readable when tournament is readable"
  ON public.tournament_categories
  FOR SELECT
  USING (public.user_can_read_tournament(tournament_id));

CREATE POLICY "Tournament owners can manage categories"
  ON public.tournament_categories
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.tournaments t
      WHERE t.id = tournament_id
        AND t.created_by = auth.uid()
    )
  );

CREATE POLICY "Tournament owners can update categories"
  ON public.tournament_categories
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.tournaments t
      WHERE t.id = tournament_id
        AND t.created_by = auth.uid()
    )
  );

CREATE POLICY "Tournament owners can delete categories"
  ON public.tournament_categories
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.tournaments t
      WHERE t.id = tournament_id
        AND t.created_by = auth.uid()
    )
  );

-- tournament_registrations
CREATE POLICY "Registrations readable by player or tournament owner"
  ON public.tournament_registrations
  FOR SELECT
  USING (
    player_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.tournaments t
      WHERE t.id = tournament_id
        AND t.created_by = auth.uid()
    )
    OR public.user_can_read_tournament(tournament_id)
  );

CREATE POLICY "Players can register themselves"
  ON public.tournament_registrations
  FOR INSERT
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Players can withdraw their registration"
  ON public.tournament_registrations
  FOR DELETE
  USING (auth.uid() = player_id);

CREATE POLICY "Tournament owners can remove registrations"
  ON public.tournament_registrations
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.tournaments t
      WHERE t.id = tournament_id
        AND t.created_by = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON public.player_rankings TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT ON public.matches TO anon;
GRANT SELECT ON public.match_players TO anon;
GRANT SELECT ON public.match_events TO anon;
GRANT SELECT ON public.match_game_scores TO anon;
GRANT SELECT ON public.tournaments TO anon;
GRANT SELECT ON public.tournament_categories TO anon;
GRANT SELECT ON public.tournament_registrations TO anon;

GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
