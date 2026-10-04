# TwinMOS Website — SSL/TLS Certificate Management

| | |
|:---|:---|
| **Reference** | H.3-007 |
| **Priority** | P1 |
| **Status** | [M] Must-have |
| **Author** | DevOps Lead |
| **Version** | 1.0 |
| **Date** | 2026-05-01 |
| **Review Cycle** | Quarterly |

---

## 1. Purpose

This document defines the SSL/TLS certificate strategy for the TwinMOS website.

---

## 2. Certificate Inventory

| Domain | Provider | Type | Auto-Renew |
|:---|:---|:---|:---|
| `twinmos.com` | Let's Encrypt (Cloudflare) | DV | Yes |
| `www.twinmos.com` | Let's Encrypt (Cloudflare) | DV | Yes |
| `api.twinmos.com` | Let's Encrypt (Coolify) | DV | Yes |
| `*.twinmos.com` | Let's Encrypt (Coolify) | Wildcard DV | Yes |

---

## 3. TLS Configuration

### 3.1 Minimum Version

| Environment | Minimum TLS |
|:---|:---|
| Production | TLS 1.3 |
| Staging | TLS 1.2 |

### 3.2 Cipher Suites

**TLS 1.3:** TLS_AES_256_GCM_SHA384, TLS_CHACHA20_POLY1305_SHA256

**TLS 1.2 Fallback:** ECDHE-ECDSA-AES256-GCM-SHA384, ECDHE-RSA-AES256-GCM-SHA384

---

## 4. Cloudflare Certificates

### 4.1 Edge Certificates

Cloudflare auto-provisions and renews edge certificates for all proxied domains.

### 4.2 Origin Certificates

Generate origin certificate in Cloudflare SSL/TLS -> Origin Server for authenticated pulls between Cloudflare and Hetzner.

---

## 5. Coolify/Let's Encrypt

Coolify automatically requests certificates via ACME. Certificates stored in `/data/coolify/traefik/acme.json`.

Manual renewal:
```bash
ssh root@<hetzner-ip>
cd /data/coolify
 docker compose exec traefik traefik certificatesresolvers.letsencrypt.acme.tlschallenge=true
```

---

## 6. HSTS Configuration

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

Cloudflare HSTS: Enable in SSL/TLS -> Edge Certificates -> HTTP Strict Transport Security.

---

## 7. Monitoring

| Check | Tool | Frequency |
|:---|:---|:---|
| Expiry date | UptimeRobot SSL | Daily |
| Certificate chain | SSL Labs | Monthly |
| HSTS header | curl -I | Weekly |

**Alert Thresholds:**
- 30 days to expiry: Warning
- 7 days to expiry: Critical
- Expired: Emergency

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
