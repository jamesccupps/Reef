# Chain pickerel mortality and cannibalism (Hot Brook check)

Compiled 2026-10-18. This note checks one result of the 3-D sim against the literature.

**The sim's result.** In late May and early June (water 15–19 °C on the sim calendar), the sim loses **~2.9 % of its adult chain pickerel a week**:
- ~1.5 %/wk are eaten by other pickerel;
- ~0.3 %/wk are eaten by smallmouth bass;
- ~1.1 %/wk die of other causes.

**The population.** Upper and Lower Hot Brook Lake together hold ~16,000 adults over 643 ha. That is ~25/ha, with a mean length of ~24 cm.

---

## Summary: is it realistic?

**Too high overall, and the cannibal share is far too high.**

1. **Total loss.**
   - **Benchmark.** Adult esocid natural mortality is about **A = 25–50 %/yr** (M ≈ 0.3–0.7/yr). The field values come from chain pickerel life history, northern pike [sur] and grass pickerel [sur].
     - Uniform over the year, that is **0.6–1.3 %/wk**.
     - If ~70 % of the year's deaths fall in the 26 open-water weeks [inf], it is **~0.8–1.9 %/wk** in summer.
     - A 24-cm fish is mostly **age 2**, below Maine's maturity length of 33–41 cm. Size-scaled M (Lorenzen 1996's generic W^−0.288) puts such a fish nearer **M ≈ 0.85–1.0/yr**: 1.6–1.9 %/wk uniform, or ~2.3–2.7 %/wk only if both the size scaling and the summer concentration are stacked [inf].
   - **The sim.** 2.9 %/wk held for a year is **A ≈ 78 %/yr (Z ≈ 1.5/yr)**. That is a heavily exploited population, not a lightly fished Maine one where 79–94 % of caught pickerel are released.
     - It sits at or above the extreme upper bound.
     - It is ~2× a central estimate.
   - **Realistic target: ~1.0–1.8 %/wk** total for 20–35-cm pickerel in early summer, centred on ~1.3 %/wk.
2. **Cannibalism share.** In esocids, cannibalism mostly hits **young-of-year and yearlings**.
   - **Size ratio.** Large fish eat small ones at victim:cannibal length ratios mostly **≤ 0.5–0.55**. Pike field data give a maximum of 0.55 [sur]. Across piscivores, the field maximum is usually 0.32–0.46 of predator length.
     - A 24-cm victim therefore needs a cannibal of **≥ 44–48 cm**.
     - Such fish are a small minority of a population whose mean is 24 cm.
   - **Diet evidence.**
     - Three chain pickerel diet studies (Florida n = 521 and n = 115; Nova Scotia n = 17) list **no pickerel among prey**.
     - The large New York study (n = 234) names golden shiner, bullhead, pumpkinseed and crayfish.
     - In pike, conspecifics are ~1–9 % of large-pike diets [sur].
   - **Realistic share: ≤ 10–20 % of adult (≥ 20 cm) natural mortality**, i.e. **≤ ~0.1–0.3 %/wk**, almost all on the smallest "adults" (≤ 25 cm). The sim's 1.5 %/wk is roughly **5–15× too high**.
3. **Bass predation on ≥ 20-cm pickerel.**
   - It is not documented. Maine IFW documents **largemouth** bass eating **young-of-year** pickerel.
   - Gape and handling limits put a 20–24-cm pickerel beyond almost all Maine smallmouth bass. It would need a bass ≥ 45–60 cm.
   - **Realistic: ≈ 0–0.05 %/wk**, not 0.3 %/wk.
4. **Other causes (~1.1 %/wk).** These are birds, otter and mink, disease, post-spawn stress and hooking mortality. The rate is plausible but at the high end. It could carry most of a realistic ~1.3 %/wk on its own.
5. **Likely cause in the sim (code read, §6) [inf].** Piscivory in `fish3.js` is limited only by **prey body depth ≤ predator gape**, plus a soft size penalty.
   - The pickerel has `gapeR 0.13` and `depthR 0.14`, so it can take a conspecific up to **0.93× its own length**.
   - A smallmouth bass (`gapeR 0.115`) can take a pickerel up to **0.82× its length**. A typical 33-cm bass can swallow a 24-cm pickerel.
   - **No maximum victim:predator length ratio** exists. Real esocids, as Lawrence (1958) showed, can swallow prey as deep as themselves; for elongate prey, **length and handling** set the limit.
   - **The mortality budget double-counts.** The background hazard already takes half of the published M (`M_OTHER 0.5`), and explicit predation adds ~1.8 %/wk on top. That is about twice the budget of emergent predation and starvation that the published M leaves (~1 %/wk at 24 cm).

---

