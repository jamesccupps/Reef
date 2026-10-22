# The first summer of young-of-year fish in small north-temperate lakes: their prey, where they live, how fast they grow, what they need, how many survive

Compiled 2026-10-22 for the Hot Brook lakes (Upper and Lower Hot Brook Lake, eastern Maine: shallow, mean 2.5–3.3 m, coloured, mesotrophic, weedy; smallmouth bass, pumpkinseed, redbreast, yellow perch, white perch, chain pickerel, brown bullhead, white sucker, fallfish, banded killifish, blacknose dace).

**Why this note exists.** The 3-D sim gets **zero recruitment**: its larvae starve.
- Pumpkinseed larvae sit mostly over water deeper than 2 m and stall at 5–6 mm for two months, getting 12–57 % of their wanted ration.
- Smallmouth young reach 16 mm and starve by mid-July at 25–46 % of their potential ration.
- The rotifers crash to ~0 µg/L from late June and stay there all summer. Daphnia peak at ~200 µg/L in early June, then hold 20–80.
- The young's diet is ~100 % zooplankton.

This note asks what real lakes offer these young, where the young actually are, how fast they grow, what they need, and how many live.

**Tags.**
- **[primary]**: full text read by me in this session.
- **[data]**: my own analysis of a public data set, downloaded and read in this session (method in §1).
- **[abstract]**: abstract or publisher/station summary page only.
- **[secondary — X via Y]**: X as given in Y, which I read.
- **[repo CODE]**: held, with its own tag, in a companion note; cited, not re-read.
- **[inf]**: my inference or arithmetic, shown.

**Companion notes (not repeated; codes used below):**

| Code | Note | What it already holds |
|---|---|---|
| LM | `larval_mortality.md` | Larval Z by species, cause partition (fish predation ≥ 70–90 %), peak larval densities |
| FPL | `fish_predation_on_larvae.md` | The fish-on-larvae rule, overlap, alewife |
| ESL | `egg_survival_and_larval_production.md` | Egg and yolk-sac survival, larvae per spawner, standing vs cumulative larvae |
| ZD | `zooplankton_dynamics.md` | Biomass vs TP, P/B equations, PEG, Daphnia thresholds |
| SZM | `small_zooplankton_and_microbial_loop.md` | Rotifer persistence (Gjerstadvann), Gilbert's interference (abstracts), Hart & Werner 1987, the prey ladder, *Chaoborus* |
| FZC | `fish_zooplankton_coupling.md` | Larval rations, gapes, first foods, prey-density thresholds, critical-period evidence |
| FFE | `forage_fish_early_life.md` | Bluegill (Beard 1982), pumpkinseed and perch early life |
| LJE | `larval_juvenile_energetics_panfish.md` | FB4 larval sets, field first-summer lengths, Breck's bluegill set, Margulies' white perch |
| JRB | `juvenile_refuges_and_bass_young.md` | Young smallmouth habitat, dispersal (Ridgway 2002) |
| BGW | `bullhead_growth_and_young_white_perch.md` | YOY white perch lengths and diet |
| PYOY | `../Predator winter energetics/pickerel_young_of_year.md` | Young pickerel diet, growth, habitat |
| LI | `../Whole lake 3D fish simulation/littoral_invertebrates.md` | Epiphytic invertebrates per g plant and per m² (4,000–17,000/m² of weed bed) |
| FWM | `first_winter_mortality.md` | First-winter size thresholds |

