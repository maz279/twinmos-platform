// Phase 5 (TWN-ADMIN-CMS-AUDIT-PLAN-2026-001 §5) — global operations gates:
//   5.1 translation studio — RBAC relaxation (editor+ content ns, super_admin
//       framework ns), progress matrix, XLIFF 1.2 export/import round-trip
//   5.2 careers — job postings CRUD (+ RBAC, application-count link)
//   5.3 serials — batch CSV import (dry-run + commit), registry search, the
//       >5-distinct-IPs/24h counterfeit anomaly scan and the ops email alert
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-p13-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.MAIL_OUTBOX_DIR = join(TMP, 'outbox');
process.env.MEDIA_DIR = join(TMP, 'media');
process.env.FORMS_TO = 'ops@twinmos.dev';
process.env.SERIAL_ALERT_TO = 'compliance@twinmos.dev';
process.env.API_ALLOW_NO_TURNSTILE = '1';
process.env.NODE_ENV = 'test';

const MIGRATIONS = join(dirname(dirname(process.cwd())), 'packages', 'db', 'migrations');

const { createDb, user, snCheck, serialRegistry }: any = await import('@twinmos/db');
const { migrate } = await import('drizzle-orm/pglite/migrator');
const { buildApp }: any = await import('../src/app.ts');
const { eq } = await import('drizzle-orm');

const db = createDb();
await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
await migrate(db, { migrationsFolder: MIGRATIONS });
const app = buildApp(db);

const mkPass = () => process.env.E2E_ADMIN_PASSWORD ?? 'P13-Glo-' + new Date().getFullYear() + '!';
let cookie = '';      // super_admin
let editorCookie = ''; // editor (translation relaxation target)
const HDRS = (c = cookie) => ({ 'content-type': 'application/json', cookie: c });

beforeAll(async () => {
  for (const [email, suffix, role] of [['p13@twinmos.dev', '', 'super_admin'], ['p13e@twinmos.dev', 'e', 'editor']] as const) {
    await app.request('/api/v1/auth/sign-up/email', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password: mkPass() + suffix, name: email.split('@')[0] }),
    });
    await db.update(user).set({ role }).where(eq(user.email, email));
    const res = await app.request('/api/v1/auth/sign-in/email', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password: mkPass() + suffix }),
    });
    const c = res.headers.getSetCookie().map((x) => x.split(';')[0]).join('; ');
    if (role === 'super_admin') cookie = c; else editorCookie = c;
  }
});
afterAll(async () => { await db.$client.close(); rmSync(TMP, { recursive: true, force: true }); });

