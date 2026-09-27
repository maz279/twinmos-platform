// TwinMOS Admin — P2 shell: login + role-aware module navigation.
// Modules: Dashboard KPIs · Submissions inbox · RMA board · Job applications ·
// Products (P0 reference) · Audit log. Writes are hidden for viewer role.
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { API, apiGet } from './api';
import Dashboard from './modules/dashboard';
import Submissions from './modules/submissions';
import RmaBoard from './modules/rma';
import Jobs from './modules/jobs';
import Products from './modules/products';
import { Badge, Empty, Err, Table, btn, input, td, useAsync } from './ui';

type Me = { user?: { id: string; email: string; role: string } };
const WRITE_ROLES = ['super_admin', 'admin', 'editor', 'author'];
const canWrite = (role?: string) => !!role && WRITE_ROLES.includes(role);

function Login({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [err, setErr] = useState('');
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr('');
    const res = await fetch(API + '/auth/sign-in/email', {
      method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) onDone(); else setErr('Sign-in failed — check credentials.');
  }
  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', background: '#0A2540' }}>
      <form onSubmit={submit} style={{ background: '#fff', padding: 32, borderRadius: 12, width: 340 }}>
        <h1 style={{ fontSize: 20 }}>TwinMOS Admin</h1>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" required style={{ ...input, width: '100%', marginBottom: 10 }} />
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" required style={{ ...input, width: '100%', marginBottom: 10 }} />
        <button style={{ ...btn, width: '100%' }}>Sign in</button>
        {err && <p role="alert" style={{ color: '#B00020' }}>{err}</p>}
      </form>
    </div>
  );
}

type AuditRow = { id: number; action: string; entity: string; entityId: string; actorId: string | null; requestId: string | null; ip: string | null; createdAt: string };
function AuditLog() {
  const { data, error, loading } = useAsync<{ items: AuditRow[] }>(() => apiGet('/admin/audit'), []);
  return (
    <div>
      <h1>Audit log</h1>
      <p style={{ color: '#5E7691' }}>Last 100 mutations across all modules (admin role required).</p>
      {error ? <Err error={error} /> : null}
      {loading ? <p>Loading…</p> : data ? (
        <Table head={['When', 'Action', 'Entity', 'Actor', 'Request']}>
          {data.items.map((row) => (
            <tr key={row.id}>
              <td style={td}>{new Date(row.createdAt).toLocaleString()}</td>
              <td style={td}><b>{row.action}</b></td>
              <td style={td}>{row.entity} #{row.entityId}</td>
              <td style={td}>{row.actorId ?? '—'}</td>
              <td style={{ ...td, color: '#5E7691', fontSize: 12 }}>{row.requestId ?? '—'}</td>
            </tr>
          ))}
        </Table>
      ) : null}
      {data && data.items.length === 0 && <Empty text="No audit rows yet." />}
    </div>
  );
}

const MODULES = [
  { key: 'dashboard', label: 'Dashboard', comp: () => <Dashboard />, minRole: 'viewer' },
  { key: 'submissions', label: 'Submissions', comp: (p: { canWrite: boolean; me: Me }) => <Submissions canWrite={p.canWrite} myId={p.me.user?.id} />, minRole: 'viewer' },
  { key: 'rma', label: 'RMA board', comp: (p: { canWrite: boolean }) => <RmaBoard canWrite={p.canWrite} />, minRole: 'viewer' },
  { key: 'jobs', label: 'Applications', comp: (p: { canWrite: boolean }) => <Jobs canWrite={p.canWrite} />, minRole: 'viewer' },
  { key: 'products', label: 'Products', comp: () => <Products />, minRole: 'viewer' },
  { key: 'audit', label: 'Audit log', comp: () => <AuditLog />, minRole: 'admin' },
] as const;

const ROLE_RANK: Record<string, number> = { viewer: 1, author: 2, editor: 3, admin: 4, super_admin: 5 };

function Shell({ me, onSignOut }: { me: Me; onSignOut: () => void }) {
  const [view, setView] = useState<string>('dashboard');
  const writable = canWrite(me.user?.role);
  const visible = MODULES.filter((m) => (ROLE_RANK[me.user?.role ?? 'viewer'] ?? 0) >= (ROLE_RANK[m.minRole] ?? 5));
  const mod = visible.find((m) => m.key === view) ?? visible[0];
  async function signOut() {
    await fetch(API + '/auth/sign-out', { method: 'POST', credentials: 'include' }).catch(() => {});
    onSignOut();
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '100vh' }}>
      <nav style={{ background: '#0A2540', color: '#fff', padding: 20 }}>
        <b>TwinMOS CMS</b>
        <ul style={{ listStyle: 'none', padding: 0, marginTop: 20 }}>
          {visible.map((m) => (
            <li key={m.key} onClick={() => setView(m.key)} style={{ padding: '8px 10px', borderRadius: 6, cursor: 'pointer', background: view === m.key ? 'rgba(255,255,255,.12)' : undefined }}>
              {m.label}
            </li>
          ))}
        </ul>
        <div style={{ marginTop: 28, fontSize: 12.5, opacity: 0.85 }}>
          {me.user?.email}
          <div style={{ marginTop: 4 }}><Badge value={me.user?.role ?? 'unknown'} /></div>
          {!writable && <div style={{ marginTop: 6, opacity: 0.7 }}>read-only role</div>}
          <button onClick={signOut} style={{ ...btn, background: 'rgba(255,255,255,.15)', color: '#fff', marginTop: 10 }}>Sign out</button>
        </div>
      </nav>
      <main style={{ padding: 24, background: '#F5F8FB', minHeight: '100vh' }}>
        {mod.comp({ canWrite: writable, me })}
      </main>
    </div>
  );
}

function App() {
  const [me, setMe] = useState<Me | null>(null);
  const [state, setState] = useState<'loading' | 'anon' | 'authed'>('loading');
  useEffect(() => {
    apiGet<Me>('/auth/get-session')
      .then((d) => { setMe(d); setState(d?.user ? 'authed' : 'anon'); })
      .catch(() => setState('anon'));
  }, []);
  if (state === 'loading') return null;
  if (state === 'anon') return <Login onDone={() => setState('authed')} />;
  return <Shell me={me ?? {}} onSignOut={() => setState('anon')} />;
}

createRoot(document.getElementById('root')!).render(<App />);
