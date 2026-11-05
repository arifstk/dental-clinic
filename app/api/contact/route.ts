// app/api/contact/route.ts

import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validators";
import { sendContactMail } from "@/lib/mailer";
import { connectDB } from "@/lib/db";
import Message from "@/models/Message";

export async function POST(req: Request) {
  const parsed = contactSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // Bots fill the hidden field. Pretend success and save/send nothing.
  if (parsed.data.website) return NextResponse.json({ ok: true });

  // Save first, so the message is never lost
  try {
    await connectDB();
    await Message.create({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone ?? "",
      message: parsed.data.message,
    });
  } catch (err) {
    console.error("Contact save failed", err);
    return NextResponse.json(
      { error: "Could not send your message. Please call us instead." },
      { status: 500 },
    );
  }

  // Email notification is best-effort; the message is already in the admin inbox
  try {
    await sendContactMail({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      message: parsed.data.message,
    });
  } catch (err) {
    console.error("Contact notification mail failed", err);
  }

  return NextResponse.json({ ok: true });
}
