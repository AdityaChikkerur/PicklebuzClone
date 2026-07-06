import type { LeaderboardPlayer, RankingCategory } from "./types";

export function getPrimaryStat(
  player: LeaderboardPlayer,
  category: RankingCategory
): number {
  switch (category) {
    case "singles":
      return player.singlesRating;
    case "doubles":
      return player.doublesRating;
    case "winpct":
      return player.winPct;
    case "streaks":
      return player.currentStreak;
    case "strength":
      return player.strengthRating;
  }
}

export function formatPrimaryStat(
  player: LeaderboardPlayer,
  category: RankingCategory
): string {
  const value = getPrimaryStat(player, category);
  if (category === "winpct") return `${value}%`;
  if (category === "streaks") return String(value);
  if (category === "strength") return value.toFixed(2);
  return value.toFixed(2);
}

export function getPrimaryStatLabel(category: RankingCategory): string {
  switch (category) {
    case "singles":
      return "Singles";
    case "doubles":
      return "Doubles";
    case "winpct":
      return "Win %";
    case "streaks":
      return "Streak";
    case "strength":
      return "Strength";
  }
}

export function rankPlayers(
  players: LeaderboardPlayer[],
  category: RankingCategory
): LeaderboardPlayer[] {
  const sorted = [...players].sort((a, b) => {
    const primaryDiff = getPrimaryStat(b, category) - getPrimaryStat(a, category);
    if (primaryDiff !== 0) return primaryDiff;

    // Players with match history outrank same-stat players with no games.
    const matchDiff = b.wins + b.losses - (a.wins + a.losses);
    if (matchDiff !== 0) return matchDiff;

    const duprDiff = b.duprRating - a.duprRating;
    if (duprDiff !== 0) return duprDiff;

    return a.fullName.localeCompare(b.fullName);
  });

  return sorted.map((player, index) => ({
    ...player,
    rank: index + 1,
  }));
}

export function filterPlayers(
  players: LeaderboardPlayer[],
  search: string,
  city: string,
  skillLevel: string
): LeaderboardPlayer[] {
  const query = search.trim().toLowerCase();

  return players.filter((player) => {
    const matchesSearch =
      query.length === 0 || player.fullName.toLowerCase().includes(query);
    const matchesCity = city === "All" || player.city === city;
    const matchesSkill = skillLevel === "All" || player.skillLevel === skillLevel;
    return matchesSearch && matchesCity && matchesSkill;
  });
}
