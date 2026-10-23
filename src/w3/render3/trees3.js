// trees3.js — the near forest's trees as games draw them (browser layer): leaf-cluster and needle-spray CARDS — alpha-cut quads
// textured with a cluster of leaves or a branch's spray of needles, the way SpeedTree and every open-world game builds a crown —
// about bark-textured trunks and limbs. The textures are drawn here at start-up on a canvas (no image files): an atlas of
// 512-px tiles (a spruce/fir branch's spray, a white pine's plume of long needles in fives, a red maple's cluster of lobed leaves, a
// birch's or aspen's of small toothed ones, and a hardwood's bare winter twigs) and a bark texture (R: the ridged bark of maple,
// spruce and pine; G: a birch's white bark and its dark lenticels). Each tree's colour (its season, its kind, its own shade) tints
// them in the shader (main3 tierMesh), so the seasons work as before.
// The models are in the tiers' unit space: height 0–1 (× the tree's height), across in units of its crown width (× height × wf).
// Every vertex carries tf = (foliage 1 / bark 0, shade, card 1 / solid 0, atlas tile) and a normal BENT outward from the crown — the
// "spherical normals" trick that lights a crown of flat cards as a rounded mass of leaves.
// Cosmetic randomness: a fixed local hash (the same trees every load), never core.rand.

export const ATLAS = { COLS: 4, ROWS: 2, T: 512 };
export const TILE = { SPRUCE: 0, PINE: 1, MAPLE: 2, BIRCH: 3, TWIGS: 4, FIR: 5 };

const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const mk = (w, h) => { if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h); const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const grey = (l, r = 1, g = 1, b = 1) => `rgb(${Math.round(255 * Math.min(1, l * r))},${Math.round(255 * Math.min(1, l * g))},${Math.round(255 * Math.min(1, l * b))})`;

// ---------- the atlas ----------
// (every tile's stem enters at its left edge, mid-height — u 0 — and runs right, so a card's spine maps to u; a tile keeps a clear
// margin, or the mipmaps bleed its neighbour in)
export function drawAtlas() {
  const { COLS, ROWS, T } = ATLAS, cv = mk(COLS * T, ROWS * T), ctx = cv.getContext('2d');
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const at = t => [(t % COLS) * T, Math.floor(t / COLS) * T];
  spray(ctx, ...at(TILE.SPRUCE), mulberry(11), { needle: 15, step: 2.6, perStep: 3, spread: [50, 85], lum: [0.42, 0.95] });
  spray(ctx, ...at(TILE.FIR), mulberry(23), { needle: 17, step: 2.4, perStep: 2, spread: [70, 90], lum: [0.38, 0.9], flat: true });
  plume(ctx, ...at(TILE.PINE), mulberry(37));
  leaves(ctx, ...at(TILE.MAPLE), mulberry(41), 'maple');
  leaves(ctx, ...at(TILE.BIRCH), mulberry(53), 'birch');
  twigs(ctx, ...at(TILE.TWIGS), mulberry(67));
  return cv;
}

