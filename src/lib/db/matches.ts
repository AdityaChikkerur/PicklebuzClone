// -----------------------------------------------------------------------------
// Persistence layer for live scoring.
//
// Responsibilities:
//   1. Create the match row + match_rules + match_players when a match starts.
//   2. Stream every scoring action as a match_events insert (drives realtime +
//      /spectate/[id], which already subscribe via useRealtimeMatch).
//   3. On end-match, write match_game_scores and flip matches.status -> 'pending'
//      so the verification workflow (confirm/dispute) takes over.
//   4. Reads for /match/[id] and /spectate/[id].
//
// Conventions (per the project brief, section 12):
//   - isSupabaseConfigured() gate: in mock mode every write is a no-op that
//     resolves successfully, so the UI behaves identically with or without a DB.
//   - try/catch on every Supabase call; callers surface errors via Sonner.
//   - No `any`. Uses createClient() from @/lib/supabase (browser client).
// -----------------------------------------------------------------------------

import { authFetch } from "@/lib/auth/clientFetch";
import { createClient } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/auth/isSupabaseConfigured";
import { formatDbError } from "@/lib/db/formatDbError";
import { isUuid } from "@/lib/db/config";
import type {
  DbMatchRules,
  FaultType,
  GameScore,
  MatchCategory,
  MatchDetail,
  MatchEvent,
  MatchRules,
  MatchSetupState,
  MatchState,
  MatchStatus,
  MatchStats,
  MatchType,
  Team,
} from "@/types/match";
import { DEFAULT_FAULTS } from "@/types/match";
import {
  mapDbGameScore,
  mapDbMatchEvent,
  mapDbMatchRules,
  type DbGameScoreRow,
  type DbMatchEventRow,
  type DbMatchRow,
} from "./mappers";

// -----------------------------------------------------------------------------
// Result helper — every function returns this shape so callers can toast on error
// without try/catch at the call site.
// -----------------------------------------------------------------------------
export type DbResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

const ok = <T>(data: T): DbResult<T> => ({ data, error: null });
const fail = (error: unknown): DbResult<never> => ({
  data: null,
  error: formatDbError(error, "Something went wrong"),
});

// Mock-mode sentinel: callers can detect "we didn't actually hit the DB".
export const MOCK_OK = Symbol("mock-ok");

function isMockMatchId(matchId: string): boolean {
  return matchId.startsWith("mock-");
}

/** True when we should hit Supabase for a given match id. */
function shouldPersist(matchId: string): boolean {
  return isSupabaseConfigured() && !isMockMatchId(matchId) && isUuid(matchId);
}

function parseLocalRules(localRules: string): Record<string, unknown> {
  const trimmed = localRules.trim();
  return trimmed ? { notes: trimmed } : {};
}

// -----------------------------------------------------------------------------
// Row shapes (what we insert/select). Kept local so this file is self-contained.
// -----------------------------------------------------------------------------
interface MatchRow {
  id: string;
  created_by: string;
  match_type: string;
  match_category: string | null;
  team_a_name: string;
  team_b_name: string;
  venue: string | null;
  court_number: string | null;
  city: string | null;
  scoring_type: string;
  target_points: number;
  best_of: number;
  win_by: number;
  max_timeouts: number;
  timeout_duration: number;
  is_public: boolean;
  status: string;
  winner: string | null;
  created_at: string;
  completed_at: string | null;
  local_rules?: Record<string, unknown>;
  has_referee?: boolean;
}

interface MatchEventRow {
  match_id: string;
  event_type: string;
  team: string | null;
  description: string | null;
  score_a: number;
  score_b: number;
  game_number: number;
  created_at?: string;
}

export interface LoadedMatchState {
  match: DbMatchRow;
  rules: MatchRules;
  events: ReturnType<typeof mapDbMatchEvent>[];
  gameScores: ReturnType<typeof mapDbGameScore>[];
}

