// species.js — the eight fish of a Maine lake: data + senses + drawing. Pure (no DOM); draw() only calls a put() callback.
import { WORLD, ENV, TIME, littoralX, bedY } from './config.js';
import { prepBio } from './bioenergetics.js';
import { hsl, clamp, ACT_LABELS, layoutLen } from './core.js';

const W = WORLD.W, H = WORLD.H, HREF = WORLD.DEPTH_REF;   // (depth sensors read against the 14.6-m reference column)
// a start position in the water column at x: between fractions a…b of the local depth (the real lakes' depth varies along
// the slice — a fixed floor would put fish under the bed of the shallows)
const inColumn = (R, x, a, b) => { const bed = bedY(x); return { x, y: Math.max(6, Math.min(bed - 4, bed * R(a, b))) }; };

// x biased toward the shallow littoral shelves near each shore — where shelf-dwelling
// fish (minnows, sunfish) naturally congregate. ~62% land on a shelf, the rest spread out.
// littoralX(R): a random littoral x in any water body (config.js — the landscape's 0–3.5 m water)


// ---------- sensory helpers ----------
function tgt(agent, t, range, inp, i) {
  if (t) {
    const ang = Math.atan2(t.item.y - agent.y, t.item.x - agent.x) - agent.heading;
    inp[i] = Math.sin(ang); inp[i + 1] = Math.cos(ang); inp[i + 2] = clamp(1 - t.dist / range, 0, 1);
  } else { inp[i] = 0; inp[i + 1] = 0; inp[i + 2] = 0; }
}
// the nearer of two sensed targets (either may be null)
const nearer = (p, q) => !p ? q : !q ? p : (p.dist < q.dist ? p : q);
function wallProx(a) {
  const dx = Math.cos(a.heading), dy = Math.sin(a.heading); let t = Infinity;
  if (dx > 1e-6) t = Math.min(t, (W - a.x) / dx); else if (dx < -1e-6) t = Math.min(t, (0 - a.x) / dx);
  if (dy > 1e-6) t = Math.min(t, (H - a.y) / dy); else if (dy < -1e-6) t = Math.min(t, (0 - a.y) / dy);
  return clamp(1 - t / 70, 0, 1);
}

// ---------- generic scalable fish sprite ----------
function fishColors(agent, sp, light) {
  const eF = clamp(agent.energy, 0.12, 1);   // the reserve 0..1 (condition): a starving fish fades
  // dark at night, bright at noon — and colour drains with the light (scotopic vision: at night a fish reads as a dim,
  // greyish silhouette, not a glowing saturated sprite against near-black water). Mirrored by render.js fishLook() for
  // the GL path, whose sprites are built at full light.
  const dim = 0.30 + 0.70 * light;
  const L = (sp.lbase + eF * sp.lrange) * dim, h = agent.hue, s = sp.sat * (0.35 + 0.65 * light);
  return {
    body: hsl(h, s, L),
    belly: hsl(h, Math.max(8, s - 14), Math.min(90, L + 17)),
    back: hsl(h, Math.min(100, s + 8), Math.max(4, L - 11)),
    head: hsl(h, s, Math.min(84, L + 8)),
    eye: [12, 16, 20],
  };
}
// ---------- pixel-fill helpers (stay solid at any scale) ----------
// ell(tn, p): the ellipse half-height at along-body position tn∈[-1(tail)..+1(snout)], raised to power p
// (p<1 = fuller/rounder, p>1 = slimmer/pointier). Per-species `profile(tn)` returns [topMul, bellyMul] of Hh so a
// body can be asymmetric (deep-bellied carp, big-headed catfish) and shaped (slender pike spindle, round sunfish disc).
const ell = (tn, p) => Math.pow(Math.max(0, 1 - tn * tn), p);
const TAU = Math.PI * 2;
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };   // smoothstep
function fillBody(put, L, Hh, su, colFn, wave, prof) {
  for (let u = -L; u <= L + 1e-6; u += su) {
    const tn = u / L, e = Math.sqrt(Math.max(0, 1 - tn * tn)), ws = wave(u);
    const p = prof ? prof(tn) : null, vmT = Hh * (p ? p[0] : e), vmB = Hh * (p ? p[1] : e);   // back (top) vs belly (bottom)
    for (let v = -vmT; v <= vmB + 1e-6; v += su) { const vm = v < 0 ? vmT : vmB; put(u, v + ws, colFn(v, vm, u), 1); }
  }
}
// a 1-D line of texels (fin rays, gill cover, mouth) — steps along the segment at the fill resolution
function putLine(put, x0, y0, x1, y1, su, col, al = 1) {
  const dx = x1 - x0, dy = y1 - y0, n = Math.max(1, Math.ceil(Math.hypot(dx, dy) / su));
  for (let i = 0; i <= n; i++) { const f = i / n; put(x0 + dx * f, y0 + dy * f, col, al); }
}
// fade (optional): fins are membranes that THIN toward their margin — mode 1 fades toward vertex C (a fin whose base is
// the edge AB and whose tip is C: dorsal, pectoral), mode 2 fades away from vertex A (a fin attached at A: the tail).
// k = how much of the alpha is lost at the margin. Mode 0 = the old flat fill.
function fillTri(put, ax, ay, bx, by, cx, cy, su, col, al = 1, fade = 0, k = 0.55) {
  const minx = Math.min(ax, bx, cx), maxx = Math.max(ax, bx, cx), miny = Math.min(ay, by, cy), maxy = Math.max(ay, by, cy);
  const d = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy); if (Math.abs(d) < 1e-6) return;
  for (let x = minx; x <= maxx; x += su) for (let y = miny; y <= maxy; y += su) {
    const a = ((by - cy) * (x - cx) + (cx - bx) * (y - cy)) / d, b = ((cy - ay) * (x - cx) + (ax - cx) * (y - cy)) / d;
    if (a >= -0.03 && b >= -0.03 && a + b <= 1.03) {
      const m = fade === 1 ? Math.min(1, Math.max(0, 1 - a - b)) : fade === 2 ? Math.min(1, Math.max(0, 1 - a)) : 0;
      put(x, y, col, al * (1 - k * m));
    }
  }
}
function fillDisc(put, cx, cy, r, su, col) {
  for (let x = -r; x <= r; x += su) for (let y = -r; y <= r; y += su) if (x * x + y * y <= r * r) put(cx + x, cy + y, col, 1);
}
function fillEllipse(put, cx, cy, rx, ry, su, col) {
  for (let x = -rx; x <= rx; x += su) for (let y = -ry; y <= ry; y += su) if ((x / rx) ** 2 + (y / ry) ** 2 <= 1) put(cx + x, cy + y, col, 1);
}

