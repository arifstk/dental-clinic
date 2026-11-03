// api/slots/route.ts

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { slotsQuerySchema } from "@/lib/validators";
import { getSlotsForDay } from "@/lib/slots";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsed = slotsQuerySchema.safeParse({
    dentistId: searchParams.get("dentistId"),
    date: searchParams.get("date"),
  });
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });

  await connectDB();
  const slots = await getSlotsForDay(parsed.data.dentistId, parsed.data.date);
  return NextResponse.json(
    { slots },
    { headers: { "Cache-Control": "no-store" } },
  );
}
