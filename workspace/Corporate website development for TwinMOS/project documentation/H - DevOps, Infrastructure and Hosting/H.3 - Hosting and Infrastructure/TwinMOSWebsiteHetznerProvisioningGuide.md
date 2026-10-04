# TwinMOS Website — Hetzner Server Provisioning Guide

**Document ID:** H.3-003  
**Version:** 1.0  
**Status:** Active  
**Owner:** Tech Lead  
**Last Updated:** 2026-05-01  
**Related:** TwinMOSWebsiteCoolifyConfigurationGuide.md · TwinMOSWebsiteHostingArchitectureSpec.md · TwinMOSWebsiteDisasterRecoveryPlan.md

---

## 1. Overview

This guide covers the complete process of provisioning a new Hetzner Cloud VPS for the TwinMOS website backend — from server creation through security hardening to Coolify installation and first-boot validation.

**Run this guide when:**
- Setting up production for the first time (Phase 1 launch)
- Provisioning a new staging server
- Executing a DR rebuild on a fresh server

---

## 2. Server Specifications

### 2.1 Phase 1–2: Hetzner CX32

| Attribute | Value |
|-----------|-------|
| Server type | CX32 |
| vCPUs | 4 (Shared) |
| RAM | 8 GB |
| SSD NVMe | 80 GB |
| Bandwidth | 20 TB/month |
| Monthly cost | €13.10 (~$14.10 USD) |
| Recommended location | Falkenstein (fsn1) — EU data residency |
| OS | Ubuntu 24.04 LTS |

### 2.2 Phase 3: Hetzner CX42

| Attribute | Value |
|-----------|-------|
| Server type | CX42 |
| vCPUs | 8 (Shared) |
| RAM | 16 GB |
| SSD NVMe | 160 GB |
| Monthly cost | €25.20 (~$27 USD) |
| Upgrade path | In-place resize from CX32 via Hetzner console (~5 min downtime) |

### 2.3 DR / Development Servers

| Purpose | Server Type | Location | Notes |
|---------|------------|---------|-------|
| Development | CX22 (2 vCPU / 4 GB / 40 GB, €4.51/mo) | Falkenstein | dev.twinmos.com |
| Staging | CX32 | Falkenstein | staging.twinmos.com |
| DR failover | CX32 | Helsinki (hel1) or Ashburn (ash) | Provisioned only during DR drill/incident |

---

## 3. Pre-Provisioning Checklist

Before creating the server:

- [ ] Hetzner Cloud account set up (TwinMOS project created)
- [ ] SSH public key uploaded to Hetzner (Tech Lead + backup contact keys)
- [ ] Cloudflare API token ready (for DNS updates post-provisioning)
- [ ] Bitwarden vault open (for strong password generation)
- [ ] Coolify webhook URLs noted from previous install (or will create new ones)
- [ ] B2 application keys available
- [ ] All environment variables ready (from `TwinMOSWebsiteEnvironmentVariablesReference.md`)

---

## 4. Step 1 — Hetzner Cloud Console Setup

### 4.1 Create Project

```
Hetzner Cloud Console → New Project → "TwinMOS-Production"
(Separate projects for: Production, Staging, Development)
```

### 4.2 Upload SSH Keys

```
Project → Security → SSH Keys → Add SSH Key
  Name: "Tech Lead - MacBook"
  Public Key: <paste ~/.ssh/id_ed25519.pub>

  Name: "Tech Lead - Backup Key"
  Public Key: <paste backup key>
```

### 4.3 Create Cloud Firewall (before server creation)

```
Project → Firewalls → Create Firewall
  Name: twinmos-production-firewall

  Inbound rules:
  ┌─────────────────────────────────────────────────────────────────┐
  │ Protocol │ Port  │ Source                     │ Description    │
  ├──────────┼───────┼────────────────────────────┼────────────────┤
  │ TCP      │ 443   │ Cloudflare IPv4 ranges *   │ HTTPS          │
  │ TCP      │ 80    │ Cloudflare IPv4 ranges *   │ HTTP (redirect)│
  │ TCP      │ 22    │ <office IP>/32             │ SSH (office)   │
  │ TCP      │ 22    │ <VPN CIDR>                 │ SSH (VPN)      │
  └─────────────────────────────────────────────────────────────────┘

  * Cloudflare IPv4 ranges (as of 2026):
    173.245.48.0/20, 103.21.244.0/22, 103.22.200.0/22, 103.31.4.0/22,
    141.101.64.0/18, 108.162.192.0/18, 190.93.240.0/20, 188.114.96.0/20,
    197.234.240.0/22, 198.41.128.0/17, 162.158.0.0/15, 104.16.0.0/13,
    104.24.0.0/14, 172.64.0.0/13, 131.0.72.0/22

  Outbound rules:
    All outbound traffic allowed (default)

  Apply to: (select after server creation)
```

---

