#!/usr/bin/env node
/**
 * tooling/verify/verify-ms26-audit.mjs
 *
 * Milestone MS2.6 / Exit Gate VC-A Verification Suite Delegator
 * Phase 02 · Stop-Ship Close-Out: Security Regression Pack & Gate A / VC-A
 * Roadmap: Milestone MS2.6 (T2.6.1 – T2.6.6)
 *
 * Runs tooling/verify/verify-vc-a-audit.mjs passing all CLI flags.
 */

import { spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const TARGET = resolve(HERE, 'verify-vc-a-audit.mjs');
const args = process.argv.slice(2);

const res = spawnSync(process.execPath, [TARGET, ...args], {
  stdio: 'inherit',
  env: process.env,
});

process.exit(res.status ?? 0);