function countTimeoutsUsed(events: DbMatchEventRow[], team: Team): number {
  return events.filter((e) => e.event_type === "timeout" && e.team === team)
    .length;
}

function isGameWonFromScores(
  scoreA: number,
  scoreB: number,
  targetPoints: number,
  winBy: number
): Team | null {
  if (scoreA >= targetPoints && scoreA - scoreB >= winBy) return "A";
  if (scoreB >= targetPoints && scoreB - scoreA >= winBy) return "B";
  return null;
}

/** Reconstruct completed games from persisted point/fault events during live play. */
function deriveGameScoresFromEvents(
  events: DbMatchEventRow[],
  rules: MatchRules
): ReturnType<typeof mapDbGameScore>[] {
  const chron = [...events].reverse();
  const seen = new Set<number>();
  const derived: ReturnType<typeof mapDbGameScore>[] = [];

  for (const event of chron) {
    if (event.event_type !== "point" && event.event_type !== "fault") continue;
    const winner = isGameWonFromScores(
      event.score_a,
      event.score_b,
      rules.targetPoints,
      rules.winBy
    );
    if (winner && !seen.has(event.game_number)) {
      seen.add(event.game_number);
      derived.push({
        gameNumber: event.game_number,
        scoreA: event.score_a,
        scoreB: event.score_b,
        winner,
      });
    }
  }

  return derived;
}

function buildMatchState(
  match: DbMatchRow,
  rules: MatchRules,
  events: DbMatchEventRow[],
  gameScores: ReturnType<typeof mapDbGameScore>[]
): Partial<MatchState> {
  const mappedEvents = events.map(mapDbMatchEvent).reverse();
  const latest = events[0];
  const timeoutsUsedA = countTimeoutsUsed(events, "A");
  const timeoutsUsedB = countTimeoutsUsed(events, "B");
  const derivedGameScores = deriveGameScoresFromEvents(events, rules);
  const mergedGameScores =
    gameScores.length >= derivedGameScores.length ? gameScores : derivedGameScores;

  const isComplete =
    match.status === "completed" ||
    match.status === "verified" ||
    match.status === "pending" ||
    match.status === "disputed";

  const isAwaitingStart = match.status === "draft";

  let scoreA = latest?.score_a ?? 0;
  let scoreB = latest?.score_b ?? 0;
  let currentGame = latest?.game_number ?? mergedGameScores.length + 1;

  if (
    latest &&
    (latest.event_type === "point" || latest.event_type === "fault") &&
    isGameWonFromScores(
      latest.score_a,
      latest.score_b,
      rules.targetPoints,
      rules.winBy
    ) &&
    !isComplete
  ) {
    currentGame = latest.game_number + 1;
    scoreA = 0;
    scoreB = 0;
  }

  return {
    matchId: match.id,
    teamAName: match.team_a_name,
    teamBName: match.team_b_name,
    matchType: match.match_type,
    scoringType: rules.scoringType,
    targetPoints: rules.targetPoints,
    bestOf: rules.bestOf,
    winBy: rules.winBy as 1 | 2,
    maxTimeouts: rules.maxTimeouts,
    timeoutDuration: rules.timeoutDuration,
    scoreA,
    scoreB,
    currentGame,
    gameScores: mergedGameScores,
    timeoutsA: Math.max(0, rules.maxTimeouts - timeoutsUsedA),
    timeoutsB: Math.max(0, rules.maxTimeouts - timeoutsUsedB),
    events: mappedEvents,
    isMatchComplete: isComplete,
    matchWinner: match.winner,
    isAwaitingStart,
  };
}

// =============================================================================
// 1. CREATE — called when the user finishes /match-setup and enters /live-scoring
// =============================================================================
export interface CreateMatchInput {
  createdBy: string;
  setup: MatchSetupState;
  teamAPlayerIds?: string[];
  teamBPlayerIds?: string[];
  /** Full player rows including guests added by phone. */
  matchPlayers?: import("@/types/match").MatchPlayer[];
  tournamentId?: string;
  /** Tournament fixtures skip the invite gate and go live immediately. */
  autoStart?: boolean;
}

