import fs from 'node:fs';
import path from 'node:path';

const dir = 'C:\\Software_Project\\TwinMOS_Corporate_Website\\TwinMOS_Corporate_Website\\audit\\Audit_report\\audit_finding_Implementation';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));

for (const f of files) {
  const full = path.join(dir, f);
  const content = fs.readFileSync(full, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (/(?:R6|Phase.*6|Migration|SIT|UAT|Parallel.*Run)/i.test(line)) {
      console.log(`${f}:${idx + 1}: ${line.trim().slice(0, 120)}`);
    }
  });
}
