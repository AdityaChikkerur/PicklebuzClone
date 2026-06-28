import { NextResponse } from "next/server";
import { clearDemoSessionCookies } from "@/lib/auth/demoSession";

/** Clears httpOnly demo session cookies (client JS cannot remove these). */
export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearDemoSessionCookies(response);
  return response;
}
