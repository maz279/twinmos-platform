// SN-check & serials — the anti-counterfeit registry console (P5.3 APIs + 0021).
// The public site verifies product authenticity against this registry
// (POST /api/v1/sn-check); this module manages it:
//   • Analytics — registry size, 24h/7d verification volume, valid rate, top SKUs/countries
//   • Quick verify — instant single-serial verdict without leaving the console
//   • Registry — search (serial/SKU), batch filter, pagination, CSV export,
//     and a per-serial drill-down: registry data, 24h distinct-source activity,
//     verdict, full verification log, delete
//   • Import — batch CSV upsert with a mandatory dry-run row report
//   • Anomalies — the >5-distinct-IPs/countries-in-24h counterfeit scan,
//     with on-demand ops alert email (SERIAL_ALERT_TO / FORMS_TO)
import React, { useRef, useState } from 'react';
import { apiGet, apiSend, fmtDate } from '../api';
import { Badge, btn, btnGhost, Empty, Err, input, PageHeader, SectionCard, Table, td, Toolbar, useAsync, usePanelScroll, FAINT, INK, LINE, MUTED, PAGE, TEAL } from '../ui';
import { Heatmap } from '../charts';

type Serial = {
  serial: string; sku: string | null; batch: string | null;
  manufacturedAt: string | null; verifiedCount: number;
};
type ImportReport = {
  dryRun: boolean; validCount?: number; imported?: number;
  errors?: Array<{ line: number; message: string }>;
};
type Anomalies = {
  windowHours: number; threshold: number; notified: boolean;
  flagged: Array<{ serial: string; checks: number; distinctIps: number; distinctCountries: number; lastSeen: string; verdict: string }>;
};
type DrillDown = {
  serial: string;
  registry: Serial | null;
  last24h: { checks: number; distinctIps: number; distinctCountries: number };
  verdict: 'verified' | 'unknown' | 'suspicious';
  history: Array<{ result: string; ip: string | null; country: string | null; ua: string | null; checkedAt: string }>;
};
type Analytics = {
  registry: number; checks24h: number; checks7d: number; validRate7d: number;
  topSkus: Array<{ sku: string; n: number }>;
  countries: Array<{ country: string; n: number }>;
};

const CSV_TEMPLATE = 'serial,sku,manufacturedAt,batch\nTMS-2026-000001,VLT-DDR5-16G,2026-08-14,B2632';
const PAGE_SIZE = 100;

const VERDICT: Record<string, { label: string; color: string; bg: string; hint: string }> = {
  verified: { label: '✓ Verified', color: '#0F6B54', bg: '#E4F8F2', hint: 'Registry hit with normal verification activity.' },
  unknown: { label: '⚠ Not in registry', color: '#8A5A00', bg: '#FBF3E2', hint: 'No factory record — this serial has never been registered.' },
  suspicious: { label: '✗ Suspicious', color: '#C2453C', bg: '#FDECEA', hint: 'Verified from many distinct sources in 24h — leaked or counterfeit serial pattern.' },
};

export default function Serials({ canWrite }: { canWrite: boolean }) {
  const [tab, setTab] = useState<'registry' | 'import' | 'anomalies'>('registry');

  return (
    <div>
      <PageHeader
        title="SN-check & serials"
        subtitle="Anti-counterfeit registry behind the public authenticity check — factory serials in, customer verifications watched, counterfeit patterns flagged."
        style={{ marginBottom: 12 }}
      />
      <AnalyticsStrip />
      <Toolbar style={{ margin: '12px 0' }}>
        {(['registry', 'import', 'anomalies'] as const).map((t) => (
          <button key={t} style={tab === t ? btn : btnGhost} onClick={() => setTab(t)}>
            {t === 'registry' ? 'Registry' : t === 'import' ? 'CSV import' : 'Anomaly scan'}
          </button>
        ))}
      </Toolbar>

      {tab === 'registry' && <Registry canWrite={canWrite} />}
      {tab === 'import' && <ImportTab canWrite={canWrite} />}
      {tab === 'anomalies' && <AnomalyTab canWrite={canWrite} />}
    </div>
  );
}

// ---- analytics strip ----------------------------------------------------------

