import { NextResponse } from "next/server";
import { fetchDiscoveryPlayersWithBoost } from "@/lib/db/players";
import {
  isAnyBoostActive,
  rankDiscoveryPlayers,
} from "@/lib/monetization/profileBoost";
import { createAuthenticatedSupabaseClient } from "@/lib/supabaseServer";
import { createAdminSupabaseClient, isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";
import type { DiscoveryFilters } from "@/lib/db/players";

function parseFilters(url: URL): DiscoveryFilters {
  return {
    city: url.searchParams.get("city") ?? undefined,
    skillLevel: url.searchParams.get("skillLevel") ?? undefined,
    intent:
      (url.searchParams.get("intent") as DiscoveryFilters["intent"]) ?? "all",
    search: url.searchParams.get("search") ?? undefined,
    excludeUserId: url.searchParams.get("excludeUserId") ?? undefined,
  };
}

export async function GET(request: Request) {
  const filters = parseFilters(new URL(request.url));

  try {
    const supabase = isSupabaseAdminConfigured()
      ? createAdminSupabaseClient()
      : await createAuthenticatedSupabaseClient(request);

    const players = await fetchDiscoveryPlayersWithBoost(supabase, filters);
    const ranked = rankDiscoveryPlayers(players);

    return NextResponse.json({
      players: ranked.map(
        ({
          boostType: _boostType,
          boostExpiresAt: _boostExpiresAt,
          adminBoosted: _adminBoosted,
          ...player
        }) => ({
          ...player,
          isBoosted: isAnyBoostActive({
            boostType: _boostType,
            boostExpiresAt: _boostExpiresAt,
            adminBoosted: _adminBoosted,
            id: player.id,
          }),
        })
      ),
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Failed to load discover players";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
