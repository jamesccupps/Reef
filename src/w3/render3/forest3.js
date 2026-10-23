// forest3.js — the forest drawn GPU-DRIVEN (browser layer), as open-world games draw their vegetation (Ubisoft's GPU-driven pipeline,
// Horizon's foliage): every tree of the lakes' land — ~830,000 in the true world — in one storage buffer, and each frame ONE compute
// pass over all of them that keeps only those in view (the camera's frustum, and the shadow map's box for the trees that cast into
// it) and sorts each into its draw by distance — the near tier's leaf-card spruce and fir, white pines and hardwoods (≤ near m), the
// mid tier's simple crowns (≤ mid m), the far tier's cones (beyond) — writing its index into that draw's list and the draw's count
// into ONE indirect buffer (Chrome on Windows validates each indirect buffer it draws from: one buffer for all seven draws). Seven
// draws for the whole forest; no tree behind the camera drawn; no CPU re-picking of tiers as the view moves (the old tiers re-picked
// ~55,000 trees whenever the target moved 240 m — a hitch — and drew all 830,000 far trees every frame, in view or not).
// The tree's place, height, turn and kind are uploaded once (again on a change of the land's height); its colour and its leaves
// are worked out in the shader from the date (main3 tierMesh), so the seasons need no upload either.
import * as THREE from '../../../vendor/three-0.186.1/three.webgpu.min.js';
const { Fn, If, instanceIndex, storage, uniform, uniformArray, vec3, float, uint, int, dot, length, abs, select, atomicAdd, atomicStore, atomicLoad, min, max } = THREE.TSL;

// the draws, in the indirect buffer's order: the near tier's HERO trees (≤ hero m: every whorl and cluster), the mid and far tiers, the
// near tier's farther trees in their LITE models (a third of the cards), and the near trees' stand-ins in the water's mirror (the mid
// tier's simple crowns: the leaf cards there cost ~3 ms in the woods for a reflection no one could tell from them)
export const DRAWS = ['spire', 'pine', 'hard', 'midConifer', 'midBroad', 'farConifer', 'farBroad', 'spireLite', 'pineLite', 'hardLite', 'mirrorConifer', 'mirrorBroad'];

