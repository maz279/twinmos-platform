# ADR-006: Frontend Hosting — Cloudflare Pages vs Vercel

| Field | Value |
|-------|-------|
| **ADR Number** | ADR-006 |
| **Date** | 2026-04-01 |
| **Status** | Accepted |
| **Deciders** | Engineering Lead |
| **Source** | Tech Stack §2.4, §19.1 |

---

## 1. Context

The Astro 5 frontend is a static site (SSG output). It needs a hosting platform that:
- Serves pre-built HTML/CSS/JS from a global CDN
- Supports build-on-push from GitHub
- Has generous or unlimited bandwidth (product pages include high-res images and potentially firmware files)
- Integrates with the project's security tools (Cloudflare WAF, Turnstile)
- Supports preview deployments for PR reviews
- Costs as little as possible for a small company (<$25/mo Phase 1)

Key candidates: **Cloudflare Pages** vs **Vercel** (the two dominant platforms for Astro hosting).

---

## 2. Decision

**We will use Cloudflare Pages for frontend hosting.**

---

## 3. Rationale

### Bandwidth: The Critical Factor

TwinMOS is a hardware product company. Product detail pages include:
- Multiple high-resolution product images (1-4 MB each)
- Hero banners (~500 KB each)
- Potential firmware/driver downloads (5-50 MB)
- 100+ SKU pages × global traffic

**Bandwidth comparison:**

| Platform | Bandwidth Cost |
|----------|---------------|
| **Cloudflare Pages** | **Unlimited — $0** |
| Vercel Free | 100 GB/month — then blocked |
| Vercel Pro | 1 TB/month at $20/seat — overage charges |
| Netlify Free | 100 GB/month |

For a product catalogue with media-rich pages, unlimited bandwidth is operationally essential. The risk of a viral product launch or media mention causing a Vercel bandwidth overage (or site blockage on free tier) is unacceptable.

### Cloudflare Ecosystem Integration

TwinMOS already uses multiple Cloudflare services:
- **Cloudflare WAF** — Bot protection, DDoS mitigation
- **Cloudflare Turnstile** — Form CAPTCHA
- **Cloudflare CDN** — Image caching (ImgProxy → Cloudflare edge)

Hosting on Cloudflare Pages provides **native integration** with these services:
- Cache tag purging for ISR (webhook → purge specific product pages)
- Cloudflare Rules apply to Pages routes seamlessly
- Single control plane for security + hosting

### Global Performance

| Metric | Cloudflare Pages | Vercel |
|--------|-----------------|--------|
| Edge PoPs | **310+** | 100+ |
| TTFB (global median) | **<50ms** | <100ms |
| TwinMOS key markets (MEA, South Asia) | **Well-covered** | Less coverage |

### Cost

| Platform | Monthly Cost |
|----------|-------------|
| **Cloudflare Pages** | **$0** (Free; no per-seat pricing) |
| Vercel Pro | $20/seat/month (2 devs = $40/month) |

Cloudflare Pages Pro is $20/month (adds more build minutes) — still significantly cheaper than Vercel Pro.

---

## 4. Alternatives Considered

| Option | Reason Not Chosen |
|--------|------------------|
| **Vercel** | $20/seat/month pricing adds up; 1TB bandwidth limit risks overage on media-rich product site; not as integrated with Cloudflare WAF/Turnstile; better suited to Next.js (not Astro) |
| **Netlify** | 100GB bandwidth cap on free tier; less generous than Cloudflare Pages; limited Cloudflare ecosystem integration |
| **AWS S3 + CloudFront** | Infrastructure complexity; requires manual CI/CD setup; higher ops burden for 2-dev team |
| **GitHub Pages** | Limited build pipeline; no branch preview deployments; slow CDN |
| **Hetzner (same VPS as Strapi)** | Serving static files from same VPS as the API server removes isolation; no global CDN; defeats purpose of SSG |

---

## 5. Consequences

### Positive
- Zero frontend hosting cost through all phases
- Unlimited bandwidth — no surprise bills regardless of traffic spikes
- 310+ edge PoPs covers TwinMOS's global markets (MEA, South Asia, Africa, CIS)
- Native integration with Cloudflare WAF, Turnstile, cache tag purge
- PR preview deployments available on free tier
- Automatic HTTPS via Cloudflare

### Negative / Trade-offs
- Cloudflare Pages has **build minute limits** on free tier (500 min/month). At 8-12 min per build, that's ~40-60 builds/month. May need upgrade to $20/month Cloudflare Pages Pro if heavy content iteration
- Cloudflare Pages Astro adapter required (`@astrojs/cloudflare`) — minor setup overhead
- Cloudflare Workers runtime differences from Node.js affect any server-side Astro features (but project uses SSG — irrelevant for Phase 1/2)

---

## 6. Implementation Notes

**Astro Cloudflare adapter:**
```bash
npx astro add cloudflare
```

**`astro.config.ts`:**
```typescript
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'static',  // Pure SSG — no Cloudflare Workers needed for Phase 1
  adapter: cloudflare(),
});
```

**Cloudflare Pages build settings:**
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `/` (monorepo: specify frontend subdirectory)
- Environment variables: Set in Cloudflare Pages dashboard

---

## 7. Related ADRs

- ADR-001: Stack Selection
- ADR-002: Architecture Patterns (SSG)
- ADR-007: Hetzner vs AWS (backend hosting)
- ADR-008: Monorepo vs Multi-repo