// ---------- generic solid fish with traveling-wave swimming ----------
const _ONE_MORPH = { fin: 1, eye: 1, body: 1 };   // default when no per-fish morphology is supplied
function drawFish(put, P, c, o) {
  const m = o.morph || _ONE_MORPH;                // heritable morphology: fin (caudal/pectoral size) · eye (radius) · body (depth)
  const L = P.L, Hh = P.Hh * m.body, scale = o.scale || 2;
  // draw step ≈ 1 sprite px at sprite resolutions ≥ 14 px/unit (0.07 at 14, 0.035 at 28, 0.0175 at 56), so the higher-
  // resolution sprites render.js builds for close-ups carry real extra DETAIL, not just bigger dabs. Identical to the old
  // step at the base resolution (14) and for small scales.
  const su = Math.max(Math.min(0.07, 0.98 / scale), Math.min(0.55, 0.8 / scale));
  // o.still: the straight, fins-at-rest pose. The GL path builds ONE such sprite per fish and swims it in FRAG_FISH, which
  // applies exactly this wave + tail swing per pixel (keep the two in step), instead of a sprite per beat frame × effort.
  const still = !!o.still, drive = still ? 0 : (o.drive || 0), ph = still ? 0 : o.beat;
  const amp = still ? 0 : Hh * (0.09 + 0.20 * drive);       // gentle undulation (grows with effort) — a slow glide, not a buzz
  // a sine wave travelling head -> tail, larger toward the tail
  const wave = u => Math.sin((u / L) * 1.5 - ph) * amp * (u < 0 ? 1 + (-u / L) * 0.9 : 0.4);

  const T = P.tail, tl = T.len * m.fin, tsp = T.spread * m.fin, x0 = -L, tb = wave(x0), tip = tb + (still ? 0 : Math.sin(ph) * Hh * (0.35 + 0.5 * drive));
  // caudal fin (tail) — forked TRANSLUCENT membrane (al<1 → water shows through) + brighter fin RAYS along the edges. Two
  // lobes meeting in a notch (P.tail.fork = notch depth as a fraction of the fin length: deep on minnows, shallow on the
  // round-tailed sunfish/catfish); it was one flat triangle, which read as a paper flag at close range.
  const fork = T.fork != null ? T.fork : 0.3, nx = x0 - tl * (1 - fork);
  fillTri(put, x0 + 0.2, tb, x0 - tl, tip - tsp * 1.4, nx, tip, su, c.back, 0.72, 2, 0.6);   // upper lobe, thins toward its edge
  fillTri(put, x0 + 0.2, tb, x0 - tl, tip + tsp * 1.4, nx, tip, su, c.back, 0.72, 2, 0.6);   // lower lobe
  putLine(put, x0 + 0.2, tb, x0 - tl, tip + tsp * 1.4, su, c.back, 0.85);
  putLine(put, x0 + 0.2, tb, x0 - tl, tip - tsp * 1.4, su, c.back, 0.85);
  putLine(put, x0 + 0.2, tb, x0 - tl * (1 - fork * 0.4), tip + tsp * 0.75, su, c.back, 0.45);   // mid-lobe rays (clear of the notch)
  putLine(put, x0 + 0.2, tb, x0 - tl * (1 - fork * 0.4), tip - tsp * 0.75, su, c.back, 0.45);
  // dorsal fin — translucent, with a ray to the peak. Position/width/height per species (P.dorsalX/W/H): pike's sits
  // FAR BACK near the tail; sunfish/carp carry a long-based sail; bass/minnow a mid single fin.
  if (P.dorsal) {
    const dx = (P.dorsalX != null ? P.dorsalX : 0.04) * L, dw = (P.dorsalW != null ? P.dorsalW : 0.24) * L, dh = P.dorsalH != null ? P.dorsalH : 1.7;
    fillTri(put, dx - dw, -Hh * 0.75 + wave(dx - dw), dx + dw * 1.15, -Hh * 0.7 + wave(dx + dw * 1.15), dx, -Hh * dh + wave(dx), su, c.back, 0.74, 1, 0.55);   // thins toward the tip
    // spines/rays fanning from the base to the fin edge (the membrane between them reads as a real fin, not a flat flag)
    for (const f of [-0.75, -0.25, 0.3, 0.85]) {
      const bx = dx + f * dw, tx = dx + (f - 0.35) * dw * 0.55, ty = -Hh * (dh - 0.12 * Math.abs(f));
      putLine(put, bx, -Hh * 0.74 + wave(bx), tx, ty + wave(tx), su, c.back, 0.5);
    }
  }
  // pectoral fin (beats with effort) — translucent
  const fin = still ? 0 : Math.sin(ph * 1.2) * Hh * (0.22 + 0.4 * drive) * m.fin;
  fillTri(put, L * 0.32, Hh * 0.35 + wave(L * 0.32), L * 0.04, Hh * 0.35 + wave(L * 0.04), L * 0.2, Hh * 1.05 + fin + wave(L * 0.2), su, c.body, 0.66, 1, 0.6);   // thins toward its tip
  // body (drawn over fin roots) — SMOOTH counter-shading: a continuous vertical gradient dark-back → mid-body →
  // light-belly (the old hard 3-band split read as blocky pixel art), times a faint diagonal SCALE texture so the
  // flank has a subtle iridescent grain rather than a flat fill. Colours are numeric [r,g,b], so we lerp/scale them.
  const mix = (p, q, f) => [p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f, p[2] + (q[2] - p[2]) * f];
  // SPECIES MARKINGS + SCALES. Markings (P.pattern) are coarse and drawn at every resolution, so species read apart at mid
  // zoom; the scale lattice (P.scales: period p, depth k, in fish units) only on the close-up tiers (≥ ~26 px/unit), where a
  // scale spans ≥ 5 px — at the base tier it would alias into moiré. Smooth functions of (u, v) only: no randomness.
  const pat = P.pattern, sc = scale >= 26 ? P.scales : null;
  const blot = (x, y) => Math.sin(x * 1.7 + Math.sin(y * 2.3)) * Math.sin(y * 1.9 + Math.sin(x * 1.3));   // smooth pseudo-noise, ~[-1,1]
  const along = (u0, u1, u) => sstep(u0 - 0.25, u0 + 0.25, u) * (1 - sstep(u1 - 0.25, u1 + 0.25, u));   // fades a marking in/out along the body
  fillBody(put, L, Hh, su, (v, vm, u) => {
    const n = vm > 0 ? v / vm : 0;                          // -1 (top/back) .. +1 (bottom/belly)
    let base = n <= 0 ? mix(c.back, c.body, clamp(n + 1, 0, 1))  // back → body over the upper half
                      : mix(c.body, c.belly, clamp(n, 0, 1));    // body → belly over the lower half
    let k = 1 + (P.scaleTex || 0.05) * Math.sin(u * 2.6 - v * 1.7) * Math.cos(v * 2.4);   // broad scale grain (coarser on carp)
    if (pat === 'vbars') {  // perch: 6–8 bold dark saddle bars over a yellow flank, fading toward the pale belly
      const s = 0.5 + 0.5 * Math.cos(u * TAU / (L * 0.28) + 0.6);
      k *= 1 - 0.34 * sstep(0.5, 0.92, s) * (1 - sstep(0.0, 0.7, n)) * along(-L * 0.9, L * 0.5, u);
    } else if (pat === 'mottle') { // catfish: dark blotches over the back and flanks, smooth skin
      k *= 1 - 0.24 * sstep(0.25, 0.6, blot(u * 2.1, v * 2.9)) * (1 - sstep(0.1, 0.6, n));
    } else if (pat === 'pumpkin') {   // pumpkinseed: faint bars, an orange breast, orange speckles over an olive-gold flank and
                                      // wavy blue-green lines across the cheek
      const s = 0.5 + 0.5 * Math.cos(u * TAU / (L * 0.34));
      k *= 1 - 0.16 * sstep(0.55, 0.95, s) * (1 - sstep(-0.1, 0.55, n)) * along(-L * 0.85, L * 0.3, u);
      base = mix(base, [238, 136, 44], 0.48 * sstep(0.1, 0.8, n) * sstep(-0.5, 0.4, u / L));
      base = mix(base, [226, 128, 48], 0.5 * sstep(0.55, 0.8, blot(u * 3.7, v * 4.1)) * (1 - sstep(0.4, 0.8, Math.abs(n))) * along(-L * 0.85, L * 0.3, u));
      const ch = along(L * 0.36, L * 0.86, u), w1 = Math.abs(n - (-0.12 + 0.07 * Math.sin(u * 9))), w2 = Math.abs(n - (0.2 + 0.07 * Math.sin(u * 9 + 1.5)));
      base = mix(base, [70, 160, 168], 0.6 * ch * (1 - sstep(0.03, 0.07, Math.min(w1, w2))));
    } else if (pat === 'shiner') {    // golden shiner: a brassy sheen and the strongly DOWN-CURVED lateral line that dips toward the belly
      base = mix(base, [228, 190, 96], 0.28 * (1 - Math.abs(n)));
      const t = u / L, nl = 0.34 - 0.4 * ((t + 0.1) / 0.75) ** 2;
      k *= 1 - 0.2 * (1 - sstep(0.025, 0.06, Math.abs(n - nl))) * along(-L * 0.9, L * 0.62, u);
    } else if (pat === 'sucker') {    // white sucker: plain olive-brown over a cream belly, faint dusky smudges along the flank
      k *= 1 - 0.12 * sstep(0.35, 0.8, blot(u * 1.1, v * 0.7)) * (1 - sstep(0.15, 0.7, n)) * along(-L * 0.9, L * 0.5, u);
    } else if (pat === 'silver') {    // white perch: an unmarked silvery flank under an olive-grey back
      base = mix(base, [206, 214, 210], 0.32 * (1 - Math.abs(n)) * sstep(-0.7, 0.1, n));
    } else if (pat === 'smbars') {    // smallmouth bass: 9–15 faint, narrow vertical bars on a bronze flank
      const s = 0.5 + 0.5 * Math.cos(u * TAU / (L * 0.2) + 0.4);
      k *= 1 - 0.18 * sstep(0.6, 0.95, s) * (0.6 + 0.4 * blot(u * 2.3, v * 3.7)) * (1 - sstep(0.15, 0.85, n)) * along(-L * 0.9, L * 0.32, u);
    } else if (pat === 'chain') {     // chain pickerel: a net of dark chain-links over a green-gold flank
      base = mix(base, [190, 178, 92], 0.22 * (1 - Math.abs(n)));
      const gv0 = v / 0.27 + 0.3 * Math.sin(u * 3.1 + v * 1.7), row = Math.floor(gv0), fv = gv0 - row;
      const ou = u / 0.55 + 0.28 * Math.sin(v * 5.3 + u * 2.2) + (row & 1) * 0.5, fu = ou - Math.floor(ou);
      const edge = Math.min(Math.min(fu, 1 - fu) * 0.5, Math.min(fv, 1 - fv));   // distance to the link's outline (links ~2× long as tall)
      k *= 1 - 0.5 * (1 - sstep(0.035, 0.08, edge)) * (1 - sstep(0.55, 0.85, Math.abs(n))) * along(-L * 0.95, L * 0.5, u);
    }
    if (sc) {                      // overlapping scales: staggered rows of round scales, each with a darker rim on its rear (tail) side
      const rh = sc.p * 0.8, row = Math.floor(v / rh), cu = u / sc.p + (row & 1) * 0.5;
      const fu = cu - Math.floor(cu) - 0.5, fv = (v / rh - row - 0.5) * 0.8, d = Math.hypot(fu, fv);
      k *= 1 - sc.k * sstep(0.3, 0.5, d) * (fu < 0 ? 1 : 0.35) * (1 - 0.6 * Math.abs(n)) * along(-L * 0.98, L * 0.62, u);
    }
    return [base[0] * k, base[1] * k, base[2] * k];
  }, wave, P.profile);
  // gill cover (operculum) — a faint curved seam behind the head that flares subtly with the beat (breathing)
  { const gx = L * 0.30, gf = 0.5 + 0.5 * Math.sin(ph * 1.4); putLine(put, gx, -Hh * 0.52 + wave(gx), gx - 0.18, Hh * 0.56 + wave(gx), su, c.back, 0.3 + 0.12 * gf); }
  // opercular "ear" spot — the dark flap mark behind the gill cover (sunfish/centrarchid signature)
  if (P.earSpot) {
    fillDisc(put, L * 0.32, -Hh * 0.16 + wave(L * 0.32), Hh * 0.2, su, mix(c.back, [16, 20, 24], 0.65));
    if (Array.isArray(P.earSpot)) fillDisc(put, L * 0.32 - Hh * 0.13, -Hh * 0.16 + wave(L * 0.32 - Hh * 0.13), Hh * 0.08, su, mix(c.back, P.earSpot, 0.8));   // its bright rear tip
  }
  // snout — a solid ROUNDED nose that blunts the body's pointed tip (the old separate dabs read as a dotted needle at
  // close-up resolutions; a triangle read as a bird's beak); longer, flatter "duckbill" on the pike
  const sn = (P.snout || 0) * 0.42, wL = wave(L);
  if (sn > 0) fillEllipse(put, L - 0.1, wL * 0.92, 0.14 + sn * 0.28, Hh * 0.19, su, c.body);   // mostly inside the head: it only blunts the tip
  // mouth line — a short dark seam ending inside the nose tip (an upturned one on the shiner; the white sucker's mouth is
  // UNDER its snout: fleshy, pale sucking lips)
  if (P.upMouth) putLine(put, L * 0.9, -Hh * 0.02 + wave(L * 0.9), L + sn * 0.25, wL * 0.9 - Hh * 0.16, su, c.back, 0.5);
  else putLine(put, L * 0.92, Hh * 0.08 + wave(L * 0.92), L + sn * 0.25, wL * 0.9 + Hh * 0.02, su, c.back, 0.5);
  if (P.suckerMouth) fillEllipse(put, L * 0.9, Hh * 0.5 + wave(L * 0.9), 0.2, Hh * 0.13, su, mix(c.belly, [214, 160, 150], 0.45));
  // barbels (catfish) — whiskers as continuous lines (they were rows of separate dots)
  if (P.barbels) for (const [y0, y1, al] of [[Hh * 0.3, Hh * 1.0, 0.6], [Hh * 0.18, Hh * 0.55, 0.5], [-Hh * 0.1, -Hh * 0.55, 0.45]])
    putLine(put, L + sn * 0.5, y0 + wL, L + sn * 0.5 + 1.5, y1 + wL, su, c.belly, al);
  // eye — radius PROPORTIONAL to body depth (the old flat 0.7-unit floor made a slim fish's eye absurdly large). Where it
  // spans enough sprite px (close-up tiers) it gets a gold-tinted iris ring around the pupil; a catch-light glint on top.
  const er = Math.max(0.16, Hh * 0.22 * m.eye), ex = L * 0.58, ey = -Hh * 0.32 + wave(ex);
  // (P.eyeBar: the pickerel's dark "teardrop" bar down from the eye; smallmouth: dark bars radiating back from the eye)
  if (P.eyeBar) for (const d of [-0.06, 0, 0.06]) putLine(put, ex + d, ey + er, ex - 0.1 + d, Hh * 0.62 + wave(ex), su, c.back, 0.75);
  if (P.pattern === 'smbars') for (const dy of [-0.1, 0.18, 0.42]) putLine(put, ex - er, ey + Hh * dy * 0.3, L * 0.33, ey + Hh * dy, su, c.back, 0.42);
  if (er * scale >= 6) { fillDisc(put, ex, ey, er, su, P.eyeCol ? mix(c.back, P.eyeCol, 0.75) : mix(c.back, [196, 158, 70], 0.55)); fillDisc(put, ex, ey, er * 0.64, su, c.eye); }
  else fillDisc(put, ex, ey, er, su, P.eyeCol ? mix(c.eye, P.eyeCol, 0.35) : c.eye);
  fillDisc(put, ex + er * 0.3, ey - er * 0.3, Math.max(0.08, er * 0.28), su, [222, 230, 236]);   // catch-light
}

