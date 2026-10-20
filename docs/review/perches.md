# Review: yellow perch (`perch`) and white perch (`whiteperch`)

Written 2026-10-20 for the human's request: "make sure it's all behaving as it really would in the environment".

**Scope.** The 3-D lakes' perches with the stage R package applied (`stageR5()`, `src/w3/fish3.js:417`, which is about to become
the default), on the true-scale world.

**Sources** (cited inline):
- the repo's research notes, chiefly:
  - `Seasonal fish habitat use/` (SFH-P is the perch file, SFH-W the white perch file);
  - `fetched_sources_digest.md` (FSD; Cooper 1941, MDIFW 2002);
  - `Whole lake 3D fish simulation/white_perch_regulation.md` (WPR), `size_structure_whiteperch_sucker_bullhead.md` (SSW),
    `predator_diets_and_prey_mortality.md` (PDM), `habitat3d.md` (H3D);
  - `Real lake ecology for calibration/first_winter_mortality.md` (FWM), `killifish_persistence_and_predators.md` (KPP);
  - `Maine lakes ponds and streams/centrarchid_percid_esocid_parameters.md` (CPE);
- `docs/FISH_CENSUS.md`;
- the human's field notes (memory `hot-brook-field-observations.md`).

No web searches were needed. White perch habitat and predation research is left to the parallel
`white_perch_habitat_and_predation.md`; this file names the code levers it will act on.

**Runs read:**
- r6L_613 and r6M_613: seed 613, one year each, with end-of-year tallies.
- r8O_613: arm O, the package through item 6j plus 6k (YCOLD), seed 613. Years 1–2 are complete and year 3 has just begun.

Every run so far uses one seed. All three also carry the "arm B" URL overrides: white perch `plank=0`, `diet.plankton=0`, `Lzoo=10`, plus
the same for four small species. **These overrides are not in the code or in `stageR5`.**

**Status key:**
- **OK:** matches the evidence.
- **OFF:** wrong value or behaviour.
- **MISSING:** the process is not modelled.
- **UNKNOWN:** no evidence, or not yet measurable from the runs.

Priority is **H** (high), **M** (medium) or **L** (low).

---

## 1. Yellow perch (`perch`)

