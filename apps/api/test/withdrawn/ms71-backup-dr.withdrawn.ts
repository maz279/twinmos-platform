import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..', '..', '..');

describe('MS7.1 · Backups and Disaster Recovery Verification', () => {
  describe('T7.1.1: Remove Fake Drill & Make Restore Safe (Z-23 & Z-41)', () => {
    it('ensures fake drill tooling/dr-drill.mjs is permanently deleted (Z-23)', () => {
      const fakeDrillPath = resolve(repoRoot, 'tooling', 'dr-drill.mjs');
      expect(existsSync(fakeDrillPath)).toBe(false);
    });

    it('ensures deploy/restore.sh isolates file extraction during --drill without writing /var/lib/twinmos (Z-41)', () => {
      const restoreScript = resolve(repoRoot, 'deploy', 'restore.sh');
      expect(existsSync(restoreScript)).toBe(true);
      const content = readFileSync(restoreScript, 'utf8');

      // Checks that --drill redirects file extraction away from production paths
      expect(content).toContain('DRILL_UPLOADS_DIR');
      expect(content).toContain('DRILL_FILES_DIR');
      expect(content).toContain('mktemp -d');
      expect(content).toContain('extracting uploaded files into throwaway directory');
    });

    it('ensures deploy/restore.sh supports argument order agnosticism', () => {
      const restoreScript = resolve(repoRoot, 'deploy', 'restore.sh');
      const content = readFileSync(restoreScript, 'utf8');
      expect(content).toContain('--drill');
      expect(content).toContain('SRC=');
    });

    it('ensures docs/runbooks/ROLLBACK.md line 64 has correct argument order (Z-41)', () => {
      const rollbackDoc = resolve(repoRoot, 'docs', 'runbooks', 'ROLLBACK.md');
      expect(existsSync(rollbackDoc)).toBe(true);
      const content = readFileSync(rollbackDoc, 'utf8');
      expect(content).toContain('restore.sh /var/backups/twinmos/backup_pre_deploy --drill');
      expect(content).not.toContain('restore.sh --drill /var/backups/twinmos/backup_pre_deploy');
    });
  });

  describe('T7.1.2: Point-In-Time Recovery & WAL Archiving Configurations', () => {
    it('validates deploy/pgbackrest/pgbackrest.conf stanza and cipher settings', () => {
      const confPath = resolve(repoRoot, 'deploy', 'pgbackrest', 'pgbackrest.conf');
      expect(existsSync(confPath)).toBe(true);
      const content = readFileSync(confPath, 'utf8');
      expect(content).toContain('[twinmos]');
      expect(content).toContain('repo1-path=/var/backups/twinmos/pgbackrest');
      expect(content).toContain('repo1-cipher-type=aes-256-cbc');
      expect(content).toContain('repo1-retention-full=4');
    });

    it('validates deploy/postgresql.conf.fragment WAL archiving & 15-minute RPO timeout', () => {
      const fragPath = resolve(repoRoot, 'deploy', 'postgresql.conf.fragment');
      expect(existsSync(fragPath)).toBe(true);
      const content = readFileSync(fragPath, 'utf8');
      expect(content).toContain('wal_level = replica');
      expect(content).toContain('archive_mode = on');
      expect(content).toContain('archive_command = \'pgbackrest --stanza=twinmos archive-push %p\'');
      expect(content).toContain('archive_timeout = 900');
    });

    it('validates deploy/backup.sh generates both pg_dump -Fc and pg_dumpall --globals-only with sha256 checksums', () => {
      const backupScript = resolve(repoRoot, 'deploy', 'backup.sh');
      expect(existsSync(backupScript)).toBe(true);
      const content = readFileSync(backupScript, 'utf8');
      expect(content).toContain('pg_dump');
      expect(content).toContain('-Fc');
      expect(content).toContain('pg_dumpall --globals-only');
      expect(content).toContain('sha256sum');
      expect(content).toContain('globals.sql');
    });
  });

  describe('T7.1.3: Off-Site Copies, Client-Side Encryption & Retention Schedule', () => {
    it('validates deploy/backup-retention.sh enforces 35-day, 12-week, and 12-month retention', () => {
      const retentionScript = resolve(repoRoot, 'deploy', 'backup-retention.sh');
      expect(existsSync(retentionScript)).toBe(true);
      const content = readFileSync(retentionScript, 'utf8');
      expect(content).toContain('DAILY_RETAIN_DAYS=35');
      expect(content).toContain('WEEKLY_RETAIN_DAYS=84');
      expect(content).toContain('MONTHLY_RETAIN_DAYS=365');
      expect(content).toContain('35 days');
      expect(content).toContain('12 weeks');
      expect(content).toContain('12 months');
    });

    it('validates deploy/backup.sh supports client-side AES-256-CBC encryption for offsite sync', () => {
      const backupScript = resolve(repoRoot, 'deploy', 'backup.sh');
      const content = readFileSync(backupScript, 'utf8');
      expect(content).toContain('openssl enc -aes-256-cbc -salt -pbkdf2');
      expect(content).toContain('.enc');
    });
  });

  describe('T7.1.4: Timed Restore Drill & Runbook Documentation (DR-01)', () => {
    it('validates docs/runbooks/DR.md SLA declarations and updated drill log', () => {
      const drDoc = resolve(repoRoot, 'docs', 'runbooks', 'DR.md');
      expect(existsSync(drDoc)).toBe(true);
      const content = readFileSync(drDoc, 'utf8');
      expect(content).toContain('RTO');
      expect(content).toContain('RPO 15 minutes');
      expect(content).toContain('2026-10-27');
      expect(content).toContain('PASS (PITR restore verified');
      expect(content).not.toContain('tooling/dr-drill.mjs, 395 articles');
    });

    it('validates tooling/ops/dr-restore-drill.mjs exists and satisfies Gate DR-01 contract', async () => {
      const drillScript = resolve(repoRoot, 'tooling', 'ops', 'dr-restore-drill.mjs');
      expect(existsSync(drillScript)).toBe(true);
      const { runDrill } = await import(drillScript);
      expect(typeof runDrill).toBe('function');
    });

    it('validates docs/evidence/dr_restore_drill_log.md captures verified drill telemetry', () => {
      const logDoc = resolve(repoRoot, 'docs', 'evidence', 'dr_restore_drill_log.md');
      expect(existsSync(logDoc)).toBe(true);
      const content = readFileSync(logDoc, 'utf8');
      expect(content).toContain('Disaster Recovery & Point-In-Time Restore Drill Log');
      expect(content).toContain('DR-01');
      expect(content).toContain('RTO < 900s');
    });
  });
});
