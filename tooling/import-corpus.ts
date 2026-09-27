// P3 corpus importer — bootstraps the CMS from the 437-file markdown corpus
// (content/website-content/**). The corpus remains the seeding source (ADR-006);
// after import, editors own the content in the CMS.
// Run from repo root:  node --experimental-strip-types --no-warnings tooling/import-corpus.ts
//
// Routing of corpus sections → entities:
//   06-media-newsroom/**      → news_post (tag from frontmatter; eventDate when present)
//   07-support/**/faq*.md     → faq (group from folder)
//   08-learn/** (articles)    → article (category from frontmatter, fallback Guide)
//   everything else           → article (category = section label) so no corpus text is lost
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { createDb, article, newsPost, faq } from '../packages/db/src/index.ts';
import { slugify } from '../packages/shared/src/index.ts';

const CORPUS_ROOT = process.argv[2] ?? join('..', 'Corporate website development for TwinMOS', 'content', 'website-content');

/** Minimal frontmatter parser: key: value, lists, quoted strings. */
function parseFrontmatter(raw: string): { data: Record<string, any>; body: string } {
  if (!raw.startsWith('---')) return { data: {}, body: raw };
  const end = raw.indexOf('\n---', 3);
  if (end < 0) return { data: {}, body: raw };
  const fm = raw.slice(4, end);
  const body = raw.slice(raw.indexOf('\n', end + 1) + 1);
  const data: Record<string, any> = {};
  let listKey: string | null = null;
  for (const line of fm.split('\n')) {
    const listItem = line.match(/^\s*-\s+(.*)$/);
    if (listItem && listKey) {
      (data[listKey] as string[]).push(listItem[1].replace(/^["']|["']$/g, ''));
      continue;
    }
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (kv) {
      const key = kv[1], val = kv[2].trim();
      if (val === '') { data[key] = []; listKey = key; }
      else if (val.startsWith('[') && val.endsWith(']')) {
        data[key] = val.slice(1, -1).split(',').map((x) => x.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
        listKey = null;
      } else { data[key] = val.replace(/^["']|["']$/g, ''); listKey = null; }
    }
  }
  return { data, body: body.trim() };
}

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (name.endsWith('.md')) out.push(p);
  }
  return out;
}

const SECTION_CATEGORY: Record<string, string> = {
  '00-site-wide': 'Site', '01-homepage': 'Site', '02-about': 'Company',
  '03-products': 'Products', '04-solutions': 'Solutions', '05-gaming': 'Gaming',
  '06-technology': 'Technology', '07-support': 'Support', '08-learn': 'Guide',
  '09-partners': 'Partners', '10-media-newsroom': 'Newsroom',
  '11-regional': 'Regional', '12-careers': 'Careers', '13-legal': 'Legal',
};

async function main() {
  const db = createDb();
  const files = walk(CORPUS_ROOT).filter((f) => !relative(CORPUS_ROOT, f).split(sep).includes('.mimosa'));
  console.log(`[import-corpus] ${files.length} markdown files under ${CORPUS_ROOT}`);

  const existingArticles = new Set((await db.select({ slug: article.slug }).from(article)).map((r: any) => r.slug));
  const existingNews = new Set((await db.select({ slug: newsPost.slug }).from(newsPost)).map((r: any) => r.slug));
  const existingFaqs = new Set((await db.select({ q: faq.question }).from(faq)).map((r: any) => r.q));

  let a = 0, n = 0, f = 0, skipped = 0;
  for (const path of files) {
    const rel = relative(CORPUS_ROOT, path).split(sep).join('/');
    const section = rel.split('/')[0];
    const { data, body } = parseFrontmatter(readFileSync(path, 'utf8'));
    const title = String(data.title ?? rel.replace(/\.md$/, ''));
    const slug = String(data.slug ?? slugify(title));

    // FAQ files: question/answer sections or faq-named files
    if (/faq/i.test(rel)) {
      const q = title.length > 8 && body ? title : rel;
      if (existingFaqs.has(q)) { skipped++; continue; }
      await db.insert(faq).values({
        groupKey: slugify(section).slice(0, 40) || 'support',
        question: q.slice(0, 500),
        answer: (body || title).slice(0, 20000),
        sort: f, status: 'published',
      });
      existingFaqs.add(q); f++; continue;
    }

    // newsroom → news posts (section 10 per corpus layout; legacy 06 fallback)
    if (/news|newsroom|media/i.test(section)) {
      if (existingNews.has(slug)) { skipped++; continue; }
      await db.insert(newsPost).values({
        slug, title: title.slice(0, 200), body: body.slice(0, 200000),
        tag: data.tag ? String(data.tag).slice(0, 40) : 'News',
        eventDate: data.date ? new Date(String(data.date)) : null,
        status: 'draft', // corpus imports start as drafts; editors publish via the CMS
      });
      existingNews.add(slug); n++; continue;
    }

    // ONLY the learn hub maps to articles — the prototype article reader
    // consumes exactly these; other sections are page copy, not articles.
    if (section !== '08-learn') {
      if (existingArticles.has(slug)) { skipped++; continue; }
      await db.insert(article).values({
        slug, title: title.slice(0, 200),
        deck: data.description ? String(data.description).slice(0, 400) : null,
        body: body.slice(0, 200000),
        category: String(data.category ?? SECTION_CATEGORY[section] ?? 'Article').slice(0, 40),
        tags: Array.isArray(data.keywords) ? data.keywords.slice(0, 12).map((k: any) => String(k).slice(0, 40)) : [],
        status: 'draft', // page-copy imports stay drafts — editors promote what they need
      });
      existingArticles.add(slug); a++; continue;
    }

    if (existingArticles.has(slug)) { skipped++; continue; }
    await db.insert(article).values({
      slug, title: title.slice(0, 200),
      deck: data.description ? String(data.description).slice(0, 400) : null,
      body: body.slice(0, 200000),
      category: String(data.category ?? 'Guide').slice(0, 40),
      tags: Array.isArray(data.keywords) ? data.keywords.slice(0, 12).map((k: any) => String(k).slice(0, 40)) : [],
      status: 'draft', // parity rule: nothing goes live until an editor publishes it
    });
    existingArticles.add(slug); a++;
  }

  console.log(`[import-corpus] articles=${a} news=${n} faqs=${f} skipped(duplicate)=${skipped}`);
  await (db as any).$client.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
