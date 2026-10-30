import pino from 'pino';

// Sensitive keys to redact automatically from log output
const REDACT_KEYS = [
  'password',
  'token',
  'authorization',
  'cookie',
  'secret',
  'better-auth.session_token',
  '*.password',
  '*.token',
  '*.secret',
];

export const logger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'test' ? 'silent' : 'info'),
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  redact: {
    paths: REDACT_KEYS,
    censor: '[REDACTED]',
  },
  base: {
    service: 'twinmos-api',
    env: process.env.NODE_ENV || 'development',
    version: process.env.APP_VERSION || '0.3.0',
  },
});

export function createRequestLogger(requestId: string) {
  return logger.child({ reqId: requestId });
}
