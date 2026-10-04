# TwinMOS Website — Dependency Security Scanning Specification

| Document Attribute | Value |
|---|---|
| **Document ID** | TWN-OPS-2026-004 |
| **Version** | 1.0.0 |
| **Status** | Draft |
| **Author** | Unisoft Technologies Security Team |
| **Owner** | DevOps Lead / Security Engineer |
| **Review Date** | 2026-11-01 |
| **Classification** | Internal Use |
| **Related Documents** | TWN-SEC-2026-001 (Security Architecture), TWN-SEC-2026-011 (Security Controls Catalog — SI-2, SI-5, CM-8), TWN-OPS-2026-002 (Vulnerability Management Plan), TWN-SEC-2026-010 (STRIDE Threat Model — T-CMS-07) |
| **Compliance Mapping** | NIST SP 800-53 Rev. 5 SI-2, SI-5, CM-8; ISO/IEC 27001:2022 A.8.8; OWASP A06:2021 Vulnerable and Outdated Components; PCI DSS 4.0 Req 6.3 |
| **Synchronized With** | BRD v3.0, Tech Stack v1.1, Implementation Strategy v3.0 |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Scope](#2-scope)
3. [Toolchain Overview](#3-toolchain-overview)
4. [Scan Types and Frequency](#4-scan-types-and-frequency)
5. [npm audit Configuration](#5-npm-audit-configuration)
6. [Snyk Integration](#6-snyk-integration)
7. [Dependabot Configuration](#7-dependabot-configuration)
8. [OWASP Dependency-Check](#8-owasp-dependency-check)
9. [Software Bill of Materials (SBOM)](#9-software-bill-of-materials-sbom)
10. [CVE Response SLAs and Remediation Workflow](#10-cve-response-slas-and-remediation-workflow)
11. [CI/CD Pipeline Integration](#11-cicd-pipeline-integration)
12. [License Compliance Policy](#12-license-compliance-policy)
13. [False Positive Management](#13-false-positive-management)
14. [Metrics and Reporting](#14-metrics-and-reporting)
15. [Governance](#15-governance)
16. [Appendix A — Tool Configuration Reference](#appendix-a--tool-configuration-reference)

---

## 1. Executive Summary

This specification defines the **dependency security scanning strategy** for the TwinMOS corporate website platform. Software dependencies — npm packages, Docker base images, and GitHub Actions — represent a significant attack surface via supply chain vulnerabilities (OWASP A06:2021). This document establishes the toolchain, scan frequency, CI/CD integration, CVE response SLAs, and governance processes that ensure TwinMOS's software supply chain remains secure throughout the development lifecycle.

### 1.1 Why Dependency Scanning Matters for TwinMOS

The TwinMOS website platform depends on hundreds of npm packages across the Astro frontend, Strapi CMS, and supporting tooling. A single compromised or vulnerable dependency can expose:
- Customer personal data (GDPR breach risk)
- CMS admin credentials (content integrity risk)
- Partner commercial data (P2, business risk)
- Payment processing integrity (P3, PCI DSS risk)

Historical incidents like the `event-stream` compromise and Log4Shell demonstrate that dependency vulnerabilities are routinely exploited at scale within hours of public disclosure.

### 1.2 Key Commitments

| Commitment | Target |
|---|---|
| Zero known Critical/High vulnerabilities in production | Ongoing |
| Critical CVE remediation time | ≤ 24 hours |
| SBOM generated per production build | ✅ Automated |
| Dependency scan on every PR | ✅ Automated |
| License compliance verified on every build | ✅ Automated |

---

## 2. Scope

### 2.1 In-Scope Assets

| Asset Category | Specific Targets | Scan Tools |
|---|---|---|
| **Frontend dependencies** | Astro 5, React, Tailwind CSS, all `package.json` deps | npm audit, Snyk, Dependabot |
| **CMS dependencies** | Strapi v5, all Strapi plugins, Knex.js, PostgreSQL driver | npm audit, Snyk, Dependabot |
| **Build tooling** | Vite, TypeScript compiler, ESLint, Prettier | npm audit, Snyk |
| **Docker base images** | Node.js Alpine, PostgreSQL, Nginx, Meilisearch | Grype, Trivy, Dependabot |
| **GitHub Actions** | All workflow actions in `.github/workflows/` | Dependabot |
| **Development tools** | Any tool in `devDependencies` that runs in CI | Snyk (dev mode) |

### 2.2 Out-of-Scope

| Asset | Reason |
|---|---|
| Cloudflare platform | Managed by Cloudflare; separate vendor security responsibility |
| Hetzner infrastructure | OS-level patching managed separately (OS hardening procedure) |
| Backblaze B2 client | Assessed separately as third-party service |
| End-user browser dependencies | External; controlled via CSP (TWN-SEC-2026-005) |

### 2.3 Repository Structure

```
twinmos-website/
├── frontend/                 # Astro 5 frontend
│   ├── package.json
│   └── package-lock.json
├── cms/                      # Strapi v5 CMS
│   ├── package.json
│   └── package-lock.json
├── .github/
│   ├── workflows/            # GitHub Actions (scanned by Dependabot)
│   └── dependabot.yml        # Dependabot configuration
├── docker-compose.yml        # Docker images (scanned by Dependabot + Grype)
└── .snyk                     # Snyk policy file
```

---

## 3. Toolchain Overview

| Tool | Purpose | Trigger | Output |
|---|---|---|---|
| **npm audit** | Native Node.js vulnerability scanner | Every PR, daily | JSON audit report, exit code on failure |
| **Snyk** | Comprehensive SCA with fix recommendations | Every PR, daily | SARIF report, PR annotations |
| **Dependabot** | Automated dependency update PRs | Daily (npm), Weekly (Docker, Actions) | Automated PRs with changelogs |
| **OWASP Dependency-Check** | Additional CVE source cross-reference | Weekly | HTML/XML/SARIF report |
| **CycloneDX** | SBOM generation (CycloneDX format) | Every production build | `.cdx.json` SBOM artifact |
| **Syft** | SBOM generation (SPDX format, Docker images) | Every production build | `.spdx.json` SBOM artifact |
| **Grype** | SBOM-based vulnerability scanning | Every production build | Vulnerability report against SBOM |
| **license-checker** | License compliance verification | Every PR | License inventory report |

### 3.1 Tool Selection Rationale

- **npm audit**: Zero-configuration, native to Node.js toolchain; provides baseline vulnerability detection from npm Advisory Database
- **Snyk**: Broader vulnerability database (including issues not yet in npm Advisory DB), actionable fix guidance, developer-friendly PR annotations; industry-standard for enterprise Node.js projects
- **Dependabot**: GitHub-native; no additional tooling required; automated PRs reduce developer friction for routine updates
- **OWASP Dependency-Check**: Additional CVE source (NVD); provides defense-in-depth against tool-specific gaps; particularly useful for transitive dependency coverage
- **CycloneDX + Grype**: SBOM-first scanning aligns with NIST SSDF and emerging software transparency requirements; enables point-in-time vulnerability assessment of specific released builds

---

## 4. Scan Types and Frequency

| Scan Type | Frequency | Tools | Environment | Blocking |
|---|---|---|---|---|
| PR dependency check | Every pull request | npm audit + Snyk | CI (GitHub Actions) | Yes — Critical/High block merge |
| Daily vulnerability scan | Daily (02:00 UTC) | npm audit + Snyk | CI scheduled | Alerts on new findings |
| Weekly comprehensive scan | Weekly (Monday 03:00 UTC) | OWASP Dependency-Check | CI scheduled | Report only |
| Per-build SBOM + scan | Every production build | CycloneDX + Grype | CI on merge to main | Yes — Critical blocks deployment |
| Docker image scan | Weekly + on Docker update | Grype / Trivy | CI | Yes — Critical blocks deployment |
| License compliance check | Every pull request | license-checker | CI | Yes — prohibited license blocks merge |
| Manual audit | Quarterly | All tools + manual review | Local + CI | Advisory |

---

## 5. npm audit Configuration

### 5.1 Usage

```bash
# Standard audit (dependencies only)
npm audit --omit=dev

# Full audit including devDependencies
npm audit

# Audit with JSON output for CI processing
npm audit --json > audit-results.json

# Fail on High or Critical only (used in PR checks)
npm audit --audit-level=high
```

### 5.2 Severity Interpretation

| Severity | CVSS Score Range | CI Behavior | Response SLA |
|---|---|---|---|
| **Critical** | 9.0–10.0 | Blocks PR merge and production deployment | 24 hours |
| **High** | 7.0–8.9 | Blocks PR merge | 7 days |
| **Moderate** | 4.0–6.9 | Warning only; creates tracking issue | 30 days |
| **Low** | 0.1–3.9 | Informational | 90 days |
| **Info** | 0.0 | Informational | Best effort |

### 5.3 Known Limitations

- npm audit only covers packages in the npm Advisory Database (not NVD-only CVEs)
- Transitive dependency vulnerabilities may appear without direct fix path
- False positive rate increases with deeply nested dependency trees

For these reasons, npm audit is used alongside Snyk and OWASP Dependency-Check rather than as a standalone tool.

---

## 6. Snyk Integration

### 6.1 Snyk Configuration

Snyk is integrated at the organization level via GitHub integration. All repositories in the `twinmos-website` GitHub organization are monitored continuously.

```yaml
# .snyk policy file
version: v1.25.1
ignore: {}
patch: {}
language-settings:
  javascript:
    packageManager: npm
    # Include dev dependencies in CI scans
    dev: true
    # SBOM generation
    sbom: true
```

### 6.2 Snyk CLI in CI

```bash
# Install Snyk CLI
npm install -g snyk

# Authenticate (use SNYK_TOKEN secret in CI)
snyk auth $SNYK_TOKEN

# Test and fail on High/Critical
snyk test --severity-threshold=high --sarif-file-output=snyk-results.sarif

# Monitor (track project in Snyk UI)
snyk monitor --project-name=twinmos-website-frontend
```

### 6.3 Snyk Fix Recommendations

Snyk provides automated fix PRs via GitHub integration. Fix PRs are:
- Auto-created for patch-level updates (no breaking changes)
- Proposed for minor updates with changelog review required
- Flagged for manual review for major updates

### 6.4 Snyk PR Annotations

Snyk annotates pull requests with:
- Inline comments on `package.json` changes introducing vulnerabilities
- PR status check that blocks merge on Critical/High findings
- Link to Snyk vulnerability details and fix guidance

### 6.5 Snyk False Positive Suppression

Suppressions managed in `.snyk` file with mandatory justification:

```yaml
# .snyk policy file — ignore section
ignore:
  SNYK-JS-EXAMPLE-123456:
    - '*':
        reason: >
          Vulnerability in test-only code path; not reachable in
          production. Confirmed via code review 2026-05-15.
        expires: '2026-08-15T00:00:00.000Z'
        created: '2026-05-15T00:00:00.000Z'
```

Suppressions require:
- Documented business justification
- Expiry date (maximum 90 days)
- Sign-off from Security Lead

---

## 7. Dependabot Configuration

### 7.1 Dependabot YAML Configuration

```yaml
# .github/dependabot.yml
version: 2

updates:
  # Frontend npm dependencies
  - package-ecosystem: "npm"
    directory: "/frontend"
    schedule:
      interval: "daily"
      time: "04:00"
      timezone: "UTC"
    open-pull-requests-limit: 10
    groups:
      # Group patch updates to reduce PR volume
      patch-updates:
        patterns:
          - "*"
        update-types:
          - "patch"
    labels:
      - "dependencies"
      - "frontend"
    assignees:
      - "unisoft-devops"
    reviewers:
      - "unisoft-security"
    # Pin major versions of security-critical packages
    ignore:
      - dependency-name: "strapi"
        update-types: ["version-update:semver-major"]

  # CMS npm dependencies
  - package-ecosystem: "npm"
    directory: "/cms"
    schedule:
      interval: "daily"
      time: "04:00"
      timezone: "UTC"
    open-pull-requests-limit: 10
    groups:
      patch-updates:
        patterns:
          - "*"
        update-types:
          - "patch"
    labels:
      - "dependencies"
      - "cms"
    assignees:
      - "unisoft-devops"
    reviewers:
      - "unisoft-security"

  # Docker base images
  - package-ecosystem: "docker"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    labels:
      - "dependencies"
      - "docker"
    reviewers:
      - "unisoft-devops"
      - "unisoft-security"

  # GitHub Actions
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    labels:
      - "dependencies"
      - "github-actions"
    reviewers:
      - "unisoft-devops"
```

### 7.2 Dependabot PR Review Process

| Update Type | Auto-merge Eligible | Review Required | Testing Required |
|---|---|---|---|
| Patch (x.x.X) — non-security | No | DevOps review | Smoke test in staging |
| Patch — security fix | No | Security Lead review | Smoke test in staging |
| Minor (x.X.0) | No | Dev Lead review | Full test suite in staging |
| Major (X.0.0) | No | Dev Lead + TwinMOS IT | Full regression in staging |
| Docker digest update | No | DevOps review | Container health check |

Note: Auto-merge is intentionally disabled to ensure human review of all dependency changes. Dependabot PRs accumulate in a weekly review session (Monday) unless a security fix requires immediate attention.

---

## 8. OWASP Dependency-Check

### 8.1 Purpose

OWASP Dependency-Check provides additional coverage beyond npm audit and Snyk by:
- Cross-referencing CVEs from NVD (National Vulnerability Database)
- Identifying vulnerabilities via CPE (Common Platform Enumeration) matching
- Covering vulnerabilities not yet processed by npm Advisory DB

### 8.2 GitHub Actions Integration

```yaml
# .github/workflows/owasp-dependency-check.yml
name: OWASP Dependency Check

on:
  schedule:
    - cron: '0 3 * * 1'  # Monday 03:00 UTC
  workflow_dispatch:

jobs:
  dependency-check:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run OWASP Dependency Check
        uses: dependency-check/Dependency-Check_Action@main
        with:
          project: 'twinmos-website'
          path: '.'
          format: 'ALL'
          out: 'dependency-check-report'
          args: >
            --enableExperimental
            --nvdApiKey ${{ secrets.NVD_API_KEY }}
            --failOnCVSS 7

      - name: Upload OWASP Report
        uses: actions/upload-artifact@v4
        with:
          name: owasp-dependency-check-report
          path: dependency-check-report/
          retention-days: 90

      - name: Upload SARIF to GitHub Security
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: dependency-check-report/dependency-check-report.sarif
```

### 8.3 Suppression File

Known false positives suppressed via XML suppression file:

```xml
<!-- dependency-check-suppression.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<suppressions xmlns="https://jeremylong.github.io/DependencyCheck/dependency-suppression.1.3.xsd">
  <!-- Example suppression: CVE in test-only code path -->
  <suppress>
    <notes>
      CVE-XXXX-XXXXX: Vulnerability in test utilities only;
      not included in production build. Reviewed 2026-05-01.
      Expires 2026-08-01.
    </notes>
    <cve>CVE-XXXX-XXXXX</cve>
    <until>2026-08-01</until>
  </suppress>
</suppressions>
```

---

## 9. Software Bill of Materials (SBOM)

### 9.1 SBOM Purpose and Requirements

A Software Bill of Materials (SBOM) provides a complete inventory of software components in each production release. TwinMOS generates SBOMs to:
- Enable precise vulnerability assessment against specific deployed versions
- Support regulatory transparency requirements (NIST SSDF, EU Cyber Resilience Act)
- Facilitate rapid impact assessment when new CVEs are disclosed
- Provide supply chain transparency for enterprise/government customers

### 9.2 CycloneDX SBOM Generation (npm packages)

```bash
# Install CycloneDX CLI
npm install -g @cyclonedx/cyclonedx-npm

# Generate SBOM for frontend
cd frontend
cyclonedx-npm --output-format JSON --output-file sbom-frontend.cdx.json

# Generate SBOM for CMS
cd ../cms
cyclonedx-npm --output-format JSON --output-file sbom-cms.cdx.json
```

### 9.3 Syft SBOM Generation (Docker images)

```bash
# Install Syft
curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh

# Generate SBOM for Docker image
syft twinmos-website:latest -o spdx-json > sbom-docker.spdx.json

# Generate CycloneDX format for Docker image
syft twinmos-website:latest -o cyclonedx-json > sbom-docker.cdx.json
```

### 9.4 Grype SBOM-based Vulnerability Scanning

```bash
# Install Grype
curl -sSfL https://raw.githubusercontent.com/anchore/grype/main/install.sh | sh

# Scan SBOM for vulnerabilities
grype sbom:sbom-frontend.cdx.json --output sarif > grype-frontend-results.sarif

# Fail on Critical/High
grype sbom:sbom-frontend.cdx.json --fail-on high
```

### 9.5 SBOM Archiving

| SBOM Type | Format | Storage | Retention |
|---|---|---|---|
| npm (frontend) | CycloneDX JSON | GitHub Releases artifact | 3 years |
| npm (CMS) | CycloneDX JSON | GitHub Releases artifact | 3 years |
| Docker image | SPDX JSON + CycloneDX | GitHub Releases artifact | 3 years |
| Merged/combined SBOM | CycloneDX JSON | Secure document store | 3 years |

SBOMs are generated and archived for every tagged production release to enable retrospective vulnerability assessment.

---

## 10. CVE Response SLAs and Remediation Workflow

### 10.1 CVE Response SLAs

| Severity | CVSS Range | Response SLA | Remediation SLA | Escalation |
|---|---|---|---|---|
| **Critical** | 9.0–10.0 | 2 hours (alert acknowledged) | 24 hours | Immediate — Security Lead + Dev Lead + TwinMOS IT |
| **High** | 7.0–8.9 | 4 hours | 7 days | Security Lead within 4 hours |
| **Medium** | 4.0–6.9 | Next business day | 30 days | Monthly security review |
| **Low** | 0.1–3.9 | Weekly triage | 90 days | Quarterly review |

SLAs measured from time of first detection (automated scan alert or NVD publication, whichever is earlier).

### 10.2 Remediation Options (in priority order)

| Option | When to Use | Risk | Time |
|---|---|---|---|
| **Update to patched version** | Patched version available, compatible | Low | Fast (hours) |
| **Apply vendor patch/workaround** | No patched version; vendor mitigation available | Low-Medium | Medium |
| **WAF rule to block exploit** | Exploitable via web request; patch delayed | Medium | Fast |
| **Feature/code removal** | Vulnerable feature not needed | Low | Medium |
| **Risk acceptance (temporary)** | Patch breaks functionality; mitigating controls exist | Must be approved | N/A |
| **Replace dependency** | No patch expected; better alternative exists | High (migration effort) | High |

### 10.3 Remediation Workflow

```
[CVE Detected by automated scan / advisory]
        │
        ▼
[Security Lead notified (automated alert)]
        │
        ▼
[Assessment: Does TwinMOS use the vulnerable code path?]
  ├─ No → Mark as not applicable; document in suppression file
  └─ Yes ↓
        │
        ▼
[Classify severity; assign SLA]
        │
        ▼
[Identify remediation option (above priority order)]
        │
        ▼
[Create remediation PR → CI scans must pass → peer review]
        │
        ▼
[Deploy to staging → smoke test → production deployment]
        │
        ▼
[Post-remediation scan confirms CVE resolved]
        │
        ▼
[Close vulnerability ticket; update metrics]
```

### 10.4 Critical CVE Emergency Response (24-hour window)

For Critical severity CVEs (CVSS ≥ 9.0):

1. **Hour 0** — Alert detected; Security Lead paged immediately
2. **Hour 1** — Assessment complete; severity confirmed; Dev Lead and TwinMOS IT Lead notified
3. **Hour 2** — Remediation option selected; PR opened or WAF rule deployed as interim mitigation
4. **Hour 8** — Patch tested in staging environment
5. **Hour 12** — Production deployment (with TwinMOS IT approval)
6. **Hour 16** — Post-deploy scan confirms resolution
7. **Hour 24** — Incident report completed; threat model reviewed (TWN-SEC-2026-010)

If the 24-hour window cannot be met (e.g., patch breaks critical functionality), Security Lead documents risk acceptance with TwinMOS Chairman sign-off and compensating WAF controls deployed within 4 hours.

---

## 11. CI/CD Pipeline Integration

### 11.1 GitHub Actions Security Pipeline

```yaml
# .github/workflows/security-scanning.yml
name: Dependency Security Scanning

on:
  pull_request:
    branches: [main, staging]
  push:
    branches: [main]
  schedule:
    - cron: '0 2 * * *'  # Daily 02:00 UTC

env:
  NODE_VERSION: '20.x'

jobs:
  npm-audit:
    name: npm audit
    runs-on: ubuntu-latest
    strategy:
      matrix:
        directory: [frontend, cms]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: ${{ matrix.directory }}/package-lock.json
      - name: Install dependencies
        run: npm ci
        working-directory: ${{ matrix.directory }}
      - name: Run npm audit
        run: npm audit --audit-level=high --json > npm-audit-${{ matrix.directory }}.json
        working-directory: ${{ matrix.directory }}
      - name: Upload audit results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: npm-audit-${{ matrix.directory }}
          path: ${{ matrix.directory }}/npm-audit-${{ matrix.directory }}.json
          retention-days: 90

  snyk-scan:
    name: Snyk Security Scan
    runs-on: ubuntu-latest
    strategy:
      matrix:
        directory: [frontend, cms]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
      - name: Install dependencies
        run: npm ci
        working-directory: ${{ matrix.directory }}
      - name: Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: >
            --severity-threshold=high
            --sarif-file-output=snyk-${{ matrix.directory }}.sarif
        working-directory: ${{ matrix.directory }}
      - name: Upload SARIF to GitHub Security
        uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: ${{ matrix.directory }}/snyk-${{ matrix.directory }}.sarif

  sbom-and-grype:
    name: SBOM Generation and Grype Scan
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
      - name: Install dependencies (frontend)
        run: npm ci
        working-directory: frontend
      - name: Install dependencies (CMS)
        run: npm ci
        working-directory: cms
      - name: Install CycloneDX CLI
        run: npm install -g @cyclonedx/cyclonedx-npm
      - name: Generate SBOM (frontend)
        run: cyclonedx-npm --output-format JSON --output-file ../sbom-frontend.cdx.json
        working-directory: frontend
      - name: Generate SBOM (CMS)
        run: cyclonedx-npm --output-format JSON --output-file ../sbom-cms.cdx.json
        working-directory: cms
      - name: Install Grype
        run: |
          curl -sSfL https://raw.githubusercontent.com/anchore/grype/main/install.sh | sh -s -- -b /usr/local/bin
      - name: Grype scan (frontend SBOM)
        run: grype sbom:sbom-frontend.cdx.json --fail-on high --output sarif > grype-frontend.sarif
      - name: Grype scan (CMS SBOM)
        run: grype sbom:sbom-cms.cdx.json --fail-on high --output sarif > grype-cms.sarif
      - name: Upload SBOMs as artifacts
        uses: actions/upload-artifact@v4
        with:
          name: sbom-artifacts
          path: |
            sbom-frontend.cdx.json
            sbom-cms.cdx.json
          retention-days: 1095  # 3 years

  license-check:
    name: License Compliance
    runs-on: ubuntu-latest
    strategy:
      matrix:
        directory: [frontend, cms]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
      - name: Install dependencies
        run: npm ci
        working-directory: ${{ matrix.directory }}
      - name: Install license-checker
        run: npm install -g license-checker
      - name: Check licenses
        run: |
          license-checker \
            --excludePrivatePackages \
            --failOn "GPL;AGPL;LGPL;CPAL;EUPL;OSL" \
            --json \
            --out license-report-${{ matrix.directory }}.json
        working-directory: ${{ matrix.directory }}
      - name: Upload license report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: license-report-${{ matrix.directory }}
          path: ${{ matrix.directory }}/license-report-${{ matrix.directory }}.json
          retention-days: 90
```

### 11.2 Pipeline Gate Summary

| Gate | Condition | PR Impact | Production Deploy Impact |
|---|---|---|---|
| npm audit Critical | Any Critical finding | ❌ Block merge | ❌ Block deploy |
| npm audit High | Any High finding | ❌ Block merge | ❌ Block deploy |
| Snyk Critical/High | Any Critical/High finding | ❌ Block merge | ❌ Block deploy |
| Grype Critical/High (SBOM) | Any Critical/High finding | N/A (main-only) | ❌ Block deploy |
| License violation | GPL/AGPL/LGPL/CPAL detected | ❌ Block merge | ❌ Block deploy |
| npm audit Moderate | Moderate findings | ⚠️ Warning + issue | ⚠️ Warning only |

---

## 12. License Compliance Policy

### 12.1 License Classification

| License Type | Examples | Policy | Rationale |
|---|---|---|---|
| **Approved — Permissive** | MIT, Apache 2.0, BSD 2/3-Clause, ISC, CC0, Unlicense | ✅ Approved | No copyleft restrictions; compatible with commercial use |
| **Approved — Weak Copyleft** | LGPL (dynamic linking only), MPL 2.0, CDDL | ✅ Approved (with review) | Acceptable if library used as external dependency, not embedded |
| **Requires Legal Review** | Creative Commons (CC-BY, CC-BY-SA), EPL 2.0 | ⚠️ Review required | Context-dependent; must not apply to core platform code |
| **Prohibited — Copyleft** | GPL v2, GPL v3, AGPL, CPAL, EUPL, OSL | ❌ Blocked | Would require TwinMOS website code to be open-sourced |
| **Prohibited — Unknown** | No license, UNLICENSED, custom | ❌ Blocked | Cannot assess risk; seek alternative package |

### 12.2 License Inventory Management

A complete license inventory is generated at every PR via `license-checker`. The inventory is archived as a build artifact. Any new package introduction that would add a prohibited license blocks the PR automatically.

### 12.3 License Exception Process

If a package with a restricted license is required with no alternative:
1. Developer documents business need and proposes isolation approach
2. Legal Counsel reviews license terms
3. Security Lead and TwinMOS IT Lead approve
4. Exception added to `.license-checker-allow.json` with expiry date and review date
5. Exception reviewed at next quarterly license audit

---

## 13. False Positive Management

### 13.1 False Positive Criteria

A finding may be considered a false positive if any of the following apply:

| Criterion | Description | Evidence Required |
|---|---|---|
| **Not reachable** | Vulnerable code path not executed in TwinMOS's usage | Code trace showing call path never reached |
| **Test-only** | Vulnerable package in `devDependencies` and not included in production build | Build output verification |
| **Mitigated** | TwinMOS-specific configuration prevents exploitation | Configuration evidence + WAF rule if applicable |
| **Platform-handled** | Vulnerability exploitable only via direct access prevented by architecture (e.g., requires DB access) | Architecture diagram reference |

### 13.2 Suppression Approval Process

1. Developer identifies potential false positive → creates suppression PR
2. Suppression entry documents: CVE ID, justification category, business reason, expiry date
3. Security Lead reviews and approves or rejects
4. Suppression merged with maximum 90-day expiry
5. Dependabot reminder at expiry date triggers re-review

### 13.3 Suppression Tracking

All active suppressions tracked in a suppression register maintained in the security team's private documentation. Monthly review of suppressions nearing expiry.

| Field | Requirement |
|---|---|
| CVE ID | Exact CVE identifier |
| Package | Package name and affected version range |
| Justification | One of four criteria above |
| Detailed reason | 2–5 sentence explanation |
| Expiry date | Maximum 90 days from approval |
| Approved by | Security Lead name and date |

---

## 14. Metrics and Reporting

### 14.1 Key Performance Indicators

| Metric | Target | Measurement |
|---|---|---|
| Mean Time to Detect (MTTD) new Critical CVE | < 24 hours from NVD publication | Automated tracking |
| Mean Time to Remediate (MTTR) Critical | < 24 hours | From MTTD to production deploy |
| MTTR High | < 7 days | From MTTD to production deploy |
| Open Critical vulnerabilities in production | 0 | Real-time dashboard |
| Open High vulnerabilities in production | 0 | Real-time dashboard |
| Open Moderate vulnerabilities (backlog) | < 10 | Monthly review |
| Active suppressions | < 15 | Monthly review |
| Dependency update lag (average days behind latest patch) | < 14 days | Dependabot metrics |
| SBOM completeness | 100% of production builds | CI verification |
| License violations introduced | 0 | PR gate |

### 14.2 Reporting Cadence

| Report | Frequency | Audience | Content |
|---|---|---|---|
| Vulnerability Dashboard | Real-time | Security Lead, DevOps | Open CVEs by severity, MTTD/MTTR trends |
| Weekly Security Summary | Weekly | Dev Lead, Security Lead | New CVEs, remediated this week, Dependabot PR status |
| Monthly Security Report | Monthly | TwinMOS IT Lead | KPIs, trend analysis, suppression review, SBOM audit |
| Quarterly Executive Summary | Quarterly | TwinMOS Chairman, GM Dubai | High-level risk posture, major incidents, compliance status |
| Annual Dependency Audit | Annual | All stakeholders | Full dependency inventory review, license audit, toolchain assessment |

---

## 15. Governance

### 15.1 Roles and Responsibilities

| Role | Responsibility |
|---|---|
| **DevOps Lead** | Tool configuration, CI pipeline maintenance, Dependabot PR triage |
| **Security Lead** | False positive approvals, suppression reviews, CVE severity assessment, SLA enforcement |
| **Development Lead** | Remediation implementation, code review for security PRs, dependency upgrade decisions |
| **TwinMOS IT Lead** | Emergency patch approvals, risk acceptance sign-off for Critical CVEs |
| **Legal Counsel** | License compliance exception approvals, regulatory reporting for supply chain incidents |

### 15.2 Policy Review

| Activity | Frequency | Trigger |
|---|---|---|
| Tool configuration review | Annual | Calendar |
| CVE response SLA review | Annual | Post-incident or regulatory change |
| License policy review | Annual | New market entry, new regulatory requirement |
| Toolchain evaluation | Annual | New tools available; existing tool gaps identified |

### 15.3 Integration with Vulnerability Management

This specification is a subsystem of the broader Vulnerability Management Plan (TWN-OPS-2026-002). CVEs identified by dependency scanning feed directly into the vulnerability register maintained in TWN-OPS-2026-002, with remediation tracked and reported per that plan's governance framework.

---

## Appendix A — Tool Configuration Reference

### A.1 Tool Versions and Registry

| Tool | Version Pinned | Registry / Source | License |
|---|---|---|---|
| npm audit | Built-in (npm ≥ 6) | npm CLI | Artistic 2.0 |
| Snyk CLI | Latest stable | npm: `snyk` | Apache 2.0 |
| OWASP Dependency-Check | Latest stable | GitHub: jeremylong/DependencyCheck | Apache 2.0 |
| CycloneDX for npm | Latest stable | npm: `@cyclonedx/cyclonedx-npm` | Apache 2.0 |
| Syft | Latest stable | GitHub: anchore/syft | Apache 2.0 |
| Grype | Latest stable | GitHub: anchore/grype | Apache 2.0 |
| license-checker | Latest stable | npm: `license-checker` | BSD-3-Clause |

### A.2 Required GitHub Secrets

| Secret | Purpose | Rotation Period |
|---|---|---|
| `SNYK_TOKEN` | Snyk CLI authentication | 90 days |
| `NVD_API_KEY` | NVD API for OWASP Dependency-Check (higher rate limit) | 180 days |

### A.3 Notification Channels

| Severity | Notification Method | Recipients |
|---|---|---|
| Critical CVE (new) | PagerDuty page + Slack #security | Security Lead (on-call) |
| High CVE (new) | Slack #security + GitHub issue | Security Lead, Dev Lead |
| Moderate/Low (new) | GitHub issue only | Dev Lead |
| Weekly summary | Slack #security-weekly | Dev Lead, Security Lead |

---

*Document ID: TWN-OPS-2026-004 | Version 1.0.0 | Classification: Internal Use | © 2026 TwinMOS Technologies. All rights reserved.*
