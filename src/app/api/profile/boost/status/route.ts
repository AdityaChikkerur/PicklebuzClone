import { NextResponse } from "next/server";
import { fetchMyProfileBoostStatusFromDb } from "@/lib/db/profileBoostServer";
import { maybeSendBoostExpiryNotification } from "@/lib/profileBoost/expiryNotifications";
import { createAuthenticatedSupabaseClient } from "@/lib/supabaseServer";

export async function GET(request: Request) {
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

  const status = await fetchMyProfileBoostStatusFromDb(supabase);
  if (!status) {
    return NextResponse.json(
      { error: "Could not load boost status" },
      { status: 500 }
    );
  }

  await maybeSendBoostExpiryNotification(user.id, status);

  return NextResponse.json(status);
}
