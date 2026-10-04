---
title: "Data Security"
slug: "data-security"
url: "/technology/data-security/"
template: "technology-detail"
description: "TwinMOS data security technologies: AES-256-XTS hardware encryption, TCG Opal 2.0 self-encrypting drives, IEEE 1667 compliance, secure erase protocols, pre-boot authentication, and enterprise security best practices."
keywords: ["hardware encryption", "data security", "SSD encryption", "AES-256", "secure storage", "TCG Opal", "self-encrypting drive", "secure erase", "pre-boot authentication"]
persona: ["enterprise", "oem", "government", "prosumer"]
phase: P1
priority: P0
owner: "marketing"
status: draft
last_reviewed: "2026-04-29"
locale: en
schema: "Article"
ctas:
  - label: "Contact Enterprise Sales"
    url: "/contact/enterprise/"
    style: "primary"
  - label: "View Enterprise Solutions"
    url: "/solutions/enterprise-smb/"
    style: "secondary"
cross_links:
  - "/technology/data-integrity/"
  - "/technology/controller-technology/"
  - "/support/warranty-policy/"
  - "/solutions/enterprise-smb/"
  - "/solutions/telco-bfsi-government/"
sources: ["CP"]
---

# Data Security

## Overview

Protecting sensitive data is a top priority for enterprise, government, healthcare, and personal users. As data breaches become more frequent and regulatory requirements tighten, hardware-level security is no longer optional — it is essential. TwinMOS storage products incorporate comprehensive hardware-based encryption and security features to safeguard information at rest, ensuring data remains protected even if the physical drive is lost, stolen, or decommissioned.

Unlike software encryption, which consumes CPU cycles and can be bypassed at the OS level, hardware encryption operates entirely within the SSD controller. Data is encrypted before it reaches the NAND flash and decrypted on read, with encryption keys stored in secure controller memory that is inaccessible to the host system.

## Hardware Encryption: AES-256-XTS

Select TwinMOS SSDs implement AES-256-XTS hardware encryption, the industry gold standard for storage device security.

### What is AES-256-XTS?

AES (Advanced Encryption Standard) with 256-bit keys in XTS (XEX-based tweaked-codebook mode with ciphertext stealing) mode is the recommended encryption standard for storage devices:

- **AES-256** — 256-bit key length provides 2^256 possible combinations, making brute-force attacks computationally infeasible
- **XTS mode** — Designed specifically for block-based storage devices, preventing pattern leakage and ensuring identical plaintext blocks encrypt to different ciphertext
- **Hardware implementation** — Dedicated AES engine in the controller encrypts/decrypts at full interface speed with zero host CPU impact

### How Hardware Encryption Works

1. **Data write path** — Host sends plaintext data → Controller AES engine encrypts with internal key → Encrypted data written to NAND
2. **Data read path** — Encrypted data read from NAND → Controller AES engine decrypts with internal key → Plaintext returned to host
3. **Key management** — Encryption keys generated internally, stored in controller secure memory, never exposed to host bus

### Benefits of Hardware Encryption

| Benefit | Hardware Encryption | Software Encryption (BitLocker/FileVault) |
|---------|--------------------|-------------------------------------------|
| **Performance impact** | Zero — dedicated AES engine | 5–30% CPU overhead |
| **Host CPU usage** | None | Significant during I/O |
| **Key protection** | Keys in controller secure memory | Keys in OS-accessible memory |
| **Bypass resistance** | Cannot be bypassed via OS | Vulnerable to OS-level attacks |
| **Power efficiency** | No additional power draw | Higher CPU power consumption |
| **Transparency** | Invisible to OS and applications | Requires OS driver support |

### Performance Characteristics

TwinMOS hardware encryption engines sustain full drive throughput:

| Interface | Max Throughput | AES-256 Impact |
|-----------|---------------|----------------|
| PCIe Gen 5.0 ×4 | 14,000 MB/s | Zero — engine operates at line rate |
| PCIe Gen 4.0 ×4 | 7,500 MB/s | Zero — engine operates at line rate |
| PCIe Gen 3.0 ×4 | 3,600 MB/s | Zero — engine operates at line rate |
| SATA III | 580 MB/s | Zero — engine operates at line rate |

## TCG Opal 2.0: Self-Encrypting Drive Standard

TwinMOS enterprise and professional SSDs support the Trusted Computing Group (TCG) Opal Storage Specification, the industry standard for self-encrypting drives (SEDs).

### What is TCG Opal?

TCG Opal defines a standard architecture for hardware-based encryption on storage devices, ensuring interoperability across management software and platforms. Version 2.0 adds:

- **Multiple locking ranges** — Independent encryption zones with separate access controls
- **Administrative and user roles** — Tiered password policies and permissions
- **PSID revert** — Physical presence-based factory reset for lost credential recovery
- **MBR shadowing** — Pre-boot environment support for authentication

### Opal 2.0 Features on TwinMOS SSDs

#### Pre-Boot Authentication (PBA)

Before the operating system loads, the SSD presents an authentication screen:

- **User password** — Required to unlock the drive and boot the OS
- **Admin password** — Enables drive management, password resets, and policy changes
- **BIOS/UEFI integration** — Compatible with major motherboard firmware

#### Locking Ranges

Opal 2.0 supports up to 9 independent locking ranges per drive:

