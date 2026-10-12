// core.js — pure, DOM-free building blocks (RNG, math, spatial grid, neural net + GA)

// ---------- seeded RNG (mulberry32) so runs are reproducible & save/loadable ----------
let _state = (Math.random() * 2 ** 32) >>> 0;
export function seed(n) { _state = (n >>> 0) || 1; }
export function rand(a = 1, b) {
  // xorshift-ish mulberry32
  _state |= 0; _state = (_state + 0x6D2B79F5) | 0;
  let t = Math.imul(_state ^ (_state >>> 15), 1 | _state);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  const u = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return b === undefined ? u * a : a + u * (b - a);
}
export function gauss() {
  let u = 0, v = 0;
  while (!u) u = rand();
  while (!v) v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
export const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
export const lerp = (a, b, t) => a + (b - a) * t;
export const TAU = Math.PI * 2;

// hue/sat/light -> [r,g,b] 0..255
export function hsl(h, s, l) {
  s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12;
  const f = n => l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return [f(0) * 255, f(8) * 255, f(4) * 255];
}

// shortest signed angle difference
export function angDiff(a, b) {
  let d = (a - b) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d < -Math.PI) d += TAU;
  return d;
}

// predator of `predSize` can eat prey of `preySize`
export function canEat(predSize, preySize) { return preySize <= predSize * 0.85; }

// ---------- uniform spatial grid for O(local) neighbour queries ----------
export class SpatialGrid {
  constructor(w, h, cell) {
    this.w = w; this.h = h; this.cell = cell;
    this.cols = Math.ceil(w / cell);
    this.rows = Math.ceil(h / cell);
    this.buckets = new Array(this.cols * this.rows);
    for (let i = 0; i < this.buckets.length; i++) this.buckets[i] = [];
  }
  _idx(cx, cy) { return cy * this.cols + cx; }
  clear() { for (const b of this.buckets) b.length = 0; }
  rebuild(items) {
    this.clear();
    for (const it of items) {
      if (it.dead) continue;
      const cx = clamp((it.x / this.cell) | 0, 0, this.cols - 1);
      const cy = clamp((it.y / this.cell) | 0, 0, this.rows - 1);
      this.buckets[this._idx(cx, cy)].push(it);
    }
  }
  // call fn(item) for every item within `r` of (x,y)
  forNear(x, y, r, fn) {
    const c = this.cell;
    const minx = clamp(((x - r) / c) | 0, 0, this.cols - 1);
    const maxx = clamp(((x + r) / c) | 0, 0, this.cols - 1);
    const miny = clamp(((y - r) / c) | 0, 0, this.rows - 1);
    const maxy = clamp(((y + r) / c) | 0, 0, this.rows - 1);
    for (let cy = miny; cy <= maxy; cy++)
      for (let cx = minx; cx <= maxx; cx++) {
        const b = this.buckets[this._idx(cx, cy)];
        for (let i = 0; i < b.length; i++) fn(b[i]);
      }
  }
  // nearest item passing `ok(item)` within radius r; returns {item,dist} or null
  nearest(x, y, r, ok) {
    let best = null, bd = r * r;
    this.forNear(x, y, r, it => {
      if (ok && !ok(it)) return;
      const dx = it.x - x, dy = it.y - y, d = dx * dx + dy * dy;
      if (d < bd) { bd = d; best = it; }
    });
    return best ? { item: best, dist: Math.sqrt(bd) } : null;
  }
}

