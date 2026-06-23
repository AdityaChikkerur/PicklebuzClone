import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { sanitizeRedirectPath } from "@/lib/auth/routeGuards";
import { clearDemoSessionCookies } from "@/lib/auth/demoSession";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirect = sanitizeRedirectPath(searchParams.get("redirect"));
  const oauthError = searchParams.get("error_description") ?? searchParams.get("error");

  if (oauthError) {
    const authUrl = new URL("/auth", origin);
    authUrl.searchParams.set("error", oauthError);
    authUrl.searchParams.set("redirect", redirect);
    return NextResponse.redirect(authUrl);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/auth?error=missing_code`);
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const authUrl = new URL("/auth", origin);
    authUrl.searchParams.set("error", error.message);
    authUrl.searchParams.set("redirect", redirect);
    return NextResponse.redirect(authUrl);
  }

  const response = NextResponse.redirect(`${origin}${redirect}`);
  clearDemoSessionCookies(response);
  return response;
}
