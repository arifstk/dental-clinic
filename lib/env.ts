// lib/env.ts

import { z } from "zod";

const schema = z.object({
  CLINIC_NAME: z.string().default("Smile Dental"),
  MONGODB_URI: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  ADMIN_LOGIN_SECRET: z.string().min(16),
  CLINIC_TZ: z.string().default("Asia/Dhaka"),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().min(1),
  SMTP_PASS: z.string().min(1),
  MAIL_FROM: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  CRON_SECRET: z.string().min(8),
});

export const env = schema.parse(process.env);
