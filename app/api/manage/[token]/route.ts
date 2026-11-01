// app/api/manage/[token]/route.ts

import { NextResponse, after } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import Appointment from "@/models/Appointment";
// import "@/models/Dentist";
import { dateKeyFromUtc, getSlotsForDay } from "@/lib/slots";
import { sendAppointmentMail } from "@/lib/mailer";

const MIN_NOTICE_MS = 2 * 60 * 60 * 1000;

const tokenSchema = z.string().regex(/^[a-f0-9]{48}$/);

const bodySchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("cancel") }),
  z.object({
    action: z.literal("reschedule"),
    startTime: z.string().datetime(),
  }),
]);

type Ctx = { params: Promise<{ token: string }> };

async function load(token: string) {
  if (!tokenSchema.safeParse(token).success) return null;
  await connectDB();
  return Appointment.findOne({ manageToken: token }).populate(
    "dentistId",
    "name",
  );
}

export async function GET(_req: Request, { params }: Ctx) {
  const { token } = await params;
  const appt = await load(token);
  if (!appt) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(
    {
      appointment: {
        patientName: appt.patientName,
        dentistName: appt.dentistId.name,
        dentistId: String(appt.dentistId._id),
        startTime: appt.startTime,
        endTime: appt.endTime,
        status: appt.status,
        canModify:
          appt.status === "confirmed" &&
          appt.startTime.getTime() - Date.now() > MIN_NOTICE_MS,
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(req: Request, { params }: Ctx) {
  const { token } = await params;
  const appt = await load(token);
  if (!appt) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  if (appt.status !== "confirmed") {
    return NextResponse.json(
      { error: "INACTIVE", message: "This appointment is no longer active." },
      { status: 409 },
    );
  }
  if (appt.startTime.getTime() - Date.now() <= MIN_NOTICE_MS) {
    return NextResponse.json(
      {
        error: "TOO_LATE",
        message:
          "It is too late to change this online. Please contact the clinic.",
      },
      { status: 403 },
    );
  }

  const dentistId = String(appt.dentistId._id);
  const dentistName: string = appt.dentistId.name;

  const notify = (kind: "cancelled" | "rescheduled") =>
    after(async () => {
      try {
        await sendAppointmentMail(kind, {
          to: appt.patientEmail,
          patientName: appt.patientName,
          dentistName,
          startTime: appt.startTime,
          manageToken: appt.manageToken,
        });
      } catch (err) {
        console.error("Mail failed", err);
      }
    });

  if (parsed.data.action === "cancel") {
    appt.status = "cancelled";
    await appt.save();
    notify("cancelled");
    return NextResponse.json({ ok: true });
  }

  // reschedule
  await Appointment.init();
  const start = new Date(parsed.data.startTime);
  const slots = await getSlotsForDay(dentistId, dateKeyFromUtc(start));
  const slot = slots.find(
    (s) => new Date(s.start).getTime() === start.getTime(),
  );
  if (!slot || !slot.available) {
    return NextResponse.json(
      { error: "SLOT_TAKEN", message: "This slot is no longer available." },
      { status: 409 },
    );
  }

  const leadMs = start.getTime() - Date.now();
  appt.startTime = new Date(slot.start);
  appt.endTime = new Date(slot.end);
  appt.reminder24Sent = leadMs <= 24 * 3600000;
  appt.reminder2Sent = leadMs <= 2 * 3600000;

  try {
    await appt.save();
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000) {
      return NextResponse.json(
        { error: "SLOT_TAKEN", message: "This slot was just booked." },
        { status: 409 },
      );
    }
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  notify("rescheduled");
  return NextResponse.json({ ok: true });
}
