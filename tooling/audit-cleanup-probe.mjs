// Audit cleanup: remove the AUDIT_PROBE_TOKEN setting row (D5 verification probe).
// Run with the API STOPPED (PGlite single-process).
import { createDb } from '@twinmos/db';
const db = createDb();
const r = await db.execute(`delete from setting where key = 'AUDIT_PROBE_TOKEN' returning key`);
console.log('deleted rows:', JSON.stringify(r.rows));
const client = db.$client;
await client.close();
process.exit(0);
