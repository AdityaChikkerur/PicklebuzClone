import { createClient } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/auth/isSupabaseConfigured";
import { isUuid } from "@/lib/db/config";
import { createMatch } from "@/lib/db/matches";
import type { SkillLevel } from "@/types/player";
import type {
  BracketMatch,
  CategoryType,
  FixtureStatus,
  PointsTableRow,
  TournamentDetail,
  TournamentFixture,
  TournamentFormat,
  TournamentRegistration,
} from "@/types/tournament";

export type DbResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

const ok = <T>(data: T): DbResult<T> => ({ data, error: null });
const fail = (error: unknown): DbResult<never> => ({
  data: null,
  error: error instanceof Error ? error.message : String(error),
});

interface DbFixtureRow {
  id: string;
  tournament_id: string;
  category_id: string | null;
  round: string | null;
  match_id: string | null;
  team_a: string | null;
  team_b: string | null;
  created_at: string;
}

interface DbPointsRow {
  id: string;
  tournament_id: string;
  category_id: string | null;
  team_id: string;
  played: number;
  wins: number;
  losses: number;
  points_for: number;
  points_against: number;
  point_difference: number;
  ranking: number | null;
}

interface DbMatchSnippet {
  id: string;
  status: string;
  winner: string | null;
  team_a_name: string;
  team_b_name: string;
}

interface DbGameScoreRow {
  game_number: number;
  score_a: number;
  score_b: number;
  winner: string | null;
}

interface CompetitionTeam {
  key: string;
  name: string;
  playerIds: string[];
  seed?: number;
}

function teamFromRegistration(reg: TournamentRegistration): CompetitionTeam {
  const playerIds = reg.partnerId
    ? [reg.playerId, reg.partnerId]
    : [reg.playerId];
  const key = reg.partnerId
    ? [reg.playerId, reg.partnerId].sort().join(":")
    : reg.playerId;
  const name = reg.partnerName
    ? `${reg.playerName} & ${reg.partnerName}`
    : reg.playerName;

  return {
    key,
    name,
    playerIds,
    seed: reg.seed ?? undefined,
  };
}

function matchStatusToFixtureStatus(matchStatus: string): FixtureStatus {
  if (matchStatus === "live") return "live";
  if (matchStatus === "verified" || matchStatus === "completed") {
    return "completed";
  }
  if (matchStatus === "pending" || matchStatus === "disputed") return "live";
  return "scheduled";
}

function formatScoreString(gameScores: DbGameScoreRow[]): string {
  return gameScores
    .sort((a, b) => a.game_number - b.game_number)
    .map((g) => `${g.score_a}-${g.score_b}`)
    .join(", ");
}

function totalPoints(gameScores: DbGameScoreRow[], side: "A" | "B"): number {
  return gameScores.reduce(
    (sum, g) => sum + (side === "A" ? g.score_a : g.score_b),
    0
  );
}

function winnerSide(
  match: DbMatchSnippet,
  gameScores: DbGameScoreRow[]
): "A" | "B" | null {
  if (match.winner === "A" || match.winner === "B") return match.winner;

  let winsA = 0;
  let winsB = 0;
  for (const g of gameScores) {
    if (g.winner === "A") winsA += 1;
    if (g.winner === "B") winsB += 1;
  }
  if (winsA > winsB) return "A";
  if (winsB > winsA) return "B";
  return null;
}

async function loadMatchContext(matchId: string): Promise<{
  match: DbMatchSnippet;
  gameScores: DbGameScoreRow[];
} | null> {
  const supabase = createClient();
  const { data: match, error } = await supabase
    .from("matches")
    .select("id, status, winner, team_a_name, team_b_name")
    .eq("id", matchId)
    .maybeSingle();

  if (error || !match) return null;

  const { data: gameScores } = await supabase
    .from("match_game_scores")
    .select("game_number, score_a, score_b, winner")
    .eq("match_id", matchId)
    .order("game_number", { ascending: true });

  return {
    match: match as DbMatchSnippet,
    gameScores: (gameScores ?? []) as DbGameScoreRow[],
  };
}