// LIFE HISTORY IN YEARS. A sim year is TIME.YEAR_LEN s; spawning cooldowns are written as yr(n). Since the bioenergetics
// (2026-10-13) the physiology runs on the real calendar — one sim year is a real year of growth — so lifespans, ages at
// maturity and growth are the real ones (BIO above): fish grow and mature at the pace their food and temperature allow.
const yr = n => n * TIME.YEAR_LEN;


// ============================================================
//  PHYSIOLOGY + LIFE HISTORY — published data (bioenergetics 2026-10-13)
// ============================================================
// `bio`: the Wisconsin bioenergetics parameter set, copied byte-exact from Fish Bioenergetics 4.0's Parameters_official.csv
// (github.com/jim-breck/FB4; Deslauriers et al. 2017); field names are FB4's. `bioJuv`: FB4's juvenile set where one exists
// (used until the fish matures). `lw`: W(g) = a·L(cm)^b — the published standard-weight (Ws) equations (or a state-average
// regression where no Ws exists), converted from mm. (`bioJuv` applies to young-of-year — the schools and fish in their
// first year — as the published juvenile sets were fit to age-0 fish.) `vb`: a von Bertalanffy curve through Michigan state-average length-at-
// age (Schneider, Laarman & Gowing 2000, Table 9.1) — only to give a fish of a known age a plausible starting length.
// Lengths are TOTAL LENGTH in cm.
//   Lhatch  length of a larva at swim-up (the fry school's starting size); sHatch egg → swim-up survival
//   L0      the length at which a young-of-year school's survivors RECRUIT as followed individuals (agents) if they reach it
//           in their first summer (fast growers: fatheads that mature at age 0, solitary young bass and pike); the rest
//           recruit the next spring as yearlings (FRY in config) — about the late-YOY / age-1 length (Michigan averages)
//   Lref    a typical adult length (sprite scale; size-scaled behaviour is relative to it)
//   Lmat    length at maturity, females (LmatM males: Ontario Freshwater Fishes Life History Database; perch: all females
//           mature by 160 mm, Schneider 1984); matMinAge the earliest age (s); maxAge (s) the longest life
//   M       adult natural mortality (yr⁻¹) from the published longevity estimator M = 5.4/tmax (Hamel & Cope 2022) or
//           field studies (bass: Beamesderfer & North 1995; pike: Pierce et al. 1995) — BIOE.M_OTHER of it is applied as the
//           hazard from causes the lake doesn't simulate (disease, parasites, herons/ospreys/otters, angling)
//   gut     largest meal, fraction of body mass (pike take prey of 15–25 %; others 3–10 %; carp/minnows are stomachless)
//   gerMul  the species' gastric-evacuation speed relative to the 22-species mean (BIOE.GER)
//   gsiF/M  ripe gonads, fraction of body mass (females / males) — built from food before spawning, shed at spawning
//   fec     eggs per spawning female = a·L(cm)^b — the published length–fecundity regressions, converted from mm
//   Lzoo    below this length a fish eats zooplankton whatever its adult diet; Lpisc the length piscivory begins
//   gapeR   mouth gape / total length; depthR body depth / total length (gape limitation: prey depth ≤ gape)
//   vuln    how catchable the fish is as PREY (× the predator's capture success): soft-rayed, fusiform fish are taken most
//           easily; deep-bodied, spiny or armoured ones escape, jam or are rejected far more often — esocids caught and
//           preferred fathead minnows over bluegill (Wahl & Stein 1988), bullheads' locking pectoral spines deter
//           predators, spiny-rayed perch and bass are handled with more misses than soft-rayed prey (prior where unmeasured)
//   uilt    upper incipient lethal temperature (°C); o2Lethal acute lethal dissolved O₂ (mg/L at 25 °C; ×e^0.055/°C — Moss &
//           Scott 1961, Downing & Merkens 1957 — so far less under ice), but never below o2Ice: the lethal O₂ found in
//           NATURAL winterkills under the ice (Cooper & Washburn 1946, accepted by Doudoroff & Shumway 1970 over caged-fish
//           values) — the cold-water extrapolation alone made centrarchids and esocids ~2× too tolerant (Maine report)
// (prior) marks a literature value not yet checked against a primary source.
const yrs = n => n * TIME.YEAR_LEN;
export const BIO = {
  // THE MAINE SET (2026-10-15; docs/reports/Maine lakes ponds and streams.md): the fish of an eastern Maine warm-water
  // lake like Hot Brook — golden shiner, pumpkinseed, yellow perch, white sucker, brown bullhead, white perch, smallmouth
  // bass and chain pickerel. Five of them have no bioenergetics model of their own; each borrows the nearest published set
  // (stated per species), and each surrogate's known bias is noted where it has one.
  minnow: {   // GOLDEN SHINER (Notemigonus crysoleucas) — FB4 "Dace" (He 1986; Trudel & Boisclair 1994): no golden shiner model
              // exists. The dace set's respiration is ~2× a measured standard rate for 5.3-g shiners (131 mg O₂/kg/h, temperature
              // unstated — Beecham et al. 2009): flagged, not corrected
    bio: { CEQ: 2, CA: 0.36, CB: -0.31, CQ: 2.3, CTO: 26, CTM: 29, REQ: 2, RA: 0.0148, RB: -0.2, RQ: 2.1, RTO: 29, RTM: 32, ACT: 1,
      SDA: 0.15, EGEQ: 1, FA: 0.4, EXEQ: 1, UA: 0.1, PREDEDEQ: 1, ED: 5522, src: 'He 1986; Trudel & Boisclair 1994 (FB4 dace) — golden shiner stand-in' },
    lw: { a: 0.01023, b: 3.07 }, vb: { Linf: 20, k: 0.25, t0: -0.1 },   // FishBase Bayesian W–L; growth (prior — no northern VB found): ~4.8, 8.2, 10.8, 12.8 cm at 1–4 (common length 14.4)
    Lhatch: 0.5, sHatch: 0.3, L0: 5, Lref: 11, Lmat: 6.5, LmatM: 6, matMinAge: yrs(1), maxAge: yrs(7), matureAge: yrs(1.5), M: 0.8,   // matures at 5–7 cm, most in the second year (Jones et al. 1978); 5 yr max (MDIFW) – 9 (FishBase) → M = 5.4/7
    gut: 0.05, gerMul: 1.0, gsiF: 0.08, gsiM: 0.02,   // stomachless cyprinid; per batch
    fec: { a: 1.13, b: 3.07 },   // per BATCH ≈ 110 eggs per g of female (no fitted equation exists): a 10-cm, 12-g shiner ~1,300 a batch, ~4,000 over a
                                 //   season of several bouts — California 2,700–4,700 a season (CalFish); big pond fish 10,000–20,000 (culture profile)
    Lzoo: 0, Lpisc: Infinity, gapeR: 0.07, depthR: 0.25, uilt: 35, o2Lethal: 0.7, o2Ice: 0.2, vuln: 1.0,   // deep, compressed body; small upturned mouth; tolerates 35 °C; "primary forage for bass, pickerel" (MDIFW); survives 0.2–0.3 mg/L under ice — with bullheads the best survivors of Michigan winterkills (Cooper & Washburn 1946)
  },
  sunfish: {  // PUMPKINSEED (Lepomis gibbosus) — FB4 "Bluegill sunfish" adult + juvenile (Kitchell et al. 1974): no pumpkinseed model
              // exists. Bluegill respiration runs 1.2–1.7× the routine O₂ uptake measured on 30-g pumpkinseed (Roberts 1964) —
              // a pumpkinseed on this set pays extra maintenance (flagged; one study is too thin to correct on)
    bio: { CEQ: 2, CA: 0.182, CB: -0.274, CQ: 2.3, CTO: 27, CTM: 36, REQ: 2, RA: 0.0154, RB: -0.2, RQ: 2.1, RTO: 36, RTM: 40, ACT: 1,
      SDA: 0.172, EGEQ: 2, FA: 0.158, FB: -0.222, FG: 0.631, EXEQ: 2, UA: 0.0253, UB: 0.58, UG: -0.299, PREDEDEQ: 1, ED: 4186, src: 'Kitchell et al. 1974 (FB4 bluegill adult) — pumpkinseed stand-in' },
    bioJuv: { CTO: 31, CTM: 37, RTO: 37, RTM: 41, src: 'Kitchell et al. 1974 (FB4 bluegill juvenile)' },
    lw: { a: 0.011429, b: 3.237 }, vb: { Linf: 22, k: 0.2, t0: -0.1 },       // Ws pumpkinseed (FSA WSlit); Ontario 3.3–5.2, 5.8–7.5, 7.6–11.7 cm TL at 1–3 (Copp et al. 2004, SL → TL by Fernando et al. 2018)
    Lhatch: 0.5, sHatch: 0.5, L0: 5, Lref: 13, Lmat: 7.5, LmatM: 6.5, matMinAge: yrs(1.5),   // northern pumpkinseed mature at age 2–3 at ~6–8 cm TL (Copp et al. 2004); 1–2 years earlier and > 20 mm smaller in winterkill ponds (Fox & Keast 1991)
    maxAge: yrs(10), matureAge: yrs(2.5), M: 0.54,
    gut: 0.05, gerMul: 0.5, gsiF: 0.06, gsiM: 0.01,   // per batch (income spawner);   // panfish: 50 % of a meal in 5 h, all in ~21 h (Seaburg & Moyle 1964)
    fec: { a: 35.7, b: 2.12 },   // F ≈ 0.271·TL(mm)^2.12 (fit to Beard 1982): 10 cm → ~4,700, 13 cm → ~8,300 — inside Ontario pumpkinseed's 2,451–10,633
    pelagicFry: 1.8, benthL: 1.8,   // cm: the limnetic phase — Lepomis fry feed in the open water for 30–40 days and return to the weeds at ~15–20 mm
                                    //   (12.5 mm SL), where they eat the littoral's invertebrates (Werner 1967, 1969; Werner & Hall 1988; Beard 1982)
    Lsnail: 8,   // cm TL: the snail crusher — pumpkinseed grow molariform pharyngeal teeth and switch to snails at 59–80 mm SL (74–99 mm TL;
                 //   Mittelbach et al. 1999); below that their pharyngeal jaws can't crack a shell
    Lzoo: 4, Lpisc: Infinity, gapeR: 0.083, depthR: 0.38, uilt: 31.7, o2Lethal: 0.75, o2Ice: 0.35, vuln: 0.35,   // gape 0.083·TL (Fernando et al. 2018); UILT 31.7 °C (ORNL); depth 0.34–0.42; under-ice lethal 0.3–0.4 mg/L (Cooper & Washburn 1946)
  },
  perch: {    // YELLOW PERCH — FB4 "Yellow perch" adult + juvenile (Kitchell et al. 1977)
    bio: { CEQ: 2, CA: 0.25, CB: -0.27, CQ: 2.3, CTO: 23, CTM: 28, REQ: 2, RA: 0.0108, RB: -0.2, RQ: 2.1, RTO: 28, RTM: 33, ACT: 1,
      SDA: 0.15, EGEQ: 2, FA: 0.158, FB: -0.222, FG: 0.631, EXEQ: 2, UA: 0.0292, UB: 0.58, UG: -0.299, PREDEDEQ: 1, ED: 4186, src: 'Kitchell et al. 1977 (FB4 adult)' },
    bioJuv: { CTO: 29, CTM: 32, RTO: 32, RTM: 35, src: 'Kitchell et al. 1977 (FB4 juvenile)' },
    lw: { a: 0.006982, b: 3.23 }, vb: { Linf: 35, k: 0.2, t0: -0.3 },        // Ws Willis et al. 1991; Michigan 8.4, 13.2, 16.5, 19.1, 21.6 cm
    Lhatch: 0.6, sHatch: 0.08, L0: 8, Lref: 20, Lmat: 14, LmatM: 10, matMinAge: yrs(1.5),   // (2026-10-15: 16/12 → 14/10 — females 11–18 cm, males 8–13, Feiner et al. 2017; stunted at age 2 near 9.5 cm)
    maxAge: yrs(11), matureAge: yrs(3), M: 0.50,
    gut: 0.06, gerMul: 1.0, gsiF: 0.20, gsiM: 0.07,   // ♀ GSI 16–26 % (S. Lake Michigan);   // young perch: a Daphnia meal in 6–12 h (Noble 1973) ≈ the general rate
    fec: { a: 0.3487, b: 3.4556 },   // log10 F = −3.9131 + 3.4556·log10 TL(mm), inland Michigan lakes (Schneider 1984): 25 cm → 23,600
    Lzoo: 25, Lpisc: 14, gapeR: 0.09, depthR: 0.234, uilt: 30, o2Lethal: 1.0, o2Ice: 0.35, vuln: 0.6,   // (under-ice lethal 0.3–0.4 mg/L — Cooper & Washburn 1946)   // piscivory from ~15 cm (Paszkowski & Tonn 1994); tank perch 15–19 cm took fatheads ≤ 0.53 TL; zooplankton → benthos → fish: big perch leave the zooplankton (Persson 1986; Hjelm et al. 2000) — most lake perch (< 25 cm) still take it
  },
  sucker: {   // WHITE SUCKER (Catostomus commersonii) — NO published bioenergetics model exists (none in FB4). Stand-in: FB4's yellow
              // perch set (Kitchell et al. 1977), whose 23 °C optimum and 28 °C cutoff match the sucker's 17–24 °C preferred range
              // (Ontario Freshwater Fishes), with a sucker's energy density (~5,000–5,600 J/g; 5,585 measured in Colorado).
              // UNCALIBRATED: a stated assumption
    bio: { CEQ: 2, CA: 0.25, CB: -0.27, CQ: 2.3, CTO: 23, CTM: 28, REQ: 2, RA: 0.0108, RB: -0.2, RQ: 2.1, RTO: 28, RTM: 33, ACT: 1,
      SDA: 0.15, EGEQ: 2, FA: 0.158, FB: -0.222, FG: 0.631, EXEQ: 2, UA: 0.0292, UB: 0.58, UG: -0.299, PREDEDEQ: 1, ED: 5300, src: 'Kitchell et al. 1977 (FB4 yellow perch) — white sucker stand-in, uncalibrated' },
    bioJuv: { CTO: 29, CTM: 32, RTO: 32, RTM: 35, src: 'Kitchell et al. 1977 (FB4 yellow perch juvenile) — young sucker stand-in' },
    lw: { a: 0.006378, b: 3.136 }, vb: { Linf: 52, k: 0.2, t0: -0.3 },       // Ontario log10 W = −5.3314 + 3.1361·log10 TL(mm); growth (prior — no northern VB found): ~12, 19, 25, 30, 34 cm at 1–5 (Ontario adults 25–51 cm, 0.2–1.4 kg)
    Lhatch: 1.2, sHatch: 0.1, L0: 10, Lref: 40, Lmat: 30, LmatM: 26, matMinAge: yrs(2), maxAge: yrs(17), matureAge: yrs(4), M: 0.32,   // matures at 2–3 (♂) and 3–4 yr (♀) in Ontario, 5–8 in Maine (MDIFW); lives 15–25 yr → M = 5.4/17; eggs scattered over stream gravel, no care (sHatch: prior)
    gut: 0.05, gerMul: 1.0, gsiF: 0.12, gsiM: 0.05,   // (prior)
    fec: { a: 0.383, b: 3.136 },   // ≈ 60 eggs per g of female (no fitted equation exists): 30 cm → ~16,000, 40 → ~40,000, 50 → ~81,000 — inside 12,500–140,000 (Ontario LHD; DFO 20,000–50,000)
    Lsnail: 12,   // a sucker's sucking lips and pharyngeal teeth take small snails and clams once it is a few years old (prior)
    Lzoo: 5, Lpisc: Infinity, gapeR: 0.06, depthR: 0.18, uilt: 30, o2Lethal: 1.0, o2Ice: 0.8, vuln: 0.8,   // (under ice: hypoxia-sensitive — a Minnesota pond held < 1 mg/L for 12 days killed them; prior)   // larvae eat plankton, then benthos and detritus; a small suctorial mouth; UILT (prior); soft-rayed
  },
  catfish: {  // BROWN BULLHEAD — FB4 "Brown Bullhead" (Hartman et al. 2017)
    bio: { CEQ: 3, CA: 0.12, CB: -0.225, CQ: 15, CTO: 24, CTM: 26, CTL: 30, CK1: 0.473, CK4: 0.55, REQ: 1, RA: 0.0007, RB: -0.271, RQ: 0.0915, RTO: 0.4055, RTL: 0, RK1: 1, RK4: 0, RK5: 0, ACT: 1, BACT: 0,
      SDA: 0.172, EGEQ: 1, FA: 0.2, EXEQ: 1, UA: 0.07, PREDEDEQ: 1, ED: 6700, src: 'Hartman et al. 2017 (FB4)' },
    // no young-of-year bullhead model exists: FB4's (fit to juveniles and adults) predicts a 1–4-cm bullhead grows < 2 %/day
    // even at full ration, where real YOY bullheads reach 5–7 cm by autumn (~5 %/day). YOY bullheads therefore borrow FB4's
    // largemouth bass set (Rice et al. 1983) — a warmwater fish whose young grow at the bullheads' observed pace — a stated
    // assumption, used only in the first year
    bioJuv: { CEQ: 2, CA: 0.33, CB: -0.325, CQ: 2.65, CTO: 27.5, CTM: 37, CTL: undefined, CK1: undefined, CK4: undefined, REQ: 1, RA: 0.008352, RB: -0.355, RQ: 0.0313, RTO: 0.0196, RTL: 0, RK1: 1, RK4: 0, RK5: 0, ACT: 1, BACT: 0,
      SDA: 0.15848, EGEQ: 1, FA: 0.104, EXEQ: 1, UA: 0.08817, PREDEDEQ: 1, ED: 4184, src: 'Rice et al. 1983 (FB4 largemouth bass) — YOY bullhead stand-in' },
    lw: { a: 0.01069, b: 3.105 }, vb: { Linf: 38, k: 0.25, t0: 0 },          // Ws Bister et al. 2000; ~8.5, 15, 20, 24, 27 cm (prior)
    Lhatch: 1.0, sHatch: 0.6, L0: 6, Lref: 27, Lmat: 19, matMinAge: yrs(2), maxAge: yrs(10), matureAge: yrs(2.5), M: 0.54,
    gut: 0.06, gerMul: 0.5, gsiF: 0.12, gsiM: 0.015,
    fec: { a: 0.274, b: 2.9 },   // no published equation: 1,050–13,800 eggs (Ontario database) ≈ 13 per g → ~3,900 at 27 cm (prior)
    Lzoo: 5, Lpisc: Infinity, gapeR: 0.12, depthR: 0.20, uilt: 36, o2Lethal: 0.3, o2Ice: 0.2, vuln: 0.4,   // bullheads survive 0.2–0.3 ppm under ice (Cooper & Washburn 1946)
    benthL: 1.2,   // cm: young bullheads, guarded in a ball over the bottom, feed there from swim-up — midge larvae and small
                   //   crustaceans (Scott & Crossman 1973); at the generic FRY.BENTH_L (2.5 cm) ~85 % of the fry starved first
  },
  whiteperch: {   // WHITE PERCH (Morone americana) — NO white perch model exists. FB4's yellow perch sets (Kitchell et al. 1977),
                  // adult + juvenile, stand in. (The congener's striped bass rows, Hartman & Brandt 1995, were tried first: their
                  // Thornton–Lessem curve all but stops consumption below ~6 °C — a striper winters in estuaries at 4–6 °C — so a
                  // white perch under the ice lost 0.2–0.4 %/day even at full ration, ~25 % of its mass in 70 days, and the lake's
                  // white perch died out every winter; Maine's are ice-fished and persist in 4–6 m lakes like Hot Brook.) The perch
                  // set's Cmax for a 100-g fish at 18.5 °C (0.061 g/g/d) is near the 0.04 measured for adult white perch (Behr 1993;
                  // the striper set: 0.093). Not represented: white perch's higher routine metabolism, which costs them more over
                  // winter than yellow perch (Johnson & Evans 1991), and their warmer preferendum (29–31 °C) against the perch
                  // set's 28 °C consumption ceiling — flagged
    bio: { CEQ: 2, CA: 0.25, CB: -0.27, CQ: 2.3, CTO: 23, CTM: 28, REQ: 2, RA: 0.0108, RB: -0.2, RQ: 2.1, RTO: 28, RTM: 33, ACT: 1,
      SDA: 0.15, EGEQ: 2, FA: 0.158, FB: -0.222, FG: 0.631, EXEQ: 2, UA: 0.0292, UB: 0.58, UG: -0.299, PREDEDEQ: 1, ED: 4186, src: 'Kitchell et al. 1977 (FB4 yellow perch adult) — white perch stand-in' },
    bioJuv: { CTO: 29, CTM: 32, RTO: 32, RTM: 35, src: 'Kitchell et al. 1977 (FB4 yellow perch juvenile) — young white perch stand-in' },
    lw: { a: 0.012, b: 3.13 }, vb: { Linf: 30, k: 0.3, t0: -0.5 },   // W–L refit so an average 8–10-in Maine fish weighs ~204 g (MDIFW; FishBase's a 0.00447 is 2–4× too light); growth (prior): ~11, 15, 19, 22 cm at 1–4 — food-limited stunting is left to emerge ("a 6-year-old perch may be only 4 inches", MDIFW)
    Lhatch: 0.4, sHatch: 0.05, L0: 8, Lref: 18, Lmat: 9.5, LmatM: 7.6, matMinAge: yrs(1.5), maxAge: yrs(12), matureAge: yrs(3), M: 0.45,   // ♂ 72–80 mm, ♀ 90–98 mm at 2–4 yr (ADW); "even small, slow-growing perch can mature and spawn" (MDIFW); typically 5–7 yr, 17 max in Maine; eggs broadcast over any bottom, no care (sHatch: prior)
    gut: 0.06, gerMul: 1.0, gsiF: 0.15, gsiM: 0.05,   // (prior)
    fec: { a: 10.6, b: 2.82 },   // through MDIFW's ~22,000 eggs at 152 mm and ~150,000 at 30 cm (no fitted equation exists): 10 cm → ~7,000, 20 → ~50,000 (range 20,000–300,000)
    Lzoo: 40, Lpisc: 15, gapeR: 0.10, depthR: 0.30, uilt: 33, o2Lethal: 1.2, o2Ice: 0.5, vuln: 0.55,   // (under ice: between perch and sucker in the winterkill tolerance ranking — prior)   // a planktivore turning generalist, large fish eat small fish including their own young (Couture & Watzin 2008); deep, spiny; hypoxia-sensitive (Hanks & Secor 2011) — UILT and lethal DO not found (prior)
  },
  bass: {     // SMALLMOUTH BASS (Micropterus dolomieu) — FB4 "Smallmouth Bass" (Whitledge et al. 2003), with its published
              // rows for water ≤ 26 °C and > 26 °C (`hot`). Whitledge's respiration (RB −0.756) gives a fish under ~10–25 g a
              // negative energy balance even at full ration — the set belongs above ~30 g (13 cm) — so a smaller bass runs on
              // FB4's largemouth set (Rice et al. 1983; `bioJuv` below `juvW`). (FB4's Shuter & Post row is negative at full
              // ration at every size and temperature tested and is not used.)
    bio: { CEQ: 2, CA: 0.339, CB: -0.31, CQ: 4.2, CTO: 22, CTM: 37, REQ: 2, RA: 0.244, RB: -0.756, RQ: 1.8, RTO: 30, RTM: 37, ACT: 1,
      SDA: 0.15848, EGEQ: 1, FA: 0.104, EXEQ: 1, UA: 0.0882, PREDEDEQ: 1, ED: 4184, hot: { T: 26, CQ: 1.95 }, src: 'Whitledge et al. 2003 (FB4)' },
    bioJuv: { CEQ: 2, CA: 0.33, CB: -0.325, CQ: 2.65, CTO: 27.5, CTM: 37, REQ: 1, RA: 0.008352, RB: -0.355, RQ: 0.0313, RTO: 0.0196, RTL: 0, RK1: 1, RK4: 0, RK5: 0, ACT: 1, BACT: 0,
      SDA: 0.15848, EGEQ: 1, FA: 0.104, EXEQ: 1, UA: 0.08817, PREDEDEQ: 1, ED: 4184, hot: undefined, src: 'Rice et al. 1983 (FB4 largemouth bass) — small smallmouth stand-in' },
    juvW: 30,   // g: below this a smallmouth runs on bioJuv
    lw: { a: 0.00743, b: 3.20 }, vb: { Linf: 56.4, k: 0.14, t0: -0.5 },      // Ws Kolander et al. 1993; Maine L∞ 56.4, k 0.14 (FishBase); t0 through 56–76-mm young by autumn (Dudley & Trial 2014): ~11, 17, 22, 26, 30 cm at 1–5
    Lhatch: 0.9, sHatch: 0.1, L0: 6, Lref: 33, Lmat: 27, LmatM: 23, matMinAge: yrs(2.5), maxAge: yrs(15), matureAge: yrs(4.5), M: 0.36,   // ♂ 3–4 yr, ♀ 4–5 yr at 20–30 cm (MDIFW); swim-up at 9.1 mm (Shuter et al. 1980); M = 5.4/15. (sHatch 0.1: a female deposits only ~⅓ of her ovary — effective 2,000–3,000 eggs/lb against 7,000–8,000 — and ~40 % of nests fail, MDIFW)
    gut: 0.08, gerMul: 0.4, gsiF: 0.08, gsiM: 0.008,   // between panfish (~21 h) and pike (~50 h) at 18–23 °C (Seaburg & Moyle 1964)
    fec: { a: 0.1226, b: 3.20 },   // the ovary's 7,000–8,000 eggs per lb (~16,500/kg, MDIFW) × Ws: 30 cm → ~6,500, 40 cm → ~16,400
    Lzoo: 2, Lpisc: 5, gapeR: 0.115, depthR: 0.24, uilt: 36, o2Lethal: 1.1, o2Ice: 0.8, vuln: 0.6,   // (under ice ~0.6–1.0 mg/L, inferred — no bass among the 15,000 fish that crowded an oxygenated inlet in a Michigan winterkill)   // insects by 20 mm, fish and crayfish by 50 mm; gape 0.120·TL − 1.8 mm (Fernando et al. 2018); UILT 36.0 °C
  },
  pike: {     // CHAIN PICKEREL (Esox niger; Mainers call them pike) — FB4 "Northern pike (adult)" (Bevelhimer et al. 1985) as published.
              // Its curve peaks at 24.6 °C because it was fit to small pike — exactly a pickerel's size and its 24–25.5 °C preferendum.
              // (The report's Cmax × 0.65–0.75 — the pike model overestimates juvenile esocids' consumption by 39–52 %, TAFS 137(6),
              // 2008 — was tried and dropped: cutting consumption without the costs left a pickerel losing mass under the ice even
              // at full ration, where Maine pickerel feed through the winter — anglers catch 1.18 a day on the ice vs 0.49 in summer)
    bio: { CEQ: 4, CA: 0.0244, CB: -0.18, CQ: -0.024, CK1: 0.0125, CK4: -0.000326, REQ: 1, RA: 0.0026445, RB: -0.18, RQ: 0.055, RTO: 0.1222, RTL: 0, RK1: 1, RK4: 0, RK5: 0, ACT: 1, BACT: 0,
      SDA: 0.175, EGEQ: 1, FA: 0.2, EXEQ: 1, UA: 0.0875, PREDEDEQ: 1, ED: 3598, src: 'Bevelhimer et al. 1985 (FB4 northern pike) — chain pickerel stand-in' },
    lw: { a: 0.002624, b: 3.243 }, vb: { Linf: 65, k: 0.2, t0: -0.47 },     // Ws chain pickerel (FSA WSlit); 10–13 cm after the first season, then 6.4–8.9 cm a year, 36–48 cm at 3–5 (MDIFW): ~17, 25, 32, 38, 43 cm at 1–5
    Lhatch: 0.9, sHatch: 0.05, L0: 8, Lref: 43, Lmat: 37, LmatM: 33, matMinAge: yrs(2), maxAge: yrs(9), matureAge: yrs(3.5), M: 0.62,   // mature at age 3–4 at 33–41 cm; Maine ice anglers' fish average 43 cm (MDIFW); M = 5.4/9 – Then et al. 0.66
    gut: 0.18, gerMul: 0.25, gsiF: 0.15, gsiM: 0.025,   // (pike: ♂ GSI 2.5 %, Medford & Mackay 1978; 50 % of a meal in ~20 h, all in ~48–50 h in summer, Diana 1979)
    fec: { a: 0.0630, b: 3.243 },   // 10,000–12,000 eggs per lb (~24,000/kg, MDIFW) × Ws: 43 cm → ~12,500
    Lzoo: 4, Lpisc: 8, gapeR: 0.13, depthR: 0.14, uilt: 30, o2Lethal: 0.5, o2Ice: 0.35, vuln: 0.8,   // (under ice ~0.3–0.4 mg/L — the mud pickerel's, Cooper & Washburn 1946)   // insects first, "strongly piscivorous" after 18–23 cm (MDIFW); Massachusetts fish ≤ 30 cm ate 40–65 % crayfish; UILT: one 28.4 °C value at 17.7 °C acclimation (ORNL) — prior
  },
};
for (const k in BIO) { const d = BIO[k]; prepBio(d.bio); if (d.bioJuv) d.bioJuv = prepBio({ ...d.bio, ...d.bioJuv }); }

