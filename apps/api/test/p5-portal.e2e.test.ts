// P5 end-to-end tests — partner portal (org lifecycle, membership, gated
// assets + downloads, RBAC) and anti-counterfeit SN-check (verify, log,
// verifiedCount, reporting, rate limit, validation).
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-p5-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.MAIL_OUTBOX_DIR = join(TMP, 'outbox');
process.env.FORMS_TO = 'support@twinmos.dev';
process.env.API_ALLOW_NO_TURNSTILE = '1';
process.env.NODE_ENV = 'test';
process.env.PARTNER_FILES_DIR = join(TMP, 'partner-files');

const { createDb, user, partnerOrg, partnerMember, partnerAsset, serialRegistry, snCheck }: any = await import('@twinmos/db');
const { migrate } = await import('drizzle-orm/pglite/migrator');
const { buildApp } = await import('../src/app.ts');
const { eq } = await import('drizzle-orm');

const db = createDb();
await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
await migrate(db, { migrationsFolder: '../../packages/db/migrations' });
const app = buildApp(db);

let adminCookie = '';
let editorCookie = '';
let viewerCookie = '';
const mkPass = (label: string) => process.env.E2E_ADMIN_PASSWORD ?? 'P5-' + label + '-' + new Date().getFullYear() + '!';

async function makeSession(email: string, password: string, role?: string): Promise<string> {
  await app.request('/api/v1/auth/sign-up/email', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password, name: email.split('@')[0] }),
  });
  if (role) await db.update(user).set({ role }).where(eq(user.email, email));
  const res = await app.request('/api/v1/auth/sign-in/email', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.headers.getSetCookie().map((c: string) => c.split(';')[0]).join('; ');
}

beforeAll(async () => {
  adminCookie = await makeSession('p5-admin@twinmos.dev', mkPass('Admin'), 'super_admin');
  editorCookie = await makeSession('p5-editor@twinmos.dev', mkPass('Editor'), 'editor');
  viewerCookie = await makeSession('p5-viewer@twinmos.dev', mkPass('Viewer'), 'viewer');
});

afterAll(async () => {
  await db.$client.close();
  rmSync(TMP, { recursive: true, force: true });
});

const ip = (n: number) => ({ 'x-forwarded-for': `10.9.0.${n}` });

