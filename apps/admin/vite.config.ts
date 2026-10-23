import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { execSync } from 'node:child_process';

function buildInfoPlugin() {
  return {
    name: 'build-info-stamp',
    closeBundle() {
      let commitSha = process.env.GIT_SHA || process.env.GITHUB_SHA || '';
      if (!commitSha) {
        try {
          commitSha = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
        } catch {
          commitSha = 'dev-local';
        }
      }
      try {
        const outDir = resolve(process.cwd(), 'dist');
        mkdirSync(outDir, { recursive: true });
        writeFileSync(
          resolve(outDir, 'build-info.json'),
          JSON.stringify({ app: 'admin', commitSha, builtAt: new Date().toISOString() }, null, 2)
        );
      } catch {}
    },
  };
}

// Dev proxy keeps the admin SPA same-origin with the API (no CORS/cookie friction);
// the API still allows configured origins via cors() for other deployments.
export default defineConfig(({ mode }) => ({
  base: process.env.VITE_BASE ?? (mode === 'production' ? '/admin/' : '/'),
  plugins: [react(), buildInfoPlugin()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': { target: 'http://127.0.0.1:8787', changeOrigin: true },
    },
  },
}));

