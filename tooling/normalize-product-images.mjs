#!/usr/bin/env node
/**
 * normalize-product-images.mjs
 *
 * Product packshots ship on oversized canvases: the /products originals carry
 * transparent padding, and older /card variants wrap the same photo in an
 * opaque black rectangle, so grids render small products inside large empty
 * wells. This script trims the transparent border of every source packshot and
 * rebuilds the /card variant from that trimmed source, keeping each file's
 * existing name and format. Category artwork is trimmed in place.
 *
 * Usage:
 *   node tooling/normalize-product-images.mjs [--dry] [--verbose]
 *
 * Idempotent: already-trimmed files pass through unchanged.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const CARD_DIR = path.join(ROOT, 'apps/web/public/assets/img/card');
const PRODUCT_DIR = path.join(ROOT, 'apps/web/public/assets/img/products');
const DRY = process.argv.includes('--dry');
const VERBOSE = process.argv.includes('--verbose');
const TRIM_THRESHOLD = 12;
const IMAGE_RE = /\.(png|webp|jpe?g)$/i;

const stats = { cardRebuilt: 0, cardTrimmed: 0, productTrimmed: 0, skipped: 0, failed: 0 };
const failures = [];

async function listImages(dir) {
  try {
    const names = await fs.readdir(dir);
    return names.filter((name) => IMAGE_RE.test(name));
  } catch {
    return [];
  }
}

async function trimTransparent(inputPath) {
  // Read once into memory: libvips can keep a lazy file handle on Windows, which
  // blocks the atomic write when the source and destination are the same path.
  const input = await fs.readFile(inputPath);
  const meta = await sharp(input, { failOn: 'none' }).metadata();
  if (!meta.hasAlpha) {
    return { buffer: null, meta, trimmed: false, reason: 'no-alpha' };
  }
  try {
    const { data, info } = await sharp(input, { failOn: 'none' })
      .trim({ threshold: TRIM_THRESHOLD })
      .toBuffer({ resolveWithObject: true });
    const changed = info.width !== meta.width || info.height !== meta.height;
    return { buffer: data, info, meta, trimmed: changed };
  } catch (error) {
    return { buffer: null, meta, trimmed: false, reason: error.message };
  }
}

async function encodeFor(destPath, buffer, sourceMeta) {
  const ext = path.extname(destPath).toLowerCase();
  if (ext === '.webp') {
    return sharp(buffer).webp({ quality: 92, alphaQuality: 100, effort: 5 }).toBuffer();
  }
  if (ext === '.jpg' || ext === '.jpeg') {
    return sharp(buffer).flatten({ background: '#ffffff' }).jpeg({ quality: 92, mozjpeg: true }).toBuffer();
  }
  // PNG: keep alpha, strip metadata, maximum compression.
  return sharp(buffer)
    .png({ compressionLevel: 9, adaptiveFiltering: true, palette: Boolean(sourceMeta?.palette) })
    .toBuffer();
}

/** Products whose packshot has no alpha channel but is a photo on a flat
 *  background: trim uniform edges using the corner colour as background. */
async function trimFlatBackground(inputPath) {
  const input = await fs.readFile(inputPath);
  const meta = await sharp(input, { failOn: 'none' }).metadata();
  if (meta.hasAlpha) return null;
  try {
    const { data, info } = await sharp(input, { failOn: 'none' })
      .trim({ background: { r: 255, g: 255, b: 255 }, threshold: 8 })
      .toBuffer({ resolveWithObject: true });
    const changed = info.width !== meta.width || info.height !== meta.height;
    return changed ? { buffer: data, info, meta, trimmed: true } : null;
  } catch {
    return null;
  }
}

async function processFile({ sourcePath, destPath, label }) {
  try {
    let result = await trimTransparent(sourcePath);
    if (!result.buffer) {
      const flat = await trimFlatBackground(sourcePath);
      if (flat) result = flat;
    }
    if (!result.buffer || !result.trimmed) {
      stats.skipped += 1;
      if (VERBOSE) console.log(`  skip  ${label} (${result.reason ?? 'already tight'})`);
      return false;
    }
    const out = await encodeFor(destPath, result.buffer, result.meta);
    const before = `${result.meta.width}x${result.meta.height}`;
    const after = `${result.info.width}x${result.info.height}`;
    if (VERBOSE) console.log(`  trim  ${label}  ${before} -> ${after}`);
    if (!DRY) {
      const tmp = `${destPath}.${process.pid}.tmp`;
      await fs.writeFile(tmp, out);
      await fs.rename(tmp, destPath);
    }
    return true;
  } catch (error) {
    stats.failed += 1;
    failures.push(`${label}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log(`Normalizing product images${DRY ? ' (dry run)' : ''}…`);
  const cardFiles = await listImages(CARD_DIR);
  const productFiles = await listImages(PRODUCT_DIR);
  const productByBase = new Map();
  for (const name of productFiles) {
    productByBase.set(path.parse(name).name, name);
  }

  const usedProducts = new Set();
  for (const cardName of cardFiles) {
    const base = path.parse(cardName).name;
    const productName = productByBase.get(base);
    const destPath = path.join(CARD_DIR, cardName);
    const sourcePath = productName ? path.join(PRODUCT_DIR, productName) : destPath;
    if (productName) usedProducts.add(productName);
    const changed = await processFile({ sourcePath, destPath, label: `card/${cardName}` });
    if (changed) productName ? stats.cardRebuilt++ : stats.cardTrimmed++;
  }

  for (const productName of productFiles) {
    if (usedProducts.has(productName)) {
      // Card variants are derived from the same tight source, but the product
      // original is also served by the PDP gallery — trim it too.
    }
    const destPath = path.join(PRODUCT_DIR, productName);
    const changed = await processFile({ sourcePath: destPath, destPath, label: `products/${productName}` });
    if (changed) stats.productTrimmed++;
  }

  console.log(JSON.stringify({ ...stats, failures }, null, 2));
  if (failures.length) process.exitCode = 1;
}

await main();