function AnalyticsStrip() {
  const { data, error, loading } = useAsync<Analytics>(() => apiGet('/admin/serials/analytics'), []);
  if (loading) return null;
  if (error || !data) return null;
  const kpi = (label: string, value: string, sub: string) => (
    <div style={{ border: `1px solid ${LINE}`, borderRadius: 10, background: '#fff', padding: '10px 14px' }}>
      <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.9, textTransform: 'uppercase', color: FAINT }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: INK, marginTop: 2 }}>{value}</div>
      <div style={{ fontSize: 11.5, color: MUTED }}>{sub}</div>
    </div>
  );
  return (
    <details style={{ border: `1px solid ${LINE}`, borderRadius: 12, background: '#fff', padding: '10px 16px', marginTop: 12 }}>
      <summary style={{ cursor: 'pointer', fontSize: 13, fontWeight: 800, color: INK, userSelect: 'none' }}>
        Registry analytics — <span style={{ color: MUTED, fontWeight: 400 }}>
          {data.registry} serials · {data.checks24h} checks 24h · {data.checks7d} checks 7d · {data.validRate7d}% valid
        </span>
      </summary>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 10, marginTop: 12 }}>
        {kpi('Registry size', String(data.registry), 'factory serials registered')}
        {kpi('Checks · 24h', String(data.checks24h), 'public verifications')}
        {kpi('Checks · 7d', String(data.checks7d), 'rolling week')}
        {kpi('Valid rate · 7d', data.validRate7d + '%', 'registry hits / all checks')}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16, marginTop: 14 }}>
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.9, textTransform: 'uppercase', color: FAINT, marginBottom: 6 }}>Top SKUs by verification · 7d</div>
          {data.topSkus.length === 0 && <span style={{ fontSize: 12.5, color: FAINT }}>no checks yet</span>}
          {data.topSkus.map((x) => (
            <div key={x.sku} style={{ display: 'grid', gridTemplateColumns: '130px 1fr 34px', alignItems: 'center', gap: 8, padding: '3px 0' }}>
              <span style={{ fontSize: 12, color: MUTED, fontFamily: 'ui-monospace, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{x.sku}</span>
              <span style={{ background: '#F1F4F8', borderRadius: 999, height: 8, overflow: 'hidden' }}>
                <span style={{ display: 'block', width: `${(x.n / Math.max(1, data.topSkus[0].n)) * 100}%`, height: '100%', background: TEAL, borderRadius: 999 }} />
              </span>
              <b style={{ fontSize: 12.5, color: INK, textAlign: 'right' }}>{x.n}</b>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.9, textTransform: 'uppercase', color: FAINT, marginBottom: 6 }}>Verification by country · 7d</div>
          {data.countries.length === 0 && <span style={{ fontSize: 12.5, color: FAINT }}>no geo data (needs CF-IPCountry)</span>}
          {data.countries.map((x) => (
            <div key={x.country} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 34px', alignItems: 'center', gap: 8, padding: '3px 0' }}>
              <span style={{ fontSize: 12, color: MUTED }}>{x.country}</span>
              <span style={{ background: '#F1F4F8', borderRadius: 999, height: 8, overflow: 'hidden' }}>
                <span style={{ display: 'block', width: `${(x.n / Math.max(1, data.countries[0].n)) * 100}%`, height: '100%', background: '#7C5CDB', borderRadius: 999 }} />
              </span>
              <b style={{ fontSize: 12.5, color: INK, textAlign: 'right' }}>{x.n}</b>
            </div>
          ))}
        </div>
      </div>
    </details>
  );
}

// ---- registry tab ----------------------------------------------------------

function Registry({ canWrite }: { canWrite: boolean }) {
  const [qInput, setQInput] = useState('');
  const [q, setQ] = useState('');
  const [batch, setBatch] = useState('');
  const [page, setPage] = useState(0);
  const [drill, setDrill] = useState<string | null>(null);

  const qs = new URLSearchParams();
  if (q) qs.set('q', q);
  if (batch.trim()) qs.set('batch', batch.trim());
  qs.set('limit', String(PAGE_SIZE));
  qs.set('offset', String(page * PAGE_SIZE));
  const { data, error, loading, reload } = useAsync<{ items: Serial[]; total: number }>(
    () => apiGet('/admin/serials?' + qs.toString()), [q, batch, page]);

  const total = data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const csvQs = new URLSearchParams();
  if (q) csvQs.set('q', q);
  if (batch.trim()) csvQs.set('batch', batch.trim());

  return (
    <div>
      <QuickVerify onVerified={() => reload()} onDrill={(s) => setDrill(s)} />
      <SectionCard title={`Registry (${total}${total > 5000 ? '+' : ''})`}>
        <Toolbar style={{ margin: '0 0 10px' }}>
          <input style={{ ...input, width: 260 }} placeholder="Search serial or SKU (e.g. TMS-2026, VLT-DDR5)…"
            value={qInput} onChange={(e) => setQInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { setQ(qInput.trim()); setPage(0); setDrill(null); } }} />
          <input style={{ ...input, width: 140 }} placeholder="Batch (e.g. B2632)…"
            value={batch} onChange={(e) => { setBatch(e.target.value); setPage(0); }} />
          <button style={btn} onClick={() => { setQ(qInput.trim()); setPage(0); setDrill(null); }}>Search</button>
          {(q || batch) && <button style={btnGhost} onClick={() => { setQ(''); setQInput(''); setBatch(''); setPage(0); }}>Clear</button>}
          <span style={{ flex: 1 }} />
          <a style={{ ...btnGhost, textDecoration: 'none', display: 'inline-block' }}
            href={(import.meta.env.VITE_API_URL ?? '/api/v1') + '/admin/serials/export.csv?' + csvQs.toString()}
            target="_blank" rel="noopener">Export CSV</a>
        </Toolbar>
        {error ? <Err error={error} /> : loading ? <p>Loading…</p> : (data?.items ?? []).length === 0 ? (
          <Empty text="No serials match — import a factory batch from the CSV import tab." />
        ) : (
          <Table head={['Serial', 'SKU', 'Batch', 'Manufactured', 'Verifications', '']}>
            {(data?.items ?? []).map((s) => (
              <tr key={s.serial} onClick={() => setDrill(s.serial)} style={{ cursor: 'pointer', background: drill === s.serial ? '#F0F9FF' : undefined }}>
                <td style={td}><b style={{ color: INK }}>{s.serial}</b></td>
                <td style={td}>{s.sku ?? <span style={{ color: '#93A0B4' }}>—</span>}</td>
                <td style={td}>{s.batch ? <Badge value={s.batch} /> : <span style={{ color: '#93A0B4' }}>—</span>}</td>
                <td style={{ ...td, color: MUTED }}>{s.manufacturedAt ? fmtDate(s.manufacturedAt) : '—'}</td>
                <td style={td}>{s.verifiedCount > 0 ? <b>{s.verifiedCount}</b> : <span style={{ color: '#93A0B4' }}>0</span>}</td>
                <td style={td}>{canWrite && (
                  <button style={{ ...btnGhost, padding: '3px 8px', fontSize: 12 }} title="Delete from registry"
                    onClick={(e) => { e.stopPropagation(); if (window.confirm(`Delete ${s.serial} from the registry? Verification history is kept; the serial stops verifying.`)) { void apiSend('DELETE', '/admin/serials/' + encodeURIComponent(s.serial)).then(reload).catch(() => {}); } }}>✕</button>
                )}</td>
              </tr>
            ))}
          </Table>
        )}
        {total > PAGE_SIZE && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, fontSize: 12.5, color: MUTED }}>
            <button style={{ ...btnGhost, padding: '4px 10px' }} disabled={page === 0} onClick={() => setPage((p) => p - 1)}>← Prev</button>
            <span>Page {page + 1} of {pages} · {total} serials</span>
            <button style={{ ...btnGhost, padding: '4px 10px' }} disabled={page + 1 >= pages} onClick={() => setPage((p) => p + 1)}>Next →</button>
          </div>
        )}
      </SectionCard>
      {drill && <DrillDown serial={drill} canWrite={canWrite} onDeleted={() => { setDrill(null); reload(); }} onClose={() => setDrill(null)} />}
    </div>
  );
}

