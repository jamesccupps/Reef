#!/usr/bin/env node
// serve.mjs — zero-dependency static file server for Synapse Reef (Node is already required for the tests, and
// `python3` isn't available on stock Windows). ES modules can't load from file://, so the app must be served.
//
//   node serve.mjs          → http://localhost:8000
//   node serve.mjs 9000     → custom port (0 = pick a free one)
//
// Same behaviour as serve.py: binds 127.0.0.1 only; rejects a Host header that isn't localhost/127.0.0.1 (blocks DNS
// rebinding); no directory listings ("/" serves index.html, any other directory is 404); refuses dot-paths (/.git,
// /.claude) — checked on the real on-disk path too, so Windows 8.3 aliases (CLAUDE~1) and junctions can't sneak past;
// blocks traversal; sends no-store + nosniff + the page's Content-Security-Policy.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
export const HOST = '127.0.0.1';
// keep in sync with the <meta http-equiv="Content-Security-Policy"> in index.html and CSP in serve.py
export const CSP = "default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; " +
  "font-src https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; " +
  "base-uri 'none'; form-action 'none'";
export const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.md': 'text/plain; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
};
const ALLOWED_HOSTS = new Set(['localhost', '127.0.0.1']);

// Host must be localhost / 127.0.0.1, optionally with a numeric :port
export function hostAllowed(host) {
  if (typeof host !== 'string') return false;
  const m = /^([a-z0-9.\-]+)(?::(\d{1,5}))?$/.exec(host.trim().toLowerCase());
  return !!m && ALLOWED_HOSTS.has(m[1]);
}

// map a request URL to a file under root, or null (→ 404). Rejects any segment that is empty-dot/dotfile ('.', '..',
// '.git'), contains ':' (drive letters, NTFS streams) or NUL; both '/' and '\' count as separators.
export function resolveRequest(rawUrl, root = ROOT) {
  let p = String(rawUrl || '/'); const q = p.search(/[?#]/); if (q >= 0) p = p.slice(0, q);
  let dec; try { dec = decodeURIComponent(p); } catch { return null; }
  if (!dec.startsWith('/')) return null;
  const segs = dec.split(/[\\/]/).filter(Boolean);
  if (segs.some(s => s.startsWith('.') || s.includes(':') || s.includes('\0'))) return null;
  if (segs.length === 0) segs.push('index.html');               // "/" → the app
  const full = path.resolve(root, ...segs);
  const rel = path.relative(root, full);
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) return null;
  return full;
}

// the real (long-name, link-resolved) path must also stay inside root and contain no dot-segment
function realInside(full, realRoot) {
  let real; try { real = fs.realpathSync.native(full); } catch { return null; }
  const rel = path.relative(realRoot, real);
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) return null;
  if (rel.split(path.sep).some(s => s.startsWith('.'))) return null;
  return real;
}

export function createServer(root = ROOT) {
  const realRoot = fs.realpathSync.native(root);
  return http.createServer((req, res) => {
    const base = { 'Cache-Control': 'no-store', 'Content-Security-Policy': CSP, 'X-Content-Type-Options': 'nosniff' };
    const fail = (code, msg, extra = {}) => {
      res.writeHead(code, { ...base, 'Content-Type': 'text/plain; charset=utf-8', 'Content-Length': Buffer.byteLength(msg), ...extra });
      res.end(req.method === 'HEAD' ? undefined : msg);
    };
    if (!hostAllowed(req.headers.host)) return fail(403, 'Forbidden: this server only answers to localhost.\n');
    if (req.method !== 'GET' && req.method !== 'HEAD') return fail(405, 'Method not allowed\n', { Allow: 'GET, HEAD' });
    const full = resolveRequest(req.url, root);
    const real = full && realInside(full, realRoot);
    let st = null; if (real) { try { st = fs.statSync(real); } catch { st = null; } }
    if (!st || !st.isFile()) return fail(404, 'Not found\n');   // includes every directory (no listings)
    res.writeHead(200, { ...base, 'Content-Type': MIME[path.extname(real).toLowerCase()] || 'application/octet-stream', 'Content-Length': st.size });
    if (req.method === 'HEAD') return res.end();
    const s = fs.createReadStream(real);
    s.on('error', () => res.destroy());
    s.pipe(res);
  });
}

// start listening on HOST:port; resolves to the server (server.address().port has the real port when port = 0)
export function startServer(port = 8000, root = ROOT) {
  const server = createServer(root);
  return new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, HOST, () => { server.off('error', reject); resolve(server); }); });
}

const isMain = process.argv[1] && path.resolve(process.argv[1]).toLowerCase() === fileURLToPath(import.meta.url).toLowerCase();
if (isMain) {
  const arg = process.argv[2], port = arg == null ? 8000 : Number(arg);
  if (!Number.isInteger(port) || port < 0 || port > 65535) { console.error(`usage: node serve.mjs [port]   (got "${arg}")`); process.exit(2); }
  startServer(port).then(server => {
    const p = server.address().port;
    console.log(`Synapse Reef  ->  http://localhost:${p}   (also http://127.0.0.1:${p}; Ctrl+C to stop)`);
    const stop = () => { server.close(() => process.exit(0)); server.closeAllConnections?.(); };
    process.on('SIGINT', stop); process.on('SIGTERM', stop);
  }, err => { console.error(`could not listen on ${HOST}:${port} — ${err.code || err.message}`); process.exit(1); });
}
