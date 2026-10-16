# SECRETS — TwinMOS Secret Management & Rotation Runbook (Task F5 / RUN-01)

## 1. Production Secrets Inventory

All production secrets reside in `/etc/twinmos/api.env` (permissions `0600`, owned by `twinmos:twinmos`). Secrets must never be committed to git, echoed in build outputs, or stored unencrypted.

| Secret Name | Purpose | Minimum Entropy | Rotation Frequency | Rotation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| `BETTER_AUTH_SECRET` | Signs user session tokens & cookies | 256 bits (32 bytes hex) | 90 days | Dual-key zero downtime |
| `REVALIDATION_SECRET` | Authenticates ISR outbox revalidations | 256 bits (32 bytes hex) | 90 days | Dual-secret transition |
| `DATABASE_URL` | PostgreSQL credentials | 128 bits alphanumeric | 180 days | Single-step with connection drain |
| `RESEND_API_KEY` | Transactional email provider token | Provider-managed | On compromise | Overlapping API key creation |
| `TURNSTILE_SECRET_KEY` | Cloudflare bot protection validation | Provider-managed | On compromise | Cloudflare dashboard pair swap |

---

## 2. Zero-Downtime Dual-Key Rotation Procedure

To rotate `BETTER_AUTH_SECRET` without invalidating active sessions:

### Step 1: Generate Cryptographically Secure New Key
```bash
NEW_SECRET=$(openssl rand -hex 32)
echo "Generated New Key Fingerprint: ${NEW_SECRET:0:8}..."
```

### Step 2: Configure Dual-Key Transition Window
Edit `/etc/twinmos/api.env`:
```bash
# Keep old secret as fallback so existing user cookies remain valid
BETTER_AUTH_SECRET="<NEW_SECRET>"
BETTER_AUTH_OLD_SECRETS="<OLD_SECRET>"
```

### Step 3: Graceful Service Reload
```bash
sudo systemctl reload-or-restart twinmos-api
```
Verify zero session drops using the automated rotation drill:
```bash
node tooling/ops/rotate-secrets.mjs
```

### Step 4: Retirement (After 24-Hour Grace Period)
Once all active sessions have rotated their signatures to the new secret:
```bash
# Remove BETTER_AUTH_OLD_SECRETS from /etc/twinmos/api.env
sudo sed -i '/BETTER_AUTH_OLD_SECRETS/d' /etc/twinmos/api.env
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
3. **Generate & Deploy Replacement**: Issue emergency single-step replacement in `/etc/twinmos/api.env`.
4. **Audit Log Inspection**:
   ```sql
   SELECT * FROM audit_log WHERE created_at > NOW() - INTERVAL '48 hours' ORDER BY created_at DESC;
   ```
5. **Session Revocation**: Truncate `session` table if auth secret compromised to force re-authentication across all accounts.