// ---------- species factory: derives radii from size, fills defaults ----------
function makeSpecies(cfg) {
  const size = cfg.size;
  const sp = Object.assign({
    eatRadius: 3 + size * 2.2,
    // mate-encounter radius scales with the lake so sparse species can still pair up in a big world
    mateRadius: (10 + size * 5.5) * Math.sqrt(WORLD.AREA_SCALE),
    senseRange: 96 + size * 30,
    drag: 1.4,
    sink: 0, buoyNight: 0, matingCooldown: TIME.YEAR_LEN * 0.5, capture: 0.3,   // capture: a piscivore strike's success
    lbase: 30, lrange: 22, sat: 60,
    ringR: 4 + size * 2.4,
    drift: clamp(0.7 - 0.22 * size, 0.06, 0.6),  // how much the surface current pushes it (weak swimmers more)
    zone: [0.1, 0.9],                            // preferred depth band (fraction of the local water column)
    // thermal/oxygen niche (warm- vs cool-water guilds): tempOpt = the final temperature preferendum (behavioural
    // thermoregulation seeks it; swimming slows below it); o2Crit = the dissolved O₂ (normalised, 1 ≈ 9.5 mg/L) below
    // which feeding and growth are impaired and fish avoid the water (EPA 1986 effect levels; Stewart et al. 1967; Headrick
    // & Carline 1993) — appetite falls to 0 at the lethal level (BIO o2Lethal). Lethality itself is BIO uilt / o2Lethal.
    tempOpt: 23, tempTol: 10, o2Crit: ENV.HYPOXIA,
    spawnT: [16, 24],  // °C window of the (spring/summer) water temperature in which the species spawns (world.js)
  }, cfg, BIO[cfg.key]);
  // the ROUTINE swimming pace (fraction of top cruising speed) the published activity multiplier assumes: the terminal
  // speed of the species' innate cruise thrust (spd' = thrust·accel − drag·spd) — swimming harder costs more (BIOE.SWIM)
  sp.uRoutine = clamp((sp.innate ? sp.innate.cruise : 0.4) * sp.accel / sp.drag / sp.maxSpeed, 0.05, 1);
  return sp;
}