// a conifer's branch from above: a main shoot, side shoots alternating forward, their own shoots; needles all round each (spruce:
// a bottle-brush of short stiff needles; fir: flatter, in two rows), the new growth at the tips paler
function spray(ctx, ox, oy, r, o) {
  const T = ATLAS.T, M = 0.04 * T;
  const env = u => 0.42 * T * Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.04)), 0.7) * Math.min(1, u / 0.12);   // (half-width about the shoot)
  const shoots = [];   // [x0, y0, x1, y1, width, tip lum boost]
  const main = []; for (let k = 0; k <= 24; k++) { const u = 0.02 + 0.95 * k / 24; main.push([ox + M + u * (T - 2 * M), oy + T / 2 + Math.sin(u * 5.3) * 4 + u * 8]); }
  for (let k = 0; k + 1 < main.length; k++) shoots.push([...main[k], ...main[k + 1], 5 - 3.5 * k / 24, k > 19 ? 1 : 0]);
  let side = 1;
  for (let u = 0.07; u < 0.9; u += 0.04 + 0.025 * r()) {
    side = -side; const k = Math.min(23, Math.floor(u * 24)), [bx, by] = main[k];
    const ang = (32 + 22 * r()) * Math.PI / 180, len = Math.max(12, env(Math.min(0.97, u + 0.08)) / Math.sin(ang) * (0.7 + 0.35 * r()));
    const ex = bx + Math.cos(ang) * len, ey = by + side * Math.sin(ang) * len; shoots.push([bx, by, ex, ey, 2.4, 1]);
    if (len > 55) for (const f of [0.4, 0.7]) {   // (its own side shoots, outward)
      const sx = bx + (ex - bx) * f, sy = by + (ey - by) * f, a2 = Math.min(1.45, ang + 0.45 + 0.3 * r()), l2 = len * (1 - f) * (0.55 + 0.3 * r());
      shoots.push([sx, sy, sx + Math.cos(a2) * l2, sy + side * Math.sin(a2) * l2, 1.4, 1]);
    }
  }
  // the bare shoots, under their needles
  for (const [x0, y0, x1, y1, w] of shoots) { ctx.strokeStyle = grey(0.38, 1.05, 0.95, 0.85); ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); }
  // the needles: along each shoot, base to tip (the tip's over the base's), forward-pointing, both sides (and, for spruce, on top)
  ctx.lineWidth = 1.6;
  for (const [x0, y0, x1, y1, , tipB] of shoots) {
    const L = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / L, uy = (y1 - y0) / L, n = Math.max(2, Math.floor(L / o.step));
    for (let q = 0; q <= n; q++) {
      const f = q / n, px = x0 + (x1 - x0) * f, py = y0 + (y1 - y0) * f, tip = tipB ? Math.max(0, (f - 0.6) / 0.4) : 0;
      for (let k = 0; k < o.perStep; k++) {
        const sgn = k % 2 ? 1 : -1, a = (o.spread[0] + (o.spread[1] - o.spread[0]) * r()) * Math.PI / 180 * sgn * (k === 2 ? 0.35 : 1);
        const ca = Math.cos(a), sa = Math.sin(a), dx = ux * ca - uy * sa, dy = ux * sa + uy * ca, l = o.needle * (0.7 + 0.5 * r()) * (o.flat && k === 2 ? 0.6 : 1);
        const lum = o.lum[0] + (o.lum[1] - o.lum[0]) * r() * (0.75 + 0.25 * tip) + 0.18 * tip;
        ctx.strokeStyle = grey(lum, 0.86 + 0.06 * tip, 1, 0.8 + 0.05 * r()); ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + dx * l, py + dy * l); ctx.stroke();
      }
    }
  }
}

// a white pine's branch end: a twig and its twiglets, each ending in a soft tuft of long thin needles (in fives) fanned forward
function plume(ctx, ox, oy, r) {
  const T = ATLAS.T, cy = oy + T / 2, tips = [];
  ctx.strokeStyle = grey(0.4, 1.05, 0.95, 0.85);
  const tw = (x0, y0, x1, y1, w) => { ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); };
  const x0 = ox + 0.03 * T, mx = ox + 0.6 * T; tw(x0, cy, mx, cy - 6, 5); tips.push([mx, cy - 6, 0, 1.25]);
  for (let k = 0; k < 11; k++) {
    const f = 0.12 + 0.88 * k / 10, bx = x0 + (mx - x0) * f, by = cy - 6 * f, s = k % 2 ? 1 : -1;
    const a = s * (0.45 + 0.5 * r()), l = T * (0.09 + 0.1 * r()) * (1.15 - 0.45 * f);
    const ex = bx + Math.cos(a) * l, ey = by + Math.sin(a) * l; tw(bx, by, ex, ey, 2.4); tips.push([ex, ey, a * 0.6, 0.8 + 0.3 * r()]);
  }
  ctx.lineWidth = 2;
  for (const [x, y, a0, sz] of tips) {
    for (let q = 0; q < 46; q++) {   // (a tuft: needles from along the twiglet's last few cm, fanning ±50° about it, drooping a little)
      const a = a0 + (r() - 0.5) * 1.75, l = T * (0.14 + 0.1 * r()) * sz, bx = x - Math.cos(a0) * 18 * r(), by = y - Math.sin(a0) * 18 * r();
      const ex = bx + Math.cos(a) * l, ey = by + Math.sin(a) * l + l * 0.1, lum = 0.48 + 0.47 * r();
      ctx.strokeStyle = grey(lum, 0.84, 1, 0.92); ctx.beginPath(); ctx.moveTo(bx, by); ctx.quadraticCurveTo(bx + Math.cos(a) * l * 0.6, by + Math.sin(a) * l * 0.6, ex, ey); ctx.stroke();
    }
  }
}

