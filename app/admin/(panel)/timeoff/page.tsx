// app/admin/(panel)/timeoff/page.tsx

import type { Metadata } from "next";
import { connectDB } from "@/lib/db";
import Dentist from "@/models/Dentist";
import { dateKeyFromUtc } from "@/lib/slots";
import TimeOffManager from "@/components/admin/TimeOffManager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Time off" };

export default async function TimeOffPage() {
  await connectDB();
  const dentists = await Dentist.find({ active: true }).sort({ name: 1 }).lean<{ _id: unknown; name: string }[]>();

  return (
    <TimeOffManager
      todayKey={dateKeyFromUtc(new Date())}
      dentists={dentists.map((d) => ({ id: String(d._id), name: d.name }))}
    />
  );
}
