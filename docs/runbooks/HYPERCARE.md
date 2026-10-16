# HYPERCARE — Post-Launch Operational Surveillance & Handover Runbook (Task F8)

## 1. Window, Rota & Communication Channels

- **Surveillance Window**: T0 (Production Cutover) → T0 + 14 Days (Sprint S11).
- **Core Operating Rota (On-Call Roster)**:
  - **Primary On-Call (FS1 / Platform)**: Backend, authentication, outbox revalidation, and API telemetry.
  - **Secondary On-Call (DO / Infrastructure)**: Cloudflare edge, Nginx ingress, host firewall, and PostgreSQL backups.
  - **Frontend Support (FE)**: Public UX, Core Web Vitals field data, asset delivery, and responsive/RTL layout.
  - **CMS & Data Support (FS2)**: Content publishing, serial registry, and form lead routing.
- **Dedicated Communication Channel**: `#twinmos-launch-hypercare` (Slack/Teams).
- **Daily Standup / Review**: 09:00 UTC daily for 15 minutes (Review 24h telemetry, error tails, and lead board).

---

## 2. Daily Hypercare Surveillance Checklist

Run the automated daily surveillance tool every morning:
```bash
# Optional simulation verification (demo tooling):
node tooling/demo/hypercare-daily-check.mjs
```

### Daily Triage Checklist & Responsibilities

| Role | Area | Daily Triage Actions | Verification Tool / Command |
| :--- | :--- | :--- | :--- |
| **FS1** | **API Health & Auth** | Inspect 5xx errors, latency spikes, and account lockout rate | `journalctl -u twinmos-api -n 100`<br>`curl -s http://127.0.0.1:8787/api/v1/health` |
| **FS2** | **Leads & Outbox** | Verify zero unacknowledged lead backlogs; confirm outbox dispatch | Admin Console → Support Board<br>`POST /api/v1/admin/cron/dispatch-outbox` |
| **FE** | **CWV & 404s** | Review Core Web Vitals (LCP < 2.5s, CLS < 0.1, INP < 200ms) and missing asset logs | Cloudflare Web Analytics / GSC<br>`grep " 404 " /var/log/nginx/access.log \| head -n 30` |
| **DO** | **Edge & Backups** | Verify nightly `backup.sh` archive and checksum; inspect Cloudflare WAF | `ls -la /var/backups/twinmos`<br>`sha256sum -c /var/backups/twinmos/*.sha256` |

---

## 3. SEO Preservation & Legacy 301 Redirect Monitoring (Risk R-08)

To eliminate search rank drop when replacing the legacy WordPress site:
1. **Daily Google Search Console Inspection**:
   - Check "Pages" indexing report for 404 crawl errors.
   - Verify that legacy URLs listed in `deploy/nginx/twinmos-redirects.map` are returning HTTP 301 Moved Permanently.
2. **Access Log Redirect Hits Audit**:
   ```bash
   # Count legacy redirect hits served by Nginx in past 24h
   awk '$9 ~ /301/ {print $7}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -n 25
   ```
3. **Remediation for Unmapped 404s**:
   - If an unmapped legacy path appears in 404 logs:
     1. Add mapping to `/etc/nginx/twinmos-redirects.map` (`/old-path /new-path;`).
     2. Reload Nginx: `sudo systemctl reload nginx`.

---

## 4. Rapid-Response Incident Playbooks

### Playbook 1: Spike in 404 Errors on Legacy Product URLs
- **Symptom**: Cloudflare or Nginx access logs show sudden surge in 404 responses for legacy product paths.
- **Action**:
  1. Extract failing URLs: `awk '$9 == 404 {print $7}' /var/log/nginx/access.log | sort | uniq -c`.
  2. Map them to the canonical catalog or product detail page in `deploy/nginx/twinmos-redirects.map`.
  3. Reload Nginx (`sudo nginx -t && sudo systemctl reload nginx`).

### Playbook 2: Form Submission / Relay Stall (V-09)
- **Symptom**: Alert `mail.form_notification_failed` fires in `alertManager`.
- **Action**:
  1. Inspect SMTP relay connectivity (`RESEND_API_KEY` / SMTP host).
  2. Verify database lead records are intact: leads are stored in PostgreSQL even if email delivery fails.
  3. Triage pending queue and trigger resend if necessary.

### Playbook 3: WAF Bot / DDoS Attack at Cloudflare Edge
- **Symptom**: Traffic spike with high rate of 403/429 at Cloudflare edge.
- **Action**:
  1. Activate Cloudflare "Under Attack" mode or enable Managed Challenge on `/api/v1/forms/*` and `/api/v1/sn-check`.
  2. Verify host firewall: `deploy/firewall/setup-firewall.sh` enforces origin isolation (non-Cloudflare IPs dropped).

### Playbook 4: Core Web Vitals Regression (LCP > 2.5s)
- **Symptom**: Field data shows LCP degraded on product detail or home pages.
- **Action**:
  1. Check recent media uploads in Admin Media Library (`/admin/media`).
  2. Ensure images have responsive `srcset` and `fetchpriority="high"` on hero elements.
  3. Verify Nginx micro-cache (`ssr_cache`) hit ratio.

---

## 5. Hypercare Exit Criteria & Handover Sign-Off (Transition to Steady State)

Hypercare officially concludes when all the following conditions are met:
1. **14 full days elapsed** from production cutover.
2. **7 consecutive days** with:
   - Zero Sev-1 or Sev-2 incidents.
   - Aggregate API and edge error rate < 0.05%.
   - Zero lead delivery or outbox backlog breaches.
   - Core Web Vitals field data within "Good" thresholds (LCP < 2.5s, CLS < 0.1, INP < 200ms).
3. **Disaster Recovery verification**: At least one live non-disruptive restore drill (`restore.sh --drill`) recorded during hypercare.
4. **Formal Sign-off**: Completion and approval of [`docs/reports/HYPERCARE_EXIT_REPORT.md`](../reports/HYPERCARE_EXIT_REPORT.md).
