# TwinMOS Website — Security Incident Runbook

| | |
|:---|:---|
| **Reference** | H.4-006 |
| **Priority** | P1 |
| **Status** | [M] Must-have |
| **Author** | DevOps Lead |
| **Version** | 1.0 |
| **Date** | 2026-05-01 |
| **Review Cycle** | Per incident |

---

## 1. Purpose

This runbook defines the response procedures for security incidents affecting the TwinMOS website.

---

## 2. Security Incident Types

| Type | Severity | Examples |
|:---|:---|:---|
| **Data Breach** | Critical | Unauthorized access to customer data, PII exposure |
| **Malware** | Critical | Ransomware, backdoor, malicious code injection |
| **DDoS Attack** | High | Volumetric attack, application layer flood |
| **Credential Compromise** | High | Leaked API keys, stolen passwords |
| **Vulnerability Exploitation** | High | SQL injection, XSS, RCE |
| **Insider Threat** | Medium | Unauthorized access by team member |
| **Phishing** | Medium | Social engineering targeting team |

---

## 3. Response Procedures

### 3.1 Immediate Actions (First 15 minutes)

1. **Declare security incident** - Notify Tech Lead immediately
2. **Preserve evidence** - Do NOT delete logs or restart systems yet
3. **Isolate affected systems** - Block IPs, disable compromised accounts
4. **Document timeline** - Record all actions taken

### 3.2 Containment

| Action | Command/Method |
|:---|:---|
| Block IP address | Cloudflare Firewall -> Block IP |
| Disable account | Strapi Admin -> Users -> Disable |
| Rotate API key | GitHub/Dashboard -> Regenerate key |
| Revoke sessions | Redis: `FLUSHDB` or specific key deletion |
| Enable Under Attack mode | Cloudflare -> Security -> Under Attack |

### 3.3 Evidence Collection

```bash
# Save logs before they rotate
mkdir -p /tmp/incident-evidence/$(date +%Y%m%d)

# Application logs
docker logs strapi-backend > /tmp/incident-evidence/app.log

# System logs
journalctl --since "2 hours ago" > /tmp/incident-evidence/system.log

# Web server logs
cp /var/log/nginx/access.log /tmp/incident-evidence/
cp /var/log/nginx/error.log /tmp/incident-evidence/

# Network connections
ss -tunap > /tmp/incident-evidence/network.log

# Running processes
ps aux > /tmp/incident-evidence/processes.log
```

### 3.4 Eradication

1. Remove malicious code/files
2. Patch exploited vulnerability
3. Update all credentials
4. Verify no persistence mechanisms remain

### 3.5 Recovery

1. Restore from clean backup if needed
2. Verify system integrity
3. Re-enable services gradually
4. Monitor for re-infection

---

## 4. Notification Requirements

| Incident Type | Notify Within | Who |
|:---|:---|:---|
| Data breach (GDPR) | 72 hours | Supervisory authority |
| Data breach (UAE PDPL) | 72 hours | NESA |
| Data breach (affected users) | Without delay | Affected individuals |
| Critical vulnerability | 24 hours | All stakeholders |
| Credential compromise | 1 hour | Tech Lead + PM |

---

## 5. Post-Incident Actions

1. **Forensic analysis** - Determine root cause and scope
2. **Security audit** - Review all systems for similar vulnerabilities
3. **Policy update** - Update security policies if needed
4. **Training** - Team briefing on lessons learned
5. **Report** - Document incident for compliance

---

## 6. Change Log

| Version | Date | Author | Changes |
|:---|:---|:---|:---|
| 1.0 | 2026-05-01 | DevOps Lead | Initial release |

---

## 7. Sign-off

| Role | Name | Date | Signature |
|:---|:---|:---|:---|
| DevOps Lead | | | |
| Tech Lead | | | |
| Project Manager | | | |
