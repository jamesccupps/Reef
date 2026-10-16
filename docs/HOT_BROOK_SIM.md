# The sim as the real Hot Brook lakes — design (2026-10-15)

The human's decision: "lets just model the real upper and lower hotbrook lake … make sure proportions and amount of water
and animals is realistic." This replaces the generic Maine lake (14.4 m hole) + stream + pond with Upper Hot Brook Lake,
the connecting brook and Lower Hot Brook Lake (T8 R4 NBPP / Danforth, Maine). The engine stays the same (every fish its
own brain, FB4 energetics, evolution, closed N/P budgets, the field chemistry); the place, the proportions and the
populations become the real ones. Sources: the landscape model (`tools/hotbrook/`, artifact
https://claude.ai/artifact/7e75Q4UqJJw4jEfx5gF7ye), `docs/reports/Maine lake shores and catchment.md`,
`docs/reports/Maine lakes ponds and streams.md`, and the population/water research in
`docs/research_notes/Hot Brook populations and water/`.

## 1. What is real and what is compressed

| | Real | In the sim | Why |
|---|---|---|---|
| Depths | Upper 5.5 m max, Lower 3.9 m, brook pools 1.1 m, riffles ~0.35 m | **the same** (79 px/m) | depth drives light, heat, O₂, habitat |
| Share of each lake at each depth (hypsography) | Upper 44 % ≤ 3 m, mean 3.05 m; Lower 57 % ≤ 3 m, mean 2.67 m | **the same** (43 % / 3.08 m; 56 % / 2.70 m) | the littoral vs basin balance is the ecology |
| Where it is deep along the flow path | Upper's deep north basin by the outlet, shallow south end, the narrows by the points | **the same order** | the real centreline, quantile-mapped onto the hypsography (`tools/hotbrook/slice_profile.py`) |
| Horizontal length | Upper 3.2 km, brook 154 m, Lower 2.9 km | Upper 36 m, brook 14 m, Lower 32 m (≈ 90×, 11×) | a 6.5-km slice at 79 px/m is 500,000 px wide; the fish count must stay ≤ ~700 for 30 Hz |
| The slice's third dimension | — | one slab thickness (`SLICE_M2`), as now | keeps the closed budgets; each basin's densities are per its own area |
| Fish, invertebrates, plants | per ha / per m² | **the same densities** in the slice | counts = density × the slice's area (§4) |
| Land | rocky till shores (MDIFW), wetlands S/W of Upper and N/E of Lower, camps on Upper's south shore | land at both ends: Upper's south shore (a till bank to +1.2 m), Lower's north shore (a low wetland margin) | animals cross the waterline there (Stage D) |

The brook is over-represented by design: real 0.1 ha against 375 ha of Upper, in the sim 14 m against 36 m. Each basin
keeps its OWN real densities; what the brook holds is the brook's real fish (the sunfish of its pools), not a share of the
lakes'. Exchange between basins (fish moving into the brook pools in summer) uses the immigration mechanism for the lake
fish the slice doesn't hold.

## 2. The world (Stage A)

- `LANDSCAPE` becomes data: the profile from `tools/hotbrook/sim/slice.json` (0.25 m steps; negative = ground above the
  water) with named segments `bankL / upper / brook / lower / bankR`; `bedY`, `basinAt`, `isLittoralX`, `shoreDir`,
  `homeBasinAt`, `basinCenterX` keep their signatures. Land columns are never wet (a guard everywhere `bedY ≤ 0`).
- `WORLD.W` ≈ 6,990 px (88.5 m); `WORLD.H` = the deepest water + a bed margin ≈ 456 px (5.8 m): the field grid becomes
  ~291 × 19 cells of 0.3 m (5,500 cells, fewer than today's 7,800).
- The water surface is flat (the 0.6 m drop from Upper to Lower is drawn, not simulated).
- Inflow: Hot Brook enters Upper's south end (the left); the outflow leaves Lower's north end (the right), at the
  catchment's flow (Stage D's hydrograph; until then the present through-flow).
- A deep-lake test preset keeps the stratification physics covered by the gate (`LANDSCAPE.preset('deep')`).

## 3. Physics that must change with the place

- **Mixing by depth in metres, not fractions of the column.** `THERMAL.EPI_FRAC / HYPO_FRAC / DIEL_DEPTH` assume a deep
  lake. Upper is 3.2 km long and 5.5 m deep; MDIFW: "does not stratify". The mixed depth follows wind and fetch (a few
  calm hot days can stratify it weakly near the bottom, then the next wind mixes it). Lower (3.9 m) never stratifies.
  The brook is always mixed.
- **Light and colour.** Tea-coloured water: Secchi and colour from the lake records research; light attenuation becomes
  colour-dominated (with re-base step 4b).
- **Ice and winter O₂.** Shallow lakes cool and freeze sooner; snow on the ice sets under-ice light (report mechanism #3).
  Lower's mean depth of 2.7 m makes winter O₂ the risk to watch (no winterkill on record — a validation target).
- **Wind** acts on the whole slice (no sheltered deep hole).

## 4. Populations at real densities (Stage B — numbers from the population research)

- Fish: the per-ha numbers and size structure of each species (research note `fish_numbers_and_new_species.md`) × the
  slice's lake area → the followed fish per species; young-of-year stay in schools. Total 60–150 kg/ha (earlier report).
- Species: the MDIFW list (smallmouth, white perch, yellow perch, chain pickerel, brown bullhead, white sucker, fallfish,
  blacknose dace, banded killifish) + the angler's pumpkinseed and REDBREAST SUNFISH + golden shiner. Golden shiner stays
  (common in Maine lakes, omitted by the 1949 list); the four new ones need brains, art and FB4 sets.
- Invertebrates and plants: crayfish, mussels (eastern elliptio — "lots of mussels"), benthos, zooplankton,
  macrophytes at the research's per-m² / per-L values for shallow coloured Maine lakes.
- Wildlife: painted turtles 2.6–16/ha (the sim has 90–310/ha), frogs by metre of shore, one loon pair's share.

## 5. The display (Stage C)

A 2.5-D cut-away: the slice is the front face (mostly water now — the lakes are shallow), with the real landscape behind
it from the model (the lake surface receding, the far shores, the forest, the sky, seasons, ice and snow). The camera's
dock-level shots fill the screen with water and shore.

## 6. The land, the shore and the air (Stage D)

The ranked list of the shore report: catchment water and loads on a hydrograph; colour; snow on the ice; shore predators
(heron, kingfisher, loon, osprey, eagle, otter, mink) as a depth × size × light risk; shore wood (logs in < 2 m near
shore); insects across the waterline; leaves; shade; wind; turtles hauling out and nesting; frogs on the bank; pollen.

## 7. A year in the new place (walk-through)

- **Late April (ice-out ~Apr 23).** The whole column is 4–6 °C and mixed; the brook runs high (April flow ≈ 3.3× the mean);
  pickerel spawn in the flooded shallows; yellow perch ribbons on brush; frogs and turtles come up from the mud.
- **May–June.** The shallows warm first (44 % of Upper is ≤ 3 m); smallmouth nest on gravel and rock at 0.5–2 m; pumpkinseed
  and redbreast colonies in < 1 m; white perch school; the loon pair hunts; mayflies and midges hatch.
- **July–August.** Upper's surface 23–24 °C and the bottom of the north basin only a degree or two cooler (no cold refuge);
  wind keeps O₂ up; brief calm spells stratify the north basin weakly; sunfish crowd the brook's mouth pool and shallow run;
  turtles bask on logs; herons work the brook's riffles.
- **September–November.** Cooling and mixing; perch and white perch school in the north basin; leaves fall into the
  margins and the brook; the brook rises in October–November; ice-on ~Dec 1.
- **December–April.** Ice and snow; the deepest water (the north basin, 15–18 ft) is the 4 °C refuge and where perch
  gather (the "perch holes" the human ice-fishes); O₂ falls slowly under snow; frogs and turtles in the mud of the shallows.

## 8. Stages and how each is judged

| Stage | What | Judged by |
|---|---|---|
| A | the real geometry, physics in metres, gate rewritten for the place | gate green; a year's temperature at the bottom of Upper's north basin within ~2 °C of the surface in summer (no stratification), ice-out ~late April; mass budgets closed |
| B | populations at real densities, the new species | 3-seed census: per-species fish/ha and kg/ha inside the research ranges; every species replaces itself (home-bred recruits) |
| C | the 2.5-D view and the air above the water | in the browser at the human's ultrawide aspect: water and shore fill the screen |
| D | shore mechanisms, ranked | each mechanism's own validation target from the report |
