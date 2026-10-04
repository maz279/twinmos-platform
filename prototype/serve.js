// Minimal static server for the TwinMOS prototype — fallback while the
// shell/Python toolchain is unavailable. Serves this file's directory on 8123.
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = 8123;
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.webp': 'image/webp',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
};

http.createServer(function (req, res) {
  var urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  var file = path.normalize(path.join(ROOT, urlPath));
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(file, function (err, data) {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('404'); }
    var ext = path.extname(file).toLowerCase();
    var headers = { 'Content-Type': MIME[ext] || 'application/octet-stream' };
    // code + pages must always revalidate (dev fallback server)
    if (/\.(html|css|js|json|webmanifest)$/.test(ext) || file.endsWith('sw.js')) {
      headers['Cache-Control'] = 'no-cache, must-revalidate';
    }
    res.writeHead(200, headers);
    res.end(data);
  });
}).listen(PORT, '127.0.0.1', function () {
  console.log('twinmos-proto serving ' + ROOT + ' on http://127.0.0.1:' + PORT + '/');
});
