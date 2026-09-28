// TwinMOS Admin — P2 shell: login + role-aware module navigation.
// Modules: Dashboard KPIs · Submissions inbox · RMA board · Job applications ·
// Products (P0 reference) · Audit log. Writes are hidden for viewer role.
// P7+: professional split-screen login with TOTP MFA (login.tsx + mfa.tsx).
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { API, apiGet, fmtDate } from './api';
import Login from './login';
import MfaSetup from './mfa';
import Dashboard from './modules/dashboard';
import Submissions from './modules/submissions';
import RmaBoard from './modules/rma';
import Jobs from './modules/jobs';
import Products from './modules/products';
import Content from './modules/content';
import Media from './modules/media';
import Settings from './modules/settings';
import Translations from './modules/translations';
import Partners from './modules/partners';
import { Badge, Empty, Err, Table, btn, input, td, useAsync } from './ui';

type Me = { user?: { id: string; email: string; role: string; twoFactorEnabled?: boolean } };
const WRITE_ROLES = ['super_admin', 'admin', 'editor', 'author'];
const canWrite = (role?: string) => !!role && WRITE_ROLES.includes(role);
const PUBLISH_ROLES = ['super_admin', 'admin', 'editor'];
const canPublish = (role?: string) => !!role && PUBLISH_ROLES.includes(role);
const ADMIN_ROLES = ['super_admin', 'admin'];
const isAdminRole = (role?: string) => !!role && ADMIN_ROLES.includes(role);

type AuditRow = { id: number; action: string; entity: string; entityId: string; actorId: string | null; requestId: string | null; ip: string | null; at: string };
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
              <td style={td}>{fmtDate(row.at)}</td>
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
  { key: 'content', label: 'Content', comp: (p: { canWrite: boolean; me: Me }) => <Content canPublish={canPublish(p.me.user?.role)} />, minRole: 'viewer' },
  { key: 'media', label: 'Media', comp: (p: { me: Me }) => <Media isAdmin={isAdminRole(p.me.user?.role)} />, minRole: 'viewer' },
  { key: 'partners', label: 'Partners', comp: (p: { me: Me }) => <Partners canManage={isAdminRole(p.me.user?.role)} />, minRole: 'viewer' },
  { key: 'translations', label: 'Translations', comp: (p: { me: Me }) => <Translations isSuperAdmin={p.me.user?.role === 'super_admin'} />, minRole: 'viewer' },
  { key: 'settings', label: 'Settings', comp: (p: { me: Me }) => <Settings canManage={isAdminRole(p.me.user?.role)} isSuperAdmin={p.me.user?.role === 'super_admin'} />, minRole: 'admin' },
  { key: 'submissions', label: 'Leads & quotes', comp: (p: { canWrite: boolean; me: Me }) => <Submissions canWrite={p.canWrite} myId={p.me.user?.id} />, minRole: 'viewer' },
  { key: 'rma', label: 'RMA board', comp: (p: { canWrite: boolean }) => <RmaBoard canWrite={p.canWrite} />, minRole: 'viewer' },
  { key: 'jobs', label: 'Applications', comp: (p: { canWrite: boolean }) => <Jobs canWrite={p.canWrite} />, minRole: 'viewer' },
  { key: 'products', label: 'Products', comp: () => <Products />, minRole: 'viewer' },
  { key: 'audit', label: 'Audit log', comp: () => <AuditLog />, minRole: 'admin' },
] as const;

const ROLE_RANK: Record<string, number> = { viewer: 1, author: 2, editor: 3, admin: 4, super_admin: 5 };

function Shell({ me, onSignOut, onMfaChange }: { me: Me; onSignOut: () => void; onMfaChange: () => void }) {
  const [view, setView] = useState<string>('dashboard');
  const [showMfa, setShowMfa] = useState(false);
  const writable = canWrite(me.user?.role);
  const visible = MODULES.filter((m) => (ROLE_RANK[me.user?.role ?? 'viewer'] ?? 0) >= (ROLE_RANK[m.minRole] ?? 5));
  const mod = visible.find((m) => m.key === view) ?? visible[0];
  async function signOut() {
    await fetch(API + '/auth/sign-out', { method: 'POST', credentials: 'include' }).catch(() => {});
    onSignOut();
  }
  if (showMfa) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F8FB' }}>
        <MfaSetup
          onEnrolled={() => { setShowMfa(false); onMfaChange(); }}
          onSkip={() => setShowMfa(false)}
        />
      </div>
    );
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
          <div style={{ marginTop: 6 }}>
            {me.user?.twoFactorEnabled
              ? <span style={{ fontSize: 12, color: '#7EE2A8' }}>🔐 MFA on</span>
              : <button onClick={() => setShowMfa(true)} style={{ ...btn, background: 'rgba(217,164,65,.25)', color: '#F4D9A0', marginTop: 4, fontSize: 12, padding: '5px 10px' }}>Enable MFA</button>}
          </div>
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
  const [state, setState] = useState<'loading' | 'anon' | 'authed' | 'mfa-setup'>('loading');
  useEffect(() => {
    apiGet<Me>('/auth/get-session')
      .then((d) => {
        setMe(d);
        // signed-in staff without MFA get a one-time enrollment offer (skippable)
        setState(d?.user ? (d.user.role !== 'viewer' && !d.user.twoFactorEnabled ? 'mfa-setup' : 'authed') : 'anon');
      })
      .catch(() => setState('anon'));
  }, []);
  const refreshMe = () => apiGet<Me>('/auth/get-session').then((d) => { setMe(d); setState(d?.user ? 'authed' : 'anon'); }).catch(() => {});
  if (state === 'loading') return null;
  if (state === 'anon') return <Login onDone={refreshMe} />;
  if (state === 'mfa-setup') {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F8FB' }}>
        <MfaSetup onEnrolled={refreshMe} onSkip={() => setState('authed')} />
      </div>
    );
  }
  return <Shell me={me ?? {}} onSignOut={() => setState('anon')} onMfaChange={refreshMe} />;
}

createRoot(document.getElementById('root')!).render(<App />);
