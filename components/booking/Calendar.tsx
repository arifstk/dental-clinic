// components/booking/Calendar.tsx

"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  month: string;
  onMonthChange: (month: string) => void;
  days: Record<string, number> | null;
  selected: string;
  onSelect: (date: string) => void;
  todayKey: string;
  maxKey: string;
};

const WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const pad = (n: number) => String(n).padStart(2, "0");

function shiftMonth(month: string, delta: number) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;
}

export default function Calendar({ month, onMonthChange, days, selected, onSelect, todayKey, maxKey }: Props) {
  const [y, m] = month.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const offset = first.getUTCDay();
  const total = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const label = first.toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });

  const canPrev = month > todayKey.slice(0, 7);
  const canNext = month < maxKey.slice(0, 7);

  return (
    <div>
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="btn btn-ghost px-2"
          disabled={!canPrev}
          onClick={() => onMonthChange(shiftMonth(month, -1))}
          aria-label="Previous month"
        >
          <ChevronLeft size={20} />
        </button>
        <p className="font-semibold text-ink-900" aria-live="polite">
          {label}
        </p>
        <button
          type="button"
          className="btn btn-ghost px-2"
          disabled={!canNext}
          onClick={() => onMonthChange(shiftMonth(month, 1))}
          aria-label="Next month"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs font-medium text-ink-500">
        {WEEK.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>

      <div className={`mt-1 grid grid-cols-7 gap-1 transition-opacity ${days === null ? "opacity-50" : ""}`}>
        {Array.from({ length: offset }).map((_, i) => (
          <span key={`blank-${i}`} />
        ))}

        {Array.from({ length: total }, (_, i) => {
          const day = i + 1;
          const key = `${month}-${pad(day)}`;
          const inRange = key >= todayKey && key <= maxKey;
          const available = inRange && days !== null && (days[key] ?? 0) > 0;
          const isSelected = key === selected;
          const cls = isSelected
            ? "cal-day cal-day-selected"
            : available
              ? "cal-day cal-day-available"
              : "cal-day cal-day-off";

          return (
            <button
              key={key}
              type="button"
              disabled={!available}
              onClick={() => onSelect(key)}
              aria-pressed={isSelected}
              aria-label={`${day} ${label}${available ? "" : ", not available"}`}
              className={cls}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-ink-500">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-primary-100" /> Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-primary-600" /> Selected
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-surface-alt" /> Unavailable
        </span>
      </div>
    </div>
  );
}
