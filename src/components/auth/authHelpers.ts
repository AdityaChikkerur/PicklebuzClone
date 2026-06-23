import type { User } from "@supabase/supabase-js";
import { avatarUrl, generateId } from "@/lib/utils";
import type {
  DemoCredential,
  Profile,
  SkillLevel,
  UserRole,
} from "@/types/player";

const SKILL_TO_DUPR: Record<SkillLevel, number> = {
  "2.0": 2.0,
  "2.5": 2.5,
  "3.0": 3.0,
  "3.5": 3.5,
  "4.0": 4.0,
  "4.5": 4.5,
  "5.0+": 5.0,
};

export function buildDemoProfile(
  cred: DemoCredential,
  overrides?: Partial<Pick<Profile, "fullName" | "city" | "skillLevel">>
): Profile {
  const skillLevel = overrides?.skillLevel ?? "3.5";
  return {
    id: generateId(),
    fullName: overrides?.fullName ?? cred.label,
    avatarUrl: avatarUrl(cred.email),
    city: overrides?.city ?? "Bangalore",
    role: cred.role,
    skillLevel,
    duprRating: SKILL_TO_DUPR[skillLevel],
    createdAt: new Date().toISOString(),
  };
}

export function buildSignupProfile(
  email: string,
  fullName: string,
  role: UserRole,
  skillLevel: SkillLevel,
  city: string
): Profile {
  return {
    id: generateId(),
    fullName,
    avatarUrl: avatarUrl(email),
    city,
    role,
    skillLevel,
    duprRating: SKILL_TO_DUPR[skillLevel],
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
