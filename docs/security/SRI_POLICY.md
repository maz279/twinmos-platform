# Subresource Integrity (SRI) Policy & Third-Party Script Governance

**Document ID:** TM-SEC-SRI-2026-10-27  
**Milestone:** MS7.3 · Security Hardening (Task T7.3.4 / Quality Gate HARD-01)  
**Classification:** Engineering Policy / Public Architecture Governance  
**Status:** ACTIVE & ENFORCED  

---

## 1. Purpose & Scope

This document specifies the TwinMOS corporate platform policy for loading client-side JavaScript, stylesheets, and external assets across the public website (`apps/web`) and administration portal (`apps/admin`).

The objective is to eliminate supply-chain tampering, CDN compromise vectors, and unauthorized client-side script execution.

---

## 2. Core Architectural Principles

1. **Self-Hosting First**:
   All core client libraries (React, Astro islands, Lucide icons, Tailwind stylesheets, local utility scripts) MUST be compiled and bundled into the application's local asset pipeline.
   Hashed static assets are served directly from the origin with immutable cache policies (`Cache-Control: public, max-age=31536000, immutable`).

2. **Mandatory SRI for Third-Party Static Resources**:
   Any third-party static script or stylesheet loaded from an external origin MUST include:
   - An `integrity` attribute containing a cryptographically secure hash (`sha384-...` or `sha512-...`).
   - A `crossorigin="anonymous"` attribute to ensure CORS verification occurs prior to integrity comparison.
   ```html
   <!-- Canonical Example of Compliant Third-Party Static Resource -->
   <script
     src="https://cdn.example.org/library@1.2.3/dist/library.min.js"
     integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
     crossorigin="anonymous">
   </script>
   ```

3. **Strict Content-Security-Policy (CSP) Defense-in-Depth**:
   SRI operates in conjunction with the server-level NGINX CSP (`deploy/nginx/twinmos.conf`):
   ```nginx
   script-src 'self' https://challenges.cloudflare.com;
   object-src 'none';
   base-uri 'self';
   ```

---

## 3. Formal Exemption: Cloudflare Turnstile

### 3.1 Exemption Rationale & Risk Assessment
Cloudflare Turnstile (`https://challenges.cloudflare.com/turnstile/v0/api.js`) is formally **EXEMPT** from static Subresource Integrity hashes.

| Assessment Vector | Technical Finding |
| :--- | :--- |
| **Execution Model** | Turnstile is an adaptive bot-detection engine. Cloudflare continuously updates the underlying client scripts to defend against zero-day automated CAPTCHA solvers, headless browser bypasses, and credential-stuffing botnets. |
| **Vendor Stance** | Cloudflare does not support fixed SRI hashes for Turnstile. Applying a static hash causes immediate breakage as soon as Cloudflare deploys routine anti-abuse signatures. |
| **Compensating Controls** | 1. Isolated `script-src` and `frame-src` strictly whitelist `https://challenges.cloudflare.com`.<br/>2. Turnstile runs inside an isolated iframe sandbox with restricted DOM access.<br/>3. Server-side validation via `POST https://challenges.cloudflare.com/turnstile/v0/siteverify` cryptographically checks tokens against Cloudflare backend APIs (`apps/api/src/services/turnstile.ts`). |

### 3.2 Documentation & Exemption Registry
- **Authorized Dynamic Script**: Cloudflare Turnstile API (`https://challenges.cloudflare.com/turnstile/v0/api.js`)
- **Approved Consumer**: Public inquiry, quotation, and partner registration forms (`apps/web/src/components/forms/`)
- **Review Schedule**: Bi-annual verification during Phase 07 hypercare security audits.

---

## 4. Audit & Verification

Compliance with this SRI policy is verified automatically by:
1. `tooling/verify/verify-ms73-audit.mjs` (Gate 07: Subresource Integrity Policy).
2. Quality Gate `HARD-01` (`tooling/verify/hard-01-audit.mjs`).
3. OWASP ZAP Automated Scans (`tooling/ops/zap-full-scan.mjs`).
