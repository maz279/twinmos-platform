# TwinMOS Corporate Website - Key Management Plan

**Document Reference:** TWN-SEC-2026-008
**Document Version:** 1.0
**Status:** FINAL
**Date:** 2 May 2026
**Prepared by:** TwinMOS Digital Transformation Team
**Owner:** IT/Technical Lead / Security Lead
**Classification:** CONFIDENTIAL - Internal Use
**Synchronized With:** Tech Stack v1.1, BRD v3.0, Encryption Strategy TWN-SEC-2026-007

---

## Change Log

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2 May 2026 | Initial release - comprehensive key management plan |

---

## Document Governance

| Role | Name | Sign-Off | Date |
|------|------|----------|------|
| IT/Technical Lead | (TBC) | _______________ | _________ |
| Unisoft Security Lead | (TBC) | _______________ | _________ |

---

## Table of Contents

1. Executive Summary
2. Key Inventory
3. Key Generation
4. Key Storage
5. Key Distribution
6. Key Rotation
7. Key Revocation
8. Key Destruction
9. Key Recovery
10. Access Control
11. Audit and Monitoring
12. Compliance Mapping
13. Implementation Checklist

---

## 1. Executive Summary

This document defines the key management practices for the TwinMOS corporate website. All cryptographic keys are managed according to industry best practices with clear ownership, rotation schedules, and audit trails.

**Key Management Principles:**
- Separation of duties for key operations
- Minimum key access (least privilege)
- Automated rotation where possible
- Comprehensive audit logging
- Secure destruction at end of life

---

## 2. Key Inventory

### 2.1 Cryptographic Keys

| Key ID | Key Name | Type | Purpose | Location | Owner |
|--------|----------|------|---------|----------|-------|
| TWN-K-001 | JWT Signing Private Key | RSA-2048 | CMS API token signing | Coolify secrets | Security Lead |
| TWN-K-002 | JWT Signing Public Key | RSA-2048 | CMS API token verification | Public endpoint | Security Lead |
| TWN-K-003 | Backup Encryption Key | RSA-4096 | GPG backup encryption | Offline storage + Coolify | Security Lead |
| TWN-K-004 | Database Encryption Key | AES-256 | LUKS disk encryption | Hetzner TPM / passphrase | DevOps Lead |
| TWN-K-005 | Application Encryption Key | AES-256 | Field-level encryption | Coolify secrets | Security Lead |
| TWN-K-006 | API Key Master Salt | Random 256-bit | API key hashing | Coolify secrets | Security Lead |
| TWN-K-007 | Session Cookie Secret | Random 256-bit | Cookie signing | Coolify secrets | Security Lead |
| TWN-K-008 | OAuth State Secret | Random 256-bit | OAuth CSRF protection | Coolify secrets | Security Lead |
| TWN-K-009 | Stripe Webhook Secret (P3) | Random 256-bit | Stripe webhook verification | Coolify secrets | Security Lead |
| TWN-K-010 | Cloudflare Origin CA Key | ECDSA P-256 | Origin certificate signing | Cloudflare | DevOps Lead |

### 2.2 Non-Cryptographic Secrets

| Secret ID | Secret Name | Purpose | Location | Rotation |
|-----------|-------------|---------|----------|----------|
| TWN-S-001 | PostgreSQL Password | Database access | Coolify env var | Quarterly |
| TWN-S-002 | Backblaze B2 Key | Object storage | Coolify env var | Quarterly |
| TWN-S-003 | Resend API Key | Email service | Coolify env var | Quarterly |
| TWN-S-004 | Sentry DSN | Error reporting | Coolify env var | Annually |
| TWN-S-005 | MeiliSearch Master Key | Search API | Coolify env var | Quarterly |
| TWN-S-006 | Cloudflare API Token | DNS/WAF management | Coolify env var | Annually |
| TWN-S-007 | Google OAuth Client Secret | OAuth login | Coolify env var | Annually |
| TWN-S-008 | Microsoft OAuth Client Secret | OAuth login | Coolify env var | Annually |
| TWN-S-009 | Stripe Secret Key (P3) | Payment processing | Coolify env var | Quarterly |
| TWN-S-010 | HubSpot API Key (P1) | CRM integration | Coolify env var | Quarterly |

---

## 3. Key Generation

### 3.1 Generation Environment

| Requirement | Specification |
|-------------|---------------|
| **Generation Location** | Secure local machine or Hetzner instance |
| **Entropy Source** | /dev/urandom or hardware RNG |
| **Generation Logging** | All key generation logged with timestamp and operator |
| **Backup During Generation** | Immediate encrypted backup to offline storage |

### 3.2 Generation Procedures

#### RSA Key Pair (JWT Signing)

