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
