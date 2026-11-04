// components/admin/Modal.tsx

"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({
  title,
  onClose,
  wide,
  children,
}: {
  title: string;
  onClose: () => void;
  wide?: boolean;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Close" className="absolute inset-0 bg-ink-900/40" onClick={onClose} />
      <div
        className={`relative flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-pop sm:rounded-card ${wide ? "sm:max-w-3xl" : "sm:max-w-lg"
          }`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="heading-3">{title}</h2>
          <button type="button" onClick={onClose} className="btn btn-ghost px-2" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
