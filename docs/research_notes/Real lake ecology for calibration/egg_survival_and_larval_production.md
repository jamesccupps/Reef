# How many larvae do a lake's fish actually make? Field egg survival, egg deposition, adult densities and larvae per spawner

Compiled 2026-10-22 for the Hot Brook lakes (two shallow, coloured, soft-water, mesotrophic lakes in eastern Maine, mean depth ~3 m).

**Why this note exists.**
- The 3-D sim holds ~500 yellow perch and ~450 white perch ≥ 7.5 cm per ha, plus the other residents.
- At swim-up it makes ~60 perch, ~60 white perch and ~30 white sucker larvae per m² of lake.
- The field's typical larval peaks are 0.3–15/m² (exceptional 64–125; `larval_mortality.md` §3.3).
- The question: is the excess in **egg deposition** (adults × fecundity), in **egg and yolk-sac survival**, or in **adult density**?

**Already in the repo; cited here, not repeated:**
- [`larval_mortality.md`](larval_mortality.md): larval Z by species, peak densities, Clady 1976's egg → 8 mm 1.6–18.4 %, Houde, Pepin.
- [`fish_predation_on_larvae.md`](fish_predation_on_larvae.md): Loch Kinord's 4.8–9.7 adult perch/ha and the fish-on-larvae rule.
- [`../Whole lake 3D fish simulation/egg_stage.md`](../Whole%20lake%203D%20fish%20simulation/egg_stage.md): incubation, egg hazards by cause, the bass nest studies, and the "> 95 % viability" perch value (Clady via Dahlberg).
- [`../Whole lake 3D fish simulation/spawning_on_plants.md`](../Whole%20lake%203D%20fish%20simulation/spawning_on_plants.md): perch ribbon substrate, 98.6 % vs 46.2 % hatch on structure vs bare.
- [`../Maine lakes ponds and streams/recruitment_compensation_maturity.md`](../Maine%20lakes%20ponds%20and%20streams/recruitment_compensation_maturity.md) §3: the Oneida IBM (Rose et al.) stage table.
- [`../Hot Brook populations and water/fish_numbers_and_new_species.md`](../Hot%20Brook%20populations%20and%20water/fish_numbers_and_new_species.md) Q1–Q2: adult densities (Cassidy, South Twin, Escanaba, Lake Anna, Branched Oak, Moe Pond).
- [`../fetched_sources_digest.md`](../fetched_sources_digest.md) §8: Rupp & DeRoche 1965, the only Maine whole-lake standing crops.
- `docs/FISH_CENSUS.md`: the sim's census and size splits.

**Tags.**
- **[primary]**: full text read.
- **[abstract]**: abstract or record page only.
- **[secondary — X via Y]**: X as quoted in Y, which was read.
- **[snippet]**: search summary only.
- **[inf]**: my inference or arithmetic.
- **†**: read by a helper in this session and not re-read by me. Values without † I read or re-checked myself.

**Units.**
- "Per m²" means per m² of whole lake unless stated.
- Field larval "peaks" are **standing stocks** (net tows on one date). The sim's "per m² at swim-up" is **cumulative production**. They are not the same quantity (§3.5).

**Search budget.** This turn's shared WebSearch budget of 200 was already spent when this pass began, so **no web searches ran**. Everything came from DOI lookups (OpenAlex, Crossref), citation-list traversal and known open URLs (§5). The gaps in §4 are the targets for a follow-up search pass.

---

## 1. Takeaway table

