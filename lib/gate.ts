// lib/gate.ts

import { SignJWT, jwtVerify } from "jose";

export const GATE_COOKIE = "clinic_gate";
export const GATE_MAX_AGE = 60 * 60 * 2;

function key() {
  return new TextEncoder().encode(process.env.JWT_SECRET);
}

export function secretMatches(input: string | null) {
  const secret = process.env.ADMIN_LOGIN_SECRET ?? "";
  if (!input || !secret || input.length !== secret.length) return false;
  let diff = 0;
  for (let i = 0; i < secret.length; i++) {
    diff |= input.charCodeAt(i) ^ secret.charCodeAt(i);
  }
  return diff === 0;
}

export async function createGateToken() {
  return new SignJWT({ gate: true })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${GATE_MAX_AGE}s`)
    .sign(key());
}

export async function hasGate(token?: string) {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, key(), {
      algorithms: ["HS256"],
    });
    return payload.gate === true;
  } catch {
    return false;
  }
}
