// Where-to-buy corpus importer — bootstraps the distributor directory from the
// static where-to-buy page cards (the audited prototype markup), so the admin
// Directory manages the SAME entries the public locator renders. Idempotent by
// (name, country): re-runs never clobber admin edits.
// Run from repo root:  node --experimental-strip-types --no-warnings tooling/import-distributors.ts
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDb, distributor, marketplaceListing } from './db-bridge.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const ASTRO = join(HERE, '..', 'apps', 'web', 'src', 'pages', 'where-to-buy.astro');

const src = readFileSync(ASTRO, 'utf8');
// The astro file carries the body as an escaped JS string: quotes are \" —
// normalize so attribute parsing matches plain HTML.
const html = src.replace(/\\"/g, '"').replace(/\\n/g, '\n');

type Card = { country: string; name: string; region: string; status: string; cities: string[]; note: string; website: string };

const cardRe = /class="dcard" data-cc="([^"]*)" data-region="([^"]*)" data-status="([^"]*)"/g;
const marks = [...html.matchAll(cardRe)].map((mm) => ({ index: mm.index ?? 0, region: mm[2], status: mm[3] }));

const cards: Card[] = [];
for (let i = 0; i < marks.length; i++) {
  const block = html.slice(marks[i].index, i + 1 < marks.length ? marks[i + 1].index : marks[i].index + 6000);
  const country = (block.match(/<div class="dc-title"><b>([^<]+)<\/b>/) || [])[1]?.trim();
  if (!country) continue;
  const tag = (block.match(/<p class="dc-tag">([^<]*)<\/p>/) || [])[1]?.trim() ?? '';
  const note = (block.match(/<p class="dc-note">([^<]*)<\/p>/) || [])[1]?.trim() ?? '';
  const cities = [...block.matchAll(/<div class="dc-cities">([\s\S]*?)<\/div>/g)]
    .flatMap((cm) => [...cm[1].matchAll(/<span>([^<]+)<\/span>/g)].map((x) => x[1].trim()))
    .filter(Boolean);
  const website = (block.match(/class="btn btn-primary btn-sm" href="(https?:[^"]+)"/) || [])[1] ?? '';
  cards.push({
    country,
    name: tag && !/^regional hq/i.test(tag) ? tag : country,
    region: marks[i].region,
    status: marks[i].status,
    cities: cities.slice(0, 20),
    note,
    website,
  });
}

// marketplace cards: #marketplaces section — h3 platform + primary href
const officesIdx = html.indexOf('id="offices"');
const mkSection = html.slice(html.indexOf('id="marketplaces"'), officesIdx > 0 ? officesIdx : html.length);
const mkRe = /<h3 class="h3" style="margin-top:10px">([^<]+)<\/h3>[\s\S]*?href="(https?:[^"]+)"/g;
const marketplaces = [...mkSection.matchAll(mkRe)].map((mm) => ({ platform: mm[1].trim(), url: mm[2] }));

const db = createDb();
const existing = await db.select().from(distributor);
const keyOf = (x: any) => `${x.name.toLowerCase()}|${x.country.toLowerCase()}`;
const keys = new Set(existing.map(keyOf));
let created = 0;
for (const c of cards) {
  const key = keyOf(c);
  if (keys.has(key)) continue;
  await db.insert(distributor).values({
    name: c.name, country: c.country, region: c.region, status: c.status,
    cities: c.cities, note: c.note || null,
    contact: c.website ? { website: c.website } : {},
  });
  keys.add(key);
  created++;
}

const existingMk = new Set((await db.select().from(marketplaceListing)).map((x: any) => x.platform.toLowerCase()));
let mkCreated = 0;
for (const mk of marketplaces) {
  if (existingMk.has(mk.platform.toLowerCase())) continue;
  await db.insert(marketplaceListing).values({ platform: mk.platform, url: mk.url, verifiedAt: new Date() });
  existingMk.add(mk.platform.toLowerCase());
  mkCreated++;
}

console.log(`[import-distributors] cards parsed=${cards.length} created=${created} | marketplaces parsed=${marketplaces.length} created=${mkCreated}`);
const client = (db as any).$client;
await client.close();
