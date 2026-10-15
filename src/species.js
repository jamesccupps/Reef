// species.js — the six species: data + senses + drawing. Pure (no DOM); draw() only calls a put() callback.
import { WORLD, ENV, TIME } from './config.js';
import { prepBio } from './bioenergetics.js';
import { hsl, clamp, ACT_LABELS, layoutLen } from './core.js';

const W = WORLD.W, H = WORLD.H;

// x biased toward the shallow littoral shelves near each shore — where shelf-dwelling
// fish (minnows, sunfish) naturally congregate. ~62% land on a shelf, the rest spread out.
const SHELF = 0.18;   // width fraction of each shore that counts as the littoral shelf
function littoralX(R) {
  if (R() < 0.62) return R() < 0.5 ? R(8, W * SHELF) : R(W * (1 - SHELF), W - 8);
  return R(10, W - 10);
}

// ---------- sensory helpers ----------
function tgt(agent, t, range, inp, i) {
  if (t) {
    const ang = Math.atan2(t.item.y - agent.y, t.item.x - agent.x) - agent.heading;
    inp[i] = Math.sin(ang); inp[i + 1] = Math.cos(ang); inp[i + 2] = clamp(1 - t.dist / range, 0, 1);
  } else { inp[i] = 0; inp[i + 1] = 0; inp[i + 2] = 0; }
}
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
    if (pat === 'band') {          // bass: a dark, ragged lateral band of blotches from gill to tail
      const c0 = -0.08 + 0.07 * Math.sin(u * 1.3), hw = 0.17 + 0.07 * blot(u * 1.6, 3.1), d = Math.abs(n - c0);
      k *= 1 - 0.34 * (1 - sstep(hw * 0.6, hw, d)) * (0.75 + 0.25 * Math.sin(u * 3.3)) * along(-L * 0.95, L * 0.5, u);
    } else if (pat === 'stripe') { // minnow: a thin dark midline stripe on a silvery flank
      k *= 1 - 0.28 * (1 - sstep(0.05, 0.11, Math.abs(n + 0.06))) * along(-L * 0.9, L * 0.65, u);
    } else if (pat === 'bars') {   // sunfish: faint vertical bars over the back + an orange breast
      const s = 0.5 + 0.5 * Math.cos(u * TAU / (L * 0.34));
      k *= 1 - 0.2 * sstep(0.55, 0.95, s) * (1 - sstep(-0.1, 0.55, n)) * along(-L * 0.85, L * 0.45, u);
      base = mix(base, [236, 138, 52], 0.42 * sstep(0.1, 0.8, n) * sstep(-0.5, 0.4, u / L));
    } else if (pat === 'vbars') {  // perch: 6–8 bold dark saddle bars over a yellow flank, fading toward the pale belly
      const s = 0.5 + 0.5 * Math.cos(u * TAU / (L * 0.28) + 0.6);
      k *= 1 - 0.34 * sstep(0.5, 0.92, s) * (1 - sstep(0.0, 0.7, n)) * along(-L * 0.9, L * 0.5, u);
    } else if (pat === 'spots') {  // pike: rows of pale bean-shaped spots on a dark flank
      const gu = u / 0.5, row = Math.floor(v / 0.34), gv = v / 0.34 - row, ou = gu + (row & 1) * 0.5, fu = ou - Math.floor(ou);
      const r = Math.hypot((fu - 0.5) * 0.6, gv - 0.5);
      base = mix(base, c.belly, 0.5 * (1 - sstep(0.18, 0.26, r)) * (1 - sstep(0.55, 0.8, Math.abs(n))) * along(-L * 0.95, L * 0.55, u));
    } else if (pat === 'mottle') { // catfish: dark blotches over the back and flanks, smooth skin
      k *= 1 - 0.24 * sstep(0.25, 0.6, blot(u * 2.1, v * 2.9)) * (1 - sstep(0.1, 0.6, n));
    } else if (pat === 'troutspots') {   // rainbow trout: a rosy lateral band on a silvery flank, fine black spots over the back
      base = mix(base, [214, 112, 132], 0.5 * (1 - sstep(0.1, 0.24, Math.abs(n + 0.02))) * along(-L * 0.9, L * 0.75, u));
      const gu = u / 0.32, row = Math.floor(v / 0.26), gv = v / 0.26 - row, ou = gu + (row & 1) * 0.5, fu = ou - Math.floor(ou);
      k *= 1 - 0.55 * (1 - sstep(0.1, 0.16, Math.hypot(fu - 0.5, gv - 0.5))) * (1 - sstep(-0.2, 0.25, n)) * (0.5 + 0.5 * blot(u * 3.1, v * 2.3) > 0.35 ? 1 : 0);
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
  if (P.earSpot) fillDisc(put, L * 0.32, -Hh * 0.16 + wave(L * 0.32), Hh * 0.2, su, c.back);
  // snout — a solid ROUNDED nose that blunts the body's pointed tip (the old separate dabs read as a dotted needle at
  // close-up resolutions; a triangle read as a bird's beak); longer, flatter "duckbill" on the pike
  const sn = (P.snout || 0) * 0.42, wL = wave(L);
  if (sn > 0) fillEllipse(put, L - 0.1, wL * 0.92, 0.14 + sn * 0.28, Hh * 0.19, su, c.body);   // mostly inside the head: it only blunts the tip
  // mouth line — a short dark seam ending inside the nose tip
  putLine(put, L * 0.92, Hh * 0.08 + wave(L * 0.92), L + sn * 0.25, wL * 0.9 + Hh * 0.02, su, c.back, 0.5);
  // barbels (catfish) — whiskers as continuous lines (they were rows of separate dots)
  if (P.barbels) for (const [y0, y1, al] of [[Hh * 0.3, Hh * 1.0, 0.6], [Hh * 0.18, Hh * 0.55, 0.5], [-Hh * 0.1, -Hh * 0.55, 0.45]])
    putLine(put, L + sn * 0.5, y0 + wL, L + sn * 0.5 + 1.5, y1 + wL, su, c.belly, al);
  // eye — radius PROPORTIONAL to body depth (the old flat 0.7-unit floor made a slim fish's eye absurdly large). Where it
  // spans enough sprite px (close-up tiers) it gets a gold-tinted iris ring around the pupil; a catch-light glint on top.
  const er = Math.max(0.16, Hh * 0.22 * m.eye), ex = L * 0.58, ey = -Hh * 0.32 + wave(ex);
  if (er * scale >= 6) { fillDisc(put, ex, ey, er, su, mix(c.back, [196, 158, 70], 0.55)); fillDisc(put, ex, ey, er * 0.64, su, c.eye); }
  else fillDisc(put, ex, ey, er, su, c.eye);
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
//           Scott 1961, Downing & Merkens 1957 — so far less under ice)
// (prior) marks a literature value not yet checked against a primary source.
const yrs = n => n * TIME.YEAR_LEN;
export const BIO = {
  minnow: {   // FATHEAD MINNOW — FB4 "Fathead minnow" (Duffy 1998)
    bio: { CEQ: 2, CA: 0.149, CB: -0.242, CQ: 2.4, CTO: 24, CTM: 30, REQ: 2, RA: 0.0096, RB: -0.041, RQ: 2.6, RTO: 28, RTM: 33, ACT: 1,
      SDA: 0.172, EGEQ: 1, FA: 0.1, EXEQ: 1, UA: 0.1, PREDEDEQ: 1, ED: 4100, src: 'Duffy 1998 (FB4)' },
    lw: { a: 0.011040, b: 3.0765 }, vb: { Linf: 7.8, k: 1.0, t0: -0.2 },   // Michigan W–L (no Ws exists); ~5.5 cm at 1, 7 at 2
    Lhatch: 0.6, sHatch: 0.6, L0: 4, Lref: 6, Lmat: 4.5, matMinAge: yrs(0.8), maxAge: yrs(4), matureAge: yrs(1), M: 1.35,
    gut: 0.05, gerMul: 1.0, gsiF: 0.10, gsiM: 0.015,   // per batch
    fec: { a: 35.6, b: 1.70 },   // per BATCH: mature eggs = −451 + 20·TL(mm) (Gale & Buynak 1982) ≈ 549 at 5 cm, 749 at 6; 16–26 batches a summer
    Lzoo: 0, Lpisc: Infinity, gapeR: 0.06, depthR: 0.18, uilt: 33, o2Lethal: 0.7, vuln: 1.0,
  },
  sunfish: {  // BLUEGILL / PUMPKINSEED — FB4 "Bluegill sunfish" adult + juvenile (Kitchell et al. 1974); no pumpkinseed model exists
    bio: { CEQ: 2, CA: 0.182, CB: -0.274, CQ: 2.3, CTO: 27, CTM: 36, REQ: 2, RA: 0.0154, RB: -0.2, RQ: 2.1, RTO: 36, RTM: 40, ACT: 1,
      SDA: 0.172, EGEQ: 2, FA: 0.158, FB: -0.222, FG: 0.631, EXEQ: 2, UA: 0.0253, UB: 0.58, UG: -0.299, PREDEDEQ: 1, ED: 4186, src: 'Kitchell et al. 1974 (FB4 adult)' },
    bioJuv: { CTO: 31, CTM: 37, RTO: 37, RTM: 41, src: 'Kitchell et al. 1974 (FB4 juvenile)' },
    lw: { a: 0.008750, b: 3.316 }, vb: { Linf: 23, k: 0.3, t0: 0.3 },        // Ws Hillman 1982; Michigan 4.6, 9.7, 12.7, 15.0, 17.0 cm
    Lhatch: 0.5, sHatch: 0.5, L0: 5, Lref: 15, Lmat: 11, LmatM: 9, matMinAge: yrs(1.5), maxAge: yrs(10), matureAge: yrs(3), M: 0.54,
    gut: 0.05, gerMul: 0.5, gsiF: 0.06, gsiM: 0.01,   // per batch (income spawner);   // panfish: 50 % of a meal in 5 h, all in ~21 h (Seaburg & Moyle 1964)
    fec: { a: 35.7, b: 2.12 },   // F ≈ 0.271·TL(mm)^2.12 (fit to Beard 1982, N Wisconsin): 15 cm → ~11,100 eggs
    pelagicFry: 2.5,   // cm: the limnetic phase — bluegill fry feed in the open water until ~2–2.5 cm, then return to the weeds (Werner 1967, 1969)
    Lzoo: 4, Lpisc: Infinity, gapeR: 0.07, depthR: 0.38, uilt: 34, o2Lethal: 0.75, vuln: 0.35,   // lethal DO: Moss & Scott 1961; depth 0.34–0.42 (Lawrence 1958; Hill et al. 2004)
  },
  perch: {    // YELLOW PERCH — FB4 "Yellow perch" adult + juvenile (Kitchell et al. 1977)
    bio: { CEQ: 2, CA: 0.25, CB: -0.27, CQ: 2.3, CTO: 23, CTM: 28, REQ: 2, RA: 0.0108, RB: -0.2, RQ: 2.1, RTO: 28, RTM: 33, ACT: 1,
      SDA: 0.15, EGEQ: 2, FA: 0.158, FB: -0.222, FG: 0.631, EXEQ: 2, UA: 0.0292, UB: 0.58, UG: -0.299, PREDEDEQ: 1, ED: 4186, src: 'Kitchell et al. 1977 (FB4 adult)' },
    bioJuv: { CTO: 29, CTM: 32, RTO: 32, RTM: 35, src: 'Kitchell et al. 1977 (FB4 juvenile)' },
    lw: { a: 0.006982, b: 3.23 }, vb: { Linf: 35, k: 0.2, t0: -0.3 },        // Ws Willis et al. 1991; Michigan 8.4, 13.2, 16.5, 19.1, 21.6 cm
    Lhatch: 0.6, sHatch: 0.08, L0: 8, Lref: 20, Lmat: 16, LmatM: 12, matMinAge: yrs(1.5), maxAge: yrs(11), matureAge: yrs(3), M: 0.50,
    gut: 0.06, gerMul: 1.0, gsiF: 0.20, gsiM: 0.07,   // ♀ GSI 16–26 % (S. Lake Michigan);   // young perch: a Daphnia meal in 6–12 h (Noble 1973) ≈ the general rate
    fec: { a: 0.3487, b: 3.4556 },   // log10 F = −3.9131 + 3.4556·log10 TL(mm), inland Michigan lakes (Schneider 1984): 25 cm → 23,600
    Lzoo: 25, Lpisc: 14, gapeR: 0.09, depthR: 0.234, uilt: 30, o2Lethal: 1.0, vuln: 0.6,   // piscivory from ~15 cm (Paszkowski & Tonn 1994); tank perch 15–19 cm took fatheads ≤ 0.53 TL; zooplankton → benthos → fish: big perch leave the zooplankton (Persson 1986; Hjelm et al. 2000) — most lake perch (< 25 cm) still take it
  },
  trout: {    // RAINBOW TROUT — FB4 "Rainbow Trout (adult)" (Railsback & Rose 1999)
    bio: { CEQ: 3, CA: 0.628, CB: -0.3, CQ: 3.5, CTO: 25, CTM: 22.5, CTL: 24.3, CK1: 0.2, CK4: 0.2, REQ: 2, RA: 0.013, RB: -0.217, RQ: 2.2, RTO: 22, RTM: 26, ACT: 1.3,
      SDA: 0.172, EGEQ: 3, FA: 0.212, FB: -0.222, FG: 0.631, EXEQ: 3, UA: 0.0314, UB: 0.58, UG: -0.299,
      PREDEDEQ: 2, Alpha1: 5763, Beta1: 0.986, Cutoff: 4000, Alpha2: 7602, Beta2: 0.5266, src: 'Railsback & Rose 1999 (FB4)' },
    lw: { a: 0.01236, b: 2.990 }, vb: { Linf: 90, k: 0.12, t0: -1.2 },       // Ws lentic (Simpkins & Hubert 1996); Michigan lakes 20.8, 28.4, 36.3, 43.9 cm
    Lhatch: 2.0, sHatch: 0.3, L0: 10, Lref: 35, Lmat: 35, LmatM: 30, matMinAge: yrs(2), maxAge: yrs(8), matureAge: yrs(3), M: 0.65,
    gut: 0.05, gerMul: 1.0, gsiF: 0.20, gsiM: 0.05,   // ♀ GSI 20 % before ovulation (Tyler et al. 1990);   // 100 % emptied in 16.4 h at 20 °C (Windell et al. 1976)
    fec: { a: 2.455, b: 1.85 },   // log10 F = −1.46 + 1.85·log10 TL(mm) (DuBois et al. 1989, Lake Superior tributaries): 50 cm → 3,410
    Lzoo: 60, Lpisc: 25, gapeR: 0.09, depthR: 0.22, uilt: 25, o2Lethal: 2.5, vuln: 0.9,   // UILT 24.3–26 (Bear et al. 2007; Bidgood & Berst 1969); DO: Downing & Merkens 1957
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
    Lzoo: 5, Lpisc: Infinity, gapeR: 0.12, depthR: 0.20, uilt: 36, o2Lethal: 0.3, vuln: 0.4,   // bullheads survive 0.2–0.3 ppm under ice (Cooper & Washburn 1946)
    benthL: 1.2,   // cm: young bullheads, guarded in a ball over the bottom, feed there from swim-up — midge larvae and small
                   //   crustaceans (Scott & Crossman 1973); at the generic FRY.BENTH_L (2.5 cm) ~85 % of the fry starved first
  },
  carp: {     // COMMON CARP — there is NO published Wisconsin model for common carp (none in FB4). A COMPOSITE from carp data:
              // consumption curve of FB4's bighead carp (Cooke & Hill 2010; same family, warm-water: best growth 23–30 °C), CA
              // calibrated to carp rations (Chakraborty 1992: ~3 %/d at 65 g, 28 °C; field 4.1 %/d in August, Garcia & Adelman
              // 1985); respiration fitted to carp standard metabolism (Beamish 1964: RB −0.219, RQ 0.083 ≈ Q10 2.3) × routine
              // ACT 1.45 (Chakraborty 1992, as ln1.45 = RTO with VEL 1); F 0.2, U 0.07 of C (Chakraborty 1992) → 0.0875 of C−F
              // (FB4's convention); ED 4.3–5.4 kJ/g wet
    bio: { CEQ: 2, CA: 0.5, CB: -0.287, CQ: 2.5, CTO: 28, CTM: 37, REQ: 1, RA: 0.00068, RB: -0.219, RQ: 0.0832, RTO: 0.3716, RTL: 0, RK1: 1, RK4: 0, RK5: 0, ACT: 1, BACT: 0,
      SDA: 0.172, EGEQ: 1, FA: 0.2, EXEQ: 1, UA: 0.0875, PREDEDEQ: 1, ED: 4800, src: 'composite: Beamish 1964, Chakraborty 1992, FB4 bighead-carp curve' },
    lw: { a: 0.01910, b: 2.920 }, vb: { Linf: 70, k: 0.2, t0: -0.2 },        // Ws Bister et al. 2000; ~15, 25, 33, 40, 45 cm (prior)
    Lhatch: 0.6, sHatch: 0.03, L0: 10, Lref: 50, Lmat: 38, LmatM: 32, matMinAge: yrs(2), maxAge: yrs(25), matureAge: yrs(3.5), M: 0.15,
    gut: 0.04, gerMul: 1.0, gsiF: 0.15, gsiM: 0.07,   // stomachless: gut passage, fast in warm water (Hofer et al. 1982)
    fec: { a: 5.13e-5, b: 5.325 },   // log10 F = −9.615 + 5.325·log10 TL(mm) (Weber & Brown 2012; ~100–200k eggs/kg): 60 cm → ~150k
    Lzoo: 4, Lpisc: Infinity, gapeR: 0.05, depthR: 0.31, uilt: 36, o2Lethal: 0.5, vuln: 0.7,   // UILT 35.7 °C at 26 °C acclimation (Wismer & Christie 1987)
  },
  bass: {     // LARGEMOUTH BASS — FB4 "Largemouth bass (adult)" (Rice et al. 1983)
    bio: { CEQ: 2, CA: 0.33, CB: -0.325, CQ: 2.65, CTO: 27.5, CTM: 37, REQ: 1, RA: 0.008352, RB: -0.355, RQ: 0.0313, RTO: 0.0196, RTL: 0, RK1: 1, RK4: 0, RK5: 0, ACT: 1, BACT: 0,
      SDA: 0.15848, EGEQ: 1, FA: 0.104, EXEQ: 1, UA: 0.08817, PREDEDEQ: 1, ED: 4184, src: 'Rice et al. 1983 (FB4)' },
    lw: { a: 0.005559, b: 3.273 }, vb: { Linf: 60, k: 0.15, t0: -0.3 },      // Ws Henson 1991; Michigan 10.7, 18.0, 23.9, 29.5, 33.5, 37.3 cm
    Lhatch: 0.6, sHatch: 0.4, L0: 6, Lref: 38, Lmat: 28, LmatM: 25, matMinAge: yrs(2), maxAge: yrs(16), matureAge: yrs(4), M: 0.40,
    gut: 0.08, gerMul: 0.4, gsiF: 0.08, gsiM: 0.008,   // between panfish (~21 h) and pike (~50 h) at 18–23 °C (Seaburg & Moyle 1964)
    fec: { a: 0.3755, b: 3.2857 },   // log10 F = −0.4254 + 3.2857·log10 TL(cm) (Laarman & Schneider 1985, Michigan): 38 cm → 58,700
    Lzoo: 4, Lpisc: 5, gapeR: 0.12, depthR: 0.24, uilt: 35.5, o2Lethal: 1.1, vuln: 0.6,   // CTmax 37.3–38.5 (Fields et al. 1987; Currie et al. 1998); mouth width 0.10–0.15 TL (Lawrence 1958; Hill: 0.14·TL − 5.6 mm); piscivory 5–10 cm
  },
  pike: {     // NORTHERN PIKE — FB4 "Northern pike (adult)" (Bevelhimer et al. 1985)
    bio: { CEQ: 4, CA: 0.0244, CB: -0.18, CQ: -0.024, CK1: 0.0125, CK4: -0.000326, REQ: 1, RA: 0.0026445, RB: -0.18, RQ: 0.055, RTO: 0.1222, RTL: 0, RK1: 1, RK4: 0, RK5: 0, ACT: 1, BACT: 0,
      SDA: 0.175, EGEQ: 1, FA: 0.2, EXEQ: 1, UA: 0.0875, PREDEDEQ: 1, ED: 3598, src: 'Bevelhimer et al. 1985 (FB4)' },
    lw: { a: 0.00456, b: 3.096 }, vb: { Linf: 85, k: 0.28, t0: -0.5 },       // Ws Willis 1989; Michigan 29.7, 45.0, 52.8, 59.4, 64.8 cm
    Lhatch: 0.9, sHatch: 0.05, L0: 8, Lref: 65, Lmat: 45, LmatM: 35, matMinAge: yrs(1.5), maxAge: yrs(18), matureAge: yrs(3), M: 0.30,
    gut: 0.18, gerMul: 0.25, gsiF: 0.15, gsiM: 0.025,   // ♂ GSI 2.5 % (Medford & Mackay 1978);   // 50 % in ~20 h, all in ~48–50 h in summer, 12 days in winter (Diana 1979)
    fec: { a: 0.0859, b: 3.161 },   // log10 F = −4.227 + 3.161·log10 TL(mm) (Priegel & Krohn 1975, corrected): 61 cm → 37,200
    Lzoo: 5, Lpisc: 4, gapeR: 0.14, depthR: 0.14, uilt: 29.5, o2Lethal: 0.5, vuln: 0.8,   // gape ≈ its own body depth (Esox: Lawrence; Nilsson & Brönmark 2000)
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
//  THE SIX SPECIES
// ============================================================
export const SP = {

  minnow: makeSpecies({
    key: 'minnow', name: 'Minnow', tag: '#9fc7e8', size: 0.7, trophic: 'planktivore', schooling: true, zone: [0.05, 0.5],
    shape: { in: 16, hid: 12 },
    inputLabels: ['plankton \u2220sin', 'plankton \u2220cos', 'plankton near', 'threat \u2220sin', 'threat \u2220cos', 'threat near',
      'school density', 'school \u2220sin', 'school \u2220cos', 'school align', 'energy', 'oxygen', 'O\u2082 gradient', 'wall', 'light@depth', 'temp@depth'],
    diet: { plankton: true, insect: true },
    maxSpeed: 52, accel: 58, drag: 1.5, maxTurn: 2.6,
    // a fathead female spawns a batch every ~4 days through the summer (16–26 batches; Gale & Buynak 1982), putting most of
    // her surplus into eggs — which is why fatheads stay small and most die after their first spawning summer
    matingCooldown: yr(0.012), reproAlloc: 0.8, pop: { start: 45, min: 7, max: 60 },   // K ≈ 400
    tempOpt: 27, tempTol: 9, o2Crit: 0.26, spawnT: [16, 26],   // hypoxia-tolerant; a REPEAT spawner all summer (nest-guarding males under cover)
    innate: { homeDepth: 0.22, depthPull: 0.5, cruise: 0.55, weight: 0.40, school: 0.30, forage: 0.5 },   // shallow open water, active schooler

    sat: 20, lbase: 46, lrange: 16,
    randomHue: (R) => 198 + R(-12, 16),
    spawnPos: (R) => ({ x: littoralX(R), y: R(40, WORLD.FLOOR - 60) }),  // minnows haunt the shallows
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
    P: { L: 2.4, Hh: 0.69, snout: 1, pattern: 'stripe', scales: { p: 0.2, k: 0.10 }, tail: { len: 1.4, spread: 0.8, sweep: 1.0, fork: 0.42 }, profile: t => { const e = ell(t, 0.85); return [e * 0.9, e * 0.95]; } },   // slender little body
    draw(a, put, t, env, o) { drawFish(put, this.P, fishColors(a, this, env.light), o); },
  }),

  sunfish: makeSpecies({
    key: 'sunfish', name: 'Sunfish', tag: '#ff9d4d', size: 1.0, trophic: 'omnivore', schooling: false, zone: [0.15, 0.72],
    shape: { in: 13, hid: 10 },
    inputLabels: ['food \u2220sin', 'food \u2220cos', 'food near', 'threat \u2220sin', 'threat \u2220cos', 'threat near',
      'energy', 'oxygen', 'O\u2082 gradient', 'wall', 'depth', 'light@depth', 'temp@depth'],
    diet: { plankton: true, plants: true, larva: true, insect: true, snail: true },
    maxSpeed: 42, accel: 50, maxTurn: 2.3,
    matingCooldown: yr(0.06), pop: { start: 16, min: 4, max: 45 },   // K ≈ 300; ~110 founders ≈ 60 kg/ha (sunfish 50–150 kg/ha in Midwestern and New England lakes)
    tempOpt: 30, tempTol: 8, o2Crit: 0.32, spawnT: [20, 28], nestGuard: yr(0.03),   // warmwater littoral centrarchid; repeat spawner in summer, males guard nests; very fecund
    innate: { homeDepth: 0.42, depthPull: 0.4, cruise: 0.38, weight: 0.40, cover: 0.40, forage: 0.5 },   // mid littoral, hovers in weed beds
    sat: 82, lbase: 40, lrange: 22,
    randomHue: (R) => R(8, 48),   // red-orange → amber (was −28..52, which wrapped into unnatural magenta 332–360°)
    spawnPos: (R) => ({ x: littoralX(R), y: R(40, WORLD.FLOOR - 50) }),   // sunfish favour the weedy shelf
    senses(a, w) {
      // the nearest ANIMAL food — zooplankton, an emerged insect, insect larvae on the weeds or the bed; weed (a poor food)
      // only when there's none in sight
      const inp = a.act.in, pk = w.qSurfaceFood(a), lv = w.qLarva(a.x, a.y, a.senseRange);
      const food = (!pk ? lv : !lv ? pk : (pk.dist < lv.dist ? pk : lv)) || w.qPlant(a.x, a.y, a.senseRange);
      tgt(a, food, a.senseRange, inp, 0);
      tgt(a, w.qThreat(a), a.senseRange * 1.1, inp, 3);
      inp[6] = clamp(a.energy, 0, 1);
      inp[7] = clamp(w.oxygenAt(a.x, a.y), 0, 1);
      inp[8] = clamp(w.oxygenGrad(a.x, a.y) * 4, -1, 1);
      inp[9] = wallProx(a); inp[10] = clamp(a.y / H, 0, 1);
      inp[11] = clamp(w.lightAt(a.x, a.y), 0, 1); inp[12] = clamp((w.tempAt(a.x, a.y) - 10) / 25, 0, 1);
    },
    P: { L: 2.2, Hh: 1.06, snout: 1, dorsal: true, dorsalX: 0.0, dorsalW: 0.42, dorsalH: 1.5, earSpot: true, pattern: 'bars', scales: { p: 0.24, k: 0.12 },
      tail: { len: 1.2, spread: 0.95, sweep: 0.85, fork: 0.14 }, profile: t => { const e = ell(t, 0.46); return [e, e * 1.06]; } },   // round deep disc
    draw(a, put, t, env, o) { drawFish(put, this.P, fishColors(a, this, env.light), o); },
  }),

  // YELLOW PERCH — the classic middle link of a temperate lake: young perch school and eat zooplankton, adults eat benthic
  // insect larvae, crayfish and small fish (minnows, fry), and perch of every size are the main prey of pike and bass.
  // Spawns in early spring just after the pike (7–12 °C), draping ribbons of eggs over weeds — no nest, no guarding.
  perch: makeSpecies({
    key: 'perch', capture: 0.15, name: 'Perch', tag: '#d6c04a', size: 1.2, trophic: 'mesopredator', schooling: true, zone: [0.3, 0.9],
    shape: { in: 12, hid: 9 },
    inputLabels: ['food ∠sin', 'food ∠cos', 'food near', 'threat ∠sin', 'threat ∠cos', 'threat near',
      'school density', 'energy', 'oxygen', 'wall', 'light@depth', 'temp@depth'],
    diet: { fish: true, insect: true, larva: true, cray: 0.08 },   // cray: the share of its strikes at a crayfish that land (perch take the small ones)
    maxSpeed: 46, accel: 54, drag: 1.4, maxTurn: 2.3,
    matingCooldown: yr(0.5), pop: { start: 7, min: 3, max: 28 },   // K ≈ 190; ~47 founders ≈ 40 kg/ha (yellow perch 27–52 kg/ha — docs/ECOLOGY_RESEARCH.md)
    tempOpt: 23, tempTol: 7, o2Crit: 0.26, spawnT: [7, 12], spawnSide: -1, coldPerf: 0.45,   // cool–warm guild; one early-spring spawn; active under ice
    innate: { homeDepth: 0.86, depthPull: 0.4, cruise: 0.40, weight: 0.40, school: 0.25, pursuit: 0.35, cover: 0.2, spawnGround: 0.4 },   // a near-bottom forager (adult yellow perch feed mostly on benthos)
    sat: 70, lbase: 40, lrange: 20,
    randomHue: (R) => R(46, 64),   // yellow-green with dark bars
    spawnPos: (R) => ({ x: littoralX(R), y: R(60, WORLD.FLOOR - 60) }),
    senses(a, w) {
      // the nearest food it can take: a catchable fish OR a benthic larva (adults forage both)
      const inp = a.act.in, pf = w.qPrey(a), lv = w.qLarva(a.x, a.y, a.senseRange);
      const food = !pf ? lv : !lv ? pf : (pf.dist < lv.dist ? pf : lv);
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

  // RAINBOW TROUT — a cold-water salmonid: it needs cool (best ~14 °C), well-oxygenated water, so in a productive lake it is
  // squeezed in summer between the warm surface and the oxygen-starved deep (the "temperature–oxygen squeeze") and holds in
  // the narrow cool band at the thermocline. It cruises the open water taking emerged insects, larvae and, when large,
  // small fish; it spawns in spring in the gravel of the inflow stream (spawnSide −1, 6–11 °C).
  trout: makeSpecies({
    key: 'trout', capture: 0.3, name: 'Trout', tag: '#c48aa0', size: 1.5, trophic: 'mesopredator', schooling: false, zone: [0.35, 0.8],
    shape: { in: 11, hid: 9 },
    inputLabels: ['food ∠sin', 'food ∠cos', 'food near', 'threat ∠sin', 'threat ∠cos', 'threat near',
      'energy', 'oxygen', 'wall', 'light@depth', 'temp@depth'],
    diet: { fish: true, insect: true, larva: true },
    maxSpeed: 62, accel: 72, drag: 1.2, maxTurn: 2.3,
    matingCooldown: yr(0.5), pop: { start: 0.6, min: 1, max: 1.0, refuge: 1, rescue: 2 },   // K ≈ 7; stocked/visiting — the rescue keeps one or two in view
    tempOpt: 15, tempTol: 6, o2Crit: 0.58, spawnT: [6, 11], spawnSide: -1, coldPerf: 0.6,   // cold-water guild (stressed above ~20 °C); spring stream spawner
    innate: { homeDepth: 0.45, depthPull: 0.45, cruise: 0.5, weight: 0.35, pursuit: 0.45, spawnGround: 0.5 },
    sat: 38, lbase: 46, lrange: 16,
    randomHue: (R) => R(336, 352),   // the rosy lateral band
    spawnPos: (R) => ({ x: R(40, W - 40), y: R(120, WORLD.FLOOR - 200) }),
    senses(a, w) {
      // the nearest food it can take: a catchable fish or an emerged insect (trout rise to a hatch)
      const inp = a.act.in, pf = w.qPrey(a), ins = w.qInsect(a.x, a.y, a.senseRange);
      const food = !pf ? ins : !ins ? pf : (pf.dist < ins.dist ? pf : ins);
      tgt(a, food, a.senseRange, inp, 0);
      tgt(a, w.qThreat(a), a.senseRange * 1.1, inp, 3);
      inp[6] = clamp(a.energy, 0, 1);
      inp[7] = clamp(w.oxygenAt(a.x, a.y), 0, 1);
      inp[8] = wallProx(a);
      inp[9] = clamp(w.lightAt(a.x, a.y), 0, 1); inp[10] = clamp((w.tempAt(a.x, a.y) - 10) / 25, 0, 1);
    },
    P: { L: 3.0, Hh: 0.87, snout: 1.2, dorsal: true, dorsalX: 0.0, dorsalW: 0.26, dorsalH: 1.35, pattern: 'troutspots', scales: { p: 0.14, k: 0.06 },
      tail: { len: 1.5, spread: 1.05, sweep: 0.9, fork: 0.12 }, profile: t => { const e = ell(t, 0.66); return [e * 0.9, e * 0.92]; } },   // torpedo salmonid, square-ish tail
    draw(a, put, t, env, o) { drawFish(put, this.P, fishColors(a, this, env.light), o); },
  }),

  catfish: makeSpecies({
    key: 'catfish', name: 'Catfish', tag: '#b07b3f', size: 1.5, trophic: 'benthivore', schooling: false, zone: [0.78, 1.0],
    shape: { in: 10, hid: 10 },
    inputLabels: ['food \u2220sin', 'food \u2220cos', 'food near', 'threat \u2220sin', 'threat \u2220cos', 'threat near',
      'energy', 'on floor', 'oxygen', 'wall'],
    // brown bullheads are bottom omnivores: insect larvae, molluscs, crustaceans (cladocerans to crayfish), some fish, weed and
    // detritus (Scott & Crossman 1973) — on a lean bed they turn to snails and zooplankton
    diet: { detritus: true, plants: true, larva: true, snail: true, plankton: true, cray: 0.15 },   // bullheads eat crayfish (and scavenge them)
    maxSpeed: 34, accel: 44, maxTurn: 2.0, sink: 8,
    matingCooldown: yr(0.5), pop: { start: 2.5, min: 3, max: 6 },   // K ≈ 40; ~17 founders ≈ 30 kg/ha
    tempOpt: 29, tempTol: 9, o2Crit: 0.21, spawnT: [21, 28], nestGuard: yr(0.06), spawnSide: 1,   // warmwater bottom-dweller; spawns once in early summer; nests in cavities, guarded
    innate: { homeDepth: 0.92, depthPull: 0.7, cruise: 0.30, weight: 0.45, nocturnal: true, dayRest: 0.5, spawnGround: 0.4, forage: 0.5 },   // hugs the bottom; forages more at night
    sat: 30, lbase: 30, lrange: 18,
    randomHue: (R) => R(33, 50),
    spawnPos: (R) => ({ x: R(10, W - 10), y: R(WORLD.FLOOR - 30, WORLD.FLOOR - 2) }),
    senses(a, w) {
      // the nearest food: bottom invertebrates first (bullheads live on insect larvae), then detritus, then weed
      const inp = a.act.in, food = w.qLarva(a.x, a.y, a.senseRange) || w.qDetritus(a.x, a.y, a.senseRange) || w.qPlant(a.x, a.y, a.senseRange);
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

  carp: makeSpecies({
    key: 'carp', name: 'Carp', tag: '#c9a23f', size: 2.2, trophic: 'herbivore', schooling: false, zone: [0.55, 0.98],
    shape: { in: 10, hid: 9 },
    inputLabels: ['food \u2220sin', 'food \u2220cos', 'food near', 'threat \u2220sin', 'threat \u2220cos', 'threat near',
      'energy', 'oxygen', 'wall', 'depth'],
    diet: { plants: true, detritus: true, larva: true, snail: true, plankton: true },   // carp: midge larvae, molluscs, crustaceans incl. zooplankton,
                                                                                     //   weed and detritus (Scott & Crossman 1973)
    maxSpeed: 38, accel: 46, drag: 1.3, maxTurn: 1.8, sink: 6,   // negatively buoyant when feeding: it roots head-down in the sediment
    matingCooldown: yr(0.4), pop: { start: 0.45, min: 1, max: 1.5 },   // K ≈ 10 (carp are big: ~1.5 kg each); 3 founders ≈ 70 kg/ha (damage threshold ~100 kg/ha)
    tempOpt: 31, tempTol: 10, o2Crit: 0.21, spawnT: [17, 24], spawnSide: -1,   // warmwater; broadcast-spawns in flooded weeds in late spring; hugely fecund
    innate: { homeDepth: 0.95, depthPull: 0.5, cruise: 0.32, weight: 0.40, spawnGround: 0.4, forage: 0.5 },   // a bottom rooter (sifts the sediment)
    sat: 46, lbase: 34, lrange: 18,
    randomHue: (R) => R(32, 46),
    spawnPos: (R) => ({ x: R(10, W - 10), y: R(WORLD.FLOOR - 90, WORLD.FLOOR - 10) }),
    senses(a, w) {
      const inp = a.act.in;
      // carp root the sediment for midge larvae and other bottom invertebrates (most of their diet), weed when there are none
      tgt(a, w.qLarva(a.x, a.y, a.senseRange) || w.qPlant(a.x, a.y, a.senseRange), a.senseRange, inp, 0);
      tgt(a, w.qThreat(a), a.senseRange * 1.1, inp, 3);   // normalise by qThreat's own search radius (1.1×), as the other species do
                                                           // (by 1× the outer band read 0 proximity yet still gave a bearing)
      inp[6] = clamp(a.energy, 0, 1);
      inp[7] = clamp(w.oxygenAt(a.x, a.y), 0, 1);
      inp[8] = wallProx(a); inp[9] = clamp(a.y / H, 0, 1);
    },
    P: { L: 3.0, Hh: 0.98, snout: 1, dorsal: true, dorsalX: -0.06, dorsalW: 0.4, dorsalH: 1.45, scaleTex: 0.1, scales: { p: 0.42, k: 0.22 },
      tail: { len: 1.5, spread: 1.0, sweep: 0.7, fork: 0.32 }, profile: t => { const e = ell(t, 0.55); return [e * 0.96, e * 1.12]; } },   // deep robust, round belly
    draw(a, put, t, env, o) { drawFish(put, this.P, fishColors(a, this, env.light), o); },
  }),

  bass: makeSpecies({
    key: 'bass', capture: 0.4, name: 'Bass', tag: '#6fae5a', size: 1.7, trophic: 'predator', schooling: false, zone: [0.3, 0.85],
    shape: { in: 10, hid: 9 },
    inputLabels: ['prey \u2220sin', 'prey \u2220cos', 'prey near', 'energy', 'speed', 'oxygen', 'wall', 'rival density', 'light@depth', 'temp@depth'],
    diet: { fish: true, insect: true, larva: true, cray: 0.25 },   // young bass live on aquatic insects (Keast 1985; Olson 1996); crayfish are the adult bass's staple
    maxSpeed: 56, accel: 64, drag: 1.3, maxTurn: 2.2,
    matingCooldown: yr(0.5), pop: { start: 0.8, min: 1, max: 1.5 },   // K ≈ 10 — real lakes hold ~20–50 adult bass/ha against thousands of sunfish
    tempOpt: 29, tempTol: 7, o2Crit: 0.47, spawnT: [15, 21], nestGuard: yr(0.06), spawnSide: 1,   // warm-temperate pursuit predator; spawns once in late spring; the male guards nest + fry
    innate: { homeDepth: 0.8, depthPull: 0.35, cruise: 0.42, weight: 0.35, cover: 0.40, littoral: 0.5, pursuit: 0.5, spawnGround: 0.5 },  // patrols weed beds along the drop-off, low in the water near the bottom (summer bass hold near the bed and the weeds in the littoral); pursues prey it sees
    sat: 42, lbase: 32, lrange: 18,
    randomHue: (R) => R(100, 130),
    spawnPos: (R) => ({ x: R(10, W - 10), y: R(60, WORLD.FLOOR - 40) }),
    senses(a, w) {
      const inp = a.act.in;
      tgt(a, w.qPrey(a), a.senseRange, inp, 0);
      inp[3] = clamp(a.energy, 0, 1);
      inp[4] = a.spd / this.maxSpeed;
      inp[5] = clamp(w.oxygenAt(a.x, a.y), 0, 1);
      inp[6] = wallProx(a);
      inp[7] = w.allyStats(a, 64).density;
      inp[8] = clamp(w.lightAt(a.x, a.y), 0, 1); inp[9] = clamp((w.tempAt(a.x, a.y) - 10) / 25, 0, 1);
    },
    P: { L: 3.0, Hh: 0.96, snout: 1.4, dorsal: true, dorsalX: 0.02, dorsalW: 0.3, dorsalH: 1.5, pattern: 'band', scales: { p: 0.24, k: 0.10 },
      tail: { len: 1.6, spread: 1.0, sweep: 0.9, fork: 0.2 }, profile: t => { const e = ell(t, 0.72), sh = 1 + 0.1 * t; return [e * sh * 0.96, e * sh * 0.98]; } },   // streamlined, fuller forward
    draw(a, put, t, env, o) { drawFish(put, this.P, fishColors(a, this, env.light), o); },
  }),

  pike: makeSpecies({
    key: 'pike', capture: 0.6, name: 'Pike', tag: '#4c7a48', size: 2.7, trophic: 'apex', schooling: false, zone: [0.35, 0.95],
    shape: { in: 9, hid: 8 },
    inputLabels: ['prey \u2220sin', 'prey \u2220cos', 'prey near', 'energy', 'speed', 'oxygen', 'wall', 'light@depth', 'temp@depth'],
    diet: { fish: true, cray: 0.05 },   // a fish specialist: crayfish are an occasional item
    maxSpeed: 64, accel: 76, drag: 1.2, maxTurn: 2.0,
    matingCooldown: yr(0.5), pop: { start: 0.3, min: 1, max: 0.6, refuge: 1, rescue: 1 },   // K ≈ 4 — the rarest fish (a pike eats ~3–5× its own mass in fish a year: a slice of lake this size — ~0.07 ha — holds ~1 at real densities of ~10/ha, so the rescue keeps one in view; more are home-bred)
    tempOpt: 21, tempTol: 8, o2Crit: 0.32, spawnT: [4, 11], spawnSide: -1, coldPerf: 0.5,   // coolwater apex (summer-squeezed); spawns right after ice-out; hunts under ice
    innate: { homeDepth: 0.55, depthPull: 0.28, cruise: 0.16, weight: 0.45, ambush: true, cover: 0.55, pursuit: 0.4, spawnGround: 0.5 },  // weed-edge ambush lurker — holds in cover, then turns on and bursts at prey
    sat: 35, lbase: 30, lrange: 18,
    randomHue: (R) => R(88, 104),
    spawnPos: (R) => ({ x: R(10, W - 10), y: R(80, WORLD.FLOOR - 30) }),
    senses(a, w) {
      const inp = a.act.in;
      tgt(a, w.qPrey(a), a.senseRange, inp, 0);
      inp[3] = clamp(a.energy, 0, 1);
      inp[4] = a.spd / this.maxSpeed;
      inp[5] = clamp(w.oxygenAt(a.x, a.y), 0, 1);
      inp[6] = wallProx(a);
      inp[7] = clamp(w.lightAt(a.x, a.y), 0, 1); inp[8] = clamp((w.tempAt(a.x, a.y) - 10) / 25, 0, 1);
    },
    P: { L: 4.2, Hh: 0.85, snout: 2.0, dorsal: true, dorsalX: -0.55, dorsalW: 0.22, dorsalH: 1.5, pattern: 'spots', scales: { p: 0.16, k: 0.07 },
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
