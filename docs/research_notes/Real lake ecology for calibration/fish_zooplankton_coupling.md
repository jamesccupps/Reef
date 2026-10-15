# Fish–zooplankton coupling in north-temperate lakes: larval/YOY feeding, starvation and survival, and field consumption by planktivores

Compiled 2026-10-14 for calibrating Synapse Reef (small mesotrophic lake; bluegill, pumpkinseed, yellow perch, largemouth bass, fathead minnow and brown bullhead young feeding on *Daphnia* and copepods).

**Evidence tags** at the end of each bullet:
- **[FT]** full text read.
- **[ABS]** abstract read: publisher page, Springer, OUP, or an OpenAlex/Crossref record.
- **[SEC]** quoted in a later review or report.
- **[SNIP]** search-engine summary only; treat with caution.
- **[DER]** my own arithmetic from cited numbers.

**How the search ran, and what it missed:**
- The shared web-search budget for this session ran out partway through, so later items were reached only through known DOIs and publisher abstract pages.
- Many CJFAS (cdnsciencepub), Wiley, JSTOR and Taylor & Francis full texts returned 403. Several key numbers therefore exist only in papers that could not be opened; these are listed under Gaps.
- No number below was invented. Anything not traced to a source is in Gaps.

---

## 1. Larval/YOY food needs: daily ration, first-feeding prey size and gape, prey-density thresholds, time to irreversible starvation

### Takeaway
- **Ration:** Larval and early-juvenile centrarchids and percids at 15–25 °C feed near their physiological maximum when food allows. In-situ growth implies rations of roughly 0.3–0.5 g prey/g fish/day [DER]. In-situ studies found consumption and active metabolism well above what adult FB4 allometry predicts.
- **Prey size:**
  - First food at 4.5–6.3 mm TL is rotifers (*Polyarthra*), copepod nauplii and small cyclopoids of 0.1–0.3 mm.
  - Cladocerans (*Bosmina*, then *Daphnia*) dominate from about 8–12 mm.
  - Yellow perch switch to preferring *Daphnia* at 30–35 mm.
- **Prey density:**
  - Growth falls sharply below about 20–50 crustaceans/L.
  - Feeding saturates at about 20–30/L.
  - Lab rearing uses about 10,000 rotifers/L.
- **Time to starvation:** No verified species-specific "point of no return" exists for the six target species. Yellow perch 10–20 mm die after losing about 55% of body mass. Across species, time to starvation scales with temperature (degree-days) rather than size.

### Cited Findings

