// Single-writer guard for PGlite data directories.
//
// PGlite holds the database in-process; a second instance opening the same
// data directory — even read-only, even in the same Node process — silently
// corrupts the store (confirmed incident 2026-10-06). PGlite itself does not
// lock, so we enforce the rule here: a `<dataDir>.lock` file next to the
// directory records the owning PID; live owners refuse new opens with a loud
// error; stale locks (dead PID) are reclaimed automatically.
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';

const ACTIVE = new Map<string, () => void>();

function pidAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (err: unknown) {
    // EPERM = process exists but is owned by another user (Unix); anything
    // else (ESRCH, EINVAL) means the PID is gone.
    return (err as NodeJS.ErrnoException)?.code === 'EPERM';
  }
}

function lockPath(dataDir: string): string {
  return `${dataDir}.lock`;
}

/** Throws a descriptive error if the data dir is already owned by a live process. */
export function acquireDataDirLock(dataDir: string): void {
  const lockFile = lockPath(dataDir);
  if (existsSync(lockFile)) {
    const raw = readFileSync(lockFile, 'utf8').trim();
    const pid = Number(raw);
    if (Number.isFinite(pid)) {
      if (pid === process.pid) {
        throw new Error(
          `[db-lock] PGlite data dir "${dataDir}" is already opened by THIS process (PID ${pid}). ` +
            'PGlite is single-writer — reuse the existing handle instead of calling createDb again.',
        );
      }
      if (pidAlive(pid)) {
        throw new Error(
          `[db-lock] PGlite data dir "${dataDir}" is in use by PID ${pid} (single-writer rule). ` +
            'Stop that process first (or point PGLITE_DATA at a different directory). ' +
            'Opening a second PGlite instance on the same data directory CORRUPTS the database.',
        );
      }
    }
    // Stale or corrupt lock — reclaim it below.
  }
  mkdirSync(dataDir, { recursive: true });
  writeFileSync(lockFile, String(process.pid), 'utf8');
  const release = () => {
    try {
      if (readFileSync(lockFile, 'utf8').trim() === String(process.pid)) unlinkSync(lockFile);
    } catch { /* lock already removed or unreadable — nothing to do */ }
  };
  ACTIVE.set(lockFile, release);
}

/** Explicit release for tools/tests that finish with a data dir before exit. */
export function releaseDataDirLock(dataDir: string): void {
  const lockFile = lockPath(dataDir);
  const release = ACTIVE.get(lockFile);
  if (release) {
    release();
    ACTIVE.delete(lockFile);
  }
}

// Best-effort cleanup so a normally-exiting tool never leaves a live-looking lock.
process.on('exit', () => {
  for (const release of ACTIVE.values()) release();
});