/** Quick verify — the same lookup the public site runs, without leaving the console. */
function QuickVerify({ onVerified, onDrill }: { onVerified: () => void; onDrill: (s: string) => void }) {
  const [serialInput, setSerialInput] = useState('');
  const [serial, setSerial] = useState('');
  const [result, setResult] = useState<{ result: string; sku?: string; advice: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function check() {
    const s = serialInput.trim().toUpperCase();
    if (!s) return;
    setBusy(true); setErr(null); setResult(null);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL ?? '/api/v1') + '/sn-check', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ serial: s }),
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      setResult(await res.json());
      setSerial(s);
      onVerified();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Check failed.');
    } finally { setBusy(false); }
  }

  const v = result ? VERDICT[result.result === 'valid' ? 'verified' : 'unknown'] : null;
  return (
    <SectionCard title="Quick verify" style={{ marginBottom: 12 }}>
      {err && <p role="alert" style={{ color: '#C2453C', background: '#FDECEA', borderRadius: 8, padding: '6px 10px' }}>{err}</p>}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <input style={{ ...input, width: 280, fontFamily: 'ui-monospace, monospace' }} placeholder="Paste a serial (e.g. TMS-2026-000001)…"
          value={serialInput} onChange={(e) => setSerialInput(e.target.value.toUpperCase())}
          onKeyDown={(e) => { if (e.key === 'Enter') check(); }} />
        <button style={btn} disabled={busy || !serialInput.trim()} onClick={check}>{busy ? 'Checking…' : 'Verify'}</button>
        <span style={{ fontSize: 11.5, color: FAINT }}>Runs the real public check (logged + counted) — same verdict a customer sees.</span>
      </div>
      {result && v && (
        <div style={{ marginTop: 10, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', border: `1px solid ${v.color}33`, background: v.bg, borderRadius: 10, padding: '10px 14px' }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: v.color }}>{v.label}</span>
          {result.sku && <span style={{ fontSize: 12.5, color: MUTED, fontFamily: 'ui-monospace, monospace' }}>{result.sku}</span>}
          <span style={{ flex: 1, minWidth: 200, fontSize: 12.5, color: MUTED }}>{result.advice}</span>
          <button style={{ ...btnGhost, padding: '4px 10px', fontSize: 12 }} onClick={() => onDrill(serial)}>Drill down →</button>
        </div>
      )}
    </SectionCard>
  );
}

/** Per-serial drill-down — registry row + 24h activity + verdict + verification log. */
function DrillDown({ serial, canWrite, onDeleted, onClose }: { serial: string; canWrite: boolean; onDeleted: () => void; onClose: () => void }) {
  const panelRef = usePanelScroll<HTMLDivElement>();
  const { data, error, loading, reload } = useAsync<DrillDown>(() => apiGet('/admin/serials/' + encodeURIComponent(serial)), [serial]);
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!window.confirm(`Delete ${serial} from the registry?`)) return;
    setBusy(true);
    try { await apiSend('DELETE', '/admin/serials/' + encodeURIComponent(serial)); onDeleted(); }
    catch { /* detail reload surfaces errors */ setBusy(false); }
  }

  return (
    <div ref={panelRef} style={{ marginTop: 12, border: `1px solid ${LINE}`, borderRadius: 12, background: PAGE, padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <b style={{ fontSize: 15, color: INK, fontFamily: 'ui-monospace, monospace' }}>{serial}</b>
        {data && <span style={{ fontSize: 12.5, fontWeight: 800, color: VERDICT[data.verdict].color, background: VERDICT[data.verdict].bg, border: `1px solid ${VERDICT[data.verdict].color}33`, borderRadius: 8, padding: '3px 10px' }}>{VERDICT[data.verdict].label}</span>}
        <span style={{ flex: 1 }} />
        <button style={{ ...btnGhost, padding: '4px 10px' }} onClick={reload}>Re-check</button>
        {canWrite && data?.registry && <button style={{ ...btnGhost, padding: '4px 10px' }} disabled={busy} onClick={remove}>Delete from registry</button>}
        <button style={{ ...btnGhost, padding: '4px 10px' }} onClick={onClose}>Close</button>
      </div>
      {error ? <div style={{ marginTop: 10 }}><Err error={error} /></div> : loading ? <p style={{ marginTop: 10 }}>Loading…</p> : data ? (
        <>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '10px 0' }}>
            <span style={{ fontSize: 12, color: MUTED, background: '#fff', border: `1px solid ${LINE}`, borderRadius: 8, padding: '4px 10px' }}>
              SKU <b style={{ color: INK }}>{data.registry?.sku ?? '—'}</b>
            </span>
            <span style={{ fontSize: 12, color: MUTED, background: '#fff', border: `1px solid ${LINE}`, borderRadius: 8, padding: '4px 10px' }}>
              Batch <b style={{ color: INK }}>{data.registry?.batch ?? '—'}</b>
            </span>
            <span style={{ fontSize: 12, color: MUTED, background: '#fff', border: `1px solid ${LINE}`, borderRadius: 8, padding: '4px 10px' }}>
              Manufactured <b style={{ color: INK }}>{data.registry?.manufacturedAt ? fmtDate(data.registry.manufacturedAt) : '—'}</b>
            </span>
            <span style={{ fontSize: 12, color: MUTED, background: '#fff', border: `1px solid ${LINE}`, borderRadius: 8, padding: '4px 10px' }}>
              Lifetime checks <b style={{ color: INK }}>{data.registry?.verifiedCount ?? 0}</b>
            </span>
          </div>
          <div style={{ fontSize: 12.5, color: MUTED, margin: '6px 0' }}>
            Last 24h: <b style={{ color: INK }}>{data.last24h.checks}</b> check(s) from <b style={{ color: data.last24h.distinctIps > 5 || data.last24h.distinctCountries > 5 ? '#C2453C' : INK }}>{data.last24h.distinctIps} IPs</b> / <b style={{ color: data.last24h.distinctIps > 5 || data.last24h.distinctCountries > 5 ? '#C2453C' : INK }}>{data.last24h.distinctCountries} countries</b> — {VERDICT[data.verdict].hint}
          </div>
          <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.9, textTransform: 'uppercase', color: FAINT, margin: '12px 0 6px' }}>Verification log — last {data.history.length}</div>
          {data.history.length === 0 ? <Empty text="No verification activity recorded." /> : (
            <Table head={['Result', 'IP', 'Country', 'User agent', 'When']}>
              {data.history.map((h, i) => (
                <tr key={i}>
                  <td style={td}><Badge value={h.result} /></td>
                  <td style={{ ...td, fontFamily: 'ui-monospace, monospace', fontSize: 12 }}>{h.ip ?? '—'}</td>
                  <td style={td}>{h.country ?? '—'}</td>
                  <td style={{ ...td, fontSize: 11.5, color: MUTED, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.ua ?? '—'}</td>
                  <td style={td}>{fmtDate(h.checkedAt)}</td>
                </tr>
              ))}
            </Table>
          )}
        </>
      ) : null}
    </div>
  );
}

