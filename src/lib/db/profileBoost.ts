import { authFetch } from "@/lib/auth/clientFetch";
import { isSupabaseConfigured } from "@/lib/auth/isSupabaseConfigured";
import { createClient } from "@/lib/supabase";
import {
  getMockProfileBoostState,
  activateMockPaidBoost,
} from "@/lib/mock/paymentMockData";
import type { ProfileBoostState } from "@/types/profileBoost";

export type ProfileBoostResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

const EMPTY_STATUS: ProfileBoostState = {
  active: false,
  status: "none",
  daysRemaining: 0,
  expiresAt: null,
  boostType: null,
};

function ok<T>(data: T): ProfileBoostResult<T> {
  return { data, error: null };
}

function fail(message: string): ProfileBoostResult<never> {
  return { data: null, error: message };
}

function parseBoostStatus(data: unknown): ProfileBoostState {
  const payload = data as Record<string, unknown> | null;
  if (!payload) return EMPTY_STATUS;

  const status = payload.status as ProfileBoostState["status"];
  const validStatuses = ["free", "paid", "expired", "none"] as const;

  return {
    active: Boolean(payload.active),
    status: validStatuses.includes(status) ? status : "none",
    daysRemaining: Number(payload.daysRemaining ?? 0),
    expiresAt: (payload.expiresAt as string | null) ?? null,
    boostType: (payload.boostType as ProfileBoostState["boostType"]) ?? null,
  };
}

export async function fetchMyProfileBoostStatus(): Promise<
  ProfileBoostResult<ProfileBoostState>
> {
  if (!isSupabaseConfigured()) {
    return ok(EMPTY_STATUS);
  }

  try {
    const response = await authFetch("/api/profile/boost/status");
    const payload = (await response.json().catch(() => null)) as
      | ProfileBoostState
      | { error?: string }
      | null;

    if (!response.ok) {
      const err = payload as { error?: string } | null;
      return fail(err?.error ?? "Could not load boost status");
    }

    return ok(parseBoostStatus(payload));
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Could not load boost status");
  }
}

export async function activatePaidProfileBoost(): Promise<
  ProfileBoostResult<ProfileBoostState>
> {
  if (!isSupabaseConfigured()) {
    return fail("Supabase is not configured");
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("activate_paid_profile_boost");

    if (error) {
      return fail(error.message);
    }

    return ok(parseBoostStatus(data));
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Could not activate boost");
  }
}

/** Mock-mode helpers used by discover + profile hooks. */
export function getMockBoostState(userId: string): ProfileBoostState {
  return getMockProfileBoostState(userId);
}

export function activateMockPaidProfileBoost(userId: string): ProfileBoostState {
  return activateMockPaidBoost(userId);
}