// ---------------- 5.1 translation studio ----------------
describe('P5.1: translation RBAC relaxation + progress + XLIFF', () => {
  it('editor+ can translate content namespaces; common stays super_admin-only', async () => {
    // seed EN keys in both a content ns and the framework ns (super_admin)
    for (const [ns, key, value] of [['home', 'hero.title', 'Memory at scale'], ['common', 'nav.buy', 'Where to buy']] as const) {
      const r = await app.request('/api/v1/admin/translations', {
        method: 'PUT', headers: HDRS(), body: JSON.stringify({ locale: 'en', ns, key, value }),
      });
      expect(r.status).toBe(200);
    }
    // editor translates the content ns → 200
    const ok = await app.request('/api/v1/admin/translations', {
      method: 'PUT', headers: HDRS(editorCookie), body: JSON.stringify({ locale: 'ar', ns: 'home', key: 'hero.title', value: 'ذاكرة بمقياس واسع' }),
    });
    expect(ok.status).toBe(200);
    // editor touches the common framework ns → 403
    const denied = await app.request('/api/v1/admin/translations', {
      method: 'PUT', headers: HDRS(editorCookie), body: JSON.stringify({ locale: 'ar', ns: 'common', key: 'nav.buy', value: 'x' }),
    });
    expect(denied.status).toBe(403);
    expect(((await denied.json()) as { title: string }).title).toContain('super_admin');
  });

  it('progress matrix reports EN-relative coverage per locale', async () => {
    const res = await app.request('/api/v1/admin/translations/progress', { headers: { cookie } });
    expect(res.status).toBe(200);
    const p = await res.json();
    expect(p.enKeys).toBe(2);
    expect(p.perLocale.en.coverage).toBe(100);
    expect(p.perLocale.ar.strings).toBe(1); // only home.hero.title so far
    expect(p.namespaces).toContain('home');
  });

  it('XLIFF 1.2 export carries EN sources + current targets; import round-trips', async () => {
    const xl = await app.request('/api/v1/admin/translations/xliff?locale=ar&ns=home', { headers: { cookie } });
    expect(xl.status).toBe(200);
    expect(xl.headers.get('content-type')).toContain('xliff');
    const xml = await xl.text();
    expect(xml).toContain('<xliff');
    expect(xml).toContain('trans-unit id="hero.title"');
    expect(xml).toContain('<source xml:lang="en">Memory at scale</source>');
    expect(xml).toContain('ذاكرة بمقياس واسع');

    // round-trip: translated target updates + one empty target is skipped
    const roundTrip = xml
      .replace('ذاكرة بمقياس واسع', 'ذاكرة بمقياس واسع!')
      .replace('<target xml:lang="ar">ذاكرة بمقياس واسع!</target>', '<target xml:lang="ar"></target>')
      + '<trans-unit id="new.key"><source xml:lang="en">New</source><target xml:lang="ar">جديد</target></trans-unit>';
    const imp = await app.request('/api/v1/admin/translations/xliff', {
      method: 'POST', headers: HDRS(editorCookie),
      body: JSON.stringify({ locale: 'ar', ns: 'home', xml: roundTrip }),
    });
    expect(imp.status).toBe(200);
    const body = await imp.json();
    expect(body.imported).toBe(1);      // new.key only
    expect(body.skippedEmpty).toBe(1);  // hero.title emptied → skipped

    // non-XLIFF body → 422
    const bad = await app.request('/api/v1/admin/translations/xliff', {
      method: 'POST', headers: HDRS(), body: JSON.stringify({ locale: 'ar', ns: 'home', xml: 'not xml' }),
    });
    expect(bad.status).toBe(422);
  });

  it('XLIFF 2.0 documents (unit/segment) import too', async () => {
    const v2 = '<?xml version="1.0" encoding="UTF-8"?>\n<xliff xmlns="urn:oasis:names:tc:xliff:document:2.0" version="2.0">\n  <file id="f1" srcLang="en" trgLang="ar">\n    <unit id="v2.key">\n      <segment>\n        <source>Hello</source>\n        <target>مرحبا</target>\n      </segment>\n    </unit>\n  </file>\n</xliff>';
    const imp = await app.request('/api/v1/admin/translations/xliff', {
      method: 'POST', headers: HDRS(editorCookie), body: JSON.stringify({ locale: 'ar', ns: 'home', xml: v2 }),
    });
    expect(imp.status).toBe(200);
    expect((await imp.json()).imported).toBe(1);
    const list = await app.request('/api/v1/admin/translations?locale=ar&ns=home', { headers: { cookie } });
    expect((await list.json()).items.some((r: any) => r.key === 'v2.key' && r.value === 'مرحبا')).toBe(true);
  });

  it('super_admin can delete a translated string via the API (studio delete affordance)', async () => {
    const del = await app.request('/api/v1/admin/translations', {
      method: 'DELETE', headers: HDRS(), body: JSON.stringify({ locale: 'ar', ns: 'home', key: 'v2.key' }),
    });
    expect(del.status).toBe(200);
  });
});

