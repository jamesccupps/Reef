// gpufish.js — THE FISH ON THE GPU (docs/GPU_SIM.md, G1): the WebGPU host of the coarse-block engine. Browser and worker only
// (navigator.gpu) — the gate's Node never loads it; tools/gpu/g1_check.html checks every kernel against fish3.js on the same fish.
// It holds a Fish3's agents (and, as the kernels come, its young) on the GPU as struct-of-arrays buffers (layout.js), the lakes'
// statics, the water each block, and runs the block's kernels (wgsl.js) in fish3's order.
import { packAgents, packYoy, packStatics, packWater, packSites, waterLayout, wgslConstants, materialize, statsAdd, NTALLY_PAIRS, readAgent, readYoy, NAF, NYF, YF, NBR, NGN, NG, NGENES, AF, FL } from './layout.js';
import { UNIFORMS, UNI_FIELDS, CORE_BINDINGS, COMMON, GRID_BINDINGS, GRID, SIM_BINDINGS, TALLY, PRE, LEARN_K, SENSE, BRAIN_K, BOOK, MOVE, FB4, BODY, FEED_K, HAZ, YOY_BINDINGS, YOY, BIRTH_BINDINGS, BIRTH, COMPACT_BINDINGS, COMPACT, SCHOOL_BINDINGS, SCHOOL, VIEW_BINDINGS, VIEW, moduleSource } from './wgsl.js';
import { F3, KEYS3, NW2_3, HID3, OUT3, WILDK } from '../fish3.js';
import { FRY, ICE, EGG3, ALEWIFE } from '../../config.js';
import { GEO, BODIES } from '../geometry.js';
import { CLOCK3 } from '../clock3.js';

const ST_ = () => GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC;
export const HHX = Math.ceil((GEO.XMAX - GEO.X0) / F3.HC), HHY = Math.ceil((GEO.YMAX - GEO.Y0) / F3.HC);
const NTALLY = 2 * NTALLY_PAIRS;   // tally words (pairs: layout.js TALLY_BLOCKS)