## Conventions
Same flags as `habitat3d_new_species.md` and `fallfish_spawning_brook.md`:
- **[ft]** full text read;
- **[abs]** abstract only;
- **[snip]** search summary only;
- **[ag]** agency document;
- **[sec]** compilation (ADW, FishBase, Wikipedia, Ontario fishes);
- **[inf]** my inference or arithmetic;
- **[sur]** surrogate species (northern pike, grass pickerel).

Region tags:
- **[N]**: New England, NY, NJ, PA, Atlantic Canada or Ontario;
- **[S]**: Florida or other southern waters.

Quotes are under 15 words.

**Conversions used.**
- From annual mortality A to a weekly rate: weekly = 1 − (1 − A)^(1/52).
- From instantaneous M to a weekly rate: weekly = 1 − e^(−M/52).

| A (%/yr) | 25 | 30 | 40 | 48 | 50 | 60 | 78 |
|---|---|---|---|---|---|---|---|
| uniform %/wk | 0.55 | 0.68 | 0.98 | 1.25 | 1.32 | 1.75 | 2.87 |

| M (/yr) | 0.30 | 0.42 | 0.50 | 0.62 | 0.85 | 1.00 | 1.53 |
|---|---|---|---|---|---|---|---|
| uniform %/wk | 0.58 | 0.80 | 0.96 | 1.19 | 1.62 | 1.90 | 2.90 |
| 70 % of M in 26 open-water weeks, %/wk [inf] | 0.81 | 1.13 | 1.34 | 1.66 | 2.26 | 2.66 | — |

**Method note: what was read and what was blocked.**
- **Read in full (text layer or pdftotext):**
  - Maine IFW *Chain Pickerel Assessment* (Brokaw 2001, updated by Lucas 2008);
  - Mitchell, LeBlanc & Heggelin (Nova Scotia pickerel lakes);
  - Guillory 1979 (Lake Conway, FL);
  - Buntz (south-central FL);
  - Lawrence 1958 (pickerel swallowing sizes);
  - Christensen et al. 2022 (MA isotopes);
  - PA Fish & Boat *Chain Pickerel Management* 2018;
  - NJ DFW species sheet;
  - Craig 2008 (pike review; county-hosted copy);
  - Persson, Bertolo & De Roos 2006;
  - van Kooten et al. 2010;
  - Michigan DNR northern pike plan 2016;
  - CT DEEP statewide electrofishing survey 2018;
  - Edeline et al. 2007 (PMC).
- **Blocked (403, login redirect or certificate error), skipped and not bypassed:**
  - Nature Communications (Brodersen et al. 2015 — CT pickerel; no PMC copy);
  - Springer link pages;
  - ResearchGate;
  - Taylor & Francis (Pierce & Tomcko 2003 and 2005);
  - Canadian Science Publishing (grass pickerel 2020);
  - PNAS site;
  - Maine IFW species page;
  - University of Chicago Press (Am. Nat.);
  - an ENS copy of Persson et al. 2004.
- **Not found online:** the classic chain pickerel papers (Foote & Blake 1945; Raney 1942; Underhill 1949; Kipling & Frost 1970 on Windermere pike). They are known here only through citations.
- **No USFWS HSI model** for chain pickerel was found. The FWS/OBS-82/10 series lists none.
- **No published catch-curve or tagging estimate** of chain pickerel mortality in a northeastern lake was found. Q1 therefore rests on life-history estimators, pike and grass pickerel surrogates, and agency statements.

---

## Q1. Annual and natural mortality of adult chain pickerel

### Chain pickerel (direct)
- **Lifespan.**
  - Typical wild lifespan is 3–4 years and the maximum is 9 (ADW [sec]; FishBase tmax = 9 [sec]).
  - The NJ DFW sheet gives 9 years [ag][N][ft].
  - The Ontario fishes database gives 8–10 years [sec].
  - A species whose typical fish lives 3–4 years has high adult Z [inf].
- **Maine agency view (Brokaw 2001 / Lucas 2008, MDIFW [ag][N][ft]).**
  - Its third-ranked management problem is that harvest is so low that it causes "large losses of pickerel due to natural mortality."
  - Release rates are 79 % on the ice and 94 % in open water (1999 questionnaire).
  - Statewide in 1999, anglers caught 1.19 million pickerel and kept 0.133 million.
    - Over the 331,654 acres (134,000 ha) of principal-fishery water, or all 514,205 acres of pickerel water, that is **~6–9 caught and ~0.6–1 kept per ha per year** [inf].
    - Against ~25/ha that is ≤ 4 %/yr kept, plus some hooking mortality. **Angling is a small part of adult mortality** in Maine [inf].