// ============================================================
//  NEURAL NET — feed-forward MLP, variable shape per species
//  genome layout: [W1(hid*in)] [B1(hid)] [W2(out*hid)] [B2(out)]
// ============================================================
export const OUT = 5; // motor outputs (every species): turn, thrust, + the brain-GATED ACTIONS strike / flee / hide
export const ACT_LABELS = ['turn', 'thrust', 'strike', 'flee', 'hide'];
// genome layout: [W1(hid*in)] [B1(hid)] [W2(out*hid)] [B2(out)] [LEAK(hid)]
// LEAK is the per-hidden-unit RECURRENCE gain (a leaky-integrator memory): sigmoid(leak) is the fraction of the
// previous activation each unit keeps, so the hidden state integrates over time → the brain has MEMORY.
export function genomeLen(shape) {
  return shape.hid * shape.in + shape.hid + OUT * shape.hid + OUT + shape.hid;
}
export function randomGenome(shape) {
  const n = genomeLen(shape), g = new Float32Array(n);
  for (let i = 0; i < n; i++) g[i] = rand(-0.8, 0.8);
  // start the ACTION outputs (strike/flee/hide — output indices ≥2) ~OFF via a negative output bias, so a fresh brain
  // swims like the old turn/thrust baseline and only fires actions where selection finds them worthwhile (emergent).
  const B2 = shape.hid * shape.in + shape.hid + OUT * shape.hid;   // output-bias block
  for (let k = 2; k < OUT; k++) g[B2 + k] = rand(-2.6, -0.9);
  // bias the LEAK params (the last `hid`) toward LOW memory so a fresh brain starts ~reactive (≈ the pre-recurrence
  // baseline); mutation/selection can raise them to discover memory where it pays off (emergent, not imposed).
  for (let j = n - shape.hid; j < n; j++) g[j] = rand(-3, -0.5);
  return g;
}
// Migrate a genome saved under an EARLIER output count (oldOut) — and optionally pre-recurrence (no LEAK) — to the
// CURRENT layout, PRESERVING the learned input→hidden weights, the shared turn/thrust output weights, and the memory
// (LEAK) — while seeding any NEW action outputs ~OFF (small weights, negative bias). So an evolved brain from before the
// action space loads still swimming as it learned, then evolves strike/flee/hide on top — no wipe of learned behaviour.
export function migrateGenome(w, shape, oldOut, hadLeak) {
  const IN = shape.in, HID = shape.hid, n = genomeLen(shape), g = new Float32Array(n);
  const oW2 = HID * IN + HID, oB2 = oW2 + oldOut * HID, oLK = oB2 + oldOut;        // old block offsets
  const nW2 = HID * IN + HID, nB2 = nW2 + OUT * HID, nLK = nB2 + OUT;              // new block offsets
  for (let i = 0; i < HID * IN + HID; i++) g[i] = w[i];                            // W1 + B1 verbatim
  for (let k = 0; k < OUT; k++) for (let j = 0; j < HID; j++)                      // W2: copy shared rows, new rows small
    g[nW2 + k * HID + j] = k < oldOut ? w[oW2 + k * HID + j] : rand(-0.3, 0.3);
  for (let k = 0; k < OUT; k++) g[nB2 + k] = k < oldOut ? w[oB2 + k] : rand(-2.6, -0.9);  // B2: new action biases ~off
  for (let j = 0; j < HID; j++) g[nLK + j] = hadLeak ? w[oLK + j] : -4;            // LEAK: keep, or memoryless
  return g;
}
// Migrate a genome saved with FEWER inputs (oldIn) to the current shape, PRESERVING every weight and ZEROING the new
// input columns — so the added sensors start with NO effect (a fresh-input lake behaves exactly as before) and evolution
// wires them in. W1 is row-major [HID × IN]: copy each hidden unit's old row, leave its extra input weights at 0; B1/W2/
// B2/LEAK copy verbatim (their sizes are input-independent), shifted by the W1 size difference.
export function migrateGenomeInputs(w, shape, oldIn) {
  const IN = shape.in, HID = shape.hid, n = genomeLen(shape), g = new Float32Array(n);
  for (let j = 0; j < HID; j++) for (let i = 0; i < oldIn; i++) g[j * IN + i] = w[j * oldIn + i];   // W1 rows (new input cols stay 0)
  const oTail = HID * oldIn, nTail = HID * IN, len = HID + OUT * HID + OUT + HID;   // B1 + W2 + B2 + LEAK (input-independent)
  for (let k = 0; k < len; k++) g[nTail + k] = w[oTail + k];
  return g;
}
export function mutate(src, rate = 0.10, std = 0.35, reset = 0.015, clampW = 4) {
  const g = new Float32Array(src);
  for (let i = 0; i < g.length; i++) {
    if (rand() < reset) g[i] = rand(-1.2, 1.2);
    else if (rand() < rate) g[i] = clamp(g[i] + gauss() * std, -clampW, clampW);
  }
  return g;
}
// uniform crossover of two same-length genomes
export function crossover(a, b) {
  const n = Math.min(a.length, b.length), g = new Float32Array(n);
  for (let i = 0; i < n; i++) g[i] = rand() < 0.5 ? a[i] : b[i];
  return g;
}

