// lib/validators.ts

import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(6).max(100),
});

export const registerSchema = z.object({
  name: z.string().min(2).max(80).trim(),
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(8).max(100),
});

export const createStaffSchema = z.object({
  name: z.string().min(2).max(80).trim(),
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(8).max(100),
  role: z.enum(["admin", "receptionist"]),
});

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

export const slotsQuerySchema = z.object({
  dentistId: objectId,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const createAppointmentSchema = z.object({
  dentistId: objectId,
  serviceId: objectId.optional(),
  patientName: z.string().min(2).max(80).trim(),
  patientPhone: z
    .string()
    .regex(/^(\+?88)?01[3-9]\d{8}$/, "Invalid phone number"),
  patientEmail: z.string().email().toLowerCase().trim(),
  notes: z.string().max(500).optional(),
  startTime: z.string().datetime(),
});

const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm");
const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const dentistSchema = z.object({
  name: z.string().min(2).max(80).trim(),
  specialty: z.string().max(80).trim().optional(),
  bio: z.string().max(1000).optional(),
  photo: z.string().max(500).optional(),
  active: z.boolean().optional(),
});
export const dentistPatchSchema = dentistSchema.partial();

const scheduleDaySchema = z
  .object({
    weekday: z.number().int().min(0).max(6),
    enabled: z.boolean(),
    startTime: hhmm,
    endTime: hhmm,
    slotMinutes: z.number().int().min(10).max(120).default(30),
    breakStart: hhmm.or(z.literal("")).default(""),
    breakEnd: hhmm.or(z.literal("")).default(""),
  })
  .refine((d) => d.startTime < d.endTime, {
    message: "End time must be after start time",
  })
  .refine(
    (d) =>
      (!d.breakStart && !d.breakEnd) ||
      (d.breakStart && d.breakEnd && d.breakStart < d.breakEnd),
    { message: "Invalid break time" },
  );

export const scheduleSchema = z
  .object({ days: z.array(scheduleDaySchema).min(1).max(7) })
  .refine((v) => new Set(v.days.map((d) => d.weekday)).size === v.days.length, {
    message: "Duplicate weekday",
  });

export const timeOffSchema = z
  .object({
    dentistId: objectId.nullable().optional(),
    startDate: dateKey,
    endDate: dateKey,
    reason: z.string().max(200).optional(),
  })
  .refine((v) => v.startDate <= v.endDate, {
    message: "End date must not be before start date",
  });

export const serviceSchema = z.object({
  name: z.string().min(2).max(80).trim(),
  description: z.string().max(1000).optional(),
  durationMinutes: z.number().int().min(10).max(240).default(30),
  price: z.number().min(0).default(0),
  active: z.boolean().optional(),
});
export const servicePatchSchema = serviceSchema.partial();

export const adminAppointmentQuerySchema = z.object({
  from: dateKey.optional(),
  to: dateKey.optional(),
  dentistId: objectId.optional(),
  status: z.enum(["confirmed", "cancelled", "completed", "no_show"]).optional(),
});

export const adminCreateAppointmentSchema = z.object({
  dentistId: objectId,
  serviceId: objectId.optional(),
  patientName: z.string().min(2).max(80).trim(),
  patientPhone: z.string().min(6).max(20).trim(),
  patientEmail: z
    .string()
    .email()
    .toLowerCase()
    .trim()
    .or(z.literal(""))
    .optional(),
  notes: z.string().max(500).optional(),
  startTime: z.string().datetime(),
  source: z.enum(["phone", "walk_in"]).default("phone"),
});

export const adminPatchAppointmentSchema = z
  .object({
    status: z
      .enum(["confirmed", "cancelled", "completed", "no_show"])
      .optional(),
    startTime: z.string().datetime().optional(),
    notes: z.string().max(500).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "Nothing to update" });
