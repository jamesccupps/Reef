// GPU stage G0 (docs/GPU_SIM.md): the fish's SENSES on the GPU against the CPU's, on the true-size lakes.
// Open http://localhost:8000/tools/gpu/sense_bench.html?world=true — it founds the lakes (~20–40 s), lives one coarse block, then
// on one frozen snapshot (the neighbour grid as the CPU built it) runs Fish3._sense for every fish on the CPU and the same scan
// as a WebGPU compute kernel, compares each fish's nearest threat, nearest prey and its own kind about it, and times both.
import '../../src/w3/render3/world3sel.js';
const log = (...a) => { const p = document.getElementById('out'); p.textContent += a.join(' ') + '\n'; console.log(...a); };
const { Env3 } = await import('../../src/w3/env3.js');
const { Fish3, F3, S3, KEYS3 } = await import('../../src/w3/fish3.js');
const { FEED } = await import('../../src/config.js');
const { seed } = await import('../../src/core.js');

const WGSL = /* wgsl */`
struct Params { n: u32, HX: u32, HY: u32, pad: u32, hX0: f32, hY0: f32, HC: f32, allyR: f32, preyMin: f32, p1: f32, p2: f32, p3: f32 };
@group(0) @binding(0) var<uniform> U: Params;
@group(0) @binding(1) var<storage, read> pos: array<vec4f>;    // x, y, z, alive
@group(0) @binding(2) var<storage, read> body: array<vec4f>;   // L, body depth, gape, n
@group(0) @binding(3) var<storage, read> sns: array<vec4f>;    // R (prey), Rt (threat), species, can eat fish
@group(0) @binding(4) var<storage, read> spc: array<vec4f>;    // per species: piscivore, Lpisc, longest prey / L
@group(0) @binding(5) var<storage, read> hStart: array<i32>;
@group(0) @binding(6) var<storage, read> hItems: array<i32>;
@group(0) @binding(7) var<storage, read_write> oIdx: array<vec2i>;   // nearest threat, nearest prey (-1: none)
@group(0) @binding(8) var<storage, read_write> oD: array<vec2f>;     // their distances
@group(0) @binding(9) var<storage, read_write> oAlly: array<vec4f>;  // its kind within ALLY_R: Σx·n, Σy·n, Σz·n, Σn
fn canPrey(p: u32, q: u32) -> bool {   // fish3 canPrey
  let sp = spc[u32(sns[p].z)];
  if (sp.x < 0.5 || body[p].x < sp.y || p == q) { return false; }
  return body[q].y <= body[p].z && body[q].x >= U.preyMin * body[p].x && body[q].x <= sp.z * body[p].x;
}
@compute @workgroup_size(128)
fn main(@builtin(global_invocation_id) gid: vec3u) {
  let i = gid.x; if (i >= U.n) { return; }
  let a = pos[i];
  var ti = -1; var pi = -1; var ally = vec4f(0.0);
  let R = sns[i].x; let Rt = sns[i].y; let k = sns[i].z; let canEat = sns[i].w > 0.5;
  var pd = R; var td = Rt;
  if (a.w > 0.5) {
    let RR = max(max(R, Rt), U.allyR); let R2 = RR * RR;
    let gx0 = clamp(i32((a.x - RR - U.hX0) / U.HC), 0, i32(U.HX) - 1); let gx1 = clamp(i32((a.x + RR - U.hX0) / U.HC), 0, i32(U.HX) - 1);
    let gy0 = clamp(i32((a.y - RR - U.hY0) / U.HC), 0, i32(U.HY) - 1); let gy1 = clamp(i32((a.y + RR - U.hY0) / U.HC), 0, i32(U.HY) - 1);
    for (var gy = gy0; gy <= gy1; gy++) {
      for (var gx = gx0; gx <= gx1; gx++) {
        let c = gy * i32(U.HX) + gx;
        for (var q = hStart[c]; q < hStart[c + 1]; q++) {
          let j = u32(hItems[q]); if (j == i) { continue; }
          let b = pos[j]; let dx = b.x - a.x; let dy = b.y - a.y; let dz = b.z - a.z; let d2 = dx * dx + dy * dy + dz * dz;
          if (d2 > R2 || b.w < 0.5) { continue; }
          let d = sqrt(d2);
          if (sns[j].z == k && d < U.allyR) { let nb = body[j].w; ally += vec4f(b.x * nb, b.y * nb, b.z * nb, nb); }
          if (d < td && canPrey(j, i)) { td = d; ti = i32(j); }
          if (canEat && d < pd && canPrey(i, j)) { pd = d; pi = i32(j); }
        }
      }
    }
  }
  oIdx[i] = vec2i(ti, pi); oD[i] = vec2f(td, pd); oAlly[i] = ally;
}`;

