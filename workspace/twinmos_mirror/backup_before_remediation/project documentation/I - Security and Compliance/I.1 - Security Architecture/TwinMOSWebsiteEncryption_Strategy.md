# TwinMOS Corporate Website - Encryption Strategy

**Document Reference:** TWN-SEC-2026-007
**Document Version:** 1.0
**Status:** FINAL
**Date:** 2 May 2026
**Prepared by:** TwinMOS Digital Transformation Team
**Owner:** IT/Technical Lead / Security Lead
**Classification:** CONFIDENTIAL - Internal Use
**Synchronized With:** Tech Stack v1.1, BRD v3.0 (Section 21.1, 21.3), URD v3.0

---

## Change Log

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2 May 2026 | Initial release - comprehensive encryption strategy |

---

## Document Governance

| Role | Name | Sign-Off | Date |
|------|------|----------|------|
| Project Sponsor | Mohd Mazharul Islam | _______________ | _________ |
| IT/Technical Lead | (TBC) | _______________ | _________ |
| Unisoft Security Lead | (TBC) | _______________ | _________ |

---

## Table of Contents

1. Executive Summary
2. Encryption in Transit
3. Encryption at Rest
4. Database Encryption
5. Backup Encryption
6. Secret and Credential Encryption
7. Email Encryption
8. Key Management Overview
9. Algorithm and Protocol Selection
10. Certificate Management
11. Compliance Mapping
12. Implementation Checklist

---

## 1. Executive Summary

This document defines the encryption strategy for the TwinMOS corporate website. All sensitive data is protected by encryption both in transit and at rest, using industry-standard algorithms and key lengths.

**Encryption Principles:**
- TLS 1.3 for all data in transit
- AES-256 for data at rest
- LUKS for disk encryption
- Strong key derivation (bcrypt, PBKDF2)
- Regular key rotation

---

## 2. Encryption in Transit

### 2.1 TLS Configuration

