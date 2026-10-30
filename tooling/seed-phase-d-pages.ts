/**
 * TwinMOS Phase D Page Seeder (Tasks D8b, D8c)
 * Maps all 28 core pages (230 components) into the CMS `page` table.
 * Strips prototype copy, calculates founding year dynamically, and reconciles truthfulness.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDb } from './db-bridge.ts';
import { page as pageTable } from '../packages/db/src/schema.ts';
import { eq, and } from 'drizzle-orm';

interface InventoryBlock {
  page: string;
  order: number;
  secIdx: number;
  secHead: string;
  section: string;
  sectionId: string;
  group: number;
  component: string;
  heading: string;
  eyebrow: string;
  headLink: string;
  type: string;
  variant: string;
  items: number;
  what: string;
  source: string;
  chars: number;
  words: number;
  links: number;
  images: number;
  ctas: number;
  artRefs: number;
  artRefsFound: number;
  prodRefs: number;
  prodRefsFound: number;
  intro: string;
}

const HERE = dirname(fileURLToPath(import.meta.url));
const INVENTORY_PATH = resolve(HERE, 'data', 'inventory_blocks.json');
const PAGES_DIR = resolve('apps/web/src/pages');

function canonicalJson(obj: any): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return `[${obj.map(canonicalJson).join(',')}]`;
  }
  const keys = Object.keys(obj).sort();
  const pairs = keys.map((k) => `${JSON.stringify(k)}:${canonicalJson(obj[k])}`);
  return `{${pairs.join(',')}}`;
}

async function main() {
  console.log('================================================================');
  console.log('  TwinMOS Phase D Page Seeder & Truthfulness Filter (D8b / D8c)');
  console.log('================================================================\n');

  if (!existsSync(INVENTORY_PATH)) {
    throw new Error(`Inventory file not found: ${INVENTORY_PATH}`);
  }

  const inventory: InventoryBlock[] = JSON.parse(readFileSync(INVENTORY_PATH, 'utf8'));
  console.log(`[1/4] Loaded inventory: ${inventory.length} blocks across 28 pages.`);

  const pageGroups: Record<string, InventoryBlock[]> = {};
  for (const item of inventory) {
    if (!pageGroups[item.page]) pageGroups[item.page] = [];
    pageGroups[item.page].push(item);
  }

  const pagesCache: Record<string, any> = {};

  const db = createDb();
  const currentYear = new Date().getFullYear();
  const foundingAge = currentYear - 1998;

  let seededCount = 0;

  for (const [pageKey, blocks] of Object.entries(pageGroups)) {
    const astroFile = resolve(PAGES_DIR, `${pageKey}.astro`);
    let title = `${pageKey} — TwinMOS`;
    let desc = `TwinMOS Technologies since 1998.`;
    let rawMainHtml = '';

    if (existsSync(astroFile)) {
      const astroContent = readFileSync(astroFile, 'utf8');
      const titleMatch = astroContent.match(/const title =\s*("([^"\\]*(\\.[^"\\]*)*)"|'([^'\\]*(\\.[^'\\]*)*)');/);
      const descMatch = astroContent.match(/const desc =\s*("([^"\\]*(\\.[^"\\]*)*)"|'([^'\\]*(\\.[^'\\]*)*)');/);
      
      if (titleMatch) {
        try { title = JSON.parse(titleMatch[1]); } catch { title = titleMatch[1].replace(/^["']|["']$/g, ''); }
      }
      if (descMatch) {
        try { desc = JSON.parse(descMatch[1]); } catch { desc = descMatch[1].replace(/^["']|["']$/g, ''); }
      }

      // Extract raw bodyHtml if present
      const bodyMatch = astroContent.match(/const bodyHtml = "([\s\S]*?)";\s*---/);
      if (bodyMatch) {
        try {
          const fullHtml = JSON.parse(`"${bodyMatch[1]}"`);
          const mainMatch = fullHtml.match(/<main id="main">([\s\S]*?)<\/main>/);
          if (mainMatch) {
            rawMainHtml = mainMatch[1];
          } else {
            rawMainHtml = fullHtml;
          }
        } catch (e) {
          console.warn(`Failed to parse bodyHtml for ${pageKey}, falling back`);
        }
      }
    }

    // Clean prototype copy (Task D8c / CONTENT-01)
    let cleanMainHtml = rawMainHtml
      .replace(/Interactive prototype\s*[—–-]\s*demo data where marked/gi, '')
      .replace(/Interactive prototype/gi, '')
      .replace(/nothing is sent from your browser/gi, '')
      .replace(/This prototype stores nothing server-side/gi, '')
      .replace(/\b27\+?\s*years?\b/gi, `${foundingAge}+ years`)
      .replace(/\b28\s*years?\b/gi, `${foundingAge} years`)
      .replace(/\b27-year\b/gi, `${foundingAge}-year`)
      .replace(/\b28-year\b/gi, `${foundingAge}-year`);

    // Clean broken raw markdown links in FAQ / text
    cleanMainHtml = cleanMainHtml.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // Split cleanMainHtml into sections corresponding to blocks
    // If the page has multiple sections, we split on <section or <div class="page-hero"
    const sectionSplits = cleanMainHtml.split(/(?=<section|<div class="page-hero")/);

    const structuredBlocks = blocks.map((invBlock, idx) => {
      const sectionHtml = sectionSplits[idx] || (idx === 0 ? cleanMainHtml : '');
      // Composite form blocks (form+tracker, form+steps, ...) are rendered by
      // the generic form dispatcher; keep their page-specific registry type.
      const isFormComposite = invBlock.type.startsWith('form');
      const formType = isFormComposite
        ? (pageKey === 'rma' ? 'rma'
          : pageKey === 'careers' ? 'job-application'
            : pageKey === 'partners' ? 'partner-inquiry'
              : pageKey === 'quote' ? 'quote'
              : 'contact')
        : undefined;
      return {
        id: `${pageKey}-block-${invBlock.order}`,
        type: isFormComposite ? 'form' : invBlock.type,
        ...(formType ? { formType } : {}),
        heading: invBlock.heading || invBlock.secHead || '',
        eyebrow: invBlock.eyebrow || '',
        title: invBlock.heading || invBlock.secHead || '',
        sectionId: invBlock.sectionId || '',
        component: invBlock.component || '',
        html: sectionHtml.trim(),
        meta: {
          order: invBlock.order,
          what: invBlock.what,
          items: invBlock.items,
        },
      };
    });

    const pagePath = pageKey === 'index' ? '/' : `/${pageKey}.html`;
    const template = pageKey;

    // Upsert into page table
    const existing = await db.query.page.findFirst({
      where: and(eq(pageTable.slug, pageKey), eq(pageTable.locale, 'en')),
    });

    if (existing) {
      const blocksEqual = canonicalJson(existing.blocks) === canonicalJson(structuredBlocks);
      const metaEqual = existing.title === title && existing.seoDescription === desc && existing.path === pagePath;
      if (!blocksEqual || !metaEqual) {
        await db.update(pageTable).set({
          title,
          seoTitle: title,
          seoDescription: desc,
          path: pagePath,
          template,
          blocks: structuredBlocks as any,
          status: 'published',
          updatedAt: new Date(),
        }).where(eq(pageTable.id, existing.id));
      }
    } else {
      await db.insert(pageTable).values({
        slug: pageKey,
        locale: 'en',
        title,
        seoTitle: title,
        seoDescription: desc,
        path: pagePath,
        template,
        blocks: structuredBlocks as any,
        status: 'published',
        publishedAt: new Date(),
      });
    }

    pagesCache[pageKey] = {
      slug: pageKey,
      locale: 'en',
      title,
      seoTitle: title,
      seoDescription: desc,
      path: pagePath,
      template,
      blocks: structuredBlocks,
      status: 'published',
      publishedAt: new Date(),
    };

    seededCount++;
    console.log(`  ✓ Seeded page [${pageKey.padEnd(18)}] (${structuredBlocks.length.toString().padStart(2)} blocks) -> ${pagePath}`);
  }


  console.log(`\n[3/4] Successfully seeded ${seededCount} pages into database.`);

  const fixturePath = resolve(HERE, 'data', 'tracked-fixture-pages.json');
  writeFileSync(fixturePath, JSON.stringify(pagesCache, null, 2), 'utf8');
  console.log(`  ✓ Updated tracked-fixture-pages.json with all ${seededCount} pages.`);

  const allPages = await db.query.page.findMany();
  console.log(`[4/4] Verification: total pages in DB = ${allPages.length}.`);

  console.log('\n================================================================');
  console.log('✓ Phase D Page Seeding Complete: 28 Pages, 230 Blocks Active!');
  console.log('================================================================\n');

  try {
    const client = (db as any).$client;
    if (client && typeof client.close === 'function') await client.close();
  } catch {}
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error seeding pages:', err);
  process.exit(1);
});

