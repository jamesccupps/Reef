# Young white perch: growth, diet, survival and the zooplankton they need (Hot Brook calibration)

Compiled 2026-10-22 for the Hot Brook lakes (Upper and Lower Hot Brook Lake, eastern Maine; 2.5–5.5 m deep, unstratified, clear-to-tea-coloured softwater, oligo-mesotrophic; white perch, yellow perch, pumpkinseed, smallmouth bass, chain pickerel, white sucker, brown bullhead; sea-run alewife).

**The sim problem.**
- Young-of-year (YOY) white perch hatch by the hundreds of millions.
- They then stall at 13–15 mm from July to October, and none recruit.
- Past ~10 mm the model feeds them only on crustacean zooplankton, through a Holling II response with a half-saturation K of **60 µg dry weight (DW)/L**.
- The model's summer crustaceans run **~30–40 µg DW/L**.

**Tags** (on every number):
- **[full text]**: the paper, report or data table was read;
- **[abstract]**: abstract or publisher summary only;
- **[review]**: the number as quoted in a secondary source (both named);
- **[inf]**: my inference or arithmetic, shown. My own analyses of public datasets (EPA NLA, EMAP) are **[inf, data]**, with the method in §8.

Lengths are total length (TL) unless marked. 1 µg DW/L = 1 mg DW/m³. Quotes are under 15 words.

**Companion notes (not repeated; codes used below):**

| Code | Note | What it already holds |
|---|---|---|
| BGW | `bullhead_growth_and_young_white_perch.md` Q2 | YOY white perch end-of-season targets for Maine (late Sept 50–65 mm), Onondaga, Cayuga, Oneida diets, Johnson & Evans first-winter thresholds |
| YFS | `young_first_summer.md` §3–4, §7 | NLA first-food analysis (rotifers, nauplii, small cladocerans, *Daphnia*) for Hot Brook-like lakes; growth targets for other species |
| LJE | `larval_juvenile_energetics_panfish.md` | FB4 larval and juvenile sets; maintenance ration p ≈ 0.25–0.35 for the perch juvenile set |
| LSV | `larval_starvation_and_variability.md` | Margulies 1989 in full; Limburg et al. 1999 growth CVs; starvation timing |
| LM | `larval_mortality.md` | Larval Z by species; Hudson white perch cohort Z |
| FZC | `fish_zooplankton_coupling.md` | Breck 1997, Mills & Forney 1981, Post 1990, Letcher 1996 |
| ZD | `zooplankton_dynamics.md` | Length–weight equations, P/B |
| LI | `../Whole lake 3D fish simulation/littoral_invertebrates.md` | Epiphytic and littoral invertebrate densities |
| IPP | `../Hot Brook populations and water/invertebrates_plankton_plants.md` §4 | LakePulse crustacean biomass near Hot Brook |
| FWM | `first_winter_mortality.md` | First-winter size thresholds |

**Method.** Three parallel literature passes (white perch; yellow perch and prey thresholds; zooplankton, masses and benthos), then my own spot-checks of the load-bearing numbers against the downloaded texts:
- Hoxmeier et al. 2004;
- Pothoven & Höök 2015, Table 2;
- the Hudson River 1976 year-class report (Texas Instruments 1979);
- Johnston & Mathias 1996 (abstract);
- the NLA analysis output.

---

## Answers

**1. Young white perch in lakes**

*Growth.* Field young pass 13–15 mm about 3–5 weeks after hatching, and never stall there.

| Date | Length | Source |
|---|---|---|
| Early to mid July | **21–25 mm** | Hudson weekly seine means |
| 1 August | **39 mm** (32–48, 11 years) | Hudson |
| Late August | **53–67 mm** | Hudson |
| August | **52–71 mm** | Saginaw Bay, Lake Huron |
| August, long-term mean | **57.5 mm** (58–70 in recent years) | western Lake Erie |
| September | 70–95 mm | Saginaw Bay |
| 30 September / 10 October | 57.5 / 68 mm | Cayuga Lake (repo) |
| October–November | 85–102 mm | Saginaw Bay |
| December | 67–77 mm | Hudson |

Sources: Texas Instruments 1979, Hudson *1976 Year-Class Report* [full text]; Pothoven & Höök 2015, *Aquat. Invasions* 10:347 [full text]; Lake Erie Forage Task Group 2009–2023 [full text].

- **Growth rates:**
  - larvae 0.15–0.33 mm/d (Hudson otoliths; Limburg et al. 1999, *Fish. Bull.* 97:80 [full text]);
  - median ~0.5–0.6 mm/d by 20–45 days old (Patuxent; Kraus & Secor 2004, *MEPS* 279:247 [full text]);
  - juveniles of 21–67 mm **0.67–0.80 mm/d** in July–August (Hudson [inf from full text]);
  - little growth after mid-September.
- **Hot Brook targets** (later hatch, cooler) [inf]:
  - ~15–25 mm by mid-July;
  - **25–40 mm on 1 August**;
  - 40–55 mm on 1 September;
  - **50–65 mm in late September** (BGW).

*Diet sequence.* Copepods and *Bosmina* carry the fish from ~5 mm. Benthos enters at **~20–25 mm** and dominates at **~40–50 mm**.
- **First feeding at 3.4–3.8 mm:** rotifers, nauplii and small copepodites.
- **From ~5 mm:** copepodites, adult copepods and *Bosmina*. In the Hudson, *Bosmina* plus copepods were ~91 % of the diet below 10 mm, and rotifers were neither selected nor important (Limburg et al. 1997, *TAFS* 126:607 [abstract]; Campfield & Houde 2011, *Fish. Bull.* 109:1 [full text]).
- **Above ~10 mm:** *Bosmina*, calanoids, and *Daphnia* where present.
- **At ~20–25 mm (~45 d after hatch):** they settle on the shallow shore (≤ 2 m) and add epibenthic prey: harpacticoids, chydorids, ostracods and chironomids (Kraus & Secor 2004 [full text]; TI 1979 [full text]).
- **At ~40–50 mm:** the main switch to chironomids and amphipods (Oneida; Prout et al. 1990 via Harris 2006 [review]; St-Hilaire et al. 2002 [abstract]).
  - The switch comes earlier and goes further where *Daphnia* is scarce: benthos was **46–98 % of dry-weight diet** at Saginaw Bay sites in 2009 (Pothoven & Höök 2015 [full text]).
  - Lake Erie: the switch date is set by "zooplankton abundance and fish size" (Gopalan et al. 1998, *CJFAS* 55:2572 [abstract]).

*Survival and mortality.*
- **Larval Z:** **0.03–0.3 /d**.
  - Hudson 6-day cohorts 0.04–0.79, median ~0.27 (Limburg et al. 1999 [full text]).
  - Patuxent 0.03–0.08 (Kerr 2008 [review via LJE]).
- **Juvenile Z:** **~0.003–0.006 /d**.
  - Hudson white perch from the end of the juvenile stage through the yearling year: 0.4–0.6 %/d.
  - Hudson striped bass juveniles: 0.3 %/d (TI 1979 [full text]).
- **Larvae and juveniles together:** Hudson 1976 averaged 3.6 %/d from the late-June larval peak to 1 December (TI 1979 [full text]; standing-crop based, so biased high).
- **Survival from peak feeding larvae:**
  - to September **~10 %**: 2.08 billion → 209 million by mark–recapture [inf from full text];
  - to December ~0.2 % by standing crop.
- **No lake measurement** of white perch larval or juvenile Z exists in any source reached.

*What limits year-class strength.* Strength is set **early, by July–August** (TI 1979 [full text]). In order of evidence:
1. **Cold snaps of ~10–12 °C** at spawning or first feeding.
   - Hudson 1976 and Patuxent 2004.
   - MDIFW: Maine failures come from "unfavorable weather at spawning time" (MDIFW 2002 [full text]).