// ============================================================
//  THE EIGHT SPECIES (the Maine set)
// ============================================================
export const SP = {

  // GOLDEN SHINER — the commonest forage minnow of Maine lakes (851 lakes; in 71 % of northeastern lakes): a deep, golden,
  // schooling cyprinid of the weedy shallows that eats Daphnia and other cladocerans, emerging insects and algae, and
  // scatters sticky eggs over plants and filamentous algae in several bouts through the warm summer (20–27 °C).
  minnow: makeSpecies({
    key: 'minnow', name: 'Golden shiner', tag: '#e2c25a', size: 0.85, trophic: 'planktivore', schooling: true, zone: [0.05, 0.55],
    shape: { in: 16, hid: 12 },
    inputLabels: ['plankton \u2220sin', 'plankton \u2220cos', 'plankton near', 'threat \u2220sin', 'threat \u2220cos', 'threat near',
      'school density', 'school \u2220sin', 'school \u2220cos', 'school align', 'energy', 'oxygen', 'O\u2082 gradient', 'wall', 'light@depth', 'temp@depth'],
    // an omnivore: zooplankton and microcrustaceans, insects (emerging and aquatic larvae), algae and plant material — about
    // half its diet in some waters (TPWD; FishBase: "principally plankton, insects and mollusks") — not a pure planktivore:
    // on zooplankton alone the lake's shiners starved every late summer, when the white perch and young-of-year had grazed it down
    diet: { plankton: true, insect: true, larva: true, plants: true },
    maxSpeed: 52, accel: 58, drag: 1.5, maxTurn: 2.6,
    // a prolonged season with several spawning peaks (4–5 in southern culture ponds; the northern count is unknown) — a bout
    // every ~2 weeks while the water is warm enough
    matingCooldown: yr(0.04), pop: { start: 12, min: 5, max: 60 },   // K ≈ 355; ~71 founders — golden shiner 3–8 % of a Maine lake's 60–150 kg/ha of fish (report table): ~400–1,500 shiners of ~8 g a hectare, ~50–200 in this slice (at 36 founders, ~2 % of the biomass, predators ate them out every year)
    tempOpt: 25, tempTol: 9, o2Crit: 0.26, spawnT: [20, 27],   // warm-water; hypoxia-tolerant (survives < 0.3 mg/L under ice); repeat spawner in summer
    innate: { homeDepth: 0.3, depthPull: 0.5, cruise: 0.5, weight: 0.40, school: 0.30, cover: 0.3, forage: 0.5 },   // schools hold in the weedy, mud-bottomed shallows by day (docs/research_notes/Seasonal fish habitat use/)

    sat: 58, lbase: 46, lrange: 16,
    randomHue: (R) => R(42, 54),   // brassy gold
    spawnPos: (R) => inColumn(R, littoralX(R), 0.1, 0.8),  // shiners haunt the weedy shallows
    senses(a, w) {
      const inp = a.act.in;
      tgt(a, w.qSurfaceFood(a), a.senseRange, inp, 0);   // nearest zooplankton OR emerged insect → minnow rises to a hatch
      tgt(a, w.qThreat(a), a.senseRange * 1.1, inp, 3);
      const al = w.allyStats(a, 56);   // (the same radius as the schooling reflex → one query per step)
      inp[6] = al.density; inp[7] = al.cohSin; inp[8] = al.cohCos; inp[9] = al.alignCos;
      inp[10] = clamp(a.energy, 0, 1);
      inp[11] = clamp(w.oxygenAt(a.x, a.y), 0, 1);
      inp[12] = clamp(w.oxygenGrad(a.x, a.y) * 4, -1, 1);
      inp[13] = wallProx(a);
      inp[14] = clamp(w.lightAt(a.x, a.y), 0, 1); inp[15] = clamp((w.tempAt(a.x, a.y) - 10) / 25, 0, 1);
    },
    P: { L: 2.5, Hh: 0.84, snout: 0.8, upMouth: true, dorsal: true, dorsalX: -0.08, dorsalW: 0.18, dorsalH: 1.45, pattern: 'shiner', scales: { p: 0.22, k: 0.14 },
      tail: { len: 1.45, spread: 0.85, sweep: 1.0, fork: 0.5 }, profile: t => { const e = ell(t, 0.62); return [e * 0.86, e * (0.96 + 0.16 * (1 - t * t))]; } },   // deep, compressed, a keeled belly; deeply forked tail
    draw(a, put, t, env, o) { drawFish(put, this.P, fishColors(a, this, env.light), o); },
  }),

  // PUMPKINSEED — Maine's own sunfish (one of its two native centrarchids; in 74 % of northeastern lakes): a deep, round
  // littoral fish that eats insect larvae and, once its pharyngeal teeth harden (BIO Lsnail), snails. Males fan nests in
  // colonies in water under ~1 m (nestD) from 17 to 26 °C and guard the eggs and fry; it spawns more than once a summer.
  sunfish: makeSpecies({
    key: 'sunfish', name: 'Pumpkinseed', tag: '#f2a03c', size: 0.95, trophic: 'omnivore', schooling: false, zone: [0.15, 0.72],
    shape: { in: 13, hid: 10 },
    inputLabels: ['food \u2220sin', 'food \u2220cos', 'food near', 'threat \u2220sin', 'threat \u2220cos', 'threat near',
      'energy', 'oxygen', 'O\u2082 gradient', 'wall', 'depth', 'light@depth', 'temp@depth'],
    diet: { plankton: true, plants: true, larva: true, insect: true, snail: true },
    maxSpeed: 42, accel: 50, maxTurn: 2.3,
    matingCooldown: yr(0.06), pop: { start: 8, min: 4, max: 45 },   // K ≈ 270; ~47 founders
    tempOpt: 28, tempTol: 8, o2Crit: 0.32, spawnT: [17, 26], nestGuard: yr(0.005), nestD: 1.0,   // warm-water littoral centrarchid; preferendum 27.7 °C; nests under 1 m (DFO; Ontario LHD); repeat spawner in summer. The male guards the eggs and yolk-sac larvae; the fry leave the nest at swim-up (~5 mm) — the sim's schools start at swim-up, so ~2 days (was 11: held in the zooplankton-poor shallows, 84 % of them died there)
    innate: { homeDepth: 0.42, depthPull: 0.4, cruise: 0.38, weight: 0.40, cover: 0.40, forage: 0.5 },   // mid littoral, hovers in weed beds
    sat: 50, lbase: 38, lrange: 20,
    randomHue: (R) => R(50, 68),   // olive-gold back and flanks; the orange breast and speckles are the 'pumpkin' markings
    spawnPos: (R) => inColumn(R, littoralX(R), 0.1, 0.85),   // sunfish favour the weedy shelf
    senses(a, w) {
      // the nearest ANIMAL food — zooplankton, an emerged insect, insect larvae on the weeds or the bed, a stretch of bed rich
      // in worms and scuds; weed (a poor food) only when there's none in sight
      const inp = a.act.in, food = nearer(nearer(w.qSurfaceFood(a), w.qLarva(a.x, a.y, a.senseRange)), w.qBed(a)) || w.qPlant(a.x, a.y, a.senseRange);
      tgt(a, food, a.senseRange, inp, 0);
      tgt(a, w.qThreat(a), a.senseRange * 1.1, inp, 3);
      inp[6] = clamp(a.energy, 0, 1);
      inp[7] = clamp(w.oxygenAt(a.x, a.y), 0, 1);
      inp[8] = clamp(w.oxygenGrad(a.x, a.y) * 4, -1, 1);
      inp[9] = wallProx(a); inp[10] = clamp(a.y / HREF, 0, 1);
      inp[11] = clamp(w.lightAt(a.x, a.y), 0, 1); inp[12] = clamp((w.tempAt(a.x, a.y) - 10) / 25, 0, 1);
    },
    P: { L: 2.2, Hh: 1.06, snout: 1, dorsal: true, dorsalX: 0.0, dorsalW: 0.42, dorsalH: 1.5, earSpot: [214, 48, 36], pattern: 'pumpkin', scales: { p: 0.24, k: 0.12 },
      tail: { len: 1.2, spread: 0.95, sweep: 0.85, fork: 0.14 }, profile: t => { const e = ell(t, 0.46); return [e, e * 1.06]; } },   // round deep disc
    draw(a, put, t, env, o) { drawFish(put, this.P, fishColors(a, this, env.light), o); },
  }),

  // YELLOW PERCH — the classic middle link of a temperate lake: young perch school and eat zooplankton, adults eat benthic
  // insect larvae, crayfish and small fish (minnows, fry), and perch of every size are the main prey of pike and bass.
  // Spawns in early spring just after the pike (7–12 °C), draping ribbons of eggs over weeds — no nest, no guarding.
  perch: makeSpecies({
    key: 'perch', capture: 0.15, name: 'Yellow perch', tag: '#d6c04a', size: 1.2, trophic: 'mesopredator', schooling: true, zone: [0.3, 0.9],
    shape: { in: 12, hid: 9 },
    inputLabels: ['food ∠sin', 'food ∠cos', 'food near', 'threat ∠sin', 'threat ∠cos', 'threat near',
      'school density', 'energy', 'oxygen', 'wall', 'light@depth', 'temp@depth'],
    diet: { fish: true, insect: true, larva: true, cray: 0.08 },   // cray: the share of its strikes at a crayfish that land (perch take the small ones)
    maxSpeed: 46, accel: 54, drag: 1.4, maxTurn: 2.3,
    matingCooldown: yr(0.5), pop: { start: 3.5, min: 3, max: 28 },   // K ≈ 190; ~24 founders ≈ 25 kg/ha (yellow perch 27–52 kg/ha — docs/ECOLOGY_RESEARCH.md)
    tempOpt: 23, tempTol: 7, o2Crit: 0.26, spawnT: [7, 12], spawnSide: -1, coldPerf: 0.45,   // cool–warm guild; one early-spring spawn; active under ice
    innate: { homeDepth: 0.86, depthPull: 0.4, cruise: 0.40, weight: 0.40, school: 0.25, pursuit: 0.35, cover: 0.2, spawnGround: 0.4 },   // a near-bottom forager (adult yellow perch feed mostly on benthos)
    sat: 70, lbase: 40, lrange: 20,
    randomHue: (R) => R(46, 64),   // yellow-green with dark bars
    spawnPos: (R) => inColumn(R, littoralX(R), 0.15, 0.85),
    senses(a, w) {
      // the nearest food it can take: a catchable fish, a benthic larva or a stretch of bed rich in worms and scuds (adults
      // forage fish and the bed — and follow the profundal midges and worms offshore once the autumn overturn reoxygenates them)
      const inp = a.act.in, food = nearer(nearer(w.qPrey(a), w.qLarva(a.x, a.y, a.senseRange)), w.qBed(a));
      tgt(a, food, a.senseRange, inp, 0);
      tgt(a, w.qThreat(a), a.senseRange * 1.1, inp, 3);
      inp[6] = w.allyStats(a, 56).density;
      inp[7] = clamp(a.energy, 0, 1);
      inp[8] = clamp(w.oxygenAt(a.x, a.y), 0, 1);
      inp[9] = wallProx(a);
      inp[10] = clamp(w.lightAt(a.x, a.y), 0, 1); inp[11] = clamp((w.tempAt(a.x, a.y) - 10) / 25, 0, 1);
    },
    P: { L: 2.6, Hh: 0.78, snout: 1.1, dorsal: true, dorsalX: -0.05, dorsalW: 0.38, dorsalH: 1.6, pattern: 'vbars', scales: { p: 0.2, k: 0.10 },
      tail: { len: 1.3, spread: 0.9, sweep: 0.9, fork: 0.3 }, profile: t => { const e = ell(t, 0.7), sh = 1 + 0.12 * t; return [e * sh * 0.98, e * sh * 0.92]; } },   // humped back
    draw(a, put, t, env, o) { drawFish(put, this.P, fishColors(a, this, env.light), o); },
  }),

  // WHITE SUCKER — the most widespread fish in Maine's lakes (1,206 of them): a big, long-lived bottom feeder that vacuums
  // insect larvae, worms, scuds, small snails and detritus off the bed with its fleshy, downturned lips. In spring, as the
  // water passes ~10 °C, adults run up inlet and outlet streams at night to scatter eggs over gravel riffles (spawnSide −1:
  // the inflow side). Young suckers are prey for pickerel and bass; adults are too big for anything in the lake but eagles.
  sucker: makeSpecies({
    key: 'sucker', capture: 0.1, name: 'White sucker', tag: '#a8906c', size: 1.9, trophic: 'benthivore', schooling: false, zone: [0.75, 1.0],
    shape: { in: 11, hid: 9 },
    inputLabels: ['food ∠sin', 'food ∠cos', 'food near', 'threat ∠sin', 'threat ∠cos', 'threat near',
      'energy', 'oxygen', 'wall', 'light@depth', 'temp@depth'],
    diet: { detritus: true, larva: true, snail: true },   // benthos and detritus (zooplankton as larvae — below Lzoo); snails past BIO Lsnail
    maxSpeed: 44, accel: 52, drag: 1.3, maxTurn: 2.0, sink: 6,
    matingCooldown: yr(0.5), pop: { start: 0.6, min: 1, max: 1.6 },   // K ≈ 9; ~4 founders (white sucker 12–20 % of a Maine lake's fish biomass: ~1.6–2.7 kg in this slice at 100 kg/ha)
    tempOpt: 21, tempTol: 7, o2Crit: 0.3, spawnT: [10, 15], spawnSide: -1, coldPerf: 0.4,   // prefers 17–24 °C (Ontario); spawning runs from ~10 °C, peaking at 11–15 °C
    innate: { homeDepth: 0.95, depthPull: 0.6, cruise: 0.32, weight: 0.40, spawnGround: 0.5, forage: 0.5 },   // hugs the bed, grazing as it goes
    sat: 30, lbase: 34, lrange: 18,
    randomHue: (R) => R(28, 42),   // olive-brown back, cream belly
    spawnPos: (R) => inColumn(R, R(40, W - 40), 0.5, 0.95),
    senses(a, w) {
      // the nearest bottom food: insect larvae and the bed's worms and scuds, then detritus
      const inp = a.act.in, food = nearer(w.qLarva(a.x, a.y, a.senseRange), w.qBed(a)) || w.qDetritus(a.x, a.y, a.senseRange);
      tgt(a, food, a.senseRange, inp, 0);
      tgt(a, w.qThreat(a), a.senseRange * 1.1, inp, 3);
      inp[6] = clamp(a.energy, 0, 1);
      inp[7] = clamp(w.oxygenAt(a.x, a.y), 0, 1);
      inp[8] = wallProx(a);
      inp[9] = clamp(w.lightAt(a.x, a.y), 0, 1); inp[10] = clamp((w.tempAt(a.x, a.y) - 10) / 25, 0, 1);
    },
    P: { L: 3.4, Hh: 0.64, snout: 1.1, suckerMouth: true, dorsal: true, dorsalX: 0.06, dorsalW: 0.24, dorsalH: 1.35, pattern: 'sucker', scales: { p: 0.16, k: 0.10 },
      tail: { len: 1.4, spread: 0.9, sweep: 0.8, fork: 0.36 }, profile: t => { const e = ell(t, 0.58); return [e * 0.92, e * 0.84]; } },   // long, round-bodied, flat-bellied
    draw(a, put, t, env, o) { drawFish(put, this.P, fishColors(a, this, env.light), o); },
  }),

  catfish: makeSpecies({
    key: 'catfish', name: 'Brown bullhead', tag: '#b07b3f', size: 1.5, trophic: 'benthivore', schooling: false, zone: [0.78, 1.0],
    shape: { in: 10, hid: 10 },
    inputLabels: ['food \u2220sin', 'food \u2220cos', 'food near', 'threat \u2220sin', 'threat \u2220cos', 'threat near',
      'energy', 'on floor', 'oxygen', 'wall'],
    // brown bullheads are bottom omnivores: insect larvae, molluscs, crustaceans (cladocerans to crayfish), some fish, weed and
    // detritus (Scott & Crossman 1973) — on a lean bed they turn to snails and zooplankton
    diet: { detritus: true, plants: true, larva: true, snail: true, cray: 0.15 },   // (2026-10-15: zooplankton only as a young fish — below Lzoo — now that the bed's worms and scuds (BENTHOS) feed the adults)   // bullheads eat crayfish (and scavenge them)
    maxSpeed: 34, accel: 44, maxTurn: 2.0, sink: 8,
    matingCooldown: yr(0.5), pop: { start: 1.5, min: 3, max: 6 },   // K ≈ 40; ~10 founders ≈ 20 kg/ha
    tempOpt: 29, tempTol: 9, o2Crit: 0.21, spawnT: [21, 28], nestGuard: yr(0.06),   // (2026-10-15: no fixed spawning side — bullheads nest under cover in the shallows near home, the nearer shore of their own water body)
      // warmwater bottom-dweller; spawns once in early summer; nests in cavities, guarded
    innate: { homeDepth: 0.92, depthPull: 0.7, cruise: 0.30, weight: 0.45, nocturnal: true, dayRest: 0.5, spawnGround: 0.4, forage: 0.5 },   // hugs the bottom; forages more at night
    sat: 30, lbase: 30, lrange: 18,
    randomHue: (R) => R(33, 50),
    spawnPos: (R) => inColumn(R, R(10, W - 10), 0.85, 0.97),
    senses(a, w) {
      // the nearest food: bottom invertebrates first (bullheads live on insect larvae, worms and scuds), then detritus, then weed
      const inp = a.act.in, food = nearer(w.qLarva(a.x, a.y, a.senseRange), w.qBed(a)) || w.qDetritus(a.x, a.y, a.senseRange) || w.qPlant(a.x, a.y, a.senseRange);
      tgt(a, food, a.senseRange, inp, 0);
      tgt(a, w.qThreat(a), a.senseRange * 1.1, inp, 3);
      inp[6] = clamp(a.energy, 0, 1);
      inp[7] = clamp(1 - (w.bedY(a.x) - a.y) / 30, 0, 1);
      inp[8] = clamp(w.oxygenAt(a.x, a.y), 0, 1); inp[9] = wallProx(a);
    },
    P: { L: 3.2, Hh: 0.93, snout: 1, barbels: true, pattern: 'mottle', tail: { len: 1.4, spread: 0.7, sweep: 0.6, fork: 0.12 },
      profile: t => { const f = (t + 1) * 0.5, e = Math.sqrt(Math.max(0, 1 - t * t)); return [e * (0.5 + 0.5 * f), e * (0.58 + 0.7 * f)]; } },   // broad head → thin tail
    draw(a, put, t, env, o) { drawFish(put, this.P, fishColors(a, this, env.light), o); },
  }),

  // WHITE PERCH — a schooling planktivore-turned-generalist (514 Maine lakes, a principal fishery at Hot Brook): it eats
  // Daphnia and other zooplankton, then insect larvae and, as a big fish, small fish including its own young. It spawns at
  // ~15 °C over any bottom in the shallows, with no care, and is famous in Maine for crowding into dense, stunted populations
  // — growth is left food-limited, so stunting can emerge.
  whiteperch: makeSpecies({
    key: 'whiteperch', capture: 0.12, name: 'White perch', tag: '#b9c6c4', size: 1.15, trophic: 'planktivore', schooling: true, zone: [0.3, 0.9],
    shape: { in: 10, hid: 9 },
    inputLabels: ['food \u2220sin', 'food \u2220cos', 'food near', 'threat \u2220sin', 'threat \u2220cos', 'threat near',
      'energy', 'oxygen', 'wall', 'depth'],
    diet: { plankton: true, insect: true, larva: true, fish: true },   // fish only past BIO Lpisc
    maxSpeed: 48, accel: 56, drag: 1.4, maxTurn: 2.3,
    matingCooldown: yr(0.5), pop: { start: 4, min: 3, max: 30 },   // K ≈ 180; ~24 founders (white perch 20–30 % of a Maine lake's fish biomass — they "form very large populations that occasionally dominate", MDIFW)
    tempOpt: 27, tempTol: 8, o2Crit: 0.45, spawnT: [14, 20],   // warm-water (does best where summers reach ≥ 24 °C; prior preferendum); hypoxia-sensitive; spawns at ~15 °C (MDIFW), 15–20 °C in reservoirs
    innate: { homeDepth: 0.6, depthPull: 0.4, cruise: 0.45, weight: 0.40, school: 0.30, pursuit: 0.3, spawnGround: 0.4, forage: 0.5 },   // open-water schools, down to the bed to feed
    sat: 9, lbase: 50, lrange: 16,
    randomHue: (R) => R(60, 85),   // olive-grey back, silvery flanks
    spawnPos: (R) => inColumn(R, R(40, W - 40), 0.15, 0.85),
    senses(a, w) {
      const inp = a.act.in;
      // the nearest food it can take: zooplankton or an emerged insect, an insect larva or a stretch of rich bed, and — a big
      // white perch — a small fish
      tgt(a, nearer(nearer(w.qSurfaceFood(a), w.qLarva(a.x, a.y, a.senseRange)), nearer(w.qBed(a), w.qPrey(a))), a.senseRange, inp, 0);
      tgt(a, w.qThreat(a), a.senseRange * 1.1, inp, 3);
      inp[6] = clamp(a.energy, 0, 1);
      inp[7] = clamp(w.oxygenAt(a.x, a.y), 0, 1);
      inp[8] = wallProx(a); inp[9] = clamp(a.y / HREF, 0, 1);
    },
    P: { L: 2.6, Hh: 0.94, snout: 1.1, dorsal: true, dorsalX: -0.04, dorsalW: 0.44, dorsalH: 1.6, pattern: 'silver', scales: { p: 0.2, k: 0.12 },
      tail: { len: 1.35, spread: 0.95, sweep: 0.9, fork: 0.34 }, profile: t => { const e = ell(t, 0.6), sh = 1 + 0.16 * t; return [e * sh * 1.0, e * sh * 0.9]; } },   // deep, compressed, a humped back
    draw(a, put, t, env, o) { drawFish(put, this.P, fishColors(a, this, env.light), o); },
  }),

  // SMALLMOUTH BASS — introduced to Maine in 1868–1881 and now a principal fishery at Hot Brook: a bronze, vertically barred
  // bass of rocky and gravelly shores that lives mostly on CRAYFISH (60–90 % of an adult's diet) and small fish. Males fan
  // nests on gravel at 1–3 m once the water passes ~15 °C and guard eggs and fry for 25–35 days; below ~10 °C it stops
  // feeding (MDIFW) — Maine's long winter is its northern limit.
  bass: makeSpecies({
    key: 'bass', capture: 0.4, name: 'Smallmouth bass', tag: '#b48a4a', size: 1.6, trophic: 'predator', schooling: false, zone: [0.3, 0.9],
    shape: { in: 10, hid: 9 },
    inputLabels: ['prey \u2220sin', 'prey \u2220cos', 'prey near', 'energy', 'speed', 'oxygen', 'wall', 'rival density', 'light@depth', 'temp@depth'],
    diet: { fish: true, insect: true, larva: true, cray: 0.4 },   // insects as a young bass (by 20 mm), fish and crayfish from 50 mm; crayfish the adult's staple (Scott & Crossman; MDIFW) — the share of its strikes at an exposed crayfish that land
    maxSpeed: 56, accel: 64, drag: 1.3, maxTurn: 2.2,
    matingCooldown: yr(0.5), pop: { start: 0.3, min: 1, max: 0.8, refuge: 1, rescue: 2 },   // K ≈ 5 — northern lakes hold 5–20 adult smallmouth/ha (Wisconsin: Mildred 20, Clear 8–9.5, Cosgrove 1.3) — about 0.7–2.7 in this ~0.13-ha slice: 2 founders, and the refuge and rescue hold ONE (the default 2–3 kept ~22 bass/ha, which ate the shiners out)
    tempOpt: 27, tempTol: 7, o2Crit: 0.47, spawnT: [15, 21], nestGuard: yr(0.08), spawnSide: 1,   // preferendum ~27 °C (prior); nests above ~15 °C (eggs at 15.6–18.9); the male guards 25–35 days
    innate: { homeDepth: 0.85, depthPull: 0.35, cruise: 0.42, weight: 0.35, cover: 0.30, littoral: 0.5, pursuit: 0.5, spawnGround: 0.5 },  // works the bed and the shore's rocks, logs and weed edges; pursues prey it sees
    sat: 46, lbase: 32, lrange: 18,
    randomHue: (R) => R(26, 40),   // bronze-brown
    spawnPos: (R) => inColumn(R, R(10, W - 10), 0.15, 0.9),
    senses(a, w) {
      const inp = a.act.in;
      tgt(a, nearer(w.qPrey(a), w.qCray(a)), a.senseRange, inp, 0);   // a catchable fish or an exposed crayfish
      inp[3] = clamp(a.energy, 0, 1);
      inp[4] = a.spd / this.maxSpeed;
      inp[5] = clamp(w.oxygenAt(a.x, a.y), 0, 1);
      inp[6] = wallProx(a);
      inp[7] = w.allyStats(a, 64).density;
      inp[8] = clamp(w.lightAt(a.x, a.y), 0, 1); inp[9] = clamp((w.tempAt(a.x, a.y) - 10) / 25, 0, 1);
    },
    P: { L: 3.0, Hh: 0.92, snout: 1.3, eyeCol: [168, 40, 30], dorsal: true, dorsalX: 0.02, dorsalW: 0.34, dorsalH: 1.5, pattern: 'smbars', scales: { p: 0.24, k: 0.10 },
      tail: { len: 1.6, spread: 1.0, sweep: 0.9, fork: 0.2 }, profile: t => { const e = ell(t, 0.72), sh = 1 + 0.1 * t; return [e * sh * 0.96, e * sh * 0.98]; } },   // streamlined, fuller forward
    draw(a, put, t, env, o) { drawFish(put, this.P, fishColors(a, this, env.light), o); },
  }),

  // CHAIN PICKEREL — the lake's ambush predator (Mainers call them pike): a slim, green-gold esocid with a dark chain-link
  // net on its flanks and a black bar under the eye, lying still in the weeds and lunging at passing fish. It eats insects
  // as a small fish and is "strongly piscivorous" after 18–23 cm, with plenty of crayfish; spawns right after ice-out in
  // flooded vegetation with no care; and keeps feeding under the ice (Maine anglers catch more in winter than in summer).
  pike: makeSpecies({
    key: 'pike', capture: 0.6, name: 'Chain pickerel', tag: '#7c9c4a', size: 2.0, trophic: 'apex', schooling: false, zone: [0.3, 0.95],
    shape: { in: 9, hid: 8 },
    inputLabels: ['prey \u2220sin', 'prey \u2220cos', 'prey near', 'energy', 'speed', 'oxygen', 'wall', 'light@depth', 'temp@depth'],
    diet: { fish: true, insect: true, larva: true, cray: 0.15 },   // insects while small (below 3 × BIO Lpisc); Massachusetts pickerel ≤ 30 cm ate 40–65 % crayfish
    maxSpeed: 62, accel: 76, drag: 1.2, maxTurn: 2.1,
    matingCooldown: yr(0.5), pop: { start: 0.3, min: 1, max: 0.5, refuge: 1, rescue: 2 },   // a RESIDENT (pickerel keep "moderate to high density populations wherever [they occur]" in weedy water, MDIFW): K ≈ 3, 2 founders — 4–8 % of the fish biomass, ~0.5–1 kg in this slice
    tempOpt: 24.5, tempTol: 8, o2Crit: 0.32, spawnT: [6, 11], spawnSide: -1, coldPerf: 0.55,   // final preferendum 24–25.5 °C (ORNL); spawns at 8–11 °C right after ice-out; feeds under ice
    innate: { homeDepth: 0.55, depthPull: 0.28, cruise: 0.16, weight: 0.45, ambush: true, cover: 0.6, pursuit: 0.4, spawnGround: 0.5 },  // weed-bed ambush lurker — holds in cover, then turns on and bursts at prey
    sat: 42, lbase: 34, lrange: 18,
    randomHue: (R) => R(62, 82),   // green-gold
    spawnPos: (R) => inColumn(R, littoralX(R), 0.2, 0.85),
    senses(a, w) {
      const inp = a.act.in;
      tgt(a, nearer(w.qPrey(a), w.qCray(a)), a.senseRange, inp, 0);   // a catchable fish or an exposed crayfish
      inp[3] = clamp(a.energy, 0, 1);
      inp[4] = a.spd / this.maxSpeed;
      inp[5] = clamp(w.oxygenAt(a.x, a.y), 0, 1);
      inp[6] = wallProx(a);
      inp[7] = clamp(w.lightAt(a.x, a.y), 0, 1); inp[8] = clamp((w.tempAt(a.x, a.y) - 10) / 25, 0, 1);
    },
    P: { L: 4.2, Hh: 0.78, snout: 2.0, eyeBar: true, dorsal: true, dorsalX: -0.55, dorsalW: 0.22, dorsalH: 1.5, pattern: 'chain', scales: { p: 0.16, k: 0.07 },
      tail: { len: 1.8, spread: 1.2, sweep: 1.0, fork: 0.28 }, profile: t => { const e = ell(t, 0.62); return [e * 0.82, e * 0.86]; } },   // long slender spindle, rear dorsal
    draw(a, put, t, env, o) { drawFish(put, this.P, fishColors(a, this, env.light), o); },
  }),
};

