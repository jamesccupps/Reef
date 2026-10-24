// simhost.mjs — THE HOT BROOK LAKES, LIVE, FOR UNREAL (Node): runs the simulation exactly as the browser view does (its sim worker,
// ue/link/simworker.mjs, at real time with the same ticks) and streams what the first-person world draws to Unreal (AHotBrookLink)
// over a WebSocket on localhost: the clock and the sky (time of day, date, weather, wind, the sun, the air), the fish near the
// walker, the forest's large animals, the ice. Unreal sends the walker's place back ({"cam":[x, y, dist]}, the sim's metres): the sim
// keeps its fine, fish-by-fish detail about where the walker is, as the browser keeps it about where the view looks.
//   node ue/link/simhost.mjs [port 8771]
// The snapshot ("HBS2", little-endian): f64 simT; f32 t (0–1 of a day), yf (0 = March 1), windSpeed (m/s), sun (0–1), airT (°C),
// iceMean (m); u8 weather (0 clear … 3 storm), u8 wind bearing (where it blows FROM, 0–255 a turn clockwise from north), u8×2 pad;
// u32 nFish, nForest; then nFish × 12 fields (f32 x, y, z, yaw, pitch, length cm, species, n, speed m/s; u32 id; f32 school 0/1,
// body depth's multiplier) and nForest × 8 f32 (id, kind, x, y, heading, act, young, length m).
import { Worker } from 'node:worker_threads';
import http from 'node:http';
import crypto from 'node:crypto';
const PORT = +(process.argv[2] || 8771);
const clients = new Set();
let cam = [0, -1000, 60], ready = false, last = performance.now(), waiting = false, nSnap = 0;

// ---------- the sim ----------
const sim = new Worker(new URL('./simworker.mjs', import.meta.url));
sim.on('error', e => console.error('sim worker:', e));
sim.on('message', m => {
  if (m.type === 'loaded') { console.log('sim loaded; starting the lakes…'); sim.postMessage({ type: 'init', cam }); }
  else if (m.type === 'progress') console.log(`  ${m.text} (${m.s.toFixed(1)} s)`);
  else if (m.type === 'ready') { ready = true; console.log(`ready: ${m.NC} columns, ${m.shards} shards — ws://127.0.0.1:${PORT}`); }
  else if (m.type === 'snap') { waiting = false; nSnap++; const b = encode(m); for (const c of clients) send(c, b); if (nSnap % 200 === 1) console.log(`t ${(m.t * 24).toFixed(2)} h, yf ${m.yf.toFixed(3)}, ${m.nf} fish near, ${clients.size} client(s)`); }
  else if (m.type === 'error') console.error('sim:', m.text);
});
// (a tick each 50 ms with the real time passed — the sim limits its own catch-up; one at a time, as the page sends them)
setInterval(() => {
  const now = performance.now(), dt = (now - last) / 1000; last = now;
  if (!ready || waiting) return;
  sim.postMessage({ type: 'tick', dt, cam }); waiting = true;
}, 50);

function encode(m) {
  const fb = m.fish || new Float32Array(0), nf = Math.floor(fb.length / 18), fo = m.forest || new Float32Array(0), nfo = Math.floor(fo.length / 8);
  let ice = 0; if (m.ice && m.ice.length) { for (let i = 0; i < m.ice.length; i++) ice += m.ice[i]; ice /= m.ice.length; }
  const head = 4 + 8 + 6 * 4 + 4 + 8, buf = Buffer.alloc(head + nf * 48 + nfo * 32), fu = new Uint32Array(fb.buffer, fb.byteOffset, fb.length);
  let o = 0; buf.write('HBS2', o, 'ascii'); o += 4; buf.writeDoubleLE(m.simT || m.time || 0, o); o += 8;
  for (const v of [m.t, m.yf, m.windSpeed || 0, m.sun || 0, m.air ?? 0, ice]) { buf.writeFloatLE(+v || 0, o); o += 4; }
  buf.writeUInt8(m.weather | 0, o); buf.writeUInt8(Math.round((((m.windDir || 0) / (2 * Math.PI)) % 1 + 1) % 1 * 256) & 255, o + 1); o += 4;
  buf.writeUInt32LE(nf, o); o += 4; buf.writeUInt32LE(nfo, o); o += 4;
  for (let i = 0; i < nf; i++) {   // (the fish's current place and heading, size, kind, number, speed, id: fishside3's layout, FISH_STRIDE 18)
    const s = i * 18; for (let k = 5; k <= 13; k++) { buf.writeFloatLE(fb[s + k], o); o += 4; }
    buf.writeUInt32LE(fu[s + 15], o); o += 4; buf.writeFloatLE(fb[s + 16], o); o += 4; buf.writeFloatLE(fb[s + 17] || 1, o); o += 4;
  }
  for (let i = 0; i < nfo * 8; i++) { buf.writeFloatLE(fo[i], o); o += 4; }
  return buf;
}

// ---------- the WebSocket server (RFC 6455, localhost only; just what Unreal's client needs) ----------
const server = http.createServer((req, res) => { res.writeHead(200, { 'content-type': 'text/plain' }); res.end('Hot Brook live link: connect with a WebSocket\n'); });
server.on('upgrade', (req, sock) => {
  const key = req.headers['sec-websocket-key']; if (!key) { sock.destroy(); return; }
  const accept = crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
  sock.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + accept + '\r\n\r\n');
  sock.setNoDelay(true); clients.add(sock); console.log('client connected');
  let acc = Buffer.alloc(0);
  sock.on('data', d => {
    acc = Buffer.concat([acc, d]);
    for (;;) {   // (the client's frames: masked; text = JSON, 8 = close, 9 = ping)
      if (acc.length < 2) break;
      const op = acc[0] & 15; let len = acc[1] & 127, p = 2;
      if (len === 126) { if (acc.length < 4) break; len = acc.readUInt16BE(2); p = 4; } else if (len === 127) { if (acc.length < 10) break; len = Number(acc.readBigUInt64BE(2)); p = 10; }
      const masked = acc[1] & 128, mk = masked ? acc.subarray(p, p + 4) : null; if (masked) p += 4;
      if (acc.length < p + len) break;
      const pay = Buffer.from(acc.subarray(p, p + len)); if (mk) for (let i = 0; i < pay.length; i++) pay[i] ^= mk[i & 3];
      acc = acc.subarray(p + len);
      if (op === 1) { try { const j = JSON.parse(pay.toString('utf8')); if (Array.isArray(j.cam) && j.cam.length >= 2) cam = [+j.cam[0], +j.cam[1], +(j.cam[2] ?? 60)]; } catch {} }
      else if (op === 8) { sock.end(); break; }
      else if (op === 9) frame(sock, 10, pay);
    }
  });
  const bye = () => { clients.delete(sock); console.log('client gone'); };
  sock.on('close', bye); sock.on('error', bye);
});
function frame(sock, op, pay) {
  const n = pay.length, h = n < 126 ? Buffer.from([0x80 | op, n]) : n < 65536 ? Buffer.from([0x80 | op, 126, n >> 8, n & 255]) : Buffer.concat([Buffer.from([0x80 | op, 127]), (() => { const b = Buffer.alloc(8); b.writeBigUInt64BE(BigInt(n)); return b; })()]);
  sock.write(Buffer.concat([h, pay]));
}
const send = (sock, b) => { if (!sock.destroyed && sock.writableLength < 8e6) frame(sock, 2, b); };   // (a slow client skips frames, never queues minutes of them)
server.listen(PORT, '127.0.0.1', () => console.log(`live link on ws://127.0.0.1:${PORT} (starting the sim…)`));
