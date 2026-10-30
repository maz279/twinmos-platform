// ZT check (ZT-077): uploaded media survives an API container restart.
//   node tooling/audit-zt/media-persist.mjs upload <state.json>   — editor uploads a PNG
//   (restart the api container)
//   node tooling/audit-zt/media-persist.mjs verify <state.json> <out.json>
// The PNG is generated here (1x1, random colour) so its bytes are unique to the run.
import { readFileSync, writeFileSync } from 'node:fs';
import { deflateSync, crc32 } from 'node:zlib';
import { createHash, randomBytes } from 'node:crypto';
import { FormData } from 'undici'; // the edge client is undici's fetch: use its multipart class
import { edge, json, Report } from './lib/edge.mjs';
import { signIn, loadAccounts } from './lib/staff.mjs';

const [phase, stateFile, outFile] = process.argv.slice(2);

function png() {
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type), data]);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
    return Buffer.concat([len, td, crc]);
  };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(1, 0); ihdr.writeUInt32BE(1, 4); ihdr[8] = 8; ihdr[9] = 2;
  const raw = Buffer.concat([Buffer.from([0]), randomBytes(3)]);
  return Buffer.concat([Buffer.from('89504e470d0a1a0a', 'hex'), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
const sha = (b) => createHash('sha256').update(b).digest('hex');

if (phase === 'upload') {
  const acc = loadAccounts();
  const jar = (await signIn(acc.editor.email, acc.editor.password, acc.editor.totp)).jar;
  const bytes = png();
  const fd = new FormData();
  fd.append('file', new Blob([bytes], { type: 'image/png' }), `zt-persist-${Date.now()}.png`);
  fd.append('alt', 'Zero-trust persistence probe');
  const r = await edge('/api/v1/admin/media', { method: 'POST', body: fd }, { jar });
  const body = await json(r);
  const id = body.id ?? body.data?.id;
  writeFileSync(stateFile, JSON.stringify({ status: r.status, id, sha: sha(bytes) }));
  console.log(`upload ${r.status} id=${id}`, r.status >= 300 ? JSON.stringify(body).slice(0, 300) : '');
  process.exit(r.status === 201 || r.status === 200 ? 0 : 1);
}

if (phase === 'verify') {
  const st = JSON.parse(readFileSync(stateFile, 'utf8'));
  const rep = new Report('media-persist');
  const r = await edge(`/api/v1/media/${st.id}/file`);
  const got = Buffer.from(await r.arrayBuffer());
  rep.check('MEDIA-01 uploaded image still served, byte-identical, after an api restart', r.status === 200 && sha(got) === st.sha, { upload: st.status, status: r.status, same: sha(got) === st.sha });
  writeFileSync(outFile, JSON.stringify(rep.summary(), null, 2));
  process.exit(rep.failed.length ? 1 : 0);
}
console.error('usage: media-persist.mjs upload <state.json> | verify <state.json> <out.json>');
process.exit(2);
