// components/admin/ServicesManager.tsx

"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { apiRequest, errorMessage } from "@/lib/client-api";
import PageHeader from "./PageHeader";
import Modal from "./Modal";

type Service = {
  _id: string;
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  active: boolean;
};

export default function ServicesManager() {
  const [items, setItems] = useState<Service[] | null>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Service | "new" | null>(null);

  const load = useCallback(async () => {
    const res = await apiRequest<{ services: Service[] }>("/api/admin/services");
    if (res.ok) {
      setItems(res.data.services);
      setError("");
    } else {
      setError(errorMessage(res.data));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleActive(s: Service) {
    const res = await apiRequest(`/api/admin/services/${s._id}`, { method: "PATCH", body: { active: !s.active } });
    if (!res.ok) setError(errorMessage(res.data));
    await load();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Services"
        description="Treatments shown on the Services page and in the booking form."
        action={
          <button type="button" className="btn btn-primary" onClick={() => setEditing("new")}>
            <Plus size={18} aria-hidden />
            Add service
          </button>
        }
      />

      {error && (
        <p role="alert" className="alert alert-danger mb-4">
          {error}
        </p>
      )}

      {items === null ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-14" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="alert alert-info">No services yet. Add your first service.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Duration</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s._id}>
                  <td>
                    <span className="block font-medium text-ink-900">{s.name}</span>
                    {s.description && <span className="muted block max-w-md truncate text-xs">{s.description}</span>}
                  </td>
                  <td className="whitespace-nowrap">{s.durationMinutes} min</td>
                  <td className="whitespace-nowrap">{s.price > 0 ? `BDT ${s.price.toLocaleString("en-US")}` : "-"}</td>
                  <td>
                    <span className={`badge ${s.active ? "badge-success" : "badge-neutral"}`}>
                      {s.active ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditing(s)}>
                        Edit
                      </button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => toggleActive(s)}>
                        {s.active ? "Hide" : "Show"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <ServiceForm
          service={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function ServiceForm({
  service,
  onClose,
  onSaved,
}: {
  service: Service | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: service?.name ?? "",
    description: service?.description ?? "",
    durationMinutes: String(service?.durationMinutes ?? 30),
    price: String(service?.price ?? 0),
    active: service?.active ?? true,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");

    const body = {
      name: form.name.trim(),
      description: form.description.trim(),
      durationMinutes: Number(form.durationMinutes),
      price: Number(form.price),
      active: form.active,
    };
    const res = service
      ? await apiRequest(`/api/admin/services/${service._id}`, { method: "PATCH", body })
      : await apiRequest("/api/admin/services", { method: "POST", body });
    setBusy(false);

    if (!res.ok) {
      setError(errorMessage(res.data));
      return;
    }
    onSaved();
  }

  return (
    <Modal title={service ? "Edit service" : "Add service"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="s-name">
            Name
          </label>
          <input id="s-name" required minLength={2} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input" />
        </div>

        <div>
          <label className="label" htmlFor="s-desc">
            Description
          </label>
          <textarea id="s-desc" rows={3} maxLength={1000} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="input" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="s-dur">
              Duration (minutes)
            </label>
            <input id="s-dur" type="number" min={10} max={240} step={5} required value={form.durationMinutes} onChange={(e) => setForm((f) => ({ ...f, durationMinutes: e.target.value }))} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="s-price">
              Price (BDT)
            </label>
            <input id="s-price" type="number" min={0} step={50} required value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className="input" />
          </div>
        </div>

        <label className="flex items-center gap-3 text-sm font-medium text-ink-700">
          <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} className="h-4 w-4 accent-primary-600" />
          Active (visible on the website)
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
