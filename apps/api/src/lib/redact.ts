/**
 * Privacy Log Redaction Utility (T6.1.4 / PRIV-01)
 * Strips personal data (emails, passwords, tokens, API keys, credentials)
 * from server logs and diagnostics.
 */

const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
const BEARER_PATTERN = /Bearer\s+[a-zA-Z0-9_\-\.]+/gi;
const QUERY_SENSITIVE_PATTERN = /([?&](?:token|email|password|secret|key|turnstileToken)=)[^&\s]+/gi;
const KEY_VALUE_SENSITIVE_PATTERN = /\b(password|secret|turnstileToken|accessToken|refreshToken)\s*=\s*([^\s,;&]+)/gi;
const JSON_SENSITIVE_PATTERN = /"(email|password|token|secret|phone|turnstileToken|accessToken|refreshToken)"\s*:\s*"[^"]*"/gi;

export function redactPersonalData(input: string): string {
  if (typeof input !== 'string') return input;
  return input
    .replace(EMAIL_PATTERN, '[REDACTED_EMAIL]')
    .replace(BEARER_PATTERN, 'Bearer [REDACTED_TOKEN]')
    .replace(QUERY_SENSITIVE_PATTERN, '$1[REDACTED]')
    .replace(KEY_VALUE_SENSITIVE_PATTERN, '$1=[REDACTED]')
    .replace(JSON_SENSITIVE_PATTERN, '"$1":"[REDACTED]"');
}
