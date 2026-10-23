import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { resolve } from 'node:path';
import { eq, and, sql } from 'drizzle-orm';
import * as schema from '../../../packages/db/src/schema.ts';

async function main() {
  const dbPath = resolve(process.cwd(), 'apps/api/data/dev.pgdata');
  const client = new PGlite(dbPath);
  const db = drizzle(client, { schema });

  console.log('[seed-ms43-policies] Seeding versioned policies and legal gating...');

  // 1. Delete old/placeholder policies if any
  await db.delete(schema.policyDocument);

  // 2. Insert Operative Warranty Policy v1.0 (Legal Approved)
  const v1Body = `<p>TwinMOS Technologies guarantees all products manufactured and bearing the “TwinMOS” labels with the conditions and limitations listed below. TwinMOS shall either repair or replace any part of its product(s) that proves defective due to faulty materials or workmanship. This warranty does not cover any defects arising from misuse, mishandling, abuse, accident, natural disaster, or any unauthorized repair, modification, or disassembly.</p>
<p>This warranty applies to all “TwinMOS” labeled products based on the condition that the product(s) is still manufactured. Any product that has reached the end of its product lifetime (End-of-Life) or is discontinued shall not be covered by this warranty. The end of a product line will be announced by TwinMOS on its website three (3) months prior to the discontinuation of any product(s).</p>
<h3>Duration of warranty</h3>
<ul>
  <li><b>Lifetime warranty:</b> Memory Modules</li>
  <li><b>Five years warranty:</b> NVMe SSD · Flash Cards · USB Flash Drives</li>
  <li><b>Three years warranty:</b> SATA SSD</li>
  <li><b>One year warranty:</b> Computer Accessories</li>
</ul>
<p>TwinMOS Solid State Drives are designed for consumer and client applications, including desktop PCs, laptops, notebooks, and ultrabooks. These SSDs are not intended for use in server environments or enterprise computing platforms, as such scenarios can lead to accelerated wear and reduced endurance of the drives.</p>
<h3>This warranty does not cover</h3>
<ul>
  <li>Wear and tear from normal use</li>
  <li>Any modifications, abuse, accidents, misapplication, or unauthorized repair</li>
  <li>Any improper operations, including any use not in accordance with the supplied product instructions</li>
  <li>Connection to any improper voltage supplies</li>
  <li>Any other cause not related to a product defect in materials or workmanship</li>
  <li>Products damaged during crypto mining operations</li>
</ul>
<p><b>Note:</b> The warranties only cover repair or replacement of defective TwinMOS products, as provided above. TwinMOS is not liable for, and does not cover under warranty, any costs associated with servicing and/or the installation of TwinMOS products. TwinMOS will not discontinue support of its products, nor obsolete its products, as long as there are component materials available in the marketplace and reasonable customer demand for the products.</p>`;

  const v1_1Body = `<p>TwinMOS Technologies guarantees all products manufactured and bearing the “TwinMOS” labels with the conditions and limitations listed below. TwinMOS shall either repair or replace any part of its product(s) that proves defective due to faulty materials or workmanship. This warranty does not cover any defects arising from misuse, mishandling, abuse, accident, natural disaster, or any unauthorized repair, modification, or disassembly.</p>
<p>This warranty applies to all “TwinMOS” labeled products based on the condition that the product(s) is still manufactured. Any product that has reached the end of its product lifetime (End-of-Life) or is discontinued shall not be covered by this warranty. The end of a product line will be announced by TwinMOS on its website three (3) months prior to the discontinuation of any product(s).</p>
<h3>Duration of warranty</h3>
<ul>
  <li><b>Lifetime warranty:</b> Memory Modules (DDR3, DDR4, DDR5, VOLTX Gaming Series)</li>
  <li><b>Five years warranty:</b> NVMe SSD (PCIe Gen 3.0, Gen 4.0, Gen 5.0 CoreX Series) · Flash Cards · USB Flash Drives</li>
  <li><b>Three years warranty:</b> SATA SSD (H2, H3, H5 Series)</li>
  <li><b>One year warranty:</b> Computer Accessories &amp; Hubs</li>
</ul>
<p>TwinMOS Solid State Drives are designed for consumer and client applications, including desktop PCs, laptops, notebooks, workstations, and ultrabooks. Warranty coverage for solid-state drives is valid for the stated duration or until the drive exceeds its specified Terabytes Written (TBW) endurance threshold as reported by S.M.A.R.T. telemetry, whichever occurs first.</p>
<h3>This warranty does not cover</h3>
<ul>
  <li>Wear and tear from normal use or exceeding rated TBW endurance limits</li>
  <li>Any modifications, abuse, accidents, misapplication, or unauthorized repair</li>
  <li>Any improper operations, including any use not in accordance with the supplied product instructions</li>
  <li>Connection to any improper voltage supplies</li>
  <li>Any other cause not related to a product defect in materials or workmanship</li>
  <li>Products damaged during crypto mining operations or intensive continuous server cache workloads</li>
</ul>
<p><b>Note:</b> The warranties only cover repair or replacement of defective TwinMOS products, as provided above. TwinMOS is not liable for, and does not cover under warranty, any costs associated with servicing and/or the installation of TwinMOS products. TwinMOS will not discontinue support of its products, nor obsolete its products, as long as there are component materials available in the marketplace and reasonable customer demand for the products.</p>`;

  // Insert Warranty v1.0
  await db.insert(schema.policyDocument).values({
    slug: 'warranty',
    title: 'TwinMOS Global Warranty Policy & Return Merchandise (RMA) Terms',
    version: '1.0',
    status: 'published',
    legalApproved: true,
    approvedBy: 'TwinMOS Legal Counsel (Taipei)',
    effectiveDate: new Date('2026-01-01T00:00:00Z'),
    publishedAt: new Date('2026-01-01T00:00:00Z'),
    summary: 'Standard, extended, and lifetime warranty coverage guidelines, RMA claim eligibility criteria, and replacement procedures for all TwinMOS product tiers.',
    body: v1Body,
    cookieCategories: [],
    locale: 'en',
    translationGroup: 'policy-warranty',
    changeSummary: 'Initial operative legal-approved warranty policy.',
  });

  // Insert Warranty v1.1 (T4.3.3: older version 1.0 remains retrievable, page reflects 1.1 with new date)
  await db.insert(schema.policyDocument).values({
    slug: 'warranty',
    title: 'TwinMOS Global Warranty Policy & Return Merchandise (RMA) Terms',
    version: '1.1',
    status: 'published',
    legalApproved: true,
    approvedBy: 'TwinMOS Legal Counsel (Taipei)',
    effectiveDate: new Date('2026-03-01T00:00:00Z'),
    publishedAt: new Date('2026-03-01T00:00:00Z'),
    summary: 'Standard, extended, and lifetime warranty coverage guidelines, RMA claim eligibility criteria, TBW endurance metrics, and replacement procedures.',
    body: v1_1Body,
    cookieCategories: [],
    locale: 'en',
    translationGroup: 'policy-warranty',
    changeSummary: 'Clarified PCIe Gen 5 CoreX series coverage and TBW endurance threshold metrics.',
  });

  // Also seed alias 'warranty-policy' pointing to v1.1 for backward compatibility
  await db.insert(schema.policyDocument).values({
    slug: 'warranty-policy',
    title: 'TwinMOS Global Warranty Policy & Return Merchandise (RMA) Terms',
    version: '1.1',
    status: 'published',
    legalApproved: true,
    approvedBy: 'TwinMOS Legal Counsel (Taipei)',
    effectiveDate: new Date('2026-03-01T00:00:00Z'),
    publishedAt: new Date('2026-03-01T00:00:00Z'),
    summary: 'Standard, extended, and lifetime warranty coverage guidelines, RMA claim eligibility criteria, TBW endurance metrics, and replacement procedures.',
    body: v1_1Body,
    cookieCategories: [],
    locale: 'en',
    translationGroup: 'policy-warranty',
    changeSummary: 'Alias for warranty policy.',
  });

  // 3. Insert Draft / Unapproved Policies (T4.3.4: Only legal-approved texts are published; placeholders are unpublished)
  await db.insert(schema.policyDocument).values([
    {
      slug: 'terms',
      title: 'Website Terms of Service & Commercial Usage',
      version: '0.1-draft',
      status: 'draft',
      legalApproved: false,
      approvedBy: null,
      effectiveDate: null,
      publishedAt: null,
      summary: 'Production draft pending formal counsel sign-off in MS6.1 PRIV-01.',
      body: 'Production draft pending formal legal review. Governs website usage, intellectual property, and marketplace referrals.',
      cookieCategories: [],
      locale: 'en',
      translationGroup: 'policy-terms',
      changeSummary: 'Initial production draft awaiting counsel sign-off.',
    },
    {
      slug: 'terms-of-service',
      title: 'Website Terms of Service & Commercial Usage',
      version: '0.1-draft',
      status: 'draft',
      legalApproved: false,
      approvedBy: null,
      effectiveDate: null,
      publishedAt: null,
      summary: 'Production draft pending formal counsel sign-off in MS6.1 PRIV-01.',
      body: 'Production draft pending formal legal review. Governs website usage, intellectual property, and marketplace referrals.',
      cookieCategories: [],
      locale: 'en',
      translationGroup: 'policy-terms',
      changeSummary: 'Alias draft.',
    },
    {
      slug: 'privacy',
      title: 'TwinMOS Global Privacy Policy',
      version: '0.1-draft',
      status: 'draft',
      legalApproved: false,
      approvedBy: null,
      effectiveDate: null,
      publishedAt: null,
      summary: 'Production draft pending formal counsel sign-off in MS6.1 PRIV-01.',
      body: 'Production draft pending formal legal review. Governs personal data processing under GDPR, CCPA, and statutory regulations.',
      cookieCategories: [],
      locale: 'en',
      translationGroup: 'policy-privacy',
      changeSummary: 'Initial production draft awaiting counsel sign-off.',
    },
    {
      slug: 'privacy-policy',
      title: 'TwinMOS Global Privacy Policy',
      version: '0.1-draft',
      status: 'draft',
      legalApproved: false,
      approvedBy: null,
      effectiveDate: null,
      publishedAt: null,
      summary: 'Production draft pending formal counsel sign-off in MS6.1 PRIV-01.',
      body: 'Production draft pending formal legal review. Governs personal data processing under GDPR, CCPA, and statutory regulations.',
      cookieCategories: [],
      locale: 'en',
      translationGroup: 'policy-privacy',
      changeSummary: 'Alias draft.',
    },
    {
      slug: 'cookies',
      title: 'Cookie & Tracking Technologies Policy',
      version: '0.1-draft',
      status: 'draft',
      legalApproved: false,
      approvedBy: null,
      effectiveDate: null,
      publishedAt: null,
      summary: 'Production draft pending formal counsel sign-off in MS6.1 PRIV-01.',
      body: 'Production draft pending formal legal review. Governs cookie classifications and consent management.',
      cookieCategories: [
        { key: 'essential', label: 'Strictly Necessary', description: 'Mandatory cookies for session integrity and security.', required: true },
        { key: 'analytics', label: 'Performance & Analytics', description: 'Anonymous traffic metrics.', required: false },
      ],
      locale: 'en',
      translationGroup: 'policy-cookies',
      changeSummary: 'Initial production draft awaiting counsel sign-off.',
    },
    {
      slug: 'cookie-policy',
      title: 'Cookie & Tracking Technologies Policy',
      version: '0.1-draft',
      status: 'draft',
      legalApproved: false,
      approvedBy: null,
      effectiveDate: null,
      publishedAt: null,
      summary: 'Production draft pending formal counsel sign-off in MS6.1 PRIV-01.',
      body: 'Production draft pending formal legal review. Governs cookie classifications and consent management.',
      cookieCategories: [
        { key: 'essential', label: 'Strictly Necessary', description: 'Mandatory cookies for session integrity and security.', required: true },
        { key: 'analytics', label: 'Performance & Analytics', description: 'Anonymous traffic metrics.', required: false },
      ],
      locale: 'en',
      translationGroup: 'policy-cookies',
      changeSummary: 'Alias draft.',
    },
  ]);

  const count = await db.select({ count: sql<number>`count(*)` }).from(schema.policyDocument);
  const publishedCount = await db.select({ count: sql<number>`count(*)` }).from(schema.policyDocument).where(eq(schema.policyDocument.status, 'published'));
  const approvedCount = await db.select({ count: sql<number>`count(*)` }).from(schema.policyDocument).where(eq(schema.policyDocument.legalApproved, true));

  console.log(`[seed-ms43-policies] Seed complete: total=${count[0].count}, published=${publishedCount[0].count}, legalApproved=${approvedCount[0].count}`);

  await client.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
