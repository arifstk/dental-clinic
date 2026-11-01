// lib/auth.ts

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { env } from "./env";

export type Role = "admin" | "receptionist";
export type SessionPayload = { sub: string; name: string; role: Role };

export const COOKIE_NAME = "clinic_token";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export function signToken(payload: SessionPayload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: COOKIE_MAX_AGE,
  });
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, env.JWT_SECRET, {
      algorithms: ["HS256"],
    }) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  return token ? verifyToken(token) : null;
}

export async function requireRole(
  roles: Role[],
): Promise<SessionPayload | null> {
  const session = await getSession();
  if (!session || !roles.includes(session.role)) return null;
  return session;
}
