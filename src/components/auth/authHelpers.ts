import type { User } from "@supabase/supabase-js";
import { avatarUrl, generateId } from "@/lib/utils";
import { STARTING_RATING } from "@/lib/ratings/computePlayerRating";
import type {
  DemoCredential,
  Profile,
  SkillLevel,
  UserRole,
} from "@/types/player";

export function buildDemoProfile(
  cred: DemoCredential,
  overrides?: Partial<Pick<Profile, "fullName" | "city" | "skillLevel">>
): Profile {
  const skillLevel = overrides?.skillLevel ?? "3.0";
  const rating = STARTING_RATING;
  return {
    id: generateId(),
    fullName: overrides?.fullName ?? cred.label,
    avatarUrl: avatarUrl(cred.email),
    city: overrides?.city ?? "Bengaluru",
    role: cred.role,
    skillLevel,
    playerRating: rating,
    duprRating: rating,
    phone: "",
    profileComplete: true,
    createdAt: new Date().toISOString(),
  };
}

export function buildSignupProfile(
  email: string,
  fullName: string,
  role: UserRole = "player",
  city = ""
): Profile {
  const rating = STARTING_RATING;
  return {
    id: generateId(),
    fullName,
    avatarUrl: null,
    city,
    role,
    skillLevel: "3.0",
    playerRating: rating,
    duprRating: rating,
    phone: "",
    profileComplete: false,
    createdAt: new Date().toISOString(),
  };
}

export function buildMockUser(email: string, id?: string): User {
  return {
    id: id ?? generateId(),
    email,
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
  } as User;
}
