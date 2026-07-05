export type RateLimitTier =
  | "auth"
  | "payments"
  | "webhook"
  | "profile"
  | "dupr"
  | "default";

/** First matching prefix wins — order from most specific to least. */
const TIER_PREFIXES: { prefix: string; tier: RateLimitTier }[] = [
  { prefix: "/api/payments/razorpay/webhook", tier: "webhook" },
  { prefix: "/api/payments/", tier: "payments" },
  { prefix: "/api/auth/", tier: "auth" },
  { prefix: "/api/profile/", tier: "profile" },
  { prefix: "/api/dupr/", tier: "dupr" },
];

export function resolveRateLimitTier(pathname: string): RateLimitTier {
  for (const { prefix, tier } of TIER_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(prefix)) {
      return tier;
    }
  }

  if (pathname.startsWith("/api/")) return "default";
  return "default";
}
