// components/site/ContactForm.tsx

"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { apiRequest, errorMessage } from "@/lib/client-api";

const EMPTY = { name: "", email: "", phone: "", message: "", website: "" };

export default function ContactForm() {
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");

    const res = await apiRequest("/api/contact", {
      method: "POST",
      body: {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        message: form.message.trim(),
        website: form.website,
      },
    });
    setBusy(false);

    if (!res.ok) {
      setError(errorMessage(res.data));
      return;
    }
    setSent(true);
    setForm(EMPTY);
  }

  if (sent) {
    return (
      <div className="card text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-100 text-success-700">
          <Check size={24} strokeWidth={3} aria-hidden />
        </span>
        <h2 className="heading-3 mt-4">Message sent</h2>
        <p className="muted mt-2">Thank you. We will get back to you as soon as we can.</p>
        <button type="button" className="btn btn-outline mt-5" onClick={() => setSent(false)}>
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-4">
      <h2 className="heading-3">Send us a message</h2>

      {/* Honeypot: hidden from people, bots tend to fill it */}
      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => update("website", e.target.value)} />
        </label>
      </div>

      <div>
        <label className="label" htmlFor="c-name">
          Full name
        </label>
        <input id="c-name" required minLength={2} autoComplete="name" value={form.name} onChange={(e) => update("name", e.target.value)} className="input" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="c-email">
            Email
          </label>
          <input id="c-email" type="email" required autoComplete="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="c-phone">
            Phone (optional)
          </label>
          <input id="c-phone" type="tel" autoComplete="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="input" />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="c-message">
          Message
        </label>
        <textarea id="c-message" required minLength={10} maxLength={1500} rows={5} value={form.message} onChange={(e) => update("message", e.target.value)} className="input" />
      </div>

      {error && (
        <p role="alert" className="alert alert-danger">
          {error}
        </p>
      )}

      <button type="submit" disabled={busy} className="btn btn-primary btn-block">
        {busy ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
