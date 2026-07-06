import { createClient } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/auth/isSupabaseConfigured";
import { isUuid } from "@/lib/db/config";
import { createNotification } from "@/lib/db/notifications";
import type { DbResult } from "@/lib/db/matches";

export type TournamentAdminRole = "admin" | "scorer";
export type TournamentAdminStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "revoked";

export interface TournamentAdmin {
  id: string;
  tournamentId: string;
  userId: string;
  fullName: string;
  role: TournamentAdminRole;
  status: TournamentAdminStatus;
  invitedBy: string;
  createdAt: string;
  respondedAt: string | null;
}

interface DbTournamentAdminRow {
  id: string;
  tournament_id: string;
  user_id: string;
  role: TournamentAdminRole;
  status: TournamentAdminStatus;
  invited_by: string;
  created_at: string;
  responded_at: string | null;
  profiles?: { full_name: string } | { full_name: string }[] | null;
}

const ok = <T>(data: T): DbResult<T> => ({ data, error: null });
const fail = (error: unknown): DbResult<never> => ({
  data: null,
  error: error instanceof Error ? error.message : String(error),
});

function mapAdmin(row: DbTournamentAdminRow): TournamentAdmin {
  const profile = Array.isArray(row.profiles)
    ? row.profiles[0]
    : row.profiles;
  return {
    id: row.id,
    tournamentId: row.tournament_id,
    userId: row.user_id,
    fullName: profile?.full_name ?? "Player",
    role: row.role,
    status: row.status,
    invitedBy: row.invited_by,
    createdAt: row.created_at,
    respondedAt: row.responded_at,
  };
}

export async function isTournamentCoAdmin(
  tournamentId: string,
  userId: string
): Promise<boolean> {
  if (!isSupabaseConfigured() || !isUuid(tournamentId) || !isUuid(userId)) {
    return false;
  }

  const supabase = createClient();
  const { data } = await supabase
    .from("tournament_admins")
    .select("id")
    .eq("tournament_id", tournamentId)
    .eq("user_id", userId)
    .eq("status", "accepted")
    .maybeSingle();

  return Boolean(data);
}

export async function fetchTournamentAdmins(
  tournamentId: string
): Promise<DbResult<TournamentAdmin[]>> {
  if (!isSupabaseConfigured() || !isUuid(tournamentId)) {
    return ok([]);
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("tournament_admins")
      .select(
        "id, tournament_id, user_id, role, status, invited_by, created_at, responded_at, profiles:user_id(full_name)"
      )
      .eq("tournament_id", tournamentId)
      .neq("status", "revoked")
      .order("created_at", { ascending: true });

    if (error) throw error;
    return ok((data as DbTournamentAdminRow[]).map(mapAdmin));
  } catch (e) {
    return fail(e);
  }
}

export async function inviteTournamentAdmin(input: {
  tournamentId: string;
  userId: string;
  invitedBy: string;
  tournamentName: string;
  role?: TournamentAdminRole;
}): Promise<DbResult<TournamentAdmin>> {
  if (!isSupabaseConfigured()) {
    return fail("Tournament admin invites require Supabase");
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("tournament_admins")
      .upsert(
        {
          tournament_id: input.tournamentId,
          user_id: input.userId,
          role: input.role ?? "admin",
          status: "pending",
          invited_by: input.invitedBy,
        },
        { onConflict: "tournament_id,user_id" }
      )
      .select(
        "id, tournament_id, user_id, role, status, invited_by, created_at, responded_at, profiles:user_id(full_name)"
      )
      .single();

    if (error) throw error;

    await createNotification({
      userId: input.userId,
      icon: "match_invite",
      text: `You're invited to co-manage ${input.tournamentName}`,
      link: `/tournament/${input.tournamentId}?tab=manage`,
    });

    return ok(mapAdmin(data as DbTournamentAdminRow));
  } catch (e) {
    return fail(e);
  }
}

export async function respondTournamentAdminInvite(input: {
  tournamentId: string;
  userId: string;
  accept: boolean;
}): Promise<DbResult<boolean>> {
  if (!isSupabaseConfigured()) {
    return ok(true);
  }

  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("tournament_admins")
      .update({
        status: input.accept ? "accepted" : "declined",
        responded_at: new Date().toISOString(),
      })
      .eq("tournament_id", input.tournamentId)
      .eq("user_id", input.userId)
      .eq("status", "pending");

    if (error) throw error;
    return ok(true);
  } catch (e) {
    return fail(e);
  }
}

export async function revokeTournamentAdmin(
  adminId: string
): Promise<DbResult<boolean>> {
  if (!isSupabaseConfigured() || !isUuid(adminId)) {
    return ok(true);
  }

  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("tournament_admins")
      .update({ status: "revoked", responded_at: new Date().toISOString() })
      .eq("id", adminId);

    if (error) throw error;
    return ok(true);
  } catch (e) {
    return fail(e);
  }
}
