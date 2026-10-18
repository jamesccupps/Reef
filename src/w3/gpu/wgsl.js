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
};`;
// the uniform block's layout for the host (same order; 4 bytes each)
export const UNI_FIELDS = ['n:u', 'cap:u', 'ny:u', 'ycap:u', 'blk:u', 'seed:u', 'dtU:u', 'yr:i', 'dt', 'yf', 'lux0', 'luxB0', 'luxB1', 'luxB2', 'att', 'clar',
  'sun', 'night', 'migD', 'migC', 'timeD', 'yr0D', 'siteYr:i', 'plants:u', 'lit:u', 'siCoord:u', 'siGrid:u', 'siNX:u'];

export const CORE_BINDINGS = /* wgsl */`
@group(0) @binding(0) var<uniform> U: Uni;
@group(0) @binding(1) var<storage, read_write> A: array<f32>;
@group(0) @binding(2) var<storage, read> ST: array<f32>;
@group(0) @binding(3) var<storage, read> WD: array<f32>;
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
@group(1) @binding(5) var<uniform> GP: GridP;`;
export const GRID = /* wgsl */`
fn hcOf(x: f32, y: f32) -> u32 {   // fish3 _hc: the lakes' grid
  let gx = clamp(i32((x - GX0) / F3_HC), 0, i32(HHX) - 1); let gy = clamp(i32((y - GY0) / F3_HC), 0, i32(HHY) - 1);
  return u32(gy) * HHX + u32(gx);
}
@compute @workgroup_size(256) fn g_clear(@builtin(global_invocation_id) g: vec3u) { if (g.x < GP.nCells) { atomicStore(&CNT[g.x], 0u); } }
@compute @workgroup_size(256) fn g_count(@builtin(global_invocation_id) g: vec3u) {
  let i = g.x; if (i >= GP.nItems) { return; }
  var c = 0xFFFFFFFFu;
  if (GP.kind == 0u) { if ((gau(A_flags, i) & FL_ALIVE) != 0u || true) { c = hcOf(ga(A_x, i), ga(A_y, i)); } }
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
// GL (f32) and GS (pairs) slots
const G_CNT: u32 = 0u;     // + k: fish of each species (Σ n)
const G_RUNIN: u32 = 16u;  // + k: ripe fish holding one of the brook's nest sites
const G_BIO: u32 = 32u;    // g of fish (followed + young)
const G_CAND: u32 = 33u;   // any runner at the brook's mouth this block (k_admit runs)
const G_JUVD: u32 = 48u;   // + k: the young's density (/m²)
const GS_CNT: u32 = 0u; const GS_RUNIN: u32 = 32u; const GS_BIO: u32 = 64u; const GS_CAND: u32 = 66u; const GS_JUVD: u32 = 80u;
const CSCALE: f32 = 1e6; const BSCALE: f32 = 1e3;`;
// tallies: [pairs] — cross by species, settle, trips, stranded deaths; more as the kernels come (index helpers)
export const TALLY = /* wgsl */`
const T_CROSS: u32 = 0u;      // + 2k
const T_SETTLE: u32 = 32u;
const T_TRIPS: u32 = 64u;
const T_STRAND: u32 = 96u;
const TSCALE: f32 = 1000.0;   // tallies of fish in thousandths
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
  var nt = ga(A_nt, i); if (nt > 0.0) { nt -= dt; sa(A_nt, i, nt); }
  if ((fl & FL_MATURE) == 0u && matureAt(i, k)) { fl |= FL_MATURE; }
  let x = ga(A_x, i); let y = ga(A_y, i); let z = ga(A_z, i);
  let bed = max(0.05, depthAt(x, y)); sa(A_bed, i, bed);
  let c = colAt(x, y); sai(A_c, i, c);
  if (c < 0) { add64(&TL, T_STRAND + 2u * k, ga(A_n, i), TSCALE); sau(A_flags, i, fl & ~FL_ALIVE); return; }
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
  sa(A_cover, i, max(max(F3_SHALLOW_REFUGE * clamp((0.8 - bed) / 0.6, 0.0, 1.0), select(0.0, wd(W_coverC + cu), U.plants != 0u)), rif));
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
  return (wd(W_zooD + j) * zooExposed(j, 0u) + wd(W_zooC + j) * (1.0 - PLANKTON_COPE_ESCAPE) * zooExposed(j, 1u)) * v * PLANKTON_UGL;
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
fn modeOf(k: u32, fl: u32, nt: f32, T: f32, x: f32, y: f32) -> Mode {
  if (nt > 0.0) { return Mode(0.0, 99.0, 0.0, 0.05, BROOD_HOVER); }
  if ((fl & FL_RIPE) != 0u) { return Mode(spv(k, S_sbBot0), spv(k, S_sbBot1), 0.0, spv(k, S_sbH), 0.9); }
  if ((fl & FL_BROOKIE) != 0u && brookSeason(T) && bodyAt(x, y) == BROOK) { return Mode(0.2, 1.3, 0.0, 0.25, 0.6); }
  let nf = 1.0 - smooth01(0.02, 0.3, U.sun); let wf = clamp((9.0 - T) / 4.0, 0.0, 1.0);
  let lo = bl(spv(k, S_hD0), spv(k, S_hN0), nf); let hi = bl(spv(k, S_hD1), spv(k, S_hN1), nf);
  var m: Mode; m.b0 = bl(lo, spv(k, S_hW0), wf); m.b1 = bl(hi, spv(k, S_hW1), wf);
  let same = spv(k, S_hDv) == spv(k, S_hNv); let hb = bl(spv(k, S_hDh), spv(k, S_hNh), nf);
  if (wf > 0.5) { m.v = spv(k, S_hWv); m.h = spv(k, S_hWh); }
  else if (nf < 0.5) { m.v = spv(k, S_hDv); m.h = select(spv(k, S_hDh), hb, same); }
  else { m.v = spv(k, S_hNv); m.h = select(spv(k, S_hNh), hb, same); }
  m.act = bl(bl(spv(k, S_hDa), spv(k, S_hNa), nf), spv(k, S_hWa), wf);
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
fn nearestBP(x: f32, y: f32) -> i32 { var b = 0; var bd = 1e9; for (var q = 0u; q < BPN; q++) { let d = length(bp(q) - vec2f(x, y)); if (d < bd) { bd = d; b = i32(q); } } return b; }
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
  let m = modeOf(k, fl, nt, ga(A_T, i), x0, y0);
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
  let cm = cmaxB(bs, Wg, T); sa(A_cm, i, cm);
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
  let act = routineActivity(bs, Wg, T) * exp(BIOE_SWIM * max(0.0, uAvg - spv(k, S_uRoutine)));
  let K = ga(A_K, i); let depress = 1.0 - 0.3 * clamp((0.9 - K) / (0.9 - 0.55), 0.0, 1.0);
  let rO2 = respStd(bs, Wg, T) * ga(A_metabMul, i) * act * depress * select(1.0, BROOD_GUARD_METAB, ga(A_nt, i) > 0.0) * Wg;
  sa(A_rO2, i, rO2 / DAY);
  var net = C - Fz - Ux - Sd - rO2 * OXYCAL * dd;
  let ed = energyDensity(bs, Wg); let gsi = gsiOf(k, gau(A_sex, i)); var gon = ga(A_gon, i);
  if (net > 0.0 && (fl & FL_MATURE) != 0u && gon < gsi * Wg) { let toG = min(net * BIOE_REPRO_ALLOC, (gsi * Wg - gon) * ed); gon += toG / ed; net -= toG; }
  else if (net <= 0.0 && gon > 0.0 && K < BIOE_K_RESORB) { let fromG = min(gon * ed, -net); gon -= fromG / ed; net += fromG; }
  sa(A_gon, i, gon);
  let W = max(1e-6, Wg + net / ed); sa(A_W, i, W);
  if (W > stdWeight(k, ga(A_L, i))) { sa(A_L, i, lengthFor(k, W)); }
  settle(i, k);
}
`;

// a kernel module: the constants, the uniforms, the core bindings, a family's bindings, the helpers and the kernels
export function moduleSource(consts, family, ...parts) { return [consts, UNIFORMS, CORE_BINDINGS, family, COMMON, ...parts].join('\n'); }
