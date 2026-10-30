// Quick edge smoke: prints status/content-type/first bytes for a few paths.
// Usage: node tooling/audit-zt/smoke.mjs [path ...]
import { edge } from './lib/edge.mjs';

const show = async (label, p, opt) => {
  try {
    const r = await edge(p, {}, opt);
    const t = (await r.text()).slice(0, 160).replace(/\s+/g, ' ');
    console.log(label, r.status, r.headers.get('content-type'), r.headers.get('location') ?? '', '|', t);
  } catch (e) {
    console.log(label, 'ERR', e.cause?.code ?? e.message);
  }
};

const paths = process.argv.slice(2);
if (paths.length) {
  for (const p of paths) await show(p, p);
} else {
  await show('health', '/api/v1/health');
  await show('home', '/');
  await show('no-client-cert', '/', { clientCert: false });
  await show('metrics', '/api/v1/metrics');
  await show('admin', '/admin/');
  await show('products', '/api/v1/delivery/products');
}
