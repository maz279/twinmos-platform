import { createHmac, timingSafeEqual } from 'node:crypto';
import { previewTokenPayloadSchema, type PreviewTokenPayload, type DeliveryEntity } from '@twinmos/shared';

function getSecret(): string {
  return process.env.BETTER_AUTH_SECRET || 'dev-insecure-secret-twinmos-platform';
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str, 'utf8').toString('base64url');
}

function base64UrlDecode(str: string): string {
  return Buffer.from(str, 'base64url').toString('utf8');
}

/**
 * Creates a signed, short-lived preview token scoped to an entity.
 * Default TTL: 1 hour (3600 seconds).
 */
export function createPreviewToken(
  entityType: DeliveryEntity,
  entityId: string | number,
  slug?: string,
  ttlSeconds = 3600
): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: PreviewTokenPayload = {
    entityType,
    entityId,
    slug,
    iat: now,
    exp: now + ttlSeconds,
  };

  const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
  const signature = createHmac('sha256', getSecret())
    .update(payloadEncoded)
    .digest('base64url');

  return `${payloadEncoded}.${signature}`;
}

/**
 * Verifies a preview token. Checks HMAC signature, schema, expiry, and scope.
 */
export function verifyPreviewToken(
  token: string | undefined | null,
  expectedEntityType?: DeliveryEntity,
  expectedEntityIdOrSlug?: string | number
): PreviewTokenPayload | null {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadEncoded, signature] = parts;

  // Verify HMAC signature timing-safely
  const expectedSignature = createHmac('sha256', getSecret())
    .update(payloadEncoded)
    .digest('base64url');

  const sigBuf = Buffer.from(signature, 'utf8');
  const expectedSigBuf = Buffer.from(expectedSignature, 'utf8');

  if (sigBuf.length !== expectedSigBuf.length) return null;
  if (!timingSafeEqual(sigBuf, expectedSigBuf)) return null;

  try {
    const rawJson = JSON.parse(base64UrlDecode(payloadEncoded));
    const parsed = previewTokenPayloadSchema.safeParse(rawJson);
    if (!parsed.success) return null;

    const payload = parsed.data;
    const now = Math.floor(Date.now() / 1000);

    // Enforce expiry
    if (payload.exp < now) return null;

    // Enforce scope if expected parameters provided
    if (expectedEntityType && payload.entityType !== expectedEntityType) {
      return null;
    }

    if (expectedEntityIdOrSlug !== undefined) {
      const matchId = String(payload.entityId) === String(expectedEntityIdOrSlug);
      const matchSlug = payload.slug && String(payload.slug) === String(expectedEntityIdOrSlug);
      if (!matchId && !matchSlug) {
        return null;
      }
    }

    return payload;
  } catch {
    return null;
  }
}
