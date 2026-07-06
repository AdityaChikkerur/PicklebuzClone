import { describe, expect, it } from "vitest";
import { resolveRateLimitTier } from "@/lib/rateLimit/tiers";

describe("resolveRateLimitTier", () => {
  it("uses webhook tier for Razorpay webhooks", () => {
    expect(resolveRateLimitTier("/api/payments/razorpay/webhook")).toBe(
      "webhook"
    );
  });

  it("uses payments tier for payment routes", () => {
    expect(resolveRateLimitTier("/api/payments/razorpay/create-order")).toBe(
      "payments"
    );
    expect(resolveRateLimitTier("/api/payments/razorpay/verify")).toBe(
      "payments"
    );
  });

  it("uses auth tier for auth routes", () => {
    expect(resolveRateLimitTier("/api/auth/demo-session")).toBe("auth");
    expect(resolveRateLimitTier("/api/auth/sign-out")).toBe("auth");
  });

  it("uses profile and dupr tiers", () => {
    expect(resolveRateLimitTier("/api/profile/complete")).toBe("profile");
    expect(resolveRateLimitTier("/api/dupr/sync")).toBe("dupr");
  });

  it("falls back to default for other api paths", () => {
    expect(resolveRateLimitTier("/api/unknown")).toBe("default");
  });
});