2. **First-feeding food.** Good growth at 800 rotifers/L, failure at 50/L, ≈ 20 vs 1.25 µg DW/L (Margulies 1989, *Fish. Bull.* 87:63 [full text]).
3. **Larval density plus predator biomass** (Oneida, 1968–2011; VanDeValk et al. 2016, *TAFS* 145:416 [abstract]). Dense cohorts grew and survived worse, but "mortality did not compensate".
4. **Size by autumn.**
   - Degree-days > 15 °C (Lake Ontario, r 0.69; O'Gorman & Burnett 2001, *JGLR* 27:367 [abstract]).
   - Late-summer *Daphnia* (Oneida, rₛ 0.58; Prout, Mills & Forney 1990, *TAFS* 119:966 [abstract]).
5. **The first winter, by size** (Johnson & Evans 1990, 1991 [abstract]; FWM).

Year-class strength swings **100–200-fold**.

**2. Young yellow perch in northern lakes**

| Date | Length | Source |
|---|---|---|
| End of June | ~15–20 mm (14–25) | — |
| ~24 July | **~35–41 mm** | Lake Opeongo, Ontario (Arts & Sprules 1989, *Oecologia* 81:21 [full text; length inf from mass]) |
| 1 August | **53 mm** (37–65) | Oneida (repo FZC) |
| Mid-October | **77 mm** (56–91) | Oneida, 49 years (Cornell BFS/NYSDEC Oneida report, Table A10 [full text]) |

- **Growth rates:**
  - larvae 0.48 mm/d;
  - July juveniles ~0.7–0.8 mm/d [inf];
  - August–October ~0.3 mm/d [inf].
- **Switch to benthos:**
  - **none below 30 mm**, and above 50 mm when zooplankton is low (Lake Erie; Wu & Culver 1992, *CJFAS* 49:1932 [abstract]);
  - in the lab, zooplankton is preferred at 20 mm and benthos at 40 and 60 mm (Graeb et al. 2006, *TAFS* 135:1493 [abstract]);
  - wholly nearshore by ~30 mm (Post & McQueen 1988, *CJFAS* 45:1820 [abstract]).
- **Zooplankton thresholds for growth:**
  - No per-litre threshold was found.
  - At Oneida, weight tracked *Daphnia* biomass only after ~1,350 °C·d (Mills, Sherman & Robson 1989, *CJFAS* 46:880 [abstract]).
  - Oneida's October YOY length is **uncorrelated with seasonal zooplankton biomass of 97–315 µg DW/L** across 49 years (r = 0.05) [inf from full text].
  - Crystal Lake, Wisconsin: successful year-classes fed at P = 0.48 of Cmax; failed years at ≤ 0.19–0.29 (Hrabik et al. 2001, *TAFS* 130:568 [full text]).

**3. The zooplankton density young fish need**

*Is 60 µg DW/L reasonable?* **It is the upper edge, not the centre.**
- **Best value for 15–30-mm juveniles: K ≈ 25 µg DW/L** (range 10–60), on mixed crustaceans in clear water [inf].
- **The bounds:**
  - **Maintenance densities** for percids above ~11–12 mm are **≤ 2–10 crustaceans/L, ≈ ≤ 3–15 µg DW/L**.
    - Walleye: Johnston & Mathias 1996, *TAFS* 125:211 [abstract]; 5/L in Hoxmeier et al. 2004.
    - Pikeperch: Ljunggren 2002, *J. Fish Biol.* 60:405 [abstract].
    - With the sim's maintenance at p ≈ 0.25–0.35 (LJE), K = N_maint·(1−p)/p ≤ **~10–35 µg/L** [inf].
  - **Gut fullness** of 10–25-mm walleye saturated at **20–30 crustaceans/L** (half-saturation ≈ 4–7/L ≈ 5–9 µg DW/L) (Hoxmeier, Wahl, Hooe & Pierce 2004, *TAFS* 133:45 [full text; half-saturation inf]).
  - **Growth** falls from 0.6 to 0.2 mm/d below **~50 crustaceans/L** (Breck 1997, MI DNR FRR 1995 [full text]). That is ~40–60 µg/L, giving K ≈ 22–32 [inf].
  - **Mechanistic perch attack and handling sets** (Persson et al. 2004; Claessen et al. 2000 [full text]) give K ≈ **1–4 µg DW/L** [inf]: clear-water physics, a floor.
  - **Turbid, hungry-fish 1-h trials** (Wellington et al. 2010, *J. Fish Biol.* 76:1729 [full text; fit inf]) give ~100–150 µg/L: a ceiling.
- **First feeders below ~10–12 mm** need 50–100+ prey/L, so 60 to > 300 µg/L is right for them.
  - Walleye ≥ 50/L: Johnston & Mathias 1993 [abstract].
  - Striped bass 50–100/L, strong years > 250/L: Martino & Houde 2010, *MEPS* 409:213 [full text].
- **What K = 60 does in the sim.** At 30–40 µg/L it gives **p = 0.33–0.40, right at maintenance**: the 13–15-mm stall [inf].

*Individual dry masses (µg DW)* (NLA north-east medians [inf, data], and EPA SOP LG403 equations [full text]):

| Taxon | Mass (µg DW) |
|---|---|
| Nauplius | 0.065 |
| *Bosmina* | **0.65** (0.5–0.8) |
| *Ceriodaphnia* | 1.2 |
| *Diaphanosoma* | 0.9–1.2 |
| *Daphnia* at 0.5 / 1.0 / 1.5 mm | **0.7 / 5.0 / 15.7** (Dumont et al. 1975) |
| Cyclopoid copepodites | **~2.0–2.2** |
| Calanoid copepodites | **~2.2–2.4** |
| *Leptodiaptomus minutus* adult | **1.5–2.3** (also Campbell 1994, McMaster MSc [full text]) |
| *Mesocyclops edax* | ~8 |
| Community mean per crustacean | **~2.5** |

So **60 µg/L ≈ 24 crustaceans/L**, ≈ 27 copepodites/L, ≈ 92 *Bosmina*/L, or ≈ 12 *Daphnia* of 1 mm per litre [inf].

**4. Field summer crustaceans in New England and Maine softwater lakes** (June–September)

| Set | Crustaceans | Cladocerans | Copepods (copepodites + adults) | Nauplii |
|---|---|---|---|---|
| NLA 2012–22, NE + Northern Appalachians lakes ≤ 10 m deep, n 242 [inf, data] | **35/L (IQR 12–83); 110 µg/L (27–261)** | **16/L; 31 µg/L** (*Daphnia* median 0.4/L) | **12/L; 46 µg/L** | 57/L |
| NLA Maine, n 52 [inf, data] | **40/L; 147 µg/L (69–267)** | 14/L; 20 µg/L | **24/L; 75 µg/L** (calanoids 49) | — |
| EMAP 1991–94, 202-µm net, Maine, n 67 [inf, data] | 12/L; ≈ 31 µg/L [inf] | 3.1/L | 6.5/L | — |
| EMAP, Maine lakes < 100 ha [inf, data] | ≈ 47 µg/L [inf] | — | — | — |
| LakePulse, ≤ 250 km of Hot Brook (repo IPP; Paquette et al. 2021 data) | **52 µg/L (17–89)** | — | — | — |
| Mirror Lake NH, annual mean (Makarewicz & Likens 1979, *Ecol. Monogr.* 49:109 [full text; conversion inf]) | ≈ 60 µg/L | 19 | 41 | — |

- The sim's 30–40 µg/L sits at about the **25th–30th percentile** of NLA north-east visits and the **13th** of NLA Maine visits. It is just below the LakePulse and EMAP medians.
- It is low but possible. A central target is **~50–110 µg/L**, about **half or more of it copepods** [inf].

**5. The young's benthic food**

- **Chironomid larvae on soft sediment:** **~1,000–3,000/m²**.
  - Oneida Lake: 2,800–3,100/m² (Cornell/NYSDEC 2024, Table 2 [full text]).
  - Lake Winnebago: 2,714/m² and 2.75 g DW/m² (repo IPP [review]).
- **In weed beds:** up to ~9,400 chironomids/m² and 4.4 g DW/m² (repo LI).
- **Whole lakes:**
  - Mirror Lake NH zoobenthos totals 2.5 g DW/m², ~75 % of it macrofauna (Strayer 1985 [abstract]).
  - Benthic production 4.4 g DW/m²/yr, littoral 4.8–6.5 (Babler et al. 2008, *J-NABS* 27:108 [abstract]).
- ***Hyalella*:** **10,600–17,500/m²** at 0–1.5 m in late July–August (Lindeman & Momot 1983 [full text, thesis]).
- **When young fish use benthos:**
  - white perch from **~20–25 mm** (settlement), mainly from 40–50 mm;
  - yellow perch not below 30 mm, and above ~50 mm when zooplankton is scarce;
  - 10–25-mm walleye ate 57–99 % chironomids when crustaceans were 1–3/L, and still grew 0.72–0.85 mm/d (Hoxmeier et al. 2004 [full text]).
- **So a 13–15-mm white perch is still a plankton-eater in every source.** Benthos is the escape route from ~20 mm.

**What it means for the sim** (ranked [inf]):
1. **K.** Lower K for juveniles to ~25 µg DW/L. Keep a high K (≥ 60) for first feeders, falling to ~25 by ~12–15 mm.
   - At 30–40 µg/L this lifts p only to ~0.55–0.62, about 0.15–0.25 mm/d on the perch juvenile set.
   - Field growth needs p ≈ 0.75–0.95 (LJE), so it also takes crustaceans nearer the field centre (~75–100 µg/L, §8) or the benthic food of item 2.
2. **Benthic prey from ~20 mm.** Open epibenthic and benthic prey (chironomids, chydorids, harpacticoids, ostracods, amphipods) to white perch from ~20 mm, and to every percid when crustaceans fall below ~20/L.
3. **Larval density.**
   - Field peaks are ≥ ~72,000 feeding larvae/ha (Hudson, a minimum, since the gear was assumed 100 % efficient), i.e. ≈ 46 million in 637 ha.
   - Late summer holds ~2,900–7,200 young/ha (≈ 1.8–4.6 million).
   - Hundreds of millions of feeding larvae standing at once in Hot Brook would strip the plankton by themselves.
4. **Stalls must kill.** A cohort held near maintenance should starve within days to ~2 weeks, not persist for three months. Walleye of 11.9–14.6 mm lost weight and died fastest when deprived (Johnston & Mathias 1996 [abstract]).

---

## 1. Young white perch growth in the first summer

### 1.1 Length by date

| Water | Date | Mean length | Source | Tag |
|---|---|---|---|---|
| **Hudson River**, tidal fresh water (41.5° N), weekly beach-seine means | 1973 | 21.0 (1–14 Jul) → 31 → 43 → **53.0** (12–25 Aug) | Texas Instruments 1979, *1976 Year Class Report, Multiplant Impact Study, Hudson River Estuary*, App. Table B-24 ([NRC ML100250085](https://www.nrc.gov/docs/ML1002/ML100250085.pdf)) | [full text]; columns re-aligned and checked against the report's Table IV-39 slopes |
| Hudson | 1974 | 21.0 (7–13 Jul), 28, 32, 37, 43, 47, 55, **60.0** (25–31 Aug) | same | [full text] |
| Hudson | 1975 | 23.8 (29 Jun–5 Jul), 30.1, 35.0, 40.0, 45.2, 51.7, 57.1, 59.8, **67.0** (24–30 Aug) | same | [full text] |
| Hudson | 1976 | 24.6 (11–17 Jul), 33.8, 44.0, **52.5** (22–28 Aug) | same | [full text] |
| Hudson, predicted mean on **1 August** | 1965–76 (no 1971) | 47.8, 38.3, 31.8, 36.1, 46.6, 44.1, 34.5, 36.5, 35.6, 44.1, 34.6 → **31.8–47.8, mean 39.1** | TI 1979, Table IV-41 | [full text]; mean [inf] |
| Hudson, end of first year | Dec 1975 / Dec 1976 | **77 / 67 mm**. Slow growth in May–early June, fast from late June through July, slower in August, "little growth" from September | TI 1979, pp. IV-93–94 | [full text] |
| Hudson, Jul–Nov 1970 | length frequency | YOY mode **50–54 mm SL** (≈ 63–68 mm TL with SL = −1.05 + 0.81·TL) | Bath & O'Connor 1982, *Fish. Bull.* 80:599–610 ([PDF](https://spo.nmfs.noaa.gov/sites/default/files/pdf-content/1982/803/bath.pdf)) | [full text]; TL [inf] |
| **Saginaw Bay**, Lake Huron (shallow bay, 43.8° N), bottom trawl with 13-mm liner (small fish under-sampled) | 2009 | Jul **39**, Aug **52**, Sep **70**, Oct **85** (Nov 64, n = 8) | Pothoven & Höök 2015, *Aquat. Invasions* 10:347–357, Table 2, [doi 10.3391/ai.2015.10.3.10](https://doi.org/10.3391/ai.2015.10.3.10) | [full text]; checked by me |
| Saginaw Bay | 2010 | Jul **40**, Aug **71**, Sep **95**, Nov **102** (surface 26 → 25 → 17 → 6 °C) | same | [full text] |
| **Western Lake Erie**, interagency August trawl | August | long-term mean **57.5 mm** (1987–2008); 59.2 (2008); 58 (2018); **70** (2022) | Lake Erie Forage Task Group reports 2009, 2019, 2023 ([2023](https://www.glfc.org/pubs/lake_committees/erie/FTG_docs/annual_reports/FTG_report_2023.pdf)) | [full text] |
| Stagecoach Reservoir, Nebraska | late June–early July 1974 | "40–50 mm" fish abundant along shore; spawning late May–early June | Zuerlein 1981, Nebraska Game & Parks (repo `fetched/fulltext.pdf`) | [full text]; implies ~0.7–1.2 mm/d [inf] |
| Onondaga, Cayuga, Oneida (NY) | Aug–Oct | Onondaga August means 42–60; Cayuga 57.5 (30 Sep), 68 (10 Oct) | repo BGW | [full text] (repo) |

**Gaps.** No first-summer lengths were found for Maine, the Maritimes, Lake Champlain, Quabbin or Lake Winnebago. AuClair's 1956 UMaine thesis (Sebasticook Lake) went offline when the UMaine repository closed.

### 1.2 Growth rates

| Stage | Rate | Setting | Source | Tag |
|---|---|---|---|---|
| Larvae, otolith lifetime growth | 0.155–0.331 mm/d (New Hamburg), rising through the season | Hudson 1994 | Limburg, Pace & Arend 1999, *Fish. Bull.* 97:80–91 | [full text] (repo LSV) |
| Larvae | 0.20–0.30 mm/d, the same at every site | upper Chesapeake, May 2002 | Abel 2004, Maryland Sea Grant REU abstract | [abstract] |
| Larvae → age 45 d (otolith back-calculation) | **median 0.6 mm/d** (stayed in fresh water) or 0.5 (moved to brackish water); metamorphosis and settlement at **45 d (SD 7)** | Patuxent, 2001 | Kraus & Secor 2004, *MEPS* 279:247–259, [doi 10.3354/meps279247](https://doi.org/10.3354/meps279247) | [full text] |
| Juveniles of ~21–67 mm, Jul–Aug | **0.67–0.80 mm/d** (1973 0.76, 1974 0.80, 1975 0.77, 1976 0.67) | Hudson | from TI 1979 Table B-24 | [inf] |
| Juveniles, Jul–Aug | instantaneous length growth 0.0034–0.0222 /d; water 22.5–25.5 °C | Hudson 1965–76 | TI 1979, Table IV-39 | [full text] |
| Juveniles, Jul–Sep | 4.8–13.1 mm/month (≈ 0.16–0.44 mm/d) | Patuxent, 10 years | Kraus & Secor 2004 | [full text]; mm/d [inf] |
| Juveniles of ~40–100 mm, Jul–Sep | ~0.4–1.0 mm/d (2009 ≈ 0.43, 0.60, 0.50; 2010 ≈ 1.0, 0.8) | Saginaw Bay | from Pothoven & Höök 2015 | [inf] |

**Stage sizes.**
- Hatch at ~2.5 mm SL (~3 mm TL); first feeding 3.4–3.5 mm SL (Margulies 1989 [full text]).
- Scales form at **20–25 mm TL** (Mansueti 1964, via Harris 2006 [review]).
- The repo's earlier "juveniles at 7–9 mm" (Stanley & Danie 1983) is the end of fin development, not metamorphosis. Treat 20–25 mm, ~45 d after hatch, as the transition to the juvenile, shore-settled stage [inf].

### 1.3 What drives first-summer growth

- **Hudson:**
  - Length on 1 August rose with May–July water temperature (partial r = 0.70, P = 0.02). Flow had no effect (partial r = −0.17).
  - July–August growth was unrelated to temperature, flow or density (all partial r ≤ 0.27, n.s.) (TI 1979, Tables IV-40, IV-42 [full text]).
  - The 1976 year class ran 4–8 mm behind 1975, widening to 7–12 mm, because its surviving larvae were spawned 2–3 weeks later [full text].
- **Lake Ontario:** mean YOY length tracked degree-days > 15 °C (r 0.69) (O'Gorman & Burnett 2001, *JGLR* 27:367–383 [abstract]; repo BGW).
- **Oneida:** young white perch out-weighed young yellow perch by October in every year 1977–87. Their weight tracked late-summer *Daphnia pulex* (rₛ 0.58, P = 0.07) (Prout, Mills & Forney 1990, *TAFS* 119:966–975 [abstract]).
- **Saginaw Bay:** energy density rose every month into autumn, "suggesting that food limitation was not severe". The fish ate whichever of *Daphnia* or chironomids was available (Pothoven & Höök 2015 [full text]).

### 1.4 Hot Brook growth targets by date [inf]

**Reasoning.**
- Hot Brook spawns at ~15 °C in late May–early June, so first feeding comes in the first half of June (BGW). That is about 2 weeks after the Hudson, where the 1976 yolk-sac peak was 16–22 May and the feeding-larva peak 20–26 June (TI 1979 [full text]).
- Shifting the Hudson series by ~2 weeks at ~0.7 mm/d gives the table below. It is consistent with the BGW late-September target and the YFS §7.3 white perch row (35–45 mm at the end of July, slightly higher).

| Date | Mean TL (mm) | Note |
|---|---|---|
| 1 July | 8–15 | larvae at 0.2–0.4 mm/d |
| 15 July | 15–25 | settlement on the shore begins at 20–25 mm |
| 1 August | **25–40** | Hudson 32–48 with an earlier hatch |
| 1 September | 40–55 | Lake Erie August 57.5; Hudson late August 53–67 |
| Late September | **50–65 (central ~57)** | BGW; little growth after mid-September |
| Ice-on | 52–68 | BGW |

**A 13–15-mm fish in the field is about 4–6 weeks old and passes through that size in about a week** (at 0.2–0.5 mm/d). A stall from July to October has no field counterpart.

---

## 2. Diet sequence by length

| Size | Diet | Setting | Source | Tag |
|---|---|---|---|---|
| ~3.4–3.8 mm (first feeding, 3–5 d after hatch) | rotifers, copepod nauplii, small copepodites | Chesapeake | North & Houde 2000, ICES CM 2000/N:23 (citing Mansueti 1964; Setzler-Hamilton et al. 1982) ([PDF](https://www.vliz.be/imisdocs/publications/ocrd/276018.pdf)) | [review] |
| 3.2–9.8 mm SL | *Eurytemora affinis* copepodites and adults "the predominant prey" in every length class; gut fullness tracked *E. affinis* density | upper Chesapeake turbidity maximum, 1998–99 | Shoji, North & Houde 2005, *J. Fish Biol.* 66:1328–1341, [doi 10.1111/j.0022-1112.2005.00685.x](https://doi.org/10.1111/j.0022-1112.2005.00685.x) | [abstract] |
| < 10 mm notochord length | *Bosmina* plus large copepodites and adult copepods ≈ **91 %** of the diet; copepod selection stayed high unless *Bosmina* exceeded ~14/L | Hudson | Limburg et al. 1997, *TAFS* 126:607–621 | [abstract] |
| < 10 vs > 10 mm | Small larvae had diverse diets. Larger larvae ate mainly *Bosmina* and calanoids. Rotifers and cyclopoids were eaten but neither selected nor important; nauplii "generally neither selected nor important" | Patuxent 2000–01 | Campfield & Houde 2011, *Fish. Bull.* 109:1–19, Table 2 ([PDF](https://spo.nmfs.noaa.gov/sites/default/files/pdf-content/2011/1091/campfield.pdf)) | [full text]. The paper's prey-length regression (PL = 1.94 + 0.04·TL) gives sensible sizes (~140 µm at 5 mm, ~350 µm at 15 mm) only if read as log10; unverified [inf] |
| ≥ 20–25 mm (~45 d) | Settle on the shallow shore (≤ 2 m); enter beach seines from early July | Patuxent; Hudson | Kraus & Secor 2004; TI 1979 | [full text] |
| ≤ 75 mm YOY, Sep–Nov | Mean % by number. **Sep (n 33):** harpacticoids 32.0, *Gammarus* 14.0, chironomid larvae 8.9. **Oct (n 26):** *Gammarus* 36.6, harpacticoids 30.0, chironomids 10.8, polychaetes 6.3, calanoids 4.1. **Nov (n 5):** calanoids 73.0, harpacticoids 14.7 | Hudson beach seines, 1974 | TI 1979, Table IV-25 | [full text] |
| up to 40 mm → > 40 mm | copepods and *Leptodora* → mysids, insect larvae and pupae | James River, VA (estuary) | Rudershausen & Loesch 2000, *Va. J. Sci.* 51:23, via Harris 2006 | [review] |
| ~40 mm | copepods and daphnids → amphipods and chironomids | Oneida Lake, NY | Prout et al. 1990, via Harris 2006 (VT MS thesis) | [review] |
| < 50 vs > 50 mm (26–168 mm, n 115) | Below 50 mm in low salinity, copepods (cyclopoids, *Eurytemora*) "nearly all" the diet; above 50 mm, sand shrimp ≥ 80 % by weight | Richibucto estuary, NB, Jun–Oct 1998 | St-Hilaire et al. 2002, *Northeast. Nat.* 9:303–316 | [abstract] |
| 39–102 mm, Jul–Nov | **2009** (% dry weight, by SIMPER): chironomids 52 % (Aug) and 73 % (Sep); ≥ 79 % of fish ate chironomids every month but July, and all also ate zooplankton. **2010:** *Daphnia* 94 % (Jul), 81 % (Aug), 84 % (Sep). Benthos share by site: 2009 46/88/98/88 %; 2010 91/1/0/26 % | Saginaw Bay | Pothoven & Höök 2015, Tables 1, 3 | [full text]; checked by me |
| Age 0, Jun–Dec 2004 | Cladocerans 43 % (Jun), 50 % (Oct), 61 % (Nov) by weight; Jul–Sep mostly chaoborids, chironomids, mayflies. 2005 (weak year class): chironomids > 62 % (Sep–Oct). Young white perch took larger cladocerans (*Daphnia*) than crappie did (*Bosmina*) | Kerr Reservoir, VA–NC | Harris 2006, MS thesis, Virginia Tech ([PDF](https://vtechworks.lib.vt.edu/bitstreams/8e7bf951-84ae-4a7e-9efe-42cb0efa708e/download)) | [full text] |
| Juveniles (Albemarle Sound) | copepods and cladocerans > 90 % by number; mysids and amphipods led by weight; pelagic → epibenthic with growth | NC | Clermont & Overton 2015, *J. NC Acad. Sci.* 131:2–12 | [abstract] |
| Age 0, lab | most prey eaten were the smaller zooplankton taxa | Lake Erie zooplankton | Parrish & Margraf 1991, *CJFAS* 48:607–610 | [abstract] |
| Switch timing | moved to benthos in summer on a date "determined by a combination of zooplankton abundance and fish size" | western Lake Erie, 27 years | Gopalan et al. 1998, *CJFAS* 55:2572–2579 | [abstract] |
| Earlier in repo | Buckley 3F Reservoir: copepods 80.6 %, ostracods 32.3 %, chironomids 32.3 % of stomachs (Lund 1978 via Zuerlein); NC fish < 120 mm ~90 % benthos (Feiner); Tedford Lake NS microcrustaceans to 150 mm (Smith 1947) | — | repo BGW | as tagged there |

**Reading for Hot Brook** [inf]:
- **< 10 mm:** nauplii, copepodites, *Bosmina*. Rotifers matter only in the first few days.
- **10–20 mm:** pelagic copepods (calanoids are most of Maine's crustacean biomass, §8), *Bosmina*, and *Daphnia* where present. This is the stage the sim stalls in, and it is wholly planktonic in every source.
- **20–40 mm:** shore-settled. Zooplankton plus a rising share of epibenthic prey: harpacticoids, chydorids, ostracods, small chironomids.
- **≥ 40–50 mm:** chironomids and amphipods (*Hyalella*) dominate unless *Daphnia* is plentiful.

---

## 3. Survival and mortality

| Measure | Value | Setting | Source | Tag |
|---|---|---|---|---|
| Larval Z, 6-d cohorts | 0.785, 0.509, 0.328, 0.241, 0.304, 0.187, 0.044, 0.137 /d (median ~0.27). Z fell as water warmed 12 → 21 °C | Hudson 1994 | Limburg et al. 1999, Table 2 | [full text] (repo LM) |
| Larval Z, first 45 d | 0.03–0.08 /d | Patuxent | Kerr 2008 | [review] (repo LJE) |
| Standing crop decline | ~2 billion feeding larvae (late June peak) → **3.86 million on 1 Dec 1976**, average **3.6 %/d**. Mortality highest in the larval stages, falling through the juvenile stage | Hudson | TI 1979, pp. II-10, IV-121 | [full text]; checked |
| Peak weekly standing crops | yolk-sac larvae 293 million (16–22 May); feeding larvae **2.08 billion** (20–26 June). Gear assumed 100 % efficient, so underestimates | Hudson 1976 | TI 1979, Table IV-37 | [full text] |
| Juvenile population | **209 million** in September 1976 (95 % CI 158–285 million), mean 2.75 g, 20 kg/ha | Hudson, mark–recapture | TI 1979 | [full text]; checked. ≈ 7,200/ha over ~29,000 ha [inf]; ≈ 10 % of the larval peak [inf] |
| Seine efficiency | daytime beach-seine standing crops < 7 % of true numbers | Hudson 1977 test | TI 1979 | [full text] |
| Early-cohort loss | May 1976 larvae mostly died when water fell to 12 °C. The decline by size came at first feeding (~4 mm) | Hudson | TI 1979, pp. IV-124–126 | [full text] |
| Compensation | survivors came from "a fraction of the normal spawn", yet juvenile numbers matched the previous year | Hudson 1976 | TI 1979, p. II-10 | [full text] |
| End of juvenile stage → end of yearling year | 89 %/yr (0.6 %/d) by catch curve; another estimate 75 %/yr (0.4 %/d) | Hudson | TI 1979, p. IV-126 | [full text] |
| Striped bass, same river and year | larvae 15 %/d (13 Jun–13 Jul); juveniles **0.3 %/d** (14 Jul–31 Dec) | Hudson 1976 | TI 1979, p. II-9 | [full text] |
| Starvation | first feeders at 50 rotifers/L: growth ~0, 8-d survival 80–90 % lower than at 800/L; a 4-d feeding delay cost 60–80 % | lab, 17–21 °C | Margulies 1989 | [full text] (repo LSV) |
| Late-summer density | August age-0 **2,851/ha** (2011–21 mean); 1,160/ha in 2022 at 5.1 kg/ha (≈ 4.4 g each [inf]) | western Lake Erie | Forage Task Group 2023 | [full text] |

**Reading** [inf]:
- Larval Z ≈ 0.1–0.3 /d over ~3–5 weeks. Juvenile Z ≈ 0.003–0.01 /d from settlement to autumn, a factor of ~30 lower.
- Survival from first feeding to September is **~0.1–5 %**. From the peak standing crop of feeding larvae it is higher (~10 % in the Hudson), because the peak standing crop is only part of the cumulative production.
- The repo's YFS §7.4 targets stand: larval Z 0.05–0.3 /d; juvenile 0.01–0.05 /d (white perch toward the low end).

---

## 4. What limits year-class strength

**Set early.**
- "Year-class strength was established by July through August": the Hudson July–August juvenile index matched the later yearling index (TI 1979 [full text]; checked).
- **Oneida 1968–2011.** Year-classes dense as larvae gave more juveniles and adults. Dense cohorts grew slower and died more, but "mortality did not compensate". The best recruitment model was **larval density + predator biomass** (VanDeValk et al. 2016, *TAFS* 145:416–426, [doi 10.1080/00028487.2015.1131743](https://doi.org/10.1080/00028487.2015.1131743) [abstract]).
- **Hudson, 17 years.** Temperature and flow explained "little". Yolk-sac larvae predicted feeding larvae, but feeding larvae did **not** predict YOY abundance (Pace et al. 1993, *CJFAS* 50:1976–1985, [doi 10.1139/f93-220](https://doi.org/10.1139/f93-220) [abstract]).

**Weather at spawning.**
- **Maine:** failures come "only" from mortality caused by unfavourable weather at spawning time (MDIFW 2002 white perch plan, repo `fetched/whiteperch.pdf` [full text]).
- **Hudson 1976:** a 12 °C kill.
- **Patuxent 2004:** a spring storm cooled the water to ~10 °C, leaving only 2 cohorts and record-low juveniles (Lusk 2005, Maryland Sea Grant REU abstract [abstract]).
- **Hudson regression 1965–76.** Juvenile abundance fell with May–June flow and with the days taken to warm from 16 to 20 °C (coefficient −0.73). R² = 0.518, not significant (TI 1979, Table IV-44 [full text]). The report's text calls the 16–20 °C effect "positive", contradicting its own table.
- **Chesapeake:** YOY abundance rose with spring Susquehanna flow (r = 0.47, n = 23, P < 0.025, 1977–99) (North & Houde 2000 [full text]).

**Food.**
- **First feeding.** 800 rotifers/L (0.64 cal/L) good, 50/L (0.04 cal/L) failing (Margulies 1989 [full text]). At ~5.3 cal/mg DW that is ≈ 120 vs ≈ 7.5 µg DW/L of rotifer biomass [inf]. At 0.025 µg per rotifer it is 20 vs 1.25 µg/L [inf]; *Brachionus* is heavier than the NLA field mean.
- **Hudson larvae.** G_WP = 0.136 + 4.64×10⁻⁴·(copepods + *Bosmina* per L). Cohorts grew at G 0.13–0.16 /d at 1.9–80/L and up to 0.38 /d at 520/L (Limburg et al. 1999, Table 3 [full text]).
  - At ~1.5 µg per animal, 2–80/L is ≈ 3–120 µg DW/L [inf].
  - **Field larvae grew at G ≥ 0.13 /d even at a few crustaceans per litre**, against the sim's near-zero growth at 30–40 µg/L.
- **Oneida.** Large yellow perch cohorts collapse *Daphnia* and slow white perch more than the reverse (Prout et al. 1990 [abstract]).
- **Lake Erie.** Recruitment depended on hatch date relative to the zooplankton cycle and on the size at which the switch to benthos becomes possible (Gopalan et al. 1998 [abstract]).
- **Oneida in the round goby era.** Benthic invertebrates fell to 19–48 % of earlier densities. Growth of all white perch ages still rose, offset by *Hexagenia* and gobies (Brooking et al. 2022, *TAFS* 151:641–654 [abstract]).

**Winter.** After 150 d, mortality was 71.2 % at 2.5 °C against 11.1 % at 4.0 °C, small fish first. White perch suffered 3.3× the mortality of same-sized yellow perch (Johnson & Evans 1991, *CJFAS* 48:672–680 [abstract]; repo FWM, BGW).

**Size of the swings.**
- Patuxent > 100-fold (Kraus & Secor 2004 [full text]).
- Lake Ontario ~200-fold (O'Gorman & Burnett 2001 [abstract]).
- Lake Jesse NS had no 1934 cohort at all (repo BGW).

---

## 5. Young yellow perch in northern lakes (comparison)

### 5.1 Growth by date

- **Lake Opeongo, Ontario** (oligotrophic Shield lake). Arts & Sprules 1989, *Oecologia* 81:21–27, [doi 10.1007/BF00377004](https://doi.org/10.1007/BF00377004) ([PDF](https://fishlarvae.org/common/SiteMedia/Arts%20and%20Sprules%20(1989).pdf)):
  - Lake YOY weighed 382 ± 27 mg (1985) and 653 ± 66 mg (1986) on 24 July [full text]; ~20–60 mg in late June (Fig. 2a) [full text].
  - With W ≈ 0.00427·L^3.22 (mg, mm; fitted to the repo's 20 mm = 66 mg and 50 mm = 1.26 g) [inf]:
    - **~14–19 mm in late June** and **~34–41 mm on 24 July**;
    - ≈ **0.7–0.8 mm/d** over ~28 days [inf].
- **Oneida Lake, NY:**
  - larvae 8 → 18 mm at 0.48 mm/d; 1 August mean 52.6 mm (37–65); 15 October 74.9 mm (repo FZC);
  - so ~0.30 mm/d from August to October [inf];
  - mid-October length over 1961–2025 was **56–91 mm, mean 77 mm** over 49 usable years ([Cornell BFS/NYSDEC, *Fisheries and Limnology of Oneida Lake 1957–2025*, Table A10](https://oneidalakeassociation.org/wp-content/uploads/2026/04/Oneida-Lake-Report-2025-04222026.pdf) [full text]).
- **Crystal Lake, WI** (Hrabik, Carey & Webster 2001, *TAFS* 130:568–582 [full text]):
  - first feeding at 5.6 mm, 2.4 mg;
  - successful year-classes fed at **P = 0.476 (0.326–0.626)** of Cmax;
  - failed years (smelt competition) at P 0.29 (1996) and ≤ 0.19 (1995).
- **Alberta lakes:** growth is set by degree-days above 13.5 °C, and end-of-season length falls with latitude (Power & van den Heuvel 1999, *TAFS* 128:687–700 [abstract]).
- **Elsewhere** (repo): Lake St. George 61–71 mm in autumn; Red Lakes 71–79 mm at the first annulus.
- **Maine-calendar targets** (hatch late May) [inf]: end of June ~15–20 mm; end of July ~35–45; end of August ~50–60; mid-September to October 55–75.

### 5.2 Switch from zooplankton to benthos

| Size | What happens | Source | Tag |
|---|---|---|---|
| ≥ 7 mm | adult copepods eaten | Fisher & Willis 1997, *J. Freshw. Ecol.* 12:421 | [abstract] |
| > 12 mm | grow best on adult copepods and small cladocerans; rotifers alone give little or no growth | Graeb, Dettmers, Wahl & Cáceres 2004, *TAFS* 133:504–514 | [abstract] |
| ≥ 14 mm FL | select *Holopedium* | Arts & Sprules 1988, cited in 1989 | [full text] |
| 20 mm | positively select zooplankton | Graeb et al. 2006, *TAFS* 135:1493–1498 | [abstract] |
| ~25–30 mm | wholly nearshore, which the authors judged not a proximate response to prey or predators | Post & McQueen 1988, *CJFAS* 45:1820–1826 | [abstract] |
| < 30 mm | **no** benthic prey in the lab or the field | Wu & Culver 1992, *CJFAS* 49:1932–1937 | [abstract] |
| 30–35 mm | switch to preferring *Daphnia* | Mills et al. 1984 (repo FZC) | [abstract] |
| 40 and 60 mm | select benthic invertebrates, whatever the relative prey densities | Graeb et al. 2006 | [abstract] |
| > 50 mm | benthic prey "at low zooplankton densities". The switch ran June → August with the zooplankton decline, and growth fell after it | Wu & Culver 1992 | [abstract] |
| ~50 mm | cladocerans until here, then macroinvertebrates (slow-growth lake); little benthos in the fast-growth lake | Fisher & Willis 1997 | [abstract] |
| late July, ~35–40 mm | *Chaoborus*, chironomids and *Sida* dominate by weight after *Holopedium* (15–45 % of the diet in early July) | Arts & Sprules 1989 | [full text] |
| 80 mm | piscivory begins | Graeb et al. 2006 | [abstract] |

**Eurasian perch analogues** [abstract]:
- **Competition.** Roach depleted pelagic zooplankton. YOY perch then switched to benthic cladocerans and chironomids, grew less, and nearly all died in winter (Byström, Persson & Wahlström 1998, *Ecology* 79:2153).
- **Gape.** YOY perch are gape-limited on large zooplankton (Byström, Huss & Persson 2012, *Freshw. Biol.* 57:847).
- **Large daphnids.** Only perch over 20–25 mm took larger-than-average daphnids (Mehner et al. 1998, *Arch. Hydrobiol.* 142:191).

**Walleye analogue** [abstract]: 20-mm fish selected zooplankton; 40–100-mm fish selected benthic invertebrates (Galarowicz, Adams & Wahl 2006, *CJFAS* 63:1722).

### 5.3 Zooplankton and growth in yellow perch

- **Oneida 1975–86.** Below ~1,350 °C·d, no variable predicted weight. After that, weight correlated strongly with *Daphnia* biomass (Mills, Sherman & Robson 1989, *CJFAS* 46:880–886 [abstract]).
- **Oneida 1968–71.** Growth tracked *Daphnia*. YOY ate up to 17 % of the *D. pulex* standing crop a day (Noble 1975, *TAFS* 104:731 [abstract]).
- **Oneida, 49 years** [inf from full text, Tables A1, A10]:
  - May–October total zooplankton 97–315 µg DW/L (mean 198); *Daphnia* 20–196 (mean 79).
  - Mid-October YOY length was **uncorrelated** with either (r = 0.05 and 0.11).
  - The six years at ≤ 130 µg/L still gave 69–86-mm YOY.
- **Lab ration.** Peak growth on 1.4–1.8-mm *D. pulex* at a ration of 25 % of fish dry weight a day; 40 % did no better (Mills, Pol, Sherman & Culver 1989, *TAFS* 118:1 [abstract]).
- **Gut emptying.** Under continuous feeding the gut emptied in 0.6 h at 17–19.5 mm, against > 3 h at 45 mm (20–22 °C) (Noble 1973, *TAFS* 102:759 [abstract]).

**No per-litre *D. pulex* threshold** for the switch or the slowdown was found; the full texts holding it were blocked (see Access).

---

## 6. Prey thresholds and the half-saturation for 15–30-mm percids and moronids

### 6.1 Lab maintenance and feeding densities

| Fish | Finding | Source | Tag |
|---|---|---|---|
| Walleye larvae, 10.0–10.7 mm, 0.74–0.82 mg DW, 15–22 °C, on cyclopoids | Maintenance ration 7–11 %/d, rising with temperature. Prey density for maintenance **10–27/L below 1 mg DW (< 10.9 mm)**, falling to **< 2/L at ≥ 1.5 mg (> 11.9 mm)**. Weight loss and mortality during 38–64 h without food were **highest at 1.5–3.5 mg (11.9–14.6 mm)** | Johnston & Mathias 1996, *TAFS* 125:211–223 | [abstract]; checked by me |
| Pikeperch larvae | Density needed to hold mass: > 585/L at 6.5 mm, 55/L at 7 mm, < 10/L at 11 mm. Growth followed a type II curve, 26–30 %/d at 1,000/L | Ljunggren 2002, *J. Fish Biol.* 60:405 | [abstract] |
| Yellow perch larvae, 9–15 mm | Raising prey from 25 to 150/L improved foraging success, but only above 10 mm. Light (0.1–60 µmol m⁻² s⁻¹) had no effect | Martin, Wahl & Czesny 2012, *Ecol. Freshw. Fish* 21:588 | [abstract] |
| Walleye, juveniles | Consumption "linearly proportional" to density below 100 *D. pulex*/L (short-term) | Mathias & Li 1982, *TAFS* 111:722 | [abstract] |
| Walleye postlarvae | "Optimum food density of 100 daphnids per liter" | Li & Mathias 1982, *TAFS* 111:710 | [abstract] |
| Walleye 20–150 mm | Type II on zooplankton; handling time similar on zooplankton and benthos (values in the blocked full text) | Galarowicz & Wahl 2005, *CJFAS* 62:2330 | [abstract] |
| Yellow perch, 19 and 45 mm, 1-h trials, 5–300 zooplankton/L, < 5–100 NTU, 18–24 °C, fish starved 16–24 h | Consumption rose with density across the range. My Holling II fits: **19 mm, sediment turbidity: Cmax ≈ 92 prey/h, K ≈ 108/L (62–186)**; 19 mm, algal turbidity: Cmax ≈ 58/h, K ≈ 86/L; 45 mm: K ≈ 314/L (poorly constrained) | Wellington et al. 2010, *J. Fish Biol.* 76:1729 ([PDF](https://www.utoledo.edu/nsm/lec/research/be/docs/wellington2010.pdf)) | [full text]; figures read by eye, fits [inf] |
| Same, as a daily ration | For a 56-mg fish (FB4 Cmax 0.33 g/g/d at 20 °C, prey 1.5–3 µg DW, 14 h of feeding), half the daily cap needs 34–99 prey/L ≈ **100–150 µg DW/L** | from Wellington | [inf]. An upper bound: starved fish, turbid water, 1-h trials |
| IBM built on Wellington | Ingestion at 10/100/300 zooplankton/L; Cmax 2.8275·W^0.8496 (after Letcher 1996); zooplankton only below 30 mm; above 30 mm, 70 % *Daphnia*, 20 % chironomids, 10 % mayflies; starvation at 0.53 of maximum mass | Manning et al. 2014, *CJFAS* 71:1544 | [full text] |
| Light | Above 230 lx, size selection by young perch did not depend on prey abundance | Mills, Confer & Kretchmer 1986, *TAFS* 115:716 | [abstract] |

### 6.2 Growth and survival thresholds in mesocosms, ponds and the field

**Hoxmeier, Wahl, Hooe & Pierce 2004** (*TAFS* 133:45–54, [PDF](https://www.cfwru.iastate.edu/files/inline-files/pierce2004_12.pdf)) [full text; checked by me]:
- **Setup.** Walleye stocked at 9.97 mm (mesocosms) and 8.64 mm (ponds). Mean crustaceans (nauplii and rotifers excluded): mesocosms 2.9, 6.4 and 21.6/L; ponds 103, 311 and 433/L. Mean prey length 0.62 mm (*Daphnia* 0.66, *Bosmina* 0.29, cyclopoids 0.52, calanoids 0.70).
- **Abstract.** Growth "(0.7–1.5 mm/d) increased with crustacean zooplankton density". Zooplankton gut fullness rose with density "up to 20–30 individuals/L". At low densities larvae "fed more heavily on chironomid larvae".
- **Gut fullness** (Fig. 3): ~3–8 µg/mg at 1–6/L, 14–22 at ≥ 8–14/L, flat to 50/L. **Half-saturation ≈ 4–7/L** [inf].
- **Growth** (Fig. 2):
  - mesocosms: **0.72–0.85 mm/d at 1–3/L**, where the fish ate 57–99 % chironomids by days 6–16 (Table 1); ~0.9–1.0 at 8–27/L; ~1.06–1.09 at 34–50/L;
  - ponds: 1.17–1.46 mm/d at 150–450/L [full text; figure values inf].
- **Authors' guidance:**
  - growth rose fast below 100/L and slowly above;
  - chironomid use rose sharply below 20/L;
  - maintenance at 5/L (citing Johnston & Mathias 1996);
  - **> 100/L** for good growth, up to 500/L for the maximum, **≥ 50/L for survival**;
  - 35/L gave poor fry survival in Lake Oahe (Fielder 1992) [review];
  - zooplankton ranged 3–396/L across 10 Illinois reservoirs [full text].

**Other studies:**
- **Walleye culture ponds:** ≥ 49 zooplankters/L was enough for first feeding; starvation is unlikely at ≥ 50/L (Johnston & Mathias 1993, *CJFAS* 50:1835 [abstract]).
- **Bluegill** (Breck 1997, MI DNR Fish. Res. Rep. 1995 [full text]; repo YFS):
  - growth fell from 0.6 to 0.2 mm/d "when total zooplankton density (exclusive of rotifers) decreased below about 50 organisms/L";
  - the fish then "switched to foraging on benthic prey".
- **Striped bass, Morone:**
  - Chesney 1989 (*MEPS* 53:191, [PDF](https://www.int-res.com/articles/meps/53/m053p191.pdf)) [full text]:
    - larvae grew at G 0.143–0.179 /d on 50–250 *Eurytemora*/L (70 % nauplii), up to 0.39 mm/d, with Z only 0.005–0.027 /d;
    - earlier lab requirements were judged overestimates (Miller 1976: 1,864 *Artemia*/L);
    - field prey run 25–500/L, typically 100–200/L.
  - Martino & Houde 2010 (*MEPS* 409:213, [PDF](https://www.int-res.com/articles/meps2010/409/m409p213.pdf)) [full text]:
    - minimum thresholds of 50–100 prey/L (*E. affinis* + *Bosmina*), from Eldridge 1981, Chesney 1989 and Tsai 1991;
    - **strong year-classes met > 250/L; poor years < 2/L**.
  - Chick & Van Den Avyle 1999 (*TAFS* 128:339 [abstract]): no growth at riverine prey levels (−0.02 to −0.01 mm/d); 0.02–0.17 mm/d at lake and patch levels.
  - Houde & Lubbers 1986: 100 *Artemia*/L as good as 500/L for Morone larvae at 19 °C (repo LSV) [full text].
- **White perch:** no measured functional response for young white perch exists in any source reached.

### 6.3 Mechanistic attack and handling sets for young perch

Persson et al. 2004 (*Ecol. Monogr.* 74:135, [PDF](https://pure.uva.nl/ws/files/1966841/27511_EcolMon04.pdf)) and Claessen et al. 2000 (*Am. Nat.* 155:219, [PDF](https://pure.uva.nl/ws/files/3193934/13789_90295y.pdf)) [full text].

**The model.**
- Attack rate: A(m) = Â·[(m/W_opt)·e^(1−m/W_opt)]^α.
- Digestion-limited handling: H = ξ₁·m^ξ₂ per g of prey.
- Intake: I = A·R/(1 + H·A·R).
- So **K = 1/(A·H)** and Imax = 1/H.

**Parameters:**

| Parameter | Persson et al. 2004 | Claessen et al. 2000 |
|---|---|---|
| Â (L/d) | 9×10³ | 3.0×10⁴ |
| W_opt (g) | 4.7 | 8.2 |
| α | 0.62 | 0.62 |
| ξ₁ | 5.0 | 5.0 |
| ξ₂ | −0.8 | −0.8 |

- Prey is in wet mass.
- Persson's Â and α come from Byström & García-Berthou 1999's attack rates on 0.5-mm cladocerans (*Oikos* 86:217 [abstract]).
- The minus sign of ξ₂ was lost in PDF extraction and restored from the row order [inf].
- Persson 2004 forced YOY growth from field data rather than this intake model.

**Computed K** [inf; the Persson column re-checked by me at 15 mm: A = 583 L/d, H = 110 d/g, K = 15.6 µg wet/L]:

| TL (mm) | m (mg wet) | A, Persson (L/d) | Imax (g/g/d) | K, Persson (µg wet/L) | K, Claessen (µg wet/L) | K (µg DW/L, dry 10–15 % of wet) |
|---|---|---|---|---|---|---|
| 15 | 21 | 590 | 0.43 | 15.7 | 6.6 | 1.6–2.4 / 0.7–1.0 |
| 20 | 64 | 1,157 | 0.35 | 19.2 | 8.1 | 1.9–2.9 / 0.8–1.2 |
| 25 | 150 | 1,935 | 0.29 | 22.6 | 9.5 | 2.3–3.4 / 0.9–1.4 |
| 30 | 290 | 2,865 | 0.26 | 26.0 | 10.8 | 2.6–3.9 / 1.1–1.6 |

**What the sets imply** [inf]:
- Imax of 0.35 g/g/d at 20 mm matches the FB4 juvenile yellow perch Cmax at 20 °C (0.33; repo LJE). The two frameworks agree on the cap and differ only in attack rate.
- **Encounter cross-check:**
  - age-0 perch react at 5.0 cm at 3,000 lx and 2.8 cm in the dark (Richmond et al. 2004, *J. Fish Biol.* 65:195 [abstract]);
  - a 2–3-cm reaction radius at 1 body length/s for 14 h searches 1.3–2.9 m³ a day;
  - with capture 0.5–0.9 and a ~2.2 mg DW daily cap, K ≈ 1–4 µg DW/L.
- **Clear-water lab physics gives a K one to two orders of magnitude below what field growth implies.**
  - Field fish lose search time to patchiness, light (dawn, dusk, night), predator avoidance, copepod escapes and gut-limited bouts.
  - So the K a model needs depends on whether those losses are modelled separately.
  - The sim already has a visibility term (`VIS_I0/VIS_I1`), copepod escape (`COPE_ESCAPE`) and a weed refuge. Its K should therefore sit toward the lower, intake-based end.

### 6.4 Individual-based model parameter sets

- **Rose et al. 1999** (Oneida perch and walleye IBM; *Ecol. Monogr.* 69:127; K by prey type): **not obtained** (blocked).
- **Rose & Cowan 1993** (striped bass, *TAFS* 122:415 [abstract]): random-encounter feeding. Larvae eat four zooplankton types; **juveniles eat only benthic prey**.
- **Letcher et al. 1996** (*CJFAS* 53:787 [abstract]): a 3-fold change in prey density equalled the effect of predator size, and the density of the smallest prey decided the cause of death (repo FZC).
- **Madenjian & Carpenter 1991:** encounter-derived k for fish prey only; not relevant here.

### 6.5 Converting the thresholds to µg DW/L

Masses are from §7. Hoxmeier's assemblage averages ≈ 1.3 µg (1.0–1.8) and Breck's model assemblage ≈ 0.55 µg [inf].

| Threshold | Count | Mass assumed (µg) | µg DW/L [inf] |
|---|---|---|---|
| Persson/Claessen K, 15–30 mm | ~0.5–1/L | (wet 7–26 µg/L) | **0.7–3.9** |
| Hoxmeier gut-fullness half-saturation | 4–7/L | 1.3 | **5–9** |
| Hoxmeier gut-fullness plateau | 20–30/L | 1.3 | 26–40 |
| Walleye maintenance > 11.9 mm (J&M 1996) | < 2/L | 1.5–2 | **< 3–4** |
| Walleye maintenance < 10.9 mm | 10–27/L | 1–1.5 | 10–40 |
| Maintenance (Hoxmeier, citing J&M) | 5/L | 1.3 | ~7 |
| Pikeperch maintenance, 11 mm | < 10/L | 0.5–1.5 | < 5–15 |
| Pikeperch maintenance, 6.5 mm | > 585/L | 0.5–1.5 | > 290–880 |
| Breck's growth slowdown | ~50/L | 0.5–2 (field mix ~1–1.5) | **25–100 (central ~50–75)** |
| Hoxmeier: survival minimum / good growth / maximum | 50 / 100 / 500 per L | 1.3 | 65 / 130 / 650 |
| Walleye ponds adequate (J&M 1993) | ≥ 49/L | 1–1.5 | ≥ 50–75 |
| Striped bass minimum (Martino & Houde) | 50–100/L | 1–3 (*Eurytemora* nauplii lighter) | 50–300 |
| Wellington daily-ration K | 34–99/L | 1.5–3 | **100–150** |
| Margulies, white perch first feeders: good / none | 800 / 50 rotifers/L | 0.025 | 20 / 1.25 (≈ 120 / 7.5 by calories) |
| Hudson larval growth G ≥ 0.13 /d | 2–80/L | 1.5 | 3–120 |
| Oneida seasonal biomass with no YOY growth signal | — | — | 97–315 |

### 6.6 Reconciling intake and growth measures, and the verdict

For a Holling II with maintenance at p_m, the maintenance density is N_m = K·p_m/(1−p_m), and growth reaches half its maximum at N_g½ = K·(1+p_m)/(1−p_m) [inf]. The perch juvenile set breaks even at p_m ≈ 0.25–0.35 (LJE).

| K (µg DW/L) | Maintenance at p_m 0.25–0.35 | Growth half-maximum | p at 30 / 40 / 90 µg/L |
|---|---|---|---|
| 10 | 3–5 | 17–21 | 0.75 / 0.80 / 0.90 |
| **25** | **8–13** | **42–52** | **0.55 / 0.62 / 0.78** |
| 40 | 13–22 | 67–83 | 0.43 / 0.50 / 0.69 |
| **60 (sim)** | **20–32** | **100–125** | **0.33 / 0.40 / 0.60** |

**K ≈ 25 fits all three kinds of evidence:**
- maintenance at 8–13 µg/L ≈ 5–10/L (Johnston & Mathias; Ljunggren; Hoxmeier);
- growth half-maximum at 42–52 µg/L ≈ 30–50/L (Breck's 50/L; the 50/L minimums of Hoxmeier and Martino & Houde);
- intake saturating at ~20–30/L (Hoxmeier's gut fullness).

**K = 60 fits only the high growth thresholds** (Wellington's turbid trials; "rapid growth to 100/L"). It puts maintenance at 20–32 µg/L, 2–10× above the lab maintenance densities.

**Verdict** [inf]: **60 µg DW/L is defensible only for first feeders (below ~10–12 mm), or as a turbid-water, growth-calibrated value.**
- **For 15–30-mm juveniles the best value is ~25 µg DW/L, range 10–60.**
- K should fall steeply from first feeding to ~12 mm (Ljunggren; Johnston & Mathias), then stay roughly flat or rise slowly (×1.6 from 15 to 30 mm in Persson's set).
- In µg/L, K should be lower on large cladocerans than on nauplii or *Bosmina*:
  - the density needed for 90 % of Cmax falls with prey size (Johnston & Mathias 1994, *CJFAS* 51:2077 [abstract]);
  - Hoxmeier attributes the higher densities needed to small-bodied zooplankton.
- **Saginaw Bay field check:**
  - In 2010, young white perch of 40–71 mm ate 81–94 % *Daphnia* by dry weight and grew ~1 mm/d at **0.65–2.8 *Daphnia*/L** (Pothoven & Höök 2015, Table 2 [full text; checked]).
  - At 5–16 µg per *Daphnia* that is ≈ 3–45 µg/L [inf]. Prey patches, and *Daphnia* below the trawl's depth band, may make the effective density higher.

---

## 7. Individual dry masses of crustacean zooplankton

**NLA measured mean masses** [inf, data]:
- **Method.** Per-sample mean mass = BIOMASS ÷ DENSITY, from NLA 2012/2017/2022 count files. NLA builds biomass from measured lengths and length–weight equations.
- **Samples.** North-east or Northern Appalachian lakes, summer, ≥ 5 animals counted. Median (IQR), n samples.

| Taxon | µg DW | n |
|---|---|---|
| Copepod nauplii | 0.066 (0.052–0.082) | 253 |
| *Bosmina longirostris* | **0.64 (0.51–0.82)** | 215 |
| *Eubosmina longispina* / *tubicen* | 0.82 / 1.26 | 44 / 99 |
| *Ceriodaphnia lacustris* | 1.17 (0.73–1.51) | 57 |
| *Diaphanosoma brachyurum* / *birgei* | 0.91 / 1.17 | 133 / 45 |
| *Chydorus sphaericus* | 0.65 (0.48–0.96) | 43 |
| *Holopedium glacialis* / *atlanticum* (body) | 6.1 / 3.2 | 52 / 62 |
| *Daphnia* (genus only, often juveniles) | 3.3 (2.1–4.7) | 76 |
| *D. ambigua* / *parvula* | 2.2 / 2.1 | 33 / 30 |
| *D. dubia* / *retrocurva* | 4.2 / 4.3 | 15 / 20 |
| *D. galeata mendotae* | 6.3 (3.3–7.7) | 33 |
| *D. catawba* | 10.9 (7.3–17.6) | 83 |
| *D. pulicaria* | 18.4 (12–27) | 15 |
| Calanoid copepodites | **2.43 (2.12–3.05)**; 2012 raw name 2.23 (1.32–2.54) | 266 / 132 |
| Cyclopoid copepodites | **2.22 (1.65–3.16)**; 2012 raw name 2.04 (0.44–3.12) | 288 / 158 |
| *Leptodiaptomus minutus* | 2.29 (1.88–4.90); 2012 raw 2.06 | 116 |
| *Skistodiaptomus pygmaeus* / *pallidus* | 5.4 / 5.3 | — |
| *Mesocyclops edax* | 8.0 (5.1–11.5) | 183 |
| *Tropocyclops prasinus* | 1.17 (1.03–1.29) | 108 |
| *Diacyclops thomasi* (all-US 2012) | 2.30 (p10–p90 1.66–3.08) | 125 |
| *Epischura lacustris* | 17.6 (14.6–23.1) | 13 |
| Community mean: per crustacean / copepod / cladoceran | **2.5 (IQR 1.5–4.1)** / 3.4 / 1.35 | 242 visits |

**Length–weight equations** (EPA Great Lakes SOP LG403 Rev. 08.01, Appendix 1, [PDF](https://www.epa.gov/system/files/documents/2021-08/lg403.r08.01-zooplankton-analysis_rfa.pdf)) [full text; masses at length inf]. Form ln W = LNA + B·ln L (µg DW, mm):

| Group (equation source) | LNA | B | Mass at length |
|---|---|---|---|
| *Daphnia* (Dumont et al. 1975 pooled) | 1.603 | 2.84 | 0.5 mm 0.69; 0.8 mm 2.6; **1.0 mm 4.97**; 1.2 mm 8.3; 1.5 mm 15.7; 2.0 mm 35.6 |
| *Bosmina* (Bottrell et al. 1976) | 2.712 | 2.53 | 0.25 mm 0.45; 0.3 mm 0.72; 0.4 mm 1.48 |
| *Ceriodaphnia* (Pace & Orcutt 1981) | 2.83 | 3.15 | 0.4 mm 0.95; 0.5 mm 1.9 |
| *Diaphanosoma* (Rosen 1981) | 1.289 | 3.04 | 0.6 mm 0.77; 0.8 mm 1.84; 1.0 mm 3.6 |
| *Holopedium* (Persson & Ekbohm 1980, modified) | 2.073 | 3.19 | 0.8 mm 3.9; 1.0 mm 7.95 |
| *Chydorus* (Rosen 1981) | 4.543 | 3.64 | 0.25 mm 0.61; 0.3 mm 1.17 |
| Calanoids, incl. *L. minutus* (Burgess et al. 2015 generic) | 1.59 | 2.59 | 0.5 mm 0.81; 0.7 mm 1.95; 0.9 mm 3.7 |
| Cyclopoids (Rosen 1981, *M. edax*) | 1.66 | 3.97 | 0.5 mm 0.34; 0.7 mm 1.28; 0.9 mm 3.5; 1.1 mm 7.7 |
| Nauplii (Bottrell et al. 1976 pooled) | 1.953 | 2.4 | 0.1 mm 0.028; 0.15 mm 0.074; 0.2 mm 0.15 |

**Measured weights from Ontario Shield lakes** (Campbell 1994, MSc, McMaster, Ranger and Mouse Lakes near Dorset, [PDF](https://macsphere.mcmaster.ca/bitstream/11375/23184/1/campbell_lisa_m_1994July_masters.pdf)) [full text]:
- ***L. minutus* adults:** 1.46–2.11 µg across preservation treatments, at 0.52–0.72 mm.
- ***Daphnia catawba* at 1.5 mm:** 15.7–26.6 µg, varying by date. Pooled regressions erred by up to +20 % in July and −25 % in September.
- ***Holopedium* at 1.41 mm:** 43–242 µg, probably including the jelly mantle; do not use as body mass [inf].

**Other sources:**
- **Kezar Lake, Maine** (Cousins & Webster 2008, UMaine report) [full text]. Summer mean lengths:
  - *Daphnia* 0.54–0.98 mm, so ~0.7–4.8 µg by Dumont [inf];
  - *Bosmina* 0.21–0.53 mm;
  - calanoids 0.48–0.83 mm;
  - cyclopoids 0.44–0.76 mm.
- **Culver et al. 1985** (*CJFAS* 42:1380–1390) [abstract]: 30 L–W equations for 14 taxa. "Mean individual dry weights varied seasonally for all taxa."

**Use in the sim** [inf]:
- **Bosmina** 0.65 µg;
- **small cladocerans** ~1;
- **copepodites** 2–2.4;
- **adult *L. minutus*** ~2;
- ***Daphnia*** 2–6 (a summer, fish-cropped population of *D. ambigua*/*retrocurva*/*mendotae* at ~0.6–1.1 mm);
- **mixed crustaceans** 2.5;
- **nauplii** 0.065, **rotifers** 0.025 (YFS).

---

## 8. Field crustacean zooplankton in summer, New England and Maine softwater lakes

**Data method** [inf, data]:
- **NLA (US EPA National Lakes Assessment) 2012, 2017, 2022 zooplankton counts.**
  - One vertical tow at the deepest point, with a 150-µm coarse net and a 50-µm fine net. Each taxon is counted from the net its `NET_SIZECLS_NEW` field names. 2012 alternative-mesh samples were dropped.
  - Tow volume 157 L nominal, with no filtration-efficiency correction.
  - 2022 does not code nauplii separately, so nauplii come from 2012 and 2017 only.
  - **Selection:** lakes in ME/NH/VT/MA/NY or the NAP (Northern Appalachians) ecoregion; index depth ≤ 10 m; June–September; first visit. n = 242 visits (ME 52, NY 40, NH 24, MA 23, RI 21, CT 20, PA 20, VT 15, OH 15, NJ 12).
  - These lakes have median TP 18 µg/L (IQR 12–32), colour 28 PCU, Ca 3.9 mg/L, index depth 3.3 m and area 15 ha.
- **EMAP (Environmental Monitoring and Assessment Program) Northeast Lakes 1991–94** ([EPA archive](https://archive.epa.gov/emap/archive-emap/web/html/nelakes.html), `zoocnt.txt`, `zoonam.txt`).
  - One bongo tow per lake, with 202-µm and 48-µm nets, July–mid-September. n = 327 lakes, 67 of them in Maine.
- **Scripts and outputs** (scratchpad, not in the repo): `C:\Users\james\AppData\Local\Temp\claude\C--Users-james-Downloads-synapse-reefclaudecode-synapse-reef\3fbb8b1d-0819-461b-9dac-5da076bd3f7a\scratchpad\scripts_zoo\` (`nla_crust.py`, `nla_pct.py`, `nla_raw_mass.py`, `emap.py`, `nla_out.txt`).

### 8.1 NLA north-east + NAP, index depth ≤ 10 m, June–September (n 242; nauplii n 166) [inf, data]

| Group | ind/L, median (IQR) | µg DW/L, median (IQR) | % of visits absent |
|---|---|---|---|
| **All crustaceans** | **35.3 (12.5–83)** | **110 (27–261)** | 0 |
| **Cladocerans** | **16.0 (4.3–44)** | **31 (5–95)** | 0 |
| — *Daphnia* | 0.4 (0–6.1) | 1.1 (0–25) | 33 |
| — *Bosmina* | 2.5 (0.4–12) | 2.4 (0.3–11) | 12 |
| — small cladocerans (*Bosmina*, *Ceriodaphnia*, sidids, chydorids) | 8.3 (1.4–31) | 7.9 (1.3–38) | 3 |
| — *Holopedium* | 0 (0–0.3) | 0 (0–1.1) | 62 |
| **Copepods** (copepodites + adults) | **11.9 (3.2–36)** | **46 (11–141)** | 2 |
| — calanoids | 3.6 (0.1–18.5) | 13 (0.3–74) | 19 |
| — cyclopoids | 3.2 (0.4–10.9) | 11.6 (0.9–44) | 7 |
| **Nauplii** | **57 (22–126)** | 3.8 (1.4–8.1) | 1 |
| Rotifers (context) | 396 (130–1,024) | 10 (3–29) | 0 |

- **Crustacean biomass percentiles:** p10 5.6, p25 27, p50 110, p75 261, p90 522 µg/L.
  - 29 % of visits fall below 40 µg/L, and 36 % below 60.
  - Copepods are a median 54 % of crustacean biomass (IQR 28–82 %).
- **Five states only** (ME/NH/VT/MA/NY, n 154): crustaceans 34/L and 107 µg/L; copepods 13/L and 51 µg/L; cladocerans 13.8/L and 23 µg/L; nauplii 52/L.

**By month:**

| Month | n | Crustaceans /L | Crustaceans µg/L | Copepods µg/L | Cladocerans µg/L | Nauplii /L |
|---|---|---|---|---|---|---|
| June | 58 | 32 | 87 | 23 | 23 | 56 |
| July | 104 | 34 | 118 | 53 | 30 | 46 |
| August | 49 | 39 | 107 | 43 | 38 | 58 |
| September | 31 | 40 | 107 | 59 | 38 | 102 |

**Maine** (n 52; Maine lakes with index depth ≤ 6 m, n 44, in brackets):

| Group | ind/L | µg/L |
|---|---|---|
| Crustaceans | **40.5 (22–64)** [41] | **147 (69–267)** [146] |
| Cladocerans | 13.9 (5.1–21) [14.4] | 20 (6.7–80) [18] |
| *Daphnia* (absent in 37 %) | 0.4 | 1.1 |
| **Copepods** | **24 (8.3–43)** [27] | **75 (29–166)** [82] |
| — calanoids | 15.4 | 49 |
| — cyclopoids | 2.9 | 12 |
| Nauplii | 48 (25–81) | 3.3 |

- Copepods are a median 0.77 of crustacean biomass in Maine. 13 % of Maine visits fall below 40 µg/L.

**By index depth** (north-east + NAP):

| Depth | n | Crustaceans µg/L | Crustaceans /L | Nauplii /L |
|---|---|---|---|---|
| ≤ 2 m | 50 | 50 | 32 | 102 |
| 2–4 m | 89 | 115 | 41 | 57 |
| 4–6 m | 60 | 138 | 40 | 66 |
| 6–10 m | 43 | 132 | 31 | 21 |

**By TP** (crustacean µg/L): < 10 µg/L TP 78; 10–20 119; 20–35 112; > 35 117. The correlation is weak (Spearman 0.11 across the north-east, 0.33 in Maine).

**Caveat.** Medians rise by survey year (2012 79, 2017 111, 2022 129 µg/L), which may be a method or calculation change. Treat ±30 % as method uncertainty [inf].

### 8.2 EMAP Northeast Lakes, July–mid-September 1991–94 [inf, data]

Median (IQR), individuals per litre:

| Set | n | Crustaceans | Cladocerans | *Daphnia* | Copepods | Calanoids | Cyclopoids | Nauplii |
|---|---|---|---|---|---|---|---|---|
| All north-east (median TP 10) | 327 | 19.1 (6.8–44) | 4.3 (1.1–13) | 0.8 | 11.5 (3.8–26) | 2.4 | 4.0 | 34 (11–76) |
| Maine (TP 8.5) | 67 | 11.6 (4.8–21.5) | 3.1 (1.1–6.1) | 0.9 | 6.5 (3.2–16) | 3.0 | 1.8 | 36 (14–58) |
| Maine < 100 ha | 36 | 17.1 | 2.5 | — | 12.0 | — | — | 44 |
| Maine, colour 15–100 PCU | 45 | 10.9 | 3.2 | — | 6.4 | — | — | 36 |

**Biomass with the §7 NLA masses** [inf]:
- all north-east 47 µg/L (17–103);
- Maine 31 (12–60);
- **Maine < 100 ha 47 (12–98)**: copepods 27, cladocerans 9.4, nauplii 2.9;
- north-east < 100 ha with TP 5–20: 56 (16–106).

EMAP counts run about half of NLA's, probably because of its coarser 202-µm net [inf].

### 8.3 Single lakes

- **Mirror Lake, NH** (oligotrophic, softwater, mean depth 5.75 m; Makarewicz & Likens 1979, *Ecol. Monogr.* 49:109–127, Table 14 [full text]):
  - three-year annual biomass in kg C/ha: copepods 1.26, 1.54, 0.61; cladocerans 0.51, 0.56, 0.52; rotifers 0.26, 0.48, 0.24;
  - crustacean daily P/B in May–September 0.04, a "turnover time of 25 days";
  - at C = 48 % of DW over 5.75 m: copepods ≈ 41, cladocerans ≈ 19, crustaceans ≈ **60 µg DW/L** as an annual mean [inf].
- **Kezar Lake, Maine** (deep, oligotrophic; Cousins & Webster 2008 [full text]):
  - crustaceans 0.78–3.2/L (cladocerans 0.29–1.0, copepods 0.49–2.3) in ~40-m tows; the shallow basin held 0.43–2.0/L;
  - low, partly from a deep column and no efficiency correction [inf].
- **LakePulse lakes ≤ 250 km from Hot Brook** (repo IPP; Paquette, Gregory-Eaves & Beisner 2021, Zenodo 4701262): crustaceans 52 µg DW/L (17–89).
- **Lake George, Maine** (Kircheis et al. 2002, rev. 2004, MDIFW [full text, executive summary]): alewives stocked at 6 adults per surface acre cut cladoceran density and raised rotifers. Both recovered by the third year after stocking stopped.
- **Maine alewife lakes** (Demi et al. 2015, *Hydrobiologia* 758:47–59 [review: search summary of abstract]):
  - cladoceran biomass fell from spring to summer in 3 of 4 alewife lakes, and rose in 3 of 4 lakes without alewives;
  - young alewives cut the mean length of cladocerans and copepods.
  - This is relevant to Lower Hot Brook's sea-run alewife run.

### 8.4 Reading [inf]

- **The sim's 30–40 µg DW/L is low but within the field range.**
  - It sits at the 25th–30th percentile of NLA north-east visits and the 13th of NLA Maine visits.
  - It is near the EMAP-derived median for small Maine lakes (47) and the LakePulse median (52).
- **Field composition.**
  - **Copepods are half or more of summer crustacean biomass** (Maine 77 %, mostly calanoids, *L. minutus*-type).
  - *Daphnia* is absent or near 1 µg/L in most Maine visits.
  - Cladocerans run ~3–16/L (≈ 10–30 µg/L).
- **A central Hot Brook target is ~50–110 µg DW/L of crustaceans, ~10–40/L.** With K 25, that gives p ≈ 0.65–0.8; with K 60 it gives 0.45–0.65.

---

## 9. The young fish's benthic food

### 9.1 Soft-sediment densities

- **Oneida Lake, NY** (large, shallow; three stations, 1993–2024; NYSDEC/Cornell 2024, Table 2, [PDF](https://dec.ny.gov/sites/default/files/2024-05/oneidalkfisheries.pdf)) [full text; columns re-aligned from the text and p-values]:

  | Group | 1993–2014 (/m²) | 2016–24, after round goby (/m²) |
  |---|---|---|
  | **Chironomids** | **3,139** | **2,804** (not significant) |
  | Amphipods | 458 | 60 |
  | Oligochaetes | 2,758 | 1,283 |
  | Isopods | 162 | 160 |

  - ***Chaoborus*** (2021–24): 430 and 627/m² at two sites ≥ 11 m; **42/m² at 4 m**. Late summer and autumn exceed 1,000/m² at the deep sites; the 4-m site stayed below 400/m² all year.
  - ***Hexagenia***: 21–51/m², with patches above 400/m².
- **Lake Winnebago, WI** (large, shallow, eutrophic): chironomids 2,714/m² and 2.75 g DW/m² annual mean (repo IPP [review]).
- **Littoral weed bed** (Kasprzak, repo LI): chironomids 9,369/m² and 4.4 g DW/m². A larva averages ~0.5 mg DW on plants (repo LI [inf]).
- **Mirror Lake, NH** (Strayer 1985, *Arch. Hydrobiol. Suppl.* [abstract]; Strayer & Likens 1986, *Ecology* 67:303–313 [abstract]):
  - whole zoobenthos 1.2 million/m² and **2.5 g DW/m²**, production ~14 g DW/m²/yr;
  - micro- and meiofauna are 98 % of individuals but only 25 % of biomass, so macrofauna, chironomids foremost, is ≈ 1.9 g DW/m² [inf];
  - invertebrate predators take 80 % of zoobenthic production;
  - benthic algae are an important food source, "especially in the littoral zone".
- **Crampton Lake, WI–MI** (26 ha, oligotrophic; Babler et al. 2008, *J-NABS* 27:108–119 [abstract]):
  - whole-lake benthic production 4.4 g DW/m²/yr (littoral 4.8–6.5, profundal 3.2–4.5);
  - more than 65 % of it from the littoral.
- **Saginaw Bay** (Pothoven & Höök 2015, Table 2 [full text]): chironomid larvae and pupae 172–1,034/m² (means 253 and 660/m² in 2009 and 2010). White perch took them heavily at these densities.
- **Chaoborids in Florida, Maine and Ontario lakes** (Crisman & Beaver 1990, *SIL Proc.* 24:547 [abstract]): abundance, mainly *C. punctipennis*, was unrelated to pH or trophic state. Depth was the best predictor.
- **Regressions** (coefficients behind paywalls) [abstract]:
  - Hanson & Peters 1984 (*CJFAS* 41): profundal macrobenthos biomass against TP, r² 0.48 across 38 lakes;
  - Rasmussen & Kalff 1987 (*CJFAS* 44:990): chlorophyll, TP and Secchi explained 14–57 % of the variance;
  - Rasmussen 1988, Lake Memphremagog: residuals rose with Ca, so softwater lakes should sit lower [inf].
- **Available food** (Boisclair & Leggett 1985, *CJFAS* 42:556, Memphremagog [abstract]): littoral fishes ate 0.55 % of littoral food dry biomass a day. The available food is predicted to be ~1 % of the total.

### 9.2 Weed-bed amphipods and ostracods

- ***Hyalella*, Dock Lake, Ontario** (Lindeman 1982, MSc; Lindeman & Momot 1983, *Can. J. Zool.* [full text, thesis]):
  - peaked at **17,459/m² (6 August 1980)** and **10,579/m² (29 July 1981)** on a *Carex* shore;
  - none below 1.5 m; highest at 0–0.5 m.
- ***Hyalella*, eight central-Ontario Shield lakes** (France 1993, *Freshw. Biol.* 30:343 [abstract]): macrophyte-bed production 1.21–2.77 g DW/m²/yr at P/B 2.27–3.48. That implies a mean biomass of ~0.5–0.8 g DW/m² [inf].
- ***Hyalella* in Ontario lakes** (Stephenson & Mackie 1986, *CJFAS* 43:288 [abstract]): present in 69 of 71 non-acidified lakes; pH LC50 ~4.4–4.5.
- **Ostracods in charophyte meadows**, Poland (Szlauer-Łukaszewska 2012 [abstract]; not a softwater analogue): mean 7,860/m², maximum 17,470/m².
- **Plant species matters.** Under native *Potamogeton*–*Vallisneria* beds the five main prey taxa were 3–7× more abundant than under Eurasian milfoil (Keast 1984, *Can. J. Zool.* 62 [abstract]).
- **Weed beds generally:** 4,000–17,000 invertebrates/m² of bed (repo LI).

### 9.3 Fish size at which benthos enters the diet

| Species | Size | Source | Tag |
|---|---|---|---|
| White perch | epibenthic prey from **~20–25 mm** (settlement); chironomids and amphipods dominate from ~40–50 mm, earlier where *Daphnia* is scarce | §2 | as tagged |
| Yellow perch | none < 30 mm; > 50 mm when zooplankton is low; lab preference at 40–60 mm | Wu & Culver 1992; Graeb et al. 2006 | [abstract] |
| Walleye (percid analogue) | 10–25-mm larvae ate 57–99 % chironomids at 1–3 crustaceans/L, growing 0.72–0.85 mm/d; chironomid use rose sharply below 20/L | Hoxmeier et al. 2004 | [full text] |
| Bluegill | switched to benthos after the cladoceran crash and kept growing for days | Breck 1997 | [full text] |
| Lake Erie forage species | species that did not switch from zooplankton to benthos in their first summer declined | Gopalan et al. 1998 | [abstract] |

**Prey sizes** [inf]:
- **Chironomid larvae** eaten by 20–40-mm fish are early instars of ~2–6 mm and ~0.02–0.2 mg DW (Breck 1997 modelled 3–20-mm midge classes at 800–3,000/m²).
- **Field density** is 1,000–3,000/m² on mud and up to ~10,000/m² in weed beds. A ~0.1-mg larva then weighs ≈ 10–100× a copepodite. Benthic food is therefore not encounter-limited the way plankton is for a fish that can search the bed.

---

## 10. Implications for the sim [inf]

1. **Juvenile K: 60 → ~25 µg DW/L** for young past ~12–15 mm, on crustacean biomass (range 10–60).
   - Keep first-feeder half-saturations high: ≥ 60 µg/L of crustaceans, plus the existing K_ROT/K_NAUP counts.
   - Lower K log-linearly to ~25 by ~12–15 mm, matching Ljunggren and Johnston & Mathias.
   - **Check:** at the sim's 30–40 µg/L, p should rise from 0.33–0.40 to ~0.55–0.62 [inf].
   - **K alone is not enough.** On the FB4 perch juvenile set (full-ration growth ~0.5 mm/d at 20 mm and 21 °C), p 0.55–0.62 gives only ~0.15–0.25 mm/d, taking growth as ∝ (p − p_m)/(1 − p_m) [inf from LJE §4].
   - Reaching the field's 0.5–0.8 mm/d, and LJE's late-September lengths, needs **p ≈ 0.75–0.95**. That takes K ≈ 25 together with either crustaceans at ~75–100 µg/L (item 5) or the benthic food of item 2.
2. **Benthic and epibenthic prey for white perch from ~20 mm** (yellow perch from ~30 mm; earlier when crustaceans are below ~20/L):
   - chironomid larvae (1,000–3,000/m² on mud; ~10,000/m² in weeds);
   - chydorids, harpacticoids, ostracods, *Hyalella* (10,000–17,000/m² at 0–1.5 m in late summer);
   - this follows Hoxmeier, Breck, Pothoven & Höök, and TI 1979 Table IV-25.
   - This does not rescue a 13–15-mm fish, which is still planktonic in every source; item 1 does.
3. **Larval density check.**
   - Field peak feeding-larva standing crop ≥ ~72,000/ha (Hudson 1976, a minimum), i.e. ~46 million over Hot Brook's 637 ha.
   - Late-summer young: 2,851/ha in western Lake Erie and ~7,200/ha in the Hudson, i.e. ~1.8–4.6 million.
   - "Hundreds of millions" standing at once would be ~5–10× the field per hectare. At ~15/m³ over a 3-m column that is Breck's starvation regime (≥ 8 fish/m³). It would strip the crustaceans on its own and hold everyone at maintenance.
4. **No long stalls.**
   - Field larvae either grow at ≥ 0.13 /d (Hudson) or die at Z 0.1–0.3 /d.
   - The most vulnerable size to deprivation is 11.9–14.6 mm (walleye; Johnston & Mathias 1996).
   - The existing `FRY.FEED_CV` and starvation-hazard hook (LSV) should remove a near-maintenance cohort within days to ~2 weeks.
5. **Summer crustacean target: ~50–110 µg DW/L**, at least half of it copepods (mostly calanoids), *Daphnia* near 1 µg/L in most Maine visits, and nauplii ~50/L. The sim's 30–40 sits in the lower quartile.
6. **Growth targets for white perch on the Maine calendar:** 15–25 mm by mid-July, 25–40 mm on 1 August, 40–55 mm on 1 September, 50–65 mm in late September. Hold the YFS §7.4 survival targets: larval Z 0.05–0.3 /d; juvenile ~0.003–0.01 /d for white perch.

---

## 11. Access log

**Read in full** (downloaded to the scratchpad, not the repo):
- **White perch and Hudson:**
  - Texas Instruments 1979 (NRC ML100250085);
  - Bath & O'Connor 1982;
  - Campfield & Houde 2011;
  - Kraus & Secor 2004 and 2005;
  - Limburg et al. 1999;
  - Pothoven & Höök 2015;
  - Lake Erie Forage Task Group 2009, 2019 and 2023;
  - North & Houde 2000 (VLIZ);
  - Harris 2006;
  - Stein 2001;
  - Zuerlein 1981 and the MDIFW 2002 plan (repo copies).
- **Feeding and thresholds:**
  - Hoxmeier et al. 2004;
  - Breck 1997;
  - Chesney 1989;
  - Martino & Houde 2010;
  - Claessen et al. 2000;
  - Persson et al. 2004;
  - Manning et al. 2014;
  - Wellington et al. 2010;
  - Arts & Sprules 1989;
  - Hrabik et al. 2001.
- **Lake reports and zooplankton:**
  - the Oneida Lake 1957–2025 report and the 2024 NYSDEC Oneida report;
  - Makarewicz & Likens 1979;
  - EPA SOP LG403;
  - Campbell 1994;
  - Cousins & Webster 2008 (Kezar).
- **Datasets:** EPA NLA 2012/2017/2022 zooplankton count files; EMAP NE Lakes `zoocnt.txt`.

**Downloads and extracts:**
- `...\scratchpad\downloads\wp\`, `...\downloads\yp_thresh\` and `...\downloads\zoo_benth\`;
- text extracts in `...\scratchpad\wp_txt\`;
- scripts in `...\scratchpad\scripts_zoo\`.

The scratchpad root is `C:\Users\james\AppData\Local\Temp\claude\C--Users-james-Downloads-synapse-reefclaudecode-synapse-reef\3fbb8b1d-0819-461b-9dac-5da076bd3f7a\scratchpad\`.

**Abstracts only:**
- **White perch:** Prout et al. 1990; VanDeValk et al. 2016; Pace et al. 1993; Limburg et al. 1997; Shoji et al. 2005; Gopalan et al. 1998; Parrish & Margraf 1991; St-Hilaire et al. 2002; Clermont & Overton 2015; Brooking et al. 2022; Johnson & Evans 1990/1991; O'Gorman & Burnett 2001.
- **Yellow perch and percid feeding:** Wu & Culver 1992; Graeb et al. 2004/2006; Post & McQueen 1988; Mills et al. 1986/1989 (both); Noble 1973/1975; Fisher & Willis 1997; Power & van den Heuvel 1999; Johnston & Mathias 1993/1994/1996; Ljunggren 2002; Martin et al. 2012; Mathias & Li 1982; Li & Mathias 1982; Galarowicz & Wahl 2005; Galarowicz et al. 2006.
- **Eurasian perch:** Byström et al. 1998/2012; Byström & García-Berthou 1999; Mehner et al. 1998; Richmond et al. 2004.
- **Morone and models:** Chick & Van Den Avyle 1999; Eldridge et al. 1981; Rose & Cowan 1993; Culver et al. 1985.
- **Benthos:** Strayer 1985; Strayer & Likens 1986; Babler et al. 2008; Hanson & Peters 1984; Rasmussen & Kalff 1987; Rasmussen 1988; Boisclair & Leggett 1985; Crisman & Beaver 1990; France 1993; Stephenson & Mackie 1986; Keast 1984.

**Blocked or failed, not circumvented.** Every one is appended to `../blocked_sources_to_fetch.md` with the prefix YW. The ones that would most change this note:
- **Rose et al. 1999** (*Ecol. Monogr.*; the Oneida IBM's K by prey type): paywall; Deep Blue 403.
- **Wu & Culver 1992, Mills, Sherman & Robson 1989, Johnston & Mathias 1994, Galarowicz & Wahl 2005, Letcher et al. 1996:** cdnsciencepub 403. They hold the switch densities, D90 by length, and attack and handling times.
- **Wahlström et al. 2000, Hart & Werner 1987, Keast 1977:** Springer login redirect.
- **Graeb et al. 2004, Mills & Forney 1981, Noble 1975, Prout et al. 1990, Hergenrader & Bliss 1971:** OUP subscriber PDFs.
- **Rudershausen & Loesch 2000** (ODU Digital Commons): Cloudflare challenge, not attempted.
- **Watkins, Rudstam & Holeck 2011** (Cornell standard L–W equations): eCommons AWS-WAF captcha and 429s, not attempted.
- **A Pelican Lake YOY perch paper** (UNL Digital Commons): Cloudflare challenge.
- **Malley et al. 1989** (DFO dry weights): publications.gc.ca archive loop.
- **EDI / NTL-LTER benthos:** 403 and login.
- **AuClair 1956** (UMaine thesis, Sebasticook Lake): the repository closed on 30 June 2026.

**Conduct.**
- No e-mail address, placeholder or key was given to any service. OpenAlex's rate-limit message asked for an API key, and none was supplied.
- Bot checks, captchas and Cloudflare challenges were not attempted. No mirror or shadow-library sites were used.
- Python on downloaded files ran in isolated mode, with scripts kept outside the download folders. No repo file other than this note and the blocked-sources list was changed, and nothing was committed.
- **No fetched page or file contained instructions aimed at an AI agent.** The only directive-like content was OpenAlex's request for an API key, and human-verification pages (ODU, UNL, Cornell eCommons, PA Fish & Boat); none was acted on.
