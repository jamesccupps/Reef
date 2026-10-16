# Browser 3-D rendering of a whole real lake (above and below water) with thousands of animated fish, as a full-screen living screensaver beside a Web Worker simulation

Researched 2026-10-15. Two kinds of evidence are used:
- **Web sources**, cited inline.
- **First-hand measurements made for these notes** (marked **[measured]**).
  - Machine and browser: the user's machine, in the Claude desktop app's built-in Chromium pane. The GPU was an NVIDIA GeForce RTX 3060 (desktop, Ampere): WebGL2 via ANGLE/D3D11, WebGPU via Dawn. The browser was Chrome 152.0.7977.
  - three.js: r186 (npm 0.186.0), loaded from jsDelivr.
  - Server: a scratch localhost server that set a CSP and COOP/COEP.

**Method for the GPU numbers.** All of these points apply to the GPU timings unless a row says otherwise:
- **The scene:** one instanced draw with an `InstancedBufferGeometry`. Each fish has two vec4s per instance: (x, y, z, heading) and (phase, beat speed, size, colour).
- **The vertex shader:** it makes the fish swim with a travelling body wave (an ABZÛ/Godot-style sine wave masked toward the tail), then applies yaw and translation. Shading is Lambert plus exponential fog.
- **The layout:** the fish are spread through a 70 × 14 × 70 m volume, with the camera 48 m away.
- **Throughput:** 30 frames are rendered back to back, then a sync readback, and the total is divided by 30.
- **GPU time:** the median of 20 `EXT_disjoint_timer_query_webgl2` queries, or for WebGPU the median of 10 `resolveTimestampsAsync('render')` calls.
- **Canvas size:** the backing store was set to exactly 1920×1080 or 3440×1440.

The numbers are only a guide. The preview pane is not the user's real Chrome, and the GPU clocks change between the bursts of work. The first configuration of each run is noisy.

## 1. Which stack: three.js vs Babylon.js vs raw WebGL2 vs WebGPU; WebGPU availability in 2026; CDN ES modules, import maps and pinning under a strict CSP

### Takeaway
three.js r186 is the practical choice for a no-bundler, CSP-strict project.
- **Pinning:** pin `three@0.186.1` (published 2026-09-24, older than two weeks) or 0.186.0.
- **Loading:** use native ES modules through an inline import map that the CSP allows **by sha256 hash** (verified).
- **Renderer:** prefer `WebGPURenderer`. It falls back to WebGL2 automatically, and its TSL node materials compile to WGSL or GLSL. Measured, it costs the same on the GPU as `WebGLRenderer` for instanced fish.
- **Cost of that choice:** GLSL `ShaderMaterial`, `onBeforeCompile` and `EffectComposer` must be ported to TSL. Its own manual still calls it "experimental".
- **WebGPU coverage:** WebGPU is on by default in Chrome and Edge (Windows, macOS, ChromeOS), Safari 26, and Firefox (Windows; macOS on Apple Silicon). It is still rolling out on Linux and Android.
- **Babylon.js:** it is viable, but its ES build is thousands of unbundled modules, or a 7.9 MB UMD file.

### Cited Findings

**three.js versions and packaging**

