# ADR-010: Image Processing — ImgProxy (Self-Hosted) vs Cloudinary

| Field | Value |
|-------|-------|
| **ADR Number** | ADR-010 |
| **Date** | 2026-04-15 |
| **Status** | Accepted |
| **Deciders** | Engineering Lead |
| **Source** | Tech Stack §8 |

---

## 1. Context

TwinMOS is a hardware product company with a media-heavy product catalogue:
- 100+ SKU pages, each with multiple high-resolution product images (3–8 MB raw PNG/JPEG)
- Hero banners, lifestyle photography, compatibility diagrams
- Images must be served in modern formats (WebP, AVIF) at correct dimensions per viewport
- Images are stored in Backblaze B2 (Frankfurt) as originals

The project requires an **image transformation service** that can:
- Resize, crop, and reformat images on demand (or on first request)
- Output WebP/AVIF for supported browsers, JPEG/PNG fallback
- Integrate with the existing B2 storage backend
- Cache transformed images at the Cloudflare CDN edge
- Protect against URL-crafted DoS attacks (unsigned URL abuse)

---

## 2. Decision

**We will use ImgProxy self-hosted on the existing Hetzner CX32 VPS (via Coolify Docker container), with Backblaze B2 as the image source and Cloudflare CDN as the caching layer in front.**

| Component | Role |
|-----------|------|
| **Backblaze B2** | Origin storage for original images |
| **ImgProxy** | On-demand image transformation (resize, format conversion, crop) |
| **Cloudflare CDN** | Edge cache for transformed image variants |
| **HMAC URL signing** | Request authentication to prevent unsigned transform abuse |

---

## 3. Rationale

### Cost: The Decisive Factor

| Service | Cost Model | Phase 1 Cost | Phase 3 Cost (est.) |
|---------|-----------|-------------|-------------------|
| **ImgProxy (self-hosted)** | Fixed VPS share | **$0 incremental** | **$0 incremental** |
| Cloudinary | 25 credits free → Essentials $99/mo → Plus $249/mo | $0–$99 | $99–$249/mo |
| Cloudflare Images | $5/mo + $1/1,000 transforms | $5–$10 | $20–$50/mo |
| imgix | $200/mo base | $200 | $200+ |
| AWS CloudFront + Lambda@Edge | Per-request billing | $20–$50 | $80–$200/mo |

ImgProxy runs on the Hetzner CX32 VPS already paid for (€13.10/mo all-in). There is **zero incremental cost** for image processing regardless of transform volume.

Cloudinary equivalent for a media-rich product catalogue with 100+ SKUs would reach the Essentials tier ($99/mo) or higher by Phase 3, adding $1,200+/year that provides no capability advantage over ImgProxy.

### Technical Capabilities

| Feature | ImgProxy | Cloudinary (Essentials) |
|---------|----------|------------------------|
| WebP output | ✅ | ✅ |
| AVIF output | ✅ | ✅ |
| Resize / crop / fit | ✅ | ✅ |
| Smart cropping (libvips detect) | ✅ | ✅ |
| Watermarking | ✅ | ✅ |
| HMAC URL signing | ✅ | ✅ |
| B2 native source | ✅ (`b2://` protocol) | ❌ (HTTP pull only) |
| Self-hosted | ✅ | ❌ |
| Docker deployment | ✅ | N/A |

### Architecture Integration

ImgProxy has native support for `b2://` source protocol using Backblaze B2 credentials. Transformed images are served via a custom subdomain (`media.twinmos.com`) which Cloudflare proxies — so all transforms are cached at Cloudflare's edge after the first request. Cache-hit ratio for product images is high (same image at same dimensions served repeatedly).

**Request flow:**
```
Browser → Cloudflare CDN (cache hit? serve) 
  → MISS → ImgProxy on Hetzner 
    → Pull original from B2 
    → Transform (libvips) 
    → Return to Cloudflare (cached) + Browser
```

### Security: HMAC URL Signing

ImgProxy enforces HMAC-SHA256 signed URLs. Without a valid signature, ImgProxy returns HTTP 403. This prevents:
- Crafted URLs that request enormous image dimensions (CPU DoS)
- Enumeration of original image paths
- Third-party hotlinking from triggering transformation costs

```typescript
// URL structure: /rs:fill:800:600/{signature}/{encoded_source_url}
// Signature = HMAC-SHA256(IMGPROXY_KEY + IMGPROXY_SALT + path)
```

### Performance

ImgProxy is written in Go and uses libvips for image processing — libvips is 4–8x faster than ImageMagick for typical resize operations. The CX32's 4 vCPUs can handle 50–100 concurrent transforms before queuing. With Cloudflare CDN caching transforms, repeated requests never hit ImgProxy.

---

## 4. Alternatives Considered

