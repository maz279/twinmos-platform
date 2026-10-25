import fs from 'node:fs';
import path from 'node:path';

function findInDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!e.name.includes('node_modules') && !e.name.includes('.git')) {
        findInDir(full);
      }
    } else {
      if (e.name.toLowerCase().includes('plan') || e.name.toLowerCase().includes('phase') || e.name.toLowerCase().includes('06') || e.name.toLowerCase().includes('r6')) {
        console.log(`[FILE] ${full}`);
      }
      if (e.name.endsWith('.md')) {
        try {
          const content = fs.readFileSync(full, 'utf8');
          if (content.includes('Phase R6') || content.includes('Migration, SIT, UAT') || content.includes('Phase_R6')) {
            console.log(`[CONTENT MATCH] ${full}`);
          }
        } catch(err) {}
      }
    }
  }
}

findInDir('C:\\Software_Project\\TwinMOS_Corporate_Website\\TwinMOS_Corporate_Website\\audit');
findInDir('C:\\Software_Project\\TwinMOS_Corporate_Website\\TwinMOS_Corporate_Website\\Corporate website development for TwinMOS');
