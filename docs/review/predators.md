# Review: the top predators — chain pickerel (`pike`) and smallmouth bass (`bass`)

Reviewed 2026-10-20 for the human's "make sure it's all behaving as it really would in the environment". Scope: every aspect of
the two piscivores of Upper and Lower Hot Brook Lake in the 3-D sim, **with `stageR5()` applied** (the package that will become the
default). Read-only review: no code or existing file was changed.

**What was read.** `src/w3/fish3.js` (S3, MOVE3, SPAWN3, PREY_LR, `stageR5`, PRED3, CS3, `_mode`, `_drive`, `_energetics`, `_feed`,
`_strike2`, `_spawn`, `_mkYoy`, the young-of-year code, `_hazards`), `src/species.js` (BIO and SP for both), `src/config.js` (BIOE, FRY,
WINTER0, BROOD, SPAWN), `docs/HOT_BROOK_3D.md` §4 (items 1–6k), `docs/FISH_CENSUS.md`, the research notes below, and the human's field
observations.

**Runs used.** GPU true-scale seed 613: **arm O** (`r8O_613.txt`, the package through 6j, 5-year run in progress — read to day 756,
i.e. two full years) and the one-year **arms L and M** (`r6L_613.txt`, `r6M_613.txt`, with the end-of-year tallies: who ate whom,
stomachs, depth by day). Item 6k (`F3.YCOLD`) came after arm O. One seed only — single seeds swing; treat run numbers as
diagnostic, not final.

**Probes (scratchpad, not committed).** `predgrow.mjs` (grow one fish a year on the sim's own FB4 sets and cold rules under arm O's
fortnightly p), `maint.mjs` (maintenance p by size and temperature), `gatecap.mjs` (the most a gated bass can eat vs its
maintenance), `juvw.mjs` (small-bass growth with the juvenile-set switch varied), and the existing `probe/bassgrow.mjs`.

**Note handles** (all under `docs/research_notes/` unless stated):
PFF = `Real lake ecology for calibration/piscivore_field_feeding_rates.md` · PEA = `…/piscivore_encounter_attack.md` ·
SHH = `…/smallmouth_horizontal_habitat.md` · JRB = `…/juvenile_refuges_and_bass_young.md` · FWM = `…/first_winter_mortality.md` ·
HAB = `Seasonal fish habitat use/perch_pickerel_smallmouth_pumpkinseed.md` · PWE = `Predator winter energetics/predator_winter_energetics.md` ·
PPD = `Predator winter energetics/pickerel_population_dynamics.md` · PYOY = `Predator winter energetics/pickerel_young_of_year.md` ·
EFS = `Predator winter energetics/esocid_first_year_survival.md` · CPE = `Maine lakes ponds and streams/centrarchid_percid_esocid_parameters.md` ·
BPS = `Fish in streams connecting lakes/bass_pickerel_in_connecting_streams.md` · MCL = `Fish in streams connecting lakes/movement_between_connected_lakes.md` ·
SNN = `Hot Brook populations and water/species_numbers_northern_lakes.md` · FC = `docs/FISH_CENSUS.md` · HB3 = `docs/HOT_BROOK_3D.md` §4 ·
OBS = the human's first-hand notes (memory `hot-brook-field-observations.md`).

**Status:** OK (matches the evidence) · OFF (present but wrong) · MISSING (not modelled) · UNKNOWN (can't judge from the outputs).
**Priority:** H / M / L.

---

## Headline findings

1. **Pickerel do not recruit.** Arm O: 2 recruits a year (target ~4,000–8,500). The young die at the juvenile stage (Z 0.035–0.075/day
   against 0.012–0.025), being eaten in June–July and **starving at 4.5–8 cm** from mid-July, and grow too slowly from August. Year 1
   also loses ~55 % of the founded pickerel, mostly 10–30-cm fish eaten by bigger pickerel. Stock: 16,090 → 4,639 → 2,275 fish (25 →
   3.5 /ha) in two years, mean length 24 → 48 cm. It is heading for extinction on this seed.
2. **Small bass cannot grow, whatever the food: two size-biased mechanisms.**
   - **(a) The hunger gate.** A fixed 1 %BW gate (`S3.bass.G0` 0.01) with the sim's gut evacuation caps intake at ~2–2.6 %BW/d at any
     size. For bass ≤ ~20 cm (Cmax 7–13 %BW/d) that ceiling is **below maintenance**. A 15-cm bass: cap p 0.20–0.27 against
     maintenance 0.48–0.60 in summer.
   - **(b) Whitledge's steep mass exponent.** RB −0.756 applies from 30 g. A 12–14-cm bass is stuck at ~14 cm at p ≤ 0.4, and at
     p 0.5 large bass run away (26 → 39 cm a year).
   - Together these explain both failure modes seen across the arms: big bass over-grow (D2–J), or small bass starve (K–O).
3. **Adult bass feed too little in summer and too much under the ice.** Arm O's monthly p is 0.12–0.25 from June to September and
   0.45–0.73 under the ice, an inverted seasonal shape. On the sim's own set that gives a 26-cm bass **zero length growth** (K 0.96 →
   0.81) against Maine's +4 cm/yr. 4,818 bass starved in year 1 and 2,144 in year 2.
