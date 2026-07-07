import { createClient } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/auth/isSupabaseConfigured";
import { isUuid } from "@/lib/db/config";
import type { SkillLevel } from "@/types/player";
import type {
  CategoryType,
  RegistrationStatus,
  TournamentDetail,
  TournamentForm,
  TournamentFormat,
  TournamentRegistration,
  TournamentStatus,
  UpcomingTournament,
  UserTournamentRegistration,
} from "@/types/tournament";
import type { ScoringType } from "@/types/match";

export type DbResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

const ok = <T>(data: T): DbResult<T> => ({ data, error: null });
const fail = (error: unknown): DbResult<never> => ({
  data: null,
  error: error instanceof Error ? error.message : String(error),
});

interface DbTournamentRow {
  id: string;
  created_by: string;
  name: string;
  description: string;
  venue: string;
  city: string;
  address: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  max_participants: number;
  scoring_type: ScoringType;
  points_to_win: number;
  best_of: number;
  win_by: number;
  max_timeouts: number;
  timeout_duration: number;
  is_public: boolean;
  status: TournamentStatus;
  format?: TournamentFormat | null;
  prize?: string | null;
  registration_url?: string | null;
  club_id?: string | null;
}

interface DbCategoryRow {
  id: string;
  tournament_id: string;
  name: string | null;
  category_type: CategoryType;
  skill_level: SkillLevel;
  max_teams: number;
  entry_fee: number;
}

interface DbRegistrationRow {
  id: string;
  tournament_id: string;
  category_id: string;
  player_id: string;
  partner_id: string | null;
  status: RegistrationStatus;
  seed: number | null;
  registered_at: string;
}

interface ProfileSnippet {
  full_name: string;
  avatar_url: string | null;
}

function mapCategory(row: DbCategoryRow) {
  return {
    id: row.id,
    name: row.name ?? undefined,
    categoryType: row.category_type,
    skillLevel: row.skill_level,
    maxTeams: row.max_teams,
    entryFee: Number(row.entry_fee),
  };
}

function mapTournamentDetail(
  row: DbTournamentRow,
  categories: DbCategoryRow[],
  registeredCount: number,
  currentUserId?: string,
  userRegistration?: UserTournamentRegistration | null,
  isCoAdmin = false
): TournamentDetail {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    city: row.city,
    venue: row.venue,
    address: row.address,
    startDate: row.start_date,
    endDate: row.end_date,
    registrationDeadline: row.registration_deadline,
    maxParticipants: row.max_participants,
    registeredCount,
    status: row.status,
    format: row.format ?? "knockout",
    isPublic: row.is_public,
    createdBy: row.created_by,
    prize: row.prize ?? undefined,
    registrationUrl: row.registration_url ?? undefined,
    clubId: row.club_id ?? undefined,
    categories: categories.map(mapCategory),
    scoringType: row.scoring_type,
    pointsToWin: row.points_to_win,
    bestOf: row.best_of as 3 | 5,
    winBy: row.win_by as 1 | 2,
    maxTimeouts: row.max_timeouts,
    timeoutDuration: row.timeout_duration,
    isOrganizer: Boolean(
      currentUserId &&
        (currentUserId === row.created_by || isCoAdmin)
    ),
    userRegistration: userRegistration ?? null,
  };
}

async function fetchProfilesByIds(
  ids: string[]
): Promise<Map<string, ProfileSnippet>> {
  const unique = [...new Set(ids.filter(Boolean))];
  if (unique.length === 0) return new Map();

  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", unique);

  const map = new Map<string, ProfileSnippet>();
  for (const row of data ?? []) {
    map.set(row.id as string, {
      full_name: row.full_name as string,
      avatar_url: row.avatar_url as string | null,
    });
  }
  return map;
}

async function loadTournamentBundle(
  tournamentId: string,
  currentUserId?: string
): Promise<TournamentDetail | null> {
  const supabase = createClient();

  const { data: row, error } = await supabase
    .from("tournaments")
    .select(
      `
      id,
      created_by,
      name,
      description,
      venue,
      city,
      address,
      start_date,
      end_date,
      registration_deadline,
      max_participants,
      scoring_type,
      points_to_win,
      best_of,
      win_by,
      max_timeouts,
      timeout_duration,
      is_public,
      status,
      format,
      prize,
      registration_url,
      club_id
    `
    )
    .eq("id", tournamentId)
    .maybeSingle();

  if (error || !row) return null;

  const { data: categories } = await supabase
    .from("tournament_categories")
    .select("id, tournament_id, name, category_type, skill_level, max_teams, entry_fee")
    .eq("tournament_id", tournamentId)
    .order("category_type", { ascending: true });

  const { count } = await supabase
    .from("tournament_registrations")
    .select("id", { count: "exact", head: true })
    .eq("tournament_id", tournamentId)
    .neq("status", "rejected");

  let userRegistration: UserTournamentRegistration | null = null;
  let isCoAdmin = false;
  if (currentUserId) {
    userRegistration = await fetchUserRegistration(tournamentId, currentUserId);
    const { isTournamentCoAdmin } = await import("@/lib/db/tournamentAdmins");
    isCoAdmin = await isTournamentCoAdmin(tournamentId, currentUserId);
  }

  return mapTournamentDetail(
    row as DbTournamentRow,
    (categories ?? []) as DbCategoryRow[],
    count ?? 0,
    currentUserId,
    userRegistration,
    isCoAdmin
  );
}

