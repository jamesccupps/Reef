# Audit: habitat, movement, refuges, reproduction and the young-of-year — what was adjusted away from reality

Written 2026-10-21 (read-only audit; no code changed). Question (the human): which parameters and rules were moved away from
how the lakes really are, to make up for mechanisms the model did not have — plants, cover, substrate, birds, streams — and what
the realistic value and the missing mechanism are.

**Scope:** `src/w3/fish3.js` (S3 habitat bands, habJ, yBed, yCover, shore, seek, rockC/rockL, bury/buryL, MOVE3, SPAWN3, the
refuges, the brook rules, `stageR5()` lines 455–628, the young's movement/feeding/mortality/recruitment), `src/config.js` (SPAWN,
FRY, BIOE.M_OTHER, WINTER0, IMMIGRATION, PLANKTON's young-fish feeding), `src/species.js` + `src/w3/species3.js` (sHatch, M, L0),
and the GPU mirror `src/w3/gpu/wgsl.js` (same rules, line refs given where they carry the same constant).

**Classes:** **REAL** = matches field data for these lakes or close analogues · **COMP** = compensation: moved away from the field
to fix a symptom of a missing mechanism · **STACKED** = redundant with (or double-counting) a mechanism added later · **PRIOR** =
unsupported prior / device with no field basis.

**Note abbreviations** (all under `docs/research_notes/`): HNS `Whole lake 3D fish simulation/habitat3d_new_species.md` · H3D
`…/habitat3d.md` · YPF `…/young_piscivore_functional_response.md` · SOP `…/spawning_on_plants.md` · WPR `…/white_perch_regulation.md`
· MBL `…/movement_between_lakes.md` · PDPM `…/predator_diets_and_prey_mortality.md` · KPP `Real lake ecology for calibration/
killifish_persistence_and_predators.md` · JRB `…/juvenile_refuges_and_bass_young.md` · SMH `…/smallmouth_horizontal_habitat.md` ·
WPHP `…/white_perch_habitat_and_predation.md` · GWP `…/gemini_white_perch_checked.md` · FFE `…/forage_fish_early_life.md` · FWM
`…/first_winter_mortality.md` · FZC `…/fish_zooplankton_coupling.md` · PPSP / WSSB `Seasonal fish habitat use/perch_pickerel_
smallmouth_pumpkinseed.md` / `…/whiteperch_shiner_sucker_bullhead.md` · RCM `Maine lakes ponds and streams/recruitment_
compensation_maturity.md` · EFY / PPD `Predator winter energetics/esocid_first_year_survival.md` / `…/pickerel_population_
dynamics.md` · MBCL `Fish in streams connecting lakes/movement_between_connected_lakes.md` · SBM `Maine lake shores and catchment/
shore_birds_and_mammals.md` · FC `docs/FISH_CENSUS.md` · ENV / BY `docs/review/environment_coverage.md` / `bottom_fish_and_young.md`.
Note line numbers (`note:line`) come from three read-through passes of the notes; the load-bearing ones (KPP:301, HNS:245,
FZC:47–52, FZC:361–366, WPR:139–143, WPR:208–210) were re-read for this audit.

**Numbers computed for this audit** (scratchpad `audit_hy/vals.mjs`, `cols.mjs`, `breck.mjs`; no simulation run):
- The young's *background* (unsimulated) hazard alone lets **33–53 %** of perch, white perch, pumpkinseed and killifish larvae
  reach 2.5 cm and **15–42 %** reach 5 cm (growth 0.04–0.07 cm/d, 16–22 °C; bass and pickerel 47–67 % / 30–53 %).
- At true scale only **3.1 %** of the 50-m water columns average ≤ 0.5 m (9.3 % ≤ 0.8 m), while **4.8 %** of the bed area is
  ≤ 0.5 m (10 % ≤ 0.8 m) — the young's shelf rules read the column mean.
- Pumpkinseed larval respiration as the sim runs it (FB4 juvenile bluegill held at 0.1 g by `FRY.R_WMIN`): **0.0091 g O₂/g/d at
  0.01 g, 20 °C**, against FB4's own 0.0144 and Breck's fitted 0.0305 (3.4× lower; 6× at 0.001 g) — before stageR5's further ×0.7.

---

## 1. The table

### A. Adult habitat bands

| # | Parameter (file:line) | Now (default → stageR5) | Field value + source | History | Class | Still needed? | Restore to | Missing mechanism |
|---|---|---|---|---|---|---|---|---|
| A1 | Killifish **day** bed band `S3.killifish.hab.day.bot` (fish3.js:373; stageR5 :460 then :592) | [0.1, 0.6] → **[0.05, 0.25]** | Shelf 0.1–1.3 m (Gabora & Colgan 1990 "< 4 m"; Chippett 2004 via COSEWIC — HNS:214); the "74–93 % ≤ 1.2 m" is a catch share of a seine that only fished ≤ 1.2 m (Phillips 2007 — HNS:245); "often in water under 6 in" (CT DEEP — KPP:54,134); "rarely stray into water much over a foot" (Everhart 1958, **Maine** — KPP:301); Helfman 1981: 1–1.6 m by day (JRB:175). **0.05–0.25 m is in no note** | 283216b [0.1,1.3] → 72d9c5f [0.1,0.6] (stage P2: ¾ of the day over ≥ 0.6 m "where the pickerel are") → d769dd5 [0.05,0.35] (60 % lost in a June fortnight) → c313818 [0.05,0.25] (arm S: 60 % of kills over 0.3–0.6 m) | **COMP** ×3 (each narrowing answered a predation tally), and **STACKED** with `SHALLOW_K` (a ≥ 25-cm predator cannot strike at all over ≤ 0.25 m — fish3.js:169, 1926, 1968) | No: arm S changed ~nothing (SESSION_STATE:221); adults in it fall to ration 0.43–0.47, condition 0.99 → 0.84, one clutch a summer | **[0.1, 0.6]** (Everhart/CT/Ward 2002), a soft tail to ~1.2 m; let `SHALLOW_K`, the weeds and the school make the refuge | The strip's own food (littoral microcrustaceans, stone-film midges, bank-fall insects concentrated within metres of shore); **birds** (kingfisher, heron) in the strip; sub-column geometry for the young (B10) |
| A2 | Killifish **night** band (fish3.js:373; stageR5 :464, :592) | [1.0, 2.5] → [0.1, 0.6] (b03b61a) → **[0.05, 0.4]** (c313818) | Helfman 1981 (Opinicon, bass + pike): disperse into < 0.6 m at night (JRB:175; KPP:138,300) vs Chippett: deeper rocky water at night (HNS:214,226); unresolved — "read Helfman before changing it" (JRB:284) | as left | [0.1, 0.6] REAL (one source); **[0.05, 0.4] COMP** | No | [0.1, 0.6] | Helfman read in full |
| A3 | Killifish winter [1.5, 3.0] (:373) | unchanged | Into deeper water late fall–winter (COSEWIC 2003 via KPP:281); 1.5–3 m [inf] (HNS:214) | 283216b | REAL/PRIOR | yes | — | — |
| A4 | White perch day band (:334; stageR5 :503) | [3.5, 5.5] → **[2.5, 5.5]** | 2.5–5.5 m: brown water lifts the clear-lake 4–9 m band to ~1.5–5 m (WPHP:46,160,394); open level mud, never in weeds | 03e31d4 | default PRIOR (clear-lake transposed); **R5 REAL** | yes | keep R5 | — |
| A5 | White perch shore + night (:334 night [0.5,1.5]; stageR5 :505 shore) | none → day none, night 20–60 m, twilight 60–200 m | Night 0.9–1.2 m inshore (WSSB:47), ≤ ~60 m from shore (WPHP:396) | 03e31d4 | REAL | yes | keep | Autumn and early-ice weed-edge bands (WPHP:183–184) not built |
| A6 | Bass day/night bands + shore (:339; stageR5 :477–478) | [1.5,4]/[1,2.5] → **[1,3]/[0.5,2]** + shore 60–120 / 50–100 / 150–250 m | Bed 1.0–3.0 m within 60–120 m of shore; night 0.5–2.0 (SMH:361,363); 79 % of June positions ≤ 50 m (Sergio 2026) | 6f2784d | default PRIOR (MDIFW 1.5–4.6, H3D:132); **R5 REAL** | yes | keep R5 | Rock/wood structure (SMH:56) |
| A7 | Perch bands (:318) | day [3,5.5], night [0.5,2.5], winter [3.9,5.5] | Madison mean 3.4 m, Sinai 2.5–6.5 m (PPSP:149–156); first ice 1–2.5 m in green weeds, deeper midwinter, back late ice (PPSP:210–221) | 72d9c5f | REAL (day/night); winter lacks early/late-ice | yes | — | A three-part winter (early / mid / late ice) for all perch, not only the juveniles' wbot (B6) |
| A8 | Sunfish/redbreast `seek` + day h 0.3 (stageR5 :544–545) | none → {w 0.6, L 8, big 0.4}, h 0.7→0.3 | ≤ 75–80 mm in dense vegetation (Mittelbach; Werner & Hall — PPSP:654–656); redbreast at wood, lodges, plants (HNS:49) | cd106f3 | REAL (big 0.4 PRIOR) | yes | — | Wood and beaver lodges as structure |
| A9 | Bullhead `bury` 0.9 below 9 °C (:325; :1420) | 0.9 | "Buries in soft, leafy ooze or mud" (WSSB; H3D:108) | 72d9c5f | REAL | yes | — | Mud vs rock substrate (NZ winter catches shifted to rock — WSSB:415) |
| A10 | Sucker / pickerel / sunfish / fallfish / dace bands (:302–380) | as table | H3D:96–97, PPSP:314 (pickerel half of detections 0.76–1.82 m), HNS:125,303 | 283216b/28c05ab | REAL (several [inf]) | yes | — | — |

### B. Juveniles and the young's water

| # | Parameter (file:line) | Now (default → stageR5) | Field value + source | History | Class | Still needed? | Restore to | Missing mechanism |
|---|---|---|---|---|---|---|---|---|
| B1 | Bass `habJ` (stageR5 :470) | none → {L [12,25], bot **[0.3, 1.2]**, wbot [1,3]} | Proposed from the research: day **0.4–2.0**, night 0.3–1.5, winter 1–3 m (JRB:251–252); age-0 solitary among stones (Forbes — JRB:81) | c75429a (0.4–2.0) → c313818 (0.3–1.2: "2/3 of recruits eaten within six weeks") | **COMP** | No (the cover rules B2–B4 now carry the refuge) | **[0.4, 2.0]** | The rocky/cobble shallows where young bass actually shelter (substrate map) |
| B2 | Bass `seek` {w 0.6, L 12, big 0} (stageR5 :575) | none → on | Young smallmouth solitary among stones and sticks, avoid weeds (JRB:81) | c313818 | REAL direction, values PRIOR | yes | — | Substrate (cover is SHALLOW_REFUGE/weeds/rock proxy, :1632) |
| B3 | **Rock cover** `rockC/rockL`: bass 0.6/15, redbreast 0.5/20, fallfish 0.4/12 (stageR5 :589; applied :1421, :1632; wgsl.js:672) | 0 → on, **at any bed < `LIT3.CR_ROCK_Z` 1.5 m** (littoral3.js:85) | MDIFW: "shoreline mostly rocky with some areas of sand … bottom mostly muddy" (SMH:7); structure lies in the shore band (SMH:105–106, 287); unknown whether offshore shoals are rocky (SMH:447) | 85bd755 (probe: 48 of 75 small bass eaten in 60 days) | **COMP (proxy)**: every wave-washed metre is "rock", sand and mud shores included | Until a substrate map exists | Cover by substrate class × interstitial space | **Substrate map** (rock/cobble/gravel/sand/mud/muck), coarse wood |
| B4 | Bass `bury` 0.8 / `buryL` 25 below 9 °C (stageR5 :527; :1420) | 0 → on | Smallmouth don't bury: young shelter in stone gaps < 3 m and stop feeding below 10 °C (Curry 2005 [SEC] — JRB:87) | 03e31d4 ("63 % of the spring's age-1 bass eaten within ~6 weeks") | **COMP (proxy)**; partly **STACKED** with SCOLD/YCOLD (predators near-still in cold water, :129, :626 — added after) | Re-test with SCOLD on | Cold shelter only over rock/cobble | Substrate map |
| B5 | White perch `habJ` (:335; stageR5 :504) | {[8,12],[2.4,3.6]} → **{[7,15],[0.5,2.5]}** | Young 0.5–2.5 m on unvegetated littoral ≤ 60 m from shore (WPHP:178,399–400; Harris 2006 WPHP:132–133); sub-adults 1.5–3.6 m (WPHP:398) | 03e31d4 | default PRIOR (clear-lake Stanley & Danie); **R5 REAL** | yes | keep | — |
| B6 | Perch `habJ` incl. winter `wbot` [1.5, 3.5] (:318) | as shown | Juveniles nearshore by 30 mm (Post & McQueen — JRB:174); 75 % at 1.5–3 m (Fischer & Eckmann — JRB:42); first ice 1.2–2.4 m in green weeds, **deeper as winter goes on** (PPSP:210,221) | 72d9c5f — "putting the young perch in the shallow weeds at first ice … took the perch lost to predators from ~19k to ~72k a year" (FINDINGS.md:207–210) | day REAL; **wbot held all winter = partly COMP** | Partly | wbot at first and late ice; the deep basin in midwinter | A seasonal ice band; the juveniles' shore term (PLAN item 9) |
| B7 | Perch / white perch `yBed` 2.5 m (stageR5 :541) | tried (b840a49, arm U) → **0** (3206eb6) | (young white perch 0.5–2.5 m by day — WPHP:178) | removed: white perch 59.6 vs 46.4 kg/ha | was COMP; **removed** | — | — | It could not work: see B10 |
| B8 | Killifish young `yBed` (stageR5 :521; rule :2441, fallback :2468; wgsl.js:1854,1865,1867,1870) | 0 → 1.2 (c1685d9) → **0.5** (03e31d4) | Young in the shallow vegetated littoral (HNS:268); age-0 25–32 mm by late Sep (KPP:327), 49.5 mm at Opinicon (HNS:231) | the comment: "inside SHALLOW_REFUGE, full at ≤ 0.2 m" (:518) — a predator refuge | **COMP**; and **mis-measured**: tested against 50-m column means (3.1 % of columns ≤ 0.5 m vs 4.8 % of the bed) — today's fix only sends a stranded school to the shallowest neighbour | No | **1.2 m**, tested on the local bed / a shelf class inside the column | Sub-column shelf geometry; the shelf's microcrustaceans (B14) |
| B9 | Sucker `yBed` 0.8, bullhead `yBed` 1.5, sucker `habJ` {[12,25],[0.5,2]} (stageR5 :530, :533) | 0 → on | Sucker fry < 51 mm in 15–20 cm along shores (ADW — WSSB:299–300); bullhead young no depth data (WSSB:433–434) | 03e31d4 | REAL direction, PRIOR values; same column-mean problem (9.3 % of columns ≤ 0.8 m) | yes | test on the local bed | — |
| B10 | **The young's predation per 50-m column, no depth term** (`_yTable` :2205–2219, `_yReq` :2224–2245: density = n/V of the whole column) | — | Predators and prey of a shore slope hold their own water depths (the agents' own `ENC_DZ`, :109–114; FINDINGS.md:81 "a 6-m encounter disc erased the shallows' refuge", :200–206 "a habitat band is not where the fish are") | Y1 03a0497 | **MISSING MECHANISM** (structural): a young school's place inside its 50-m column changes nothing but its cover — every yBed/shelf rule above can only work through the cover number (B11) | — | A bed-depth class dimension in the prey table; predators clear the classes they hold (ENC_DZ weight) | — |
| B11 | `SHALLOW_REFUGE` 0.6 × clamp((0.8 − bed)/0.6) as the young's cover (:161; :2370; also seek :1632, yCover :2433; wgsl.js:672,1625,1834) | 0.6 | No field value; the real effect is predator-side (Power 1987, Schlosser 1987) — which is `SHALLOW_K` for the agents | 28c05ab (slice a); replaced for the agents by SHALLOW_K in 9e02dd0 | **PRIOR**, and a stand-in for B10 | Until B10 | Drop for the young; use SHALLOW_K by depth class | B10; birds in the shallows |
| B12 | Pickerel young `yCover` 0.6, `habJ` {[12,35],[0.3,1.5]} (stageR5 :524; :2433) | 0 → on | YOY "largely confined" to weed patches (MDIFW — PPSP:401); pike < 14 cm in dense vegetation (Grimm 1994); 35–70 % cover (Casselman & Lewis) | 03e31d4 (was off: point schools aggregated, :342–350) | REAL direction, PRIOR value; cover read on the column's representative bed cell | yes | — | Sub-column weeds for the young |
| B13 | `YOY_ROAM` 150 m, `YOY_DBED` 0.8 (:240) | — | Age-0 bass mean 88 m from the nest, < 200 m (JRB:29) | 283216b/81d53d4 | REAL for bass, PRIOR for the rest | yes | — | — |
| B14 | Killifish young `benthL` 1.0 cm (stageR5 :615; `FRY.BENTH_L` 2.5, config.js:201) | 2.5 → **1.0** | Young eat cladocerans and copepods; age 1+ midges, amphipods, ostracods (Phillips 2007 — HNS:233,263); a 1-cm larva cannot take the bed's oligochaetes and amphipods | c1685d9 (growth stalled at 1.5–2 cm) | **COMP** | No, once the real food exists | 2.0 | **Littoral microcrustaceans** (chydorids, ostracods, harpacticoids, Simocephalus/Sida) on plants and the strip's bed |