| Option | Monthly Cost | Reason Not Chosen |
|--------|-------------|------------------|
| **Cloudinary (Essentials)** | $99/mo | $1,200+/year for capability available at $0 incremental cost; vendor lock-in; no B2 native source; no self-host option |
| **Cloudflare Images** | $5/mo + $1/1k transforms | Reasonable cost but adds another Cloudflare service; ImgProxy gives more control; no per-transform billing unpredictability |
| **imgix** | $200/mo minimum | Enterprise pricing; overkill for project scale |
| **Thumbor** (Python) | $0 self-hosted | Python-based; slower than ImgProxy (Go/libvips); less maintained; HMAC signing less well-documented |
| **Sharp + custom API** | $0 + dev time | Requires building and maintaining a Node.js transformation API; reinventing what ImgProxy provides out-of-box |
| **AWS Lambda@Edge** | Per-request | Complex infrastructure; billing unpredictable; high latency vs. VPS transform |

---

## 5. Consequences

### Positive
- Zero incremental image processing cost across all phases
- Go + libvips performance handles product catalogue volume on existing VPS
- HMAC-signed URLs prevent DoS and hotlinking
- Native B2 source — no HTTP round-trip to pull originals
- Cloudflare CDN caches all transformed variants — ImgProxy only processes each transform once
- WebP/AVIF output reduces image payload 30–50% vs JPEG
- Coolify manages ImgProxy container (one-click deployment, env var management)

### Negative / Trade-offs
- **VPS resource competition:** ImgProxy competes with Strapi/PostgreSQL/MeiliSearch for CPU during bulk transform operations. **Mitigated:** Cloudflare CDN means transforms are one-time per variant; initial warmup (build-time or first visitor) is the only burst
- **No SLA for ImgProxy processing:** If the Hetzner VPS is down, image transforms fail. **Mitigated:** Cloudflare CDN serves cached variants indefinitely (`Cache-Control: max-age=31536000`); originals on B2 remain accessible
- **HMAC URL generation required:** Astro build must sign every image URL. **Mitigated:** ImgProxy provides official TypeScript SDK + signing utility; integrated into Strapi upload provider and Astro image helpers

### Phase 3 Upgrade Path

If Phase 3 traffic volume exceeds VPS capacity:
1. Move ImgProxy to a dedicated Hetzner CX22 (€5/mo) for isolated resources
2. Enable ImgProxy's built-in response caching (`IMGPROXY_LOCAL_CACHE_SIZE_MB`) as L1 before Cloudflare L2

---

## 6. Implementation Notes

**Coolify deployment (`docker-compose` via Coolify):**
```yaml
services:
  imgproxy:
    image: darthsim/imgproxy:latest
    environment:
      IMGPROXY_KEY: ${IMGPROXY_KEY}
      IMGPROXY_SALT: ${IMGPROXY_SALT}
      IMGPROXY_USE_S3: "true"
      AWS_ACCESS_KEY_ID: ${B2_KEY_ID}
      AWS_SECRET_ACCESS_KEY: ${B2_APPLICATION_KEY}
      AWS_ENDPOINT_URL_S3: https://s3.eu-central-003.backblazeb2.com
      IMGPROXY_S3_REGION: eu-central-003
      IMGPROXY_MAX_SRC_RESOLUTION: 50       # megapixels
      IMGPROXY_MAX_ANIMATION_FRAMES: 1
      IMGPROXY_ENABLE_WEBP_DETECTION: "true"
      IMGPROXY_ENABLE_AVIF_DETECTION: "true"
    ports:
      - "8080:8080"
```

**URL generation (TypeScript utility):**
```typescript
import { createHmac } from 'crypto';

export function buildImgProxyUrl(
  sourceKey: string,
  options: { width: number; height: number; fit?: 'fill' | 'fit' | 'crop' }
): string {
  const { width, height, fit = 'fill' } = options;
  const encoded = Buffer.from(`b2://twinmos-public/${sourceKey}`).toString('base64url');
  const path = `/rs:${fit}:${width}:${height}/plain/${encoded}`;
  
  const signature = createHmac('sha256', Buffer.from(process.env.IMGPROXY_KEY!, 'hex'))
    .update(Buffer.from(process.env.IMGPROXY_SALT!, 'hex'))
    .update(path)
    .digest('base64url')
    .substring(0, 32);
  
  return `${process.env.IMGPROXY_URL}/${signature}${path}`;
}
```

**Astro `<Image>` integration:**
```astro
---
import { buildImgProxyUrl } from '@/lib/imgproxy';

const src = buildImgProxyUrl(product.image.key, { width: 800, height: 600 });
---
<img src={src} width={800} height={600} alt={product.name} loading="lazy" decoding="async" />
```

**Cloudflare cache rule:** `media.twinmos.com/*` → Cache Everything, Edge TTL 1 year, Browser TTL 1 year.

---

## 7. Related ADRs

- ADR-001: Stack Selection
- ADR-007: Hetzner vs AWS (hosting that includes ImgProxy)
- ADR-018: Backblaze B2 Integration