| # | Aspect | Real (source) | Sim (where, value) | Status | Priority and fix |
|---|---|---|---|---|---|
| 1 | Summer day habitat | Schools over open bottom offshore. Shallow lakes use the deepest water: Lake Madison mean 3.4 m (1.2–4.3), ~340 m offshore. Never in weeds (Sinai). Sub-adults littoral, large fish pelagic (Crystal L.). Ensure 8–15-cm perch use the 1–3 m weed edge (PDM §7.2) (SFH-P §1) | fish3.js:287: adults ≥ 22 cm bed 3.0–5.5 m, 0.7 m off the bed. `habJ` < 15 cm 1.5–4.0, blended between. r6M by day: 72 % over ≥ 2 m, 16 % over 1–2 m | OK | — |
| 2 | Night | Schools break up below ~100 lx, move inshore along the bottom and rest on it. Movement by day ~3× night (SFH-P §1 Diel) | Night band 0.5–2.5 m, 0.1 m off the bed, activity 0.25 | OK | (L) A school still counts as a school for predators at night (item 26) |
| 3 | Dusk and dawn moves | Strong sunset migration inshore; reverse at dawn (Hasler & Bardach; Imbrock) | `_mode` blends the day and night bands by sun (fish3.js:1129) and travels at the 30-min speed | OK | — |
| 4 | Autumn | Most mobile season (2× summer). Shallowest in fall in shallow Lake Madison (2.9 m) | No autumn band | MISSING | L |
| 5 | Winter, adults | Active by day under ice, schooled, mid-morning and early-afternoon peaks. Deep basin in deep lakes. In shallow "dishpan" lakes at 1.2–2.4 m in green weeds at first ice, deeper midwinter, shallow again before ice-out (MN DNR; anglers). The pickerel's winter prey is perch-first (PDM §1.4) | Adults 3.9–5.5 m all winter, 0.5 m off the bed, activity 0.4. Feeding follows under-ice light (K_I 1 lx, fish3.js:571) | Partly | (M) Add the first-ice and late-ice shallow phase for adults: winter bed 1.5–3 m when the ice is < ~4 weeks old and in the last ~4 weeks before ice-out |
| 6 | Winter, juveniles | As item 5 | `habJ.wbot` 1.5–3.5 m | OK | — |
| 7 | **Bands in Lower** | H3D §9 gives Lower its own bands: perch by day 2.8–3.9 m, winter "the 3.3–3.9 m centre of Lower" | S3 bands are Upper's (comment at fish3.js:260). Lower (max ~3.9–4.1 m) has bed ≥ 3.9 m on **0.9 %** of its area (true-scale geometry, measured). Lower's adult perch therefore crowd onto ~2.5 ha all winter. While `off > 0.2` they also keep "travelling" (fish3.js:1522, extra swimming cost) | **OFF** | (M) Make the bands lake-relative: per-lake bands from H3D, or depth as a fraction of the lake's own deep water. Check whether this crowding feeds the under-ice hypoxia (item 24) |
| 8 | Schooling | 50–200 fish, size-sorted, 20–30 m across; YOY school more than adults; large adults sometimes alone; sexes often in separate schools | School agents of ~80; merges only within ×1.2 length (size-sorted). Fish ≥ ~20 cm get their own brain and school by choice | OK | (L) Sex-sorted schools and night break-up are not modelled |
| 9 | Movement between lakes | Okoboji perch move between connected lakes; autumn the most mobile season (movement_between_lakes.md) | MOVE3 (fish3.js:354): `settle` 0.15/yr in September–October | OK | — |
| 10 | Diet by size | Larvae: nauplii, copepods, cladocerans. Settled juveniles: amphipods and chironomids. > 120–150 mm: insects, crayfish, fish (CPE Q5). **Maine 16–35 cm: fish ≈ 46 %, mayfly 22, dragonfly 18, caddis 6, crayfish 3, clams 3, no zooplankton listed** (Cooper; FSD). Lake Sinai adults: Daphnia in 87–90 % of stomachs. > 5 cm switch to the bed when zooplankton runs low (Wu & Culver) | species.js:297: `Lzoo` 25, so every perch < 25 cm can eat zooplankton; `Lpisc` 14. Bed or open water chosen by the t ∝ f⁴ share (fish3.js:1647). r8O summer diet: **zooplankton 54–94 % in June–July** of year 1 (33–63 % in August), 21–62 % in year 2; fish and young 2–49 % (peaks in August–September) | **OFF** (too planktivorous) | (M) Lower `Lzoo` to ~15–18 cm: Cooper's ≥ 16-cm Maine perch ate no zooplankton. Much of the excess also comes from the environment's early-summer zooplankton (120–550 µg/L against the field's 60–100) |
| 11 | Feeding times | Diurnal: 07:00–18:00, little or none at night (Keast & Welsh; Scott & Crossman). Under ice, by day | `nonVis` 0.2 (fish3.js:286), so ~20 % of the day rate at night. PRED3 `other` hunting share at night 0.05 (fish3.js:478) | OFF (small) | (L) `nonVis` ~0.05. Give perch their own PRED3 row with act [0.3, 0.3, 0] (KPP: "yellow perch should not hunt fish at night") |
| 12 | Piscivory | Relatively uncommon in the lab: 1 minnow per 35 h per perch (Paszkowski & Tonn 1994). Maine 16–35 cm: 46 % fish by volume, mostly white perch (~17) and yellow perch (~11). Should take more young perch and white perch than killifish (KPP) | r6M: 32,776 followed fish a year (94 % < 10 cm), 6,691 of them killifish. Young eaten: white perch 12.4 M, sucker 6.5 M, perch 5.0 M, sunfish 4.9 M | OK | — |
| 13 | Growth (age 1+) | Maine: "normally 6–12 in". The human: "the perch are small". Stunted NS: 77, 92, 108, 125 mm FL at 1+–4+. Michigan 8.4, 13.2, 16.5, 19.1 cm. Perch need ≥ 13.5 °C to grow (Boussion 2025, FWM §1) | vb Linf 35, k 0.2; founders at 0.8 of that curve (species.js:292; fish3.js:286). FB4 Kitchell adult set. Mean length rises 13.3 → 13.6 → 14.7 → 16.1 cm (start → year 3 June) while numbers fall. Adults also grow slightly under the ice (16.0 → 16.3 cm, October → March) | **OFF** (getting bigger, not small) and UNKNOWN (no length-at-age output) | (H, diagnostic) Add length-at-age and size-class tallies to the GPU year runner. (M) After items 22–24 and 29, judge against "small" (≥ 60 % 7.5–12 cm). Cold growth: see item 22 |
| 14 | Condition | No Maine data | K 0.87–0.89 September–March, 0.95–1.0 in early summer. Late-summer ration p 0.15–0.18 (year 1), 0.26–0.28 (year 2) | UNKNOWN | (L) Field late-summer p is 0.3–0.6 (WPR §7.1), so the perch are underfed in autumn |
| 15 | Maturity | Males 2–3 yr, females 3–4 yr, at ~17–23 cm normally. Stunted: age 2 near 9.5 cm (CPE Q3) | species.js:293: Lmat 14 / LmatM 10, earliest age 1.5 yr. PMRN slope 0.12/yr down to 0.7 × Lmat | OK | — |
| 16 | Fecundity, GSI, gonad timing | 3,035–61,465 eggs at 131–257 mm FL; mass average ~23,000. Female GSI 16–26 %. **Ovaries grow from autumn through winter** (gonads need 145–175 days at 4–10 °C; CPE Q4) | fec 0.3487·L^3.4556 (25 cm → 23,600), gsiF 0.20. Gonads fill from **any** surplus as soon as the fish is mature (fish3.js:1616 `_energetics`, REPRO_ALLOC 0.5), so right after the May spawning | OK / **OFF** (timing) | (M) Allocate to gonads from ~yf 0.5 (late August) through the winter, not in early summer. Summer surplus then goes to growth, and females pay the ovary's winter cost (a real winter-condition mechanism) |
| 17 | Spawning time and temperature | 7–13 °C, peak 9–11 °C, April–May, just after the pickerel; night and early morning | spawnT [7, 12], SPAWN_LEAD 2 °C (species.js:510). r8O year 2: spawnings from ~May 3 (surface 5.6 °C) to ~May 17 (9.2 °C) | OK | — |
| 18 | Spawning site | Strands on woody debris and plants; 1.0–3.7 m (HSI). **Tea-coloured lakes: 76 % of masses at 0–1 m** (Huff 2004) | SPAWN3 (fish3.js:369): bed 0.5–2.0 m, 0.3 m off the bed, `sub: 'rigid'`, bare-bed hatch 0.47 (Ward & Barnes) | OK | — |
| 19 | **Egg incubation** | 8–10 days, up to 27 days at 8.3 °C; yolk absorbed over ~5 days (Scott & Crossman, CPE Q4) | `_spawn` makes a swim-up school at Lhatch the moment the eggs are laid (fish3.js:1989 → `_mkYoy`) | **MISSING** | (M) Hold the eggs (and the hatch) over a degree-day incubation. The larvae now start feeding 2–4 weeks early, adding to the young's oversize (item 22) |
| 20 | YOY habitat | Hatch at 5.5–6 mm in the littoral, limnetic within 2 weeks, back to the littoral at ~25 mm after ~40 days (Swindoll; Dembkowski). Age-0 on the bottom by day and up at night (Seďa 2010) | Young schools follow the richest zooplankton about them (`_yoyTarget`, fish3.js:2249). Onto the bed at 2.5 cm (FRY.BENTH_L). No forced limnetic phase, no diel vertical move | OK | (L) Diel vertical migration of the young |
| 21 | YOY diet | Nauplii and copepods → cladocerans → benthos at settling | Larval ladder (rotifers and nauplii → Daphnia), then bed food from 2.5 cm | OK | — |
| 22 | **YOY growth** | Field ~6.6–8.1 cm by fall in productive lakes. Northern and stunted lakes: 3.6–4.8 cm (FL) at 0+ (CPE Q2). Michigan's state-average **age-1** is 8.4 cm. **No growth below ~13.5 °C** (Boussion), i.e. October to mid-May in Québec | r8O: 7.0–7.5 cm by mid-September and 8.8 (year 1) / 7.9 (year 2) by mid-November. **9.6–10.2 cm at the spring recruitment.** The mean rises ~1.5–2 cm under the ice. FB4's juvenile set (CTO 29) gives positive growth at 1–4 °C on bed food (~0.2–0.7 %/d at full ration, derived) | **OFF** | (H) First confirm in a CPU probe (per-school q.L over a winter) that this is growth, not survivor bias. Then: no somatic growth below ~10 °C for the perches' young (the HSI "growth begins at 6–10 °C"; Boussion 13.5) — a cold-feeding cut like the bullhead's `cold.quiet`. Add egg incubation (item 19). Today the young beat WINTER0's 50–80-mm thresholds, so the first winter never regulates them |
| 23 | YOY summer survival | Oneida age-0 Z ≈ 0.035/d (18 mm → fall). Late summer age-0 density: Nebish 7,500/ha in October; Oneida's Daphnia vanish above 14,000/ha in August | r6M: 71.4 M hatched → natural 51 %, eaten 18 %, recruited 0.2 %. Late August 1.45 M (2,260/ha), mid-November 0.62 M | OK | — |
| 24 | **First winter** | Size-dependent starvation: 60.7 mm → 76 % die, 71.4 mm → 42 %, ≥ ~70–85 mm low (Post & Evans via Eckmann; FWM §1). Perch survive to 0.3–0.4 mg/L under ice and move to oxygenated water (Cooper & Washburn). Hot Brook supports a principal white perch fishery, so it is not a winterkill lake (FSD §2) | WINTER0 k [1.04, 0.87] → 50–80 mm (config.js:452). Never bites: the young are ≥ 79 mm. Instead **hypoxia kills the young**: 6–26 % a fortnight from mid-January to April. Year 2 cumulative ≈ 73 % of the young perch (r8O, days 602–686), while Upper's bottom O₂ read 3.4–9 mg/L. The young's lethal level is 0.35 mg/L, so they are sitting in near-anoxic cells | **OFF** | (H) Find where the young die (Lower's deep spot? the bed layer?) and why they don't leave. The GPU `y_target` only escapes when the young's own cell is below o2Crit. Hazard `y_mort` uses `Y_yo2` (wgsl.js ~1783). Fix the growth (item 22) so the size ramp, not hypoxia, does the culling |
| 25 | Adult mortality | Total natural A ≈ 35–60 %/yr (Z 0.45–0.9), up to ~70 % where small and slow. Fish predation 15–35 %/yr at 7.5–15 cm, falling above ~18–20 cm. Birds +5–10 % (PDM §7.1). maxAge 9–11 | M 0.50. Background = M × BIOE.M_OTHER 0.5 × (L/20)^−0.87 → 0.25–0.32/yr. maxAge 11 (hard cliff). **Year 2 (r8O): eaten 116.6 k (≈ 45 % of the mean stock), other 85.6 k (≈ 33 %), starved 8.4 k → A ≈ 0.8.** Year 1 eaten 77.6 k ≈ 23 % | **OFF** (year 2) | (H) The decline: count 1.05 → 0.70 → 0.49× of the census by June of year 3, with 74 k recruits against 210 k deaths. Fix the young's winter first (item 24). Then if predation holds at > 35 %/yr, review the predators' size window: 70 % of eaten perch are 10–20 cm. (L) Replace the age cliff with a rising hazard past ~8 yr |
| 26 | Predators | Maine: the pickerel's first-named prey. Bass: perch the most common fish (Ontario). Cooper's Maine summer stomachs (white-perch lakes): pickerel 7.5 % yellow perch by volume (14 of 92 items), bass 14 %. Target: perch 15–35 % of pickerel fish mass (PDM §7.1) | r6M pickerel kills: perch 40.7 k of 192 k (21 % by number). Bass 7.9 k of 90 k (8.8 %). Also white perch 10.2 k, perch cannibals 8.0 k, fallfish 7.5 k. Eaten over ≥ 2 m 39 %, 1–2 m 27 %, < 1 m 33 %; 82 % at cover < 0.1. School terms (fish3.js:1761): esocids meet a school as n^0.65; bass × n^−0.8 per fish; perch-like × 0.15 | OK (pickerel), OFF (bass low) | (M) The bass's school term: per-capita risk ∝ n^(a−1) with a ≈ 0.3–0.5 for bass (PDM §7.2), but n^−0.8 gives a = 0.2 (an 80-fish school is ×0.03 per fish). Use n^−0.6. (L) Count dispersed night schools as singles |
| 27 | Thermal | Preferred 18–24 °C (adults 22.5 at 25 °C acclimation). UILT ~29–32 °C. Growth optimum ~22–25 | tPref 20, uilt 30, FB4 CTO 23 / CTM 28 | OK | — |
| 28 | O₂ | Avoid < 2 mg/L. Growth falls at 2. Under-ice lethal ~0.3–0.4 mg/L (Cooper & Washburn) | o2Crit 0.26 × 9.5 = 2.5 mg/L. o2Lethal 1.0 at 25 °C, floor o2Ice 0.35 | OK | — |
| 29 | Density, biomass, size | Census 500/ha (300–700), ~60 % 7.5–12 cm, few ≥ 15. The human: small, and fewer than fallfish and bass (catch-based). Soft-water Crystal and Nebish 230–240/ha | r8O: 525/ha → 312/ha → 244/ha (year 3 June). 22.9 → 19.5 kg/ha. Mean length 13.6 → 16.1 cm. Bass 5.6 and fallfish 0.9 kg/ha | **OFF** (trend and size; the rank is the other species' problem too) | Items 22, 24, 25 |

---

## 2. White perch (`whiteperch`)

| # | Aspect | Real (source) | Sim (where, value) | Status | Priority and fix |
|---|---|---|---|---|---|
| 1 | **Summer day habitat** | Open water over level fine sediment; avoids cover; depth is its daytime shelter: 4.0–9.0 m by day in summer in deeper lakes (Stanley & Danie 1983, a compilation, not telemetry). For a 3–6 m mixed lake: "the deepest open bottom" [inf] (SFH-W §1). Maine anglers: "the deep hole near the outlet". **The human catches mostly white perch at Upper's shallow stream end.** Cooper: densest in shallow lakes | fish3.js:303: day bed **3.5–5.5 m**, 1 m off the bed. `habJ` 8–12 cm: 2.4–3.6 m, so every fish ≥ 12 cm uses the deep band. r6M by day: **89–90 % over ≥ 2 m** (pickerel 13 %, bass 32–33 %). Measured on the true geometry: Upper's water within 300 m of the brook averages 2.15 m (18 % ≥ 3.5 m); the deep basin starts ~300 m from the brook | **OFF** (likely too deep and too exclusive for tea-coloured, 5.5-m lakes) | (H) Wait for `white_perch_habitat_and_predation.md`. Candidate code: (a) a light-based (isolume) or wider band, ~2–5.5 m, letting food decide; (b) a twilight band at the 1–3 m weed edge, where pickerel (dawn and dusk peaks) and bass hunt. In coloured water (Kd ~0.5), 2–3 m is already as dim as 4–6 m in clear lakes [inf] |
| 2 | Night | ~0.9–1.2 m flats inshore; feeding (SFH-W) | Night 0.5–1.5 m, mid-column (v 1, h 0.5), activity 0.6 | OK | But the predators rest then (PRED3 act 0.02–0.05), so the flats are safe: item 23 |
| 3 | Twilight feeding peak | Feeds day and night but more in low light: dusk, dawn, overcast days; a dusk surface-feeding sight in Maine (MDIFW; NJ) | `nonVis` 0.25, K_I 0.5 lx (fish3.js:571). PRED3 `other` act [0.3, 0.3, 0.05], the same as yellow perch. So the sim's white perch feed mostly by day, like perch | **OFF** | (M) White perch's own PRED3 row (e.g. act [0.15, 0.4, 0.15]) and `nonVis` ~0.5, or a crepuscular feeding boost |
| 4 | Autumn | Gather in shallow weed edges in late fall, then the nearest deep basin by midwinter (NJ; H3D §11) | No autumn phase | MISSING | L |
| 5 | Winter | Active and feeding all winter in large, compact, roaming schools. The deepest hole of shallow lakes: Horseshoe L., ME 6.1 m; ponds 4.6 m. A midwinter slump and a March rebound with O₂. **H3D: Upper ≥ 3.9, Lower ≥ 3.3** | Winter bed 3.9–5.5 m, 1 m off the bed, activity 0.5. In **Lower, bed ≥ 3.9 m is 0.9 % of the area**, so the same crowding and constant "trip" as perch item 7 | **OFF** (Lower) | (M) Lake-relative bands (as perch item 7) |
| 6 | Schooling | Schools from youth to adulthood; size unmeasured (50–200 inferred); "groups of hundreds" at spawning; ~15-min residence under ice | 80-fish school agents, size-sorted merges; fish ≥ ~20 cm solo | OK | — |
| 7 | Movement and the brook | Summer moves local. **"Large spawning runs in the major inlet and outlet streams"** (Cooper p. 25); "heavy spawning runs … in streams" (MDIFW 2002). Migrating fish pinned on an outlet screen in February (Cooper p. 122) | MOVE3 `settle` 0.15/yr, any season. SPAWN3 (fish3.js:371) has **no brook site** | **MISSING** (runs) | (M) A share of ripe white perch (e.g. 10–30 % near the brook) spawns in the brook's lower runs and mouths at 14–20 °C, like the suckers' run but in late May–June, at dusk. The connecting brook is "rocky and hard-bottomed"; eggs fall "on gravel bottom in shallow water" (Cooper) |
| 8 | **Diet by size (adults)** | **Adults ≥ 15 cm (Maine, n = 1,252): bed animals 67 % (mayflies 44 %), fish 26 %, plankton crustaceans ~6 % by volume, 0–98 % by lake** (Cooper; FSD §6). Daphnia only above ~20/L (Couture & Watzin). Lake George ME: mainly Cladocera. Midge larvae from ~10–12 cm (Feiner; Zuerlein) | **Code default: `diet.plankton` true, `Lzoo` 40** (species.js:349, 603), so adults are planktivores at every size. The runs override this by URL (plank 0, Lzoo 10): summer diet bed 51–86 %, young 6–61 %, zooplankton 1–7 % | **OFF in code** (OK in the runs) | (H) Commit the change rather than leaving it in the URL. Better than "off": `Lzoo` ~10–12 cm and, for adults, zooplankton only at high density (a white-perch K_ZOO ~2–3× F3.K_ZOO 60). That reproduces the June Daphnia pulse use and the lake-to-lake 0–98 % |
| 9 | Piscivory | Fish 26 % for ≥ 15 cm (yellow perch 10 %, smelt 9 %, white perch 3.8 %). 20–50 % in fast-growing lakes. Bay of Quinte ~35 % at 178 mm, ~70 % at 216–254. Big fish eat their own young (MDIFW). On killifish schools: dilution, **no confusion** (Morgan & Godin 1985) | Lpisc 15. r6M: 40.9 k followed fish a year (88 % < 10 cm, 18 k killifish, 10.2 k yellow perch). Young: own 12.5 M, sucker 5.8 M, perch 4.9 M. Summer diet "young" 27–61 % in July–September | OK (high in late summer) | (L) Into-school factor: × 0.15 (confusion) → dilution only (KPP) |
| 10 | Growth (age 1+) | Cooper (1940, southern Maine): TL ≈ 12.4, 15.5, 18.6, 20.8 cm at ages 2–5, 25.7 at 9. MDIFW: 8–10 in at ~4. Stunting extreme: 4 in at age 6. **Scale growth only from early July to early–mid September** (Cooper p. 154) | vb Linf 30, k 0.3, t0 −0.5 (11, 15.8, 19.5, 22.2 at 1–4: Cooper's faster lakes), founders at 0.85. r8O year 1: mean length 14.6 (31 May) → 16.2 cm (28 Aug), mostly mid-June to mid-August; 16.4 → 17.0 cm October → March | Partly OFF (season ~3 weeks early, some winter growth) and UNKNOWN (no length-at-age) | (M) Gonad timing (perch item 16) and the cold cut (item 13) would move growth into July–August. Add the length-at-age tally |
| 11 | Condition and ration | Late-summer p 0.3–0.6 normal (WPR §7.1). Crowding slows growth; it doesn't kill adults (WPR §3) | K 0.85 (autumn year 1), **0.82–0.84 (autumn year 2)**. p 0.14–0.16 in September (year 1), 0.24–0.26 (year 2). **Adults starved: 10.3 k (year 1), 38.2 k (year 2)** | OFF | (M) The adults' food in autumn: the zooplankton collapses (Upper 8–26 µg/L August–October) and the bed is shared with suckers and young (Cooper: suckers compete directly). Check the mayfly and midge bed food offshore against Cooper's ~5 g/m² |
| 12 | Maturity | Males 72–80 mm, females 90–98 mm, ages 2–4. Small, slow fish still mature (MDIFW) | Lmat 9.5 / LmatM 7.6, earliest age 1.5 yr | OK | — |
| 13 | Fecundity, GSI | ~22,000 eggs at 152 mm (MDIFW); 20,000–300,000. Tiny eggs: ~550 eggs/g, ~5× yellow perch per gram | fec 10.6·L^2.82 (15 cm → ~22,000). gsiF 0.15 and gsiM 0.05 (prior). Gonads fill straight after spawning, as for perch | OK / OFF (timing) | (M) As perch item 16 |
| 14 | Spawning time and temperature | ~15 °C (MDIFW); **18–21 °C held several days in Maine lakes (AuClair 1956)**; 11–16 (Ontario). May–June, most intense in June (NY). Egg release over 10–21 days, peaks at dusk and after rain | spawnT [14, 20]. r8O year 2: spawnings ~late May to mid-June (surface 15–20 °C) | OK | (L) Dusk peaks |
| 15 | Spawning site | 0–1.5 m in lakes over any bottom, or up streams. Groups of hundreds | SPAWN3 bed 0.3–1.5 m, 0.3 m off the bed, no structure | OK | (M) Streams: item 7 |
| 16 | Egg incubation | 4–5 days at ~15 °C (MDIFW). "Year-class failures come only from weather at spawning" | Larvae appear at spawning (no egg stage) | MISSING | (L–M) As perch item 19. An egg stage also gives the weather a handle (cold snaps, storms) |
| 17 | YOY habitat and diet | Juvenile nurseries inshore; lakes 2.4–3.6 m. Young take Daphnia from ~2–3 cm and **switch to the bed at ~4 cm** (Prout; Harris; WPR §7.2) | Young follow zooplankton. Bed food from **2.5 cm** (FRY.BENTH_L; no `benthL` in BIO) | **OFF** | (M) White perch `benthL` 4.0 (WPR §7.2 #2): this removes their early access to the bed while other species' young starve in the midsummer zooplankton collapse |
| 18 | **YOY numbers** | Late-summer age-0 300–3,000/ha [inf]; western Lake Erie 1,600–3,000/ha, ±100× between years. **Cooper's seines: young yellow perch outnumber young white perch ~4:1 in the shallows** (weak evidence: the young white perch may be offshore) | r8O late August: **6.2 M (≈ 9,600/ha) in year 1, 5.9 M (≈ 9,200/ha) in year 2**: ~4× the young yellow perch (2,000–2,300/ha). r6M: 121.9 M hatched → natural 73 %, eaten 25 %, recruited 0.2 %, capped 0.4 % | **OFF** (3–30× too many) | (M) White perch `benthL` 4 cm (item 17), an egg stage, and their own first-winter rule (item 20) are the levers. `sHatch` 0.05 is a prior |
| 19 | YOY growth | **4.5–7.5 cm in September, mean ~6** (WPR §7.1). Maine age-0 at ice-on mostly 45–65 mm (WPR §2) | r8O: 5.7–6.2 cm mid–late September (OK), then **7.6 (year 1) / 7.0 (year 2) by mid-November and ~8.0–8.8 by March** | **OFF** (autumn and winter growth) | (H) As perch item 22: no growth below ~10 °C. At ~6.5–7 cm at ice-on, WINTER0 would kill ~40 % (k [1.04, 0.87], 208 winter days, derived) — the compensatory brake the research ranks first |
| 20 | **First winter** | Size-dependent starvation: Johnson & Evans 1990, starved at 4 °C, all < 50 mm FL died, half at 57, a tenth at 72. White perch's routine metabolism is higher than yellow perch's, so their threshold per winter-day should be **higher** and colder water harsher (Johnson & Evans 1991; FWM §2). Bay of Quinte and Lake Ontario losses in cold winters | WINTER0 k is **the same as yellow perch's** [1.04, 0.87]. Never bites (young ≥ 76 mm). Under-ice **hypoxia 6–21 %/fortnight** (January–April). The higher winter metabolism is not represented (species.js:339 flags it) | **OFF / MISSING** | (H with perch item 24) Fix the growth and the hypoxia. Give white perch k slightly above perch's (e.g. [1.1, 0.95]) or a cold-respiration multiplier (~1.3–1.5× below 6 °C; prior), or use J&E 1990's own form (FWM table: p = 7.29543·e^(0.02145·WD₄ − 0.10804·FL)) |
| 21 | **Recruitment and the cap** | Numbers held by first-year survival, biomass by food (WPR §3). No census cap in nature | F3.CAP 1.5× the census (fish3.js:201). r8O: **64.2 % (year 1) and 61.0 % (year 2) of the overwintered young discarded at recruitment**. White perch sit at 1.42–1.49× the census | **OFF** (the cap is the regulator, as in FINDINGS 2026-10-19) | (H) After items 17–20 and 23, run an arm with CAP 3 as a diagnostic. The target is 15–35 kg/ha with the cap never binding |
| 22 | Adult mortality | Cooper's ages: A ≈ 0.15–0.35 at ages 5–9 and ~0.5 from 9 ("a considerable per cent live to 8–10"). Ages 1–2: A 0.50–0.65. Predation on adults ≲ 5–10 %. Angling 2–8 % (WPR; FSD §6) | M 0.45 → background 0.225 × (L/18)^−0.87. maxAge 12 (cliff). r8O year 2: eaten 62.3 k (≈ 17 %), other 108.3 k (≈ 30 %), starved 38.2 k (≈ 10 %) → A ≈ 0.55 including the age-1s | OK overall | (L) An age-rising hazard past ~8–9 yr in place of the cliff. Check the adults' share once the length-at-age tally exists |
| 23 | **Predators** | **Maine, white-perch lakes (Cooper 1941, summer): pickerel 32–64 cm ≈ 95 % fish, white perch 54.7 % by volume (28 of 92 items); smallmouth 22–54 cm 80 % fish, white perch 61 %.** Target white perch 5–20 % of pickerel fish mass (PDM, older; Cooper says more). A size refuge from pickerel above ~15–17 cm | r6M: pickerel kills 18.6 k white perch of 192 k (**9.7 % by number**). Bass ≤ 4.9 k of 90 k (**≤ 5.5 %**). Pickerel strike weight 20 % of encounters with white perch (46 % takeable). Bass 14 % (24 % takeable). Why, in code: (a) 89–90 % of day-blocks over ≥ 2 m, against the pickerel's 0.5–2.5 m and the bass's shore band; ENC_DZ 0.3 m counts prey only over the predator's own depth ±0.3 m (fish3.js:114, stageR5); (b) at night on the predators' flats while PRED3 act is 0.02 (pickerel) / 0.05 (bass); (c) bass × n^−0.8 per fish in an 80-fish school (×0.03); (d) CS3 [0.3, 0.4, 0.25] × spiny ppr0 0.6, depthR 0.30 (a 30-cm bass takes ≤ 11.5 cm, a 35-cm pickerel ≤ 15.2 cm) | **OFF** (the most-cited Maine diet fact) | (H) The habitat agent's note for (a) and (b): a twilight weed-edge phase, and a shallower band in coloured water. (M) (c) bass n^−0.6 (PDM §7.2: a 0.3–0.5). (L) (d) CS3 white perch relative to killifish is ~0.43 against PDM's 0.5–0.7: raise to [0.4, 0.45, 0.3]. Judge on ≥ 3 seeds: white perch ≥ 30 % of pickerel and bass fish prey by mass |
| 24 | Thermal | Final preferendum 28.9–30.6 °C, tracking acclimation (~5 °C in February). Avoids < 9.5 and > 34.5 °C. Does best where summers reach ≥ 24 °C | tPref 28, tempOpt 27, uilt 33. FB4 = the yellow perch set (CTO 23, CTM 28) | OK (Hot Brook peaks at 24 °C) | (L) Flagged in species.js:339 |
| 25 | O₂ | Avoids < 35 % saturation (~3–4.6 mg/L). Needs O₂ in the deep water in winter (MDIFW). Hypoxia-sensitive young (Hanks & Secor) | o2Crit 0.45 × 9.5 = 4.3 mg/L. o2Lethal 1.2, o2Ice 0.5 (priors) | OK | — |
| 26 | Density and biomass | **15–35 kg/ha (centre 20–25), 250–750/ha ≥ 7.5 cm, mean 40–80 g, ± 30–50 % between years** (WPR §7.1). Census 450/ha (FISH_CENSUS). Maine statewide ~21 kg/ha, ~80 g | r8O year end 34.5 → 35.8 kg/ha. **Summer peaks 39–43 kg/ha** (late August: 38.9 kg/ha at a mean ~95 g in year 1; 42.9 at ~76 g in year 2). 640/ha at year end. Held by the cap (item 21) | **OFF** (top of range only because of the cap; summer above it) | Items 17–23 |

---

## 3. What the latest runs show (r8O_613; r6M_613 for the end-of-year tallies)

One seed, so treat this as evidence for direction only. CLAUDE.md requires ≥ 3 seeds before judging; arm O continues on 611 and 612.

| Measure | Year 0 → 1 → 2 (r8O) | Target | Verdict |
|---|---|---|---|
| White perch kg/ha (year end) | 30.7 → 34.5 → 35.8 (summer peaks 38.9, 42.9) | 15–35, centre 20–25 | High: summer above the range |
| White perch fish ≥ 7.5 cm | 290 k → 411 k → 406 k (≈ 640/ha; 1.42–1.49× the census) | 250–750/ha; cap not binding | **Cap-bound** |
| White perch young discarded at the cap | 64.2 % (year 1), 61.0 % (year 2) | 0 | **OFF** |
| Yellow perch kg/ha | 19.9 → 22.9 → 19.5 | "small, fewer than fallfish and bass" (bass 5.6, fallfish 0.9 in year 2) | — |
| Yellow perch count | 322 k → 337 k → 201 k → 157 k (June of year 3; 0.49×) | ~500/ha (300–700), stable ± 30–50 % | **Declining** |
| Yellow perch mean length | 13.3 → 13.6 → 14.7 → 16.1 cm | small (≥ 60 % 7.5–12 cm) | **OFF** (rising) |
| Yellow perch annual loss | year 1: eaten 23 %, other 26 %. Year 2: eaten 45 %, other 33 %, starved 3 % | A 35–60 % (predation 15–35 %) | **OFF** in year 2 |
| Recruits (spring) | white perch 235 k, 204 k. Yellow perch 186 k, 74 k | replacement | yellow perch short |
| Young in late August | white perch ≈ 9,600/ha. Yellow perch ≈ 2,260/ha | white perch 300–3,000/ha. Cooper's shallows: yellow perch 4× white perch | **OFF** (white perch) |
| Young length, mid-September | white perch 5.7–6.2 cm. Yellow perch 7.0–7.5 | white perch 4.5–7.5. Yellow perch ~6–8 (northern 4–7) | OK |
| Young length, mid-November → spring | white perch 7.6 → 8.8. Yellow perch 8.8 → 10.2 (year 1) | ≈ no growth below 10–13.5 °C. Yellow perch age-1 ~8.4 cm (Michigan average) | **OFF** |
| Young's first winter | hypoxia 6–26 %/fortnight January–April (yellow perch ~73 % cumulative in year 2). WINTER0 ≈ 0 | size-selective, ~40–75 % at 60–70 mm. Not a winterkill lake | **OFF** |
| Adult ration p and condition K (September) | white perch p 0.14–0.26, K 0.82–0.85. Yellow perch p 0.15–0.28, K 0.87–0.89 | p 0.3–0.6 | Low |
| Adults starved | white perch 10.3 k, 38.2 k. Yellow perch 4.2 k, 8.4 k | crowding slows growth more than it kills | white perch high in year 2 |
| Summer diet, white perch ≥ 15 cm (with the URL override) | bed 51–86 %, young 6–61 %, zooplankton 1–7 % | bed 67, fish 26, plankton 6 (Cooper) | OK, but **not in code** |
| Summer diet, yellow perch | zooplankton 54–94 % (June–July, year 1), 21–62 % (year 2) | ≥ 16 cm: fish 46 %, insects ~46 %, no zooplankton (Cooper) | **OFF** |
| White perch in pickerel kills | 9.7 % by number (r6M) | 55 % by volume (Cooper) | **OFF** |
| White perch in bass kills | ≤ 5.5 % (≤ 4.9 k of 90 k) | 61 % by volume (Cooper) | **OFF** |
| Yellow perch in pickerel and bass kills | 21 % and 8.8 % | 7.5 % and 14 % by volume (Cooper); 15–35 % of pickerel fish mass (PDM) | OK |
| By day over ≥ 2 m | white perch 89–90 %, yellow perch 72 %, pickerel 13 %, bass 32–33 % | white perch should overlap the predators at least at twilight | white perch segregated |
| Stomachs empty by day | white perch 35 %, yellow perch 22 % | yellow perch: 5 % empty in summer (Lake Madison), 28 % in winter (Eurasian perch) | OK |
| Upper bottom O₂ late March | ~7.7–9 (year 1); **3.4–4.9 mg/L (year 2)** | stays adequate (white perch fishery) | watch (environment) |

---

## 4. Prioritized fixes

### High
1. **The first winter must regulate both perches, and today nothing but hypoxia and the cap does.** (Perch items 22 and 24; white perch items 19–21.)
   - **(a) Confirm the young's late-season and under-ice growth.** Use a CPU probe tracking each young school's L from September to April at true scale. If it is real growth: stop the young's somatic growth below ~10 °C, a cold-feeding cut for the perches' young like the bullhead's `cold.quiet`. Evidence: HSI "growth begins at 6–10 °C"; Boussion "≥ 13.5 °C"; Cooper's growth window July to early September.
   - **(b) Find the under-ice hypoxia that kills 6–26 % of the young a fortnight.** Locate the cells (Lower's deep spot? the bed layer?) and make the young leave sub-critical water before it is lethal. The GPU `y_target` escapes only when the young's own cell is below o2Crit; `y_mort` uses `Y_yo2`.
   - **(c) Give white perch their own, harsher WINTER0 k**, or J&E 1990's form (FWM).
   - **Check:** white perch age-0 at ice-on 45–70 mm and ~30–60 % lost over winter; yellow perch ~40–75 % lost at 60–70 mm; hypoxia ≈ 0 in a year whose lake-mean O₂ stays above 3 mg/L.
2. **The census cap is still the white perch's regulator** (61–64 % of each spring's recruits discarded). Once item 1 is in, run a diagnostic arm with F3.CAP 3. The target is 15–35 kg/ha with the cap never binding.
3. **White perch escape their predators** (≤ 5.5 % of bass kills, ~10 % of pickerel kills, against Cooper's 61 % and 55 %). The day band (3.5–5.5 m, 89–90 % of days over ≥ 2 m), the nights on the predators' resting flats, ENC_DZ, and the bass's school term together keep them out of reach.
   - Apply `white_perch_habitat_and_predation.md`: a shallower or light-based day band in coloured 5.5-m lakes, and a twilight weed-edge phase. Weak support: the human catches mostly white perch at Upper's shallow stream end.
   - Then the bass's school exponent: n^−0.8 → n^−0.6 per fish (PDM §7.2).
   - **Check (≥ 3 seeds):** white perch ≥ 30 % of pickerel and bass fish prey by mass; killifish, sunfish and bullhead shares falling.
4. **Commit the white perch adults' diet.** Arms L–O carry it only as a URL override (plank 0, Lzoo 10); species.js still has `diet.plankton` true and `Lzoo` 40.
   - Set `Lzoo` ~10–12 cm and let adults take zooplankton only at high Daphnia density (a white-perch K_ZOO ~2–3× 60 µg/L), not never (Cooper 0–98 % by lake; Couture & Watzin ~20 Daphnia/L).
   - Put it in `stageR5` or in species.js so the default matches what was validated.
5. **The yellow perch decline** (count 0.49× by year 3; year-2 loss ≈ 80 %, recruits 74 k against 210 k deaths). This follows mostly from item 1 (the young's winter).
   - After item 1, if predation still exceeds 35 %/yr at 7.5–15 cm, review the predators' size window (70 % of perch eaten are 10–20 cm) and whether M_OTHER's half of M is still "unsimulated" now that predation is explicit.
6. **A length-at-age and size-class tally in the GPU year runner** (both perches). It is needed to judge stunting against Cooper (white perch 12.4 / 15.5 / 18.6 / 20.8 cm at ages 2–5), the human's "perch small" (≥ 60 % 7.5–12 cm) and Michigan (8.4 / 13.2 / 16.5 / 19.1). Without it neither species' growth can be judged.

### Medium
7. **Lake-relative bands for Lower** (perch item 7; white perch item 5). Lower has ≥ 3.9 m on 0.9 % of its area, so the winter bands crowd Lower's perches onto ~2.5 ha and keep them "travelling". Use H3D's per-lake bands: white perch day 3–3.9 and winter ≥ 3.3; perch day 2.8–3.9.
8. **Yellow perch adults too planktivorous** (54–94 % zooplankton in early summer). Lower `Lzoo` 25 → ~15–18 cm (Cooper's 16–35-cm perch ate none).
9. **White perch young's bed food from 4 cm** (`benthL` 4; WPR §7.2). Also check the young's 9,600/ha in late August against 300–3,000/ha.
10. **Gonads grow in autumn and winter, not right after spawning** (perch item 16; white perch item 13). REPRO_ALLOC from ~yf 0.5. Moves somatic growth into July–August (Cooper) and adds the ovary's winter cost.
11. **Egg incubation** for both perches: a degree-day egg stage (perch 8–27 days, white perch 4–5 days at 15 °C). Today larvae feed from the day of spawning.
12. **Diel feeding by species.**
    - Yellow perch by day only: `nonVis` ~0.05; PRED3 act night 0.
    - White perch crepuscular and nocturnal: their own PRED3 row (e.g. [0.15, 0.4, 0.15]) and `nonVis` ~0.5.
13. **White perch spawning runs into the brook** (Cooper; MDIFW): a brook share of ripe white perch at 14–20 °C, spawning at dusk, ~1–3 weeks.
14. **White perch adults' autumn food** (K 0.82–0.85, 38 k starved in year 2): check the offshore bed fauna (mayflies and midges; Cooper's ~5 g/m²) and its sharing with suckers.
15. **Early-ice and late-ice shallow phases for adult yellow perch** (in green weeds at 1.2–2.4 m). This also feeds the pickerel's perch-first winter diet.

### Low
16. An age-rising adult hazard in place of the maxAge cliff (both species; Cooper: low M at ages 5–9, ~0.5 past 9).
17. The autumn phases: yellow perch most mobile; white perch at the weed edges in late fall, then the basin.
18. Schools dispersed at night count as single fish for predators; YOY perch's diel vertical migration; sex-sorted schools.
19. White perch as predators: into-school dilution without confusion (Morgan & Godin), × 0.15 → per-capita n^(a−1).
20. CS3 white perch slightly low relative to killifish (0.43 against 0.5–0.7): [0.4, 0.45, 0.3].
21. White perch's warmer preferendum against the yellow perch FB4 set's 28 °C ceiling (minor in a 24-°C lake).
22. Egg predation (white perch on yellow perch eggs), birds as explicit perch predators (environment review), and grubs (Cooper) are not modelled.

### Already right (keep)
- **Yellow perch:**
  - size-dependent day bands and the dusk inshore move with resting at night;
  - spawning temperature, timing and shallow structure (tea-coloured water);
  - maturity and fecundity;
  - the thermal and O₂ limits;
  - schools sorted by size;
  - autumn settling between the lakes;
  - pickerel's perch share.
- **White perch:**
  - night flats;
  - spawning 14–20 °C on 0.3–1.5-m flats;
  - fecundity and maturity at 7.6–9.5 cm;
  - length–weight (MDIFW 204 g at 9 in);
  - September YOY length;
  - adult diet in the arm-O runs;
  - overall adult mortality.
- **Both:** recruitment as yearlings in spring (`RECRUIT_SPRING`).
