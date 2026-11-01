// proxy.ts

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

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

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApi = pathname.startsWith("/api/");

  if (pathname === "/admin/login") {
    const role = await readRole(req);
    if (role)
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    return NextResponse.next();
  }

  const role = await readRole(req);
  if (!role) {
    if (isApi)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.redirect(new URL("/admin/login", req.url));
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
