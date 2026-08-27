// Single-origin demo proxy.
//
// Serves the built UI from BUILD_DIR and reverse-proxies API paths to a local
// flow stack, so the whole dashboard is reachable behind one origin (and thus
// one Cloudflare quick tunnel). Dependency-free — Node standard library only.
//
// Configured entirely by environment variables (see demo-tunnel.sh):
//   PROXY_PORT   port this server listens on            (default 9999)
//   BUILD_DIR    directory of the built UI              (default ../../build)
//   KONG_PORT    Supabase Kong (auth/rest/functions)    (default 10010)
//   AGENT_PORT   control-plane agent (api/authorize)    (default 10020)
//   ENC_PORT     config-encryption                      (default 10021)
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.env.PROXY_PORT || '9999', 10);
const BUILD = process.env.BUILD_DIR || path.join(__dirname, '..', '..', 'build');
const KONG = parseInt(process.env.KONG_PORT || '10010', 10);
const AGENT = parseInt(process.env.AGENT_PORT || '10020', 10);
const ENC = parseInt(process.env.ENC_PORT || '10021', 10);

// Path prefix -> local stack port.
const UPSTREAMS = [
  { prefix: '/auth/', port: KONG },
  { prefix: '/rest/', port: KONG },
  { prefix: '/functions/', port: KONG },
  { prefix: '/api/', port: AGENT },
  { prefix: '/authorize/', port: AGENT },
  { prefix: '/graphiql', port: AGENT },
  { prefix: '/v1/encrypt-config', port: ENC },
];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.wasm': 'application/wasm',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

function proxy(req, res, port) {
  const upstream = http.request(
    { host: '127.0.0.1', port, method: req.method, path: req.url, headers: req.headers },
    (up) => {
      res.writeHead(up.statusCode, up.headers);
      up.pipe(res);
    }
  );
  upstream.on('error', (e) => {
    res.writeHead(502, { 'content-type': 'text/plain' });
    res.end('proxy error: ' + e.message);
  });
  req.pipe(upstream);
}

function sendFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'content-type': 'text/plain' });
      res.end('not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const headers = { 'content-type': MIME[ext] || 'application/octet-stream' };
    if (filePath.endsWith('index.html')) {
      headers['cache-control'] = 'no-cache, no-store, must-revalidate';
    } else if (filePath.includes(path.sep + 'static' + path.sep)) {
      headers['cache-control'] = 'public, max-age=31536000';
    }
    res.writeHead(200, headers);
    res.end(data);
  });
}

function serveStatic(req, res) {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  const filePath = path.normalize(path.join(BUILD, urlPath));
  if (!filePath.startsWith(BUILD)) {
    res.writeHead(403, { 'content-type': 'text/plain' });
    res.end('forbidden');
    return;
  }
  fs.stat(filePath, (err, st) => {
    if (!err && st.isFile()) {
      sendFile(res, filePath);
    } else {
      sendFile(res, path.join(BUILD, 'index.html')); // SPA history fallback
    }
  });
}

const server = http.createServer((req, res) => {
  const u = UPSTREAMS.find((x) => req.url === x.prefix || req.url.startsWith(x.prefix));
  if (u) {
    proxy(req, res, u.port);
  } else {
    serveStatic(req, res);
  }
});

server.on('error', (e) => {
  console.error('proxy failed to start: ' + e.message);
  process.exit(1);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(
    'demo proxy on http://127.0.0.1:' + PORT + ' -> kong:' + KONG + ' agent:' + AGENT + ' enc:' + ENC
  );
  console.log('serving ' + BUILD);
});
