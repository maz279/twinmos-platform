#!/usr/bin/env node
// Syncs the built admin SPA (apps/admin/dist) into apps/web/public/admin so the
// web server serves the same admin bundle that was just built. Without this the
// checked-in public/admin copy goes stale and the wire serves an old admin.
// Fails loudly when apps/admin/dist is missing or has no index.html.
import { cpSync, existsSync, readFileSync, rmSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const src = resolve(root, 'apps/admin/dist');
const dest = resolve(root, 'apps/web/public/admin');

const indexFile = resolve(src, 'index.html');
if (!existsSync(src) || !existsSync(indexFile)) {
  console.error('[sync-admin-dist] apps/admin/dist is missing or has no index.html — build @twinmos/admin first.');
  process.exit(1);
}
const srcInfo = JSON.parse(readFileSync(resolve(src, 'build-info.json'), 'utf8'));
if (!srcInfo.commitSha) {
  console.error('[sync-admin-dist] apps/admin/dist/build-info.json has no commitSha — refusing to sync an unprovenanced build.');
  process.exit(1);
}

rmSync(dest, { recursive: true, force: true });
cpSync(src, dest, { recursive: true });
const copiedIndex = statSync(resolve(dest, 'index.html'));
console.log(`[sync-admin-dist] ${copiedIndex.size}B index.html -> apps/web/public/admin (admin sha ${srcInfo.commitSha.slice(0, 7)}${srcInfo.isDirty ? ' dirty' : ''})`);
