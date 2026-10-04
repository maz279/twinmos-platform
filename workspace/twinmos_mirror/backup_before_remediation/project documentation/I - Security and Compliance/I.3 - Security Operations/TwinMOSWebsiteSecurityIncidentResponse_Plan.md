# Security Incident Response Plan

| Document Attribute | Value |
|---|---|
| **Document ID** | TWN-OPS-2026-003 |
| **Version** | 1.0.0 |
| **Status** | Draft |
| **Author** | Unisoft Technologies Security Team |
| **Owner** | CISO |
| **Review Date** | 2026-08-01 |
| **Classification** | Confidential |
| **Related Documents** | TWN-OPS-2026-001 (Penetration Testing), TWN-OPS-2026-002 (Vulnerability Management), TWN-COMP-2026-001 (DPIA) |
| **Compliance Mapping** | GDPR Art. 33-34, UAE PDPL Art. 11, India DPDP Act 2023 S.8(7), KSA PDPL Art. 9, ISO/IEC 27001:2022 A.5.24, A.5.25, A.5.26, A.5.27, NIST SP 800-61 |

---

## 1. Executive Summary

This Security Incident Response Plan (SIRP) establishes the framework for detecting, analyzing, containing, eradicating, recovering from, and documenting security incidents affecting the TwinMOS corporate website. The plan ensures rapid, coordinated, and effective response to minimize business impact and meet regulatory notification requirements.

**Response Objectives**:
1. Minimize business disruption and data loss
2. Preserve evidence for forensic analysis
3. Meet regulatory notification deadlines (GDPR: 72 hours)
4. Maintain customer trust through transparent communication
5. Learn from incidents to prevent recurrence

---

## 2. Incident Classification

### 2.1 Severity Levels

| Level | Description | Examples | Response Time | Notification |
|---|---|---|---|---|
| **P0 - Critical** | Active breach, data exfiltration, system compromise | RCE exploitation, database breach, ransomware | 15 minutes | Immediate: CISO, CTO, Legal, DPO |
| **P1 - High** | Significant security event, potential data exposure | Authentication bypass, privilege escalation, XSS in production | 1 hour | Within 1 hour: CISO, Security Team, DPO |
| **P2 - Medium** | Security anomaly, limited impact | Failed attack attempts, policy violation, suspicious activity | 4 hours | Within 4 hours: Security Engineer, Team Lead |
| **P3 - Low** | Minor security issue, no immediate impact | Scanning activity, phishing attempt (unsuccessful), misconfiguration | 24 hours | Daily digest: Security Team |
| **P4 - Informational** | Security observation, no action required | Log anomaly, threat intel alert, best practice deviation | 1 week | Weekly report |

### 2.2 Incident Categories

| Category | Description | Typical Severity |
|---|---|---|
| **Data Breach** | Unauthorized access to personal or sensitive data | P0-P1 |
| **Malware Infection** | Ransomware, trojans, viruses on systems | P0-P1 |
| **Denial of Service** | DDoS, resource exhaustion, application-layer DoS | P1-P2 |
| **Web Application Attack** | SQL injection, XSS, RCE, LFI/RFI | P0-P2 |
| **Authentication Compromise** | Credential theft, brute force, session hijacking | P1-P2 |
| **Insider Threat** | Malicious or negligent employee action | P1-P2 |
| **Third-Party Incident** | Breach at sub-processor or vendor | P1-P2 |
| **Physical Security** | Unauthorized physical access | P1-P2 |
| **Policy Violation** | Security policy non-compliance | P2-P3 |
| **False Positive** | Alert determined to be benign | P4 |

---

## 3. Incident Response Team (IRT)

### 3.1 Core Team

| Role | Primary | Backup | Responsibilities |
|---|---|---|---|
| **Incident Commander** | CISO | CTO | Overall incident ownership, decision authority, external communication |
| **Technical Lead** | Security Architect | Security Engineer | Technical direction, containment, forensics |
| **Communications Lead** | DPO | Marketing Director | Regulatory notifications, customer communication, media |
| **Legal Advisor** | Legal Counsel | External counsel | Legal implications, liability, law enforcement liaison |
| **Operations Lead** | DevOps Lead | SRE | System recovery, service restoration, monitoring |
| **Forensics Lead** | Security Engineer | External forensics | Evidence preservation, root cause analysis |

### 3.2 Extended Team (On-Demand)

