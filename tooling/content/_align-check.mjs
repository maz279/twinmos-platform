import { segmentPage } from './segment.mjs';
import { readFileSync } from 'node:fs';
const pages = JSON.parse(readFileSync('apps/api/content/snapshot/page.json', 'utf8'));
let ok = 0, bad = 0;
for (const p of pages) {
  const file = 'prototype/' + (p.path === '/' ? 'index.html' : p.path.replace(/^\//, ''));
  const { segments } = segmentPage(file);
  const blocks = p.blocks || [];
  if (segments.length !== blocks.length) { console.log('COUNT', p.path, segments.length, blocks.length); bad++; continue; }
  blocks.forEach((b, i) => { if (b.component === segments[i].component) ok++; else { bad++; console.log('MISMATCH', p.path, i, b.component, '!=', segments[i].component); } });
}
console.log('aligned', ok, 'problems', bad);