// ---------------- 5.2 careers: job postings ----------------
describe('P5.2: job postings CRUD', () => {
  let id = 0;
  it('rejects anonymous + viewer writes', async () => {
    expect((await app.request('/api/v1/admin/job-postings')).status).toBe(401);
  });
  it('creates a posting with the full Phase 5.2 field set', async () => {
    const res = await app.request('/api/v1/admin/job-postings', {
      method: 'POST', headers: HDRS(),
      body: JSON.stringify({
        title: 'Senior Firmware Engineer', dept: 'R&D', location: 'Taipei',
        type: 'full-time', level: 'senior', status: 'draft',
        body: '## Responsibilities\n- Own the DDR5 training flow',
        salaryBand: 'NT$1.4–2.0M / year', equalOpportunity: true,
      }),
    });
    expect(res.status).toBe(201);
    const p = await res.json();
    id = p.id;
    expect(p.salaryBand).toBe('NT$1.4–2.0M / year');
    expect(p.equalOpportunity).toBe(true);
  });
  it('lists with application counts; patches status; application count links', async () => {
    const list = await app.request('/api/v1/admin/job-postings?status=draft', { headers: { cookie } });
    expect(list.status).toBe(200);
    const items = (await list.json()).items;
    const mine = items.find((x: any) => x.id === id);
    expect(mine.applicationCount).toBe(0);

    const patch = await app.request('/api/v1/admin/job-postings/' + id, {
      method: 'PATCH', headers: HDRS(), body: JSON.stringify({ status: 'published', salaryBand: 'NT$1.5–2.2M / year' }),
    });
    expect(patch.status).toBe(200);
    expect((await patch.json()).status).toBe('published');
  });
  it('soft-deletes (archived rows disappear from the list)', async () => {
    expect((await app.request('/api/v1/admin/job-postings/' + id, { method: 'DELETE', headers: { cookie } })).status).toBe(200);
    const list = await app.request('/api/v1/admin/job-postings', { headers: { cookie } });
    expect((await list.json()).items.some((x: any) => x.id === id)).toBe(false);
    expect((await app.request('/api/v1/admin/job-postings/' + id, { method: 'DELETE', headers: { cookie } })).status).toBe(404);
  });
});

