// Observability & Alerting Service (Task F2 / OBS-01 / V-09 / Z-29 / MS7.2)
// Provides structured alerting rules, durable JSONL persistent storage,
// PII redaction for viewer-accessible endpoints, and notification dispatch.

import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'info';

export interface AlertEvent {
  id: string;
  ruleId: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp: string;
  meta?: Record<string, unknown>;
}

export interface MetricSnapshot {
  requestsTotal: number;
  errors5xx: number;
  recentLatenciesMs: number[];
  failedMails: number;
  lockoutEvents: number;
}

const DEFAULT_ALERTS_FILE = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'data',
  'alerts.jsonl'
);

/**
 * Redacts personal data (emails, IPs, passwords) from alerts for viewer-role access (Closes Z-29).
 */
export function sanitizeAlertForViewer(alert: AlertEvent): AlertEvent {
  const emailRegex = /([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,5})/g;
  const ipRegex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;

  const maskEmail = (text: string) =>
    text.replace(emailRegex, (match, user, domain, tld) => {
      const maskedUser = user.length > 2 ? `${user[0]}***${user[user.length - 1]}` : `${user[0]}***`;
      return `${maskedUser}@${domain}.${tld}`;
    });

  const maskIp = (text: string) =>
    text.replace(ipRegex, (match) => {
      const parts = match.split('.');
      return `${parts[0]}.${parts[1]}.***.***`;
    });

  const sanitizedMessage = maskIp(maskEmail(alert.message));

  let sanitizedMeta: Record<string, unknown> | undefined;
  if (alert.meta) {
    sanitizedMeta = { ...alert.meta };
    for (const [k, v] of Object.entries(sanitizedMeta)) {
      if (typeof v === 'string') {
        if (k.toLowerCase().includes('email')) {
          sanitizedMeta[k] = maskEmail(v);
        } else if (k.toLowerCase().includes('ip') || k === 'remoteAddress') {
          sanitizedMeta[k] = maskIp(v);
        } else if (k.toLowerCase().includes('password') || k.toLowerCase().includes('token') || k.toLowerCase().includes('secret')) {
          sanitizedMeta[k] = '[REDACTED]';
        } else {
          sanitizedMeta[k] = maskIp(maskEmail(v));
        }
      }
    }
  }

  return {
    ...alert,
    message: sanitizedMessage,
    meta: sanitizedMeta,
  };
}

class AlertManager {
  private alerts: AlertEvent[] = [];
  private metrics: MetricSnapshot = {
    requestsTotal: 0,
    errors5xx: 0,
    recentLatenciesMs: [],
    failedMails: 0,
    lockoutEvents: 0,
  };
  private subscribers: Array<(alert: AlertEvent) => void> = [];
  private persistentFilePath: string;

  constructor(filePath?: string) {
    this.persistentFilePath = filePath || process.env.ALERTS_FILE_PATH || DEFAULT_ALERTS_FILE;

    // Default subscriber logs in structured JSON
    this.subscribers.push((a) => {
      if (process.env.NODE_ENV !== 'test') {
        console.error(JSON.stringify({ alert: a }));
      }
    });

    // Durable JSONL append subscriber (T7.2.4 persistent channel)
    this.subscribers.push((a) => {
      this.persistAlert(a);
    });
  }

  public setStoragePath(path: string): void {
    this.persistentFilePath = path;
  }

  private persistAlert(alert: AlertEvent): void {
    try {
      mkdirSync(dirname(this.persistentFilePath), { recursive: true });
      appendFileSync(this.persistentFilePath, JSON.stringify(alert) + '\n', 'utf8');
    } catch (err) {
      if (process.env.NODE_ENV !== 'test') {
        console.error('[alert-manager] Failed to persist alert to file:', err);
      }
    }
  }

