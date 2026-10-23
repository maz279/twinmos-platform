// Prototype Glossary Importer (Roadmap MS4.3 · T4.3.1/T4.3.2 / C5a / Z-15)
//
// Imports the exact 113 authentic glossary terms from the tracked prototype.
// Fixes the t/d/l/ref key mapping:
//   t   -> term
//   d   -> definition
//   l   -> letter
//   ref -> explainerSlug
//
// Unpublishes / deletes any invented or mock terms so ONLY the 113 real terms are published.
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDb, glossaryTerm } from '@twinmos/db';
import { eq, and, notInArray } from 'drizzle-orm';
import { recordOutboxEvent } from '../src/services/outbox.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const CANDIDATE_DATA_PATHS = [
  resolve(HERE, '../../../prototype/assets/js/data.js'),
  resolve(HERE, '../../../../Corporate website development for TwinMOS/Features/prototype/assets/js/data.js'),
  'C:/Software_Project/TwinMOS_Corporate_Website/Corporate website development for TwinMOS/Features/prototype/assets/js/data.js',
];

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function importPrototypeGlossary(dbHandle?: any) {
  const db = dbHandle || createDb();

  let dataJsPath = '';
  for (const p of CANDIDATE_DATA_PATHS) {
    if (existsSync(p)) {
      dataJsPath = p;
      break;
    }
  }

  if (!dataJsPath) {
    throw new Error('prototype/assets/js/data.js not found at candidate locations');
  }

  const jsContent = readFileSync(dataJsPath, 'utf8');
  const windowObj: any = {};
  const fn = new Function('window', `${jsContent}; return window.TM;`);
  const tm = fn(windowObj);

  if (!tm || !Array.isArray(tm.glossary)) {
    throw new Error('Failed to parse window.TM.glossary from data.js');
  }

  const rawGlossary: Array<{ t: string; d: string; l: string; ref?: string }> = tm.glossary;
  console.log(`[import-glossary] Found ${rawGlossary.length} glossary terms in prototype data.js.`);

  if (rawGlossary.length !== 113) {
    throw new Error(`Expected exactly 113 terms, found ${rawGlossary.length}`);
  }

  const authenticTermsSet = new Set(rawGlossary.map((g) => g.t.trim()));

  // 1. Unpublish / remove any invented terms (T4.3.2)
  const existingRows = await db.select().from(glossaryTerm).where(eq(glossaryTerm.locale, 'en'));
  let unpublishedCount = 0;
  for (const row of existingRows) {
    if (!authenticTermsSet.has(row.term)) {
      // Unpublish / delete non-authentic term
      await db.delete(glossaryTerm).where(eq(glossaryTerm.id, row.id));
      unpublishedCount++;
    }
  }
  if (unpublishedCount > 0) {
    console.log(`[import-glossary] Removed/unpublished ${unpublishedCount} invented terms.`);
  }

  // 2. Insert or update the 113 authentic terms
  let explainerCount = 0;
  for (const item of rawGlossary) {
    const term = item.t.trim();
    const definition = item.d.trim();
    const letter = (item.l ? item.l.trim() : term.charAt(0)).toUpperCase();
    const explainerSlug = item.ref && item.ref.trim().length > 0 ? item.ref.trim() : null;
    const translationGroup = `glossary-${slugify(term)}`;

    if (explainerSlug) explainerCount++;

    const existing = await db
      .select({ id: glossaryTerm.id })
      .from(glossaryTerm)
      .where(and(eq(glossaryTerm.term, term), eq(glossaryTerm.locale, 'en')))
      .limit(1);

    if (existing[0]) {
      await db
        .update(glossaryTerm)
        .set({
          definition,
          letter,
          explainerSlug,
          status: 'published',
          translationGroup,
          updatedAt: new Date(),
        })
        .where(eq(glossaryTerm.id, existing[0].id));
    } else {
      await db.insert(glossaryTerm).values({
        term,
        definition,
        letter,
        explainerSlug,
        status: 'published',
        locale: 'en',
        translationGroup,
      });
    }
  }

  // 3. Record Outbox Event for cache invalidation
  try {
    await recordOutboxEvent(db, 'glossary.import', {
      action: 'import',
      totalTerms: 113,
      explainerCount,
      tags: ['glossary', 'glossary:en'],
    });
  } catch {}

  console.log(`[import-glossary] Successfully imported 113 authentic glossary terms (${explainerCount} with explainer links).`);
  return {
    total: 113,
    explainerCount,
    unpublishedCount,
  };
}

if (process.argv[1]?.endsWith('import-prototype-glossary.ts')) {
  importPrototypeGlossary()
    .then((res) => {
      console.log('Done:', res);
      process.exit(0);
    })
    .catch((err) => {
      console.error('Import failed:', err);
      process.exit(1);
    });
}
