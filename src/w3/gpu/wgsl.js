// wgsl.js — the GPU fish engine's KERNELS (docs/GPU_SIM.md, G1), as WGSL source strings — pure (no WebGPU calls here). Each is a
// port of the fish3.js function it names, line for line where it can be; where the GPU must differ (every fish at once rather than
// one after another, a counter-based random stream rather than core.rand) the comment says so. The numbers come from layout.js's
// wgslConstants (the CPU sim's own config), so the two engines can't drift apart in a constant.
//
// BINDINGS. Group 0, every kernel: U (the block's uniforms), A (the agents, field-major), ST (the statics), WD (the water this
// block), BR (the brains' state), GN (genomes + genes). Group 1 by family: the grid's build buffers, or the sim's (the grids to
// read, the young, the accumulators, the tallies, the globals).

export const UNIFORMS = /* wgsl */`
struct Uni {
  n: u32, cap: u32, ny: u32, ycap: u32, blk: u32, seed: u32, dtU: u32, yr: i32,
  dt: f32, yf: f32, lux0: f32, luxB0: f32, luxB1: f32, luxB2: f32, att: f32, clar: f32,
  sun: f32, night: f32, migD: f32, migC: f32, timeD: f32, yr0D: f32, siteYr: i32, plants: u32,
  lit: u32, siCoord: u32, siGrid: u32, siNX: u32,
  wY: f32, q1: f32, q2: f32, q3: f32,
};`;
// the uniform block's layout for the host (same order; 4 bytes each)
export const UNI_FIELDS = ['n:u', 'cap:u', 'ny:u', 'ycap:u', 'blk:u', 'seed:u', 'dtU:u', 'yr:i', 'dt', 'yf', 'lux0', 'luxB0', 'luxB1', 'luxB2', 'att', 'clar',
  'sun', 'night', 'migD', 'migC', 'timeD', 'yr0D', 'siteYr:i', 'plants:u', 'lit:u', 'siCoord:u', 'siGrid:u', 'siNX:u', 'wY', 'q1', 'q2', 'q3'];

export const CORE_BINDINGS = /* wgsl */`
@group(0) @binding(0) var<uniform> U: Uni;
@group(0) @binding(1) var<storage, read_write> A: array<f32>;
@group(0) @binding(2) var<storage, read> ST: array<f32>;
@group(0) @binding(3) var<storage, read_write> WD: array<f32>;
@group(0) @binding(4) var<storage, read_write> BR: array<f32>;
@group(0) @binding(5) var<storage, read_write> GN: array<f32>;`;

// the shared helpers: field access, the random stream, the world's rasters and the water's columns, the fish's small formulas
export const COMMON = /* wgsl */`
// ---- agent fields (field-major; integers as bit patterns) ----
fn ga(f: u32, i: u32) -> f32 { return A[f * U.cap + i]; }
fn gau(f: u32, i: u32) -> u32 { return bitcast<u32>(A[f * U.cap + i]); }
fn gai(f: u32, i: u32) -> i32 { return bitcast<i32>(A[f * U.cap + i]); }
fn sa(f: u32, i: u32, v: f32) { A[f * U.cap + i] = v; }
fn sau(f: u32, i: u32, v: u32) { A[f * U.cap + i] = bitcast<f32>(v); }
fn sai(f: u32, i: u32, v: i32) { A[f * U.cap + i] = bitcast<f32>(v); }
fn br(r: u32, i: u32) -> f32 { return BR[r * U.cap + i]; }
fn sbr(r: u32, i: u32, v: f32) { BR[r * U.cap + i] = v; }
fn gn(r: u32, i: u32) -> f32 { return GN[r * U.cap + i]; }
// ---- statics and water ----
fn stf(o: u32) -> f32 { return ST[o]; }
fn sti(o: u32) -> i32 { return bitcast<i32>(ST[o]); }
fn stu(o: u32) -> u32 { return bitcast<u32>(ST[o]); }
fn wd(o: u32) -> f32 { return WD[o]; }
fn wdi(o: u32) -> i32 { return bitcast<i32>(WD[o]); }
fn spv(k: u32, f: u32) -> f32 { return ST[O_spT + k * SP_REC + f]; }
fn bio(bs: u32, f: u32) -> f32 { return ST[O_bioT + bs * BIO_REC + f]; }
// ---- THE RANDOM STREAM: counter-based (a hash of seed, agent id, block, purpose and draw), so a draw never depends on the order
// the GPU's threads run in (fish3.js draws core.rand in the fish's order: the two engines agree in distribution, not draw by draw)
fn hash32(x0: u32) -> u32 { var x = x0; x ^= x >> 16u; x *= 0x7feb352du; x ^= x >> 15u; x *= 0x846ca68bu; x ^= x >> 16u; return x; }
fn rnd(id: u32, purpose: u32, k: u32) -> f32 {
  let h = hash32(U.seed ^ hash32(id ^ hash32(U.blk ^ hash32(purpose * 0x9E3779B9u + k * 0x632BE5ABu))));
  return f32(h >> 8u) * (1.0 / 16777216.0);
}
fn rndR(id: u32, purpose: u32, k: u32, a: f32, b: f32) -> f32 { return a + (b - a) * rnd(id, purpose, k); }   // (core.js rand(a, b))
// ---- small formulas (fish3.js helpers) ----
fn expm(x: f32) -> f32 { if (abs(x) < 1e-3) { return x * (1.0 - x * (0.5 - x / 6.0)); } return 1.0 - exp(-x); }   // 1 − e^(−x), exact for small x in f32
fn sight(lux: f32, kI: f32) -> f32 { return lux / (lux + kI); }
// tanh to f32 accuracy (the built-in is the hardware's approximation on some GPUs: ~5e-4 on NVIDIA's — the brains then drifted from the CPU's)
fn tanh_(x: f32) -> f32 { let a = abs(x); if (a < 0.0625) { let x2 = x * x; return x * (1.0 - x2 * (0.33333334 - x2 * 0.13333334)); } let e = exp(-2.0 * a); return sign(x) * (1.0 - e) / (1.0 + e); }
fn sigm(x: f32) -> f32 { return 1.0 / (1.0 + exp(-x)); }
// THE FIRST WINTER (config WINTER0, winterDays/winterP/winterStep): the days of winter behind a fish, and the ramp's share of the
// survivors over a step that brought it from w − dw to w days
fn wDays(yf: f32) -> f32 { let d = fract(yf - WIN_YF0 + 2.0); let span = fract(WIN_YF1 - WIN_YF0 + 2.0); return select(0.0, d * 365.0, d < span); }
fn wP(Lmm: f32, w: f32, kn: f32, kx: f32) -> f32 { let cx = kx * (WINTER0_A_MAX * w + WINTER0_B_MAX); let cn = kn * (WINTER0_A_MIN * w + WINTER0_B_MIN); if (cx <= cn) { return select(0.0, 1.0, Lmm < cx); } return clamp((cx - Lmm) / (cx - cn), 0.0, 1.0); }
fn wStep(Lmm: f32, w: f32, dw: f32, kn: f32, kx: f32) -> f32 { if (!(w > 0.0)) { return 0.0; } let p0 = wP(Lmm, max(0.0, w - dw), kn, kx); let p1 = wP(Lmm, w, kn, kx); if (p0 >= 1.0) { return 1.0; } return max(0.0, (p1 - p0) / (1.0 - p0)); }
// the winter's hazard rate over a step of dt s for a first-winter fish of L cm — in place of its starvation; −1: no ramp applies
// (not winter, not its first year, a fish born since the winter began — this spring's larvae —, or a species without one)
fn wHaz(k: u32, L: f32, age: f32, dt: f32) -> f32 { let kn = spv(k, S_wkMin); if (WINTER0_ON < 0.5 || kn <= 0.0 || age >= YEAR) { return -1.0; } let wd = wDays(U.yf); if (!(wd > 0.0) || wd >= age / DAY) { return -1.0; } let f = wStep(L * 10.0, wd, dt / DAY, kn, spv(k, S_wkMax)); if (f >= 1.0) { return 50.0 / dt; } return -log(1.0 - f) / dt; }
fn smooth01(a: f32, b: f32, x: f32) -> f32 { let t = clamp((x - a) / (b - a), 0.0, 1.0); return t * t * (3.0 - 2.0 * t); }
fn lethalO2(l25: f32, floor_: f32, T: f32) -> f32 { return max(l25 * exp(BIOE_O2_LETHAL_T * (T - 25.0)), floor_); }
fn engaged(x: f32) -> f32 { if (x > ACTION_ENGAGE) { return (x - ACTION_ENGAGE) / (1.0 - ACTION_ENGAGE); } return 0.0; }
fn coldPerf(T: f32, tOpt: f32, floor_: f32) -> f32 { let f = max(floor_, ENV_COLD_PERF_MIN); if (T >= tOpt) { return 1.0; } return clamp(f + (1.0 - f) * (T - 2.0) / max(1.0, tOpt - 2.0), f, 1.0); }
fn angDiff(a: f32, b: f32) -> f32 { var d = a - b; d = d - 6.283185307179586 * floor((d + 3.141592653589793) / 6.283185307179586); return d; }
// ---- THE WORLD (geometry.js) ----
fn cellIndex(x: f32, y: f32) -> i32 {
  let c = i32(floor((x - GX0) / GCELL)); let r = i32(floor((y - GY0) / GCELL));
  if (c < 0 || r < 0 || c >= i32(GNX) || r >= i32(GNY)) { return -1; }
  return r * i32(GNX) + c;
}
fn bodyAt(x: f32, y: f32) -> u32 { let i = cellIndex(x, y); if (i < 0) { return LAND; } return stu(O_gBody + u32(i)); }
fn bilin(off: u32, x: f32, y: f32) -> f32 {
  let fx = min(max((x - GX0) / GCELL - 0.5, 0.0), f32(GNX) - 1.0001); let fy = min(max((y - GY0) / GCELL - 0.5, 0.0), f32(GNY) - 1.0001);
  let c = u32(fx); let r = u32(fy); let tx = fx - f32(c); let ty = fy - f32(r); let i = off + r * GNX + c;
  return (ST[i] * (1.0 - tx) + ST[i + 1u] * tx) * (1.0 - ty) + (ST[i + GNX] * (1.0 - tx) + ST[i + GNX + 1u] * tx) * ty;
}
fn depthAt(x: f32, y: f32) -> f32 { return bilin(O_gDepth, x, y); }
fn shoreDist(x: f32, y: f32) -> f32 { let i = cellIndex(x, y); if (i < 0) { return -1e3; } if (stu(O_gBody + u32(i)) != LAND) { return bilin(O_gShore, x, y); } return -stf(O_gToWater + u32(i)); }
fn cellCentre(i: u32) -> vec2f { return vec2f(GX0 + (f32(i % GNX) + 0.5) * GCELL, GY0 + (f32(i / GNX) + 0.5) * GCELL); }
fn deeper(x: f32, y: f32) -> vec2f { let i = cellIndex(x, y); if (i < 0) { return vec2f(0.0); } return vec2f(stf(O_gSlX + u32(i)), stf(O_gSlY + u32(i))); }
fn bp(q: u32) -> vec2f { return vec2f(stf(O_bPath + 2u * q), stf(O_bPath + 2u * q + 1u)); }
fn nearestBP(x: f32, y: f32) -> i32 { var b = 0; var bd = 1e9; for (var q = 0u; q < BPN; q++) { let d = length(bp(q) - vec2f(x, y)); if (d < bd) { bd = d; b = i32(q); } } return b; }
const CSCALE: f32 = 1e6; const BSCALE: f32 = 1e3;   // (the block's sums: fish in millionths, grams in thousandths)
// ---- THE WATER (env3.js): the column at (x, y), its cells, the bed cell for a depth ----
fn colAt(x: f32, y: f32) -> i32 {
  if (OWN_BROOK == 1u) { let i = cellIndex(x, y); if (i >= 0) { let c = sti(O_gColF + u32(i)); if (c >= 0) { return c; } } }
  let gx = i32(floor((x - WX0) / WCOL)); let gy = i32(floor((y - WY0) / WCOL));
  if (gx < 0 || gy < 0 || gx >= i32(WCX) || gy >= i32(WCY)) { return -1; }
  return sti(O_wGridCol + u32(gy) * WCX + u32(gx));
}
fn cell0(c: u32) -> u32 { return u32(sti(O_wCell0 + c)); }
fn nL(c: u32) -> u32 { return stu(O_wNL + c); }
fn bedCell(c: i32, bed: f32) -> i32 { if (c < 0) { return -1; } return sti(O_fBedOf + u32(c) * WML + u32(min(i32(WML) - 1, max(0, i32(floor(bed / WDZ)))))); }
// fish3 _inWeeds: the stands' cover on bed cell jb (plants3 cov, by the littoral index) for a fish hb m above the bed — within the
// canopy's height (a coarse block: its share of the block there, the heights gamma-distributed), none above the weeds
fn inWeeds(jb: i32, cu: u32, hb: f32, share: bool) -> f32 {
  if (U.plants == 0u || jb < 0) { return 0.0; }
  let cn = wd(W_canopy + cu); if (!(cn > 0.0)) { return 0.0; }
  let li = sti(O_litIdx + u32(jb)); if (li < 0) { return 0.0; }
  var f = select(0.0, 1.0, hb <= cn); if (share) { let x = 2.0 * cn / max(0.02, hb); f = 1.0 - exp(-x) * (1.0 + x); }
  return f * wd(W_pCov + u32(li));
}
fn layerCell(c: u32, z: f32) -> u32 { return cell0(c) + u32(min(i32(nL(c)) - 1, max(0, i32(z / WDZ)))); }
fn colX(c: u32) -> f32 { return stf(O_wCX + c); }
fn colY(c: u32) -> f32 { return stf(O_wCY + c); }
// ---- the species ----
fn gsiOf(k: u32, sex: u32) -> f32 { if (sex == 0u) { return spv(k, S_gsiF); } if (sex == 1u) { return spv(k, S_gsiM); } return (spv(k, S_gsiF) + spv(k, S_gsiM)) / 2.0; }
fn stdWeight(k: u32, L: f32) -> f32 { return spv(k, S_lwA) * pow(L, spv(k, S_lwB)); }
fn lengthFor(k: u32, W: f32) -> f32 { return pow(W / spv(k, S_lwA), 1.0 / spv(k, S_lwB)); }
// ---- 64-bit fixed-point sums (two u32 words, the carry by hand): order-independent, so a total is the same however the threads
// run. v ≥ 0, in units of 1/scale
fn add64(p: ptr<storage, array<atomic<u32>>, read_write>, at: u32, v: f32, scale: f32) {
  let q = max(v, 0.0) * scale; if (!(q >= 1.0)) { return; }
  let hi = floor(q / 4294967296.0); let lo = u32(min(q - hi * 4294967296.0, 4294967295.0));
  let old = atomicAdd(&(*p)[at], lo);
  var carry = u32(hi); if (old > 0xFFFFFFFFu - lo) { carry += 1u; }
  if (carry > 0u) { atomicAdd(&(*p)[at + 1u], carry); }
}
`;

// ============================================================ THE NEIGHBOUR GRID (fish3 _hashBuild) =============================
// A counting sort of the agents into F3.HC-m cells over the lakes: count (atomics), an exclusive scan, scatter (atomics), then each
// cell's items sorted by agent index — so the scan order within a cell is the CPU's (it scatters in index order), and ties in the
// senses (the nearest prey at an equal distance) fall the same way however the threads ran
export const GRID_BINDINGS = /* wgsl */`
@group(1) @binding(0) var<storage, read_write> CNT: array<atomic<u32>>;   // per cell: the count, then the scatter cursor
@group(1) @binding(1) var<storage, read_write> HS: array<u32>;            // per cell: its first item (exclusive scan); HS[NH] the total
@group(1) @binding(2) var<storage, read_write> HI: array<u32>;            // the items (agent index), by cell
@group(1) @binding(3) var<storage, read_write> HC: array<u32>;            // each agent's cell
@group(1) @binding(4) var<storage, read_write> SUMS: array<u32>;          // the scan's block sums (levels)
struct GridP { nItems: u32, nCells: u32, off: u32, lvlN: u32, src: u32, dst: u32, kind: u32, p: u32 };
@group(1) @binding(5) var<uniform> GP: GridP;
@group(1) @binding(6) var<storage, read_write> Y: array<f32>;             // (kind 1: the young schools' grid)`;
export const GRID = /* wgsl */`
fn hcOf(x: f32, y: f32) -> u32 {   // fish3 _hc: the lakes' grid
  let gx = clamp(i32((x - GX0) / F3_HC), 0, i32(HHX) - 1); let gy = clamp(i32((y - GY0) / F3_HC), 0, i32(HHY) - 1);
  return u32(gy) * HHX + u32(gx);
}
@compute @workgroup_size(256) fn g_clear(@builtin(global_invocation_id) g: vec3u) { if (g.x < GP.nCells) { atomicStore(&CNT[g.x], 0u); } }
@compute @workgroup_size(256) fn g_count(@builtin(global_invocation_id) g: vec3u) {
  let i = g.x; if (i >= GP.nItems) { return; }
  var c = 0xFFFFFFFFu;
  if (GP.kind == 0u) { if ((gau(A_flags, i) & FL_ALIVE) != 0u) { c = hcOf(ga(A_x, i), ga(A_y, i)); } }
  else if ((bitcast<u32>(Y[Y_flags * U.ycap + i]) & 1u) != 0u) { c = hcOf(Y[Y_x * U.ycap + i], Y[Y_y * U.ycap + i]); }
  HC[i] = c; if (c != 0xFFFFFFFFu) { atomicAdd(&CNT[c], 1u); }
}
// the scan: each workgroup scans 512 numbers (SUMS[src..] at level lvl) into dst and writes its total to SUMS[off + wg]
var<workgroup> sh: array<u32, 512>;
@compute @workgroup_size(256) fn g_scan(@builtin(global_invocation_id) g: vec3u, @builtin(local_invocation_id) l: vec3u, @builtin(workgroup_id) w: vec3u) {
  let n = GP.lvlN; let b = w.x * 512u; let t = l.x;
  let i0 = b + 2u * t; let i1 = i0 + 1u;
  var v0 = 0u; var v1 = 0u;
  if (GP.src == 0xFFFFFFFFu) { if (i0 < n) { v0 = atomicLoad(&CNT[i0]); } if (i1 < n) { v1 = atomicLoad(&CNT[i1]); } }
  else { if (i0 < n) { v0 = SUMS[GP.src + i0]; } if (i1 < n) { v1 = SUMS[GP.src + i1]; } }
  sh[2u * t] = v0; sh[2u * t + 1u] = v1;
  // up-sweep
  var off = 1u;
  for (var d = 256u; d > 0u; d >>= 1u) { workgroupBarrier(); if (t < d) { let ai = off * (2u * t + 1u) - 1u; let bi = off * (2u * t + 2u) - 1u; sh[bi] += sh[ai]; } off <<= 1u; }
  workgroupBarrier();
  if (t == 0u) { SUMS[GP.off + w.x] = sh[511]; sh[511] = 0u; }
  // down-sweep
  for (var d = 1u; d < 512u; d <<= 1u) { off >>= 1u; workgroupBarrier(); if (t < d) { let ai = off * (2u * t + 1u) - 1u; let bi = off * (2u * t + 2u) - 1u; let tmp = sh[ai]; sh[ai] = sh[bi]; sh[bi] += tmp; } }
  workgroupBarrier();
  if (GP.dst == 0xFFFFFFFFu) { if (i0 < n) { HS[i0] = sh[2u * t]; } if (i1 < n) { HS[i1] = sh[2u * t + 1u]; } }
  else { if (i0 < n) { SUMS[GP.dst + i0] = sh[2u * t]; } if (i1 < n) { SUMS[GP.dst + i1] = sh[2u * t + 1u]; } }
}
// add each block's scanned offset (SUMS[src + block]) back into the level below (HS when dst is none)
@compute @workgroup_size(256) fn g_add(@builtin(global_invocation_id) g: vec3u) {
  let i = g.x; if (i >= GP.lvlN) { return; }
  let add = SUMS[GP.src + i / 512u];
  if (GP.dst == 0xFFFFFFFFu) { HS[i] += add; } else { SUMS[GP.dst + i] += add; }
}
// the total into HS[nCells] and the cursors (CNT reused) at each cell's start
@compute @workgroup_size(256) fn g_cursor(@builtin(global_invocation_id) g: vec3u) {
  let c = g.x; if (c > GP.nCells) { return; }
  if (c == GP.nCells) { if (c > 0u) { HS[c] = HS[c - 1u] + atomicLoad(&CNT[c - 1u]); } else { HS[0] = 0u; } return; }
}
@compute @workgroup_size(256) fn g_cursor2(@builtin(global_invocation_id) g: vec3u) { let c = g.x; if (c < GP.nCells) { atomicStore(&CNT[c], HS[c]); } }
@compute @workgroup_size(256) fn g_scatter(@builtin(global_invocation_id) g: vec3u) {
  let i = g.x; if (i >= GP.nItems) { return; } let c = HC[i]; if (c == 0xFFFFFFFFu) { return; }
  let p = atomicAdd(&CNT[c], 1u); HI[p] = i;
}
@compute @workgroup_size(256) fn g_sort(@builtin(global_invocation_id) g: vec3u) {   // each cell's items in index order (insertion sort: a cell holds a few)
  let c = g.x; if (c >= GP.nCells) { return; }
  let s = HS[c]; let e = HS[c + 1u]; if (e - s < 2u) { return; }
  for (var q = s + 1u; q < e; q++) { let v = HI[q]; var r = q; while (r > s && HI[r - 1u] > v) { HI[r] = HI[r - 1u]; r -= 1u; } HI[r] = v; }
}`;

// ============================================================ THE SIM FAMILY's bindings ==========================================
export const SIM_BINDINGS = /* wgsl */`
@group(1) @binding(0) var<storage, read> HS: array<u32>;
@group(1) @binding(1) var<storage, read> HI: array<u32>;
@group(1) @binding(2) var<storage, read_write> TL: array<atomic<u32>>;   // the tallies (64-bit fixed point pairs)
@group(1) @binding(3) var<storage, read_write> GL: array<f32>;           // the block's globals (per species: counts, the run's sites…)
@group(1) @binding(4) var<storage, read> SI: array<f32>;                 // the spawning grounds (layout.js packSites)
@group(1) @binding(5) var<storage, read_write> GS: array<atomic<u32>>;   // the block's sums (64-bit fixed point), → GL by k_glob
@group(1) @binding(6) var<storage, read_write> PX: array<vec4f>;         // where every fish was at the last snapshot: x, y, z, its flags' bits
@group(1) @binding(7) var<storage, read_write> ACC: array<atomic<u32>>;  // the food wanted per cell and kind, the O₂ breathed, the dead's bodies (64-bit fixed point)
@group(1) @binding(8) var<storage, read_write> RC: array<f32>;           // per cell and kind: the share of what was wanted that was got
// GL (f32) and GS (pairs) slots
const G_CNT: u32 = 0u;     // + k: fish of each species (Σ n)
const G_RUNIN: u32 = 16u;  // + k: ripe fish holding one of the brook's nest sites
const G_BIO: u32 = 32u;    // g of fish (followed + young)
const G_CAND: u32 = 33u;   // any runner at the brook's mouth this block (k_admit runs)
const G_JUVD: u32 = 48u;   // + k: the young's density (/m²)
const GS_CNT: u32 = 0u; const GS_RUNIN: u32 = 32u; const GS_BIO: u32 = 64u; const GS_CAND: u32 = 66u; const GS_JUVD: u32 = 80u;
const GS_CLAIMP0: u32 = 512u;   // + i: the highest priority claiming fish i (then + cap + i: how many claimed it)`;
// tallies: [pairs] — cross by species, settle, trips, stranded deaths; more as the kernels come (index helpers)
export const TALLY = /* wgsl */`
const T_CROSS: u32 = 0u;      // + 2k: fish that reached the other lake
const T_SETTLE: u32 = 32u;    // + 2k: settled there
const T_TRIPS: u32 = 64u;     // + 2k: set off on a trip
const T_FOOD: u32 = 128u;     // + 2·kind: grams eaten by the followed fish
const T_FOODK: u32 = 1024u;   // + 2·(k·NFOODK + kind): the followed fish's grams by species and food (G3 diagnostics: fish, young, bed, weeds, crayfish, surface, zooplankton, organic layer)
const NFOODK: u32 = 8u;
const T_YKILLS: u32 = 1216u;  // + 2·(predator·NK + prey): young-of-year fish eaten by the followed fish (diagnostics)
const T_YYKILLS: u32 = 1458u; // + 2·(predator·NK + prey): young eaten by other young (a young piscivore's school)
const T_YFOODK: u32 = 1700u;  // + 2·(k·5 + kind): the young's grams by species and food (young fish, zooplankton, weeds' fauna, bed, organic layer)
const T_YCAP: u32 = 1820u;    // + 2k: the young a recruiting school had no room for in the census (fish3 stats.fry.capped)
const T_KILLSZ: u32 = 1850u;  // + 2·(prey·4 + class): followed fish eaten by the prey's length class (< 10, 10–20, 20–30, ≥ 30 cm)
const T_KILLPZ: u32 = 1940u;  // + 2·(predator·4 + class): the same by the predator
const T_STRM: u32 = 2048u;    // + 2·(predator·NK + prey): THE STRIKES' ENCOUNTERS (diagnostics, stage P2) — fish within a strike's reach,
const T_STRG: u32 = 2290u;    //   those it could take (gape, size, room),
const T_STRW: u32 = 2532u;    //   and their strike weight (capture × vuln × size × hide × cover × school), summed over the strikes' scans
const T_KILLD: u32 = 2780u;   // + 2·(prey·5 + class): followed fish eaten by the bed's depth under them (< 0.3, 0.3–0.6, 0.6–1, 1–2, ≥ 2 m)
const T_KILLC: u32 = 2890u;   // + 2·(prey·3 + class): … by their cover then (< 0.1, 0.1–0.5, ≥ 0.5)
fn lenClass(L: f32) -> u32 { return select(select(select(3u, 2u, L < 30.0), 1u, L < 20.0), 0u, L < 10.0); }
const T_INTAKE: u32 = 160u;   // + 2k: grams eaten by species
const T_KILLS: u32 = 192u;    // + 2·(predator·NK + prey): followed fish eaten
const T_DIED: u32 = 448u;     // + 2·(k·NCAUSE + cause)
const FOOD_ZOO: u32 = 0u; const FOOD_BENTH: u32 = 1u; const FOOD_WEED: u32 = 2u; const FOOD_CRAY: u32 = 3u; const FOOD_SURF: u32 = 4u; const FOOD_FISH: u32 = 5u; const FOOD_SED: u32 = 6u; const FOOD_YOY: u32 = 7u;
const FOOD_YZOO: u32 = 8u; const FOOD_YWEED: u32 = 9u; const FOOD_YBENTH: u32 = 10u; const FOOD_YSED: u32 = 11u;   // (the young's own eating)
const T_FRY: u32 = 640u;     // + 2·(k·NFRY + cause): the young's fates
const FRY_NATURAL: u32 = 0u; const FRY_STARVE: u32 = 1u; const FRY_HEAT: u32 = 2u; const FRY_HYPOXIA: u32 = 3u; const FRY_EATEN: u32 = 4u; const FRY_RECRUITED: u32 = 5u; const FRY_HATCHED: u32 = 6u; const NFRY: u32 = 7u;
const T_EGGS: u32 = 800u; const T_SPAWNS: u32 = 824u; const T_SPAWNSUB: u32 = 848u; const T_SPAWNBED: u32 = 872u; const T_SPAWNBROOK: u32 = 896u; const T_RECRUITS: u32 = 920u; const T_SOLO: u32 = 944u;   // + 2k
const CAUSE_STARVE: u32 = 0u; const CAUSE_HEAT: u32 = 1u; const CAUSE_HYPOXIA: u32 = 2u; const CAUSE_OTHER: u32 = 3u; const CAUSE_OLD: u32 = 4u; const CAUSE_EATEN: u32 = 5u; const CAUSE_STRANDED: u32 = 6u;
const NCAUSE: u32 = 7u;
fn foodK(k: u32, kind: u32, g: f32) { if (g > 0.0) { add64(&TL, T_FOODK + 2u * (k * NFOODK + kind), g, TSCALE); } }
const TSCALE: f32 = 1e6;      // tallies in millionths (of a fish, of a gram)
`;

// ============================================================ THE START OF A FISH'S BLOCK (fish3 _livePre) ======================
export const PRE = /* wgsl */`
fn matureAt(i: u32, k: u32) -> bool {
  let age = f32(gau(A_age, i)); let mma = spv(k, S_matMinAge);
  let lmatAt = max(BIOE_PMRN_FLOOR, 1.0 - BIOE_PMRN_SLOPE * max(0.0, (age - mma) / YEAR));
  return age >= mma && ga(A_L, i) >= ga(A_Lmat, i) * lmatAt;
}
fn ripeNow(i: u32, k: u32, fl: u32, ice: f32, Ts: f32, nt: f32) -> bool {   // fish3 _ripe
  if ((fl & FL_MATURE) == 0u || ga(A_mateCd, i) > 0.0 || nt > 0.0 || U.yf >= SPAWN_SEASON_END || ice >= 0.5) { return false; }
  if (ga(A_gon, i) < SPAWN_GON_READY * gsiOf(k, gau(A_sex, i)) * ga(A_W, i) || ga(A_K, i) < SPAWN_K_READY) { return false; }
  return Ts >= spv(k, S_spawnT0) - F3_SPAWN_LEAD && Ts <= spv(k, S_spawnT1) + SPAWN_EDGE;
}
fn subAt(u: u32, x: f32, y: f32) -> f32 {   // fish3 _subAt: the spawning-structure index under (x, y)
  if (U.plants == 0u || u == 0u) { return 1.0; }
  let c = colAt(x, y); if (c < 0) { return 0.0; }
  let jb = bedCell(c, max(0.05, depthAt(x, y))); if (jb < 0) { return 0.0; }
  let ix = sti(O_plIdx + u32(jb)); if (ix < 0) { return 0.0; }
  if (u == 1u) { return wd(W_spRigid + u32(ix)); } if (u == 2u) { return wd(W_spMat + u32(ix)); } return wd(W_spPlant + u32(ix));
}
fn pickSpot(i: u32, k: u32, id: u32, lake: u32) {   // fish3 _pickSpot (its 80 tries from the agent's own stream)
  let R = F3_SUB_R; let x0 = ga(A_x, i); let y0 = ga(A_y, i); let sub = u32(spv(k, S_sbSub));
  var best = -1e9; var bx = x0; var by = y0;
  for (var t = 0u; t < u32(F3_SUB_TRIES); t++) {
    let x = x0 + rndR(id, 11u, 2u * t, -R, R); let y = y0 + rndR(id, 11u, 2u * t + 1u, -R, R);
    if (bodyAt(x, y) != lake) { continue; }
    let bed = depthAt(x, y); if (bed < spv(k, S_sbBot0) || bed > spv(k, S_sbBot1) || colAt(x, y) < 0) { continue; }
    let v = subAt(sub, x, y) - F3_SUB_DETOUR * length(vec2f(x - x0, y - y0)) / R; if (v > best) { best = v; bx = x; by = y; }
  }
  sa(A_spX, i, bx); sa(A_spY, i, by);
}
fn homeIn(k: u32, lake: u32, id: u32, purpose: u32) -> vec3f {   // fish3 _homeIn: (x, y, found)
  let li = k * 2u + lake - 1u; let s = u32(sti(O_fHome0 + li)); let e = u32(sti(O_fHome0 + li + 1u)); let n = e - s;
  if (n == 0u) { return vec3f(0.0); }
  let end = select(bp(BLAST), bp(0u), lake == UPPER);
  for (var t = 0u; t < 30u; t++) {
    let q = min(n - 1u, u32(rnd(id, purpose, 2u * t) * f32(n))); let p = cellCentre(u32(sti(O_fHomeL + s + q)));
    if (t == 29u || rnd(id, purpose, 2u * t + 1u) < exp(-length(p - end) / (F3_ROAM_L * GSCALE))) { return vec3f(p, 1.0); }
  }
  return vec3f(0.0);
}
fn roam(i: u32, k: u32, id: u32, flIn: u32, x: f32, y: f32, nt: f32) -> u32 {   // fish3 _roam; returns the flags
  var fl = flIn; let b = bodyAt(x, y); let n = ga(A_n, i);
  let inLake = gau(A_inLake, i);
  if ((b == UPPER || b == LOWER) && b != inLake) { if (inLake == UPPER || inLake == LOWER) { add64(&TL, T_CROSS + 2u * k, n, TSCALE); } sau(A_inLake, i, b); }
  let settle = spv(k, S_mvSettle); let trip = spv(k, S_mvTrip);
  if (settle <= 0.0 && trip <= 0.0) { return fl; }
  let lake = gau(A_lake, i);
  if ((fl & FL_RIPE) != 0u || nt > 0.0 || ga(A_tripEndD, i) > U.timeD || b != lake || (fl & FL_BROOKIE) != 0u || f32(gau(A_age, i)) < YEAR) { return fl; }
  let end = select(bp(BLAST), bp(0u), lake == UPPER);
  let w = exp(-length(vec2f(ga(A_lhx, i), ga(A_lhy, i)) - end) / (F3_ROAM_L * GSCALE)) / stf(O_fRoamMean + lake);
  let y0 = spv(k, S_mvYf0); let y1 = spv(k, S_mvYf1); let inS = y0 < 0.0 || (U.yf >= y0 && U.yf < y1); let span = select(1.0, y1 - y0, y0 >= 0.0);
  let t0 = spv(k, S_mvTripYf0); let t1 = spv(k, S_mvTripYf1); let inT = t0 < 0.0 || (U.yf >= t0 && U.yf < t1); let spanT = select(1.0, t1 - t0, t0 >= 0.0);
  let other = select(UPPER, LOWER, lake == UPPER);
  if (settle > 0.0 && inS && rnd(id, 12u, 0u) < settle / span * w * U.dt / YEAR) {
    let p = homeIn(k, other, id, 13u); if (p.z == 0.0) { return fl; }
    sau(A_lake, i, other); sa(A_lhx, i, p.x); sa(A_hx, i, p.x); sa(A_lhy, i, p.y); sa(A_hy, i, p.y); add64(&TL, T_SETTLE + 2u * k, n, TSCALE);
    fl &= ~FL_BROOKIE;
    let e2 = select(bp(BLAST), bp(0u), other == UPPER);
    if (spv(k, S_sbSiteBrook) > 0.0 && length(p.xy - e2) < F3_BROOK_RUN) { fl |= FL_BROOKRUN; } else { fl &= ~FL_BROOKRUN; }
  } else if (trip > 0.0 && inT && rnd(id, 12u, 1u) < trip / spanT * w * U.dt / YEAR) {
    let p = homeIn(k, other, id, 14u); if (p.z == 0.0) { return fl; }
    sa(A_tpx, i, p.x); sa(A_tpy, i, p.y); sa(A_tripEndD, i, U.timeD + spv(k, S_mvTripD) * (0.6 + 0.8 * rnd(id, 12u, 2u))); add64(&TL, T_TRIPS + 2u * k, n, TSCALE);
  }
  return fl;
}
@compute @workgroup_size(128) fn k_pre(@builtin(global_invocation_id) g: vec3u) {
  let i = g.x; if (i >= U.n) { return; }
  var fl = gau(A_flags, i); if ((fl & FL_ALIVE) == 0u) { return; }
  let k = gau(A_k, i); let id = gau(A_id, i); let dt = U.dt;
  sau(A_age, i, gau(A_age, i) + U.dtU); sa(A_mateCd, i, ga(A_mateCd, i) - dt);
  let mc = ga(A_missCd, i); if (mc > 0.0) { sa(A_missCd, i, mc - dt); }
  var nt = ga(A_nt, i); if (nt > 0.0) { nt -= dt; if (ga(A_K, i) < BROOD_GUARD_QUIT) { nt = 0.0; } sa(A_nt, i, nt); }   // (a guard grown too thin leaves its nest)
  if ((fl & FL_MATURE) == 0u && matureAt(i, k)) { fl |= FL_MATURE; }
  let x = ga(A_x, i); let y = ga(A_y, i); let z = ga(A_z, i);
  let bed = max(0.05, depthAt(x, y)); sa(A_bed, i, bed);
  let c = colAt(x, y); sai(A_c, i, c);
  if (c < 0) { add64(&TL, T_DIED + 2u * (k * NCAUSE + CAUSE_STRANDED), ga(A_n, i), TSCALE); sau(A_flags, i, fl & ~FL_ALIVE); return; }
  let cu = u32(c); let j = layerCell(cu, z); sai(A_j, i, i32(j)); sai(A_jb, i, bedCell(c, bed));
  sa(A_T, i, wd(W_temp + j)); sa(A_o2, i, wd(W_o2 + j));
  let ice = wd(W_ice + cu);
  if (ripeNow(i, k, fl, ice, wd(W_temp + cell0(cu)), nt)) { fl |= FL_RIPE; } else { fl &= ~(FL_RIPE | FL_INRUN); }
  if ((fl & FL_RIPE) != 0u && spv(k, S_sbSub) > 0.0 && spv(k, S_sbSites) <= 0.0 && ((fl & FL_SP) == 0u || gai(A_spYr, i) != U.yr)) {
    pickSpot(i, k, id, gau(A_lake, i)); fl |= FL_SP; sai(A_spYr, i, U.yr);
  }
  fl = roam(i, k, id, fl, x, y, nt);
  let iceCut = 1.0 - ICE_LIGHT_CUT * ice; let fade = exp(-U.att * z); let kI = spv(k, S_kI); let lf = iceCut * fade; let nv = spv(k, S_nonVis);
  sa(A_vis, i, max(nv, sight(U.lux0 * lf, kI)) * U.clar);
  sa(A_visF, i, max(nv, (sight(U.luxB0 * lf, kI) + 2.0 * sight(U.luxB1 * lf, kI) + sight(U.luxB2 * lf, kI)) / 4.0) * U.clar);
  let rif = select(0.0, F3_RIFFLE_REFUGE, ga(A_L, i) < F3_RIFFLE_L && bed < F3_RIFFLE_D && bodyAt(x, y) == BROOK);
  var cov = max(inWeeds(bedCell(c, bed), cu, bed - z, F3_BED_SHARE > 0.5), rif);   // (fish3: the shallows are the predator's reach — k_strike)
  let bury = spv(k, S_bury); if (bury > 0.0 && bed - z <= F3_BURY_H) { cov = max(cov, bury * clamp((9.0 - wd(W_temp + j)) / 4.0, 0.0, 1.0)); }   // (fish3: dug into the mud in winter)
  sa(A_cover, i, cov);
  sa(A_fear, i, ga(A_fear, i) * exp(-F3_FEAR_DECAY * dt));
  sau(A_flags, i, fl);
}
`;

