"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { readPersistedDemoAuth } from "@/lib/auth/persistDemoAuth";
import {
  buildFallbackProfile,
  fetchOrEnsureProfile,
} from "@/lib/auth/hydrateSession";
import { isSupabaseConfigured } from "@/lib/auth/isSupabaseConfigured";
import { useAuthStore } from "@/store/authStore";

/** Restores auth from sessionStorage (demo) or Supabase session (real). */
export function AuthHydration() {
  const setUser = useAuthStore((s) => s.setUser);
  const setProfile = useAuthStore((s) => s.setProfile);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      const persisted = readPersistedDemoAuth();
      if (persisted) {
        setUser(persisted.user);
        setProfile(persisted.profile);
      }
      setLoading(false);
      return;
    }

    const supabase = createClient();
    let cancelled = false;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (cancelled) return;

      if (!session?.user) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const profile = await fetchOrEnsureProfile(supabase, session.user);
        if (cancelled) return;
        setUser(session.user);
        setProfile(profile);
      } catch {
        if (cancelled) return;
        setUser(session.user);
        setProfile(buildFallbackProfile(session.user));
      } finally {
        if (!cancelled) setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [setUser, setProfile, setLoading]);

  return null;
}
