// Observability & Alerting Service (Task F2 / OBS-01 / V-09)
// Provides structured alerting rules, telemetry collection, and notification handlers.

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

  constructor() {
    // Default subscriber logs in structured JSON
    this.subscribers.push((a) => {
      if (process.env.NODE_ENV !== 'test') {
        console.error(JSON.stringify({ alert: a }));
      }
    });
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

  public recordMailFailure(type: string, refCode: string, err?: unknown) {
    this.metrics.failedMails++;
    return this.recordAlert(
      'mail.form_notification_failed',
      'Form Notification Email Failure (V-09)',
      `Notification email delivery failed for form type ${type} (${refCode})`,
      'high',
      { type, refCode, error: err ? String(err) : undefined }
    );
  }

  public recordLockout(email: string, ip: string, consecutiveAttempts: number) {
    this.metrics.lockoutEvents++;
    return this.recordAlert(
      'auth.account_locked',
      'Account Lockout Limit Triggered',
      `Account ${email} locked from ${ip} after ${consecutiveAttempts} consecutive failed attempts`,
      'high',
      { email, ip, consecutiveAttempts }
    );
  }

  public recordOutboxStall(pendingCount: number) {
    return this.recordAlert(
      'outbox.revalidation_failed',
      'Outbox Revalidation Stalled',
      `${pendingCount} events pending in revalidation outbox queue`,
      'medium',
      { pendingCount }
    );
  }

  public recordStaleBackup(ageHours: number) {
    return this.recordAlert(
      'backup.stale_threshold_exceeded',
      'Database Backup Age Exceeded',
      `Latest backup is ${ageHours.toFixed(1)} hours old (threshold: 24h)`,
      'critical',
      { ageHours }
    );
  }

  public getAlerts(): AlertEvent[] {
    return [...this.alerts];
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
