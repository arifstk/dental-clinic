// components/admin/SettingsForm.tsx
"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { HourRow, SiteSettingsData } from "@/lib/settings";

// আপনার globals.css এ input/label ক্লাস থাকলে এগুলো সেটা দিয়ে বদলে নিন
const inputCls =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20";
const labelCls = "mb-1.5 block text-sm font-medium text-ink-900";

export default function SettingsForm({ initial }: { initial: SiteSettingsData }) {
  const [name, setName] = useState(initial.name);
  const [phone, setPhone] = useState(initial.phone);
  const [email, setEmail] = useState(initial.email);
  const [address, setAddress] = useState(initial.address);
  const [mapsUrl, setMapsUrl] = useState(initial.mapsUrl);
  const [hours, setHours] = useState<HourRow[]>(initial.hours);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function updateHour(i: number, patch: Partial<HourRow>) {
    setHours((prev) => prev.map((h, idx) => (idx === i ? { ...h, ...patch } : h)));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, address, mapsUrl, hours }),
      });
      if (res.ok) {
        setMsg({ type: "success", text: "Settings saved." });
      } else {
        setMsg({ type: "error", text: "Could not save. Please check the fields and try again." });
      }
    } catch {
      setMsg({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="card space-y-5 bg-white p-6">
        <h2 className="text-lg font-semibold text-ink-900">Contact</h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="name">Clinic name</label>
            <input id="name" className={inputCls} value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className={labelCls} htmlFor="phone">Phone</label>
            <input id="phone" className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>
          <div>
            <label className={labelCls} htmlFor="email">Email</label>
            <input id="email" type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className={labelCls} htmlFor="mapsUrl">Google Maps link (optional)</label>
            <input id="mapsUrl" type="url" className={inputCls} value={mapsUrl} onChange={(e) => setMapsUrl(e.target.value)} placeholder="https://maps.google.com/..." />
          </div>
        </div>

        <div>
          <label className={labelCls} htmlFor="address">Address</label>
          <input id="address" className={inputCls} value={address} onChange={(e) => setAddress(e.target.value)} required />
        </div>
      </div>

      <div className="card space-y-5 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-900">Opening hours</h2>
          <button
            type="button"
            className="btn bg-white border border-line text-ink-700 hover:bg-surface-alt text-sm"
            onClick={() => setHours((p) => [...p, { days: "", time: "", closed: false }])}
            disabled={hours.length >= 10}
          >
            <Plus className="h-4 w-4" /> Add row
          </button>
        </div>

        <div className="space-y-3">
          {hours.map((h, i) => (
            <div key={i} className="grid items-center gap-3 sm:grid-cols-[1fr_1fr_auto_auto]">
              <input
                className={inputCls}
                placeholder="Days (e.g. Saturday - Thursday)"
                value={h.days}
                onChange={(e) => updateHour(i, { days: e.target.value })}
                required
              />
              <input
                className={`${inputCls} disabled:bg-surface-alt disabled:text-ink-500`}
                placeholder="9:00 AM - 8:00 PM"
                value={h.closed ? "" : h.time}
                onChange={(e) => updateHour(i, { time: e.target.value })}
                disabled={h.closed}
                required={!h.closed}
              />
              <label className="flex items-center gap-2 text-sm text-ink-700">
                <input
                  type="checkbox"
                  checked={h.closed}
                  onChange={(e) => updateHour(i, { closed: e.target.checked, time: e.target.checked ? "" : h.time })}
                />
                Closed
              </label>
              <button
                type="button"
                aria-label="Remove row"
                className="rounded-lg p-2 text-danger-600 hover:bg-surface-alt disabled:opacity-40"
                onClick={() => setHours((p) => p.filter((_, idx) => idx !== i))}
                disabled={hours.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </button>
        {msg && (
          <p className={`text-sm font-medium ${msg.type === "success" ? "text-primary-700" : "text-danger-600"}`} role="status">
            {msg.text}
          </p>
        )}
      </div>
    </form>
  );
}
