// TwinMOS Admin — P0 shell: login + dashboard + products module (modules land per docs/04 phase plan).
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

const API = import.meta.env.VITE_API_URL ?? '/api/v1'; // dev: vite proxies /api → 127.0.0.1:8787

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
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" required style={{ width: '100%', padding: 8, marginBottom: 10 }} />
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" required style={{ width: '100%', padding: 8, marginBottom: 10 }} />
        <button style={{ width: '100%', padding: 10, background: '#00A3E0', color: '#fff', border: 0, borderRadius: 6 }}>Sign in</button>
        {err && <p role="alert" style={{ color: '#B00020' }}>{err}</p>}
      </form>
    </div>
  );
}

function Dashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [me, setMe] = useState<any>(null);
  useEffect(() => {
    fetch(API + '/auth/get-session', { credentials: 'include' }).then(r => r.json()).then(setMe).catch(() => {});
    fetch(API + '/admin/products', { credentials: 'include' }).then(r => r.json()).then(d => setProducts(d.items ?? [])).catch(() => {});
  }, []);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '100vh' }}>
      <nav style={{ background: '#0A2540', color: '#fff', padding: 20 }}>
        <b>TwinMOS CMS</b>
        <ul style={{ listStyle: 'none', padding: 0, marginTop: 20, opacity: 0.85 }}>
          {['Dashboard', 'Content', 'Catalog', 'Support', 'Channel', 'Careers', 'Media', 'Users', 'Audit', 'Settings'].map(m => <li key={m} style={{ padding: '8px 0' }}>{m}</li>)}
        </ul>
      </nav>
      <main style={{ padding: 24 }}>
        <h1>Dashboard</h1>
        <p>Signed in: {me?.user?.email ?? '—'} ({me?.user?.role ?? '?'})</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, margin: '16px 0' }}>
          {[['Products', products.length], ['Open RMAs', 0], ['New submissions', 0], ['Published', 0]].map(([k, v]) => (
            <div key={String(k)} style={{ border: '1px solid #E2E8F0', borderRadius: 10, padding: 16 }}><b style={{ fontSize: 24 }}>{String(v)}</b><div>{String(k)}</div></div>
          ))}
        </div>
        <h2>Products (reference module)</h2>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead><tr>{['SKU', 'Name', 'Status', 'Updated'].map(h => <th key={h} style={{ textAlign: 'left', borderBottom: '2px solid #E2E8F0', padding: 8 }}>{h}</th>)}</tr></thead>
          <tbody>{products.map((p: any) => (
            <tr key={p.id}><td style={{ padding: 8 }}>{p.sku}</td><td>{p.name}</td><td>{p.status}</td><td>{String(p.updatedAt ?? '')}</td></tr>
          ))}</tbody>
        </table>
      </main>
    </div>
  );
}

function App() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  useEffect(() => {
    fetch(API + '/auth/get-session', { credentials: 'include' })
      .then(r => r.json()).then(d => setAuthed(Boolean(d?.user))).catch(() => setAuthed(false));
  }, []);
  if (authed === null) return null;
  return authed ? <Dashboard /> : <Login onDone={() => setAuthed(true)} />;
}
createRoot(document.getElementById('root')!).render(<App />);
