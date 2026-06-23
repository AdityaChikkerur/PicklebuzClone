import { NextResponse } from "next/server";
import {
  applyDemoSessionCookies,
} from "@/lib/auth/demoSession";
import { DEMO_CREDENTIALS } from "@/types/player";
import type { UserRole } from "@/types/player";

const VALID_ROLES: UserRole[] = [
  "player",
  "organizer",
  "referee",
  "club_owner",
  "admin",
];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      role?: string;
    };

    let role: UserRole | undefined;

    if (body.email && body.password) {
      const cred = DEMO_CREDENTIALS.find(
        (c) => c.email === body.email && c.password === body.password
      );
      if (!cred) {
        return NextResponse.json(
          { error: "Invalid demo credentials" },
          { status: 401 }
        );
      }
      role = cred.role;
    } else if (body.role && VALID_ROLES.includes(body.role as UserRole)) {
      role = body.role as UserRole;
    } else {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const response = NextResponse.json({ ok: true, role });
    applyDemoSessionCookies(response, role);
    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
