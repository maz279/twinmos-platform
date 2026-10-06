// P0 — Stabilization & Guardrails (REMEDIATION_PLAN TM-REM-2026-001).
// Gates: (0.2) /health tells the truth — 200+connected on a live DB,
// 503+degraded when the database is unreachable; (0.3) the PGlite
// single-writer lock refuses second opens with a loud error and reclaims
// stale locks from dead processes.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-p0-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.MAIL_OUTBOX_DIR = join(TMP, 'outbox');
process.env.FORMS_TO = 'console@twinmos.dev';

// Imported after env is set — every createDb()/mailer read these values.
const { createDb, acquireDataDirLock, releaseDataDirLock }: any = await import('@twinmos/db');
const { buildApp }: any = await import('../src/app.ts');

let db: any;
let app: any;

beforeAll(async () => {
  db = createDb();
  app = buildApp(db);
});

afterAll(async () => {
  releaseDataDirLock(process.env.PGLITE_DATA as string);
  rmSync(TMP, { recursive: true, force: true });
});

describe('P0.2: truthful /health', () => {
  it('reports 200 + db:connected when the database answers SELECT 1', async () => {
    const res = await app.request('/api/v1/health');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.db).toBe('connected');
  });

  it('reports 503 + db:unreachable when the database is down (no canned "connected")', async () => {
    // Simulate an unreachable store: an execute() that always rejects,
    // exactly what a corrupted/absent PGlite looks like to the health ping.
    const brokenDb = { execute: () => Promise.reject(new Error('WASM Aborted (simulated)')) };
    const brokenApp = buildApp(brokenDb as any);
    const res = await brokenApp.request('/api/v1/health');
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.status).toBe('degraded');
    expect(body.db).toBe('unreachable');
  });
});

describe('P0.3: PGlite single-writer lock', () => {
  const dir = join(TMP, 'locked-db');

  it('refuses a second acquire from the same process with an actionable error', () => {
    acquireDataDirLock(dir);
    expect(() => acquireDataDirLock(dir)).toThrowError(/already opened by THIS process/);
    releaseDataDirLock(dir);
  });

  it('refuses an open of a data dir owned by a live process (the corruption guard)', () => {
    // A lock naming a LIVE pid must refuse loudly. Our own pid is guaranteed
    // live and exercises the same pidAlive() refusal branch as a foreign
    // live owner, without spawning external processes.
    const lockFile = `${dir}.lock`;
    writeFileSync(lockFile, String(process.pid), 'utf8');
    let msg = '';
    try { acquireDataDirLock(dir); } catch (e) { msg = String(e); }
    expect(msg).toMatch(/PID/);
    expect(msg).toMatch(/single-writer|THIS process/);
    expect(msg).toMatch(/CORRUPTS|reuse the existing handle/);
  });

  it('reclaims a stale lock from a dead PID', () => {
    const lockFile = `${dir}.lock`;
    writeFileSync(lockFile, '999999999', 'utf8'); // no such process anywhere
    expect(() => acquireDataDirLock(dir)).not.toThrow();
    releaseDataDirLock(dir);
  });
});
