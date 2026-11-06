// app/admin/(panel)/dashboard/page.tsx

import { Suspense } from "react";
import type { Metadata } from "next";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { connectDB } from "@/lib/db";
import Appointment from "@/models/Appointment";
import Dentist from "@/models/Dentist";
import { getSession } from "@/lib/auth";
import { dateKeyFromUtc } from "@/lib/slots";
import { env } from "@/lib/env";

export const metadata: Metadata = { title: "Dashboard" };

type Row = {
  _id: unknown;
  patientName: string;
  patientPhone: string;
  startTime: Date;
  status: string;
  dentistId: { name: string } | null;
};

const statusBadge: Record<string, string> = {
  confirmed: "badge-success",
  cancelled: "badge-danger",
  completed: "badge-neutral",
  no_show: "badge-warning",
};

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <div className="h-4 w-40 animate-pulse rounded bg-surface" />
      <div className="mt-3 h-9 w-72 animate-pulse rounded bg-surface" />
      <div className="mt-6 h-64 animate-pulse rounded-card bg-surface" />
    </>
  );
}

async function DashboardContent() {
  const session = await getSession();
  await connectDB();

  const now = new Date();
  const today = dateKeyFromUtc(now);
  const dayStart = fromZonedTime(`${today}T00:00:00`, env.CLINIC_TZ);
  const dayEnd = fromZonedTime(`${today}T23:59:59.999`, env.CLINIC_TZ);
  const weekEnd = new Date(dayEnd.getTime() + 7 * 86400000);

  const [rows, upcoming, dentists] = await Promise.all([
    Appointment.find({ startTime: { $gte: dayStart, $lte: dayEnd } })
      .sort({ startTime: 1 })
      .populate("dentistId", "name")
      .lean<Row[]>(),
    Appointment.countDocuments({ status: "confirmed", startTime: { $gt: dayEnd, $lte: weekEnd } }),
    Dentist.countDocuments({ active: true }),
  ]);

  const confirmedToday = rows.filter((r) => r.status === "confirmed").length;

  const stats = [
    { label: "Today (confirmed)", value: confirmedToday },
    { label: "Next 7 days", value: upcoming },
    { label: "Active dentists", value: dentists },
  ];

  return (
    <>
      <p className="eyebrow">{formatInTimeZone(now, env.CLINIC_TZ, "EEEE, d MMMM yyyy")}</p>
      <h1 className="heading-1 mt-1">Welcome, {session?.name}</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="card">
            <p className="muted">{s.label}</p>
            <p className="mt-2 text-3xl font-bold text-ink-900">{s.value}</p>
          </div>
        ))}
      </div>

      <h2 className="heading-3 mt-10">Today&apos;s appointments</h2>

      {rows.length === 0 ? (
        <p className="alert alert-info mt-4">No appointments today.</p>
      ) : (
        <div className="table-wrap mt-4">
          <table className="table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Patient</th>
                <th>Phone</th>
                <th>Dentist</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={String(r._id)}>
                  <td className="font-medium whitespace-nowrap text-ink-900">
                    {formatInTimeZone(r.startTime, env.CLINIC_TZ, "h:mm a")}
                  </td>
                  <td>{r.patientName}</td>
                  <td className="whitespace-nowrap">{r.patientPhone}</td>
                  <td>{r.dentistId?.name ?? "-"}</td>
                  <td>
                    <span className={`badge ${statusBadge[r.status] ?? "badge-neutral"} capitalize`}>
                      {r.status.replace("_", " ")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
