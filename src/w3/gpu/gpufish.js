// gpufish.js — THE FISH ON THE GPU (docs/GPU_SIM.md, G1): the WebGPU host of the coarse-block engine. Browser and worker only
// (navigator.gpu) — the gate's Node never loads it; tools/gpu/g1_check.html checks every kernel against fish3.js on the same fish.
// It holds a Fish3's agents (and, as the kernels come, its young) on the GPU as struct-of-arrays buffers (layout.js), the lakes'
// statics, the water each block, and runs the block's kernels (wgsl.js) in fish3's order.
import { packAgents, packStatics, packWater, packSites, waterLayout, wgslConstants, NAF, NBR, NGN, AF, FL } from './layout.js';
import { UNIFORMS, UNI_FIELDS, CORE_BINDINGS, COMMON, GRID_BINDINGS, GRID, SIM_BINDINGS, TALLY, PRE, LEARN_K, SENSE, BRAIN_K, BOOK, MOVE, FB4, BODY, moduleSource } from './wgsl.js';
import { F3 } from '../fish3.js';
import { GEO } from '../geometry.js';
import { CLOCK3 } from '../clock3.js';

const ST_ = () => GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC;
export const HHX = Math.ceil((GEO.XMAX - GEO.X0) / F3.HC), HHY = Math.ceil((GEO.YMAX - GEO.Y0) / F3.HC);
const NTALLY = 512;   // tally words (pairs)