/** Create tournament + categories; publishes as `upcoming`. */
export async function createTournament(
  form: TournamentForm,
  createdBy: string
): Promise<DbResult<{ id: string }>> {
  if (!isSupabaseConfigured()) {
    return ok({ id: `mock-t-${Date.now()}` });
  }

  if (!isUuid(createdBy)) {
    return fail("Sign in with a real account to create tournaments");
  }

  try {
    const supabase = createClient();

    const { data: tournament, error: tErr } = await supabase
      .from("tournaments")
      .insert({
        created_by: createdBy,
        name: form.name.trim(),
        description: form.description.trim(),
        venue: form.venue.trim(),
        city: form.city.trim(),
        address: form.address.trim(),
        start_date: form.startDate,
        end_date: form.endDate,
        registration_deadline: form.registrationDeadline,
        max_participants: form.maxParticipants,
        scoring_type: form.scoringType,
        points_to_win: form.pointsToWin,
        best_of: form.bestOf,
        win_by: form.winBy,
        max_timeouts: form.maxTimeouts,
        timeout_duration: form.timeoutDuration,
        is_public: form.isPublic,
        status: "upcoming",
        format: form.format,
      })
      .select("id")
      .single();

    if (tErr || !tournament) throw tErr ?? new Error("Tournament insert failed");

    if (form.categories.length > 0) {
      const categoryRows = form.categories.map((cat) => ({
        tournament_id: tournament.id,
        category_type: cat.categoryType,
        skill_level: cat.skillLevel,
        max_teams: cat.maxTeams,
        entry_fee: cat.entryFee,
      }));

      const { error: cErr } = await supabase
        .from("tournament_categories")
        .insert(categoryRows);

      if (cErr) throw cErr;
    }

    return ok({ id: tournament.id as string });
  } catch (e) {
    return fail(e);
  }
}

export async function fetchTournamentById(
  tournamentId: string,
  currentUserId?: string
): Promise<TournamentDetail | null> {
  if (!isSupabaseConfigured() || !isUuid(tournamentId)) return null;
  return loadTournamentBundle(tournamentId, currentUserId);
}

