"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { performSignOut } from "@/lib/auth/signOutClient";
import { useAuthStore } from "@/store/authStore";

export function useSignOut() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [pending, setPending] = useState(false);

  const signOut = useCallback(async () => {
    if (pending) return;
    setPending(true);

    try {
      await performSignOut();
      clearAuth();
      window.location.assign("/auth");
    } catch {
      toast.error("Could not sign out. Please try again.");
      setPending(false);
    }
  }, [clearAuth, pending]);

  return { signOut, pending };
}
