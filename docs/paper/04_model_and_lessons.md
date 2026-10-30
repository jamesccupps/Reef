*The Hot Brook lakes of eastern Maine* — part 4 of 5

[← Synthesis II: fish, early life, predation, wildlife and forest](03_synthesis_fish_to_forest.md) · [Contents](README.md#contents) · [Discussion, data availability and the use of AI →](05_discussion.md)

## 4. The model (Methods)

The model is a spatially explicit, individual-based simulation of Upper and Lower Hot Brook Lake and the brook between them: a
three-dimensional water and chemistry model, plants and invertebrates as fields, fish as agents with their own neural networks and
published bioenergetics, and the wildlife, anglers and camps that take from or add to the lakes. It is written as pure JavaScript
modules (`src/w3/`) that run in Node and in a browser worker, and it inherited, then re-based on field values, the calibrated rates of
an earlier two-dimensional slice model of a generic lake (`src/`). What is described here is the "package": every mechanism built so
far, switched on together by one function (`stageR5` in `src/w3/fish3.js`), each switchable for A/B comparisons (Table 4.2); section 5's findings
come from it and from its earlier states. Most parameters in
`src/config.js` and the modules carry their source in a comment or are marked as an inference — here "(project estimate)". The package is described as
committed on 23 October 2026 (commit cf70977); the last arms in section 5 (arm AM, 22–23 October) ran before two of its
pieces were added, the camps' effects and the young white perch's move to the bed at 2 cm.
<!-- src: docs/HOT_BROOK_3D.md intro, §8; docs/review/ECOSYSTEM_BUILD.md "How each component is built"; src/w3/fish3.js stageR5(); git log (cf70977, c7eb668); docs/FINDINGS.md 2026-10-23 "Arm AM" -->

### 4.1 The world

The geometry comes from public data (`tools/hotbrook/`). Terrain and lake outlines are from the USGS 3DEP lidar (Maine Eastern B1/B2,
2017), whose hydro-flattened water surfaces put the lakes at 128.93 m (Upper) and 128.23 m (Lower). The beds are from the 1949 MDIFW
survey maps (revised 1965 and 2004): their 146 spot soundings were located on the scans, fitted to today's shoreline by trimmed
iterative closest point (median misfit 18 m) and interpolated. The shallowest fringe (fully to 1 m, fading out by 1.5 m) is from the visible-bottom band of NAIP aerial
photographs, its dark edge set at 1.3 m by angler observations (project field notes); the photographs had no skill against held-out
soundings at 1–3 m, so they set only the fringe. Land cover is NLCD 2021 with the National Wetlands Inventory over it. On this
geometry Upper covers 369 ha (mean depth 2.99 m, maximum 5.52 m in its north basin by the outlet) and Lower 274 ha (2.57 m, 4.12 m);
44 % and 55 % of them lie at ≤ 3 m. The brook is 154.6 m long and ~8 m wide, with a pool of 1.06–1.13 m at its upper mouth and riffles
of 0.35–0.45 m (profile from angler observations). Water runs south to north.
<!-- src: docs/HOT_BROOK_3D.md §2 "Rebuilt from lidar and aerial photos"; docs/FEATURES.md "2026-10-15 … stage A"; docs/TRUE_SCALE.md T1 "Built"; tools/hotbrook/build_model.py; tools/hotbrook/shallows.py; src/w3/geometry.js; Hot Brook populations and water/lidar_and_shallows.md -->

There are two worlds. The true-scale world, the viewer's default and the world of the year runs, is a band of 455 × 1,385 cells of 5 m covering the lakes and ~150 m of land
around them. The older 1/10 world divides horizontal lengths by ten at true depths (1.5-m cells, 6.4 ha of water, the brook at half its
length) and remains where most CPU checks and probes run. Distance-dependent physics uses real lengths in both worlds, and landscape
distances (home ranges, search radii) are written as real metres × scale. Because the 1/10 world steepens slopes ten-fold and makes the
brook ~25 times its real share of the shallows, habitat and predation are judged at true scale. The water is a graph of columns 50 m across (real), each with
0.5-m layers to its bed — 2,622 columns and 15,072 cells at true scale — with the brook given its own 20-m stretches so its pool and
riffles are not averaged into its banks. The bed keeps the geometry's cells, each holding an organic layer, bed animals, plants, mussels
and a substrate (rock, gravel, sand, organic) mapped from wave exposure and shore type, which sets crayfish shelter, rooting room and
spawning substrate.
<!-- src: docs/TRUE_SCALE.md T1–T3, T6a; docs/HOT_BROOK_3D.md §2, §3 "Grid"; docs/TRUE_SCALE.md T2 "THE BROOK'S OWN COLUMNS"; src/w3/env3.js H3, buildColumns3; src/w3/fish3.js HOME(), F3 (× GEO.SCALE); tools/hotbrook/build_substrate3.py; docs/review/ECOSYSTEM_BUILD.md E1 -->

### 4.2 Time, the calendar, weather and the catchment

The clock is real time (a year is 365 × 86,400 s); the 2-D model's per-second rates enter multiplied by 1/17,520, the ratio of its
30-minute year to a real one. Fidelity changes the time step, never the clock. Fish near a viewer take 0.1-s steps, deciding every
second step (5 Hz); far fish then live staggered 60-s blocks. The gate and the year runs use coarse blocks of 1,752 s (~29 min), in which
each fish's brain decides once, the fish moves in at most six hops toward where its drives point as bent by its brain, then wanders, and
it feeds, grows, spawns and is exposed to predators over the block. The water is updated once a block.
<!-- src: src/w3/clock3.js; docs/HOT_BROOK_3D.md §1 "REAL TIME", §4 "Design (stage R3)"; src/w3/fish3.js F3 (FINE_MAX, RELOC_N, BRAIN_BEND, FAR_BLOCK, DECIDE_EVERY); tools/gpu/year.js (B = 1752) -->

The surface-temperature target is a "Maine calendar", a monotone cubic through 13 knots: ice-out at ~4 °C around 23 April, 10 °C
around 12 May, a 24 °C peak at the end of July, below 10 °C again around 15 October and ice-on around 1 December — 208 days below 10 °C,
matching the 208 ± 4 days reported for Spednic Lake ~30 km east (Dudley & Trial 2014). Runs open on 20 May with "the season's young so far", spawned over each
window's first ten days and grown at 0.73–0.5 of maximum consumption, a start calibrated against the lakes run from ice-out.
<!-- src: src/config.js SEASON (TEMP_KNOTS, START_YF); src/w3/fish3.js F3 (SEED_P, SEED_SPREAD); docs/HOT_BROOK_3D.md §5 "THE SEASON'S YOUNG SO FAR"; Maine lakes ponds and streams/maine_limnology_streams.md; fetched_sources_digest.md (Spednic WD 208 ± 4) -->

The weather has four sky states (clear, cloudy, rain, storm; winds 2.5, 4.0, 6.5 and 10 m/s) in a frontal cycle with mean spells of
1.0, 1.6, 0.6 and 0.5 days (× a uniform 0.6–1.4) and gamma(2)-distributed rain per wet episode, fitted to Houlton's daily record (NOAA
GHCN-Daily USW00014609, 1991–2020; Table 4.1). Air temperature is Houlton's monthly normal plus a synoptic Ornstein–Uhlenbeck anomaly
(SD 2.6–6.5 °C by month, time constant 3 days), a seasonal one (SD 1.0 °C, 30 days) and the storms' warm air in winter (Houlton's wet
days up to ~5 °C above the month's mean). The water's target moves 0.75 °C per °C of air anomaly (project estimate). The weather has its
own random stream, so changes to the fish or plants cannot change a seed's weather.
<!-- src: src/config.js WEATHER3 (SYN, CHAIN, DWELL, P_K, AIR_N, SYN_SD, SYN_TAU, SEA_SD, SEA_TAU, K_WATER, WET_T); src/w3/env3.js H3.WIND_MS, _wrand; docs/review/ECOSYSTEM_BUILD.md E9a, E9d; Maine lake shores and catchment/weather_and_catchment_hydrology.md, houlton_daily_precipitation.md -->

The catchment is a conceptual model with the HBV structure (HBV n.d.) — a degree-day snowpack, Hamon's potential
evapotranspiration, a soil store and quick and slow runoff stores — driven by Houlton's precipitation (998 mm a year). Its seven
parameters were fitted inside HBV's usual ranges by 1,000 random draws (30 years × 2 seeds each) to the monthly flow ratios of
Wytopitlock Stream (USGS 01030350) and the Mattawamkeag River (Table 4.1). The flow scales the lakes' through-flow by Q/Q_ref, keeping mean
residence at ~100 days in Upper and ~55 in Lower, and sets the brook's depth as (Q/Q_ref)^0.4 (Leopold & Maddock 1953).
<!-- src: src/config.js WEATHER3 (HYDRO, DDF, KPEC, LP, FC, BETA, K1, PERC, K2, Q_REF, BROOK_EXP, BROOK_LV); src/w3/env3.js H3.RES_UPPER_D/RES_LOWER_D; docs/review/ECOSYSTEM_BUILD.md E9b–E9d -->

**Table 4.1.** The weather generator (60 years × 2 seeds) and the fitted catchment model (60 years × 3 seeds) against their targets. Fitted
catchment parameters:
field capacity 82 mm, β 2.72, LP 0.39, quick-store recession 0.196 d⁻¹, percolation 0.21 mm d⁻¹, slow-store recession 0.0048 d⁻¹,
snowmelt 4.61 mm d⁻¹ °C⁻¹.

| Statistic | Target | Model |
|---|---|---|
| Wet days (≥ 0.25 mm), Houlton | 39 % | 39–40 % |
| P(wet \| wet) | 0.50 | 0.52 |
| Mean wet / dry spell | 2.0 / 3.1 days | 2.1 / 3.1 days |
| Days ≥ 25.4 mm a year | 6.9 | 6.1–7.0 |
| CV of monthly totals | 0.44 | 0.47–0.52 |
| Annual runoff, eastern Maine gauges | 580–710 mm | 582–592 mm |
| April / August flow ÷ mean | 3.3 / 0.30–0.33 | 2.75–2.79 / 0.40–0.60 |
| Daily storm recession | 0.81–0.88 | 0.85–0.87 |
| December flow ÷ mean | 1.13–1.41 | 0.86–1.01 (a known misfit) |

<!-- src: src/config.js WEATHER3 comments (E9d fit, probe wx2.mjs; HBV fit, probe wxfit2.mjs); Maine lake shores and catchment/houlton_daily_precipitation.md, weather_and_catchment_hydrology.md -->

