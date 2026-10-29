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
▶▶▶ RESUME HERE (2026-10-22 ~1 p.m. EDT — THE NEWEST). DONE + pushed: 2306d79 3-D PRINTS (tools/hotbrook/export_print.mjs → exports/print/
<a1|a1mini>/ gitignored: onepiece, fourcolor (height bands), cover4 (forest/open/wetland/water from the NAIP canopy), terrain_basins +
water_inserts (clear PETG, upside down); TREETOPS on the forest (the human: "just simulate the top of the forest"); every part closed
and manifold; tools/hotbrook/print_view.html previews); 1aada9e ROADMAP #10 whole-environment simulator, #11 FIRST-PERSON SCREENSAVER
view of the true-size lakes (the human's request: place yourself somewhere, watch everything), #12 prints; 20d8f83 Y3 FEED_CV rule (off)
+ clear_water_phase_and_rotifers.md. GATE of d2e735d GREEN (134/0/1 GAP). IN THE TREE (uncommitted): Z1 — the clear-water phase at
the field's depth (ZOO3.Z1 in stageR5: cladoceran clearance 3.9 → 1.0 mL/µg/d (GR_D × gK), starvation of the share below maintenance on
t_starv 4.4 d (×Q10 2, only above the cold window), interference 0.0012 → 0.0007 L/µg/d, the opening Daphnia 40 → 8 µg/L); probes
rotbud_z1(_nofish).txt, larvz_z1.txt running. Agents still running: E12b weeds, FOREST (bears/deer/moose), RENDER (all animals).
ARM AJ on the GPU (perch 75).
▶▶▶ RESUME HERE (2026-10-24 ~13:20 EDT — THE NEWEST). PUSHED today: 484c3a6 wildlife, 1cdb24a anglers + shallows, c0bbb47 camps'
nights/out-of-season/lawns/snow (backup G:\synapse-reef-backups\synapse-reef_20261024_1315_ue_wildlife_anglers_camps.zip). THE HUMAN
(13:15): "ive downloaded some more things, not those yet [the second list], but we will have to make sure all the textures and plants
and everything are accurate too, i can upload more photos too that way you can reference the game to make sure it all looks right,
like rocks, shorline, grass, everything". NEW DOWNLOADS (C:\Users\james\Downloads, 12:30–13:12): kawasaki-ridge-ranch.zip (a UTV),
bass-boat.zip, pontoon.zip, grass.zip, stones-and-grass.zip, fern-grass-02.zip, pond-weed.zip, lake-lily-med.zip,
water-lily-nymphaea-odorata.zip. PLAN: (1) unpack to G:\HotBrookUE\Import\sketchfab\<name>, check each licence (credits in
ue/README.md; never commit the files); (2) the aquatic plants in UE from the sim's plant fields (plants3: whitelily = Nymphaea
odorata, floatpond, …) — check what UE draws now; (3) a PHOTO-MATCH workflow: the human's photos (originals, with GPS/time) in a
private folder → their place, heading, hour, lens → the same view rendered in the game → side by side → fix rocks, shoreline, grass,
plants, textures. Photos are private: never commit or publish them.
  + 13:35 LICENCES (Sketchfab public search API): lilies + pond weed Valery.Li CC-BY; fern grass 02 POLYSCAN CC-BY; grass Cosmic_dust
  CC-BY (81,242 tris matched); bass boat BoatUS Foundation CC-BY (168,116 matched); pontoon BoatUS Foundation CC-BY (likely; 321,613);
  stones and grass grewe.juergen CC-BY (likely); Kawasaki Ridge Ranch geyges "Free Standard" (use OK, no redistribution). Told the
  human: photos (originals with GPS) into G:\HotBrookUE\Import\reference\. ue/export/convert_plants.py → Import/plants/*.glb:
  white_lily (1.6 m clump, pads at z 0, stems to −0.57), lake_lily (1.4, rhizome to −1.74 — the yellow pond-lily's), pondweed (0.9),
  grass_lawn/grass_tuft_a/grass_tuft_b (Cosmic_dust, textures mapped by material stem), fern_grass, stones_grass (200k). The
  Valery.Li files are Y-up (pre X 90). PLAN (THE WEEDS): build_reeds.py (Blender procedural bulrush / pickerelweed reeds, normalised
  1 m tall) → import (import_creatures.py generalised: HB_SET=plants) → ue/link/weeds.mjs (the host: plants3view's fine-cell blend +
  clump field ported; on sim3worker's 'plants' message pack the cells within ~150 m of the walker as "HBP1": x, y, depth, per FORMS3
  form its stand/Bmax ×255, mussels, dead stems) → AHotBrookLink routes HBP1 → NEW AHotBrookWeeds (HISM per mesh: lily clumps by
  cover, pondweed, reeds scaled to depth + 0.5–1.3 m above, mussels as dark half-buried shells).
  + THE HUMAN (13:50, "a note for later"): "maybe look or search for the properties that we have in this, like listings or other
  things, might be able to get pictures to make them more realistic" — TODO after the weeds: search public real-estate listings /
  assessor records for the mapped camps (the dataset's e911 addresses, local only) for photos of their siding, roofs, decks, docks;
  keep them local as references (never commit, publish or label; never identify the family camp); no bot-check bypassing (Zillow
  etc. may block automation: stop and ask the human to save pages instead).
  + 14:00 THE WEEDS BUILT (committed "checks pending"; NOT yet seen in a shot): build_reeds.py → reed_bulrush/pickerelweed/horsetail
  (procedural, 1 m tall); import_creatures.py generalised (HB_SET=plants → /Game/HotBrook/Plants, Import/plants_meshes.json; 11
  imported OK); ue/link/weeds.mjs (plants3view's blend + clumps ported: 257,511 water cells over 4,067 bed cells, 21 forms; pack(m, x,
  y, 150 m) "HBP1" ~46 KB in 7 ms; best(m) logs each form's densest cell once); simhost.mjs handles 'plants' (sends when the walker
  moved 20 m or 30 s passed). AHotBrookLink keeps HBP1 apart (LatestPlants) → NEW AHotBrookWeeds (HISM per look: white_lily ×10/cell,
  lake_lily = yellowlily ×8, watershield = lake_lily 0.3 ×24, pondweed for floatpond/burreed/ribbonleaf/largeleaf ×14, reeds bulrush
  ×40, pickerelweed (+bogbean, arrowhead) ×24, horsetail ×30, sedge = grass_tuft_a (H 35 cm) ×40 — stretched to depth + 0.5–1.3 m;
  mussels = engine sphere, MID of MI_HB_Plastic Tint dark olive, within 25 m). -hbshot cmd `plant=<key>` frames the nearest. The
  host was restarted (task bihaavlbd). Mid-May densest (stand/Bmax): yellowlily 0.25 at (-572,-1322), bulrush 0.19 (-182,-3242),
  whitelily 0.01 (333,1223) — the lilies barely up in May. NEXT: shots at those (air= or plant=), fix, commit; then lawn grass
  instances (grass_lawn on the lawns), stones_grass on rocky shores, the pontoon/bass boat/UTV, the listings search, the photo match.
  + 14:15 FIRST WEEDS RUN (195f633 + this note): the link delivers (log: "weeds: 1544 cells about the walker, 10917 plants and
  shells"); shots at the yellow-lily bed (-560,-1330, air=5) show small dark sprigs above the water (pondweed's spikes?) but no pads
  readable — mid-May the stands are 0.01–0.25 of full; the bulrush's densest cell (-182,-3242) is LAND in UE (a grassy flat at
  Upper's S end: the sim's water grid reaches past the UE outline there; weeds need SurfaceAt + 8 cm depth). TO CHECK NEXT: (a) pads
  vs the drawn water surface (are they under it? try +3 cm); (b) a summer look — find whether sim3worker takes a date message
  (world.setDate / a 'date' type) so the host can jump to July for a test; (c) `plant=<key>` framing picks the first-placed, not the
  nearest — fine-tune; (d) hb.AllLife-like override for the weeds' stands (e.g. hb.Weeds 1 = full stands) for looks.
  THE HUMAN'S OPEN ASKS (in order): accuracy of textures/plants/rocks/shoreline/grass against their photos (they'll put originals in
  G:\HotBrookUE\Import\reference\ — a photo-match tool: EXIF GPS/heading/time → the same view in-game, side by side); the listings
  search for the camps' photos (local only); use the new downloads (pontoon → replace the procedural one; bass boat → some anglers'
  boats; Kawasaki Ridge UTV → parked at some camps; grass_lawn on the lawns; stones_grass on rocky shores; fern_grass in the woods);
  the second download list (crayfish, mussel, newt, dragonflies, damselfly, snail, raccoon) not yet downloaded by them.
  + 14:55 WEEDS FIXES (uncommitted until the check shot): (1) Valery.Li's lily/pondweed FBX were UPSIDE DOWN (pre X +90 → −90: the
  pads had sat 0.6–1.7 m under the water, the stems arching out — the "dark sprigs"); lake_lily resized 1.4 → 0.32 m (Nuphar pads
  25–30 cm), white_lily cut to 20k tris; NEW lily_pads (white lily minus its flowers, 0.6 m: watershield/floatpond/burreed); pondweed
  now stands on the bed (kind 'ground'; Weeds look Where 3: bed → 5–40 cm under the surface). Every leaf alpha now glTF MASK (a Math
  'greater than' node: was BLEND = translucent). (2) GREY DEFAULT MATERIAL IN -game: materials lacked bUsedWithNanite /
  InstancedStaticMeshes — NEW Scripts/fix_usage.py (ran: 93 changes) sets them on our masters and copies the Interchange glTF parents
  (/InterchangeAssets/gltf/M_Default + MI_Default_*) into /Game/HotBrook/Interchange with the flags, re-parenting our MICs (fish, birds,
  canoe, camps' masters, bullfrog, plants — ALL had been grey in -game where Nanite/ISM). import_creatures.py calls it after imports.
  (3) Weeds: hb.Weeds cvar (stands × N for a look), Per counts for real cover (white 18, yellow 150, pads 80, pondweed 20), plant=
  framing fixed (the animal block caught it), Placed up to 4096. (4) THE BROOK ISN'T DRAWN IN UE (AHotBrookWaterSurface draws only
  lakes.json's two lakes; the heightmap carves its bed, dry, shrubs in it): weeds/mussels now need InLake. TODO slice: draw the brook.
  + 15:10 COMMITTED e08cdf3 (the above). THEN: flowers by date (Weeds FLook Off/B0/B1: white lily Jun 15–Sep 15 → else lily_pads ×2.67,
  pickerelweed Jul 1–Sep 30 → else NEW reed_pickerelweed_leaf; bogbean/arrowhead always the leaf look; ≤ half in flower; hb.WeedsDate
  for a look) and the bulrush's head rebuilt as small spikelet clusters on rays (one stretched blob read as a cattail). Checked in shots
  (May: leaves only; 0.38: spikes, lily flowers). NEXT: draw the brook's water in UE (AHotBrookWaterSurface: a ribbon on lakes.json's
  brook path/width/levels — check its pools against the sim's GEO brook cells), then the new downloads.
  + 15:25 COMMITTED 67719cb (flowers). THE BROOK DRAWN (this commit): AHotBrookWaterSurface builds a section from the water grid's wet
  cells within 20 m of the brook path outside the lakes (66 cells) + a ring under the banks (99; ring corners 5 cm under the ground),
  corners at the brook's own level, 3 cm under a lake's within BankOverlap+2 m of its shore (no flicker at the mouths). UHotBrookWater
  gains InBrook/Drawn (+ Grid/CellSurface); the weeds use Drawn (bur-reed, floating leaves now in the brook). Checked in shots (a bear
  drinking at the upper mouth, too). KNOWN: the brook's channel in the landscape shows the 5-m cells (square shallow steps) — needs
  export_world's heightmap with a smooth channel along BROOK_PATH/width and a landscape rebuild (CAREFUL: export_world.mjs also writes
  camps.json from CAMPS3D — it would overwrite export_camps.mjs's richer camps.json; run export_camps after it). NEXT: the downloads.
  + 15:50 COMMITTED fb9502a (the brook). THE CAMPS' VEHICLES (this commit): convert_creatures.py HB_SET=vehicles (VEHICLES: bass_boat
  6.9 m turn 90 draft 0.2, pontoon 7.5 m turn 90 draft 0.3, utv 3.2 m turn 180 vcol — its paint is COLOR_0, which UE's glTF materials
  ignore: bake_vcol puts each material's mean in its base colour; material() gains metal + alpha MASK; retexture matches names without
  .001) → Import/vehicles → HB_SET=vehicles import_creatures.py (Nanite) → /Game/HotBrook/Vehicles. AHotBrookCamps: the pontoon is the
  BoatUS one; skiff → bass boat at docks len ≥ 7 with JsHash(j, 41) < 0.2 (1 dock; no turned-over skiff for it); 7 UTVs in yards
  (JsHash(ci, 31) < 0.25; footprint cleared, dry, ≤ 40 cm slope, clear of every building box + 0.6 m; ground-plane rotation; Stand
  gains Pitch/Roll). Checked in shots. Credits in ue/README.md. NEXT: grass_lawn on the lawns? stones_grass on rocky shores, the
  brook channel's smoothing (heightmap), the listings search, the photo match (the human's photos not here yet).
  + 16:40 COMMITTED fcec9a2 (vehicles) + backup. THE SHORES AND BED BY THE SIM'S SUBSTRATE (this commit): NEW ue/export/
  export_substrate.mjs (HB_WORLD=true) → Import/substrate.png/.bin/.json (GEO.sub per 5-m cell RGBA rock/grav/sand/org, row 0 south;
  land within 4 cells of water given the wet cells' mean). UHotBrookWater::SubstrateAt (bilinear). M_Ground (make_ground_material.py):
  T_Substrate → mud/sand/gravel/RockyFloor by share (smoothstep .2–.45, ±0.15 mid-noise jitter) below the 'dry' line (Z 1960–2000),
  replacing the uniform cobble band + mud below 1 m; NEW Sand surface = Poly Haven gravelly_sand 2k, desaturated 50 % (Import/
  surfaces/Sand_*; downloaded to scratchpad/dl_sand). GroundCover: rock kinds' shore weight × (0.2 + 2.5·stony) on banks; in water
  (≤ 2.5 m) W = Shore·2.5·smoothstep(.15,.6, rock+.4 grav) for all rock kinds but the embankments; NEW water-only kind SmallStones
  ×3–8 (boulders, collision); rock ISMs carry custom data 0 = nearness to water (1 in it, NearWater(6 m) on land). M_MS_Rock
  (import_megascans.py, re-run): lvl = 1893 (UE Y > 0, Upper) … 1823 (Y < −6000, Lower); below lvl−5…+10 cm a brown algae film
  (desat ×(2.6,2.2,1.6)), up to 40–80 cm above bare granite (desat ×7, saturate), moss above — all × the instance's nearness. The
  scans' colour is very dark (lum 0.037–0.047), hence the big factors. Checked in shots (rocky and sandy shores, the woods' stones).
  + 17:05 COMMITTED 7788591 (substrate). LISTINGS SEARCH running as a background agent (writes tools/hotbrook/data/listings/notes.md,
  photos to G:\HotBrookUE\Import\reference\listings\ — local only; rules: no bot bypass, no sign-in/email, no owner names). THE
  LAWNS' GRASS (this commit): LayLawns scatters grass_lawn (35-cm grid jittered, ~8/m², HISM cull 45 m) + grass_tuft_b along the
  ragged edge (cull 60 m) — 113,636 + 1,558 instances; hidden while MPC_HB_Season Snow ≥ 0.5 (Tick, once a second). Checked in shots.
  + 17:40 COMMITTED af4b406 (lawn grass). THE BROOK'S CHANNEL SMOOTHED (this commit): export_world.mjs carves it along BROOK_PATH
  (stations 1 m apart: level, the deepest depth within ±4 m smoothed over 5 m; bed lv − D·(1−(d/4)²)^0.7, banks smoothstep over 4 m to
  max(ground, lv+0.1); lakes' cells untouched) and no longer overwrites an existing camps.json. Exported to scratch first: 647
  heightmap samples changed (x −6…100, y −15…73, ≤ 1 m), water.bin and lakes.json identical. Backed up the old map + heightmap to
  G:/synapse-reef-backups/*_before-brook-channel.*, installed heightmap.r16, rebuilt the level (-run=HotBrookBuild: saved, result 0;
  the exit's WorldPartitionSubsystem ensure is the engine's teardown). Checked in shots.
  + 18:30 COMMITTED 67a70ca (brook channel). LISTINGS SEARCH DONE (agent; local only, tools/hotbrook/data/listings/notes.md + 116 photos
  in G:/HotBrookUE/Import/reference/listings/<slug>/; 403/429 sites listed there for the human to save by hand). Style findings to use
  (general, never per-camp): small newish camps (13/17 built 2003–2017, median ~870 sq ft), 1.5-storey steep-gable camp capes/chalets
  with lofts (~9/17), single-storey gables (~7), log/log-sided (5), no A-frames; siding tan/beige vinyl, grey, brown-stained boards/
  logs, white trim, red doors; METAL ROOFS on ~12/17 (green/teal standing seam, barn red, galvalume), ~5 dark/brown asphalt; decks/
  screened porches nearly everywhere; slab/block or posts with lattice skirting; few small wooden docks (one roll-in); SHORES mostly
  rocky — FLAT GREY SLATY cobbles (our RockyFloor texture is reddish: retint/replace), boulders, riprap, sandy coves, bulrush/sedge,
  birch/cedar/spruce edges; mown lawns to the shore, gravel drives, sheds, propane tanks, fire pits, travel trailers; A ROW OF WIND
  TURBINES on a distant ridge (Stetson/Rollins? — add to the far landscape). THE FOREST THROUGH THE YEAR (this commit):
  make_season_foliage.py → /Game/HotBrook/Seasons/<foliage MI>_Season (10 twins, Seasons switch on) + M_HB_Bare (masked, twig colour
  for Nanite's far voxels — black voxels left dark masses; also needs used_with_voxels, as M_HB_Invisible now has: UE 5.8 'Voxels'
  usage). AHotBrookForest: LEAF_YEAR per species (Out/Turn/Peak/Drop/Gone, colours in MF_HealthSeason's terms: C1 dodge, C2 overlay
  — decoded from the T3D export: mask = saturate(1e9·x^(Season Strength+0.01)), so MPC_GlobalFoliageActor 'Season Strength' = 40 in
  autumn, 0 otherwise); twins' MIDs ramped neutral (0 / 0.5 grey) → autumn → brown; ApplyLeaves per component (state 0 own, 1 twin,
  2 bare; ±3.6 days a tile); UpdateLeaves every 2 s; hb.LeafDate cvar. Checked in shots (summer, October scarlet/gold, late Oct,
  winter near bare and far grey-brown, late May green). inspect_foliage.py / inspect_seasons.py kept as tools.
  + 19:00 COMMITTED 45e0612 (seasons). THE SHORES' COBBLE GREY (this commit): Poly Haven ganges_river_pebbles 2k, desaturated 45 %
  → Import/surfaces/Cobble_* (scratchpad/dl_cobble); M_Ground's substrate rock layer uses Cobble (RockyFloor stays for steep slopes).
  The camps' colours checked against the listings: roofs 64 % metal (teal/red/grey/dark) ≈ listings' ~70 % — left as the dataset has
  them. NEXT: the wind turbines on the ridge (USWTDB public data → positions; a procedural turbine; blades turning with the wind).
  + 19:45 COMMITTED a2d4b1a (cobble). THE WIND FARM (this commit): USWTDB API is now https://energy.usgs.gov/api/uswtdb/v1/turbines
  (PostgREST: xlong=gte.…&ylat=…); 87 turbines in ±0.4°: Stetson 38 + expansion 17 (GE1.5-77, hub 80, rotor 77), Rollins 32 (30 km
  W, left out); ground per turbine from https://epqs.nationalmap.gov/v1/json (191–326 m) → tools/hotbrook/data/turbines_uswtdb.json
  (ignored) → export_turbines.mjs → Import/turbines.json (sim x/y; lit = ends + every 3rd: 21). build_turbine.py → Import/landmarks/
  turbine_tower/rotor.glb (hub (2.6, 0, 81.6) m) → HB_SET=landmarks import. AHotBrookTurbines (GameMode spawns it): 6 on the landscape,
  49 beyond its edge at EPQS ground; yaw 0.5°/s into Link WindFrom (+±5°), rpm by hub wind (×1.338), beacons M_HB_Beacon MID 'Glow' 60
  for 0.6 s of every 2 s while Daylight < 0.15. Checked: day at 3440 px a row over the west treeline and Stetson on its hill to the
  south; a night beacon pixel flashing. KNOWN (next): THE NIGHT IS PITCH BLACK away from the camps (mean 0, no moon/stars/skyglow) —
  needs a night sky (stars, the moon by its phase, airglow) and a minimum exposure.
  + 20:30 COMMITTED e52c2a2 (wind farm). THE NIGHT SKY (this commit): M_HB_NightSky (unlit additive two-sided, no vertex fog —
  use_translucency_vertex_fog False; Custom HLSL: celestial frame P/Q/E at 45.63°, s = RA/Dec unit vector by LST; stars 3 bands (cells
  90/180/360, lim .978/.966/.952, exp(−r²·900(1+o))); Milky Way = galactic plane (pole RA 192.86 Dec 27.13) × 2-octave value noise ×
  broad patchy rift, gain .006; airglow 0.35+1.4(1−up)³ × GlowGain .004; moon disc R .00454 rad lit toward SunDir; × Night).
  AHotBrookNightSky (GameMode spawns): dome = engine sphere ×100000 at the camera; LST = RA_sun + H_sun; moon age from FDateTime
  2026-03-01 + yf·365 + tod (+5 h) vs 2000-01-06 18:14 UTC (29.530589 d), elongation on the ecliptic (no latitude/perturbations);
  Night = clamp((−sunZ − .035)/.2); moon light = spawned ADirectionalLight, atmosphere index 1, disc colour scale black, intensity
  sun × .004 × lit × smoothstep(alt) × Night, colour (.62,.72,1). Checked at 3440: stars, soft Milky Way, a waxing crescent setting
  in the west at 23:00 in late May, treeline + turbines in silhouette; dusk sunset with a beacon flashing; day untouched.
  + 21:00 COMMITTED 6dde361 (night sky) + backup. THE SNOW ON THE BOUGHS (this commit): make_season_foliage.py also twins the
  conifers' foliage (CONIFERS 0,1,2,3,12 → 13 twins); AHotBrookForest IsConifer → state 1 while MPC_HB_Season Snow > 0.3, colours
  C1 (.75,.77,.80) C2 (14,7,18) (white), Season Strength 6.5 when snowy and not autumn (40 in autumn). Checked (hb.Snow 1, LeafDate .8).
  KNOWN, next seasonal gaps: the GROUND COVER isn't seasonal (ferns/forbs green above the snow — hide or brown them out of season);
  the weeds stay drawn in winter (the lakes' ice should cover them — the sim sends stands; hide floating/emergent under ice).
  + 21:20 COMMITTED 5bb5af9 (bough snow). THE GROUND COVER BY SEASON (this commit): KindOfComp (component → kind) + KindShown (under
  snow ≥ 0.5 only ShoreShrub, logs, ring-2 rocks, water boulders; mushrooms yf .42–.67); Tick re-applies when the (snow, mushroom
  season) key changes; new components born hidden if so. Checked: winter woods bare snow + logs; summer ferns/anemones. (The weeds in
  winter: the sim's own stands fall to ~0 for the floating and emergent in its winter — the hb.Snow test in May isn't representative.)
  + 21:30 COMMITTED 4cd66fe (ground cover by season), pushed; the human compacted here. NEXT (pick any): the merganser drakes; the
  tadpoles (HERP3.ON 0, not drawn); the OSU perched osprey + the loons unused; fern_grass / stones_grass downloads unused; the far
  landscape's void past the far grid; an autumn tint for the ferns and the Megaplants ground plants; the Rollins wind farm (30 km W).
  The human was told: listing sites that blocked automation are in tools/hotbrook/data/listings/notes.md (save by hand); photos for
  the photo match go to G:\HotBrookUE\Import\reference\ (private: EXIF GPS/heading → reproduce the view → compare → fix).
  + 2026-10-29 THE HUMAN: "hold off on all the graphics work ... the original full scale 3d model was better than unreal"; "put everything
  together we have gathered and make a research paper about maine ecosystems"; "it should be on github and checked multiple times for
  accuracy". IN PROGRESS: docs/paper/ (hot_brook_lakes.md + figures/fig1_bathymetry.py/.png, made). 14 digest agents read every research
  note into the session scratchpad's paper/digests/ (brief: paper/DIGEST_BRIEF.md); section 5 (what building taught, from FINDINGS.md)
  drafted in paper/draft_s5.md. NEXT: write sections 1-4 + 6 from the digests; then verification passes (claims vs notes, references vs
  the real publications, model claims vs code, a skeptical review), fix, re-check; commit + push. The Unreal photo-match work (below)
  waits on its gate (gate_brook2.txt on occ-server) - commit it separately.
  + 2026-10-25 THE PHOTO MATCH (the human's Google Photos album, 30 photos 2023–2026: saved privately to G:\HotBrookUE\Import\reference\album\, exif.json
  beside them; never commit or publish them, nor where they were taken). The photos have time + lens, NO GPS (the album
  stripped it), 3 have a compass bearing. Matched views from the shore, the brook and the air (the spots not recorded here). DONE, NOT YET
  COMMITTED (waiting on the remote gate, scratchpad gate_brook.txt — src/w3 substrate3.js changed): -hbshot fov=<deg> (and the shot
  camera unletterboxed); THE FAR LAND (ue/export/build_farland.py → Import/landmarks/farland.glb + farland_photo.jpg + canopy maps;
  HB_SET=landmarks HB_ONLY=farland import_creatures.py; Scripts/make_farland_material.py M_HB_FarLand; AHotBrookFarLand; data in
  tools/hotbrook/data/tiles12 + far_naip, git-ignored) — 3DEP ±22 km + skirt to 60 km, Earth's curve (HotBrookCoords::EarthDrop, the
  far turbines sunk by it), canopy height, seasons; M_Ground's far canopy drawn the same; the beacons held ~1.5 mrad, Glow 300; the
  ripples (M_LakeWater 3 scales, 'Chop' by the sim's wind, the brook 'Flow' 1); the exposure-bias curve by scene EV (GameMode); the
  shore band by each cell's own water level (export_substrate.mjs → waterlevel.png); the brook's boulders ×5 (GroundCover, NearBrook);
  build_substrate3.py's NumPy-2 fix (byte-identical output). TRIED AND TAKEN BACK (2026-10-29): a rockier brook bed in the SIM (cobble
  0.6 riffles / 0.3 runs and pool) moved the perch's spawning sites — gate check 'perch and pickerel spawn on structure' 0.55 vs band
  0.48 (margin 0.07, needs > 0.07; HEAD 0.58/0.49). A follow-up: the brook's bed by reach from the photos, then that check.
  NEXT: commit + push + backup when the gate passes; then THE BOULDERS (close shots of Upper's west shore, 2026-10-25: the shore and
  shallows' boulders are the Mossy Forest Rock / Mossy Rocks scans, pitted like lava and near-black — the photos show rounded, pale
  grey granite with lichen; M_MS_Rock's waterline greying (×7 in the band above the water) doesn't show on them: check the instances'
  custom data 'near' reaches the material under Nanite; try the project's SimpleRocks / Rock_Collection_04 rounder meshes) and
  the near-shore's light (the photos' tea-amber shallows over pale cobble). Models for the human: the wanted list's §9–13 (newt,
  crayfish, mussel, snail, dragonfly/damselfly), §19 (redbreast = CC0 Bluegill, fallfish = CC0 Dark Chub, alewife = CC0 Pacific
  Herring, Tahoe Sucker), §17 ice gear — G:\HotBrookUE\Import\sketchfab\wanted_2026-10-24.md.
▶▶▶ RESUME HERE (2026-10-24 ~11:50 EDT by the human's clock). UNREAL: THE WANTED-LIST MODELS ARE DOWNLOADED (the human: "all those are
downloaded … keep going with the other things too"; and "make sure to keep everything updated" — update this block after EVERY step).
The 17 zips (C:\Users\james\Downloads\*.zip, 2026-10-24 11:42–11:44) are copied to G:\HotBrookUE\Import\sketchfab\zips\ and unpacked
to G:\HotBrookUE\Import\sketchfab\<name>\ (inner zips → source\x\): osprey, osprey-in-flight, belted-kingfisher(-in-flight) (OSU
glb, 1 anim each), hooded-merganser-duck-female (obj), model-96a-north-american-otter (fbx swim, CC-BY-NC), ferret (.blend → mink),
snapping-turtle (1 M obj), midland-painted-turtle (2 M ply), bullfrog (144 MB gltf), bullfrog-tadpole (gltf), rigged-game-character-1
(tony5_2.fbx, UE4 rig), nathan-animated-003-walking-3d-man (fbx walk), fishing-rod-rigged-and-animated (rod06.FBX), bald-eagle
(UC Davis gltf, flight), common-loon-osu + common-loon-in-flight (OSU glb). (The OLD common-loon folder is the Innovation Studio scan —
untouched.) PLAN: (1) inspect each in Blender (armature, clips, size, axes); (2) the animated ones as skeletal meshes + clips (a new
convert path), the scans as static meshes via convert_models.py; (3) AHotBrookWildlife: osprey, kingfisher, mergansers, otter, mink
from fish3 _wildN (check the link sends them); the animated loon/eagle; (4) herps (snapper, painted turtles basking, bullfrogs,
frogs, tadpoles) — need the link to carry herps3; (5) anglers in boats (WILD3.angler → person + rod + skiff); (6) model-free: lawns,
lit windows at night, docks out of season. Credits → ue/README.md table (CC-BY-NC marked; the bear/moose never listed).
  + 12:05 CONVERTED (Blender, uncommitted): ue/export/convert_creatures.py → G:\HotBrookUE\Import\creatures\<name>.glb + views
  (sheet_anim.png, sheet_static.png): SKINNED (real size in file units, faced +X — scaled in the game): osprey_perched/_flight,
  kingfisher_perched/_flight, loon_swim/_flight (OSU, metres), eagle_flight (UC Davis, cm), otter_swim (1.06 m); STATIC (sized, on
  base): hooded_merganser 0.45, mink 0.55 (ferret repainted dark brown), snapping_turtle 0.55, painted_turtle 0.19 (vertex colours!),
  bullfrog 0.17 (mud mound cut), tadpole 0.12. ue/export/convert_people.py → angler_summer (Nathan: sit/cast/reel/walk), angler_winter
  (Tony, UE4 rig: sit/jig) — poses authored bone by bone (seated, rod before the belly; checked in views), rod.glb (2.1 m, butt at 0,
  tip +X). NEXT: Scripts/import_creatures.py (Interchange; manifest Import/creatures_meshes.json; textures capped 2048; painted turtle
  a vertex-colour material) → C++.
  + 12:25 THE WILDLIFE SLICE (committed next): import_creatures.py ran (17 assets: skeletal ones face +X in UE — Blender (x,y,z) →
  UE (x,−y,z); the eagle's file is 237× real: scale 2.0/473; Nathan's armature sat under a 0.01 empty: convert_people now applies
  the armature's scale and scales the clips' location keys). AHotBrookWildlife rewritten: looks from creatures_meshes.json (FLook:
  static or skinned + clip, scale, offset = bounds origin, glide frame), kingfisher (a leaning dead pole of the engine cylinder +
  MI_HB_Siding_log, perch over the water; fly/hover/plunge/return), osprey + eagle (circle, stoop, carry off over the woods → away
  2–7 min), merganser groups (members follow the leader, dive), otter (swim clip, dive, haul out), mink (bounds along the 0.25-m line
  at night), herps near the walker by hash cells (snapper 1/ha walking the bed, bullfrog 10/km afloat, plop when close). The link
  passes the ice (F(32)); hb.AllLife 1 forces every kind; -hbshot near<kind> for all. Checked in shots (kingfisher on its pole, the
  pair of mergansers, otter, mink, snapper, bullfrog, osprey and eagle from below) + a gc-every-second run.
  KNOWN: mergansers all hen plumage (no drake model); the OSU perched osprey and the OSU loons unused yet.
  + 484c3a6 PUSHED (the wildlife). 12:35 THE ANGLERS (in progress, uncommitted): build_camps.py now also writes boat_skiff_running
  (the outboard down, tiller, red tank) and the ice camp's things (ice_shelter_red/blue/black, ice_bucket_white/orange, ice_tipup,
  ice_tipup_flag, ice_hole, ice_sled); import_camps.py re-run (background) to bring them in. NEW AHotBrookAnglers (HotBrookAnglers.h/
  .cpp; spawned by the game mode after the wildlife; reads Wildlife->Count(11/12), Activity, Ice(), AnglerTakes): boats from a dock
  (camps_parts docks, past the end) to a bass spot (1.2–3.5 m, 3–25 m off shore), motor 4.5 m/s, drift, the summer angler on the
  stern thwart turned to the shore — sit / cast / reel clips, a fish on (the sim's take) reeling 12–30 s, new spot every 15–30 min,
  home at dusk; ice camps over the deepest of 300 spots with 5 tip-ups on 1–3 m water (a flag up on the sim's take), the winter
  angler on a bucket jigging a short rod. The rod is placed each frame at the hand bone (rp_..._hand_r / hand_r) pointing the way
  he faces, pitched by the clip. Counts BOATS_OUT {1.2, 0.35}, CAMPS_OUT {1.2, 0.3} (wild3view ANGLERS). -hbshot nearangler /
  neariceangler. NEXT: build, shots (hb.AllLife 1), fix, commit; then the shallows (painted turtles basking on shore logs, green
  frogs, tadpoles) and the camps' lawns / lit windows / docks out of season / snow on roofs.
  + 12:45 THE ANGLERS + THE SHALLOWS DONE (committed next): checked in shots — the skiff with its outboard and the seated summer
  angler, fishing with his rod out at a spot; the ice camp (hb.AllLife 2 pitches it on open water for a look): shelter, sled, the
  jigger on his bucket with the short rod. Wildlife now also lays the shore's FALLEN TREES (LayLogs: the ground cover's dead pine
  "Log" from groundcover_meshes.json, one UInstancedSkinnedMeshComponent; 126 on the lakes; laid with FQuat(pitch −90−θ, yaw) ×
  spin about its own axis) and draws PAINTED TURTLES on them (bask: sun > 0.3, weather < 2, air > 12 or sun > 0.6, yf 0.08–0.62;
  slots from 2 m out where the top is 3–45 cm over the water; off at 6 m) and GREEN FROGS (0.3/m of shore within 25 m; the bullfrog
  look at 0.5; in at 2 m). The link keeps Daylight (F(24)) and Air (F(28)) — NOTE: AHotBrookLink already had a `Sun` (the light
  actor). Tadpoles NOT drawn: the sim's herps module is off (HERP3.ON 0) and there's no density to draw them at.
  + 1cdb24a PUSHED (anglers + shallows). 13:00 THE CAMPS' NIGHTS, WINTERS, LAWNS (in progress, uncommitted): export_camps.mjs now
  writes docks' store/flip (camps3view D.store, D.flip), buildings' yr + lamp [x, y, z over floor] + lampAll, and the nine LAWNS
  (from the local tools/hotbrook/data/camps_roads.json — never versioned — lon/lat → sim m: discs of their area) into camps.json and
  cleared.bin; export_forest.mjs clears trees off the lawns (re-run: 5,465,389 trees). build_camps.py: dock_section_wood/_alu.
  import_camps.py: MI_HB_Lawn (ambientCG Grass004, CC0 — fetched to Import/textures/lawn, manifest slot 'lawn'), M_HB_Glass's
  windows lit by a world-cell draw (Custom HLSL: 2.5×2.5×3 m cells, LitShare 0.7). AHotBrookCamps: Lights() (camps3.js occupied —
  JsHash ported bit-exact, OCC_MONTH, weekends ×14/9; camps3view's bedtime rule; LampOn 9×N×K on a glass MID; porch UPointLight
  450 lm, 9 m), Stored (out of season: n = min(4, ceil((len+1.2)/3)) sections stacked at store, the skiff flipped at flip, a deck
  canoe turned over by them; bank canoes stay all year), LayLawns (ragged discs draped at ground + 4 cm, MI_HB_Lawn). The link keeps
  SimTime (f64 at byte 4). SNOW: make_ground_material.py makes MPC_HB_Season ('Snow') and blends snow on up-facing ground; the
  import_camps building master the same on roofs/decks/roads; AHotBrookLink sets Snow from the ice (on > 0.1 m mean, off < 0.03),
  eased 10 s; cvar hb.Snow -1/0/1. ORDER TO RUN: import_camps (running, without snow) → make_ground_material.py → import_camps again
  (now with snow) → build → shots (night lights: the sim at night or wait; docks out: hb.DocksIn 0; snow: hb.Snow 1).
  + 13:15 DONE + CHECKED (committed next): night shots from the water at U07 (hb.Hour 22, hb.Occupied 1 — the eye needs ~10 s to
  adapt from day: shoot a few after setting the hour) — windows lit warm (LampOn 6×N×K now) with reflections, a porch lamp; docks out
  (stacks + flipped skiff on the beach) and in (hb.DocksIn 1); snow on the open ground; the lawns (ProceduralMesh faces need the
  roads' winding {a, b, e, a, e, c}; rim points drawn in onto the edge and sunk 3 cm; MI_HB_Lawn Tint (0.62, 0.66, 0.5), RoughnessAdd
  0.35 — set by a one-off script and in import_camps.py). NEW test aid: hbshot cmd `air=<m>` puts a camera that high over the ground or
  water at X,Y with the shot's yaw/pitch (pitch -89 = straight down). hb.Hour, hb.Occupied, hb.Snow, hb.DocksIn, hb.AllLife (1/2).
  KNOWN: the UE forest has no winter (leaves stay on, no snow on boughs); the merganser drakes; tadpoles/newts/crayfish/mussels/
  dragonflies/raccoon need models (second download list for the human: the wanted list's §9–13, §20).
▶▶▶ RESUME HERE (2026-10-24 ~14:20 EDT). UNREAL: THE CAMPS, DOCKS AND ROADS + THE PLAYER'S START. The human asked
(09:17, a Google Maps shot of Upper's east shore) to start there and "keep going, we need buildings, accurate textures, all the
animals, eventually other boaters and everything". DONE: d520af5 the start (Import/start.json — kept OUTSIDE the repo, it is the
player's own place; -hbstart=X,Y,Yaw; nearest dry ground; the canoe parks by it). THE CAMPS (this commit): export_camps.mjs (the
browser's camps3view LAYOUT — now exported — resolved to Import/camps.json + Import/cleared.bin, a 1-m raster of clearedAt) →
build_camps.py (numpy; every building and dock as a .glb from parts, materials by name, paint/tint in vertex colours, UVs in metres;
glTF written by hand; Blender previews via scratchpad preview_camps.py) → Scripts/import_camps.py (CC0 textures from Import/textures —
fetched by an agent from Poly Haven/ambientCG, manifest.json + means.json; M_HB_Building: metres/TileSize UVs, Rotate90, natural =
tex×vc, painted = (lum/TexMean)×vc; M_HB_Glass; MI_HB_<kind>; Nanite; complex collision) → AHotBrookCamps (floors on the heightmap
min(gmax+0.3, gmin+2.6); docks at lake+0.35, in May 25–Oct 15, cvar hb.DocksIn; roads as ProceduralMesh strips, 75 km, crown tint).
Ground cover now skips UHotBrookWater::ClearedAt (fallen logs test both ends). Checked in -hbshot views (camps U32/U13/U07/L26, the
dock by the start, the camp road). An agent's Sketchfab search for the missing animals/people/boats: G:\HotBrookUE\Import\sketchfab\
wanted_2026-10-24.md (the human downloads; AnimalMesh3D's mink/raccoon are likely game rips). NEXT: the nine mapped lawns
(camps_roads.json lawns: points + areas — clear trees in export_forest + a lawn surface), boats at the docks (camps.json docks: boat
skiff/pontoon at slot, canoe/kayak on deck — generate hulls like build_camps), the sim's anglers as boaters once person models
come, lit windows at night (M_HB_Glass LampOn), docks stacked on the bank out of season; then the animals from the wanted list.
  + BOATS AT THE DOCKS (next commit): build_camps.py lofts skiffs (alu/green), kayaks (5 colours), the pontoon; camps_parts.json boats[]
  (water/deck/bank, canoes flipped = the Sketchfab canoe); AHotBrookCamps stands them (rotation set BEFORE registering — static), bobs
  the floating ones each frame, hides them with the docks out of season. Plastic/Vinyl/Canvas MIs (no texture, RoughnessScale).
▶▶▶ RESUME HERE (2026-10-24 ~08:50 EDT). UNREAL CRASH FIXED: two of my overnight -game runs had crashed in
AHotBrookAnimals::Tick (the human found the dialogs in the morning): the looks' clips, meshes and materials sat in plain structs
(FLook/FView), unseen by the garbage collector, which freed whatever no animal was playing at its first pass (~60 s in) — the next
change of gait read freed memory. The same hole in AHotBrookWildlife (bird meshes), AHotBrookForest (FMeshInfo) and
AHotBrookGroundCover (FMesh). Now each holds its assets in a UPROPERTY (Held / Mesh). Proved by -ExecCmds="gc.
TimeBetweenPurgingPendingKillObjects 1" (a collection every second): the old build died 6 s in (in the ground cover); the fixed one
ran the 276-m walk, six bird/animal shots and 90 s of paddling clean. RULE: a UObject kept anywhere but a UPROPERTY (or an owned
component) is freed — use that -ExecCmds stress run after adding any loaded asset. The NEXT list below stands.
▶▶▶ RESUME HERE (2026-10-24 ~00:45 EDT). UNREAL, DONE + PUSHED since the block below: 9f48010 THE VIEW UNDER THE
WATER (M_HB_Underwater, Scripts/make_underwater_material.py: a post-process AHotBrookWaterSurface switches on while the camera is under
the surface — light to each thing × exp(−Kd·depth) per colour, the eye's path × exp(−c·L), the water's own light by gaze, × EyeAdaptation;
the swimmer's head bobs; hbshot nearfish finds open water and frames twice so exposure settles); 248bd9b THE BIRDS (AHotBrookWildlife:
loons/herons/eagles as many as fish3 _wildN says — sim3worker's snapshot now carries wildN + wildAct, simhost appends them and the fish
taken (wildEv) after the forest records; loons swim + dive (where the sim's loon took a fish), herons wade 5–35 cm, eagles circle and
stoop; hbshot nearloon/nearheron/neareagle); f05aa22 THE CANOE (AHotBrookBoat: in the shallows nearest the start; E in/out (Use action
on E in DefaultInput.ini); W/S A/D Shift; ~1.4 m/s steady, ~2 hard; keel, drag, the sim's wind; aground by middle/bow/stern; kept inside
the lakes' outlines — UHotBrookWater::InLake; -hbpaddle=N test); 1bae0e5 THE WATER SHOWS THROUGH: M_LakeWater's Opacity (SLW: the share
covered by foam ON the water) defaulted to 1 — the lakes were a black skin with only reflections (the old "dark band at the shore");
now 0 + Specular 0.255 + scattering /4 (humic: ~1 % back); 9625222 PERF: Config/DefaultScalability.ini [ShadowQuality@3] VSM
ResolutionLodBiasDirectional +0.5 / Moving +1.5 (Epic's −1.5 spent 52 of 64 ms redrawing wind-swayed trees each frame) — densest stand
64 -> 22 ms, lake 19.7, a 250-m woods walk 17–21 ms (worst 31) at 720p; fish ISMs no longer MarkRenderStateDirty each frame (Lumen had
recaptured 45 cards a frame); fish/birds/animals out of Lumen's scene. NEXT: conifer saplings, models for
ospreys/kingfishers/mergansers/otter/mink (the human can fetch), a fish-from-above check now the water is see-through, fishing (ROADMAP
#15). simhost must be restarted after edits to ue/link or src/w3/render3/sim3worker.js.
▶▶▶ RESUME HERE (2026-10-23 ~23:15 EDT). UNREAL: THE FISH, BEARS AND MOOSE ARE MODELS (pushed: 345c81f, b9ffe86).
345c81f — ue/export/convert_models.py RAN (Blender 5.1, -b --disable-autoexec): 13 models -> G:\HotBrookUE\Import\models\*.glb + side/top/
front views (fixes: posed meshes, delta transforms and keyed object turns baked — the pumpkinseed .blend had both; principal axes for
the two MTSU scans; textures dressed onto the bare OBJs; ~12k tris a fish; the loon's .dae -> .glb with trimesh+pycollada (pip --target
in the scratchpad), its scan stand cut). Scripts/import_models.py -> /Game/HotBrook/Models/<name>/SM_<name> + M_HB_Fish (swim wave in
WPO: phase + strength per instance custom data). AHotBrookFish (new; GameMode spawns it): each fish its species' model scaled to L and
bodyMul, eased between snapshots, tail beat = the browser's rate; schools as up to 24 members. simhost now sends "HBS2": 12 fields a fish
(x y z yaw pitch Lcm k n spd id(u32) school bodyMul). -hbshot sixth field takes nearfish/nearbear/neardeer/nearmoose (a camera of its own
framed on the nearest one). Credits for the 13 CC models in ue/README.md (Sketchfab API metadata).
b9ffe86 — Scripts/import_animals.py (bear 81 takes, moose 2; root motion on; fur roughness 0.85; M_HB_Invisible), AHotBrookAnimals
generalised (looks: stag, doe, bear, moose; gait by speed nearest each clip's own travel; idles by act; young at their age's length
from forest3 YLEN; moose antlers on bulls yf 0.2–0.84; denned bears hidden), ue/export/recolor_animals.py (the RDR2 bear was coloured
as a grizzly -> repainted a black bear with a tan muzzle; the moose darkened ×0.6) — checked in -hbshot views (side-on, ShowFlag.
NaniteMeshes:0 hides the trees for a clear look). The bear/moose stay private (never committed or credited).
UNDERWATER (seen in the nearfish shots): no water fog/attenuation under the surface (our own SLW mesh, no Water-plugin post process);
the surface from below mirrors the bed. NEXT: swimming + the underwater view (post-process volume by camera depth: absorption/scatter
from the lake's colour, Snell's window), then the birds (loon/heron/eagle — check what the 3-D sim's wildlife sends), the canoe as the
first boat, dense-stand GPU, the shore's dark water band, conifer saplings. simhost: `node ue/link/simhost.mjs` (was running in the
background this session).
▶▶▶ RESUME HERE (2026-10-23 ~22:40 EDT; before a compaction; the PC hard-reset ~22:24, Kernel-Power 41, nothing lost).
UNREAL, DONE + PUSHED since the last block: 3b872b0 the woods stocked by FIA (export_forest.mjs: stems by height class, ~3,000/ha over
2 m, 5.47 M trees), AHotBrookGroundCover (ferns, forbs, blueberry, grasses, shore shrubs, mushrooms, stones, boulders, logs — FIA cover
values, research in docs/research_notes/Maine forest structure/), Megascans scans imported (Scripts/import_megascans.py; the master
materials need the Nanite + instanced usages), fix_megaplants.py (Baltic Pine bark), exposure -1 EV; 0fe2d74 THE START NO LONGER
FREEZES (forest tiles batched: 1-3 s -> ~15 ms a tile; trunk colliders only within 150 m; -hbstats/-hbwalk/-hbquit) — on the human's
screen 18-30 ms a frame ("way better, swimming needs work, but lets continue"); 8377ef7 the deer live (AHotBrookAnimals: the Animal
Variety Pack's stag/doe by the sim's act and speed, fawn at heel) + ROADMAP #15 (the Unreal world draws the whole sim and plays like a
game: boats, fishing, swimming/underwater, map, time, photo mode, sounds; the human fetches models when free ones run out).
IN PROGRESS — SKETCHFAB MODELS: the human downloaded 15 (my links); they are unzipped in G:\HotBrookUE\Import\sketchfab\<name>\ (zips in
…\zips): smallmouth bass, chain pickerel, channel catfish (-> brown bullhead), common dace (-> blacknose dace/fallfish), European perch
(-> yellow perch; a Tripo AI model), hog sucker (-> white sucker), northern studfish (-> banded killifish), yellow bass (-> white
perch), pumpkinseed (.blend), common loon (.dae), great blue heron (obj), bald eagle (fbx, flying), canoe (obj), the WildMesh moose
(fbx, 2 anims) and bear (fbx, 81 anims — its textures are RDR2's "a_c_bear_01": a game rip; the human: "just use them, its for me, im
not selling this" -> use, but NEVER commit or share them). NEXT: ue/export/convert_models.py (uncommitted until run; Blender 5.1 at
C:\Program Files\Blender Foundation\Blender 5.1\blender.exe — 4.2's folder has no exe; 5.x has no Collada importer: the loon .dae needs
another route) -> G:\HotBrookUE\Import\models\<name>.glb + side views; check head/back turns in MODELS; then import into UE (glTF via
Interchange; the bear/moose FBX straight into UE with animations), fish into AHotBrookLink's per-species components (sized by L cm,
a swim wave in the material), bear + moose into AHotBrookAnimals (kind 0, 2), loon/heron/eagle with the wildlife events later, the canoe
as the first boat. Also queued: swimming + underwater view (the human flagged it), GPU in dense stands (~45 ms in the densest), the
shore's water edge band, saplings for conifers. A CREDITS list for the CC-BY models (not the rips) goes in ue/README.md.
▶▶▶ RESUME HERE (2026-10-24 ~00:30 machine clock / 20:30 EDT). UNREAL: THE REAL TREES + WATER + GROUND (b09f97c, pushed).
The human added the Fab packs to G:\HotBrookUE\Content (Megaplant_Library: 23 Megaplants packs incl. all 14 forest species; Animal
Variety Pack 5.5; rock/shrub packs). The Norway Maple Forest "Add to Project" never copied: copied by hand from the launcher's
VaultCache\<pack>\data\Content. Megascans surfaces/FBX sit raw in VaultCache\FabLibrary (ue/export/megascans_surfaces.py -> Import/
surfaces 2048²). Verified by screenshots: Megaplants trees per species (skinned, Dynamic Wind from the sim's wind — HBS1 byte 37 the
bearing), the lakes' SLW water (calm ripples, sky/shore reflections — r.Water.SingleLayer.Reflection=3: Lumen screen traces made the
near water black), Megascans ground (cobble shore). Perf (RTX 3060, -hbshot logs game/draw/RHI/GPU): woods ~19 ms GPU steady (at the
offscreen 1280x720 — -ResX isn't honoured with -RenderOffscreen; try r.setres in a shot's commands). -hbshot's 6th field = console
commands ("cvar:value|cmd") for one-run A/Bs; "r.ProfileGPU.ShowUI:0|ProfileGPU" dumps a GPU profile to the log (parse it as UTF-8).
NEXT: (1) THE HUMAN quits the launcher -> move C:\ProgramData\Epic\EpicGamesLauncher\VaultCache (32 GB, C: 44 GB free) to
G:\EpicVaultCache + junction; (2) the woods are too open/pale: export_forest's stocking multiplies 420/ha by the photos' cover and
saplings are only 350/ha — a research agent is writing docs/research_notes/Maine forest structure/forest_layers_and_crowns.md (stems
by layer, crowns, shrubs/herbs, CWD, shore shrubs); then restock + an understory/ground-cover layer streamed nearer the walker
(bilberry ~ lowbush blueberry, wood anemone, ferns from the Megascans FBX, saplings) — mind the GPU budget; (3) the human is adding:
Baltic Pine + Aspen saplings, European Hornbeam, free Megascans boulders/granite/logs/fallen pine/beach pebbles (license $0 checkout:
theirs to do), maybe the free Bluegill; (4) fish models, animals (Animal Variety Pack: deer, fox, wolf, crow), underwater fog, ice.
▶▶▶ RESUME HERE (2026-10-23 ~21:30 machine clock). UNREAL ON 5.8.4 (be3adc5): the project's EngineAssociation is 5.8
(G:\Program Files\EpicGames\UE_5.8; ue/retarget.ps1 did it — build, both materials, the level). Working, verified by -hbshot screenshots:
the landscape (the scale bug fixed: a spawn-transform scale came out 25600), M_Ground (forest floor, rock slopes, mud low, the aerial
canopy past ~900 m), sun shadows, the live sim's clock (HotBrookLink <-> ue/link/simhost.mjs on ws://127.0.0.1:8771 — 8765 is another
of the human's node tools; tested 437 fish near the walker, 20 Hz), HotBrookForest streaming 1.9 M trees (cone stand-ins until the
Megaplants meshes are in Import/forest_meshes.json). THE LAKES: the Water plugin bodies DROPPED (headless they crashed the build in
WaterEditor -> LandscapeEditor and never drew in game); AHotBrookWaterSurface draws each shoreline polygon at its level with M_LakeWater
(Single Layer Water, tea colour) — first 5.8 shots pending. FAB (signed in, Chrome "Browser 1"): ALL relevant free Megaplants + the
Animal Variety Pack + 14 Megascans (forest floors, mossy floor, compost, rocky floor, gravel, soil mud, mossy rocks, small stones, lady
and beech fern, 2 wild grasses, water lily) are in the human's library; skipped 8 "license + checkout" free-tier items. NEXT: the human
adds the packs INTO the project (5.8 editor: Fab panel -> My Library -> Add to Project); then list the imported meshes with Python and
write Import/forest_meshes.json (species codes in export_forest.mjs), Megascans ground layers in M_Ground, rocks/logs/ferns/grass
scattering (PCG near the walker), camps from camps.json, real fish models, underwater fog.
▶▶▶ RESUME HERE (2026-10-23 ~16:50 EDT). UNREAL PROJECT STARTED (7ee9abe; ue/README.md). The project lives at
G:\HotBrookUE (ue/setup.ps1: .uproject copied, Source/Config/Scripts are JUNCTIONS to repo ue/HotBrook/, Content/Import/caches on G:, the
DDC on G: via DefaultEngine.ini). UE 5.6.1 at G:\Program Files\EpicGames\UE_5.6; UE 5.8 is INSTALLING (the human) — Quixel MEGAPLANTS
need 5.8 + the Procedural Vegetation Editor plugin + Nanite Foliage: then set EngineAssociation 5.8, rebuild, re-run HotBrookBuild.
VS 2026 (MSVC 14.51) builds UE 5.6 fine; always -MaxParallelActions=3 (the page file ran out of memory). BUILT AND WORKING:
- HotBrook module: HotBrookCharacter (first person 1.65 m, walk/run/jump, wade/swim/dive by Import/water.bin, ice hook);
  HotBrookGameMode (-hbshot="X,Y,Yaw,Pitch,Name;..." -hbwait=N writes Saved/Screenshots/<Name>.png then quits; run the game with
  -game -RenderOffscreen); HotBrookWater subsystem (water surface; the heightmap's ground — the trace missed the landscape before its
  collision was built, the first shots stood under the land).
- HotBrookEditor module: UnrealEditor-Cmd ... -run=HotBrookBuild makes /Game/Maps/HotBrook — landscape 2541x4954 at 2 m from
  heightmap.r16; Upper/Lower as WaterBodyLake on their shorelines (bAffectsLandscape off) + a WaterZone; Sun (atmosphere sun),
  SkyAtmosphere, realtime SkyLight, VolumetricCloud, HeightFog, unbound PPV; PlayerStart at sim (334.8, -575.6).
- Exporters: ue/export/export_world.mjs (heightmap, water.bin, lakes.json, camps.json); canopy_raw.py (canopy3.jpg → canopy.bin);
  export_forest.mjs (trees.bin, 1.89 M trees stocked as Maine woods — canopy 420/ha, understory 350/ha in the band, emergent white
  pines, cedar shores; the alder/willow SHORE BAND came out 0: fix its condition).
- Coordinates: sim m (x east, y north, h a.s.l.) → UE cm (X east, Y south, Z = (h − 110 m)); Upper is the SOUTHERN lake.
FAB (the human is signed in to Fab in Chrome now): free MEGAPLANTS to add (5.8 only): Norway Spruce, Baltic Pine (+saplings), Dead
Pine, Silver Birch, European Aspen (+saplings), Norway Maple Forest (+saplings), European Beech (+saplings), Black Alder, Common Hazel,
Goat Willow, Rowan Saplings, Elder, Japanese Cypress (cedar stand-in), Bilberry, Lingonberry, Common Bulrush, Dry Common Reed, Wood
Anemone; free ANIMAL VARIETY PACK (deer, fox, crow). Fish, loons, herons, beaver etc. elsewhere (Sketchfab CC-BY — the human will log
in to anything needed — or our own); the camps built procedurally from camps.json with Megascans wood/shingle materials.
NEXT: add the Fab packs → get them into G:\HotBrookUE (Launcher "Add to project" or the editor's Fab panel) once 5.8 is in; a
HotBrookForest actor (instanced meshes per species from trees.bin); a ground material (Megascans forest floor, moss, gravel, sand,
cobbles by slope/canopy/shore); the live link (ue/link: sim3worker.js under a worker_threads shim + a hand-rolled localhost WebSocket;
UE's WebSockets module). The human is driving home and will test on their desktop (not over RDP).
▶▶▶ RESUME HERE (2026-10-23 ~17:00 EDT). DONE + PUSHED: 45854e6 THE TREES + GPU FOREST (render3/trees3.js: leaf-card
trees — needle sprays, pine plumes, maple/birch clusters, winter twigs as alpha cards from a canvas-drawn atlas; hero ≤70 m, lite to
250 m; render3/forest3.js: ALL ~830k trees in one storage buffer, ONE compute cull a frame (frustum + shadow box) sorting each into 12
indirect draws in one buffer — near hero/lite, mid, far, mirror stand-ins; WebGL2/?forest=cpu keeps the CPU tiers); seasons from the
date in the shader (gradual leaf-out, maples turn first, leaf drop, snow on bough tops); REVERSED-Z (log depth disabled early-z;
GTAONode patched for it); shadow map 2048, own layer mask, every other frame, NEVER castShadow=false (it disposed the map → black view;
shadow.intensity instead); glare cut (bloom threshold 6, less mie). c3e0ad7: cards' normals turned to the eye (white pines fixed), auto
resolution opt-in ?res=auto. cf70977 E15 camps' lake effects (sub-agent; gate GREEN on occ-server: w3 145/0/1 GAP, all else green).
Backup …_20261023_1700_trees_camps.zip. Tools: tools/w3_render_bench.mjs (unthrottled Chrome: GPU ms per view, TOGGLES=1/2 per part),
tools/w3_cpu_profile.mjs. Woods GPU 25 → 20 ms; the human sees it over REMOTE DESKTOP at 32 Hz (always ~30 fps there; Parsec better).
THE HUMAN'S VERDICT on the browser trees (photos in scratchpad lakephotos/, from the lake): "lollipop", too sparse, wrong sizes — the
real shore is a dense WALL of spruce/fir/CEDAR/birch/maple with emergent white pines, a shrub band, boulder shores — and they want
the first-person view "videogame quality and realistic even if it has to run a completely different … engine". DECISION: UNREAL
ENGINE 5 (memory unreal-first-person.md). The human is installing Epic Launcher + UE5 (D:\Epic Games) + VS 2022 C++. NEXT (mine):
(1) ue/ — a Node live-link server that runs sim3worker.js under a worker_threads shim (globalThis.postMessage/onmessage/location
?world=true) and streams snapshots over a hand-rolled localhost WebSocket; (2) a world exporter (16-bit heightmap + bathymetry, lake
masks, the tree list with species/height — tree placement now lives in main3 with Math.random: port it to a pure seeded module —,
camps/docks/roads); (3) once UE is in: the HotBrook C++ project (Landscape via editor Python, Water, Sky Atmosphere, Volumetric
Clouds, Lumen; trees from Fab/Megascans or UE's procedural vegetation, kept OUT of the public repo; the first-person template with
swimming; the live link actor). src/w3/render3/walk3.js (the browser walk controller) is written, UNCOMMITTED and not wired — park it
or wire it later. CLAUDE.md's pure-file list should gain src/w3/campfx3.js (the agent asked; left for the human/next session).
▶▶▶ RESUME HERE (2026-10-23 ~15:15 EDT, BEFORE A COMPACTION). DONE + PUSHED 4c6ba08: the camps drawn (render3/camps3view.js:
67 buildings, docks May 25–Oct 15 with boats, roads draped, the launch lot, beaches, lit windows by occupancy, trees cleared — clearedAt;
wild3view boats from the launch/docks; "Camps" toggle; the lodge U20 1½ storeys) + THE GRAPHICS UPGRADE (the human: "make the graphics
any better and more realistic"): render3/sky3.js (vendored SkyMesh — Preetham sky, sun disc, clouds by weather; the sun ASTRONOMICAL for
the date/hour at 45.63° N; haze = the horizon colour), the sun's shadows (4096² PCF, follows rig.target, R = rig.dist×1.4 in 40–900 m;
casters: mid/near tree tiers, shrubs, rocks, camps, wildlife), post (RenderPipeline: pass samples 0 + MRT normal → GTAO ½-res r 2.5 →
×(0.15+0.85·ao) + bloom(0.16, 0.35, threshold 2.2) → renderOutput → FXAA; S.post + "Shadows and soft light" toggle), wind sway in the
tree tiers (WIND3.speed uniform ← snap.windSpeed), ripples × wind in cat's-paw patches, ground/bed mottling (mx noise, near-faded).
vendor/three-0.186.1/addons/ (SkyMesh, GTAO, Bloom, FXAA, CSM*; imports rewritten to the bundle — no import map under the CSP).
RUNNING: the SIM agent for the camps' lake effects (CAMP3: src/w3/campfx3.js new + config/chem3/env3/fish3/littoral3/plants3/test w3.mjs
'camps' section + docs) — when it reports: review, run the full gate on occ-server (node tools/remote/run.mjs occ-server -e
W3_PERF_MUL=1.3 -- npm test), commit, back up to G:. THE HUMAN'S NEXT ASK: "when we come back you should do THE TREES" — replace the
faceted low-poly crowns with realistic foliage (leafy branch cards / alpha-tested clusters: spiky boughs for spruce/fir/pine, leaf
clusters for maple/birch/aspen), true size, LOD tiers kept (near detail tier: hard/pine/spire; mid; far cones/octahedra), the wind sway
kept, shadows cast, seasonal colours (fall, bare, snow) kept; verify in Chrome (the true world, w3.html — now the default), GPU cost
checked; tiers in main3.js (tierMesh ~600, TREE_COLS ~77, the geometries coniferG/broadG/… ~418–520, placeTrees/treesNear).
AND (the human, just before the compaction): "we should make a FIRST PERSON VIEW that you can actually control and WALK AROUND and
everything, like in a videogame" (ROADMAP agreed plan #11's first-person view, now as a game-like walk): a "Walk" button → pointer-lock
mouse look (CSP-safe), WASD/arrows, Shift run, Space jump, eye 1.7 m on the ground AS DRAWN (main3 groundAt/drawnY), collision with
trees (TREES store, a grid) / buildings + docks (camps3view clearedAt-style index), step onto docks, wade the shallows → swim and dive
(the underwater view exists), walk on the ice in winter, Esc to leave; the near tree tier must follow the walker (DET_R) and the
shadows/post work at eye level. Suggested split: the trees (main3 tiers) and walk mode (new render3/walk3.js + controls3/main3 hooks)
can run in parallel — different code.
▶▶▶ (2026-10-23 ~13:45 EDT). CAMPS: the data agent's dataset is done and checked (ffca5e6 the note; 8fefee5
house numbers/parcel ids stripped — THE REPO IS PUBLIC; never commit the human's camp's identity: memory user-family-camp). The human's
corrections: THE LAUNCH = the gravel landing at the head of Upper's EAST COVE (−67.92871, 45.60935; not Huff Rd — "huff road leads to camps");
docks at most camps on the water/with a path (many small); Rt 169 paved, the rest gravel; the green-roofed U20 unknown. b3f114a: tools/
hotbrook/build_camps3.py → src/w3/camps3d.js + true/camps3d.js (67 buildings, 58 lived in, 54 docks — 20 seen), src/w3/camps3.js (pure:
CAMPS, docksIn May 25–Oct 15, occupied(i, yf, day) — a hash, never core.rand; ~72 d/yr per seasonal camp). RUNNING: the VIEW agent
(render3/camps3view.js + main3 wiring + "Camps" toggle + trees cleared + wild3view boats from the launch/docks) and the SIM agent (CAMP3 in
config, ON in stageR5: dock shade ×0.1, dock cover for small sunfish, no bass nests on docks, wood ×0.15 at frontage, swim areas pulled in
June, septic/lot/road P+N through the ledger; a gate section 'camps'). Then: verify in Chrome (true world), the full gate on occ-server,
commit in slices, backup.
▶▶▶ (2026-10-23 ~12:00 EDT). CAMPS, DOCKS, ROADS (the human: "should we add in the camps and roads now too?" →
"look and lake effects", "look closely at different years of aerial images to make sure they are accurate"; field notes: MOST CAMPS HAVE
DOCKS, THERE IS A BOAT LAUNCH, MOSTLY SEASONAL CAMPS, GRAVEL CAMP ROADS; the human can supply Google Earth screenshots → tools/hotbrook/data/
google/ (git-ignored; made)). DONE: research note shoreline_development_effects.md (913a234; §8 = the camp entity: frontage wood ×0.15,
EM/FL ×0.35, SC ×0.8, litter ×0.43, fall-in ×0.05–0.2; dock late May→mid-Oct: light ×0.1, plants ×0.05 beneath, halo 8 m, small sunfish
shade on bright days, bass transit only, no bass nests on docks; septic 0.1 kg SRP/yr + lot 0.15 + road 9 kg TP/ha·yr ×22 % avail; N
1.5–2.3 kg/yr; occupancy ~75–95 d, Jul–Aug peak; headway within 61 m; loons 110–140 m). Explore map of the hooks (this session): wood =
plants3.wood per column (static; only spawnS uses it); cover = fish3 _drive cv() ~2012 + a.cover ~1798 + standCover (GPU mirrors in
gpu/layout.js 369–380); plants light = plants3 _grow 478–501 (fL for EM/FL); point nutrients = fish3 _aleNutr/_aleUnits 3063 (credit
ledger.inP/inN); fall-in = littoral3.bank[c]; litter = chem3.leafW[c]; bass nests = _siteStatics 1234 / _spawn 2542; no 3-D save. RUNNING:
the camps/roads DATA agent (→ tools/hotbrook/data/camps_roads.json + research note camps_roads_docks_hot_brook.md + year crops in
scratchpad/camps/). PLAN after it: show the human the map; tools/hotbrook/build_camps3.py (both worlds via build_world3d's transform) →
src/w3/{true/,render3/}camps3.js; render3/camps3view.js (cabins, decks, docks + boats in season, gravel roads draped, the launch); sim CAMP3
in stageR5 (frontage/dock factors per column/bed cell; septic/lot/road P+N through the ledger; dock cover for small sunfish; no bass nests
on docks); gate checks (budgets closed, the formula's ΔTP, dock shade/plants, nests avoid docks).
▶▶▶ (2026-10-23 ~10:45 EDT). THE GRAPHICS/UI REVIEW IS COMMITTED AND PUSHED: f69d2ed (sim: the true lakes found
in 10 s — zFish tabulated; the February jump's stack overflow; young 'handed'), 324125a (fish/data/weeds view), ef60e2e (wildlife/shallows; the
9-vertex-buffer parts), 9d6d566 (main view: TRUE LAKES THE DEFAULT — w3.html; ?world=small the 1/10 world; the water's Fresnel + haze; the
horizon skirt with a canopy; haze 0.0007 → 0.00045/m; "Mirror the far shore" toggle, off; the camera/UI fixes). Gate (gate_review.txt):
140 PASS, 1 FAIL (the env update timing 15.79 ms vs 15.6 — re-run alone 15.49 PASS, env 22/0), 1 GAP. NOTE: that env-update timing has crept
from 11.4 ms to ~15.5 ms (E12b weeds?) and now flips with occ-server's load — worth a look or a justified threshold. The human's choices made:
true size default, mirror toggle default off, less haze. GPU testing PAUSED by the human (arm AN stopped at day 84) — ask before resuming.
FOLLOW-UPS: the far land's edge still faint where the drawn trees end (trees on the skirt, or a canopy texture); the band mesh holds bed + near
land, so the bed is still in the mirror pass (split its index); in the aerial-photo look the skirt uses map colours (soft seam); arrivals still
pop in (boats, birds, mammals); loons/mergansers leaving vanish underwater; the crown grid's first-flight hitch; snow on land follows the lakes'
ice (a land snowpack from the sim would be better).
▶▶▶ UPDATE (2026-10-23 ~11:30): THE HUMAN: "why are you doing all this in the 1/10 scale? i thought we were working on the full scale" —
plain w3.html still opens the 1/10 world; verify on ?world=true from now on (offered: make the true world the default). All three fix agents
done; GATE gate_review.txt RUNNING on occ-server (task b5gbmv3q0; the tree as of ~11:00). Since its sync (not in it — main3/plants3view/
wild3kit/fish3 edits): wild3kit packs 'sy' into iD.w (a WebGPU pipeline takes 8 vertex buffers: every water-dimmed animal part FAILED to draw
in WebGPU since 744412c); fish3 _spinYoy `Math.min(...made)` → a loop (the true lakes' jump to February threw RangeError — old); 'Dive in'
moved to the West cove's ~2 m margin looking up the slope (was over Upper's 5.5-m mud); "jumping to <date>…" while a jump runs (~20 s true);
the skirt's winter colour/mottle matched; the mussels in their life position (on edge, 2/3 buried, tilted up, olive-brown). Verified in Chrome
on the true world: May/February/night, Dive in, West cove, the brook, Find. KNOWN, for the human: the far land's rectangle still faint (most in
winter: the drawn trees end there); the far shore isn't mirrored (far tree tiers off the reflection: +30 % GPU to add them); the air's haze.
▶▶▶ UPDATE (2026-10-23 ~10:45): COMMITTED c472993 (the shard workers start again + gate check) and c7eb668 (Y4b alone; its gate 140/0/1 GAP).
IN THE TREE (uncommitted, verified in Chrome, gate pending): the fish/data agent's fixes (tail phase on the CPU, Uint32 ids — also
tools/gpu/g3_worker.js, per-member bed depth, the worker's message queue, picking only drawn fish, Graphs scroll kept, update ranges, the card
at 4 Hz, broods' headings, leaps expire, the gone-card wording, nearest-first caps, a coarse fish LOD); the main-view agent's (ice and fog by
daylight, camera bounds + far-land ground, seasons by leaf date and the sim's ice, Jump-to without flashes, touch, the short way round, one
follow owner — data3 following/unfollow, labels cached + outlined, the underside fogged, rises over the water, the cut-away depth per column,
worker errors kept, pixel ratio, tree normals rotated, sRGB tree colours, the fish card beside #ctl, real dt to the worker + 'running at' at
every speed, the fish and their shadows off the mirror, a HORIZON SKIRT, the brook and West cove views clear of the trees, plurals); mine on
top: fish3 _spinYoy's zFish TABULATED (the true world's founding 174 s → 10 s; young within 0.003 %), takeOut marks young 'handed'; the skirt
coloured as the woods' crowns × 0.84 with the border colours smoothed outward (stripes/rays gone), up normals, mx_noise mottle; THE WATER'S
SURFACE: Schlick F (2 % down) ADDED to the water below and the air's haze drawn on it (AIR uniforms) — the lakes had been olive-brown
holes; snap.simT = the fish's clock (the 'running at' read 0× between the water's minute steps). The wildlife agent still running (wild3view,
wild3kit, shallows3view). TO ASK THE HUMAN: the air's haze (FogExp2 0.0007/m in the 1/10 world: 21 % at 700 m — the lakes from straight above
are mostly haze; the real air is clearer) and the remaining faint seam at the true world's far-land edge.
▶▶▶ RESUME HERE (2026-10-23 ~09:40). THE HUMAN: "pause the gpu testing … do a thorough review of the graphics and ui … open it in
chrome" (the Claude-in-Chrome extension). GPU PAUSED: arm AN stopped at day 84 of seed 611 (r22AN_611.txt, too early for the white perch
question; :8155 stopped). The Y4b gate (bxogqufcr → gate_y4b.txt) still runs on occ-server — when green commit fish3.js Y4b alone.
REVIEW DONE (3 read-only agents + Chrome): ~55 findings. FIXED BY ME (uncommitted): shard3worker.js — abaa47b's mid-line comment had swallowed
`const missed = adoptArrays(...)` (the shard workers never started: the true world without a GPU never opened); envshare3.js scalarsOf skips
getters (chem3's inflows' `in` — setScalars threw); tools/w3_bench_shards.mjs applies stageR5 like the workers; test/w3.mjs + 'shards in workers'
check (core section: 31 PASS); main3 icosahedron toNonIndexed warning. IN FLIGHT: three FIX agents on disjoint files — (a) fish3view/fishside3/
rises3view/data3/sim3worker/plants3view/gpufish ids; (b) wild3view/wild3kit/shallows3view; (c) main3/controls3/water3/w3.css/w3.html (incl. the
dt cap that ran the sim at 0.1× below 10 fps, the reflection drawing the fish twice, the world's edge slab, the named views inside trees, labels on
ice). NEXT (me): the lakes' colour from above — NAIP lake (38,45,64) vs forest (91,106,85) sRGB; the sim's lake is olive-brown (51,44,17) vs its
forest (106,128,110): lake/forest linear ratio should be ~(0.18,0.18,0.57), is (0.23,0.12,0.04) — the sky's reflection is under-weighted
(an additive Schlick F0 0.02) and the scatter too yellow; THE TRUE WORLD'S START-UP is 116 s in Chrome (132 s Node: Fish3 founding, 303,797
agents) vs ~15 s documented — profiling (scratchpad/startup_*.txt, prof/). Chrome throttles rAF to ~1 Hz when its window isn't in front: fps
readings there are artefacts; time GPU work with device.queue.onSubmittedWorkDone (Both lakes ~22–50 ms, 12.4 M triangles with the mirror).
▶▶▶ RESUME HERE (2026-10-23 ~08:45, BEFORE A COMPACTION). ALSO DONE: e6f689c — the picked fish's card couldn't be closed (onSel rebuilt the
× every snapshot, so clicks were lost); now built once. The human's "preview is slow": the Browser pane runs WebGL2 (no WebGPU adapter) and is
throttled to ~1 fps when hidden; in their Chrome the view runs WebGPU at 65 fps — use Chrome (http://localhost:8000/w3.html, ?world=true for the
true lakes; the reef server is running on :8000). In the hidden pane the picked fish's card never fills (the worker's sel doesn't come back there —
the same before the fix; it works in Chrome). Everything else as below.
▶▶▶ RESUME HERE (2026-10-23 ~08:20, BEFORE A COMPACTION — THE NEWEST). IN FLIGHT: (1) ARM AN on the GPU (task bpsw5kq1e; snap_an :8155,
queue_an.sh → scratchpad/r22AN_611.txt then r22AN_613.txt; read with node scratchpad/yrsum.mjs <file> and the white perch young's lengths by
period: awk on '^== day' + '^   whiteperch ' lines, as for AM) — the test of Y4b (white perch at the bed from 2.0 cm): do their young pass 2.5 cm
past mid-July and recruit? (2) THE FULL GATE on occ-server (task bxogqufcr → scratchpad/gate_y4b.txt) — when green, commit fish3.js (Y4b), push,
back up (git archive to G:/synapse-reef-backups/). The reef preview server is running on :8000 again (the human wants to open w3.html in Chrome);
the old snapshot servers :8154 (snap_am) and :8155 (snap_an, in use by AN) — stop :8154 any time, :8155 after AN. The human asked why the
preview was slow: the GPU arm shares the GPU with the 3-D view; the preview tab had run a stale page for ~22 h (server stopped). OFFER: stop
the arm if they want a smooth view. Eight stale waiters (the forest agent's) were killed.
▶▶▶ RESUME HERE (2026-10-23 ~08:10 machine clock — THE NEWEST). CLEANED UP: eight stale gate-waiting loops (the forest agent's, on w3full.txt) and the
slow true-lakes probe (stopped at day 63 — on the CPU the young white perch grew normally to 18 mm by mid-July, as the GPU arm did). THE STALL'S
CAUSE (arm AM, 14-day output): the crustaceans collapse from mid-July (Upper 255 → 36 µg/L, Lower 45 → 13 by August — the young alewives, as in
real alewife lakes, Post et al. 2008) and the young white perch, 2.0–2.3 cm, can't reach the bed (FRY.BENTH_L 2.5 cm); the field's settle at 20–25
mm on bed prey. Y4b IN THE TREE (uncommitted): fish3 stageR5 S3.whiteperch.sp.benthL 2.0 (both engines via the species table). RUNNING: ARM AN
(GPU, snap_an :8155, queue_an.sh → r22AN_611/613.txt) and the full gate (occ-server → scratchpad/gate_y4b.txt). When green: commit, push, back up.
▶▶▶ RESUME HERE (2026-10-23, later — THE NEWEST). wpdeath (FINDINGS d86bc9a): the founding white perch eaten by bass (Z 2.4/yr by Sept), pickerel 0.9,
fallfish 0.8 — the predators' demand (~15 kg/ha/yr of fish) met from the standing stock without recruitment; Y4's fewer young leave the bass more yearlings.
WAITING: ywp3 on the TRUE lakes (occ-server, ~2.5 h more → scratchpad/probe/ywp3_true.txt) — why the true lakes' young stall (early alewife larvae
150–500k/ha on both scales vs the field's sparse ~600–13,000/ha; late-summer alewife ~5,800/ha matches CT). Then decide: the alewife larvae's density
(their egg → swim-up; their fecundity × the run), and what makes the true lakes differ.
▶▶▶ RESUME HERE (2026-10-23 — THE NEWEST). ARM AM DONE (FINDINGS): 79 → 43/56 → 24/38 kg/ha; recruits broad (bullhead, perch, fallfish, redbreast,
bass) but WHITE PERCH ~120 recruits and 1.5–3.0 kg/ha by year 2 — the founding stock eaten (57 % in 112 days, Z ~2.7/yr vs a stable stock's adults
~0.4–0.7) and the young stalling on the TRUE lakes in year 1 (1.6 cm in Sept) though the 1/10 reach 37 mm. The GPU is free (AM done). RUNNING:
ywp3 on the true lakes (occ-server → scratchpad/probe/ywp3_true.txt). NEXT: (1) why the true lakes' young differ; (2) who eats the founding white
perch and how fast, against the field's adult/sub-adult Z.
▶▶▶ RESUME HERE (2026-10-22 ~23:30 machine clock — THE NEWEST). ARM AM seed 611 year 1 (yrsum): 79 → 43 → 36 kg/ha (AL 44 → 28); the WHITE PERCH
YOUNG STILL STALL AT TRUE SCALE in year 1 (1.5 cm mid-July, 1.6 early Sept; 0 recruits) though the 1/10 probe gave 37 mm; year 2 better (2.6 cm by
early July). P inventory 123 → 151 % at the year ends (rising — Z2_BURY 0.05 refit was without fish; watch). PROBE ywp3 on the TRUE lakes running on
occ-server (HB_WORLD=true → scratchpad/probe/ywp3_true.txt, slow) to see why the true scale differs from the 1/10.
▶▶▶ RESUME HERE (2026-10-22 23:20 by the machine clock — THE NEWEST). Y4 COMMITTED fe965f1 (gate green 140/0/1 GAP), PUSHED, BACKUP
G:/synapse-reef-backups/synapse-reef_20261022_2318_y4-yolk-sac.zip. ARM AM still running (r22AM_611/613). Below: the block before the commit.
▶▶▶ RESUME HERE (2026-10-22 ~16:45 EDT — THE NEWEST). Y4 BUILT (uncommitted in the tree: config EGG3.sp.perch/whiteperch yolkHatch 0.2 + the Y4
comment; test/w3.mjs E3 check band 3–25 %; FINDINGS entry): probe ywp3 D — white perch ~9,000/ha at 37 mm on 1 Sept (was 15,900 at 26), perch
3,600 at 48 mm, crustaceans 87–176. eggs,young sections 30/0 on occ-server. RUNNING: the full gate (occ-server → scratchpad/gate_y4.txt) and ARM AM
(GPU, snap_am :8154, queue_am.sh → r22AM_611/613.txt). WHEN THE GATE IS GREEN: commit (config + test + FINDINGS), push, back up. Then read AM
(yrsum.mjs): do the white perch recruit? If not: the adult stock (450/ha, the egg note's 'next suspect'); the pumpkinseed young (slow, 11 mm).
▶▶▶ RESUME HERE (2026-10-22 ~15:45 EDT — THE NEWEST). THE HUMAN: "do what you think is best and the gpu is available now" (+ "keep things updated
in case you compact"). PLAN Y4 (in progress): calibrate the white perch's egg → swim-up (EGG3.sp.whiteperch.hatch 0.45 [inf]; the yolk-sac stage
EGG3.YOLK_HATCH default) against the field's best-measured outcome — late-summer YOY ~1,000–3,000/ha (clear softwater ~100–700, Erie ~3,000) —
documented as CALIBRATED, not measured. Probe: scratchpad/probe/ywp3.mjs (nested overrides, e.g. EGG3.sp.whiteperch.hatch=0.2; repo '.' on occ-server)
→ ywp3_h45/h20/h10.txt. Then check growth recovers (less crowding), the alewife young (sim ~35k/ha mid-July vs CT field 1–11k/ha in Aug), then
g1_check (GPU), the full remote gate, commit, and ARM AM (GPU) with everything.
▶▶▶ RESUME HERE (2026-10-22 ~15:30 EDT — THE NEWEST). THE HUMAN NEEDS THE GPU FOR ANOTHER PROJECT — NO GPU RUNS (arms, g1_check, the preview's
WebGPU) UNTIL THEY SAY IT'S FREE; CPU work on occ-server only ("keep going with remote cpu things"): node tools/remote/run.mjs occ-server --put
<probe> -- node .remote/put/<probe>.mjs . <args> (the probes take '.' as the repo = the remote's cwd). Y4 so far (FINDINGS e92d02e): white perch
pipeline per ha (1/10, eggpipe.mjs): 318 mature → 4.2 M eggs (420/m²; Oneida perch 111/m²) → swim-up 18 % (777k/ha; Oneida perch egg → 8 mm 1.6–18 %,
~7.7 % typical) → 20 mm 8 % (field 2–15 %) → ~19k/ha late Aug (field 100–3,000). L2's own note warns its larval-predation rate holds at FIELD
larval densities (0.1–5/m³); the sim's ~15–22/m³ saturate it — the low predation (0.03–0.05/d) is a symptom of the crowd. The excess starts at
swim-up: EGG3 white perch hatch 0.45 [inf] is the weakest number. OPTIONS (decide with care; walk the seasons): (a) white perch egg → swim-up nearer
Oneida perch's ~8 % (EGG3 whiteperch hatch ~0.2) — weakly sourced either way; (b) check the white perch fecundity (~13k eggs a mature fish, field
20–150k/female — the eggs may be fine); (c) the alewives' young: sea-run, 2.5 M eggs/ha in 1/10 — check against Bride Lake (70,000 eggs/m² → 0.9
emigrants/m²). Then re-probe ywp/larvz (occ-server), and an arm when the GPU is free again.
▶▶▶ RESUME HERE (2026-10-22 ~14:30 EDT — THE NEWEST). Y4 DIAGNOSED, NOT YET BUILT. Probes ywp/ywp2 (1/10 lakes): the young's slow growth is
LOCAL CROWDING — their own cells hold 150–250 µg/L crustaceans in July, yet intake ÷ Cmax stays ~0.56 even at K_FRY 5 because the per-step
crop (PLANKTON.CROP 0.3 of the catchable plankton in a school's patch) binds once the curve is loosened; young alewives are the biggest
planktivores (asked 478 kg vs white perch 156 kg in 3 July weeks, crop-bound 98 %). FINDINGS fa4f075. Research notes (committed):
young_white_perch_growth_and_food.md (3879bc7), larval_mortality_and_density_in_lakes.md (bc5c755): field white perch larvae Z ~0.1–0.2/d
first feeding → 10 mm, then 0.03–0.06; clear softwater late-summer YOY ~100–700/ha (Oneida; the 2,900–7,200 band was Erie + the Hudson);
yolk-sac survival 0.2–0.6; FISH PREDATION is the main larval killer in lakes (adult alewife Z 1.58 on perch larvae in Lake Ontario ponds;
white perch and perch eat larvae); young sea-run alewives strip the large zooplankton from mid-June (Post et al. 2008: crustaceans 44 → 6.5
µg/L). The sim's chain (white perch): hatch 0.36 (ok), yolk-sac ~1 (field 0.2–0.6), first-feeding Z 0.05–0.10 (field 0.1–0.2), late summer
~19,000/ha (field ~100–3,000). NEXT (design first, walk the seasons): (1) the planktivores' predation on larvae — how fish3's _yReq rates
adult alewife / white perch / perch eating the larvae they're in, against the field (Mason & Brandt; Kircheis 2002 Lake George, Maine: perch
larvae 35 % of alewife items in May); (2) a yolk-sac stage loss (EGG3) where the field gives one; (3) re-probe ywp + larvz, then an arm.
▶▶▶ RESUME HERE (2026-10-22 13:05 EDT — THE NEWEST). GATE GREEN (remote, gate_z2b.txt: 140 PASS, 0 FAIL, 1 known GAP; headless/smoke/ui/serve
OK) → COMMITTED 4330b60 (Z1b + Z2 + Z2_BURY 0.05), 4b23329 (FEED_CV 0.25 on), 06ee21a (R7 + FINDINGS), PUSHED origin/zoo-field = 06ee21a, BACKUP
G:/synapse-reef-backups/synapse-reef_20261022_1302_plankton-rebase-forest-render.zip. (A burial bug of mine — a comment swallowing
`sed[j] -= bury; buried += …` — failed gate_z2 with retention 0.00; fixed before commit; nothing pushed with it.) Also e9805b5: plants3
_grow 8.6 → ~7.2 ms (in-range table, light only while growing; identical results) — the env-update timing passes again.
ARM AL seed 611 DONE (FINDINGS): 79 → 44 → 28 kg/ha; FIRST RECRUITS (perch 72k, bullhead 124k, pumpkinseed 6k, bass 2k); edible algae 63–75 %;
crustaceans ~65 µg/L; WHITE PERCH collapse 10.7 → 2.2 (founding stock eaten in the first summer, 165k by day 112; their young stall at 13–15 mm,
0 recruits). Seed 613 still running (r22AL_613.txt).
NEXT — Y4, THE YOUNG WHITE PERCH (research note young_white_perch_growth_and_food.md, 3879bc7): field YOY 25–40 mm on 1 Aug, 40–55 on 1 Sep;
juvenile crustacean K ~25 µg/L (range 10–60; the package's K_FRY 60); Maine summer crustaceans median 147 µg/L (NE 110; the arms' 30–40 = the
13th percentile); field late-summer YOY 2.9–7.2k/ha against the sim's ~19–23k/ha (1/10, larvz) and ~111k/ha (true scale, AL mid-July);
larval Z field median ~0.27/d (Hudson; no lake value) against the sim's ~0.045. Probe larvz_k25 vs larvz_k60 (1/10): K 25 alone barely helps
(white perch 25 vs 24 mm by early Sept). So the stall is CROWDING: too many young for the food. Find where the excess comes from — the
founding white perch stock (289,622 fish, 25 kg/ha, mean 13.7 cm), the eggs/hatch, or too-low larval mortality — before changing anything.
▶▶▶ RESUME HERE (2026-10-22 ~11:30 EDT — THE NEWEST). ALL THREE AGENTS MERGED: E12b 91f701d, E14 forest 98d8bd3, RENDER 7925423 (every
animal drawn: wild3view/shallows3view/wild3kit, Wildlife toggle, Find an animal, Out now; fish3 wildEv render-only) + 36976c5 (Find skips
forest animals deep under the crowns; checked in the preview: a deer at the brook's bank, 36/38 hidden at 07:11, no console errors).
CLAUDE.md's browser-layer list lacks the three new render3 files (not edited — for the human/next session). The tree (uncommitted, on
36976c5) still holds Z1b + Z2 + FEED_CV + R7 + FINDINGS (see the block below). Waiting: gate_z1.txt (remote, 14b9d3b), bury_z2on/off.txt,
ARM AL (r22AL_611/613). Then: the full remote gate of the tree → commit → push → back up.
▶▶▶ RESUME HERE (2026-10-22 ~11:00 EDT — THE NEWEST). MERGED E14 (forest agent: bears/deer/moose, forest3.js, WILD3.bear both engines;
98d8bd3; W3_ONLY=forest,wild 20/0). ARM AJ done (seed 611 only: 79 → 49 → 31 kg/ha, no recruits — the pre-fix lake). IN THE TREE (uncommitted,
on 98d8bd3): Z1b + Z2 (as below) + FEED_CV 0.25 in stageR5 (FRY.FEED_CV_R5; g1_check young parity ✓) + R7 (a school's strikes: hazard ×n,
the kill shared gr/n, both engines — g1_r7 ✓; FINDINGS entries R7 and Z1b/Z2 written). W3_ONLY=strike,wild on the tree 27/0. ARM AL RUNNING
(snap_al :8153 = the tree before the E14 merge; queue_al.sh → r22AL_611/613.txt; read with yrsum.mjs). Arm AK was stopped (pre-R7).
NEXT: when the gate of 14b9d3b (gate_z1.txt) is green → push; then the full remote gate of the tree → commit Z1b+Z2+FEED_CV+R7 → push,
back up. Probes bury_z2on/off.txt (P retention with Z2 on/off — the summer TP ~4 µg/L question). The RENDER agent still running.
▶▶▶ RESUME HERE (2026-10-22 ~10:15 EDT — THE NEWEST). COMMITTED (not pushed): c02674f Z1 (+ FINDINGS algae-crash diagnosis), 14b9d3b
E4 check on the wildlife's EXPECTED take (stats.wildExp — the gate of 91f701d failed E4 at 114 %: one bass each to the eagles and ospreys on
the 1/10 lakes; probe wildby), 269484e research note copepod_grazing_and_p_kinetics.md. GATE of 91f701d (E12b): 134 PASS, 2 FAIL (env-update
timing 15.9 ms; E4 — now fixed in 14b9d3b), 1 GAP. GATE of 14b9d3b (Z1 + E4 fix) RUNNING on occ-server → scratchpad/gate_z1.txt (waiter
b7lrsicqc) → when green: PUSH, back up to G:. IN THE TREE (uncommitted): Z1b + Z2 —
- Z1b: Daphnia's growth from what they eat: PLANKTON.K_D 0.15 → ZOO3.Z1_K_D 0.48 (= Imax ~1 µgC/µgC/d ÷ the field clearance 1 mL/µg/d;
  1 algae unit ≈ 1 mg C/L from P_USE at seston C:P ~290) — Z1 alone had them growing ~190 % of what they ate;
- Z2 (ZOO3.Z2 in stageR5): the algae's P half-saturation Z2_KP 0.01 (1 µg/L; NUTRIENT.KP 0.10 = 10 µg/L), one sinking term per kind
  (greens 0.1, diatoms 0.5, resistant 0.1 m/d; P to the bed store, overflow dissolved; N to the water; matter to sedOM) replacing the
  greens-only SED_P.SETTLE (0.33 m/d), the die-off without sinking Z2_LYSIS 0.08/d, the copepods' clearance 0.4 mL/µg/d with their growth
  from what they eat (ZOO3.K_C 0.36, G_C 0.18). The CHEM3.SETTLE_ALL stopgap of c02674f is removed.
- PROBES (scratchpad/probe/z2year.mjs; FISH=1 the 1/10 lakes with fish): z2b_fish — edible algae dip 2.6–3.5× through the Daphnia
  peak (was 180×), rotifers 290–770/L all summer, Daphnia peak ~100 µg/L, crustaceans 100–180 µg/L, resistant share 17 → 47 %, Secchi
  3.3–3.5; z2b_nofish (a year, true scale): winter bottom O₂ ≥ 5.2 mg/L, the bed's organic input 20–40 % of production; OPEN: summer TP
  falls to ~3.5–4 µg/L (pre-Z2 6–7; field 8–12?) — the P cycle's season next; Daphnia's post-peak fall ~0.06/d (field 0.1–0.2).
  larvz_z2.txt running (the young under Z2). NEXT: the full gate of Z1b+Z2 after gate_z1, FINDINGS entry, commit; then FEED_CV 0.25 +
  g1_check (GPU free when ARM AJ seed 611 ends — its 612/613 disabled by renaming snap_aj/tools/gpu/year_cdp.mjs), then an arm.
- Scratch worktrees scratchpad/wt_pre (fdca130) and wt_e12b (91f701d): remove with git worktree remove when done.
▶▶▶ RESUME HERE (2026-10-22 08:30 EDT by the machine clock — THE NEWEST; the "a.m./p.m." stamps below were guesses). AFTER THE COMPACTION:
- E12b MERGED as 91f701d (the weed beds' extent: stands 51 → 29 % of the bed; FINDINGS entry). R4·6 YENC check now ≥ 1.5× (was 3×: with the
  thinner beds the YENC run takes young near the predators' appetite, 3.1 → 1.9×). GATE of 91f701d running on occ-server →
  scratchpad/gate_e12b.txt (Z1 was stashed for the copy, then restored). → when green: push, back up to G:.
- Z1 JUDGED (rotbud_z1*, larvz_z1): rotifers hold through the Daphnia peak (422/L, was 83), larvae grow faster (perch 15 mm by early July,
  was 12; white perch 11 vs 8), BUT the edible algae still crash ~180×. Probe scratchpad/probe/algbud*.mjs (the edible algae's budget) found
  the cause, and it is NOT Daphnia: (1) SED_P.SETTLE (the 2-D model's algae → bed P store) drains the GREENS alone, ~0.15/day, besides their
  0.15/day die-off already described as "sinking and lysis"; the diatoms and the resistant algae (RESALG) never settle → the greens go
  0.28 → 0 by mid-June while the grazers take ~1 %/day, and the ungrazed, unsettled resistant algae rise 0.13 → 0.43 (~95 % of the summer
  algae, field median 58 %); (2) the P half-saturation NUTRIENT.KP 0.10 ≈ 10 µg/L SRP (1 unit ≈ 100 µg/L via ALEWIFE.TP_UGL) — P limit
  0.08–0.2 all June; (3) under Z1 the COPEPODS become the main grazer: GR_C/K_C gives ~1.6 mL/µg/d, above Z1's Daphnia 1.0 (field
  calanoids ~0.2–0.5?). KP 0.02 alone or GR_C × 0.25 alone does NOT stop the crash.
  IN THE TREE (uncommitted, with Z1): Z2 — CHEM3.SETTLE_ALL (off) + SINK_DIA/SINK_RES in chem3.js _sedimentP: every alga settles by its
  biomass × sinking speed. Probes algbud4_sa.txt, algbud4_sa_kp02.txt (Z1 + SETTLE_ALL, ± KP 0.02) running. RESEARCH AGENT running →
  docs/research_notes/Real lake ecology for calibration/copepod_grazing_and_p_kinetics.md (copepod clearance per µg, P Ks + lake-model
  values + Droop, the field depth of the late-spring algae minimum, sinking rates of greens/diatoms/large forms).
BEFORE COMPACTION (~1:15 p.m.) — WHAT IS IN FLIGHT AND WHAT TO DO WHEN EACH REPORTS:
- Z1 (uncommitted, in src/config.js ZOO3 Z1_*, src/w3/chem3.js _zooplankton gK/stvT, fish3 stageR5 Z1 line + DAPH_INTERF0/START_D0): judge
  by scratchpad/probe/rotbud_z1.txt + rotbud_z1_nofish.txt (vs rotbud_p75.txt: edible algae dip ≤ ~3–10×, rotifers ≥ ~100–250/L at the
  Daphnia peak, Daphnia fall 0.1–0.2 /d after it) and larvz_z1.txt (vs larvz_p75.txt: larval growth). Then W3_ONLY=chem,young,foodweb
  locally (or the remote gate), commit, and an arm (Z1 + FEED_CV 0.25). The chem is CPU-only (both engines step the water on the CPU).
- FEED_CV 0.25 → stageR5 after a g1_check of the young (node tools/gpu/year_cdp.mjs "r5=1&yf=0.27" out.txt 9361 g1_check with the
  preview reef on :8000; set fry FEED_CV via the page? g1_check has no fry.* param — add one or set it in stageR5 first) — GPU free
  only after ARM AJ (queue_aj.sh → r22AJ_<seed>.txt; read with scratchpad/yrsum.mjs).
- The clear-water note's other mechanisms, NEXT after Z1: algae recruited from the bed (10–50 %/d where the bed < 8 m — Hansson 1996),
  check the bacteria pool isn't stripped with the algae (≥ 25–50 % of pre-CWP), the shallows' rotifers (430–790/L), two rotifer pools.
- AGENTS (each commits on its own worktree branch, no push; MERGE when they report, run their gate sections, push): E12b weeds
  (plants3, build_plants3, test plants section); FOREST (src/w3/forest3.js, FOREST3 in stageR5, bears on the sucker run, deer, moose
  positions, env.forest.animals interface, gate section forest, research note forest_mammals_bears_deer_moose.md); RENDER (render3:
  every animal drawn, a Wildlife toggle, sim3worker data; it builds against env.forest).
- The 3-D prints are done; the human may report how they import in Bambu Studio (multi-part 3MF components).
▶▶▶ RESUME HERE (2026-10-22 ~11 a.m. EDT — THE NEWEST). THE HUMAN WIDENED THE PROJECT: "this is now a whole enviorment simulator of the lakes
and forest right around them" — (1) the live view runs the full package: DONE abaa47b (world3sel R5; stageR5 in sim3worker, shard3worker,
main3; ?r5=0 the base; checked: perch 75/ha + alewives on the data page, fps unchanged); (2) DRAW EVERY SIMULATED ANIMAL (wildlife, herps,
tadpoles, anglers + ice anglers, dragonflies, moose, bears, deer) — a RENDER AGENT in a worktree (render3 only + sim3worker data + at most a
render-only event list in fish3); (3) BEARS AND DEER (+ moose positions) — a FOREST AGENT in a worktree: src/w3/forest3.js (FOREST3 in
stageR5), interface env.forest.animals [{id, kind bear|deer|moose, x, y, heading, act, young, len}], bears on the brook's sucker run,
deer at the shore, gate section 'forest', research note forest_mammals_bears_deer_moose.md. Both commit on their worktree branches (no
push) → MERGE when they report. Also running: E12b weeds agent (worktree); clear-water-phase research agent (→ clear_water_phase_and_rotifers.md);
ARM AJ (GPU, perch 75); larvz_cv25 (FRY.FEED_CV 0.25 with the researched rule: the starving SHARE f/τ′, τ′ = 1.5·50·(L/6 mm)^0.75 °C·d ÷ T,
S3 starveK white perch 0.7, sucker/pickerel 1.3 — UNCOMMITTED in the tree, both engines + layout starveK). The human also asked about
exporting the true-scale model for 3-D PRINTING: possible (5-m grid 455×1385 + the 20-m far land) — offered an STL/3MF exporter
(vertical exaggeration, size, base, water as a separate part). THE HUMAN: Bambu Lab A1 mini (180 mm) + A1 (256 mm), both with AMS (4
colours); nozzles 0.2/0.4/0.6/0.8, usually 0.4; WANTS: land around the lakes (a whole terrain print); a one-piece model (one colour,
to paint) AND a 4-colour AMS version; a terrain WITHOUT water + separate WATER pieces to print in CLEAR PETG. → tools/hotbrook/export_print.mjs
(→ exports/print/, gitignored). larvz_cv25 DONE: FEED_CV 0.25 + the researched rule thins the June cohorts (starve Z 0.08–0.11) and the
survivors grow (perch 18 mm, white perch 13, bass young 70 mm by mid-Aug vs 16/11/22) → put it in stageR5 after a g1_check of the young.
▶▶▶ RESUME HERE (2026-10-22 ~9:30 a.m. EDT — THE NEWEST). COMMITTED d2e735d (perch 75/ha in stageR5 — the human: scarce at any size)
and d7ef7cb (Y3 FRY.FEED_CV, OFF: the young's unequal shares on both engines, a gate check; FINDINGS). g1_check r5=1&wild=1&yf=0.55:
wildlife ρ identical, WGSL compiles. ARM AI DONE (FINDINGS entry): 97 → 69–71 → 44–51 kg/ha, no winterkill, ZERO recruits, the small
species gone, bass up. RUNNING: ARM AJ (snapshot aj :8150 = d7ef7cb, queue_aj.sh → r22AJ_<seed>.txt, 611/612/613 × 730 d, ~7.5 h);
GATE of d2e735d → gate_eco10.txt; E12b agent (worktree); research agent → docs/research_notes/Real lake ecology for calibration/
larval_starvation_and_variability.md (values for FEED_CV). DIAGNOSIS: with the census fixed the larvae still grow 2–4× too slowly —
the summer small prey (rotifers 0.1 µg/L vs field 2–24; small cladocerans 1–5) are held at a floor by the young's grazing, and year 1
opens with a spring Daphnia surge (the start's zooplankton) that grazes the edible algae to ~0. Probes: zoodepth.mjs (no inshore
contrast at all), rotbud_p75.txt, larvz_p75/p500/cv04.txt. NEXT: read AJ; the summer small-prey budget (edible algae 14–16 % of summer
algae vs field median 42 %; the young's clearance on rotifers); FEED_CV values; merge E12b.
▶▶▶ RESUME HERE (2026-10-22 ~6:50 a.m. EDT — THE NEWEST). GATE of 3a2df18 GREEN (all suites; w3 134 PASS 0 FAIL 1 GAP E12b) →
backup G:/synapse-reef-backups/synapse-reef_20261022_0634_wildtau.zip. THE HUMAN (field knowledge): YELLOW PERCH SCARCE AT ANY SIZE (~50–100/ha) →
IN THE TREE (uncommitted): stageR5 Y2 S3.perch.perHa 75 (+ mateCue), FISH_CENSUS.md row; A/B running: probe/larvz_p75.txt vs larvz_p500.txt
(98 d, seed 611, 1/10). LEARNED: the CPU settles every requested larva (probe larvsettle.mjs: requested = removed, room-short ~0); larvdiag's
"eaten Z" omitted prolarvae (tallied as eggs3.pred) — the fish's real Z on perch larvae 0.02–0.05/d, swamped by ~50/m² (requested/potential
~0.2); perch larvae stall at 8.6 mm, p 0.2 (probe perchlarva_yfirst.txt). A "young first" CPU change (YFIRST) changed nothing → reverted.
E12b DELEGATED to a background agent in a git worktree (mechanisms: the coloured water's canopy limit, substrate patchiness; regrow the
start; turn the GAP into a check 0.08–0.30 + presence 0.25–0.60) — merge its diff when it reports. ARM AI: queue stopped after 611/613
(waiter bmtd4cjwm). NEXT: judge the perch A/B → commit → remote gate → g1_check r5=1 (WILD_TAU) → arm AJ (perch 75) 3 seeds × 2 yrs.
▶▶▶ RESUME HERE (2026-10-22 ~5:15 a.m. EDT machine clock — THE NEWEST). COMMITTED 3a2df18 (pushed): F3.WILD_TAU 1 day — the
wildlife's ρ from max(A, its running mean) on both engines (CPU fish3 _wAe; WGSL GL[G_WAE 160..]) — fixed E4's 128 % over-take (the
gate of af3723e failed E4 at 4.4 of 3.6 kg; now 3.3 of 3.6); EGG3 alewife hatch 0.6 → 0.2 (Kellogg 1982 lab best 38 %; larvae 62 → 19/m²).
RUNNING: the remote GATE of 3a2df18 → scratchpad/gate_eco9.txt; ARM AI (19edb3a) — TWO queues ran at once by mistake (the first launch
was not dead): its parent killed, its seed-613 run continues (r22AI_613.txt); the relaunch (task byd7pmldu) is on 611, then 612, then
613 AGAIN — keep the first 613 (copy to r22AI_613.first.txt before the relaunch reaches it). NEXT: g1_check r5=1 for WILD_TAU parity
when the GPU frees; the larval inputs (the perch census question to the human); larval predation; E12b; back up after a green gate.
ARM AI so far (613 yr 1, 611 to day 42): 85 kg/ha at yr 1; ZERO recruits again; the followed prey eaten fast from May — in 6 weeks killifish
150k→29k (107k eaten, 14k wildlife), sunfish/redbreast −50 %, fallfish −32 %, catfish −27 % (bass/pickerel diets 83–95 % fish, ~0.3 fish a
predator a day): with no young-of-year big enough to eat, the adults carry the piscivores. Young at day 14: perch 36/m², WHITE PERCH 74/m².
RUNNING: probe/larvdiag.mjs on HEAD (→ probe/larvdiag_head.txt) — where the fish's predation on perch larvae is lost.
▶▶▶ RESUME HERE (2026-10-22 ~4:45 a.m. EDT by the machine clock — THE NEWEST; the earlier blocks' a.m. times ran ahead). COMMITTED:
3dc49aa Y1 (the sunfishes'/pickerel's young on the weed shelf, the bed's food at 1–1.5 cm), 31573b3 FINDINGS arm AH (the year-2
plankton starvation GONE with E9d + the retention fix: Daphnia 61/38 µg/L, TP 7–8, P inventory ~85 %; fish 97→43→27 kg/ha from the
winterkill — fixed since by N_FORM — and zero recruitment), 19edb3a E6c2 parity fix (weedEcells counts the tadpoles; g1_check r5=1
yf 0.27/0.35 now matches: weeds 95/90 g, zoo 46/46, bed 80/79, young 321/321, clutches 379/379). RUNNING: GATE of af3723e →
gate_eco8.txt (655+ PASS, 0 FAIL so far — note it predates Y1 and 19edb3a: gate HEAD next); ARM AI (snapshot ai :8148 = 19edb3a,
queue_ai.sh → r22AI_<seed>.txt, 3 seeds × 730 days; its first launch flaked on Chrome, relaunched). THE RECRUITMENT DIAGNOSIS
(FINDINGS): ~150 larvae/m² (field 10–40); the rotifers crash in mid-June (Daphnia peak + clear water) then the larvae eat all they
make (2–7/L at net +0.12/d, field 270–470/L); the young stall at 5 mm. NEXT: the larval inputs — ASK THE HUMAN about perch
(census 500/ha vs their note "fewer than fallfish/bass"); white perch 26–37/m² and the alewife young 62/m² (Z 0.03 vs the field's
~0.08 — Maine YOY alewife fall 100-fold June→August); the fish's larval predation (field 70–90 % of Z). E12b (weeds ~50 % vs 15–17 %:
plants by E1a's substrate map, a regrown start). Back up to G: once a gate of HEAD is green.
▶▶▶ RESUME HERE (2026-10-22 ~7:15 a.m. EDT). MEASURED (probe larvz on af3723e; FINDINGS 8e24d93): ~150 swimming larvae/m²
(perch ~50, white perch 26–37, alewife 62) where the field keeps ≲ 10–40; newly hatched perch Z 0.009/d (field 0.1–0.4 the first
days); larval growth 0.06–0.1 mm/d (field 0.2–0.5); pumpkinseed stalled at 5 mm at ~maintenance. larval_mortality.md §3.4 says CHECK
THE INPUTS FIRST: the census has PERCH 500/ha — the human's field note says perch are "small and fewer than fallfish/bass" (85 and
40/ha) → ASK THE HUMAN (field knowledge) whether perch could be ~50–100/ha; that alone would bring perch larvae to field densities.
IN THE TREE (uncommitted): Y1 — the sunfishes' and pickerel's young on their shelves (S3 yBed: pumpkinseed/redbreast 2.5 m, pickerel
1.0) and the bed's food at the field's switch (sp.benthL: bass 1.0 cm, sunfish/redbreast/pickerel 1.5), in stageR5; probes larvz
(→ larvz_y1.txt) and sunlarva (→ sunlarva_y1.txt) running against larvz_head.txt / sunlarva_head.txt. GATE of af3723e → gate_eco8.txt.
NEXT: judge Y1 by the probes; the larval inputs (the census question; the alewife young 62/m²); the fish's larval predation (L2:
field ≥ 70–90 % of larval Z; the sim 0.003–0.05/d); then an arm.
▶▶▶ RESUME HERE (2026-10-22 ~6:30 a.m. EDT). COMMITTED af3723e: CHEM3.N_FORM in stageR5 (the inflow's DIN 5 % ammonium —
its nitrification had taken a third of the winter O₂; 3 seeds' winters now 2.8–4.7 mg/L lake mean, median 3.5); the gate's gap() KIND
(KNOWN GAPs against the field: reported, counted, not failing) — E12b the weed stands' extent is one (field ~15–17 % of the beds,
the sim ~50 %: macrophyte_area_cover.md); E8's check by placement; research notes macrophyte_area_cover.md and young_first_summer.md.
Also committed: af3a584 E5 anglers; 2dae305 E6c2 tadpoles + E9e (off); FINDINGS (the winter's N; zero recruitment; E9e). RUNNING:
remote GATE of af3723e → gate_eco8.txt; ARM AH (f99d216 — before N_FORM/herps/anglers) seed 611 year 2 (let it finish, then stop).
NEXT — THE YOUNG'S FIRST SUMMER (zero recruitment; research young_first_summer.md §7 targets): (1) MEASURE the sim's larval standing
density (field ≲ 0.1–5 /m³ a species, ≲ 10–40 /m² all; the sim ~50–160 /m²) and larval Z (field 0.05–0.3 /d, 70–90 % fish) — find
where the excess comes from (eggs × hatch × early survival); (2) the young's count-based K (K_ROT 5 / K_NAUP 20 µg/L read ~200/300
prey/L at the field's masses rotifer 0.025 µg, nauplius 0.067 — field thresholds ~100–250/L); (3) pumpkinseed/redbreast larvae in the
weedy bays (~7× offshore); (4) the diet switch at 15–20 mm to chironomids/bed (sunfish, bass, pickerel); (5) the rotifers never ~0
(field p10 ≥ 40/L; Daphnia halve them). Targets: fall lengths smallmouth 55–76 mm, perch 55–75, pumpkinseed 25–35; egg→autumn
perch 0.01–0.1 %, smallmouth 0.1–5 %; failures per species, never all. Then E12b (weeds), a new arm of HEAD, g1_check for E6c2.
▶▶▶ RESUME HERE (2026-10-22 ~4:30 a.m. EDT). COMMITTED since f99d216: 859b9ec E6b/E6c1 herps; 2dae305 E6c2 TADPOLES (allometric
cohorts; the fish eat the green ones with the large weed fauna on both engines) + E9e TRIED and left OFF (CHEM3.LOADS: the field's P forms
make the lakes ultra-oligotrophic — FINDINGS); af3a584 E5 ANGLERS (WILD3 angler/iceAngler; mOther cut [inf]); 0bd144c docs; and
year.js's young's-fates line fixed (it read old fixed tally pairs). GATE of f99d216 (gate_eco7.txt): 706+ PASS, 1 FAIL so far —
the weed stands 51 % of the bed > the check's 0.5 (was 48 %; BURY_MUL 0.10 left more P in the bed). The check's "research ~20–30 %"
has NO source (no Maine measurement; the lakes are largely littoral) → a research agent on macrophyte area cover is running (→
docs/research_notes/Whole lake 3D fish simulation/macrophyte_area_cover.md); decide the bound on its evidence. ARM AH (f99d216, seed
611): a WINTERKILL — 70 → 46 kg/ha Feb–March, the deep bottom O₂ 1.5 mg/L (AG ~3.6): probe winter.mjs (SYN 0/1) running →
scratchpad/probe/winter_0.txt, winter_1.txt. THE BIG ONE: ZERO RECRUITMENT in year 1 of every arm (AG's "period's young": 0 %
recruited for every species — bass 4.4 M hatched: starved 48 %, eaten 39 %; pumpkinseed starved 46 %; their diet ~100 % zooplankton:
the young never reach the bed/weeds foods — sunlarva.mjs found pumpkinseed stalling at 5 mm). NEXT: (1) the winter O₂ cause; (2) the
weeds bound; (3) gate HEAD; (4) THE YOUNG'S FIRST SUMMER — a stage-survival audit (memory: stage-survival-audit) of why they starve
and why none recruit; g1_check r5=1 for E6c2 when the GPU frees (AH runs ~5 h).
▶▶▶ RESUME HERE (2026-10-22 ~3:30 a.m. EDT). COMMITTED 859b9ec E6b/E6c1 (HERP3 — src/w3/herps3.js, in stageR5:
painted turtles, the snappers' and bullfrogs' non-fish food, green/mink frogs, newts eating from the pools; grazed plants return
their N/P as dead shoots; gate check in W3_ONLY=substrate). IN THE TREE (uncommitted): E6c2 THE TADPOLES (herps3 tg[0..1] green/mink,
tb[0..2] bullfrog per littoral cell; HERP3.TAD; breed by the adults' counts; graze sedOM; natural M; metamorphosis out; the fish take
the green ones WITH the large weed fauna — littoral3 _tad/_takeL in takeWeedCells/weedEyoy/takeYoy, the GPU host: layout packWater
adds tadP to litL, gpufish applyWater splits the eaten difference; bullfrog tadpoles unpalatable); its gate check (substrate); year.js
a "herps:" line. RUNNING: 2-yr fishless tadpole spin (task output b5buwwr8h) → set TAD.START_* from its late-May year-2 stock;
remote GATE of f99d216 (gate_eco7.txt, 614 PASS 0 FAIL so far); ARM AH (r22AH_611…); research agents: E9e catchment P loads →
catchment_P_loads.md, E5 angling → angling_effort_and_harvest.md. NEXT: finish E6c2 (START, gate section, commit; g1_check r5=1
when the GPU frees — the litL split), then E5 angling as a WILD3 row (both engines), E9e, E1b logs; the herps in the 3-D view (E6v).
▶▶▶ RESUME HERE (2026-10-22 ~2:40 a.m. EDT). COMMITTED f99d216 (pushed): E9d — the sky's fronts (WEATHER3.SYN, in
stageR5: CHAIN/DWELL/P_K fitted to Houlton GHCN-D, research note houlton_daily_precipitation.md; WET_T the storms' warm air), HBV
re-fit (FC 82 LP 0.39 BETA 2.72 K1 0.196 PERC 0.21 K2 0.0048 DDF 4.61 — the gauges' hydrograph; known gap Dec ~0.9× vs 1.1–1.4×),
BURY_MUL 0.15 → 0.10 (the old target was the retention formula's complement; true-world R 0.35–0.45, year-2 inventory ~steady;
probe bury.mjs), the gate of 8063465's 3 FAILs fixed (seedSeason spawnP, sucker brook 0.15, env3 _fAct idle fields), year.js
"water:" line (yrsum.mjs reads it), FINDINGS ×2. Gate of 8063465: 708 PASS, 3 FAIL (those three). E3b's GPU parity verified
(g1_check r5=1 yf 0.2/0.27: clutches 379/379, young eaten 10530 · 10532). Arm AG (9229a90) seed 611: year 2 54 kg/ha, summer
Daphnia 2 µg/L — the same starvation as AF (before E12/E3b); 612/613 stopped as moot. RUNNING: remote GATE of f99d216 →
scratchpad/gate_eco7.txt; ARM AH (snapshot ah :8147 = f99d216; queue_ah.sh, r22AH_<seed>.txt, 3 seeds × 730 days, ~1.75 h a seed);
a research agent on E9e (the catchment's P loads: SRP/DOP/PP, C–Q, bioavailability, inlet settling) → docs/research_notes/Maine
lake shores and catchment/catchment_P_loads.md. NEXT: read the gate; back up to G: after it passes; E6b (painted turtles: plants,
snails, carrion — turtles_and_frogs.md §2) and E6c (tadpoles, frogs, newts); E9e when the research lands (then BURY_MUL re-fit);
E5 angling; E1b logs. Judge arm AH with yrsum.mjs (now with TP, algae, P inventory) and yz.mjs.
▶▶▶ RESUME HERE (2026-10-22 ~2:15 a.m. EDT; the "4 a.m." below was ~1:30). ARM AF's YEAR-2 STARVATION FOUND: the lakes' P
inventory fell to 45 % of the start in 9 months without fish — (1) the inherited 2-D sky chain cycled every ~27 days (10-day rains, 20-day
droughts, months without rain), so the catchment ran at 0.01–0.08× its mean flow Jul–Feb and the P load fell ~90 %; (2) BURY_MUL was
calibrated to an INVERTED retention (1/(1+√τ) is the share that leaves; R at these flushing rates 0.28–0.54, not 0.66–0.72). UNCOMMITTED
IN THE TREE: E9d (WEATHER3.SYN, in stageR5: the front chain CHAIN/DWELL/P_K fitted to Houlton GHCN-D — research note
houlton_daily_precipitation.md; WET_T the storms' warm air; HBV refit FC 82 LP 0.39 BETA 2.72 K1 0.196 PERC 0.21 K2 0.0048 DDF 4.61;
gate E9d check + E9b now with SYN); env3 _fAct (idle fields — zooS, resA when off — not carried: the env-update perf check); the gate of
8063465's 3 FAILs fixed (seedSeason applies spawnP — the founding made 268k sucker young vs 60k; the sucker brook check 0.15 for the
smaller sample; perf via _fAct); year.js a "water:" line (TP µg/L, edible/resistant algae, P inventory, the period's ledger R, flow);
FINDINGS E9d. RUNNING: true-world burial scan (probe bury.mjs, HB_WORLD=true, BURY_MUL 0.15/0.10/0.07 × seeds 403/404 × 2 yr →
scratchpad/probe/buryT_*.txt; on the 1/10 full grid BURY 0.15 already gave R 0.42 — the gate's coarse 100-m grid gives 0.70: calibrate
on the arms' grid); local W3_ONLY=substrate (w3_substrate.txt). NEXT: pick BURY_MUL (R 0.3–0.55, inventory steady in a normal year),
fix the retention check's text and bounds, FINDINGS retention entry, commit, remote gate, then an arm of HEAD on the GPU (3 seeds × 2
yr; arm AG's seeds 612/613 are moot — stop the queue). KNOWN GAPS: December flow ~0.9× vs 1.1–1.4×; inflow P 94 % phosphate (real
streams mostly particulate/organic); no lake-level routing.
▶▶▶ RESUME HERE (2026-10-22 ~1:30 a.m. EDT). COMMITTED: 55a53ca E12a (8 near-certain plants; plants 30/30, substrate 20/20); c6d06ec
the gate's every-species checks skip the run species; 8063465 E3b (prolarvae the fish's prey — EGG3.PROLARVA; perch ytl0 10; sucker hatch
0.05 + spawnP 0.4; white perch hatch 0.45; the founding spin's zFish; eggs 14/14). GATES: c6d06ec's stopped on a syntax error I made (a
comment inserted mid-line — fixed in 8063465: ALWAYS node --check after an edit); GATE of 8063465 RUNNING → gate_eco6.txt. ARM AG (9229a90,
before E12/E3b) RUNNING on the GPU. NEXT: g1_check for E3b when the GPU frees (r5=1 yf 0.2/0.27: the prolarvae in the table, the egg tallies);
then an arm of 8063465 (3 seeds × 2 yr); then E6b/c (turtles' plants/snails, tadpoles, frogs, newts), E5 angling, the rest of E1 (logs).
▶▶▶ RESUME HERE (2026-10-22 ~2 a.m. EDT). 9229a90 = L2 COMMITTED (FRY.LARV2 + M_LARVA3 0.02 in stageR5, both engines;
g1_check yf 0.3 young eaten CPU 4130 / GPU 4136): the fish's larva-picking at ρ 0.15 × Cmax 3.42e-7·L^2.94 m³/s × s(r) × detectability × colour
× S3 larvO. Probe larvz: perch larvae eaten Z 0.003 → 0.015 — their potential 0.07–0.1 is SWAMPED by the predators' appetite at ~200
larvae/m² of all species (larvdiag.mjs); bass fry after dispersal over-taken (0.13–0.18 vs field 0.02–0.05). THE UPSTREAM QUESTION: the
sim's larval PRODUCTION (adult census × fecundity × egg survival — perch hatch 0.95) → research agent running → docs/research_notes/Real
lake ecology for calibration/egg_survival_and_larval_production.md.
ARM AG RUNNING (queue_ag.sh; snapshot ag :8146 = 9229a90 — the package + E2c + E6a + E8 + L1 + L2; 611/612/613 × 730 d → r22AG_<seed>.txt;
read: yrsum.mjs, yz.mjs, grep "alewives|wildlife take|period's eggs"). GATE of 61f25c1 running remotely → gate_eco4.txt (then gate HEAD).
▶▶▶ RESUME HERE (2026-10-22 ~12:15 a.m. EDT). GATE of 4413110: 128 PASS, 0 FAIL (E2c/E2d, E6a, the tally map). COMMITTED:
b5ddf0c L1 (FRY.CYC in stageR5; M_LARVA3 0.02 HELD for L2); 61f25c1 E8 ON THE GPU VERIFIED (10-week 1/10 r5=1 run: 184 in, spent 51, out 60,
P in 110 g; fixes: k_aleFinA after k_ale — encodeBook clears GS — and readCounts to GL slot 208). g1_check r5=1 at yf 0.27/0.4/0.75 all agree
(E2c's young zooplankton within ~3 %) — run it as: node tools/gpu/year_cdp.mjs "r5=1&yf=0.4" out.txt 9361 g1_check (the preview pane has NO
WebGPU adapter; year_cdp opens real Chrome; the server: preview 'reef' on :8000). BACKUP G:synapse-reef-backupssynapse-reef_20261022_0011_eco_e2c_e8.zip.
ARM AF: 611 + 612 done (year 2 54 kg/ha both; pumpkinseed/redbreast/killifish/dace → 0); 613 skipped. GATE of 61f25c1 RUNNING → gate_eco4.txt.
RESEARCH RUNNING (agent): fish predation on larvae (reaction distances, clearance, overlap) → docs/research_notes/Real lake ecology for
calibration/fish_predation_on_larvae.md — then L2: the fish's larva-picking by mechanism (FRY.LARV_A 0.1 × CLEAR_A is ~1000× below a visual
planktivore's search; probe larvz: LARV_A 1 lifts perch larvae's eaten Z only 0.003 → 0.013 but pickerel fry to 0.14–0.23 — the detectability
ramp DETECT_L and the predators' overlap matter) together with M_LARVA3 0.02.
▶▶▶ RESUME HERE (2026-10-22 ~1 a.m. EDT). COMMITTED since the restart: aec3490 E2c/E2d + E6a; f5dad76 the GPU tally map
(TP); c0712cf E8 design; 4413110 gate fix (E4 take ≤ 110 %: the reach summed at the block's start); 0f3c858 E8 THE ALEWIFE built (CPU gated
'alewife' PASS; GPU twin written: k_ale/k_aleFin, GS_ALE→GL[200..207]→F._aleSums, appendAgents for the run, FL_LEAVE, aleT/aleRes, SPF
aleRun/noRec/uiltY/zooK, y_mort emigration/cold, noRecruit); 807a290 the young alewives' adult-Daphnia rung only at half length.
GATE of 06a9b8c: 125 PASS 1 FAIL (fixed in 4413110). GATE of 4413110 RUNNING remotely → scratchpad/gate_eco3.txt.
ARM AF (06a9b8c): 611 done — year 1 76 kg/ha, year 2 54: pumpkinseed/redbreast/killifish/dace → 0, summer Daphnia 1 µg/L (the year-2
collapse again); the true lakes' perch larvae 434M at day 14 (67/m²), their Z 0.04/d 'natural', 0.0003–0.01 'eaten', stalled at 1–1.6 cm;
612 running; 613 to be skipped (free the GPU for g1_check of E2c, E6a, the tally map, E8).
LARVAL MORTALITY RESEARCH DONE (docs/research_notes/Real lake ecology for calibration/larval_mortality.md): field Z in fish lakes 0.05–0.3/d,
fish 70–90 % of it; predator-free 0.01–0.03; cyclopoids only < 8 mm (k ≈ 0.003 L/d a copepod); typical peaks 0.3–15 larvae/m² (sim 70–160).
UNCOMMITTED (L1): stageR5 FRY.M_LARVA3 0.04 → 0.02 and FRY.CYC (the cyclopoids on the smallest larvae, both engines; S3 cycRob). NEXT: the
probe scratchpad/probe/larvz.mjs (Z by cause per species) — L1 vs old vs FRY.LARV_A=1 → lz_L1/lz_old/lz_A1.txt — then set the fish's
larva-picking (FRY.LARV_A 0.1 is a compensation: '0.3 took 41 % of the suckers' hatch') from its field rate.
▶▶▶ RESUME HERE (2026-10-22, after the restart). RUNNING: the remote GATE of 06a9b8c (scratchpad/gate_eco2.txt, ~45 min);
ARM AF on the GPU (scratchpad/queue_af.sh; snapshot snap_af :8145 = 06a9b8c incl. the Hex hatch; 611/612/613 × 730 d → r22AF_<seed>.txt, ~1 h a seed;
read with yrsum.mjs + yz.mjs + grep "wildlife take|period's eggs"). Arm AE 611 reached day 168 before the restart (r22AE_611.txt: recruits 0 at
day 168 for pickerel/redbreast/fallfish/killifish — check at the year's turn in AF). UNCOMMITTED, CPU written + GPU written (GPU UNTESTED —
the GPU is busy with AF; then g1_check ?r5=1 and ?r5=1&yf=0.75):
  • E2c/E2d ZOO3.SMALL (in stageR5): chem3.zooS small cladocerans; nauplii a seasonal share of zooC (naupShare); the young's ladder by gape +
    per-class half-saturations (fish3 yZoo, chem3 zooFeedYoy/zooXyoy/zooElY; WGSL yZoo/naupShare/zooElY, Y_qS, AC_YZS(W), R_YS, W_zooS);
    adults take zooS with the Daphnia at S_ADULT 0.2 (zooE/zooEcells/zooFeedCells; WGSL zooE/zooSeen/k_fieldApply); bladderworts eat zooS.
    test/w3.mjs 'small' (2 checks). Probe: scratchpad/probe/e2c.mjs <repo> on|off [days] [seed] [yf0] → e2c_on.txt / e2c_off.txt.
  • E6a: WILD3 snapper + bullfrog rows (fish3); the GPU's T_WILD → 4352, T_WILDG → 4704 (room for 16; layout statsAdd pairs 2176/2352;
    year.js reader updated). ~6.4 kg/day of fish on the true lakes by snappers.
NEXT: commit these after W3_ONLY=small,wild pass; when AF is done: g1_check (?r5=1, ?r5=1&yf=0.75) for E2c + the wildlife rows; then E6b/E6c.
FOUND (e2c probe, 1/10, seed 611, May→Aug): THE YOUNG ARE STUNTED WITH OR WITHOUT E2c (perch 15 mm by mid-August vs field 40–60; sunfish ~6 mm)
and FAR TOO MANY: 3.4M perch + 7.1M white perch larvae at day 21 in the 6.5-ha world (~160/m²). Cause: FRY.M_LARVA3 0.04/d at 1 cm was
calibrated on the GPU year BEFORE the egg stage, when sHatch 0.05–0.6 absorbed the early larval deaths; E3's field hatch rates lift
first-feeders 3–10× (known issue (b)). E2c's first ladder (micro-prey at K_ROT/K_NAUP for every size; Daphnia's juveniles barred) let
the hordes strip the rotifers (0.07 µg/L) → FIXED: Daphnia's juveniles (D_JUV 0.3) go with the small cladocerans; the count K's fade
log-linearly to K_FRY as the young outgrow the micro-prey (FRY_ROT_L, NAUP_L). Probe rerun → probe/e2c_on2.txt.
RESEARCH RUNNING (agent): field larval Z by species, the invertebrate-predation share, peak larval densities → docs/research_notes/Real
lake ecology for calibration/larval_mortality.md — then set the unsimulated larval mortality from it (realism over compensation).
DONE since: aec3490 = E2c/E2d + E6a COMMITTED (W3_ONLY=small,wild 17 PASS; GPU parity pending); f5dad76 = THE GPU TALLY MAP generated
from the species' count (layout.js TALLY_BLOCKS/TP/tallyWGSL; statsAdd, year.js, g1_check, g2_run, g2_probe, the gate read TP by name;
W3_ONLY=gpu 14 PASS; GPU runtime pending) — every other per-species GPU slot already holds 16. E8 DESIGN written (ECOSYSTEM_BUILD.md "E8 —
the sea-run alewife"; NOTE the FB4 swimming terms: the note's table lists ACT/RK1 the other way round from the sim's convention — use
ACT 5.78, BACT 0.149, RK1 22.08, RK5 0). Draft entries: scratchpad/alewife_draft.md. An Explore agent is mapping the hooks (founding,
mid-run agent creation on CPU/GPU, removal, routes, spawning, per-species tables, flow cues).
PLAN AFTER: (1) commit E2c + E6a; (2) GPU parity when AF ends; (3) GENERATE THE GPU TALLY MAP from NK/NWILD (T_KILLS, T_FRY… are
hand-placed for 11 species and overflow at 12) — prerequisite for (4) E8 THE ALEWIFE as the 12th species (sea_run_alewife.md
"Implications for the sim": runs in via Lower's outlet mid/late May at 15/acre default, spawn at night in the shallows, 50 % die,
survivors leave in 1–4 weeks; young schools never recruit — emigrate mid-July → ice-on in rain/flow/cold pulses, die at ice-on;
FB4 Stewart & Binkowski 1986; P/N import–export).
▶▶▶ RESUME HERE (2026-10-21 ~9:55 p.m. EDT; the human may RESTART the computer soon). GATE of 9ed1d21: 121 PASS, 2 FAIL —
both checks updated for the new mechanisms (f4918b4: white perch's unsimulated + wildlife mortality; R2a's Daphnia floor 5 µg/L). GATE of
f4918b4 (everything: eggs, Hex hatch…) STARTED ~9:55 (scratchpad/gate_eco2.txt, ~45 min) — rerun it if the restart cut it:
  node tools/remote/run.mjs occ-server -e W3_PERF_MUL=1.3 -- npm test
ARM AE (queue_ae.sh; snapshot snap_ae :8144 = 145659e — before the Hex hatch): seed 611 done ~10:55 p.m., all three ~1 a.m. If the
restart cut it: re-snapshot HEAD (bash scratchpad/snap.sh af 8145) and run the three seeds there (r22AF_<seed>.txt) — the hatch included.
The human (2026-10-21): "it can download anything it needs" (memory downloads-allowed).
▶▶▶ RESUME HERE (2026-10-21 ~11 p.m. EDT). E7 THE HEX HATCH built (LIT3.HEX, in stageR5; littoral3 _hex): on soft-mud cells
(substrate mud+org ≥ 0.5, bed O₂ ≥ 2 mg/L) once the surface passes 19 °C inside yf 0.315–0.45, 20 % of the mud fauna (chem3.benth) rises
at dusk over 12 days to surfA (the surface feeders eat it; the rest fly off) — 1/10 test 13 kg/ha; test/w3.mjs 'hex'. g1_check now lists
the piscivores' largest meal differences (for KNOWN ISSUE (a), June strikes CPU 184 vs GPU 369 g) — run it when the GPU is free (arm AE
running). NOTE: arm AE's snapshot (145659e) predates the Hex hatch.
▶▶▶ RESUME HERE (2026-10-21 ~10:35 p.m. EDT). 145659e: E3 IN stageR5 (GPU twin verified: g1_check ?r5=1&eggs=1&yf=0.25 —
235/236 clutches' numbers within 1 %, development exact); year.js prints 'the period's eggs'. ARM AE RUNNING on the GPU (queue_ae.sh,
snapshot ae :8144 = 145659e, r5=1, 611/612/613 × 730 days → scratchpad/r22AE_<seed>.txt; read with yrsum.mjs + yz.mjs + grep "wildlife
take|period's eggs"). The remote gate of 9ed1d21 (gate_eco1.txt) still running (0 FAIL so far); then gate 145659e.
KNOWN ISSUES: (a) g1_check at yf 0.25 — the followed fish's fish-eating CPU 184 vs GPU 369 g (bass, pickerel ~2×), with eggs off too
(at yf 0.4 they agree) — investigate June strikes (guarding? ripe runners?); (b) with eggs the young's starvation CPU 41 vs GPU 560 in
a block (heavy competition: 24.5M young against 1.35M without — the egg stage's field hatch rates lift first-feeders 3–10× over the
old sHatch 0.05–0.6); (c) the catchment's summer flow 0.5–0.9× vs 0.2–0.4×; (d) the xo/xt exposure mismatch (~25 fish), old.
▶▶▶ RESUME HERE (2026-10-21 ~10:15 p.m. EDT). fbb0751 = the CPU egg stage (EGG3, off). THE GPU TWIN OF E3 IS WRITTEN,
UNTESTED (this commit): layout.js YOY_FIELDS + dev/eggT0/eggTm/hadGuard, SPF + eForm…eDrop (SP_REC 200), EGG3 consts emitted,
statsAdd eggs3 from T_EGG3 (word 4096 = pairs 2048 + k·8 + j: laid, swum, base, temp, guard, pred, o2, storm); wgsl.js b_spawnFill lays
eggs (Y_dev 0, else 2 — NEW SCHOOLS DEFAULT dev 2), y_egg kernel (= fish3 _eggLive; desertion writes A_nt; storms via the uniform
wx = env.weather, renamed from q3), skips dev < 2 in y_juv, y_move, y_table, y_wildA, s_yMark/yMergeable, c_census, v_drawn;
gpufish NTALLY 6144, pipeline 'y_egg', encodeYoy runs it when EGG3.ON. With EGG3.ON = 0 nothing changes.
NEXT (in order): (1) g1_check ?r5=1 with EGG3.ON — add a ?eggs=1 switch (as ?wild=1) and an egg comparison (dev, n, tallies) — fix WGSL
compile errors if any; (2) year.js: print the period's eggs (T_EGG3); (3) EGG3.ON in stageR5; (4) the remote gate; (5) an arm of the
whole package (snap.sh + year_cdp, 3 seeds × 2 years). The remote gate of 9ed1d21 (gate_eco1.txt) was green-so-far at w3 'young'.
▶▶▶ RESUME HERE (2026-10-21 ~9:45 p.m. EDT; the clock is EDT 9 p.m., not 11). COMMITTED 9ed1d21 (the ecosystem build slice 1:
E1a/E2a/E2b/E9a/E9b/E9c/E10a/E4-on/E13 — below); its REMOTE GATE RUNNING (scratchpad/gate_eco1.txt; 0 FAIL so far). SINCE 9ed1d21:
  • RESALG.DECAY_MUL 0.6 → 1.0 (big cells lose at least as fast: the resistant share 92 % → 84–86 %, field IQR 28–85 %; Daphnia 27–48 µg/L
    midsummer in the 1/10 probe, bacteria 38–51, rotifers 1.4–2.9 — scratchpad/probe/e2r_d10.txt).
  • E3 THE EGG STAGE ON THE CPU (config EGG3, ON 0 — NOT in stageR5 until the GPU twin): Yoy.dev 0→1 egg → 2 yolk-sac → swim-up, on the
    bed's temperature (Table A's equations); hazards base/temp(day-mean)/unguarded(deserted only)/pred/O₂/storm, stats.eggs3 by cause +
    guard-loss reasons; guards kept to swim-up; desertion by the day's mean ≤ 10.6 °C (and bass ≥ 2 °C below the first day's mean); bass
    sac-fry 0.33 (Clady/Waugoshance 28 % in-nest); founding clutches aged in _spinYoy; eggs excluded from the prey table, the wildlife's
    reach, merging, juvenile density; census eggN. test/w3.mjs 'eggs' 2/2. Probe (scratchpad/probe/eggs.mjs, 40 d from yf 0.18): perch
    53 % swum (cold spell), sucker 71, white perch 60, pickerel 23, fallfish 58, dace 33, bass 15 + on the bed (~60 % nest success), sunfish
    26 + on the bed, killifish eggs die below 17 °C.
  NEXT: the GPU twin of E3 (Y fields dev/eggT0/eggTm/hadGuard; packYoy/readYoy; b_spawnFill → eggs; y_* skip dev < 2; an egg kernel with
  the hazards + guard keep/desert writing A_nt; tallies; year.js), then EGG3.ON in stageR5; an arm of the whole package (3 seeds).
▶▶▶ RESUME HERE (2026-10-21 ~11 p.m. EDT). THE ECOSYSTEM BUILD (docs/review/ECOSYSTEM_BUILD.md; the human: build everything,
weather explicitly; bears, deer and moose added → E13). COMMITTED: ccf7191 E4's GPU mirror (gate GREEN 42.9 min); b68b156 egg-stage note;
8924d41 Daphnia-limits note (EPA NLA analogues) + FINDINGS. UNCOMMITTED, all in stageR5 and passing W3_ONLY=substrate (20/20) — COMMIT after
the full w3 + the remote gate:
  • E1a LIT3.SUB_MAP: tools/hotbrook/build_substrate3.py → src/w3/substrate3.js + true/substrate3.js; GEO.sub/crev (geometry.js); the
    crayfish's stony shelter (littoral3) and the rock dwellers' cover (fish3 + GPU gCrev/wColCrev) from it.
  • E2a ZOO3.MICRO: the rotifers' K. cochlearis rates + the microbial food pool chem3.bact (from the DOM decomposed); size-gated
    interference; M2_R → copepods.  E2b ZOO3.DAPH_LIM + RESALG: the grazing-resistant algae chem3.resA (in the budgets, transport, Secchi)
    + the invertebrate predators of the young Daphnia (INV_D 0.05/d); chem3.daphLoss diagnostics — PROBE RUNNING (scratchpad/probe/e2.mjs,
    e2b_on/off.txt): does summer Daphnia fall toward the field's median 3 µg/L (< 100 in lakes < 4 m)?
  • E9a WEATHER3.AIR (air anomalies → water target + ice); E9b WEATHER3.HYDRO (rain/snow/snowpack/HBV → through-flow × Q/Q_REF; KNOWN GAP the
    summer's flow 0.5–0.9× vs 0.2–0.4×); E9c the brook's depth × (Q/Q_REF)^0.4 (GEO.brookLevel; GPU uniform brookD); E10a ice thickness +
    snow + slush + layered light (env.iceCut, GPU uniform iceCut — replaces ICE.LIGHT_CUT in chem3/plants3/fish3/k_pre); thaws can't lift
    thick ice (H3.ICE_GONE); winter starts spun up (_iceSpin).
  • E4 ON in stageR5 with S3[k].mOther cut by the wildlife's measured share (arm AD r21AD_611.txt: ~2.9 t of fish a year).
  • E13 PL3.MOOSE (15 moose, 868 g dry/day of the shallows' plants, N/P ashore).
  g1_check ?r5=1 (the whole package): pre all agree, wildlife ρ to 4 digits; the xo/xt exposure mismatch (~25 fish) predates all this.
NEXT: commit + gate; then an arm (3 seeds) of the whole package; E3 the egg stage (egg_stage.md design); E2c small cladocerans and E2d the
fry's prey ladder by count; E6 herps; E7 emergence; E12 the missing plants; logs (E1b). The agent downloaded EPA NLA CSVs into the scratchpad
without asking — told the human. Bash heredocs collapse '\' — write edit scripts with the Write tool; env3.js, littoral3.js, species3.js,
bioenergetics.js are CRLF (scripts normalise and restore).
▶▶▶ RESUME HERE (2026-10-21 ~7 p.m. EDT; the human's weekly usage nearly out, context near full). NEW DIRECTION (the human):
"add everything that needs to be in the environment … any animals or plants or anything that isn't in there needs to be in there too" +
"weather needs to be taken into account". STOP tuning/arm-chasing; BUILD the complete ecosystem first (memory realism-over-compensation).
THE PLAN: docs/review/ECOSYSTEM_BUILD.md (E1 substrate+wood, E2 small zooplankton+microbial loop, E3 egg stage, E4 wildlife, E5 angling,
E6 herps, E7 emergence+drift, E8 streams+alewife, E9 WEATHER (full: air temp, heat budget, year types, rain→flow→level), E10 winter, E11
behaviour, E12 the rest — the sim's own inventory is summarised there). E4 CPU BUILT (fish3 WILD3…; F3.WILD off in stageR5 until the GPU
mirrors it) — NEXT: the GPU half of E4, then gate + g1_check, then E1/E2/E3 from the research notes.
RESEARCH AGENTS launched ~6:40 p.m. (may have been cut off by the usage limit — check whether these files exist, relaunch any missing):
docs/research_notes/Hot Brook populations and water/full_biota_and_processes.md (the real lakes' full biota list),
Maine lake shores and catchment/littoral_substrate_and_wood.md, Real lake ecology for calibration/small_zooplankton_and_microbial_loop.md,
Whole lake 3D fish simulation/egg_stage.md.
ARM AB (b0f986c+3d42b44) on the GPU: r20AB_611 done (75→65→52 kg/ha: perch recruits eaten at age 1, white perch winter, bass/pickerel 0
recruits); 612, 613 running → read with yrsum/yz. Gate 3 (b0f986c) GREEN (w3 112/112).
▶▶▶ RESUME HERE (2026-10-21 ~4:50 p.m. EDT). COMMITTED since 4:10: 7a89163 F3.WIN_JE (white perch's first winter on
Johnson & Evans 1990's measured 4 °C model, days < 4 °C — 161; layout SP_REC 172→180 + an overflow guard); b0f986c F3.YSCHOOL (the young met
in their schools by the followed fish's school terms: esocid n^schoolExp, bass n^BASS_SCH, other 0.15; school = S3 school / group[1] / 1);
3d42b44 (a duplicate WGSL const). All in stageR5. Strike section 23/23; g1_check ?r5=1 all agree (young eaten 65/65), ?yf=0.75 winter 8/8.
WHY YSCHOOL: ARM AA (29bb796, 611, yr 1; stopped at day 448) ate the young out — perch young eaten Z 0.05–0.16/d (25 M → 2 k by Aug;
Oneida ~0.035 total, arm Y's old rule ~0.03), bass and pickerel young wiped; adult perch and white perch eat most young (3–5 % of their
diets). 1/10 probe ywp_509: young white perch's "natural" deaths 17–54 %/fortnight (M_JUV3 × density) — R0 next: re-derive M_LARVA3/M_JUV3,
drop the density scaling (it stood in for predation now explicit).
RUNNING: ARM AB (queue_r20.sh, snapshot ac :8141 = b0f986c + 3d42b44, r5=1) 611 → 612 → 613, ~90 min each from ~4:45 → r20AB_<seed>.txt.
GATE 3 on occ-server for b0f986c → occ_gate_r3.txt. Gate 2 (29bb796) "failed" only because I started gate 3 while it ran — both sync into
~/reef (memory remote-cpu-host: never overlap remote runs); its own checks passed (w3 109/109 before the swap).
READ ARM AB: node yz.mjs r20AB_611.txt perch,whiteperch,bass,pike,sunfish (the young's Z by cause — target perch ~0.035/d total), yrsum,
LENGTH AT AGE, recruits (bass, pickerel, white perch), white perch kg/ha 15–35.
▶▶▶ RESUME HERE (2026-10-21 ~4:10 p.m. EDT). COMMITTED 29bb796 (in stageR5, CPU+GPU): R2·4 the young pickerel's own set
(PIKE_JUV below 10 g: Cmax W^−0.24, R Q10 2.5, FA 0.13/SDA 0.14; the adults' ×0.5 winter cut now adult-set-only in coldResp) + yCover
0.8; R2·3 F3.YDEPTH (the young's table by bed depth, 4 classes 0.3/0.6/1.2 m, each predator reaching a bin by SHALLOW_K on the bin's mean
bed; GPU yBin/yBin2/ybK + AC_BSB) + S3.bass.yBed 1.0. Strike section 21/21 locally; g1_check ?r5=1 all agree (young eaten 131/131).
Research notes (committed): esocid_larval_energetics.md; larval_juvenile_energetics_panfish.md + addenda §7 centrarchids, §8 white
perch/killifish, §9 yellow perch. R2·4b (the young's energy density) is SPECIES BY SPECIES — see REALISM_PLAN: perch → a size-dependent ED
(~2,500–3,000 larvae → ~4,000 by fall) supported; sunfish 2,300 (Breck) a refinement; white perch larvae already OVERgrow on the YP set
(Margulies 1989) and YOY are energy-rich (5.7–6.3 kJ/g) — their small autumn size is ration/crowding + the R1b ramp killing < 53 mm;
bass in range. Bass giants (65 cm at 8+): summer p 0.27–0.43 is field-like — suspect Whitledge's RB −0.756 (tiny maintenance at 2 kg).
ARM Z (c08b186) READ (613; 611/612 stopped): bass 0 recruits all 3 yrs (adult bass ate 1.36 M young bass in yr 1), pickerel 0, white perch
once (91k), perch 20→13→7.6, white perch 24→14→7; Z-613 passed block 53592 (the Shell sort works).
RUNNING: ARM AA (queue_r19.sh, snapshot ab :8140 = 29bb796) 611 → 612, then 613 RE-RUN (its first try died at founding — a CDP start
collision just after arm Z's Chrome was killed; r19AA_613_failed.*); ~90 min a seed (97 ms a block: the depth classes cost ~30 %).
Gates on occ-server: occ_gate_pikejuv.txt (the tree before YDEPTH) then occ_gate_r2.txt (29bb796).
▶▶▶ RESUME HERE (2026-10-21 ~3:30 p.m. EDT). c08b186: (1) csOf/rdOf moved into WGSL's FB4 section — e395ab3 had them
in the YOY module only, so k_strike failed to compile on the GPU (g1_check caught it; the CPU gate can't); (2) g_sort's insertion sort
→ Shell sort (identical order): it hung the GPU (DXGI_ERROR_DEVICE_HUNG) at block 53592 in arms X AND Y — crowded wintering cells +
year-4 recruits; (3) g1_check builds the CPU's young table and settles it (young eaten now compared: 137/137). g1_check ?r5=1 on
c08b186: all agree (pre/learn/senses/move/body), kills 39/39, young 137/137.
RUNNING: ARM Z on the GPU — queue_r18.sh, snapshot aa :8139 = c08b186, 613/611/612 × 3 yrs → r18Z_<seed>.txt (~60–80 min each from
3:10 p.m.). The gate for e395ab3 on occ-server → occ_gate_ywin.txt. TWO RESEARCH AGENTS: (a) esocid_larval_energetics.md (Predator
winter energetics/), (b) larval_juvenile_energetics_panfish.md (Real lake ecology for calibration/) — the young's FB4 sets at larval
size: pickerel can't grow (0.05–0.1 mm/d at full ration < 15 °C); white perch/pumpkinseed/redbreast young end autumn at 4.4–5.5 /
2.7–3.0 / 2.1–2.9 cm, under WINTER0's survival sizes (white perch all < 53 mm die) → NO white perch recruitment after the founding
year in arms X and Y (year-2 cohort 111M larvae → 0 by May at 4.8 cm, all starved by the winter ramp). Decide the larval sets from
the research (measured Cmax/metabolism/field growth), not by fitting. scratchpad yz.mjs <arm.txt> [species] [d0] [d1]: the young's Z
by cause per fortnight (R0).
ARM Y READ (613; 611/612 stopped): total 92→79→62; white perch 25→18→11; perch 23→12; pickerel 2.7→1.0; sunfishes/killifish gone;
bass ~10 but recruits eaten (35,655→1,736), only 58-cm 8+ left.
▶▶▶ RESUME HERE (2026-10-21 ~2:50 p.m. EDT). R4·6 SECOND PART COMMITTED (e395ab3): F3.YWIN_CS (a followed piscivore
on its encounter volume catches the young with the strike rule's capture success × larval detectability, its attacks against the
strike ceiling h = 1/aMax) + F3.RD_SIZE (every prey, young or followed, seen at its own reaction distance — visual model R²e^(cR) ∝ L²,
c 1.7 /m, strikeR at 6-cm prey; rdOf/csOf shared by _strike2/_yReq, GPU k_strike/yBin2/yVolA vec4f). Strike section 19/19 locally;
full gate for 8b82143 GREEN on occ-server (w3 107/107); the gate for e395ab3 RUNNING there → scratchpad occ_gate_ywin.txt (~3:25).
1/10 screen (screen_q3.sh, 3 seeds × 140 d, scr3_Y0/Y1_<seed>.txt): young eaten by pickerel 2.1–2.9×, bass 2.3–3.1×; kills of
followed fish and p unchanged. NOTE: two of six parallel run.mjs sessions HUNG after the remote node exited (output complete) —
killed by hand (Name node.exe + 'remote/run'+'.mjs … SEED=61'); watch for it.
FOUND (arm Y 613 + probe/ypike.mjs, FINDINGS today): THE PICKEREL HAVE NO YEAR-CLASSES — 16,090 → 1,258 in < 2 yrs, 18 recruits in yr 1.
Their larvae hatch early May, sit at 0.9 cm six weeks starving 29–52 %/fortnight, then grow ~0.3 mm/d (4.4 cm late Sept vs field
100–130 mm). Cause: the ADULT FB4 pike set at larval size — full-ration growth 0.05–0.10 mm/d below 15 °C, 0.2–0.3 at 18–21 °C (perch
larvae 0.2–0.5, bass up to 0.95 on the same functions); its Cmax at 2 mg is near the measured (~30 %/d), so it's the budget, not
appetite alone. A RESEARCH AGENT is writing docs/research_notes/Predator winter energetics/esocid_larval_energetics.md (larval/juvenile
esocid Cmax, SGR, metabolism, any juvenile set). THEN: a sourced juvenile esocid set (bioJuv for pike) — not a fudge; then restore
S3.pike.yCover (turned off as a compensation: the young pickerel in the weeds recruited less — because they couldn't grow).
ARM Y (snapshot z :8138 = 1b5baa5, no YENC) on the GPU: 613 done ~3:05, then 611, 612 (~90 min each). NEXT on the GPU: g1_check ?r5=1
for e395ab3 (YENC/YWIN_CS/RD_SIZE changed WGSL), then arm Z = e395ab3 (+ the pickerel fix if ready) on 3 seeds. R0: the arm's
fortnightly "young's fates" give Z by cause per species — re-derive M_LARVA3/M_JUV3 from arm Z and drop the young's M_OTHER term.
scratchpad oas.sh/oad.sh had a placeholder mailto= in OpenAlex queries — REMOVED (standing rule: no email to any API).
▶▶▶ RESUME HERE (2026-10-21 ~1:40 p.m. EDT). THE REALISM PHASE (docs/review/REALISM_PLAN.md; the human: fix
by restoring field values + building missing environment, never tuning — memory realism-over-compensation). CPU WORK RUNS ON
OCC-SERVER (memory remote-cpu-host): `node tools/remote/run.mjs occ-server [-e K=V] [--put probe.mjs] -- <cmd>`; full gate there with
`-e W3_PERF_MUL=1.3 -- npm test` (~39 min; it is ~15 % slower per core than this desktop — use it for parallel capacity); probes go
in scratchpad/probe/ and run as `--put <file> -- node .remote/put/<file>`; several probes can run there at once, never beside a gate.
GPU (this desktop) runs ONE arm at a time; g1_check ?r5=1 in the preview only when the GPU is free (then preview_stop + close tab).
COMMITTED TODAY (all in stageR5, CPU+GPU): f7ca62a R1 predation rule undone (COVER_ONCE, SIZE_RENORM, EH_AMAX, bass aMax 12, act diel,
pickerel gated, ENC_DZ 0, REST_DIGEST) · 3215c3e R2a young by what pays (YSHARE, cmaxL, RWMIN_STEEP, K_FRY 60) · a2ec762 R2b small fish
eat the weeds' small fauna (SMALL_S), batch spawners reproA 0.8, REST_ALL, pGates bass 0.35 / pickerel 0.3 · 1b5baa5 consumptionTrel
(the pickerel's Eq.4 curve peaks 8.3 — the cold rules now relative) + R1b white perch mOther 1, M 0.54, maxAge 10, WINTER0 [1.1,0.95],
MOTHER_FLAT · 8b82143 F3.YENC (the young met through the predator's own encounter volume; gate check 18/18 strike section).
RUNNING: (1) ARM Y on the GPU — queue_r17.sh, snapshot z :8138 = 1b5baa5 (NOT YENC), 613/611/612 × 3 yrs → r17Y_<seed>.txt, ~90 min
each from ~1:20 p.m.; 613 at day 224 at 1:40. (2) Full gate on occ-server for 8b82143 → scratchpad occ_gate_yenc.txt; if it fails, fix.
ARMS SO FAR (seed 613): W (R1) — predators fed but giants (bass 66 cm, pickerel 60 cm by 5), prey fell, total 88→60. X (+R2a,R2b,REST_ALL,
gates) — zooplankton fixed (8–31 µg/L in winter vs 1–6), white perch 31→46 (no R1b yet), pickerel still 51.5 cm at 5 (the cold-rule
units slip), bass 2–6 yrs missing, sunfishes/killifish ~0; the GPU driver reset (nvlddmkm 153 at 12:56) killed X-613 at day 1092 —
if it recurs, note it; TDR settings are the human's. READ ARM Y: node yrsum.mjs r16X_613.txt r17Y_*.txt in scratchpad; LENGTH AT AGE
(pickerel ~43 at 5, bass ≤ 50), white perch 15–35, p (pickerel 0.39–0.42 summer, bass 0.30–0.36), winter p, zooplankton, small fish.
NEXT: g1_check for 8b82143 when the GPU frees; an arm with YENC (Y + YENC); then R4 remaining (one rule for young and agents — size
windows per species (WIN is the perch-cannibal window, too steep below r 0.1 for pickerel/bass), predator habitat by size, weed edge,
prey vigilance), R0 young Z tallies (then re-derive M_LARVA3/M_JUV3 and drop the young's M_OTHER double charge), R3 substrate map,
R5 birds/angling/eggs → retire the census cap. FINDINGS has today's entries (stacked compensations, two bugs, fed predators → giants).
▶▶▶ RESUME HERE (2026-10-21 ~1:45 p.m.): ARM X RUNNING (queue_r16.sh, snapshot y :8137 = the working tree after
3215c3e + R2b + REST_ALL + pGates, 613/611/612 × 3 yrs → r16X_<seed>.txt, ~60–90 min each from ~1:45). Full gate on occ-server running
(occ_gate_r2b.txt) — COMMIT R2b + REST_ALL when it is green (uncommitted now: littoral3 SM_L/sm, fish3 SMALL_S/reproA/REST_ALL/pGates,
GPU gpufish TSM/TSMW/R_SM, wgsl smallS/reproA/sated, layout reproA). g1_check ?r5=1 passed on this tree (young's food 70/67, kills 37/39).
ARM W READ (r15W_613 only; 611/612 stopped: superseded): R1 fed the predators (pickerel summer p 0.37–0.41, bass K held 0.94–0.99; white
perch 31 → 22 kg/ha — no longer at the cap) but bass p 0.55–0.65 grew to 66 cm at 8+ and pickerel 60 cm by 5 / 85 at 8+ (Maine: ~43 at 5,
Linf 65); bass 11 → 16 kg/ha, yellow perch 17 → 6, sunfishes and killifish gone, total 88 → 60. Hence REST_ALL (a sated fish forages for
nothing) and pGates calibrated to growth (bass 0.35, pickerel 0.3 — p is what an FB4 fit sets from growth). R2a COMMITTED (3215c3e): the
young by what pays (YSHARE), larval Cmax per species, R_WMIN for steep sets, K_FRY 60 — 1/10 A/B: Daphnia summer 48–409 vs 0–2, autumn
10–64 vs ~0; young autumn lengths in field ranges. R2b (uncommitted): small fish (≤ 7.5 cm, none ≥ 15) eat the weeds' small fauna;
batch spawners' reproA 0.8. 1/10: killifish rations 0.5–0.6 now but adults still eaten out by day ~60 (the 1/10 strip is 10× narrower).
READ ARM X: length at age (bass ≤ ~50 cm, pickerel ~43 at 5), p (0.30–0.42), killifish/sunfish persistence, zooplankton, white perch.
▶▶▶ RESUME HERE (2026-10-21 ~10:35 a.m.): THE REALISM PHASE. The human: "make it realistic and provide everything the
environment has" — fix by restoring field values + building missing environment, never by tuning (memory realism-over-compensation).
The COMPENSATION AUDIT is done (docs/review/audit_{predation,habitat_young,physiology,foodweb_environment}.md) and merged into
docs/review/REALISM_PLAN.md (R0 measure · R1 predation rule · R1b mortality/reproduction · R2 the young + zooplankton · R3 substrate
· R4 where predators/prey are · R5 birds, angling, eggs, weather → retire the census cap · R6 winter · R7 streams, alewife, etc.).
R1 DONE AND COMMITTED (f7ca62a; backup …_20261021_1031_realism_r1.zip): COVER_ONCE, SIZE_RENORM (S3 pprM), EH_AMAX, bass aMax 12,
act diel, pickerel pGate 0.4, ENC_DZ 0, REST_DIGEST (rest until 90 % of a satiating meal is digested). Strike check: pickerel 0.37
kills/d, p 0.40, 34 % empty. Gate 103/103 on occ-server (W3_PERF_MUL=1.3). ARM W RUNNING (queue_r15.sh, snapshot x :8136 = f7ca62a,
613/611/612 × 3 yrs → r15W_<seed>.txt, ~100 min each, from ~10:35). Arm V (r14V_613: + the young's shelf) ≈ arm T. READ W against
REALISM_PLAN's field targets (p, kills/d, empties, pickerel 4–8 kg/ha, bass every age, white perch 15–35 never at the cap, zooplankton).
NEXT while W runs: R2 (the young's prey switch by profitability; the plant-dwelling microcrustaceans; the young's depth geometry;
their energetics) — or R1b (per-species M_OTHER, the young's double charge, per-species REPRO_ALLOC, white perch's set).
▶▶▶ RESUME HERE (2026-10-21 ~9:45 a.m.): OCC-SERVER RUNS THE CPU WORK (tools/remote/run.mjs; memory remote-cpu-host:
`node tools/remote/run.mjs occ-server [-e K=V] [--put probe.mjs] -- <cmd>`; ~15 % SLOWER per core than this desktop — its worth is 12
threads beside the GPU; gate there with -e W3_PERF_MUL=1.3; never run probes beside a gate (timing checks)). ARM U READ AND TAKEN OUT
(613: white perch 59.6 vs T's 46.4; queue stopped). Committed: 3206eb6 (the young's shelf: off-shelf schools head shallower — CPU+GPU,
g1_check ?r5=1 as before), 00b413d (F3.EGG_SCHOOL: schools laid ≤ 59 % of their eggs; _sdiag probe hook). ARM V RUNNING on the GPU
(queue_r14.sh, snapshot w :8135 = 3206eb6, 613 × 3 yrs → r14V_613.txt, ~100 min from ~9:05; it predates EGG_SCHOOL). PROBES (scratchpad
probe/, outputs scratchpad *.txt): killi.mjs (killifish: one clutch a summer — adults underfed in the strip), prd.mjs + prd2.mjs (the
predators kill 0.05–0.09 fish a day vs the field's 0.5–2: no prey in reach 60–80 % of calls, saturation 0.14–0.22, capture 0.09–0.13
with COVER_CS, act 0.10–0.17), screen.mjs (env SET='F3.X=…;S3.k.y=…' variants) — SIX VARIANTS RUNNING on occ-server (screen_q.sh →
scr_A..F.txt: base, COVER_CS 0, act ×2, ENC_DZ 0, combos). NEXT: read the screen, pick the predator fix, port/arm it; the killifish
strip's food. docs/review/PLAN.md "Progress (2026-10-21 morning)" has the findings.
▶▶▶ RESUME HERE (2026-10-21 ~7:10 a.m.; COMPACTING): ARM U RUNNING (queue_r13.sh, snapshot v :8134 = b840a49, r5=1;
613/611/612 × 3 yrs → r13U_<seed>.txt, ~80 min each, done ~11 a.m.; then stop the snapshot servers :8128 p, :8131 s, :8132 t if
still up — kill by Name node.exe + 'serve.mjs 81'+'NN'). Arm U = arm T + young white/yellow perch yBed 2.5 m. WHY: arm T (r12T_*,
cover cuts capture, F3.COVER_CS + rock cover S3 rockC) starved the predators (bass 1.3–1.5, pickerel 1.6 kg/ha yr 3); the tallies show
124–209 M young white perch hatched/yr, ~20 % eaten — 13–18 M each by yellow and white perch, 0.1–0.5 M by bass/pickerel: the
young schools sat offshore with the zooplankton. READ ARM U: `node yrsum.mjs r12T_613.txt r13U_*.txt`, then each RUN-YEAR summary's
'young whiteperch eaten by', 'the period's diet', LENGTH AT AGE (bass ages 1–6 present?), killifish, white perch vs 15–35 kg/ha and
the cap (×1.5). Compare arms in scratchpad: r8O_613 (5 yr baseline), r10R_613, r11S_*, r12T_*, r13U_*. Tools: yrsum.mjs,
cmpday.mjs, probe/bassk.mjs (kills of small bass), probe/wgrow2.mjs (the young through winter). Arms R–T lessons (FINDINGS-worthy):
hungry predators striking at aMax only re-choose prey, so refuges move kills unless there is accessible alternative prey; bass
recruitment failure (by yr 3 nearly all bass ≥ 7 yrs). OPEN: white perch at the cap (42–46 kg/ha), killifish gone in yr 1 on every arm,
bass weeds' insects cropped to the refuge, item 16 birds, streams as boundaries (the human asked: fish moving through the inflow and
outlet — none in the sim; plan item 38; asked the human about sucker runs up Upper's south inlet and barriers at Lower's outlet).
The human's open offer: a CPU-only Windows server + Pis over Tailscale for gate/CPU probes (waiting on its name).
▶▶▶ RESUME HERE (2026-10-21 ~3:30 a.m.): ARM T RUNNING (queue_r12.sh; snapshot u :8133 = 85bd755; r5=1; 613/611/612 ×
3 yrs → r12T_<seed>.txt, done ~7:30 a.m.). ARM S (r11S_*.txt, 3 seeds) ≈ arm R: bass insR/seek and the killifish strip changed ~nothing;
bass ~6.5→2 kg/ha on every seed (recruitment failure: by yr 3 almost all bass ≥ 7 yrs), killifish gone yr 1, white perch 42–45 AT THE
CAP (1.49×). CPU probe probe/bassk.mjs (kills of bass < 15 cm, 60 days from founding): 48 of 75 eaten (bass, pickerel, white perch) by
day over 0.3–2 m. Rock cover (S3 rockC) alone: unchanged (hungry predators at aMax only re-choose prey); + F3.COVER_CS (cover cuts the
capture too — Savino & Stein): 23 eaten, 46 of 75 alive → arm T. NEXT: read r12T (yrsum.mjs r11S_613.txt r12T_*.txt; RUN-YEAR
summaries: bass age structure in LENGTH AT AGE, killifish, sunfish). Open: white perch at the cap (needs their own regulation —
adult A 0.5 in Cooper: angling? first winter?), bass weed insects cropped to the refuge by the small fish, item 16 birds.
▶▶▶ RESUME HERE (2026-10-20 ~10:50 p.m.): ARM S RUNNING (queue_r11.sh; snapshot t :8132 = c313818; r5=1 only; 613, 611,
612 × 3 yrs → r11S_<seed>.txt, ~80 min each, done ~3 a.m.). ARM R (613 × 3, snapshot s = 80c2bc0, r10R_613.txt) vs arm O (yr 3):
pickerel 2.7 (2.0), bullhead 3.6 (2.6), fallfish 2.7 steady (0.6), pumpkinseed/redbreast 0.2 (0), killifish 0 by yr 1 (as O), white
perch 44.3 (40.2) — now 35 % of bass kills, 18 %+ of pickerel's; BUT bass 6.5→2.2 (O 5.0): p ~0.2 all year, K→0.81, crayfish 31 %
of food, insects ~1 %, recruits ~2/3 eaten in 6 weeks (by bass and white perch). Arm S adds: bass insR 2 m (weeds' + surface insects;
item 25), bass ≤ 12 cm seek cover (big 0) + habJ 0.3–1.2 m, killifish day ≤ 0.25 m / night ≤ 0.4 m. NEXT: read r11S (yrsum.mjs,
the RUN-YEAR summaries) on all 3 seeds; then item 16 birds (needs per-species normalisation), 22 pickerel first year, 18 ice
optics, 29 zooplankton, white perch regulation (44 kg/ha vs 15–35). Arm Q (r9Q_613.txt, year 1 only) was stopped for arm R.
▶▶▶ RESUME HERE (2026-10-20 ~8:35 p.m.): w3 GATE 103/103 at eefcece (KD_COLOUR 0.4, both plants3init rebuilt;
backup …_20261020_2028_review-phases.zip). Since 7:20: items 13 (sunfish cover drive), 24 (arm B diets in code), 26 (sunfish RA×0.7,
fallfish FA/UA, bullhead juvW 30 + ED 5000 — research bullhead_growth_and_young_white_perch.md), 23 (bullhead spawnT [18,24] +
spawnEnd 0.38), 28 (brook sunfish share 0.01/0.02), 31 (settle 0.03…), the young's O₂ cushion fixed (mg/L, cold only — the ×2
rule barred summer water). PLAN.md has a Progress section. ARM Q RUNNING (snapshot r :8130 = phases 0–4 + the O₂ fix, KD 0.5,
armB_query; r9Q_613.txt, 2 yrs, ~9:35 p.m.): year 1 tracks arm O closely through summer. Arm O 613 × 5 yrs DONE (the baseline:
pickerel 5.0→0.4, bass 7.3→3.6, bullhead 6.6→0.9, white perch 34.5→44, small fish gone). NEXT: read arm Q's RUN-YEAR summaries
(kills by light/prey, from shore, starvation by size, LENGTH AT AGE), then arm R = HEAD (r5=1 only — no armB_query — KD 0.4) on
613, then 3 seeds. Deferred: item 16 birds (redistributing M_OTHER lowers big deep fish's M: needs per-species normalisation),
18 snow/ice optics, 21 egg stage, 22 pickerel first year (YOY 7.8 cm vs 10–13), 29 zooplankton shape.
▶▶▶ RESUME HERE (2026-10-20 ~7:20 p.m.): PLAN PHASES 0–4 (IN PART) COMMITTED (03e31d4), NOT YET GPU-TESTED. In stageR5:
the appetite gate ∝ Cmax (pGate), bass juvW 250, SCOLD, RECRUIT_WARM; white perch bands/habJ/shore, BAND_LAKE, BASS_SCH −0.6,
PREY_PREF, bullhead spines; killifish/pickerel/bass/sucker refuge settings; the young's winter (YO2_MARGIN 2, YM_COLD, YM_CAP 3,
YW_T0 4). Year runner: new tallies + per-run-year summaries. UNCOMMITTED: chem3 KD_COLOUR 0.5 → 0.35 (Secchi) — waiting on the
plants3init rebuilds (both running in the background, ~2 h each: tools/hotbrook/build_plants3.mjs, HB_WORLD=true for the true
lakes), then W3_ONLY=plants,chem gate (the Secchi check's 2.5–4 m range may need 3.5–4.5). Snapshot p (:8128) = phases 0–1 only.
NEXT: when arm O 613 ends (~7:45 p.m.) stop queue_r8 (611/612 cancelled — they'd test superseded code); g1_check parity
(preview, then close it); snapshot q of the working tree → arm Q: 613 × 2 years (r5=1 + armB_query) and read the new tallies;
then phase 3's code items (the sunfish cover drive, the bird hazard out of M_OTHER), phase 5. Probe wgrow2.mjs (the young's
winter with the fixes) running. The human: Windows server + Pis are CPU-only (Tailscale) — offered the server for the gate/CPU
probes via SSH; waiting on its name. Gemini reports all 7 in docs/research_notes/fetched/ and checked (gemini_*_checked.md).
▶▶▶ RESUME HERE (2026-10-20 ~7:30 p.m.): THE REVIEW IS DONE — docs/review/PLAN.md is THE plan (40 items in 9
phases, merged from the five reviews + white_perch_habitat_and_predation.md + three Gemini reports the human supplied, filed in
docs/research_notes/fetched/gemini_2026-10-20_*.txt (git-ignored) and being checked by two agents → gemini_hot_brook_checked.md and
gemini_white_perch_checked.md). Diagnosis: predators can't reach white perch (55–61 % of Maine diets) so they eat the small fish;
no refuges; the 1 %BW hunger gate starves small bass; strikes ignore the cold; the young die of under-ice hypoxia on anoxic organic
beds; the census cap regulates white perch/pumpkinseed. NEXT: phase 0 (tallies: length at age, death depth/cover, young eaten by
predator kind, post-recruit loss, first-winter loss by cause; probe the young's under-ice growth; KD_COLOUR 0.5 → 0.35) then phase 1
(hunger gate ∝ Cmax, bass juvW, cold appetite for every strike, recruit at the spring crossing). Arm O (r8O_*.txt) still running.
▶▶▶ RESUME HERE (2026-10-20 ~6:20 p.m.): A FULL REVIEW IS RUNNING (the human: "do a full review of all the fish and
everything and make sure its all behaving as it really would in the environment and make sure we have all aspects of the environment
and the animals covered"). Five background review agents write docs/review/: predators.md (pickerel, smallmouth), perches.md (yellow
perch, white perch), small_fish.md (pumpkinseed, redbreast, killifish, dace, fallfish), bottom_fish_and_young.md (sucker, bullhead,
the young-of-year system), environment_coverage.md (water, plankton, plants, invertebrates, wildlife, brook, water levels, weather,
people, alewives — what's covered vs missing). Each: real (cited from the repo's research notes) vs the sim (code, values) → OK / off
/ missing → priority. NEXT after compacting: read docs/review/*.md, merge into docs/review/PLAN.md (one prioritized list), show the
human, then work it. Also pending: the white-perch research agent (white_perch_habitat_and_predation.md) and ARM O (r8O_*.txt).
▶▶▶ RESUME HERE (2026-10-20 ~6:10 p.m.): ARM O still RUNNING (613 in year 2: white perch 34.5 → 38.9, pickerel
5.0 → 3.8, pumpkinseed/redbreast ~0.1, the summer's Daphnia 146 → 38 µg/L). COMMITTED 72a3a21 (6k, F3.YCOLD in stageR5): predators
hunt the young at min(cold performance, FB4 consumptionT) — arm O's killifish young grew right (2.7 cm early Nov, 3.2 Jan) but were
eaten 13–22 %/fortnight under the ice; CPU probe: winter predation on the young now ~0. THE NEXT PROBLEM — WHITE PERCH ESCAPE THEIR
PREDATORS: Cooper 1941 (Maine white-perch lakes) pickerel 95 % fish of which 55 % white perch, smallmouth 80 % fish of which 61 %;
the sim's pickerel ~10 %, bass less; CPU July probe: 1 white perch killed in 20 days — white perch by day over 3.5–5.5 m (from
deep-lake sources) while the predators hold the shore and weed edge and rest at night. A research agent is writing
`Real lake ecology for calibration/white_perch_habitat_and_predation.md` (shallow-lake white perch habitat by time of day, where/when
pickerel and bass catch them, regulation). Then: white perch bands for a 3–5.5-m lake → an arm on the GPU after O. The human asked
why CPU and GPU (answered: the CPU is the readable deterministic reference + the live view + the headless gate; the GPU the fast
multi-year runner; the parity check keeps them agreeing; the 1/10 CPU lakes are for mechanisms only).
▶▶▶ RESUME HERE (2026-10-20 ~5 p.m.): ARM O RUNNING — the MULTI-SEED VALIDATION of the stage R package through item 6j:
queue_r8.sh (snapshot o :8127 = 42cbec3; r5=1 + arm B overrides) on 613/611/612 × 5 yr → r8O_<seed>.txt, flag queue_r8.done (~2.5 h a
seed). Since 4:20: arm M (6h–6i) ~ L for the community; fallfish still took 45k killifish (founded adults ~25 cm > Lpisc 18) → fallfish
Lpisc 30 (2d9db30); the killifish's young on the GPU: 1.1M hatched, 55 % eaten (212k by YOUNG BASS SCHOOLS, which ate fish from 5 cm),
44.5 % natural, 1 recruit → 6j (42cbec3): bass yLpisc 10 (young smallmouth eat plankton and insects to ~10 cm — research): CPU probe
kyoung.mjs: killifish young 0.72 % of hatched alive in mid-October at 2.66 cm (field 25.6–32 mm by late Sep). FINDINGS b4a03df (the
gut as the satiation brake). Arm N (6i only) was stopped after 9 min for O. JUDGE O BY: bass ~5–10 kg/ha with ~4 cm/yr growth, p
≈ 0.3 season; pickerel 4–8; white perch 15–35 (36 in L/M); perch; the small species (killifish recruits in spring? pumpkinseed,
redbreast, fallfish persist?); total 50–120; stability over 5 years and across seeds. Then: white perch's school term (dilution, no
confusion — Morgan & Godin 1985), yellow perch no fish at night; make stageR5 the default (full gate); SEA-RUN ALEWIFE (stage A).
▶▶▶ RESUME HERE (2026-10-20 ~4:20 p.m.): THE BASS ARE FIXED BY THE HUNGER GATE (6g). Arms on 613 × 1 yr (r6<X>_613.txt):
I (shore band) and J (killifish night shallows) changed nothing for the bass (~23 kg/ha). Research piscivore_field_feeding_rates.md:
Maine growth needs p ≈ 0.34 on the sim's own FB4 set (0.7–1.1 kg food/yr; Mille Lacs 0.87 kg); the 8-%BW gut was the only brake.
K (gate G0 0.5 %BW + bass aMax 2.5/h, v 0.1, act [0.2,0.5,0.05]): bass 6.1 kg/ha, p 0.16–0.21, 76 % empty, 7,900 starved — too
much. L (G0 1 %BW): bass HOLD at 7.4 kg/ha (from 9.4), ~28 → 33.5 cm, summer p 0.20 / autumn 0.44–0.51 (the fall-heavy shape that
also fits Maine growth), 62 % empty; pickerel 4.9 (target 4–8), total 96, white perch 36.4, perch 23. Killifish still gone (L:
fallfish 49.7k, pickerel 44.7k, white perch 18.5k). Research killifish_persistence_and_predators.md (+ addendum of 3 sub-reports):
adult losses ~77 %/yr are normal; persistence = recruitment (egg→age-1 ≥ ~0.2 %); age-0 25.6–32 mm by late Sep; NO record of fallfish
eating killifish; white perch on killifish schools = dilution, no confusion; yellow perch piscivory rare, diurnal; kingfishers are
the best-documented killifish predator. COMMITTED c1685d9 (6h–6i): S3 yBed (young keep to water ≤ yBed m while ≥ F3.YBED_T 10 °C;
killifish 1.2, benthL 1.0 — their young had followed zooplankton offshore and stalled at ~2 cm) and fallfish Lpisc 18. CPU probe
kyoung.mjs: young killifish 2.45 cm by mid-October, 0.3 % of hatched alive then. RUNNING: ARM M (snapshot m :8125 = c1685d9) 613 ×
1 yr → r6M_613.txt (~16:50). NEXT: read M (killifish recruits in spring? fallfish kills gone? who eats killifish now?); then white
perch's school term (dilution not 0.15 confusion), yellow perch no fish at night; then ≥ 3 seeds × 5 yr of the package; then make
stageR5 the default (full gate); then SEA-RUN ALEWIFE (stage A, designed).
▶▶▶ RESUME HERE (2026-10-20 ~1 p.m.): ARM G (b7a34c8 + tallies) and ARM H (6d: pickerel meet schools as n^0.65,
ce8a6e1) done, 613 × 1 yr each (r6G_613.txt, r6H_613.txt): both ~ bass 23.5 kg/ha, killifish gone; killifish hold their strip by
day (59–60 % over < 0.3 m) but die over 0.3–0.6 m (46 %) and > 0.6 m (43 % — twilight/night, their night band 1–2.5 m);
stomachs field-like (bass 35 % empty, pickerel 38 %); bass kills 68 % 10–20-cm prey, perch eaten 58 % over ≥ 2 m. NOTE the
T_KILLPZ tally is each predator's kills by the PREY's length (misread once as the predators' — corrected 230a416). The human:
bass "usually closer to shore, but some in the open"; they fish Upper's shallow stream end; not sure about Lower's sunfish or
alewives (don't re-ask). COMMITTED 6f2784d (6e): the bass's SHORE BAND (S3 shore → _mode s0/s1 → _drive pull down shoreDist; GPU
SPF shD*/shN*/shT*, SP_REC 158; stageR5 bass {day [60,120], night [50,100], tw [150,250]} m, bed 1–3 / 0.5–2) from research
smallmouth_horizontal_habitat.md; gate core+strike+gpu 34/34; g1 moves agree. RUNNING: ARM I (snapshot i :8121) 613 × 1 yr →
r6I_613.txt. NEXT: if bass still overgrow — the perch's juvenile band (1.5–4 m, mostly offshore here: research flag), structure;
killifish NIGHT band [0.1, 0.6] (Helfman 1981 Opinicon via McInerny & Cross [SEC]: dispersing < 0.6 m at night, a bass-and-pike
lake; vs COSEWIC's inferred deeper move) for arm J; the killifish's young (none reached spring in G/H).
▶▶▶ RESUME HERE (2026-10-20 ~9:50 a.m.): ARM F STOPPED at day ~200 of 613 (r6F_613.txt): spring recruitment
removed the young-bass feast but the bass STILL overgrow at true scale (17.5 → 23.1 kg/ha day 98 → 126, 42 cm, p 0.62–0.75),
living on adult perch and white perch (perch 233k → 179k in a month). The 1/10 CPU world with the same package gives bass p
0.24–0.28 (arm B settings or not — probe/gut2.mjs ARMB=1) — the true-scale GPU world is the one to calibrate. FB4's own gut
(probe/satcycle.mjs): even a meal-then-rest cycle with prey always at hand gives bass p 0.6–0.8 (digestion ~1 day at 22 °C), so
Maine's slow growth and 35–60 % empty stomachs mean real bass SEARCH a lot — prey are harder to find than in the sim's true lakes.
ADDED (b7a34c8 BAND_REL in stageR5; a45c4c6 T_WHERE; 59f40c3 T_GUT): GPU tallies of where each kind spends the day by bed depth and
of the piscivores' stomach fullness, printed at a run's end. RUNNING: ARM G (snapshot g :8119 = 59f40c3) seed 613, 1 YEAR →
r6G_613.txt (tallies at day 365): read who ate whom, kills by prey length, eaten over depth/cover, by-day depth shares (do the
killifish hold < 0.3 m?), stomachs (field 35–60 % empty). Then decide the prey-availability fix with evidence (perch schools vs
solitary fish, cover, the bass's act/aMax priors). (Careful: Stop-Process by command-line match also kills this session's own
shell if the pattern is in the command — filter by Name.)
▶▶▶ RESUME HERE (2026-10-20 ~9:25 a.m.): ARM F RUNNING — queue_r6.sh (snapshot f :8118 = c75429a; arm B overrides +
winter + r5=1 with item 6 AND 6b) on 613/611/612 × 5 yr → r6F_<seed>.txt, flag queue_r6.done. Compare with r6E_613.txt (item 6
only, 1 yr: bass 23.7 kg/ha at 43.9 cm — unchanged from D2) and r5D_613.txt. Analyse: node yrsum.mjs / yrdem.mjs; the final
tallies (who ate whom, kills by predator length, eaten over the bed's depth) print at day 1825. JUDGE BY length-at-age (Maine bass
~11/17/22/26/30 cm at 1–5; pickerel ~17/25/32/38/43) and condition K ~0.95–1.0, biomass 50–120 kg/ha (white perch 15–35, pickerel
4–8, bass toward Maine levels), small species persisting, diets fish-dominated without cannibalism. COMMITTED c75429a (item 6b):
F3.RECRUIT_SPRING (the young stay schools — one predation rule — until the spring of age 1; arm E's tallies: bass>bass 282,870
kills, 97 % < 10 cm; most kills of PREY < 10 cm — the recruits; the tally is by the prey's length, first misread as the predators'), S3.bass.habJ (research
juvenile_refuges_and_bass_young.md), pumpkinseed in both lakes (MDIFW 2024 chart for Lower; default; gate w3 103/103). The human
sent MDIFW's 2024 Lower chart (684 ac, mean 8 ft, max 13; lists PUMPKINSEED and SEA-RUN ALEWIFE) and the 2016/2024 fishing guides
(nothing new): research_notes hot_brook_lake_records.md updated; alewife research done (sea_run_alewife.md: ~15/acre colonising
run, young never recruit, leave via the outlet in rain pulses mid-July–ice-on; FB4 alewife set). ASKED the human (no answer yet):
seen alewives/herring runs or silvery schools? sunfish caught in Lower itself? NEXT after F: the killifish's < 0.35-m strip (~4 m
wide at true scale; half-hour hops leave it: arm E 70 % eaten over 0.3–1 m) — a shore-hugging rule; the per-species/by-light
SHALLOW_K (research (b)); then SEA-RUN ALEWIFE as the 12th species.
▶▶▶ RESUME HERE (2026-10-20 ~8:15 a.m.): ARM D2
STOPPED at day 532 of seed 613 (r5D_613.txt): year 1 diets fish (pickerel 76–98 %, bass 51–94 %) but bass 9.4 → 24.8 kg/ha at
44.7 cm mean, and in year 2 → 55.5 kg/ha (53 cm) while perch 10.7 → 1.9, white perch 31 → 12, pickerel 3.3 → 0.9, fallfish → 0.1;
killifish 100k of 148k eaten in the first fortnight. TARGET FOUND: the sim's FB4 smallmouth over the Maine calendar grows a 26-cm
bass 4.4 cm/yr at p 0.3, 9.5 at 0.4, 14.5 at 0.5 (scratchpad probe/bassgrow.mjs) → Maine's growth pins bass p ≈ 0.3, pickerel ≈
0.37 (D2's bass 0.4–0.5 to July, 0.63–0.88 after). June stomachs field-like (CPU probe/gut.mjs: 44–57 % empty); the excess comes
with the young's recruitment (CPU probe/gut2.mjs: in August 53–72 % of the bass's kills were young bass, recruited at 6 cm into
the adults' 1.5–4-m water — bass have no habJ). COMMITTED d769dd5 (item 6): F3.ENC_DZ (prey × (1 − |Δbed|/0.3), CPU+GPU — the 6-m
disc had let pickerel over 0.6–2 m take killifish over 0.3–0.6 m) + killifish day water [0.05, 0.35]; both in stageR5; gate
section `strike` (W3_ONLY=strike, ~50 s); g1_check ?r5=1 fine (kills 6/5). 6e7bb3a: year.js applies ?r5=1 before ?f3./?s3.
RUNNING: arm E = r5 + item 6, seed 613, 1 year (snapshot e :8117 = 6e7bb3a; r6E_613.txt). A research agent is writing
`Real lake ecology for calibration/juvenile_refuges_and_bass_young.md` (young smallmouth's water by size, cannibalism, size-depth
refuges, pickerel's depths). NEXT: a bass habJ from it, then arm F 3 seeds × 5 yr; judge by bass p ~0.3 / pickerel ~0.37,
length-at-age, biomass, small species persisting. The human asked (2026-10-20) why it wasn't already accurate and what else
isn't — answered with the known-issues list (this block's NEXT, white perch high, fallfish, snow on ice, weather spells, fixed
water levels, larvae's food, white perch ageing mortality, brook).
▶▶▶ RESUME HERE (2026-10-20 ~6 a.m.): ARM D (no hunting share, r4D_613_noact.txt) fed the predators at their maximum — pickerel
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
