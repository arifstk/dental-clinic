// lib/cache.ts

import { revalidateTag } from "next/cache";

export const TAGS = {
  settings: "site-settings",
  services: "services",
  dentists: "dentists",
} as const;

export type CacheTag = (typeof TAGS)[keyof typeof TAGS];

export function invalidate(...tags: CacheTag[]) {
  for (const tag of tags) revalidateTag(tag, { expire: 0 });
}

export function failOnBuild(err: unknown) {
  if (process.env.NEXT_PHASE === "phase-production-build") throw err;
}
