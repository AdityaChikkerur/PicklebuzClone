import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export async function POST(request: Request) {
  let body: { email?: string; password?: string; fullName?: string };

  try {
    body = (await request.json()) as {
      email?: string;
      password?: string;
      fullName?: string;
    };
  } catch {
    return NextResponse.json({ error: "Invalid sign-up request." }, { status: 400 });
  }

  const email = body.email?.trim() ?? "";
  const password = body.password ?? "";
  const fullName = body.fullName?.trim() ?? "";

  if (!email || !password || !fullName) {
    return NextResponse.json(
      { error: "Name, email, and password are required." },
      { status: 400 }
    );
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: "player",
      },
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!data.session) {
    return NextResponse.json({
      needsEmailConfirmation: true,
    });
  }

  return NextResponse.json({
    user: data.user,
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    },
  });
}
