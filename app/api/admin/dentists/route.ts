// app/api/admin/dentists/route.ts

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Dentist from "@/models/Dentist";
import { dentistSchema } from "@/lib/validators";
import { guard, unauthorized, invalid } from "@/lib/admin";

export async function GET() {
  if (!(await guard())) return unauthorized();
  await connectDB();
  const dentists = await Dentist.find().sort({ name: 1 }).lean();
  return NextResponse.json({ dentists });
}

export async function POST(req: Request) {
  if (!(await guard())) return unauthorized();
  const parsed = dentistSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return invalid(parsed.error.flatten());

  await connectDB();
  const dentist = await Dentist.create(parsed.data);
  return NextResponse.json(
    { ok: true, id: String(dentist._id) },
    { status: 201 },
  );
}