4. **Age-1 bass are eaten as they recruit.** 63 % of the spring recruits (~9.4 cm) were eaten within ~6 weeks (April–May), mostly by
   pickerel (pike>bass ~10,250 a year in arm L). There is no cold-water shelter for small bass. Bass numbers: 40 → 15.6 → 9.5 /ha.
   The stock is now old fish (mean 33–39 cm before recruitment, against the census's ~60 % under 25 cm).
5. **Diets are wrong by prey and by food type.**
   - Bass: bullheads are their top fish prey (18 % of kills), white perch minor, insects ~2 % of food. Field: white perch 61 % and
     yellow perch 14 % (Cooper 1941, Maine); in crayfish-poor water insects 25–40 % (≥ 30 cm) to 50–70 % (15–25 cm).
   - Pickerel: white perch ~10 % of kills against 55 % (Cooper 1941).
   - When fish run short in year 2, crayfish rise to 34–48 % of bass food (target ≤ 10–15 %) where the field says insects should fill
     the gap.

---

## 1. Chain pickerel (`pike`)

| # | Aspect | Real (source) | Sim (file:line, value) | Status | Pri. | Suggested fix |
|---|---|---|---|---|---|---|
| P1 | Summer day habitat | Shallow, weedy. Half of detections at **0.76–1.82 m fish depth** (Milipsigate telemetry); weedy 0.6–3 m water; hovers 0.3–1 m over the bed in weeds; ≈ 5–15 % of the day over beds < 0.5 m (HAB §2; JRB §4) | `S3.pike.hab.day` bed [0.5, 2.5], 0.9 m over the bed, act 0.2 (fish3.js:321). Arm M by day: 2 / 17 / 39 / 30 / 13 % over beds < 0.3 / 0.3–0.6 / 0.6–1 / 1–2 / ≥ 2 m, so 58 % over beds < 1 m (fish ~0.1–0.3 m deep) | OFF (too shallow) | M | Fish depth should sit at ~0.8–1.8 m. Hold `h` as a fish depth, not 0.9 m over the bed (or bed [1.0, 2.5] by day), and let only hunting forays enter < 0.6 m. Check against Milipsigate's half-time band |
| P2 | Night | Stays shallow in cover, ~2 % of intervals active (pike surrogate; HAB §2 Diel) | bed [0.5, 2.0], low in the column, act 0.1; PRED3 act night 0.02 (fish3.js:321, 478) | OK | – | – |
| P3 | Twilight hunting | Dawn and dusk feeding peaks (NY DEC, NJ; pike 22 % / 21 % at sunrise / sunset vs 17 % by day) (HAB; PEA §5) | PRED3 act [0.15, 0.2, 0.02] by sun > 0.3 / > 0.02 / below (fish3.js:478, 1767) | OK | – | Add a "kills by light" tally to confirm |
| P4 | Winter | 0–2.5 m, near shore (80 % within 30 m in December), day-active, feeding at 1–4 °C; ice catch 2.4× summer (MDIFW) (HAB §2) | bed [0.5, 2.5], act 0.1; coldPerf floor 0.55 (fish3.js:321; species.js:668) | OK | – | – |
| P5 | Winter ration | ~0.2–0.4 %BW/d (25–50 % of the pike-set Cmax); somatic mass holds, ovaries grow in winter (PWE Q4) | Arm O year 1: ~2.3 g/day for a ~390-g fish (≈ 0.6 %BW/d), 29–39 % of it young-of-year eaten under the ice; K rises to 0.98 in winter vs 0.94–0.97 in summer | OFF (high; pre-6k) | M | Re-measure with 6k (`F3.YCOLD`), which removes most under-ice predation on the young. Target 0.2–0.4 %BW/d. Route female winter surplus to the ovary (Diana 1983) |
| P6 | Juvenile habitat (8–30 cm) | Young pickerel stay in dense vegetation; pike < 14 cm in stems larger pike can't reach, < 41 cm confined to vegetation (Grimm); 0+ biomass falls with larger-pike biomass (r −0.75 to −0.89) (EFS; PYOY Q4; JRB §3) | **No `habJ` for pike**: every size shares the adults' band (fish3.js:320–321) | MISSING | **H** | Add `S3.pike.habJ` {L [12, 35], bot [0.3, 1.5]} in the weeds, plus a stem refuge from larger esocids: cover from the canopy acts on encounters with a cannibal at full strength while L < 0.6 × cannibal L. See P21 |
| P7 | Young-of-year habitat | Fry cling to plants ~1 week; young in shoreline vegetation ≤ ~1 m, solitary but patch-aggregated, brook mouths a nursery; at night beside stones in 8–13 cm of water (PYOY Q4) | `yCover` 0, off since stage 7h because cover then crowded the young into the few covered spots under the old nearest-school predation rule (fish3.js:311–320). Young target the richest bed (fish3.js:2263) | OFF | **H** | Re-test `yCover` 0.5–0.8 now that predation on the young is by density (FRY.DENSITY 1, stage Y1): the stated reason for turning it off was the old rule. Keep the young in the canopy (fish3.js:2280) |
| P8 | Strike process | Esocid in-bout strikes 1.4–5.8 /h; RD 1.0–1.2 m by day in coloured water; capture per strike: soft-rayed 0.7, perch 0.35, white perch 0.30, sunfish 0.12, bullhead 0.10; no confusion by schools; meal every 2–3 days (PEA; PFF) | aMax 3/h, v 0, strikeR 1.2, CS3 pike column as the research, schoolExp 0.65 (fish3.js:320, 478, 482–483). Ungated (`G0` unset) | OK | – | – |
| P9 | Stomachs | 40–60 % empty in summer; 61 % of full ones hold one item (Diana; PFF (e)) | Arm M: 36 % empty, 47 % 5–25 % full | OK (low end) | L | – |
| P10 | Home range | No pickerel value; pike activity areas < 4.5 ha (radius ~120 m); holds stations in summer (HAB §2) | HOME(40, 120): 120 m at true scale (fish3.js:320) | OK | – | – |
| P11 | Movement between lakes, brook | Summer (June–Sept) excursions out of the lake, days–weeks sojourns in pool and run margins with cover; no stream spawning runs found; none winter in the brook; 5–15 % make excursions, ~2–5 % re-settle (BPS §2; MCL). OBS: pickerel "swim through and seem to hang out" in the brook | MOVE3 pike: settle 0.05, **trip 0.15 at yf 0.13–0.22 (ice-out to mid-May)**, 28 days (fish3.js:357). No summer brook residence | OFF (season) | M | Move the trip window to June–September, with brook sojourns in the pool and run margins (cover, low velocity, `RIFFLE_D`). Keep winter at ~0 |
| P12 | Adult diet | ~85–95 % fish by mass; white perch 55 % of volume in Maine white-perch lakes (Cooper 1941); crayfish ≤ 5 %; odonates the rest (PFF (e); PEA §6) | Arm M (year): fish 59 % + young 35 % = 94 %, cray 3 %. Kills by prey: killifish 24 %, perch 21 %, fallfish 13 %, **white perch 10 %**, bullhead 8 %, sunfish 6 %. Arm O year 2, summer: **cray 10–16 %** | OFF (prey mix; crayfish in year 2) | **H** (white perch) / M (crayfish) | White perch must be reachable at the right time and place. That is the prey's habitat (cross-ref `perches.md` and the white-perch research in progress): twilight passes inshore, juveniles littoral. Crayfish: see B14 |
| P13 | Young-of-year diet | Zooplankton to ~15–20 mm (rare past 40); insects and amphipods dominate 20–80 mm; first fish at 4–6 cm; fish dominate at ~8–10 cm where small fish are plentiful; prey to ~0.5–0.7 of length for elongate prey, ~0.3 for sunfish (PYOY Q1, Q3) | Lzoo 4, yLpisc 5 (species.js:386, 390). The young's fish come through `_yReq`, whose size window peaks at prey/predator 0.19 (`FRY.WIN_R` 5.3, the perch-cannibal fit; config.js:252, fish3.js:2050). Arm M: the young pickerel's year diet besides fish: zoo 57 %, **weeds 2 %**, bed 41 %. Their fish: only ~7k young fish all year | OFF | **H** | (a) An esocid window: peak prey/predator ≈ 0.3–0.4, upper limit 0.6–0.7 for elongate prey (per-species `WIN_R`). (b) Young pickerel in the weeds with the weeds' large insects from ~2.5 cm (P7). (c) Check that the young's bed and weed food is not stripped first by the far larger perch and white-perch cohorts |
| P14 | Feeding level and growth (adults) | Annual food 1.7–2.3 kg for a 40-cm pickerel, p ≈ 0.39–0.42 on the sim's set; summer 1.6–2.5 %BW/d; Maine growth ~17/25/32/38/43 cm at ages 1–5 (PFF §1.3, (e); species.js:382) | Arm O year 1 summer p 0.32–0.41 → probe: 40 → 43.8 cm, 25 → 32.2 cm in a year (**OK**). Year 2 summer p 0.22–0.31, K 0.84–0.85, 691 starved → probe: 40 → 40.0 cm, K 0.92 | OFF in year 2 | **H** | A prey-supply problem: killifish gone, white perch out of reach, perch declining. Fix the prey side (P12) before touching the pickerel's own parameters |
| P15 | Young-of-year growth | Maine: 25–40 mm end of June, 55–75 end of July, 80–105 end of August, **100–130 mm end of September** (MDIFW 4–5 in) (PYOY Q2) | Arm O year 1: 3.5 cm on 1 Jul, 5.6 on 29 Jul, 7.4 on 26 Aug, **8.1 on 23 Sep** | OFF (slow from August) | **H** | Follows P7/P13: the right food in the right place. Juveniles starve at 4.5–8 cm (P18) |
| P16 | Maturity, sex ratio | Maine: age 3–4 at 33–41 cm; ~1.3 females per male (CPE Q3) | Lmat 37 ♀ / 33 ♂, matMinAge 2 yr (species.js:383); sex 50:50 (fish3.js:871) | OK / sex ratio L | L | Optional: 0.565 female |
| P17 | Fecundity, hatch | 22–26.5 eggs/g (Maine); egg → swim-up 5–15 %, central 8–10 % (PPD Q2, Q4) | fec ≈ 24/g (species.js:385); sHatch 0.05 × structure (bare 0.3 → 1) (species.js:383; fish3.js:372) | OK (hatch at the low end) | L | sHatch 0.08 is more central, but egg supply is not the limit (PPD §6) |
| P18 | Young-of-year survival | Swim-up → fall (8–12 cm) **≈ 1–2 %** (larval Z 0.06–0.12/d for 3–4 weeks; juvenile Z 0.012–0.025/d falling with size); fall → age 1 ≈ 0.6–0.8; ~7,000–9,000 fall young needed for the stock (PPD For the sim §2) | Arm O year 2: 341k swim-ups → 6k by ~9 Aug → ~1k by early September (~0.3 %) → **2 recruits**. Fortnight losses after the larval weeks: eaten 18–33 %, **starved 12–38 % at 4.5–7 cm**, natural 6–13 % (juvenile Z ≈ 0.035–0.075/d). Juvenile M is not size-scaled (`FRY.M_JUV_B` 0, config.js:222) | OFF | **H** | P7 + P13 first, then a size-scaled juvenile rate for pickerel (`M_JUV_B` ≈ 0.87–1, per species, as PPD recommends). Judge by the fate audit on ≥ 3 seeds |
| P19 | Spawning: timing, temperature, site | Right after ice-out at 6–11 °C (peak 8–11), flooded vegetation ≤ 1 m, eggs broadcast, no care, several males per female; a population spawns over 7–10 days (HAB §2; CPE Q4) | spawnT [6, 11] + 2 °C lead (species.js:668); grounds bed [0.3, 1.0] on mats, re-chosen each spring by structure (fish3.js:372, 763–782). Arm O: spawning from late April (after ~19 April, yf 0.135) to late May | OK | – | – |
| P20 | Spawning participation | ~90–100 % of mature females spawn each year (PPD Q4) | Arm O: 693 spawnings in year 2 from ~4,600 fish (mean 43 cm; ~1,800–2,300 mature females by inference), and 329 in year 3 from ~2,300 fish → **~30–40 %** | UNKNOWN (likely OFF) | M | Add a "ripe but unspawned at season's end" tally. Check mate-finding at 400 grounds a lake (sites 4 × SITES_MUL) inside the short 4–12.5 °C window |
| P21 | Cannibalism | ~10–30 % of age-0 deaths, 10–30 % of age-1 deaths, ≤ 10–20 % for fish ≥ 20 cm; 2 % of young-of-year stomachs, no adult stomach (grass pickerel); victim ≤ 0.5–0.55 × cannibal (PPD §Cannibalism; PYOY) | Arm M year 1: 8,918 pickerel eaten (66 % 10–20 cm, 29 % 20–30 cm), almost all by pickerel (the only predator with takeable pickerel encounters) — **~55 % of the founded stock**. Year 2: 475 (10 %), the small ones already gone. PREY_LR 0.55 (fish3.js:413) | OFF (2–4× too high) | **H** | P6 (juvenile water and stem refuge) |
| P22 | Adult mortality, longevity | Adult (≥ 33 cm) S 0.55–0.70; background non-simulated M ~0.25–0.4/yr; whole ≥ 7.5-cm stock loses 45–60 %/yr; max age 9 (PPD For the sim §1, §4) | M 0.62 × M_OTHER 0.5 × (L/43)^−0.87 → 0.31/yr at 43 cm (species.js:383; fish3.js:2398) — **OK**. Realised: year 1 loss 71 %; year 2 ~51 % (starved 15 %, eaten 10 %, other 26 %) | OFF (via starvation and cannibalism) | H (via P14, P21) | – |
| P23 | Thermal | Final preferendum 24–25.5 °C; one UILT 28.4 °C at 17.7 °C acclimation; Hot Brook peaks ~24 °C (CPE Q6; HAB §2) | tempOpt 24.5, tPref 25, UILT 30 (prior) (species.js:390, 668) | OK (no heat stress expected) | L | – |
| P24 | O₂ | Pike stop feeding < ~2 mg/L, inactive at 0.3 in weedy lakes; grass pickerel survived 0.3–0.4 under ice (PWE Q4; HAB §2) | o2Lethal 0.5 @ 25 °C, o2Ice 0.35, o2Crit 0.32 × 9.5 = 3.0 mg/L (feeding falls below it) (species.js:390, 668) | OK | – | – |
| P25 | Density, biomass, size | ~15–40 fish ≥ 8 cm /ha, ~2–9 kg/ha; census 25/ha (55 % < 25 cm, 30 % 25–38, 15 % ≥ 38); year-class swings 2–4× (PPD; FC; SNN Q3) | Arm O: 25 → 7.2 → 3.5 /ha; 3.3 → 5.0 → 3.2 kg/ha; mean 24.3 → 42.9 → 48.3 cm | OFF (numbers and size structure) | **H** | Follows P6/P7/P13/P18/P21 |

---

## 2. Smallmouth bass (`bass`)

| # | Aspect | Real (source) | Sim (file:line, value) | Status | Pri. | Suggested fix |
|---|---|---|---|---|---|---|
| B1 | Summer day habitat | Littoral, shore-anchored: ≥ 80 % of daytime positions within 100 m of shore (Hot Brook geometry), ≤ 10 % beyond 150 m for fish < 40 cm; Maine 1.5–4.6 m over rock and drop-offs; in tea-coloured Hot Brook beds 1.0–3.0 m (SHH Implications; HAB §3). OBS: "usually closer to shore, but some in the open" | stageR5: bed [1.0, 3.0], shore band day [60, 120] m (fish3.js:439–440, 1146, 1469) | OK (by design); SH1–SH5 UNKNOWN | M | Add a distance-from-shore tally by size (SH1 ≥ 80 % within 100 m; SH5 median 40–70 m by day) |
| B2 | Shallow-water use by day | Large bass leave the 0.5–2-m strip by day in clear water; adults over beds < 0.5 m ≤ 5 % by day (JRB (b)) | Arm M by day over beds: 5 / 16 / 16 / 31 / 33 % (< 0.3 / 0.3–0.6 / 0.6–1 / 1–2 / ≥ 2 m), all sizes pooled (juveniles' habJ and nesting males included) | UNKNOWN | M | Split the T_WHERE tally by size (< 25 / ≥ 25 cm) and nest state |
| B3 | Night | Shallower, nearly still, rising off the bed after sunset; little horizontal movement (HAB §3 Diel; SHH) | bed [0.5, 2.0], 0.2 m over the bed, act 0.3; shore band [50, 100] m (fish3.js:308, 439–440) | OK (act high, see B8) | – | – |
| B4 | Twilight edge patrol | Out to ~90–110 m at dusk and dawn, the hunting window; most adult-perch kills at twilight at beds 2–3.5 m (SHH SH5, SH8) | shore band tw [150, 250] m (fish3.js:439); PRED3 act twilight 0.5 (fish3.js:478) | OK (unverified) | L | Kills-by-light tally (FR8: ≥ 25–40 % of bass fish kills in the ~2 h about sunrise and sunset) |
| B5 | Large fish late summer | Fish > 40 cm deeper and farther out from mid-July to mid-September (Green Lake, Maine; Kaemingk) (SHH §1) | none | MISSING | L | SHH (a)'s large-fish row: 15 Jul – 15 Sep, shore 120 / 250 m, bed 1.5–4.5 m |
| B6 | Structure | Adults on rock, cobble and wood; avoid sediment and dense plants; small adults more in cover (SHH §3) | No substrate preference beyond the shore band | MISSING | L | SHH (c)'s structure multipliers once a substrate map exists (`LIT3.CR_ROCK_Z` as a proxy) |
| B7 | Juvenile water (age 1–3) | Age 0–1 in the shallow littoral among stones, small groups; 248–279-mm Maine fish shallower and in more cover than large adults; blend to adult water at 12–25 cm (JRB §1, (a)) | stageR5 `habJ` {L [12, 25], bot [0.4, 2.0], wbot [1.0, 3.0]} (fish3.js:432) | OK | – | – |
| B8 | Activity budget | Moving ~40–50 % of daylight (day act ~0.5), twilight ~0.7–0.8, night ~0.1; summer horizontal rate ≈ 3× fall/winter (SHH (e)) | hab act day 0.8, night 0.3, winter 0.05 (fish3.js:308) | OFF (small) | L | day 0.5, night 0.1, twilight 0.7–0.8 |
| B9 | Home range | Along-shore strips of 0.8–1.7 km; 74 % year-to-year fidelity; ranges rarely include the nest (SHH (d); HAB §3) | HOME(50, 700) disc + shore band (fish3.js:307) | OK (roughly) | L | SHH (d)'s shoreline segment, if wanted |
| B10 | Winter | From ~1 week after the fall equinox / 10–15 °C, bass gather at ≤ 4–6 wintering sites (Milipsigate: < 8 m deep, 2–6 m), nearly sessile Dec–Mar, minimal feeding: ice catch ¼ of open water, ~0 in Washington Co.; stop feeding at ~10 °C (HAB §3; PWE Q1) | Winter band bed [2.5, 5.5], act 0.05 (fish3.js:308); coldPerf floor 0.2 (linear); no site memory. Arm O under ice: **p 0.45–0.73** of the cold Cmax (target p ≈ 0–0.2) | OFF / MISSING (sites) | M | A feeding switch below ~10 °C for bass (coldPerf → ~0.05 below 8–10 °C, HAB §6 note 4) and a remembered wintering site (≤ 4–6 a lake). Energetically small, but it keeps bass hunting perch and killifish under the ice |
| B11 | Fall feeding | The year's highest energy gain: Sep–Oct p ≈ 0.6–0.8 to double lipid by October (PWE Q1; PFF (a) fall-heavy alternative) | Arm O: Sep 0.20–0.23, Oct 0.27–0.41 | OFF | H (via B13) | Comes with B12–B13 |
| B12 | **Small-bass energetics** | Maine growth 11 / 17 / 22 / 26 / 30 cm at ages 1–5 (species.js:365). Whitledge 2003 was fitted on 100–270-g fish; its RB −0.756 is ~3× steeper than typical, so it is 2–4× too costly at ~100–150 g in winter (PWE §0) and "safe only for subadults and adults" (CPE Q1) | `juvW` 30 g (species.js:360): from ~13 cm a bass runs on Whitledge. Probe `maint.mjs`, maintenance p in summer: **15 cm 0.48 (20 °C) / 0.60 (24 °C)**; 20 cm 0.32 / 0.40; 26 cm 0.22 / 0.27; 33 cm 0.16 / 0.19. Probe `juvw.mjs` (prey 4,500 J/g, p constant all year): an 11-cm bass at p 0.3–0.4 is **stuck at ~14 cm for 4 years**; at p 0.5 it reaches 39 cm in 4 years; at 0.6, 72 cm. With juvW 100–250 g at p 0.4: 11 → 15.9 → 20.2 → 24–25 cm (Maine-like) | OFF | **H** | Raise `juvW` to ~150–250 g, or blend respiration from the Rice set to Whitledge over log-mass 30 → 250 g. Re-derive the adult target p after the fix (bassgrow.mjs). This removes the knife-edge where no single p gives Maine growth at every size |
| B13 | **Hunger gate and the feeding level** | Field: wild bass hold ~0.4 %BW, use ⅓–½ of their gut; p by month on the sim's set May 0.2, Jun 0.25, Jul 0.36, Aug 0.43, Sep 0.46, Oct 0.41, Nov 0.15, ice ~0 (or fall-heavy: Jul–Aug ~0.3, Sep–Oct 0.6–0.8); never a month > 0.6 (PFF (a)–(b)) | `S3.bass.G0` 0.01 (fish3.js:450): h = 1 − gut/(G0·W) × every food (fish3.js:1657). Evacuation ≈ GER·e^(0.072T)·0.4 ≈ 2.0–2.65 /day (fish3.js:1621), so intake ≤ G0·W × that ≈ **2.0–2.6 %BW/d at any size**. Probe `gatecap.mjs` (cap / maintenance p): 9 cm 0.19 / 0.34 at 20 °C; **15 cm 0.20 / 0.48 (20 °C), 0.27 / 0.60 (24 °C)**; 18 cm 0.24 / 0.37; 22 cm 0.29 / 0.28; 26 cm 0.35 / 0.22; 33 cm 0.44 / 0.16. Arm O monthly p: Jun 0.12–0.15, Jul 0.15–0.24, Aug 0.21–0.25, Sep 0.20–0.23 | OFF | **H** | Make the gate scale with appetite, e.g. G0 = g0 · Cmax(W, T) · 1 day with g0 ≈ 0.2–0.25 (≈ 1.1–1.4 %BW for a 250-g bass in July, ≈ 2–2.5 %BW for a 15-cm one), or G0 ∝ W^−0.31 anchored at 1 %BW for 250 g. Check: cap ≥ 1.5× maintenance from 9 to 40 cm; 26–36-cm p ≈ 0.3–0.36 |
| B14 | Adult diet by food type (crayfish-poor water) | Hot Brook crayfish "not common" (OBS). Adults ≥ 30 cm: fish 50–65 %, **insects 25–40 %** (odonate nymphs, mayflies, terrestrial beetles), crayfish 5–10 % (≤ 15); 15–25 cm: insects 50–70 %; where fish run short, insects fill in, not crayfish (Provoking, Wentzells) (PFF §4, (d)). Maine (Cooper 1941): 80 % fish, crayfish 14 %, insects 4 % | Arm M year: fish 36 % + young 50 % = 86 %, cray 12 %, **weeds 1 % + surface 1 %**. Arm O year 2, Jun–Jul: **cray 34–48 %**. Why: bass ≥ 15 cm skip worms and scuds (`big`, fish3.js:1686); the weed fauna is fed only within reach of the canopy, but bass hold 0.8 m over the bed by day (fish3.js:308, 1679–1681); a kill fills the gut first (fish3.js:1666) | OFF | **H** (insects) / M (crayfish) | Give adult bass the weed edge's large insects and the surface insects as real food: reach by the footprint rather than the fish's height, or a lower day `h`. Targets: insects 25–40 % (≥ 30 cm), 50–70 % (15–25 cm). Re-check the crayfish stock and its size refuge so crayfish stay ≤ 10–15 % when fish are scarce |
| B15 | Adult diet by prey species | White perch 61 %, yellow perch 14 %, pumpkinseed 2 % of fish volume (Cooper 1941); perch mostly age 0 in fall and yearlings nearshore (Fetzer); bullhead ~0 ("least vulnerable", Mauck & Coble) (PFF (d); PEA §2; SHH §4) | Arm M kills: **bullhead 18 %**, sunfish 16 %, killifish 13 %, redbreast 13 %, fallfish 11 %, perch 9 %, white perch < 11 % | OFF | **H** | Mostly prey-side. Juvenile perch need a littoral shore term (SHH §4: their 1.5–4-m band is mostly 150–180 m out). White perch need their time-of-day habitat (cross-ref `perches.md`). Check the bullheads' day exposure (on the bed in weedy coves) and their CS against bass (0.2, fish3.js:483) |
| B16 | Cannibalism | Adult smallmouth in lakes with other prey ≈ 0 (Maine 0 of 36; Wisconsin 0 of 303); young bass ≤ 2–5 % of adult summer diet by mass, mostly 15–25-cm bass on young < 30–40 mm in June–July (JRB §2, (e)) | Followed bass>bass small (arms L, M); adult bass ate 198k young-of-year bass in arm M (~0.2–0.6 t of 7.0 t ≈ 3–8 %) | OK / borderline | L | Watch after B12–B13 |
| B17 | Stomachs | Adults 25–50 % empty (Opeongo 35 %, Provoking 40 %, Lake Ontario ~1 item, 0.4 %BW) (PFF) | Arm M: **62 % empty** | OFF (follows the low p) | L | Re-check after B13 |
| B18 | Growth and condition (adults) | +4 cm/yr at 26 cm, +3–3.5 at 30–33 (Maine VB; NS L∞ 50, K 0.18); NS bass sharing water with pickerel run Wr 73–86 (mean 77) (PFF §3) | Probe `predgrow.mjs` with arm O's fortnightly p: a 26-cm bass **+0.0 cm/yr, K 0.96 → 0.81** (years 1 and 2 alike); at p 0.34 constant +2.3 cm (with gonads), at the field monthly p +2.6 cm. Arm O K: summer 0.83–0.88, winter 0.88–0.91 | OFF (growth) / OK (K within NS's Wr range) | **H** | B12 + B13 + B14 + B15 |
| B19 | Maturity | Maine ♂ 3–4 yr, ♀ 4–5 yr at 20–30 cm (CPE Q3) | Lmat 27 ♀ / 23 ♂, matMinAge 2.5 yr (species.js:366) | OK | – | – |
| B20 | Fecundity, hatch, nest failure | Ovary 7,000–8,000 eggs/lb, effective 2,000–3,000; deposited egg → post-larva 26–33 %, → fall 1–4 %; ~40 % of nests fail; cold snaps (Tmin < 15 °C within 15 days of fertilisation) kill nests, so Maine year classes fail after cold wet summers (CPE Q4; JRB (e)) | fec ≈ 16,500/kg × sHatch 0.1 (species.js:366, 368): mean OK. No temperature-dependent nest failure | OK (mean) / MISSING (variation) | M | Add Shuter's egg mortality by the 15-day minimum temperature (CPE Q4 table) for year-class variation |
| B21 | Spawning timing, sites, guarding | Nests from 12.8 °C, eggs at 15.6–18.9 °C, mid-May to mid-June (Spednic median start 28 May); nests at 0.5–1.5 m (Maine 0.8 m) on hard bottom beside a boulder or log; males re-nest within 20 m; guard 25–35 days and stop feeding 3–7 weeks; 60–100 % of guards have food in the gut; cost +17.6 % respiration (CPE Q4; PFF; config BROOD) | spawnT [15, 21], 2 °C lead (species.js:637); grounds bed [0.5, 1.5], faith 20 m (fish3.js:372); guard 0.08 yr ≈ 29 days; GUARD_FEED3 [0.12, 0.45], GUARD_METAB3 [1.4, 1.12] (config.js:318). Arm O year 2: ~1,036 spawnings by 31 May, the rest by mid-June | OK | – | Optional: nest substrate preference (B6) |
| B22 | Incubation lag (both species) | Bass: hatch 4–10 days, swim-up ~12 days later at 8.7–9.9 mm, fry leave 5–7 days after that; pickerel: hatch 6–12 days, then ~1 week clinging to plants (CPE Q4) | The young school is made **at swim-up length on the spawning day** and feeds and grows at once (fish3.js:1989, 2003) | MISSING | M | Hold a spawning as eggs and sac-fry (not feeding, not growing; exposed only to egg predators) for the species' incubation, ~2–3 weeks at the season's temperatures |
| B23 | Young-of-year growth | Maine 56–76 mm by season's end (MDIFW); Spednic 73 mm on 1 Sep, 70.7–76.3 mm on 3 Oct (CPE Q2) | Arm O: 5.0 cm on 15 Jul, 7.4 on 12 Aug, **8.5 on 7 Oct, 8.9 on 21 Oct** (survivors' mean) | OFF (~15–20 % fast) | M | Mostly B22's 2–3-week head start; re-check after it |
| B24 | Young-of-year diet | Copepods → midges at 1.5–2.5 cm; insects by 2.5–5 cm; fish from 10–15 cm. Opeongo 5–10 cm: plankton 72 %, insects 28 %; St Croix (Maine) young mostly cladocerans (JRB §1; PFF §4) | Lzoo 2, benthL 2.0, yLpisc 10 (species.js:369, 372; fish3.js:469). Arm M young bass diet: zoo 5 %, weeds 4 %, bed 91 % | OK (Lzoo is defensible on one source) | L | – |
| B25 | Young-of-year survival to autumn | Swim-up → first autumn 3–15 % (Clady) or 1–3 % (Houpt hazard); predators: pickerel, perch and white perch (eggs, fry), sunfish; adult bass a minor share (JRB (e)) | Arm O: ~3.3M swim-ups → ~75k by 22 Sep (**~2 %**). Fortnight losses: starved 13–33 % (Jul–Aug), eaten 10–21 %. Arm M eaters: white perch 458k, perch 317k, fallfish 252k, bass 198k, killifish 112k, pickerel 95k | OK (rate) | L | – |
| B26 | First winter of the young | Shuter ramp for a 208-day winter: all < 48 mm die, all > 92 mm live; ~40 % lost at 71–76 mm; YOY winter < 3 m among stones near the nesting areas (FWM §5; CPE Q4; JRB §1) | WINTER0 bass [1, 1] (config.js:452) **OK**. But arm O loses young bass to **hypoxia 8–18 % a fortnight under the ice** (Jan–Mar) — and the young of every species alike, even bullheads | OFF (cross-cutting) | **H** (owner: the young-of-year review) | Find why the young schools sit in anoxic cells under the ice: the GPU's young O₂ escape and positions vs `_yoyTarget`'s `_o2Better`, fish3.js:2261. For bass, the first-winter loss should be the size ramp (~15–20 % at 85–90 mm) |
| B27 | Age-1 survival (recruits) | Census: ~33 % age 1, 17 % age 2, 10 % age 3 → S ≈ 0.5–0.6 a year; small smallmouth "most vulnerable" to esocids; below ~10 °C young bass shelter in gaps in the substrate, at 6–7 °C most bass are under rocks (FC; PEA §2; JRB §1; HAB §3) | Arm O: 12,609 recruits at ~9.4 cm on ~5 April; ~8,970 bass eaten between 22 March and 17 May (**~63 % of the recruits in ~6–8 weeks**); pickerel took ~10,250 bass in arm L's year. No cold shelter for small bass | OFF / MISSING | **H** | A cold-water shelter: below ~10 °C a bass < 25 cm within ~0.3 m of a hard bed shallower than ~3 m takes cover ~0.7–0.9, like S3 `bury` for bullheads. Recruit the school onto that bed |
| B28 | Adult mortality and longevity | Catch-and-release adults S 0.80–0.83 (Pallette); natural M ≈ 0.58 under harvest; a 51-cm Maine bass ~20 years old; Hot Brook bass are all released (SNN; CPE; OBS) | M 0.36, M_OTHER 0.5 → 0.18/yr at 33 cm (species.js:366). Arm O adults (pre-recruitment counts): 7,432 → 3,993 a year (**~46 % loss**); year 2 deaths: starved 2,144, eaten 6,215 (mostly recruits), other 1,104 | OFF (via starvation) | H (via B12–B13) | maxAge 15 → ~18–20 for Maine (L) |
| B29 | Thermal | Field 21–27 °C, final preferendum 28–31 °C, UILT ~35–36; growth starts at 10–14 °C (CPE Q6; HAB §3) | tempOpt 27, tPref 25, UILT 36 (species.js:372, 637; fish3.js:307) | OK | – | – |
| B30 | O₂ | > 6 ppm for best growth; summer lethal 0.5–1.2 mg/L; under ice ~0.6–1.0 (inferred); the first to die in a winterkill (CPE Q6; HAB §5) | o2Lethal 1.1 @ 25 °C, o2Ice 0.8, o2Crit 0.47 × 9.5 = 4.5 mg/L (species.js:372, 637) | OK | – | – |
| B31 | Brook use | Some lake bass spawn in the brook in May–June and stay; sub-adults use it as a summer range (juveniles at ~0.57 m — the run; age-0 at ~0.34 m — the riffles); the largest bass hold the 1.1-m mouth pool as an ambush point; all leave below ~15.6 °C; ~2–3 small-bass home areas in the brook (BPS §1, §3; MCL). OBS: "smaller bass" stay in the brook; "larger bass … in the deep part by Upper … waiting for all the schools of small minnows" | MOVE3 bass settle 0.05 (fish3.js:356); no brook residence; the brook's bigger-deeper rule only (fish3.js:1143) | MISSING | M | A brook-summering share for bass (like pumpkinseed's `brook`), by size: sub-adults in the run, the largest in the mouth pool. Exit at ~15.6 °C |
| B32 | Density, biomass, size structure | 25–45/ha (census 40: ~33 % age 1, 17 % age 2, 10 % age 3, 40 % 4+), 4–10 kg/ha; MDIFW objective 2.6 kg/ha of ≥ 10-in bass; eastern Maine populations mostly 8–13-in fish (FC; SNN; HB3) | Arm O: **40 → 15.6 → 9.5 /ha**; 9.0 → 7.3 → 5.6 kg/ha; mean before recruitment 33.7 cm (year 1) → 38.6 cm (year 2) | OFF (numbers, size structure) | **H** | Follows B12, B13 and B27 |

