#!/usr/bin/env node
// Syncs the prototype's byte-identical runtime assets (app.js, data.js) into
// apps/web/public/assets/js/. The vendored copies are produced at build time
// (wired as prebuild / predev in apps/web/package.json).
// Source resolution: the IN-REPO prototype/ snapshot first (version-controlled,
// carries committed remediation fixes), with the legacy external workspace
// prototype as fallback only. Priority was flipped after a forensic audit
// (2026-10-07): the unconditional external preference silently re-vendored a
// STALE app.js over the committed wtyText() fix at every local build, while
// CI (no external dir) built the fixed code — dev/prod drift nobody could
// see because the regression test was vacuous (see e2e/public.spec.ts).
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
const usingInRepo = files.some((f) => existsSync(join(inRepoAssets, f)));
if (!usingInRepo) {
  console.warn('[sync-prototype-assets] in-repo prototype/ snapshot missing — falling back to the legacy workspace prototype');
}
for (const f of files) {
  const src = usingInRepo ? join(inRepoAssets, f) : join(externalAssets, f);
  if (!existsSync(src)) {
    console.error(`[sync-prototype-assets] missing ${src} — neither the in-repo prototype/ snapshot nor the workspace prototype has it`);
    process.exit(1);
  }
  copyFileSync(src, join(dest, f));
  console.log(`[sync-prototype-assets] ${f} -> apps/web/public/assets/js/ (source: ${usingInRepo ? 'in-repo prototype/ (canonical)' : 'workspace prototype (legacy fallback)'})`);
}
