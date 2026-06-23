import { isDuprConfigured } from "@/lib/dupr/isDuprConfigured";

export interface DuprPlayerResult {
  duprId: string;
  rating: number;
  singlesRating?: number;
  doublesRating?: number;
}

const DUPR_API_BASE = process.env.DUPR_API_BASE_URL ?? "https://api.dupr.gg";

/** Fetch DUPR rating for a linked player id. Falls back to demo data when API key is unset. */
export async function fetchDuprPlayer(duprId: string): Promise<DuprPlayerResult> {
  if (!isDuprConfigured()) {
    const seed = duprId.split("").reduce((n, c) => n + c.charCodeAt(0), 0);
    const rating = Math.round((3 + (seed % 200) / 100) * 100) / 100;
    return { duprId, rating, singlesRating: rating, doublesRating: rating };
  }

  const res = await fetch(`${DUPR_API_BASE}/player/v1/${encodeURIComponent(duprId)}`, {
    headers: {
      Authorization: `Bearer ${process.env.DUPR_API_KEY}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`DUPR API error (${res.status})`);
  }

  const data = (await res.json()) as {
    id?: string;
    rating?: number;
    singlesRating?: number;
    doublesRating?: number;
  };

  const rating = Number(data.rating ?? data.singlesRating ?? 0);
  if (!rating || rating < 1 || rating > 8) {
    throw new Error("Invalid rating returned from DUPR");
  }

  return {
    duprId: data.id ?? duprId,
    rating,
    singlesRating: data.singlesRating,
    doublesRating: data.doublesRating,
  };
}
