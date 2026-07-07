"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  activateMockPaidProfileBoost,
  activatePaidProfileBoost,
  fetchMyProfileBoostStatus,
} from "@/lib/db/profileBoost";
import { isSupabaseConfigured } from "@/lib/auth/isSupabaseConfigured";
import { authFetch } from "@/lib/auth/clientFetch";
import {
  grantMockFreeBoostIfNeeded,
  getMockProfileBoostState,
} from "@/lib/mock/paymentMockData";
import { maybeSendBoostExpiryNotification } from "@/lib/profileBoost/expiryNotifications";
import { isRazorpayConfigured } from "@/lib/payments/isRazorpayConfigured";
import { PRICING } from "@/lib/monetization/pricing";
import { PAID_BOOST_DAYS } from "@/lib/monetization/profileBoost";
import { useRazorpayCheckout } from "@/hooks/useRazorpayCheckout";
import type { ProfileBoostState } from "@/types/profileBoost";

const EMPTY_STATUS: ProfileBoostState = {
  active: false,
  status: "none",
  daysRemaining: 0,
  expiresAt: null,
  boostType: null,
};

export function useProfileBoost(userId: string | undefined) {
  const [boostStatus, setBoostStatus] = useState<ProfileBoostState>(EMPTY_STATUS);
  const [loading, setLoading] = useState(true);
  const { paying, startCheckout } = useRazorpayCheckout();

  const refreshStatus = useCallback(async () => {
    if (!userId) {
      setBoostStatus(EMPTY_STATUS);
      setLoading(false);
      return;
    }

    if (!isSupabaseConfigured()) {
      const status = grantMockFreeBoostIfNeeded(userId);
      setBoostStatus(status);
      await maybeSendBoostExpiryNotification(userId, status);
      setLoading(false);
      return;
    }

    setLoading(true);
    const result = await fetchMyProfileBoostStatus();
    const status = result.data ?? EMPTY_STATUS;
    setBoostStatus(status);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  const purchaseBoost = useCallback(async () => {
    if (!userId) {
      toast.error("Sign in to boost your profile");
      return false;
    }

    try {
      if (!isSupabaseConfigured()) {
        const status = activateMockPaidProfileBoost(userId);
        setBoostStatus(status);
        toast.success(`Paid boost activated for ${PAID_BOOST_DAYS} days!`);
        return true;
      }

      if (isRazorpayConfigured()) {
        const paid = await startCheckout({
          kind: "profile_boost",
          amount: PRICING.profileBoost,
          description: "1 Month Profile Boost",
        });

        if (!paid) return false;

        await refreshStatus();
        toast.success(`Profile boost activated for ${PAID_BOOST_DAYS} days!`);
        return true;
      }

      const response = await authFetch("/api/profile/boost/activate", {
        method: "POST",
      });
      const payload = (await response.json().catch(() => null)) as
        | ProfileBoostState
        | { error?: string }
        | null;

      if (!response.ok) {
        toast.error(
          (payload as { error?: string } | null)?.error ??
            "Could not activate boost"
        );
        return false;
      }

      const status = payload as ProfileBoostState;
      setBoostStatus(status);
      toast.success(`Profile boost activated for ${PAID_BOOST_DAYS} days!`);
      return true;
    } catch {
      toast.error("Could not activate boost");
      return false;
    }
  }, [userId, refreshStatus, startCheckout]);

  const renewBoost = purchaseBoost;

  return {
    boostStatus,
    boosted: boostStatus.active,
    loading: loading || paying,
    purchaseBoost,
    renewBoost,
    refreshStatus,
  };
}

export function getBoostStatusLabel(status: ProfileBoostState): string {
  if (status.status === "free") return "Free Boost Active";
  if (status.status === "paid") return "Paid Boost Active";
  if (status.status === "expired") return "Boost Expired";
  return "No Active Boost";
}

/** For mock-only direct status read without hook side effects. */
export function readMockBoostStatus(userId: string): ProfileBoostState {
  return getMockProfileBoostState(userId);
}

/** @deprecated Use activatePaidProfileBoost via purchaseBoost */
export { activatePaidProfileBoost };
