import { Capacitor } from "@capacitor/core";
import type { SupabaseClient } from "@supabase/supabase-js";
import { authFetch } from "@/lib/auth/clientFetch";
import { createClient } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/auth/isSupabaseConfigured";
import {
  formatDbError,
  PHONE_ALREADY_REGISTERED_MESSAGE,
} from "@/lib/db/formatDbError";
import { computePlayerRating } from "@/lib/ratings/computePlayerRating";
import { fetchPlayerRankingSummary } from "@/lib/db/playerStats";
import { mapDbProfile, type DbProfileRow } from "@/lib/db/profileMapper";
import type { Profile, UserRole } from "@/types/player";

const AVATAR_BUCKET = "avatars";
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const ONBOARDING_ROLES: UserRole[] = [
  "player",
  "organizer",
  "referee",
  "club_owner",
];

export type ProfileResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

function ok<T>(data: T): ProfileResult<T> {
  return { data, error: null };
}

function fail(error: unknown): ProfileResult<never> {
  return {
    data: null,
    error: formatProfileError(error),
  };
}

function formatProfileError(error: unknown): string {
  return formatDbError(error, "Something went wrong");
}

function avatarExtension(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

function validateAvatarFile(file: File): ProfileResult<true> {
  if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
    return fail("Use a JPG, PNG, or WebP image");
  }

  if (file.size > MAX_AVATAR_BYTES) {
    return fail("Image must be 5 MB or smaller");
  }

  return ok(true);
}