---

## 3. What the latest runs show (seed 613, GPU, true scale)

Arm O is the package through item 6j, read to day 756 (two years). Arms L and M are one year, and supply the year's tallies.
Item 6k (YCOLD) is not in these runs.

### Chain pickerel

| Measure | Arm O year 1 | Arm O year 2 | Target | Verdict |
|---|---|---|---|---|
| Fish (≥ 7.5 cm) | 16,090 → 4,639 (25 → 7.2 /ha) | → 2,275 (3.5 /ha) | 15–40 /ha, stable ± 25–40 % | collapsing |
| Biomass | 3.3 → 5.0 kg/ha | → 3.2 | 2–9 kg/ha (4–8 judged) | in range, falling |
| Mean length | 24.3 → 42.9 cm | → 48.3 cm | census 55 % < 25 cm | ageing stock |
| Recruits (age 1) | 2 | 2 | ~4,000–8,500 a year | **fails** |
| Spawnings | 1,654 seeded + 610 | 693 (year 3 so far: 329) | ~90–100 % of mature females | low (UNKNOWN cause) |
| Young: swim-up → ~Sept | 223k → ~1k (0.45 %) | 341k → ~1k (~0.3 %) | 1–2 % | 3–6× low |
| Young length 1 Jul / 29 Jul / 26 Aug / 23 Sep | 3.5 / 5.6 / 7.4 / 8.1 cm | similar | 2.5–4 / 5.5–7.5 / 8–10.5 / 10–13 | slow from August |
| Young starvation (Jul–Aug fortnights) | 8–21 % | 12–38 % | small | OFF |
| Deaths: starved / eaten / other | 45 / 8,970 / 2,438 | 691 / 475 / 1,200 | stock loses 45–60 %/yr; cannibalism ≤ 10–20 % of fish ≥ 20 cm | year 1: cannibalism; year 2: starvation |
| p, summer (Jun–Sep) | 0.32–0.41 | 0.22–0.31 | ~0.39–0.42 a year; Jul–Aug 2.5–2.7 %BW/d | year 2 low |
| p, under ice | 0.52–0.67 (≈ 0.6 %BW/d) | 0.50–0.57 | 25–50 % of Cmax (0.2–0.4 %BW/d) | high (6k should cut it) |
| K, summer / winter | 0.94–0.97 / 0.97–0.98 | 0.84–0.86 / 0.93–0.94 | ~0.95–1; male somatic gain in summer and winter | year 2 thin in summer |
| Growth probe on the run's p (40-cm ♀) | +3.8 cm | +0.0 cm (K 0.92) | ~+4–5 cm at 40 cm | year 2 none |
| Diet by mass (arm M year) | fish 59 % + young 35 %, cray 3 % | summer cray 10–16 % (arm O) | 85–95 % fish, cray ≤ 5 % | year 2 crayfish high |
| Kills by prey (arm M) | killifish 24 %, perch 21 %, fallfish 13 %, white perch 10 %, bullhead 8 %, sunfish 6 % | – | white perch ~55 % (Cooper 1941) | OFF |
| Stomachs (arm M) | 36 % empty | – | 40–60 % | OK (low end) |
| By day over beds < 0.3 / 0.3–0.6 / 0.6–1 / 1–2 / ≥ 2 m (arm M) | 2 / 17 / 39 / 30 / 13 % | – | fish depth half at 0.76–1.82 m (beds ~1–2.7 m); 5–15 % over < 0.5 m | a little shallow |

