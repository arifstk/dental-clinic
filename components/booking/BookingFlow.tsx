// components/booking/BookingFlow.tsx

"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarCheck, Check, Clock, UserRound } from "lucide-react";
import Calendar from "./Calendar";

export type DentistItem = { id: string; name: string; specialty: string; photo: string };
export type ServiceItem = { id: string; name: string; durationMinutes: number };

type Slot = { start: string; end: string; available: boolean; booked?: boolean };
type Done = { startTime: string; dentistName: string; email: string; manageToken: string };

type Props = {
  dentists: DentistItem[];
  services: ServiceItem[];
  tz: string;
  todayKey: string;
  maxKey: string;
};

const PHONE_RE = /^(\+?88)?01[3-9]\d{8}$/;

const FIELD_MAP: Record<string, string> = {
  patientName: "name",
  patientPhone: "phone",
  patientEmail: "email",
  notes: "notes",
};

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: "no-store", signal });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

const initials = (name: string) =>
  name
    .replace(/^dr\.?\s+/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

function StepTitle({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white">
        {n}
      </span>
      <h2 className="heading-3">{title}</h2>
    </div>
  );
}

export default function BookingFlow({ dentists, services, tz, todayKey, maxKey }: Props) {
  const [dentistId, setDentistId] = useState("");
  const [month, setMonth] = useState(todayKey.slice(0, 7));
  const [days, setDays] = useState<Record<string, number> | null>(null);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [slotStart, setSlotStart] = useState("");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", email: "", serviceId: "", notes: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<Done | null>(null);

  const dentist = dentists.find((d) => d.id === dentistId);
  const chosen = slots?.find((s) => s.start === slotStart && s.available) ?? null;
  const wasTaken = Boolean(slotStart) && slots !== null && !chosen;

  const fmtTime = useCallback(
    (iso: string) =>
      new Date(iso).toLocaleTimeString("en-GB", { timeZone: tz, hour: "numeric", minute: "2-digit", hour12: true }),
    [tz]
  );
  const fmtFull = (iso: string) =>
    new Date(iso).toLocaleString("en-GB", {
      timeZone: tz,
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  const fmtDay = (key: string) =>
    new Date(`${key}T00:00:00Z`).toLocaleDateString("en-GB", {
      timeZone: "UTC",
      weekday: "long",
      day: "numeric",
      month: "long",
    });

  const loadDays = useCallback(
    async (signal?: AbortSignal) => {
      if (!dentistId) return;
      const data = await getJson<{ days: Record<string, number> }>(
        `/api/availability?dentistId=${dentistId}&month=${month}`,
        signal
      );
      if (data) setDays(data.days);
    },
    [dentistId, month]
  );

  const loadSlots = useCallback(
    async (signal?: AbortSignal) => {
      if (!dentistId || !date) return;
      const data = await getJson<{ slots: Slot[] }>(`/api/slots?dentistId=${dentistId}&date=${date}`, signal);
      if (data) setSlots(data.slots);
    },
    [dentistId, date]
  );

  // Live calendar: refresh every 30 seconds
  useEffect(() => {
    const ctrl = new AbortController();
    loadDays(ctrl.signal);
    const id = setInterval(() => loadDays(ctrl.signal), 30000);
    return () => {
      ctrl.abort();
      clearInterval(id);
    };
  }, [loadDays]);

  // Live time slots: refresh every 10 seconds and when the tab becomes visible again
  useEffect(() => {
    const ctrl = new AbortController();
    loadSlots(ctrl.signal);
    const id = setInterval(() => loadSlots(ctrl.signal), 10000);
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        loadSlots(ctrl.signal);
        loadDays(ctrl.signal);
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      ctrl.abort();
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [loadSlots, loadDays]);

  function pickDentist(id: string) {
    if (id === dentistId) return;
    setDentistId(id);
    setMonth(todayKey.slice(0, 7));
    setDays(null);
    setDate("");
    setSlots(null);
    setSlotStart("");
    setNotice("");
    setError("");
  }

  function pickDate(key: string) {
    setDate(key);
    setSlots(null);
    setSlotStart("");
    setNotice("");
  }

  function changeMonth(m: string) {
    setMonth(m);
    setDays(null);
  }

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setFieldErrors((e) => ({ ...e, [key]: "" }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!chosen || !dentist) return;

    const phone = form.phone.replace(/[\s-]/g, "");
    if (!PHONE_RE.test(phone)) {
      setFieldErrors({ phone: "Enter a valid mobile number, for example 01712345678" });
      return;
    }

    setSubmitting(true);
    setError("");
    setFieldErrors({});

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dentistId,
          serviceId: form.serviceId || undefined,
          patientName: form.name.trim(),
          patientPhone: phone,
          patientEmail: form.email.trim(),
          notes: form.notes.trim() || undefined,
          startTime: chosen.start,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 201 && data.appointment) {
        setDone({
          startTime: data.appointment.startTime,
          dentistName: dentist.name,
          email: form.email.trim(),
          manageToken: data.appointment.manageToken,
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      if (res.status === 409) {
        setNotice(data.message ?? "That time was just booked. Please choose another.");
        setSlotStart("");
        loadSlots();
        loadDays();
        return;
      }

      if (res.status === 400 && data.details?.fieldErrors) {
        const next: Record<string, string> = {};
        for (const [k, v] of Object.entries<string[]>(data.details.fieldErrors)) {
          const field = FIELD_MAP[k];
          if (field && v?.[0]) next[field] = v[0];
        }
        setFieldErrors(next);
        setError("Please check the highlighted fields.");
        return;
      }

      setError("Something went wrong. Please try again.");
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setDone(null);
    setDate("");
    setSlots(null);
    setSlotStart("");
    setNotice("");
    setForm({ name: "", phone: "", email: "", serviceId: "", notes: "" });
    loadDays();
  }

  // Confirmation screen
  if (done) {
    return (
      <div className="card mx-auto max-w-xl text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-100 text-success-700">
          <Check size={28} strokeWidth={3} aria-hidden />
        </span>
        <h2 className="heading-2 mt-5">Appointment confirmed</h2>
        <p className="lead mt-2">We have sent the details to {done.email}.</p>

        <dl className="mt-6 space-y-3 rounded-xl bg-surface-alt p-5 text-left text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-ink-500">Dentist</dt>
            <dd className="font-medium">{done.dentistName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-500">When</dt>
            <dd className="text-right font-medium">{fmtFull(done.startTime)}</dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href={`/manage/${done.manageToken}`} className="btn btn-primary">
            Cancel or reschedule
          </Link>
          <button type="button" onClick={reset} className="btn btn-outline">
            Book another
          </button>
        </div>
      </div>
    );
  }

  const free = slots?.filter((s) => s.available).length ?? 0;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <div className="min-w-0 space-y-6">
        {/* Step 1: dentist */}
        <section className="card">
          <StepTitle n={1} title="Choose your dentist" />
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {dentists.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => pickDentist(d.id)}
                aria-pressed={d.id === dentistId}
                className={`choice w-full min-w-0 overflow-hidden text-left ${d.id === dentistId ? "choice-selected" : ""}`}
              >
                {d.photo ? (
                  <Image
                    src={d.photo}
                    alt=""
                    width={56}
                    height={56}
                    sizes="56px"
                    className="h-14 w-14 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-800">
                    {initials(d.name) || <UserRound size={22} aria-hidden />}
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-ink-900">{d.name}</span>
                  <span className="muted block truncate">{d.specialty}</span>
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Step 2: date */}
        <section className={`card ${dentistId ? "" : "opacity-60"}`}>
          <StepTitle n={2} title="Pick a date" />
          <div className="mt-5">
            {dentistId ? (
              <Calendar
                month={month}
                onMonthChange={changeMonth}
                days={days}
                selected={date}
                onSelect={pickDate}
                todayKey={todayKey}
                maxKey={maxKey}
              />
            ) : (
              <p className="muted">Choose a dentist first to see available dates.</p>
            )}
          </div>
        </section>

        {/* Step 3: time */}
        {date && (
          <section className="card">
            <StepTitle n={3} title="Choose a time" />
            <p className="muted mt-2">{fmtDay(date)}</p>

            {notice && <p className="alert alert-warning mt-4">{notice}</p>}
            {wasTaken && !notice && (
              <p className="alert alert-warning mt-4">That time was just taken. Please choose another.</p>
            )}

            {slots === null ? (
              <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="skeleton h-10" />
                ))}
              </div>
            ) : slots.length === 0 ? (
              <p className="alert alert-info mt-4">No times available on this day. Please pick another date.</p>
            ) : (
              <>
                {free === 0 && (
                  <p className="alert alert-info mt-4">No times left on this day. Please pick another date.</p>
                )}

                <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {slots.map((s) => {
                    const selected = s.start === slotStart && s.available;
                    const booked = Boolean(s.booked);

                    // booked = red, past/other unavailable = grey, selected = primary, free = outlined
                    const stateClass = booked
                      ? "cursor-not-allowed border-[#fca5a5] bg-[#fee2e2] text-[#b91c1c] line-through"
                      : !s.available
                        ? "cursor-not-allowed border-transparent bg-[#f1f5f9] text-[#94a3b8]"
                        : selected
                          ? "border-primary-600 bg-primary-600 text-white"
                          : "border-[#cbd5e1] bg-white text-ink-900 hover:border-primary-600";

                    return (
                      <button
                        key={s.start}
                        type="button"
                        disabled={!s.available}
                        title={booked ? "Already booked" : !s.available ? "Not available" : undefined}
                        onClick={() => {
                          if (!s.available) return;
                          setSlotStart(s.start);
                          setNotice("");
                        }}
                        aria-pressed={selected}
                        aria-label={booked ? `${fmtTime(s.start)} (already booked)` : fmtTime(s.start)}
                        className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${stateClass}`}
                      >
                        {fmtTime(s.start)}
                      </button>
                    );
                  })}
                </div>

                <ul className="muted mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
                  <li className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded border border-[#cbd5e1] bg-white" aria-hidden />
                    Available
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded bg-primary-600" aria-hidden />
                    Selected
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded border border-[#fca5a5] bg-danger-100" aria-hidden />
                    Booked
                  </li>
                </ul>
              </>
            )}

            <p className="muted mt-4 flex items-center gap-2 text-xs">
              <span className="h-2 w-2 animate-pulse rounded-full bg-accent-500" aria-hidden />
              Availability updates live
            </p>
          </section>
        )}

        {/* Step 4: details */}
        {chosen && dentist && (
          <section className="card">
            <StepTitle n={4} title="Your details" />

            <p className="alert alert-info mt-4 lg:hidden">
              {dentist.name} &middot; {fmtFull(chosen.start)}
            </p>

            <form onSubmit={onSubmit} className="mt-5 space-y-4" noValidate>
              <div>
                <label className="label" htmlFor="b-name">
                  Full name
                </label>
                <input
                  id="b-name"
                  required
                  minLength={2}
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  className={`input ${fieldErrors.name ? "input-error" : ""}`}
                />
                {fieldErrors.name && <p className="field-error">{fieldErrors.name}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="b-phone">
                    Mobile number
                  </label>
                  <input
                    id="b-phone"
                    type="tel"
                    inputMode="tel"
                    required
                    autoComplete="tel"
                    placeholder="01XXXXXXXXX"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className={`input ${fieldErrors.phone ? "input-error" : ""}`}
                  />
                  {fieldErrors.phone && <p className="field-error">{fieldErrors.phone}</p>}
                </div>
                <div>
                  <label className="label" htmlFor="b-email">
                    Email
                  </label>
                  <input
                    id="b-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className={`input ${fieldErrors.email ? "input-error" : ""}`}
                  />
                  {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
                </div>
              </div>

              {services.length > 0 && (
                <div>
                  <label className="label" htmlFor="b-service">
                    Reason for visit (optional)
                  </label>
                  <select
                    id="b-service"
                    value={form.serviceId}
                    onChange={(e) => update("serviceId", e.target.value)}
                    className="input"
                  >
                    <option value="">Not sure / general check-up</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="label" htmlFor="b-notes">
                  Notes (optional)
                </label>
                <textarea
                  id="b-notes"
                  rows={3}
                  maxLength={500}
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  className="input"
                />
              </div>

              {error && (
                <p role="alert" className="alert alert-danger">
                  {error}
                </p>
              )}

              <button type="submit" disabled={submitting} className="btn btn-primary btn-lg btn-block">
                {submitting ? "Booking..." : "Confirm appointment"}
              </button>
            </form>
          </section>
        )}
      </div>

      {/* Summary (desktop) */}
      <aside className="card hidden lg:sticky lg:top-24 lg:block">
        <h2 className="heading-3">Your appointment</h2>
        <ul className="mt-5 space-y-4 text-sm">
          <li className="flex gap-3">
            <UserRound size={18} className="mt-0.5 shrink-0 text-primary-600" aria-hidden />
            <span className={dentist ? "font-medium text-ink-900" : "text-ink-300"}>
              {dentist ? dentist.name : "No dentist selected"}
            </span>
          </li>
          <li className="flex gap-3">
            <CalendarCheck size={18} className="mt-0.5 shrink-0 text-primary-600" aria-hidden />
            <span className={date ? "font-medium text-ink-900" : "text-ink-300"}>
              {date ? fmtDay(date) : "No date selected"}
            </span>
          </li>
          <li className="flex gap-3">
            <Clock size={18} className="mt-0.5 shrink-0 text-primary-600" aria-hidden />
            <span className={chosen ? "font-medium text-ink-900" : "text-ink-300"}>
              {chosen ? fmtTime(chosen.start) : "No time selected"}
            </span>
          </li>
        </ul>
        <p className="muted mt-6 text-xs">
          You will receive an email right away with a link to cancel or reschedule.
        </p>
      </aside>
    </div>
  );
}
