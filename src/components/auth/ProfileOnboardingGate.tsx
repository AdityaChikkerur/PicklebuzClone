"use client";

import { isSupabaseConfigured } from "@/lib/auth/isSupabaseConfigured";
import { useAuthStore } from "@/store/authStore";
import { ProfileOnboardingModal } from "./ProfileOnboardingModal";

/** Blocks the app until phone, city, and avatar are saved to Supabase. */
export function ProfileOnboardingGate() {
  const loading = useAuthStore((s) => s.loading);
  const connectionError = useAuthStore((s) => s.connectionError);
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);

  if (!isSupabaseConfigured() || loading || !user || !profile || connectionError) {
    return null;
  }

  if (profile.profileComplete) {
    return null;
  }

  return <ProfileOnboardingModal />;
}