// ============================================================ LEARNING (fish3 reinforce3) ========================================
// on the decision just acted on: the plastic hidden→output block, rewarded if it ate since, relaxing toward the genome's own
export const LEARN_K = /* wgsl */`
@compute @workgroup_size(128) fn k_learn(@builtin(global_invocation_id) g: vec3u) {
  let i = g.x; if (i >= U.n) { return; }
  var fl = gau(A_flags, i); if ((fl & FL_ALIVE) == 0u || (fl & FL_DECIDED) == 0u) { return; }
  let dec = expm(F3_LEARN_DECAY * U.dt); let R = LEARN_RATE * select(0.0, 1.0, (fl & FL_ATE) != 0u); let C = LEARN_CLAMP;
  for (var kk = 0u; kk < NO; kk++) {
    let o = br(NW2 + HID + kk, i); let pk = select(o * 2.0 - 1.0, o, kk < 2u);
    for (var j = 0u; j < HID; j++) {
      let r = kk * HID + j; var w = br(r, i) + dec * (gn(W2OFF + r, i) - br(r, i));
      if (R > 0.0) { w += R * br(NW2 + j, i) * pk; }
      sbr(r, i, clamp(w, -C, C));
    }
  }
  sau(A_flags, i, fl & ~FL_ATE);
}
`;

// ============================================================ THE SENSES (fish3 _sense, canPrey) =================================
// one pass over the neighbours in the grid (the nearest prey, the nearest threat, its own kind about it) and the food fields.
// (Every fish senses the others where the block began: the CPU's fish sense those before them in the list where they moved to)
export const SENSE = /* wgsl */`
fn canPrey(p: u32, q: u32) -> bool {
  let kp = gau(A_k, p); if (spv(kp, S_pisc) < 0.5 || ga(A_L, p) < spv(kp, S_Lpisc) || p == q) { return false; }
  let Lp = ga(A_L, p); let Lq = ga(A_L, q);
  return ga(A_bdep, q) <= ga(A_gape, p) && Lq >= FEED_PREY_MIN * Lp && Lq <= spv(kp, S_preyLR) * Lp;
}
fn zooExposed(j: u32, kind: u32) -> f32 {
  let m = select(U.migD, U.migC, kind == 1u);
  return (1.0 - m * stf(O_wRefAv + u32(sti(O_wColOfCell + j))) * (1.0 - PLANKTON_TWILIGHT)) * (1.0 - wd(W_plantRef + j));
}
fn zooE(j: u32) -> f32 {
  let v = wd(W_zv + j); if (v <= 0.0) { return 0.0; }
  return (wd(W_zooD + j) * zooExposed(j, 0u) + wd(W_zooC + j) * (1.0 - ZOO3_COPE_ESCAPE) * zooExposed(j, 1u)) * v * PLANKTON_UGL;
}
@compute @workgroup_size(128) fn k_sense(@builtin(global_invocation_id) g: vec3u) {
  let i = g.x; if (i >= U.n) { return; }
  let fl = gau(A_flags, i); if ((fl & FL_ALIVE) == 0u) { return; }
  let k = gau(A_k, i); let x = ga(A_x, i); let y = ga(A_y, i); let z = ga(A_z, i); let L = ga(A_L, i);
  let senseR = ga(A_senseR, i); let vis = ga(A_vis, i);
  let R = max(0.6, senseR * vis); let Rt = max(0.8, senseR * 1.1 * vis); let Ra = F3_ALLY_R;
  let RR = max(max(R, Rt), Ra); let R2 = RR * RR;
  var prey = -1; var threat = -1; var pd = R; var td = Rt; var sx = 0.0; var sy = 0.0; var sz = 0.0; var sn = 0.0;
  let canEat = spv(k, S_pisc) > 0.5 && L >= spv(k, S_Lpisc);
  let gx0 = clamp(i32((x - RR - GX0) / F3_HC), 0, i32(HHX) - 1); let gx1 = clamp(i32((x + RR - GX0) / F3_HC), 0, i32(HHX) - 1);
  let gy0 = clamp(i32((y - RR - GY0) / F3_HC), 0, i32(HHY) - 1); let gy1 = clamp(i32((y + RR - GY0) / F3_HC), 0, i32(HHY) - 1);
  for (var gy = gy0; gy <= gy1; gy++) {
    for (var gx = gx0; gx <= gx1; gx++) {
      let c = u32(gy) * HHX + u32(gx);
      for (var q = HS[c]; q < HS[c + 1u]; q++) {
        let jx = HI[q]; if (jx == i) { continue; }
        let dx = ga(A_x, jx) - x; let dy = ga(A_y, jx) - y; let dz = ga(A_z, jx) - z; let d2 = dx * dx + dy * dy + dz * dz;
        if (d2 > R2) { continue; }
        if ((gau(A_flags, jx) & FL_ALIVE) == 0u) { continue; }
        let d = sqrt(d2);
        if (gau(A_k, jx) == k && d < Ra) { let nb = ga(A_n, jx); sx += dx * nb; sy += dy * nb; sz += dz * nb; sn += nb; }   // (offsets from the fish: absolute positions ~3 km out summed in f32 lost ~0.2 m)
        if (d < td && canPrey(jx, i)) { td = d; threat = i32(jx); }
        if (canEat && d < pd && canPrey(i, jx)) { pd = d; prey = i32(jx); }
      }
    }
  }
  sai(A_prey, i, prey); sai(A_threat, i, threat);
  sa(A_td, i, select(-1.0, td, threat >= 0));
  if (threat >= 0) { sa(A_fear, i, max(ga(A_fear, i), clamp(1.0 - td / Rt, 0.0, 1.0))); }
  if (sn > 0.0) { sa(A_ax, i, x + sx / sn); sa(A_ay, i, y + sy / sn); sa(A_az, i, z + sz / sn); }
  sa(A_an, i, select(0.0, sn, sn > 0.0));
  if (prey >= 0) {
    let p = u32(prey); sau(A_fk, i, 1u); sa(A_fx, i, ga(A_x, p)); sa(A_fy, i, ga(A_y, p)); sa(A_fz, i, ga(A_z, p)); sa(A_fd, i, pd); sa(A_fv, i, 1.0); return;
  }
  // the fields: the richest bed (bottom feeders) or zooplankton (planktivores) about it — its own column and the next ones
  var fk = 0u; var fv = 0.0; var fx = 0.0; var fy = 0.0; var fz = 0.0;
  let c = u32(gai(A_c, i)); let j = u32(gai(A_j, i)); let jb = gai(A_jb, i); let bed = ga(A_bed, i);
  let small = spv(k, S_pisc) < 0.5 || L < 3.0 * spv(k, S_Lpisc) || spv(k, S_cray) > 0.0;
  if (spv(k, S_benthic) > 0.5 && small) {
    var best = BENTHOS_SENSE_MIN; var bc = -1; let o2c = ga(A_o2Crit, i);
    if (jb >= 0 && wd(W_o2 + u32(jb)) >= o2c) { let E = wd(W_benth + u32(jb)) / A2 - BENTHOS_REFUGE; if (E > best) { best = E; bc = i32(c); } }
    let s0 = u32(sti(O_fNbr20 + c)); let s1 = u32(sti(O_fNbr20 + c + 1u));
    for (var q = s0; q < s1; q++) {
      let cc = u32(sti(O_fNbr2L + q)); let jj = sti(O_fColBedJ + cc);
      if (jj < 0 || wd(W_o2 + u32(jj)) < o2c) { continue; }
      let E = wd(W_benth + u32(jj)) / A2 - BENTHOS_REFUGE; if (E > best) { best = E; bc = i32(cc); }
    }
    if (bc >= 0) {
      let v = best / (best + F3_K_BENTH);
      if (v > fv) { fk = 2u; fv = v; fx = select(colX(u32(bc)), x, u32(bc) == c); fy = select(colY(u32(bc)), y, u32(bc) == c); fz = bed - 0.15; }
    }
  }
  if (spv(k, S_plank) > 0.5 || L < spv(k, S_Lzoo)) {
    let K = F3_K_ZOO; var best = PLANKTON_SENSE_MIN * K; var bj = -1;
    let k0 = j - cell0(c);
    { let E = zooE(j); if (E > best) { best = E; bj = i32(j); } }
    if (k0 > 0u) { let E = zooE(j - 1u); if (E > best) { best = E; bj = i32(j) - 1; } }
    if (k0 < nL(c) - 1u) { let E = zooE(j + 1u); if (E > best) { best = E; bj = i32(j) + 1; } }
    let s0 = u32(sti(O_fNbr0 + c)); let s1 = u32(sti(O_fNbr0 + c + 1u));
    for (var q = s0; q < s1; q++) { let cc = u32(sti(O_fNbrL + q)); let jj = cell0(cc) + min(nL(cc) - 1u, k0); let E = zooE(jj); if (E > best) { best = E; bj = i32(jj); } }
    if (bj >= 0) {
      let v = best * best / (best * best + K * K);
      if (v > fv) { let cc = u32(sti(O_wColOfCell + u32(bj))); fk = 3u; fv = v; fx = select(colX(cc), x, cc == c); fy = select(colY(cc), y, cc == c); fz = stf(O_wZMid + u32(bj)); }
    }
  }
  sau(A_fk, i, fk); sa(A_fv, i, fv);
  if (fk >= 2u) { sa(A_fx, i, fx); sa(A_fy, i, fy); sa(A_fz, i, fz); sa(A_fd, i, length(vec3f(fx - x, fy - y, fz - z))); } else { sa(A_fd, i, -1.0); }
}
`;

// ============================================================ THE BRAIN (fish3 _brain: deeper, senses, forward3) ===============
export const BRAIN_K = /* wgsl */`
@compute @workgroup_size(64) fn k_brain(@builtin(global_invocation_id) g: vec3u) {
  let i = g.x; if (i >= U.n) { return; }
  let fl = gau(A_flags, i); if ((fl & FL_ALIVE) == 0u) { return; }
  let k = gau(A_k, i); let x = ga(A_x, i); let y = ga(A_y, i); let z = ga(A_z, i); let yaw = ga(A_yaw, i);
  let dh = deeper(x, y); sa(A_dhx, i, dh.x); sa(A_dhy, i, dh.y);
  var inp: array<f32, 26>;
  let cy = cos(yaw); let sy = sin(yaw);
  let fk = gau(A_fk, i);
  if (fk != 0u) {
    let dx = ga(A_fx, i) - x; let dy = ga(A_fy, i) - y; var d = length(vec2f(dx, dy)); if (d == 0.0) { d = 1e-6; }
    inp[0] = (dx * sy - dy * cy) / d; inp[1] = (dx * cy + dy * sy) / d; inp[2] = clamp((z - ga(A_fz, i)) / 2.0, -1.0, 1.0);
    inp[3] = select(ga(A_fv, i), clamp(1.0 - ga(A_fd, i) / max(0.6, ga(A_senseR, i)), 0.0, 1.0), fk == 1u);
  }
  let th = gai(A_threat, i);
  if (th >= 0) {
    let t = u32(th); let dx = ga(A_x, t) - x; let dy = ga(A_y, t) - y; var d = length(vec2f(dx, dy)); if (d == 0.0) { d = 1e-6; }
    inp[4] = (dx * sy - dy * cy) / d; inp[5] = (dx * cy + dy * sy) / d; inp[6] = clamp((z - ga(A_z, t)) / 2.0, -1.0, 1.0); inp[7] = ga(A_fear, i);
  }
  let an = ga(A_an, i);
  if (an > 0.0) {
    let dx = ga(A_ax, i) - x; let dy = ga(A_ay, i) - y; var d = length(vec2f(dx, dy)); if (d == 0.0) { d = 1e-6; }
    inp[8] = (dx * sy - dy * cy) / d; inp[9] = (dx * cy + dy * sy) / d; inp[10] = clamp(an / 8.0, 0.0, 1.0);
  }
  let bed = ga(A_bed, i);
  inp[11] = clamp(z / 6.0, 0.0, 1.0); inp[12] = clamp((bed - z) / 3.0, 0.0, 1.0); inp[13] = clamp(bed / 6.0, 0.0, 1.0);
  inp[14] = clamp(1.0 - shoreDist(x, y) / F3_FAR, 0.0, 1.0);
  inp[15] = dh.x * sy - dh.y * cy; inp[16] = dh.x * cy + dh.y * sy;
  inp[17] = ga(A_vis, i); inp[18] = clamp((ga(A_T, i) - spv(k, S_tempOpt)) / 10.0, -1.0, 1.0); inp[19] = clamp(ga(A_o2, i) / 1.2, 0.0, 1.0);
  inp[20] = ga(A_energy, i); inp[21] = ga(A_hunger, i); inp[22] = ga(A_fear, i);
  let hx = ga(A_hx, i) - x; let hy = ga(A_hy, i) - y; let hd = length(vec2f(hx, hy));
  if (hd > 0.5) { inp[23] = (hx * sy - hy * cy) / hd; inp[24] = (hx * cy + hy * sy) / hd; }
  inp[25] = clamp(hd / (2.0 * spv(k, S_home)), 0.0, 1.0);
  // forward3: the recurrent net — leaky hidden units (their memory the sigmoid of the genome's LEAK block), six outputs
  let act = gau(A_active, i);
  let B1 = HID * NI; let W2 = HID * NI + HID; let B2 = W2 + NO * HID; let LK = B2 + NO;
  var h: array<f32, 10>;
  for (var jj = 0u; jj < HID; jj++) {
    if (jj >= act) { h[jj] = 0.0; sbr(NW2 + jj, i, 0.0); continue; }
    var s = gn(B1 + jj, i); let b = jj * NI;
    for (var q = 0u; q < NI; q++) { s += gn(b + q, i) * inp[q]; }
    let lk = 1.0 / (1.0 + exp(-gn(LK + jj, i)));
    h[jj] = lk * br(NW2 + jj, i) + (1.0 - lk) * tanh_(s);
    sbr(NW2 + jj, i, h[jj]);
  }
  for (var kk = 0u; kk < NO; kk++) {
    var s = gn(B2 + kk, i); let b = kk * HID;
    for (var jj = 0u; jj < act; jj++) { s += br(b + jj, i) * h[jj]; }
    sbr(NW2 + HID + kk, i, select(sigm(s), tanh_(s), kk < 2u));
  }
  sau(A_flags, i, fl | FL_DECIDED);
}
`;

// ============================================================ THE BLOCK'S BOOKKEEPING ==========================================
// the snapshot of where every fish is (PX: what other fish read of it while it moves — deterministic, as no fish reads a position
// another thread is writing); the block's sums (fish per species — the recruitment cap; the run's held nest sites; the lakes' fish
// biomass — the zooplankton's kairomone) into GL; and the brook's nest sites given out (fish3 _goal's admission at the mouth)
export const BOOK = /* wgsl */`
@compute @workgroup_size(256) fn k_snap(@builtin(global_invocation_id) g: vec3u) {
  let i = g.x; if (i >= U.n) { return; }
  PX[i] = vec4f(ga(A_x, i), ga(A_y, i), ga(A_z, i), bitcast<f32>(gau(A_flags, i)));
}
fn runs(fl: u32, i: u32) -> bool { return (fl & FL_BROOKRUN) != 0u && gai(A_runYr, i) != U.yr; }   // (fish3 _runs: a brook runner not turned back this season)
fn atMouth(x: f32, y: f32) -> bool { let R = F3_RUN_MOUTH; let a = vec2f(x, y) - bp(0u); let b = vec2f(x, y) - bp(BLAST); return dot(a, a) < R * R || dot(b, b) < R * R; }
fn runCand(i: u32, fl: u32, k: u32) -> bool {
  return (fl & FL_ALIVE) != 0u && (fl & FL_RIPE) != 0u && spv(k, S_sbRunK) > 0.0 && runs(fl, i) && (fl & FL_INRUN) == 0u && (bodyAt(ga(A_x, i), ga(A_y, i)) == BROOK || atMouth(ga(A_x, i), ga(A_y, i)));
}
@compute @workgroup_size(256) fn k_sums(@builtin(global_invocation_id) g: vec3u) {
  let i = g.x; if (i >= U.n) { return; }
  let fl = gau(A_flags, i); if ((fl & FL_ALIVE) == 0u) { return; }
  let k = gau(A_k, i); let n = ga(A_n, i);
  add64(&GS, GS_CNT + 2u * k, n, CSCALE); add64(&GS, GS_BIO, n * ga(A_W, i), BSCALE);
  if ((fl & FL_INRUN) != 0u && (fl & FL_RIPE) != 0u) { add64(&GS, GS_RUNIN + 2u * k, n, CSCALE); }
  if (runCand(i, fl, k)) { atomicMax(&GS[GS_CAND], 1u); }
}
fn rd64(at: u32) -> f32 { return f32(atomicLoad(&GS[at])) + f32(atomicLoad(&GS[at + 1u])) * 4294967296.0; }
@compute @workgroup_size(64) fn k_glob(@builtin(local_invocation_id) l: vec3u) {
  let t = l.x;
  if (t < NK) { GL[G_CNT + t] = rd64(GS_CNT + 2u * t) / CSCALE; GL[G_RUNIN + t] = rd64(GS_RUNIN + 2u * t) / CSCALE; GL[G_JUVD + t] = rd64(GS_JUVD + 2u * t) / CSCALE; }
  if (t == 0u) { GL[G_BIO] = rd64(GS_BIO) / BSCALE; GL[G_CAND] = f32(atomicLoad(&GS[GS_CAND])); }
}
// THE BROOK'S NEST SITES (fish3 _goal: a runner reaching the brook's mouth — or in it — takes a site if one is free, else turns back
// for the season): one workgroup walks the fish in index order (a scan of 256 at a time), each candidate admitted while the sum
// of those before it fits — the CPU admits them in its list's order as they arrive; here all who reached the mouth by the block's
// start (one arriving during a block is admitted at the next)
var<workgroup> wsc: array<f32, 256>;
var<workgroup> wtot: f32;
var<workgroup> wroom: f32;
var<workgroup> wflag: f32;
@compute @workgroup_size(256) fn k_admit(@builtin(local_invocation_id) l: vec3u) {
  let t = l.x;
  if (t == 0u) { wflag = GL[G_CAND]; }
  if (workgroupUniformLoad(&wflag) < 0.5) { return; }
  for (var ks = 0u; ks < NK; ks++) {
    if (spv(ks, S_sbRunK) <= 0.0) { continue; }
    if (t == 0u) { wroom = spv(ks, S_sbRunK) * BROOK_A - GL[G_RUNIN + ks]; wtot = 0.0; }
    workgroupBarrier();
    for (var base = 0u; base < U.n; base += 256u) {
      let i = base + t; var v = 0.0; var cand = false; var fl = 0u;
      if (i < U.n) { fl = gau(A_flags, i); if (gau(A_k, i) == ks && runCand(i, fl, ks)) { cand = true; v = ga(A_n, i); } }
      wsc[t] = v;
      for (var off = 1u; off < 256u; off <<= 1u) { workgroupBarrier(); let w = select(0.0, wsc[t - off], t >= off); workgroupBarrier(); wsc[t] += w; }
      workgroupBarrier();
      if (cand) { if (wtot + wsc[t] <= wroom) { sau(A_flags, i, fl | FL_INRUN); } else { sai(A_runYr, i, U.yr); } }
      workgroupBarrier();
      if (t == 255u) { wtot += wsc[255]; }
      workgroupBarrier();
    }
  }
}
`;

