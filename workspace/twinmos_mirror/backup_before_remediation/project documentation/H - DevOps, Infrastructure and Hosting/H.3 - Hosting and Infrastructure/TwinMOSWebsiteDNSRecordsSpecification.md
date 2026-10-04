# TwinMOS Website — DNS Records Specification

**Document ID:** H.3-005  
**Version:** 1.0  
**Status:** Active  
**Owner:** Tech Lead  
**Last Updated:** 2026-05-01  
**Related:** TwinMOSWebsiteCloudflareConfigurationGuide.md · TwinMOSWebsiteDNSCutoverPlan.md · TwinMOSWebsiteSSLCertificateRenewal_Runbook.md

---

## 1. Domain Portfolio

| Domain | Registrar | Expiry | Purpose | Status |
|--------|-----------|--------|---------|--------|
| twinmos.com | (current registrar) | (check annually) | Primary website | Active |
| twinmos.net | (current registrar) | (check annually) | Redirect shield | Active |
| twinmos.org | (current registrar) | (check annually) | Redirect shield | Active |
| twinmos.ae | Planned P3 | — | UAE regional | Reserved |
| twinmos.in | Planned P3 | — | India regional | Reserved |
| twinmos.com.sa | Planned P3 | — | KSA regional | Reserved |
| twinmos.com.bd | Planned P3 | — | Bangladesh regional | Reserved |

> All domains must have **registrar lock** and **WHOIS privacy** enabled. Transfer protection must be active. Set calendar reminders 60 days before each domain expiry.

---

## 2. DNS Provider

**Provider:** Cloudflare DNS (included in Cloudflare Pro plan)  
**Zone:** twinmos.com  
**Nameservers:** Cloudflare-assigned (e.g. `ada.ns.cloudflare.com`, `matt.ns.cloudflare.com`)  
**DNSSEC:** Enabled (DS record submitted to domain registrar)

---

## 3. Complete DNS Records — twinmos.com

### 3.1 A Records (Hetzner VPS)

> Replace `<HETZNER-PROD-IP>` with the actual Hetzner CX32 production IPv4 address.  
> Replace `<HETZNER-STAGING-IP>` with the Hetzner CX32 staging IPv4 address.  
> Replace `<HETZNER-DEV-IP>` with the Hetzner CX22 development IPv4 address.

| Name | Type | Value | TTL | CF Proxy | Purpose |
|------|------|-------|-----|----------|---------|
| `api` | A | `<HETZNER-PROD-IP>` | Auto | ✅ Yes | Strapi REST API (production) |
| `admin` | A | `<HETZNER-PROD-IP>` | Auto | ✅ Yes | Strapi Admin Panel (production) |
| `search` | A | `<HETZNER-PROD-IP>` | Auto | ✅ Yes | MeiliSearch (production) |
| `imgproxy` | A | `<HETZNER-PROD-IP>` | Auto | ✅ Yes | ImgProxy image transformation |
| `analytics` | A | `<HETZNER-PROD-IP>` | Auto | ⬜ No (DNS only) | Plausible Analytics |
| `chat` | A | `<HETZNER-PROD-IP>` | Auto | ✅ Yes | Chatwoot live chat (Phase 2) |
| `coolify` | A | `<HETZNER-PROD-IP>` | Auto | ✅ Yes | Coolify dashboard (admin access only) |
| `staging` | A | `<HETZNER-STAGING-IP>` | Auto | ✅ Yes | Staging environment |
| `staging-api` | A | `<HETZNER-STAGING-IP>` | Auto | ✅ Yes | Strapi staging API |
| `dev` | A | `<HETZNER-DEV-IP>` | Auto | ✅ Yes | Development environment |
| `dev-api` | A | `<HETZNER-DEV-IP>` | Auto | ✅ Yes | Strapi dev API |

### 3.2 CNAME Records (Cloudflare Pages)

