// Prototype article content helper (MS4.2 · T4.2.4).
//
// Nav links in the prototype point at four Knowledge Hub articles. The menu
// importer guarantees those destinations exist by seeding the real article
// text from the tracked prototype data store (the same source used by
// tooling/build-catalog-data.ts). Content is markdown converted to sanitized
// HTML; existing rows are never overwritten.
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';
import { and, eq, inArray } from 'drizzle-orm';
import { article } from '@twinmos/db';
import type { DB } from '@twinmos/db';

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA_PATHS = [
  resolve(HERE, '../../../prototype/assets/js/data.js'),
  resolve(HERE, '../../../../Corporate website development for TwinMOS/Features/prototype/assets/js/data.js'),
];

type ProtoArticle = {
  id: string;
  title?: string;
  desc?: string;
  cat?: string;
  date?: string;
  mins?: number;
  body?: Array<{ h?: string; p?: string }>;
};

function loadPrototypeArticles(): Map<string, ProtoArticle> {
  const path = DATA_PATHS.find((candidate) => existsSync(candidate));
  if (!path) return new Map();
  try {
    const raw = readFileSync(path, 'utf8');
    const json = raw.replace(/^\/\*[^*]*\*\/\s*window\.TM\s*=\s*/, '').replace(/;?\s*$/, '');
    const data = JSON.parse(json);
    const rows: ProtoArticle[] = Array.isArray(data?.articles) ? data.articles : [];
    return new Map(rows.filter((row) => row?.id).map((row) => [row.id, row]));
  } catch {
    return new Map();
  }
}

const inline = (value: unknown) => DOMPurify.sanitize(String(marked.parseInline(String(value ?? ''))));
const block = (value: unknown) => DOMPurify.sanitize(String(marked.parse(String(value ?? ''))));

/** Insert missing referenced articles and repair rows whose body was corrupted
 *  (e.g. a structured array coerced to "[object Object]"). */
export async function ensurePrototypeArticles(db: DB, slugs: string[]): Promise<string[]> {
  const wanted = [...new Set(slugs.filter(Boolean))];
  if (wanted.length === 0) return [];

  const existing = await db
    .select({ slug: article.slug, body: article.body })
    .from(article)
    .where(and(eq(article.locale, 'en'), inArray(article.slug, wanted)));
  const existingBySlug = new Map(existing.map((row) => [row.slug, row]));
  const broken = new Set(
    existing.filter((row) => !row.body || String(row.body).includes('[object Object]')).map((row) => row.slug),
  );
  const missing = wanted.filter((slug) => !existingBySlug.has(slug));
  if (missing.length === 0 && broken.size === 0) return [];

  const proto = loadPrototypeArticles();
  const changed: string[] = [];

  for (const slug of [...missing, ...broken]) {
    const source = proto.get(slug);
    if (!source) continue;

    const bodyHtml = (Array.isArray(source.body) ? source.body : [])
      .map((section) => `<h2>${inline(section.h)}</h2>${block(section.p)}`)
      .join('\n');

    const published = source.date ? new Date(source.date) : new Date();
    const publishedAt = Number.isNaN(published.getTime()) ? new Date() : published;

    if (missing.includes(slug)) {
      await db
        .insert(article)
        .values({
          slug,
          locale: 'en',
          title: String(source.title || slug),
          deck: source.desc ? String(source.desc) : null,
          body: bodyHtml,
          category: String(source.cat || 'Article'),
          status: 'published',
          publishAt: publishedAt,
          readingTimeMin: Number(source.mins) || null,
          structuredBody: Array.isArray(source.body) ? source.body : [],
        })
        .onConflictDoNothing();
    } else {
      await db
        .update(article)
        .set({
          title: String(source.title || slug),
          deck: source.desc ? String(source.desc) : null,
          body: bodyHtml,
          category: String(source.cat || 'Article'),
          readingTimeMin: Number(source.mins) || null,
          structuredBody: Array.isArray(source.body) ? source.body : [],
          updatedAt: new Date(),
        })
        .where(and(eq(article.locale, 'en'), eq(article.slug, slug)));
    }
    changed.push(slug);
  }

  return changed;
}
