// Sentry Web Error Tracking & PII Redaction Client (T7.2.2 / MS7.2)
// Scrubs personal data (emails, IPs, passwords, tokens) and attaches release metadata.

export interface WebErrorEvent {
  eventId: string;
  timestamp: string;
  release: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  name?: string;
  stack?: string;
  context?: Record<string, unknown>;
}

export class WebErrorTracker {
  private release: string;
  private capturedEvents: WebErrorEvent[] = [];
  private listeners: Array<(event: WebErrorEvent) => void> = [];

  constructor() {
    this.release = (typeof process !== 'undefined' && process.env?.APP_VERSION) || 'twinmos-corporate@0.3.0';
  }

  public getRelease(): string {
    return this.release;
  }

  public onEvent(cb: (event: WebErrorEvent) => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  public scrubPii(data: Record<string, unknown>): Record<string, unknown> {
    const scrubbed: Record<string, unknown> = {};
    const emailRegex = /([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,5})/g;
    const ipRegex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;

    const maskEmail = (text: string) =>
      text.replace(emailRegex, (match, user, domain, tld) => {
        const masked = user.length > 2 ? `${user[0]}***` : `${user[0]}***`;
        return `${masked}@${domain}.${tld}`;
      });

    const maskIp = (text: string) =>
      text.replace(ipRegex, (match) => {
        const parts = match.split('.');
        return `${parts[0]}.${parts[1]}.***.***`;
      });

    for (const [k, v] of Object.entries(data)) {
      if (typeof v === 'string') {
        let val = v;
        if (k.toLowerCase().includes('password') || k.toLowerCase().includes('token') || k.toLowerCase().includes('secret')) {
          val = '[REDACTED]';
        } else {
          val = maskIp(maskEmail(val));
        }
        scrubbed[k] = val;
      } else if (v && typeof v === 'object' && !Array.isArray(v)) {
        scrubbed[k] = this.scrubPii(v as Record<string, unknown>);
      } else {
        scrubbed[k] = v;
      }
    }
    return scrubbed;
  }

  public captureException(error: unknown, ctx?: Record<string, unknown>): WebErrorEvent {
    const errObj = error instanceof Error ? error : new Error(String(error));
    const rawContext = ctx || {};
    const contextScrubbed = this.scrubPii(rawContext);

    const emailRegex = /([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,5})/g;
    const ipRegex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;

    const maskedMessage = errObj.message
      .replace(emailRegex, (match, user, domain, tld) => `${user[0]}***@${domain}.${tld}`)
      .replace(ipRegex, (match) => {
        const parts = match.split('.');
        return `${parts[0]}.${parts[1]}.***.***`;
      });

    const event: WebErrorEvent = {
      eventId: `web_err_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      release: this.release,
      level: 'error',
      name: errObj.name,
      message: maskedMessage,
      stack: errObj.stack,
      context: contextScrubbed,
    };

    this.capturedEvents.unshift(event);
    if (this.capturedEvents.length > 100) this.capturedEvents.pop();

    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch {
        // Observers must not throw
      }
    }

    return event;
  }

  public getCapturedEvents(): WebErrorEvent[] {
    return [...this.capturedEvents];
  }
}

export const webErrorTracker = new WebErrorTracker();
