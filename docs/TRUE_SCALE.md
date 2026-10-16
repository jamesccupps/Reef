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
- **T2 — The water model in real lengths.** `H3.REAL` 1, 50-m columns (25 m near shore if the coves need it). It is calibrated in real lengths already; re-check transport and circulation.
- **T3 — Fish fidelity by distance.**
  - The fish near the camera (~150–250 m) live second by second: 0.1-s steps, brains at 5 Hz.
  - The rest live in coarse blocks (a minute at 1×, up to 30 min in fast-forward), each still deciding with its own brain once a block.
  - Fish switch rung as the camera moves.
  - The per-step bookkeeping that today walks every fish (the neighbour hash, counts, biomass) moves to the block rate or is made incremental.
  - Target: ≤ 15 µs an agent per block.
- **T4 — Memory.** Store the inherited brain compactly (16-bit or 8-bit with a scale). Allocate the learned copy only once a fish has learned something. Target ~1.2 KB an agent (~370 MB).
- **T5 — Several cores.** Split the population across 2–4 workers by water (Upper; Lower + the brook); fish that cross are handed over. Or use shared memory, which needs the COOP/COEP headers in serve.mjs / serve.py; fine on localhost. Target fast-forward ≥ 500×, a simulated year in under ~18 h.
- **T6 — Drawing at true size.**
  - Terrain in tiles that sharpen near the camera (15-m base, lidar detail near).
  - NAIP in tiles: the true-scale photo is 5,170 × 12,920 px, beyond one GPU texture.
  - ~1.2 million true-size trees: full trees near the camera, cut-outs beyond.
  - Fish drawn within ~250 m (the sim knows all 1.6 M).
  - Weeds, crayfish and mussels near the camera, as now.
- **T7 — The gate.**
  - Geometry checks restated at true size.
  - The ecology checks keep their meaning (per hectare, per fish).
  - The perf checks re-budgeted per rung.
  - The census, recruitment and food-web checks re-run on 3 seeds.
- **Carried over unchanged:** the species, their physiology and brains; the water chemistry; the weeds, littoral fauna, crayfish and mussels; the young-of-year model; everything per hectare or per fish.
- **Better at true scale:** distances, trips, home ranges, the brook's length and the wind's fetch become real. The 1/10 compromises go away: fish crossing a 1/10 lake in a tenth of the time, and the insects falling in per metre of bank × SCALE.

## Order relative to the queue

The queued work carries over unchanged because it is per hectare or per species:
- the new species (fallfish, banded killifish, redbreast) and the census from the nets;
- clearer water;
- frogs and turtles;
- lake levels.

Roads and cabins should be built at true size, so after T1/T6. A reasonable order:
1. T1–T3 (the core of true scale);
2. the new species and census (small, carries over);
3. T4–T7;
4. roads, cabins, docks and the rest.

## Risks

- **Browser memory.** A worker's heap near 1–2 GB. Mitigated by T4.
- **Fast-forward speed for evolution.** Years take hours to a day. T5 helps; GPU compute for the brains is a further step.
- **The hand-over between rungs.** A fish switching from blocks to seconds must not jump or teleport: start each near-camera fish from its block position and let its brain take over.