### Smallmouth bass

| Measure | Arm O year 1 | Arm O year 2 | Target | Verdict |
|---|---|---|---|---|
| Fish | 25,744 → 10,060 (40 → 15.6 /ha) | → 6,093 (9.5 /ha) | 25–45 /ha | falling |
| Before spring recruitment | 7,432 @ 33.7 cm (day 308) | 3,993 @ 38.6 cm (day 672) | ~60 % < 25 cm | adults only |
| Biomass | 9.0 → 7.3 kg/ha | → 5.6 | 4–10 (judged 5–10) | in range, falling |
| Recruits (spring, ~9.4 cm) | 12,609 | 5,496 | census ~8,600 age 1 in late summer | OK in, then eaten |
| Recruits eaten within ~6–8 weeks | ~8,970 (~63 %) | similar pattern | age-1 S ≈ 0.5–0.6 a year | OFF |
| Deaths: starved / eaten / other | 4,818 / 21,024 / 2,451 | 2,144 / 6,215 / 1,104 | adult S ~0.8 (catch-and-release) | starvation high |
| p by month | Jun 0.15, Jul 0.15–0.24, Aug 0.23–0.25, Sep 0.20–0.21, Oct 0.27–0.38, Nov 0.45, ice 0.44–0.56 | Jun 0.12, Jul 0.16–0.20, Aug 0.21–0.23, Sep 0.21–0.23, Oct 0.30–0.41, Nov 0.57–0.63, ice 0.55–0.73 | Jun 0.25, Jul 0.36, Aug 0.43, Sep 0.46, Oct 0.41, Nov 0.15, ice ~0 (or fall-heavy) | inverted |
| Growth probe on the run's p (26 cm) | +0.0 cm, K 0.96 → 0.81 | +0.0 cm, K → 0.80 | +4 cm | none |
| K (summer / winter) | 0.85–0.88 / 0.88–0.91 | 0.83–0.88 / 0.88–0.91 | Wr 73–86 in NS pickerel lakes | OK |
| Diet by mass (arm M year) | fish 36 % + young 50 %, cray 12 %, insects ~2 % | Jun–Jul cray 34–48 % (arm O) | ≥ 30 cm: fish 50–65 %, insects 25–40 %, cray 5–10 % | no insects; crayfish surge |
| Kills by prey (arm M) | bullhead 18 %, sunfish 16 %, killifish 13 %, redbreast 13 %, fallfish 11 %, perch 9 % | – | white perch 61 %, yellow perch 14 %, bullhead ~0 | OFF |
| Annual food per bass (arm M) | ~0.47 kg (7.0 t / ~15,000 mean fish) | – | 0.7–1.1 kg (21–36 cm); Mille Lacs 0.87 | low |
| Stomachs (arm M) | 62 % empty | – | 25–50 % | high |
| Young: swim-up → late Sept | ~3.3M → 75k (~2 %) | – | 1–15 % | OK |
| Young length 15 Jul / 12 Aug / 7 Oct | 5.0 / 7.4 / 8.5 cm | – | ~7.3 cm on 1 Sep, 7.1–7.6 in early Oct | ~15–20 % fast |
| Young under ice | hypoxia 8–18 % a fortnight (Jan–Mar) | – | Shuter ramp only (~15–20 % at 85–90 mm) | OFF (all species) |
| Spawnings | 4,333 (seeded season + live) | 1,846 | – | OK |