// a branchlet of leaves: a stem from the left, side twigs alternating along it (a birch's drooping), leaves along every twig and one
// at its end — a red maple's (three big pointed lobes and two small, toothed: opposite pairs) or a birch's or aspen's (small, toothed,
// pointed); each leaf its own shade and tint (the shader's tree colour × these: some greener or yellower, fall's mix of reds,
// oranges and yellows on one tree), a paler midrib and veins, a darker rim
function leaves(ctx, ox, oy, r, kind) {
  const T = ATLAS.T, maple = kind === 'maple', cy = oy + 0.5 * T, x0 = ox + 0.03 * T, x1 = ox + 0.8 * T;
  const twigs = [[x0, cy, x1, cy - 4, 4.5]], L = [];
  const leafAt = (x, y, a, s) => L.push({ x, y, a, s, lum: 0.6 + 0.4 * r(), j: (r() - 0.5) * 0.36 });
  const nT = maple ? 7 : 10;
  for (let k = 0; k < nT; k++) {
    const f = 0.12 + 0.78 * k / (nT - 1), bx = x0 + (x1 - x0) * f, by = cy - 4 * f, s = k % 2 ? 1 : -1;
    const a = s * (0.75 + 0.5 * r()) + (maple ? 0 : 0.2), l = T * (maple ? 0.22 + 0.12 * r() : 0.22 + 0.13 * r()) * (1.15 - 0.4 * f);
    twigs.push([bx, by, bx + Math.cos(a) * l, by + Math.sin(a) * l, 2]);
  }
  for (const [ax, ay, bx, by, w] of twigs) {
    const len = Math.hypot(bx - ax, by - ay), ang = Math.atan2(by - ay, bx - ax), sz = (maple ? 0.085 : 0.05) * T, gap = sz * (maple ? 1.1 : 0.85);
    let side = 1;
    for (let d = w > 3 ? 0.22 * len : 0.25 * len; d < len - gap * 0.3; d += gap) {
      const px = ax + Math.cos(ang) * d, py = ay + Math.sin(ang) * d, la = ang + side * (0.75 + 0.4 * r());
      leafAt(px + Math.cos(la) * sz * 0.55, py + Math.sin(la) * sz * 0.55, la, sz * (0.8 + 0.35 * r()));
      if (maple) leafAt(px + Math.cos(ang - side * 0.9) * sz * 0.55, py + Math.sin(ang - side * 0.9) * sz * 0.55, ang - side * (0.75 + 0.4 * r()), sz * (0.8 + 0.35 * r()));
      side = -side;
    }
    leafAt(bx + Math.cos(ang) * sz * 0.5, by + Math.sin(ang) * sz * 0.5, ang + (r() - 0.5) * 0.4, sz * (0.9 + 0.3 * r()));
  }
  ctx.strokeStyle = grey(0.36, 1.05, 0.95, 0.85);
  for (const [ax, ay, bx, by, w] of twigs) { ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke(); }
  // a maple leaf's outline: lobes at 0 (the tip), ±1.2 and ±2.3 rad round from it, the side lobes nearly as long, the basal small
  const LOBES = [[0, 1], [1.2, 0.88], [-1.2, 0.88], [2.3, 0.45], [-2.3, 0.45]];
  const mapleR = t => { let m = 0; for (const [c, h] of LOBES) { let d = Math.abs(t - c); d = Math.min(d, Math.PI * 2 - d); m = Math.max(m, h * Math.exp(-((d / 0.5) ** 2))); } return 0.4 + 0.6 * m; };
  for (let k = L.length - 1; k > 0; k--) { const q = Math.floor(r() * (k + 1)); [L[k], L[q]] = [L[q], L[k]]; }   // (overlapping in no order)
  for (const l of L) {
    ctx.save(); ctx.translate(l.x, l.y); ctx.rotate(l.a + Math.PI / 2);   // (the leaf's tip toward −y: away from its twig)
    ctx.beginPath();
    const n = 90;
    for (let q = 0; q <= n; q++) {
      const t = q / n * Math.PI * 2 - Math.PI, c = Math.cos(t);
      const rr = maple ? l.s * mapleR(t) * (1 + 0.06 * Math.sin(t * 34)) : l.s * (0.46 + 0.16 * c + 0.38 * Math.max(0, c) ** 4) * (1 + 0.05 * Math.sin(t * 30));
      const px = Math.sin(t) * rr * (maple ? 1 : 0.84), py = -c * rr + l.s * (maple ? 0.12 : 0.15);
      if (q) ctx.lineTo(px, py); else ctx.moveTo(px, py);
    }
    ctx.closePath(); ctx.fillStyle = grey(l.lum, 1 + l.j, 1, 0.86); ctx.fill();
    ctx.strokeStyle = grey(l.lum * 0.6, 1 + l.j, 1, 0.86); ctx.lineWidth = 1.3; ctx.stroke();
    ctx.strokeStyle = grey(Math.min(1, l.lum * 1.18), 1 + l.j, 1, 0.86); ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.moveTo(0, l.s * 0.5); ctx.lineTo(0, -l.s * 0.8); ctx.stroke();
    if (maple) for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, l.s * 0.2); ctx.lineTo(s * l.s * 0.72, -l.s * 0.3); ctx.moveTo(0, l.s * 0.28); ctx.lineTo(s * l.s * 0.45, l.s * 0.45); ctx.stroke(); }
    else for (let v = -0.4; v < 0.5; v += 0.22) for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, l.s * v); ctx.lineTo(s * l.s * 0.32, l.s * (v - 0.22)); ctx.stroke(); }
    ctx.restore();
  }
}

