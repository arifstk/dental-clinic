// components/admin/TimeOffManager.tsx

"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest, errorMessage } from "@/lib/client-api";
import PageHeader from "./PageHeader";

type Item = {
  _id: string;
  dentistId: { _id: string; name: string } | null;
  startDate: string;
  endDate: string;
  reason?: string;
};

const fmtKey = (key: string) =>
  new Date(`${key}T00:00:00Z`).toLocaleDateString("en-GB", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function TimeOffManager({
  dentists,
  todayKey,
}: {
  dentists: { id: string; name: string }[];
  todayKey: string;
}) {
  const [items, setItems] = useState<Item[] | null>(null);
  const [form, setForm] = useState({ dentistId: "", startDate: todayKey, endDate: todayKey, reason: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");

  const load = useCallback(async () => {
    const res = await apiRequest<{ items: Item[] }>("/api/admin/timeoff");
    if (res.ok) setItems(res.data.items);
    else setError(errorMessage(res.data));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setWarning("");

    const res = await apiRequest<{ affectedAppointments?: number }>("/api/admin/timeoff", {
      method: "POST",
      body: {
        dentistId: form.dentistId || null,
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason.trim() || undefined,
      },
    });
    setBusy(false);

    if (!res.ok) {
      setError(errorMessage(res.data));
      return;
    }

    const n = res.data.affectedAppointments ?? 0;
    if (n > 0) {
      setWarning(
        `${n} confirmed appointment${n === 1 ? "" : "s"} already fall${n === 1 ? "s" : ""} in this period. They were not cancelled. Please review them in Appointments.`
      );
    }
    setForm((f) => ({ ...f, reason: "" }));
    await load();
  }

  async function remove(item: Item) {
    if (!confirm("Remove this time off? The days will become bookable again.")) return;
    const res = await apiRequest(`/api/admin/timeoff/${item._id}`, { method: "DELETE" });
    if (!res.ok) setError(errorMessage(res.data));
    await load();
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Time off" description="Block days when a dentist or the whole clinic is closed." />

      <form onSubmit={submit} className="card space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="t-who">
              Who is off?
            </label>
            <select id="t-who" value={form.dentistId} onChange={(e) => setForm((f) => ({ ...f, dentistId: e.target.value }))} className="input">
              <option value="">Whole clinic (everyone)</option>
              {dentists.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="t-reason">
              Reason (optional)
            </label>
            <input id="t-reason" maxLength={200} value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} className="input" placeholder="Public holiday, leave, training" />
          </div>
          <div>
            <label className="label" htmlFor="t-start">
              From
            </label>
            <input
              id="t-start"
              type="date"
              required
              min={todayKey}
              value={form.startDate}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  startDate: e.target.value,
                  endDate: f.endDate < e.target.value ? e.target.value : f.endDate,
                }))
              }
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="t-end">
              To (last day off)
            </label>
            <input id="t-end" type="date" required min={form.startDate} value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} className="input" />
          </div>
        </div>

        {error && (
          <p role="alert" className="alert alert-danger">
            {error}
          </p>
        )}
        {warning && <p className="alert alert-warning">{warning}</p>}

        <button type="submit" disabled={busy} className="btn btn-primary">
          {busy ? "Saving..." : "Block these days"}
        </button>
      </form>

      <h2 className="heading-3 mt-10">Upcoming time off</h2>

      {items === null ? (
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-14" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="alert alert-info mt-4">No upcoming time off.</p>
      ) : (
        <div className="table-wrap mt-4">
          <table className="table">
            <thead>
              <tr>
                <th>Dates</th>
                <th>Who</th>
                <th>Reason</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i._id}>
                  <td className="whitespace-nowrap font-medium text-ink-900">
                    {i.startDate === i.endDate ? fmtKey(i.startDate) : `${fmtKey(i.startDate)} - ${fmtKey(i.endDate)}`}
                  </td>
                  <td>{i.dentistId ? i.dentistId.name : <span className="badge badge-warning">Whole clinic</span>}</td>
                  <td>{i.reason || "-"}</td>
                  <td className="text-right">
                    <button type="button" className="btn btn-ghost btn-sm text-danger-600" onClick={() => remove(i)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
