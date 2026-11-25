// Minimal Finnhub client with an in-memory TTL cache and a request-rate limiter
// that keeps us under the free tier (60 calls/minute).

const BASE = "https://finnhub.io/api/v1";
const MAX_PER_MINUTE = 50;

export const hasKey = () => Boolean(process.env.FINNHUB_API_KEY);

const cache = new Map<string, { value: unknown; expires: number }>();
const inflight = new Map<string, Promise<unknown>>();
const callTimes: number[] = [];

async function waitForSlot(): Promise<void> {
  for (;;) {
    const now = Date.now();
    while (callTimes.length && now - callTimes[0] > 60_000) callTimes.shift();
    if (callTimes.length < MAX_PER_MINUTE) {
      callTimes.push(now);
      return;
    }
    await new Promise((r) => setTimeout(r, 60_000 - (now - callTimes[0]) + 50));
  }
}

export async function finnhub<T>(path: string, params: Record<string, string>, ttlMs: number): Promise<T> {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) throw new Error("FINNHUB_API_KEY not set");
  const qs = new URLSearchParams(params).toString();
  const cacheKey = `${path}?${qs}`;
  const hit = cache.get(cacheKey);
  if (hit && hit.expires > Date.now()) return hit.value as T;
  const pending = inflight.get(cacheKey);
  if (pending) return pending as Promise<T>;

  const p = (async () => {
    await waitForSlot();
    const res = await fetch(`${BASE}${path}?${qs}`, { headers: { "X-Finnhub-Token": key } });
    if (!res.ok) throw new Error(`Finnhub ${path} ${res.status}`);
    const value = (await res.json()) as T;
    cache.set(cacheKey, { value, expires: Date.now() + ttlMs });
    return value;
  })();
  inflight.set(cacheKey, p);
  try {
    return await p;
  } finally {
    inflight.delete(cacheKey);
  }
}

/** True when a fresh cached value exists (lets callers avoid queueing behind the limiter). */
export function isCached(path: string, params: Record<string, string>): boolean {
  const hit = cache.get(`${path}?${new URLSearchParams(params).toString()}`);
  return Boolean(hit && hit.expires > Date.now());
}

export function peekCache<T>(path: string, params: Record<string, string>): T | undefined {
  const hit = cache.get(`${path}?${new URLSearchParams(params).toString()}`);
  return hit ? (hit.value as T) : undefined; // stale values are still useful as a fallback
}

export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;