// ---- import tab ----------------------------------------------------------------

function ImportTab({ canWrite }: { canWrite: boolean }) {
  const [csv, setCsv] = useState('');
  const [report, setReport] = useState<ImportReport | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function loadFile() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setCsv(String(reader.result ?? '')); setReport(null); };
    reader.readAsText(file);
  }

  async function run(dryRun: boolean) {
    setErr(null); setBusy(true);
    try {
      const res = await apiSend<ImportReport>('POST', '/admin/serials/import', { csv, dryRun });
      setReport(res);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Import failed.');
    } finally { setBusy(false); }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px,1fr) minmax(280px,1fr)', gap: 12, alignItems: 'start' }}>
      <SectionCard title="Batch CSV import">
        {err && <p role="alert" style={{ color: '#C2453C', background: '#FDECEA', borderRadius: 8, padding: '6px 10px' }}>{err}</p>}
        <p style={{ color: MUTED, fontSize: 12.5, marginTop: 0 }}>
          Header must be exactly <code>serial,sku,manufacturedAt,batch</code>. Rows upsert by serial
          (existing serials are updated). Dates are ISO (e.g. 2026-08-14); batch is the factory batch tag.
        </p>
        <input ref={fileRef} type="file" accept=".csv,text/csv" style={input} onChange={loadFile} />
        <textarea style={{ ...input, width: '100%', minHeight: 140, fontFamily: 'ui-monospace, monospace', fontSize: 12.5, marginTop: 8 }}
          placeholder={CSV_TEMPLATE} value={csv} onChange={(e) => { setCsv(e.target.value); setReport(null); }} />
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          <button style={btnGhost} onClick={() => setCsv(CSV_TEMPLATE)}>Insert sample</button>
          {canWrite ? <>
            <button style={btnGhost} disabled={busy || !csv.trim()} onClick={() => run(true)}>Validate (dry run)</button>
            <button style={btn} disabled={busy || !csv.trim()} onClick={() => run(false)} title="Validates first; any row error aborts with no changes">
              {busy ? 'Working…' : 'Import batch'}
            </button>
          </> : <span style={{ color: '#93A0B4', fontSize: 12.5, alignSelf: 'center' }}>Read-only — editor role required.</span>}
        </div>
      </SectionCard>

      <SectionCard title="Row report">
        {!report ? <Empty text="Validate first — every row is checked before anything is written." /> : (
          <>
            {report.dryRun ? (
              <p><b>{report.validCount ?? 0}</b> row(s) would be imported. {report.errors?.length ? 'Fix the errors below and re-validate.' : 'No row errors — safe to import.'}</p>
            ) : (
              <p><b>{report.imported ?? 0}</b> row(s) imported and audited.</p>
            )}
            {!!report.errors?.length && (
              <div style={{ color: '#C2453C', background: '#FDECEA', borderRadius: 8, padding: '8px 10px', fontSize: 12.5, maxHeight: 240, overflow: 'auto' }}>
                {report.errors.map((e) => <div key={e.line}>Line {e.line}: {e.message}</div>)}
              </div>
            )}
          </>
        )}
      </SectionCard>
    </div>
  );
}

