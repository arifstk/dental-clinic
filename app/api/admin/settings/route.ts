// app/api/admin/settings/route.ts

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import SiteSettings from "@/models/SiteSettings";
import { settingsSchema } from "@/lib/validators";
import { guard, unauthorized, invalid } from "@/lib/admin";
import { getSiteSettings } from "@/lib/settings";

export async function GET() {
  if (!(await guard())) return unauthorized();
  const settings = await getSiteSettings();
  return NextResponse.json({ settings });
}

export async function PUT(req: Request) {
  if (!(await guard())) return unauthorized();
  const parsed = settingsSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return invalid(parsed.error.flatten());

  await connectDB();
  await SiteSettings.findOneAndUpdate(
    { key: "main" },
    { $set: parsed.data },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  revalidatePath("/", "layout");

  return NextResponse.json({ ok: true });
}
