// app/api/admin/services/[id]/route.ts

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Service from "@/models/Service";
import { servicePatchSchema } from "@/lib/validators";
import {
  guard,
  unauthorized,
  invalid,
  notFound,
  isValidId,
  IdCtx,
} from "@/lib/admin";
import { invalidate, TAGS } from "@/lib/cache";

export async function PATCH(req: Request, { params }: IdCtx) {
  if (!(await guard())) return unauthorized();
  const { id } = await params;
  if (!isValidId(id)) return notFound();

  const parsed = servicePatchSchema.safeParse(
    await req.json().catch(() => null),
  );
  if (!parsed.success) return invalid(parsed.error.flatten());

  await connectDB();
  const service = await Service.findByIdAndUpdate(
    id,
    { $set: parsed.data },
    { new: true },
  );
  if (!service) return notFound();
  invalidate(TAGS.services);
  return NextResponse.json({ ok: true });
}