| Range | Typical Use | Access Control |
|-------|-------------|----------------|
| Global Range | Entire drive | Master password |
| Range 1 | OS partition | User password |
| Range 2 | Data partition | Separate user password |
| Range 3+ | Application-specific | Role-based access |

#### Password Policies

Administrators can configure:

- **Minimum password length** — Enforce strong credential requirements
- **Password expiration** — Mandatory periodic password changes
- **Failed attempt limits** — Drive lockout after repeated incorrect entries
- **Password complexity** — Require mixed case, numbers, and symbols

### IEEE 1667 Support

TwinMOS Opal-enabled SSDs also support IEEE 1667 (Standard Protocol for Authentication in Host Attachments of Transient Storage Devices), enabling:

- **Windows eDrive** — Native BitLocker hardware encryption integration
- **Microsoft InstantGo** — Fast resume with hardware-secured sleep states
- **Cross-platform compatibility** — Standardized authentication across operating systems

## Secure Erase: Safe Drive Decommissioning

When retiring, repurposing, or selling a storage device, simply deleting files or formatting the drive leaves data recoverable. TwinMOS SSDs support multiple secure erase methods that cryptographically invalidate all data.

### Crypto Erase

The fastest and most secure method for encrypted drives:

- **Mechanism** — Internal encryption key is destroyed and regenerated
- **Result** — All existing data becomes unrecoverable (AES-256 ciphertext without key)
- **Duration** — Typically < 1 second
- **NAND wear** — Zero impact on flash endurance

Crypto erase is the recommended method for Opal-enabled TwinMOS SSDs.

### Block Erase

For non-encrypted drives or compliance scenarios requiring physical overwrite:

- **Mechanism** — All NAND blocks are erased to factory state
- **Result** — Data overwritten with erased cell state (all 1s in NAND)
- **Duration** — Proportional to drive capacity (minutes for large drives)
- **NAND wear** — Consumes one program/erase cycle per block

### Sanitize Command (NVMe)

NVMe 1.3+ defines the Sanitize command with multiple options:

| Sanitize Type | Method | Duration | Verification |
|---------------|--------|----------|--------------|
| Block Erase | NAND block erase | Medium | Optional post-scan |
| Overwrite | Pattern write | Long | Not applicable |
| Crypto Erase | Key destruction | Instant | Implicit |

TwinMOS NVMe SSDs support all three sanitize types, with Crypto Erase recommended for maximum speed and NAND longevity.

### Compliance Standards

Secure erase on TwinMOS SSDs aligns with major data sanitization standards:

- **NIST SP 800-88 Rev. 1** — Clear, Purge, and Destroy guidelines
- **DoD 5220.22-M** — Department of Defense media sanitization
- **HIPAA** — Healthcare data protection requirements
- **GDPR** — EU data erasure obligations ("right to be forgotten")

## Data Security Best Practices

### For Enterprise Deployments

1. **Enable hardware encryption by default** — Configure all corporate SSDs with TCG Opal during provisioning
2. **Implement centralized management** — Use Opal management software (Wave Embassy, WinMagic, McAfee) for policy enforcement
3. **Enforce pre-boot authentication** — Require user credentials before OS boot on all laptops
4. **Perform crypto erase before decommissioning** — Standard procedure for drive retirement or employee departure
5. **Maintain audit logs** — Track encryption status, access attempts, and sanitization events

### For Government and Regulated Industries

- **FIPS 140-2** — Select TwinMOS enterprise models target FIPS 140-2 Level 2 validation
- **Common Criteria** — EAL certification for high-assurance environments
- **TAA compliance** — Trade Agreements Act compliance for US government procurement

### For Personal Users

- **Enable hardware encryption** — If your TwinMOS SSD supports it, enable encryption in BIOS or management software
- **Set strong passwords** — Use unique, complex passwords for Opal authentication
- **Secure erase before resale** — Always sanitize drives before selling or disposing
- **Backup recovery credentials** — Store PSID or recovery keys in a secure location

## Security Feature Availability by Product

| Product | AES-256 | TCG Opal 2.0 | IEEE 1667 | Secure Erase | Target Segment |
|---------|---------|--------------|-----------|--------------|----------------|
| CoreX Pro Gen5 NVMe | Yes | Yes | Yes | Crypto/Block/Sanitize | Enterprise, Professional |
| Xtreme Gen4 NVMe | Yes | Optional | Yes | Crypto/Block/Sanitize | Enthusiast, Prosumer |
| Xtreme Pro Gen4 NVMe | Yes | Optional | Yes | Crypto/Block/Sanitize | Gaming, Content Creation |
| Alpha Pro Gen3 NVMe | Yes | No | No | Block/Sanitize | Mainstream |
| Hyper H2 Ultra SATA | Yes | No | No | Block | Budget, Legacy |

**Note:** Hardware encryption and TCG Opal availability vary by product SKU and region. Contact TwinMOS sales for detailed specifications on security-enabled models.

## Anti-Counterfeiting and Product Authentication

Beyond data security, TwinMOS is implementing product authentication measures to protect customers from counterfeit storage devices:

- **Serial number verification** — Online validation of genuine TwinMOS products (Phase 2)
- **Packaging security features** — Holographic seals and tamper-evident labels
- **Authorized distributor network** — Purchase only from verified TwinMOS partners

[Contact Enterprise Sales →](/contact/enterprise/)
[Learn About Data Integrity →](/technology/data-integrity/)
[View Enterprise Solutions →](/solutions/enterprise-smb/)
