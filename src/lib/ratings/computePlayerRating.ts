/** PickleBuzz player rating (2.00–5.50). Stored in profiles.dupr_rating column. */

export const STARTING_RATING = 3.0;
export const MIN_RATING = 2.0;
export const MAX_RATING = 5.5;

export function computePlayerRating(wins: number, losses: number): number {
  const total = wins + losses;
  if (total === 0) return STARTING_RATING;

  const winRate = wins / total;
  // More verified matches → rating reflects performance more strongly.
  const confidence = 1 - Math.exp(-total / 8);
  const performanceRating = MIN_RATING + winRate * (MAX_RATING - MIN_RATING);
  const blended =
    STARTING_RATING * (1 - confidence) + performanceRating * confidence;

  return (
    Math.round(Math.min(MAX_RATING, Math.max(MIN_RATING, blended)) * 100) / 100
  );
}

export function ratingChange(previous: number, next: number): number {
  return Math.round((next - previous) * 100) / 100;
}
