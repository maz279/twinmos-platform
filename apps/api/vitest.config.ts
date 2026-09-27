import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    hookTimeout: 60_000,
    testTimeout: 60_000,
    pool: 'forks', // PGlite + WASM need a real process per suite
    fileParallelism: false, // isolated temp DBs, sequential keeps output readable
  },
});