| Role | Engagement Trigger | Responsibilities |
|---|---|---|
| **Development Lead** | Code-related incident | Code fixes, patch development |
| **Database Administrator** | Data breach, DB compromise | Database forensics, recovery |
| **Network Engineer** | Network intrusion | Network forensics, segmentation |
| **HR Director** | Insider threat | Employee investigation, disciplinary action |
| **External Forensics** | P0 incident | Independent investigation, court-admissible evidence |
| **PR Agency** | Public-facing breach | Media management, public statements |
| **Cyber Insurance** | P0-P1 incident | Claim initiation, insurer coordination |

### 3.3 Contact Information

| Role | Primary Contact | Backup Contact | After-Hours |
|---|---|---|---|
| CISO | ciso@twinmos.com | +[phone] | PagerDuty escalation |
| Security Architect | security-arch@twinmos.com | +[phone] | PagerDuty escalation |
| DPO | dpo@twinmos.com | +[phone] | PagerDuty escalation |
| Legal Counsel | legal@twinmos.com | +[phone] | Emergency contact |
| DevOps Lead | devops@twinmos.com | +[phone] | PagerDuty escalation |
| External Forensics | [Vendor TBD] | [Vendor TBD] | 24/7 hotline |

---

## 4. Incident Response Lifecycle

### 4.1 NIST SP 800-61 Phases

```
[Preparation] --> [Detection & Analysis] --> [Containment] --> [Eradication] --> [Recovery] --> [Post-Incident]
       ^___________________________________________________________________________________________|
```

### 4.2 Phase 1: Preparation

| Activity | Implementation | Owner | Review |
|---|---|---|---|
| IRT roster maintenance | Quarterly verification of contacts, roles | CISO | Quarterly |
| Tool readiness | SIEM, EDR, forensic tools, communication platforms | Security Engineer | Monthly |
| Runbook maintenance | Update procedures based on architecture changes | Security Engineer | Per change |
| Training and exercises | Tabletop exercises, red team drills | CISO | Quarterly |
| Legal and regulatory prep | Notification templates, regulatory contacts | DPO / Legal | Annual |
| Insurance verification | Cyber insurance policy review | CFO / CISO | Annual |
| Evidence preservation capability | Write-once storage, chain of custody | Security Engineer | Quarterly |

### 4.3 Phase 2: Detection and Analysis

#### Detection Sources

| Source | Tool | Alert Type | Triage |
|---|---|---|---|
| **SIEM** | Grafana Loki | Correlated alerts | Automated + manual |
| **WAF** | Cloudflare | Blocked attacks, anomalies | Automated |
| **IDS/IPS** | Cloudflare | Suspicious traffic patterns | Automated |
| **Endpoint Detection** | [Future] | Malware, suspicious processes | Automated |
| **Vulnerability Scanner** | Nessus | New vulnerabilities | Daily review |
| **Bug Bounty** | HackerOne | Researcher reports | Daily triage |
| **User Reports** | Email, support tickets | Suspected breach, phishing | Manual |
| **Threat Intelligence** | OSV, NVD | Active exploitation | Continuous |
| **Log Analysis** | Custom scripts | Anomalies, patterns | Daily |
| **External Monitoring** | Uptime monitors | Availability issues | Continuous |

#### Analysis Process

| Step | Action | Owner | Timeline |
|---|---|---|---|
| 1 | Receive and log alert | SOC / Security Engineer | Immediate |
| 2 | Initial triage and severity assignment | Security Engineer | 15 minutes |
| 3 | Validate if incident is genuine | Security Engineer | 30 minutes |
| 4 | Determine scope and impact | Security Engineer | 1 hour |
| 5 | Classify incident type and severity | Security Engineer | 1 hour |
| 6 | Activate IRT if P0-P1 | Incident Commander | 15 minutes |
| 7 | Begin evidence preservation | Forensics Lead | Immediate |
| 8 | Document initial findings | Security Engineer | 2 hours |

### 4.4 Phase 3: Containment

#### Short-Term Containment (Immediate)

| Action | When | Owner | Risk |
|---|---|---|---|
| Isolate affected systems | Confirmed compromise | DevOps | Service disruption |
| Block malicious IPs | Identified attacker | Security Engineer | False positive risk |
| Disable compromised accounts | Account takeover | Security Engineer | User impact |
| Revoke API keys | Key compromise | Security Engineer | Integration impact |
| Enable WAF emergency rules | Active attack | Security Engineer | Legitimate traffic block |
| Snapshot affected systems | Forensic preservation | DevOps | Performance impact |

