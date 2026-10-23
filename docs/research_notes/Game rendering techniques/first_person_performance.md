# First-person walk mode: fast and responsive with the whole living world — how games do it, mapped onto three.js r186 WebGPU

Research notes, 2026-10-23, for ROADMAP #11 (the human: a game-like walk with pointer-lock look, WASD, run, jump, eye at 1.7 m,
collision with trees, camps and docks, wading, swimming and diving, walking on the winter ice; "only render what's in view…
fast and responsive… but still have all the details and animals"). Research only: no source file was changed.

How to read this: **[bundle]** means verified by grepping `vendor/three-0.186.1/three.webgpu.min.js` (or the vendored addons) in
this repo. **[repo]** means read in this repo's code as of the working tree on 2026-10-23 (main3.js was being edited by the trees
agent at the time: card trees in `render3/trees3.js`, reversed-Z, a 2048² sun shadow). **[est]** marks my own estimates, to be
replaced by measurements. Every other claim carries its source URL.

---

## 0. Recommended for Hot Brook (the short version)

**What the view does today that first person will punish [repo]:**
- Every tree tier is one instanced mesh with `frustumCulled = false`, so nothing is culled by view direction.
- The far tier draws all ~1 M trees each frame. Trees inside the "holes" are collapsed in the vertex shader, but their
  vertices are still processed.
- The mid tiers (up to 200 k slots each, about the orbit target) are drawn in the main pass and drawn again into the sun's
  shadow map.
- The near tier is re-picked on the CPU every 30 m of camera movement (`DET_MOVE`). The mid tier is re-picked every 240 m of
  target movement, rebuilding every tree within 1 200 m (~50–100 k [est]) on the main thread in one frame.
- In walk mode about 70 % of the circle around the eye is behind or beside the view (the frustum is ~107° wide on a 21:9 screen),
  and all of it is still paid for.

**Do this, in this order.** Each step is one coherent slice, and each is measured with §7's harness before the next.

