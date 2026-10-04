# TwinMOS Website — Secrets Management Plan

**Document ID:** H.1-005  
**Version:** 1.0  
**Status:** Active  
**Owner:** Tech Lead  
**Last Updated:** 2026-05-01  
**Related:** TwinMOSWebsiteEnvironmentVariablesReference.md · TwinMOSWebsiteEnvironmentConfigurationSpec.md · TwinMOSWebsiteCICDPipeline_Spec.md

---

## 1. Purpose & Scope

This document defines how secrets (credentials, API keys, tokens, passphrases) are classified, stored, rotated, audited, and revoked across all four environment tiers of the TwinMOS website project. It applies to all team members, automated CI/CD systems, and third-party integrations.

**Environments in scope:** Local · Development · Staging · Production  
**Systems in scope:** Hetzner VPS · Coolify · GitHub Actions · Cloudflare · Backblaze B2 · Strapi · PostgreSQL · MeiliSearch · Resend · Sentry · UptimeRobot · Plausible

---

## 2. Secret Classification

Secrets are classified into three tiers based on sensitivity and blast radius if exposed.

### 2.1 Classification Tiers

| Tier | Name | Examples | Breach Impact | Rotation Frequency |
|------|------|----------|--------------|-------------------|
| T1 | Critical | PostgreSQL password, JWT_SECRET, ADMIN_JWT_SECRET, APP_KEYS, GPG backup passphrase, Hetzner API token | Full system compromise, data breach | 90 days |
| T2 | High | B2 application key, Resend API key, Sentry auth token, Cloudflare API token, GitHub PAT | Service disruption, data exposure | 180 days |
| T3 | Standard | UptimeRobot API key, Plausible site ID, public MeiliSearch search key | Limited feature degradation | Annual or on offboarding |

> T1 secrets must be treated as if they are already compromised once shared beyond the minimum required parties.

### 2.2 Public vs. Private Variables

Not all configuration values are secrets. This distinction matters:

| Type | Example | Rule |
|------|---------|------|
| Public constant | `PUBLIC_API_URL=https://api.twinmos.com` | Safe to commit in `.env.example`; prefixed `PUBLIC_` |
| Non-secret config | `NODE_ENV=production` | Safe to commit |
| Private (T3) | `PUBLIC_SENTRY_DSN` (browser-facing but not a secret per se) | Commit to `.env.example` with placeholder |
| Secret (T1–T2) | `DATABASE_URL`, `JWT_SECRET` | **Never** commit; only in secret stores |

---

## 3. Secret Storage by Environment

### 3.1 Local Development

- Developers keep secrets in a local `.env.local` file (never committed)
- `.env.local` is listed in `.gitignore` and `.dockerignore`
- A `.env.example` file (committed) contains all variable names with placeholder values
- On onboarding, the Tech Lead shares actual local dev secrets via **Bitwarden shared vault** (TwinMOS organisation)
- Local secrets use **development-tier credentials only** — never production values on a developer workstation

```bash
# .gitignore (excerpt)
.env.local
.env.*.local
*.pem
*.key
```

### 3.2 Development & Staging Environments (Hetzner CX22/CX32)

