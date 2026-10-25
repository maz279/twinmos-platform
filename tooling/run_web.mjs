import { spawn } from 'node:child_process';
import path from 'node:path';

process.env.PORT = '4321';
process.env.HOST = '0.0.0.0';
process.env.DELIVERY_API_URL = 'http://127.0.0.1:8787';

const entryPath = path.resolve('apps/web/dist/server/entry.mjs');
console.log('Launching Astro server at:', entryPath);

const proc = spawn('node', [entryPath], {
  stdio: 'inherit',
  env: process.env,
});

proc.on('error', (err) => {
  console.error('Failed to start server:', err);
});

proc.on('exit', (code, sig) => {
  console.log(`Server exited with code ${code}, signal ${sig}`);
});
