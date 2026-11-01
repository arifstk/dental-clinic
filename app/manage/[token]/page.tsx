// app/manage/[token]/page.tsx

"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

const TZ = "Asia/Dhaka";

type Appt = {
  patientName: string;
  dentistName: string;
  dentistId: string;
  startTime: string;
  status: string;
  canModify: boolean;
};
type Slot = { start: string; end: string; available: boolean };
type Action = { action: "cancel" } | { action: "reschedule"; startTime: string };

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-GB", { timeZone: TZ, hour: "numeric", minute: "2-digit", hour12: true });

export default function ManagePage() {
  const { token } = useParams<{ token: string }>();
  const [appt, setAppt] = useState<Appt | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing">("loading");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [showResched, setShowResched] = useState(false);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);

  const load = useCallback(async () => {
    const res = await fetch(`/api/manage/${token}`, { cache: "no-store" });
    if (!res.ok) {
      setState("missing");
      return;
    }
    const data = await res.json();
    setAppt(data.appointment);
    setState("ready");
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!appt || !date) return;
    fetch(`/api/slots?dentistId=${appt.dentistId}&date=${date}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setSlots(d.slots ?? []))
      .catch(() => setSlots([]));
  }, [appt, date]);

  async function act(body: Action) {
    setBusy(true);
    setMessage("");
    const res = await fetch(`/api/manage/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);

    if (!res.ok) {
      setMessage(data.message ?? data.error ?? "Something went wrong");
      return;
    }
    setShowResched(false);
    setSlots([]);
    setDate("");
    setMessage(body.action === "cancel" ? "Your appointment has been cancelled." : "Your appointment has been rescheduled.");
    await load();
  }

  if (state === "loading") return <main className="p-8 text-center text-slate-500">Loading...</main>;
  if (state === "missing" || !appt) {
    return <main className="p-8 text-center text-slate-700">This link is invalid or has expired.</main>;
  }

  const free = slots.filter((s) => s.available);

  return (
    <main className="mx-auto flex min-h-screen max-w-lg items-center px-4 py-10">
      <div className="w-full rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-xl font-semibold text-slate-900">Your appointment</h1>

        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Patient</dt>
            <dd className="font-medium">{appt.patientName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Dentist</dt>
            <dd className="font-medium">{appt.dentistName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">When</dt>
            <dd className="text-right font-medium">{fmtDateTime(appt.startTime)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Status</dt>
            <dd className="font-medium capitalize">{appt.status.replace("_", " ")}</dd>
          </div>
        </dl>

        {message && <p className="mt-4 rounded-lg bg-sky-50 px-3 py-2 text-sm text-sky-800 ring-1 ring-sky-200">{message}</p>}

        {appt.canModify ? (
          <div className="mt-6 space-y-3">
            <button
              onClick={() => setShowResched((v) => !v)}
              className="w-full rounded-lg border border-slate-300 py-2.5 text-sm font-medium hover:bg-slate-50"
            >
              Reschedule
            </button>

            {showResched && (
              <div className="rounded-lg bg-slate-50 p-4">
                <input
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                {date && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {free.length === 0 && <p className="col-span-3 text-sm text-slate-500">No free slots on this day.</p>}
                    {free.map((s) => (
                      <button
                        key={s.start}
                        disabled={busy}
                        onClick={() => act({ action: "reschedule", startTime: s.start })}
                        className="rounded-md bg-white py-2 text-sm ring-1 ring-slate-300 hover:bg-sky-50 disabled:opacity-60"
                      >
                        {fmtTime(s.start)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              disabled={busy}
              onClick={() => {
                if (confirm("Cancel this appointment?")) act({ action: "cancel" });
              }}
              className="w-full rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              Cancel appointment
            </button>
          </div>
        ) : (
          appt.status === "confirmed" && (
            <p className="mt-6 text-sm text-slate-500">
              Changes are closed for this appointment. Please contact the clinic.
            </p>
          )
        )}
      </div>
    </main>
  );
}