// ---------- multi-gene genome (heritable traits beyond the brain) ----------
// A small vector of trait MULTIPLIERS around 1.0, applied to the species baseline (size, top speed,
// stress tolerance). Heritable like the brain (blend on crossover + mutate), seeded RNG (sim state).
// body size · top speed · thermal/O₂ tolerance · fin (maneuverability) · eye (vision range) · body depth.
// The first three are physiological; fin/eye/body are heritable MORPHOLOGY — functional (turn / sense range /
// drag+predation-defence) AND drawn (caudal+pectoral fins, eye, body depth), with costs folded into metabolism so
// they trade off. randomGenes/crossoverGenes/mutateGenes are length-agnostic, so they extend automatically.
// `brain` = a heritable BRAIN-SIZE multiplier: it sets how many of the species' hidden units are ACTIVE (the rest are masked
// inert in forward), so a lineage can evolve a SMALLER, cheaper brain where the full net isn't needed (a per-neuron metabolic
// SAVING vs the full-brain baseline → the encephalization trade-off). At brain≈1.0 the full hidden layer is active (= baseline).
export const GENE_KEYS = ['size', 'speed', 'tol', 'fin', 'eye', 'body', 'brain'];
export const GENE_MIN = 0.7, GENE_MAX = 1.35;
export function randomGenes() {
  const g = new Float32Array(GENE_KEYS.length);
  for (let i = 0; i < g.length; i++) g[i] = clamp(1 + gauss() * 0.05, GENE_MIN, GENE_MAX);  // start near 1.0
  return g;
}
// blend (average) both parents' genes — quantitative traits are polygenic/blending, not coin-flip
export function crossoverGenes(a, b) {
  const n = Math.min(a.length, b.length), g = new Float32Array(n);
  for (let i = 0; i < n; i++) g[i] = (a[i] + b[i]) * 0.5;
  return g;
}
export function mutateGenes(src, rate = 0.5, std = 0.05) {
  const g = Float32Array.from(src);
  for (let i = 0; i < g.length; i++) { if (rand() < rate) g[i] += gauss() * std; g[i] = clamp(g[i], GENE_MIN, GENE_MAX); }
  return g;
}
// ---------- macrophyte (plant) trait genome ----------
// Heritable plant traits as MULTIPLIERS around 1.0 on the variety baseline (MACRO[p.v]). Like the fish genes
// they blend/mutate via crossoverGenes/mutateGenes (length-agnostic) and clamp to GENE_MIN..GENE_MAX. Physical &
// visible (max height `maxH`, leaf area `leaf`, colour) AND functional (growth rate `grow`, light & warmth
// REQUIREMENTS `light`/`warmth`, grazing palatability `palat`). NOTE the two requirement genes read "higher = MORE
// demanding": higher `light` → higher lightMin → LESS shade-tolerant; higher `warmth` → higher tempMin → LESS
// cold-tolerant (tolerance is the inverse of the requirement). Trade-offs (low requirement / low palatability cost
// growth) make different habitats select different optima → divergent selection. Starting near 1.0, so a fresh
// lake behaves exactly like the pre-evolution baseline.
export const PLANT_GENE_KEYS = ['maxH', 'grow', 'light', 'warmth', 'palat', 'leaf'];
export function randomPlantGenes() {
  const g = new Float32Array(PLANT_GENE_KEYS.length);
  for (let i = 0; i < g.length; i++) g[i] = clamp(1 + gauss() * 0.06, GENE_MIN, GENE_MAX);   // start near 1.0
  return g;
}
// forward pass; writes activations into act {h:Float32Array(hid), o, turn, thrust}. `activeHid` (≤ shape.hid; default = full)
// is the EVOLVABLE BRAIN SIZE: hidden units ≥ activeHid are MASKED — inert, no activation, no memory — so a smaller brain
// uses fewer units (the genome stays full-size; masking just zeros the surplus). Default = shape.hid → no masking (baseline).
export function forward(g, inp, act, shape, activeHid) {
  const IN = shape.in, HID = shape.hid, AH = activeHid === undefined ? HID : activeHid;
  const W1 = 0, B1 = HID * IN, W2 = B1 + HID, B2 = W2 + OUT * HID, LK = B2 + OUT;
  for (let j = 0; j < HID; j++) {
    if (j >= AH) { act.h[j] = 0; continue; }   // masked unit (evolved-away): inert, contributes nothing to the outputs, holds no memory
    let s = g[B1 + j];
    const base = W1 + j * IN;
    for (let i = 0; i < IN; i++) s += g[base + i] * inp[i];
    // leaky-integrator RECURRENCE: keep a learned fraction (sigmoid(leak)) of this unit's PREVIOUS activation, so the
    // hidden state integrates over time → memory. act.h persists on the agent across ticks (deterministic; advanced by
    // the fixed timestep). leak≈0 → reactive/memoryless (the old behaviour); leak≈1 → a slow integrator. Stays in
    // [-1,1] (a convex blend of values in [-1,1]) → bounded, no runaway.
    const leak = 1 / (1 + Math.exp(-g[LK + j]));
    act.h[j] = leak * act.h[j] + (1 - leak) * Math.tanh(s);
  }
  for (let k = 0; k < OUT; k++) {
    let s = g[B2 + k];
    const base = W2 + k * HID;
    for (let j = 0; j < HID; j++) s += g[base + j] * act.h[j];
    act.o[k] = s;
  }
  act.turn = Math.tanh(act.o[0]);          // -1..1
  act.thrust = 1 / (1 + Math.exp(-act.o[1])); // 0..1
  // brain-GATED ACTIONS — each a 0..1 "intent" the move/feed steps turn into a visible burst/freeze (world.js)
  act.strike = 1 / (1 + Math.exp(-act.o[2]));  // predatory lunge: extra thrust + longer strike reach
  act.flee = 1 / (1 + Math.exp(-act.o[3]));  // escape sprint: extra thrust + a brief speed-cap lift
  act.hide = 1 / (1 + Math.exp(-act.o[4]));  // freeze + seek cover: suppress thrust, harder for predators to catch
}