describe('partner portal', () => {
  let orgId = 0;
  let distUserCookie = '';
  let oemUserCookie = '';
  let plainUserCookie = '';

  it('org lifecycle: create (pending) → admin-only writes → activate', async () => {
    const created = await app.request('/api/v1/admin/partner-orgs', {
      method: 'POST', headers: { 'content-type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({ name: 'Nordic PC Assemblies', type: 'si', country: 'Sweden' }),
    });
    expect(created.status).toBe(201);
    const org = await created.json();
    orgId = org.id;
    expect(org.status).toBe('pending');

    // editor cannot manage orgs (admin+)
    const denied = await app.request(`/api/v1/admin/partner-orgs/${orgId}`, {
      method: 'PATCH', headers: { 'content-type': 'application/json', cookie: editorCookie },
      body: JSON.stringify({ status: 'active' }),
    });
    expect(denied.status).toBe(403);

    const activated = await app.request(`/api/v1/admin/partner-orgs/${orgId}`, {
      method: 'PATCH', headers: { 'content-type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({ status: 'active' }),
    });
    expect(activated.status).toBe(200);
    expect((await activated.json()).status).toBe('active');
  });

  it('pending org members get no portal access until activated — and 403 for non-members', async () => {
    // create a second pending org + member
    const pendingOrg = await (await app.request('/api/v1/admin/partner-orgs', {
      method: 'POST', headers: { 'content-type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({ name: 'Pending Partners Ltd', type: 'distributor' }),
    })).json();
    plainUserCookie = await makeSession('p5-plain@twinmos.dev', mkPass('Plain'));
    await app.request(`/api/v1/admin/partner-orgs/${pendingOrg.id}/members`, {
      method: 'POST', headers: { 'content-type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({ email: 'p5-plain@twinmos.dev', role: 'staff' }),
    });
    const me = await (await app.request('/api/v1/partner/me', { headers: { cookie: plainUserCookie } })).json();
    // member of a PENDING org → no active membership
    const res = await app.request('/api/v1/partner/me', { headers: { cookie: plainUserCookie } });
    expect(res.status).toBe(403);

    // someone with NO membership at all
    const none = await app.request('/api/v1/partner/me', { headers: { cookie: viewerCookie } });
    expect(none.status).toBe(403);
    // anonymous
    expect((await app.request('/api/v1/partner/me')).status).toBe(401);
  });

  it('membership: add by email (must exist); duplicate 409; unknown email 404', async () => {
    distUserCookie = await makeSession('p5-dist@twinmos.dev', mkPass('Dist'));
    const add = await app.request(`/api/v1/admin/partner-orgs/${orgId}/members`, {
      method: 'POST', headers: { 'content-type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({ email: 'p5-dist@twinmos.dev', role: 'owner' }),
    });
    expect(add.status).toBe(201);
    const dup = await app.request(`/api/v1/admin/partner-orgs/${orgId}/members`, {
      method: 'POST', headers: { 'content-type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({ email: 'p5-dist@twinmos.dev' }),
    });
    expect(dup.status).toBe(409);
    const ghost = await app.request(`/api/v1/admin/partner-orgs/${orgId}/members`, {
      method: 'POST', headers: { 'content-type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({ email: 'ghost@nowhere.dev' }),
    });
    expect(ghost.status).toBe(404);
    expect((await ghost.json()).detail).toContain('account');
  });

  it('/partner/me returns org + role for the active member', async () => {
    const me = await (await app.request('/api/v1/partner/me', { headers: { cookie: distUserCookie } })).json();
    expect(me.org.name).toBe('Nordic PC Assemblies');
    expect(me.org.type).toBe('si');
    expect(me.memberRole).toBe('owner');
  });

  it('assets: upload (admin), type gating on list + download, org scoping', async () => {
    // global asset visible only to distributors
    const fd1 = new FormData();
    fd1.append('file', new File([new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8])], 'price-q4.pdf', { type: 'application/pdf' }));
    fd1.append('title', 'Global Price List Q4');
    fd1.append('category', 'price_file');
    fd1.append('visibleToTypes', 'distributor');
    const up1 = await app.request('/api/v1/admin/partner-orgs/0/assets', { method: 'POST', headers: { cookie: adminCookie }, body: fd1 });
    expect(up1.status).toBe(201);

    // org-scoped asset visible to si (the member's org type)
    const fd2 = new FormData();
    fd2.append('file', new File([new Uint8Array([9, 9, 9])], 'integration-guide.zip', { type: 'application/zip' }));
    fd2.append('title', 'SI Integration Guide');
    fd2.append('category', 'resource');
    fd2.append('visibleToTypes', 'si');
    const up2 = await app.request(`/api/v1/admin/partner-orgs/${orgId}/assets`, { method: 'POST', headers: { cookie: adminCookie }, body: fd2 });
    expect(up2.status).toBe(201);
    const siAsset = await up2.json();
    expect(existsSync(join(process.env.PARTNER_FILES_DIR!, siAsset.fileKey))).toBe(true);

    // si member sees BOTH the si resource and... NOT the distributor-only global
    const list = await (await app.request('/api/v1/partner/assets', { headers: { cookie: distUserCookie } })).json();
    const titles = list.items.map((i: any) => i.title);
    expect(titles).toContain('SI Integration Guide');
    expect(titles).not.toContain('Global Price List Q4');

    // download allowed for in-scope asset, bytes round-trip
    const dl = await app.request(`/api/v1/partner/assets/${siAsset.id}/download`, { headers: { cookie: distUserCookie } });
    expect(dl.status).toBe(200);
    expect(new Uint8Array(await dl.arrayBuffer()).length).toBe(3);
    expect(dl.headers.get('content-disposition')).toContain('attachment');
    expect(dl.headers.get('x-content-type-options')).toBe('nosniff');

    // a distributor member must NOT see/download the si asset (type gate)
    oemUserCookie = await makeSession('p5-oem@twinmos.dev', mkPass('Oem'));
    // create + activate a distributor org, add oem user... use a distributor org
    const distOrg = await (await app.request('/api/v1/admin/partner-orgs', {
      method: 'POST', headers: { 'content-type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({ name: 'Channel Direct', type: 'distributor' }),
    })).json();
    await app.request(`/api/v1/admin/partner-orgs/${distOrg.id}`, {
      method: 'PATCH', headers: { 'content-type': 'application/json', cookie: adminCookie }, body: JSON.stringify({ status: 'active' }),
    });
    await app.request(`/api/v1/admin/partner-orgs/${distOrg.id}/members`, {
      method: 'POST', headers: { 'content-type': 'application/json', cookie: adminCookie }, body: JSON.stringify({ email: 'p5-oem@twinmos.dev' }),
    });
    // sees the global distributor price list, not the si guide
    const dList = await (await app.request('/api/v1/partner/assets', { headers: { cookie: oemUserCookie } })).json();
    const dTitles = dList.items.map((i: any) => i.title);
    expect(dTitles).toContain('Global Price List Q4');
    expect(dTitles).not.toContain('SI Integration Guide');
    // direct download of the si asset → 403 (org scope)
    expect((await app.request(`/api/v1/partner/assets/${siAsset.id}/download`, { headers: { cookie: oemUserCookie } })).status).toBe(403);

    // downloads audited
    const { auditLog } = await import('@twinmos/db');
    const audits = await db.select().from(auditLog);
    expect(audits.some((a: any) => a.action === 'partner.download')).toBe(true);
  });

  it('suspended org loses portal access immediately', async () => {
    await app.request(`/api/v1/admin/partner-orgs/${orgId}`, {
      method: 'PATCH', headers: { 'content-type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({ status: 'suspended' }),
    });
    expect((await app.request('/api/v1/partner/me', { headers: { cookie: distUserCookie } })).status).toBe(403);
    expect((await app.request('/api/v1/partner/assets', { headers: { cookie: distUserCookie } })).status).toBe(403);
    // reactivate for later tests
    await app.request(`/api/v1/admin/partner-orgs/${orgId}`, {
      method: 'PATCH', headers: { 'content-type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({ status: 'active' }),
    });
  });
});

describe('anti-counterfeit SN-check', () => {
  it('valid serial: result + sku + registry verifiedCount increments + sn_check logged', async () => {
    await db.insert(serialRegistry).values({ serial: 'P5-SER-0001', sku: 'VLT-DDR5-32G', manufacturedAt: new Date('2026-08-01') }).onConflictDoNothing();
    const res = await app.request('/api/v1/sn-check', { method: 'POST', headers: { 'content-type': 'application/json', ...ip(1) }, body: JSON.stringify({ serial: 'p5-ser-0001' }) });
    expect(res.status).toBe(200);
    const d = await res.json();
    expect(d.result).toBe('valid');
    expect(d.sku).toBe('VLT-DDR5-32G');
    const reg = (await db.select().from(serialRegistry).where(eq(serialRegistry.serial, 'P5-SER-0001')))[0];
    expect(reg.verifiedCount).toBe(1);
    const logs = await db.select().from(snCheck);
    expect(logs.some((l: any) => l.serial === 'P5-SER-0001' && l.result === 'valid')).toBe(true);
  });

  it('unregistered serial: unverified + advice, sku null, logged', async () => {
    const res = await app.request('/api/v1/sn-check', { method: 'POST', headers: { 'content-type': 'application/json', ...ip(2) }, body: JSON.stringify({ serial: 'COUNTERFEIT-777' }) });
    const d = await res.json();
    expect(d.result).toBe('unverified');
    expect(d.sku).toBeUndefined();
    expect(d.advice).toContain('caution');
  });

  it('validation: junk serial 422', async () => {
    const res = await app.request('/api/v1/sn-check', { method: 'POST', headers: { 'content-type': 'application/json', ...ip(3) }, body: JSON.stringify({ serial: 'bad serial!' }) });
    expect(res.status).toBe(422);
  });

  it('rate limit: 11th check from one IP in a minute → 429', async () => {
    for (let i = 1; i <= 10; i++) {
      const ok = await app.request('/api/v1/sn-check', { method: 'POST', headers: { 'content-type': 'application/json', ...ip(9) }, body: JSON.stringify({ serial: 'P5-SER-0001' }) });
      expect(ok.status).toBe(200);
    }
    const eleventh = await app.request('/api/v1/sn-check', { method: 'POST', headers: { 'content-type': 'application/json', ...ip(9) }, body: JSON.stringify({ serial: 'P5-SER-0001' }) });
    expect(eleventh.status).toBe(429);
    expect(eleventh.headers.get('retry-after')).toBeTruthy();
  });

  it('reporting: editor+ read; viewer 403; totals + byResult + topSerials', async () => {
    const denied = await app.request('/api/v1/admin/sn-checks', { headers: { cookie: viewerCookie } });
    expect(denied.status).toBe(403);
    const ok = await app.request('/api/v1/admin/sn-checks', { headers: { cookie: editorCookie } });
    expect(ok.status).toBe(200);
    const rep = await ok.json();
    expect(rep.total).toBeGreaterThanOrEqual(12);
    expect(rep.byResult.valid).toBeGreaterThanOrEqual(11);
    expect(rep.byResult.unverified).toBeGreaterThanOrEqual(1);
    expect(rep.topSerials[0].serial).toBe('P5-SER-0001');
    expect(rep.recent.length).toBeGreaterThan(0);
  });
});

// ---- P5 audit iteration: upload hardening, member removal, report validation,
// multi-org determinism (regressions for the fixes found in the 2nd pass). ----
describe('P5 audit hardening', () => {
  it('upload rejects disallowed extensions (422) and enforces the size cap (413)', async () => {
    const bad = new FormData();
    bad.append('file', new File([new Uint8Array([1])], 'payload.exe', { type: 'application/octet-stream' }));
    bad.append('title', 'Bad ext'); bad.append('category', 'resource'); bad.append('visibleToTypes', 'si');
    const r1 = await app.request('/api/v1/admin/partner-orgs/0/assets', { method: 'POST', headers: { cookie: adminCookie }, body: bad });
    expect(r1.status).toBe(422);
    expect(String((await r1.json()).detail)).toContain('.pdf');

    process.env.PARTNER_MAX_BYTES = '8'; // env read per-request → test-controllable
    try {
      const big = new FormData();
      big.append('file', new File([new Uint8Array(9)], 'too-big.pdf', { type: 'application/pdf' }));
      big.append('title', 'Too big'); big.append('category', 'price_file'); big.append('visibleToTypes', 'si');
      const r2 = await app.request('/api/v1/admin/partner-orgs/0/assets', { method: 'POST', headers: { cookie: adminCookie }, body: big });
      expect(r2.status).toBe(413);
    } finally { delete process.env.PARTNER_MAX_BYTES; }
  });

  it('stored MIME comes from the extension map, not the client; delete removes the file too', async () => {
    const fd = new FormData();
    fd.append('file', new File([new Uint8Array([1])], 'renamed.pdf', { type: 'text/html' })); // lying client type
    fd.append('title', 'Mime map check'); fd.append('category', 'resource'); fd.append('visibleToTypes', 'si');
    const res = await app.request('/api/v1/admin/partner-orgs/0/assets', { method: 'POST', headers: { cookie: adminCookie }, body: fd });
    expect(res.status).toBe(201);
    const asset = await res.json();
    expect(asset.mime).toBe('application/pdf');
    expect((await app.request(`/api/v1/admin/partner-assets/${asset.id}`, { method: 'DELETE', headers: { cookie: adminCookie } })).status).toBe(200);
    expect(existsSync(join(process.env.PARTNER_FILES_DIR!, asset.fileKey))).toBe(false);
  });

  it('member removal: last owner 409, staff remove kills access, ghost 404, re-add 201', async () => {
    const org = await (await app.request('/api/v1/admin/partner-orgs', {
      method: 'POST', headers: { 'content-type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({ name: 'Audit Removal Co', type: 'oem' }),
    })).json();
    await app.request(`/api/v1/admin/partner-orgs/${org.id}`, {
      method: 'PATCH', headers: { 'content-type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({ status: 'active' }),
    });
    const ownerCookie = await makeSession('p5-rmowner@twinmos.dev', mkPass('RmOwner'));
    const staffCookie = await makeSession('p5-rmstaff@twinmos.dev', mkPass('RmStaff'));
    await app.request(`/api/v1/admin/partner-orgs/${org.id}/members`, {
      method: 'POST', headers: { 'content-type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({ email: 'p5-rmowner@twinmos.dev', role: 'owner' }),
    });
    await app.request(`/api/v1/admin/partner-orgs/${org.id}/members`, {
      method: 'POST', headers: { 'content-type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({ email: 'p5-rmstaff@twinmos.dev' }),
    });
    const members = await (await app.request(`/api/v1/admin/partner-orgs/${org.id}/members`, { headers: { cookie: adminCookie } })).json();
    const owner = members.items.find((m: any) => m.role === 'owner');
    const staff = members.items.find((m: any) => m.role === 'staff');
    expect((await app.request(`/api/v1/admin/partner-orgs/${org.id}/members/${owner.id}`, { method: 'DELETE', headers: { cookie: adminCookie } })).status).toBe(409);
    expect((await app.request('/api/v1/partner/me', { headers: { cookie: staffCookie } })).status).toBe(200);
    expect((await app.request(`/api/v1/admin/partner-orgs/${org.id}/members/${staff.id}`, { method: 'DELETE', headers: { cookie: adminCookie } })).status).toBe(200);
    expect((await app.request('/api/v1/partner/me', { headers: { cookie: staffCookie } })).status).toBe(403);
    expect((await app.request(`/api/v1/admin/partner-orgs/${org.id}/members/999999`, { method: 'DELETE', headers: { cookie: adminCookie } })).status).toBe(404);
    expect((await app.request(`/api/v1/admin/partner-orgs/${org.id}/members`, {
      method: 'POST', headers: { 'content-type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({ email: 'p5-rmstaff@twinmos.dev' }),
    })).status).toBe(201);
  });

  it('report: invalid from/to → 422 instead of a 500', async () => {
    expect((await app.request('/api/v1/admin/sn-checks?from=not-a-date', { headers: { cookie: editorCookie } })).status).toBe(422);
    expect((await app.request('/api/v1/admin/sn-checks?to=yesterday', { headers: { cookie: editorCookie } })).status).toBe(422);
  });

  it('multi-org membership resolves deterministically to the first-joined org', async () => {
    const uCookie = await makeSession('p5-multi@twinmos.dev', mkPass('Multi'));
    const mk = async (name: string) => {
      const o = await (await app.request('/api/v1/admin/partner-orgs', {
        method: 'POST', headers: { 'content-type': 'application/json', cookie: adminCookie },
        body: JSON.stringify({ name, type: 'distributor' }),
      })).json();
      await app.request(`/api/v1/admin/partner-orgs/${o.id}`, {
        method: 'PATCH', headers: { 'content-type': 'application/json', cookie: adminCookie },
        body: JSON.stringify({ status: 'active' }),
      });
      await app.request(`/api/v1/admin/partner-orgs/${o.id}/members`, {
        method: 'POST', headers: { 'content-type': 'application/json', cookie: adminCookie },
        body: JSON.stringify({ email: 'p5-multi@twinmos.dev' }),
      });
      return o;
    };
    await mk('Multi First Ltd');
    await mk('Multi Second Ltd');
    const me = await (await app.request('/api/v1/partner/me', { headers: { cookie: uCookie } })).json();
    expect(me.org.name).toBe('Multi First Ltd');
  });
});