**What is new here:**
- **An analysis of the US EPA National Lakes Assessment (NLA) 2012, 2017 and 2022 zooplankton counts** for north-eastern and upper-Midwest lakes, including a Hot Brook-like subset and Maine alone. It gives summer densities and biomasses of rotifers, nauplii, small cladocerans, Daphnia and copepods by month, by lake depth, and against Daphnia biomass (Gilbert's interference tested in the field).
- Pumpkinseed larvae and juveniles through a whole first summer in an Ontario lake (Sobchak et al. 2026, full text).
- Breck 1997's bluegill model re-read for its encounter rule, prey structure and the larval densities at which young fish starve.
- Lake Opinicon's larval succession, first-summer growth and juvenile weed-bed diets (Amundrud et al. 1974; Keast 1978, 1985; Keast & Eadie 1984).
- Smallmouth year-class strength against summer temperature (Fry & Watt 1957; Clady 1975; Shuter et al. 1980), first-year growth (DeAngelis & Coutant 1979) and piscivore control of recruits (Tonn et al. 1992).
- A prey-count and larval-grazing budget that ties the sim's symptoms together (§4, §5).

**Search budget.** This turn's shared WebSearch budget was already spent when this pass began, so **no web searches ran**. Everything came from known open data portals, DOI lookups (OpenAlex single records and their reference lists), Europe PMC full text by PMCID, and known open URLs (§6).

---

## 1. The first-feeders' prey: rotifers, nauplii and small cladocerans in summer

### Takeaway
- **In lakes like Hot Brook the small prey never vanish in summer.** Across 64 NLA visits to Hot Brook-like lakes (north-east and upper Midwest; index depth ≤ 6 m; colour 15–100 PCU; TP 8–30 µg/L; Daphnia present), July medians were **453 rotifers/L (7 µg DW/L), 64 nauplii/L (4 µg/L) and 37 small cladocerans/L**. Rotifers fell below 50/L in only 0–18 % of visits in any month, and below 10/L in ≤ 6 % of visits across the wider north-eastern and upper-Midwest sets. [data]
- **Daphnia lower rotifers but do not remove them.** In north-eastern and upper-Midwest lakes in July–August, the median rotifer density fell from 450/L where Daphnia were < 1 µg/L to 180–220/L where Daphnia exceeded 30–100 µg/L. Even there the 10th percentile was ~30/L. [data] This fits Gilbert 1988: suppression needs **large (> 1.2 mm) Daphnia**, and the field's summer Daphnia average ~1 mm. [abstract; data]
- **The shallowest lakes hold the most small prey.** Lakes ≤ 2 m deep at the index site held ~450 rotifers/L, ~110 nauplii/L and ~8 *Bosmina*/L in July–August, against ~190, ~27 and ~0.6 in lakes > 8 m. Daphnia were mostly absent there. [data] Plant-associated taxa make up "almost half" of shallow-lake zooplankton biomass (Gyllström et al. 2005) [primary, re-read].
- **Maine.** In 33 July–August visits to Maine lakes ≤ 6 m deep (TP ≥ 8), the medians were 427 rotifers/L (8 µg/L), 48 nauplii/L, ~6 small cladocerans/L and copepods 94 µg/L. Daphnia were scarce (median 0.2/L, 0.6 µg/L). [data]
- **Small-prey biomass, the larvae's whole menu** (rotifers + nauplii + *Bosmina* + *Ceriodaphnia*/*Diaphanosoma* + chydorids): medians **46, 67, 37 and 16 µg DW/L in June, July, August and September** in the Hot Brook-like lakes. [data]
- **Individual masses** (NLA's own dry-mass factors): rotifer **0.025 µg** (IQR 0.014–0.036), nauplius **0.067 µg** (0.054–0.084), *Bosmina* **0.82 µg** (0.67–1.5). [data]

### Cited Findings

**The NLA data and method** [data]
- **Source:** US EPA National Aquatic Resource Surveys, [data page](https://www.epa.gov/national-aquatic-resource-surveys/data-national-aquatic-resource-surveys). Files used:
  - zooplankton counts: [NLA 2012](https://www.epa.gov/system/files/other-files/2021-12/nla-2012-zooplankton-count-data-updated-12092021.csv), [NLA 2017](https://www.epa.gov/system/files/other-files/2021-12/nla-2017-zooplankton-count-data.csv), [NLA 2022](https://www.epa.gov/system/files/other-files/2024-08/nla22_zooplanktoncount_wide.csv), with their taxa lists;
  - site information, water chemistry and chlorophyll (TP, colour, calcium) and profile files (index-site depth) for each year.
- **Sampling, as the metadata describe it:** one vertical tow per visit at the index (deepest) site with a **fine 50-µm net** and a **coarse 150-µm net**; DENSITY in organisms/L and BIOMASS in µg DW/L per taxon. Each taxon is counted from the net its `NET_SIZECLS_NEW` names (FINE: rotifers, nauplii; COARSE: cladocerans, copepodites and adults). I followed that rule, so nothing is double-counted.
- **Nauplii** are the fine-net taxon "COPEPODA" (raw name "COPEPOD NAUPLII", ~0.065 µg each). NLA 2022 does not code them separately, so all naupliar statistics use 2012 and 2017 only.
- **Selections:**
  - *North-east (NE)*: ME, NH, VT, MA, NY, CT, RI. *Upper Midwest (UMW)*: MN, WI, MI.
  - *Hot Brook analogues (HB)*: NE + UMW, index depth ≤ 6 m, colour 15–100 PCU, TP 8–30 µg/L, Daphnia ≥ 1/L. 64 visits (CT 8, MA 1, ME 11, MI 10, MN 4, NH 9, NY 5, RI 5, VT 2, WI 9).
  - *Inshore proxy*: index depth ≤ 2 m, TP 8–35, any Daphnia. 59 visits.
- **Caveats [inf]:**
  - each lake was sampled once a summer, so a "month" is a cross-section of lakes, not a time series;
  - the index site is the deepest point, so these are pelagic values, except in the ≤ 2-m ponds;
  - a 50-µm net lets part of the smallest rotifers (*Keratella cochlearis*, *Polyarthra*, ~50–100 µm wide) through, so rotifer counts are **conservative**.

**Hot Brook analogues by month: medians, with IQR in brackets** [data]

| Month (visits) | Rotifers /L (µg DW/L) | Nauplii /L (µg/L) | Small cladocerans /L | Small-prey biomass µg/L | Daphnia µg/L | Copepodites + adults µg/L |
|---|---|---|---|---|---|---|
| June (17) | 270 (219–407) · 6.4 µg | 72 (49–106) · 4.6 | 8.8 (1.7–47) | 46 (21–141) | 37 (15–164) | 90 (22–155) |
| July (23) | **453 (317–848)** · 7.1 µg (3.4–19) | **64 (24–95)** · 4.1 | **37 (12–138)**; *Bosmina* 17 (6–69) | **67 (27–151)** | 35 (18–89) | 90 (47–180) |
| August (17) | 278 (117–467) · 8.2 µg (2.5–18) | 47 (21–132) · 3.3 | 4.0 (1.4–21) | 37 (8–50) | 42 (27–80) | 121 (23–274) |
| September (7) | 469 (242–632) · 8.8 µg | 56 (30–67) | 3.8 (3–23) | 16 (15–37) | 16 (6–65) | 80 (76–212) |

- Pooled June–September: rotifers 323/L (IQR 200–632; p10 43/L), 8.0 µg/L (IQR 3.1–20; p10 1.2 µg/L).
- Share of visits with rotifers < 50/L: 12 % (June), 9 % (July), 18 % (August), 0 % (September).
- Share of visits with all first-food prey (rotifers + nauplii + small cladocerans) < 100/L: 7 %, 15 %, 23 %, 0 %; < 250/L: 13 %, 15 %, 46 %, 17 %.

**Wider sets** [data]
- NE lakes, all depths, TP 8–35, Daphnia ≥ 1/L (113 visits). Rotifer medians 221 / 234 / 155 / 199 per L (June–September); 5 µg DW/L in every month. Rotifers < 10/L in ≤ 5 % of visits.
- UMW lakes, the same selection (176 visits): 214 / 193 / 226 / 166 per L; 6–8 µg/L.
- By index-site depth, NE + UMW, TP 8–35, July–August, all lakes:

  | Depth (visits) | Rotifers /L (µg/L) | Nauplii /L | *Bosmina* /L | *Ceriodaphnia* + *Diaphanosoma* /L | Daphnia /L |
  |---|---|---|---|---|---|
  | ≤ 2 m (40) | 453 (13.2 µg) | 107 | 8.1 | 2.0 | 0 |
  | 2–4 m (80) | 467 (10.1) | 58 | 3.8 | 4.2 | 0.1 |
  | 4–8 m (97) | 336 (6.8) | 36 | 1.0 | 1.3 | 3.8 |
  | > 8 m (124) | 186 (5.5) | 27 | 0.6 | 0.6 | 4.2 |

- Inshore proxy by month (index ≤ 2 m): rotifers 789 / 453 / 430 / 461 per L; nauplii 85 / 67 / 132 / 110; small cladocerans 17 / 9 / 22 / 33; small-prey biomass 55 / 25 / 47 / 56 µg/L (June–September).
- **Chydorids are almost absent from pelagic tows** (median 0; p90 < 1/L). They are littoral and plant-dwelling animals, and the NLA design does not sample them.
- **Rotifer genera**, NE + UMW, July–August (181 visits): *Keratella* (mean 147/L, present in 178 visits), *Polyarthra* (85; 171), *Conochilus* (52; 124), *Kellicottia* (40; 139), then *Pompholyx*, *Ptygura*, *Gastropus*, *Brachionus*, *Trichocerca* (present in 124), *Conochiloides*, *Collotheca* and *Synchaeta* at 5–14/L.

**Maine** [data]
- July–August, all 66 Maine visits: rotifers 205/L (IQR 119–447), 7.2 µg/L; nauplii 31/L; *Bosmina* 0.9/L; Daphnia 0.8/L (1.6 µg/L; p75 58 µg/L); copepods 19/L (53 µg/L).
- Maine lakes ≤ 6 m with TP ≥ 8 (33 visits): rotifers **427/L** (126–638), 7.9 µg/L; nauplii 48/L; *Bosmina* 3.6/L; *Ceriodaphnia* + *Diaphanosoma* 2.5/L; Daphnia 0.2/L (0.6 µg/L; p90 89 µg/L); copepods 28/L (94 µg/L).
- In June 2022, the six Maine ponds ≤ 3 m deep held 458–1,506 rotifers/L.

**Gilbert's interference, tested in the field** [data; abstract]
- **Gilbert 1988** ([L&O 33:1286](https://doi.org/10.4319/lo.1988.33.6.1286)) [abstract]:
  - rotifers "cannot become abundant" beside **large (≳ 1.2 mm) Daphnia**, which suppress them by exploitation and by mechanical interference, "even at low (1–5 ind./L) Daphnia densities";
  - small (< 1.2 mm) cladocerans "often co-occur with them at high densities".
  - The open-access PDF returned HTTP 403 (§6).
- **NLA, NE + UMW, TP 5–50 µg/L, July–August:** rotifers against Daphnia biomass.

  | Daphnia (µg DW/L) | Visits | Rotifers /L, median (p10–p90) |
  |---|---|---|
  | < 1 | 174 | 450 (55–1,990) |
  | 1–10 | 69 | 293 (30–1,160) |
  | 10–30 | 47 | 229 (53–1,090) |
  | 30–100 | 85 | 178 (30–589) |
  | > 100 | 58 | 222 (31–577) |

- **Daphnia size.** The mean Daphnia mass per visit (NLA biomass ÷ density), converted with W = 5.0·L^2.84 (ZD), gives a median length of **0.97 mm** (IQR 0.78–1.21). Only 25 % of visits had a mean above 1.2 mm. [data; inf]

**Other field and model values (cited, not repeated)**
- Gjerstadvann ~150 rotifers/L in summer; the rotifer trophic index at Hot Brook's TSI gives 50–140/L; small-rotifer zero-growth food 0.02–0.03 mg C/L, below Daphnia's [repo SZM §6].
- Microzooplankton (ciliates + rotifers + nauplii) ≈ 40 % of zooplankton biomass at all trophic states (Pace 1986) [repo SZM §5].
- Rotifer P/B ≈ 0.17/d at 20 °C (Shuter & Ing) [repo ZD].
- **Gyllström et al. 2005** (81 shallow lakes; [PDF](https://lup.lub.lu.se/search/files/4775628/625280.pdf)) [primary, re-read]:
  - samples were shore-to-centre transects through a 50-µm net;
  - benthic and plant-associated taxa were "typically almost half" of zooplankton biomass and were set by plant cover (PVI);
  - rotifers' share showed no TP trend and fell with PVI only in the cool climate zone.
- **Ashby Lake, Ontario** (oligotrophic Shield lake, TP 7 µg/L, Secchi 5.4 m; 500-µm surface tows; Sobchak, Colborne & Robinson 2026, [Environ. Biol. Fishes 109:65](https://doi.org/10.1007/s10641-026-01836-6), [Europe PMC full text](https://europepmc.org/article/PMC/PMC13033004)) [primary]:
  - large zooplankton fell **4×** from June to July (4.73 → 1.13 mg/m³) as the water cleared;
  - it was **3× more abundant at pelagic shoals** than in littoral bays.
  - So the *large* prey can be scarcer inshore even where the small prey are richer [inf].
- **Lake Opinicon weed bed** (0.7–1.5 m; Keast 1985, [EBF 13:211](https://doi.org/10.1007/BF00000933); [QUBS summary](https://research.qubs.ca/projects/development-of-dietary-specializations-in-a-summer-community-of-juvenile-fishes)) [abstract]: the summer juvenile-fish community "was based on the period of high seasonal invertebrate abundance linked to the spring–summer proliferation of macrophytes: **food was not limiting**".
- Epiphytic invertebrates: **4,000–17,000/m² of weed bed**, 7–20× the bare bed [repo LI].

### Inferences for the sim
1. **The sim's summer rotifer collapse is outside ~95 % of field lake-visits.** Hot Brook-like lakes hold 270–470 rotifers/L (6–9 µg DW/L) every summer month. Even the monthly 10th percentiles are 43–200/L (≥ 1.2 µg/L). A run that holds rotifers at ~0 µg/L from late June to September is a model artefact.
2. **Daphnia at the sim's 20–80 µg/L should cost rotifers about half, not all.** The field median at 30–100 µg/L of Daphnia is ~180/L. If the sim's interference scales with Daphnia biomass rather than with the share above 1.2 mm, it is too strong for summer populations that average ~1 mm.
3. **The microzooplankton's individual masses in the sim's half-saturations.** ZOO3's K_ROT (5 µg/L at 0.05 µg each) and K_NAUP (20 µg/L at 0.2 µg each) each mean ~100 prey/L. With NLA's measured masses (rotifer 0.025 µg, nauplius 0.067 µg), 100 prey/L is **≈ 2.5 µg/L of rotifers and ≈ 7 µg/L of nauplii**. Keeping the sim's K in µg/L doubles (rotifers) or triples (nauplii) the count a larva needs.
4. **Where the small prey are.** Small prey are 2–4× denser in the shallowest water and Daphnia scarcer there. Inshore cells should therefore be richer in first food than the open basin, not poorer.
5. **Maine's shallow soft-water lakes carry little Daphnia.** Their median is 0.6 µg/L in July–August, with copepods and rotifers dominant. The sim's 20–80 µg/L of summer Daphnia sits within the wider NE + UMW range (IQR 15–89) but above typical Maine shallow lakes. That matches `daphnia_summer_limits.md` (median ~3 µg/L in lakes like Hot Brook).

### Gaps
- **No time series of rotifers in a small Maine or New England lake.** The North Temperate Lakes LTER zooplankton series (Wisconsin) was unreachable (§6).
- **No densities of rotifers, nauplii or chydorids *among plants*** in north-temperate lakes were obtained. The Kuczyńska-Kippen and Duggan series and Basu et al. 2000 are behind publisher walls, and no search could run. The ≤ 2-m NLA ponds are the only inshore proxy.
- No net-retention correction for 50-µm rotifer counts (Downing & Rigler methods not read).

---

## 2. Where the larvae and young live and feed, and when they switch

### Takeaway
- **Sunfish larvae are limnetic but stay mostly inshore, and for only weeks.**
  - **Pumpkinseed** leave the nest at ~4.5 mm TL, feeding on copepod nauplii.
  - In Ashby Lake their larvae were **7× denser in sheltered littoral bays** than over pelagic shoals or exposed shores. Densities peaked in late June and were **zero by the third week of July**.
  - The juvenile form develops at ~5 weeks (~20 mm TL).
  - Larval tissue was 91 % plankton-derived in June; juvenile tissue was **76 % by August–September**, showing rising benthic use [primary].
  - **Bluegill** stay limnetic ~1.5 months at 0.4 mm/d and return to the littoral at 22–25 mm (Werner 1969) [abstract]; 12.5 mm SL in Michigan lakes (Werner & Hall 1988) [repo FFE].
- **Back in the littoral the young eat littoral invertebrates.** Small pumpkinseed ate chironomids, molluscs and isopods; "Cladocera were only important to the very young fish" (Keast 1978) [abstract]. Sunfish < 100 mm SL stay in or near vegetation whatever the open-water profit (Mittelbach 1981) [abstract].
- **Perch** are pelagic from hatch (5.5–6.2 mm) until 11–30 mm, then littoral or demersal; benthos from ~50 mm [repo FFE, LM, FPL].
- **Smallmouth** are guarded on and near the nest from swim-up (8.5–9.5 mm) to ~20–28 mm. They then disperse as solitary fish over shallow rock, sand and sticks, mostly within 200 m [repo JRB, LM, LJE]. They eat chironomids and copepods from ~9 mm, with a diet shift at ~15 mm (Easton 1992) [repo SZM].
- **White perch** larvae are pelagic. YOY live in the unvegetated littoral and along the weed edge at 0.5–2.5 m and eat zooplankton to 40–60 mm [repo BGW, white_perch_habitat_and_predation.md].
- **Chain pickerel** first feed at ~10 mm in shore weeds ≤ 1 m: zooplankton to ~15 mm, then insects, then fish from 20–55 mm [repo PYOY].

### Cited Findings

**Pumpkinseed and bluegill**
- **Ashby Lake, Ontario, 2014** (Sobchak et al. 2026) [primary]:
  - Males nested in the littoral when surface water reached **19.5 °C** at the end of May; pelagic shoals followed 10 days later.
  - "At 8–11 days post-spawn, translucent larvae (**4.5 mm TL**) feeding on small copepod nauplii in the water column leave the nest."
  - Larvae first appeared on **3 June** in littoral tows and on 17 June in shoreline and pelagic tows.
  - "Larval density peaked in late June in all habitats although density was **seven times higher at littoral** compared to shoreline or pelagic sites." A small second pulse appeared in the littoral in early July. Density "fell to zero by the third week of July".
  - "The definitive juvenile phenotype develops at **5 weeks (~20 mm TL)** and continues feeding on zooplankton throughout the natal summer."
  - Mean SL by month (n):

    | Habitat | June larvae | July larvae | 16 August juveniles | 16 September juveniles |
    |---|---|---|---|---|
    | Littoral | 4.73 (3) | 4.62 (3) | 18.87 (34) | 23.86 (46) |
    | Shoreline | 4.15 (2) | 4.75 (4) | 18.03 (32) | 23.99 (29) |
    | Pelagic | 4.48 (2) | 5.32 (4) | 22.23 (32) | 27.48 (58) |

    The larval means are of few, mostly newly emerged larvae, so they do not show a stall.
  - Plankton-derived tissue (δ¹³C mixing model): **90.6 % (June larvae) → 80.3 % (July) → 75.5 % (August) → 76.6 % (September)**.
  - Pelagic juveniles were 15 % longer and 35 % heavier by summer's end.
  - The overwinter size threshold quoted is **35 mm TL for northern inland lakes** (Fox & Keast 1991; Garvey et al. 2002) and 26 mm in Lake Ontario embayments (Murphy et al. 2012).
  - This is a clear lake with an unusual pelagic ecotype, so the plankton share is high for pumpkinseed [inf].
- **Lake Opinicon, ON:**
  - Free-swimming larvae came in the same order in 1969 and 1970: yellow perch, logperch, black crappie, then pumpkinseed and bluegill. Peaks came earlier in the warmer spring (Amundrud, Faber & Keast 1974, [JFRBC 31:1661](https://doi.org/10.1139/f74-210)) [abstract].
  - First-feeders of six species took nauplii and small cyclopoids 0.1–0.3 mm long at 4.5–6.0 mm, and cladocerans from 8–10 mm (Keast 1980) [repo FZC].
  - In 2,435 stomachs, pumpkinseed ate "largely chironomid larvae, molluscs, isopods … Cladocera were only important to the very young fish". Bluegill took more Cladocera and caddis larvae, and the two partly separated by habitat and foraging height (Keast 1978, [JFRBC 35:12](https://doi.org/10.1139/f78-003)) [abstract].
  - In the weed bed at 0.7–1.5 m, the juveniles' diets were "distinct from those of the larvae" and nine species overlapped little (Keast 1985) [abstract].
  - YOY bluegill and pumpkinseed (> 24 mm) in the weed beds were distributed vertically like the older fish; the milfoil edge stood at 2–3 m, 25–30 m offshore (Brown & Colgan 1982, [QUBS summary](https://research.qubs.ca/projects/the-inshore-vertical-distribution-of-young-of-year-lepomis-in-lake-opinicon-ontario)) [abstract].
  - 40 % of larvae were in open water by 12 June; open-water larval density was unrelated to embryos on nests; survival was unrelated to edible zooplankton (Garvey, Herra & Leggett 2002, [Ecol. Appl. 12:194](https://doi.org/10.1890/1051-0761(2002)012[0194:PRISTT]2.0.CO;2)) [abstract].
  - Larval sunfish were much denser in shallow limnetic water near colonies; the deepest site held 8 % of the inshore-limnetic mean (via WDNR) [repo FFE].
- **Crane Lake, Indiana** (Werner 1969, [Am. Midl. Nat. 81:164](https://doi.org/10.2307/2423658)) [abstract]:
  - bluegill fry abandon the littoral "shortly after yolk sac absorption" for the limnetic epilimnion, patchily (in schools);
  - they feed on crustacean zooplankton, "selecting copepods";
  - activity is low by day, peaks at dusk with a secondary peak at dawn, and is low at night;
  - they stay ~1.5 months at 0.4 mm/d and return to the littoral at 22–25 mm.
- **Lake Mendota, WI** (Post, Rudstam & Schael 1995, [TAFS 124:84](https://doi.org/10.1577/1548-8659(1995)124<0084:TASDOP>2.3.CO;2)) [abstract]:
  - pelagic phases lasted 3–7 weeks;
  - most species "were distributed across the surface of the lake early in their pelagic phase, became relatively more abundant near shore later … and then disappeared from the pelagic zone";
  - *Lepomis* dominated pelagic age-0 fish by August.
- **Michigan:** bluegills < 100 mm SL "were restricted in their habitat use, remaining in or near the vegetation despite demonstrated increases in foraging return available in the open-water habitat" (Mittelbach 1981, [Ecology 62:1370](https://doi.org/10.2307/1937300)) [abstract]. Open-water risk was 40–80× (Werner & Hall 1988) [repo FFE].

**Yellow perch** (held; summarised for the targets table):
- Lake Itasca: limnetic within 2 weeks of a 5.6–6.2-mm hatch; back at 25 mm (~day 40).
- Lake St. George: offshore early, inshore by day as larger larvae, nearshore day and night by ~30 mm.
- Swedish lakes: back at 11–30 mm, later where cannibals are dense.
- West Blue Lake: at the surface at night, ~5 m down by day.
- Oneida: limnetic 18 mm → 1 August, demersal after.
- Copepods first, *Bosmina* from ~11 mm, Daphnia preferred at 30–35 mm, benthos from ~50 mm.

[repo FFE, FPL, FZC, LM]

**Smallmouth bass** (held):
- Swim-up 8.5–9.5 mm; metamorphosis 14–18.5 mm; brood dispersal ~28 mm (Opeongo).
- Near the nest 21 d or to 20 mm (DeAngelis et al. 1993 model).
- On-nest mass-specific growth 0.144–0.196/d at 20.7–22.2 °C (Kaevats et al. 2005).
- After dispersal: solitary, shallow, among stones and sticks, mean 88 m from the nest.
- Chironomids and copepods at ~9 mm; shift at ~15 mm (Easton 1992).

[repo LM, LJE, JRB, SZM]

**White perch, pickerel, bullhead, sucker** (held):
- White perch YOY: littoral by day, inshore at dusk; copepods and Daphnia, then chironomids and ostracods from 30–40 mm [repo BGW].
- Pickerel: zooplankton 10 → ~15 mm, then insects (64 % of food volume in young pickerel), fish from 20–55 mm, in shore weeds [repo PYOY].
- Bullhead fry are guarded in balls and eat chironomids and small crustaceans [repo FFE].
- White sucker: plankton to ~20–30 mm, then chironomids, ostracods and chydorids (related suckers) [repo `../Maine lakes ponds and streams/sucker_shiner_bullhead_trout_parameters.md`].

### Inferences for the sim
1. **Pumpkinseed larvae should be concentrated inshore.** The sim has them mostly over water deeper than 2 m.
   - The field has them ~7× denser in sheltered weedy bays than offshore, and densest in "shallow limnetic" water near the colonies.
   - In Hot Brook almost all the open basin is 2.5–4 m deep, so some larvae over > 2 m is realistic. **The bulk (≳ 60–80 %) should lie within the weedy fringe**, i.e. over ≤ 2–2.5 m within tens of metres of the colonies [inf].
2. **The larval plankton phase is short.**
   - Each pumpkinseed cohort leaves the tows within **~3–5 weeks** (Ashby: peak late June, none by the third week of July).
   - Bluegill stay ~4–7 weeks.
   - By ~15–25 mm the young are littoral juveniles.
   - A larva "stalled" at 5–6 mm for two months has no field counterpart. In the field it would have grown at ≥ 0.2 mm/d or died (§4, §5).
3. **The young's diet should not be ~100 % zooplankton after ~15–20 mm.**
   - Sunfish: from ~15–25 mm add chironomid larvae, chydorids, isopods and amphipods from the weed beds (Keast 1978, 1985; LI's 4,000–17,000 invertebrates per m² of bed).
   - Smallmouth: from ~9–15 mm add chironomids and other insects.
   - Pickerel: insects from ~15 mm.
   - Perch and white perch may stay mostly planktivorous to 30–60 mm.
   - Even in clear Ashby Lake with pelagic shoals, a quarter of juvenile pumpkinseed tissue was benthic by August. Breck's bluegill model kept growing after the zooplankton crashed only because the young switched to midge larvae (§4).
4. **Smallmouth at 16 mm are still under the guarding male** in the littoral at 0.5–2 m, not free-living planktivores. Their food is the nest area's zooplankton plus chironomids.
5. **Timing:** larvae of the late spawners (pumpkinseed, bluegill, smallmouth) appear in June and leave the plankton by mid-to-late July. Perch larvae come in May–June.

### Gaps
- No pumpkinseed larval density per m³ by depth over a lake as shallow as Hot Brook; Ashby's values are in a figure.
- No redbreast larval habitat data.
- No lake data on white perch larval distribution.
- Keast 1978/1985 numbers (diet by size class) were not read (cdnsciencepub and Springer blocked); QUBS and OpenAlex summaries only.
- Smallmouth YOY diet by size in a lake, beyond Easton's river fish, was not obtained (Clady 1974; Keast 1985 tables).

---

## 3. Growth through the first summer

### Takeaway
- **Length grows linearly through early summer and plateaus by early September.** Little growth follows September (Lake Opinicon, nine species; Keast & Eadie 1984) [abstract]. Spawning date sets most of the end size, and small-bodied species have the widest size range.
- **Larval and early-juvenile growth is 0.2–0.7 mm/d where food is adequate.** Bluegill limnetic fry grow 0.4–0.7 mm/d; Oneida perch 0.48 mm/d; Ashby pumpkinseed ~0.2–0.25 mm SL/d averaged from emergence to mid-August; smallmouth ~0.6–1 mm/d on the nest.
- **End-of-summer lengths in the north:**

  | Species | Length | Source |
  |---|---|---|
  | Smallmouth | **50–85 mm** (Maine 71–76) | [repo LJE, JRB] |
  | Yellow perch | **55–80 mm** | [repo LJE] |
  | White perch | **55–75 mm** in New York | [repo BGW] |
  | Pumpkinseed | **25–45 mm** | Ashby ~30–34 mm TL [inf] |
  | Bluegill | 26–42 mm | [repo FFE] |
  | Redbreast | ~36 mm | New Brunswick [repo LJE] |
  | Chain pickerel | 100–130 mm | Maine [repo PYOY] |
  | Banded killifish | 32–50 mm | [repo LJE] |

### Cited Findings
- **Keast & Eadie 1984** (Lake Opinicon, 1977; [Can. J. Zool. 62:1242](https://doi.org/10.1139/z84-180); [QUBS summary](https://research.qubs.ca/projects/growth-in-the-first-summer-of-life-a-comparison-of-nine-co-occurring-fish-species)) [abstract]:
  - weekly seining of inshore shallows and weed beds, late June to August, plus early September and early October;
  - young grew **6–10× their hatch length and up to 1,000× in weight**;
  - "length increments were linear early in the summer and reached a **plateau by early September**. Few species grew significantly in length or weight beyond September";
  - "Spawning date had the greatest influence"; "no apparent relationship between diet type and growth".
- **Ashby Lake pumpkinseed** (Sobchak et al. 2026) [primary]:
  - SL on 16 August 18.0–22.2 mm and on 16 September 23.9–27.5 mm, i.e. **~0.17 mm SL/d** over that month;
  - from first emergence (3 June, 4.5 mm TL) to 16 August, ~0.2–0.25 mm SL/d on average. This is a lower bound, since most larvae emerged later (peak late June) [inf];
  - September SL of 24–27.5 mm is ≈ 30–34 mm TL (TL ≈ 1.24 SL [inf, typical Lepomis ratio]), near the 35-mm overwinter threshold.
- **Werner 1969:** limnetic bluegill 0.4 mm/d [abstract]. **Beard 1982:** 0.4–0.7 mm/d in the first 14 d; September means 26–42 mm [repo FFE, LJE].
- **Breck 1997** (Michigan ponds; [MI DNR Fish. Res. Rep. 1995](https://www.dnr.state.mi.us/PUBLICATIONS/PDFS/DNRFishLibrary/ResearchReports/RR1901-RR2000/RR1995.pdf)) [primary, re-read]:
  - ~0.6 mm/d for 3–4 weeks, then ~0.2 mm/d "when total zooplankton density (exclusive of rotifers) decreased below about 50 organisms/L", and ~0 by September;
  - simulated final length fell 47 % for a 10× rise in fry density;
  - final length was independent of density at ≤ 0.8 fish/m³, where "limited by time and temperature, not by food".
- **Smallmouth:**
  - Lab populations at 15.2–32.5 °C grew **linearly in mean length from 10 to 30 mm**, the variance rising as t² (DeAngelis & Coutant 1979, [TAFS 108:137](https://doi.org/10.1577/1548-8659(1979)108<137:GRASDO>2.0.CO;2)) [abstract].
  - Opeongo: 48–53 mm in early September; first-year growth 55–85 mm FL.
  - Spednic Lake (Maine–New Brunswick): 71–76 mm.
  - Michigan statewide: 46 mm (July), 89 (August), 86 (September).

  [repo LJE, JRB]
- **Yellow perch:**
  - Oneida 0.48 mm/d (8–18 mm); 1 August mean 52.6 mm (37–65); 15 October 74.9 mm (57–93), strongly density-dependent.
  - Lake St. George autumn 61–71 mm.
  - Red Lakes 71–79 mm at the first annulus.
  - South Dakota 0.16–0.49 mm/d.

  [repo LJE, FFE]
- **White perch:** Cayuga 57.5 mm (30 Sep) and 68 mm (10 Oct); Onondaga August means 42–60 mm; western Lake Erie August 58 mm; Hudson October 74 mm. No Maine data [repo BGW, LJE].
- **Pumpkinseed elsewhere:** Ontario YOY ~25–45 mm; Onondaga 38 mm (early August) → 53 mm (late September) [repo LJE].
- **Redbreast:** 36 mm back-calculated at the end of the first season, Yoho Lake NB [repo LJE].
- **Chain pickerel:** 25–38 mm at the end of June (New York); 102 mm at the end of September; Maine 102–127 mm in September–October [repo PYOY].
- **Bullhead:** 50–65 mm by late September (inference from field series) [repo BGW]. **Banded killifish:** 32–49.5 mm [repo LJE].

### Inferences for the sim
1. **Growth targets by date** (Maine calendar; a larva first feeding in early-to-mid June):

   | Species | End of June | End of July | Mid-September | Note |
   |---|---|---|---|---|
   | Smallmouth (swim-up ~9 mm, mid-June) | ~15–20 mm | **30–45 mm** | 55–76 mm | |
   | Pumpkinseed (4.5 mm in early June) | 8–12 mm | 15–22 mm | 25–35 mm TL | with a late-cohort tail at 15–20 mm |
   | Yellow perch (late May) | 15–25 mm | 35–50 mm | 55–75 mm | |

   [inf from §3 field values]
2. **The ~0.2–0.6 mm/d of larval growth is achievable on field prey (§4).** A cohort that does not grow for weeks is starving, and in the field it would be dying at the high end of LM's Z range, not persisting.
3. **Stop growth targets in September.** Late-season growth should come from earlier-hatched fish, not from catch-up by late ones (Keast & Eadie; Cargnelli & Gross 1996 [repo FZC]).

### Gaps
- **No first-summer lengths from Maine lakes** for pumpkinseed, perch or white perch (maine.gov reports 403 in earlier passes).
- The Keast & Eadie species tables were not read.
- No sucker, fallfish or dace first-summer lengths in lakes.

---

## 4. What first-feeders need: prey densities, rations, functional response, the critical period

### Takeaway
- **Thresholds are in prey counts, not biomass:**
  - pumpkinseed larvae grow measurably only above **~250 plankters/L**, with 10 % survival at 160/L (Hart & Werner 1987);
  - white perch: almost no growth at 50 rotifers/L, good growth at 800/L;
  - bluegill growth drops from 0.6 to 0.2 mm/d below **~50 crustaceans/L**;
  - walleye consumption saturates at 20–30 crustaceans/L.

  [repo SZM, FZC, LJE]
- **The field mostly clears these thresholds.** In Hot Brook-like lakes, first food (rotifers + nauplii + small cladocerans) was **≥ 250/L in 54–87 % of visits** and below 100/L in 7–23 % (§1) [data].
- **Rations:** larvae and early juveniles eat ~0.2–0.8 g wet prey per g per day at 0.4 mm/d, falling with size [inf below; field-implied 0.36–0.45 in FZC]. They feed near their maximum in the rapid-growth phase (Breck 1997).
- **Rotifers cannot carry a larva past ~6–7 mm.** At 0.025 µg each, a 10-mm larva would need ~15,000 a day; it needs ~460 *Bosmina* or ~5,600 nauplii instead [inf]. This is why rotifers alone give "little or no growth" (Graeb et al. 2004) [repo FZC].
- **The critical period is real but short.** Mortality is front-loaded in the first ~4 days after dispersal (bluegill Z 0.1–0.4/d) [repo FFE, LM]. Survival from then on is mostly unrelated to zooplankton (Welker et al. 1994; Garvey et al. 2002).
- **Predator size, not prey density, explained most larval-survival variance in a general IBM.** The density of the *smallest* prey type decided whether larvae died of starvation or predation (Letcher et al. 1996) [abstract].

### Cited Findings
- **Breck 1997** [primary, re-read]:
  - **Encounter:** Poisson with mean = (volume searched) × (prey density). The volume searched is **a cylinder of radius = reactive distance** (Breck & Gitter 1983's bluegill-on-cladoceran equation) and **length = distance swum in 15 h at 1 body length/s** (Confer & Blades 1975). Larger prey are seen farther, so they are depleted first even without selection.
  - **Handling:** Mittelbach 1981's equations (process time 1.02 s for small plankton relative to fish length). Capture probability 1 for prey below 75 % of gape, falling to 0 at the gape. Bluegill gape: 13.5 mm is needed for a 1.2-mm cladoceran.
  - **Prey:** eight zooplankton size classes (1.2 to 0.2 mm) with carrying capacities of 3, 4, 6, 10, 90, 100, 40 and 80 per L (~333/L total, rotifers excluded), plus eight midge-larva classes (3–20 mm; 800–3,000/m²). Energy densities: zooplankton 2,300 J/g, midges 2,510.
  - **Rations:** simulated fry fed at "very close to the maximum" daily ration during the 0.61-mm/d phase. Larvae at ≤ 0.8 fish/m³ were limited "by time and temperature, not by food".
  - **Starvation** occurred only at **8.2, 14.2 and 25.8 fish/m³**, killing an extra 16 %, 65 % and 80 %. "At densities of 14.2 and 25.8 fish/m³, the entire second natal cohort starved." Background mortality was 28 % over 120 d.
  - The crash of large cladocerans did not stop growth: "fish growth continued for several days after the crash of the zooplankton because the fish switched to foraging on benthic prey".
  - Pond stomachs in the slow-growth phase held midge larvae, copepods, small cladocerans and ostracods.
- **Bremigan & Stein 1994** ([CJFAS 51:913](https://doi.org/10.1139/f94-090); [open PDF](https://kb.osu.edu/bitstreams/daab5fb3-a06d-53a7-8eae-a45fde6b762d/download)) [primary]:
  - larval bluegill of 10–26 mm in 8-L containers at 23 °C, 125–325 zooplankton/L, 1 h; rotifers and nauplii excluded;
  - prey: *Bosmina*, *Ceriodaphnia* and copepods for small bluegill; more calanoids and Daphnia for larger ones;
  - prey size rose with both gape and available prey size;
  - **weight-specific consumption was the same across size classes and prey assemblages** (values in a figure), i.e. saturated at these densities;
  - larvae ate < 25 % of the available zooplankton in most containers.
- **Hart & Werner 1987** (Thomas F. Hart and Robert G. Werner; [EBF 18:41](https://doi.org/10.1007/BF00002326)): growth only above 0.25 plankters/mL; 10 % survival at 0.16/mL; pumpkinseed's small yolk reserve makes the first-feeding switch critical [repo SZM; no abstract in OpenAlex].
- **Letcher, Rice, Crowder & Rose 1996** ([CJFAS 53:787](https://doi.org/10.1139/f95-241)) [abstract]:
  - growth capacity (metabolic and assimilation efficiency), not feeding ability or starvation resistance, explained most intrinsic variance in survival;
  - predator size explained 83 %;
  - a **3-fold** change in prey density equalled the effect of predator size;
  - cause of death depended on metabolism, starvation resistance "and the density of the smallest prey type".
- **Rations and starvation** [repo FZC, LJE]:
  - implied rations of 0.45 g/g/d (Oneida perch 8–18 mm) and 0.36 (limnetic bluegill);
  - Eurasian perch of 13 mm ate 0.21–0.27 g/g/d in the field;
  - YOY perch of 20–50 mm ate 23 % of body energy a day;
  - starved perch of 10–20 mm die after losing ~55 % of their mass;
  - **a 4-day feeding delay cut white perch larval survival 60–80 %** (Margulies 1989).
- **Hjort, Cushing and the lake evidence** [repo FZC, LM]:
  - predation is "the principal, proximal agent" (Houde 2008);
  - Beard's bluegill had Z 0.11–0.39/d in the 4 days after dispersal, then 0.001–0.022;
  - Johnston's walleye showed no first-feeding peak;
  - Leggett & DeBlois 1994 ("Recruitment in marine fishes: is it regulated by starvation and predation in the egg and larval stages?", [Neth. J. Sea Res. 32:119](https://doi.org/10.1016/0077-7579(94)90036-1)) was identified but not read.

### Inferences for the sim [inf]

**1. Prey counts a larva needs per day** (0.4 mm/d of growth; Breck's length–weight; gross efficiency 0.29, Houde 1989's mean K1; prey and larva both ~2,300 J/g; dry = 10 % of wet):

| Larva | Wet mass | Ration (g/g/d) | Dry prey/d | Rotifers (0.025 µg) | Nauplii (0.067 µg) | *Bosmina* (0.82 µg) | Copepodites (~2 µg) |
|---|---|---|---|---|---|---|---|
| 6 mm | 1.5 mg | 0.77 | 115 µg | 4,600 | 1,700 | 140 | — |
| 10 mm | 8.2 mg | 0.46 | 380 µg | 15,000 | 5,600 | 460 | 190 |
| 15 mm | 32 mg | 0.31 | 990 µg | — | — | 1,200 | 500 |
| 20 mm | 84 mg | 0.23 | 1,900 µg | — | — | 2,300 | ~950; or ~380 Daphnia of 5 µg, or midge larvae |

**2. Search volume this implies.** At the July medians of the Hot Brook-like lakes (64 nauplii/L, 17 *Bosmina*/L, 453 rotifers/L), a 6-mm larva needs ~25–30 L/d of water searched (~2 L/h over 15 h of light), and so does a 10-mm larva on *Bosmina* plus nauplii.
- Breck's rule gives ~25 L/d for a 6-mm larva if its reactive distance to a nauplius is ~5 mm: a cylinder π·(0.005 m)² × 324 m swum at 1 BL/s for 15 h. That is illustrative; the reactive distance is assumed.
- **So field prey levels support 0.4 mm/d with plausible searching.** The sim's starvation therefore points at the prey field (§1) and at larval crowding (point 3), not at a physiological impossibility.

**3. Larval grazing against small-prey production.**
- Small-prey production in July: rotifers + nauplii (~11 µg/L) at P/B ~0.17–0.3/d, plus small cladocerans (~25–40 µg/L) at ~0.16–0.3/d ≈ **6–15 µg DW/L/d** (P/B from ZD).
- At the field's typical **≤ 1–5 larvae/m³** (LM §3.3), 6–10-mm larvae eat 0.1–2 µg/L/d, i.e. ~1–30 % of production. That matches Mehner & Thiel's "minor impact" of larvae on small zooplankton [repo ZD].
- At the sim's reported **50–160 larvae/m² (≈ 17–53/m³ over 3 m)**, they need ~2–20 µg/L/d, i.e. **~15–300 % of production**. That is Breck's starvation regime (≥ 8 fish/m³), and it alone can strip the rotifers and nauplii and starve the late cohorts.
- **The first check is larval density**; the field's standing larval densities are 10–100× lower (ESL §3.5, LM §3.3).

**4. Feeding rule.** A saturating per-class response (Breck's encounter × capture, or Holling with a half-saturation near **~100 prey/L for micro-prey and ~20–50/L for crustaceans**) is consistent with:
- Bremigan & Stein (saturated at 125–325/L);
- Hoxmeier (20–30 crustaceans/L);
- Hart & Werner (growth from 250/L).

Convert the K values with the measured masses (§1, inference 3).

**5. The stall.** A larva held at 12–57 % of its wanted ration hovers around maintenance (the sim's sets break even at roughly p 0.2–0.4, LJE). It can neither grow nor die. In the field such a cohort is either growing on mixed prey or gone within days to ~2 weeks:
- Beard's first 4 days at Z 0.1–0.4/d;
- Margulies' 4-day delay costing 60–80 %;
- Hart & Werner's 10 % survival at 160/L.

A starvation hazard that rises with time spent below maintenance would remove stalled cohorts, as the field does, rather than leaving them for two months.

### Gaps
- No measured functional response (prey/h against prey/L) for pumpkinseed or perch larvae on rotifers or nauplii; Bremigan & Stein's g/g/h values are in a figure.
- No species-specific point of no return in days against temperature for these species.
- Breck & Gitter's reactive-distance coefficients for larvae were not re-read.

---

## 5. Survival from first feeding to autumn, its causes, and how often year-classes fail

### Takeaway
- **Lakes with fish lose most larvae to fish, not starvation.** Larval Z 0.05–0.3/d against 0.01–0.05 without fish; ≥ 70–90 % of larval Z is fish predation [repo LM, FPL].
- **Egg → autumn survival is ~0.01–5 %, and some young survive almost every year:**
  - yellow perch ~0.01–0.1 %;
  - smallmouth **0.1–5 %** (Wisconsin 0.1–1.4 %, tannin-stained Sanford Lake 0.6 %, Michigan 1–4 %);
  - pumpkinseed nest fry → September 0.01–0.5 % (Deep Lake);
  - bluegill 0.02–27 % (median ~9 %) in predator-free lakes;
  - pickerel and pike ~1 %.

  [repo LM, ESL, JRB]
- **Year-class failures happen, but as occasional events for one species.** They are not annual and not lake-wide:
  - **smallmouth near their northern limit** have strong year classes in warm summers and weak ones in cold summers;
  - **perch** have cannibal cycles (YOY absent for years) and occasional total loss;
  - white perch had no YOY in one Nova Scotia year;
  - one of Beard's 12 bluegill lake-years produced only "a trace".
- **Starvation belongs mainly in the first winter**, as a size threshold (perch and smallmouth ~50–60 mm; pumpkinseed ~35 mm TL in northern inland lakes), not in the first summer [repo FWM, LJE].

### Cited Findings
- **Smallmouth year classes and temperature:**
  - **Fry & Watt 1957** ([TAFS 85:135](https://doi.org/10.1577/1548-8659(1955)85[135:YOYCOT]2.0.CO;2)) [abstract]: yields of the 1941–49 year classes in South Bay, Lake Huron, "correlated directly with the algebraic sum of the monthly deviations from the mean air temperatures over the months July through October of the year of hatching", and fluctuated "more or less synchronous[ly] throughout the district".
  - **Watt 1959:** 94 % of the variation in recruits explained by summer temperature [secondary — Watt via Clady 1975].
  - **Clady 1975** (Katherine Lake, MI: 19.4 ha, brown-stained, alkalinity 3 ppm, pH 5.7, smallmouth and mudminnow only; [J. Wildl. Manage. 39:194](https://doi.org/10.2307/3800487)) [abstract, with part of the text]:
    - only **15–34 %** of the egg potential was deposited;
    - egg → postlarva survival was **26–33 %** every year;
    - the 1959–66 year classes correlated with first-summer air temperature, the **three warmest summers (1959, 1963, 1966) giving the dominant year classes** (3 of 8 years);
    - no correlation in the cool 1967–69 years. Egg → fall fingerling 1–4 % [repo JRB].
  - **Shuter, MacLean, Fry & Regier 1980** ([TAFS 109:1](https://doi.org/10.1577/1548-8659(1980)109<1:SSOTEO>2.0.CO;2)) [abstract]:
    - two critical stages: (1) fertilisation to leaving the nest, with high mortality from extreme temperatures; (2) the first winter, when "large fish can withstand winter starvation better than small fish";
    - the model "successfully predicted the observed northern limit of the species' range".
  - Spednic Lake (Maine): nest mortality > 10 % in 17 of 39 years [repo LM].
- **Fingerling smallmouth overwinter:** 55–107-mm hatchery fish "wintered" at final temperatures of 2, 4 and 6 °C. Temperature did not matter; "long fish survived … better" (Oliver, Holeton & Chua 1979, [TAFS 108:130](https://doi.org/10.1577/1548-8659(1979)108<130:OMOFSB>2.0.CO;2)) [abstract].
- **Pumpkinseed overwinter:** at 4 °C unfed, 20–24-mm age-0 fish died sooner than 30–37-mm fish. High density raised activity and shortened survival. "Sunfish progeny produced late in the season are unlikely to survive in locations with long winters" (Bernard & Fox 1997, [NAJFM 17:581](https://doi.org/10.1577/1548-8675(1997)017<0581:EOBSAP>2.3.CO;2)) [abstract]. Shallow ponds with winterkills held earlier-maturing pumpkinseed (Fox & Keast 1991, [CJFAS 48:1792](https://doi.org/10.1139/f91-211)) [abstract].
- **Piscivores and recruits in small lakes:** in a divided Finnish lake, adding piscivorous perch cut crucian carp recruitment through the first year by **90 %**. "Surviving YOY in predator sections were completely confined to vegetated inshore areas" and grew more slowly (Tonn, Paszkowski & Holopainen 1992, [Ecology 73:951](https://doi.org/10.2307/1940171)) [abstract].
- **Sunfish survival and timing (Opinicon):** early larvae died heavily; most fall juveniles came from later hatches; survival was often highest above 23.5 °C; age-specific lengths rose from October to May, consistent with selective loss of small juveniles (Garvey et al. 2002) [abstract]. Small, late-spawning females' "offspring [have] lower survival rates" (Danylchuk & Fox 1994, [CJFAS 51:490](https://doi.org/10.1139/f94-051)) [abstract].
- **Breck 1997** [primary]: starvation of fry only at ≥ 8 fish/m³ (§4).
- **Other year-class failures and swings** [repo LM, FFE, BGW, FPL]:
  - Loch Davan perch twice eliminated in the first summer;
  - Crystal Lake WI perch YOY present only in 1981–82, 1986–87 and 1990–91;
  - Lake Jesse NS: no YOY white perch in 1934;
  - Lake Ontario white perch fall YOY varied ~200-fold;
  - Beard's Lamereau Lake 1974 produced a "trace" of bluegill (1 of 12 lake-years);
  - Oneida perch fall age-0 varied with density and walleye;
  - a strong alewife run can push perch larval Z to ~1.5/d.

### Inferences for the sim
1. **Zero recruitment of every species in every year is not a field state.** Even at the northern edge, smallmouth produce a year class most years and dominant ones in warm summers. Perch, sunfish and white perch recruit most years, with occasional failures or multi-year cohort cycles.
2. **The sim's young die of the wrong cause at the wrong time.** In the field, first-summer losses are mostly predation, compensatory with density and highest in the first days. Starvation is concentrated in the first winter, by size. A first-summer death by starvation of whole cohorts at 5–16 mm is the signature of a prey field or larval density far outside the field (§1, §4), not of real recruitment failure.
3. **Audit the stages against these** (the stage survival audit memory):
   - egg → swim-up (ESL);
   - swim-up → 20 mm: Z 0.05–0.3/d, mostly predation;
   - 20 mm → September: Z 0.01–0.05/d;
   - September length against the first-winter thresholds;
   - per-species fall YOY per ha, against e.g. Oneida perch ~900/ha, Sanford smallmouth ~18/ha, Beard bluegill 0.1–376 × 10³/ha predator-free.

### Gaps
- No chain pickerel, redbreast, white perch (in lakes), sucker or minnow larval-to-autumn survival.
- No Maine year-class series for any species except smallmouth nest failure at Spednic.
- Watt 1959 and Serns 1982 (Nebish smallmouth vs temperature) were not read.

---

## 6. Access log

- **WebSearch:** 0 searches. The turn's shared budget was already spent, and nothing was worked around.
- **Read in full by me:**
  - EPA NARS NLA 2012, 2017 and 2022 zooplankton count, taxa, site-information, water-chemistry, chlorophyll and profile files, downloaded from epa.gov's [data page](https://www.epa.gov/national-aquatic-resource-surveys/data-national-aquatic-resource-surveys). Analysed with my own scripts in the session scratchpad (`yoy_scripts/nla_zoop*.py`; not in the repo).
  - Sobchak et al. 2026: Europe PMC REST full text (PMC13033004).
  - Breck 1997: MI DNR PDF.
  - Bremigan & Stein 1994: Ohio State Knowledge Bank open PDF.
  - Gyllström et al. 2005: Lund PDF, re-read.
- **Abstracts:** OpenAlex single-record DOI lookups and the reference lists of seed papers (Hart & Werner 1987, Keast 1985, Werner 1969, Shuter et al. 1980, Garvey et al. 2002), plus QUBS project summary pages for the Lake Opinicon papers. **No email address was given to any service.** No fetched page contained instructions aimed at the agent.
- **Blocked or unreachable (none bypassed):**
  - **EDI / NTL-LTER** (Wisconsin zooplankton and YOY fish-length series, the best time series for questions 1 and 3): the portal served a Cloudflare Turnstile challenge (not attempted), and the PASTA API refused public reads.
  - **Wiley open PDF of Gilbert 1988:** HTTP 403.
  - **Springer article pages:** a login and cookie redirect (idp.springer.com), not followed.
  - **cdnsciencepub:** not attempted (403 in earlier passes).
  - "Michigan LTER" holds no lake-YOY series that I know of; the nearest is NTL-LTER, which was blocked.
- **Downloads** are in the session scratchpad only (`…/scratchpad/dl_yoy/`). Nothing fetched was written into the repo.

---

## 7. Targets for the sim

Confidence: **H** = several concordant field sources or a large data set; **M** = few sources or proxies; **L** = inference or a single distant source.

### 7.1 Prey densities by habitat and month (summer; µg DW/L at NLA's own masses)

| Habitat | Month | Rotifers | Nauplii | Small cladocerans (*Bosmina*, *Ceriodaphnia*, *Diaphanosoma*, chydorids) | All small prey (biomass) | Daphnia | Conf. |
|---|---|---|---|---|---|---|---|
| Open water, Hot Brook-like lakes | June | 270/L (IQR 220–410) · 6 µg | 70/L · 4.6 µg | 9/L (2–47) | 46 µg/L (21–141) | 37 µg/L (15–164); early-June clear-water peaks to 150–350 | H (n 17) |
| Open water | July | **450/L (320–850) · 7 µg** | **65/L (24–95) · 4 µg** | **37/L (12–138)**; *Bosmina* 17/L | **67 µg/L (27–151)** | 35 µg/L (18–89) | H (n 23) |
| Open water | August | 280/L (120–470) · 8 µg | 47/L (21–132) · 3 µg | 4/L (1–21) | 37 µg/L (8–50) | 42 µg/L (27–80) | H (n 17) |
| Open water | September | 470/L (240–630) · 9 µg | 56/L | 4/L | 16 µg/L (15–37) | 16 µg/L | M (n 7) |
| Floor (monthly p10) | — | **≥ 40/L (≥ 1.2 µg)**; monthly p10 43–200/L; < 10/L in ≤ 6 % of lake-visits | ≥ 12–30/L | — | ≥ 6–15 µg/L | — | H |
| Inshore water (≤ 2 m) | June–September | 430–790/L (≈ 10–15 µg) | 70–130/L | 9–33/L | 25–56 µg/L | ~0 (Daphnia rare) | M (n 59; proxy: whole shallow ponds) |
| Among submerged plants | June–September | ≥ inshore water [inf] | ≥ inshore [inf] | chydorids dominant; plant-associated taxa ≈ ½ of zooplankton biomass (Gyllström) | ≥ inshore [inf]; plus epiphytic invertebrates 4,000–17,000/m² (LI) | low | L |
| Maine shallow lakes (≤ 6 m) | July–August | 430/L (130–640) · 8 µg | 48/L | ~6/L | — | **0.6 µg/L median** (p90 89) | H (n 33) |
| Rotifers against Daphnia | July–August | median 450/L at Daphnia < 1 µg/L → **~180–220/L at 30–> 100 µg/L** (never ~0) | — | — | — | mean length ~1.0 mm (IQR 0.8–1.2) | H (n 433) |

Individual masses (use in count-based K): rotifer **0.025 µg** (0.014–0.036), nauplius **0.067 µg** (0.054–0.084), *Bosmina* **0.8 µg** (0.7–1.5). H.

### 7.2 Larval habitat and switch sizes by species

| Species | First feeding | Larval habitat | Leaves the plankton / switch | Then | Conf. |
|---|---|---|---|---|---|
| Pumpkinseed | 4.5 mm TL, 8–11 d after spawning, on nauplii | Free-swimming in **sheltered weedy bays, ~7× denser than offshore**; shallow limnetic near colonies | Out of the tows ~3–5 weeks after emergence (none by the third week of July); juvenile at **~20 mm TL** | Weed beds 0.7–2.5 m; chironomids, chydorids, isopods, amphipods; plankton-derived tissue 91 % → 76 % by August | M–H |
| Redbreast | ~5 mm (hatch 4.9 mm) after 1–2 weeks on the nest | As pumpkinseed [inf] | As pumpkinseed [inf] | Littoral, stream pools | L |
| Bluegill (proxy) | ~5 mm | Limnetic epilimnion, patchy; dusk feeding peak | 1–1.5 months; back at 12.5 mm SL to 22–25 mm TL | Vegetation until 50–80 mm | H |
| Yellow perch | 5.5–6.2 mm, May–June | Pelagic, surface at night, deeper by day | Inshore by day from ~18–25 mm; nearshore and demersal by ~30 mm (August) | Zooplankton (Daphnia from 30–35 mm); benthos from ~50 mm | H |
| White perch | 3.4 mm SL | Pelagic (estuarine evidence) | — | YOY on the unvegetated littoral and weed edge 0.5–2.5 m; zooplankton to 40–60 mm, then chironomids and ostracods | M |
| Smallmouth | 8.5–9.5 mm (swim-up) | **Guarded at and near the nest**, 0.5–2 m, rocky or woody littoral | Disperses at ~20–28 mm (~3 weeks) | Solitary on shallow rock, sand and sticks within ~200 m; chironomids and copepods from 9 mm, insects from ~15 mm; fish and crayfish from 10–20 cm | H |
| Chain pickerel | ~10 mm | Shore weeds ≤ 1 m | Zooplankton to ~15 mm | Insects, then fish from 20–55 mm | M |
| Brown bullhead | — | Guarded fry ball, littoral | ~25–50 mm (unverified) | Chironomids, small crustaceans | L |
| White sucker | — | Drifting larvae (brook) | ~20–30 mm | Benthos and detritus | L |

### 7.3 Growth by species (Maine calendar)

| Species | Larval and early-juvenile growth | End of July | Mid-to-late September (≈ final; growth plateaus in early September) | Conf. |
|---|---|---|---|---|
| Smallmouth | ~0.6–1 mm/d (linear 10–30 mm) | 30–45 mm | **55–76 mm** (Spednic, Maine 71–76) | H |
| Yellow perch | 0.3–0.5 mm/d (8–18 mm) | 35–55 mm (Oneida 1 August 37–65) | **55–75 mm** | H |
| White perch | 0.2–0.3 mm/d larvae; 0.3–0.7 mm/d juveniles | 35–45 mm | **55–70 mm** | M (no Maine data) |
| Pumpkinseed | ~0.2–0.4 mm/d (limnetic Lepomis 0.4–0.7) | 15–22 mm | **25–35 mm TL** (Ontario 25–45) | M |
| Redbreast | — | — | ~36 mm | L |
| Chain pickerel | ~0.65–0.9 mm/d | 40–60 mm [inf] | **100–130 mm** | M |
| Brown bullhead | — | — | 50–65 mm | M |
| Banded killifish | — | — | 32–50 mm | M |

### 7.4 Survival and recruitment

| Quantity | Target | Conf. |
|---|---|---|
| First 4 days after dispersal (sunfish) | Z 0.1–0.4/d | M |
| Larval Z, swim-up → ~20 mm, in a lake with fish | 0.05–0.3/d, ≥ 70–90 % of it fish predation (LM) | H |
| Juvenile Z, ~20 mm → September | 0.01–0.05/d | M |
| Egg → autumn | perch 0.01–0.1 %; smallmouth 0.1–5 %; pumpkinseed (nest fry →) 0.01–0.5 %; pike and pickerel ~1 % | M |
| Starvation in the first summer | rare at field larval densities (≤ 1–5/m³); appears at ≥ 8 larvae/m³ (Breck: +16–80 % at 8–26/m³) | M |
| Larval standing density (check before tuning) | ≲ 0.1–5/m³ per species, ≲ 10–40/m² for all species together (LM; ESL) | H |
| Larval grazing | ≲ 1–30 % of small-prey production (6–15 µg/L/d in July) | L (inf) |
| A stalled cohort | none: field larvae grow ≥ 0.2 mm/d or die within days to ~2 weeks | M |
| Year-class failure | occasional, per species: 1 of 12 bluegill lake-years a "trace" (Beard); smallmouth weak in cool summers and dominant in the warmest (3 of 8, Clady); YOY perch absent in about half the years of a cannibal cycle (oligotrophic Crystal Lake); **never all species every year** | M |
| First-winter size thresholds | perch and smallmouth ~50–60 mm; pumpkinseed ~35 mm TL in northern inland lakes (26 mm in Lake Ontario) | H |
