// app/api/admin/messages/[id]/route.ts

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Message from "@/models/Message";
import { messagePatchSchema } from "@/lib/validators";
import {
  guard,
  unauthorized,
  invalid,
  notFound,
  isValidId,
  IdCtx,
} from "@/lib/admin";

// Mark / unmark
export async function PATCH(req: Request, { params }: IdCtx) {
  if (!(await guard())) return unauthorized();
  const { id } = await params;
  if (!isValidId(id)) return notFound();

  const parsed = messagePatchSchema.safeParse(
    await req.json().catch(() => null),
  );
  if (!parsed.success) return invalid(parsed.error.flatten());

  await connectDB();
  const doc = await Message.findByIdAndUpdate(
    id,
    { $set: parsed.data },
    { new: true },
  );
  if (!doc) return notFound();
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: IdCtx) {
  if (!(await guard())) return unauthorized();
  const { id } = await params;
  if (!isValidId(id)) return notFound();

  await connectDB();
  const doc = await Message.findByIdAndDelete(id);
  if (!doc) return notFound();
  return NextResponse.json({ ok: true });
}