type SetupMatchPlayer = import("@/types/match").MatchPlayer;

function registeredIdsForTeam(
  players: SetupMatchPlayer[],
  team: "A" | "B"
): string[] {
  return [
    ...new Set(
      players
        .filter((p) => p.team === team && !p.isGuest && isUuid(p.playerId))
        .map((p) => p.playerId)
    ),
  ];
}

/** Build registered rosters from setup rows; place the creator on the open team. */
function resolveRegisteredTeamIds(input: CreateMatchInput): {
  teamAPlayerIds: string[];
  teamBPlayerIds: string[];
} {
  const {
    createdBy,
    teamAPlayerIds: inputA = [],
    teamBPlayerIds: inputB = [],
    matchPlayers = [],
  } = input;

  let teamAPlayerIds =
    matchPlayers.length > 0
      ? registeredIdsForTeam(matchPlayers, "A")
      : [...new Set(inputA.filter(isUuid))];
  let teamBPlayerIds =
    matchPlayers.length > 0
      ? registeredIdsForTeam(matchPlayers, "B")
      : [...new Set(inputB.filter(isUuid))];

  const linkedIds = new Set([...teamAPlayerIds, ...teamBPlayerIds]);
  if (!linkedIds.has(createdBy)) {
    if (teamAPlayerIds.length > 0 && teamBPlayerIds.length === 0) {
      teamBPlayerIds = [...teamBPlayerIds, createdBy];
    } else if (teamBPlayerIds.length > 0 && teamAPlayerIds.length === 0) {
      teamAPlayerIds = [...teamAPlayerIds, createdBy];
    } else {
      teamAPlayerIds = [...teamAPlayerIds, createdBy];
    }
  }

  return {
    teamAPlayerIds: [...new Set(teamAPlayerIds)],
    teamBPlayerIds: [...new Set(teamBPlayerIds)],
  };
}

/**
 * Creates matches + match_rules + match_players and returns the new match id.
 * In mock mode returns a synthetic id so the scorer can run unpersisted.
 */
