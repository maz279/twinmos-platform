# CUTOVER — TwinMOS Production Cutover & DNS Switch Runbook (Task T7.5.4 / UAT-01)

## 1. Executive Summary & Governance

This runbook defines the authoritative operational sequence for the final production cutover of the TwinMOS corporate platform. The cutover transitions `twinmos.com` and all global regional locales from the legacy WordPress infrastructure to the modern containerized Astro SSR + Node.js/Hono + PostgreSQL 18 stack fronted by Cloudflare Enterprise edge proxy.

**Cutover Performance Budget**: Total automated cutover & validation rehearsal duration must complete in **< 300 seconds (5 minutes)** (`tooling/ops/cutover-drill.mjs`).

### Operational Roles & Named Leads (`docs/ACCESS_MATRIX.md`)
| Role | Lead Operator | Responsibilities |
|---|---|---|
| **Incident Commander & Technical Lead** | **David Vance** (`Lead`) | Overall cutover authority, go/no-go final call, escalation management. |
| **DevOps & Infrastructure Lead** | **Tariq Al-Mansoor** (`DO`) | DNS CNAME modification, Cloudflare edge proxy activation, firewall verification. |
| **Backend & Database Lead** | **Elena Rostova** (`FS2`) | PostgreSQL 18 continuous replication, migration locks, deep health diagnostics. |
| **Storefront & Edge Lead** | **Marcus Brody** (`FS1`) | Astro SSR edge verification, sitemap warming, asset caching. |
| **Content & URL Migration Lead** | **Victoria Sterling** (`Content`) | Legacy NGINX redirect map verification (`deploy/nginx/twinmos-redirects.map`). |
| **QA, a11y & Localisation Lead** | **Tariq Al-Hashimi** (`QA`) | Real-time synthetic probe validation, RTL/9-locale sanity checks, WCAG 2.2 AA. |

---

## 2. Pre-Cutover Verification Phase (T-24h to T-1h)

### 2.1 DNS TTL Reduction (T-24h)
In the authoritative DNS provider (Cloudflare Registrar / AWS Route53):
1. Locate apex record `@` (`twinmos.com`) and `www` (`www.twinmos.com`).
2. Reduce TTL from standard `86400` (24h) to `300` (5 minutes).
3. Verify TTL propagation globally:
   ```bash
   dig +nocmd twinmos.com any +multiline +noall +answer
   # Confirm TTL field shows 300
   ```

### 2.2 Quality Gates & Readiness Check (T-2h)
Ensure all pre-requisite Quality Gates have passed with zero open Critical or High defects:
```bash
# Verify Full Regression Suite
npm run verify:ms71  # DR & Backup RTO/RPO (<900s / 15m)
npm run verify:ms72  # Observability, Prometheus, Alertmanager, Grafana
npm run verify:ms73  # Origin Protection, Portscan, MFA, Container ZAP
npm run verify:ms74  # Concurrency, Resilience, Runbooks Alignment
npm run verify:uat-01 # Full-Suite 7-Persona UAT Execution
```

### 2.3 Edge & Origin Pre-Flight (T-1h)
1. **Origin Firewall**: Validate `DOCKER-USER` chain restricts incoming traffic on ports `80` and `443` strictly to authenticated Cloudflare IP CIDRs (`deploy/edge/refresh-cf-ranges.mjs`).
2. **Cloudflare Edge SSL**: Set SSL/TLS encryption mode to **Full (Strict)**. Ensure Origin CA certificate is valid on the staging VM.
3. **Database Health**: Verify PostgreSQL 18 WAL archiving is active and replica lag is < 1s (`deploy/backup.sh`).

---

## 3. Live Cutover Execution Sequence (T-00:00 to T+15m)

### Step 1: Legacy CMS Write-Freeze (T-00:00)
- Place legacy WordPress CMS in maintenance mode to prevent new database transactions:
  ```bash
  wp maintenance-mode activate --path=/var/www/legacy-twinmos
  ```

### Step 2: Final Data Synchronization (T+01m)
- Execute final sync of any pending media assets or database deltas.
- Run database migration pre-check:
  ```bash
  npm run db:migrate --filter=@twinmos/db
  ```