- **Life-history estimators [inf]** (standard equations, not re-read this session).
  - **Then et al. (2015), max-age form:** M = 4.899·tmax^−0.916 gives **M = 0.65** (tmax 9) or **0.73** (tmax 8). The sim's `M: 0.62` follows this.
  - **Then et al. (2015), growth form:** M = 4.118·K^0.73·L∞^−0.33, applied to the FishBase/Carlander growth fits:
    - Massachusetts males (L∞ 53.4, K 0.26): **M = 0.41**;
    - Massachusetts females (81.2, 0.15): **0.24**;
    - the median fit (77, 0.20): **0.30**.
  - **Hoenig (1983):** Z from tmax 9 is **~0.47**.
  - **Lorenzen (1996), natural ecosystems:** M = 3.00·W^−0.288. With the sim's Ws:
    - a 24-cm fish (~79 g) gets **M ≈ 0.85**;
    - a 40-cm fish (~410 g) gets **≈ 0.53**.
  - **Range: adult M ≈ 0.25–0.7/yr**, with smaller (age-2) fish higher, ~0.8–1.0.
- **Grass pickerel** (*E. americanus vermiculatus*, Ontario, *Can. J. Zool.* 2020) [sur][N][snip]: female annual mortality **26–46 %**, called "high relative to other studies."

### Northern pike [sur]
- **Windermere** (Kipling & Frost 1970, *J. Anim. Ecol.* 39:115–157) [snip only; numbers not verified against the paper]:
  - natural M from tag recaptures was **0.42** in the third year of life;
  - natural M was **0.30 (♀) / 0.35 (♂)** in the fourth year and later;
  - total Z of 0.75 (53 %/yr) for south-basin females during the gill-net cull.
  - Converted: **0.6–0.8 %/wk** of natural loss for adults.
- **Seven small Minnesota lakes** (Pierce, Tomcko & Schupp 1995, *NAJFM* 15:601) [abs][N-ish]: total annual mortality **mean 0.48**, exploitation **mean 0.10**. That implies **~38 %/yr natural** [inf], or ~0.9 %/wk.
- **Northern Ontario river pike:** adult A **49 %/yr** (Griffiths et al. 2004) [snip].
- **Upper Mississippi telemetry:** A 47–59 %; **Lithuanian lake:** age 2+ survival 0.74 [snip].
- **Michigan DNR** (Smith et al. 2016, Fisheries Report 15) [ag][ft]: pike have "a relatively high natural mortality rate," related to size. Small fish face more predators and "cannibalism by adult Northern Pike."
- **Compensation** (Craig 2008, citing Allen, Miranda & Brock 1998) [ft review]: exploitation is **compensatory for pike < 40 cm**, because cannibalism falls and natural mortality falls with it. It becomes **additive in larger fish**.

### By age [inf, from the above]
| Stage (Maine pickerel) | Length | Annual natural M | Uniform %/wk |
|---|---|---|---|
| Age-1 (2nd summer) | ~10–18 cm | ~1.0–1.5+ (esocid yearlings: cannibals, birds, bass) | 1.9–2.8 |
| Age-2 | ~18–26 cm | ~0.6–1.0 | 1.1–1.9 |
| Age-3+ (maturing and adult) | ~26–45+ cm | ~0.3–0.6 | 0.6–1.1 |

### Seasonality [inf + sources]
- **Winter.**
  - Maine pickerel feed through the winter: ice catch rates are 1.18/angler-day against 0.49 in summer (MDIFW [ag][ft]).
  - Under ice there are no herons, ospreys or loons on the water. No winterkill is known for the Hot Brook lakes [inf].
  - Adult natural mortality is therefore probably **low under ice**.
