// lib/admin.ts

import { NextResponse } from "next/server";
import { requireRole } from "./auth";

export const guard = () => requireRole(["admin", "receptionist"]);

export const unauthorized = () =>
  NextResponse.json({ error: "Unauthorized" }, { status: 401 });
export const notFound = () =>
  NextResponse.json({ error: "Not found" }, { status: 404 });
export const invalid = (details?: unknown) =>
  NextResponse.json({ error: "Invalid input", details }, { status: 400 });

export const isValidId = (id: string) => /^[a-f\d]{24}$/i.test(id);

export type IdCtx = { params: Promise<{ id: string }> };
