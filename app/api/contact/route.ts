// app/api/contact/route.ts

import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validators";
import { sendContactMail } from "@/lib/mailer";

export async function POST(req: Request) {
  const parsed = contactSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // Bots fill the hidden field. Pretend success and send nothing.
  if (parsed.data.website) return NextResponse.json({ ok: true });

  try {
    await sendContactMail({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      message: parsed.data.message,
    });
  } catch (err) {
    console.error("Contact mail failed", err);
    return NextResponse.json(
      { error: "Could not send your message. Please call us instead." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
