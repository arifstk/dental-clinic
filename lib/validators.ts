// lib/validators.ts

import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(6).max(100),
});

export const createStaffSchema = z.object({
  name: z.string().min(2).max(80).trim(),
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(8).max(100),
  role: z.enum(["admin", "receptionist"]),
});
