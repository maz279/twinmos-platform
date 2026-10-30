import { readFileSync } from 'node:fs';
const inv = JSON.parse(readFileSync('tooling/data/inventory_blocks.json', 'utf8'));
const pages = Array.from(new Set(inv.map(b => b.page))).sort();
console.log(`Core Pages (${pages.length}):`);
pages.forEach(p => console.log(` - ${p}`));