export async function createMatch(
  input: CreateMatchInput
): Promise<DbResult<{ id: string; mock: boolean; status?: string }>> {
  const {
    createdBy,
    setup,
    matchPlayers = [],
    tournamentId,
    autoStart = false,
  } = input;

  const { teamAPlayerIds, teamBPlayerIds } = resolveRegisteredTeamIds(input);

  const guestSlots = matchPlayers.filter((p) => p.isGuest && p.guestPhone);

  if (!isSupabaseConfigured()) {
    const id = `mock-${Date.now()}`;
    return ok({ id, mock: true });
  }

  try {
    const supabase = createClient();
    const localRules = parseLocalRules(setup.localRules);

    const allRegisteredIds = [...new Set([...teamAPlayerIds, ...teamBPlayerIds])];
    const needsInviteAccept = !autoStart && allRegisteredIds.length > 0;
    // Public matches are visible in the live feed immediately; private matches
    // stay draft until all opponents accept their invites.
    const initialStatus =
      needsInviteAccept && !setup.isPublic ? "draft" : "live";
    const startedAt =
      initialStatus === "live" ? new Date().toISOString() : null;

    const insertRow = {
      created_by: createdBy,
      match_type: setup.matchType,
      match_category: setup.matchCategory,
      team_a_name: setup.teamAName,
      team_b_name: setup.teamBName,
      venue: setup.venue ?? null,
      court_number: setup.courtNumber ?? null,
      city: setup.city ?? null,
      scoring_type: setup.scoringType,
      target_points: setup.targetPoints,
      best_of: setup.bestOf,
      win_by: setup.winBy,
      max_timeouts: setup.maxTimeouts,
      timeout_duration: setup.timeoutDuration,
      is_public: setup.isPublic ?? true,
      has_referee: setup.hasReferee,
      local_rules: localRules,
      tournament_id: tournamentId ?? null,
      status: initialStatus,
      started_at: startedAt,
      winner: null,
    };

    const { data: match, error: matchErr } = await supabase
      .from("matches")
      .insert(insertRow)
      .select("id")
      .single();

    if (matchErr) throw matchErr;
    const matchId = (match as { id: string }).id;

    const { error: rulesErr } = await supabase.from("match_rules").insert({
      match_id: matchId,
      scoring_type: setup.scoringType,
      target_points: setup.targetPoints,
      win_by: setup.winBy,
      best_of: setup.bestOf,
      doubles: setup.matchType !== "singles",
      max_timeouts: setup.maxTimeouts,
      timeout_duration: setup.timeoutDuration,
      local_rules: localRules,
    });
    if (rulesErr) throw rulesErr;

    const inviteStatusFor = (playerId: string) => {
      if (autoStart) return "accepted";
      if (playerId === createdBy) return "accepted";
      return "pending";
    };

    const playerRows = [
      ...teamAPlayerIds.map((pid, i) => ({
        match_id: matchId,
        player_id: pid,
        team: "A" as const,
        server_number: i + 1,
        invite_status: inviteStatusFor(pid),
        invited_by: createdBy,
      })),
      ...teamBPlayerIds.map((pid, i) => ({
        match_id: matchId,
        player_id: pid,
        team: "B" as const,
        server_number: i + 1,
        invite_status: inviteStatusFor(pid),
        invited_by: createdBy,
      })),
    ];
    if (playerRows.length > 0) {
      const { error: playersErr } = await supabase
        .from("match_players")
        .insert(playerRows);
      if (playersErr) throw playersErr;
    }

    if (guestSlots.length > 0) {
      const { createGuestPlayer } = await import("@/lib/db/playerLookup");
      const guestRows: {
        match_id: string;
        guest_id: string;
        team: "A" | "B";
        server_number: number;
        invite_status: string;
        invited_by: string;
      }[] = [];

      for (const slot of guestSlots) {
        const guestResult = await createGuestPlayer({
          fullName: slot.fullName,
          phone: slot.guestPhone!,
          createdBy,
        });
        if (guestResult.error || !guestResult.data) {
          throw new Error(guestResult.error ?? "Failed to add guest player");
        }
        const teamPlayers = matchPlayers.filter((p) => p.team === slot.team);
        const slotIndex = teamPlayers.findIndex((p) => p.id === slot.id);
        guestRows.push({
          match_id: matchId,
          guest_id: guestResult.data.guestId,
          team: slot.team,
          server_number: slotIndex >= 0 ? slotIndex + 1 : 1,
          invite_status: autoStart ? "accepted" : "pending",
          invited_by: createdBy,
        });
      }

      if (guestRows.length > 0) {
        const { error: guestErr } = await supabase
          .from("match_players")
          .insert(guestRows);
        if (guestErr) throw guestErr;
      }
    }

    if (needsInviteAccept) {
      const { sendNotification } = await import(
        "@/lib/notifications/sendNotification"
      );
      const matchLabel = `${setup.teamAName} vs ${setup.teamBName}`;
      const opponentIds = allRegisteredIds.filter((id) => id !== createdBy);

      await sendNotification({
        userId: createdBy,
        icon: "match_invite",
        text:
          opponentIds.length > 0
            ? `Match created: ${matchLabel}. Waiting for your opponent to accept.`
            : `Confirm your match: ${matchLabel}`,
        link: `/live-scoring/${matchId}`,
      });
    }

    return ok({ id: matchId, mock: false, status: initialStatus });
  } catch (e) {
    return fail(e);
  }
}

// =============================================================================
// 2. STREAM EVENTS — one insert per scoring action.
//    Call from matchStore AFTER the in-memory state updates so score_a/score_b
//    reflect the post-action score.
// =============================================================================
export type PersistableEventType = "point" | "fault" | "side_out" | "timeout";