// a hardwood's bare twigs (winter): a limb end branching again and again, finer each time
function twigs(ctx, ox, oy, r) {
  const T = ATLAS.T;
  const br = (x, y, a, l, w, d) => {
    const ex = x + Math.cos(a) * l, ey = y + Math.sin(a) * l;
    ctx.strokeStyle = grey(0.5 + 0.25 * r(), 1.04, 1, 0.92); ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(ex, ey); ctx.stroke();
    if (d === 0) return;
    const n = d > 4 ? 2 : 2 + (r() < 0.5 ? 1 : 0);
    for (let k = 0; k < n; k++) {
      let b = a + (k - (n - 1) / 2) * (0.55 + 0.3 * r()) + (r() - 0.5) * 0.35, l2 = l * (0.66 + 0.16 * r());
      const fx = ex + Math.cos(b) * l2, fy = ey + Math.sin(b) * l2;   // (kept inside the tile: bent back toward its middle)
      if (fx < ox + 0.04 * T || fx > ox + 0.96 * T || fy < oy + 0.04 * T || fy > oy + 0.96 * T) { b = Math.atan2(oy + T / 2 - ey, ox + T / 2 - ex); l2 *= 0.5; }
      br(ex, ey, b, l2, Math.max(1.3, w * 0.7), d - 1);
    }
  };
  br(ox + 0.04 * T, oy + 0.5 * T, (r() - 0.5) * 0.1, 0.2 * T, 8, 7);
}

