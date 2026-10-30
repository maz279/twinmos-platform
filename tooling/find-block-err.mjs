import { readFileSync } from 'node:fs';

const content = readFileSync('apps/web/src/components/blocks/BlockDispatcher.astro', 'utf8');
const lines = content.split('\n');

lines.forEach((line, idx) => {
  if (/\bblock\b/.test(line) && !line.includes('blocks') && !line.includes('blockId') && !line.includes('block-') && !line.includes('Block') && !line.includes('isFormComposite')) {
    console.log(`${idx + 1}: ${line}`);
  }
});