function mapFixtureRow(
  row: DbFixtureRow,
  match?: DbMatchSnippet | null,
  gameScores: DbGameScoreRow[] = []
): TournamentFixture {
  const status: FixtureStatus = match
    ? matchStatusToFixtureStatus(match.status)
    : "scheduled";

  const score =
    gameScores.length > 0
      ? formatScoreString(gameScores)
      : undefined;

  return {
    id: row.id,
    tournamentId: row.tournament_id,
    categoryId: row.category_id ?? "",
    round: row.round ?? "RR",
    matchId: row.match_id ?? undefined,
    teamA: row.team_a ?? "TBD",
    teamB: row.team_b ?? "TBD",
    score,
    status,
    isUpset: false,
  };
}

function mapPointsRow(row: DbPointsRow): PointsTableRow {
  return {
    id: row.id,
    tournamentId: row.tournament_id,
    categoryId: row.category_id ?? "",
    teamId: row.team_id,
    teamName: row.team_id,
    played: row.played,
    wins: row.wins,
    losses: row.losses,
    pointsFor: row.points_for,
    pointsAgainst: row.points_against,
    pointDifference: row.point_difference,
    ranking: row.ranking ?? 0,
  };
}

function fixturesToBracket(
  fixtures: TournamentFixture[],
  winnerByFixtureId: Map<string, "A" | "B">
): BracketMatch[] {
  const knockoutRounds = new Set(["R64", "R32", "R16", "QF", "SF", "Final"]);
  const bracketFixtures = fixtures.filter((f) => knockoutRounds.has(f.round));

  const byRound = new Map<string, TournamentFixture[]>();
  for (const f of bracketFixtures) {
    const list = byRound.get(f.round) ?? [];
    list.push(f);
    byRound.set(f.round, list);
  }

  const matches: BracketMatch[] = [];
  for (const [round, roundFixtures] of byRound) {
    roundFixtures.forEach((f, position) => {
      const winnerSide = winnerByFixtureId.get(f.id);
      matches.push({
        id: f.id,
        round,
        position,
        teamA: f.teamA === "TBD" ? null : f.teamA,
        teamB: f.teamB === "TBD" || f.teamB === "BYE" ? null : f.teamB,
        score: f.score,
        winner: winnerSide,
        matchId: f.matchId,
        status: f.status,
        isUpset: f.isUpset,
      });
    });
  }

  return matches;
}

/** Load fixtures with linked match scores/status. */
export async function fetchTournamentFixtures(
  tournamentId: string,
  categoryId?: string
): Promise<TournamentFixture[]> {
  if (!isSupabaseConfigured() || !isUuid(tournamentId)) return [];

  const supabase = createClient();
  let query = supabase
    .from("fixtures")
    .select("id, tournament_id, category_id, round, match_id, team_a, team_b, created_at")
    .eq("tournament_id", tournamentId)
    .order("created_at", { ascending: true });

  if (categoryId && categoryId !== "all") {
    query = query.eq("category_id", categoryId);
  }

  const { data, error } = await query;
  if (error || !data?.length) return [];

  const rows = data as DbFixtureRow[];
  const matchIds = rows
    .map((r) => r.match_id)
    .filter((id): id is string => Boolean(id));

  const matchMap = new Map<string, DbMatchSnippet>();
  const scoresMap = new Map<string, DbGameScoreRow[]>();

  if (matchIds.length > 0) {
    const { data: matches } = await supabase
      .from("matches")
      .select("id, status, winner, team_a_name, team_b_name")
      .in("id", matchIds);

    for (const m of matches ?? []) {
      matchMap.set(m.id as string, m as DbMatchSnippet);
    }

    const { data: scores } = await supabase
      .from("match_game_scores")
      .select("match_id, game_number, score_a, score_b, winner")
      .in("match_id", matchIds)
      .order("game_number", { ascending: true });

    for (const s of scores ?? []) {
      const mid = s.match_id as string;
      const list = scoresMap.get(mid) ?? [];
      list.push(s as DbGameScoreRow);
      scoresMap.set(mid, list);
    }
  }

  return rows.map((row) => {
    const match = row.match_id ? matchMap.get(row.match_id) : null;
    const gameScores = row.match_id ? (scoresMap.get(row.match_id) ?? []) : [];
    const fixture = mapFixtureRow(row, match, gameScores);

    if (match && fixture.status === "completed") {
      const side = winnerSide(match, gameScores);
      if (side === "B") fixture.isUpset = true;
    }

    return fixture;
  });
}

