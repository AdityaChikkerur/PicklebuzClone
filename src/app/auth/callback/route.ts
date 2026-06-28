import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { sanitizeRedirectPath } from "@/lib/auth/routeGuards";
import { clearDemoSessionCookies } from "@/lib/auth/demoSession";
import type { UserRole } from "@/types/player";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectParam = searchParams.get("redirect");
  const oauthError = searchParams.get("error_description") ?? searchParams.get("error");

  if (oauthError) {
    const authUrl = new URL("/auth", origin);
    authUrl.searchParams.set("error", oauthError);
    if (redirectParam) authUrl.searchParams.set("redirect", redirectParam);
    return NextResponse.redirect(authUrl);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/auth?error=missing_code`);
  }

  const supabase = await createServerSupabaseClient();
  const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const authUrl = new URL("/auth", origin);
    authUrl.searchParams.set("error", error.message);
    if (redirectParam) authUrl.searchParams.set("redirect", redirectParam);
    return NextResponse.redirect(authUrl);
  }

  let role: UserRole | null = null;
  const userId = sessionData.user?.id;
  if (userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();
    role = (profile?.role as UserRole) ?? "player";
  }

  const redirect = sanitizeRedirectPath(redirectParam, role);
  const response = NextResponse.redirect(`${origin}${redirect}`);
  clearDemoSessionCookies(response);
  return response;
}
