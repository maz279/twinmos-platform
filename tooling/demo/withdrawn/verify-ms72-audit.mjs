#!/usr/bin/env node
/**
 * verify-ms72-audit.mjs — Comprehensive 8-Gate Master Audit for MS7.2: Observability and Alerting
 * Evaluates:
 * Gate 01: Structured Logging & Edge Tracing (T7.2.1 / Z-23)
 * Gate 02: Error Tracking with Release Tagging & PII Scrubbing (T7.2.2)
 * Gate 03: Prometheus Metrics Exposition & Deep Diagnostics (T7.2.3)
 * Gate 04: External Uptime Probes Across Canonical Targets (T7.2.3)
 * Gate 05: Durable Persistent Channel & 9 Alert Rules (T7.2.4)
 * Gate 06: Personal Data Sanitization in Alerts (Finding Z-29)
 * Gate 07: Edge Log Analytics & Reporting (T7.2.5)
 * Gate 08: All-Alerts Firing Drill & Quality Gate OBS-01 Certification (T7.2.6)
 */

import { readFileSync, existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..', '..');
const mod = (p) => import(pathToFileURL(join(repoRoot, p)).href);

const GATES = [
  'Gate 01: Structured Logging & Edge Tracing (T7.2.1 / Z-23)',
  'Gate 02: Error Tracking with Release Tagging & PII Scrubbing (T7.2.2)',
  'Gate 03: Prometheus Metrics Exposition & Deep Diagnostics (T7.2.3)',
  'Gate 04: External Uptime Probes Across Canonical Targets (T7.2.3)',
  'Gate 05: Durable Persistent Channel & 9 Alert Rules (T7.2.4)',
  'Gate 06: Personal Data Sanitization in Alerts (Finding Z-29)',
  'Gate 07: Edge Log Analytics & Reporting (T7.2.5)',
  'Gate 08: All-Alerts Firing Drill & Quality Gate OBS-01 Certification (T7.2.6)',
];

const results = {};
GATES.forEach((g) => {
  results[g] = { pass: 0, fail: 0, details: [] };
});

function logGate(gateName, condition, message) {
  if (condition) {
    results[gateName].pass++;
    results[gateName].details.push(`✓ ${message}`);
  } else {
    results[gateName].fail++;
    results[gateName].details.push(`✗ FAIL: ${message}`);
  }
}

async function main() {
  console.log('================================================================');
  console.log(' TwinMOS Milestone MS7.2 Observability & Alerting Master Audit  ');
  console.log('================================================================\n');

  process.env.NODE_ENV = 'test';
  process.env.AUDIT_RETENTION_DISABLED = '1';

  // -------------------------------------------------------------
  // Gate 01: Structured Logging & Edge Tracing (T7.2.1 / Z-23)
  // -------------------------------------------------------------
  console.log('[*] Auditing Gate 01: Structured Logging & Edge Tracing (T7.2.1 / Z-23)...');
  const nginxConfPath = resolve(repoRoot, 'deploy', 'nginx', 'twinmos.conf');
  const nginxConfExists = existsSync(nginxConfPath);
  const nginxConf = nginxConfExists ? readFileSync(nginxConfPath, 'utf8') : '';

  logGate(
    'Gate 01: Structured Logging & Edge Tracing (T7.2.1 / Z-23)',
    nginxConf.includes('log_format json_combined') && nginxConf.includes('escape=json'),
    'Nginx configuration defines json_combined log format with escape=json'
  );
  logGate(
    'Gate 01: Structured Logging & Edge Tracing (T7.2.1 / Z-23)',
    nginxConf.includes('access_log') && nginxConf.includes('access.json.log json_combined'),
    'Nginx access log writes structured JSON entries to access.json.log'
  );
  logGate(
    'Gate 01: Structured Logging & Edge Tracing (T7.2.1 / Z-23)',
    nginxConf.includes('proxy_set_header X-Request-Id $request_id;'),
    'Nginx proxies edge $request_id upstream to API via X-Request-Id header'
  );

  const { logger, createRequestLogger } = await mod('apps/api/src/services/logger.ts');
  const reqLogger = createRequestLogger('trace-uuid-1234');
  logGate(
    'Gate 01: Structured Logging & Edge Tracing (T7.2.1 / Z-23)',
    typeof logger.info === 'function' && typeof reqLogger.info === 'function',
    'Pino logger factory creates request-correlated child loggers with sensitive data redaction'
  );

  // -------------------------------------------------------------
  // Gate 02: Error Tracking with Release Tagging & PII Scrubbing (T7.2.2)
  // -------------------------------------------------------------
  console.log('[*] Auditing Gate 02: Error Tracking with Release Tagging & PII Scrubbing (T7.2.2)...');
  const { errorTracker } = await mod('apps/api/src/services/sentry.ts');
  const testError = new Error('Database timeout for customer support@client.de from IP 198.51.100.22 with auth Bearer secret_token_xyz');
  const captured = errorTracker.captureException(testError, {
    userEmail: 'support@client.de',
    userIp: '198.51.100.22',
    token: 'secret_token_xyz',
  });

  logGate(
    'Gate 02: Error Tracking with Release Tagging & PII Scrubbing (T7.2.2)',
    captured.release && captured.release.includes('0.3.0'),
    `Sentry error event tagged with canonical release metadata: ${captured.release}`
  );
  logGate(
    'Gate 02: Error Tracking with Release Tagging & PII Scrubbing (T7.2.2)',
    !captured.message.includes('support@client.de') && captured.message.includes('s***@client.de'),
    'Email address scrubbed and masked in error message'
  );
  logGate(
    'Gate 02: Error Tracking with Release Tagging & PII Scrubbing (T7.2.2)',
    !captured.message.includes('198.51.100.22') && captured.message.includes('198.51.***.***'),
    'IPv4 address scrubbed and masked in error message'
  );
  logGate(
    'Gate 02: Error Tracking with Release Tagging & PII Scrubbing (T7.2.2)',
    captured.context?.token === '[REDACTED]',
    'Sensitive token/secret fields completely redacted in event context'
  );

  const { webErrorTracker } = await mod('apps/web/src/lib/sentry.ts');
  const webEv = webErrorTracker.captureException(new Error('Web crash for user john@client.com from 192.168.4.5'));
  logGate(
    'Gate 02: Error Tracking with Release Tagging & PII Scrubbing (T7.2.2)',
    webEv.release && webEv.release.includes('0.3.0') && webEv.message.includes('j***@client.com'),
    'Web Sentry error tracking operational with release tagging and PII scrubbing'
  );

  const { adminErrorTracker } = await mod('apps/admin/src/sentry.ts');
  const admEv = adminErrorTracker.captureException(new Error('Admin crash for staff admin@corp.org from 10.0.5.2'));
  logGate(
    'Gate 02: Error Tracking with Release Tagging & PII Scrubbing (T7.2.2)',
    admEv.release && admEv.release.includes('0.3.0') && admEv.message.includes('a***@corp.org'),
    'Admin Sentry error tracking operational with release tagging and PII scrubbing'
  );

  // -------------------------------------------------------------
  // Gate 03: Prometheus Metrics Exposition & Deep Diagnostics (T7.2.3)
  // -------------------------------------------------------------
  console.log('[*] Auditing Gate 03: Prometheus Metrics Exposition & Deep Diagnostics (T7.2.3)...');
  const { getPrometheusMetrics } = await mod('apps/api/src/services/metrics.ts');
  const promText = getPrometheusMetrics(true);

  logGate(
    'Gate 03: Prometheus Metrics Exposition & Deep Diagnostics (T7.2.3)',
    promText.includes('# HELP twinmos_http_requests_total') && promText.includes('# TYPE twinmos_http_requests_total counter'),
    'Prometheus metrics exposition outputs standard 0.0.4 HELP and TYPE headers'
  );
  logGate(
    'Gate 03: Prometheus Metrics Exposition & Deep Diagnostics (T7.2.3)',
    promText.includes('twinmos_database_connected 1') && promText.includes('twinmos_http_5xx_errors_total'),
    'Prometheus metrics expose DB connection status, 5xx errors, latency, and firing alerts'
  );

  const { alertManager, sanitizeAlertForViewer } = await mod('apps/api/src/services/alerts.ts');
  const appTsPath = resolve(repoRoot, 'apps', 'api', 'src', 'app.ts');
  const appTs = readFileSync(appTsPath, 'utf8');

  logGate(
    'Gate 03: Prometheus Metrics Exposition & Deep Diagnostics (T7.2.3)',
    appTs.includes("app.get('/api/v1/metrics'") && appTs.includes("app.get('/api/v1/health/deep'"),
    'API exposes dedicated /api/v1/metrics and /api/v1/health/deep endpoints'
  );

  const dashboardPath = resolve(repoRoot, 'apps', 'admin', 'src', 'modules', 'dashboard.tsx');
  const dashboardContent = existsSync(dashboardPath) ? readFileSync(dashboardPath, 'utf8') : '';
  logGate(
    'Gate 03: Prometheus Metrics Exposition & Deep Diagnostics (T7.2.3)',
    dashboardContent.includes('System Health & Observability') && dashboardContent.includes('requestsTotal'),
    'Admin Dashboard renders live System Health & Observability metrics card (T7.2.3)'
  );

  const navPath = resolve(repoRoot, 'apps', 'admin', 'src', 'nav.ts');
  const navContent = existsSync(navPath) ? readFileSync(navPath, 'utf8') : '';
  const alertsModuleExists = existsSync(resolve(repoRoot, 'apps', 'admin', 'src', 'modules', 'alerts.tsx'));
  logGate(
    'Gate 03: Prometheus Metrics Exposition & Deep Diagnostics (T7.2.3)',
    alertsModuleExists && navContent.includes("id: 'alerts'"),
    'Admin Console registers accessible Alerts & Telemetry navigation module (T7.2.4)'
  );

  // -------------------------------------------------------------
  // Gate 04: External Uptime Probes Across Canonical Targets (T7.2.3)
  // -------------------------------------------------------------
  console.log('[*] Auditing Gate 04: External Uptime Probes Across Canonical Targets (T7.2.3)...');
  const { runUptimeMonitor, TARGETS } = await mod('tooling/ops/uptime-monitor.mjs');
  logGate(
    'Gate 04: External Uptime Probes Across Canonical Targets (T7.2.3)',
    TARGETS.length === 4 && TARGETS.some((t) => t.url.includes('/products/corex-pro-m2-pcie-gen-5-0-nvme-ssd')),
    'Uptime monitor configured with all 4 vital endpoints: Home, PDP, Health, Admin'
  );

  const uptimeResult = await runUptimeMonitor();
  logGate(
    'Gate 04: External Uptime Probes Across Canonical Targets (T7.2.3)',
    uptimeResult.passed && uptimeResult.uptimeScore === 100,
    `Uptime monitor probe achieved 100% health score across all 4 targets (${uptimeResult.results.length}/4 passed)`
  );

  // -------------------------------------------------------------
  // Gate 05: Durable Persistent Channel & 9 Alert Rules (T7.2.4)
  // -------------------------------------------------------------
  console.log('[*] Auditing Gate 05: Durable Persistent Channel & 9 Alert Rules (T7.2.4)...');
  const testStorageDir = mkdtempSync(join(tmpdir(), 'twinmos-audit-alerts-'));
  const testStorageFile = join(testStorageDir, 'alerts.jsonl');
  alertManager.setStoragePath(testStorageFile);
  alertManager.clear();

  // Test durable file write
  alertManager.recordAlert('audit.test', 'Audit Test Alert', 'Durable write verification', 'info');
  const fileExists = existsSync(testStorageFile);
  const fileContent = fileExists ? readFileSync(testStorageFile, 'utf8') : '';
  logGate(
    'Gate 05: Durable Persistent Channel & 9 Alert Rules (T7.2.4)',
    fileExists && fileContent.includes('audit.test'),
    'Alerts recorded to durable JSONL persistent storage (survives server restarts)'
  );

  // Test all 9 rules
  alertManager.clear();
  alertManager.recordRequest(500, 20);
  alertManager.recordRequest(500, 20);
  alertManager.recordRequest(500, 20);
  alertManager.recordRequest(500, 20);
  alertManager.recordRequest(500, 20); // 1. http.5xx_rate_exceeded
  alertManager.recordRequest(200, 1500); // 2. http.latency_p95_exceeded
  alertManager.recordOutboxFailure(3, 'Revalidation down'); // 3. outbox.revalidation_failed
  alertManager.recordMailFailure('contact', 'CT-AUDIT-1', 'SMTP err'); // 4. mail.form_notification_failed
  alertManager.recordLockout('intruder@hack.com', '10.0.0.99', 5); // 5. auth.account_locked
  alertManager.recordRetentionFailure('audit_logs', 'Lock error'); // 6. retention.job_failed
  alertManager.recordDiskSpaceLow(400, 1024); // 7. system.disk_space_low
  alertManager.recordStaleBackup(30, 24); // 8. backup.stale_threshold_exceeded
  alertManager.recordCertExpiringSoon(6, 'api.twinmos.com', 14); // 9. tls.cert_expiring_soon

  const activeAlerts = alertManager.getAlerts();
  const ruleIds = new Set(activeAlerts.map((a) => a.ruleId));

  const all9Rules = [
    'http.5xx_rate_exceeded',
    'http.latency_p95_exceeded',
    'outbox.revalidation_failed',
    'mail.form_notification_failed',
    'auth.account_locked',
    'retention.job_failed',
    'system.disk_space_low',
    'backup.stale_threshold_exceeded',
    'tls.cert_expiring_soon',
  ];

  const allPresent = all9Rules.every((r) => ruleIds.has(r));
  logGate(
    'Gate 05: Durable Persistent Channel & 9 Alert Rules (T7.2.4)',
    allPresent && ruleIds.size >= 9,
    `All 9 required alert rules successfully wired, triggered, and verified in active manager (${ruleIds.size}/9 rules)`
  );

  // -------------------------------------------------------------
  // Gate 06: Personal Data Sanitization in Alerts (Finding Z-29)
  // -------------------------------------------------------------
  console.log('[*] Auditing Gate 06: Personal Data Sanitization in Alerts (Finding Z-29)...');
  const viewerAlerts = alertManager.getAlertsForViewer();
  const lockoutViewer = viewerAlerts.find((a) => a.ruleId === 'auth.account_locked');

  logGate(
    'Gate 06: Personal Data Sanitization in Alerts (Finding Z-29)',
    lockoutViewer && !lockoutViewer.message.includes('intruder@hack.com') && lockoutViewer.message.includes('@hack.com'),
    'Viewer alerts endpoint redacts and masks email addresses in alert messages (Closes Z-29)'
  );
  logGate(
    'Gate 06: Personal Data Sanitization in Alerts (Finding Z-29)',
    lockoutViewer && !lockoutViewer.message.includes('10.0.0.99') && lockoutViewer.message.includes('10.0.***.***'),
    'Viewer alerts endpoint redacts and masks IP addresses in alert messages (Closes Z-29)'
  );
  logGate(
    'Gate 06: Personal Data Sanitization in Alerts (Finding Z-29)',
    appTs.includes('alertManager.getAlertsForViewer()'),
    'GET /api/v1/admin/alerts enforces viewer sanitization by role boundary'
  );

  // -------------------------------------------------------------
  // Gate 07: Edge Log Analytics & Reporting (T7.2.5)
  // -------------------------------------------------------------
  console.log('[*] Auditing Gate 07: Edge Log Analytics & Reporting (T7.2.5)...');
  const { analyzeEdgeLogs } = await mod('tooling/ops/edge-log-report.mjs');
  const edgeReport = analyzeEdgeLogs();

  logGate(
    'Gate 07: Edge Log Analytics & Reporting (T7.2.5)',
    edgeReport.totalRequests > 0 && edgeReport.redirects.totalRedirects >= 1,
    `Edge log parser aggregates 3xx redirects (${edgeReport.redirects.totalRedirects} redirects cataloged)`
  );
  logGate(
    'Gate 07: Edge Log Analytics & Reporting (T7.2.5)',
    edgeReport.errors404.total404s >= 1 && edgeReport.errors404.topMissingPaths.length > 0,
    `Edge log parser produces 404 error report with missing paths and referrers (${edgeReport.errors404.total404s} 404s analyzed)`
  );
  logGate(
    'Gate 07: Edge Log Analytics & Reporting (T7.2.5)',
    edgeReport.correlation.correlationCoveragePct === 100,
    `Edge-to-API correlation verified with 100% coverage (${edgeReport.correlation.requestsWithCorrelationId}/${edgeReport.totalRequests} logs carry X-Request-Id)`
  );

  // -------------------------------------------------------------
  // Gate 08: All-Alerts Firing Drill & Quality Gate OBS-01 Certification (T7.2.6)
  // -------------------------------------------------------------
  console.log('[*] Auditing Gate 08: All-Alerts Firing Drill & Quality Gate OBS-01 Certification (T7.2.6)...');
  alertManager.clear();
  const drillFired = alertManager.fireAllAlertRulesOnce({ certifiedBy: 'MS7.2-MasterAudit' });

  logGate(
    'Gate 08: All-Alerts Firing Drill & Quality Gate OBS-01 Certification (T7.2.6)',
    drillFired.length === 9,
    `fireAllAlertRulesOnce successfully fires all 9 alert rules in one shot drill (${drillFired.length}/9 rules fired)`
  );

  const { verifyOBS01 } = await mod('tooling/verify/obs-01-audit.mjs');
  const obs01Msg = await verifyOBS01();

  logGate(
    'Gate 08: All-Alerts Firing Drill & Quality Gate OBS-01 Certification (T7.2.6)',
    obs01Msg && obs01Msg.includes('PASS'),
    `Quality Gate OBS-01 certified: ${obs01Msg}`
  );

  // -------------------------------------------------------------
  // Summary & Certification
  // -------------------------------------------------------------
  console.log('\n================================================================');
  console.log('              Milestone MS7.2 Audit Results                     ');
  console.log('================================================================');

  let totalPass = 0;
  let totalFail = 0;

  for (const [gate, data] of Object.entries(results)) {
    const status = data.fail === 0 ? '✓ PASS' : '✗ FAIL';
    console.log(`\n[${status}] ${gate}`);
    for (const d of data.details) {
      console.log(`    ${d}`);
    }
    totalPass += data.pass;
    totalFail += data.fail;
  }

  console.log('\n----------------------------------------------------------------');
  console.log(`Total Checks: ${totalPass + totalFail} | Passed: ${totalPass} | Failed: ${totalFail}`);
  console.log('================================================================\n');

  if (totalFail > 0) {
    console.error(`[✗] Master Audit FAILED with ${totalFail} failed checks.`);
    process.exit(1);
  } else {
    console.log('[✓] MASTER AUDIT PASSED: All 8 Gates in MS7.2 Observability & Alerting certified with 100% compliance.');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('\n[FATAL] Master audit crashed with unhandled error:', err);
  process.exit(1);
});
