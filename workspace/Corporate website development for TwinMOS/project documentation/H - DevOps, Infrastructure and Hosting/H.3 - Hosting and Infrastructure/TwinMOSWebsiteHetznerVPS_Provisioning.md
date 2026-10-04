# TwinMOS Website — Hetzner VPS Provisioning Guide

| | |
|:---|:---|
| **Reference** | H.3-004 |
| **Priority** | P1 |
| **Status** | [M] Must-have |
| **Author** | DevOps Lead |
| **Version** | 1.0 |
| **Date** | 2026-05-01 |
| **Review Cycle** | Quarterly |

---

## 1. Purpose

This document defines the provisioning, hardening, and baseline configuration of Hetzner Cloud VPS instances used to host the TwinMOS website backend services via Coolify v4.

---

## 2. Instance Specifications

### 2.1 P1-P2: Development & Initial Production

| Attribute | Specification |
|:---|:---|
| **Type** | CX32 (Dedicated vCPU) |
| **vCPU** | 4 cores (AMD EPYC) |
| **RAM** | 16 GB |
| **Storage** | 160 GB NVMe SSD |
| **Network** | 1 Gbps |
| **Traffic** | 20 TB/month |
| **Location** | Nuremberg, Germany (EU) |
| **OS** | Ubuntu 24.04 LTS (x86_64) |
| **Monthly Cost** | ~$18.15 USD |

### 2.2 P3: Commerce Phase Scaling

| Attribute | Specification |
|:---|:---|
| **Type** | CX42 (Dedicated vCPU) |
| **vCPU** | 8 cores (AMD EPYC) |
| **RAM** | 32 GB |
| **Storage** | 320 GB NVMe SSD |
| **Network** | 1 Gbps |
| **Traffic** | 20 TB/month |
| **Location** | Nuremberg, Germany (EU) |
| **OS** | Ubuntu 24.04 LTS (x86_64) |
| **Monthly Cost** | ~$34.05 USD |

### 2.3 Why Hetzner

| Factor | Rationale |
|:---|:---|
| **Cost** | 60-70% cheaper than AWS/GCP/Azure for equivalent compute |
| **Performance** | Dedicated vCPUs, NVMe storage, low latency |
| **Location** | EU datacenter aligns with GDPR requirements |
| **Simplicity** | No complex pricing models, predictable billing |
| **IPv4 included** | No extra charge for public IP |

---

## 3. Initial Provisioning

### 3.1 Create Server (Hetzner Cloud Console)

