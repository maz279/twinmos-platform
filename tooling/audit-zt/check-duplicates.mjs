import fs from 'node:fs';
if (fs.existsSync('apps/api/data/dev.pgdata.lock')) fs.unlinkSync('apps/api/data/dev.pgdata.lock');
import { createDb } from '@twinmos/db';

const db = createDb();
const pglite = db['$client'];
const res = await pglite.query(`
  SELECT id, number, serial, status, customer, created_at
  FROM rma_request 
  WHERE serial IS NOT NULL AND status NOT IN ('closed','delivered')
  ORDER BY serial, created_at;
`);
console.log('Open RMAs with serial:');
console.table(res.rows);

const dup = await pglite.query(`
  SELECT serial, array_agg(number) as numbers, count(*) as cnt 
  FROM rma_request 
  WHERE serial IS NOT NULL AND status NOT IN ('closed','delivered') 
  GROUP BY serial HAVING count(*) > 1;
`);
console.log('Duplicates:', dup.rows);

await pglite.close();
process.exit(0);
