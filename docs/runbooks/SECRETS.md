# SECRETS — TwinMOS Secret Management & Rotation Runbook (Task F3 / T7.3.3 / RUN-01)
> **Closes Finding Z-23**: Eliminates `BETTER_AUTH_OLD_SECRETS` which broke TOTP secret decryption; enforces versioned `BETTER_AUTH_SECRETS` key-ring rotation.

## 1. Production Secrets Inventory

All production secrets reside in `/etc/twinmos/api.env` (permissions `0600`, owned by `twinmos:twinmos`). Secrets must never be committed to git, echoed in build outputs, or stored unencrypted.

| Secret Name | Purpose | Minimum Entropy | Rotation Frequency | Rotation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| `BETTER_AUTH_SECRETS` | Signs sessions & encrypts TOTP MFA secrets | 256 bits per version (32 bytes hex) | 90 days | Versioned key-ring rotation (`<version>:<secret>`) |
| `BETTER_AUTH_SECRET` | Legacy single-secret fallback | 256 bits (32 bytes hex) | On migration | Migrated to versioned `BETTER_AUTH_SECRETS` |
| `REVALIDATE_SECRET` | Authenticates ISR outbox revalidations | 256 bits (32 bytes hex) | 90 days | Dual-secret transition |
| `DATABASE_URL` | PostgreSQL credentials | 128 bits alphanumeric | 180 days | Single-step with connection drain |
| `RESEND_API_KEY` | Transactional email provider token | Provider-managed | On compromise | Overlapping API key creation |
| `TURNSTILE_SECRET_KEY` | Cloudflare bot protection validation | Provider-managed | On compromise | Cloudflare dashboard pair swap |

---

## 2. Zero-Downtime Versioned Key-Ring Rotation Procedure (T7.3.3)

> [!IMPORTANT]
> **CRITICAL ARCHITECTURAL REQUIREMENT (Finding Z-23)**:
> Better Auth uses the auth secret to symmetrically encrypt twoFactor (TOTP) credentials in PostgreSQL.
> Better Auth **never reads `BETTER_AUTH_OLD_SECRETS`**. If rotated with `BETTER_AUTH_OLD_SECRETS`, all existing enrolled users are permanently locked out because their TOTP secrets cannot be decrypted!
> Instead, Better Auth natively requires versioned `BETTER_AUTH_SECRETS` formatted as `<current_version>:<current_secret>,<prev_version>:<prev_secret>`.
> During verification, Better Auth uses the current version for new encryptions while checking previous versions in the key ring to decrypt existing enrolled TOTP secrets.

### Step 1: Generate Cryptographically Secure New Key
```bash
# Generate 256-bit (32-byte) hex secret
NEW_SECRET=$(openssl rand -hex 32)
echo "Generated New Key (Version N+1): ${NEW_SECRET:0:8}..."
```

### Step 2: Configure Versioned Key-Ring Transition Window
Inspect current version in `/etc/twinmos/api.env`. If transitioning from initial version `1` with secret `old_secret_value`:

Edit `/etc/twinmos/api.env`:
```bash
# Versioned key ring: version 2 is current primary; version 1 remains active in key ring
BETTER_AUTH_SECRETS="2:<NEW_SECRET>,1:<OLD_SECRET>"
```

### Step 3: Graceful Service Reload
```bash
sudo systemctl reload-or-restart twinmos-api
```

### Step 4: Validate Active Sessions & TOTP Login
Execute the automated rotation rehearsal script:
```bash
node tooling/ops/rotate-secrets.mjs
```
The script verifies:
1. Previously enrolled users with TOTP secrets created under version 1 still decrypt and authenticate successfully.
2. New user enrollments encrypt under version 2.
3. Active sessions sign and verify cleanly without drops.

### Step 5: Retirement (After 24-Hour Grace Period)
Once all sessions have rotated and/or background re-encryption of TOTP secrets completes:
```bash
# Update /etc/twinmos/api.env to retire version 1:
BETTER_AUTH_SECRETS="2:<NEW_SECRET>"
sudo systemctl reload-or-restart twinmos-api
```

---

## 3. Database Password Rotation Procedure

```bash
# 1. Connect to PostgreSQL as superuser
sudo -u postgres psql

# 2. Update password for twinmos service account
ALTER USER twinmos WITH PASSWORD '<NEW_STRONG_PASSWORD>';
\q

# 3. Update /etc/twinmos/api.env with new DATABASE_URL
# 4. Restart twinmos-api
sudo systemctl restart twinmos-api

# 5. Confirm database connectivity
curl -s http://127.0.0.1:8787/api/v1/health | jq .
```

---

## 4. Emergency Secret Compromise Protocol

If any production credential is leak-detected:
1. **Declare P1 Security Incident** in `docs/runbooks/INCIDENT.md`.
2. **Immediate Revocation**: Revoke API key at provider dashboard (Resend, Turnstile, Cloudflare).
3. **Emergency Secret Roll**:
   - For `BETTER_AUTH_SECRETS`, immediately deploy a new version `N+1` and drop compromised version `N`.
4. **Session Invalidation**:
   - If session secret compromised, truncate `session` table in PostgreSQL to force global re-login:
     ```sql
     TRUNCATE TABLE session CASCADE;
     ```
5. **Audit Log Inspection**:
   ```sql
   SELECT * FROM audit_log WHERE created_at > NOW() - INTERVAL '48 hours' ORDER BY created_at DESC;
   ```