1. Log in to [Hetzner Cloud Console](https://console.hetzner.cloud)
2. Projects -> TwinMOS Website -> Servers -> Add Server
3. Configure:

| Setting | Value |
|:---|:---|
| **Name** | `twinmos-backend-prod` |
| **Location** | Nuremberg |
| **Image** | Ubuntu 24.04 |
| **Type** | CX32 (or CX42 for P3) |
| **Networking** | IPv4 + IPv6 |
| **Volumes** | None (NVMe included) |
| **Firewalls** | `twinmos-backend-fw` (see Section 5) |
| **SSH Keys** | Add team SSH keys |
| **Cloud-Init** | Enable (see Section 3.2) |

### 3.2 Cloud-Init Configuration

```yaml
#cloud-config
package_update: true
package_upgrade: true

packages:
  - curl
  - wget
  - vim
  - htop
  - ncdu
  - ufw
  - fail2ban
  - unattended-upgrades
  - apt-listchanges
  - logwatch
  - chrony

users:
  - name: deploy
    groups: sudo, docker
    shell: /bin/bash
    sudo: ['ALL=(ALL) NOPASSWD:ALL']
    ssh_authorized_keys:
      - ssh-ed25519 AAAAC3NzaC... deploy@twinmos

runcmd:
  # Set timezone
  - timedatectl set-timezone UTC
  
  # Enable automatic security updates
  - dpkg-reconfigure -plow unattended-upgrades
  
  # Configure fail2ban
  - systemctl enable fail2ban
  - systemctl start fail2ban
  
  # Configure chrony (NTP)
  - systemctl enable chrony
  - systemctl start chrony
  
  # Harden SSH
  - sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
  - sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
  - sed -i 's/#MaxAuthTries 6/MaxAuthTries 3/' /etc/ssh/sshd_config
  - systemctl restart sshd
  
  # Create backup directories
  - mkdir -p /backups/postgres /backups/meilisearch /backups/config
  
  # Set up log rotation
  - logrotate -f /etc/logrotate.conf
```

---

## 4. System Hardening

### 4.1 SSH Hardening

```bash
# /etc/ssh/sshd_config

# Disable root login
PermitRootLogin no

# Key-based auth only
PasswordAuthentication no
PubkeyAuthentication yes

# Limit auth attempts
MaxAuthTries 3
MaxSessions 2

# Use secure algorithms only
KexAlgorithms curve25519-sha256@libssh.org,ecdh-sha2-nistp521
Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com
MACs hmac-sha2-512-etm@openssh.com,hmac-sha2-256-etm@openssh.com

# Idle timeout
ClientAliveInterval 300
ClientAliveCountMax 2

# Restrict to specific users
AllowUsers deploy

# Disable forwarding (unless needed)
AllowTcpForwarding no
X11Forwarding no
```

```bash
# Apply SSH config
sudo systemctl restart sshd

# Verify
sudo sshd -t
```

### 4.2 Firewall (UFW)

```bash
# Reset UFW
sudo ufw --force reset

# Default deny
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (restricted to office IP)
sudo ufw allow from <office-ip> to any port 22 proto tcp

# Allow HTTP/HTTPS from Cloudflare only
sudo ufw allow from 173.245.48.0/20 to any port 80 proto tcp
sudo ufw allow from 103.21.244.0/22 to any port 80 proto tcp
sudo ufw allow from 103.22.200.0/22 to any port 80 proto tcp
sudo ufw allow from 103.31.4.0/22 to any port 80 proto tcp
sudo ufw allow from 141.101.64.0/18 to any port 80 proto tcp
sudo ufw allow from 108.162.192.0/18 to any port 80 proto tcp
sudo ufw allow from 190.93.240.0/20 to any port 80 proto tcp
sudo ufw allow from 188.114.96.0/20 to any port 80 proto tcp
sudo ufw allow from 197.234.240.0/22 to any port 80 proto tcp
sudo ufw allow from 198.41.128.0/17 to any port 80 proto tcp
sudo ufw allow from 162.158.0.0/15 to any port 80 proto tcp
sudo ufw allow from 104.16.0.0/13 to any port 80 proto tcp
sudo ufw allow from 104.24.0.0/14 to any port 80 proto tcp
sudo ufw allow from 172.64.0.0/13 to any port 80 proto tcp
sudo ufw allow from 131.0.72.0/22 to any port 80 proto tcp

# Repeat for HTTPS (port 443)
# ... same Cloudflare IP ranges for port 443

# Allow Coolify dashboard (restricted to office IP)
sudo ufw allow from <office-ip> to any port 8000 proto tcp

# Enable UFW
sudo ufw enable

# Verify
sudo ufw status verbose
```

### 4.3 Fail2ban Configuration

```ini
# /etc/fail2ban/jail.local

[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3
backend = systemd

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log

[nginx-botsearch]
enabled = true
port = http,https
filter = nginx-botsearch
logpath = /var/log/nginx/access.log
maxretry = 2
```

```bash
sudo systemctl restart fail2ban
sudo fail2ban-client status
```

### 4.4 Automatic Security Updates

```bash
# /etc/apt/apt.conf.d/50unattended-upgrades

Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
    "${distro_id}ESMApps:${distro_codename}-apps-security";
    "${distro_id}ESM:${distro_codename}-infra-security";
};

Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::InstallOnShutdown "false";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Remove-New-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
Unattended-Upgrade::Mail "devops@twinmos.com";
```

---

## 5. Hetzner Firewall (Cloud)

Create a Hetzner Cloud Firewall for additional protection:

| Direction | Protocol | Port | Source | Description |
|:---|:---|:---|:---|:---|
| In | TCP | 22 | `<office-ip>/32` | SSH access |
| In | TCP | 80 | Cloudflare IPs | HTTP from CDN |
| In | TCP | 443 | Cloudflare IPs | HTTPS from CDN |
| In | TCP | 8000 | `<office-ip>/32` | Coolify dashboard |
| In | ICMP | Any | Any | Ping for monitoring |
| Out | Any | Any | Any | All outbound (default) |

**Apply firewall to:** `twinmos-backend-prod` server

---

## 6. Docker Configuration

### 6.1 Docker Daemon Hardening

```json
// /etc/docker/daemon.json
{
  "live-restore": true,
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "userland-proxy": false,
  "no-new-privileges": true,
  "seccomp-profile": "/etc/docker/seccomp-default.json"
}
```

```bash
sudo systemctl restart docker
```

### 6.2 Docker Network Isolation

```bash
# Create isolated network for Coolify
 docker network create --driver bridge --subnet=172.20.0.0/16 coolify

# Verify
 docker network ls
 docker network inspect coolify
```

---

## 7. Monitoring Agent Setup

### 7.1 Node Exporter (Prometheus)

```bash
# Install node exporter for system metrics
wget https://github.com/prometheus/node_exporter/releases/download/v1.8.0/node_exporter-1.8.0.linux-amd64.tar.gz
tar xzf node_exporter-1.8.0.linux-amd64.tar.gz
sudo mv node_exporter-1.8.0.linux-amd64/node_exporter /usr/local/bin/

# Create systemd service
sudo tee /etc/systemd/system/node_exporter.service > /dev/null <<EOF
[Unit]
Description=Node Exporter
After=network.target

[Service]
User=node_exporter
Group=node_exporter
ExecStart=/usr/local/bin/node_exporter
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo useradd --no-create-home --shell /bin/false node_exporter
sudo systemctl daemon-reload
sudo systemctl enable node_exporter
sudo systemctl start node_exporter
```

### 7.2 Hetzner Cloud Monitoring

Enable in Hetzner Console:
1. Server -> Metrics -> Enable
2. Alerts: CPU > 80%, RAM > 85%, Disk > 80%

---

## 8. Backup & Recovery

### 8.1 Configuration Backup

```bash
#!/bin/bash
# /opt/backup/config-backup.sh

BACKUP_DIR="/backups/config"
DATE=$(date +%Y%m%d_%H%M%S)
BUCKET="twinmos-db-backups"

# Backup critical configuration
tar czf "$BACKUP_DIR/config_$DATE.tar.gz" \
  /etc/ssh/sshd_config \
  /etc/ufw \
  /etc/fail2ban \
  /etc/docker \
  /opt/backup \
  /root/.docker

# Encrypt
gpg --symmetric --cipher-algo AES256 --batch --passphrase "$BACKUP_PASSPHRASE" \
  --output "$BACKUP_DIR/config_$DATE.tar.gz.gpg" "$BACKUP_DIR/config_$DATE.tar.gz"

# Upload
b2 upload-file "$BUCKET" "$BACKUP_DIR/config_$DATE.tar.gz.gpg" "config/config_$DATE.tar.gz.gpg"

# Cleanup
rm "$BACKUP_DIR/config_$DATE.tar.gz" "$BACKUP_DIR/config_$DATE.tar.gz.gpg"
```

**Cron**: Weekly (`0 3 * * 0`)

### 8.2 Snapshot Policy

| Type | Frequency | Retention |
|:---|:---|:---|
| Automated snapshots | Daily | 7 days |
| Pre-release snapshot | Manual | Until next release |
| Manual snapshot | Ad-hoc | 30 days |

**Create manual snapshot:**

```bash
# Via Hetzner CLI
hcloud server create-image --type snapshot twinmos-backend-prod --description "pre-v1.4.0"
```

---

## 9. Maintenance Procedures

### 9.1 Monthly Maintenance

```bash
# 1. Update system packages
sudo apt update && sudo apt upgrade -y

# 2. Review logs
sudo logwatch --detail high --range yesterday

# 3. Check disk usage
ncdu /

# 4. Review fail2ban status
sudo fail2ban-client status

# 5. Verify backup integrity
b2 ls twinmos-db-backups | tail -5

# 6. Check Docker for dangling resources
 docker system prune -f
 docker volume prune -f
```

### 9.2 Quarterly Maintenance

- Review and rotate SSH keys
- Audit user accounts
- Review firewall rules
- Update Cloud-Init config if needed
- Test disaster recovery procedure

---

## 10. Troubleshooting

| Issue | Symptom | Solution |
|:---|:---|:---|
| Cannot SSH | Connection refused | Check UFW, Hetzner firewall, SSH service status |
| High CPU | System slow | Check `htop`, identify process, review logs |
| Out of disk space | Writes failing | Run `ncdu`, clean logs, prune Docker |
| Docker won't start | Service failed | Check `journalctl -u docker`, verify daemon.json |
| Network unreachable | No connectivity | Check Hetzner console VNC, verify network config |
| SSL errors | Certificate invalid | Check cert expiry, verify domain DNS |

---

## 11. Change Log

| Version | Date | Author | Changes |
|:---|:---|:---|:---|
| 1.0 | 2026-05-01 | DevOps Lead | Initial release |

---

## 12. Sign-off

| Role | Name | Date | Signature |
|:---|:---|:---|:---|
| DevOps Lead | | | |
| Tech Lead | | | |
| Project Manager | | | |
