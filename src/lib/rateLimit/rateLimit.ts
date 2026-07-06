import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse, type NextRequest } from "next/server";
import { isRateLimitConfigured } from "@/lib/rateLimit/isRateLimitConfigured";
import { resolveRateLimitTier, type RateLimitTier } from "@/lib/rateLimit/tiers";

type LimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

const limiters = new Map<RateLimitTier, Ratelimit>();

function getRedis(): Redis {
  return Redis.fromEnv();
}

function getLimiter(tier: RateLimitTier): Ratelimit {
  const existing = limiters.get(tier);
  if (existing) return existing;

  const redis = getRedis();

  const configs: Record<
    RateLimitTier,
    { requests: number; window: Parameters<typeof Ratelimit.slidingWindow>[1] }
  > = {
    auth: { requests: 10, window: "15 m" },
    payments: { requests: 20, window: "1 m" },
    webhook: { requests: 120, window: "1 m" },
    profile: { requests: 5, window: "1 h" },
    dupr: { requests: 10, window: "1 h" },
    default: { requests: 60, window: "1 m" },
  };

  const { requests, window } = configs[tier];
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    prefix: `pb:rl:${tier}`,
    analytics: true,
  });

  limiters.set(tier, limiter);
  return limiter;
}

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const ip = forwarded.split(",")[0]?.trim();
    if (ip) return ip;
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  return "unknown";
}

function rateLimitResponse(result: LimitResult): NextResponse {
  const retryAfter = Math.max(0, Math.ceil((result.reset - Date.now()) / 1000));

  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(result.reset),
      },
    }
  );
}

/**
 * Returns a 429 response when limited, or null when the request may proceed.
 * Skips silently when Upstash is not configured (local dev without Redis).
 */
export async function enforceApiRateLimit(
  request: NextRequest
): Promise<NextResponse | null> {
  if (!isRateLimitConfigured()) return null;

  const pathname = request.nextUrl.pathname;
  if (!pathname.startsWith("/api/")) return null;

  const tier = resolveRateLimitTier(pathname);
  const identifier = `${tier}:${getClientIp(request)}`;

  try {
    const result = await getLimiter(tier).limit(identifier);

    if (!result.success) {
      return rateLimitResponse(result);
    }

    return null;
  } catch (err) {
    console.error("[rate-limit] Upstash error — allowing request:", err);
    return null;
  }
}