Ice forms column by column, first in sheltered coves (an exposed column must be 0.12 °C colder per m/s of wind × its exposure). It
thickens by Stefan's law, h = α√(freezing degree-days), α falling from 2.7 to 1.3 cm (°C·d)^−½ under deep snow. Snow on the ice is 0.7
of the season's snowfall (project estimate) and floods to white ice when its load exceeds the freeboard. Light under ice is a layered
Beer–Lambert transmission with Donini et al.'s (2026) median albedos and extinction coefficients, so 40 cm of black ice passes ~33 % and
10 cm of snow on it ~1.8 % (Maine measurements 1–12 %). The cover goes only once melted through.
<!-- src: src/config.js WEATHER3 (STEFAN, LAKE_SNOW, SNOW_RHO, *_ALB, *_K); src/w3/env3.js H3.ICE_WIND, ICE_GONE; docs/review/ECOSYSTEM_BUILD.md E10a; docs/FINDINGS.md 2026-10-21 "A winter thaw lifted the whole lake's ice in a day" -->

### 4.3 Physics and chemistry

Each column's temperature relaxes toward the calendar target plus the air anomaly, with a diel swing wider in thin water; there is no
explicit surface heat budget. Wind mixing (6 m at ordinary wind) and night convection (6 m) keep the basins (≤ 5.5 m) from staying
stratified. Below 4 °C colder water floats, and under ice the bed's stored heat warms the water above it toward 4 °C. Transport is
conservative finite-volume: a wind-driven, depth-averaged circulation from two precomputed friction-dominated fields (RMS 2 cm/s at
5 m/s wind) with a surface drift of 1.2 % of the wind and its return flow; grid-scale horizontal diffusivity K = 3.6 × 10⁻⁴ L^1.07 m² s⁻¹
(Lawrence et al. 1995); a night thermal siphon down the slopes at 0.9 cm/s on calm nights (Doda et al. 2022);
a 3-mm/s density current under ice; damping of currents in shallow water by up to ~90 % (bottom friction and summer weed beds, as a
function of depth); and the through-flow, solved implicitly. The
free surface and Langmuir cells are not simulated. Each column's effective fetch (16 directions) gives the depth stirred by a 10-m/s
storm's waves (Coastal Engineering Manual hindcast; 0.7–1.2 m here). A colour term of 0.4 m⁻¹ for the stained water gives a summer
Secchi depth of ~3.3–3.5 m (§5.5).
<!-- src: docs/HOT_BROOK_3D.md §3; src/config.js THERMAL (MIX_M, NIGHT_MIX_M); src/w3/env3.js H3 (CIRC_RMS, DRIFT, K_H, SIPHON_V, ICE_SLOPE_V, BED_HEAT), shallowDamp; docs/HOT_BROOK_3D.md §5 "Built 7h" (fetch); src/w3/chem3.js CHEM3.KD_COLOUR; docs/FINDINGS.md 2026-10-22 (Z1b + Z2: Secchi 3.3–3.5 m); Whole lake 3D fish simulation/shallow_lake_3d_physics.md -->

Re-aeration follows the lake-size wind model k₆₀₀ = 2.51 + 1.48U + 0.39U·log₁₀A cm/h (Vachon & Prairie 2013) with a convective night
floor and none under ice, and saturation follows Garcia & Gordon (1992). Oxygen is made by phytoplankton, plants and the bed's algae,
and used by their respiration, by bacteria decomposing dissolved organic matter (DOM), by nitrification (4.6 g O₂ per g N), by the
bed's demand and by every fish in its own cell. Nitrogen and phosphorus are carried as ammonium, nitrate and phosphate, in four algal
groups, in DOM, in the bed's bound-P store and in the plants. The inflow carries ~14 µg/L of total P, almost all of it as phosphate,
and its inorganic N is 95 % nitrate; a version with the field's P forms was built, tested (section 5.2) and is switched off. The bed
captures dissolved P through a diffusive boundary layer, receives settling algae, buries bound P, and releases P by a
temperature-driven oxic flux (Q₁₀ 2.5; after Søndergaard et al. 2003) and under anoxia. Burial was refitted
on the true world's grid to a retention of ~0.48 by the second year, inside the 0.28–0.54 that four published retention models give for
these lakes' flushing (section 5.2). The bed's organic layer receives settled algae, dead plants, faeces, carcasses and a catchment
subsidy of 800 g wet m⁻² yr⁻¹, half of it an autumn leaf fall (late September to mid-November) weighted to the shore (project estimate); its decay is the bed's O₂ demand.
<!-- src: src/w3/chem3.js header, CHEM3 (K600_NIGHT, SAT_P, BED_EXCH, REL_OXIC, REL_Q10, ALLOCH, IN_NUT, N_FORM, IN_NH4_SHARE, LOADS); src/config.js ZOO3.Z2_BURY; docs/FINDINGS.md 2026-10-22 (retention; P forms; ammonium); Whole lake 3D fish simulation/oxygen_metabolism.md -->

A ledger records every input, output, burial, denitrification and fixation, and the N and P inventories of water, bed and plants must
close against it (section 4.8). Animals are energy pools outside these inventories: the N and P in what they eat returns to the water at
once. Every flow across the lakes' edge passes through the ledger, including plants carried ashore by moose and deer or pulled from
swim areas, the alewives' import and export, and the camps' loads.
<!-- src: src/w3/chem3.js inventoryP(), inventoryN(), ledger; docs/review/ECOSYSTEM_BUILD.md E8 "Nutrients"; test/w3.mjs section 'chem' -->

### 4.4 Producers and invertebrates

