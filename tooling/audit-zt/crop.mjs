// Crops a tall full-page screenshot into readable slices for human review.
// Usage: node tooling/audit-zt/crop.mjs <png> <outDir> [sliceHeight=1100]
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { basename, join } from 'node:path';
const [src, out, h = '1100'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const img = sharp(src);
const { width, height } = await img.metadata();
const step = Number(h);
for (let y = 0, i = 0; y < height; y += step, i++) {
  await sharp(src).extract({ left: 0, top: y, width, height: Math.min(step, height - y) }).toFile(join(out, `${basename(src, '.png')}-${String(i).padStart(2, '0')}.png`));
}
console.log(`${width}x${height} → ${Math.ceil(height / step)} slices`);