export interface LogEventInput {
  matchId: string;
  eventType: PersistableEventType;
  team: Team | null;
  scoreA: number;
  scoreB: number;
  gameNumber: number;
  faultType?: FaultType;
  description?: string;
}

export async function logMatchEvent(
  input: LogEventInput
): Promise<DbResult<typeof MOCK_OK | true>> {
  if (!isSupabaseConfigured() || isMockMatchId(input.matchId)) {
    return ok(MOCK_OK);
  }

  try {
    const supabase = createClient();
    const row: MatchEventRow = {
      match_id: input.matchId,
      event_type: input.eventType,
      team: input.team,
      description:
        input.description ??
        defaultEventDescription(input.eventType, input.team, input.faultType),
      score_a: input.scoreA,
      score_b: input.scoreB,
      game_number: input.gameNumber,
    };

    const { error } = await supabase.from("match_events").insert(row);
    if (error) throw error;
    return ok(true);
  } catch (e) {
    return fail(e);
  }
}

function defaultEventDescription(
  type: LogEventInput["eventType"],
  team: Team | null,
  faultType?: FaultType
): string {
  switch (type) {
    case "point":
      return `Point — Team ${team}`;
    case "fault":
      return `${faultType ?? "Fault"} — Team ${team}`;
    case "side_out":
      return `Side-out — Team ${team} serves`;
    case "timeout":
      return `Timeout — Team ${team}`;
    default:
      return "Event";
  }
}

// =============================================================================
// 3. END MATCH — write per-game finals, set winner + completed_at, status->pending
// =============================================================================
export interface EndMatchInput {
  matchId: string;
  gameScores: GameScore[];
  matchWinner: Team | null;
}

export async function endMatch(
  input: EndMatchInput
): Promise<DbResult<{ status: string; mock: boolean; timingMessage?: string | null }>> {
  if (!isSupabaseConfigured() || isMockMatchId(input.matchId)) {
    return ok({ status: "verified", mock: true });
  }

  if (!isUuid(input.matchId)) {
    return fail("This match was not saved to the server. Start a new match from Match Setup.");
  }

  try {
    const response = await authFetch("/api/matches/end", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    const payload = (await response.json().catch(() => null)) as
      | {
          status?: string;
          verified?: boolean;
          error?: string;
          timingMessage?: string | null;
        }
      | null;

    if (!response.ok) {
      return fail(payload?.error ?? "Could not save match");
    }

    return ok({
      status: payload?.status ?? "verified",
      mock: false,
      timingMessage: payload?.timingMessage ?? null,
    });
  } catch (e) {
    return fail(e);
  }
}

// =============================================================================
// 4. VERIFICATION — opponent confirms or disputes (used by /match/[id]).
//    Only 'verified' matches should be counted by stats/rankings queries.
// =============================================================================
export async function confirmMatchResult(
  matchId: string
): Promise<DbResult<true>> {
  if (!isSupabaseConfigured() || isMockMatchId(matchId)) return ok(true);

  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("matches")
      .update({ status: "verified" })
      .eq("id", matchId)
      .eq("status", "pending");
    if (error) throw error;

    const { syncFixtureFromMatch } = await import("@/lib/db/fixtures");
    await syncFixtureFromMatch(matchId);

    const { updateRatingsForMatch } = await import("@/lib/db/profiles");
    await updateRatingsForMatch(matchId);

    const { data: players } = await supabase
      .from("match_players")
      .select("player_id")
      .eq("match_id", matchId);

    const { data: matchRow } = await supabase
      .from("matches")
      .select("team_a_name, team_b_name, winner")
      .eq("id", matchId)
      .maybeSingle();

    if (players && matchRow) {
      const { sendNotifications } = await import(
        "@/lib/notifications/sendNotification"
      );
      const winnerLabel =
        matchRow.winner === "A"
          ? matchRow.team_a_name
          : matchRow.winner === "B"
            ? matchRow.team_b_name
            : "Tie";
      await sendNotifications(
        players.map((row) => row.player_id as string),
        {
          icon: "result_confirmation",
          text: `Match result verified: ${matchRow.team_a_name} vs ${matchRow.team_b_name}. Winner: ${winnerLabel}`,
          link: `/match/${matchId}`,
        }
      );
    }

    return ok(true);
  } catch (e) {
    return fail(e);
  }
}

