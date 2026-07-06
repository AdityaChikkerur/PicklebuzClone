import { createClient } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/auth/isSupabaseConfigured";
import { isUuid } from "@/lib/db/config";
import type { DbResult } from "@/lib/db/matches";

export type MatchPlayerInviteStatus = "pending" | "accepted" | "declined";

export interface MatchPlayerInvite {
  matchId: string;
  playerId: string | null;
  guestId: string | null;
  fullName: string;
  team: "A" | "B";
  inviteStatus: MatchPlayerInviteStatus;
  respondedAt: string | null;
  isGuest: boolean;
}

export interface MatchInviteSummary {
  matchStatus: string;
  startedAt: string | null;
  allAccepted: boolean;
  pendingCount: number;
  players: MatchPlayerInvite[];
}

const ok = <T>(data: T): DbResult<T> => ({ data, error: null });
const fail = (error: unknown): DbResult<never> => ({
  data: null,
  error: error instanceof Error ? error.message : String(error),
});

interface DbPlayerRow {
  player_id: string | null;
  guest_id: string | null;
  team: "A" | "B";
  invite_status: MatchPlayerInviteStatus;
  responded_at: string | null;
  profiles?: { full_name: string } | { full_name: string }[] | null;
  guest_players?: { full_name: string } | { full_name: string }[] | null;
}

function mapPlayer(row: DbPlayerRow): MatchPlayerInvite | null {
  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  const guest = Array.isArray(row.guest_players)
    ? row.guest_players[0]
    : row.guest_players;

  if (row.player_id) {
    return {
      matchId: "",
      playerId: row.player_id,
      guestId: null,
      fullName: profile?.full_name ?? "Player",
      team: row.team,
      inviteStatus: row.invite_status,
      respondedAt: row.responded_at,
      isGuest: false,
    };
  }

  if (row.guest_id) {
    return {
      matchId: "",
      playerId: null,
      guestId: row.guest_id,
      fullName: guest?.full_name ?? "Guest player",
      team: row.team,
      inviteStatus: row.invite_status,
      respondedAt: row.responded_at,
      isGuest: true,
    };
  }

  return null;
}

export async function fetchMatchInviteSummary(
  matchId: string
): Promise<DbResult<MatchInviteSummary | null>> {
  if (!isSupabaseConfigured() || !isUuid(matchId)) {
    return ok(null);
  }

  try {
    const supabase = createClient();

    const [{ data: match, error: mErr }, { data: players, error: pErr }] =
      await Promise.all([
        supabase
          .from("matches")
          .select("status, started_at")
          .eq("id", matchId)
          .maybeSingle(),
        supabase
          .from("match_players")
          .select(
            "player_id, guest_id, team, invite_status, responded_at, profiles:player_id(full_name), guest_players:guest_id(full_name)"
          )
          .eq("match_id", matchId),
      ]);

    if (mErr) throw mErr;
    if (pErr) throw pErr;
    if (!match) return ok(null);

    const mapped = (players as DbPlayerRow[] ?? [])
      .map((row) => {
        const invite = mapPlayer(row);
        if (invite) invite.matchId = matchId;
        return invite;
      })
      .filter((row): row is MatchPlayerInvite => row !== null);

    const pendingCount = mapped.filter(
      (p) => p.inviteStatus === "pending" && !p.isGuest
    ).length;

    return ok({
      matchStatus: match.status as string,
      startedAt: match.started_at as string | null,
      allAccepted: pendingCount === 0,
      pendingCount,
      players: mapped,
    });
  } catch (e) {
    return fail(e);
  }
}

export async function fetchPendingMatchInvite(
  matchId: string,
  userId: string
): Promise<DbResult<MatchPlayerInvite | null>> {
  if (!isSupabaseConfigured() || !isUuid(matchId)) {
    return ok(null);
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("match_players")
      .select(
        "player_id, team, invite_status, responded_at, profiles:player_id(full_name)"
      )
      .eq("match_id", matchId)
      .eq("player_id", userId)
      .eq("invite_status", "pending")
      .maybeSingle();

    if (error) throw error;
    if (!data) return ok(null);

    const invite = mapPlayer(data as DbPlayerRow);
    if (invite) invite.matchId = matchId;
    return ok(invite);
  } catch (e) {
    return fail(e);
  }
}

export interface RespondInviteResult {
  accepted: boolean;
  matchStarted: boolean;
  matchStatus: string;
}

export async function notifyMatchParticipants(
  matchId: string,
  text: string,
  excludeUserId?: string
): Promise<void> {
  if (!isSupabaseConfigured() || !isUuid(matchId)) return;

  const supabase = createClient();
  const { data: players } = await supabase
    .from("match_players")
    .select("player_id")
    .eq("match_id", matchId)
    .not("player_id", "is", null);

  const ids = (players ?? [])
    .map((row) => row.player_id as string)
    .filter((id) => id && id !== excludeUserId);

  if (ids.length === 0) return;

  const { sendNotifications } = await import("@/lib/notifications/sendNotification");
  await sendNotifications(ids, {
    icon: "match_invite",
    text,
    link: `/live-scoring/${matchId}`,
  });
}

export async function respondToMatchInvite(input: {
  matchId: string;
  accept: boolean;
}): Promise<DbResult<RespondInviteResult>> {
  if (!isSupabaseConfigured() || !isUuid(input.matchId)) {
    return fail("Match invites require a live database connection");
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("respond_match_player_invite", {
      p_match_id: input.matchId,
      p_accept: input.accept,
    });

    if (error) throw error;

    const payload = data as {
      accepted?: boolean;
      match_started?: boolean;
      match_status?: string;
    } | null;

    return ok({
      accepted: Boolean(payload?.accepted),
      matchStarted: Boolean(payload?.match_started),
      matchStatus: payload?.match_status ?? "draft",
    });
  } catch (e) {
    return fail(e);
  }
}
