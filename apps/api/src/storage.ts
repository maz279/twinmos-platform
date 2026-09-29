// Phase 4.1 — pluggable object-storage abstraction (TWN-ADMIN-CMS-AUDIT-PLAN
// §4.1). All media bytes move through one StorageDriver selected by env:
//   MEDIA_STORAGE = 'local' (default; dev + test) | 's3'
// The S3 driver speaks the S3 REST API with SigV4 (works against AWS S3,
// Cloudflare R2 and Backblaze B2 endpoints) and issues presigned GET URLs.
// Credentials are read ONLY from the environment — never from source.
//
// Security notes:
//  • put()/delete() keys are normalised (no leading '/', no '..' segments)
//    so a malformed key can never escape the bucket/prefix.
//  • The S3 driver is intentionally fetch-based (no SDK) — server-side
//    requests go to the operator-configured endpoint only; SSRF surface is
//    the S3_ENDPOINT env var itself, set by the operator.
import { createHmac, createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { join, resolve } from 'node:path';

export interface StoredObject { mime: string; bytes: Uint8Array; }
export interface StorageDriver {
  readonly kind: 'local' | 's3';
  put(key: string, bytes: Uint8Array, mime: string): Promise<void>;
  get(key: string): Promise<StoredObject | null>;
  /** Missing objects resolve to null (ENOENT tolerated). */
  delete(key: string): Promise<void>;
  /** Public/signed URL when the deployment serves one; local driver → null
   *  (callers fall back to the authenticated /admin/media/:id/file route). */
  getUrl(key: string, ttlSeconds?: number): Promise<string | null>;
}

export function normalizeKey(key: string): string {
  return key.replace(/^\/+/, '').split('/').filter((s) => s && s !== '.' && s !== '..').join('/');
}

// ---------------------------------------------------------------------------
// Local disk driver (dev + test): MEDIA_DIR root, one file per key.
// ---------------------------------------------------------------------------
export class LocalStorageDriver implements StorageDriver {
  readonly kind = 'local' as const;
  private readonly root: string;
  constructor(root: string) { this.root = root; }
  private path(key: string): string { return resolve(join(this.root, normalizeKey(key))); }
  async put(key: string, bytes: Uint8Array): Promise<void> {
    const p = this.path(key);
    mkdirSync(resolve(join(p, '..')), { recursive: true });
    writeFileSync(p, bytes);
  }
  async get(key: string): Promise<StoredObject | null> {
    try { return { mime: 'application/octet-stream', bytes: new Uint8Array(readFileSync(this.path(key))) }; }
    catch { return null; }
  }
  async delete(key: string): Promise<void> {
    try { unlinkSync(this.path(key)); } catch { /* ENOENT tolerated */ }
  }
  async getUrl(): Promise<string | null> { return null; }
}

// ---------------------------------------------------------------------------
// S3-compatible driver (AWS S3 / Cloudflare R2 / Backblaze B2), SigV4-signed.
// Config (env only): S3_ENDPOINT, S3_REGION, S3_BUCKET, S3_ACCESS_KEY_ID,
// S3_SECRET_ACCESS_KEY, optional S3_PUBLIC_BASE (public buckets skip signing).
// ---------------------------------------------------------------------------
/** ISO date → SigV4 amz-date "20260930T012345Z". */
const amzDateOf = (now: Date): string => now.toISOString().replace(/[:-]|\.\d{3}/g, '').slice(0, 15) + 'Z';

export class S3StorageDriver implements StorageDriver {
  readonly kind = 's3' as const;
  private readonly endpoint: string;
  private readonly region: string;
  private readonly bucket: string;
  private readonly accessKeyId: string;
  private readonly secretAccessKey: string;
  private readonly publicBase?: string;
  constructor(endpoint: string, region: string, bucket: string, accessKeyId: string, secretAccessKey: string, publicBase?: string) {
    this.endpoint = endpoint;
    this.region = region;
    this.bucket = bucket;
    this.accessKeyId = accessKeyId;
    this.secretAccessKey = secretAccessKey;
    this.publicBase = publicBase;
  }

  private url(key: string): string {
    return `${this.endpoint.replace(/\/+$/, '')}/${this.bucket}/${normalizeKey(key)}`;
  }

  private hmac(key: Buffer | string, data: string): Buffer {
    return createHmac('sha256', key).update(data, 'utf8').digest();
  }

  /** SigV4 headers + signature for one request. Exposed for tests. */
  signRequest(method: 'PUT' | 'GET' | 'DELETE', key: string, payloadHash: string, now = new Date()) {
    const amzDate = amzDateOf(now);
    const dateStamp = amzDate.slice(0, 8);
    const host = new URL(this.url(key)).host;
    const canonicalHeaders = `host:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
    const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';
    const canonicalRequest = [method, `/${this.bucket}/${normalizeKey(key)}`, '', canonicalHeaders, signedHeaders, payloadHash].join('\n');
    const scope = `${dateStamp}/${this.region}/s3/aws4_request`;
    const stringToSign = ['AWS4-HMAC-SHA256', amzDate, scope, createHash('sha256').update(canonicalRequest).digest('hex')].join('\n');
    const kDate = this.hmac('AWS4' + this.secretAccessKey, dateStamp);
    const kRegion = this.hmac(kDate, this.region);
    const kService = this.hmac(kRegion, 's3');
    const kSigning = this.hmac(kService, 'aws4_request');
    const signature = createHmac('sha256', kSigning).update(stringToSign, 'utf8').digest('hex');
    return {
      url: this.url(key),
      headers: {
        'x-amz-date': amzDate,
        'x-amz-content-sha256': payloadHash,
        Authorization: `AWS4-HMAC-SHA256 Credential=${this.accessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
      } as Record<string, string>,
    };
  }

  private async request(method: 'PUT' | 'GET' | 'DELETE', key: string, body?: Uint8Array, mime?: string): Promise<Response | null> {
    const payloadHash = createHash('sha256').update(body ?? Buffer.alloc(0)).digest('hex');
    const signed = this.signRequest(method, key, payloadHash);
    const headers = { ...signed.headers, ...(method === 'PUT' && mime ? { 'Content-Type': mime } : {}) };
    const res = await fetch(signed.url, { method, headers, body: body ? (body as unknown as BodyInit) : undefined });
    if (res.status === 404 && method !== 'PUT') return null;
    if (!res.ok) throw new Error(`S3 ${method} ${key} → HTTP ${res.status}`);
    return res;
  }

  async put(key: string, bytes: Uint8Array, mime: string): Promise<void> {
    await this.request('PUT', key, bytes, mime);
  }
  async get(key: string): Promise<StoredObject | null> {
    const res = await this.request('GET', key);
    if (!res) return null;
    return { mime: res.headers.get('content-type') ?? 'application/octet-stream', bytes: new Uint8Array(await res.arrayBuffer()) };
  }
  async delete(key: string): Promise<void> {
    await this.request('DELETE', key);
  }
  async getUrl(key: string, ttlSeconds = 900): Promise<string> {
    if (this.publicBase) return `${this.publicBase.replace(/\/+$/, '')}/${normalizeKey(key)}`;
    // SigV4 presigned GET (query-string auth) — same canonical pipeline,
    // credentials ride the query instead of headers.
    const now = new Date();
    const amzDate = amzDateOf(now);
    const dateStamp = amzDate.slice(0, 8);
    const scope = `${dateStamp}/${this.region}/s3/aws4_request`;
    const host = new URL(this.url(key)).host;
    const query = new URLSearchParams({
      'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
      'X-Amz-Credential': `${this.accessKeyId}/${scope}`,
      'X-Amz-Date': amzDate,
      'X-Amz-Expires': String(Math.min(Math.max(ttlSeconds, 60), 604800)),
      'X-Amz-SignedHeaders': 'host',
    });
    const canonicalHeaders = `host:${host}\n`;
    const canonicalRequest = ['GET', `/${this.bucket}/${normalizeKey(key)}`, query.toString(), canonicalHeaders, 'host', 'UNSIGNED-PAYLOAD'].join('\n');
    const stringToSign = ['AWS4-HMAC-SHA256', amzDate, scope, createHash('sha256').update(canonicalRequest).digest('hex')].join('\n');
    const kDate = this.hmac('AWS4' + this.secretAccessKey, dateStamp);
    const kRegion = this.hmac(kDate, this.region);
    const kService = this.hmac(kRegion, 's3');
    const kSigning = this.hmac(kService, 'aws4_request');
    const signature = createHmac('sha256', kSigning).update(stringToSign, 'utf8').digest('hex');
    return `${this.url(key)}?${query.toString()}&X-Amz-Signature=${signature}`;
  }
}

let cached: StorageDriver | null = null;

/** Process-wide driver selected by env. Local unless MEDIA_STORAGE=s3 AND the
 *  S3 env set is complete (otherwise we fail loud — a half-configured prod
 *  driver must never silently write to local disk). */
export function getStorage(): StorageDriver {
  if (cached) return cached;
  if (process.env.MEDIA_STORAGE === 's3') {
    const endpoint = process.env.S3_ENDPOINT;
    const bucket = process.env.S3_BUCKET;
    const accessKeyId = process.env.S3_ACCESS_KEY_ID;
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
    if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
      throw new Error('MEDIA_STORAGE=s3 requires S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY in the environment');
    }
    cached = new S3StorageDriver(endpoint, process.env.S3_REGION ?? 'auto', bucket, accessKeyId, secretAccessKey, process.env.S3_PUBLIC_BASE);
  } else {
    cached = new LocalStorageDriver(process.env.MEDIA_DIR ?? './data/media');
  }
  return cached;
}

/** Test seam: reset the singleton when env changes between suites. */
export function __resetStorageForTest(): void { cached = null; }
