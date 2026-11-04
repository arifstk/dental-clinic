// lib/slots.ts

import { fromZonedTime, formatInTimeZone } from "date-fns-tz";
import Schedule from "@/models/Schedule";
import TimeOff from "@/models/TimeOff";
import Appointment from "@/models/Appointment";
import { env } from "./env";

export type Slot = { start: string; end: string; available: boolean };

type ScheduleRow = {
  weekday: number;
  startTime: string;
  endTime: string;
  slotMinutes: number;
  breakStart: string;
  breakEnd: string;
};
type OffRow = { startDate: string; endDate: string };

function toMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function weekdayOf(dateStr: string) {
  return new Date(`${dateStr}T00:00:00Z`).getUTCDay();
}

export function dateKeyFromUtc(d: Date) {
  return formatInTimeZone(d, env.CLINIC_TZ, "yyyy-MM-dd");
}

function buildSlots(
  dateStr: string,
  schedule: ScheduleRow | undefined,
  bookedSet: Set<number>,
): Slot[] {
  if (!schedule) return [];

  const step = schedule.slotMinutes;
  const open = toMinutes(schedule.startTime);
  const close = toMinutes(schedule.endTime);
  const bStart = schedule.breakStart ? toMinutes(schedule.breakStart) : -1;
  const bEnd = schedule.breakEnd ? toMinutes(schedule.breakEnd) : -1;
  const now = Date.now();

  const slots: Slot[] = [];
  for (let t = open; t + step <= close; t += step) {
    const inBreak = bStart >= 0 && t < bEnd && t + step > bStart;
    if (inBreak) continue;

    const start = fromZonedTime(
      `${dateStr}T${pad(Math.floor(t / 60))}:${pad(t % 60)}:00`,
      env.CLINIC_TZ,
    );
    const end = new Date(start.getTime() + step * 60000);

    slots.push({
      start: start.toISOString(),
      end: end.toISOString(),
      available: start.getTime() > now && !bookedSet.has(start.getTime()),
    });
  }
  return slots;
}

export async function getSlotsForDay(
  dentistId: string,
  dateStr: string,
): Promise<Slot[]> {
  const weekday = weekdayOf(dateStr);

  const schedule = await Schedule.findOne({
    dentistId,
    weekday,
    enabled: true,
  }).lean<ScheduleRow>();
  if (!schedule) return [];

  const off = await TimeOff.findOne({
    dentistId: { $in: [dentistId, null] },
    startDate: { $lte: dateStr },
    endDate: { $gte: dateStr },
  }).lean();
  if (off) return [];

  const dayStart = fromZonedTime(`${dateStr}T00:00:00`, env.CLINIC_TZ);
  const dayEnd = fromZonedTime(`${dateStr}T23:59:59.999`, env.CLINIC_TZ);

  const booked = await Appointment.find({
    dentistId,
    status: "confirmed",
    startTime: { $gte: dayStart, $lte: dayEnd },
  })
    .select("startTime")
    .lean<{ startTime: Date }[]>();

  return buildSlots(
    dateStr,
    schedule,
    new Set(booked.map((b) => b.startTime.getTime())),
  );
}

// Returns { "2026-11-10": 12, ... } with the number of free slots for each open day of the month
export async function getMonthAvailability(
  dentistId: string,
  month: string,
): Promise<Record<string, number>> {
  const [y, m] = month.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const first = `${month}-01`;
  const last = `${month}-${pad(daysInMonth)}`;

  const [schedules, offs, booked] = await Promise.all([
    Schedule.find({ dentistId, enabled: true }).lean<ScheduleRow[]>(),
    TimeOff.find({
      dentistId: { $in: [dentistId, null] },
      startDate: { $lte: last },
      endDate: { $gte: first },
    }).lean<OffRow[]>(),
    Appointment.find({
      dentistId,
      status: "confirmed",
      startTime: {
        $gte: fromZonedTime(`${first}T00:00:00`, env.CLINIC_TZ),
        $lte: fromZonedTime(`${last}T23:59:59.999`, env.CLINIC_TZ),
      },
    })
      .select("startTime")
      .lean<{ startTime: Date }[]>(),
  ]);

  const bookedSet = new Set(booked.map((b) => b.startTime.getTime()));
  const byWeekday = new Map(schedules.map((s) => [s.weekday, s]));

  const result: Record<string, number> = {};
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${month}-${pad(d)}`;
    if (offs.some((o) => o.startDate <= key && o.endDate >= key)) continue;

    const free = buildSlots(
      key,
      byWeekday.get(weekdayOf(key)),
      bookedSet,
    ).filter((s) => s.available).length;
    if (free > 0) result[key] = free;
  }
  return result;
}
