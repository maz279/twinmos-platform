import fs from 'node:fs';
import path from 'node:path';

function searchInDir(dir, pattern) {
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      if (!['node_modules', 'dist', '.git'].includes(item.name)) {
        searchInDir(full, pattern);
      }
    } else if (/\.(js|ts|astro|mjs|json|sql|md)$/.test(item.name)) {
      const txt = fs.readFileSync(full, 'utf8');
      if (pattern.test(txt)) {
        console.log(`Found in: ${full}`);
      }
    }
  }
}

console.log('--- Searching for BRIDGE-0, CONTENT-01, CONTENT-02, BLOCK-STRICT, SEARCH-01 ---');
searchInDir('C:\\Software_Project\\TwinMOS_Corporate_Website\\TwinMOS_Corporate_Website\\twinmso_codebase\\tooling', /(?:BRIDGE-0|CONTENT-01|CONTENT-02|BLOCK-STRICT|SEARCH-01)/);
searchInDir('C:\\Software_Project\\TwinMOS_Corporate_Website\\TwinMOS_Corporate_Website\\twinmso_codebase\\apps', /(?:BRIDGE-0|CONTENT-01|CONTENT-02|BLOCK-STRICT|SEARCH-01)/);
