# TwinMOS Website — WAF Rule Configuration

| Document Attribute | Value |
|---|---|
| **Document ID** | TWN-OPS-2026-005 |
| **Version** | 1.0.0 |
| **Status** | Draft |
| **Author** | Unisoft Technologies Security Team |
| **Owner** | DevOps Lead / Security Engineer |
| **Review Date** | 2026-11-01 |
| **Classification** | Confidential — Security Sensitive |
| **Related Documents** | TWN-SEC-2026-001 (Security Architecture §4), TWN-SEC-2026-010 (STRIDE Threat Model — T-PUB-01,05,06; T-CMS-03), TWN-SEC-2026-011 (Security Controls Catalog — SC-5, SC-7, SI-3), TWN-OPS-2026-006 (DDoS Mitigation Plan), TWN-OPS-2026-002 (Vulnerability Management) |
| **Compliance Mapping** | OWASP Top 10:2021, PCI DSS 4.0 Req 6.4, ISO/IEC 27001:2022 A.8.20, NIST SP 800-53 SC-5, SC-7 |
| **Synchronized With** | BRD v3.0, Tech Stack v1.1 |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [WAF Platform Architecture](#2-waf-platform-architecture)
3. [Cloudflare WAF — Managed Rulesets](#3-cloudflare-waf--managed-rulesets)
4. [Cloudflare WAF — Custom Rules](#4-cloudflare-waf--custom-rules)
5. [Rate Limiting Rules](#5-rate-limiting-rules)
6. [Bot Management Configuration](#6-bot-management-configuration)
7. [NGINX / ModSecurity CRS Configuration](#7-nginx--modsecurity-crs-configuration)
8. [WAF Bypass Prevention](#8-waf-bypass-prevention)
9. [Exception and Allowlist Management](#9-exception-and-allowlist-management)
10. [False Positive Handling and Tuning](#10-false-positive-handling-and-tuning)
11. [Monitoring and Alerting](#11-monitoring-and-alerting)
12. [WAF Rule Governance](#12-waf-rule-governance)
13. [Appendix A — Cloudflare WAF Expression Reference](#appendix-a--cloudflare-waf-expression-reference)
14. [Appendix B — CRS Rule Group Reference](#appendix-b--crs-rule-group-reference)

---

## 1. Executive Summary

This document defines the complete **Web Application Firewall (WAF) rule configuration** for the TwinMOS corporate website platform. The WAF is the primary application-layer defense against common web attacks including SQL injection, Cross-Site Scripting (XSS), path traversal, and automated bot attacks.

### 1.1 WAF Architecture Summary

TwinMOS implements a **two-layer WAF** architecture:

| Layer | Technology | Responsibility | Traffic Coverage |
|---|---|---|---|
| **Layer 1 — Edge WAF** | Cloudflare WAF (managed + custom rules) | Primary protection; all internet traffic | 100% of requests before reaching origin |
| **Layer 2 — Origin WAF** | NGINX + ModSecurity CRS 4.x | Defense-in-depth; catches Cloudflare bypass attempts | Traffic reaching Hetzner origin server |

This defense-in-depth approach ensures that even if an attacker bypasses Cloudflare (e.g., direct origin IP discovery), the NGINX-level ModSecurity ruleset provides a second line of defense.

### 1.2 WAF Coverage by OWASP Top 10

| OWASP Category | Primary WAF Defense | Secondary Defense |
|---|---|---|
| A01 Broken Access Control | Cloudflare custom rules (path restriction) | NGINX access controls |
| A02 Cryptographic Failures | N/A (TLS enforced at Cloudflare) | HTTPS-only redirect |
| A03 Injection (SQLi, etc.) | Cloudflare OWASP Ruleset + Custom | ModSecurity CRS SQLi rules |
| A04 Insecure Design | Application-level | N/A |
| A05 Security Misconfiguration | Cloudflare security headers | NGINX security headers |
| A06 Vulnerable Components | Dependency scanning (TWN-OPS-2026-004) | ModSecurity virtual patching |
| A07 Auth Failures | Cloudflare rate limiting (login endpoints) | Application lockout |
| A08 Data Integrity Failures | SRI + CSP (TWN-SEC-2026-005) | N/A |
| A09 Logging Failures | Cloudflare WAF event logging | NGINX access log |
| A10 SSRF | Cloudflare custom rules | ModSecurity SSRF rules |

---

## 2. WAF Platform Architecture

### 2.1 Traffic Flow

```
[ Internet User ]
      │ HTTPS
      ▼
[ Cloudflare Edge ]
  ├─ DDoS Mitigation (automatic)
  ├─ WAF Managed Rulesets (OWASP, Cloudflare Managed)
  ├─ WAF Custom Rules (TwinMOS-specific)
  ├─ Rate Limiting Rules
  ├─ Bot Management
  └─ SSL Termination
      │ Origin HTTPS (Authenticated Origin Pull)
      ▼
[ Hetzner VPS — NGINX Reverse Proxy ]
  ├─ ModSecurity CRS 4.x (second WAF layer)
  ├─ Security Headers injection
  └─ Rate limiting (nginx-limit-req)
      │
      ▼
[ Application: Astro / Strapi / PostgreSQL ]
```

### 2.2 WAF Mode Configuration

| Layer | Mode | Reason |
|---|---|---|
| Cloudflare Managed Rules | **Block** | High-confidence ruleset; low false positive rate |
| Cloudflare OWASP Rules | **Block** (Paranoia Level 2) | Balanced detection/false positive ratio for corporate site |
| Cloudflare Custom Rules | **Block** | TwinMOS-specific, manually vetted |
| Cloudflare Rate Limiting | **Block** (after threshold) | Automated attack prevention |
| ModSecurity CRS | **Detection Mode** initially → **Enforcement** after 2-week tuning | Prevent false positives on go-live |

---

## 3. Cloudflare WAF — Managed Rulesets

### 3.1 Enabled Managed Rulesets

| Ruleset | Status | Paranoia Level | Notes |
|---|---|---|---|
| **Cloudflare Managed Rules** | ✅ Enabled — Block | N/A | Cloudflare's proprietary threat intelligence rules |
| **OWASP Core Ruleset** | ✅ Enabled — Block | Level 2 (Balanced) | OWASP ModSecurity CRS ported to Cloudflare |
| **Cloudflare Exposed Credentials** | ✅ Enabled — Block | N/A | Detects leaked credentials in requests |
| **Cloudflare Free Managed Rules** | ✅ Enabled — Block | N/A | Basic attack protection |

### 3.2 OWASP Ruleset Configuration

| Setting | Value | Rationale |
|---|---|---|
| **Paranoia Level** | 2 | Level 1 may miss attacks; Level 3+ generates excessive false positives for legitimate Strapi API queries |
| **Score Threshold** | 25 (Block at 25+) | Anomaly scoring threshold; individual rule violations accumulate |
| **Action** | Block (return 403) | Terminate malicious requests |

### 3.3 Ruleset Exclusions

The following managed rules are overridden to prevent false positives with Strapi API JSON payloads:

| Rule ID | Rule Name | Override | Justification |
|---|---|---|---|
| `949110` | OWASP Anomaly Score Exceeded (inbound) | Raise score threshold for `/api/*` path | Strapi JSON queries can trigger false positives at score 25 |
| `920420` | Request Content-Type not allowed | Add `application/json` to allowed list | Strapi API requires JSON content-type |
| `942130` | SQL Injection Attack (Anomaly) | Exclude `/api/products?filters*` | Product filter parameters pattern-match SQLi rules; safe (parameterized queries) |

Exclusions are path-scoped and logged even when excluded (not silently bypassed).

---

## 4. Cloudflare WAF — Custom Rules

Custom rules applied in priority order (lower number = higher priority):

### Rule CF-001 — Admin Interface IP Restriction

```
Expression:
  (http.request.uri.path matches "^/admin" or 
   http.request.uri.path matches "^/api/admin") and
  not ip.src in {<UNISOFT_OFFICE_IP>/32 <TWINMOS_DUBAI_IP>/32 <TWINMOS_INDIA_IP>/32}

Action: Block
Priority: 1
Description: Restrict Strapi admin UI and admin API to authorized IPs only
Response: 403 — custom "Access Restricted" page
Log: Yes
```

### Rule CF-002 — Block XML External Entity (XXE) Injection

```
Expression:
  http.request.body.raw contains "<!ENTITY" or
  http.request.body.raw contains "SYSTEM" and 
  http.request.body.raw contains "file://"

Action: Block
Priority: 2
Description: Block XML External Entity injection attempts
Log: Yes
```

### Rule CF-003 — Block Server-Side Request Forgery (SSRF) Patterns

```
Expression:
  http.request.body.raw matches r"(localhost|127\.0\.0\.1|169\.254\.|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.).*"

Action: Block
Priority: 3
Description: Block SSRF attempts targeting internal network addresses
Log: Yes
```

### Rule CF-004 — Block Path Traversal Attempts

```
Expression:
  http.request.uri.path contains "../" or
  http.request.uri.path contains "..%2F" or
  http.request.uri.path contains "%2e%2e%2f" or
  http.request.uri.path contains "%252e%252e" or
  http.request.body.raw contains "../"

Action: Block
Priority: 4
Description: Block path traversal / directory traversal attacks
Log: Yes
```

### Rule CF-005 — Block Common Exploit Scanner Signatures

```
Expression:
  http.user_agent matches r"(?i)(nikto|nessus|openvas|masscan|zgrab|nuclei|sqlmap|dirbuster|gobuster|ffuf|wfuzz|burpsuite|acunetix|netsparker|w3af|skipfish|havij)"

Action: Block
Priority: 5
Description: Block known vulnerability scanner user-agents
Log: Yes
```

### Rule CF-006 — Block Headless Browser / Automation Tools (non-bot management)

```
Expression:
  http.user_agent matches r"(?i)(phantomjs|headless|selenium|webdriver|puppeteer|playwright)" and
  not ip.src in $known_monitoring_ips

Action: Challenge (Cloudflare Turnstile)
Priority: 6
Description: Challenge headless browser signatures; allow monitoring tools via IP allowlist
Log: Yes
```

### Rule CF-007 — Geo-Block High-Risk Regions (configurable)

```
Expression:
  ip.geoip.country in {"XX" "YY"}  /* Country codes configured per threat intelligence */

Action: Challenge (JS challenge)
Priority: 7
Description: Challenge traffic from regions with disproportionately high bot/attack ratio; configurable by Security Lead
Log: Yes
```

Note: Geo-blocking uses JS Challenge (not hard block) to allow legitimate users to self-identify. Country list reviewed quarterly based on Cloudflare analytics. Default: no countries hard-blocked; challenge applied based on threat data.

### Rule CF-008 — Block Requests Without User-Agent

```
Expression:
  not http.user_agent exists or http.user_agent == ""

Action: Block
Priority: 8
Description: Automated attack tools frequently omit User-Agent; legitimate browsers always include it
Log: Yes
```

### Rule CF-009 — Block Sensitive File Extensions

```
Expression:
  http.request.uri.path matches r"\.(env|git|svn|htaccess|htpasswd|bak|backup|config|cfg|ini|log|sql|db|sqlite|key|pem|crt|p12|pfx)$"

Action: Block
Priority: 9
Description: Block direct requests for sensitive file extensions that should never be publicly accessible
Log: Yes
```

### Rule CF-010 — Block GraphQL Introspection in Production

```
Expression:
  http.request.uri.path eq "/graphql" and
  http.request.body.raw contains "__schema" or
  http.request.body.raw contains "IntrospectionQuery"

Action: Block
Priority: 10
Description: Block GraphQL introspection queries in production (disables schema enumeration)
Log: Yes
```

---

## 5. Rate Limiting Rules

### 5.1 Rate Limiting Rule Table

| Rule ID | Endpoint | Threshold | Window | Action | Scope |
|---|---|---|---|---|---|
| RL-001 | `/admin/auth/local` (CMS login) | 5 requests | 5 minutes | Block for 30 min | Per IP |
| RL-002 | `/api/auth/local` (API auth) | 10 requests | 5 minutes | Block for 15 min | Per IP |
| RL-003 | `/auth/callback` (OAuth callback) | 20 requests | 10 minutes | Block for 15 min | Per IP |
| RL-004 | `/api/contact-submissions` (Contact form) | 5 requests | 10 minutes | Block for 60 min | Per IP |
| RL-005 | `/api/search` (Site search) | 60 requests | 1 minute | Challenge | Per IP |
| RL-006 | `/partner/*` (Partner Portal all) | 100 requests | 1 minute | Block for 5 min | Per authenticated user |
| RL-007 | `/api/*` (General API) | 200 requests | 1 minute | Challenge → Block | Per IP |
| RL-008 | `/checkout/*` (E-commerce, P3) | 20 requests | 10 minutes | Block for 60 min | Per IP |
| RL-009 | `/api/auth/password-reset` (Password reset) | 3 requests | 60 minutes | Block for 24 hours | Per email/IP |
| RL-010 | `/api/upload` (File upload) | 10 requests | 60 minutes | Block for 60 min | Per authenticated user |

### 5.2 Rate Limiting Configuration Detail

**Cloudflare Rate Limiting Expression Example (RL-001 — Admin Login):**

```
Expression:
  http.request.uri.path eq "/admin/auth/local" and
  http.request.method eq "POST"

Characteristics:
  - IP address (X-Forwarded-For first IP for Cloudflare proxied traffic)

Threshold: 5 requests per 300 seconds

Mitigation:
  Action: Block
  Duration: 1800 seconds (30 minutes)
  Response: 429 with JSON body: {"error": "Too many login attempts. Please try again later."}
```

### 5.3 Application-Level Rate Limiting (NGINX + middleware)

As a defense-in-depth measure, rate limiting is also implemented at the application layer using `nginx-limit-req` and `@upstash/ratelimit` middleware in Strapi/Better Auth:

```nginx
# nginx.conf rate limiting zones
limit_req_zone $binary_remote_addr zone=login:10m rate=1r/m;
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=search:10m rate=1r/s;
limit_req_zone $binary_remote_addr zone=upload:10m rate=2r/m;

# Apply to location blocks
location /admin/auth/local {
    limit_req zone=login burst=3 nodelay;
    limit_req_status 429;
    # ...
}
```

---

## 6. Bot Management Configuration

### 6.1 Cloudflare Bot Management

TwinMOS uses Cloudflare's automated Bot Management (available on Business/Enterprise plans) or Bot Fight Mode (on lower plans):

| Bot Category | Action | Rationale |
|---|---|---|
| **Verified Good Bots** (Googlebot, Bingbot) | Allow | Search engine crawling benefits SEO |
| **Likely Automated** (score 1–29) | Challenge (Managed Challenge) | Weed out unsophisticated bots |
| **Likely Human** (score 30+) | Allow | Normal human traffic |
| **Known Attack Tools** (score 0) | Block immediately | Clear malicious automation |

### 6.2 Custom Bot Rules

```
# Allow TwinMOS monitoring (UptimeRobot, custom health checks)
Expression:
  ip.src in $monitoring_ip_list and
  http.request.uri.path eq "/health"
Action: Skip (bypass all WAF rules)

# Challenge shopping bots on product pages (P3)
Expression:
  cf.bot_management.score lt 30 and
  http.request.uri.path matches "^/products/"
Action: Managed Challenge
```

### 6.3 Honeypot Endpoint

A honeypot URL (`/wp-admin`) is configured to immediately block IPs that request WordPress-specific paths (TwinMOS does not use WordPress):

```
Expression:
  http.request.uri.path matches "^/wp-" or
  http.request.uri.path matches "^/wordpress" or
  http.request.uri.path eq "/xmlrpc.php"

Action: Block + Add IP to temporary blocklist (24 hours)
Log: Yes — honeypot triggered
```

---

## 7. NGINX / ModSecurity CRS Configuration

### 7.1 ModSecurity Base Configuration

```nginx
# modsecurity.conf key settings

# Enable ModSecurity
SecRuleEngine On  # Initially DetectionOnly for tuning; change to On after 2 weeks

# Request body handling
SecRequestBodyAccess On
SecRequestBodyLimit 13107200   # 12.5 MB
SecRequestBodyNoFilesLimit 131072   # 128 KB for JSON/form bodies
SecRequestBodyInMemoryLimit 131072

# Response body
SecResponseBodyAccess Off  # Disable for performance (Cloudflare handles response inspection)

# Audit log
SecAuditLog /var/log/modsec_audit.log
SecAuditLogParts ABIJDEFHZ
SecAuditLogType Serial
SecAuditEngine RelevantOnly

# Default action
SecDefaultAction "phase:1,log,auditlog,pass"
SecDefaultAction "phase:2,log,auditlog,pass"

# Debug log (disable in production; enable for tuning only)
SecDebugLog /var/log/modsec_debug.log
SecDebugLogLevel 0  # 0=Off, 9=Maximum
```

### 7.2 CRS Configuration

```nginx
# crs-setup.conf key settings

# Paranoia Level (1=Low, 4=High)
SecAction \
  "id:900000, \
   phase:1, \
   nolog, \
   pass, \
   t:none, \
   setvar:tx.paranoia_level=2"

# Anomaly scoring thresholds
SecAction \
  "id:900110, \
   phase:1, \
   nolog, \
   pass, \
   t:none, \
   setvar:tx.inbound_anomaly_score_threshold=10, \
   setvar:tx.outbound_anomaly_score_threshold=4"

# Allowed HTTP request methods
SecAction \
  "id:900200, \
   phase:1, \
   nolog, \
   pass, \
   t:none, \
   setvar:'tx.allowed_methods=GET HEAD POST PUT PATCH DELETE OPTIONS'"

# Allowed Content-Types
SecAction \
  "id:900220, \
   phase:1, \
   nolog, \
   pass, \
   t:none, \
   setvar:'tx.allowed_request_content_type=application/x-www-form-urlencoded|multipart/form-data|text/xml|application/xml|application/soap+xml|application/json|application/vnd.api+json'"

# Maximum allowed arguments
SecAction \
  "id:900300, \
   phase:1, \
   nolog, \
   pass, \
   t:none, \
   setvar:tx.max_num_args=128, \
   setvar:tx.arg_name_length=150, \
   setvar:tx.arg_length=8000, \
   setvar:tx.total_arg_length=64000"

# Maximum file upload size
SecAction \
  "id:900400, \
   phase:1, \
   nolog, \
   pass, \
   t:none, \
   setvar:tx.max_file_size=10485760, \
   setvar:tx.combined_file_sizes=10485760"
```

### 7.3 Custom ModSecurity Rules

```apache
# TwinMOS custom ModSecurity rules
# File: /etc/nginx/modsec/twinmos-custom-rules.conf

# Rule 100001: Block SQL injection in common CMS parameters
SecRule ARGS:filters "@detectSQLi" \
  "id:100001, \
   phase:2, \
   block, \
   log, \
   msg:'SQL Injection attempt in filter parameter', \
   tag:'TWINMOS-CUSTOM', \
   severity:'CRITICAL'"

# Rule 100002: Block XSS in comment/text fields
SecRule ARGS:comment|ARGS:message|ARGS:description "@detectXSS" \
  "id:100002, \
   phase:2, \
   block, \
   log, \
   msg:'XSS attempt in text field', \
   tag:'TWINMOS-CUSTOM', \
   severity:'CRITICAL'"

# Rule 100003: Block null byte injection
SecRule ARGS "@contains \x00" \
  "id:100003, \
   phase:2, \
   block, \
   log, \
   msg:'Null byte injection attempt', \
   tag:'TWINMOS-CUSTOM', \
   severity:'HIGH'"

# Rule 100004: Block requests with suspicious User-Agent
SecRule REQUEST_HEADERS:User-Agent \
  "(?i)(nikto|sqlmap|nessus|w3af|acunetix|netsparker|dirbuster|masscan|zgrab)" \
  "id:100004, \
   phase:1, \
   block, \
   log, \
   msg:'Known attack tool User-Agent detected', \
   tag:'TWINMOS-CUSTOM', \
   severity:'CRITICAL'"

# Rule 100005: Allow Strapi admin ONLY from allowed IPs
SecRule REMOTE_ADDR "!@ipMatch 10.0.0.0/8,172.16.0.0/12,192.168.0.0/16" \
  "id:100005, \
   phase:1, \
   chain, \
   log, \
   msg:'Admin path access from unauthorized IP'"
  SecRule REQUEST_URI "@beginsWith /admin" \
    "block"

# Rule 100006: Block HTTP TRACE and TRACK methods
SecRule REQUEST_METHOD "^(?:TRACE|TRACK)$" \
  "id:100006, \
   phase:1, \
   block, \
   log, \
   msg:'HTTP TRACE/TRACK method blocked', \
   tag:'TWINMOS-CUSTOM'"

# Rule 100007: Block RFI (Remote File Inclusion) attempts
SecRule ARGS "@rx (https?|ftp|php)://(?!twinmos\.com|localhost)" \
  "id:100007, \
   phase:2, \
   block, \
   log, \
   msg:'Remote File Inclusion attempt', \
   tag:'TWINMOS-CUSTOM', \
   severity:'CRITICAL'"
```

---

## 8. WAF Bypass Prevention

### 8.1 Bypass Technique Mitigation Matrix

| Bypass Technique | Description | TwinMOS Mitigation |
|---|---|---|
| **Encoding bypass** | URL-encode, double-encode, Unicode-encode attack payloads | CRS normalization transformations decode before rule matching; multiple encoding transforms applied |
| **HTTP parameter pollution** | Duplicate parameters with different values to confuse parsers | ModSecurity `SecRule ARGS` matches all parameter values, not just first |
| **Case variation** | `SELECT` vs `sElEcT` to evade pattern matching | CRS rules use `t:lowercase` transformation; all matching case-insensitive |
| **Comment injection (SQLi)** | `SEL/*comment*/ECT` — split keywords with SQL comments | CRS uses `@detectSQLi` operator (libinjection) which handles comment stripping |
| **Chunked transfer encoding** | Split attack payload across HTTP chunks | NGINX reassembles chunks before ModSecurity inspection |
| **JSON vs form encoding** | WAF rules that only check form parameters miss JSON body attacks | ModSecurity `SecRequestBodyAccess On` + JSON parsing enabled in CRS 4.x |
| **Cloudflare IP spoofing** | Attacker tries to forge `CF-Connecting-IP` to bypass IP restrictions | Cloudflare ignores client-supplied CF- headers; only Cloudflare network sets them |
| **Origin IP direct access** | Attacker discovers Hetzner origin IP and bypasses Cloudflare | Cloudflare Authenticated Origin Pull; Hetzner firewall blocks non-Cloudflare IPs |
| **TLS fingerprinting (JA3)** | Attacker uses legitimate browser TLS fingerprint to bypass bot detection | Cloudflare Bot Management uses behavioral analysis beyond TLS fingerprint |
| **Long payload fragmentation** | Huge payloads to exceed WAF inspection limits | ModSecurity `SecRequestBodyLimit` set; oversized requests blocked (413) |

### 8.2 Cloudflare Origin IP Concealment

Critical controls to prevent origin IP discovery (which would allow WAF bypass):

1. **Never publish origin IP in DNS** — `twinmos.com` A record points to Cloudflare IPs only
2. **Historical DNS scan prevention** — Check SecurityTrails/Shodan for historical IP leaks before deployment; change Hetzner IP if leaked
3. **No direct email from origin** — All outbound email via Postmark (no MX records revealing server IP)
4. **Authenticated Origin Pull** — Hetzner NGINX validates Cloudflare client certificate; refuses non-Cloudflare connections
5. **Hetzner firewall** — Deny all inbound HTTPS except from Cloudflare IP ranges (updated automatically via Cloudflare API)

### 8.3 Authenticated Origin Pull Configuration

```nginx
# nginx.conf — Cloudflare Authenticated Origin Pull
server {
    listen 443 ssl;
    
    # Cloudflare Origin Certificate
    ssl_certificate /etc/ssl/cloudflare/twinmos-origin.pem;
    ssl_certificate_key /etc/ssl/cloudflare/twinmos-origin.key;
    
    # Require Cloudflare client certificate (Authenticated Origin Pull)
    ssl_client_certificate /etc/ssl/cloudflare/cloudflare-authenticated-pull.crt;
    ssl_verify_client on;
    
    # Reject requests without valid Cloudflare cert
    if ($ssl_client_verify != SUCCESS) {
        return 403 "Direct origin access not permitted";
    }
}
```

---

## 9. Exception and Allowlist Management

### 9.1 Exception Categories

| Category | Example | Handling |
|---|---|---|
| **Legitimate API traffic** | Strapi API JSON body triggers SQLi rule | Path-scoped rule exclusion in CRS |
| **Monitoring tools** | UptimeRobot health checks | IP allowlist in Cloudflare (bypass all rules) |
| **Search engine bots** | Googlebot, Bingbot | Verified bot allowlist in Cloudflare |
| **Admin access** | TwinMOS staff admin access | IP allowlist in CF-001 custom rule |
| **Third-party integrations** | Stripe webhook | IP + path allowlist (Stripe IP ranges) |
| **CDN pre-fetching** | Legitimate CDN origin pull | HTTP header check |

### 9.2 Permanent Allowlist Entries

| Entry Type | Value | Purpose | Review Date |
|---|---|---|---|
| IP Allowlist | Unisoft office static IP/32 | Admin access (CF-001) | Annual |
| IP Allowlist | TwinMOS Dubai office IP/32 | Admin access (CF-001) | Annual |
| IP Allowlist | UptimeRobot IP ranges | Monitoring (health checks) | Annual |
| IP Allowlist | Stripe webhook IP ranges | Payment webhooks (P3) | Annual |
| Bot Allowlist | Googlebot, Bingbot, Applebot | SEO crawling | Reviewed automatically |
| Path Allowlist | `/health` | Monitoring endpoint; bypass WAF | Review on architecture change |

### 9.3 Exception Request Process

All WAF exceptions (rule disablements, path exclusions, IP allowlisting) require:

1. **Request** — DevOps or Developer documents the false positive with HTTP request details
2. **Assessment** — Security Lead determines if legitimate false positive or attack refinement
3. **Scope minimization** — Exception scoped to minimum path, parameter, or IP
4. **Implementation** — Added to Cloudflare or ModSecurity configuration via PR
5. **Review date** — Maximum 6-month review cycle for all exceptions
6. **Documentation** — Recorded in WAF Exception Register (maintained by Security Lead)

---

## 10. False Positive Handling and Tuning

### 10.1 False Positive Investigation Process

When a legitimate request is blocked by the WAF:

```
1. User reports block → DevOps captures:
   - Ray ID (from Cloudflare error page)
   - Timestamp
   - URL and HTTP method
   - Request body (if POST/PUT)

2. Security Lead reviews in Cloudflare WAF event log:
   - Which rule triggered
   - Anomaly score breakdown
   - Request details

3. Determine root cause:
   - Legitimate content triggering rule? → Add exception
   - Attack-like pattern in legitimate data? → Refine application input
   - WAF over-classification? → Adjust CRS paranoia level or rule threshold

4. Implement and test exception in staging first

5. Deploy to production with monitoring for 24 hours
```

### 10.2 CRS Paranoia Level Tuning

| Scenario | Action |
|---|---|
| >5 false positives per week | Reduce paranoia level by 1 or add targeted exclusions |
| Zero false positives for 30 days | Consider increasing paranoia level by 1 |
| New Strapi major version | Re-run 2-week tuning period in detection mode |
| New API endpoint introduced | Add to WAF test suite; monitor for 1 week after launch |

### 10.3 WAF Tuning Log

The Security Lead maintains a WAF tuning log documenting:
- All rule exclusions applied
- Justification for each exclusion
- Date applied and review date
- False positive rate trend per rule family

---

## 11. Monitoring and Alerting

### 11.1 WAF Monitoring Metrics

| Metric | Threshold | Alert Type | Recipient |
|---|---|---|---|
| Total WAF blocks per hour | Baseline + 500% | Anomaly alert | Security Lead, DevOps |
| Admin path block (CF-001) | Any trigger | Immediate alert | Security Lead |
| Critical WAF rule triggers | Any trigger | Immediate alert | Security Lead |
| Rate limit triggers on login | >10/hour from single subnet | Alert | Security Lead |
| New country in top 10 traffic sources | Any new country | Weekly report | Security Lead |
| ModSecurity audit log errors | Any | Alert | DevOps |

### 11.2 Cloudflare WAF Logging

Cloudflare WAF events logged to:
1. **Cloudflare dashboard** — Real-time event view (7-day retention on free/business plan)
2. **Cloudflare Logpush** — Logs shipped to Hetzner object storage or R2 bucket (90-day retention)
3. **SIEM integration** — Cloudflare logs aggregated into central log store for correlation

Log fields captured per WAF event:
- Timestamp (UTC)
- Client IP address
- Ray ID
- URL and HTTP method
- WAF rule ID and action
- Rule description and category
- Anomaly score (if OWASP ruleset)
- Country (GeoIP)
- Bot score

### 11.3 ModSecurity Alert Configuration

```nginx
# Audit log entries sent to log aggregation pipeline
SecAuditLog /var/log/modsec_audit.log
SecAuditLogParts ABIJDEFHZ

# High-severity blocks generate immediate alerts via logwatch/syslog
SecAuditLogRelevantStatus "^(?:5|4(?!04))"
```

ModSecurity blocks (HTTP 403) generate log entries that are:
- Written to `/var/log/nginx/security.log`
- Shipped to central log aggregator
- Alerting triggered on >10 blocks/minute from single IP

---

## 12. WAF Rule Governance

### 12.1 Change Management

All WAF rule changes follow the configuration change control process (TWN-SEC-2026-011 CM-3):

| Change Type | Process | Approval | Testing Required |
|---|---|---|---|
| New custom rule | PR → staging test → Security Lead approval → production | Security Lead | Staging test with malicious + legitimate payloads |
| Managed ruleset update | Cloudflare auto-update + Security Lead review | Security Lead review within 72 hours | Monitor for false positives 24 hours |
| Emergency block (active attack) | Immediate → document within 4 hours | Security Lead verbal → written post-facto | Monitor for collateral impact |
| Rule removal | PR → Security Lead approval | Security Lead | Confirm no active protection gap |
| Exception addition | See Section 9.3 | Security Lead | Confirm block resolved; confirm attack still blocked via alternative |

### 12.2 Review Schedule

| Review | Frequency | Owner | Output |
|---|---|---|---|
| WAF event log review | Weekly | DevOps + Security Lead | False positive identification, attack trend analysis |
| Custom rule effectiveness review | Quarterly | Security Lead | Rule remove/refine/strengthen decisions |
| Allowlist and exception review | Semi-annual | Security Lead | Remove stale exceptions; confirm IP allowlists current |
| Full WAF configuration audit | Annual | External security team (post-pentest) | Findings incorporated into rule updates |
| CRS version update | On CRS release | DevOps | Test in staging; deploy with monitoring |

### 12.3 WAF Rule Testing

Before any new rule is deployed to production:

```bash
# Test using OWASP ZAP or curl:

# 1. Confirm rule blocks the target attack pattern
curl -X POST https://staging.twinmos.com/api/contact \
  -H "Content-Type: application/json" \
  -d '{"message": "1; DROP TABLE users; --"}' \
  # Expected: 403 WAF block

# 2. Confirm legitimate similar requests still pass
curl -X POST https://staging.twinmos.com/api/contact \
  -H "Content-Type: application/json" \
  -d '{"message": "I need information about DRAM price drops"}' \
  # Expected: 200 OK (passes WAF)

# 3. Verify WAF event log contains correct rule information
# Check Cloudflare WAF events or ModSecurity audit log
```

---

## Appendix A — Cloudflare WAF Expression Reference

### A.1 Common Expression Fields

| Field | Description | Example |
|---|---|---|
| `http.request.uri.path` | URL path | `"/admin/auth/local"` |
| `http.request.uri.query` | Query string | `"search=test"` |
| `http.request.method` | HTTP method | `"POST"` |
| `http.request.body.raw` | Raw request body | `"<ENTITY"` |
| `http.request.headers["x-forwarded-for"]` | Client IP header | `"1.2.3.4"` |
| `ip.src` | Client IP address | `1.2.3.4/32` |
| `ip.geoip.country` | Country code | `"US"` |
| `http.user_agent` | User-Agent header | `"Googlebot"` |
| `cf.bot_management.score` | Bot score (0–99) | `< 30` |
| `cf.threat_score` | Cloudflare threat score | `> 50` |

### A.2 Common Expression Operators

| Operator | Description |
|---|---|
| `eq` | Equals |
| `ne` | Not equals |
| `contains` | String contains substring |
| `matches` | Regex match |
| `in` | Value in set |
| `not` | Logical NOT |
| `and` | Logical AND |
| `or` | Logical OR |
| `lt`, `gt`, `le`, `ge` | Numeric comparison |

---

## Appendix B — CRS Rule Group Reference

| Rule Range | Category | Covers |
|---|---|---|
| 901000–901999 | Initialization | CRS setup and variable initialization |
| 910000–910999 | IP Reputation | Known malicious IP checks |
| 911000–911999 | HTTP Policy | Method, content-type, protocol checks |
| 912000–912999 | DoS Protection | Request limits, crawlers |
| 913000–913999 | Scanner Detection | Vulnerability scanner signatures |
| 920000–920999 | Protocol Enforcement | HTTP conformance checks |
| 921000–921999 | Protocol Attack | HTTP Request Smuggling, Response Splitting |
| 930000–930999 | LFI (Local File Inclusion) | Path traversal, file access |
| 931000–931999 | RFI (Remote File Inclusion) | External URL inclusions |
| 932000–932999 | RCE (Remote Code Execution) | Shell injection, OS commands |
| 933000–933999 | PHP Attacks | PHP injection patterns |
| 934000–934999 | Node.js Attacks | Node.js-specific attack patterns |
| 941000–941999 | XSS (Cross-Site Scripting) | Script injection, event handlers |
| 942000–942999 | SQLi (SQL Injection) | SQL keywords, operators, functions |
| 943000–943999 | Session Fixation | Cookie injection, session manipulation |
| 944000–944999 | Java Attacks | Java deserialization, Spring attacks |
| 945000–945999 | Trojan, Backdoor | Webshell signatures |
| 949000–949999 | Blocking Evaluation | Anomaly score threshold evaluation |
| 950000–951999 | Data Leakage | Response-side leak detection (if enabled) |
| 980000–980999 | Reporting | Inbound/outbound score reporting |

---

*Document ID: TWN-OPS-2026-005 | Version 1.0.0 | Classification: Confidential — Security Sensitive | © 2026 TwinMOS Technologies. All rights reserved.*