| Name | Type | Value | TTL | CF Proxy | Purpose |
|------|------|-------|-----|----------|---------|
| `@` | CNAME | `twinmos-website.pages.dev` | Auto | ✅ Yes | Apex domain → Cloudflare Pages |
| `www` | CNAME | `twinmos-website.pages.dev` | Auto | ✅ Yes | www → Cloudflare Pages (then 301 to apex) |
| `shop` | CNAME | `twinmos-shop.pages.dev` | Auto | ✅ Yes | Medusa storefront (Phase 3) |
| `partner` | CNAME | `twinmos-partner.pages.dev` | Auto | ✅ Yes | Partner portal (Phase 2) |

> **Apex domain note:** Cloudflare supports CNAME flattening at the apex (`@`), so `twinmos.com` can point to Cloudflare Pages.

### 3.3 MX Records (Email)

Email routing is handled by Cloudflare Email Routing (free tier) which forwards to TwinMOS corporate email.

| Name | Type | Priority | Value | TTL | Purpose |
|------|------|----------|-------|-----|---------|
| `@` | MX | 22 | `route1.mx.cloudflare.net` | Auto | Primary MX (Cloudflare Email Routing) |
| `@` | MX | 56 | `route2.mx.cloudflare.net` | Auto | Secondary MX |
| `@` | MX | 31 | `route3.mx.cloudflare.net` | Auto | Tertiary MX |

**Email routing destinations (configured in Cloudflare Email Routing):**
```
info@twinmos.com        → william.chen@twinmos.com (Chairman)
sales@twinmos.com       → sales-team@twinmos.com
support@twinmos.com     → support-team@twinmos.com
devops@twinmos.com      → tech-lead@twinmos.com
dpo@twinmos.com         → dpo@twinmos.com (Data Protection Officer)
legal@twinmos.com       → legal@twinmos.com
security@twinmos.com    → security-team@twinmos.com
noreply@twinmos.com     → (outbound only — not routed inbound)
```

### 3.4 TXT Records (Verification & Authentication)

| Name | Type | Value | TTL | Purpose |
|------|------|-------|-----|---------|
| `@` | TXT | `v=spf1 include:_spf.mx.cloudflare.net ~all` | Auto | SPF email authentication |
| `_dmarc` | TXT | `v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@twinmos.com; ruf=mailto:dmarc-reports@twinmos.com; fo=1; adkim=r; aspf=r; pct=100` | Auto | DMARC policy |
| `@` | TXT | `google-site-verification=<value>` | Auto | Google Search Console |
| `@` | TXT | `MS=<value>` | Auto | Microsoft Office 365 verification (if used) |
| `_github-challenge-twinmos` | TXT | `<github-verification-token>` | Auto | GitHub organisation verification |
| `_atproto` | TXT | `did=did:plc:<value>` | Auto | Bluesky/AT Protocol verification (optional P2) |

### 3.5 DKIM Records (Resend Email Signing)

| Name | Type | Value | TTL | Purpose |
|------|------|-------|-----|---------|
| `resend._domainkey` | TXT | `v=DKIM1; k=rsa; p=<Resend-public-key>` | Auto | DKIM signing for Resend transactional email |

> Resend provides this record when you verify your domain. Configure in Resend dashboard → Domains → Add Domain → twinmos.com.

### 3.6 CAA Records (Certificate Authority Authorization)

Restricts which CAs can issue SSL certificates for twinmos.com:

| Name | Type | Flags | Tag | Value | TTL | Purpose |
|------|------|-------|-----|-------|-----|---------|
| `@` | CAA | 0 | issue | `"letsencrypt.org"` | Auto | Allow Let's Encrypt |
| `@` | CAA | 0 | issue | `"pki.goog"` | Auto | Allow Google CA |
| `@` | CAA | 0 | issuewild | `"letsencrypt.org"` | Auto | Allow wildcard from Let's Encrypt |
| `@` | CAA | 0 | iodef | `"mailto:security@twinmos.com"` | Auto | Report unauthorized cert attempts |

---

## 4. DNS Records — twinmos.net & twinmos.org

