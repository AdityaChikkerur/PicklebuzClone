/** Display pricing for monetization placeholders — no real charges. */
export const PRICING = {
  premiumMonthly: 299,
  profileBoost: 99,
  featuredTournament: 499,
  platformCommissionPct: 8,
} as const;

export function computeCommission(grossAmount: number): {
  gross: number;
  commission: number;
  net: number;
} {
  const commission = Math.round(
    (grossAmount * PRICING.platformCommissionPct) / 100
  );
  return {
    gross: grossAmount,
    commission,
    net: grossAmount - commission,
  };
}
