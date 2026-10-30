import fs from 'node:fs';
import path from 'node:path';

function searchDir(dir, query) {
  let results = [];
  try {
    const list = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of list) {
      const full = path.join(dir, item.name);
      if (item.isDirectory()) {
        if (!['node_modules', '.git', 'dist', 'coverage', '.cache'].includes(item.name)) {
          results = results.concat(searchDir(full, query));
        }
      } else {
        if (query.test(item.name)) {
          results.push(full);
        }
      }
    }
  } catch (err) {}
  return results;
}

const baseDirs = [
  'C:\\Software_Project\\TwinMOS_Corporate_Website',
  'C:\\Software_Project'
];

console.log('Searching for files matching 06 or Migration or SIT or UAT or Parallel...');
for (const base of baseDirs) {
  const matches = searchDir(base, /(?:06|Phase_R6|Migration|SIT|UAT|Parallel_Run)/i);
  for (const m of matches) {
    console.log(m);
  }
}
