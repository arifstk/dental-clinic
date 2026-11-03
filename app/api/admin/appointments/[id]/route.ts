// app/api/admin/appointments/[id]/route.ts

import { NextResponse, after } from "next/server";
import { connectDB } from "@/lib/db";
import Appointment from "@/models/Appointment";
import "@/models/Dentist";
import { adminPatchAppointmentSchema } from "@/lib/validators";
import {
  guard,
  unauthorized,
  invalid,
  notFound,
  isValidId,
  IdCtx,
} from "@/lib/admin";
import { dateKeyFromUtc, getSlotsForDay } from "@/lib/slots";
import { sendAppointmentMail } from "@/lib/mailer";

export async function PATCH(req: Request, { params }: IdCtx) {
  if (!(await guard())) return unauthorized();
  const { id } = await params;
  if (!isValidId(id)) return notFound();

  const parsed = adminPatchAppointmentSchema.safeParse(
    await req.json().catch(() => null),
  );
  if (!parsed.success) return invalid(parsed.error.flatten());
  const patch = parsed.data;

  await connectDB();
  await Appointment.init();

  const appt = await Appointment.findById(id).populate("dentistId", "name");
  if (!appt) return notFound();

  const dentistId = String(appt.dentistId._id);
  let mailKind: "cancelled" | "rescheduled" | null = null;

  if (
    patch.startTime &&
    new Date(patch.startTime).getTime() !== appt.startTime.getTime()
  ) {
    const start = new Date(patch.startTime);
    const slots = await getSlotsForDay(dentistId, dateKeyFromUtc(start));
    const slot = slots.find(
      (s) => new Date(s.start).getTime() === start.getTime(),
    );
    if (!slot || !slot.available) {
      return NextResponse.json(
        { error: "SLOT_TAKEN", message: "This slot is not available" },
        { status: 409 },
      );
    }
    appt.startTime = new Date(slot.start);
    appt.endTime = new Date(slot.end);
    mailKind = "rescheduled";
  }

  if (patch.status && patch.status !== appt.status) {
    appt.status = patch.status;
    if (patch.status === "cancelled") mailKind = "cancelled";
  }
  if (patch.notes !== undefined) appt.notes = patch.notes;

  try {
    await appt.save();
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000) {
      return NextResponse.json(
        { error: "SLOT_TAKEN", message: "This slot is already booked" },
        { status: 409 },
      );
    }
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  if (mailKind && appt.patientEmail) {
    const kind = mailKind;
    after(async () => {
      try {
        await sendAppointmentMail(kind, {
          to: appt.patientEmail,
          patientName: appt.patientName,
          dentistName: appt.dentistId.name,
          startTime: appt.startTime,
          manageToken: appt.manageToken,
        });
      } catch (err) {
        console.error("Mail failed", err);
      }
    });
  }

  return NextResponse.json({ ok: true });
}
