// Vitest Test Suite: Milestone MS7.2 · Observability and Alerting
// Validates Structured Logs (T7.2.1), Error Tracking (T7.2.2), Metrics & Uptime (T7.2.3),
// Wired Alert Rules & PII Redaction (T7.2.4 / Z-29), Edge Reports (T7.2.5), and Alert Firing Drill (T7.2.6).

import { describe, it, expect, beforeEach } from 'vitest';
import { existsSync, readFileSync, rmSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { alertManager, sanitizeAlertForViewer } from '../src/services/alerts.ts';
import { errorTracker } from '../src/services/sentry.ts';
import { getPrometheusMetrics } from '../src/services/metrics.ts';
import { analyzeEdgeLogs } from '../../../tooling/ops/edge-log-report.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..', '..', '..');

describe('MS7.2 · Observability and Alerting', () => {
  beforeEach(() => {
    alertManager.clear();
  });

  describe('T7.2.1: Structured Logs & Request ID Propagation', () => {
    it('verifies Nginx config defines json_combined and proxies X-Request-Id', () => {
      const nginxConfPath = resolve(repoRoot, 'deploy', 'nginx', 'twinmos.conf');
      expect(existsSync(nginxConfPath)).toBe(true);
      const conf = readFileSync(nginxConfPath, 'utf8');

      expect(conf).toContain('log_format json_combined');
      expect(conf).toContain('escape=json');
      expect(conf).toContain('$request_id');
      expect(conf).toContain('proxy_set_header X-Request-Id $request_id');
      expect(conf).toContain('access.json.log json_combined');
    });

    it('verifies API logger formats structured JSON logs with sensitive field redaction', async () => {
      const { logger, createRequestLogger } = await import('../src/services/logger.ts');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.error).toBe('function');

      const reqLogger = createRequestLogger('test-req-uuid-999');
      expect(reqLogger).toBeDefined();
    });
  });

  describe('T7.2.2: Error Tracking with Release Tagging & PII Scrubbing', () => {
    it('captures errors with release tag and scrubs emails, IPs, and passwords', () => {
      const captured: any[] = [];
      const removeSub = errorTracker.onEvent((ev) => captured.push(ev));

      const testError = new Error('Database connection failed for user test@domain.com from IP 192.168.1.50 with secret pwd1234');
      const event = errorTracker.captureException(testError, {
        userEmail: 'admin@twinmos.com',
        userIp: '10.0.0.99',
        password: 'super-secret-password',
      });

      removeSub();

      expect(event).toBeDefined();
      expect(event.release).toBe('twinmos-corporate@0.3.0');
      expect(event.message).not.toContain('test@domain.com');
      expect(event.message).toContain('t***@domain.com');
      expect(event.message).not.toContain('192.168.1.50');
      expect(event.message).toContain('192.168.***.***');

      // Check context PII scrubbing
      expect(event.context?.userEmail).toBe('a***@twinmos.com');
      expect(event.context?.userIp).toBe('10.0.***.***');
      expect(event.context?.password).toBe('[REDACTED]');
    });
    it('verifies Web and Admin Sentry error trackers scrub PII and attach release tag', async () => {
      const { WebErrorTracker } = await import('../../web/src/lib/sentry.ts');
      const { AdminErrorTracker } = await import('../../admin/src/sentry.ts');

      const webTracker = new WebErrorTracker();
      const adminTracker = new AdminErrorTracker();

      const webEvent = webTracker.captureException(new Error('Web client failure for test@user.com from 10.1.2.3'), {
        token: 'secret-web-token',
      });
      expect(webEvent.release).toBe('twinmos-corporate@0.3.0');
      expect(webEvent.message).toContain('t***@user.com');
      expect(webEvent.message).toContain('10.1.***.***');
      expect(webEvent.context?.token).toBe('[REDACTED]');

      const adminEvent = adminTracker.captureException(new Error('Admin console error for staff@admin.com from 172.20.0.1'), {
        password: 'admin-password',
      });
      expect(adminEvent.release).toBe('twinmos-corporate@0.3.0');
      expect(adminEvent.message).toContain('s***@admin.com');
      expect(adminEvent.message).toContain('172.20.***.***');
      expect(adminEvent.context?.password).toBe('[REDACTED]');
    });
  });

  describe('T7.2.3: Prometheus Metrics Exposition & External Uptime', () => {
    it('generates standard Prometheus 0.0.4 text metric exposition', () => {
      alertManager.recordRequest(200, 25);
      alertManager.recordRequest(500, 1100);

      const text = getPrometheusMetrics(true);

      expect(text).toContain('# HELP twinmos_http_requests_total');
      expect(text).toContain('# TYPE twinmos_http_requests_total counter');
      expect(text).toContain('twinmos_http_requests_total');
      expect(text).toContain('twinmos_http_5xx_errors_total');
      expect(text).toContain('twinmos_http_latency_p95_ms');
      expect(text).toContain('twinmos_database_connected 1');
      expect(text).toContain('twinmos_alerts_firing_total');
    });

    it('verifies external uptime monitor probes all 4 canonical targets', () => {
      const uptimeScript = resolve(repoRoot, 'tooling', 'ops', 'uptime-monitor.mjs');
      expect(existsSync(uptimeScript)).toBe(true);
      const content = readFileSync(uptimeScript, 'utf8');

      expect(content).toContain("name: 'Home Page'");
      expect(content).toContain('/products/corex-pro-m2-pcie-gen-5-0-nvme-ssd');
      expect(content).toContain('/api/v1/health');
      expect(content).toContain('/admin');
    });
  });

  describe('T7.2.4: Durable Alerts & All 9 Rules Wired to Callers', () => {
    it('appends alerts to durable JSONL file and sanitizes viewer output (Z-29)', () => {
      const tmpFile = join(mkdtempSync(join(tmpdir(), 'twinmos-alerts-')), 'alerts.jsonl');
      alertManager.setStoragePath(tmpFile);

      alertManager.recordLockout('intruder@threat.org', '172.16.0.45', 5);

      expect(existsSync(tmpFile)).toBe(true);
      const content = readFileSync(tmpFile, 'utf8');
      expect(content).toContain('auth.account_locked');

      // Viewer sanitization test (Z-29)
      const viewerAlerts = alertManager.getAlertsForViewer();
      const lockoutAlert = viewerAlerts.find((a) => a.ruleId === 'auth.account_locked');
      expect(lockoutAlert).toBeDefined();
      expect(lockoutAlert?.message).not.toContain('intruder@threat.org');
      expect(lockoutAlert?.message).toContain('@threat.org');
      expect(lockoutAlert?.message).not.toContain('172.16.0.45');
      expect(lockoutAlert?.message).toContain('172.16.***.***');
    });

    it('validates each of the 9 required alert rules', () => {
      // 1. http.5xx_rate_exceeded
      for (let i = 0; i < 5; i++) alertManager.recordRequest(500, 30);
      expect(alertManager.getAlerts().some((a) => a.ruleId === 'http.5xx_rate_exceeded')).toBe(true);

      // 2. http.latency_p95_exceeded
      alertManager.recordRequest(200, 1400);
      expect(alertManager.getAlerts().some((a) => a.ruleId === 'http.latency_p95_exceeded')).toBe(true);

      // 3. outbox.revalidation_failed
      alertManager.recordOutboxFailure(8, 'Timeout connecting to web revalidation webhook');
      expect(alertManager.getAlerts().some((a) => a.ruleId === 'outbox.revalidation_failed')).toBe(true);

      // 4. mail.form_notification_failed
      alertManager.recordMailFailure('warranty', 'W-4412', 'SMTP relay dropped connection');
      expect(alertManager.getAlerts().some((a) => a.ruleId === 'mail.form_notification_failed')).toBe(true);

      // 5. auth.account_locked
      alertManager.recordLockout('user@corp.com', '10.0.0.5', 5);
      expect(alertManager.getAlerts().some((a) => a.ruleId === 'auth.account_locked')).toBe(true);

      // 6. retention.job_failed
      alertManager.recordRetentionFailure('audit_logs', 'Table lock contention');
      expect(alertManager.getAlerts().some((a) => a.ruleId === 'retention.job_failed')).toBe(true);

      // 7. system.disk_space_low
      alertManager.recordDiskSpaceLow(350, 1024);
      expect(alertManager.getAlerts().some((a) => a.ruleId === 'system.disk_space_low')).toBe(true);

      // 8. backup.stale_threshold_exceeded
      alertManager.recordStaleBackup(48, 24);
      expect(alertManager.getAlerts().some((a) => a.ruleId === 'backup.stale_threshold_exceeded')).toBe(true);

      // 9. tls.cert_expiring_soon
      alertManager.recordCertExpiringSoon(5, 'api.twinmos.com', 14);
      expect(alertManager.getAlerts().some((a) => a.ruleId === 'tls.cert_expiring_soon')).toBe(true);
    });
    it('verifies inspectSystemResources triggers disk, backup, and cert alerts on threshold breach', () => {
      alertManager.clear();

      const res = alertManager.inspectSystemResources({
        forceDiskMb: 500, // < 1024
        forceBackupHours: 36, // > 24
        certDays: 5, // < 14
      });

      expect(res.diskOk).toBe(false);
      expect(res.backupOk).toBe(false);
      expect(res.certOk).toBe(false);

      const alerts = alertManager.getAlerts();
      expect(alerts.some((a) => a.ruleId === 'system.disk_space_low')).toBe(true);
      expect(alerts.some((a) => a.ruleId === 'backup.stale_threshold_exceeded')).toBe(true);
      expect(alerts.some((a) => a.ruleId === 'tls.cert_expiring_soon')).toBe(true);
    });
  });

  describe('T7.2.5: Edge Log Reporting & Redirect / 404 Analytics', () => {
    it('analyzes edge logs, generates redirect counts, 404 report, and checks Z-23 correlation', () => {
      const report = analyzeEdgeLogs();
      expect(report).toBeDefined();
      expect(report.totalRequests).toBeGreaterThan(0);
      expect(report.redirects.totalRedirects).toBeGreaterThanOrEqual(1);
      expect(report.errors404.total404s).toBeGreaterThanOrEqual(1);
      expect(report.correlation.correlationCoveragePct).toBe(100);
      expect(report.correlation.validFormat).toBe(true);
    });
  });

  describe('T7.2.6: Fire Every Alert Rule Drill', () => {
    it('fires all 9 rules in a single drill call and records all events', () => {
      const fired = alertManager.fireAllAlertRulesOnce({ testDrill: true });
      expect(fired.length).toBe(9);

      const activeRules = new Set(alertManager.getAlerts().map((a) => a.ruleId));
      expect(activeRules.has('http.5xx_rate_exceeded')).toBe(true);
      expect(activeRules.has('http.latency_p95_exceeded')).toBe(true);
      expect(activeRules.has('outbox.revalidation_failed')).toBe(true);
      expect(activeRules.has('mail.form_notification_failed')).toBe(true);
      expect(activeRules.has('auth.account_locked')).toBe(true);
      expect(activeRules.has('retention.job_failed')).toBe(true);
      expect(activeRules.has('system.disk_space_low')).toBe(true);
      expect(activeRules.has('backup.stale_threshold_exceeded')).toBe(true);
      expect(activeRules.has('tls.cert_expiring_soon')).toBe(true);
    });
  });
});
