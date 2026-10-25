import fs from 'node:fs';

const roadmapPath = 'C:\\Software_Project\\TwinMOS_Corporate_Website\\TwinMOS_Corporate_Website\\audit\\Audit_report\\audit_finding_Implementation\\TwinMOS_Revised_Implementation_Roadmap_v3.1_Phased_2026-10-17.md';
const content = fs.readFileSync(roadmapPath, 'utf8');
const lines = content.split('\n');

lines.forEach((l, idx) => {
  if (/(?:FORMS-01|7 forms|seven forms)/i.test(l)) {
    console.log(`L${idx+1}: ${l.trim()}`);
  }
});