#### Long-Term Containment (Stabilization)

| Action | When | Owner | Duration |
|---|---|---|---|
| Implement monitoring on affected systems | During investigation | Security Engineer | Until resolved |
| Apply temporary patches | Vulnerability exploited | Development | Until permanent fix |
| Rotate credentials | Credential compromise | Security Engineer | Immediate |
| Increase logging verbosity | Investigation needs | DevOps | Until resolved |
| Segment compromised network area | Lateral movement suspected | DevOps | Until resolved |

### 4.5 Phase 4: Eradication

| Step | Action | Owner | Timeline |
|---|---|---|---|
| 1 | Identify root cause | Forensics Lead | 1-3 days |
| 2 | Remove malware/backdoors | DevOps / Security | 1-2 days |
| 3 | Patch exploited vulnerabilities | Development | 1-7 days |
| 4 | Remove unauthorized accounts/access | Security Engineer | Immediate |
| 5 | Verify clean state | Forensics Lead | 1-2 days |
| 6 | Document eradication actions | Security Engineer | Concurrent |

### 4.6 Phase 5: Recovery

| Step | Action | Owner | Timeline |
|---|---|---|---|
| 1 | Restore from known-good backups | DevOps | 2-4 hours |
| 2 | Verify system integrity | Forensics Lead | 4-8 hours |
| 3 | Reconnect systems to production | DevOps | Gradual |
| 4 | Monitor for recurrence | Security Engineer | 24-72 hours |
| 5 | Validate service functionality | QA Team | 2-4 hours |
| 6 | Resume normal operations | Operations Lead | When validated |

### 4.7 Phase 6: Post-Incident

| Activity | Description | Owner | Timeline |
|---|---|---|---|
| **Lessons Learned** | Post-mortem meeting, root cause analysis | Incident Commander | Within 1 week |
| **Report Documentation** | Final incident report, evidence package | Security Engineer | Within 2 weeks |
| **Remediation Tracking** | Action items, ownership, deadlines | Security Engineer | Ongoing |
| **Control Improvement** | Update security controls, policies | Security Architect | Within 1 month |
| **Training Update** | Incorporate lessons into training | HR / Security | Next cycle |
| **Metrics Update** | Update incident metrics, trends | CISO | Monthly |

---

## 5. Regulatory Notification

### 5.1 GDPR Notification Requirements

| Requirement | Timeline | Content | Recipient |
|---|---|---|---|
| **Supervisory Authority** | 72 hours of becoming aware | Nature, categories, approximate numbers, likely consequences, measures taken | Lead SA |
| **Data Subjects** | Without undue delay | Nature, DPO contact, consequences, measures | Affected individuals |
| **Documentation** | Maintain records | All facts, effects, remedial action | Internal |

### 5.2 Other Jurisdictional Requirements

| Jurisdiction | Authority | Timeline | Method |
|---|---|---|---|
| **UAE PDPL** | UAE Data Protection Authority | Without delay | Email / Portal |
| **India DPDP** | Data Protection Board | As prescribed | Online portal |
| **KSA PDPL** | SDAIA | Without delay | Email / Portal |
| **PCI DSS** | Acquirer, Card Brands | Per brand requirements | Designated channels |

### 5.3 Notification Templates

#### Regulatory Notification (GDPR)

```
TO: [Supervisory Authority]
FROM: TwinMOS Data Protection Officer
DATE: [Date]
RE: Personal Data Breach Notification - Incident [ID]

1. NATURE OF BREACH: [Description]
2. CATEGORIES OF DATA: [Types of personal data affected]
3. APPROXIMATE NUMBERS: [Records / Individuals affected]
4. LIKELY CONSEQUENCES: [Impact assessment]
5. MEASURES TAKEN: [Containment, remediation]
6. DPO CONTACT: dpo@twinmos.com, +[phone]
```

#### Customer Notification

```
Subject: Important Security Notice - TwinMOS Account

Dear [Customer Name],

We are writing to inform you of a security incident that may have affected your personal information.

WHAT HAPPENED: [Brief description]
WHAT INFORMATION: [Types of data involved]
WHAT WE ARE DOING: [Remediation steps]
WHAT YOU CAN DO: [Recommended actions]

We sincerely apologize for any inconvenience. For questions, contact privacy@twinmos.com.

TwinMOS Security Team
```