// (Life histories are now written in YEARS via yr(): multi-year lives, maturity after ≥ 1 winter for most species, about
// half the real ages — the time compression that lets evolution show — instead of the old seconds × TIME.LIFE_SCALE.)

// GENERIC EXTRA inputs appended to EVERY species after its own senses() (which fill indices 0..baseInputs-1), written
// generically by world.js (spatial at [base..base+2], perception at [base+3, base+4], drives at [in-2, in-1]).
// `SP.baseInputs` records the species-specific count; inputLabels stays length-matched to shape.in (headless-asserted).
// The extras are NOT declared here directly: they are the LAST entry of BRAIN_ERAS (below), the layout history that lets
// fitGenome migrate an old saved brain BY LABEL (see "Adding a sensor" there).
//
// SPATIAL COGNITION (the allocentric "sense of place & direction"): a COMPASS (sin/cos of the fish's absolute heading —
// an orientation reference the egocentric food/threat bearings can't provide) + a HOME bearing (signed horizontal
// displacement to the fish's NATAL site `homeX`, normalised by lake width). Layered on the recurrent brain, these are the
// substrate for EVOLVED navigation: refuge homing, home-range/site fidelity, and spawning migration — emergent, not scripted.
export const SPATIAL_INPUTS = ['compass∠sin', 'compass∠cos', 'home∠x'];
// RICHER PERCEPTION: a LATERAL-LINE / rheotaxis flow sense (the signed local current — a MECHANOSENSORY cue, so unlike the
// vision-based senses it is NOT cut by turbidity → the murky-water sensory fallback) + a PREY-SIZE sense (the relative size
// of the nearest catchable fish, 0 for non-piscivores → predators can evolve prey-SIZE selectivity, coupling to the gape system).
export const PERCEPTION_INPUTS = ['flow', 'prey size'];
export const DRIVE_INPUTS = ['hunger', 'fear'];

