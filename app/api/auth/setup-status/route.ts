// app/api/auth/setup-status/route.ts

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { gateOpen } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await gateOpen())) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await connectDB();
  const count = await User.countDocuments();
  return NextResponse.json({ needsSetup: count === 0 });
}
