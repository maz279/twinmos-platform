// TTL + size-bounded in-memory key/value store for idempotency replays.
// Replaces the never-evicting Maps: entries expire (default 30 minutes) and the
// store refuses to grow past a hard cap, so a flood of unique keys cannot
// exhaust memory. Production moves this to Redis (docs/02) — same semantics.
const DEFAULT_TTL_MS = Number(process.env.IDEMPOTENCY_TTL_MS ?? 30 * 60 * 1000);
const DEFAULT_MAX = 10_000;

type Entry = { value: unknown; expiresAt: number };

export class IdempotencyStore {
  private map = new Map<string, Entry>();
  private lastSweep = 0;
  private ttlMs: number;
  private maxEntries: number;

  constructor(ttlMs = DEFAULT_TTL_MS, maxEntries = DEFAULT_MAX) {
    this.ttlMs = ttlMs;
    this.maxEntries = maxEntries;
  }

  get(key: string): unknown {
    this.maybeSweep();
    const hit = this.map.get(key);
    if (!hit) return undefined;
    if (hit.expiresAt < Date.now()) {
      this.map.delete(key);
      return undefined;
    }
    return hit.value;
  }

  set(key: string, value: unknown): void {
    this.maybeSweep();
    // hard cap with FIFO eviction — replay windows are short, oldest keys are
    // the least likely to be re-sent
    if (this.map.size >= this.maxEntries && !this.map.has(key)) {
      const oldest = this.map.keys().next().value;
      if (oldest !== undefined) this.map.delete(oldest);
    }
    this.map.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  /** Cheap periodic sweep: at most once per TTL/2, drops everything expired. */
  private maybeSweep(): void {
    const now = Date.now();
    if (now - this.lastSweep < this.ttlMs / 2) return;
    this.lastSweep = now;
    for (const [k, v] of this.map) {
      if (v.expiresAt < now) this.map.delete(k);
    }
  }
}