// BRAIN LAYOUT HISTORY — one entry per save era, OLDEST → NEWEST; the LAST entry is the CURRENT layout. Each lists the
// generic `extras` appended after every species' own base inputs (in order), the motor `outs`, and whether the genome
// carried the recurrent LEAK block. A genome's LENGTH identifies its era (per species; checked collision-free below and
// headless-asserted), and fitGenome then remaps it BY KEY: base inputs 1:1 by position, extras by label, outputs by label;
// columns new since that era start at 0. (Positional copying put a v21 brain's hunger/fear weights on flow/prey-size.)
// Optional `baseAdded: { species: [labels] }` records SPECIES-SPECIFIC inputs appended to that species' base block in
// that era, so older eras of that species are sized with the smaller base.
// NOTE minnow/sunfish/bass/pike gained light@depth/temp@depth in save v4; their ≤v3 brains match no era and reseed.
//
// ADDING A SENSOR:
//  • shared (every species): append ONE entry = the previous one with your label inserted where world.js writes it, and
//    write `act.in[...]` for it in World.step (extras are addressed by position there). Never edit older entries.
//  • one species: append its label to the END of that species' own inputLabels, bump shape.in, write it in senses(), and
//    append ONE entry = the previous one plus `baseAdded: { <species>: ['<label>'] }`.
//  Then bump the save version. Old brains keep every weight; the new column loads as 0.
export const BRAIN_ERAS = [
  { saves: 'v4–v14', extras: [], outs: ['turn', 'thrust'], leak: false },        // pre-recurrence, 2 outputs
  { saves: 'v15–v16', extras: [], outs: ['turn', 'thrust'], leak: true },        // recurrent memory, 2 outputs
  { saves: 'v17', extras: [], outs: ACT_LABELS, leak: true },                    // + strike/flee/hide action outputs
  { saves: 'v18–v20', extras: [...DRIVE_INPUTS], outs: ACT_LABELS, leak: true },
  { saves: 'v21', extras: [...SPATIAL_INPUTS, ...DRIVE_INPUTS], outs: ACT_LABELS, leak: true },
  { saves: 'v22+', extras: [...SPATIAL_INPUTS, ...PERCEPTION_INPUTS, ...DRIVE_INPUTS], outs: ACT_LABELS, leak: true },
];
export const EXTRA_INPUTS = BRAIN_ERAS[BRAIN_ERAS.length - 1].extras;   // order: [spatial 0..2][perception 3,4][drives in-2,in-1]
for (const k in SP) { SP[k].baseInputs = SP[k].shape.in; SP[k].shape.in += EXTRA_INPUTS.length; SP[k].inputLabels.push(...EXTRA_INPUTS); }

