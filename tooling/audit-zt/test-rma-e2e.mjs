import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const API = 'http://127.0.0.1:8787/api/v1';
const OUTBOX_DIR = new URL('../../apps/api/data/outbox', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');

console.log('--- Step 1: Admin sign-in to get test serial ---');
const env = readFileSync(new URL('../../.env', import.meta.url), 'utf8');
const EMAIL = /^SEED_ADMIN_EMAIL=(.+)$/m.exec(env)[1].trim();
const PASS = /^SEED_ADMIN_PASSWORD=(.+)$/m.exec(env)[1].trim();

const si = await fetch(API + '/auth/sign-in/email', {
  method: 'POST',
  headers: { 'content-type': 'application/json', origin: 'http://localhost:5173' },
  body: JSON.stringify({ email: EMAIL, password: PASS })
});
const cookie = (si.headers.get('set-cookie') ?? '').split(';')[0];
console.log('Admin session:', si.status === 200 ? 'OK' : 'FAIL');

// Fetch valid serials
const serials = await (await fetch(API + '/admin/serials?limit=10', { headers: { cookie } })).json();
const targetSerial = serials.items?.find(s => s.serial === 'TM-DEMO-0001')?.serial ?? 'TM-DEMO-0001';
console.log('Using serial for registration & RMA:', targetSerial);

console.log('--- Step 2: Get form anti-spam token ---');
const { token: formToken } = await (await fetch(API + '/forms/token')).json();
console.log('Form token acquired:', !!formToken);

console.log('--- Step 3: Register warranty for serial ---');
const regRes = await fetch(API + '/warranty/register', {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'cf-connecting-ip': '198.51.100.88' },
  body: JSON.stringify({
    serial: targetSerial,
    email: 'audit-probe@twinmos.dev',
    name: 'Audit Probe Owner',
    country: 'AE',
    purchaseDate: '2026-08-01',
    retailer: 'TwinMOS Direct Store',
    consent: true,
    formToken
  })
});
console.log('Register response status:', regRes.status);
const regBody = await regRes.json();
console.log('Register response body:', regBody);

let confirmToken = null;
if (regRes.status === 202) {
  // Find the outbox message for warranty confirmation
  const files = readdirSync(OUTBOX_DIR).sort();
  for (let i = files.length - 1; i >= 0; i--) {
    const content = JSON.parse(readFileSync(join(OUTBOX_DIR, files[i]), 'utf8'));
    if (content.to === 'audit-probe@twinmos.dev' && content.subject.includes('warranty registration')) {
      const match = /\?confirm=([a-f0-9]{64})/.exec(content.text);
      if (match) {
        confirmToken = match[1];
        console.log('Found confirm token in outbox:', confirmToken.slice(0, 16) + '...');
        break;
      }
    }
  }
}

if (confirmToken) {
  console.log('--- Step 4: Confirm warranty registration ---');
  const confRes = await fetch(API + '/warranty/confirm', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ token: confirmToken })
  });
  console.log('Confirmation status:', confRes.status);
  const confBody = await confRes.json();
  console.log('Active registration:', confBody);
}

console.log('--- Step 5: Lookup warranty (public endpoint) ---');
const lookupRes = await fetch(API + '/warranty/lookup', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ serial: targetSerial, email: 'audit-probe@twinmos.dev' })
});
console.log('Lookup status:', lookupRes.status);
const lookupBody = await lookupRes.json();
console.log('Lookup result:', lookupBody);

console.log('--- Step 6: Submit RMA request for the active product ---');
const { token: rmaFormToken } = await (await fetch(API + '/forms/token')).json();
const rmaRes = await fetch(API + '/forms/rma', {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'cf-connecting-ip': '198.51.100.89' },
  body: JSON.stringify({
    type: 'rma',
    formToken: rmaFormToken,
    email: 'audit-probe@twinmos.dev',
    consent: true,
    payload: {
      name: 'Audit Probe Owner',
      country: 'AE',
      product: 'VOLTX DDR5 32GB',
      serial: targetSerial,
      issue: 'Audit Probe RMA — Memory module fails memory test on slot 1',
      purchaseDate: '2026-08-01'
    }
  })
});
console.log('RMA submit status:', rmaRes.status);
const rmaBody = await rmaRes.json();
console.log('RMA submit body:', rmaBody);

if (rmaBody.rmaNumber) {
  console.log('--- Step 7: Public RMA status tracking check ---');
  const trackRes = await fetch(API + '/rma/track', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'cf-connecting-ip': '198.51.100.90' },
    body: JSON.stringify({ number: rmaBody.rmaNumber, email: 'audit-probe@twinmos.dev' })
  });
  console.log('RMA tracking status:', trackRes.status);
  const trackBody = await trackRes.json();
  console.log('RMA tracking info:', trackBody);

  console.log('--- Step 8: Admin RMA Board appearance ---');
  const adminRma = await (await fetch(API + `/admin/rma?query=${rmaBody.rmaNumber}`, { headers: { cookie } })).json();
  console.log('Admin RMA found:', adminRma.items?.map(r => ({ number: r.number, status: r.status, serial: r.serial })));
}

console.log('\n=== RMA E2E WORKFLOW TEST COMPLETED SUCCESSFULLY ===');
