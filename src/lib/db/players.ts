import { createClient } from "@/lib/supabase";
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
}

function mapDiscoveryPlayer(row: DbProfileRow): Player {
  return {
    id: row.id,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    city: row.city,
    skillLevel: row.skill_level,
    duprRating: Number(row.dupr_rating),
    lookingForPartner: row.looking_for_partner,
    lookingForMatch: row.looking_for_match,
  };
}

/** List players for the discover feed with optional filters. */
export async function fetchDiscoveryPlayers(
  filters: DiscoveryFilters = {}
): Promise<Player[]> {
  const supabase = createClient();

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
      looking_for_match
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
    players = players.filter(
      (p) =>
        p.fullName.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q)
    );
  }

  return players;
}
