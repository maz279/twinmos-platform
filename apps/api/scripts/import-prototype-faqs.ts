// Import authentic FAQs from prototype/support.html (Roadmap MS4.5 · T4.5.5)
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createDb, faq } from '@twinmos/db';
import { eq, sql } from 'drizzle-orm';

function unescapeHtml(str: string): string {
  return str
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

async function main() {
  const htmlPath = resolve(process.cwd(), 'prototype/support.html');
  if (!existsSync(htmlPath)) {
    console.error('[import-faqs] Cannot find prototype/support.html at', htmlPath);
    process.exit(1);
  }

  const html = readFileSync(htmlPath, 'utf8');
  const db = createDb();

  // Tab mapping
  const groupMap: Record<string, string> = {
    faq0: 'dram',
    faq1: 'ssd',
    faq2: 'flash-cards',
    faq3: 'accessories-power',
    faq4: 'memory',
    faq5: 'portable-storage',
    faq6: 'usb-flash',
    faq7: 'warranty',
    faq8: 'rma',
    faq9: 'firmware-update',
    faq10: 'rgb-voltx',
  };

  const tabpaneRegex = /<div class="tabpane[^"]*" id="(faq\d+)">(.*?)<\/div>\s*<\/div>/gs;
  let tabMatch: RegExpExecArray | null;
  let totalImported = 0;

  while ((tabMatch = tabpaneRegex.exec(html)) !== null) {
    const tabId = tabMatch[1];
    const tabContent = tabMatch[2];
    const groupKey = groupMap[tabId] || tabId;

    const detailsRegex = /<details[^>]*>\s*<summary>(.*?)<\/summary>\s*<div class="acc-body">(.*?)<\/div>\s*<\/details>/gs;
    let detailMatch: RegExpExecArray | null;
    let sortOrder = 1;

    while ((detailMatch = detailsRegex.exec(tabContent)) !== null) {
      const question = unescapeHtml(detailMatch[1]);
      const answer = unescapeHtml(detailMatch[2]);

      // Guard: Ensure real question, never file path
      if (!question || question.includes('.html') || question.includes('.md') || question.startsWith('src/')) {
        console.warn(`[import-faqs] Skipping invalid question format: "${question}"`);
        continue;
      }

      const existing = (
        await db
          .select({ id: faq.id })
          .from(faq)
          .where(sql`${faq.question} = ${question} AND ${faq.locale} = 'en'`)
          .limit(1)
      )[0];

      if (existing) {
        await db
          .update(faq)
          .set({
            groupKey,
            answer,
            sort: sortOrder++,
            status: 'published',
            updatedAt: new Date(),
          })
          .where(eq(faq.id, existing.id));
      } else {
        await db
          .insert(faq)
          .values({
            groupKey,
            locale: 'en',
            question,
            answer,
            sort: sortOrder++,
            status: 'published',
            updatedAt: new Date(),
          });
      }

      totalImported++;
    }
  }

  console.log(`[import-faqs] Successfully imported ${totalImported} authentic FAQs into database.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('[import-faqs] Error:', err);
  process.exit(1);
});
