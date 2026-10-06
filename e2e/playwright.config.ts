// Phase 4.1+4.2 — Playwright gates (TM-REM-2026-001).
// Public specs run against the BUILT static site (`astro preview`); admin
// specs run against the Vite dev server, which proxies /api to the API.
// Both servers are declared here as webServers so CI is self-sufficient:
// the workflow only boots the API (scratch PGlite store); these entries
// start preview (:4321) and the admin SPA (:5173) and tear them down.
// Locally the servers are REUSED when already running (dev shape == CI shape:
// the site talks to the API cross-origin at PUBLIC_API_URL, allow-listed via
// ALLOWED_ORIGIN on the API).
import { defineConfig } from '@playwright/test';

const WEB_PORT = process.env.E2E_WEB_PORT ?? '4321';
// NOTE: localhost (not 127.0.0.1) — the dev astro server binds IPv6 ::1 and
// the API binds both; `localhost` resolves correctly for each.
const WEB = `http://localhost:${WEB_PORT}`;
const ADMIN = process.env.E2E_ADMIN_URL ?? 'http://localhost:5173';
const REUSE = !process.env.CI;

export default defineConfig({
  testDir: '.',
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  workers: 1, // serial: one API + one site under test
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: WEB,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'public', testMatch: /public\.spec\.ts/ },
    { name: 'admin', testMatch: /admin\.spec\.ts/ },
  ],
  webServer: [
    {
      // built bundle — run `npm run build --workspace @twinmos/web` first
      // (the CI workflow does; locally the dev server is reused instead)
      name: 'web',
      command: 'npm run preview --workspace @twinmos/web',
      url: `${WEB}/`,
      reuseExistingServer: REUSE,
      timeout: 60_000,
    },
    {
      name: 'admin',
      command: 'npm run dev --workspace @twinmos/admin',
      url: `${ADMIN}/`,
      reuseExistingServer: REUSE,
      timeout: 60_000,
    },
  ],
});
