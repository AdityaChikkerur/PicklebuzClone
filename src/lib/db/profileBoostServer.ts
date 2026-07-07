import type { SupabaseClient } from "@supabase/supabase-js";
import { PAID_BOOST_DAYS } from "@/lib/monetization/profileBoost";
import type { ProfileBoostState } from "@/types/profileBoost";

const EMPTY_STATUS: ProfileBoostState = {
  active: false,
  status: "none",
  daysRemaining: 0,
  expiresAt: null,
  boostType: null,
};

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

export async function fetchMyProfileBoostStatusFromDb(
  supabase: SupabaseClient
): Promise<ProfileBoostState | null> {
  const { data, error } = await supabase.rpc("get_my_profile_boost_status");

  if (error) return null;
  return parseBoostStatus(data);
}

/** Activate paid boost for the authenticated user. */
export async function activatePaidProfileBoostForUser(
  supabase: SupabaseClient
): Promise<ProfileBoostState | null> {
  const { data, error } = await supabase.rpc("activate_paid_profile_boost");

  if (error) return null;
  return parseBoostStatus(data);
}

/** Activate paid boost for a specific user (webhook / service role). */
export async function activatePaidProfileBoostForUserId(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  await supabase.rpc("activate_paid_profile_boost_for_user", {
    p_user_id: userId,
    p_days: PAID_BOOST_DAYS,
  });
}
