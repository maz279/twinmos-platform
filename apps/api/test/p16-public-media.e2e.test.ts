// P8 imagery bridge — public media serving gates:
//   • raster images serve 200 + correct content-type + public cache headers, no auth
//   • unknown ids, non-image kinds, SVG and bogus variants → 404 (existence-safe)
//   • variant param falls back to the original when the manifest lacks an entry
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-p16-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.MAIL_OUTBOX_DIR = join(TMP, 'outbox');
process.env.MEDIA_DIR = join(TMP, 'media');
process.env.FORMS_TO = 'console@twinmos.dev';
process.env.API_ALLOW_NO_TURNSTILE = '1';
process.env.NODE_ENV = 'test';

const MIGRATIONS = join(dirname(dirname(process.cwd())), 'packages', 'db', 'migrations');

const { createDb, mediaAsset }: any = await import('@twinmos/db');
const { migrate } = await import('drizzle-orm/pglite/migrator');
const { buildApp }: any = await import('../src/app.ts');
const { getStorage } = await import('../src/storage.ts');

const db = createDb();
await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
await migrate(db, { migrationsFolder: MIGRATIONS });
const app = buildApp(db);

// 1×1 transparent PNG
const PNG = Uint8Array.from(Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'));

let imgId = 0;
let svgId = 0;
let pdfId = 0;

beforeAll(async () => {
  const storage = getStorage();
  await storage.put('p16/tiny.png', PNG, 'image/png');
  await storage.put('p16/tiny.svg', new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"/>'), 'image/svg+xml');
  const rows = await db.insert(mediaAsset).values([
    { key: 'p16/tiny.png', kind: 'image', alt: 'tiny', width: 1, height: 1, meta: { mime: 'image/png' } },
    { key: 'p16/tiny.svg', kind: 'image', alt: 'svg', meta: { mime: 'image/svg+xml' } },
    { key: 'p16/doc.pdf', kind: 'file', alt: 'doc', meta: { mime: 'application/pdf' } },
  ]).returning();
  imgId = rows[0].id; svgId = rows[1].id; pdfId = rows[2].id;
});

afterAll(async () => {
  await db.$client.close();
  rmSync(TMP, { recursive: true, force: true });
});

describe('P8-1: public media route (imagery bridge)', () => {
  it('serves a raster image without authentication', async () => {
    const res = await app.request(`/api/v1/media/${imgId}/file`);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('image/png');
    expect(res.headers.get('cache-control')).toContain('public');
    const bytes = new Uint8Array(await res.arrayBuffer());
    expect(bytes.length).toBe(PNG.length);
  });

  it('404s unknown ids, non-image kinds, SVG and bogus variants', async () => {
    expect((await app.request('/api/v1/media/999999/file')).status).toBe(404);
    expect((await app.request(`/api/v1/media/${pdfId}/file`)).status).toBe(404);
    expect((await app.request(`/api/v1/media/${svgId}/file`)).status).toBe(404);
    expect((await app.request(`/api/v1/media/${imgId}/file?variant=bogus`)).status).toBe(404);
  });

  it('falls back to the original when the variant manifest lacks an entry', async () => {
    const res = await app.request(`/api/v1/media/${imgId}/file?variant=card`);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('image/png');
  });
});
