#!/usr/bin/env node
// Syncs the prototype's byte-identical runtime assets (app.js, data.js) into
// apps/web/public/assets/js/. The vendored copies are produced at build time
// (wired as prebuild / predev in apps/web/package.json).
// Source resolution: the original workspace prototype directory when present
// (dev machines), otherwise the in-repo prototype/ snapshot (fresh clones).
// Usage (from apps/web): node ../../tooling/sync-prototype-assets.mjs
import { copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const externalAssets = join(here, '..', '..', 'Corporate website development for TwinMOS', 'Features', 'prototype', 'assets', 'js');
const inRepoAssets = join(here, '..', 'prototype', 'assets', 'js');
const dest = join(here, '..', 'apps', 'web', 'public', 'assets', 'js');

const files = ['app.js', 'data.js'];
mkdirSync(dest, { recursive: true });
const usingExternal = files.some((f) => existsSync(join(externalAssets, f)));
for (const f of files) {
  const src = usingExternal ? join(externalAssets, f) : join(inRepoAssets, f);
  if (!existsSync(src)) {
    console.error(`[sync-prototype-assets] missing ${src} — neither the workspace prototype nor the in-repo prototype/ snapshot has it`);
    process.exit(1);
  }
  copyFileSync(src, join(dest, f));
  console.log(`[sync-prototype-assets] ${f} -> apps/web/public/assets/js/ (source: ${usingExternal ? 'workspace prototype' : 'in-repo prototype/'})`);
}