// the bark: R the ridged, furrowed bark of maple, spruce and pine; G a birch's white bark, its dark lenticels and scars (tiles both ways)
export function drawBark() {
  const W = 256, H = 512, a = mk(W, H), b = mk(W, H), A = a.getContext('2d'), B = b.getContext('2d'), r = mulberry(79);
  const wrap = (ctx, fn) => { for (const dx of [-W, 0, W]) for (const dy of [-H, 0, H]) { ctx.save(); ctx.translate(dx, dy); fn(); ctx.restore(); } };
  A.fillStyle = grey(0.55); A.fillRect(0, 0, W, H); A.lineCap = 'round';
  for (let k = 0; k < 260; k++) {
    const x = r() * W, y = r() * H, l = 40 + 160 * r(), w = 1.5 + 4 * r(), dark = r() < 0.6, lum = dark ? 0.2 + 0.15 * r() : 0.62 + 0.2 * r(), wob = (r() - 0.5) * 10;
    wrap(A, () => { A.strokeStyle = grey(lum); A.lineWidth = w; A.beginPath(); A.moveTo(x, y); A.bezierCurveTo(x + wob, y + l / 3, x - wob, y + 2 * l / 3, x + wob * 0.5, y + l); A.stroke(); });
  }
  B.fillStyle = grey(0.93); B.fillRect(0, 0, W, H);
  for (let k = 0; k < 40; k++) { const y = r() * H, h = 8 + 30 * r(), lum = 0.8 + 0.12 * r(); wrap(B, () => { B.fillStyle = grey(lum); B.fillRect(0, y, W, h); }); }   // (paler and greyer bands of peeling bark)
  for (let k = 0; k < 520; k++) { const x = r() * W, y = r() * H, w = 5 + 26 * r(), h = 1.2 + 2.2 * r(), lum = 0.22 + 0.25 * r(); wrap(B, () => { B.fillStyle = grey(lum); B.fillRect(x, y, w, h); }); }   // (the lenticels: dark dashes across)
  for (let k = 0; k < 9; k++) { const x = r() * W, y = r() * H, w = 18 + 30 * r(); wrap(B, () => { B.fillStyle = grey(0.12); B.beginPath(); B.moveTo(x - w, y - w * 0.3); B.quadraticCurveTo(x, y + w * 0.45, x + w, y - w * 0.3); B.quadraticCurveTo(x, y + w * 0.15, x - w, y - w * 0.3); B.fill(); }); }   // (the black chevrons under old branches)
  const ia = A.getImageData(0, 0, W, H).data, ib = B.getImageData(0, 0, W, H).data, out = mk(W, H), O = out.getContext('2d'), od = O.createImageData(W, H);
  for (let i = 0; i < W * H; i++) { od.data[i * 4] = ia[i * 4]; od.data[i * 4 + 1] = ib[i * 4]; od.data[i * 4 + 2] = 0; od.data[i * 4 + 3] = 255; }
  O.putImageData(od, 0, 0); return out;
}

// ---------- the models ----------
function builder() {
  const P = [], N = [], U = [], F = [], R = [];   // (R: each card's own random — which leaves turn first and fall first)
  let nCard = 0;
  const nrm = v => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
  const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
  const vtx = (p, n, u, v, fol, ao, card, tile, r = 0) => { P.push(p[0], p[1], p[2]); N.push(n[0], n[1], n[2]); U.push(u, v); F.push(fol, ao, card, tile); R.push(r); };
  // a card along a spine (points), each point's half-width vector across it; u along the spine, v across (0 one edge, 1 the other);
  // normals from nf(point) — bent, not the card's own
  const card = (spine, half, tile, ao, nf, aoTip = ao) => {
    const m = spine.length - 1, r = hash(++nCard, 77);
    for (let k = 0; k < m; k++) {
      const t0 = k / m, t1 = (k + 1) / m, a0 = ao + (aoTip - ao) * t0, a1 = ao + (aoTip - ao) * t1;
      const A = add(spine[k], half[k], -1), B = add(spine[k], half[k]), C = add(spine[k + 1], half[k + 1], -1), D = add(spine[k + 1], half[k + 1]);
      const q = [[A, t0, 0, a0], [C, t1, 0, a1], [B, t0, 1, a0], [B, t0, 1, a0], [C, t1, 0, a1], [D, t1, 1, a1]];
      for (const [p, u, v, a] of q) vtx(p, nf(p), u, v, 1, a, 1, tile, r);
    }
  };
  // a tapered stem (bark, or solid foliage with fol = 1): u round it, v along it in unit height
  const cyl = (p0, p1, r0, r1, seg, ao, fol = 0, nf = null) => {
    const d = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]], L = Math.hypot(...d), u = d.map(v => v / L);
    const t = Math.abs(u[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0], e = nrm([u[1] * t[2] - u[2] * t[1], u[2] * t[0] - u[0] * t[2], u[0] * t[1] - u[1] * t[0]]);
    const b = [u[1] * e[2] - u[2] * e[1], u[2] * e[0] - u[0] * e[2], u[0] * e[1] - u[1] * e[0]];
    const dir = s => { const g = s / seg * Math.PI * 2; return [e[0] * Math.cos(g) + b[0] * Math.sin(g), e[1] * Math.cos(g) + b[1] * Math.sin(g), e[2] * Math.cos(g) + b[2] * Math.sin(g)]; };
    const slope = (r0 - r1) / L;   // (a cone's normals lean along its axis)
    for (let s = 0; s < seg; s++) {
      const d0 = dir(s), d1 = dir(s + 1), n0 = nf ? null : nrm(add(d0, u, slope)), n1 = nf ? null : nrm(add(d1, u, slope));
      const A = add(p0, d0, r0), B = add(p0, d1, r0), C = add(p1, d0, r1), D = add(p1, d1, r1), v0 = p0[1], v1 = p1[1];
      const q = [[A, n0, s / seg, v0], [C, n0, s / seg, v1], [B, n1, (s + 1) / seg, v0], [B, n1, (s + 1) / seg, v0], [C, n0, s / seg, v1], [D, n1, (s + 1) / seg, v1]];
      for (const [p, n, uu, vv] of q) vtx(p, nf ? nf(p) : n, uu, vv, fol, ao, 0, 0);
    }
  };
  const done = () => ({ position: new Float32Array(P), normal: new Float32Array(N), uv: new Float32Array(U), tf: new Float32Array(F), cr: new Float32Array(R), tris: P.length / 9 });
  return { card, cyl, done, nrm, add };
}
const hash = (i, k) => { const h = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return h - Math.floor(h); };

