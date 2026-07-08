"use client";

import { useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";
import { readPersistedDemoAuth } from "@/lib/auth/persistDemoAuth";
import { formatSupabaseConnectionError } from "@/lib/auth/supabaseErrors";
import { fetchOrEnsureProfile } from "@/lib/auth/hydrateSession";
import { isSupabaseConfigured } from "@/lib/auth/isSupabaseConfigured";
import { useAuthStore } from "@/store/authStore";

/** Restores auth from sessionStorage (demo) or Supabase session (real). */
export function AuthHydration() {
  const setUser = useAuthStore((s) => s.setUser);
  const setProfile = useAuthStore((s) => s.setProfile);
  const setLoading = useAuthStore((s) => s.setLoading);
  const setConnectionError = useAuthStore((s) => s.setConnectionError);

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

    async function applySession(session: Session | null) {
      if (cancelled) return;

      if (!session?.user) {
        setUser(null);
        setProfile(null);
        setConnectionError(null);
        setLoading(false);
        return;
      }

      try {
        setConnectionError(null);
        const profile = await fetchOrEnsureProfile(supabase, session.user);
        if (cancelled) return;
        setUser(session.user);
        setProfile(profile);
      } catch (error) {
        if (cancelled) return;
        setUser(session.user);
        setProfile(null);
        setConnectionError(formatSupabaseConnectionError(
          error instanceof Error ? error.message : String(error)
        ));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    // Always hydrate from cookies/local storage on mount. Relying only on
    // onAuthStateChange can leave loading=true forever if the listener never fires.
    void supabase.auth.getSession().then(({ data: { session } }) => {
      void applySession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION") return;
      void applySession(session);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [setUser, setProfile, setLoading, setConnectionError]);

  return null;
}
