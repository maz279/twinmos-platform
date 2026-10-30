// Audit helper (dev only): stop the API first (PGlite is single-process).
// 1) Prints a table-count inventory of the dev database.
// 2) Resets the seed admin password to SEED_ADMIN_PASSWORD (default dev value)
//    using Better Auth's own hashPassword so the format stays compatible.
import { createDb } from '@twinmos/db';
import * as schema from '@twinmos/db';
import { sql } from 'drizzle-orm';
import { hashPassword } from '@better-auth/utils/password';

const db = createDb();

// 1) inventory — row counts for every table in the schema
const tables = Object.values(schema).filter((v) => typeof v === 'object' && v !== null && Symbol.for('drizzle:Name') in v);
console.log('=== TABLE INVENTORY ===');
for (const t of tables) {
  const name = t[Symbol.for('drizzle:Name')];
  try {
    const r = await db.execute(sql.raw(`select count(*)::int as n from "${name}"`));
    console.log(String(name).padEnd(22), r.rows[0].n);
  } catch (e) {
    console.log(String(name).padEnd(22), 'ERR', e.message?.slice(0, 60));
  }
}

// users + roles
console.log('=== USERS ===');
const users = await db.execute(sql.raw('select email, name, role, two_factor_enabled, banned from "user" order by created_at'));
for (const u of users.rows) console.log(JSON.stringify(u));

// published split for content-bearing tables
for (const [label, tbl] of [['product', 'product'], ['article', 'article'], ['news_post', 'news_post'], ['faq', 'faq'], ['page', 'page'], ['compatibility_rule', 'compatibility_rule'], ('nav' in {} ? [] : ['nav_menu', 'nav_menu'])]) {
  if (!tbl) continue;
  try {
    const r = await db.execute(sql.raw(`select status, count(*)::int n from "${tbl}" group by status order by status`));
    console.log(`=== ${label} by status ===`, JSON.stringify(r.rows));
  } catch { console.log(`=== ${label} === (no status col)`); }
}

// 2) password reset for the admin account
const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@twinmos.dev';
const password = process.env.SEED_ADMIN_PASSWORD ?? 'Audit-Reset-2026!x';
const hash = await hashPassword(password);
await db.execute(sql.raw(`update account set password = '${hash.replace(/'/g, "''")}' where provider_id = 'credential' and account_id = (select id from "user" where email = '${email}')`));
const check = await db.execute(sql.raw(`select email, role from "user" where email = '${email}'`));
console.log('=== RESET ===', JSON.stringify(check.rows), '-> password set to SEED_ADMIN_PASSWORD env or Audit-Reset-2026!x');

const client = db.$client;
await client.close();
process.exit(0);
