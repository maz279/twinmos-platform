# Hypercare — first 2 weeks after cutover (P7)

**Window:** T0 (cutover) → T0+14 days. **Owner:** on-call rota (2 names/day). **Channel:** #twinmos-launch.

## Daily checklist (first 3 days, then weekly)
- [ ] `/api/v1/health` green; `systemctl status twinmos-api nginx postgresql` clean
- [ ] Error tail: `journalctl -u twinmos-api --since -24h | grep -iE 'error|500'` — triage anything recurring
- [ ] Leads board: zero UNACKNOWLEDGED overdue leads (SLA KPI live on the dashboard)
- [ ] Auto-replies flowing: latest outbox/Resend activity for forms
- [ ] Backups: last night's `backup.sh` present + checksum ok
- [ ] Cloudflare analytics: error-rate & bot traffic anomalies
- [ ] Partner portal: 1 manual sign-in + download (gated files intact)

## Escalation
1. Anything user-visible → page on-call immediately (RTO mindset; DR.md quick-reference)
2. Data-loss suspicion → stop writes first (systemctl stop twinmos-api), then DR.md DB row
3. Security suspicion (defacement/leak) → Cloudflare "Under Attack" mode + rotate secrets in `/etc/twinmos/api.env` + BETTER_AUTH_SECRET

## Exit criteria (hypercare → steady state)
- 14 days elapsed AND 7 consecutive days with: zero Sev-1, error rate <0.1%, SLA breaches = 0, backup restore drill recorded.
- Handover: steady-state runbook = DEPLOY.md + DR.md + incident table above; monitoring alerts configured (health, disk, backup-age >26h).

## Incident log (append every incident, even minor)
| Date | Sev | Summary | Resolution | Follow-up |
|---|---|---|---|---|
| — | — | — | — | — |