export async function fetchUserRegistration(
  tournamentId: string,
  playerId: string
): Promise<UserTournamentRegistration | null> {
  if (!isSupabaseConfigured() || !isUuid(tournamentId) || !isUuid(playerId)) {
    return null;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("tournament_registrations")
    .select("id, category_id, status, partner_id, registered_at")
    .eq("tournament_id", tournamentId)
    .eq("player_id", playerId)
    .maybeSingle();

  if (error || !data) return null;

  let partnerName: string | undefined;
  if (data.partner_id) {
    const profiles = await fetchProfilesByIds([data.partner_id as string]);
    partnerName = profiles.get(data.partner_id as string)?.full_name;
  }

  return {
    id: data.id as string,
    categoryId: data.category_id as string,
    status: data.status as RegistrationStatus,
    partnerName,
    registeredAt: data.registered_at as string,
  };
}

export async function fetchTournamentRegistrations(
  tournamentId: string
): Promise<TournamentRegistration[]> {
  if (!isSupabaseConfigured() || !isUuid(tournamentId)) return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from("tournament_registrations")
    .select(
      "id, tournament_id, category_id, player_id, partner_id, status, seed, registered_at"
    )
    .eq("tournament_id", tournamentId)
    .order("registered_at", { ascending: false });

  if (error || !data?.length) return [];

  const profileIds: string[] = [];
  for (const row of data) {
    profileIds.push(row.player_id as string);
    if (row.partner_id) profileIds.push(row.partner_id as string);
  }
  const profiles = await fetchProfilesByIds(profileIds);

  return (data as DbRegistrationRow[]).map((row) => {
    const player = profiles.get(row.player_id);
    const partner = row.partner_id ? profiles.get(row.partner_id) : undefined;
    return {
      id: row.id,
      tournamentId: row.tournament_id,
      categoryId: row.category_id,
      playerId: row.player_id,
      playerName: player?.full_name ?? "Player",
      playerAvatarUrl: player?.avatar_url ?? "",
      partnerId: row.partner_id ?? undefined,
      partnerName: partner?.full_name,
      partnerAvatarUrl: partner?.avatar_url ?? undefined,
      seed: row.seed ?? undefined,
      status: row.status,
      registeredAt: row.registered_at,
    };
  });
}

export async function registerForTournament(input: {
  tournamentId: string;
  playerId: string;
  categoryId: string;
  partnerId?: string | null;
}): Promise<DbResult<{ id: string }>> {
  if (!isSupabaseConfigured()) {
    return ok({ id: `mock-reg-${Date.now()}` });
  }

  if (!isUuid(input.tournamentId) || !isUuid(input.playerId) || !isUuid(input.categoryId)) {
    return fail("Invalid tournament or player id");
  }

  try {
    const supabase = createClient();

    const existing = await fetchUserRegistration(input.tournamentId, input.playerId);
    if (existing) {
      return fail("You are already registered for this tournament");
    }

    const { data, error } = await supabase
      .from("tournament_registrations")
      .insert({
        tournament_id: input.tournamentId,
        player_id: input.playerId,
        category_id: input.categoryId,
        partner_id: input.partnerId ?? null,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) throw error;
    return ok({ id: data.id as string });
  } catch (e) {
    return fail(e);
  }
}

export async function updateRegistrationStatus(
  registrationId: string,
  status: RegistrationStatus
): Promise<DbResult<true>> {
  if (!isSupabaseConfigured() || !isUuid(registrationId)) {
    return ok(true);
  }

  try {
    const supabase = createClient();

    const { data: registration, error: fetchError } = await supabase
      .from("tournament_registrations")
      .select("player_id, partner_id, tournament_id, tournaments(name)")
      .eq("id", registrationId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    const { error } = await supabase
      .from("tournament_registrations")
      .update({ status })
      .eq("id", registrationId);

    if (error) throw error;

    if (status === "approved" && registration) {
      const tournamentName =
        (registration.tournaments as { name?: string } | null)?.name ??
        "your tournament";
      const tournamentId = registration.tournament_id as string;
      const notifyIds = [registration.player_id as string];
      if (registration.partner_id) {
        notifyIds.push(registration.partner_id as string);
      }

      const { createNotifications } = await import("@/lib/db/notifications");
      await createNotifications(
        notifyIds.map((userId) => ({
          userId,
          icon: "🏆",
          text: `Your registration for ${tournamentName} is approved`,
          link: `/tournament/${tournamentId}`,
        }))
      );
    }

    return ok(true);
  } catch (e) {
    return fail(e);
  }
}

/** Persist seed assignment for knockout bracket generation. */
export async function updateRegistrationSeed(
  registrationId: string,
  seed: number | null
): Promise<DbResult<boolean>> {
  if (!isSupabaseConfigured() || !isUuid(registrationId)) {
    return ok(true);
  }

  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("tournament_registrations")
      .update({ seed: seed && seed > 0 ? seed : null })
      .eq("id", registrationId);

    if (error) throw error;
    return ok(true);
  } catch (e) {
    return fail(e);
  }
}

export async function fetchUpcomingTournaments(
  limit = 10
): Promise<UpcomingTournament[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from("tournaments")
    .select(
      `
      id,
      name,
      city,
      venue,
      start_date,
      end_date,
      registration_deadline,
      max_participants,
      status,
      format
    `
    )
    .eq("is_public", true)
    .eq("archived", false)
    .in("status", ["upcoming", "live"])
    .order("start_date", { ascending: true })
    .limit(limit);

  if (error || !data?.length) return [];

  const ids = data.map((t) => t.id as string);
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

  return data.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    city: row.city as string,
    venue: row.venue as string,
    startDate: row.start_date as string,
    endDate: row.end_date as string,
    registrationDeadline: row.registration_deadline as string,
    maxParticipants: row.max_participants as number,
    registeredCount: countByTournament.get(row.id as string) ?? 0,
    status: row.status as TournamentStatus,
    format: (row.format as TournamentFormat | null) ?? undefined,
  }));
}

export async function fetchOrganizerTournaments(
  organizerId: string
): Promise<TournamentDetail[]> {
  if (!isSupabaseConfigured() || !isUuid(organizerId)) return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from("tournaments")
    .select("id")
    .eq("created_by", organizerId)
    .order("start_date", { ascending: false });

  if (error || !data?.length) return [];

  const results = await Promise.all(
    data.map((row) => loadTournamentBundle(row.id as string, organizerId))
  );

  return results.filter((t): t is TournamentDetail => t !== null);
}
