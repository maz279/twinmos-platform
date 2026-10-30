import fs from 'node:fs';
import path from 'node:path';

const dir = 'C:\\Software_Project\\TwinMOS_Corporate_Website\\TwinMOS_Corporate_Website\\audit\\Audit_report\\audit_finding_Implementation';
for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.md'))) {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  content.split('\n').forEach((l, i) => {
    if (/(?:7 forms|seven forms|all 7|FORMS-01)/i.test(l)) {
      console.log(`${f}:${i+1}: ${l.trim().slice(0, 120)}`);
    }
  });
}
