// lib/mailer.ts

import nodemailer from "nodemailer";
import { formatInTimeZone } from "date-fns-tz";
import { env } from "./env";

export type MailKind =
  | "confirmed"
  | "rescheduled"
  | "cancelled"
  | "reminder24"
  | "reminder2";

export type MailData = {
  to: string;
  patientName: string;
  dentistName: string;
  startTime: Date;
  manageToken: string;
};

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
});

const COPY: Record<
  MailKind,
  { subject: string; heading: string; intro: string }
> = {
  confirmed: {
    subject: "Appointment confirmed",
    heading: "Your appointment is confirmed",
    intro: "Thank you for booking with us. Here are your details.",
  },
  rescheduled: {
    subject: "Appointment rescheduled",
    heading: "Your appointment has been rescheduled",
    intro: "Your appointment has a new time. Here are the updated details.",
  },
  cancelled: {
    subject: "Appointment cancelled",
    heading: "Your appointment has been cancelled",
    intro:
      "This appointment has been cancelled. You can book a new time anytime.",
  },
  reminder24: {
    subject: "Reminder: appointment within 24 hours",
    heading: "Appointment reminder",
    intro:
      "This is a reminder that your appointment is coming up within the next 24 hours.",
  },
  reminder2: {
    subject: "Reminder: appointment in 2 hours",
    heading: "Your appointment is almost here",
    intro: "Your appointment starts in about 2 hours.",
  },
};

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function when(d: Date) {
  return formatInTimeZone(d, env.CLINIC_TZ, "EEEE, d MMMM yyyy, h:mm a");
}

export async function sendAppointmentMail(kind: MailKind, d: MailData) {
  const c = COPY[kind];
  const manageUrl = `${env.NEXT_PUBLIC_SITE_URL}/manage/${d.manageToken}`;
  const bookUrl = `${env.NEXT_PUBLIC_SITE_URL}/booking`;
  const isCancelled = kind === "cancelled";

  const html = `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#0f172a">
    <h2 style="margin:0 0 12px">${c.heading}</h2>
    <p>Hi ${esc(d.patientName)},</p>
    <p>${c.intro}</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0">
      <tr><td style="padding:8px 0;color:#64748b">Dentist</td><td style="padding:8px 0"><strong>${esc(d.dentistName)}</strong></td></tr>
      <tr><td style="padding:8px 0;color:#64748b">When</td><td style="padding:8px 0"><strong>${when(d.startTime)}</strong></td></tr>
    </table>
    <p>
      <a href="${isCancelled ? bookUrl : manageUrl}"
         style="display:inline-block;background:#0284c7;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px">
        ${isCancelled ? "Book a new appointment" : "Cancel or reschedule"}
      </a>
    </p>
    <p style="color:#94a3b8;font-size:12px;margin-top:24px">${esc(env.CLINIC_NAME)}</p>
  </div>`;

  const text = `${c.heading}\n\nDentist: ${d.dentistName}\nWhen: ${when(d.startTime)}\n\n${
    isCancelled ? bookUrl : manageUrl
  }`;

  await transporter.sendMail({
    from: env.MAIL_FROM,
    to: d.to,
    subject: `${c.subject} - ${env.CLINIC_NAME}`,
    html,
    text,
  });
}
