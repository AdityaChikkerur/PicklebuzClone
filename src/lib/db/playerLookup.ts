import { createClient } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/auth/isSupabaseConfigured";
import { normalizePhone } from "@/lib/phone/normalizePhone";
import type { Player, SkillLevel } from "@/types/player";
import type { DbResult } from "@/lib/db/matches";

const ok = <T>(data: T): DbResult<T> => ({ data, error: null });
const fail = (error: unknown): DbResult<never> => ({
  data: null,
  error: error instanceof Error ? error.message : String(error),
});

interface ProfilePhoneRow {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  city: string | null;
  skill_level: string | null;
  dupr_rating: number | null;
  phone: string | null;
}

function mapProfile(row: ProfilePhoneRow): Player {
  return {
    id: row.id,
    fullName: row.full_name ?? "Unnamed Player",
    avatarUrl: row.avatar_url ?? null,
    city: row.city ?? "Unknown",
    skillLevel: (row.skill_level ?? "3.0") as SkillLevel,
    duprRating: row.dupr_rating ?? 0,
    playerRating: row.dupr_rating ?? 0,
    phone: row.phone,
  };
}

/** Look up a registered player by phone number (CricHeroes-style). */
export async function lookupPlayerByPhone(
  phone: string
): Promise<DbResult<Player | null>> {
  const normalized = normalizePhone(phone);
  if (normalized.length < 6) {
    return fail("Enter a valid phone number");
  }

  if (!isSupabaseConfigured()) {
    return ok(null);
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("lookup_profile_by_phone", {
      p_phone: phone,
    });

    if (error) throw error;

    const row = (Array.isArray(data) ? data[0] : data) as
      | ProfilePhoneRow
      | null
      | undefined;

    return ok(row ? mapProfile(row) : null);
  } catch (e) {
    return fail(e);
  }
}

export interface GuestPlayerInput {
  fullName: string;
  phone: string;
  createdBy: string;
}

/** Create a guest player when the phone is not on PickleBuzz yet. */
export async function createGuestPlayer(
  input: GuestPlayerInput
): Promise<DbResult<{ guestId: string }>> {
  const name = input.fullName.trim();
  const phone = input.phone.trim();
  const normalized = normalizePhone(phone);

  if (!name) return fail("Enter the player's name");
  if (normalized.length < 6) return fail("Enter a valid phone number");

  if (!isSupabaseConfigured()) {
    return ok({ guestId: `guest-${Date.now()}` });
  }

  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("guest_players")
      .insert({
        full_name: name,
        phone,
        created_by: input.createdBy,
      })
      .select("id")
      .single();

    if (error) throw error;
    return ok({ guestId: (data as { id: string }).id });
  } catch (e) {
    return fail(e);
  }
}