export async function disputeMatchResult(
  matchId: string,
  raisedBy: string,
  reason: string
): Promise<DbResult<true>> {
  if (!isSupabaseConfigured() || isMockMatchId(matchId)) return ok(true);

  try {
    const supabase = createClient();
    const { error: dErr } = await supabase.from("disputes").insert({
      match_id: matchId,
      raised_by: raisedBy,
      reason,
      status: "open",
    });
    if (dErr) throw dErr;

    const { error: mErr } = await supabase
      .from("matches")
      .update({ status: "disputed" })
      .eq("id", matchId);
    if (mErr) throw mErr;

    return ok(true);
  } catch (e) {
    return fail(e);
  }
}

// =============================================================================
// 5. READS — for /match/[id] and /spectate/[id]
// =============================================================================
export interface FullMatch {
  match: MatchRow;
  events: MatchEvent[];
  gameScores: GameScore[];
}

function localRulesNotes(localRules: Record<string, unknown> | undefined): string {
  const notes = localRules?.notes;
  return typeof notes === "string" ? notes : "";
}

function statsFromEvents(events: MatchEvent[]): MatchStats {
  const faultsA = { ...DEFAULT_FAULTS };
  const faultsB = { ...DEFAULT_FAULTS };
  let pointsWonA = 0;
  let pointsWonB = 0;
  let timeoutsUsedA = 0;
  let timeoutsUsedB = 0;

  for (const event of events) {
    if (event.eventType === "point") {
      if (event.team === "A") pointsWonA += 1;
      if (event.team === "B") pointsWonB += 1;
    }

    if (event.eventType === "fault") {
      const desc = event.description?.toLowerCase() ?? "";

      const faultType =
        desc.includes("kitchen")
          ? "kitchen"
          : desc.includes("service")
            ? "service"
            : desc.includes("double bounce")
              ? "double_bounce"
              : desc.includes("out of bounds")
                ? "out_of_bounds"
                : null;

      if (faultType && event.team === "A") faultsA[faultType] += 1;
      if (faultType && event.team === "B") faultsB[faultType] += 1;
    }

    if (event.eventType === "timeout") {
      if (event.team === "A") timeoutsUsedA += 1;
      if (event.team === "B") timeoutsUsedB += 1;
    }
  }

  return {
    pointsWonA,
    pointsWonB,
    faultsA,
    faultsB,
    timeoutsUsedA,
    timeoutsUsedB,
    durationMinutes: 0,
  };
}

/** Map a DB row bundle to the UI `MatchDetail` shape. */
export function mapFullMatchToDetail(
  full: FullMatch,
  currentUserId?: string | null
): MatchDetail {
  const { match, events, gameScores } = full;

  return {
    id: match.id,
    teamAName: match.team_a_name,
    teamBName: match.team_b_name,
    matchType: match.match_type as MatchType,
    matchCategory: (match.match_category ?? "friendly") as MatchCategory,
    venue: match.venue ?? "",
    city: match.city ?? "",
    status: match.status as MatchStatus,
    winner: match.winner as Team | null,
    createdBy: match.created_by,
    createdAt: match.created_at,
    completedAt: match.completed_at,
    gameScores,
    players: [],
    events,
    stats: statsFromEvents(events),
    localRules: localRulesNotes(match.local_rules),
    isCurrentUserCreator: Boolean(
      currentUserId && currentUserId === match.created_by
    ),
    isCurrentUserOpponent: false,
    bestPerformer: "",
    hasComeback: false,
  };
}

