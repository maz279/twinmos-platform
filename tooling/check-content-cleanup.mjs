import fs from 'node:fs';
import path from 'node:path';

console.log('=== Checking Content Clean-up (T5.6.2 / CONTENT-01 & CONTENT-02) ===\n');

// 1. Check client scripts and web templates for forbidden phrases
const scanDirs = ['apps/web/public/assets/js', 'apps/web/src'];
const forbiddenPhrases = [
  'nothing is sent from your browser',
  'This prototype stores nothing server-side',
  'Interactive prototype',
  '27-year',
];

function scanFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanFiles(fullPath);
    } else if (/\.(js|astro|ts|tsx|json|html)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const phrase of forbiddenPhrases) {
        if (content.toLowerCase().includes(phrase.toLowerCase())) {
          console.warn(`[WARN] Found forbidden phrase "${phrase}" in: ${fullPath}`);
        }
      }
    }
  }
}

for (const d of scanDirs) {
  if (fs.existsSync(d)) scanFiles(d);
}

// 2. Check articles for excerpts starting with /) —
const articlesPath = 'apps/api/data/articles.json';
if (fs.existsSync(articlesPath)) {
  const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));
  let malformedExcerpts = 0;
  let missingHero = 0;
  articles.forEach((a, i) => {
    if (a.excerpt && a.excerpt.startsWith('/) —')) {
      malformedExcerpts++;
      console.warn(`[WARN] Article ${a.slug || i} excerpt starts with /) —`);
    }
    if (!a.heroImage && !a.coverImage && !a.image) {
      missingHero++;
    }
  });
  console.log(`Articles: ${articles.length} total. Malformed excerpts: ${malformedExcerpts}. Missing hero: ${missingHero}`);
} else {
  console.log(`apps/api/data/articles.json not found, checking database/seed...`);
}

// 3. Check FAQs for raw markdown links
const faqsPath = 'apps/api/data/faqs.json';
if (fs.existsSync(faqsPath)) {
  const faqs = JSON.parse(fs.readFileSync(faqsPath, 'utf8'));
  let rawLinks = 0;
  faqs.forEach((f, i) => {
    if (/\[([^\]]+)\]\(([^)]+)\)/.test(f.answer || '')) {
      rawLinks++;
      console.warn(`[WARN] FAQ ${f.id || i} contains raw markdown link`);
    }
  });
  console.log(`FAQs: ${faqs.length} total. Raw markdown links: ${rawLinks}`);
}

console.log('\nScan completed.');
