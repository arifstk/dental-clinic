// app/api/admin/dentists/[id]/route.ts

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Dentist from "@/models/Dentist";
import { dentistPatchSchema } from "@/lib/validators";
import {
  guard,
  unauthorized,
  invalid,
  notFound,
  isValidId,
  IdCtx,
} from "@/lib/admin";

export async function PATCH(req: Request, { params }: IdCtx) {
  if (!(await guard())) return unauthorized();
  const { id } = await params;
  if (!isValidId(id)) return notFound();

  const parsed = dentistPatchSchema.safeParse(
    await req.json().catch(() => null),
  );
  if (!parsed.success) return invalid(parsed.error.flatten());

  await connectDB();
  const dentist = await Dentist.findByIdAndUpdate(
    id,
    { $set: parsed.data },
    { new: true },
  );
  if (!dentist) return notFound();
  return NextResponse.json({ ok: true });
}