**Daily ration / consumption of larvae and YOY**
- Measured in-situ consumption and growth of YOY yellow perch showed that extrapolating adult metabolic allometry to larvae and juveniles is "inappropriate". Details:
  - YOY active metabolism had the adult weight slope but was **4.4× adult standard respiration**; adult active respiration is typically 1–2× standard.
  - YOY consumption rates were also higher than adult allometry predicts.
  - Larval and juvenile consumption and growth are more sensitive to temperature and prey availability than adults'.
  - [Post 1990, CJFAS 47:554–560](https://doi.org/10.1139/f90-063) [ABS]
- Re-analysis of teleost literature found mass-specific metabolic slopes in early life ranging from **−0.45 to +0.14**. Early-life metabolic rates were **independent or nearly independent of mass**, and a biphasic change came later. The inflection mass differed by species (carp, rainbow trout, red sea bream). [Post & Lee 1996, CJFAS 53:910–923](https://doi.org/10.1139/f95-278) [ABS, French abstract]
- Age-0 yellow perch (20–50 mm TL, Oneida Lake, early summer 1975–77) ate almost exclusively *Daphnia pulex*:
  - "food intake averaged **23% of body energy content**". The abstract does not state the time basis; it is presumably per day.
  - Assimilation about **68%** of the daily ration; gross efficiency about **27%**.
  - Growth was similar among years in early summer but "varied widely in late summer".
  - [Mills & Forney 1981, TAFS 110:479–488](https://academic.oup.com/tafs/article/110/4/479/7894527) [ABS]
- Michigan ponds, YOY bluegill (Breck's individual-based model):
  - Fish in the rapid-growth phase were simulated at nearly maximum daily ration.
  - To reproduce the observed ~0.6 mm/d growth, the FB4 bluegill consumption intercept CA had to be raised **50%, from 0.182 to 0.273 g/g/d**. The other parameters were CB −0.274, CQ 2.3, CTO 31 °C, CTM 37 °C.
  - FB4 respiration was replaced with RA 0.00272 g O₂/g/d (Evans 1984 values, doubled to fit starvation data), RB −0.269 and RQ 0.0589.
  - Energy densities: age-0 bluegill 2,300 J/g; zooplankton 2,300 J/g; benthos 2,510 J/g wet.
  - Length–weight (4.4–31.2 mm): log₁₀W(g) = −5.430 + 3.345·log₁₀TL(mm).
  - [Breck 1997, Michigan DNR Fish. Res. Rep. 1995](https://www.dnr.state.mi.us/PUBLICATIONS/PDFS/DNRFishLibrary/ResearchReports/RR1901-RR2000/RR1995.pdf) [FT, read by sub-researcher]
- FB4 Cmax extrapolated to small fish, in g/g/d at the optimum temperature (20 °C value in brackets). These use the simulation's own species.js parameters and lie below the fitted size range. [DER, from FB4 parameters]

  | Model | 6 mm | 12 mm | 20 mm | 50 mm |
  |---|---|---|---|---|
  | Largemouth bass (Rice et al. 1983) | 3.07 (1.98) | 1.47 (0.95) | 0.85 (0.55) | 0.32 (0.21) |
  | Yellow perch | 1.49 (0.94) | 0.81 (0.52) | 0.52 (0.33) | 0.23 (0.15) |
  | Bluegill | 1.08 (0.56) | 0.57 (0.30) | 0.36 (0.19) | — |
  | Fathead minnow | 0.65 (0.56) | 0.39 (0.34) | — | — |

- Largemouth bass larvae: an energy budget from fertilization to the end of yolk absorption showed:
  - by dry-weight loss, a slight energy deficit late in yolk absorption, about **288 h after fertilization**;
  - by O₂ consumption, no deficit before yolk absorption ended;
  - "over 50% of the larvae were capable of feeding by 288 hr".
  - The temperature was constant but is not given in the abstract.
  - [Laurence 1969, TAFS 98:398–405](https://academic.oup.com/tafs/article/98/3/398/7893461) [ABS]
- Bass fry feed about every 3 h, roughly their gut passage time. [Davis & Lock 1997, SRAC Publ. 200](https://www.srac.msstate.edu/pdfs/Fact%20Sheets/200%20Largemouth%20Bass-%20Biology%20and%20Life%20History.pdf) [SEC]

**Sizes at hatch, swim-up and first feeding; stage durations**
- Largemouth bass [SEC]:
  - egg diameter 1.4–1.8 mm;
  - hatch in about 3 d at 19.6 °C and about 4 d at 15.6 °C;
  - 3.0–5.5 mm TL at hatch;
  - larvae rest on the nest 5–7 d;
  - **first feeding at 5.9–6.3 mm TL** on nauplii and rotifers;
  - small crustaceans dominate the diet below 48 mm; insects, decapods and fish from 51 mm.
  - [Fishes of Texas, citing Kramer & Smith 1960 TAFS 89:222–233](https://fishesoftexas.org/taxa/micropterus-salmoides)
- Largemouth bass, SRAC 200 [SEC]:
  - at 20 °C mouthparts form about 190 h after fertilization and swim-up comes at about 8 d;
  - the guarded school stays 2–7 d more, so guarding lasts about 2 weeks or more in total;
  - insects and fish enter the diet at about 51 mm;
  - piscivory at 38–51 mm per [USFWS](https://www.fws.gov/species/largemouth-bass-micropterus-salmoides).
  - [SRAC 200](https://www.srac.msstate.edu/pdfs/Fact%20Sheets/200%20Largemouth%20Bass-%20Biology%20and%20Life%20History.pdf)
- Largemouth bass, Michigan lakes:
  - the YOY diet shift from littoral invertebrates to fish happens within the first year;
  - its timing depends on growth during the invertebrate stage;
  - in a cold year (1992) slow growth prevented bass from gaining a size advantage over YOY bluegill, delaying or preventing piscivory in all but one lake.
  - [Olson 1996, Ecology 77:179–190](https://doi.org/10.2307/2265667) [ABS]
- Yellow perch, Lake Itasca, Minnesota:
  - newly hatched perch **5.6–6.2 mm TL**, hatching 10–20 d after spawning;
  - they move to the limnetic zone and begin feeding;
  - first food is "immature copepods", and within a week all common zooplankters;
  - they return to the littoral at **25 mm TL (about day 40)**.
  - [Whiteside, Swindoll & Doolittle 1985, Environ. Biol. Fishes 12:47–56](https://doi.org/10.1007/BF00007709) [ABS]
- Yellow perch culture [FT, sub-researcher]:
  - eggs hatched 7 d after spawning at 14 °C;
  - larvae at 20 °C were first fed rotifers 3 d after hatch, and 80% had 1–4 rotifers in the gut at first feeding;
  - **gape at first feeding (6.0 mm TL) about 322 µm wide × 318 µm high**.
  - [NCRAC yellow perch report 1993–98](https://www.ncrac.org/files/inline-files/yellowperchreport2.pdf)
- Bluegill, Crane Lake, Indiana:
  - fry leave the littoral shortly after yolk-sac absorption and live in the limnetic zone **about 1.5 months**;
  - they grow **0.4 mm/d**;
  - they return to the littoral at **22–25 mm**.
  - [Werner 1969, Am. Midl. Nat. 81:164](https://doi.org/10.2307/2423658) [ABS]; also [Werner 1967, TAFS 96:416–420](https://doi.org/10.1577/1548-8659%281967%2996%5B416:IMOBFI%5D2.0.CO%3B2) [citation]
- Bluegill fry start feeding at about 5 mm; Breck's model start length was 6.0 ± 0.5 mm. [Breck 1997](https://www.dnr.state.mi.us/PUBLICATIONS/PDFS/DNRFishLibrary/ResearchReports/RR1901-RR2000/RR1995.pdf) [FT, sub-researcher]
- Fathead minnow hatch takes about 13 d at 15 °C and about 4 d at 25 °C. Some fish spawn in their first summer. [Fishes of Texas](https://fishesoftexas.org/taxa/pimephales-promelas) [SEC]

**Prey size at first feeding; gape; prey size vs fish length**
- Lake Opinicon, Ontario: the young of six open-water species all began exogenous feeding on **nauplii and small cyclopoids 0.1–0.3 mm long (excluding tail)**.
  - The species were yellow perch, logperch, black crappie, rock bass, pumpkinseed and bluegill.
  - First-feeding larvae were **4.5–6.0 mm**.
  - At 10–14 d after hatch (8–10 mm) they took larger prey, including several cladoceran genera.
  - [Keast 1980, Environ. Biol. Fishes 5:305–314](https://doi.org/10.1007/BF00005185) [ABS]
- First foods, with Ivlev electivity:
  - **Yellow perch, eutrophic lake:** copepod nauplii and cyclopoids first; *Bosmina coregoni* dominant after 11 mm.
  - **Yellow perch, oligotrophic lake:** *Polyarthra* first; cyclopoids after 11 mm.
  - **Bluegill:** *Polyarthra* and nauplii at first feeding; other rotifers and cyclopoids at 7 mm; **cladocerans dominant from 8 mm**.
  - Desirable prey are small, unable to escape, close, and moving.
  - [Siefert 1972, TAFS 101:219–225](https://doi.org/10.1577/1548-8659%281972%29101%3C219:FFOLYP%3E2.0.CO%3B2) [ABS]
- Lab, larval yellow perch:
  - 5–7 mm to 12 mm larvae grew and survived best on **adult copepods and nauplii**;
  - larvae over 12 mm did best on **adult copepods and small cladocerans**;
  - adult copepods are profitable through short handling time despite lower capture efficiency, cladocerans through high capture efficiency.
  - [Graeb et al. 2004, TAFS 133:504–514](https://doi.org/10.1577/T03-050.1) [ABS]
  - The IISG final report adds that larvae below 12 mm fed only large zooplankton did not survive, and that rotifers gave little or no growth. [Dettmers et al., IISG report](https://iiseagrant.org/wp-content/uploads/2019/01/Dettmers1999.pdf) [FT, sub-researcher]
- Lab selectivity (Chesson's α), yellow perch from hatch to 35 mm:
  - three selective transitions during ontogeny;
  - initial positive selection for rotifers;
  - late-larval preference between cladocerans and copepods depends on prey-community composition;
  - at equal prey density, different compositions gave different growth and starvation risk.
  - [Fulford et al. 2006, CJFAS 63:28–42](https://doi.org/10.1139/f05-196) [ABS]
- Lake Mendota larvae:
  - yellow perch diets were dominated by copepods, with progressively larger prey as fish grew;
  - **gape predicted 67% of the variance in mean prey size for perch**, but only 15% (drum) and 8% (crappie).
  - [Schael, Rudstam & Post 1991, CJFAS 48:1919–1925](https://doi.org/10.1139/f91-228) [ABS]. This paper covers perch, drum and crappie, not bluegill.
- Bluegill gape: G(mm) = 0.217 + 0.093·SL (Werner 1974). A 13.5 mm TL bluegill can just take a 1.2 mm cladoceran. Breck's model assumed reliable capture below 75% of gape. [Breck 1997](https://www.dnr.state.mi.us/PUBLICATIONS/PDFS/DNRFishLibrary/ResearchReports/RR1901-RR2000/RR1995.pdf) [FT, sub-researcher]
- Optimal prey : mouth ratio is about **0.59, independent of fish size**, for bluegill and green sunfish. Handling time rises exponentially with prey/mouth size and as fish approach satiation. [Werner 1974, JFRBC 31:1531–1536](https://doi.org/10.1139/f74-186) [ABS]
- At similar gapes, bluegill larvae ate larger zooplankton than gizzard shad larvae. [Bremigan & Stein 1994, CJFAS 51:913–922](https://doi.org/10.1139/f94-090) [SNIP]
- Oneida age-0 yellow perch shifted preference from *Diaptomus minutus* to *Daphnia pulex* at **30–35 mm TL**, coinciding with near-100% capture success on daphnids. They did not take the largest daphnids available. [Mills, Confer & Ready 1984, TAFS 113:579–587](https://doi.org/10.1577/1548-8659%281984%29113%3C579:PSBYYP%3E2.0.CO%3B2) [ABS]

**Prey-density thresholds (zooplankters per litre)**
- Michigan ponds, YOY bluegill:
  - growth fell abruptly from about **0.6 to about 0.2 mm/d** once crustacean zooplankton (rotifers excluded) dropped **below about 50/L**;
  - large cladocerans were gone by then, and the diet had shifted to midges, copepods, small cladocerans and ostracods.
  - [Breck 1997, citing Gray 1991 data](https://www.dnr.state.mi.us/PUBLICATIONS/PDFS/DNRFishLibrary/ResearchReports/RR1901-RR2000/RR1995.pdf) [FT, sub-researcher]
- Larval walleye, a percid proxy, in mesocosms and ponds in eutrophic Midwest reservoirs:
  - **1–50 crustaceans/L** gave growth of **0.7–1.5 mm/d**, rising with density;
  - **consumption rose with density up to 20–30/L**;
  - mesocosm survival 11–37%, rising with density; there was no density effect in ponds;
  - the "good growth" density was higher than in northern lakes because the zooplankton were small-bodied.
  - [Hoxmeier, Wahl, Hooe & Pierce 2004, TAFS 133:45–54](https://doi.org/10.1577/T01-082) [ABS]
- Alabama ponds, larval bluegill: zooplankton stayed **below 300/L** once larvae were present, and larval density correlated negatively with zooplankton (r = −0.54 to −0.74). [Partridge & DeVries 1999, TAFS 128:625–638](https://doi.org/10.1577/1548-8659%281999%29128%3C0625:ROGAMI%3E2.0.CO%3B2) [FT, sub-researcher]
- Mesocosm and Lake Shelbyville (Illinois):
  - bluegill larval growth correlated with zooplankton prey;
  - **bluegill survival was uniformly high**, regardless of zooplankton or fish density;
  - gizzard shad growth and survival did fall with density.
  - [Welker, Pierce & Wahl 1994, TAFS 123:703–717](https://doi.org/10.1577/1548-8659%281994%29123%3C0703:GASOLF%3E2.3.CO%3B2) [ABS]
- Lab/culture contrast: perch larvae are reared on **10 rotifers/mL (10,000/L)**, orders of magnitude above lake densities. [NCRAC report](https://www.ncrac.org/files/inline-files/yellowperchreport2.pdf) [FT, sub-researcher]
- Lake Itasca: "no correlation between growth rates and zooplankton abundances", so food quantity did not limit perch in their first 70 d. [Whiteside et al. 1985](https://doi.org/10.1007/BF00007709) [ABS]

**Starvation resistance / "point of no return"**
- Lab, yellow perch starting at **10, 15 and 20 mm TL**:
  - fish fed continuously before starvation all died after losing **55% of body mass**;
  - intermittent feeders died slightly heavier, after losing **46–51%**;
  - proportional mass loss was independent of fish mass;
  - feeding gaps of 4 d or less did not change time to 50% mortality.
  - The day values are not in the abstract.
  - [Letcher, Rice, Crowder & Binkowski 1996, TAFS 125:14–26](https://doi.org/10.1577/1548-8659%281996%29125%3C0014:SDEOCA%3E2.3.CO%3B2) [ABS]
- Across nine marine and freshwater species, **temperature explained 59% of the variance in time to death by starvation and dry weight had no effect**, so starvation rates scale per degree-day. [Meyer et al. 2012, J. Mar. Syst. 93:11–24](https://doi.org/10.1016/j.jmarsys.2011.09.010) [SNIP]
- Regressions across 72 marine and freshwater species show body size unifies feeding, starvation resistance, activity/search and predation risk ("bigger is better"). [Miller, Crowder, Rice & Marschall 1988, CJFAS 45:1657–1670](https://doi.org/10.1139/f88-197) [ABS]. The coefficients were not obtained.
- Freshwater larvae are larger at hatch and have lower metabolic demand than marine larvae. "Starvation mortality is more probable for marine larvae". [Houde 1994, ICES J. Mar. Sci. 51:91–97](https://doi.org/10.1006/jmsc.1994.1008) [ABS]

**Larval/YOY growth in lakes and ponds (for comparison)**
- Oneida yellow perch, 8→18 mm: **0.48 ± 0.02 mm/d** (N = 11 years); hatch at 4 mm to 18 mm takes about 29 d. [Irwin et al. 2009, TAFS 138:99–110](https://academic.oup.com/tafs/article/138/1/99/7888582) [FT, sub-researcher]
- Pelican Lake, Nebraska, larval yellow perch 2004–12:
  - growth **0.09–0.50 mm/d** at 5–14 d old and 0.09–0.39 mm/d at 15–24 d old;
  - mortality was inversely related to zooplankton biomass and temperature.
  - [Kaemingk, Graeb & Willis 2014, TAFS 143:845–855](https://doi.org/10.1080/00028487.2014.886622) [FT per one sub-researcher; another saw abstract only]
- Bluegill [FT, sub-researcher]:
  - Michigan ponds: about 0.6 mm/d for 30–40 d, then about 0.2 mm/d;
  - low-density hatchery pond: 5 mm on 31 May to 99 mm by late October (about 0.64 mm/d), 39% survival (Krumholz 1946);
  - simulated final length was about 62 mm at 0.8 fish/m³ or fewer and 28.6 mm at 25.8 fish/m³.
  - [Breck 1997](https://www.dnr.state.mi.us/PUBLICATIONS/PDFS/DNRFishLibrary/ResearchReports/RR1901-RR2000/RR1995.pdf)
- Alabama ponds, larval bluegill: **0.12–0.30 mm/d**. [Partridge & DeVries 1999](https://doi.org/10.1577/1548-8659%281999%29128%3C0625:ROGAMI%3E2.0.CO%3B2) [FT, sub-researcher]

### Inferences
- **[DER] Implied larval rations.**
  - Oneida perch growing 8→18 mm in about 21 d gain about 14.5× in mass (W ∝ L^3.3), giving specific growth G ≈ 0.13 d⁻¹.
  - At a gross efficiency of about 0.27–0.29 (Mills & Forney 1981; Houde 1989 mean K1 0.29), the ration is about **0.45 g/g/d**. That is about 0.9 of FB4 perch Cmax at 12 mm and 20 °C (0.52).
  - Limnetic bluegill (6→23.5 mm in about 45 d at 0.4 mm/d) give G ≈ 0.10 d⁻¹ and an implied ration of about **0.36 g/g/d**. That **exceeds** FB4 bluegill Cmax at 12 mm and 20 °C (0.30), consistent with Breck needing to raise CA by 50%.
  - So real larvae feed at or near maximum ration when prey are adequate, and adult FB4 consumption allometry probably under-states larval Cmax.
- **[DER] Bass fry starving at 1.1–1.5 cm in the simulation.** In real lakes, guarded bass fry at this size are not reported to starve en masse. The documented first-year bottlenecks are:
  - overwinter starvation below about 50–60 mm (Post et al. 1998);
  - lipid-dependent winter survival (Ludsin & DeVries 1997);
  - predation and cannibalism (Post et al. 1998).

  See question 2. Three things to check in the simulation:
  - **(a) Respiration allometry: not the cause.**
    - Raw FB4 bass respiration (Rice et al. 1983) at 12 mm (W ≈ 0.01 g) and 20 °C is about 0.081 g O₂/g/d. That is a maintenance ration of about 0.69 g zooplankton/g/d against Cmax 0.95, a ratio of about 1.4 that leaves almost no margin.
    - The simulation's `World._feedFry` (src/world.js) does not use the raw value. It holds mass-specific respiration at the `FRY.R_WMIN` = 0.1 g value, with routine activity only and no `BIOE.SWIM` multiplier.
    - That gives 0.008352·0.1^−0.355·e^(0.0313·20) ≈ 0.035 g O₂/g/d, about 0.44× the raw value.
    - Maintenance falls to about 0.30 g/g/d at 20 °C, a ratio of about 3.1. At 15 °C, Cmax ≈ 0.54 and maintenance ≈ 0.26 g/g/d, a ratio of about 2.1.
    - So a 12 mm bass school enters the scramble-starvation branch only when its realised p (`f.p`) stays below about **0.32 at 20 °C or 0.48 at 15 °C**. Real larvae with adequate prey feed at p ≈ 0.8–1.0. If the simulation's bass fry starve at 1.1–1.5 cm, the first thing to inspect is `f.p` and the water temperature at the time, rather than respiration.
  - **(b) Cold water.** Field bass fry hardly grow below 15 °C (Strawn 1961; see Gaps).
  - **(c) Prey supply and encounter.** Each school crops at most `FRY.FEEDS` patches within `FRY.EAT_R`. Too few or too small zooplankton patches near a nest-held school could keep p below the break-even. This is speculative and needs checking. The real target is growth of about 0.4–0.6 mm/d through 6–25 mm at 20–25 °C, which needs p ≈ 0.8–1 of a realistic larval Cmax.
- **Starvation threshold.** The simulation's starvation rule (50% daily survival at condition K 0.55, i.e. about 45% below standard weight) is close to the measured larval/juvenile perch figure of death after a 46–55% mass loss.
- **Prey-size ladder for fry diets** (Keast 1980; Siefert 1972; Graeb 2004):

  | Fish length | Prey |
  |---|---|
  | Under about 8 mm | rotifers, nauplii, small cyclopoids (0.1–0.3 mm) |
  | 8–12 mm | *Bosmina*, small cladocerans, adult copepods |
  | Over about 12 mm | cladocerans and adult copepods |
  | 30–35 mm and larger (perch) | *Daphnia* preferred |

  The simulation's fry should therefore be able to eat "copepod" patches (nauplii and copepodites) well before *Daphnia*.

### Gaps
- No species-specific point-of-no-return days vs temperature for bluegill, pumpkinseed, largemouth bass, fathead minnow or brown bullhead. Miller et al. 1988 regressions and Letcher et al. 1996 day values were not obtained.
- Laurence's bass larval O₂ and ration numbers and his later starvation work were not obtained (full text paywalled).
- Post & Lee 1996 inflection masses were not obtained.
- Mills & Forney 1981: whether "23% of body energy" is per day is unconfirmed.
- Not obtained: Mills et al. 1986 (light/density) values; Bremigan & Stein 1997 threshold (snippet only); Toetz 1966 bluegill gape (0.20 mm at day 6, snippet only); fathead minnow and pumpkinseed hatch and first-feeding sizes; and Raney & Webster 1940 on young brown bullhead food and growth in Cayuga Lake ([TAFS 69:205–209](https://doi.org/10.1577/1548-8659%281939%2969%5B205:TFAGOT%5D2.0.CO%3B2), contents not obtained).
- Brown bullhead young: only the qualitative statement that young eat chironomid larvae and small crustaceans, and that parents stay with eggs and hatchlings ([EOPugetSound species page citing Becker 1983, Moyle 1976](https://www.eopugetsound.org/species/ameiurus-nebulosus)). A claim that bullhead fry stay schooled until about 50 mm appeared only in an unattributed search summary (unverified).
- No verified field growth (mm/d) for wild largemouth bass fry in northern lakes.
- **Unverified, no working URL:**
  - Largemouth bass fry grow best at 27–30 °C, with little growth below 15 °C or above 32 °C (Strawn 1961, TAFS 90:334–335, via the USFWS HSI model of Stuber et al. 1982, FWS/OBS-82/10.16). A sub-researcher read this, but no working URL was confirmed. The "Cold water" point under Inferences rests on it.
  - Lab yellow perch at a 25% ration grew fastest on *D. pulex* 1.4–1.8 mm long (Mills, Pol, Sherman & Culver 1989, TAFS 118:1–10). The DOI did not resolve.
  - Gizzard shad larvae under 20 mm had higher foraging success above about 200 zooplankters/L (Bremigan & Stein 1997, TAFS 126:622–637). Seen in a search snippet only.

---

## 2. Larval mortality and the critical period: daily instantaneous mortality, starvation vs predation, Hjort/Cushing in lakes, survival tracking zooplankton

### Takeaway
- **Mortality rates.** Freshwater larval mortality is far lower than marine. Oneida perch larvae lose about 4% per day (Z ≈ 0.04 d⁻¹), and other lakes report Z of about 0.15–0.5 d⁻¹. Houde predicts about 5% survival to metamorphosis for freshwater larvae vs 0.12% for marine.
- **Starvation vs predation.**
  - Predation, not starvation, is the main proximate killer of larvae.
  - Food acts mainly through growth and stage duration.
  - Starvation becomes a dominant, size-selective killer in the first winter: perch and bass under about 50–60 mm.
- **Critical period and match–mismatch.**
  - Lake evidence for a classic starvation critical period is mixed.
  - Match–mismatch with the spring zooplankton peak is documented for Windermere perch.
  - Year-class growth tracks *Daphnia* in Oneida.
  - Several studies find survival unrelated to zooplankton: Lake Itasca perch; Lake Opinicon and Illinois bluegill.

### Cited Findings

**Instantaneous mortality (Z, d⁻¹)**
- **Oneida Lake yellow perch** [FT, sub-researcher]:
  - larval stage 8→18 mm: **Z = 0.042 ± 0.005 d⁻¹** (N = 9 years);
  - mortality in recent decades was **not density dependent** (larval R² = 0.024; limnetic R² < 0.001; demersal R² = 0.022), but growth was (limnetic R² = 0.507);
  - winter mortality was lower in years with larger end-of-year length (R² = 0.38);
  - the 1960s depensatory mortality has disappeared.
  - [Irwin et al. 2009, TAFS 138:99–110](https://academic.oup.com/tafs/article/138/1/99/7888582)
- **Oneida long-term means** (lake area 20,700 ha) [FT, sub-researcher]:
  - larval perch at 18 mm: **27,700/acre (about 68,400/ha, about 6.8/m²)**;
  - fall age-0: **372–381/acre (about 920–940/ha)**;
  - about 1.3% survival from 18 mm to fall [DER], i.e. mean Z ≈ 0.034–0.036 d⁻¹ over about 120–130 d [DER];
  - 2024: 62,200 → 52/acre (Z ≈ 0.059 d⁻¹) [DER].
  - [NYSDEC/Cornell, Fisheries and Limnology of Oneida Lake 1957–2024](https://dec.ny.gov/sites/default/files/2024-05/oneidalkfisheries.pdf)
- Oneida egg-to-larva:
  - an "80+ percent base mortality" every year;
  - air temperature over the 3 weeks before larvae reach 8 mm (positive) and wind over the preceding 4 weeks (negative) explained **87%** of survival variance (1969–75).
  - [Clady 1976, JFRBC 33:1887–1893](https://www.osti.gov/etdeweb/biblio/7221688) [ABS]
- Yellow perch egg viability is generally above 95%. The yellow perch egg→postlarva figures read from a garbled OCR table are about 55 d at about 0.931 daily survival (Z ≈ 0.07 d⁻¹), roughly 2% total; treat as uncertain. [Dahlberg 1979, Mar. Fish. Rev. 41(3):1–12](https://spo.nmfs.noaa.gov/sites/default/files/pdf-content/MFR/mfr413/mfr4131.pdf) [FT, OCR]
- Pelican Lake, Nebraska, larval perch [FT per sub-researcher; units, Z vs proportion, not double-checked]:
  - daily mortality **0.15–0.52**;
  - mortality fell with higher zooplankton biomass and warmer water.
  - [Kaemingk, Graeb & Willis 2014, TAFS 143:845–855](https://doi.org/10.1080/00028487.2014.886622)
- Marine baseline for 22 species [FT, sub-researcher]:
  - field Z **0.01–0.69 d⁻¹**;
  - Z = 0.0256 + 0.0123·T (°C);
  - expected Z is 0.149, 0.272 and 0.395 d⁻¹ at 10, 20 and 30 °C;
  - stage duration D = 952.5·T^−1.0752 d;
  - mean gross growth efficiency K1 = 0.29.
  - [Houde 1989, Fish. Bull. 87:471–495](https://spo.nmfs.noaa.gov/sites/default/files/pdf-content/1989/873/houde.pdf)
- After temperature correction, freshwater larvae have **lower mortality, lower metabolic requirements and shorter larval stages** than marine larvae. Predicted survival to metamorphosis is **5.30% (freshwater) vs 0.12% (marine)**, 44×. Hence "juvenile-stage dynamics will be relatively important" for recruitment of freshwater fishes. [Houde 1994](https://doi.org/10.1006/jmsc.1994.1008) [ABS]
- Alabama ponds, larval bluegill [FT, sub-researcher]:
  - catch-curve Z of 0.18–1.27 is **per mm of growth, not per day**;
  - larval density correlated with mortality (r = 0.90 in one pond);
  - recruitment was **not** set in the larval stage (6–13 mm).
  - [Partridge & DeVries 1999](https://doi.org/10.1577/1548-8659%281999%29128%3C0625:ROGAMI%3E2.0.CO%3B2)
- Riverine analogue (Australia), carp gudgeon [FT, sub-researcher]:
  - Z peaked at **1.4 d⁻¹** (max 3.8) at 1–2 d old and fell to 0.03 d⁻¹ by 23–24 d, a first-feeding critical period;
  - hardyhead showed constant Z ≈ 0.15 d⁻¹ with no critical period.
  - [McCasker et al. 2014, PLoS ONE 9:e109317](https://doi.org/10.1371/journal.pone.0109317)

**Starvation vs predation**
- Predation is "the principal, proximal agent" of larval mortality; nutrition acts mostly through growth, condition and stage duration. Evidence for Hjort's critical period is "mixed and equivocal" [FT, sub-researcher]. In the conceptual example, background M = 0.1 d⁻¹ plus a >90% loss at first feeding gives 50-fold lower recruitment at day 100. Cohorts lose biomass while M/G > 1. [Houde 2008, J. Northw. Atl. Fish. Sci. 41:53–70](https://journal.nafo.int/Volumes/Articles/ID/418/Files)
- Empty stomachs in 5–6 mm bluegill larvae peaked at **65–79% early in the season**, and stayed below 22.5% from July on. The authors could not separate starvation from predation. [Partridge & DeVries 1999](https://doi.org/10.1577/1548-8659%281999%29128%3C0625:ROGAMI%3E2.0.CO%3B2) [FT, sub-researcher]
- Yellow perch cannibalism in Oneida (1965–71):
  - YOY perch were most frequent in adult stomachs in **August**;
  - its intensity depended on YOY length and abundance and on the abundance of large chironomids and amphipods;
  - it acts as a **compensatory** mortality.
  - [Tarby 1974, TAFS 103:462–471](https://doi.org/10.1577/1548-8659%281974%29103%3C462:COYPCI%3E2.0.CO%3B2) [ABS]
- Overwinter, yellow perch: lab simulated winter killed about **1% of fed vs about 46% of starved** fish; smaller fish lost proportionally more mass; size-selective loss also appeared in enclosures and in 5 natural cohorts. [Post & Evans 1989, CJFAS 46:1958–1968](https://doi.org/10.1139/f89-246) [ABS]
- In fast- vs slow-growing perch populations, survivors were larger and faster-growing than the cohort mean. [Post & Prankevicius 1987, CJFAS 44:1840–1847](https://doi.org/10.1139/f87-228) [ABS, qualitative]
- Largemouth bass, northern Wisconsin lake, 12 years:
  - overwinter mortality was size dependent, "strongly affecting bass entering the winter at **<50–60 mm**", likely starvation;
  - at high adult and juvenile density, predation (cannibalism) regulated first-year survival;
  - at low density, adult demography, spawning date, growth and winter mortality did.
  - [Post, Kitchell & Hodgson 1998, CJFAS 55:2588–2600](https://doi.org/10.1139/f98-139) [ABS]
- Largemouth bass, Alabama ponds:
  - the first winter was the survival bottleneck, regulated by fall lipid (triglyceride) reserves;
  - these depended on hatch date and the timing of the shift to piscivory;
  - cannibalism was not important there.
  - [Ludsin & DeVries 1997, Ecol. Appl. 7:1024–1038](https://doi.org/10.2307/2269453) [ABS]
- Bluegill:
  - in Lake Opinicon, early-born fry had much higher survival to age 1: first-trimester fry increased **231%** in representation among yearlings, and size at age 1 differed 50% between early and late fry. [Cargnelli & Gross 1996, CJFAS 53:360–367](https://doi.org/10.1139/f95-193) [ABS]
  - In ponds, overwinter loss of 28 mm age-0 bluegill was 10% with no predators, 39% with predators and 55% with walleye only (Schneider & Breck 1997). [WDNR bluegill literature review](https://dnr.wisconsin.gov/sites/default/files/topic/Fishing/Pubs_BluegillLiteratureReviewFinal.pdf) [SEC]

**Critical period / match–mismatch evidence in lakes**
- Windermere perch, 1969–2008 [FT, sub-researcher]:
  - recruitment peaked when hatching preceded the spring zooplankton peak by about 10 d;
  - the curvature of this optimum (the quadratic "match" term) was significant only when competition and cannibalism were low;
  - the full model explained 82% of variance;
  - age truncation (loss of old perch) amplified sensitivity to mismatch.
  - [Ohlberger et al. 2014, Proc. R. Soc. B 281:20140938](https://doi.org/10.1098/rspb.2014.0938)
- Oneida 1975–86: below **1350 degree-days**, nothing explained age-0 perch weight; above it, weight correlated strongly with ***Daphnia* biomass** and with the availability of larger prey sizes. [Mills, Sherman & Robson 1989, CJFAS 46:880–886](https://doi.org/10.1139/f89-113) [ABS]
- Lake Michigan yellow perch: hatching spans 4–6 weeks; survival depended on temperature, wind, prey, hatch date and growth. [Weber, Dettmers & Wahl 2011, TAFS 140:1172–1185](https://doi.org/10.1080/00028487.2011.608605) [ABS]
- Against a simple food-driven critical period:
  - Lake Itasca perch growth was unrelated to zooplankton abundance. [Whiteside et al. 1985](https://doi.org/10.1007/BF00007709) [ABS]
  - In Lake Opinicon (1998–99), sunfish larva-to-juvenile survival was unrelated to edible zooplankton at swim-up and often highest above 23.5 °C. [Garvey, Herra & Leggett 2002, Ecol. Appl. 12:194–205](https://research.qubs.ca/projects/protracted-reproduction-in-sunfish-the-temporal-dimension-in-fish-recruitment-revisited) [ABS]
  - In mesocosms and Lake Shelbyville, bluegill larval survival was "uniformly high", independent of zooplankton. [Welker et al. 1994](https://doi.org/10.1577/1548-8659%281994%29123%3C0703:GASOLF%3E2.3.CO%3B2) [ABS]
- Theory citations (content via Houde 2008): Hjort 1914 (critical period); Cushing 1990 match–mismatch, [Adv. Mar. Biol. 26:249–293](https://doi.org/10.1016/S0065-2881%2808%2960202-3) [citation only].

### Inferences
- **Larval mortality settings.**
  - For a mesotrophic north-temperate lake, total larval Z of about **0.04–0.15 d⁻¹** at 15–20 °C is supported by field data (Oneida, Houde's freshwater correction); 0.5 d⁻¹ is a high-mortality year (Pelican Lake).
  - Juvenile (summer YOY) Z of about **0.03–0.06 d⁻¹** is supported (Oneida 18 mm → fall).
  - The simulation's comment ("5–30 %/day at first feeding") spans the plausible range. Oneida's well-studied perch sit at the low end (about 4%/d).
- **What kills larvae in the model.** Starvation should not be the main summer killer of 1–3 cm centrarchid and percid fry in a mesotrophic lake. Predation (including cannibalism by adult perch and bass in August) should dominate. Food should act mostly through growth, which sets size-selective predation and winter starvation. A starvation-dominated first-summer die-off at 1.1–1.5 cm (the simulation's bass) is not what the lake literature describes.
- **Where starvation belongs.** Starvation-driven, size-selective overwinter mortality of fish under about 50–60 mm (bass) or about 60 mm (perch; one thesis) is well supported. It is the place where starvation belongs in the model.
- **Hatch timing.** Early hatch confers large survival advantages (bluegill +231% representation; bass lipid and piscivory advantage). The simulation's protracted spawning should therefore produce a late-cohort disadvantage, not equal survival.

### Gaps
- Freshwater larval Z compilations (Houde & Zastrow 1993, Bull. Mar. Sci. 53:290–335) were not retrieved.
- Oneida limnetic and demersal stage Z means appear only in figures.
- Whiteside et al. 1985 mortality numbers were not in the abstract.
- Leggett & Deblois 1994 and Bailey & Houde 1989 contents were not obtained.
- No direct partition of starvation vs predation for the target species in lakes.
- Forney 1971 (TAFS 100:739–749) DOI not resolved.

---

## 3. Density dependence: YOY depressing zooplankton and their own growth; share of zooplankton production eaten by YOY vs adults; YOY densities; diet switch timing

### Takeaway
- **Daphnia collapse.** In Oneida Lake, *D. pulex* withstands about 10 kg/ha of age-0 yellow perch but collapses in late summer when YOY biomass exceeds 20–40 kg/ha. YOY consumption then exceeds *Daphnia* production. In a weak year, maximum daily consumption was under 27% of production.
- **Larvae vs juveniles.** Larvae have only minor effects on zooplankton; 0+ juveniles can suppress large cladocerans and copepods in late summer and autumn.
- **Density-dependent growth.** YOY growth is density dependent (Oneida limnetic R² ≈ 0.5). Age-0 perch switch to benthos above about 50 mm when zooplankton is low.
- **Densities.** Larval densities range from a few per m² lake-wide (Oneida) to tens to hundreds per m³ in ponds.

### Cited Findings

**YOY suppressing *Daphnia* and growth**
- Oneida Lake 1975–79:
  - *D. pulex* tolerated predation from about **10 kg/ha** of YOY perch, but its reproduction "could not compensate" above **20–40 kg/ha**;
  - in 1975 and 1977 consumption exceeded *D. pulex* production and the daphnids disappeared;
  - in 1976 maximum daily consumption was **<27% of production** and *Daphnia* persisted;
  - since 1968, *D. pulex* has vanished in late summer whenever YOY perch were abundant.
  - [Mills & Forney 1983, TAFS 112:154–161](https://doi.org/10.1577/1548-8659%281983%29112%3C154:IODPOP%3E2.0.CO%3B2) [ABS]
  - A Sea Grant education page gives the same threshold in lb/acre (18–36 lb/acre ≈ 20–40 kg/ha) and says smaller *D. galeata* and *D. retrocurva* replace large daphnids under heavy predation. [NY Sea Grant, Oneida Lake Education Initiative](https://seagrant.sunysb.edu/oli/olei-daphnia.htm) [SEC]
- After the *D. pulex* collapse, the age-0 perch diet diversified and growth fell. [Mills & Forney 1981](https://academic.oup.com/tafs/article/110/4/479/7894527) [ABS]
- Lake Opinicon: numbers of cyclopoids, nauplii and *Bosmina longirostris* "fell rapidly in May – early June, and did not increase again until August", coinciding with the rise and fall of young fish. [Keast 1980](https://doi.org/10.1007/BF00005185) [ABS]
- A summer weedbed community of nine juvenile species in Lake Opinicon was "not food limiting", with low diet overlap (Schoener overlap > 0.25 in only 10 of 36 pairs in mid-July). [Keast 1985, Environ. Biol. Fishes 13:211–224](https://doi.org/10.1007/BF00000933) [ABS]
- Review of 18 studies:
  - **larval stocks exert only minor impact** on small zooplankton (rotifers, copepodids, small cladocerans);
  - **0+ juveniles can depress large cladocerans and copepods**, especially in late summer and autumn;
  - studies that quantify both consumption and zooplankton production are "very rare".
  - [Mehner & Thiel 1999, Environ. Biol. Fishes 56:169–181](https://doi.org/10.1023/A:1007532720226) [ABS]
- First-year yellow perch growth varies more than 10-fold; enclosure experiments indicate density-dependent competition within the year class, and a high *Daphnia* share supports faster growth. The abstract's R² of "0.093–0.098" for prey availability may be a typo; check. [Post & McQueen 1994, CJFAS 51:2501–2512](https://doi.org/10.1139/f94-249) [ABS]
- Western Lake Erie: age-0 perch **<30 mm ate no benthos**; perch **>50 mm switched to benthos only when zooplankton density was low** (June–August). [Wu & Culver 1992, CJFAS 49:1932–1937](https://doi.org/10.1139/f92-214) [ABS]
- Enclosures (August): YOY perch growth was explained by YOY density plus cladoceran biomass, but June growth was not. A *Bosmina*/cyclopoid-only diet gave poorer growth and survival. [Romare 2000, J. Fish Biol. 56:876–889](https://doi.org/10.1006/jfbi.1999.1208) [ABS]
- Roach (European analogue):
  - abundant 0+ fry in 1979 and 1981 left summer zooplankton sparse; cladocerans crashed once 0+ fish began feeding; *D. hyalina* and *Ceriodaphnia* sizes fell;
  - a possible 2-year recruitment cycle.
  - [Cryer, Peirson & Townsend 1986, L&O 31:1022–1038](https://doi.org/10.4319/lo.1986.31.5.1022) [ABS]
- Perch–roach enclosures: roach reduced cladoceran biomass, 0+ perch shifted to benthos, and growth of all groups was density dependent. [Persson & Greenberg 1990, Ecology 71:44–56](https://doi.org/10.2307/1940246) [ABS]
- Long Lake, Michigan:
  - the clear-water phase ended in late June;
  - 15–20 mm age-0 perch avoided *D. pulicaria* (Ivlev −0.75) and selected copepods (+0.50);
  - *Bythotrephes* ate **1.5–5×** more zooplankton than age-0 perch.
  - [Hoffman, Smith & Lehman 2001, Freshw. Biol. 46:759–775](https://doi.org/10.1046/j.1365-2427.2001.00716.x) [ABS]
- Lake Mendota:
  - in 1987 the clear-water phase ran mid-May to early June, while fish consumption was low;
  - fish kept *Daphnia* low in July–August despite abundant algae.
  - [Luecke et al. 1990, L&O 35:1718–1733](https://doi.org/10.4319/lo.1990.35.8.1718) [ABS]
- Lake Mendota 1976–89:
  - planktivory varied about 10-fold, driven by the 1977 cisco cohort (die-off in August 1987);
  - yellow perch plus other cisco cohorts made up about **25%** of planktivory;
  - in low-planktivory years *D. pulicaria* came earlier and the clear-water phase lasted longer;
  - total zooplankton biomass stayed stable because cyclopoids compensated.
  - [Rudstam, Lathrop & Carpenter 1993, Ecology 74:303–319](https://doi.org/10.2307/1939294) [ABS]
- Reservoir analogue (larval gizzard shad):
  - at zooplankton production above **125 mg m⁻³ d⁻¹** and **38 larvae/m³**, early juveniles (25–30 mm) severely reduced zooplankton;
  - at 4 mg m⁻³ d⁻¹ or less and 3–7 larvae/m³, effects were variable.
  - [Dettmers & Stein 1992, TAFS 121:494–507](https://doi.org/10.1577/1548-8659%281992%29121%3C0494:FCBLGS%3E2.3.CO%3B2) [ABS via sub-researcher]
- Shad and bluegill mesocosms: macrozooplankton and copepod biomass were negatively correlated with fish density. In Lake Shelbyville, zooplankton "declined greatly" after the peak of larval shad and stayed low when bluegill appeared. [Welker et al. 1994](https://doi.org/10.1577/1548-8659%281994%29123%3C0703:GASOLF%3E2.3.CO%3B2) [ABS]

**YOY and larval densities**
- Oneida yellow perch: larvae at 18 mm average 27,700/acre (about **6.8/m²** lake-wide; yearly values about 1,500–143,000/acre); fall age-0 about **0.09/m²**. [NYSDEC Oneida report](https://dec.ny.gov/sites/default/files/2024-05/oneidalkfisheries.pdf) [FT, sub-researcher]
- Rough conversion [DER]: at about 1 g per fish, the 20–40 kg/ha *Daphnia*-collapse threshold is about **2–4 YOY perch/m²**, i.e. 2–4 g/m².
- Bluegill larvae, Alabama ponds: peaks of **280–360/m³**, mean **81.8/m³**. [Partridge & DeVries 1999](https://doi.org/10.1577/1548-8659%281999%29128%3C0625:ROGAMI%3E2.0.CO%3B2) [FT, sub-researcher]
- Bluegill model ponds: final length about 62 mm at 0.8 fish/m³ or fewer vs 28.6 mm at 25.8 fish/m³; a 10× density increase cut final length 47%. [Breck 1997](https://www.dnr.state.mi.us/PUBLICATIONS/PDFS/DNRFishLibrary/ResearchReports/RR1901-RR2000/RR1995.pdf) [FT, sub-researcher]
- Fathead minnows, prairie-pothole wetlands (fish-dense, mostly predator-poor; not lakes):
  - 52,000–356,000/ha in early June, falling to 5,400–19,700/ha by late August;
  - standing stock 144–482 kg/ha (June) to 1–33 kg/ha (late August);
  - prey consumed 333–1,105 kg/ha per season.
  - [Duffy 1998, CJFAS 55:15–27](https://doi.org/10.1139/f97-204) [ABS]
  - A related study found peaks of **107 fish/m²**; **detritus made up 53%, 40% and 79% of diet mass** for larval, juvenile and adult fish; larvae and juveniles accounted for **83%** of prey consumption. [Herwig & Zimmer 2007, Ecol. Freshw. Fish 16:282–294](https://doi.org/10.1111/j.1600-0633.2006.00220.x) [ABS]
- Lake Opinicon offshore larval sunfish density was only 8% of inshore limnetic density (Garvey et al. 2002). [WDNR bluegill review](https://dnr.wisconsin.gov/sites/default/files/topic/Fishing/Pubs_BluegillLiteratureReviewFinal.pdf) [SEC]

**Timing of habitat and diet shifts and of the *Daphnia* decline**
- Yellow perch:
  - limnetic from just after hatch; return to the littoral at **25 mm (about day 40)** in Lake Itasca;
  - in Oneida the "demersal" phase is defined from 1 August;
  - *Daphnia* preference from 30–35 mm (Mills et al. 1984);
  - benthos above 50 mm when zooplankton is scarce (Wu & Culver 1992).
  - [Whiteside et al. 1985](https://doi.org/10.1007/BF00007709); [Irwin et al. 2009](https://academic.oup.com/tafs/article/138/1/99/7888582)
- Bluegill:
  - limnetic about 1.5 months, returning to the littoral at 22–25 mm in Crane Lake. [Werner 1969](https://doi.org/10.2307/2423658)
  - Partridge & DeVries give 15–25 mm in Alabama ponds. [Partridge & DeVries 1999](https://doi.org/10.1577/1548-8659%281999%29128%3C0625:ROGAMI%3E2.0.CO%3B2)
  - Werner & Hall report a return at about 12.5 mm **SL** (about 16 mm TL) in four Michigan lakes. [Werner & Hall 1988, Ecology 69:1352–1366](https://doi.org/10.2307/1941633) [ABS via sub-researcher]
- Bluegill spawning bouts run late May to early August: 4–11 bouts over seasons of 31–112 d, with no spawning below 21 °C (Beard 1982). [WDNR bluegill review](https://dnr.wisconsin.gov/sites/default/files/topic/Fishing/Pubs_BluegillLiteratureReviewFinal.pdf) [SEC]
- *Daphnia* decline dates:

  | Lake | Timing | Source |
  |---|---|---|
  | Mendota | July–August | [Luecke et al. 1990](https://doi.org/10.4319/lo.1990.35.8.1718) |
  | Long Lake | late June | [Hoffman et al. 2001](https://doi.org/10.1046/j.1365-2427.2001.00716.x) |
  | Oneida | late summer in strong-YOY years | [Mills & Forney 1983](https://doi.org/10.1577/1548-8659%281983%29112%3C154:IODPOP%3E2.0.CO%3B2) |

### Inferences
- **[DER] A collapse rule for the simulation.** Large *Daphnia* should withstand YOY planktivore biomass of about 1 g/m² but collapse within weeks when YOY biomass exceeds about 2–4 g/m² in midsummer. Once it collapses:
  - YOY growth should drop (Oneida: diversified diet, lower growth);
  - YOY of about 50 mm or more should switch to benthos.
- **Larvae vs juveniles.** Larvae (under about 15 mm) should barely dent the crustacean community. The suppression is by 25–60 mm juveniles in July–September (Mehner & Thiel; Dettmers & Stein: 25–30 mm shad).
- **Do not hard-code survival to zooplankton.** Several systems show YOY growth tracking zooplankton while survival does not (bluegill: Welker; Garvey). Growth should be food-dependent; survival should emerge mainly through size-dependent predation and winter starvation.
- **Fathead minnows.** Their reliance on detritus (40–79% of diet) means they need not crash with zooplankton. That is a buffer the simulation can reproduce if fatheads digest detritus.

### Gaps
- Not quantified anywhere: the YOY-vs-adult share of zooplankton production consumed in a mesotrophic lake (Mehner & Thiel: "very rare" studies).
- Absolute YOY densities (per m³) for bluegill and largemouth bass in natural northern lakes were not obtained.
- Not obtained: Mills & Forney 1988 (Oneida pelagic food web) and Byström, Persson & Wahlström 1998 (Ecology 79:2153–2167) numbers.
- Kaemingk et al. (2012?) on the Pelican Lake perch–bluegill priority effect was found only in a search summary.

---

## 4. Adult planktivore feeding in the field: p-values (proportion of Cmax), daily rations, diet by size class and season, food limitation

### Takeaway
- **No verified lake p-values exist** for bluegill, pumpkinseed, fathead minnow or bullhead.
- **Field rations** (all [DER] against FB4 Cmax):

  | Species | Season | Field ration | Implied p |
  |---|---|---|---|
  | Summer panfish (bluegill/pumpkinseed) | summer | 1–2% of body weight/day (one secondary range 1–4%) | 0.25–0.5 |
  | Yellow perch | July | 5.5–6.7% bw/d | about 0.7–0.85 |
  | Yellow perch | October | 2.2–2.4% bw/d | about 0.5 |

- **Seasonality.** Largemouth bass rations run from about zero in spring to over 5% in late August. Across 38 species, fish carry 2–3× more digestive capacity than they use, i.e. average intake is about 0.33–0.5 of capacity.
- **Food limitation** in adult panfish is common: density-dependent growth, among-lake growth tied to *Daphnia*, and stunting on benthos.
- **Model bias.** Bioenergetics models systematically overestimate consumption at low ration and underestimate it at high ration, so p-values carry ±25% or more error.

### Cited Findings

**Field daily rations**
- Western Minnesota lakes, centrarchid panfish (bluegill, pumpkinseed, crappie):
  - summer daily ration "usually between **1 and 2 percent of the body weight per day**", lower in dense populations and larger fish;
  - at 18–23 °C, about 50% of a meal is digested in 5 h, 75% in 12 h and nearly 100% in about 21 h;
  - empty stomachs: 6.4% of panfish vs 40.7% of game fish.
  - [Seaburg & Moyle 1964, TAFS 93:269–285](https://doi.org/10.1577/1548-8659%281964%2993%5B269:FHDRAG%5D2.0.CO%3B2) [ABS via sub-researcher]
- A bluegill ration range of **1–4% bw/d (midpoint 2.2%)** is cited in a secondary source. [J. Freshwater Ecol. 2011](https://www.tandfonline.com/doi/full/10.1080/02705060.2011.641357) [SNIP]
  - Bluegill gastric evacuation in pens (Lake Opinicon, summer 1983) rose with temperature over 10–25 °C; no ration number is given. [Booth 1990, Can. J. Zool. 68:591–595](https://doi.org/10.1139/z90-084) [ABS]
- Lake Opinicon: early-summer feeding periodicities of yellow perch (diurnal), bluegill and pumpkinseed (largely diurnal, with a nocturnal component and 2–3 peaks) were used to estimate the "mean minimum daily ration". [Keast & Welsh 1968, JFRBC 25:1133–1144](https://doi.org/10.1139/f68-099) [ABS]
- **Method warning.** Yellow perch, Lake Memphremagog:
  - in-situ daily ration ranged from **5.5–6.7% bw in July** to **2.2–2.4% in October**, tracking the seasonal growth pattern;
  - the Keast & Welsh method and its derivatives "give unreliable values that are **50% below**" the other methods, "in general below maintenance".
  - [Nakashima & Leggett 1978, JFRBC 35:1597–1603](https://doi.org/10.1139/f78-249) [ABS]
- Adult Eurasian perch, Loch Leven: **6.5% wet bw/d in June, falling to 3.2% in September**. These are minimum estimates because caged fish evacuated slowly. [Thorpe 1977, J. Fish Biol. 11:55–68](https://doi.org/10.1111/j.1095-8649.1977.tb04098.x) [ABS via sub-researcher]
- Yellow perch, 12 lakes, ages I+–III+, late May–September 1985:
  - 10 of 12 lakes averaged 19.0 ± 1 °C;
  - consumption covered a **four-fold range** within each age class and varied significantly among populations;
  - it explained growth only for age I+ (r² = 0.52).
  - [Boisclair & Leggett 1989a, CJFAS 46:457–467](https://doi.org/10.1139/f89-062) [ABS]
  - Prey type (four taxonomic groups and six prey size classes) explained **41–95%** of among-population growth variance; mean prey weight explained none. There was a suggested optimal prey size of about 1 mg dry weight for age I+–II+. [Boisclair & Leggett 1989b, CJFAS 46:468–482](https://doi.org/10.1139/f89-063) [ABS]
  - Median rations of 7.0 and 12.0% bw/d were seen only in a search snippet (unverified).
- Saginaw Bay yellow perch, ages 1–4, May–October 1987–88:
  - the Wisconsin model **under-predicted** field daily rations at all ages, mostly above 22 °C;
  - cumulative model consumption was **25–50% below** field estimates; the Karås–Thoresson model was 2–35% low.
  - [Schaeffer, Haas, Diana & Breck 1999, TAFS 128:414–435](https://doi.org/10.1577/1548-8659%281999%29128%3C0414:FTOTEM%3E2.0.CO%3B2) [ABS via sub-researcher]
- Subadult (age III) largemouth bass, Lake Rebecca, Minnesota, May–October 1978:
  - daily ration ranged from "**almost zero in mid-May and early June to over 5% in late August**";
  - weight gain began only when the diet shifted to age-0 bass and bluegill;
  - a growth-limiting lack of suitably sized forage occurred early in the season.
  - [Cochran & Adelman 1982, Environ. Biol. Fishes 7:265–275](https://doi.org/10.1007/BF00002501) [ABS]
  - In the same lake, a single constant proportion of Cmax over the season "was shown to be inappropriate"; three intervals with different p fitted, matching diet changes. [Rice & Cochran 1984, Ecology 65:732–739](https://doi.org/10.2307/1938045) [ABS via sub-researcher]
- Eurasian perch in a shallow eutrophic lake had low consumption compared with other studies and were "highly resource limited". [Persson 1983, Oikos 40:197–207](https://doi.org/10.2307/3544583) [ABS via sub-researcher]

**p-values, model bias and capacity vs intake**
- Across **639 estimates in 38 species**, predatory fish "typically maintain the physiological capacity to feed at daily rates **2–3 times higher**" than they achieve. [Armstrong & Schindler 2011, Nature 476:84–87](https://doi.org/10.1038/nature10240) [ABS via sub-researcher]
- Bioenergetics evaluations "often differ from other measures of consumption or growth by more than 25%". [Chipps & Wahl 2008, TAFS 137:298–313](https://doi.org/10.1577/T05-236.1) [ABS]; cited in [Hartman & Kitchell 2008, TAFS 137:216–223](https://doi.org/10.1577/T07-040.1) [FT]. Hartman & Kitchell has no compiled p-value distribution.
- Walleye, Oneida Lake [FT, sub-researcher]:
  - simulated mean rations deviated from field rations by −20.1% to +70.3%; the model over-predicted at low ration;
  - the paper summarises the same bias across lake trout, white crappie, yellow and Eurasian perch, mosquitofish and hybrid sunfish: consumption is overestimated at low ration and underestimated at high ration.
  - [Lantry et al. 2008, TAFS 137:1406–1421](https://doi.org/10.1577/T07-051.1)
- Lab yellow perch at 21 °C: both bioenergetics models misestimated resting and routine metabolism, with errors depending on consumption level. [Bajer et al. 2003, J. Fish Biol. 62:436–454](https://doi.org/10.1046/j.1095-8649.2003.00040.x) [ABS via sub-researcher]
- Lake whitefish: the original model overestimated lab consumption by about 61%. A field PCB-based p was **0.28 with the original model and 0.56 with adjusted respiration**. [Madenjian et al. 2006, TAFS 135:61–75](https://pubs.usgs.gov/publication/1001053) [SNIP]
- Yellow perch, 28 population × age combinations: activity took **0–40%** of the energy budget, and model-predicted and observed consumption were unrelated. [Boisclair & Leggett 1989, CJFAS 46:1859–1867](https://doi.org/10.1139/f89-234) [ABS via sub-researcher]
- Two Ontario yellow perch populations: the fast-growing one had **39% lower activity costs and ate 32% less**. [Rennie et al. 2005, CJFAS 62:767–780](https://doi.org/10.1139/f05-052) [ABS via sub-researcher]
- Across 47 walleye and 67 yellow perch populations, mature males had lower consumption, metabolic costs and conversion efficiency than females. p comparisons across populations need sex-specific parameters. [Rennie et al. 2008, J. Anim. Ecol. 77:916–926](https://doi.org/10.1111/j.1365-2656.2008.01412.x) [ABS]
- The yellow perch FB4 model (Kitchell, Stewart & Weininger 1977) borrows its Cmax and respiration from Eurasian perch. It is listed among models that "deviated substantially" from field data for yellow perch. [Kitchell et al. 1977, JFRBC 34:1922–1935](https://doi.org/10.1139/f77-258); [Lantry et al. 2008](https://doi.org/10.1577/T07-051.1) [FT, sub-researcher]

**Diet by size class and season**
- Bluegill, five Michigan lakes:
  - the adult shift from the littoral back to zooplankton (first over the weedbed, then pelagic) occurred at **50–83 mm**, rising with largemouth bass density;
  - open water was **40–80×** riskier for small bluegill but more profitable for every size class.
  - [Werner & Hall 1988, Ecology 69:1352–1366](https://doi.org/10.2307/1941633) [ABS via sub-researcher]
- Bluegill over 100 mm SL chose diets matching optimal-diet predictions and switched seasonally between vegetation invertebrates and open-water zooplankton as profitability changed. Fish under 100 mm stayed in vegetation despite the better open-water return. [Mittelbach 1981, Ecology 62:1370–1386](https://doi.org/10.2307/1937300) [ABS]
- Optimal prey selection yields **4–10×** the energy of random selection, and predicted net gain correlated with seasonal mass gain. [Mittelbach 1983, Oecologia 59:157–162](https://doi.org/10.1007/BF00378832) [ABS via sub-researcher]
- In a pond, bluegill moved from open water to sediments within days as relative profitability changed. [Werner, Mittelbach, Hall & Gilliam 1983, Ecology 64:1525–1539](https://doi.org/10.2307/1937507) [ABS via sub-researcher]
- Across lakes, *Daphnia* size and abundance strongly set adult bluegill foraging gain and growth. Adult growth and density correlate positively, juvenile growth and density negatively. The hypolimnetic refuge volume for *Daphnia* is proposed as the driver. [Mittelbach & Osenberg 1993, Ecology 74:2381–2394](https://doi.org/10.2307/1939589) [ABS via sub-researcher]
- Pumpkinseed:
  - gastropods were **>80%** of diet mass in three Michigan lakes. [Osenberg & Mittelbach 1989, Ecol. Monogr. 59:405–432](https://doi.org/10.2307/1943074) [ABS via sub-researcher]
  - Small pumpkinseed eat soft-bodied littoral invertebrates and compete with small bluegill.
  - In bluegill-free Wintergreen Lake, juveniles thrived, but adults over-grazed snails, never shifted to snails and grew poorly; snails increased **4-fold** where fish were excluded. [Osenberg, Mittelbach & Wainwright 1992, Ecology 73:255–267](https://doi.org/10.2307/1938737) [ABS via sub-researcher]
- Windermere perch diet by season: benthos November–April; benthos plus plankton May–June; perch fry plus zooplankton July–October. [Craig 1978, Freshw. Biol. 8:59–68](https://doi.org/10.1111/j.1365-2427.1978.tb01426.x) [ABS via sub-researcher]
- Yellow perch in Baptiste Lake, Alberta fed increasingly through the day, peaked in late evening and nearly stopped after sunset. [Jansen & Mackay 1992, Environ. Biol. Fishes 34:287–303](https://doi.org/10.1007/BF00004776) [ABS via sub-researcher]
- The ontogenetic-niche framework and size-structured interactions: [Werner & Gilliam 1984, Annu. Rev. Ecol. Syst. 15:393–425](https://doi.org/10.1146/annurev.es.15.110184.002141) [citation verified; content not read]

**How often adults are food-limited**
- Bluegill, nine southwest Michigan lakes, 1978–85: growth varied mainly among lakes rather than years; growth curves break at the diet-shift sizes; large fish appear food-limited and small fish show density-dependent growth. [Osenberg, Werner, Mittelbach & Hall 1988, CJFAS 45:17–26](https://doi.org/10.1139/f88-003) [ABS via sub-researcher]
- Western Lake Erie yellow perch were food-limited by small benthic prey, more severely as perch got larger, which was linked to stunting. [Hayward & Margraf 1987, TAFS 116:210–223](https://doi.org/10.1577/1548-8659%281987%29116%3C210:EEOPSA%3E2.0.CO%3B2) [ABS via sub-researcher]
- Lac Hertel, Québec: yellow perch, pumpkinseed, rock bass and **brown bullhead** (all benthivores) were stunted; pike and golden shiner were not. Restricting benthic food alone reproduced stunted perch growth. [Heath & Roff 1996, Environ. Biol. Fishes 45:53–63](https://doi.org/10.1007/BF00000627) [ABS via sub-researcher]
- Density-dependent growth was significant in 9 of 16 long-term fish populations. [Lorenzen & Enberg 2002, Proc. R. Soc. B 269:49–54](https://doi.org/10.1098/rspb.2001.1853) [ABS via sub-researcher]
- Bluegill condition and back-calculated length were negatively correlated with relative density in northern Wisconsin lakes (Wiener & Hanneman 1982). Density added little explanatory power in Illinois reservoirs (Hoxmeier et al. 2009). [WDNR bluegill review](https://dnr.wisconsin.gov/sites/default/files/topic/Fishing/Pubs_BluegillLiteratureReviewFinal.pdf) [SEC]

### Inferences
- **[DER] Bluegill/pumpkinseed vs the simulation's 60–90% of Cmax.** Using the simulation's own sunfish FB4 parameters (CA 0.182, CB −0.274, CQ 2.3, CTO 27, CTM 36):
  - Cmax for a 100 g fish is about 4.3% bw/d at 22 °C and about 5.2% at 27 °C;
  - for a 30 g fish at 22 °C it is about 6.0% bw/d.
  - At p = 0.6–0.9 the simulation's 100 g sunfish eat about 2.6–3.9% bw/d at 22 °C, about 2× the classic 1–2% field figure.
  - Nakashima & Leggett showed that methods of the Keast–Welsh type can underestimate by about 50%. If Seaburg & Moyle's method shares that bias, true panfish rations could be about 2–4% bw/d (p ≈ 0.45–0.9), and the simulation's level would be plausible for good conditions.
  - The balance of evidence favours a **season-averaged p of about 0.3–0.6** for adult sunfish (Armstrong & Schindler's 2–3× excess capacity; widespread food limitation). It should drop in late summer when *Daphnia* crash.
- **[DER] Yellow perch.** Using the simulation's perch parameters (CA 0.25, CB −0.27, CTO 23, CTM 28), Cmax for a 50 g fish is about 8.0% bw/d at 20 °C and about 4.5% at 12 °C. Then:
  - July rations of 5.5–6.7% give p ≈ 0.7–0.85;
  - October rations of 2.2–2.4% give p ≈ 0.5.
  - Fish size in Nakashima & Leggett is not in the abstract, so this is indicative only.
  - Perch midsummer intake near the simulation's range is plausible, supported by Schaeffer et al.'s finding that the Wisconsin model under-predicts field perch rations by 25–50%.
- **Seasonality is the most defensible calibration target.** Feeding level should vary through the year rather than be pinned high:
  - lowest in early spring and late autumn, and for bass before forage fish appear;
  - highest in early to mid summer;
  - depressed in late summer for zooplanktivores after the *Daphnia* crash.
- **Habitat use should be size-gated.** Bluegill under about 50–80 mm (bass-density dependent) should stay in vegetation on littoral invertebrates. Larger bluegill should move offshore to *Daphnia*. Pumpkinseed over about 70–100 mm should shift to snails. These shifts are what limit adult growth in real lakes.

### Gaps
- Not found anywhere: species-specific bioenergetics p-values for bluegill, pumpkinseed, fathead minnow or brown bullhead in natural north-temperate lakes.
- Paywalled, values not obtained: the p tables in Rennie et al. 2005/2008, Hayward & Margraf 1987, Schaeffer et al. 1999 and Weidel et al. 2011 (age-0 bluegill and others).
- Not obtained: Armstrong & Schindler's median load:capacity ratio; Booth 1990, Keast & Welsh 1968 and Seaburg & Moyle species-specific ration tables; Seaburg & Moyle's exact ration method (needed to judge the Keast–Welsh bias).
- No field ration or p for fathead minnow in lakes; the wetland bioenergetics above are not lake data. No field ration for brown bullhead.

---

## 5. Size-selective predation and prey selectivity: size-efficiency, fish effects on *Daphnia* size, selectivity of bluegill and perch for *Daphnia* vs copepods, copepod escape

### Takeaway
- **Fish shift the zooplankton toward small species.** Planktivorous fish remove zooplankters over about 1 mm and shift communities from large *Daphnia*, calanoids and *Epischura* to *Bosmina*, *Ceriodaphnia* and small cyclopoids:
  - modal length fell from 0.785 to 0.285 mm in Crystal Lake;
  - mean daphnid length fell from 1.4 to 0.8 mm in a Michigan lake;
  - *Daphnia* size at first reproduction is about half in fish lakes.
- **Copepods escape far more often than cladocerans.** Simulated suction captured 7–28% of copepods vs 76–96% of cladocerans; herring caught about 49% of copepods vs 87% of cladocerans. Sunfish therefore select *Daphnia* over copepods even at equal apparent size.
- **Perch switch to *Daphnia* when they can catch them.** Yellow perch prefer copepods as larvae and switch to *Daphnia* at 30–35 mm, when capture success on daphnids nears 100%.

### Cited Findings
- Crystal Lake, Connecticut, before (1942) vs after blueback herring/"alewife" (*Alosa aestivalis*, 1964) [FT, sub-researcher]:
  - **modal crustacean length was 0.785 mm without *Alosa* vs 0.285 mm with it**, and no zooplankter over 1 mm was found in 1964;
  - *Daphnia catawba*, *Mesocyclops edax* and *Epischura* were replaced by *Bosmina longirostris*, *Cyclops bicuspidatus thomasi* and *Tropocyclops*;
  - species maturing under 0.6 mm persist, and species maturing at 0.6–1.0 mm go either way depending on escape ability.
  - [Brooks & Dodson 1965, Science 150:28–35](https://doi.org/10.1126/science.150.3692.28)
- The size-efficiency hypothesis was reviewed by [Hall, Threlkeld, Burns & Crowley 1976, Annu. Rev. Ecol. Syst. 7:177–208](https://doi.org/10.1146/annurev.es.07.110176.001141) [citation only].
- Michigan lakes [FT, sub-researcher]:
  - rainbow trout (7.9–17.2 in) and yellow perch (2.8–9.8 in) ate only daphnids, usually only those **over 1.3 mm**;
  - after trout, smelt and fathead minnows were stocked into a reclaimed lake, *D. pulex* was replaced by two smaller species within 4 years, **mean daphnid length fell from 1.4 to 0.8 mm**, and the share of daphnids over 1.3 mm fell from **53.8% to 4.7%**.
  - [Galbraith 1966, Michigan DNR Research Report 1725](https://www2.dnr.state.mi.us/publications/pdfs/DNRFishLibrary/ResearchReports/RR1701-RR1800/RR1725.pdf)
- *Daphnia pulicaria* size at first maturation was **0.86–0.95 mm in trout-stocked lakes vs 1.55–1.81 mm in fishless lakes** (alpine Portugal). [Gliwicz & Boavida 1996, J. Plankton Res. 18:863–880](https://doi.org/10.1093/plankt/18.6.863) [ABS via sub-researcher]
- New York lakes:
  - zooplankton size tracked the growth and size structure of panfish; mean size rose with the predator:panfish ratio and fell when age-0 fish were abundant.
  - [Mills & Schiavone 1982, NAJFM 2:14–27](https://doi.org/10.1577/1548-8659%281982%292%3C14:EOFCTA%3E2.0.CO%3B2); [Mills, Green & Schiavone 1987, NAJFM 7:369–378](https://doi.org/10.1577/1548-8659%281987%297%3C369:UOZSTA%3E2.0.CO%3B2) [ABS]
  - A mean crustacean length of **0.8 mm (153 µm net)** is suggested as indicating a balanced piscivore/planktivore community. The same source gives bosminid mean length about 0.4 mm and immature cyclopoids about 0.65 mm. [EPA SOLEC 2007 indicator sheet](https://archive.epa.gov/solec/web/pdf/sogl2007_03.pdf) [FT, sub-researcher]
- Bluegill fed *D. magna* size classes:
  - at low prey abundance all sizes were eaten as encountered;
  - as abundance rose, size classes were dropped from the smallest up, as optimal-diet theory predicts.
  - [Werner & Hall 1974, Ecology 55:1042–1052](https://doi.org/10.2307/1940354) [ABS via sub-researcher]
- Bluegill take the prey that looks largest, which can be a smaller but closer one. [O'Brien, Slade & Vinyard 1976, Ecology 57:1304–1310](https://doi.org/10.2307/1935055) [ABS via sub-researcher]
- Small bluegill are vision-limited and follow apparent size; larger fish take more large prey than the apparent-size model predicts. [Li, Wetterer & Hairston 1985, Ecology 66:1729–1735](https://doi.org/10.2307/2937368) [ABS via sub-researcher]
- Bluegill and pumpkinseed **select *Daphnia* over copepods even when copepods look larger**, attributed to learned evasiveness. [Vinyard 1980, CJFAS 37:2294–2299](https://doi.org/10.1139/f80-276) [ABS via sub-researcher]
- Conditional capture probability for simulated fish suction was **0.76–0.96 for cladocerans vs 0.07–0.28 for copepods**, which alone produces apparent selectivity for cladocerans. [Drenner, Strickler & O'Brien 1978, JFRBC 35:1370–1373](https://doi.org/10.1139/f78-215) [ABS via sub-researcher]
- Lake herring capture success per attack (Lake Superior taxa) [ABS via sub-researcher]:

  | Prey | Capture success |
  |---|---|
  | All copepods (mean) | 48.9% |
  | *Limnocalanus* | 30% |
  | *Diaptomus sicilis* | 42.5% |
  | *Cyclops vernalis* | 57.5% |
  | All cladocerans (mean) | 86.7% |
  | *D. galeata mendotae* | 80% |
  | *Bosmina* | 92.5% |

  - [Link 1996, TAFS 125:139–142](https://doi.org/10.1577/1548-8659%281996%29125%3C0139:CPOLSZ%3E2.3.CO%3B2)
- Young yellow perch in Oneida:
  - preference switched from *Diaptomus minutus* to *D. pulex* at 30–35 mm, with "nearly 100%" capture success on daphnids;
  - the largest daphnids were not chosen, possibly because of digestibility.
  - [Mills, Confer & Ready 1984](https://doi.org/10.1577/1548-8659%281984%29113%3C579:PSBYYP%3E2.0.CO%3B2) [ABS]
- Oneida 1982–83, light effects:
  - under bright light young perch take *smaller* prey; under low light they detect only large daphnids;
  - above **230 lx**, size selection depends mainly on fish length (R² = 0.65), not on prey density.
  - [Mills, Confer & Kretchmer 1986, TAFS 115:716–725](https://doi.org/10.1577/1548-8659%281986%29115%3C716:ZSBYYP%3E2.0.CO%3B2) [ABS via sub-researcher]
- 15–20 mm age-0 perch in Long Lake avoided *D. pulicaria* (Ivlev −0.75) and selected copepods (+0.50). [Hoffman et al. 2001](https://doi.org/10.1046/j.1365-2427.2001.00716.x) [ABS]
- Reactive distance:
  - pumpkinseed reactive distance (RD) is linear in prey size, and encounter rate scales with RD². [Confer & Blades 1975, L&O 20:571–579](https://doi.org/10.4319/lo.1975.20.4.0571)
  - Light of 10–50 lx reduces RD in trout. [Confer et al. 1978, Oikos 31:27–37](https://doi.org/10.2307/3543380)
  - Bluegill RD rises non-linearly, and decelerating, with fish size over 27–162 mm SL. [Breck & Gitter 1983, CJFAS 40:162–167](https://doi.org/10.1139/f83-026)
  - [all ABS via sub-researcher]
- Largemouth bass of 150 mm TL or more also eat *Daphnia* in "episodes" (38 or more *Daphnia* in the gut): about **26%** of 1,718 fish had at least one; these were more frequent later in the season and at high *Daphnia* density, and those fish grew faster (small low-nutrient lake, UNDERC). [Butts et al. 2020, J. Freshwater Ecol. 35:469–490](https://doi.org/10.1080/02705060.2020.1852124) [ABS via sub-researcher]

### Inferences
- **Capture probability by prey type.** The simulation's per-prey capture probability should differ by type: roughly 0.8–0.95 for *Daphnia* and *Bosmina* vs 0.3–0.6 for adult copepods (lower still for calanoids) for juvenile and adult fish. This alone will make fish deplete *Daphnia* preferentially.
- **Larvae under about 12–15 mm** are the exception. They positively select nauplii, cyclopoids and small copepods because these fit the gape. Copepods can also be profitable through short handling time (Graeb 2004).
- **Expected *Daphnia* size response.**

  | Planktivory | *Daphnia* size at maturity | Mean daphnid length | Daphnids over 1.3 mm |
  |---|---|---|---|
  | Heavy | about 0.9 mm | about 0.8 mm | about 5% |
  | Light or fishless | about 1.6–1.8 mm | about 1.4 mm | about 50% |

  Community mean crustacean length should sit around 0.8 mm when planktivory is moderate.

### Gaps
- Not obtained: Chesson's α or Ivlev values for adult bluegill and pumpkinseed on *Daphnia* vs copepods in lakes; Mills et al. 1984 capture percentages for *Diaptomus* and *Cyclops* by perch size.
- No lab capture success of larval fish on nauplii and copepodites by fish size.
- A counterpoint seen only through an OpenAlex record with no DOI or URL: bluegill and green sunfish fry (8–11 mm) in a South Dakota sewage lagoon consistently selected *Cyclops vernalis* and avoided *Moina*, and mean prey length rose linearly with fry length (Barkoh 1984, South Dakota State University thesis). It is unverified.
- Not obtained: parameter values from Werner & Hall 1974, Mittelbach 1981 (encounter and handling) and Breck & Gitter 1983 (RD equation).

---

## 6. Magnitudes of trophic cascades in whole-lake experiments

### Takeaway
- **Zooplankton respond strongly and consistently** when planktivores are removed or piscivores added:
  - Wintergreen Lake: planktivores fell about 100-fold and total zooplankton biomass rose about 10-fold after bass returned, with large *Daphnia* returning;
  - Lake Mendota: planktivore biomass fell from 300–600 to 20–40 kg/ha and *D. pulicaria* replaced *D. galeata*.
- **Phytoplankton responses are weaker and conditional.** Across experiments a 10-fold drop in herbivores gives about a 4.8-fold rise in producers. Planktivore lakes had about 3× the chlorophyll and 6× the primary production of piscivore lakes under equal enrichment. Responses are absent or only a trend in some enclosures and are nutrient-dependent.

### Cited Findings
- Peter, Paul and Tuesday lakes (Michigan/Wisconsin, UNDERC), 1985–86:
  - **Tuesday** (piscivores added, planktivores removed): zooplankton biomass rose and shifted from copepods and rotifers to cladocerans; algal biomass and primary production declined.
  - **Peter** (piscivores removed, planktivores added): planktivores hid in littoral refuges from the remaining piscivores, so planktivory fell, zooplankton and large cladocerans rose, yet algae and primary production *rose* (gelatinous colonial greens).
  - [Carpenter et al. 1987, Ecology 68:1863–1876](https://doi.org/10.2307/1939878) [ABS via sub-researcher]
  - Framework papers: [Carpenter, Kitchell & Hodgson 1985, BioScience 35:634–639](https://doi.org/10.2307/1309989); [Carpenter & Kitchell (eds) 1993, *The Trophic Cascade in Lakes*, Cambridge UP](https://doi.org/10.1017/CBO9780511525513) [citations verified; contents not read]
- Tuesday Lake: after largemouth bass were added and minnows removed in spring 1985, previously rare *Daphnia pulex* and *Holopedium* increased and the dominant small cyclopoid *Tropocyclops* disappeared. Plankton composition converged on piscivore-dominated Paul Lake. [Elser & Carpenter 1988, Oecologia 76:148–154](https://doi.org/10.1007/BF00379613) [ABS via sub-researcher]
- Under 7 years of N+P enrichment:
  - the piscivore lake (West Long) had large *Daphnia*; the planktivore lake (Peter) had small grazers;
  - **Peter had about 3× the areal chlorophyll and 6× the areal primary production** of West Long.
  - [Carpenter et al. 2001, Ecol. Monogr. 71:163–186](https://doi.org/10.1890/0012-9615%282001%29071%5B0163:TCNALP%5D2.0.CO%3B2) [ABS via sub-researcher]
- Wintergreen Lake, Michigan:
  - largemouth bass were eliminated in 1978 (winterkill) and reintroduced in 1986;
  - after the loss, planktivores rose, two dominant *Daphnia* species vanished and small cladocerans appeared;
  - after reintroduction, **planktivores fell by two orders of magnitude, large *Daphnia* returned, total zooplankton biomass rose about 10-fold** and water clarity rose.
  - [Mittelbach et al. 1995, Ecology 76:2347–2360](https://doi.org/10.2307/2265812) [ABS via sub-researcher]
  - Over 16+ years, zooplankton composition tracked planktivore density smoothly in both directions, with little hysteresis. [Mittelbach, García & Taniguchi 2006, Ecology 87](https://doi.org/10.1890/05-1275) [ABS via sub-researcher]
- Lake Mendota (eutrophic):
  - walleye (2.7×10⁶ fingerlings) and northern pike (1.7×10⁵) were stocked 1987–99, raising piscivore biomass from **under 1 to 4–6 kg/ha**;
  - the 1987 cisco die-off cut planktivore biomass from **about 300–600 to 20–40 kg/ha** until perch resurged in 1999;
  - from 1988 the large ***D. pulicaria*** replaced *D. galeata mendotae*, appearing earlier and persisting past midsummer, with greater summer Secchi depth (confounded by P loading).
  - [Lathrop et al. 2002, Freshw. Biol. 47:2410–2424](https://doi.org/10.1046/j.1365-2427.2002.01011.x) [ABS via sub-researcher]; cisco die-off: [Vanni et al. 1990, Nature 344:333–335](https://doi.org/10.1038/344333a0) [citation verified]
- Lake St. George, Ontario, 750 m³ enclosures with juvenile yellow perch:
  - fish biomass and zooplankton biomass were negatively related; high fish density gave *Bosmina*, low density gave daphnids;
  - there was **no significant fish effect on phytoplankton** over the whole experiment.
  - [Post & McQueen 1987, Freshw. Biol. 17:79–89](https://doi.org/10.1111/j.1365-2427.1987.tb01030.x) [ABS via sub-researcher]
- Meta-analysis of 54 enclosure and pond experiments: planktivorous fish reduced zooplankton and increased phytoplankton biomass; the phytoplankton response was very strong in slightly over a third of cases and weak in the rest. [Brett & Goldman 1996, PNAS 93:7723–7726](https://doi.org/10.1073/pnas.93.15.7723) [ABS via sub-researcher]
- 102 field experiments (22 lentic plankton, 20 of them with fish predators) [FT, sub-researcher]:
  - mean plant:herbivore effect ratio −0.68, i.e. a 10-fold herbivore decrease gives about a 4.8-fold plant increase;
  - mean log ratios with vertebrate predators: plants +0.69, herbivores −1.04.
  - [Shurin et al. 2002, Ecol. Lett. 5:785–791](https://doi.org/10.1046/j.1461-0248.2002.00381.x)
- 71 mostly shallow Danish lakes, from total P under 0.05 to over 0.4 mg/L:
  - cyprinid gillnet catch rose 10-fold;
  - the piscivore:planktivore ratio fell from 0.6 to 0.10–0.15;
  - **mean cladoceran body mass fell from 5.1 to 1.5 µg**;
  - the zooplankton:phytoplankton biomass ratio fell from 0.46 to 0.08–0.15;
  - chlorophyll rose 15-fold.
  - [Jeppesen et al. 2000, Freshw. Biol. 45:201–218](https://doi.org/10.1046/j.1365-2427.2000.00675.x) [ABS via sub-researcher]
- Top-down control of phytoplankton is likely in deep mesotrophic or slightly eutrophic lakes and in shallow macrophyte lakes. It is unlikely in deep eutrophic/hypertrophic lakes and in ultra-oligotrophic lakes. [Benndorf et al. 2002, Freshw. Biol. 47:2282–2295](https://doi.org/10.1046/j.1365-2427.2002.00989.x) [ABS via sub-researcher]
- 11 Swedish lakes: the least productive lacked piscivores; perch were **97% or more** of piscivore biomass in 5 of 6 four-link systems. [Persson et al. 1992, Am. Nat. 140:59–84](https://doi.org/10.1086/285403) [ABS via sub-researcher]
- South Dakota glacial lakes, *D. pulex* biomass (µg dry weight/L) with vs without winterkill of planktivores [ABS via sub-researcher; productive prairie lakes, not mesotrophic]:

  | Period | Winterkill lakes | Non-winterkill lakes |
  |---|---|---|
  | Summer (Jun–Jul) | 332–469 | 89–204 |
  | September | 244 | 1.0 |

  - [Isermann, Chipps & Brown 2004, NAJFM 24:287–292](https://doi.org/10.1577/M02-151)

### Inferences
- **Calibration targets for the simulated mesotrophic lake.**
  - Removing most planktivores, or adding piscivores, should raise crustacean biomass several-fold (up to about 10×).
  - It should restore large *Daphnia* within one or two seasons, with Mendota and Wintergreen responding within a year.
  - It should lower chlorophyll by roughly 2–5×.
  - The reverse should give *Bosmina*/cyclopoid dominance and mean crustacean length well under 0.8 mm.
  - Responses should be reversible, without hysteresis (Wintergreen).
- **Littoral refuges.** The Peter Lake result shows that refuges (macrophytes) can invert the expected outcome. The simulation's weed cover could reproduce this if planktivores retreat inshore under bass.
- **Late-summer *Daphnia* crash.** A September *Daphnia* crash to near zero under strong planktivory (South Dakota: about 1 µg/L) vs persistence without it (about 244 µg/L) is a usable binary benchmark for the simulation's late-summer behaviour.

### Gaps
- Not obtained (full texts needed): numeric fish additions and removals, zooplankton biomass and mean length, and chlorophyll values for Peter and Tuesday lakes 1985–86 (Carpenter et al. 1987; Carpenter & Kitchell 1993).
- Not obtained: Brett & Goldman numeric effect sizes; lentic-plankton point estimates from Shurin et al. (figure only); Benndorf's P-loading threshold (about 0.6 g P m⁻² yr⁻¹, unverified).
- Absolute *Daphnia* densities (per L) and crustacean biomass (µg/L) for typical small mesotrophic Upper-Midwest lakes under moderate planktivory were not obtained.
