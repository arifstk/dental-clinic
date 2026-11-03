// app/admin/login/LoginForm.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Smile } from "lucide-react";
import { site } from "@/lib/site";

type Mode = "login" | "register";

export default function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  useEffect(() => {
    fetch("/api/auth/setup-status", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setNeedsSetup(Boolean(d.needsSetup));
        if (d.needsSetup) setMode("register");
      })
      .catch(() => setNeedsSetup(false));
  }, []);

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const url = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body =
        mode === "login"
          ? { email: form.email, password: form.password }
          : { name: form.name, email: form.email, password: form.password };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Something went wrong");
        return;
      }
      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const registerClosed = mode === "register" && needsSetup === false;

  return (
    <main className="bg-hero flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white">
            <Smile size={22} aria-hidden />
          </span>
          <span className="text-xl font-bold tracking-tight text-ink-900">{site.name}</span>
        </div>

        <div className="card">
          <h1 className="heading-3">{needsSetup ? "Create admin account" : "Staff sign in"}</h1>
          <p className="muted mt-1">
            {needsSetup
              ? "The first account becomes the clinic admin."
              : "Sign in to manage appointments and schedules."}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl bg-surface-alt p-1">
            {(["login", "register"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError("");
                }}
                className={`tab ${mode === m ? "tab-active" : ""}`}
              >
                {m}
              </button>
            ))}
          </div>

          {registerClosed ? (
            <p className="alert alert-warning mt-6">
              Registration is closed. Staff accounts are created by the clinic admin.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              {mode === "register" && (
                <div>
                  <label className="label" htmlFor="name">
                    Full name
                  </label>
                  <input
                    id="name"
                    required
                    minLength={2}
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    className="input"
                  />
                </div>
              )}

              <div>
                <label className="label" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="label" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={mode === "register" ? 8 : 6}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  className="input"
                />
                {mode === "register" && <p className="muted mt-1 text-xs">At least 8 characters.</p>}
              </div>

              {error && (
                <p role="alert" className="alert alert-danger">
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading || needsSetup === null} className="btn btn-primary btn-block">
                {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create admin account"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
