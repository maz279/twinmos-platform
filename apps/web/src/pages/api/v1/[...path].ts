import type { APIRoute } from 'astro';

const API_BASE = process.env.API_URL || process.env.CMS_URL || 'http://127.0.0.1:8787';

export const ALL: APIRoute = async ({ request, params, url }) => {
  const targetUrl = new URL(`${API_BASE}/api/v1/${params.path || ''}${url.search}`);
  try {
    const forwardHeaders = new Headers(request.headers);
    forwardHeaders.delete('host');

    const body = request.method !== 'GET' && request.method !== 'HEAD'
      ? await request.arrayBuffer()
      : undefined;

    const response = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: forwardHeaders,
      body,
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Proxy error', details: err?.message }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