// ============================================================ WHERE A FISH GOES (fish3 _mode, _goal, _route, _drive, _relocate, _hop)
// A coarse block: its drives' pulls (a heading and how far its strongest pull needs it to go) and its brain's bend, hop by hop
// through the bed's grid, re-aimed after each; then a wander about the place; its depth to the drives' target. Other fish's
// places (a mate, a threat) are read from the snapshot PX
export const MOVE = /* wgsl */`
struct Mode { b0: f32, b1: f32, v: f32, h: f32, act: f32 };
fn brookSeason(T: f32) -> bool { return U.yf > 0.22 && U.yf < 0.6 && T > 14.0; }
fn bl(p: f32, q: f32, t: f32) -> f32 { return p + (q - p) * t; }
fn modeOf(k: u32, fl: u32, nt: f32, T: f32, L: f32, x: f32, y: f32) -> Mode {
  if (nt > 0.0) { return Mode(0.0, 99.0, 0.0, 0.05, BROOD_HOVER); }
  if ((fl & FL_RIPE) != 0u) { return Mode(spv(k, S_sbBot0), spv(k, S_sbBot1), 0.0, spv(k, S_sbH), 0.9); }
  if ((fl & FL_BROOKIE) != 0u && brookSeason(T) && bodyAt(x, y) == BROOK) { return Mode(select(0.2, F3_RIFFLE_D, L >= F3_RIFFLE_L), 1.3, 0.0, 0.25, 0.6); }   // (bigger-deeper)
  let nf = 1.0 - smooth01(0.02, 0.3, U.sun); let wf = clamp((9.0 - T) / 4.0, 0.0, 1.0);
  let jL0 = spv(k, S_hJL0); let jL1 = spv(k, S_hJL1); let jf = select(0.0, 1.0 - clamp((L - jL0) / max(1e-6, jL1 - jL0), 0.0, 1.0), jL1 > 0.0);   // (fish3 _mode: the young's day band)
  let dlo = bl(spv(k, S_hD0), spv(k, S_hJ0), jf); let dhi = bl(spv(k, S_hD1), spv(k, S_hJ1), jf);
  let lo = bl(dlo, spv(k, S_hN0), nf); let hi = bl(dhi, spv(k, S_hN1), nf);
  let jw = select(0.0, jf, spv(k, S_hJW1) > 0.0); let wlo = bl(spv(k, S_hW0), spv(k, S_hJW0), jw); let whi = bl(spv(k, S_hW1), spv(k, S_hJW1), jw);   // (the young's winter water)
  var m: Mode; m.b0 = bl(lo, wlo, wf); m.b1 = bl(hi, whi, wf);
  let same = spv(k, S_hDv) == spv(k, S_hNv); let hb = bl(spv(k, S_hDh), spv(k, S_hNh), nf);
  if (wf > 0.5) { m.v = spv(k, S_hWv); m.h = spv(k, S_hWh); }
  else if (nf < 0.5) { m.v = spv(k, S_hDv); m.h = select(spv(k, S_hDh), hb, same); }
  else { m.v = spv(k, S_hNv); m.h = select(spv(k, S_hNh), hb, same); }
  m.act = bl(bl(spv(k, S_hDa), spv(k, S_hNa), nf), spv(k, S_hWa), wf);
  if (L >= F3_RIFFLE_L && bodyAt(x, y) == BROOK) { m.b0 = max(m.b0, F3_RIFFLE_D); m.b1 = max(m.b1, m.b0); }   // (fish3: bigger-deeper — the brook's pools)
  return m;
}
fn zTarget(bed: f32, L: f32, m: Mode) -> f32 { if (m.v == 0.0) { return bed - m.h - L / 200.0; } if (m.v == 1.0) { return bed * m.h; } return min(m.h, bed * 0.8); }
fn zWant(i: u32, k: u32, m: Mode, bed: f32, z: f32) -> f32 {
  var zT = zTarget(bed, ga(A_L, i), m); let fk = gau(A_fk, i); let hu = ga(A_hunger, i);
  if (fk != 0u && (fk == 1u || hu > 0.3)) { zT += (ga(A_fz, i) - zT) * select(smooth01(0.1, 0.4, hu * ga(A_fv, i)), 0.8, fk == 1u); }
  if (ga(A_o2, i) < ga(A_o2Crit, i)) { zT = min(zT, z - 0.5); }
  if (ga(A_T, i) > spv(k, S_tPref) + ga(A_tempTol, i) / 4.0) { zT = max(zT, z + 0.5); }
  return clamp(zT, F3_ZTOP, max(F3_ZTOP, bed - F3_ZBOT));
}
fn gate(lake: u32) -> vec2f { return vec2f(stf(O_bGate + 2u * lake), stf(O_bGate + 2u * lake + 1u)); }
fn siteNear(k: u32, lake: u32, x: f32, y: f32) -> vec3f {   // fish3 _siteNear: (x, y, found)
  let h = (k * 2u + lake - 1u) * 4u; let s0 = u32(bitcast<i32>(SI[h])); let cnt = u32(bitcast<i32>(SI[h + 1u])); let go = bitcast<i32>(SI[h + 2u]);
  if (cnt == 0u) { return vec3f(0.0); }
  let co = U.siCoord + 2u * s0;
  if (go < 0) {
    var best = 0u; var bd = 1e18;
    for (var q = 0u; q < cnt; q++) { let dx = SI[co + 2u * q] - x; let dy = SI[co + 2u * q + 1u] - y; let d = dx * dx + dy * dy; if (d < bd) { bd = d; best = q; } }
    return vec3f(SI[co + 2u * best], SI[co + 2u * best + 1u], 1.0);
  }
  let glen = u32(bitcast<i32>(SI[h + 3u])); let gx = u32(clamp(i32((x - GX0) / F3_MATE_HC), 0, i32(U.siNX) - 1)); let gy = u32(max(0, i32((y - GY0) / F3_MATE_HC)));
  let q = u32(bitcast<i32>(SI[U.siGrid + u32(go) + min(glen - 1u, gy * U.siNX + gx)]));
  return vec3f(SI[co + 2u * q], SI[co + 2u * q + 1u], 1.0);
}
fn goalOf(i: u32, k: u32, id: u32, fl: u32, nt: f32, x: f32, y: f32) -> vec4f {   // fish3 _goal: (x, y, how near counts as there, has one)
  if (nt > 0.0) { return vec4f(ga(A_nx, i), ga(A_ny, i), 0.5, 1.0); }
  let lake = gau(A_lake, i); let ripe = (fl & FL_RIPE) != 0u; let rn = runs(fl, i);
  if (ripe && rn) { let v = bp(select(6u, 3u, lake == UPPER)); return vec4f(v, 2.5, 1.0); }
  if (ripe && spv(k, S_sbFaith) > 0.0 && (fl & FL_NEST) != 0u) { return vec4f(ga(A_nestX, i), ga(A_nestY, i), spv(k, S_sbFaith), 1.0); }
  if (ripe && (fl & FL_SP) != 0u) { return vec4f(ga(A_spX, i), ga(A_spY, i), 2.0, 1.0); }
  if (ripe && spv(k, S_sbSites) > 0.0) {
    let tb = (fl & FL_BROOKRUN) != 0u && !rn; let p = siteNear(k, lake, select(x, ga(A_lhx, i), tb), select(y, ga(A_lhy, i), tb));
    if (p.z > 0.0) { return vec4f(p.xy, 3.0, 1.0); }
  }
  if ((fl & FL_BROOKIE) != 0u && brookSeason(ga(A_T, i))) { let v = bp(select(4u, 1u, lake == UPPER) + (id & 1u)); return vec4f(v, 3.0, 1.0); }
  if (spv(k, S_brookRes) > 0.0) { if (bodyAt(x, y) != BROOK) { return vec4f(ga(A_hx, i), ga(A_hy, i), 1.0, 1.0); } return vec4f(0.0); }
  if (ga(A_tripEndD, i) > U.timeD) { return vec4f(ga(A_tpx, i), ga(A_tpy, i), 5.0, 1.0); }
  let b = bodyAt(x, y);
  if (b != lake && (b != BROOK || GSCALE < 1.0)) { return vec4f(ga(A_lhx, i), ga(A_lhy, i), 4.0, 1.0); }
  return vec4f(0.0);
}
fn route(x: f32, y: f32, tx: f32, ty: f32) -> vec2f {   // fish3 _route: straight within one water; else by the brook's path and its gates
  let fb = bodyAt(x, y); let tb = bodyAt(tx, ty);
  if (fb == tb || tb == LAND || fb == LAND) { return vec2f(tx, ty); }
  if (fb == UPPER || fb == LOWER) {
    let v = select(BLAST, 0u, fb == UPPER); let w = select(BLAST - 1u, 1u, fb == UPPER);
    if (length(bp(v) - vec2f(x, y)) > 2.5) { return bp(v); } return bp(w);
  }
  let ni = nearestBP(x, y); var ti = nearestBP(tx, ty); if (tb == UPPER) { ti = -1; } else if (tb == LOWER) { ti = i32(BLAST) + 1; }
  if (ti == ni) { return vec2f(tx, ty); }
  let dir = select(-1, 1, ti > ni); var kk = ni + dir;
  if (kk >= 0 && kk <= i32(BLAST) && length(bp(u32(kk)) - vec2f(x, y)) < 1.5) { kk += dir; }
  if (kk < 0 || kk > i32(BLAST)) {
    if (tb == UPPER || tb == LOWER) { let gt = gate(tb); if (length(gt - vec2f(x, y)) > 1.5) { return gt; } }
    return vec2f(tx, ty);
  }
  return bp(u32(kk));
}
struct Steer { vx: f32, vy: f32, wTop: f32, need: f32 };
fn steer(s: ptr<function, Steer>, bx: f32, by: f32, w: f32, nd: f32) {
  let d = length(vec2f(bx, by)); if (!(d > 1e-9) || !(w > 0.0)) { return; }
  (*s).vx += w * bx / d; (*s).vy += w * by / d; if (w > (*s).wTop) { (*s).wTop = w; (*s).need = nd; }
}
struct DriveOut { vx: f32, vy: f32, need: f32, thrust: f32, esc: u32, far: u32, farSet: u32 };
// fish3 _drive at a block's scale (dt 0: the heading's pulls and the pace; the turn, the look ahead and the pitch are the fine swim's)
fn drive(i: u32, k: u32, id: u32, fl: u32, m: Mode, x: f32, y: f32, bed: f32, c: i32, dh: vec2f) -> DriveOut {
  var st = Steer(0.0, 0.0, 0.0, 3e38); var r: DriveOut; r.farSet = 0u; r.far = 0u;
  let nt = ga(A_nt, i); let L = ga(A_L, i); let hunger = ga(A_hunger, i); let fear = ga(A_fear, i); let senseR = ga(A_senseR, i);
  let o0 = br(NW2 + HID, i); let o2v = br(NW2 + HID + 2u, i); let o3 = br(NW2 + HID + 3u, i); let o4 = br(NW2 + HID + 4u, i); let o5 = br(NW2 + HID + 5u, i);
  let gx = dh.x; let gy = dh.y; var off = 0.0; var goTrip = 0.0;
  let G0 = goalOf(i, k, id, fl, nt, x, y); let hasG = G0.w > 0.0;
  if (hasG) {
    let rr = route(x, y, G0.x, G0.y); let d = length(G0.xy - vec2f(x, y));
    if (d > G0.z) {
      let dr = length(rr - vec2f(x, y)); let same = rr.x == G0.x && rr.y == G0.y;
      steer(&st, rr.x - x, rr.y - y, select(F3_GOAL_W, BROOD_GUARD_TETHER, nt > 0.0) * clamp(d / 3.0, 0.3, 1.0), select(dr, d - 0.8 * G0.z, same));
      if (nt <= 0.0) { goTrip = clamp((d - G0.z) / 3.0, 0.0, 1.0); r.farSet = 1u; r.far = select(0u, 1u, d > F3_FAR); }
    }
  }
  let needy = hunger * clamp((0.95 - ga(A_K, i)) / 0.15, 0.0, 1.0);
  let lo = m.b0; let hi = m.b1;
  if (goTrip == 0.0) {
    let hw = F3_HAB_W * (1.0 - 0.8 * needy);
    if (bed < lo) { off = lo - bed; if (gx != 0.0 || gy != 0.0) { steer(&st, gx, gy, hw * clamp(off, 0.2, 1.0), (off + 0.1 * (hi - lo)) / F3_BAND_SLOPE); } }
    else if (bed > hi) { off = bed - hi; if (gx != 0.0 || gy != 0.0) { steer(&st, -gx, -gy, hw * clamp(off, 0.2, 1.0), (off + 0.1 * (hi - lo)) / F3_BAND_SLOPE); } }
    off *= 1.0 - needy;
  }
  // a mate (from the snapshot)
  let mt = gai(A_mate, i);
  if ((fl & FL_RIPE) != 0u && mt >= 0) {
    let mp = PX[u32(mt)]; let mf = bitcast<u32>(mp.w);
    if (gau(A_id, u32(mt)) == gau(A_mateId, i) && (mf & FL_ALIVE) != 0u && (mf & FL_RIPE) != 0u && !((fl & FL_BROOKRUN) != 0u && !runs(fl, i) && bodyAt(mp.x, mp.y) == BROOK)) {
      let d = length(mp.xy - vec2f(x, y)); if (d > F3_MATE_R * 0.6) { steer(&st, mp.x - x, mp.y - y, 0.8 * clamp(d / 3.0, 0.3, 1.0), d - 0.5 * F3_MATE_R); }
    }
  }
  let fk = gau(A_fk, i); let fd = ga(A_fd, i); let fx = ga(A_fx, i); let fy = ga(A_fy, i);
  let going = clamp(off - 0.3, 0.0, 1.0); let inPatch = fk >= 2u && fd < 1.5 && going <= 0.0; let hk = select(1.0, F3_RIPE_HUNT, (fl & FL_RIPE) != 0u);
  if (fk == 1u) { steer(&st, fx - x, fy - y, hk * F3_PURSUIT_W * clamp(1.0 - fd / max(0.6, senseR), 0.2, 1.0) * (0.4 + 0.6 * hunger), fd - 0.5 * spv(k, S_strikeR)); }
  else if (fk >= 2u && !inPatch) { steer(&st, fx - x, fy - y, hk * F3_FORAGE_W * hunger * ga(A_fv, i) * (1.0 - 0.8 * going) * (1.0 + needy), length(vec2f(fx - x, fy - y))); }
  let th = gai(A_threat, i);
  if (th >= 0 && fear > 0.05) {
    let tp = PX[u32(th)]; var bx = x - tp.x; var by = y - tp.y; var d = length(vec2f(bx, by)); if (d == 0.0) { d = 1.0; } bx /= d; by /= d;
    if (L < 15.0 && (gx != 0.0 || gy != 0.0)) { bx -= 0.6 * gx; by -= 0.6 * gy; }
    steer(&st, bx, by, F3_FLEE_W * fear, F3_FLEE_D * senseR);
  }
  let coh = select(spv(k, S_cohere), F3_SOLO_COHERE, (fl & FL_SCHOOL) == 0u && spv(k, S_school) > 0.0);
  let an = ga(A_an, i);
  if (an > 0.0 && coh > 0.0) { let ax = ga(A_ax, i); let ay = ga(A_ay, i); let d = length(vec2f(ax - x, ay - y)); if (d > 1.0) { steer(&st, ax - x, ay - y, coh * clamp(an / 6.0, 0.0, 1.0), d - 1.0); } }
  let hx = ga(A_hx, i); let hy = ga(A_hy, i); let hd = length(vec2f(hx - x, hy - y)); let home = spv(k, S_home);
  if (hd > home && !hasG) { let rr = route(x, y, hx, hy); steer(&st, rr.x - x, rr.y - y, F3_HOME_W * clamp((hd - home) / home, 0.0, 1.0), select(length(rr - vec2f(x, y)), hd - 0.7 * home, rr.x == hx && rr.y == hy)); }
  let o2 = ga(A_o2, i); let o2c = ga(A_o2Crit, i); var seek = -1;
  if (o2 < o2c && c >= 0) { seek = wdi(W_o2Best + u32(c)); }
  if (seek >= 0) { let sx = colX(u32(seek)); let sy = colY(u32(seek)); steer(&st, sx - x, sy - y, F3_O2_W * clamp(1.3 - o2 / o2c, 0.3, 1.3), length(vec2f(sx - x, sy - y))); }
  r.vx = st.vx; r.vy = st.vy; r.need = st.need;
  let T = ga(A_T, i);
  r.esc = select(0u, 1u, o2 < F3_ESC_O2 * lethalO2(ga(A_o2Lethal, i), ga(A_o2Ice, i), T) || o2 < 0.5 * o2c);
  let aS = select(0.0, engaged(o3), fk == 1u); let aF = select(0.0, engaged(o4), th >= 0 || fear > 0.1); let aH = engaged(o5);
  let sus = spv(k, S_sustain) / spv(k, S_sprint);
  var thr = spv(k, S_uRoutine) * m.act * (0.5 + o2v);
  let trip = max(goTrip, clamp(max((off - 0.2) / 0.3, select(hd / home - 1.5, 0.0, hasG)), 0.0, 1.0));
  if (trip > 0.0) { thr = max(thr, trip * sus * (0.75 + 0.5 * o2v)); }
  var farNow = (fl & FL_FAR) != 0u; if (r.farSet == 1u) { farNow = r.far == 1u; }
  if (goTrip > 0.0 && farNow) { thr = max(thr, min(0.5, F3_MIGRATE_V / max(1e-3, ga(A_spdMax, i)))); }
  if (inPatch && hunger > 0.2) { thr *= FEED_RESIDE; }
  let burst = max(ACTION_STRIKE_BURST * aS, ACTION_FLEE_BURST * max(aF, select(0.0, fear, fear > 0.4)));
  thr = (thr + (1.0 - thr) * burst) * (1.0 - ACTION_HIDE_STILL * aH);
  var thrust = clamp(thr * coldPerf(T, spv(k, S_tempOpt), spv(k, S_coldPerf)), 0.0, 1.0);
  if (r.esc == 1u) { thrust = max(thrust, 0.7); } else if (seek >= 0) { thrust = max(thrust, sus); }
  if (nt > 0.0 && r.esc == 0u && hasG && length(G0.xy - vec2f(x, y)) < G0.z) { thrust = min(thrust, spv(k, S_uRoutine) * BROOD_HOVER); }
  r.thrust = thrust;
  return r;
}
// one straight hop (fish3 _hop): along heading h for up to len m, a bed cell at a time; stops before land, water too shallow, the
// brook's end for its own fish, its depth band (a wander), water short of O₂. Returns the distance gone; moves *p (x, y, bed)
fn hop(i: u32, k: u32, p: ptr<function, vec3f>, c: i32, h: f32, len: f32, useBand: bool, m: Mode) -> f32 {
  let cx = cos(h); let cy = sin(h); let n = max(1u, u32(ceil(len / GCELL))); let st = len / f32(n);
  let ice = select(0.0, wd(W_ice + u32(c)), c >= 0); let shallow = F3_ZTOP + F3_ICE_M * ice + F3_ZBOT + 0.05 + ga(A_L, i) / 400.0;
  let inBand = useBand && (*p).z >= m.b0 && (*p).z <= m.b1;
  let o2c = ga(A_o2Crit, i); let oxic = ga(A_o2, i) >= o2c; let inBrook = spv(k, S_brookRes) > 0.0 && bodyAt((*p).x, (*p).y) == BROOK; let z = ga(A_z, i);
  var gone = 0.0;
  for (var q = 0u; q < n; q++) {
    let nx = (*p).x + cx * st; let ny = (*p).y + cy * st; let bed = depthAt(nx, ny); let cc = colAt(nx, ny); let b = bodyAt(nx, ny);
    if (!(bed >= shallow) || b == LAND || cc < 0 || (inBrook && b != BROOK)) { break; }
    if (inBand && (bed < m.b0 || bed > m.b1)) { break; }
    if (oxic) { let cu = u32(cc); let jj = cell0(cu) + u32(min(i32(nL(cu)) - 1, max(0, i32(min(z, bed) / WDZ)))); if (wd(W_o2 + jj) < o2c) { break; } }
    (*p).x = nx; (*p).y = ny; (*p).z = bed; gone += st;
  }
  return gone;
}
fn wet(x: f32, y: f32) -> bool { return bodyAt(x, y) != LAND && depthAt(x, y) >= F3_ZTOP + F3_ZBOT && colAt(x, y) >= 0; }
@compute @workgroup_size(64) fn k_move(@builtin(global_invocation_id) g: vec3u) {
  let i = g.x; if (i >= U.n) { return; }
  var fl = gau(A_flags, i); if ((fl & FL_ALIVE) == 0u) { return; }
  let k = gau(A_k, i); let id = gau(A_id, i); let nt = ga(A_nt, i);
  let x0 = ga(A_x, i); let y0 = ga(A_y, i);
  let m = modeOf(k, fl, nt, ga(A_T, i), ga(A_L, i), x0, y0);
  var c = gai(A_c, i); var dh = vec2f(ga(A_dhx, i), ga(A_dhy, i));
  var p = vec3f(x0, y0, ga(A_bed, i));   // (x, y, the bed's depth there)
  var dv = drive(i, k, id, fl, m, p.x, p.y, p.z, c, dh);
  var yaw = ga(A_yaw, i); var far = (fl & FL_FAR) != 0u; if (dv.farSet == 1u) { far = dv.far == 1u; }
  // the relocation: hops toward where the drives point, bent by the brain
  let v = max(1e-3, dv.thrust * ga(A_spdMax, i)); var left = v * U.dt; var hops = 0u;
  let hopMax = max(F3_RELOC_MIN, left / F3_RELOC_N); let bend = br(NW2 + HID, i) * F3_BRAIN_BEND;
  loop {
    if (!(left > 1e-3) || f32(hops) >= F3_RELOC_N) { break; }
    if (hops > 0u) {
      p.z = max(0.05, depthAt(p.x, p.y)); c = colAt(p.x, p.y); dh = deeper(p.x, p.y);
      dv = drive(i, k, id, fl, m, p.x, p.y, p.z, c, dh); if (dv.farSet == 1u) { far = dv.far == 1u; }
    }
    if (length(vec2f(dv.vx, dv.vy)) < F3_RELOC_STILL) { break; }
    let h = atan2(dv.vy, dv.vx) + bend; let len = min(min(left, hopMax), max(F3_RELOC_MIN, dv.need));
    let gone = hop(i, k, &p, c, h, len, false, m); if (gone > 0.0) { yaw = h; }
    left -= max(gone, 0.5 * F3_RELOC_MIN); hops += 1u;
    if (gone < 0.25 * len) { break; }
  }
  if (left > 1e-3 && !(nt > 0.0)) {
    let r = min(left, v * sqrt(F3_WANDER_TAU * left / v));
    if (r > 0.05) { let h = rnd(id, 20u, 0u) * 6.283185307179586; let gone = hop(i, k, &p, c, h, r, true, m); if (gone > 0.0) { yaw = h; } }
  }
  if (nt > 0.0) {
    let nx = ga(A_nx, i); let ny = ga(A_ny, i); let dx = p.x - nx; let dy = p.y - ny; let d = length(vec2f(dx, dy));
    if (d > F3_GUARD_R) { let kk = F3_GUARD_R / d; let gx = nx + dx * kk; let gy = ny + dy * kk; if (wet(gx, gy)) { p.x = gx; p.y = gy; } else if (wet(nx, ny)) { p.x = nx; p.y = ny; } }
  }
  if (!wet(p.x, p.y)) { p.x = x0; p.y = y0; }
  sa(A_spd, i, v); sa(A_pitch, i, 0.0); sa(A_yaw, i, yaw);
  let bed = max(0.05, depthAt(p.x, p.y)); c = colAt(p.x, p.y);
  sa(A_x, i, p.x); sa(A_y, i, p.y); sa(A_bed, i, bed); sai(A_c, i, c);
  if (gau(A_fk, i) == 2u) { sa(A_fz, i, bed - 0.15); }
  let zTop = F3_ZTOP + F3_ICE_M * select(0.0, wd(W_ice + u32(c)), c >= 0);
  let z = clamp(zWant(i, k, m, bed, ga(A_z, i)), zTop, max(zTop, bed - F3_ZBOT)); sa(A_z, i, z);
  if (c >= 0) { sai(A_j, i, i32(layerCell(u32(c), z))); sai(A_jb, i, bedCell(c, bed)); }
  sa(A_dhx, i, dh.x); sa(A_dhy, i, dh.y); sa(A__vx, i, dv.vx); sa(A__vy, i, dv.vy); sa(A__need, i, dv.need); sa(A_thrust, i, dv.thrust);
  fl = select(fl & ~FL_ESC, fl | FL_ESC, dv.esc == 1u); fl = select(fl & ~FL_FAR, fl | FL_FAR, far);
  sau(A_flags, i, fl);
}
`;

// ============================================================ FB4 (bioenergetics.js) ===========================================
// a parameter set bs = 2·species (+1 for the juvenile set): the species' published Fish Bioenergetics 4.0 equations, every variant
export const FB4 = /* wgsl */`
fn consT1(bs: u32, T: f32, hot: bool) -> f32 {
  let o = select(0u, BhCEQ - BCEQ, hot);   // (the warm row's consumption fields follow the base's, h-prefixed)
  let ceq = bio(bs, BCEQ + o);
  if (ceq == 1.0) { return exp(bio(bs, BCQ + o) * T); }
  if (ceq == 2.0) {
    let ctm = bio(bs, BCTM + o); if (T >= ctm) { return 0.0; }
    let V = (ctm - T) / (ctm - bio(bs, BCTO + o)); let cx = bio(bs, Bu_cX + o);
    return max(0.0, pow(V, cx) * exp(cx * (1.0 - V)));
  }
  if (ceq == 3.0) {
    let L1 = exp(bio(bs, Bu_g1 + o) * (T - bio(bs, BCQ + o))); let k1 = bio(bs, BCK1 + o); let KA = k1 * L1 / (1.0 + k1 * (L1 - 1.0));
    let L2 = exp(bio(bs, Bu_g2 + o) * (bio(bs, BCTL + o) - T)); let k4 = bio(bs, BCK4 + o); let KB = k4 * L2 / (1.0 + k4 * (L2 - 1.0));
    return KA * KB;
  }
  return exp(bio(bs, BCQ + o) * T + bio(bs, BCK1 + o) * T * T + bio(bs, BCK4 + o) * T * T * T);
}
fn consumptionT(bs: u32, T: f32) -> f32 {
  let hT = bio(bs, BhotT);
  if (hT < 1e30 && T > hT - 0.5) { let w = min(1.0, T - hT + 0.5); var cold = 0.0; if (w < 1.0) { cold = consT1(bs, T, false); } return cold * (1.0 - w) + consT1(bs, T, true) * w; }
  return consT1(bs, T, false);
}
fn cmaxB(bs: u32, W: f32, T: f32) -> f32 { return bio(bs, BCA) * pow(W, bio(bs, BCB)) * consumptionT(bs, T); }
fn respirationT(bs: u32, T: f32) -> f32 {
  if (bio(bs, BREQ) == 1.0) { return exp(bio(bs, BRQ) * T); }
  let rtm = bio(bs, BRTM); let Tc = min(T, rtm - 0.5); let V = (rtm - Tc) / (rtm - bio(bs, BRTO)); let rx = bio(bs, Bu_rX);
  return max(1e-6, pow(V, rx) * exp(rx * (1.0 - V)));
}
fn routineActivity(bs: u32, W: f32, T: f32) -> f32 {
  if (bio(bs, BREQ) == 2.0) { return bio(bs, BACT); }
  var vel: f32;
  if (T <= bio(bs, BRTL)) { vel = bio(bs, BACT) * pow(W, bio(bs, BRK4)) * exp(bio(bs, BBACT) * T); } else { vel = bio(bs, BRK1) * pow(W, bio(bs, BRK4)) * exp(bio(bs, BRK5) * T); }
  return exp(bio(bs, BRTO) * vel);
}
fn respStd(bs: u32, W: f32, T: f32) -> f32 { return bio(bs, BRA) * pow(W, bio(bs, BRB)) * respirationT(bs, T); }
fn wasteFr(bs: u32, T: f32, p: f32) -> vec2f {
  let t = max(T, 0.1); let eq = bio(bs, BEGEQ); let fa = bio(bs, BFA);
  var eg = fa; if (eq == 4.0) { eg = fa * pow(t, bio(bs, BFB)); } else if (eq != 1.0) { eg = fa * pow(t, bio(bs, BFB)) * exp(bio(bs, BFG) * p); }
  let w0 = clamp(select(eg, (eg - 0.1) / 0.9, eq == 3.0), 0.0, 1.0);
  let xq = bio(bs, BEXEQ); let ua = bio(bs, BUA);
  var ex = ua; if (xq == 4.0) { ex = ua * pow(t, bio(bs, BUB)); } else if (xq != 1.0) { ex = ua * pow(t, bio(bs, BUB)) * exp(bio(bs, BUG) * p); }
  return vec2f(w0, clamp(ex, 0.0, 1.0));
}
fn energyDensity(bs: u32, W: f32) -> f32 {
  let q = bio(bs, BPREDEDEQ);
  if (q == 2.0) { if (W < bio(bs, BCutoff)) { return bio(bs, BAlpha1) + bio(bs, BBeta1) * W; } return bio(bs, BAlpha2) + bio(bs, BBeta2) * W; }
  if (q == 3.0) { return bio(bs, BAlpha1) * pow(W, bio(bs, BBeta1)); }
  return bio(bs, BED);
}
// bioenergetics.js coldResp / coldCmax: the species' cold rule below cT1 (wholly below cT0) — an empirical curve, the adult set's for a
// juvenile stand-in, or FB4's × mul; × quiet once it stops feeding (over cQa → cQb); a juvenile's appetite by the adult set (cAdC)
fn coldW(k: u32, T: f32) -> f32 { let t0 = spv(k, S_cT0); let t1 = spv(k, S_cT1); if (T <= t0) { return 1.0; } return clamp((t1 - T) / (t1 - t0), 0.0, 1.0); }
fn coldResp(k: u32, bs: u32, W: f32, T: f32) -> f32 {
  let rFB = respStd(bs, W, T) * routineActivity(bs, W, T);
  let m = spv(k, S_cMode); if (m == 0.0 || !(T < spv(k, S_cT1))) { return rFB; }
  var rc = rFB; let ba = 2u * k;
  if (m == 1.0) { rc = spv(k, S_cR5) * 24e-6 * pow(W / spv(k, S_cWref), spv(k, S_cB)) * pow(spv(k, S_cQ10), (T - 5.0) / 10.0); }
  else if (m == 2.0) { if (bs != ba) { rc = respStd(ba, W, T) * routineActivity(ba, W, T); } }
  else { rc = rFB * spv(k, S_cMul); }
  let q = spv(k, S_cQuiet); if (q > 0.0) { let qa = spv(k, S_cQa); let qb = spv(k, S_cQb); rc *= 1.0 - (1.0 - q) * clamp((qa - T) / (qa - qb), 0.0, 1.0); }
  return rFB + (rc - rFB) * coldW(k, T);
}
fn coldCmax(k: u32, bs: u32, W: f32, T: f32) -> f32 {
  let cm = cmaxB(bs, W, T); let ba = 2u * k;
  if (spv(k, S_cAdC) < 0.5 || bs == ba || !(T < spv(k, S_cT1))) { return cm; }
  return cm + (cmaxB(ba, W, T) - cm) * coldW(k, T);
}
// bioenergetics.js energyOf / massOf: below the standard weight the energy density follows the condition
fn energyOf(W: f32, Ws: f32, ed: f32, g: f32) -> f32 { if (W >= Ws) { return W * ed; } return W * ed * (1.0 + g * (W / Ws - 1.0)); }
fn massOf(E: f32, Ws: f32, ed: f32, g: f32) -> f32 {
  if (E >= Ws * ed || !(g > 0.0)) { return E / ed; }
  let a = g / Ws; let bq = 1.0 - g; let D = bq * bq + 4.0 * a * (E / ed);
  if (!(D > 0.0)) { return 0.0; }
  return max(0.0, (-bq + sqrt(D)) / (2.0 * a));
}
// a guard's multiplier by its stage (fish3 guardStage: its first GUARD_EARLY days, then the free-swimming fry's weeks); 1 off a nest
fn guardMul(i: u32, k: u32, early: f32, late: f32) -> f32 { let nt = ga(A_nt, i); if (!(nt > 0.0)) { return 1.0; } return select(late, early, spv(k, S_guard) - nt < BROOD_GUARD_EARLY * DAY); }
fn bioSet(k: u32, W: f32, age: f32) -> u32 {   // fish3: the juvenile set below juvW g (or in its first year)
  let jm = spv(k, S_juvMode);
  if ((jm == 1.0 && W < spv(k, S_juvW)) || (jm == 2.0 && age < YEAR)) { return 2u * k + 1u; }
  return 2u * k;
}
// fish3 _settle: the size-dependent abilities and the condition's reserve
fn settle(i: u32, k: u32) {
  let L = ga(A_L, i); let W = ga(A_W, i); let r = L / spv(k, S_Lref);
  sa(A_spdMax, i, spv(k, S_sprint) * L / 100.0 * ga(A_spdGene, i));
  sa(A_turnMax, i, ga(A_turnMax0, i) * clamp(pow(r, -0.2), 0.9, 1.5));
  sa(A_senseR, i, ga(A_sense0, i) * clamp(pow(r, 0.3), 0.5, 1.15));
  sa(A_gape, i, L * spv(k, S_gapeR)); sa(A_bdep, i, L * spv(k, S_depthR) * ga(A_bodyMul, i));
  let K = W / stdWeight(k, L); sa(A_K, i, K); sa(A_energy, i, clamp((K - 0.6) / 0.4, 0.0, 1.0));
  sa(A_hunger, i, 1.0 - clamp(ga(A_gut, i) / (spv(k, S_gut) * W), 0.0, 1.0));
}
`;

// ============================================================ THE BODY (fish3 _energetics) =======================================
// digestion (gastric evacuation over the block), waste, respiration (with its activity and starvation's depression), gonads, growth
export const BODY = /* wgsl */`
@compute @workgroup_size(128) fn k_body(@builtin(global_invocation_id) g: vec3u) {
  let i = g.x; if (i >= U.n) { return; }
  let fl = gau(A_flags, i); if ((fl & FL_ALIVE) == 0u) { return; }
  let k = gau(A_k, i); let T = ga(A_T, i); let Wg = ga(A_W, i); let dd = U.dt / DAY;
  let bs = bioSet(k, Wg, f32(gau(A_age, i)));
  let cm = coldCmax(k, bs, Wg, T); sa(A_cm, i, cm);
  var C = 0.0; var pNow = 0.0; var gut = ga(A_gut, i); var gutE = ga(A_gutE, i);
  if (gut > 0.0) {
    let ev = min(gut * expm(max(BIOE_GER * exp(BIOE_GER_T * T) * spv(k, S_gerMul), cm / spv(k, S_gut)) * dd), cm * Wg * dd);
    C = gutE * ev / gut; gut -= ev; gutE -= C; pNow = ev / max(1e-12, cm * Wg * dd);
    sa(A_cons, i, ga(A_cons, i) + ev);
  }
  sa(A_gut, i, gut); sa(A_gutE, i, gutE);
  sa(A_consMax, i, ga(A_consMax, i) + cm * Wg * dd);
  let wf = wasteFr(bs, T, clamp(pNow, 0.0, 1.0));
  let Fz = wf.x * C; let Ux = wf.y * (C - Fz); let Sd = bio(bs, BSDA) * (C - Fz);
  var uAvg = ga(A_uAvg, i); uAvg += (ga(A_spd, i) / max(1e-6, ga(A_spdMax, i)) - uAvg) * min(1.0, dd); sa(A_uAvg, i, uAvg);
  var act = exp(BIOE_SWIM * max(0.0, uAvg - spv(k, S_uRoutine))); if (ga(A_nt, i) > 0.0) { act = 1.0; }   // (a guard's chases are in its ×)
  let K = ga(A_K, i); let depress = 1.0 - 0.3 * clamp((0.9 - K) / (0.9 - 0.55), 0.0, 1.0);
  let rO2 = coldResp(k, bs, Wg, T) * ga(A_metabMul, i) * act * depress * guardMul(i, k, BROOD_GUARD_METAB3_0, BROOD_GUARD_METAB3_1) * Wg;
  sa(A_rO2, i, rO2 / DAY);
  var net = C - Fz - Ux - Sd - rO2 * OXYCAL * dd;
  let ed = energyDensity(bs, Wg); let gsi = gsiOf(k, gau(A_sex, i)); var gon = ga(A_gon, i);
  if (net > 0.0 && (fl & FL_MATURE) != 0u && gon < gsi * Wg) { let toG = min(net * BIOE_REPRO_ALLOC, (gsi * Wg - gon) * ed); gon += toG / ed; net -= toG; }
  else if (net <= 0.0 && gon > 0.0 && K < BIOE_K_RESORB) { let fromG = min(gon * ed, -net); gon -= fromG / ed; net += fromG; }
  sa(A_gon, i, gon);
  let Ws = stdWeight(k, ga(A_L, i)); let gK = select(BIOE_ED_K, BIOE_ED_K_JUV, f32(gau(A_age, i)) < YEAR);
  let W = max(1e-6, massOf(energyOf(Wg, Ws, ed, gK) + net, Ws, ed, gK)); sa(A_W, i, W);
  if (W > Ws) { sa(A_L, i, lengthFor(k, W)); }
  settle(i, k);
}
`;

