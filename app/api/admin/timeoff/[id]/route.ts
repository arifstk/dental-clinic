// app/api/admin/timeoff/[id]/route.ts

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import TimeOff from "@/models/TimeOff";
import { guard, unauthorized, notFound, isValidId, IdCtx } from "@/lib/admin";

export async function DELETE(_req: Request, { params }: IdCtx) {
  if (!(await guard())) return unauthorized();
  const { id } = await params;
  if (!isValidId(id)) return notFound();

  await connectDB();
  const res = await TimeOff.deleteOne({ _id: id });
  if (!res.deletedCount) return notFound();
  return NextResponse.json({ ok: true });
}