The four algal groups are edible greens, diatoms, nitrogen-fixing cyanobacteria and large grazing-resistant algae. Growth is per
capita, limited by light, temperature and nutrients, with a P half-saturation of 1 µg/L for all but the cyanobacteria (Edwards et al.
2015's compiled median is 1.08); each group sinks at its own speed (greens and resistant algae 0.1, diatoms 0.5 m/day), and lysis is
0.08 a day at 20 °C. Zooplankton are biomass fields for Daphnia, small cladocerans (*Bosmina*, *Ceriodaphnia*, *Chydorus*,
*Diaphanosoma*), copepods (with a seasonal naupliar share of 10–34 %) and rotifers, with resting-egg banks. Each grows from what it eats
by a Holling type II response with field clearance rates (Daphnia 1.0, copepods 0.4 mL µg⁻¹ d⁻¹), starves below maintenance, and is
eaten by invertebrate predators (0.05 of young Daphnia a day at 20 °C); copepods persist by lower losses and ~30 % autumn dormancy, and
rotifers and cladocerans also eat bacteria grown on DOM. Weed beds give a refuge.
<!-- src: src/config.js RESALG, ZOO3 (Z1, Z2, Z2_KP, Z2_SINK, Z2_LYSIS, MICRO, DAPH_LIM, SMALL, NAUP_V, INV_D), PHYTO.PER_CAPITA; src/w3/chem3.js; docs/FINDINGS.md 2026-10-19, 2026-10-22 (plankton re-based); Real lake ecology for calibration/copepod_daphnia_coexistence.md, small_zooplankton_and_microbial_loop.md -->

The invertebrates are energy pools (g wet m⁻²) on each bed cell. Worms and scuds eat the organic layer (capacity 15 g/m²), and from late
June a fifth of the fauna of soft, oxic mud rises at dusk over 12 days as the hatch of the mayfly *Hexagenia*. Weed fauna, in two sizes
at ~30 mg wet per g of plant dry mass, produce 0.10 and 0.04 a day at 20 °C and emerge on degree-days from ice-out. Snails are capped by
soft water (calcium unmeasured at Hot Brook). Surface insects are emergers plus land insects falling from forested banks (~50 mg dry
mass per metre of bank a day at the July–August peak). Virile crayfish, adults and the year's young, are held at capacities by shelter
that the package sets at a fifth of Michigan-based values (rocky shallows 5 g/m²) for the soft water (project estimate). Eastern elliptio
mussels reach 15/m² on firm margins and 40 in sheltered coves, recruit at 0.25 a year × (1 − N/K) × the availability of host fish, and
each clears 0.8 L/h at 20 °C, between laboratory (0.05–0.19) and field (2.6–3.1 L/h) values and the dominant uncertainty. In the brook,
outlet filter feeders strain Upper's outflow up to 1.5 g wet m⁻² d⁻¹, and its riffles hold three times a lake bed's invertebrates.
<!-- src: src/w3/littoral3.js LIT3 (HEX…, CR_*, MU_*); src/w3/fish3.js stageR5 (LIT3 CR_ROCK 5 …); src/w3/chem3.js CHEM3 (BROOK_FILTER, BROOK_CAP, BROOK_BENTH); src/config.js BENTHOS; docs/HOT_BROOK_3D.md §5 (stages 7b–7d); Whole lake 3D fish simulation/littoral_invertebrates.md, brook_food_web.md; Hot Brook populations and water/invertebrates_plankton_plants.md -->

Twenty-one plant species are simulated per bed cell in five growth forms: emergents (e.g. pickerelweed, bulrush), floating-leaved
(e.g. the two water-lilies, watershield), a submerged canopy (three pondweeds and bladderworts), isoetid rosettes (e.g. pipewort, water
lobelia) and a low meadow of *Nitella* and mosses. Only *Nitella flexilis* and *N. tenuissima* are on record from these lakes (Upper,
2015); project field photographs show plants consistent with bulrush, ribbon-leaved pondweed and riffle moss (identified by growth
form only); the rest are near-certain regional flora.
Shoots and stores (g dry m⁻²) grow by a Monod function
of the mean light over the canopy (PCLake's integral), temperature (Q₁₀ 2.5), P and N, with each form's losses set to just balance growth
at its light limit over a season, so depth limits emerge from clarity; the rooted canopy's limit is 21 % of surface light at its bed
(Chambers & Kalff 1985). Substrate sets the room to grow, waves remove plants by fetch, ice scours the bed above 0.75–1.25 m, and
floating and emergent forms need shelter. Runs start from beds grown five years from bare seeding. Plants give fish cover (only within
the canopy's height), spawning structure, a zooplankton refuge and O₂; bladderworts eat zooplankton. Their N and P are in the budgets.
<!-- src: src/w3/plants3.js FORMS3, PL3; docs/HOT_BROOK_3D.md §5 (stages 7a, 7f, 7g, 7h, E12b); docs/review/ECOSYSTEM_BUILD.md E12a; Whole lake 3D fish simulation/macrophytes.md, macrophyte_area_cover.md; Hot Brook populations and water/plant_species_hot_brook.md -->

**Table 4.2.** The model's main components and processes.

| Component | State | Main processes | Update | Module |
|---|---|---|---|---|
| Weather, catchment | sky state, air anomaly, snowpack, soil and stores | frontal chain fitted to Houlton daily data; OU air anomalies; HBV runoff | each water update | `env3.js` |
| Water | temperature, ice and snow, currents, water age | relaxation to calendar + anomaly; wind and convective mixing; Stefan ice; gyres, drift, diffusion, siphon, through-flow | 1,752 s in runs | `env3.js` |
| Chemistry | O₂, NH₄, NO₃, PO₄, DOM, bed P, organic layer | gas exchange; N cycle; bed P capture, burial, release; closed ledger | each update; slow pools every 3rd | `chem3.js` |
| Plankton | 4 algal groups; Daphnia, small cladocerans, copepods, rotifers, eggs, microbial food | light- and nutrient-limited growth; Holling II grazing; sinking; dormancy | each / every 3rd update | `chem3.js` |
| Plants | 21 species × shoots and stores per bed cell | growth by light at the bed; storage; waves, ice, grazing | every 3rd update | `plants3.js` |
| Invertebrates | worms and scuds, weed fauna, snails, surface insects, crayfish, mussels | eating organic matter and periphyton; emergence; filtering; recruitment | every 3rd update | `littoral3.js`, `chem3.js` |
| Fish | ~300,000 agents; young-of-year schools | brains, drives, feeding, FB4 energetics, reproduction, predation, hazards | 0.1 s; 60-s or 1,752-s blocks | `fish3.js`, GPU kernels |
| Fish-eaters | 9 bird and mammal kinds, snapping turtles, bullfrogs, anglers, bears | Holling II take within size, depth, light and ice windows | each fish step | `fish3.js` (WILD3) |
| Herps, forest, camps | turtles, frogs, newts, tadpoles; bears, deer, moose; 58 camps | rations from the pools; movement on land; N and P loads, shade, wood | each water update (herps every 3rd) | `herps3.js`, `forest3.js`, `campfx3.js` |

<!-- src: src/w3/env3.js step(); chem3.js (SLOW 3); plants3.js (PL3.SLOW 3); littoral3.js step(); herps3.js (HERP3.SLOW 3); fish3.js; forest3.js; campfx3.js; docs/HOT_BROOK_3D.md §3–5; docs/review/ECOSYSTEM_BUILD.md -->

### 4.5 The fish

Only fish recorded in the lakes are simulated: MDIFW's list plus redbreast sunfish from angler observations (project field notes).
Golden shiner (no record), largemouth bass (probably mislabelled smallmouth) and American eel (probable, never recorded) are left out,
and the sea-run alewife, listed for Lower on MDIFW's 2024 chart, enters as a seasonal visitor (Table 4.3). No census has been taken in
either lake, so each density is a reasoned estimate inside the range measured in similar northern lakes; yellow perch were lowered from
500 to 75/ha after angler observations found them scarce at any size. The package's census sums to ~945 fish ≥ 7.5 cm per hectare
(~0.6 million; project arithmetic), plus ~150,000 banded killifish and ~1,000 blacknose dace, and its runs start at ~79 kg/ha.
<!-- src: docs/FISH_CENSUS.md §1–2; src/w3/species3.js header; src/w3/fish3.js S3 (perHa, found), stageR5 (S3.perch.perHa 75); docs/FINDINGS.md 2026-10-23 "Arm AM"; Hot Brook populations and water/species_numbers_northern_lakes.md, small_fish_numbers.md -->

**Table 4.3.** The fish simulated: census (fish ≥ 7.5 cm per hectare, as in the package), representation, bioenergetics parameter set
(Fish Bioenergetics 4.0, FB4; Deslauriers et al. 2017) and spawning.

| Species | Census /ha | Agents | FB4 parameter set | Spawning ground; temperature (°C) |
|---|---|---|---|---|
| White perch *Morone americana* | 450 | schools of ~80; individuals above the budget's length cutoff (recomputed every 10 days; ~20 cm in the design) | yellow perch (Kitchell et al. 1977), stand-in | flats at 0.3–1.5 m; 14–20 |
| Yellow perch *Perca flavescens* | 75 (was 500) | as white perch | yellow perch (Kitchell et al. 1977) | rigid structure at 0.5–2 m; 7–12 |
| Pumpkinseed *Lepomis gibbosus* | 50 | individuals from 7 cm; young in groups of 25 | bluegill (Kitchell et al. 1974), adult respiration × 0.7 (Roberts 1964) | colonies at 0.15–1.7 m; 17–26 |
| Redbreast sunfish *L. auritus* | 50 | as pumpkinseed | bluegill, adult respiration × 0.7 | nests at 0.25–0.6 m; 19–26 |
| Brown bullhead *Ameiurus nebulosus* | 100 | individuals from 10 cm; young in groups of 25 | Hartman et al. 2017; below 30 g largemouth bass (Rice et al. 1983) | 0.3–1.5 m, guarded; 18–24 |
| White sucker *Catostomus commersonii* | 70 | individuals | yellow perch, stand-in | brook riffles; 10–15 |
| Smallmouth bass *Micropterus dolomieu* | 40 | individuals | Whitledge et al. 2003; below 250 g largemouth bass (Rice et al. 1983) | nests at 0.5–1.5 m within ~20 m of last year's; 15–21 |
| Chain pickerel *Esox niger* | 25 | individuals | northern pike (Bevelhimer et al. 1985); below 10 g that set adjusted for larvae (§5.8) | vegetation mats at 0.3–1 m; 6–11 |
| Fallfish *Semotilus corporalis* | 85 | individuals from 12 cm; young in groups of 20 | dace (He 1986; Trudel & Boisclair 1994); adults with pikeminnow consumption (Petersen & Ward 1999) | gravel mounds in the brook (lake shoals when full); 15–20 |
| Banded killifish *Fundulus diaphanus* | 233 (from 4 cm) | shoals of 40 | fathead minnow (Duffy 1998), stand-in | on plants at 0.1–0.5 m; 19–26 |
| Blacknose dace *Rhinichthys atratulus* | 0.8 per m² of brook | individuals | dace (He 1986; Trudel & Boisclair 1994) | riffle gravel in the brook; 19–23 |
| Sea-run alewife *Alosa pseudoharengus* | run of 15 adults per acre (project estimate) | schools of 10–300 | alewife (Stewart & Binkowski 1986) | shallows at 0.15–1 m, at night; 10.5–21 |

<!-- src: src/w3/species3.js NEW3; src/species.js BIO (src fields, spawnT); src/w3/fish3.js S3, SPAWN3, stageR5 (SP.catfish.spawnT [18,24], juvW 30; S3.killifish.spawn.bot; SP.sunfish/redbreast bio.RA ×0.7; SP.pike.bioJuv; S3.bass.sp.juvW 250); docs/FISH_CENSUS.md §2–3; src/config.js ALEWIFE -->

Each hectare of lake has a budget of 470 agents (about 300,000 on the true lakes). Solitary species are individuals; yellow and white
perch move in schools of ~80, each agent carrying n fish with one genome and body record, and a school whose fish pass the budget's
length cutoff breaks into individuals that go on schooling by choice. The super-individual rules follow Scheffer et al. (1995) and Parry
& Evans (2008): losses take a fraction of n, a strike takes one fish, crowding comes from Σ n × mass rather than agent counts, and a
merged school keeps one parent's genome. Each agent's brain is a recurrent network, 26 → 10 → 6, with leaky hidden units. Its inputs are
the bearings of the nearest food, threat and schoolmates, the fish's depth and place over the bed and shore, light, temperature, O₂,
energy, hunger, fear and home; its outputs are turn, pitch, thrust, strike, flee and hide. The genome holds 346 weights and seven trait
genes (maturation size, speed, tolerance, fins, eyes, body, brain size). Innate drives from the habitat synthesis (the bottom depth
sought by day, night and under ice, preferred temperature, escape from low O₂, schooling, home range) propose a heading and depth, and
the brain bends them (weight 0.6). Learning is Baldwinian: only a plastic copy of the 60 hidden-to-output weights changes in life,
reinforced when the fish eats, and it is never inherited; a young school's genome is a mutated crossover of its parents'.
<!-- src: docs/FISH_CENSUS.md §3; src/w3/fish3.js header, F3 (AGENTS_HA, SOLO_COHERE, BRAIN_TURN, BRAIN_BEND), IN3, OUT3, HID3, genomeLen3, plastic3, forward3, reinforce3; docs/HOT_BROOK_3D.md §4 "Super-individual rules", "Built (stage 5, slice a)"; Whole lake 3D fish simulation/super_individuals.md, habitat3d.md §9 -->

Fish cruise at 0.4–1.2 body lengths a second (field values) and sprint at 7–19 (3-s bursts on the DFO fatigue curves; Katopodis &
Gervais 2016). Home ranges of the lake species at true scale are radii from 45 m (pumpkinseed) to 700 m
(smallmouth), most from the literature; yellow perch's, white perch's, fallfish's and killifish's (300, 400, 300 and 60 m) are
project estimates. The brook is part of every range, 0.5–6 % of each species settles in the other lake each year (from
connected-lake marking studies), and a fish short of O₂ swims across the lake toward better water. Adults split their foraging time among their foods in proportion to f⁴, f being each
food's own functional response (after Werner et al. 1983 and Wu & Culver 1992): zooplankton (type III, half-saturation 60 µg dry/L),
the bed's worms and scuds, weed fauna, snails and crayfish within gape, the organic layer (bullheads, suckers), surface insects and fish.
An adult feeds over a footprint of a quarter of its home range (40–200 m), and in a coarse block its time within reach of the bed comes
from heights gamma-distributed about its mean. Smallmouth bass and chain pickerel are braked by a hunger gate: hunting and foraging are
multiplied by 1 − gut/G, with G = pGate·Cmax·W/k the gut content that empties at pGate of maximum consumption (k is gastric evacuation;
pGate 0.35 for bass, 0.3 for pickerel), and a sated predator rests from all foraging until 90 % of its meal is digested.
<!-- src: src/w3/fish3.js S3 (cruise, sprint, home), F3 (MIGRATE_V, SHARE_Q, K_ZOO, K_BENTH, FP_*, BED_SHARE, REST_DIGEST, REST_TO, REST_ALL), _gate, _gateG, _o2Better, stageR5 (MOVE3 settle, HUNGER_GATE, pGate); docs/TRUE_SCALE.md T3; docs/HOT_BROOK_3D.md §4 "Built (stage 6a)", "Item 6"; docs/FINDINGS.md 2026-10-20 "A hunger gate must scale with the fish's own appetite" -->

Energetics follow Fish Bioenergetics 4.0 (Deslauriers et al. 2017) with each species' set (Table 4.3), but because sets fitted in
warm water overstate winter costs two- to five-fold, empirical cold rules take over in cold water for bass, young bullheads and
pickerel (after Chipps et al. 2000), and energy density falls with condition. Mature fish put half their
surplus into gonads (0.8 for batch spawners), and nest guards pay staged costs. Fish die of starvation (logistic in condition, 50 % a
day at K 0.55), heat and hypoxia beyond their lethal limits, old age, and an "other" mortality for unsimulated causes — half the
species' natural mortality, cut by the share wildlife and anglers now take.
<!-- src: src/bioenergetics.js (coldResp, coldCmax, energyOf); src/config.js BIOE (K_S50, K_S99, ED_K, REPRO_ALLOC, K_RESORB, M_OTHER); src/w3/fish3.js stageR5 (mOther, reproA, MOTHER_FLAT); docs/GPU_SIM.md G3 "diagnosis", "fixes"; Predator winter energetics/predator_winter_energetics.md -->

A ripe fish heads for its spawning ground as the water nears its spawning temperature (Table 4.3); the pairing species meet on
traditional grounds whose number scales with lake area. Eggs become a clutch on the bed and develop by degree-days on the bed's
temperature from published incubation equations — for example 686.99·e^(−0.1402T) hours for white perch (Margulies 1989). Clutches lose
eggs to temperatures outside the species' window, low O₂, storms and egg predators, and a guard deserts if the water cools to 10.6 °C
(a smallmouth also if it falls 2 °C below its laying temperature). Hatch fractions are field survivals where these are known, not laboratory hatch or fertilisation rates
(white sucker 0.05, white perch 0.45 on a lake bed); yolk-sac survival is 0.2 for perch and white perch, 0.33 in successful bass nests
and an unsourced prior of 0.95 for the rest, and yolk-sac larvae are already prey.
<!-- src: src/config.js EGG3; src/w3/fish3.js eggRate3, yolkRate3, SPAWN3, SITES_MUL, stageR5 (EGG3.ON, PROLARVA); docs/review/ECOSYSTEM_BUILD.md E3; docs/FINDINGS.md 2026-10-22 "A fertilisation rate entered as a hatch rate", "Y4"; Whole lake 3D fish simulation/egg_stage.md; Real lake ecology for calibration/egg_survival_and_larval_production.md -->

The young of the year are brainless super-individual schools. Larvae feed on a prey ladder set by gape and by count, from rotifers and
nauplii to Daphnia, and within a school intakes spread lognormally (CV 0.25), so the share below maintenance starves while the rest
grow. Background mortality is 0.02 a day for 1-cm larvae
(as in predator-free enclosures), falling with length, and 0.015 for juveniles, rising with density, both slower in the cold.
Cyclopoids take the smallest larvae. Fish clear larvae at a visual planktivore's rate, 3.42 × 10⁻⁷ L^2.94 m³/s (Sørnes & Aksnes 2004),
× 0.15 for the zooplankton about. Followed piscivores meet the juveniles through the same encounter volume, school terms and capture
rule as followed prey (below), and schools of young piscivores clear 400·L(mm)^0.6 L a day within a size window peaking at prey 0.19 of
their length (Persson et al. 2004; Persson & Brönmark 2002). The first winter follows the form of Shuter et al. (1980) in days below
10 °C, as applied to Spednic Lake (Dudley & Trial 2014): a 208-day winter kills every young smallmouth under 48 mm and none over 92 mm,
with other species' thresholds scaled to their own (none for fallfish, killifish or dace, for lack of data) and white perch on Johnson &
Evans's (1990) measured model; the young stop feeding below 4 °C. Schools recruit to followed fish only in spring as overwintered
schools (age 1), once the water passes ~10 °C. A cap of 1.5 times the census remains as a safety net, its discards tallied.
<!-- src: src/config.js FRY (M_LARVA3, M_JUV3, M_JUV_Q10, CYC, LARV2, LARV_CMAX, LARV_RHO, CLEAR_A, CLEAR_B, WIN_R, FEED_CV_R5), WINTER0, ZOO3 (ladder); src/w3/fish3.js F3 (CAP, RECRUIT_SPRING, RECRUIT_WARM, YW_T0, YENC, YWIN_CS, YSCHOOL, WIN_JE), yZoo, feedShares; docs/HOT_BROOK_3D.md §4 "Built (stage Y1)", "Item 1 built"; Real lake ecology for calibration/first_winter_mortality.md, fish_predation_on_larvae.md, larval_mortality.md -->

Predation on followed fish is an encounter–strike–capture rule. Encounters arise at E = π·RD²·(u + v)·N from prey within 6 m, the
reaction distance RD (pickerel 1.0–1.2 m and smallmouth 0.8–1.0 m to 6-cm prey) scaled by prey size through R²e^(cR) ∝ prey area
(Aksnes & Utne 1997; c = 1.7 m⁻¹ in the stained water) and by light. Strikes follow S = E/(1 + E/a_max) during a diel hunting rhythm,
a_max being 3 an hour for pickerel, 12 for smallmouth and 4 for perch-like predators. Capture success depends on prey and predator —
an esocid lands 0.7 of strikes on soft-rayed prey, 0.12 on sunfish and 0.1 on bullheads (after Wahl & Stein 1988) — times a size
term that falls linearly with the prey's length relative to the predator's (to nil at 0.88 for soft-rayed and 0.6 for spiny-rayed
prey), renormalised to 1 at the ratio the successes were measured at (0.3–0.4 of the predator's length; 0.12 for a bass on spiny
prey) and capped at 0.9; the prey must also fit the predator's gape. Cover cuts attacks, counted once (after Savino & Stein 1982). An esocid meets a school as n^0.65 fish
at undiminished success (Turesson & Brönmark 2004), whereas a school confuses a bass (× n^−0.6) and cuts a perch-like predator's success
to 0.15. No predator strikes over water shallower than 0.01 m per cm of its length (full effect from twice that); small fish hide in the
brook's riffles and bullheads in winter mud. A school of piscivores hunts as its n fish and shares each kill, so prey mass is conserved.
<!-- src: src/w3/fish3.js F3 (STRIKE2, ENC_R, RD_SIZE, RD_C, SIZE_K (the pre-STRIKE2 rule only), SIZE_RENORM, CS_MAX; csOf, PPR0, PPRM, canPrey, COVER_ONCE, EH_AMAX, BASS_SCH, SHALLOW_K, RIFFLE_*, BURY_H, SCOLD), PRED3, CS3, stageR5; docs/review/REALISM_PLAN.md R1; docs/FINDINGS.md 2026-10-21 "Compensations stack", 2026-10-22 "A school of piscivores fed every fish on one kill"; Real lake ecology for calibration/piscivore_encounter_attack.md -->

### 4.6 Wildlife, anglers, the forest and the camps

Nine fish-eating bird and mammal populations are set at densities from the Maine and regional literature, several of them inferred
for these lakes (project estimates), each with a calendar and a daily need —
for example common loons at 2 per 150 ha from ice-out to November (1.1 kg a day an adult, chicks from July), belted kingfishers at 1 per
0.8 km of shore, and great blue herons, ospreys, bald eagles, common and hooded mergansers, river otters and mink. Snapping turtles
(1/ha, 50 g a day, a fifth of it fish) and bullfrogs also take fish. Each takes its daily need from fish within its windows of prey length, depth, bed depth, light and ice, by
a per-fish hazard ρ = D/(A + K) — Holling type II with K a day's need and A the larger of the reachable biomass and its one-day running
mean. Anglers enter the same way, killing ~1.9 kg of fish a day on the true lakes in open water (May–November, kept fish plus hooking
deaths) and ~1.1 kg through the ice (January–March), from ~5,500 angler-hours a year scaled from regional surveys (project estimate);
smallmouth are released by law. Black bears fish spawning suckers in the brook during the run (600 g per hour of fishing; project
estimate).
<!-- src: src/w3/fish3.js WILD3, F3 (WILD, WILD_TAU), stageR5 (mOther); src/config.js FOREST3.bear.FISH; docs/review/ECOSYSTEM_BUILD.md E4–E6; docs/FINDINGS.md 2026-10-21 "The lakes' birds and mammals take ~6 % of the fish"; Maine lake shores and catchment/shore_birds_and_mammals.md, turtles_and_frogs.md; Hot Brook populations and water/angling_effort_and_harvest.md -->

Painted turtles, green and mink frogs, red-spotted newts and tadpoles draw rations from the plants, weed fauna, snails, crayfish and
surface insects. Bears (0.4/km²), deer (1.5/km²) and moose (0.6/km²) are individuals walking home ranges over the true world's 9.3 km²
of land through their seasons; deer crop the water's edge and lake-using moose graze the shallows in summer, carrying the plants' N and P
ashore. The alewife run is 15 adults per acre (project estimate for a colonising run, ~23,600 adults), varying lognormally (CV 0.5). The
adults arrive at Lower's outlet between 10 and 20 °C, spawn at night, stay a median of 17 days and half die in the lakes; their young
emigrate from mid-July in pulses after rain, rising flow or cooling, and never recruit; the run's import and export of N and P pass
through the ledger.
<!-- src: src/config.js HERP3, FOREST3, ALEWIFE; src/w3/herps3.js; src/w3/forest3.js; src/w3/plants3.js PL3 (MOOSE_N, MOOSE_KG); docs/HOT_BROOK_3D.md §5 "Built (E14)"; docs/review/ECOSYSTEM_BUILD.md E6, E8; Maine lake shores and catchment/forest_mammals_bears_deer_moose.md; Hot Brook populations and water/sea_run_alewife.md -->

The 58 lived-in shoreline camps (36 on Upper, 22 on Lower, 6 year-round), 54 docks, ~1.4 km of gravel road within 76 m of the water and a
boat launch act through mechanisms with published values. Septic systems deliver 0.1 kg of P per 90 days of occupancy (NH DES
2019) after a groundwater travel time; lots yield 0.15 kg of available P a year (Maine's Phosphorus Control Action Plan coefficient after Dennis et al. 1992, read as available P; about 0.3 kg as total P); and roads 9.0 kg per hectare a year, 21.6 % available (Dudley et al. 1997), with storms scaling the
loads. In front of camps fallen wood is cut to 0.15 of an undeveloped shore's (a project estimate between Christensen
et al. 1996's 0.1 and Merrell, Howe & Warren 2009's 0.38) and leaf fall to 0.43 (Merrell, Howe & Warren 2009);
docks pass 10 % of the light beneath them from 25 May to 15 October (Garrison et al. 2005); and swim areas at half the camps are
cleared to a tenth of their plants each June (project estimate). Together the loads come to ~0.28 kg of available P per camp a year.
<!-- src: src/config.js CAMP3; src/w3/campfx3.js; src/w3/camps3.js; docs/HOT_BROOK_3D.md §5 "Built (E15)"; Maine lake shores and catchment/shoreline_development_effects.md -->

### 4.7 The engines and their speed

The CPU code (`fish3.js` with the water modules) is the model's definition: it runs the gate, the 1/10 world and the fine steps near a
viewer. On the true lakes it can split the fish into two shards (Upper with the brook; Lower), each reading and writing only its own
water in shared memory, with crossing fish handed over as plain data and each shard on its own random stream, so sharded runs are
deterministic. A WebGPU engine (`src/w3/gpu/`) is a second implementation of the same model, built for speed, with its constants
generated from the CPU configuration. Each agent has 102 fields plus its genome and brain state, and a block runs ten kernels (neighbour
grid, senses, brain, drives and relocation, feeding, predation, body, death, births and the young, schools). Counter-based random numbers
keyed by seed, agent, block and purpose, 64-bit fixed-point atomic sums and index-sorted grid cells make its results independent of
thread order. The water stays on the CPU, running while the GPU works, and the fish's takes come back as differences.
<!-- src: docs/TRUE_SCALE.md T3 part 2, T5; docs/GPU_SIM.md "The architecture", "The kernels of a coarse block", "G1 — the design as built", "G3 — in use"; src/w3/shard3.js, envshare3.js, shardpool3.js; src/w3/gpu/layout.js, wgsl.js, gpufish.js -->

Float32 arithmetic and parallel sums rule out bit-identity, so the GPU engine is validated statistically, within the CPU's spread across
seeds. On the 1/10 lakes (three seeds × 30 days) every species' adult survival agreed within 0.01 except blacknose dace (0.891 against
1.081), a gap traced to food sharing and the merging of young schools and then largely closed. On the true lakes (seed 611, against the CPU's
two-shard run) biomass was 102 against 102.3 kg/ha at day 28, with every species' adults within 0.003 at day 14 and the young within
~4 %. Known differences remain — proportional food sharing on the GPU against first come, first served on the CPU; more merging of
young schools on the GPU (46,900 schools against the CPU's 61,300 at day 42, the fish in them alike); the brook's dace diverging by
day 98 (211 left on the CPU, in a run of slightly older code, against 50 on the GPU) — and the docks' shade as fish cover is CPU-only (and off in the
package).
<!-- src: docs/GPU_SIM.md "G2 — first validation", "G2 — THE TRUE LAKES", "G3 — the whole year on the GPU"; docs/HOT_BROOK_3D.md §5 "Built (E15)" (CAMP3.FISH) -->

**Table 4.4.** Cost of the true-scale lakes (~300,000 agents) on an NVIDIA GeForce RTX 3060 and an AMD Ryzen 5 5600G (6 cores).

| Engine | One 29-min block | A simulated year |
|---|---|---|
| CPU, one thread | 4.8–4.9 s (11.6–18 µs an agent through the year) | — |
| CPU, two shards | 2.4–3.2 s | ~12–16 h |
| GPU, side-by-side parity run | 74 ms (~40× the two shards) | ~22 min |
| GPU, later builds and runs | ~45–97 ms | 14–30 min (block time) |

<!-- src: docs/GPU_SIM.md "Where we are", "G2 — THE TRUE LAKES" (73.9 ms vs ~3.1 s), "G3 — in use", "G3 — the whole year"; docs/TRUE_SCALE.md T3 part 3, T5; SESSION_STATE.md 2026-10-19 (year_cdp ~45 ms a block, ~14 min a year), 2026-10-21 (97 ms a block) -->

### 4.8 Testing and experimental protocol

`npm test` runs the 2-D model's suites and the 3-D model's gate (`test/w3.mjs`), which at its last full run (23 October 2026) passed 145
checks, failed none and reported one known gap. The gate requires the N and P inventories to close against the ledger to a
relative error below 10⁻⁵ in summer, in a storm and under ice, also with the camps, moose, deer and herps on. For determinism, the same
seed must give the same fish after 30 blocks, sharded runs must repeat exactly, GPU state handed back to the CPU must live on
identically, and the camps must draw nothing from the simulation's random stream; refactors are proven bit-identical outside the gate by
a fingerprint of every fish and young school (`tools/w3_fingerprint.mjs`). The 3-D model has no save and resume yet, so the
exact-resume test (load, then 600 steps byte-identical) covers only the 2-D model. Field-range checks require, for example, ice-out between year fractions 0.13 and 0.20 (counted from 1 March: about 17 April to 13 May), summer bottom
water in the north basin ≥ 4 mg/L O₂, a lake-wide winter O₂ minimum ≥ 3 mg/L as the median of three seeds (single seeds are fragile),
phosphorus retention in the published range for the grid used, founders at their census ±10 % and 60–150 kg/ha, and a summer pickerel
killing 0.1–2 fish a day with 30–70 % of stomachs empty. A known miss of a field bound is reported as a "gap" rather than a failure; the
one open gap is plant presence on 84–88 % of the lakes' bed, against 35–45 %. Cost checks guard speed.
<!-- src: test/w3.mjs (header check/gap; sections true, env, chem, core, young, forage, foodweb, plants, gpu, strike, wild, substrate, hex, small, alewife, eggs, forest, camps; budget checks; determinism ~line 433); SESSION_STATE.md 2026-10-23 (cf70977: w3 145/0/1 GAP); tools/w3_fingerprint.mjs; CLAUDE.md "Run, gate, verify", "Exact resume" -->

The results in section 5 come from three kinds of run. The GPU year runner (`tools/gpu/year.html`, driven by `tools/gpu/year_cdp.mjs`)
runs the true lakes from 20 May in 1,752-s blocks, seed after seed, and reports every 14 days each species' numbers against the start,
biomass, feeding level p, condition, diet, young, spawnings, recruits and deaths by cause (starvation, heat, hypoxia, other, old age,
eaten, stranded, wildlife), with who ate whom at the end. Arms are named configurations (A to AM) of the package plus overrides in the
page's URL, each run from a frozen snapshot of the code, mostly on one to three of seeds 611–613. Probes are short Node scripts on the
CPU reference, mostly on the 1/10 lakes, that isolate one mechanism (for example the under-ice O₂ budget, the burial fit or the weather
fit); a CPU season runner in two shards (`tools/w3_season.mjs`) prints lines that compare with the GPU's. The project's rule is to judge
a change on an A/B of at least three seeds and to audit survival at each life stage, not adult counts alone.
<!-- src: tools/gpu/year.js (header, ?r5=1, overrides f3./s3./cfg., causes), tools/gpu/year_cdp.mjs; tools/w3_season.mjs; docs/FINDINGS.md (arm and probe "Where" lines); docs/GPU_SIM.md "G3 — in use"; CLAUDE.md "Balance" -->


## 5. What building and testing the model taught

The findings below come from the project's running log (`docs/FINDINGS.md`), where each is dated and points to the probe, the
runs (seeds) and the full write-up; the dates and codes in parentheses (e.g. 2026-10-22, E9e) name its entries. Model artifacts are reported as findings: what a whole-lake model gets wrong, and why, is as
useful to the next modeller as what it gets right. Unless stated otherwise, "true scale" runs are the GPU year runner on the
real-size lakes, and "1/10" runs are the CPU reference on the lakes at a tenth of their width (true depths), which crowds the
littoral zone ten-fold.

### 5.1 Where the model stands

The model does not yet sustain its fish community. In the most recent two-year runs (arm AM, seeds 611 and 613, true scale) the
whole-lake fish biomass fell from 79 kg/ha to 43 and 56 kg/ha after one year and to 24 and 38 kg/ha after two. Recruitment
broadened (over the two years, per seed: brown bullhead ~166,000 recruits, yellow perch
112,000–139,000, fallfish ~98,000, redbreast sunfish 37,000–49,000, smallmouth bass 7,700–36,000), but white perch recruit almost
none (115–123) and fall to 1.5–3.0 kg/ha. The founding white perch stock is eaten in its first summer — 57 % in 112 days, an
instantaneous mortality of ~2.7 per year against ~0.4–0.7 for a stable white perch stock's adults — mainly by smallmouth bass,
chain pickerel and fallfish (by a probe on the 1/10 lakes). The bass need ~15 kg/ha of fish a year and find white perch the most
numerous prey. In a real lake that demand is met by each year's young growing into the predators' size window; without recruitment
the predators eat the standing stock down. In the same runs the summer crustacean zooplankton (84–116 µg/L) stayed inside the 50–150 µg/L given for mesotrophic lakes (30–150 in §3.3's synthesis for these lakes), and the phosphorus inventory ended each year at 112–126 % of the start (`docs/FINDINGS.md`, 2026-10-23, arm AM).

For scale, the only whole-lake fish counts from Maine — rotenone and SCUBA counts of three small lakes (Rupp & DeRoche 1965) —
give 44.5, 70.1 and 117.1 kg/ha of all species. Earlier versions of the model grew to 140–165 kg/ha in their first year, its white
perch alone (55–63 kg/ha) exceeding the lowest of those lakes' totals (`docs/FINDINGS.md`, 2026-10-19).

The rest of this section is how the model got here: the errors found, the mechanisms that turned out to matter, and the field
values that would settle what remains open.

### 5.2 A parameter is only as good as what it measured

Several of the largest errors were not wrong numbers but right numbers that measured something else.

- **"Hatch" rates.** The white sucker's egg hatch of 0.9 was a fertilisation rate (Stewart's "> 90 % fertilised"). Field survival
  from egg to drifting larva in a brook is 0.3–3 % (scour, silt, drift), and only 25–50 % of adult suckers spawn in a given year;
  the model made ~30 sucker larvae per m² against the field's < 1. White perch's 0.8 was a laboratory hatch; unguarded demersal eggs
  on a lake bed are estimated at 0.3–0.6. The sea-run alewife's eggs hatched at 0.6 where the best the research reports is 38 %, in
  the laboratory near 17.8 °C (Edsall 1970, abstract only). The yolk-sac stage had an unsourced survival of 0.95 and no predators, where the field
  hatch-to-first-feeding survival of perch is 0.12–0.73. "Check what each 'hatch' number in a parameter table measures
  (fertilisation, lab hatch, field survival) — they differ 10–100×" (`docs/FINDINGS.md`, 2026-10-22, E3b).
- **A table read the wrong way round.** The alewife's respiration in Stewart & Binkowski's parameter set has swimming speed rising
  as 5.78·e^(0.149T) up to 22.08 cm/s at 9 °C, then holding. The research note had put the two terms on opposite sides of the
  threshold temperature from the Fish Bioenergetics 4.0 convention the model implements. Read literally, alewives would swim ~1 m/s
  at 20 °C and respire above their maximum intake. Continuity caught it: the two forms meet at the threshold
  (5.78·e^(0.149·9) ≈ 22.1) only one way round (2026-10-22, E8).
- **A formula's complement.** The bed's phosphorus burial had been calibrated so the lakes kept 0.66–0.72 of their P load, citing
  the Larsen–Mercier retention R = 1/(1+√τ). The formula is R = 1/(1+√ρ), with ρ the flushing rate (1/τ); 1/(1+√τ) is
  Vollenweider's ratio of lake to inflow concentration — the share that leaves. For these lakes (water residence 0.27 and 0.15 years,
  mean depths 3.0 and 2.55 m) four of the published retention models (§3.2) give 0.28–0.54 (Larsen–Mercier 0.34 / 0.28, Kirchner–Dillon
  0.54 / 0.49, Nürnberg 0.52 / 0.43, Brett–Benjamin 0.38 / 0.32), not 0.7. The bed's exchange also proved grid-dependent: the same
  setting buried 0.70 of the load on a 100-m grid, whose bed-touching cells hold 32 % of the water, and 0.42–0.56 on 50-m grids
  (21 %) — calibrate on the grid the runs use (2026-10-22).
- **A borrowed curve's convention.** A rule that slowed strikes in cold water used the Fish Bioenergetics consumption-temperature
  function as a 0–1 appetite. Equations 2 and 3 of that framework are ~1 at their optimum; Equation 4 — the northern pike set the
  chain pickerel run on — peaks at ~8.3, so at 2 °C it read 1.0 and pickerel struck all winter at their full cold performance (field pike take
  a meal about every 25 days in winter; Diana 1979a). At 2 °C the relative appetite is 0.12 (2026-10-21).
- **Units hidden in a scaled variable.** The algae's phosphorus half-saturation, 0.10 model units, was ≈ 10 µg/L of dissolved P
  (one unit ≈ 100 µg/L at the lakes' reference total P), against the field's ~1 µg/L, holding the algae at 8–22 % of their
  P-saturated growth all June (2026-10-22).
- **A nutrient's chemical form.** The model's inflow carried ~three-quarters of its dissolved inorganic nitrogen as ammonium
  (~400 µg/L); a forested north-eastern stream's is mostly nitrate, with ammonium ~5–20 µg/L. Nitrifying ammonium costs 4.6 g O₂
  per g N, and under the ice nitrification consumed a third of the lakes' oxygen budget (Table 5.1), killing a third of the fish
  biomass in late winter. With 5 % of the same nitrogen as ammonium, the lakes' lowest winter mean O₂ rose from 1.1–3.0 to
  2.8–4.7 mg/L across three seeds' fishless winters (2026-10-22). The same is true of phosphorus: a forested stream's total P matched the
  model's inflow (field ~13 µg/L, 8–20; model ~14), but its forms did not — the field has phosphate ~2 µg/L, dissolved organic P ~6
  (about a quarter available to algae) and particulate P ~5 (about a fifth available once settled), where the model's inflow was
  94 % phosphate, ~3× the algae-available P. Fed only the literature's available fractions, the 1/10 lakes in a fishless year turned
  ultra-oligotrophic (summer TP 3.9 µg/L by October and 2.3 by the next May; Daphnia ~1 µg/L, low for a fishless year). One of three things must hold, and only a Hot Brook
  measurement can say which: the catchment exports more (wetlands 0.10–0.20 kg P/ha/yr against forest's 0.02–0.04), the bed's
  internal loading is larger, or these lakes' available fractions are higher. The model keeps an all-available inflow as a
  documented calibration to the coloured, mesotrophic analogue lakes (TP 9–13 µg/L, chlorophyll 3–8) (2026-10-22, E9e), a target richer
than the range of the Maine DEP analogue data (TP 8–12 µg/L, chlorophyll 2.5–4; §2.4).

**Table 5.1.** The lakes' oxygen budget under the ice with the ammonium-rich inflow (January–February, g O₂ m⁻² d⁻¹; probe
o2budget, `docs/FINDINGS.md` 2026-10-22).

| Process | g O₂ m⁻² d⁻¹ |
|---|---|
| The bed's demand | −0.255 |
| Nitrification | −0.152 |
| Bacteria on dissolved organic matter | −0.043 |
| Algae | −0.031 |
| Plants | +0.014 |
| Sum of the terms listed | −0.47 (the project log reports a total of −0.45; field under-ice demand 0.2–0.39) |

### 5.3 Compensations stack

In a model built a piece at a time, a parameter moved to fix a symptom is a debt: when the missing mechanism arrives, the old
fix stays and multiplies with it. A four-part audit of every parameter against its source (predation; habitat and the young;
physiology; the food web), classifying each as field value, compensation, stacked compensation or prior, found the pattern
throughout (`docs/review/audit_*.md`; `docs/FINDINGS.md` 2026-10-21):

- the pickerel killed ~0.06 fish a day against the 0.4–0.8 expected from pike rations (§3.7), and smallmouth bass lived on crayfish, under a product of
  brakes each added for an old symptom — the bass's strike ceiling cut from 12 to 2.5 an hour; a "time hunting" share of 10–20 %
  set before a hunger gate existed; cover counted in the encounter and again in the capture; prey size counted twice; an unsourced
  half-saturation (30 encounters an hour against a ceiling of 3) with which a starving pickerel ignored ~90 % of the prey it met;
- the young's mortality had been halved to keep the old recruit counts, after which they ate the zooplankton out (400–600 µg/L
  in late May, 1–6 µg/L from September to May); the bed's food had been raised 4× for a two-dimensional slice with no shallows;
  consumers' respiration had been cut (×0.7) where their food was missing (the audit's reading of the stack; the sunfishes' own
  ×0.7 on their borrowed bluegill set, which rests on measured routine metabolism, Roberts 1964, is kept — §4); and a census cap was regulating the white perch.

