import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPgliteDb, policyDocument, releaseDataDirLock } from '../packages/db/src/index.ts';
import { eq, or } from 'drizzle-orm';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = resolve(ROOT, 'apps', 'api', 'data', 'dev.pgdata');

async function seed() {
  console.log('Opening DB at:', DATA_DIR);
  const db = createPgliteDb(DATA_DIR);

  const privacyBody = `# TwinMOS Global Privacy Policy

## 1. Scope & Commitment
TwinMOS Technologies Inc. and its global affiliates ("TwinMOS", "we", "us", or "our") commit to protecting individual privacy rights and safeguarding personal data processed across our corporate website, e-commerce storefronts, RMA support systems, and partner portals.

## 2. GDPR Compliance Schedule (Regulation (EU) 2016/679, Article 13)
- **Data Controller**: TwinMOS Technologies Inc., 5F.-5, No. 29, Sec. 1, Minsheng E. Rd., Zhongshan Dist., Taipei City 104619, Taiwan.
- **Data Protection Officer Contact**: privacy@twinmos.com.
- **Lawful Bases for Processing**: Processing of personal data for warranty fulfillment, RMA processing, and customer support relies upon Contractual Necessity (Art. 6(1)(b)). Marketing communications rely upon affirmative consent (Art. 6(1)(a)).
- **Data Subject Rights**: Right of access (Art. 15), rectification (Art. 16), erasure (Art. 17), restriction of processing (Art. 18), data portability (Art. 20), and right to object (Art. 21).

## 3. Taiwan Personal Data Protection Act (PDPA)
In compliance with the Taiwan Personal Data Protection Act (PDPA), personal information collected by TwinMOS within Taiwan is processed under strict collection purpose specifications, notification obligations, and statutory security measures.

## 4. UAE Personal Data Protection Law (Federal Decree-Law No. 45 of 2021)
For users residing in the United Arab Emirates and the GCC region, TwinMOS Regional Headquarters (Dubai) processes personal information in strict accordance with Federal Decree-Law No. 45 regarding Personal Data Protection.

## 5. India Digital Personal Data Protection Act, 2023
In compliance with the India Digital Personal Data Protection Act, personal data of Data Principals is processed solely for lawful purposes for which consent has been explicitly granted or for certain legitimate uses.

## 6. Cookie Governance & Choice Withdrawal
Non-essential analytics and preference cookies are blocked prior to affirmative consent. Users may modify choices or withdraw consent anytime via the persistent Cookie Preferences trigger in our website footer.`;

  const policies = [
    {
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
      body: privacyBody,
      changeSummary: 'Formal legal counsel sign-off and multi-jurisdiction schedule ratification.',
      source: 'Legal Department',
      approver: 'H. Lin, Legal Counsel',
      cookieCategories: [
        { name: 'Strictly Necessary', description: 'Essential for site operation, session management, and CSRF security.', required: true },
        { name: 'Functional & Preferences', description: 'Remembers your preferred language, region, and comparison tray items.', required: false },
        { name: 'Analytics', description: 'Privacy-preserving telemetry to improve page response times and hardware search relevance.', required: false },
      ],
    },
    {
      slug: 'privacy',
      title: 'TwinMOS Global Privacy Policy',
      version: '1.0',
      status: 'published',
      legalApproved: true,
      approvedBy: 'H. Lin, Legal Counsel (Taipei & Dubai)',
      effectiveDate: new Date('2026-01-01T00:00:00.000Z'),
      publishedAt: new Date('2026-01-01T00:00:00.000Z'),
      locale: 'en',
      summary: 'Formal counsel sign-off for GDPR Art. 13, Taiwan PDPA, UAE PDPL, and India DPDP statutory compliance (MS6.1 PRIV-01).',
      body: privacyBody,
      changeSummary: 'Formal legal counsel sign-off and multi-jurisdiction schedule ratification.',
      source: 'Legal Department',
      approver: 'H. Lin, Legal Counsel',
    },
    {
      slug: 'terms-of-service',
      title: 'Terms of Service',
      version: '1.0',
      status: 'published',
      legalApproved: true,
      approvedBy: 'H. Lin, Legal Counsel (Taipei & Dubai)',
      effectiveDate: new Date('2026-01-01T00:00:00.000Z'),
      publishedAt: new Date('2026-01-01T00:00:00.000Z'),
      locale: 'en',
      summary: 'Terms and conditions governing the use of TwinMOS websites, partner portals, and hardware warranties.',
      body: 'By accessing this site, you agree to comply with applicable export compliance laws and fair use policies.',
      changeSummary: 'Initial publication.',
      source: 'Legal Department',
      approver: 'H. Lin, Legal Counsel',
    },
    {
      slug: 'warranty-policy',
      title: 'Hardware Warranty Policy',
      version: '1.0',
      status: 'published',
      legalApproved: true,
      approvedBy: 'H. Lin, Legal Counsel (Taipei & Dubai)',
      effectiveDate: new Date('2026-01-01T00:00:00.000Z'),
      publishedAt: new Date('2026-01-01T00:00:00.000Z'),
      locale: 'en',
      summary: 'Comprehensive warranty tiers: Lifetime for DRAM modules, 5-Year for NVMe SSDs, and 3-Year for portable flash.',
      body: 'TwinMOS guarantees that all memory and storage products are free from defects in materials and workmanship under normal use.',
      changeSummary: 'Initial publication.',
      source: 'Legal Department',
      approver: 'H. Lin, Legal Counsel',
    },
    {
      slug: 'warranty',
      title: 'Hardware Warranty Policy',
      version: '1.0',
      status: 'published',
      legalApproved: true,
      approvedBy: 'H. Lin, Legal Counsel (Taipei & Dubai)',
      effectiveDate: new Date('2026-01-01T00:00:00.000Z'),
      publishedAt: new Date('2026-01-01T00:00:00.000Z'),
      locale: 'en',
      summary: 'Comprehensive warranty tiers: Lifetime for DRAM modules, 5-Year for NVMe SSDs, and 3-Year for portable flash.',
      body: 'TwinMOS guarantees that all memory and storage products are free from defects in materials and workmanship under normal use.',
      changeSummary: 'Initial publication.',
      source: 'Legal Department',
      approver: 'H. Lin, Legal Counsel',
    },
  ];

  for (const pol of policies) {
    await db.delete(policyDocument).where(eq(policyDocument.slug, pol.slug));
    await db.insert(policyDocument).values(pol);
    console.log(`✓ Seeded policy: ${pol.slug} (v${pol.version}, status: ${pol.status}, approvedBy: ${pol.approvedBy})`);
  }

  releaseDataDirLock(DATA_DIR);
  console.log('Seeding completed successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