### C. Refuges and predator–prey geometry

| # | Parameter (file:line) | Now | Field value + source | History | Class | Still needed? | Restore to | Missing mechanism |
|---|---|---|---|---|---|---|---|---|
| C1 | `SHALLOW_K` 0.02 m per cm of predator (:169; :1926, :1968) | on | Fish > 3–4 cm avoid < 20 cm water; large bass hold pools > 50 cm (Power 1987); pickerel half their time at 0.76–1.82 m | 9e02dd0 | REAL mechanism; **STACKED with A1** (killifish banded below every large predator's reach) | yes | keep | **Birds**: Power's point is that the shallows are where herons hunt |
| C2 | `RIFFLE_REFUGE` 0.9, `RIFFLE_D` 0.6, `RIFFLE_L` 10 (:182; :2078) | on | Dace under overhead cover at 15–45 cm/s; with bass present juveniles keep to riffles (Schlosser 1987; HNS:303–305) | 283216b (the brook's dace eaten out) | REAL direction, 0.9 PRIOR | yes | — | Kingfisher, heron, mink at riffles (mink took 30–32 % of tagged stream trout — SBM:209); the stream population above and below (FINDINGS.md:221–223) |
| C3 | `COVER_CS` (stageR5 :584) | 0 → 1 | Capture success falls with stem density (Savino & Stein 1982) | 85bd755 | REAL for stems; PRIOR on the rock proxy (B3) | yes | — | — |
| C4 | `ENC_DZ` 0.3 (:114; stageR5 :460) | 0 → 0.3 | Fish on a slope keep to their own depth | d769dd5 | REAL | yes | — | Not applied to the young (B10) |
| C5 | `BAND_REL`, `BAND_LAKE` 0.6 (:160, :1299; stageR5 :480, :506) | 0 → on | Lower's 3.9 m (geometry) | 03e31d4 | REAL (device / geometry) | yes | — | — |
| C6 | `BROOD.PROTECT` 0.8 (config.js:307) for guarded broods | 0.8 | Guarding fends off most egg/fry predators; 94 % of bluegill nest-area predation by conspecifics when guards are off (Gross & MacMillan — FFE:52–53) | 2-D era | PRIOR | yes | — | Egg predators on nests (bullheads 7 %, snails 11 % of substrate predation — FFE:52–53) |

### D. Movement and the brook

| # | Parameter (file:line) | Now (default → stageR5) | Field value + source | History | Class | Still needed? | Restore to | Missing mechanism |
|---|---|---|---|---|---|---|---|---|
| D1 | `MOVE3.settle` (:385–390; stageR5 :602) | 0.05–0.15 → 0.005–0.06 | 1–5 %/yr (MBCL:114–124); Adirondack chain 43 of 4,649 recaptures changed lakes, ~0.13 % of tagged fish (MBCL:22,37–38); the defaults were "[inf] … not measured" (MBL:186) | 283216b → item 31 | default PRIOR (~10× high); **R5 REAL** | yes | keep R5 | — |
| D2 | Pickerel `trip` 0.15, 28 d (:388) | — | Pike: 10–20 % make a spring run, 93–96 % return (MBL:60–61) | 283216b | REAL (surrogate) | yes | — | — |
| D3 | `ROAM_L` 1000 m (:227) | — | Mattamuskeet west-lake bass never reached the east side (qualitative) | 283216b | PRIOR | yes | — | — |
| D4 | Brook summering share `spawn.brook`: sunfish 0.3 → **0.01**, redbreast 0.5 → **0.02** (:401, :408; stageR5 :598) | — | Lievense 1947 and the human (sunfish in the pools); review estimate 0.2–0.5 fish/m² of ≥ 0.6-m pool → ~100–150 fish | b6d2825 (3,200 crowded into ~300 m² at 10.8/m²) | **PRIOR → a capacity written as a share** (a share doesn't scale with the population; it was cut 30× to stop crowding) | Until a capacity rule | Pool capacity = pool area × density (as `runK` does for nests), the rest stay in the lake | Space-limited (territorial / ideal-free) settling; a fish count from the human |
| D5 | `runK` 150/1725 m², `BROOK_RUN` 1500 m, `BROOK_NEAR` 600 m, `SEED_RUNS` 3 (:217–219, :408) | — | Fallfish 5–15 nests in a 154-m brook, 50–300 spawning at once (fallfish_spawning_brook.md); runs to the other streams "outside the sim" (:283) | 31c9ce8, eb5428d | runK REAL estimate; BROOK_* PRIOR; turned-back runners spawning on lake shoals = **stand-in** for the missing streams | yes | — | **The inlet (Hot Brook into Upper's south shore, ~55 % of its catchment) and the outlet stream** as spawning water, emigration and immigration |
| D6 | The lakes' young never feed in the brook at 1/10 (:2434–2442) | free at true scale | Sucker larvae drift down their spawning stream to the lake at night (BY row 14) | 283216b | device (scale) | at 1/10 only | — | Larval drift |

### E. Spawning and the eggs

| # | Parameter (file:line) | Now (default → stageR5) | Field value + source | History | Class | Still needed? | Restore to | Missing mechanism |
|---|---|---|---|---|---|---|---|---|
| E1 | `SPAWN3.*.bot` spawning depths (:400–410) | sunfish [0.15,1.7], perch [0.5,2], white perch [0.3,1.5], bass [0.5,1.5], pickerel [0.3,1], redbreast [0.25,0.6], fallfish [0.15,0.5], sucker [0.2,0.9]+brook, bullhead [0.3,1.5] | Pumpkinseed nests 0.15–1.68 (Carbine — PPSP:705–707); perch in **brown water 0–1 m** (76 % of egg masses, Huff 2004 — PPSP:232–238); white perch 0–1.5 m (WSSB:132); bass 0.5–1.5 (PPSP:554–559); pickerel ≤ 1 m flooded vegetation (PPSP:399); redbreast 0.43 m (HNS:35–45); bullhead [inf] | eb5428d | REAL (perch slightly deep for tea water; bullhead PRIOR) | yes | perch [0.3, 1.5] | Nest substrate: bass gravel/rubble beside a boulder or log, redbreast within 1 m of rock or wood (85 %), bullhead cavity (substrate map) |
| E2 | Killifish spawning (stageR5 :521) | [0.2, 1.0] → **[0.1, 0.5]** | On plants (Potamogeton) at 0.2–1 m [inf] (HNS:214,216,267) | 03e31d4 ("ripe adults left their refuge to spawn") | **COMP** | No | [0.2, 1.0]; `sub: 'plant'` already picks the structure | — |
| E3 | `sHatch` egg → swim-up (species.js:265–383; species3.js:41,60,78,93) | perch 0.08, pumpkinseed 0.5, redbreast 0.5, bass 0.1, pickerel 0.05, white perch 0.05, sucker 0.1, bullhead 0.6, killifish 0.3, fallfish 0.15, dace 0.2 | Perch: Oneida model eggs → first feeders 7.7 % (1.11 M → 85k/ha — RCM:218–223), Clady egg → 8 mm 1.6–18.4 % (FFE:351); Lepomis nest viability 57–86 % × 90–100 % leaving (FFE:90,94); bass nest Z 7.9–16 %/d (RCM:334) + MDIFW ⅓ deposited, 40 % of nests fail; pike 3–20 % (EFY:55); **no data** for white perch, sucker, bullhead, killifish, fallfish (FFE:621; SOP:264,349–362) | a76fd0a / 283216b | REAL (perch, sunfish, bass, pickerel); PRIOR (the rest). All **constants**: no density, weather or egg-predator dependence | yes | — | **An egg stage** with egg predators (white perch eggs were 100 % of spring white perch diets in a Lake Erie tributary — WPR:208–210; crayfish, bullheads, snails on nests), Saprolegnia, wind/seiche on perch strands (air temperature and wind explained 87 % of perch egg → larva survival, Clady 1976 — FFE:352), cold snaps (a 2–3 °C drop kills white perch eggs, AuClair — GWP:117,122) |
| E4 | Structure hatch multiplier `bare` (perch 0.47; pickerel, killifish 0.3) (:945, :401–409) | on | 98.6 % on structure vs 46.2 % bare (Ward & Barnes 2020 — SOP:89–95) | spawning_on_plants stage | REAL mechanism; **STACKED for perch** (0.08 is already a whole-lake composite: on bare bed 0.038) | yes | perch sHatch ≈ 0.12–0.15 before the multiplier | — |
| E5 | **No incubation**: `_spawn` makes feeding larvae at once (:2167–2171) | — | Perch 8–27 d, white perch 4–5 d at 15 °C, pickerel and bass 2–3 weeks to swim-up (PLAN item 21; SOP:276) | — | **MISSING** | — | — | Egg stage (timing of first feeding vs the zooplankton peak: recruitment peaks when hatch precedes it by ~10 d, Ohlberger 2014 — FZC:317–319) |
| E6 | `SPAWN.SEASON_END` 0.5, `GON_READY` 0.8, `K_READY` 0.8 (config.js:71,75–76); cooldowns (killifish 15 d, pumpkinseed 22 d, redbreast 37 d) | — | Killifish ~3 clutches (Phillips — KPP:42,75); Lepomis repeat spawners | 2-D era | REAL/PRIOR | yes | — | The killifish's missing clutches are a **food** problem (A1/B14), not these gates |
| E7 | `EGG_SCHOOL` (stageR5 :588), bullhead `spawnT` [18,24] + `spawnEnd` 0.38 (:559) | 0 → 1; [21,28] → [18,24] | Blumer 1985: late May–June, one 10–15-day window | 00b413d, 84ea294 | REAL (bug fix; field) | yes | — | — |

### F. The young's mortality and feeding

| # | Parameter (file:line) | Now | Field value + source | History | Class | Still needed? | Restore to | Missing mechanism |
|---|---|---|---|---|---|---|---|---|
| F1 | `FRY.M_LARVA3` 0.04/L(cm), fading by ~3 cm, × Q10 3 below 20 °C (config.js:262; :2379; wgsl.js:1816) | 0.04 (2-D: 0.08) | Total larval Z: Oneida perch 8–18 mm 0.042/d (RCM:119–121); Pelican L. perch **0.15–0.52/d** (FFE:358); bluegill **0.11–0.39/d** for 4 days after dispersal (FFE:236); Pepin 2016: 0.11 / 0.038 at 5 / 10 mm (YPF:309); freshwater survival to metamorphosis 5.3 % (Houde 1994 — FZC:280). Sim background: 0.075/d at 0.5 cm, 0.031 at 1 cm (20 °C), ×0.4–0.6 in spring water → 33–53 % reach 2.5 cm on it | 03a0497 (Y1): halved so "recruits within ~15 % of the old rule's" (GPU_SIM.md:411–412) — when 78 % of the young perch reaching 8 cm were still being discarded at the cap (HOT_BROOK_3D.md:548) | **COMP**: calibrated to keep a recruit count the cap was already cutting; the principle (shrink a stand-in as its predators become explicit — FINDINGS.md:231–234) is right, the amount was not taken from the field | Yes, as invertebrate predation, smaller or larger by measurement | Set the TOTAL larval Z per species to the field (perch 0.04–0.15/d; Lepomis 0.1–0.4/d in the first days) = tallied fish predation + the unsimulated rest | **Invertebrate predators of larvae** (cyclopoid copepods on first feeders, Chaoborus, odonate nymphs, Notonecta, water mites, Hydra — absent from every note: FFE/FZC); wind events; first-feeding mismatch |
| F2 | `FRY.M_JUV3` 0.015 × (D + 0.5)/(3 + 0.5) (config.js:218,262) | 0.015 (2-D: 0.035) | Oneida 18 mm → autumn Z 0.034–0.036/d, ~1.3 % surviving (FZC:259–262), range 0.03–0.06 (FZC:333); survival doubles as density halves (Rose et al. 2001 — RCM:135,222). Sim: background ~0.004–0.006/d at D 0.5/m²; total with explicit predation ~0.016/d at 8 cm (GPU_SIM.md:412) | 44dab54 (compensation form) → 03a0497 (halved) | **COMP** (with F1); the B–H form REAL | yes | Juvenile TOTAL Z ~0.03–0.04/d at Oneida-like densities | **Compensation through predators** (aggregation to dense young, cannibalism, Tarby 1974 — FZC:294–298): the Holling-II gut-limited clearance gives depensation, so today's compensation comes from food exhaustion |
| F3 | `FRY.LARV_A` 0.1 (config.js:253; :2233; wgsl.js:1470) | 0.1 | No direct value: [inf; calibrated]. Planktivores eat larvae heavily — 94 % of bluegill nest-area predation by adult bluegill (FFE:52–53); vulnerability peaks at larva ≈ 10 % of predator length (Paradis 1996 — YPF:252) | 03a0497: 0.3 → 0.1 "the panfish took 41 % of the suckers' hatch" | **COMP** (cut to save recruits) | — | A dome-shaped larval size window on the same clearance (Paradis), no ad hoc multiplier | Sucker larvae's real exposure (they drift down the stream at night) |
| F4 | The young's `M_OTHER` share: `sp.M × BIOE.M_OTHER × min(YM_CAP, (L/Lref)^−0.87)` (:2380, :1274; wgsl.js:1817) | YM_CAP 30 → **3**, YM_COLD on (stageR5 :515) | Lorenzen's size scaling is mostly predation, now explicit; no herons, kingfishers or mergansers under the ice (BY row D) | 03e31d4 | **STACKED** with F1/F2 (both stand for the same "birds, disease, invertebrates") | No for the young | Remove from the young (one background term), or disease-only | Birds as an explicit hazard field (PLAN item 16) |
| F5 | `FRY.CMAX_LARVA` 1.5 to 2 cm, easing to 1 by 4 cm (config.js:189; :2478; wgsl.js:1645) | 1.5 for every species | Breck 1997: bluegill CA ×1.5 to reproduce 0.6 mm/d (FZC:49–50); field rations: perch ~**0.9×** FB4 Cmax at 12 mm, bluegill > Cmax (FZC:189–193) | ba3d516 | REAL for Lepomis; **over-broad** for perch and the rest; **STACKED** with F6 (Breck's fit paired it with higher respiration) | Lepomis only | Lepomis 1.5 with Breck's respiration; perch ~1.0 | — |
| F6 | `FRY.R_WMIN` 0.1 g (config.js:198; :2517; wgsl.js:1770) + stageR5 sunfish/redbreast `bioJuv.RA` × 0.7 (:554–555) | on | R_WMIN was written for steep-exponent sets (a 1-mg bass on Whitledge RB −0.756 at ~2,300 J/g/d). For pumpkinseed it cuts larval respiration to 0.0091 g O₂/g/d (0.01 g, 20 °C) vs FB4's own 0.0144 and **Breck's fitted 0.0305** (Evans 1984 doubled to fit starvation data — FZC:49–50); FZC:202–205 "~0.44× raw FB4". The ×0.7 is Roberts 1964's **30-g adult** pumpkinseed | 6bcc008; 84ea294 (item 26) | **STACKED / over-broad**: one species' fix applied to all, then an adult correction applied to larvae. Maintenance 3–5× below Breck's; a starving larva lasts ~10 days instead of ~3 | — | R_WMIN only for sets with RB < −0.3 (bass, the bullhead's Rice juvenile); measured larval routine rates; no ×0.7 on `bioJuv` | — |
| F7 | `PLANKTON.K_FRY` 30 µg/L type II, `CROP` 0.3 (config.js:994, 1000; :2497; wgsl.js:1675) | 30 | Its own cited range 30–75 µg/L: growth falls 0.6 → 0.2 mm/d below ~50 crustaceans/L (Breck — FZC:145); larval walleye saturate at 20–30/L (Hoxmeier — FZC:150) | ba3d516 | **PRIOR** at the low end; no clearance (search-volume) limit, so the young still crop at 1–10 µg/L | — | ~60–75 µg/L, or a clearance form (L/h per larva × density) | — |
| F8 | `YW_T0` 4 / `YW_T1` 10 / `YW_AGE` 90 (:155; stageR5 :516) | 0 → 4 | Young perch stop growing below ~10 °C (PLAN item 2); white perch young **feed at 4 °C** (fed fish 0 % mortality at 4 °C — Johnson & Evans 1990, WPR:188–190) | 03e31d4 | REAL direction; not species-specific | yes | per species | — |
| F9 | `YO2_MARGIN` 2 mg/L below 10 °C (:150; stageR5 :515) | 0 → 2 | Behavioural avoidance above lethal; Hot Brook not a winterkill lake | 03e31d4 | PRIOR (reasonable) | yes | — | — |
| F10 | `WINTER0` size ramp (config.js:448–462; :2373–2374, :2579–2580) | on | Shuter et al. 1980 lines (FWM:24,296–297); per-species k partly low confidence; FWM:433–435: "a calibration device, not a mechanism"; **white perch die 3.3× faster than yellow perch in winter** (Johnson & Evans 1991 — GWP:58–59) but share perch's k; Oneida white perch winter loss rose with predator biomass and the cohort's abundance, not winter severity (Fitzgerald 2006 — GWP:64–67) | 8a9f9b0 | REAL-ish statistical stand-in; **missing white-perch specificity and density dependence** | yes | white perch k raised from J&E; test the FB4 path (YW_T0 now stops winter feeding) against Post & Evans (FWM:57) | Density-dependent first winter |

### G. Recruitment and regulation

| # | Parameter (file:line) | Now | Field value + source | History | Class | Still needed? | Restore to | Missing mechanism |
|---|---|---|---|---|---|---|---|---|
| G1 | **Census cap `F3.CAP` 1.5** (:232; `_recruit` :2538, :2552; wgsl.js:2062) | 1.5 × census | **No data**: not in FC; "nature has no census cap" (WPR:498,515); called "a safety" (HOT_BROOK_3D.md:191) | eb5428d | **COMP — the white perch's regulator**: 55–64 % of white perch and pumpkinseed recruits discarded (BY row N), up to ~91 % (FINDINGS.md:180–183); white perch sit at ×1.5 | No | Remove, or a ≥ 5× crash guard reported as a failure in every run | White perch regulation: egg cannibalism (E3), their own first-winter loss (F10), density-dependent first winter, adult residual mortality 0.45–0.65/yr (G4), angling 2–8 %/yr (WPR:506) |
| G2 | `RECRUIT_SPRING` (:121; stageR5 :479) | 0 → 1 | Fisheries count recruits at age 1 | c75429a — "two rules took the same 6-cm fish" (FINDINGS.md:63) | **STACKED (device)** for an inconsistency between the young's and the agents' predation rules | Until the rules agree | — | One predation rule for schools and agents |
| G3 | `FRY.SPRING_YF` 0.08 / `OVERWINTER` 0.4 (config.js:265–266) vs `RECRUIT_WARM` (:132; stageR5 :493) | 30 March under the ice → winterWindow[1] ≈ 12 May (yf 0.197) | Recruit when the water warms past 10 °C (BY row M) | a76fd0a → 03e31d4 | SPRING_YF PRIOR, **superseded** in R5 | R5 only | — | — |
| G4 | **`BIOE.M_OTHER` 0.5** for adults, × clamp((L/Lref)^−0.87, 0.5, 3) (config.js:159; :2586; wgsl.js:1365) | 0.5 of M for every species | No source for 0.5 (ENV:52,166,199). White perch age 3+: Z 0.6–0.8 of which **0.45–0.65 non-predation** (WPR:139–143) vs the sim's 0.5 × 0.45 = 0.23; pickerel 0.25–0.4 fits (PPD:475,478); all birds and mammals "a few kg/ha/yr" vs the sim's "other" deaths 10–20 kg/ha/yr (ENV:168) | a76fd0a | **PRIOR**; the size multiplier **STACKED** (Lorenzen's slope is mostly predation, now explicit) | As a residual only | Per-species residual (disease, spawning stress, senescence) from the field partitions; size-independent | **Birds and mammals explicit** (item 16); **angling explicit** (item 37) |
| G5 | Species `M` = 5.4/tmax (species.js:235; values per species) | e.g. killifish 1.35, white perch 0.45 | Hamel & Cope 2022; killifish field Z 1.1–1.8 (PDPM:498–500) | — | REAL | yes | — | — |
| G6 | The census `perHa` (S3 :301–380) | 25–500/ha | "A reasoned estimate" (FC:60–77) | — | PRIOR (fine as a start; wrong as a regulator via G1) | yes | — | A Hot Brook survey |
| G7 | `IMMIGRATION` / `REFUGE` (config.js:1455–1460) | 2-D only | — | — | not used in 3-D (good: persistence is genuine) | — | — | Real stream immigration (dace, alewife, suckers from Hot Brook above) |
| G8 | `FRY.N_PER_AGENT` 3, `MAX_RECRUITS` 12 (config.js:190) | 2-D only | — | — | not used in 3-D (every survivor recruits, up to G1) | — | — | — |
| G9 | `SEED_P` [0.73, 0.5], `SEED_M` 1.6 (:254) | — | Calibrated to the live spring (seed 519) | aaed18d / 9e02dd0 | device that **embeds today's young mortality** | yes | Recalibrate after F1–F7 change | — |

---

## 2. The biggest issues

1. **The young are under-killed between first feeding and autumn, by calibration, and they eat the food out (F1–F3, F5–F7).**
   Stage Y1 halved the background larval and juvenile rates and cut the planktivores' take of larvae ×3. The aim was to bring the
   recruit counts back to the old rule's, at a time when the census cap was already discarding 78 % of the young perch reaching
   8 cm. The background alone now lets a third to a half of the larvae reach 2.5 cm. The juveniles' total Z (~0.016/d) is about
   half Oneida's (0.035/d), so July–September carries roughly 5–15× Oneida's juveniles per hatched larva. On top of that the
   young are more efficient eaters than any published fit: ×1.5 Cmax for every species, and maintenance 3–5× below Breck's for
   the sunfishes (R_WMIN, then ×0.7). They also crop prey at a low half-saturation with no clearance limit. Section 3 gives the
   numbers.
2. **A young fish's habitat cannot be its refuge (B8, B10, B11).** The young's predation is settled per 50-m column, by density
   over the column's whole water volume, with no depth term. A killifish school in a 4-m strip is as exposed to a pickerel 40 m
   out as one beside it. The only thing that differs is a constant cover: `SHALLOW_REFUGE` 0.6. Every yBed and shelf rule
   (killifish 1.2 → 0.5, the perches' 2.5 tried in arm U) therefore works through that one number, which is why arm U changed
   so little. The shelf test itself reads column means: 3.1 % of the true columns average ≤ 0.5 m, against 4.8 % of the bed.
3. **The census cap regulates the white perch (G1); the real regulators are missing.** These are:
   - an egg stage, with egg cannibalism (E3, E5);
   - a white-perch-specific, density-dependent first winter (F10);
   - adult residual mortality of 0.45–0.65/yr, where the sim has ~0.23 (G4);
   - angling.
4. **The killifish strip was narrowed three times for predators (A1, A2, E2, B8, B14).** It went 1.3 → 0.6 → 0.35 → 0.25 m, and
   spawning and the young's nursery moved with it. The strip is now stacked on `SHALLOW_K`, so large predators cannot strike there
   at all. The killifish still fail, because the strip has no food (their ration falls to ~0.45) and no birds. The field supports
   0.1–0.6 m (Maine: "rarely … much over a foot").
5. **Rock and "burying" are proxies for a missing substrate map (B3, B4, A9).** Every bed under 1.5 m counts as rock, whether
   sand or mud. Small bass "bury", which smallmouth do not do.
6. **The bass juvenile band was narrowed to escape predators (B1):** 0.4–2.0 m became 0.3–1.2 m after arm R.
7. **`M_OTHER` is one uniform prior (G4, F4).** It double-counts for the young, it is too low for adult white perch, and in kg/ha
   it is too high for what birds and mammals actually take. The fix is to make birds, angling and disease explicit, each with
   its own value.
8. **Nothing varies from year to year in the early life stages (E3, E5).** There are no eggs, so no egg predation, no wind or
   cold-snap losses and no hatch-date mismatch. With fixed sHatch values, year classes cannot swing the field's 16–200-fold
   (WPR:151; EFY:51).
9. **The brook's capacity is written as a population share (D4).** The streams beyond the two lakes are missing (D5, G7), so
   the brook absorbs every stream role.
10. **Two devices hide model inconsistencies, not ecology (G2, G9).** RECRUIT_SPRING patches the gap between two predation
    rules. SEED_M embeds today's young mortality and must be recalibrated with any change.

## 3. Addendum (the coordinator's evidence): do too many young survive to eat the food out?

**The evidence:**
- **CPU 1/10 lakes:** in late May the young-of-year run at 180k–615k/ha in every depth class. Zooplankton falls from ~10 µg/L to
  0 everywhere by mid-June, and the weeds' small fauna drops 10×.
- **GPU true scale (arm T):** zooplankton is 400–600 µg/L in late May, then ~1–6 µg/L from September to the next May.
- **Hatch (arm T):** 124–209 M white perch, 72 M pumpkinseed, 71 M yellow perch and 0.7 M killifish a year. Over the lakes'
  ~643 ha that is **190–325k, 112k, 110k and ~1.1k larvae/ha**.

**Hatch success (sHatch) is realistic, and so are the hatch densities.**
- Yellow perch: Oneida's model makes 85k first feeders/ha from 1.11 M eggs/ha (RCM:218–223). The sim's perch census × fecundity
  × 0.08 gives ~100k/ha.
- Sunfish: bluegill fry run 54–205k/ha four days after dispersal (FFE:146), against the sim's ~110k/ha pumpkinseed.
- White perch: there is no field comparator. The number follows from fecundity × 0.05 × a population held at the cap.
- Killifish: ~1.1k/ha is far *below* expectation. 233 adults/ha × ~700 eggs × 0.3 should give ~25k/ha. The causes are the
  one-clutch problem and, until 00b413d, the 59 % egg cap.
- So it is not the eggs that make too many young.

**Larval and juvenile mortality are too low, and that was calibrated (F1–F3).**
- **First weeks:** field larval Z in the first weeks is commonly 0.1–0.5/d: Pelican Lake perch 0.15–0.52, bluegill 0.11–0.39 for
  four days after dispersal, Pepin's 0.11/d at 5 mm. Freshwater larvae reach metamorphosis at ~5 %. The sim's background is
  0.03–0.075/d at 20 °C and less in May water. The fish's take of larvae was cut to LARV_A 0.1 because, at 0.3, it took 41 % of
  the sucker hatch.
- **Juveniles (18 mm → autumn):** the field total is ~0.035/d; the sim's total is ~0.016/d.
- **Oneida as the yardstick:**
  - 68k/ha at 18 mm fall to ~920/ha by October (1.3 %).
  - Daphnia tolerate ~10 kg/ha of age-0 perch but collapse above 20–40 kg/ha, and vanish in late summer "whenever YOY perch were
    abundant" (Mills & Forney 1983, FZC:361–366).
  - On the sim's rates, ~400k/ha of larvae become tens of kg/ha of young by July, well past that threshold.
  - The field's partial crash of large Daphnia under strong cohorts is real. A crash of *all* zooplankton to ~0, held into the
    next May, is not: smaller cladocerans and copepods replace Daphnia under heavy predation (FZC:366).

**The young's feeding is tuned toward efficiency (F5–F7).**
- CMAX_LARVA 1.5 applies to every species. It is Breck's Lepomis fit; field perch larvae run at ~0.9× FB4 Cmax.
- Breck paired that 1.5 with a respiration ~3× the sim's. R_WMIN, written for the bass's steep set, plus stageR5's adult ×0.7,
  cut the sunfishes' larval maintenance to about a third to a sixth of Breck's.
- A starving larva therefore lasts ~10 days (tStarve, :2528) instead of the ~3 a Breck-like budget gives.
- K_FRY 30 µg/L is the low end of its own cited 30–75. With no clearance limit, the young keep cropping at 1–10 µg/L.
- **Corroboration** (BY row I): year-1 autumn lengths sit at or above the field for perch (7.8–8.7 vs 5.5–8.1 cm) and bass (7.8–9.2
  vs Maine 5.6–7.6). The young are over-fed early, then starve once the food is gone. Real lakes do the compensating mostly
  through predation in the first weeks.

**Real larval mortality sources that are missing:**
- invertebrate predators: cyclopoid copepods on first feeders, Chaoborus, odonate nymphs (the 2-D sim has ODONATA), Notonecta
  and dytiscids, water mites, Hydra;
- egg predators: conspecific white perch, bullheads, sunfish, crayfish and snails on nests;
- Saprolegnia;
- wind and seiche on perch egg strands, and cold snaps on eggs and bass nests (Clady: air temperature and wind explain 87 % of
  perch egg → larva survival);
- water-level stranding (grass pickerel year class 3–4× smaller — PYOY:251);
- hatch-date / zooplankton-peak mismatch (needs the egg stage);
- predators aggregating on dense young (type III, numerical response), which makes juvenile mortality compensatory through
  predation rather than through starvation.

**What to check after the fixes:**
- larval Z by species against the field rates above;
- July young-of-year biomass against Mills & Forney's 10–40 kg/ha;
- summer crustacean zooplankton staying in the field's 45–100 µg/L, with an autumn recovery and copepods replacing Daphnia;
- autumn lengths inside the field ranges;
- the cap never binding.

## 4. Missing environment features for habitat and recruitment

1. **Substrate map** (rock/cobble/gravel/sand/mud/muck) and **coarse wood**. MDIFW: "shoreline mostly rocky with some areas of
   sand … bottom mostly muddy" (SMH:7). It is needed for:
   - smallmouth nests (gravel or rubble beside a boulder or log — PPSP:556–562);
   - redbreast nests (85 % within 1 m of rock or wood — HNS:45);
   - young bass in stone gaps (JRB:81,87);
   - bullhead nests and burying;
   - crayfish shelter (littoral3 uses the same 1.5-m proxy).

   Possible sources: the human, NAIP and LiDAR shore texture, and a wave-exposure rule (exposed shores → rock and gravel;
   coves → muck).
2. **Sub-column shore resolution for the young.** The 0–1 m fringe is 2–20 m wide at true scale and is lost in 50-m columns.
   The prey table and the young's choices need a bed-depth class (B10).
3. **The shore strip's and the weeds' microcrustaceans** (chydorids, ostracods, harpacticoids, *Simocephalus*, *Sida*). These
   are the first food of littoral larvae (Keast 1980; FZC:368), are distinct from the pelagic Daphnia field, and do not crash
   with it. Bank-fall insects should also be concentrated within metres of a forested bank, not spread over a column.
4. **Invertebrate predators of eggs and larvae** (see section 3).
5. **Birds and mammals as predators** (PLAN item 16), each by depth and size:
   - kingfisher: ≤ 10 cm fish in < 60 cm of water;
   - heron: 5–25 cm fish in ≤ 50 cm;
   - mergansers: 10–13 cm fish;
   - loon: 1–2.5 kg/ha/yr;
   - osprey;
   - bald eagle: inland Maine eagles take mostly bullheads, suckers and pickerel (Todd 1982 — SBM:142);
   - otter and mink: mink 1.5 to > 3 per km of shore.

   Without them every shallow refuge in this audit (A1, C1, C2, B11) is too safe, and M_OTHER stands in for them uniformly.
6. **An egg stage**, with incubation by degree-days, egg predation (including white perch eating their own eggs), fungus and
   physical loss.
7. **Weather variability and year types**: cold snaps, storms and wind on the spawning shallows, summer warmth (PLAN items
   32–33). These are the documented drivers of 16–200-fold year-class swings.
8. **Water levels and the hydrograph** (PLAN item 34):
   - stranding of eggs on spawning sites;
   - the shore strip's position;
   - the brook's riffles closing in a dry August (the human's August 2025 photos).
9. **The inflow and outlet streams** (PLAN item 38):
   - sucker, white perch and fallfish spawning runs;
   - emigration over the outlet: 1–6 fish/acre/season at low-loss outlets, 50–60 % of it in April–May (MBCL:170–175, 210–215);
   - immigration from Baskahegan Stream;
   - sea-run alewife;
   - the brook's dace as part of a stream population (FINDINGS.md:221–223).
10. **Angling harvest and hooking mortality** (PLAN item 37):
    - white perch 2–8 %/yr of adults;
    - pickerel 0.6–1 kept per ha a year;
    - bass 97 % released (ENV:206).
11. **Density-dependent first winter** for white perch: it rises with predator biomass and the cohort's own abundance
    (Fitzgerald 2006), and white perch die 3.3× faster than yellow perch (Johnson & Evans 1991). With items 6 and 10 this is what
    should replace the census cap.
12. **A seasonal ice-period habitat** (early / mid / late ice) for perch, white perch, pickerel and pumpkinseed (PPSP:210–221,
    838; WPHP:184–186). Today winter is one band, which forced B6's all-winter juvenile band.

**Suggested order:**
1. B10 + B11: the young's depth geometry. Without it, habitat cannot act.
2. F5–F7: the young's energetics. These are cheap, and each is checkable against Breck and Mills & Forney.
3. F1–F4: re-derive the background rates from the field totals, minus the tallied fish predation.
4. Item 16, birds.
5. E5, the egg stage, with egg predation.
6. G1: retire the cap, with F10 and G4 per species.
7. Restore A1/A2/E2/B8/B14 and B1 to their field values once 1–4 are in; reassess B3/B4 when a substrate map exists.

Every rule named here has a GPU mirror in `wgsl.js` (lines given), so each change needs both engines and a `g1_check` parity run.
