import { eq, and, sql, asc } from 'drizzle-orm';
import type { DB } from '@twinmos/db';
import { outbox } from '@twinmos/db';
import { alertManager } from './alerts.ts';

export interface OutboxPayload {
  tags?: string[];
  paths?: string[];
  entityType?: string;
  entityId?: string | number;
  slug?: string;
  action?: 'publish' | 'unpublish' | 'archive' | 'delete' | 'update' | string;
  [key: string]: unknown;
}

/**
 * Records an event in the outbox table within the caller's transaction/flow.
 * Closes Z-06 / Task T3.5.3.
 */
export async function recordOutboxEvent(
  db: DB,
  eventType: string,
  payload: OutboxPayload
): Promise<number> {
  const [row] = await db
    .insert(outbox)
    .values({
      eventType,
      payload,
      status: 'pending',
      attempts: 0,
      createdAt: new Date(),
    })
    .returning({ id: outbox.id });

  return row.id;
}

/**
 * Dispatches pending outbox events to the web tier's /internal/revalidate endpoint.
 * Enforces exponential backoff and production INTERNAL_WEB_URL requirement (Task T3.5.4).
 */
export async function dispatchOutbox(db: DB): Promise<{ processed: number; failed: number }> {
  const pendingRows = await db
    .select()
    .from(outbox)
    .where(eq(outbox.status, 'pending'))
    .orderBy(asc(outbox.createdAt))
    .limit(50);

  if (pendingRows.length === 0) {
    return { processed: 0, failed: 0 };
  }

  // T7.2.4: Check for outbox queue stall / backlog
  if (pendingRows.length >= 50) {
    alertManager.recordOutboxStall(pendingRows.length);
  }

  const isProd = process.env.NODE_ENV === 'production';
  const webUrl = process.env.INTERNAL_WEB_URL || (isProd ? '' : 'http://127.0.0.1:4321');
  if (isProd && !webUrl) {
    throw new Error('INTERNAL_WEB_URL environment variable is strictly required in production (T3.5.4)');
  }
  const targetWebUrl = webUrl || 'http://127.0.0.1:4321';
  const secret = process.env.REVALIDATE_SECRET || 'dev-revalidate-secret';

  let processed = 0;
  let failed = 0;
  const now = Date.now();

  for (const row of pendingRows) {
    // Exponential backoff check (T3.5.4 item 2)
    const attempts = row.attempts || 0;
    if (attempts > 0) {
      const backoffMs = Math.min(1000 * Math.pow(2, attempts - 1), 30_000);
      const createdTime = row.createdAt ? new Date(row.createdAt).getTime() : now;
      if (now - createdTime < backoffMs) {
        // Backoff interval hasn't elapsed yet; skip for now
        continue;
      }
    }

    const payload = (row.payload || {}) as OutboxPayload;
    try {
      const res = await fetch(`${targetWebUrl}/internal/revalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Revalidate-Secret': secret,
        },
        body: JSON.stringify({
          secret,
          tags: payload.tags || [],
          paths: payload.paths || [],
        }),
      });

      if (res.ok) {
        await db
          .update(outbox)
          .set({
            status: 'processed',
            processedAt: new Date(),
          })
          .where(eq(outbox.id, row.id));
        processed++;
      } else {
        const errText = await res.text().catch(() => 'Unknown HTTP error');
        const nextAttempts = attempts + 1;
        const nextStatus = nextAttempts >= 5 ? 'failed' : 'pending';
        await db
          .update(outbox)
          .set({
            attempts: nextAttempts,
            lastError: `HTTP ${res.status}: ${errText.slice(0, 500)}`,
            status: nextStatus,
          })
          .where(eq(outbox.id, row.id));
        failed++;
        alertManager.recordOutboxFailure(pendingRows.length, `HTTP ${res.status}: ${errText.slice(0, 200)}`);
      }
    } catch (err: any) {
      const nextAttempts = attempts + 1;
      const nextStatus = nextAttempts >= 5 ? 'failed' : 'pending';
      await db
        .update(outbox)
        .set({
          attempts: nextAttempts,
          lastError: err.message ? String(err.message).slice(0, 500) : 'Network error',
          status: nextStatus,
        })
        .where(eq(outbox.id, row.id));
      failed++;
      alertManager.recordOutboxFailure(pendingRows.length, err.message ? String(err.message).slice(0, 200) : 'Network error');
    }
  }

  return { processed, failed };
}

export const dispatchOutboxEvents = dispatchOutbox;

/**
 * Starts automatic outbox dispatcher interval worker (Task T3.5.4 item 1).
 */
export function startOutboxDispatcher(db: DB, intervalMs = 2000): ReturnType<typeof setInterval> {
  const tick = async () => {
    try {
      await dispatchOutbox(db);
    } catch (err) {
      if (process.env.NODE_ENV !== 'test') {
        console.error('[outbox-dispatcher]', err);
      }
    }
  };
  return setInterval(tick, intervalMs);
}
