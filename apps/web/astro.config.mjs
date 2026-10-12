import { defineConfig } from 'astro/config';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
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
        writeFileSync(
          `${outDir}/build-info.json`,
          JSON.stringify({ app: 'web', commitSha, builtAt: new Date().toISOString() }, null, 2)
        );
      },
    },
  };
}

export default defineConfig({
  site: 'https://www.twinmos.com',
  output: 'static',
  build: { format: 'file' },
  integrations: [buildInfoIntegration()],
  server: { proxy: { '/api': 'http://127.0.0.1:8787' } },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ar', 'hi', 'ru', 'zh-cn', 'fr', 'es', 'pt', 'de'],
    routing: { prefixDefaultLocale: false },
  },
});

