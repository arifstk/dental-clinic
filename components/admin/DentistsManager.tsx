// components/admin/DentistsManager.tsx

"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Plus, UserRound } from "lucide-react";
import { apiRequest, errorMessage } from "@/lib/client-api";
import PageHeader from "./PageHeader";
import Modal from "./Modal";
import ImageUploader from "@/components/ImageUploader";

type Dentist = {
  _id: string;
  name: string;
  specialty?: string;
  bio?: string;
  photo?: string;
  active: boolean;
};

type Day = {
  weekday: number;
  enabled: boolean;
  startTime: string;
  endTime: string;
  slotMinutes: number;
  breakStart: string;
  breakEnd: string;
};

const ORDER = [6, 0, 1, 2, 3, 4, 5];
const NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SLOT_OPTIONS = [10, 15, 20, 30, 45, 60];

export default function DentistsManager() {
  const [items, setItems] = useState<Dentist[] | null>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Dentist | "new" | null>(null);
  const [scheduling, setScheduling] = useState<Dentist | null>(null);

  const load = useCallback(async () => {
    const res = await apiRequest<{ dentists: Dentist[] }>("/api/admin/dentists");
    if (res.ok) {
      setItems(res.data.dentists);
      setError("");
    } else {
      setError(errorMessage(res.data));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleActive(d: Dentist) {
    if (d.active && !confirm(`Deactivate ${d.name}? They will disappear from online booking. Existing appointments stay.`)) {
      return;
    }
    const res = await apiRequest(`/api/admin/dentists/${d._id}`, { method: "PATCH", body: { active: !d.active } });
    if (!res.ok) setError(errorMessage(res.data));
    await load();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Dentists"
        description="Add dentists, set their photo, and manage their working hours."
        action={
          <button type="button" className="btn btn-primary" onClick={() => setEditing("new")}>
            <Plus size={18} aria-hidden />
            Add dentist
          </button>
        }
      />

      {error && (
        <p role="alert" className="alert alert-danger mb-4">
          {error}
        </p>
      )}

      {items === null ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-40" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="alert alert-info">No dentists yet. Add your first dentist to start taking bookings.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((d) => (
            <div key={d._id} className={`card ${d.active ? "" : "opacity-70"}`}>
              <div className="flex items-center gap-4">
                {d.photo ? (
                  <Image src={d.photo} alt="" width={64} height={64} sizes="64px" className="h-16 w-16 shrink-0 rounded-full object-cover" />
                ) : (
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-800">
                    <UserRound size={26} aria-hidden />
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink-900">{d.name}</p>
                  <p className="muted truncate">{d.specialty || "Dentist"}</p>
                  <span className={`badge mt-1 ${d.active ? "badge-success" : "badge-neutral"}`}>
                    {d.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" className="btn btn-primary btn-sm" onClick={() => setScheduling(d)}>
                  Working hours
                </button>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditing(d)}>
                  Edit
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => toggleActive(d)}>
                  {d.active ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <DentistForm
          dentist={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}

      {scheduling && <ScheduleEditor dentist={scheduling} onClose={() => setScheduling(null)} />}
    </div>
  );
}

function DentistForm({
  dentist,
  onClose,
  onSaved,
}: {
  dentist: Dentist | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: dentist?.name ?? "",
    specialty: dentist?.specialty ?? "",
    bio: dentist?.bio ?? "",
    photo: dentist?.photo ?? "",
    active: dentist?.active ?? true,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");

    const body = {
      name: form.name.trim(),
      specialty: form.specialty.trim(),
      bio: form.bio.trim(),
      photo: form.photo,
      active: form.active,
    };
    const res = dentist
      ? await apiRequest(`/api/admin/dentists/${dentist._id}`, { method: "PATCH", body })
      : await apiRequest("/api/admin/dentists", { method: "POST", body });
    setBusy(false);

    if (!res.ok) {
      setError(errorMessage(res.data));
      return;
    }
    onSaved();
  }

  return (
    <Modal title={dentist ? "Edit dentist" : "Add dentist"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <p className="label">Photo</p>
          <ImageUploader folder="dentists" value={form.photo} onChange={(id) => setForm((f) => ({ ...f, photo: id }))} />
        </div>

        <div>
          <label className="label" htmlFor="d-name">
            Name
          </label>
          <input
            id="d-name"
            required
            minLength={2}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="input"
            placeholder="Dr. Full Name"
          />
        </div>

        <div>
          <label className="label" htmlFor="d-spec">
            Specialty
          </label>
          <input
            id="d-spec"
            value={form.specialty}
            onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))}
            className="input"
            placeholder="General Dentist"
          />
        </div>

        <div>
          <label className="label" htmlFor="d-bio">
            Short bio
          </label>
          <textarea
            id="d-bio"
            rows={4}
            maxLength={1000}
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            className="input"
          />
        </div>

        <label className="flex items-center gap-3 text-sm font-medium text-ink-700">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
            className="h-4 w-4 accent-primary-600"
          />
          Active (shown on the booking page)
        </label>

        {error && (
          <p role="alert" className="alert alert-danger">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Close
          </button>
          <button type="submit" disabled={busy} className="btn btn-primary">
            {busy ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="label text-xs">{label}</span>
      {children}
    </div>
  );
}

function ScheduleEditor({ dentist, onClose }: { dentist: Dentist; onClose: () => void }) {
  const [days, setDays] = useState<Day[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiRequest<{ days: Day[] }>(`/api/admin/dentists/${dentist._id}/schedule`).then((r) => {
      if (r.ok) setDays(r.data.days);
      else setError(errorMessage(r.data));
    });
  }, [dentist._id]);

  function patchDay(weekday: number, patch: Partial<Day>) {
    setSaved(false);
    setDays((ds) => (ds ? ds.map((d) => (d.weekday === weekday ? { ...d, ...patch } : d)) : ds));
  }

  function copyFirstOpenDay() {
    if (!days) return;
    const source = ORDER.map((w) => days.find((d) => d.weekday === w)).find((d) => d?.enabled);
    if (!source) return;
    setSaved(false);
    setDays(
      days.map((d) =>
        d.enabled
          ? {
            ...d,
            startTime: source.startTime,
            endTime: source.endTime,
            slotMinutes: source.slotMinutes,
            breakStart: source.breakStart,
            breakEnd: source.breakEnd,
          }
          : d
      )
    );
  }

  async function save() {
    if (!days) return;
    setBusy(true);
    setError("");
    const res = await apiRequest(`/api/admin/dentists/${dentist._id}/schedule`, { method: "PUT", body: { days } });
    setBusy(false);
    if (!res.ok) {
      setError(errorMessage(res.data));
      return;
    }
    setSaved(true);
  }

  return (
    <Modal title={`Working hours: ${dentist.name}`} onClose={onClose} wide>
      {days === null ? (
        error ? (
          <p role="alert" className="alert alert-danger">
            {error}
          </p>
        ) : (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-16" />
            ))}
          </div>
        )
      ) : (
        <div className="space-y-3">
          <p className="muted">
            Turn a day on to take bookings. Slot length is how long each appointment takes. Times use the clinic time zone.
          </p>

          {ORDER.map((w) => {
            const d = days.find((x) => x.weekday === w);
            if (!d) return null;
            return (
              <div key={w} className="rounded-xl border border-line p-4">
                <label className="flex items-center gap-3 font-medium text-ink-900">
                  <input
                    type="checkbox"
                    checked={d.enabled}
                    onChange={(e) => patchDay(w, { enabled: e.target.checked })}
                    className="h-4 w-4 accent-primary-600"
                  />
                  {NAMES[w]}
                  {!d.enabled && <span className="badge badge-neutral">Closed</span>}
                </label>

                {d.enabled && (
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
                    <Field label="Opens">
                      <input type="time" value={d.startTime} onChange={(e) => patchDay(w, { startTime: e.target.value })} className="input" />
                    </Field>
                    <Field label="Closes">
                      <input type="time" value={d.endTime} onChange={(e) => patchDay(w, { endTime: e.target.value })} className="input" />
                    </Field>
                    <Field label="Slot (minutes)">
                      <select value={d.slotMinutes} onChange={(e) => patchDay(w, { slotMinutes: Number(e.target.value) })} className="input">
                        {SLOT_OPTIONS.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Break from">
                      <input type="time" value={d.breakStart} onChange={(e) => patchDay(w, { breakStart: e.target.value })} className="input" />
                    </Field>
                    <Field label="Break to">
                      <input type="time" value={d.breakEnd} onChange={(e) => patchDay(w, { breakEnd: e.target.value })} className="input" />
                    </Field>
                  </div>
                )}
              </div>
            );
          })}

          {error && (
            <p role="alert" className="alert alert-danger">
              {error}
            </p>
          )}
          {saved && <p className="alert alert-success">Working hours saved.</p>}

          <div className="flex flex-wrap justify-between gap-3 pt-2">
            <button type="button" className="btn btn-ghost" onClick={copyFirstOpenDay}>
              Copy first open day to all open days
            </button>
            <div className="flex gap-3">
              <button type="button" className="btn btn-outline" onClick={onClose}>
                Close
              </button>
              <button type="button" disabled={busy} className="btn btn-primary" onClick={save}>
                {busy ? "Saving..." : "Save hours"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
