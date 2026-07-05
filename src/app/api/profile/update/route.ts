import { NextResponse } from "next/server";
import { createAuthenticatedSupabaseClient } from "@/lib/supabaseServer";

const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 80;

export async function PATCH(request: Request) {
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

  let body: { fullName?: string };
  try {
    body = (await request.json()) as { fullName?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const fullName = String(body.fullName ?? "").trim();

  if (fullName.length < MIN_NAME_LENGTH) {
    return NextResponse.json(
      { error: "Name must be at least 2 characters." },
      { status: 400 }
    );
  }

  if (fullName.length > MAX_NAME_LENGTH) {
    return NextResponse.json(
      { error: "Name must be 80 characters or fewer." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ full_name: fullName })
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
