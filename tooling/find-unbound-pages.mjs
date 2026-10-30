import { readdirSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';

const pagesDir = resolve('apps/web/src/pages');
const pageFiles = readdirSync(pagesDir).filter((f) => f.endsWith('.astro'));

for (const file of pageFiles) {
  const content = readFileSync(join(pagesDir, file), 'utf8');
  const usesDelivery = /getDelivery(Page|Product|Article|News|Faqs|Facets)/.test(content);
  const usesBlockDispatcher = /<BlockDispatcher/.test(content);
  if (!usesDelivery || !usesBlockDispatcher) {
    console.log(`Page: ${file} | usesDelivery: ${usesDelivery} | usesBlockDispatcher: ${usesBlockDispatcher}`);
  }
}
