// Visual diff viewer (Phase 2 §2.3) — line-level LCS diff between the current
// draft and a prior snapshot (published revision), rendered as additions in
// green / deletions in red. Used by the editorial review flow so an editor can
// see exactly what changed before approving.
import React, { useMemo } from 'react';

export type DiffRow = { kind: 'same' | 'add' | 'del'; text: string };

/** Classic LCS table diff over lines — inputs are small (documents), O(n·m) is fine. */
export function diffLines(a: string, b: string): DiffRow[] {
  const A = a.split('\n');
  const B = b.split('\n');
  const n = A.length, m = B.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const out: DiffRow[] = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (A[i] === B[j]) { out.push({ kind: 'same', text: A[i] }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push({ kind: 'del', text: A[i] }); i++; }
    else { out.push({ kind: 'add', text: B[j] }); j++; }
  }
  while (i < n) { out.push({ kind: 'del', text: A[i] }); i++; }
  while (j < m) { out.push({ kind: 'add', text: B[j] }); j++; }
  return out;
}

export function diffStats(rows: DiffRow[]): { added: number; removed: number } {
  return rows.reduce((s, r) => (r.kind === 'add' ? { ...s, added: s.added + 1 } : r.kind === 'del' ? { ...s, removed: s.removed + 1 } : s), { added: 0, removed: 0 });
}

export function DiffView({ oldText, newText, labelOld = 'Published', labelNew = 'Draft', context = 3 }: {
  oldText: string; newText: string; labelOld?: string; labelNew?: string; context?: number;
}) {
  const rows = useMemo(() => diffLines(oldText ?? '', newText ?? ''), [oldText, newText]);
  const stats = useMemo(() => diffStats(rows), [rows]);
  // collapse runs of unchanged lines longer than 2*context+2 into fold markers
  const keep = useMemo(() => {
    const flag = rows.map(() => false);
    rows.forEach((r, i) => {
      if (r.kind === 'same') return;
      for (let k = Math.max(0, i - context); k <= Math.min(rows.length - 1, i + context); k++) flag[k] = true;
    });
    return flag;
  }, [rows, context]);

  const out: Array<DiffRow | { kind: 'fold'; text: string }> = [];
  let folded = 0;
  rows.forEach((r, i) => {
    if (keep[i]) {
      if (folded > 0) { out.push({ kind: 'fold', text: `⋯ ${folded} unchanged line${folded === 1 ? '' : 's'}` }); folded = 0; }
      out.push(r);
    } else folded++;
  });
  if (folded > 0) out.push({ kind: 'fold', text: `⋯ ${folded} unchanged line${folded === 1 ? '' : 's'}` });

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6, fontSize: 12.5 }}>
        <span style={{ color: '#66748A' }}><b style={{ color: '#1F2A37' }}>{labelNew}</b> vs <b>{labelOld}</b></span>
        <span style={{ background: '#E7F6EE', color: '#1F9D62', fontWeight: 800, borderRadius: 999, padding: '1px 9px' }}>+{stats.added}</span>
        <span style={{ background: '#FCECEB', color: '#C2453C', fontWeight: 800, borderRadius: 999, padding: '1px 9px' }}>−{stats.removed}</span>
      </div>
      <div style={{ border: '1px solid #E6EBF1', borderRadius: 8, background: '#fff', fontFamily: 'ui-monospace, monospace', fontSize: 12.5, overflow: 'hidden' }}>
        {out.map((r, i) => r.kind === 'fold'
          ? <div key={i} style={{ padding: '3px 10px', background: '#F8FAFB', color: '#93A0B4' }}>{r.text}</div>
          : (
            <div key={i} style={{
              padding: '3px 10px', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              background: r.kind === 'add' ? '#E7F6EE' : r.kind === 'del' ? '#FCECEB' : undefined,
              color: r.kind === 'add' ? '#14532D' : r.kind === 'del' ? '#7C2D12' : '#475467',
            }}>
              <span style={{ display: 'inline-block', width: 16, fontWeight: 800, opacity: 0.7 }}>{r.kind === 'add' ? '+' : r.kind === 'del' ? '−' : ' '}</span>{r.text || ' '}
            </div>
          ))}
      </div>
    </div>
  );
}
