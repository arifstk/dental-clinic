// app/admin/(panel)/timeoff/page.tsx

import { Suspense } from "react";
import { connection } from "next/server";
import type { Metadata } from "next";
import { connectDB } from "@/lib/db";
import Dentist from "@/models/Dentist";
import { dateKeyFromUtc } from "@/lib/slots";
import TimeOffManager from "@/components/admin/TimeOffManager";

// export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Time off" };

export default function TimeOffPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-card bg-surface" />}>
      <TimeOffContent />
    </Suspense>
  );
}

async function TimeOffContent() {
  await connection();
  await connectDB();
  const dentists = await Dentist.find({ active: true }).sort({ name: 1 }).lean<{ _id: unknown; name: string }[]>();

  return (
    <TimeOffManager
      todayKey={dateKeyFromUtc(new Date())}
      dentists={dentists.map((d) => ({ id: String(d._id), name: d.name }))}
    />
  );
}