// LIFETIME LEARNING — reward-modulated Hebbian plasticity on the POLICY layer (W2: hidden→output). Modifies the plastic
// weights `lw` IN PLACE (BALDWINIAN — the inherited genotype `g` is only the decay reference, never written, so offspring
// don't inherit the learned state). When `reward` > 0 (the fish just ate) each hidden→output weight is reinforced by the
// correlation of the hidden activation `act.h[j]` (pre) with the CENTERED output activation (post) — strengthening the
// action just taken in this brain state. Every step a HOMEOSTATIC decay pulls each plastic weight back toward `g` (so
// unreinforced changes fade), and a hard clip bounds it. Pure & DETERMINISTIC (no RNG); only the W2 block is touched.
export function reinforce(lw, g, shape, act, reward, dt, RATE, DECAY, CLAMP) {
  const IN = shape.in, HID = shape.hid, W2 = IN * HID + HID;
  const post = [act.turn, act.thrust * 2 - 1, act.strike * 2 - 1, act.flee * 2 - 1, act.hide * 2 - 1];  // centered post-synaptic activations (−1..1)
  const dec = DECAY * dt;
  for (let k = 0; k < OUT; k++) {
    const pk = post[k], base = W2 + k * HID;
    for (let j = 0; j < HID; j++) {
      const idx = base + j;
      let w = lw[idx] + dec * (g[idx] - lw[idx]);            // homeostatic pull toward the inherited genotype
      if (reward > 0) w += RATE * reward * act.h[j] * pk;    // 3-factor reward-modulated Hebbian reinforcement
      lw[idx] = w < -CLAMP ? -CLAMP : (w > CLAMP ? CLAMP : w);
    }
  }
}
