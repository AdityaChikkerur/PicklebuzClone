import type { User } from "@supabase/supabase-js";
import { DEMO_AUTH_STORAGE_KEY } from "@/lib/auth/demoSession";
import type { Profile } from "@/types/player";

export function persistDemoAuth(user: User, profile: Profile): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(
    DEMO_AUTH_STORAGE_KEY,
    JSON.stringify({ user, profile })
  );
}

export function readPersistedDemoAuth(): {
  user: User;
  profile: Profile;
} | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(DEMO_AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as { user: User; profile: Profile };
  } catch {
    return null;
  }
}

export function clearPersistedDemoAuth(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(DEMO_AUTH_STORAGE_KEY);
}