export async function getMatchById(
  matchId: string
): Promise<DbResult<FullMatch | null>> {
  if (!isSupabaseConfigured() || isMockMatchId(matchId)) {
    return ok(null);
  }

  try {
    const supabase = createClient();

    const { data: match, error: mErr } = await supabase
      .from("matches")
      .select("*")
      .eq("id", matchId)
      .single();
    if (mErr) throw mErr;

    const { data: events, error: eErr } = await supabase
      .from("match_events")
      .select("*")
      .eq("match_id", matchId)
      .order("created_at", { ascending: false });
    if (eErr) throw eErr;

    const { data: games, error: gErr } = await supabase
      .from("match_game_scores")
      .select("*")
      .eq("match_id", matchId)
      .order("game_number", { ascending: true });
    if (gErr) throw gErr;

    return ok({
      match: match as MatchRow,
      events: ((events ?? []) as DbMatchEventRow[]).map(mapDbMatchEvent),
      gameScores: ((games ?? []) as DbGameScoreRow[]).map(mapDbGameScore),
    });
  } catch (e) {
    return fail(e);
  }
}

/** Fetch match metadata, rules, events, and game scores from Supabase. */
export async function fetchMatchState(
  matchId: string
): Promise<LoadedMatchState | null> {
  if (!shouldPersist(matchId)) return null;

  const supabase = createClient();

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("id, match_type, team_a_name, team_b_name, status, winner, started_at")
    .eq("id", matchId)
    .maybeSingle();

  if (matchError || !match) return null;

  const { data: rulesRow, error: rulesError } = await supabase
    .from("match_rules")
    .select("*")
    .eq("match_id", matchId)
    .maybeSingle();

  if (rulesError) return null;

  const rules = rulesRow
    ? mapDbMatchRules(rulesRow as DbMatchRules)
    : mapDbMatchRules({
        match_id: matchId,
        scoring_type: "side-out",
        target_points: 11,
        win_by: 2,
        best_of: 3,
        doubles: match.match_type !== "singles",
        max_timeouts: 2,
        timeout_duration: 60,
        local_rules: {},
      });

  const [eventsResult, gameScoresResult] = await Promise.all([
    supabase
      .from("match_events")
      .select(
        "id, match_id, event_type, team, description, score_a, score_b, game_number, created_at"
      )
      .eq("match_id", matchId)
      .order("created_at", { ascending: false }),
    supabase
      .from("match_game_scores")
      .select("game_number, score_a, score_b, winner")
      .eq("match_id", matchId)
      .order("game_number", { ascending: true }),
  ]);

  if (eventsResult.error || gameScoresResult.error) return null;

  const events = (eventsResult.data ?? []) as DbMatchEventRow[];
  const gameScores = ((gameScoresResult.data ?? []) as DbGameScoreRow[]).map(
    mapDbGameScore
  );

  return {
    match: match as DbMatchRow,
    rules,
    events: events.map(mapDbMatchEvent).reverse(),
    gameScores,
  };
}

/** Build a `MatchState` partial from Supabase rows (for zustand `resetMatch`). */
export async function fetchMatchStateOverrides(
  matchId: string
): Promise<Partial<MatchState> | null> {
  const loaded = await fetchMatchState(matchId);
  if (!loaded) return null;

  const eventsDesc = [...loaded.events]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .map((e) => ({
      id: e.id,
      match_id: e.matchId,
      event_type: e.eventType,
      team: e.team,
      description: e.description,
      score_a: e.scoreA,
      score_b: e.scoreB,
      game_number: e.gameNumber,
      created_at: e.createdAt,
    })) as DbMatchEventRow[];

  return {
    ...buildMatchState(
      loaded.match,
      loaded.rules,
      eventsDesc,
      loaded.gameScores
    ),
    faultsA: { ...DEFAULT_FAULTS },
    faultsB: { ...DEFAULT_FAULTS },
  };
}

