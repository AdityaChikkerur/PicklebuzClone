"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { createPaymentPlaceholder } from "@/lib/db/payments";
import { PRICING } from "@/lib/monetization/pricing";

const PREMIUM_KEY = "pb_premium_active";

function readPremiumIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(PREMIUM_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function writePremiumIds(ids: Set<string>): void {
  localStorage.setItem(PREMIUM_KEY, JSON.stringify([...ids]));
}

export function isPremiumActive(userId: string): boolean {
  return readPremiumIds().has(userId);
}

export function activatePremiumTrial(userId: string): void {
  const ids = readPremiumIds();
  ids.add(userId);
  writePremiumIds(ids);
}

export function usePremium(userId: string | undefined) {
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setActive(false);
      setLoading(false);
      return;
    }
    setActive(isPremiumActive(userId));
    setLoading(false);
  }, [userId]);

  const startFreeTrial = useCallback(async () => {
    if (!userId) {
      toast.error("Sign in to start your free trial");
      return false;
    }

    try {
      await createPaymentPlaceholder({
        userId,
        kind: "subscription",
        amount: 0,
        status: "paid",
      });
      activatePremiumTrial(userId);
      setActive(true);
      toast.success("Premium unlocked! First month is free.");
      return true;
    } catch {
      toast.error("Could not activate premium trial");
      return false;
    }
  }, [userId]);

  return { isPremium: active, loading, startFreeTrial, listPrice: PRICING.premiumMonthly };
}
