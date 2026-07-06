import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/auth/isSupabaseConfigured";
import { mapDbProfile, type DbProfileRow } from "@/lib/db/profileMapper";
import type { Profile } from "@/types/player";

function userMetadata(user: User): Record<string, unknown> {
  return (user.user_metadata ?? {}) as Record<string, unknown>;
}

function metadataString(meta: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = meta[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

/** Minimal profile so sign-in works even if the DB row is temporarily unavailable. */
export function buildFallbackProfile(user: User): Profile {
  const meta = userMetadata(user);

  return {
    id: user.id,
    fullName:
      metadataString(meta, "full_name", "name") ||
      user.email?.split("@")[0] ||
      "Player",
    avatarUrl: metadataString(meta, "picture", "avatar_url") || null,
    city: metadataString(meta, "city"),
    role: "player",
    skillLevel: "3.0",
    playerRating: 3,
    duprRating: 3,
    phone: "",
    profileComplete: false,
    createdAt: user.created_at ?? new Date().toISOString(),
  };
}

/** Load profile row or create one from auth metadata when missing. */
export async function fetchOrEnsureProfile(
  supabase: SupabaseClient,
  user: User
): Promise<Profile> {
  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (profileData) {
    return mapDbProfile(profileData as DbProfileRow);
  }

  const meta = userMetadata(user);
  const fullName =
    metadataString(meta, "full_name", "name") ||
    user.email?.split("@")[0] ||
    "";
  const avatarUrl =
    metadataString(meta, "picture", "avatar_url") || null;

  const { data: created } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      full_name: fullName,
      avatar_url: avatarUrl,
      city: metadataString(meta, "city"),
      role: "player",
    })
    .select("*")
    .maybeSingle();

  if (created) {
    return mapDbProfile(created as DbProfileRow);
  }

  const { data: retry } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (retry) {
    return mapDbProfile(retry as DbProfileRow);
  }

  return buildFallbackProfile(user);
}

export async function hydrateSupabaseSession(): Promise<{
  user: User;
  profile: Profile;
} | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = createClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) return null;

  const profile = await fetchOrEnsureProfile(supabase, user);
  return { user, profile };
}
