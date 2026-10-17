# ROLLBACK — TwinMOS Production Rollback Runbook (Task F5 / RUN-01)

## 1. Overview & Rollback Principles

TwinMOS employs a zero-downtime, layered rollback architecture:
1. **Frontend Assets (`apps/web` & `apps/admin`)**: Retain the last 3 release builds in `/var/www/twinmos/releases/`. Atomic switchover via filesystem symlink.
2. **API Backend (`apps/api`)**: Revert application code to previous release tag, install dependencies, and issue atomic graceful reload via systemd (`systemctl restart twinmos-api`).
3. **Database Migrations (`packages/db`)**: All migrations follow the **Expand / Contract pattern**. Schema additions must remain backwards-compatible with n-1 application code. If catastrophic corruption occurs, execute PITR restore via `deploy/restore.sh`.

---

## 2. Emergency Rollback Execution Procedure

### Step 1: Identify Target Previous Release
```bash
# Check git deployment history
cd /opt/twinmos/code
git log --oneline -n 5

# Set target rollback commit/tag
PREV_TAG="v0.2.9" # Replace with target release tag
```

### Step 2: Roll Back Frontend Static Bundles
```bash
# Switch symlinks to previous release directory
sudo ln -sfn /var/www/twinmos/releases/${PREV_TAG}/web /var/www/twinmos/web
sudo ln -sfn /var/www/twinmos/releases/${PREV_TAG}/admin /var/www/twinmos/admin

# Reload Nginx to flush internal file descriptors
sudo systemctl reload nginx
```

### Step 3: Roll Back Node.js API Service
```bash
cd /opt/twinmos/code/apps/api
git checkout ${PREV_TAG}
npm ci --omit=dev

# Graceful restart (zero dropped in-flight HTTP requests)
sudo systemctl reload-or-restart twinmos-api
```

### Step 4: Verify Post-Rollback Health
```bash
# 1. Probe API deep health
curl -s http://127.0.0.1:8787/api/v1/health/deep | jq .

# Expected output:
# { "status": "ok", "components": { "database": { "status": "connected" }, "alerts": { "firingCount": 0 } } }

# 2. Check system logs for runtime exceptions
journalctl -u twinmos-api -n 50 --no-pager
```

### Step 5: Database Disaster Recovery (Only If Schema Corrupted)
If an incompatible database change occurred that cannot run n-1 code:
```bash
# Stop API to avoid partial transaction commits
sudo systemctl stop twinmos-api

# Execute restore to immediate pre-deployment timestamp
# (Backups taken automatically prior to migration)
sudo /opt/twinmos/deploy/restore.sh --drill /var/backups/twinmos/backup_pre_deploy.dump
sudo /opt/twinmos/deploy/restore.sh /var/backups/twinmos/backup_pre_deploy.dump

# Restart API
sudo systemctl start twinmos-api
```

---

## 3. Post-Rollback Verification Checklist

- [ ] `GET /api/v1/health` returns 200 OK.
- [ ] Public site renders correctly on desktop and mobile viewports.
- [ ] Admin console sign-in succeeds for staff members.
- [ ] Serial number check responds genuine for test serial.
- [ ] Contact form submission returns 201 Created and enqueues outbox message.
- [ ] Purge Cloudflare edge cache for modified routes:
  ```bash
  curl -X POST "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/purge_cache" \
    -H "Authorization: Bearer ${CF_API_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{"purge_everything": true}'
  ```
- [ ] File blameless post-mortem in `docs/runbooks/INCIDENT.md`.