log('founding the true lakes…'); const t0 = performance.now();
seed(611); const env = new Env3({ yf0: 0.4 }), F = new Fish3(env, { young: true });
log(`founded in ${((performance.now() - t0) / 1000).toFixed(1)} s; one coarse block…`);
F.step(1752); env.step(1752); F._hashBuild();
const f = F.fish, n = f.length; log(`${n} agents`);
// ---------- the snapshot, packed ----------
const pos = new Float32Array(4 * n), body = new Float32Array(4 * n), sns = new Float32Array(4 * n), spc = new Float32Array(4 * KEYS3.length);
KEYS3.forEach((k, q) => { const s = S3[k]; spc[4 * q] = s.pisc ? 1 : 0; spc[4 * q + 1] = s.sp.Lpisc === Infinity ? 1e9 : s.sp.Lpisc; spc[4 * q + 2] = s.preyLR; });
for (let i = 0; i < n; i++) {
  const a = f[i], o = 4 * i; pos[o] = F.P[o]; pos[o + 1] = F.P[o + 1]; pos[o + 2] = F.P[o + 2]; pos[o + 3] = a.alive ? 1 : 0;
  body[o] = a.L; body[o + 1] = a.bdep; body[o + 2] = a.gape; body[o + 3] = a.n;
  sns[o] = Math.max(0.6, a.senseR * a.vis); sns[o + 1] = Math.max(0.8, a.senseR * 1.1 * a.vis); sns[o + 2] = a.k; sns[o + 3] = a.s.pisc && a.L >= a.s.sp.Lpisc ? 1 : 0;
}
// ---------- the CPU's senses on the same snapshot (no fish moves between them) ----------
const idxOf = new Map(f.map((a, i) => [a, i]));
const cpu = new Int32Array(2 * n), cpuN = new Float32Array(n);
let tc = performance.now();
for (let i = 0; i < n; i++) { const a = f[i]; if (!a.alive) continue; F._sense(a, i); }
tc = performance.now() - tc;
for (let i = 0; i < n; i++) { const a = f[i]; cpu[2 * i] = a.alive && a.threat ? idxOf.get(a.threat) : -1; cpu[2 * i + 1] = a.alive && a.prey ? idxOf.get(a.prey) : -1; cpuN[i] = a.alive ? a.an : 0; }
log(`CPU: ${tc.toFixed(0)} ms for ${n} fish's senses (${(1000 * tc / n).toFixed(2)} µs a fish) — the neighbour scan and the food fields`);
// ---------- the GPU ----------
const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
const device = await adapter.requestDevice({ requiredLimits: { maxStorageBufferBindingSize: adapter.limits.maxStorageBufferBindingSize, maxBufferSize: adapter.limits.maxBufferSize, maxStorageBuffersPerShaderStage: adapter.limits.maxStorageBuffersPerShaderStage } });
log(`storage buffers a stage: ${adapter.limits.maxStorageBuffersPerShaderStage}`);
log(`GPU: ${adapter.info.vendor} ${adapter.info.architecture}`);
const buf = (data, usage) => { const b = device.createBuffer({ size: Math.max(16, data.byteLength + 15 & ~15), usage: usage | GPUBufferUsage.COPY_DST }); device.queue.writeBuffer(b, 0, data); return b; };
const ST = GPUBufferUsage.STORAGE;
const params = new ArrayBuffer(48), pu = new Uint32Array(params), pf = new Float32Array(params);
pu[0] = n; pu[1] = F.HX; pu[2] = F.HY; pf[4] = F.hX0; pf[5] = F.hY0; pf[6] = F3.HC; pf[7] = F3.ALLY_R; pf[8] = FEED.PREY_MIN;
const tu = performance.now();
const B = { U: buf(new Uint8Array(params), GPUBufferUsage.UNIFORM), pos: buf(pos, ST), body: buf(body, ST), sns: buf(sns, ST), spc: buf(spc, ST),
  hS: buf(F.hStart.subarray(0, F.HX * F.HY + 1), ST), hI: buf(F.hItems.subarray(0, n), ST) };
