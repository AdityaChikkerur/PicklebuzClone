import type { Profile, SkillLevel, UserRole } from "@/types/player";

export interface DbProfileRow {
  id: string;
  full_name: string;
  avatar_url: string | null;
  city: string;
  role: UserRole;
  skill_level: SkillLevel;
  dupr_rating: number;
  phone?: string | null;
  profile_complete?: boolean | null;
  dupr_id?: string | null;
  dupr_synced_at?: string | null;
  created_at: string;
}

export function mapDbProfile(row: DbProfileRow): Profile {
  const hasPhone = Boolean(row.phone?.trim());
  const hasAvatar = Boolean(row.avatar_url?.trim());
  const hasCity = Boolean(row.city?.trim());

  return {
    id: row.id,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    city: row.city,
    role: row.role,
    skillLevel: row.skill_level,
    playerRating: Number(row.dupr_rating),
    duprRating: Number(row.dupr_rating),
    phone: row.phone ?? "",
    profileComplete:
      row.profile_complete === true || (hasPhone && hasAvatar && hasCity),
    duprId: row.dupr_id ?? null,
    duprSyncedAt: row.dupr_synced_at ?? null,
    createdAt: row.created_at,
  };
}