1. **Keep reversed-Z.** It is already in the working tree: `reversedDepthBuffer: !LOGZ`, with `?depth=log` to compare.
   - The logarithmic buffer writes `frag_depth` in every material [bundle: `setupDepth` assigns a depth node when
     `logarithmicDepthBuffer`], which turns off early-Z for the whole draw
     (https://developer.chrome.com/blog/new-in-webgpu-155-156).
   - One three.js user measured 65 → 35 fps from that on instanced foliage
     (https://discourse.threejs.org/t/beware-of-logarithmic-depth-buffer-it-can-degrade-scene-performance/88495).
   - With alpha-tested card trees filling the walker's screen, early-Z matters most.
   - r186 supports reversed-Z on WebGPU [bundle: `Depth32Float`, flipped depth compare, clear depth `1 − d`,
     `camera.reversedDepth`, reversed shadow compare]. Test GTAO, the shadows and the water's reflector with a `?depth=log`
     A/B readPixels diff.
2. **Walk controller first, on today's renderer** (§6): `render3/walk3.js` plus hooks in `controls3.js` and `main3.js`.
   - Pointer lock with `unadjustedMovement`, mouse applied in the `mousemove` handler, movement on a fixed 120 Hz sub-step with
     render interpolation.
   - Ground from the same triangles that are drawn; trees as circles from the `TREES` store; camps as oriented boxes; docks as
     decks.
   - Water states (wade, then swim, then dive) and ice from the sim's ice.
   - Then measure: this gives the baseline frame time *in walk mode*.
3. **GPU-driven trees** (§2.4): all trees' static data uploaded once into storage buffers. Each frame one compute pass does a
   per-tree frustum test, a distance band (A cards / B detail / C mid / D far) and stream compaction into per-band index lists,
   plus `instanceCount` atomics in one shared `IndirectStorageBufferAttribute`. Each band mesh is drawn with
   `geometry.setIndirect(args, band*20)`.
   - This removes every CPU tree rebuild (no more 30 m and 240 m re-picks, so no hitches) and cuts tree vertex work to roughly
     the frustum share [est: 3–5× less].
   - Run the cull *after* the controller moves the camera, *before* `render()`, with planes padded ~2°, so a fast mouse flick
     never shows a missing edge.
4. **Shadows for the walker** (§4.1): `CSMShadowNode` (vendored), 3 cascades of 2048² out to ~250 m.
   - Casters live on a shadow-only layer and get their own GPU-culled list (the main camera's list misses trees behind you
     whose shadows fall in view).
   - The far cascade is re-rendered every 2nd–4th frame via `shadow.autoUpdate = false` + `needsUpdate` [bundle: ShadowNode
     honours both, and the map's matrix is only updated when the map is].
   - Beyond ~250 m: no tree shadows. The ground's canopy colour from `canopy3.jpg` stands in, as Cyberpunk's "distant shadows"
     stand in for its far city (https://history.siggraph.org/wp-content/uploads/2022/06/2021-Talks-Dybisz_Shadows-Optimizations-in-Cyberpunk-2077.pdf).
5. **Terrain horizon culling** (§2.3) per 200-m tile on the CPU from a max-height pyramid of the far land: cheap and exact for
   hills. Hi-Z two-pass occlusion only if §7 shows hidden forest still costs > ~2 ms.
6. **Animals and fish by distance and view** (§5).
   - Pose only animals in the frustum; beyond 150 m pose every 2nd–4th frame.
   - The fish window centres on the eye (radius ≈ the water's visibility). Wildlife casts shadows only within ~60 m.
7. **Near-field ground life** (§3.4): a GPU-generated, toroidally updated ring of ground cover around the walker (ferns,
   blueberry and sheep laurel, needle and leaf litter, sedge at the shore, deadfall), placed by hash from the canopy map, the
   way Horizon and Ghost of Tsushima build the world around the player.
8. **Dynamic resolution** (§4.3) on the scene pass only (`pass.setResolutionScale`), in quantized steps (1, 0.85, 0.75, 0.67)
   with hysteresis, driven by GPU timestamps. Add it last, as the safety net.

**Budgets for walk mode** [est]. 60 fps on a typical desktop GPU (RTX 3060 / RX 6600 class), at the human's ~3440×1440 (21:9);
aim for ≤ 12 ms GPU so ~4.7 ms stays as headroom.

| Category | GPU ms | Notes |
|---|---|---|
| GPU cull + LOD + compaction (all trees, plus the shadow list) | 0.3–0.5 | RedLynx's benchmark in the AC Unity talk: 250 k objects culled with LOD in 0.28 ms on Xbox One (§2.1) |
| Shadows: CSM 3 × 2048², cascade 3 staggered | 1.5–2.5 | the biggest lever after culling |
| Terrain + lake bed | 0.5–1.0 | |
| Trees A (cards, 0–60 m) | 1.5–3.0 | fill- and overdraw-bound: needs reversed-Z and front-to-back order |
| Trees B–D (60 m to the horizon) | 1.0–2.0 | after frustum and horizon culling |
| Camps, rocks, shrubs, ground cover | 0.5–1.0 | |
| Animals + fish (≤ ~2 000 visible instances) | 0.3–0.8 | |
| Water + mirror (½ res) | 1.0–2.0 | the mirror is a second scene render |
| Sky | 0.2–0.4 | |
| Post: GTAO ½-res + bloom + FXAA + tone map | 1.2–2.0 | XeGTAO full-res 1080p 0.56 ms on an RTX 2060 (§4.4) |

| CPU main thread per frame | Budget |
|---|---|
| three.js submission | ≤ 2–3 ms: ~2.4 µs per draw measured on a fast laptop CPU (§2.5), so ≤ ~200 draws main, ≤ ~80 per shadow cascade, ≤ ~80 mirror |
| Animals posing | ≤ 1 ms |
| Fish instance writes | ≤ 1 ms |
| Walk controller + collision | ≤ 0.2 ms |
| Labels / UI | ≤ 0.5 ms |

**Trees per band** after culling, walk mode, ~107° horizontal [est from 1 tree per ~45 m² of forest, main3's density]:

| Band | Range (ragged ±25 % by each tree's hash, as `RAG` does now) | Geometry | Drawn trees | Triangles |
|---|---|---|---|---|
| A | 0–60 m | card trees (`trees3.js`) | 60–150 | ≤ 0.4 M |
| B | 60–250 m | spire / pine / hard (~130–620 tris) | 800–1 500 | ≤ 0.8 M |
| C | 250–1 200 m | `coniferG` / `broadG` (~100 tris) | 8 k–20 k | ≤ 2 M |
| D | 1.2–6 km | cone / octahedron (6–8 tris) | 50 k–250 k, fewer after horizon culling | ≤ 2 M |

Shadow casters, all cascades together: A + B, plus C as proxies in cascade 3, ≤ ~1.5 M triangles.

**Walking vs orbiting:**

| | Orbit (today) [repo] | Walk |
|---|---|---|
| Camera | vFOV 50°, eased orbit rig | vFOV ~59° (≈ 90° horizontal at 16:9; Hor+ gives ~107° on 21:9), a 50–75° slider (§6.6); near plane 0.1 m |
| Input | drag orbit, WASD pan, wheel zoom | pointer lock, raw mouse, WASD + Shift run + Space jump + C crouch/dive; Esc leaves |
| Tree LOD centre | mid about `rig.goal.target`, near about the camera | all bands about the eye, GPU frustum + distance per tree |
| Shadows | one map (2048² in the working tree) about the target, R = 1.4 × dist, 40–900 m | CSM 3 cascades ≈ 0–15 / 15–60 / 60–250 m, cascade 3 staggered |
| Shadow casters | mid + near tiers, shrubs, rocks, camps, all wildlife parts | bands A–B (C proxies in cascade 3), camps, wildlife within ~60 m |
| Fish window | about the rig target | about the eye: ~40 m on land (only near-surface fish show through tea-coloured water); the water's visibility when under it |
| Animals | all posed every frame | frustum + distance update-rate LOD |
| Labels, minimap, click-a-fish | on | hidden while pointer-locked |
| Mirror | ½ res, layer 0 | ½ res; its own culled list or bands C–D + camps only |
| Sim worker `cam` message | rig target and distance | eye position and a small radius |

**Measure** (§7):
- Run with `trackTimestamp: true` and `renderer.resolveTimestampsAsync('render' | 'compute')`, plus per-pass times from
  `backend.timestampQueryPool`.
- Use a scripted walk path in a CDP-launched Chrome with the repo's anti-background switches (as `tools/gpu/year_cdp.mjs`
  does) at 3440×1440.
- Report p50/p95/p99 frame time, the % of frames over 16.7 ms, draws and triangles.
- Turn timestamp quantization off with chrome://flags/#enable-webgpu-developer-features in that profile.

---

## 1. API facts verified in the vendored bundle (three r186)

| API | Present | What I checked |
|---|---|---|
| `THREE.IndirectStorageBufferAttribute(count \| Uint32Array, itemSize)` | yes | export `BC as IndirectStorageBufferAttribute`; class extends `StorageBufferAttribute` with `Uint32Array`. WebGPU only (https://threejs.org/docs/pages/IndirectStorageBufferAttribute.html) |
| `geometry.setIndirect(attr, offset = 0)` / `getIndirectOffset()` | yes | the WebGPU backend calls `drawIndexedIndirect(buffer, offset)` (indexed) or `drawIndirect(buffer, offset)` for each offset; **an array of offsets is accepted** (one draw per offset). The offset goes straight to WebGPU, so it is in **bytes** |
| `StorageBufferAttribute`, `StorageInstancedBufferAttribute` | yes | constructors accept a count or a typed array |
| TSL `storage(attr, type, count)`, `.toReadOnly()`, `.toAtomic()`, `.element(i)` | yes | `storage()` on a plain `InstancedBufferAttribute` re-flags it as a storage attribute, so one buffer can be both |
| TSL `instancedArray(count \| typedArray, type)`, `attributeArray` | yes | `instancedArray` builds a `StorageInstancedBufferAttribute` |
| TSL `atomicAdd/Sub/Min/Max/Store/Load`, `workgroupArray`, `workgroupBarrier`, `storageBarrier`, `subgroupAdd`, `struct`, `uniformArray`, `If`, `Return`, `select`, `instanceIndex`, `drawIndex`, `vertexIndex` | yes | all in the TSL export map |
| `fn().compute(count \| dispatchSize, workgroupSize = [64])`; `renderer.compute(node \| [nodes], dispatchSize?)` | yes | a dispatch size that is an `IndirectStorageBufferAttribute` becomes `dispatchWorkgroupsIndirect` |
| Device features | yes | the backend asks the adapter at `featureLevel: 'compatibility'` but **requests every available feature**, including `core-features-and-limits`, `timestamp-query`, `indirect-first-instance`, `subgroups`, `shader-f16`. `requiredLimits` passes through from the renderer's parameters. Desktop Chrome therefore gets a core device |
| `object.occlusionTest = true`, `renderer.isOccluded(object)` | yes | WebGPU occlusion query sets resolved with `mapAsync`, so results arrive ≥ 1 frame late. `isOccluded` reads the *current render context*, so call it during rendering (the r186 example does it in a node's `update`). **Occlusion queries cannot be recorded into render bundles** (backend warning text) |
| `BatchedMesh.perObjectFrustumCulled` | yes, CPU | culling runs in JS `onBeforeRender`. **On the WebGPU backend a BatchedMesh issues one `drawIndexed` per visible instance** (a loop over `_multiDrawCounts`; core WebGPU has no multi-draw). Fine for dozens of camp meshes; wrong for thousands of trees |
| `BundleGroup` (`static`, `needsUpdate`) | yes | WebGPU render bundles (https://threejs.org/docs/pages/BundleGroup.html). One forum user saw no gain with MRT (https://discourse.threejs.org/t/does-renderbundle-support-mrt/74003); our post pass uses MRT |
| `CSMShadowNode` (vendored addon) | yes | `new CSMShadowNode(light, {cascades, maxFar, mode, lightMargin})`, set as `light.shadow.shadowNode`. Each cascade is a `LwLight` whose shadow is `light.shadow.clone()`, so **every cascade is a full shadow-map render at `mapSize`**. Centres snap to texels |
| `shadow.autoUpdate` / `shadow.needsUpdate` | yes | `ShadowNode.updateBefore`: re-renders only if `needsUpdate \|\| autoUpdate`. `renderShadow` is the only place that updates `shadow.matrix` (with `updateMatrices`), so a skipped cascade keeps a matching stale map and matrix. `LightShadow.copy` copies both flags |
| Shadow-only casters | yes | `updateShadow` uses the shadow camera's own layer mask *if it has any bit besides layer 0*; otherwise it borrows the main camera's. So `light.shadow.camera.layers.enable(SHADOW_LAYER)` (before CSM clones it) draws layer-`SHADOW_LAYER` proxies into the shadows only |
| `material.castShadowPositionNode`, `maskShadowNode`, `castShadowNode` | yes | the shadow pass uses `castShadowPositionNode` if set, else `positionNode`, and `maskShadowNode \|\| maskNode` for alpha |
| `reversedDepthBuffer` (renderer option), `camera.reversedDepth` | yes | WebGPU: `Depth32Float`; compare functions mapped through a flip table; clear depth `1 − d`; shadows' compare reversed; `Frustum.setFromProjectionMatrix(m, coordinateSystem, reversedDepth)`. The WebGL2 fallback needs `EXT_clip_control`, else it falls back. (An Oct-2025 forum answer said WebGPU lacked it, https://discourse.threejs.org/t/does-three-js-webgpu-support-reverse-z-buffer/87687; r186 has it) |
| `logarithmicDepthBuffer` | yes | `setupDepth` assigns a depth node, so WGSL writes `frag_depth` |
| `PassNode.setResolutionScale(s)` | yes | `setSize` re-runs every frame with the drawing-buffer size × s; a change reallocates the render target, so use quantized steps. GTAO has its own `resolutionScale` (main3 uses 0.5) |
| `WebGPURenderer({ trackTimestamp: true })`, `renderer.resolveTimestampsAsync(type = 'render')` | yes | resolves the query set, returns ms (ns / 1e6) for the last frame, stores it in `renderer.info.render.timestamp` / `.compute.timestamp`. Per-pass values sit in `backend.timestampQueryPool.render.timestamps` (uid `r:<call>:<id>:f<frame>` → ms) |
| `renderer.info.render.drawCalls / triangles`, `info.compute.frameCalls` | yes | reset each animation frame (`autoReset`). Indirect draws count the CPU-side nominal `instanceCount`, not the GPU-chosen one, so read the args buffer back (`renderer.getArrayBufferAsync(attr)`, present) every ~30 frames for real counts |
| `renderer.compileAsync(scene, camera)` | yes | pre-compiles pipelines (`createRenderPipelineAsync` is used). Call it before entering walk mode: first-frame stalls of 167 ms were measured on r183 (§2.5) |
| `LOD.addLevel(object, distance, hysteresis)` | yes | for whole objects (camp buildings), not instances |
| `Controls`, `Euler`, `Vector3`, `Frustum`, `Timer` exports | yes | what `PointerLockControls.js` imports from `'three'`. The addon is **not vendored**; vendoring needs the same import rewrite as the other addons (no import map under the CSP) |
| `Capsule`, `Octree` (from `games_fps`) | not in the bundle | addons, not vendored; not needed (§6) |
| Skinned instancing | partial | `webgpu_skinning_instancing` marks a SkinnedMesh's child `isInstancedMesh` with an instance matrix: **every instance shares one pose** (https://raw.githubusercontent.com/mrdoob/three.js/r186/examples/webgpu_skinning_instancing.html). TSL `computeSkinning` exists |

WebGPU default limits that shape the design (https://developer.mozilla.org/en-US/docs/Web/API/GPUSupportedLimits):
- `maxVertexBuffers` 8. `wild3kit.partMesh` already hit this, which is why storage buffers rather than more instanced attributes
  are the way to add per-tree data.
- `maxStorageBuffersPerShaderStage` 8 and `maxStorageBuffersInVertexStage` 8 (core).
- `maxStorageBufferBindingSize` 128 MiB: 1 M trees × 32 B = 32 MB fits.
- `maxComputeWorkgroupsPerDimension` 65 535: 1 M / 64 = 15 625 groups fits.

---

## 2. Visibility

### 2.1 What the big games do
- **Assassin's Creed Unity / RedLynx, GPU-driven pipeline** (Haar & Aaltonen, SIGGRAPH 2015,
  https://advances.realtimerendering.com/s2015/aaltonenhaar_siggraph2015_combined_final_footer_220dpi.pdf):
  - Pipeline: coarse CPU quad-tree frustum culling → per-instance data persistent on the GPU → GPU instance culling
    (frustum + occlusion) → cluster culling (64-triangle clusters; frustum, occlusion, baked backface) → index compaction →
    multi-draw.
  - Occlusion depth: ~300 best occluders drawn at full resolution (~600 µs), downsampled to 512×256 (100 µs), combined with
    last frame's reprojected depth (50 µs), then a depth hierarchy (50 µs, PS4).
  - Results: CPU draw calls fell by 1–2 orders of magnitude; 20–40 % of triangles and 30–80 % of *shadow* triangles were
    culled; the overall GPU gain was only < 10 % of geometry time.
  - RedLynx's two-phase occlusion benchmark: 250 000 moving objects; object culling + LOD 0.28 ms, cluster culling 0.09 ms,
    G-buffer 1.6 ms, pyramid 0.06 ms; total 2.3 ms on Xbox One at 1080p; CPU 0.2 ms.
  - **Lesson for us:** the CPU/draw-call win is certain. The occlusion win depends on the scene, and shadows benefit most.
- **Nanite, two-pass occlusion** (Karis, SIGGRAPH 2021,
  https://advances.realtimerendering.com/s2021/Karis_Nanite_SIGGRAPH_Advances_2021_final.pdf):
  - Draw what was visible last frame, build the HZB from it, then test everything else against that HZB and draw what is newly
    visible.
  - Test each bounds' screen rectangle at the HZB mip where it covers ≤ 4×4 texels.
  - Reprojecting last frame's depth instead is not conservative and needs hole filling.
- **Unity 6 GPU Resident Drawer + GPU occlusion culling**
  (https://docs.unity3d.com/6000.3/Documentation/Manual/urp/gpu-resident-drawer.html,
  https://docs.unity3d.com/6000.2/Documentation/Manual/urp/gpu-culling.html):
  - BatchRendererGroup instancing.
  - Occlusion tests against the depth of the current and previous frames, with conservative bounding spheres.
  - Unity warns it *costs* time when a scene has little occlusion.
- **Cyberpunk 2077 shadows**
  (https://history.siggraph.org/wp-content/uploads/2022/06/2021-Talks-Dybisz_Shadows-Optimizations-in-Cyberpunk-2077.pdf):
  - Up to 4 per-frame cascades plus 4 "distant" levels, each 4× bigger than the last.
  - The distant map is re-rendered over several frames, so it refreshes every few seconds.
  - Interval-based cascade selection lets each cascade cull to the camera-frustum slice, extruded toward the light with an
    8-plane convex volume.
  - Casters whose shadow is hidden in the main view's occlusion buffer are dropped.
- **Far Cry 5 terrain** (Moore, GDC 2018, https://gdcvault.com/play/1025261/Terrain-Rendering-in-Far-Cry): GPU compute for
  terrain LOD, culling and stitching.
- **Ghost of Tsushima grass** (Wohllaib, GDC 2021,
  https://gdcvault.com/play/1027214/Advanced-Graphics-Summit-Procedural-Grass):
  - Blades are generated per tile on the GPU, with two LOD models.
  - Secondary summaries add the staging: distance, frustum, then occlusion culling, all in compute before any vertex work,
    with occlusion giving only a marginal gain for grass (https://tigerabrodi.blog/grass-in-ghost-of-tsushima). These are
    secondary; the vault was down for maintenance when I checked.

### 2.2 CPU per tile vs per instance vs GPU — for this project
- **CPU per tile** (coarse):
  - The repo already sorts every tree into 200-m tiles (`TT`, `T.ord`, `T.start`) [repo]: ~1 300 tiles over the true world's
    53 km² far land.
  - Testing 1 300 spheres against 6 planes is ~0.05 ms.
  - Its weakness is that it only culls *whole tiles*. To skip the trees in culled tiles you must either rewrite instance
    buffers (expensive in JS) or split into per-tile draws (more draws).
- **CPU per instance** via an index list:
  - The InstancedMesh2 school of three.js keeps instance data static and rewrites only a `Uint32` visible-index attribute plus
    `count` each frame; the shader fetches the rest by index
    (https://discourse.threejs.org/t/ideas-on-performing-fast-per-instance-frustum-culling-on-instancedmesh/85156,
    https://discourse.threejs.org/t/three-ez-instancedmesh2-enhanced-instancedmesh-with-frustum-culling-fast-raycasting-bvh-sorting-visibility-management-lod-skinning-and-more/69344).
  - Rewriting whole attribute buffers was judged slower than drawing everything.
  - For 1 M trees this means ~300 k indices = 1.2 MB uploaded per frame: too much. It is acceptable only as the WebGL2
    fallback, with tile-level granularity.
- **GPU per instance** (recommended for WebGPU):
  - One compute thread per tree: sphere vs 6 planes, then the distance band, then an atomic append.
  - No CPU work and no readback.
  - Throughput reference: 250 k objects culled + LOD'd in 0.28 ms on an Xbox One GPU (RedLynx's benchmark in the AC Unity talk, above).
  - Contention on 4 global counters: if the naive version costs > 0.5 ms, aggregate per workgroup (`workgroupArray` +
    `workgroupBarrier`, or `subgroupAdd`), then do one global `atomicAdd` per band per workgroup [bundle: all present].
  - Optional hierarchy, as AC Unity does: dispatch only over trees in CPU-visible tiles, since the tile ranges are contiguous
    in `T.ord`.

### 2.3 Occlusion options in WebGPU, ranked for Hot Brook
1. **Terrain horizon culling** (CPU or GPU):
   - Ray-march from the eye to each tile (or tree) top through a max-height pyramid of the heightfield.
   - The Cinevva browser engine measured 60–80 % *more* culling than frustum alone from a valley, 5–10 % from a hilltop; the
     pyramid keeps the cost near plain frustum culling.
   - Its limits: terrain only, and the no-op case must stay cheap
     (https://app.cinevva.com/blog/2026-05-19-terrain-occlusion-culling).
   - Hot Brook's walker is often low (on a shore, in the brook's valley, below wooded hills), so this is the cheapest robust
     occlusion we can get.
   - The far grid (`FAR3`: 266×498 cells of 20 m, true world [repo]) gives a ~9-level pyramid of a few hundred KB.
2. **Hi-Z two-pass** (Nanite-style), later and only if measured worthwhile:
   - WebGPU has no built-in depth-pyramid generation; build it with compute mips.
   - Kitware's WebGPU culler tests at the 2×2-texel mip (4 fetches) and gets ~1.5× from occlusion alone and 5–6× with frustum
     on its Bistro scene. When frames are < 2 ms the pyramid build and synchronisation dominate
     (https://www.kitware.com/webgpu-occlusion-culling-in-vtk/).
   - Pitfalls from a browser engine:
     - Exclude alpha-tested foliage from the occluder pre-pass.
     - Occluders smaller than a mip texel vanish in the max-reduce: a 0.5 m trunk proxy never occluded until it was enlarged
       to the crown's silhouette (https://app.cinevva.com/blog/2026-05-07-open-world-browser-part-22-clouds-and-meshlets).
   - In a Maine mixed forest the occluders are porous crowns (cards), so expect less than in cities. Unity warns that weak
     occlusion makes it a net cost.
3. **Occlusion queries** (`object.occlusionTest`, `renderer.isOccluded`) [bundle]:
   - Per *object*, asynchronous (≥ 1 frame late), and not allowed inside render bundles.
   - Useful for a few big things, e.g. skip a camp's interior lights or a whole 200-m tile proxy box (draw the box with
     `colorWrite` and `depthWrite` off and `occlusionTest` on; draw the tile's trees next frame if any sample passed).
   - Too coarse and too laggy for per-tree culling.
   - Example: https://raw.githubusercontent.com/mrdoob/three.js/r186/examples/webgpu_occlusion.html.

### 2.4 A minimal working pattern in three r186 TSL (sketch; not yet run)
The pattern is the one Toji describes for WebGPU: compute appends visible indices and bumps the instance count in an indirect
buffer, and the vertex stage indexes the list by `instance_index`, with no CPU readback
(https://toji.dev/webgpu-best-practices/render-bundles). The draw-buffer struct and `atomicStore` usage follow r186's own example
(https://raw.githubusercontent.com/mrdoob/three.js/r186/examples/webgpu_struct_drawindirect.html).

```js
// render3/treecull3.js (sketch) — WebGPU backend only; the WebGL2 fallback keeps today's tiers
const { Fn, If, Return, instanceIndex, storage, uniform, uniformArray, uint, vec3, dot, select, atomicAdd, atomicStore, atomicMin } = THREE.TSL;
const B = 4, CAP = [4096, 16384, 65536, 400000];                   // A cards, B detail, C mid, D far
const BASE = CAP.map((c, b) => CAP.slice(0, b).reduce((s, x) => s + x, 0)), SUM = BASE[B - 1] + CAP[B - 1];
// static, uploaded once (and on a land-height change): every tree's x, groundY, z, H | crown width, turn | RGBA8 colour packed in a u32
const tpAttr = new THREE.StorageBufferAttribute(tpAll, 4), twAttr = new THREE.StorageBufferAttribute(twAll, 2);
const visAttr = new THREE.StorageBufferAttribute(new Uint32Array(SUM), 1);
const argsAttr = new THREE.IndirectStorageBufferAttribute(new Uint32Array(5 * B), 5);   // per band: count, instanceCount, first, baseVertex, firstInstance(0)
const tp = storage(tpAttr, 'vec4', N).toReadOnly(), vis = storage(visAttr, 'uint', SUM), args = storage(argsAttr, 'uint', 5 * B).toAtomic();
const U = { planes: uniformArray([0, 1, 2, 3, 4, 5].map(() => new THREE.Vector4()), 'vec4'), eye: uniform(new THREE.Vector3()),
  r2: uniformArray([60 ** 2, 250 ** 2, 1200 ** 2, 1e12], 'float'), cnt: uniformArray(VERTS_OR_INDICES_PER_BAND, 'uint'),
  cap: uniformArray(CAP, 'uint'), base: uniformArray(BASE, 'uint') };
const reset = Fn(() => { const o = instanceIndex.mul(5);
  atomicStore(args.element(o), U.cnt.element(instanceIndex)); for (let k = 1; k < 5; k++) atomicStore(args.element(o.add(k)), uint(0));
})().compute(B);
const cull = Fn(() => { const i = instanceIndex; If(i.greaterThanEqual(uint(N)), () => Return());
  const t = tp.element(i), c = vec3(t.x, t.y.add(t.w.mul(0.5)), t.z), r = t.w.mul(0.6);        // a sphere about the tree
  for (let k = 0; k < 6; k++) { const p = U.planes.element(k); If(dot(p.xyz, c).add(p.w).lessThan(r.negate()), () => Return()); }
  const d = c.sub(U.eye), d2 = dot(d, d);                                                         // (+ the tree's own RAG factor, as now)
  const b = select(d2.lessThan(U.r2.element(0)), uint(0), select(d2.lessThan(U.r2.element(1)), uint(1), select(d2.lessThan(U.r2.element(2)), uint(2), uint(3))));
  const slot = atomicAdd(args.element(b.mul(5).add(1)), uint(1));
  If(slot.lessThan(U.cap.element(b)), () => { vis.element(U.base.element(b).add(slot)).assign(i); });
})().compute(N, [64]);
const clamp = Fn(() => { atomicMin(args.element(instanceIndex.mul(5).add(1)), U.cap.element(instanceIndex)); })().compute(B);
// per band mesh (today's tierMesh, its tp/tw/tc attributes replaced by storage reads):
//   geo.setIndirect(argsAttr, b * 20)     // ONE args buffer for every band: Dawn validates it once (Toji: 412 buffers 3 ms → 1 buffer ~10 µs)
//   const id = storage(visAttr, 'uint', SUM).toReadOnly().element(uint(BASE[b]).add(instanceIndex)); const P = tpV.element(id); ...
// each frame, AFTER the walk controller has moved the camera:
//   frustum.setFromProjectionMatrix(m.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse), camera.coordinateSystem, camera.reversedDepth)
//   copy frustum.planes[k] (normal, constant) → U.planes, padded ~2° (shrink each constant by r_pad); U.eye ← camera.position
//   renderer.compute([reset, cull, clamp]); POST.render();      // both go to the same GPUQueue in call order
```

Notes on the sketch:
- Keep `firstInstance` = 0. A non-zero first instance in an indirect draw needs `indirect-first-instance`; use the per-band
  `BASE` offset into one shared index list instead.
- The tree geometries are non-indexed [repo: `mergeGeo` and `treeBuilder` build non-indexed], so three calls `drawIndirect`,
  which reads 4 u32 (vertexCount, instanceCount, firstVertex, firstInstance); the 5th is ignored. The far cone is indexed and
  reads all 5.
- Toji measured 412 separate indirect buffers costing ~3 ms of Dawn validation per frame on D3D12, against ~10 µs after
  merging into one buffer (https://toji.dev/webgpu-best-practices/indirect-draws). That is why all bands share one args buffer.
- Run the cull in the *same* frame as the render. The r186 example computes *after* rendering, i.e. it draws with last frame's
  args. That is harmless for its demo but would show missing trees at the screen's edge on a fast mouse turn.
- **Shadows and the mirror need their own lists.**
  - A tree behind you can shadow the ground in front of you, so the shadow list is culled against the cascades' light-space
    boxes, extruded toward the sun (Cyberpunk's 8-plane volume, above).
  - The shadow list is drawn by separate proxy meshes on a shadow-only layer [bundle: layer-mask logic above]. The main-pass
    tree meshes get `castShadow = false`.
  - The mirror camera sees above the screen's top edge (tall trees overhead appear in the water), so either cull the mirror
    against the union of both frusta, or keep only bands C–D and camps in it.
- **WebGL2 fallback:** none of this runs there (`IndirectStorageBufferAttribute` is WebGPU-only; no atomics). Keep today's tier
  path behind `renderer.backend.isWebGPUBackend`.
- `castShadowPositionNode` [bundle] can collapse leaf cards in cascades 2–3 (trunk + crown proxy only) without a second mesh,
  if the shadow-layer approach proves too heavy.

### 2.5 Other draw-side facts that matter here
- three's `WebGPURenderer` costs ~2.4 µs of CPU per mesh per pass: 4 000 meshes took 9.7 ms against 4.5 ms in
  `WebGLRenderer` (r183, fast laptop, both backends alike)
  (https://discourse.threejs.org/t/webgpurenderer-2x-slower-cpu-and-5-10x-slower-first-frame-than-webglrenderer-on-many-mesh-scenes-r183-same-on-both-backends/91904).
  A maintainer's advice is instancing and batching (https://discourse.threejs.org/t/webgpu-performance-issue/87939).
  - Every shadow cascade and the mirror multiply the draw count.
  - The ~62 animal part meshes (52 in `wild3view`, 10 in `shallows3view`) plus 11 camp part meshes [repo: `pm(` calls] are
    fine because empty ones are hidden. Keep it
    that way.
- Chrome has an experimental multi-draw-indirect (`chromium-experimental-multi-draw-indirect`, behind the unsafe-WebGPU flag)
  (https://developer.chrome.com/blog/new-in-webgpu-131). It is not in three r186 and not in standard WebGPU.

---

## 3. LOD and streaming around the walker

### 3.1 Distance bands and how games pick them
- **Horizon Zero Dawn** (van Muijden, GDC 2017,
  https://www.guerrilla-games.com/media/News/Files/GDC2017_VanMuijden_GPUBasedProceduralPlacementInHorizonZeroDawn.pdf):
  - All nature is placed at run time *around the player* on the GPU from painted and generated 2-D world maps (0.5–2 m texels,
    ~4 MB/km²).
  - The rules are deterministic and locally stable: the same spot always produces the same objects.
  - A density map is turned into points by a dither pattern, then placed.
  - 500+ asset types, 100 000+ objects in the scene, ~250 µs average GPU load.
- **Ghost of Tsushima:** grass tiles generated per frame, two blade LODs (§2.1).
- **Unreal:**
  - World Partition HLOD layers merge far actors into proxy meshes on their own runtime grid, each with a cell size and loading
    range (https://dev.epicgames.com/documentation/en-us/unreal-engine/world-partition---hierarchical-level-of-detail-in-unreal-engine).
  - Foliage instances are clustered: smaller clusters cull better; cull-start / cull-end distances fade per instance only if
    the material does it, otherwise whole clusters pop (https://api.unrealengine.com/udk/Three/Foliage.html).
- **Cross-fades:** dithered LOD transitions reduce pops but add overdraw in the transition band
  (https://answers.unrealengine.com/questions/707820/view.html).
  - The repo already uses a cheaper trick: each tree switches tier at its own distance (`RAG` 0.75–1.25 × R), so a band's edge
    is a ragged mix of trees rather than a line [repo].
  - Keep it in the GPU cull, since it is one multiply per tree.
  - For whole objects (camps), three's `LOD.addLevel(obj, d, hysteresis)` [bundle] avoids flicker at the threshold.
- **Impostors for far trees:** octahedral impostors (Ryan Brucks; used in Fortnite, https://80.lv/articles/impostor-baker-for-ue4/).
  - A three.js demo ran 200 k trees: full mesh near, a meshoptimizer-simplified mesh at 15–100 m, a hemi-octahedral impostor
    beyond 100 m (16×16 views, 2048² atlas) (https://discourse.threejs.org/t/a-forest-of-octahedral-impostors/85735).
  - For Hot Brook's far band, today's 6–8-triangle cone or blob is already about as cheap as an impostor quad. The win is
    *looks*, not speed.
  - Beyond ~4–6 km a 15-m tree is a few pixels tall, so let the terrain's canopy colour carry it instead of sub-pixel triangles
    (quad overshading) [est].

### 3.2 Keeping a moving window without hitches
- **Speeds.**
  - Pedestrians average ~1.37 m/s, men 1.41 and women 1.32 (1 177 people on video, https://ijbes.utm.my/index.php/ijbes/article/view/1343).
  - Assume a jog of ~3–4 m/s and a sprint of ~6 m/s [est].
  - At 60 fps a walker moves ~2–10 cm a frame. The orbit rig moves `max(4, 0.8·dist)` m/s, up to hundreds [repo].
  - So walking never needs a large re-centre; only the *teleport into* walk mode does.
- **The clipmap idea:** a window centred on the viewer is updated incrementally. Because motion is coherent, only a thin
  L-shaped strip changes each frame, written in place with toroidal (wrap-around) addressing instead of moving data
  (Asirvatham & Hoppe, GPU Gems 2 ch. 2,
  https://developer.nvidia.com/gpugems/gpugems2/part-i-geometric-complexity/chapter-2-terrain-rendering-using-gpu-based-geometry).
  Use it for any near-field grid (ground cover, §3.4).
- **CPU rebuilds that remain** (shrubs, rocks, the near-tier picks if they stay CPU-side):
  - **Amortise.** Build the next window into a *back* buffer a few hundred trees per frame, then swap (double buffering), and
    upload only the changed range with `attr.addUpdateRange()` / `clearUpdateRanges()` [bundle].
  - **Never** do a 100 k-tree rebuild in one frame.
  - The GPU-driven trees of §2.4 make the tree case moot: all trees are static on the GPU and only the cull changes.
- **Seasons.** A season or snow change rewrites every tree's colour: 1 M × 4 B = 4 MB. Do it under the date jump's own fade, or
  in 4 range-limited chunks.
- **Entering walk mode.**
  - Pre-compile with `renderer.compileAsync(scene, camera)` [bundle]: r183 measured a 167-ms cold first frame on WebGPU (§2.5).
  - Fly the camera down from the orbit view over ~0.5–1 s while the near-field ring fills.

### 3.3 Where each band is centred
Every band is centred on the *eye* in walk mode; the orbit view keeps "mid about the target". The sim worker is told the eye
position, so it packs fish and animals near the walker [repo: `postMessage({type:'init', cam:[x, y, dist]})`].

### 3.4 Populating the near field (ground cover)
- **GoT and HZD both generate the near field on the GPU from maps** (§2.1, §3.1). UE's landscape grass is likewise generated
  per component at a density in instances per 10 m², with jittered-grid or Halton placement and per-instance fade distances
  (https://docs.unrealengine.com/4.27/API/Runtime/Landscape/FGrassVariety/index.html).
- **For Hot Brook:**
  - Use a 4-m-cell toroidal grid of radius ~40 m around the eye (~300 cells).
  - A compute pass hashes each cell (cell index → deterministic, never `core.rand`) into 0–N instances by type. The densities
    come from `canopy3.jpg` (cover, conifer share, bare), NLCD class and distance to water:
    - needle litter and partridgeberry under conifers;
    - ferns, wild sarsaparilla and leaf litter under hardwoods;
    - lowbush blueberry, sheep laurel and sweetfern in clearings;
    - sedge, pickerelweed and bur-reed at the waterline;
    - deadfall logs and boulders.
  - The pass appends to per-type indirect lists exactly like §2.4.
  - Only cells entering the ring are rebuilt (toroidal), and they cost microseconds on the GPU.
  - Budget ~3 000–6 000 visible clumps, ≤ 0.3 M triangles, wind-swayed in the vertex shader like the trees [est].

---

## 4. Frame-rate stability

### 4.1 Shadows in first person
- **Why they cost:** each cascade re-renders every caster inside it, CPU submission included. CSM in r186 = N full shadow
  renders [bundle].
  - AC Unity's culling removed 30–80 % of shadow triangles (§2.1), the biggest single gain in that talk.
  - Today's single map (about the orbit target) is the wrong shape for a walker: it must be dense at the feet and coarse far
    away.
- **Recommended setup:**
  - `CSMShadowNode(sun, { cascades: 3, maxFar: 250, mode: 'practical', lightMargin: 200 })` at 2048².
    Example: https://raw.githubusercontent.com/mrdoob/three.js/r186/examples/webgpu_shadowmap_csm.html.
  - Set casters and layers **before** the first render: CSM clones `light.shadow` at its first `setup`.
  - Optional cascade fade (`csm.fade`); the r186 example notes that toggling it needs a shadow rebuild.
- **Caching / staggering** [bundle]:
  - Cascade 1 (the feet, 0–15 m) every frame.
  - Cascade 2 every frame or every 2nd.
  - Cascade 3 every 3rd–4th (`csm.lights[i].shadow.autoUpdate = false; … .needsUpdate = true` on its turn).
  - Safe because the map and its matrix move together, so a skipped cascade is merely a few frames old in world space.
  - The sun moves ~0.25°/min, so no artefact from that; walking at 1.4 m/s moves a 60–250-m cascade negligibly. The CSM code
    re-centres cascades each frame (snapped to texels), so a stale cascade lags its cover by ≤ a few cm [est].
- **Distant shadows:** Cyberpunk refreshes far shadow levels every few seconds over several frames (§2.1).
  - Ours is cheaper still: no far tree shadows; the ground's canopy shade comes from the canopy map (an AO-like darkening under
    cover), which also matches what the eye sees at 500 m+.
- **Foliage and shadow caching don't mix:** Epic found animated trees (vertex wind) plus a continuously moving sun defeated
  shadow caching in Fortnite (https://www.unrealengine.com/en-US/tech-blog/virtual-shadow-maps-in-fortnite-battle-royale-chapter-4).
  - Our trees sway, so the near cascade must stay per-frame.
  - Only the far cascade is staggered, where a sway of a few cm is sub-texel.
- **Shadow LOD:**
  - The proxies on the shadow layer can be the cheaper band geometry.
  - `maskShadowNode` lets cascade 1 keep the card alpha (sun through gaps, which the trees agent wants) while cascades 2–3 use
    an opaque crown [bundle].
- **Stabilisation:** CSM already snaps each cascade's centre to a texel [vendored CSMShadowNode.js: `Math.floor(_center.x /
  texelWidth) * texelWidth`]. This is the standard fix for shimmering when the camera moves
  (https://learn.microsoft.com/en-us/windows/win32/dxtecharts/common-techniques-to-improve-shadow-depth-maps).
- **Tile shadows:** r186 also ships `TileShadowNode`, one big map split into tiles
  (https://raw.githubusercontent.com/mrdoob/three.js/r186/examples/webgpu_shadowmap_array.html). It is not vendored; CSM fits
  a walker better.

### 4.2 Depth precision and early-Z (the overdraw lever)
- `frag_depth` writes disable early-Z for the whole draw (https://developer.chrome.com/blog/new-in-webgpu-155-156). The
  logarithmic buffer writes it in every material [bundle].
- Reversed float depth gives near-uniform precision without shader depth writes (Reed, "Depth Precision Visualized",
  https://developer.nvidia.com/content/depth-precision-visualized).
- **Status:** the working tree already defaults to reversed-Z with `?depth=log` for A/B [repo].
- **Further overdraw levers** for card trees (https://app.cinevva.com/blog/2026-05-11-foliage-overdraw, a browser-engine
  write-up; its 8–15× overdraw figure is the author's):
  - draw opaque before masked, near to far;
  - a depth pre-pass for the masked cards, if the near band is overdraw-bound;
  - keep leaf shading cheap.
- Horizon Forbidden West built a visibility-buffer pre-pass with compute shading for exactly this foliage cost
  (https://www.guerrilla-games.com/read/adventures-with-deferred-texturing-in-horizon-forbidden-west). That is too big a step
  for us now.
- three sorts opaque *objects* front to back, but not instances inside one mesh. Have the GPU cull emit band A's list nearest
  first (append order by tile ring) [est benefit, measure].

### 4.3 Dynamic resolution
- Engines scale render targets down when GPU time nears the frame budget, and back up when there is headroom, driven by
  CPU/GPU frame timings (https://docs.unity3d.com/Manual/DynamicResolution-control.html).
- **In this pipeline:**
  - Scale only the scene pass: `sp.setResolutionScale(s)` [bundle]. Bloom and FXAA follow its texture; GTAO keeps its own ½
    of that.
  - Each change reallocates the pass's render targets [bundle: `setSize` → `renderTarget.setSize`], so use 4 steps
    (1, 0.85, 0.75, 0.67) and change at most once a second.
  - Go down when the GPU frame p90 over 30 frames > 14.5 ms; go up when < 11 ms for 3 s.
- Never shrink the canvas itself (`setPixelRatio`), which resizes the swap chain [bundle].

### 4.4 Post-processing cost
- Today: GTAO at ½ res, radius 2.5 m; bloom; FXAA; MRT normal output [repo].
- XeGTAO's own figures (full resolution, "High"):
  - 0.56 ms at 1080p on an RTX 2060;
  - 1.4 ms at 4K on an RTX 3070;
  - 2.39 ms at 1080p on an Intel i7-1195G7 iGPU;
  - "Medium" ≈ ⅔ of "High";
  - the original GTAO ran at half resolution (https://raw.githubusercontent.com/GameTechDev/XeGTAO/master/README.md).
- At ½ res the AO shades a quarter of the pixels, so ≈ 0.3–0.6 ms at 3440×1440 on a 3060-class GPU [est].
- Bloom's mip chain is cheap.
- The MRT normal target is the hidden cost: one more full-res write per opaque pixel.
- Keep all four passes; drop only GTAO in "fast" mode.

### 4.5 Frame budget and pacing
- 16.7 ms at 60 Hz; see §0's tables.
- The human's monitor may be faster than 60 Hz; on a 144-Hz screen rAF asks for 6.9 ms.
  - Prefer an explicit cap at half the refresh (72 fps) over skipping arbitrary frames, which judders [est].
  - Report the refresh rate measured from rAF intervals in the status line.

### 4.6 Input latency
- **Pointer lock:**
  - `canvas.requestPointerLock({ unadjustedMovement: true })` returns a promise and gives raw, unaccelerated mouse deltas.
    On `NotSupportedError`, retry without the option (https://web.dev/articles/disable-mouse-acceleration; spec
    https://www.w3.org/TR/pointerlock-2/).
  - From Chrome 131 pointer lock needs a permission. The browser prompts on the first request; check
    `navigator.permissions.query({name: 'pointer-lock'})` (https://developer.chrome.com/blog/keyboard-lock-pointer-lock-permission).
  - After the user presses Esc, an immediate re-lock must fail (spec). Chrome's window is ~1.25 s, and the usual cause of
    "The user has exited the lock before this request was completed". So on `pointerlockchange` → unlocked, pause and show
    "click to walk"; never auto-retry (https://discourse.threejs.org/t/how-to-avoid-pointerlockcontrols-error/33017).
- **Mouse delta timing:** Chrome delivers continuous events like `mousemove` once per frame, just before the rAF callback
  (https://developer.chrome.com/blog/aligning-input-events). Applying the delta to yaw and pitch in the handler is therefore
  already sampled per frame with minimal delay; render right after.
  - No smoothing by default: averaging N frames adds ~N/2 frames of lag [reasoning]. Offer it as an option only.
- **Movement:** fixed-step physics with render interpolation (Fiedler, https://gafferongames.com/post/fix_your_timestep/).
  - three's FPS example runs 5 sub-steps a frame with the delta capped at 50 ms
    (https://raw.githubusercontent.com/mrdoob/three.js/r186/examples/games_fps.html).
  - Recommend a 120-Hz controller step: deterministic collisions at any frame rate. The *look* is applied immediately,
    outside the step.
- **GPU-bound frames add latency:** when the GPU is saturated, frames queue before rendering. NVIDIA's Reflex exists to remove
  that queue (https://www.nvidia.com/en-us/geforce/news/reflex-2-even-lower-latency-gameplay-with-frame-warp/).
  - In a browser we cannot pace like Reflex. Keep GPU time *below* the frame budget (the 12-ms target) and let dynamic
    resolution defend it.

---

## 5. Keeping animals and detail alive cheaply
- **Update-rate LOD:**
  - Unreal's Animation Budget Allocator gives skeletal animation a fixed ms budget. It ticks the most significant (nearest)
    meshes at full rate and reduces rate and quality for the rest, optionally interpolating between updates
    (https://dev.epicgames.com/documentation/unreal-engine/animation-budget-allocator-in-unreal-engine).
  - AC Unity's crowd budgeted 40 full AIs and 120 high-res models to show 10 000 NPCs, swapping low and high resolution
    unnoticed (Cournoyer, GDC 2015, https://gdcvault.com/play/1022141/Massive-Crowd-on-Assassin-s).
  - **For `wild3view` / `shallows3view`** [repo: each animal is posed every frame by CPU matrices into ~62 part meshes]:
    1. Advance every animal's *state* every frame (cheap).
    2. Bounding-sphere frustum test per animal, then `put()` parts only for visible ones.
    3. Beyond ~150 m, re-pose every 2nd–4th frame and hold the matrices.
    4. Below ~6 px tall, draw a 1–2-part silhouette (body + head) instead of 6–12 parts.
    5. Measure with the existing `LIVE.wildMs`.
- **Fish:**
  - The view already chooses detail by on-screen size (`PX_FAR` 10 px → coarse body; `PX_MIN` 0.5 px → none) [repo].
  - In walk mode also drop fish outside the frustum (send the frustum planes, or just the yaw and FOV, to `fishside3`).
  - Shrink the window: from land, fish only show near the surface through the tea-coloured water; under water, the water's
    visibility bounds it.
- **Impostors for distant animals:** a moose at 300 m is ~10 px.
  - A camera-facing card baked from the part model (8 yaw views) would do, but the 1–2-part silhouette above is simpler and
    lit consistently.
  - Octahedral impostors (§3.1) are worth it only for static things.
- **Skinned or articulated instancing:**
  - Classic instanced skinning stores bone palettes in a texture read in the vertex shader. ~10 000 independently animated
    characters ran at 30 fps on a GeForce 8800 (GPU Gems 3 ch. 2,
    https://developer.nvidia.com/gpugems/GPUGems3/gpugems3_ch02.html).
  - Unity's Animation Instancing bakes animation to textures for the same reason
    (https://blog.unity.com/engine-platform/animation-instancing-for-skinnedmeshrenderer).
  - three r186's instanced skinning shares one pose for all instances [bundle/example].
  - Our part-based animals with procedural poses are already the right shape. Move posing to the GPU only if `wildMs` exceeds
    ~1.5 ms with bears, deer and moose added: each part instance gets (animal id, part id) and a compute pass writes its matrix
    from per-animal state.
- **Wind and life in the static world:** the trees' sway and the cards' flutter are vertex-shader only [repo], so they cost
  nothing on the CPU. Keep all motion of static things in shaders.

---

## 6. The first-person controller

### 6.1 Kinematic controller over the heightfield
- **Ground height:** use the *drawn* surface (`main3 groundAt` / `drawnY`) [repo], interpolated **on the same triangles** as the
  mesh (barycentric on the band's 1.5-m and the far land's 20-m triangulation), not bilinear. Otherwise the eye bobs a few cm
  on slopes.
- **Eye:** 1.7 m above the feet; crouch 1.1 m.
- **Step and slope:**
  - Unity's CharacterController guidance: step offset 0.1–0.4 m for a 2-m human; skin width ~10 % of the radius
    (https://docs.unity3d.com/Manual/class-CharacterController.html).
  - Rapier's controller: max slope climb angle (45° in its docs' example), min slope slide angle, autostep with a max height,
    snap-to-ground, a small offset (https://rapier.rs/docs/user_guides/javascript/character_controller).
  - **For us:** step 0.35 m (onto a dock, a boulder, a log). Slopes over 40° become slides (the ground's normal from the same
    triangles); snap to ground within 0.3 m when walking downhill.
- **No physics engine:**
  - Rapier and other WASM engines would need `'wasm-unsafe-eval'` in the CSP's `script-src`, which today is `'self'` only
    [repo: w3.html]. Without it WebAssembly is blocked
    (https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/script-src).
  - A heightfield + circles + boxes controller in ~300 lines of JS is enough.

### 6.2 Collision
- **The walker** is a vertical capsule of radius 0.3 m, which in plan is a circle; the heightfield handles the vertical.
- **Trees:**
  - Circle vs circle against trunks, using the `TREES` store.
  - Trunk radius: the models' trunk base (0.028–0.042 model units) × crown width ≈ 0.009 × H. A 15-m spruce gets ~0.14 m
    [repo-derived].
  - Query the 200-m tiles (`T.ord`/`T.start`) only to refresh a *local list* of trees within 20 m every 2 m walked, then test
    that list each step (~50–200 circles).
  - Push out along the contact normal and slide (keep the tangential velocity), as three's FPS example does with its capsule
    results.
- **Camps:**
  - `CAMPS3D.camps[]` are oriented rectangles (`xy`, `w`, `l`, `rot`) [repo]: circle vs OBB.
  - Roads (`pts`) are just ground.
  - Walls are solid; no interiors.
- **Docks:**
  - `docks[]` have `base`, `dir`, `len` [repo] and are in the water from May 25 to Oct 15 (`docksIn(yf)`).
  - Treat each as a walkable deck: a rectangle ~1.2 m wide at the water level + ~0.45 m. Inside its footprint the "ground" is
    `max(terrain, deck)`.
  - Stepping off the end into the water is just leaving the deck.
  - Boats are obstacles (circles) or ignored.
- **Rocks and logs** in the shallows (`shallows3view` boulders, logs) are circles or boxes with a top height you can step onto.

### 6.3 Water: wade → swim → dive
Let the feet's water depth be d = level(x, y) − ground, both of which the repo has [repo: `GEO.levelAt`, bed depth].

| Water depth d | State | Behaviour [est, tune by feel] |
|---|---|---|
| < 0.05 m | dry | normal walking |
| 0.05–0.5 m | wading, shin to knee | speed × (1 − 0.8·d); splash sound and rings (`rises3view`) |
| 0.5–1.25 m | wading, thigh to chest | speed ~0.5–0.7 m/s; no run; jump disabled |
| > 1.25 m (chest) | swimming | the feet leave the bed; eye ~0.12 m above the surface with a slow bob; 0.6–1.0 m/s; no gravity, buoyancy holds you at the surface |
| C / Ctrl while swimming | diving | the eye goes under; the existing underwater view takes over (`under` → water fog, specks, hidden land trees [repo]); swim in 3-D at 0.8 m/s |
| release C | rising | buoyancy +0.4 m/s back to the surface |

- Depth slows walking through buoyancy and drag; aquatic-gait studies find people slow as immersion deepens
  (https://www.ewacmedical.com/wp-content/uploads/2022/03/Jung-2018-The-influence-of-water-depth-on-kinematic-and-spatiotemporal-gait-parameters-during-aquatic-treadmill-walking.pdf).
- Engines model the swimming state with a buoyancy ratio (1 = neutral) and swim speed and braking settings, e.g. Unreal's
  CharacterMovement (https://dev.epicgames.com/documentation/en-us/unreal-engine/python-api/class/CharacterMovementComponent).
- A breath meter is optional; a screensaver should not drown the human.

### 6.4 Ice in winter
- The sim knows the ice:
  - per-column cover: `env.ice` (0–1), sent in snapshots as `e.ice`;
  - lake-wide black ice `iceB` and white or snow ice `iceW` (m), plus snow [repo: env3.js].
- **Walkable** where cover > 0.5 and black ice + ½ × white ice ≥ 0.10 m.
  - Maine IF&W: under 4 in (10 cm) of new clear ice, stay off; 4 in is about the minimum on foot.
  - White "snow ice" is about half as strong as clear ice.
  - Ice is weaker near inlets, outlets and current (https://www.maine.gov/ifw/programs-resources/outdoor-safety/ice-safety-tips.html).
  - So treat the brook mouth and outlet as thin.
- **On ice:**
  - ground = water level (+ ice thickness above it ≈ 0.9 h);
  - lower friction: acceleration × 0.3, slow deceleration;
  - snow on top slows walking.
- **Thin ice:** the walker breaks through and is swimming in 1 °C water. A gentle choice: refuse the step with a crack sound.
- Thicknesses would have to be added to the snapshot: a view read, not a sim change.

### 6.5 PointerLockControls (three r186) and what to keep
- [r186 source, https://raw.githubusercontent.com/mrdoob/three.js/r186/examples/jsm/controls/PointerLockControls.js]:
  - extends `Controls`;
  - rotation via an Euler in `'YXZ'` order, sensitivity `0.002 rad/px × pointerSpeed`, pitch clamped by
    `minPolarAngle`/`maxPolarAngle`;
  - applied directly in the `mousemove` handler;
  - `lock(unadjustedMovement = false)`;
  - `moveForward` / `moveRight` move parallel to the ground plane;
  - `isLocked` is tracked through `pointerlockchange`.
- **Recommendation:** write the ~40 lines into `controls3.js` (a `WalkRig` beside `CameraRig`) rather than vendoring.
  - We want `unadjustedMovement: true` with the `NotSupportedError` fallback, the permission and Esc-cooldown handling,
    and a sensitivity slider.
  - Keep `typing()` for text fields [repo].
  - Pause walking when the tab hides (rAF stops in background tabs, §7).
- **three's FPS example** (games_fps, r186): gravity 30 m/s², jump velocity 15 m/s, damping `exp(−4·dt) − 1` on the ground and
  10 % of that in the air, 5 sub-steps, an Octree + Capsule world. That is game-feel, not realism.
  - For a person on Maine ground: gravity 9.81 m/s²; a jump of ~0.4–0.5 m (v₀ ≈ 3 m/s); walking acceleration ~6 m/s²,
    deceleration ~10 m/s² [est].

### 6.6 Field of view, head-bob, comfort
- **FOV:** an FOV far from what the eye expects causes motion sickness. Guideline defaults are ~60° for a TV and ~90° for a
  monitor, horizontal, and should be adjustable (https://gameaccessibilityguidelines.com/?p=93; Xbox XAG 117,
  https://devdocs.xbox.com/gaming/accessibility/xbox-accessibility-guidelines/117).
  - three's `fov` is *vertical*, so for Hor+: vFOV = 2·atan(tan(45°)/1.778) ≈ 59°. On the human's 21:9 screen that gives
    ~107° horizontal.
  - Slider 50–75° vertical.
- **Head-bob, camera shake and uncommanded camera motion** are common sickness triggers. Make bob subtle, scaled with speed,
  and switchable (https://gameaccessibilityguidelines.com/?p=187).
  - Default: off, or ±1.5 cm vertical at step frequency, with no roll.
- **Optional extras:** sprint FOV +3–5° eased over 0.3 s; landing dip 4 cm; underwater FOV unchanged (the fog sells it).

---

## 7. Measuring it

1. **GPU time:**
   - Construct with `new THREE.WebGPURenderer({ ..., trackTimestamp: true })`.
   - Every ~10 frames: `const ms = await renderer.resolveTimestampsAsync('render'); const cs = await renderer.resolveTimestampsAsync('compute');`
     (ms for the last resolved frame). The per-pass map is `renderer.backend.timestampQueryPool.render.timestamps` [bundle].
   - Map pass uids to names by call order: shadow cascades, mirror, scene pass, GTAO, bloom, output.
   - Chrome rounds timestamps to 100 µs unless chrome://flags/#enable-webgpu-developer-features is on in that profile
     (https://developer.chrome.com/docs/web-platform/webgpu/developer-features). That is fine for totals and coarse for
     sub-0.3-ms passes; average them.
2. **CPU time:** `performance.now()` around the frame body, split into controller, cull upload, animals (`LIVE.wildMs`), fish,
   `render()`.
3. **Counts:**
   - `renderer.info.render.drawCalls`, `.triangles`, `info.compute.frameCalls` after each frame. They reset per animation
     frame [bundle].
   - For indirect draws, read the args buffer back every ~30 frames with `renderer.getArrayBufferAsync(argsAttr)` to get the
     real per-band instance counts.
4. **Background throttling:**
   - Chrome does not run rAF in background tabs (https://developer.chrome.com/blog/background_tabs), and the preview pane has
     no WebGPU adapter [repo: SESSION_STATE].
   - So measure in a Chrome window launched over CDP with `--disable-backgrounding-occluded-windows
     --disable-renderer-backgrounding --disable-background-timer-throttling`, exactly as `tools/gpu/year_cdp.mjs` does [repo].
   - Set `Emulation.setDeviceMetricsOverride` to 3440×1440 (the human's 21:9) in the *same* CDP session as the captures
     [repo: SESSION_STATE's CDP note].
   - Don't run it while a GPU year run (ARM jobs) is using the GPU.
5. **A scripted walk** (`tools/w3_walkbench_cdp.mjs`, to write):
   - A fixed path driven by time, not input: the forest interior → the NE shore at noon → out along a dock → wading → a
     dive → the winter ice at dusk.
   - 60 s each, at 1.4 and 4 m/s, and a 180°/s mouse-flick segment for edge-pop checks.
   - Output p50/p95/p99 frame ms, % > 16.7 ms, GPU ms per pass, draws, triangles, real instance counts per band.
   - A/B every slice with the same path and `?` switches (`?depth=log`, `?cull=cpu|gpu`, `?csm=0|1`).
6. **Visual checks** (CLAUDE.md rule):
   - Edge pops: render two frames at a 90°/frame yaw and diff the outer 5 % of columns for missing trees.
   - Shadow staleness: an A/B readPixels diff of cascade 3 with stagger on and off, per horizontal band.

---

## 8. Source list
- AC Unity / RedLynx GPU-driven: https://advances.realtimerendering.com/s2015/aaltonenhaar_siggraph2015_combined_final_footer_220dpi.pdf
- Nanite deep dive: https://advances.realtimerendering.com/s2021/Karis_Nanite_SIGGRAPH_Advances_2021_final.pdf
- HZD procedural placement: https://www.guerrilla-games.com/media/News/Files/GDC2017_VanMuijden_GPUBasedProceduralPlacementInHorizonZeroDawn.pdf
- HZD vegetation talk (listing): https://gdcvault.com/play/1025066/Between-Tech-and-Art-The
- HFW deferred texturing: https://www.guerrilla-games.com/read/adventures-with-deferred-texturing-in-horizon-forbidden-west
- Ghost of Tsushima grass (listing): https://gdcvault.com/play/1027214/Advanced-Graphics-Summit-Procedural-Grass
- Ghost of Tsushima grass, a secondary summary: https://tigerabrodi.blog/grass-in-ghost-of-tsushima
- Far Cry 5 terrain (listing): https://gdcvault.com/play/1025261/Terrain-Rendering-in-Far-Cry
- Cyberpunk 2077 shadows: https://history.siggraph.org/wp-content/uploads/2022/06/2021-Talks-Dybisz_Shadows-Optimizations-in-Cyberpunk-2077.pdf
- Fortnite virtual shadow maps: https://www.unrealengine.com/en-US/tech-blog/virtual-shadow-maps-in-fortnite-battle-royale-chapter-4
- Unity GPU Resident Drawer: https://docs.unity3d.com/6000.3/Documentation/Manual/urp/gpu-resident-drawer.html
- Unity GPU occlusion culling: https://docs.unity3d.com/6000.2/Documentation/Manual/urp/gpu-culling.html
- Unity dynamic resolution: https://docs.unity3d.com/Manual/DynamicResolution-control.html
- Unity CharacterController: https://docs.unity3d.com/Manual/class-CharacterController.html
- Unity animation instancing: https://blog.unity.com/engine-platform/animation-instancing-for-skinnedmeshrenderer
- Unreal World Partition HLOD: https://dev.epicgames.com/documentation/en-us/unreal-engine/world-partition---hierarchical-level-of-detail-in-unreal-engine
- Unreal (UDK) foliage clusters and cull distances: https://api.unrealengine.com/udk/Three/Foliage.html
- Unreal Animation Budget Allocator: https://dev.epicgames.com/documentation/unreal-engine/animation-budget-allocator-in-unreal-engine
- AC Unity crowds (listing): https://gdcvault.com/play/1022141/Massive-Crowd-on-Assassin-s
- GPU Gems 2 clipmaps: https://developer.nvidia.com/gpugems/gpugems2/part-i-geometric-complexity/chapter-2-terrain-rendering-using-gpu-based-geometry
- GPU Gems 3 crowds: https://developer.nvidia.com/gpugems/GPUGems3/gpugems3_ch02.html
- three.js docs, IndirectStorageBufferAttribute: https://threejs.org/docs/pages/IndirectStorageBufferAttribute.html
- three.js docs, BundleGroup: https://threejs.org/docs/pages/BundleGroup.html
- three.js r186 examples:
  - drawindirect: https://raw.githubusercontent.com/mrdoob/three.js/r186/examples/webgpu_struct_drawindirect.html
  - occlusion: https://raw.githubusercontent.com/mrdoob/three.js/r186/examples/webgpu_occlusion.html
  - games_fps: https://raw.githubusercontent.com/mrdoob/three.js/r186/examples/games_fps.html
  - CSM: https://raw.githubusercontent.com/mrdoob/three.js/r186/examples/webgpu_shadowmap_csm.html
  - shadow array (TileShadowNode): https://raw.githubusercontent.com/mrdoob/three.js/r186/examples/webgpu_shadowmap_array.html
  - skinning instancing: https://raw.githubusercontent.com/mrdoob/three.js/r186/examples/webgpu_skinning_instancing.html
  - PointerLockControls: https://raw.githubusercontent.com/mrdoob/three.js/r186/examples/jsm/controls/PointerLockControls.js
- three.js forum:
  - logarithmic depth cost: https://discourse.threejs.org/t/beware-of-logarithmic-depth-buffer-it-can-degrade-scene-performance/88495
  - reversed depth on WebGPU: https://discourse.threejs.org/t/does-three-js-webgpu-support-reverse-z-buffer/87687
  - WebGPURenderer CPU cost: https://discourse.threejs.org/t/webgpurenderer-2x-slower-cpu-and-5-10x-slower-first-frame-than-webglrenderer-on-many-mesh-scenes-r183-same-on-both-backends/91904
  - maintainer on many draws: https://discourse.threejs.org/t/webgpu-performance-issue/87939
  - per-instance culling: https://discourse.threejs.org/t/ideas-on-performing-fast-per-instance-frustum-culling-on-instancedmesh/85156
  - InstancedMesh2: https://discourse.threejs.org/t/three-ez-instancedmesh2-enhanced-instancedmesh-with-frustum-culling-fast-raycasting-bvh-sorting-visibility-management-lod-skinning-and-more/69344
  - octahedral-impostor forest: https://discourse.threejs.org/t/a-forest-of-octahedral-impostors/85735
  - render bundles and MRT: https://discourse.threejs.org/t/does-renderbundle-support-mrt/74003
  - pointer-lock errors: https://discourse.threejs.org/t/how-to-avoid-pointerlockcontrols-error/33017
- Toji:
  - indirect draws: https://toji.dev/webgpu-best-practices/indirect-draws
  - render bundles: https://toji.dev/webgpu-best-practices/render-bundles
- Kitware WebGPU occlusion culling: https://www.kitware.com/webgpu-occlusion-culling-in-vtk/
- Cinevva (a browser engine):
  - terrain occlusion: https://app.cinevva.com/blog/2026-05-19-terrain-occlusion-culling
  - Hi-Z pitfalls: https://app.cinevva.com/blog/2026-05-07-open-world-browser-part-22-clouds-and-meshlets
  - foliage overdraw: https://app.cinevva.com/blog/2026-05-11-foliage-overdraw
- Octahedral impostors: https://80.lv/articles/impostor-baker-for-ue4/
- Chrome:
  - fragment_depth and early-Z: https://developer.chrome.com/blog/new-in-webgpu-155-156
  - multi-draw indirect: https://developer.chrome.com/blog/new-in-webgpu-131
  - WebGPU developer features: https://developer.chrome.com/docs/web-platform/webgpu/developer-features
  - background tabs: https://developer.chrome.com/blog/background_tabs
  - aligned input events: https://developer.chrome.com/blog/aligning-input-events
  - pointer-lock permission: https://developer.chrome.com/blog/keyboard-lock-pointer-lock-permission
- Pointer lock:
  - web.dev raw input: https://web.dev/articles/disable-mouse-acceleration
  - spec: https://www.w3.org/TR/pointerlock-2/
- MDN:
  - limits: https://developer.mozilla.org/en-US/docs/Web/API/GPUSupportedLimits
  - CSP wasm: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/script-src
- NVIDIA:
  - depth precision: https://developer.nvidia.com/content/depth-precision-visualized
  - Reflex: https://www.nvidia.com/en-us/geforce/news/reflex-2-even-lower-latency-gameplay-with-frame-warp/
- Microsoft shadow techniques: https://learn.microsoft.com/en-us/windows/win32/dxtecharts/common-techniques-to-improve-shadow-depth-maps
- XeGTAO: https://raw.githubusercontent.com/GameTechDev/XeGTAO/master/README.md
- Fix Your Timestep: https://gafferongames.com/post/fix_your_timestep/
- Rapier character controller: https://rapier.rs/docs/user_guides/javascript/character_controller
- Accessibility:
  - FOV: https://gameaccessibilityguidelines.com/?p=93
  - motion: https://gameaccessibilityguidelines.com/?p=187
  - Xbox XAG 117: https://devdocs.xbox.com/gaming/accessibility/xbox-accessibility-guidelines/117
- Walking speed: https://ijbes.utm.my/index.php/ijbes/article/view/1343
- Aquatic gait: https://www.ewacmedical.com/wp-content/uploads/2022/03/Jung-2018-The-influence-of-water-depth-on-kinematic-and-spatiotemporal-gait-parameters-during-aquatic-treadmill-walking.pdf
- Unreal CharacterMovement: https://dev.epicgames.com/documentation/en-us/unreal-engine/python-api/class/CharacterMovementComponent
- Maine IF&W ice safety: https://www.maine.gov/ifw/programs-resources/outdoor-safety/ice-safety-tips.html
- Unreal grass varieties: https://docs.unrealengine.com/4.27/API/Runtime/Landscape/FGrassVariety/index.html
