import type { UserRole } from "@/types/player";

const PUBLIC_EXACT = new Set(["/", "/auth", "/rules", "/clubs"]);

export interface RoleRouteRule {
  pattern: RegExp;
  roles: UserRole[];
}

export const ROLE_ROUTE_RULES: RoleRouteRule[] = [
  { pattern: /^\/referee(?:\/|$)/, roles: ["referee", "admin"] },
  { pattern: /^\/organizer(?:\/|$)/, roles: ["organizer", "admin"] },
  { pattern: /^\/club-dashboard(?:\/|$)/, roles: ["club_owner", "admin"] },
  { pattern: /^\/admin(?:\/|$)/, roles: ["admin"] },
];

export function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT.has(pathname)) return true;
  if (pathname.startsWith("/auth/callback")) return true;

  if (/^\/club\/[^/]+$/.test(pathname)) return true;
  if (/^\/tournament\/[^/]+$/.test(pathname)) return true;
  if (/^\/spectate\/[^/]+$/.test(pathname)) return true;

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
  redirect: string | null | undefined
): string {
  if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//")) {
    return "/dashboard";
  }
  return redirect;
}
