// Tiny shared UI atoms (P0 inline-style system: navy #0A2540 / cyan #00A3E0).
import React from 'react';

export const card: React.CSSProperties = { border: '1px solid #E2E8F0', borderRadius: 10, padding: 16, background: '#fff' };
export const btn: React.CSSProperties = { padding: '7px 14px', border: 0, borderRadius: 6, background: '#00A3E0', color: '#0A2540', fontWeight: 700, cursor: 'pointer' };
export const btnGhost: React.CSSProperties = { ...btn, background: '#EEF4FA', color: '#0A2540' };
export const input: React.CSSProperties = { padding: '7px 10px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: 13 };

export function Kpi({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 4 }}>
      <b style={{ fontSize: 26 }}>{value}</b>
      <span>{label}</span>
      {hint && <span style={{ fontSize: 12, color: '#5E7691' }}>{hint}</span>}
    </div>
  );
}

const TONES: Record<string, string> = {
  new: '#00A3E0', submitted: '#00A3E0', under_review: '#7C3AED', approved: '#0E9F6E',
  in_repair: '#B7791F', shipped: '#1D4ED8', delivered: '#047857', closed: '#64748B',
  assigned: '#7C3AED', resolved: '#047857', spam: '#DC2626', draft: '#64748B',
  in_review: '#B7791F', scheduled: '#1D4ED8', published: '#047857', archived: '#94A3B8',
};
export function Badge({ value }: { value: string }) {
  const tone = TONES[value] ?? '#64748B';
  return <span style={{ background: tone + '1A', color: tone, border: `1px solid ${tone}55`, borderRadius: 99, padding: '2px 10px', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>{value.replace(/_/g, ' ')}</span>;
}

export function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
        <thead>
          <tr>{head.map((h) => <th key={h} style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '2px solid #E2E8F0', color: '#334155', whiteSpace: 'nowrap' }}>{h}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
export const td: React.CSSProperties = { padding: '8px 10px', borderBottom: '1px solid #EEF2F6', verticalAlign: 'top' };

export function Empty({ text }: { text: string }) {
  return <p style={{ color: '#5E7691', padding: 18, textAlign: 'center' }}>{text}</p>;
}
export function Err({ error }: { error: unknown }) {
  const e = error as { message?: string; detail?: string; status?: number };
  return <p role="alert" style={{ background: '#FEE2E2', color: '#991B1B', borderRadius: 8, padding: 10 }}>{e?.status ? `HTTP ${e.status}: ` : ''}{e?.message ?? String(error)}{e?.detail ? ` — ${e.detail}` : ''}</p>;
}
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]): { data: T | null; error: unknown; loading: boolean; reload: () => void } {
  const [data, setData] = React.useState<T | null>(null);
  const [error, setError] = React.useState<unknown>(null);
  const [loading, setLoading] = React.useState(true);
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    fn().then((d) => { if (alive) { setData(d); setError(null); } })
      .catch((e) => { if (alive) setError(e); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);
  return { data, error, loading, reload: () => setTick((t) => t + 1) };
}
