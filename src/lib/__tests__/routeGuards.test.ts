import { describe, expect, it } from "vitest";
import {
  buildAuthRedirectUrl,
  isPublicPath,
  isRoleAllowed,
  sanitizeRedirectPath,
} from "@/lib/auth/routeGuards";

describe("routeGuards", () => {
  it("treats landing and auth as public", () => {
    expect(isPublicPath("/")).toBe(true);
    expect(isPublicPath("/auth")).toBe(true);
    expect(isPublicPath("/auth/callback")).toBe(true);
    expect(isPublicPath("/privacy")).toBe(true);
    expect(isPublicPath("/terms")).toBe(true);
    expect(isPublicPath("/dashboard")).toBe(false);
  });

  it("sanitizes redirect paths", () => {
    expect(sanitizeRedirectPath("/rankings")).toBe("/rankings");
    expect(sanitizeRedirectPath("//evil.com")).toBe("/dashboard");
    expect(sanitizeRedirectPath(null)).toBe("/dashboard");
  });

  it("builds auth redirect URLs", () => {
    const url = buildAuthRedirectUrl("/tournament/t-1", "");
    expect(url).toContain("/auth?");
    expect(url).toContain("redirect");
  });

  it("checks role allowance", () => {
    expect(isRoleAllowed("referee", ["referee", "admin"])).toBe(true);
    expect(isRoleAllowed("player", ["referee", "admin"])).toBe(false);
    expect(isRoleAllowed(null, ["admin"])).toBe(false);
  });
});
