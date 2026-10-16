# The Hot Brook lakes in 3-D — the whole-lake sim (design)

The 2-D sim (`src/`) became a slice through the real Upper and Lower Hot Brook Lake in stage A (`docs/HOT_BROOK_SIM.md`).
On 2026-10-15 the human asked for **both whole lakes and the brook in 3-D**, chose a **1/10 horizontal scale** and a
**1-hour year**. The 3-D sim is built alongside the 2-D one in `src/w3/` with its own gate (`test/w3.mjs`, part of
`npm test`). The 2-D sim keeps running, and its gate stays green, until the 3-D sim reaches parity and the app switches.

Research behind this design (sourced notes): `docs/research_notes/Whole lake 3D fish simulation/` —
`super_individuals.md` (whole-lake fish IBMs, schools as agents, predation, genetics), `shallow_lake_3d_physics.md`
(horizontal transport in small shallow lakes, ice, models), `fish_movement_and_groups.md` (ranges, speeds, diel and seasonal
moves, the brook, school sizes, telemetry), `browser_3d_rendering.md` (three.js r186 / WebGPU, fish instancing, water,
measured costs on the human's RTX 3060). Earlier: `Hot Brook populations and water/`, `Maine lake shores and catchment/`,
`Seasonal fish habitat use/`, `Maine lakes ponds and streams/`.

## 1. The decisions and why they hang together

The sim compresses PHYSIOLOGY (a fish's day of growth in ~10 s with the 1-hour year), but fish swim at REAL speed — what the
eye wants when the camera follows one. In the 2-D slice the lakes were squeezed ~90× along the slice, which by accident gave a
cruising fish a realistic distance per physiological day. In 3-D three knobs trade off: the area scale, the calendar, and how
many real fish one brain stands for. The options shown to the human:

| | 1/5 length | **1/10 length (chosen)** | 1/25 length |
|---|---|---|---|
| Water | 26 ha | **6.5 ha** (Upper ~196 × 344 m) | 1 ha |
| Fish ≥ 7.5 cm at real density | ~69,000 | **~17,000** | ~2,800 |
| Long trips | ~10× real speed | **~1–3× (1-hour year)** | ~2× |

Depths, densities, plants and water are real in every option.

**Clocks — REAL TIME (decided 2026-10-16, superseding the 1-hour year below; blueprint `docs/W3_REALTIME_AUDIT.md`).** A sim
second is a real second; a year is 365 days of 86,400 s (`clock3.js`). Every rate is per real second (the 2-D sim's calibrated
rates × `PER2D`), so the FIDELITY LADDER changes the step, not the clock: fine (fish 0.1 s, brains 5 Hz) for watching at 1×,
medium, and coarse rungs (fish ~60–900 s, the water ~300–1,800 s) for the seasons, the gate and evolution — in which each
fish's own BRAIN STILL DECIDES, once per block (where to go next, how hard to forage, how much to hide: the human's choice).
At the 1/10 scale fish swim at real speed everywhere, so trips, dusk moves and home-range crossings take 1/10 of their real
time (the human's choice); encounter rates stay real. **Built (stage R2 step 1, the compat refactor):** the clock is real;
`Fish3.step(dt, mv)` takes the calendar time a step covers and the swimming in it; the gate and the view run the 1-hour
year's steps (fish 876 s with 0.1 s of swimming, the water 1,752 s) with the day–night cycle still 12.2 calendar days long and
the constants calibrated on that clock at their compat values (`OLD_S` = 8,760: `H3.MIX_RATE`, `K_STRAT`, `F3.ATTACK`,
`SPAWN_RATE`, `YOY_TICK`, `LEARN_DECAY`, the meal threshold). Checked against the old code: the water alone over a year
agrees to rounding (the same weather and ice dates; P and N within 4e-4; the algae's summer blooms amplify last-digit
differences to ≤ 2 %), and all ~3,000 fish's states agree to 1e-6 over the first steps, before the fish's chaotic steering
amplifies the last-digit differences of `TS × dt` (as a 1e-15 nudge to the old code's clock does by step ~550). The later
R2 steps give the rates exact exponential integrators, the transport its real sub-steps, the mixing real times and the day
its 86,400 s; R3 gives the fish the rungs' own mechanisms.

**Clocks (1-hour year — SUPERSEDED, kept for the record).** `YEAR_LEN` 3600 s; a physiological day `BIOE.DAY` = 3600/365 ≈ 9.9 s; the day–night cycle
`DAY_LEN` 120 s, so a year still has 30 visible days and nights, each standing for ~12 real days. Rule: every RATE that
integrates over time — growth, mortality, flushing, exchange, mixing, settling — runs on the physiological clock (real rate ×
compression); the day–night cycle only MODULATES (light, the night siphon, diel migration, nocturnal feeding), with each
night's totals scaled so a year sums to the real year. (The physics research flagged that mixing the two clocks puts
flushing 12× off.)

**Budget.** Measured 2026-10-15: the 2-D engine spends ~40–60 µs per fish per step (senses and neighbour queries ~45 %,
the agent update ~25 %, the brain's forward pass ~3 %). A data-oriented 3-D core (struct-of-arrays, a 3-D hash grid, senses
and brains at a lower rate) measured **0.7 µs per agent at 10 Hz decisions, 2 µs at 30 Hz** with 3,800 brains in the real
lakes (scratchpad `agentbench.mjs`). The full biology will add several µs; the target is ≤ 25 ms per step in a Web Worker.

## 2. The world (built: `src/w3/geometry.js`, data `src/w3/hotbrook3d.js`)

Generated by `tools/hotbrook/build_world3d.py` from the landscape model (`tools/hotbrook/data/hotbrook_model.json`: the
1949 MDIFW soundings fitted to today's shore, USGS 3DEP elevation, NLCD land cover, OSM outlines and brooks).
- Both lakes at 1/10 of their real horizontal size, TRUE depths: one 15-m model cell = one 1.5-m world cell. Upper 3.75 ha,
  mean 3.05 m, max 5.52 m (its 18-ft hole in the north basin by the outlet), 44 % ≤ 3 m; Lower 2.79 ha, mean 2.67 m, max
  3.94 m, 57 % ≤ 3 m — the measured beds' own statistics.
- The connecting brook at 1/2 (77 m; Lower moves out along the brook's line to make room), 4 m wide, its profile from the
  angler: the deeper pool at its upper mouth (1.1 m), riffles (~0.35 m), a shallower run, the water falling 0.6 m.
- A 30-m band of real land around each lake (elevation, land cover), read under the nearer lake's placement, blended at the
  seam. x east, y north (m), origin at the brook's upper mouth; z = depth below the local water surface. Water runs
  south → north: the inflow enters Upper's south end, the outlet leaves Lower's north end.
- The 1/10 scale steepens every real slope 10× (a 1° littoral slope becomes ~10°). Physics parameters that depend on real
  distances (fetch, horizontal mixing, the siphon) use REAL lengths (world × 10).
- Open: the cove between Upper's west points (the angler's sunfish spot) is 2–3 m in the model, interpolated where the
  1949 soundings are sparse; the angler calls it shallow — a depth from their fishing app would settle it.

**Rebuilt from lidar and aerial photos (2026-10-16; `docs/research_notes/Hot Brook populations and water/lidar_and_shallows.md`).**
After the human's high-resolution images and "see if there's any lidar for that area too":
- **Terrain:** the USGS 3DEP lidar (ME Eastern B1/B2 2017), the area mean of its 1-m bare-earth DEM over each 15-m cell. The
  former z14 terrain tiles were 1.8 m RMS off it.
- **Lake outlines:** the lidar's hydro-flattened water, each lake's one connected body. Upper 369 ha and Lower 274 ha on the grid
  (at 1/10: 3.69 / 2.74 ha); the 2017 levels are 128.93 and 128.23 m, a 0.70-m fall along the brook. OSM's outline had shared
  97–98 % of the cells.
- **The shallow shelf:** NAIP's visible-bottom band (`tools/hotbrook/shallows.py`), its dark edge at 1.3 m (the human's
  "chest height … where the water gets darker").
  - It is used only for the 0–1.5 m fringe: at 1–3 m it had no skill against the soundings left out.
  - Area ≤ 1 m: Upper 5 → 12 %, Lower 6 → 17 %.
  - Means: Upper 3.00 m, Lower 2.55 m (the 1949 survey's 3.35 / 2.74 never reached the shore). The share ≤ 3 m is unchanged
    (44 / 56 %).
- **The sunfish cove** moved to the water between Upper's two long points, where the human placed it on the 3-D view: 2.4 m in
  the model.
- **The land between the lakes** (where the half-scale brook pulls Lower in) is forest to the brook's banks; it had been bare
  "water" ground.
- **Consequence for the water model:** the thin fringe stiffens the circulation's Laplacian (face weights h² span 9 × 10⁴), so
  `solveLaplace` runs to a 1e-18 tolerance (~2,800 conjugate-gradient iterations, ~70 ms at start-up). Otherwise a 2.7-m³
  shallow column drifted 0.05 °C a block in a uniform field.

## 3. The environment in 3-D (`src/w3/env3.js`)

**Grid.** Water columns of 5 × 5 m (50 m real; ~1,500 in Upper, ~1,100 in Lower) plus the brook as a chain of ~25 cells
along its path; each column holds 0.5-m layers down to its bed (~16,000 wet cells). Columns are a graph (neighbours with
shared face lengths), so lakes and brook share one exchange code. The bed (1.5-m resolution) keeps its own per-patch layers
(the organic mud, worms and scuds, plants, mussels) under the column it lies in.

**Per column (vertical):** the 2-D sim's physics, now per column instead of lake-wide — heat exchange with the seasonal air
(the Maine calendar), the wind-mixed layer (`MIX_M` × weather) and night convection (these lakes don't stratify for long),
light with depth (Secchi ~3.8 m, colour ~46 — step 4b), O₂ (re-aeration, photosynthesis, respiration, sediment demand per
square metre of bed: 0.2–0.39 g/m²/day under ice, so a 1-m cove draws down 3× faster than the basin), N and P with closed
budgets, phytoplankton (diatoms, greens, cyanobacteria), dissolved organic matter, zooplankton (Daphnia, copepods, rotifers,
resting eggs), ice per column (shallow water first).

**Between columns (horizontal):**
1. Wind circulation: two precomputed steady, friction-dominated depth-averaged current fields (unit wind along x and along
   y — the equations are linear in wind stress, so any wind is their weighted sum), relaxed toward over ~5–10 h; a surface
   drift (~3 % of wind, fading by a third of the depth) with a bottom return flow. Currents 1–10 cm/s real.
2. Horizontal mixing at the grid scale: K = 3.6e-4 · L^1.07 m²/s (Lawrence et al. 1995; L the real cell size → ~0.024 m²/s).
3. The night thermal siphon: shallows cool faster, and on calm nights (wind < ~5 m/s) cold water runs down the slope with a
   surface return, ~1 cm/s, flushing a cove in hours (Doda et al. 2022 scaling) — moving O₂, heat, plankton and P.
4. Under ice: the same down-slope exchange from the bed's heat (a few mm/s); in late winter, sunlight through snow-free ice
   drives convection that re-oxygenates the column weeks before ice-out.
5. Weed beds: a dense canopy cuts currents ~90 % and, once it fills over half the depth, stops daytime wind mixing — warm
   surface water by day, low O₂ at the bottom at night.
6. Through-flow: the inflow at Upper's south end, the brook, Lower's outlet; residence ~100 days (Upper) and ~55 (Lower) on
   the physiological clock; a water-age tracer to check cove isolation against the through-flow path.
7. Wind direction (new: the 2-D sim had only a speed), from Maine climatology (prevailing W–NW in winter, S–SW in summer).

**Not simulated:** the free surface (a 19-min seiche, 3-cm set-up — negligible), Langmuir cells (smaller than a cell).

**Built (stage 3, slice 1 — `src/w3/env3.js`):** 2,671 columns, 15,663 layer cells (small shore columns and sliver bottom
layers folded into their neighbours — tiny cells force tiny steps), 5,160 faces. Temperature per cell (the mixed layer follows
the Maine calendar + weather + the day's swing, faster and wider in thin water; below 4 °C the cold water floats so the
surface freezes while the deep stays near 4 °C; under ice the ice chills the top and the bed's stored heat warms the water
over it); ice per column (the shallows first, all by about Dec 1); transport: the wind's gyres (two precomputed fields,
friction stronger in the shallows), the top layer's drift and its return, the through-flow (a potential flow, solved
implicitly upstream-first — stable at any step), grid-scale mixing, the night siphon and the under-ice density current (only
water nearer 4 °C than the basin's slides down); a water-age tracer. Explicit wind transport is sub-stepped (≤ 4); in a gale
the wind-driven currents are slowed uniformly instead (`transportScale`). ~2.3 ms per update (10 Hz) with two fields.

**Built (stage 3, slice 2 — `src/w3/chem3.js`):** the 2-D sim's calibrated chemistry and plankton on every cell — O₂,
ammonium, nitrate, phosphate, green algae, diatoms, cyanobacteria, DOM, Daphnia, copepods, rotifers and their resting eggs,
the bed's bound-P store, organic layer and worms and scuds — in the 2-D units read as concentrations ("per 2-D cell" for
water, "per 2-D column" for the bed), the bed's fluxes reaching the water as bed area over water volume. The inflow brings
nutrient at the 2-D slice's per-volume load; closed N and P budgets (to ~1e-7). Two 3-D calibrations: the bed captures
dissolved P through a diffusive boundary layer (`BED_EXCH` 0.35 — the 2-D bed exchanged with a stagnant 0.3-m film) and
buries its bound P at 0.15× the 2-D rate, so the lakes retain ~75 % of their P load (Larsen–Mercier 0.66–0.72 for these
flushing rates). Slow processes (zooplankton, bacteria, N cycle, the bed) run every 3rd update; all fields move together
packed (one pass over the faces). ~9 ms per update on the 5-m grid, ~1.8 ms on a 10-m grid (tests and long runs). A year
without fish: summer bottom O₂ ≥ 5.7 mg/L in the north basin; under ice it runs down to ~0.5 mg/L by late winter while the
lake keeps ≥ 5 mg/L; ice-out ~Apr 26; spring diatoms. Known (no fish yet): zooplankton boom to ~2,000 µg/L (real ~50),
the water is too clear (Secchi 6–9 m; real ~3.8 — colour is step 4b), the coves keep their O₂ under ice (40 % of the light
gets through: snowy ice passes 1–12 % — stage D).

## 4. Fish in 3-D (`src/w3/fish3.js`)

**Agents** (struct-of-arrays; position x, y, z; heading yaw and pitch; speed):
- **One brain per fish:** pumpkinseed, redbreast sunfish (new), brown bullhead, smallmouth bass, chain pickerel, white
  sucker, fallfish (new) — ~3,500 at real density.
- **One brain per school:** yellow perch (schools of ~50–200 by the research), white perch, golden shiner — a school agent
  carries `n` fish of one genome and one body record (length, mass, gut, gonads); ~250–400 agents. Its fish are drawn
  around it as a real school (~1 body length apart, looser in dim light, dispersed at night).
- **No brain:** banded killifish and blacknose dace (shoals of ~5 in the littoral strip and the brook's riffles) and the
  young-of-year — super-individual schools like today's `world.fry`.

**Super-individual rules** (Scheffer et al. 1995; Parry & Evans 2008; OSMOSE): a school never dies whole — natural, heat and
hypoxia losses take fish binomially (real-valued n when large); starvation takes a fraction a day; density, crowding and
competition are computed from Σn × mass, never from agent counts; a predator's strike on a school takes ONE fish (n − 1); a
school predator (white perch eating fry) eats at its rate × n. Schools meet, merge (the merged school keeps one parent's
genome, chosen ∝ n — never averaged weights) and split (above the species' size, or when food is found), matching by species
and length.

**Brains.** A new input layout for 3-D (prey, threat and ally bearings in the fish's own frame — left/right and up/down —
depth, height above the bed, distance to shore and the downhill bearing, light, temperature, O₂, current, food, hunger, fear,
home bearing); outputs turn, pitch, thrust, strike, flee, hide. Decisions at 10–15 Hz, motion at 30 Hz. Learning stays
Baldwinian (the plastic weights never pass on). The 2-D brains don't carry over (different inputs); the 3-D lakes start from
fresh founders.

**Movement** (the research's rules, all tunable): cruise 0.5–1.5 body lengths/s, sprint 5–13 BL/s for ≤ 10 s with a fatigue
curve; long trips (wintering sites, spawning grounds, the brook) at up to ~3× cruise. Each fish has a persistent movement
personality (range size, boldness). Diel: shiner schools in the weeds by day, open water at dawn and dusk; perch and white
perch offshore by day, inshore at dusk; bullheads and white perch feed in the shallows at night; sunfish rest in cover at
night. Seasonal: smallmouth gather at a few fixed wintering sites (Dec–Mar, nearly still); pickerel stay within ~30 m of
shore in winter, clustered by points and islands; suckers run into the inlet and brook riffles at 11–13 °C; pickerel spawn in
flooded shallows at 7–10 °C; sunfish (and redbreast) move into the brook in late spring and many stay in its pools all
summer (the angler's observation; a 1946 Michigan inlet weir counted ~2,400 sunfish in three months); about 1 % a year cross
to the other lake, plus suckers commuting.

**Biology reused:** `bioenergetics.js` (FB4) and each species' `BIO` (length–weight, growth, maturity, fecundity, spawning
temperatures, gape, thermal and O₂ limits), feeding on the fields (zooplankton per cell, benthos per bed patch, insects,
young-of-year), the gut and gonad model, reproduction (nests on the bed at species depths and substrates; ribbons on brush;
mounds in the brook), young-of-year schools and recruitment (new individuals, or new and merged schools).

**Numbers** (real densities, the design census; caps at ~1.5× as a safety, abundance emerging from recruitment and death):

| Species | Fish ≥ 7.5 cm / ha | In the 6.5-ha lakes | Agents |
|---|---|---|---|
| White perch | ~800 | ~5,200 | schools (~50–100) |
| Yellow perch | ~860 | ~5,600 | schools (~50–100) |
| Golden shiner | ~430 | ~2,800 | schools (~40–80) |
| Pumpkinseed | ~215 | ~1,400 | individuals |
| Brown bullhead | ~140 | ~915 | individuals |
| Redbreast sunfish (new) | ~70 | ~455 | individuals |
| Smallmouth bass | ~40 | ~260 | individuals |
| Fallfish (new) | ~30 | ~195 | individuals |
| White sucker | ~30 | ~195 | individuals |
| Chain pickerel | ~20 | ~130 | individuals |
| Banded killifish, blacknose dace (new) | — | shoals | super-individuals |

**Built (stage 5, slice a — `src/w3/fish3.js`; the view `src/w3/render3/fish3view.js`):** the agent core. Founders at the
census above (eight species — redbreast and fallfish come with slice b): ~16,600 fish ≥ 7.5 cm in ~3,100 agents (white
perch and yellow perch in schools of ~80, shiners ~60; the rest one agent a fish), ages from each species' M, lengths from its
growth curve (Maine's crowded white and yellow perch at 0.72 / 0.8 of it) — ~120 kg/ha. Each agent: a recurrent brain on the
3-D inputs (26: food, threat and school bearings in its own frame with above/below, depth, height over the bed, bottom depth,
shore, the way to deeper water, light, temperature, O₂, energy, hunger, fear, home) and six outputs (turn, pitch, thrust,
strike, flee, hide), deciding at 5 Hz; Baldwinian learning on its hidden→output weights. The brain's turn is high-passed (a
fresh brain's constant bias would only circle) and its actions act in context (a strike at a prey it senses, a flight from a
threat). Innate drives from the habitat research (`docs/research_notes/Whole lake 3D fish simulation/habitat3d.md` §9): the
bottom depth each species wants by day, by night and under ice (the lake's slope smoothed over ~10 m tells it the way), its
place in the column, its activity, its preferred temperature; out of low O₂ (and an escape straight up near the lethal level);
schools keep together, meet, merge (one parent's genome) and split; home ranges; the look-ahead keeps fish off the shore. A
fish outside its habitat travels at its 30-min sustained speed (the dusk hour is ~5 s of the sim's day). Feeding as the 2-D
sim's, on the 3-D fields: zooplankton from its cell and the layers above and below (type III, the day's light), the bed's worms
and scuds (crayfish eaters at any size — the stand-in until crayfish), the organic layer for bullheads and suckers; piscivores'
kill hazard over the catchable fish within their strike reach (a school counts n^0.5; very shallow water hides small fish); a
strike takes one fish. FB4 bioenergetics on the 3-D calendar, gonads, a spawning that lays (and counts) the eggs; starvation,
heat, hypoxia, other natural deaths; a dead fish's body joins the bed's organic layer; respiration takes O₂ from the fish's
own water. ~12 ms per step (4 µs an agent). The view: every fish an instance of one body (a school drawn as its n fish, tight
by day, loose at night), interpolated between the 10-Hz steps, its body waving as it swims; true size or ×4 / ×12.
KNOWN (slice a): fish feed too well (p 0.5–0.97; real ~0.3–0.6) — the water is too productive (zooplankton 100–480 µg/L with
fish, a ~9-day algae–zooplankton cycle) and the type III response generous: the food web's calibration (stage 6); piscivores
lack their real prey (young-of-year: slice b) and crayfish (stage 7); no birds or other shore predators yet (natural deaths are
the 2-D sim's M_OTHER half); a dusk move is partial (a fish covers ~15 m of a night's 50 s).

**Slice b (design) — reproduction, young-of-year, the brook.** From the habitat table (§9–11 of habitat3d.md) and the 2-D
sim's young-of-year machinery (world.js `_stepFry`/`_feedFry`/`_eatFry`, config `FRY`/`BROOD`), the 2-D times ÷ TS:
- SPAWNING HABITAT: a ripe fish (gonads ≥ GON_READY, condition ≥ K_READY, out of its cooldown) whose water nears its spawning
  temperature goes to its spawning ground — a fourth habitat mode: pickerel to flooded margins ≤ 1 m at ice-out (6–11 °C),
  yellow perch to brush at 0.5–2 m (7–13 °C), suckers up the brook to its riffles (≥ 10 °C; a waypoint path along the brook),
  white perch onto 0.3–1.5-m flats (~15 °C), smallmouth to nests at 0.5–1.5 m (≥ 15 °C; a male returns within ~2 m — 20 m
  real — of last year's nest), pumpkinseed to colonies at 0.15–1.7 m (≥ 17 °C, repeated bouts), bullheads to 0.3–1.5 m
  (≥ 21 °C), shiners over the weeds at 0.5–2 m (≥ 20 °C, bouts). The rare species find mates by a cue (the nearest ripe fish of
  the other sex within ~15 m); a school spawns within itself (both sexes) or with a ripe school beside it.
- A SPAWNING: eggs = fecundity × the female's ripeness; larvae = eggs × hatch success; ONE young-of-year school at the site
  (its genome a mutated crossover of the parents'). Nest guarders (smallmouth, pumpkinseed, bullhead males) stay on the nest
  (BROOD: their fry held within ~1 m, a predator's reach cut by PROTECT, the male's feeding × GUARD_FEED and metabolism ×
  GUARD_METAB) for the guarding time.
- YOUNG-OF-YEAR SCHOOLS: brainless super-individuals (n, length, mass, age, genome) moving on the physiological clock (a
  larva covers ~0.4 m a day, a 6-cm fingerling ~2 m): toward the richest zooplankton about them (rotifers and nauplii while
  small — the 2-D sim's size ramps), sunfish fry in their limnetic phase over open water < 1.8 cm, then the bed's worms and
  scuds past benthL; out of low O₂ and heat. Feeding, scramble starvation, the larval and juvenile mortality (∝ 1/length,
  juvenile compensation by the cohort's density over the lakes, slower in cold water), heat, hypoxia, O₂ drawn from their
  water — the 2-D sim's per school. Eaten by piscivores (a feeding bout: FRY.ATTACK × TS fish a second, gape-limited, fewer
  in a thinned school) and their larvae by any plankton eater they fit (FRY.CATCH). Schools of a species and size meet and
  merge (one genome, chosen ∝ n).
- RECRUITMENT at the species' L0 (or the next spring): a school species' young become a school agent with a brain (their
  genome); an individual species' survivors become individual agents (each a mutated sibling), up to 1.5 × the census.
- THE BROOK IN SUMMER: a share of Upper's and Lower's pumpkinseed (a personality drawn at birth) moves into the brook's pools
  from mid-May and stays until the autumn cooling (Lievense 1947: 654 pumpkinseed through a small inlet in 3 months; the
  angler's pools) — a waypoint path in and out.
- A YEAR: late April the pickerel, then the perch, then the suckers (into the brook) spawn; late May–June the white perch, the
  smallmouth (males on nests ~4 weeks), the pumpkinseed (bouts to August), the bullheads (June–July), the shiners (June–
  August); the larvae feed on rotifers and small zooplankton through June–July (the larval period's high mortality), the
  young sunfish over open water; by August the fingerlings are on the bed and in the weeds (juvenile compensation), eaten
  by bass, pickerel, perch and white perch; the bigger ones recruit by autumn (white perch ~5 cm, perch ~8), the rest next
  spring; under the ice the young starve or freeze down slowly (cold-slowed mortality, size-selective starvation).

**Built (slice b):** the design above, with two additions found in the runs. (1) SPAWNING GROUNDS: the pairing species
(pickerel, smallmouth, pumpkinseed, bullheads, suckers on the lake's shoals) meet on a few traditional grounds per lake
(seeded, in water of their spawning depth) — wandering, a sparse species couldn't find a mate in its two-week window (20
pickerel/ha cruising at 0.1 m/s) — and a ripe fish's mate cue reaches ~1.5 × its species' spacing. (2) THE COMPRESSED
CALENDAR LIMITS TRIPS: a fish swims at real speed through a one-hour year (the dusk hour is ~5 s, a spawning season a few
minutes), so only the suckers living within ~150 m of their lake's end of the brook run up it (the rest spawn on shoals, as
lake-spawning suckers do), only pumpkinseed within ~60 m summer in its pools (30 % of them), and a long goal trip goes at
up to ~1.2 m/s. Founders start ripe if their spawning is still ahead of the start date. A spring (Apr 21 → late June, one
seed): pickerel spawn first (day 12), then perch (15), suckers (32 — a third of them in the brook), white perch (35),
smallmouth (38, nests at ~1.2 m, the males on them ~4 weeks), pumpkinseed (39, ~480 bouts), bullheads and shiners in late
June; ~25 pumpkinseed in the brook's pools by June. test/w3.mjs +7 checks.
KNOWN (slice b → the food web's calibration, next): the zooplankton is caught in a PREDATOR PIT — the adults (p ~0.9,
eating benthos and zooplankton at once: their intakes add up instead of sharing foraging time) take more than its spring
production, so its stock never builds (15–20 kg/ha, ~25 µg/L in May; 3–6 µg/L by August, against a real 45–100 and a
clear-water phase in May–June), and every young fish that eats zooplankton starves into the autumn (pumpkinseed 0.8 cm,
white perch 1.8, perch 2.2 in November; real 3–8 cm) — the bed-feeding young bullheads grow as they should (5–6 cm,
recruiting). The fix, from docs/ECOLOGY_RESEARCH.md: adults share their foraging time between the bed and the open water
(p = the better food's, not the sum), switch to the bed when zooplankton is scarce (perch > 5 cm: Wu & Culver 1992), feed at
realistic summer rations (p 0.3–0.6), and the zooplankton gets a refuge (weeds: stage 7; darkness in coloured water: step 4b).

**Built (stage 6a) — adult foraging.** Two mechanisms, judged on 3 seeds over May → October (scratchpad foodweb.mjs):
(1) THE BED OR THE OPEN WATER: an adult shares its foraging time toward the better of its two foods (t ∝ f⁴; bed food
E/(E + 3 g/m²) above its refuge, zooplankton type III in K_ADULT) instead of eating both at once (Werner et al. 1983; Wu &
Culver 1992); a hungry fish whose best food is on the bed goes right down to it; a fish losing condition strays from its
preferred water to feed. (2) THE FORAGING FOOTPRINT: one sim second stands for ~2.4 real hours of foraging, over which a real
fish works hundreds of metres — ground no fish can swim at real speed in a second (a white perch school stripped its 10-m
patch in ~4 sim-days and needed ~11 to swim to the next; the bed held 8–11 g/m² at every depth while the schools fed on
1–2). So an adult feeds from the bed (within 0.75 m of its own depth) and the water within a quarter of its home range
(4–20 m) — depletion where fish crowd, on the scale of a fish's day. Adults feed at their 5-Hz decision rate. Result (vs the
slice-b baseline, same seeds): fish biomass holds 95–115 kg/ha into October (was 64–72), adult starvation halves, summer p
in the real range (white perch 0.3–0.4, perch 0.25–0.5, pumpkinseed 0.4–0.5); young bottom feeders grow at real rates
(suckers 6 cm, bullheads 4.5 cm by October), white perch 3.9 cm and perch 4.2 (real 5–8).
STILL OPEN → stage 6b: the zooplankton collapses in July on every seed (2–17 µg/L July–October; fish take 70–110 % of its
production while their young are far below the 20–40 kg/ha that collapses real Daphnia) — its summer FOOD runs out: the
algae fall near zero in July–August (the water's summer productivity: coloured mesotrophic water, step 4b), and it has no
refuge in these shallow lakes until the weeds (stage 7). The plankton-eating young stall: pumpkinseed 0.6–0.8 cm through
August, shiners 1–2 cm, smallmouth ~1 cm (real 3–10 cm).

**Built (stage 6b) — the food web through a summer.** Two diagnoses (scratchpad algaeprobe.mjs, foodweb.mjs, 3 seeds):
(1) the summer's PHOSPHORUS ran out — the bed buried ~95 % of the inflow's P (it only released P when anoxic), so the algae
were P-starved in July–August. Added the shallow lake's temperature-driven OXIC RELEASE of the bed's bound P (CHEM3.REL_OXIC
0.0015 × Q10 2.5; Søndergaard et al. 2003): summer P holds up 2–4×, a year without fish keeps 64 % of its P load (Larsen–
Mercier 0.66–0.72). (2) Even fed, the zooplankton was held down by the ADULTS: at the 2-D sim's K_ADULT 25 µg/L an adult
planktivore fed near its ceiling on any zooplankton. With a bed to turn to, an adult's half-saturation of 60 µg/L (F3.K_ZOO;
adult fish saturate at ~10–20 Daphnia/L) makes the zooplankton settle where it pays as well as the bed. Result (3 seeds, May
→ October): a June peak of 190–450 µg/L (the spring Daphnia peak) with the fish taking 31–47 % of its production; a strong
cohort of young (15–28 kg/ha by July — Oneida's Daphnia vanished above 20–40 kg/ha of young perch, Mills & Forney 1983)
then grazes it down in July–August; the young reach real autumn sizes for perch (5.6–6.5 cm), suckers (5.5–6.2), bullheads
(4.2–5.3), nearly for white perch (4.0–5.2; real 5–7) and shiners (2.5–4.5; real 4–5). test/w3.mjs +2 checks (53).
STILL OPEN: young pumpkinseed stay small (1.4–3.7 cm; real 3–5) — their limnetic larvae starve in the open water through
July; the autumn zooplankton rebound is weak; the adults' June feast (p 0.8–0.93) then a lean late summer (0.2–0.4). The
weeds (stage 7) are the missing refuge and the littoral's own food (snails, insects) for sunfish.

**Known calibration problems to solve here** (the 2-D census of stage A, 3 seeds × 3–4 years, `test/diag` census, deaths,
fryfate): total fish 130–140 kg/ha (inside the real 60–150) but the wrong mix — white perch 70–90 kg/ha (target 15–30) at a
mean ~180 g (Maine's crowded white perch stay 25–45 g: real white perch STUNT — food competition among adults is too weak in
the sim); golden shiner collapse (eaten by white perch, pickerel, yellow perch and bass, little weed refuge); yellow perch
dwindle (~20–40/ha vs ~860); young bullheads starve in August (too little bed food for young bottom feeders); fish ≥ 7.5 cm
500–1,100/ha vs ~2,600. The 3-D lakes' littoral–pelagic structure (weed refuges, cover, the brook) changes predator–prey
encounter, so these are re-judged there with the same diagnostics.

**Design (stage R3) — the fish on a real clock: the fidelity ladder.** (Blueprint `docs/W3_REALTIME_AUDIT.md` §3, §7 R3; the
human's choices 2026-10-16: the brain decides per block in fast-forward; real speed at the 1/10 scale.)

ONE fish, three ways of living a stretch of time. Every rung runs the same body (FB4 energetics, gut, gonads, hazards), the
same senses and the same brain (inputs and network unchanged), the same innate drives (habitat band by day/night/winter, food,
threat, school, home, goal, O₂, heat). What changes with the step is how a decision becomes movement, and how food and
predators are met.

| Rung | Fish step | Brain | Movement | Feeding | Predation |
|---|---|---|---|---|---|
| FINE (watching, ≤ ~4×) | 0.1 s | 5 Hz | integrated swimming (today's `_move`) | from the cells it is in, a search-limited functional response, intake bouts capped by handling (Q 2–4 × the daily-mean Cmax rate) | events: detect (light at depth), pursue, strike, capture p, miss refractory, handling |
| MEDIUM (~10–60×) | 1–10 s | 1–2 Hz | kinematic sub-steps of ≤ 0.25 s | as fine, summed over the sub-steps | events (the strike resolved within the step) |
| COARSE (fast-forward, gate, evolution) | 60–900 s | once a block | relocation: toward the block's chosen place, within reach (sustained speed × dt, along water: the brook's path) | the footprint over the ground covered (radius from the distance swum, ≤ the home range) — today's integrator, its radius now earned | encounter integrals: Poisson(λ·dt), λ = search rate × prey density in the block × capture p ÷ (1 + handling) |

**THE BRAIN IN A COARSE BLOCK (the human's choice).** The fish senses at the block's scale — the richest food it could reach in
the block (direction, distance, value), the nearest threat it would meet (a predator within its reach plus the predator's),
its school, the habitat gradient, shore, light (the hour's), temperature, O₂, energy, hunger, fear, home — the SAME 26 inputs
with ranges scaled to the reach. One forward pass. Its outputs read at the block's scale:
- turn, pitch → the heading and the depth of its move, relative to the drives' choice (the drives propose; the brain bends);
- thrust → how far it goes (activity: more ground → more food met and more predators met, and more respiration);
- strike → foraging effort (the share of the block spent searching: the encounter rate with food and, for a piscivore, its
  attack rate);
- flee → how strongly it avoids the threat it senses (moves away, feeds less);
- hide → cover use (time in the weeds or the shallows: less predation, less open-water food).
Rewards for learning: the block's intake against its expectation, a kill, an escape. Evolution then acts on the same weights at
every rung: a brain that forages boldly near predators eats more and dies more, whichever the step.

**EQUIVALENCE.** The coarse rung must reproduce the fine one's ecology statistically: on the same seeds, a reduced scene
(~300 agents) run fine through dusk–dawn windows vs coarse-60/300/900 — daily intake per species, kills per predator per day,
the diel depth and shore-distance histograms, growth, the young's fates (a separate long suite). Its free parameters
(effective search rates, the effort mapping) are fitted there.

**THE DAY ON A REAL CLOCK (R2 step 5 with R3).** The day becomes 86,400 s: dusk moves take their real 30–90 min (5–9 min of
travel at the 1/10 scale, then lingering), feeding follows the hour's light at the fish's depth (perch by day, shiners at dusk,
bullheads at night), the zooplankton migrates into the weeds by day, the night siphon spins up over hours. The intake cap rises
FIRST (B9) or fish feeding half the day starve.

**ORDER.** (a) step split: kinematic sub-steps, brain cadence in Hz, schedules in seconds; (b) the intake cap (bouts), then the
hour's light for senses and feeding; (c) local foraging in fine/medium, the footprint radius from the distance swum in coarse;
(d) predation as events and encounter integrals; (e) the young's real displacement; (f) trips without distance limits; (g) the
coarse block with the brain; (h) the real day (with R2 step 5). Each: the gate at the coarse rung (fish ~900 s, water ~1,800 s),
≥ 3 seeds against stage 7d's numbers.


**Built (stage R, 2026-10-16, branch `w3-realtime`).**
- **The coarse block** (`Fish3._relocate`, `_hop`, `_zWant`): a fish step longer than 1 s is a block. The fish senses, its own
  brain decides once, then it hops (≤ 6, re-aimed after each, each as long as its strongest pull needs) where its drives point —
  its depth band, nest or goal along the brook, a mate, food, away from a threat, its school, home, better O₂ — the heading bent
  by the brain's turn (`BRAIN_BEND`), at the pace drive and brain set; the rest of the block it wanders within its band
  (v·√(τ·t)); its depth goes to the drives' target where it got to. It never ends off the water, never hops from oxic water into
  water short of O₂ (under the ice a school stays at the oxic edge instead of following its winter depth into dead water); nest
  guards stay on their nests. The gate runs 1,752-s blocks with the water every block; a block costs ~33–41 ms, a real-time
  0.1-s step ~18 ms.
- **The real day** (86,400 s): the cove–basin diel swing +1.1/−0.9 °C (coloured lakes 2.1 ± 1.0); ice now forms first in the
  sheltered coves (an exposed column must be 0.12 °C/m·s of wind colder — `H3.ICE_WIND` × its exposure, the columns' wave
  shelter now in env3) and the melt decision uses the day's mean warmth.
- **The view in real time** (R5): 1× is real time (0.1-s steps, brains at 5 Hz, the water every simulated minute), 4×;
  fast-forward 1 min/s, 10 min/s, 1 h/s and max in blocks sized to ~3 a second (≤ 29 min).
- **O₂ metabolism** (research `oxygen_metabolism.md`): the real day exposed a lake at 51–62 % of saturation in summer (real
  86–102 %). Surface exchange now follows the lake-size wind model (Vachon & Prairie 2013) with a convective night floor and the
  Schmidt number; saturation is Garcia & Gordon's; the bed's algae release their photosynthesis's O₂ (+0.35–0.53 g/m²/day). Summer
  93–94 % of saturation, the basin's summer bottom minimum 7.2 mg/L, the winter lake mean ≥ 6.2 mg/L, P retention 0.70.
- **Feeding by the hour's light** (audit D9/D10): the sky's lux with twilight (500 lx at the sun's edge, −3.7 decades an hour);
  each species' sight I/(I + K_I) (perch 1 lx, shiners 0.3, white perch 0.5, pumpkinseed 5, smallmouth 0.003, pickerel 0.5;
  bullheads and suckers by taste); zooplankton seen ∝ sight² (the water searched ∝ reaction distance²), the bed and the surface
  ∝ sight; a block averages the light at its start, middle and end. Summer adults' feeding level 0.5–0.8 of Cmax (was 0.8–0.95).
- **The young's foraging footprint**: in blocks every school of young jumped to the same best cell, merged and stripped it; now
  a school of young feeds over its column and the ring about it (zooplankton and the bed). By September 10 (3 seeds): young
  perch 6.8–7.3 cm, suckers 6.1–6.4, white perch 4.6–5.5, bullheads 4.6–5.2; young smallmouth starvation 3–17 % (was ~40 %),
  220–274 recruits; the June zooplankton peak 740–910 µg/L grazed down to ~80–100 by September by the young (Mills & Forney 1983).
- **Still open:** young shiners (2.7–2.9 cm) and pumpkinseed (1.9–2.2 cm) small by September (real 4–5, 3–5); the June
  zooplankton peak high; the fine rung's own mechanisms (strikes as events, short strike distances, the intake cap, surface
  rises and leaps for the view — the human's request); remaining compat constants (`F3.ATTACK`, `SPAWN_RATE`, `YOY_TICK`,
  `LEARN_DECAY`, the meal threshold).
**The numbers R3 builds on** (research `realtime_foraging.md`, 2026-10-16; its §9 maps each to a mechanism per rung):
- **Light first (prerequisite).** Fish see far better in dim light than the sim's vision ramp (`PLANKTON.VIS_I0`/`VIS_I1`,
  ~200 → 10,000 lx) allows: perch feed down to 2–5 lx, bluegill 10, pumpkinseed 25; largemouth catch > 95 % of prey at moonlight
  (3×10⁻³ lx). The sky needs a TWILIGHT tail (~400–600 lx at sunset, 3.4 lx at the end of civil twilight, 0.008 lx nautical)
  and each species its own saturating curve RD(I) = RD_max·I/(I + K_I) with a non-visual floor (perch 2.8 cm; bullheads by taste).
- **Reaction distances:** zooplankton a few cm to ~30 cm (perch larvae 2.8–5 cm; pumpkinseed 20 cm on a 1.9-mm Daphnia;
  bluegill's reaction angle 1.7 + 18.9/SL mrad); prey fish ~1 m (smallmouth 84–108 cm, 40 in the dark; pickerel ~1.5 m clear,
  ~1.0 m in moderately brown water — R²·e^(cR) = const with c ≈ 1–2.5 m⁻¹ in Hot Brook's water).
- **The strike** starts at 0.14–0.37 body lengths for pickerel (0.05–0.11 s) and ~1.2 BL for bass: the sim's `strikeR`
  (1.0–1.2 m) is 3–8× long; detection stays at RD and the gap becomes the STALK, where prey see the predator and leave.
- **Capture per strike:** pickerel 0.65–0.8 on shiner-like prey but 0.10–0.15 on spiny deep-bodied sunfish and perch; bass
  0.6–0.8 on small sunfish; perch 0.20 on a single fish, 0.03 into a school; ambush ×3 over pursuit; Daphnia 0.8–0.95 vs
  copepods 0.07–0.5. Confusion is predator-specific (perch ×0.15 into a school, bass ~n^−0.8, esocids none). Stems cut
  ATTACKS, not success (bass captures/h ≈ 25 → 16 → 2.5 → 1 at 0/50/250/1,000 rope stems/m²; natural weed at 164 stems/m²
  cut bass predation tenfold).
- **Handling:** ~1 s per zooplankter (H = 0.536·e^(18.5·l/L)); 0.5–6 min per fish; then the gut gates hunting (pike clear a
  meal in 48 h in summer, 12 days in winter; 47 % of pike stomachs empty).
- **Rations to check against:** yellow perch 5.5–6.7 %BW/day in July (~4,300 Daphnia a day for a 10-g perch); smallmouth
  > 30 cm hold 1–2 crayfish; time budgets (pickerel active 16–21 % of 5-min intervals, ~2 % at night; smallmouth moving 28 %).
- **Coarse encounters:** a cruiser sweeps ½·π·RD²·v·N; an ambusher meets π·R²·u·N (u the prey's speed); intake
  Σλp·m/(1 + Σλp·h) per foraging second × the share of the step spent foraging, capped by gut room; kills as clustered
  Poisson events.
- **The young:** perch larvae < 9.5 mm swim < 3 cm/s (YOY_VMAX 0.25 m/s is far too fast for them), 3–4 BL/s above; larval
  mortality ~0.04/day; bluegill swim-up fry lose 0.11–0.39/day for 4 days, then < 0.01.

## 5. Plants, invertebrates, wildlife, the shore and the air

Plants on the bed by depth, light and substrate (pondweed, milfoil, lilies, muskgrass; the colonisation depth from Secchi);
crayfish, snails, eastern elliptio mussels (abundant — the angler), insect larvae and emergence, zooplankton (fields).
Wildlife at real densities per hectare or per metre of shore: the loon pair's share, painted turtles (2.6–16/ha, hauling
out on logs, nesting on banks), frogs along the shore, dragonflies, and the shore predators (heron, kingfisher, osprey,
otter, mink) as a depth × size × light risk. The shore mechanisms of `docs/reports/Maine lake shores and catchment.md`
(stage D): the catchment's water and loads on a hydrograph, colour, snow on the ice (1–12 % light under snowy ice), shore
wood (logs in < 2 m near shore), insects across the waterline, leaves, shade, wind.

**Built (stage 7a) — the weeds, coloured water, the catchment's organic load (`src/w3/plants3.js`; research
`docs/research_notes/Whole lake 3D fish simulation/macrophytes.md`).** A field per bed cell × five growth forms of a soft,
coloured Maine lake — emergent (pickerelweed, bulrush), floating-leaved (lilies, watershield), the submerged canopy (pondweeds,
bladderwort), isoetid rosettes and the deep low meadow (Nitella, moss): living shoots and the storage they overwinter in, in
g DW/m². Submerged growth follows the light at the canopy's top (the season's day-mean surface light × ice × the water ×
floating-leaf shade × self-shading, a Monod response with the form's K½) and the temperature (Q10 2.5) and P (bed and water) and
N; each form's losses are set so that its growth just pays them at its light limit (share of the surface light), so its DEPTH
LIMIT emerges from the water's clarity. The floating-leaved and emergent forms grow in their depth windows and only where the
shore shelters them from the waves (land in ≥ 4–5 of 8 directions within 20 m: the coves). Spring sprouting from storage,
autumn reallocation to storage (from ~Sep 10) and litter, wave and ice scour in the shallowest water, colonisation of bare bed
(paid for in nutrients). The plants' N and P are in the closed budgets (uptake from the bed's store by the roots' share, from
the water by the shoots'; death returns them to the water, the bed's store and its organic layer). Their effects: the weed
volume shelters zooplankton (chem3 `plantRef`, 0.8 × a logistic in PVI), their stems foil predators' strikes on small fish
(1/(1 + (S/150)³), Crowder & Cooper 1982 — fish3 `cover`), the canopy's O₂ by day and its respiration by night spread over the
water it fills, and the floating leaves shade the bed. With them came COLOURED WATER (CHEM3.KD_COLOUR 0.5/m: Secchi ~3.2 m,
not the 2-D sim's 6–9 m; Kd·SD 2.55 for stained water) and the CATCHMENT'S ORGANIC SUBSIDY (CHEM3.ALLOCH 800 g wet/m²/yr to
the bed's organic layer: half spread over the year, half an October leaf pulse weighted toward the shore). A season jump in
the view (`Plants3.jump`) reshapes each stand for the new date conserving its mass, N and P.
Results: a second summer with weeds on ~34 % of the bed (research ~30 %), the canopy to 1.9 m (research 2–2.7 m in coloured
water), lilies and emergents on 16 % of the vegetated bed (the coves), every form overwintering, a dense bed's O₂ swinging
10.6 mg/L a day vs 5.5 over bare bed at its depth. With fish, 3 seeds over a year: the June zooplankton peak 154–351 µg/L with
the fish taking 29–47 % of its production; year-end biomass 103–130 kg/ha; young perch 5.5–6.2 cm, suckers 5.6–6.2, white
perch 4.4–5.3, shiners 3.2–3.7, pumpkinseed 2.7–2.9 (from 1.4–3.7: the weeds' refuge feeds the plankton they need). Winter: the
lake-mean O₂ minimum falls to ~3 mg/L in the coloured water (less light under the ice for the algae); the bed's O₂ demand under
ice is 0.11–0.32 g/m²/day against a measured 0.2–0.39 for such lakes, so the gate's winter check is now ≥ 3 mg/L — whether the
Hot Brook lakes really go that low in late winter is a question for the human (ice-fishing observations). test/w3.mjs +4
checks. The view: `src/w3/render3/plants3view.js` (below).
STILL OPEN: young bass starve (no littoral invertebrates yet: snails, insects, crayfish — stage 7b); the autumn zooplankton
rebound is weak; perch starvation 300–500 a year.

**Design (stage 7b) — the littoral's own food (`src/w3/littoral3.js`; research `docs/research_notes/Whole lake 3D fish
simulation/littoral_invertebrates.md`, emergence and fall-in `docs/research_notes/Maine lake shores and catchment/
land_lake_subsidies.md` §1, §6).** Energy pools outside the N/P budget, like the bed's organic layer and its worms and scuds
(chem3 `sedOM`, `benth`), in g wet per m² of each bed cell (the plants' cells):
- THE WEEDS' INVERTEBRATES in two sizes: SMALL (early-instar midges, naidid worms, small crustaceans — food for young fish
  only) and LARGE (late-instar midges, mayfly, caddis and damselfly nymphs, amphipods and isopods on the plants). Their
  carrying capacity is the plants they live on: ~5 mg DW of fauna per g DW of plant (≈ 30 mg wet) × the form's factor
  (submerged canopy and the Nitella meadow 1, floating-leaved and rosettes 0.5, emergent 0.25) — a full pondweed canopy
  (150 g DW/m²) carries ~4.5 g wet/m² (0.5–1.5 g DW: Kirby 4,000–17,000 animals/m²). Production at 20 °C 0.08/day (small)
  and 0.03/day (large), Q10 2, nothing below 4 °C (community P/B ~5 a year over Hot Brook's season); the small grow into the
  large (0.04/day). EMERGENCE on a degree-day clock from ice-out (> 4 °C): the overwintered cohort's main pulse at ~100–600
  degree-days (mid-May–June), a second generation's at ~1,500–2,200 (August–September); ~30 % of insect production leaves.
  The emerging pupae and adults go to the SURFACE field of the column (food there for an hour or two) and then leave the lake.
  As the shoots die back in autumn, the fauna above the capacity moves down into the bed's worms-and-scuds pool.
- SNAILS: soft water (calcium ~2–5 mg/L, unmeasured — inferred) caps them: ~20 mg wet per g DW of broad-leaved plant
  (floating-leaved and the submerged canopy 1, emergent 0.5, rosettes and meadow 0.3) plus 0.2 g/m² on bare lit bed (< 3 m)
  — weed beds 0.5–5 g wet/m², bare mud ≤ 0.5. Growth 0.02/day at 20 °C (P/B 2–3 a year), born May–July above 10 °C.
- THE SURFACE (per column, g wet/m² of water): the emergers, and TERRESTRIAL INSECTS falling in from the forested banks —
  ~50 mg DW per m of bank a day at the July–August peak (20–120; spring and autumn a fraction), spread over the water by
  exp(−d/λ) with λ 10 m real (the model's distances × 10), drowning to the bed's organic layer within a day; fly-off of
  adults within hours.
FISH: the bed's food becomes "the bed and its weeds" — worms and scuds, the large weed insects (shielded by the stems, 1/(1 +
(S/250)³) — small sunfish pick inside the beds) and, for pumpkinseed ≥ 9.5 cm and bullheads, snails — taken in proportion to
what each offers in the forager's footprint; the SURFACE is a third food for the insect eaters within ~1 m of it (shiner,
pumpkinseed, perch, white perch, bass, small pickerel), shared with the bed and the open water by the same t ∝ f^Q rule.
YOUNG-OF-YEAR take the small weed fauna from 1.2 cm and the large from 2.5 cm (smallmouth: copepods → midge larvae by 1.5–2.5
cm, mainly insects by 2.5–5 cm, Opeongo).
THE SEASONS: late April — ice-out; overwintered large larvae on the evergreen rosettes and meadow and in the bed; snails in the
bed. May — the canopy sprouts and its fauna grows with it; the first emergence; the first fall-in. June — the weed fauna's
peak; the main midge and damselfly emergence (surface feeding at dusk); smallmouth fry switch from copepods to midge larvae.
July–August — fish crowd the weeds: the large insects fall 2–3× (emergence + cropping) while the small new generation grows;
fall-in peaks; the second generation emerges late. September — partial recovery; shoots begin to die back. October–November
— the fauna moves to the bed; leaves, not insects, fall in. Winter — nothing grows below 4 °C; the stocks wait in the bed and
on the evergreens; no surface food. Gate targets (reproduced, not imposed): a full canopy's fauna 2–9 g wet/m² in June, ≥ 5×
the bare bed's; annual emergence 0.5–2 g DW/m² of vegetated littoral with a May–June peak; the weeds' large insects falling
from June to August; snails 0.5–5 g wet/m² in weed beds; young smallmouth eating mostly insects at 2.5–5 cm.

**Built (stage 7b).** As designed, with what the runs taught: (1) the overwintering larvae stay in the bed beneath the dying
shoots (above the shrinking capacity, no production) rather than joining the worms and scuds — otherwise the next spring's
hatch had nothing to emerge from; (2) the small fauna have their own capacity (a third of the stand's) and are recruited from
the eggs of the emerging adults (15 % of their mass) — sharing one capacity with the overwintered large larvae, the small
collapsed in the second year; (3) the fauna and snails EAT their cell's organic layer and periphyton at the bed fauna's 25 %
yield (no free production); (4) emergence peaks in the spring window (0.08/day) with a fifth or so of the summer generation in
August–September (0.01); (5) surface insects are taken as MET by a fish near the surface, not by allocating search time to
them (under the f⁴ time-share a minor food got none); (6) young smallmouth forage the bed from 2.0 cm (species.js benthL — at
the default 2.5 they had no food between Lzoo 2 and 2.5 cm: a 3-seed A/B, none recruited → 28–267). Results without fish
(the plant block's run): a full pondweed canopy carries 2.8 g wet/m² of fauna in its second August, 14× the barest lit bed;
weed-bed snails ~1 g/m², bare 0.2; emergence 0.6 g DW/m² of the vegetated littoral a year, the spring hatch the larger; the
land's insects concentrated along the forested banks. With fish (3 seeds, May → November): the weeds' large insects cropped to
~0.3–0.5 g/m² (fishless 1.5–2: the research's 2–3× fall); the weeds are 3–5 % of the adults' bed food (the bed's worms and
scuds, Quinte-calibrated, dominate) and a share of the young's; the June hatch fed fish at the surface; young smallmouth reach
3.0–4.5 cm by late July (Opeongo 3.8–4.6) and 17–110 recruit (none before), starvation 32–38 % of the hatch (42–46); young
perch 6.3–6.7 cm by October (5.5–6.2 before), shiners 3.4–3.8, white perch 4.7–5.2, pumpkinseed 2.4–3.0; adult perch
starvation ~110 (300–500); 121–155 kg/ha. test/w3.mjs +6 checks.
**Design (stage 7c) — CRAYFISH (virile crayfish, `littoral3.js`; research `docs/research_notes/Hot Brook populations and
water/invertebrates_plankton_plants.md` §1, `littoral_invertebrates.md` §5).** Two cohorts per bed cell (g wet/m²): ADULTS
(age 1+, ~12 g each — PREY.CRAY_G) and the YEAR'S YOUNG, with a lake-wide individual mass that grows (0.11 g, 6 mm CL, at
release in early July → ~1.4 g, 14 mm, by mid-September → ~5 g, 21 mm, by the next June: W ≈ 0.00052·CL³). SHELTER sets where
they live: the wave-washed shallows (< 1.5 m: gravel, cobble, rock — MDIFW "mostly rocky shores") 25 g/m², weed beds up to 15,
bare mud 2, below 4 m 0.5 — whole-lake 5–20 g/m² (Michigan 4.6–21; rock and weeds 3–10× the average); adults above it are
evicted into the open and die faster. CALENDAR: dormant below 5 °C in winter (no feeding, no exposure), active from ice-out,
growing above 10 °C (most at 21–24 °C); the young RELEASED in early July (~0.23 g of young per g of adults: half females ×
~100 eggs × half surviving to release — 10–15 young/m², as in Michigan's June census), when last year's young join the
adults; the young's own mortality is density-dependent (cannibalism: 60–90 % die by September; 74 % of the rest by the next
August); the adults' ~0.8/yr (a 3-year life). They EAT the bed's organic layer (at 25 % yield) and SNAILS (a few mg per g a
day — they strip snails, Lodge et al. 1994). FISH: by night ~70 % of the active crayfish are out foraging, by day ~30 % (the
rest in burrows and under stones; the stems hide some), plus every adult the shelter can't hold; a fish takes those its gape
fits (a crayfish's width ≈ 2.2 cm × (W/12 g)^⅓ — young crayfish fit a 5–8-cm bass by August, adults only a bass or pickerel
over ~20 cm) at its species' strike success (diet.cray: bass 0.4, pickerel and bullhead 0.15, perch 0.08), as part of "the bed
and its weeds". The big crayfish eaters (bass, pickerel over 3 × their piscivory length) stop foraging worms and scuds: their
bed food is crayfish and the weeds' big insects. THE SEASONS: winter — dormant in the deeper water. Late April — active, eggs
carried. June — hatching under the females. Early July — the young released; young bass of 5–8 cm and perch feast on them.
July–September — the young grow, thin by cannibalism; adults moult (soft, exposed) and mate. October–November — cooling,
inactive below 10 °C, then 5. Gate targets (reproduced): whole-lake 5–20 g/m², ~0.3–1.5 adults/m², the shallows and weed beds
≥ 3× the bare mud; 5–20 young/m² at release, 60–90 % gone by September, ~1–2 g each by then; fish take a minority of the
production (Michigan trout 2–16 %); adult smallmouth eat crayfish as a large share of their food; nothing eaten under the ice.

**Built (stage 7c).** As designed, with what the runs taught:
1. **The young's growth slows with size** (×(W/0.11 g)^−¼). At a constant rate last year's young reached 8 g by June,
   where real ones are ~5 g.
2. **Their density-dependent deaths are stronger** (0.01 + 0.03·D/(D+5) a day). That gives ~80–85 % gone by
   mid-September, as in Michigan.
3. **Snails have a refuge** on the upper leaves (half their capacity) out of the crayfish's reach. Without it the crayfish
   wiped the snails out lake-wide in one summer.
4. **Crayfish count ×5 per gram** (CR_PREF) in a forager's food response. At the worms' half-saturation, big conspicuous
   meals at ~1 out per 13 m² left smallmouth and pickerel feeding at p 0.2–0.3, and their starvation doubled.
5. **Big bass and pickerel no longer forage worms and scuds.**

Results without fish (the plant block's run):
- 15 young/m² released in early July; ~80 % gone by mid-September, at ~1.2 g each.
- Whole lakes ~12 g/m² by the next August, ~0.9 adults/m².
- The rocky shallows hold 5× the mud, the weed beds 2×.
- P/B ~1.3 (Michigan 0.94–1.53).

With fish (3 seeds, May → November):
- Crayfish are 83–85 % of what adult smallmouth eat, 65–69 % for pickerel, ~10 % for bullheads and 3–7 % for perch.
- Smallmouth and pickerel feed at p 0.4–0.57 in summer.
- Fish crop the adult crayfish from 0.63 to ~0.37/m² by November.
- 124–245 young smallmouth recruit.

test/w3.mjs +3 checks.

STILL OPEN:
- (Resolved: not a stall.) The young pumpkinseed's mean length sat at 0.7–1.0 cm all summer only because pumpkinseed spawn
  from June into August. Their schools grow from ~170 to ~590, and new 0.5-cm larvae dominate the mean (L50 0.55–0.65).
  The first cohort (scratchpad psfry.mjs, seed 11) grows 0.26 mm/day in June and ~0.32 in July (real Lepomis 0.3–0.5): 1.3 cm
  by early July, 2.5 cm by mid-August, the fastest 3.4. The later cohorts meet the July–August zooplankton low and grow slowly.
- Young smallmouth survive poorly: ~0.3–0.7 % of the hatch recruit, against a few % in real lakes.
- Adult smallmouth starvation (~200–300 a year) includes the new recruits' first autumn.
- Odonate nymphs are not yet predators of the small fauna and the fish larvae.
- Crayfish over several years: fish crop the adults to the low end of the real range by autumn. In a 2-year run (seed 11)
  they settle at ~0.3–0.46 adults/m² and 5–7 g/m² in all, the low end of Michigan's 4.6–21.

**Design (stage 7d) — FRESHWATER MUSSELS (eastern elliptio; `littoral3.js`; research `Hot Brook populations and
water/invertebrates_plankton_plants.md` §2; the human: "lots of mussels").**
- **Where they live (per bed cell, mussels/m², the stock's capacity):**
  - firm margins 0.5–3 m: 15/m² (5–25);
  - sheltered coves (the plants' wave shelter): beds of up to 40/m² (30–60);
  - the wave- and ice-scoured edge under 0.5 m: 3/m²;
  - the soft deep mud past 3 m: 2/m² (0.5–5);
  - ~1 g dry soft tissue each.
- **Population:** long-lived (15–30 years), so the stock creeps toward its capacity at a few % a year. Recruitment depends on
  the fish that carry the larvae: glochidia go onto yellow perch, white perch, pumpkinseed, smallmouth and sucker gills in June
  at 15–18 °C, so it is ∝ the lake's fish biomass. ~4 %/yr die; long anoxia under the ice kills slowly (they close up and
  live anaerobically for weeks).
- **Filtering:** each clears ~0.8 L of water an hour at 20 °C (lab 0.05–0.19, field 2.6–3.1: the dominant uncertainty), Q10 2,
  nothing below 5 °C (they burrow December–March). They take the green algae and diatoms fully, cyanobacteria at half, and
  rotifers a little, from the water they sit in. Of what they filter:
  - the algae's N returns as ammonium (excretion and fast mineralisation);
  - half its P as dissolved phosphate (excretion), half to the bed's store (biodeposits);
  - the organic matter 30 % assimilated (their slow growth), the rest to the bed's organic layer as faeces and pseudofaeces,
    feeding the worms and scuds.
- **The budget:** N and P stay closed; the mussels' own tissue is an energy pool like the fish's.
- **Seasons:** spring — filtering resumes after ice-out, spawning in May; June — glochidia on the fish; summer — peak filtering
  in the warm shallows (at 15/m² under a metre of water they clear ~30 % of it a day); autumn — slowing; winter — burrowed.
- **Gate targets:**
  - firm margins 5–25/m², coves to 30–60, deep mud 0.5–5;
  - bed biomass 10–30 g DW/m² where they are dense, more than the other benthos together;
  - summer clearance 0.4–24 % of the overlying water a day;
  - none in winter;
  - N and P conserved.
- **The view:** dark half-buried shells on the bed near the camera.

**Built (stage 7d).** As designed (`littoral3.js` `_mussels`; capacities LIT3.MU_FIRM 15 / MU_COVE 40 / MU_EDGE 3 / MU_DEEP 2,
recruitment MU_R 0.25 a year × the host fish's share in June, MU_CR 0.8 L/h at 20 °C, Q10 2, burrowed < 5 °C). Gate (seed 541):
firm margins 11.0/m², coves 29.3, deep mud 1.4, the scoured edge 2.2; in July they clear 22.5 % a day of the water they sit in,
in January none; P and N closed. **The mussels compete with the zooplankton for the algae** (bivalves' grazing on the
phytoplankton — Strayer et al. 1999; the research's high end "is enough to matter for phytoplankton on the shallow margins"):
a 3-seed A/B of June (mussels off → on): June algae 0.150 → 0.131, 0.151 → 0.100, 0.117 → 0.133; the zooplankton's June
production 13.8 → 11.8, 16.0 → 6.0, 7.6 → 8.4 kg/ha/day (−30 % on average); the June peak still 207–322 µg/L; the fish's
share of the production 43–54 % → 50–58 %. The gate's June check said "fish eat under half of it" — seed-fragile (one seed
was at 54 % without mussels) — and is now restated as the guard it was meant to be, against the PREDATOR PIT (fish took 70–110 %
of the production): under 65 %. The view: dark shells (a flattened ellipsoid ~8 × 4 × 2.5 cm) half-buried at each 1.5-m
cell's real number within 18 m of where the camera looks (closer than 60 m), on the reflection-excluded layer like the weeds.

**Built (stage 7d).**
- As designed. Recruitment is per capita × (1 − N/K) × the host fish (0.25/yr at full hosts): the first rate (0.06) could
  never balance the deaths, and the stock would have dwindled over decades.
- **Results without fish (the plant block's run, no hosts):** firm margins 11/m², coves 29, deep mud 1.4, the scoured edge
  2.2. July clearance 22.5 % a day of the water they sit in, January none.
- **Their effect:** they trim the June algae by ~17 % lake-wide; the July algae crash is the zooplankton's grazing, the same
  without them. N and P drift 0.000 % over a year.
- **The view:** each 1.5-m bed cell's real number of shells within 18 m of where the camera looks (plants3view).
- test/w3.mjs +2 checks.

**DECIDED (human, 2026-10-16) — REAL TIME.** "I want to make this a realistic simulation, with each animal actually thinking,
learning, and behaving the way they would first, then eventually slowly evolving over time." The 1-hour year gives way to a
real-time clock: at 1× a day is 24 hours and each animal lives it in full detail. Fast-forward integrates the same per-second
rates over coarser steps (stage R, SESSION_STATE: the audit, the clock, the fish's fidelity ladder, the gate in coarse mode, the
speeds). The wildlife below is designed for the old clock's catch-per-step and will be built on the real-time one: a loon's dives
and catches then happen at their real pace.

**Design (stage 7e) — the fish-eaters of the water, the shore and the air (`src/w3/wildlife3.js`; research
`docs/research_notes/Maine lake shores and catchment/shore_birds_and_mammals.md`).** True-size animals, behaving as they do,
in the numbers a person sees on the lakes. Their CATCH matches the real lakes' PER HECTARE: the model is a 1/10 replica holding
1/100 of the real lakes' fish, so the model's total catch per kind is the real lakes' total × the area ratio (GEO.SCALE²), shared
among the animals shown. Each takes its share as whole fish, a fish at a time, while it is hungry (its ration per calendar day).
- **LOONS:** a pair on each lake (Upper 360 ha, Lower 277 ha; Maine ~1 pair per 95–280 ha), ice-out to mid-November, two chicks
  from early July. They swim the surface and dive 40–60 s (rest ~20 s), pursuing fish of 10–70 g (perch, white perch, sunfish,
  shiners; ≤ 25 cm) within ~5 m. A family takes ~2.5 kg a day (Barr: 423 kg in ~5.5 months).
- **OSPREY:** a pair from a nest near the lakes, early April to early September. They circle 20–40 m up and plunge feet-first on
  fish within ~1 m of the surface: 20–40 cm suckers, perch, white perch, bass, pickerel. ~0.3–0.4 kg a day each, ~1 kg while
  feeding young; 50–80 % success in calm clear water, less in wind.
- **BALD EAGLE:** one, all year. It perches in the shore pines and snatches fish at the surface — sluggish or dying fish,
  bullheads, spawning suckers in the brook — and scavenges on the ice. 0.3–0.5 kg a day.
- **GREAT BLUE HERONS:** two, April to November. They wade water ≤ 0.5 m (0.1–0.3 best) at dawn and dusk and take fish of
  5–20 cm (≤ 25), frogs and crayfish; ~300 g a day each.
- **BELTED KINGFISHERS:** three (~1 per 0.8 km of real shore, shown along the world's), April to November. They perch on bare
  shore snags 2–6 m up and plunge on fish of 3–12 cm within ~15 cm of the surface in water ≤ 60 cm, only in calm, clear water.
  ~70 g a day.
- **RIVER OTTERS:** a family of three that visits for a few days every few weeks, all year (under the ice from the brook).
  They swim and dive at any depth, mostly dawn to mid-morning, taking slow fish (suckers, bullheads, sunfish), crayfish and
  frogs; ~1.5 kg a day each.
- **MINK:** two along the brook and the shore, at night, within ~300 m of a den. Fish in winter and spring, crayfish in
  summer; ~0.2 kg a day.
- **(Later, with the shore: hooded mergansers, raccoon, beaver, muskrat.)**
- **The fish respond:** a diving loon or otter near a fish is a threat it senses and flees (fish3's threat input). Very
  shallow water is riskier by day — the heron's and kingfisher's — so the larger fish keep out of it in daylight (research §9).
- **The view:** low-poly true-size animals (loon, heron, kingfisher, osprey, eagle, otter, mink) with their motions — the dive,
  the wade, the plunge, the circle.
- **Gate targets:** each kind's catch per calendar day = its real total × the area ratio (±30 %), of the sizes and depths it
  takes; the calendar (no loons, ospreys or herons under the ice; the eagle all year); the fish flee a diving loon; total bird
  and mammal predation a few % of the fish stock a year (loons ~1–4 %).

**Built — fish seek oxygenated water under the ice (Fish3._o2Better).**
- **The finding:** a 2-year run with fish lost half its biomass to hypoxia in the second late winter (~5,000 perch, white
  perch and shiners). The fish could only escape low O₂ upward.
- **What the water does:** the water model's late-winter O₂ is the same with or without plants. The lake-wide mean falls to
  ~2–3 mg/L by March and the worst columns go anoxic. The budget agrees: a 3-m column holds ~36 g O₂/m² at ice-on, and a
  measured-range bed demand of 0.2–0.3 g/m²/day over ~120 days of ice draws it down.
- **The new behaviour:** short of O₂, a fish (and a school of young) also swims ACROSS the lake toward the best-oxygenated
  column about it, at its sustained pace: under the ice, toward the inflows and the brook's mouth (15,000 fish crowded an
  oxygenated inlet in a Michigan winterkill).
- **Result:** hypoxia deaths over the same 2 years fell to 7, and May biomass in year 3 was 108 kg/ha (54 before).
- **Still for the human:** whether Hot Brook's late-winter O₂ really falls this low (ice-fishing observations).
- test/w3.mjs +1 check.

**Built — THE SEASON'S YOUNG SO FAR (Fish3.seedSeason, 2026-10-16).** The human, on a fresh lake: "it's saying there aren't any
schools of young fish, is that correct?" It wasn't: a lake opens on May 20 (SEASON.START_YF), after the yellow perch and pickerel
have spawned (6–12 °C, just after ice-out) and while the suckers and white perch are spawning; the real lake holds their young.
- **The mechanism:** over [yf0, yf1) each mature fish of a species whose spawning window (seasonalTemp within spawnT ± SPAWN.EDGE)
  has passed spawns as `_spawn` would — with the chance of the share of its population's spawning that is past (spread over the
  window's first F3.SEED_SPREAD 10 days: the live sim's perch spawned 49 of 52 within ~5 days) — on its ground (the brook for a
  brook runner, the species' traditional sites, else water of its spawning depth near home): eggs × hatch, a crossed and mutated
  genome, a nest guard while the guarding lasts. The young are then carried day by day to the date (`_spinYoy`): FB4 growth at
  the season's temperature and F3.SEED_P of Cmax (0.73 in spring easing to 0.5 by early July, the live young's midsummer drop),
  and `_stepYoy`'s mortality × SEED_M 1.2 (for the live sim's eaters).
- **Calibration** (against the same lakes run in full from ice-out): May 20, 3 seeds — perch 1.05 cm (live 1.05–1.07), suckers 1.4
  (1.43–1.47), pickerel 1.05 (1.01–1.04), white perch just hatched; late July — perch 4.0 (4.2), suckers 4.0 (4.1), white perch 2.9
  (2.4–3.1); Sept 12 — perch 5.7 (5.0–5.5), suckers 5.5 (4.9–5.6), bullheads 4.5 (4.2–4.8), pumpkinseed 2.8 (2.3–2.9). Off: the
  young pickerel (fish eaters live) ~4 vs 7 cm by September, and the young bass survive the spin far better than in the live sim
  (its open young-bass survival problem).
- **Where:** `new Fish3(env, { young: true })` (the worker; the gate's unit tests keep founders only); a FORWARD season jump calls
  `seedSeason(y0, y1, true)` — the young already there are carried too, and `a.lastSpawn` keeps a fish to one spawning a year.
- **Also fixed:** the water's light was computed only in `Env3.step`, so a fresh lake sat in night (sun 0, lux 0) until the water's
  first step — at 1× a minute. `Env3._light()` now runs at `primeSeason` too.
- **Found:** from ice-out to May 20 the water runs 1.5–3.5 °C below the calendar curve (May 20: 11.7 vs 13.2 °C) — for the
  calendar calibration later.
- test/w3.mjs +1 check (a May-20 lake vs the gate's spring run on that date: ×0.5–2 the numbers, ±30 % the sizes on the coarse grid).

## 6. The renderer (`src/w3/render3/`, browser layer)

three.js r186 (`WebGPURenderer`, which falls back to WebGL2 by itself; ES modules with an import map — self-hosted pinned
files, or jsDelivr with the import map's hash in all three CSP places; no KTX2/DRACO). Measured on the human's RTX 3060:
20,000 animated fish ≈ 1.2–1.5 ms GPU per frame at 1080p–3440×1440; the CPU limits first, so the worker posts the last two
sim snapshots per step and the vertex shader interpolates and swims them. Scene: terrain from the world (and the full model
far away), water from above (reflection, refraction) and below (Snell's window, per-channel Beer–Lambert fog for
tea-coloured water, caustics in the shallows, god rays), plants on instanced cards, trees with LOD, sky with clouds and sun,
rain and snow, seasons (leaf colour, ice and snow), the camera anywhere (aerial → a single fish; follow; tour). Quality tiers
and dynamic resolution for weaker GPUs.

**Built — the simulation in a Web Worker (`src/w3/render3/sim3worker.js`).** The worker owns Env3, Fish3 and the plants; the
view posts `tick` with the time passed only once the last reply is in, and the worker steps the fish at 10 Hz and the water at
5 Hz within a 40-ms budget, then replies with packed snapshots (fish: 18 floats each with the last step's position for
interpolation; young-of-year: 11; the ice; the cut-away's field every 10th tick) and, every 4 s and after a season jump, the
weeds' shoots per form per bed cell. Behind, it runs slower than asked (the clock says "running at N×").
**Built — the weeds on screen (`src/w3/render3/plants3view.js`).** Instanced tufts per form (thin swaying ribbon blades for the
submerged canopy, reeds through the surface, low spikes and tufts for rosettes and moss, notched lily pads on the surface),
scattered over each 1.5-m bed cell by its stand, fresh in spring, browning from the autumn reallocation (evergreens stay
green). Stems are drawn near where the camera looks (submerged ~0.9 × the camera distance, 25–110 m; pads and reeds 2×) and
kept out of the water's reflection (their own layer); farther off the bed is tinted by each cell's weed cover. Their instance
buffers are static with update ranges — a dynamic buffer is re-sent whole every frame (it cost 8 ms a frame; now ~0.1 ms).
**Built — seeing into the water (`src/w3/render3/water3.js`, after the human's "you can't really see into the water to see
the fish and even the underwater view is not good").**
- **What it was:** a dark, mostly opaque surface (55–95 % opacity) hid everything below, and underwater was one flat
  brown fog.
- **Under the surface:** the bed, the weeds and the fish are dimmed and tinted by their water path (material.outputNode):
  per-channel Beer–Lambert, Kd red 0.55, green 0.75, blue 1.9 /m — tea water absorbs blue most. The path is the sunlight's
  way down plus, for an eye above, the way back up along the refracted ray. The water's own scattered colour fills in, so
  deep water turns tea-brown.
- **The surface from above:** a Fresnel mirror of the shore and sky over a nearly clear surface. Looking down you see the
  bed, the weeds and the fish, fading with depth.
- **The surface from below:** Snell's window. The sky shows within ~48.6° of straight up, tinted by the water and broken by
  wave lines; beyond it the surface mirrors the dark water.
- **The shallow bed:** moving bright lines (caustics), fading with depth.
- **Each fish casts a soft shadow** on the bed below it, along the sun's ray, fading with height above the bed and with
  depth. In shallow sunny water a shadow is often what gives a fish away.
- **Underwater:**
  - three's FogExp2, its colour following the gaze: bright looking up, the water's colour level, dark down, darker deeper;
  - 2,500 drifting specks about the eye;
  - with "See into the water", a fill light.
- **"See into the water"** (on by default) thins the water to 0.3 × its Kd, so fish show to several metres — clearer than
  the real lakes, for watching.
- **A lesson:** a custom scene.fogNode turned the instanced trees black (three r186), so the fog stays a legacy FogExp2.
- **For the human:** whether to keep this default and how strong the tint is are taste questions. True-size fish are still
  flecks from a few metres up (as real ones are); the ×4 size shows them. (The human: keep "see into the water" on.)
**Built — a school's fish swim as fish (fish3view `swimCrew`, after the human's "at ×4 they start twitching and not behaving like
fish, especially the schools — the schools should still be independent fish").**
- **What it was:** a school agent's members were drawn on a rigid pattern bolted to the agent. When the school turned, the
  whole pattern swung at once, faster and wider at ×4. The young-of-year faced fixed random directions.
- **Now** each drawn member (adults' schools and the young's) is a swimmer with its own position, velocity and heading,
  kept between frames:
  - pulled to its place in the school (the slot turns with the school's heading at ≤ 1.5 rad/s) by a critically damped
    follow (ω 2.2/s) with the school's velocity fed forward;
  - at most a sprint (6 body lengths/s);
  - turning at ≤ 3.5 rad/s toward the way it is going (with the school when idling);
  - pitching with its climb or dive.
- **Measured over 90 frames at 60 fps:** no member moves more than 0.016 body lengths a frame or turns faster than the cap.
- **What the sim still does:** a school is one agent of n fish (super-individuals — the design's way to run ~16,600 fish).
  Its fish move individually only in the view.

**Built — RISES, SPLASHES, LEAPS AND THE INSECTS ON THE WATER (2026-10-16; the human: "don't forget about the bugs on the surface
and bass or some fish jumping to get them").** The sim already had the surface's insects (littoral3: the weeds' emergence and the
land's fall-in) and fish taking them near the surface. Now fish3 counts each fish's surface feeding as single insects of
`F3.INSECT_G` 2 mg wet (by count mostly midges and small land insects; ≤ `RISE_MAX` 4 an agent a step) and records each as a RISE
[x, y, length, species, id, count]; sim3worker.js carries them in each snapshot (≤ 300) and the insects' density per column with
the weeds every 4 s. `render3/rises3view.js` draws a ring spreading and fading on the water for each (2.6 s; a school's spread
about it), a splash for a fish of 15 cm or more, and turns some into LEAPS — smallmouth (25 %) and pumpkinseed (6 %) arcing out of
the water at a damselfly or dragonfly (cosmetic: Math.random; fish3view draws the leaping fish in the air) — and floats the insects
as dark specks on the film near where the camera looks. In the real lake-like sim the fish keep the surface nearly bare (mean
~0.05 mg/m²), so rises are sparse — a few a minute in view at dusk; fast-forward's blocks count at most 4 an agent. test/w3.mjs +1
check. OPEN (audit B11): the real-time rung takes ~1/7 of what a block takes at the surface — the rungs' surface feeding to equate.

**Built — THE CRAYFISH AND SNAILS ON SCREEN (`render3/bed3view.js`, 2026-10-16; the human: "do you have snails and crawfish too?
those are in there").** Both were already in the sim as biomass per bed cell (littoral3: virile crayfish, adults and the year's
young, by shelter; soft-water snails on the weeds and the lit bed) — eaten, never drawn. `Littoral3.shown(night)` gives per bed
cell the crayfish OUT on the bed now (/m²: out foraging 70 % by night, 30 % by day, none under 5 °C, the weeds' stems hiding some,
plus every adult the shelter can't hold — as `crayE`) and the snails (/m² at LIT3.SN_W 0.1 g); the worker sends them with the
weeds every 4 s. The view puts each 1.5-m cell's real number near where the camera looks (adults within 16 m, the young crayfish
within 9 m, snails within 7 m): low-poly crayfish (carapace, abdomen, tail fan, claws; adults ~8.5 cm, the young at their mass)
walking slowly about where they are (2–5 cm/s, pausing), olive to rusty brown — in the tea water they read as brown shapes on
the mud; snails ~1 cm on the bed. Shown with the Fish toggle.

## 7. A year in the 3-D lakes (walk-through)

- **Late April (ice-out ~Apr 23).** Shore leads open first; spring sunlight has already convected the column under the
  snow-free ice and lifted O₂. The brook runs high (April ~3.3× mean flow). Pickerel spawn in the flooded shallows (7–10 °C);
  suckers run up the inlet and the brook's riffles (11–13 °C); yellow perch lay ribbons on brush; smallmouth leave their
  wintering sites and spread along the shore.
- **May–June.** The 44 % of Upper ≤ 3 m warms first; smallmouth nest within ~20 m of last year's nest on gravel at 0.5–2 m;
  pumpkinseed and redbreast colonies in < 1 m; fallfish build mounds in the brook (14–19 °C); shiners spawn on weeds; white
  perch school offshore by day, inshore at night; sunfish start moving into the brook.
- **July–August.** Surface 23–24 °C, the bottom a degree or two cooler; wind keeps O₂ up, calm spells stratify the north
  basin weakly for a day or two; on calm nights the coves' cold water siphons down into the basin; dense weed beds warm by
  day and go low in O₂ at night at the bottom; sunfish crowd the brook's mouth pool and the shallow run; young-of-year
  schools spread over the open water and the weed edge; bass hold near shore (≤ 50 m).
- **September–November.** Cooling convects the column; the siphon runs most nights; fish are most mobile (perch roam);
  sunfish drift back to the lake; leaves fall; plants die back; ice forms ~Dec 1, shallow coves first.
- **Winter.** Snowy ice cuts light to 1–12 %; the bed's demand draws O₂ down fastest in the shallow coves, the down-slope
  exchange and the deep basin's volume holding the lake at 5–12 mg/L with a hypoxic layer over the mud; smallmouth nearly
  still at their wintering sites; pickerel and perch active (the angler ice-fishes them); white perch gather in the deepest
  basin.

## 8. Plan (stages; each leaves both gates green)

1. **Geometry** — done (§2; `test/w3.mjs`).
2. **Design** — this document (research notes in §0).
3. **Environment in 3-D** — the column graph, per-column physics and chemistry ported from `environment.js`, the horizontal
   processes of §3, ice, closed budgets; a headless check suite; a quick 3-D view of the fields for the human.
4. **The renderer's first light** — terrain, water and the field views, so the human can see the 3-D lakes early.
5. **Fish in 3-D** — the agent core, 3-D senses and brains, movement, feeding, predation, schools.
6. **Reproduction, young-of-year, recruitment; the new species (redbreast, fallfish, killifish, dace); calibration to the
   real numbers** (the census and fate diagnostics, ≥ 3 seeds).
7. **Plants, invertebrates, wildlife, the shore and the air.**
8. **Saves, fast-forward, performance, the UI; parity → the app switches to 3-D.**
