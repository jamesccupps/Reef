# Trees and foliage: how games render them fast, mapped onto three.js r186 WebGPU

Research note, 2026-10-23. Scope: replacing the faceted crowns of `src/w3/render3/main3.js` ("THE FOREST IN THREE TIERS") with realistic foliage that also runs fast. The forest has about a million trees. The camera orbits above the lakes, and next it will walk on the ground. The renderer is `vendor/three-0.186.1/three.webgpu.min.js`.

**How to read the claims:**
- Claims marked **[bundle]** were checked by grepping the vendored minified bundle. The minified symbol names are given so the checks can be repeated.
- Web claims carry their URL.
- **(snippet)** marks a URL whose page could not be fetched. The claim comes from the search result's text only.
- Numbers marked **estimate** are mine, not a source's.
- Related note: `docs/research_notes/Whole lake 3D fish simulation/browser_3d_rendering.md` holds the earlier GPU budget for 3440×1440 (trees + impostors: about 1–2 ms, an estimate) and the agargaro impostor forest.

---

## ▶ Recommended for Hot Brook (summary)

**Context from the code:**
- Stocking is one 7-m crown per 38.5 m² × 0.85, about **220 trees/ha** (`perArea` in main3.js). That gives roughly ≤250 trees within 60 m, ≤4,300 within 250 m and ≤100k within 1.2 km.
- At the human's 3440×1440 screen with the camera's 50° vertical FOV, a metre covers about **1544 / d pixels** at distance d.
- So at 250 m, a 7-m crown is about 43 px, a 20-m tree is about 124 px tall, and a 0.5-m leaf cluster is about 3 px. At 2.5 km a crown is about 4 px; at 5 km, about 2 px.

**1. Four representations, chosen by screen size** (metres quoted for the orbit camera):

