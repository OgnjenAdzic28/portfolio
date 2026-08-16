type TimedCacheEntry = {
  expiresAt: number;
  value: Promise<unknown>;
};

const timedCache = new Map<string, TimedCacheEntry>();

export function withTimedCache<T>(
  key: string,
  ttlMilliseconds: number,
  load: () => Promise<T>,
): Promise<T> {
  const now = Date.now();
  const cached = timedCache.get(key);

  if (cached && cached.expiresAt > now) {
    return cached.value as Promise<T>;
  }

  const value = load().catch((error: unknown) => {
    if (timedCache.get(key)?.value === value) {
      timedCache.delete(key);
    }

    throw error;
  });

  timedCache.set(key, {
    expiresAt: now + ttlMilliseconds,
    value,
  });

  return value;
}