// ============================================================ FEEDING (fish3 _feed, _strike; chem3/littoral3's takes) ==========
// fish3 feeds one fish after another, each taking its share of what the ones before it left. On the GPU every fish feeds at once:
// each says what it wants from each cell of its footprint (as fish3 would on the untouched water), the wants are summed per cell
// and kind (64-bit fixed point: the same total in any thread order) as T, the share of the cell's reachable food they ask for; each
// gets its whole want while T ≤ 1, its 1/T of it beyond (the cell then stripped of what was reachable) — fish3's fish ask for grams
// and get them, one after another, until the food runs out. (A first version shared by 1 − e^(−T) — each fish a fraction of what is
// left — and starved the crowded young by ~9 % with food to spare.) The crayfish keep the exponential: a crowd can't take a cell's
// every crayfish, sheltered ones too, in a block. The foods in fish3's order: fish (strikes), the young, the bed and the weeds, the surface, the zooplankton, at last the
// organic layer (only for a sifter that got nothing else); the bed, surface and zooplankton are asked for together, each from the
// room the ones before would leave if granted in full.
export const FEED_K = /* wgsl */`
const PW: f32 = 1e12;   // the wanted fractions' fixed point (a tiny fish's share of a footprint's food is ~1e-9)
const GW: f32 = 1e9;    // grams' fixed point (O₂ breathed, organic matter wanted or added)
fn acc64(at: u32, v: f32, scale: f32) { add64(&ACC, at, v, scale); }
fn rdAcc(at: u32, scale: f32) -> f32 { return (f32(atomicLoad(&ACC[at])) + f32(atomicLoad(&ACC[at + 1u])) * 4294967296.0) / scale; }
// THE SHARE of its want each feeder of a cell gets: T the summed wants (as shares of the cell's reachable food), W their weight on
// appetites that fall with the food (each feeder's K/(E + K) — its functional response's elasticity — or 1 when it was capped at
// CROP of what is there): fish3's feeders, one after another, each ask for grams; an appetite that doesn't fall with the food
// gets its whole ask until the food runs out (rationing: min(T, 1) taken), one that falls in step with it strips the cell
// geometrically (1 − e^(−T)). A first version rationed every feeder alike and the young grew ~3–5 % fast at 1/10 (the brook's
// young dace reached recruiting size days early)
fn bShare(T: f32, V: f32) -> f32 {
  if (!(T > 0.0)) { return 1.0; }
  let W = clamp(V / T, 0.0, 1.0); let lin = select(1.0, 1.0 / T, T > 1.0); var ex = 1.0 - 0.5 * T; if (T > 1e-4) { ex = (1.0 - exp(-T)) / T; }
  return (1.0 - W) * lin + W * ex;
}
fn bTaken(T: f32, V: f32) -> f32 { return T * bShare(T, V); }
// ---- fish3 _feed's set-up: the gut's room by the O₂ and a guardian's appetite, what it can take this block ----
@compute @workgroup_size(128) fn k_feed0(@builtin(global_invocation_id) g: vec3u) {
  let i = g.x; if (i >= U.n) { return; }
  let fl = gau(A_flags, i); if ((fl & FL_ALIVE) == 0u) { return; }
  let k = gau(A_k, i); let W = ga(A_W, i); let gmax = spv(k, S_gut) * W; let T = ga(A_T, i); let o2 = ga(A_o2, i); let o2c = ga(A_o2Crit, i);
  let o2L = lethalO2(ga(A_o2Lethal, i), ga(A_o2Ice, i), T);
  let gEff = gmax * clamp((o2 - o2L) / max(1e-3, o2c - o2L), 0.0, 1.0) * guardMul(i, k, BROOD_GUARD_FEED3_0, BROOD_GUARD_FEED3_1);
  let apt = gEff / gmax;
  sa(A_fGEff, i, gEff); sa(A_fPerf, i, coldPerf(T, spv(k, S_tempOpt), spv(k, S_coldPerf)));
  sa(A_fRoom, i, gEff - ga(A_gut, i)); sa(A_fWant, i, ga(A_cm, i) * apt * W * U.dt / DAY); sa(A_fGot, i, 0.0); sa(A_gut0, i, ga(A_gut, i));
  sai(A_claim, i, -1);
}
// ---- STRIKES (fish3 _strike): the kill hazard over the catchable fish within reach; the prey drawn ∝ its weight (each candidate a
// key u^(1/w) from the predator's own stream, the largest wins — the same distribution as fish3's draw, independent of the scan's order);
// the predator claims it with a priority (13 random bits, then its index: unique). A fish claimed by several goes to the highest
// priority; a school pays every claim while it has fish (fish3: one fish a strike, the last strike kills a school of ≤ 1.5)
@compute @workgroup_size(64) fn k_strike(@builtin(global_invocation_id) g: vec3u) {
  let i = g.x; if (i >= U.n) { return; }
  let fl = gau(A_flags, i); if ((fl & FL_ALIVE) == 0u) { return; }
  let k = gau(A_k, i); let L = ga(A_L, i);
  if (spv(k, S_pisc) < 0.5 || L < spv(k, S_Lpisc) || ga(A_missCd, i) > 0.0) { return; }
  let room = ga(A_fRoom, i); if (!(room > 0.0)) { return; }
  let id = gau(A_id, i); let x = ga(A_x, i); let y = ga(A_y, i); let z = ga(A_z, i);
  let lunge = 1.0 + ACTION_STRIKE_REACH * select(0.0, engaged(br(NW2 + HID + 3u, i)), gau(A_fk, i) == 1u);
  let R = spv(k, S_strikeR) * lunge * max(0.3, ga(A_visF, i)); let R2 = R * R;
  // (F3.STRIKE2 — fish3 _strike2: the encounter–strike–capture rule over the column's catchable fish within ENC_R; else the old rule)
  let s2 = F3_STRIKE2 > 0.5; let Rs = select(R, F3_ENC_R, s2); let Rs2 = Rs * Rs; let cls = u32(spv(k, S_predCls)); var sE = 0.0;
  let gape = ga(A_gape, i); let cap = spv(k, S_capture); let dmH = 0.5 * F3_SHALLOW_K * L;   // (fish3 _strike: half the water it needs)
  var sK = 0.0; var best = -1; var bkey = -3e38;
  var dM: array<f32, NK>; var dG: array<f32, NK>; var dW: array<f32, NK>;   // (the diagnostics' sums by prey species)
  let gx0 = clamp(i32((x - Rs - GX0) / F3_HC), 0, i32(HHX) - 1); let gx1 = clamp(i32((x + Rs - GX0) / F3_HC), 0, i32(HHX) - 1);
  let gy0 = clamp(i32((y - Rs - GY0) / F3_HC), 0, i32(HHY) - 1); let gy1 = clamp(i32((y + Rs - GY0) / F3_HC), 0, i32(HHY) - 1);
  for (var gy = gy0; gy <= gy1; gy++) {
    for (var gx = gx0; gx <= gx1; gx++) {
      let c = u32(gy) * HHX + u32(gx);
      for (var q = HS[c]; q < HS[c + 1u]; q++) {
        let b = HI[q]; if (b == i) { continue; }
        if ((gau(A_flags, b) & FL_ALIVE) == 0u) { continue; }
        // (fish3's order: the grid is the block's start; a fish before this one in the list has moved — where it got to — one after it hasn't
        // yet: where the block began. Kept so: with the grid rebuilt where all had moved, the true lakes' predators struck ~9× as often)
        var pb = PX[b].xyz; if (b < i) { pb = vec3f(ga(A_x, b), ga(A_y, b), ga(A_z, b)); }
        let dx = pb.x - x; let dy = pb.y - y; let dz = pb.z - z; let d2 = dx * dx + dy * dy + dz * dz;
        if (s2) { if (dx * dx + dy * dy > Rs2) { continue; } } else if (d2 > R2) { continue; }
        let kb = gau(A_k, b); dM[kb] += ga(A_n, b);
        if (!canPrey(i, b) || ga(A_W, b) + ga(A_gon, b) > room) { continue; }
        dG[kb] += ga(A_n, b);
        let d = sqrt(d2); let hide = 1.0 - ACTION_HIDE_CONCEAL * engaged(br(NW2 + HID + 5u, b));
        let sel = max(0.0, 1.0 - pow(ga(A_bdep, b) / gape, F3_SIZE_K)); let nb = ga(A_n, b);   // (fish3 F3.SIZE_K)
        var w = 0.0;
        if (s2) {   // (an encounter for each fish of a school, × concealment, cover, the shallows; × capture success by kind, size, school)
          let nn = max(nb, 1.0); let enc = nn * hide * (1.0 - ga(A_cover, b)) * clamp((ga(A_bed, b) - dmH) / dmH, 0.0, 1.0);
          if (enc > 0.0) { var sch = 1.0; if (nb > 1.0) { sch = select(select(1.0, 0.15, cls == 2u), pow(nb, -0.8), cls == 1u); }
            let cs = spv(kb, S_cs0 + cls) * max(0.0, 1.0 - ga(A_L, b) / L / spv(kb, S_ppr0)) * sch; sE += enc; w = enc * cs; }
        } else { w = (1.0 - d / R) * cap * spv(gau(A_k, b), S_vuln) * sel * hide * (1.0 - ga(A_cover, b)) * clamp((ga(A_bed, b) - dmH) / dmH, 0.0, 1.0) * select(1.0, pow(nb, spv(k, S_schExp)), nb > 1.0); }
        if (w > 0.0) { sK += w; dW[kb] += w; let key = log(max(rnd(id, 30u, gau(A_id, b)), 1e-30)) / w; if (key > bkey) { bkey = key; best = i32(b); } }   // (u^(1/w) in logs: small weights underflowed)
      }
    }
  }
  for (var q = 0u; q < NK; q++) { if (dM[q] > 0.0) { let o = 2u * (k * NK + q); add64(&TL, T_STRM + o, dM[q], 1.0); if (dG[q] > 0.0) { add64(&TL, T_STRG + o, dG[q], 1.0); add64(&TL, T_STRW + o, dW[q], TSCALE); } } }
  if (!(sK > 0.0)) { return; }
  var pK = 0.0;
  if (s2) { let E = R * R * (F3_ENC_U + spv(k, S_vHunt)) * sE / (Rs2 * max(1.0, ga(A_bed, i))); let S = spv(k, S_aMax) * E / (E + F3_ENC_EH); pK = expm(S * (sK / sE) * ga(A_fPerf, i) * U.dt); }   // (π cancels)
  else { let rate = F3_ATTACK * ga(A_fPerf, i) * U.dt; pK = 1.0 - exp(-rate * sK); }
  if (rnd(id, 31u, 0u) >= pK) { return; }
  let prio = ((hash32(id ^ hash32(U.blk ^ 0xA5A5u)) & 0x1FFFu) << 19u) | (i & 0x7FFFFu);
  sai(A_claim, i, best); sau(A_claimP, i, prio);
  atomicMax(&GS[GS_CLAIMP0 + u32(best)], prio); atomicAdd(&GS[GS_CLAIMP0 + U.cap + u32(best)], 1u);
}
// strikes a school of n can pay for before it is gone (fish3: −1 a strike while n > 1.5; the strike at n ≤ 1.5 kills)
fn strikesFor(n: f32) -> u32 { return 1u + u32(max(0.0, ceil(n - 1.5))); }
@compute @workgroup_size(128) fn k_strikeWin(@builtin(global_invocation_id) g: vec3u) {
  let i = g.x; if (i >= U.n) { return; }
  let p = gai(A_claim, i); if (p < 0) { return; }
  let pu = u32(p); let cnt = atomicLoad(&GS[GS_CLAIMP0 + U.cap + pu]); let top = atomicLoad(&GS[GS_CLAIMP0 + pu]);
  let won = cnt <= strikesFor(ga(A_n, pu)) || top == gau(A_claimP, i);
  if (!won) { sai(A_claim, i, -1); return; }
  let kp = gau(A_k, pu); let gr = ga(A_W, pu) + ga(A_gon, pu);
  sa(A_gut, i, ga(A_gut, i) + gr); sa(A_gutE, i, ga(A_gutE, i) + gr * energyDensity(2u * kp, ga(A_W, pu)));
  sa(A_fRoom, i, ga(A_fRoom, i) - gr); sa(A_fGot, i, ga(A_fGot, i) + gr); sa(A_missCd, i, FEED_MISS_CD / TS);
  add64(&TL, T_FOOD + 2u * FOOD_FISH, gr, TSCALE); add64(&TL, T_KILLS + 2u * (gau(A_k, i) * NK + kp), 1.0, TSCALE); foodK(gau(A_k, i), 0u, gr * ga(A_n, i));
  let lc = lenClass(ga(A_L, pu)); add64(&TL, T_KILLSZ + 2u * (kp * 4u + lc), 1.0, TSCALE); add64(&TL, T_KILLPZ + 2u * (gau(A_k, i) * 4u + lc), 1.0, TSCALE);
  let bd = ga(A_bed, pu); let dc = select(select(select(select(4u, 3u, bd < 2.0), 2u, bd < 1.0), 1u, bd < 0.6), 0u, bd < 0.3);
  let cv = ga(A_cover, pu); let cc = select(select(2u, 1u, cv < 0.5), 0u, cv < 0.1);
  add64(&TL, T_KILLD + 2u * (kp * 5u + dc), 1.0, TSCALE); add64(&TL, T_KILLC + 2u * (kp * 3u + cc), 1.0, TSCALE);
}
@compute @workgroup_size(128) fn k_strikeApply(@builtin(global_invocation_id) g: vec3u) {
  let i = g.x; if (i >= U.n) { return; }
  let cnt = atomicLoad(&GS[GS_CLAIMP0 + U.cap + i]); if (cnt == 0u) { return; }
  let n = ga(A_n, i); let D = strikesFor(n); let k = gau(A_k, i);
  let taken = select(1u, cnt, cnt <= D);
  add64(&TL, T_DIED + 2u * (k * NCAUSE + CAUSE_EATEN), f32(taken), TSCALE);
  if (taken >= D) {   // (the last strike: gone — its body is eaten, nothing to the bed)
    sau(A_flags, i, gau(A_flags, i) & ~FL_ALIVE); sa(A_n, i, 0.0);
  } else { sa(A_n, i, n - f32(taken)); }
}
// ---- THE FOOD FIELDS' offers (chem3 benthEcells/zooEcells, littoral3 weedEcells/surfEcols/crayE) ----
fn reach(l: u32) -> f32 { return wd(W_pReach + l); }   // (littoral3 reach: bed cell index l — plants3 reachB, by stand)
fn crayE(li: u32, j: u32, c: u32, gape: f32, s: f32) -> f32 {
  if (!(s > 0.0) || !(gape > 0.0)) { return 0.0; }
  let act = clamp((wd(W_temp + j) - LIT3_CR_T_ACT_0) / (LIT3_CR_T_ACT_1 - LIT3_CR_T_ACT_0), 0.0, 1.0); if (!(act > 0.0)) { return 0.0; }
  let outF = act * select(LIT3_CR_OUT_0, LIT3_CR_OUT_1, U.night > 0.5) * (1.0 - wd(W_pCov + li));   // (the stands hide some: plants3 cov)
  var E = 0.0;
  if (LIT3_CR_WIDTH <= gape) { let a = wd(W_litCrA + li); let over = max(0.0, a - wd(W_litKcr + li)); E += over + (a - over) * outF; }
  if (LIT3_CR_WIDTH * pow(max(U.wY, 1e-9) / LIT3_CR_WA, 1.0 / 3.0) <= gape) { E += wd(W_litCrY + li) * outF * 1.5; }
  return E * s;
}
fn benthE(j: u32) -> f32 { return max(0.0, wd(W_benth + j) / A2 - BENTHOS_REFUGE); }
fn zooSeen(q: u32, kind: u32) -> f32 { if (kind == 0u) { return wd(W_zooD + q) * zooExposed(q, 0u); } return wd(W_zooC + q) * (1.0 - ZOO3_COPE_ESCAPE) * zooExposed(q, 1u); }
// the footprint (fish3 _feed): its columns (by forage radius), each column's bed cells within FP_DZ of its bed, and its layer of the
// water (± one in its own column)
struct Fp { s0: u32, s1: u32, base: u32, kz: u32 };
fn fpOf(k: u32, c: u32, z: f32) -> Fp {
  let r = u32(sti(O_fpRad + k)); var o0 = O_fFp00; var oL = O_fFp0L;
  ${''}FP_SELECT
  return Fp(u32(sti(o0 + c)), u32(sti(o0 + c + 1u)), oL, u32(min(i32(nL(c)) - 1, max(0, i32(z / WDZ)))));
}
// what a fish (n of them) asks of the bed, the weeds, the surface and the zooplankton this block (fish3 _feed's middle), and its wants
// added to the cells
// fish3 _feed's reach of the bed and the weeds: in a block (every GPU step is one) the share of it within reach — the heights
// gamma-distributed (shape 2) about the block's mean height h, 1 − e^(−x)(1 + x), x = 2·reach/h (F3.BED_SHARE); 0 or 1 by the place
// itself when off
fn bedShares(jb: i32, bed: f32, z: f32, L: f32, canopy: f32, lit: bool) -> vec2f {
  if (jb < 0) { return vec2f(0.0); }
  let reachB = F3_BENTH_REACH + L / 200.0; let hb = bed - z;
  if (F3_BED_SHARE > 0.5) { let h = max(0.02, hb); let x1 = 2.0 * reachB / h; let x2 = 2.0 * (reachB + canopy) / h; return vec2f(1.0 - exp(-x1) * (1.0 + x1), select(0.0, 1.0 - exp(-x2) * (1.0 + x2), lit)); }
  return vec2f(select(0.0, 1.0, hb <= reachB), select(0.0, 1.0, lit && hb <= reachB + canopy));
}
@compute @workgroup_size(64) fn k_fieldReq(@builtin(global_invocation_id) g: vec3u) {
  let i = g.x; if (i >= U.n) { return; }
  let fl = gau(A_flags, i); if ((fl & FL_ALIVE) == 0u) { return; }
  var room = ga(A_fRoom, i); let want = ga(A_fWant, i); var got = ga(A_fGot, i);
  sa(A_qB, i, 0.0); sa(A_qW, i, 0.0); sa(A_qC, i, 0.0); sa(A_qS, i, 0.0); sa(A_qZD, i, 0.0); sa(A_qZC, i, 0.0); sa(A_qFlags, i, 0.0);
  if (!(room > 0.0) || !(want > got)) { return; }
  let k = gau(A_k, i); let L = ga(A_L, i); let n = ga(A_n, i); let z = ga(A_z, i); let bed = ga(A_bed, i); let c = gai(A_c, i); let jb = gai(A_jb, i);
  if (c < 0) { return; }
  let cu = u32(c); let gape = ga(A_gape, i); let visDay = ga(A_visF, i);
  let pisc = spv(k, S_pisc) > 0.5; let crayS = spv(k, S_cray);
  let small = !pisc || L < 3.0 * spv(k, S_Lpisc) || crayS > 0.0; let lit = U.lit != 0u;
  let fNW = bedShares(jb, bed, z, L, wd(W_canopy + cu), lit); let fNear = fNW.x; let fWeed = fNW.y;   // (fish3: a block's share within reach — F3.BED_SHARE)
  let nearBed = fNear > 0.0; let inWeeds = fWeed > 0.0;
  let moll = spv(k, S_dSnail) > 0.5 && L >= spv(k, S_Lsnail);
  let cs = select(0.0, crayS * fNear / max(fWeed, 1e-9), crayS > 0.0 && nearBed && lit); let big = pisc && crayS > 0.0 && L >= 3.0 * spv(k, S_Lpisc);
  let canB = spv(k, S_benthic) > 0.5 && small && (nearBed || inWeeds); let canZ = spv(k, S_plank) > 0.5 || L < spv(k, S_Lzoo);
  let canS = lit && spv(k, S_dInsect) > 0.5 && small && z <= LIT3_SURF_Z;
  let fp = fpOf(k, cu, z);
  // the offers over the footprint
  var sB = 0.0; var aB = 0.0; var sW = 0.0; var sWls = 0.0; var sWc = 0.0; var nBc = 0u; var sS = 0.0; var aS = 0.0;
  var zD = 0.0; var zC = 0.0; var zw = 0.0; var zE = 0.0; var zEw = 0.0;
  let night = U.night > 0.5;
  for (var q = fp.s0; q < fp.s1; q++) {
    let cc = u32(sti(fp.base + q));
    if (canB) {
      let b0 = u32(sti(O_fColBed0 + cc)); let b1 = u32(sti(O_fColBed0 + cc + 1u));
      for (var t = b0; t < b1; t++) {
        let j = u32(sti(O_fColBedL + t)); if (abs(stf(O_wZMid + j) - bed) > F3_FP_DZ) { continue; }
        nBc += 1u; let a = stf(O_wBedA + j); aB += a; sB += benthE(j) * a;
        let li = sti(O_litIdx + j);
        if (li >= 0) { let l = u32(li); let eL = max(0.0, wd(W_litL + l) - LIT3_REF) * reach(l); let eS = select(0.0, max(0.0, wd(W_litSn + l) - LIT3_SN_REF), moll); let eC = crayE(l, j, cc, gape, cs);
          sWls += (eL + eS) * a; sWc += eC * a; sW += (eL + eS + LIT3_CR_PREF * eC) * a; }
      }
    }
    if (canS) { let a = stf(O_wArea + cc); sS += (wd(W_surfA + cc) + wd(W_surfT + cc)) * a; aS += a; }
    if (canZ) {
      let j0 = cell0(cc); let k1 = min(nL(cc) - 1u, fp.kz);
      var ka = k1; var kb = k1; if (cc == cu) { ka = u32(max(0, i32(k1) - 1)); kb = min(nL(cc) - 1u, k1 + 1u); }
      for (var kk = ka; kk <= kb; kk++) {
        let jz = j0 + kk; let w = stf(O_wW + jz); zw += w;
        zD += zooSeen(jz, 0u) * w; zC += zooSeen(jz, 1u) * w;
        let zv = wd(W_zv + jz); zEw += w; if (zv > 0.0) { zE += (zooSeen(jz, 0u) + zooSeen(jz, 1u)) * zv * w; }
      }
    }
  }
  // (a bed forager with no bed cell in its footprint's band feeds on its own)
  var ownOnly = false;
  if (canB && nBc == 0u && jb >= 0) {
    ownOnly = true; let j = u32(jb); let a = stf(O_wBedA + j); aB = a; sB = benthE(j) * a; sW = 0.0; sWls = 0.0; sWc = 0.0;
    let li = sti(O_litIdx + j);
    if (li >= 0) { let l = u32(li); let eL = max(0.0, wd(W_litL + l) - LIT3_REF) * reach(l); let eS = select(0.0, max(0.0, wd(W_litSn + l) - LIT3_SN_REF), moll); let eC = crayE(l, j, cu, gape, cs);
      sWls = (eL + eS) * a; sWc = eC * a; sW = (eL + eS + LIT3_CR_PREF * eC) * a; }
  }
  let Eb = select(0.0, sB / max(aB, 1e-12), canB && nearBed && !big && aB > 0.0) * fNear;
  let Ew = select(0.0, sW / max(aB, 1e-12), canB && lit && aB > 0.0) * fWeed;
  let Es = select(0.0, sS / max(aS, 1e-12), canS && aS > 0.0);
  let KB = F3_K_BENTH; var fB = 0.0; if (Eb + Ew > 0.0) { fB = (Eb + Ew) / (Eb + Ew + KB); }
  var fS = 0.0; if (Es > 0.0) { fS = Es / (Es + LIT3_K_SURF); }
  var tB = select(0.0, 1.0, canB); var tZ = select(0.0, 1.0, canZ);
  if (canB && canZ) {
    let Ez = select(0.0, zE / zEw * PLANKTON_UGL, zEw > 0.0); let fZ = Ez * Ez / (Ez * Ez + F3_K_ZOO * F3_K_ZOO);
    let qB = pow(fB, F3_SHARE_Q); let qZ = pow(fZ, F3_SHARE_Q); tB = select(0.5, qB / (qB + qZ), qB + qZ > 0.0); tZ = 1.0 - tB;
  }
  let want0 = want - got; var qf = 0u; var wB_ = 0.0; var wW_ = 0.0; var wS_ = 0.0; var wZ_ = 0.0;   // (each request's appetite elasticity: see bShare)
  // the bed and the weeds: split by what each offers; the bed's worms and scuds (K 0: at most CROP of the reachable), the weeds' fauna
  if (tB > 0.0 && room > 0.0 && want > got && fB > 0.0) {
    let wB = min(room, want0 * tB * BENTHOS_Q) * n * fB * visDay;
    var gB = 0.0;
    let el = KB / (Eb + Ew + KB);
    if (Eb > 0.0 && sB > 0.0) { let ask = wB * Eb / (Eb + Ew); let gr = min(ask, PLANKTON_CROP * sB); let f = gr / sB; sa(A_qB, i, f); gB += gr; wB_ = select(el, 1.0, ask >= PLANKTON_CROP * sB); }
    if (Ew > 0.0 && sW > 0.0) { let ask = wB * Ew / (Eb + Ew); let f = min(ask, PLANKTON_CROP * sW) / sW; let cf = min(f * LIT3_CR_PREF, PLANKTON_CROP); sa(A_qW, i, f); sa(A_qC, i, cf); gB += f * sWls + cf * sWc; wW_ = select(el, 1.0, ask >= PLANKTON_CROP * sW); }
    if (ownOnly) { qf |= 1u; }
    room -= gB / n; got += gB / n;
  }
  // the surface: its insects, met by a fish near it
  if (canS && room > 0.0 && want > got && fS > 0.0 && sS > 0.0) {
    let askS = min(room, want0 * fS) * n * visDay; let gS = min(askS, PLANKTON_CROP * sS); let f = gS / sS; sa(A_qS, i, f); wS_ = select(LIT3_K_SURF / (Es + LIT3_K_SURF), 1.0, askS >= PLANKTON_CROP * sS);
    room -= gS / n; got += gS / n;
  }
  // the zooplankton (type III in K_ZOO: a fish with other food switches away from scarce zooplankton), seen by its own eyes
  if (tZ > 0.0 && room > 0.0 && want > got) {
    let v = visDay * visDay; let sD = zD * v; let sC = zC * v; let S = sD + sC;
    if (S > 1e-12 && zw > 0.0) {
      let E = S / zw * PLANKTON_UGL; let askZ = min(room, want0 * tZ * PLANKTON_Q) * n * (E * E / (E * E + F3_K_ZOO * F3_K_ZOO)); let take = min(askZ, PLANKTON_CROP * S);
      wZ_ = select(min(1.0, 2.0 * F3_K_ZOO * F3_K_ZOO / (E * E + F3_K_ZOO * F3_K_ZOO)), 1.0, askZ >= PLANKTON_CROP * S);   // (type III: the ask falls as E² at low density)
      let tD = take * sD / S; let tC = take - tD;
      if (sD > 0.0) { sa(A_qZD, i, tD / sD * v); } if (sC > 0.0) { sa(A_qZC, i, tC / sC * v); }
    }
  }
  sa(A_qFlags, i, f32(qf));
  // the wants into the cells
  let qB = ga(A_qB, i); let qW = ga(A_qW, i); let qC = ga(A_qC, i); let qS = ga(A_qS, i); let qZD = ga(A_qZD, i); let qZC = ga(A_qZC, i);
  if (qB > 0.0 || qW > 0.0) {
    if (ownOnly) { let j = u32(jb); acc64(AC_TB + 2u * j, qB, PW); acc64(AC_TBW + 2u * j, qB * wB_, PW); acc64(AC_TL + 2u * j, qW, PW); acc64(AC_TLW + 2u * j, qW * wW_, PW); if (moll) { acc64(AC_TS + 2u * j, qW, PW); acc64(AC_TSW + 2u * j, qW * wW_, PW); }
      let li = sti(O_litIdx + j); if (qC > 0.0 && li >= 0) { acc64(AC_RC + 2u * j, qC * crayE(u32(li), j, cu, gape, cs), PW); } }
    else {
      for (var q = fp.s0; q < fp.s1; q++) {
        let cc = u32(sti(fp.base + q)); let b0 = u32(sti(O_fColBed0 + cc)); let b1 = u32(sti(O_fColBed0 + cc + 1u));
        for (var t = b0; t < b1; t++) {
          let j = u32(sti(O_fColBedL + t)); if (abs(stf(O_wZMid + j) - bed) > F3_FP_DZ) { continue; }
          if (qB > 0.0) { acc64(AC_TB + 2u * j, qB, PW); acc64(AC_TBW + 2u * j, qB * wB_, PW); }
          if (qW > 0.0) { acc64(AC_TL + 2u * j, qW, PW); acc64(AC_TLW + 2u * j, qW * wW_, PW); if (moll) { acc64(AC_TS + 2u * j, qW, PW); acc64(AC_TSW + 2u * j, qW * wW_, PW); }
            let li = sti(O_litIdx + j); if (qC > 0.0 && li >= 0) { let e = crayE(u32(li), j, cc, gape, cs); if (e > 0.0) { acc64(AC_RC + 2u * j, qC * e, PW); } } }
        }
      }
    }
  }
  if (qS > 0.0) { for (var q = fp.s0; q < fp.s1; q++) { let cc = u32(sti(fp.base + q)); acc64(AC_SURF + 2u * cc, qS, PW); acc64(AC_SURFW + 2u * cc, qS * wS_, PW); } }
  if (qZD > 0.0 || qZC > 0.0) {
    for (var q = fp.s0; q < fp.s1; q++) {
      let cc = u32(sti(fp.base + q)); let j0 = cell0(cc); let k1 = min(nL(cc) - 1u, fp.kz);
      var ka = k1; var kb = k1; if (cc == cu) { ka = u32(max(0, i32(k1) - 1)); kb = min(nL(cc) - 1u, k1 + 1u); }
      for (var kk = ka; kk <= kb; kk++) { if (qZD > 0.0) { acc64(AC_ZD + 2u * (j0 + kk), qZD, PW); acc64(AC_ZDW + 2u * (j0 + kk), qZD * wZ_, PW); } if (qZC > 0.0) { acc64(AC_ZC + 2u * (j0 + kk), qZC, PW); acc64(AC_ZCW + 2u * (j0 + kk), qZC * wZ_, PW); } }
    }
  }
}
// per cell: the share of each kind's wants that is got — (1 − e^(−T))/T (the crayfish: of the grams wanted against those there)
@compute @workgroup_size(256) fn k_fieldCell(@builtin(global_invocation_id) g: vec3u) {
  let j = g.x;
  if (j < WNC) { RC[R_SURF + j] = bShare(rdAcc(AC_SURF + 2u * j, PW), rdAcc(AC_SURFW + 2u * j, PW)); }
  if (j >= WNCELL) { return; }
  RC[R_B + j] = bShare(rdAcc(AC_TB + 2u * j, PW), rdAcc(AC_TBW + 2u * j, PW)); RC[R_L + j] = bShare(rdAcc(AC_TL + 2u * j, PW), rdAcc(AC_TLW + 2u * j, PW)); RC[R_S + j] = bShare(rdAcc(AC_TS + 2u * j, PW), rdAcc(AC_TSW + 2u * j, PW));
  RC[R_ZD + j] = bShare(rdAcc(AC_ZD + 2u * j, PW), rdAcc(AC_ZDW + 2u * j, PW)); RC[R_ZC + j] = bShare(rdAcc(AC_ZC + 2u * j, PW), rdAcc(AC_ZCW + 2u * j, PW));
  let R = rdAcc(AC_RC + 2u * j, PW); var rc = 1.0;
  let li = sti(O_litIdx + j);
  if (R > 0.0 && li >= 0) { let V = wd(W_litCrA + u32(li)) + wd(W_litCrY + u32(li)); if (V > 0.0) { rc = V * (1.0 - exp(-R / V)) / R; } else { rc = 0.0; } }
  RC[R_C + j] = rc;
}
// what each fish got: its wants × the cells' shares (the water still as it was: the cells are emptied after)
@compute @workgroup_size(64) fn k_fieldTake(@builtin(global_invocation_id) g: vec3u) {
  let i = g.x; if (i >= U.n) { return; }
  let fl = gau(A_flags, i); if ((fl & FL_ALIVE) == 0u) { return; }
  let qB = ga(A_qB, i); let qW = ga(A_qW, i); let qC = ga(A_qC, i); let qS = ga(A_qS, i); let qZD = ga(A_qZD, i); let qZC = ga(A_qZC, i);
  if (qB <= 0.0 && qW <= 0.0 && qS <= 0.0 && qZD <= 0.0 && qZC <= 0.0) { return; }
  let k = gau(A_k, i); let L = ga(A_L, i); let n = ga(A_n, i); let z = ga(A_z, i); let bed = ga(A_bed, i); let cu = u32(gai(A_c, i)); let jb = gai(A_jb, i);
  let gape = ga(A_gape, i); let crayS = spv(k, S_cray); let lit = U.lit != 0u;
  let fNW = bedShares(jb, bed, z, L, wd(W_canopy + cu), lit); let nearBed = fNW.x > 0.0;
  let moll = spv(k, S_dSnail) > 0.5 && L >= spv(k, S_Lsnail); let cs = select(0.0, crayS * fNW.x / max(fNW.y, 1e-9), crayS > 0.0 && nearBed && lit);
  let ownOnly = (u32(ga(A_qFlags, i)) & 1u) != 0u;
  let fp = fpOf(k, cu, z);
  var gb = 0.0; var gw = 0.0; var Jw = 0.0; var gc = 0.0; var gs = 0.0; var gzD = 0.0; var gzC = 0.0;
  if (qB > 0.0 || qW > 0.0) {
    var t0 = fp.s0; var t1 = fp.s1; if (ownOnly) { t0 = 0u; t1 = 1u; }
    for (var q = t0; q < t1; q++) {
      var cc = cu; var b0 = 0u; var b1 = 1u;
      if (!ownOnly) { cc = u32(sti(fp.base + q)); b0 = u32(sti(O_fColBed0 + cc)); b1 = u32(sti(O_fColBed0 + cc + 1u)); }
      for (var t = b0; t < b1; t++) {
        var j = u32(max(jb, 0)); if (!ownOnly) { j = u32(sti(O_fColBedL + t)); if (abs(stf(O_wZMid + j) - bed) > F3_FP_DZ) { continue; } }
        let a = stf(O_wBedA + j);
        if (qB > 0.0) { gb += qB * benthE(j) * a * RC[R_B + j]; }
        let li = sti(O_litIdx + j);
        if (qW > 0.0 && li >= 0) {
          let l = u32(li); let eL = max(0.0, wd(W_litL + l) - LIT3_REF) * reach(l); let eS = select(0.0, max(0.0, wd(W_litSn + l) - LIT3_SN_REF), moll); let eC = crayE(l, j, cc, gape, cs);
          let gl = qW * eL * a * RC[R_L + j]; let gsn = qW * eS * a * RC[R_S + j]; let gcr = qC * eC * a * RC[R_C + j];
          gw += gl + gsn + gcr; gc += gcr; Jw += gl * LIT3_ED_INS + gsn * PREY_SNAIL_ED * PREY_SNAIL_DIG + gcr * PREY_CRAY_ED * PREY_CRAY_DIG;
        }
      }
    }
  }
  if (qS > 0.0) { for (var q = fp.s0; q < fp.s1; q++) { let cc = u32(sti(fp.base + q)); gs += qS * (wd(W_surfA + cc) + wd(W_surfT + cc)) * stf(O_wArea + cc) * RC[R_SURF + cc]; } }
  if (qZD > 0.0 || qZC > 0.0) {
    for (var q = fp.s0; q < fp.s1; q++) {
      let cc = u32(sti(fp.base + q)); let j0 = cell0(cc); let k1 = min(nL(cc) - 1u, fp.kz);
      var ka = k1; var kb = k1; if (cc == cu) { ka = u32(max(0, i32(k1) - 1)); kb = min(nL(cc) - 1u, k1 + 1u); }
      for (var kk = ka; kk <= kb; kk++) { let jz = j0 + kk; let w = stf(O_wW + jz); gzD += qZD * zooSeen(jz, 0u) * w * RC[R_ZD + jz]; gzC += qZC * zooSeen(jz, 1u) * w * RC[R_ZC + jz]; }
    }
  }
  let G = gb + gw + gs + gzD + gzC; if (!(G > 0.0)) { return; }
  sa(A_gut, i, ga(A_gut, i) + G / n);
  sa(A_gutE, i, ga(A_gutE, i) + (gb * PREY_BENTH_ED + Jw + gs * PREY_INSECT_ED + gzD * PREY_DAPH_ED + gzC * PREY_COPE_ED) / n);
  sa(A_fGot, i, ga(A_fGot, i) + G / n); sa(A_fRoom, i, ga(A_fRoom, i) - G / n);
  add64(&TL, T_FOOD + 2u * FOOD_BENTH, gb, TSCALE); add64(&TL, T_FOOD + 2u * FOOD_WEED, gw - gc, TSCALE); add64(&TL, T_FOOD + 2u * FOOD_CRAY, gc, TSCALE);
  add64(&TL, T_FOOD + 2u * FOOD_SURF, gs, TSCALE); add64(&TL, T_FOOD + 2u * FOOD_ZOO, gzD + gzC, TSCALE);
  { let kf = gau(A_k, i); foodK(kf, 2u, gb); foodK(kf, 3u, gw - gc); foodK(kf, 4u, gc); foodK(kf, 5u, gs); foodK(kf, 6u, gzD + gzC); }
}
// the cells emptied: each kind loses 1 − e^(−T) of what was reachable; the crayfish the grams got, from adults and young alike
@compute @workgroup_size(256) fn k_fieldApply(@builtin(global_invocation_id) g: vec3u) {
  let j = g.x;
  if (j < WNC) { let T = rdAcc(AC_SURF + 2u * j, PW); if (T > 0.0) { let keep = 1.0 - bTaken(T, rdAcc(AC_SURFW + 2u * j, PW)); WD[W_surfA + j] *= keep; WD[W_surfT + j] *= keep; } }
  if (j >= WNCELL) { return; }
  { let T = rdAcc(AC_TB + 2u * j, PW); if (T > 0.0) { WD[W_benth + j] -= bTaken(T, rdAcc(AC_TBW + 2u * j, PW)) * benthE(j) * A2; } }
  { let T = rdAcc(AC_ZD + 2u * j, PW); if (T > 0.0) { WD[W_zooD + j] *= 1.0 - bTaken(T, rdAcc(AC_ZDW + 2u * j, PW)) * zooExposed(j, 0u); } }
  { let T = rdAcc(AC_ZC + 2u * j, PW); if (T > 0.0) { WD[W_zooC + j] *= 1.0 - bTaken(T, rdAcc(AC_ZCW + 2u * j, PW)) * (1.0 - ZOO3_COPE_ESCAPE) * zooExposed(j, 1u); } }
  let li = sti(O_litIdx + j); if (li < 0) { return; }
  let l = u32(li); let cc = u32(sti(O_wColOfCell + j));
  { let T = rdAcc(AC_TL + 2u * j, PW); if (T > 0.0) { WD[W_litL + l] -= bTaken(T, rdAcc(AC_TLW + 2u * j, PW)) * max(0.0, wd(W_litL + l) - LIT3_REF) * reach(l); } }
  { let T = rdAcc(AC_TS + 2u * j, PW); if (T > 0.0) { WD[W_litSn + l] -= bTaken(T, rdAcc(AC_TSW + 2u * j, PW)) * max(0.0, wd(W_litSn + l) - LIT3_SN_REF); } }
  { let R = rdAcc(AC_RC + 2u * j, PW); let cA = wd(W_litCrA + l); let cY = wd(W_litCrY + l); let V = cA + cY;
    if (R > 0.0 && V > 0.0) { let G = V * (1.0 - exp(-R / V)); WD[W_litCrA + l] = cA - G * cA / V; WD[W_litCrY + l] = cY - G * cY / V; } }
}
// ---- the organic layer, the poor food of a bottom-sifter that got nothing else (chem3 takeSedOM) ----
@compute @workgroup_size(128) fn k_sedReq(@builtin(global_invocation_id) g: vec3u) {
  let i = g.x; if (i >= U.n) { return; }
  let fl = gau(A_flags, i); sa(A_qSed, i, 0.0); if ((fl & FL_ALIVE) == 0u) { return; }
  let k = gau(A_k, i); let jb = gai(A_jb, i);
  if (ga(A_fGot, i) > 0.0 || spv(k, S_sift) < 0.5 || jb < 0 || ga(A_bed, i) - ga(A_z, i) > F3_BENTH_REACH + ga(A_L, i) / 200.0) { return; }
  let W = ga(A_W, i); let gmax = spv(k, S_gut) * W; let pRoom = min(ga(A_fGEff, i), FEED_POOR_GUT * gmax) - ga(A_gut, i);
  if (!(pRoom > 0.0)) { return; }
  let wantG = min(pRoom, ga(A_fWant, i) - ga(A_fGot, i)) * ga(A_n, i); if (!(wantG > 0.0)) { return; }
  sa(A_qSed, i, wantG); acc64(AC_SED + 2u * u32(jb), wantG, GW);
}
@compute @workgroup_size(256) fn k_sedCell(@builtin(global_invocation_id) g: vec3u) {
  let j = g.x; if (j >= WNCELL) { return; }
  let D = rdAcc(AC_SED + 2u * j, GW); var r = 1.0;
  if (D > 0.0) { let V = wd(W_sedOM + j) * stf(O_wA + j); if (V > 0.0) { let G = min(D, V); r = G / D; WD[W_sedOM + j] -= G / stf(O_wA + j); } else { r = 0.0; } }
  RC[R_SED + j] = r;
}
@compute @workgroup_size(128) fn k_sedTake(@builtin(global_invocation_id) g: vec3u) {
  let i = g.x; if (i >= U.n) { return; }
  let q = ga(A_qSed, i); if (!(q > 0.0)) { return; }
  let gr = q * RC[R_SED + u32(gai(A_jb, i))]; let n = ga(A_n, i);
  sa(A_gut, i, ga(A_gut, i) + gr / n); sa(A_gutE, i, ga(A_gutE, i) + gr / n * PREY_DETRITUS_ED * PREY_DETRITUS_DIG); sa(A_fGot, i, ga(A_fGot, i) + gr / n);
  add64(&TL, T_FOOD + 2u * FOOD_SED, gr, TSCALE); foodK(gau(A_k, i), 7u, gr);
}
// ---- fish3 _feed's end and _live's after it: hunger, a meal (the learning's reward), the intake tally ----
@compute @workgroup_size(128) fn k_feedEnd(@builtin(global_invocation_id) g: vec3u) {
  let i = g.x; if (i >= U.n) { return; }
  var fl = gau(A_flags, i); if ((fl & FL_ALIVE) == 0u) { return; }
  let k = gau(A_k, i); let W = ga(A_W, i); let gmax = spv(k, S_gut) * W; let gut = ga(A_gut, i); let gained = gut - ga(A_gut0, i);
  if (gained > 0.0) { add64(&TL, T_INTAKE + 2u * k, gained * ga(A_n, i), TSCALE); }
  if (gained >= PLANKTON_BITE_MIN * gmax * (U.dt / OLD_S) / (1.0 / 30.0)) { fl |= FL_ATE; sa(A_eaten, i, ga(A_eaten, i) + 1.0); }
  sa(A_hunger, i, 1.0 - clamp(gut / (spv(k, S_gut) * W), 0.0, 1.0));
  sau(A_flags, i, fl);
}
`;

