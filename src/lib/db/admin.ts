import { createClient } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/auth/isSupabaseConfigured";
import { isUuid } from "@/lib/db/config";
import type {
  AdminDispute,
  AdminStats,
  AdminTournamentRow,
  AdminUser,
  DisputeResolution,
  OrganizerStats,
} from "@/types/admin";
import type { SkillLevel, UserRole } from "@/types/player";
import type {
  RegistrationStatus,
  TournamentDetail,
  TournamentFormat,
  TournamentRegistration,
  TournamentStatus,
} from "@/types/tournament";

export type DbResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

const ok = <T>(data: T): DbResult<T> => ({ data, error: null });
const fail = (error: unknown): DbResult<never> => ({
  data: null,
  error: error instanceof Error ? error.message : String(error),
});

interface DbProfileRow {
  id: string;
  full_name: string;
  email: string | null;
  city: string;
  role: UserRole;
  skill_level: SkillLevel;
  dupr_rating: number;
  verified: boolean;
  banned: boolean;
  boosted: boolean;
  created_at: string;
}

interface DbDisputeRow {
  id: string;
  match_id: string;
  raised_by: string;
  reason: string | null;
  status: "open" | "resolved";
  resolution: string | null;
  created_at: string;
  matches:
    | {
        team_a_name: string;
        team_b_name: string;
        created_by: string;
      }
    | {
        team_a_name: string;
        team_b_name: string;
        created_by: string;
      }[]
    | null;
}

function disputeMatchRow(
  matches: DbDisputeRow["matches"]
): { team_a_name: string; team_b_name: string; created_by: string } | null {
  if (!matches) return null;
  return Array.isArray(matches) ? (matches[0] ?? null) : matches;
}

interface DbTournamentAdminRow {
  id: string;
  name: string;
  city: string;
  status: TournamentStatus;
  format: TournamentFormat | null;
  max_participants: number;
  featured: boolean;
  archived: boolean;
  start_date: string;
  created_by: string;
}

function mapAdminUser(row: DbProfileRow): AdminUser {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email ?? "",
    city: row.city,
    role: row.role,
    skillLevel: row.skill_level,
    duprRating: Number(row.dupr_rating),
    verified: row.verified,
    banned: row.banned,
    boosted: row.boosted,
    createdAt: row.created_at,
  };
}

async function fetchProfilesByIds(
  ids: string[]
): Promise<Map<string, { full_name: string }>> {
  const unique = [...new Set(ids.filter(Boolean))];
  if (unique.length === 0) return new Map();

  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", unique);

  const map = new Map<string, { full_name: string }>();
  for (const row of data ?? []) {
    map.set(row.id as string, { full_name: row.full_name as string });
  }
  return map;
}

/** All profiles for admin user management. */
export async function fetchAdminUsers(): Promise<AdminUser[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      full_name,
      email,
      city,
      role,
      skill_level,
      dupr_rating,
      verified,
      banned,
      boosted,
      created_at
    `
    )
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return (data as DbProfileRow[]).map(mapAdminUser);
}

export async function updateProfileFlag(
  userId: string,
  flag: "verified" | "banned" | "boosted",
  value: boolean
): Promise<DbResult<true>> {
  if (!isSupabaseConfigured() || !isUuid(userId)) return ok(true);

  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ [flag]: value })
      .eq("id", userId);

    if (error) throw error;
    return ok(true);
  } catch (e) {
    return fail(e);
  }
}

/** Open and resolved disputes with match + player context. */
export async function fetchAdminDisputes(): Promise<AdminDispute[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from("disputes")
    .select(
      `
      id,
      match_id,
      raised_by,
      reason,
      status,
      resolution,
      created_at,
      matches (
        team_a_name,
        team_b_name,
        created_by
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error || !data?.length) return [];

  const profileIds: string[] = [];
  for (const row of data) {
    const typed = row as DbDisputeRow;
    profileIds.push(typed.raised_by);
    const match = disputeMatchRow(typed.matches);
    if (match?.created_by) profileIds.push(match.created_by);
  }
  const profiles = await fetchProfilesByIds(profileIds);

  return (data as DbDisputeRow[]).map((row) => {
    const match = disputeMatchRow(row.matches);
    const creatorName =
      profiles.get(match?.created_by ?? "")?.full_name ?? "Creator";
    const raisedByName =
      profiles.get(row.raised_by)?.full_name ?? "Player";

    return {
      id: row.id,
      matchId: row.match_id,
      matchTitle: match
        ? `${match.team_a_name} vs ${match.team_b_name}`
        : "Match",
      creatorName,
      opponentName: match?.team_b_name ?? "Opponent",
      raisedByName,
      reason: row.reason ?? "No reason provided",
      status: row.status,
      resolution: (row.resolution as DisputeResolution) ?? null,
      createdAt: row.created_at,
    };
  });
}

