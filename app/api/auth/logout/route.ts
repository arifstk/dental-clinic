// app/api/auth/logout/route.ts

import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/auth";
import { GATE_COOKIE } from "@/lib/gate";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
  res.cookies.set(GATE_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
