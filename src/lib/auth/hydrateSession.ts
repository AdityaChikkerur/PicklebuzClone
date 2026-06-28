import { createClient } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/auth/isSupabaseConfigured";
import { mapDbProfile, type DbProfileRow } from "@/lib/db/profileMapper";
import type { Profile } from "@/types/player";
import type { User } from "@supabase/supabase-js";

export async function hydrateSupabaseSession(): Promise<{
  user: User;
  profile: Profile;
} | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = createClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) return null;

  const { data: profileData, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profileData) return null;

  return { user, profile: mapDbProfile(profileData as DbProfileRow) };
}
