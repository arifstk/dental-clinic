// app/api/auth/register/route.ts

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { registerSchema } from "@/lib/validators";
import { COOKIE_NAME, COOKIE_MAX_AGE, signToken, gateOpen } from "@/lib/auth";

export async function POST(req: Request) {
  if (!(await gateOpen())) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const parsed = registerSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await connectDB();
  await User.init();

  if ((await User.countDocuments()) > 0) {
    return NextResponse.json(
      { error: "Registration is closed" },
      { status: 403 },
    );
  }

  const password = await bcrypt.hash(parsed.data.password, 12);
  const user = await User.create({
    name: parsed.data.name,
    email: parsed.data.email,
    password,
    role: "admin",
  });

  // Race guard: if two first signups happen together, only the oldest id survives
  const first = await User.findOne().sort({ _id: 1 }).select("_id").lean();
  if (!first || String(first._id) !== String(user._id)) {
    await User.deleteOne({ _id: user._id });
    return NextResponse.json(
      { error: "Registration is closed" },
      { status: 403 },
    );
  }

  const token = signToken({
    sub: String(user._id),
    name: user.name,
    role: "admin",
  });
  const res = NextResponse.json({ ok: true }, { status: 201 });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  return res;
}
