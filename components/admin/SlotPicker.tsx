// components/admin/SlotPicker.tsx

"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/client-api";

type Slot = { start: string; end: string; available: boolean };

export default function SlotPicker({
  dentistId,
  date,
  tz,
  value,
  onChange,
}: {
  dentistId: string;
  date: string;
  tz: string;
  value: string;
  onChange: (iso: string) => void;
}) {
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const ready = Boolean(dentistId && date);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    apiRequest<{ slots: Slot[] }>(`/api/slots?dentistId=${dentistId}&date=${date}`).then((r) => {
      if (!cancelled) setSlots(r.ok ? r.data.slots : []);
    });
    return () => {
      cancelled = true;
    };
  }, [ready, dentistId, date]);

  if (!ready) return <p className="muted">Choose a dentist and a date to see times.</p>;

  if (slots === null) {
    return (
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton h-10" />
        ))}
      </div>
    );
  }

  if (!slots.some((s) => s.available)) {
    return <p className="alert alert-info">No free times on this day.</p>;
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {slots.map((s) => {
        const selected = s.start === value && s.available;
        return (
          <button
            key={s.start}
            type="button"
            disabled={!s.available}
            onClick={() => onChange(s.start)}
            aria-pressed={selected}
            className={`slot ${selected ? "slot-selected" : ""} ${!s.available ? "slot-disabled" : ""}`}
          >
            {new Date(s.start).toLocaleTimeString("en-GB", {
              timeZone: tz,
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}
          </button>
        );
      })}
    </div>
  );
}
