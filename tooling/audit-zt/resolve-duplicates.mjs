import fs from 'node:fs';
if (fs.existsSync('apps/api/data/dev.pgdata.lock')) fs.unlinkSync('apps/api/data/dev.pgdata.lock');
import { createDb } from '@twinmos/db';

const db = createDb();
const pglite = db['$client'];

// For TM-DDR5-8829-001, keep id 43 open, close the rest (ids 36, 37, 38, 39, 40, 42)
await pglite.query(`
  UPDATE rma_request 
  SET status = 'closed'
  WHERE serial = 'TM-DDR5-8829-001' AND id IN (36, 37, 38, 39, 40, 42);
`);

// For TM-DEMO-0002, keep id 67 open, close id 41
await pglite.query(`
  UPDATE rma_request 
  SET status = 'closed'
  WHERE serial = 'TM-DEMO-0002' AND id = 41;
`);

const dup = await pglite.query(`
  SELECT serial, array_agg(number) as numbers, count(*) as cnt 
  FROM rma_request 
  WHERE serial IS NOT NULL AND status NOT IN ('closed','delivered') 
  GROUP BY serial HAVING count(*) > 1;
`);
console.log('Duplicates after resolution:', dup.rows);

await pglite.close();
process.exit(0);
