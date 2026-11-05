// app/api/admin/messages/route.ts

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Message from "@/models/Message";
import { guard, unauthorized } from "@/lib/admin";

export async function GET() {
  if (!(await guard())) return unauthorized();
  await connectDB();
  const messages = await Message.find()
    .sort({ createdAt: -1 })
    .limit(500)
    .lean();
  return NextResponse.json({ messages });
}
