// Phase 5.1 & MS4.8 Translation Studio — split-view editor:
// Supports both UI Strings and Content Entities (Pages, Products, Glossary, Policies, Offices, Testimonials).
// Features: EN source on the left, target locale on the right (RTL rendering for Arabic),
// per-locale progress matrix, per-field status (missing, outdated, current),
// search + missing-only filter, and XLIFF 1.2 / 2.0 round-trip with encoding validation.
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

type EntityStatusItem = {
  id: string;
  entity: string;
  entityId: number;
  field: string;
  source: string;
  target: string | null;
  status: 'missing' | 'outdated' | 'current';
  sourceUpdatedAt: string;
  targetUpdatedAt: string | null;
};

type EntityStatusResponse = {
  locale: string;
  summary: { total: number; missing: number; outdated: number; current: number };
  items: EntityStatusItem[];
};

export default function Translations({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const [activeTab, setActiveTab] = useState<'ui' | 'entities'>('entities');
  const [locale, setLocale] = useState('ar');
  const [nsFilter, setNsFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
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
  const entityStatus = useAsync<EntityStatusResponse>(() => apiGet(`/admin/translations/entities/status?locale=${locale}`), [locale, activeTab]);
  const reloadAll = () => { en.reload(); target.reload(); progress.reload(); entityStatus.reload(); };

  const namespaces = useMemo(() => {
    const fromProgress = progress.data?.namespaces ?? [];
    const seen = new Set<string>(['common', 'entities', ...fromProgress]);
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

  // filtered entities items
  const entityItems = useMemo(() => {
    const items = entityStatus.data?.items ?? [];
    const needle = q.trim().toLowerCase();
    return items.filter((item) => {
      if (entityFilter && item.entity !== entityFilter) return false;
      if (statusFilter && item.status !== statusFilter) return false;
      if (!needle) return true;
      return (
        item.id.toLowerCase().includes(needle) ||
        item.source.toLowerCase().includes(needle) ||
        (item.target ?? '').toLowerCase().includes(needle)
      );
    });
  }, [entityStatus.data, entityFilter, statusFilter, q]);

  const rtl = localeDir(locale) === 'rtl';
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
      const endpoint = activeTab === 'entities' ? '/admin/translations/entities/xliff' : '/admin/translations/xliff';
      const payload = activeTab === 'entities'
        ? { locale, xml: text }
        : { locale, ns: nsFilter || 'common', xml: text };
      const res = await apiSend<{ imported: number; skippedEmpty: number }>('POST', endpoint, payload);
      setNotice(`XLIFF: imported ${res.imported}, skipped ${res.skippedEmpty} empty target(s).`);
      setXliffIn(''); reloadAll();
    } catch (e) { setError(e); } finally { setBusy(false); }
  }

  function downloadXliff() {
    const url = activeTab === 'entities'
      ? `/admin/translations/entities/xliff?locale=${locale}${entityFilter ? `&entity=${entityFilter}` : ''}`
      : `/admin/translations/xliff?locale=${locale}${nsFilter ? `&ns=${nsFilter}` : ''}`;
    fetch((import.meta.env.VITE_API_URL ?? '/api/v1') + url, { credentials: 'include' })
      .then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.blob(); })
      .then((b) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(b);
        a.download = activeTab === 'entities'
          ? `twinmos-entities-${locale}.xliff`
          : `twinmos-${locale}-${nsFilter || 'common'}.xliff`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      })
      .catch(() => setError(new Error('XLIFF export failed.')));
  }

  function exportJson() {
    const bundle: Record<string, string> = {};
    if (activeTab === 'entities') {
      entityItems.forEach((it) => { if (it.target) bundle[it.id] = it.target; });
    } else {
      pairs.forEach((p) => { if (p.target) bundle[p.key] = p.target.value; });
    }
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `twinmos-${locale}-${activeTab}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const card: React.CSSProperties = { border: '1px solid #E6EBF1', borderRadius: 12, background: '#fff', padding: 12, minWidth: 0 };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#1F2A37', letterSpacing: -0.2 }}>Translation Studio</h1>
          <p style={{ margin: '2px 0 0', color: '#374151', fontSize: 13 }}>
            EN source on the left, target on the right · 9-locale plan · XLIFF 1.2 / 2.0 round-trip · Per-field status tracking
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6, background: '#F1F4F8', padding: 4, borderRadius: 8 }}>
          <button
            onClick={() => setActiveTab('entities')}
            style={{
              border: 0,
              padding: '6px 14px',
              borderRadius: 6,
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'entities' ? '#fff' : 'transparent',
              color: activeTab === 'entities' ? '#0052CC' : '#334155',
              boxShadow: activeTab === 'entities' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            Content Entities
          </button>
          <button
            onClick={() => setActiveTab('ui')}
            style={{
              border: 0,
              padding: '6px 14px',
              borderRadius: 6,
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'ui' ? '#fff' : 'transparent',
              color: activeTab === 'ui' ? '#0052CC' : '#334155',
              boxShadow: activeTab === 'ui' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            UI Strings
          </button>
        </div>
      </div>

      {/* Progress matrix */}
      {progress.data ? (
        <div style={{ ...card, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
            <b style={{ fontSize: 13, color: '#1F2A37' }}>Coverage vs EN ({progress.data.enKeys} keys)</b>
            <span style={{ fontSize: 11.5, color: '#475569' }}>per locale</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 8 }}>
            {LOCALES.map((l) => {
              const p = progress.data!.perLocale[l] ?? { strings: 0, coverage: 0 };
              const active = l === locale;
              return (
                <button
                  key={l}
                  onClick={() => setLocale(l)}
                  title={`${p.strings} strings`}
                  style={{
                    textAlign: 'left',
                    border: '1px solid ' + (active ? '#0052CC' : '#CBD5E1'),
                    borderRadius: 9,
                    background: active ? '#EFF6FF' : '#fff',
                    padding: '7px 9px',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 700, color: '#1F2A37' }}>
                    <span>{l}{localeDir(l) === 'rtl' ? ' ⇄' : ''}</span>
                    <span style={{ color: p.coverage >= 100 ? '#047857' : p.coverage >= 50 ? '#B45309' : '#B91C1C' }}>{p.coverage}%</span>
                  </div>
                  <div style={{ background: '#F1F4F8', borderRadius: 999, height: 6, marginTop: 5, overflow: 'hidden' }}>
                    <div style={{ width: p.coverage + '%', height: '100%', background: p.coverage >= 100 ? '#047857' : p.coverage >= 50 ? '#B45309' : '#B91C1C', borderRadius: 999 }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Entities Status Summary Header */}
      {activeTab === 'entities' && entityStatus.data ? (
        <div style={{ ...card, marginBottom: 12, display: 'flex', gap: 16, alignItems: 'center', background: '#F8FAFC' }}>
          <b style={{ fontSize: 13, color: '#1E293B' }}>{locale.toUpperCase()} Status:</b>
          <div style={{ display: 'flex', gap: 12, fontSize: 12.5 }}>
            <span style={{ color: '#334155' }}>Total: <b>{entityStatus.data.summary.total}</b></span>
            <span style={{ color: '#047857', fontWeight: 700 }}>● Current: {entityStatus.data.summary.current}</span>
            <span style={{ color: '#B45309', fontWeight: 700 }}>▲ Outdated: {entityStatus.data.summary.outdated}</span>
            <span style={{ color: '#B91C1C', fontWeight: 700 }}>✕ Missing: {entityStatus.data.summary.missing}</span>
          </div>
        </div>
      ) : null}

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
        <select style={input} aria-label="Select target locale" value={locale} onChange={(e) => setLocale(e.target.value)}>
          {LOCALES.map((l) => <option key={l} value={l}>{l}{localeDir(l) === 'rtl' ? ' (RTL)' : ''}</option>)}
        </select>
        {activeTab === 'ui' ? (
          <select style={input} aria-label="Filter UI strings by namespace" value={nsFilter} onChange={(e) => setNsFilter(e.target.value)}>
            <option value="">All namespaces</option>
            {namespaces.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        ) : (
          <>
            <select style={input} aria-label="Filter entities by entity type" value={entityFilter} onChange={(e) => setEntityFilter(e.target.value)}>
              <option value="">All entity types</option>
              <option value="page">Pages</option>
              <option value="product">Products</option>
              <option value="glossary">Glossary terms</option>
              <option value="policy">Policies</option>
              <option value="office">Offices</option>
              <option value="testimonial">Testimonials</option>
            </select>
            <select style={input} aria-label="Filter entities by translation status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All statuses</option>
              <option value="missing">Missing only</option>
              <option value="outdated">Outdated only</option>
              <option value="current">Current only</option>
            </select>
          </>
        )}
        <input style={{ ...input, width: 220 }} placeholder="Search key or text…" value={q} onChange={(e) => setQ(e.target.value)} />
        {activeTab === 'ui' && (
          <button style={{ ...btnGhost, fontWeight: missingOnly ? 800 : 400, borderColor: missingOnly ? '#10B981' : undefined, color: missingOnly ? '#047857' : undefined }} onClick={() => setMissingOnly((v) => !v)}>
            {missingOnly ? `Missing only (${pairs.length})` : 'Show missing only'}
          </button>
        )}
        <span style={{ flex: 1 }} />
        <button style={btnGhost} onClick={downloadXliff}>⬇ XLIFF</button>
        <button style={btnGhost} onClick={exportJson}>⬇ JSON</button>
      </div>

      {error ? <Err error={error} /> : null}
      {notice ? <p style={{ color: '#059669', fontWeight: 700, fontSize: 13 }}>{notice}</p> : null}

      {/* Import drawer — JSON or XLIFF paste */}
      <details style={{ ...card, marginBottom: 12 }}>
        <summary style={{ cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#1F2A37' }}>
          Import — paste {activeTab === 'entities' ? 'Entity XLIFF 1.2 / 2.0' : 'JSON or XLIFF 1.2'}
        </summary>
        <textarea
          style={{ ...input, width: '100%', minHeight: 110, marginTop: 8, fontFamily: 'ui-monospace, monospace', fontSize: 12 }}
          placeholder={activeTab === 'entities'
            ? 'Paste XLIFF containing <trans-unit id="product:1:name">... or <unit id="...">...'
            : '{"cta.buy": "اشترِ الآن"}  — or paste XLIFF exported from Crowdin/Trados'}
          value={xliffIn}
          onChange={(e) => setXliffIn(e.target.value)}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          {activeTab === 'ui' && (
            <button style={btn} disabled={busy || !xliffIn.trim()} onClick={() => importJson(xliffIn)}>Import as JSON</button>
          )}
          <button style={btn} disabled={busy || !xliffIn.trim()} onClick={() => importXliff(xliffIn)}>
            {activeTab === 'entities' ? 'Import Entity XLIFF' : 'Import as XLIFF'}
          </button>
        </div>
      </details>

      {/* Active Tab Content Grid */}
      {activeTab === 'entities' ? (
        entityStatus.loading ? (
          <p>Loading entity translations…</p>
        ) : entityStatus.error ? (
          <Err error={entityStatus.error} />
        ) : entityItems.length === 0 ? (
          <Empty text="No entity fields match the filter criteria." />
        ) : (
          <div style={{ border: '1px solid #CBD5E1', borderRadius: 12, background: '#fff', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr 1fr', background: '#F1F5F9', borderBottom: '1px solid #CBD5E1', padding: '8px 14px', fontSize: 11, fontWeight: 800, letterSpacing: 0.9, textTransform: 'uppercase', color: '#1E293B' }}>
              <span>Entity & Field</span>
              <span>English Source</span>
              <span>{locale.toUpperCase()} Target{rtl ? ' · RTL' : ''}</span>
            </div>
            {entityItems.map((item) => {
              const statusColor = item.status === 'current' ? '#047857' : item.status === 'outdated' ? '#9A3412' : '#B91C1C';
              const statusBg = item.status === 'current' ? '#ECFDF5' : item.status === 'outdated' ? '#FFFBEB' : '#FEF2F2';
              return (
                <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '170px 1fr 1fr', padding: '10px 14px', borderBottom: '1px solid #E2E8F0', alignItems: 'start' }}>
                  <div style={{ paddingRight: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: '#E2E8F0', color: '#1E293B', textTransform: 'uppercase' }}>
                        {item.entity}
                      </span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: statusBg, color: statusColor }}>
                        {item.status}
                      </span>
                    </div>
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: '#1E293B', wordBreak: 'break-all' }}>{item.field}</div>
                    <div style={{ fontSize: 10, color: '#475569' }}>#{item.entityId}</div>
                  </div>

                  <div style={{ fontSize: 13, color: '#0F172A', paddingInlineEnd: 12, whiteSpace: 'pre-wrap' }}>
                    {item.source}
                  </div>

                  {editing === item.id ? (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <textarea
                        dir={rtl ? 'rtl' : 'ltr'}
                        style={{ ...input, flex: 1, minHeight: 64, ...(rtl ? rtlFont : {}) }}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        autoFocus
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <button style={{ ...btn, padding: '4px 10px' }} disabled={busy} onClick={() => save(item.id, 'entities')}>
                          Save
                        </button>
                        <button style={{ ...btnGhost, padding: '4px 10px' }} onClick={() => setEditing(null)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      dir={rtl ? 'rtl' : 'ltr'}
                      onClick={() => { setEditing(item.id); setEditValue(item.target ?? ''); }}
                      style={{
                        border: 0,
                        background: 'none',
                        textAlign: 'start',
                        cursor: 'pointer',
                        padding: 0,
                        fontSize: 13,
                        ...(rtl ? rtlFont : {}),
                        color: item.target ? '#0F172A' : '#B91C1C',
                        whiteSpace: 'pre-wrap',
                        width: '100%',
                      }}
                      title={item.target ? `Updated ${item.targetUpdatedAt ? fmtDate(item.targetUpdatedAt) : ''}` : 'Untranslated — click to translate'}
                    >
                      {item.target ? item.target : <span style={{ fontStyle: 'italic', color: '#B91C1C' }}>⚠ missing — click to translate</span>}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* UI Strings Split-View Grid */
        en.error ? <Err error={en.error} /> : target.error ? <Err error={target.error} /> : en.loading || target.loading ? <p>Loading…</p> : (
          pairs.length === 0 ? <Empty text={missingOnly ? 'Every key in this scope is translated. 🎉' : 'No EN source strings match — seed EN strings first.'} /> : (
            <div style={{ border: '1px solid #CBD5E1', borderRadius: 12, background: '#fff', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 1fr', background: '#F1F5F9', borderBottom: '1px solid #CBD5E1', padding: '8px 14px', fontSize: 11, fontWeight: 800, letterSpacing: 0.9, textTransform: 'uppercase', color: '#1E293B' }}>
                <span>Key</span><span>English (source)</span><span>{locale} (target){rtl ? ' · RTL' : ''}</span>
              </div>
              {pairs.map((p) => (
                <div key={p.ns + ':' + p.key} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 1fr', padding: '8px 14px', borderBottom: '1px solid #E2E8F0', alignItems: 'start' }}>
                  <span style={{ fontSize: 11.5, color: '#1E293B', wordBreak: 'break-all' }} title={p.ns + ':' + p.key}>
                    {p.key}
                    <div style={{ fontSize: 10, color: '#475569' }}>{p.ns}</div>
                  </span>
                  <span style={{ fontSize: 13, color: '#0F172A', paddingInlineEnd: 12, whiteSpace: 'pre-wrap' }}>{p.source || <span style={{ color: '#475569' }}>—</span>}</span>
                  {editing === p.key ? (
                    <span style={{ display: 'flex', gap: 6 }}>
                      <textarea dir={rtl ? 'rtl' : 'ltr'} style={{ ...input, flex: 1, minHeight: 54, ...(rtl ? rtlFont : {}) }} value={editValue} onChange={(e) => setEditValue(e.target.value)} autoFocus />
                      <span style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <button style={{ ...btn, padding: '4px 10px' }} disabled={busy} onClick={() => save(p.key, p.ns)}>Save</button>
                        <button style={{ ...btnGhost, padding: '4px 10px' }} onClick={() => setEditing(null)}>Cancel</button>
                        {isSuperAdmin && p.target && (
                          <button style={{ ...btnGhost, padding: '4px 10px', color: '#B91C1C' }} disabled={busy}
                            title="Delete this translated string (super_admin)" onClick={() => remove(p.key, p.ns)}>Delete</button>
                        )}
                      </span>
                    </span>
                  ) : (
                    <button dir={rtl ? 'rtl' : 'ltr'} onClick={() => { setEditing(p.key); setEditValue(p.target?.value ?? ''); }}
                      style={{ border: 0, background: 'none', textAlign: 'start', cursor: 'pointer', padding: 0, fontSize: 13, ...(rtl ? rtlFont : {}), color: p.target ? '#0F172A' : '#B91C1C', whiteSpace: 'pre-wrap', width: '100%' }}
                      title={p.target ? `Updated ${fmtDate(p.target.updatedAt)}` : 'Untranslated — click to add'}>
                      {p.target ? p.target.value : <span style={{ fontStyle: 'italic', color: '#B91C1C' }}>⚠ missing — click to translate</span>}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )
        )
      )}
    </div>
  );
}
