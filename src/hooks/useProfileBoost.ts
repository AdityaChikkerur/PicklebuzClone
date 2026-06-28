"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { createPaymentPlaceholder } from "@/lib/db/payments";
import { PRICING } from "@/lib/monetization/pricing";
import {
  isProfileBoosted,
  setProfileBoosted,
} from "@/lib/mock/paymentMockData";

export function useProfileBoost(userId: string | undefined) {
  const [boosted, setBoosted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setBoosted(false);
      setLoading(false);
      return;
    }
    setBoosted(isProfileBoosted(userId));
    setLoading(false);
  }, [userId]);

  const purchaseBoost = useCallback(async () => {
    if (!userId) {
      toast.error("Sign in to boost your profile");
      return false;
    }

    try {
      await createPaymentPlaceholder({
        userId,
        kind: "profile_boost",
        amount: PRICING.profileBoost,
        status: "pending",
      });
      setProfileBoosted(userId, true);
      setBoosted(true);
      toast.success("Profile boost activated. First month is free!");
      return true;
    } catch {
      toast.error("Could not activate boost");
      return false;
    }
  }, [userId]);

  return { boosted, loading, purchaseBoost };
}