| Aspect | Specification |
|--------|---------------|
| **Minimum Version** | TLS 1.3 |
| **Legacy Support** | TLS 1.2 (transitional; deprecated by Month 6) |
| **Certificate Authority** | Cloudflare-managed (Let's Encrypt or Cloudflare Origin CA) |
| **Cipher Suites (TLS 1.3)** | TLS_AES_256_GCM_SHA384, TLS_CHACHA20_POLY1305_SHA256 |
| **Certificate Type** | ECDSA P-256 (preferred) or RSA 2048 |
| **HSTS** | max-age=31536000; includeSubDomains; preload |

### 2.2 TLS Handshake Flow

```text
Client -> Cloudflare Edge (TLS 1.3)
       -> Cloudflare Origin (TLS 1.3 with Origin CA cert)
       -> Strapi Backend (TLS-terminated at Cloudflare)
```

### 2.3 Certificate Pinning

| Type | Implementation |
|------|----------------|
| HTTP Public Key Pinning (HPKP) | Deprecated; not used |
| Certificate Transparency | Required; monitored via Google CT logs |
| Expect-CT | enforce, max-age=86400 |

### 2.4 Internal Service Communication

| Communication | Encryption |
|---------------|------------|
| Astro frontend -> Strapi API | TLS 1.3 (via Cloudflare) |
| Strapi -> PostgreSQL | TLS (PostgreSQL SSL mode=require) |
| Strapi -> MeiliSearch | TLS (MeiliSearch HTTPS) |
| Strapi -> Backblaze B2 | TLS 1.3 (S3-compatible API) |
| Strapi -> Resend | TLS 1.3 (HTTPS API) |

---

## 3. Encryption at Rest

### 3.1 Data Classification and Encryption Requirements

| Data Type | Storage Location | Encryption | Algorithm |
|-----------|-----------------|------------|-----------|
| User passwords (hashed) | PostgreSQL | bcrypt | bcrypt (cost 12) |
| JWT signing keys | Coolify secrets | N/A (access control) | RS256 |
| API keys | PostgreSQL | bcrypt | bcrypt (cost 12) |
| Session tokens | PostgreSQL / Redis | N/A (random tokens) | N/A |
| Form submissions | PostgreSQL | Application-level | AES-256-GCM |
| Product images | Backblaze B2 | Server-side encryption | AES-256 |
| Backups | Backblaze B2 | Client-side encryption | AES-256 |
| Audit logs | PostgreSQL + B2 | Application-level | AES-256-GCM |
| CMS content | PostgreSQL | Database encryption | AES-256 (LUKS) |

### 3.2 Application-Level Encryption

```javascript
// Conceptual: Strapi middleware for sensitive fields
const crypto = require('crypto');

function encryptField(plaintext, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return {
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    ciphertext: encrypted
  };
}

function decryptField(encryptedObj, key) {
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(encryptedObj.iv, 'hex')
  );
  decipher.setAuthTag(Buffer.from(encryptedObj.authTag, 'hex'));
  let decrypted = decipher.update(encryptedObj.ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

---

## 4. Database Encryption

### 4.1 PostgreSQL Encryption

| Layer | Implementation |
|-------|----------------|
| **Disk Encryption** | LUKS (Linux Unified Key Setup) on Hetzner volume |
| **Connection Encryption** | SSL/TLS (sslmode=require) |
| **Column-Level Encryption** | pgcrypto extension for sensitive fields |
| **Backup Encryption** | pg_dump with AES-256 encryption |

### 4.2 LUKS Configuration

```bash
# Disk encryption setup
cryptsetup luksFormat /dev/vdb --cipher aes-xts-plain64 --key-size 512
cryptsetup open /dev/vdb twinmos-data
mkfs.ext4 /dev/mapper/twinmos-data
mount /dev/mapper/twinmos-data /var/lib/postgresql
```

### 4.3 PostgreSQL SSL Configuration

```
# postgresql.conf
ssl = on
ssl_cert_file = 'server.crt'
ssl_key_file = 'server.key'
ssl_ciphers = 'HIGH:!aNULL:!MD5'
ssl_min_protocol_version = 'TLSv1.3'
```

---

## 5. Backup Encryption

### 5.1 Backup Encryption Strategy

| Backup Type | Frequency | Encryption | Storage |
|-------------|-----------|------------|---------|
| PostgreSQL pg_dump | Daily | AES-256 (gpg) | Backblaze B2 |
| WAL archives | Continuous | AES-256 (gpg) | Backblaze B2 |
| Strapi uploads | On write | Backblaze SSE | Backblaze B2 |
| Coolify config | Weekly | AES-256 (gpg) | Backblaze B2 |
| Compliance archive | Quarterly | AES-256 + Glacier | Backblaze B2 |

### 5.2 GPG Encryption for Backups

```bash
# Generate backup encryption key
gpg --gen-key --batch <<EOF
%no-protection
Key-Type: RSA
Key-Length: 4096
Name-Real: TwinMOS Backup Encryption
Name-Email: backup-encryption@twinmos.com
Expire-Date: 2y
%commit
EOF

# Encrypt backup
gpg --encrypt --recipient backup-encryption@twinmos.com backup.sql

# Decrypt backup
gpg --decrypt backup.sql.gpg > backup.sql
```

### 5.3 Backblaze B2 Server-Side Encryption

| Feature | Configuration |
|---------|--------------|
| SSE-B2 | Enabled by default |
| Encryption Algorithm | AES-256 |
| Key Management | Backblaze-managed |
| Additional Client-Side | GPG for compliance archives |

---

## 6. Secret and Credential Encryption

### 6.1 Secret Storage Hierarchy

| Secret Type | Storage | Encryption |
|-------------|---------|------------|
| Database passwords | Coolify env vars | Encrypted at rest (Coolify) |
| JWT private key | Coolify env vars | Encrypted at rest (Coolify) |
| API keys | Coolify env vars | Encrypted at rest (Coolify) |
| OAuth client secrets | Coolify env vars | Encrypted at rest (Coolify) |
| Stripe keys (P3) | Coolify env vars | Encrypted at rest (Coolify) |
| S3/B2 credentials | Coolify env vars | Encrypted at rest (Coolify) |

### 6.2 Coolify Secret Management

```
Secrets stored in Coolify:
  - Encrypted at rest (Coolify database encryption)
  - Injected as environment variables at runtime
  - Never logged or exposed in UI (masked)
  - Access controlled by Coolify RBAC
```

### 6.3 Secret Rotation Schedule

| Secret Type | Rotation Frequency | Trigger |
|-------------|-------------------|---------|
| Database password | Quarterly | Scheduled |
| JWT signing key | Annually | Scheduled |
| API keys | 90 days | Scheduled |
| OAuth client secrets | Annually | Scheduled |
| Cloudflare API token | Annually | Scheduled |
| Backup encryption key | 2 years | Scheduled |

---

## 7. Email Encryption

### 7.1 Transport Encryption

| Aspect | Configuration |
|--------|--------------|
| **Outbound SMTP** | TLS 1.3 (Resend API) |
| **Inbound Email** | N/A (no inbound email server) |
| **DNS Records** | SPF, DKIM, DMARC configured |

### 7.2 DMARC Policy

```
DMARC record: v=DMARC1; p=quarantine; rua=mailto:dmarc@twinmos.com; pct=100
```

**Phased Rollout:**
- Month 1-3: p=none (monitoring)
- Month 4-6: p=quarantine (25% -> 50% -> 100%)
- Month 7+: p=reject

---

## 8. Key Management Overview

### 8.1 Key Hierarchy

```text
Root Key (HSM or hardware-backed)
  |
  +-- Master Encryption Key (MEK)
  |     |
  |     +-- Database Encryption Key (DEK)
  |     +-- Backup Encryption Key (BEK)
  |     +-- Application Encryption Key (AEK)
  |
  +-- Signing Keys
  |     |
  |     +-- JWT RS256 Private Key
  |     +-- JWT RS256 Public Key
  |
  +-- TLS Certificates
        |
        +-- Cloudflare Origin CA
        +-- Let's Encrypt (auto-renewed)
```

### 8.2 Key Generation Standards

| Key Type | Algorithm | Length | Generation |
|----------|-----------|--------|------------|
| Symmetric encryption | AES | 256 bits | /dev/urandom or crypto.randomBytes |
| Asymmetric signing | RSA | 2048 bits | openssl genrsa |
| Asymmetric signing | ECDSA | P-256 | openssl ecparam |
| Password hashing | bcrypt | Cost 12 | bcrypt.hash() |

---

## 9. Algorithm and Protocol Selection

### 9.1 Approved Algorithms

| Purpose | Primary | Alternative | Deprecated |
|---------|---------|-------------|------------|
| Symmetric encryption | AES-256-GCM | AES-128-GCM | AES-CBC, 3DES |
| Asymmetric encryption | RSA-OAEP-256 | ECDH | RSA-PKCS1-v1_5 |
| Digital signatures | RS256 (RSA-PSS) | ES256 (ECDSA) | RS1, MD5 |
| Hashing | SHA-256 | SHA-384 | SHA-1, MD5 |
| Password hashing | bcrypt (cost 12) | Argon2id | PBKDF2, scrypt |
| Key derivation | HKDF-SHA256 | PBKDF2 | None |

### 9.2 Deprecated Algorithms

| Algorithm | Reason | Action |
|-----------|--------|--------|
| SSL 2.0/3.0 | Vulnerable to POODLE | Block entirely |
| TLS 1.0/1.1 | Vulnerable to multiple attacks | Block by Month 3 |
| RC4 | Broken stream cipher | Block entirely |
| DES/3DES | Insufficient key length | Block entirely |
| MD5 | Collision attacks | Block entirely |
| SHA-1 | Collision attacks | Deprecate by Month 6 |

---

## 10. Certificate Management

### 10.1 Certificate Inventory

| Certificate | Type | Issuer | Expiry | Auto-Renew |
|-------------|------|--------|--------|------------|
| twinmos.com | Edge | Cloudflare | 90 days | Yes (Cloudflare) |
| admin.twinmos.com | Edge | Cloudflare | 90 days | Yes (Cloudflare) |
| api.twinmos.com | Origin | Cloudflare Origin CA | 15 years | Yes (Cloudflare) |
| imgproxy.twinmos.com | Origin | Cloudflare Origin CA | 15 years | Yes (Cloudflare) |

### 10.2 Certificate Monitoring

| Check | Frequency | Alert Threshold |
|-------|-----------|-----------------|
| Expiry date | Daily | < 30 days |
| Certificate transparency | Daily | Unauthorized issuance |
| OCSP status | Daily | Revoked certificate |
| Chain validation | Weekly | Broken chain |

---

## 11. Compliance Mapping

### 11.1 GDPR Article 32

| Requirement | Encryption Implementation |
|-------------|--------------------------|
| Pseudonymization | AES-256 for sensitive fields |
| Encryption of personal data | TLS 1.3 in transit, AES-256 at rest |
| Ongoing confidentiality | LUKS disk encryption, application-level encryption |
| Ongoing integrity | GCM mode provides authenticated encryption |

### 11.2 BRD Security Requirements

| Requirement | Implementation |
|-------------|---------------|
| TLS 1.3 | All connections |
| HSTS preload | Configured |
| Backup encryption | AES-256 GPG |
| Secure credential storage | bcrypt hashing |

---

## 12. Implementation Checklist

- [ ] Configure TLS 1.3 on Cloudflare
- [ ] Configure TLS 1.3 on origin (Coolify)
- [ ] Enable HSTS with preload
- [ ] Configure PostgreSQL SSL
- [ ] Enable LUKS disk encryption
- [ ] Implement application-level encryption for sensitive fields
- [ ] Configure GPG backup encryption
- [ ] Set up secret rotation schedule
- [ ] Configure DMARC policy (phased)
- [ ] Document all encryption keys and locations
- [ ] Set up certificate monitoring
- [ ] Test encryption/decryption workflows
- [ ] Verify no deprecated algorithms in use

---

**End of Document**

This document is part of the TwinMOS Security & Compliance documentation suite.
Related documents:
- TWN-SEC-2026-001: Security Architecture
- TWN-SEC-2026-008: Key Management Plan