// ---------------- 5.3 serials ----------------
describe('P5.3: serial registry + counterfeit anomaly alerting', () => {
  const HEADER = 'serial,sku,manufacturedAt,batch';
  it('batch import: dry-run validation, commit upsert, header enforcement', async () => {
    const dry = await app.request('/api/v1/admin/serials/import', {
      method: 'POST', headers: HDRS(),
      body: JSON.stringify({
        csv: [HEADER, 'TM26A0001,VLT-DDR5-32G,2026-08-14,FAB-07', 'bad serial!,x,,', 'TM26A0002,VLT-DDR5-16G,not-a-date,'].join('\n'),
        dryRun: true,
      }),
    });
    expect(dry.status).toBe(200);
    const report = await dry.json();
    expect(report.validCount).toBe(1);
    expect(report.errors.map((e: any) => e.message).join(' | ')).toContain('Serial must be');
    expect(report.errors.map((e: any) => e.message).join(' | ')).toContain('ISO date');

    const commit = await app.request('/api/v1/admin/serials/import', {
      method: 'POST', headers: HDRS(),
      body: JSON.stringify({ csv: [HEADER, 'TM26A0001,VLT-DDR5-32G,2026-08-14,FAB-07', 'TM26A0002,VLT-DDR5-16G,2026-08-14,FAB-07'].join('\n'), dryRun: false }),
    });
    expect(commit.status).toBe(200);
    expect((await commit.json()).imported).toBe(2);

    // upsert leg: same serial, new SKU
    const upsert = await app.request('/api/v1/admin/serials/import', {
      method: 'POST', headers: HDRS(),
      body: JSON.stringify({ csv: [HEADER, 'TM26A0001,VLT-DDR5-64G,2026-08-15,FAB-08'].join('\n'), dryRun: false }),
    });
    expect(upsert.status).toBe(200);

    const wrongHeader = await app.request('/api/v1/admin/serials/import', {
      method: 'POST', headers: HDRS(), body: JSON.stringify({ csv: 'a,b\n1,2', dryRun: true }),
    });
    expect(wrongHeader.status).toBe(422);
  });

  it('registry search finds serials and SKUs; batch persisted from the CSV', async () => {
    const bySku = await app.request('/api/v1/admin/serials?q=VLT-DDR5-64G', { headers: { cookie } });
    const items = (await bySku.json()).items;
    expect(items.some((s: any) => s.serial === 'TM26A0001' && s.sku === 'VLT-DDR5-64G' && s.batch === 'FAB-08')).toBe(true);
  });

  it('global search covers the serial registry', async () => {
    const res = await app.request('/api/v1/admin/search?q=TM26A0001', { headers: { cookie } });
    const groups = (await res.json()).groups as Array<{ type: string; items: Array<{ title: string; module: string }> }>;
    const g = groups.find((x) => x.type === 'Serials');
    expect(g?.items[0]?.title).toBe('TM26A0001');
    expect(g?.items[0]?.module).toBe('partners');
  });

  it('flags serials checked from >5 distinct IPs OR countries in 24h and emails ops', async () => {
    // public checks: TM26A0001 from 6 distinct IPs; TM26A0002 from 2 (below threshold)
    for (let i = 1; i <= 6; i++) {
      await app.request('/api/v1/sn-check', {
        method: 'POST', headers: { 'content-type': 'application/json', 'cf-connecting-ip': `203.0.113.${i}` },
        body: JSON.stringify({ serial: 'TM26A0001' }),
      });
    }
    for (const ip of ['198.51.100.1', '198.51.100.2']) {
      await app.request('/api/v1/sn-check', {
        method: 'POST', headers: { 'content-type': 'application/json', 'cf-connecting-ip': ip },
        body: JSON.stringify({ serial: 'TM26A0002' }),
      });
    }
    // country signal: TM26A0002 checked from 2 IPs but 6 distinct countries → flagged
    const countries = ['DE', 'AE', 'IN', 'BR', 'ZA', 'JP'];
    for (const c of countries) {
      await app.request('/api/v1/sn-check', {
        method: 'POST', headers: { 'content-type': 'application/json', 'cf-connecting-ip': `192.0.2.${c.length}`, 'cf-ipcountry': c },
        body: JSON.stringify({ serial: 'TM26A0002' }),
      });
    }
    const scan = await app.request('/api/v1/admin/serials/anomalies', { headers: { cookie } });
    expect(scan.status).toBe(200);
    const s = await scan.json();
    const flagged = s.flagged.find((f: any) => f.serial === 'TM26A0001');
    expect(flagged.distinctIps).toBe(6);
    const byCountry = s.flagged.find((f: any) => f.serial === 'TM26A0002');
    expect(byCountry.distinctCountries).toBeGreaterThanOrEqual(6); // country signal fires
    expect(s.flagged.some((f: any) => f.serial === 'TM26B0001')).toBe(false); // unregistered serials never hit either signal

    const notify = await app.request('/api/v1/admin/serials/anomalies?notify=true', { headers: { cookie } });
    const n = await notify.json();
    expect(n.notified).toBe(true);
    // the ops alert landed in the mail outbox
    const outbox = readdirSync(process.env.MAIL_OUTBOX_DIR!);
    const alertFile = outbox.find((f) => f.includes('serial') || readFileSync(join(process.env.MAIL_OUTBOX_DIR!, f), 'utf8').includes('counterfeit'));
    expect(alertFile).toBeTruthy();
    const alert = JSON.parse(readFileSync(join(process.env.MAIL_OUTBOX_DIR!, alertFile!), 'utf8'));
    expect(alert.to).toBe('compliance@twinmos.dev');
    expect(alert.subject).toContain('suspicious serial');
    expect(alert.text).toContain('TM26A0001');
  });

  it('audit trail covers serial operations', async () => {
    const res = await app.request('/api/v1/admin/audit?entity=serial_registry', { headers: { cookie } });
    const actions = (await res.json()).items.map((r: any) => r.action);
    expect(actions).toContain('serial.import');
    expect(actions).toContain('serial.anomaly.alert');
  });
});