// ============================================================ BREATH AND DEATH (fish3 _live's O₂; _hazards) =====================
export const HAZ = /* wgsl */`
@compute @workgroup_size(128) fn k_o2(@builtin(global_invocation_id) g: vec3u) {   // this block's respiration (all n fish) from its water
  let i = g.x; if (i >= U.n) { return; }
  let fl = gau(A_flags, i); if ((fl & FL_ALIVE) == 0u) { return; }
  let j = gai(A_j, i); if (j < 0) { return; }
  acc64(AC_O2 + 2u * u32(j), ga(A_n, i) * ga(A_rO2, i) * U.dt, GW);
}
@compute @workgroup_size(256) fn k_o2Apply(@builtin(global_invocation_id) g: vec3u) {
  let j = g.x; if (j >= WNCELL) { return; }
  let b = rdAcc(AC_O2 + 2u * j, GW); if (b > 0.0) { WD[W_o2 + j] = max(0.0, wd(W_o2 + j) - b / (stf(O_wVol + j) * ENV_O2_MGL)); }
  let add = rdAcc(AC_SEDADD + 2u * j, GW); if (add > 0.0) { WD[W_sedOM + j] += add / stf(O_wA + j); }
}
fn tallyDeath(k: u32, cause: u32, n: f32) { add64(&TL, T_DIED + 2u * (k * NCAUSE + cause), n, TSCALE); }
fn toBed(jb: i32, g: f32) { if (jb >= 0 && g > 0.0) { acc64(AC_SEDADD + 2u * u32(jb), g, GW); } }
@compute @workgroup_size(128) fn k_hazards(@builtin(global_invocation_id) g: vec3u) {
  let i = g.x; if (i >= U.n) { return; }
  var fl = gau(A_flags, i); if ((fl & FL_ALIVE) == 0u) { return; }
  let k = gau(A_k, i); let id = gau(A_id, i); let dt = U.dt; let K = ga(A_K, i); let T = ga(A_T, i); let L = ga(A_L, i); let W = ga(A_W, i); let jb = gai(A_jb, i);
  var hS = 0.0; if (K < BIOE_K_HAZARD) { hS = -log(max(1e-9, sigm(BIOE_STARVE_A + BIOE_STARVE_B * K))) / DAY; }
  { let hW = wHaz(k, L, f32(gau(A_age, i)), dt); if (hW >= 0.0) { hS = hW; } }   // (the first winter: the ramp in place of starvation)
  let kx = expm(dt * TS / BIOE_EXPOSE_TAU); let xo = ga(A_xo, i) + (ga(A_o2, i) - ga(A_xo, i)) * kx; let xt = ga(A_xt, i) + (T - ga(A_xt, i)) * kx;
  sa(A_xo, i, xo); sa(A_xt, i, xt);
  let uilt = ga(A_uilt, i); var hH = 0.0; if (xt > uilt - 2.0) { hH = 0.6931471805599453 / (BIOE_UILT_DAYS * DAY) * exp((xt - uilt) / BIOE_HEAT_STEEP); }
  let o2Lx = lethalO2(ga(A_o2Lethal, i), ga(A_o2Ice, i), xt);
  var hO = 0.0; if (xo < o2Lx) { hO = 0.6931471805599453 / (BIOE_HYPOXIA_DAYS * DAY) * exp(BIOE_HYPOXIA_STEEP * (o2Lx - xo) / o2Lx); }
  let hM = spv(k, S_M) * BIOE_M_OTHER * clamp(pow(L / spv(k, S_Lref), -0.87), 0.5, 3.0) / YEAR;
  let hz = hS + hH + hO + hM; let old = f32(gau(A_age, i)) > spv(k, S_maxAge);
  var cause = CAUSE_OTHER;
  if (old) { cause = CAUSE_OLD; } else if (hS >= hH && hS >= hO && hS >= hM) { cause = CAUSE_STARVE; } else if (hH >= hO && hH >= hM) { cause = CAUSE_HEAT; } else if (hO >= hM) { cause = CAUSE_HYPOXIA; }
  let n = ga(A_n, i);
  if (old || !(W > 0.0)) { tallyDeath(k, cause, n); toBed(jb, n * W); sa(A_n, i, 0.0); sau(A_flags, i, fl & ~FL_ALIVE); return; }
  if (n > 1.0) {   // a school loses a fraction; the shares by cause
    let lost = n * expm(hz * dt);
    if (lost > 0.0) {
      if (hS > 0.0) { tallyDeath(k, CAUSE_STARVE, lost * hS / hz); } if (hH > 0.0) { tallyDeath(k, CAUSE_HEAT, lost * hH / hz); }
      if (hO > 0.0) { tallyDeath(k, CAUSE_HYPOXIA, lost * hO / hz); } if (hM > 0.0) { tallyDeath(k, CAUSE_OTHER, lost * hM / hz); }
      toBed(jb, lost * W);
    }
    let left = n - lost;
    if (left < 1.0) { toBed(jb, left * W); sa(A_n, i, 0.0); sau(A_flags, i, fl & ~FL_ALIVE); } else { sa(A_n, i, left); }
  } else if (hz > 0.0 && rnd(id, 40u, 0u) < expm(hz * dt)) { tallyDeath(k, cause, 1.0); toBed(jb, n * W); sa(A_n, i, 0.0); sau(A_flags, i, fl & ~FL_ALIVE); }
}
`;

