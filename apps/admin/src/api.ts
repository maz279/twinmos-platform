// Shared API client for the admin SPA — cookie-authenticated JSON fetches with
// RFC 9457 problem-details error surfaces.
export const API = import.meta.env.VITE_API_URL ?? '/api/v1'; // dev: vite proxies /api → 127.0.0.1:8787

export class ApiError extends Error {
  status: number;
  detail?: string;
  constructor(status: number, title: string, detail?: string) {
    super(title);
    this.status = status;
    this.detail = detail;
  }
}

async function handle<T>(res: Response): Promise<T> {
  if (res.ok) return res.status === 204 ? (undefined as T) : (res.json() as Promise<T>);
  let title = `HTTP ${res.status}`;
  let detail: string | undefined;
  try {
    const body = await res.json();
    title = body.title ?? title;
    detail = body.detail;
    // RFC 9457 problem bodies carry field-level zod issues in `errors` —
    // surface the first one so a 422 names the failing field instead of a
    // bare "Validation Failed" (deep-iteration UX fix).
    if (!detail && Array.isArray(body.errors) && body.errors.length > 0) {
      const issue = body.errors[0] as { path?: unknown[]; message?: string };
      const path = Array.isArray(issue.path) ? issue.path.join('.') : '';
      detail = `${path ? path + ': ' : ''}${issue.message ?? 'invalid value'}`;
    }
  } catch { /* non-JSON error body */ }
  throw new ApiError(res.status, title, detail);
}

export async function apiGet<T>(path: string): Promise<T> {
  return handle<T>(await fetch(API + path, { credentials: 'include' }));
}
export async function apiSend<T>(method: 'POST' | 'PUT' | 'PATCH' | 'DELETE', path: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
  return handle<T>(await fetch(API + path, {
    method,
    credentials: 'include',
    headers: { 'content-type': 'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  }));
}

export const fmtDate = (v: string | null | undefined): string =>
  v ? new Date(v).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—';
