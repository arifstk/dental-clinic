// lib/client-api.ts

export type ApiResult<T> = { ok: boolean; status: number; data: T };

export async function apiRequest<T = Record<string, unknown>>(
  url: string,
  opts: { method?: string; body?: unknown } = {},
): Promise<ApiResult<T>> {
  try {
    const hasBody = opts.body !== undefined;
    const res = await fetch(url, {
      method: opts.method ?? (hasBody ? "POST" : "GET"),
      headers: hasBody ? { "Content-Type": "application/json" } : undefined,
      body: hasBody ? JSON.stringify(opts.body) : undefined,
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data: data as T };
  } catch {
    return {
      ok: false,
      status: 0,
      data: { error: "Network error. Please try again." } as T,
    };
  }
}

export function errorMessage(data: unknown): string {
  const d = (data ?? {}) as {
    message?: unknown;
    error?: unknown;
    details?: { fieldErrors?: Record<string, string[]>; formErrors?: string[] };
  };
  if (typeof d.message === "string") return d.message;

  const fieldHit = Object.entries(d.details?.fieldErrors ?? {}).find(
    ([, v]) => v?.length,
  );
  if (fieldHit) return `${fieldHit[0]}: ${fieldHit[1][0]}`;
  if (d.details?.formErrors?.[0]) return d.details.formErrors[0];

  if (typeof d.error === "string") return d.error;
  return "Something went wrong";
}
