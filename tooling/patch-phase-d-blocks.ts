// One-off repair for pages seeded before composite form blocks were mapped to
// the generic form dispatcher, plus content that the inventory only counted.
// Idempotent: safe to re-run; fresh databases get the same shape from
// seed-phase-d-pages.ts.
import { createDb } from './db-bridge.ts';
import { page as pageTable } from '../packages/db/src/schema.ts';
import { and, eq } from 'drizzle-orm';

const FORM_TYPES: Record<string, string> = {
  rma: 'rma',
  careers: 'job-application',
  partners: 'partner-inquiry',
  contact: 'contact',
};

const PARTNER_STEPS = [
  { title: 'Apply', text: 'Company profile, territories and volumes via the application form — 48-business-hour review.' },
  { title: 'Agreement & tiers', text: 'Terms, credit line and territory definition with the regional manager.' },
  { title: 'Onboard', text: 'Portal access, price lists, marketing assets and product training in week one.' },
  { title: 'Grow', text: 'Quarterly business reviews, MDF-backed campaigns and new-line launches.' },
];

const RMA_STEPS = [
  { title: 'Describe the issue', text: 'Product, purchase details and what happened — photos help.' },
  { title: 'Ship to service centre', text: 'We confirm the RMA number and return address by email.' },
  { title: 'Diagnosis & repair', text: 'Factory-standard testing; repair or replacement per policy.' },
  { title: 'Shipped back', text: 'Tracking number issued; warranty continues per policy.' },
];

async function main() {
  const db = createDb();
  let changed = 0;

  for (const [slug, formType] of Object.entries(FORM_TYPES)) {
    const row = await db.query.page.findFirst({
      where: and(eq(pageTable.slug, slug), eq(pageTable.locale, 'en')),
    });
    if (!row) continue;
    const blocks = (row.blocks as any[]) || [];
    let dirty = false;
    for (const block of blocks) {
      if (typeof block?.type === 'string' && block.type.startsWith('form') && block.type !== 'form') {
        block.type = 'form';
        block.formType = formType;
        dirty = true;
      }
      if (block?.type === 'steps' && (!Array.isArray(block.steps) || block.steps.length === 0)) {
        const source = slug === 'rma' ? RMA_STEPS : slug === 'partners' ? PARTNER_STEPS : null;
        if (source) {
          block.steps = source.map((s) => ({ title: s.title, description: s.text }));
          dirty = true;
        }
      }
    }
    if (dirty) {
      await db.update(pageTable).set({ blocks, updatedAt: new Date() }).where(eq(pageTable.id, row.id));
      changed++;
      console.log(`[patch] ${slug}: normalized form block(s) -> ${formType}`);
    }
  }

  const support = await db.query.page.findFirst({
    where: and(eq(pageTable.slug, 'support'), eq(pageTable.locale, 'en')),
  });
  if (support) {
    const blocks = (support.blocks as any[]) || [];
    const promo = blocks.find((b) => b?.type === 'promo-card');
    if (promo && !promo.href) {
      promo.href = '/learn';
      promo.heading = 'Knowledge hub';
      promo.description = 'Buying guides, DDR5/NVMe technology explainers and an A–Z glossary from the TwinMOS engineering team.';
      await db.update(pageTable).set({ blocks, updatedAt: new Date() }).where(eq(pageTable.id, support.id));
      changed++;
      console.log('[patch] support: promo-card content restored');
    }
  }

  console.log(`[patch] ${changed} page(s) updated`);
  await db.$client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