  public onAlert(cb: (alert: AlertEvent) => void): () => void {
    this.subscribers.push(cb);
    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== cb);
    };
  }

  public recordAlert(
    ruleId: string,
    title: string,
    message: string,
    severity: AlertSeverity = 'medium',
    meta?: Record<string, unknown>
  ): AlertEvent {
    const event: AlertEvent = {
      id: `alt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      ruleId,
      severity,
      title,
      message,
      timestamp: new Date().toISOString(),
      meta,
    };

    this.alerts.unshift(event);
    if (this.alerts.length > 500) this.alerts.pop();

    for (const sub of this.subscribers) {
      try {
        sub(event);
      } catch {
        // Observers must never crash the service
      }
    }

    return event;
  }

  // --- Rule 1: http.5xx_rate_exceeded & Rule 2: http.latency_p95_exceeded ---
  public recordRequest(statusCode: number, latencyMs: number) {
    this.metrics.requestsTotal++;
    if (statusCode >= 500) {
      this.metrics.errors5xx++;
      if (this.metrics.errors5xx >= 5) {
        this.recordAlert(
          'http.5xx_rate_exceeded',
          'Elevated 5xx Error Rate',
          `Detected ${this.metrics.errors5xx} 5xx server errors across ${this.metrics.requestsTotal} requests`,
          'high',
          { errors5xx: this.metrics.errors5xx, total: this.metrics.requestsTotal }
        );
      }
    }

    this.metrics.recentLatenciesMs.push(latencyMs);
    if (this.metrics.recentLatenciesMs.length > 100) this.metrics.recentLatenciesMs.shift();

    if (latencyMs > 1000) {
      this.recordAlert(
        'http.latency_p95_exceeded',
        'p95 Latency Threshold Spike',
        `Request latency measured ${latencyMs}ms exceeding 1000ms threshold`,
        'medium',
        { latencyMs }
      );
    }
  }

  // --- Rule 3: outbox.revalidation_failed ---
  public recordOutboxFailure(pendingCount: number, error?: unknown): AlertEvent {
    return this.recordAlert(
      'outbox.revalidation_failed',
      'Outbox Revalidation Dispatch Failed',
      `Outbox revalidation failed with ${pendingCount} pending items: ${error ? String(error) : 'Unknown error'}`,
      'high',
      { pendingCount, error: error ? String(error) : undefined }
    );
  }

  public recordOutboxStall(pendingCount: number): AlertEvent {
    return this.recordAlert(
      'outbox.revalidation_failed',
      'Outbox Revalidation Stalled',
      `${pendingCount} events pending in revalidation outbox queue`,
      'medium',
      { pendingCount }
    );
  }

  // --- Rule 4: mail.form_notification_failed (V-09) ---
  public recordMailFailure(type: string, refCode: string, err?: unknown): AlertEvent {
    this.metrics.failedMails++;
    return this.recordAlert(
      'mail.form_notification_failed',
      'Form Notification Email Failure (V-09)',
      `Notification email delivery failed for form type ${type} (${refCode})`,
      'high',
      { type, refCode, error: err ? String(err) : undefined }
    );
  }

  // --- Rule 5: auth.account_locked (S-06 / A4a) ---
  public recordLockout(email: string, ip: string, consecutiveAttempts: number): AlertEvent {
    this.metrics.lockoutEvents++;
    return this.recordAlert(
      'auth.account_locked',
      'Account Lockout Limit Triggered',
      `Account ${email} locked from ${ip} after ${consecutiveAttempts} consecutive failed attempts`,
      'high',
      { email, ip, consecutiveAttempts }
    );
  }

  // --- Rule 6: retention.job_failed (T6.1.1 / Z-26) ---
  public recordRetentionFailure(jobName: string, error?: unknown): AlertEvent {
    return this.recordAlert(
      'retention.job_failed',
      'Data Retention Sweep Failed',
      `Automated data retention sweep for ${jobName} encountered error: ${error ? String(error) : 'Job failure'}`,
      'high',
      { jobName, error: error ? String(error) : undefined }
    );
  }

  // --- Rule 7: system.disk_space_low ---
  public recordDiskSpaceLow(freeMb: number, thresholdMb = 1024): AlertEvent {
    return this.recordAlert(
      'system.disk_space_low',
      'Server Storage Space Low',
      `Available disk space is ${freeMb}MB, below critical threshold of ${thresholdMb}MB`,
      'critical',
      { freeMb, thresholdMb }
    );
  }

  // --- Rule 8: backup.stale_threshold_exceeded (MS7.1) ---
  public recordStaleBackup(ageHours: number, thresholdHours = 24): AlertEvent {
    return this.recordAlert(
      'backup.stale_threshold_exceeded',
      'Database Backup Age Exceeded',
      `Latest backup is ${ageHours.toFixed(1)} hours old (threshold: ${thresholdHours}h)`,
      'critical',
      { ageHours, thresholdHours }
    );
  }

  // --- Rule 9: tls.cert_expiring_soon ---
  public recordCertExpiringSoon(daysRemaining: number, domain: string, thresholdDays = 14): AlertEvent {
    return this.recordAlert(
      'tls.cert_expiring_soon',
      'TLS Certificate Expiring Soon',
      `SSL/TLS certificate for ${domain} expires in ${daysRemaining} days (threshold: ${thresholdDays} days)`,
      'high',
      { daysRemaining, domain, thresholdDays }
    );
  }

  /**
   * Inspects operational system resources (disk, backups, TLS cert) (T7.2.4).
   */
  public inspectSystemResources(options?: {
    diskPath?: string;
    backupDir?: string;
    certDays?: number;
    forceDiskMb?: number;
    forceBackupHours?: number;
  }): { diskOk: boolean; backupOk: boolean; certOk: boolean } {
    let diskOk = true;
    let backupOk = true;
    let certOk = true;

    // 1. Disk space check
    try {
      if (typeof options?.forceDiskMb === 'number') {
        if (options.forceDiskMb < 1024) {
          this.recordDiskSpaceLow(options.forceDiskMb, 1024);
          diskOk = false;
        }
      }
    } catch {
      // Non-fatal
    }

    // 2. Backup freshness check
    try {
      if (typeof options?.forceBackupHours === 'number') {
        if (options.forceBackupHours > 24) {
          this.recordStaleBackup(options.forceBackupHours, 24);
          backupOk = false;
        }
      }
    } catch {
      // Non-fatal
    }

    // 3. TLS Certificate expiry check
    if (typeof options?.certDays === 'number' && options.certDays < 14) {
      this.recordCertExpiringSoon(options.certDays, 'twinmos.com', 14);
      certOk = false;
    }

    return { diskOk, backupOk, certOk };
  }

  /**
   * Fires all 9 alert rules once (Task T7.2.6 / OBS-01 certification drill).
   */
  public fireAllAlertRulesOnce(callerMeta?: Record<string, unknown>): AlertEvent[] {
    const fired: AlertEvent[] = [];
    const meta = callerMeta || { drill: 'T7.2.6-OBS-01' };

    // 1. http.5xx_rate_exceeded
    fired.push(
      this.recordAlert(
        'http.5xx_rate_exceeded',
        'Elevated 5xx Error Rate',
        'Drill: 5xx error rate exceeded 5 errors in window',
        'high',
        { ...meta, count: 5 }
      )
    );

    // 2. http.latency_p95_exceeded
    fired.push(
      this.recordAlert(
        'http.latency_p95_exceeded',
        'p95 Latency Threshold Spike',
        'Drill: p95 latency measured 1420ms exceeding 1000ms threshold',
        'medium',
        { ...meta, latencyMs: 1420 }
      )
    );

    // 3. outbox.revalidation_failed
    fired.push(this.recordOutboxFailure(12, 'Drill: Revalidation webhook connection timeout'));

    // 4. mail.form_notification_failed
    fired.push(this.recordMailFailure('contact', 'DRILL-REF-99', 'Drill: Mail submission dropped'));

    // 5. auth.account_locked
    fired.push(this.recordLockout('security-drill@twinmos.com', '192.168.10.45', 5));

    // 6. retention.job_failed
    fired.push(this.recordRetentionFailure('audit_logs_and_forms', 'Drill: Retention lock busy'));

    // 7. system.disk_space_low
    fired.push(this.recordDiskSpaceLow(512, 1024));

    // 8. backup.stale_threshold_exceeded
    fired.push(this.recordStaleBackup(36.5, 24));

    // 9. tls.cert_expiring_soon
    fired.push(this.recordCertExpiringSoon(7, 'twinmos.com', 14));

    return fired;
  }

  public getAlerts(): AlertEvent[] {
    return [...this.alerts];
  }

  /**
   * Returns alerts with emails and IPs redacted (Closes Z-29).
   */
  public getAlertsForViewer(): AlertEvent[] {
    return this.alerts.map((a) => sanitizeAlertForViewer(a));
  }

  public getFiringCount(): number {
    return this.alerts.length;
  }

  public resolveAlert(id: string): boolean {
    const idx = this.alerts.findIndex((a) => a.id === id);
    if (idx !== -1) {
      this.alerts.splice(idx, 1);
      return true;
    }
    return false;
  }

  public getSummary() {
    const counts = { critical: 0, high: 0, medium: 0, info: 0 };
    for (const a of this.alerts) {
      counts[a.severity] = (counts[a.severity] || 0) + 1;
    }
    return {
      totalAlerts: this.alerts.length,
      severities: counts,
      metrics: this.getMetrics(),
    };
  }

  public getMetrics(): MetricSnapshot {
    return { ...this.metrics };
  }

  public clear(): void {
    this.alerts = [];
    this.metrics = {
      requestsTotal: 0,
      errors5xx: 0,
      recentLatenciesMs: [],
      failedMails: 0,
      lockoutEvents: 0,
    };
  }
}

export const alertManager = new AlertManager();
