// Accessible menu tree editor (MS4.7 · T4.7.6 / C2b).
// Edits the real nav_menu/nav_item rows the chrome reads, per locale, with
// keyboard/button movement alternatives and drag-to-reorder.
import React, { useEffect, useMemo, useState } from 'react';
import { apiGet, apiSend } from '../api';
import { btn, btnGhost, Err, input } from '../ui';

type NavMenu = { id: number; code: string; title: string; locale: string };
type NavItem = {
  id: number;
  parentId: number | null;
  title: string;
  targetType: string;
  targetUrl: string | null;
  targetId: string | null;
  sort: number;
  metadata?: Record<string, unknown>;
};
type Draft = { title: string; targetUrl: string; targetType: string; targetId: string };
type Row = { item: NavItem; depth: number };

const MENU_CODES = [
  { code: 'header', label: 'Header mega-menu' },
  { code: 'drawer', label: 'Mobile drawer' },
  { code: 'footer', label: 'Footer columns + legal bar' },
];
const LOCALES = ['en', 'ar', 'hi', 'ru', 'zh-cn', 'fr', 'es', 'pt', 'de'];
const TARGET_TYPES = ['url', 'page', 'product', 'article', 'category'];

function buildRows(items: NavItem[]): Row[] {
  const byParent = new Map<number | null, NavItem[]>();
  for (const item of items) {
    const key = item.parentId ?? null;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(item);
  }
  for (const list of byParent.values()) list.sort((a, b) => a.sort - b.sort || a.id - b.id);
  const rows: Row[] = [];
  const walk = (parentId: number | null, depth: number) => {
    for (const item of byParent.get(parentId) ?? []) {
      rows.push({ item, depth });
      walk(item.id, depth + 1);
    }
  };
  walk(null, 0);
  return rows;
}

