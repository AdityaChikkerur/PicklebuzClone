import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { uploadProfileAvatarWithClient } from "@/lib/db/profiles";
import { createAuthenticatedSupabaseClient } from "@/lib/supabaseServer";

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
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const avatarFile = formData.get("avatar");

  if (!(avatarFile instanceof File) || avatarFile.size === 0) {
    return NextResponse.json(
      { error: "Choose a profile photo to upload." },
      { status: 400 }
    );
  }

  const uploaded = await uploadProfileAvatarWithClient(
    supabase as SupabaseClient,
    user.id,
    avatarFile
  );

  if (uploaded.error || !uploaded.data) {
    return NextResponse.json(
      { error: uploaded.error ?? "Could not upload photo." },
      { status: 500 }
    );
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ avatar_url: uploaded.data })
    .eq("id", user.id)
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Could not update profile." },
      { status: 500 }
    );
  }

  return NextResponse.json({ profile: data });
}