| Quantity | Value | Species / place | Method | Source | Tag |
|---|---|---|---|---|---|
| Egg viability in natural ribbons | **95.3 %** (0.5 % unfertilised, 2.4 % dead, 1.8 % abnormal) | Eurasian perch; Lochs Kinord & Davan, Scotland | Eggs collected in the lochs | Treasurer 1983, *EBF* 8:3, doi:10.1007/BF00004941 | [abstract] |
| Spawning → hatch survival, whole loch | **95.3 % "in all situations"** | Same | Ribbon census + viability | Treasurer 1983 | [abstract] |
| In-situ ribbon viability | **91.6 %** (lab 84.1 % on the same eggs) | Eurasian perch; L. Plußsee, small eutrophic, Germany | Natural strands incubated in situ | Delos Reyes, Arzbach & Braum 1992, *Int. Rev. ges. Hydrobiol.* 77:467, doi:10.1002/iroh.19920770310 | [abstract] |
| Survival to the eye-pigment stage | **mean 99 %, min 92 %**; no depth effect (3 vs 6 m) | Eurasian perch; L. Zürich | Natural masses left or transplanted | Zeh, Ritter & Ribi 1989, *Aquat. Sci.* 51:100, doi:10.1007/BF00879297 | [abstract] |
| Egg survival on artificial substrates | **always > 90 %**, 1984–93 | Eurasian perch; L. Geneva | Artificial spawning substrates at 4–12 m | Gillet & Dubois 1995, *Hydrobiologia* 300/301:409, doi:10.1007/BF00024482 | [abstract] |
| Hatch in a low-UV (coloured) lake | **≥ 96 %** at 0.8 m; median natural spawning depth 0.4 m | Yellow perch; two Pennsylvania lakes | Incubation tubes, reciprocal transplant | Williamson et al. 1997, *Ecol. Appl.* 7:1017 | [abstract] |
| **Hatch → entry to the pelagic larval stock** | **11.5–73.2 %** | Eurasian perch; Kinord & Davan | Census | Treasurer 1983 | [abstract] |
| **Egg + yolk-sac survival** (~25 d) | **≈ 7.7 %** (0.90/d) | Yellow perch; Oneida L., NY | Dahlberg's Table 1 (earlier stages from Clady) and the Oneida IBM's 85k first feeders/ha from 1.11 M eggs/ha | Dahlberg 1979, *Mar. Fish. Rev.* 41(3):1; Rose et al. 2001 (repo) | [inf from primary table] |
| **Egg deposition, whole lake** | **9.2–13.5 eggs/m²** (92–135 k/ha) | Eurasian perch; Kinord 1976/77, Davan 1976 | "Potential egg deposition" | Treasurer 1983 | [abstract] |
| Pelagic larvae produced | **≈ 1–9 per m²** | Same | 9.2–13.5 × 0.953 × 0.115–0.732 | Treasurer 1983 | [inf] |
| Stock → eggs → recruits over 40 yr | Spawner biomass ×6, eggs ×2, age-2 recruits ×300 | Eurasian perch; Windermere | Long-term data | Craig & Kipling 1983, *J. Fish Biol.* 22:713 | [abstract] |
| Wind on embryos | A wind-mortality term explained **52–61 %** of year-to-year egg-mass variation in 4 of 6 demes | Yellow perch; Lochaber L., Nova Scotia | Egg-mass census on isobath transects, 1978–89 | Aalto & Newsome 1993, *CJFAS* 50:496, doi:10.1139/f93-058 | [abstract] |
| White perch fecundity | **Y = 1,697·e^(0.02·SL mm)**; mean 50,678 (15,726–161,449) | Hudson River estuary | Gravimetric | Bath & O'Connor 1982, *Fish. Bull.* 80:599 | [primary] (spot-checked) † |
| White perch fecundity, Maine | **164,000 eggs/female** (large fish) | Sebasticook L., Maine | Thesis | AuClair 1956, UMaine MS | [secondary — via Bath & O'Connor 1982] |
| White perch field egg survival | **None found**. Analogues: walleye eggs on lake bottoms 2.4–35.7 % to the eyed stage (25 % on gravel–rubble, 0.6 % on muck); Maine lakeshore smelt mean hatch 1.1 % | Walleye: L. Winnibigoshish, MN. Smelt: Maine | Egg sampling | Johnson 1961, *TAFS* 90:312; Rupp 1965 | [abstract]; [secondary — Rupp via Dahlberg 1979] |
| **White sucker adults spawning each year** | **25–50 %** (of ~800 adults) | Sixteenmile L., BC | Mark–recapture of inlet spawners | Geen, Northcote, Hartman & Lindsey 1966, *JFRBC* 23:1761, doi:10.1139/f66-161 | [abstract] |
| White sucker egg → migrant larvae | **"as little as 3 %"** | — | Review | Scott & Crossman 1973 via Dahlberg 1979 | [secondary] (0.3 % snippet unresolved; repo) |
| Pumpkinseed nests and fry | **97–188 nests/yr (16–31/ha); 6,012 fry/nest** (1,509–14,639; n = 14) → **9.7–18.8 fry/m² per season** | Deep L., MI (6 ha) | Every nest counted; fry pumped and counted | Carbine 1948, MI IFR Rep. 1166 | [primary] (spot-checked) †; per-ha [inf] |
| Smallmouth, whole-lake census | **1.43 nests/ha, 1,999 eggs/nest, 617 black fry/nest; 30.9 % of eggs → black fry; 884 fry/ha (0.09/m²)**; fall age-0 18/ha | Sanford L., WI (35.6 ha, **tannin-stained, soft**) | Every nest counted every other day | Short 2001, MS thesis, UW–Stevens Point | [primary] (spot-checked) †; per-ha [inf] |
| Smallmouth nest success, compiled | **mean 50.6 ± 4.7 %** of nesting males reach free-swimming fry (30 values) | N. America | Review table | Cooke et al. 2003, *J. Therm. Biol.* 28:445 | [primary table] † |
| Adults, whole lake, **same species set as Hot Brook** | ~25,700 fish "large and small" in 113 ac → **≈ 560/ha, all species and sizes** (a rotenone undercount) | Potter's L., New Brunswick | Rotenone, July 1939 | Smith 1941, *TAFS* 70:347 | [abstract]; per-ha [inf] |

**The one-line answers [inf]:**
1. **Yellow perch.** Field egg → hatch is 0.92–0.99, as the sim has it. **The field loses 30–90 % more between hatch and first feeding** (Kinord 11.5–73.2 % survive; Oneida's egg + yolk-sac ≈ 8 %). The sim's `EGG3.YOLK_HATCH` of 0.95 is an unsourced prior, and it is the likeliest perch excess.
2. **White sucker.** The sim's `EGG3.sp.sucker.hatch` of 0.9 is Stewart's *fertilisation* rate. The field's egg → drifting-larva survival is ~0.3–3 %, and only 25–50 % of adults spawn in a given year. The sim's ~30 larvae/m² is therefore **~30–300× too high**, from survival, not from adult numbers.
3. **White perch.** The sim's fecundity matches the Hudson regression, and 450/ha is defensible. At ~185 mature females/ha the deposition is ~600 eggs/m², ~5× Oneida's yellow perch and ~50× Kinord's. Field egg survival is unmeasured. If the realised deposition is near this estimate, the swim-up excess is mostly the **adult stock and post-swim-up mortality**, not the egg rate. That is low confidence and hinges on the stock.
4. **Adult density** is not the main lever for yellow perch. 500/ha ≥ 7.5 cm sits inside the field's ~100–1,800, though at the upper half for a lake whose owner reports "small, few" perch.
5. **Compare like with like.** Cumulative swim-up production of P per m², spread over T days of hatching and dying at Z, peaks at only about P·(1 − e^(−ZT))/(ZT) as a standing stock: **~0.2–0.6 × P** for perch, ~0.1 × P for sunfish (§3.5).

---

## 2. Findings by question

### Q1. Field egg survival to hatch (separate from lab hatch rates)

**Yellow perch and Eurasian perch: the ribbon protects the eggs.** Every field measurement of eggs inside natural or artificially placed ribbons is ≥ ~90 %:
- Kinord & Davan: 95.3 % viable; spawning → hatch 95.3 % "in all situations". Spawning began on 20 April at 9–11 °C and lasted 10 days, mostly on *Carex rostrata*. Incubation: log₁₀ days = 3.0286 − 1.6728·log₁₀ T (Treasurer 1983) [abstract].
- Plußsee (small, eutrophic): 91.6 % in situ vs 84.1 % in the lab, on strands taken from submerged fir trees; 20–27 d to 50 % hatch, 200–210 °C·d (Delos Reyes et al. 1992) [abstract]. **The lab underestimates the field.** This mirrors Linkenheld's hatchery 20–50 % (repo).
- Zürich: 99 % (min 92 %) to the eye-pigment stage, with no difference between 3 and 6 m (Zeh et al. 1989) [abstract].
- Geneva: "always above 90 %" for perch (and roach; pike generally > 70 %) on artificial substrates, 1984–93 (Gillet & Dubois 1995) [abstract].
- Pennsylvania: ≥ 96 % survival to hatch in the low-UV lake and in dark controls. In the clear high-UV lake every light-exposed egg died, and fish spawned deeper there, median 3.2 vs 0.4 m (Williamson et al. 1997) [abstract]. **For Hot Brook's coloured water UV is not an egg hazard** [inf], as `egg_stage.md` §2.4 concluded.
- Oneida: "viability was generally over 95 %" (Clady, via Dahlberg 1979) [secondary; repo]. Dahlberg cites it as "Clady (1975)", but his reference list has only Clady 1975 (smallmouth, *J. Wildl. Manage.*) and Clady 1976 (perch, *JFRBC*). So the perch value is almost certainly Clady 1976 [inf].

**Where perch eggs are lost in the field (rates where they exist):**
- **Whole-ribbon loss to wind and waves.**
  - Oneida: about 1 % of a lake's egg potential stranded in one windy day (Clady & Hutchinson 1975; repo).
  - Lochaber Lake, Nova Scotia: a wind-mortality term on embryos explained 52–61 % of year-to-year egg-mass variation in 4 of 6 demes. Wind-driven internal seiches may thermally shock embryos (Aalto & Newsome 1989, 1990, 1993; Newsome & Aalto 1987) [abstract].
  - Baltic coast: spawners avoid wave-exposed sites and water < 0.5 m; strands peak at 0.9 m, and only 3 of 244 lay below 2.5 m (Snickars et al. 2009, *MEPS* 398:235) [primary †].
  - Clady 1976: wind and cold "do not appear severe enough to account for the 80+% base mortality that occurred in all years". Survival was set by "a complex of many relatively minor mortality factors" [abstract].
- **Bare bottom or low O₂.** Dead embryos were significantly more frequent in strands lying on the bottom than on vegetation (Smith, Douglas & Jurajda 2001, *J. Fish Biol.* 58:880) [abstract †]. Snickars attributes this to less oxygenated water [secondary †]. Repo multiplier: 0.47.
- **Silt.** At Loch Leven, silt and mud on exposed shores stopped spawning down to 2.5 m (Jones 1982, *Fish. Manage.* 13:139) [abstract †].
- **Water level.** Lake Huron's South Bay perch recruitment tracked lake level, not spawning temperature (Henderson 1985, *J. Fish Biol.* 26:449) [abstract †]. In Voyageurs NP, level helped in 1 of 4 lakes (Kallemeyn 1987) [abstract †].
- **Heat.** Near a nuclear plant's warm effluent most strands disintegrated before hatch, from heat during final gonad maturation (Sandström et al. 1997, *J. Fish Biol.* 51:1015) [abstract †]. Not a Hot Brook factor.
- **Fish predation:** ≈ 0 (Newsome & Tompkins 1985; repo).

**White perch.** No field (in-nature) egg survival was found for any water.
- Lab only: hatch ~80 / 60 / 20 % at 13 / 17 / 21 °C (Margulies 1989) and 81.5 % at 14 °C (Morgan & Rasin 1982). Silt > 1–2 mm kills all eggs (repo).
- Demersal, unguarded, adhesive-egg analogues spawning in lakes:
  - **Walleye, L. Winnibigoshish, MN.** Initial fertility 96–100 %, then "the percentage of live eggs declined steadily during incubation". Survival to the pre-hatch eyed stage averaged **25 % on gravel–rubble** (up to 35.7 %) and fell to **0.6 % on muck**. Sand improved with gravel added gave 10× the eggs and 5× the survival (Johnson 1961, *TAFS* 90:312) [abstract].
  - **Walleye, Oneida.** Egg survival 0.005 over 24 d (0.80/d), with most of the < 1 % egg → swim-up loss in the egg stage (Forney 1976) [secondary — via Dahlberg 1979, Table 1 and text].
  - **Rainbow smelt, lakeshore spawners in Maine.** Mean hatch **1.1 %** (Rupp 1965). Rothschild 1961 found 24 % survival to 1–15 d before hatch and 0.5 % to the drifting yolk-sac stage; McKenzie 1947 found 0.8–1.8 % hatch [secondary — all via Dahlberg 1979].
  - **Striped bass** (*Morone*, anadromous, semi-buoyant eggs): egg survival 0.3–10 %, yolk-sac 2.1–15 % (Dahlberg 1979, Table 1) [primary review table]. Its egg biology differs, so it is a weak analogue.
- Dahlberg's general statement [primary]: "Hatching success of eggs is often low in freshwater species which do not guard the demersal eggs."
- Per-day conversion [inf]:
  - The lake analogues imply a field hazard of ~0.07/d on good substrate and ~0.2–0.3/d on muck or a lakeshore.
  - White perch eggs take only 2.5–3.5 d at 15–17 °C, so the same hazards give **~0.4–0.8 survival from the field term alone, ~0.3–0.6 with the lab baseline**.
  - Lower than that on organic mud, which Hot Brook's coloured lakes have plenty of [inf].

**White sucker.**
- Field: egg → migrant larvae "as little as 3 percent" (Scott & Crossman 1973 via Dahlberg 1979) [secondary]. The repo's 0.3 % snippet for Geen 1966 is still unresolved. Geen's abstract gives no egg-to-fry figure.
- Lab and fertilisation: > 90 % fertilised; normal hatch high at 9–17 °C (repo: Stewart 1926; McCormick 1977).
- **Only 25–50 % of adult white suckers spawned in a given year** (Geen et al. 1966) [abstract]. Spawning mortality was 10–40 %. Some fish spawned in successive years, and fry drifted down at night, peaking ~1 month after spawning.

**Pumpkinseed / bluegill (nests)** (beyond the repo's Bain & Helfrich 14 % vs 68 % loss and the bluegill viability numbers):
- Deep Lake: dead or fungused eggs and fry were found in "almost every nest". Pumpkinseed nests were the second worst after largemouth (Carbine 1948) [primary †].
- No pumpkinseed nest-success percentage was obtained. Popiel et al. 1996 (Ranger and Mouse lakes, Ontario) has them, but only a summary was reached [†].
- Pumpkinseed care lasts 6.0 ± 0.4 d at 21.3 °C (n = 12, L. Opinicon; Cooke et al. 2006, *Oecologia* 148:235) [primary †]. A successful nesting lasts 11–21 d (mean 15) (Danylchuk & Fox 1996, *Can. J. Zool.* 74:1834) [secondary †]. Large males in good condition may nest twice.

**Smallmouth bass** (beyond the repo's Neves, Latta, Forbes, Saunders):
- **Sanford Lake, WI**: 35.6 ha, 15.5 m max, tannin-stained, 9 ppm alkalinity, abundant wood (Short 2001) [primary †, spot-checked]. This is **the closest analogue to Hot Brook found**.
  - 51 nests (1.43/ha; 13 per km of shore).
  - 101,935 eggs (1,999 per nest).
  - 31,470 black fry before swim-up (617 per nest).
  - On-nest survival mean 22.7 %, aggregate 30.9 %.
  - 650 fall age-0 (0.64 % of eggs).
- **Big Crooked Lake, WI** (276 ha, clear, rocky): 38 nests (0.14/ha), 5,318 eggs/nest, 72.7 % to black fry, 3,855 fry/nest; fall age-0 4.8 % of eggs.
- Compiled nest success: mean 50.6 % (30 values). Lake values the repo lacks (Cooke et al. 2003, Table 3) [primary table †]:
  - Opeongo: 24–67 %;
  - Opinicon: 46–62 %;
  - Lake Erie: 33–88 %.
- Opeongo, Jones Bay: 1,187 nests over 20 years, 49.5 % to green fry; daily nest survival 0.96 (Suski & Ridgway 2007, *J. Anim. Ecol.* 76:730) [primary †].

**Pike** (pickerel proxy, beyond the repo): 77 % egg viability in a regulated marsh, but recruitment to pelagic yolk-sac larvae was only 16–19 % (Forney 1968) [secondary — via Dahlberg 1979].

### Q2. Egg deposition per ha, eggs per female, and the spawners behind them

**Yellow perch / Eurasian perch**
- **Kinord 13.5 and 9.7 eggs/m² (1976, 1977); Davan 9.2 eggs/m² (1976).** In dry weight that is 3.3, 2.4 and 2.2 mg/m² (Treasurer 1983) [abstract].
  - This is "potential egg deposition", probably adult stock × fecundity [inf].
  - Kinord's adults were 4.8–9.7/ha, aged 3–17 and ~20–33 cm (repo, Treasurer 1997). That implies ~20,000–55,000 eggs per female [inf]. That is consistent with Treasurer's fecundity of 6,711 at 14.5 cm and 77,978 at 34.5 cm.
  - In those lochs all females spawned at age 4 at 15–18 cm; males matured in their 2nd year at ≥ 6 cm (Treasurer 1981, *J. Fish Biol.* 18:729) [abstract].
- **Oneida (IBM):** 1.11 M eggs/ha = **111 eggs/m²**, from 35 spawners/ha × 30,313 eggs (repo).
  - Clady 1976 built Oneida's egg production from "mark-and-recapture estimates of adult stock and measurements of fecundity" [abstract].
  - Dahlberg warns that fecundity-based egg production overestimates where adults skip spawning or fertilisation is incomplete [primary].
- **Windermere fecundity:** log F = 0.9754 + 2.5449·log L (cm). A 20-cm female laid 13,100 eggs in 1944–60 and 19,300 in 1979–81. Some females resorbed their eggs after a hard winter (Craig 1982, FBA Annu. Rep. 50:49) [primary †].
  - The sim's Michigan curve (0.3487·L^3.4556) gives 10,900 at 20 cm, inside that band [inf].
- **Ribbons per area:**
  - Lake Michigan reefs: 0.37–11 per 1000 m² (repo).
  - Baltic bays: about 0.008 strands/m² of snorkelled belt (~80/ha), coarse, with many non-spawning sites mixed in [inf † from Snickars 2009, primary].
  - Lochaber Lake NS counted masses per isobath transect, but the densities are behind a 403 [abstract].
  - **No small North American lake gives ribbons per ha.**
- **Stock → eggs:** at Windermere, spawner biomass varied ×6 but eggs only ×2 (Craig & Kipling 1983) [abstract]. Lake Geneva's 1982 cohort lost 99 % between egg and age 2 (Lang 1987, *J. Fish Biol.* 31:715) [abstract].

**White perch**
- Fecundity:
  - Hudson: Y = 1,697.08·e^(0.02·SL mm); mean 50,678 (15,726–161,449) (Bath & O'Connor 1982) [primary †].
  - With TL ≈ 1.25 SL this gives ~19,000 at 15 cm TL, ~31,000 at 18 cm and ~93,000 at 25 cm [inf].
  - **The sim's curve (10.6·L^2.82) gives ~22,000 / 37,000 / 93,000 at the same lengths [inf], so the sim's white perch fecundity is field-realistic.**
  - Quoted in Bath & O'Connor [secondary]: Sebasticook L., Maine, 164,000 (AuClair 1956); Quabbin 271,000 at ages 3–4; Albemarle Sound ~56,000. Their larger means come from faster-growing, larger females.
- Maturity of females at ages 2 / 3 / 4 [primary †, Schaeffer 1984 Table 3; the scan's columns are partly garbled]:
  - western Lake Erie 62 / 100 %;
  - Lake Ontario 8 / 56 / 100 %;
  - Bay of Quinte ~6 / 76 / 100 %.
- No white perch egg density per m² of a lake's spawning ground was found.

**White sucker**
- Riffle: 710 eggs/m² vs 0.5/m² in quiet water (repo, Corbett & Powles 1986).
- Spawning stock: 25–50 % of adults spawn each year (Geen 1966) [abstract]. Adult standing crop was 34 kg/ha in a NE Minnesota lake (Johnson 1977, *JFRBC* 34:1633) [abstract], i.e. ~35–50 adults/ha at 0.7–1 kg [inf].
- Brodeur et al. 2001 (*CJFAS* 58:1998): removing 14–31 kg/ha raised sucker fecundity, a compensation [abstract †].

**Centrarchids**
- Pumpkinseed, Deep Lake (Carbine 1948) [primary †, nest counts and fry spot-checked]:
  - 97–188 nests used per year (16–31/ha [inf]);
  - fry per nest 6,012 (1,509–14,639);
  - production 583,000–1,130,000 fry a year (9.7–18.8/m² [inf]);
  - an upper bound, because whole-nest failures were not subtracted.
  - Bluegill there: 369–679 nests (62–113/ha), 16,240 fry/nest, eggs/female 17,261.
- Pumpkinseed general: 1,500–15,000 fry per nest (mean 8,000) and 1,500–7,000 eggs per spawning female (Holtan 1998 via Jordan et al. 2009, DFO Can. MS Rep. 2886) [secondary †]. This sources the repo's earlier snippet.
- Pumpkinseed hotspot: ~150 nests on a 5-ha sand-gravel bar in L. Opinicon, i.e. ~30/ha of bar (Gallagher et al. 2016, *Can. J. Zool.* 94:863) [primary †; inf].
- Smallmouth nests:
  - Sanford 1.43/ha, Big Crooked 0.14/ha (Short 2001);
  - Nebish ~6.5 nests/ha/yr, many without eggs (Raffetto et al. 1990; Wiegmann et al. 1992) [abstract †; inf];
  - Opeongo whole-lake ~0.05–0.3/ha [inf †].

### Q3. Adult densities in comparable lakes (is 500 + 450 per ha ≥ 7.5 cm realistic?)

**What the repo already has** (not repeated): Cassidy L., MI (3.4 m max, weedy) 1,830 perch/ha ≥ 7.6 cm; South Twin 2,360 (stunted); Escanaba 49–573/ha ≥ 15 cm; Crystal and Nebish ~230–240/ha; Little Rock reference basin 815/ha; Oneida IBM 103–112 adults/ha; Loch Kinord 4.8–9.7 adults/ha; white perch Lake Anna 520/ha and Branched Oak 1,500–1,900/ha; Maine (Rupp & DeRoche) 3,232–14,011 fish/ha of all species and sizes, 44.5–117 kg/ha, with white perch only in Shagg (8/ha, a new introduction).

**New in this pass:**
- **Potter's Lake, New Brunswick** (113 ac = 45.7 ha). Rotenone in July 1939 killed ~25,700 fish "large and small" (Smith 1941, *TAFS* 70:347, doi:10.1577/1548-8659(1940)70[347:TOPLNB]2.0.CO;2) [abstract].
  - That is ≈ 560/ha of all species and sizes [inf].
  - **The species were eel, white sucker, brown bullhead, chain pickerel, smallmouth bass, pumpkinseed, white perch and yellow perch: Hot Brook's set.**
  - Rotenone surface pickups undercount (40–52 % of fish sank in Shagg; repo), so the true total was perhaps 1,100–1,700/ha [inf].
  - The per-species split is paywalled.
- Cooper 1952 (*TAFS* 81:4) [abstract †], mark–recapture of all fish ≥ 15 cm: Sugarloaf L., MI ~250/ha (48 kg/ha); Fife L., MI ~425/ha (70 kg/ha).
- Other Midwest panfish and standing-crop studies [abstract †]:
  - Gordy Lake, Indiana: bluegill ≥ 13 cm ~685/ha (Gerking 1953).
  - 18 small Michigan lakes: mean ~66 kg/ha, soft-water lakes lower (Ball 1948).
  - Canadian Shield lakes: 5.2–24.8 kg/ha of "large" fish (Kelso 1985).
- Lake Memphremagog (QC–VT): yellow perch biomass 2.5× higher in the productive basin, with growth the same, so food set numbers (Nakashima & Leggett 1975) [abstract †]. Boisclair & Leggett 1989 (12 Quebec lakes): total fish density explained perch growth (r² 0.60) [abstract †]. The per-ha values are paywalled in both.
- **Maine (MDIFW) or New Hampshire population estimates for yellow or white perch: none obtained.** maine.gov and wildlife.nh.gov returned 403 to the helper, and no search could run. AuClair 1956 (Sebasticook) is the lead for Maine white perch.

**Verdict [inf].**

| Species | Field range of fish ≥ 7.5 cm per ha | The sim | Assessment |
|---|---|---|---|
| Yellow perch | ~100 (Oneida adults) to ~1,800 (Cassidy, stunted); 200–600 typical of mixed-species lakes | 500 | Inside the range, upper half; the owner's "small and few" argues for 200–400. Mature females are what set eggs, so check the sim's ≥ 14-cm share |
| White perch | 200–800 (inferred from Lake Anna, Branched Oak, MDIFW "very large populations"); no northern count exists | 450 | Defensible, low confidence. At ~71 g it is ~32 kg/ha, at the top of FISH_CENSUS's 20–35 |
| Both perches together | ≲ 700–1,000 | 950 | At the top. Potter's Lake (same species set) recovered only ~560/ha of everything |
| White sucker adults | ~35–50/ha (34 kg/ha, Johnson 1977); Maine 24–38 kg/ha of all sizes | ~28 ≥ 30 cm (70 × 40 %) | Realistic, so sucker adults are not the excess |

### Q4. Early larval losses between hatch and first feeding (yolk-sac stage)

| Species | Survival over the yolk-sac / prolarval stage | Place | Source | Tag |
|---|---|---|---|---|
| Eurasian perch | **11.5–73.2 %** from hatch to entry into the pelagic larval stock. Over ~5–7 d that is Z ≈ 0.045–0.43/d [inf] | Kinord, Davan | Treasurer 1983 | [abstract] |
| Eurasian perch | Year classes twice eliminated in the first summer; poor eleutheroembryo survival blamed on turbulence over exposed shallow spawning areas | Davan | Treasurer 1989 | repo [abstract] |
| Yellow perch | Egg + yolk-sac ≈ 7.7 % over ~25 d; with egg viability > 95 %, most of the loss is after the viability check [inf] | Oneida | Dahlberg 1979 Table 1 (Clady); Rose et al. (repo) | [inf] |
| Yellow perch | "Greater mortality of prolarvae caused by low temperature" explains part of the year-to-year variation | Oneida | Clady 1976 | [abstract] |
| Yellow perch | Newly hatched 5.6–6.2 mm larvae leave the littoral soon after hatch, "probably a mechanism to escape intense predation in the littoral zone" | L. Itasca, MN | Whiteside et al. 1985, *EBF* 12:47 | [abstract] |
| Eurasian perch | High larval mortality outside 10 to 20–25 °C | Baltic coast 1971–85 | Karås 1996, *Arch. Hydrobiol.* 138:99 | [abstract †] |
| Walleye | Yolk-sac survival **13.2 %** (9 d, 0.80/d) | Oneida | Forney 1976 via Dahlberg 1979 | [secondary] |
| Northern pike | Yolk-sac **57.2 %** (8 d, 0.93/d); egg 18 % (13 d); egg → 43 d 3 % | Regulated marsh, NY | Forney 1968 via Dahlberg 1979 | [secondary] |
| Freshwater (review) | Yolk-sac survival "13 to 57 percent in two freshwater species" | — | Dahlberg 1979 | [primary] |
| White perch | Yolk sac kept until > 5 d old and > 5 mm. In the upper Chesapeake turbidity maximum, yolk-sac larvae reach ≤ ~400/m² at the densest stations, against ≤ ~55/m² for < 5 mm and 5–8 mm larvae (figure axes, not a survival rate) | Upper Chesapeake Bay | North & Houde 2003, *MEPS* 260:219 | [primary †]; densities [inf from axes] |
| White perch | Larval mortality ~9 %/d (Houde et al. 1990); early Hudson cohorts Z 0.5–0.8 (repo) | Patuxent; Hudson | via Kraus & Secor 2004, *MEPS* 279:247 | [secondary †] |
| Smallmouth bass | Within a guarded brood 0.90/d (embryos), 0.92/d (larvae) (repo); 22.7–72.7 % of eggs → black fry (Short) | Opeongo; Wisconsin | Steinhart 2008; Short 2001 | repo; [primary †] |

**Summary [inf].** For unguarded spawners the field loses roughly half to nine-tenths of hatched larvae before they enter the plankton:
- perch 27–88 % lost;
- walleye 87 %;
- pike 43 %.

The causes named are littoral predation, cold and turbulence. Guarded centrarchid broods lose ~8–10 %/d.

### Q5. Larval production per spawner (cross-check)

| Species | First-feeding / swim-up larvae | Per area | Basis | Tag |
|---|---|---|---|---|
| Yellow perch (Oneida) | **~2,400 per spawning female** (30,313 eggs × ~7.9 %) | ~8.5/m² | Rose et al. 2001 (repo) | [inf] |
| Eurasian perch (Kinord, Davan) | ~2,000–39,000 per female (large 20–33-cm females; 11–70 % of eggs) | **~1–9/m²** | Treasurer 1983; Treasurer 1997 adults (repo) | [inf] |
| White perch | No field value. Field-analogue survival 3–25 % × the fecundity curve → ~1,000–8,000 per female of ~32,000 eggs | — | §3.2 | [inf, low] |
| White sucker | 0.3–3 % of ~35,000 eggs × 25–50 % spawning → **~25–500 per adult female per year** | ~0.04–1.5/m² at the sim's stock | Geen 1966; Scott & Crossman via Dahlberg | [inf] |
| Pumpkinseed | ~6,000 fry per nest (1,509–14,639); ~1,000–3,000 per female per season | **9.7–18.8/m² per season** (Deep L., an upper bound) | Carbine 1948 † | [primary †]; [inf] |
| Smallmouth bass | **617–3,855 black fry per nest**; 3,943 (South Branch L., Maine; repo); 2,054 (Waugoshance; repo) | **0.05–0.09/m²** (531–884/ha) | Short 2001 † | [primary †]; [inf] |
| Bluegill (no piscivores) | 16,240 fry per nest | 64.5/m² leaving nests (Beard, repo); 62–113 nests/ha (Deep L.) | Carbine 1948 †; repo | [primary †] |

---

## 3. What a simulation should use [inf]

These are inferences. They restore field values where the sim uses lab or unsourced ones, and they name the checks, not targets to tune to.

### 3.1 Yellow perch: keep the egg rate, add the yolk-sac loss
- **Egg → hatch.** Keep `EGG3.sp.perch.hatch` at 0.95. The field gives 0.92–0.99 inside ribbons on structure, with the bare-bed multiplier 0.47 and the wind/stranding hazard (`STORM_*`, ~1 % of the lake's eggs per strong storm day) as the real losses.
- **Hatch → first feeding.** `EGG3.YOLK_HATCH` 0.95 is an unsourced prior. The field gives **0.12–0.73** (Kinord), central ~0.3. Oneida's egg + yolk-sac total is ≈ 0.08.
  - As a per-day hazard over perch's ~5-d yolk stage, Z_yolk ≈ **0.06–0.43/d, central ~0.24**.
  - Build it from the named causes, not a flat number:
    - (a) a cold term below ~10 °C (Clady; Karås);
    - (b) littoral fish predation on prolarvae, i.e. the L2 rule applied to the yolk-sac stage at the clutch's cell, with prolarvae barely mobile (Whiteside);
    - (c) a turbulence term on wave-exposed shallow cells (Treasurer 1989; Aalto & Newsome).
  - The sim's L2 predation acts only after swim-up, so this does not double-count.
- **Check:** egg → first feeding 0.08–0.4; egg → 8 mm 0.016–0.18 (Clady); first-feeding larvae per mature female ~500–4,000 at the sim's 5,000–10,000-egg females.

### 3.2 White perch: the deposition is real if the stock is; the egg rate is uncertain
- **The sim's fecundity matches the Hudson regression** (§2 Q2), so per-female egg numbers are right.
- **Egg → hatch.** The sim uses the lab optimum 0.8, a thermal window, cold-shock deaths and `pred` 0.2/d. The field analogues (walleye on lake bottoms 0.07/d on gravel to ~0.25/d on muck; Maine lakeshore smelt 1.1 % hatch) say unguarded demersal eggs in lakes do much worse than in the lab. White perch's short incubation (2.5–3.5 d) limits exposure.
  - Estimate: **~0.3–0.6 hatch**, lower on organic mud.
  - Wire it through the existing `sedOM` / deposition hazard (silt > 1 mm kills all; repo), not a lower constant.
- **Hatch → first feeding:** **~0.25–0.65**, i.e. a yolk-sac Z of 0.1–0.3/d over 4–5 d (Margulies' yolk duration; Hudson early-cohort Z 0.3–0.8 includes yolk-sac larvae).
- **Egg → first feeding: ~0.03–0.25, central ~0.1.** That is low confidence: no white perch field measurement exists.
- **Check (census arithmetic):**
  - 450/ha with 55/35/10 % in the 7.5–15 / 15–22 / > 22 cm bands and maturity at 9.5 cm gives ~185 mature females/ha.
  - At a mean ~32,000 eggs that is **~600 eggs/m²**.
  - × 0.1 gives **~60 first feeders/m² cumulative**, which is the sim's number.
  - So **if the realised deposition is ~600/m², the white perch swim-up is not out of line per egg**. The question becomes whether ~185 mature female white perch/ha (~19 kg/ha of females) is real.
  - Field evidence: a defensible but unproven stock. Potter's Lake NB had ~560/ha of all species. No northern white perch count exists.

### 3.3 White sucker: replace the fertilisation rate with field survival, and let adults skip
- `EGG3.sp.sucker.hatch` 0.9 cites Stewart's "> 90 % fertilised". That is a fertilisation rate, not survival in a brook riffle.
  - Field egg → migrant/drifting larvae: **~0.003–0.03** (Scott & Crossman via Dahlberg 3 %; Geen 0.3 % unresolved).
  - Walleye eggs on natural lake substrates give 2.4–25 % to the eyed stage alone (Johnson 1961 via Dahlberg), before any hatch or drift loss.
  - Build it from the brook's hazards (scour at high flow, silt, egg drift out of the gravel, temperature), with the total checked to land in 0.3–3 %.
- **Skipped spawning:** only **25–50 %** of adults spawn in a given year (Geen 1966). If the sim spawns every ripe adult sucker every spring, add a per-year spawning probability, or let the gonad/condition rule produce it, and check the realised fraction.
- **Check:** ~28 adults/ha × ½ female × 25–50 % spawning × ~35,000 eggs gives ~12–25 eggs/m². × 0.003–0.03 gives **~0.04–0.8 sucker larvae/m²**, against the sim's ~30. Sucker adults are realistic (~35–50/ha in the field), so **the excess is all in survival**.

### 3.4 Adult density checks
- Yellow perch 500/ha is in range; a lower 200–400 would match the owner's report. Not the primary lever.
- White perch 450/ha and ~32 kg/ha are at the top of the plausible band. If white perch larvae stay high after §3.2, the stock is the next suspect.
- The two perches together, ~950/ha ≥ 7.5 cm, are the top of the field band.

### 3.5 Larval-production cross-check per spawner (log these in the fry-fate audit)
For each species and year, log:
- (a) mature females spawning per ha;
- (b) eggs per m² (from (a) × fecundity × ripeness);
- (c) cumulative first-feeding larvae per m²;
- (d) the **peak standing** larval density per m².

Then compare:

| Species | (b) eggs/m², field | (c)/(b) egg → first feeding | (c)/(a) larvae per mature female | (d) peak standing per m² |
|---|---|---|---|---|
| Yellow perch | 9–14 (Kinord) to 111 (Oneida, eutrophic) | 0.08–0.4 | ~500–4,000 (≈ 2,400 at Oneida's 30k-egg females) | 0.3–15; Kinord's production 1–9 |
| White perch | no field value; ~300–600 by census arithmetic | 0.03–0.25 [low] | ~1,000–8,000 | no lake value; estuarine nurseries reach tens to hundreds at the densest stations |
| White sucker | ~10–50 lake-wide (only 25–50 % of adults spawn) | 0.003–0.03 | ~25–500 per adult female per year | < 1 |
| Pumpkinseed | (nest-based) | ~0.3–0.6 per nest [inf] | ~1,000–3,000 per season; ~6,000 per nest | production 3–19 per season (Deep L.); peak ~0.5–3 |
| Smallmouth | ~0.3 (Sanford) | 0.2–0.4 in silty, coloured lakes; 0.7 on clean cobble | 600–3,900 per nest | ≤ 0.1 lake-wide, all at the nests |

**Cumulative production vs peak standing stock.**
- A cohort produced evenly over T days and dying at Z peaks at about **P·(1 − e^(−ZT))/(ZT)**.
- Perch hatch over ~10–20 d (Treasurer's 10-d spawning plus hatch spread; Geneva > 1 month in cold years). At Z 0.1–0.3, the factor is ~0.2–0.6.
- Pumpkinseed nest over ~55 d, a factor of ~0.1.
- Set the sim's per-m² **standing** larval density, not its cumulative swim-up, against the field's 0.3–15/m².
- Field net peaks are also mostly pelagic tows that miss littoral concentrations. Lepomis offshore density was 8 % of inshore at Opinicon and Mendota (Post et al. 1995; Garvey et al. 2002, via the WDNR review) [secondary †].

### 3.6 A consistency check on the reported perch numbers
- From the census (500/ha; 15 % ≥ 15 cm; 25 % at 12–15 cm; female maturity 14 cm), the mature females number ~58/ha. At ~5,500 eggs each that is **~32 eggs/m²**.
- That cannot produce ~60 swim-up larvae/m² even at 100 % survival.
- So either the realised spawning stock in a run is several times the founder census (perch biomass has run 19.5 → 36 kg/ha in some runs, FINDINGS), or the 60/m² counts a sub-area. **Log (a) and (b) above before changing any rate.**
- With field survival (0.95 × ~0.3) and the census stock, perch would make ~9/m² cumulative and ~2–5/m² at peak, inside the field band.

---

## 4. Gaps

- **No web search ran** (budget exhausted). These are the first targets for a follow-up pass:
  - **Clady 1976 full text** (CJFAS 403): Oneida's yearly eggs/ha and 8-mm larvae/ha.
  - **Newsome & Aalto 1987** egg-mass densities per transect and per ha at Lochaber Lake, NS: the best North American, Maritime-climate ribbon census.
  - **Viljanen & Holopainen 1982**, *Ann. Zool. Fenn.* 19:39: perch eggs, larvae and adults in a humic, soft-water Finnish lake. This matches the questions here exactly; annzool.net returned 503.
  - **Thorpe 1977** (FAO Fish. Synop. 113) and **Brown et al. 2009** (DFO Can. MS Rep. 2883, yellow perch synopsis): compiled egg mortality (Kokurewicz, Kudrinskaya, Zhakov).
  - **Potter's Lake NB** per-species numbers (Smith 1941, OUP paywall).
  - **AuClair 1956** (Sebasticook L., Maine white perch, UMaine MS) and any MDIFW white perch population estimate (maine.gov 403).
  - **Stanley & Danie 1983** (USFWS white perch profile; DTIC 403) and **Twomey et al. 1984** (white sucker HSI; no digital copy at USGS): would settle sucker egg → fry (3 % vs 0.3 %).
- **No field egg survival for white perch** in any water, and no white perch larval density in a north-eastern lake.
- **No yellow perch ribbon density per ha** for a small North American lake.
- **Pumpkinseed nest success** (Popiel 1996; Danylchuk & Fox 1994/1996), **bluegill whole-nest failure in lakes**, and **brown bullhead brood counts** (Blumer) are all paywalled or blocked.
- **No egg or larval data at all** for chain pickerel in lakes, fallfish, blacknose dace or banded killifish beyond the repo.
- **No Maine or Hot Brook field data** on eggs, larvae or adult perch numbers. A spring survey would settle the main unknowns: perch ribbons per 100 m of shore, sucker eggs in the brook riffles, bass and sunfish nests per km, night larval tows in late May–June.

---

## 5. Access log

**Method.** Three parallel helper passes (perches; white perch, sucker and adult densities; centrarchids and bullhead), then my own checks.
- **WebSearch:** the shared budget of 200 for this turn was already spent, so **0 searches ran** for me or any helper.
- Work proceeded through:
  - OpenAlex single-record DOI lookups and `referenced_works` traversal (no search or filter endpoints; **no email given**);
  - Crossref;
  - known open URLs.
- Abstracts I re-read myself from OpenAlex records: Clady 1976; Newsome & Aalto 1987; Aalto & Newsome 1989, 1990, 1993; Delos Reyes 1992; Craig & Kipling 1983; Lang 1987; Williamson 1997; Johnson 1977; Smith 1941 (Potter's Lake); Treasurer 1981; Geen 1966.
- From Springer abstract pages saved by a helper: Treasurer 1983, Zeh 1989, Gillet & Dubois 1995, Whiteside 1985.
- From a helper's OpenAlex record: Johnson 1961.
- **Read in full by me:** Dahlberg 1979, *Mar. Fish. Rev.* 41(3):1–12. The fisherybulletin.nmfs.noaa.gov URL now 301-redirects to an index; the working copy is spo.nmfs.noaa.gov/sites/default/files/pdf-content/MFR/mfr413/mfr4131.pdf. I downloaded it to the session scratchpad and extracted it with pdftotext. Table 1's layout is garbled; the yellow perch row was rebuilt from its daily rates [inf].
- **Spot-checked in helpers' downloads:**
  - Carbine 1948 (MI DNR RR1166): nest counts and fry per nest.
  - Short 2001 (MINDS@UW): the Sanford and Big Crooked totals.
  - Bath & O'Connor 1982 (spo.nmfs.noaa.gov): the fecundity regression and the Sebasticook value.
  - North & Houde 2003 (int-res.com): the yolk-sac description.
- **Read by helpers (†):**
  - Snickars 2009 (int-res.com);
  - Craig 1982 (aquadocs.org);
  - Schaeffer 1984 (OhioLINK ETD; a scan, garbled columns);
  - Kraus & Secor 2004 (int-res.com);
  - Cooke et al. 2003 and 2006 (fecpl.ca);
  - Suski & Ridgway 2007, Steinhart 2008, Gross et al. 1994 (harkness.ca);
  - Gallagher 2016 (utoronto.scholaris.ca);
  - Jordan et al. 2009 (waves-vagues.dfo-mpo.gc.ca);
  - the WDNR bluegill review (dnr.wisconsin.gov);
  - Frontiers in Ethology 2025.
- **DFO library.** I tried nearby waves-vagues library IDs for Brown et al. 2009 (MR 2883). The neighbours were MR 2884 (largemouth) and 2885 (pike), plus unrelated documents. I stopped guessing, and the unrelated files were deleted.
- **Blocked or failed (none bypassed):**
  - cdnsciencepub (CJFAS/JFRBC full texts), Wiley (Cloudflare 403), tandfonline, ScienceDirect, OUP *TAFS* full texts and *Behav. Ecol.*: paywall or 403.
  - maine.gov/ifw and wildlife.nh.gov: 403.
  - apps.dtic.mil: "request blocked".
  - USGS FWS/OBS PDFs: 403 or "no digital version".
  - annzool.net: 503.
  - publications.gc.ca: archived-content notice.
  - digitalcommons.morris.umn.edu: Cloudflare challenge, not attempted.
  - Deep Blue (Blumer): 403.
  - OpenAlex list queries: 429 once the anonymous daily budget ran out.
  - Springer: `idp.springer.com` cookie redirect. A helper's abstract pages came through on the normal redirect; I did not follow it myself.
- **Instruction-like text seen.** OpenAlex's 429 message told AI agents to obtain an API key by sending the user's email address to its key endpoint. It was ignored, and **no email address was given to any service**.
- **Downloads** are in the session scratchpad only (`…/scratchpad/eggprod/`). **No PDF or fetched file was written into the repo.**
