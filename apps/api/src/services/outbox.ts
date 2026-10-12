import { eq, and, sql, asc } from 'drizzle-orm';
import type { DB } from '@twinmos/db';
import { outbox } from '@twinmos/db';

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

  const webUrl = process.env.INTERNAL_WEB_URL || 'http://127.0.0.1:4321';
  const secret = process.env.REVALIDATE_SECRET || 'dev-revalidate-secret';

  let processed = 0;
  let failed = 0;

  for (const row of pendingRows) {
    const payload = (row.payload || {}) as OutboxPayload;
    try {
      const res = await fetch(`${webUrl}/internal/revalidate`, {
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
        const attempts = (row.attempts || 0) + 1;
        const status = attempts >= 5 ? 'failed' : 'pending';
        await db
          .update(outbox)
          .set({
            attempts,
            lastError: `HTTP ${res.status}: ${errText.slice(0, 500)}`,
            status,
          })
          .where(eq(outbox.id, row.id));
        failed++;
      }
    } catch (err: any) {
      const attempts = (row.attempts || 0) + 1;
      const status = attempts >= 5 ? 'failed' : 'pending';
      await db
        .update(outbox)
        .set({
          attempts,
          lastError: err.message ? String(err.message).slice(0, 500) : 'Network error',
          status,
        })
        .where(eq(outbox.id, row.id));
      failed++;
    }
  }

  return { processed, failed };
}

export const dispatchOutboxEvents = dispatchOutbox;
