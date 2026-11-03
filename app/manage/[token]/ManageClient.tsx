// app/manage/[token]/ManageClient.tsx

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

const statusBadge: Record<string, string> = {
  confirmed: "badge-success",
  cancelled: "badge-danger",
  completed: "badge-neutral",
  no_show: "badge-warning",
};

export default function ManageClient() {
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

  if (state === "loading") {
    return <main className="container-page py-16 text-center muted">Loading...</main>;
  }
  if (state === "missing" || !appt) {
    return <main className="container-page py-16 text-center text-ink-700">This link is invalid or has expired.</main>;
  }

  const free = slots.filter((s) => s.available);

  return (
    <main className="mx-auto flex min-h-screen max-w-lg items-center px-4 py-10">
      <div className="card w-full">
        <h1 className="heading-2">Your appointment</h1>

        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-ink-500">Patient</dt>
            <dd className="font-medium">{appt.patientName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-500">Dentist</dt>
            <dd className="font-medium">{appt.dentistName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-500">When</dt>
            <dd className="text-right font-medium">{fmtDateTime(appt.startTime)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-ink-500">Status</dt>
            <dd>
              <span className={`badge ${statusBadge[appt.status] ?? "badge-neutral"} capitalize`}>
                {appt.status.replace("_", " ")}
              </span>
            </dd>
          </div>
        </dl>

        {message && <p className="alert alert-info mt-5">{message}</p>}

        {appt.canModify ? (
          <div className="mt-6 space-y-3">
            <button onClick={() => setShowResched((v) => !v)} className="btn btn-outline btn-block">
              Reschedule
            </button>

            {showResched && (
              <div className="rounded-xl bg-surface-alt p-4">
                <label className="label" htmlFor="resched-date">
                  Choose a new date
                </label>
                <input
                  id="resched-date"
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input"
                />
                {date && (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {free.length === 0 && <p className="muted col-span-3">No free slots on this day.</p>}
                    {free.map((s) => (
                      <button
                        key={s.start}
                        disabled={busy}
                        onClick={() => act({ action: "reschedule", startTime: s.start })}
                        className="slot disabled:opacity-60"
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
              className="btn btn-danger btn-block"
            >
              Cancel appointment
            </button>
          </div>
        ) : (
          appt.status === "confirmed" && (
            <p className="muted mt-6">Changes are closed for this appointment. Please contact the clinic.</p>
          )
        )}
      </div>
    </main>
  );
}

