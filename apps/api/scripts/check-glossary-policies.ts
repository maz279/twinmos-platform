import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { resolve } from 'node:path';
import { eq, sql } from 'drizzle-orm';
import * as schema from '@twinmos/db';

async function main() {
  const dbPath = resolve(process.cwd(), 'apps/api/data/dev.pgdata');
  const client = new PGlite(dbPath);
  const db = drizzle(client, { schema });

  const glossaryCount = await db.select({ count: sql<number>`count(*)` }).from(schema.glossaryTerm);
  const publishedGlossaryCount = await db.select({ count: sql<number>`count(*)` }).from(schema.glossaryTerm).where(eq(schema.glossaryTerm.status, 'published'));
  const explainerCount = await db.select({ count: sql<number>`count(*)` }).from(schema.glossaryTerm).where(sql`${schema.glossaryTerm.explainerSlug} is not null`);

  console.log('Glossary Stats:');
  console.log(`- Total: ${glossaryCount[0].count}`);
  console.log(`- Published: ${publishedGlossaryCount[0].count}`);
  console.log(`- With Explainer: ${explainerCount[0].count}`);

  const policies = await db.select().from(schema.policyDocument);
  console.log('\nPolicy Documents:');
  for (const p of policies) {
    console.log(`- [${p.id}] slug=${p.slug} ver=${p.version} status=${p.status} legalApproved=${p.legalApproved} effDate=${p.effectiveDate?.toISOString()} pubAt=${p.publishedAt?.toISOString()}`);
  }

  const glossaryPage = await db.select().from(schema.page).where(eq(schema.page.slug, 'learn-glossary'));
  console.log('\nPage `learn-glossary`:');
  if (glossaryPage[0]) {
    const blocks = Array.isArray(glossaryPage[0].blocks) ? glossaryPage[0].blocks : [];
    console.log(`- ID: ${glossaryPage[0].id}, title: ${glossaryPage[0].title}, status: ${glossaryPage[0].status}, blocks: ${blocks.length}`);
    for (const b of blocks as any[]) {
      console.log(`  * block type: ${b.type}, id: ${b.id}`);
      if (b.type === 'tabbed-rich-text' || b.type === 'policyTabs') {
        console.log('    html snippet:', (b.html || '').slice(0, 300));
      }
    }
  } else {
    console.log('- Not found');
  }

  const legalPage = await db.select().from(schema.page).where(eq(schema.page.slug, 'legal'));
  console.log('\nPage `legal`:');
  if (legalPage[0]) {
    const blocks = Array.isArray(legalPage[0].blocks) ? legalPage[0].blocks : [];
    console.log(`- ID: ${legalPage[0].id}, title: ${legalPage[0].title}, status: ${legalPage[0].status}, blocks: ${blocks.length}`);
    for (const b of blocks as any[]) {
      console.log(`  * block type: ${b.type}, id: ${b.id}`);
      if (b.type === 'tabbed-rich-text' || b.type === 'policyTabs') {
        console.log('    html snippet:', (b.html || '').slice(0, 300));
      }
    }
  } else {
    console.log('- Not found');
  }

  await client.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
