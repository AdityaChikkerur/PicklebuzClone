import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  applyProfileCompletion,
  uploadProfileAvatarWithClient,
  type CompleteProfileInput,
} from "@/lib/db/profiles";
import { isPhoneDuplicateError } from "@/lib/db/formatDbError";
import { createAuthenticatedSupabaseClient } from "@/lib/supabaseServer";
import type { UserRole } from "@/types/player";

const ONBOARDING_ROLES = new Set<UserRole>([
  "player",
  "organizer",
  "referee",
  "club_owner",
]);

export async function POST(request: Request) {
  const supabase = await createAuthenticatedSupabaseClient(request);
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Your session expired. Please sign in again." },
      { status: 401 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid profile submission." },
      { status: 400 }
    );
  }

  const avatarFile = formData.get("avatar");
  const phone = String(formData.get("phone") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const role = String(formData.get("role") ?? "") as UserRole;
  const fullName = String(formData.get("fullName") ?? "").trim();

  if (!(avatarFile instanceof File) || avatarFile.size === 0) {
    return NextResponse.json(
      { error: "Profile photo is required." },
      { status: 400 }
    );
  }

  if (!phone || phone.length < 10) {
    return NextResponse.json(
      { error: "Enter a valid phone number." },
      { status: 400 }
    );
  }

  if (!city || city.length < 2) {
    return NextResponse.json(
      { error: "Enter your city." },
      { status: 400 }
    );
  }

  if (!ONBOARDING_ROLES.has(role)) {
    return NextResponse.json({ error: "Invalid role selected." }, { status: 400 });
  }

  const input: CompleteProfileInput = {
    userId: user.id,
    phone: phone.replace(/\s|-/g, ""),
    city,
    role,
    avatarFile,
    fullName: fullName || undefined,
  };

  const uploaded = await uploadProfileAvatarWithClient(
    supabase as SupabaseClient,
    input.userId,
    avatarFile
  );

  if (uploaded.error || !uploaded.data) {
    return NextResponse.json(
      { error: uploaded.error ?? "Could not upload photo." },
      { status: 500 }
    );
  }

  const completed = await applyProfileCompletion(
    supabase as SupabaseClient,
    input,
    uploaded.data
  );

  if (completed.error || !completed.data) {
    const message = completed.error ?? "Could not save profile.";
    const status = isPhoneDuplicateError(message) ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }

  return NextResponse.json({
    profile: completed.data,
  });
}