/** Resolve a dispute and update the linked match status. */
export async function resolveDispute(
  disputeId: string,
  resolution: DisputeResolution
): Promise<DbResult<true>> {
  if (!isSupabaseConfigured() || !isUuid(disputeId)) return ok(true);

  try {
    const supabase = createClient();

    const { data: dispute, error: fetchErr } = await supabase
      .from("disputes")
      .select("id, match_id, status")
      .eq("id", disputeId)
      .maybeSingle();

    if (fetchErr || !dispute) throw fetchErr ?? new Error("Dispute not found");

    const { error: dErr } = await supabase
      .from("disputes")
      .update({ status: "resolved", resolution })
      .eq("id", disputeId);

    if (dErr) throw dErr;

    let matchStatus: string | null = null;
    if (resolution === "uphold_creator") {
      matchStatus = "verified";
    } else if (resolution === "uphold_opponent") {
      matchStatus = "pending";
    } else if (resolution === "resolved") {
      matchStatus = "pending";
    }

    if (matchStatus) {
      const { error: mErr } = await supabase
        .from("matches")
        .update({ status: matchStatus })
        .eq("id", dispute.match_id as string);

      if (mErr) throw mErr;

      if (matchStatus === "verified") {
        const { syncFixtureFromMatch } = await import("@/lib/db/fixtures");
        await syncFixtureFromMatch(dispute.match_id as string);
      }
    }

    return ok(true);
  } catch (e) {
    return fail(e);
  }
}

/** All tournaments for admin management (includes private/archived). */
export async function fetchAdminTournaments(): Promise<AdminTournamentRow[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from("tournaments")
    .select(
      `
      id,
      name,
      city,
      status,
      format,
      max_participants,
      featured,
      archived,
      start_date,
      created_by
    `
    )
    .order("start_date", { ascending: false });

  if (error || !data?.length) return [];

  const rows = data as DbTournamentAdminRow[];
  const ids = rows.map((r) => r.id);
  const creatorIds = rows.map((r) => r.created_by);

  const { data: regCounts } = await supabase
    .from("tournament_registrations")
    .select("tournament_id")
    .in("tournament_id", ids)
    .neq("status", "rejected");

  const countByTournament = new Map<string, number>();
  for (const row of regCounts ?? []) {
    const tid = row.tournament_id as string;
    countByTournament.set(tid, (countByTournament.get(tid) ?? 0) + 1);
  }

  const creators = await fetchProfilesByIds(creatorIds);

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    city: row.city,
    status: row.status,
    format: row.format ?? "knockout",
    registeredCount: countByTournament.get(row.id) ?? 0,
    maxParticipants: row.max_participants,
    featured: row.featured,
    archived: row.archived,
    createdByName: creators.get(row.created_by)?.full_name ?? "Unknown",
    startDate: row.start_date,
  }));
}

export async function updateTournamentFlag(
  tournamentId: string,
  flag: "featured" | "archived",
  value: boolean
): Promise<DbResult<true>> {
  if (!isSupabaseConfigured() || !isUuid(tournamentId)) return ok(true);

  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("tournaments")
      .update({ [flag]: value })
      .eq("id", tournamentId);

    if (error) throw error;
    return ok(true);
  } catch (e) {
    return fail(e);
  }
}

/** Featured, non-archived public tournaments for the landing page. */
export async function fetchFeaturedTournaments(
  limit = 6
): Promise<AdminTournamentRow[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from("tournaments")
    .select(
      `
      id,
      name,
      city,
      status,
      format,
      max_participants,
      featured,
      archived,
      start_date,
      created_by
    `
    )
    .eq("featured", true)
    .eq("archived", false)
    .eq("is_public", true)
    .in("status", ["upcoming", "live"])
    .order("start_date", { ascending: true })
    .limit(limit);

  if (error || !data?.length) return [];

  const rows = data as DbTournamentAdminRow[];
  const ids = rows.map((r) => r.id);

  const { data: regCounts } = await supabase
    .from("tournament_registrations")
    .select("tournament_id")
    .in("tournament_id", ids)
    .neq("status", "rejected");

  const countByTournament = new Map<string, number>();
  for (const row of regCounts ?? []) {
    const tid = row.tournament_id as string;
    countByTournament.set(tid, (countByTournament.get(tid) ?? 0) + 1);
  }

  const creators = await fetchProfilesByIds(rows.map((r) => r.created_by));

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    city: row.city,
    status: row.status,
    format: row.format ?? "knockout",
    registeredCount: countByTournament.get(row.id) ?? 0,
    maxParticipants: row.max_participants,
    featured: row.featured,
    archived: row.archived,
    createdByName: creators.get(row.created_by)?.full_name ?? "Unknown",
    startDate: row.start_date,
  }));
}