- Secrets stored as **Coolify environment variables** (encrypted at rest in Coolify's internal database)
- Access: Coolify admin UI (https://coolify.twinmos.com) — Tech Lead only
- Coolify encrypts variables using AES-256-GCM before storing
- Variables injected into containers at runtime via Docker env

### 3.3 Production Environment (Hetzner CX32/CX42)

- Same as staging: Coolify encrypted environment variables
- Production Coolify instance is separate from staging
- Tech Lead (primary) + one backup contact (designated Chairman's representative) have Coolify credentials
- Coolify dashboard access protected by MFA (TOTP)

### 3.4 CI/CD (GitHub Actions)

- Secrets stored as **GitHub Actions Encrypted Secrets** at repository level
- Environment-scoped secrets used where possible (separate `staging` and `production` environments)
- Secrets are never printed in logs; GitHub automatically masks secret values
- Service accounts (not personal tokens) used for machine-to-machine access

```
GitHub Actions Secrets inventory:
Repository-level:
  CLOUDFLARE_API_TOKEN          → Cloudflare Pages deployment
  CLOUDFLARE_ACCOUNT_ID         → Cloudflare Pages deployment
  SNYK_TOKEN                    → Snyk security scanning
  GITGUARDIAN_API_KEY           → Secret scanning
  SENTRY_AUTH_TOKEN             → Source map upload

Environment: staging
  COOLIFY_WEBHOOK_URL_STAGING   → Coolify deploy webhook
  B2_APPLICATION_KEY_ID_STAGING → Backup uploads
  B2_APPLICATION_KEY_STAGING    → Backup uploads

Environment: production
  COOLIFY_WEBHOOK_URL_PROD      → Coolify deploy webhook
  B2_APPLICATION_KEY_ID_PROD    → Backup uploads
  B2_APPLICATION_KEY_PROD       → Backup uploads
```

---

## 4. Secret Never-Do Rules

1. **Never commit secrets to Git** — even in private repos, even "temporarily"
2. **Never log secrets** — mask in Strapi logger, disable debug-level logging in production
3. **Never send secrets over Slack/email/chat** — use Bitwarden secure share only
4. **Never use production credentials in local dev** — separate dev-tier credentials always
5. **Never hardcode secrets** in source files — use environment variable injection
6. **Never share API keys personally** — all keys are tied to service accounts, not individuals

---

## 5. Secret Rotation Schedule

### 5.1 Planned Rotation

| Secret | Tier | Rotation Frequency | Responsible | Trigger |
|--------|------|--------------------|-------------|---------|
| PostgreSQL password | T1 | 90 days | Tech Lead | Calendar reminder |
| JWT_SECRET | T1 | 90 days | Tech Lead | Calendar reminder |
| ADMIN_JWT_SECRET | T1 | 90 days | Tech Lead | Calendar reminder |
| APP_KEYS (Strapi) | T1 | 90 days | Tech Lead | Calendar reminder |
| GPG backup passphrase | T1 | 180 days | Tech Lead | Calendar reminder |
| Hetzner API token | T1 | 180 days | Tech Lead | Calendar reminder |
| Backblaze B2 application key | T2 | 180 days | Tech Lead | Calendar reminder |
| Resend API key | T2 | 180 days | Tech Lead | Calendar reminder |
| Cloudflare API token | T2 | 180 days | Tech Lead | Calendar reminder |
| GitHub PAT (CI service account) | T2 | 180 days | Tech Lead | Calendar reminder |
| Sentry auth token | T2 | 180 days | Tech Lead | Calendar reminder |
| UptimeRobot API key | T3 | Annual | Tech Lead | Calendar reminder |
| MeiliSearch master key | T1 | 180 days | Tech Lead | Calendar reminder |

### 5.2 Unplanned Rotation (Emergency)

Triggered by: detected leak (GitGuardian alert), team member offboarding, suspected breach.

**Emergency rotation SLA: within 2 hours of detection.**

See Section 8 for emergency rotation procedure.

---

## 6. Secret Rotation Procedure (Planned)

Use this procedure for routine planned rotation of any T1 or T2 secret.

### 6.1 Pre-rotation checklist
- [ ] Identify all systems using the secret (cross-reference Environment Variables Reference)
- [ ] Schedule a low-traffic window (prefer 01:00–03:00 UTC)
- [ ] Notify team in #ops Slack channel
- [ ] Ensure a recent DB backup is available (within 24h)

### 6.2 Rotation steps

```bash
# Example: Rotate PostgreSQL password

# Step 1: Generate new strong password (min 32 chars, alphanumeric + special)
NEW_PG_PASSWORD=$(openssl rand -base64 32)

# Step 2: Update password in PostgreSQL
docker exec -it twinmos-postgres psql -U postgres -c \
  "ALTER USER strapi_user PASSWORD '${NEW_PG_PASSWORD}';"

# Step 3: Update in Coolify environment variables
# (via Coolify UI → Application → Environment Variables → DATABASE_URL)
# Format: postgresql://strapi_user:${NEW_PG_PASSWORD}@localhost:5432/strapi_prod

# Step 4: Restart Strapi container via Coolify
# (Coolify UI → Restart → Rolling restart)

# Step 5: Verify Strapi admin login works
curl -s https://api.twinmos.com/api/_health | jq .

# Step 6: Update GitHub Actions secret (if used by CI)
gh secret set DATABASE_URL_STAGING --env staging

# Step 7: Store new password in Bitwarden shared vault
# (manually — do not automate Bitwarden writes)

# Step 8: Log rotation in the rotation audit log (Section 9)
```

### 6.3 Post-rotation verification
- [ ] Strapi health endpoint responds 200
- [ ] Admin login successful
- [ ] UptimeRobot shows all monitors green (5 min check interval)
- [ ] No Sentry errors for 30 min post-rotation

---

## 7. Access Control Matrix

Who can access secrets at each level:

| Role | Local `.env.local` | Coolify (Dev/Staging) | Coolify (Prod) | GitHub Secrets | Bitwarden Vault |
|------|-------------------|----------------------|----------------|----------------|-----------------|
| Developer A | Own workstation only | Read (Tech Lead grants) | No | Staging env only | Read-only |
| Developer B | Own workstation only | Read (Tech Lead grants) | No | Staging env only | Read-only |
| Tech Lead | Own workstation | Full admin | Full admin | Full admin | Full admin |
| CI/CD System | n/a | Webhook token only | Webhook token only | Automated inject | n/a |
| Chairman / GM | n/a | Emergency (break-glass) | Emergency (break-glass) | n/a | Emergency |

### 7.1 Principle of Least Privilege

- Developers receive **only the secrets they need** for local dev (no production credentials ever)
- CI/CD service accounts are scoped to specific operations (deploy-only webhook, not full API access)
- Backblaze B2 keys are **per-bucket restricted** — staging key cannot access production bucket

---

## 8. Emergency Rotation Procedure

Triggered when a secret is suspected or confirmed to be compromised (GitGuardian alert, accidental log exposure, staff offboarding).

### 8.1 Immediate triage (within 15 minutes)

1. **Assess blast radius:** Which systems use this secret? What data could be accessed?
2. **Alert Tech Lead + Chairman** via Slack #incident
3. **Revoke the compromised credential immediately** at the source:
   - PostgreSQL: `ALTER USER strapi_user PASSWORD 'REVOKED';`
   - Cloudflare: Revoke API token in Cloudflare dashboard
   - B2: Disable application key in Backblaze console
   - GitHub: Revoke PAT in GitHub settings
4. **Assess if breach occurred:** Check access logs, Sentry errors, unusual API activity

### 8.2 Remediation (within 2 hours)

1. Generate new credential (see Section 6.2 pattern)
2. Update in all secret stores (Coolify, GitHub Actions, Bitwarden)
3. Restart affected services
4. Verify all health checks pass

### 8.3 Post-incident

1. Document in incident log (GitHub issue)
2. Review how the credential was exposed
3. Add preventive control if applicable (secretlint rule, GitGuardian policy)
4. Notify stakeholders if data breach occurred (GDPR 72h notification obligation — see `TwinMOSWebsiteDisasterRecoveryPlan.md`)

---

## 9. Staff Onboarding & Offboarding

### 9.1 Onboarding checklist

When a new developer joins:

- [ ] Create personal Bitwarden vault account + invite to TwinMOS organisation
- [ ] Share `.env.example` and explain variable groups
- [ ] Create **personal dev-tier** Strapi API token (not shared credentials)
- [ ] Grant GitHub repository access (Collaborator, not Admin)
- [ ] Grant Coolify dev/staging read access only
- [ ] Add to Slack #ops and #alerts channels
- [ ] **Do not share production credentials**

### 9.2 Offboarding checklist

When a developer leaves (immediately on last day):

- [ ] Revoke GitHub repository access
- [ ] Revoke Coolify user account
- [ ] Revoke Bitwarden vault membership
- [ ] **Rotate all T1 and T2 secrets** regardless of confidence level
- [ ] Review recent deploy history for any unauthorised changes
- [ ] Remove from Slack channels
- [ ] Remove from UptimeRobot alert contacts
- [ ] Document in rotation audit log

---

## 10. Secret Detection Controls

### 10.1 Pre-commit: secretlint

`secretlint` runs as a pre-commit hook (managed by Husky + lint-staged). It scans staged files for patterns matching known secret formats.

```json
// .secretlintrc.json
{
  "rules": [
    { "id": "@secretlint/secretlint-rule-preset-recommend" },
    { "id": "@secretlint/secretlint-rule-pattern", "options": {
        "patterns": [
          { "name": "PostgreSQL connection string", "pattern": "postgresql://[^@]+:[^@]+@" },
          { "name": "JWT secret", "pattern": "(?i)jwt.*secret.*=.{20,}" },
          { "name": "Hetzner API token", "pattern": "[0-9A-Za-z]{64}" }
        ]
      }
    }
  ]
}
```

Any commit containing a detected secret pattern is **blocked at pre-commit stage**.

### 10.2 CI: GitGuardian

GitGuardian scans every push to the repository. On detection:
- GitHub commit is flagged
- Immediate Slack alert to #security channel
- Tech Lead paged
- Emergency rotation initiated within 15 minutes

### 10.3 Dependency scanning

Snyk + Dependabot scan for secrets accidentally embedded in node_modules or lock files (rare but possible). Scheduled weekly scan (Mondays 02:00 UTC).

---

## 11. Backup Encryption

All backups uploaded to Backblaze B2 are encrypted before upload using GPG AES-256.

```bash
# Encrypt backup before upload
gpg --symmetric --cipher-algo AES256 \
    --passphrase "${GPG_BACKUP_PASSPHRASE}" \
    --batch --yes \
    -o "backup_$(date +%Y%m%d).sql.gpg" \
    "backup_$(date +%Y%m%d).sql"
```

**GPG passphrase storage:**
- Stored in Bitwarden (TwinMOS vault, "Infrastructure" collection)
- Tech Lead + designated backup contact (Chairman's representative) have access
- **Never stored in Coolify or GitHub** — stored only in Bitwarden
- Passphrase is minimum 32 characters, randomly generated

**Recovery test:** Monthly decryption test of a recent backup to verify passphrase is correct and backup is valid.

---

## 12. Audit Log

Maintain a running log of all secret rotations. Append entries to this table:

| Date | Secret | Reason | Rotated By | Systems Updated | Verified |
|------|--------|--------|------------|-----------------|---------|
| 2026-05-01 | All (initial setup) | Project launch | Tech Lead | Coolify prod/staging, GitHub Actions | ✓ |
| YYYY-MM-DD | | | | | |

> Keep this table updated. During security audits, this log demonstrates compliance with the rotation schedule.

---

## 13. Compliance Notes

- **GDPR Article 32:** Technical measures for data security (encryption of credentials)
- **UAE Federal PDPL:** Same encryption-at-rest requirement
- **GDPR Article 33:** 72-hour breach notification if compromised secret leads to personal data access
- **OWASP A07 (Identification and Authentication Failures):** Rotation and access control directly mitigates this category

---

## Appendix A — Bitwarden Vault Structure

```
TwinMOS Organisation (Bitwarden)
├── Infrastructure/
│   ├── Hetzner CX32 SSH Key
│   ├── Hetzner API Token
│   ├── Coolify Admin Password (prod)
│   ├── Coolify Admin Password (staging)
│   └── GPG Backup Passphrase
├── Database/
│   ├── PostgreSQL prod password
│   ├── PostgreSQL staging password
│   └── MeiliSearch master key
├── Third-party APIs/
│   ├── Backblaze B2 Application Key (prod)
│   ├── Backblaze B2 Application Key (staging)
│   ├── Resend API Key
│   ├── Cloudflare API Token
│   ├── Sentry Auth Token
│   └── GitHub Service Account PAT
└── Application/
    ├── Strapi JWT_SECRET (prod)
    ├── Strapi ADMIN_JWT_SECRET (prod)
    └── Strapi APP_KEYS (prod)
```

---

*Document maintained by Tech Lead. Review quarterly or after any security incident.*  
*Approved by: Chairman · Tech Lead*