// ============================================================ THE YOUNG (fish3 _eatYoy, _yoyLive, _feedYoy, _yoyTarget) =======
export const YOY_BINDINGS = /* wgsl */`
@group(1) @binding(0) var<storage, read> YHS: array<u32>;                // the young's grid (the block's start)
@group(1) @binding(1) var<storage, read> YHI: array<u32>;
@group(1) @binding(2) var<storage, read_write> TL: array<atomic<u32>>;
@group(1) @binding(3) var<storage, read_write> GL: array<f32>;
@group(1) @binding(4) var<storage, read_write> Y: array<f32>;            // the young schools (field-major, ycap)
@group(1) @binding(5) var<storage, read_write> YG: array<f32>;           // their genomes + genes
@group(1) @binding(6) var<storage, read_write> GS: array<atomic<u32>>;
@group(1) @binding(7) var<storage, read_write> ACC: array<atomic<u32>>;
@group(1) @binding(8) var<storage, read_write> RC: array<f32>;
const G_JUVD: u32 = 48u; const GS_BIO: u32 = 64u; const GS_JUVD: u32 = 80u;`;
export const YOY = /* wgsl */`
fn gy(f: u32, q: u32) -> f32 { return Y[f * U.ycap + q]; }
fn gyu(f: u32, q: u32) -> u32 { return bitcast<u32>(Y[f * U.ycap + q]); }
fn gyi(f: u32, q: u32) -> i32 { return bitcast<i32>(Y[f * U.ycap + q]); }
fn sy(f: u32, q: u32, v: f32) { Y[f * U.ycap + q] = v; }
fn syu(f: u32, q: u32, v: u32) { Y[f * U.ycap + q] = bitcast<f32>(v); }
fn syi(f: u32, q: u32, v: i32) { Y[f * U.ycap + q] = bitcast<f32>(v); }
fn yAlive(q: u32) -> bool { return (gyu(Y_flags, q) & 1u) != 0u; }
fn yDie(q: u32) { syu(Y_flags, q, gyu(Y_flags, q) & ~1u); }
const PW: f32 = 1e12; const GW: f32 = 1e9; const KW: f32 = 1e6;
fn acc64(at: u32, v: f32, scale: f32) { add64(&ACC, at, v, scale); }
fn rdAcc(at: u32, scale: f32) -> f32 { return (f32(atomicLoad(&ACC[at])) + f32(atomicLoad(&ACC[at + 1u])) * 4294967296.0) / scale; }
// THE SHARE of its want each feeder of a cell gets: T the summed wants (as shares of the cell's reachable food), W their weight on
// appetites that fall with the food (each feeder's K/(E + K) — its functional response's elasticity — or 1 when it was capped at
// CROP of what is there): fish3's feeders, one after another, each ask for grams; an appetite that doesn't fall with the food
// gets its whole ask until the food runs out (rationing: min(T, 1) taken), one that falls in step with it strips the cell
// geometrically (1 − e^(−T)). A first version rationed every feeder alike and the young grew ~3–5 % fast at 1/10 (the brook's
// young dace reached recruiting size days early)
fn bShare(T: f32, V: f32) -> f32 {
  if (!(T > 0.0)) { return 1.0; }
  let W = clamp(V / T, 0.0, 1.0); let lin = select(1.0, 1.0 / T, T > 1.0); var ex = 1.0 - 0.5 * T; if (T > 1e-4) { ex = (1.0 - exp(-T)) / T; }
  return (1.0 - W) * lin + W * ex;
}
fn bTaken(T: f32, V: f32) -> f32 { return T * bShare(T, V); }
fn reach(l: u32) -> f32 { return wd(W_pReach + l); }   // (littoral3 reach: bed cell index l — plants3 reachB, by stand)
fn benthE(j: u32) -> f32 { return max(0.0, wd(W_benth + j) / A2 - BENTHOS_REFUGE); }
fn yrnd(q: u32, purpose: u32, k: u32) -> f32 { return rnd(gyu(Y_id, q), purpose, k); }
// the snapshot: where each school began the block (fish3's hash of the young is the block's start; a school before another in the
// list has moved when the other looks — kept so, as the fish's strikes)
@compute @workgroup_size(256) fn y_snap(@builtin(global_invocation_id) g: vec3u) {
  let q = g.x; if (q >= U.ny) { return; }
  sy(Y_sx, q, gy(Y_x, q)); sy(Y_sy, q, gy(Y_y, q)); sy(Y_sz, q, gy(Y_z, q)); sy(Y_eaten, q, 0.0);
  if (yAlive(q)) { add64(&GS, GS_BIO, gy(Y_n, q) * gy(Y_W, q), BSCALE); }
}
// ---- A FISH EATS FROM A SCHOOL OF YOUNG (fish3 _eatYoy): the nearest it can take within reach; a piscivore works a school in its
// strike arena (FRY.ATTACK a second × capture, fewer from a thinned school, the size refuge), a plankton eater picks at larvae it fits;
// a guarded brood is hard to take. Its catch asked for here; a school asked for more than it has gives each its share
fn nearYoy(x: f32, y: f32, z: f32, R: f32, i: u32, mode: u32, self_: u32) -> vec2f {   // (index, distance); mode 0: a fish i eats; 1: a school self_ eats
  var best = -1; var bd = R * R;
  let gx0 = clamp(i32((x - R - GX0) / F3_HC), 0, i32(HHX) - 1); let gx1 = clamp(i32((x + R - GX0) / F3_HC), 0, i32(HHX) - 1);
  let gy0 = clamp(i32((y - R - GY0) / F3_HC), 0, i32(HHY) - 1); let gy1 = clamp(i32((y + R - GY0) / F3_HC), 0, i32(HHY) - 1);
  for (var gyy = gy0; gyy <= gy1; gyy++) {
    for (var gxx = gx0; gxx <= gx1; gxx++) {
      let c = u32(gyy) * HHX + u32(gxx);
      for (var t = YHS[c]; t < YHS[c + 1u]; t++) {
        let q = YHI[t]; if (!yAlive(q)) { continue; }
        var p = vec3f(gy(Y_sx, q), gy(Y_sy, q), gy(Y_sz, q));
        if (mode == 1u) { if (q == self_) { continue; } if (q < self_) { p = vec3f(gy(Y_x, q), gy(Y_y, q), gy(Y_z, q)); } }
        let d = p - vec3f(x, y, z); let d2 = dot(d, d); if (!(d2 < bd)) { continue; }
        if (!yoyOk(q, i, mode, self_)) { continue; }
        bd = d2; best = i32(q);
      }
    }
  }
  return vec2f(f32(best), sqrt(bd));
}
fn yoyOk(q: u32, i: u32, mode: u32, self_: u32) -> bool {
  let qL = gy(Y_L, q); let qk = gyu(Y_k, q);
  if (mode == 1u) { let ks = gyu(Y_k, self_); let Ls = gy(Y_L, self_); return qL * spv(qk, S_depthR) <= Ls * spv(ks, S_gapeR) && qL >= FEED_SCHOOL_MIN * Ls; }
  if (gyu(Y_guard, q) == gau(A_id, i)) { return false; }
  let k = gau(A_k, i); let L = ga(A_L, i); let pisc = spv(k, S_pisc) > 0.5 && L >= spv(k, S_Lpisc); let larv = !pisc || L < 3.0 * spv(k, S_Lpisc);
  return (pisc && gy(Y_bdep, q) <= ga(A_gape, i) && qL >= FEED_SCHOOL_MIN * L && qL <= spv(k, S_preyLR) * L) || (larv && qL <= FRY_LARVA_L && qL <= L / 3.0);
}
fn poissonish(r: f32, u: f32) -> f32 { let k = floor(r); return k + select(0.0, 1.0, u < r - k); }
// ---- (stage Y1) PREDATION ON THE YOUNG BY DENSITY (fish3 _yTable, _yReq, _ySettle) ----
const BSC: f32 = 1e6;
fn yBin(c: u32, k: u32, L: f32) -> u32 { let s = u32(clamp(floor(log2(max(L, 1e-3) / 0.5)), 0.0, FRY_NS - 1.0)); return (c * NK + k) * u32(FRY_NS) + s; }
fn colVol(c: u32) -> f32 { var v = 0.0; for (var k = 0u; k < nL(c); k++) { v += stf(O_wVol + cell0(c) + k); } return v; }
// a bin's w × available (fish3 _yReq's per-bin weight before the clearance and the volume): a piscivore's size window on prey within
// its gape and preyLR, × the prey's vulnerability; or the larvae a plankton or insect eater fits, × LARV_A by their detectability
fn yBinW(b: u32, L: f32, gape: f32, pisc: bool, larv: bool, preyLR: f32) -> f32 {
  let av = rdAcc(AC_BAV + 2u * b, BSC); if (!(av > 0.0)) { return 0.0; }
  let Lq = rdAcc(AC_BSL + 2u * b, BSC) / av; let r = Lq / L; let kq = (b / u32(FRY_NS)) % NK; var w = 0.0;
  if (pisc && rdAcc(AC_BSD + 2u * b, BSC) / av <= gape && r >= FRY_WIN_MIN && r <= preyLR) { let R = 1.0 / r; let u = R / FRY_WIN_R * exp(1.0 - R / FRY_WIN_R); w = pow(u, FRY_WIN_E) * spv(kq, S_vuln); }
  if (larv && w < FRY_LARV_A && Lq <= FRY_LARVA_L && Lq <= L / 3.0) { w = max(w, FRY_LARV_A * clamp(0.2 + 0.8 * (Lq - FRY_DETECT_L_0) / (FRY_DETECT_L_1 - FRY_DETECT_L_0), 0.2, 1.0)); }
  return w * av;
}
// a predator's request over its column's bins: (K fish over dt for its n, Σ a·D) — Holling II, handling = the prey's mass / imax,
// capped at gMax g a fish
fn yReqK(c: u32, n: f32, L: f32, gape: f32, imax: f32, dt: f32, gMax: f32, pisc: bool, larv: bool, eff: f32, preyLR: f32) -> vec2f {
  let V = colVol(c); if (!(V > 0.0) || !(imax > 0.0) || !(gMax > 0.0) || !(eff > 0.0)) { return vec2f(0.0); }
  let a0 = FRY_CLEAR_A * pow(L * 10.0, FRY_CLEAR_B) / DAY * eff / V; let NB = NK * u32(FRY_NS); let b0 = c * NB;
  var sA = 0.0; var sAH = 0.0; var sG = 0.0;
  for (var j = 0u; j < NB; j++) { let b = b0 + j; let w = yBinW(b, L, gape, pisc, larv, preyLR); if (!(w > 0.0)) { continue; }
    let aD = a0 * w; let Wq = rdAcc(AC_BSW + 2u * b, BSC) / rdAcc(AC_BAV + 2u * b, BSC); sA += aD; sAH += aD * Wq / imax; sG += aD * Wq; }
  if (!(sA > 0.0)) { return vec2f(0.0); }
  var K = n * dt * sA / (1.0 + sAH); let g = K * sG / sA; if (g > gMax * n) { K *= gMax * n / g; }
  return vec2f(K, sA);
}
@compute @workgroup_size(256) fn y_table(@builtin(global_invocation_id) g: vec3u) {
  let q = g.x; if (q >= U.ny) { return; }
  syi(Y_yb, q, -1); sy(Y_ya, q, 0.0);
  if (FRY_DENSITY < 0.5 || !yAlive(q)) { return; }
  let c = gyi(Y_c, q); let n = gy(Y_n, q); if (c < 0 || !(n > 0.0)) { return; }
  var held = false; let gr = gyi(Y_gref, q); if (gr >= 0) { let gi = u32(gr); held = (gau(A_flags, gi) & FL_ALIVE) != 0u && gau(A_id, gi) == gyu(Y_guard, q) && ga(A_nt, gi) > 0.0; }
  let a = n * (1.0 - gy(Y_cover, q)) * select(1.0, 1.0 - BROOD_PROTECT, held); if (!(a > 0.0)) { return; }
  let L = gy(Y_L, q); let b = yBin(u32(c), gyu(Y_k, q), L);
  acc64(AC_BAV + 2u * b, a, BSC); acc64(AC_BSL + 2u * b, a * L, BSC); acc64(AC_BSW + 2u * b, a * gy(Y_W, q), BSC); acc64(AC_BSD + 2u * b, a * gy(Y_bdep, q), BSC);
  syi(Y_yb, q, i32(b)); sy(Y_ya, q, a);
}
@compute @workgroup_size(64) fn k_eatYoyReq(@builtin(global_invocation_id) g: vec3u) {
  let i = g.x; if (i >= U.n) { return; }
  sai(A_claim, i, -1); sa(A_qB, i, 0.0);
  let fl = gau(A_flags, i); if ((fl & FL_ALIVE) == 0u || U.ny == 0u) { return; }
  let room = ga(A_fRoom, i); if (!(room > 0.0) || !(ga(A_fWant, i) > ga(A_fGot, i))) { return; }
  let k = gau(A_k, i); let L = ga(A_L, i); let n = ga(A_n, i); let id = gau(A_id, i);
  let pisc = spv(k, S_pisc) > 0.5 && L >= spv(k, S_Lpisc);
  if (FRY_DENSITY > 0.5) {   // (stage Y1: a request over its column's bins, settled in k_eatYoyGet)
    let c = gai(A_c, i); if (c < 0) { return; }
    let larv = !pisc || L < 3.0 * spv(k, S_Lpisc); let eff = ga(A_fPerf, i) * ga(A_visF, i);
    let r = yReqK(u32(c), n, L, ga(A_gape, i), ga(A_fWant, i) / U.dt, U.dt, min(room, ga(A_fWant, i) - ga(A_fGot, i)), pisc, larv, eff, spv(k, S_preyLR));
    if (!(r.x > 0.0)) { return; }
    let a0 = FRY_CLEAR_A * pow(L * 10.0, FRY_CLEAR_B) / DAY * eff / colVol(u32(c)); let NB = NK * u32(FRY_NS); let b0 = u32(c) * NB;
    for (var j = 0u; j < NB; j++) { let b = b0 + j; let w = yBinW(b, L, ga(A_gape, i), pisc, larv, spv(k, S_preyLR)); if (w > 0.0) { acc64(AC_BREQ + 2u * b, r.x * a0 * w / r.y, BSC); } }
    sai(A_claim, i, -2); sa(A_qB, i, r.x); return;
  }
  let R0 = F3_YOY_EAT_R + L / 100.0; var Ra = R0; if (pisc) { Ra = max(R0, spv(k, S_strikeR) * 1.5); }
  let near = nearYoy(ga(A_x, i), ga(A_y, i), ga(A_z, i), Ra, i, 0u, 0u); if (near.x < 0.0) { return; }
  let q = u32(near.x); let d = near.y; let qL = gy(Y_L, q); let qn = gy(Y_n, q); let qk = gyu(Y_k, q);
  let asPisc = pisc && gy(Y_bdep, q) <= ga(A_gape, i) && qL >= FEED_SCHOOL_MIN * L && qL <= spv(k, S_preyLR) * L;
  let dens = qn / (qn + FRY_N_HALF) * (1.0 - gy(Y_cover, q)); let perf = ga(A_fPerf, i);
  var sz = 1.0; var close = 1.0;
  if (asPisc) { sz = pow(max(0.0, 1.0 - gy(Y_bdep, q) / ga(A_gape, i)), FEED_SIZE_SEL); if (Ra > R0) { close = clamp((Ra - d) / (Ra - R0), 0.0, 1.0); } }
  var mean = FRY_CATCH * TS * (U.dt / FEED_HANDLE) * dens * perf;
  if (asPisc) { mean = FRY_ATTACK * TS * spv(k, S_capture) * spv(qk, S_vuln) * sz * dens * close * perf * U.dt; }
  mean *= n;
  let kk = min(min(floor(qn), floor(room * n / gy(Y_W, q))), poissonish(mean, rnd(id, 50u, 0u)));
  if (kk < 1.0) { return; }
  // a guarded brood: its guardian near the nest drives most attacks off
  let gr = gyi(Y_gref, q);
  if (gr >= 0) { let gi = u32(gr); if ((gau(A_flags, gi) & FL_ALIVE) != 0u && gau(A_id, gi) == gyu(Y_guard, q) && ga(A_nt, gi) > 0.0 && length(vec2f(ga(A_x, gi) - gy(Y_nx, q), ga(A_y, gi) - gy(Y_ny, q))) < F3_GUARD_R * 1.5 && rnd(id, 51u, 0u) < BROOD_PROTECT) { return; } }
  sai(A_claim, i, i32(q)); sa(A_qB, i, kk); acc64(AC_YD + 2u * q, kk, KW);
}
@compute @workgroup_size(128) fn k_eatYoyGet(@builtin(global_invocation_id) g: vec3u) {
  let i = g.x; if (i >= U.n) { return; }
  let qi = gai(A_claim, i);
  if (qi == -2) {   // (stage Y1) its share of each bin: min(1, available / requested), as much as its gut has room for now
    let k = gau(A_k, i); let L = ga(A_L, i); let n = ga(A_n, i); let c = u32(gai(A_c, i)); let K = ga(A_qB, i);
    let pisc = spv(k, S_pisc) > 0.5 && L >= spv(k, S_Lpisc); let larv = !pisc || L < 3.0 * spv(k, S_Lpisc); let eff = ga(A_fPerf, i) * ga(A_visF, i);
    let a0 = FRY_CLEAR_A * pow(L * 10.0, FRY_CLEAR_B) / DAY * eff / colVol(c); let NB = NK * u32(FRY_NS); let b0 = c * NB;
    var sA = 0.0; for (var j = 0u; j < NB; j++) { sA += a0 * yBinW(b0 + j, L, ga(A_gape, i), pisc, larv, spv(k, S_preyLR)); }
    if (!(sA > 0.0)) { return; }
    var gS = 0.0; var jS = 0.0;
    for (var j = 0u; j < NB; j++) { let b = b0 + j; let w = a0 * yBinW(b, L, ga(A_gape, i), pisc, larv, spv(k, S_preyLR)); if (!(w > 0.0)) { continue; }
      let av = rdAcc(AC_BAV + 2u * b, BSC); let kk = K * w / sA * min(1.0, av / max(rdAcc(AC_BREQ + 2u * b, BSC), 1e-12)); let Wq = rdAcc(AC_BSW + 2u * b, BSC) / av;
      gS += kk * Wq; jS += kk * Wq * energyDensity(2u * ((b / u32(FRY_NS)) % NK), Wq); }
    if (!(gS > 0.0)) { return; }
    let room = ga(A_fRoom, i); var s = 1.0; if (room > 0.0) { s = min(1.0, room * n / gS); } else { s = 0.0; } if (!(s > 0.0)) { return; }
    for (var j = 0u; j < NB; j++) { let b = b0 + j; let w = a0 * yBinW(b, L, ga(A_gape, i), pisc, larv, spv(k, S_preyLR)); if (!(w > 0.0)) { continue; }
      let av = rdAcc(AC_BAV + 2u * b, BSC); let kk = K * w / sA * min(1.0, av / max(rdAcc(AC_BREQ + 2u * b, BSC), 1e-12)) * s;
      acc64(AC_BGOT + 2u * b, kk, BSC); add64(&TL, T_YKILLS + 2u * (k * NK + (b / u32(FRY_NS)) % NK), kk, TSCALE); }
    let gr = gS * s / n;
    sa(A_gut, i, ga(A_gut, i) + gr); sa(A_gutE, i, ga(A_gutE, i) + jS * s / n); sa(A_fRoom, i, ga(A_fRoom, i) - gr); sa(A_fGot, i, ga(A_fGot, i) + gr);
    add64(&TL, T_FOOD + 2u * FOOD_YOY, gr * n, TSCALE); foodK(k, 1u, gr * n); sau(A_flags, i, gau(A_flags, i) | FL_ATE);
    return;
  }
  if (qi < 0) { return; }
  let q = u32(qi); let D = rdAcc(AC_YD + 2u * q, KW); let avail = floor(gy(Y_n, q));
  let kk = floor(ga(A_qB, i) * min(1.0, avail / max(D, 1e-9))); if (kk < 1.0) { return; }
  acc64(AC_YT + 2u * q, kk, KW);
  let n = ga(A_n, i); let W = gy(Y_W, q); let gr = kk * W / n;
  sa(A_gut, i, ga(A_gut, i) + gr); sa(A_gutE, i, ga(A_gutE, i) + gr * energyDensity(2u * gyu(Y_k, q), W));
  sa(A_fRoom, i, ga(A_fRoom, i) - gr); sa(A_fGot, i, ga(A_fGot, i) + gr);
  add64(&TL, T_FOOD + 2u * FOOD_YOY, gr * n, TSCALE); foodK(gau(A_k, i), 1u, gr * n); add64(&TL, T_YKILLS + 2u * (gau(A_k, i) * NK + gyu(Y_k, q)), kk, TSCALE);
}
@compute @workgroup_size(256) fn k_eatYoyApply(@builtin(global_invocation_id) g: vec3u) {
  let q = g.x; if (q >= U.ny || !yAlive(q)) { return; }
  var t = 0.0;
  if (FRY_DENSITY > 0.5) { let b = gyi(Y_yb, q); if (b < 0) { return; } let got = rdAcc(AC_BGOT + 2u * u32(b), BSC); if (!(got > 0.0)) { return; } t = min(gy(Y_n, q), gy(Y_ya, q) / rdAcc(AC_BAV + 2u * u32(b), BSC) * got); }   // (stage Y1: its share of its bin's take)
  else { t = rdAcc(AC_YT + 2u * q, KW); }
  if (!(t > 0.0)) { return; }
  let n = gy(Y_n, q) - t; sy(Y_n, q, n); sy(Y_eaten, q, gy(Y_eaten, q) + t);
  add64(&TL, T_FRY + 2u * (gyu(Y_k, q) * NFRY + FRY_EATEN), t, TSCALE);
  if (n < 1.0) { yDie(q); }
}
// ---- the young's density per lake m² by species (their juvenile mortality's compensation: fish3 _juvDens) ----
@compute @workgroup_size(256) fn y_juv(@builtin(global_invocation_id) g: vec3u) {
  let q = g.x; if (q >= U.ny || !yAlive(q)) { return; }
  let L = gy(Y_L, q); add64(&GS, GS_JUVD + 2u * gyu(Y_k, q), gy(Y_n, q) * (1.0 - exp(-(L / FRY_LARVA_L) * (L / FRY_LARVA_L))) / LAKE_M2, CSCALE);
}
@compute @workgroup_size(64) fn y_juvFin(@builtin(local_invocation_id) l: vec3u) {
  let t = l.x; if (t < NK) { GL[G_JUVD + t] = (f32(atomicLoad(&GS[GS_JUVD + 2u * t])) + f32(atomicLoad(&GS[GS_JUVD + 2u * t + 1u])) * 4294967296.0) / CSCALE; }
}
// ---- A SCHOOL OF YOUNG's BLOCK (fish3 _yoyLive): toward its target (a guarded brood by its nest) or, about its spot, somewhere in its
// wander over the block; every YOY_TICK it feeds, breathes, dies by its causes and picks its next spot
fn yOkAt(q: u32, x: f32, y: f32, inB: bool) -> bool {
  let b = bodyAt(x, y); let bed = depthAt(x, y); let k = gyu(Y_k, q);
  return b != LAND && bed > 0.12 && colAt(x, y) >= 0 && abs(bed - gy(Y_spotBed, q)) < F3_YOY_DBED && (spv(k, S_brookRes) < 0.5 || b == BROOK) && (spv(k, S_brookYoy) > 0.5 || inB || b != BROOK);
}
@compute @workgroup_size(64) fn y_move(@builtin(global_invocation_id) g: vec3u) {
  let q = g.x; if (q >= U.ny) { return; }
  sy(Y_feeds, q, 0.0); sy(Y_recruit, q, 0.0);
  if (!yAlive(q)) { return; }
  let k = gyu(Y_k, q); let dt = U.dt;
  syu(Y_age, q, gyu(Y_age, q) + U.dtU); let tk = gy(Y_tk, q) + dt; sy(Y_tk, q, tk);
  // held by its guardian on the nest
  let gr = gyi(Y_gref, q); var held = false;
  if (gr >= 0) { let gi = u32(gr); held = (gau(A_flags, gi) & FL_ALIVE) != 0u && gau(A_id, gi) == gyu(Y_guard, q) && ga(A_nt, gi) > 0.0; }
  if (!held) { syi(Y_gref, q, -1); syu(Y_guard, q, 0u); }
  let x = gy(Y_x, q); let y = gy(Y_y, q); let L = gy(Y_L, q);
  var tx = gy(Y_tx, q); var ty = gy(Y_ty, q);
  if (held) { tx = clamp(tx, gy(Y_nx, q) - F3_GUARD_R, gy(Y_nx, q) + F3_GUARD_R); ty = clamp(ty, gy(Y_ny, q) - F3_GUARD_R, gy(Y_ny, q) + F3_GUARD_R); }
  else if (length(vec2f(x - tx, y - ty)) < F3_YOY_ROAM) {   // (fish3 _yoyCruise at a block's scale)
    let inB = bodyAt(x, y) == BROOK;
    if (abs(gy(Y_bed, q) - gy(Y_spotBed, q)) >= F3_YOY_DBED) { }
    else if (spv(k, S_brookRes) > 0.5 && !inB) { let p = bp(u32(nearestBP(x, y))); tx = p.x; ty = p.y; }
    else {
      var found = false; let t0x = tx; let t0y = ty;
      for (var t = 0u; t < 4u; t++) {
        let r = F3_YOY_ROAM * sqrt(yrnd(q, 60u, 2u * t)); let a = yrnd(q, 60u, 2u * t + 1u) * 6.283185307179586;
        let cx = t0x + r * cos(a); let cy = t0y + r * sin(a); if (yOkAt(q, cx, cy, inB)) { tx = cx; ty = cy; found = true; break; }
      }
      if (!found) { tx = x; ty = y; }
    }
  }
  let v = min(F3_YOY_VMAX, F3_YOY_BL * L / 100.0) * dt; let dx = tx - x; let dy = ty - y; let dh = length(vec2f(dx, dy));
  var bed = gy(Y_bed, q);
  if (dh > 1e-4) {
    let kk = min(1.0, v / dh); let nx = x + dx * kk; let ny = y + dy * kk; let b2 = depthAt(nx, ny);
    if (bodyAt(nx, ny) != LAND && b2 > 0.12 && colAt(nx, ny) >= 0) { sy(Y_x, q, nx); sy(Y_y, q, ny); sy(Y_bed, q, b2); bed = b2; } else { sy(Y_tx, q, x); sy(Y_ty, q, y); }
  }
  let zT = clamp(gy(Y_tz, q), 0.05, max(0.06, bed - 0.02)); let z = gy(Y_z, q); let dz = zT - z;
  sy(Y_z, q, clamp(z + sign(dz) * min(abs(dz), v), 0.05, max(0.06, bed - 0.02)));
  if (tk < F3_YOY_TICK) { return; }
  sy(Y_st, q, tk); sy(Y_tk, q, 0.0);
  let c = colAt(gy(Y_x, q), gy(Y_y, q)); if (c < 0) { yDie(q); return; }
  let cu = u32(c); let j = layerCell(cu, gy(Y_z, q)); syi(Y_c, q, c); syi(Y_j, q, i32(j)); syi(Y_jb, q, bedCell(c, bed));
  sy(Y_yT, q, wd(W_temp + j)); sy(Y_yo2, q, wd(W_o2 + j));
  let rif = select(0.0, F3_RIFFLE_REFUGE, L < F3_RIFFLE_L && bed < F3_RIFFLE_D && bodyAt(gy(Y_x, q), gy(Y_y, q)) == BROOK);
  sy(Y_cover, q, max(max(F3_SHALLOW_REFUGE * clamp((0.8 - bed) / 0.6, 0.0, 1.0), inWeeds(bedCell(c, bed), cu, bed - gy(Y_z, q), false)), rif));
  sy(Y_feeds, q, 1.0);
}
// ---- its feeding this tick (fish3 _feedYoy): what it asks of each food (each from what the ones before would leave if granted) ----
fn fryD(L: f32) -> f32 { return PLANKTON_FRY_DAPH_MIN + (1.0 - PLANKTON_FRY_DAPH_MIN) * clamp((L - PLANKTON_FRY_DAPH_L_0) / (PLANKTON_FRY_DAPH_L_1 - PLANKTON_FRY_DAPH_L_0), 0.0, 1.0); }
fn fryR(L: f32) -> f32 { return PLANKTON_FRY_ROT_MIN + (1.0 - PLANKTON_FRY_ROT_MIN) * clamp((PLANKTON_FRY_ROT_L_1 - L) / (PLANKTON_FRY_ROT_L_1 - PLANKTON_FRY_ROT_L_0), 0.0, 1.0); }
fn yBioSet(k: u32) -> u32 { if (spv(k, S_juvMode) > 0.0) { return 2u * k + 1u; } return 2u * k; }
fn weedEyoy(jb: i32, L: f32) -> vec2f {   // littoral3 weedEyoy: (the small fauna, the large reachable — past LARGE_L)
  if (jb < 0 || U.lit == 0u || L < LIT3_WEED_L) { return vec2f(0.0); }
  let li = sti(O_litIdx + u32(jb)); if (li < 0) { return vec2f(0.0); }
  let l = u32(li); var eL = 0.0; if (L >= LIT3_LARGE_L) { eL = max(0.0, wd(W_litL + l) - LIT3_REF) * reach(l); }
  return vec2f(wd(W_litS + l), eL);
}
@compute @workgroup_size(64) fn y_feedReq(@builtin(global_invocation_id) g: vec3u) {
  let q = g.x; if (q >= U.ny) { return; }
  syi(Y_qPrey, q, -1); sy(Y_qPk, q, 0.0); sy(Y_qD, q, 0.0); sy(Y_qC, q, 0.0); sy(Y_qR, q, 0.0); sy(Y_qWs, q, 0.0); sy(Y_qWl, q, 0.0); sy(Y_qB, q, 0.0); sy(Y_qSed, q, 0.0);
  if (!yAlive(q) || gy(Y_feeds, q) < 0.5) { return; }
  let k = gyu(Y_k, q); let L = gy(Y_L, q); let W = gy(Y_W, q); let n = gy(Y_n, q); let T = gy(Y_yT, q); let st = gy(Y_st, q);
  let bs = yBioSet(k); let dd = st / DAY;
  let want = n * coldCmax(k, bs, W, T) * W * dd * (1.0 + (FRY_CMAX_LARVA - 1.0) * clamp((FRY_LARVA_CM_1 - L) / (FRY_LARVA_CM_1 - FRY_LARVA_CM_0), 0.0, 1.0));
  sy(Y_want, q, want); var got = 0.0;
  let c = u32(gyi(Y_c, q)); let j = u32(gyi(Y_j, q)); let jb = gyi(Y_jb, q); let bed = gy(Y_bed, q); let z = gy(Y_z, q);
  // young piscivores on other young they can swallow (the snapshot's places, fish3's list order)
  if (FRY_DENSITY > 0.5 && spv(k, S_dFish) > 0.5 && L >= spv(k, S_yLpisc)) {   // (stage Y1: a request over its column's bins)
    let r = yReqK(c, n, L, L * spv(k, S_gapeR), want / max(1.0, n * st), st, want / max(1.0, n), true, false, coldPerf(T, spv(k, S_tempOpt), spv(k, S_coldPerf)), spv(k, S_preyLR));
    if (r.x > 0.0) {
      let a0 = FRY_CLEAR_A * pow(L * 10.0, FRY_CLEAR_B) / DAY * coldPerf(T, spv(k, S_tempOpt), spv(k, S_coldPerf)) / colVol(c); let NB = NK * u32(FRY_NS); let b0 = c * NB;
      for (var j = 0u; j < NB; j++) { let b = b0 + j; let w = yBinW(b, L, L * spv(k, S_gapeR), true, false, spv(k, S_preyLR)); if (w > 0.0) { acc64(AC_BREQY + 2u * b, r.x * a0 * w / r.y, BSC); } }
      syi(Y_qPrey, q, -2); sy(Y_qPk, q, r.x);
    }
  } else if (spv(k, S_dFish) > 0.5 && L >= spv(k, S_yLpisc)) {
    let near = nearYoy(gy(Y_x, q), gy(Y_y, q), z, F3_YOY_EAT_R, 0u, 1u, q);
    if (near.x >= 0.0) {
      let r = u32(near.x); let rn = gy(Y_n, r); let rW = gy(Y_W, r);
      let kk = min(min(rn, (want - got) / rW), n * FRY_ATTACK * TS * spv(k, S_capture) * spv(gyu(Y_k, r), S_vuln) * rn / (rn + FRY_N_HALF) * (1.0 - gy(Y_cover, r)) * st);
      if (kk > 0.0) { syi(Y_qPrey, q, i32(r)); sy(Y_qPk, q, kk); acc64(AC_YP + 2u * r, kk, KW); got += kk * rW; }
    }
  }
  // zooplankton of its size (type II in K_FRY), each cell seen by its own light; its footprint its layer ± one and the ring at its layer
  if ((spv(k, S_dPlankton) > 0.5 || L < spv(k, S_Lzoo)) && want - got > 1e-12) {
    let gD = fryD(L); let cR = fryR(L); let j0 = cell0(c); let k0 = j - j0;
    var sD = 0.0; var sC = 0.0; var sR = 0.0; var sw = 0.0;
    let ka = u32(max(0, i32(k0) - 1)); let kb = min(nL(c) - 1u, k0 + 1u);
    for (var kk = ka; kk <= kb; kk++) { let jj = j0 + kk; let w = stf(O_wW + jj); sw += w; let v = wd(W_zv + jj); if (v > 0.0) { let pr = (1.0 - wd(W_plantRef + jj)) * w * v; sD += wd(W_zooD + jj) * gD * pr; sC += wd(W_zooC + jj) * PLANKTON_FRY_COPE * pr; sR += wd(W_zooR + jj) * cR * pr; } }
    let s0 = u32(sti(O_fNbr0 + c)); let s1 = min(u32(sti(O_fNbr0 + c + 1u)), s0 + 61u);
    for (var t = s0; t < s1; t++) { let cc = u32(sti(O_fNbrL + t)); let jj = cell0(cc) + min(nL(cc) - 1u, k0); let w = stf(O_wW + jj); sw += w; let v = wd(W_zv + jj);
      if (v > 0.0) { let pr = (1.0 - wd(W_plantRef + jj)) * w * v; sD += wd(W_zooD + jj) * gD * pr; sC += wd(W_zooC + jj) * PLANKTON_FRY_COPE * pr; sR += wd(W_zooR + jj) * cR * pr; } }
    let S = sD + sC + sR;
    if (S > 1e-12) {
      let E = S / sw * PLANKTON_UGL; let ask = (want - got) * E / (E + PLANKTON_K_FRY); let take = min(ask, PLANKTON_CROP * S); sy(Y_wZ, q, select(PLANKTON_K_FRY / (E + PLANKTON_K_FRY), 1.0, ask >= PLANKTON_CROP * S));
      let tD = take * sD / S; let tC = take * sC / S; let tR = take - tD - tC;
      if (sD > 0.0) { sy(Y_qD, q, tD / sD * gD); } if (sC > 0.0) { sy(Y_qC, q, tC / sC * PLANKTON_FRY_COPE); } if (sR > 0.0) { sy(Y_qR, q, tR / sR * cR); }
      got += take;
    }
  }
  // the weeds' small fauna from WEED_L, their large from LARGE_L, for a school in the canopy or near the bed
  let dl = spv(k, S_dLarva) > 0.5; let di = spv(k, S_dInsect) > 0.5;
  if (U.lit != 0u && (dl || di) && L >= LIT3_WEED_L && want - got > 1e-12 && bed - z <= F3_BENTH_REACH + wd(W_canopy + c)) {
    let e = weedEyoy(jb, L); let E = e.x + e.y;
    if (E > 0.0) { let a = stf(O_wBedA + u32(jb)); let ask = (want - got) * E / (E + BENTHOS_K_FISH); let gw = min(ask, PLANKTON_CROP * E * a); let f = gw / (E * a); let w = select(BENTHOS_K_FISH / (E + BENTHOS_K_FISH), 1.0, ask >= PLANKTON_CROP * E * a);
      sy(Y_qWs, q, f); if (e.y > 0.0) { sy(Y_qWl, q, f); } acc64(AC_YWS + 2u * u32(jb), f, PW); acc64(AC_YWSW + 2u * u32(jb), f * w, PW); if (e.y > 0.0) { acc64(AC_YWL + 2u * u32(jb), f, PW); acc64(AC_YWLW + 2u * u32(jb), f * w, PW); } got += gw; }
  }
  // the bed about it: its own bed cell and its neighbours' mean-depth bed cells
  let benthL = spv(k, S_benthL); let dD = spv(k, S_dDetritus) > 0.5;
  if (L >= benthL && (dl || spv(k, S_dSnail) > 0.5 || dD) && want - got > 1e-12 && bed - z <= F3_BENTH_REACH) {
    var s = 0.0; var A = 0.0;
    if (jb >= 0) { let a = stf(O_wBedA + u32(jb)); A += a; s += benthE(u32(jb)) * a; }
    let s0 = u32(sti(O_fNbr0 + c)); let s1 = min(u32(sti(O_fNbr0 + c + 1u)), s0 + 63u);
    for (var t = s0; t < s1; t++) { let jj = sti(O_fColBedJ + u32(sti(O_fNbrL + t))); if (jj >= 0) { let a = stf(O_wBedA + u32(jj)); A += a; s += benthE(u32(jj)) * a; } }
    if (s > 0.0) {
      let E = s / A; let ask = (want - got) * E / (E + BENTHOS_K_FISH); let gb = min(ask, PLANKTON_CROP * s); let f = gb / s; sy(Y_qB, q, f); let w = select(BENTHOS_K_FISH / (E + BENTHOS_K_FISH), 1.0, ask >= PLANKTON_CROP * s);
      if (jb >= 0) { acc64(AC_YB + 2u * u32(jb), f, PW); acc64(AC_YBW + 2u * u32(jb), f * w, PW); }
      for (var t = s0; t < s1; t++) { let jj = sti(O_fColBedJ + u32(sti(O_fNbrL + t))); if (jj >= 0) { acc64(AC_YB + 2u * u32(jj), f, PW); acc64(AC_YBW + 2u * u32(jj), f * w, PW); } }
      got += gb;
    }
  }
  // the organic layer for the sifters
  if (L >= benthL && dD && want - got > 1e-12 && bed - z <= F3_BENTH_REACH && jb >= 0) {
    let wS = min(want - got, FEED_POOR_GUT * n * spv(k, S_gut) * W); sy(Y_qSed, q, wS); acc64(AC_YSED + 2u * u32(jb), wS, GW);
  }
}
@compute @workgroup_size(256) fn y_fieldCell(@builtin(global_invocation_id) g: vec3u) {
  let j = g.x; if (j >= WNCELL) { return; }
  let pr = 1.0 - wd(W_plantRef + j); let v = wd(W_zv + j);
  RC[R_YD + j] = bShare(rdAcc(AC_YZD + 2u * j, PW), rdAcc(AC_YZDW + 2u * j, PW)); RC[R_YC + j] = bShare(rdAcc(AC_YZC + 2u * j, PW), rdAcc(AC_YZCW + 2u * j, PW)); RC[R_YR + j] = bShare(rdAcc(AC_YZR + 2u * j, PW), rdAcc(AC_YZRW + 2u * j, PW));
  RC[R_YWS + j] = bShare(rdAcc(AC_YWS + 2u * j, PW), rdAcc(AC_YWSW + 2u * j, PW)); RC[R_YWL + j] = bShare(rdAcc(AC_YWL + 2u * j, PW), rdAcc(AC_YWLW + 2u * j, PW)); RC[R_YB + j] = bShare(rdAcc(AC_YB + 2u * j, PW), rdAcc(AC_YBW + 2u * j, PW));
  let D = rdAcc(AC_YSED + 2u * j, GW); var r = 1.0; if (D > 0.0) { let V = wd(W_sedOM + j) * stf(O_wA + j); r = select(0.0, min(D, V) / D, V > 0.0); }
  RC[R_YSED + j] = r;
}
// (the zooplankton's wants go in after the request: the request needs the cells' sums first)
@compute @workgroup_size(64) fn y_zooAcc(@builtin(global_invocation_id) g: vec3u) {
  let q = g.x; if (q >= U.ny || !yAlive(q) || gy(Y_feeds, q) < 0.5) { return; }
  let qD = gy(Y_qD, q); let qC = gy(Y_qC, q); let qR = gy(Y_qR, q); if (qD <= 0.0 && qC <= 0.0 && qR <= 0.0) { return; }
  let c = u32(gyi(Y_c, q)); let j = u32(gyi(Y_j, q)); let j0 = cell0(c); let k0 = j - j0;
  let ka = u32(max(0, i32(k0) - 1)); let kb = min(nL(c) - 1u, k0 + 1u);
  let wz = gy(Y_wZ, q);
  for (var kk = ka; kk <= kb; kk++) { let jj = j0 + kk; acc64(AC_YZD + 2u * jj, qD, PW); acc64(AC_YZC + 2u * jj, qC, PW); acc64(AC_YZR + 2u * jj, qR, PW); acc64(AC_YZDW + 2u * jj, qD * wz, PW); acc64(AC_YZCW + 2u * jj, qC * wz, PW); acc64(AC_YZRW + 2u * jj, qR * wz, PW); }
  let s0 = u32(sti(O_fNbr0 + c)); let s1 = min(u32(sti(O_fNbr0 + c + 1u)), s0 + 61u);
  for (var t = s0; t < s1; t++) { let cc = u32(sti(O_fNbrL + t)); let jj = cell0(cc) + min(nL(cc) - 1u, k0); acc64(AC_YZD + 2u * jj, qD, PW); acc64(AC_YZC + 2u * jj, qC, PW); acc64(AC_YZR + 2u * jj, qR, PW); acc64(AC_YZDW + 2u * jj, qD * wz, PW); acc64(AC_YZCW + 2u * jj, qC * wz, PW); acc64(AC_YZRW + 2u * jj, qR * wz, PW); }
}
// what it got, and one fish's energy budget on its share — SCRAMBLE: when it can't keep every fish at maintenance, the rest starve
@compute @workgroup_size(64) fn y_feedTake(@builtin(global_invocation_id) g: vec3u) {
  let q = g.x; if (q >= U.ny || !yAlive(q) || gy(Y_feeds, q) < 0.5) { return; }
  let k = gyu(Y_k, q); let L = gy(Y_L, q); let W = gy(Y_W, q); let n = gy(Y_n, q); let T = gy(Y_yT, q); let st = gy(Y_st, q); let dd = st / DAY;
  let c = u32(gyi(Y_c, q)); let j = u32(gyi(Y_j, q)); let jb = gyi(Y_jb, q); let want = gy(Y_want, q);
  var got = 0.0; var J = 0.0;
  let pr = gyi(Y_qPrey, q);
  if (pr == -2) {   // (stage Y1) its share of each bin's young the followed fish left: min(1, left / the schools' requests)
    let K = gy(Y_qPk, q); let cp = coldPerf(T, spv(k, S_tempOpt), spv(k, S_coldPerf)); let gape = L * spv(k, S_gapeR); let pLR = spv(k, S_preyLR);
    let a0 = FRY_CLEAR_A * pow(L * 10.0, FRY_CLEAR_B) / DAY * cp / colVol(c); let NB = NK * u32(FRY_NS); let b0 = c * NB;
    var sA = 0.0; for (var m = 0u; m < NB; m++) { sA += a0 * yBinW(b0 + m, L, gape, true, false, pLR); }
    if (sA > 0.0) { for (var m = 0u; m < NB; m++) { let b = b0 + m; let w = a0 * yBinW(b, L, gape, true, false, pLR); if (!(w > 0.0)) { continue; }
      let av = rdAcc(AC_BAV + 2u * b, BSC); let left = av - rdAcc(AC_BGOT + 2u * b, BSC); if (!(left > 0.0)) { continue; }
      let kk = K * w / sA * min(1.0, left / max(rdAcc(AC_BREQY + 2u * b, BSC), 1e-12)); let Wq = rdAcc(AC_BSW + 2u * b, BSC) / av; let kq = (b / u32(FRY_NS)) % NK;
      got += kk * Wq; J += kk * Wq * energyDensity(2u * kq, Wq); acc64(AC_BGOTY + 2u * b, kk, BSC);
      add64(&TL, T_YYKILLS + 2u * (k * NK + kq), kk, TSCALE); add64(&TL, T_YFOODK + 2u * (k * 5u), kk * Wq, TSCALE); } }
  }
  if (pr >= 0) { let r = u32(pr); let D = rdAcc(AC_YP + 2u * r, KW); let kk = gy(Y_qPk, q) * min(1.0, gy(Y_n, r) / max(D, 1e-12)); let rW = gy(Y_W, r);
    got += kk * rW; J += kk * rW * energyDensity(2u * gyu(Y_k, r), rW); acc64(AC_YPT + 2u * r, kk, KW); add64(&TL, T_YYKILLS + 2u * (gyu(Y_k, q) * NK + gyu(Y_k, r)), kk, TSCALE); add64(&TL, T_YFOODK + 2u * (gyu(Y_k, q) * 5u), kk * rW, TSCALE); }
  let qD = gy(Y_qD, q); let qC = gy(Y_qC, q); let qR = gy(Y_qR, q);
  if (qD > 0.0 || qC > 0.0 || qR > 0.0) {
    let j0 = cell0(c); let k0 = j - j0; var gd = 0.0; var gc = 0.0; var gr = 0.0;
    let ka = u32(max(0, i32(k0) - 1)); let kb = min(nL(c) - 1u, k0 + 1u);
    for (var kk = ka; kk <= kb; kk++) { let jj = j0 + kk; let pw = (1.0 - wd(W_plantRef + jj)) * stf(O_wW + jj) * wd(W_zv + jj);
      gd += qD * wd(W_zooD + jj) * pw * RC[R_YD + jj]; gc += qC * wd(W_zooC + jj) * pw * RC[R_YC + jj]; gr += qR * wd(W_zooR + jj) * pw * RC[R_YR + jj]; }
    let s0 = u32(sti(O_fNbr0 + c)); let s1 = min(u32(sti(O_fNbr0 + c + 1u)), s0 + 61u);
    for (var t = s0; t < s1; t++) { let cc = u32(sti(O_fNbrL + t)); let jj = cell0(cc) + min(nL(cc) - 1u, k0); let pw = (1.0 - wd(W_plantRef + jj)) * stf(O_wW + jj) * wd(W_zv + jj);
      gd += qD * wd(W_zooD + jj) * pw * RC[R_YD + jj]; gc += qC * wd(W_zooC + jj) * pw * RC[R_YC + jj]; gr += qR * wd(W_zooR + jj) * pw * RC[R_YR + jj]; }
    got += gd + gc + gr; J += gd * PREY_DAPH_ED + gc * PREY_COPE_ED + gr * PREY_ROT_ED; add64(&TL, T_FOOD + 2u * FOOD_YZOO, gd + gc + gr, TSCALE); add64(&TL, T_YFOODK + 2u * (gyu(Y_k, q) * 5u + 1u), gd + gc + gr, TSCALE);
  }
  let qWs = gy(Y_qWs, q);
  if (qWs > 0.0 && jb >= 0) { let e = weedEyoy(jb, L); let a = stf(O_wBedA + u32(jb)); let gw = qWs * a * (e.x * RC[R_YWS + u32(jb)] + e.y * RC[R_YWL + u32(jb)]); got += gw; J += gw * LIT3_ED_INS; add64(&TL, T_FOOD + 2u * FOOD_YWEED, gw, TSCALE); add64(&TL, T_YFOODK + 2u * (gyu(Y_k, q) * 5u + 2u), gw, TSCALE); }
  let qB = gy(Y_qB, q);
  if (qB > 0.0) {
    var gb = 0.0;
    if (jb >= 0) { gb += qB * benthE(u32(jb)) * stf(O_wBedA + u32(jb)) * RC[R_YB + u32(jb)]; }
    let s0 = u32(sti(O_fNbr0 + c)); let s1 = min(u32(sti(O_fNbr0 + c + 1u)), s0 + 63u);
    for (var t = s0; t < s1; t++) { let jj = sti(O_fColBedJ + u32(sti(O_fNbrL + t))); if (jj >= 0) { gb += qB * benthE(u32(jj)) * stf(O_wBedA + u32(jj)) * RC[R_YB + u32(jj)]; } }
    got += gb; J += gb * PREY_BENTH_ED; add64(&TL, T_FOOD + 2u * FOOD_YBENTH, gb, TSCALE); add64(&TL, T_YFOODK + 2u * (gyu(Y_k, q) * 5u + 3u), gb, TSCALE);
  }
  let qS = gy(Y_qSed, q);
  if (qS > 0.0 && jb >= 0) { let gs = qS * RC[R_YSED + u32(jb)]; got += gs; J += gs * PREY_DETRITUS_ED * PREY_DETRITUS_DIG; add64(&TL, T_FOOD + 2u * FOOD_YSED, gs, TSCALE); add64(&TL, T_YFOODK + 2u * (gyu(Y_k, q) * 5u + 4u), gs, TSCALE); }
  // the energy budget
  let bs = yBioSet(k); var p = 0.0; if (want > 0.0) { p = min(1.0, got / want); }
  let wf = wasteFr(bs, T, p); let Wr = max(W, FRY_R_WMIN); let r = coldResp(k, bs, Wr, T) * W; let Rj = r * OXYCAL * dd;
  let eff = (1.0 - wf.x) * (1.0 - wf.y - bio(bs, BSDA)); var edF = PREY_DAPH_ED; if (got > 0.0) { edF = J / got; }
  let need = Rj / max(1e-9, eff * edF); let ed = energyDensity(bs, W);
  sy(Y_rO2, q, n * r / DAY); sy(Y_p, q, gy(Y_p, q) + (p - gy(Y_p, q)) * min(1.0, dd));
  var hS = 0.0;
  if (got >= n * need) {
    let C = J / n; let Fz = wf.x * C; let Ux = wf.y * (C - Fz); let Sd = bio(bs, BSDA) * (C - Fz);
    let W2 = max(1e-7, W + (C - Fz - Ux - Sd - Rj) / ed); sy(Y_W, q, W2);
    if (W2 > stdWeight(k, L)) { let L2 = lengthFor(k, W2); sy(Y_L, q, L2); sy(Y_bdep, q, L2 * spv(k, S_depthR)); }
  } else {
    let tStarve = 0.4 * ed / max(1e-9, r * OXYCAL / W); hS = (1.0 - got / max(1e-12, n * need)) / (tStarve * DAY);
  }
  sy(Y_hS, q, hS); sy(Y_got, q, got);
}
@compute @workgroup_size(256) fn y_fieldApply(@builtin(global_invocation_id) g: vec3u) {
  let j = g.x; if (j >= WNCELL) { return; }
  let pr = 1.0 - wd(W_plantRef + j); let v = wd(W_zv + j);
  { let T = rdAcc(AC_YZD + 2u * j, PW); if (T > 0.0) { WD[W_zooD + j] *= 1.0 - bTaken(T, rdAcc(AC_YZDW + 2u * j, PW)) * pr * v; } }
  { let T = rdAcc(AC_YZC + 2u * j, PW); if (T > 0.0) { WD[W_zooC + j] *= 1.0 - bTaken(T, rdAcc(AC_YZCW + 2u * j, PW)) * pr * v; } }
  { let T = rdAcc(AC_YZR + 2u * j, PW); if (T > 0.0) { WD[W_zooR + j] *= 1.0 - bTaken(T, rdAcc(AC_YZRW + 2u * j, PW)) * pr * v; } }
  { let T = rdAcc(AC_YB + 2u * j, PW); if (T > 0.0) { WD[W_benth + j] -= bTaken(T, rdAcc(AC_YBW + 2u * j, PW)) * benthE(j) * A2; } }
  { let D = rdAcc(AC_YSED + 2u * j, GW); if (D > 0.0) { let V = wd(W_sedOM + j) * stf(O_wA + j); if (V > 0.0) { WD[W_sedOM + j] -= min(D, V) / stf(O_wA + j); } } }
  let li = sti(O_litIdx + j); if (li < 0) { return; }
  let l = u32(li);
  { let T = rdAcc(AC_YWS + 2u * j, PW); if (T > 0.0) { WD[W_litS + l] *= 1.0 - bTaken(T, rdAcc(AC_YWSW + 2u * j, PW)); } }
  { let T = rdAcc(AC_YWL + 2u * j, PW); if (T > 0.0) { WD[W_litL + l] -= bTaken(T, rdAcc(AC_YWLW + 2u * j, PW)) * max(0.0, wd(W_litL + l) - LIT3_REF) * reach(l); } }
}
// young eaten by young piscivores: each school's share of the asking
@compute @workgroup_size(256) fn y_preyApply(@builtin(global_invocation_id) g: vec3u) {
  let q = g.x; if (q >= U.ny || !yAlive(q)) { return; }
  var t = 0.0;
  if (FRY_DENSITY > 0.5) { let b = gyi(Y_yb, q); if (b < 0) { return; } let got = rdAcc(AC_BGOTY + 2u * u32(b), BSC); if (!(got > 0.0)) { return; } t = min(gy(Y_n, q), gy(Y_ya, q) / rdAcc(AC_BAV + 2u * u32(b), BSC) * got); }   // (stage Y1: its share of its bin's take by the young schools)
  else { t = rdAcc(AC_YPT + 2u * q, KW); }
  if (!(t > 0.0)) { return; }
  let n = gy(Y_n, q) - t; sy(Y_n, q, n); add64(&TL, T_FRY + 2u * (gyu(Y_k, q) * NFRY + FRY_EATEN), t, TSCALE);
  if (n < 1.0) { yDie(q); }
}
// ---- the tick's breath and deaths (fish3 _yoyLive): the larval critical period (∝ 1/length, fading by ~3 cm), the juveniles'
// predation with its density compensation, both slower in the cold; the species' size-scaled M; starvation; heat; hypoxia ----
@compute @workgroup_size(64) fn y_mort(@builtin(global_invocation_id) g: vec3u) {
  let q = g.x; if (q >= U.ny || !yAlive(q) || gy(Y_feeds, q) < 0.5) { return; }
  let k = gyu(Y_k, q); let L = gy(Y_L, q); let W = gy(Y_W, q); let T = gy(Y_yT, q); let o2 = gy(Y_yo2, q); let st = gy(Y_st, q);
  let j = u32(gyi(Y_j, q)); let jb = gyi(Y_jb, q);
  acc64(AC_O2 + 2u * j, gy(Y_rO2, q) * st, GW);
  let o2L = lethalO2(spv(k, S_o2LethalS) / ENV_O2_MGL, spv(k, S_o2IceS) / ENV_O2_MGL, T); let lf = exp(-(L / FRY_LARVA_L) * (L / FRY_LARVA_L));
  let jd = GL[G_JUVD + k];
  let hN = (FRY_M_LARVA3 / max(0.3, L) * lf + FRY_M_JUV3 * (1.0 - lf) * (jd + FRY_JUV_D50) / (FRY_JUV_DREF + FRY_JUV_D50) * clamp(pow(L / FRY_M_JUV_L, -FRY_M_JUV_B), FRY_M_JUV_CLAMP_0, FRY_M_JUV_CLAMP_1)) * min(1.0, pow(FRY_M_JUV_Q10, (T - 20.0) / 10.0)) / DAY
    + spv(k, S_M) * BIOE_M_OTHER * min(30.0, pow(L / spv(k, S_Lref), -0.87)) / YEAR;
  let uilt = spv(k, S_uiltS); var hH = 0.0; if (T > uilt - 2.0) { hH = 0.6931471805599453 / (BIOE_UILT_DAYS * DAY) * exp((T - uilt) / BIOE_HEAT_STEEP); }
  var hO = 0.0; if (o2 < o2L) { hO = 0.6931471805599453 / (BIOE_HYPOXIA_DAYS * DAY) * exp(BIOE_HYPOXIA_STEEP * (o2L - o2) / o2L); }
  var hS = gy(Y_hS, q); { let hW = wHaz(k, L, f32(gyu(Y_age, q)), st); if (hW >= 0.0) { hS = hW; } }   // (the first winter)
  let h = hN + hS + hH + hO; let n = gy(Y_n, q); let lost = n * expm(h * st);
  if (h > 0.0) { let b = T_FRY + 2u * k * NFRY; add64(&TL, b + 2u * FRY_NATURAL, lost * hN / h, TSCALE); add64(&TL, b + 2u * FRY_STARVE, lost * hS / h, TSCALE); add64(&TL, b + 2u * FRY_HEAT, lost * hH / h, TSCALE); add64(&TL, b + 2u * FRY_HYPOXIA, lost * hO / h, TSCALE); }
  if (jb >= 0 && lost * W > 0.0) { acc64(AC_SEDADD + 2u * u32(jb), lost * W, GW); }
  var left = n - lost;
  if (left < 1.0) { if (yrnd(q, 61u, 0u) < left) { left = 1.0; } else { sy(Y_n, q, left); yDie(q); return; } }
  sy(Y_n, q, left);
}
// ---- its next spot (fish3 _yoyTarget): up out of low O₂, down out of heat; else the food of its stage about it — on the water as the
// young's feeding left it ----
fn zooEl(j: u32, cD: f32, cC: f32, cR: f32) -> f32 { let v = wd(W_zv + j); if (v <= 0.0) { return 0.0; } return (wd(W_zooD + j) * cD + wd(W_zooC + j) * cC + wd(W_zooR + j) * cR) * v * PLANKTON_UGL; }
fn yCov(k: u32, cc: u32) -> f32 {   // fish3 _yoyTarget cov: a spot's food × (1 − yCover + yCover · its cover)
  let yc = spv(k, S_yCover); if (yc <= 0.0) { return 1.0; }
  let jb = sti(O_fColBedJ + cc); var pc = 0.0; if (U.plants != 0u && jb >= 0) { let li = sti(O_litIdx + u32(jb)); if (li >= 0) { pc = wd(W_pCov + u32(li)); } }   // (the stands of the bed it would hold to)
  return 1.0 - yc + yc * max(F3_SHALLOW_REFUGE * clamp((0.8 - stf(O_wDepthMean + cc)) / 0.6, 0.0, 1.0), pc);
}
@compute @workgroup_size(64) fn y_target(@builtin(global_invocation_id) g: vec3u) {
  let q = g.x; if (q >= U.ny || !yAlive(q) || gy(Y_feeds, q) < 0.5) { return; }
  let k = gyu(Y_k, q); let L = gy(Y_L, q); let x = gy(Y_x, q); let y = gy(Y_y, q); let z = gy(Y_z, q); let bed = gy(Y_bed, q);
  let c = u32(gyi(Y_c, q)); let T = gy(Y_yT, q); let o2 = gy(Y_yo2, q);
  let free = GSCALE >= 1.0; let byoy = spv(k, S_brookYoy) > 0.5;
  var tx = gy(Y_tx, q); var ty = gy(Y_ty, q); var tz = gy(Y_tz, q); var done = false;
  if (!free && stu(O_wCBody + c) == BROOK && !byoy) {   // (the 1/10 world: the lakes' young drift down the brook into Lower)
    let kb = nearestBP(x, y); var p = bp(u32(min(kb + 1, i32(BLAST)))); if (kb >= i32(BLAST)) { p = vec2f(stf(O_bLakeNear + 4u), stf(O_bLakeNear + 5u)); }
    tx = p.x; ty = p.y; tz = max(0.05, z); done = true;
  }
  if (!done && o2 < spv(k, S_o2CritS)) { let bc = wdi(W_o2Best + c); if (bc >= 0) { tx = colX(u32(bc)); ty = colY(u32(bc)); } else { tx = x; ty = y; } tz = max(0.05, z - 1.0); done = true; }
  if (!done && T > spv(k, S_uiltS) - 3.0) { tx = x; ty = y; tz = bed - 0.05; done = true; }
  let s0 = u32(sti(O_fNbr0 + c)); let s1 = u32(sti(O_fNbr0 + c + 1u));
  if (!done && L >= spv(k, S_benthL) && (spv(k, S_dLarva) > 0.5 || spv(k, S_dSnail) > 0.5 || spv(k, S_dDetritus) > 0.5)) {
    var best = -3.0e38; var bc = -1; let o2c = spv(k, S_o2CritS);
    for (var m = 0u; m <= s1 - s0; m++) {   // (its own column first, then the ring: fish3's order — the first of equals wins)
      var cc = c; if (m > 0u) { cc = u32(sti(O_fNbrL + s0 + m - 1u)); }
      let jj = sti(O_fColBedJ + cc); if (jj < 0 || wd(W_o2 + u32(jj)) < o2c || !(byoy || free || stu(O_wCBody + cc) != BROOK)) { continue; }
      let w = weedEyoy(jj, L); let E = wd(W_benth + u32(jj)) / A2 - BENTHOS_REFUGE + w.x + w.y;
      if (!(E > BENTHOS_SENSE_MIN)) { continue; } let V = E * yCov(k, cc);
      if (V > best) { best = V; bc = i32(cc); }
    }
    if (bc >= 0) { if (u32(bc) != c) { tx = colX(u32(bc)); ty = colY(u32(bc)); } tz = max(0.05, select(stf(O_wDepthMean + u32(bc)), bed, u32(bc) == c) - 0.05); done = true; }
  }
  if (!done) {
    let gD = fryD(L); let cR = fryR(L); let pel = spv(k, S_pelagicFry) > 0.0 && L < spv(k, S_pelagicFry) && gyi(Y_gref, q) < 0;
    var best = -1.0; var bj = -1; let k0 = min(nL(c) - 1u, u32(max(0, i32(z / WDZ))));
    let cv0 = yCov(k, c);
    for (var kk = 0u; kk < nL(c); kk++) { let jj = cell0(c) + kk; if (pel && (stf(O_wDepthMax + c) < 2.0 || stf(O_wZMid + jj) > 1.5)) { continue; } let E = zooEl(jj, gD, PLANKTON_FRY_COPE, cR) * cv0; if (E > best) { best = E; bj = i32(jj); } }
    for (var t = s0; t < s1; t++) { let cc = u32(sti(O_fNbrL + t)); let jj = cell0(cc) + min(nL(cc) - 1u, k0);
      if ((pel && (stf(O_wDepthMax + cc) < 2.0 || stf(O_wZMid + jj) > 1.5)) || !(byoy || free || stu(O_wCBody + cc) != BROOK)) { continue; }
      let E = zooEl(jj, gD, PLANKTON_FRY_COPE, cR) * yCov(k, cc); if (E > best) { best = E; bj = i32(jj); } }
    if (bj >= 0) { let cc = u32(sti(O_wColOfCell + u32(bj))); if (cc != c) { tx = colX(cc) + (yrnd(q, 62u, 0u) - 0.5) * 30.0 * GSCALE; ty = colY(cc) + (yrnd(q, 62u, 1u) - 0.5) * 30.0 * GSCALE; } tz = stf(O_wZMid + u32(bj));  if (spv(k, S_yCover) > 0.0 && U.plants != 0u && wd(W_canopy + cc) > 0.1) { tz = max(0.05, max(tz, stf(O_wDepthMean + cc) - 0.5 * wd(W_canopy + cc))); } }   // (fish3: a cover keeper's young hold in the weeds)
    else { tx = x + (yrnd(q, 62u, 2u) - 0.5) * 60.0 * GSCALE; ty = y + (yrnd(q, 62u, 3u) - 0.5) * 60.0 * GSCALE; }
  }
  if (spv(k, S_brookRes) > 0.5 && bodyAt(tx, ty) != BROOK) { let p = bp(u32(nearestBP(tx, ty))); tx = p.x; ty = p.y; }
  sy(Y_tx, q, tx); sy(Y_ty, q, ty); sy(Y_tz, q, tz); sy(Y_spotBed, q, max(0.12, depthAt(tx, ty)));
  // RECRUITMENT: at the species' L0, or an overwintered school in spring
  if (L >= spv(k, S_L0) || (f32(gyu(Y_age, q)) > FRY_OVERWINTER * YEAR && U.yf >= FRY_SPRING_YF && U.yf < SPAWN_SEASON_END)) { sy(Y_recruit, q, 1.0); }
}
`;

