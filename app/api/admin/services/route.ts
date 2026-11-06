// app/api/admin/services/route.ts

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Service from "@/models/Service";
import { serviceSchema } from "@/lib/validators";
import { guard, unauthorized, invalid } from "@/lib/admin";
import { invalidate, TAGS } from "@/lib/cache";

export async function GET() {
  if (!(await guard())) return unauthorized();
  await connectDB();
  const services = await Service.find().sort({ name: 1 }).lean();
  return NextResponse.json({ services });
}

export async function POST(req: Request) {
  if (!(await guard())) return unauthorized();
  const parsed = serviceSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return invalid(parsed.error.flatten());

  await connectDB();
  const service = await Service.create(parsed.data);
  invalidate(TAGS.services);
  return NextResponse.json(
    { ok: true, id: String(service._id) },
    { status: 201 },
  );
}