### Step 3: NGINX Legacy Redirect Map Engagement (T+02m)
- Verify `deploy/nginx/twinmos-redirects.map` contains all 294+ classified legacy URLs:
  ```bash
  grep -c ";" deploy/nginx/twinmos-redirects.map
  # Must return >= 290
  ```
- Reload edge NGINX reverse proxy:
  ```bash
  sudo nginx -t && sudo systemctl reload nginx
  ```

### Step 4: DNS CNAME Switchover (T+03m)
- Tariq Al-Mansoor updates DNS records:
  - `twinmos.com` CNAME -> `twinmos.com.cdn.cloudflare.net` (Proxied: **ON**, Orange Cloud).
  - `www.twinmos.com` CNAME -> `twinmos.com`.
  - DNS TTL remains `300s`.

### Step 5: Live Cache Warming & Sitemap Crawling (T+04m)
- Trigger automated cache-warming across global edge CDN nodes:
  ```bash
  node tooling/ops/cutover-drill.mjs
  ```
- Priority routes primed:
  - Root & Locales: `/`, `/ar`, `/hi`, `/ru`, `/zh-cn`, `/fr`, `/es`, `/pt`, `/de`
  - Commercial Catalog: `/products`, `/products/ssd`, `/products/dram`
  - Customer Service: `/warranty`, `/support`, `/about`, `/contact`
  - Machine-readable metadata: `/sitemap-index.xml`, `/robots.txt`, `/llms.txt`

### Step 6: Search Engine Webmaster Submission (T+08m)
- Submit canonical sitemap to Google Search Console and Bing Webmaster Tools:
  - Endpoint: `https://www.twinmos.com/sitemap-index.xml`
  - Confirm indexable URLs: 65+ localized canonical routes.

---

## 4. Post-Cutover Operational Verification (T+10m to T+60m)

Execute continuous telemetry and functional verification:
1. **HTTP Status Probes**:
   ```bash
   curl -I https://www.twinmos.com/
   # Expect: HTTP/2 200, cf-cache-status: HIT or MISS, x-origin-country header
   curl -I https://www.twinmos.com/api/v1/health/deep
   # Expect: HTTP/2 200, database: connected
   ```
2. **Legacy 301 Redirect Check**:
   ```bash
   curl -I https://www.twinmos.com/product-category/solid-state-drive/
   # Expect: HTTP/2 301 Moved Permanently -> /products
   ```
3. **Synthetic Persona Sanity Check**:
   - Super Admin: verify `/api/v1/admin/users` access via portal.
   - Anonymous Visitor: test cookie banner consent and product search autocomplete.
4. **Error Rate & Latency SLO Monitoring**:
   - Cloudflare Analytics & Prometheus: 5xx rate < **0.01%**, p95 edge latency < **120ms**.

---

## 5. Rollback & Contingency Back-Out Plan

### Rollback Trigger Criteria (Go / No-Go Abort)
The Incident Commander (**David Vance**) will immediately order a rollback if any of the following occur during the 30-minute post-cutover window:
1. **Edge 5xx Error Rate > 1.0%** sustained for $\ge 3$ consecutive minutes.
2. **Database Failure or Data Corruption**: Inability for API to read or write persistent state.
3. **Critical Security Vulnerability**: Origin bypass discovered or SSL negotiation failure.
4. **Mass Redirect Loop**: Legacy URLs failing to redirect or looping recursively.

### Rapid Rollback Execution (< 300s)
1. **Revert DNS Apex CNAME**:
   - Tariq Al-Mansoor switches `twinmos.com` CNAME back to the legacy origin IP / CNAME in Cloudflare.
   - Because TTL was preset to 300s, global traffic transitions back to legacy infrastructure in $< 5$ minutes.
2. **Deactivate Legacy Maintenance Mode**:
   ```bash
   wp maintenance-mode deactivate --path=/var/www/legacy-twinmos
   ```
3. **Notify Stakeholders & Triage**:
   - Announce rollback in `#incident-cutover`.
   - Preserve all PostgreSQL WAL logs, NGINX access/error logs, and Cloudflare raw request logs for forensic analysis.
