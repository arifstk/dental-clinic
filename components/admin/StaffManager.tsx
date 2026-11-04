// components/admin/StaffManager.tsx

"use client";

import { useCallback, useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import { apiRequest, errorMessage } from "@/lib/client-api";
import PageHeader from "./PageHeader";
import Modal from "./Modal";

type Role = "admin" | "receptionist";
type User = { _id: string; name: string; email: string; role: Role; active: boolean };

export default function StaffManager({ currentId }: { currentId: string }) {
  const [users, setUsers] = useState<User[] | null>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<User | "new" | null>(null);

  const load = useCallback(async () => {
    const res = await apiRequest<{ users: User[] }>("/api/admin/staff");
    if (res.ok) {
      setUsers(res.data.users);
      setError("");
    } else {
      setError(errorMessage(res.data));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Staff"
        description="Create accounts for reception staff and manage their access."
        action={
          <button type="button" className="btn btn-primary" onClick={() => setEditing("new")}>
            <UserPlus size={18} aria-hidden />
            Add staff
          </button>
        }
      />

      {error && (
        <p role="alert" className="alert alert-danger mb-4">
          {error}
        </p>
      )}

      {users === null ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-14" />
          ))}
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>
                    <span className="block font-medium text-ink-900">
                      {u.name} {u._id === currentId && <span className="badge badge-neutral ml-1">You</span>}
                    </span>
                    <span className="muted block text-xs">{u.email}</span>
                  </td>
                  <td>
                    <span className="badge badge-neutral capitalize">{u.role}</span>
                  </td>
                  <td>
                    <span className={`badge ${u.active ? "badge-success" : "badge-danger"}`}>
                      {u.active ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="text-right">
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditing(u)}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <StaffForm
          user={editing === "new" ? null : editing}
          isSelf={editing !== "new" && editing._id === currentId}
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

function StaffForm({
  user,
  isSelf,
  onClose,
  onSaved,
}: {
  user: User | null;
  isSelf: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    password: "",
    role: (user?.role ?? "receptionist") as Role,
    active: user?.active ?? true,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");

    let res;
    if (user) {
      const body: Record<string, unknown> = { name: form.name.trim() };
      if (!isSelf) {
        body.role = form.role;
        body.active = form.active;
      }
      if (form.password) body.password = form.password;
      res = await apiRequest(`/api/admin/staff/${user._id}`, { method: "PATCH", body });
    } else {
      res = await apiRequest("/api/admin/staff", {
        method: "POST",
        body: { name: form.name.trim(), email: form.email.trim(), password: form.password, role: form.role },
      });
    }
    setBusy(false);

    if (!res.ok) {
      setError(errorMessage(res.data));
      return;
    }
    onSaved();
  }

  return (
    <Modal title={user ? "Edit staff" : "Add staff"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="u-name">
            Full name
          </label>
          <input id="u-name" required minLength={2} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input" />
        </div>

        <div>
          <label className="label" htmlFor="u-email">
            Email
          </label>
          <input id="u-email" type="email" required disabled={Boolean(user)} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="input" />
        </div>

        <div>
          <label className="label" htmlFor="u-pass">
            {user ? "New password (leave empty to keep the current one)" : "Password"}
          </label>
          <input
            id="u-pass"
            type="password"
            required={!user}
            minLength={8}
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            className="input"
          />
          <p className="muted mt-1 text-xs">At least 8 characters.</p>
        </div>

        {isSelf ? (
          <p className="alert alert-info">You cannot change your own role or disable your own account.</p>
        ) : (
          <>
            <div>
              <label className="label" htmlFor="u-role">
                Role
              </label>
              <select id="u-role" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))} className="input">
                <option value="receptionist">Receptionist (manage bookings and schedules)</option>
                <option value="admin">Admin (everything, including staff)</option>
              </select>
            </div>

            {user && (
              <label className="flex items-center gap-3 text-sm font-medium text-ink-700">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} className="h-4 w-4 accent-primary-600" />
                Account active (can sign in)
              </label>
            )}
          </>
        )}

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
