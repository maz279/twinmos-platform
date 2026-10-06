// Phase 4.1+4.2 — Playwright gates (TM-REM-2026-001).
// Public specs run against the BUILT static site (astro preview) with the API
// booted on the CI scratch database; admin specs run against the Vite dev
// server or the built admin bundle — in CI we use the built web bundle and
// the API's seeded admin (env-provided credentials, never literals).
import { defineConfig } from '@playwright/test';

const API_PORT = process.env.E2E_API_PORT ?? '8787';
const WEB_PORT = process.env.E2E_WEB_PORT ?? '4321';
// NOTE: localhost (not 127.0.0.1) — the dev astro server binds IPv6 ::1 and
// the API binds both; `localhost` resolves correctly for each.
const API = `http://localhost:${API_PORT}`;
const WEB = `http://localhost:${WEB_PORT}`;

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
});