export async function fetchMatchStatus(
  matchId: string
): Promise<DbResult<{ status: string; startedAt: string | null } | null>> {
  if (!shouldPersist(matchId)) return ok(null);

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("matches")
      .select("status, started_at")
      .eq("id", matchId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return ok(null);
    return ok({
      status: data.status as string,
      startedAt: data.started_at as string | null,
    });
  } catch (e) {
    return fail(e);
  }
}

export async function upsertMatchRules(
  matchId: string,
  rules: Partial<MatchRules> & { scoringType: MatchRules["scoringType"] }
): Promise<MatchRules | null> {
  if (!shouldPersist(matchId)) return null;

  const supabase = createClient();
  const row = {
    match_id: matchId,
    scoring_type: rules.scoringType,
    target_points: rules.targetPoints ?? 11,
    win_by: rules.winBy ?? 2,
    best_of: rules.bestOf ?? 3,
    doubles: rules.doubles ?? false,
    max_timeouts: rules.maxTimeouts ?? 2,
    timeout_duration: rules.timeoutDuration ?? 60,
    local_rules: rules.localRules ?? {},
  };

  const { data, error } = await supabase
    .from("match_rules")
    .upsert(row, { onConflict: "match_id" })
    .select("*")
    .single();

  if (error || !data) return null;
  return mapDbMatchRules(data as DbMatchRules);
}

// =============================================================================
// 6. LIVE MATCHES — list for /live-scoring browse view
// =============================================================================
export interface LiveMatchSummary {
  id: string;
  teamAName: string;
  teamBName: string;
  scoreA: number;
  scoreB: number;
  gameNumber: number;
  venue: string;
  city: string;
  courtNumber: string;
  matchType: string;
  createdAt: string;
}

export interface FetchLiveMatchesResult {
  data: LiveMatchSummary[];
  source: "supabase" | "mock";
  error: string | null;
}

export async function fetchLiveMatches(): Promise<FetchLiveMatchesResult> {
  if (!isSupabaseConfigured()) {
    return {
      data: [],
      source: "supabase",
      error: "Supabase is not configured",
    };
  }

  try {
    const supabase = createClient();

    const { data: rows, error } = await supabase
      .from("matches")
      .select(
        "id, team_a_name, team_b_name, venue, city, court_number, match_type, created_at"
      )
      .eq("status", "live")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    const matchRows = rows ?? [];
    const matchIds = matchRows.map((row) => row.id as string);
    const latestScores = new Map<
      string,
      { scoreA: number; scoreB: number; gameNumber: number }
    >();

    if (matchIds.length > 0) {
      const { data: eventRows } = await supabase
        .from("match_events")
        .select("match_id, score_a, score_b, game_number, created_at")
        .in("match_id", matchIds)
        .order("created_at", { ascending: false });

      for (const event of eventRows ?? []) {
        const matchId = event.match_id as string;
        if (latestScores.has(matchId)) continue;
        latestScores.set(matchId, {
          scoreA: event.score_a ?? 0,
          scoreB: event.score_b ?? 0,
          gameNumber: event.game_number ?? 1,
        });
      }
    }

    const summaries: LiveMatchSummary[] = matchRows.map((row) => {
      const matchId = row.id as string;
      const latestEvent = latestScores.get(matchId);

      return {
        id: matchId,
        teamAName: row.team_a_name as string,
        teamBName: row.team_b_name as string,
        scoreA: latestEvent?.scoreA ?? 0,
        scoreB: latestEvent?.scoreB ?? 0,
        gameNumber: latestEvent?.gameNumber ?? 1,
        venue: (row.venue as string) ?? "",
        city: (row.city as string) ?? "",
        courtNumber: (row.court_number as string) ?? "",
        matchType: row.match_type as string,
        createdAt: row.created_at as string,
      };
    });

    if (summaries.length === 0) {
      return {
        data: [],
        source: "supabase",
        error: null,
      };
    }

    return { data: summaries, source: "supabase", error: null };
  } catch (e) {
    return {
      data: [],
      source: "supabase",
      error: e instanceof Error ? e.message : "Could not load live matches",
    };
  }
}
