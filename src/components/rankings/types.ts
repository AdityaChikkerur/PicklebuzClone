import type { RankedPlayer } from "@/types/player";

export type RankingCategory = "singles" | "doubles" | "winpct" | "streaks" | "strength";

export interface LeaderboardPlayer extends RankedPlayer {
  singlesRating: number;
  doublesRating: number;
  strengthRating: number;
}

export interface RankingsFilters {
  search: string;
  city: string;
  skillLevel: string;
}

export const RANKING_CATEGORY_LABELS: Record<RankingCategory, string> = {
  singles: "Singles",
  doubles: "Doubles",
  winpct: "Win %",
  streaks: "Streaks",
  strength: "Strength",
};