async function winnerSideByFixtureId(
  rows: DbFixtureRow[],
  matchMap: Map<string, DbMatchSnippet>,
  scoresMap: Map<string, DbGameScoreRow[]>
): Promise<Map<string, "A" | "B">> {
  const map = new Map<string, "A" | "B">();
  for (const row of rows) {
    if (!row.match_id) continue;
    const match = matchMap.get(row.match_id);
    const gameScores = scoresMap.get(row.match_id) ?? [];
    if (!match) continue;
    const side = winnerSide(match, gameScores);
    if (side) map.set(row.id, side);
  }
  return map;
}

export async function fetchTournamentPointsTable(
  tournamentId: string,
  categoryId?: string
): Promise<PointsTableRow[]> {
  if (!isSupabaseConfigured() || !isUuid(tournamentId)) return [];

  const supabase = createClient();
  let query = supabase
    .from("points_table")
    .select(
      "id, tournament_id, category_id, team_id, played, wins, losses, points_for, points_against, point_difference, ranking"
    )
    .eq("tournament_id", tournamentId)
    .order("ranking", { ascending: true });

  if (categoryId && categoryId !== "all") {
    query = query.eq("category_id", categoryId);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return (data as DbPointsRow[]).map(mapPointsRow);
}

export async function fetchTournamentBracket(
  tournamentId: string
): Promise<BracketMatch[]> {
  if (!isSupabaseConfigured() || !isUuid(tournamentId)) return [];

  const supabase = createClient();
  const { data } = await supabase
    .from("fixtures")
    .select("id, tournament_id, category_id, round, match_id, team_a, team_b, created_at")
    .eq("tournament_id", tournamentId)
    .order("created_at", { ascending: true });

  if (!data?.length) return [];

  const rows = data as DbFixtureRow[];
  const fixtures = await fetchTournamentFixtures(tournamentId);

  const matchIds = rows
    .map((r) => r.match_id)
    .filter((id): id is string => Boolean(id));

  const matchMap = new Map<string, DbMatchSnippet>();
  const scoresMap = new Map<string, DbGameScoreRow[]>();

  if (matchIds.length > 0) {
    const { data: matches } = await supabase
      .from("matches")
      .select("id, status, winner, team_a_name, team_b_name")
      .in("id", matchIds);

    for (const m of matches ?? []) {
      matchMap.set(m.id as string, m as DbMatchSnippet);
    }

    const { data: scores } = await supabase
      .from("match_game_scores")
      .select("match_id, game_number, score_a, score_b, winner")
      .in("match_id", matchIds);

    for (const s of scores ?? []) {
      const mid = s.match_id as string;
      const list = scoresMap.get(mid) ?? [];
      list.push(s as DbGameScoreRow);
      scoresMap.set(mid, list);
    }
  }

  const winnerMap = await winnerSideByFixtureId(rows, matchMap, scoresMap);
  return fixturesToBracket(fixtures, winnerMap);
}

function roundRobinPairings(teams: CompetitionTeam[]): [CompetitionTeam, CompetitionTeam][] {
  const pairs: [CompetitionTeam, CompetitionTeam][] = [];
  for (let i = 0; i < teams.length; i += 1) {
    for (let j = i + 1; j < teams.length; j += 1) {
      pairs.push([teams[i], teams[j]]);
    }
  }
  return pairs;
}

function knockoutRoundLabel(teamCount: number): string {
  if (teamCount <= 2) return "Final";
  if (teamCount <= 4) return "SF";
  if (teamCount <= 8) return "QF";
  if (teamCount <= 16) return "R16";
  if (teamCount <= 32) return "R32";
  return "R64";
}

async function recomputeRankings(
  tournamentId: string,
  categoryId: string
): Promise<void> {
  const supabase = createClient();
  const { data } = await supabase
    .from("points_table")
    .select("id, wins, point_difference")
    .eq("tournament_id", tournamentId)
    .eq("category_id", categoryId);

  if (!data?.length) return;

  const sorted = [...data].sort((a, b) => {
    const wDiff = (b.wins as number) - (a.wins as number);
    if (wDiff !== 0) return wDiff;
    return (b.point_difference as number) - (a.point_difference as number);
  });

  await Promise.all(
    sorted.map((row, index) =>
      supabase
        .from("points_table")
        .update({ ranking: index + 1 })
        .eq("id", row.id as string)
    )
  );
}

async function updatePointsForResult(input: {
  tournamentId: string;
  categoryId: string;
  teamAKey: string;
  teamBKey: string;
  pointsA: number;
  pointsB: number;
  winnerKey: string;
}): Promise<void> {
  const supabase = createClient();

  for (const [teamKey, pf, pa, isWin] of [
    [input.teamAKey, input.pointsA, input.pointsB, input.winnerKey === input.teamAKey],
    [input.teamBKey, input.pointsB, input.pointsA, input.winnerKey === input.teamBKey],
  ] as const) {
    const { data: row } = await supabase
      .from("points_table")
      .select("played, wins, losses, points_for, points_against")
      .eq("tournament_id", input.tournamentId)
      .eq("category_id", input.categoryId)
      .eq("team_id", teamKey)
      .maybeSingle();

    if (!row) continue;

    await supabase
      .from("points_table")
      .update({
        played: (row.played as number) + 1,
        wins: (row.wins as number) + (isWin ? 1 : 0),
        losses: (row.losses as number) + (isWin ? 0 : 1),
        points_for: (row.points_for as number) + pf,
        points_against: (row.points_against as number) + pa,
      })
      .eq("tournament_id", input.tournamentId)
      .eq("category_id", input.categoryId)
      .eq("team_id", teamKey);
  }

  await recomputeRankings(input.tournamentId, input.categoryId);
}

async function propagateKnockoutWinner(
  fixture: DbFixtureRow,
  winnerName: string
): Promise<void> {
  const round = fixture.round ?? "";
  if (round === "RR" || !round) return;

  const supabase = createClient();
  const { data: sameRound } = await supabase
    .from("fixtures")
    .select("id, round, created_at")
    .eq("tournament_id", fixture.tournament_id)
    .eq("category_id", fixture.category_id)
    .eq("round", round)
    .order("created_at", { ascending: true });

  const roundFixtures = sameRound ?? [];
  const index = roundFixtures.findIndex((f) => f.id === fixture.id);
  if (index < 0) return;

  const nextRoundMap: Record<string, string> = {
    R64: "R32",
    R32: "R16",
    R16: "QF",
    QF: "SF",
    SF: "Final",
  };
  const nextRound = nextRoundMap[round];
  if (!nextRound) return;

  const { data: nextRoundFixtures } = await supabase
    .from("fixtures")
    .select("id, team_a, team_b, created_at")
    .eq("tournament_id", fixture.tournament_id)
    .eq("category_id", fixture.category_id)
    .eq("round", nextRound)
    .order("created_at", { ascending: true });

  const targetIndex = Math.floor(index / 2);
  const slot = index % 2 === 0 ? "team_a" : "team_b";
  const target = nextRoundFixtures?.[targetIndex];
  if (!target) return;

  const current = target[slot as "team_a" | "team_b"];
  if (current && current !== "TBD") return;

  await supabase
    .from("fixtures")
    .update({ [slot]: winnerName })
    .eq("id", target.id as string);
}

/** After a linked match is verified, refresh points table and bracket slots. */
export async function syncFixtureFromMatch(matchId: string): Promise<void> {
  if (!isSupabaseConfigured() || !isUuid(matchId)) return;

  const supabase = createClient();
  const { data: fixture } = await supabase
    .from("fixtures")
    .select("id, tournament_id, category_id, round, team_a, team_b, match_id")
    .eq("match_id", matchId)
    .maybeSingle();

  if (!fixture) return;

  const ctx = await loadMatchContext(matchId);
  if (!ctx || ctx.match.status !== "verified") return;

  const side = winnerSide(ctx.match, ctx.gameScores);
  if (!side) return;

  const winnerName = side === "A" ? fixture.team_a : fixture.team_b;
  const pointsA = totalPoints(ctx.gameScores, "A");
  const pointsB = totalPoints(ctx.gameScores, "B");

  if (fixture.round === "RR" && fixture.category_id) {
    await updatePointsForResult({
      tournamentId: fixture.tournament_id as string,
      categoryId: fixture.category_id as string,
      teamAKey: fixture.team_a as string,
      teamBKey: fixture.team_b as string,
      pointsA,
      pointsB,
      winnerKey: (side === "A" ? fixture.team_a : fixture.team_b) as string,
    });
  }

  if (winnerName) {
    await propagateKnockoutWinner(fixture as DbFixtureRow, winnerName);
  }
}

function categoryMatchType(categoryType: CategoryType): "singles" | "doubles" | "mixed" {
  return categoryType;
}

/** Generate round-robin fixtures + points table rows for a category. */
export async function generateRoundRobinFixtures(input: {
  tournament: TournamentDetail;
  categoryId: string;
  registrations: TournamentRegistration[];
  createdBy: string;
}): Promise<DbResult<{ count: number }>> {
  if (!isSupabaseConfigured()) return ok({ count: 0 });

  const { tournament, categoryId, registrations, createdBy } = input;
  if (!isUuid(tournament.id) || !isUuid(categoryId) || !isUuid(createdBy)) {
    return fail("Invalid tournament or category id");
  }

  const category = tournament.categories.find((c) => c.id === categoryId);
  if (!category) return fail("Category not found");

  const approved = registrations.filter(
    (r) => r.categoryId === categoryId && r.status === "approved"
  );
  if (approved.length < 2) {
    return fail("Need at least 2 approved registrations to generate fixtures");
  }

  try {
    const supabase = createClient();

    const { count: existing } = await supabase
      .from("fixtures")
      .select("id", { count: "exact", head: true })
      .eq("tournament_id", tournament.id)
      .eq("category_id", categoryId);

    if ((existing ?? 0) > 0) {
      return fail("Fixtures already generated for this category");
    }

    const teams = approved.map(teamFromRegistration);
    const pairs = roundRobinPairings(teams);

    const fixtureRows = pairs.map(([a, b]) => ({
      tournament_id: tournament.id,
      category_id: categoryId,
      round: "RR",
      team_a: a.name,
      team_b: b.name,
      match_id: null,
    }));

    const { error: fErr } = await supabase.from("fixtures").insert(fixtureRows);
    if (fErr) throw fErr;

    const pointsRows = teams.map((team) => ({
      tournament_id: tournament.id,
      category_id: categoryId,
      team_id: team.name,
      played: 0,
      wins: 0,
      losses: 0,
      points_for: 0,
      points_against: 0,
      ranking: teams.length,
    }));

    const { error: pErr } = await supabase.from("points_table").insert(pointsRows);
    if (pErr) throw pErr;

    await recomputeRankings(tournament.id, categoryId);

    if (tournament.status === "upcoming") {
      await supabase
        .from("tournaments")
        .update({ status: "live" })
        .eq("id", tournament.id);
    }

    return ok({ count: pairs.length });
  } catch (e) {
    return fail(e);
  }
}

/** Generate knockout bracket fixtures (first round seeded + empty later rounds). */
export async function generateKnockoutFixtures(input: {
  tournament: TournamentDetail;
  categoryId: string;
  registrations: TournamentRegistration[];
}): Promise<DbResult<{ count: number }>> {
  if (!isSupabaseConfigured()) return ok({ count: 0 });

  const { tournament, categoryId, registrations } = input;
  if (!isUuid(tournament.id) || !isUuid(categoryId)) {
    return fail("Invalid tournament or category id");
  }

  const approved = registrations
    .filter((r) => r.categoryId === categoryId && r.status === "approved")
    .sort((a, b) => (a.seed ?? 999) - (b.seed ?? 999));

  if (approved.length < 2) {
    return fail("Need at least 2 approved registrations to generate bracket");
  }

  try {
    const supabase = createClient();

    const { count: existing } = await supabase
      .from("fixtures")
      .select("id", { count: "exact", head: true })
      .eq("tournament_id", tournament.id)
      .eq("category_id", categoryId);

    if ((existing ?? 0) > 0) {
      return fail("Fixtures already generated for this category");
    }

    const teams = approved.map(teamFromRegistration);
    let remaining = teams.length;
    const rounds: string[] = [];
    while (remaining > 1) {
      rounds.push(knockoutRoundLabel(remaining));
      remaining = Math.ceil(remaining / 2);
    }

    const allRows: {
      tournament_id: string;
      category_id: string;
      round: string;
      team_a: string | null;
      team_b: string | null;
    }[] = [];

    const firstRound = rounds[0];
    for (let i = 0; i < teams.length; i += 2) {
      allRows.push({
        tournament_id: tournament.id,
        category_id: categoryId,
        round: firstRound,
        team_a: teams[i]?.name ?? null,
        team_b: teams[i + 1]?.name ?? "BYE",
      });
    }

    for (let r = 1; r < rounds.length; r += 1) {
      const matchesInRound = Math.pow(2, rounds.length - r - 1);
      for (let m = 0; m < matchesInRound; m += 1) {
        allRows.push({
          tournament_id: tournament.id,
          category_id: categoryId,
          round: rounds[r],
          team_a: "TBD",
          team_b: "TBD",
        });
      }
    }

    const { error } = await supabase.from("fixtures").insert(allRows);
    if (error) throw error;

    if (tournament.status === "upcoming") {
      await supabase
        .from("tournaments")
        .update({ status: "live" })
        .eq("id", tournament.id);
    }

    return ok({ count: allRows.length });
  } catch (e) {
    return fail(e);
  }
}

/** Dispatch fixture generation based on tournament format. */
export async function generateTournamentFixtures(input: {
  tournament: TournamentDetail;
  categoryId: string;
  registrations: TournamentRegistration[];
  createdBy: string;
}): Promise<DbResult<{ count: number }>> {
  const format: TournamentFormat = input.tournament.format ?? "knockout";

  if (format === "round_robin" || format === "league") {
    return generateRoundRobinFixtures(input);
  }

  if (format === "knockout" || format === "group_knockout") {
    return generateKnockoutFixtures(input);
  }

  return fail(`Unsupported format: ${format}`);
}

function resolvePlayerIdsForTeam(
  teamName: string,
  registrations: TournamentRegistration[],
  categoryId: string
): string[] {
  for (const reg of registrations) {
    if (reg.categoryId !== categoryId || reg.status !== "approved") continue;
    const team = teamFromRegistration(reg);
    if (team.name === teamName) return team.playerIds;
  }
  return [];
}

/** Create a live match for a fixture and link fixture.match_id. */
export async function createMatchForFixture(input: {
  fixtureId: string;
  tournament: TournamentDetail;
  registrations: TournamentRegistration[];
  createdBy: string;
}): Promise<DbResult<{ matchId: string }>> {
  if (!isSupabaseConfigured() || !isUuid(input.fixtureId)) {
    return ok({ matchId: `mock-fixture-${Date.now()}` });
  }

  try {
    const supabase = createClient();
    const { data: fixture, error: fErr } = await supabase
      .from("fixtures")
      .select("id, tournament_id, category_id, round, team_a, team_b, match_id")
      .eq("id", input.fixtureId)
      .maybeSingle();

    if (fErr || !fixture) throw fErr ?? new Error("Fixture not found");
    if (fixture.match_id) return fail("Match already linked to this fixture");

    const category = input.tournament.categories.find(
      (c) => c.id === fixture.category_id
    );
    if (!category) return fail("Category not found");

    const teamA = fixture.team_a as string;
    const teamB = fixture.team_b as string;
    if (!teamA || !teamB || teamB === "BYE" || teamA === "TBD" || teamB === "TBD") {
      return fail("Both teams must be set before starting the match");
    }

    const teamAIds = resolvePlayerIdsForTeam(
      teamA,
      input.registrations,
      fixture.category_id as string
    );
    const teamBIds = resolvePlayerIdsForTeam(
      teamB,
      input.registrations,
      fixture.category_id as string
    );

    const created = await createMatch({
      createdBy: input.createdBy,
      setup: {
        step: 4,
        matchType: categoryMatchType(category.categoryType),
        matchCategory: "tournament",
        isPublic: input.tournament.isPublic,
        teamAName: teamA,
        teamBName: teamB,
        players: [],
        venue: input.tournament.venue,
        city: input.tournament.city,
        courtNumber: "",
        scoringType: input.tournament.scoringType,
        targetPoints: input.tournament.pointsToWin,
        bestOf: input.tournament.bestOf,
        winBy: input.tournament.winBy,
        maxTimeouts: input.tournament.maxTimeouts,
        timeoutDuration: input.tournament.timeoutDuration,
        hasReferee: false,
        localRules: "",
      },
      teamAPlayerIds: teamAIds,
      teamBPlayerIds: teamBIds,
      tournamentId: input.tournament.id,
    });

    if (created.error || !created.data) {
      return fail(created.error ?? "Failed to create match");
    }

    const { error: linkErr } = await supabase
      .from("fixtures")
      .update({ match_id: created.data.id })
      .eq("id", input.fixtureId);

    if (linkErr) throw linkErr;

    return ok({ matchId: created.data.id });
  } catch (e) {
    return fail(e);
  }
}

export type { SkillLevel };
