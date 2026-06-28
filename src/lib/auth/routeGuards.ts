import type { UserRole } from "@/types/player";
import { PUBLIC_MARKETING_PATHS } from "@/lib/seo/constants";

const PUBLIC_EXACT = new Set([
  "/",
  "/auth",
  "/rules",
  "/clubs",
  "/privacy",
  "/terms",
  ...PUBLIC_MARKETING_PATHS,
]);

export interface RoleRouteRule {
  pattern: RegExp;
  roles: UserRole[];
}

export const ROLE_ROUTE_RULES: RoleRouteRule[] = [
  { pattern: /^\/referee(?:\/|$)/, roles: ["referee", "admin"] },
  { pattern: /^\/organizer(?:\/|$)/, roles: ["organizer", "admin"] },
  { pattern: /^\/club-dashboard(?:\/|$)/, roles: ["club_owner", "admin"] },
  { pattern: /^\/admin(?:\/|$)/, roles: ["admin"] },
  { pattern: /^\/create-tournament(?:\/|$)/, roles: ["organizer", "admin"] },
];

/** Default landing page after login / onboarding per role. */
export function getDefaultHomeForRole(role: UserRole | null | undefined): string {
  switch (role) {
    case "organizer":
      return "/organizer";
    case "referee":
      return "/referee";
    case "club_owner":
      return "/club-dashboard";
    case "admin":
      return "/admin";
    case "player":
    default:
      return "/dashboard";
  }
}

export function isPlayerRole(role: UserRole | null | undefined): boolean {
  return !role || role === "player";
}

export function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT.has(pathname)) return true;
  if (pathname.startsWith("/auth/callback")) return true;

  if (/^\/club\/[^/]+$/.test(pathname)) return true;
  if (/^\/tournament\/[^/]+$/.test(pathname)) return true;
  if (/^\/spectate\/[^/]+$/.test(pathname)) return true;
  if (/^\/pickleball-in-[a-z0-9-]+$/.test(pathname)) return true;

  return false;
}

export function getRoleRuleForPath(pathname: string): RoleRouteRule | null {
  return ROLE_ROUTE_RULES.find((rule) => rule.pattern.test(pathname)) ?? null;
}

export function isRoleAllowed(
  role: UserRole | null | undefined,
  allowedRoles: UserRole[]
): boolean {
  if (!role) return false;
  return allowedRoles.includes(role);
}

export function buildAuthRedirectUrl(pathname: string, search: string): string {
  const redirectTarget = `${pathname}${search}`;
  const params = new URLSearchParams({ redirect: redirectTarget });
  return `/auth?${params.toString()}`;
}

export function sanitizeRedirectPath(
  redirect: string | null | undefined,
  role?: UserRole | null
): string {
  const fallback = getDefaultHomeForRole(role);

  if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//")) {
    return fallback;
  }

  // Generic post-login targets should resolve to the role home.
  if (redirect === "/dashboard" && role && role !== "player") {
    return fallback;
  }

  return redirect;
}

/** Paths that are player-centric; staff roles get redirected to their home. */
export function isPlayerOnlyPath(pathname: string): boolean {
  return (
    pathname === "/dashboard" ||
    pathname === "/stats" ||
    pathname === "/discover"
  );
}
