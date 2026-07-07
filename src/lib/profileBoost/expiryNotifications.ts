import { createNotification } from "@/lib/db/notifications";
import { isSupabaseConfigured } from "@/lib/auth/isSupabaseConfigured";
import { createClient } from "@/lib/supabase";
import {
  BOOST_EXPIRY_NOTIFY_DAYS,
} from "@/lib/monetization/profileBoost";
import { pushMockNotification } from "@/lib/notifications/mockNotifications";
import {
  markMockBoostExpiryNotified,
  shouldMockNotifyExpiry,
} from "@/lib/mock/paymentMockData";
import type { ProfileBoostState } from "@/types/profileBoost";

const PAID_MESSAGE =
  "Your Profile Boost will expire soon. Renew now to continue appearing at the top of Discover.";

const FREE_MESSAGE =
  "Your free Profile Boost is ending soon. Upgrade to a 1-month boost to keep appearing at the top of Discover.";

export async function maybeSendBoostExpiryNotification(
  userId: string,
  status: ProfileBoostState
): Promise<void> {
  if (
    !status.active ||
    status.status === "none" ||
    status.status === "expired" ||
    status.daysRemaining > BOOST_EXPIRY_NOTIFY_DAYS ||
    status.daysRemaining <= 0
  ) {
    return;
  }

  if (!isSupabaseConfigured()) {
    if (!shouldMockNotifyExpiry(userId)) return;

    pushMockNotification({
      userId,
      icon: "profile_boost",
      text: status.status === "free" ? FREE_MESSAGE : PAID_MESSAGE,
      link: "/profile",
    });
    markMockBoostExpiryNotified(userId);
    return;
  }

  const supabase = createClient();

  const { data: row } = await supabase
    .from("profile_boosts")
    .select("expiry_notified_at, expires_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (!row || row.expiry_notified_at) return;

  const expiresAt = row.expires_at as string | null;
  if (!expiresAt || new Date(expiresAt).getTime() <= Date.now()) return;

  const text = status.status === "free" ? FREE_MESSAGE : PAID_MESSAGE;

  await createNotification({
    userId,
    icon: "profile_boost",
    text,
    link: "/profile",
  });

  await supabase.rpc("mark_profile_boost_expiry_notified");
}
