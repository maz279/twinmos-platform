import fs from 'node:fs';
import path from 'node:path';

function searchInDir(dir) {
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      if (!['node_modules', 'dist', '.git'].includes(item.name)) {
        searchInDir(full);
      }
    } else if (/\.(js|ts|astro|mjs)$/.test(item.name)) {
      const txt = fs.readFileSync(full, 'utf8');
      if (/FORMS-01/i.test(txt)) {
        console.log(`FORMS-01 found in: ${full}`);
      }
    }
  }
}

searchInDir('C:\\Software_Project\\TwinMOS_Corporate_Website\\TwinMOS_Corporate_Website\\twinmso_codebase\\tooling');
searchInDir('C:\\Software_Project\\TwinMOS_Corporate_Website\\TwinMOS_Corporate_Website\\twinmso_codebase\\apps');