Undoing each compensation to its research value and letting the mechanism the research named do the work — cover counted once,
the size term renormalised, the handling rate equal to the strike ceiling, the bass's laboratory ceiling, a diel activity rhythm,
and a hunger gate with a post-meal rest (no fish hunted until ~90 % of a satiating meal is digested) as the only brake — gave a
June pickerel 0.37 kills a day at a consumption ratio p of 0.40 with 34 % empty stomachs, against the pike-scaled targets (§3.7) of 0.4–0.8 kills, p
0.39–0.42 and 35–60 % empty. The same pattern appeared at the larvae: the fish's predation on larvae had been fitted down
(a "larva-picking" factor from 0.3 to 0.1) when the panfish took 41 % of the suckers' hatch, which later disabled the main larval
mortality process once a realistic egg stage existed (2026-10-22, E3/E2c). A background mortality that stands in for unsimulated
predators must shrink as those predators are simulated (2026-10-19, stage Y1).

### 5.4 Two representations of one fish

The model follows adult fish as individuals (or as schools of up to 80 identical fish) and the year's young as super-individual
schools until they recruit. Every place the two representations met produced an error that looked like ecology.

- **The recruits fed the predators.** In a true-scale year, bass eating bass was the year's largest predator–prey pair (282,870
  kills; 97 % of the bass eaten were under 10 cm), where field stomachs hold almost no young bass (Maine 0 of 36, Wisconsin 0 of
  303). As a school, a young-of-year was hunted by a density rule calibrated to field young-of-year mortality (~1 % a day); on
  recruiting at 6 cm in July–August it met the adults' encounter rule (~15 % a day) — and 386,000 young bass and 350,000 young perch
  recruited, nearly all to be eaten within days. Recruiting only in the spring of age 1, as fisheries count it, removed it (2026-10-20).
