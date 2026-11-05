// app/api/admin/messages/[id]/reply/route.ts

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Message from "@/models/Message";
import { messageReplySchema } from "@/lib/validators";
import { sendReplyMail } from "@/lib/mailer";
import { getSiteSettings } from "@/lib/settings";
import {
  guard,
  unauthorized,
  invalid,
  notFound,
  isValidId,
  IdCtx,
} from "@/lib/admin";

export async function POST(req: Request, { params }: IdCtx) {
  if (!(await guard())) return unauthorized();
  const { id } = await params;
  if (!isValidId(id)) return notFound();

  const parsed = messageReplySchema.safeParse(
    await req.json().catch(() => null),
  );
  if (!parsed.success) return invalid(parsed.error.flatten());

  await connectDB();
  const msg = await Message.findById(id);
  if (!msg) return notFound();

  const s = await getSiteSettings();
  const subject = parsed.data.subject || `Re: Your message to ${s.name}`;

  try {
    await sendReplyMail({
      to: msg.email,
      toName: msg.name,
      subject,
      body: parsed.data.body,
      original: msg.message,
      clinicName: s.name,
      replyTo: s.email,
    });
  } catch (err) {
    console.error("Reply mail failed", err);
    return NextResponse.json(
      { error: "Could not send the email. Please check your mail settings." },
      { status: 502 },
    );
  }

  const reply = { subject, body: parsed.data.body, sentAt: new Date() };
  msg.replies.push(reply);
  await msg.save();

  return NextResponse.json({
    ok: true,
    reply: { ...reply, sentAt: reply.sentAt.toISOString() },
  });
}
