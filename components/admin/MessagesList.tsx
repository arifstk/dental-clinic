// components/admin/MessagesList.tsx

"use client";

import { useMemo, useState } from "react";
import { Reply as ReplyIcon, Send, Star, Trash2 } from "lucide-react";

export type ReplyItem = { subject: string; body: string; sentAt: string };
export type MessageItem = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  marked: boolean;
  createdAt: string;
  replies: ReplyItem[];
};

// Fixed timezone so server and client render the same text (no hydration mismatch)
const fmt = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Dhaka",
});
const formatDate = (iso: string) => fmt.format(new Date(iso));

const JSON_HEADERS = { "Content-Type": "application/json" };

const inputCls =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20";

async function call(url: string, init?: RequestInit) {
  try {
    const res = await fetch(url, init);
    const data = await res.json().catch(() => null);
    return { ok: res.ok, data };
  } catch {
    return { ok: false, data: null };
  }
}

export default function MessagesList({ initial }: { initial: MessageItem[] }) {
  const [items, setItems] = useState(initial);
  const [filter, setFilter] = useState<"all" | "marked">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const markedCount = useMemo(() => items.filter((m) => m.marked).length, [items]);
  const visible = useMemo(
    () => (filter === "marked" ? items.filter((m) => m.marked) : items),
    [items, filter],
  );

  function toggleOpen(id: string) {
    setError("");
    setNotice("");
    setSubject("");
    setBody("");
    setOpenId((cur) => (cur === id ? null : id));
  }

  async function toggleMark(m: MessageItem) {
    setBusy(m.id);
    setError("");
    setNotice("");
    const r = await call(`/api/admin/messages/${m.id}`, {
      method: "PATCH",
      headers: JSON_HEADERS,
      body: JSON.stringify({ marked: !m.marked }),
    });
    setBusy(null);
    if (!r.ok) return setError("Could not update the message.");
    setItems((prev) => prev.map((x) => (x.id === m.id ? { ...x, marked: !m.marked } : x)));
  }

  async function remove(m: MessageItem) {
    if (!window.confirm(`Delete the message from ${m.name}? This cannot be undone.`)) return;
    setBusy(m.id);
    setError("");
    setNotice("");
    const r = await call(`/api/admin/messages/${m.id}`, { method: "DELETE" });
    setBusy(null);
    if (!r.ok) return setError("Could not delete the message.");
    setItems((prev) => prev.filter((x) => x.id !== m.id));
    if (openId === m.id) setOpenId(null);
  }

  async function sendReply(m: MessageItem) {
    if (!body.trim()) return setError("Write a reply first.");
    setBusy(m.id);
    setError("");
    setNotice("");
    const r = await call(`/api/admin/messages/${m.id}/reply`, {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ subject: subject.trim(), body: body.trim() }),
    });
    setBusy(null);

    if (!r.ok) {
      const msg = typeof r.data?.error === "string" ? r.data.error : "Could not send the reply.";
      return setError(msg);
    }
    setItems((prev) =>
      prev.map((x) => (x.id === m.id ? { ...x, replies: [...x.replies, r.data.reply] } : x)),
    );
    setSubject("");
    setBody("");
    setNotice(`Reply sent to ${m.email}.`);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            ["all", `All (${items.length})`],
            ["marked", `Marked (${markedCount})`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium ${filter === key
              ? "border-primary-600 bg-primary-100 text-primary-700"
              : "border-line bg-white text-ink-700 hover:bg-surface-alt"
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-danger-600/30 px-3 py-2 text-sm text-danger-600">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="rounded-lg border border-primary-600/30 px-3 py-2 text-sm text-primary-700">
          {notice}
        </p>
      )}

      {visible.length === 0 && (
        <div className="card bg-white p-8 text-center text-sm text-ink-500">
          {filter === "marked" ? "No marked messages." : "No messages yet."}
        </div>
      )}

      <ul className="space-y-3">
        {visible.map((m) => {
          const open = openId === m.id;
          const disabled = busy === m.id;
          return (
            <li key={m.id} className="card bg-white p-0">
              <div className="flex items-start gap-3 p-4 sm:p-5">
                <button
                  type="button"
                  onClick={() => toggleOpen(m.id)}
                  className="min-w-0 flex-1 text-left"
                  aria-expanded={open}
                >
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-semibold text-ink-900">{m.name}</span>
                    <span className="text-xs text-ink-500">{formatDate(m.createdAt)}</span>
                    {m.marked && (
                      <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-700">
                        Marked
                      </span>
                    )}
                    {m.replies.length > 0 && (
                      <span className="rounded-full border border-line px-2 py-0.5 text-xs font-medium text-ink-700">
                        Replied ({m.replies.length})
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-ink-500">
                    {m.email}
                    {m.phone ? ` · ${m.phone}` : ""}
                  </p>
                  {!open && <p className="mt-2 line-clamp-2 text-sm text-ink-700">{m.message}</p>}
                </button>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => toggleMark(m)}
                    disabled={disabled}
                    aria-label={m.marked ? "Unmark message" : "Mark message"}
                    title={m.marked ? "Unmark" : "Mark"}
                    className="rounded-lg p-2 text-ink-700 hover:bg-surface-alt disabled:opacity-40"
                  >
                    <Star size={18} className={m.marked ? "fill-primary-600 text-primary-600" : ""} />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(m)}
                    disabled={disabled}
                    aria-label="Delete message"
                    title="Delete"
                    className="rounded-lg p-2 text-danger-600 hover:bg-surface-alt disabled:opacity-40"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {open && (
                <div className="space-y-5 border-t border-line p-4 sm:p-5">
                  <p className="whitespace-pre-wrap break-words text-sm text-ink-900">{m.message}</p>

                  {m.replies.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-500">Sent replies</h3>
                      {m.replies.map((r, i) => (
                        <div key={i} className="rounded-lg bg-surface-alt p-3 text-sm">
                          <p className="text-xs text-ink-500">
                            {formatDate(r.sentAt)}
                            {r.subject ? ` · ${r.subject}` : ""}
                          </p>
                          <p className="mt-1 whitespace-pre-wrap break-words text-ink-900">{r.body}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-3">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                      <ReplyIcon size={16} aria-hidden /> Reply to {m.email}
                    </h3>
                    <input
                      className={inputCls}
                      placeholder="Subject (optional)"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      maxLength={150}
                    />
                    <textarea
                      className={inputCls}
                      rows={5}
                      placeholder="Write your reply..."
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      maxLength={5000}
                    />
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => sendReply(m)}
                      disabled={disabled || !body.trim()}
                    >
                      <Send size={16} /> {disabled ? "Sending..." : "Send reply"}
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