// nC conifers then nB hardwoods; caps: each draw's most trees; hero/near/mid: the bands' radii (m, × each tree's own 0.75–1.25: a
// band's edge is ragged, not a circle); pineH: a conifer this tall is drawn near as a white pine
export function makeGpuForest({ nC, nB, caps, hero, near, mid, pineH }) {
  const N = nC + nB, base = []; let tot = 0; for (const c of caps) { base.push(tot); tot += c; }
  const tpA = new THREE.StorageBufferAttribute(new Float32Array(N * 4), 4);   // x, the ground's y, z (= −y north), height
  const twA = new THREE.StorageBufferAttribute(new Float32Array(N * 4), 4);   // its turn (0–2π), k (its random: size, shade), kind code, k2
  const visA = new THREE.StorageBufferAttribute(new Uint32Array(Math.max(1, tot)), 1);
  const cntA = new THREE.StorageBufferAttribute(new Uint32Array(DRAWS.length), 1);
  const argA = new THREE.IndirectStorageBufferAttribute(new Uint32Array(DRAWS.length * 4), 4);   // per draw: vertexCount, instanceCount, firstVertex, firstInstance
  const tpW = storage(tpA, 'vec4', N), twW = storage(twA, 'vec4', N), visW = storage(visA, 'uint', tot);
  const tpR = storage(tpA, 'vec4', N).toReadOnly(), twR = storage(twA, 'vec4', N).toReadOnly(), visR = storage(visA, 'uint', tot).toReadOnly();
  const cnt = storage(cntA, 'uint', DRAWS.length).toAtomic(), args = storage(argA, 'uint', DRAWS.length * 4);
  const capsU = uniformArray(caps.map(c => c), 'uint'), baseU = uniformArray(base, 'uint');
  const planes = uniformArray(Array.from({ length: 6 }, () => new THREE.Vector4()), 'vec4');
  const camP = uniform(new THREE.Vector3()), box = uniform(new THREE.Vector4(0, 0, -1, 0));   // (the shadow box: x, z, half-width; R < 0 none)
  const heroR = uniform(hero), nearR = uniform(near), midR = uniform(mid);

  const reset = Fn(() => { atomicStore(cnt.element(instanceIndex), uint(0)); })().compute(DRAWS.length);
  const cull = Fn(() => {
    const i = instanceIndex;
    If(i.lessThan(uint(N)), () => {
      const tp = tpW.element(i), tw = twW.element(i), H = tp.w;
      const c = vec3(tp.x, tp.y.add(H.mul(0.5)), tp.z), rad = H.mul(0.62).add(1);   // (its bounding sphere, with room for its sway)
      const inView = int(1).toVar();
      for (let k = 0; k < 6; k++) { const pl = planes.element(k); If(dot(pl.xyz, c).add(pl.w).lessThan(rad.negate()), () => { inView.assign(0); }); }
      const inBox = box.z.greaterThan(0).and(abs(c.x.sub(box.x)).lessThan(box.z.add(H))).and(abs(c.z.sub(box.y)).lessThan(box.z.add(H)));
      const d = length(c.sub(camP)), rag = tw.x.div(6.2832).mul(0.5).add(0.75), conif = i.lessThan(uint(nC));
      const draw = int(-1).toVar(), mirror = int(-1).toVar();
      If(d.lessThan(nearR.mul(rag)), () => {
        If(inView.equal(1).or(inBox), () => {
          const lite = select(d.lessThan(heroR.mul(rag)), int(0), int(7));
          draw.assign(select(conif, select(H.greaterThanEqual(pineH), int(1), int(0)), int(2)).add(lite));
          If(inView.equal(1), () => { mirror.assign(select(conif, int(10), int(11))); });
        });
      }).ElseIf(d.lessThan(midR.mul(rag)), () => {
        If(inView.equal(1).or(inBox), () => { draw.assign(select(conif, int(3), int(4))); });
      }).ElseIf(inView.equal(1), () => { draw.assign(select(conif, int(5), int(6))); });
      for (const k of [draw, mirror]) If(k.greaterThanEqual(0), () => {
        const slot = atomicAdd(cnt.element(k), uint(1));
        If(slot.lessThan(capsU.element(k)), () => { visW.element(baseU.element(k).add(slot)).assign(i); });
      });
    });
  })().compute(N);
  const finish = Fn(() => { const k = instanceIndex; args.element(k.mul(4).add(1)).assign(min(atomicLoad(cnt.element(k)), capsU.element(k))); })().compute(DRAWS.length);

  const _f = new THREE.Frustum(), _m = new THREE.Matrix4();
  return {
    N, nC, nB, tpA, twA, argA, heroR, nearR, midR,
    // a draw's tree for this vertex: its index, place and turn/kind (read-only storage, the vertex shader's)
    inst(k) { const id = visR.element(uint(base[k]).add(instanceIndex)); return { id, tp: tpR.element(id), tw: twR.element(id) }; },
    // a draw's mesh: its geometry's vertex count into its indirect args; the geometry draws from them
    bind(k, geometry) { argA.array[k * 4] = geometry.attributes.position.count; argA.needsUpdate = true; geometry.setIndirect(argA, k * 16); },
    // the trees' numbers in (all of them; again when the land's height changes): fn(i, tp, tw) fills tree i's
    fill(fn) { const tp = tpA.array, tw = twA.array; for (let i = 0; i < N; i++) fn(i, tp, tw); tpA.needsUpdate = twA.needsUpdate = true; },
    // each frame, before the scene is drawn: the camera's frustum and place, the shadow box (null: none); then the three passes
    update(renderer, camera, sb) {
      camera.updateMatrixWorld(); _m.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      _f.setFromProjectionMatrix(_m, camera.coordinateSystem, camera.reversedDepth);
      for (let k = 0; k < 6; k++) { const p = _f.planes[k]; planes.array[k].set(p.normal.x, p.normal.y, p.normal.z, p.constant); }
      camP.value.copy(camera.position);
      if (sb) box.value.set(sb.x, sb.z, sb.R, 0); else box.value.set(0, 0, -1, 0);
      renderer.compute([reset, cull, finish]);
    },
  };
}
