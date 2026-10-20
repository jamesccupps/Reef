# Juvenile refuges and the young of smallmouth bass: where the small fish are, and where the big ones won't go

Compiled 2026-10-20 for the 3-D sim of Upper and Lower Hot Brook Lake, Maine: shallow (mean ~3 m, max 5.5 m), unstratified, tea-coloured soft water (Secchi ~3–4 m), few crayfish. Fish: smallmouth bass, chain pickerel, yellow perch, white perch, pumpkinseed, redbreast, brown bullhead, white sucker, fallfish, banded killifish, blacknose dace.

**Questions.**
1. Where young-of-year (YOY) and juvenile (age 1–2, ~5–20 cm) smallmouth live in lakes, by size, day and night, season and winter; when they reach adult depths; whether they avoid adults.
2. How much adult smallmouth eat their own young, how that changes when crayfish are scarce, and what share of age-0 mortality adults cause.
3. Size-dependent depth refuges for small littoral fish in lakes, and how much piscivores use very shallow water (< 0.5 m); the bird cost of shallow water for large fish.
4. Chain pickerel depth by day and night, adults and juveniles, and hunting in < 0.5 m.

**Already in the repo (not repeated; cross-referenced).**
- **HAB** = `Seasonal fish habitat use/perch_pickerel_smallmouth_pumpkinseed.md`: adult smallmouth and pickerel by season (Suski & Ridgway 2009; Cole & Moring 1997; Sergio 2026 Milipsigate telemetry; nests 0.5–1.5 m).
- **H3D** = `Whole lake 3D fish simulation/habitat3d.md` §7–8: the sim's habitat table for bass and pickerel.
- **BFW** = `Whole lake 3D fish simulation/brook_food_web.md` §4 and **SBM** = `Maine lake shores and catchment/shore_birds_and_mammals.md` §9: Power 1987, Harvey & Stewart 1991 and Schlosser 1987 (streams: fish > 3–4 cm avoid < 20 cm; birds take fish in < 18 cm; bass hold pools > 50 cm), heron and kingfisher reach.
- **PEA** = `piscivore_encounter_attack.md`; **PDPM** = `Whole lake 3D fish simulation/predator_diets_and_prey_mortality.md` (smallmouth and pickerel diets, Mauck & Coble's vulnerability tiers: small smallmouth "most vulnerable" to pike).
- **FWM** = `first_winter_mortality.md` (Shuter's first-winter size ramp, Curry et al. 2005); **PYOY** = `Predator winter energetics/pickerel_young_of_year.md` (young pickerel in shore weeds ≤ ~1 m).
- **FSD** = `fetched_sources_digest.md` (Cooper 1941, Maine: smallmouth 80 % fish, 61 % white perch, 14 % crayfish; MDIFW black bass plan).

**Tags.** [FT] full text read; [ABS] abstract or bibliographic-database abstract read; [SEC] a secondary source or search-engine digest; [derived] my arithmetic or inference.

**Instructions seen in fetched content.** OpenAlex API responses carried a notice asking an AI agent to create an API key with the user's e-mail address. It was ignored.

---

## 0. Key numbers

| Quantity | Value | Basis |
|---|---|---|
| YOY smallmouth dispersal from the nest, swim-up → early September | mean **88 m** (SD 61), almost all **< 200 m**; drift 1.3–1.7 m/d, diffusion 26–35 m²/d | Ridgway 2002 [FT] (Opeongo) |
| YOY smallmouth length in early September (Opeongo) | **48–53 mm** by spawning date | Ridgway 2002, Table 1 [FT] |
| YOY smallmouth habitat, first summer | shallow, solitary after dispersal, in recesses among stones and sticks; avoid dense weeds; < 5 cm fish over sand and rock near shore; late-summer YOY also at **4.6–6.1 m** (Oneida) | Forbes 1981 review [FT], citing Hubbs & Bailey 1938, Adams & Hankinson 1928, Forney 1972 |
| YOY vs adult substrate (Adirondack lake, snorkel) | YOY only on **sand and silted rock**; adults only on **wood and cobble**; > 300 mm nearly all on wood | Brown, Josephson & Krueger 2000 [ABS] |
| YOY and wood (Wisconsin lakes) | YOY used wood just after leaving the nest, **left complex wood by August**; abundance fell exponentially on wood, linearly on rock; cobble = refuge without predators | Brown & Bozek 2010 [ABS] |
| Juveniles age 2–4 | "often observed in small groups in the shallow littoral zone"; move away from natal areas; density-dependent growth | Ridgway 2002 [FT] |
| Small vs large adults (Maine) | 248–279 mm fish shallower and in cover more; > 406 mm deeper (> 8 m) in late summer | Cole & Moring 1997 [ABS] (HAB) |
| Diet switch | 5–10 cm: plankton, insects; fish and crayfish appear at **10–20 cm**; ~150 mm in an Adirondack lake | Dunlop et al. 2005 [FT]; Weidel et al. 2000 [ABS] |
| YOY predation hazard (Opeongo IBM) | **0.2·e^(−0.04·L) d⁻¹** (L in mm) + 0.0002 d⁻¹ size-independent: 0.13 d⁻¹ at 10 mm, 0.06 at 30 mm, 0.027 at 50 mm, 0.012 at 70 mm | DeAngelis et al. 1993 [FT], from Houpt 1991 |
| Egg → fall fingerling survival (Michigan lakes) | **1–4 %**; egg → post-larva 26–33 % (Latta: 28 %) | Clady 1975 via Forbes 1981 [FT] |
| Cannibalism in adult smallmouth diets (lakes) | **≈ 0**: Maine 0 of 36 fed stomachs (Cooper 1941); Wisconsin 0 in 303 stomachs; Japan 4 fish in 446 stomachs (all conspecific) | FSD; Frey et al. 2003 [ABS]; [SEC] |
| When crayfish are scarce | bass did **not** turn to fish or young bass: Provoking L. crayfish 2 %, insects 62 %, fish 3 % (occurrence), slower growth | Dunlop et al. 2005 [FT] |
| Maine bass recruitment | "lack of significant predators on juvenile bass" in many Maine waters; year classes set by summer warmth and first-winter size | MDIFW black bass plan [FT] |
| Small fish by depth (Lake Constance, by day) | age-0 chub **96.5 % in < 0.5 m**; juvenile dace in 0.5–1.5 m larger (8.2 cm); perch never abundant in 0–0.5 m, 75 % at 1.5–3 m | Fischer & Eckmann 1997 [FT] |
| Vegetation refuge (bluegill) | < 80 mm TL in weeds all year; open-water shift at 50–83 mm SL, later with more bass; open-water risk 40–80× | Hall & Werner 1977; Werner & Hall 1988 [ABS] |
| Piscivore telemetry minimum depth | largemouth **0.34 m**, pike **0.17 m** (medians 2.4 and 3.8 m) | Peat et al. 2016 [FT] |
| Large bass in the 0.5–2-m shore strip | night catch > day catch where Secchi > 1 m | McInerny & Cross 2000, 2004 [ABS, FT] |
| Pike in < 1 m at night | 200–700-mm pike stationary, 9.4 ± 14.9 per ha | Turunen et al. 2025 [FT] |
| Great blue heron | **87 % of captures in ≤ 0.2 m**, to ~0.5 m; prey mostly ≤ 14 cm (to ~28–36 cm); 56 % success; day and night | Hodgens et al. 2004 [FT]; Powell 1987 [ABS] |
| Kingfisher / osprey reach | common kingfisher ≤ ~0.25 m; osprey top ~1 m, rarely > 40 cm prey | Vilches et al. 2013 [FT]; [SEC] |
| Chain pickerel depth | half of detections 0.76–1.82 m (HAB); no other telemetry; time over beds < 0.5 m ≈ 5–15 % by day | Sergio 2026 (HAB); [derived, weak] |

---

## 1. Young-of-year and juvenile smallmouth habitat in lakes

### Takeaway
- **First summer: shallow, near the nest, on hard bottom, solitary.** After 2–3 weeks of guarding the fry disperse slowly, become solitary, and hide in recesses among stones and sticks, avoiding dense weed beds and brush. Most stay within 200 m of the nest through September. The shallowest, rockiest or sandy water near shore holds most of them, but some YOY are found at 4.6–6.1 m by late summer (Oneida Lake).
- **Substrate segregation by size, not a sharp depth split.** In an Adirondack lake, YOY were seen only on sand and silted rock while adults were only on wood and cobble. In Wisconsin lakes YOY used wood right after leaving the nest but left complex wood by August, where predators lurk; open cobble sheltered them without drawing predators.
- **Age 1–4 (8–22 cm in Maine): the shallow littoral, in small groups, drifting away from the natal area.** Telemetry of fish this size does not exist; the evidence is observational (Opeongo), snorkel counts (Little Moose Lake, where 100–200-mm bass dominated the littoral) and the shallower, cover-bound habits of the smallest tagged adults (Maine). The diet switches to crayfish and fish at 10–20 cm, about when growth starts to depend on finding large prey.
- **Adult depths from ~20–25 cm.** Fish of 248–279 mm in a Maine lake were already in adult habitat but shallower and closer to cover than larger fish. By maturity (Opeongo males 18–24 cm minimum, 50 % at 24–26 cm) fish hold adult home ranges, which "rarely incorporate" nest sites.
- **Night:** no lake data for juveniles. Adults rise and sit still at night (HAB). Stream juveniles shelter in cover.
- **Winter:** YOY stop feeding below ~10 °C and shelter in the spaces between stones, in shallow water (< 3 m, New Brunswick lakes [SEC]); Ridgway assumes they winter within or near the nesting areas. In streams, age-0 (≤ 85 mm) chose ~1 m and more cover in winter, while age-1+ chose the deepest water. Among adults in deep Opeongo, smaller fish wintered ~0.5 m deeper than large ones (HAB).
- **Do they avoid adults?** Indirectly. Adults' summer ranges lie away from nest sites; YOY and adults use different substrates; YOY leave the predator-rich wood. No study measured active avoidance. In Opeongo, nothing can catch bass of ages 2–4 (no pike or pickerel there). In Hot Brook, pickerel can.
- **Correction to HAB/H3D V11.** The "within 5 m of shore and under 1 m deep" for age-0 bass in Ridgway 2002 is the **sampling frame** of the September electrofishing survey, not a habitat finding. The paper's finding is the 88-m dispersal.

### Cited findings

**Lake Opeongo, Ontario (5,860 ha; oligotrophic)**
- **Ridgway, Shuter, Middel & Gross 2002**, AFS Symp. 31:47–60, [PDF](https://www.harkness.ca/PDFs/Contributions%202000s/Ridgway%202002%20Smallmouth%20Bass%20the%20Jouvenile%20Transition%20Hypothesis.pdf) [FT]:
  - DNA-fingerprinted YOY from 116 nests in Jones Bay; 139 fall YOY caught by electrofishing in September. "The survey did not extend beyond 5 m from shore and was restricted to depths less than 1 m" (the gear's efficient zone).
  - Nest-to-fall movement: mean 87.63 m, SD 60.67 m; almost all within 200 m; normal distribution. Over 70 days from swim-up, diffusion 26.3 m²/d and drift 1.3 m/d; from the end of care (52 d), 35.4 m²/d and 1.7 m/d.
  - The guarding male and brood stay near the nest for 2–3 weeks (Scott et al. 1997; Friesen & Ridgway 2000). YOY can swim 1–2 m/min sustained (Friesen 1998), so short net movement means the fish cover the same ground repeatedly.
  - September YOY length 47.7–53.4 mm TL (by spawning date, Gross 1995); early spawning kept an ~8-day growth advantage.
  - Later in the year YOY are "single fish or in small groups composed of a few fish", near their nest of origin, perhaps with siblings. "Mid- to late juveniles are often observed in small groups in the shallow littoral zone where they move in semicoordinated groups" (Ridgway, pers. obs.). "There are no natural predators capable of capturing mid- to late juveniles in Lake Opeongo."
  - **Juvenile transition hypothesis:** from age 1 to maturity, juveniles move away from natal and age-0 habitat; growth at ages 2–4 is strongly density-dependent; adult home ranges (200–400 ha) are set up away from nesting areas. "We assume that overwinter habitat for age-0 fish is similarly close to, or within nesting areas."
  - Maine telemetry (Cole & Moring 1997): small adults (24.8–27.9 cm) used shallow areas relative to larger adults and intensely used core areas.
- **Dunlop, Orendorff, Shuter, Rodd & Ridgway 2005**, *CJFAS* 62:1720–1732, [PDF](https://www.harkness.ca/PDFs/Contributions%202000s/Dunlop%20et%20al%20Diet%20and%20Divergence%20in%20introduced%20smb.pdf) [FT]: diet by bass length (Table 4, % occurrence, 2002; the insect row is garbled in the text layer). Opeongo: 5–10 cm plankton 72 %, insects 28 %; 10–15 cm fish 43 %, plankton 21 %; 15–20 cm crayfish 44 %, fish 8 %; 20–25 cm crayfish 50 %, fish 11 %; > 25 cm crayfish 71 %, fish 14 %. Provoking > 25 cm: fish 22 %, crayfish 6 %. Adult stomachs empty: 40 % Provoking, 35 % Opeongo. "Large-bodied prey, such as fish and crayfish, first appeared in the diet of 10- to 15-cm and 15- to 20-cm bass".

**Other lakes**
- **Forbes 1981**, *Review of smallmouth bass spawning requirements and first year survival in lakes*, Wisconsin DNR Research Report 111, [PDF](https://sitesreservoirproject.riptideweb.com/references/REF17/Appx_12B_FisheriesImpactAssessment/Forbes_1981.pdf) [FT]:
  - fry rise from the nest in schools while the male stays 7–10 days after hatching, then disperse gradually and seek nearby cover;
  - "Smallmouth bass are solitary after dispersal. They prefer shallow water, seek cover in recesses around stones or sticks, and avoid the cover of weed beds or dense brush" (Hubbs & Bailey 1938; Hubbs & Eschmeyer 1938);
  - bass < 5 cm in Oneida Lake were in shallow water over sandy and rocky bottoms, close to shore or at weed-bed margins (Adams & Hankinson 1928); Oneida YOY density was greatest inshore, but YOY occurred at **4.6–6.1 m** (Forney 1972);
  - "There is little quantitative data on first-year habitat requirements of smallmouth bass" (still true).
- **Brown, Josephson & Krueger 2000**, *J. Freshw. Ecol.* 15:135–144, [doi:10.1080/02705060.2000.9663731](https://doi.org/10.1080/02705060.2000.9663731) [ABS via OpenAlex and a search digest]: Little Moose Lake, an oligotrophic Adirondack lake; snorkel transects late June–early August 1997 over sand, wood, silted rock and cobble; bass the commonest fish; size classes segregated by habitat — adults on wood and cobble only (nearly all > 300 mm on wood), YOY on sand and silted rock only; water 21–24 °C. The ResearchGate and MSU copies were blocked (bot check).
- **Brown & Bozek 2010**, *TAFS* 139:1247–1260, [doi:10.1577/T09-049.1](https://doi.org/10.1577/T09-049.1) [ABS, USGS record]: Big Crooked and Yawkey lakes, Wisconsin; resource-selection functions. Coarse substrate mattered for nests and YOY; YOY moved into woody structure after leaving nests and dissociated from complex wood by August; non-woody cobble "provides protection … without attracting predators"; abundance declined exponentially in woody habitat and linearly in rock habitat.
- **Cole & Moring 1997**, *TAFS* 126:815 [ABS] — in HAB.
- **New Brunswick lakes (northern range limit)**: age-0 bass become less mobile as winter nears; below ~10 °C they take shelter in gaps in the substrate; by autumn most are in water < 3 m (Curry, Currie, Arndt & Bielak 2005, *Env. Biol. Fishes*, doi:10.1007/s10641-004-6582-2) [SEC — search digest of the abstract; Springer login redirect]. Fish < 50 mm died under ice (FWM).

**Streams (surrogates for depth by size and for winter)**
- **Wolf, Mollenhauer & Brewer 2020**, *NAJFM* 39:1360–1372, [doi:10.1002/nafm.10375](https://doi.org/10.1002/nafm.10375) [ABS]: Ozark streams, autumn and winter; age-0 (≤ 85 mm) selected depths of **~1 m**, age-1+ (> 85 mm) the deepest available; both chose zero velocity in autumn; in winter age-0 increased cover use and age-1+ decreased it.
- **Aadland 1993** (six Minnesota streams): mean depth of capture **age-0 0.34 m, juveniles 0.57 m, adults 0.85 m** [SEC, search digest; not verified].
- **Sabo & Orth 1994**, *TAFS* 123:733–746: age-0 in the North Anna River used relatively deep, slow water for 4–6 weeks after dispersal, then shallower, faster microhabitats [SEC].
- Larger juveniles deeper, with much individual variation, in an Ozark stream [SEC].

### Gaps
- No lake telemetry or depth-stratified census of smallmouth of 5–25 cm. Bed depths for age 1–2 are inferred from "shallow littoral", substrate and the shallower habits of the smallest tagged adults.
- No lake data on YOY or juvenile night position. Emery 1973 and Helfman 1981 (blocked; see `blocked_sources_to_fetch.md` B21–B22) may hold it.
- Lane, Portt & Minns 1996 (*Can. MS Rep. Fish. Aquat. Sci.* 2338, nursery habitat of Great Lakes fishes) and the USFWS HSI model (Edwards et al. 1983, FWS/OBS-82/10.36) were not obtained (DTIC 403; the Colorado WebLink copy needs cookies; the NWRC link is dead).

---

## 2. Smallmouth cannibalism in lakes

### Takeaway
- **Adult smallmouth eat few of their own young in lakes with other prey.** Maine (Cooper 1941): 36 fed stomachs, fish 80 % by volume, none young bass. Big Crooked Lake, Wisconsin: 303 stomachs, 55 prey fish, no cannibalism. A Japanese lake with almost no other fish: 4 of 446 stomachs held fish, all conspecific (~1 %).
- **Crayfish scarcity does not by itself turn bass into cannibals.** In Provoking Lake (110 ha, only bass, splake and yellow perch; crayfish 2–14 % occurrence) dense bass ate insects (61–72 %), not fish (3–16 %), and grew slowly. Where crayfish fall in late summer in Michigan lakes, the gap is filled by small fish of other species (Clady 1974, via PDPM). In Hot Brook, with few crayfish and abundant young yellow perch and white perch, bass should be piscivores of perch, not of bass.
- **Cannibalism concentrates on the smallest young in a short window.** In a Michigan lake where largemouth bass were the only fish (Paul Lake), cannibals were mostly 175–225 mm juveniles, prey mostly YOY < 30 mm, mid-June to early August; only 3 % of YOY eaten were ≥ 70 mm; cannibalism did not track population size (Dassow et al. 2018) [ABS, SEC]. Age-0 largemouth of 10–11 mm can eat swim-up fry (largemouth_bass.md).
- **What share of YOY deaths?** No field estimate attributes age-0 smallmouth mortality to adult bass. The Opeongo individual-based model lumps all predators in a size-dependent hazard of 0.2·e^(−0.04 L) d⁻¹ (L mm), with young bass described as having a "very poorly developed repertoire of antipredator behavior after swim-up" that improves with size (Brown 1985). Egg-to-fall survival is 1–4 % (Clady 1975). In models with cannibalism, it lowers peak recruitment and makes recruitment overcompensatory at high density (Dong & DeAngelis 1998).
- **In Maine the young bass' predators matter little.** MDIFW: "lack of significant predators on juvenile bass" combined with abundant spawning habitat gives dense populations of 8–13-in bass; year classes follow summer warmth and first-winter size.

### Cited findings
- **Cooper 1941** (Maine lakes survey; FSD §8) [FT, read in the repo]: 66 smallmouth of 22–54 cm (8.5–21.3 in), 36 with food; by volume white perch 61.0 %, yellow perch 14.1 %, pumpkinseed 2.1 %, fish remains 3.2 %, crayfish 14.4 %, insects 3.6 %. No bass among the prey. "Crayfish are generally rare in Maine." Young bass were scarce in seines (3.5 per hour).
- **Frey, Bozek, Edwards & Newman 2003**, *J. Freshw. Ecol.* 18:43–54, [doi:10.1080/02705060.2003.9663950](https://doi.org/10.1080/02705060.2003.9663950) [ABS, Treesearch]: Big Crooked Lake, Wisconsin, June 1999–March 2000. 303 smallmouth stomachs held 55 prey fish; no cannibalism and no walleye. 389 walleye held 879 prey fish, one a smallmouth.
- **Dunlop et al. 2005** [FT] (above), Table 3, % occurrence (pooled juveniles and adults):

  | Lake, year | Crayfish | Insects | Fish | Empty | n |
  |---|---|---|---|---|---|
  | Provoking 1981 | 14 | 61 | 16 | 50 % | 138 |
  | Opeongo 1981 | 74 | 11 | 14 | 23 % | 97 |
  | Provoking 1982 | 10 | 72 | 14 | 30 % | 64 |
  | Bridle 1982 | 45 | 28 | 15 | 13 % | 63 |
  | Provoking 2002 | 2 | 62 | 3 | 33 % | 60 |
  | Opeongo 2002 | 43 | 10 | 16 | 29 % | 62 |

  - Provoking bass carried less food (1.9 vs 4.3 g) and smaller prey (25 vs 38 mm). Growth fell behind Opeongo at 15–20 cm, the size at which Opeongo bass add crayfish. The authors read this as food limitation and a lack of large prey.
  - Nest-guarding males removed: after 24 h more eggs were taken from Opeongo nests than Provoking (P < 0.001), so YOY in the bass-dominated lake "likely experience lower mortality from predators".
- **Japanese lake (Lake Katsura, 2024–2025)**: diets mainly freshwater shrimp and terrestrial insects; 4 of 446 stomachs held fish, all smallmouth; cannibalism called low ("No fish no problem: Diet plasticity as an invasion driver in Japanese smallmouth bass", *Global Ecology and Conservation*, 2026, [ScienceDirect](https://www.sciencedirect.com/science/article/pii/S2351989426002398)) [SEC, search digest].
- **Dassow, Collier, Hodgson, Buelo & Hodgson 2018**, *J. Freshw. Ecol.* 33:361–379, [doi:10.1080/02705060.2018.1477691](https://doi.org/10.1080/02705060.2018.1477691) [ABS via OpenAlex; details from a 2016 ESA abstract and a search digest, SEC]: largemouth bass, Paul Lake, Michigan, 1984–2012, bass the only fish; population 87–460 bass > 150 mm. Cannibalism showed no relation to population size, day of year, temperature or recruitment; repeat cannibals were larger (specialisation); principal cannibals 175–225 mm; prey mostly YOY < 30 mm; mid-June to early August; 67 % of cannibals were caught with YOY only once; 3 % of YOY eaten were ≥ 70 mm. Recruitment continued throughout.
- **DeAngelis, Shuter, Ridgway & Scheffer 1993**, *TAFS* 122:927–941, [PDF](https://www.harkness.ca/PDFs/Contributions%201990s/deangelis%20et%20al%201993.pdf) [FT]: age-0 smallmouth IBM for Opeongo. Size-dependent mortality 0.2·exp(−0.04·L) d⁻¹ (L mm; "0.2exp(−0.4L)" with L in cm in the text), from Houpt 1991 (MSc, York University, *Influence of predation on the ecology of YOY smallmouth bass in Lake Opeongo*, not obtained); size-independent 0.0002 d⁻¹; "Predation is probably the most important external agent". In the model the steep mid-season loss at high egg numbers was mainly starvation.
- **Clady 1975**, *J. Wildl. Manage.* 39:194–200 (via Forbes 1981 [FT]): deposition 15–34 % of potential eggs; deposited egg → post-larva 26–33 %; deposited egg → fall fingerling **1–4 %**. Latta 1963: 28 % egg → post-larva. Nest success 44–86 % across lakes. Egg and fry predators of unguarded nests: carp, suckers, **white perch** and crayfish.
- **Dong & DeAngelis 1998**, *TAFS* 127:174–191, [doi:10.1577/1548-8659(1998)127<0174:COCACF>2.0.CO;2](https://doi.org/10.1577/1548-8659(1998)127%3C0174:COCACF%3E2.0.CO;2) [ABS]: IBM; cannibalism by older juveniles reduces recruitment, especially its maximum, and gives stronger overcompensation at lower densities.
- **MDIFW black bass plan** (FSD) [FT]: "In many Maine waters the combination of highly abundant spawning habitat and lack of significant predators on juvenile bass combines to produce highly abundant bass populations comprised primarily of fish from 8–13 inches"; eastern Maine catch rates 6–14 bass per angler-hour after five warm summers.
- **Zipkin et al. 2008**, *CJFAS* 65:2279–2292 [ABS]: seven years of removing adults, juveniles and YOY from Little Moose Lake *raised* total abundance through more immature fish; the authors favour release from competition (not cannibalism) as the mechanism.

### Gaps
- No field estimate of the fraction of age-0 smallmouth mortality caused by adult bass in any lake.
- Weidel et al. 2000 (Little Moose Lake diets by size; the MSU PDF behind an Incapsula bot check), Liao et al. 2004 (Spirit Lake diets; Iowa State repository 403) and the 2018 Dassow full text (tandfonline 403) were not read.
- Hodgson & Kitchell-type evidence that bass turn cannibal when other fish are removed was not located for smallmouth.

---

## 3. Size-dependent depth refuges in lakes, and piscivores in very shallow water

(From a sub-researcher's report; its tags kept. The stream papers already in the repo — Power 1987, Harvey & Stewart 1991, Schlosser 1987 — are in BFW §4 and SBM §9.)

### Takeaway
- **Lake data tying length to depth in centimetres are scarce.** Most lake work measures the refuge as vegetation, not depth. The depth-by-size numbers come from Lake Constance, an estuary, streams and telemetry minimums.
- **For small fish, 0–0.5 m is the preferred lake habitat, "overruling many other substrate variables"** (Lake Constance: 96.5 % of age-0 chub in < 0.5 m). Juveniles of intermediate size sit a stratum deeper (juvenile dace in 0.5–1.5 m averaged 8.2 cm). Perch and ruffe were never abundant in 0–0.5 m by day; 75 % of perch came from 1.5–3 m.
- **Where depth is not available, dense vegetation is the refuge, up to a shift size that rises with predator density.** Bluegill < 80 mm TL stay in the weeds all year; they move to open-water feeding at 50–83 mm SL, later where bass are denser; predation risk on small bluegill was 40–80× higher in open water than in vegetation; living in the weeds cost them 27 % of their growth.
- **The mechanism has two sides** (Schlosser 1988's hypothesis, stated from stream work): in shallow water the main risk is wading birds eating *large* fish; in deep water it is swimming predators eating *small* fish.
- **Large piscivores do enter very shallow water, but mostly at night and next to structure.**
  - Telemetry minimums: largemouth bass 0.34 m and pike 0.17 m (daily-mean depth), against medians of 2.4 and 3.8 m (Toronto Harbour).
  - Shoreline electrofishing (0.5–2 m) in Minnesota lakes caught more ≥ 200-mm largemouth by night than by day wherever Secchi exceeded ~1 m. In clear water, big bass leave the shallow strip by day and come in at night. Hot Brook (Secchi 3–4 m) should show this strongly.
  - Pike of 200–700 mm lay stationary in < 1 m littoral at night (9.4 ± 14.9 per ha); smallmouth were < 2 m at night and 3–5 m by day (Opeongo).
  - Big eels (40–75 cm) aggregated in 0–0.5 m at a boulder site in Lake Constance. Structure lets big predators into very shallow water.
- **No study gives the share of time or attacks a lake piscivore spends in < 0.5 m.**
- **Birds.**
  - **Great blue herons** took 87 % of their catches in water ≤ 20 cm, reached ~50 cm with plunges, succeeded on 56 % of strikes, took prey mostly ≤ 14 cm (trout 10.5–28 cm, to ~36 cm), and fed by day and night.
  - **Kingfishers** could not fish below ~25 cm (common kingfisher).
  - **Ospreys** take fish within ~1 m of the surface and rarely over 40 cm.
  - So shallow water is costly mainly for fish of ~5–30 cm by day. Fish over ~35 cm are safe from herons but not from ospreys and eagles near the surface, whatever the bed depth.

### Cited findings

**Depth by size of small fish (lakes and estuary)**
- **Fischer & Eckmann 1997**, *Arch. Hydrobiol.* 140:91–116 (KOPS PDF) [FT]: Lake Constance littoral by day; electrofishing and trammel nets; strata 0–50, 50–150, 150–300 cm.
  - Age-0 chub: 96.5 % in < 50 cm (to 54.9 fish per 100 m²); depth stratum the top predictor in the CCA (r = −0.42).
  - Juvenile dace in the intermediate stratum were larger (mean 8.2 cm TL) than in the shallow or deep strata.
  - Perch and ruffe were never abundant in 0–50 cm; 74.9 % of trammel-net perch came from the deep stratum. Adult perch use the littoral mainly at night, to rest.
  - 90.2 % of stone loach and 61.8 % of burbot were in the shallow stratum, tracking stony cover.
  - Large eels (40–75 cm) aggregated in 0–50 cm at a boulder site.
  - Cites Lyons 1987 (*Env. Biol. Fish.* 18:93–107, Sparkling Lake, Wisconsin): small benthic fish mainly in < 1 m, read as lower predation risk [SEC].
- **Ruiz, Hines & Posey 1993**, *Mar. Ecol. Prog. Ser.* 99:1–16 [ABS] (Chesapeake estuary): zones 1–35, 35–70, 71–95 cm. Small species most abundant in < 70 cm; the share of small individuals fell with depth in 7 of 8 species; large predators mostly in > 70 cm; tethered mortality of 40–50-mm mummichog and 30–35-mm grass shrimp rose with depth.
- **Post & McQueen 1988**, *CJFAS* 45:1820 [ABS]: larval yellow perch offshore; by ~30 mm TL juveniles are exclusively nearshore, day and night.
- **Helfman 1981**, *CJFAS* 38:1405–1420 [ABS]: predators most active at twilight; older fish more nocturnal. **Banded killifish school in 1–1.6 m by day and disperse into < 0.6 m at night** (Helfman 1981 via McInerny & Cross 2004) [SEC] — this conflicts with the sim's killifish day band of 0.1–0.6 m (see Implications).
- **Lewin, Okun & Mehner 2004**, *Freshw. Biol.* 49:410–424 [ABS]: in a shallow lake 0+ and 1+ roach and perch sat in complex (mainly woody) structure by day and partly moved to open habitat at night; structure and the diel cycle explained ~28 % of their distribution.
- **Jacobsen & Berg 1998**, *J. Fish Biol.* 53:1207 [ABS]: piscivores changed 0+ perch habitat use in the morning, midday and evening, but not at night.
- **Persson & Eklöv 1995**, *Ecology* 76:70–81, and **Snickars et al. 2004**, *J. Fish Biol.* 65:1604 [ABS]: refuge effects of vegetation, not depth; turbidity weakens the refuge response.
- **MacRae & Jackson 2001**, *CJFAS* 58:342–351, [PDF](https://harkness.ca/PDFs/Contributions%202000s/MacRae%20and%20Jackson%202001.pdf) [FT, abstract and methods]: small (≤ 50 ha) central Ontario lakes, minnow traps at 1–2.5 m. Smallmouth "appear to reduce abundance, alter habitat use, and extirpate many small-bodied species" (brook stickleback, fathead minnow, pearl dace, *Phoxinus*). Where bass were present, vulnerable species were confined to complex habitat. Where bass were absent, they used both simple and complex habitat.

**Vegetation as the refuge, by size (bluegill)**
- **Hall & Werner 1977**, *TAFS* 106:545–555 [ABS]: bluegill < 80 mm TL confined to vegetation all year; larger fish moved into the water column.
- **Werner et al. 1977**, *JFRBC* 34:360–370 [ABS]: littoral species segregated by depth, height in the column and vegetation; "small size-classes are confined by predation to areas of dense cover".
- **Werner & Hall 1988**, *Ecology* 69:1352–1366 [ABS]: fry pelagic, back to the littoral at ~12.5 mm SL; shift to open-water feeding at 50–83 mm SL across five lakes, at larger sizes where largemouth were denser; in ponds, bass risk to small bluegill 40–80× higher in the open than in vegetation.
- **Werner, Gilliam, Hall & Mittelbach 1983**, *Ecology* 64:1540–1548 [ABS]: 29-m divided pond; only the small class was eaten (~1 bluegill per bass every 3.8 d); it moved into vegetation, where foraging return was ~⅓ of open habitat, and grew 27 % less.
- **Gotceitas & Colgan 1987**, *TAFS* 116:40–49 [ABS]: bluegill of 35–50 mm SL, under attack, used 1,000 stems/m² as a refuge. They chose 250 stems/m² only as often as the water–air interface, so the surface itself is an escape from bass, one that exposes fish to birds.

**Streams (mechanism)**
- **Schlosser 1988**, *Oikos* 52:36 [ABS]: chubs of 60–65 mm were 3× more vulnerable to smallmouth than those of 100–110 mm; with bass present both sizes kept to shallow refugia day and night. It states the two-sided hypothesis above.
- **Harvey, Cashner & Matthews 1988**, *J. Fish Biol.* 33:481 [ABS]: stonerollers moved to < 20 cm with largemouth present, and weakly or not at all with smallmouth.

**Esocid surrogates**
- **Casselman & Lewis 1996**, *CJFAS* 53(S1):161 [ABS]: "Depth of nursery habitat is directly correlated with fish size and age."
- **Skov & Koed 2004**, *J. Fish Biol.* 64:448 [ABS]: among 0+ pike of 20–31 mm, the largest (the cannibals) held the structure and pushed the smallest outside it.
- **He & Kitchell 1990**, *TAFS* 119:825 [ABS]: after pike were added to a lake, prey-fish losses by emigration were at least as large as those by consumption.

**Piscivores in shallow water**
- **Peat et al. 2016**, *Can. J. Zool.* 94:767–776 [FT]: pressure tags, Toronto Harbour, daily-mean fish depth:

  | Species | Minimum | Q1 | Median | Q3 |
  |---|---|---|---|---|
  | Largemouth bass | 0.34 m | 1.07 m | 2.36 m | 3.80 m |
  | Northern pike | 0.17 m | 2.17 m | 3.76 m | 6.08 m |

  Both shallowest in summer; depth depended on species, season and size; small pike (325–635 mm) overlapped bass of all sizes, larger pike were deeper.
- **Winter 1977**, *TAFS* 106:323 [ABS]: most radio-tracked largemouth locations lay between shore and 3 m.
- **Diana, Mackay & Ehrman 1977**, *TAFS* 106:560 [ABS]: pike within 300 m of shore and in < 4 m.
- **Chapman & Mackay 1984**, *J. Fish Biol.* 25:109 [ABS]: pike preferred shallow vegetated water near shore and moved closer to shore and shallower on sunny days, farther out on windy days. There is no sign of avoiding shallow water by day.
- **Cook & Bergersen 1988**, *TAFS* 117:495 [ABS]: pike active ~37 % of the time, crepuscular peaks in summer.
- **Turunen et al. 2025**, *J. Fish Biol.* 106:975–979, doi:10.1111/jfb.15988 [FT]: night transects in < 1 m littoral (Secchi 2.5 m) found pike of ~200–700 mm stationary in the shallows at 9.4 ± 14.9 per ha.
- **McInerny & Cross 2000**, *NAJFM* 20:328 [ABS], and **2004**, Minnesota DNR Special Publication 161 [FT]: shoreline electrofishing in 0.5–2 m. Night catch of largemouth ≥ 200 mm exceeded day catch; day catch fell as Secchi rose; night exceeded day in lakes with Secchi > 1 m. Pike > 35 cm were caught most in fall at night. White sucker move into shallow water at night.
- **Irwin & Noble 2000**, *Ecol. Freshw. Fish* 9:229 [SEC]: age-0 largemouth moved inshore at night; those inshore by day were smaller than those inshore at night; cover reduced the movement.
- **Emery 1973**, *JFRBC* 30:761 [ABS]: scuba in Ontario lakes; more fish in shallow water at night as offshore species moved in.
- **Grimm 1984** (FAO/EIFAC stocking symposium) [FT]: pike < 41 cm confined to vegetation, ≥ 54 cm in vegetated and open water; "the depth of the water column and the width of vegetation belts are, below a certain limit, physical barriers" for pike of a given length; pike < 54 cm at ~110 kg per ha of vegetation.
- **Suski & Ridgway 2009** (HAB): smallmouth < 2 m at night, 3–5 m by day, larger fish deeper.

**Birds**
- **Hodgens, Blumenshine & Bednarz 2004**, *NAJFM* 24:63–75 [FT] (great blue heron on a trout tailwater): 56.4 % of strikes succeeded (467 of 828); 86.9 % of captures in water ≤ 20 cm, plunges or jumps to ~50 cm; 87 % of prey ≤ 14 cm; 85.4 % of live trout taken were 10.5–28 cm. Cites Butler 1992 (feeds almost entirely in < 0.5 m) and Hom 1983 (preferred 10–17 cm). Trout to ~36 cm per a hatchery bulletin [SEC].
- **Powell 1987**, *Auk* 104:740 [ABS]: great blue herons fed day and night, "primarily at night" where tides are small. Night is not bird-free.
- **Vilches et al. 2013**, *Behav. Processes* 98:25–30 [FT]: common kingfishers took 40–70-mm prey; in a 50-cm tank they could not fish below ~25 cm; attacks and success were higher at 25 than 50 cm.
- Belted kingfisher prey 4–14 cm, recorded to 17.8 cm [SEC]; no measured dive depth.
- Osprey: fish within ~1 m of the surface, rarely over 40 cm (Alaska Dept. of Fish and Game) [SEC]. Common merganser males swallow fish over 30 cm [SEC].
- **Kramer, Manley & Bourgeois 1983**, *Can. J. Zool.* 61:653 [ABS]: green-heron capture risk rose nearer the surface; prey responded by going deeper.
- **Steinmetz, Kohler & Soluk 2003**, *Ecology* 84:1324 [ABS]: excluding herons and kingfishers from two streams significantly raised the numbers of medium-sized striped shiners and stonerollers (effect sizes not obtained).
- **Lantz, Gawlik & Cook 2010**, *Condor* 112:460 [ABS]: wading birds chose shallow vegetated plots, but capture rate in enclosures did not vary with depth.

## 4. Chain pickerel depth, adults and juveniles

### Takeaway
- **Beyond Milipsigate (HAB: 50 % of detections at 0.76–1.82 m fish depth; 80 % within 30 m of shore in December), no chain-pickerel telemetry with depth exists.** George Lake, NS (Sauriol, Nilsen & Avery 2024; 61 fish of 31–62 cm) reports summer migrations out of the lake, winter inactivity and individual habitat differences, but no depths [FT, abstract].
- **Diel:** adults by day in water to ~3 m, moving into the shallows at nightfall; juveniles mostly in the shallows (Animal Diversity Web [SEC]; unsourced there). Pike surrogates: stationary in < 1 m at night (Turunen 2025), shallower on sunny days (Chapman & Mackay 1984), crepuscular activity peaks in summer, ~2 % of night intervals active (Diana 1979, PEA).
- **Juveniles:** in shoreline vegetation ~0.9 m from shore and the shallowest water and brook mouths (PYOY: Kendall 1917, Maine). For pike, nursery depth rises with size (Casselman & Lewis 1996), pike < 41 cm are confined to vegetation (Grimm 1984), and a subordinate juvenile pike's risk rose when it moved shallower (Hawkins et al. 2005, via Craig 2008, *Hydrobiologia* 601:5–16 [FT]).
- **Hunting in < 0.5 m:** not measured for any esocid. With 50 % of Milipsigate detections at 0.76–1.82 m, roughly a quarter of the time the fish was shallower than 0.76 m. Since pickerel hover 0.3–1 m above the bed in the weeds, the time spent over beds < 0.5 m is plausibly **5–15 % by day** and somewhat more at dusk [derived, weak].

---

## Implications for the simulation

### What the sim does now (read 2026-10-20, `src/w3/fish3.js`)
- `S3.bass.hab` has one band for all sizes (day bed 1.5–4.0 m, night 1.0–2.5, winter 2.5–5.5) and **no `habJ`**, so a 10-cm yearling bass holds the adults' water. Perch and white perch have `habJ`.
- Young-of-year schools stay within `YOY_ROAM` (~150 m real) and `YOY_DBED` 0.8 m of their spot's bed depth: this matches the 88-m dispersal and nest depths.
- `F3.SHALLOW_K` = 0.02 m/cm: a predator strikes at full effect over water ≥ 2 L, not at all at ≤ 1 L, for every predator species, by day and night. `SHALLOW_REFUGE` 0.6 is the young schools' shallow cover.
- **Correction to carry over:** H3D §7 cell 6 and HAB V11 say age-0 bass stay "< 5 m from shore and < 1 m deep through September (Ridgway 2002)". That was the survey's sampling frame; the finding is the < 200-m dispersal. Late-summer YOY also occur deeper (4.6–6.1 m in Oneida Lake).

### (a) A juvenile depth band for smallmouth (`S3.bass.habJ`) [derived]
Maine length-at-age in the sim: ~11, 17, 22, 26 cm at ages 1–4.

| Bass length | Day bed depth (Upper) | Night | Winter (< 10 °C) | Substrate and cover | Basis |
|---|---|---|---|---|---|
| YOY schools, < 3 cm (July) | the nest's 0.5–1.5 m (in tea-coloured water 0.5–1.2) ± `YOY_DBED` | same, by the bed | — | over and beside the nest's gravel and rubble | Ridgway 2002; HAB nests |
| YOY 3–8 cm (Aug–Oct) | **0.3–1.5 m**, letting some drift to ~2.5 m by September | same water, on the bed, still | **0.8–2.5 m**, sheltering among stones near the natal area | cobble, gravel, sand ++; rock +; wood + in July, − from August; dense weeds − | Forbes 1981; Brown et al. 2000; Brown & Bozek 2010; Curry 2005 [SEC]; Wolf 2020 |
| 8–12 cm (age 1) | **0.4–2.0 m** (`habJ.bot`) | 0.3–1.5 m, near the bed | **1.0–3.0 m** (`habJ.wbot`) | cobble and sand; small loose groups | Ridgway 2002 ("small groups in the shallow littoral") |
| 12 → 25 cm | blend to the adult 1.5–4.0 m | blend to 1.0–2.5 | blend to 2.5–5.5 | add wood and cobble with size | Cole & Moring 1997 (248–279 mm shallower, more cover); Brown et al. 2000 (> 300 mm on wood) |

- **Code form:** `habJ: { L: [12, 25], bot: [0.4, 2.0], wbot: [1.0, 3.0] }` for `bass`, so recruits (~7–11 cm) start in the juvenile band, are halfway at age 2 (~17 cm) and adult-like by age 3–4.
- **Diet ontogeny check:** plankton and insects to 10 cm; fish appear at 10–15 cm; crayfish at 15–20 cm (Dunlop 2005; Weidel 2000 ~150 mm).
- **No explicit "avoid adults" rule is needed.** Segregation should come from the bands, from substrate (YOY sand and cobble against adults' wood and cobble) and from the adults' summer ranges lying away from the nesting shores (Ridgway 2002).
- **Expected outcome:** in July–August, age-0 and age-1 bass in the 0.3–2-m strip along the rocky and sandy shores of Upper, under the pickerel's reach (Mauck & Coble: small smallmouth are "most vulnerable" to esocids). Pickerel, not adult bass, should be their main predator in Hot Brook.

### (b) A minimum water depth for predators, by length, species and light [derived]
Keep the `SHALLOW_K` ramp — full effect at ≥ k_full·L, none at ≤ k_none·L (L in metres, so k is in body lengths) — but make it **per species** and **by light**:

| Predator | Day: none ≤ / full ≥ | Twilight | Night | 30-cm bass / 40-cm pickerel by day | Basis |
|---|---|---|---|---|---|
| Smallmouth bass | **1.0 L / 2.0 L** (= today's 0.02 m/cm) | 0.75 / 1.5 L | **0.5 / 1.0 L** | none < 0.30 m, full ≥ 0.60 m | Power 1987 (pools > 0.5 m); McInerny & Cross (≥ 200-mm bass leave the 0.5–2-m strip by day in clear lakes, enter at night); Suski & Ridgway (< 2 m night, 3–5 m day); Peat (largemouth minimum 0.34 m) |
| Chain pickerel | **0.6 L / 1.5 L** | 0.5 / 1.2 L | 0.4 / 1.0 L (activity ~0.02–0.1 anyway) | none < 0.24 m, full ≥ 0.60 m | Milipsigate (a quarter of the time shallower than 0.76 m); pike minimum 0.17 m (Peat), stationary in < 1 m at night (Turunen), shallower on sunny days (Chapman & Mackay); a slender ambusher in weeds |
| Yellow and white perch ≥ 15 cm | as bass by day | as bass | as bass | — | Fischer & Eckmann (perch never abundant in 0–0.5 m by day; rest in the littoral at night) |
| Fallfish ≥ 10 cm (brook) | as bass | — | — | — | BFW §4 |

- The sub-researcher's simpler alternative, a single floor depth_min = max(d0, k·L), is **bass k 1.5, d0 0.5 m by day; 1.0, 0.35 m at twilight; 0.75, 0.25 m at night**, and **pickerel k 0.75, d0 0.25 m by day; 0.5, 0.15 m at night**. It brackets the ramps above.
- **Calibration checks** [weak; no source measures them]:
  - share of bass positions over beds < 0.5 m ≤ 5 % by day and 10–20 % at night;
  - pickerel 5–15 % by day, more at dusk;
  - ≥ 20-cm bass in the 0.5–2-m shore strip: night > day (McInerny & Cross, Secchi > 1 m);
  - pickerel half-time depth 0.76–1.82 m (Milipsigate).
- **Effect on killifish.** At a 40-cm pickerel's 0.24/0.60 m by day, killifish over 0.1–0.25 m are untouchable and those over 0.3–0.6 m partly exposed. That is a little more exposure than today's 0.4/0.8 m, so re-run the killifish A/B (≥ 3 seeds) before adopting it.

### (c) A depth band for small prey fish, by length, where piscivores are present [derived]
Use it to check emergent positions, or as the `habJ` of sunfish, perch and white perch young (TL):
- **< 4 cm:** bed 0.05 m to ~10·L (3 cm → 0.3 m); no bird floor. Pelagic larval phases come first (yellow perch to ~25–30 mm, *Lepomis* to ~12.5 mm SL).
- **4–8 cm:** by day 0.15 m to max(0.5 m, 10·L), or inside dense weeds (≥ ~250–1,000 stems/m²) down to ~1.5 m; at night inshore in < 0.6 m.
- **8–15 cm (the squeezed sizes):** in the weeds over 0.5–2 m by day; avoid < 0.3 m by day (herons); leave the weeds at a shift size that rises with predator density (bluegill 50–83 mm SL). In the open below that size, risk is ~40–80× that in the weeds.
- **≥ 15 cm:** a daytime floor of ~0.5 m (heron reach to prey of ~28–36 cm); the osprey's top 1 m applies whatever the bed depth.
- **Killifish conflict.** The sim keeps banded killifish over 0.1–0.6 m by day (CT DEEP "often in water under 6 in"; COSEWIC: 74–93 % of seine catches ≤ 1.2 m). Helfman 1981 (via McInerny & Cross [SEC]) puts their schools in 1–1.6 m by day, dispersing into < 0.6 m at night. The two can both be true: shoals in the weeds' edge by day, the shallows at night. Read Helfman before changing it; schooling plus weeds may be their daytime defence rather than depth.

### (d) Bird kernels, if herons, kingfishers or ospreys are added to the 3-D lakes
- **Great blue heron:** strikes over beds ≤ 0.2 m (87 %), at most ~0.5 m; prey 3.5–28 cm, mostly ≤ 14 cm (to ~36 cm); success ~0.56 per strike; active by day and at night.
- **Belted kingfisher:** prey 4–14 cm (max ~18 cm) within ~0.25–0.5 m of the surface; by day only. The 0.5 m is an unmeasured scale-up from the common kingfisher's 0.25 m.
- **Osprey:** prey ~15–40 cm within ~1 m of the surface; by day only.
- **Merganser and loon** (the sim's `BIRD`): prey up to ~30 cm at any depth in a 5.5-m lake.
- These give the shallows their cost for 5–30-cm fish by day, the half of the bigger-deeper rule the sim now carries only as a fixed band.

### (e) Smallmouth cannibalism
- **No special rule.** Let it emerge from size windows and the depth bands of (a)–(b): adults over 1.5–4 m by day with a 0.3/0.6-m floor, YOY over 0.3–1.5 m, adults nearly still at night.
- **Targets** [derived from §2]:
  - young bass ≤ ~2–5 % of adult smallmouth diet by mass in summer (Maine 0 of 36 stomachs; Wisconsin 0 of 303);
  - what cannibalism there is should come mostly from 15–25-cm bass eating YOY < 30–40 mm in June–July (Paul Lake);
  - scarce crayfish should push adult bass onto perch and white perch (Cooper 1941: 75 % perch by volume) and insects (Provoking), not onto their own young.
- **Young-of-year bass mortality, all predators:**
  - The Opeongo hazard 0.2·e^(−0.04·L mm) d⁻¹, integrated over Maine growth (9 mm in early July to 56–76 mm by late September, 0.65–0.9 mm/d), gives **1–3 % survival from swim-up to autumn** [derived].
  - Clady's egg → fall 1–4 % against egg → post-larva 26–33 % gives **3–15 %** from post-larva to autumn.
  - Use **3–15 % (swim-up → first autumn, all causes)** as the check, with the Houpt hazard as an upper bound on predation.
  - Adult bass should be a minor share of these deaths. MDIFW speaks of a "lack of significant predators on juvenile bass"; Maine year classes are set by summer warmth and first-winter size (FWM). Pickerel, yellow and white perch (eggs and fry), sunfish (larvae) and fallfish should dominate.

---

## Gaps and to fetch (blocked or unread; not bypassed)
- **No lake telemetry or depth census** for smallmouth of 5–25 cm. No measured share of piscivore time or attacks in < 0.5 m. No chain-pickerel diel depth data.
- **Cannibalism:** no field estimate of the share of age-0 smallmouth deaths caused by adult bass.
- **Sources not obtained (blocked or unavailable):**
  - Curry et al. 2005 (Springer login redirect) and Houpt 1991 (thesis, not online).
  - Weidel et al. 2000 (MSU PDF behind an Incapsula bot check) and Brown, Josephson & Krueger 2000 (ResearchGate).
  - Liao et al. 2004 (Iowa State repository 403); Dassow et al. 2018 (tandfonline and DOAJ 403); Nelson et al. 2017's PMC copy (bot check; the PLOS copy was read and had no cannibalism figure).
  - Edwards et al. 1983 HSI (DTIC 403; the Colorado WebLink copy needs cookies); Lane, Portt & Minns 1996 (not found).
  - Emery 1973 and Helfman 1981 full texts (`blocked_sources_to_fetch.md` B21–B22). Helfman would settle the killifish day depth.
  - From the sub-researcher: Lewin et al. 2004 (Wiley 403), Ruiz et al. 1993 (int-res 429), Powell 1987 (403), the Maine pickerel plan (maine.gov 403), and Mittelbach's dissertation (access limited).
  - Not read at all: Rahel & Stein 1988, Brabrand & Faafeng 1993, Gotceitas & Colgan 1989, Britton & Moser 1982, Kushlan 1976, Foote & Blake 1945, Mittelbach 1981/1984, Clady 1974/1975 originals, and Keast & Harker 1977 (a station-page summary only: 80–90 % of fish biomass along margins ≤ 2.5 m [SEC]).
- OpenAlex and Semantic Scholar rate-limited (429) partway through.