| Band | What is drawn | Per tree (estimate) | Visible in frustum (estimate) |
|---|---|---|---|
| **Hero** ≤ ~60 m (the walker's own trees) | Trunk and branch skeleton with bark texture. Conifers: whorls of bent **frond cards** (needle-spray texture). White pine: limbs plus plume clump cards. Hardwoods: 3–4 branch orders plus leaf-cluster cards | 1.5–5k tris | ≤ ~100–250 trees |
| **Near** 60–250 m | The same tree with fewer, ~4× larger cards: conifers 16–30 fronds, hardwoods 30–60 cluster cards (camera-facing "leaf cards" are fine here). Trunk and first-order limbs only | 0.3–0.9k tris | ~1–1.5k |
| **Mid** 250 m – ~2.5 km | **Hemi-octahedral impostor**: 8×8 (or 12×12) frames of 128 px, baked at start-up, with albedo+alpha and normal+depth. 3-frame blend inside ~1.2 km, nearest frame beyond. Lit with the baked normals | 2 tris (or an 8-tri trimmed hull) | ~50–150k |
| **Far** > ~2.5 km | No per-tree draws. Aggregate canopy shading on the terrain: the aerial-photo canopy (`canopy3.jpg`) with a view- and sun-dependent "shader-map" (Bruneton & Neyret 2012). A canopy-height shell gives the ridge and skyline silhouettes | n/a | n/a |

- **Why 250 m:** cards there are about 3 px, below the size an alpha test can resolve. An impostor frame of 128 px matches a 20-m tree at that distance about 1:1. Moving the switch nearer (for example 150 m) needs 256-px frames, at 4× the memory.

**2. GPU-driven culling and LOD, not CPU tiles.**
- Put all ~1M trees in one storage buffer (`instancedArray`, ~32 B per tree).
- Each frame (or on camera movement), one compute pass does three things per tree:
  - frustum-tests it against the camera frustum **and** the sun's shadow box;
  - picks its band, with the per-tree ragged distance the code already uses;
  - appends it to per-(band, model) lists with `atomicAdd`.
- The compute writes every draw's indirect arguments into **one** `IndirectStorageBufferAttribute`, and each mesh calls `geometry.setIndirect(buffer, byteOffset)`. One buffer matters because Chrome on D3D12 validates each separate indirect buffer with its own dispatch (https://toji.dev/webgpu-best-practices/indirect-draws).
- The vertex shader reads `list[instanceIndex]` and then the tree's record.
- The result is about **15–25 draws** in total for colour and shadow, with no CPU re-picks and no "hole" collapsing.
- **Never use BatchedMesh for trees:** in the WebGPU backend it issues one `drawIndexed` per instance **[bundle]**.

**3. Switch `logarithmicDepthBuffer` to `reversedDepthBuffer`.**
- With log depth, every NodeMaterial writes `frag_depth` **[bundle]**, which forces late-Z for every draw (https://therealmjp.github.io/posts/to-earlyz-or-not-to-earlyz/). That silently multiplies the cost of alpha-card overdraw.
- Reversed float depth keeps the 6000-km-class far plane without it.
- First audit GTAO, the water, and any custom depth reads.
- Then add a **depth prepass** for hero and near foliage: alpha-tested depth only, then full shading with no discard. A depth prepass only pays off once depth is no longer exported.

**4. Alpha handling with FXAA only (the scene pass has samples 0, so no alpha-to-coverage):**
- Generate the card atlases at start-up with **coverage-preserving mipmaps** (Castaño's bisection) and upload them through `Texture.mipmaps`. The bundle honours user mips for DataTexture and canvas textures, not for DataArrayTexture **[bundle]**.
- Use an alpha test of 0.5.
- Keep card edges tight to the alpha (Persson's trimming) to cut overdraw.
- Let the band boundaries switch with a per-tree hash, as now.
- Later, **TRAA** (r186 `addons/tsl/display/TRAANode.js`, not vendored) is the real fix for sub-pixel shimmer and makes dithered cross-fades and hashed alpha usable. It needs every custom-positioned mesh to write `positionPrevious` **[bundle]**.

**5. Shading:**
- **MeshSSSNodeMaterial** fits the leaves. Its term is the GDC 2011 fast translucency, applied to direct light only (the sun) and already multiplied by the shadow **[bundle]**.
- Set `thicknessColorNode` = leaf colour × species transmittance. Hardwood leaves transmit about as much as they reflect; spruce and pine needles transmit clearly less (Lukeš et al. 2013).
- Give the cards **crown normals**: the normal from the crown centre, blended 60–80 % with the card's own normal and baked into the vertex normal. Do not flip it on the back face.
- Put the crown-depth AO in `aoNode` (indirect light only), not in the colour.
- Use per-tree and per-cluster hue jitter.
- Seasons: a per-card turn phase, outer leaves first (as SpeedTree's season system does), then leaf drop by shrinking the cards. Winter shows the real branch skeleton.

**6. Wind:**
- Keep the trunk sway.
- Add branch sway: a per-card pivot and phase packed into one vertex attribute.
- Add leaf flutter, strongest on aspen, whose flattened petiole makes it tremble.
- Give the shadow pass the same sway through `castShadowPositionNode` without the flutter, so shadows stay steady.

**7. Shadows:**
- Hero and near trees cast with alpha. In r186 the shadow pass copies `alphaTest`, `positionNode` and `colorNode.a`, but **not** `opacityNode`, `alphaTestNode` or `alphaHash` **[bundle]**. So put the leaf alpha in a vec4 `colorNode` or set `maskShadowNode` explicitly.
- Pick shadow LOD by shadow texel size, not by camera distance:
  - At R = 900 m a 4096 map is 0.44 m per texel, so leaf cards are pointless there and an impostor or crown proxy is enough.
  - At R = 40 m it is 2 cm per texel.
- Draw shadow-only proxies on a layer the main camera lacks. The shadow camera keeps its own layer mask once it has any bit beyond layer 0 **[bundle]**.
- Mid impostors cast for free, because their camera-facing vertex code faces the sun in the shadow pass. When they receive shadows, offset them toward the sun by about half a crown (`receivedShadowPositionNode`) to avoid self-shadowing.
- Optionally use `shadow.autoUpdate = false` + `needsUpdate` to re-render the map every 2nd–4th frame **[bundle]**.

**8. Textures: generate them at start-up on the GPU.**
- Build procedural twig, needle and leaf geometry per Maine species. Render it orthographically into an MRT RenderTarget (albedo+alpha, normal+thickness/AO) to make the card atlases.
- Use the same baker for the impostors.
- Species accuracy (red spruce, balsam fir, white pine, red maple, paper birch, quaking aspen) is the argument against generic CC0 packs.
- CC0 bark tiles (ambientCG, Poly Haven) are a reasonable shortcut for the walker's close-up trunks.

**Main GPU cost risks, in order:**
1. Alpha-card overdraw in the hero and near bands, worse under log depth.
2. The shadow pass drawing alpha cards into the 4096 map.
3. Impostor fragment cost along distant shorelines, where depth complexity is high at grazing angles.
4. GTAO on noisy foliage depth.
5. Indirect-buffer validation on Windows if the buffers are split.

**Draw budget (estimate):** about 2–3M triangles in the colour pass and ≤1M in the shadow pass. A target of trees ≤ ~3 ms colour + ≤ ~1.5 ms shadow at 3440×1440, to be measured.

**How to measure:**
- Create the renderer with `new WebGPURenderer({ trackTimestamp: true })`.
- Each frame, `await renderer.resolveTimestampsAsync(THREE.TimestampQuery.RENDER)` gives the GPU ms. The per-pass ms are in `renderer.backend.timestampQueryPool.render.timestamps` (internal), keyed per render context **[bundle]**.
- Enable `chrome://flags/#enable-webgpu-developer-features`, or timings are quantised to 100 µs (https://developer.chrome.com/docs/web-platform/webgpu/developer-features).
- Judge by A/B toggles in real Chrome at 3440×1440, as SESSION_STATE prescribes.

**Suggested slices:**
1. Hero and near card trees, built procedurally, with start-up atlases, coverage mips, crown normals, SSS and wind, inside today's tier and hole system.
2. Reversed depth plus the foliage depth prepass.
3. Impostor baker plus the mid band, replacing `midConifer`, `midBroad` and the far cones.
4. GPU culling and indirect draws over all trees; shadow proxies.
5. Far canopy shading and the shell.
6. Walker: Hi-Z occlusion culling, bark detail, TRAA.

---

## 0. Facts verified in the vendored bundle (r186 `three.webgpu.min.js`)

These are re-checkable by grepping the minified file.

**1. Alpha in `NodeMaterial.setupDiffuseColor`:**
- `maskNode` discards first.
- `colorNode` becomes the vec4 diffuse, and `opacityNode` multiplies its alpha.
- If `alphaTestNode` or `alphaTest > 0`:
  - with `alphaToCoverage`: `a = smoothstep(t, t + fwidth(a), a)`, then discard when a ≤ 0;
  - otherwise: discard when a ≤ t.
- `alphaHash`: discard when a < `getAlphaHashThreshold(positionLocal)`. That is the Wyman–McGuire hash with `ALPHA_HASH_SCALE` 0.05 (symbol `fL=.05`).
- Opaque materials then force a = 1.
- Symbols: `ii` = smoothstep, `Fv` = fwidth, `mL` = getAlphaHashThreshold, `Ke` = `positionLocal` varying.

**2. Alpha-to-coverage needs MSAA.**
- The pipeline sets `multisample.alphaToCoverageEnabled = material.alphaToCoverage && sampleCount > 1`.
- With `pass(scene, camera, { samples: 0 })`, setting `alphaToCoverage` gives only an alpha test against `t`.

**3. Shadow pass** (`Renderer._getShadowNodes` and the override in `renderObject`). The shadow material takes from the source material:
- `alphaTest` (the number only), `alphaMap`, `positionNode` (replaced by `castShadowPositionNode` if set) and `depthNode`;
- a colorNode = vec4(rgb, alpha), where alpha = `castShadowNode.a`, or else `map.a × colorNode.a`;
- a discard when `maskShadowNode` (or `maskNode`) is false.

It does **not** take `opacityNode`, `alphaTestNode`, `alphaHash` or `alphaToCoverage`.
- **Sides:** without VSM, the side is `shadowSide ?? flipped side` (`Vk={Front:Back, Back:Front, Double:Double}`). Double-sided cards stay double-sided.
- `castShadowNode` warns unless `renderer.shadowMap.transmitted = true`.
- A vec3 `colorNode` gives alpha 1. This is why today's trees cast solid shadows.

**4. Shadow-camera layers.**
- `ShadowNode.updateShadow`: if `(shadow.camera.layers.mask & 0xFFFFFFFE) === 0`, the shadow camera borrows the main camera's mask. Otherwise it keeps its own.
- Only objects with `castShadow` are drawn (the render-object function `AO`).
- So a shadow-only proxy layer works: give the proxy layer S, and set `sun.shadow.camera.layers` to {0, S, …} explicitly.

**5. Shadow refresh.** `ShadowNode.updateBefore` renders only when `shadow.needsUpdate || shadow.autoUpdate`. A throttled refresh is therefore possible.

**6. CSM.** `addons/CSMShadowNode.js` (vendored) keeps one DirectionalLight per cascade in `csm.lights[i]`. Each cascade's `shadow.camera` can take its own layer mask, so each cascade can use its own LOD proxies.

**7. Logarithmic depth.**
- `NodeMaterial.setupDepth` assigns fragment depth for every material when `renderer.logarithmicDepthBuffer` is set. In WGSL that is the `frag_depth` builtin.
- `reversedDepthBuffer: true` is a renderer option. PassNode then makes its depth texture float.

**8. BatchedMesh on WebGPU.** The backend loops `drawIndexed(count, 1, start, 0, i)` once per batched instance. That means 10⁵ trees would be 10⁵ draws.

**9. Indirect draws.**
- `BufferGeometry.setIndirect(attr, offset)` (offset can be an array) leads to `drawIndexedIndirect(buffer, offset)` per offset.
- TSL has `storage`, `struct`, `instancedArray`, `atomicAdd`, `atomicStore`, `instanceIndex` and `drawIndex`.
- `IndirectStorageBufferAttribute` is in the bundle.
- Example: https://raw.githubusercontent.com/mrdoob/three.js/r186/examples/webgpu_struct_drawindirect.html. It uses `new THREE.IndirectStorageBufferAttribute(new Uint32Array(5), 5)`, `geometry.setIndirect(drawBuffer)`, and `atomicStore(drawStorage.get('instanceCount'), …)` in compute.

**10. MRT by name.** `MRTNode.setup` maps each `mrt({ key: node })` output to the render target texture whose `.name === key` (helper `hB`). For a bake, name `rt.textures[i]`. `RenderTarget` takes `{ count: n }`.

**11. User mipmaps.** `Texture.mipmaps` is uploaded level by level for DataTexture (`{data, width, height}`) and for image or canvas textures. DataArrayTexture uploads only its base level and auto-generates the rest. So coverage-preserving mips need 2-D atlases, or a compute pass into a StorageTexture (`mipmapsAutoUpdate`).

**12. `MeshSSSNodeMaterial`.**
- It extends `MeshPhysicalNodeMaterial`.
- Its `SSSLightingModel.direct()` adds `(saturate(dot(V, −normalize(L + N·distortion)))^power · scale + ambient) · thicknessColor · attenuation · lightColor` to direct diffuse.
- Defaults: distortion 0.1, ambient 0, attenuation 0.1, power 2, scale 10.
- It applies only to direct lights. `lightColor` there already carries the shadow (`AnalyticLightNode`: `shadowColorNode = colorNode.mul(shadowNode)` replaces the light colour), so translucency from leaves shaded by other leaves is suppressed, which is correct.
- `V` = `positionViewDirection`; `N` = `normalView` (the material's `normalNode`).

**13. Motion vectors.**
- `VelocityNode` builds the previous clip position from `positionPrevious`.
- Only the instancing, batching and skinning nodes assign `positionPrevious`.
- A mesh positioned by a custom `positionNode` (today's trees) therefore gets wrong velocity unless the material assigns `positionPrevious`. TRAA would mishandle it.

**14. Timestamps.**
- The backend asks the adapter for every supported feature, including `timestamp-query`, `texture-compression-bc`, `indirect-first-instance`, `subgroups` and `shader-f16`.
- `trackTimestamp` is honoured only if the feature exists.
- `renderer.resolveTimestampsAsync('render'|'compute')` returns the frame's total ms and sets `renderer.info.render.timestamp`.
- The pool keeps per-render-context ms in `timestamps` (a Map keyed `r:<call>:<n>:f<frame>`), exposed via `backend.getTimestamp(uid)` and `backend.getTimestampUID(renderContext)`.
- `THREE.TimestampQuery = { COMPUTE, RENDER }`.

**15. Adapter level.** The adapter is requested with `featureLevel: 'compatibility'`. Without `core-features-and-limits`, the renderer drops to samples 0.

**16. Lighting details.**
- `aoNode` feeds `context.ambientOcclusion`, which scales indirect light.
- TSL has `getGeometryRoughness`/`getRoughness`, so normal-derivative roughness widening is available against specular shimmer.

**17. Today's vertex buffers.** The trees use 7 separate vertex buffers (`position`, `normal`, `fol`, `ao`, `tp`, `tw`, `tc`). WebGPU's default `maxVertexBuffers` is **8** (https://www.w3.org/TR/webgpu/#limits). A forum port hit the same cap (https://discourse.threejs.org/t/procedural-instanced-forest-high-performance-real-trees/88610). Adding uv and wind attributes needs interleaving, or moving the per-tree data into a storage buffer.

---

## 1. Foliage geometry

**Cards are how games make crowns.**
- A SpeedTree **leaf card** is a leaf that "always billboard[s] (face[s]) the camera". This "allows a SpeedTree to look very lush and full while having few leaf polygons". **Leaf meshes** are fixed small geometry used in place of a card (https://docs.unity3d.com/speedtree-modeler/manual/glossary.html).
- A **frond** is "procedural geometry that rests along a branch spine". It often carries a larger leaf texture or a "games cluster material" (same glossary). This is the branch-spray card used for conifer branches.
- An **atlas** combines all non-wrapping textures. Bark wraps, so it is kept out of the atlas (same glossary).
- Crysis: "Large trees use planes with leaf textures, so per-leaf control is limited". Palms are modelled leaf by leaf. Foliage is double-sided and alpha-tested; grass is alpha-blended (https://developer.nvidia.com/gpugems/gpugems3/part-iii-rendering/chapter-16-vegetation-procedural-animation-and-shading-crysis).

**Conifers versus broadleaf trees:**
- **Conifers** are a trunk plus fronds or needle-spray cards per whorl, sometimes needle-cluster leaf meshes on anchor points.
  - Artists report that conifers are the hard case. Needles look noisy, and up close "custom needle meshes and bushy atlases looked poor"; one fix was fewer cards, since trees read in groups. A reply blamed the normals (polycount, https://polycount.com/discussion/comment/2762820, snippet).
  - A SpeedTree pine tutorial builds its needle atlas from several rotated planes plus vertex noise, because "a single plane isn't terribly convincing" (https://store.speedtree.com/?p=744562, snippet; the page itself was blocked).
- **Broadleaf trees** are a branch skeleton plus leaf-cluster cards, a texture of a twig with many leaves.
  - ez-tree (MIT, three.js) offers `Single` or `Double` (perpendicular, crossed) leaf billboards per leaf position. Its LODs reuse the skeleton with fewer ring segments and "fewer, larger leaves" (https://github.com/dgreenheck/ez-tree).
- **For Hot Brook:**
  - Red spruce and balsam fir: narrow spires of drooping whorls. Use 4–8 frond cards per whorl, each bent (2–4 segments along its length so it droops), on a tapered trunk, with a spike top.
  - White pine: long limbs held level with tufted "plumes" at their ends. Model the limbs as geometry and the plumes as clump cards.
  - Maple, birch and aspen: forked limbs with leaf-cluster cards on twigs. Birch bark is white with dark lenticels.

**Triangle counts per LOD** (practice varies a lot; these are forum and marketplace figures):
- Commercial spruce packs: about 7,000 tris for LOD0 with 4 LODs ending in a billboard (https://www.cgtrader.com/3d-models/plant/conifer/realistic-spruce-fir-trees-for-games, snippet). Another pack's LOD0 is about 2,000 tris (snippet).
- One studio's first-pass targets were 15k/10k/5k then billboard. Reviewers advised at least a 25 % cut per LOD, and noted that "most SpeedTree triangles come from individual leaves" (https://polycount.com/discussion/228579/src, snippet; the page itself was blocked).
- Unity: a SpeedTree typically has "three or four Mesh LOD levels and one optional Billboard LOD" (https://docs.unity3d.com/Manual/terrain-Tree-LOD.html).
- SpeedTree runtime LOD:
  - small outlying branches scale toward their centre line;
  - leaves become "fewer, larger leaf instances" as some shrink away and the rest grow, driven by per-vertex LOD scales;
  - then a cross-fade to a billboard (https://docs.unity3d.com/speedtree-runtime-sdk/manual/level-of-detail.html).
  - This shrink-and-grow scheme is a cheap continuous LOD that suits the per-card vertex shader here.

**Avoiding the "flat card" look:**
- **Crown normals.** Transfer smooth normals from a hull or sphere around the foliage onto the card vertices. Transfer them onto the cards only, not the trunk (polycount, https://polycount.com/discussion/comment/2490046, snippet).
  - The Blender add-on "Foliage Normals" builds a smooth convex hull and samples normals from it onto every vertex, with a "backface compensation" node (vendor text, https://superhivemarket.com/products/foliage-normals).
  - SpeedTree's lighting system "modifies vertex normals to change how light hits leaves and fronds", globally or per generator (https://docs.unity3d.com/speedtree-modeler/manual/lighting-leaves-and-fronds.html).
  - Caveat: a pure sphere flattens the detail between clusters. Clustered (per-clump) smoothing reads better (https://devcopilot.notion.site/NextPCG-SpeedTree-Smooth-Normal-Baker-c633d36bddc7423d8dc2a0c1e5e60086, snippet).
  - For Hot Brook: blend the normal toward the crown ellipsoid's normal at 60–80 %, keep 20–40 % of the card's own normal, and lean it toward the sky a little, as the code does today.
- **V-shaped normal maps.** A V-shaped leaf normal map splits each card into two planes. A lower mip is sampled to soften highlights, and specular is reduced with distance (GPU Gems 3 ch. 4, https://developer.nvidia.com/gpugems/gpugems3/part-i-geometry/chapter-4-next-generation-speedtree-rendering).
- **Crossed cards** (ez-tree's `Double`) hide the edge-on view of a single card.
- **Fading edge-on cards:** Epic's billboard impostors dither-fade cards that turn away from the camera (https://dev.epicgames.com/documentation/en-us/unreal-engine/impostor-baker-plugin-in-unreal-engine). Fading by |N_card·V| does the same for leaf cards.
- **Orientation.** Point cards outward from the branch with some random roll. Use camera-facing clump cards only in the near band, where their rotation as the camera orbits is too small to see.
- **Overdraw.** Trim each card to its texture's alpha with a 4–8 vertex polygon. Persson: "even four vertices can provide a substantial performance improvement", with diminishing returns past about 8 (https://www.humus.name/index.php?ID=266).

## 2. Shading

**Translucency and SSS:**
- Crysis back side:
  - a view term `saturate(dot(vEye, −vLight))`, squared twice;
  - wrapped diffuse `saturate(dot(−N, L)·0.6 + 0.4)`;
  - an artist-painted thickness map (a low-resolution 128² texture is enough);
  - hemisphere ambient `lerp(cAmbient·0.5, cAmbient, saturate(N.z·0.5+0.5))`;
  - vertex-alpha AO applied last (GPU Gems 3 ch. 16, URL above).
- SpeedTree / GPU Gems ch. 4: a yellowed back-lit colour (green × (0.9, 1.0, 0.2)) blended by the light–view angle, with specular reduced on the back side (URL above).
- Unreal's **Two Sided Foliage** model: Subsurface Color is the transmitted amount and doubles as a mask for stems and veins. Default Lit makes leaf undersides "almost black" (https://dev.epicgames.com/documentation/en-us/unreal-engine/shading-models-in-unreal-engine).
- **The fast-translucency formula** (Barré-Brisebois & Bouchard, GDC 2011): `I = saturate(V·−(L + N·δ))^p · s` (https://frostbite.com/frostbite/news/approximating-translucency-for-a-fast-cheap-and-convincing-subsurface-scattering-look ; explained at https://www.alanzucconi.com/2017/08/30/fast-subsurface-scattering-1/).
  - three's `MeshSSSNodeMaterial` implements exactly this, plus an ambient term and a thickness colour **[bundle]** (docs: https://threejs.org/docs/pages/MeshSSSNodeMaterial.html, "experimental").
- **Does it fit?** Yes, for the sun.
  - The term is shadowed. Cost is Physical ≈ Standard when clearcoat, sheen and transmission are off; measure it.
  - It does not cover the sky seen through leaves from below, which the walker will see. Add a small sky term through `emissiveNode`: hemisphere sky colour × transmittance × saturate(−N·up) × (1 − crown depth).
- **Physical values:**
  - Scots pine and Norway spruce needles: transmittance "clearly lower than reflectance". Silver birch: about equal (Lukeš et al. 2013, *Remote Sensing Letters* 4(7); https://cris.vtt.fi/en/publications/optical-properties-of-leaves-and-needles-for-boreal-tree-species-/).
  - So: strong `thicknessColorNode` for maple, birch and aspen, weak (about ⅓) for spruce, fir and pine.

**AO inside the crown:**
- Crysis bakes AO into vertex alpha (ch. 16). SpeedTree computes AO in the modeler.
- Cheap analytic AO for procedural trees: darken with normalised depth into the crown (radial distance from the axis ÷ crown radius at that height) and with height in the crown. Put it in `aoNode`, which in three scales indirect light only **[bundle]**. Direct sun inside the crown is then left to the shadow map.
- Today the code multiplies the AO into the colour, which also darkens the sun.
- GTAO (on now, half resolution) adds contact AO. Watch for double darkening.
- At forest scale, Bruneton & Neyret treat the canopy's shadowing and occlusion with z-fields near and "shader-maps" far (https://diglib.eg.org/handle/10.1111/v31i2pp373-382).

**Specular:**
- Leaves have a cuticle. Use roughness of about 0.45–0.6 and raise it with distance (GPU Gems ch. 4). three's roughness includes the geometry-roughness term, which helps.

**Colour variation:**
- Unity's SpeedTree hue variation is a hue colour and amount, varied per tree by **world position**, to "break up a large forest" (https://docs.unity3d.com/ScriptReference/SpeedTreeImporter-hueVariation.html).
- Unreal uses `PerInstanceRandom` on foliage instances (https://dev.epicgames.com/documentation/en-us/unreal-engine/python-api/class/MaterialExpressionPerInstanceRandom).
- The code already does per-tree colour (`tc`). Add a per-cluster jitter: one byte per card, about ±6 % value and ±3 % hue.

**Seasons:**
- SpeedTree's season system:
  - a 0–1 season value;
  - per-node transition values, with leaf edges turning before the anchor (outer first);
  - size change, droop and leaf drop.
  - It exports a single state and "is not suitable for smoothly animating season changes" (https://docs.unity3d.com/speedtree-modeler/manual/seasons.html).
- Doing it in our shader is better, because it animates with the sim's calendar.
  - Per card: phase = tree phase + outer-and-top offset. The colour ramps green → species fall colour → brown, then the card shrinks to zero.
- Maine timing: northern Maine peaks in the last week of September into the first week of October; central and western Maine in the 2nd–3rd weeks of October (https://www.maine.gov/dacf/mfs/projects/fall_foliage/faq/).
  - Red maples of wetland edges turn earlier; birch and aspen go yellow (https://bangordailynews.com/2026/10/10/outdoors/how-to-plan-fall-foliage-outing-in-maine-joam40zk0w/).
- Impostors: bake a leaf mask, so the shader recolours by season without a rebake. Rebake a bare impostor when winter starts.

## 3. Alpha testing without MSAA

**The problems:**
- Standard mip generation thins alpha-tested foliage with distance.
- Shading aliasing from the alpha test is something MSAA alone can't fix.
- FXAA (a post-process edge blur) does nothing against the temporal shimmer of sub-pixel leaves.

**Coverage-preserving mipmaps** (Castaño):
- Coverage at level 0 = the fraction of texels with a > A_ref.
- For each mip, bisect for the a_r that gives the same coverage, then scale alpha by A_ref / a_r. Use A_ref near 1 for alpha-to-coverage (https://ludicon.com/castano/blog/articles/computing-alpha-mipmaps/ ; original http://the-witness.net/news/2010/09/computing-alpha-mipmaps/).
- Tools: Unity has "mip maps preserve coverage" (https://docs.unity3d.com/ScriptReference/TextureImporter-mipMapsPreserveCoverage.html); DirectXTex has `ScaleMipMapsAlphaForCoverage`.
- Pitfall: compute the scale from the *destination* mip, not the source (Unreal bug UE-102673, https://issues.unrealengine.com/issue/UE-102673).
- **For us:** it costs nothing at runtime. Do it on the CPU once at start-up for the generated atlases, then upload through `Texture.mipmaps` **[bundle §11]**.
- **Alpha distribution** (Yuksel, I3D 2018) goes further: it error-diffuses alpha across mip levels so semi-transparency survives alpha testing (http://www.cemyuksel.com/research/alphadistribution/ ; code https://cemyuksel.com/cyCodeBase/docs/cyAlphaDistribution_8h.html).

**Ben Golus's tricks:**
- The original article, https://bgolus.medium.com/anti-aliased-alpha-test-the-esoteric-alpha-to-coverage-8b177335ae4f, returned 403 here. The formulas below come from reproductions in https://bugs.dolphin-emu.org/issues/11626 and https://discussions.unity.com/t/implement-alpha-to-coverage-better-handling-of-alpha-for-vr-on-mobile/775677.
- **Mip-level alpha scaling:**
  - `col.a *= 1 + max(0, CalcMipLevel(uv·texSize)) * _MipScale` (≈ 0.25);
  - `CalcMipLevel = max(0, 0.5·log2(max(dot(dx,dx), dot(dy,dy))))`.
  - This is a shader-side substitute for coverage mips. In TSL: `dFdx`, `dFdy` or `fwidth` of `uv.mul(size)`.
- **Sharpened alpha-to-coverage:** `col.a = (col.a − cutoff) / max(fwidth(col.a), 1e-4) + 0.5`. It needs MSAA, and the article assumes forward rendering with ≥4× MSAA. three's own A2C path is the smoothstep form of the same idea **[bundle §1]**.
- Persson's A2C demo: http://www.humus.name/index.php?page=3D&ID=61.
- Godot ships alpha hash, A2C, A2C + alpha-to-one, and the edge-sharpening mode, citing Golus (https://github.com/godotengine/godot/pull/40364).

**Hashed alpha testing** (Wyman & McGuire, I3D 2017):
- The threshold comes from a stable hash of object-space position at a scale tied to pixel size. Distant foliage keeps its density "without adding more temporal flicker than traditional alpha testing", and the method extends to A2C (https://research.nvidia.com/labs/rtr/publication/wyman2017hashed ; https://research.nvidia.com/sites/default/files/pubs/2017-02_Hashed-Alpha-Testing/Wyman2017Hashed.pdf).
- three has it as `material.alphaHash` **[bundle §1]**.
- Without TAA the output is visibly noisy (stipple). It is also not copied to the shadow pass **[bundle §3]**.

**TAA:**
- The modern engines' answer: dithered LODs and hashed alpha with TAA cleaning up.
- Epic's billboard dither "relies on Temporal AA", and Pixel Depth Offset can smear under TAA (https://80.lv/articles/impostor-baker-for-ue4/).
- three r186 has `TRAANode`:
  - Halton(32) jitter via `setViewOffset`;
  - 3×3 variance clipping;
  - depth-based disocclusion;
  - "MSAA must be disabled";
  - it needs a velocity buffer (https://raw.githubusercontent.com/mrdoob/three.js/r186/examples/jsm/tsl/display/TRAANode.js ; https://threejs.org/docs/pages/TRAANode.html).
- Blocker for us: every custom-positioned mesh must assign `positionPrevious` **[bundle §13]**. That means the trees (sway uses `time`, so evaluate it at the previous frame's time), the fish and the plants.

**Two-pass foliage:**
- Pass 1 alpha-tests at 0.5 with depth write. Pass 2 alpha-blends the cut-away fringe without depth write. The legacy Unity manual notes far branches may draw over near ones, which leaf detail hides (https://docs.unity3d.com/2019.4/Documentation/Manual/SL-AlphaTest.html).
- It adds overdraw, so at most use it for the hero band.

**What works with FXAA only (our case):**
1. Coverage-preserving mips with an alpha test of 0.5.
2. Cards trimmed tightly and not too small. Switch to impostors before cards fall below ~3–4 px, which is the 250-m switch.
3. Fade edge-on cards.
4. Hard LOD switches with per-tree jitter (today's ragged band) instead of dithered cross-fades. A brief time-based dither during the change is acceptable.

- Hashed alpha and screen-door cross-fades only become clean with TRAA.
- MSAA 4× + A2C would be the best foliage AA (Golus). But it collides with GTAO, which reads the single-sampled depth, per the existing `makePost` comment, and it is costly at 3440×1440 in RGBA16F. It would need a separate 1× depth+normal prepass for GTAO.

**Alpha-tested shadows in r186** (all **[bundle §3]**):
- Leaf alpha must come from `colorNode.a`, with `material.alphaTest > 0`, or from `maskShadowNode` (for example `texture(atlas, uv).a.greaterThan(0.5)`). `opacityNode`, `alphaTestNode` and `alphaHash` are ignored in the shadow pass.
- `positionNode` (the wind) is reused unless `castShadowPositionNode` is set. GPU Gems ch. 4 shifts each leaf card toward the light by about half its height to avoid self-shadow streaks, and offsets the shadow lookup along the view vector per leaf.
- The shadow side is flipped for single-sided materials and unchanged for DoubleSide.

## 4. LOD and distance

**LOD chains and cross-fades:**
- SpeedTree's runtime LOD value runs 1 → 0 across the 3-D LODs (smooth shrink and grow), then 0 → −1 as the billboard fades in. With A2C the 3-D alpha fades out while the billboard fades in (https://docs.unity3d.com/speedtree-runtime-sdk/manual/level-of-detail.html).
- GPU Gems ch. 4 draws both LODs with *offset* A2C fade curves, replacing the older "fizzle" (alpha-noise) cross-fade. Because A2C doesn't accumulate, a tree can look too transparent mid-fade.
- A horizontal (overhead) billboard is cross-faded in by camera angle and improves shadows from a high sun (SpeedTree runtime doc).
- Unity: Cross Fade mode, a per-LOD "Fade Transition Width" or "Animate Cross-fading" (one time-based duration) (https://docs.unity3d.com/Manual/lod/lod-transitions-lod-group.html). Shader side: `unity_LODFade.x` compared against a dither pattern, with fading-in objects negated (https://catlikecoding.com/unity/tutorials/custom-srp/lod-and-reflections/).
- Book of the Dead disabled cross-fade on as many assets as possible because it is "heavy and can increase draw calls". Small vegetation stopped casting shadows at about 15 m and was culled at about 25 m (https://unity.com/blog/technology/book-of-the-dead-quixel-wind-scene-building-and-content-optimization-tricks).
- Horizon Zero Dawn chose shadow LOD per shadow cascade, because a camera-distance pick made shadows pop. Source: a machine summary of the talk recording, https://videohighlight.com/v/wavnKZNSYqU (snippet; unverified); the GDC Vault abstract is at https://gdcvault.com/play/1025066/Between-Tech-and-Art-The.

**Billboards versus octahedral impostors:**
- **Epic Impostor Baker:** three types — Full Sphere, **Upper Hemisphere** ("for objects that sit on the ground") and Traditional Billboards (a 3×3 card set, cards facing away dither out) (https://dev.epicgames.com/documentation/en-us/unreal-engine/impostor-baker-plugin-in-unreal-engine).
  - **Fortnite uses 12×12 = 144 frames, a 2048 texture, and Upper Hemisphere impostors for trees** when Nanite is off.
  - Capture at ≥2× the final sub-frame size and keep orthographic capture.
  - BaseColor + Normal "are enough for most impostors". The distance-field alpha lives in BaseColor.a.
  - The three nearest frames are blended onto one sprite plane; mobile falls back to one frame.
  - An impostor card is 9 vertices against 81 for the billboard set. The impostor has a costlier pixel shader; billboards have more masked overdraw.
- Ryan Brucks's original write-up is https://shaderbits.com/blog/octahedral-impostors. Its body is script-rendered, so this note summarises from Epic's documentation and code that follows it. Per 80.lv, the octahedral layout replaced a wasteful render-to-texture layout (https://80.lv/articles/impostor-baker-for-ue4/).
- Amplify Impostors offers Spherical, Octa ("capable of smooth blending between views") and Hemi-Octa ("ideal for top view games… higher resolution per view") (https://amplify.pt/_AI).
- Houdini's impostor ROP: 8×8 frames at 128 px gives a 1024² atlas (https://www.sidefx.com/docs/houdini/nodes/out/labs--impostor_texture.html).
- **three.js prior art:** agargaro's octahedral impostors (MIT, WebGL GLSL; https://github.com/agargaro/octahedral-impostor):
  - 200k trees, hemi-octahedron, 16 frames per side, a 2048 atlas, parallax 0.5;
  - InstancedMesh2 with a BVH, a mesh LOD for 15–100 units, the impostor beyond (https://discourse.threejs.org/t/a-forest-of-octahedral-impostors/85735).
  - Usnul's points in that thread:
    - popping comes from too little angular resolution;
    - no dither is needed if the swap happens where the impostor is no larger on screen than its bake resolution;
    - a convex hull around the sprites cut about 30 % of pixels.

**What agargaro's code does,** a good template for a TSL port:
- **Bake** (`src/utils/createTextureAtlas.ts`):
  - an MRT `WebGLRenderTarget(atlas, atlas, { count: 2, generateMipmaps: true })`;
  - attachment 0 is albedo (linear mips), attachment 1 is packed normal+depth (*nearest* mips);
  - an OrthographicCamera spanning the bounding sphere;
  - per cell, `dir = hemiOctaGridToDir(col/(N−1), row/(N−1))`, the camera at centre + dir·R, `lookAt(centre)`, then `setViewport`/`setScissor` to the cell and render.
  - It has **no padding or dilation**, so mips bleed across cells. That is a known gap.
- **Mapping** (`src/utils/octahedronUtils.ts`):
  - hemi grid → direction: `d = (g.x − g.y, 0, −1 + g.x + g.y); d.y = 1 − |d.x| − |d.z|`, then normalise;
  - direction → hemi grid: `o = d / dot(d, sign(d)); g = ((1 + o.x + o.z)/2, (1 + o.z − o.x)/2)`.
- **Vertex shader** (`src/shaders/impostor/octahedral_impostor_shader_vertex.glsl`):
  - the camera position goes into impostor-local space;
  - `grid = encode(dir)·(N−1)`; the frames are floor, floor+(1,1), and floor+(1,0) or (0,1) by triangle, with barycentric weights;
  - each frame's UV comes from intersecting the view ray with that frame's plane (`projectToPlaneUV`), which gives per-frame parallax-correct UVs;
  - the fragment shader blends the 3 samples.

**Baking at start-up in three r186 WebGPU** (a plan; each step uses only verified APIs):
1. Build each tree form's bake mesh: the hero LOD, or richer. There are 8–10 forms: 2 spruce, fir, 2 white pine, maple, birch, aspen, and bare winter variants.
2. `rt = new THREE.RenderTarget(S, S, { count: 2, depthBuffer: true })`. Set `rt.textures[0].name = 'output'` (albedo + alpha) and `rt.textures[1].name = 'nd'`. **[bundle §10]**
3. Bake material: unlit albedo plus `mrtNode` (or `renderer.setMRT(mrt({ output: vec4(albedo, a), nd: vec4(octEncode(objectNormal), linearDepth01, leafMask|ao) }))`). Store **object-space** normals, so the runtime rotates them by the instance yaw.
4. Orthographic camera; N×N cells (N = 8 or 12); `renderer.setRenderTarget(rt)`, then `setViewport`/`setScissor` per cell, then `render`. Capture at 2× and downsample, as Epic advises.
5. Post-bake passes:
   - **dilate** colour and normal into the transparent texels, a few pixels per cell, so mips don't bleed dark fringes;
   - build the alpha mips with coverage preservation, by CPU readback through `renderer.readRenderTargetPixelsAsync`, or a compute pass;
   - upload as DataTexture with `mipmaps`, or keep render-target textures with auto mips plus Golus's shader-side mip scaling.
6. **Runtime material:**
   - `positionNode` builds the camera-facing quad;
   - the 3-frame UVs go in varyings;
   - `colorNode = vec4(blend(albedo), blend(alpha))` and `alphaTest = 0.5`, which also gives correct shadow alpha **[bundle §3]**;
   - `normalNode` = the decoded blended normal, rotated by yaw, transformed to view space;
   - `thicknessColorNode` from the leaf mask.
   - Skip `depthNode` (pixel depth offset): it exports depth and so disables early-Z (§0.7, MJP). Use it only where intersections show.
7. **Shadow pass for free.** In the shadow pass "the camera" is the shadow camera, so the same `positionNode` turns the impostor to face the sun and picks the sun-direction frame, giving a correct silhouette.
   - Use the camera's forward direction, not position, for an orthographic camera.
   - Self-shadowing: shift `receivedShadowPositionNode` toward the sun by about 0.5 crown radius, or let far impostors not receive.
8. **Memory** (estimate): 1024² RGBA8 × 2 maps × 1.33 mips ≈ 10.7 MiB per form. 8 forms ≈ 85 MiB. At 12×12×128 (1536²) it is ≈ 24 MiB per form.
   - BC7 at runtime via spark.js (WGSL compute encoders; three r180+ `ExternalTexture`) would quarter this. It is free for non-commercial use and licensed for commercial use (https://ludicon.com/sparkjs).
   - three requests `texture-compression-bc` when the adapter has it **[bundle §14]**.

**What a 250 m – 5 km band should use:**
- At 1.2 km a crown is about 9 px; at 2.5 km about 4 px; at 5 km about 2 px.
- Individual impostors are right to about 2–2.5 km:
  - use the nearest frame only beyond ~1.2 km (2 texture fetches instead of 6);
  - use the low mips;
  - draw the far shore's trees front-to-back if possible.
- Beyond ~2.5 km, per-tree drawing is waste and aliasing. Literature for the aggregate:
  - Bruneton & Neyret 2012: z-fields near, then shader-maps on the terrain for the "combined subpixel effects of distant trees", with a smooth transition (https://diglib.eg.org/handle/10.1111/v31i2pp373-382).
  - Decaudin & Neyret 2004: volumetric-texture slabs on terrain prisms, suited to distant and fly-over views (https://evasion.inrialpes.fr/Publications/2004/DN04).
- For Hot Brook: the far land already drapes the NAIP photo. Add the canopy photo plus a shader-map term (darker at oblique views, a hot-spot brightening when the view is down-sun) and a canopy-height lift of the far mesh for ridge silhouettes. The "TREES absorbed into the ortho photo" item in browser_3d_rendering.md is the same idea.

**Context, not applicable here:**
- UE 5.7's experimental **Nanite Foliage** combines Assemblies (instancing), Skinning (wind) and **Voxels**. Voxels draw "millions of tiny, overlapping elements" such as canopies and pine needles at distance "without cross fades, pops, or the need to author LODs" (https://www.guru3d.com/story/unreal-engine-57-released-with-new-procedural-content-generation-and-more-features/ ; https://80.lv/articles/check-out-new-features-arriving-with-unreal-engine-5-7).
- Nothing like it exists in three. The far canopy shader-map is the browser-scale cousin.

**GPU-driven culling:**
- AC Unity: fixed 64-triangle clusters, GPU culling, indirect draws, and no CPU–GPU round trip (Haar & Aaltonen, SIGGRAPH 2015, https://advances.realtimerendering.com/s2015/aaltonenhaar_siggraph2015_combined_final_footer_220dpi.pdf).
- WebGPU indirect arguments come from a GPUBuffer. On Chrome/D3D12 the indirect args are validated by compute dispatches, one per separate buffer: **412 draws across separate buffers cost about 3 ms; combined into one buffer, about 10 µs**. Pass timestamps don't show this cost (https://toji.dev/webgpu-best-practices/indirect-draws).
- three's WebGPURenderer is slow with many separate objects because of per-object UBO overhead. At 10k cubes: WebGL ~130 fps, WebGPU ~60 fps (r181, M4 Pro). The maintainers' workaround is "use instancing and batching" (https://discourse.threejs.org/t/webgpu-performance-issue/87939).
- A forum forest found that a monolithic InstancedMesh with a world-sized bound pushed about 1M instances through the vertex shader. Splitting it into 20 clusters gave about 3× on WebGPU. Per-tree culling took an old iPhone from about 15 to 60 fps in first person, where 20–30 % of the forest is visible (https://discourse.threejs.org/t/procedural-instanced-forest-high-performance-real-trees/88610).
- **For the walker:**
  - A dense forest hides almost everything past 100–200 m, so Hi-Z occlusion culling is the big win. Build a depth pyramid from the previous frame's depth in compute, and test bounding spheres in the cull pass. three has no built-in, but all the pieces exist: StorageTexture, compute, `textureLoad`.
  - Pick LOD by **projected size**, not metres, so one rule serves both cameras.

## 5. Wind

**Crysis (GPU Gems 3 ch. 16):**
- **Main bending:** `bf = height·bendScale; pos.xy += wind.xy·bf; pos = normalize(pos)·length`. Renormalising keeps each vertex on its sphere around the base, which limits stretching.
- **Detail bending** from vertex colours:
  - R = edge stiffness (flutter of leaf edges);
  - G = per-leaf phase;
  - B = overall leaf stiffness (up and down);
  - A = AO.
- The detail bend uses 4 smoothed triangle waves (`abs(frac(x+0.5)·2−1)` then `x·x·(3−2x)`) at frequencies 1.975, 0.793, 0.375 and 0.193. The phases come from `dot(worldPos, 1)` plus branch and vertex phases.
- Per-instance wind is summed on the CPU from point and directional sources, at a constant per-vertex GPU cost.
- URL: https://developer.nvidia.com/gpugems/gpugems3/part-iii-rendering/chapter-16-vegetation-procedural-animation-and-shading-crysis

**SpeedTree** (legacy UE4/Unity mode):
- The layers are cumulative presets:
  - Fastest = global sway;
  - Fast + leaf ripple (vertices along their normals);
  - Better + branch motion (one branch level moves independently);
  - Best + leaf tumble (rotation about the anchor, "considerably more expensive than rippling");
  - Palm + frond ripple.
- Frequencies go global < branch < leaf (https://docs.unity3d.com/speedtree-modeler/manual/wind-legacy.html).
- Fan properties:
  - global: height exponent, distance, frequency, direction adherence;
  - branch: distance, frequency, whip, turbulence, sway bias and frequency;
  - leaf: ripple distance/frequency, tumble flip/twist, twitch throw/frequency/sharpness;
  - gusts: frequency, strength, duration, rise/fall;
  - strength-driven curves and response times (https://docs.unity3d.com/speedtree-modeler/manual/fan-legacy.html).
- v9 "Games" wind adds anatomical weights so "waves of wind roll through the model" (https://docs.unity3d.com/speedtree-modeler/manual/wind-games.html).
- Runtime inputs per vertex are two branch channels (weight, direction, noise offset) plus a ripple weight (https://docs.unity3d.com/speedtree-runtime-sdk/manual/example-wind-shader.html).

**Hierarchy pivots:**
- Unreal's Pivot Painter 2 bakes pivots, axes and parents into textures. The material walks the parent chain in the vertex shader (https://dev.epicgames.com/documentation/unreal-engine/pivot-painter-tool-2.0-in-unreal-engine).
- Book of the Dead used hierarchy pivot (trunk → branch A → branch B, level painted in vertex green), single pivot, and procedural modes, with per-level range and elasticity plus noise "flutter" (Unity blog, URL above).

**Cheap version for Hot Brook** (vertex shader; all parameters from `WIND3`):
- **Trunk:** keep the current h² bend. Add Crysis's renormalisation so tall pines don't stretch.
- **Branch:** each card stores its attachment pivot (vec3 in tree units, 3 × uint8 or half) and a phase byte, in one packed attribute.
  - Rotate the card about its pivot by `θ = a_b·sin(ω_b·t + φ) + gust`, with `ω_b` ≈ 0.6–1.5 Hz rising with wind speed. Weight by the vertex's distance from the pivot.
- **Leaf flutter:** displace along the card normal by `a_l·sin(ω_l·t + φ_vertex)` with `ω_l` ≈ 3–8 Hz, weighted toward the card's outer edge (one uv-derived weight, no extra data).
  - Species amplitude: aspen ≫ birch > maple ≫ conifers. Aspen's petiole is "flattened laterally, causing [the] leaf to flutter in the wind" (https://extension.usu.edu/treebrowser/catalog/aspen-quaking-trembling ; https://dendro.cnre.vt.edu/dendrology/syllabus/factsheet.cfm?ID=160).
- **Impostors:** trunk sway only, as a shear of the quad's top.
- **Shadow pass:** `castShadowPositionNode` = trunk and branch sway without flutter.
- **Motion vectors** (if TRAA): the same function at `t − dt` into `positionPrevious`.

## 6. Procedural textures versus CC0 assets

**Procedural at start-up** (recommended, for species accuracy and zero assets):
- **GPU bake:**
  - build tiny 3-D twigs procedurally, one per species: a spruce/fir needle spray (needles as thin quads or prisms around a twig, flat in fir and all-round in spruce), white-pine 5-needle fascicles in tufts, and maple/birch/aspen leaf clusters (leaf meshes with a midrib fold);
  - render them orthographically into MRT tiles: albedo+alpha, plus oct-encoded normal + thickness + AO;
  - dilate, then build coverage mips.
  - This is the same pipeline as the impostor baker. SpeedTree artists build needle atlases the same way, from rotated planes plus vertex noise (snippet, above).
- **Canvas 2D** is the quicker option for the leaf silhouettes themselves: lobed red maple, ovate serrate birch, round aspen. Derive a normal map from a height built from the alpha's distance transform plus veins.
- The bark is also procedural:
  - birch: white with dark horizontal lenticels;
  - spruce and fir: grey scaly bark;
  - white pine: dark furrowed bark on old trees;
  - maple: grey, smooth when young.
- A procedural three.js forest generates leaf and bark textures at runtime the same way (forum, URL above).
- Respect the determinism invariant: render-side randomness uses `Math.random` or a local hash, as `treeBuilder`'s `hsh` does, never `core.rand`.

**CC0 options** (not downloaded; the licences are verified):
- **ambientCG:** everything is CC0 1.0; credit is appreciated, not required (https://docs.ambientcg.com/license/).
  - It has leaf atlases (`LeafSet015`…`LeafSet030`, dataType "Atlas") and bark (`Bark001`–`Bark015`; `Bark014` is tagged fir) (https://ambientcg.com/api/v2/full_json?q=leaf ; …?q=bark).
- **Poly Haven:** assets are CC0, and redistribution is allowed (https://polyhaven.com/license). Its terms of service forbid scraping, so download by hand, not by script.
  - Bark: `pine_bark`, `knotted_pine_bark`, `trident_maple_bark`, `bark_brown_01/02`, among others (https://api.polyhaven.com/assets?t=textures&c=bark).
  - Models: `fir_tree_01`, `pine_tree_01`, `fir_sapling`, `pine_sapling_*`, `shrub_01–04`. There is no birch, maple or spruce (https://api.polyhaven.com/assets?t=models&c=plants).
  - These could serve as reference or bake sources, but the species don't match Maine's.
- **ez-tree** (MIT code; its bark textures are from ambientCG CC0). Check the repo's LICENSE for its leaf textures before reuse (https://github.com/dgreenheck/ez-tree).
- **Not CC0:** Quixel/Fab Megascans and the SpeedTree library.

## 7. A concrete design for this project

**The bands:** see the summary at the top.

**Data:**
- **Per tree:** one storage record of about 32 B: x, groundY, z, H, crownW, yaw, species/form, colour seed, birch flag. ~1M trees ≈ 32 MB.
- **Per card vertex:** position (half3 or float3), crown normal (snorm8×4, with AO in w), uv (unorm16×2), wind (pivot 3×u8 + phase u8). That is 4 interleaved buffers, under the 8-buffer cap **[§0.17]**.

**Frame flow:**
1. Cull and LOD compute over all trees: camera frustum ∪ shadow box, the band chosen by projected size with a per-tree hash jitter, and a Hi-Z test later.
2. Clear and fill the indirect args in **one** buffer.
3. Shadow pass: the shadow-only proxy meshes, which are LOD1 cards near and crown proxies or impostors far.
4. Depth prepass for the hero and near cards, once on reversed-Z.
5. The colour pass, drawn front to back by band: hero, near, then impostors.
6. GTAO, bloom, FXAA as now (TRAA later).

**Budgets** (estimates for a mid–high desktop GPU at 3440×1440):
- **Colour pass triangles:**
  - hero: 100 trees × 3k = 0.3M;
  - near: 1.3k trees × 0.6k = 0.8M;
  - mid impostors: ≤ 150k × 2 tris = 0.3M;
  - total ≈ 1.5–2.5M.
- **Shadow pass:** ≤ 1M triangles.
- **Draws:** about 6 forms × 2 card LODs + 1–2 impostor draws + about 8 shadow-proxy draws + 1–2 compute dispatches, roughly **25**.
- **Fragments:** the hero and near canopy has 3–6 card layers. A depth prepass brings full shading down to about 1×; the secondary overdraw survey claims "8–15× naive → 1–2×" (https://app.cinevva.com/blog/2026-05-11-foliage-overdraw, a secondary source; it cites MJP, Persson, Frostbite and Wyman).
- **Targets:** trees ≤ ~3 ms colour + ≤ ~1.5 ms shadow + ≤ 0.2 ms compute. Treat these as hypotheses to measure.

**Biggest risks:**
1. **Overdraw of alpha cards.**
   - Mitigate with reversed-Z and a prepass, trimmed cards, and fewer, larger cards early (the SpeedTree shrink and grow).
   - The walker under the canopy and an orbit camera skimming the treetops are the worst cases.
2. **Shadow pass.**
   - Alpha-tested cards into 4096² are fill-heavy.
   - Use shadow proxies by texel size, `castShadowPositionNode` without flutter, and maybe a throttled `needsUpdate`.
   - With CSM, give the near cascade cards and the far cascades proxies, updating the far ones every 2–4 frames (GPU Gems ch. 4 used rates of 1, 2 and 4 frames).
3. **Impostor fragments** at grazing views across the lakes.
   - Use nearest-frame sampling past ~1.2 km, a trimmed hull, and front-to-back order.
4. **Log depth** (§0.7) — remove it.
5. **Start-up time** of the bakes: about 8 forms × 64–144 cells plus the atlases. Each cell is a tiny orthographic render, probably a few hundred ms in all; measure it.
6. **Memory:** atlases about 40–90 MiB plus impostors about 85 MiB at 1024². Watch integrated GPUs.

**Measuring GPU time in this renderer** (verified API surface, §0.14):
```js
const renderer = new THREE.WebGPURenderer({ canvas, trackTimestamp: true /* + reversedDepthBuffer later */ });
// each frame, after rendering (or every N frames):
const ms = await renderer.resolveTimestampsAsync(THREE.TimestampQuery.RENDER);      // total GPU ms of the frame's passes
const cms = await renderer.resolveTimestampsAsync(THREE.TimestampQuery.COMPUTE);    // the cull pass
// per render context (shadow map, scene pass, GTAO, bloom, FXAA…), internal but stable in r186:
for (const [uid, t] of renderer.backend.timestampQueryPool.render.timestamps) console.log(uid, t.toFixed(3));
```
- Resolve every frame or every few frames. If too many contexts pile up you get "Maximum number of queries exceeded"; calling resolve after render fixed it (https://discourse.threejs.org/t/r173-resolve-timestamps-error-message/77370).
- Enable chrome://flags/#enable-webgpu-developer-features to lift the 100-µs quantisation (https://developer.chrome.com/docs/web-platform/webgpu/developer-features).
- Pass timestamps exclude Chrome's indirect-validation dispatches (toji, above). Watch the CPU frame time too.
- Method: A/B toggle each feature (cards versus faceted, prepass on and off, shadows on and off, impostor 3-frame versus 1-frame). Measure in real Chrome at the human's resolution, not the preview pane (SESSION_STATE, `docs/research_notes/.../browser_3d_rendering.md`).

---

### Sources that could not be read (not bypassed)
- bgolus.medium.com (403)
- polycount.com threads (403)
- tympanus.net Codrops "Fractals to Forests" (403)
- store.speedtree.com tutorials (403)
- b00merang.artstation.com (403)
- shaderbits.com (the body is script-rendered; only the navigation came back)
- GDC Vault session pages (login)

Where these are cited, the claim rests on the search-result snippet, marked "(snippet)", or on a reproduction named beside it.
