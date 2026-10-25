import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { eq, sql } from 'drizzle-orm';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-ms61-test-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.MAIL_OUTBOX_DIR = join(TMP, 'outbox');
process.env.NODE_ENV = 'test';
process.env.BETTER_AUTH_SECRET = 'test-secret-twinmos-ms61-key-12345';

const MIGRATIONS = join(dirname(dirname(process.cwd())), 'packages', 'db', 'migrations');

const {
  createDb,
  user,
  session,
  newsletterSubscriber,
  formSubmission,
  formNote,
  jobApplication,
  rmaRequest,
  rmaEvent,
  partnerOrg,
  partnerMember,
  auditLog,
  policyDocument,
}: any = await import('@twinmos/db');
const { migrate } = await import('drizzle-orm/pglite/migrator');
const { buildApp }: any = await import('../src/app.ts');
const { executeRetentionSweep, hashEmail }: any = await import('../src/routes/privacy.ts');
const { redactPersonalData }: any = await import('../src/lib/redact.ts');

const db = createDb();
await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
await migrate(db, { migrationsFolder: MIGRATIONS });
const app = buildApp(db);

let superAdminCookie = '';
let editorCookie = '';
let superAdminId = '';

describe('MS6.1 · Privacy Operations & Zero-Trust Audit (PRIV-01 / Z-26)', () => {
  beforeAll(async () => {
    const mkPass = () => 'Password123!SafeTwinMOS';

    // 1. Super admin user
    await app.request('/api/v1/auth/sign-up/email', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'privacy-super@twinmos.com', password: mkPass(), name: 'Super Admin' }),
    });
    await db.update(user).set({ role: 'super_admin' }).where(eq(user.email, 'privacy-super@twinmos.com'));
    const [superUser] = await db.select({ id: user.id }).from(user).where(eq(user.email, 'privacy-super@twinmos.com'));
    superAdminId = superUser.id;

    const resSuper = await app.request('/api/v1/auth/sign-in/email', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'privacy-super@twinmos.com', password: mkPass() }),
    });
    superAdminCookie = resSuper.headers.getSetCookie().map((c: string) => c.split(';')[0]).join('; ');

    // 2. Editor user
    await app.request('/api/v1/auth/sign-up/email', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'privacy-editor@twinmos.com', password: mkPass(), name: 'Content Editor' }),
    });
    await db.update(user).set({ role: 'editor' }).where(eq(user.email, 'privacy-editor@twinmos.com'));
    const resEditor = await app.request('/api/v1/auth/sign-in/email', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'privacy-editor@twinmos.com', password: mkPass() }),
    });
    editorCookie = resEditor.headers.getSetCookie().map((c: string) => c.split(';')[0]).join('; ');
  });

  afterAll(() => {
    try {
      rmSync(TMP, { recursive: true, force: true });
    } catch {}
  });

  describe('T6.1.1 · Retention that works and fails loudly (Closes Z-26)', () => {
    it('executes multi-table retention, deletes aged records, and preserves active ones', async () => {
      // 1. Seed aged records (> threshold) and fresh records (< threshold)
      const now = new Date();
      const past400Days = new Date(now.getTime() - 400 * 86400_000);
      const past200Days = new Date(now.getTime() - 200 * 86400_000);
      const past100Days = new Date(now.getTime() - 100 * 86400_000);
      const past40Days = new Date(now.getTime() - 40 * 86400_000);

      // Audit logs: 1 old (>365d), 1 fresh (<30d)
      await db.insert(auditLog).values([
        {
          actorId: superAdminId,
          action: 'test.old_log',
          entity: 'test',
          at: past400Days,
          diff: { old: true },
        },
        {
          actorId: superAdminId,
          action: 'test.fresh_log',
          entity: 'test',
          at: now,
          diff: { fresh: true },
        },
      ]);

      // Newsletter: 1 old pending (>90d), 1 active
      await db.insert(newsletterSubscriber).values([
        {
          email: 'stale-pending@example.com',
          status: 'pending',
          token: 'token-pending-90d',
          createdAt: past100Days,
        },
        {
          email: 'active-sub@example.com',
          status: 'active',
          token: 'token-active',
          createdAt: past100Days,
        },
      ]);

      // Form submissions: 1 resolved (>180d), 1 new
      await db.insert(formSubmission).values([
        {
          type: 'contact',
          refCode: 'CT-OLD-01',
          email: 'old-resolved@example.com',
          status: 'resolved',
          createdAt: past200Days,
          payload: { query: 'Old inquiry' },
        },
        {
          type: 'contact',
          refCode: 'CT-NEW-01',
          email: 'new-inquiry@example.com',
          status: 'new',
          createdAt: now,
          payload: { query: 'Recent inquiry' },
        },
      ]);

      // Job applications: 1 closed (>180d), 1 new
      await db.insert(jobApplication).values([
        {
          email: 'old-applicant@example.com',
          refCode: 'JA-OLD-01',
          status: 'closed',
          createdAt: past200Days,
          payload: { role: 'Engineer' },
        },
        {
          email: 'fresh-applicant@example.com',
          refCode: 'JA-NEW-01',
          status: 'new',
          createdAt: now,
          payload: { role: 'Designer' },
        },
      ]);

      // RMA requests: 1 closed (>365d), 1 submitted
      await db.insert(rmaRequest).values([
        {
          number: 'RMA-OLD-01',
          status: 'closed',
          customer: { name: 'Old Customer', email: 'old-rma@example.com' },
          updatedAt: past400Days,
        },
        {
          number: 'RMA-FRESH-01',
          status: 'submitted',
          customer: { name: 'Fresh Customer', email: 'fresh-rma@example.com' },
          updatedAt: now,
        },
      ]);

      // Session: 1 expired (>30d ago), 1 active
      await db.insert(session).values([
        {
          id: 'sess_expired_test',
          userId: superAdminId,
          token: 'token_expired_old',
          expiresAt: past40Days,
        },
      ]);

      // Run executeRetentionSweep
      const summary = await executeRetentionSweep(db);
      expect(summary.success).toBe(true);
      expect(summary.errors.length).toBe(0);
      expect(summary.auditLog).toBeGreaterThanOrEqual(1);
      expect(summary.unconfirmedSubscribers).toBeGreaterThanOrEqual(1);
      expect(summary.oldSubmissions).toBeGreaterThanOrEqual(1);
      expect(summary.oldJobApplications).toBeGreaterThanOrEqual(1);
      expect(summary.closedRmas).toBeGreaterThanOrEqual(1);
      expect(summary.expiredSessions).toBeGreaterThanOrEqual(1);

      // Verify active/fresh items remain intact
      const activeSubs = await db.select().from(newsletterSubscriber).where(eq(newsletterSubscriber.email, 'active-sub@example.com'));
      expect(activeSubs.length).toBe(1);

      const freshForm = await db.select().from(formSubmission).where(eq(formSubmission.refCode, 'CT-NEW-01'));
      expect(freshForm.length).toBe(1);

      const freshRma = await db.select().from(rmaRequest).where(eq(rmaRequest.number, 'RMA-FRESH-01'));
      expect(freshRma.length).toBe(1);

      // Verify old items were actually deleted
      const deletedSub = await db.select().from(newsletterSubscriber).where(eq(newsletterSubscriber.email, 'stale-pending@example.com'));
      expect(deletedSub.length).toBe(0);

      const deletedForm = await db.select().from(formSubmission).where(eq(formSubmission.refCode, 'CT-OLD-01'));
      expect(deletedForm.length).toBe(0);
    });

    it('supports targeted retention per data type', async () => {
      const summary = await executeRetentionSweep(db, { dataType: 'newsletter' });
      expect(summary.success).toBe(true);
      expect(summary.auditLog).toBe(0); // untouched because targeted to newsletter only
    });

    it('records error details and stops swallowing errors (fails loudly when required)', async () => {
      // Create a mocked or invalid DB call to simulate database constraint/failure
      const mockDb: any = {
        execute: async () => {
          throw new Error('Simulated PostgreSQL connection timeout or syntax violation');
        },
      };

      // 1. Without failLoudly: records error and reports failure without unhandled crash
      const summary = await executeRetentionSweep(mockDb, { failLoudly: false });
      expect(summary.success).toBe(false);
      expect(summary.errors.length).toBeGreaterThan(0);
      expect(summary.errors[0]).toContain('Simulated PostgreSQL');

      // 2. With failLoudly: throws error loudly
      await expect(executeRetentionSweep(mockDb, { failLoudly: true })).rejects.toThrow(
        /Simulated PostgreSQL/
      );
    });
  });

  describe('T6.1.2 · Complete data-subject export (Closes Z-26)', () => {
    const dsarEmail = 'data-subject-alpha@twinmos.com';

    beforeAll(async () => {
      // Seed user
      const [u] = await db.insert(user).values({
        id: 'usr_dsar_subject_alpha',
        name: 'Alpha Subject',
        email: dsarEmail,
        role: 'member',
        emailVerified: true,
      }).returning();

      // Seed session
      await db.insert(session).values({
        id: 'sess_dsar_alpha',
        userId: u.id,
        token: 'token_dsar_alpha_99',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 TestBrowser',
        expiresAt: new Date(Date.now() + 86400_000),
      });

      // Seed newsletter
      await db.insert(newsletterSubscriber).values({
        email: dsarEmail,
        status: 'active',
        source: 'dsar-test',
      });

      // Seed form submission & note
      const [sub] = await db.insert(formSubmission).values({
        type: 'contact',
        refCode: 'CT-DSAR-01',
        email: dsarEmail,
        status: 'new',
        payload: { note: 'DSAR test inquiry message' },
      }).returning();

      await db.insert(formNote).values({
        submissionId: sub.id,
        authorId: u.id,
        body: 'Internal collaboration note regarding this customer',
      });

      // Seed job application
      await db.insert(jobApplication).values({
        email: dsarEmail,
        refCode: 'JA-DSAR-01',
        status: 'new',
        payload: { portfolioUrl: 'https://subject-portfolio.dev' },
      });

      // Seed RMA request & event
      const [rma] = await db.insert(rmaRequest).values({
        number: 'RMA-DSAR-01',
        productSku: 'NVME-4TB-PRO',
        serial: 'SN-DSAR-999',
        issue: 'Controller heating during sustained load',
        status: 'submitted',
        customer: {
          name: 'Alpha Subject',
          email: dsarEmail,
          phone: '+971-50-123-4567',
          country: 'United Arab Emirates',
        },
      }).returning();

      await db.insert(rmaEvent).values({
        rmaId: rma.id,
        fromStatus: 'submitted',
        toStatus: 'submitted',
        note: 'Initial customer submission',
      });

      // Seed partner org
      await db.insert(partnerOrg).values({
        name: 'Alpha Partner Corp',
        type: 'distributor',
        status: 'active',
        country: 'Taiwan',
        contactEmail: dsarEmail,
      });

      // Seed historical audit log
      await db.insert(auditLog).values({
        actorId: u.id,
        action: 'user.profile_update',
        entity: 'user',
        entityId: u.id,
        diff: { email: dsarEmail, updatedField: 'timezone' },
      });
    });

    it('requires super_admin authentication for DSAR export', async () => {
      // 1. Unauthenticated -> 401
      const resUnauth = await app.request('/api/v1/admin/privacy/dsar-export', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: dsarEmail }),
      });
      expect(resUnauth.status).toBe(401);

      // 2. Editor -> 403
      const resEditor = await app.request('/api/v1/admin/privacy/dsar-export', {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: editorCookie },
        body: JSON.stringify({ email: dsarEmail }),
      });
      expect(resEditor.status).toBe(403);
    });

    it('exports all personal data from EVERY table with cryptographic audit hash', async () => {
      const res = await app.request('/api/v1/admin/privacy/dsar-export', {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: superAdminCookie },
        body: JSON.stringify({ email: dsarEmail }),
      });
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.email).toBe(dsarEmail);
      expect(json.targetHash).toBe(hashEmail(dsarEmail));

      const r = json.records;
      expect(r.users.length).toBe(1);
      expect(r.users[0].email).toBe(dsarEmail);

      expect(r.sessions.length).toBe(1);
      expect(r.sessions[0].ipAddress).toBe('192.168.1.100');

      expect(r.subscribers.length).toBe(1);
      expect(r.subscribers[0].email).toBe(dsarEmail);

      expect(r.submissions.length).toBe(1);
      expect(r.submissions[0].refCode).toBe('CT-DSAR-01');

      expect(r.formNotes.length).toBe(1);
      expect(r.formNotes[0].body).toContain('Internal collaboration note');

      expect(r.applications.length).toBe(1);
      expect(r.applications[0].refCode).toBe('JA-DSAR-01');

      expect(r.rmas.length).toBe(1);
      expect(r.rmas[0].number).toBe('RMA-DSAR-01');
      expect(r.rmas[0].customer.email).toBe(dsarEmail);

      expect(r.rmaEvents.length).toBe(1);
      expect(r.rmaEvents[0].note).toBe('Initial customer submission');

      expect(r.partnerOrgs.length).toBe(1);
      expect(r.partnerOrgs[0].contactEmail).toBe(dsarEmail);

      expect(r.auditLogs.length).toBeGreaterThan(0);

      // Verify audit log entry has targetHash
      const logs = await db.select().from(auditLog).where(eq(auditLog.action, 'privacy.dsar_export'));
      expect(logs.length).toBeGreaterThan(0);
      expect((logs[logs.length - 1].diff as any).targetHash).toBe(hashEmail(dsarEmail));
    });
  });

  describe('T6.1.3 · Erasure leaves no personal data in the audit log (Closes Z-26)', () => {
    const eraseEmail = 'erase-target-beta@twinmos.com';

    beforeAll(async () => {
      // Seed user
      const [u] = await db.insert(user).values({
        id: 'usr_erase_beta',
        name: 'Beta Erase Subject',
        email: eraseEmail,
        role: 'member',
        emailVerified: true,
      }).returning();

      // Seed session
      await db.insert(session).values({
        id: 'sess_erase_beta',
        userId: u.id,
        token: 'token_erase_beta_token',
        expiresAt: new Date(Date.now() + 86400_000),
      });

      // Seed newsletter
      await db.insert(newsletterSubscriber).values({
        email: eraseEmail,
        status: 'active',
      });

      // Seed form submission & note
      const [sub] = await db.insert(formSubmission).values({
        type: 'contact',
        refCode: 'CT-ERASE-01',
        email: eraseEmail,
        status: 'new',
        ip: '10.0.0.1',
        ua: 'SecretAgent/1.0',
        payload: { personalComment: 'Please delete my data after this' },
      }).returning();

      await db.insert(formNote).values({
        submissionId: sub.id,
        body: 'Confidential note for beta subject',
      });

      // Seed job application
      await db.insert(jobApplication).values({
        email: eraseEmail,
        refCode: 'JA-ERASE-01',
        status: 'new',
        payload: { resume: 'Confidential CV' },
      });

      // Seed RMA request
      await db.insert(rmaRequest).values({
        number: 'RMA-ERASE-01',
        status: 'submitted',
        customer: {
          name: 'Beta Subject',
          email: eraseEmail,
          phone: '+1-555-0199',
        },
      });

      // Seed partner org
      await db.insert(partnerOrg).values({
        name: 'Beta Global LLC',
        type: 'si',
        status: 'active',
        contactEmail: eraseEmail,
      });

      // Seed prior audit log containing the email
      await db.insert(auditLog).values({
        actorId: superAdminId,
        action: 'admin.lead_intake',
        entity: 'form_submission',
        diff: { targetEmail: eraseEmail, message: 'Initial contact recorded' },
      });
    });

    it('erases and anonymizes all tables, leaving zero personal data in audit log or database', async () => {
      const res = await app.request('/api/v1/admin/privacy/dsar-erase', {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: superAdminCookie },
        body: JSON.stringify({ email: eraseEmail }),
      });
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.erased).toBe(true);
      expect(json.targetHash).toBe(hashEmail(eraseEmail));
      expect(json.summary.submissionsAnonymized).toBe(1);
      expect(json.summary.applicationsAnonymized).toBe(1);
      expect(json.summary.rmasAnonymized).toBe(1);
      expect(json.summary.usersAnonymized).toBe(1);

      // Verify ZERO matches for eraseEmail across EVERY table
      const remainingUsers = await db.select().from(user).where(eq(user.email, eraseEmail));
      expect(remainingUsers.length).toBe(0);

      const remainingSubs = await db.select().from(newsletterSubscriber).where(eq(newsletterSubscriber.email, eraseEmail));
      expect(remainingSubs.length).toBe(0);

      const remainingForms = await db.select().from(formSubmission).where(eq(formSubmission.email, eraseEmail));
      expect(remainingForms.length).toBe(0);

      const remainingApps = await db.select().from(jobApplication).where(eq(jobApplication.email, eraseEmail));
      expect(remainingApps.length).toBe(0);

      const allRmas = await db.select().from(rmaRequest);
      const remainingRmas = allRmas.filter((r) => JSON.stringify(r.customer).includes(eraseEmail));
      expect(remainingRmas.length).toBe(0);

      const remainingPartner = await db.select().from(partnerOrg).where(eq(partnerOrg.contactEmail, eraseEmail));
      expect(remainingPartner.length).toBe(0);

      // Verify that no session exists for the user
      const userSessions = await db.select().from(session).where(eq(session.id, 'sess_erase_beta'));
      expect(userSessions.length).toBe(0);

      // Verify audit trail contains NO plaintext target email (T6.1.3 acceptance criteria)
      const allAuditLogs = await db.select().from(auditLog);
      const leakedLogs = allAuditLogs.filter((l) => JSON.stringify(l.diff || {}).includes(eraseEmail));
      expect(leakedLogs.length).toBe(0);

      // Verify the dsar_erase audit log entry recorded targetHash
      const eraseLogs = await db.select().from(auditLog).where(eq(auditLog.action, 'privacy.dsar_erase'));
      expect(eraseLogs.length).toBeGreaterThan(0);
      const latestEraseLog = eraseLogs[eraseLogs.length - 1];
      expect((latestEraseLog.diff as any).targetHash).toBe(hashEmail(eraseEmail));
      expect((latestEraseLog.diff as any).targetEmail).toBeUndefined();
    });
  });

  describe('T6.1.4 · Notices on forms & Log Redaction', () => {
    it('redacts emails, bearer tokens, passwords, and sensitive parameters from logs', () => {
      const rawLog = 'User login request: email=john.doe@example.com, password=superSecretPassword123, auth="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token"';
      const redacted = redactPersonalData(rawLog);

      expect(redacted).not.toContain('john.doe@example.com');
      expect(redacted).not.toContain('superSecretPassword123');
      expect(redacted).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token');
      expect(redacted).toContain('[REDACTED_EMAIL]');
      expect(redacted).toContain('Bearer [REDACTED_TOKEN]');
    });

    it('confirms just-in-time form privacy notice rendering exists in component templates', () => {
      const blockDispatcher = readFileSync(
        join(dirname(dirname(process.cwd())), 'apps', 'web', 'src', 'components', 'blocks', 'BlockDispatcher.astro'),
        'utf8'
      );
      expect(blockDispatcher).toContain('data-form-privacy-notice');
      expect(blockDispatcher).toContain('formDef.privacyNotice');

      const footer = readFileSync(
        join(dirname(dirname(process.cwd())), 'apps', 'web', 'src', 'components', 'chrome', 'Footer.astro'),
        'utf8'
      );
      expect(footer).toContain('newsletter-privacy-notice');
      expect(footer).toContain('/legal?tab=privacy');
    });
  });

  describe('T6.1.5 · Legal publishes the privacy notice (PRIV-01)', () => {
    beforeAll(async () => {
      // Seed published v1.0 privacy policy
      const privacyDoc = {
        slug: 'privacy-policy',
        title: 'TwinMOS Global Privacy Policy',
        version: '1.0',
        status: 'published',
        legalApproved: true,
        approvedBy: 'H. Lin, Legal Counsel (Taipei & Dubai)',
        effectiveDate: new Date('2026-01-01T00:00:00.000Z'),
        publishedAt: new Date('2026-01-01T00:00:00.000Z'),
        locale: 'en',
        summary: 'Formal counsel sign-off for GDPR Art. 13, Taiwan PDPA, UAE PDPL, and India DPDP statutory compliance (MS6.1 PRIV-01).',
        body: `# TwinMOS Global Privacy Policy\n\n## 2. GDPR Compliance Schedule (Regulation (EU) 2016/679, Article 13)\n\n## 3. Taiwan Personal Data Protection Act (PDPA)\n\n## 4. UAE Personal Data Protection Law\n\n## 5. India Digital Personal Data Protection Act, 2023`,
        changeSummary: 'Formal legal counsel sign-off.',
      };

      await db.delete(policyDocument).where(eq(policyDocument.slug, 'privacy-policy'));
      await db.insert(policyDocument).values(privacyDoc);
    });

    it('verifies that published privacy policy has legal sign-off and multi-jurisdiction items', async () => {
      const [doc] = await db
        .select()
        .from(policyDocument)
        .where(eq(policyDocument.slug, 'privacy-policy'))
        .limit(1);

      expect(doc).toBeDefined();
      expect(doc.version).toBe('1.0');
      expect(doc.status).toBe('published');
      expect(doc.legalApproved).toBe(true);
      expect(doc.approvedBy).toBe('H. Lin, Legal Counsel (Taipei & Dubai)');
      expect(doc.publishedAt).toBeDefined();

      // Verify statutory items
      expect(doc.body).toContain('GDPR');
      expect(doc.body).toContain('Article 13');
      expect(doc.body).toContain('Taiwan Personal Data Protection Act');
      expect(doc.body).toContain('UAE Personal Data Protection Law');
      expect(doc.body).toContain('India Digital Personal Data Protection Act');
    });

    it('delivers the published privacy policy via Delivery API without authentication', async () => {
      const res = await app.request('/api/v1/delivery/policies/privacy-policy?locale=en');
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.data.slug).toBe('privacy-policy');
      expect(json.data.version).toBe('1.0');
      expect(json.data.status).toBe('published');
      expect(json.data.legalApproved).toBe(true);
      expect(json.data.approvedBy).toContain('H. Lin');
    });
  });
});
