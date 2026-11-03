// app/api/admin/appointments/route.ts

import { NextResponse, after } from "next/server";
import { fromZonedTime } from "date-fns-tz";
import { connectDB } from "@/lib/db";
import Appointment from "@/models/Appointment";
import Dentist from "@/models/Dentist";
import {
  adminAppointmentQuerySchema,
  adminCreateAppointmentSchema,
} from "@/lib/validators";
import { guard, unauthorized, invalid } from "@/lib/admin";
import { dateKeyFromUtc, getSlotsForDay } from "@/lib/slots";
import { sendAppointmentMail } from "@/lib/mailer";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await guard())) return unauthorized();

  const query = Object.fromEntries(new URL(req.url).searchParams);
  const parsed = adminAppointmentQuerySchema.safeParse(query);
  if (!parsed.success) return invalid(parsed.error.flatten());

  const from = parsed.data.from ?? dateKeyFromUtc(new Date());
  const to = parsed.data.to ?? from;

  await connectDB();
  const items = await Appointment.find({
    startTime: {
      $gte: fromZonedTime(`${from}T00:00:00`, env.CLINIC_TZ),
      $lte: fromZonedTime(`${to}T23:59:59.999`, env.CLINIC_TZ),
    },
    ...(parsed.data.dentistId ? { dentistId: parsed.data.dentistId } : {}),
    ...(parsed.data.status ? { status: parsed.data.status } : {}),
  })
    .sort({ startTime: 1 })
    .populate("dentistId", "name")
    .populate("serviceId", "name")
    .lean();

  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  if (!(await guard())) return unauthorized();

  const parsed = adminCreateAppointmentSchema.safeParse(
    await req.json().catch(() => null),
  );
  if (!parsed.success) return invalid(parsed.error.flatten());
  const data = parsed.data;
  const start = new Date(data.startTime);

  await connectDB();
  await Appointment.init();

  const dentist = await Dentist.findOne({
    _id: data.dentistId,
    active: true,
  }).lean<{ name: string }>();
  if (!dentist)
    return NextResponse.json({ error: "Dentist not found" }, { status: 404 });

  const slots = await getSlotsForDay(data.dentistId, dateKeyFromUtc(start));
  const slot = slots.find(
    (s) => new Date(s.start).getTime() === start.getTime(),
  );
  if (!slot || !slot.available) {
    return NextResponse.json(
      { error: "SLOT_TAKEN", message: "This slot is not available" },
      { status: 409 },
    );
  }

  try {
    // const leadMs = start.getTime() - Date.now();
    const appt = await Appointment.create({
      dentistId: data.dentistId,
      serviceId: data.serviceId ?? null,
      patientName: data.patientName,
      patientPhone: data.patientPhone,
      patientEmail: data.patientEmail ?? "",
      notes: data.notes ?? "",
      startTime: new Date(slot.start),
      endTime: new Date(slot.end),
      source: data.source,
    });

    if (appt.patientEmail) {
      after(async () => {
        try {
          await sendAppointmentMail("confirmed", {
            to: appt.patientEmail,
            patientName: appt.patientName,
            dentistName: dentist.name,
            startTime: appt.startTime,
            manageToken: appt.manageToken,
          });
        } catch (err) {
          console.error("Confirmation mail failed", err);
        }
      });
    }

    return NextResponse.json(
      { ok: true, id: String(appt._id) },
      { status: 201 },
    );
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000) {
      return NextResponse.json(
        { error: "SLOT_TAKEN", message: "This slot was just booked" },
        { status: 409 },
      );
    }
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
