#!/usr/bin/env node
/**
 * tooling/verify/verify-ms16-audit.mjs
 *
 * Milestone MS1.6 / Exit Gate VC-R0 Verification Suite Delegator
 * Phase 01 · Stop The Line: Phase 01 Verification & Exit Gate VC-R0
 * Roadmap: Milestone MS1.6 (T1.6.1 – T1.6.4, Criteria 1–15)
 *
 * Runs tooling/verify/verify-vc-r0-audit.mjs passing all CLI flags.
 */

import { spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const TARGET = resolve(HERE, 'verify-vc-r0-audit.mjs');
const args = process.argv.slice(2);

const res = spawnSync(process.execPath, [TARGET, ...args], {
  stdio: 'inherit',
  env: process.env,
});

process.exit(res.status ?? 0);