**Community context (arm O):** total 93 → 81 kg/ha; white perch 34.5 → 35.8; perch 22.9 → 19.5; killifish → 0; pumpkinseed and
redbreast ~0.1 by year 2; summer Daphnia 146 → 38 µg/L. Bass + pickerel = 12.3 → 8.8 kg/ha (13 → 11 % of fish biomass). The
predators hold too little of the community and lose ground each year, while the white perch they should be eating grow.

---

## 4. Prioritised fix list

Each fix should be judged as a ≥ 3-seed A/B on the true lakes (GPU), using the young-of-year fate audit and the tallies above.

### High

1. **Bass hunger gate in proportion to appetite (B13).** Replace the fixed `S3.bass.G0` 0.01 (fish3.js:450, 1657) with
   G0 = g0·Cmax(W,T)·1 day, g0 ≈ 0.2–0.25 (or G0 ∝ W^−0.31, anchored at 1 %BW at 250 g). Check with `gatecap.mjs`: the cap is
   ≥ 1.5× maintenance from 9 to 40 cm, and 26–36-cm bass keep p ≈ 0.3–0.36. Without this, no prey supply can grow a bass under 20 cm.
2. **Small-bass bioenergetics (B12).** Raise `BIO.bass.juvW` 30 → ~150–250 g, or blend the Rice and Whitledge respiration over log-mass
   30 → 250 g (species.js:356–360). Verify that 11 → 17 → 22 → 26 → 30 cm is reachable on one plausible p schedule (`juvw.mjs`,
   `probe/bassgrow.mjs`). Do 1 and 2 together and re-derive the season's target p.
