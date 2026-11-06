// api/dentists/route.ts

import { NextResponse, connection } from "next/server";
import { connectDB } from "@/lib/db";
import Dentist from "@/models/Dentist";

export async function GET() {
  await connection();
  await connectDB();
  const dentists = await Dentist.find({ active: true })
    .sort({ name: 1 })
    .lean();
  return NextResponse.json({ dentists });
}
