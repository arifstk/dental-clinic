// app/api/admin/staff/route.ts

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { createStaffSchema } from "@/lib/validators";
import { requireRole } from "@/lib/auth";

export async function GET() {
  if (!(await requireRole(["admin"])))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await connectDB();
  const users = await User.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  if (!(await requireRole(["admin"])))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = createStaffSchema.safeParse(
    await req.json().catch(() => null),
  );
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );

  await connectDB();
  const exists = await User.findOne({ email: parsed.data.email });
  if (exists)
    return NextResponse.json({ error: "Email already used" }, { status: 409 });

  const password = await bcrypt.hash(parsed.data.password, 12);
  const user = await User.create({ ...parsed.data, password });
  return NextResponse.json({ ok: true, id: String(user._id) }, { status: 201 });
}
