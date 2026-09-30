// Phase 5.1 Translation Studio — split-view editor: EN source on the left,
// target locale on the right (RTL rendering for Arabic), per-locale progress
// matrix, search + missing-only filter, and XLIFF 1.2 round-trip for
// external CAT vendors alongside the JSON workflow. RBAC handled server-side:
// editor+ for content namespaces, super_admin for the 'common' framework ns.
import React, { useMemo, useState } from 'react';
import { apiGet, apiSend, fmtDate } from '../api';
import { btn, btnGhost, Empty, Err, input, useAsync } from '../ui';
import { LOCALES, localeDir } from '@twinmos/shared';

type Row = { id: number; locale: string; ns: string; key: string; value: string; updatedAt: string };
type Progress = {
  enKeys: number;
  perLocale: Record<string, { strings: number; coverage: number }>;
  namespaces: string[];
  perNs: Record<string, Record<string, number>>;
};

export default function Translations({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const [locale, setLocale] = useState('ar');
  const [nsFilter, setNsFilter] = useState('');
  const [q, setQ] = useState('');
  const [missingOnly, setMissingOnly] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [notice, setNotice] = useState('');
  const [editing, setEditing] = useState<string | null>(null); // key being edited
  const [editValue, setEditValue] = useState('');
  const [xliffIn, setXliffIn] = useState('');

  const progress = useAsync<Progress>(() => apiGet('/admin/translations/progress'), []);
  const en = useAsync<{ items: Row[] }>(() => apiGet(`/admin/translations?locale=en`), []);
  const target = useAsync<{ items: Row[] }>(() => apiGet(`/admin/translations?locale=${locale}`), [locale]);
  const reloadAll = () => { en.reload(); target.reload(); progress.reload(); };

  const namespaces = useMemo(() => {
    const fromProgress = progress.data?.namespaces ?? [];
    const seen = new Set<string>(['common', ...fromProgress]);
    (en.data?.items ?? []).forEach((r) => seen.add(r.ns));
    return [...seen].sort();
  }, [progress.data, en.data]);

  // pair EN keys with target values within the current ns + search + missing filter
  const pairs = useMemo(() => {
    const ns = nsFilter || undefined;
    const enRows = (en.data?.items ?? []).filter((r) => (!ns || r.ns === ns));
    const byKey = new Map((target.data?.items ?? []).filter((r) => (!ns || r.ns === ns)).map((r) => [r.key, r]));
    const needle = q.trim().toLowerCase();
    return enRows
      .map((src) => ({ ns: src.ns, key: src.key, source: src.value, target: byKey.get(src.key) }))
      .filter((p) => {
        if (missingOnly && p.target) return false;
        if (!needle) return true;
        return p.key.toLowerCase().includes(needle) || p.source.toLowerCase().includes(needle) || (p.target?.value ?? '').toLowerCase().includes(needle);
      });
  }, [en.data, target.data, nsFilter, q, missingOnly]);

  const rtl = localeDir(locale) === 'rtl';
  // §5.1: appropriate Arabic font rendering for RTL editing — Noto Sans Arabic
  // with system fallbacks so intranet/offline deployments still render well.
  const rtlFont: React.CSSProperties = { fontFamily: "'Noto Sans Arabic', 'Segoe UI', Tahoma, sans-serif" };

  async function save(key: string, ns: string) {
    setBusy(true); setError(null); setNotice('');
    try {
      await apiSend('PUT', '/admin/translations', { locale, ns, key, value: editValue });
      setEditing(null); reloadAll();
      setNotice(`Saved ${locale}/${ns}/${key}.`);
    } catch (e) { setError(e); } finally { setBusy(false); }
  }

  async function remove(key: string, ns: string) {
    setBusy(true); setError(null); setNotice('');
    try {
      await apiSend('DELETE', '/admin/translations', { locale, ns, key });
      setEditing(null); reloadAll();
      setNotice(`Deleted ${locale}/${ns}/${key}.`);
    } catch (e) { setError(e); } finally { setBusy(false); }
  }

  async function importJson(text: string) {
    setBusy(true); setError(null); setNotice('');
    try {
      const strings = JSON.parse(text);
      const ns = nsFilter || 'common';
      const res = await apiSend<{ imported: number }>('POST', '/admin/translations/import', { locale, ns, strings });
      setNotice(`Imported ${res.imported} strings into ${locale}/${ns}.`);
      setXliffIn(''); reloadAll();
    } catch (e) {
      setError(e instanceof SyntaxError ? new Error('Import JSON is invalid: ' + e.message) : e);
    } finally { setBusy(false); }
  }

  async function importXliff(text: string) {
    setBusy(true); setError(null); setNotice('');
    try {
      const res = await apiSend<{ imported: number; skippedEmpty: number }>('POST', '/admin/translations/xliff', { locale, ns: nsFilter || 'common', xml: text });
      setNotice(`XLIFF: imported ${res.imported}, skipped ${res.skippedEmpty} empty target(s).`);
      setXliffIn(''); reloadAll();
    } catch (e) { setError(e); } finally { setBusy(false); }
  }

  function downloadXliff() {
    const url = `/admin/translations/xliff?locale=${locale}${nsFilter ? `&ns=${nsFilter}` : ''}`;
    fetch((import.meta.env.VITE_API_URL ?? '/api/v1') + url, { credentials: 'include' })
      .then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.blob(); })
      .then((b) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(b);
        a.download = `twinmos-${locale}-${nsFilter || 'common'}.xliff`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      })
      .catch(() => setError(new Error('XLIFF export failed.')));
  }

  function exportJson() {
    const bundle: Record<string, string> = {};
    pairs.forEach((p) => { if (p.target) bundle[p.key] = p.target.value; });
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `twinmos-${locale}-${nsFilter || 'all'}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const label: React.CSSProperties = { fontSize: 11, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', color: '#93A0B4' };
  const card: React.CSSProperties = { border: '1px solid #E6EBF1', borderRadius: 12, background: '#fff', padding: 12, minWidth: 0 };

  return (
    <div>
      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#1F2A37', letterSpacing: -0.2 }}>Translation Studio</h1>
      <p style={{ margin: '2px 0 12px', color: '#66748A', fontSize: 13 }}>
        EN source on the left, target on the right · 9-locale plan · XLIFF 1.2 round-trip for CAT vendors · every change audited.
        {!isSuperAdmin && ' The common framework namespace is super_admin-only.'}
      </p>

      {/* progress matrix */}
      {progress.data ? (
        <div style={{ ...card, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
            <b style={{ fontSize: 13, color: '#1F2A37' }}>Coverage vs EN ({progress.data.enKeys} keys)</b>
            <span style={{ fontSize: 11.5, color: '#93A0B4' }}>per locale</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 8 }}>
            {LOCALES.map((l) => {
              const p = progress.data!.perLocale[l] ?? { strings: 0, coverage: 0 };
              const active = l === locale;
              return (
                <button key={l} onClick={() => setLocale(l)} title={`${p.strings} strings`}
                  style={{ textAlign: 'left', border: '1px solid ' + (active ? '#1DBF9F' : '#E6EBF1'), borderRadius: 9, background: active ? '#E7F7F2' : '#fff', padding: '7px 9px', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 700, color: '#1F2A37' }}>
                    <span>{l}{localeDir(l) === 'rtl' ? ' ⇄' : ''}</span>
                    <span style={{ color: p.coverage >= 100 ? '#1F9D62' : p.coverage >= 50 ? '#E8A33D' : '#C2453C' }}>{p.coverage}%</span>
                  </div>
                  <div style={{ background: '#F1F4F8', borderRadius: 999, height: 6, marginTop: 5, overflow: 'hidden' }}>
                    <div style={{ width: p.coverage + '%', height: '100%', background: p.coverage >= 100 ? '#1F9D62' : p.coverage >= 50 ? '#E8A33D' : '#C2453C', borderRadius: 999 }} />
                  </div>
                </button>
              );
            })}
          </div>
          {/* §5.1: % translated per namespace for the SELECTED locale */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', color: '#93A0B4' }}>{locale} by namespace</span>
            {progress.data.namespaces.map((ns) => {
              const pct = progress.data!.perNs[ns]?.[locale] ?? 0;
              return (
                <button key={ns} onClick={() => setNsFilter(ns)} title={`${pct}% of EN keys translated`}
                  style={{ border: '1px solid ' + (nsFilter === ns ? '#1DBF9F' : '#E6EBF1'), borderRadius: 999, background: nsFilter === ns ? '#E7F7F2' : '#fff', padding: '3px 10px', fontSize: 11.5, fontWeight: 700, cursor: 'pointer', color: '#475467' }}>
                  {ns} <span style={{ color: pct >= 100 ? '#1F9D62' : pct >= 50 ? '#E8A33D' : '#C2453C' }}>{pct}%</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* toolbar */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
        <select style={input} value={locale} onChange={(e) => setLocale(e.target.value)}>
          {LOCALES.map((l) => <option key={l} value={l}>{l}{localeDir(l) === 'rtl' ? ' (RTL)' : ''}</option>)}
        </select>
        <select style={input} value={nsFilter} onChange={(e) => setNsFilter(e.target.value)}>
          <option value="">All namespaces</option>
          {namespaces.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        <input style={{ ...input, width: 220 }} placeholder="Search key or text…" value={q} onChange={(e) => setQ(e.target.value)} />
        <button style={{ ...btnGhost, fontWeight: missingOnly ? 800 : 400, borderColor: missingOnly ? '#1DBF9F' : undefined, color: missingOnly ? '#0E9F7E' : undefined }} onClick={() => setMissingOnly((v) => !v)}>
          {missingOnly ? `Missing only (${pairs.length})` : 'Show missing only'}
        </button>
        <span style={{ flex: 1 }} />
        <button style={btnGhost} onClick={downloadXliff}>⬇ XLIFF</button>
        <button style={btnGhost} onClick={exportJson}>⬇ JSON</button>
      </div>

      {error ? <Err error={error} /> : null}
      {notice ? <p style={{ color: '#0E9F7E', fontWeight: 700, fontSize: 13 }}>{notice}</p> : null}

      {/* import drawer — JSON or XLIFF paste */}
      <details style={{ ...card, marginBottom: 12 }}>
        <summary style={{ cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#1F2A37' }}>Import — paste JSON or XLIFF 1.2</summary>
        <textarea style={{ ...input, width: '100%', minHeight: 110, marginTop: 8, fontFamily: 'ui-monospace, monospace', fontSize: 12 }}
          placeholder={'{"cta.buy": "اشترِ الآن"}  — or paste XLIFF exported from Crowdin/Trados'}
          value={xliffIn} onChange={(e) => setXliffIn(e.target.value)} />
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button style={btn} disabled={busy || !xliffIn.trim()} onClick={() => importJson(xliffIn)}>Import as JSON</button>
          <button style={btn} disabled={busy || !xliffIn.trim()} onClick={() => importXliff(xliffIn)}>Import as XLIFF</button>
        </div>
      </details>

      {/* split-view grid */}
      {en.error ? <Err error={en.error} /> : target.error ? <Err error={target.error} /> : en.loading || target.loading ? <p>Loading…</p> : (
        pairs.length === 0 ? <Empty text={missingOnly ? 'Every key in this scope is translated. 🎉' : 'No EN source strings match — seed EN strings first.'} /> : (
          <div style={{ border: '1px solid #E6EBF1', borderRadius: 12, background: '#fff', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 1fr', background: '#F8FAFB', borderBottom: '1px solid #E6EBF1', padding: '8px 14px', fontSize: 10.5, fontWeight: 800, letterSpacing: 0.9, textTransform: 'uppercase', color: '#93A0B4' }}>
              <span>Key</span><span>English (source)</span><span>{locale} (target){rtl ? ' · RTL' : ''}</span>
            </div>
            {pairs.map((p) => (
              <div key={p.ns + ':' + p.key} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 1fr', padding: '8px 14px', borderBottom: '1px solid #F0F3F7', alignItems: 'start' }}>
                <span style={{ fontSize: 11.5, color: '#66748A', wordBreak: 'break-all' }} title={p.ns + ':' + p.key}>
                  {p.key}
                  <div style={{ fontSize: 10, color: '#93A0B4' }}>{p.ns}</div>
                </span>
                <span style={{ fontSize: 13, color: '#1F2A37', paddingInlineEnd: 12, whiteSpace: 'pre-wrap' }}>{p.source || <span style={{ color: '#93A0B4' }}>—</span>}</span>
                {editing === p.key ? (
                  <span style={{ display: 'flex', gap: 6 }}>
                    <textarea dir={rtl ? 'rtl' : 'ltr'} style={{ ...input, flex: 1, minHeight: 54, ...(rtl ? rtlFont : {}) }} value={editValue} onChange={(e) => setEditValue(e.target.value)} autoFocus />
                    <span style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <button style={{ ...btn, padding: '4px 10px' }} disabled={busy} onClick={() => save(p.key, p.ns)}>Save</button>
                      <button style={{ ...btnGhost, padding: '4px 10px' }} onClick={() => setEditing(null)}>Cancel</button>
                      {isSuperAdmin && p.target && (
                        <button style={{ ...btnGhost, padding: '4px 10px', color: '#C2453C' }} disabled={busy}
                          title="Delete this translated string (super_admin)" onClick={() => remove(p.key, p.ns)}>Delete</button>
                      )}
                    </span>
                  </span>
                ) : (
                  <button dir={rtl ? 'rtl' : 'ltr'} onClick={() => { setEditing(p.key); setEditValue(p.target?.value ?? ''); }}
                    style={{ border: 0, background: 'none', textAlign: 'start', cursor: 'pointer', padding: 0, fontSize: 13, ...(rtl ? rtlFont : {}), color: p.target ? '#1F2A37' : '#C2453C', whiteSpace: 'pre-wrap', width: '100%' }}
                    title={p.target ? `Updated ${fmtDate(p.target.updatedAt)}` : 'Untranslated — click to add'}>
                    {p.target ? p.target.value : <span style={{ fontStyle: 'italic' }}>⚠ missing — click to translate</span>}
                  </button>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
