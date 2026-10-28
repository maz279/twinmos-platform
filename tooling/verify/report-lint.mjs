// EVID-01 / Task T2.2.6: Automated Report Linter
// Scans reports under docs/reports/ to enforce EVID-01 standards:
// 1. Zero future dates (dates later than commit / calendar execution date)
// 2. Zero placeholder names ([Name], [TBD], <TODO>, etc.)
// 3. Claims and metrics must link to verifiable repository artifacts or code paths
// 4. Closes finding Z-02 and automates EVID-01 verification

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..', '..');
const reportsDir = resolve(repoRoot, 'docs', 'reports');

export function lintReportContent(content, filename = 'inline-test', referenceDateStr = null) {
  const errors = [];
  const warnings = [];

  // 1. Reference date calculation (default to today / 2026-10-17)
  const now = referenceDateStr ? new Date(referenceDateStr) : new Date();
  // Set to end of the day in UTC for fair comparison
  const nowUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  // 2. Check for future dates: Matches YYYY-MM-DD
  const dateRegex = /\b(20\d{2})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\b/g;
  let match;
  while ((match = dateRegex.exec(content)) !== null) {
    const matchedDateStr = match[0];
    const [year, month, day] = matchedDateStr.split('-').map(Number);
    const parsedUtc = Date.UTC(year, month - 1, day, 0, 0, 0);

    // If date is later than reference date
    if (parsedUtc > nowUtc) {
      errors.push({
        type: 'FUTURE_DATE',
        file: filename,
        date: matchedDateStr,
        message: `Future date detected (${matchedDateStr}) exceeding current timeline (${new Date(nowUtc).toISOString().slice(0, 10)})`
      });
    }
  }

  // 3. Check for placeholder markers: [Name], [TBD], [TODO], <TBD>, <TODO>, [Insert...]
  const placeholderRegex = /\[(?:Name|Insert|TBD|TODO|Placeholder|Sign-off)\]|<(?:TBD|TODO|Insert)>/gi;
  while ((match = placeholderRegex.exec(content)) !== null) {
    errors.push({
      type: 'PLACEHOLDER',
      file: filename,
      match: match[0],
      message: `Unresolved placeholder marker found: "${match[0]}"`
    });
  }

  // 3b. Zero-trust audit 2026-10-28: invented sign-off personas used in the
  // withdrawn launch records — a real sign-off names a real person in a real role.
  const personaRegex = /\b(Victoria Sterling|Tariq Al-Mansoor|Tariq Al-Hashimi|Marcus Brody|Elena Rostova|David Vance|P\. Lead|S\. Auditor|Antigravity Quality Gate)\b/g;
  while ((match = personaRegex.exec(content)) !== null) {
    errors.push({ type: 'INVENTED_SIGNOFF', file: filename, match: match[0], message: `Invented persona used as a sign-off or approver: "${match[0]}"` });
  }
  // 3c. A local file:/// path is not a CI artefact.
  if (/file:\/\/\//i.test(content)) {
    errors.push({ type: 'LOCAL_ARTEFACT', file: filename, message: 'file:/// links are local paths, not CI artefacts' });
  }
  // 3d. Launch events cannot be reported before they are scheduled (roadmap v3.1:
  // go/no-go 2027-03-26, go-live week of 2027-03-29, hypercare exit by 2027-04-09).
  if (/\b(go[- ]?live (completed|achieved|executed)|hypercare exit (report|criteria)[^\n]*(fulfilled|met|satisfied)|unanimous go)\b/i.test(content) && nowUtc < Date.UTC(2027, 2, 26)) {
    errors.push({ type: 'PREMATURE_EVENT', file: filename, message: 'Reports a go-live / hypercare outcome before the scheduled go/no-go (2027-03-26)' });
  }

  // 4. Check for unevidenced "100%" or "All pass" declarations without artifact link
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('100%') || line.includes('PASSED') || line.includes('APPROVED')) {
      // Must contain a link or path reference if asserting a metric in a list item or table row
      if (line.trim().startsWith('|') || line.trim().startsWith('-') || line.trim().startsWith('*')) {
        const hasEvidence = line.includes('`') || line.includes('(') || line.includes('tooling/') || line.includes('.mjs') || line.includes('docs/');
        if (!hasEvidence) {
          warnings.push({
            type: 'UNGROUNDED_CLAIM',
            file: filename,
            line: idx + 1,
            text: line.trim(),
            message: `Claim or metric declared without evidential path or artifact reference`
          });
        }
      }
    }
  });

  return { errors, warnings };
}

export function runReportLint(targetDir = reportsDir, referenceDateStr = null) {
  console.log(`[report-lint] Scanning active reports in ${targetDir}...`);
  // docs/evidence holds the same kind of claims and is linted too (withdrawn/ subfolders are skipped)
  const evidenceDir = resolve(repoRoot, 'docs', 'evidence');
  let files = readdirSync(targetDir);
  if (targetDir === reportsDir) { try { files = files.concat(readdirSync(evidenceDir).map((f) => join('..', 'evidence', f))); } catch { /* no evidence dir */ } }
  const allErrors = [];
  const allWarnings = [];

  for (const f of files) {
    const fullPath = join(targetDir, f);
    const stat = statSync(fullPath);
    // Skip withdrawn directory (historical voided documents)
    if (stat.isDirectory()) continue;
    if (!f.endsWith('.md')) continue;

    const content = readFileSync(fullPath, 'utf8');
    const { errors, warnings } = lintReportContent(content, f, referenceDateStr);
    allErrors.push(...errors);
    allWarnings.push(...warnings);
  }

  return { errors: allErrors, warnings: allWarnings };
}

// CLI Execution & Self-Test Mode
if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  const isTestPlanted = process.argv.includes('--test-planted');

  if (isTestPlanted) {
    console.log('[report-lint] Running mutation negative-test with planted future date...');
    const plantedContent = `# Test Report\nDate: 2029-05-12\nAuthor: [Name]\nResult: 100% PASSED`;
    const res = lintReportContent(plantedContent, 'planted_mock.md', '2026-10-17');
    if (res.errors.some((e) => e.type === 'FUTURE_DATE') && res.errors.some((e) => e.type === 'PLACEHOLDER')) {
      console.log('MUTATION TEST PASSED: report-lint successfully failed on planted future date and placeholder name.');
      process.exit(0);
    } else {
      console.error('MUTATION TEST FAILED: report-lint did not catch planted defect.');
      process.exit(1);
    }
  }

  const { errors, warnings } = runReportLint();

  if (warnings.length > 0) {
    console.log(`[report-lint] ${warnings.length} warning(s):`);
    warnings.forEach((w) => console.warn(`  - [WARN] ${w.file}:${w.line}: ${w.message}`));
  }

  // warnings fail too: an ungrounded claim is not evidence (zero-trust audit 2026-10-28)
  if (errors.length > 0 || warnings.length > 0) {
    console.error(`[report-lint] FAILED with ${errors.length} error(s), ${warnings.length} warning(s):`);
    errors.forEach((e) => console.error(`  - [FAIL] ${e.file}: ${e.message}`));
    process.exit(1);
  }

  console.log('[report-lint] PASS EVID-01: All active reports adhere to evidence standards (zero future dates, zero placeholders).');
  process.exit(0);
}