export default function MenuEditor({ canManage }: { canManage: boolean }) {
  const [locale, setLocale] = useState('en');
  const [code, setCode] = useState('header');
  const [menu, setMenu] = useState<NavMenu | null>(null);
  const [items, setItems] = useState<NavItem[]>([]);
  const [drafts, setDrafts] = useState<Record<number, Draft>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [dragId, setDragId] = useState<number | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    setMessage(null);
    (async () => {
      const list = await apiGet<{ items: NavMenu[] }>(`/admin/navigation/menus?locale=${encodeURIComponent(locale)}`);
      const found = (list.items ?? []).find((m) => m.code === code) ?? null;
      if (!alive) return;
      setMenu(found);
      if (!found) {
        setItems([]);
        setDrafts({});
        return;
      }
      const detail = await apiGet<{ items: NavItem[]; flatItems?: NavItem[] }>(`/admin/navigation/menus/${found.id}`);
      if (!alive) return;
      const flat = detail.flatItems ?? detail.items ?? [];
      setItems(flat);
      setDrafts(
        Object.fromEntries(
          flat.map((item) => [
            item.id,
            {
              title: item.title,
              targetUrl: item.targetUrl ?? '',
              targetType: item.targetType,
              targetId: item.targetId ?? '',
            },
          ]),
        ),
      );
    })()
      .catch((err) => alive && setError(err))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [locale, code, reloadKey]);

  const rows = useMemo(() => buildRows(items), [items]);
  const dirtyIds = useMemo(
    () =>
      items
        .filter((item) => {
          const draft = drafts[item.id];
          if (!draft) return false;
          return (
            draft.title !== item.title ||
            draft.targetUrl !== (item.targetUrl ?? '') ||
            draft.targetType !== item.targetType ||
            draft.targetId !== (item.targetId ?? '')
          );
        })
        .map((item) => item.id),
    [items, drafts],
  );

  function updateDraft(id: number, patch: Partial<Draft>) {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }

  async function createMenu() {
    setBusy(true);
    setError(null);
    try {
      const title = MENU_CODES.find((m) => m.code === code)?.label ?? code;
      const created = await apiSend<NavMenu>('POST', '/admin/navigation/menus', { code, title, locale });
      setMenu(created);
      setReloadKey((n) => n + 1);
      setMessage(`Created the "${code}" menu for ${locale}.`);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  async function addItem(parentId: number | null = null) {
    if (!menu) return;
    const title = newTitle.trim() || 'New item';
    setBusy(true);
    setError(null);
    try {
      const siblings = items.filter((item) => (item.parentId ?? null) === parentId);
      const sort = siblings.reduce((max, item) => Math.max(max, item.sort), 0) + 10;
      await apiSend('POST', `/admin/navigation/menus/${menu.id}/items`, {
        parentId,
        title,
        targetType: 'url',
        targetUrl: '/',
        sort,
        metadata: { kind: parentId ? 'link' : 'top_level' },
      });
      setNewTitle('');
      setReloadKey((n) => n + 1);
      setMessage('Item added.');
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  async function saveAll() {
    if (!dirtyIds.length) return;
    setBusy(true);
    setError(null);
    try {
      for (const id of dirtyIds) {
        const draft = drafts[id];
        await apiSend('PATCH', `/admin/navigation/items/${id}`, {
          title: draft.title,
          targetUrl: draft.targetUrl.trim() || null,
          targetType: draft.targetType,
          targetId: draft.targetId.trim() || null,
        });
      }
      setReloadKey((n) => n + 1);
      setMessage(`Saved ${dirtyIds.length} item${dirtyIds.length === 1 ? '' : 's'} — the nav cache tag is invalidated.`);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  async function deleteItem(id: number) {
    if (!window.confirm('Delete this item and everything nested under it?')) return;
    setBusy(true);
    setError(null);
    try {
      await apiSend('DELETE', `/admin/navigation/items/${id}`);
      setReloadKey((n) => n + 1);
      setMessage('Item deleted.');
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  async function moveSibling(item: NavItem, direction: -1 | 1) {
    const siblings = items
      .filter((candidate) => (candidate.parentId ?? null) === (item.parentId ?? null))
      .sort((a, b) => a.sort - b.sort || a.id - b.id);
    const index = siblings.findIndex((candidate) => candidate.id === item.id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= siblings.length) return;
    setBusy(true);
    setError(null);
    try {
      const other = siblings[target];
      await apiSend('PATCH', `/admin/navigation/items/${item.id}`, { sort: other.sort });
      await apiSend('PATCH', `/admin/navigation/items/${other.id}`, { sort: item.sort });
      setReloadKey((n) => n + 1);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  async function changeParent(item: NavItem, parentId: number | null) {
    setBusy(true);
    setError(null);
    try {
      await apiSend('PATCH', `/admin/navigation/items/${item.id}`, { parentId });
      setReloadKey((n) => n + 1);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  function indent(item: NavItem) {
    const siblings = items
      .filter((candidate) => (candidate.parentId ?? null) === (item.parentId ?? null))
      .sort((a, b) => a.sort - b.sort || a.id - b.id);
    const index = siblings.findIndex((candidate) => candidate.id === item.id);
    if (index <= 0) return;
    const previous = siblings[index - 1];
    const depth = rows.find((row) => row.item.id === item.id)?.depth ?? 0;
    if (depth >= 2) return;
    void changeParent(item, previous.id);
  }

  function outdent(item: NavItem) {
    if (item.parentId == null) return;
    const parent = items.find((candidate) => candidate.id === item.parentId);
    void changeParent(item, parent?.parentId ?? null);
  }

  async function dropOn(target: NavItem) {
    if (dragId == null || dragId === target.id) return;
    const dragged = items.find((item) => item.id === dragId);
    if (!dragged) return;
    // Drop before the target among the target's siblings.
    await changeParent(dragged, target.parentId ?? null);
    await apiSend('PATCH', `/admin/navigation/items/${dragged.id}`, { sort: target.sort });
    setDragId(null);
  }

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Menu</label>
          <select style={input} value={code} onChange={(e) => setCode(e.target.value)}>
            {MENU_CODES.map((m) => (
              <option key={m.code} value={m.code}>{m.label} ({m.code})</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Locale</label>
          <select style={input} value={locale} onChange={(e) => setLocale(e.target.value)}>
            {LOCALES.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        {!menu && canManage && !loading && (
          <button style={btn} disabled={busy} onClick={createMenu}>Create this menu for {locale}</button>
        )}
        <button style={btn} disabled={busy || !canManage || dirtyIds.length === 0} onClick={saveAll}>
          {busy ? 'Saving…' : `Save changes${dirtyIds.length ? ` (${dirtyIds.length})` : ''}`}
        </button>
        <button style={btnGhost} disabled={busy} onClick={() => setReloadKey((n) => n + 1)}>Reload</button>
      </div>

      {error ? <Err error={error} /> : null}
      {message && (
        <div style={{ background: '#DEF7EC', border: '1px solid #31C48D', color: '#03543F', padding: '8px 12px', borderRadius: 8, fontSize: 13 }}>
          ✓ {message}
        </div>
      )}

      {loading ? (
        <p>Loading menu…</p>
      ) : !menu ? (
        <p style={{ fontSize: 13, color: '#66748A' }}>
          No “{code}” menu exists for {locale} yet. {canManage ? 'Create it above, then add items.' : 'Ask a super admin to create it.'}
        </p>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              style={{ ...input, maxWidth: 260 }}
              placeholder="New item title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              disabled={!canManage}
            />
            <button style={btnGhost} disabled={busy || !canManage} onClick={() => addItem(null)}>+ Add root item</button>
            <span style={{ fontSize: 12, color: '#66748A' }}>{rows.length} items · {locale} · {menu.title}</span>
          </div>

          <div style={{ border: '1px solid #E6EBF1', borderRadius: 10, overflow: 'hidden' }}>
            {rows.map(({ item, depth }) => {
              const draft = drafts[item.id] ?? {
                title: item.title,
                targetUrl: item.targetUrl ?? '',
                targetType: item.targetType,
                targetId: item.targetId ?? '',
              };
              return (
                <div
                  key={item.id}
                  draggable={canManage}
                  onDragStart={() => setDragId(item.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => void dropOn(item)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '18px 1.2fr 1.6fr 110px 110px auto',
                    gap: 8,
                    alignItems: 'center',
                    padding: '7px 10px',
                    paddingLeft: 10 + depth * 22,
                    borderBottom: '1px solid #F0F3F7',
                    background: dragId === item.id ? '#F0FDF4' : '#fff',
                  }}
                >
                  <span aria-hidden="true" title="Drag to reorder" style={{ cursor: 'grab', color: '#98A2B3' }}>⋮⋮</span>
                  <input
                    aria-label={`Title for item ${item.id}`}
                    style={input}
                    value={draft.title}
                    onChange={(e) => updateDraft(item.id, { title: e.target.value })}
                    disabled={!canManage}
                  />
                  <input
                    aria-label={`Target URL for item ${item.id}`}
                    style={input}
                    value={draft.targetUrl}
                    onChange={(e) => updateDraft(item.id, { targetUrl: e.target.value })}
                    disabled={!canManage}
                  />
                  <select
                    aria-label={`Target type for item ${item.id}`}
                    style={input}
                    value={draft.targetType}
                    onChange={(e) => updateDraft(item.id, { targetType: e.target.value })}
                    disabled={!canManage}
                  >
                    {TARGET_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                  </select>
                  <input
                    aria-label={`Target reference for item ${item.id}`}
                    style={input}
                    placeholder="targetId"
                    value={draft.targetId}
                    onChange={(e) => updateDraft(item.id, { targetId: e.target.value })}
                    disabled={!canManage}
                  />
                  <span style={{ display: 'inline-flex', gap: 2 }}>
                    <button style={btnGhost} aria-label={`Move ${draft.title} up`} disabled={!canManage || busy} onClick={() => void moveSibling(item, -1)}>↑</button>
                    <button style={btnGhost} aria-label={`Move ${draft.title} down`} disabled={!canManage || busy} onClick={() => void moveSibling(item, 1)}>↓</button>
                    <button style={btnGhost} aria-label={`Outdent ${draft.title}`} disabled={!canManage || busy} onClick={() => outdent(item)}>⇤</button>
                    <button style={btnGhost} aria-label={`Indent ${draft.title}`} disabled={!canManage || busy} onClick={() => indent(item)}>⇥</button>
                    <button style={btnGhost} aria-label={`Add child under ${draft.title}`} disabled={!canManage || busy} onClick={() => void addItem(item.id)}>+</button>
                    <button style={btnGhost} aria-label={`Delete ${draft.title}`} disabled={!canManage || busy} onClick={() => void deleteItem(item.id)}>✕</button>
                  </span>
                </div>
              );
            })}
            {rows.length === 0 && <p style={{ padding: 16, fontSize: 13, color: '#66748A' }}>This menu has no items yet.</p>}
          </div>

          <details style={{ fontSize: 13 }}>
            <summary style={{ cursor: 'pointer', fontWeight: 700 }}>Preview tree</summary>
            <ul style={{ marginTop: 8 }}>
              {rows.map(({ item, depth }) => (
                <li key={item.id} style={{ marginLeft: depth * 20, listStyle: depth === 0 ? 'disc' : 'circle' }}>
                  {drafts[item.id]?.title ?? item.title}
                  {item.targetUrl ? <span style={{ color: '#66748A' }}> → {item.targetUrl}</span> : null}
                </li>
              ))}
            </ul>
          </details>
        </>
      )}
    </div>
  );
}