## 5. Step 2 — Server Creation

### 5.1 Create Server via Hetzner Console

```
Project → Servers → Add Server

  Location: Falkenstein (fsn1)     ← EU data residency
  OS Image: Ubuntu 24.04 LTS
  Server type: CX32 (Standard)
  SSH Key: <select Tech Lead keys>
  Cloud-init / User data: (paste from Section 5.2)
  Firewall: twinmos-production-firewall
  Backups: Enable (Hetzner automatic daily backups, +20% cost = ~€2.62/mo)
  Name: twinmos-production-01
```

### 5.2 Cloud-Init Configuration

Paste this as **User data** during server creation. It runs on first boot.

```yaml
#cloud-config

# Create deploy user (non-root for all operations)
users:
  - name: deploy
    groups: [sudo, docker]
    sudo: ['ALL=(ALL) NOPASSWD:ALL']
    shell: /bin/bash
    ssh_authorized_keys:
      - <Tech Lead SSH public key>
      - <Backup contact SSH public key>

# SSH hardening
write_files:
  - path: /etc/ssh/sshd_config.d/10-twinmos.conf
    content: |
      PasswordAuthentication no
      PermitRootLogin no
      PubkeyAuthentication yes
      AuthorizedKeysFile .ssh/authorized_keys
      X11Forwarding no
      AllowTcpForwarding no
      MaxAuthTries 3
      LoginGraceTime 20
      ClientAliveInterval 300
      ClientAliveCountMax 2

  # Docker daemon hardening
  - path: /etc/docker/daemon.json
    content: |
      {
        "log-driver": "json-file",
        "log-opts": {
          "max-size": "100m",
          "max-file": "3"
        },
        "no-new-privileges": true,
        "userns-remap": "default",
        "live-restore": true
      }

  # Swap file creation script
  - path: /tmp/create_swap.sh
    permissions: '0755'
    content: |
      #!/bin/bash
      fallocate -l 4G /swapfile
      chmod 600 /swapfile
      mkswap /swapfile
      swapon /swapfile
      echo '/swapfile none swap sw 0 0' >> /etc/fstab

package_update: true
package_upgrade: true

packages:
  - curl
  - git
  - wget
  - htop
  - ufw
  - fail2ban
  - unattended-upgrades
  - apt-transport-https
  - ca-certificates
  - gnupg
  - lsb-release
  - jq
  - ncdu
  - logrotate

runcmd:
  # Install Docker
  - curl -fsSL https://get.docker.com | bash
  - usermod -aG docker deploy

  # Configure UFW
  - ufw default deny incoming
  - ufw default allow outgoing
  - ufw allow from <office IP> to any port 22 proto tcp
  - ufw allow from <VPN CIDR> to any port 22 proto tcp
  # Cloudflare IP ranges for HTTPS
  - ufw allow from 173.245.48.0/20 to any port 443 proto tcp
  - ufw allow from 103.21.244.0/22 to any port 443 proto tcp
  - ufw allow from 103.22.200.0/22 to any port 443 proto tcp
  - ufw allow from 141.101.64.0/18 to any port 443 proto tcp
  - ufw allow from 108.162.192.0/18 to any port 443 proto tcp
  - ufw allow from 104.16.0.0/13 to any port 443 proto tcp
  - ufw allow from 172.64.0.0/13 to any port 443 proto tcp
  - ufw --force enable

  # Configure Fail2ban
  - cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
  - sed -i 's/bantime  = 10m/bantime  = 1h/' /etc/fail2ban/jail.local
  - sed -i 's/maxretry = 5/maxretry = 3/' /etc/fail2ban/jail.local
  - systemctl enable fail2ban
  - systemctl start fail2ban

  # Configure unattended-upgrades (security patches only)
  - echo 'Unattended-Upgrade::Automatic-Reboot "false";' >> /etc/apt/apt.conf.d/50unattended-upgrades
  - echo 'Unattended-Upgrade::Mail "devops@twinmos.com";' >> /etc/apt/apt.conf.d/50unattended-upgrades
  - systemctl enable unattended-upgrades

  # Create swap
  - /tmp/create_swap.sh

  # Restart SSH to apply hardening
  - systemctl restart sshd

  # Disable IPv6 (optional — reduces attack surface)
  - echo 'net.ipv6.conf.all.disable_ipv6 = 1' >> /etc/sysctl.conf
  - sysctl -p

final_message: |
  TwinMOS Hetzner server provisioned successfully.
  Coolify installation required: curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

---

## 6. Step 3 — Post-Provision Verification

After cloud-init completes (~3–5 minutes):

```bash
# SSH as deploy user (NOT root)
ssh deploy@<server-ip>

# Verify UFW is active
sudo ufw status verbose

# Verify Docker is running
docker version

# Verify Fail2ban is active
sudo fail2ban-client status

# Verify swap is configured
free -h

# Check disk usage
df -h

