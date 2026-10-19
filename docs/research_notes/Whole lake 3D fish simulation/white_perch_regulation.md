# White perch: what regulates their numbers, and how they reach other fish through the zooplankton

Compiled 2026-10-19 for the 3-D sim of Upper and Lower Hot Brook Lake (Danforth/Weston, Maine): ~375 + 280 ha, max 5.5 and 4 m, unstratified, tea-coloured, Secchi ~3 m. The fish are white perch, yellow perch, pumpkinseed, redbreast, brown bullhead, white sucker, smallmouth bass, chain pickerel, fallfish, banded killifish and blacknose dace.

**The sim problem this note addresses.**
- White perch biomass doubles in year 1 (31 → 61 kg/ha; ~450 → 630 fish ≥ 7.5 cm/ha) and is held only by the census cap.
- In year 2 their young (3× year 1's) and the adults graze the zooplankton down. Every species' ration falls to 25–35 % of Cmax.
- Pumpkinseed, redbreast, killifish and fallfish starve out in 2–3 years. Their young stall at 1–2 cm while young white perch keep growing.
- Adult white perch lose only ~30 %/yr.
- Current parameters (`src/species.js` l. 346): L0 8 cm, Lmat 9.5 ♀ / 7.6 ♂ cm, matureAge 3, maxAge 12, M 0.45. White perch set no `benthL`, so the default `FRY.BENTH_L` 2.5 cm applies (`config.js` l. 201).

**How this pass was done.**
- The session's shared web-search budget was already used up when this task began, so **no web searches were possible**.
- Sources were reached in three ways:
  - DOIs and URLs known in advance or cited in earlier repo notes, mostly OUP abstract pages for TAFS papers;
  - three PDFs read in full by local text extraction (Bath & O'Connor 1982; Stanley & Danie 1983; Harris 2006);
  - the Lake Erie Forage Task Group 2020 report.
- The repo's earlier notes are cited by path, with their primary links.
- **Blocked and not bypassed:**
  - HTTP 403: maine.gov (the MDIFW white perch page and plan), cdnsciencepub (CJFAS), sciencedirect (JGLR), Wiley (*Fisheries*), and the UNL Digital Commons PDF;
  - empty page: BioOne.

**Tags.**
- [primary]: a peer-reviewed paper, thesis or monitoring data. "(abstract)" or "(full text)" says what I read.
- [review]: a review, compendium or species profile, citing the original.
- [agency]: a state or provincial agency document.
- [snippet]: a secondary summary of a source I did not read, including earlier repo notes marked "via search summary".
- [surrogate]: not a northeastern landlocked lake. The analogue is always named: EST = estuary or tidal river; GL = Great Lakes (a large-lake analogue); S = southern or plains reservoir.
- [inf]: my own arithmetic or inference.

---

## 0. Summary of targets

| Quantity | Evidence | Suggested sim target |
|---|---|---|
| Adult (age 3+) total annual mortality A | Maine lakes "similar" to ~0.50–0.56 (Cooper 1941, via Stanley & Danie); estuaries 0.37–0.70; Hudson catch curve A ≈ 0.44 [inf] | **A 0.45–0.55 (Z ≈ 0.6–0.8)**, against the sim's ~0.30 |
| Ages 1–2 (7.5–15 cm) | fish predation alone ≈ 15–35 %/yr at 7.5–15 cm (repo predator note) plus background | **A 0.50–0.65** |
| Fishing share | Maine statewide catch 3.5 M of a 60 M standing crop (6 %, 1981); harvest 0.96 M/yr (2002) | F ≈ 0.02–0.08; natural M ≈ 0.45–0.65 |
| Maximum age | 7 (Hudson, Connecticut R.); 8–10 (Delaware, Patuxent, Roanoke, Ontario); 16–17 is the record (Maine). MDIFW gives a 5–7-yr life span | tmax **9–10** for M (Then et al. → M 0.59–0.66); the odd fish to 13–16 |
| Age-0 density, late summer | 1,600–3,000/ha in western Lake Erie, varying > 100-fold between years [GL] | 300–3,000/ha [inf], highly variable |
| Age-0 length at end of first season | 70 mm in Lake Erie; L1 ≈ 70–90 mm TL in estuaries and NJ lakes | **4.5–7.5 cm in September** in a Maine lake [inf] |
| First-winter survival | lab: 59 % after 180 d at 4 °C (starved); 32 % after 150 d at 2.5 °C (feeding not stated in the abstract); strongly size-dependent (Johnson & Evans 1990) | **0.2–0.9 by size**: ≤ 50 mm ≲ 0.4; ≥ 80 mm ≳ 0.7 [inf] |
| Age-0 → followed agent | — | recruit next spring as age 1 at ~6–9 cm, not in the first September at 8 cm |
| Biomass and density | Maine statewide 1981 ≈ 21 kg/ha, ≈ 260 fish/ha, mean ≈ 80 g [inf]. Lake Anna 12.7–24 kg/ha at ~520/ha [S]. Branched Oak ~1,500–1,900/ha, stunted [S] | **15–35 kg/ha; 250–750/ha ≥ 7.5 cm**; mean 40–80 g |
| Year-to-year change at equilibrium | an *invading* population rose ~9× in 3 years (Lake Anna) | ± 30–50 % (year classes); no doubling once established [inf] |
| Sunfish with abundant white perch | eastern Maine nets: adult pumpkinseed 3–35 % of adult white perch (median ~12 %). Connecticut electrofishing: pumpkinseed 0.7×, redbreast 0.4× white perch | **sunfish persist**; pumpkinseed ≈ 0.05–0.3× white perch numbers |

---

## 1. Adult mortality, maximum age, fishing and predators

### Takeaway
- Every annual mortality estimate found for white perch adults lies between **0.37 and 0.70**, most at **0.50–0.60**.
- The only Maine lake data, Cooper's 1941 surveys of the Androscoggin and Kennebec lakes, are reported as similar to Mansueti's 0.50 (males) and 0.56 (females).
- Maximum age is typically 7–10 years. Maine holds the record at 16–17.
- Fishing takes only a few percent of the stock per year statewide.
- Predators take few adults because of their spines and body depth. The bulk of adult mortality is therefore "other" natural mortality, not predation.

### Cited findings

**Mortality**
- **Maine lakes and estuaries.** Stanley & Danie 1983, the USFWS species profile written at the Maine Cooperative Fishery Research Unit: [review] — [FWS/OBS-82/11.7](https://njscuba.net/wp-content/uploads/biology/pdf/usfws_white_perch_0199.pdf) (full text; a copy, because the original USGS NWRC link now redirects to a centre homepage)
  - Patuxent River, MD (Mansueti 1961): annual mortality **0.37–0.59** for age groups IV and older; about **0.50 for males and 0.56 for females**.
  - "These mortalities are similar to those reported by Cooper (1941)" for lakes and ponds of the Androscoggin and Kennebec drainages in Maine. Cooper is MDIFW Fish Survey Rep. 4 (not read).
  - Delaware River (Wallace 1971): 0.49–0.59 for males, 0.53–0.65 for females.
  - York River, VA (St. Pierre & Davis 1972): 0.59 for males, 0.57 for females.
  - Females die faster because they reach harvestable size earlier.
  - Tags: [surrogate EST] except Cooper [ME].
- **Older York and James river males:** about **59–70 %/yr** [snippet; surrogate EST] — [W&M thesis](https://scholarworks.wm.edu/items/66b2bc88-5bac-4f4e-b62d-f4a3d762d5b8) (via an earlier repo note)
- **Hudson River, NY** [primary, full text; surrogate EST] — [Bath & O'Connor 1982, Fish. Bull. 80(3)](https://spo.nmfs.noaa.gov/sites/default/files/pdf-content/1982/803/bath.pdf)
  - Sample: > 7,500 fish.
  - Maximum age **7** in both sexes; other Hudson surveys give 7 and 9.
  - 78 % of the length at age 7 is reached in the first 3 years. Most fish are mature in their 2nd year.
  - Mean fecundity 50,678 eggs (15,726–161,449).
  - Their back-calculation table holds 802 fish of ages 1–7. Counts by age at capture: **243, 219, 139, 85, 68, 36, 12**.

**Maximum age**

| Water | Maximum age | Source |
|---|---|---|
| Connecticut River | **7**. Calculated length fell in every age class with each successive year ("possible stunting") | [Marcy & Richards 1974, TAFS 103:117](https://academic.oup.com/tafs/article/103/1/117/7895352) [primary, abstract; EST] |
| Connecticut River | ~8 | Bath & O'Connor discussion [primary] |
| Delaware River | 8 and 10 | Bath & O'Connor discussion [primary] |
| Patuxent and Roanoke rivers | up to 10 | Bath & O'Connor discussion [primary] |
| Kerr Reservoir, NC–VA | 300 mm at age 9 | [Harris 2006, VT thesis](https://vtechworks.lib.vt.edu/server/api/core/bitstreams/8e7bf951-84ae-4a7e-9efe-42cb0efa708e/content) [primary, full text; S] |
| Maine | **17 years and 483 mm** | Jenkins & Burkhead 1993, via Harris 2006 [review] |
| Maine / New York / Ontario | 17 / 15 / tmax 10 (the first two columns are unlabelled in the extraction) | [FishBase PopChar](https://www.fishbase.se/popdyn/PopCharList.php?ID=355&GenusName=Morone&SpeciesName=americana&fc=487) [snippet] |
| FishBase summary | 16 | [FishBase](https://www.fishbase.se/summary/Morone-americana.html) [snippet] |
| Maine (MDIFW) | typical life span 5–7 | repo `../Hot Brook populations and water/eastern_maine_relative_abundance.md` [agency] |
| New Brunswick | most live ~6, maximum 17 | repo `species_numbers_northern_lakes.md` [snippet] |

**Fishing**
- **Maine statewide, 1981** (Jordan 1981, MDIFW White Perch Management Plan, quoted by Stanley & Danie) [review → agency]:
  - standing crop **60,175,000 white perch (10,590,800 lb)**, "most of which were in inland lakes and ponds";
  - annual catch about **3.5 million fish, 6 % of the standing crop**;
  - New Hampshire's recreational catch was 664,000 (NHFG 1978).
- **MDIFW 2002 plan** [agency; read in an earlier pass, quoted in repo `../Maine lakes ponds and streams/maine_fish_community_hot_brook.md` and `sucker_shiner_bullhead_trout_parameters.md`; maine.gov 403 now] — [plan](https://www.maine.gov/ifw/docs/strategic-management-plans/whiteperch.pdf)
  - 514 lakes, ~570,000 acres;
  - statewide harvest **964,889 fish/yr**;
  - 50 % of desirable-size perch could be harvested without harming the population;
  - standing crop "cannot be estimated at this time because of inadequate data".
- **Hot Brook's 25-fish bag limit** was set by citizen petition, "not for biological reasons" (MDIFW 2002) [agency; repo `../Hot Brook populations and water/hot_brook_lake_records.md`].

**Predators of adult and sub-adult white perch**
- **Named predators** (Stanley & Danie 1983) [review]: Atlantic salmon, brook trout, chain pickerel, smallmouth and largemouth bass. "Terrestrial vertebrates also prey heavily on schooling white perch" (no numbers).
- **Kerr Reservoir** (clupeid-rich) [primary, full text; S] — Harris 2006
  - White perch were **< 2 % by weight of every sportfish diet**.
  - Perch eaten were **82–152 mm (mean 110)**. Even 69–77-cm striped bass took perch < 125 mm.
- **Other diet records** (via Harris 2006):
  - Largemouth bass targeted white perch where they were the most abundant prey (Ward & Neumann 1998, Connecticut lakes) [snippet; NE].
  - Northern pike had "substantial" white perch in their diet 2 years after establishment in Lake Ontario (Boileau 1985) [snippet; GL].
  - Lake Erie walleye ate white perch when gizzard shad were scarce (Hartman & Margraf 1992) [snippet; GL].
- **Chain pickerel** (repo `predator_diets_and_prey_mortality.md`):
  - White perch is MDIFW's second-named principal pickerel prey and was the #2 fish prey in Wentzells Lake, Nova Scotia.
  - A 35-cm pickerel can swallow perch-shaped prey only to ~15–17 cm.
- **Birds** (repo `../Maine lake shores and catchment/shore_birds_and_mammals.md`):
  - a loon pair with chicks removes ~1–2.5 kg/ha/yr of 10–70 g fish;
  - ospreys take 25–35-cm fish within ~1 m of the surface;
  - Maine inland eagles favour bullhead, sucker and pickerel (Todd et al. 1982);
  - mergansers prefer ≤ 13-cm fish;
  - inland cormorants mostly take yellow perch.
  - **No white-perch-specific bird mortality estimate was found.**

### Inferences [inf]
- **Hudson catch curve.** The aged counts give, for ages 3–7, **Z ≈ 0.58 (A ≈ 0.44)**; ages 2–7 give Z ≈ 0.54.
  - Caveat: this is a pooled back-calculation subsample, possibly length-stratified, not a designed catch curve.
- **Mortality from maximum age.**

  | tmax | Then et al. 2015 M = 4.899·tmax^−0.916 ([ICES JMS 72:82](https://doi.org/10.1093/icesjms/fsu136)) | Hoenig 1983 Z = e^(1.46 − 1.01·ln tmax) (Fish. Bull. 82:898) |
  |---|---|---|
  | 7 | 0.82 | 0.60 |
  | 9 | 0.66 | — |
  | 10 | 0.59 | 0.42 |
  | 12 | 0.50 | 0.35 |
  | 17 | 0.37 | — |

  The sim's tmax 12 → M 0.45 is at the low end. Applying only half of that as "unsimulated" death gives the observed ~30 %/yr, about half the field rate.
- **Partition for a lightly fished Maine lake, age 3+.**
  - Total: Z ≈ 0.6–0.8.
  - Fishing: F ≈ 0.02–0.08. The statewide 1981 6 % is a ceiling for most lakes; a "principal fishery" lake like Hot Brook could be higher.
  - Predation on fish > 17 cm: ≲ 0.05–0.10, from pickerel gape limits, bass, ospreys and loons.
  - Everything else: **≈ 0.45–0.65**. That covers spawning stress, winter energy loss in small and stunted fish, parasites and disease, and senescence.
  - So the sim's 2–3 %/yr from predators on adults is roughly right. What is too small is the non-predation term.

---

## 2. Recruitment and first-year survival

### Takeaway
- **Year-class strength swings by 100–200-fold.**
- **Late-summer age-0 density is ~1,600–3,000/ha in western Lake Erie [GL].** No northeastern inland density was found.
- **First-winter survival is strongly size- and winter-dependent** in the only experiments (Johnson & Evans 1990), which tie the species' northern range limit to winter severity.
  - In a Maine lake, many age-0 fish are 45–65 mm at ice-on, inside the high-mortality zone.
  - So first-winter loss is probably large and **compensatory**: crowded cohorts grow less, enter winter small and die.
- **Eggs and young are eaten** by adult white perch (cannibalism and egg eating), yellow perch, bass, pickerel and invertebrates.
- **No stock–recruitment parameters exist** for any population found.

### Cited findings

**Spawning and early growth**
- **Spawning temperature:** about 15 °C in late May–June at Hot Brook (repo spawning calendar, `docs/reports/Maine lakes ponds and streams.md`) [agency].
  - Maine lakes need 18–21 °C "for several days" before spawning (AuClair 1956, Sebasticook Lake MS thesis, via Stanley & Danie) [review; ME].
  - Spawning lasts 1–2 weeks, with females releasing eggs more than once (Mansueti 1961, via Harris) [review; EST].
- **Egg hatching:** 24 h at 16–20 °C, 144 h at 11–16 °C (Hardy 1978, via Stanley & Danie) [review].
- **Fecundity:** 20,000–300,000 eggs; about 22,000 at 6 in (MDIFW 2002) [agency].
- **Age-0 size at the end of the first season:**

  | Water | Length | Source |
  |---|---|---|
  | Western Lake Erie (2019) | mean **70 mm** | FTG 2020 [agency; GL] |
  | Hudson | SL 69–72 mm at annulus 1 | Bath & O'Connor [primary; EST] |
  | James River | 76 mm TL at age 1 | St. Pierre & Davis 1972, via Harris [EST] |
  | New Jersey lakes | 71 mm at annulus I | repo `size_structure_whiteperch_sucker_bullhead.md` |
  | Kerr Reservoir | 100 mm at age 1 | Harris 2006 [S] |
  | Nebraska reservoirs | 102–127 mm at age 1, and already mature | Zuerlein 1981, via Harris [S] |

**Age-0 densities and variability** — [Lake Erie Forage Task Group report 2020](https://www.glfc.org/pubs/lake_committees/erie/FTG_docs/annual_reports/FTG_report_2020.pdf) [agency, full text; GL]
- **Western basin interagency August trawls:**
  - age-0 white perch **1,573/ha** in 2019, down 50 % from 2018;
  - ten-year mean (2008–18) **2,961/ha**;
  - age-0 white perch were **60 %** of the western basin's forage community.
- **Michigan waters:** forage-sized white perch 389/ha in 2019. Annual values for 2014–19 ranged from **< 1 to ~450/ha**; the table was partly misaligned in extraction.
- **Early invasion:** young-of-year abundance varied "nearly 200-fold", with strengthening year classes in 1980–84 (Schaeffer & Margraf 1986) [snippet; GL] — repo `../Hot Brook populations and water/species_numbers_northern_lakes.md`.

**First winter** — [Johnson & Evans 1990, TAFS 119:301–313](https://academic.oup.com/tafs/article/119/2/301/7891805) [primary, abstract; lab with Great Lakes context]
- Lab, young-of-year:
  - **starved at 4.0 °C for 180 days: 40.6 % mortality**, highest in the smallest fish;
  - **no mortality with food ad libitum**;
  - **at 2.5 °C: 68.4 % mortality after 150 days.**
- Size, winter length, temperature and food all mattered strongly.
- Fitted models, with WD = winter duration (d) and FL = fork length (mm):
  - 4.0 °C: P = 7.29543·e^(0.02145·WD − 0.10804·FL);
  - 2.5 °C: P = 0.28054·e^(0.01862·WD − 0.03097·FL).
- The authors link the cold northern Gulf of St. Lawrence to blocked establishment, and the late-1940s Great Lakes invasion to warm years. They expect warming to raise recruitment through larger young and shorter winters.
- **Johnson & Evans 1991** (CJFAS 48:672–680) compared the winter behaviour, energetics and mortality of young white and yellow perch. It was not readable (403). The sim's `species.js` comment cites it for white perch's higher winter costs.

**Diet of the young**
- Larvae of 3–23 mm eat rotifers, cladocerans and copepods (Setzler-Hamilton et al. 1982) [snippet via Harris].
- When large prey are scarce, larvae shift to smaller zooplankton (Hjorth 1988) [snippet via Harris].
- **Diet shift at ~40 mm**, from copepods and daphnids to amphipods and chironomids:
  - Oneida Lake (Prout et al. 1990);
  - James River at 40 mm;
  - New Brunswick estuary at 50 mm.
  - [review via Harris]

**Eaten as eggs and young; cannibalism**
- In the Sandusky River (Lake Erie) in May–June, fish eggs were **100 % by volume** of white perch diets, including their own (Schaeffer & Margraf 1987) [snippet via Harris and USGS; GL].
- White perch eat white perch eggs in the Pamunkey River (McGovern & Olney 1988) [snippet; EST].
- Adults eat "their own young" (Scott & Crossman 1973; Zuerlein 1981). When zooplankton and insects decline they eat fish fry (Elrod et al. 1981) [review, Stanley & Danie].
- Fish become regular food only above ~200 mm in Maine lakes (Warner 1974). Kerr perch did so from 80–150 mm [snippet via Harris; ME / S]. Stanley & Danie: above 22 cm, fish "almost exclusively" [review].
- Free-living copepods (*Cyclops*) prey on white perch larvae (Smith & Kernehan 1981) [review].

**Stock–recruitment:** no parameters found for any population.

### Inferences [inf]
**Johnson & Evans models applied to a Hot Brook winter** (~145 days of ice, under-ice water ~1–4 °C). Predicted age-0 mortality (the 4 °C model is from starved fish; the abstract does not say how the 2.5 °C fish were fed):

| Fork length | 4.0 °C, 120 d | 4.0 °C, 150 d | 4.0 °C, 180 d | 2.5 °C, 120 d | 2.5 °C, 150 d |
|---|---|---|---|---|---|
| 50 mm | 0.43 | 0.82 | 1.0 | 0.56 | 0.97 |
| 60 mm | 0.15 | 0.28 | 0.53 | 0.41 | 0.71 |
| 70 mm | 0.05 | 0.10 | 0.18 | 0.30 | 0.52 |
| 80 mm | 0.02 | 0.03 | 0.06 | 0.22 | 0.38 |
| 100 mm | 0.002 | 0.004 | 0.007 | 0.12 | 0.21 |

- These models are fitted to starved lab fish. Fish that feed under the ice survive better, and the fitted size range is not stated in the abstract.
- So treat them as an **upper envelope** with a clear shape: a steep size threshold near **55–70 mm FL at 4 °C**, and much higher, flatter losses at 2.5 °C.
- **Plausible field first-winter survival for Hot Brook:**
  - ≈ 0.2–0.5 at 45–55 mm;
  - ≈ 0.5–0.8 at 60–70 mm;
  - ≥ 0.8 at ≥ 80 mm.
- A crowded cohort that ends summer at 5 cm therefore loses most of its fish over winter, while a sparse cohort at 7 cm keeps most of them. That is real **compensation**.
- **Age-0 → age-1 survival overall** (fall to the next fall, adding the next summer's predation on 6–10-cm yearlings) is plausibly **0.1–0.4**.
- **Northeastern density.** The Lake Erie figure comes from a warm, productive large lake. For oligo-mesotrophic Hot Brook (TP 9–10 µg/L), ~300–3,000/ha in August is a reasonable band, varying ≥ 10-fold between years.

---

## 3. Density dependence and stunting in landlocked white perch

### Takeaway
- In New England, landlocked white perch characteristically respond to crowding by **slowing growth**, not by dying faster.
- Stunted fish still mature at **7–10 cm** and spawn, so crowding does not shut off reproduction.
- Numbers are held by **first-year survival**, and biomass by **food**.
- Removing fish speeds the growth of those left, chiefly the young (Grice 1958, 45 Massachusetts ponds).
- Ceilings named in the literature:
  - food (stunting);
  - winter, for young fish and lake O₂;
  - few predators (blamed for stunting);
  - parasites;
  - human removal.
- **No natural collapse of an established northeastern lake population was documented in what could be read** (see Gaps).

### Cited findings
- **MDIFW 2002** [agency; quoted from the plan in repo `maine_fish_community_hot_brook.md` §"White perch: dominance and stunting"]:
  - where conditions suit, white perch form very large populations that occasionally dominate, and the usual problem is too many small perch;
  - stunting can be "so extreme that a 6-year-old perch may be only 4 inches long";
  - depleted food also slows salmon, trout and bass;
  - even small, slow-growing perch mature and spawn successfully.
- **Indian Lake, MA** (Grice 1958, via Harris 2006) [review; NE]:
  - stunted white perch did not approach 150 mm until **age 8**, and none ≥ 200 mm were caught;
  - growth was **< 10 mm/yr after age 2**.
- **Grice 1958, removal experiment** [primary, abstract; NE] — [TAFS 87:108](https://academic.oup.com/tafs/article/87/1/108/7899091)
  - Fyke nets removed 127,430 lb of "panfish and trashfish" from **45 Massachusetts ponds** in 1951–56, at < 1–146 lb/acre/yr.
  - Where removal was intensive, panfish growth **"increased markedly"**, more in young fish than old.
  - Chain pickerel and largemouth bass growth was unchanged or slightly lower, and species composition did not shift toward gamefish.
- **Growth falling as numbers rose:**

  | Water | Change | Source |
  |---|---|---|
  | Wagon Train Reservoir, Nebraska | age-1 length 130 → 112 mm from 1966 to 1967 | Hergenrader & Bliss, via Harris [S] |
  | Lower Connecticut River | age-1 length 96 → 69 mm from 1959 to 1965 | Marcy & Richards 1974 [EST] |
  | Kerr Reservoir | age-1 124 → 101 mm (1995 → 2005); age-2 159 → 142 mm | Harris 2006 [primary; S] |

- **Nebraska** [primary, abstract; S] — [Hergenrader & Bliss 1971, TAFS 100:734](https://academic.oup.com/tafs/article/100/4/734/7894401)
  - In a turbid flood-control reservoir, introduced white perch grew very fast and matured 1–2 years earlier than in their native range.
  - They "completely displaced" black bullhead as the dominant species within 3 years.
  - The population then began to stunt.
- **Causes named by Stanley & Danie 1983** [review]:
  - "High reproductive potential and scarcity of predators often lead to stunted populations."
  - Stunting is often associated with eutrophic waters (Hines 1981, a stunted population in a eutrophic **Maine** pond).
  - Landlocked populations in small oligotrophic coastal lakes grow more slowly than newly expanding ones (Scott & Crossman 1973).
  - In the Patuxent, growth rose with spring days at 10–15 °C and with solar radiation, and fell with density.
- **Maturity:**
  - males 72 mm, females 98 mm (Hardy 1978, via Stanley & Danie) [review];
  - Patuxent: 50 % mature at 100 mm SL (males) and 105 mm SL (females); all males mature by age 2 and all females by age 4 [EST];
  - Nebraska: mature at age 1 and 102–127 mm [S].
- **Winter oxygen.** In Maine, white perch persist in lakes of about 50 acres and 25 ft or more "if the deeper water is not depleted of oxygen during the winter" (MDIFW 2002) [agency; repo]. Hot Brook (5.5 m) is shallower, yet holds a white perch fishery.
- **Superabundance and its removal** [primary; S] — [Stewart 2015, UNL thesis abstract](https://digitalcommons.unl.edu/natresdiss/108)
  - Branched Oak Lake, NE: ~1.1–1.4 million white perch.
  - Pawnee Reservoir: a low-dose rotenone treatment cut white perch biomass **83 %**.
- **Parasites:** the isopod *Lironeca ovalis* is believed to slow white perch growth (Sadzikowski & Wallace 1974, *Chesapeake Sci.* 15:163) [snippet via Wikipedia].

### Inference [inf]
- A white perch population absorbs a food shortfall by shrinking its fish, not its numbers. Biomass settles near what the food supports, while numbers are set by recruitment and first-winter survival.
- The sim instead lets biomass double within a year, with growth that stays good. This suggests that either:
  - the young eat more than real young do (a too-early switch to bed food), or
  - they escape the size-dependent first-winter cut.
  
  Both are treated in §7.

---

## 4. Effects on other species, through zooplankton and otherwise

### Takeaway
- White perch are **broad generalists**, and their competitive effect is real but **diffuse and asymmetric**.
- **Young white perch** are strong zooplankton consumers, eating per gram up to 2–12× the prey biomass of young yellow perch. Yet in Oneida Lake, *yellow perch* cohorts collapsing *Daphnia* hurt young white perch more than the reverse.
- **Adult white perch** eat *Daphnia* only when it is abundant (> 20/L and > 50 % of the zooplankton), and benthos otherwise.
- **Documented harm** is mostly to **other open-water spring spawners**:
  - white bass recruitment;
  - walleye, by egg predation;
  - black bullhead, replaced in a Nebraska reservoir.
- **Sunfish persist alongside abundant white perch** in eastern Maine and Connecticut lakes. No study found shows white perch eliminating pumpkinseed or redbreast.

### Cited findings

**Zooplankton and yellow perch**
- **Oneida Lake, NY, July–October 1980 and 1987** [primary, abstract; NE] — [Prout, Mills & Forney 1990, TAFS 119:966](https://academic.oup.com/tafs/article/119/6/966/7891674)
  - 1980: both young perches ate *D. pulex* and grew fast. White perch took **2–12×** more prey biomass per gram of fish than yellow perch.
  - 1987: white perch took up to **3×** more. Once *D. pulex* disappeared, both shifted to macroinvertebrates and both grew more slowly.
  - Young white perch out-grew young yellow perch by October in every year from 1977 to 1987.
  - White perch weight tracked *D. pulex* density (rs = 0.58, P = 0.07).
  - A protracted spawning gave a wide size range.
  - Competition was **asymmetric**: big yellow perch cohorts that crash *Daphnia* hurt young white perch growth more than big white perch cohorts hurt yellow perch.
- **Oneida Lake background** [primary, abstract; NE] — [Mills & Forney 1983](https://doi.org/10.1577/1548-8659%281983%29112%3C154:IODPOP%3E2.0.CO%3B2), via repo `../Real lake ecology for calibration/fish_zooplankton_coupling.md` §3
  - *D. pulex* tolerates about **10 kg/ha** of age-0 yellow perch.
  - It collapses in late summer at **20–40 kg/ha**.
- **Lake Erie** (Parrish & Margraf 1990, CJFAS 47:1779; via the USGS fact sheet) [review; GL]:
  - considerable diet overlap;
  - in one sample white perch ate 27 % more food than yellow perch;
  - yellow perch growth declined after the invasion, especially in the western basin.
  - [USGS NAS fact sheet](https://nas.er.usgs.gov/queries/FactSheet.aspx?speciesID=777)
- **Lake Erie central basin** (Bur & Klarer 1991, via USGS NAS) [review; GL]: zooplankton is a "large portion" of the white perch diet, with *Bythotrephes* eaten out of proportion to its numbers.
- **Missisquoi Bay, Lake Champlain** [snippet; large-lake bay] — [Couture & Watzin 2008, JGLR 34:485](https://bioone.org/journals/journal-of-great-lakes-research/volume-34/issue-3/0380-1330(2008)34[485:DOIAWP]2.0.CO;2/Diet-of-Invasive-Adult-White-Perch-Morone-americana-and-their/10.3394/0380-1330(2008)34[485:DOIAWP]2.0.CO;2.short) (via repo `littoral_invertebrates.md`)
  - Adult white perch ate *Daphnia* heavily only when *Daphnia* exceeded **20/L and > 50 %** of the zooplankton.
  - Otherwise they ate benthos: amphipods, chironomids and pupae.
- **Soft-water northeastern lakes.** Age-0 yellow perch, alewife and white perch drive midsummer *Daphnia* declines and smaller body size [review; repo `../Hot Brook populations and water/invertebrates_plankton_plants.md` §4].

**Other species**
- **White bass, Lake Erie and Oneida Lake** [primary, abstract; GL / NE] — [Madenjian et al. 2000, TAFS 129:1340](https://academic.oup.com/tafs/article/129/6/1340/7891389)
  - Age-0 white bass abundance in 1982–97 was significantly below 1969–81, and adult catches fell after 1987.
  - Of four hypotheses, white perch harming early life stages fit best.
  - In Oneida Lake, low white bass recruitment since 1955 coincides with white perch occupation.
- **Walleye, Bay of Quinte** (Schaeffer & Margraf 1987, via USGS NAS) [review; GL]: the walleye fishery's collapse coincided with the white perch increase; egg predation is the suspected mechanism.
- **Notropis minnows, emerald and spottail shiners** (Parrish & Margraf 1994, via USGS NAS) [review; GL]: competition is suspected in their declines.
- **Kerr Reservoir** [primary, full text; S] — Harris 2006
  - Diet overlap of age-0 white perch with age-0 crappie, largemouth bass and striped bass was > 0.5 in June. After June it stayed high only with crappie, as bass and stripers became piscivores.
  - Adult white perch overlapped adult crappie (0.50–0.73).
  - Largemouth and striped bass abundance and growth did **not change** between 1974–87 (before white perch) and 1996–2005; white bass declined.
- **North Carolina lakes** (Feiner et al. 2013, via USGS NAS) [review; S]: significant trophic overlap with walleye, largemouth bass, bluegill, striped bass and white bass. Feiner et al. 2019 found high overlap with black crappie.
- **Saginaw Bay** (Pothoven & Höök 2015, via USGS NAS) [review; GL]: age-0 white perch and white bass coexist long-term without complete trophic separation.

**Sunfish alongside abundant white perch, Maine and Connecticut** [primary data, tallied in an earlier pass] — repo `../Hot Brook populations and water/eastern_maine_relative_abundance.md`
- **EPA EMAP midsummer nets, 1991–94** ([fish counts](https://archive.epa.gov/emap/archive-emap/web/txt/fshcnt-2.txt)):
  - White perch were the most numerous adults, a median 42 % of adults across 9 eastern Maine lakes.
  - Pumpkinseed occurred in all 8 white perch lakes.
  - My ratios of adult pumpkinseed to adult white perch [inf]:

    | Lake | Adult white perch | Pumpkinseed ratio | Other sunfish |
    |---|---|---|---|
    | Mattanawcook | 590 | 0.15 | redbreast present |
    | Crawford | 246 | 0.09 | |
    | Second Lake | 209 | 0.06 | |
    | Upper Middle Branch | 206 | 0.11 | redbreast 0.10 |
    | Lower Oxbrook | 185 | 0.03 | |
    | East Branch | 98 | 0.12 | redbreast 0.07; hybrids 0.08 |
    | Fourth Machias | 54 | 0.35 | |
    | Pleasant | 24 | 0.21 | |

    The median is **≈ 0.12**.
  - Across all ages, pumpkinseed are a median 7 % of fish against white perch 29 %.
- **Connecticut DEEP night electrofishing**, in 9 lakes with smallmouth, white perch and pickerel ([survey](https://portal.ct.gov/-/media/deep/fishing/fisheries_management/statewidelakeandlargeriverelectrofishingsurveypdf.pdf)): median catch per hour was white perch 42, pumpkinseed 30, redbreast 16 (bluegill 59). Electrofishing favours sunfish and nets favour white perch, so the true ratio lies between the two gears.
- **Northeastern lakes** (Whittier et al. 1999; repo `docs/reports/Maine lakes ponds and streams.md`): pumpkinseed occur in 74 % of 203 lakes and white perch in 19 %, so co-occurrence is the norm wherever white perch live.

**Timing (priority effects)** — Hot Brook spawning calendar [agency; repo `docs/reports/Maine lakes ponds and streams.md`]

| Species | Spawning | Year-fraction |
|---|---|---|
| Chain pickerel, yellow perch | ice-out to mid-May | 0.14–0.21 |
| **White perch** | late May–June, ~15 °C | 0.24–0.33 |
| Fallfish | late May–June, in stream gravel | — |
| **Pumpkinseed** | June–August at 17–26 °C, repeated broods | 0.25–0.50 |
| **Banded killifish** | late June–August, > 20 °C | 0.31–0.50 |

- Young white perch are therefore 2–4 cm and eating *Daphnia* by the time most sunfish and killifish larvae appear.
- Sunfish offset this with **protracted spawning**. At Lake Opinicon most autumn juveniles came from larvae produced after mid-June, and larva-to-juvenile survival was highest above 23.5 °C (Garvey et al. 2002) [snippet; repo `../Maine lakes ponds and streams/centrarchid_percid_esocid_parameters.md`].
- **Larvae barely affect small zooplankton.** Larvae of all species have only minor effects on rotifers, copepodids and small cladocerans. It is the 0+ *juveniles* that suppress large cladocerans in late summer (Mehner & Thiel 1999 review of 18 studies) [primary review, abstract; repo `fish_zooplankton_coupling.md` §3].

---

## 5. Community biomass in white perch / bass / pickerel lakes

### Takeaway
- No published Maine or New England rotenone census of a white perch / bass / pickerel lake was readable in this pass.
- The best Maine-specific white perch figure is derived from MDIFW's 1981 statewide standing crop: **≈ 21 kg/ha, ≈ 260 fish/ha, mean ≈ 80 g**.
- Southern reservoirs give 13–24 kg/ha at ~500/ha (Lake Anna), and stunted superabundance at ~1,500–1,900/ha (Branched Oak).
- For the whole community of soft-water northern lakes, the repo's earlier synthesis supports **≈ 50–90 kg/ha of fish ≥ 7.5 cm**.

### Cited findings
- **Maine statewide, 1981:** 60,175,000 fish and 10,590,800 lb (Jordan 1981, via Stanley & Danie) [review → agency].
  - Spread over MDIFW's 2002 white perch acreage (~570,000 acres ≈ 230,700 ha), that is **261 fish/ha and 20.8 kg/ha, mean 80 g** [inf].
  - Caveats:
    - the 1981 and 2002 acreages may differ;
    - in 2002 MDIFW itself said the standing crop could not be estimated, so the 1981 figure was probably assumption-based;
    - which size classes it counts is unknown.
- **Lake Anna, VA** [S]:
  - 2.73 kg/ha in 1979, 24.2 in 1982 and 21.0 in 1983 (cove rotenone);
  - ~520 fish/ha over 1981–83;
  - this was an *invasion* rising ~9× in 3 years.
  - [NRC ML050670520](https://www.nrc.gov/docs/ML0506/ML050670520.pdf), via repo `../Hot Brook populations and water/fish_numbers_and_new_species.md`.
- **Branched Oak, NE** [S]: 1.1–1.4 million fish in ≈ 730 ha (Stewart 2015), so ≈ 1,500–1,900/ha [inf].
- **Whole community:**
  - Nebish Lake, WI (soft water, TP ≈ 20): 236 kg/ha of all fish, with ≈ 640 age-1+ non-minnow fish/ha at ≈ 53 kg/ha.
  - Northern soft-water lakes: **≈ 50–90 kg/ha** of fish ≥ 7.5 cm suggested for Hot Brook (TP 9–10 µg/L).
  - Fish biomass tracks TP (Hanson & Leggett 1982, r² 0.75).
  - [review/inf; repo `species_numbers_northern_lakes.md` Q8 and `../Real lake ecology for calibration/whole_lake_energy_flow.md` Q1]
- **Per-species census already proposed in the repo** (fish ≥ 7.5 cm per ha; `species_numbers_northern_lakes.md` and `size_structure_whiteperch_sucker_bullhead.md`):

  | Species | Fish/ha | kg/ha |
  |---|---|---|
  | White perch | 400–500 (fallback 750 stunted) | 20–35 |
  | Yellow perch | ~500 | 6–15 |
  | Pumpkinseed | ~100 | 2–6 |
  | Bullhead | ~100 | 5–14 |
  | White sucker | ~70 | 15–30 |
  | Smallmouth bass | ~40 | 4–10 |
  | Chain pickerel | ~25 | 4–10 |
  | Fallfish | ~50 | 2–6 |

- **Rupp & DeRoche 1965** made rotenone standing-crop estimates in three small Maine lakes and compared them with C-14 production. Only the abstract was readable, and it gives no numbers [primary, abstract; ME] — [TAFS 94:9](https://academic.oup.com/tafs/article/94/1/9/7894050).

---

## 6. Zooplankton in such lakes and its response to planktivores

### Takeaway
- **Hot Brook's region.** Summer crustacean zooplankton in nearby soft-water lakes is about **30–60 µg DW/L** (median).
  - *Daphnia* is a minority there (~5–25 %) and absent from ~30 % of lakes.
  - Copepods and *Holopedium* are prominent.
- **Large cladocerans collapse** in late summer once age-0 planktivores exceed ~**20–40 kg/ha** (Oneida). About 10 kg/ha is tolerated.
- **Larval fish barely dent small zooplankton.**
- **Whole-lake removals** of planktivores raise zooplankton biomass up to ~10× and restore large *Daphnia*.

### Cited findings
- **LakePulse summer crustacean biomass** (my analysis of [Zenodo 4701262](https://zenodo.org/records/4701262)) [primary data; repo `../Hot Brook populations and water/invertebrates_plankton_plants.md` §4]:

  | Lake set | Median (µg DW/L) | IQR | *Daphnia* share | Calanoid + cyclopoid share |
  |---|---|---|---|---|
  | Lakes ≤ 250 km of Danforth (n = 37) | **51.6** | 17–89 | 23 % | 62 % |
  | Lakes ≤ 150 km (n = 10) | **30.7** | — | 5 % | — |
  | Atlantic Maritime | 46 | — | — | — |

- **Adirondack lakes:** about 66 µg/L of crustaceans plus 19 µg/L of rotifers. Under ice, density falls to ~25 % of summer (Hampton et al. 2017) [review; repo].
- **Oneida Lake:** May–October means of 97–315 µg DW/L total and 22–196 for *Daphnia*. In mesotrophic shallow lakes, 50–300 µg DW/L [review; repo `../Real lake ecology for calibration/zooplankton_dynamics.md` Q1].
- **Planktivore effects** [primary, abstracts; repo `fish_zooplankton_coupling.md` §3 and §6]:
  - Oneida *D. pulex*: withstands ~10 kg/ha of YOY yellow perch; collapses at 20–40 kg/ha, when consumption exceeds production (Mills & Forney 1983).
  - Wintergreen Lake: when bass returned, planktivores fell ~100×, total zooplankton rose ~10× and large *Daphnia* returned (Mittelbach et al. 1995).
  - Mendota: planktivores fell from 300–600 to 20–40 kg/ha, and *D. pulicaria* replaced *D. galeata*.
- **White-perch-specific:**
  - young white perch growth tracks *D. pulex* (Prout et al. 1990);
  - adults switch to *Daphnia* only above 20/L (Couture & Watzin 2008).
  - **No whole-lake study of zooplankton response to white perch density was found.**

---

## 7. Implications for the sim

### 7.1 Target ranges

| What | Target | Basis |
|---|---|---|
| Adult (age 3+, ≳ 15 cm) annual mortality | **A 0.45–0.55 (Z 0.6–0.8)**, of which predation ≲ 0.05–0.10 and fishing 0.02–0.08. The rest, ≈ 0.45–0.65 instantaneous, is "unsimulated" (spawning, winter, disease, age) and should **not be halved** | Cooper 1941 / Mansueti; Hudson catch curve; Then |
| Ages 1–2 (7.5–15 cm) | A 0.50–0.65: the same background plus 15–35 %/yr from fish predators | repo predator note |
| Max age | **maxAge 10** (M ≈ 0.6) rather than 12; allow a rare 13–16-year-old | typical 7–10; Maine record 17 |
| Age-0, August–September | 300–3,000/ha, varying ≥ 10× between years; length **4.5–7.5 cm** (mean ~6) | Lake Erie (scaled down); first-season growth |
| First winter | survival by length: ≈ 0.2–0.5 at 45–55 mm; 0.5–0.8 at 60–70 mm; ≥ 0.8 at ≥ 80 mm; worse in long, cold winters | Johnson & Evans 1990 [inf] |
| Recruitment | as age-1 agents **next spring** at ~6–9 cm, never in the first September | §2 |
| Biomass | **15–35 kg/ha** (centre ~20–25), 250–750/ha ≥ 7.5 cm, mean 40–80 g; equilibrium swings ± 30–50 %; a 2× rise in one year only during an invasion | Maine 1981 [inf]; Lake Anna |
| Sunfish | pumpkinseed adults ≈ **0.05–0.3× white perch adults** (Upper; redbreast ≈ 0.05–0.15× where present); never extirpated by white perch alone | EMAP ratios; Connecticut |
| Rations | an adult p of 0.3–0.6 of Cmax in late summer is **normal**, so 25–35 % is not itself a failure. Larvae and young need small-prey food that sustains p ≳ 0.5 | repo `fish_zooplankton_coupling.md` §4 |

### 7.2 Mechanisms most likely to regulate them, ranked by evidence and leverage

1. **Size-dependent first-winter mortality of age-0** (Johnson & Evans 1990), together with white perch's higher winter metabolism (Johnson & Evans 1991). This is the **compensatory** brake: crowded cohorts end summer small and die over winter.
   - To build it, keep the young as schools through their first winter.
   - Apply either a hazard of the Johnson–Evans form, h ∝ e^(a·days − b·FL) at the under-ice temperature, or an energy budget that captures the higher winter respiration. The `species.js` comment says the yellow perch FB4 set used now does not capture it.
   - `FRY.M_JUV_Q10` slows juvenile death in cold water. That suits predation, but must not cancel this starvation term.
2. **Ontogenetic diet and habitat separation**, which explains why sunfish persist:
   - larvae < ~15–20 mm of every species eat rotifers, nauplii and small cladocerans, which larvae barely deplete (Mehner & Thiel);
   - young white perch take *Daphnia* from ~20–30 mm and switch to benthos at **~40 mm**, not 2.5 cm (Prout; Harris);
   - adult white perch take *Daphnia* only above ~20/L, and benthos otherwise (Couture & Watzin);
   - young pumpkinseed and redbreast feed in the weeds on littoral microcrustaceans and insects;
   - killifish young feed along the shore edge, and fallfish young on stream drift.
   - **Two checks in the code:**
     - The sunfish, killifish and fallfish larvae that stall at 1–2 cm should draw on a **small-zooplankton / littoral pool** (rotifers, nauplii, chydorids) that the white perch young do not deplete. They should not draw on the same *Daphnia*-weighted field.
     - Setting white perch `benthL` ≈ 4 cm would remove the early access to bed food that may let their young keep growing while everyone else starves.
3. **Density-dependent growth with fixed small-size maturity** (stunting). Leave white perch growth food-limited, and keep maturity at 7–8 cm (males) and 9–10 cm (females) so stunted fish still spawn. Numbers are then set by mechanism 1 and biomass by food, with no census cap.
4. **Adult background mortality** of ≈ 0.45–0.65/yr not driven by predators (see 7.1). This alone removes much of the year-1 biomass doubling. Holding 31 kg/ha needs losses ≈ production. Survival of 0.70 instead of ≈ 0.50 keeps an extra 20 % of the stock every year. At equal recruitment it also gives a steady-state stock ~1.7× larger [inf].
5. **Predation and cannibalism on eggs, larvae and age-0 / yearlings:**
   - adult white perch on eggs (up to 100 % of their spring diet in Lake Erie tributaries) and on their own young;
   - yellow perch, bass and pickerel on 4–15-cm fish;
   - a size refuge for white perch above ~15–17 cm from pickerel;
   - large predators mostly take 8–15-cm white perch.
6. **Asymmetric competition with young yellow perch** (Prout): yellow perch cohorts that crash *Daphnia* depress white perch growth. The sim should let yellow perch, the most numerous young fish in eastern Maine (EMAP), share the burden.
7. **Angling harvest** of 2–8 %/yr of adults. Hot Brook is a "principal fishery" with a 25/day bag. This is minor next to 1–4.

### 7.3 Diagnostics to run after a change
- **Young-of-year fate audit by species** (`stats.fry` / `recruits`). Check:
  - white perch first-winter loss vs fall length;
  - the August length distribution (mean ~6 cm);
  - recruits per spawning.
- **White perch age structure at the end of summer.** The age-3+ share should give a catch-curve Z ≈ 0.6–0.8. Few fish should be older than 9.
- **Late-summer age-0 planktivore biomass** (all species) against the Oneida threshold of 20–40 kg/ha. Above it, *Daphnia* should crash while rotifers and nauplii persist. The larvae of late spawners (pumpkinseed, killifish) should still find food.
- **Multi-seed A/B (≥ 3 seeds) over ≥ 5 years.** Sunfish and killifish must recruit in both lakes with abundant white perch. White perch should settle at 15–35 kg/ha with no census cap.

---

## 8. Gaps, conflicts and uncertainties

**Not found or not readable** (a search-enabled pass should target these):
- **Northeastern landlocked catch curves:** Cooper 1941 (MDIFW Fish Survey Rep. 4); Bryant 1972 (South Branch Lake, ME); AuClair 1956/1960; Hines 1981 (a stunted eutrophic Maine pond); Taub 1966 (Quabbin, MA); Thoits & Mullan 1973. All are theses or grey literature; UMaine Digital Commons has been retired.
- **The Bay of Quinte record.** A white perch decline after the severe late-1970s winters (Hurley 1986, *Project Quinte*) is recalled but **unverified here**. It would be the best field test of winter regulation.
- **Full texts behind blocks:**
  - Johnson & Evans 1991 (CJFAS), for the white perch vs yellow perch winter energetics;
  - Couture & Watzin 2008, for consumption vs production in Lake Champlain;
  - Feiner et al. 2012, for life history across invasion stages in NC reservoirs;
  - Parrish & Margraf 1990;
  - Schaeffer & Margraf 1986;
  - the MDIFW 2002 plan (now 403);
  - Stewart 2015, for Branched Oak / Pawnee details.
- **Data that may not exist at all:**
  - any white perch stock–recruitment fit;
  - any northeastern age-0 density;
  - any bird-predation share for white perch;
  - any study of white perch effects on pumpkinseed or redbreast.

**Conflicts**
- **Maximum age.** 7 (Hudson, Connecticut River) against 16–17 (Maine record) and MDIFW's typical 5–7. Slow-growing northern fish likely live longer, but the record is one fish. Use 9–10 for M.
- **FishBase growth and resilience.** FishBase's "low resilience, doubling 4.5–14 yr" rests on York River K values (0.07–0.13). It contradicts invasions such as Lake Anna (~9× in 3 years) and Nebraska (bullhead replaced in 3 years). Do not use it.
- **What drives stunting.** Stanley & Danie link stunting to eutrophic waters and few predators. MDIFW reports it widely in low-fertility Maine waters, and Hot Brook (TP 9–10) has many predators. This is unresolved; it bears on whether the sim's white perch should be intermediate or stunted (see `size_structure_whiteperch_sucker_bullhead.md`).
- **Spawning temperature.** The Hot Brook calendar gives ~15 °C. AuClair (1956, Sebasticook Lake, via Stanley & Danie) says Maine lakes must hold 18–21 °C for several days first. The later trigger would move white perch larvae closer to the sunfish's.
- **When white perch turn piscivorous.** Maine and Nebraska perch eat fish regularly only above ~200 mm, Kerr fish from 80–150 mm. Use ≥ 18–20 cm for Hot Brook.
- **Applying the Johnson & Evans models.** They describe starved lab fish, and their size range is not stated in the abstract. Treat their absolute values as an upper envelope. The size × winter-length shape is the robust part.