---

## 6. Communication Plan

### 6.1 Internal Communication

| Audience | Channel | Frequency | Content |
|---|---|---|---|
| **IRT** | Slack #security-incidents | Real-time | Technical details, decisions |
| **Executive Team** | Email + call | Per severity | Status, business impact, decisions needed |
| **Board** | Email + emergency call | P0-P1 | Summary, legal exposure, public impact |
| **All Staff** | Email | P0-P1 | Awareness, reporting instructions |
| **Customer Service** | Internal briefing | P0-P2 | Talking points, escalation path |

### 6.2 External Communication

| Audience | Channel | Timing | Content |
|---|---|---|---|
| **Customers** | Email + website notice | After containment | Breach notice, protective actions |
| **Regulators** | Formal notification | Per legal deadline | Required regulatory content |
| **Media** | Press release + PR | If public interest | Controlled message, facts |
| **Partners** | Direct communication | If affected | Impact, protective measures |
| **Law Enforcement** | Formal report | If criminal activity | Evidence, cooperation |
| **Bug Bounty Researchers** | Platform communication | If relevant | Coordination, recognition |

### 6.3 Communication Approval Matrix

| Communication | P0 | P1 | P2 | P3 |
|---|---|---|---|---|
| Internal IRT | Incident Commander | Incident Commander | Technical Lead | Security Engineer |
| Executive notification | CISO | CISO | Security Engineer | Weekly digest |
| Customer notification | CEO + Legal | CISO + DPO | DPO | N/A |
| Regulatory notification | DPO + Legal | DPO | DPO | N/A |
| Media statement | CEO + PR | CISO + PR | N/A | N/A |
| Law enforcement | Legal | Legal | Security Engineer | N/A |

---

## 7. Forensics and Evidence

### 7.1 Evidence Preservation

| Type | Method | Chain of Custody | Retention |
|---|---|---|---|
| **System images** | dd, forensic tools | Signed handoff | 7 years |
| **Log files** | Centralized SIEM, WORM storage | Hash verification | 7 years |
| **Network captures** | tcpdump, Cloudflare logs | Timestamped, hashed | 2 years |
| **Malware samples** | Isolated storage, encrypted | Signed receipt | 7 years |
| **Email/communications** | Legal hold, archived | Audit trail | 7 years |
| **Physical evidence** | Secure storage, tamper-evident | Signed log | Per legal requirement |

### 7.2 Forensic Analysis

| Activity | Internal | External | Decision Point |
|---|---|---|---|
| **Initial triage** | Yes | No | P0-P1: External within 24h |
| **Deep forensics** | Limited | Yes (P0-P1) | CISO decision |
| **Court-admissible evidence** | No | Yes | Legal Counsel decision |
| **Attribution analysis** | Limited | Yes | CISO + Legal decision |
| **Recovery validation** | Yes | No | Technical Lead |

---

## 8. Metrics and Improvement

### 8.1 Key Metrics

| Metric | Target | Measurement |
|---|---|---|
| Mean Time to Detect (MTTD) | < 4 hours | Per incident |
| Mean Time to Respond (MTTR) | P0: < 15 min, P1: < 1 hour | Per incident |
| Mean Time to Contain (MTTC) | P0: < 4 hours, P1: < 8 hours | Per incident |
| Mean Time to Recover (MTTRc) | P0: < 24 hours, P1: < 72 hours | Per incident |
| Incident count | Trending down | Monthly |
| False positive rate | < 20% | Monthly |
| Regulatory notification compliance | 100% on-time | Per incident |
| Exercise completion | 100% quarterly | Quarterly |
| Post-mortem completion | 100% within 1 week | Per incident |

### 8.2 Continuous Improvement

| Activity | Frequency | Output |
|---|---|---|
| Post-incident review | Per incident | Action items, control updates |
| Quarterly trend analysis | Quarterly | Risk adjustment, resource planning |
| Annual plan review | Annual | Plan updates, scenario additions |
| Tabletop exercise | Quarterly | Gap identification, team readiness |
| Red team integration | Bi-annual | Realistic scenario validation |
| Tool evaluation | Annual | Tool upgrades, new capabilities |

---

## 9. Document Change Log

| Version | Date | Author | Change Description |
|---|---|---|---|
| 1.0.0 | 2026-05-01 | Security Team | Initial incident response plan |