# Verify SSH root login is disabled
grep "PermitRootLogin" /etc/ssh/sshd_config.d/10-twinmos.conf
# Expected: PermitRootLogin no

# Check unattended-upgrades
sudo unattended-upgrade --dry-run --debug 2>&1 | head -20
```

---

## 7. Step 4 — Install Coolify

```bash
# Run as deploy user (has sudo + docker access)
ssh deploy@<server-ip>

# Install Coolify
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash

# Coolify dashboard will be available at:
# http://<server-ip>:8000

# Complete Coolify initial setup (see TwinMOSWebsiteCoolifyConfigurationGuide.md §2.1)
```

---

## 8. Step 5 — Create Server Snapshot

After Coolify is installed and all services are running, take a Hetzner snapshot for fast DR recovery:

```
Hetzner Console → Server: twinmos-production-01 → Snapshots → Take Snapshot
  Name: twinmos-baseline-YYYYMMDD
  Description: "Post-Coolify install, pre-services config. Use for fast DR rebuild."

Update this snapshot: Monthly (or after any major infrastructure change)
```

---

## 9. Apply Cloudflare IP Firewall Rules

The Hetzner Cloud Firewall (created in Step 1) uses Cloudflare's IPv4 ranges. These ranges change infrequently but should be verified annually.

Current Cloudflare IPv4 ranges: https://www.cloudflare.com/ips-v4/  
Current Cloudflare IPv6 ranges: https://www.cloudflare.com/ips-v6/

```bash
# Script to update Hetzner firewall with latest Cloudflare IPs
# (Run annually or when Cloudflare updates their ranges)

CLOUDFLARE_IPS=$(curl -s https://www.cloudflare.com/ips-v4/)
# Update Hetzner firewall rules via hcloud CLI or Console
# hcloud firewall rule list <firewall-name>
# hcloud firewall rule delete <firewall-name> <rule-id>
# hcloud firewall rule add <firewall-name> --direction in --protocol tcp --port 443 --source-ips "<ip>"
```

---

## 10. Vertical Scaling: CX32 → CX42 (Phase 3)

When Phase 3 commerce launches or pre-event scaling is needed:

```
1. Schedule maintenance window: Tuesday 01:00–02:00 UTC
2. Notify team in Slack #ops: "Scaling CX32 → CX42 at 01:00 UTC"
3. In Hetzner Console:
   Server → twinmos-production-01 → Resize
   Select CX42 → Resize (requires ~5 min downtime)
4. Server reboots automatically at new size
5. Verify all Coolify services restarted:
   docker ps
6. Verify health checks:
   curl https://api.twinmos.com/api/_health
   curl https://search.twinmos.com/health
7. Update Slack #ops: "Scaling complete. CX42 active."
```

---

## 11. Monthly Maintenance Procedures

### 11.1 Security updates

```bash
ssh deploy@<server-ip>

# Apply pending security updates
sudo apt update
sudo apt upgrade -y

# Check for kernel updates (may require reboot)
sudo apt list --upgradable 2>/dev/null | grep linux-image

# If kernel update: schedule reboot during low-traffic window
# sudo reboot (requires tech lead approval)
```

### 11.2 Docker cleanup

```bash
# Remove unused images, containers, networks (frees disk space)
docker system prune -f

# Check disk usage
df -h
du -sh /var/lib/coolify/*

# Remove old Coolify deployment artifacts
find /var/lib/coolify/applications -name "*.log" -mtime +30 -delete
```

### 11.3 Log rotation verification

```bash
# Verify log rotation is working
sudo logrotate --debug /etc/logrotate.conf

# Check Docker log sizes
du -sh /var/lib/docker/containers/*/

# If any container log >100 MB, restart that container
```

### 11.4 Backup verification

```bash
# Verify backup ran last night
b2 ls --long twinmos-backups-prod/daily/ | head -5

# Test decrypt a recent backup
gpg --decrypt --passphrase "${GPG_BACKUP_PASSPHRASE}" \
    --batch <latest-backup.dump.gpg> | pg_restore --list | head -20
```

---

## 12. Hetzner Cost Management

| Scenario | Server | Cost | Trigger |
|----------|--------|------|---------|
| P1–P2 normal | CX32 | €13.10/mo | Default |
| P3 commerce | CX42 | €25.20/mo | Phase 3 launch |
| Pre-event (COMPUTEX/GITEX) | CX42 (temporary) | +€12.10/mo | 7 days pre-event |
| Dev environment | CX22 | €4.51/mo | Always on |
| Staging | CX32 | €13.10/mo | Always on |
| DR (during incident only) | CX32 (Helsinki) | €13.10/mo | Incident only; destroy after |

> **Total infra cost P1:** ~€30/mo (production + dev + staging)

---

*Approved by: Chairman · Tech Lead*  
*Synchronized With: Technology Stack v1.1 §19.1, §19.4*
