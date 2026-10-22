# Review: environment and wildlife coverage of the 3-D Hot Brook sim (2026-10-20)

The human asked us to "make sure we have all aspects of the environment and the animals covered in this simulation", behaving "as it really would in the environment". This review covers everything **except the 11 fish species' own behaviour** (other reviewers cover that):
- the water, weather and climate;
- the chemistry;
- plankton, plants and invertebrates;
- the other vertebrates;
- the fish at the system level;
- people;
- the land and shore.

**What it was checked against.**
- The repo's research: `docs/research_notes/` (all folders) and the three reports in `docs/reports/`.
- The human's observations: memory notes `hot-brook-field-observations`, `land-water-realism` and `w3-backlog-requests`.
- The code: `src/w3/env3.js`, `chem3.js`, `plants3.js`, `littoral3.js`, `fish3.js`, `src/config.js`, and the 2-D `src/world.js`.
- The latest GPU run (`r8O_613.txt`, arm O, seed 613, 2 years of 5, true-size lakes).

**Status:**
- **OK**: present and behaving within the research.
- **PARTIAL**: present, but missing a key part or only an aggregate stand-in.
- **OFF**: present but measurably wrong.
- **MISSING**: absent.

**Priority:**
- **P1**: changes what the fish community does, or is a known flaw the calibration leans on.
- **P2**: realism the human asked for, or a moderate effect on fish.
- **P3**: completeness, what-ifs and the view.

**Effort:**
- **S**: about a day, plus a probe.
- **M**: 2–5 days, including gate checks and a 3-seed run.
- **L**: 1–3 weeks; touches the geometry, the GPU engine or saves.

Every effort estimate includes the GPU port when the item affects fish. The CPU stays the reference.

---

## Summary: what matters most

