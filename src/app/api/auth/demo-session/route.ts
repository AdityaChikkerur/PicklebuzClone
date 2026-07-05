import { NextResponse } from "next/server";
import {
  applyDemoSessionCookies,
} from "@/lib/auth/demoSession";
import { isDemoAuthAllowed } from "@/lib/auth/isDemoAuthAllowed";
import { DEMO_CREDENTIALS } from "@/types/player";
import type { UserRole } from "@/types/player";

export async function POST(request: Request) {
  if (!isDemoAuthAllowed()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
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