// red spruce and balsam fir: a narrow spire — whorls of drooping branch sprays about a trunk (each a card, rolled a little, so a
// spire seen from the side shows the sprays' layered shelves, not their edges), a dark solid core where no light gets in (the crown's
// heart: no sky through it), a leader of crossed sprays on top
// (lite: the near tier's farther trees, ~70–250 m — half the whorls, fewer and wider sprays: a third of the triangles, the outline the same)
export function spireCards({ lite = false } = {}, tile = TILE.SPRUCE) {
  const B = builder(), N = lite ? 9 : 17, top = 0.95, wide = lite ? 1.35 : 1;
  const nf = p => B.nrm([p[0], 0.12 + 0.55 * Math.hypot(p[0], p[2]), p[2]]);
  B.cyl([0, 0, 0], [0, top, 0], 0.03, 0.006, 6, 0.7);
  B.cyl([0, 0.13, 0], [0, 0.9, 0], 0.3, 0.02, 9, 0.38, 1, nf);   // (the core)
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1), y = 0.11 + t * 0.78, R = 0.5 * Math.pow(1 - t, 0.9) + 0.06, n = lite ? 4 : 5 + (i % 2), rot = i * 2.3;
    for (let b = 0; b < n; b++) {
      const a = rot + b / n * Math.PI * 2 + (hash(i, b) - 0.5) * 0.6, L = R * (0.82 + 0.3 * hash(i, b + 9)), ca = Math.cos(a), sa = Math.sin(a);
      const droop = (0.035 + 0.07 * (1 - t)) * (0.7 + 0.6 * hash(i, b + 19)), roll = (hash(i, b + 29) - 0.5) * 1.1, w = 0.5 * L * (0.85 + 0.2 * hash(i, b + 39)) * wide;
      const sp = [], hf = [];
      const SEG = lite ? 1 : 2;
      for (let k = 0; k <= SEG; k++) {
        const s = k / SEG, r = 0.02 + L * s;
        sp.push([ca * r, y - droop * s * s + 0.012 * s, sa * r]);
        const ww = w * (0.55 + 0.45 * Math.min(1, s * 2.2));
        hf.push([-sa * Math.cos(roll) * ww, Math.sin(roll) * ww * 0.7, ca * Math.cos(roll) * ww]);
      }
      B.card(sp, hf, tile, 0.5 + 0.35 * t, nf, 0.7 + 0.3 * t);
    }
  }
  for (const a of [0, Math.PI / 2]) {   // (the leader)
    const ca = Math.cos(a), sa = Math.sin(a), w = 0.09;
    B.card([[0, 0.84, 0], [0, 0.92, 0], [0, 1.0, 0]], [[ca * w, 0, sa * w], [ca * w * 0.8, 0, sa * w * 0.8], [ca * w * 0.4, 0, sa * w * 0.4]], tile, 0.85, nf, 1);
  }
  return B.done();
}