/** Platform KPIs for the admin dashboard. */
export async function fetchAdminStats(): Promise<AdminStats> {
  const empty: AdminStats = {
    userCount: 0,
    tournamentCount: 0,
    clubCount: 0,
    openDisputes: 0,
  };

  if (!isSupabaseConfigured()) return empty;

  const supabase = createClient();

  const [usersRes, tournamentsRes, clubsRes, disputesRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("banned", false),
    supabase
      .from("tournaments")
      .select("id", { count: "exact", head: true })
      .eq("archived", false),
    supabase.from("clubs").select("id", { count: "exact", head: true }),
    supabase
      .from("disputes")
      .select("id", { count: "exact", head: true })
      .eq("status", "open"),
  ]);

  return {
    userCount: usersRes.count ?? 0,
    tournamentCount: tournamentsRes.count ?? 0,
    clubCount: clubsRes.count ?? 0,
    openDisputes: disputesRes.count ?? 0,
  };
}

/** Compute organizer KPIs from loaded tournament + registration data. */
export function computeOrganizerStats(
  tournaments: TournamentDetail[],
  registrationsByTournament: Map<string, TournamentRegistration[]>
): OrganizerStats {
  const playerIds = new Set<string>();
  let feesCollected = 0;
  let pendingApprovals = 0;

  for (const tournament of tournaments) {
    const regs = registrationsByTournament.get(tournament.id) ?? [];
    for (const reg of regs) {
      if (reg.status === "pending") pendingApprovals += 1;

      if (reg.status === "approved" || reg.status === "pending") {
        playerIds.add(reg.playerId);
        if (reg.partnerId) playerIds.add(reg.partnerId);
      }

      if (reg.status === "approved") {
        const cat = tournament.categories.find((c) => c.id === reg.categoryId);
        if (cat) feesCollected += cat.entryFee;
      }
    }
  }

  return {
    eventCount: tournaments.length,
    totalPlayers: playerIds.size,
    feesCollected,
    pendingApprovals,
  };
}

/** IDs of featured tournaments owned by an organizer. */
export async function fetchOrganizerFeaturedIds(
  organizerId: string
): Promise<Set<string>> {
  if (!isSupabaseConfigured() || !isUuid(organizerId)) return new Set();

  const supabase = createClient();
  const { data, error } = await supabase
    .from("tournaments")
    .select("id")
    .eq("created_by", organizerId)
    .eq("featured", true);

  if (error || !data) return new Set();
  return new Set(data.map((row) => row.id as string));
}

export async function setTournamentFeatured(
  tournamentId: string,
  featured: boolean
): Promise<DbResult<true>> {
  return updateTournamentFlag(tournamentId, "featured", featured);
}

export interface FlaggedMatch {
  id: string;
  teamAName: string;
  teamBName: string;
  status: string;
  scoreFlagged: boolean;
  createdAt: string;
}

/** Matches flagged by admin for suspicious scores. */
export async function fetchFlaggedMatches(): Promise<FlaggedMatch[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from("matches")
    .select("id, team_a_name, team_b_name, status, score_flagged, created_at")
    .eq("score_flagged", true)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id as string,
    teamAName: row.team_a_name as string,
    teamBName: row.team_b_name as string,
    status: row.status as string,
    scoreFlagged: row.score_flagged as boolean,
    createdAt: row.created_at as string,
  }));
}

export async function flagMatchScore(
  matchId: string,
  flagged: boolean
): Promise<DbResult<true>> {
  if (!isSupabaseConfigured() || !isUuid(matchId)) return ok(true);

  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("matches")
      .update({ score_flagged: flagged })
      .eq("id", matchId);

    if (error) throw error;
    return ok(true);
  } catch (e) {
    return fail(e);
  }
}

export type { RegistrationStatus };