// Per-species era table: each era's input KEYS (base by position `b:i`, extras by label `x:label`) and genome length.
// `brainEraOf(sp, len)` returns the unique era of that length, or null (unknown OR ambiguous → the caller reseeds).
export function buildBrainEras(key, base, hid, eras = BRAIN_ERAS) {
  const out = [];
  for (let e = 0; e < eras.length; e++) {
    let b = base;
    for (let f = e + 1; f < eras.length; f++) b -= ((eras[f].baseAdded || {})[key] || []).length;   // base before later adds
    const inKeys = [];
    for (let i = 0; i < b; i++) inKeys.push('b:' + i);
    for (const x of eras[e].extras) inKeys.push('x:' + x);
    out.push({ saves: eras[e].saves, inKeys, outs: eras[e].outs, leak: eras[e].leak, len: layoutLen(inKeys.length, hid, eras[e].outs.length, eras[e].leak), current: e === eras.length - 1 });
  }
  const byLen = new Map();
  for (const er of out) byLen.set(er.len, byLen.has(er.len) ? null : er);   // a length shared by two eras is AMBIGUOUS → null
  return { eras: out, byLen, collisions: out.length - [...byLen.values()].filter(Boolean).length };
}
for (const k in SP) SP[k].brainEras = buildBrainEras(k, SP[k].baseInputs, SP[k].shape.hid);
export function brainEraOf(sp, len) { return sp.brainEras.byLen.get(len) || null; }

export const SPECIES = Object.keys(SP);
