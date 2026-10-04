# TwinMOS Website — Domain & DNS Management Guide

| | |
|:---|:---|
| **Reference** | H.3-006 |
| **Priority** | P1 |
| **Status** | [P] Planned |
| **Author** | DevOps Lead |
| **Version** | 1.0 |
| **Date** | 2026-05-01 |
| **Review Cycle** | Quarterly |

---

## 1. Purpose

This document defines the domain portfolio, DNS configuration, and name management for the TwinMOS website infrastructure.

---

## 2. Domain Portfolio

### 2.1 Primary Domains

| Domain | Purpose | Registrar | DNS Provider |
|:---|:---|:---|:---|
| `twinmos.com` | Primary corporate domain | Namecheap | Cloudflare |
| `twinmos.net` | Redirect to .com | Namecheap | Cloudflare |
| `twinmos.org` | Redirect to .com | Namecheap | Cloudflare |

### 2.2 Regional Domains (P3)

| Domain | Purpose | Market |
|:---|:---|:---|
| `twinmos.ae` | UAE regional | United Arab Emirates |
| `twinmos.sa` | KSA regional | Saudi Arabia |
| `twinmos.in` | India regional | India |

### 2.3 Subdomain Inventory

| Subdomain | Target | Purpose |
|:---|:---|:---|
| `www.twinmos.com` | Cloudflare Pages | Production frontend |
| `staging.twinmos.com` | Cloudflare Pages | Staging frontend |
| `api.twinmos.com` | Hetzner VPS | Production Strapi API |
| `api-staging.twinmos.com` | Hetzner VPS | Staging Strapi API |
| `admin.twinmos.com` | Hetzner VPS | Strapi admin panel alias |
| `analytics.twinmos.com` | Hetzner VPS | Plausible analytics |
| `search.twinmos.com` | Hetzner VPS | MeiliSearch (internal) |
| `status.twinmos.com` | UptimeRobot | Status page |
| `cdn.twinmos.com` | Cloudflare | CDN alias (P3) |
| `coolify.twinmos.com` | Hetzner VPS | Coolify dashboard |

---

## 3. DNS Configuration

### 3.1 Cloudflare DNS Records

| Name | Type | Value | TTL | Proxy |
|:---|:---|:---|:---|:---|
| `@` | A | `<Cloudflare-Anycast>` | Auto | Proxied |
| `www` | CNAME | `twinmos-website-prod.pages.dev` | Auto | Proxied |
| `staging` | CNAME | `twinmos-website-staging.pages.dev` | Auto | Proxied |
| `api` | A | `<Hetzner-IP>` | 300 | Proxied |
| `api-staging` | A | `<Hetzner-IP>` | 300 | Proxied |
| `admin` | CNAME | `api.twinmos.com` | 300 | Proxied |
| `analytics` | A | `<Hetzner-IP>` | 300 | Proxied |
| `status` | CNAME | `stats.uptimerobot.com` | 300 | DNS only |
| `coolify` | A | `<Hetzner-IP>` | 300 | DNS only |

### 3.2 MX Records (Email)

| Name | Type | Value | Priority |
|:---|:---|:---|:---|
| `@` | MX | `mx1.improvmx.com` | 10 |
| `@` | MX | `mx2.improvmx.com` | 20 |

### 3.3 TXT Records

| Name | Value | Purpose |
|:---|:---|:---|
| `@` | `v=spf1 include:spf.improvmx.com ~all` | SPF record |
| `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:dmarc@twinmos.com` | DMARC policy |
| `_github-challenge-twinmos` | `<verification-code>` | GitHub organization verification |

---

## 4. DNSSEC

| Setting | Value |
|:---|:---|
| **Status** | Enabled |
| **Algorithm** | ECDSA Curve P-256 with SHA-256 |
| **Key Type** | ZSK + KSK |

**Enable in Cloudflare:**
1. DNS -> Settings -> DNSSEC
2. Click "Enable DNSSEC"
3. Copy DS record to registrar (Namecheap)

---

## 5. Domain Security

### 5.1 Registrar Lock

| Domain | Status |
|:---|:---|
| `twinmos.com` | Locked |
| `twinmos.net` | Locked |
| `twinmos.org` | Locked |

### 5.2 WHOIS Privacy

| Domain | Privacy |
|:---|:---|
| `twinmos.com` | Enabled (Cloudflare WHOIS redaction) |
| `twinmos.net` | Enabled |
| `twinmos.org` | Enabled |

### 5.3 Transfer Protection

- Auth codes stored in 1Password
- Transfer lock enabled on all domains
- Email notifications for transfer requests

---

## 6. Change Management

### 6.1 DNS Change Process

1. Create change request in project tracker
2. Document current and new values
3. Peer review by Tech Lead
4. Apply during maintenance window
5. Verify with `dig` and `nslookup`
6. Monitor for 24 hours

### 6.2 Emergency Changes

- Tech Lead can bypass process for security incidents
- All emergency changes documented within 24 hours
- Post-incident review scheduled

---

## 7. Monitoring

| Check | Tool | Frequency |
|:---|:---|:---|
| DNS resolution | UptimeRobot | Every 5 minutes |
| Propagation | whatsmydns.net | After changes |
| TTL compliance | `dig +trace` | Monthly |
| Expiry | Namecheap API | Weekly |

---

## 8. Change Log

| Version | Date | Author | Changes |
|:---|:---|:---|:---|
| 1.0 | 2026-05-01 | DevOps Lead | Initial release |

---

## 9. Sign-off

| Role | Name | Date | Signature |
|:---|:---|:---|:---|
| DevOps Lead | | | |
| Tech Lead | | | |
| Project Manager | | | |
