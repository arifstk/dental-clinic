// app/api/admin/timeoff/route.ts

import { NextResponse } from "next/server";
import { fromZonedTime } from "date-fns-tz";
import { connectDB } from "@/lib/db";
import TimeOff from "@/models/TimeOff";
import Appointment from "@/models/Appointment";
import "@/models/Dentist";
import { timeOffSchema } from "@/lib/validators";
import { guard, unauthorized, invalid } from "@/lib/admin";
import { dateKeyFromUtc } from "@/lib/slots";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await guard())) return unauthorized();
  await connectDB();
  const today = dateKeyFromUtc(new Date());
  const items = await TimeOff.find({ endDate: { $gte: today } })
    .sort({ startDate: 1 })
    .populate("dentistId", "name")
    .lean();
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  if (!(await guard())) return unauthorized();
  const parsed = timeOffSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return invalid(parsed.error.flatten());

  const { dentistId, startDate, endDate, reason } = parsed.data;
  await connectDB();

  const item = await TimeOff.create({
    dentistId: dentistId ?? null,
    startDate,
    endDate,
    reason: reason ?? "",
  });

  // Tell the receptionist about bookings that already exist inside this range
  const affected = await Appointment.countDocuments({
    status: "confirmed",
    startTime: {
      $gte: fromZonedTime(`${startDate}T00:00:00`, env.CLINIC_TZ),
      $lte: fromZonedTime(`${endDate}T23:59:59.999`, env.CLINIC_TZ),
    },
    ...(dentistId ? { dentistId } : {}),
  });

  return NextResponse.json(
    { ok: true, id: String(item._id), affectedAppointments: affected },
    { status: 201 },
  );
}
