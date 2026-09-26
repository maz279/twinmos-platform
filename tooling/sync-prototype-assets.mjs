#!/usr/bin/env node
// Syncs the prototype's byte-identical runtime assets (app.js, data.js) into
// apps/web/public/assets/js/. They are NOT stored in this repo: the prototype
// directory is the single source of truth, and the vendored copies are
// produced at build time (wired as prebuild / predev in apps/web/package.json).
// Usage (from apps/web): node ../../tooling/sync-prototype-assets.mjs
import { copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const protoAssets = join(here, '..', '..', 'Corporate website development for TwinMOS', 'Features', 'prototype', 'assets', 'js');
const dest = join(here, '..', 'apps', 'web', 'public', 'assets', 'js');

const files = ['app.js', 'data.js'];
mkdirSync(dest, { recursive: true });
for (const f of files) {
  const src = join(protoAssets, f);
  if (!existsSync(src)) {
    console.error(`[sync-prototype-assets] missing ${src} — clone/restore the prototype directory first`);
    process.exit(1);
  }
  copyFileSync(src, join(dest, f));
  console.log(`[sync-prototype-assets] ${f} -> apps/web/public/assets/js/`);
}