- **Spring and early summer (the sim's window).** This is probably a **high-mortality period**:
  - spawning comes right after ice-out (MDIFW), with post-spawn stress;
  - osprey, eagle, heron and loon chick-rearing peaks in June–July;
  - predator consumption rises steeply with temperature, and 15–19 °C is near the pickerel's optimum.
- **Bald eagles.** They take pickerel where present; pickerel may form up to 20 % of eagle diet (Dunstan & Harper 1975; Todd et al. 1982 *J. Wildl. Manage.* 46:636, Maine). This is cited in Mitchell et al. [ft citing]; the primary was not read.
- **High summer.** In Florida, pickerel stomachs were 3–5 % full in July against >75 % in January (Buntz [S][ft]). Hot-water feeding suppression would cut pickerel predation, including cannibalism, in high summer. This matters less at Hot Brook's 24 °C peak.
- **Bottom line:** a summer weekly rate ~1.3–1.5× the annual-average weekly rate is defensible. 2–3× is not.

---

## Q2. Cannibalism

### Chain pickerel (direct)
**No quantitative chain pickerel cannibalism study was found.** The evidence:
- **Guillory (1979)**, Lake Conway, FL [S][ft]: **521 stomachs**.
  - 16 prey fish species are tabulated; **chain pickerel is not among them**, although it made up 0.21 % of the fish community.
  - Fish dominate from 135–150 mm and up.
- **Buntz**, south-central FL [S][ft]: 115 adult pickerel, mean 19.5 in (50 cm).
  - 61.7 % of stomachs were empty.
  - Prey were bluegill, largemouth bass, crappie, warmouth, shiners, silversides and one siren. **No pickerel.**
- **Mitchell et al.**, Nova Scotia [N][ft]: **17 stomachs**, mainly insects (mayfly and odonate nymphs). Fish showed up in 2 stomachs, as vertebrae; **no pickerel identified**.
- **Raney (1942)**, *J. Wildl. Manage.* 6:58, a New York pond [N][sec via ADW and Wikipedia]: 234 stomachs.
  - Golden shiner occurred in 47.3 %, brown bullhead in 13.8 %, pumpkinseed in 13.2 % and *Cambarus* crayfish in 42 %.
  - No pickerel are reported in the secondary summaries.
- **MDIFW** [ag][N][ft]: principal prey are yellow perch, white perch, sunfish, minnows and smelt, plus crayfish, frogs and dragonfly nymphs. **Pickerel are not listed as prey.**
- **Christensen et al. 2022**, an 80-ha Massachusetts pond, isotopes [N][ft]: bluegill and crayfish lead; pumpkinseed grows in importance at ≥ 300 mm.
- **ADW** [sec]: larger pickerel eat young pickerel, cannibalism is observed "when food is sparse," and adults have "very few predators."
- A bass-fishing site (non-scientific) says fry start eating fry 3–4 weeks after hatching.

### Northern pike [sur]
- **Who is eaten.** Cannibalism is "well documented" and regulates pike mainly through **young-of-year and age-1**. Kipling & Frost (1970) concluded it can set **year-class strength**, and density-dependent fry mortality from cannibalism can regulate density (Craig 2008 [ft]).
  - Most cannibalised pike are larvae or juveniles (2020 Hydrobiologia review citing Craig 1996 [snip]).
- **Diet versus mortality.** Persson, Bertolo & De Roos (2006, *J. Fish Biol.* 69:461) [ft] note that where cannibals impose high mortality, their victims are only "a minor fraction of the cannibal's diet," because they are eaten very early.
  - In their Italian streams, cannibalism was **restricted to larger individuals**.
  - Across the size classes, the share of stomachs holding pike or other fish rose from 7 to 25 %.
- **Window.** Pike have a very wide "cannibalistic window" (victim:cannibal ratio). This gives **stable, cannibal-driven dynamics** in which cannibalism controls YOY → age-1 recruitment (Persson et al. 2004, summarised in van Kooten et al. 2010 [ft]).
- **Size ratios.**
  - **Field (Swedish lakes; piscivory including cannibalism):** minimum victim:pike ratio **0.03**, **maximum 0.55** (Persson et al. 2006 [ft]).
  - **Juvenile pike in semi-natural ponds:** mean victim:cannibal length **0.66**, with mouth size setting the maximum victim (Bry et al. 1992, *Env. Biol. Fish.* 35 [snip]).
  - **Fry in tanks:** cannibalism began at a predator:prey size of **~2:1**, and cannibals caused **54–96 %** of daily deaths (Giles, Wright & Nord 1986, *J. Fish Biol.* [abs]).
  - **Unconfined fry:** only 1–2 % turned cannibal [snip].
  - **Fry stocked at 6 vs 18 larvae/m²:** 7.8 % vs 41.3 % were cannibals at 100 mm [snip].
- **Adult on subadult (it happens).**
  - **Norwegian lake** (Sharma & Borgstrøm 2008, *Ecol. Freshw. Fish* 17:590) [abs]: after heavy removal of pike ≥ 65 cm, the number of 45–65-cm (mainly 3+) pike rose significantly, attributed to less consumption of 2+ pike by the large fish.
  - Here the cannibals were **≥ 65 cm**. The victims (2+) were roughly 35–45 cm [inf], a ratio ~0.55–0.7. That is large-on-much-smaller, not peer-on-peer.
- **Diet shares.** Cannibalism made up:
  - **8.7 %** of the diet, only in pike > 40 cm (Çivril Lake, Turkey; Alp et al. 2008 [snip]);
  - 3.4 % of pike (Vojvodina, Serbia [snip]);
  - ~**1 %** of large-pike diet (Windermere: Le Cren's reworking of Frost's data [snip]).
  - One unsourced summary says ~20 % [snip, unverified]. Treat it as the extreme.
- **Habitat.**
  - In ponds, when cannibalism was high, large pike held the sheltered structure and small pike were pushed out (Skov & Koed 2004, cited by Craig 2008 [ft]).
  - Grimm (1981, *Fish. Manage.* 12) argued that small-pike biomass is capped by vegetation, through intraspecific predation [snip].

### What this means for ≥ 20-cm pickerel [inf]
- **Size gap.** With a maximum ratio of ~0.5–0.55, a 20-cm victim needs a cannibal ≥ 36–40 cm and a 24-cm victim needs one ≥ 44–48 cm. Maine "adults" in the 20–30-cm range are mostly age-2 fish, and their cannibals would be age-4+ (≥ 40 cm).
- **Consumption check.**
  - Suppose large (≥ 40 cm) pickerel are ~40 % of adult biomass, eat ~3–4× their biomass a year, and have ≤ 5 % conspecifics by mass in their diet, about half of it fish ≥ 20 cm.
  - Then cannibalism removes ~3–4 % of adult biomass a year, which is **~0.1 %/wk** (≤ ~0.2–0.3 %/wk even in a peak season).
  - The sim's 1.5 %/wk (240 fish of ~80 g ≈ 19 kg a week) would need cannibalism to supply a large share of the big pickerel's whole ration.
- **Timing.** Esocid cannibalism peaks among **YOY in their first summer**, as size variation grows (~2:1 sizes); in Maine that is June–August. Large-on-YOY predation rises when YOY outgrow or leave cover, in late summer and fall.

---

## Q3. Bass predation on adult chain pickerel
- **Documented:** **largemouth bass** prey on **young-of-year pickerel**. MDIFW [ag][N][ft] believes largemouths, which frequent weedy areas, are "serious predators on young of the year pickerel." It reports pickerel declines in small waters where largemouths became established (Barker Pond; Region C waters).
- **Also documented:** in Florida, pickerel eat young **largemouth bass**. Bass were 10.6 % of prey items in Buntz [S][ft], and bass and pickerel were mutual prey in Guillory [S][ft].
- **Not found:** any record of **smallmouth bass eating adult (≥ 20 cm) chain pickerel**.
  - A NY DEC brief linked a chain pickerel decline at Deep Pond to newly arrived largemouth bass, but with habitat change confounding it [snip].
- **Gape and handling [inf].**
  - Field maximum prey length is ~32–46 % of predator length across piscivores. For smallmouth bass it **decreases** with bass size (Gaeta et al. 2018, *PLoS ONE* 13:e0194092 [ft]).
  - A 24-cm pickerel would need a smallmouth of ~50–75 cm, beyond Maine's largest. A 20-cm pickerel would need ~45–60 cm.
  - So bass predation on the sim's "adults" should be **near zero**: at most the largest bass (≥ 40 cm) on the smallest "adults" (15–20 cm).

---

## Q4. Densities and length-at-age

### Density
- **Chain pickerel.** No fish/ha estimate was found for any northeastern lake.
  - Maine says pickerel maintain "moderate to high density" wherever shallow weedy habitat exists, and are scarcest in oligotrophic lakes (MDIFW [ag][ft]).
  - In Nova Scotia pickerel lakes, total fish CPUE was **two orders of magnitude** lower than in pickerel-free lakes (0.047 vs 1.04 fish/trap-hour) [N][ft].
- **CT DEEP night boat electrofishing (1980s–2017)** [ag][N][ft]. Stock size is ≥ 25 cm and quality ≥ 38 cm.
  - Chain pickerel catch/hr is typically **~1–45**, with the best lakes at **50–90/hr**.
  - These are indices only; I did not convert them to density.
- **Northern pike [sur].**
  - Seven Minnesota lakes: age-2+ density **3–59 fish/ha**, production **0.77–8.31 kg/ha/yr** (Pierce & Tomcko 2003 [abs]).
  - Minnesota pike ≥ 36 cm average **9.3/acre (23/ha)**, and > 61 cm average 0.6/acre (Michigan DNR 2016 [ag][ft]).
  - Michigan small and medium lakes: **1.6–4.7/acre (4–12/ha)** for pike ≥ 36 cm.
- **Grass pickerel [sur]** (a smaller species), Pleasant Lake, Wisconsin, Schnabel estimates: **9–39/acre (22–97/ha)** [snip].
- **The sim [inf].** 25/ha at ~24 cm is about 2.0 kg/ha (Ws: 79 g at 24 cm), or ~2.5–3 kg/ha with a realistic size spread. That is **plausible**, mid-range for an esocid in shallow weedy lakes.
  - The **size structure is the anomaly**, not the number. Maine says many pickerel ponds support "good numbers of 15–19 inch fish" (38–48 cm). Anglers' kept fish average 17.0 in (43 cm), and Brandy Pond's sample averaged 16.9 in.
  - A population mean of 24 cm suggests too few fish survive past 30 cm. That fits excessive mortality of 20–35-cm fish.

### Length-at-age (northeastern)
| Source | Age 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| Maine (MDIFW [ag][ft]): 10–13 cm after the first season, +6.4–8.9 cm/yr; mature at age 3–4 at 33–41 cm | ~10–13 | ~17–22 | ~24–31 | ~30–40 | | |
| Sim `vb` (species.js) | ~17 | 25 | 32 | 38 | 43 | |
| Pennsylvania (PFBC 2018 [ag][ft]): age at length, spring samples; 18 in (legal) takes > 5 yr | | 23 cm at 2.0 | 34 cm at 3.5 | 38 cm at 4.1 | 43 cm at 5.0 | 46 cm at 5.6 |
| New Jersey lakes 1990–95 (NJDFW [ag][ft]) | 15.7 | 25.6 | 37.2 | 42.3 | 51.3 | 63.8 |
| Underhill 1949 (via ADW [sec]) | ~18 | | | | ~50 | |

FishBase (Carlander 1969) von Bertalanffy fits [sec]:
- Massachusetts ponds: ♂ L∞ 53.4 cm, K 0.26; ♀ L∞ 81.2, K 0.15;
- Rhode Island: L∞ 67.1, K 0.19;
- Quabbin, MA: L∞ 77.0, K 0.24;
- Lake Hopatcong, NJ: L∞ 90.1, K 0.18.

**A 24-cm pickerel is an age-2 (or young age-3) immature fish in Maine.** Females outnumber males about 1.3 to 1 (MDIFW).

---

## Q5. Gape, prey size and adult diet
- **Gape: Lawrence (1958, Proc. SE Assoc. Game & Fish Comm. 12:257)** [ft].
  - From stomach checks and mouth measurements, a chain pickerel can swallow a fish whose **body depth ≤ its own body depth** (abdomen not distended). Pickerel lack the semi-rigid cleithral ring of basses.
  - His depth–length fits give pickerel body depth ≈ **0.11–0.26 × TL**, rising with size.
  - Examples from his table:
    - a 9.5-in pickerel can swallow a 5.2-in golden shiner (54 %) or a 3.5-in bluegill (37 %);
    - a 16.5-in pickerel can take a 9.7-in shiner (59 %), a 6.3-in bluegill (38 %) or a 12.4-in gizzard shad (75 %).
  - **For pickerel-on-pickerel, the depth rule does not bind** (equal depth means near-equal length), so prey length and handling are what limit it.
- **Observed prey sizes.**
  - Field piscivores: median prey is **10–20 %** of predator TL and the maximum (interquartile) is **32–46 %**. Pike and muskellunge relative maxima are roughly constant with size (Gaeta et al. 2018 [ft]; chain pickerel not included).
  - Esocid field maximum is **0.55** (Persson et al. 2006 [ft]).
  - Florida adult pickerel (mean 50 cm) took prey averaging **5.9 in (15 cm, ~30 % of TL)**. Fish of 15–23 in also took 2–5-in prey (Buntz [S][ft]).
- **Diet by size.**
  - Maine: mostly invertebrates (immature aquatic insects) until **7–9 in (18–23 cm)**, then "strongly piscivorous." Principal prey are yellow perch, white perch, sunfish, minnows and smelt, plus crayfish, frogs and dragonfly nymphs (MDIFW [ag][ft]).
  - Nova Scotia: the shift falls anywhere from 15–40 cm (Foote & Blake 1945, as cited), or from > 8 cm (Meyers & Muncy 1962) [ft citing]. Insects still dominated NS fish of 14.5–38.5 cm in summer.
  - Florida: fish dominate from 135–150 mm, and mature fish are "almost exclusively piscivorous" (Guillory [S][ft]).
- **Fraction fish (adults).**
  - High in the south: almost all fish (Buntz), centrarchids 49.9 % of identified fish.
  - Lower and more mixed in the north. New York: golden shiner 47 % frequency, bullhead 14 %, pumpkinseed 13 %, **crayfish 42 %**. Massachusetts: crayfish a major source even ≥ 300 mm; fish ≤ 30 cm ate 40–65 % crayfish (species.js note).
  - Brandy Pond, Maine (1989): 28 % of 54 pickerel (mean 16.9 in) held newly stocked brown trout. The smallest such pickerel was 15.0 in, and one 18-in fish held three trout (MDIFW [ag][ft]).
  - Beddington Lake, Maine: salmon smolts were in 21 % of pickerel > 10 in during the smolt run (MDIFW).
- **For Hot Brook's fish set [inf].** Adult pickerel prey would be mainly:
  - yellow and white perch, pumpkinseed and redbreast, banded killifish, fallfish, dace and young suckers;
  - crayfish, frogs and odonate nymphs.
  - Conspecifics would be a trace, and young-of-year among them.

---

## 6. Implications for the sim (from reading the code, 2026-10-18) [inf]
- **The predation size rule.**
  - `fish3.js` `canEat` is `q.bdep <= p.gape && q.L >= FEED.PREY_MIN * p.L`.
  - Success is scaled by `(1 − bdep/gape)^FEED.SIZE_SEL` with `SIZE_SEL` 2.
- **Pickerel (`species.js` `pike`).** With `gapeR 0.13` and `depthR 0.14`, a pickerel can take a conspecific up to **0.93 L**. The success factor at length ratio r is (1 − 1.077 r)²:
  - r = 0.5 → 0.21;
  - r = 0.6 → 0.12;
  - r = 0.7 → 0.06.
  - So cannibals of 30–40 cm can kill 20–24-cm fish at real rates, where field esocids stop near r ≈ 0.55.
- **Smallmouth bass.** With `gapeR 0.115`, a bass can take a pickerel up to **0.82 L**. At its `Lref` of 33 cm, it can take a 24-cm pickerel (r 0.73).
- **The background hazard.**
  - `hM = M · M_OTHER(0.5) · clamp((L/Lref)^−0.87, 0.5, 3)`. For a 24-cm pickerel that is 0.62 × 0.5 × 1.66 ≈ **0.51/yr ≈ 1.0 %/wk**, matching the "other causes" ~1.1 %/wk.
  - That leaves an emergent budget for predation plus starvation of about **0.31 × 1.66 ≈ 0.51/yr (~1.0 %/wk)** at 24 cm.
  - The sim's emergent 1.8 %/wk is ~2× that budget, and cannibalism alone is 1.5×.
- **Suggested mechanisms, ranked.**
  1. **Add a maximum victim:predator length ratio** for piscivory, as a cap on top of the depth ≤ gape rule:
     - esocids ~0.5–0.55 (Persson et al. 2006);
     - basses and perch ~0.4–0.5, declining with predator size for smallmouth (Gaeta et al. 2018);
     - perch tanks took fatheads ≤ 0.53 TL (species.js note).
     - This alone should cut adult cannibalism by most of its current rate and nearly zero out bass predation on ≥ 20-cm pickerel. It keeps cannibalism on YOY and yearlings, where the literature puts it.
  2. **Optionally soften the size-refuge curve** near the cap; for example, success ∝ (1 − r/r_max)².
  3. **Keep habitat segregation as the second regulator.** Small esocids keep to dense vegetation, and large ones hold structure (Grimm 1981; Skov & Koed 2004). This is consistent with the existing `SHALLOW_REFUGE` and weed cover.
  4. **Target after the change.**
     - Total 20–35-cm pickerel loss ≈ **1.0–1.8 %/wk** in late May–June.
     - Cannibalism ≤ 0.1–0.3 %/wk (≤ 20 % of the total).
     - Bass ≤ 0.05 %/wk.
     - Check that the adult length distribution then shifts towards Maine's (many fish 35–48 cm; mean of a lightly fished population probably 30–35 cm for fish ≥ 20 cm [inf]).
     - Judge with ≥ 3 seeds, as CLAUDE.md requires.

---

## Sources (access level)
**Chain pickerel**
- Brokaw, R.K. (2001), updated by J. Lucas (2008). *Chain Pickerel Assessment.* Maine Dept. Inland Fisheries & Wildlife. https://www1.maine.gov/ifw/docs/strategic-management-plans/pickerel.pdf — [ft][ag][N]
- Mitchell, S.C., J.E. LeBlanc & A.J. Heggelin. *Impact of Introduced Chain Pickerel (Esox niger) on Lake Fish Communities in Nova Scotia.* NS Fisheries & Aquaculture (c. 2010–12). https://novascotia.ca/fish/documents/special-management-areas-reports/impact-chain-pickerel.pdf — [ft][N]
- Guillory, V. (1979). Analysis of prey selection in chain pickerel. *Proc. Ann. Conf. SE Assoc. Fish & Wildl. Agencies* 33:507–517. https://seafwa.org/sites/default/files/journal-articles/GUILLORY-507-517.pdf — [ft][S]
- Buntz, J. (1966). Stomach analysis of chain pickerel of south central Florida. *Proc. SE Assoc. Game & Fish Comm.* https://seafwa.org/sites/default/files/journal-articles/BUNTZ-315.pdf — [ft][S]
- Lawrence, J.M. (1958). Estimated sizes of various forage fishes chain pickerel can swallow. *Proc. SE Assoc. Game & Fish Comm.* 12:257–. https://seafwa.org/sites/default/files/journal-articles/LAWRENCE-257.pdf — [ft][S; anatomy general]
- Christensen, D.R., C.A. Favata & R.J. Bressette (2022). Isotopic analysis of *Esox niger* diet contributions in an urban pond. *Urban Naturalist* 56:1–10. https://www.eaglehill.us/urna-pdfs-regular/urna-056-Christensen.pdf — [ft][N]
- Lorantas, R., B. Frick et al. (2018). *Chain Pickerel Management and Fishing in Pennsylvania.* PFBC. https://www.pa.gov/content/dam/copapwp-pagov/en/fishandboat/documents/about-us/agencyoverview/species-mgmt-plans/chainpickerelmanagement.pdf — [ft][ag][N]
- NJ Division of Fish & Wildlife. *Chain Pickerel* species sheet. https://dep.nj.gov/njfw/wp-content/uploads/njfw/Chain-Pickerel.pdf — [ft][ag][N]
- CT DEEP (2018). *Statewide Lake and Large River Electrofishing Survey.* https://portal.ct.gov/-/media/DEEP/fishing/fisheries_management/StatewideLakeandLargeRiverElectrofishingSurveypdf.pdf — [ft][ag][N]
- CT DEEP. Chain Pickerel Management page. https://portal.ct.gov/deep/fishing/fisheries-management/chain-pickerel-management — [ft][ag][N]
- Raney, E.C. (1942). Summer food and habits of the chain pickerel of a small New York pond. *J. Wildl. Manage.* 6:58–66 — [sec via ADW and Wikipedia]
- Foote, L.E. & B.P. Blake (1945). *J. Wildl. Manage.* 9:89–96; Underhill, A.H. (1949). *J. Wildl. Manage.* 13:377–391 — [cited only]
- ADW, *Esox niger* — https://animaldiversity.org/accounts/Esox_niger/ [sec]; FishBase, *Esox niger* summary and growth table — https://www.fishbase.se/summary/Esox-niger.html [sec]; Ontario Freshwater Fishes Life History Database — https://www.ontariofishes.ca/fish_detail.php?FID=89 [sec]

**Esocid surrogates and size ratios**
- Craig, J.F. (2008). A short review of pike ecology. *Hydrobiologia* 601:5–16. Copy: https://www.ozaukeecounty.gov/DocumentCenter/View/2722/Craig-2008---A-short-review-of-pike-ecologypdf — [ft][sur]
- Persson, L., A. Bertolo & A.M. De Roos (2006). Temporal stability in size distributions and growth rates of three *Esox lucius* populations. A result of cannibalism? *J. Fish Biol.* 69:461–472. https://staff.fnwi.uva.nl/a.m.deroos/downloads/pdf_pubs/world/JFB06.pdf — [ft][sur]
- van Kooten, T. et al. (2010). Size at hatching determines population dynamics and response to harvesting in cannibalistic fish. *CJFAS* 67:401–416. https://staff.fnwi.uva.nl/a.m.deroos/downloads/pdf_pubs/world/CJFAS2010.pdf — [ft][sur]
- Gaeta, J.W. et al. (2018). Go big or … don't? *PLoS ONE* 13:e0194092. https://pmc.ncbi.nlm.nih.gov/articles/PMC5854328/ — [ft]
- Smith, K.M., C.K. Kovacs, M.V. Thomas & J.S. Diana (2016). *Management Plan for Northern Pike in Michigan.* MDNR Fisheries Report 15. https://www2.dnr.state.mi.us/publications/pdfs/DNRFishLibrary/FisheriesReports/FR015.pdf — [ft][ag][sur]
- Edeline, E. et al. (2007). Trait changes in a harvested population… *PNAS* 104:15799. https://pmc.ncbi.nlm.nih.gov/articles/PMC2000386/ — [ft][sur]: large pike are "not susceptible to cannibalism"
- Pierce, R.B., C.M. Tomcko & D.H. Schupp (1995). Exploitation of northern pike in seven small north-central Minnesota lakes. *NAJFM* 15:601. https://academic.oup.com/najfm/article-abstract/15/3/601/7882450 — [abs][sur]
- Pierce, R.B. & C.M. Tomcko (2003). *TAFS* 132:143–153 — [abs via search][sur]
- Sharma, C.M. & R. Borgstrøm (2008). Increased population density of pike… *Ecol. Freshw. Fish* 17:590–596. https://agris.fao.org/search/en/records/65e01bb56eef00c2cea3cbbe — [abs][sur]
- Kipling, C. & W.E. Frost (1970). *J. Anim. Ecol.* 39:115–157 — [snip only][sur]
- Giles, N., R.M. Wright & M.E. Nord (1986). Cannibalism in pike fry… *J. Fish Biol.* 29 — https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1095-8649.1986.tb04930.x [abs][sur]
- Bry, C. et al. (1992). Sibling cannibalism among pike juveniles… *Env. Biol. Fish.* 35 — https://link.springer.com/article/10.1007/BF00001160 [snip][sur]
- Alp, A. et al. (2008). Diet of pike in Çivril Lake, Turkey. *J. Appl. Ichthyol.* — [snip][sur]
- Grass pickerel, two northern populations (2020). *Can. J. Zool.* 98. https://cdnsciencepub.com/doi/10.1139/cjz-2019-0082 — [snip; 403][sur]

**Estimators (not re-read this session)**
- Then, A.Y. et al. (2015). *ICES J. Mar. Sci.* 72:82–92.
- Hoenig, J.M. (1983). *Fish. Bull.* 82:898–903.
- Lorenzen, K. (1996). *J. Fish Biol.* 49:627–647.
