# Access Matrix & DNS Change Procedures (PROC-04)

**Classification:** Confidential Internal Documentation (Zero Secrets Committed)  
**Scope:** Production VM, DNS, Cloudflare, Resend, CMS Role Boundaries

---

## 1. System Access & Ownership Matrix

| System / Surface | Owner | Authentication Method | 2FA Required | Role / Privilege Level |
| :--- | :--- | :--- | :--- | :--- |
| **Cloudflare DNS & WAF** | DevOps Lead | Enterprise SSO / Hardware Key | Enforced | Super Administrator |
| **Production App VM (SSH)** | DevOps Lead | Ed25519 SSH Key (No Password) | Bastion / IP Whitelist | Root / Deployment user (`twinmos`) |
| **PostgreSQL Database** | DB Administrator | Peer / TLS Socket Certificate | N/A (Internal Network) | Application user (`twinmos`) |
| **Resend Mail Delivery** | Tech Lead | API Key (Vault stored) | Enforced | Organization Admin |
| **Admin Console (CMS)** | Content / Operations | Email & Password (Better Auth) | Mandatory for Admin/SuperAdmin | `super_admin`, `admin`, `editor`, `author`, `viewer` |
| **Partner Portal** | Partner Operations | Invitation Token / Email Auth | Optional | `member` (Rank 0) |

---

## 2. DNS Change Procedure

1. **Pre-Change Verification**:
   - Verify TTL is lowered to 300 seconds at least 24 hours prior to scheduled migration.
   - Run health probe against staging endpoint (`/api/v1/health`).
2. **Execution Steps**:
   - Ensure Cloudflare SSL mode is set to **Full (strict)**.
   - Verify Origin CA certificates are installed on `/etc/nginx/certs/twinmos.pem`.
   - Update apex and www A/AAAA records to target proxy IPs.
   - Confirm Authenticated Origin Pulls (AOP) active.
3. **Rollback Trigger**:
   - If origin health returns non-200 for >3 consecutive minutes, revert DNS records immediately to standby origin.
