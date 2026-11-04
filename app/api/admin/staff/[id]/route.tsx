// app/api/admin/staff/[id]/route.tsx

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { staffPatchSchema } from "@/lib/validators";
import { requireRole } from "@/lib/auth";
import { invalid, notFound, isValidId, IdCtx } from "@/lib/admin";

export async function PATCH(req: Request, { params }: IdCtx) {
  const session = await requireRole(["admin"]);
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  if (!isValidId(id)) return notFound();

  const parsed = staffPatchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return invalid(parsed.error.flatten());
  const patch = parsed.data;

  await connectDB();
  const user = await User.findById(id).lean<{ role: string; active: boolean }>();
  if (!user) return notFound();

  const demotes = (patch.role !== undefined && patch.role !== "admin") || patch.active === false;

  if (id === session.sub && demotes) {
    return NextResponse.json(
      { error: "SELF", message: "You cannot deactivate or demote your own account." },
      { status: 400 }
    );
  }

  if (user.role === "admin" && user.active && demotes) {
    const others = await User.countDocuments({ _id: { $ne: id }, role: "admin", active: true });
    if (others === 0) {
      return NextResponse.json(
        { error: "LAST_ADMIN", message: "At least one active admin is required." },
        { status: 409 }
      );
    }
  }

  const update: Record<string, unknown> = {};
  if (patch.name !== undefined) update.name = patch.name;
  if (patch.role !== undefined) update.role = patch.role;
  if (patch.active !== undefined) update.active = patch.active;
  if (patch.password !== undefined) update.password = await bcrypt.hash(patch.password, 12);

  await User.updateOne({ _id: id }, { $set: update });
  return NextResponse.json({ ok: true });
}
