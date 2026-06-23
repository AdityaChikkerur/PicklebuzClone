import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { fetchDuprPlayer } from "@/lib/dupr/duprClient";

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { duprId?: string };
    const duprId = body.duprId?.trim();

    if (!duprId) {
      return NextResponse.json({ error: "DUPR ID is required" }, { status: 400 });
    }

    const dupr = await fetchDuprPlayer(duprId);

    const { data, error } = await supabase
      .from("profiles")
      .update({
        dupr_id: dupr.duprId,
        dupr_rating: dupr.rating,
        dupr_synced_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select("dupr_id, dupr_rating, dupr_synced_at")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message ?? "Could not update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      duprId: data.dupr_id,
      duprRating: Number(data.dupr_rating),
      syncedAt: data.dupr_synced_at,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "DUPR sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