// ============================================================ BIRTHS (fish3 _findMate, _spawn, _mkYoy, _recruit, add) =========
export const BIRTH_BINDINGS = /* wgsl */`
@group(1) @binding(0) var<storage, read> HS: array<u32>;
@group(1) @binding(1) var<storage, read> HI: array<u32>;
@group(1) @binding(2) var<storage, read_write> TL: array<atomic<u32>>;
@group(1) @binding(3) var<storage, read_write> GL: array<f32>;
@group(1) @binding(4) var<storage, read> SI: array<f32>;
@group(1) @binding(5) var<storage, read_write> GS: array<atomic<u32>>;
@group(1) @binding(6) var<storage, read_write> PX: array<vec4f>;
@group(1) @binding(7) var<storage, read_write> Y: array<f32>;
@group(1) @binding(8) var<storage, read_write> YG: array<f32>;
@group(1) @binding(9) var<storage, read_write> IND: array<u32>;   // indirect dispatch arguments (x, y, z) × 4, then the recruits' list
const G_CNT: u32 = 0u; const G_N: u32 = 34u; const G_NY: u32 = 35u; const G_NEXTID: u32 = 36u; const G_BORN: u32 = 37u; const G_RECRUITS: u32 = 38u; const G_NREC: u32 = 39u;
const G_NEEDA: u32 = 43u; const G_NEEDY: u32 = 44u;   // (agents / young schools wanted past the arrays' room this block: the host grows them, and they come the next)
const GS_CLAIMP0: u32 = 512u; const GS_BIRTHS: u32 = 67u; const REC_LIST: u32 = 16u;`;
export const BIRTH = /* wgsl */`
fn gy(f: u32, q: u32) -> f32 { return Y[f * U.ycap + q]; }
fn gyu(f: u32, q: u32) -> u32 { return bitcast<u32>(Y[f * U.ycap + q]); }
fn gyi(f: u32, q: u32) -> i32 { return bitcast<i32>(Y[f * U.ycap + q]); }
fn sy(f: u32, q: u32, v: f32) { Y[f * U.ycap + q] = v; }
fn syu(f: u32, q: u32, v: u32) { Y[f * U.ycap + q] = bitcast<f32>(v); }
fn syi(f: u32, q: u32, v: i32) { Y[f * U.ycap + q] = bitcast<f32>(v); }
fn glu(at: u32) -> u32 { return bitcast<u32>(GL[at]); }
// the genome's operators (core.js mutate, crossover, mutateGenes, crossoverGenes) on the counter stream of the newborn's id
fn gaussR(id: u32, purpose: u32, k: u32) -> f32 { let u = max(rnd(id, purpose, 2u * k), 1e-7); let v = rnd(id, purpose, 2u * k + 1u); return sqrt(-2.0 * log(u)) * cos(6.283185307179586 * v); }
fn mutW(id: u32, e: u32, w: f32) -> f32 {
  if (rnd(id, 70u, e) < 0.015) { return rndR(id, 71u, e, -1.2, 1.2); }
  if (rnd(id, 72u, e) < 0.10) { return clamp(w + gaussR(id, 73u, e) * 0.35, -4.0, 4.0); }
  return w;
}
fn mutGene(id: u32, e: u32, v: f32) -> f32 { var x = v; if (rnd(id, 74u, e) < 0.5) { x += gaussR(id, 75u, e) * 0.05; } return clamp(x, 0.7, 1.35); }
// positions in fish3's list order (the grid the block's start; a fish before this one where it moved to, after it where it began)
fn posLO(b: u32, i: u32) -> vec3f { if (b < i) { return vec3f(ga(A_x, b), ga(A_y, b), ga(A_z, b)); } return PX[b].xyz; }
fn runsB(fl: u32, i: u32) -> bool { return (fl & FL_BROOKRUN) != 0u && gai(A_runYr, i) != U.yr; }
// ---- the nearest ripe fish of its species and the other sex (a school: any ripe school) within R (fish3 _findMate) ----
fn findMate(i: u32, R: f32) -> i32 {
  let x = ga(A_x, i); let y = ga(A_y, i); let z = ga(A_z, i); let k = gau(A_k, i); let sx = gau(A_sex, i);
  let M = R + F3_HC; var best = -1; var bd = R * R;
  let gx0 = clamp(i32((x - M - GX0) / F3_HC), 0, i32(HHX) - 1); let gx1 = clamp(i32((x + M - GX0) / F3_HC), 0, i32(HHX) - 1);
  let gy0 = clamp(i32((y - M - GY0) / F3_HC), 0, i32(HHY) - 1); let gy1 = clamp(i32((y + M - GY0) / F3_HC), 0, i32(HHY) - 1);
  for (var gyy = gy0; gyy <= gy1; gyy++) {
    for (var gxx = gx0; gxx <= gx1; gxx++) {
      let c = u32(gyy) * HHX + u32(gxx);
      for (var t = HS[c]; t < HS[c + 1u]; t++) {
        let j = HI[t]; if (j == i) { continue; }
        let p = posLO(j, i); let d = p - vec3f(x, y, z); let d2 = dot(d, d); if (!(d2 < bd)) { continue; }
        let fj = gau(A_flags, j); if ((fj & FL_ALIVE) == 0u || (fj & FL_RIPE) == 0u || gau(A_k, j) != k) { continue; }
        let sj = gau(A_sex, j); if (sx != 2u && sj != 2u && sj == sx) { continue; }
        bd = d2; best = i32(j);
      }
    }
  }
  return best;
}
@compute @workgroup_size(64) fn b_mate(@builtin(global_invocation_id) g: vec3u) {
  let i = g.x; if (i >= U.n) { return; }
  sai(A_birth, i, -1);
  let fl = gau(A_flags, i); if ((fl & FL_ALIVE) == 0u || (fl & FL_RIPE) == 0u) { return; }
  let k = gau(A_k, i); let sx = gau(A_sex, i); let x = ga(A_x, i); let y = ga(A_y, i); let z = ga(A_z, i);
  var Rm = spv(k, S_mateCue); if (sx == 2u) { Rm = 3.0; } else if (runsB(fl, i) && bodyAt(x, y) == BROOK) { Rm = 80.0 * GBROOK_SCALE; }
  let m = gai(A_mate, i); var ok = false;
  if (m >= 0) { let mu = u32(m); let fm = gau(A_flags, mu);
    if (mu != i && gau(A_id, mu) == gau(A_mateId, i) && (fm & FL_ALIVE) != 0u && (fm & FL_RIPE) != 0u) { let d = posLO(mu, i) - vec3f(x, y, z); ok = dot(d, d) < Rm * Rm; } }
  if (ok) { return; }
  var nm = -1;
  if (sx == 2u) { nm = findMate(i, 3.0); if (nm < 0) { nm = i32(i); } } else { nm = findMate(i, Rm); }
  sai(A_mate, i, nm); if (nm >= 0) { sau(A_mateId, i, gau(A_id, u32(nm))); }
}
fn subAtB(u: u32, x: f32, y: f32) -> f32 {
  if (U.plants == 0u || u == 0u) { return 1.0; }
  let c = colAt(x, y); if (c < 0) { return 0.0; }
  let jb = bedCell(c, max(0.05, depthAt(x, y))); if (jb < 0) { return 0.0; }
  let ix = sti(O_plIdx + u32(jb)); if (ix < 0) { return 0.0; }
  if (u == 1u) { return wd(W_spRigid + u32(ix)); } if (u == 2u) { return wd(W_spMat + u32(ix)); } return wd(W_spPlant + u32(ix));
}
fn siteNearB(k: u32, lake: u32, x: f32, y: f32) -> vec3f {
  let h = (k * 2u + lake - 1u) * 4u; let s0 = u32(bitcast<i32>(SI[h])); let cnt = u32(bitcast<i32>(SI[h + 1u])); let go = bitcast<i32>(SI[h + 2u]);
  if (cnt == 0u) { return vec3f(0.0); }
  let co = U.siCoord + 2u * s0;
  if (go < 0) { var best = 0u; var bd = 1e18; for (var q = 0u; q < cnt; q++) { let dx = SI[co + 2u * q] - x; let dy = SI[co + 2u * q + 1u] - y; let d = dx * dx + dy * dy; if (d < bd) { bd = d; best = q; } } return vec3f(SI[co + 2u * best], SI[co + 2u * best + 1u], 1.0); }
  let glen = u32(bitcast<i32>(SI[h + 3u])); let gx = u32(clamp(i32((x - GX0) / F3_MATE_HC), 0, i32(U.siNX) - 1)); let gyy = u32(max(0, i32((y - GY0) / F3_MATE_HC)));
  let q = u32(bitcast<i32>(SI[U.siGrid + u32(go) + min(glen - 1u, gyy * U.siNX + gx)]));
  return vec3f(SI[co + 2u * q], SI[co + 2u * q + 1u], 1.0);
}
// ---- A SPAWNING (fish3 _spawn): on its ground, with its mate in reach, at a rate that peaks inside the spawning temperatures. The
// female (or the school) claims itself and its mate with a priority: a male spawns with one female a block (fish3: once spent he is
// no longer ripe for the next) ----
@compute @workgroup_size(64) fn b_spawn(@builtin(global_invocation_id) g: vec3u) {
  let i = g.x; if (i >= U.n) { return; }
  sai(A_claim, i, -1);
  let fl = gau(A_flags, i); if ((fl & FL_ALIVE) == 0u || (fl & FL_RIPE) == 0u) { return; }
  let sx = gau(A_sex, i); let m = gai(A_mate, i); if (sx == 1u || m < 0) { return; }
  let k = gau(A_k, i); let x = ga(A_x, i); let y = ga(A_y, i); let z = ga(A_z, i); let bed = ga(A_bed, i);
  let inB = bodyAt(x, y) == BROOK; let rn = runsB(fl, i);
  var onGround = !(inB && (fl & FL_BROOKRUN) != 0u) && bed >= spv(k, S_sbBot0) - 0.1 && bed <= spv(k, S_sbBot1) + 0.2; if (rn) { onGround = inB; }
  if (!onGround) { return; }
  let sub = u32(spv(k, S_sbSub));
  if ((fl & FL_SP) != 0u && length(vec2f(x - ga(A_spX, i), y - ga(A_spY, i))) > 4.0 && subAtB(sub, x, y) < subAtB(sub, ga(A_spX, i), ga(A_spY, i))) { return; }
  if (sub > 0u && spv(k, S_sbSites) > 0.0) { let p = siteNearB(k, gau(A_lake, i), x, y); if (p.z == 0.0 || length(p.xy - vec2f(x, y)) > 4.0) { return; } }
  let b = u32(m); if (b != i) { let d = posLO(b, i) - vec3f(x, y, z); if (length(d) > select(F3_MATE_R, 3.0, sx == 2u)) { return; } }
  let E = SPAWN_EDGE; let T = ga(A_T, i); let lo = spv(k, S_spawnT0); let hi = spv(k, S_spawnT1);
  let f = clamp((T - lo + E) / E, 0.0, 1.0) * clamp((hi + E - T) / E, 0.0, 1.0);
  let id = gau(A_id, i);
  if (!(f > 0.0) || rnd(id, 76u, 0u) > expm(F3_SPAWN_RATE * f * U.dt)) { return; }
  let prio = ((hash32(id ^ hash32(U.blk ^ 0x5A5Au)) & 0x1FFFu) << 19u) | (i & 0x7FFFFu);
  sai(A_claim, i, i32(b)); sau(A_claimP, i, prio);
  atomicMax(&GS[GS_CLAIMP0 + i], prio); if (b != i) { atomicMax(&GS[GS_CLAIMP0 + b], prio); }
}
@compute @workgroup_size(128) fn b_spawnWin(@builtin(global_invocation_id) g: vec3u) {
  let i = g.x; if (i >= U.n) { return; }
  let b = gai(A_claim, i); if (b < 0) { return; }
  let p = gau(A_claimP, i);
  if (atomicLoad(&GS[GS_CLAIMP0 + i]) == p && atomicLoad(&GS[GS_CLAIMP0 + u32(b)]) == p) { sai(A_birth, i, 0); atomicMax(&GS[GS_BIRTHS], 1u); } else { sai(A_claim, i, -1); }
}
// ---- the newborn schools' and recruits' places in the arrays: one workgroup walks the fish (then the young) in index order,
// each birth taking the next slot and id — the same however the threads ran ----
var<workgroup> wsc: array<u32, 256>;
var<workgroup> wbase: u32;
var<workgroup> wflag: u32;
@compute @workgroup_size(256) fn b_slots(@builtin(local_invocation_id) l: vec3u) {
  let t = l.x;
  if (t == 0u) { wflag = atomicLoad(&GS[GS_BIRTHS]); wbase = 0u; }
  if (workgroupUniformLoad(&wflag) == 0u) { if (t == 0u) { GL[G_BORN] = 0.0; GL[G_NY] = f32(U.ny); GL[G_NEEDY] = 0.0; } return; }
  for (var base = 0u; base < U.n; base += 256u) {
    let i = base + t; var v = 0u; if (i < U.n && gai(A_birth, i) >= 0) { v = 1u; }
    wsc[t] = v;
    for (var off = 1u; off < 256u; off <<= 1u) { workgroupBarrier(); let w = select(0u, wsc[t - off], t >= off); workgroupBarrier(); wsc[t] += w; }
    workgroupBarrier();
    if (v == 1u) { let r = wbase + wsc[t] - 1u; if (U.ny + r < U.ycap) { sai(A_birth, i, i32(U.ny + r)); sau(A_bid, i, glu(G_NEXTID) + r); } else { sai(A_birth, i, -1); } }   // (no room left in the arrays: no spawning — the host makes room)
    workgroupBarrier();
    if (t == 255u) { wbase += wsc[255]; }
    workgroupBarrier();
  }
  if (t == 0u) { let nb = min(wbase, U.ycap - U.ny); GL[G_BORN] = f32(nb); GL[G_NY] = f32(U.ny + nb); GL[G_NEXTID] = bitcast<f32>(glu(G_NEXTID) + nb); GL[G_NEEDY] = f32(wbase - nb); }
}
fn hatchMul(k: u32, x: f32, y: f32) -> f32 {
  let u = u32(spv(k, S_sbSub)); if (u == 0u) { return 1.0; }
  let v = subAtB(u, x, y); add64(&TL, T_SPAWNSUB + 2u * k, v, TSCALE); let bare = spv(k, S_sbBare); return bare + (1.0 - bare) * v;
}
// the spawning itself: eggs by the female's fecundity and ripeness, larvae by hatching (on the plant spawners' structure) → ONE
// school at the site, its genome a mutated crossover of the parents'; both parents spent; a nest-guarding male keeps the nest
@compute @workgroup_size(64) fn b_spawnFill(@builtin(global_invocation_id) g: vec3u) {
  let i = g.x; if (i >= U.n) { return; }
  let slot = gai(A_birth, i); if (slot < 0) { return; }
  let q = u32(slot); let b = u32(gai(A_claim, i)); let k = gau(A_k, i); let sx = gau(A_sex, i); let nid = gau(A_bid, i);
  let x = ga(A_x, i); let y = ga(A_y, i); let bed = ga(A_bed, i); let W = ga(A_W, i); let L = ga(A_L, i);
  var females = 1.0; if (sx == 2u) { females = ga(A_n, i) / 2.0; }
  let eggs = females * spv(k, S_fecA) * pow(L, spv(k, S_fecB)) * clamp(ga(A_gon, i) / (spv(k, S_gsiF) * W), 0.0, 1.0);
  let larvae = eggs * spv(k, S_sHatch) * hatchMul(k, x, y);
  add64(&TL, T_EGGS + 2u * k, eggs, 1.0); add64(&TL, T_SPAWNS + 2u * k, 1.0, TSCALE); add64(&TL, T_FRY + 2u * (k * NFRY + FRY_HATCHED), larvae, TSCALE);
  add64(&TL, T_SPAWNBED + 2u * k, bed, TSCALE); if (bodyAt(x, y) == BROOK) { add64(&TL, T_SPAWNBROOK + 2u * k, 1.0, TSCALE); }
  let nz = max(0.05, bed - 0.03); let Lh = spv(k, S_Lhatch);
  for (var f = 0u; f < NYF; f++) { Y[f * U.ycap + q] = 0.0; }
  syu(Y_id, q, nid); syu(Y_k, q, k); syu(Y_flags, q, 1u); syu(Y_gen, q, max(gau(A_gen, i), gau(A_gen, b)) + 1u);
  syi(Y_c, q, -1); syi(Y_j, q, -1); syi(Y_jb, q, -1); syi(Y_gref, q, -1); syi(Y_qPrey, q, -1);
  sy(Y_n, q, larvae); sy(Y_x, q, x); sy(Y_y, q, y); sy(Y_z, q, nz); sy(Y_tx, q, x); sy(Y_ty, q, y); sy(Y_tz, q, nz); sy(Y_sx, q, x); sy(Y_sy, q, y); sy(Y_sz, q, nz);
  sy(Y_bed, q, max(0.05, depthAt(x, y))); sy(Y_L, q, Lh); sy(Y_W, q, stdWeight(k, Lh)); sy(Y_bdep, q, Lh * spv(k, S_depthR));
  sy(Y_hue, q, (ga(A_hue, i) + ga(A_hue, b)) / 2.0); sy(Y_tk, q, rnd(nid, 77u, 0u) * F3_YOY_TICK); sy(Y_hd, q, rnd(nid, 77u, 1u) * 6.283185307179586);
  sy(Y_spotBed, q, max(0.12, depthAt(x, y)));
  for (var e = 0u; e < NG; e++) { let w = select(gn(e, b), gn(e, i), rnd(nid, 78u, e) < 0.5); YG[e * U.ycap + q] = mutW(nid, e, w); }
  for (var e = 0u; e < NGENES; e++) { YG[(NG + e) * U.ycap + q] = mutGene(nid, e, (gn(NG + e, i) + gn(NG + e, b)) * 0.5); }
  // the male keeps the nest; its fry stay by it while he does
  let guard = spv(k, S_guard);
  if (guard > 0.0 && b != i && ga(A_n, b) <= 1.0) {
    sa(A_nt, b, guard); sa(A_nx, b, x); sa(A_ny, b, y); sa(A_nz, b, nz); syu(Y_guard, q, gau(A_id, b)); syi(Y_gref, q, i32(b)); sy(Y_nx, q, x); sy(Y_ny, q, y);
    if (spv(k, S_sbFaith) > 0.0) { sa(A_nestX, b, x); sa(A_nestY, b, y); sau(A_flags, b, gau(A_flags, b) | FL_NEST); }
  }
  sa(A_gon, i, 0.0); sa(A_mateCd, i, spv(k, S_mateCdS)); sau(A_flags, i, gau(A_flags, i) & ~FL_RIPE); sa(A_lastSpawnD, i, U.timeD);
  if (b != i) { sa(A_gon, b, 0.0); sa(A_mateCd, b, spv(k, S_mateCdS)); sau(A_flags, b, gau(A_flags, b) & ~FL_RIPE); sa(A_lastSpawnD, b, U.timeD); }
}
// ---- RECRUITMENT (fish3 _recruit): a schooling species' young become a school agent; a solitary species' young below their group
// size groups, past it individuals (siblings: fresh mutations) — up to F3.CAP × the species' census. One workgroup walks the young in
// index order (the room each species has left falls as the schools before take it), listing each recruiting school's agents ----
var<workgroup> wroom: array<f32, 16>;
var<workgroup> wcnt: array<u32, 256>;
var<workgroup> wnrec: u32;
var<workgroup> wneed: u32;
@compute @workgroup_size(256) fn b_recruitWalk(@builtin(local_invocation_id) l: vec3u) {
  let t = l.x;
  if (t < NK) { wroom[t] = max(0.0, F3_CAP * spTarget(t) - GL[G_CNT + t]); }
  if (t == 0u) { wbase = 0u; wnrec = 0u; wneed = 0u; }
  workgroupBarrier();
  for (var base = 0u; base < U.ny; base += 256u) {
    let q = base + t; var isR = false;
    if (q < U.ny) { isR = (gyu(Y_flags, q) & 1u) != 0u && gy(Y_recruit, q) > 0.5; }
    wcnt[t] = select(0u, 1u, isR);
    workgroupBarrier();
    // (in index order: thread 0 settles each recruiting school of these 256 — the room is shared by species in order)
    if (t == 0u) {
      for (var m = 0u; m < 256u; m++) {
        if (wcnt[m] == 0u) { continue; }
        let qq = base + m; let k = gyu(Y_k, qq); let n = gy(Y_n, qq); let L = gy(Y_L, qq);
        let grp = spv(k, S_school) > 0.0 || (spv(k, S_group0) > 0.0 && L < spv(k, S_group0));
        var nA = 0u; var per = 1.0; var last = 1.0; var tot = 0.0;
        if (grp) {   // (chunks of the group's size, the remainder last if ≥ 1 — fish3's while (left ≥ 1); a school species: one agent)
          let left = min(n, wroom[k]);
          if (left >= 1.0) {
            if (spv(k, S_school) > 0.0) { nA = 1u; per = left; last = left; tot = left; }
            else { let gs = spv(k, S_group1); let full = floor(left / gs); let rem = left - full * gs; nA = u32(full) + select(0u, 1u, rem >= 1.0); per = gs; last = select(gs, rem, rem >= 1.0); tot = full * gs + select(0.0, rem, rem >= 1.0); }
          }
        } else {
          nA = u32(max(0.0, min(floor(n + yrnd2(qq, 79u, 0u)), floor(wroom[k])))); tot = f32(nA);
        }
        if (U.n + wbase + wneed + nA > U.cap) { wneed += nA; continue; }   // (no room left in the arrays: the school waits a block — the host grows them)
        wroom[k] = max(0.0, wroom[k] - tot);
        syu(Y_flags, qq, gyu(Y_flags, qq) & ~1u);   // (the school is gone: its fish recruited, or none with no room in the census)
        add64(&TL, T_FRY + 2u * (k * NFRY + FRY_RECRUITED), tot, TSCALE); add64(&TL, T_RECRUITS + 2u * k, tot, TSCALE); add64(&TL, T_YCAP + 2u * k, max(0.0, n - tot), TSCALE);
        if (nA > 0u) { let r = wnrec; IND[REC_LIST + 4u * r] = qq; IND[REC_LIST + 4u * r + 1u] = wbase; IND[REC_LIST + 4u * r + 2u] = bitcast<u32>(per); IND[REC_LIST + 4u * r + 3u] = bitcast<u32>(last); wnrec = r + 1u; wbase += nA; }
      }
    }
    workgroupBarrier();
  }
  if (t == 0u) {
    IND[REC_LIST + 4u * wnrec + 1u] = wbase;   // (the end sentinel)
    GL[G_RECRUITS] = f32(wbase); GL[G_NREC] = f32(wnrec); GL[G_N] = f32(U.n + wbase); GL[G_NEEDA] = f32(wneed);
    IND[0] = (wbase + 63u) / 64u; IND[1] = 1u; IND[2] = 1u;
  }
}
fn yrnd2(q: u32, purpose: u32, k: u32) -> f32 { return rnd(gyu(Y_id, q), purpose, k); }
fn spTarget(k: u32) -> f32 { if (spv(k, S_brookRes) > 0.5) { return spv(k, S_perM2) * BROOK_AREA; } return spv(k, S_perHa) * LAKE_HA; }
// fish3 _near: a spot within r of (x, y) in the same water — or (x, y) itself
fn nearSpot(x: f32, y: f32, r: f32, id: u32) -> vec2f {
  let b = bodyAt(x, y); let nx = x + (rnd(id, 80u, 0u) - 0.5) * r; let ny = y + (rnd(id, 80u, 1u) - 0.5) * r;
  if (bodyAt(nx, ny) == b && colAt(nx, ny) >= 0 && depthAt(nx, ny) > F3_ZTOP + F3_ZBOT) { return vec2f(nx, ny); }
  return vec2f(x, y);
}
// a new agent (fish3 add + _traits + _settle; the recruit's own length, mass, generation): slot s from the young school q
fn newAgent(s: u32, k: u32, id: u32, x: f32, y: f32, age: u32, n: f32) {
  for (var f = 0u; f < NAF; f++) { A[f * U.cap + s] = 0.0; }
  for (var r = 0u; r < NBR; r++) { BR[r * U.cap + s] = 0.0; }
  sau(A_id, s, id); sau(A_k, s, k); sa(A_n, s, n);
  var fl = FL_ALIVE; let school = n > 1.0; if (school) { fl |= FL_SCHOOL; }
  sa(A_x, s, x); sa(A_y, s, y); sa(A_hx, s, x); sa(A_hy, s, y); sa(A_yaw, s, rnd(id, 81u, 0u) * 6.283185307179586);
  sau(A_age, s, age);
  var sex = 2u; if (!school) { sex = select(1u, 0u, rnd(id, 81u, 1u) < 0.5); } sau(A_sex, s, sex);
  // the plastic block: the genome's own
  for (var r = 0u; r < NW2; r++) { BR[r * U.cap + s] = GN[(W2OFF + r) * U.cap + s]; }
  // _traits
  let gSize = gn(NG, s); let gSpeed = gn(NG + 1u, s); let gTol = gn(NG + 2u, s); let gFin = gn(NG + 3u, s); let gEye = gn(NG + 4u, s); let gBody = gn(NG + 5u, s); let gBrain = gn(NG + 6u, s);
  let act = u32(clamp(round(f32(HID) * gBrain), min(BRAIN_HID_MIN, f32(HID)), f32(HID))); sau(A_active, s, act);
  sa(A_turnMax0, s, spv(k, S_turn) * (0.6 + 0.4 * gFin)); sa(A_sense0, s, spv(k, S_sense) * (0.6 + 0.4 * gEye));
  sa(A_spdGene, s, gSpeed * (1.18 - 0.18 * gBody) * (1.05 - 0.05 * gFin)); sa(A_bodyMul, s, 0.8 + 0.2 * gBody);
  sa(A_tempTol, s, spv(k, S_tempTolS) * gTol); sa(A_o2Crit, s, clamp(spv(k, S_o2CritS) * (2.0 - gTol), 0.05, 0.9));
  sa(A_o2Lethal, s, clamp(spv(k, S_o2LethalS) / ENV_O2_MGL * (2.0 - gTol), 0.005, 0.5)); sa(A_o2Ice, s, clamp(spv(k, S_o2IceS) / ENV_O2_MGL * (2.0 - gTol), 0.0, 0.5));
  sa(A_uilt, s, spv(k, S_uiltS) + BIOE_UILT_GENE * (gTol - 1.0));
  sa(A_metabMul, s, (0.85 + 0.15 * gSpeed) * (0.9 + 0.1 * gTol) * (0.95 + 0.05 * gFin) * (0.93 + 0.07 * gEye) * (0.92 + 0.08 * gBody) * (1.0 - BRAIN_COST * f32(HID - act) / f32(HID)));
  let lm = spv(k, S_Lmat) * pow(gSize, BIOE_LMAT_GENE); let lmm = spv(k, S_LmatM); var Lmat = lm;
  if (lmm > 0.0) { if (sex == 1u) { Lmat = lm * lmm / spv(k, S_Lmat); } else if (sex == 2u) { Lmat = lm * (1.0 + lmm / spv(k, S_Lmat)) / 2.0; } }
  sa(A_Lmat, s, Lmat);
  // its lake and home there; the brook's users
  let b0 = bodyAt(x, y); var lake = UPPER; if (b0 == LOWER) { lake = LOWER; } else if (b0 != UPPER) { lake = select(LOWER, UPPER, nearestBP(x, y) <= i32(BLAST) / 2); }
  var lh = vec2f(x, y); if (b0 != lake) { lh = vec2f(stf(O_bLakeNear + 2u * lake), stf(O_bLakeNear + 2u * lake + 1u)); sa(A_hx, s, lh.x); sa(A_hy, s, lh.y); }
  sau(A_lake, s, lake); sau(A_inLake, s, lake);
  let dB = length(select(bp(BLAST), bp(0u), lake == UPPER) - lh);
  if (spv(k, S_sbBrook) > 0.0 && dB < F3_BROOK_NEAR && rnd(id, 81u, 2u) < spv(k, S_sbBrook)) { fl |= FL_BROOKIE; }
  if (spv(k, S_sbSiteBrook) > 0.0 && (spv(k, S_brookRes) > 0.0 || dB < F3_BROOK_RUN)) { fl |= FL_BROOKRUN; }
  if (spv(k, S_brookRes) > 0.0) { var p = vec2f(x, y); if (b0 != BROOK) { p = bp(u32(nearestBP(x, y))); } lh = p; sa(A_hx, s, p.x); sa(A_hy, s, p.y); }
  sa(A_lhx, s, lh.x); sa(A_lhy, s, lh.y);
  sai(A_spYr, s, -1); sai(A_runYr, s, -1); sai(A_prey, s, -1); sai(A_threat, s, -1); sai(A_mate, s, -1); sai(A_c, s, -1); sai(A_j, s, -1); sai(A_jb, s, -1); sai(A_claim, s, -1); sai(A_birth, s, -1);
  sa(A_lastSpawnD, s, -1e18); sa(A_xo, s, 1.0); sa(A_xt, s, 15.0); sa(A_uAvg, s, spv(k, S_uRoutine)); sa(A_fd, s, -1.0); sa(A_td, s, -1.0);
  sau(A_flags, s, fl);
}
@compute @workgroup_size(64) fn b_recruitFill(@builtin(global_invocation_id) g: vec3u) {
  let t = g.x; let tot = u32(GL[G_RECRUITS]); if (t >= tot) { return; }
  // its school: the last listed whose first agent ≤ t
  var lo = 0u; var hi = u32(GL[G_NREC]);
  while (hi - lo > 1u) { let mid = (lo + hi) / 2u; if (IND[REC_LIST + 4u * mid + 1u] <= t) { lo = mid; } else { hi = mid; } }
  let q = IND[REC_LIST + 4u * lo]; let st = IND[REC_LIST + 4u * lo + 1u]; let en = IND[REC_LIST + 4u * (lo + 1u) + 1u];
  let m = t - st; let nA = en - st; let first = m == 0u;
  let k = gyu(Y_k, q); let L = gy(Y_L, q);
  var na = bitcast<f32>(IND[REC_LIST + 4u * lo + 2u]); if (m == nA - 1u) { na = bitcast<f32>(IND[REC_LIST + 4u * lo + 3u]); }
  let s = U.n + t; let id = glu(G_NEXTID) + t;
  let qx = gy(Y_x, q); let qy = gy(Y_y, q); var p = vec2f(qx, qy); if (!first) { p = nearSpot(qx, qy, 0.6, id); }
  // the genome: the school's for the first, a fresh mutation of it for each sibling
  for (var e = 0u; e < NG; e++) { var w = YG[e * U.ycap + q]; if (!first) { w = mutW(id, e, w); } GN[e * U.cap + s] = w; }
  for (var e = 0u; e < NGENES; e++) { var v = YG[(NG + e) * U.ycap + q]; if (!first) { v = mutGene(id, e, v); } GN[(NG + e) * U.cap + s] = v; }
  newAgent(s, k, id, p.x, p.y, gyu(Y_age, q), na);
  // the recruit's own body
  sa(A_L, s, L); sa(A_W, s, gy(Y_W, q)); sau(A_gen, s, gyu(Y_gen, q)); sa(A_hue, s, gy(Y_hue, q));
  settle(s, k);
  let bed = max(0.05, depthAt(p.x, p.y)); sa(A_bed, s, bed); sa(A_z, s, clamp(gy(Y_z, q), F3_ZTOP, max(F3_ZTOP, bed - F3_ZBOT)));
  sa(A_spd, s, spv(k, S_cruise) * L / 100.0);
}
@compute @workgroup_size(1) fn b_count() { if (GL[G_RECRUITS] > 0.0) { GL[G_NEXTID] = bitcast<f32>(glu(G_NEXTID) + u32(GL[G_RECRUITS])); } }
`;

