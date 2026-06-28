import { clearDemoSession } from "@/lib/auth/demoSession";
import { clearPersistedDemoAuth } from "@/lib/auth/persistDemoAuth";
import { createClient } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/auth/isSupabaseConfigured";

/** Ends Supabase + demo sessions and clears persisted client auth state. */
export async function performSignOut(): Promise<void> {
  await fetch("/api/auth/sign-out", {
    method: "POST",
    credentials: "same-origin",
  });

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Demo-only or network edge case — still clear local state below.
    }
  }

  clearDemoSession();
  clearPersistedDemoAuth();
}
