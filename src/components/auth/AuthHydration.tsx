"use client";

import { useEffect } from "react";
import { readPersistedDemoAuth } from "@/lib/auth/persistDemoAuth";
import { hydrateSupabaseSession } from "@/lib/auth/hydrateSession";
import { isSupabaseConfigured } from "@/lib/auth/isSupabaseConfigured";
import { useAuthStore } from "@/store/authStore";

/** Restores auth from sessionStorage (demo) or Supabase session (real). */
export function AuthHydration() {
  const setUser = useAuthStore((s) => s.setUser);
  const setProfile = useAuthStore((s) => s.setProfile);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const persisted = readPersistedDemoAuth();
      if (persisted) {
        setUser(persisted.user);
        setProfile(persisted.profile);
        setLoading(false);
        return;
      }

      if (isSupabaseConfigured()) {
        const session = await hydrateSupabaseSession();
        if (cancelled) return;

        if (session) {
          setUser(session.user);
          setProfile(session.profile);
        }
      }

      if (!cancelled) setLoading(false);
    }

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [setUser, setProfile, setLoading]);

  return null;
}