Redirect shields — all traffic to these domains should 301 to twinmos.com.

```
twinmos.net:
  @ A → <any server or Cloudflare Worker>
  Cloudflare Page Rule: twinmos.net/* → 301 → https://twinmos.com/$1

twinmos.org:
  @ A → <any server or Cloudflare Worker>
  Cloudflare Page Rule: twinmos.org/* → 301 → https://twinmos.com/$1
```

---

## 5. DNSSEC Configuration

DNSSEC prevents DNS cache poisoning attacks.

### Enable in Cloudflare:
```
Cloudflare Dashboard → twinmos.com → DNS → DNSSEC → Enable DNSSEC

Cloudflare will display:
  DS Record:
    Key Tag: <number>
    Algorithm: 13 (ECDSA P-256 with SHA-256)
    Digest Type: 2
    Digest: <hex string>
```

### Submit to domain registrar:
```
Go to domain registrar control panel
DNS Security (DNSSEC) → Add DS Record
  Enter the values from Cloudflare above
  Save

Propagation takes 24–48 hours.
```

### Verify DNSSEC:
```bash
# Verify DNSSEC is working
dig twinmos.com DS +dnssec
# Should show DS record and RRSIG

# Online verification
# https://dnssec-analyzer.verisignlabs.com/twinmos.com
```

---

## 6. Domain Security Controls

### 6.1 Registrar Lock

Ensures the domain cannot be transferred without explicit unlock:

```
Registrar control panel → Domain: twinmos.com
→ Domain lock: Enabled (Registrar Lock or EPP Lock)
→ Transfer protection: ON
→ Domain privacy / WHOIS privacy: ON (all personal data hidden from WHOIS)
```

### 6.2 Two-Factor Authentication

All registrar accounts must have 2FA (TOTP) enabled. Recovery codes stored in Bitwarden.

### 6.3 Domain Monitoring

```
UptimeRobot: DNS monitor for twinmos.com
  Alert if DNS resolution fails

Cloudflare: Domain expiry notification
  Cloudflare sends email 60/30/7 days before expiry if domain is registered through Cloudflare
  If not through Cloudflare, set manual calendar reminder
```

---

## 7. Change Management

**All DNS changes require:**
1. Tech Lead approval (no unilateral changes)
2. Document the change before making it (what record, old value → new value, reason)
3. Test immediately after: `dig <record-name>.twinmos.com <type>` from multiple locations
4. If change affects production routing, schedule during low-traffic window (01:00–03:00 UTC)

**Emergency DNS changes (during incident):**
- Can be made immediately by Tech Lead without advance notice
- Must be documented in Slack #incident within 5 minutes
- Full post-incident review within 24 hours

---

## 8. DNS Propagation Verification

After making DNS changes, verify propagation:

```bash
# Check from multiple global resolvers
dig @8.8.8.8 api.twinmos.com A          # Google DNS
dig @1.1.1.1 api.twinmos.com A          # Cloudflare DNS
dig @208.67.222.222 api.twinmos.com A   # OpenDNS

# Check Cloudflare propagation (instant — Cloudflare updates globally in ~1 min)
# External resolvers may take 1–48h depending on TTL

# Online tools:
# https://www.whatsmydns.net/#A/api.twinmos.com
# https://dnschecker.org/
```

---

## 9. DNS Record Audit Checklist (Quarterly)

- [ ] All A records point to current Hetzner IPs
- [ ] SPF record includes all authorised senders
- [ ] DMARC policy is `p=quarantine` or `p=reject`
- [ ] DKIM key for Resend is valid (verify via `dig resend._domainkey.twinmos.com TXT`)
- [ ] DNSSEC is active and valid
- [ ] No orphaned DNS records (pointing to decommissioned servers)
- [ ] All domain registrations have ≥90 days until expiry
- [ ] Registrar lock is active on all domains
- [ ] CAA records are present and correct

---

*Approved by: Chairman · Tech Lead*  
*Synchronized With: Technology Stack v1.1 §19.6*
