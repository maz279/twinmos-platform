import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BLOCK_TYPES } from '@twinmos/shared';
import { runLoadTest } from '../../../tooling/load/run-load-test.mjs';
import { runResilienceDrill } from '../../../tooling/ops/resilience-drill.mjs';
import { runRunbookRehearsal } from '../../../tooling/ops/runbook-rehearsal.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..', '..', '..');

describe('Milestone MS7.4: Load, Resilience and Runbooks Suite', () => {
  it('T7.4.1 / LOAD-01: Multi-Scenario Concurrent Load Test passes with 0 errors within SLA', async () => {
    const res = await runLoadTest({
      cachedRpsTarget: 150,
      dynamicRpsTarget: 25,
      durationSec: 1,
      quiet: true,
    });

    expect(res.summary.totalErrors).toBe(0);
    expect(res.metrics.cached.latencies.p95).toBeLessThan(300);
    expect(res.metrics.dynamic.latencies.p95).toBeLessThan(800);
    expect(res.metrics.cached.throughputReqPerSec).toBeGreaterThan(0);
    expect(res.metrics.dynamic.throughputReqPerSec).toBeGreaterThan(0);
  }, 30000);

  it('T7.4.2 / LOAD-01: Resilience Drill demonstrates clean 503 degradation and 200 recovery', async () => {
    const drillRes = await runResilienceDrill({ quiet: true });
    expect(drillRes.passed).toBe(true);
    expect(drillRes.degradedStatusCode).toBe(503);
    expect(drillRes.recoveredStatusCode).toBe(200);
  }, 30000);

  it('T7.4.3 / LOAD-01: Empirical VM Sizing Decision Document is grounded in benchmark results', () => {
    const docPath = resolve(repoRoot, 'docs', 'reports', 'VM_SIZING_DECISION.md');
    expect(existsSync(docPath)).toBe(true);
    const content = readFileSync(docPath, 'utf8');

    expect(content).toContain('4 vCPU');
    expect(content).toContain('8 GB');
    expect(content).toContain('PostgreSQL 18');
    expect(content).toContain('Node.js 24');
    expect(content).not.toContain('PM2');
  });

  it('T7.4.4 / RUN-01: Runbooks have zero contradictions and pinned modern runtimes', () => {
    const deployContent = readFileSync(resolve(repoRoot, 'docs', 'runbooks', 'DEPLOY.md'), 'utf8');
    expect(deployContent).toMatch(/PostgreSQL 18|Postgres 18/);
    expect(deployContent).toMatch(/Node\.js 24|node 24/);
    expect(deployContent).toContain('BOOTSTRAP_SEED=1');
    expect(deployContent).toContain('A10');
    expect(deployContent).toContain('DOCKER-USER');
    expect(deployContent).toContain('refresh-cf-ranges.mjs');
    expect(deployContent).toContain('NEW-07');
    expect(deployContent).not.toContain('PM2');

    const rollbackContent = readFileSync(resolve(repoRoot, 'docs', 'runbooks', 'ROLLBACK.md'), 'utf8');
    expect(rollbackContent).toContain('ln -sfn');
    expect(rollbackContent).toContain('health/deep');

    const secretsContent = readFileSync(resolve(repoRoot, 'docs', 'runbooks', 'SECRETS.md'), 'utf8');
    expect(secretsContent).toContain('Dual-Key');
    expect(secretsContent).toContain('BETTER_AUTH_SECRETS');
    expect(secretsContent).toContain('rotate-secrets.mjs');

    const incidentContent = readFileSync(resolve(repoRoot, 'docs', 'runbooks', 'INCIDENT.md'), 'utf8');
    expect(incidentContent).toContain('P1 - Critical');
    expect(incidentContent).toContain('5 Whys');

    const obsContent = readFileSync(resolve(repoRoot, 'docs', 'runbooks', 'OBSERVABILITY.md'), 'utf8');
    expect(obsContent).toContain('Service Rollback RTO');
    expect(obsContent).toContain('< 15 min');
    expect(obsContent).toContain('Disaster Recovery RTO');
    expect(obsContent).toContain('Disaster Recovery RPO');
  });

  it('T7.4.4: 04-ADMIN-CMS-SPEC aligns with all 18 active modules in apps/admin/src/nav.ts', () => {
    const specContent = readFileSync(resolve(repoRoot, 'docs', '04-ADMIN-CMS-SPEC.md'), 'utf8');
    const expectedModules = [
      'dashboard', 'search', 'content', 'entities', 'products', 'compatibility',
      'submissions', 'rma', 'partners', 'serials', 'jobs', 'media',
      'translations', 'users', 'audit', 'settings', 'privacy', 'alerts',
    ];

    for (const mod of expectedModules) {
      expect(specContent).toContain(`\`${mod}\``);
    }
    expect(specContent).toContain('requireRole()');
    expect(specContent).toContain('NEW-07');
    expect(specContent).toContain('NF-38');
  });

  it('T7.4.4: OpenAPI 3.1.0 specification conforms to API schema', () => {
    const raw = readFileSync(resolve(repoRoot, 'docs', 'api', 'openapi.json'), 'utf8');
    const json = JSON.parse(raw);
    expect(json.openapi).toBe('3.1.0');
    expect(json.paths['/health']).toBeDefined();
    expect(json.paths['/health/deep']).toBeDefined();
  });

  it('T7.4.4: CONTENT_MANAGEMENT_GUIDE covers all roles and 30 block types', () => {
    const guidePath = resolve(repoRoot, 'docs', 'guides', 'CONTENT_MANAGEMENT_GUIDE.md');
    expect(existsSync(guidePath)).toBe(true);
    const content = readFileSync(guidePath, 'utf8');

    for (const role of ['super_admin', 'admin', 'editor', 'author', 'viewer']) {
      expect(content).toContain(role);
    }

    expect(BLOCK_TYPES).toHaveLength(30);
    for (const block of BLOCK_TYPES) {
      expect(content).toContain(`\`${block}\``);
    }
  });

  it('T7.4.5 / RUN-01: Independent operator runbook rehearsal completes cleanly', async () => {
    const res = await runRunbookRehearsal({ quiet: true });
    expect(res.passed).toBe(true);
    expect(res.results.deploy.passed).toBe(true);
    expect(res.results.secrets.passed).toBe(true);
    expect(res.results.rollback.passed).toBe(true);
    expect(res.results.dr.passed).toBe(true);

    const logPath = resolve(repoRoot, 'docs', 'evidence', 'runbook_rehearsal_log.md');
    expect(existsSync(logPath)).toBe(true);
  });
});