// eastern white pine: a long trunk; tiers of limbs held out level from the upper half, each carrying plumes of long needles at its
// end and along it (two or three crossed cards, rounded by their own centre's normals); plumes at the top
export function pineCards({ lite = false } = {}) {
  const B = builder();
  B.cyl([0, 0, 0], [0, 0.97, 0], 0.026, 0.007, lite ? 5 : 7, 0.75);   // (a 24-m white pine ~0.6 m through)
  const add3 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  // (a plume about centre c, pointing along bearing a: four crossed single cards — two near level, two steep — so it reads as a soft
  // rounded tuft from the side and from above; its own centre's normals. Across is in crown widths, up in heights: a pine's crown
  // width is half its height, so the steep cards' rise is halved to keep the tuft round)
  const plume = (c, a, len, ao, seed) => {
    const nf = p => B.nrm([p[0] - c[0] * 0.7, (p[1] - c[1]) * 2.2 + 0.3, p[2] - c[2] * 0.7]);
    const ROLL = lite ? [0, 1.15, -1.15] : [-0.4, 0.4, 1.15, -1.15];
    for (let q = 0; q < ROLL.length; q++) {
      const b = a + (hash(seed, q) - 0.5) * 0.8, ca = Math.cos(b), sa = Math.sin(b), roll = ROLL[q] + (hash(seed, q + 5) - 0.5) * 0.35, w = len * 0.5 * (q > 1 ? 0.8 : 1);
      const rise = (hash(seed, q + 11) - 0.25) * 0.04, s0 = add3(c, [-ca * len * 0.42, -rise * 0.5, -sa * len * 0.42]);
      const hv = [-sa * Math.cos(roll) * w, Math.sin(roll) * w * 0.5, ca * Math.cos(roll) * w];
      B.card([s0, add3(s0, [ca * len, rise, sa * len])], [hv, hv], TILE.PINE, ao, nf, Math.min(1, ao + 0.15));
    }
  };
  const NT = lite ? 6 : 9;
  for (let i = 0; i < NT; i++) {
    const t = i / (NT - 1), y = 0.43 + t * 0.49, n = 4 + (i % 2), reach = (0.5 - t * 0.33) * (0.85 + 0.3 * hash(i, 1)), ao = 0.5 + 0.5 * t;
    for (let b = 0; b < n; b++) {
      if (hash(i, b + 60) < 0.15) continue;   // (a limb lost: the crown's gaps)
      const a = i * 1.37 + b / n * Math.PI * 2 + (hash(i, b) - 0.5) * 0.8, rr = reach * (0.7 + 0.5 * hash(i, b + 20)), ca = Math.cos(a), sa = Math.sin(a);
      const droop = 0.02 * (1 - t);
      B.cyl([0, y - 0.015, 0], [ca * rr * 0.85, y + 0.01 - droop, sa * rr * 0.85], 0.009, 0.004, lite ? 3 : 4, 0.7);
      for (const [f, k] of lite ? [[0.92, 1.15], [0.55, 1]] : [[0.95, 1], [0.68, 0.85], [0.42, 0.7]]) {
        if (rr * f < 0.07) continue;
        plume([ca * rr * f, y + 0.02 - droop * f, sa * rr * f], a + (hash(i, b + 40 + f * 10) - 0.5) * 0.9, (0.19 + 0.07 * hash(i, b + 30 + f * 10)) * (0.8 + 0.2 * k) * (lite ? 1.5 : 1), ao * (0.85 + 0.15 * k), i * 100 + b * 10 + f * 10);
      }
    }
  }
  for (let q = 0; q < 3; q++) plume([0.02, 0.95, 0], q * 2.1, lite ? 0.2 : 0.15, 1, 900 + q);
  return B.done();
}

