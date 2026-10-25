import { createDb } from './db-bridge.ts';
import { article, faq } from '../packages/db/src/schema.ts';

const db = createDb();

async function check() {
  const articles = await db.select().from(article);
  console.log(`Found ${articles.length} articles in DB.`);

  let badExcerpts = 0;
  for (const a of articles) {
    const text = a.deck || a.excerpt || '';
    if (text.startsWith('/) —') || text.startsWith('/)')) {
      badExcerpts++;
      console.log(`Bad excerpt in article ${a.slug}: "${text.slice(0, 50)}"`);
    }
  }
  console.log(`Total bad excerpts: ${badExcerpts}`);

  const faqs = await db.select().from(faq);
  console.log(`Found ${faqs.length} FAQs in DB.`);
  let rawFaqLinks = 0;
  for (const f of faqs) {
    if (/\[([^\]]+)\]\(([^)]+)\)/.test(f.answer || '')) {
      rawFaqLinks++;
      console.log(`Raw markdown link in FAQ ${f.id} (${f.question}): "${f.answer.slice(0, 60)}"`);
    }
  }
  console.log(`Total raw FAQ markdown links: ${rawFaqLinks}`);

  await db.$client.close();
}

check().catch(e => { console.error(e); process.exit(1); });
