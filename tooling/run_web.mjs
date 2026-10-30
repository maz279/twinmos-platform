import path from 'node:path';
import { pathToFileURL } from 'node:url';

process.env.PORT = '4321';
process.env.HOST = '0.0.0.0';
process.env.DELIVERY_API_URL = 'http://127.0.0.1:8787';

const entryPath = path.resolve('apps/web/dist/server/entry.mjs');
console.log('Launching Astro server at:', entryPath);

await import(pathToFileURL(entryPath).href);