- **The young were 1,700× harder to find.** A followed piscivore met young-of-year schools through a daily clearance of ~15 m³ (a
  45-cm pickerel) but followed fish through an in-bout encounter volume of ~27,000 m³ a day, and caught the young by a cannibal's
  size window peaking at prey 19 % of its length. A 40-cm pickerel weighed a 2.5-cm young pumpkinseed at 0.001 as a school member
  but 0.21 as a followed fish. Field piscivores eat prey of a median 10–20 % of their length, and their smallest prey barely rise
  with their size (Gaeta et al. 2018). One encounter volume, one capture success and a visual reaction distance for every prey
  (R²·e^(cR) ∝ L²; Aksnes & Utne 1997) raised the pickerel's and bass's take of the young 2.1–3.1× while their kills of followed fish
  hardly moved. Only the complete rule, including how a school is met (as n^0.65 fish by an esocid; confusing a bass by n^−0.6;
  cutting a perch-like predator's capture to 0.15), put the young's mortality in the field's range (young perch 0.009–0.034 a day
  against Oneida Lake's ~0.035; young bass 0.045–0.09, inside DeAngelis et al.'s curve) (2026-10-21).
- **One kill fed a school.** When a school of piscivores struck, both engines added the whole prey's mass to each of its n fish's
  guts while the prey lost one fish: fish mass from nothing, and prey deaths to schooling piscivores up to n-fold too few. It was
  found because a CPU–GPU agreement check showed white perch eating 0.59 kg on one engine against 0.04 on the other in one block
  (2026-10-22, R7).
