import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";
import { normalizePhone } from "@/lib/phone/normalizePhone";
import type { BoostSortablePlayer } from "@/lib/monetization/profileBoost";
import type { Player, SkillLevel } from "@/types/player";

export interface DiscoveryFilters {
  city?: string;
  skillLevel?: string;
  intent?: "all" | "partner" | "match" | "both";
  search?: string;
  excludeUserId?: string;
}

interface DbProfileRow {
  id: string;
  full_name: string;
  avatar_url: string | null;
  city: string;
  skill_level: SkillLevel;
  dupr_rating: number;
  looking_for_partner: boolean;
  looking_for_match: boolean;
  phone: string | null;
  boosted?: boolean;
  profile_boosts?:
    | { boost_type: string; expires_at: string }
    | { boost_type: string; expires_at: string }[]
    | null;
}

export type DiscoveryPlayer = Player & BoostSortablePlayer;

function boostFromRow(row: DbProfileRow): {
  boostType: "free" | "paid" | null;
  boostExpiresAt: string | null;
} {
  const nested = row.profile_boosts;
  if (!nested) return { boostType: null, boostExpiresAt: null };
  const record = Array.isArray(nested) ? nested[0] : nested;
  const boostType =
    record?.boost_type === "free" || record?.boost_type === "paid"
      ? record.boost_type
      : null;
  return {
    boostType,
    boostExpiresAt: record?.expires_at ?? null,
  };
}

function mapDiscoveryPlayer(row: DbProfileRow): DiscoveryPlayer {
  const boost = boostFromRow(row);
  return {
    id: row.id,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    city: row.city,
    skillLevel: row.skill_level,
    duprRating: Number(row.dupr_rating),
    playerRating: Number(row.dupr_rating),
    phone: row.phone,
    lookingForPartner: row.looking_for_partner,
    lookingForMatch: row.looking_for_match,
    boostType: boost.boostType,
    boostExpiresAt: boost.boostExpiresAt,
    adminBoosted: Boolean(row.boosted),
  };
}

/** List players for the discover feed with optional filters. */
export async function fetchDiscoveryPlayers(
  filters: DiscoveryFilters = {}
): Promise<Player[]> {
  const players = await fetchDiscoveryPlayersWithBoost(createClient(), filters);
  return players.map(
    ({ boostType: _t, boostExpiresAt: _e, adminBoosted: _a, ...player }) => player
  );
}

/** Discover feed including hidden boost metadata for server-side ranking. */
export async function fetchDiscoveryPlayersWithBoost(
  supabase: SupabaseClient,
  filters: DiscoveryFilters = {}
): Promise<DiscoveryPlayer[]> {
  let query = supabase
    .from("profiles")
    .select(
      `
      id,
      full_name,
      avatar_url,
      city,
      skill_level,
      dupr_rating,
      looking_for_partner,
      looking_for_match,
      phone,
      boosted,
      profile_boosts ( boost_type, expires_at )
    `
    )
    .eq("role", "player")
    .order("full_name", { ascending: true });

  if (filters.city?.trim() && filters.city !== "All") {
    query = query.ilike("city", filters.city.trim());
  }

  if (filters.skillLevel?.trim() && filters.skillLevel !== "All") {
    query = query.eq("skill_level", filters.skillLevel);
  }

  if (filters.intent === "partner") {
    query = query.eq("looking_for_partner", true);
  } else if (filters.intent === "match") {
    query = query.eq("looking_for_match", true);
  } else if (filters.intent === "both") {
    query = query.eq("looking_for_partner", true).eq("looking_for_match", true);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  let players = (data as DbProfileRow[]).map(mapDiscoveryPlayer);

  if (filters.excludeUserId) {
    players = players.filter((p) => p.id !== filters.excludeUserId);
  }

  const q = filters.search?.trim().toLowerCase();
  if (q) {
    const phoneDigits = normalizePhone(q);
    players = players.filter(
      (p) =>
        p.fullName.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        (phoneDigits.length >= 6 &&
          p.phone &&
          normalizePhone(p.phone) === phoneDigits) ||
        (p.phone?.includes(q) ?? false)
    );
  }

  return players;
}