/** Upload avatar using an authenticated Supabase client (browser or server). */
export async function uploadProfileAvatarWithClient(
  supabase: SupabaseClient,
  userId: string,
  file: File
): Promise<ProfileResult<string>> {
  const valid = validateAvatarFile(file);
  if (valid.error) {
    return fail(valid.error);
  }

  try {
    const ext = avatarExtension(file.type);
    const path = `${userId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from(AVATAR_BUCKET)
      .getPublicUrl(path);

    const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;
    return ok(publicUrl);
  } catch (e) {
    return fail(e);
  }
}

export async function uploadProfileAvatar(
  userId: string,
  file: File
): Promise<ProfileResult<string>> {
  if (!isSupabaseConfigured()) {
    return fail("Supabase is not configured");
  }

  return uploadProfileAvatarWithClient(createClient(), userId, file);
}

export interface CompleteProfileInput {
  userId: string;
  phone: string;
  city: string;
  role: UserRole;
  avatarFile?: File;
  existingAvatarUrl?: string;
  fullName?: string;
}

async function assertPhoneAvailable(
  supabase: SupabaseClient,
  userId: string,
  phone: string
): Promise<ProfileResult<true>> {
  const { data, error } = await supabase.rpc("lookup_profile_by_phone", {
    p_phone: phone,
  });

  if (error) throw error;

  const row = (Array.isArray(data) ? data[0] : data) as
    | { id: string }
    | null
    | undefined;

  if (row?.id && row.id !== userId) {
    return fail(PHONE_ALREADY_REGISTERED_MESSAGE);
  }

  return ok(true);
}

export async function applyProfileCompletion(
  supabase: SupabaseClient,
  input: CompleteProfileInput,
  avatarUrl: string
): Promise<ProfileResult<DbProfileRow>> {
  if (!ONBOARDING_ROLES.includes(input.role)) {
    return fail("Invalid role selected");
  }

  try {
    const phoneCheck = await assertPhoneAvailable(
      supabase,
      input.userId,
      input.phone
    );
    if (phoneCheck.error) {
      return fail(phoneCheck.error);
    }

    const updateRow: Record<string, unknown> = {
      phone: input.phone.trim(),
      city: input.city.trim(),
      role: input.role,
      avatar_url: avatarUrl,
      profile_complete: true,
    };

    if (input.fullName?.trim()) {
      updateRow.full_name = input.fullName.trim();
    }

    const { data, error } = await supabase
      .from("profiles")
      .update(updateRow)
      .eq("id", input.userId)
      .select("*")
      .single();

    if (error) throw error;

    return ok(data as DbProfileRow);
  } catch (e) {
    return fail(e);
  }
}

async function resolveAvatarUrlForCompletion(
  supabase: SupabaseClient,
  input: CompleteProfileInput
): Promise<ProfileResult<string>> {
  if (input.avatarFile) {
    return uploadProfileAvatarWithClient(supabase, input.userId, input.avatarFile);
  }

  const existing = input.existingAvatarUrl?.trim();
  if (existing) {
    return ok(existing);
  }

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", input.userId)
    .maybeSingle();

  const stored = profileRow?.avatar_url?.trim();
  if (stored) {
    return ok(stored);
  }

  return fail("Profile photo is required");
}

async function completePlayerProfileDirect(
  input: CompleteProfileInput
): Promise<ProfileResult<Profile>> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== input.userId) {
    return fail("Your session expired. Please sign in again.");
  }

  const uploaded = await resolveAvatarUrlForCompletion(supabase, input);

  if (uploaded.error || !uploaded.data) {
    return fail(uploaded.error ?? "Could not upload photo");
  }

  const completed = await applyProfileCompletion(supabase, input, uploaded.data);

  if (completed.error || !completed.data) {
    return fail(completed.error ?? "Could not save profile");
  }

  return ok(mapDbProfile(completed.data));
}

/** Saves onboarding — direct Supabase on native; API route on web. */
export async function completePlayerProfile(
  input: CompleteProfileInput
): Promise<ProfileResult<Profile>> {
  if (!isSupabaseConfigured()) {
    return fail("Supabase is not configured");
  }

  if (!ONBOARDING_ROLES.includes(input.role)) {
    return fail("Invalid role selected");
  }

  if (typeof window !== "undefined" && Capacitor.isNativePlatform()) {
    try {
      return await completePlayerProfileDirect(input);
    } catch (e) {
      return fail(e);
    }
  }

  try {
    const formData = new FormData();
    if (input.avatarFile) {
      formData.append("avatar", input.avatarFile);
    } else if (input.existingAvatarUrl?.trim()) {
      formData.append("existingAvatarUrl", input.existingAvatarUrl.trim());
    }
    formData.append("phone", input.phone);
    formData.append("city", input.city);
    formData.append("role", input.role);
    if (input.fullName?.trim()) {
      formData.append("fullName", input.fullName.trim());
    }

    const response = await authFetch("/api/profile/complete", {
      method: "POST",
      body: formData,
    });

    const payload = (await response.json().catch(() => null)) as
      | { profile?: DbProfileRow; error?: string }
      | null;

    if (!response.ok) {
      return fail(payload?.error ?? "Could not save profile");
    }

    if (!payload?.profile) {
      return fail("Could not save profile");
    }

    return ok(mapDbProfile(payload.profile));
  } catch (e) {
    return fail(e);
  }
}

const MIN_FULL_NAME_LENGTH = 2;
const MAX_FULL_NAME_LENGTH = 80;

function validateFullName(fullName: string): ProfileResult<string> {
  const trimmed = fullName.trim();

  if (trimmed.length < MIN_FULL_NAME_LENGTH) {
    return fail("Name must be at least 2 characters");
  }

  if (trimmed.length > MAX_FULL_NAME_LENGTH) {
    return fail("Name must be 80 characters or fewer");
  }

  return ok(trimmed);
}

async function updateProfileFullNameDirect(
  userId: string,
  fullName: string
): Promise<ProfileResult<Profile>> {
  const valid = validateFullName(fullName);
  if (valid.error || !valid.data) {
    return fail(valid.error ?? "Invalid name");
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== userId) {
    return fail("Your session expired. Please sign in again.");
  }

  try {
    const { data, error } = await supabase
      .from("profiles")
      .update({ full_name: valid.data })
      .eq("id", userId)
      .select("*")
      .single();

    if (error) throw error;
    return ok(mapDbProfile(data as DbProfileRow));
  } catch (e) {
    return fail(e);
  }
}

async function updateProfileAvatarDirect(
  userId: string,
  file: File
): Promise<ProfileResult<Profile>> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== userId) {
    return fail("Your session expired. Please sign in again.");
  }

  const uploaded = await uploadProfileAvatarWithClient(supabase, userId, file);

  if (uploaded.error || !uploaded.data) {
    return fail(uploaded.error ?? "Could not upload photo");
  }

  try {
    const { data, error } = await supabase
      .from("profiles")
      .update({ avatar_url: uploaded.data })
      .eq("id", userId)
      .select("*")
      .single();

    if (error) throw error;
    return ok(mapDbProfile(data as DbProfileRow));
  } catch (e) {
    return fail(e);
  }
}

/** Updates profile photo — direct Supabase on native; API route on web. */
export async function updateProfileAvatar(
  userId: string,
  file: File
): Promise<ProfileResult<Profile>> {
  if (!isSupabaseConfigured()) {
    return fail("Supabase is not configured");
  }

  const valid = validateAvatarFile(file);
  if (valid.error) {
    return fail(valid.error);
  }

  if (typeof window !== "undefined" && Capacitor.isNativePlatform()) {
    try {
      return await updateProfileAvatarDirect(userId, file);
    } catch (e) {
      return fail(e);
    }
  }

  try {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await authFetch("/api/profile/avatar", {
      method: "POST",
      body: formData,
    });

    const payload = (await response.json().catch(() => null)) as
      | { profile?: DbProfileRow; error?: string }
      | null;

    if (!response.ok) {
      return fail(payload?.error ?? "Could not update photo");
    }

    if (!payload?.profile) {
      return fail("Could not update photo");
    }

    return ok(mapDbProfile(payload.profile));
  } catch (e) {
    return fail(e);
  }
}

/** Updates display name — direct Supabase on native; API route on web. */
export async function updateProfileFullName(
  userId: string,
  fullName: string
): Promise<ProfileResult<Profile>> {
  if (!isSupabaseConfigured()) {
    return fail("Supabase is not configured");
  }

  const valid = validateFullName(fullName);
  if (valid.error || !valid.data) {
    return fail(valid.error ?? "Invalid name");
  }

  if (typeof window !== "undefined" && Capacitor.isNativePlatform()) {
    try {
      return await updateProfileFullNameDirect(userId, valid.data);
    } catch (e) {
      return fail(e);
    }
  }

  try {
    const response = await authFetch("/api/profile/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName: valid.data }),
    });

    const payload = (await response.json().catch(() => null)) as
      | { profile?: DbProfileRow; error?: string }
      | null;

    if (!response.ok) {
      return fail(payload?.error ?? "Could not update name");
    }

    if (!payload?.profile) {
      return fail("Could not update name");
    }

    return ok(mapDbProfile(payload.profile));
  } catch (e) {
    return fail(e);
  }
}

export async function fetchProfileById(
  userId: string
): Promise<ProfileResult<Profile>> {
  if (!isSupabaseConfigured()) {
    return fail("Supabase is not configured");
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return ok(mapDbProfile(data as DbProfileRow));
  } catch (e) {
    return fail(e);
  }
}

/** Recalculate PickleBuzz rating from verified match history. */
export async function recalculatePlayerRating(
  playerId: string,
  supabaseClient?: SupabaseClient
): Promise<ProfileResult<number>> {
  if (!isSupabaseConfigured()) {
    return fail("Supabase is not configured");
  }

  try {
    const summary = await fetchPlayerRankingSummary(playerId, supabaseClient);
    const wins = summary?.wins ?? 0;
    const losses = summary?.losses ?? 0;
    const rating = computePlayerRating(wins, losses);

    const supabase = supabaseClient ?? createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ dupr_rating: rating })
      .eq("id", playerId);

    if (error) throw error;
    return ok(rating);
  } catch (e) {
    return fail(e);
  }
}

export async function updateRatingsForMatch(
  matchId: string,
  supabaseClient?: SupabaseClient
): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const supabase = supabaseClient ?? createClient();

  const { data: eligible } = await supabase.rpc("match_is_rating_eligible", {
    p_match_id: matchId,
  });
  if (!eligible) return;

  const { data: players } = await supabase
    .from("match_players")
    .select("player_id")
    .eq("match_id", matchId);

  if (!players?.length) return;

  const uniqueIds = [
    ...new Set(
      players
        .map((row) => row.player_id as string | null)
        .filter((id): id is string => Boolean(id))
    ),
  ];
  await Promise.all(uniqueIds.map((id) => recalculatePlayerRating(id, supabase)));
}
