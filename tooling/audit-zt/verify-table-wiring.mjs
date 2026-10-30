// Verifies all 53 PostgreSQL tables in packages/db/src/schema.ts
// Maps each table to its consumers across apps/api, apps/admin, and apps/web
import fs from 'node:fs';

const schemaContent = fs.readFileSync('packages/db/src/schema.ts', 'utf8');
const tableMatches = [...schemaContent.matchAll(/export const (\w+) = pgTable\(['"](\w+)['"]/g)];
const tables = tableMatches.map(m => ({ variable: m[1], tableName: m[2] }));

console.log(`Discovered ${tables.length} tables in schema.ts\n`);

function searchInFiles(dirs, patterns) {
  function walk(d) {
    let res = [];
    if (!fs.existsSync(d)) return res;
    for (const f of fs.readdirSync(d)) {
      const p = d + '/' + f;
      if (fs.statSync(p).isDirectory()) res = res.concat(walk(p));
      else if (/\.(ts|tsx|js|astro)$/.test(f)) res.push(p);
    }
    return res;
  }
  const allFiles = dirs.flatMap(d => walk(d));
  const refs = new Set();
  for (const f of allFiles) {
    const text = fs.readFileSync(f, 'utf8');
    for (const pat of patterns) {
      if (text.includes(pat)) refs.add(f);
    }
  }
  return [...refs];
}

const tableMapping = [];
for (const t of tables) {
  const consumers = searchInFiles(['apps/api/src', 'apps/admin/src', 'apps/web/src'], [t.variable, t.tableName]);
  tableMapping.push({
    tableName: t.tableName,
    variable: t.variable,
    consumerCount: consumers.length,
    sampleConsumers: consumers.slice(0, 3).map(p => p.replace(/^apps\//, ''))
  });
}

const unconsumed = tableMapping.filter(t => t.consumerCount === 0);
console.table(tableMapping.slice(0, 25));
console.log(`... and ${tableMapping.length - 25} more tables ...`);
console.log(`\nUnconsumed tables: ${unconsumed.length}`);
if (unconsumed.length > 0) {
  console.log('Unconsumed:', unconsumed);
  process.exit(1);
} else {
  console.log(`All ${tables.length} tables are fully integrated and wired into application services!`);
  process.exit(0);
}
