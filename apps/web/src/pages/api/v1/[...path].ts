import type { APIRoute } from 'astro';

const API_BASE = process.env.API_URL || process.env.CMS_URL || 'http://127.0.0.1:8787';

// Hop-by-hop and body-length headers must never be forwarded: undici rejects a
// forwarded content-length paired with a re-serialized body ("fetch failed"),
// which broke every same-origin POST with a payload (form submits, rma/track).
const STRIP = new Set([
  'host', 'connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization',
  'te', 'trailer', 'transfer-encoding', 'upgrade', 'expect',
  'content-length', 'content-encoding',
]);

export const ALL: APIRoute = async ({ request, params, url }) => {
  const targetUrl = new URL(`${API_BASE}/api/v1/${params.path || ''}${url.search}`);
  try {
    const forwardHeaders = new Headers();
    for (const [key, value] of request.headers.entries()) {
      if (!STRIP.has(key.toLowerCase())) forwardHeaders.set(key, value);
    }

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