- **Recent releases:**
  - r183: 20 Feb.
  - r184: 16 Apr.
    - TSL compiles about 3× faster.
    - `compileAsync()` became non-blocking.
    - A NodeMaterial compatibility layer was added to WebGLRenderer.
  - r185: 1 Jul.
    - WebGPURenderer gained WebXR support.
    - InstancedMesh fully supports render bundles.
    - TSL gained `storageTexture3D`.
  - r186: 24 Sep.
    - WebGPURenderer gained `compileComputeAsync()`.
    - WebGLRenderer gained a `SunLight` with cascaded shadow maps.
    - The PCFSoftShadowMap code was removed.
    - BatchedMesh draw-offset fixes.

  Source: [three.js releases](https://github.com/mrdoob/three.js/releases).
- **npm publish times** ([npm registry](https://registry.npmjs.org/three)):

  | Version | Published |
  |---|---|
  | 0.183.0 | 2026-02-18 |
  | 0.184.0 | 2026-04-16 |
  | 0.185.0 | 2026-06-25 |
  | 0.185.1 | 2026-07-01 |
  | 0.186.0 | 2026-09-08 |
  | 0.186.1 | 2026-09-24 (`latest`) |
- **cdnjs builds only:** cdnjs hosts 0.186.1, but only the 10 build files: `three.core`, `three.module`, `three.tsl`, `three.webgpu` and `three.webgpu.nodes`, each with a `.min` copy ([cdnjs](https://cdnjs.com/libraries/three.js)). **[measured]** cdnjs returns 404 for `examples/jsm/objects/Water2.js`, so the addons must come from jsDelivr (`/npm/three@0.186.0/examples/jsm/…`, which returns 200).
- **CDN headers [measured]:** jsDelivr and cdnjs both send `Access-Control-Allow-Origin: *`, `Cross-Origin-Resource-Policy: cross-origin` and a one-year `immutable` cache header for `three.module.min.js`. unpkg returned 404 for `three@0.186.0/build/…` when tested with curl.
- **Bare `three` specifier [measured]:**
  - The addons import the bare specifier `'three'`, so an import map (or a rewrite) is required.
  - `package.json` `exports` maps `three/webgpu` → `build/three.webgpu.js`, `three/tsl` → `build/three.tsl.js` and `three/addons/*` → `examples/jsm/*`.
  - three's own examples use exactly this import map: `three` and `three/webgpu` → `three.webgpu.js`, `three/tsl` → `three.tsl.js`, `three/addons/` → `./jsm/` ([three.js manual: WebGPURenderer](https://github.com/mrdoob/three.js/blob/r186/manual/pages/webgpurenderer.html)).
- **No more classic-script build [measured on jsDelivr]:** the UMD `build/three.js` last exists in 0.160.0 and returns 404 from 0.161.0. `examples/js/` (the prototype viewer's `OrbitControls.js`) last exists in 0.147.0. The r128 prototype (`tools/hotbrook/viewer.html`) therefore cannot be upgraded by bumping the version: it must move to ES modules.
- **Build sizes [measured, r186]:**

  | File | Raw | gzip | Note |
  |---|---|---|---|
  | `three.core.js` | 1,458,113 B | 288 KB | 266 KB brotli as served by jsDelivr |
  | `three.core.min.js` | 416 KB | 105 KB | |
  | `three.module.min.js` | 392 KB | 90 KB | |
  | `three.webgpu.min.js` (cdnjs) | 2.28 MB | 447 KB | |

  **Gotcha:** the `.min` module and webgpu builds on both CDNs import `"./three.core.js"`, the *unminified* core, not `three.core.min.js`.

**WebGPURenderer**

- **The manual** ([manual](https://github.com/mrdoob/three.js/blob/r186/manual/pages/webgpurenderer.html)):
  - `WebGPURenderer` "can automatically fall back to using a WebGL 2 backend". `forceWebGL: true` forces that fallback.
  - Initialization is async: use `setAnimationLoop()` or `await renderer.init()`.
  - `ShaderMaterial`, `RawShaderMaterial` and `onBeforeCompile()` "are not supported … must be ported to node materials and TSL". `EffectComposer` is not supported; post-processing is a TSL node chain.
  - "The renderer itself is still in an experimental state … you will encounter missing features or a better performance with `WebGLRenderer`".
  - `WebGLRenderer` "is still maintained and the recommended choice for pure WebGL 2 applications", but it will get no large new features.

**WebGPU availability** (per [web.dev, 25 Nov 2025](https://web.dev/blog/webgpu-supported-major-browsers) unless noted)

| Browser | Status |
|---|---|
| Chrome / Edge | From 113 on Windows (D3D12), macOS and ChromeOS. Android from Chrome 121, on Android 12+ with Qualcomm or ARM GPUs. Linux in progress. |
| Firefox | 141 on Windows. 145 on macOS Tahoe 26, ARM64 only. Linux and Android in progress. |
| Safari | macOS Tahoe 26, iOS / iPadOS 26, visionOS 26 |

- **Firefox 141 caveats:** WebGPU shipped "only on Windows". Its known limits were unbuffered IPC overhead (improved in 142), latency from a polling timer, and no `importExternalTexture` ([Mozilla gfx blog](https://mozillagfx.wordpress.com/2025/07/15/shipping-webgpu-on-windows-in-firefox-141/)).
- **Firefox 147 (13 Jan 2026)** added WebGPU on Apple Silicon for all supported macOS versions ([Firefox 147 notes, via search](https://www.firefox.com/firefox/147.0/releasenotes/)).
- **Firefox on Linux:** I found no confirmation that it shipped on stable.
- **Safari:** `navigator.gpu` requires macOS Tahoe, iOS 26 or visionOS 26 ([WebKit bug 299237](https://bugs.webkit.org/show_bug.cgi?id=299237)).
- **caniuse disagrees:** it lists Firefox as "disabled by default" through 161 and Safari macOS 26.x as "partial", with 87.8% global support ([caniuse](https://caniuse.com/webgpu)).
- **This machine [measured]:**
  - `navigator.gpu` reported an `nvidia`/`ampere` adapter.
  - Features: `timestamp-query`, `shader-f16`, `float32-filterable`, `float32-blendable`, `texture-compression-bc`, `indirect-first-instance`.
  - Limits: `maxStorageBuffersPerShaderStage` 16, `maxTextureDimension2D` 16384.
  - WebGL2 exposes `EXT_disjoint_timer_query_webgl2`, S3TC, BPTC and `EXT_color_buffer_float`.
  - Chrome logged: "The powerPreference option is currently ignored when calling requestAdapter() on Windows (crbug.com/369219127)". That matters for hybrid-GPU laptops.

**CSP and import maps**

- **Spec background:** an inline import map is "script-like", so it falls under `script-src` ([WICG import-maps #105](https://github.com/WICG/import-maps/issues/105)). Practitioners must add a nonce or hash to inline import maps ([TYPO3 #97068](https://forge.typo3.org/issues/97068)).
- **Blocked without a hash [measured]:** under `script-src 'self' https://cdn.jsdelivr.net`, Chromium blocked the inline import map with "Executing inline script violates … Either the 'unsafe-inline' keyword, a hash ('sha256-…'), or a nonce … is required", and then `Failed to resolve module specifier 'three'`.
- **Loads with the hash [measured]:** adding `'sha256-<base64 of the exact map text>'` to `script-src` let three r186 plus the `Sky` addon load. The cold import took 265 ms; the warm one took 39 ms.

**Babylon.js**

- **Packages:** `@babylonjs/core` latest is 9.31.0 on jsDelivr **[measured]**. Its ES package is about 6,663 files in 9.0.0 (jsDelivr flat listing) **[measured]**. The UMD `babylonjs@9.0.0/babylon.js` is 7.9 MB **[measured]**, and cdnjs lists `babylonjs` 9.0.0 **[measured, cdnjs API]**.
- **Hosting:** the ES6 packages are not on Babylon's own CDN, and that CDN is "not for production" ([Babylon forum](https://forum.babylonjs.com/t/problems-loading-babylon-via-es-modules/2031?page=2)). Using them from a CDN with an import map has hit CORS and path problems (same thread).
- **Snapshot rendering:** Babylon's WebGPU "Snapshot Rendering" (GPU render bundles) renders some scenes about 10× faster ([web.dev](https://web.dev/blog/webgpu-supported-major-browsers)).

### Inferences
- **Recommended stack:** three.js r186 `WebGPURenderer` with TSL, taking the WebGL2 fallback automatically.
  - Native ES modules from jsDelivr (it hosts both the builds and the addons, so one origin).
  - An inline import map whose sha256 hash goes in `script-src`.
  - Pin an exact version in every URL.
- **Optional minified core:** to load the minified core, add an import-map entry that remaps the full URL `…/build/three.core.js` → `…/build/three.core.min.js`. Import maps can remap absolute URLs, but **I did not test this**.
- **Project wiring.** The project's CSP is currently `script-src 'self'` in three places (`index.html` meta, `serve.mjs`, `serve.py`). `test/ui-check.mjs` asserts `/script-src 'self'(;|$)/` and `!csp.includes('unsafe-')`. Adopting a CDN therefore means:
  1. adding `https://cdn.jsdelivr.net` plus the import-map hash in all three places;
  2. updating the ui-check regex;
  3. adding `https://cdn.jsdelivr.net` to `connect-src` only if loaders fetch from the CDN.
- **Alternative to the CDN:** vendor the pinned three.js files into the repo. `'self'` then covers everything, with no CDN origin, though an inline import map still needs its hash. **This is lower-risk for an offline screensaver.**
- **WASM loaders and the CSP.** `KTX2Loader` (Basis transcoder) and `DRACOLoader` load `.wasm`. KTX2Loader also spawns its worker from a `blob:` URL (`URL.createObjectURL(new Blob(...))`, verified in r186 source). Using them needs:
  - `'wasm-unsafe-eval'` in `script-src`, which would trip the project's no-`unsafe-` test;
  - `worker-src blob:`.

  Prefer offline-prepared textures that need no WASM:
  - KTX2 or DDS already in BC1/BC3/BC7, which this desktop GPU supports (S3TC and BPTC are exposed);
  - or plain WebP/JPEG via `ImageBitmapLoader`.
- **Why not raw WebGL2 or WebGPU:** the project already owns a raw WebGL2 presenter (`glpost.js`). A full 3-D renderer with shadows, PBR, culling, loaders, LOD, reflections and post-processing is a large rewrite that three.js already provides. Raw WebGPU only makes sense for a narrow compute pass (e.g. GPU boids), and TSL compute covers that too.
- **Engine timing pitfall [measured].** In r186, `WebGPURenderer` advances its node frame (`nodeFrame.update()`) inside its internal requestAnimationFrame loop. `PassNode` scene passes update once per frame. Calling `RenderPipeline.render()` several times between animation ticks therefore reuses a stale scene pass: the "frames" took 0.28 ms until the frame was advanced manually. So:
  - drive rendering with `renderer.setAnimationLoop()`;
  - when rendering several views per tick (e.g. reflection, minimap), check that the passes re-render.

### Gaps
- No authoritative 2026 statement on Firefox WebGPU for Linux and Intel Macs, or Chrome on Linux. caniuse contradicts Mozilla's own posts.
- No published head-to-head three.js vs Babylon.js benchmark for large instanced scenes in 2026.
- The import-map trick of remapping `three.core.js` to `three.core.min.js` is untested.
- Whether a `<meta>` CSP plus a hash behaves identically in Firefox and Safari was not tested; only Chromium was.

## 2. Rendering 2k–20k (or more) animated fish cheaply

### Takeaway
One instanced draw per species/LOD with vertex-shader swimming (no skeletons) is the proven technique: ABZÛ went from about 100 to 10,000 on-screen fish with it. On an RTX 3060, 20,000 fish of 288 triangles cost about 1.2–1.5 ms of GPU time at 1080p/3440×1440 **[measured]**, and the cost scales roughly linearly with triangles. The real limit is soon the CPU's per-frame JS loop over fish (≈45 ns per fish **[measured]**). So the sim snapshots should be uploaded once per sim step and interpolated on the GPU.

### Cited Findings

**The ABZÛ / Godot technique**

- **ABZÛ:** the developers removed the skeleton and drove fish motion "through mathematical equations", which "meant they went from having 100 on-screen fish to 10,000" ([GodisAGeek ABZÛ preview](https://godisageek.com/2016/07/abzu-e3-hands-on-preview/)). The art talk was Matt Nava's GDC 2017 "Creating the Art of ABZÛ", which covered "animating vast amounts of fish" and kelp ([GDC Vault](https://www.gdcvault.com/play/1024409/Creating-the-Art-of-ABZ); [Game Developer](https://www.gamedeveloper.com/art/video-creating-the-striking-underwater-seascapes-of-i-abzu-i-)).
- **Godot's ABZÛ-derived recipe** ([Godot docs: animating thousands of fish](https://docs.godotengine.org/en/stable/tutorials/performance/vertex_animation/animating_thousands_of_fish.html)):
  - **The four motions:** side-to-side `x += cos(t)*k`, pivot (rotate xz by `cos(t)*0.1*k`), wave `x += cos(t + body)*k`, and twist (rotate xy by `cos(t+body)*0.3*k`).
  - **The mask:** `body = (z+1)/2`, and `mask = smoothstep(a, b, 1 - body)` limits the wave and twist to the rear. The twist uses `mix()`, so the fish does not shrink.
  - **Per-instance variation:** custom data holds a phase offset (`+ 6.28318 * custom.x`) and a speed of 0.5–1.5× (`custom.y`).
  - **Format:** byte-format custom data is "faster" than float.
  - **Performance:** no frame-time numbers are given.

**GPU flocking in three.js examples**

- **`webgpu_compute_birds`** runs `BIRDS = 8192` with a TSL compute pass that loops over all birds (O(N²)) and renders an `InstancedMesh`. It needs `requiredLimits: { maxStorageBuffersInVertexStage: 3 }`, so it is a WebGPU-only path ([r186 example source](https://github.com/mrdoob/three.js/blob/r186/examples/webgpu_compute_birds.html)).
- **The WebGL path** is `webgl_gpgpu_birds` with `GPUComputationRenderer`, which keeps state in ping-pong float textures, one texel per boid ([three.js docs](https://threejs.org/docs/pages/GPUComputationRenderer.html)).

**Per-instance culling and LOD**

- **InstancedMesh2** (`@three.ez/instanced-mesh`) adds per-instance frustum culling, BVH raycasting, sorting and LOD (`addLOD(geometry, material, distance)`) ([three.js forum](https://discourse.threejs.org/t/three-ez-instancedmesh2-enhanced-instancedmesh-with-frustum-culling-fast-raycasting-bvh-sorting-visibility-management-lod-skinning-and-more/69344)).
- **Culling can cost more than it saves:** a forum user notes that reordering instance buffers in JS every frame "can cost more than just drawing everything" ([forum](https://discourse.threejs.org/t/ideas-on-performing-fast-per-instance-frustum-culling-on-instancedmesh/85156)).
- **Upstream support:** r186 ships `webgl_batch_lod_bvh` (`@three.ez/batched-mesh-extensions`), and r185 made InstancedMesh fully support WebGPU render bundles ([releases](https://github.com/mrdoob/three.js/releases)). Examples `webgpu_struct_drawindirect`, `webgpu_instance_*` and `webgpu_skinning_instancing` exist ([examples list](https://github.com/mrdoob/three.js/blob/r186/examples/files.json)).
- **The impostor pose problem:** an impostor is a camera-facing quad that samples a pre-rendered view atlas, so a baked impostor freezes one animation pose ([cinevva impostors write-up](https://app.cinevva.com/blog/2026-05-04-open-world-browser-part-19-imposters)).

**Historical WebGL Aquarium anecdotes** (old, informal, each fish its own draw)

- An Intel HD 4400 held 60 fps up to about 500 fish and about 32 fps at 4,000 ([Ubuntu Forums](https://ubuntuforums.org/archive/index.php/t-2255009.html)).
- Chromium ran about 40 fps at 20,000 fish ([Habr Q&A](https://qna.habr.com/q/828431)).
- A host GPU held 60 fps at 10,000 ([virglrenderer #57](https://gitlab.freedesktop.org/virgl/virglrenderer/issues/57)).

**Fish GPU cost [measured]** (WebGL2 `WebGLRenderer`, GLSL `ShaderMaterial`; GPU ms from timer queries)

| Fish model | Size | 2k | 10k | 20k | 50k | 100k |
|---|---|---|---|---|---|---|
| 288-tri body | 1080p | 0.2–1.2* | 0.66 | 1.27 | 2.93 | 5.77 |
| 288-tri body | 3440×1440 | 0.20 | 0.80 | 1.52 | 3.58 | 6.99 |
| 64-tri body | 1080p | 0.07 | 0.26 | 0.47 | 1.10 | 2.97 |
| 64-tri body | 3440×1440 | 0.15 | 0.48 | 0.83 | 1.88 | 2.98 |
| 2-tri card | 1080p | 0.02 | 0.06 | 0.09 | 0.17 | 1.22 |
| 2-tri card | 3440×1440 | 0.19 | 0.64 | 0.97 | 1.65 | (0.46 outlier) |

\*The first configuration of the run was noisy.

- **Clear only:** an empty frame (clear) took 0.2 ms at 1080p and 0.46 ms at 3440×1440 throughput.
- **WebGPU backend** (`WebGPURenderer` + TSL `positionNode`, same scene; timestamps quantised to 0.0655 ms) — similar numbers:

  | Fish model | 1080p 20k | 1080p 50k | 1080p 100k | 3440×1440 20k | 3440×1440 50k | 3440×1440 100k |
  |---|---|---|---|---|---|---|
  | 288-tri | 1.18 | 2.69 | 5.51 | 1.51 | 3.41 | 6.82 |
  | 64-tri | 0.52 | 1.18 | 2.36 | 0.72 | 1.44 | 2.62 |
  | Card | 0.20 | 0.20 | 0.26 | 0.33 | 0.46 | 0.59 |

  The CPU cost of the `renderer.render()` call was 0.2–1.0 ms.
- **The same TSL material under `forceWebGL: true`:** 288-tri at 20k was 1.25 / 1.54 ms and at 50k was 2.90 / 3.57 ms (1080p / 3440×1440). The fallback costs the same GPU time, and r186 timestamps worked on it.
- **CPU per-frame instance update:** a JS loop moving each fish (cos/sin) plus an upload flag took 0.09 ms at 2k, 0.45 at 10k, 0.89 at 20k, 2.15 at 50k and 4.3–4.7 at 100k (≈45 ns per fish).

### Inferences
- **A fish budget for the 21:9 screen on an RTX 3060-class GPU:** 20k on-screen fish at 64–288 triangles is about 0.5–1.5 ms. Even 50k mid-LOD fish is under 2 ms, so fish are not the bottleneck there.
- **On an integrated GPU, the same 20k fish at 288 triangles** might take about 6–9 ms. That is an **estimate**, scaled by FP32 throughput (Section 7). Use LOD: a hero mesh within about 15 m, a 64-triangle mid mesh, and cards or point-sprites beyond about 60 m or once below about 6 px. Because one fish model, one instanced draw, and a 2-tri card are so cheap **[measured]**, per-instance CPU culling is probably not worth its cost for fish; distance/LOD bucketing on the GPU (compute culling + indirect draw in WebGPU) is the better long-term route.
- **Move the interpolation to the GPU:**
  1. Upload two snapshots per sim step (previous and current: x, y, z, heading, plus a pose/beat-phase field) as instanced attributes or storage buffers.
  2. Interpolate in the vertex shader with a uniform `alpha`, taking the shortest arc for heading.
  3. Per frame the CPU then only sets a uniform. That removes the ≈45 ns × N per-frame JS loop (0.9 ms at 20k, measured) and the per-frame upload; uploads happen only at 30 Hz.
  4. The existing render-only fields (`_px/_py/_ph`) map to these attributes.
- **Drawing a "school" super-individual as K visual fish.** The sim's young-of-year schools are single records with `n` fish. Spawn K = min(n, cap) visual instances whose offsets from the school centroid are deterministic hashes of `(schoolId, i)`, animated with low-frequency noise in the vertex shader (milling, polarisation following the school heading). No per-fish CPU state is needed, and it is cosmetic-only (`Math.random`-style), so the sim's determinism is untouched. True GPU boids (`webgpu_compute_birds`-style) are possible in WebGPU but O(N²) per school unless binned. They also need storage buffers in the vertex stage, which the WebGL2 fallback lacks.
- **Species looks:** per-species meshes, or a shared mesh plus an atlas of side-pattern textures indexed by an instance attribute. Size and sex/colour can be per-instance; one draw per species and LOD gives about 8 species × 3 LOD ≈ 24 draws.
- **Wildlife:** the loon, turtles and frogs are few. Use ordinary skinned glTF meshes with `AnimationMixer`, or `webgpu_skinning_instancing` if frogs or tadpoles number in the hundreds.

### Gaps
- No published frame times for a three.js fish school at these counts on *integrated* GPUs. The integrated-GPU figures above are extrapolations.
- The measurements used a synthetic sphere-fish with no textures, no shadows and no transparency. Real fish with alpha-tested fins, shadow casting and an extra reflection pass will cost more.
- The ABZÛ talk's exact numbers (instance counts, LOD tiers, CPU vs GPU boids) were not retrievable as text. The video is at youtube.com/watch?v=DuoZsrUcdd8 per Game Developer.

## 3. Water: surface, view from below (Snell's window and total internal reflection), brown-water underwater fog, caustics, god rays, crossing the surface, ice and snow

### Takeaway
three.js r186 provides most of the building blocks, all in TSL:
- `Water2Mesh` (planar reflection plus *screen-space* refraction from the opaque-pass colour buffer);
- `WaterMesh` (reflection at 0.5 resolution scale);
- a "backdrop water" example with a depth-based refraction and underwater post-mask;
- projected caustics;
- height fog;
- god-ray and volumetric-lighting examples.

Snell's window is a one-line test, `sinθ·n < 1`, so the cone is about 97° wide. Underwater colour should be per-channel Beer–Lambert, with blue extinguished fastest in tea-coloured water. Crossing the surface is best done Crest-style: a full-screen underwater pass chosen by the camera's signed height, and a waterline/meniscus band.

### Cited Findings

**Surface water in three.js**

- **`Water` (WebGL, `Water.js`):**
  - It renders a reflection into a 512×512 texture by default, which costs a re-render of the scene, and works only with `WebGLRenderer`; with WebGPU use `WaterMesh` ([three.js docs: Water](https://threejs.org/docs/pages/Water.html)).
  - Options: `waterNormals`, `sunDirection`, `distortionScale`, `alpha`, `fog`.
- **`WaterMesh` (WebGPU):** it uses `reflector()` with `resolutionScale` defaulting to **0.5** ([WaterMesh.js r186](https://github.com/mrdoob/three.js/blob/r186/examples/jsm/objects/WaterMesh.js)).
- **`Water2Mesh` (WebGPU):** it uses `reflector()` for reflection and `viewportSharedTexture(viewportSafeUV(screenUV + offset))` for refraction. That refraction is screen-space and needs no second scene render ([Water2Mesh.js r186](https://github.com/mrdoob/three.js/blob/r186/examples/jsm/objects/Water2Mesh.js)).
- **`webgpu_backdrop_water`:**
  - Refraction uses `viewportSharedTexture` plus the depth difference `viewportLinearDepth - linearDepth()`. A depth test rejects refracted UVs that land in front of the surface.
  - Floor "caustics" are `voronoi3d(positionWorld*6, t)`, faded by depth and by the normal's y component.
  - Underwater post: a `waterMask = cameraY > (screenUV.y - 0.5) * camera.near` selects between above and below views per pixel, applying a depth-driven Gaussian blur, a tint and a vignette when underwater.

  Source: [example source r186](https://github.com/mrdoob/three.js/blob/r186/examples/webgpu_backdrop_water.html).
- **`webgpu_caustics`:** it projects a tiling caustic texture through a light's shadow map, with `renderer.shadowMap.transmitted = true`, a `HalfFloatType` 1024² shadow map and per-channel offsets for chromatic aberration ([example source r186](https://github.com/mrdoob/three.js/blob/r186/examples/webgpu_caustics.html)).
- **Other examples in r186:** `webgpu_volume_caustics`, `webgpu_ocean`, `webgpu_water`, `webgpu_compute_water`, `webgl_gpgpu_water`, `webgpu_postprocessing_godrays`, `webgpu_volume_lighting`, `webgpu_custom_fog_scattering` and `webgpu_fog_height` ([files.json](https://github.com/mrdoob/three.js/blob/r186/examples/files.json)).

**Snell's window and total internal reflection**

- **Geometry:** Snell's window compresses the 180° above-water view into a cone of about 96–97°. Outside it the surface shows either darkness or a reflection of the bottom by total internal reflection. Brightness falls to nothing at the window's edge, and ripples distort or break the image ([Wikipedia: Snell's window](https://en.wikipedia.org/wiki/Snell%27s_window)).
- **Shader test:** `step(sqrt(1 - cosθ²) * ior, 1.0)`, applied only on back faces (seen from below) ([godotshaders: Snell's Window](https://godotshaders.com/shader/snells-window/)).

**Crossing the surface (Crest)**

- **The pass:** an "Underwater Renderer" full-screen effect runs between the transparent and post-processing passes. The ocean surface's underside must render (cull off / double-sided).
- **Switching:** the effect "is disabled if the viewpoint is not underwater". `ViewerHeightAboveWater` gives the signed camera height.
- **The meniscus:** an optional line where the lens meets the water helps the transition.
- **Transparency:** transparent objects are handled poorly. Underwater fog must be applied in their shaders.

Source: [Crest docs: Underwater](https://crest.readthedocs.io/en/4.23.0/user/underwater.html).

**Caustics**

- **Evan Wallace:** approximates the light wavefront with a mesh, each vertex a light ray, and projects the refracted rays onto the floor ([Evan Wallace, Medium](https://medium.com/@evanwallace/rendering-realtime-caustics-in-webgl-2a99a29a0b2c), summarised via search; the page returned 403).
- **three.js ports:** Martin Renou's demo is [threejs-caustics](https://github.com/martinRenou/threejs-caustics) ([forum](https://discourse.threejs.org/t/3d-water-caustics-rendering/18232)).
- **GPU Gems:** the "Rendering Water Caustics" chapter by Guardado and Sánchez-Crespo (GPU Gems 1, ch. 2) is an *aesthetics-driven*, not physically exact, technique ([NVIDIA](https://developer.nvidia.com/gpugems/gpugems/part-i-natural-effects/chapter-2-rendering-water-caustics)).

**God rays**

- Mitchell's "Volumetric Light Scattering as a Post-Process" (GPU Gems 3, ch. 13) is a screen-space radial-blur "god rays" method ([NVIDIA](https://developer.nvidia.com/gpugems/gpugems3/part-ii-light-and-shadows/chapter-13-volumetric-light-scattering-post-process)).

**Water optics for the attenuation model**

- **Secchi to Kd:** `k ≈ 1.7 / Secchi depth` ([UNCW Secchi notes](https://people.uncw.edu/cahoon/Secchi.htm)). Holmes (1970) found 1.4 better in turbid estuaries ([Frontiers in Marine Science 2024](https://www.frontiersin.org/journals/marine-science/articles/10.3389/fmars.2024.1265382/epub)).
- **CDOM spectral slope:** the UV model is `Kd(λ) = Kd(440)·exp(−S(λ−440))`, with S ≈ 0.0151 nm⁻¹ (CV 7%), from subarctic and Arctic lakes ([Laurion, Vincent & Lean 1997, Photochem. Photobiol.](https://hero.epa.gov/hero/index.cfm/reference/details/reference_id/1726368)). It is fitted for UV, not the visible.

**Post-processing cost [measured]** (WebGPU, 20k fish of 288 triangles plus a lit 400 m bed plane; GPU ms at 1080p / 3440×1440)

| Pipeline | 1080p | 3440×1440 |
|---|---|---|
| Direct | 1.18 | 1.51 |
| HDR scene pass | 1.11 | 1.44 |
| + bloom | 1.31 | 1.97 |
| + per-pixel per-channel Beer–Lambert depth fog + bloom | 1.31 | 1.90 |
| Same at scene-pass `setResolutionScale(0.75)` | 1.38 | 1.57 |
| Same at `setResolutionScale(0.5)` | 1.38 | 1.51 |

- **CPU throughput** rose from about 1.7 ms to about 2.7 ms per frame with the bloom chain, because it submits more passes.

### Inferences
- **Above water, use `Water2Mesh`-style rendering:**
  - **Reflection:** one planar reflection at 0.5 scale or less. Render only above-water layers in it (sky, terrain, trees, loon), never fish or the bed.
  - **Refraction:** screen-space from `viewportSharedTexture`, so there is no second render.
  - **Wind ripples:** two scrolling normal maps whose speed and strength come from the sim's wind. The lakes are small and shallow, so FFT ocean waves are unnecessary.
  - **Colour:** it should come from the underwater colour model, not a fixed blue.
- **From below:** draw the surface's back faces with:
  - inside the Snell window (`n·sinθ < 1`, n ≈ 1.333, critical angle ≈ 48.6°): the refracted sky/shore, sampled from a cheap low-res sky/environment cubemap rather than the reflection target;
  - outside the window: total internal reflection of the underwater fog colour (mirroring the bed would need a second pass);
  - a Fresnel fade to dark at the window edge;
  - smoothstep-feathered edges, perturbed by the ripple normal map.
- **Tea-coloured water** (Secchi ≈ 3.8 m):
  - Kd(PAR) ≈ 1.7 / 3.8 ≈ 0.45 m⁻¹, or ≈ 0.37 with 1.4.
  - Use per-channel extinction along the *view ray* and the *sun path* with blue ≫ green > red, e.g. RGB extinction of roughly 0.35 / 0.5 / 1.6 m⁻¹ to start. **These numbers are an estimate, to be tuned against photos.** Pure-water red absorption and CDOM blue absorption both act.
  - My fog pass's illustrative coefficients cost nothing measurable **[measured]**, so do it per pixel at full resolution from linear depth.
  - Feed the sim's `TURBIDITY`/phyto fields in later to vary Kd in space and time.
- **Caustics:** use the cheap projected-texture or voronoi approach, multiplied by `exp(−Kd·depth)` and faded out below about 2 m. At Secchi 3.8 m, caustic contrast is low, and their visible range is a judgement call, to be tuned by eye. Wallace-style mesh caustics are overkill for a 5.5 m brown lake.
- **God rays:**
  - a half-resolution screen-space radial blur when the sun is in view through Snell's window;
  - or a raymarched shadow-map volumetric pass at half resolution with a bilateral upsample.

  Both are fill-bound, so they are good dynamic-resolution targets.
- **Crossing the surface:**
  - Compute the camera's signed height above the local water level (lake level from the sim).
  - Per pixel, decide above or below by intersecting the near plane with the water plane: the backdrop example's `waterMask` does exactly this for a horizontal surface.
  - Draw a thin meniscus band where the near plane cuts the surface.
  - Switch fog, exposure and audio when the eye crosses.
- **Ice and snow:** a separate ice mesh over the water, with states driven by the sim's `ICE` block:
  - clear "black" ice: a transparent dark slab with a refraction tint and bubble streaks;
  - white ice: opaque, high albedo;
  - snow on ice: an opaque, diffuse white layer.

  Underwater under ice, scale the light by the ice/snow transmittance and remove the Snell window. This needs physical values from the limnology notes.

### Gaps
- No source found for visible-band Kd spectra of humic lakes at about 4 m Secchi. The RGB coefficients above are uncalibrated estimates.
- No source for real-time lake-ice rendering techniques. That design is inference only.
- Crest's meniscus and waterline shader internals were not documented on the pages read.
- Evan Wallace's article text could not be fetched (403); its description comes from search snippets.

## 4. Terrain, lake bed, forest and aquatic plants, seasons

### Takeaway
- **Terrain and bed:** one continuous heightfield covering land and bathymetry, rendered with CDLOD-style quadtree LOD (one grid patch instanced at power-of-two scales, sampling a heightmap texture with vertex morphing and no seams). Drape NAIP imagery on land and procedural sediment on the bed.
- **Trees:** instanced, with a full / simplified / octahedral-impostor LOD chain. A 200k-tree forest has been shown in three.js this way.
- **Aquatic plants:** instanced cards or ribbons swaying in the vertex shader. Keep total triangles near about 3 M on mid-range hardware.

### Cited Findings
- **CDLOD** (Strugar 2010) renders heightmap terrain from a quadtree of regular grids. Each vertex is morphed between LOD levels by its 3-D distance to the viewer, which needs no stitching, and it runs on any Shader Model 3.0 or later hardware ([fstrugar/CDLOD](https://github.com/fstrugar/CDLOD)). A minimal web implementation exists, [tschie/terrain-cdlod](https://github.com/tschie/terrain-cdlod); its author notes it skips height in the selection test and has no frustum culling.
- **A forest of octahedral impostors (agargaro, Aug 2025):** about 200k trees, with the 3072 × 3072 terrain held in BatchedMesh plus an LOD extension (meshoptimizer meshes) ([three.js forum](https://discourse.threejs.org/t/a-forest-of-octahedral-impostors/85735)).
  - **Tree LOD:** full mesh, a meshoptimizer-simplified mesh from about 15 to 100 units, and an octahedral impostor beyond 100.
  - **Impostor atlas:** 2048 px, 16 × 16 views, hemi-octahedron.
  - **Culling and libraries:** a BVH culls; it uses InstancedMesh2.
  - **Not reported:** fps and hardware.
- **Grass at scale** ([three.js forum: 3M instanced grass](https://discourse.threejs.org/t/performance-optimizing-3m-instanced-grass-in-three-js/81286)):
  - A veteran forum member (manthrax) called about 3 M triangles total "the safe/sweet spot". This is an opinion, not a benchmark. At 20 triangles a blade, 3 M blades is about 20× over that budget.
  - "Do clumps of grass on quads instead"; overdraw is a major cost, and sorting front to back helps.
  - The original poster ran 1 M instanced blades, with fps dropping and no LOD.
- **r186 terrain-related examples:** `webgl_geometry_terrain`, `webgpu_tsl_procedural_terrain`, `webgl_batch_lod_bvh`, `webgl_instancing_scatter` and `webgl_lod` ([files.json](https://github.com/mrdoob/three.js/blob/r186/examples/files.json)).
- **Textures and compression [measured]:** this GPU has `MAX_TEXTURE_SIZE` 16384, with S3TC and BPTC (BC1–3 and BC7) compressed formats.

### Inferences
- **Heightfield size:** for about 4 × 3 km per lake from 3DEP (1 m), one R16 or R32F heightmap of about 4096 × 3072 per lake is about 24–48 MB. Use a separate higher-resolution bathymetry inset (the 1949 soundings plus area-at-depth) blended into the same field, so the shoreline is a continuous surface. The waterline is then just where height = lake level, and it shifts with the sim's water level.
- **Ortho imagery:** NAIP at about 0.6 m over 4 × 3 km is about 6.7 k × 5 k px.
  - Uncompressed RGBA8 with mips is about 177 MB; BC7 (1 B/px) is about 44 MB.
  - Pre-tile it, e.g. 2048² tiles, and pre-compress offline to BC7 in KTX2/DDS (no runtime transcoder, so no WASM under the CSP), with WebP/JPEG as the fallback.
  - Far away, the photo is enough. Up close, blend in detail textures (needle litter, grass, rock, mud), selected by slope and wetness masks.
- **The lake bed:** procedural sediment (mud, sand or gravel by depth and slope; organic flocculent in the deep basin, from the sim's `sedOM`), plus caustics in the shallows, plus the Beer–Lambert fog.
- **Trees:** instanced conifer and deciduous species, with per-instance hue for autumn and season colour (driven by the sim's year-fraction). Snow comes from blending white where `normal.y > threshold`, weighted by the sim's snow depth. Wind sway goes in the vertex shader, using the sim's `WIND`.
  - Close trees: full mesh.
  - Mid trees: a meshoptimizer-simplified mesh.
  - Far trees: octahedral impostors.
  - Very far trees: absorbed into the ortho photo.
- **Aquatic plants** (the sim's `PLANT`/`MACRO`):
  - one instanced draw per growth form (rosette, ribbon, whorled stem, lily pad), with a per-instance height (`maxH` gene), density from the sim's plant fields, and sway from the sim's current/flow field plus wave orbital motion in the shallows;
  - lily pads as instanced quads on the surface.
- **The budget:** stay under about 3 M visible triangles, measured scene-wide.

### Gaps
- No published fps for agargaro's 200k-tree demo, and none for CDLOD in three.js at this map size.
- No source checked on the exact current 3DEP/NAIP resolutions for the Hot Brook area. Those values come from the prepared data, not from this research.

## 5. Sky, sun and moon, clouds, weather, time of day

### Takeaway
r186's `Sky` and `SkyMesh` (the Preetham model) now include a built-in procedural cloud layer, so they cover most daytime and dusk needs. Cascaded-shadow `SunLight`, TSL height fog, compute-particle rain and snow (up to 50k particles plus surface ripples), volumetric clouds and god rays all exist as r186 examples. A moon, stars and night sky are not built in.

### Cited Findings
- **`Sky` / `SkyMesh` controls [measured, r186 source; [Sky.js](https://github.com/mrdoob/three.js/blob/r186/examples/jsm/objects/Sky.js), [SkyMesh.js](https://github.com/mrdoob/three.js/blob/r186/examples/jsm/objects/SkyMesh.js)]:**
  - It is "the Preetham Model, the de facto standard for analytical skydomes".
  - Atmosphere: `turbidity`, `rayleigh`, `mieCoefficient`, `mieDirectionalG`, `sunPosition`, `showSunDisc`.
  - Clouds: `cloudScale`, `cloudSpeed`, `cloudCoverage`, `cloudDensity`, `cloudElevation`. The clouds are an fbm layer projected onto a cloud plane, with "per-octave drift" so they billow.
  - No moon or star code was found in either file.
- **`SunLight` (r186):** "casts cascaded shadow maps via `SunLightShadow`, suited for lighting large scenes". With `WebGPURenderer` it must be registered with `renderer.library.addLight(SunLightNode, SunLight)` ([SunLight.js r186](https://github.com/mrdoob/three.js/blob/r186/examples/jsm/lights/SunLight.js)). The release notes add that the cascade count was reduced to 2 ([releases](https://github.com/mrdoob/three.js/releases)).
- **`webgl_lights_sunlight`** combines `Sky` (turbidity 3, rayleigh 2), `SunLight` with selectable shadow resolution (256–4096) and shadow distance (100–3000), and a fog colour lerped between "dusk" and "day" colours by daylight ([example source r186](https://github.com/mrdoob/three.js/blob/r186/examples/webgl_lights_sunlight.html)).
- **`webgpu_compute_particles_rain`:**
  - `maxParticleCount = 50000` drops, with velocity and position in `instancedArray` storage buffers updated by compute.
  - Instanced ripple particles where drops hit.
  - "Compatible with native lights and shadows using post-processing pass".

  Source: [example source r186](https://github.com/mrdoob/three.js/blob/r186/examples/webgpu_compute_particles_rain.html). `webgpu_compute_particles_snow` also exists.
- **`webgpu_fog_height`** uses `exponentialHeightFogFactor(density, height)` with `scene.fogNode = fog(color, factor)` ([example source r186](https://github.com/mrdoob/three.js/blob/r186/examples/webgpu_fog_height.html)).
- **`webgpu_volume_cloud`** (raymarched volume clouds) is in r186 ([files.json](https://github.com/mrdoob/three.js/blob/r186/examples/files.json)).

### Inferences
- **Drive everything from the sim's state** (`ENV` light and weather, `WIND`, `SEASON`, `ICE`, date):
  - sun elevation and azimuth → `sunPosition` and the `SunLight` direction;
  - cloud cover → `cloudCoverage`/`cloudDensity` plus the sun intensity;
  - haze → `turbidity`;
  - fog events → height-fog density over the water (morning mist);
  - rain → particle count and surface-ripple strength;
  - wind → water normal-map speed, tree and weed sway, and cloud speed.

  The rendered light should be the same light the sim uses for photosynthesis, so what the user sees matches the ecology.
- **Night:** a moon billboard and star cubemap must be added. The sky is Preetham-only, which is weak at night and twilight. Takram's three-geospatial atmosphere is an option, from npm via jsDelivr `/+esm`. **Untested here.**
- **Shadows:** use 2-cascade `SunLight` shadows for the shore and trees. Underwater, the turbid water itself hides most shadow detail, so the fish and bed can use a coarse cascade.

### Gaps
- `SunLight` is said to work with WebGPU only after node registration. Whether its cascades are as complete on the WebGPU backend was not tested.
- Whether `instancedArray` compute particles (the rain and snow examples) run on the WebGL2 fallback was not verified.
- No sourced technique for lake-specific weather visuals: rain rings on calm water, wind slicks, or mist rising off warm water in autumn.

## 6. Architecture: sim in a Web Worker, SharedArrayBuffer vs transferables, COOP/COEP with a localhost server and CDN scripts, interpolation, main-thread load

### Takeaway
Use **transferable `ArrayBuffer` snapshots at 30 Hz**, with a recycled buffer pool. Interpolate on the GPU.
- **Speed:** at 20k fish (625 KB a snapshot) the transfer arrives in about 0.4 ms, with about 0.06–0.09 ms of main-thread copy **[measured]**. `SharedArrayBuffer` is no faster at this size.
- **Headers:** SAB needs COOP `same-origin` + COEP `require-corp`/`credentialless` *response headers*. These worked on localhost with jsDelivr ES modules and Google Fonts, since all three send CORS and CORP headers **[measured]**. They are optional, not required.

### Cited Findings
- **Isolation requirements:**
  - Shared memory needs a "secure context and cross-origin isolated" document.
  - Without the headers the `SharedArrayBuffer` constructor is hidden and `postMessage` of a SAB throws.
  - A SAB is not Transferable.
  - Writes "eventually become visible", and `Atomics` are needed to synchronise.

  Source: [MDN SharedArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer).
- **COEP values** ([MDN COEP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Embedder-Policy)):
  - `require-corp`: cross-origin no-cors resources need `Cross-Origin-Resource-Policy`; `cors`-mode requests just need CORS.
  - `credentialless`: no-cors loads succeed without CORP, but without cookies.
  - Isolation = `Cross-Origin-Opener-Policy: same-origin` + COEP `require-corp` or `credentialless`.
- **Transferables:** transferring "literally moved" the memory, zero-copy. In Chrome's 2011 test, a 32 MB round trip took 302 ms by structured clone vs 6.6 ms transferred ([Chrome blog](https://developer.chrome.com/blog/transferable-objects-lightning-fast); [MDN Transferable objects](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects)).
- **Isolation on localhost [measured]:** with COOP `same-origin` + COEP `require-corp`, the page reported `crossOriginIsolated = true` and `typeof SharedArrayBuffer === 'function'`, and still loaded three r186 plus addons from jsDelivr. Module scripts are fetched in CORS mode, and jsDelivr and cdnjs send `ACAO: *` and `CORP: cross-origin`. Google Fonts' CSS and font files also send `CORP: cross-origin` (checked with curl), so the project's current fonts survive `require-corp`.
- **Worker transfer latency [measured]** (a worker publishing N fish × 8 float32 at 30 Hz for 3 s per case; "latency" = receive time − a timestamp taken *before* the worker fills the buffer, so it includes the fill):

  | Snapshot | Transfer p50 | Clone p50 (p95) | SAB + notify p50 | Main-thread copy into a render array (p50) |
  |---|---|---|---|---|
  | 2k fish (63 KB) | 0.14 ms | 0.27 ms (1.9) | 0.13 ms | |
  | 20k fish (625 KB) | 0.43 ms | 0.89 ms | 0.38 ms | 0.06–0.09 ms |
  | 100k fish (3.1 MB) | 1.45 ms | 3.18 ms | 1.46 ms | 0.21–0.28 ms |

- **OffscreenCanvas** lets a worker own the canvas through `canvas.transferControlToOffscreen()` and `new Worker(url, {type:'module'})`. Workers cannot see the DOM or receive input events, so controls must be proxied ([three.js manual: OffscreenCanvas](https://github.com/mrdoob/three.js/blob/r186/manual/pages/offscreencanvas.html)). An r186 example, `webgl_worker_offscreencanvas`, exists.

### Inferences
- **Data flow:**
  1. The sim worker (the existing pure modules; `ffworker.js` already imports only those) steps at 30 Hz.
  2. After each step it packs a flat render snapshot: per fish, x, y, z, heading, pitch, body-wave phase, species/LOD key and state flags; per school, centroid, n and polarisation; plus environment scalars (sun, cloud, wind, ice, lake level, light).
  3. It posts the snapshot as transferable `Float32Array` buffers drawn from a 3-buffer pool, which the main thread returns after upload.
  4. The main thread uploads each snapshot into "previous" and "current" GPU buffers. Each frame it sets `alpha = (now − tStep)/33.3 ms`, clamped to [0, 1].

  This keeps the main thread at well under 1 ms of sim-related work per frame.
- **The 3-D fields:** environment fields (O₂, temperature, phyto, zooplankton) needed for visuals (water tint, plankton snow, O₂ debug overlays) should be sent at a lower rate, e.g. 1–5 Hz, uploaded as small 3-D textures and sampled in shaders.
- **Determinism:** the browser layer uses `Math.random` for cosmetics (school jitter, particles) and never writes back to the worker. This preserves the project's rules: the sim never reads render fields, and cosmetic randomness stays off `core.rand`.
- **If SAB is wanted later** (e.g. 100k+ agents, or zero-copy field textures), the project needs:
  - `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` as **HTTP headers** in `serve.mjs` and `serve.py`. These are response headers, so a `<meta>` cannot provide them;
  - every external subresource to send CORP or CORS (jsDelivr, cdnjs and Google Fonts already do).
- **Main-thread pacing:** keep the existing "≤2 sim steps a frame, no catch-up bursts" rule in the worker. In WebGPU mode, render through `renderer.setAnimationLoop` (see the frame-advance pitfall in Section 1).
- **Rendering in a worker:** OffscreenCanvas rendering is an optional later step to protect the render loop from UI work, e.g. inspector panels. It needs input proxying and complicates the existing UI, so it is not needed at first.

### Gaps
- Not measured: `postMessage` latency in Firefox and Safari, or with the sim worker under real load. The scratch worker only filled a buffer.
- Not measured: the cost of uploading two 625 KB snapshot buffers to the GPU at 30 Hz (expected to be small, but unverified).

## 7. Performance budgets at 1080p and 3440×1440 on integrated and discrete GPUs; dynamic resolution and half-resolution effects

### Takeaway
**On the user's RTX 3060-class GPU, the planned scene fits a 16.7 ms frame with room to spare.**
- **Measured so far:** fish, a lit bed, an HDR pass, fog and bloom come to about 1.5–2 ms of GPU time at 3440×1440.
- **Still to add:** the expensive additions will be the planar reflection, shadows, trees and impostors, and the volumetric and god-ray effects.

**On integrated GPUs, expect roughly 3–6× slower (estimate from FP32 throughput).**
- Plan quality tiers.
- Plan half-resolution volumetrics.
- Plan dynamic resolution of the scene pass, steered by GPU timestamps.

**Fill-bound passes scale with pixels.** 3440×1440 has 2.39× the pixels of 1080p, and bloom cost about 2.5× more there **[measured]**. Geometry-bound fish do not benefit from resolution scaling.

### Cited Findings
- **Pixel counts:** 3440×1440 = 4,953,600 px and 1920×1080 = 2,073,600 px, a ratio of 2.39. This is arithmetic.
- **Fill-bound vs geometry-bound [measured, RTX 3060]:** bloom added about 0.2 ms at 1080p and about 0.5 ms at 3440×1440. Scene-pass `setResolutionScale(0.5)` cut the fog+bloom pipeline at 3440×1440 from 1.90 to 1.51 ms, while the cost of the geometry-bound fish was unchanged (Section 3 table).
- **Resolution-scale APIs:**
  - `PassNode.setResolutionScale()` replaces the `setResolution()` deprecated in r181 (r186 source, `three.webgpu.js`).
  - `BloomNode` defaults to `_resolutionScale = 0.5` ([BloomNode.js r186](https://github.com/mrdoob/three.js/blob/r186/examples/jsm/tsl/display/BloomNode.js)).
  - `WaterMesh` reflection defaults to `resolutionScale` 0.5 ([WaterMesh.js](https://github.com/mrdoob/three.js/blob/r186/examples/jsm/objects/WaterMesh.js)).
- **GPU timing:**
  - `WebGPURenderer` exposes `trackTimestamp` (default false) and `resolveTimestampsAsync()` ([three.js docs: Backend](https://threejs.org/docs/pages/Backend.html)).
  - In r181 timestamps were disabled under the WebGL2 fallback ([forum](https://discourse.threejs.org/t/webgpu-r181-fyi-stats-gl-no-longer-compatible-with-webgpu/87944)). **[measured]** In r186 under `forceWebGL` they returned values.
  - Chrome's WebGPU timestamps came back quantised to 0.0655 ms steps **[measured]**, so per-pass timings below about 0.1 ms are unreliable.
- **Integrated-GPU FP32 throughput:**
  - Iris Xe G7 96EU: about 2.0–2.4 TFLOPS; Radeon 780M: about 4.3 TFLOPS ([NanoReview 780M vs Iris Xe](https://nanoreview.net/en/gpu-compare/radeon-780m-vs-intel-iris-xe-graphics-g7-96eu); TechPowerUp's 1.997/2.150 TFLOPS figures for Iris Xe come from search snippets only).
  - The RTX 3060 desktop is commonly cited at about 12.7 TFLOPS, but the search could not verify this.
- **Old anecdote:** an Intel HD 4400 managed about 32 fps at 4,000 Aquarium fish in 2014 ([Ubuntu Forums](https://ubuntuforums.org/archive/index.php/t-2255009.html)).

### Inferences
- **Proposed GPU frame budget at 3440×1440** (all figures are estimates except where marked measured; sum ≈ 9–12 ms on a 3060, leaving headroom for 60 fps):

  | Item | Discrete (RTX 3060-class) | Integrated (Iris Xe / 780M, ≈4–6× / ≈3× slower) |
  |---|---|---|
  | Terrain + bed | ~1–2 ms | ~5–8 ms |
  | Trees and impostors | ~1–2 ms | — |
  | Planar reflection at 0.5 scale | ~1–2 ms | — |
  | Fish | ~1–1.5 ms (measured at 20k) | — |
  | Plants | ~0.5–1 ms | — |
  | Shadows (2 cascades) | ~1–2 ms | — |
  | Underwater fog + caustics | <0.5 ms (fog measured ~0) | — |
  | God rays / volumetrics at half resolution | ~0.5–1 ms | — |
  | Bloom + tonemap | ~0.5 ms (measured) | — |
  | Total | ≈ 9–12 ms | over budget: needs the 1080p-class tier |

  The integrated-GPU tier at 1080p would be:
  - render scale 0.67–0.75 on a 3440×1440 screen;
  - no planar reflection, replaced by an environment map plus screen-space refraction;
  - 1 shadow cascade;
  - fish LOD biased to 64-tri and card meshes;
  - impostor trees from mid range;
  - volumetrics at quarter resolution or off.
- **Dynamic resolution:**
  1. Measure GPU frame time with timestamps (WebGPU), or with `EXT_disjoint_timer_query_webgl2` (available here).
  2. Smooth it over about 30 frames.
  3. Step `scenePass.setResolutionScale()` between 0.5 and 1.0 to hold about 12 ms.
  4. Upscale with FXAA/TRAA. Keep the UI and text at native resolution as an overlay.
  5. Separately scale half-resolution effects (reflection, god rays, volumetrics, bloom), because those are the fill-bound costs at 21:9.
- **Device pixel ratio:** cap it at 1 for the 3-D scene on large screens. A 3440×1440 panel at DPR 1 already shows 4.95 MP.
- **CPU budget for 60 fps rendering with the sim at 30 Hz in a worker:**
  - render submission about 1–3 ms (measured 0.2–1 ms per heavy draw call in WebGPU; the bloom chain added about 1 ms of CPU);
  - snapshot upload under 0.2 ms;
  - UI work.

  Draw calls should stay in the low hundreds, using instancing and BatchedMesh.
- **Verify on the user's real Chrome at 3440×1440** (per the project's rule that the preview pane is not representative) and on one integrated-GPU laptop before fixing the tiers.

### Gaps
- No measured numbers on integrated GPUs: the integrated column above is an extrapolation from FP32 throughput, not a benchmark.
- No measurements yet for the planar reflection, shadow cascades, tree impostors or volumetric passes in this scene. Those budget lines are estimates.
- These numbers come from the Claude desktop app's Chromium pane, not the user's own Chrome window. The project's notes say the pane is not representative for performance.
- I found no published per-frame cost for a three.js `reflector()` pass on a large terrain scene.
