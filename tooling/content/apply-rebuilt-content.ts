import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createDb, page } from '@twinmos/db';
import { eq, and } from 'drizzle-orm';

const pages = JSON.parse(readFileSync('apps/api/content/snapshot/page.json', 'utf8'));

// 1. Update tooling/data/tracked-fixture-pages.json
const tracked: Record<string, any> = {};
for (const p of pages) {
  tracked[p.slug] = {
    slug: p.slug,
    locale: p.locale || 'en',
    title: p.title,
    seoTitle: p.seo_title || p.title,
    seoDescription: p.seo_description || '',
    path: p.path,
    template: p.template || 'standard',
    blocks: p.blocks,
    status: p.status || 'published',
    publishedAt: p.published_at || new Date().toISOString()
  };
}
writeFileSync('tooling/data/tracked-fixture-pages.json', JSON.stringify(tracked, null, 2) + '\n');
console.log(`[sync] tracked-fixture-pages.json updated with ${Object.keys(tracked).length} pages`);

// 2. Update PGlite database
const db = createDb();
let updated = 0;
let inserted = 0;
for (const p of pages) {
  const existing = await db.select({ id: page.id }).from(page).where(and(eq(page.slug, p.slug), eq(page.locale, p.locale || 'en'))).limit(1);
  if (existing.length > 0) {
    await db.update(page).set({
      blocks: p.blocks,
      title: p.title,
      seoTitle: p.seo_title || p.title,
      seoDescription: p.seo_description || '',
      path: p.path,
      template: p.template || 'default',
      status: p.status || 'published',
      updatedAt: new Date()
    }).where(eq(page.id, existing[0].id));
    updated++;
  } else {
    await db.insert(page).values({
      slug: p.slug,
      locale: p.locale || 'en',
      title: p.title,
      seoTitle: p.seo_title || p.title,
      seoDescription: p.seo_description || '',
      path: p.path,
      template: p.template || 'default',
      status: p.status || 'published',
      blocks: p.blocks,
      publishedAt: p.published_at ? new Date(p.published_at) : new Date(),
    });
    inserted++;
  }
}
console.log(`[db] pages updated: ${updated}, inserted: ${inserted} (total: ${pages.length})`);
process.exit(0);