export class GpuFish {
  static async device() {
    if (!globalThis.navigator?.gpu) throw new Error('no WebGPU');
    const ad = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
    if (!ad) throw new Error('no GPU adapter');
    const L = ad.limits, dev = await ad.requestDevice({ requiredLimits: { maxStorageBufferBindingSize: L.maxStorageBufferBindingSize, maxBufferSize: L.maxBufferSize,
      maxStorageBuffersPerShaderStage: L.maxStorageBuffersPerShaderStage, maxComputeWorkgroupStorageSize: L.maxComputeWorkgroupStorageSize } });
    dev.lost.then(i => console.error('GPU device lost:', i.message));
    { let nErr = 0; dev.addEventListener('uncapturederror', e => { if (nErr++ < 8) console.error('WebGPU:', e.error.message); }); }
    return { dev, info: ad.info };
  }
  // F: a Fish3 (its statics: bedOf, slopes, footprints…); env its water. cap: agent capacity (default 1.3 × the fish)
  constructor(dev, F, env, { cap = 0, ycap = 0, seed = 1 } = {}) {
    this.dev = dev; this.F = F; this.env = env; this.seed = seed >>> 0; this.blk = 0; this.ny = 0;
    const n0 = F.fish.filter(a => a.alive).length; this.cap = cap || Math.max(1024, Math.ceil(n0 * 1.3));
    const y0 = F.yoy.filter(q => q.alive).length; this.ycap = ycap || Math.max(4096, Math.ceil(y0 * 3) + 16384, Math.ceil(0.4 * n0));   // (June's spawnings: the true lakes went from 18k to 57k schools in four weeks)
    this.STL = packStatics(F, env); this.WL = waterLayout(env);
    this.consts0 = wgslConstants(this.STL, this.WL, { G: env.G }) + `\nconst HHX: u32 = ${HHX}u;\nconst HHY: u32 = ${HHY}u;\nconst BROOK_A: f32 = ${F.brookA};\nconst LAKE_M2: f32 = ${F.lakeM2};\nconst LAKE_HA: f32 = ${F.lakeHa};\nconst LAKE_Z1: f32 = ${BODIES[0].max};\nconst LAKE_Z2: f32 = ${BODIES[1].max};\nconst OUT_X: f32 = ${env.G.cx[env.outCol]};\nconst OUT_Y: f32 = ${env.G.cy[env.outCol]};\nconst OUT_R: f32 = ${1.5 * env.G.COL};\nconst BROOK_AREA: f32 = ${F._target ? (F._brookArea || (F._target({ brookRes: true, perM2: 1 }), F._brookArea)) : 0};`;
    this._acc();
    // the footprint's CSR by radius class (fish3 forageR: a few distinct radii)
    this.fpSelect = Array.from({ length: this.STL.nFp }, (_, r) => r ? `if (r == ${r}u) { o0 = O_fFp${r}0; oL = O_fFp${r}L; }` : '').join(' ');
    this.NH = HHX * HHY;
    const d = dev, B = this.B = {};
    B.U = d.createBuffer({ size: 4 * UNI_FIELDS.length + 15 & ~15, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    B.A = d.createBuffer({ size: 4 * NAF * this.cap, usage: ST_() });
    B.ST = d.createBuffer({ size: this.STL.ST.byteLength, usage: ST_() }); d.queue.writeBuffer(B.ST, 0, this.STL.ST);
    B.WD = d.createBuffer({ size: 4 * this.WL.size, usage: ST_() });
    B.BR = d.createBuffer({ size: 4 * NBR * this.cap, usage: ST_() });
    B.GN = d.createBuffer({ size: 4 * NGN * this.cap, usage: ST_() });
    // the grid
    B.CNT = d.createBuffer({ size: 4 * (this.NH + 1), usage: ST_() }); B.HS = d.createBuffer({ size: 4 * (this.NH + 1), usage: ST_() });
    this.levels = []; { let n = this.NH, off = 0; for (;;) { const b = Math.ceil(n / 512); this.levels.push({ n, b }); if (b <= 1) break; n = b; } }
    let so = 0; for (const L of this.levels) { L.sums = so; so += L.b; L.dstNext = so; so += L.b; }
    B.SUMS = d.createBuffer({ size: 4 * Math.max(16, so), usage: ST_() });
    B.TL = d.createBuffer({ size: 4 * NTALLY, usage: ST_() }); B.GL = d.createBuffer({ size: 4 * 1024, usage: ST_() });
    B.RC = d.createBuffer({ size: 4 * this.rcWords, usage: ST_() });
    // the young: their struct of arrays, genomes
    B.Y = d.createBuffer({ size: 4 * NYF * this.ycap, usage: ST_() }); B.YG = d.createBuffer({ size: 4 * NGN * this.ycap, usage: ST_() });
    B.INDA = d.createBuffer({ size: 16, usage: GPUBufferUsage.INDIRECT | GPUBufferUsage.COPY_DST });   // (the dispatch's size, copied out: a buffer can't be both)
    B.CEN = d.createBuffer({ size: 4 * 24 * 16, usage: ST_() }); B.YHS = d.createBuffer({ size: 4 * (this.NH + 1), usage: ST_() });
    B.SI = d.createBuffer({ size: 4 * 65536, usage: ST_() });
    // the view's gather (G3): its parameters and what it found
    this.VMAXF = 30000; this.VMAXY = 20000; this.VHEAD = 16;
    B.VP = d.createBuffer({ size: 32, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    B.VO = d.createBuffer({ size: 4 * (this.VHEAD + 14 * this.VMAXF + 10 * this.VMAXY), usage: ST_() });
    B.ONE = d.createBuffer({ size: 4 * Math.max(NAF, NYF, NGENES + OUT3.length + 8), usage: ST_() });
    this._allocScratch(); this.uploadSites();
    this._layouts(); this._pipelines();
  }
  // the buffers sized by the arrays' room whose contents last a block at most: the grid's lists, the claims, the snapshot, the feeding's
  // sums, the recruit lists, compacting's map and second set
  _allocScratch() {
    const d = this.dev, B = this.B;
    B.HI = d.createBuffer({ size: 4 * this.cap, usage: ST_() }); B.HC = d.createBuffer({ size: 4 * this.cap, usage: ST_() });
    B.GS = d.createBuffer({ size: 4 * (512 + 8193 + 2 * this.cap + this.ycap), usage: ST_() }); B.PX = d.createBuffer({ size: 16 * this.cap, usage: ST_() });
    B.ACC = d.createBuffer({ size: 4 * this.accWords, usage: ST_() });
    B.IND = d.createBuffer({ size: 4 * (16 + 4 * this.ycap + 16), usage: ST_() });
    B.MAP = d.createBuffer({ size: 4 * (this.cap + this.ycap), usage: ST_() });
    B.A2 = d.createBuffer({ size: B.A.size, usage: ST_() }); B.BR2 = d.createBuffer({ size: B.BR.size, usage: ST_() }); B.GN2 = d.createBuffer({ size: B.GN.size, usage: ST_() });
    B.Y2 = d.createBuffer({ size: B.Y.size, usage: ST_() }); B.YG2 = d.createBuffer({ size: B.YG.size, usage: ST_() });
    B.YHI = d.createBuffer({ size: 4 * this.ycap, usage: ST_() }); B.YHC = d.createBuffer({ size: 4 * this.ycap, usage: ST_() });
  }
  static SCRATCH = ['HI', 'HC', 'GS', 'PX', 'ACC', 'IND', 'MAP', 'A2', 'BR2', 'GN2', 'Y2', 'YG2', 'YHI', 'YHC'];
  // MORE ROOM (the spring's recruits, June's spawnings — the kernels hold back what has no room and say how much they wanted): the
  // arrays re-made larger, each field's column copied to its new stride, the scratch re-made, the pipelines rebuilt (the feeding's
  // per-school sums are laid out by ycap)
  async grow(cap2 = this.cap, ycap2 = this.ycap) {
    cap2 = Math.max(Math.ceil(cap2), this.cap); ycap2 = Math.max(Math.ceil(ycap2), this.ycap); if (cap2 === this.cap && ycap2 === this.ycap) return false;
    await this.dev.queue.onSubmittedWorkDone();
    const d = this.dev, B = this.B, enc = d.createCommandEncoder(), old = [];
    const restride = (key, rows, c0, c1, n) => { const nb = d.createBuffer({ size: 4 * rows * c1, usage: ST_() }); if (n > 0) for (let r = 0; r < rows; r++) enc.copyBufferToBuffer(B[key], 4 * r * c0, nb, 4 * r * c1, 4 * n); old.push(B[key]); B[key] = nb; };
    if (cap2 > this.cap) { restride('A', NAF, this.cap, cap2, this.n); restride('BR', NBR, this.cap, cap2, this.n); restride('GN', NGN, this.cap, cap2, this.n); }
    if (ycap2 > this.ycap) { restride('Y', NYF, this.ycap, ycap2, this.ny); restride('YG', NGN, this.ycap, ycap2, this.ny); }
    d.queue.submit([enc.finish()]); await d.queue.onSubmittedWorkDone();
    for (const b of old) b.destroy(); for (const k of GpuFish.SCRATCH) B[k].destroy();
    this.cap = cap2; this.ycap = ycap2; this._acc(); this._allocScratch(); this._layouts(); this._pipelines();
    this.grew = (this.grew || 0) + 1;
    return true;
  }
  // room ahead of the next block: what the kernels held back, and a margin (a spring's recruits come in a block or two)
  async ensureRoom(needA = 0, needY = 0) {
    const n = this.n, ny = this.ny;
    const cap2 = needA > 0 || n > 0.95 * this.cap ? Math.max(1.25 * this.cap, 1.15 * (n + 2 * needA)) : this.cap;
    const ycap2 = needY > 0 || ny > 0.95 * this.ycap ? Math.max(1.25 * this.ycap, 1.15 * (ny + 2 * needY)) : this.ycap;
    return this.grow(cap2, ycap2);
  }
  // the feeding's per-cell accumulators (pairs: 64-bit) and shares, by kind — their offsets as constants (the per-school ones by ycap)
  _acc() {
    const env = this.env;
    { const NC = env.G.NCELL, NCo = env.G.NC; let o = 0; const ac = {}; for (const [k, len] of [['TB', NC], ['TL', NC], ['TS', NC], ['TSM', NC], ['RC', NC], ['SURF', NCo], ['ZD', NC], ['ZC', NC], ['SED', NC], ['O2', NC], ['SEDADD', NC],
        ['YZD', NC], ['YZC', NC], ['YZR', NC], ['YZS', NC], ['YWS', NC], ['YWL', NC], ['YB', NC], ['YSED', NC], ['YD', this.ycap], ['YT', this.ycap], ['YP', this.ycap], ['YPT', this.ycap],
        ['TBW', NC], ['TLW', NC], ['TSW', NC], ['TSMW', NC], ['SURFW', NCo], ['ZDW', NC], ['ZCW', NC], ['YZDW', NC], ['YZCW', NC], ['YZRW', NC], ['YZSW', NC], ['YWSW', NC], ['YWLW', NC], ['YBW', NC],
        // (stage Y1) the prey table per column × species × length class: available n, Σ n·L, Σ n·W, Σ n·depth; the followed fish's
        // requests and takes; the young schools' requests and takes
        ...['BAV', 'BSB', 'BSL', 'BSW', 'BSD', 'BREQ', 'BGOT', 'BREQY', 'BGOTY'].map(k => [k, NCo * KEYS3.length * FRY.NS * (F3.YDEPTH ? 4 : 1)])]) { ac[k] = o; o += 2 * len; }   // (…W: the wants weighted by their appetite's elasticity — bShare)
      this.accWords = o; let r = 0; const rc = {}; for (const [k, len] of [['B', NC], ['L', NC], ['S', NC], ['SM', NC], ['C', NC], ['SURF', NCo], ['ZD', NC], ['ZC', NC], ['SED', NC], ['YD', NC], ['YC', NC], ['YR', NC], ['YS', NC], ['YWS', NC], ['YWL', NC], ['YB', NC], ['YSED', NC]]) { rc[k] = r; r += len; } this.rcWords = r; this.acOff = ac;
      this.consts = this.consts0 + '\n' + Object.entries(ac).map(([k, v]) => `const AC_${k}: u32 = ${v}u;`).join('\n') + '\n' + Object.entries(rc).map(([k, v]) => `const R_${k}: u32 = ${v}u;`).join('\n'); }
  }
  _layouts() {
    const d = this.dev, S = 'storage', R = 'read-only-storage', C = GPUShaderStage.COMPUTE;
    const L = (types) => d.createBindGroupLayout({ entries: types.map((t, i) => ({ binding: i, visibility: C, buffer: { type: t } })) });
    this.L0 = L(['uniform', S, R, S, S, S]);
    this.LG = L([S, S, S, S, S, 'uniform', S]);
    this.LY = L([R, R, S, S, S, S, S, S, S]);
    this.LB = L([R, R, S, S, R, S, S, S, S, S]);
    this.LC = L([S, S, S, S, S, S, S, S, S, S]);
    this.LSc = L([R, R, R, R, S, S, S, S, S, S]);
    this.LS = L([R, R, S, S, R, S, S, S, S]);
    this.LV = L([R, S, 'uniform']);
    const B = this.B;
    this.bgV = d.createBindGroup({ layout: this.LV, entries: [B.Y, B.VO, B.VP].map((b, i) => ({ binding: i, resource: { buffer: b } })) });
    this.bg0 = d.createBindGroup({ layout: this.L0, entries: [B.U, B.A, B.ST, B.WD, B.BR, B.GN].map((b, i) => ({ binding: i, resource: { buffer: b } })) });
    this.bgS = d.createBindGroup({ layout: this.LS, entries: [B.HS, B.HI, B.TL, B.GL, B.SI, B.GS, B.PX, B.ACC, B.RC].map((b, i) => ({ binding: i, resource: { buffer: b } })) });
    // the grid's per-dispatch parameters (GridP: nItems, nCells, off, lvlN, src, dst, kind, p) — a small uniform buffer each
    const gp = (vals) => { const b = d.createBuffer({ size: 32, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST }); d.queue.writeBuffer(b, 0, Uint32Array.from(vals)); return b; };
    const bgG = (u, hs = B.HS, hi = B.HI, hc = B.HC) => d.createBindGroup({ layout: this.LG, entries: [B.CNT, hs, hi, hc, B.SUMS, u, B.Y].map((b, i) => ({ binding: i, resource: { buffer: b } })) });
    this.bgY = d.createBindGroup({ layout: this.LY, entries: [B.YHS, B.YHI, B.TL, B.GL, B.Y, B.YG, B.GS, B.ACC, B.RC].map((b, i) => ({ binding: i, resource: { buffer: b } })) });
    this.bgC = d.createBindGroup({ layout: this.LC, entries: [B.MAP, B.A2, B.BR2, B.GN2, B.Y, B.YG, B.Y2, B.YG2, B.GL, B.CEN].map((b, i) => ({ binding: i, resource: { buffer: b } })) });
    this.bgSc = d.createBindGroup({ layout: this.LSc, entries: [B.HS, B.HI, B.YHS, B.YHI, B.Y, B.YG, B.GL, B.GS, B.TL, B.IND].map((b, i) => ({ binding: i, resource: { buffer: b } })) });
    this.bgB = d.createBindGroup({ layout: this.LB, entries: [B.HS, B.HI, B.TL, B.GL, B.SI, B.GS, B.PX, B.Y, B.YG, B.IND].map((b, i) => ({ binding: i, resource: { buffer: b } })) });
    const NONE = 0xFFFFFFFF;
    this.gpItems = gp([0, this.NH, 0, 0, 0, 0, 0, 0]); this.bgItems = bgG(this.gpItems);
    this.bgScan = this.levels.map((Lv, l) => bgG(gp([0, this.NH, Lv.sums, Lv.n, l ? this.levels[l - 1].sums : NONE, l ? this.levels[l - 1].dstNext : NONE, 0, 0])));
    this.bgAdd = this.levels.slice(1).map((Lv, q) => { const l = q + 1; return bgG(gp([0, this.NH, 0, this.levels[l - 1].n, this.levels[l - 1].dstNext, l - 1 ? this.levels[l - 2].dstNext : NONE, 0, 0])); });
    // the young's grid: the same kernels on their own starts, items and cells (kind 1)
    this.gpYItems = gp([0, this.NH, 0, 0, 0, 0, 1, 0]); this.bgYItems = bgG(this.gpYItems, B.YHS, B.YHI, B.YHC);
    this.bgYScan = this.levels.map((Lv, l) => bgG(gp([0, this.NH, Lv.sums, Lv.n, l ? this.levels[l - 1].sums : NONE, l ? this.levels[l - 1].dstNext : NONE, 1, 0]), B.YHS, B.YHI, B.YHC));
    this.bgYAdd = this.levels.slice(1).map((Lv, q) => { const l = q + 1; return bgG(gp([0, this.NH, 0, this.levels[l - 1].n, this.levels[l - 1].dstNext, l - 1 ? this.levels[l - 2].dstNext : NONE, 1, 0]), B.YHS, B.YHI, B.YHC); });
  }
  _pipelines() {
    const d = this.dev, P = this.P = {};
    const mk = (src, layouts, entries) => {
      const mod = d.createShaderModule({ code: src });
      mod.getCompilationInfo().then(info => { for (const m of info.messages) if (m.type === 'error') console.error('WGSL', m.lineNum, m.linePos, m.message, '\n', src.split('\n')[m.lineNum - 1]); });
      const layout = d.createPipelineLayout({ bindGroupLayouts: layouts });
      for (const e of entries) P[e] = d.createComputePipeline({ layout, compute: { module: mod, entryPoint: e } });
    };
    mk(moduleSource(this.consts, GRID_BINDINGS, GRID), [this.L0, this.LG], ['g_clear', 'g_count', 'g_scan', 'g_add', 'g_cursor', 'g_cursor2', 'g_scatter', 'g_sort']);
    mk(moduleSource(this.consts, SIM_BINDINGS, TALLY, PRE, LEARN_K, SENSE, BRAIN_K, BOOK, MOVE, FB4, BODY, FEED_K.replace('FP_SELECT', this.fpSelect), HAZ), [this.L0, this.LS],
      ['k_pre', 'k_learn', 'k_sense', 'k_brain', 'k_snap', 'k_sums', 'k_glob', 'k_admit', 'k_move', 'k_body', 'k_feed0', 'k_strike', 'k_strikeWin', 'k_strikeApply',
       'k_fieldReq', 'k_fieldCell', 'k_fieldTake', 'k_fieldApply', 'k_sedReq', 'k_sedCell', 'k_sedTake', 'k_feedEnd', 'k_o2', 'k_hazards', 'k_o2Apply', 'k_wildA', 'k_wildRho', 'k_ale', 'k_aleFinA', 'k_aleFin']);
    mk(moduleSource(this.consts, YOY_BINDINGS, TALLY, FB4, YOY), [this.L0, this.LY],
      ['y_snap', 'y_table', 'k_eatYoyReq', 'k_eatYoyGet', 'k_eatYoyApply', 'y_juv', 'y_juvFin', 'y_move', 'y_feedReq', 'y_zooAcc', 'y_fieldCell', 'y_feedTake', 'y_fieldApply', 'y_preyApply', 'y_mort', 'y_target', 'y_wildA', 'y_egg']);
    mk(moduleSource(this.consts, BIRTH_BINDINGS, TALLY, FB4, BIRTH), [this.L0, this.LB], ['b_mate', 'b_spawn', 'b_spawnWin', 'b_slots', 'b_spawnFill', 'b_recruitWalk', 'b_recruitFill', 'b_count']);
    mk(moduleSource(this.consts, COMPACT_BINDINGS, COMPACT), [this.L0, this.LC], ['c_walk', 'c_gatherA', 'c_gatherY', 'c_census']);
    mk(moduleSource(this.consts, SCHOOL_BINDINGS, TALLY, FB4, SCHOOL), [this.L0, this.LSc], ['s_hist', 's_cut', 's_mark', 's_merge', 's_slots', 's_fill', 's_retire', 's_count', 's_yMark', 's_yMerge']);
    mk(moduleSource(this.consts, VIEW_BINDINGS, VIEW), [this.L0, this.LV], ['v_drawn']);
  }
  // ---------- data in ----------
  uploadAgents(fish = this.F.fish) {
    const P = packAgents(fish, this.cap); this.n = P.n; this.setGlobalsU({ 36: this.F.nextId >>> 0 }); this.dev.queue.writeBuffer(this.B.GL, 4 * 40, Float32Array.of(Math.min(3e38, this.F.soloL))); this._soloAt = this.F._soloAt; this.slotOf = P.slot; this.bySlot = []; for (const [a, i] of P.slot) this.bySlot[i] = a;
    const q = this.dev.queue; q.writeBuffer(this.B.A, 0, P.A); q.writeBuffer(this.B.BR, 0, P.BR); q.writeBuffer(this.B.GN, 0, P.GN);
    this.dev.queue.writeBuffer(this.gpItems, 0, Uint32Array.from([this.n, this.NH]));
    return P;
  }
  // the spawning grounds (after fish3 _siteSub re-chooses them each spring)
  uploadSites() {
    const S = packSites(this.F); if (S.SI.byteLength > this.B.SI.size) { this.B.SI.destroy(); this.B.SI = this.dev.createBuffer({ size: S.SI.byteLength + 4096, usage: ST_() }); if (this.LS) this._layouts(); }
    this.dev.queue.writeBuffer(this.B.SI, 0, S.SI); this.siCoord = S.coordOff; this.siGrid = S.gridOff; this.siNX = S.sNX; this._sitesYr = this.F._siteYr;
  }
  uploadYoy(yoy = this.F.yoy) {
    const P = packYoy(yoy, this.ycap, this.slotOf); this.ny = P.n; this.ySlotOf = P.slot; this.yBySlot = []; for (const [q, i] of P.slot) this.yBySlot[i] = q;
    this.dev.queue.writeBuffer(this.B.Y, 0, P.Y); this.dev.queue.writeBuffer(this.B.YG, 0, P.YG); this.dev.queue.writeBuffer(this.gpYItems, 0, Uint32Array.from([this.ny, this.NH]));
    return P;
  }
  // (E8) NEW AGENTS FROM THE HOST between blocks (the alewives' run): packed at their own stride, each field's column written after the
  // live n (the arrays grown first if need be); the id counter past theirs
  async appendAgents(list) {
    const m = list.length; if (!m) return;
    if (this.n + m > this.cap) await this.grow(Math.max(1.25 * this.cap, 1.15 * (this.n + m)), this.ycap);
    const P = packAgents(list, m), q = this.dev.queue, n = this.n, cap = this.cap;
    for (let f = 0; f < NAF; f++) q.writeBuffer(this.B.A, 4 * (f * cap + n), P.A, f * m, m);
    for (let f = 0; f < NBR; f++) q.writeBuffer(this.B.BR, 4 * (f * cap + n), P.BR, f * m, m);
    for (let f = 0; f < NGN; f++) q.writeBuffer(this.B.GN, 4 * (f * cap + n), P.GN, f * m, m);
    this.n += m; this.setGlobalsU({ 36: this.F.nextId });
  }
  // a few of GL's words (u32 bit patterns) — the id counter
  setGlobalsU(map) { for (const [at, v] of Object.entries(map)) this.dev.queue.writeBuffer(this.B.GL, 4 * +at, Uint32Array.of(v)); }
  uploadWater() { this.W = packWater(this.F, this.env, this.WL, this.W); this.dev.queue.writeBuffer(this.B.WD, 0, this.W); }
  // the block's uniforms (dt s; lux0 now and the block's light luxB — as Fish3.step sets them)
  setUniforms(dt, { lux0, luxB } = {}) {
    const e = this.env, ch = e.chem, buf = new ArrayBuffer(4 * UNI_FIELDS.length + 15 & ~15), f = new Float32Array(buf), u = new Uint32Array(buf), i = new Int32Array(buf);
    const yf = e.yearFrac(), YEAR = CLOCK3.YEAR_LEN, l0 = lux0 ?? e.lux, lb = luxB || [l0, e.luxAhead(dt / 2), e.luxAhead(dt)];
    const V = { n: this.n, cap: this.cap, ny: this.ny, ycap: this.ycap, blk: this.blk, seed: this.seed, dtU: Math.round(dt), yr: Math.floor(e.time / YEAR), dt, yf, lux0: l0, luxB0: lb[0], luxB1: lb[1], luxB2: lb[2],
      att: ch.attenuation(), clar: ch.clarity(), sun: e.sun, night: e.isNight() ? 1 : 0, migD: ch._migD, migC: ch._migC, timeD: e.time / 86400, yr0D: Math.floor(e.time / YEAR) * YEAR / 86400,
      siteYr: this.F._siteYr ?? -1, plants: e.plants ? 1 : 0, lit: e.lit ? 1 : 0, siCoord: this.siCoord || 0, siGrid: this.siGrid || 0, siNX: this.siNX || 1, wY: e.lit ? e.lit.wY : 0, iceCut: e.iceCut ?? ICE.LIGHT_CUT, brookD: GEO.brookLevel ?? 1, wx: e.weather , aleP: ALEWIFE.ON ? (e.qFac < ALEWIFE.Q_MIN ? 0 : this.F._alePulse ? 2 : 1) : 0, aleQ: 0, ale2: 0, ale3: 0 };
    UNI_FIELDS.forEach((s, q) => { const [n, t] = s.split(':'); if (t === 'u') u[q] = V[n] >>> 0; else if (t === 'i') i[q] = V[n] | 0; else f[q] = V[n]; });
    this.dev.queue.writeBuffer(this.B.U, 0, buf);
  }
  // ---------- kernels ----------
  _pass(enc, pipe, groups, n, wg) { const p = enc.beginComputePass(); p.setPipeline(pipe); groups.forEach((g, q) => p.setBindGroup(q, g)); p.dispatchWorkgroups(Math.ceil(n / wg)); p.end(); }
  encodeGrid(enc) {
    const P = this.P, g0 = this.bg0;
    this._pass(enc, P.g_clear, [g0, this.bgItems], this.NH + 1, 256);
    this._pass(enc, P.g_count, [g0, this.bgItems], this.n, 256);
    this.levels.forEach((Lv, l) => this._pass(enc, P.g_scan, [g0, this.bgScan[l]], Lv.b * 256, 256));
    for (let l = this.levels.length - 1; l >= 1; l--) this._pass(enc, P.g_add, [g0, this.bgAdd[l - 1]], this.levels[l - 1].n, 256);
    this._pass(enc, P.g_cursor, [g0, this.bgItems], this.NH + 1, 256);
    this._pass(enc, P.g_cursor2, [g0, this.bgItems], this.NH, 256);
    this._pass(enc, P.g_scatter, [g0, this.bgItems], this.n, 256);
    this._pass(enc, P.g_sort, [g0, this.bgItems], this.NH, 256);
  }
  encodeKernel(enc, name, wg = 128) { this._pass(enc, this.P[name], [this.bg0, this.bgS], this.n, wg); }
  encodeY(enc, name, wg = 64, nItems = this.ny) { this._pass(enc, this.P[name], [this.bg0, this.bgY], nItems, wg); }
  encodeYGrid(enc) {
    const P = this.P, g0 = this.bg0;
    this._pass(enc, P.g_clear, [g0, this.bgYItems], this.NH + 1, 256); this._pass(enc, P.g_count, [g0, this.bgYItems], this.ny, 256);
    this.levels.forEach((Lv, l) => this._pass(enc, P.g_scan, [g0, this.bgYScan[l]], Lv.b * 256, 256));
    for (let l = this.levels.length - 1; l >= 1; l--) this._pass(enc, P.g_add, [g0, this.bgYAdd[l - 1]], this.levels[l - 1].n, 256);
    this._pass(enc, P.g_cursor, [g0, this.bgYItems], this.NH + 1, 256); this._pass(enc, P.g_cursor2, [g0, this.bgYItems], this.NH, 256);
    this._pass(enc, P.g_scatter, [g0, this.bgYItems], this.ny, 256); this._pass(enc, P.g_sort, [g0, this.bgYItems], this.NH, 256);
  }
  // the block's bookkeeping after k_pre: the snapshot, the sums → GL, the brook's nest sites
  encodeBook(enc) {
    enc.clearBuffer(this.B.GS);
    this.encodeKernel(enc, 'k_snap', 256); this.encodeKernel(enc, 'k_sums', 256); this.encodeY(enc, 'y_snap', 256);
    this._pass(enc, this.P.k_glob, [this.bg0, this.bgS], 64, 64); this._pass(enc, this.P.k_admit, [this.bg0, this.bgS], 256, 256);
  }
  // the grid again after the fish moved, and the snapshot (strikes and the young find their neighbours where they got to)
  encodeRegrid(enc) { this.encodeGrid(enc); this.encodeKernel(enc, 'k_snap', 256); }
  _cells(enc, name) { this._pass(enc, this.P[name], [this.bg0, this.bgS], Math.max(this.env.G.NCELL, this.env.G.NC), 256); }
  // FEEDING (fish3 _feed): strikes, then the fields (the bed and weeds, the surface, the zooplankton), the organic layer; hunger, a meal
  encodeFeed(enc) {
    enc.clearBuffer(this.B.ACC);
    // (F3.STRIKE2 — fish3 _feed: the young first, the bulk of a summer predator's food, and the strikes at the followed fish with the room left)
    const strikes = () => { this.encodeKernel(enc, 'k_strike', 64); this.encodeKernel(enc, 'k_strikeWin'); this.encodeKernel(enc, 'k_strikeApply'); };
    const young = () => { if (this.yoyOn !== false) { this.encodeY(enc, 'y_table', 256); this._pass(enc, this.P.k_eatYoyReq, [this.bg0, this.bgY], this.n, 64); this._pass(enc, this.P.k_eatYoyGet, [this.bg0, this.bgY], this.n, 128); this.encodeY(enc, 'k_eatYoyApply', 256); } };
    this.encodeKernel(enc, 'k_feed0'); if (F3.STRIKE2) { young(); strikes(); } else { strikes(); young(); }
    this.encodeKernel(enc, 'k_fieldReq', 64); this._cells(enc, 'k_fieldCell'); this.encodeKernel(enc, 'k_fieldTake', 64); this._cells(enc, 'k_fieldApply');
    this.encodeKernel(enc, 'k_sedReq'); this._cells(enc, 'k_sedCell'); this.encodeKernel(enc, 'k_sedTake'); this.encodeKernel(enc, 'k_feedEnd');
  }
  // THE WILDLIFE (fish3 _wildPrep, F3.WILD: at the step's start, before k_pre): the host's demands → GL (block), the fish and young it can
  // reach summed, its hazard per unit of accessibility → GL for k_hazards and y_mort
  encodeWild(enc) {
    if (!F3.WILD) return;
    enc.clearBuffer(this.B.GS, 4 * 128, 4 * 2 * WILDK.length); this.encodeKernel(enc, 'k_wildA', 128); if (this.yoyOn !== false) this.encodeY(enc, 'y_wildA', 128);
    this._pass(enc, this.P.k_wildRho, [this.bg0, this.bgS], 1, 1);
  }
  wildDemand() { if (F3.WILD) this.dev.queue.writeBuffer(this.B.GL, 4 * 128, Float32Array.from(this.F.wildDemand())); }   // (GL[G_WD + w], g/s)
  // O₂ breathed and the hazards (fish3 _live's end, _hazards); the dead's bodies to the bed
  encodeHaz(enc) { this.encodeKernel(enc, 'k_o2'); this.encodeKernel(enc, 'k_hazards'); this._cells(enc, 'k_o2Apply'); }
  // THE YOUNG'S BLOCK (fish3 _stepYoy): their density, each school's move, its feeding tick (requests → the cells' shares → what each got,
  // its energy budget → the cells emptied), its breath and deaths, its next spot
  encodeYoy(enc) {
    const NC = this.env.G.NCELL, a = this.acOff;
    enc.clearBuffer(this.B.ACC, 4 * a.O2, 4 * 2 * NC); enc.clearBuffer(this.B.ACC, 4 * a.SEDADD, 4 * 2 * NC);
    this.encodeY(enc, 'y_juv', 256); this._pass(enc, this.P.y_juvFin, [this.bg0, this.bgY], 64, 64);
    if (EGG3.ON) this.encodeY(enc, 'y_egg');   // (E3: the clutches on the bed)
    this.encodeY(enc, 'y_move'); this.encodeY(enc, 'y_feedReq'); this.encodeY(enc, 'y_zooAcc');
    this._pass(enc, this.P.y_fieldCell, [this.bg0, this.bgY], NC, 256); this.encodeY(enc, 'y_feedTake'); this._pass(enc, this.P.y_fieldApply, [this.bg0, this.bgY], NC, 256);
    this.encodeY(enc, 'y_preyApply', 256); this.encodeY(enc, 'y_mort'); this._cells(enc, 'k_o2Apply'); this.encodeY(enc, 'y_target');
  }
  async readYoyArr() { return new Float32Array(await this.read(this.B.Y)); }
  _passB(enc, name, n, wg) { this._pass(enc, this.P[name], [this.bg0, this.bgB], n, wg); }
  // SPAWNING (fish3 _spawn, after the fish fed): mates, the spawn and its claims, the newborn schools' slots (one workgroup walks the fish
  // in order), the schools made and the parents spent
  encodeSpawn(enc) {
    enc.clearBuffer(this.B.GS, 4 * 512, 4 * this.cap); enc.clearBuffer(this.B.GS, 4 * 64, 4 * 4);
    this._passB(enc, 'b_mate', this.n, 64); this._passB(enc, 'b_spawn', this.n, 64); this._passB(enc, 'b_spawnWin', this.n, 128);
    this._passB(enc, 'b_slots', 256, 256); this._passB(enc, 'b_spawnFill', this.n, 64);
  }
  // RECRUITMENT (fish3 _recruit, after the young's step): one workgroup walks the young in order, then a thread a new agent
  encodeRecruit(enc) {
    this._passB(enc, 'b_recruitWalk', 256, 256);
    enc.copyBufferToBuffer(this.B.IND, 0, this.B.INDA, 0, 12);
    const p = enc.beginComputePass(); p.setPipeline(this.P.b_recruitFill); p.setBindGroup(0, this.bg0); p.setBindGroup(1, this.bgB); p.dispatchWorkgroupsIndirect(this.B.INDA, 0); p.end();
    this._passB(enc, 'b_count', 1, 1);
  }
  // THE SCHOOLS (fish3 _schools + _mergeYoy, at a step's end every MERGE_EVERY): a submit of its own at the next block's start (its new
  // agents append after the counts are known); the own-brain cut every SOLO_EVERY days
  async schools() {
    const e = this.env; this.setUniforms(this._dt || 1752, this._lux || {});
    const cut = e.time - (this._soloAt ?? -1e18) > F3.SOLO_EVERY * 86400; if (cut) this._soloAt = e.time;
    this.dev.queue.writeBuffer(this.gpItems, 0, Uint32Array.from([this.n, this.NH])); this.dev.queue.writeBuffer(this.gpYItems, 0, Uint32Array.from([this.ny, this.NH]));
    await this.run(enc => {
      enc.clearBuffer(this.B.GS, 4 * 512); this.encodeGrid(enc); this.encodeYGrid(enc);
      const sc = (name, n, wg) => this._pass(enc, this.P[name], [this.bg0, this.bgSc], n, wg);
      if (cut) { sc('s_hist', this.n, 256); sc('s_cut', 1, 1); }
      sc('s_mark', this.n, 128); sc('s_merge', this.n, 128); sc('s_slots', 256, 256);
      enc.copyBufferToBuffer(this.B.IND, 16, this.B.INDA, 0, 12);
      const p = enc.beginComputePass(); p.setPipeline(this.P.s_fill); p.setBindGroup(0, this.bg0); p.setBindGroup(1, this.bgSc); p.dispatchWorkgroupsIndirect(this.B.INDA, 0); p.end();
      sc('s_retire', this.n, 128); sc('s_count', 1, 1); sc('s_yMark', this.ny, 128); sc('s_yMerge', this.ny, 128);
    });
    const g = new Float32Array(await this.read(this.B.GL, 256)), u = new Uint32Array(g.buffer); this.n = g[34]; this.F.nextId = u[36]; this.F.soloL = g[40];
    await this.ensureRoom(g[45] || 0, 0);
  }
  // COMPACTING (fish3 filters its lists): a submit of its own, the counts read back after
  async compact() {
    this.setUniforms(this._dt || 1752, this._lux || {});
    await this.run(enc => {
      const p = enc.beginComputePass(); p.setPipeline(this.P.c_walk); p.setBindGroup(0, this.bg0); p.setBindGroup(1, this.bgC); p.dispatchWorkgroups(2); p.end();
      this._pass(enc, this.P.c_gatherA, [this.bg0, this.bgC], this.n, 128); this._pass(enc, this.P.c_gatherY, [this.bg0, this.bgC], this.ny, 128);
      const B = this.B; enc.copyBufferToBuffer(B.A2, 0, B.A, 0, B.A.size); enc.copyBufferToBuffer(B.BR2, 0, B.BR, 0, B.BR.size); enc.copyBufferToBuffer(B.GN2, 0, B.GN, 0, B.GN.size);
      enc.copyBufferToBuffer(B.Y2, 0, B.Y, 0, B.Y.size); enc.copyBufferToBuffer(B.YG2, 0, B.YG, 0, B.YG.size);
    });
    const g = new Float32Array(await this.read(this.B.GL, 256)); this.n = g[34]; this.ny = g[35];
    this.dev.queue.writeBuffer(this.gpItems, 0, Uint32Array.from([this.n, this.NH])); this.dev.queue.writeBuffer(this.gpYItems, 0, Uint32Array.from([this.ny, this.NH]));
  }
  // THE CENSUS (fish3 census): per species, the followed fish and the young
  async census() {
    this.setUniforms(this._dt || 1752, this._lux || {});
    await this.run(enc => { enc.clearBuffer(this.B.CEN); this._pass(enc, this.P.c_census, [this.bg0, this.bgC], Math.max(this.n, this.ny), 256); });
    const u = new Uint32Array(await this.read(this.B.CEN)), v = (k, f, sc) => (u[k * 24 + 2 * f] + u[k * 24 + 2 * f + 1] * 4294967296) / sc, out = {};
    KEYS3.forEach((key, k) => { const r = { n: v(k, 0, 1e3), g: v(k, 1, 1e3), L: v(k, 2, 1e3), cons: v(k, 3, 1e6), consMax: v(k, 4, 1e6), mature: v(k, 5, 1e3), agents: v(k, 6, 1), yoyN: v(k, 7, 1e3), yoyG: v(k, 8, 1e3), yoyL: v(k, 9, 1e3), yoySchools: v(k, 10, 1), K: v(k, 11, 1e3) };
      r.K /= Math.max(1e-9, r.n);
      r.L /= Math.max(1e-9, r.n); r.yoyL /= Math.max(1e-9, r.yoyN); r.p = r.cons / Math.max(1e-12, r.consMax); r.kgHa = r.g / 1000 / this.F.lakeHa; r.perHa = r.n / this.F.lakeHa; r.meanW = r.g / Math.max(1e-9, r.n); out[key] = r; });
    return out;
  }
  // ONE COARSE BLOCK of dt s (fish3 step with mv undefined, dt > FINE_MAX): the CPU's part first (the plant spawners' grounds each spring,
  // the water up, the uniforms), then every kernel in fish3's order in one submit, then the counts and the water back. The caller steps
  // the water model after (as with Fish3: F.step(dt); env.step(dt)), or passes that step as `during`: it runs while the GPU works, and
  // the fish's takes are added to the water after it as differences (G3: the CPU's water step hidden behind the GPU's block)
  async block(dt, during = null) {
    const e = this.env, F = this.F, YEAR = CLOCK3.YEAR_LEN, yf = e.yearFrac(), yr = Math.floor(e.time / YEAR);
    // (this.stage: what the block is waiting on — a watchdog's report if one never returns)
    this.stage = 'schools'; if (this.blk > 0 && this.blk % F3.MERGE_EVERY === 0) await this.schools();   // (fish3: at the end of every MERGE_EVERY-th step — here the next one's start)
    this.stage = 'compact'; if ((this.blk + 1) % (this.compactEvery || 10) === 0) await this.compact();
    this.stage = 'prepare';
    if (ALEWIFE.ON) { F._aleDay(); const arr = F._aleArrivals(dt); if (arr.length) await this.appendAgents(arr); }   // (E8: the run in at the outlet)
    F._yr = yr; if (yf >= F3.SITE_YF && yf < 0.5 && F._siteYr !== yr) { F._siteYr = yr; F._siteSub(); this.uploadSites(); }
    this.uploadWater(); this._dt = dt; this._lux = { lux0: e.lux, luxB: [e.lux, e.luxAhead(dt / 2), e.luxAhead(dt)] }; this.setUniforms(dt, this._lux); this.wildDemand();
    this.dev.queue.writeBuffer(this.gpItems, 0, Uint32Array.from([this.n, this.NH])); this.dev.queue.writeBuffer(this.gpYItems, 0, Uint32Array.from([this.ny, this.NH]));
    const done = this.run(enc => {
      this.encodeGrid(enc); this.encodeYGrid(enc); this.encodeWild(enc);
      if (ALEWIFE.ON) { enc.clearBuffer(this.B.GS, 4 * 192, 4 * 16); this.encodeKernel(enc, 'k_ale', 128); this._pass(enc, this.P.k_aleFinA, [this.bg0, this.bgS], 1, 1); }   // (E8: the adults' block — fish3 _alewife at the step's start)
      this.encodeKernel(enc, 'k_pre'); this.encodeBook(enc);
      this.encodeKernel(enc, 'k_learn'); this.encodeKernel(enc, 'k_sense'); this.encodeKernel(enc, 'k_brain', 64); this.encodeKernel(enc, 'k_move', 64);
      // (fish3's coarse block in two passes, F3.FRESH_HASH: the grid and the snapshot rebuilt where every fish got to — strikes and mate
      // searches find the others there; PX then holds the moved places for all, so the kernels' list-order reads agree with fish3's)
      if (F3.FRESH_HASH) this.encodeRegrid(enc);
      this.encodeKernel(enc, 'k_body');
      this.encodeFeed(enc); this.encodeSpawn(enc); this.encodeHaz(enc); this.encodeYoy(enc);
      if (ALEWIFE.ON) this._pass(enc, this.P.k_aleFin, [this.bg0, this.bgS], 1, 1);   // (E8: the block's sums to GL)
      this.encodeRecruit(enc);
    });
    if (during) during();
    this.stage = 'kernels'; await done;
    this.stage = 'counts'; const c = await this.readCounts(); this.n = c.n; this.ny = c.ny; F.nextId = c.nextId;
    if (ALEWIFE.ON && c.ale) F._aleSums(c.ale);   // (E8: the block's alewives — stats, their N and P)
    if (this.bio > 0) e.chem.fishKgHa = this.bio / 1000 / F.lakeHa;   // (the zooplankton's kairomone level and the mussels' hosts: the fish and young at the block's start, as fish3's hash sets it)
    this.stage = 'water'; await this.applyWater();
    this.stage = 'room'; await this.ensureRoom(c.needA, c.needY); this.stage = 'idle';
    this.blk++; F.time += dt; F.stepNo++;
    return c;
  }
  // the counts after a block (agents, young schools, the id counter, births): the host's next dispatches
  async readCounts() {
    const g = new Float32Array(await this.read(this.B.GL, ALEWIFE.ON ? 4 * 208 : 256)), u = new Uint32Array(g.buffer);   // (E8: GL[G_ALE 200..207], the alewives' block sums)
    this.cnt = Float64Array.from(g.subarray(0, KEYS3.length)); this.bio = g[32];
    return { n: g[34] || this.n, ny: g[35] || this.ny, nextId: u[36], born: g[37], recruits: g[38], needA: g[43] || 0, needY: g[44] || 0, ale: ALEWIFE.ON ? Array.from(g.subarray(200, 208)) : null };
  }
  // what the fish did to the water, back into the env (the fields they eat from and breathe) — as DIFFERENCES from what was uploaded:
  // the water model may have stepped meanwhile (block's `during`), and a cell no fish touched keeps its exact (float64) value
  async applyWater() {
    const W = new Float32Array(await this.read(this.B.WD)), W0 = this.W, o = this.WL.offs, e = this.env, ch = e.chem, lit = e.lit;
    const put = (dst, sec) => { const a = o[sec]; for (let i = 0; i < dst.length; i++) { const d = W[a + i] - W0[a + i]; if (d !== 0) dst[i] = Math.max(0, dst[i] + d); } };
    put(ch.o2, 'o2'); put(ch.zooD, 'zooD'); put(ch.zooC, 'zooC'); put(ch.zooR, 'zooR'); put(ch.zooS, 'zooS'); put(ch.benth, 'benth'); put(ch.sedOM, 'sedOM');
    if (lit) { put(lit.surfA, 'surfA'); put(lit.surfT, 'surfT'); put(lit.L, 'litL'); put(lit.sn, 'litSn'); put(lit.S, 'litS'); put(lit.crA, 'litCrA'); put(lit.crY, 'litCrY'); }
    return W;
  }
  async readGlobals() { return new Float32Array(await this.read(this.B.GL)); }
  run(fn) { const enc = this.dev.createCommandEncoder(); fn(enc); this.dev.queue.submit([enc.finish()]); return this.dev.queue.onSubmittedWorkDone(); }
  clearTallies() { this.dev.queue.writeBuffer(this.B.TL, 0, new Uint32Array(NTALLY)); }
  // every agent's intake tallies (cons, consMax) zeroed: the census's ration p is then over the time since (diagnostics)
  resetIntake() { return this.run(enc => { enc.clearBuffer(this.B.A, 4 * AF.cons * this.cap, 4 * this.cap); enc.clearBuffer(this.B.A, 4 * AF.consMax * this.cap, 4 * this.cap); }); }
  // ---------- data out ----------
  async read(buf, bytes = buf.size, off = 0) {
    const rb = this.dev.createBuffer({ size: bytes, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST });
    const enc = this.dev.createCommandEncoder(); enc.copyBufferToBuffer(buf, off, rb, 0, bytes); this.dev.queue.submit([enc.finish()]);
    await rb.mapAsync(GPUMapMode.READ); const out = rb.getMappedRange().slice(0); rb.unmap(); rb.destroy(); return out;
  }
  // chosen fields of the live slots (the agents' 0..n − 1, or with young = true the young schools' 0..ny − 1), by name — the year
  // runner's snapshot tallies (length at age, the brook's fish: docs/review/PLAN.md item 1). Each comes back as the f32 rows' bits;
  // a u32 or i32 field is read through new Uint32Array(v.buffer, v.byteOffset, v.length)
  async readFields(names, young = false) {
    const buf = young ? this.B.Y : this.B.A, cap = young ? this.ycap : this.cap, n = young ? this.ny : this.n, map = young ? YF : AF, out = {};
    if (n <= 0) { for (const nm of names) out[nm] = new Float32Array(0); return out; }
    const rb = this.dev.createBuffer({ size: 4 * names.length * n, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST });
    const enc = this.dev.createCommandEncoder(); names.forEach((nm, r) => enc.copyBufferToBuffer(buf, 4 * map[nm] * cap, rb, 4 * r * n, 4 * n));
    this.dev.queue.submit([enc.finish()]); await rb.mapAsync(GPUMapMode.READ); const all = new Float32Array(rb.getMappedRange().slice(0)); rb.unmap(); rb.destroy();
    names.forEach((nm, r) => { out[nm] = all.subarray(r * n, (r + 1) * n); }); return out;
  }
  async readAgents() { const [A, BR, GN] = await Promise.all([this.read(this.B.A), this.read(this.B.BR), this.read(this.B.GN)]); return { A: new Float32Array(A), BR: new Float32Array(BR), GN: new Float32Array(GN) }; }
  // the grid's fullest cells (diagnostics: g_sort orders each cell by a Shell sort — its cost ~ the count^1.25; an insertion sort hung the GPU at ~n² in crowded cells)
  async gridLoad() {
    const HS = new Uint32Array(await this.read(this.B.HS)); let max = 0, at = -1, big = 0;
    for (let c = 0; c < this.NH; c++) { const k = HS[c + 1] - HS[c]; if (k > max) { max = k; at = c; } if (k > 256) big++; }
    return { max, at, big, x: at >= 0 ? GEO.X0 + (at % HHX + 0.5) * F3.HC : 0, y: at >= 0 ? GEO.Y0 + (Math.floor(at / HHX) + 0.5) * F3.HC : 0 };
  }
  async readGrid() { const [HS, HI, HC] = await Promise.all([this.read(this.B.HS), this.read(this.B.HI), this.read(this.B.HC)]); return { HS: new Uint32Array(HS), HI: new Uint32Array(HI), HC: new Uint32Array(HC) }; }
  async readTallies() { const t = new Uint32Array(await this.read(this.B.TL)); const out = new Float64Array(NTALLY / 2); for (let q = 0; q < out.length; q++) out[q] = t[2 * q] + t[2 * q + 1] * 4294967296; return out; }
  // the first `n` columns of `rows` field-major rows (stride `stride`) packed to stride n — the live slots only, read back in one go
  async readRows(buf, rows, stride, n) {
    if (n <= 0) return new Float32Array(0);
    const rb = this.dev.createBuffer({ size: 4 * rows * n, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST });
    const enc = this.dev.createCommandEncoder(); for (let r = 0; r < rows; r++) enc.copyBufferToBuffer(buf, 4 * r * stride, rb, 4 * r * n, 4 * n);
    this.dev.queue.submit([enc.finish()]); await rb.mapAsync(GPUMapMode.READ); const out = new Float32Array(rb.getMappedRange().slice(0)); rb.unmap(); rb.destroy(); return out;
  }
  destroy() { for (const b of Object.values(this.B)) b.destroy(); }

  // ---------- THE HAND-OVERS AND THE VIEW (G3: the browser's fast-forward on the GPU engine) ----------
  // THE CPU SIM'S LAKES ONTO THE GPU (fast-forward starts): its live agents and young (room made first if they've outgrown the
  // arrays), the spawning grounds, the tallies cleared, the block counter (the random draws' key) from its step count
  async upload() {
    const F = this.F; let n = 0, ny = 0; for (const a of F.fish) if (a.alive) n++; for (const q of F.yoy) if (q.alive) ny++;
    if (n > 0.9 * this.cap || ny > 0.9 * this.ycap) { this.n = 0; this.ny = 0; await this.grow(Math.max(this.cap, 1.3 * n), Math.max(this.ycap, 1.5 * ny + 16384)); }
    this.uploadAgents(F.fish); this.uploadYoy(F.yoy); this.uploadSites(); this.clearTallies(); this.blk = F.stepNo;
    await this.dev.queue.onSubmittedWorkDone();
  }
  // THE LAKES BACK TO THE CPU SIM (fast-forward ends): every live agent and young school into F's objects (layout.js materialize —
  // the live slots only read back), the GPU's tallies into F.stats (then cleared), the own-brain cut's clock
  async download() {
    const F = this.F, n = this.n, ny = this.ny; await this.dev.queue.onSubmittedWorkDone();
    const [A, BR, GN, Y, YG, tl] = await Promise.all([this.readRows(this.B.A, NAF, this.cap, n), this.readRows(this.B.BR, NBR, this.cap, n), this.readRows(this.B.GN, NGN, this.cap, n),
      this.readRows(this.B.Y, NYF, this.ycap, ny), this.readRows(this.B.YG, NGN, this.ycap, ny), this.readTallies()]);
    const r = materialize(F, { A, BR, GN, Y, YG }, n, ny, n, ny, F.nextId);
    statsAdd(F.stats, tl, this.env.time); this.clearTallies(); F._soloAt = this._soloAt;
    return r;
  }
  // WHAT THE VIEW DRAWS: the agents and young schools within r of (cx, cy) — the view's arrays (render3/fishside3.js packDrawn's layout,
  // FISH_STRIDE 18 and YOY_STRIDE 12; the previous pose from `prev`, an id → pose map the caller keeps, else the pose now) — and the
  // slot of the followed fish or school (sel: [id, 'fish' | 'yoy'])
  async drawn(cx, cy, r, sel = null, prev = null) {
    const P = new ArrayBuffer(32), f = new Float32Array(P), u = new Uint32Array(P);
    f[0] = cx; f[1] = cy; f[2] = r * r; u[3] = this.VMAXF; u[4] = this.VMAXY; u[5] = sel ? sel[0] >>> 0 : 0xFFFFFFFF; u[6] = sel ? (sel[1] === 'yoy' ? 1 : 0) : 9;
    this.dev.queue.writeBuffer(this.B.VP, 0, P); this.dev.queue.writeBuffer(this.B.VO, 0, Uint32Array.of(0, 0, 0xFFFFFFFF, 0));
    this.setUniforms(this._dt || 1752, this._lux || {});
    await this.run(enc => this._pass(enc, this.P.v_drawn, [this.bg0, this.bgV], Math.max(this.n, this.ny, 1), 256));
    const V = new Float32Array(await this.read(this.B.VO)), Vu = new Uint32Array(V.buffer), H = this.VHEAD;
    const nf = Math.min(Vu[0], this.VMAXF), ny = Math.min(Vu[1], this.VMAXY), fb = new Float32Array(nf * 18), yb = new Float32Array(ny * 12), next = new Map(); let count = 0;
    for (let q = 0; q < nf; q++) {
      const o = H + q * 14, b = q * 18, id = Vu[o + 10], p = prev && prev.get(id);
      if (p) { fb[b] = p[0]; fb[b + 1] = p[1]; fb[b + 2] = p[2]; fb[b + 3] = p[3]; fb[b + 4] = p[4]; } else for (let t = 0; t < 5; t++) fb[b + t] = V[o + t];
      for (let t = 0; t < 10; t++) fb[b + 5 + t] = V[o + t];
      fb[b + 15] = id; fb[b + 16] = V[o + 11]; fb[b + 17] = V[o + 12]; count += V[o + 7];
      next.set(id, [V[o], V[o + 1], V[o + 2], V[o + 3], V[o + 4]]);
    }
    for (let q = 0; q < ny; q++) {
      const o = H + this.VMAXF * 14 + q * 10, b = q * 12, id = Vu[o + 6], p = prev && prev.get('y' + id);
      if (p) { yb[b] = p[0]; yb[b + 1] = p[1]; yb[b + 2] = p[2]; } else { yb[b] = V[o]; yb[b + 1] = V[o + 1]; yb[b + 2] = V[o + 2]; }
      yb[b + 3] = V[o]; yb[b + 4] = V[o + 1]; yb[b + 5] = V[o + 2]; yb[b + 6] = V[o + 3]; yb[b + 7] = V[o + 4]; yb[b + 8] = V[o + 5]; yb[b + 9] = id; yb[b + 10] = V[o + 7]; yb[b + 11] = V[o + 8];
      next.set('y' + id, [V[o], V[o + 1], V[o + 2]]);
    }
    return { fb, yb, nf, ny, count, poses: next, selSlot: Vu[2] === 0xFFFFFFFF ? -1 : Vu[2] };
  }
  // one agent's (or young school's) fields by slot — the data card's fish while the GPU holds the lakes (readAgent / readYoy's names),
  // with its genes and its brain's outputs
  async one(slot, kind = 'fish') {
    const enc = this.dev.createCommandEncoder(), B = this.B, rows = kind === 'yoy' ? NYF : NAF, stride = kind === 'yoy' ? this.ycap : this.cap, src = kind === 'yoy' ? B.Y : B.A;
    for (let f = 0; f < rows; f++) enc.copyBufferToBuffer(src, 4 * (f * stride + slot), B.ONE, 4 * f, 4);
    this.dev.queue.submit([enc.finish()]);
    const V = new Float32Array(await this.read(B.ONE, 4 * rows)), o = kind === 'yoy' ? readYoy(V, 1, 0) : readAgent(V, 1, 0);
    if (kind !== 'yoy') {
      const e2 = this.dev.createCommandEncoder();
      for (let g = 0; g < NGENES; g++) e2.copyBufferToBuffer(B.GN, 4 * ((NG + g) * this.cap + slot), B.ONE, 4 * g, 4);
      for (let q = 0; q < OUT3.length; q++) e2.copyBufferToBuffer(B.BR, 4 * ((NW2_3 + HID3 + q) * this.cap + slot), B.ONE, 4 * (NGENES + q), 4);
      this.dev.queue.submit([e2.finish()]);
      const W = new Float32Array(await this.read(B.ONE, 4 * (NGENES + OUT3.length))); o.genes = Array.from(W.subarray(0, NGENES)); o.out = Array.from(W.subarray(NGENES));
    }
    return o;
  }
  // a light copy of every live agent's census fields (the data page's sums: lake, place, size, age, the spawning run) — stride n
  async lite() {
    const n = this.n, F = ['k', 'flags', 'n', 'L', 'lake', 'x', 'y', 'age', 'runYr'], out = {};
    const rows = await Promise.all(F.map(name => this._row(name, n)));
    F.forEach((name, q) => { out[name] = rows[q]; }); out.n_ = n; return out;
  }
  async _row(name, n) {
    if (n <= 0) return new Float32Array(0);
    return new Float32Array(await this.read(this.B.A, 4 * n, 4 * AF[name] * this.cap));
  }
}