// ============================================================ COMPACTING AND COUNTING =========================================
// the dead squeezed out of the arrays (fish3 filters its lists at a step's end): one workgroup walks the slots in order giving each
// living one its new place, then every slot is copied to it in a second set of buffers (copied back after) — mates and a brood's
// guardian follow their fish's new slot; and the census: each species' fish, grams, lengths, intake, the mature, and the young
export const COMPACT_BINDINGS = /* wgsl */`
@group(1) @binding(0) var<storage, read_write> MAP: array<u32>;
@group(1) @binding(1) var<storage, read_write> CPA: array<f32>;
@group(1) @binding(2) var<storage, read_write> CPBR: array<f32>;
@group(1) @binding(3) var<storage, read_write> CPGN: array<f32>;
@group(1) @binding(4) var<storage, read_write> Y: array<f32>;
@group(1) @binding(5) var<storage, read_write> YG: array<f32>;
@group(1) @binding(6) var<storage, read_write> CPY: array<f32>;
@group(1) @binding(7) var<storage, read_write> CPYG: array<f32>;
@group(1) @binding(8) var<storage, read_write> GL: array<f32>;
@group(1) @binding(9) var<storage, read_write> CEN: array<atomic<u32>>;
const G_N: u32 = 34u; const G_NY: u32 = 35u;
const NONE: u32 = 0xFFFFFFFFu;`;
export const COMPACT = /* wgsl */`
var<workgroup> wsc: array<u32, 256>;
var<workgroup> wbase: u32;
// kind 0: the agents (MAP[0..n)); kind 1: the young (MAP[cap..cap + ny))
@compute @workgroup_size(256) fn c_walk(@builtin(local_invocation_id) l: vec3u, @builtin(workgroup_id) w: vec3u) {
  let t = l.x; let kind = w.x; var N = U.n; var off = 0u; if (kind == 1u) { N = U.ny; off = U.cap; }
  if (t == 0u) { wbase = 0u; }
  workgroupBarrier();
  for (var base = 0u; base < N; base += 256u) {
    let i = base + t; var v = 0u;
    if (i < N) { if (kind == 0u) { v = select(0u, 1u, (bitcast<u32>(A[A_flags * U.cap + i]) & FL_ALIVE) != 0u); } else { v = select(0u, 1u, (bitcast<u32>(Y[Y_flags * U.ycap + i]) & 1u) != 0u); } }
    wsc[t] = v;
    for (var o = 1u; o < 256u; o <<= 1u) { workgroupBarrier(); let x = select(0u, wsc[t - o], t >= o); workgroupBarrier(); wsc[t] += x; }
    workgroupBarrier();
    if (i < N) { MAP[off + i] = select(NONE, wbase + wsc[t] - 1u, v == 1u); }
    workgroupBarrier();
    if (t == 255u) { wbase += wsc[255]; }
    workgroupBarrier();
  }
  if (t == 0u) { if (kind == 0u) { GL[G_N] = f32(wbase); } else { GL[G_NY] = f32(wbase); } }
}
fn cpai(f: u32, d: u32, v: i32) { CPA[f * U.cap + d] = bitcast<f32>(v); }   // (an i32 through a parameter: a constant -1 bitcast is a NaN the compiler refuses)
@compute @workgroup_size(128) fn c_gatherA(@builtin(global_invocation_id) g: vec3u) {
  let i = g.x; if (i >= U.n) { return; }
  let d = MAP[i]; if (d == NONE) { return; }
  for (var f = 0u; f < NAF; f++) { CPA[f * U.cap + d] = A[f * U.cap + i]; }
  for (var r = 0u; r < NBR; r++) { CPBR[r * U.cap + d] = BR[r * U.cap + i]; }
  for (var r = 0u; r < NGN; r++) { CPGN[r * U.cap + d] = GN[r * U.cap + i]; }
  // its mate's new slot (none if it died); the senses' prey and threat are the block's own
  let m = bitcast<i32>(A[A_mate * U.cap + i]); var nm = -1; if (m >= 0 && u32(m) < U.n) { let mm = MAP[u32(m)]; if (mm != NONE) { nm = i32(mm); } }
  cpai(A_mate, d, nm); cpai(A_prey, d, -1); cpai(A_threat, d, -1);
}
@compute @workgroup_size(128) fn c_gatherY(@builtin(global_invocation_id) g: vec3u) {
  let q = g.x; if (q >= U.ny) { return; }
  let d = MAP[U.cap + q]; if (d == NONE) { return; }
  for (var f = 0u; f < NYF; f++) { CPY[f * U.ycap + d] = Y[f * U.ycap + q]; }
  for (var r = 0u; r < NGN; r++) { CPYG[r * U.ycap + d] = YG[r * U.ycap + q]; }
  let gr = bitcast<i32>(Y[Y_gref * U.ycap + q]); var ng = -1; if (gr >= 0 && u32(gr) < U.n) { let mm = MAP[u32(gr)]; if (mm != NONE) { ng = i32(mm); } }
  CPY[Y_gref * U.ycap + d] = bitcast<f32>(ng);
}
// THE CENSUS (fish3 census): per species [fish, grams, Σ n·L, Σ n·cons, Σ n·consMax, mature fish, agents, young fish, young grams,
// Σ young n·L, young schools] — 64-bit fixed point
const CEN_REC: u32 = 24u;   // words a species (12 pairs)
fn cadd(k: u32, f: u32, v: f32, scale: f32) {
  let q = max(v, 0.0) * scale; if (!(q >= 1.0)) { return; }
  let at = k * CEN_REC + 2u * f; let hi = floor(q / 4294967296.0); let lo = u32(min(q - hi * 4294967296.0, 4294967295.0));
  let old = atomicAdd(&CEN[at], lo); var carry = u32(hi); if (old > 0xFFFFFFFFu - lo) { carry += 1u; } if (carry > 0u) { atomicAdd(&CEN[at + 1u], carry); }
}
@compute @workgroup_size(256) fn c_census(@builtin(global_invocation_id) g: vec3u) {
  let i = g.x;
  if (i < U.n) {
    let fl = bitcast<u32>(A[A_flags * U.cap + i]);
    if ((fl & FL_ALIVE) != 0u) {
      let k = gau(A_k, i); let n = ga(A_n, i);
      cadd(k, 0u, n, 1e3); cadd(k, 1u, n * ga(A_W, i), 1e3); cadd(k, 2u, n * ga(A_L, i), 1e3); cadd(k, 3u, n * ga(A_cons, i), 1e6); cadd(k, 4u, n * ga(A_consMax, i), 1e6);
      if ((fl & FL_MATURE) != 0u) { cadd(k, 5u, n, 1e3); } cadd(k, 6u, 1.0, 1.0); cadd(k, 11u, n * ga(A_K, i), 1e3);
    }
  }
  if (i < U.ny) {
    if ((bitcast<u32>(Y[Y_flags * U.ycap + i]) & 1u) != 0u) {
      let k = bitcast<u32>(Y[Y_k * U.ycap + i]); let n = Y[Y_n * U.ycap + i];
      cadd(k, 7u, n, 1e3); cadd(k, 8u, n * Y[Y_W * U.ycap + i], 1e3); cadd(k, 9u, n * Y[Y_L * U.ycap + i], 1e3); cadd(k, 10u, 1.0, 1.0);
    }
  }
}
`;

// ============================================================ THE SCHOOLS (fish3 _schools, _soloCut, _dissolve, _split, _merge, _mergeYoy)
// every MERGE_EVERY blocks: the budget's own-brain length (every SOLO_EVERY days: a histogram of the schools' lengths, walked from the
// longest — fish3 sorts them), schools grown to it break up into individuals, schools past twice their size split, and schools of a
// species and size near each other merge (one genome, chosen ∝ n). A merge is a claim: each school proposes to the first fit
// school it finds (fish3's scan order), the lowest-numbered proposer wins, and a school absorbed can't absorb in the same pass
export const SCHOOL_BINDINGS = /* wgsl */`
@group(1) @binding(0) var<storage, read> HS: array<u32>;
@group(1) @binding(1) var<storage, read> HI: array<u32>;
@group(1) @binding(2) var<storage, read> YHS: array<u32>;
@group(1) @binding(3) var<storage, read> YHI: array<u32>;
@group(1) @binding(4) var<storage, read_write> Y: array<f32>;
@group(1) @binding(5) var<storage, read_write> YG: array<f32>;
@group(1) @binding(6) var<storage, read_write> GL: array<f32>;
@group(1) @binding(7) var<storage, read_write> GS: array<atomic<u32>>;
@group(1) @binding(8) var<storage, read_write> TL: array<atomic<u32>>;
@group(1) @binding(9) var<storage, read_write> IND: array<u32>;
const G_N: u32 = 34u; const G_NEXTID: u32 = 36u; const G_SOLOL: u32 = 40u; const G_NBORN2: u32 = 41u; const G_NLIST2: u32 = 42u;
const GS_HIST: u32 = 512u;      // the own-brain cut's histogram (SOLO_BINS words), then the claims (ABS: cap words)
const SOLO_BINS: u32 = 8192u; const SOLO_BIN_CM: f32 = 0.01;
const NONE: u32 = 0xFFFFFFFFu;
const REC_LIST2: u32 = 16u;
fn keyOf(i: u32) -> u32 { return 0xFFFFFFFEu - i; }`;
export const SCHOOL = /* wgsl */`
fn gy(f: u32, q: u32) -> f32 { return Y[f * U.ycap + q]; }
fn gyu(f: u32, q: u32) -> u32 { return bitcast<u32>(Y[f * U.ycap + q]); }
fn gyi(f: u32, q: u32) -> i32 { return bitcast<i32>(Y[f * U.ycap + q]); }
fn sy(f: u32, q: u32, v: f32) { Y[f * U.ycap + q] = v; }
fn syu(f: u32, q: u32, v: u32) { Y[f * U.ycap + q] = bitcast<f32>(v); }
fn glu(at: u32) -> u32 { return bitcast<u32>(GL[at]); }
fn gaussR(id: u32, purpose: u32, k: u32) -> f32 { let u = max(rnd(id, purpose, 2u * k), 1e-7); let v = rnd(id, purpose, 2u * k + 1u); return sqrt(-2.0 * log(u)) * cos(6.283185307179586 * v); }
fn mutW(id: u32, e: u32, w: f32) -> f32 {
  if (rnd(id, 70u, e) < 0.015) { return rndR(id, 71u, e, -1.2, 1.2); }
  if (rnd(id, 72u, e) < 0.10) { return clamp(w + gaussR(id, 73u, e) * 0.35, -4.0, 4.0); }
  return w;
}
fn mutGene(id: u32, e: u32, v: f32) -> f32 { var x = v; if (rnd(id, 74u, e) < 0.5) { x += gaussR(id, 75u, e) * 0.05; } return clamp(x, 0.7, 1.35); }
fn gSize(k: u32) -> f32 { if (spv(k, S_school) > 0.0) { return spv(k, S_school); } return spv(k, S_group1); }
fn soloOf(k: u32) -> f32 { if (spv(k, S_solo) > 0.0) { return GL[G_SOLOL]; } if (spv(k, S_group0) > 0.0) { return spv(k, S_group0); } if (spv(k, S_school) > 0.0) { return 3e38; } return 0.0; }
// ---- the own-brain cut (fish3 _soloCut): the agents outside the brook's own, and the schools of the solo species by length ----
@compute @workgroup_size(256) fn s_hist(@builtin(global_invocation_id) g: vec3u) {
  let i = g.x; if (i >= U.n) { return; }
  let fl = gau(A_flags, i); if ((fl & FL_ALIVE) == 0u) { return; }
  let k = gau(A_k, i);
  if (spv(k, S_brookRes) < 0.5) { atomicAdd(&GS[GS_HIST + SOLO_BINS], 1u); }
  if ((fl & FL_SCHOOL) != 0u && spv(k, S_solo) > 0.0 && (fl & FL_RIPE) == 0u) {
    let b = min(SOLO_BINS - 1u, u32(ga(A_L, i) / SOLO_BIN_CM)); let more = u32(max(0.0, floor(ga(A_n, i)) - 1.0));
    atomicAdd(&GS[GS_HIST + b], more);
  }
}
@compute @workgroup_size(1) fn s_cut() {   // (from the longest bin down while the budget lasts; the cut the last bin taken whole)
  var A = atomicLoad(&GS[GS_HIST + SOLO_BINS]); let Bud = u32(F3_AGENTS_HA * LAKE_HA); var cut = 3e38;
  for (var b = i32(SOLO_BINS) - 1; b >= 0; b--) {
    let m = atomicLoad(&GS[GS_HIST + u32(b)]); if (m == 0u) { continue; }
    if (A + m > Bud) { break; } A += m; cut = f32(b) * SOLO_BIN_CM;
  }
  GL[G_SOLOL] = cut;
}
// ---- who dissolves (its fish their own agents) or splits (one more agent): the count of new agents each school makes ----
@compute @workgroup_size(128) fn s_mark(@builtin(global_invocation_id) g: vec3u) {
  let i = g.x; if (i >= U.n) { return; }
  sai(A_birth, i, -1); sai(A_claim, i, -1); sau(A_bid, i, 0u);
  let fl = gau(A_flags, i); if ((fl & FL_ALIVE) == 0u || (fl & FL_SCHOOL) == 0u) { return; }
  let k = gau(A_k, i); let gs = gSize(k);
  if (dissolves(i, fl, k)) { sau(A_bid, i, u32(max(1.0, floor(ga(A_n, i) + rnd(gau(A_id, i), 90u, 0u))))); sai(A_birth, i, 1); return; }
  if (ga(A_n, i) > gs * F3_SPLIT) { sau(A_bid, i, 1u); sai(A_birth, i, 2); return; }   // (split)
  // a merge (fish3 merges each school, in index order, with the first fit one it finds — in effect the first with the second, the
  // third with the fourth…): here the schools of its species in its grid cell, in index order, paired neighbour with neighbour —
  // the pairs' offset alternating pass by pass — each target with one absorber, so no claims and none both absorbed and absorbing
  let x = ga(A_x, i); let y = ga(A_y, i); let z = ga(A_z, i); let L = ga(A_L, i); let n = ga(A_n, i);
  let c = u32(clamp(i32((y - GY0) / F3_HC), 0, i32(HHY) - 1)) * HHX + u32(clamp(i32((x - GX0) / F3_HC), 0, i32(HHX) - 1));
  var rank = 0u; var t = HS[c];
  for (; t < HS[c + 1u]; t++) { let b = HI[t]; if (b == i) { break; } if (mergeable(b, k)) { rank += 1u; } }
  if (((rank + (U.blk / u32(F3_MERGE_EVERY))) & 1u) != 0u) { return; }   // (this pass it is a target, or unpaired)
  for (t = t + 1u; t < HS[c + 1u]; t++) {
    let b = HI[t]; if (!mergeable(b, k)) { continue; }
    let Lb = ga(A_L, b); let lr = select(Lb / L, L / Lb, L > Lb);
    if (length(vec3f(ga(A_x, b) - x, ga(A_y, b) - y, ga(A_z, b) - z)) <= F3_MERGE_R && lr <= F3_MERGE_LR && n + ga(A_n, b) <= gs * F3_MERGE_MAX) { sai(A_claim, i, i32(b)); }
    return;
  }
}
fn dissolves(i: u32, fl: u32, k: u32) -> bool { return ga(A_L, i) >= soloOf(k) && (fl & FL_RIPE) == 0u && !(ga(A_nt, i) > 0.0); }
fn mergeable(b: u32, k: u32) -> bool {   // (a school of species k that neither dissolves nor splits this pass)
  let fb = gau(A_flags, b); if ((fb & FL_ALIVE) == 0u || (fb & FL_SCHOOL) == 0u || gau(A_k, b) != k) { return false; }
  return !dissolves(b, fb, k) && !(ga(A_n, b) > gSize(k) * F3_SPLIT);
}
// the merge: b joins i; the school keeps one parent's genome (and brain), chosen ∝ n
@compute @workgroup_size(128) fn s_merge(@builtin(global_invocation_id) g: vec3u) {
  let i = g.x; if (i >= U.n) { return; }
  let bi = gai(A_claim, i); if (bi < 0) { return; }
  let b = u32(bi);
  let na = ga(A_n, i); let nb = ga(A_n, b); let tot = na + nb; let wa = na / tot; let wb = nb / tot; let k = gau(A_k, i);
  if (rnd(gau(A_id, i), 91u, gau(A_id, b)) < wb) {   // (b's genome and brain)
    for (var r = 0u; r < NGN; r++) { GN[r * U.cap + i] = GN[r * U.cap + b]; }
    for (var r = 0u; r < NBR; r++) { BR[r * U.cap + i] = BR[r * U.cap + b]; }
    sau(A_gen, i, gau(A_gen, b)); sa(A_hue, i, ga(A_hue, b)); retrait(i, k);
  }
  sa(A_W, i, ga(A_W, i) * wa + ga(A_W, b) * wb); sa(A_L, i, max(ga(A_L, i) * wa + ga(A_L, b) * wb, 0.1));
  sa(A_gut, i, ga(A_gut, i) * wa + ga(A_gut, b) * wb); sa(A_gutE, i, ga(A_gutE, i) * wa + ga(A_gutE, b) * wb); sa(A_gon, i, ga(A_gon, i) * wa + ga(A_gon, b) * wb);
  sau(A_age, i, u32(round(f32(gau(A_age, i)) * wa + f32(gau(A_age, b)) * wb)));
  sa(A_cons, i, ga(A_cons, i) + ga(A_cons, b)); sa(A_consMax, i, ga(A_consMax, i) + ga(A_consMax, b));
  var fl = gau(A_flags, i); if ((gau(A_flags, b) & FL_MATURE) != 0u) { fl |= FL_MATURE; } sau(A_flags, i, fl);
  sa(A_n, i, tot); sau(A_flags, b, gau(A_flags, b) & ~FL_ALIVE); sa(A_n, b, 0.0);
  settle(i, k);
}
// fish3 _traits from the genes (a merged school taking the other's genome)
fn retrait(s: u32, k: u32) {
  let gSz = gn(NG, s); let gSpeed = gn(NG + 1u, s); let gTol = gn(NG + 2u, s); let gFin = gn(NG + 3u, s); let gEye = gn(NG + 4u, s); let gBody = gn(NG + 5u, s); let gBrain = gn(NG + 6u, s);
  let act = u32(clamp(round(f32(HID) * gBrain), min(BRAIN_HID_MIN, f32(HID)), f32(HID))); sau(A_active, s, act);
  sa(A_turnMax0, s, spv(k, S_turn) * (0.6 + 0.4 * gFin)); sa(A_sense0, s, spv(k, S_sense) * (0.6 + 0.4 * gEye));
  sa(A_spdGene, s, gSpeed * (1.18 - 0.18 * gBody) * (1.05 - 0.05 * gFin)); sa(A_bodyMul, s, 0.8 + 0.2 * gBody);
  sa(A_tempTol, s, spv(k, S_tempTolS) * gTol); sa(A_o2Crit, s, clamp(spv(k, S_o2CritS) * (2.0 - gTol), 0.05, 0.9));
  sa(A_o2Lethal, s, clamp(spv(k, S_o2LethalS) / ENV_O2_MGL * (2.0 - gTol), 0.005, 0.5)); sa(A_o2Ice, s, clamp(spv(k, S_o2IceS) / ENV_O2_MGL * (2.0 - gTol), 0.0, 0.5));
  sa(A_uilt, s, spv(k, S_uiltS) + BIOE_UILT_GENE * (gTol - 1.0));
  sa(A_metabMul, s, (0.85 + 0.15 * gSpeed) * (0.9 + 0.1 * gTol) * (0.95 + 0.05 * gFin) * (0.93 + 0.07 * gEye) * (0.92 + 0.08 * gBody) * (1.0 - BRAIN_COST * f32(HID - act) / f32(HID)));
  let lm = spv(k, S_Lmat) * pow(gSz, BIOE_LMAT_GENE); let lmm = spv(k, S_LmatM); let sex = gau(A_sex, s); var Lmat = lm;
  if (lmm > 0.0) { if (sex == 1u) { Lmat = lm * lmm / spv(k, S_Lmat); } else if (sex == 2u) { Lmat = lm * (1.0 + lmm / spv(k, S_Lmat)) / 2.0; } }
  sa(A_Lmat, s, Lmat);
}
// ---- the new agents' slots: one workgroup walks the schools in order (dissolves and splits) ----
var<workgroup> wsc: array<u32, 256>;
var<workgroup> wbase: u32;
var<workgroup> wnl: u32;
var<workgroup> wneedS: u32;
@compute @workgroup_size(256) fn s_slots(@builtin(local_invocation_id) l: vec3u) {
  let t = l.x;
  if (t == 0u) { wbase = 0u; wnl = 0u; wneedS = 0u; }
  workgroupBarrier();
  for (var base = 0u; base < U.n; base += 256u) {
    let i = base + t; var v = 0u; if (i < U.n && gai(A_birth, i) >= 0) { v = gau(A_bid, i); }
    wsc[t] = v;
    for (var o = 1u; o < 256u; o <<= 1u) { workgroupBarrier(); let x = select(0u, wsc[t - o], t >= o); workgroupBarrier(); wsc[t] += x; }
    workgroupBarrier();
    // (in order: thread 0 lists the schools of these 256 — the list's starts for the fill's search)
    if (t == 0u) {
      for (var m = 0u; m < 256u; m++) {
        let ii = base + m; if (ii >= U.n || gai(A_birth, ii) < 0) { continue; }
        let c = gau(A_bid, ii); let st = wbase + (wsc[m] - c);
        if (U.n + st + c > U.cap) { sai(A_birth, ii, -1); wneedS += c; continue; }   // (no room: it waits for the next pass — the host grows the arrays)
        IND[REC_LIST2 + 2u * wnl] = ii; IND[REC_LIST2 + 2u * wnl + 1u] = st; wnl += 1u;
      }
    }
    workgroupBarrier();
    if (t == 0u) { wbase += wsc[255]; }
    workgroupBarrier();
  }
  if (t == 0u) {
    var last = 0u; if (wnl > 0u) { let li = IND[REC_LIST2 + 2u * (wnl - 1u)]; last = IND[REC_LIST2 + 2u * (wnl - 1u) + 1u] + select(0u, gau(A_bid, li), gai(A_birth, li) >= 0); }
    IND[REC_LIST2 + 2u * wnl + 1u] = last; GL[G_NBORN2] = f32(last); GL[G_NLIST2] = f32(wnl); GL[45] = f32(wneedS);
    IND[4] = (last + 63u) / 64u; IND[5] = 1u; IND[6] = 1u;
  }
}
// fish3 _near (the dissolving school's fish spread about it)
fn nearSpotS(x: f32, y: f32, r: f32, id: u32) -> vec2f {
  let b = bodyAt(x, y); let nx = x + (rnd(id, 80u, 0u) - 0.5) * r; let ny = y + (rnd(id, 80u, 1u) - 0.5) * r;
  if (bodyAt(nx, ny) == b && colAt(nx, ny) >= 0 && depthAt(nx, ny) > F3_ZTOP + F3_ZBOT) { return vec2f(nx, ny); }
  return vec2f(x, y);
}
// each new agent: a dissolving school's fish (the first its genome, the rest fresh mutations — siblings; its body, gonads by ripeness)
// or a split's half (the school copied, brain state and all)
@compute @workgroup_size(64) fn s_fill(@builtin(global_invocation_id) g: vec3u) {
  let t = g.x; let tot = u32(GL[G_NBORN2]); if (t >= tot) { return; }
  var lo = 0u; var hi = u32(GL[G_NLIST2]);
  while (hi - lo > 1u) { let mid = (lo + hi) / 2u; if (IND[REC_LIST2 + 2u * mid + 1u] <= t) { lo = mid; } else { hi = mid; } }
  let a = IND[REC_LIST2 + 2u * lo]; let st = IND[REC_LIST2 + 2u * lo + 1u]; let m = t - st; let k = gau(A_k, a);
  let s = U.n + t; let id = glu(G_NEXTID) + t;
  if (gai(A_birth, a) == 2) {   // a split: the school copied, n halved (fish3 _split)
    for (var f = 0u; f < NAF; f++) { A[f * U.cap + s] = A[f * U.cap + a]; }
    for (var r = 0u; r < NBR; r++) { BR[r * U.cap + s] = BR[r * U.cap + a]; }
    for (var r = 0u; r < NGN; r++) { GN[r * U.cap + s] = GN[r * U.cap + a]; }
    sau(A_id, s, id); let hn = ga(A_n, a) / 2.0; sa(A_n, s, hn);
    sa(A_cons, s, ga(A_cons, a) / 2.0); sa(A_consMax, s, ga(A_consMax, a) / 2.0);
    sa(A_yaw, s, ga(A_yaw, a) + select(-0.7, 0.7, rnd(id, 92u, 0u) < 0.5)); sai(A_prey, s, -1); sai(A_threat, s, -1); sai(A_birth, s, -1); sai(A_claim, s, -1);
    return;
  }
  // a dissolving school's fish m: its genome (or a sibling's mutation), then add()'s fields, then the school's body
  let first = m == 0u; let p = nearSpotS(ga(A_x, a), ga(A_y, a), 0.8, id);
  for (var e = 0u; e < NG; e++) { var w = GN[e * U.cap + a]; if (!first) { w = mutW(id, e, w); } GN[e * U.cap + s] = w; }
  for (var e = 0u; e < NGENES; e++) { var v = GN[(NG + e) * U.cap + a]; if (!first) { v = mutGene(id, e, v); } GN[(NG + e) * U.cap + s] = v; }
  newAgentS(s, k, id, p.x, p.y, gau(A_age, a));
  sa(A_L, s, ga(A_L, a)); sa(A_W, s, ga(A_W, a)); sau(A_gen, s, gau(A_gen, a)); sa(A_hue, s, ga(A_hue, a));
  sau(A_lake, s, gau(A_lake, a)); sa(A_lhx, s, ga(A_lhx, a)); sa(A_lhy, s, ga(A_lhy, a)); sa(A_hx, s, ga(A_hx, a)); sa(A_hy, s, ga(A_hy, a)); sau(A_inLake, s, gau(A_inLake, a));
  sa(A_gut, s, ga(A_gut, a)); sa(A_gutE, s, ga(A_gutE, a));
  let mat = (gau(A_flags, a) & FL_MATURE) != 0u; var fl = gau(A_flags, s); if (mat) { fl |= FL_MATURE; } sau(A_flags, s, fl);
  let W = ga(A_W, a); var gon = 0.0; if (mat) { gon = gsiOf(k, gau(A_sex, s)) * W * clamp(ga(A_gon, a) / max(1e-9, gsiOf(k, 2u) * W), 0.0, 1.0); } sa(A_gon, s, gon);
  sa(A_mateCd, s, ga(A_mateCd, a)); sa(A_lastSpawnD, s, ga(A_lastSpawnD, a));
  settle(s, k);
  let bed = max(0.05, depthAt(p.x, p.y)); sa(A_bed, s, bed); sa(A_z, s, clamp(ga(A_z, a), F3_ZTOP, max(F3_ZTOP, bed - F3_ZBOT)));
  sa(A_spd, s, spv(k, S_cruise) * ga(A_L, a) / 100.0);
  if (first) { add64(&TL, T_SOLO + 2u * k, f32(gau(A_bid, a)), TSCALE); }
}
@compute @workgroup_size(128) fn s_retire(@builtin(global_invocation_id) g: vec3u) {   // (the dissolved schools gone; the split ones halved)
  let i = g.x; if (i >= U.n) { return; }
  let b = gai(A_birth, i); if (b == 1) { sau(A_flags, i, gau(A_flags, i) & ~FL_ALIVE); sa(A_n, i, 0.0); }
  else if (b == 2) { let hn = ga(A_n, i) / 2.0; sa(A_n, i, ga(A_n, i) - hn); sa(A_cons, i, ga(A_cons, i) / 2.0); sa(A_consMax, i, ga(A_consMax, i) / 2.0); }
}
@compute @workgroup_size(1) fn s_count() { let nb = u32(GL[G_NBORN2]); GL[G_N] = f32(U.n + nb); GL[G_NEXTID] = bitcast<f32>(glu(G_NEXTID) + nb); }
// a new agent's own fields (fish3 add + _traits; the genome already in GN) — the school's body is copied after
fn newAgentS(s: u32, k: u32, id: u32, x: f32, y: f32, age: u32) {
  for (var f = 0u; f < NAF; f++) { A[f * U.cap + s] = 0.0; }
  for (var r = 0u; r < NBR; r++) { BR[r * U.cap + s] = 0.0; }
  sau(A_id, s, id); sau(A_k, s, k); sa(A_n, s, 1.0);
  sa(A_x, s, x); sa(A_y, s, y); sa(A_yaw, s, rnd(id, 81u, 0u) * 6.283185307179586); sau(A_age, s, age);
  let sex = select(1u, 0u, rnd(id, 81u, 1u) < 0.5); sau(A_sex, s, sex);
  for (var r = 0u; r < NW2; r++) { BR[r * U.cap + s] = GN[(W2OFF + r) * U.cap + s]; }
  retrait(s, k);
  var fl = FL_ALIVE;
  sai(A_spYr, s, -1); sai(A_runYr, s, -1); sai(A_prey, s, -1); sai(A_threat, s, -1); sai(A_mate, s, -1); sai(A_c, s, -1); sai(A_j, s, -1); sai(A_jb, s, -1); sai(A_claim, s, -1); sai(A_birth, s, -1);
  sa(A_xo, s, 1.0); sa(A_xt, s, 15.0); sa(A_uAvg, s, spv(k, S_uRoutine)); sa(A_fd, s, -1.0); sa(A_td, s, -1.0);
  // the brook's users (fish3 add: by where it lives)
  let b0 = bodyAt(x, y); var lk = UPPER; if (b0 == LOWER) { lk = LOWER; } else if (b0 != UPPER) { lk = select(LOWER, UPPER, nearestBP(x, y) <= i32(BLAST) / 2); }
  var lh = vec2f(x, y); if (b0 != lk) { lh = vec2f(stf(O_bLakeNear + 2u * lk), stf(O_bLakeNear + 2u * lk + 1u)); }
  let dB = length(select(bp(BLAST), bp(0u), lk == UPPER) - lh);
  if (spv(k, S_sbBrook) > 0.0 && dB < F3_BROOK_NEAR && rnd(id, 81u, 2u) < spv(k, S_sbBrook)) { fl |= FL_BROOKIE; }
  if (spv(k, S_sbSiteBrook) > 0.0 && (spv(k, S_brookRes) > 0.0 || dB < F3_BROOK_RUN)) { fl |= FL_BROOKRUN; }
  sau(A_flags, s, fl);
}
// ---- the young's schools meet and merge (fish3 _mergeYoy: in their own grid cell, a species and size, never a guarded brood) ----
@compute @workgroup_size(128) fn s_yMark(@builtin(global_invocation_id) g: vec3u) {
  let q = g.x; if (q >= U.ny) { return; }
  syu(Y_qPrey, q, NONE);
  if ((gyu(Y_flags, q) & 1u) == 0u || gyi(Y_gref, q) >= 0) { return; }
  let x = gy(Y_x, q); let y = gy(Y_y, q); let z = gy(Y_z, q); let k = gyu(Y_k, q); let L = gy(Y_L, q);
  let gx = clamp(i32((x - GX0) / F3_HC), 0, i32(HHX) - 1); let gyy = clamp(i32((y - GY0) / F3_HC), 0, i32(HHY) - 1); let c = u32(gyy) * HHX + u32(gx);
  var rank = 0u; var t = YHS[c];
  for (; t < YHS[c + 1u]; t++) { let b = YHI[t]; if (b == q) { break; } if (yMergeable(b, k)) { rank += 1u; } }
  if (((rank + (U.blk / u32(F3_MERGE_EVERY))) & 1u) != 0u) { return; }
  for (t = t + 1u; t < YHS[c + 1u]; t++) {
    let b = YHI[t]; if (!yMergeable(b, k)) { continue; }
    let d = vec3f(gy(Y_x, b) - x, gy(Y_y, b) - y, gy(Y_z, b) - z); let Lb = gy(Y_L, b);
    if (dot(d, d) <= F3_YOY_MERGE_R * F3_YOY_MERGE_R && select(Lb / L, L / Lb, L > Lb) <= 1.25) { syu(Y_qPrey, q, b); }
    return;
  }
}
fn yMergeable(b: u32, k: u32) -> bool { return (gyu(Y_flags, b) & 1u) != 0u && gyi(Y_gref, b) < 0 && gyu(Y_k, b) == k; }
@compute @workgroup_size(128) fn s_yMerge(@builtin(global_invocation_id) g: vec3u) {
  let q = g.x; if (q >= U.ny) { return; }
  let b = gyu(Y_qPrey, q); if (b == NONE) { return; }
  let na = gy(Y_n, q); let nb = gy(Y_n, b); let tot = na + nb; let wb = nb / tot;
  if (rnd(gyu(Y_id, q), 93u, gyu(Y_id, b)) < wb) {
    for (var r = 0u; r < NGN; r++) { YG[r * U.ycap + q] = YG[r * U.ycap + b]; }
    syu(Y_gen, q, gyu(Y_gen, b)); sy(Y_hue, q, gy(Y_hue, b));
  }
  sy(Y_W, q, gy(Y_W, q) + (gy(Y_W, b) - gy(Y_W, q)) * wb); let L = gy(Y_L, q) + (gy(Y_L, b) - gy(Y_L, q)) * wb; sy(Y_L, q, L);
  syu(Y_age, q, u32(round(f32(gyu(Y_age, q)) + (f32(gyu(Y_age, b)) - f32(gyu(Y_age, q))) * wb))); sy(Y_bdep, q, L * spv(gyu(Y_k, q), S_depthR)); sy(Y_n, q, tot);
  syu(Y_flags, b, gyu(Y_flags, b) & ~1u); sy(Y_n, b, 0.0);
}
`;

// a kernel module: the constants, the uniforms, the core bindings, a family's bindings, the helpers and the kernels
// ============================================================ THE VIEW (G3: the browser's fast-forward on the GPU engine)
// What the view draws, gathered on the GPU so that only it comes back: the agents and young schools within R of where the camera
// looks (in the order the threads find them — the view keys them by id), and the slot of the fish or school the data card follows.
// VO: [0] agents found, [1] schools found, [2] the followed one's slot (atomicMin; none 0xFFFFFFFF), then maxF agents of VF words
// (x y z yaw pitch L k n spd bed id school bodyMul slot), then maxY schools of VY words (x y z L k n id bed guarded slot)
export const VIEW_BINDINGS = /* wgsl */`
struct ViewP { cx: f32, cy: f32, r2: f32, maxF: u32, maxY: u32, selId: u32, selKind: u32, p: u32 };
@group(1) @binding(0) var<storage, read> Y: array<f32>;
@group(1) @binding(1) var<storage, read_write> VO: array<atomic<u32>>;
@group(1) @binding(2) var<uniform> VP: ViewP;
const VF: u32 = 14u; const VY: u32 = 10u; const VO_HEAD: u32 = 16u;`;
export const VIEW = /* wgsl */`
fn vput(o: u32, v: f32) { atomicStore(&VO[o], bitcast<u32>(v)); }
fn gyv(f: u32, q: u32) -> f32 { return Y[f * U.ycap + q]; }
@compute @workgroup_size(256) fn v_drawn(@builtin(global_invocation_id) g: vec3u) {
  let i = g.x;
  if (i < U.n) {
    let fl = gau(A_flags, i);
    if ((fl & FL_ALIVE) != 0u) {
      if (VP.selKind == 0u && gau(A_id, i) == VP.selId) { atomicMin(&VO[2], i); }
      let dx = ga(A_x, i) - VP.cx; let dy = ga(A_y, i) - VP.cy;
      if (dx * dx + dy * dy < VP.r2) {
        let r = atomicAdd(&VO[0], 1u);
        if (r < VP.maxF) {
          let o = VO_HEAD + r * VF;
          vput(o, ga(A_x, i)); vput(o + 1u, ga(A_y, i)); vput(o + 2u, ga(A_z, i)); vput(o + 3u, ga(A_yaw, i)); vput(o + 4u, ga(A_pitch, i));
          vput(o + 5u, ga(A_L, i)); vput(o + 6u, f32(gau(A_k, i))); vput(o + 7u, ga(A_n, i)); vput(o + 8u, ga(A_spd, i)); vput(o + 9u, ga(A_bed, i));
          atomicStore(&VO[o + 10u], gau(A_id, i)); vput(o + 11u, select(0.0, 1.0, (fl & FL_SCHOOL) != 0u)); vput(o + 12u, ga(A_bodyMul, i)); atomicStore(&VO[o + 13u], i);
        }
      }
    }
  }
  if (i < U.ny) {
    if ((bitcast<u32>(gyv(Y_flags, i)) & 1u) != 0u) {
      if (VP.selKind == 1u && bitcast<u32>(gyv(Y_id, i)) == VP.selId) { atomicMin(&VO[2], i); }
      let dx = gyv(Y_x, i) - VP.cx; let dy = gyv(Y_y, i) - VP.cy;
      if (dx * dx + dy * dy < VP.r2) {
        let r = atomicAdd(&VO[1], 1u);
        if (r < VP.maxY) {
          let o = VO_HEAD + VP.maxF * VF + r * VY;
          let gr = bitcast<i32>(gyv(Y_gref, i)); var guarded = 0.0;
          if (gr >= 0 && u32(gr) < U.n) { let gq = u32(gr); if ((gau(A_flags, gq) & FL_ALIVE) != 0u && ga(A_nt, gq) > 0.0) { guarded = 1.0; } }
          vput(o, gyv(Y_x, i)); vput(o + 1u, gyv(Y_y, i)); vput(o + 2u, gyv(Y_z, i)); vput(o + 3u, gyv(Y_L, i)); vput(o + 4u, f32(bitcast<u32>(gyv(Y_k, i))));
          vput(o + 5u, gyv(Y_n, i)); atomicStore(&VO[o + 6u], bitcast<u32>(gyv(Y_id, i))); vput(o + 7u, gyv(Y_bed, i)); vput(o + 8u, guarded); atomicStore(&VO[o + 9u], i);
        }
      }
    }
  }
}
`;

export function moduleSource(consts, family, ...parts) { return [consts, UNIFORMS, CORE_BINDINGS, family, COMMON, ...parts].join('\n'); }
