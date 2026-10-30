import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const pagesDir = resolve('apps/web/src/pages');
const files = readdirSync(pagesDir).filter(f => f.endsWith('.astro') && f !== '[locale]');

console.log(`Found ${files.length} .astro page files in ${pagesDir}`);

for (const file of files) {
  const content = readFileSync(resolve(pagesDir, file), 'utf8');
  const titleMatch = content.match(/const title =\s*("[^"]*"|'[^']*');/);
  const descMatch = content.match(/const desc =\s*("[^"]*"|'[^']*');/);
  const mainMatch = content.match(/<main[^>]*>([\s\S]*?)<\/main>/);
  
  console.log(`- ${file.padEnd(25)}: title=${!!titleMatch}, desc=${!!descMatch}, hasMain=${!!mainMatch}, mainLen=${mainMatch ? mainMatch[1].length : 0}`);
}
