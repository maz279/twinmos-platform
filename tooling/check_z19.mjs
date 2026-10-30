import fs from 'node:fs';

const roadmapPath = 'C:\\Software_Project\\TwinMOS_Corporate_Website\\TwinMOS_Corporate_Website\\audit\\Audit_report\\audit_finding_Implementation\\TwinMOS_Revised_Implementation_Roadmap_v3.1_Phased_2026-10-17.md';
const content = fs.readFileSync(roadmapPath, 'utf8');
const lines = content.split('\n');

lines.forEach((l, idx) => {
  if (/Z-19/i.test(l)) {
    console.log(`Roadmap L${idx+1}: ${l.trim()}`);
  }
});

const zeroTrust = 'C:\\Software_Project\\TwinMOS_Corporate_Website\\TwinMOS_Corporate_Website\\audit\\Audit_report\\audit_finding_Implementation\\TwinMOS_Zero_Trust_Verification_Audit_2026-10-16.md';
const ztContent = fs.readFileSync(zeroTrust, 'utf8');
ztContent.split('\n').forEach((l, idx) => {
  if (/Z-19/i.test(l)) {
    console.log(`ZeroTrust L${idx+1}: ${l.trim()}`);
  }
});
