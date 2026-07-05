import { createClient } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/auth/isSupabaseConfigured";
import { isUuid } from "@/lib/db/config";
import { createNotification } from "@/lib/db/notifications";
import type { DbResult } from "@/lib/db/matches";

export type MatchScorerRole = "scorer" | "admin";
export type MatchScorerStatus = "pending" | "accepted" | "declined" | "revoked";

export interface MatchScorer {
  id: string;
  matchId: string;
  userId: string;
  fullName: string;
  role: MatchScorerRole;
  status: MatchScorerStatus;
  invitedBy: string;
  createdAt: string;
  respondedAt: string | null;
}

interface DbMatchScorerRow {
  id: string;
  match_id: string;
  user_id: string;
  role: MatchScorerRole;
  status: MatchScorerStatus;
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

function mapScorer(row: DbMatchScorerRow): MatchScorer {
  const profile = Array.isArray(row.profiles)
    ? row.profiles[0]
    : row.profiles;
  return {
    id: row.id,
    matchId: row.match_id,
    userId: row.user_id,
    fullName: profile?.full_name ?? "Player",
    role: row.role,
    status: row.status,
    invitedBy: row.invited_by,
    createdAt: row.created_at,
    respondedAt: row.responded_at,
  };
}

export async function fetchMatchScorers(
  matchId: string
): Promise<DbResult<MatchScorer[]>> {
  if (!isSupabaseConfigured() || !isUuid(matchId)) {
    return ok([]);
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("match_scorers")
      .select(
        "id, match_id, user_id, role, status, invited_by, created_at, responded_at, profiles:user_id(full_name)"
      )
      .eq("match_id", matchId)
      .neq("status", "revoked")
      .order("created_at", { ascending: true });

    if (error) throw error;
    return ok((data as DbMatchScorerRow[]).map(mapScorer));
  } catch (e) {
    return fail(e);
  }
}

export async function isAcceptedMatchScorer(
  matchId: string,
  userId: string
): Promise<boolean> {
  if (!isSupabaseConfigured() || !isUuid(matchId)) return false;

  const supabase = createClient();
  const { data } = await supabase
    .from("match_scorers")
    .select("id")
    .eq("match_id", matchId)
    .eq("user_id", userId)
    .eq("status", "accepted")
    .maybeSingle();

  return Boolean(data);
}

export async function inviteMatchScorer(input: {
  matchId: string;
  userId: string;
  invitedBy: string;
  role?: MatchScorerRole;
  matchLabel: string;
}): Promise<DbResult<MatchScorer>> {
  if (!isSupabaseConfigured() || !isUuid(input.matchId)) {
    return fail("Scorer invites require a live database connection");
  }

  if (input.userId === input.invitedBy) {
    return fail("You cannot invite yourself");
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("match_scorers")
      .upsert(
        {
          match_id: input.matchId,
          user_id: input.userId,
          role: input.role ?? "admin",
          status: "pending",
          invited_by: input.invitedBy,
          responded_at: null,
        },
        { onConflict: "match_id,user_id" }
      )
      .select(
        "id, match_id, user_id, role, status, invited_by, created_at, responded_at, profiles:user_id(full_name)"
      )
      .single();

    if (error) throw error;

    await createNotification({
      userId: input.userId,
      icon: "🎾",
      text: `You've been invited to score ${input.matchLabel}`,
      link: `/scorer-invite/${input.matchId}`,
    });

    return ok(mapScorer(data as DbMatchScorerRow));
  } catch (e) {
    return fail(e);
  }
}

export async function respondToScorerInvite(input: {
  matchId: string;
  userId: string;
  accept: boolean;
}): Promise<DbResult<MatchScorer>> {
  if (!isSupabaseConfigured() || !isUuid(input.matchId)) {
    return fail("Scorer invites require a live database connection");
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("match_scorers")
      .update({
        status: input.accept ? "accepted" : "declined",
        responded_at: new Date().toISOString(),
      })
      .eq("match_id", input.matchId)
      .eq("user_id", input.userId)
      .eq("status", "pending")
      .select(
        "id, match_id, user_id, role, status, invited_by, created_at, responded_at, profiles:user_id(full_name)"
      )
      .maybeSingle();

    if (error) throw error;
    if (!data) return fail("No pending invite found for this match");

    return ok(mapScorer(data as DbMatchScorerRow));
  } catch (e) {
    return fail(e);
  }
}

export async function revokeMatchScorer(
  matchId: string,
  scorerUserId: string
): Promise<DbResult<true>> {
  if (!isSupabaseConfigured() || !isUuid(matchId)) {
    return ok(true);
  }

  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("match_scorers")
      .update({
        status: "revoked",
        responded_at: new Date().toISOString(),
      })
      .eq("match_id", matchId)
      .eq("user_id", scorerUserId);

    if (error) throw error;
    return ok(true);
  } catch (e) {
    return fail(e);
  }
}

export async function fetchPendingScorerInvite(
  matchId: string,
  userId: string
): Promise<DbResult<MatchScorer | null>> {
  if (!isSupabaseConfigured() || !isUuid(matchId)) {
    return ok(null);
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("match_scorers")
      .select(
        "id, match_id, user_id, role, status, invited_by, created_at, responded_at, profiles:user_id(full_name)"
      )
      .eq("match_id", matchId)
      .eq("user_id", userId)
      .eq("status", "pending")
      .maybeSingle();

    if (error) throw error;
    return ok(data ? mapScorer(data as DbMatchScorerRow) : null);
  } catch (e) {
    return fail(e);
  }
}