const oIdx = device.createBuffer({ size: 8 * n, usage: ST | GPUBufferUsage.COPY_SRC }), oD = device.createBuffer({ size: 8 * n, usage: ST | GPUBufferUsage.COPY_SRC }), oAlly = device.createBuffer({ size: 16 * n, usage: ST | GPUBufferUsage.COPY_SRC });
await device.queue.onSubmittedWorkDone(); const tUp = performance.now() - tu;
const mod = device.createShaderModule({ code: WGSL }); const info = await mod.getCompilationInfo(); for (const m of info.messages) log('WGSL', m.type, m.lineNum, m.message);
const pipe = device.createComputePipeline({ layout: 'auto', compute: { module: mod, entryPoint: 'main' } });
const bg = device.createBindGroup({ layout: pipe.getBindGroupLayout(0), entries: [B.U, B.pos, B.body, B.sns, B.spc, B.hS, B.hI, oIdx, oD, oAlly].map((b, i) => ({ binding: i, resource: { buffer: b } })) });
const run = async reps => { const t = performance.now(); for (let r = 0; r < reps; r++) { const e = device.createCommandEncoder(), p = e.beginComputePass(); p.setPipeline(pipe); p.setBindGroup(0, bg); p.dispatchWorkgroups(Math.ceil(n / 128)); p.end(); device.queue.submit([e.finish()]); } await device.queue.onSubmittedWorkDone(); return (performance.now() - t) / reps; };
await run(2); const tg = await run(20);
const rd = device.createBuffer({ size: 8 * n, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST }), rdA = device.createBuffer({ size: 16 * n, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST });
const tr = performance.now(); { const e = device.createCommandEncoder(); e.copyBufferToBuffer(oIdx, 0, rd, 0, 8 * n); e.copyBufferToBuffer(oAlly, 0, rdA, 0, 16 * n); device.queue.submit([e.finish()]); }
await rd.mapAsync(GPUMapMode.READ); await rdA.mapAsync(GPUMapMode.READ); const tRd = performance.now() - tr;
const gIdx = new Int32Array(rd.getMappedRange().slice(0)), gAlly = new Float32Array(rdA.getMappedRange().slice(0));
log(`GPU: the scan ${tg.toFixed(2)} ms for ${n} fish (${(1000 * tg / n).toFixed(3)} µs a fish); upload ${tUp.toFixed(0)} ms, read back ${tRd.toFixed(0)} ms`);
// ---------- agreement ----------
let alive = 0, thr = 0, thrSame = 0, pry = 0, prySame = 0, allyOk = 0;
for (let i = 0; i < n; i++) {
  if (!f[i].alive) continue; alive++;
  if (cpu[2 * i] >= 0 || gIdx[2 * i] >= 0) { thr++; if (cpu[2 * i] === gIdx[2 * i]) thrSame++; }
  if (cpu[2 * i + 1] >= 0 || gIdx[2 * i + 1] >= 0) { pry++; if (cpu[2 * i + 1] === gIdx[2 * i + 1]) prySame++; }
  if (Math.abs(cpuN[i] - gAlly[4 * i + 3]) <= 1e-3 * Math.max(1, cpuN[i])) allyOk++;
}
log(`agreement over ${alive} living fish: threat ${thrSame}/${thr}, prey ${prySame}/${pry}, own kind about it ${allyOk}/${alive}`);
log(`the neighbour scan: CPU ~${tc.toFixed(0)} ms (with the food fields) against the GPU's ${tg.toFixed(2)} ms — ×${(tc / tg).toFixed(0)}`);
document.title = 'done';
