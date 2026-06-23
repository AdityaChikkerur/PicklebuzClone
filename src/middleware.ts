import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getDemoRoleFromCookie } from "@/lib/auth/demoSession";
import { isSupabaseConfigured } from "@/lib/auth/isSupabaseConfigured";
import {
  buildAuthRedirectUrl,
  getRoleRuleForPath,
  isPublicPath,
  isRoleAllowed,
  sanitizeRedirectPath,
} from "@/lib/auth/routeGuards";
import type { UserRole } from "@/types/player";

async function resolveUserRole(
  request: NextRequest,
  userId: string | undefined
): Promise<UserRole | null> {
  if (userId && isSupabaseConfigured()) {
    const cookieStore = {
      getAll: () => request.cookies.getAll(),
      setAll: () => {},
    };

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {},
        },
      }
    );

    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (data?.role) {
      return data.role as UserRole;
    }
  }

  return getDemoRoleFromCookie(request.headers.get("cookie"));
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });
  let userId: string | undefined;

  if (isSupabaseConfigured()) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(
            cookiesToSet: {
              name: string;
              value: string;
              options: CookieOptions;
            }[]
          ) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    userId = user?.id;
  }

  const demoRole = getDemoRoleFromCookie(request.headers.get("cookie"));
  const isAuthenticated = Boolean(userId || demoRole);

  if (pathname === "/auth" && isAuthenticated) {
    const redirect = sanitizeRedirectPath(
      request.nextUrl.searchParams.get("redirect")
    );
    return NextResponse.redirect(new URL(redirect, request.url));
  }

  if (pathname === "/" && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!isPublicPath(pathname) && !isAuthenticated) {
    const authUrl = buildAuthRedirectUrl(pathname, search);
    return NextResponse.redirect(new URL(authUrl, request.url));
  }

  const roleRule = getRoleRuleForPath(pathname);
  if (roleRule && isAuthenticated) {
    const role = await resolveUserRole(request, userId);
    if (!isRoleAllowed(role, roleRule.roles)) {
      const deniedUrl = new URL("/dashboard", request.url);
      deniedUrl.searchParams.set("access", "denied");
      return NextResponse.redirect(deniedUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
