import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { execSync } from 'node:child_process';


function buildInfoIntegration() {
  return {
    name: 'build-info-stamp',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        let commitSha = process.env.GIT_SHA || process.env.GITHUB_SHA || '';
        if (!commitSha) {
          try {
            commitSha = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
          } catch {
            commitSha = 'dev-local';
          }
        }
        const outDir = fileURLToPath(dir);
        const stamp = JSON.stringify({
          app: 'web',
          commitSha,
          commit: commitSha,
          builtAt: new Date().toISOString(),
          nodeVersion: process.version,
        }, null, 2);
        writeFileSync(`${outDir}/build-info.json`, stamp);
        try {
          const parentDir = resolve(outDir, '..');
          writeFileSync(resolve(parentDir, 'build-info.json'), stamp);
          const { readdirSync, copyFileSync } = await import('node:fs');
          const entries = readdirSync(outDir, { withFileTypes: true });
          for (const entry of entries) {
            if (entry.isFile() && (entry.name.endsWith('.html') || entry.name.endsWith('.xml') || entry.name.endsWith('.txt'))) {
              copyFileSync(resolve(outDir, entry.name), resolve(parentDir, entry.name));
            }
          }
        } catch {}
      },
    },
  };
}


export default defineConfig({
  site: 'https://www.twinmos.com',
  output: 'static',
  build: { format: 'file' },
  adapter: node({ mode: 'standalone' }),
  session: false,
  integrations: [buildInfoIntegration()],
  server: { proxy: { '/api': 'http://127.0.0.1:8787' } },
  security: {
    allowedDomains: [
      { hostname: 'www.twinmos.com', protocol: 'https' },
      { hostname: 'twinmos.com', protocol: 'https' },
    ],
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ar', 'hi', 'ru', 'zh-cn', 'fr', 'es', 'pt', 'de'],
    routing: { prefixDefaultLocale: false },
  },
});