3. **Pickerel's first year (P7, P13, P15, P18).**
   - Young pickerel in the weeds with the weeds' insect food: re-test `S3.pike.yCover` 0.5–0.8 under density predation (Y1).
   - An esocid size window for the young's fish prey: peak prey/predator ≈ 0.3–0.4, limit ~0.6–0.7, per species instead of
     `FRY.WIN_R` 5.3.
   - Then a size-scaled juvenile M for pickerel (`M_JUV_B` ≈ 0.87–1).
   - Targets: 25–40 / 55–75 / 80–105 / 100–130 mm at the ends of June / July / August / September; swim-up → fall 1–2 %; fall → age 1
     0.6–0.8; ~4–8k recruits a year.
4. **Juvenile pickerel water and stem refuge (P6, P21).** Add `S3.pike.habJ` {L [12, 35], bot [0.3, 1.5]} in the weeds, with stem
   cover acting fully against a cannibal while the prey is under ~0.6× its length (Grimm). Target cannibalism ≤ 10–30 % of age-1
   deaths and ≤ 10–20 % for fish ≥ 20 cm. The ≥ 7.5-cm stock should lose 45–60 % a year.
5. **Cold shelter for small bass (B27).** Below ~10 °C, a bass under 25 cm near a hard bed (< ~3 m, `LIT3.CR_ROCK_Z` proxy) takes
   cover ~0.7–0.9, like S3 `bury` (fish3.js:141, 294). Target: age-1 survival 0.5–0.6 a year, not 63 % lost in 6 weeks.