export class GpuFish {
  static async device() {
    if (!globalThis.navigator?.gpu) throw new Error('no WebGPU');
    const ad = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
    if (!ad) throw new Error('no GPU adapter');
    const L = ad.limits, dev = await ad.requestDevice({ requiredLimits: { maxStorageBufferBindingSize: L.maxStorageBufferBindingSize, maxBufferSize: L.maxBufferSize,
      maxStorageBuffersPerShaderStage: L.maxStorageBuffersPerShaderStage, maxComputeWorkgroupStorageSize: L.maxComputeWorkgroupStorageSize } });
    dev.lost.then(i => console.error('GPU device lost:', i.message));
    return { dev, info: ad.info };
  }
  // F: a Fish3 (its statics: bedOf, slopes, footprints…); env its water. cap: agent capacity (default 1.3 × the fish)
  constructor(dev, F, env, { cap = 0, seed = 1 } = {}) {
    this.dev = dev; this.F = F; this.env = env; this.seed = seed >>> 0; this.blk = 0;
    const n0 = F.fish.filter(a => a.alive).length; this.cap = cap || Math.max(1024, Math.ceil(n0 * 1.3));
    this.STL = packStatics(F, env); this.WL = waterLayout(env);
    this.consts = wgslConstants(this.STL, this.WL, { G: env.G }) + `\nconst HHX: u32 = ${HHX}u;\nconst HHY: u32 = ${HHY}u;\nconst BROOK_A: f32 = ${F.brookA};`;
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
    B.HI = d.createBuffer({ size: 4 * this.cap, usage: ST_() }); B.HC = d.createBuffer({ size: 4 * this.cap, usage: ST_() });
    this.levels = []; { let n = this.NH, off = 0; for (;;) { const b = Math.ceil(n / 512); this.levels.push({ n, b }); if (b <= 1) break; n = b; } }
    let so = 0; for (const L of this.levels) { L.sums = so; so += L.b; L.dstNext = so; so += L.b; }
    B.SUMS = d.createBuffer({ size: 4 * Math.max(16, so), usage: ST_() });
    B.TL = d.createBuffer({ size: 4 * NTALLY, usage: ST_() }); B.GL = d.createBuffer({ size: 4 * 1024, usage: ST_() });
    B.GS = d.createBuffer({ size: 4 * 256, usage: ST_() }); B.PX = d.createBuffer({ size: 16 * this.cap, usage: ST_() });
    B.SI = d.createBuffer({ size: 4 * 65536, usage: ST_() }); this.uploadSites();
    this._layouts(); this._pipelines();
  }
  _layouts() {
    const d = this.dev, S = 'storage', R = 'read-only-storage', C = GPUShaderStage.COMPUTE;
    const L = (types) => d.createBindGroupLayout({ entries: types.map((t, i) => ({ binding: i, visibility: C, buffer: { type: t } })) });
    this.L0 = L(['uniform', S, R, R, S, S]);
    this.LG = L([S, S, S, S, S, 'uniform']);
    this.LS = L([R, R, S, S, R, S, S]);
    const B = this.B;
    this.bg0 = d.createBindGroup({ layout: this.L0, entries: [B.U, B.A, B.ST, B.WD, B.BR, B.GN].map((b, i) => ({ binding: i, resource: { buffer: b } })) });
    this.bgS = d.createBindGroup({ layout: this.LS, entries: [B.HS, B.HI, B.TL, B.GL, B.SI, B.GS, B.PX].map((b, i) => ({ binding: i, resource: { buffer: b } })) });
    // the grid's per-dispatch parameters (GridP: nItems, nCells, off, lvlN, src, dst, kind, p) — a small uniform buffer each
    const gp = (vals) => { const b = d.createBuffer({ size: 32, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST }); d.queue.writeBuffer(b, 0, Uint32Array.from(vals)); return b; };
    const bgG = (u) => d.createBindGroup({ layout: this.LG, entries: [B.CNT, B.HS, B.HI, B.HC, B.SUMS, u].map((b, i) => ({ binding: i, resource: { buffer: b } })) });
    const NONE = 0xFFFFFFFF;
    this.gpItems = gp([0, this.NH, 0, 0, 0, 0, 0, 0]); this.bgItems = bgG(this.gpItems);
    this.bgScan = this.levels.map((Lv, l) => bgG(gp([0, this.NH, Lv.sums, Lv.n, l ? this.levels[l - 1].sums : NONE, l ? this.levels[l - 1].dstNext : NONE, 0, 0])));
    this.bgAdd = this.levels.slice(1).map((Lv, q) => { const l = q + 1; return bgG(gp([0, this.NH, 0, this.levels[l - 1].n, this.levels[l - 1].dstNext, l - 1 ? this.levels[l - 2].dstNext : NONE, 0, 0])); });
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
    mk(moduleSource(this.consts, SIM_BINDINGS, TALLY, PRE, LEARN_K, SENSE, BRAIN_K, BOOK, MOVE, FB4, BODY), [this.L0, this.LS], ['k_pre', 'k_learn', 'k_sense', 'k_brain', 'k_snap', 'k_sums', 'k_glob', 'k_admit', 'k_move', 'k_body']);
  }
  // ---------- data in ----------
  uploadAgents(fish = this.F.fish) {
    const P = packAgents(fish, this.cap); this.n = P.n; this.slotOf = P.slot; this.bySlot = []; for (const [a, i] of P.slot) this.bySlot[i] = a;
    const q = this.dev.queue; q.writeBuffer(this.B.A, 0, P.A); q.writeBuffer(this.B.BR, 0, P.BR); q.writeBuffer(this.B.GN, 0, P.GN);
    this.dev.queue.writeBuffer(this.gpItems, 0, Uint32Array.from([this.n, this.NH]));
    return P;
  }
  // the spawning grounds (after fish3 _siteSub re-chooses them each spring)
  uploadSites() {
    const S = packSites(this.F); if (S.SI.byteLength > this.B.SI.size) { this.B.SI.destroy(); this.B.SI = this.dev.createBuffer({ size: S.SI.byteLength + 4096, usage: ST_() }); if (this.LS) this._layouts(); }
    this.dev.queue.writeBuffer(this.B.SI, 0, S.SI); this.siCoord = S.coordOff; this.siGrid = S.gridOff; this.siNX = S.sNX; this._sitesYr = this.F._siteYr;
  }
  uploadWater() { this.W = packWater(this.F, this.env, this.WL, this.W); this.dev.queue.writeBuffer(this.B.WD, 0, this.W); }
  // the block's uniforms (dt s; lux0 now and the block's light luxB — as Fish3.step sets them)
  setUniforms(dt, { lux0, luxB } = {}) {
    const e = this.env, ch = e.chem, buf = new ArrayBuffer(4 * UNI_FIELDS.length + 15 & ~15), f = new Float32Array(buf), u = new Uint32Array(buf), i = new Int32Array(buf);
    const yf = e.yearFrac(), YEAR = CLOCK3.YEAR_LEN, l0 = lux0 ?? e.lux, lb = luxB || [l0, e.luxAhead(dt / 2), e.luxAhead(dt)];
    const V = { n: this.n, cap: this.cap, ny: 0, ycap: 0, blk: this.blk, seed: this.seed, dtU: Math.round(dt), yr: Math.floor(e.time / YEAR), dt, yf, lux0: l0, luxB0: lb[0], luxB1: lb[1], luxB2: lb[2],
      att: ch.attenuation(), clar: ch.clarity(), sun: e.sun, night: e.isNight() ? 1 : 0, migD: ch._migD, migC: ch._migC, timeD: e.time / 86400, yr0D: Math.floor(e.time / YEAR) * YEAR / 86400,
      siteYr: this.F._siteYr ?? -1, plants: e.plants ? 1 : 0, lit: e.lit ? 1 : 0, siCoord: this.siCoord || 0, siGrid: this.siGrid || 0, siNX: this.siNX || 1 };
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
  // the block's bookkeeping after k_pre: the snapshot, the sums → GL, the brook's nest sites
  encodeBook(enc) {
    enc.clearBuffer(this.B.GS);
    this.encodeKernel(enc, 'k_snap', 256); this.encodeKernel(enc, 'k_sums', 256);
    this._pass(enc, this.P.k_glob, [this.bg0, this.bgS], 64, 64); this._pass(enc, this.P.k_admit, [this.bg0, this.bgS], 256, 256);
  }
  async readGlobals() { return new Float32Array(await this.read(this.B.GL)); }
  run(fn) { const enc = this.dev.createCommandEncoder(); fn(enc); this.dev.queue.submit([enc.finish()]); return this.dev.queue.onSubmittedWorkDone(); }
  clearTallies() { this.dev.queue.writeBuffer(this.B.TL, 0, new Uint32Array(NTALLY)); }
  // ---------- data out ----------
  async read(buf, bytes = buf.size) {
    const rb = this.dev.createBuffer({ size: bytes, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST });
    const enc = this.dev.createCommandEncoder(); enc.copyBufferToBuffer(buf, 0, rb, 0, bytes); this.dev.queue.submit([enc.finish()]);
    await rb.mapAsync(GPUMapMode.READ); const out = rb.getMappedRange().slice(0); rb.unmap(); rb.destroy(); return out;
  }
  async readAgents() { const [A, BR, GN] = await Promise.all([this.read(this.B.A), this.read(this.B.BR), this.read(this.B.GN)]); return { A: new Float32Array(A), BR: new Float32Array(BR), GN: new Float32Array(GN) }; }
  async readGrid() { const [HS, HI, HC] = await Promise.all([this.read(this.B.HS), this.read(this.B.HI), this.read(this.B.HC)]); return { HS: new Uint32Array(HS), HI: new Uint32Array(HI), HC: new Uint32Array(HC) }; }
  async readTallies() { const t = new Uint32Array(await this.read(this.B.TL)); const out = new Float64Array(NTALLY / 2); for (let q = 0; q < out.length; q++) out[q] = t[2 * q] + t[2 * q + 1] * 4294967296; return out; }
  destroy() { for (const b of Object.values(this.B)) b.destroy(); }
}
