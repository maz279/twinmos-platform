import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const cwd = 'C:/Software_Project/TwinMOS_Corporate_Website/TwinMOS_Corporate_Website/twinmso_codebase';
const routesDir = join(cwd, 'apps/api/src/routes');

for (const file of readdirSync(routesDir)) {
  const p = join(routesDir, file);
  if (statSync(p).isFile()) {
    const content = readFileSync(p, 'utf8');
    const regex = /\.(get|post|put|delete|patch)\((?:'([^']+)'|"([^"]+)")/g;
    let m;
    const routes = [];
    while ((m = regex.exec(content)) !== null) {
      routes.push(`${m[1].toUpperCase()} ${m[2] || m[3]}`);
    }
    if (routes.length > 0) {
      console.log(`\n=== ${file} (${routes.length} routes) ===`);
      routes.forEach(r => console.log(`  ${r}`));
    }
  }
}
