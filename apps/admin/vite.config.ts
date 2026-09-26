import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev proxy keeps the admin SPA same-origin with the API (no CORS/cookie friction);
// the API still allows configured origins via cors() for other deployments.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://127.0.0.1:8787', changeOrigin: true },
    },
  },
});