- **Points do not overlap; densities do.** Young-on-young predation needed one school within 0.6 m of another, so young pickerel
  allowed to eat fish from 5 cm recruited only 4 % more (2026-10-18). Replacing "a predator eats from the nearest school within
  0.6 m" with clearance of the water's density (Holling type II, gut-limited; 400·L^0.6 L/d, Persson et al. 2004) raised the
  followed fish's take of young fish ~24× in the first fortnight on the 1/10 lakes (2026-10-19).
- **A cap that binds is a missing mechanism.** A recruitment cap (recruits ≤ 1.5× the census) silently discarded ~700,000 of
  1.1 million young bass in one year and ~91 % of each year's recruiting white perch: it had become the white perch's only
  regulator (2026-10-18, 2026-10-19).

### 5.5 The base of the food web

- **Zero-order growth gave the zooplankton a free lunch.** The algae's growth term inherited from the two-dimensional model had no
  factor of the algae's own biomass. Grazed to almost nothing (0.013 units), they still grew 381 units against 425 ungrazed, and
  Daphnia held 900–1,500 µg/L all summer in lakes whose crustacean zooplankton is ~50–150 µg/L in the field (Daphnia alone near 1 in the analogues; §3.3). The zooplankton's production (0.34–0.67 g dry mass
  m⁻² d⁻¹) exceeded the algae's own, which is impossible. The bug hid in plain sight because the oxygen budget computed
  photosynthesis per capita while biomass did not; a check of production against an independent measure of the same process caught
  it, where checks of standing stocks had not. With per-capita growth, fish-free Daphnia showed the seasonal succession the
  Plankton Ecology Group model describes (Sommer et al. 2012): a ~340 µg/L peak in mid-May and a clear-water crash (2026-10-19).
- **Copepods need a trade-off.** Given a higher food threshold and lower growth than Daphnia, copepods lost at every food level.
  Real copepods persist through low losses — fish rarely catch them and the adults overwinter on lipid — not a lower threshold.
  With the synthesis's values (threshold ~1.06× Daphnia's, growth ~0.45×, lower losses, ~30 % autumn dormancy) the fish-free year
  showed a clear-water peak and crash, an autumn Daphnia rebound and a copepod-dominated winter at 10–15 µg/L (field 10–20)
  (2026-10-19).
- **A loss rule left on one group.** After the cladocerans' clearance was set to the field's ~1 mL µg⁻¹ d⁻¹, the edible algae still
  fell ~180× between mid-May and mid-June. A per-capita budget showed Daphnia were not the cause: a settling rule written when
  green algae were the model's only algae still drained the greens alone (0.33 m/day, on top of a die-off already described as
  "sinking and lysis"), the too-high phosphorus half-saturation (§5.2) slowed them, and the copepods had become the main grazer. The
  ungrazed, unsettled resistant algae rose to ~95 % of the summer algae against a field median of 58 %. "When a group is added beside
  an old one, every loss rule written for 'the algae' has to be re-read for which arrays it touches" (2026-10-22).
