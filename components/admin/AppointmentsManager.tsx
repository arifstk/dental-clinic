// components/admin/AppointmentsManager.tsx

"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarPlus } from "lucide-react";
import { apiRequest, errorMessage } from "@/lib/client-api";
import PageHeader from "./PageHeader";
import Modal from "./Modal";
import SlotPicker from "./SlotPicker";

type Status = "confirmed" | "cancelled" | "completed" | "no_show";

type Row = {
  _id: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  notes: string;
  startTime: string;
  status: Status;
  source: "online" | "phone" | "walk_in";
  dentistId: { _id: string; name: string } | null;
  serviceId: { _id: string; name: string } | null;
};

type DentistOpt = { id: string; name: string; active: boolean };
type ServiceOpt = { id: string; name: string };
type Props = { tz: string; todayKey: string; dentists: DentistOpt[]; services: ServiceOpt[] };

const STATUS_BADGE: Record<Status, string> = {
  confirmed: "badge-success",
  cancelled: "badge-danger",
  completed: "badge-neutral",
  no_show: "badge-warning",
};

const SOURCE_LABEL = { online: "Online", phone: "Phone", walk_in: "Walk-in" } as const;

function addDays(key: string, n: number) {
  const d = new Date(`${key}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export default function AppointmentsManager({ tz, todayKey, dentists, services }: Props) {
  const [from, setFrom] = useState(todayKey);
  const [to, setTo] = useState(todayKey);
  const [dentistId, setDentistId] = useState("");
  const [status, setStatus] = useState("");
  const [items, setItems] = useState<Row[] | null>(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [creating, setCreating] = useState(false);
  const [resched, setResched] = useState<Row | null>(null);

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { timeZone: tz, weekday: "short", day: "numeric", month: "short" });
  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-GB", { timeZone: tz, hour: "numeric", minute: "2-digit", hour12: true });

  const load = useCallback(async () => {
    const q = new URLSearchParams({ from, to: to < from ? from : to });
    if (dentistId) q.set("dentistId", dentistId);
    if (status) q.set("status", status);
    const res = await apiRequest<{ items: Row[] }>(`/api/admin/appointments?${q.toString()}`);
    if (res.ok) {
      setItems(res.data.items);
      setError("");
    } else {
      setError(errorMessage(res.data));
    }
  }, [from, to, dentistId, status]);

  // Load now, then refresh every 30 seconds so the reception always sees new bookings
  useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [load]);

  function range(a: number, b: number) {
    setFrom(addDays(todayKey, a));
    setTo(addDays(todayKey, b));
  }

  async function setRowStatus(row: Row, next: Status) {
    if (next === "cancelled" && !confirm(`Cancel the appointment for ${row.patientName}?`)) return;
    setBusyId(row._id);
    setError("");
    const res = await apiRequest(`/api/admin/appointments/${row._id}`, { method: "PATCH", body: { status: next } });
    setBusyId("");
    if (!res.ok) setError(errorMessage(res.data));
    await load();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Appointments"
        description="View, add, reschedule, and cancel appointments."
        action={
          <button type="button" className="btn btn-primary" onClick={() => setCreating(true)}>
            <CalendarPlus size={18} aria-hidden />
            New booking
          </button>
        }
      />

      <div className="card">
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => range(0, 0)}>
            Today
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => range(1, 1)}>
            Tomorrow
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => range(0, 6)}>
            Next 7 days
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="label" htmlFor="f-from">
              From
            </label>
            <input id="f-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="f-to">
              To
            </label>
            <input id="f-to" type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="f-dentist">
              Dentist
            </label>
            <select id="f-dentist" value={dentistId} onChange={(e) => setDentistId(e.target.value)} className="input">
              <option value="">All dentists</option>
              {dentists.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="f-status">
              Status
            </label>
            <select id="f-status" value={status} onChange={(e) => setStatus(e.target.value)} className="input">
              <option value="">All statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="no_show">No show</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="alert alert-danger mt-4">
          {error}
        </p>
      )}

      {items === null ? (
        <div className="mt-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-14" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="alert alert-info mt-4">No appointments in this range.</p>
      ) : (
        <div className="table-wrap mt-4">
          <table className="table">
            <thead>
              <tr>
                <th>When</th>
                <th>Patient</th>
                <th>Dentist</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r._id}>
                  <td className="whitespace-nowrap">
                    <span className="block font-medium text-ink-900">{fmtTime(r.startTime)}</span>
                    <span className="muted text-xs">{fmtDate(r.startTime)}</span>
                  </td>
                  <td>
                    <span className="block font-medium text-ink-900">{r.patientName}</span>
                    <a href={`tel:${r.patientPhone}`} className="link text-xs">
                      {r.patientPhone}
                    </a>
                    {r.patientEmail && <span className="muted block text-xs">{r.patientEmail}</span>}
                    {r.serviceId && <span className="muted block text-xs">{r.serviceId.name}</span>}
                    {r.notes && <span className="muted block max-w-xs truncate text-xs">Note: {r.notes}</span>}
                  </td>
                  <td>
                    <span className="block">{r.dentistId?.name ?? "-"}</span>
                    <span className="badge badge-neutral mt-1">{SOURCE_LABEL[r.source]}</span>
                  </td>
                  <td>
                    <span className={`badge ${STATUS_BADGE[r.status]} capitalize`}>{r.status.replace("_", " ")}</span>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      {r.status === "confirmed" ? (
                        <>
                          <button
                            type="button"
                            disabled={busyId === r._id}
                            className="btn btn-secondary btn-sm"
                            onClick={() => setRowStatus(r, "completed")}
                          >
                            Complete
                          </button>
                          <button
                            type="button"
                            disabled={busyId === r._id}
                            className="btn btn-outline btn-sm"
                            onClick={() => setRowStatus(r, "no_show")}
                          >
                            No show
                          </button>
                          <button
                            type="button"
                            disabled={busyId === r._id}
                            className="btn btn-outline btn-sm"
                            onClick={() => setResched(r)}
                          >
                            Reschedule
                          </button>
                          <button
                            type="button"
                            disabled={busyId === r._id}
                            className="btn btn-ghost btn-sm text-danger-600"
                            onClick={() => setRowStatus(r, "cancelled")}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          disabled={busyId === r._id}
                          className="btn btn-outline btn-sm"
                          onClick={() => setRowStatus(r, "confirmed")}
                        >
                          Restore
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {creating && (
        <NewBookingModal
          dentists={dentists}
          services={services}
          tz={tz}
          todayKey={todayKey}
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false);
            load();
          }}
        />
      )}

      {resched && (
        <RescheduleModal
          row={resched}
          tz={tz}
          todayKey={todayKey}
          onClose={() => setResched(null)}
          onDone={() => {
            setResched(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function NewBookingModal({
  dentists,
  services,
  tz,
  todayKey,
  onClose,
  onCreated,
}: {
  dentists: DentistOpt[];
  services: ServiceOpt[];
  tz: string;
  todayKey: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const activeDentists = dentists.filter((d) => d.active);
  const [dentistId, setDentistId] = useState(activeDentists[0]?.id ?? "");
  const [date, setDate] = useState(todayKey);
  const [slot, setSlot] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [form, setForm] = useState({ name: "", phone: "", email: "", serviceId: "", notes: "", source: "phone" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!slot) {
      setError("Please choose a time.");
      return;
    }
    setBusy(true);
    setError("");
    const res = await apiRequest("/api/admin/appointments", {
      method: "POST",
      body: {
        dentistId,
        serviceId: form.serviceId || undefined,
        patientName: form.name.trim(),
        patientPhone: form.phone.trim(),
        patientEmail: form.email.trim(),
        notes: form.notes.trim() || undefined,
        startTime: slot,
        source: form.source,
      },
    });
    setBusy(false);

    if (!res.ok) {
      setError(errorMessage(res.data));
      if (res.status === 409) {
        setSlot("");
        setRefresh((n) => n + 1);
      }
      return;
    }
    onCreated();
  }

  return (
    <Modal title="New booking" onClose={onClose} wide>
      <form onSubmit={submit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="n-dentist">
              Dentist
            </label>
            <select
              id="n-dentist"
              value={dentistId}
              onChange={(e) => {
                setDentistId(e.target.value);
                setSlot("");
              }}
              className="input"
            >
              {activeDentists.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="n-date">
              Date
            </label>
            <input
              id="n-date"
              type="date"
              min={todayKey}
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setSlot("");
              }}
              className="input"
            />
          </div>
        </div>

        <div>
          <p className="label">Time</p>
          <SlotPicker key={`${dentistId}-${date}-${refresh}`} dentistId={dentistId} date={date} tz={tz} value={slot} onChange={setSlot} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="n-name">
              Patient name
            </label>
            <input id="n-name" required minLength={2} value={form.name} onChange={(e) => update("name", e.target.value)} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="n-phone">
              Phone
            </label>
            <input id="n-phone" type="tel" required value={form.phone} onChange={(e) => update("phone", e.target.value)} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="n-email">
              Email (optional)
            </label>
            <input id="n-email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="n-source">
              Booked via
            </label>
            <select id="n-source" value={form.source} onChange={(e) => update("source", e.target.value)} className="input">
              <option value="phone">Phone</option>
              <option value="walk_in">Walk-in</option>
            </select>
          </div>
        </div>

        {services.length > 0 && (
          <div>
            <label className="label" htmlFor="n-service">
              Service (optional)
            </label>
            <select id="n-service" value={form.serviceId} onChange={(e) => update("serviceId", e.target.value)} className="input">
              <option value="">Not specified</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="label" htmlFor="n-notes">
            Notes (optional)
          </label>
          <textarea id="n-notes" rows={2} maxLength={500} value={form.notes} onChange={(e) => update("notes", e.target.value)} className="input" />
        </div>

        {error && (
          <p role="alert" className="alert alert-danger">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Close
          </button>
          <button type="submit" disabled={busy || !dentistId} className="btn btn-primary">
            {busy ? "Saving..." : "Create booking"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function RescheduleModal({
  row,
  tz,
  todayKey,
  onClose,
  onDone,
}: {
  row: Row;
  tz: string;
  todayKey: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const dentistId = row.dentistId?._id ?? "";
  const [date, setDate] = useState(todayKey);
  const [slot, setSlot] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    if (!slot) {
      setError("Please choose a new time.");
      return;
    }
    setBusy(true);
    setError("");
    const res = await apiRequest(`/api/admin/appointments/${row._id}`, { method: "PATCH", body: { startTime: slot } });
    setBusy(false);

    if (!res.ok) {
      setError(errorMessage(res.data));
      if (res.status === 409) {
        setSlot("");
        setRefresh((n) => n + 1);
      }
      return;
    }
    onDone();
  }

  return (
    <Modal title={`Reschedule: ${row.patientName}`} onClose={onClose}>
      <div className="space-y-5">
        <p className="muted">
          Current time:{" "}
          {new Date(row.startTime).toLocaleString("en-GB", {
            timeZone: tz,
            weekday: "short",
            day: "numeric",
            month: "short",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })}
          {row.dentistId ? ` with ${row.dentistId.name}` : ""}
        </p>

        <div>
          <label className="label" htmlFor="r-date">
            New date
          </label>
          <input
            id="r-date"
            type="date"
            min={todayKey}
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setSlot("");
            }}
            className="input"
          />
        </div>

        <div>
          <p className="label">New time</p>
          <SlotPicker key={`${dentistId}-${date}-${refresh}`} dentistId={dentistId} date={date} tz={tz} value={slot} onChange={setSlot} />
        </div>

        {error && (
          <p role="alert" className="alert alert-danger">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Close
          </button>
          <button type="button" disabled={busy} className="btn btn-primary" onClick={save}>
            {busy ? "Saving..." : "Save new time"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
