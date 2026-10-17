# Access Matrix, DNS Change Procedures & Branch Protection (PROC-04)

**Document Authority:** TwinMOS Revised Implementation Roadmap v3.1 Phased (2026-10-17), Phase 02 · Section 4.1 (`T2.1.4 / M0.2`, `PROC-04`).  
**Classification:** Confidential Engineering & Operations Documentation (Zero Secrets Committed).  
**Review Frequency:** Bi-weekly at sprint checkpoints.

---

## 1. System Access & Named Ownership Matrix

Every production and infrastructure account is assigned a named owner with documented role-based access and verified two-factor authentication (2FA).

| Service / System | Named Owner | Technical Role | Account Role | 2FA Status | Authentication Mechanism |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GitHub Organization** (`twinmos`) | **Tariq Al-Mansoor** | DevOps Lead (`DO`) | Organization Owner | **Enforced** | Hardware Key (FIDO2 / WebAuthn) |
| **GitHub Organization (Backup)** | **David Vance** | Project Lead (`Lead`) | Organization Owner | **Enforced** | Authenticator App (TOTP) + Recovery Keys |
| **Cloudflare DNS & WAF** | **Tariq Al-Mansoor** | DevOps Lead (`DO`) | Super Administrator | **Enforced** | Hardware Key (FIDO2) + IP Allowlist |
| **Cloudflare (Secondary)** | **David Vance** | Project Lead (`Lead`) | Administrator | **Enforced** | TOTP 2FA |
| **Resend (Transactional Mail)** | **David Vance** | Project Lead (`Lead`) | Organization Owner | **Enforced** | TOTP 2FA (Vault Backed) |
| **Resend (Operations)** | **Tariq Al-Mansoor** | DevOps Lead (`DO`) | Organization Admin | **Enforced** | TOTP 2FA |
| **Sentry (Error Telemetry)** | **Tariq Al-Mansoor** | DevOps Lead (`DO`) | Organization Owner | **Enforced** | TOTP 2FA |
| **Sentry (Application Integration)**| **Marcus Brody** | Full-Stack Lead (`FS1`)| Team Admin | **Enforced** | TOTP 2FA |
| **Object Storage (Media/Assets)** | **Tariq Al-Mansoor** | DevOps Lead (`DO`) | Storage Administrator | **Enforced** | IAM Role + Hardware 2FA |
| **Production VM (Host Infrastructure)** | **Tariq Al-Mansoor** | DevOps Lead (`DO`) | Infrastructure Admin | **Enforced** | Ed25519 SSH Key (Password Disabled) |
| **Staging VM (Pre-Production)** | **Tariq Al-Mansoor** | DevOps Lead (`DO`) | Infrastructure Admin | **Enforced** | Ed25519 SSH Key (Bastion Gateway) |
| **PostgreSQL Database Engine** | **Elena Rostova** | Database Owner (`FS2`) | Application DBA | **Enforced** | Internal Docker Network / TLS Socket |
| **Admin Console (CMS Core)** | **Elena Rostova** | CMS Owner (`FS2`) | `super_admin` | **Enforced** | Better Auth TOTP (`twoFactor`) |
| **Partner Portal (B2B)** | **Victoria Sterling**| Partner Ops (`Content`)| Portal Admin | **Enforced** | Magic Link + TOTP |

---

## 2. Infrastructure Access Evidence & Artifact References

1. **Cloudflare Zone & Origin CA Evidence**:
   - Zone ID: `twinmos.com` active under Cloudflare Enterprise.
   - SSL/TLS Encryption Mode: **Full (strict)** verified.
   - Origin CA Certificate: Installed at `/etc/nginx/certs/twinmos.pem` and `/etc/nginx/certs/twinmos.key` (valid through 2041).
   - Authenticated Origin Pulls (AOP): Configured via Cloudflare Certificate Authority (`authenticated_origin_pull_ca.pem`).
2. **Resend Transactional Mail Service Evidence**:
   - Outbox Delivery Driver: `packages/mail/src/transports/resend.ts`.
   - Local Outbox Spool Fallback: `data/mail/outbox/` for zero dropped notifications during network partition.
   - Boot Configuration Guard: Enforces `RESEND_API_KEY` presence and format in production.
3. **GitHub Branch Protection Policy Evidence**:
   - Branch protection policy enforced on `main`.
   - Direct push rejected: verified by git pre-receive hook simulation.
   - Required status checks: `build-and-verify`, `test-postgres-integration`, `test-edge-config`.

---

## 3. DNS Cutover & Change Procedure

All production DNS records for `twinmos.com` and `www.twinmos.com` are managed via Cloudflare and follow this strict standard operating procedure:

### Phase 1: Pre-Change Verification (T-48h to T-24h)
1. **Lower TTLs**: Reduce DNS TTL on all existing A/AAAA/CNAME records to **300 seconds** (5 minutes) at least 24 hours prior to scheduled migration window.
2. **Origin Staging Validation**: Execute full automated verification runner (`verify-vc-r0-audit.mjs` and `verify-gate-a.mjs`) against target staging host.
3. **SSL Certificate Validation**: Validate that Cloudflare Origin CA certificate and private key are correctly installed in the edge container and pass `nginx -t`.

### Phase 2: Cutover Execution Window
1. **Maintenance Notice**: If planned database migration is required, set maintenance banner via edge map: `map $uri $maintenance_mode { default 0; }`.
2. **Set Cloudflare SSL Mode**: Confirm SSL/TLS encryption mode is set to **Full (strict)**.
3. **Update Apex & WWW Records**:
   - Point `twinmos.com` (Apex) A record to the target origin IP (Cloudflare Proxied: Orange Cloud).
   - Point `www.twinmos.com` CNAME to `twinmos.com` (Cloudflare Proxied).
4. **Origin Pull Security**: Enable **Authenticated Origin Pulls (AOP)** globally in the Cloudflare SSL/TLS dashboard.
5. **Traffic Verification**: Monitor live traffic logs on edge Nginx (`/var/log/nginx/access.log`) and verify real client IP extraction via `CF-Connecting-IP`.

### Phase 3: Rollback Procedures (Automated Trigger)
* **Trigger Condition**: If edge reports HTTP 5xx error rate > 0.5% or deep health check (`/api/v1/health/deep`) fails for more than 3 consecutive minutes.
* **Immediate Rollback Steps**:
  1. Revert Cloudflare A/AAAA records to standby origin IP (propagates in < 300 seconds).
  2. If edge container issue, trigger local rollback runbook [`docs/runbooks/ROLLBACK.md`](runbooks/ROLLBACK.md).
  3. Notify engineering leadership via incident escalation bridge ([`docs/runbooks/INCIDENT.md`](runbooks/INCIDENT.md)).

---

## 4. Open Infrastructure Items Ledger (Roadmap M0.2)

Items from the v1.0 M0.2 card scheduled for progressive delivery during Sprint S1 and S2:

| Item ID | Infrastructure Deliverable | Technical Scope | Named Owner | Target Date | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **OPEN-01** | **Dedicated Staging VM** | Provision dedicated Ubuntu 24.04 LTS host (4 vCPU, 8 GB RAM, isolated network) with Docker Compose parity. | **Tariq Al-Mansoor** (`DO`) | **2026-11-13 (S2)** | In Progress |
| **OPEN-02** | **GHCR Image Registry Automation** | Configure CI workflow to build and push versioned Docker images (`twinmos-edge`, `twinmos-api`, `twinmos-web`) to `ghcr.io/twinmos/*`. | **Tariq Al-Mansoor** (`DO`) | **2026-11-06 (S1)** | Scheduled |
| **OPEN-03** | **Resend Domain Authentication** | Publish 3 dedicated DKIM CNAME records (`resend._domainkey.twinmos.com`) and SPF `include:amazonses.com` on Cloudflare. | **Tariq Al-Mansoor** (`DO`) | **2026-10-30 (S1)** | Scheduled |
| **OPEN-04** | **Offsite Backup Replication** | Automate daily encrypted WAL and database dump replication to secondary cloud storage provider. | **Elena Rostova** (`FS2`) | **2026-11-20 (S2)** | Scheduled |

---

## 5. GitHub Repository Branch Protection Policy (`main`)

**Target Branch:** `main`  
**Enforcement Level:** Mandatory across all contributors, administrators, and automated bots.

### Enforced Rules & Gates:
1. **Require Pull Request Before Merging**:
   - Minimum number of approvals: **1** (from peer engineer or code owner).
   - Dismiss stale pull request approvals when new commits are pushed.
   - Require review from Code Owners per [`.github/CODEOWNERS`](../.github/CODEOWNERS).
2. **Require Status Checks to Pass Before Merging**:
   - `build-and-verify`: TypeScript compilation, ESLint (`--max-warnings 0`), Vitest suites, Astro SSR build.
   - `test-postgres-integration`: A10 migration runner on `postgres:18-alpine` with zero errors.
   - `test-edge-config`: Docker edge image build and containerized `nginx -t` validation.
3. **Strict Commit & Push Restrictions**:
   - Restrict direct pushes to `main` (0 direct pushes; all changes via Pull Request).
   - Force pushes disabled (`--force` prohibited).
   - Branch deletion prohibited.
   - Linear git history enforced (Squash & Merge or Rebase & Merge).
