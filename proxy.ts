// proxy.ts

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import {
  GATE_COOKIE,
  GATE_MAX_AGE,
  createGateToken,
  hasGate,
  secretMatches,
} from "@/lib/gate";

const COOKIE_NAME = "clinic_token";
const ADMIN_ONLY = [
  "/admin/staff",
  "/admin/settings",
  "/api/admin/staff",
  "/api/admin/settings",
];

async function readRole(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });
    return (payload.role as string) ?? null;
  } catch {
    return null;
  }
}

// Rewrites to a path that does not exist, so the app's own not-found page is shown
function hidden(req: NextRequest) {
  return NextResponse.rewrite(new URL("/page-not-found", req.url), {
    status: 404,
  });
}

export async function proxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  const isApi = pathname.startsWith("/api/");
  const role = await readRole(req);
  const gateOk = await hasGate(req.cookies.get(GATE_COOKIE)?.value);

  if (pathname === "/admin/login") {
    if (role)
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));

    if (secretMatches(searchParams.get("secret"))) {
      const res = NextResponse.redirect(new URL("/admin/login", req.url));
      res.cookies.set(GATE_COOKIE, await createGateToken(), {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: GATE_MAX_AGE,
      });
      return res;
    }

    return gateOk ? NextResponse.next() : hidden(req);
  }

  if (!role) {
    if (isApi)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return gateOk
      ? NextResponse.redirect(new URL("/admin/login", req.url))
      : hidden(req);
  }

  const adminOnly = ADMIN_ONLY.some((p) => pathname.startsWith(p));
  if (adminOnly && role !== "admin") {
    if (isApi)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
