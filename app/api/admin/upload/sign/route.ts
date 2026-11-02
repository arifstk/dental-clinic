// app/api/admin/upload/sign/route.ts

import { NextResponse } from "next/server";
import { z } from "zod";
import cloudinary from "@/lib/cloudinary";
import { env } from "@/lib/env";
import { guard, unauthorized, invalid } from "@/lib/admin";

const ALLOWED_FORMATS = "jpg,jpeg,png,webp,avif";

const schema = z.object({
  folder: z.enum(["dentists", "services", "site", "gallery"]),
});

export async function POST(req: Request) {
  if (!(await guard())) return unauthorized();

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return invalid();

  const timestamp = Math.round(Date.now() / 1000);
  const folder = `dental/${parsed.data.folder}`;

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder, allowed_formats: ALLOWED_FORMATS },
    env.CLOUDINARY_API_SECRET,
  );

  return NextResponse.json({
    signature,
    timestamp,
    folder,
    allowedFormats: ALLOWED_FORMATS,
    apiKey: env.CLOUDINARY_API_KEY,
    cloudName: env.CLOUDINARY_CLOUD_NAME,
  });
}
