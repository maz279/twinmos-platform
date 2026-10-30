// gzip-capable server wrapper for the Astro standalone build (zero deps).
//
// Why: @astrojs/node standalone sends every response uncompressed. Behind
// the nginx edge this is moot (the edge gzips), but direct-to-node surfaces —
// CI Lighthouse budgets, compose smoke tests, bare previews — pay the full
// ~250KB of text over throttled networks; Lighthouse attributes ~740ms of
// LCP to exactly this. The wrapper buffers each response (SSR pages and
// static text assets are small), gzips compressible types when the client
// advertises support, and corrects content-length before flushing.
process.env.ASTRO_NODE_AUTOSTART ??= "disabled";

const { handler } = await import("./dist/server/entry.mjs");
const { createServer } = await import("node:http");
const { brotliCompressSync, gzipSync } = await import("node:zlib");

const COMPRESSIBLE = /text\/|application\/(json|javascript|xml)|image\/svg/;
const MIN_BYTES = 1024;

const server = createServer((req, res) => {
  const accept = req.headers["accept-encoding"] || "";
  const acceptsBr = accept.includes("br");
  const acceptsGzip = accept.includes("gzip");
  if ((!acceptsBr && !acceptsGzip) || req.method === "HEAD")
    return handler(req, res);

  const origWriteHead = res.writeHead.bind(res);
  const origEnd = res.end.bind(res);
  const origWrite = res.write.bind(res);
  const chunks = [];
  let stashedStatus = 200;
  let stashedHeaders = {};

  res.writeHead = (status, headers) => {
    stashedStatus = status;
    if (headers) stashedHeaders = { ...stashedHeaders, ...headers };
    return res;
  };
  res.write = (chunk, ...rest) => {
    if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    return true;
  };
  res.end = (chunk) => {
    if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    const body = Buffer.concat(chunks);
    const contentType = String(
      (stashedHeaders["content-type"] ?? res.getHeader("content-type")) || "",
    );
    const useCompression =
      COMPRESSIBLE.test(contentType) && body.length >= MIN_BYTES;
    let out = body;
    if (useCompression) {
      if (acceptsBr) {
        out = brotliCompressSync(body, { quality: 5 });
        stashedHeaders["content-encoding"] = "br";
      } else {
        out = gzipSync(body, { level: 6 });
        stashedHeaders["content-encoding"] = "gzip";
      }
    }
    stashedHeaders["content-length"] = String(out.length);
    origWriteHead(stashedStatus, stashedHeaders);
    origEnd(out);
  };

  handler(req, res);
});

const port = Number(process.env.PORT || 4321);
const host = process.env.HOST || "0.0.0.0";
server.listen(port, host, () => {
  console.log(
    `[server.mjs] gzip-wrapped standalone server on http://${host}:${port}`,
  );
});
