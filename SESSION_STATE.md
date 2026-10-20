# SESSION_STATE.md — Synapse Reef

Living handoff log. The **NOW** block is the current state, so keep it accurate. The full history is in
`docs/archive/SESSION_LOG_2026-06.md`. Leave the sim runnable and the gate green.

---

## ▶ NOW (2026-10-16) — THE WHOLE LAKES IN 3-D: geometry, water, view, fish, food web, worker, weeds (7a), littoral food (7b), CRAYFISH (7c), branch `zoo-field`

DECIDED (human, 2026-10-15): rebuild the sim as BOTH WHOLE Hot Brook lakes + the brook in 3-D (not the slice in a 3-D
display), at 1/10 horizontal scale with TRUE depths ("it can be scaled down a bit"), a 1-HOUR YEAR. Design:
docs/HOT_BROOK_3D.md (decisions and the scale/time/brains trade-off, the world, the 3-D environment, fish as individuals +
school agents + brainless shoals, super-individual rules, movement, the renderer, a four-season walk-through, the plan);
research: docs/research_notes/Whole lake 3D fish simulation/ (4 notes). Built alongside the 2-D sim in src/w3/ with its own
gate test/w3.mjs (in npm test). DONE: stage 1 geometry (cb0f085) — src/w3/geometry.js + generated src/w3/hotbrook3d.js
(tools/hotbrook/build_world3d.py): Upper 3.75 ha / mean 3.05 / max 5.52 m, Lower 2.79 ha / 2.67 / 3.94, brook 77 m with the
angler's pool; 12 checks. Measured: a lean 3-D agent core runs 3,800 brains at 0.7 µs/agent (10 Hz decisions); three.js r186
draws 20k fish in ~1.3 ms on the human's RTX 3060.
FIRST LIGHT (7197e19): w3.html — the 1/10 world in three.js r186 (vendored, WebGPU), terrain and beds, far land to 250 m,
~19.5k trees, water, sky, free camera + named views (fixed: an inside-out triangle winding hid the terrain and beds).
VIEW REWORK (6cb2cf3, after the human's "trees too much… not the real shoreline… where are the original 3d's controls"):
land drawn at the lakes' 1/10 scale × a land-height slider (water depth true), the real NAIP photo re-cut onto the layout,
the original viewer's views/looks (map, photo, depth chart)/seasons/cut-away/toggles/legend/north arrow, layered trees,
planar reflection of the shore. STAGE 3 DONE: the water in 3-D — d87e7f8 (columns, temperature, ice, transport: wind gyres,
drift, through-flow at 100/55-day residence, mixing, the night siphon, under-ice density current) and f7eaed8 (chem3.js: the
2-D chemistry and plankton per cell, closed budgets; BED_EXCH 0.35 and BURY_MUL 0.15 calibrated to ~75 % P retention).
test/w3.mjs 30 checks pass (~2.5 min). Backup G:\synapse-reef-backups\…_w3-water.zip.
LIVE VIEW (20a0ed5): the w3 view runs the water model live (clock, ice per column, sun by time of day, cut-away coloured by
temperature / O₂ / algae / zooplankton).
STAGE 5 SLICE A — FISH IN 3-D (src/w3/fish3.js + the view src/w3/render3/fish3view.js; docs/HOT_BROOK_3D.md §4 "Built"):
~16,600 fish ≥ 7.5 cm of the 8 Maine species at the design census in ~3,100 agents (white/yellow perch schools ~80,
shiners ~60, the rest individuals), ~120 kg/ha; 26-input recurrent brains (6 outputs, 5 Hz, Baldwinian learning; the turn
high-passed, actions in context); innate habitat drives from the new habitat table (docs/research_notes/Whole lake 3D fish
simulation/habitat3d.md §9 — bottom depth by day/night/winter via the lake's 10-m-smoothed slope, place in the column,
activity, tPref, O₂ escape); dusk/dawn moves at the 30-min sustained speed; feeding on the 3-D fields (chem3: zooFeed/zooE
over the fish's cell ± a layer, takeBenth, takeSedOM, addSedOM, a per-cell sight cache `zv`); piscivory as a kill hazard
(a strike takes one fish from a school); FB4 energetics; hazards; O₂ charged to the fish's cell; schools merge/split.
~12 ms/step (4 µs/agent). test/w3.mjs +12 checks (42 total, ~4 min). The view: every fish an instance (schools as n fish),
interpolated, swimming wave; Fish toggle and size ×1/×4/×12.
KNOWN: fish feed too well (p 0.5–0.97 vs ~0.3–0.6: the water too productive — zooplankton 100–480 µg/L with fish, a ~9-day
algae–zooplankton cycle with O₂ swinging 6–14 mg/L — and the type III response generous) → biomass +20 %/summer month;
piscivores lack young-of-year (slice b) and crayfish (stage 7; crayfish eaters forage the bed meanwhile); no shore predators
yet; dusk moves partial (~15 m a night).
SLICE B (28c05ab + this): reproduction — ripe fish go to their spawning grounds (habitat3d.md: depth bands; suckers up the
brook's riffles; smallmouth back to last year's nest; a few traditional grounds per lake for the pairing species), mates by
a cue scaled to the species' spacing, ONE young-of-year school per spawning (eggs × hatch), nest-guarding males (their brood
held, protected), YOUNG-OF-YEAR schools (world.js _stepFry/_feedFry in 3-D: rotifer/nauplius→Daphnia ladder, limnetic sunfish
fry, the bed past benthL, larval/juvenile mortality with density compensation, scramble starvation, eaten by piscivores in
bouts and as larvae by plankton eaters, merging), RECRUITMENT (school species → a school agent; individuals → agents; ≤ 1.5 ×
census), the BROOK (pumpkinseed within 60 m summer in its pools; routes along its path). The view draws the young near the
camera. test/w3.mjs +7 checks (49).
KNOWN: the PREDATOR PIT (docs/HOT_BROOK_3D.md §4 "Built (slice b)"): adults eat more zooplankton than its spring production →
zoo 3–6 µg/L by August (real 45–100); the zooplankton-eating young starve (pumpkinseed 0.8 cm in Nov). Bed-feeding young grow.
STAGE 6a (this commit; docs/HOT_BROOK_3D.md §4 "Built (stage 6a)"): adult foraging — shared foraging time between the bed and
the open water, a hungry fish goes down to bed food, a fish losing condition strays to feed, and the FORAGING FOOTPRINT (a fish
feeds over a quarter of its home range: one sim second = ~2.4 h of foraging). 3 seeds May→Oct: biomass holds 95–115 kg/ha,
adult starvation halves, summer p 0.25–0.5. test/w3.mjs +2 checks (51). Harness: scratchpad foodweb.mjs <seed> <yf0> <days>
<every> [F3 KEY=value | BLOCK.KEY=value].
STAGE 6b (this commit; docs/HOT_BROOK_3D.md §4 "Built (stage 6b)"): the bed's oxic, temperature-driven P release (CHEM3.REL_OXIC
0.0015; annual P retention 0.64) and the adults' zooplankton half-saturation 60 µg/L (F3.K_ZOO; the 2-D keeps PLANKTON.K_ADULT
25): a June zooplankton peak (190–450 µg/L) with fish taking 31–47 % of its production, a midsummer collapse under a strong
cohort of young (15–28 kg/ha), the young at real autumn sizes for perch/suckers/bullheads. test/w3.mjs 53 checks (~9 min).
WORKER (9d818a1): the 3-D sim runs in a module Worker (src/w3/render3/sim3worker.js; docs/HOT_BROOK_3D.md §6 "Built"): packed
snapshots, interpolation in the view; at most ~5× real time on a fast machine.
STAGE 7a — THE WEEDS (this commit; src/w3/plants3.js, the view src/w3/render3/plants3view.js; docs/HOT_BROOK_3D.md §5 "Built
(stage 7a)"; research docs/research_notes/Whole lake 3D fish simulation/macrophytes.md): five growth forms per bed cell
(shoots + overwintering storage), depth limits emerging from the light, lilies/emergents only in wave-sheltered coves, N/P in
the closed budgets, the zooplankton refuge (chem3 plantRef), stems as fish cover, the canopy's day/night O₂. Plus COLOURED
WATER (CHEM3.KD_COLOUR 0.5: Secchi ~3.2 m) and the catchment's organic subsidy (CHEM3.ALLOCH 800, half an October leaf pulse).
3 seeds × a year with fish: weeds on ~34 % of the bed, canopy to 1.9 m; June zooplankton peak 154–351 µg/L; 103–130 kg/ha;
young pumpkinseed 2.7–2.9 cm (from 1.4–3.7). The view: swaying blade tufts, lily pads, reeds near the camera, the bed tinted
by weed cover beyond; a Weeds toggle. Gate: the winter lake-mean O₂ check lowered 5 → 3 mg/L (coloured water: less light under
the ice; the bed's under-ice O₂ demand 0.11–0.32 g/m²/d matches the measured 0.2–0.39). test/w3.mjs +4 checks.
STAGE 7b — THE LITTORAL'S OWN FOOD (this commit; src/w3/littoral3.js; docs/HOT_BROOK_3D.md §5 "Design/Built (stage 7b)";
research docs/research_notes/Whole lake 3D fish simulation/littoral_invertebrates.md): the weeds' invertebrates in two sizes
(capacity ∝ the plants they live on; eat the organic layer; emerge on a degree-day clock — the spring hatch the main one; the
summer generation overwinters in the bed), soft-water snails, the SURFACE (emerging insects + the land's insects falling in
from forested banks). Fish: "the bed and its weeds" (worms and scuds + weed insects shielded by the stems + snails for
pumpkinseed ≥ 8 cm), surface insects taken as met near the surface; young fish take the small fauna from 1.2 cm and the large
from 2.5. Smallmouth benthL 2.0 (species.js — the 2-D too): their 2.0–2.5-cm feeding hole closed (A/B: 0 → 28–267 recruits).
3 seeds May→Nov: young bass 3.0–4.5 cm by late July, 17–110 recruit; young perch 6.3–6.7 cm; adult perch starvation ~110
(was 300–500); 121–155 kg/ha. test/w3.mjs +6 checks.
OPEN: young pumpkinseed stall at 0.7–1.0 cm through their limnetic phase; young bass survival ~0.3 % (real a few %); weak
autumn zooplankton rebound.
STAGE 7c — CRAYFISH (this commit; littoral3.js; docs/HOT_BROOK_3D.md §5 "Design/Built (stage 7c)"): virile crayfish as adults
+ the year's young per bed cell, by shelter (rocky shallows 25 g/m², weeds ≤ 15, mud 2, deep 0.5); dormant < 5 °C, growing >
10; the young released in early July (15/m²), thinned by cannibalism (~80 % by mid-September), ~1.2 g by then; they eat the
organic layer and snails (the snails keep a refuge on the upper leaves). Fish take the crayfish their gape fits, out by night
(70 %) more than by day (30 %), at their strike success; a gram of crayfish counts ×5 in the food response (CR_PREF: big
meals); big bass and pickerel no longer eat worms. 3 seeds: crayfish 83–85 % of adult smallmouth's food, 65–69 % pickerel's;
bass p 0.46–0.57 in summer; fish ate ~49 % of the crayfish production May–Sept (high vs trout lakes' 2–16 %); adult crayfish
cropped to ~0.37/m² by November. test/w3.mjs +3 (66, ~12 min).
FISH SEEK OXYGENATED WATER (this commit; fish3 _o2Better): a 2-year run lost half its fish to hypoxia in the second late winter
(the water model's lake-mean O₂ falls to ~2–3 mg/L by March, worst columns anoxic — the same with or without plants; a 3-m
column's ~36 g O₂/m² at ice-on vs a measured-range bed demand of 0.2–0.3 g/m²/day × ~120 days of ice). Fish could only flee
up; now, short of O₂, a fish or school also swims ACROSS toward the best-oxygenated column about it (toward the inflows under
the ice). Same 2 years: hypoxia deaths ~5,000 → 7, year-3 May biomass 54 → 108 kg/ha. Crayfish over the 2 years settle at
~0.3–0.46 adults/m², 5–7 g/m² (low end of real). test/w3.mjs +1 (67).
OPEN: young bass survival; bass starvation ~200–500/yr (incl. recruits); whether Hot Brook's late-winter O₂ is really this low
(ask the human).
SEEING INTO THE WATER (this commit; render3/water3.js; docs/HOT_BROOK_3D.md §6): after the human's "you can't really see into
the water to see the fish and even the underwater view is not good" — the bed, weeds and fish are now attenuated per colour by
their water path (tea water: blue most) with the water's own colour filling in, the surface a Fresnel mirror that is nearly
clear looking down, Snell's window from below, caustics on the shallow bed, fish shadows on the bed, underwater fog that follows
the gaze, drifting specks, a fill light; "See into the water" on by default (water 0.3 × as absorbing). A custom scene.fogNode
turned instanced trees black in three r186 — the fog stays a legacy FogExp2. The human: keep "see into the water" on by default.
SCHOOLS SWIM AS FISH (fish3view swimCrew): after "at ×4 they twitch… the schools should still be independent fish" — each drawn
member of a school (and of a school of young) is now a swimmer with its own position/velocity/heading (damped follow of its slot,
≤ 3.5 rad/s turns, faces its motion), not a rigid pattern bolted to the agent.
YOUNG FISH GROUP BY SPECIES (fish3view; the worker's young snapshot gained a guarded flag, YOY_STRIDE 12): perch, white perch,
shiners, suckers SCHOOL; bass and bullhead fry in a tight BALL while a parent guards them; settled sunfish (≥ 1.8 cm), bass and
bullheads past 2.5 cm without a parent, and pickerel SCATTER (each its own slow wander, places not turning with the group).
½× SPEED (w3.html): everything at half speed — fish in slow motion, a day 4 min. The human asked for "a .5 or more realistic
mode, just for viewing" — a slower CALENDAR with real-speed fish would need the per-sim-second ecology (strike hazards, water
transport, foraging per step) rescaled: offered, not built.
▶▶▶ RESUME HERE (2026-10-17): STAGE 7g, THE PLANTS' ROLES, IS DONE (gate green: headless, smoke, ui, serve, w3 81/81;
browser-verified). See HOT_BROOK_3D.md §5 "Built (stage 7g)". Research: Whole lake 3D fish simulation/{spawning_on_plants,
bladderwort_isoetid_chemistry, lily_pad_fauna}.md. The human's 12 photos are in plant_species_hot_brook.md §6: they confirm
bulrush, ribbon-leaved pondweed in the brook and riffle moss; strike nothing; show the dry year (Aug 2025) and a merganser brood.
What it adds:
- Last year's standing stems (plants3 `dead`). The view draws them straw-coloured.
- Bladderworts catch zooplankton (~3–4 % of its production), and their prey's N and P credit holds the stand.
- The rosettes' root O₂ goes into the sand and pays the bed's demand. Their lawns hold the bed's P (ISO_RET).
- Evergreens keep their shoots over winter (seeded at 0.3 of a stand); dormant shoots respire at a third. Rosettes take ¼ of
  the wave scour.
- Pad grazers eat 5 % of the floating leaves' production; their bodies land on the water as surface food.
- Spawning structure per bed cell: rigid / mat / plant, plus the forested shore's wood. Perch choose their place once a season
  and lay there. The pickerel's grounds are re-chosen each spring by the mats, and they spawn on them. Hatch is
  × (bare + (1 − bare) × index).
- THE WEATHER'S OWN RANDOM STREAM (env3 `_wrand`): fish and plant draws no longer shift the weather. Every seed's weather is
  new, so winter O₂ and the year's P kept are judged on a 3-seed median (seed 403 drew the harshest winter of six).
Lessons:
- A "perch spawn a week late" turned out to be the shifted weather, not the mechanism. Before blaming a mechanism, compare the
  temperature curve.
- The test's band must be measured as the fish read it.
TRUE_SCALE T1 DONE (2026-10-17; TRUE_SCALE.md "T1 Built"): the 5-m landscape model and photo shelf (build_model.py HB_CELL/HB_CROP,
shallows.py HB_MODEL), the true-size world src/w3/true/hotbrook3d.js (5 MB; 369 + 274 ha, the brook 154.6 m), geometry.js →
makeGeometry + the HB_WORLD=true switch, H3.COL/REAL from GEO.SCALE; the gate's `true` section (9 checks; w3 90/90).
T2 (the water) DONE (2026-10-17; TRUE_SCALE.md "T2 Built"): HB_WORLD=true W3_ONLY=env,chem,plants passes 36/36 on the true lakes
(SHELTER_R/WOOD_W/LEAF_R in real metres × GEO.SCALE; the gate's columns in real metres, col: 10 * CS; THE BROOK'S OWN COLUMNS —
20-m stretches where columns are > 4× its width, no wind gyre/drift/siphon through them, colAt by the fine cell; the env cost
check takes the best of 3 rounds — the machine swings ±1 ms). The 1/10 gate 90/90.
T3 PART 1 DONE (2026-10-17; TRUE_SCALE.md "T3 Built, part 1"): the fish's landscape distances × GEO.SCALE (1/10 bit-identical),
HOME from the research at true scale, the brook as range at true scale, the mate search's ripe index + pairs kept, spawning grounds
× the lake's area; true lakes: 303,807 agents, a 29-min block 8.2 s (27 µs/agent). The 1/10 gate 90/90.
T3 PART 2 DONE (2026-10-17; TRUE_SCALE.md "T3 Built, part 2"): Fish3.setFocus — near fish second by second, far fish SCHEDULED
(each due FAR_BLOCK 60 s after its last block, staggered) and living that time as a coarse block; the lakes' hash every simulated
second, the focus's own hash every step (REGION_M), the step's per-fish body now `_live`; the worker sets the focus from the
camera on the true lakes at fine speeds (80–250 m). True lakes: a 0.1-s step ~54 ms with ~3,900 near agents (was 114–134). The
1/10 gate 91/91 (+ the fidelity check).
T3 PART 3 DONE (2026-10-17; TRUE_SCALE.md "T3 Built, part 3"): the 1-s stalls were V8 RE-SHAPING all 300,000 fish whenever a
field first took a fraction (fixed: fish3 `SHAPES`, an EXPORTED template — unexported it is collected and the fix silently
vanishes); the senses' scan was memory-bound (fixed: `P`, every fish's x/y/z by index, exact via `_posAt` in each fish's step;
the senses and mate search read it); a block's drive skips the fine swim's work; counts/biomass/region in the hash's pass; THE
YOUNG BY DISTANCE (_stepYoyMixed: near schools each step, the rest in scheduled blocks). True lakes: a July block 7.8 → 4.8 s
(~15 µs/agent through the year), a fine step median 51 → 34 ms with the season's 84,000 young schools, no stalls. The 1/10
world without a focus BIT-IDENTICAL (tools/w3_fingerprint.mjs fingerprints every fish after spring/summer runs — use it for any perf
change). The 1/10 gate 92 checks (the fidelity check + the young and P).
T6a DONE (2026-10-17; TRUE_SCALE.md "Built, T6a"): THE REAL LAKES IN THE BROWSER — w3.html?world=true (the panel links the
two worlds). render3/world3sel.js picks the world in page + worker; the worker says 'loaded' before init (a TLA module worker
LOSES messages sent before its handler exists); start ~15 s (seedSeason's mate scan was ~110 s → an index, same mates). The far
land + 1.5-m photo (1-m NAIP tiles where they cover) in src/w3/true/ (build_world3d.py HB_FAR_M/HB_FAR_CELL/HB_PHOTO_M/HB_PHOTO_HR/
HB_FAR_OUT; default build byte-identical); 860k true-size trees (full within 1.2 km, the rest one instanced draw a kind);
fish drawn = the focus's (camera ≤ 900 m), the focus shrunk to ≤ 6,000 near agents (fish3 nearN) → ~2× real time. A HIDDEN
Browser pane pauses rAF: the page then never ticks the sim — drive ticks by hand from the console to measure.
T6b PART 1 DONE (b9573ec): the forest in three tiers (near real forms within 250 m of the camera — spires, white pines, hardwoods with
birches, bare in winter; mid; far), every tier one instanced draw that collapses its hole on the GPU; fast-forward blocks sized to
speed × their cost (1 min/s ~54× on the true lakes, was 4×). T8 PART 1 DONE: render3/data3.js — the Data panel (census vs target by
species/lake/size, deaths, who eats whom, the young's fates, water per lake, weeds, mussels, brook traffic, graphs) + CLICK-A-FISH
(card with state, doing, water, genes, brain outputs; camera follow); worker sendStats every 2 s while open, sel in each snapshot.
T5 DONE (2026-10-18; TRUE_SCALE.md T5 "Built"): the fish in SHARDS by water (0 Upper + the brook, 1 Lower) — shard3.js ShardSet
(in one thread, deterministic), envshare3.js (the water's 160 arrays on SharedArrayBuffers + 217 scalars per water step),
shardpool3.js + render3/shard3worker.js (workers; the page uses them when crossOriginIsolated — serve.mjs/serve.py now send COOP+COEP
on w3.html, COEP on scripts — and ≥ 4 cores; ?shards=0 off), tools/w3_shard_host.mjs (the same worker on Node worker_threads),
tools/w3_bench_shards.mjs. The threaded pool matches the in-process set BIT FOR BIT (water identical after 12 blocks). True lakes:
359× → 547× real time (2 shards). A crossing fish finishes its step in the cells it started in, then is handed over.
A TRUE-SCALE SEASON RUN is in the background (scratchpad true_season.mjs → true_season_may.txt: May 20 + 30 days, weekly census).
DONE 2026-10-18 (after compacting; render only, committed on its own): NO SQUARES — the human asked "why is everything like all
square?" (the woods' clearings, the weed beds). The weeds were drawn per 50-m water column: now each bed cell blends the four
columns about it at its own depth and grows in clumps (plants3view `blend`, also bed3view's crayfish/snails); the land's NLCD
30-m pixels: now domain-warped (main3 coverAt/SHOWN; the trees' candidates kept by the class their place shows; conifers in
clumps). HOT_BROOK_3D.md "Built — no squares". Checked in the browser (true + 1/10 worlds); start-up unchanged within noise.
THEN (the human: "use the aerial photos for the real clearings"): THE FOREST FROM THE AERIAL PHOTOS — tools/hotbrook/build_canopy3.py
(NAIP 1-m colour + near-infrared tiles about the lakes, the 3.3-m photo beyond) → src/w3/true/canopy3.jpg + canopy3.js: per 4-m
cell tree cover (NDVI ramp), conifer share (logistic on NLCD's surest patches; class means = NLCD's shares), bare ground, trust.
main3 canopyAt: trees, conifers and the ground's clearings/roads follow the photo where trusted (true world only). Verified
against the photo look in the browser (bog, rocky opening, conifer stand, tracks, farm fields line up). HOT_BROOK_3D.md
"Built — the forest from the aerial photos". Open: roads beyond the 1-m tiles; the sim's shore inputs (leaf/insect fall) still read NLCD.
▶▶▶ RESUME HERE (2026-10-19, ~8:30 p.m.): STAGE R ITEM 4 DONE AND COMMITTED (7c26519, backup …_20261019_2028_zoo3.zip) (per-capita algae ON + ZOO3; see the commit after
a312120). Gate: w3 green (the fine fish step's budget made per agent: ≤ 8 µs; measured 7.6–7.9), the env update 11.6 ms after
speed-ups (chem3 _sight, plants3 Q10 table). What it fixed: year 1's zooplankton realistic (clear-water phase, crash, autumn
rebound, copepod winter 10–15 µg/L); year-1 biomass 110 kg/ha (field 50–120). What it did NOT fix: YEAR 2 COLLAPSES — the
second summer's zooplankton 12–20 µg/L (white perch 395k/38 kg/ha, perch 270k, 26 M young perch), pumpkinseed/redbreast/killifish
→ 0, fallfish 1.8, pickerel 2.6 (y613_zoo3_2y.txt).
▶▶▶ RESUME HERE (2026-10-20 ~9 a.m.): ARM D (no hunting share, r4D_613_noact.txt) fed the predators at their maximum — pickerel
91 % fish, bass 85 % (Maine-like!) but pickerel 3.9 → 13.9 kg/ha, bass 10 → 25 by day 112, killifish gone by day 28. FIXED in 8f7047c:
PRED3 act (the share of the time a predator hunts by the sun: pickerel 0.15/0.2/0.02, bass 0.3/0.3/0.1, perch-like 0.3/0.3/0.05;
GPU fields act0-2, SP_REC 152). CPU June month with it: pickerel 0.28 fish/day at p 0.34, bass 0.33 at p 0.39 — realistic — but the
small species still fall hard in June (bass the main killer; the young are below the window until July): the founding's age-1+ prey
~1,540/ha against predators that need ~7,000 fish/ha/yr — the young must carry it from July. RUNNING: queue_r5.sh = ARM D2 (snapshot
r5 :8116 = 8f7047c; B overrides + winter + r5=1) on 613/611/612 × 5 yr → r5D_<seed>.txt, flag queue_r5.done. Compare with r1A/r1B.
▶▶▶ RESUME HERE (2026-10-20 ~7:30 a.m.): THE HUMAN ANSWERED — CRAYFISH NOT COMMON; SCHOOLS OF SMALL FISH IN THE SHALLOWS (memory
hot-brook-field-observations). Committed 0ddd1ef: fish3 stageR5(on) = F3.STRIKE2 1 + crayfish at a fifth of the Michigan capacity
(CR_ROCK 5, CR_WEED 3, CR_MUD 0.4, CR_DEEP 0.1), CR_PREF 1, 15 % out by day; the GPU port (k_strike STRIKE2 branch, species fields
aMax/vHunt/predCls/cs0-2/ppr0, SP_REC 144, the young fed before the strikes); ?r5=1 in year.js and g1_check (kernels agree at yf
0.42). Defaults OFF. QUEUE CHANGED: arm C dropped; queue_r4.sh runs ARM D = arm B overrides + the first winter + r5=1 (snapshot r4
:8115 = 0ddd1ef) on 613/611/612 × 5 yr after the A/B (queue_r1.done) → r4D_<seed>.txt, done flag queue_r4.done. Compare with
r1A/r1B (yrsum.mjs, yrdem.mjs). Small-fish refuge: read the GPU kill tallies by prey depth (T_KILLD) before changing habitats.
Explained the OpenAlex "injection" (an API notice asking AI agents to register a key with the user's email; ignored; optional).
▶▶▶ RESUME HERE (2026-10-20 ~4:45 a.m.): STAGE R ITEM 5 — the encounter–strike–capture rule BUILT on the CPU, OFF (fish3
_strike2, F3.STRIKE2 false; PRED3/CS3/SPINY3; research piscivore_encounter_attack.md). With it on, a summer month (1/10 lakes,
scratchpad probe/diet5.mjs; OLD=1 the old rule): pickerel 0.78 fish/day, ration 0.77, crayfish 6 % (was 50); bass 0.44/day, crayfish
20 % (was 83) — but killifish, dace, pumpkinseed eaten out in the month and pickerel/bass halve: the agents' strike precedes the
young in _feed, so the gut fills on followed fish and the abundant young go untouched. NEXT: the young schools INTO the same
encounter rule (choose ∝ encounters × success over agents and schools), then the GPU k_strike port + g1_check, then 3 seeds × 5
years; crayfish CR_PREF 1 / CR_OUT 0.15,0.6 go with it (restored to 5 / 0.3,0.7 while off). Docs: HOT_BROOK_3D.md §4 "Item 5".
Tried: young-first feeding under STRIKE2 (little change — June's young are below the piscivores' window). The
month test can't show the settling point: port to the GPU and run years; check the small species' shallow refuges (killifish
by day ~0.7 m) and the bass's biomass (10–12 kg/ha vs MDIFW ~2.6 of ≥ 10 in). The A/B queue and arm C still running (queue_r1.sh, queue_r3.sh).
▶▶▶ 2026-10-20 ~2 a.m. — THE A/B SO FAR (scratchpad r1A_613, r1B_613, r1A_611 done; yrsum.mjs / yrdem.mjs summarise): A and B
alike over 5 years: total 95–105 kg/ha (field ✓), summer zooplankton years 2–5 ~20–70 µg/L (copepods 20–60 %), BUT the community
collapses to perch (20–29) + white perch (38 → 44–48; target 15–35) + suckers (16–18): pumpkinseed, redbreast, killifish, dace
EXTINCT; bullhead 7.5 → 1.2; pickerel 4.6 → 0.1–0.5; bass 10.6 → 4–8; fallfish 4 → 0.4. B (adults onto the bed) changes nothing.
WHY (yrdem on A613): pickerel recruit ~0 from year 2 (801, 0, 0, 0, 15) and their adults STARVE (~1,500/yr years 2–3); bass recruit
~50k/yr but their adults starve 14–23k/yr; bullheads recruit 80–113k/yr but starve (adults gone, mean 17 → 8.5 cm). In SUMMER the
predators eat crayfish (bass 65–77 %, pickerel 27–43 %) and the young; adult/juvenile fish only 3–22 %; ration p 0.24–0.44.
Maine (Cooper 1941): pickerel ~95 % fish (55 % white perch), 0.5 % crayfish; smallmouth 80 % fish (61 % white perch), 14 %
crayfish. → STAGE R ITEM 5 IS THE CORE: the predators can't make a living on the perch and white perch (encounter? strike
success? the prey's refuges/schools?), starve, and the unregulated perch + white perch take the bed food from the small benthivores.
PREDATION PIPELINE DIAGNOSED (~3 a.m.; CPU 1/10 lakes, a summer month from yf 0.3, seed 509; scratchpad/probe strike_diag.mjs,
overlap.mjs, strike_period.mjs): pickerel (27 cm, gape 3.6 cm) have a catchable fish in their strike range on 8.8 % of checks;
what they meet is mostly BULLHEADS (71k encounters) and other pickerel; perch/white perch only 1.9k/1.2k and those met are the
20–21-cm adults (4 % / 11 % swallowable). Kills: killifish 214, bullheads 103, fallfish 55, pickerel 29, white perch 17, perch
14. Bass: a candidate on 2.5 % of checks. White perch DO move inshore at night (1.3 m bed, 78 % ≤ 1.5 m; day 3.2 m) — the habitat
switch follows the sun (nf from sun 0.3 → 0.02, so they arrive about dark), but catchable perch/white perch in range stay scarce
in every period (pickerel kills per 1,000 checks: dawn 4.9, day 3.2, dusk 3.9, night 0.9; night sight ×0.38). Pickerel's TOTAL
intake ~1.3–1.8 %/day ≈ a real pickerel's; the MIX is wrong: summer crayfish 27–43 %, young-of-year 26–50 %, other fish ~20 %
(Cooper: ~95 % fish, 0.5 % crayfish). Bass 65–77 % crayfish (Cooper 14 %). → Item 5 turns on the CRAYFISH (too many or too
easy in the sim, or Hot Brook really has many — ASK THE HUMAN) and on encounters with the 6–15-cm perch/white perch (the ATTACK
constant is the 1-hour year's compat value: 2/8760 per s ⇒ ~73 min to strike a weight-1 prey in range — re-derive in real time).
ALSO DONE (~10:30 p.m.): STAGE R ITEM 1 COMMITTED (8a9f9b0) — the first winter: config WINTER0 (Shuter's ramp per species,
208-day window from the season's curve, (p1 − p0)/(1 − p0) a step in place of the young's starvation, only for fish alive when the
winter began), fish3 _hazards/_yoyLive + GPU wHaz in k_hazards/y_mort; new gate check (young, 27/27); g1_check at yf 0.9 agrees.
QUEUE 2 (scratchpad/queue_r3.sh, waits for queue_r1.done): arm C = arm B's diet overrides + the first winter (snapshot r3 :8114 =
8a9f9b0) on seeds 613, 611, 612 × 5 years → r3C_<seed>.txt; done when queue_r3.done appears.
EARLY SIGNAL (r1B_613, years 2–3): B alone doesn't save the small species — white perch 42–45 kg/ha (A-like run 38), pumpkinseed,
redbreast, killifish, dace → ~0, pickerel 1.9 → 1.0, total ~101 kg/ha; the second summer's zooplankton ~30 µg/L (was 12–20).
Judge on all seeds. Suspects for the small species: their young's food (item 2), predation on them, habitat.
RUNNING (launched ~9:10 p.m., SERIALLY — parallel runner windows starve each other on this machine: only the foreground one
advances): queue scratchpad/queue_r1.sh → r1B_613 (going), then r1A_613, r1A_611, r1B_611, r1A_612, r1B_612 (each 5 years, ~75 min;
snapshot snap_r1 :8112 = commit 7c26519; arm B's query in armB_query.txt; done when scratchpad/queue_r1.done appears). The research
for item 1 is in (`Real lake ecology for calibration/first_winter_mortality.md`: Shuter's ramp per species — bass 48–92 mm at WD
208, perch ~50–80, white perch Johnson & Evans' PMORT(WD, FL), pumpkinseed ~25–42; daily hazard Δp/(1−p); switch off double-
counted starvation in winter); blocked rows A06/A07/A10/B04/C43 annotated.
PLAN (was): GPU A/B, seeds 611/612/613 × 5 years: A = committed; B = + adults of the six
`diet.plankton` species onto the bed past a switch size, via year.js overrides (no code change yet):
  s3.<k>.plank=0 & s3.<k>.sp.diet.plankton=0 & s3.<k>.sp.Lzoo=X — whiteperch 10, sunfish 5, redbreast 5, fallfish 10,
  killifish 3.5, dace 3 (white perch: Feiner 2011 <12 cm ~90 % bed by IRI, Zuerlein, Cooper; pumpkinseed: shift at 40–50 mm SL
  — forage_fish_early_life.md; fallfish ~10 cm). If B helps, make it real in species3.js as 3-D overrides (species.js is shared
  with the 2-D). Then stage R item 1 (young keep their schools through the first winter + Shuter/Dudley loss for bass) and
  item 5 (predator diets). Under-ice light (snow) is stage D: it moves the winter O₂.
Answered the human: what the plants do in winter (plants3: storage from ~Sep 10 at 7 %/day — pondweeds keep 30 %, lilies 75 %,
emergents 50 %; standing dead stems; evergreens — rosettes, Nitella, moss, Robbins' — stay green; ice scour < 0.5 m; spring sprout
≤ 10 %/day from each species' start temperature; the 40 %-light ice is the known flaw).

▶▶▶ (2026-10-19, evening): STAGE R ITEM 4 CONTINUED — per-capita algae COMMITTED (a312120, switch
off) and now ON in the working tree (config PHYTO.PER_CAPITA true); w3 gate with it on: 98/100, the 2 fails are the perf probes at
their edge (env update 13.0 vs < 12 ms at 1/10; fish 0.1-s step 25.2 vs ≤ 25 — the last clean gate had 11.9 / 24.7: contention;
re-run on a quiet machine). GPU year seed 613 with per-capita algae (scratchpad y613_pc1.txt): total 110 kg/ha at day 365 (old
155; field 50–120 ✓), white perch 39 (63), perch 24 (37), pickerel 4.5, sucker 18.6, but pumpkinseed 0.5, fallfish 3.9,
killifish 0.06× (the small zooplanktivores — stage R item 2). Zooplankton 85–380 µg/L May–July, then 20 Aug–Sep, 1–5 Oct–winter;
copepods still excluded (49 → 1).
NOW BUILDING: the 3-D ZOOPLANKTON (config ZOO3 — the 2-D keeps PLANKTON's; chem3 + fish3 + GPU layout/wgsl read it) from the
research note `Real lake ecology for calibration/copepod_daphnia_coexistence.md` (agent, 2026-10-19): copepods G 0.27, R 0.04,
M 0.012, K 0.15 (threshold ~1.06× Daphnia's, was 1.8×); losses' Q10 3.0 (Daphnia) / 3.5 (copepods) instead of 2.0; COPE_ESCAPE
0.65; autumn dormancy ~30 % (DORM_D 0.005, DORM_C 0.006; copepodites keep 85 % of mass); Daphnia ephippia hatch ~1 %/yr
(HATCH_D 0.0002), copepodites at bed ≥ 10 °C (HATCH_C 0.03). RUNNING: fish-free CPU year probe/z_zoo3.txt; GPU 2 years seed 613
(snapshot snap_zoo3 :8111 → y613_zoo3_2y.txt). Targets: summer copepods 50–65 % of crustaceans, under ice 20–40 % of summer,
≥ 70 % copepods; Daphnia spring peak then decline; summer total 50–150 µg/L.
Also read the human's 2nd batch (A17 Begley/Coghlan/Zydlewski 2018 Maine suckers; C29 Zuerlein 1981 Nebraska white perch; C34
Feiner 2011 thesis) → fetched_sources_read_by_me.md "second batch". Weather spells too long (clear mean 14 d, max 57) — a to-do.

▶▶▶ (2026-10-19, night): STAGE R ITEM 4, THE YEAR-1 ZOOPLANKTON — ROOT CAUSE FOUND.
Probes (scratchpad/probe/: water_only.mjs, npp.mjs, alg.mjs — the 3-D water alone, HB_WORLD=true, no fish):
- Fish-free, Daphnia go 40 → 900 µg/L in 3 weeks of May and HOLD 900–1,500 all summer on algae grazed to 0.013 units; copepods
  are driven extinct (61 → 1), rotifers 0; under ice everything falls to 1–5 µg/L (DORM sends the actives to eggs; field keeps
  ~25 % of summer density, copepods carrying); the egg bank grows 16 → 97 and hatches 0.5 %/day (field ~1 %/YEAR, Cáceres 1998).
- THE FREE LUNCH: the algae's growth is ZERO-ORDER (chem3 _algae: g = GROW·pl·nLim·(1 − b), no ×b). Grazed to 0.013 they still
  grow 381 vs 425 unit·L/m²/d ungrazed (10 turnovers/day), while their O₂ (∝ b) says NPP fell 662 → 37 mg C/m²/d. Zooplankton
  production (0.34–0.67 g DW/m²/d ≈ 160–320 mg C) EXCEEDED the algae's O₂-NPP — impossible. Field crustacean production is
  ~5–25 g DW/m²/yr; the sim's capacity is ~60–100 → it overfeeds the planktivores (year-1 fish 101 → 171 kg/ha).
- At normal density (day 14, b ≈ 0.24) the O₂ gives 1 algae unit ≈ 1.57 mg C/L and turnover ~0.75/day — realistic; only the
  low-density behaviour is wrong. FIX UNDER TEST: PER-CAPITA algae (config PHYTO.PER_CAPITA/GROW_PC/INOC/DARK_DECAY, DIATOM.GROW_PC;
  chem3 uses them when PER_CAPITA — the cyanobacteria's form), calibrated on a zooplankton-free probe to keep the ungrazed
  seasonal algae/NPP/Secchi/O₂, then grazers back on (expect the PEG pattern: clear-water phase → crash → fish-held summer).
  Also added chem3 `algProd` (diagnostic tally). THEN: winter (actives ~25 %, copepods carry; ephippia hatch ~1 %/yr in spring),
  copepods' coexistence, then fish years (≥ 3 seeds × ≥ 5 years). Targets: summer crustaceans 50–150 µg/L (Maine Aug ≈ 90),
  production 5–25 g DW/m²/yr, NPP mesotrophic ~200–800 mg C/m²/d, chl 3–8 µg/L, Secchi 2.5–4 m.

▶▶▶ RESUME HERE (2026-10-19, latest): ALL 12 FETCHED FILES READ — the agent's digest (docs/research_notes/fetched_sources_digest.md,
big scans) + mine (fetched_sources_read_by_me.md, its headline tables re-checked in the rendered scans). STAGE R's TARGETS MOVED
(docs/FINDINGS.md top entry; HOT_BROOK_3D.md §4 "Design (stage R)" + "From the fetched sources"):
- WHOLE-LAKE FISH ≈ 50–120 kg/ha (Rupp & DeRoche 1965, the only Maine counts: 44.5 / 70.1 / 117.1; EPA MEI ~75) — the sim
  reaches 140–165 in year 1, white perch alone 55–63. Pickerel 4–8 kg/ha in Maine (sim 4.3–4.6 ✓, falls later), sucker 24–38
  (sim 21–22), pumpkinseed can reach ~15 (sim ~1).
- PREDATOR DIETS (Cooper 1941, summer, white-perch lakes): pickerel ~95 % fish (white perch 55 %), crayfish 0.5 %; smallmouth
  80 % fish (white perch 61 %), crayfish 14 % — the sim's crayfish shares (34–36 % / 63–64 %) are Maine-wrong (crayfish
  "generally rare in Maine" in 1941; Hot Brook's crayfish unknown — maybe ASK THE HUMAN: crayfish common at Hot Brook?).
- WHITE PERCH: adult mortality rises with age (A ≈ 0.15–0.3 at 5–9, ≈ 0.5 from 9) — NOT a flat 0.45–0.55; adults eat bed
  animals (only ~6 % plankton) → `Lzoo` 40 too planktivorous; density regulates by stunting + the young's first winter.
- YOUNG BASS FIRST WINTER: Shuter/Dudley equations (WD 208 = the sim's; C_max 92 mm, C_min 48 mm) — ready to build.
- ZOOPLANKTON: Cooper's August ≈ 31 crustaceans/L ≈ 90 µg/L; Oneida: age-0 perch > 14,000/ha in August remove Daphnia.
- P3 single years 613/611 landed: 155/140 kg/ha, zooplankton 23/13–17 µg/L at day 365 (HOT_BROOK_3D.md Stage P3 paragraph).
- TELL THE HUMAN: noaa_2897_DS1.pdf is the wrong file (summer flounder); yellowperch.pdf is the commercial permit form, not the
  plan; still wanted — Warner 1973 pp. 150–151 (A01), Johnson & Evans 1990/1991 (A06/A07, white perch first winter), the
  pumpkinseed overwinter paper NAJFM 17:581 (B04), Lakes of Maine pages (A02, a bot check — the human must fetch), and new leads
  Fuller & Cooper 1946, Barr 1962 (Maine pickerel food), Jordan 1988 (age-0 smallmouth growth, nine eastern Maine lakes).
- NEXT: stage R build — (1) the young's first winter (bass by Shuter; others by threshold pending sources), (2) the larvae's
  own food, (3) white perch adults onto the bed (Lzoo), age-rising M, (4) the year-1 zooplankton excess (seeding vs production),
  (5) predator diets toward fish (crayfish exposure/encounter), judged ≥ 3 seeds × ≥ 5 years against the totals above.

▶▶▶ ADDED (2026-10-19, late night): THE HUMAN FETCHED 12 SOURCES into docs/research_notes/fetched/ (gitignored: large scans, some
copyrighted): the MDIFW survey sheets for UPPER and LOWER Hot Brook Lake, the MDIFW white perch / yellow perch / black bass plans,
Cooper 1941 (Fish Survey Report No. 4, a 176-MB scan), the Bass Technical Work Group 2019, USGS SIR 2014-5164, a NOAA report,
2491-36-10.pdf, a lakes-and-reservoirs fisheries text, and page 1 of Warner 1973 (pickerel spring food, a GIF). A background agent
is writing docs/research_notes/fetched_sources_digest.md (and marking the rows of blocked_sources_to_fetch.md) — READ IT FIRST and
fold it into stage R (white perch mortality, growth; the lakes' own survey facts). More fetches to come from the human.
  READ BY ME (the human asked me to read everything myself and keep this current): (1) the MDIFW SHEETS (surveyed Aug 1949, rev.
  1965/2004): Upper 912 acres (369 ha), max 18 ft; Lower 713 acres (289 ha), max 13 ft; both 74 °F surface / 71 °F bottom in August
  (no stratification); species = the sim's eleven; shores mostly rocky with sand and mud, beds mostly muddy, a large sandy beach in
  Upper's NE, wetlands (Upper S/W, Lower N/E), spruce–fir; the brook 1/8 mile, "rocky and hard bottomed", non-navigable (paddle/pole/
  walk), the only way into Lower; flow Upper's N outlet → Lower's S inlet → Lower's N outlet → Baskahegan Stream (the sim's geometry
  matches — built from these soundings); "excellent spawning and adult habitat for bass, perch, and pickerel"; principal fisheries
  smallmouth, white perch, pickerel; bass managed for larger-than-average size; 25-fish white perch bag; no camps on Lower.
  (2) WARNER 1973 page 149 only (the GIF): Kendall Warner, MDIFG Bangor; Maine lakes, spring, ~1 month from ice-out, with the stocked-
  salmonid predation study (Warner et al. 1968); cites Maine pickerel food studies Cooper 1941, Fuller & Cooper 1946, Barr 1962 —
  the RESULTS are on pp. 150–151: ask the human for those two pages.
  (3) NOW ALL THE SMALL ONES READ — committed record docs/research_notes/fetched_sources_read_by_me.md (the fetched folder is
  gitignored). Headlines for stage R: WHITE PERCH PLAN (A04) — avg life 5–7 yr (A ≈ 0.45–0.55 ✓), ~4 yr old at 8–10 in (20–25 cm)
  in typical Maine water, density regulates by STUNTING (a 6-yr-old at 4 in) not by killing the young, year-class failures only
  from spawning weather, big white perch cannibals, heavy spring spawning runs up streams (a brook to-do). BLACK BASS PLAN (A11)
  — the smallmouth's Maine limit IS first-year size vs a ~200-day no-feeding winter (< 50 °F), "direct relationship between size
  and overwinter survival"; YOY 56–74 mm by autumn; cool summers (1986/92/96) cut cohorts; ≥ 10-in bass objective 2.6 kg/ha.
  USGS SIR 2014-5164 (A15, Spednic, ~30 km E): the Shuter 1980 equations, ready to use — WD = days < 10 °C (208 ± 4, = the
  sim's), C_max = 0.3375·WD + 22.1 mm (92), C_min = 0.1938·WD + 7.9 mm (48), winter mortality = (C_max − L)/(C_max − C_min);
  nest loss by T_min; daily growth 0.12·T − 1.7 mm (14.2–25.5 °C); measured YOY 70–76 mm → ~40 % first-winter loss. EPA 1993
  lakes-and-reservoirs text: age-0 yellow perch > ~14,000/ha in August wipe out Daphnia pulex (Oneida); after ~18 mm predation
  controls them; critical planktivore biomass 20–1,000 kg/ha (lowest for age-0 perch); zooplankton refuges (DVM, weeds) and
  small fish hiding in the littoral under predation keep the field's zooplankton moderate — CHECK the sim's age-0 per ha, the
  zooplankton's refuge, the piscivore share (30–40 % controls planktivores). The yellow perch "plan" is only a commercial-permit
  form (Hot Brook NOT on the commercial perch list — perch not overabundant ✓); the Bass TWG slides: harvest 2.6 % / 10.3 %.
  noaa_2897_DS1.pdf is the WRONG FILE (a summer flounder synthesis) — tell the human. The agent digests the big scans: Cooper 1941
  (A05) and 2491-36-10.pdf = Rupp & DeRoche 1965 (A14), THE ONLY MAINE WHOLE-LAKE STANDING CROP (kg/ha) — stage R's targets.

▶▶▶ ADDED (2026-10-19, night): RESEARCH "Fish in streams connecting lakes" (the human asked: do other stream-connected lakes have
this ecosystem?) — report docs/reports/Fish in streams connecting lakes.md (notes in research_notes/Fish in streams connecting
lakes/, 4 notes). Headlines: lake-to-lake movement is RARE (Adirondack chain: 0.9 % of recaptures changed lakes over ~2 yr, mostly
suckers) → the sim's MOVE3 settle rates (perch/white perch 15 %, sunfish/killifish 10 %/yr) ~10× too high (suggest 1–5 %, killifish
~0–1 %); the pickerel's ice-out trip has no chain-pickerel evidence → summer excursions; smallmouth: some nest in streams and stay
all summer, sub-adults < 350 mm stay, adults leave < 15.6 °C; predators DO gather at outlet pools when prey funnel through (pulses
of young after rain); dace persist by avoiding predator-held patches and riffles big fish don't hunt; the brook = Upper's surface
water (no cool refuge); dry year: the outlet stops at a sill. Its §recommendations are a ranked brook to-do (with stage R).
The human will FETCH BLOCKED SOURCES: docs/research_notes/blocked_sources_to_fetch.md (170 rows ranked; top: Warner 1973 Maine
pickerel food, MDIFW white perch plan + Hot Brook survey sheets, Cooper 1941, Johnson & Evans 1990/1991) → into
docs/research_notes/fetched/. A research agent saw an injected instruction in OpenAlex API responses (asking AI agents to request
an API key with the user's email) — ignored; an OpenAlex key is the human's choice.

▶▶▶ RESUME HERE (2026-10-19, evening): STAGE P3 + THE MULTI-YEAR FINDING COMMITTED — NEXT: STAGE R, THE PLANKTIVORES' REGULATION.
- P3 (in): a predator strikes at full effect only over water ≥ F3.SHALLOW_K (0.02 m/cm) × its length (the followed fish's prey-side
  SHALLOW_REFUGE retired; the young's kept); gate +1 (a 35-cm pickerel takes no killifish over 0.2 m, does over 1.5 m). GPU tallies
  of kills by the prey's bed depth and cover (T_KILLD/T_KILLC); year.js prints each lake's zooplankton. July: killifish kills −5 %
  only — the sim's pickerel average 25 cm then, and small pickerel do take killifish (Guillory). P4 (the small pickerel on the
  flats) tried and dropped: cannibalism −22 % but killifish kills +33 %.
- THE FINDING (docs/FINDINGS.md, HOT_BROOK_3D.md §4): the first 3-YEAR runs collapse in years 2–3 under stage P AND under the
  committed Y1 (y612_p3_3yr, y612_y1_3yr): pumpkinseed, redbreast, killifish → ~0, fallfish down, then the pickerel; perch/white
  perch/suckers hold. Year 1's zooplankton 500–970 µg/L (field ~60–100) grows the fish ~100 → ~165 kg/ha; from year 2 it never
  recovers (2–40 µg/L); late spawners' young stall at 1–2 cm. The census cap was the white perch's only regulator.
- NEXT — STAGE R (design in HOT_BROOK_3D.md §4 "Design (stage R, next)"; research `Whole lake 3D fish simulation/
  white_perch_regulation.md` §7 — written without web search, the budget spent; its §8 lists what to fetch): (1) the young
  overwinter as schools and recruit next spring, with size-dependent first-winter mortality (Johnson & Evans 1990); (2) the
  larvae's own food (rotifers/nauplii; the weeds' microcrustaceans for young sunfish; white perch benthL ~4 cm); (3) white perch
  adult A 0.45–0.55 (maxAge 10, the unsimulated share not halved); (4) why year 1's zooplankton is 10× the field's. Judge on
  ≥ 3 seeds × ≥ 5 years; targets: white perch 15–35 kg/ha, pumpkinseed 0.05–0.3× white perch adults, perch small and fewer than
  fallfish and bass (the human), fallfish plentiful.
- Results still landing (scratchpad): y612_y1_3yr (year 3), then y613_p3 / y611_p3 (P3, a year; snap_p3 :8104). Snapshot servers
  (node serve.mjs in snap_*/) on :8102–8105 can be stopped when done.
- THE HUMAN (2026-10-19, asked about the dace): "schools of either dace or fallfish swim between the lakes through the stream, you
  can see them, at least during the summer" (they had wondered whether dace and fallfish are the same fish — they're not; young
  fallfish are dace-sized and striped). Lake-to-lake schools fit YOUNG FALLFISH (dace are stream residents in loose aggregations)
  → with stage R's young: young fallfish groups using the brook as a summer corridor between the lakes (count crossings by size:
  fish3 stats.cross); the dace's status stays open (a rare resident? the closed brook loses them to the lakes' passing predators).
  And WHO IS IN THE BROOK IN SUMMER (the human): RESIDENT — sunfish (the sim: pumpkinseed 30 % / redbreast 50 % of those near the
  brook summer in its pools ✓) and sometimes SMALLER BASS (not modelled); PASSING — schools of fallfish (the sim: only the spring
  spawning run) and sometimes LARGER BASS, especially in the deep pool at the Upper end, "probably waiting for all the schools of
  small minnows that swim through" (an ambush point at the corridor's mouth — emergent if the schools pass and bass follow prey);
  no resident dace mentioned. And "the pike [pickerel] swim through too and seem to hang out in there" — pickerel regulars in the
  brook's pools and weedy runs (the sim: at true scale the brook is their range, the bigger-deeper rule holds them in its pools ✓;
  they took ~550 of the brook's dace a year — consistent with dace being rare there). THE HUMAN THEN QUALIFIED: the passing schools
  "may be schools of dace going through too, not sure", and "not sure if the bass actually stay there or if they just use the water
  to spawn" → both OPEN: research smallmouth use of lake-connecting streams (summer residence vs a spawning run; Maine/northern
  lakes) and whether blacknose dace travel lake to lake in schools, before building either. To build with stage R's young: small bass summering in the brook's pools; young fallfish schools
  travelling lake to lake through it; check that big bass gather at the upper pool when the schools run.

▶▶▶ RESUME HERE (2026-10-19, afternoon): STAGE P — WHERE THE PREY ARE AND WHAT THE PREDATORS TAKE — COMMITTED AS A CHECKPOINT
(docs/HOT_BROOK_3D.md §4 "Design/Results (stage P1)", "Design/Built (stage P2)"; research `Whole lake 3D fish simulation/
predator_diets_and_prey_mortality.md` — the field targets in its §7; docs/FINDINGS.md; docs/GPU_SIM.md "G3 — round 5").
- In: the bullhead buried in winter (S3 `bury`); perch by size (S3 `habJ`: to 15 cm over 1.5–4 m by day, offshore by 22; winter
  1.5–3.5 m — dishpan lakes' perch at first ice in the weeds); white perch juveniles 2.4–3.6 m; F3.SIZE_K 2 (1 − (depth/gape)²);
  pickerel schoolExp 0.65; killifish day band 0.1–0.6 m; bigger-deeper in the brook (fish ≥ 10 cm hold its pools); GPU strike
  encounter tallies (T_STRM/G/W, NTALLY 4096; year.js "X's strikes met"), year.js ?f3./?s3./?yby=/?kby= and the year's diet by mass.
- Results (3 seeds, a year, vs Y1): perch eaten ~3k → 72–79k (~20 %/yr, field 15–35); pickerel 61–63 % fish / 34–36 % crayfish
  (field 65–85 / 10–30), 5.2–5.5 kg/ha (field 2–6); BUT killifish 0.13–0.14×, fallfish ~0.5×, sunfish 0.6–0.8 kg/ha, redbreast ~0.9,
  bullhead ~0.7× — the perch feed the pickerel, which take the littoral's small fish (apparent competition). Dace still die (the lakes'
  predators passing through the brook; a closed brook may be the wrong model — ASK the human whether Hot Brook's dace live above and
  below the lakes too). Pickerel cannibalism 8.6k/yr (most of their 10–30-cm fish).
- RUNNING: a 3-year run, seed 612 (scratchpad y612_p2c_3yr.txt, snapshot snap_p2c on :8103): do the small species settle or fall?
- NEXT: the small pickerel's refuge (small esocids in dense weeds, the large on structure — Grimm 1981, Skov & Koed 2004); the
  killifish's very-shallow refuge (fish predators can't work water < 20 cm — Power 1987; today SHALLOW_REFUGE ≤ 0.6 for all sizes);
  then the census cap and the 3-year balance. Gate: w3 97/99 under load (the two timing checks pass idle: env 11.9 ms, fish step 22 ms).
- Tools (scratchpad): diag_strike.mjs, where.mjs (HB_WORLD=true), snap.sh + REEF_PORT, peek.mjs, closecdp.mjs.

▶▶▶ RESUME HERE (2026-10-19, morning): STAGE Y1 — PREDATION ON THE YOUNG BY DENSITY — COMMITTED (03a0497, pushed, backup
..._density_predation.zip). Both engines: a prey table per column × species × length class, Holling II requests (clearance
400·L^0.6 L/d, gut-limited), order-free settlement (followed fish first, young schools from the rest); FRY.DENSITY 0 = the old
rule; the 3-D sim's own background M_LARVA3 0.04 / M_JUV3 0.015 (2-D keeps 0.08 / 0.035), LARV_A 0.1. Three seeds, a year: pickerel
recruits ~1,770 (175–257 old), biomass 3.4 kg/ha (start 3.2); bass 11.0 kg/ha (9.1); perch/white perch biomass up; BULLHEAD 0.66×
and KILLIFISH 0.31× by count (old 0.83 / 0.46) — NEXT: why (who eats their young and adults; killifish ~79k adults/yr to pickerel),
the young pickerel's juvenile predation by perch (35–38 %/fortnight at 3–6 cm, ~3× the target), the census cap (78 % of the young
perch reaching 8 cm discarded), the env-update timing check (12.4 ms vs 12 — re-run idle once the old CPU reference year
`tools/w3_season.mjs` (scratchpad true_year.txt) finishes). year.js takes ?fry.KEY=v; year_cdp.mjs runs any tools/gpu page.

▶▶▶ RESUME HERE (2026-10-19, ~1 a.m.): STAGE 7h REALISTIC PLANTS COMMITTED (16b5257, pushed, backup ..._0056_realistic_beds.zip).
Gate: w3 96/97 + headless + smoke — the env-update timing check reads 12.3–12.6 ms vs its 12-ms budget while the OLD CPU reference
year (tools/w3_season.mjs, pid ~25180, scratchpad true_year.txt, day ~250, ~8 h left) holds a core; HEAD before read 12.2 ms the same
— RE-RUN `W3_ONLY=env node test/w3.mjs` once that run ends (if still > 12 idle, profile plants3 _grow). Also since: a fish has the
weeds' cover only IN them (fish3 _inWeeds / wgsl inWeeds); yCover re-tested on realistic beds — worse (2 recruits) → off; with
realistic beds the young pickerel recruit 247–344 (the lawn had propped them up — docs/FINDINGS.md). NEXT: the density-based
predation slice (below). The block below is the stage-7h work in detail:
- plants3: per-form maintenance (`resp`: rosettes 0.007, Nitella/moss 0.010), losses calibrated at the light limit UNDER THE LAKES'
  NUTRIENTS (PL3.NUT_REF 0.85) AND OVER A YEAR (r_lim = ln(1/(carry·WINTER_KEEP))/SEASON_D), WAVES BY FETCH (env3 `fetch`, plants3
  `zWave` — CEM storm waves, U_CRIT 0.1 m/s: 0.7–1.2 m in these lakes; WAVE_M 0.10/day above it, rosettes ×0.02, lilies/emergents
  ×0.15), ice scour spares the rosettes, COVER BY STAND (plants3 `cov`/`reachB` per bed cell, `covC` per column; littoral3 reach and
  crayfish use them; GPU water sections pCov/pReach replace stems). Spin-ups (scratchpad plants_spin.mjs; true lakes, no fish):
  stands incl. the Nitella meadow 52 → 46 → 42 % of the bed (yrs 2–4, converging), canopy 0–0.5 m ~2 %, 0.5–1 m 63 %, 1–2 m
  68–78 %, 2–3 m 27 % → ~20 % (a logistic equilibrium: the deep stands grow above their annual break-even, room-limited), 3–4 m 2 %.
- RUNNING: both worlds' generated starts (5 years each: scratchpad build_tenth.txt / build_true.txt → src/w3/plants3init.js,
  src/w3/true/plants3init.js). THEN: W3_ONLY=plants (the second-summer checks from the bare seeding will need their bands re-set to
  the new model — vegetated was 52 % vs 25–50 %; insect emergence 0.45 vs ≥ 0.5 g/m² of vegetated littoral, more vegetated area), the
  new stage-7h check (generated start, stands 15–50 % by July, the wave zone bare of canopy), the full w3 gate, doc_7h.md (scratchpad)
  into HOT_BROOK_3D.md §5 with the results table, FINDINGS, commit + push + backup.
- The human (2026-10-18): a RESEARCH PAPER at the end — ROADMAP item 9 + "📄 The paper"; the findings log docs/FINDINGS.md (new).
- NEXT SLICE: density-based predation on the young (research: young_piscivore_functional_response.md §5) — per-column × species ×
  size-class prey tables, Holling II (clearance 400·L^0.6 L/d, gut-limited handling), deaths shared by bin (order-free); replaces
  the 0.6-m nearest-school rule for young schools AND followed fish eating young; then cut FRY.M_JUV/M_LARVA's share that stood for
  unsimulated predators (double counting); calibrate vs field Z (bluegill fry 0.11–0.39/d after dispersal, perch larvae ~0.04/d,
  Aug–Oct YOY 0.008–0.06/d; young-piscivore rations 10–25 %/d); ≥ 3 seeds on the GPU year.

▶▶▶ RESUME HERE (2026-10-18 evening, after a /compact): REALISTIC PLANTS — the human: "well make it realistic, the plants should be
realistic" (after the young pickerel's cover A/B failed). UNCOMMITTED WORK IN THE TREE (gate not yet run on it):
- fish3/GPU: S3.pike.yCover (young weigh a spot's food by its cover; OFF — A/B seed 612: 1,799 recruits vs 2,657 without), BIO.pike
  yLpisc 5 (young schools eat fish from 5 cm — pickerel_young_of_year.md; +4 % recruits only: young-on-young encounters need a
  prey school within YOY_EAT_R 0.6 m — a super-individual artifact, TODO density-based "footprint" predation for young schools);
  GPU tallies T_YCAP (young discarded at the census cap — fish3 stats.fry.capped; bass lose ~700k of 1.1M at recruitment there),
  T_KILLSZ/T_KILLPZ (kills by prey length, by prey and predator); year.js ?ycover= ?ylpisc=, "young pike/bass eaten by" lines;
  year_cdp.mjs a profile per port (two runs side by side: the second window gets most of the GPU, +30 % throughput).
- PLANTS: the runs all started from Plants3.seed()'s UNIFORM LAWN (every species at 15 % of its stand in every cell of its range):
  first summer 96–100 % of the bed "vegetated", every species declining from June (an artifact). The model's own beds after 2–3
  years (scratchpad plants_spin.mjs, true lakes, no fish): stands on 26/24 % (yr 2) → 20/17 % (yr 3) of Upper/Lower's bed, canopy to
  2.7–3.0 m — the research's ~20/24 % and depth bands (weed_bed_structure.md, new) — BUT STILL DECLINING at year 3 (large-leaf 28 →
  7 → 3.9 t): diagnosing (scratchpad plants_why.mjs → why4.txt: Secchi, sed/water P, plants' P, fL/fP/fN per species by July).
  BUILT: Plants3 loads a generated start (src/w3/plants3init.js, true/plants3init.js — tools/hotbrook/build_plants3.mjs spins up
  N years from the bare seeding, Uint16 log codes, keyed to the bed cells; Env3 option plantInit:false = the bare seeding); the 1/10
  file exists (2 years, PRELIMINARY — regenerate once the equilibrium holds). NEXT: fix the decline if it's a model fault, generate
  both worlds' starts, then fish cover by STAND (Σ stand share × in-stand cover, not cover of cell-mean stems — the Hill curve
  dilutes; littoral3 reach/crayfish the same), then the research's refuge rules (per-form architecture, pickerel ~600 stems/m² vs
  bass ~175, edges, lily shade). Gate the plants section; commit.
Results this session (true lakes, seed 611/612, a year): BED_SHARE no help (bass 0.63 · 0.61, pickerel 0.45 · 0.46); by BIOMASS bass
hold (1.02×), pickerel 0.69×, bullhead 0.76×, fallfish 0.62×, sunfishes ~0.55×; pickerel cannibalism 4.7–5.3k a year (90 % on
10–20-cm fish; ~2.5 %/week in late May vs the evidence's ≤ 0.1–0.3 %) against 2.2–2.7k recruits — a lever once the weeds are real.

▶▶▶ RESUME HERE (2026-10-19, ~1 a.m.): CALIBRATING THE YEAR, round 2 — the human said "keep going" (fix the predators first).
COMMITTED since round 1: 612b2a1 F3.BED_SHARE (coarse blocks feed on the bed by their share of time within reach, gamma shape 2 —
crayfish 133–135 g/h in blocks vs 149 fine, was 83–97; CPU⇄GPU parity all species), FRY.M_JUV_B (Lorenzen juvenile scaling, OFF —
A/B no help), watchdog + grid load in the year runner. THIS COMMIT: tools/gpu/year_cdp.mjs (THE WAY TO RUN YEARS NOW: opens year.html
in its own Chrome window, throttling off, copies window.YEAR to a file — `node tools/gpu/year_cdp.mjs "world=true&seeds=611&yf=0.22&
days=365&every=14" out.txt`; ~45 ms a block, a true year ~14 min — the app's browser pane pauses hidden pages, which explained the
"stall" at day 210); new GPU tallies (T_YKILLS young eaten by followed fish, T_YYKILLS by young schools, T_YFOODK the young's diet by
species) printed by year.js at the year's end, + the young's fates every fortnight; research notes esocid_first_year_survival.md.
FINDINGS (seed 611/612, true lakes): bass 0.66×, pickerel 0.45×, bullhead 0.84× after a year (winter starvation fixed). PICKEREL:
recruitment is the gap (research: ~8,500 fall recruits needed, sim ~2,500); larval loss is fine (~0.045/d vs 0.06–0.12 target) but
at 3–4 cm (early July) the young are EATEN ~26 %/fortnight + 14 % background (Z ~0.04/d vs 0.012–0.025 target) — real young pickerel
hide in dense weeds (Grimm; MDIFW: largemouth eat them); fish3 _yoyTarget/GPU y_target choose spots by food only, no cover term →
NEXT: check the T_YKILLS attribution in the running year (scratchpad year611_bed.txt), then a weed preference for young pickerel
(spot value × (1 + w·cover)), A/B on the GPU year. Also: young bass starve ~14 %/fortnight in July at 5 cm (diet now tallied);
cannibalism on pickerel ≥ 8 cm 2–4× high; the brook's dace (GPU loses more than CPU: 50 vs 211 left at day 98, old code).
The CPU reference year (old code) still running: scratchpad true_year.txt.

▶▶▶ RESUME HERE (2026-10-18, late night): CALIBRATING THE YEAR (the human: "yeah keep going" — fix the predators' feeding first).
docs/GPU_SIM.md "G3 — calibrating the year" (diagnosis + fixes); research: docs/research_notes/Predator winter energetics/
(predator_winter_energetics.md, nest_guarding_costs.md). DIAGNOSED with the year runner's new diagnostics (tools/gpu/year.html: each
fortnight's ration p — intake reset after each report —, mean K, diet by food per species; GPU tallies T_FOODK, census K): the young
recruits (bass < 30 g, bullhead yr 1, on the Rice largemouth stand-in, Q10 1.37) starve every fall/winter; Whitledge's bass and the
pike set burn 2–4× too much in the cold; constant ED overstates winter mass loss; nest guarding (×1.6, feed ×0.2, swim cost on top)
starved ~14 % of adult bass in June. FIXED (both engines): F3.FRESH_HASH (coarse block in two passes, GPU regrid — kills +12 % at true
scale; it exposed a hand-back bug: mates later in the list dropped — fixed); bioenergetics.js coldResp/coldCmax (species `cold` rules:
bass curve 30 mg O₂/kg/h at 5 °C ×(W/100)^−0.2 ×2^((T−5)/10) ×0.7 fasting; young bullhead on the adult set; pickerel ×½ ≤ 8 °C) and
energyOf/massOf (ED by condition below Ws: γ 0.8 adults, 0.3 young); staged guarding (BROOD.GUARD_METAB3/FEED3/EARLY/QUIT; bullhead
guard 12 d). Checks: gate w3 core/young/forage/foodweb/gpu 52/52; CPU⇄GPU parity 1/10 3 seeds × 30 d all species within spread.
NOT YET: the water under the ice (1–2 °C through the column; real ~3–4 °C at the bottom — no sediment heat flux in env3 under ice);
fall fattening (K capped at 1: length grows from any surplus); the dace in the brook; the recruitment cap (F3.CAP).
RESULT (seed 611, true lakes, a year): bass 0.229 → 0.664, pickerel 0.117 → 0.448, bullhead 0.548 → 0.844; winter starvation gone
(GPU_SIM.md table). NEXT: the pickerel's recruitment (~2,500 of the young reach L0 8 cm: the year runner now prints the young's fates
at the year's end), the bass's July starvation, the dace, the cap. Gates: w3 all sections (the env perf check fails under load, as the
previous commit does), headless, smoke, serve, ui pass; CPU⇄GPU parity 1/10 within the seeds' spread.

▶▶▶ RESUME HERE (2026-10-18 night): GPU STAGE G3 — THE GPU IN USE (docs/GPU_SIM.md "G3 — in use" + the year's table).
DONE: the YEAR RUNNER tools/gpu/year.html (?world=true&seeds=…&yf=0.22&days=365&every=14; lines in w3_season's format; window.YEAR);
ROOM TO GROW (kernels hold back what has no room and say how much — GL 43–45; GpuFish.grow/ensureRoom re-stride the arrays;
tools/gpu/g3_grow.html: grown = never-grown bit-identical); THE HAND-OVERS (GpuFish.upload / download; layout.js materialize +
statsAdd; gate `gpu` check: materialized into own vs all-new objects live on identically); THE BROWSER'S FAST-FORWARD ON THE GPU
(sim3worker gpuSide: fine speeds on one Fish3, blocks on the GPU; the view's fish gathered there — wgsl VIEW v_drawn; the card —
GpuFish.one + fishside3 gpuCard; the data page — gpuStatsPart; ?gpu=0 off, ?gpu=1 on the 1/10 world; tools/gpu/g3_worker.html drives
the worker without the renderer); THE WATER OVERLAPPED (GpuFish.block(dt, during): the water steps while the GPU works, the takes
added as differences); FIXES: chem.fishKgHa never set on the GPU path (now each block's); the CPU shards counted the founding's
tallies twice (now once; gate `core` checks).
MEASURED (true lakes): a whole YEAR in 27 min on the GPU (CPU ~20 h); in the worker max speed ~13,000× (a day in 6.6 s; the CPU's
fast-forward was ~54×), ~85 ms a GPU block tick; hand-over to the GPU 5.2 s, back 7.2 s (JS packing of 300k fish — can be made
faster); real time on the solo Fish3 ~48 ms a 0.1-s step (1× fine; 4× runs ~2×, as before shards — the shards aren't used with the GPU).
THE YEAR'S FINDING (the MODEL — the GPU matches the CPU's own run to day 42, bass 0.833/0.832 etc.): the lakes are NOT yet
self-sustaining: after one year bass 0.23× (22k starved, adults from midsummer, the recruits in the fall), pickerel 0.12× (starve
over the winter), bullhead 0.55× (42k recruits starve Sep–Nov), the brook's dace extinct by November, killifish 0.56×, fallfish
0.69× — while white perch and suckers fill to the F3.CAP recruitment cap. → the next calibration work (ask the human's field
knowledge where it helps).
SIDE TASK (the human asked mid-session): a 3-D PRINT of the true lakes — tools/print3d/export_stl.mjs (+ check_stl.mjs) writes
exports/print3d/ (git-ignored): the land and each lake's drop-in water piece (clear PETG), ×5 and true-to-scale, 250 mm long,
north along +X; basins 1 mm + depth × exaggeration; the brook a widened 1.2-mm groove. Sent to the human.
RUNNING: the 3-seed year (seeds 611–613, the overlap + fishKgHa) in the browser tab; the CPU year run (scratchpad true_year.txt).

▶▶▶ RESUME HERE (2026-10-18 evening): GPU STAGE G1 — THE WHOLE COARSE BLOCK RUNS ON THE GPU (the human: "ok now do the gpu").
docs/GPU_SIM.md "G1 — the design as built" + results tables. Code: src/w3/gpu/layout.js (pure: the struct-of-arrays fields, pack/
unpack from a Fish3, statics, water sections, WGSL constants generated from the CPU's config — gate section `gpu` checks the round
trip), src/w3/gpu/wgsl.js (every kernel, each a port of the fish3 function it names), src/w3/gpu/gpufish.js (WebGPU host;
GpuFish.block(dt) = one coarse block in one submit, the water written back; schools() every MERGE_EVERY blocks and compact()
every 10 as their own submits; census()). Checks: tools/gpu/g1_check.html (each phase on fish3 and the GPU from the same fish:
true lakes — prey/threat identical for every fish, moves 28.30 m on both, body exact, food totals within 0.5 %, O2 identical,
the young within 2 %); tools/gpu/g2_run.html (multi-day runs, GPU vs fish3's own blocks, several seeds). fish3.js: _livePre
split out of _live (fingerprint identical), GATE/LAKE_NEAR exported. Commits 8669e80, 1f0bf92, c644e71 (+ schools, pending).
KEY DESIGN: phases for all fish at once; mates/threats read from a snapshot; counter-based RNG; grid cells sorted by index;
64-bit fixed-point sums; food shared by RATIONING (each its ask while a cell's food lasts — the exponential first version starved
the crowded young 9 %); births/recruits/dissolves get slots from one workgroup walking in index order.
FINDING (docs/GPU_SIM.md): fish3's coarse-block STRIKES search the block-START grid after every fish moved (~28 m true lakes) — far
fish are struck far less than near ones (fine steps, fresh grid); the GPU emulates fish3's list order for parity; correcting it
needs the predation recalibrated (pickerel ~1.3 %/wk, dace) — a decision for after G2. Same for the mate search (spawning).
G2 RESULTS (docs/GPU_SIM.md tables): 1/10 lakes 3 seeds × 30 days — ten of eleven species within the seeds' spread, spawnings and
kills alike (the young dace grow ~4 % fast: a school crosses recruiting length days early). TRUE LAKES against the CPU's year run
(seed 611, day 28): 102.3 · 102 kg/ha, every species' adults within 0.006, the young within ~4 %, spawnings within ~3 %; 73.9 ms a
block vs ~3.1 s — ~40×, a year in ~22 min. Commits 8669e80, 1f0bf92, c644e71, ad5c967 (+ this).
NEXT: G3 — the browser's fast-forward on the GPU engine; a headless year-runner page; pipeline the water model; the whole year
against the CPU run (≥ 3 seeds). Then the human picks how to spend the speed (bigger brains, more agents, a finer water model).
The CPU year run (scratchpad true_year.txt, tools/w3_season.mjs 0.22 365 611 14) is still going: read it on resuming.

▶▶▶ (earlier) RESUME HERE (2026-10-18 afternoon): T4 PART 1 + THE BROOK'S NEST SITES committed together (gate run before committing).
(1) T4 PART 1 — the learned copy is the hidden→output block only (forward3(g, lw2, …), reinforce3(lw2, g, …), plastic3): bit-
identical (tools/w3_fingerprint.mjs), −348 MB on the true lakes; TRUE_SCALE.md T4 "Built, part 1".
(2) THE BROOK'S NEST SITES (TRUE_SCALE.md T7 "Validation" + "Built: the brook's nest sites"): runK 150 fallfish at once; admission
at the brook's MOUTH (F3.RUN_MOUTH); turned-back runners (a.runYr) go to the lake ground nearest HOME, don't spawn on the brook's
gravel nor chase mates into it; EVERY fish leaving the brook goes out through the lake's GATE (fish3 GATE — the old straight line
from the path's end crossed the bank: a real bug, all species); RIPE fish hunt/forage at F3.RIPE_HUNT 0.5. True lakes: ~440 ripe
fallfish in the brook at 3 h, ~250 at 12 h (was 5,400); 7 days from May 20: dace −4 % (fallfish ate 20 = 1.45 %/wk), no starvation.
Gate check "the brook's nest sites" (w3 young). Probes: scratchpad brookcrowd2.mjs, brooktrace2.mjs, brookpulls.mjs.
PICKEREL (researched: research_notes/…/pickerel_mortality_cannibalism.md): the −2.9 %/wk was mostly yearlings eaten by bigger pickerel
(60 of 69 victims < 20 cm); for ≥ 20 cm ~1.3 %/wk, cannibalism ~0.34 %/wk — in range. Built PREY_LR (fish3: the longest prey a fraction
of the eater's length — pickerel 0.55, bass 0.45, others 0.45; slim fish fit a gape at ~0.9 L). 3 seeds × 7 d true: pickerel 0.97×.
SEASONS (a week each, true lakes): Aug / late Sep / Jan under ice all steady (0.97–0.99×, 103 kg/ha, nothing starved). A WHOLE
SIMULATED YEAR is running in the background (scratchpad true_year.txt: tools/w3_season.mjs 0.22 365 611 14) — read it on resuming.
Also done: tree tiers' ragged edges (main3 RAG); data page — the spawning run (Brook tab), sizes against the census (Fish tab:
white perch 0 % > 22 cm vs census 20 % — the founders' S3 found 0.72 from an older stunting calibration; sucker and bullhead
smaller too — research running: docs/research_notes/…/size_structure_whiteperch_sucker_bullhead.md), what a fish senses (its
card: Fish3.senses split out of _brain, fingerprint bit-identical), the run's history kept while the page is closed; the sim's
banks from the photo (true world: GEO.canopy from true/shore3.js → littoral3 insect fall, plants3 wood; totals 91–95 %).
WHITE PERCH: the human's catches are "probably bigger than 6 to 8" in → near-normal growth, S3 whiteperch perHa 450, found 0.85
(founders 50/39/10 %, 72 g); gate green 94/94; committed c39d59e. The year run RESTARTED on it (true_year.txt).
THE GPU (the human: "if the gpu makes this whole project better, we should do it") — docs/GPU_SIM.md: the CPU sim stays the
reference (tests, resume, 1/10, the fine steps near the camera); a WebGPU engine for the coarse blocks (the year engine:
decades for evolution), validated statistically against the CPU (≥ 3 seeds); counter-based RNG + fixed-point integer
atomics for determinism on the GPU; runs in Chrome (no native deps). Machine: RTX 3060 + Ryzen 5 5600G (6 cores).
G0 DONE: block profile (senses 25 %, feeding 20 %, relocation 18 %, brain 9 %, drives 7 %, strikes 4 %, body 4 %, young 6 %,
water ~1 %); tools/gpu/sense_bench.html?world=true: senses 3.2 ms GPU vs 984 ms CPU (~300×), agreement ~100 %.
NEXT: G1 — the whole coarse block on the GPU, kernel by kernel (grid, senses, brain, drives+relocation, feeding with
fixed-point atomics, strikes with claim resolution, body, hazards, births/young, schools), each checked against the CPU on
the same inputs; the year run (CPU) is the reference for G2.
(Below, the audit notes that led to part 1:)
(was) NEXT: T3 — the fish at true scale. The audit (this session) lists ~19 landscape distances written for the 1/10 lakes to convert —
SUB_R 40 (=400 m real), BROOK_NEAR 60 / BROOK_RUN 150, FP_MIN/MAX 4/20, BAND_SLOPE 0.12 (→ 0.012 true), bass faith 2 (20 m),
site spacing 6, fallfish nearBrook 40, the brook runners' mate search 40 (×2 brook scale), dace home 12 (brook scale),
RELOC_MIN (= GEO.CELL), _slopeStatics R 3 cells (~100 m real), _yoyTarget scatter ±1.5 (0.3·COL) and wander ±3, YOY_ROAM 15,
the brain's shore cue /20, _far > 20 — and the HOME ranges, which ×10 would overshoot sunfish/sucker/bullhead/pickerel and
undershoot bass: re-derive from habitat3d.md at true scale (radii ~ sunfish 45, redbreast 80, bullhead 120, pickerel 120,
sucker 230, bass 700 m), keeping the 1/10 values. Also at true scale: the brook as range again (the passage rule and the young's
brook ban were 1/10 compromises), the hash grid's size (~1M cells: make it sparse/incremental), then fidelity by distance. Still open from 7g (HOT_BROOK_3D.md):
- the nest builders' plant avoidance;
- pickerel capacity per vegetated area;
- perch ribbon wind losses;
- the isoetids' organic threshold;
- the lawns' denitrification;
- bladderworts in the brook's slow runs.

▶▶ RESUME HERE (2026-10-17, early): THE FISH, THE BROOK AND THE PLANTS — THEN TRUE SCALE. Committed before: 283216b (the 11
species, the census, the lakes one water, the riffle refuge, the young that keep moving, the fish's body widths). THIS COMMIT
(HOT_BROOK_3D.md §4 "Built — who gets a brain", "Built — the brook as a lake-outlet stream"; §5 "Design/Built (stage 7f)"):
(1) THE AGENT RULE (FISH_CENSUS.md §3): F3.AGENTS_HA 470; solitary species' young in groups (S3 group) leaving them at size;
perch/white perch schools break up into individuals at the budget's cutoff (_soloCut every 10 days, none while at/over budget;
_dissolve conserves fish; SOLO_COHERE); Fish3 option `budget` (off in hand-built test lakes). 1/10: 2,990 agents of 3,023 at
founding, perch/white perch ≥ ~20 cm own-brained; 2,870–3,040 through a season. (2) THE BROOK AS A LAKE-OUTLET STREAM: chem3
BROOK_FILTER/CAP/BENTH (filter feeders strain Upper's outflow algae → the brook bed's invertebrates, 25–36 g/m²); the dace
persist (riffle refuge, nights in the riffles, census 0.8/m², the brook a PASSAGE for lake fish at 1/10 — it is ~25× the share
of the shallows it really is — and the lakes' young don't raise in it: S3 brookYoy dace/fallfish). (3) THE PLANTS AS SPECIES
(stage 7f; research plant_species_hot_brook.md + plant_species_traits.md): 13 species with their forms (pickerelweed, bulrush,
yellow pond-lily, fragrant water-lily, watershield, ribbon-leaf / large-leaf / Robbins' pondweeds, bladderworts, pipewort, water
lobelia, Nitella, water moss in the brook); mineral vs organic bed (PL3.MINERAL_Z/SHELTER); lilies/emergents to the aerial
photos' fringe (shelter 6/5); species sort by depth within a form; bladderworts root 0.5; brook moss free of wave/ice scour;
per-species invertebrates and view (pad sizes, colours, blades). Only two plants are recorded (Nitella ×2, Upper 2015): ASK the
human's plant photos come after compacting (Lakes of Maine has NO plant list for these lakes — they checked). NEXT: plants' remaining roles
(bladderworts eat zooplankton; rosettes oxidise the sand; lily-pad insects; spawning on plants), then TRUE_SCALE T1–T8 (T8 the
data/stats page). KNOWN: bass/bullhead recruits starve in autumn (old); the year swings 80–140 kg/ha between runs. Branch zoo-field.
▶ TRUE SCALE — DESIGN + PROTOTYPE DONE (2026-10-16, late): the human asked "can we just make everything
true to scale" and chose "design and prototype" first. docs/TRUE_SCALE.md: build_world3d.py takes HB_SCALE/HB_BROOK_SCALE/
HB_BROOK_W/HB_MARGIN/HB_OUT (default unchanged); at true scale the existing sim RUNS — 369 + 274 ha, 2,606 water columns
(53 ms an update), 1.63 M fish in 304,256 agents (889 MB heap, 3.0 KB an agent; 2.3 GB process), a 29-min block 14.6 s (~120×
real time on one core), a 0.1-s step of ALL fish 8.4 s → needs: T1 geometry (5-m shore cells, the brook as a channel), T2 the
water in real lengths (H3.REAL 1), T3 fish fidelity by distance from the camera, T4 compact brains (~1.2 KB an agent), T5 2–4
workers, T6 tiled terrain/photo + ~1.2 M true-size trees with cut-outs (1 M simple trees measured ~45 fps on the human's GPU),
T7 the gate restated. The human also questioned the fish count: ~1.6 M fish ≥ 7.5 cm IS realistic (~2,500/ha, ~100 kg/ha,
mostly 10–20-cm panfish; the nets suggest 0.7–1.3 M) — crayfish/mussels/insects are separate populations.
▶ LATEST (2026-10-16, afternoon): THE LAKES' SHAPE FROM LIDAR AND PHOTOS (docs/HOT_BROOK_3D.md §2 "Rebuilt from lidar and
aerial photos"; research note Hot Brook populations and water/lidar_and_shallows.md). The human supplied Google Earth images
(hotbrooklakes2.zip; reference only — Google's licence: never copied into the repo) and asked for lidar and terrain. DONE:
the sunfish cove moved between the two long points (838948c); forest along the brook (65dc8db); then, in the commit after
these, build_model.py takes the TERRAIN and LAKE OUTLINES from USGS 3DEP lidar (ME Eastern B1/B2 2017; fetch_data.py now
fetches data/lidar_dem_box.tif + lidar_dem_2m.tif + data/naip_hr/ 1-m NAIP RGB+NIR tiles) and the 0–1.5 m SHELF from NAIP
(tools/hotbrook/shallows.py: the visible-bottom band, its edge at 1.3 m = the human's "chest height where the water gets
darker"; validated leave-one-out — no skill at 1–3 m, so used only for the fringe); env3 solveLaplace tolerance 1e-18 (the thin
fringe stiffened the circulation solve; a uniform field drifted). Gate check: Lower's mean depth bound 2.45–2.8 (was 2.55).
THEN (same day): TREES TRUE SIZE EVERYWHERE at Maine-forest density (~85 % closed; the human chose "true size by the water", then
asked for the whole map — cabins and roads to come — and said "that looks better"; a canopy-surface stand-in was tried and
dropped as a green wall), the brook's banks at its half scale, shrub thickets at the edge, rocks in the riffle, lily pads 10–30 cm
and out of the brook (docs/HOT_BROOK_3D.md §6 "Built — TREES TRUE SIZE EVERYWHERE"). NEXT (the human's notes): trees from real canopy data (lidar first returns / NAIP NIR) where they stand; ROADS and
BUILDINGS on the land (ROADMAP agreed plan 6); water levels varying by season/year (plan 7); then (f) census/new species, (a)
clarity.
▶ RESUME HERE (2026-10-16, after compacting). DONE THIS SESSION (docs/HOT_BROOK_3D.md §5 "Built — THE SEASON'S YOUNG SO FAR",
§6 "Built — THE CRAYFISH AND SNAILS ON SCREEN"): (e) Fish3.seedSeason — a lake opened on May 20 (or a forward season jump) holds
the young of the spawnings before it (spawned as _spawn would, carried by _spinYoy at F3.SEED_P [0.73 spring → 0.5 by early July],
SEED_M 1.2, SEED_SPREAD 10 days; calibrated vs full runs from ice-out on May 20 / late July / Sept 12; a.lastSpawn: once a year);
Fish3 {young: true} in the worker (gate unit tests keep founders only); Env3._light() at primeSeason (a fresh lake sat in NIGHT
until the water's first step — a minute at 1×); bed3view.js — crayfish (walking) and snails drawn at their real numbers
(Littoral3.shown). FOUND: the env's spring water runs 1.5–3.5 °C below the calendar (May 20 11.7 vs 13.2 °C).
NEXT, in order: (f) THE CENSUS AND THE NEW SPECIES — research IN (docs/research_notes/Hot Brook populations and water/
eastern_maine_relative_abundance.md: EPA 1991–94 Northeast Lakes nets in 9 eastern Maine lakes 30–95 km away — median share of
adults white perch 42 %, sucker 7 %, yellow perch 6 % (mostly juveniles), pumpkinseed 5 %, bullhead 3 %, smallmouth 2 % (0–40),
golden shiner 1.3 %, FALLFISH 0.9 % (0–23; 6 of 9 lakes), pickerel 0.5 %; the sim's shares: yellow perch 34 %, white perch 32 %,
golden shiner 17 % (too high; MDIFW lists none for Hot Brook), sucker 1.2 % (too low); yellow perch : bass 21:1 vs regional 7.5:1;
the human's catches fit — bass caught 3–7× a year each under C&R, fallfish "very easy", perch take small baits: calibrate to nets,
not angler catch) → revise S3 perHa (fewer yellow perch ≥ 7.5 cm and golden shiners, more suckers within the 12–25 kg/ha biomass
bound, add FALLFISH ~75–250/ha and BANDED KILLIFISH as the small-minnow guild — life histories + FB4 surrogates in
fish_numbers_and_new_species.md Q5–Q6; redbreast in the brook/coves). TROUT/SALMON: not supported (MDIFW sheets list neither, no
coldwater tributaries, no stocking 2015–25; the claim likely from a real-estate listing) — at most rare spring/fall strays: tell
the human, ask what they know. White perch 25-fish limit: a citizen petition, "not for biological reasons". Bass rules confirmed
("larger than average size"; all bass released; artificial lures Oct 1–Dec 31). (a) CLARITY — now with local data
(maine_dep_lakes_data_2025.md, from the human's LakesDataTables2025.zip: no Hot Brook data at all; Faulkner Lake (Weston) Secchi
3.5–4.5 m, colour 18, chl 3.6–5.5, TP 9–12; North Lake (Orient) 3.3–4.6 over 1992–2014; Baskahegan 3.7–4.7, colour 46 → target
Secchi ~3.9 m vs the sim's 3.2; late-August profiles of 4–7-m lakes mixed, 19–23 °C, bottom O₂ 7.6–8.9 — the sim agrees).
MUSSELS (maine_freshwater_mussels.md, from the human's MDIFW poster): Maine's 10 species — for Hot Brook (Penobscot drainage)
eastern elliptio (the sim's) + eastern floater (soft weedy mud, low O₂) + eastern lampmussel; maybe yellow lampmussel / tidewater
mucket (threatened; white perch, killifish hosts); otters, raccoons, muskrats eat them (shell piles). Then: the water level
(below), frogs + turtles (turtles_and_frogs.md), R3's fine-rung items, wildlife 7e.
NEW FIELD OBSERVATIONS (2026-10-16, after compacting; memory hot-brook-field-observations, w3-backlog-requests item 7):
FROGS of several species, "definitely bullfrogs"; SNAILS and CRAYFISH are there (the 3-D has both as bed biomass in littoral3 — eaten,
NOT DRAWN); TURTLES. Research already in hand: Maine lake shores and catchment/turtles_and_frogs.md (painted, snapping, wood turtle;
green frog, bullfrog, mink frog, vernal-pool amphibians). A search summary (Maine.gov-cited) the human shared: smallmouth managed for
larger-than-average size; WHITE PERCH ABUNDANT (25-fish bag limit on Lower); pickerel common; yellow perch, bullhead, sucker,
fallfish, minnows; Upper records OCCASIONAL BROOK TROUT and ATLANTIC SALMON ("maybe during the right time of year we have trout and
salmon come through") → transient cold-water visitors via the inflow/brook in spring/fall. WATER LEVELS VARY by season AND year
(rain): in a dry year the brook was so low "you could walk through parts that were almost out of the water" → a water balance
(rain, evaporation, inflow, the outlet sill) with a varying stage; a dry-year brook nearly cutting the lakes apart. RESEARCH running:
docs/research_notes/Hot Brook populations and water/eastern_maine_relative_abundance.md (relative abundance in eastern Maine lakes vs
the human's catches, fallfish in lakes, the small-minnow guild, trout/salmon visits, the white perch bag limit). Existing research
covers the new species' life histories + FB4 surrogates (fish_numbers_and_new_species.md Q5–Q6) and the plant species per growth
form (Whole lake 3D fish simulation/macrophytes.md §1).
(Before:) STAGE R's core is DONE and merged (below), and the human's request (5) — RISES, SPLASHES, LEAPS
and the insects on the water — is built (fish3 rises → render3/rises3view.js; docs/HOT_BROOK_3D.md §6 "Built — RISES …"). NEXT:
R3's fine-rung mechanisms (strike events, real strike distances; equate the rungs' surface feeding — B11: the real-time rung takes
~1/7 of a block's), the remaining compat constants, the small young shiners/pumpkinseed, then the wildlife (7e).
THE HUMAN'S FIELD OBSERVATIONS (2026-10-16, after the real-time view; memory hot-brook-field-observations): (a) the real water is
"a bit clearer" than the sim's → raise Secchi toward 3.5–4.2 m / colour 25–40 (recent_maine_research.md: nearby lakes Secchi 3.4–4.4,
colour 22–27; CHEM3.KD_COLOUR 0.5 gives ~3.2 m; the view's water3 KD_TRUE too) — re-check the weeds' depth limit, the winter O₂ and
the fish's sight after; (b) "the perch are small" (and DEP 2011 local white perch weigh 0.70–0.80× the sim's length–weight); (c) from
their catches "not nearly as many [perch] as FALLFISH and BASS — especially since you can't keep the bass" (Maine law: all bass
released) → revisit the census (S3 perHa: perch 860, white perch 800, smallmouth 40/ha) against catch-and-release Maine lakes, and ADD
FALLFISH (Semotilus corporalis; MDIFW 1949 lists it; backlog "redbreast + fallfish") — a large native minnow of the brook and the
shores; (d) BALD EAGLES are there (already in the 7e wildlife design: one, all year — keep). (e) The human saw "0 schools of young"
after a refresh: a fresh lake opens on May 20 (SEASON.START_YF 0.22) with adults only; suckers, white perch and smallmouth spawn
within ~2 days (65 schools by May 22, ~470 by May 30 — mostly pumpkinseed), BUT YELLOW PERCH AND CHAIN PICKEREL NEVER SPAWN that
year: their season (ice-out → mid-May, 7–12 °C) is over before the start (scratchpad-free check: /tmp/yoystart.mjs pattern — Env3()
+ Fish3, 49 blocks of 1,752 s a day). FIX: open the lake at ice-out (~Apr 23, as the gate's spring run, yf 0.14) or seed the young
the spring's early spawners would already have on the start date (and after a season jump). Suggested order after compaction:
start-date young (e) → (f) THE HUMAN (2026-10-16, before compacting): "what fish are actually in here? we should make it realistic to
these lakes … the perch I feel are usually in the middle of the lake, maybe sometimes by the shore, but the sunfish are almost always
in the shallower areas, and there's schools of real small minnows" and "the plants should be realistic too". Answered: the 8 species
(golden shiner 430/ha in schools of 60, pumpkinseed 215, yellow perch 860 in schools of 80, white sucker 30, brown bullhead 140, white
perch 800, smallmouth 40, chain pickerel 20 — fish ≥ 7.5 cm) and their habitat bands (S3 hab: perch offshore 3–5.5 m by day, inshore
at night — matches; pumpkinseed 0.3–2.5 m day and night + the brook pools — matches). GAPS: the SMALL SCHOOLING MINNOWS (MDIFW 1949:
minnows, blacknose dace, banded killifish; likely common shiner / young golden shiners) — the sim has no small-minnow species (only
fish ≥ 7.5 cm + young-of-year); FALLFISH and REDBREAST missing; the census (perch-heavy) to revisit against the human's catches. PLANTS:
five growth forms (EM, FL, SC, IS, DM) stand for guilds — make them REAL Maine species (research which grow in coloured eastern Maine
lakes like these: pickerelweed, white water lily, watershield, bur-reed, pondweeds, waterweed, tape grass, bladderwort, pipewort,
quillwort, native milfoils, Nitella/muskgrass; ROADMAP agreed plan 3's plant item). PLAN: one research pass (the fish community of
small coloured eastern Maine lakes — species, relative abundance, the small-minnow guild — and their aquatic plants) → then the
census, the new species (fallfish, redbreast, banded killifish / a small-minnow guild) and the plant species →
clarity (a) → census and fallfish research + build (c, b) → the fine rung (strikes as events, B11) → wildlife 7e. (Earlier:) the MUSSELS (7d) are committed (da8bd4b; the June check restated — docs/HOT_BROOK_3D.md §5 "Built
(stage 7d)"); test/w3.mjs has W3_ONLY=<sections> (env chem core young forage foodweb plants). THE AUDIT IS IN:
docs/W3_REALTIME_AUDIT.md (R1 done — A calendar rates carry over; 11 hidden per-sim-second constants (A7) that don't; 14 B
shortcuts; 24 C step-size items; 20 D day–night items; the cost per rung; the order of work §7). STAGE R IS UNDER WAY on branch
`w3-realtime` (zoo-field stays green until it merges). DONE R2 step 1, the COMPAT REFACTOR (gate 69/69; the view runs): the
clock real (clock3: YEAR 365·86,400 s, PER2D = TS, OLD_S 8,760; DAY_LEN still the 1-hour year's 1,051,200 s until step 5),
every A7 constant at its compat value (÷ OLD_S), Fish3.step(dt, mv) — the gate and the worker at (876 s, 0.1 s), the water at
1,752 s; checked vs the old code (scratchpad envlock.mjs: the water a year to rounding; lockstep.mjs: all fish to 1e-6 over the
first steps, then chaos from last-digit TS×dt differences). DONE R2 step 2 (eeaa33a: exact 1 − e^(−k·dt) integrators) and
steps 3–4 (ec61f8f: transport sub-steps to 24 — the A/B moved nothing; mixed-layer e-fold 30 min; the WEEDS' O₂ now follows
their growth's light — they were a net O₂ sink, −0.4 g/m²/day in summer, now +0.27). THEN (all on `w3-realtime`, WIP commits
a3e2b5e … 7b94379; docs/HOT_BROOK_3D.md §4 "Built (stage R, 2026-10-16)"): the COARSE BLOCK (each fish's brain decides once a
block, then _relocate hops where its drives point; the gate runs 1,752-s blocks), the REAL DAY (86,400 s; ice first in sheltered
coves: H3.ICE_WIND × exposure), the VIEW IN REAL TIME (1× real, 4×, 1 min/s … max), the O₂ METABOLISM (Vachon–Prairie gas
exchange, Garcia–Gordon saturation, the bed algae's O₂: summer 93–94 % of saturation), FEEDING BY THE HOUR'S LIGHT (lux with
twilight, species' sight I/(I + K_I), zooplankton ∝ sight²), fish never hop into hypoxic water, and THE YOUNG'S FORAGING
FOOTPRINT (young perch 6.8–7.3 cm by Sept 10, young bass starvation 3–17 %). ALL GREEN (npm test: headless, smoke, ui, serve,
w3 69/69; a summer month's adult feeding 0.38–0.64 of Cmax) → MERGED into zoo-field at 33bff43, pushed, backed up
(G:\synapse-reef-backups\synapse-reef_20261016_1221_w3-realtime.zip). The view: 1× is real time. OPEN: young shiners/pumpkinseed small; the June zooplankton peak high;
the fine rung's mechanisms (strike events, short strike distances, the intake cap; SURFACE RISES AND LEAPS for the view — the
human's request (5)); the remaining compat constants.
RESEARCH IN (2026-10-16, committed 75aff98): (1) docs/research_notes/Whole lake 3D fish simulation/realtime_foraging.md — for
R3: reaction distances (perch larvae 2.8–5 cm; pumpkinseed 20 cm on a 1.9-mm Daphnia; smallmouth 84–108 cm on fish, 40 in the
dark; pike 1.5/1.0/0.5 m clear/brown/very brown), the sim's VISION RAMP (chem3 VIS_I0/VIS_I1 ~200 → 10,000 lx) goes blind
40–100× too early and the daylight curve has NO TWILIGHT — dusk feeding can't emerge until both are fixed; strikes start at
0.14–0.37 body lengths (the sim's strikeR 1.0–1.2 m is 3–8× long: detection stays at reaction distance, the gap a stalk);
capture per strike (esocids 0.67 fathead / 0.14 bluegill; bass 0.57–0.83; perch 0.20 single vs 0.03 into a school; Daphnia
0.76–0.96 vs copepods 0.07–0.28); vegetation cuts attacks not success; handling times; rations; Gerritsen–Strickler and the
visual-range equations for the coarse rung; larval perch < 3 cm/s (YOY_VMAX 0.25 m/s far too fast for larvae). (2) docs/
research_notes/Hot Brook populations and water/recent_maine_research.md — the human asked why the research is old: NO water
measurement of either Hot Brook lake exists since the 1949 survey (DEP 2024: Category 2 "no data"; no station; no stocking
2015–2025; no invasive plants); the nearest measured stand-in Skitacook Lake (NLA 2017: Secchi 4.2 m, colour 25 PCU, TP 7.6,
chl 2.1, 22 °C and 8.2 mg/L O₂ top to bottom); where the sim differs: water too dark (Secchi ~3.2 vs 3.4–4.4; colour 30–60 vs
22–27 PCU), white perch 0.70–0.80× the sim's length–weight (DEP 2011 local mercury samples), ice-out Apr 23 fits 2015–2026 but
the 2020s ran Apr 17–18 (East Grand Lake, Danforth), Maine lakes +0.05 °C/yr since 1977 (August max +2.3 °C). Recommended:
Secchi 3.5–4.2 m / colour 25–40, an ice-out spread (Apr 12–May 2), warm summers to 26–28 °C, white perch length–weight, the
56-mm first-winter survival rule for young smallmouth (MDIFW plan) as an audit target. The human could open Lakes of Maine's
MIDAS 1076 / 1072 pages (a bot check blocked the agent) for any volunteer Secchi readings.
DECIDED (human, 2026-10-16, the audit's two questions): (R3-g) IN FAST-FORWARD THE BRAIN DECIDES PER BLOCK — each coarse block
the fish's own network decides where to go next, how hard to forage, how much to hide, from what it senses at the block's
scale; learning and evolution keep acting on the same brain (fast-forward somewhat slower). (R3-h) THE 1/10 SCALE: ACCEPT IT —
real speed everywhere; trips, dusk moves and home-range crossings take 1/10 of their real time; encounter rates stay real.
DECIDED (human, 2026-10-16): REAL TIME + FAST-FORWARD. "I want to make this a realistic simulation, with each animal actually
thinking, learning, and behaving the way they would first, then eventually slowly evolving over time" — 1× becomes REAL TIME (a
day is 24 h, a year a year); each animal lives the day in full detail (individual strikes, dives, prey captures, real dawn and
dusk); fast-forward runs coarser time steps (rates per real second integrated over larger dt) up to ~800× or more for the seasons,
the gate and evolution (a year ~11 h of running at 800×; evolution over years = weeks). This replaces the 1-hour year (2026-10-15).
PLAN — STAGE R (real time), before the wildlife (7e, designed in docs/HOT_BROOK_3D.md, waits for R):
 R1 audit every time-dependent rate in src/w3 (env3, chem3, plants3, littoral3, fish3): calendar-based (TS / DAY3 / REAL_S —
    carry over), per-sim-second behavioural shortcuts made for the compressed clock (piscivory ATTACK hazard, the foraging
    footprint "one sim second = 2.4 h", MIGRATE_V / BROOK_NEAR limits, YOY_TICK…) — re-derive as real mechanisms, and the
    step-size limits (transport stability at large dt).
 R2 clock3 → real time; the env stepped at minutes (its physics' natural scale), the slow pools at minutes to hours.
 R3 fish: real-time mechanisms (strikes as events at real rates, local foraging), FIDELITY LADDER — fine (dt 0.1 s, brains 5 Hz:
    watching), medium, coarse (dt ~60–300 s: habitat choice per block, feeding/predation as integrated rates) — the coarse mode
    reproducing the fine mode's ecology statistically.
 R4 the gate in coarse mode, re-calibrated on ≥ 3 seeds; R5 the worker/view: speeds 1× (real) … 1000×, max; the clock; R6 then 7e.
THE HUMAN'S REQUESTS (2026-10-16), in order:
(1) "ADD EVERYTHING" — the missing animals: freshwater mussels (eastern elliptio; the human sees lots — filter the water,
    glochidia on fish gills), the fish-eaters (the loon pair, great blue heron, belted kingfisher, osprey + bald eagle, otter +
    mink), painted/snapping turtles, frogs + tadpoles, dragonfly/damselfly nymphs (predators of small fauna and fish larvae),
    beaver/muskrat/raccoon. Research: docs/research_notes/Maine lake shores and catchment/ (shore_birds_and_mammals.md,
    turtles_and_frogs.md), Hot Brook populations and water/invertebrates_plankton_plants.md §2 (mussels). Each a researched,
    gated, rendered slice. DONE: MUSSELS (stage 7d — littoral3.js _mussels: capacity by the bed — firm margins 15/m², coves 40,
    edge 3, deep mud 2; recruitment in June by the host fish; summer filtering of algae and rotifers at 0.8 L/h/mussel, Q10 2,
    burrowed below 5 °C; the algae's N to ammonium, P half dissolved half to the bed's store, the rest to the organic layer;
    their O₂; the view: shells half-buried near the camera). NEXT IN (1): the fish-eating birds and mammals.
(2) LATER, once the sim works right: bring back a page of the lakes' and fish data (the 2-D app had charts/panels) and
    click-a-fish info (inspector).
(3) Keep SESSION_STATE and the docs current at every step (auto-compaction).
(5) SURFACE INSECTS AND RISES (2026-10-16): "don't forget about the bugs on the surface and bass or some fish jumping to get
    them" — the sim already has the surface's insects (littoral3: the weeds' emergence + the land's fall-in) and fish take them
    near the surface; make them VISIBLE at the real-time rung: insects on the film, each take an event → a rise ring/splash in
    the view, some a LEAP (smallmouth, pumpkinseed at damselflies and dragonflies over the weeds; the dusk hatch).
(4) GENES, GENE FLOW, POLLUTANT RESISTANCE (2026-10-16, "for the roadmap"): immigrants with their own gene distribution through
    the inflow/outlet; variation that lasts (Mendelian polygenic inheritance instead of blending; school agents' gene pools);
    a heritable resistance trait with a cost, and pollutant what-ifs — ROADMAP.md agreed plan #5. After stage R.
NEXT after (1): redbreast + fallfish, the shore (stage D: snow on the ice, the hydrograph), saves and resume. (The young
pumpkinseed's "stall" was the mean of a summer-long spawning: the first cohort grows ~0.3 mm/day to 2.5 cm by mid-August —
docs/HOT_BROOK_3D.md.) Perf idea: the fish
view's instance buffers are DynamicDraw (re-sent whole, 40k slots, every frame) — give them update ranges like the weeds'.
Consider moving the long w3 runs to a separate long suite (the gate is ~10 min for w3 alone).
OPEN for the human: the real depth of the cove between Upper's west points (model 2–3 m; they call it shallow); do the lakes
get low in O₂ in late winter (winterkill, fish crowding near inlets or the brook)?
KNOWN (2-D census of stage A, 3 seeds × 3–4 yr — re-judge in 3-D): white perch 70–90 kg/ha at ~180 g (real stunted 25–45 g:
adult food competition too weak); golden shiner collapse (eaten by white perch, pickerel, perch, bass); yellow perch dwindle;
young bullheads starve in August; fish ≥ 7.5 cm 500–1,100/ha vs ~2,600.

## (previous) ▶ NOW (2026-10-16) — THE REAL HOT BROOK LAKES, STAGE A DONE, branch `zoo-field` (save v33)

The human, looking at the full-screen display: most of the screen is soil (the 3.4:1 landscape at true depths is ~19 % water
on their ~21:9 ultrawide, 14 % at 16:9), there is nothing above the water, "maybe 3d or isometric". Mockups shown (scratchpad
layout_*.jpg, diorama_mock_*.jpg): split-screen lake/stream/pond panels (~56 % water), a 2.5-D cut-away diorama (the live
slice as the front face; a dock-level framing is mostly water). They REJECTED a painted backdrop: the shore, banks, land,
air and weather must be real and interact with the lake (memory land-water-realism). Then: "model the actual environment
to show me first… we need the simulation to work in it, but we need to know what the environment is first".
DONE: (1) research — 5 notes in docs/research_notes/Maine lake shores and catchment/ + the report docs/reports/Maine lake
shores and catchment.md (ranked mechanisms with parameters; sim settings that are off: turtle density 90–310/ha vs 2.6–16,
hatchlings emerge in spring, FROG.BREED_T/TAD_DEV_FULL fit peepers not green frogs/bullfrogs, ICE.LIGHT_CUT 0.6 vs 1–12 %
light under snowy ice, logs belong near shore in < 2 m; per-metre-of-shore fluxes need ÷10–14 for the slice's excess shore).
(2) THE HOT BROOK MODEL — tools/hotbrook/ (fetch_data.py, build_model.py, viewer.html; data git-ignored), published as
https://claude.ai/artifact/7e75Q4UqJJw4jEfx5gF7ye: OSM outlines, USGS 3DEP elevation, NWI wetlands, NLCD forest types,
approximated lake beds (mean/max fitted), seasons, the sim's slice line and a real-vs-sim cross-section strip. Real numbers:
Upper 360 ha, mean 3.35 m, max 5.5 m (18 ft); Lower 277 ha, mean 2.74, max 4.0; connecting brook 154 m, 0.6 m drop; inflow
from the south, outlet north to Baskahegan Stream; mixed/hardwood forest, big wooded swamps, camps on Upper's S shore.
(3) Display: zooplankton specks faint and sparse (none below 3× fit) — 48630ba ("all the white dots… hard to see the fish").
DECIDED (human): "lets just model the real upper and lower hotbrook lake" — the sim's lake becomes Upper Hot Brook
(18 ft max, unstratified), the pond Lower Hot Brook (13 ft), the stream the 154 m connecting brook. The model now has
MEASURED beds (tools/hotbrook/soundings.py: the 1949 MDIFW soundings, 83 + 63, scans fitted to today's shore, median
misfit 18 m; means 3.05 / 2.67 m vs published 3.35 / 2.74), a depth chart, a cut-away, a dive and an aerial photo
(artifact v2; 0703fbb). Field notes (human): pumpkinseed AND REDBREAST sunfish at the brook's upper-mouth pool, a
shallow brook stretch and the cove between Upper's west points. MDIFW 1949 fish list adds fallfish, blacknose dace,
banded killifish (and no pumpkinseed — the human's catches win). The human offered photos (shores, brook, weed beds,
ice-fishing spots, fishing-app depth screenshots) — welcome when they come. The human asked if it stays the same
realistic evolving sim "at a larger scale": yes — same engine in the real geometry; 637 ha can't hold a brain per fish,
so the sim runs a section at real densities inside the full landscape (weather, inflow, ice, the brook can be whole).
STAGE A DONE (docs/HOT_BROOK_SIM.md; FEATURES "the real Hot Brook lakes, stage A"): the world is the real slice
(src/hotbrook_profile.js from tools/hotbrook/slice_profile.py; W 6507 × H 456; 271 × 19 cells), DEPTH_REF for
fraction-of-column parameters, mixing in metres + night convection (no summer stratification; inverse under ice), O₂ demand on
the whole bed (O2_SED 0.08, O2_PELAGIC 0.005: winter keeps 5–12 mg/L, hypoxic mud layer), save v33 (older refused), opening
view on Upper. Gate rewritten for the place: shape checks → the real proportions; stratification → "does not stratify" +
under-ice inverse; test fish in Upper's north basin WITH their partners beside them (a predator–prey pair split by 120 px
was the 9 "distance" fails); deep plants starve over days (5.5 m is just past pondweed's ~4.8-m limit at Secchi ~4 m);
hypoxia probe 10 fish × 4 days (a fish's swim rhythm hangs on its id, so whether it reaches the re-aerated surface was a
coin toss at 5 × 3); fry escape bar 0.85 (two 0.3-m rows cost ~1 larva in 10; without the escape a third die); the bass
littoral probe compares its turn with/without the drive (in a 5.5-m lake the drive rests: every bed is within a bass's
~7-m habitat, and cover/home depth take it shallow anyway). Perf ~175 steps/s, peak 174 agents.
FINDING for stage B: the slice stands for 2,224 m² (0.22 ha) → at the design census ~580 fish ≥ 7.5 cm. Current K (pop.max
× AREA_SCALE 5.76) vs real × slice: white perch 173 vs ~178, yellow perch 161 vs ~191, golden shiner 346 vs ~96, pumpkinseed
259 vs ~48 (+ redbreast ~16), bullhead 35 vs ~31, sucker 9 vs ~7, smallmouth 5 vs ~9, pickerel 3 vs ~4, fallfish — vs ~7.
RESEARCH DONE (docs/research_notes/Hot Brook populations and water/): no water-quality data for either lake (analogue
Baskahegan Lake: Secchi 3.8 m, colour 46, TP 10, chl 3.1, pH 6.6); watersheds 66 / 77 km², residence ~100 / 55 days (the
sim's through-flow assumes ~1 yr — fix in stage D's hydrograph); pumpkinseed IS on MDIFW's Upper list (2007); a state-
Threatened YELLOW LAMPMUSSEL record in SW Upper (hosts: white & yellow perch); fish target ~2,600 fish ≥ 7.5 cm/ha at ~100
kg/ha (Cassidy Lake MI census + per-species ranges); crayfish 0.5–1.5/m² (sim's 9 g/m² inside); elliptio 0.4–28/m² (Maine);
zooplankton ~50 µg dry/L, copepod-heavy (the sim's ~60 % Daphnia is high); benthos production at the sim's ~110–125 g wet/m²/yr
is at the upper bound. lakesofmaine.org (blocked to bots) holds Hot Brook WQ/plants/mussels — the human could look.
NEXT (stage B): real per-species densities in the slice (agent budget ~300–500: choose the slice's third dimension), the new
species (redbreast, fallfish, banded killifish & blacknose dace as schools), the zooplankton mix, Secchi/colour (step 4b).
THEN: design the land/shore/air in the slice (banks at both ends, the 2.5-D view, catchment hydrograph, snow
on ice, shore predators, wood, insects…) with a four-season walk-through, shown before coding. PARKED (still valid): larval
food for shiner/perch; step 4b coloured water (now also mechanism #2 of the shore report); angler-realism audit; stream step 5.
LOCAL SERVER: the human opens http://localhost:8000 in Chrome — it is down whenever the session's preview server is stopped;
"Synapse Reef.bat" starts their own (serve.mjs is localhost-only by design; their LAN IP won't work).

## (previous) NOW (2026-10-15, night) — MAINE CALENDAR + WINTER O₂ (re-base step 4a) DONE, branch `zoo-field` (save v32)

DONE: step 3 committed (70a3fbd, the Maine fish; backup synapse-reef_20261015_1447_maine-fish.zip). STEP 4a (FEATURES "Maine
re-base, part 3"): the MAINE CALENDAR — SEASON.TEMP_KNOTS → config `seasonalTemp(yf)` (monotone cubic, replaces the sine;
ice-out ~Apr 23, 15 °C ~May 25, 24 °C peak ~Jul 30, ice-on ~Dec 1, 208 days < 10 °C; simulated with weather: ice-out Apr
25–28, ice-on Nov 26–Dec 9); BIRD.SEASON [0.14, 0.76]; render tint follows it. WINTER O₂ — species `o2Ice` (Cooper &
Washburn 1946 natural winterkills) via world `lethalO2`: bullhead/shiner 0.2, pumpkinseed/perch/pickerel 0.35, white perch 0.5
(prior), sucker/smallmouth 0.8. Gate: calendar anchors; winterkill by species (sealed under ice at 0.25 mg/L: pumpkinseed,
perch, bass die; bullheads, shiners live); 13 checks that assumed the old warm calendar moved to Maine dates (June → July
spawning, April → May ice-out/frogs, etc.); the hypoxia check now uses 5 fish (a fish gasping at the re-aerated surface made
one fish's fate a coin toss).
VALIDATION (census.mjs 1–3 × 3 yr → verify/census_4a_s*): every species persists; fish 84–156 kg/ha (inside Maine's 60–150 but
one peak); white perch 21–55, pumpkinseed 21–160 (yearly recruit pulses), suckers spawn and recruit; SHINERS and YELLOW PERCH
end at 3–6 on every seed (immigrants hold them) — the open problem.
AUDIT (after 67640d8, seed 1; session scratchpad verify/deaths_4a_s1, ff_4a_s1, roster_perch_4a, roster_shiner_4a):
 - YELLOW PERCH adults are fine: 11 mature ripe fish of both sexes in late April spawn 5× after ice-out. The YOUNG fail: year 1
   hatched 11,196 → 12 alive by August, 0 recruits — ~9,400 'natural' (larval/juvenile M, worst while larvae stay small),
   830 starved, ~960 eaten (white perch 455, perch 313); larval feeding p only 0.17–0.27 in May–June (cold-water match–mismatch).
 - GOLDEN SHINERS: year 0 fine (~140 recruits); then eaten through autumn–winter mostly by WHITE PERCH (46 in 5 months) and perch,
   + winter starvation → 10 left by June, mostly immature at 10–11 cm age 1. Year 1 larvae (~40,000 hatched) STARVE at 0.5 cm,
   p 0.01–0.04 — they never find food (where are they spawned? the littoral? small-zooplankton/rotifer supply?).
 - Adults grow too big for Maine: perch 35 cm at age 6.5 (Maine adults ~20 cm), white perch avg ~240–400 g (Maine stunts) →
   many piscivorous white perch (Lpisc 15) — consistent with the sim's water still being eutrophic.
NEXT (agreed order): (a) larval food — what a newly hatched shiner/perch school can eat where it is spawned (fry feeding in
_stepFry/_feedFry; zooR = rotifers?; the littoral vs pelagic zooplankton; pumpkinseed fry succeed via their limnetic phase,
pelagicFry); (b) step 4b mesotrophic coloured water (slows adult growth → stunted white perch, fewer piscivores).
NEXT: (1) WHY SHINERS AND YELLOW PERCH DON'T REPLACE THEMSELVES — death audit by month and life stage (shiners fade steadily
from Dec through spring: 54 → 13 by May; perch 21 → 3–6 over 3 yr), deaths.mjs/fryfate.mjs/roster.mjs; suspects: winter
starvation/predation of small fish, white perch competition, perch spawning success (strands at 1–3.7 m; Maine perch spawn
7–12 °C right after ice-out), maturity. (2) Step 4b: coloured mesotrophic water (Secchi 2.5–4 m, colour-dominated light,
TP 10–20 µg/L) — its own slice (needs a calibrated nutrient mapping). (3) The ANGLER-REALISM habitat audit (research done:
docs/research_notes/Seasonal fish habitat use/). (4) Step 5 stream behaviour.

## (previous) NOW (2026-10-15, evening) — THE MAINE FISH (re-base step 3) DONE, branch `zoo-field` (save v32)

DONE: the landscape validation (3 seeds × 3 yr on 5c4e300: sunfish/perch hold; minnows collapsed — see the current fix
below); gate green on 730e9cb. STEP 3, THE MAINE FISH (FEATURES "Maine re-base, part 2"; commit "The Maine fish…"): golden
shiner (dace FB4; an OMNIVORE — on zooplankton alone it starved each late summer), pumpkinseed (bluegill FB4; snails past
Lsnail 8 cm; nests < 1 m — sp.nestD), yellow perch, WHITE SUCKER (key `sucker`, was trout), brown bullhead, WHITE PERCH
(key `whiteperch`, was carp; FB4 yellow perch — the striped bass rows starved it under the ice), SMALLMOUTH (Whitledge rows
via `bio.hot`, largemouth below `juvW` 30 g; crayfish 0.4 + `qCray`; refuge 1/rescue 2 — the default floor kept ~22 bass/ha),
CHAIN PICKEREL (FB4 pike as published — the × 0.7 starved it in winter; a resident). Art per species (checked in the browser).
LANDSCAPE FIX: fish drifted on the fields' through-flow across the whole lake → shiners (and fatheads before) were carried into
the pond's far end and starved; now the full current only in the stream (FLOW.LAKE_FRAC 3 %) + rheotaxis (MOTION.RHEO).
Save v32 (old carp/trout skipped). Diagnostics: census.mjs, habitat.mjs; deaths.mjs all species.
VALIDATION (census.mjs 1–3 × 3 yr, final settings → verify/census_maine5_s*): every species persists; ~85 → 110–170 kg/ha
(ABOVE the 60–150 target at times), WHITE PERCH the largest share (27–54 fish, 5–12 kg), pumpkinseed 46–85 (strong yearly
recruits), shiners recruit 110–230 young in year 0 and overwinter but dwindle to 3–7 by year 3 (immigrants top them up),
YELLOW PERCH 21 → 3–9 (a concern), suckers 3–8 (recruited in yr 1–2), bullheads 3–4, bass 2, pickerel 2 (immigrant-held).
KNOWN: total biomass and white perch dominance high, yellow perch and shiners declining — expected to move with step 4's cooler,
less productive Maine lake and with habitat partitioning (white perch offshore by day; shiners/perch in the shallows and on
the bed) — re-judge there. Big fish (bass, pickerel) can't form breeding pairs in a slice that holds 1–2: immigrants carry them.
NEXT: STEP 4 — the Maine calendar (patch ready: session scratchpad step4_calendar.py; prototype maineT.mjs — 208 days < 10 °C,
ice-out ~Apr 23, ice-on ~Dec 1, peak 24 °C Jul 30; it also moves BIRD.SEASON), then coloured mesotrophic water (Secchi 2.5–4 m,
TP 10–20 µg/L, colour-dominated light) and under-ice lethal O₂ per species (Cooper & Washburn: a winter floor), biomass
60–150 kg/ha; validate 3 seeds. Then the ANGLER-REALISM habitat audit (human: "perch holes… where to find bass… fishing and
ice fishing"; research done — docs/research_notes/Seasonal fish habitat use/: e.g. perch school by day over open bottom and
rest inshore at night, deep basin under ice; smallmouth motionless on traditional deep points in winter; pickerel within
~2 m of the surface all year; white perch 4–9 m by day, inshore at night; bullheads bury in winter; the sim's `zone` is a
FRACTION of the local column — real fish choose absolute depth and bottom type). Then step 5 (stream behaviour).
HUMAN NOTES (2026-10-15): a bass from another Maine lake had a crayfish in its stomach (→ smallmouth crayfish diet; Maine's
crayfish = native virile crayfish, 94 % of 1,061 stream sites — Marquis et al. 2009; ROADMAP).

## (previous) NOW (2026-10-15, later) — THE MAINE RE-BASE, branch `zoo-field` (gate green; save v31)

HUMAN (after the food-web slice): "yes it should all be tailored to new england and maine, add a shallow zone, maybe add a
pond next to it too, this can be the start and testing of the multi zones, with a stream or something between them. then
do the rest of the suggestions you gave me too, 3 4 and 5" (3 = recruitment compensation, 4 = New England species set,
5 = northern maturity). RESEARCH: docs/reports/Maine lakes ponds and streams.md (+ notes) — Hot Brook lakes are 5.5/4.0 m
mixed saucers (MDIFW); their fish: smallmouth, white perch, chain pickerel, yellow perch, bullhead, white sucker, fallfish,
dace, killifish (no sunfish listed — the human has seen sunfish in the stream's warm pools: unconfirmed, not refuted);
Maine fish 60–150 kg/ha; ice-out ~Apr 24, 208 days < 10 °C; compensation lives in the juvenile year.
DONE (committed): step 1 — juvenile compensation (FRY.JUV_*), maturation reaction norm (BIOE.PMRN_*), northern Lmat,
spawning migrations override foraging (44dab54; 3 seeds × 3.2 yr: recruitment every spring, sunfish cycle ~6–140, no
collapse). Step 2 — THE LANDSCAPE: lake (sloping 0–3 m littoral + 14.4 m hole) + stream + pond (FEATURES "Maine re-base,
part 1"); multi-basin wet mask; basin-aware placement; macrophyte zones in metres; save v31; camera/minimap/UI; fixes
(larvae above the surface broke exact resume; the anoxic-bed shoreward reflex tilted down).
Full gate re-confirmed green on 5c4e300 (189 steps/s). RUNNING at the end of the session: landscape validation —
`node test/diag/zooflux2.mjs <1|2|3> 3` and `fryfate.mjs 1 1.1` → session scratchpad verify/zf2_land_s*.txt, ff_land_s1.txt
(if lost, rerun them: ~40 min with 4 in parallel).
NEXT (in order): read/redo that landscape validation (expect differences: shallower lake, more littoral, the pond); step 3 — the MAINE SPECIES SET (minnow→golden shiner, sunfish→pumpkinseed, trout→white sucker,
carp→white perch, bass→smallmouth, pike→chain pickerel; keep yellow perch, bullhead — report table "Five of the eight
recommended species have no bioenergetics model of their own" and the ranked list; keys renamed with a save migration);
step 4 — Maine calendar (ice-out ~Apr 24, fast spring), coloured mesotrophic water, under-ice lethal O₂ (Cooper &
Washburn), biomass targets 60–150 kg/ha; step 5 — stream behaviour (sucker runs, warm-pool use emerging from thermal
preference, stream current); then multi-seed validation, docs, merge to science/main, backup.
HUMAN FIELD NOTES (2026-10-15, first-hand Hot Brook — also in memory hot-brook-field-observations): "all the sunfish are in the
stream between the lakes", pools 3–4 ft deep with lots of them; chain pickerel in the lake; lots of freshwater mussels. →
DONE + committed: STREAM.POOL_D 0.9 → 1.1 m (broader pools); MUSSEL.COUNT 22 → 44 (native eastern elliptio); the
through-flow carries the zooplankton fields down the outlet (lake → stream → pond); the trout-thermoregulation check now
starts its trout over the lake's deep water. Headless passed (perf relaxed, CPU shared); TODO: a full `npm test` on a quiet
CPU once the landscape validation runs finish (they started on 5c4e300, i.e. with the 0.9-m pools).
HUMAN (2026-10-15): put "plant species accurate to New England / Maine" on the roadmap → ROADMAP step 3 (done), with the
Maine re-base order and a native-mussel (unionid + glochidia on fish) item.
KNOWN: the stream is drawn as a thin channel in the side view (no banks); cover-seeking is weak against foraging (the
gate's cover check now isolates it); the shared default spawning ground (inflow side) may crowd nests.

## (previous) NOW (2026-10-15, end of the food-web session) — ZOOPLANKTON FIELDS + FOOD-WEB RECALIBRATION, branch `zoo-field` (gate green; save v30)

State: `zoo-field` pushed (00a3550 + the commit after it); NOT merged to science/main (main = bc2ddc8: the research doc + the
OLD particle model, whose lake "sustained" on an unlimited zooplankton subsidy). Gate `npm test` green (218 steps/s); browser
loads clean. What the slice does: FEATURES.md "2026-10-15 zooplankton fields and a food web recalibrated to real lakes".
Diagnostics in `test/diag/` (README): zooflux2, energy, fryfate, deaths, dietsp, autumn, sunbed, roster, yearling, zooonly.
HUMAN DIRECTION: "just make it how it actually is in the real environment, at least in New England, the ponds and lakes seem
to be sustaining".
WHAT MOVED THE LAKE (rounds 27–31): bed foraging (env.benthBest/qBed; young bottom foragers live on the bed); BENTHOS.G 0.16,
K_FISH 0.5; fry schools hunted across the arena; strikes slow in cold water; FRY.M_JUV_Q10 now also scales M_LARVA, below 20 °C
only (field rates in summer — the uncapped Q10 ran August at 1.7× and killed ~85 %/month); stochastic rounding of thinned
schools; FRY.ESCAPE (larvae leave anoxic water; 844/3,551 perch larvae had died in a thin anoxic layer); biomassByTrophic
always lists every level. Starvation is now rare; young-of-year reach spring (sunfish: ~120–140k hatched → ~300 in October →
~30 in March → ~10 recruits, plus 13–37 in good years; field: egg→Oct 1–9 %, overwinter loss 10–90 %).
RESULT — NOT YET SELF-SUSTAINING over 3–4 years: r30/r31 (3 seeds × 3–4 yr, verify/zf2_final_s*, zf2_r31_s*): sunfish 50 →
20–40 by yr 2, then recruit pulses (+5…+37 a spring) that die back over summer; 2 of 3 seeds reach the refuge floor (3) by
yr 3–4; perch 22 → 4–11 (breeding from yr 2); minnows 2–200 (boom/bust); bass 3, carp 3–4, bullheads 3 hold. WHY (roster.mjs
seed 2, June yr 3: ONE old male + 21 immature yearlings — no spawning that year): yearlings grow ~1 %/day on the FB4 bluegill
sets (checked identical to the official FB4 table), 3–5 cm → 3–6 cm over a summer, so a cohort needs 2–3 summers to reach
Lmat 11 cm while ~50 %/yr of all sunfish die (background M_OTHER + bass/loon/pike/perch), and recruitment (~10–30/yr) doesn't
compensate when adults are few — the YOY mortality is density-independent (no stock–recruitment compensation).
DECISIONS FOR THE HUMAN (ask before the next slice): (1) BATHYMETRY: add the 0–3 m littoral zone real New England ponds have
(BASIN.SHELF_Y 0.25 → a sloping shore) — most littoral food, the nests, the weed refuge for small sunfish; touches plants,
light, heat; its own slice. (2) OPEN OR CLOSED SLICE: is the 0.07-ha world a whole small pond (closed) or a transect of a
bigger lake (fish move in/out with the rest of the lake — pike/trout already do as visitors)? (3) COMPENSATION: add the
standard stock–recruitment mechanism (YOY mortality rising with YOY density — Beverton–Holt; predators switching off scarce
young) — widely supported, though the one Oneida study found larval mortality density-independent. (4) Species set for New
England (carp ~95 kg/ha here are atypical; chain pickerel vs pike; golden shiner, white sucker absent). (5) Lmat 11 cm for
bluegill is the high end (populations mature at ~7.5–12 cm).
NEXT: get the human's calls on (1)–(3); then either merge zoo-field as is (more realistic food web, weaker persistence than
main's old subsidised model) or finish persistence first. Backup zip after the merge.

▶▶▶ (history) ZOOPLANKTON FIELDS → WHOLE FOOD-WEB RECALIBRATION, branch `zoo-field` (not merged; science = main
= bc2ddc8 has docs/ECOLOGY_RESEARCH.md + docs/research_notes/). HUMAN DIRECTION (mid-slice): "just make it how it actually is in
the real environment, at least in New England, the ponds and lakes seem to be sustaining" → the target is a SELF-SUSTAINING lake
on real numbers; also: winter zooplankton are resting eggs (done: egg bank); sunfish pool in warm stream pools between lakes in
summer (Upper/Lower Hot Brook Lake, Maine) → research item added to ROADMAP's landscape step.
BUILT (see config PLANKTON comments): zooplankton = env.zooD/zooC g wet per cell (1 g/cell ≈ 40 µg dry/L; WORLD.PX_PER_M 79,
SLICE_M2 700); growth G_D 0.6 / G_C 0.3 × Q10 (3.0/2.7) × Holling (K_D 0.15 < K_C 0.2: Daphnia win on food), losses × Q10_L 2;
Daphnia warmth ramp + heat fall-off; type-II grazing returning N+P; anoxia; DAILY ROUND (oxic column, weighted by algae + FOOD0;
MIX) + HMIX horizontal mixing; DVM as a daily-mean exposure (TWILIGHT, DVM cost; the diel clock is cosmetic — never tie
physiology to it); RESTING-EGG BANK env.zooEgg (autumn dormancy, spring hatch); env.zooFeed: adults TYPE III (prey switching,
K_ADULT 60, `sig`), fry type II (K_FRY 30; FRY_DAPH_MIN 0.3; FRY_COPE 0.5); COPE_ESCAPE 0.5; larval Cmax × FRY.CMAX_LARVA 1.5;
FRY.M_LARVA 0.02 → 0.08 (field larval Z, mostly unsimulated predators); founders cut (sunfish start 16, perch 7, catfish 2.5,
carp 0.45: 513 → 376 kg/ha); render specks; UI µg/L + kg + eggs; save v30. Diagnostics (scratchpad verify/): zooflux2.mjs
(half-monthly zoo budget + fish census), energy.mjs (whole-lake audit: productions, agents' diet by food, fry's zoo),
fryfate.mjs, fryprobe.mjs, sunprobe.mjs, biomass.mjs. env.zooProd and world._larvaProd are DIAGNOSTIC tallies (never read).
FINDINGS: the OLD model fed the fish ~10–13 kg/month of zooplankton in summer and 3–5 under the ice (≈75 % of their diet) —
an unlimited subsidy that hid a BENTHOS DEFICIT (larvae production ~35 g/m²/yr vs Quinte zoobenthos ~125; sim lacks
oligochaetes/amphipods; deep bed anoxic all summer, no profundal chironomids). New model, year 1: zoo production 96–127
g/m²/yr ✓, adults' diet ~50 % benthic ✓, but fry (2–4× too many, ~1 % eaten — real larvae die mostly to predators) ate 8–10
kg/month Jun–Jul, stripped the zooplankton by August → adults starved over winter (sunfish 100 → 3). Rounds 9–14 (verify/zf2_r*, en_r*, dietsp_r*): M_LARVA 0.08; benthic production up (SEDOM.PERI_G 110 → 180, INSECT.YIELD
0.15 → 0.25); minnow founders 45 → 20; NEW BENTHOS pool (the bed's worms and scuds, env.benth per column, Quinte oligochaetes +
amphipods; fish feed within BENTHOS.REACH of the bed; save v30; 4 gate checks); K_ADULT back to 25 (type III); founders sunfish
12, perch 5; zoo upkeep R_D 0.12 / R_C 0.06 (food thresholds ≈ Boersma & Kreutzer; verify/zooonly.mjs — a zooplankton-only harness
with prescribed predation, a year a minute — gives a realistic year: summer 50–170 µg/L, July clear water, Nov pulse, winter
12–17 µg/L of copepods, Daphnia ~0); FRY_COPE 0.3; APEX DENSITY (research priority 5): pike 1 founder (K≈2), bass 3 (K≈4), carp 2,
trout 2 (the founders test now accepts one ripe female for a single-founder visitor). Per-species audit (dietsp.mjs) showed
sunfish eat 2–3.6 %bw/day (≈ break-even), but 2 pike + 5 bass ate ~0.5 kg of small fish a month, and 2.6 kg of trout ate 3 kg
of June zooplankton. Rounds 14–20: death ledger (verify/deaths.mjs) — adult sunfish die of STARVATION Aug–Oct after the July
zooplankton crash; minnows eaten Jun–Jul then starve; then NO RECRUITMENT (year-1 YOY all dead by October; year-2 adults spawn
late/little). Fixes in order: zoo upkeep R_D 0.08 / R_C 0.05 (the algae-unit → mg C mapping is uncertain ~2×); Daphnia SHORE
AVOIDANCE (PLANKTON.SHORE: pelagic Daphnia lean to deep columns, Siebeck 1980 — the deep refuge no longer leaks into the fish-
crowded shallows); founders sunfish 8, perch 3.5, catfish 1.5 (260 kg/ha), BENTHOS.REFUGE 3 g/m² (exclusion studies);
FRY.M_JUV 0.035/day × Q10 3 (juvenile predation, Irwin et al. 2009); sunfish pelagicFry/benthL 1.8 cm; sunfish nestGuard
yr(0.03) → yr(0.005) (bluegill fry leave the nest at swim-up — Beard 1982; held at the nest 84 % died); larval-fish prey
exempt from DVM (zooFeed dvm=false for fry: DVM is size-dependent); ROTIFERS & NAUPLII field env.zooR (G_R 1.0, M2_R 0.3
density-dependent invertebrate predation, Daphnia interference; fry-only food, FRY_ROT_L) — save v30 fields D/C/R + eggs +
benth. Harness (zooonly.mjs, prescribed predation) now gives summer 120–235, winter 26–45 µg/L, rotifers 0–34. NOTE the zoo
diagnostics' 'algae' column was an instantaneous snapshot at a drifting time of day (the "July algae trough" was night
readings) — zooflux2 now averages it. Round 20 running (3 seeds × 2 yr + ff_r20 fryfate). Tunables to revisit: K_ADULT,
FRY.CMAX_LARVA, M_LARVA, founders; species set (Midwest vs New England natives) and slice scale for big fish = human's call.
LESSONS: memory research-to-design;
diagnostic wrappers must forward ALL arguments (a dropped arg silently disabled type III in one round).
ROUNDS 21–26 (2026-10-15, later; pushed WIP fea9089, then uncommitted): PLANKTON.Q 1.0 (Q 0.5 starved adults amid plenty — FB4
bluegill on Daphnia breaks even at p ≈ 0.52 at 20 °C); the APPETITE (gEff/gmax) scales feeding rates; adult carp/bullheads eat
zooplankton only below Lzoo; bass sHatch 0.1 (Carbine ~5,650 fry/nest), carp sHatch 0.005 (sunfish eat carp eggs — Bajer &
Sorensen); founders carp 0.45, minnow 8; VISITORS (sp.pop.visit {stay, gap} days: pike 20/60, trout 30/60 — a wide-ranging fish
leaves the 0.07-ha slice and another comes; exempt from REFUGE; gate block) — a RESIDENT 3-kg pike ate ~25 sunfish+perch/yr.
r25 (visitors): predation no longer the killer; STARVATION is — every seed declines (sunfish 50 → 3–6, perch 22 → 4–8 by yr 2;
survivors fat K 0.93–0.96 → density-dependent food limit, not a broken rule). Chain: YOY peak ~1.5 kg (≈210 kg/ha) in late July
strips the zooplankton (to 5–10 µg/L Sep–Nov; realistic for a strong year class) → adults + YOY need the bed, but the 3.6-m
shelf (the lake has NO 0–3 m zone: BASIN.SHELF_Y 0.25) holds only ~1 g/m² of worms/scuds and ~0.2 of larvae above refuge,
and the deep basin's 9–10 g/m² sits under anoxic water till late-Oct turnover; agents get ~3 % of food as fish (real 10–15 %:
a predator meets a fry school only by swimming into its point — bass 16 % of samples within reach, 43 % within the hunting
arena). Year totals (verify/energy.mjs, now with worms+scuds production env.benthProd — DIAGNOSTIC): zoo 242–260 g/m²/yr ✓
(Quinte 240), larvae 35–39, worms+scuds 39 → zoobenthos ~78 vs Quinte ~125; fish 240 kg/ha vs Quinte 165 → bed food per fish
~0.4× Quinte. r26: BED-FOOD SENSE (env.benthBest / world.qBed: the richest bed in sight above the refuge with breathable water;
sunfish, perch, bullhead, carp `food` target; BENTHOS.SENSE_MIN 0.5 g/m²) — helps one seed (s2 sunfish 31 in yr-2 June),
not the others. Experiments running (verify/x_*): no carp; BENTHOS.G 0.16/d; K_FISH 0.5 (SET supports SP.* and "/d" rates via
verify/ovr.mjs). Candidate next levers: fry-school encounters across the hunting arena (YOY → predators), YOY to the bed after
the limnetic phase (env.benthBest for schools), FB4 below-6 °C cost (Wright et al. 1999 −16 %).

▶▶▶ HUMAN (2026-10-14 evening, before compaction): "we need compact first and maybe you should do some more research on how the
ecosystem and bass and zooplankton and everything work in a real environment, after we compact though". → RESUME HERE: a
thorough RESEARCH pass (literature, real numbers) BEFORE more code: zooplankton dynamics (standing stock mg/L, P/B by
temperature, Daphnia vs copepods, diel vertical migration and other refuges, the clear-water phase, fish predation's real
share of production), fish–zooplankton coupling (planktivore consumption rates and field p values, larval/YOY fish food
needs and survival, critical period, density dependence), largemouth bass life history (spawning timing/temperature and
condition, nest guarding, fry balls, YOY diet shifts zoo → insects → fish, first-summer growth and survival, adult diet and
consumption in bluegill lakes), and whole-lake energy flow (fish biomass kg/ha, production, trophic transfer). Write the
findings up (a research doc, e.g. docs/ECOLOGY_RESEARCH.md) with sources, compare to the sim's numbers, THEN plan the
zooplankton/apex slice. (Parallel research agents are fine — usage limit lifted.)

## ▶ NOW (2026-10-14 evening) — state: main = science = 13be2b9 (+ this note); gate green; backup G:synapse-reef-backupssynapse-reef_20261014_1626_snails-limnetic.zip
Phase 1 is done as far as it goes without the ZOOPLANKTON slice (below). Next per the human's plan: (2) the GUI / graphics /
webpage information / graphs review — unless the human prefers to do the zooplankton slice first.
ZOOPLANKTON (parked on branch `zoo-growth-wip`, pushed, NOT merged): the current model refills swarms at full size up to the
cap at a rate ∝ algae (production ~10–17 kg/month in summer; fish eat 10–13, fry 2–5 — verify/zooflux.mjs, zf_base_s*.txt),
i.e. production does not follow zooplankton biomass. A growth model (swarms grow 0.4/day Daphnia, 0.15 copepods at 20 °C ×
Q10 2.5 × Holling on edible algae, invertebrate loss, starvation, splitting, resting-egg hatch, grazing per gram) collapsed
the standing stock to ~0.5–1.2 kg and production to 1–5 kg/month (fish lose ~2/3 of their zooplankton); swarm refuges (fish
0.6 g, fry 0.1 g) made it worse (fry keep every swarm tiny, fish get ~nothing). Real lakes hold 1.5–3 mg/L (~5–15 kg here)
with P/B 0.1–0.4/day. A proper slice needs: a higher standing stock (more grams per swarm / a 2-D density field), a refuge
that works for fish AND fry (DVM by depth/light, not per-swarm grams), and re-calibrating the planktivores (sunfish p 0.6–0.9
now vs field 0.3–0.5). It is the root of bass recruitment failure (fry starve) — see the APEX CHAIN note below.

## ▶ NOW (2026-10-14, session 6) — THE BED'S ORGANIC LAYER (216237a, merged) + VISIBLE EVOLUTION (merged, save v29)
Plan order (human, 2026-10-14; also in ROADMAP "Agreed plan"): (1) implement + accurate (this; then pike yr-2, perch
growth; then VISIBLE EVOLUTION), (2) GUI/graphics/info/graphs review, (3) multi-lake + streams/rivers/ponds WITH a water
budget/level, rain lenses, inflow plunging, sediment erosion/transport/deposition, drift (human notes 2026-10-14), (4) what-if.
Done this session:
- Far-zoom wildlife silhouettes (render.js `_drawWildlife`): turtles were rectangles at lake view (human report) → domed
  shell + head; frogs/tadpoles/nymphs ellipses. Verified by drawing them large into a debug canvas.
- SEDOM (save v28): `env.sedOM` g/column; in = SINK 0.25 × algal decay (all three algae, per column `_colDecay`) × PP_G 60
  + benthic algae PERI_G 110 × bed light × Q10 + plant litter (PLANT.LITTER_G 6 g/px shed) + expired particles; out =
  decomposition (0.144/d @20 °C, Q10 1.94, ×0.3 anoxic), larvae, sifting fish (SEDOM.SIFT). Carbon only (N/P untouched).
  Calibration (verify/somflux.mjs, somflux2.mjs, peri.mjs): baseline larvae were refilled at ~9,600 full patches/month and
  fish ate ~9.5 kg/month of them (~150 g/m²/yr — top of the real range, and blind to productivity); algae dying ≈ 24k
  field units/yr; plants shed ~40k px/yr (spring-heavy churn); shallow columns' bed light×Q10 ≈ 45 s-equivalents/yr.
- Larvae: grow on the column's layer (GROW, K_SOM 150, YIELD 0.15, RESP), real development (26 d @20 °C, local water
  temperature), anoxic die-off, new patches small (LARVA_M0 0.3), emerging adults keep 0.6 of the mass; REFUGE_M 1.0 g per
  patch out of reach of fish/fry/nymphs/turtles (`larvaFree`, `_biteLarva`; nymphs/turtles now bite, not kill a patch).
  Tuning trail: refuge 0.3 → fish held every patch on its floor (production ~15 g/m²/yr); no benthic algae → the shallows'
  layer was eaten out by July; GROW 0.2 → patches only tripled before emerging, fish got 0.1–0.3 kg/month above the refuge.
- Env panel: "bed detritus" (kg). Gate: 6 new checks (decay/settling, benthic algae, larval growth/starvation, sifting,
  save v28) + the dev-with-warmth and dt-independence checks updated.
VALIDATION round 4 (GROW 0.3; verify/sf4_s*, so4_s*): benthos steady (larvae ~3 kg/month produced in summer, fish
1–2.3 kg/month direct + the hatch) BUT by 2.2 yr fish biomass 12–13 kg (baseline c5 15–23), perch 6–12 fish (14–46),
bullhead and carp at the immigrant floor (b 0–1): bullheads slowly STARVED on the bed's poor detritus (23 → 3; K 0.73–0.83).
Their sim diets were narrower than real (Scott & Crossman 1973: bullheads — larvae, molluscs, crustaceans incl.
cladocerans, crayfish, fish, weed; carp — larvae, molluscs, zooplankton, weed). → ROUND 5: catfish diet + snail +
plankton, carp + plankton; also ANOX_DEATH 0.05/day @20 °C × Q10 2 (cold anoxia slow): carp home-bred again, perch
5–9 (adult starvation 16–26 vs baseline 6–10). ROUND 6 (YIELD 0.2): no clear gain → kept 0.15. ROUND 7 (FINAL): larvae
settle only on an oxic bed + LARVA_CAP 240 → 400 (the count had sat ON the cap all summer): at 2.2 yr fish 12–17 kg,
perch 10–25 (b 19–48), carp 3–6 home-bred, sunfish 169–260, minnows 75–300, bullheads 3–4 (b 0–1), bass/pike immigrant.
Gate GREEN standalone (gate27: all checks, smoke, UI, serve; perf 87 st/s) after moving the dev-with-warmth test larva to an
oxic shallow bed (on the deep bed it could die in anoxia — RNG-fragile).
OPEN (next accuracy items): bullhead recruitment (0–1 home-bred in 2 yr: a clutch is right — ~2,500–3,900 eggs × sHatch
0.6 — but ~90 % of the fry are gone by early July (yf 0.34: 9–12 schools × 14–18, p 0.5–0.7) and ~all by mid-August; real
bullheads guard their fry balls for weeks — look at fry feeding (zoo, larvae above the refuge, detritus particles) and
guarding/predation; baseline c5 had 3–5 recruits), pike summer feeding (pikediag: ~2 takeable
fish in its arena but kills drop 80 → 17 per 45 days Jun → Sep at 23–26 °C > pike's 21 °C optimum — partly real),
perch age-2/3 growth still above Michigan means (founders), snails' 34-day life (real ~1 yr) and they could graze the
bed's benthic algae (SEDOM) instead of the phyto field.
Pike (round 4): 4–7 immigrant pike STARVED per run, year-2 p mostly 0.1–0.3 despite 180–270 small sunfish + ~100 minnows
(FEED.PREY_MIN 0.07: a 65-cm pike ignores fish < 4.6 cm; sunfish mean 5–7 cm) — NEXT diagnostic (verify/hunt.mjs-style).
VISIBLE EVOLUTION — built on branch `evo-history` (92a0b4d, 96243fc, 6ab3e4d), MERGED into science after 216237a (save v29):
world.evo trait history (EVO, sampled on the clock grid, thinned past MAX, saved) + Evolution-over-time chart (gene selector,
species pick, note) + fast-forward "Skip ahead" in a module Worker (src/ffworker.js; byte-identical to main-thread steps,
checked in Chrome; smoke runs the real worker behind a stub). Gate checks: sampling grid/values, thinning + round trip, FF smoke.
AFTER THE MERGE (committed): BULLHEAD RECRUITMENT FIX — verify/fryfate.mjs showed ~85 % of bullhead
fry STARVE by July at 1.0–1.6 cm (p 0.2–0.3), in the OLD code too (not the diet change: fryfate_nozoo / fryfate_base) —
no young fish could take bottom food before FRY.BENTH_L 2.5 cm. → species `benthL` (bullhead 1.2 cm: guarded fry balls
feed on the bottom from swim-up) + INSECT.REFUGE_FRY 0.05 g (fry pick small instars; the 1-g fish refuge hid them):
fry p ~0.4, ~140/clutch reach July, 10–12 recruits/yr/seed (was 0–1). Gate check added; the sifting check now clears
nymphs/plants (a nymph eaten by RNG luck had broken it). Evolution chart: scale from species with ≥ 5 fish, few-fish
lines dashed + clipped (real 2-yr history: trout/pike/bass means jump with each immigrant). FF worker yields via
MessageChannel (e1138bc). Embedded preview pane steps ~48 st/s (main thread too) — judge FF speed in real Chrome.
Round 8 (3 × 2.2 yr): bullheads 12–15 home-bred, 0 immigrants; carp home-bred; perch 5–20 (next). Gate GREEN (gate30, 92 st/s).
PERCH (diagnosed, verify/fryfate.mjs on new vs old code, 1.6 yr): egg-to-recruit survival is UNCHANGED (old 0.35 %, new
0.17–0.44 %); the old lake simply had more spawners (20.8k hatched vs 7–14k). The 100 founders (~7 kg) exceed what a lake
with real benthic production feeds; perch biomass relaxes to 0.4–2.8 kg at 2.2 yr ≈ 6–40 kg/ha (real yellow perch
10–50 kg/ha) — realistic, not a defect. LENGTH-AT-AGE now (round 7/8, mid-Aug yr 1.45) vs Michigan means: sunfish
4.2–5.2 / 9.3–10.9 / 12.3–13.3 / 14.6–15.3 / 16.5–17.1 (vb 4.4 9.2 12.8 15.4 17.4 — excellent); perch age 4–5 20.4–25.6 (vb
20.2/22.9), age 2–3 17–23 (vb 12.9/16.9; those are founders seeded at their age's vb length, then a fast first summer);
bass 29–35 at 4–5 (vb 28.5/32.9); bullhead ~10 % under. The old 'perch grow too fast' item is mostly resolved.
SESSION 7 (2026-10-14 afternoon, "keep going"): SNAILS reworked (uncommitted until round 9 + gate): annual life (M 1.2/yr),
warm-season per-capita breeding (R 6/yr, R_T 12–20 °C, young settle where the bed layer feeds them), graze the bed's SEDOM
layer (~1 mg AFDW/day each × Q10 2) instead of the phyto field, CAP 900×area (~3 g/m²), lit littoral bed only (MAX_DEPTH
0.5 H), a WEED REFUGE (0.12 × CAP out of reach — without it 324 crayfish + ~200 sunfish ate 2,025 seeded snails down to 521
in 13 s; pumpkinseed/crayfish do strip snails in real lakes, the weeds keep a stock). Gate snail checks rewritten.
APEX CHAIN — the main open accuracy item (diagnosed, NOT fixed): (1) adult bass are underfed (summer p 0.17–0.4) → spring
condition K 0.70–0.80 < SPAWN.K_READY 0.8 → they skip spawning most years (year 2 of round 8: 1 of 3 seeds spawned; same in
the old code); (2) when they do spawn, ~all bass fry STARVE at 1.1–1.5 cm (verify/fryfate.mjs: 8.6–9.6k of 11.6k by July, in
old and new code) — they compete for zooplankton with ~260k sunfish fry; NOT fixed by letting guarded fry roam
(fryfate_roam: 52 vs 6 alive in July) nor by a 60-px school reach (fryfate_eatr: no change). Real bass get a head start
(spawn at 15–18 °C, sunfish at 20+) — in year 1 the lake opens mid-May at ~17 °C so both spawn together (confounds year-1
tests; judge in year 2+). Next: bass/pike adult feeding (the p ~0.2–0.4 gap), then zooplankton production vs fry demand
(a zooplankton P/B model by temperature + littoral production), then re-test bass recruitment.
  FURTHER (same session): bass/pike diag (verify/preddiag.mjs <seed> <yrs> <species>): bass sit 90–100 % littoral, guts 6–19 %
  full; ~1–1.6 takeable fish in the arena (1.6–2.6 adult bluegill too deep for the gape — real), fish a small share of their
  food (crayfish + frogs/tadpoles dominate), young-of-year ~nothing — because YOY sunfish stay 0.6–1.4 cm all summer (starving).
  Fry maintenance vs Cmax (23 °C): bass (FB4 LMB, also the bullhead YOY stand-in) 0.32 g/g/day = 26–45 % of Cmax at 1.2–2 cm;
  bluegill/perch 0.10 (11–26 %). June zooplankton ~600/2025 swarms: fish + ~300k fry eat ~1.3 kg/day ≈ all the field makes
  (real ~2–7 kg/day) → THE NEXT ACCURACY SLICE: zooplankton production (biomass growth, P/B by temperature/food, littoral
  production, the cap a computing bound — as done for the larvae). ADDED: bluegill LIMNETIC PHASE (sp.pelagicFry 2.5 cm,
  Werner 1967/69): YOY sunfish 1.7–2.3 cm by Oct (was 1.2–1.8); bass fry unchanged. Round 9 (snails): fish 11.5–16 kg, perch
  12–31 (b 48–61), bullhead/carp home-bred, snails ~730 summer / ~400 late winter. Round 10 (+limnetic): so10_s*.txt. Pike: summer kills drop with
heat (23–26 °C > 21 °C opt — partly real); founders' perch growth is a transient.
(older list) REMAINING Phase-1 items: pike summer feeding (pikediag), founder seeding of age-1/2 perch, snails' 34-day life (now done).
NEXT: (a) look at the merged UI in the browser (bed detritus row, Evolution chart with a REAL multi-year history — run
Skip ahead 1–5 years), (b) the OPEN accuracy items above (bullhead recruitment, pike summer feeding, perch growth, snails),
then (2) the GUI/graphics/info/graphs review.

## ▶ (older) NOW — after the 2026-10-11/12 overnight audit-fix run

**New mandate (human, 2026-10-12 morning):** "fix everything, do what you think would be good, take screenshots
to analyze the GUI and everything yourself, keep everything updated in case chat compacts." The budget rule
still applies: no subagents.

**TOP PRIORITY (human, 2026-10-12):** "it's supposed to be a good visual like a screensaver, especially full
screen — make sure the visuals are good, high resolution, that even zoomed out you can see things, that it all
flows and acts real and that it's polished."

Screensaver plan:
- [x] Zoomed-out visibility (`8dd6471`): 91% of fish were 2-px dots at the overview. They're now oriented fish glyphs
      with a screen-scaled minimum length, plus a moonlight floor so nights aren't black.
- [x] Resolution: sprite tiers 14/28/56 px per unit. A 1080p close-up was a 2.5–7.7× upscale; now it's ≤~2×.
      ImageData rasterizer: tier builds cost 2.1 / 6.7 ms. GL textures are freed on sprite eviction.
- [x] Flow: glyph→sprite switch happens at an equal on-screen length (no pop). New tour mixes wide, habitat and
      follow shots, with slow cinematic easing and pull-back-then-push-in travel.
- [x] Fullscreen polish: the chrome and cursor fade after 3.5 s idle and come back on any input. Also: sediment
      texture on the bed, and dawn warmth fades with view depth (deep close-ups no longer turn muddy brown).

**▶ REALISM OVERHAUL IN PROGRESS (human, 2026-10-12: "do it all" → "make everything realistic, like you said earlier
what wasn't").** Baseline diagnostic (scratchpad `verify/recruit.mjs`, 3 seeds × 1 yr, pre-overhaul): sexual births
≈ 0 for every species but minnow (bass 0/228, pike 0/164 — all "home-bred" young were ASEXUAL BUDS of immigrant
adults); no juvenile bass/pike reached maturity; most large-fish adults STARVE (reserve lasts ~25 s: drain 0.045/s vs
cap ~1.35); no satiation (predators kill when full); K pyramid inverted (bass 88 / pike 40 vs minnow 202); climate wrong
(surface 22 °C on Mar 1, 31 °C peak Jun 1, never below 13 °C, no ice; strat = sin(year)). Phases, commit each green:
- R1 climate: T = 12.5 + 13·sin(2π(yf − 0.17)) (peak ~Aug 1, ~0–1 °C Jan), winter ICE (light ↓, no reaeration, no wind
  mixing → winter O₂ sag), hypolimnion floor 4 °C, stratification from the surface–deep temperature difference, seasonal
  day length/irradiance, asymmetric fish thermal stress (heat lethal; cold slows, Q10 metabolism).
- R2 energetics + life history: starvation times ~150 s (minnow) … ~400 s (pike) ∝ size^0.75; eat only when hungry;
  multi-year lives (minnow mature 0.5 yr / max 2.5 yr … carp 2 / 12 yr); temperature-triggered spawning windows (pike
  ~ice-out, perch spring, bass/carp late spring, sunfish/minnow repeat spawners in summer, catfish early summer); NO
  budding; K pyramid (minnow ≫ sunfish/perch ≫ catfish/carp/bass ≫ pike); initial multi-age population.
- R3 young fish: nest guarding (bass, sunfish, catfish), nursery cover, all fry eat zooplankton first.
- R4 immigrants from a regional gene pool (gene flow), not mutated copies of the lake's best (IMMIGRATION.FROM_BEST).
- R5 plants spread by rhizome runners (+ seeds), diatom spring bloom group, N-fixation by cyanobacteria.
- R6 new life: yellow perch, a fish-eating diving bird (loon: hunts underwater, fits the side view), then more.
- R7 multi-seed balance, docs, visuals. Judge with `verify/recruit.mjs` (births sexual vs budded, immigrants, deaths
  by cause juvenile/adult) over ≥3 seeds and ≥2 years.

**▶▶▶ PHASE 1 — session 4 (2026-10-13 afternoon): the food web around the bioenergetics. Branch `science`; main still
1a3c416 (green). Full gate GREEN on `science` (headless ALL PASS, perf ~80–100 st/s under load; smoke/ui/serve OK).**
Session-4 changes (all in FEATURES "2026-10-13 bioenergetics", rewritten):
- YOUNG-OF-YEAR = SUPER-INDIVIDUAL schools (Scheffer 1995) through their first year (not recruited at 2–4 cm as before —
  that threw away ~93 % of the young-of-year biomass predators should eat): feed zoo → benthos/detritus (FRY.BENTH_L) →
  other schools (young pike/bass), seek food, avoid hypoxia/heat, breathe O₂ (env), staggered FRY.TICK updates; SCRAMBLE
  competition (unfed share starves over its reserve time — physiological); larval respiration floor FRY.R_WMIN (FB4 W^RB
  overstates larval metabolism ~4×); recruit at L0 (now late-YOY lengths) or as yearlings in spring, within pop.max;
  slots CAP/SP_SHARE + MERGE_DAYS merging; piscivores eat schools in BOUTS (FRY.ATTACK 100 × capture × vuln, type-II in
  school size FRY.N_HALF; FEED.SCHOOL_MIN). Spawning no longer logistic-gated (density acts on the young); stats.spawns.
- Optimal-foraging diet order; POOR food (detritus/algae/plants) only as filler (FEED.POOR_GUT 0.15) — sunfish were
  starving at full ration on a gut of weed. Innate FORAGE reflex + animal-first food senses (carp/catfish/sunfish).
  Epiphytic larvae on macrophytes (INSECT.EPIPHYTE). Bass eat larvae; pike Lzoo 5; YOY bullheads borrow FB4 bass set.
- Activity cost on the ~1-day mean speed (`ua`), never below FB4 routine, SWIM 3→2 (Brett: ~4× routine at Ucrit).
- Hypoxia: graded CLIMB out of sub-critical water + escape burst that overrides diel rest/cold (catfish were dying on
  the anoxic bed cell). Starvation hazard K99 0.75→0.68, K_HAZARD 0.78 (K is W/Ws75; 0.8 is lean, not dying).
- PREY VULNERABILITY (BIO vuln: fathead 1, bluegill 0.35, bullhead 0.4, perch/bass 0.6 … Wahl & Stein 1988) — the single
  biggest community fix: pike were eating ~5 kg/yr of adult bluegill; now soft-rayed prey take the pressure.
- Founders: stable age structure (e^−M·age), first two of each species a ripe adult F+M pair; immigrants ripe. Pike
  refuge/rescue 1 (a ~0.07-ha slice holds ~1 pike at real densities), trout 1/2. Spawning migration is purposeful.
- Fathead batch spawning every ~4 d, reproAlloc 0.8. Juvenile FB4 sets only in the first year. UI shows meals again.
- Then (same session): PATCH RESIDENCE (FEED.RESIDE/RESIDE_T, saved `ft`) — a forager stays in the patch it's feeding in;
  gut EVACUATION never slower than a full stomach needs to pass Cmax (small fish on small prey); schools forage no better
  than single fish (FRY.EAT_R 40→24); young pike/bass eat insect larvae until 3× Lpisc; METABOLIC DEPRESSION under food
  deprivation (BIOE.K_DEPRESS 0.9, STARVE_DEPRESS 0.3 — Méndez & Wieser 1993) so lean summers stunt instead of starving.
Validation (scratchpad verify/: bioe_run2.mjs <seed> <yrs> — census, biomass, p, K, diet by source, deaths juvenile|
adult, YOY schools, mid-August length-at-age; webdiag.mjs — predation matrix; supply2.mjs — zooplankton made/eaten/died;
alone.mjs, yoygrow.mjs, bassyoy*.mjs, pdist.mjs, yearling*.mjs). Latest (y13, 3 seeds × 3 yr): every year sunfish recruit
~120–280 yearlings in spring that thin to ~30–40 by winter (now mostly predation + other, little starvation), 10–28 adults;
minnows 70–390 (most numerous, ~0.5–0.9 kg); perch 11–51 with home-bred recruits most years (~5–9 kg — the biggest
biomass, adults 25–30 cm, faster than Michigan means at these low densities); pike 1, bass 2–3, trout 2, carp 3,
catfish 2–9 mostly immigrant-held (carp/catfish recruit a few); total fish 13–23 kg + YOY. Gate green; perf 80–84 st/s
standalone (YOY schools cost ~30 %).
Still open: bass/catfish nests rarely produce recruits (larvae starve at swim-up near the nest, then perch eat the rest);
sunfish adults dwindle slowly (yearling mortality ~80 %/yr); minnow numbers high; browser visual check of YOY rendering
at full size; perf headroom.
- Then (session 4, later): eggs/nests in the LITTORAL (SPAWN.SHALLOWS — nests had landed on the anoxic deep bed);
  guarded broods forage within BROOD.GUARD_R of the nest; LITTORAL zooplankton among the weeds (PLANKTON.LITTORAL_RATE 15,
  fed by periphyton — survives the clear-water crash); big piscivores (> 3× Lpisc) skip insects/larvae (`bugs`); young
  pike/bass eat larvae (insectEater); perch Lzoo 25; HEAT ESCAPE reflex (within 3 °C of UILT: down if cooler, else
  offshore — trout were parking on the warm shelf); `fryDiag` (diagnostic, unsaved) splits YOY deaths by cause.
  TRIED + REVERTED: attack dash/turn + MISS_CD 0.1 (predators held by the rescue ate the forage out; y16 crashed to ~20
  agents); perch Lzoo 15 (perch starved). Lesson: predator efficiency vs the always-present rescued predators is THE
  sensitive balance — a future fix is to scale predator rescue/refuge by prey availability (numerical response).
  y18 (this config minus heat escape, 3 seeds × 3 yr): STABLE in all seeds — minnow 138–363, sunfish 37–259 (yearly
  pulses), perch 10–63 (recruit 77–202), catfish 3–12 (recruit 3–21), carp 3–7 (0–7), bass 2–3 (0–7), pike 1 (0–3);
  biomass 15–21 kg. Remaining: bass/pike underfed (agent prey capture rate ≪ physiological demand at compressed time),
  adult sunfish few (yearling mortality high), perch adults faster-growing than Michigan means.
98ce008 (heat escape + test fixes): gate19 GREEN (ALL PASS; smoke/ui/serve OK; perf 17 st/s only under 9-process load —
re-measure standalone before merging). y19 4 yr × 3 seeds stable but minnow-dominated (280–300), sunfish mostly YOY
recruits (adults 3–21), bass/pike immigrant-sustained (im 21–22 / 9–10), bass p ≤ 0.19.
SESSION 5 (2026-10-13 night, uncommitted on `science`): PREDATION AT COMPRESSED TIME. Diagnosis (verify/hunt.mjs): a bass
killed 1 fish per 23–66 s of hunting vs a physiological need of ~1 minnow per 1–2 s (1 s ≈ 5 h). takePrey is now a RATE:
FEED.ATTACK strikes/s × clarity over the fish in a hunting arena FEED.HUNT_R × eatRadius, weighted by closeness, success
capture × vuln × (new) SIZE REFUGE (1 − depth/gape)^FEED.SIZE_SEL; kills/misses thinned Poisson; `dt` omitted = one strike
(tests). MISS_CD 0.5→0.1. _shoalOf caches dilution per step. Gate checks updated (reach × HUNT_R) + new: rate/clarity,
gut-fit choice, size refuge. NOTE: verify/ wrappers of takePrey must pass (a, m, d) — old ones dropped maxW too.
Without the size refuge (h6/h20, 3 seeds × 1.5 yr) the community COLLAPSED (agents 60–115): pike ate 10–16 kg of ADULT
perch+sunfish in 0.6 yr (webdiag kills by depth/gape r mostly 0.5–0.75); a pike grew 74→116 cm. Runs hs6/hs12 (size
refuge, ATTACK 6/12) in progress. Literature for the refuge: Miller et al. 1988 review, Nilsson & Brönmark 2000, Paszkowski
& Tonn 1994, Gaeta et al. 2018 (median prey 10–20 %, max 32–46 % of predator TL). Browser check of YOY rendering: OK.
With the refuge (hs6/hs12, 3 seeds × 1.7 yr): ALL INTACT — sunfish 57–88 (39–60 adults; old model had 3–21), perch
29–84, minnow 74–320, agents 208–497; pike fed (summer agents 2–7 g/s ≈ Cmax), bass still immigrant-sustained.
Summer bass diagnosis (verify/schoolhunt.mjs, fryblock.mjs): Cmax 3–6 g/s vs intake 0.04–0.5 g/s. Fixed in this slice:
(a) _eatFry looked only at the NEAREST school and bass were shadowed by larval schools they can't use (nearest = larvae
42–54 % of steps) → piscivores now take the nearest school of young FISH (piscSchool; larvae only while < 3×Lpisc), also
in qPrey (fryPreyOf). Committed ec6fd2d with (b) bouts across the hunting arena + FRY.ATTACK 400 — but v1 validation
(3 seeds × 2.2 yr) showed the lake THINNING year on year (448 → 110–157 agents; YOY eaten ~5× more, minnows 6–23, bass
still p 0.06–0.2; v2 = HUNT_R 6 collapsed to 46–69) → (b) REVERTED (bouts in-school, FRY.ATTACK 100; larvae fix kept);
v3 validation (3 × 2.2 yr): stable (no trend). Then rare colonists PAIR UP (immigrant sex = the one the species' few
adults lack; a one-sex refuge never bred — gate rescue check had failed on seed 73) + trout A/B hardened (4 trout,
UILT-raised control: 18.9 vs 23.9 °C). v4 (with pairing, 3 × 2.2 yr): stable, agents 351–425 at 2.22 (sunfish 240–254,
minnow 83–125, perch 12–33, catfish 4–9, bass 3 b 0–8 im 13–15, pike 1). Gate GREEN, perf 100 st/s standalone.
MERGED: main = science = df28f1b (2026-10-14 00:36); backup G:\synapse-reef-backups\synapse-reef_20261014_0036_predation-size-refuge.zip.
NEXT SLICE — CRAYFISH at real biomass (the bass's missing staple): Momot & Gowing 1977 (3 Michigan lakes, O. virilis):
46–213 kg/ha standing, production 60–142 kg/ha/yr, P/B 0.94–1.53 → this slice ≈ 3–15 kg (sim: 0.1–0.9 kg, 11–74 × 12 g).
Bass diets: crayfish 54.6 % by weight Apr–Oct (Murphy Flowage WI), 80 % of prey in June / 40 % July (WI lake). Crayfish
recruitment is gated by detAvail = fresh detritus particles / (0.6·CAP) ≈ 0.01–0.03 → ~2 % of max. Plan: temperature-
driven logistic toward a habitat K (biomass 5–20 g/m²), not the particle count; predation via rate capture (+vuln),
not certain nearest-take; check perf with several hundred crayfish. Later: a slow sediment organic pool for larvae.
SLICE IN PROGRESS (uncommitted, 2026-10-14 ~01:30): CRAYFISH + LITTORAL BASS. Done: seasonal logistic (CRAYFISH.R 8/yr in
warm water R_T 10–20 °C, M 0.8/yr; SEED 48 ≈ 0.6 K; K = CAP 80×area = 540 × 12 g ≈ 9 g/m²); crayfish on the littoral/
sublittoral bed only (MAX_DEPTH 0.55 H; deep ones walk back up); fish hunt crayfish across the arena (HUNT_R × reach) with
a per-species skill diet.cray (bass 0.25, bullhead 0.15, perch 0.08, pike 0.05) × closeness × cover × day shelter
(SHELTER_DAY 0.7); SNAIL_HUNT 2→0.3. BASS: homeDepth 0.55→0.8 + innate.littoral 0.5 (turn back to shore over beds deeper
than 0.5 H, off during spawning migration) — they had spent 57–78 % of summer over the open basin, ~never within reach of
the bed (verify/basswhere.mjs, bedtime.mjs; NB June windows are bass spawning-migration time — measure in late July).
Diagnosis trail (verify/craydeath.mjs): with shared capture × 0.5 the 2 pike ate 124–140 crayfish in 0.13 yr and the stock
crashed to 5–9; with per-species skill + shelter + R 8 → stock 194 at 0.35 yr, bass the main crayfish eater (114/222).
New gate checks (session-5 block): crayfish depth + walk-back, warm/cold regrowth (immigration off), defended prey, littoral
bass. c3 (no gape/dormancy/shelter): stock eroded to 1–25 in 2 yr → added CRAYFISH.WIDTH 2.2 cm (gape), ACT_T 4–12 °C
(cold dormancy), SHELTER 0.4 K held by the OLDEST (array order = age; transient cf.sh each step, no save change) — c4 still
eroded (37/9/7), c5 with shelter: STABLE 150–240, bass summer p 0.2–0.6 (crayfish 54–90 % of diet), biomass 14–23 kg,
fatheads scarce (3–21 adults — realistic in bass lakes), sunfish dominant. Gate GREEN (101 st/s). COMMITTED + MERGED (see git log).
NEXT: phase-1 leftovers — a slow sediment organic pool (insect larvae recruitment still gated on fresh detritus particles;
det 0–30 on the bed), pike underfed in year 2 (p 0.03–0.5), perch adults fast-growing; then PHASE 2 (visible evolution —
Explore survey done 2026-10-13: Evolution card + world.series exist; missing trait history/variance/saved history/fast-forward).
▶▶▶ USER PLAN (2026-10-14, before compaction — supersedes the older phase order): (1) finish IMPLEMENTING everything and make
it ACCURATE (phase-1 leftovers above, then visible evolution: trait history + fast-forward); (2) a full review pass on the
GUI, the graphics, the webpage information text, and the graphs/charts; (3) on the roadmap: MULTI-LAKE landscape with
STREAMS, RIVERS and PONDS; (4) what-if controls. STATE: main = science = a7cdc1c, tree clean, gate green, backup
G:\synapse-reef-backups\synapse-reef_20261014_0204_crayfish-littoral-bass.zip. Resume at (1): the sediment organic pool.
Tried, no clear gain (reverted): HUNT_R 8/12 (pike gorge, bass unchanged), a worth-the-chase prey filter (CHASE_MIN).
ROOT of bass starvation: in June–July YOY are 1–2-cm larvae (~0.04 g), fathead adults thin out, crayfish few — crayfish
model predates bioenergetics and recruits from a near-EMPTY detritus pool (DETRITUS particles live 26 s ≈ 5 d → 0–30 on
the bed; real lakes have a large sediment organic pool). NEXT SLICE: a sediment organic pool (field, not particles) feeding
crayfish/larvae/bottom feeders, crayfish densities toward real (1–10 /m²) — then re-check bass.
Validation v1 (this config) / v2 (HUNT_R 6), 3 seeds × 2 yr, and gate20 were running.

**▶▶ RESUME HERE (2026-10-13, after compaction) — the human wants ALL THREE, in order, then what-if tooling:**
Goal (human): "a complete, realistic simulation, that looks good too and is polished … eventually good enough that you could
manually add in other variables to see how it would affect the ecosystem, but we have to get it accurate before that."
Usage limit lifted: be thorough (multi-seed, ≥3-yr validation, research published parameters; parallel agents OK).
State: main = 1a3c416 (gate green, save v26); working branch `science` (from main). Backups on G:.
1. BIOENERGETICS + FOOD-DEPENDENT GROWTH (first). Replace hand-set metabolism/moveCost/energy caps with the Wisconsin /
   "Fish Bioenergetics 4.0" (Deslauriers et al. 2017) equations and published per-species parameters (consumption CA/CB/CQ/
   CTO/CTM/CTL/CK1…, respiration RA/RB/RQ/RTO/RTM/ACT…, egestion/excretion FA/UA, SDA, energy density) for fathead minnow,
   bluegill/pumpkinseed, yellow perch, rainbow trout, (brown) bullhead or channel catfish, common carp, largemouth bass,
   northern pike. Fish carry MASS (g) and grow by consumption − respiration − waste; length from length–weight; size →
   gape, speed, fecundity (∝ mass), predation risk; condition factor; starvation when reserves deplete. Map sim time to real
   days via the 30-min year (1 sim-s ≈ 4.87 real hours) consistently. Then re-derive prey energy densities (J/g) for
   zooplankton, insects, fish. Validate: growth curves (length-at-age) vs published, consumption ≈ % body mass/day.
   Expect most tuning to disappear; calibrate remaining against field patterns (pattern-oriented modelling).
2. VISIBLE EVOLUTION: trait-trend charts per species (gene means/variance vs time & generation), selection-differential
   readouts, a fast-forward "evolve N years" mode (headless in a Worker), heritable traits that show in the art.
3. LANDSCAPE: several lakes (deep oligotrophic trout lake / current productive lake / shallow weedy pond) + a stream with
   riffles/pools (flowing-water physics; stream spawning for trout), real dispersal between them (replaces the abstract
   regional gene pool), per-lake views + a map; background lakes step at reduced cost.
4. THEN what-if controls (nutrient loading, warming, stocking, pollution, fishing, invasive species).
Known weak spots to revisit inside 1: perch/catfish/trout numbers; adult dragonflies only visible in the air strip.

**▶ POLISH (2026-10-13, session 3b — human: twitchy "resetting" swimming, plants through the bank, inaccurate looks):**
fixed as in FEATURES "2026-10-13 polish" (30 Hz browser step + no catch-up bursts, 30 Hz decisions, true body proportions,
real-scale wildlife, plants/logs/crayfish/nymphs follow the bed). Evolution evidence (verify/evo.mjs, seed 1): after 2.5 yr
(~75 min) minnows reach generation 2.6, others 1–2; trait means within ±6 % (mostly drift) — realistic generation times
make evolution invisible within a sitting. OPEN for the human: (1) bioenergetics with published per-species parameters +
food-dependent growth (removes most hand-tuning), (2) evolution visibility (trait-trend charts, fast-forward), (3) a
landscape of several lakes + a stream.

**▶ MORE LIFE (2026-10-13, session 3 — human: "keep going and do it all") — branch `realism2` → merged to main when green:**
- Added: Daphnia vs copepod zooplankton (p.k; clear-water phase, size-selective predation, copepods carry winter);
  dragonflies (benthic nymphs that ambush larvae/tadpoles/fry/zooplankton, emerge on warm sunny days, adults hawk insects
  and lay eggs, fly in from other waters); frogs (tadpoles graze + metamorphose, frogs float/dive/spawn/hibernate);
  painted turtles (forage, breathe/bask, hibernate, late-summer hatchlings); fish eat herps that fit the gape; RAINBOW
  TROUT (cold-water, O₂-hungry, stream spawner); behavioural thermoregulation (heat → cooler depth, offshore off the warm
  shelf; the O₂ check makes the summer squeeze); per-species cold activity floor (SP.coldPerf: trout .6, pike .5,
  perch .45); bottom-huggers don't sink into hypoxic water; fecund species spawn bigger clutches of cheaper young.
  Save v26. UI rows + legend for the wildlife. Seasonal water tint follows the temperature phase.
- Balance, 3 seeds × 2 yr (deaths_fin2_s*), mid-May yr 3 (pre-spawn low): minnow 249–334, sunfish 21–55, perch 17–29,
  trout 3–7, catfish 6–12, carp 13–35, bass 7–21, pike 5–14; frogs ~50–81 (cap 81), turtles 14–29, tadpoles cycle
  0 → 400 each spring. Dragonfly nymphs were dying out (fixed: CRYPTIC .02, SENESCE .0003, EGG_RATE .3, VISIT .02).
- Follow-ups: catfish still lose condition and some die in winter/summer hypoxia; trout persist mainly via the immigration
  floor (realistic for a eutrophic lake without a good spawning stream); adult dragonflies fly ABOVE the water, so they are
  only on screen when the view shows the air strip (zoomed out / tall screens).

**▶ REALISM STATUS (2026-10-12, session 2) — gate GREEN; `realism` fast-forwarded into `audit-fixes` and merged to `main`:**
- DONE in code: R1 climate (temp cycle, ice, seasonal sun, Q10 metabolism, temp-driven strat, hypo ≥ 4 °C, start date
  SEASON.START_YF 0.22, primeSeason); Q10 on phyto/cyano/diatom/nitrif/sediment+pelagic O₂/plant night resp; plant
  dormancy (PLANT.DORMANT_T); inflow plume + aerated inflow (FLOW.PLUME_*, O2_MIX); plant O₂ spread along the stem;
  O2_RESP_FISH scaled 0.012→0.0015; R2 energetics (per-species metabolism/moveCost ~8–10× lower; all stress drains
  rescaled; actions ENGAGE-gated), satiation (FEED.SATIATE/HUNT_BELOW), fry eat zooplankton (FRY_GROW), juvenile
  massF^0.75 metabolism, life history in years (species.js yr()), temperature-triggered spawning (SP.spawnT,
  SPAWN.EDGE/SEASON_END/MATE_REACH, spawnSide grounds), NO budding, K pyramid, mixed initial ages, cheaper young + bigger
  clutches; R3 nest guarding (sp.nestGuard, BROOD.GUARD_*/PROTECT, a.nt/nx/ny/ni), nursery cover, PREY_MIN, gape 0.62,
  O₂-limited habitat choice (benthic → shelf); DIGESTION (FEED.MEAL_K 10, DIGEST 1200, a.dg by absorbed energy);
  R4 regional gene pool (world.genePool, poolFounder, IMMIGRATION.POOL_N/EMIGRATE; FROM_BEST retired; RESCUE_N 3,
  RATE 0.05); R5 clonal plant runners (PLANT.CLONAL/RUNNER), DIATOM group (env.diatom, diatoms(), sinks when stratified),
  CYANO TEMP_OPT 25/TOL 11; R6 PERCH species (SP.perch, 'vbars' art, qLarva, TROPHIC 'mesopredator'), LOON (BIRD config,
  world.birds, _stepBirds, qThreat includes diving loon, render _drawBirds), ice rendering. Save v25 (ice, diatom, nest,
  dg, birds, genePool). smoke passes.
- FIXED #1 (2026-10-12, session 2) — under-ice O₂. Budget (verify/o2budget.mjs) showed the drains were (a) the wind-driven
  overturn still running under ice (non-conservative relaxation toward the depleted surface) → × (1 − ice); (b) weak
  under-ice mixing (ICE.STRAT 0.55 → 0.85, calm inverse stratification); (c) diatoms sinking into the dark deep and
  respiring at full rate → dark survival (PHYTO.DARK_RESP 0.15, RESP_IK; env.algaeRespAt); (d) cold-suppressed
  photosynthesis in dim light → Blackman photoRate (light-limited rate T-independent; Pmax ∝ Q10). Result (2 seeds × 2 yr):
  avg O₂ Jan 0.8–1.2, Mar 0.4–0.7, deep anoxic under ice, upper water oxygenated; spring diatom bloom → May clear-water
  phase → summer green → Aug cyano → autumn diatoms. All 7 species persist with seasonal cycles.
- FIXED in session 2: founders started with rand(0, matingCooldown) → once-a-year spawners skipped the opening season
  (now mateCd 0); a.feedAcc (cold foraging makes it fractional) was not saved → resume diverged (now `fa`, v25);
  effSize 0.6+0.4·grow made newborns 74 % of adult length → never cannibalised (now 0.3+0.7·grow); spawnFactor exported
  (pure); world.setDate(yf); UI ice/diatom/loon readouts + loon legend; CLAUDE.md/README/FEATURES updated.
- Tests: many headless checks rewritten to the new calendar/model (setDate dates, temperature spawning, no budding,
  total-P inflow A/B, thermal-stress scaling); NEW realism block (climate, ice form/melt/seal, under-ice O₂ profile,
  Blackman, dark survival, diatoms, nest guarding, digestion, gene flow, loon, perch, founders).
- Session-2 behaviour fixes: SPAWN.KEEP 0.25 (clutch paid from the surplus above a reserve → condition-dependent; 0.5
  halved recruitment of slow breeders); immigrants arrive with mateCd 0; nest guardians ignore their own fry as
  "intruders" (notOwnBrood), hover over the nest (BROOD.HOVER) and tether harder (GUARD_TETHER 2.5); a migrating
  spawner's depth-keeping keeps its migration direction (`mig`); season names are meteorological (Dec–Feb winter);
  UI day/dawn/night from the sun's height (env.sun), not the light under cloud/ice; primeSeason hypolimnion follows the
  seasonal phase (~6 → 15 °C through summer, ~5 under ice).
- Balance, 3 seeds × 2 yr (verify/deaths.mjs; census at mid-May yr 3 = the pre-spawn low): every species persists and
  breeds in its own season; predation is the main death cause of small fish. Baseline (old effSize, no KEEP): minnow
  254–332, sunfish 43–60, perch 2–13, catfish 9–17, carp 15–23, bass 6–15, pike 7–16. KEEP 0.25 + small juveniles:
  sunfish 8–56, perch 2–10, catfish 4–7, carp 4–13, bass 12–19, pike 3–12. FINAL code (+ nest-guard fixes):
  minnow 328–336, sunfish 6–36, perch 5–13, catfish 6–12, carp 5–13, bass 3–23, pike 8–12.
- NEXT (balance follow-ups, judge each on a ≥3-seed A/B, ideally 3 yr so early spawners get 2 springs):
  1. PERCH decline in every run (74 → 5–13): spring starvation (energy.mjs: 78 % hungry) + heavy predation on young.
     Real perch feed actively under ice — coldPerf (COLD_PERF_MIN 0.2) may be too harsh for cold-tolerant perch/pike
     (a per-species cold tolerance would be realistic).
  2. CATFISH hypoxia drain is their biggest cost (energy.mjs 10.95/1000/s): they sit in anoxic bottom water; the
     O₂-limited habitat steer should keep benthic fish out of water below o2Crit more firmly.
  3. SUNFISH vary by seed (6–56): young are heavily eaten since juveniles became realistically small; bluegill are
     hugely fecund nest-guarders (try SP.sunfish.clutch ↑).
  4. CARP summer starvation (s12–14/season).
  Optional realism adds still open: trout, dragonfly larvae, zooplankton types, frogs/turtles.
- Scratchpad verify scripts (session-local; recreate if lost): recruit.mjs, deaths.mjs (deaths by cause×season incl.
  loon), energy.mjs (per-species energy budget), climate.mjs (monthly lake table), o2sinks2.mjs (winter O₂ sinks),
  hypwhere.mjs, shelfo2.mjs, profile.mjs, o2budget.mjs (O₂ budget by process from a snapshot), iceprof.mjs (per-row
  under-ice profile), breedgate.mjs (why a species is not breeding), resume2.mjs (resume check — RNG is global: run the
  original path FIRST, then load and replay).

**▶ RESUME HERE (updated 2026-10-12, after the launcher + smoothness round):**
- **Human feedback this round:** "doesn't seem very smooth or high fps", "looks blurry when fully zoomed out",
  "add a batch file to easily launch this". All three were measured in REAL Chrome at 1920×1080 (RTX 3060, 144 Hz) and
  fixed:
  - `3cf2eb7` launchers (`Synapse Reef.bat`, `Synapse Reef - Screensaver.bat`) + `#screensaver` window mode; the GL
    scene upload went into an SRGB8 texture = Chrome CPU-readback slow path (19 → 70 fps with RGBA8 + shader decode);
    frame pacing (every k-th refresh on high-Hz displays); UI panel refresh staggered across frames.
  - `01e4329` crisp overview: warp / chromatic aberration / fake DOF now scale WITH zoom (were strongest zoomed out).
  - `26b8de6` sim step 7.1 → 4.5 ms, byte-identical (fingerprint hash unchanged; gate 154 → 256 steps/s).
  - `1d229a1` drawn fish pitch soft-limited to ±55° (no more vertical "falling cut-out" fish).
  - `8a9e78f` GL fish swim in FRAG_FISH from one straight-pose sprite per fish: the hi-res tiers needed
    30 sprites per fish (10 frames × 3 efforts) vs caps 160/48 → close shots rebuilt sprites every frame (20 fps, 230 ms
    stalls). Now 65 fps, 100% frames on target at 16× on the densest cluster.
  - `5e555d6` tall screens (16:10, 4:3, portrait) frame the surface at the top; earth fills the spare height.
  - `f6732e3` fish art for close-ups: species markings (bass band, minnow stripe, sunfish bars + orange breast, pike
    spots, catfish mottle), overlapping scales on the close-up tiers, forked tails, rounded snout, iris, soft edges;
    tour follow zoom 6–16×.
  - `beb24e9` plants up close: eelgrass weed-bed blades as tapered ribbons with a midrib, lance leaves on stalks,
    tapered reeds (all only at z ≥ 2.4); fish no longer fade in as see-through "ghosts" on every tour cut (only newborns
    fade).
- **How I measure in real Chrome (session-local scripts in the scratchpad; recreate if lost):** launch
  `chrome --app=http://localhost:8000/#screensaver --user-data-dir=%LOCALAPPDATA%\SynapseReef\bench
  --remote-debugging-port=9334 --window-size=640,400 --disable-backgrounding-occluded-windows
  --disable-renderer-backgrounding`, then a tiny Node CDP client (Node 24 has global WebSocket) that sends
  `Emulation.setDeviceMetricsOverride` 1920×1080 + `Runtime.evaluate` (frame-interval/pacing, wrapped draw/step
  timings), `Profiler.start/stop`, `Page.captureScreenshot`. The override drops when the session detaches, so do the
  setup and the captures in ONE session. Sim speed-ups: `simhash.mjs` = sha256 of `toJSON()` after 4000 steps with
  `seed(12345)`; it must not change.
- **Next, in order:**
  1. **Tall-screen framing.** camera.js `_clamp`: when the view is taller than the world (`hh*2 >= H`) it centres
     the lake (cy = H/2), leaving smoky "air" with god-ray streaks above the surface on portrait or 4:3 screens.
     Anchor the lake near the top instead: margin m = min(0.03·H, (viewH − H)/2), cy = hh − m. Do the same for the
     tcy/hh and cy/hh2 pairs. Standard 16:9 fit then stays unchanged, because FIT_PAD's margin (17.6) < 0.03·H.
     Check the headless camera tests around headless.mjs:1300 first.
  2. Optional fish-art polish (the fins read a bit flat at 30×); plant/bed art.
  3. Ecology, lower priority now: juvenile cover / nursery reflex for apex recruitment. Judge with a ≥3-seed A/B
     using `scratchpad/verify/seeds.mjs` (session-local; easy to recreate: per-seed 1-year births vs immigrants,
     with SP overrides via env).
  4. Merge `audit-fixes` → `main` again after each verified batch, then take a G-drive backup with `git archive`.
- **How I verify visuals:**
  - Built-in browser, preview `reef` (`node serve.mjs`).
  - Fake fullscreen: set `#viewport` to position:fixed inset:0, and `#tank` to 100vw × 56.25vw.
  - Pause with `reef.ui.paused = true`; force the time of day with `world.env.t` and `world.env.light`.
  - Capture with `computer` zoom on region [0,0,754,424].
  - The pane refuses real fullscreen requests; it scales emulated big viewports, so use the native size.
- **Lessons this round:**
  - Measure perf in real Chrome at the user's resolution, not in the preview pane: the pane hid a 4× GPU-process
    bottleneck. Chrome only GPU-copies a canvas into non-sRGB textures; never upload a canvas into SRGB8_ALPHA8.
  - Screen-space lens effects must scale with magnification, never 1/zoom.
  - Any per-fish sprite variant multiplies the cache working set; animate in the shader instead.
  - Run `node --check` after EVERY edit. A duplicate `const P` once broke app startup.
  - The smoke DOM stub lacks some canvas methods (`clip` was added). Add any new ctx method you use to the stub.
  - `ImageData` isn't in the stub, so the sprite rasterizer falls back to `fillRect` there.

**Plan for this round** (tick items off here as they ship):
- [x] GUI review in the built-in browser: screenshots at desktop, mobile, whole-lake, close-up, night,
      overlays and fullscreen. Fix layout and readability issues.
      Shipped `caa26ba`:
      - the legend was covered by the minimap and camera controls;
      - open on the whole lake;
      - neon fish and flora at night → dim and desaturate;
      - magenta sunfish;
      - near-white plants by day;
      - plankton "snow" at the overview;
      - truncated trophic labels;
      - mesh-gridded field overlays → a smooth heat map.

      Still to check: the mobile layout. Fullscreen can't be triggered without a user gesture.
- [ ] Colour grade / exposure: judge with screenshots and GPU-readback histograms, now that GL depth is
      right-side up.
- [x] Catfish nocturnality: `innate.dayRest` (catfish 0.5) damps daylight thrust, giving ~60% faster at night (was ~8%). A 3-seed A/B shows a cost within noise.
- [ ] Apex juvenile survival / brood protection.
- [x] Tests: the can't-fail checks are relabelled (REFUGE / clamp invariants). The Liebig check now asserts that the scarcer element sets the limit. A WebGL2 mock is still open.
- [ ] HUD O₂ readout semantics (it reads 100–116%).

**What happened.** On 2026-10-11 the human asked to "post it to GitHub and fix everything" in `AUDIT.md`.
They then asked for testing, pushing, re-auditing and improving to continue overnight, *without burning usage
on subagents*. Five worktree agents did the first wave of fixes. Everything after that was done solo.
All of it is on `main` via the `audit-fixes` branch.

**Repo:**
- https://github.com/jamesccupps/Reef (public).
- `main` = the latest verified state. `audit-fixes` = the working branch (merged).
- Commits use the repo-local noreply email (GitHub rejects the private Gmail with GH007).
- There's no `gh` CLI.
- On Windows PowerShell, commit with `git commit -F <msgfile>`.
- Budget rule from the human: don't fan out subagents or workflows unless they ask.

**Verified state (last strict gate):** `npm test` exit 0, ~131–144 steps/s, covering `headless.mjs`,
`smoke.mjs`, `ui-check.mjs` and `serve-check.mjs`.
- Save format is v24.
- Exact resume holds (load → 600 steps byte-identical at dt 1/60 and 1/30).
- P and N budgets are closed (plants included).
- GL orientation was verified on the GPU (caustics change the TOP bands).
- Interpolation was verified live (the drawn position moves every frame at ½×).
- No CSP violations or console errors.

**Shipped (details in `AUDIT.md` status and `docs/FEATURES.md` → "2026-10-11 audit-fix changes"):**
- **Wave 1:**
  - render: GL orientation, GL fallback, colour pipeline, interpolation, input;
  - UI: XSS, CSP, server, caps;
  - integrity: brain eras, exact resume, validated load;
  - bio: cannibalism grace, plant light average, per-second rates;
  - chemistry: wet/dry mask, conservative diffusion, closed budgets, hypolimnion, storms, outflow.
- **Solo follow-ups:**
  - plant N+P pool, which closed the last budget term;
  - apex energetics (diagnosis below);
  - round-trip fix and a strict no-negatives check;
  - a safe `makeFish` default age;
  - behavioural replacements for the formula-copy tests, plus a stress-scenario determinism check, a
    body-depth `qPrey` check and Baldwinian persistence checks;
  - docs: slim CLAUDE.md, FEATURES.md, README, LICENSE, ROADMAP status, archived history;
  - the step-rate badge fix.

**Apex predators (the main ecology finding):**
- Bass and pike didn't fail to breed; they **starved**. A bass burned ~0.09/s against an intake of ~0.05/s,
  and immigration rescue had become a treadmill. Diagnostic scripts: `scratchpad/verify/apex.mjs` and
  `budget.mjs`. They are session-local; recreate them from this description if needed.
- Fixes:
  - innate **pursuit** for bass/pike;
  - innate **hypoxia avoidance** for all species;
  - predator metabolism put on the size trend (bass 0.046→0.030, pike 0.056→0.036);
  - fish meals worth more (0.60/0.65 → 0.80/0.85).
- Result: bass immigrant share 91% → 80%, pike 76% → 61%, with prey steady.
- Then the remaining bottleneck turned out to be mate-finding. A lower breeding threshold was tested and
  rejected: births didn't rise. **Spawning aggregation** (`innate.spawnGround`) shipped instead.
- 1-year immigrant share now: bass 70%, pike 54%, catfish 29%, carp 39%, sunfish 16%. Total immigration **Caveat (2026-10-12):** those are single-seed (2024) figures. A 3-seed, 1-year A/B gives honest means of bass ~78%, pike ~59-66%, catfish ~47-49%, carp ~44-46% and sunfish ~22-24% immigrants. That is still better than the 91%/76% start, but less than seed 2024 suggested.
  is down 44%, and minnows hold steady (CV 0.04).
- Better, but bass and pike are **still not fully self-sustaining**. Next levers: juvenile survival and
  brood protection.

**Open / next (ranked in `ROADMAP.md` → "Build order & guards"):**
1. Apex self-sustainment: juvenile survival (pike eat many bass), the reproduction threshold, damping
   the immigration treadmill.
2. The rest of test hardening:
   - a WebGL2 mock in smoke (`GLPost` never runs under the stub);
   - relabel or replace the checks that can't fail (REFUGE "all species present", clamped O₂ range);
   - a faster gate (it's ~9 min serial; `node:test` with parallel files).
3. Catfish nocturnality is weak in effect (~8% faster at night).
4. N-fixation is rare at the default inflow.
5. The graphics realism roadmap. Re-tune the grade first: it was tuned against the upside-down GL depth.

**Needs the human's eyes:**
- the colour grade and exposure now that GL depth is right-side up;
- the HUD's average O₂ reading ~100–116% (wet-only means plus spring supersaturation);
- predator behaviour with pursuit (does it look natural?).

**Gotchas:**
- `renderer.draw(t[, alpha])` needs `t`.
- In FRAG_COMP, depth is `dpt = 1 − uv.y`.
- Test blocks go BEFORE the final summary `console.log`/`process.exit`.
- `World.makeFish` defaults to a living adult.
- Run new behavioural tests A/B against an identical world.
- `REEF_PERF_MIN=0` only while the CPU is shared.
- Agent worktrees are created at `main`.

---

## Before the audit: where things stood (2026-06-18)

The full verbatim history is in [`docs/archive/SESSION_LOG_2026-06.md`](docs/archive/SESSION_LOG_2026-06.md). It was moved out on 2026-10-11 because this file had grown to ~211 KB.

- **Last shipped:** graphics realism slice 1, a linear-HDR GPU pipeline (sRGB-decoded textures, RGBA16F, encode + dither last, live `present.exposure`).
- **Arcs completed before that:**
  - **Cognition/ecology (12 slices):**
    - brain action head (strike/flee/hide);
    - `LIFE_SCALE`;
    - motion realism (carving, turn-speed loss, burst-and-coast);
    - hunger/fear drives;
    - aquatic insects;
    - snails and crayfish;
    - dashboard slice A;
    - spatial cognition;
    - richer perception;
    - Baldwinian lifetime learning;
    - evolvable brain size.
  - **Graphics:**
    - Pass 1: de-pixelate;
    - Pass 2: rich organisms, effects and water;
    - Pass 3: WebGL post, volumetric light, GPU-lit fish;
    - a cinematic finish;
    - per-species fish art.
- **Planned graphics roadmap** ([`docs/GRAPHICS_RESEARCH.md`](docs/GRAPHICS_RESEARCH.md)):
  - AgX / PBR-Neutral tonemap;
  - shared surface heightfield;
  - Beer-Lambert depth colour;
  - depth/occluder MRT;
  - occluder-masked god-rays;
  - per-pixel fish normals, iridescence, fin SSS;
  - HG in-scatter;
  - real DOF + AO;
  - instancing.
- **Parked, non-graphics:**
  - dashboard slices B and C (selectable charts, food-web flux, CSV export);
  - "grow the lake" (amphibians, birds);
  - the scenario/preset engine.
- **Pending human eyeball:** the colour grade and exposure. The GL depth terms were upside-down until the 2026-10-11 fix, so the grade was tuned against the inverted image.
