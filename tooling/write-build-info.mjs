// Task T2.2.7 / BUILD-01: Build Provenance Generator
// Generates build-info.json with commitSha, builtAt, isDirty flag, and nodeVersion
// in web and admin dist directories after build.

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..');

const targetDist = process.argv[2] ? resolve(process.cwd(), process.argv[2]) : null;

if (!targetDist) {
  console.error('[write-build-info] Usage: node write-build-info.mjs <path-to-dist>');
  process.exit(1);
}

let commitSha = process.env.GIT_SHA || process.env.GITHUB_SHA || '';
let isDirty = false;

try {
  if (!commitSha) {
    commitSha = execSync('git rev-parse HEAD', { cwd: repoRoot, encoding: 'utf8' }).trim();
  }
  const statusOutput = execSync('git status --porcelain', { cwd: repoRoot, encoding: 'utf8' }).trim();
  // Filter out untracked files or temp test files if any, but track modified tracked files
  const trackedChanges = statusOutput.split('\n').filter((l) => l.trim() && !l.startsWith('??'));
  isDirty = trackedChanges.length > 0;
} catch (e) {
  if (!commitSha) commitSha = 'dev-local';
}

const buildInfo = {
  commitSha,
  builtAt: new Date().toISOString(),
  isDirty,
  nodeVersion: process.version,
};

mkdirSync(targetDist, { recursive: true });
const targetFile = resolve(targetDist, 'build-info.json');
writeFileSync(targetFile, JSON.stringify(buildInfo, null, 2) + '\n', 'utf8');

console.log(`[write-build-info] Wrote build-info.json to ${targetFile} (SHA: ${commitSha}, dirty: ${isDirty})`);
