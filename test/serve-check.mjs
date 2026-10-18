// test/serve-check.mjs — the dev server (serve.mjs) is localhost-only and locked down.
// Starts it in-process on an ephemeral port (127.0.0.1:0), fires raw requests (no client-side path normalisation),
// asserts status codes / headers, then also runs the real CLI once (`node serve.mjs 0`) and stops everything.
// Run: node test/serve-check.mjs
import http from 'node:http';
import net from 'node:net';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { startServer, CSP } = await import('../serve.mjs');

let fail = 0;
const check = (name, ok, extra = '') => { console.log(`${ok ? ' PASS' : ' FAIL'}  ${name}${extra ? '  — ' + extra : ''}`); if (!ok) fail++; };

// raw GET: the path is sent exactly as given; Host defaults to 127.0.0.1:port
const get = (port, p, host = `127.0.0.1:${port}`, method = 'GET') => new Promise((resolve, reject) => {
  const req = http.request({ host: '127.0.0.1', port, path: p, method, headers: { Host: host }, agent: false }, res => {
    const chunks = []; res.on('data', c => chunks.push(c)); res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString('utf8') }));
  });
  req.on('error', reject); req.setTimeout(5000, () => req.destroy(new Error('timeout'))); req.end();
});

const server = await startServer(0);
const port = server.address().port;
try {
  check('binds 127.0.0.1 only (not every interface)', server.address().address === '127.0.0.1', JSON.stringify(server.address()));
  const root = await get(port, '/');
  check('/ → 200 index.html with the CSP + no-store headers', root.status === 200 && /<html/i.test(root.body) && root.headers['content-security-policy'] === CSP && root.headers['cache-control'] === 'no-store', `${root.status}`);
  check('CSP forbids inline/foreign script and plugins', /script-src 'self'(;|$)/.test(CSP) && CSP.includes("object-src 'none'") && CSP.includes("base-uri 'none'") && !CSP.includes('unsafe-inline'));
  const js = await get(port, '/src/main.js');
  const w3 = await get(port, '/w3.html');
  check("the 3-D page is cross-origin isolated (COOP + COEP: its sim's shards share memory) and the 2-D page is not", w3.status === 200 && w3.headers['cross-origin-opener-policy'] === 'same-origin' && w3.headers['cross-origin-embedder-policy'] === 'require-corp' && !root.headers['cross-origin-embedder-policy'], `${w3.headers['cross-origin-opener-policy']} / ${w3.headers['cross-origin-embedder-policy']}`);
  check('a module script is served as text/javascript', js.status === 200 && /^text\/javascript/.test(js.headers['content-type'] || ''), js.headers['content-type']);
  const css = await get(port, '/styles.css');
  check('the stylesheet is served as text/css', css.status === 200 && /^text\/css/.test(css.headers['content-type'] || ''), css.headers['content-type']);
  const mjs = await get(port, '/test/smoke.mjs');
  check('.mjs is served as text/javascript', mjs.status === 200 && /^text\/javascript/.test(mjs.headers['content-type'] || ''), mjs.headers['content-type']);
  const head = await get(port, '/index.html', undefined, 'HEAD');
  check('HEAD works and sends no body', head.status === 200 && head.body === '');

  for (const p of ['/src/', '/src', '/test/', '/.claude/'])
    { const r = await get(port, p); check(`directory ${p} → 404 (no listing)`, r.status === 404, `${r.status}`); }
  for (const p of ['/.claude/launch.json', '/.git/HEAD', '/.gitignore', '/src/.hidden', '/%2eclaude/launch.json'])
    { const r = await get(port, p); check(`dot-path ${p} refused`, r.status === 403 || r.status === 404, `${r.status}`); }
  if (process.platform === 'win32') {   // an 8.3 short alias of .claude must not bypass the dot-path rule
    const r = await get(port, '/CLAUDE~1/launch.json'); check('Windows 8.3 alias /CLAUDE~1/launch.json refused', r.status === 403 || r.status === 404, `${r.status}`);
  }
  for (const p of ['/../serve.mjs', '/..%2fserve.mjs', '/%2e%2e/%2e%2e/Windows/win.ini', '/..%5c..%5c..%5cWindows%5cwin.ini',
    '/src/..%5c..%5c..%5c..%5cWindows/win.ini', '/C:/Windows/win.ini', '/C:%5cWindows%5cwin.ini', '//../../Windows/win.ini', '/index.html%00.js', '/%E0%A4%A'])
    { const r = await get(port, p); check(`traversal/garbage ${p} refused`, r.status === 403 || r.status === 404, `${r.status}`); }

  for (const h of ['evil.example', 'evil.example:' + port, 'localhost.evil.example', '127.0.0.1.nip.io', '10.0.0.5:' + port, 'localhost:80:80'])
    { const r = await get(port, '/', h); check(`foreign Host "${h}" rejected (DNS-rebinding guard)`, r.status === 403, `${r.status}`); }
  const noHost = await new Promise(resolve => {   // raw HTTP/1.0 request with NO Host header (http.request always adds one)
    const s = net.connect(port, '127.0.0.1', () => s.end('GET / HTTP/1.0\r\n\r\n')); let d = '';
    s.on('data', c => d += c); s.on('end', () => resolve(d)); s.on('error', () => resolve(d)); s.setTimeout(5000, () => s.destroy());
  });
  check('a request without a Host header is rejected', /^HTTP\/1\.[01] 403/.test(noHost), noHost.split('\r\n')[0]);
  for (const h of ['localhost', 'localhost:' + port, 'LOCALHOST:' + port, '127.0.0.1'])
    { const r = await get(port, '/', h); check(`local Host "${h}" accepted`, r.status === 200, `${r.status}`); }
  const post = await new Promise(res => { const q = http.request({ host: '127.0.0.1', port, path: '/', method: 'POST', headers: { Host: 'localhost' }, agent: false }, r => { r.resume(); r.on('end', () => res(r.statusCode)); }); q.on('error', () => res(0)); q.end('x'); });
  check('non-GET/HEAD methods → 405', post === 405, `${post}`);
} finally {
  await new Promise(r => { server.close(r); server.closeAllConnections?.(); });
}

// the CLI: `node serve.mjs 0` prints its URL, serves, and stops on kill
await new Promise(resolve => {
  const child = spawn(process.execPath, [path.join(ROOT, 'serve.mjs'), '0'], { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] });
  let out = '', done = false;
  const finish = (ok, why) => { if (done) return; done = true; clearTimeout(timer); check('CLI `node serve.mjs 0` starts on localhost and serves /', ok, why); child.kill(); resolve(); };
  const timer = setTimeout(() => finish(false, 'timed out: ' + out.trim()), 10000);
  child.stdout.on('data', async d => {
    out += d; const m = /http:\/\/localhost:(\d+)/.exec(out); if (!m || done) return;
    try { const r = await get(+m[1], '/', 'localhost:' + m[1]); finish(r.status === 200, `port ${m[1]} → ${r.status}`); } catch (e) { finish(false, e.message); }
  });
  child.on('exit', code => finish(false, `exited early (${code}): ${out.trim()}`));
});
const bad = await new Promise(resolve => { const c = spawn(process.execPath, [path.join(ROOT, 'serve.mjs'), 'nope'], { stdio: 'ignore' }); c.on('exit', code => resolve(code)); });
check('CLI rejects a non-numeric port with a usage error', bad === 2, `exit ${bad}`);

console.log(`\n${fail === 0 ? 'SERVE OK — localhost-only static server behaves' : fail + ' SERVE CHECK(S) FAILED'}`);
process.exit(fail === 0 ? 0 : 1);
