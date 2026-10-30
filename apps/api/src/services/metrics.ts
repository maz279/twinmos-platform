// Prometheus & Operational Metrics Collection Service (T7.2.3 / MS7.2)
import { alertManager } from './alerts.ts';

export function getPrometheusMetrics(dbConnected: boolean = true): string {
  const m = alertManager.getMetrics();
  const firingCount = alertManager.getFiringCount();
  const latencies = m.recentLatenciesMs;
  let p95 = 0;
  if (latencies.length > 0) {
    const sorted = [...latencies].sort((a, b) => a - b);
    p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;
  }

  const lines = [
    '# HELP twinmos_http_requests_total Total HTTP requests handled by the API.',
    '# TYPE twinmos_http_requests_total counter',
    `twinmos_http_requests_total ${m.requestsTotal}`,
    '',
    '# HELP twinmos_http_5xx_errors_total Total 5xx server errors recorded.',
    '# TYPE twinmos_http_5xx_errors_total counter',
    `twinmos_http_5xx_errors_total ${m.errors5xx}`,
    '',
    '# HELP twinmos_http_latency_p95_ms Recent rolling p95 latency in milliseconds.',
    '# TYPE twinmos_http_latency_p95_ms gauge',
    `twinmos_http_latency_p95_ms ${p95}`,
    '',
    '# HELP twinmos_alerts_firing_total Number of currently firing alert rules.',
    '# TYPE twinmos_alerts_firing_total gauge',
    `twinmos_alerts_firing_total ${firingCount}`,
    '',
    '# HELP twinmos_mail_failures_total Total failed mail notification delivery attempts.',
    '# TYPE twinmos_mail_failures_total counter',
    `twinmos_mail_failures_total ${m.failedMails}`,
    '',
    '# HELP twinmos_auth_lockouts_total Total account lockout security events triggered.',
    '# TYPE twinmos_auth_lockouts_total counter',
    `twinmos_auth_lockouts_total ${m.lockoutEvents}`,
    '',
    '# HELP twinmos_database_connected 1 if connected, 0 otherwise.',
    '# TYPE twinmos_database_connected gauge',
    `twinmos_database_connected ${dbConnected ? 1 : 0}`,
    '',
  ];

  return lines.join('\n');
}
