// route-cache.ts — In-Memory Route Cache with Tag Invalidation (Task T3.2.3, ADR D-5)
// Compliant with RFC 9111, X-Accel-Expires, and instant CMS publish revalidation.

export interface CacheEntry {
  body: string;
  status: number;
  headers: Record<string, string>;
  tags: Set<string>;
  cachedAt: number;
  expiresAt: number;
}

const ALLOWED_QUERY_PARAMS = new Set(['q', 'cat', 'type', 'page', 'groupKey', 'locale']);

class MemoryRouteCache {
  private cache = new Map<string, CacheEntry>();
  private readonly maxEntries: number;
  private readonly defaultTtlMs: number;

  constructor(maxEntries = 5000, defaultTtlMs = 60_000) {
    this.maxEntries = maxEntries;
    this.defaultTtlMs = defaultTtlMs;
  }

  /**
   * Normalizes URL path and whitelisted query parameters into a canonical cache key.
   * Strips ad/tracking parameters (utm_*, fbclid, etc.) to prevent cache-busting.
   */
  public makeKey(pathname: string, searchParams?: URLSearchParams): string {
    const cleanPath = pathname.replace(/\/$/, '') || '/';
    if (!searchParams || Array.from(searchParams.keys()).length === 0) {
      return cleanPath;
    }

    const filteredParams = new URLSearchParams();
    const sortedKeys = Array.from(searchParams.keys())
      .filter((k) => ALLOWED_QUERY_PARAMS.has(k))
      .sort();

    for (const k of sortedKeys) {
      const val = searchParams.get(k);
      if (val !== null) filteredParams.set(k, val);
    }

    const qs = filteredParams.toString();
    return qs ? `${cleanPath}?${qs}` : cleanPath;
  }

  public get(key: string): CacheEntry | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check expiration
    if (Date.now() > entry.expiresAt) {
      // Entry is stale
      return null;
    }

    return entry;
  }

  /**
   * Retrieves a stale cache entry during an upstream outage (stale-if-error).
   */
  public getStale(key: string): CacheEntry | null {
    return this.cache.get(key) ?? null;
  }

  public has(key: string): boolean {
    return this.cache.has(key);
  }

  public set(
    key: string,
    data: {
      body: string;
      status?: number;
      headers?: Record<string, string>;
      tags?: string[];
      ttlMs?: number;
    }
  ): void {
    if (this.cache.size >= this.maxEntries) {
      // Evict oldest entry (first key in insertion order)
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }

    const ttl = data.ttlMs ?? this.defaultTtlMs;
    const now = Date.now();

    this.cache.set(key, {
      body: data.body,
      status: data.status ?? 200,
      headers: data.headers ?? {},
      tags: new Set(data.tags ?? []),
      cachedAt: now,
      expiresAt: now + ttl,
    });
  }

  /**
   * Invalidates cache entries matching specified paths or tags.
   */
  public invalidate(options: { paths?: string[]; tags?: string[] }): { invalidatedCount: number; remainingCount: number } {
    let invalidatedCount = 0;
    const targetTags = new Set(options.tags ?? []);
    const targetPaths = new Set((options.paths ?? []).map((p) => (p.replace(/\/$/, '') || '/')));

    for (const [key, entry] of this.cache.entries()) {
      let shouldDelete = false;

      // Match by exact path or key prefix
      const entryPath = key.split('?')[0];
      if (targetPaths.has(entryPath) || targetPaths.has(key)) {
        shouldDelete = true;
      }

      // Match by tag intersection
      if (!shouldDelete && targetTags.size > 0) {
        for (const tag of entry.tags) {
          if (targetTags.has(tag)) {
            shouldDelete = true;
            break;
          }
        }
      }

      if (shouldDelete) {
        this.cache.delete(key);
        invalidatedCount++;
      }
    }

    return {
      invalidatedCount,
      remainingCount: this.cache.size,
    };
  }

  public clear(): void {
    this.cache.clear();
  }

  public size(): number {
    return this.cache.size;
  }
}

// Global singleton in-process route cache
export const routeCache = new MemoryRouteCache(5000, 60_000);
