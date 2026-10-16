// Gate F Check OBS-01: Observability, Metrics & Alerting Audit
// Verifies alerting rules, latency/5xx telemetry, V-09 mail alert hook, deep health probes.
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..', '..');
const mod = (p) => import(pathToFileURL(join(repoRoot, p)).href);

export async function verifyOBS01() {
  process.env.NODE_ENV = 'test';
  process.env.AUDIT_RETENTION_DISABLED = '1';

  // 1. Alert Manager & Rules Verification
  const { alertManager } = await mod('apps/api/src/services/alerts.ts');
  alertManager.clear();

  // Test 5xx alert trigger
  for (let i = 0; i < 5; i++) {
    alertManager.recordRequest(500, 45);
  }
  let alerts = alertManager.getAlerts();
  const alert5xx = alerts.find((a) => a.ruleId === 'http.5xx_rate_exceeded');
  if (!alert5xx) throw new Error('Rule http.5xx_rate_exceeded failed to trigger on 5 consecutive 500 errors');

  // Test latency threshold trigger (> 1000ms)
  alertManager.recordRequest(200, 1250);
  alerts = alertManager.getAlerts();
  const alertLatency = alerts.find((a) => a.ruleId === 'http.latency_p95_exceeded');
  if (!alertLatency) throw new Error('Rule http.latency_p95_exceeded failed to trigger on 1250ms latency spike');

  // Test form notification failure (Closing V-09)
  alertManager.recordMailFailure('contact', 'CT-12345', new Error('SMTP connection refused'));
  alerts = alertManager.getAlerts();
  const alertMail = alerts.find((a) => a.ruleId === 'mail.form_notification_failed');
  if (!alertMail) throw new Error('Rule mail.form_notification_failed failed to trigger (V-09)');

  // Test account lockout alert (Closing S-06 / A4a)
  alertManager.recordLockout('attacker@bad.actor', '192.168.1.1', 5);
  alerts = alertManager.getAlerts();
  const alertLockout = alerts.find((a) => a.ruleId === 'auth.account_locked');
  if (!alertLockout) throw new Error('Rule auth.account_locked failed to trigger on account lockout');

  // Test summary & resolution
  const summary = alertManager.getSummary();
  if (summary.totalAlerts < 4 || summary.severities.high < 2) {
    throw new Error('alertManager.getSummary() returned unexpected counts');
  }

  const resolved = alertManager.resolveAlert(alert5xx.id);
  if (!resolved || alertManager.getFiringCount() !== summary.totalAlerts - 1) {
    throw new Error('alertManager.resolveAlert() failed to remove resolved alert');
  }

  // 2. Health & Deep Health HTTP Probes
  const { createDb } = await mod('packages/db/src/index.ts');
  const { buildApp } = await mod('apps/api/src/app.ts');
  const db = await createDb();
  const app = buildApp(db);

  // Probe /health
  const healthRes = await app.request('/api/v1/health');
  if (healthRes.status !== 200) throw new Error(`/api/v1/health returned ${healthRes.status}`);
  const healthJson = await healthRes.json();
  if (healthJson.status !== 'ok' || healthJson.db !== 'connected') {
    throw new Error(`/api/v1/health returned unexpected payload: ${JSON.stringify(healthJson)}`);
  }

  // Probe /health/deep
  const deepRes = await app.request('/api/v1/health/deep');
  if (deepRes.status !== 200) throw new Error(`/api/v1/health/deep returned ${deepRes.status}`);
  const deepJson = await deepRes.json();
  if (deepJson.status !== 'ok' || !deepJson.components?.database || !deepJson.components?.alerts) {
    throw new Error(`/api/v1/health/deep missing component diagnostics: ${JSON.stringify(deepJson)}`);
  }

  // Verify X-Request-Id header propagation
  if (!deepRes.headers.get('x-request-id')) {
    throw new Error('Response missing X-Request-Id correlation header');
  }

  // 3. Runbook verification
  const runbookPath = resolve(repoRoot, 'docs', 'runbooks', 'OBSERVABILITY.md');
  if (!existsSync(runbookPath)) throw new Error('Missing docs/runbooks/OBSERVABILITY.md');
  const runbookContent = readFileSync(runbookPath, 'utf8');
  if (!runbookContent.includes('SLO') || !runbookContent.includes('http.5xx_rate_exceeded') || !runbookContent.includes('V-09')) {
    throw new Error('docs/runbooks/OBSERVABILITY.md missing required SLOs or alert rules');
  }

  return 'PASS (Alert manager rules, V-09 mail alert, /health, /health/deep, X-Request-Id, and OBSERVABILITY.md verified)';
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  verifyOBS01()
    .then((msg) => { console.log('[*] OBS-01:', msg); process.exit(0); })
    .catch((err) => { console.error('[✗] OBS-01 FAILED:', err.message); process.exit(1); });
}
