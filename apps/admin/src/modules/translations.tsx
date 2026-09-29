// P4 Translations — the translation workflow surface: pick a locale, edit the
// string grid, or export/import JSON per namespace. Writes go through the
// super_admin-guarded API; export is the file handed to translators.
import React, { useState } from 'react';
import { apiGet, apiSend, fmtDate } from '../api';
import { btn, btnGhost, Empty, Err, input, Table, td, useAsync } from '../ui';
import { LOCALES } from '@twinmos/shared';

type Row = { id: number; locale: string; ns: string; key: string; value: string; updatedAt: string };

export default function Translations({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const [locale, setLocale] = useState('ar');
  const [ns, setNs] = useState('common');
  const [importText, setImportText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [notice, setNotice] = useState('');
  const [editing, setEditing] = useState<string | null>(null); // `${ns}:${key}`
  const [editValue, setEditValue] = useState('');

  const { data, error: loadError, loading, reload } = useAsync<{ items: Row[] }>(
    () => apiGet(`/admin/translations?locale=${locale}`), [locale]);

  const scoped = (data?.items ?? []).filter((r) => !ns || r.ns === ns);

  async function upsert(key: string, value: string) {
    setBusy(true); setError(null); setNotice('');
    try {
      await apiSend('PUT', '/admin/translations', { locale, ns, key, value });
      setEditing(null);
      reload();
    } catch (e) { setError(e); } finally { setBusy(false); }
  }

  async function runImport() {
    setBusy(true); setError(null); setNotice('');
    try {
      const strings = JSON.parse(importText);
      const res = await apiSend<{ imported: number }>('POST', '/admin/translations/import', { locale, ns, strings });
      setNotice(`Imported ${res.imported} strings into ${locale}/${ns}.`);
      setImportText('');
      reload();
    } catch (e) {
      setError(e instanceof SyntaxError ? new Error('Import JSON is invalid: ' + e.message) : e);
    } finally { setBusy(false); }
  }

  function exportJson() {
    const bundle: Record<string, string> = {};
    scoped.forEach((r) => { bundle[r.key] = r.value; });
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `twinmos-${locale}-${ns}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function remove(key: string) {
    setBusy(true); setError(null);
    try {
      await apiSend('DELETE', '/admin/translations', { locale, ns, key });
      reload();
    } catch (e) { setError(e); } finally { setBusy(false); }
  }

  return (
    <div>
      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#1F2A37', letterSpacing: -0.2 }}>Translations</h1>
      <p style={{ color: '#66748A' }}>9-locale plan (EN launch; BN removed). Export a namespace, translate the JSON, import it back — every change is audited.</p>
      <div style={{ display: 'flex', gap: 8, margin: '12px 0', flexWrap: 'wrap', alignItems: 'center' }}>
        <select style={input} value={locale} onChange={(e) => setLocale(e.target.value)}>
          {LOCALES.map((l) => <option key={l} value={l}>{l === 'en' ? 'en (source)' : l}</option>)}
        </select>
        <input style={input} placeholder="namespace (e.g. common)" value={ns} onChange={(e) => setNs(e.target.value)} />
        <button style={btnGhost} onClick={exportJson}>Export JSON</button>
        {isSuperAdmin ? <span style={{ color: '#66748A', fontSize: 12.5 }}>writes enabled (super_admin)</span> : <span style={{ color: '#C2453C', fontSize: 12.5 }}>read-only — writes need super_admin</span>}
      </div>
      {error ? <Err error={error} /> : null}
      {notice ? <p style={{ color: '#047857' }}>{notice}</p> : null}

      {isSuperAdmin && (
        <div style={{ border: '1px solid #E6EBF1', borderRadius: 10, padding: 14, margin: '12px 0', background: '#F8FAFC' }}>
          <b style={{ fontSize: 14 }}>Import {locale}/{ns}</b>
          <textarea
            style={{ ...input, minHeight: 120, fontFamily: 'ui-monospace, monospace', fontSize: 13, marginTop: 8 }}
            placeholder={'{\n  "nav.products": "المنتجات",\n  "nav.support": "الدعم"\n}'}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
          />
          <button style={{ ...btn, marginTop: 8 }} disabled={busy || !importText.trim()} onClick={runImport}>Import strings</button>
        </div>
      )}

      {loadError ? <Err error={loadError} /> : loading ? <p>Loading…</p> : data ? (
        <Table head={['Key', 'Value', 'Updated', '']}>
          {scoped.map((row) => {
            const id = `${row.ns}:${row.key}`;
            return (
              <tr key={row.id}>
                <td style={{ ...td, width: 220, fontFamily: 'ui-monospace, monospace', fontSize: 12.5 }}>{row.key}</td>
                <td style={td}>
                  {editing === id ? (
                    <span style={{ display: 'flex', gap: 6 }}>
                      <input style={{ ...input, flex: 1 }} value={editValue} onChange={(e) => setEditValue(e.target.value)} dir={locale === 'ar' ? 'rtl' : 'ltr'} />
                      <button style={btnGhost} disabled={busy} onClick={() => upsert(row.key, editValue)}>Save</button>
                    </span>
                  ) : (
                    <span dir={locale === 'ar' ? 'rtl' : 'ltr'}>{row.value}</span>
                  )}
                </td>
                <td style={td}>{fmtDate(row.updatedAt)}</td>
                <td style={td}>
                  {isSuperAdmin && (
                    <>
                      <button style={btnGhost} onClick={() => { setEditing(id); setEditValue(row.value); }}>Edit</button>
                      <button style={{ ...btnGhost, marginLeft: 6 }} disabled={busy} onClick={() => remove(row.key)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </Table>
      ) : null}
      {data && scoped.length === 0 && <Empty text={`No strings in ${locale}/${ns} yet — import a JSON file or add them in the source locale.`} />}
    </div>
  );
}
