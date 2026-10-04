# TwinMOS Corporate Website - HTTP Security Headers Specification

**Document Reference:** TWN-SEC-2026-006
**Document Version:** 1.0
**Status:** FINAL
**Date:** 2 May 2026
**Prepared by:** TwinMOS Digital Transformation Team
**Owner:** IT/Technical Lead / Security Lead
**Classification:** CONFIDENTIAL - Internal Use
**Synchronized With:** Tech Stack v1.1 (Section 18.1, 18.2), BRD v3.0 (Section 21.1)

---

## Change Log

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2 May 2026 | Initial release - formal HTTP security headers spec |

---

## Document Governance

| Role | Name | Sign-Off | Date |
|------|------|----------|------|
| Project Sponsor | Mohd Mazharul Islam | _______________ | _________ |
| IT/Technical Lead | (TBC) | _______________ | _________ |
| Unisoft Security Lead | (TBC) | _______________ | _________ |

---

## Table of Contents

1. Executive Summary
2. Header Inventory
3. Strict-Transport-Security (HSTS)
4. X-Frame-Options
5. X-Content-Type-Options
6. Referrer-Policy
7. Permissions-Policy
8. Cross-Origin-Resource-Policy
9. Cross-Origin-Opener-Policy
10. Cross-Origin-Embedder-Policy
11. Server Header Management
12. Header Configuration by Environment
13. Testing and Validation
14. Compliance Mapping
15. Implementation Checklist

---

## 1. Executive Summary

This document specifies all HTTP security headers for the TwinMOS corporate website. These headers provide defense-in-depth protection against common web attacks including man-in-the-middle attacks, clickjacking, MIME-type confusion, and information leakage.

**Header Delivery:** All headers configured at Cloudflare edge (primary) with application-level fallback.

**Key Principles:**
- Maximum security by default
- Environment-specific relaxations only where necessary
- Automated validation in CI/CD pipeline

---

## 2. Header Inventory

### 2.1 Required Headers

| Header | Value | Purpose | Priority |
|--------|-------|---------|----------|
| Strict-Transport-Security | max-age=31536000; includeSubDomains; preload | Force HTTPS | P0 |
| X-Frame-Options | DENY | Prevent clickjacking | P0 |
| X-Content-Type-Options | nosniff | Prevent MIME sniffing | P0 |
| Referrer-Policy | strict-origin-when-cross-origin | Control referrer leakage | P0 |
| Content-Security-Policy | (see CSP spec TWN-SEC-2026-005) | XSS prevention | P0 |
| Permissions-Policy | (see Section 7) | Restrict browser features | P1 |
| Cross-Origin-Resource-Policy | same-origin | Prevent cross-origin resource loading | P1 |
| Cross-Origin-Opener-Policy | same-origin | Isolate windows from cross-origin | P1 |
| Cross-Origin-Embedder-Policy | require-corp | Require CORP for embedded resources | P2 |

### 2.2 Headers to Remove

| Header | Reason |
|--------|--------|
| X-Powered-By | Information disclosure |
| Server | Information disclosure (or obfuscate) |
| X-AspNet-Version | Information disclosure |
| X-Generator | Information disclosure |

---

## 3. Strict-Transport-Security (HSTS)

### 3.1 Policy

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

### 3.2 Directive Breakdown

| Directive | Value | Purpose |
|-----------|-------|---------|
| max-age | 31536000 seconds (1 year) | Duration browser remembers HSTS |
| includeSubDomains | Present | Apply to all subdomains |
| preload | Present | Include in browser preload list |

### 3.3 Preload Registration

| Step | Action | Timeline |
|------|--------|----------|
| 1 | Ensure HSTS header deployed on all HTTPS responses | Week 1 |
| 2 | Verify includeSubDomains present | Week 1 |
| 3 | Submit to hstspreload.org | Week 4 (post-launch) |
| 4 | Monitor preload status | Ongoing |

### 3.4 Risks and Mitigations

| Risk | Mitigation |
|------|-----------|
| Accidental HTTPS misconfiguration | Test thoroughly before preload submission |
| Subdomain without HTTPS | Ensure all subdomains support HTTPS before includeSubDomains |
| Rollback difficulty | Preload is permanent; verify configuration carefully |

---

## 4. X-Frame-Options

### 4.1 Policy

```
X-Frame-Options: DENY
```

### 4.2 Rationale

- DENY (not SAMEORIGIN) because TwinMOS does not need to frame any of its own pages
- CSP frame-ancestors 'none' provides modern browser protection
- X-Frame-Options provides legacy browser protection

### 4.3 Exceptions

| Page | Exception | Reason |
|------|-----------|--------|
| None | N/A | No framing required |

---

## 5. X-Content-Type-Options

### 5.1 Policy

```
X-Content-Type-Options: nosniff
```

### 5.2 Rationale

Prevents browsers from MIME-sniffing responses away from declared content type.
Protects against:
- MIME-type confusion attacks
- Drive-by download attacks
- XSS via file upload with incorrect MIME type

---

## 6. Referrer-Policy

### 6.1 Policy

```
Referrer-Policy: strict-origin-when-cross-origin
```

### 6.2 Directive Breakdown

| Scenario | Behavior |
|----------|----------|
| Same-origin request | Full URL sent as referrer |
| Cross-origin request | Only origin sent (no path) |
| Downgrade (HTTPS -> HTTP) | No referrer sent |

### 6.3 Rationale

- Balances privacy (no path leakage to third parties) with functionality (origin known for analytics)
- strict-origin-when-cross-origin is the modern browser default
- Explicitly set for consistent behavior across all browsers

---

## 7. Permissions-Policy

### 7.1 Policy

