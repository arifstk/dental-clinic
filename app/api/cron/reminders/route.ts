// app/api/cron/reminders/route.ts

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Appointment from "@/models/Appointment";
import "@/models/Dentist";
import { sendAppointmentMail } from "@/lib/mailer";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const HOUR = 3600000;

async function run(kind: "reminder24" | "reminder2") {
  const now = Date.now();
  const flag = kind === "reminder24" ? "reminder24Sent" : "reminder2Sent";
  const range =
    kind === "reminder24"
      ? { $gt: new Date(now + 3 * HOUR), $lte: new Date(now + 24 * HOUR) }
      : { $gt: new Date(now), $lte: new Date(now + 2 * HOUR) };

  const failed: unknown[] = [];
  let sent = 0;

  for (let i = 0; i < 100; i++) {
    // Claim the appointment first so parallel runs never send twice
    const appt = await Appointment.findOneAndUpdate(
      {
        status: "confirmed",
        [flag]: false,
        startTime: range,
        _id: { $nin: failed },
      },
      { $set: { [flag]: true } },
      { sort: { startTime: 1 } },
    ).populate("dentistId", "name");

    if (!appt) break;

    try {
      await sendAppointmentMail(kind, {
        to: appt.patientEmail,
        patientName: appt.patientName,
        dentistName: appt.dentistId.name,
        startTime: appt.startTime,
        manageToken: appt.manageToken,
      });
      sent++;
    } catch (err) {
      console.error("Reminder failed", appt._id, err);
      failed.push(appt._id);
      await Appointment.updateOne(
        { _id: appt._id },
        { $set: { [flag]: false } },
      );
    }
  }
  return sent;
}

export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const reminder24 = await run("reminder24");
  const reminder2 = await run("reminder2");
  return NextResponse.json({ ok: true, reminder24, reminder2 });
}
