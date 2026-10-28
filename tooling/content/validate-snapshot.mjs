// Fails when any page block in the content snapshot does not pass the shared
// block contract (the same validateBlocks() the admin API applies on save).
// Usage: node --experimental-strip-types tooling/content/validate-snapshot.mjs [snapshotDir]
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { validateBlocks } from '../../packages/shared/src/blocks.ts';
const dir = process.argv[2] ?? 'apps/api/content/snapshot';
const pages = JSON.parse(readFileSync(join(dir, 'page.json'), 'utf8'));
let bad = 0;
for (const p of pages) {
  const r = validateBlocks(p.blocks ?? []);
  if (!r.success) { bad++; console.log(p.path, JSON.stringify(r.errors).slice(0, 400)); }
}
console.log(`${pages.length - bad}/${pages.length} pages valid`);
process.exit(bad ? 1 : 0);
