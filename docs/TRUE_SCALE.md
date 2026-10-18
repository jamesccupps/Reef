# True scale: the Hot Brook lakes at their real size (design + prototype, 2026-10-16)

## The request

The human asked "can we just make everything true to scale". Two observations led there:
- True-size trees "all seem a bit tall to the size of the lake".
- "If you scale everything, then why would it not look the same".

The 3-D world (docs/HOT_BROOK_3D.md) is not scaled evenly. The lakes are 1/10 of their real width, but their depths, the fish, the plants and the trees are true size:
- The depth, the fish and the plants must be true, or the ecology changes. A 1/10-deep lake would freeze to the bottom, warm in hours and be lit to the bed everywhere. A 1.5-cm "perch" is a different animal.
- The narrowing cut the water area, and with it the fish, a hundredfold, so the sim could run live in a browser.

The cost of the narrowing is that anything real-sized on the land stands 10× too tall against the shore. The fix is to drop the narrowing.

## What true scale means

- **Both lakes at their real size:** Upper 369 ha, 3.4 km long; Lower 274 ha. The brook is its real 154 m, about 8 m wide.
- **The water model in real lengths:** `H3.REAL` = 1, with 50-m columns as now.
- **All the fish of the real lakes:** about 1.6 million of 7.5 cm or more.
  - That is about 2,500 a hectare, ~100 kg/ha, mostly 10–20-cm panfish averaging ~40 g. The nets of nine nearby lakes suggest fewer yellow perch and shiners, maybe 0.7–1.3 million.
  - Plus each year's young: millions in summer.
  - Crayfish, mussels, snails and insects stay populations per patch of bed, as now (insects number in the billions).
- **The land, the trees, and later the camps and roads at true size.**

## The prototype (measured; the human's machine, with the 3-D view running beside it)

`tools/hotbrook/build_world3d.py` now takes `HB_SCALE` / `HB_BROOK_SCALE` / `HB_BROOK_W` / `HB_MARGIN` / `HB_OUT`; the default build is unchanged. The world was built at `HB_SCALE=1` into a scratch copy of `src/`, and the existing sim was run on it with `H3.REAL = 1` and `H3.COL = 50`.

