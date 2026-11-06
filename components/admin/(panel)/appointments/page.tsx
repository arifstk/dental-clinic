// components/admin/(panel)/appointments/page.tsx

import type { Metadata } from "next";
import { connectDB } from "@/lib/db";
import Dentist from "@/models/Dentist";
import Service from "@/models/Service";
import { dateKeyFromUtc } from "@/lib/slots";
import { env } from "@/lib/env";
import AppointmentsManager from "@/components/admin/AppointmentsManager";

// export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Appointments" };

export default async function AppointmentsPage() {
  await connectDB();

  const [dentists, services] = await Promise.all([
    Dentist.find().sort({ name: 1 }).lean<{ _id: unknown; name: string; active: boolean }[]>(),
    Service.find({ active: true }).sort({ name: 1 }).lean<{ _id: unknown; name: string }[]>(),
  ]);

  return (
    <AppointmentsManager
      tz={env.CLINIC_TZ}
      todayKey={dateKeyFromUtc(new Date())}
      dentists={dentists.map((d) => ({ id: String(d._id), name: d.name, active: d.active }))}
      services={services.map((s) => ({ id: String(s._id), name: s.name }))}
    />
  );
}
