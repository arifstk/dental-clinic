// app/api/availability/route.ts

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { monthQuerySchema } from "@/lib/validators";
import { getMonthAvailability } from "@/lib/slots";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsed = monthQuerySchema.safeParse({
    dentistId: searchParams.get("dentistId"),
    month: searchParams.get("month"),
  });
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });

  await connectDB();
  const days = await getMonthAvailability(
    parsed.data.dentistId,
    parsed.data.month,
  );
  return NextResponse.json(
    { days },
    { headers: { "Cache-Control": "no-store" } },
  );
}