| | the 1/10 world now | true size |
|---|---|---|
| World grid | 1.5-m cells (15 m real) | 173 × 483 cells of 15 m; 671 kB of geometry |
| Lakes | 3.69 + 2.74 ha | 369 + 274 ha |
| Water model | 2,619 columns, 15,007 cells, ~10 ms an update | 2,606 columns, 14,961 cells, ~53 ms an update (more transport sub-steps at real lengths; it updates once a simulated minute) |
| Fish | 16,300 in 3,045 agents | **1.63 million in 304,256 agents** (schools of ~80 perch, white perch and shiners; one agent per sunfish, bullhead, bass, sucker and pickerel), founded in 4.6 s |
| Memory | ~11 MB of agents | 889 MB heap (3.0 KB an agent: the brain's 346 inherited weights + a 346-weight learned copy + state); 2.3 GB process |
| A coarse block (29 min) | 34 ms (12 µs an agent) | 14.6 s (50 µs an agent) → ~120× real time on one core |
| A 0.1-s fine step of every fish | 16 ms | 8.4 s |
| GPU: 1 million simple trees (12 M triangles) added to the scene | | still ~45 fps (RTX 3060 class) |

**What this says:**
- The existing code runs at true scale.
- Real time cannot step every fish second by second. Fidelity must follow the camera.
- Memory must shrink about 3×.
- Fast-forward is ~100× slower than today unless split across cores.

## What the rebuild needs (stages; each leaves the gate green)

- **T1 — Geometry at true scale with a finer shore.**
  - 5-m cells within ~150 m of the water, from the lidar (2 m) and the NAIP shelf. The 0–1.3 m shelf is often under 15 m wide.
  - The brook as a channel: its real path, width and depth profile, carved through the grid.
  - 15-m cells beyond.
  - The angler's notes, the inflow and the outlet at their real places.
  - **Built (2026-10-17).**
    - **The landscape model at 5 m.** `tools/hotbrook/build_model.py` takes `HB_CELL=5` and `HB_CROP` (the lakes' box with ~400 m of land). It keeps the whole box's local metres, so the soundings and the field notes keep their places.
    - **The photos' shelf at 5 m.** `shallows.py` reads it through `HB_MODEL` / `HB_SHALLOWS_OUT`; its 45-m neighbourhood and its pixel minimum scale with the cell size. The photos' shelf is ~94 ha of visible bottom and 2.7 ha of weed beds.
    - **The world.** `build_world3d.py` takes `HB_MODEL`, `HB_JS` and `HB_SIM_ONLY` and writes `src/w3/true/hotbrook3d.js` (5 MB): 455 × 1385 cells of 5 m, both lakes and 150 m of land about each.
      - Upper: 369 ha, mean 2.99 m, max 5.52 m.
      - Lower: 274 ha, mean 2.57 m, max 4.12 m (the deepest sounding resolved where 15-m cells averaged it to 3.9).
      - The brook: 154.6 m long and ~8 m wide (11 m on average over the 5-m cells, with the mouths' short links), its pool 1.06–1.13 m.
      - The water within one cell of shore averages 0.41 m.
    - The default 15-m model and the 1/10 world rebuild byte-identical.
    - **The geometry module.** `src/w3/geometry.js` became `makeGeometry(HB3)`.
      - The sim's world is the 1/10 one, unless `HB_WORLD=true` (Node) or `globalThis.HB_WORLD = 'true'` asks for the true one; it is built in ~150 ms.
      - env3's `H3.COL` and `H3.REAL` now follow the world's scale (50-m columns, ×1 at true scale).
      - On the true world the water model builds 2,622 columns and 15,072 cells in 0.5 s, at 18.7 ms a 15-min step.
    - **Gate.** test/w3.mjs's `true` section: 9 checks at true scale — the areas and depths, the brook, the north basin, the shallow shares, the connection inflow → brook → outlet, the angler's spots, the shallow shore, depthAt.
    - **Not yet.** The far land and the photo at true scale (T6: tiles). The many constants written in world metres for the 1/10 lakes, listed for T2–T3:
      - the plants' SHELTER_R and WOOD_W;
      - the fish's home ranges, SUB_R, brook distances, site spacing, BAND_SLOPE and the hash cell;
      - the insects' fall-in × GEO.SCALE (already scaled).
- **T2 — The water model in real lengths.** `H3.REAL` 1, 50-m columns (25 m near shore if the coves need it). It is calibrated in real lengths already; re-check transport and circulation.
  - **Built — the water, the chemistry, the plants and the bed's animals (2026-10-17).** `HB_WORLD=true W3_ONLY=env,chem,plants node test/w3.mjs` passes 36/36 on the true-size lakes. That covers:
    - temperature, ice-on and ice-out (Apr 23), the coves' daily swing and the night siphon, the unstratified basin;
    - the N and P budgets, the year's O₂ (winter by a 3-seed median), retention;
    - the diatoms, the weeds as species and their roles, the invertebrates, crayfish, mussels and the land's insects.

    What it took:
    - **The world-metre constants that meant real distances now scale with the world:** the plants' SHELTER_R (200 m real), WOOD_W (15 m), and the leaf fall's LEAF_R (150 m). The gate asks for its water columns in real metres (`col: 10 * CS`, 100 m).
    - **THE BROOK'S OWN COLUMNS.** An 8-m brook in 50-m columns vanished into its banks' columns (1 of 2,622; none at 100 m) and its moss died out. Where the columns are > 4× the brook's width, `buildColumns3` gives its fine cells their own columns:
      - 20-m stretches along its path, never merged away; 8 stretches, the pool's 1.13 m and the riffles' 0.45 m kept;
      - no wind gyre, drift or siphon through their faces (a sheltered stream: its flow is the implicit through-flow, stable however small the stretch);
      - `colAt` reads the fine cell's column.

      The 1/10 world's brook is a column wide already, and its columns are unchanged.
    - **Cost.** ~12.5 ms an update at true scale (budget 20; 12 at 1/10).
  - **Not yet:** the fish (T3: the constants in world metres written for the 1/10 lakes — home ranges, SUB_R, the brook distances, site spacing, BAND_SLOPE, the foraging footprint — then fidelity by distance), and running the true world's sections in the default gate (T7).
- **T3 — Fish fidelity by distance.**
  - **Built, part 1 — the fish's distances and the cost of a crowd (2026-10-17).**
    - **The landscape distances, as real metres × GEO.SCALE.** These were written in world metres for the 1/10 lakes; the 1/10 world keeps them bit for bit, and every product is exact in floating point:
      - SUB_R 400 m, BROOK_NEAR / BROOK_RUN 600 / 1500 m, FP_MIN–FP_MAX 40–200 m;
      - the bed's slope, now 0.012; a smallmouth's nest faith 20 m; a species' grounds ≥ 60 m apart;
      - the fallfish's nearBrook 400 m, YOY_ROAM 150 m, the far-trip and shore-cue distance 200 m;
      - the young's scatter about a column; the slope field's smoothing (~100 m);
      - RELOC_MIN, the bed grid's cell.

      The brook's ones scale with GEO.BROOK_SCALE: the runners' mate search and the dace's home.
    - **HOME at true scale.** The research's ranges as radii (habitat3d.md): sunfish 45, redbreast 80, bullhead and pickerel 120, sucker 230, perch 300 [inf], white perch 400 [inf], fallfish 300 [inf], killifish 60 [inf], smallmouth 700 m. The 1/10 leash radii read ×10 would overshoot most of these and undershoot bass.
    - **The brook as range again at true scale.** A lake fish in the brook no longer goes home, and the lakes' young may feed in it. Both were 1/10 compromises (there the brook was ~25× its real share of the shallows).
    - **The cost of a crowd.** On the true lakes in June, 80,000 fish are ripe at once:
      - The mate search scanned ~400 4-m hash cells of every fish per ripe fish. Now short reaches (a school's 3 m) use the hash, longer ones a per-step index of the ripe fish by species in 40-m cells, and a pair stays a pair: a mate still ripe and in reach is kept, a behaviour change; the 1/10 gate is still 90/90.
      - Each species' traditional grounds now scale with the lake's area: Upper 264 and Lower 175 pumpkinseed colonies, where the 1/10 world's 10 a lake had piled ~1,500 ripe sunfish to a colony. A nearest-ground index serves the hundreds.
    - **Measured on the true lakes.** 303,807 agents (1.23 M fish, 1,905/ha, 105 kg/ha) found in 3.9 s and ~1 GB. A coarse 29-min block costs 8.2 s (27 µs an agent; it was 11.1 s, 37 µs):
      - the senses ~3.2 s;
      - the step's bookkeeping ~1.4 s;
      - GC ~0.8 s;
      - moving and feeding the rest.

      The brook's realistic crowd (dace 0.8/m², fallfish) packs ~1,000 agents into its 2-cell-wide channel.
  - **Built, part 2 — fidelity by distance (2026-10-17).** `Fish3.setFocus(x, y, r)`.
    - **Near fish.** At the fine rung the fish within r of the focus live second by second (0.1-s steps, brains at 5 Hz).
    - **Far fish.** They are SCHEDULED: each is due FAR_BLOCK (60 s) after its last block, staggered by id, so each step carries ~1/600 of them. It then lives that time as one coarse block, its brain deciding once, lit by the block just past.
    - **Crossing the edge.** A fish coming into the focus first lives its time since its last block. One leaving it starts its schedule. The way out is r × FOCUS_HYST, so a fish at the edge doesn't flicker between the two.
    - **What a step touches.** Not the 300,000: the near fish, the far ones due, and the bookkeeping.
      - The whole lakes' hash, counts and biomass come once a simulated second (HASH_EVERY 10).
      - The focus has its own hash every step over the region within REGION_M 50 m of its edge. The near fish's senses, strikes and close mates read it.
      - The dead are compacted every 50 steps, not rebuilt each step.
      - The step's per-fish body became `_live`, shared by every rung.
    - **The view.** It sends where it looks with each tick. On the true-size lakes at the fine speeds the worker sets the focus at twice the camera's distance, 80–250 m. The 1/10 world, every fish drawn, steps them all alike.
    - **Measured on the true lakes**, focus 200 m at the west cove: ~3,900 near agents, a fine step ~54 ms on average (it was 114–134 with every fish stepped). So 1× needs ~0.54 s of the worker a second. The spikes (~1.2 s) are the whole lakes' merge pass once a simulated minute.
    - **Gate.** On the 1/10 world, a 200-m-real focus for two minutes: the near fish swim, every fish has lived the time to within a block, the population is kept.
  - **Built, part 3 — the cost at true scale (2026-10-17).** Measured first; the causes were not the ones guessed.
    - **The 1-s stalls were V8 re-shaping every fish.** A number field first written as an integer is held as a small integer. The first fraction later written to it (the year's first nest, the first missed strike, …) re-shapes every object of the class: ~1 s for the 300,000 fish, at a different moment for each such field. It also slowed the merge pass, which was paying for it (680 ms → 16 ms).
      - Fixed: `SHAPES` in fish3.js turns each number field that can hold a fraction into one, on a template fish and young school made before any real one.
      - The template must stay alive, so it is exported: V8 holds a shape only while some object has it, and an unexported const that nothing reads dies once the module has run.
    - **The senses' scan was memory-bound, not arithmetic.** Each fish scans ~18 neighbours: 300,000 scattered objects, with their numbers boxed. Fixed with `P`, every fish's x, y, z by index (four numbers a fish, contiguous):
      - filled by the hash build, kept exact by each fish's own step (`_posAt`);
      - the senses and the mate search test distance on P and touch a fish only when it is in reach.
    - **A block's drive skips the fine swim's work** (the turn, the look ahead, the pitch: only `_move` reads them).
    - **One pass over the fish once a simulated second.** The counts by species, the biomass and the focus's region now come in the hash's pass, the region read from P.
    - **The season's start.** A new lake opens with the season's young so far (`seedSeason`). It found each spawning female's mate by scanning every fish: ~110 s at true scale. An index of the males by home now gives the same mates in 7.5 s for the whole start.
    - **The field-scan cache per column was not needed.** The food fields are ~1 % of a block.
    - **The young by distance, as the fish.** The schools within the focus live each fine step. The rest live scheduled FAR_BLOCK blocks: a block's cruise about their spot, their feeding tick over the block. Their density, region and hash come once a simulated second. The season's young at true scale is ~84,000 schools, not ~11,000.
    - **Behaviour.** The 1/10 world without a focus is **bit-identical** through the shape fix, P, the mate search and the drive. A fingerprint (`tools/w3_fingerprint.mjs`) of every fish and young school after spring and summer runs (blocks, fine steps, a focus minute, blocks again) matches the old code exactly. The young by distance changes focus runs only, by design.
    - **Measured on the true lakes.**
      - **A coarse 29-min block.** July went from 7.8 s to 4.8 s (26 → 16 µs an agent). Through the year:
        - late April 14.4 µs;
        - the June spawning 18.0 µs;
        - September 13.6 µs;
        - under the ice 11.6 µs.

        That is ~15 µs on average, the target.
      - **A fine 0.1-s step**, focus 200 m in July with the season's young:
        - median 51 → 34 ms, mean 64 → 45 ms;
        - the once-a-second full step ~105–115 ms;
        - no stalls past the first step.

        The young went from 19 ms a step to ~1 ms.
    - **Gate.** The fidelity check now runs with the season's young. Each school lives the two minutes to within a block; the young are kept (alive + recruited); P is exactly every fish's place after a step.
  - The fish near the camera (~150–250 m) live second by second: 0.1-s steps, brains at 5 Hz.
  - The rest live in coarse blocks (a minute at 1×, up to 30 min in fast-forward), each still deciding with its own brain once a block.
  - Fish switch rung as the camera moves.
  - The per-step bookkeeping that today walks every fish (the neighbour hash, counts, biomass) moves to the block rate or is made incremental.
  - Target: ≤ 15 µs an agent per block.
- **T4 — Memory.** Store the inherited brain compactly (16-bit or 8-bit with a scale). Allocate the learned copy only once a fish has learned something. Target ~1.2 KB an agent (~370 MB).
  - **Built, part 1 (2026-10-18): the learned copy is the block learning changes.** A fish's plastic copy of its brain was a whole copy of its genome (346 weights). Learning (`reinforce3`) only ever changes the hidden→output block, so the copy is now that block alone (60 weights, `plastic3`). `forward3` runs the genome with the copy's block in place of its own. The behaviour is bit-identical (tools/w3_fingerprint.mjs).
    - On the true lakes after founding: array buffers 909 → 561 MB (−348 MB), the process 2.29 → 2.17 GB. The heap grew ~220 MB because T3's fix (every number field that can hold a fraction holds a boxed double from the start) pays up front what the old shapes paid as fields first took fractions.
    - **What is left, by size:** the genomes (346 float32, ~1.4 KB an agent: 16-bit would halve them but changes the weights), the boxed doubles of ~120 number fields (~2 KB an agent: a typed-array record per fish would remove the boxes, a large but mechanical change the fingerprint can verify), and the young schools.
- **T5 — Several cores.** Split the population across 2–4 workers by water (Upper; Lower + the brook); fish that cross are handed over. Or use shared memory, which needs the COOP/COEP headers in serve.mjs / serve.py; fine on localhost. Target fast-forward ≥ 500×, a simulated year in under ~18 h.
  - **Built (2026-10-18): the fish in shards by water, the water in shared memory.**
    - **`src/w3/shard3.js` — the shards, in one thread.** Shard 0 holds Upper's and the brook's fish and young, shard 1 Lower's. The brook went with Upper because Upper's pumpkinseed and redbreast run in and out of its pools all season.
      - **Each shard is a Fish3 on the one water model (`setShard`).** Its fish read and write only its own water: the columns about them and the foraging footprint are filtered to its own, once.
      - **Crossing.** A fish that swims into the other water finishes the step feeding and breathing in the cells it started in, then is handed over (`takeOut` / `adopt`: plain data, genome, learned weights and brain state copied).
      - **The lake-wide couplings come from the step before**, as threads get them: the other shard's fish per species (the recruitment cap), its young (the young's density compensation), and the biomass the zooplankton answer.
      - **Founding.** Each shard founds as one thread would (the same draws) and keeps its own water's fish. New ids get a range per shard.
      - **Random streams.** Each shard has its own, swapped in for its turn, so a run is deterministic.
    - **`src/w3/envshare3.js` — shared memory.** The water model's 160 typed arrays (7.4 MB at true size) go onto SharedArrayBuffers, every reference to each moved together. A shard's replica, built alike, adopts them. The 217 scalars (the clock, light, weather, turbidity…) follow each water step.
    - **`src/w3/shardpool3.js` and `render3/shard3worker.js` — the shards in workers.** The pool keeps the water and steps it; each step goes to every shard at once, with the hand-overs and couplings. `render3/fishside3.js` is what a fish-holding worker does for the view: poses, drawn fish, the picked fish's card, its share of the data page.
      - The page runs the shards when it is cross-origin isolated (serve.mjs / serve.py send COOP + COEP on w3.html, COEP on the scripts; the 2-D page is left alone for its fonts) and on ≥ 4 cores. `?shards=0` keeps one worker.
      - `tools/w3_shard_host.mjs` runs the same worker code on Node's worker_threads, for headless runs.
    - **Measured.**
      - The founding split is the single founding's exactly.
      - On the 1/10 lakes a 15-hour run keeps the fish and biomass of a single run (12,483 vs 12,485, 101.2 kg/ha both) and repeats exactly.
      - **The threaded pool matches the in-process set bit for bit:** after 12 blocks the water's temperature, O₂, zooplankton, bed animals and the fish biomass are identical, with the same 79 hand-overs (scratchpad threadeq).
      - **True lakes in Node (`tools/w3_bench_shards.mjs`): a 29-min block 4.9 s on one thread (359× real time), 3.2 s in 2 shards (547×).** That is 1.5× against a ceiling of ~1.7× (Upper and the brook hold ~58 % of the agents).
      - Hand-overs: ~2,000 a block on the true lakes, nearly all the brook-spawned sucker and fallfish young ranging between the brook and both lakes. A young school's feeding tick accumulates, so it loses nothing.
      - In the browser the hidden preview pane gave noisy numbers (276–676×). Judge it with the page in view.
    - **Gate.** On the 1/10 lakes: the founding split, a run within 2 % of a single one, hand-overs, none left in the other's water, unique ids, repeats exactly. serve-check: the 3-D page is cross-origin isolated and the 2-D page is not.
    - **Next.** More shards would need a line within a lake: fish interact across it (prey, schools, mates), so it needs a halo of the neighbours' fish. Or fewer, cheaper agents per block.
- **T6 — Drawing at true size.**
  - Terrain in tiles that sharpen near the camera (15-m base, lidar detail near).
  - NAIP in tiles: the true-scale photo is 5,170 × 12,920 px, beyond one GPU texture.
  - ~1.2 million true-size trees: full trees near the camera, cut-outs beyond.
  - Fish drawn within ~250 m (the sim knows all 1.6 M).
  - Weeds, crayfish and mussels near the camera, as now.
  - **Plan (2026-10-17, from reading the view's code).** T6a is the first view of the real lakes; T6b–c follow.
    - **T6a — the true world in the browser.**
      - **The switch.** `w3.html?world=true` opens the true lakes. A first-import module sets `globalThis.HB_WORLD` from the URL in the page and in the worker (the worker's URL carries it), so geometry.js picks the world as Node does. The panel gets a link between the two.
      - **The worker sends only the fish near the view.** Today every snapshot carries every fish (300,000 × 18 numbers ≈ 22 MB a frame) and each step's `remember()` walks them all. At true scale:
        - the snapshot takes the fish within the drawing radius of where the view looks, read from P;
        - `remember()` covers the focus's region only;
        - the weeds' field is sent less often (13 forms × ~257,000 bed cells).
      - **The ground.** The band (455 × 1,385 cells of 5 m, ~1.3 M triangles) and the water as now. The far land from `build_world3d.py` at true scale: ~1.5 km beyond the band on ~20-m cells, into `src/w3/true/far3d.js`.
      - **The photo.** NAIP re-cut at ~1.5 m a pixel, ≤ 8,192 px a side (one WebGPU texture), into `src/w3/true/naip3.jpg`.
      - **The land at its height.** The land-height slider's ×1 means true metres there.
      - **The camera's reach, the sky and the fog at kilometres:** far plane, sky dome, fog density, the rig's zoom limit. The named views and labels, which were placed in 1/10 metres.
      - **Trees.** All of them (~10⁶) as simple low instances, plus full trees within ~500 m of the camera, re-picked as it moves. The prototype measured 1 M simple trees at ~45 fps.
    - **Built, T6a (2026-10-17): `w3.html?world=true`** — the real lakes in the browser; the panel links the two worlds.
      - **The world switch.** `render3/world3sel.js`, imported first by the page and by the worker (its URL carries the query).
        - The worker now says `loaded` before the page sends `init`. In the true world geometry.js awaits its 5-MB data module, and a module worker's messages sent before its handler exists are lost: the first try sat at "starting the lakes" for good.
        - The start reports its stages and any error.
      - **Start-up ~15 s** (Node 7.5 s). The season's spin-up had scanned every fish for each spawning female's mate: ~110 s at true scale. It now uses an index of the males by home and picks the same mates (T3 part 3).
      - **The ground.** The band's 455 × 1,385 cells of 5 m and the water as before.
        - The far land is 266 × 498 cells of 20 m, out to 1.5 km, from the full-box 15-m model.
        - The photo is 3,547 × 6,640 px at 1.5 m, with the ~1-m NAIP tiles where they cover: single crowns show on the shore. Both are in `src/w3/true/` (tools/hotbrook/README.md).
        - The default 1/10 build stays byte-identical.
      - **The land at its height** (the slider ×1–3).
      - **At kilometres:** the camera's reach and far plane, the sky dome, the named views and label reach. The haze is the 1/10 world's at ten times the distance. The lakes' labels give their real areas.
      - **The forest: 860,000 true-size trees** (377,000 conifers, 483,000 hardwoods) in typed arrays, binned in 200-m tiles.
        - Full trees stand within 1.2 km of where the view looks, re-picked every 240 m it moves.
        - Every other tree is a simple cone or blob in one instanced draw per kind, from four numbers a tree (no matrices). These collapse inside the near disc, stay out of the water's mirror, and are hidden while the camera is under water.
      - **The fish drawn are those living second by second** (the focus), while the camera is within 900 m; from farther they would be sub-pixel. Fast-forward (no focus) draws those within 320 m.
        - The focus is twice the camera's distance (40–250 m), shrunk while more than 6,000 agents live in it. The brook's mouth packs 20,000 agents into 250 m, which cost 154 ms a step.
        - Measured in the browser: steps of 37–54 ms with ~4,500 fish drawn, ~2× real time at the fine rung.
      - **Weeds, the bed's animals and the insects** keep their densities per m² on 5-m cells (their per-cell counts and caps × the cell's area). The weeds' field comes every 20 s.
      - **Measured in the preview pane (800 × 600):** both lakes from 5.6 km 58 fps, the west cove from ~220 m 34 fps, under water 32 fps. Judge it at full screen in real Chrome.
      - **Not yet.**
        - Terrain and photo tiles that sharpen near the camera (T6b).
        - The ice per vertex is every 2 s.
        - Fast-forward at true scale crawls: a coarse block of all 300,000 agents is ~4.8 s whatever its length (T5's cores).
        - Memory: ~1.3 GB in the worker (T4).
    - **Built, T6b part 1 (2026-10-17): the forest in three tiers, and fast-forward at its speed.**
      - **The tiers.** Every tier is one instanced draw per model from compact per-tree numbers (place, height, width, rotation, colour, bark). A tier leaves another's ground to it by collapsing the instances in its hole on the GPU, so nothing is rebuilt as the camera moves.
        - **Near (within 250 m of the camera, re-picked every 30 m it moves):** the real forms.
          - Spruce and fir are narrow spires of ragged, drooping whorls on a trunk.
          - Conifers ≥ 21 m are white pines, with tiers of irregular plumes on limbs above a long trunk.
          - Hardwoods have a trunk forking into limbs under 24 leaf clumps; a sixth of them are white-barked birches, and they go bare in winter.
          - Normals are rounded on the stems and clumps, and the whorls are lit from above.
        - **Mid (1.2 km about where the view looks; the 1/10 world: every tree):** the simple layered cones and lumpy crowns.
        - **Far (the true world):** a cone or blob each.
        - The 1/10 world gets the near tier too.
        - Measured from a boat in the west cove: 63 fps in the 800 × 600 preview.
      - **Fast-forward at its speed.** A true-size block costs ~5 s whatever its length, so a 20-s block at 1 min/s ran 4×. The worker now sizes blocks to the speed × their measured cost, and counts the seconds a long block took in the next tick: 1 min/s runs ~54×.
    - **T6b — terrain and photo tiles that sharpen near the camera** (lidar detail near), and the forest's far look.
    - **T6c — the views at true scale:** the cut-away's sampling, the ice per vertex (630,000 vertices, so less often), the weeds and the bed's animals near the camera only.
- **T7 — The gate.**
  - Geometry checks restated at true size.
  - The ecology checks keep their meaning (per hectare, per fish).
  - The perf checks re-budgeted per rung.
  - The census, recruitment and food-web checks re-run on 3 seeds.
  - **Validation, first season run (2026-10-18; `tools/w3_season.mjs`, 2 shards, May 20 on):** most species held at 0.94–0.99× over two weeks at ~102 kg/ha with no starvation, but the brook's dace fell to 0.39× by day 14. **About 5,400 ripe fallfish**, a tenth of the lakes', packed into the 154-m brook (3 a m²) and ate its dace at ~5 % a day. At 1/10 the same rule put ~30 there; at true size the brook is its real 0.03 % of the lakes while the runners' catchment grew 100×.
  - **Built: the brook's nest sites** (research: `research_notes/Whole lake 3D fish simulation/fallfish_spawning_brook.md`). Each mechanism below was found by tracing the fish that stayed:
    - **The sites** (`spawn.runK`, 150 spawning fallfish in the brook at once, the note's best guess from 5–15 nests of ~20 fish): a runner reaching the brook's MOUTH (`F3.RUN_MOUTH`, 30 m) takes a site if one is free, counted at once (`Fish3.runIn`: admitted ripe runners, wherever they are), or turns back for the season (`a.runYr`) and spawns on its lake's shoals, as Maine's lake fallfish do on gravel margins and in the lakes' other streams. A site frees as its fish spawns. Checked first only once a runner was inside, thousands milled in the brook turning round.
    - **A turned-back fish goes home to spawn:** to its lake's ground nearest its home, not the one by the mouth where it stands (they gathered there, half on the brook's cells); it doesn't spawn on the brook's gravel (as shallow as the shoals'), take the run's long mate reach in it, or follow a mate into it.
    - **Out through the mouth (every species):** a fish leaving the brook for a goal in a lake was aimed straight at the goal from the path's end, which lies inside the brook's mouth; off the brook's line the bank was in the way and it stayed. It now goes first to the lake's GATE, the lake cell beside the brook nearest the path's end.
    - **Spawners hunt less (every species):** a ripe fish's hunting and foraging pulls are halved (`F3.RIPE_HUNT`; spawners keep feeding, at reduced intensity: the note §3 [inf]). The last stayers were hungry ripe fallfish chasing the brook's dace, whose pull (1.55) beat the spawning ground's (1.5).
    - **Result:** the true lakes' brook holds ~440 ripe fallfish 3 h into the run, ~250 by 12 h, draining (the season's start places some; the note's check: a peak ≤ 300–500); the 1/10 brook 23–28 against its 29 sites. Over 7 days from May 20 the dace lost 4 % (23 eaten, 20 of them by fallfish, 1.45 % a week — the note's 0.5–1.5 %; all causes 4–6 % a week in open water), and nothing starved. Gate: "the brook's nest sites" in the spring run.
    - **The chain pickerel** lost 2.9 % in the week (232 to cannibalism, 51 to bass). Researched (`research_notes/Whole lake 3D fish simulation/pickerel_mortality_cannibalism.md`): adult esocids lose ~25–50 % a year (1.0–1.8 % a week in early summer for 20–35-cm fish), cannibalism ≤ ~0.1–0.3 % a week of them, almost all on young-of-year and yearlings; victims reach at most ~0.55 of the cannibal's length (Persson et al. 2006 [sur]), and field piscivores' largest prey 0.32–0.46 (Gaeta et al. 2018).
      - **Built: the longest prey** (`PREY_LR`: pickerel 0.55 of their length, smallmouth 0.45, the rest 0.45), on top of body depth within the gape — which a slim fish satisfies at nearly its eater's length (a pickerel could take one of 93 % of its own).
      - **Every season (2026-10-18, a week each from early August, late September and late January under the ice; seed 611):** every species at 0.97–0.99× except the dace and killifish, up with their recruits; ~103 kg/ha; nothing starved; pickerel 0.970–0.978× in each (their yearlings to bigger pickerel, as below); bass on bass ~100 a week in summer and autumn (yearlings). A whole simulated year (tools/w3_season.mjs 0.22 365, a report each 14 days) is the next check: recruitment against loss.
      - **What the 2.9 % was:** traced (2 days, true lakes): 60 of the 69 pickerel the pickerel ate were under 20 cm — yearlings, 42 % of the pickerel agents — and the bass took only fish under 15 cm. For pickerel ≥ 20 cm, cannibalism is ~0.34 % a week and all losses ~1.3 % a week: inside the research's range. 3 seeds × 7 days with the limit: pickerel 0.970–0.974×, cannibal kills 227–277 a week (yearlings), bass on pickerel 29–39 (was 51); everything else as before (dace 0.96–0.97×, no starvation).
- **T8 — The data and stats page (the human, 2026-10-16: "we need the data and stats and everything page too along with this
  new full size environment").** Like the 2-D app's, for the whole real lakes:
  - **Built, part 1 (2026-10-17): `render3/data3.js`.** A Data button opens the lakes in numbers. While it is open the worker sends them every 2 s (`sendStats`):
    - **Fish:** by species — fish, per ha, FISH_CENSUS.md's census per ha, kg/ha, mean length, mature %, Upper and Lower. Also by size class (< 7.5, 7.5–15, 15–25, 25–35, ≥ 35 cm), deaths by cause, and who eats whom.
    - **Young:** now, schools, mean length; spawnings, hatched, eaten, starved, natural, recruited.
    - **Water & weeds:** per lake — surface and bottom temperature and O₂, algae, zooplankton, ice; the 13 weeds in kg/ha; the mussels.
    - **Brook:** fish in it now; crossed, settled and trips since the lake opened.
    - **Graphs** over the run: fish by species (log), biomass, each lake's temperature and O₂ at the surface and bottom.
    - **Click a fish** (or a school of young) in the view. Its card follows it each snapshot: length, weight, age, sex, maturity, condition, what it is doing, depth over the bed, the water at it, home lake, whether it lives second by second, generation; bars for hunger, fear, energy, ration, its brain's six outputs and its seven genes. The camera can follow it.
    - Checked in the preview on both worlds: on the true lakes 1.23 M fish in 303,806 agents, every species at its census.
  - **Built, part 2a (2026-10-18): the spawning run on the Brook tab** — per species with nest sites (fallfish): the brook's sites, the ripe runners on them now, and the ripe runners turned back to their lakes' shoals this season.
  - **Built, part 2b (2026-10-18): sizes against the census** (Fish tab): each species with a census size split (FISH_CENSUS.md §2) by its own bands — fish ≥ 7.5 cm by number, smallmouth by age — the sim's share beside the census's (`fishside3.CENSUS_SIZE`). At founding (1/10, May 20) it shows: pickerel 60/30/10 % (census 55/30/15) and smallmouth 44/16/12/28 by age (33/17/10/40) close; yellow perch larger than the census (30 % ≥ 15 cm against 15); and three species smaller —
    - **white perch** 68 % < 15 cm, 32 % 15–22, **0 % > 22** (census 35/45/20): the founders are set at 0.72 of the growth curve (S3 `found`, from the earlier calibration "Maine's crowded white perch stay ~25–45 g as adults", HOT_BROOK_3D.md §4), while the census says a fifth exceed 22 cm (~190 g). The two sources disagree — a question for the human (field knowledge) or research before changing either;
    - **white sucker** 66 % < 30 cm (census 45 %), **brown bullhead** 69 % < 20 cm (50 %).
    - **Researched (FISH_CENSUS.md "The size splits revisited"):** the census was off for the bullhead (~70 % < 20 cm: an arithmetic slip) and the sucker (~60 % < 30 cm) — the founders agree; the data page's reference now uses the revised splits. White perch: the census's split and density can't both hold — stunted at ~750/ha (the founders now) or ~55/35/10 % at ~450/ha (evidence leans here, low–moderate confidence); waiting on the human's catches (6–8 in or 9–12 in?).
  - **Built, part 2c (2026-10-18): what a fish senses** on its card — its brain's 26 inputs (food, threat, its school, depth, the bed, the shore, the slope, light, temperature, O₂, energy, hunger, fear, home), from `Fish3.senses` (split out of `_brain`, which calls it; the card calls it with its own buffers, touching nothing: the fingerprint is bit-identical), above the brain's outputs.
  - **Built, part 2d (2026-10-18): the run's history** — the worker keeps the graphs' points whether the page is open or not (`fishside3.histPoint`: the fish by species from the step's counts, biomass, each lake's surface and bottom temperature and O₂), every 30 simulated s at first; past 2,000 points every other is dropped and the spacing doubles, so the whole run since the lake opened stays, coarser as it grows. The page gets them all on opening, then each update's new ones (both worlds, the shards' counts summed).
  - **Next:** the young's numbers against FISH_CENSUS.md's; history across sessions (the graphs fill only while the page is open in this run); the brain's inputs; lineage.
  - the census by species, lake and size class against FISH_CENSUS.md, and the agents (individuals, schools, the young's records);
  - biomass, growth and condition, the young's numbers and fates through the season, recruitment, deaths by cause;
  - the water (temperature, O₂, plankton, clarity, ice) by lake and depth, the weeds and the bed's animals;
  - the brook's traffic (who passes, who stays, the spawning runs), and the lake-to-lake exchange;
  - graphs over time, and click-a-fish (its species, size, age, sex, condition, brain's state, history).
- **Carried over unchanged:** the species, their physiology and brains; the water chemistry; the weeds, littoral fauna, crayfish and mussels; the young-of-year model; everything per hectare or per fish.
- **Better at true scale:** distances, trips, home ranges, the brook's length and the wind's fetch become real. The 1/10 compromises go away: fish crossing a 1/10 lake in a tenth of the time, and the insects falling in per metre of bank × SCALE.

## Order relative to the queue

The queued work carries over unchanged because it is per hectare or per species:
- the new species (fallfish, banded killifish, redbreast) and the census from the nets;
- clearer water;
- frogs and turtles;
- lake levels.

Roads and cabins should be built at true size, so after T1/T6. The order (revised 2026-10-16: the human asked to have "all
the fish we need … accounted for and in before trying to add them to the environment"):
1. the species and the census, and the agent rule (docs/FISH_CENSUS.md) — built on the 1/10 world, per hectare, so it
   carries straight over;
2. T1–T3 (the core of true scale);
3. T4–T7;
4. T8 the data and stats page with the true-scale lakes (built as each piece lands, not after);
5. roads, cabins, docks and the rest.

Revised 2026-10-17 after T3, when the human asked to see it ("can i view this yet?"): **T6 comes next**, with whatever part of T4 the browser's worker needs to hold the true world, then the rest of T4, T5 and T7.

## Risks

- **Browser memory.** A worker's heap near 1–2 GB. Mitigated by T4.
- **Fast-forward speed for evolution.** Years take hours to a day. T5 helps; GPU compute for the brains is a further step.
- **The hand-over between rungs.** A fish switching from blocks to seconds must not jump or teleport: start each near-camera fish from its block position and let its brain take over.