6. **Insects as real food for adult bass (B14).** Feed the weed edge's large insects (odonates, mayflies) and the surface insects
   through the footprint for bass ≥ 15 cm, not only within canopy reach of the fish's height (fish3.js:1678–1698). Targets: insects
   25–40 % (≥ 30 cm) and 50–70 % (15–25 cm); crayfish ≤ 10–15 % when fish are scarce.
7. **Prey the predators should be eating (P12, P14, B15; cross-ref `perches.md`).**
   - Juvenile perch need a littoral shore term (SHH §4).
   - White perch need their time-of-day water and inshore twilight pass (the white-perch research in progress).
   - Check bullheads' daytime exposure to bass.
   - Targets: white perch ~55–60 % of pickerel and bass fish volume (Cooper 1941); bullhead ~0 for bass.
8. **Under-ice hypoxia of the young (B26; owner: the young-of-year review).** Young of every species die 8–20 % a fortnight from
   January to March in arm O. Find why the schools sit in anoxic cells (GPU young O₂ escape vs `_o2Better`).

### Medium

9. **Bass in winter (B10, B11).**
   - Feeding switch below ~10 °C (coldPerf → ~0.05) and ≤ 4–6 remembered wintering sites from ~a week after the fall equinox.
   - Targets: p under ice 0–0.2 of the cold Cmax; Sep–Oct p 0.6–0.8 (fall storage).