```bash
# Generate RSA-2048 key pair for JWT
openssl genrsa -out jwt-private.pem 2048
openssl rsa -in jwt-private.pem -pubout -out jwt-public.pem

# Secure permissions
chmod 600 jwt-private.pem
chmod 644 jwt-public.pem
```

#### AES-256 Key (Application Encryption)

```bash
# Generate 256-bit random key
openssl rand -base64 32 > app-encryption.key

# Secure permissions
chmod 600 app-encryption.key
```

#### GPG Key (Backup Encryption)

```bash
# Generate RSA-4096 GPG key
gpg --full-generate-key
# Key type: RSA and RSA
# Key size: 4096
# Expiry: 2 years
```

---

## 4. Key Storage

### 4.1 Storage Tiers

| Tier | Location | Use Case | Security |
|------|----------|----------|----------|
| **Tier 1: Runtime** | Coolify environment variables | Active application use | Encrypted at rest by Coolify |
| **Tier 2: Backup** | Encrypted USB drive (safe deposit) | Disaster recovery | AES-256 encrypted, physically secured |
| **Tier 3: Offline** | Paper backup (shamir split) | Catastrophic recovery | Shamir's Secret Sharing (3-of-5) |

### 4.2 Coolify Secret Storage

```
Coolify Secret Management:
  - Secrets encrypted at rest in Coolify database
  - Injected as environment variables at container startup
  - Never exposed in logs or UI (masked display)
  - Access controlled by Coolify RBAC
  - Audit log of all secret access
```

### 4.3 Offline Backup Requirements

| Requirement | Specification |
|-------------|---------------|
| **Location** | Bank safe deposit box (Dubai) |
| **Format** | Encrypted USB drive + paper backup |
| **Update Frequency** | After every key rotation |
| **Access Control** | Dual control (2 of 3 authorized persons) |
| **Testing** | Annual restore test |

### 4.4 Shamir's Secret Sharing

For critical keys (JWT private key, backup encryption key):

```
Split key into 5 shares using Shamir's Secret Sharing (3-of-5 threshold)

Share holders:
  - Share 1: Project Sponsor (Chairman)
  - Share 2: IT/Technical Lead
  �� Share 3: Unisoft Security Lead
  - Share 4: Legal Counsel (sealed envelope)
  - Share 5: Bank safe deposit box

Recovery requires any 3 of 5 shares
```

---

## 5. Key Distribution

### 5.1 Distribution Channels

| Key Type | Distribution Method | Verification |
|----------|-------------------|--------------|
| Coolify secrets | Coolify web UI / API | Audit log review |
| GPG public keys | Internal key server | Fingerprint verification |
| TLS certificates | Cloudflare auto-provision | Certificate transparency logs |

### 5.2 Distribution Security

```
Never distribute private keys via:
  - Email
  - Slack/Teams
  - Unencrypted file sharing
  - Version control

Acceptable methods:
  - Coolify secret injection (automated)
  - Encrypted USB drive (physical handoff)
  - GPG-encrypted file (with verified recipient key)
```

---

## 6. Key Rotation

### 6.1 Rotation Schedule

| Key | Frequency | Method | Downtime |
|-----|-----------|--------|----------|
| JWT Signing Key | Annually | Rolling (7-day overlap) | None |
| Backup Encryption Key | 2 years | Re-encrypt all backups | Maintenance window |
| Application Encryption Key | Annually | Re-encrypt data | Maintenance window |
| API Key Master Salt | 90 days | Regenerate + rehash | None (new keys only) |
| Session Cookie Secret | Annually | Rolling restart | Brief (rolling) |
| Database Password | Quarterly | Update + restart | Brief (rolling) |
| Cloudflare API Token | Annually | Generate new, revoke old | None |
| OAuth Client Secrets | Annually | Update provider config | None |

### 6.2 JWT Key Rotation Procedure

```
Week 1:
  1. Generate new RSA key pair
  2. Add new public key to JWKS endpoint (both keys valid)
  3. Update Coolify with new private key
  4. Monitor for issues

Week 2:
  5. Remove old public key from JWKS
  6. Revoke old private key
  7. Update audit log
  8. Archive old key (encrypted backup)
```

### 6.3 Rotation Automation

| Key | Automation Level | Tool |
|-----|-----------------|------|
| TLS certificates | Fully automated | Cloudflare auto-renewal |
| Database password | Semi-automated | Ansible playbook |
| JWT signing key | Manual | Documented procedure |
| API keys | Semi-automated | Admin portal + cron |

---

## 7. Key Revocation

### 7.1 Revocation Triggers

| Trigger | Immediate Action | Notification |
|---------|-----------------|--------------|
| Suspected compromise | Revoke + rotate | Security Lead + Project Sponsor |
| Employee departure | Review + revoke if applicable | Security Lead |
| Policy violation | Revoke + investigate | Security Lead |
| Scheduled expiry | Rotate before expiry | Automated alert |
| Certificate revocation | Replace immediately | DevOps Lead |

