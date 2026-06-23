import type { UserRole } from "@/types/player";

export const DEMO_SESSION_COOKIE = "picklebuzz-demo-session";
export const DEMO_ROLE_COOKIE = "picklebuzz-demo-role";
export const DEMO_AUTH_STORAGE_KEY = "picklebuzz-demo-auth";

export const DEMO_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export const DEMO_COOKIE_OPTIONS = {
  path: "/",
  maxAge: DEMO_COOKIE_MAX_AGE,
  sameSite: "lax" as const,
  httpOnly: true,
};

export function setDemoSession(role: UserRole): void {
  if (typeof document === "undefined") return;

  const base = `path=/; max-age=${DEMO_COOKIE_MAX_AGE}; SameSite=Lax`;
  document.cookie = `${DEMO_SESSION_COOKIE}=1; ${base}`;
  document.cookie = `${DEMO_ROLE_COOKIE}=${role}; ${base}`;
}

export function applyDemoSessionCookies(
  response: { cookies: { set: (name: string, value: string, options: typeof DEMO_COOKIE_OPTIONS) => void } },
  role: UserRole
): void {
  response.cookies.set(DEMO_SESSION_COOKIE, "1", DEMO_COOKIE_OPTIONS);
  response.cookies.set(DEMO_ROLE_COOKIE, role, DEMO_COOKIE_OPTIONS);
}

export function clearDemoSession(): void {
  if (typeof document === "undefined") return;

  const base = "path=/; max-age=0; SameSite=Lax";
  document.cookie = `${DEMO_SESSION_COOKIE}=; ${base}`;
  document.cookie = `${DEMO_ROLE_COOKIE}=; ${base}`;
}

export function clearDemoSessionCookies(response: {
  cookies: {
    set: (name: string, value: string, options: { path: string; maxAge: number }) => void;
  };
}): void {
  response.cookies.set(DEMO_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  response.cookies.set(DEMO_ROLE_COOKIE, "", { path: "/", maxAge: 0 });
}

export function getDemoRoleFromCookie(
  cookieHeader: string | null | undefined
): UserRole | null {
  if (!cookieHeader) return null;

  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((part) => {
      const [name, ...rest] = part.trim().split("=");
      return [name, rest.join("=")];
    })
  );

  if (cookies[DEMO_SESSION_COOKIE] !== "1") return null;

  const role = cookies[DEMO_ROLE_COOKIE];
  if (
    role === "player" ||
    role === "organizer" ||
    role === "referee" ||
    role === "club_owner" ||
    role === "admin"
  ) {
    return role;
  }

  return null;
}