// ---- anomaly tab -----------------------------------------------------------------

function AnomalyTab({ canWrite }: { canWrite: boolean }) {
  const [threshold, setThreshold] = useState('5');
  const [result, setResult] = useState<Anomalies | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [notified, setNotified] = useState(false);

  async function scan(notify: boolean) {
    setErr(null); setBusy(true);
    try {
      const t = Math.max(2, Math.min(100, Number(threshold) || 5));
      const res = await apiGet<Anomalies>(`/admin/serials/anomalies?threshold=${t}` + (notify ? '&notify=true' : ''));
      setResult(res);
      if (notify) setNotified(res.notified);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Scan failed.');
    } finally { setBusy(false); }
  }

  const flagged = result?.flagged ?? [];

  return (
    <SectionCard title="Counterfeit anomaly scan — rolling 24h window">
      {err && <p role="alert" style={{ color: '#C2453C', background: '#FDECEA', borderRadius: 8, padding: '6px 10px' }}>{err}</p>}
      <p style={{ color: MUTED, fontSize: 12.5, marginTop: 0 }}>
        Flags serials verified from more than <b>N</b> distinct IP addresses <i>or</i> country codes in the last
        24 hours — the distribution pattern of leaked/counterfeited serials. The public SN-check feeds this log;
        scan results are advisory, the alert email goes to ops (SERIAL_ALERT_TO / FORMS_TO).
      </p>
      <Toolbar style={{ margin: '0 0 10px' }}>
        <label style={{ fontSize: 12.5, color: MUTED }}>Distinct-source threshold</label>
        <input style={{ ...input, width: 70 }} inputMode="numeric" value={threshold} onChange={(e) => setThreshold(e.target.value)} />
        <button style={btn} disabled={busy} onClick={() => scan(false)}>{busy ? 'Scanning…' : 'Run scan'}</button>
        {canWrite && result != null && flagged.length > 0 && (
          <button style={btnGhost} disabled={busy || notified} onClick={() => scan(true)}>
            {notified ? 'Ops alerted ✓' : 'Email alert to ops'}
          </button>
        )}
      </Toolbar>
      {!result ? <Empty text="Run the scan to check the last 24 hours of public verifications." /> : flagged.length === 0 ? (
        <Empty text="No anomalies in the window — nothing exceeds the threshold. 🎉" />
      ) : (
        <Table head={['Serial', 'Checks', 'Distinct IPs', 'Countries', 'Last seen', 'Verdict']}>
          {flagged.map((f) => (
            <tr key={f.serial}>
              <td style={td}><b style={{ color: INK }}>{f.serial}</b></td>
              <td style={td}>{f.checks}</td>
              <td style={td}><b>{f.distinctIps}</b></td>
              <td style={td}><b>{f.distinctCountries}</b></td>
              <td style={{ ...td, color: MUTED }}>{fmtDate(f.lastSeen)}</td>
              <td style={td}><Badge value="suspicious" /></td>
            </tr>
          ))}
        </Table>
      )}
    </SectionCard>
  );
}