### 7.2 Revocation Procedures

#### JWT Key Revocation

```
1. Remove public key from JWKS endpoint
2. Update token blacklist to reject tokens signed with old key
3. Force logout all users (optional, based on severity)
4. Generate and deploy new key pair
5. Update audit log
```

#### API Key Revocation

```
1. Mark key as revoked in database
2. Add key hash to revocation list
3. Notify key owner
4. Generate replacement key if needed
5. Update audit log
```

---

## 8. Key Destruction

### 8.1 Destruction Requirements

| Key Type | Destruction Method | Verification |
|----------|-------------------|--------------|
| Digital keys | Secure erase (shred, wipe) | Cryptographic erase confirmation |
| Paper backups | Cross-cut shredding | Visual confirmation |
| USB drives | Physical destruction | Photo documentation |

### 8.2 Secure Erase Procedure

```bash
# For files
shred -vfz -n 3 private-key.pem

# For LUKS volumes
cryptsetup luksErase /dev/mapper/twinmos-data

# For SSDs (ATA secure erase)
hdparm --user-master u --security-erase-enhanced p /dev/sda
```

### 8.3 Destruction Audit

| Record | Required |
|--------|----------|
| Key identifier | Yes |
| Destruction date | Yes |
| Destruction method | Yes |
| Operator name | Yes |
| Witness name | Yes |
| Verification method | Yes |

---

## 9. Key Recovery

### 9.1 Recovery Scenarios

| Scenario | Recovery Method | Time Required |
|----------|----------------|---------------|
| Lost Coolify secret | Restore from offline backup | 2-4 hours |
| Corrupted database | Restore from encrypted backup | 4-8 hours |
| Compromised key | Emergency rotation | 1-2 hours |
| Lost all online keys | Shamir secret sharing reconstruction | 4-24 hours |

### 9.2 Emergency Contact

| Role | Contact | Escalation |
|------|---------|------------|
| Primary | Security Lead | 24/7 |
| Secondary | IT/Technical Lead | Business hours |
| Tertiary | Project Sponsor | Emergency only |

---

## 10. Access Control

### 10.1 Role-Based Key Access

| Role | Key Access | Approval Required |
|------|-----------|-------------------|
| Security Lead | All keys | Self-approved (logged) |
| DevOps Lead | Runtime secrets, TLS certs | Self-approved (logged) |
| Developer | Development environment only | Security Lead |
| Contractor | Time-limited, specific keys | Security Lead + Project Sponsor |
| Auditor | Read-only audit logs | Security Lead |

### 10.2 Access Logging

| Event | Logged |
|-------|--------|
| Key generation | Yes |
| Key rotation | Yes |
| Key revocation | Yes |
| Key access (read) | Yes |
| Key export | Yes |
| Failed access attempts | Yes |

---

## 11. Audit and Monitoring

### 11.1 Audit Trail Requirements

| Requirement | Implementation |
|-------------|---------------|
| Immutable logs | Write-once storage (Backblaze B2) |
| Log retention | 24 months |
| Log review | Monthly by Security Lead |
| Alerting | Real-time for critical events |

### 11.2 Monitored Events

| Event | Severity | Alert |
|-------|----------|-------|
| Unauthorized key access | Critical | Immediate |
| Key rotation failure | High | Within 1 hour |
| Key export attempt | High | Immediate |
| Certificate expiry < 30 days | Medium | Daily digest |
| Failed decryption attempt | High | Immediate |

---

## 12. Compliance Mapping

### 12.1 GDPR Article 32

| Requirement | Key Management Implementation |
|-------------|------------------------------|
| Security of processing | Key encryption, access control |
| Pseudonymization | Encryption keys separate from data |
| Integrity | Key rotation, audit trails |

### 12.2 Industry Standards

| Standard | Requirement | Implementation |
|----------|-------------|---------------|
| NIST SP 800-57 | Key lifecycle management | Documented procedures |
| OWASP ASVS | Cryptographic key management | This document |
| ISO 27001 | Key management controls | Access control, audit |

---

## 13. Implementation Checklist

- [ ] Generate all initial keys
- [ ] Document key inventory
- [ ] Configure Coolify secret storage
- [ ] Create offline backups (encrypted USB + paper)
- [ ] Set up Shamir's Secret Sharing for critical keys
- [ ] Configure key rotation schedules
- [ ] Document rotation procedures
- [ ] Set up audit logging
- [ ] Configure monitoring alerts
- [ ] Test key recovery procedures
- [ ] Train authorized personnel
- [ ] Schedule quarterly key review

---

**End of Document**

This document is part of the TwinMOS Security & Compliance documentation suite.
Related documents:
- TWN-SEC-2026-007: Encryption Strategy
- TWN-SEC-2026-001: Security Architecture
