async function checkAuth() {
  const res = await fetch('http://127.0.0.1:8787/api/v1/auth/sign-in/email', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'origin': 'http://127.0.0.1:5173',
    },
    body: JSON.stringify({ email: 'admin@twinmos.dev', password: 'admin' }),
  });
  console.log('Status:', res.status);
  const data = await res.json().catch(() => null);
  console.log('Data:', data);
  const setCookie = res.headers.get('set-cookie');
  console.log('Set-Cookie:', setCookie);
}
checkAuth().catch(console.error);
