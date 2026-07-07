/** Free boost duration for new users (days). */
export const FREE_BOOST_DAYS = 15;

/** Paid boost plan duration (days). */
export const PAID_BOOST_DAYS = 30;

/** Notify users this many days before boost expiry. */
export const BOOST_EXPIRY_NOTIFY_DAYS = 3;

export type BoostTier = "paid" | "free" | "none";

export interface BoostSortablePlayer {
  id: string;
  boostType?: "free" | "paid" | null;
  boostExpiresAt?: string | null;
  adminBoosted?: boolean;
}

export function isBoostExpired(expiresAt?: string | null): boolean {
  if (!expiresAt) return true;
  return new Date(expiresAt).getTime() <= Date.now();
}

export function isPaidBoostActive(player: BoostSortablePlayer): boolean {
  if (player.adminBoosted) return true;
  return (
    player.boostType === "paid" &&
    !isBoostExpired(player.boostExpiresAt)
  );
}

export function isFreeBoostActive(player: BoostSortablePlayer): boolean {
  if (isPaidBoostActive(player)) return false;
  return (
    player.boostType === "free" &&
    !isBoostExpired(player.boostExpiresAt)
  );
}

export function isAnyBoostActive(player: BoostSortablePlayer): boolean {
  return isPaidBoostActive(player) || isFreeBoostActive(player);
}

/** Fisher–Yates shuffle (returns a new array). */
export function shuffle<T>(items: T[], random: () => number = Math.random): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Rank Discover players:
 * 1. Paid boosted (shuffled among themselves)
 * 2. Free boosted (shuffled among themselves)
 * 3. Normal users in existing order (not shuffled)
 */
export function rankDiscoveryPlayers<T extends BoostSortablePlayer>(
  players: T[],
  random: () => number = Math.random
): T[] {
  const paidBoosted: T[] = [];
  const freeBoosted: T[] = [];
  const regular: T[] = [];

  for (const player of players) {
    if (isPaidBoostActive(player)) paidBoosted.push(player);
    else if (isFreeBoostActive(player)) freeBoosted.push(player);
    else regular.push(player);
  }

  return [
    ...shuffle(paidBoosted, random),
    ...shuffle(freeBoosted, random),
    ...regular,
  ];
}