10. **Crayfish surge when fish are short (P12, B14).** Check the crayfish stock's depletion and size refuge (Stein 1977: ovigerous
    females and breeding males nearly exempt). Insects, not crayfish, should take up the slack.
11. **Pickerel spawning participation (P20).** Tally ripe-but-unspawned females. If ~60–70 % fail, check mate-finding across the 400
    grounds a lake and the 4–12.5 °C window.
12. **Incubation lag for both species (B22, B23).** Keep eggs and sac-fry for ~2–3 weeks before the young school feeds. Add bass
    nest failure by the 15-day minimum temperature (Shuter) for year-class variation.
13. **Pickerel water (P1) and winter ration (P5).** Fish depth ~0.8–1.8 m by day. Re-measure the winter ration with 6k
    (target 0.2–0.4 %BW/d).
14. **The brook (P11, B31).**
    - Pickerel trips June–September, as sojourns in the pools and run margins.
    - A bass summer-brook share: sub-adults in the run, the largest in the 1.1-m mouth pool, out below ~15.6 °C.
    - This is the human's own observation, worth having.
15. **Tallies to judge growth and habitat (B1, B2, B18).**
    - Length-at-age by cohort (the run's mean length mixes growth with who survives).
    - Distance from shore by size (SH1–SH5).
    - Day positions by size and nest state.
    - Kills by light (FR8).
    - Starvation deaths by size.

### Low

16. Bass act (B8): day 0.8 → 0.5, night 0.3 → 0.1, twilight 0.7–0.8.
17. Large bass (> 40 cm) in late summer farther out (B5).
18. Structure weights once a substrate map exists (B6).
19. Strip home ranges (B9).
20. A prey-vigilance factor for the diel timing of kills (PFF (c)).
21. Bass capture second-order cuts (PFF (c)).
22. Bass maxAge ~18–20 (B28).
23. Pickerel ~1.3 females per male; ovary growth in winter (P16, P5).
24. Pickerel sHatch 0.05 → 0.08 (P17; not the limit).

---

## 5. Cross-cutting notes for the other reviews

- **White perch out of the predators' reach** (P12, B15). This is the largest diet error for both predators, and the biggest unused
  prey stock (36 kg/ha). It belongs to `perches.md`; the predators' targets are above.
- **Juvenile perch offshore** (SHH §4 side observation). Their 1.5–4-m band puts the median juvenile perch 150–180 m from shore. That
  is where bass are not, so bass lose their main field prey.
- **Killifish eaten out.** In arm M, pickerel (46.6k), fallfish (45.2k) and bass (11.9k) were the killifish's top predators, and the
  killifish are gone by year 2 in arm O. The pickerel's year-2 starvation follows. Owner: `small_fish.md`.
- **Young-of-year under the ice** (B26) and the **incubation lag** (B22) concern every species' young. Owner:
  `bottom_fish_and_young.md`.
- **Single seed, GPU.** All run numbers are seed 613 on the GPU year runner. Arms O on 611 and 612 are queued (queue_r8). The CPU
  reference may differ in detail.