// red maple, aspen, birch: a trunk forking into limbs and their branches, under a crown of leaf-cluster cards scattered through a few
// overlapping lobes, each card facing out of the crown give or take; in winter the same cards show bare twigs (main3)
export function hardCards({ lite = false } = {}) {
  const B = builder(), NC = lite ? 55 : 130, big = lite ? 1.55 : 1;   // (the lite crown's fewer cards as much leaf: 55 × 1.55² ≈ 130)
  const C0 = [0, 0.68, 0], R = [0.34, 0.27, 0.34];   // (the crown's centre and radii, for its normals)
  const nf = p => B.nrm([(p[0] - C0[0]) / R[0], (p[1] - C0[1]) / R[1] + 0.35, (p[2] - C0[2]) / R[2]]);
  B.cyl([0, 0, 0], [0.01, 0.48, 0], 0.03, 0.02, lite ? 6 : 8, 0.8);   // (a 16-m maple's trunk ~0.6 m through at its foot)
  const lobes = [[0, 0.76, 0, 0.26, 0.18, 0.26]];
  for (let l = 0; l < 4; l++) {
    const a = l * Math.PI / 2 + 0.5, ca = Math.cos(a), sa = Math.sin(a);
    B.cyl([0.01, 0.44, 0], [ca * 0.16, 0.68, sa * 0.16], 0.024, 0.012, 6, 0.75);   // (a limb)
    B.cyl([ca * 0.1, 0.6, sa * 0.1], [Math.cos(a + 0.5) * 0.27, 0.78, Math.sin(a + 0.5) * 0.27], 0.012, 0.005, 4, 0.8);   // (its branches)
    B.cyl([ca * 0.16, 0.68, sa * 0.16], [Math.cos(a - 0.4) * 0.24, 0.9, Math.sin(a - 0.4) * 0.24], 0.011, 0.004, 4, 0.85);
    lobes.push([ca * 0.17, 0.64 + 0.04 * (l % 2), sa * 0.17, 0.2, 0.16, 0.2]);
  }
  for (let q = 0; q < NC; q++) {
    const L = lobes[q % lobes.length], u = hash(q, 1), v = hash(q, 2), w = 0.55 + 0.45 * Math.cbrt(hash(q, 3));   // (most cards near the lobe's skin)
    const th = u * Math.PI * 2, ph = Math.acos(1 - 2 * v), dx = Math.sin(ph) * Math.cos(th), dy = Math.cos(ph) * 0.9 + 0.1, dz = Math.sin(ph) * Math.sin(th);
    const c = [L[0] + dx * L[3] * w, L[1] + dy * L[4] * w, L[2] + dz * L[5] * w], n0 = B.nrm([dx + (hash(q, 4) - 0.5) * 0.9, dy + 0.3, dz + (hash(q, 5) - 0.5) * 0.9]);
    // (the card's spine: across its facing, at a random turn about it)
    const t0 = Math.abs(n0[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0], e1 = B.nrm([n0[1] * t0[2] - n0[2] * t0[1], n0[2] * t0[0] - n0[0] * t0[2], n0[0] * t0[1] - n0[1] * t0[0]]);
    const e2 = [n0[1] * e1[2] - n0[2] * e1[1], n0[2] * e1[0] - n0[0] * e1[2], n0[0] * e1[1] - n0[1] * e1[0]], g = hash(q, 6) * Math.PI * 2;
    const sd = [e1[0] * Math.cos(g) + e2[0] * Math.sin(g), e1[1] * Math.cos(g) + e2[1] * Math.sin(g), e1[2] * Math.cos(g) + e2[2] * Math.sin(g)];
    const ac = [e1[0] * -Math.sin(g) + e2[0] * Math.cos(g), e1[1] * -Math.sin(g) + e2[1] * Math.cos(g), e1[2] * -Math.sin(g) + e2[2] * Math.cos(g)];
    const s = (0.085 + 0.045 * hash(q, 7)) * big, A = B.add(c, sd, -s), Z = B.add(c, sd, s), hv = [ac[0] * s, ac[1] * s, ac[2] * s];
    const ao = 0.45 + 0.4 * Math.max(0, Math.min(1, (c[1] - 0.5) / 0.4)) + 0.15 * w;
    B.card([A, B.add(A, sd, s), Z], [hv, hv, hv], TILE.MAPLE, Math.min(1, ao), nf);
  }
  return B.done();
}
