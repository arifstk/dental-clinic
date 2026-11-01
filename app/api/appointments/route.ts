// app/api/appointments/route.ts

import { NextResponse, after } from "next/server";
import { connectDB } from "@/lib/db";
import Appointment from "@/models/Appointment";
import Dentist from "@/models/Dentist";
import { createAppointmentSchema } from "@/lib/validators";
import { dateKeyFromUtc, getSlotsForDay } from "@/lib/slots";
import { sendAppointmentMail } from "@/lib/mailer";

const MAX_DAYS_AHEAD = 60;

export async function POST(req: Request) {
  const parsed = createAppointmentSchema.safeParse(
    await req.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const data = parsed.data;
  const start = new Date(data.startTime);

  if (start.getTime() > Date.now() + MAX_DAYS_AHEAD * 86400000) {
    return NextResponse.json({ error: "Date too far ahead" }, { status: 400 });
  }

  await connectDB();
  await Appointment.init(); // make sure the unique index exists before inserting

  const dentist = await Dentist.findOne({
    _id: data.dentistId,
    active: true,
  }).lean<{ name: string }>();
  if (!dentist)
    return NextResponse.json({ error: "Dentist not found" }, { status: 404 });

  // Layer 1: the requested time must be a real, open slot
  const slots = await getSlotsForDay(data.dentistId, dateKeyFromUtc(start));
  const slot = slots.find(
    (s) => new Date(s.start).getTime() === start.getTime(),
  );
  if (!slot || !slot.available) {
    return NextResponse.json(
      { error: "SLOT_TAKEN", message: "This slot is no longer available" },
      { status: 409 },
    );
  }

  // Layer 2: the unique index rejects simultaneous inserts
  try {
    const leadMs = start.getTime() - Date.now();

    const appt = await Appointment.create({
      dentistId: data.dentistId,
      serviceId: data.serviceId ?? null,
      patientName: data.patientName,
      patientPhone: data.patientPhone,
      patientEmail: data.patientEmail,
      notes: data.notes ?? "",
      startTime: new Date(slot.start),
      endTime: new Date(slot.end),
      source: "online",
      reminder24Sent: leadMs <= 24 * 3600000,
      reminder2Sent: leadMs <= 2 * 3600000,
    });

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

    return NextResponse.json(
      {
        ok: true,
        appointment: {
          id: String(appt._id),
          startTime: appt.startTime,
          endTime: appt.endTime,
          manageToken: appt.manageToken,
        },
      },
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