1. **The water's year is the same every year.** There is no hydrograph, no water level, no dry year and no warm or cool year.
   - Flow is a constant (`env3` `qIn`/`qOut` from the 100- and 55-day residence times).
   - Levels and the brook's depth are fixed geometry.
   - The seasonal temperature curve repeats exactly; only the order of weather spells varies between years.
   - Real Hot Brook has an April freshet of about 3.3× mean flow and late-August flows of 0.2–0.3×. A dry year (the human's Aug 2025 photos) all but cuts the lakes apart.
   - Ice-out ranges Apr 12–May 2 between years.
   - Smallmouth year-classes depend on summer warmth (MDIFW bass plan).
2. **Winter is too bright, and the winter O₂ budget leans on that.**
   - Ice passes 40 % of light (`ICE.LIGHT_CUT` 0.6), with no snow and no ice thickness. Maine measurements are 1–12 % under snowy ice.
   - In r8O the under-ice surface algae (0.3–0.88) exceed summer's (0.02–0.3), and Upper's bottom water is supersaturated at 17 mg/L at ice-out in year 2.
   - The late-winter under-ice convection that the design describes (HOT_BROOK_3D.md §3 item 4) is not in the code.
3. **No birds, mammals, frogs or turtles exist in the 3-D lakes.** The 2-D sim has a loon, frogs and tadpoles, painted turtles and predatory dragonfly nymphs; the 3-D has none.
   - Every bird, mammal and angler is folded into one uniform hazard, `BIOE.M_OTHER` (0.5 of each species' M). It ignores depth, light and season.
   - So the very shallow strip that the stage-R killifish rules rely on is risk-free from above. Kingfisher pellets in Maritime lakes are 10.5–18.7 % killifish (White 1953).
   - The human has seen a common merganser brood, bald eagles, "lots of frogs", bullfrogs and turtles.
4. **The weather's spells are 2–4× too long, and wind is tied to cloud.**
   - Spells: clear about 13 days on average (maximum 57), rain about 4 days, storms about 3 days at 10 m/s.
   - There is no diel wind cycle.
5. **The zooplankton's seasonal shape is off.** This feeds the small species' problems.
   - June peaks reach 300–550 µg/L with 60–80 % Daphnia.
   - Late summer and autumn in Upper fall to 4–30 µg/L, and winter to 1–5.
   - Rotifers are about 0 in summer.
   - Targets: summer crustaceans about 30–80 µg/L, Daphnia ≤25 %, under-ice about 25 % of summer, rotifers about ¼–⅓ of crustaceans.
6. **Sea-run alewife are now confirmed** (MDIFW 2024 Lower chart), but stage A is designed, not built. Alewives reshape the zooplankton and feed the predators.
7. **The water is too dark.** Secchi is 2.9–3.4 m all year, against 3.5–4.5 m (mean about 3.9) in analogue lakes. The human says the water is clearer.
8. **Lake-to-lake settling is about 10× too high**: `MOVE3` 5–15 %/yr against a field 0.5–5 %. The system boundary is closed (no immigration, no emigration over the outlet), and the inflow and outlet streams are not habitat.
9. **There is no angling at all.** That includes bass catch-and-release hooking losses, the white perch 25/day bag, and pickerel and perch through the ice.
10. **Already good** (keep): bathymetry, the brook's form, the Maine calendar's mean, ice timing, wind circulation, siphon and fetch, summer O₂, closed N and P budgets, the 13-species plants, the weed fauna, surface and land insects, snails, crayfish (at the human's "not common" level under `stageR5`) and mussel filtering.

**Sequencing.**
- Items 1, 2, 4 and 7 move the water's baseline: winter O₂, plankton and the plants' depth limits. Do them before the next ≥3-seed × 5-year validation of stage R, or that validation must be redone.
- The bird and angling hazards should **replace** part of `M_OTHER`, not add to it.
- Alewife comes after stage R settles, as already planned.

---

## 1. Inventory

### 1.1 Physical

| Item | Real (Hot Brook / research) | In the sim (where, how) | Behaves? | Status | Pri |
|---|---|---|---|---|---|
| Upper's bathymetry | 360 ha (DEP GIS), 369 (lidar); max 5.49 m (18 ft); 1949 mean 3.35 m (soundings never reached the shore) | `true/hotbrook3d.js`: lidar outline, 1949 soundings, NAIP shelf to 1.3 m; 369 ha, mean 3.00, max 5.5 (gate) | yes | OK | – |
| Lower's bathymetry | 2024 MDIFW chart: 684 ac (277 ha), mean 8 ft (2.44 m), max 13 ft (3.96); the chart is the old soundings redrawn | 274 ha, mean 2.55 m, max 3.94 | mean about 4 % deep; within the data's own error | OK | P3 |
| The brook's form | 142–200 m (NHD / MDIFW / project 154), about 8 m wide, "rocky and hard bottomed", 1.1-m pool at Upper's mouth, riffles about 0.3 m, run about 0.5, falls 0.70 m | 154.6 m, its own 20-m columns, pool > 0.9 m, riffles < 0.5 (`env3` `buildColumns3`) | yes | OK | – |
| Through-flow and flushing | Watersheds Upper 65.8 km², Lower 77.2 (85 % of Lower's water comes through the brook); runoff about 646 mm/yr, giving Upper about 1.35 m³/s and residence about 100 d, Lower about 55 d. Monthly flow ×mean: Jan 0.6, Apr **3.3**, May 1.2–2.0, Jul 0.45, Aug **0.30**, Sep 0.35, Nov 1.1. Storms: 10–18 rises a year, ×2.2–2.6 over 1–2 d, recession ×0.81–0.88/d; drought 0.02× | `env3._statics`: constant `qIn` and `qOut` from `RES_UPPER_D` 100 and `RES_LOWER_D` 55; a potential-flow path, implicit upwind; water-age tracer | Annual mean right. Summer flushing about 3× too fast, April about 3× too slow, no storm pulses. HOT_BROOK_3D.md §7 says "April ~3.3×", but the code is constant | PARTIAL | **P1** |
| Water level by season and year | Natural NE lakes: ±15–25 cm about the summer pool; +0.3–0.5 m after the freshet; −10 to −30 cm in Aug–Sep; dry years a further −0.1 to −0.2 m. Outlet Q ∝ (h − h_sill)^1.5. **The human:** levels vary by season and year; in a dry year the brook was "almost out of the water" (photos 24 Aug 2025) | None: geometry and wet mask fixed | Cannot produce a dry year | MISSING | **P1** |
| The brook in drought | Riffles close below about 10–15 cm; fish leave as discharge falls; isolated pools reach 27–29 °C in the afternoon [inf] with dawn hypoxia; recolonisation in about 2 weeks; the lake subsidy stops | Riffles always about 0.3 m; fish can't enter water under about 0.19 m (`_hop`), so the brook is always passable. No current is felt by fish; the riffle refuge is a depth rule (`F3.RIFFLE_*`) | – | MISSING | **P1** |
| Outlet sill, dam, beaver | No dam recorded on either outlet. Outlet structure and beaver unknown. A 1949 fish-screen bill (enactment unconfirmed). The Danforth dam is off Hot Brook's route | An open outlet column, no sill | – | MISSING (sill) | P2 (with levels) |
| Ice timing | Ice-out mean about Apr 23 (East Grand 2015–26: Apr 12–May 2; West Grand SD 8.8 d); ice-on about Dec 1; about 145 days | Ice per column, shallows first, wind-exposed water later (`env3._heat`). r8O: ice-on about Dec 6, ice-out about Apr 19–May 3 | Mean dates right; no year-to-year spread except weather noise | OK | – |
| Ice thickness, snow, slush | Ice 31–75 cm (Stefan, about 900 FDD); 0–20 cm of snow on almost every LEA visit; slush and white ice form once snow load exceeds about 8 cm | None: cover is a 0–1 fraction | – | MISSING | **P1** |
| Under-ice light | 1–12 % of surface light (LEA 2026, Maine); about 30 % after rain or a thaw clears the snow; layered optics: black ice k 0.79, white 4.35, snow 8.96 m⁻¹ | `ICE.LIGHT_CUT` 0.6, i.e. **40 %** (`chem3` `lightAt`, `_sight`; `plants3`) | r8O: under-ice surface algae 0.3–0.88 vs summer 0.02–0.3; Upper bottom O₂ **17.0 mg/L** at ice-out in year 2; a known flaw (HOT_BROOK_3D.md "the under-ice light") | OFF | **P1** |
| Late-winter under-ice convection | After the snow goes, sunlight drives convection (w* 1–7 mm/s; mixing 0.5–3 m a day for 2–7 weeks) and re-oxygenates the column 2–4 weeks before ice-out | Described in HOT_BROOK_3D.md §3 item 4 but **not in the code**: under full ice `_mixVerticalAll` sets the mixed depth to 0, leaving only the slow `K_STRAT` exchange (a "compat" constant) | – | MISSING | **P1** (with snow) |
| Under-ice bed heat and down-slope current | Sediment heat 1–4.5 W/m²; currents of a few mm/s | `H3.BED_HEAT`, `ICE_SLOPE_V`, `_siphonAll` | yes | OK | – |
| Light | Day length, sun height, twilight, cloud; moonlight at night | `seasonalSun`, `_lux` (twilight decades, `NIGHT_LUX` 0.002 lx); cloud by weather state | Moon absent: every night is starlight | PARTIAL | P3 |
| Water colour and clarity | No measurement since 1949. Analogues: Secchi 3.5–4.5 m (mean about 3.9), colour 18–46 (typically 25–40 PCU), DOC 4–5 mg/L. **The human:** "a bit clearer" than the sim | `CHEM3.KD_COLOUR` 0.5/m, constant; Secchi = 2.55/Kd | r8O Secchi 2.93–3.38 m, nearly flat through the year. About 0.5–1 m too dark; colour does not rise with flow (spring and autumn, storms) | OFF | P2 |
| Water temperature, mean year | Maine calendar: 23.3 °C surface in Aug 1949; analogues 20–23 °C, mixed | `SEASON.TEMP_KNOTS` + weather (0 to −3 °C) + diel swing (`env3._heat`) | r8O peak 23.4–24 °C; summer bottom within 1–2 °C | OK | – |
| Warm and cool years, heat waves, warming | Ice-out Apr 12–May 2; heat waves (Moose Pond 29.4 °C, Jul 2024); allow 26–28 °C summers; +0.05 °C/yr since 1977; MDIFW: cool summers (1986/92/96) cut bass cohorts | None. The weather only cools (`TEMP_WEATHER` [0, −1, −2.5, −3]), so no day is warmer than the curve; `winterWindow` (`WINTER0`) is a constant computed once | – | MISSING | **P1** |
| Weather spells | Fronts every about 3–5 d; rain ≥ 2.5 mm on about 23 % of days (6–9 a month Apr–Nov), wet days about 7–11 mm; ≥ 25-mm days about 7/yr; 15–20 thunderstorms a summer (gusts 2–3× for 10–60 min) | 4-state Markov chain, `ENV.WEATHER_DWELL` × 1/TS. Computed mean spells: clear about 13 d (seen up to 57), cloudy about 5, rain about 4, storm about 3. "Rain" carries no water | Spells 2–4× too long; multi-day continuous storms (known: HOT_BROOK_3D.md "the weather's spells are too long") | OFF | **P1** |
| Wind | Caribou monthly mean 2.5 m/s (Aug) to 3.9 (Mar); afternoon ×1.4, night ×0.6; calm 17–19 % of summer hours; SW in summer, NW otherwise; post-frontal clear days are windy | `H3.WIND_MS` [2.5, 4, 6.5, 10] by weather state; direction ✓ (`_weather`) | Wind tied to cloud (clear is always 2.5 m/s); no diel cycle. The chain's time shares [mine]: clear 39 %, cloudy 30 %, rain 24 %, storm 7.5 %, so the mean wind is about 4.5 m/s against Caribou's 2.5–3.9, and rain or storm about 31 % of the time | PARTIAL | P2 (with weather) |
| Mixing, stratification, siphon | Unstratified (Wedderburn about 0.015); calm hot days stratify the north basin briefly; night siphon (about 1 cm/s); weed beds stratify | `THERMAL.MIX_M` × weather, night convection, `_siphonAll`, weed-canopy rules | r8O summer bottom O₂ 7.9–9.2 mg/L ✓ | OK | – |
| Waves and fetch | CEM fetch-limited waves; wave depth 0.7–1.2 m | `env3` `fetch`, `plants3` `zWave` | yes | OK | – |
| Summer O₂ | Analogues 86–102 % saturation, 7.6–8.9 mg/L to the bed | k600 (Vachon–Prairie) + night floor, Garcia–Gordon saturation, periphyton O₂ (`PERI_O2`), plants by day and night, sediment demand | yes | OK | – |
| Winter O₂ | No Hot Brook data. Maine winterkill is recorded only in 1–2-m weedy ponds; areal demand 0.2–0.39 g/m²/d, falling to 20–50 % by late winter; stream mouths stay oxygenated; LEA: 5 of 16 lakes had bottom water ≤ 2 mg/L on some visit | Sediment demand by Q10 (0.11–0.32 g/m²/d), no late-winter decline; inflow at saturation; fish seek O₂ (`_o2Better`) | r8O year 1 stays 7.7–14 mg/L; year 2's Upper bottom falls to 3.4 by late March. With snowy ice the fish-free lake mean falls to 2.7 (HOT_BROOK_3D.md), so the budget leans on bright ice | PARTIAL | **P1** (with snow) |
| Air temperature and heat budget | Houlton monthly air temperatures; about 900 FDD | None: water relaxes to the seasonal curve | Blocks ice thickness, heat waves and steam fog | MISSING | P2 (with year types) |
| Groundwater | 10–30 % of inflow at 6–8 °C, low O₂ [inf] | None | – | MISSING | P3 |
| Substrate | Shores "mostly rocky", some sand (Upper's NE beach), muddy beds; the dock shore is cobble, bare to 0.6 m; boulder and cobble about 60–75 % of shore [inf] | `PL3.MINERAL_Z` (wave-washed sand and gravel under 1.6 m, plus the brook) vs organic mud; no rock, cobble or boulder class | Crayfish shelter by depth only; no structure for bass (HOT_BROOK_3D.md "Still open: the bass's structure") | PARTIAL | P2 |
| Seiche, Langmuir cells | 19-min seiche, 3-cm set-up: negligible | Not simulated, by design | – | OK | – |

### 1.2 Chemistry

| Item | Real | In the sim | Behaves? | Status | Pri |
|---|---|---|---|---|---|
| N and P budgets | Closed; P retention ~0.3–0.55 (Larsen–Mercier 0.28–0.34, Kirchner–Dillon 0.49–0.54, Nürnberg 0.43–0.52; the old 0.66–0.72 was the formula's complement) | `chem3`: ledger; `BED_EXCH` 0.35, `BURY_MUL` 0.15, `REL_OXIC`; retention 0.64–0.75 (gate, 3-seed median) | yes | OK | – |
| External loads | Maine DEP coefficients (kg TP/ha/yr): forest 0.02–0.04, wetland 0.1–0.2, shoreline residential 0.25–2.7, camp roads 2.0, atmosphere 0.16 onto water; pine pollen about 37 mg P/m²/yr after ice-out; 50–80 % of P on 10–15 % of days (storms); snowmelt P mostly particulate | `CHEM3.IN_NUT` and friends: constant concentrations × constant discharge ("to be re-judged with the catchment's real loads (stage D)") | No seasons or storms; no land-use sources (camps, roads, the inlet's swamps) | PARTIAL | P2 (with the hydrograph) |
| Trophic state in field units | TP 9–12 µg/L, chl 3–5.5 µg/L (analogues); TSI about 37–42 | Abstract 2-D units; no µg/L readout of TP or chl | Can't be checked against field numbers | PARTIAL | P2 (S: diagnostics) |
| Bed P, organic layer, burial | – | `sedP`, `sedOM`, `benth`, oxic and redox release | yes | OK | – |
| Allochthonous organic matter | Leaves land mostly within about 10 m of shore (kernel λ 3–5 m [inf]); lake-wide about 0.02–1 (≤ about 10) g dry/m²/yr; leachate 17.8 g DOC per m of shoreline a year; in-stream litter 200–500 g/m²/yr | `CHEM3.ALLOCH` 800 g wet/m²/yr of bed: half spread evenly, half an October leaf pulse weighted by exp(−d/150 m real), by distance only (not forest vs camp vs wetland) | Plausible as the catchment's total particulate input, but the leaf half is spread over about 150 m where the research says about 10, and it is 10–100× the leaf research lake-wide. It feeds a `BENTHOS` whose production IPP rates "at or above the realistic upper bound" | PARTIAL | P2 |
| DOM ↔ colour | Kd ∝ DOC^0.45·TP^0.24; colour rises with flow; browning trend | DOM (labile, microbial) is unconnected to `KD_COLOUR` | – | MISSING (link) | P2 |
| pH, alkalinity, calcium | pH 6.6–7.0, alkalinity 5.5–8.4 mg/L, Ca 2–4 mg/L (analogues); Down East calcium depletion | Not state variables; Ca enters as inferred caps on snails and crayfish | Fine as context (RMR: "treat low Ca as context only") | OK by design | P3 |
| Cyanobacteria and toxins | Neither lake on DEP's bloom-risk list; *Gloeotrichia* < 5 colonies/L typical | `CYANO` field; its toxin kills zooplankton (`chem3` `TOX_ZOO`), not fish, in 3-D | Rare, as it should be | OK | P3 |
| Contaminants (Hg) | 0.25–1.42 µg/g Hg in analogue-lake fish | 2-D `TOX` only | – | MISSING | P3 (what-if; ROADMAP #5) |

### 1.3 Plankton

| Item | Real | In the sim | Behaves? (r8O_613) | Status | Pri |
|---|---|---|---|---|---|
| Algae groups and seasons | Spring diatom pulse after ice-out and an autumn pulse; greens; late-summer cyanobacteria in calm spells; winter chl about 40 % of summer | Greens, diatoms (cold optimum 7 °C) and cyanobacteria; per-capita growth (`PHYTO.PER_CAPITA`) | Summer swings 0.02–0.3; **winter 0.3–0.88, above summer** (the 40 % ice) | OFF in winter | **P1** (with snow) |
| Crustacean zooplankton, summer | About 30–80 µg DW/L (LakePulse median about 50 within 250 km; Gyllström about 35–75 at TP 8–20; ZOO's mesotrophic 50–150). Calanoids 35–50 %, cyclopoids 20–25 %, Daphnia ≤ 25 % (absent from about 30 % of lakes); *Holopedium* in soft water | `zooD` (Daphnia), `zooC` (copepods), `ZOO3` (copepod trade-off, dormancy, egg banks) | June peaks 392–550 (year 1) and 205–305 (year 2) µg/L, Daphnia 60–80 % of them; clear-water phase and July crash ✓. Aug–Oct in Upper 4–57; Lower 15–49 | OFF (shape) | **P1** |
| Zooplankton under ice | About 25 % of summer density; copepods dominate (*L. minutus* 35 %); the low point is at ice-melt | Dormancy and egg banks (`ZOO3`) | **1–5 µg/L** Dec–Feb; Upper rises to 14–44 by Mar–Apr on the bright-ice algae | OFF | **P1** |
| Rotifers and nauplii | About ¼–⅓ of crustacean biomass; 17–66 % of production; the first food of every larva | `zooR` (`PLANKTON` `G_R`, `K_R`, `M2_R`), designed to sit near 50 µg/L in summer | **0–9 µg/L Jun–Aug** in both years (30 in spring). Probably starving below their threshold on algae grazed to 0.02–0.09 units | OFF | **P1** (the late spawners' larvae: stage R item 2) |
| Invertebrate predators (*Chaoborus*, *Leptodora*, *Asplanchna*) | *Chaoborus* 50–500/m²; no anoxic refuge here, so it hides in the mud by day and fish depress it | Only implicit, in rotifer loss term `M2_R` | – | MISSING | P3 |
| Zooplankton refuges | No useful vertical migration below about 6 m; refuges are the weeds, near-bed water, the spring window | `refAv` (depth), `plantRef` (weed volume), `COPE_ESCAPE` | yes | OK | – |
| Other grazers on the plankton | Mussels (−17 % June algae), bladderworts (3–4 % of zooplankton production) | `littoral3` mussels, `plants3` bladderworts | yes | OK | – |

### 1.4 Plants

| Item | Real | In the sim | Behaves? | Status | Pri |
|---|---|---|---|---|---|
| Species and growth forms | Only *Nitella flexilis* and *N. tenuissima* are recorded (Upper, 2015). The human's photos show bulrush, ribbon-leaved pondweed or bur-reed in the brook, riffle moss, and a grass and sedge meadow fringe | `plants3` `FORMS3`: 13 species in 5 forms (pickerelweed, bulrush; three lilies; ribbon-leaf, large-leaf and Robbins' pondweeds; bladderworts; pipewort, lobelia; *Nitella*; *Fontinalis*) | Beds 42 % of the bed by August (research about 20–40 % per band); canopy to about 3 m; fringe in the coves ✓ | OK | – |
| Missing plants | Regionally frequent (plant_species_hot_brook.md): narrow-leaved bur-reed (*Sparganium angustifolium*; shores and brook mouths, and likely the ribbon leaves in the brook), bogbean, water horsetail, *P. gramineus*, spiny-spored quillwort, little floating-heart; fen and shore sedges (*Carex lasiocarpa*), sweet gale at the wetland edges (Upper's south, Lower's north) | None of these | – | PARTIAL | P3 |
| Seasons, overwintering, ice and waves | Die-back from about Sep 10, storage, evergreens, ice scour, waves by fetch | ✓ (stages 7a–7h) | yes | OK | – |
| Plants and water level | Dry years expose a stony band that grass colonises (the human's Aug 2025 photo); spring floods reach the sedge meadows (pickerel spawn there) | None (fixed level) | – | MISSING | P2 (with levels) |
| Invasive what-ifs | Variable milfoil at Big Lake, 54 km away; invasive-plant risk 24–26 (on an 11–87 scale); the boat launch is the vector | None | – | MISSING | P3 |

### 1.5 Invertebrates

| Item | Real | In the sim | Behaves? | Status | Pri |
|---|---|---|---|---|---|
| Bed worms and midges (soft mud) | 1,000–10,000/m², about 2–9 g DW/m²; production about 5× biomass; benchmark about 70 g WW/m²/yr (IPP); EF wants ≥ about 100 | `chem3` `benth` (`BENTHOS` CAP 15 g WW/m², production 110–125 g WW/yr) | At or above the upper bound: watch, together with `ALLOCH` | PARTIAL | P2 |
| Weed fauna (small and large) | Kirby: 4,000–17,000 animals/m²; a full canopy carries 2–9 g wet/m² | `littoral3` S and L, capacity per g of plant per species | yes (gate) | OK | – |
| Emergence | Lake-wide 0.7–1.1 g dry/m²/yr; peak late May–June. Midges and *Hexagenia* emerge from the MUD too: *Hexagenia* 50–300/m² on soft organic mud, Maine hatch late June–mid July at dusk | Weeds only: 0.6 g DW/m² of the vegetated littoral (`LIT3.EMERGE`); nothing emerges from the mud | Lake-wide emergence low; no *Hexagenia* hatch (a big dusk feeding event) | PARTIAL | P2 |
| Land insects falling in | About 50 (20–120) mg DW per m of forested bank a day, Jul–Aug peak; λ 5–15 m; camps ×0.05–0.2 | `LIT3.FALL` 0.05, λ 10 m real, bank cover from the aerial photos (`GEO.canopy`) | yes | OK | – |
| Lily-pad grazers | 3–6 % of pad production | `padGraze` 0.05 (`plants3`), `PAD_YIELD` | yes | OK | – |
| Snails | 1–30 g/m² littoral; Ca-limited (no threshold sourced) | `littoral3` sn (0.5–5 g/m² in beds) | yes | OK | – |
| Crayfish | Virile; **the human: "not common"**; Cooper 1941: 0.5 % of pickerel food, 14 % of smallmouth's | `littoral3` crA/crY; `stageR5` cuts capacity to a fifth (`CR_ROCK` 5, `CR_WEED` 3, `CR_MUD` 0.4) and sets `CR_PREF` 1 | Matches the human under `stageR5`; still off by default (`stageR5` not yet the default) | OK under `stageR5` | P2 (make it the default) |
| Mussels: eastern elliptio | "Lots" (the human); 5–25/m² on firm 0.5–3-m bottoms, beds 30–60+, 0.5–5 on muck; filtering | `littoral3` mu (`MU_FIRM` 15, `MU_COVE` 40, `MU_EDGE` 3, `MU_DEEP` 2; 0.8 L/h; burrowed < 5 °C) | yes (gate) | OK | – |
| Mussel hosts and other species | Elliptio's hosts: yellow perch, banded killifish, pumpkinseed (+ white perch, smallmouth, redbreast, sucker potential). **A yellow lampmussel (state Threatened) element is recorded in Upper's SW** (MDIFW GIS), host yellow and white perch and smallmouth. Also plausible: eastern floater, eastern lampmussel, triangle floater in the brook. Up to 290/m² just below lake outlets | Recruitment ∝ TOTAL fish kg/ha (`MU_HOST50`); one species | Hosts are not species-specific; no other species; no outlet-pool bed | PARTIAL | P2 |
| Mussel predators | Otter (shell middens), muskrat, raccoon; thin-shelled floaters first | None | – | MISSING | P3 |
| Odonates | About 100 larvae/m² (0.09 g DW/m²); nymphs eat small fauna and fish larvae ≤ about 2.5 cm; adults hawk insects | Part of the large weed fauna (food); the adults only cosmetic (`rises3view` leaps). The 2-D has predatory nymphs (`ODONATA.FRY_MAX` 2.5) | No predation by nymphs (HOT_BROOK_3D.md "Odonate nymphs are not yet predators") | PARTIAL | P2 |
| *Chaoborus* | See §1.3 | – | – | MISSING | P3 |
| The brook's filter feeders | Hydropsychids peak 40–160 m below the lip at ≥ 0.25–0.3 m/s; blackflies remove 21–30 % of algae per 100 m | `CHEM3.BROOK_FILTER`, `BROOK_CAP`, `BROOK_BENTH` | yes | OK | – |
| The brook's drift | 1.3–6.1 animals/m³, up to 10× at night; about 3 g AFDM/m²/yr from the land | None as fish food (fish feed on the brook's bed and zooplankton) | Drift feeders (fallfish, dace, sunfish) lack their main stream food | MISSING | P2 |

### 1.6 Other vertebrates

The 3-D lakes hold **no** amphibians, reptiles, birds or mammals. Their predation is the uniform `BIOE.M_OTHER` = 0.5 × each species' M, scaled by length^−0.87. It is the same at every depth, hour and season (`fish3._hazards`), and the same for the young (`_stepYoy`).

Rough size check [mine]: r8O_613's "other" deaths over two years, times the species' mean weights, come to about 10–20 kg/ha/yr (this may include deaths at old age). The research's birds and mammals together come to a few kg/ha/yr, and anglers are unknown. Disease and parasites fill the rest. This check deserves a proper tally in the year runner.

| Animal | Real (research; the human) | In the sim | Status | Pri |
|---|---|---|---|---|
| **Common loon** | 1 pair per 94–280 ha, so Upper 1–3 pairs and Lower 1–2. Ice-out to Oct–Nov; chicks from early July. Prey 10–70 g, often yellow perch. Dives 40–60 s. A family eats about 2.5 kg/day (423 kg in 5.5 months), about 1–2.5 kg/ha/yr | None in 3-D (the 2-D has one visiting loon, `BIRD`); designed (HOT_BROOK_3D.md §5, stage 7e) | MISSING | P2 |
| **Belted kingfisher** | About 1 per 0.8 km of shore, so about 18 on Upper and about 13 on Lower. Apr–Nov. Fish ≤ 10 cm within 15 cm of the surface over < 60 cm of water; calm clear water; 15–18 fish of about 4 g a day (about 70 g), about 0.7 kg/ha/yr [mine]. **Pellets 10.5–18.7 % killifish** in Maritime lakes (White 1953) | None | MISSING | **P1** (with the hazard field) |
| **Great blue heron** | Wades 15–25 cm (≤ 50 cm); fish ≤ 25 cm (mostly 5–15), frogs, crayfish; about 300 g/day; dawn and dusk; mid-Mar to Oct–Nov | None | MISSING | **P1** (hazard) |
| **Common merganser** (brood seen, Jul 2026 photo); hooded merganser | Common: 255–400 g/day, prefers 10–13 cm fish; broods work the shallows. Hooded: 44 % fish, 22 % crayfish. Present ice-out to about Dec. Maritime mergansers depressed fish enough to shift kingfishers onto crayfish | None | MISSING | **P1** (hazard) |
| **Bald eagle** (seen) | All year; inland 79 % fish (bullhead, sucker, pickerel), sluggish and spawning fish, scavenges on the ice, takes loons; 0.3–0.5 kg/day | None | MISSING | P2 |
| **Osprey** | Early Apr to early Sep; fish 150–300 g (25–35 cm) within 0.3–1 m of the surface; about 80 % success in calm water; about 0.2 kg/ha/yr | None | MISSING | P2 |
| Cormorant, gulls | Cormorants transient (inland diet mostly yellow perch); gulls as loon-egg predators | None | MISSING | P3 |
| **Frogs** (several species; "definitely bullfrogs", the human) | Green frog: 1 per 1–6 m of vegetated shore [inf]; tadpoles overwinter once and graze. Bullfrog: breeds mid-Jun–Jul above 20 °C air; tadpoles 2 yr, unpalatable to fish; eats insects, frogs, sometimes small fish. Mink frog in dense shallow plants. Frogs are prey of pickerel and bass. Fish-free pools hold the wood frogs and peepers | None in 3-D. The 2-D has frogs and tadpoles, but with the wrong breeding window (`FROG.BREED_T` [10, 20], a peeper's) and tadpole period (`TAD_DEV_FULL` 0.12 yr) | MISSING | P2 |
| **Turtles** ("some turtles", the human) | Painted 2.6–16/ha: basks on logs, rocks and lily mats; half plants; hibernates in about 0.3 m over mud; nests on south-facing sand; most northern hatchlings overwinter in the nest and emerge Apr–May. Snapping 1.5–2.4 adults/ha: fish, carrion, plants (and ducklings); hatchlings emerge Sep | None in 3-D. The 2-D has painted turtles with wrong numbers (90–310/ha in its slice; `MATURE` 6 vs 9–11; `LIFE` 30 vs 60+; late-summer hatching; basking afloat) | MISSING | P2 |
| River otter | All year (through the ice from the brook); crayfish in 85 % of summer scats, fish in 58 % of winter ones; 1.2–1.8 kg/day; a family visiting for days every few weeks | None | MISSING | P2 |
| Mink | Nocturnal; fish (winter, spring), crayfish (summer); 150–300 g/day; ≤ 300 m of shore a night | None | MISSING | P3 |
| Raccoon | Forages in ≤ 10–15 cm (crayfish, frogs, stranded fish); main turtle-nest and loon-nest predator (20–60 % of nests) | None | MISSING | P3 |
| Beaver | Maine 0.15–0.32 colonies/km²; dams are low-flow barriers on outlet streams; floods alder; adds merganser and kingfisher habitat; unknown at Hot Brook | None | MISSING | P3 (a scenario) |
| Muskrat | Emergent eat-outs, mussels | None | MISSING | P3 |

### 1.7 Fish at the system level

| Item | Real | In the sim | Status | Pri |
|---|---|---|---|---|
| The species set | MDIFW's 10 + **sea-run alewife** (2024 Lower chart) + the human's redbreast (in no record; the human's catches and photos); pumpkinseed in both lakes (2024 chart) | 11 species (`species3.js`); pumpkinseed in both lakes ✓ | OK (alewife: next row) | – |
| **Sea-run alewife** | Confirmed (2024). No count. Colonising run, default 15/acre [inf] (presets 6/35/120/235). Adults mid-May to mid-June; 50 % die in the lake; young leave mid-Jul to ice-on in rain pulses; large cladocerans collapse late May–mid June until the young leave; prey of bass < 30 cm, pickerel and white perch (white perch "almost exclusively on alewives by late summer in Maine"); adults eat perch larvae; net P import | Designed as stage A (HOT_BROOK_3D.md §4), not built | MISSING | **P1/P2** (after stage R) |
| American eel | Probable by drainage evidence (14 of 17 analogue lakes; present upstream at Baskahegan Lake); 1–5/ha [inf]; the human has never seen one | Left out (the human's decision) | OK by decision | P3 (a toggle) |
| Trout and salmon strays | At most rare transients; no cold tributaries; no stocking | Left out | OK by decision | – |
| Movement between the lakes | The human: "everything swims through". Lake changes are rare: Adirondack chain about 0.5 %/yr of recaptures; STR suggests perch 1–5 %, white perch ≤ 5 %, pumpkinseed 1–5 % (autumn-weighted), killifish 0–1 %, pickerel 2–5 % + 5–15 % summer excursions (no evidence for an ice-out trip). Lower gets 85 % of its water from Upper | `fish3` `MOVE3`: settle 5–15 %/yr; pickerel spring trip 15 %/yr (ice-out to mid-May) | OFF (about 3–10× high) | **P1** (S) |
| The brook's seasonal users | Suckers at ice-out ✓; fallfish nests ✓; sunfish summering in the pools ✓; dace residents. White perch run at 10–15.5 °C (FSR A04: "heavy spring spawning runs up streams"). Young-fallfish (and perhaps dace) schools pass through in summer (the human). Sub-adult bass < 35 cm in the run; big bass at the upper pool. Adults leave below 15.6 °C with rain | Sucker and fallfish runs ✓; pumpkinseed 30 % and redbreast 50 % summer the pools ✓; pickerel use the pools via bigger-deeper ✓ | PARTIAL (no white perch run, no young-fallfish corridor, bass partial) | P2 |
| Inflow and outlet streams | Upper has "several small tributaries" (OSM: Hot Brook from the south; a Rt 169 culvert is a potential barrier); the outlet runs 2.95 km to Baskahegan Stream. These are the runs' and the dace's real streams | Point sources only: no stream habitat beyond the connecting brook | MISSING | P2 |
| Immigration and emigration across the boundary | Outflow traps: 72–85 % of a season's outflow in Apr–May, storms carry pulses, 1–6 fish/acre/yr over turbulent outlets (about 1,000–5,500 a year from Upper [inf]); immigrants bring regional genes (ROADMAP #5) | None. The 3-D is closed; the 2-D has `IMMIGRATION`. The FINDINGS entry "a closed connecting brook can't hold its dace" partly reflects this | MISSING | P2 |
| Unsimulated mortality | Birds, mammals, angling, disease | `BIOE.M_OTHER` 0.5 × M, uniform in space and time | PARTIAL (stand-in) | P1 (replace in part; §1.6) |

### 1.8 People

| Item | Real | In the sim | Status | Pri |
|---|---|---|---|---|
| Angling regulations | All bass released at once (both lakes); white perch 25/day (a citizen petition); pickerel and yellow perch under general law; Oct–Dec artificial lures only | None | MISSING | P2 |
| Angling pressure and harvest | No Hot Brook creel data. Region F: bass 97 % released in summer, harvest 2.6 % of the open-water catch and 10.3 % through the ice; white perch 1.29 per angler-day through the ice, 1.90 in open water. The human fishes Upper's stream end; ice fishing for pickerel and perch | None (folded into `M_OTHER`) | MISSING | P2 |
| Shoreline development | Upper: camps along the south shore (≥ 15 buildings within 200 m, OSM), an outfitter, a launch off Rt 169. Lower: "no camps" (2004), but camps likely on its east shore (Lakeview Rd). Camps reduce wood (57 vs 379 logs/km), land insects (×0.05–0.2) and add P (0.25–2.7 kg/ha/yr; camp roads 2.0) | Not drawn and not in the shore inputs (ROADMAP #6) | MISSING | P3 |
| Invasive plants | Risk 24–26 (11–87 scale); vector the launch; variable milfoil 54 km away | None | MISSING | P3 (what-if) |
| Road salt, mercury, calcium depletion, warming, browning | Hg 0.25–1.42 µg/g in analogue fish; no road-salt data | None (2-D `TOX`) | MISSING | P3 (what-ifs) |
| Outlet structures | None recorded; a possible 1949 fish screen | None | – | P3 |

### 1.9 Land and shore

| Item | Real | In the sim | Status | Pri |
|---|---|---|---|---|
| Forest | Spruce–fir ring; 73 % forest and 14 % woody wetland in Upper's watershed | The true world's forest from NAIP colour and near-infrared (`canopy3`) for the view; land insects read it (`GEO.canopy`) | OK | – |
| Leaf litter | Most within about 10 m of shore; peak mid-October; leachate DOC | `CHEM3.ALLOCH` leaf pulse by distance (150 m), not by cover | PARTIAL | P2 (§1.2) |
| Shore wood | 300–600 logs/km on forested shore [inf], ≤ 100 on fen, 50–150 at camps; in < 2 m within about 10 m; perch collapsed when wood was cut (Little Rock Lake) | `plants3` `WOOD`: a 15-m band in < 2.5 m water, used only as SPAWNING structure (perch "rigid", pickerel "mat"); not cover for fish, not bass structure | PARTIAL | P2 |
| Shade | Brook about 97 % shaded in leaf (transmission 0.03–0.1); no lake-littoral shading data | None (the brook's temperature is Upper's water anyway; shade would cut its moss and algae light) | MISSING | P3 |
| Wetlands | Upper's south inlet: shrub swamp 56 ac + conifer swamps 112 + 125 ac; Lower north marsh 1.6 ac; sweet gale fen 5–50 m wide [inf]; flooded in spring (pickerel spawning, loon nests) | Land classes for the view and the insect weights; no flooding | PARTIAL | P2 (with levels) |
| Runoff, snowmelt, snow on land | Snow-cover days about 120 (Houlton); SWE > 230 mm on 1 Mar; melt pulse mid-April | Render-only snow tint on the land (`main3` `U.snow`); no hydrology | MISSING | **P1** (with the hydrograph) |
| Pollen pulse | About 37 mg P/m²/yr after ice-out (inside the atmospheric term) | None | MISSING | P3 |

### 1.10 What the 2-D sim has that the 3-D lacks

| 2-D (`src/world.js`, `config.js`) | 3-D | Note for a port |
|---|---|---|
| `BIRD`: one diving common loon (sensed as a threat) | none | Dives 40–60 s, not 9–18 s; 1–3 pairs on Upper; families from July (shore_birds_and_mammals.md) |
| `ODONATA`: nymphs that eat larvae and fish ≤ 2.5 cm; adults that hawk insects | food only | Port the nymphs' predation into `littoral3` |
| `FROG`: frogs and tadpoles | none | Fix `BREED_T` (green, bull and mink frog windows) and the tadpole periods (green overwinters once; bullfrog about 2 yr) |
| `TURTLE`: painted turtles | none | Fix density (2.6–16/ha), `MATURE` 9–11, `LIFE` 60+, spring hatchling emergence, basking on logs |
| `IMMIGRATION` gene pool | none | ROADMAP #5: immigrants by the inflow and outlet at real rates |
| `TOX` (biomagnifying contaminant) | none | ROADMAP #5 what-ifs |

The 3-D is ahead on: plants by species, the weed fauna, surface and land insects, the brook's filter feeders, mussels (population and filtering), bladderworts, crayfish by shelter, the water's 3-D physics, and the young-of-year system.

---

## 2. What the latest run shows (r8O_613: true lakes, GPU, `?r5=1` + arm B overrides; years 1–2)

| Season | Surface T (Upper) | Bottom O₂ (Upper) | Zooplankton µg/L (Upper / Lower), make-up | Surface algae (U / L) | Secchi | Target / remark |
|---|---|---|---|---|---|---|
| June, yr 1 (d 14–28) | 16.8–20.0 | 8.8–8.9 | 392–550 / 396–427; D 317–408, C 77–94, R 0–15 | 0.09–0.16 | 3.1–3.2 | Peak too high and too Daphnia-heavy (≤ 25 %); rotifers about 0 |
| July, yr 1 (d 42–84) | 21.8–23.9 | 7.9–9.1 | 130–264 / 77–177; D 77–154, C 49–76, R 0–5 | 0.03–0.30 | 3.2–3.3 | Temperature and O₂ ✓ |
| Late Aug–Oct, yr 1 | 21.3 → 7.9 | 8.5 → 11.2 | 57 → 8 / 30 → 7; D 0–16 | 0.02–0.26 | 3.2 | Target about 30–80 with an autumn recovery |
| Winter, yr 1 (d 182–336) | 0.4–0.8 | 7.7–14.1 | 1–5 (Dec–Feb), Upper 14–44 by Mar–Apr | **0.39–0.59** | 3.0–3.3 | Target about 25 % of summer (10–20); algae should be about 40 % of summer, not 2–5× it |
| Spring, yr 2 (d 350–392) | 5.6 → 20.0 | 13.8 → 9.2 | 37–122 / 57–144; R 19–31 | 0.19–0.47 | 2.9–3.3 | Ice-out about Apr 19–May 3 ✓ |
| June–July, yr 2 | 21.8–23.0 | 8.1–9.9 | 205–305 / 124–228; D 55–107, C 118–168 | 0.07–0.31 | 3.2–3.3 | Better copepod share; peak still high |
| Aug–Oct, yr 2 | 22.4 → 8.4 | 8.3–11.4 | **11–18** / 39–49 (Aug), 4–8 / 15–29 (Sep–Oct); D 1–3 | 0.02–0.23 | 3.1–3.3 | Upper far below target |
| Winter, yr 2 | 0.7 | 13.8 → **3.4** (late Mar) → **17.0** (ice-out) | 1–2 | **0.21–0.88** | 2.8–3.2 | Bright-ice bloom; supersaturation at ice-out |
| Whole year | peak 23.4–24.0 ✓ | summer ✓ | – | – | **2.8–3.4 (target 3.5–4.5)** | Too dark, nearly flat |

Total fish biomass went 102 → 93 → 81 kg/ha over the two years (the community question belongs to the fish reviews).

---

## 3. What to add or fix, in priority order

### P1: changes what the fish community does

1. **Snow on the ice, ice optics, late-winter convection, and the winter O₂ budget** (stage D's core; report rank 3). **M.**
   - **Snow and ice:**
     - snowfall from the weather (80–90 % of Dec–Mar precipitation, about 10:1);
     - ice thickness by Stefan's law, h = α√FDD (α 1.3–2.0 under snow, 2.7 snow-free; about 40–80 cm by March);
     - slush and white ice once the snow load exceeds about 83 kg/m³ × ice thickness;
     - layered Beer–Lambert transmission, T = (1 − α_top)·exp(−Σk·h), in place of `ICE.LIGHT_CUT`.
   - **Late-winter convection:** once the snow is off, add a radiatively driven convective mixed layer under the ice, deepening 0.5–3 m a day.
   - **O₂ demand:** let the bed's areal demand fall through the winter to 20–50 % of its early value, as labile matter is used up.
   - **Targets:**
     - light under ice 1–12 %, about 30 % after a rain or thaw clears the snow;
     - winter algae about 40 % of summer;
     - zooplankton about 25 % of summer, copepods dominant, the low point at ice-melt;
     - no winterkill in a 3-m basin in a normal winter; winterkill only in 1–2-m coves or heavy-snow winters;
     - re-oxygenation in the 2–4 weeks before ice-out;
     - no supersaturation at ice-out.
   - **Re-check afterwards:** the gate's winter O₂ (≥ 3 mg/L, 3-seed median), the first-winter rules, and the GPU runner's winter.

2. **A realistic weather generator**, the prerequisite for the hydrograph (report rank 9; WH §1, §6). **S–M.**
   - **Spells:**
     - fronts every 3–5 days;
     - a rain event lasting about 1–2 days, a storm hours to a day, plus summer thunderstorm gusts (2–3× wind for 10–60 min, 10–30 mm in under 1 h);
     - draw the dwell times from those distributions, not the 2-D chain × 1/TS.
   - **Wind:**
     - decouple it from cloud, with windy post-frontal clear days;
     - add the diel cycle (summer afternoon ×1.4, night ×0.6; calm about 17–19 % of summer hours);
     - use the Caribou monthly means (2.5–3.9 m/s).
   - **Rain:** give each state a precipitation rate in mm/day, calibrated to Houlton (monthly 50–103 mm; ≥ 25-mm days about 7/yr).
   - Keep `_wrand` as the stream, so it stays deterministic.

3. **Year types (interannual climate).** **S–M.**
   - Each year, draw from the weather stream:
     - an ice-out shift (SD about 9 days; recent range Apr 12–May 2);
     - a summer-warmth offset (±1–2 °C) with heat-wave spells that can take shallow water to 26–28 °C (Moose Pond 29.4 °C, 2024);
     - an autumn-cooling date.
   - Add a warming knob (+0.05 °C/yr) as a what-if.
   - `winterWindow` and `WINTER0` must then become per-year: the 208-day winter varies.
   - **Why:** smallmouth (and other) year-class strength is set by first-summer growth against winter length (MDIFW bass plan: cool summers 1986/92/96 cut cohorts). Today every year is the same, so recruitment can't vary as it does in Maine.
   - Save the year's draw (exact resume).

4. **The water balance and levels.** Do this together with item 2 and the brook items (report rank 1; STR #6; ROADMAP #7). Build it in three steps:
   - **(a) Hydrograph. M.**
     - Discharge from rain and snowmelt through a lake-storage routing, giving monthly ×mean of about 0.3 in August and about 3.3 in April.
     - Storm rises ×2.2–2.6 over 1–2 days, receding ×0.81–0.88 a day.
     - Loads ∝ Q^b (particulate P b > 1, DOC 1–1.5).
     - This replaces the constant `qIn`/`qOut` and `IN_NUT`, so seasonal flushing of P and plankton follows.
   - **(b) A stage per lake. M.**
     - Keep one level scalar per lake and use a rating curve, Q = k·(h − h_sill)^1.5, so Upper's outflow stops below its sill in a dry August.
     - The brook's effective depth becomes geometry + Δh, which the fish's passage, refuge and habitat rules read. Riffles close at about 10–15 cm.
     - Isolated pools heat (afternoons up to about 27–29 °C [inf]) and lose O₂ at dawn with the fish biomass in them.
     - Fish leave as discharge falls; recolonisation takes about 2 weeks after flow returns.
     - Dry years arise from the weather and year-type draws.
     - **Why:** the brook pools' sunfish, the dace, pickerel and bass in the brook, and whether the two lakes are connected that year.
   - **(c) A moving shoreline. L.**
     - A wet mask that changes: the exposed strip in dry years (20 m of a 2 % sand flat for a 0.4-m drop), and flooded sedge and shrub margins in spring (pickerel spawning, loon nests).
     - Plants stranded or flooded.
     - Needs the true-scale geometry and the GPU engine to read the level.
   - The sill height is unknown. Ask the human (§4); start with Upper's summer low equal to the 2017 lidar level.

5. **Shore and air predators: first as a risk field, later as animals** (stage 7e design; report rank 4; STR #1).
   - **Step 1: a hazard field. M.** A hazard per fish by water depth × fish length × light × season × weather (calm, clear), charged in `fish3._hazards` / `_stepYoy` and the GPU's `k_hazards` / `y_mort`. Take its expected total **out of `M_OTHER`**, so each species' total M is unchanged.
     - Readable by the fish as habitat cost or `fear`: fish over 3–7 cm avoid water under 20 cm by day (Power 1987); risk is about 0 below 50–60 cm.
     - **Kingfisher:** fish ≤ 10 cm, over < 60 cm of water, within 15 cm of the surface, calm clear daylight, Apr–Nov; about 0.7 kg/ha/yr.
     - **Great blue heron:** 5–25 cm fish in ≤ 50 cm, dawn and dusk; plus frogs and crayfish.
     - **Mergansers:** 10–13 cm fish in the shallows; broods in summer.
     - **Loon:** 10–70 g fish in open water; families from July; 1–2.5 kg/ha/yr.
     - **Osprey:** 25–35 cm fish within about 1 m of the surface, Apr–Sep.
     - **Eagle:** bullhead, sucker and pickerel, sluggish or spawning fish (suckers in the brook), carcasses on the ice.
     - **Otter and mink:** crayfish in summer, fish in winter (otter through the brook under the ice).
   - **Step 2: agents. L.** True-size animals for the view at the research's numbers, with the dive, wade, plunge and circle (stage 7e's design).
   - **Why:** today the shelf is free of risk from above, which shapes where the small fish and the young live. The research's best-documented killifish predator is the kingfisher.
   - Check the bird budget against the species' production and the `M_OTHER` tally (§1.6).

6. **The zooplankton's seasonal shape** (with item 1). **M** (calibration). This is stage R item 2's other half: the late spawners' larvae (pumpkinseed, redbreast, killifish) need rotifers in Jun–Aug.
   - **Targets:**
     - summer crustaceans about 30–80 µg/L, Daphnia ≤ 25 %, calanoids 35–50 %;
     - June peak in the 50–300 range for small shallow lakes (ZOO), not 300–550;
     - rotifers ≈ ¼–⅓ of crustaceans in summer;
     - a modest autumn recovery;
     - under ice about 25 % of summer.
   - **Look first at:**
     - the rotifers' food threshold against the grazed-down algae (0.02–0.09 units in summer);
     - `M2_R`;
     - why Daphnia dominate the spring in a soft-water lake where *Holopedium*, *Bosmina* and calanoids would.

7. **Sea-run alewife** (stage A, designed in HOT_BROOK_3D.md §4 with `sea_run_alewife.md`). **L.** Build it after stage R settles, as planned.
   - Run-size presets 0 / 6 / 15 (default [inf]) / 35 / 120 / 235 per acre; the base community stays run 0.
   - **Effects:** the large cladocerans collapse from late May until the young leave; prey for bass < 30 cm, pickerel and white perch; adults eat perch larvae (a candidate for "perch small and few"); net P import.
   - **Gate:** arrival and exit dates, the zooplankton crash, closed N and P budgets with the import and export.

8. **Lake-to-lake settle rates** (STR #2–3). **S.**
   - Set `MOVE3` to the field's: perch 1–5 %, white perch ≤ 5 %, pumpkinseed 1–5 % weighted to autumn, redbreast 1–5 %, sucker 3–10 %, bullhead 2–5 %, bass 2–5 %, killifish 0–1 %.
   - Turn the pickerel's spring trip into June–September excursions (5–15 % a year, days to weeks, in the brook's pools).
   - Count crossings by size (`stats.cross`).
   - Coordinate with the fish reviewers: it touches species behaviour.

### P2: realism the human asked for, or a moderate effect on fish

9. **Water clarity** (RMR #1; report rank 2).
   - **Now. S.** Set `KD_COLOUR` 0.5 → about 0.35, giving Secchi about 3.9 m (field 3.5–4.2; the human: "clearer"). Then regenerate `plants3init` (the depth limits deepen: Duarte's biomass peak 1.1 + 0.4·SD) and re-check the under-ice light and the fish's sight.
   - **Later. M.** Make colour a field fed by DOC, with Kd ∝ DOC^0.45·TP^0.24. It browns in spring and autumn and after storms, takes Oct–Nov leachate from the litter, and has a browning-trend knob.

10. **Angling. S–M.**
    - A harvest hazard by species, legal size and season (white perch to the 25/day bag; pickerel and yellow perch, especially through the ice).
    - Catch-and-release hooking mortality for bass (rate to be sourced). Region F: 97 % released, harvest 2.6 % open water / 10.3 % ice.
    - Take it out of `M_OTHER`; add a pressure knob for what-ifs.
    - Concentrate effort where the human fishes (Upper's stream end, near shore) and on the ice in winter.
    - No Hot Brook creel data exist: ask the human (§4).

11. **Frogs and turtles in 3-D. M–L.**
    - Green frog, bullfrog and mink frog with tadpoles: grazers of periphyton; bullfrog tadpoles unpalatable to fish; frogs prey of pickerel and bass.
    - Painted turtle (2.6–16/ha, basking on logs, rocks and lily mats).
    - Snapping turtle (1.5–2.4/ha; fish, carrion, plants).
    - Port from the 2-D with its fixes (§1.10).
    - Their effect on the fish is modest; they are high on the human's own list ("frogs leaving the water, turtles on top of the water").

12. **Predatory odonate nymphs. S–M.** About 100/m² (0.09 g DW/m²) in the weeds. Add a predation term on the small weed fauna and on fish larvae ≤ about 2.5 cm inside stands. The 2-D already has this.

13. **Mussels by species and host. S–M.**
    - Tie each mussel's June recruitment to its own hosts' biomass:
      - elliptio ← yellow perch, banded killifish, pumpkinseed (+ white perch, smallmouth, redbreast, sucker);
      - the recorded yellow lampmussel ← yellow and white perch, smallmouth;
      - eastern floater in the muddy coves;
      - triangle floater in the brook;
      - a dense bed just below Upper's pool.
    - Predators: otter, muskrat, raccoon.
    - Per-species shell colours in the view.

14. **The streams and the system boundary. M.**
    - Make the inflow stream and the outlet reach real spawning water for the sucker, fallfish and **white perch** runs, and a source of dace.
    - Add low immigration (gene flow, ROADMAP #5).
    - Add emigration over Lower's outlet: mostly in Apr–May and storm pulses, 1–6 fish/acre/yr [inf].
    - Tally these separately, so they don't mask the regulation problems stage R is fixing.

15. **The brook beyond its level** (STR #1, 4, 5, 7; BFW). **M.**
    - Current velocity as a habitat variable: riffles > 0.3 m/s; filterers need 0.25–0.3 m/s; minnows cross riffles less as current rises.
    - Drift as dusk and night food (1.3–6.1 animals/m³, ×10 at night) for fallfish, dace and sunfish.
    - A summer young-fallfish corridor; sub-adult bass in the run; big bass waiting at the upper pool for passing schools.
    - Open riffles in winter.
    - The bird hazard in the riffles (item 5).

16. **Shore wood and rock as cover, and a substrate map. M.**
    - Logs at 300–600/km on forested shore [inf], ≤ 100 on fen, 50–150 at camps, in < 2 m within about 10 m of the bank.
    - Cobble and boulder shores.
    - Make both fish cover and bass structure (rock and wood ×3–4, mud ×0.3: HOT_BROOK_3D.md's open item), not only perch spawning structure.

17. **The catchment's organic input. S–M.**
    - Split `ALLOCH` into the inflow's particulate load (on the hydrograph, item 4a) and a narrow leaf band: most within about 10 m of shore, weighted by forest (less at camps and fen), plus leachate DOC (17.8 g DOC per m of shoreline a year) into the colour field (item 9).
    - Re-check `BENTHOS`' production (IPP: at or above the upper bound) at the same time: the bed's food feeds most of the community.

18. **Emergence from the mud. S–M.**
    - Let the bed's midges, and a *Hexagenia* pool on soft organic mud (50–300/m²; Maine hatch late June–mid July at dusk), emerge to the surface field.
    - Lake-wide emergence target 0.7–1.1 g dry/m²/yr.
    - This gives the dusk feeding events anglers know.

19. **Field-unit readouts. S.** Add TP and chl (µg/L), colour and DOC, under-ice light %, ice and snow thickness, lake level and brook discharge to the data page and the year runner, so every field number in this review can be checked directly.

20. **Make `stageR5` the default** (already planned). Today's default still has the Michigan crayfish capacity, which the human's "not common" rules out.

### P3: completeness, what-ifs and the view

21. ***Chaoborus*** (50–500/m²; in the mud by day, preying on rotifers and small crustaceans at night; food for perch and white perch). **S–M.**
22. **Moon phase** (night light up to about 0.1–0.3 lx at full moon; esocid night feeding; the alewife's dark-moon emigration). **S.**
23. **Beaver** (a scenario: a dam on the brook or outlet that blocks passage at low flow, ponds the run, adds wood) **and muskrat** (eat-outs of emergents, eating mussels). **M.**
24. **More plants:** bur-reed, quillwort, bogbean, little floating-heart, and the sedge and sweet-gale fen fringe at the wetland ends, with their response to water level. **S–M** (regenerate `plants3init`).
25. **People what-ifs:** camps and docks (structure, shade, P), roads (salt: no data), invasive milfoil, mercury (the 2-D `TOX`), calcium depletion, warming, browning. **M each.**
26. **Eel** as a toggle (1–5/ha [inf]; eats crayfish and small fish; a mussel host). Groundwater seeps, the pollen pulse, riparian shade on the brook, rain as a surface layer, sediment transport (ROADMAP #3). **S–M each.**
27. **Cormorants, gulls, raccoon, mink agents;** render-only shore details (steam fog, ice ramparts, wrack). Use `Math.random` for anything cosmetic.

---

## 4. Cheap unknowns: questions for the human

Don't re-ask what the human has already answered or asked not to be re-asked: water clarity, crayfish, sunfish in Lower, alewife runs, and the Lakes of Maine plant list. Open:

- **The outlets:** any rock lip, old crib dam, culvert or **beaver dam** at Upper's or Lower's outlet or on the brook? How far does Upper drop in a dry August before the brook stops? How often has the brook been that low?
- **Ice fishing:** how much snow is usually on the ice, and is there slush? How thick is the ice in February? Have there ever been dead fish at ice-out?
- **Birds:** which are regular, and how many? (Loon pairs per lake; kingfishers along the shore; herons; merganser broods; ospreys or eagles fishing.)
- **Frogs and turtles:** which calls (bullfrog "jug-o-rum", green frog "banjo twang", mink frog)? Painted or snapping turtles, or both?
- **Angling:** how many boats on a summer day, how many ice shacks, and what do people keep (white perch, pickerel, perch)?
- **Camps on Lower:** any (Lakeview Rd)?

---

## 5. Sources used

**Research notes**
- `docs/research_notes/Maine lake shores and catchment/`: weather_and_catchment_hydrology, shore_birds_and_mammals, turtles_and_frogs, land_lake_subsidies, shore_geometry_and_vegetation; and the report `docs/reports/Maine lake shores and catchment.md`.
- `Hot Brook populations and water/`: hot_brook_lake_records, invertebrates_plankton_plants, maine_dep_lakes_data_2025, maine_freshwater_mussels, sea_run_alewife, drainage_species_and_eel, recent_maine_research, plant_species_hot_brook.
- `docs/research_notes/fetched_sources_read_by_me.md`.
- `Fish in streams connecting lakes/` and its report.
- `Whole lake 3D fish simulation/`: brook_food_web, movement_between_lakes, oxygen_metabolism, shallow_lake_3d_physics.
- `Real lake ecology for calibration/`: zooplankton_dynamics, whole_lake_energy_flow, killifish_persistence_and_predators (White 1953's kingfisher pellets).
- `docs/reports/Maine lakes ponds and streams.md`.

**The human's observations**
- Memory notes: hot-brook-field-observations, land-water-realism, w3-backlog-requests.

**Code**
- `src/w3/`: env3.js, chem3.js, plants3.js, littoral3.js, fish3.js (`MOVE3`, `stageR5`, `_hazards`, the riffle rules).
- `src/config.js`: `ICE`, `ENV`, `THERMAL`, `WIND`, `PHYTO`, `PLANKTON`, `ZOO3`, `BIRD`, `ODONATA`, `FROG`, `TURTLE`, `BIOE.M_OTHER`, `WINTER0`.
- `src/world.js`: the 2-D wildlife.
- `test/w3.mjs`: the gate's check list.

**Design and state documents**
- docs/HOT_BROOK_3D.md §2–§8; ROADMAP.md (agreed plan #3, #5–#7); SESSION_STATE.md; docs/FINDINGS.md.

**Run**
- scratchpad `r8O_613.txt` (arm O, seed 613, through day 728).
