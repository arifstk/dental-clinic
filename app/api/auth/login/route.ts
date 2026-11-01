// app/api/auth/login/route.ts

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { loginSchema } from "@/lib/validators";
import { COOKIE_NAME, COOKIE_MAX_AGE, signToken } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  await connectDB();
  const user = await User.findOne({ email: parsed.data.email }).select(
    "+password",
  );

  const ok =
    user &&
    user.active &&
    (await bcrypt.compare(parsed.data.password, user.password));
  if (!user || !ok) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  }

  const token = signToken({
    sub: String(user._id),
    name: user.name,
    role: user.role,
  });

  const res = NextResponse.json({
    ok: true,
    user: { name: user.name, role: user.role },
  });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  return res;
}