- **The re-based plankton** — each algal kind sinking at its own speed (greens 0.1, diatoms 0.5, resistant 0.1 m/day), a die-off
  without sinking (0.08/day), the field P half-saturation (1 µg/L), copepods clearing 0.4 mL µg⁻¹ d⁻¹, and the zooplankton growing
  from what they eat (Holling II with the field's clearance and maximum ingestion) — brought each measure inside or near its field
  range (Table 5.2).

**Table 5.2.** The plankton before and after the re-base (Z1 → Z1b + Z2; `docs/FINDINGS.md` 2026-10-22).

| Quantity | Before | After | Field |
|---|---|---|---|
| Edible algae's dip through the Daphnia peak | ~180× | 2.6–3.5× (4.4× at the late-summer low) | 1.5–3×, rarely 5–10× |
| Rotifers at the Daphnia peak | 10–30 L⁻¹ | 370–480 L⁻¹ | ≥ 100–250 L⁻¹ |
| Crustacean zooplankton, summer | up to ~1,100 µg/L | 100–180 µg/L | 50–150 µg/L |
| Grazing-resistant share of algae, late summer | 90–98 % | 47 % | median 58 % (IQR 28–85 %) |
| Summer dissolved P | 2.5 µg/L | ≲ 0.5 µg/L | ≲ 0.5 µg/L |

  Secchi depth was 3.3–3.5 m and the bed received 20–40 % of production (field 20–50 %). Still open: summer total P ~5–6 µg/L
  against the model's reference of 12 (the analogue lakes read 8–13; §2.4), Daphnia declining after their peak at ~0.06 a day (field 0.1–0.2), and copepods ~2× the
  ~20–30 µg/L of the nearest LakePulse lakes (other regional sets give 46–121 µg/L; §3.3).

### 5.6 Habitat: the plants, the waves and the starting state

- **A uniform start hid the beds' equilibrium.** Seeding every plant species at 15 % of its stand in every cell of its range gave a
  first summer with plants on 96–100 % of the bed, every species declining from June — and every earlier year run had opened on it.
  The model now starts from its own beds after five years (2026-10-18). That unrealistic "lawn" had also propped up the young
  pickerel: on the generated beds the same year recruited 247 and 344 young pickerel (seeds 611, 612) against 2,183 and 2,657 on the
  lawn, because in June, when the young are 2–4 cm, real beds are still growing. "A calibration done on an unrealistic habitat
  transfers its error to the animals tuned on it — check the habitat first."
- **A depth limit measured at the bed must be applied at the bed.** Growth by the light at a canopy's top let a large-leaf stand
  rooted at 3.5 m pay for its whole canopy near the surface; with two other model artifacts and an inferred light limit, the second
  summer's stands covered 51 % of the bed against the research's ~15–17 % and reached 3.4 m against 2.0–3.0 m in coloured water. With the rooted canopy limited by 21 % of surface light at its bed (Chambers &
  Kalff 1985), self-shading across all species in a cell, and each species' room set by the substrate, the second summer fell to
  29 % and later years to 22–24 % with the canopy edge at 2.0–2.3 m (2026-10-22, E12b). The patchiness of real beds within their
  depth range (presence on 35–45 % of the bed, the model's 84–88 %) needs a mechanism the model lacks — clonal spread — for which no
  rate has yet been researched.
- **A maintenance floor borrowed from canopy-plant models (0.022/day) made the slow evergreen forms unviable**: rosette species with
  maximum growth 0.005–0.008/day and Nitella died out over 3–5 years. No measurement of isoetid dark respiration was found — a
  literature gap. And calibrating a plant's losses to break even on the day its light limit is reached leaves the deep edge
  shrinking every year: a pondweed keeping 30 % of its mass over winter must out-grow its losses ~3× in a season (2026-10-18).
- **The waves' fetch sets the shallow edge.** Each column's effective fetch, through a 10 m/s storm's wave depth (the US Army Corps
  of Engineers' Coastal Engineering Manual), gives a plant-free shallow edge of 0.7–1.2 m in these lakes, matching in depth the 0.75–1.25-m
  minimum depth of submerged plants in 25 north-eastern lakes (Duarte & Kalff 1990) — which those authors found unrelated to
  exposure and attributed to ice scour, and which the model now also applies as the ice's reach (§4.4) — and a cobble shore bare of
  rooted plants to ~0.6 m in a project field photograph (2026-10-18).
- **Cover is by stand, not by mean stem density**: mean stems understate patchy cover, and structure protects only the fish in the
  stands (2026-10-18).
- **The camps' phosphorus is small; their docks' shade is not.** The model's 58 lived-in camps (54 docks; §2.10) send an estimated
  ~0.28 kg of available P a camp a year (an earlier project estimate, §3.2, gave ~0.4 kg) (septic ~0.08 at a seasonal camp and more at the six year-round homes, lot ~0.15 by Maine's
  Phosphorus Control Action Plan coefficient, road ~0.01). Upper's camps' load, ~1.7 % of the lake's external load, would raise its
  steady-state total P by ~0.14 µg/L (a one-box mass balance). On the 1/10 lakes the plants under docks fell to 0.40–0.45× the bed
  beside them in the first summer and 0.17–0.18× in the second, on their way to the 0.05× measured under long-standing piers
  (Garrison et al. 2005) — with no tuning: 10 % of the light alone puts a shallow pondweed below its compensation point. Docks cover
  < 0.01 % of the lakes' bed (2026-10-23, E15).

### 5.7 Predators: what sets how much they eat

- **Growth pins the feeding level.** On the model's own Fish Bioenergetics smallmouth set over the Maine calendar, a 26-cm bass
  grows 4.4 cm in a year at a season-long p of 0.3, 9.5 at 0.4, 14.5 at 0.5 and 22 at 0.65; Maine's ~4 cm a year at ages 3–5 (MDIFW)
  pins p ≈ 0.3, and the pickerel's 6 cm a year at ~32 cm pins p ≈ 0.37. Because growth is steep in p (Δp 0.1 ≈ 2× a year's growth),
  field length-at-age is a sharper, more independent target for a predation rule than diets or stomach counts (2026-10-20).
- **A full gut is the wrong satiation signal.** Through five experimental arms, every refuge added for the prey moved where prey
  died, not how many: bass rose from 9.4 to ~23 kg/ha a year each time, at p 0.46–0.67 in summer and ~0.9 in autumn, with
  field-like stomachs. A littoral bass meets prey far faster than its half-saturation, so the only brake was the gut's capacity
  (8 % of body weight), and any gut above ~2.5 % empties at the full maximum-consumption rate. Real bass hold ~0.4 % of body weight
  in the stomach, use a third to a half of their gut and rest after a meal. A hunger gate (hunting in proportion to
  h = 1 − gut/(G0·W)) at G0 = 1 % held bass at 7.4 kg/ha with p 0.20 in summer and 0.44–0.51 in autumn — the fall-heavy pattern
  that fits Maine growth. The fixed gate then had to scale with each fish's own appetite (G = pGate·Cmax·W/k, k the gastric
  evacuation rate): a fixed 1 % capped a 15-cm bass below its maintenance (2026-10-20).
- **Fed predators grow to giants.** With the stacked brakes undone, the pickerel fed at field summer rations (p 0.37–0.41) and the
  bass at p 0.55–0.65 all year, yet they grew to a mean 66 cm at 8+ for bass (Maine smallmouth L∞ ~50 cm) and 60 cm by age 5 for
  pickerel (Maine ~43 cm at age 5), while the prey fell. A sated bass,
  barred only from hunting fish, grazed crayfish, insects and the bed between meals; and the hunger gate's level, which length at
  age sets, had been chosen when encounters, not appetite, limited the predators (2026-10-21).
- **What they eat matters, not only how much.** With realistic zooplankton the community collapsed to perch, white perch and suckers
  while the predators lived on crayfish (bass 65–77 % of the summer diet, pickerel 27–43 %); in Maine white-perch lakes in summer,
  adult pickerel ate 55 % white perch, ≈ 95 % fish and 0.5 % crayfish by volume, and smallmouth 61 % white perch, 80 % fish and 14 %
  crayfish (Cooper 1941). The project's earlier crayfish targets had come from non-Maine lakes; Cooper notes crayfish were
  "generally rare in Maine" (2026-10-19, 2026-10-20).
- **Who meets whom is a product of factors.** The lakes' commonest fish (yellow and white perch, ~780,000 ≥ 7.5 cm in the census of the time) lost < 1 % a
  year to predators while bullhead fell to 0.66× and killifish to 0.31× in a year; a perch's risk to a pickerel was ~1/60 of a killifish's — encounter
  ×4.7, gape ×2, size selection ×3, spines ×1.7, school size ×1.4. "Check the product against field diets, not each factor." The
  size rule was the largest single error: capture success falls roughly linearly with relative prey size in the field, where the
  model's (1 − depth/gape)² made a 10–13-cm perch 4–8× less catchable than a 6-cm killifish (2026-10-19).
- **Winter is where predator meets prey.** Putting the young perch in the shallow weeds at first ice (as in shallow "dishpan"
  lakes, 1.2–2.4 m) took the perch lost to predators from ~19,000 to ~72,000 a year, ~20 % a year against the project's estimate of 15–35 % (§3.7): a
  habitat assigned for one season can hide a whole predator–prey link for the other three. And the bullhead's winter in the mud
  (cover below 9 °C) cut the pickerel's kills of them from ~51,000 to ~31,000 a year (2026-10-19).
- **Apparent competition emerges.** With perch within reach, the pickerel grew (3.4 → 5.2–5.5 kg/ha, inside the project's 2–6 band; Maine's two counts are 4.1 and 8.4, §3.5) and their other
  prey fell further (killifish 0.30 → 0.13×): a food-limited predator kills each prey in proportion to meeting it, so a new abundant
  prey feeds more predators rather than sparing the rare ones (Holt 1977) (2026-10-19).
- **A predator's rate from a snapshot of its prey over-harvests.** The fish-eating birds and mammals took fish at a per-fish hazard
  D/(A + K), with A the prey biomass within reach read at the start of each time block; a block beginning with few fish near the
  surface set the rate high for every fish that rose into reach, and over a late-July fortnight the birds took 128 % of their need.
  Using the larger of A and its one-day running mean — the reach as a forager learns it — gave 92 % (2026-10-22).
- **The wildlife's share.** The nine fish-eating bird and mammal populations at Maine densities took ~2.9 t of fish a year from the
  lakes' ~48 t (~6 %): loons 1,061 kg, common mergansers 437, mink 388, herons 289, kingfishers 240, ospreys 213, eagles 166, otter 63,
  hooded mergansers 46. The adults' unsimulated "other" mortality had been defined to include birds and mammals and was cut per
  species by the share the wildlife now take — the banded killifish's wildlife losses were 2.6× its whole old allowance (2026-10-21).

### 5.8 Energetics outside the fitted range

- **Bioenergetics sets fitted at summer temperatures overstate winter needs 2–5×** (a largemouth set standing in for young bass
  spent 3.6× its mass over a 208-day winter; the smallmouth set's respiration at 4 °C was 64 mg O₂ kg⁻¹ h⁻¹ against the field's
  20–35; the pike set 2–4×, Chipps et al. 2000). With empirical cold rules, winter starvation disappeared. A constant energy density
  turns a lipid-dominated winter loss into 1.5–2× too much mass loss; energy density must vary with condition. Nest guarding at
  published peak costs combined with low feeding killed 14 % of adult bass in late June; staged guarding (eggs, then fry) killed none
  (2026-10-18).