```
Permissions-Policy:
  accelerometer=(),
  camera=(),
  geolocation=(self),
  gyroscope=(),
  magnetometer=(),
  microphone=(),
  payment=(self),
  usb=(),
  interest-cohort=(),
  browsing-topics=()
```

### 7.2 Feature Allowlist

| Feature | Allowlist | Rationale |
|---------|-----------|-----------|
| accelerometer | () | Not needed |
| camera | () | Not needed |
| geolocation | (self) | Where-to-buy locator (user-initiated) |
| gyroscope | () | Not needed |
| magnetometer | () | Not needed |
| microphone | () | Not needed |
| payment | (self) | Phase 3 e-commerce |
| usb | () | Not needed |
| interest-cohort | () | Disable FLoC |
| browsing-topics | () | Disable Topics API |

### 7.3 Phase-Specific Changes

| Phase | Change |
|-------|--------|
| Phase 1 | payment=() (no e-commerce) |
| Phase 3 | payment=(self) (Stripe checkout) |

---

## 8. Cross-Origin-Resource-Policy (CORP)

### 8.1 Policy

```
Cross-Origin-Resource-Policy: same-origin
```

### 8.2 Rationale

Prevents cross-origin loading of TwinMOS resources by default.
Protects against:
- Spectre-style attacks
- Unauthorized cross-origin embedding

### 8.3 Exceptions

| Resource | CORP Value | Reason |
|----------|-----------|--------|
| Public images | cross-origin | Allow social sharing/embeds |
| Product datasheets | same-origin | Restrict to TwinMOS |

---

## 9. Cross-Origin-Opener-Policy (COOP)

### 9.1 Policy

```
Cross-Origin-Opener-Policy: same-origin
```

### 9.2 Rationale

Isolates TwinMOS windows from cross-origin windows.
Protects against:
- Cross-window attacks
- Spectre-style information leakage

---

## 10. Cross-Origin-Embedder-Policy (COEP)

### 10.1 Policy

```
Cross-Origin-Embedder-Policy: require-corp
```

### 10.2 Rationale

Requires all embedded resources to have CORP headers.
Enables cross-origin isolation for advanced browser features.

### 10.3 Compatibility Note

- May block third-party resources without CORP headers
- Monitor for breakage during testing
- Fallback to credentialless if require-corp causes issues

---

## 11. Server Header Management

### 11.1 Policy

```
# Remove or obfuscate Server header
Server: TwinMOS-CDN
```

### 11.2 Rationale

- Default Server headers disclose technology stack
- Information disclosure aids attackers
- Custom value prevents fingerprinting while maintaining HTTP compliance

---

## 12. Header Configuration by Environment

### 12.1 Production

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: [see CSP spec]
Permissions-Policy: accelerometer=(), camera=(), geolocation=(self), gyroscope=(), magnetometer=(), microphone=(), payment=(self), usb=(), interest-cohort=(), browsing-topics=()
Cross-Origin-Resource-Policy: same-origin
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Server: TwinMOS-CDN
```

### 12.2 Staging

Same as production except:
```
Strict-Transport-Security: max-age=86400; includeSubDomains
# No preload flag on staging
```

### 12.3 Development

```
# HSTS disabled for local HTTP development
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# Referrer-Policy: strict-origin-when-cross-origin
# CSP in report-only mode
# Other headers same as production
```

---

## 13. Testing and Validation

### 13.1 Automated Testing

| Tool | Purpose | Frequency |
|------|---------|-----------|
| Mozilla Observatory | Header scoring | Weekly |
| Security Headers | Header validation | Weekly |
| OWASP ZAP | Header detection | Weekly |
| Custom script | Verify all headers present | Per deployment |

### 13.2 Target Scores

| Tool | Target | Minimum |
|------|--------|---------|
| Mozilla Observatory | 100/100 | 95/100 |
| Security Headers | A+ | A |

### 13.3 Manual Verification

```bash
# Check headers with curl
curl -I https://twinmos.com

# Expected output should include all P0 headers
curl -I https://twinmos.com | grep -E "(Strict-Transport-Security|X-Frame-Options|X-Content-Type-Options|Referrer-Policy|Content-Security-Policy)"
```

---

## 14. Compliance Mapping

### 14.1 OWASP Top 10 2021

| Risk | Header Mitigation |
|------|-------------------|
| A02:2021 - Cryptographic Failures | HSTS enforces TLS |
| A03:2021 - Injection | CSP prevents XSS |
| A05:2021 - Security Misconfiguration | All headers reduce misconfiguration risk |
| A07:2021 - Auth Failures | HSTS protects auth cookies |

### 14.2 BRD Security Requirements

| BRD Requirement | Header Implementation |
|-----------------|----------------------|
| HTTPS Everywhere | HSTS |
| Secure Cookies | HSTS (TLS enforcement) |
| XSS Prevention | CSP + X-Content-Type-Options |
| Clickjacking Prevention | X-Frame-Options + CSP frame-ancestors |

---

## 15. Implementation Checklist

- [ ] Configure all P0 headers in Cloudflare
- [ ] Configure application-level header fallback
- [ ] Remove information-disclosure headers
- [ ] Set HSTS with preload for production
- [ ] Set HSTS without preload for staging
- [ ] Configure Permissions-Policy
- [ ] Configure CORP/COOP/COEP headers
- [ ] Add header validation to CI/CD
- [ ] Test with Mozilla Observatory (target 100/100)
- [ ] Test with Security Headers (target A+)
- [ ] Document any exceptions
- [ ] Schedule quarterly header review

---

**End of Document**

This document is part of the TwinMOS Security & Compliance documentation suite.
Related documents:
- TWN-SEC-2026-001: Security Architecture
- TWN-SEC-2026-005: Content Security Policy Specification
