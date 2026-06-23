import { createClient } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/auth/isSupabaseConfigured";
import type { Profile } from "@/types/player";
import type { User } from "@supabase/supabase-js";

function mapProfile(row: {
  id: string;
  full_name: string;
  avatar_url: string | null;
  city: string;
  role: Profile["role"];
  skill_level: Profile["skillLevel"];
  dupr_rating: number;
  created_at: string;
}): Profile {
  return {
    id: row.id,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    city: row.city,
    role: row.role,
    skillLevel: row.skill_level,
    duprRating: Number(row.dupr_rating),
    createdAt: row.created_at,
  };
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

  const { data: profileData, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profileData) return null;

  return { user, profile: mapProfile(profileData) };
}