- **The young grew under the ice.** Followed by identity through a winter, young yellow perch, white perch, suckers and fallfish
  grew ~2 cm, mostly at 1–2 °C under the ice, because the consumption curves leave a few percent of maximum intake at those
  temperatures and a young fish's maintenance is smaller still. Field young perch stop growing below ~10–13.5 °C and live on their
  autumn lipid, so first-winter mortality is size-selective (Post & Evans 1989; Johnson & Evans 1990, 1991) — the main regulator of
  perch and white perch recruitment in northern lakes, which never bit in the model (2026-10-20).
- **An adult set cannot grow a larva.** Young chain pickerel, running on the adult northern pike set (Bevelhimer et al. 1985;
  consumption mass exponent −0.18), stayed at 0.9 cm for six weeks after hatching and reached 4.4 cm by late September, against the
  field's 25–38 mm at the end of June and 100–130 mm at the end of September (Underhill 1949 via Scott & Crossman; MDIFW 102–127 mm).
  The set was fitted on 9–53-g pike: its respiration's temperature slope (Q10 1.73) is shallower than a larva's (2.5; Woynárovich
  1960) and its consumption ceiling is 1.2–2.6× short below ~0.1–0.3 g. Below 10 g, with Cmax ∝ W^−0.24 (Wieser et al. 1992),
  respiration Q10 2.5 and the framework's juvenile esocid losses, an unfitted 1.25-cm larva at full ration grows 0.23–0.98 mm/day
  from 10 to 24 °C, against measured 0.25–1.21 (Górny 1992; Fey & Greszkiewicz 2021). Fitted sets extrapolated four orders of
  magnitude in mass can fail silently, and the failure surfaces years later as a missing species read as predation or habitat
  (2026-10-21).
- **Coarse time-steps underfeed bottom feeders.** A time block places a fish at its habitat's mean height, so ~10 % of bass were
  within reach of the bed against ~51 % over fine steps; a time-within-reach share restored crayfish intake to ~90 % of the fine
  model's (2026-10-18).

### 5.9 The first summer

- **Larval excess.** A realistic egg stage put first-feeding larvae at field hatch rates and exposed a larval background mortality
  fitted before the egg stage existed: the 1/10 lakes held ~70 perch and ~110 white perch larvae per m² against field peaks of
  0.3–15 m⁻² (exceptional 64–125). In lakes with fish, larvae die at 0.05–0.3 a day, 70–90 % of it to fish; predator-free
  enclosures give 0.01–0.05 (2026-10-22).
- **The adult census set the larvae.** The census had yellow perch at 500/ha ≥ 7.5 cm, above its own soft-water comparables (230–240
  per ha); angler observations (project field notes) find perch "scarce at any size", an estimated ~50–100/ha. At 75/ha, perch larvae at
  their peak fell from 48 to 2–6 per m² (2026-10-22).
- **Fish eat larvae at the rate they clear zooplankton.** The field's clearance of larvae is about a visual planktivore's clearance of
  zooplankton, 3.42×10⁻⁷·L(cm)^2.94 m³/s, × 0.08–0.3 with natural zooplankton about, and small larvae are as catchable as large ones;
  the model's rule had been 3–60× too small per predator. Rebuilt, fish predation on larvae rose ~5×, yet predators were swamped:
  ~200 larvae per m² of all species meet a 15-cm perch ~270 times a day, ~2 g — its whole maximum consumption (2026-10-22, L2).
- **Count-based feeding needs a size limit.** Larval feeding thresholds are counts (100–250 prey per litre), so a µg of rotifers is
  worth ~12× a µg of crustaceans to a first-feeder; applied at every size, it let 8–15-mm fry strip the rotifers to 0.07 µg/L
  (2026-10-22).
- **The young's slow growth was crowding, not food or the feeding curve.** Young white perch grew 0.2–0.35 mm/day in July (field
  0.67–0.8) while the water held 150–250 µg/L of crustaceans, at or above Maine's median. Lowering their half-saturation from 60 to the
  field's 25, or even 5, changed nothing: the per-step crop of the catchable plankton in a school's patch bound in 35–84 % of the
  calls. Too many schools shared each patch. Lake-mean zooplankton can look plentiful while the young starve (2026-10-22). Thinning
  the cohort at the yolk-sac stage (survival 0.2, inside the field's 0.12–0.73 for perch) brought growth near the field's on the
  1/10 lakes — white perch 37 mm at 9,000/ha on 1 September against 26 mm at 15,900/ha before (field 40–55 mm; Table 5.3) — "by thinning the
  cohort, not by feeding it more" (2026-10-22, Y4); on the true lakes (arm AM) the young white perch still stalled at 1.5–1.6 cm in
  their first year (2026-10-23).
- **A cohort below maintenance shares its food equally, so it neither grows nor dies**; field larvae grow or die within days. Unequal
  shares among a school's members are needed (2026-10-22); they were then built and are in the package (lognormal, CV 0.25; §4.5).

**Table 5.3.** The white perch's first year in the 1/10 lakes against the field, before the yolk-sac thinning (Y4) (per hectare;
`docs/FINDINGS.md` 2026-10-22).

| Stage | Model | Field |
|---|---|---|
| Mature adults | 318 | — |
| Eggs laid | 4.2 million (~13,000 per mature fish) | fecundity 20,000–150,000 per female in landlocked stocks (Maine 20,000–300,000; §3.5) |
| Eggs → swim-up | 18 % (777,000) | ~6–48 % (inferred) |
| Swim-up → 20 mm | 8 % | 0.02–0.15 |
| End of August | ~19,000 | ~100–700 (Oneida Lake); ~3,000 (Lake Erie) |

Each stage's survival in the table lay inside the field's range, at its generous end; together they left far too many young. Larval
mortality ran 0.055–0.09 a day against the field's ~0.1–0.2, fish took only ~0.03–0.05 a day of it, and the crowded larvae took ~65 days to pass the larval stage instead of 30–45.

### 5.10 Weather: the sequence, not the totals

The two-dimensional model's four-state sky (clear, cloudy, rain, storm) had plausible shares but cycled every ~27 days: a 10-day
wet spell, then a 20-day dry one (the longest 201 days), months without rain beside 270-mm months, and no day over 22 mm. On the
catchment model this gave a median daily flow of 0.16× the mean, and in the second year the lakes starved of water and phosphorus:
over 252 days the inflow brought 3,163 units of P while the bed buried 9,862. Houlton's daily record (NOAA GHCN-Daily, 1991–2020) has
39 % wet days, P(wet | wet) 0.50, wet and dry spells of 2.0 and 3.1 days, 6.9 days a year ≥ 25 mm and a monthly coefficient of
variation of 0.44. A front cycle with per-episode gamma intensities reproduced it (40 %, 0.52, 2.1 / 3.1 days, 6.5–6.8 days,
CV 0.49–0.51; Table 4.1 gives the final fit over 60 years × 2 seeds), and storms had to bring warm air: Houlton's winter wet days run 4–5 °C above the month's mean, and with independent air
anomalies only ~15 % of December's precipitation fell above 0 °C (field ~50 %). Refitting the HBV catchment model within its
usual ranges then brought the hydrograph close to the gauges' (runoff 582–592 mm), with misfits remaining in several months, among
them April, August and December (Table 4.1). A "summer too wet" diagnosed earlier as missing canopy
interception was the same artifact. For a small lake's flushing and nutrient supply, the weather's sequence matters as much as its
monthly totals: calibrate a weather generator on daily statistics, not means (2026-10-22, E9d; 2026-10-21, E9b).

Real weather also exposed an ice bug: the cover had melted when the water's seasonal target crossed a threshold, so a +4 °C January
thaw lifted the whole lake's ice in a day. With the ice's thickness modelled (Stefan's growth, snow, slush to white ice) the cover
goes only once it has melted through; a lake opened on 1 March starts under ~71 cm of ice and snow passing ~0.25 % of the light
(Maine measurements 1–12 %; the model had assumed 40 %, and its under-ice oxygen had depended on photosynthesis through that bright
ice — two errors cancelling) (2026-10-21, 2026-10-19).

### 5.11 The engine

A WebGPU engine (counter-based random numbers, 64-bit fixed-point atomic tallies) reproduces the CPU reference statistically — every
species within the seeds' spread in the first checks, with the remaining differences listed in §4.7 — at ~40× the speed of the CPU's
two shards: a true-scale year in ~14–30 minutes instead of ~15–20 hours (Table 4.4). Building it as an independent re-implementation
found a bug in the CPU–GPU hand-over (mates resolved before their identities were set), and its
agreement check found the school-kill error of §5.4 (2026-10-18, 2026-10-22). The ecology also broke the engine: by a fourth winter
fish crowding into the deep basin's wintering cells (~1,400 agents a cell, from ~250–700) turned a per-cell insertion sort into
quadratic work that passed the operating system's two-second watchdog and reset the GPU — deterministically, years into a run, with a
symptom that read as hardware. An agent model's data structures carry assumptions about the ecology (that fish spread out) which the
emergent behaviour (aggregation at wintering sites, as real fish do) can violate (2026-10-21).

### 5.12 Diagnostics that catch what calibration does not

- **Aggregate calibration can hold while the food web is wrong in kind.** Five parallel reviews of a five-year run found total
  biomass (80–96 kg/ha), predator biomass and adult growth plausible, yet pickerel and bass met white perch — 55–61 % of their food in
  Maine — for ≤ 5.5 % and ~10 % of their kills, and pumpkinseed, killifish and dace went extinct while white perch rose and the
  census cap discarded 55–64 % of white perch and pumpkinseed recruits each spring. The diet matrix by predator and prey, kills by
  place and time of day, and the cap's discards are the diagnostics that catch it (2026-10-20).
- **A year is not a test of self-sustainment.** Every calibration had been judged on one year; the first three-year runs collapsed in
  years 2–3 (2026-10-19).
- **Counts and biomass tell different stories.** By biomass the bass held through a year (1.02×) while their count fell to 0.63×
  (2026-10-18).
- **Habitat overlap must be measured in the world the predation runs in.** At true scale the killifish, given the whole shelf by day,
  were over water ≥ 0.6 m, the pickerel's, ~3/4 of the daytime; at 1/10 scale, where the shelf is 10× steeper, the same test could not separate
  predator from prey at all (2026-10-19).
- **A connecting brook is not a closed population.** The lakes' predators passing through took ~900 of the brook's ~1,400 blacknose
  dace a year (the census of the time); the field's brook dace are likely part of a stream population above and below the lakes that a two-lake model leaves
  out (2026-10-19).


---

[← Synthesis II: fish, early life, predation, wildlife and forest](03_synthesis_fish_to_forest.md) · [Contents](README.md#contents) · [Discussion, data availability and the use of AI →](05_discussion.md)
