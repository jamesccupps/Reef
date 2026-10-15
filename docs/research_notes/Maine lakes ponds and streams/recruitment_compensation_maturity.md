# Stock–recruitment compensation (density-dependent survival of young fish) and size/age at maturity in centrarchids and percids of northern lakes

Context: in the sim, sunfish and perch decline toward zero. Young-of-year (YOY) mortality there is density-independent: a larval rate of 0.08/day ÷ length (cm), plus a juvenile rate of 0.035/day at 20 °C (Q10 3 below 20 °C). About 0.02–0.05 % of hatched fry reach spring, whatever the spawner number. These notes collect the real-lake evidence and the modelling practice, with numbers.

Source caveats:
- Several items below come only from search-result excerpts of Michigan DNR reports. These are flagged "(snippet; full text not read)".
- Some PDFs were scanned and could not be text-extracted.
- My web-search budget ran out before the last two planned lookups: a citable derivation of Beverton–Holt from M = M0 + M1·N, and female bluegill L50. They are listed under Gaps.

---

## 1. Is YOY survival/growth density-dependent in bluegill, pumpkinseed, perch and bass, and what stock–recruitment parameters exist?

### Takeaway
Strong compensation is well documented for perch and bluegill: experimentally, in long-term lake series and in calibrated models. It acts mainly through density-dependent juvenile growth, size-dependent juvenile and overwinter mortality, intraspecific predation on eggs and fry, and suppressed spawning at high adult density. Formal stock–recruitment fits for centrarchids are scarce and inconsistent. Myers' meta-analysis has percids and esocids (walleye, pike) but, as far as I could find, no centrarchids. Myers' maximum annual reproductive rate at low density is typically about 1–7 replacement spawners per spawner per year.

### Cited Findings

**Meta-analyses and stock–recruitment parameters**
- Myers, Bowen & Barrowman (1999, CJFAS 56:2404–2419, doi 10.1139/f99-201) used more than 700 spawner–recruitment series. They define the maximum reproductive rate as the number of replacement spawners produced per spawner per year at low abundance, without fishing mortality. This rate is fairly constant within a species and varies little among species. — [NOAA InPort record](https://www.fisheries.noaa.gov/inport/item/60041); [marineinfo.org](https://marineinfo.org/doc/publication/1225)
- Froese & Luna (2004) took Myers' rates for 49 bony fish species. The range is 0.4–13.5 replacement spawners per spawner per year, with no relation to fecundity (368 to 10 million eggs). — [Froese & Luna 2004, Acta Ichthyol. Piscat. 34:11–20](https://www.fishbase.de/rfroese/NoFecundRel.pdf)
- Freshwater species in that table (parsed from the PDF's text layer; verify against the original Table 1 before relying on them):
  - walleye *Stizostedion vitreum*: 2.48
  - northern pike *Esox lucius*: 1.66
  - brook trout: 4.71
  - lake trout: 2.51
  - Atlantic salmon: 4.31

  No *Perca*, *Lepomis* or *Micropterus* species are in the 49-species table. — [Froese & Luna 2004](https://www.fishbase.de/rfroese/NoFecundRel.pdf)
- Rose et al. (2001) refit Ricker curves to 249 populations (57 species) in Myers' database and grouped them by life-history strategy:
  - Mean steepness (fraction of maximum recruitment at 20 % of the unfished stock): periodic 0.70, equilibrium 0.57, opportunistic 0.56.
  - Recruitment variability sigma (SD of log residuals): equilibrium 0.55, periodic 0.60, opportunistic 0.71.
  - Caveat: the "equilibrium" group (fecundity ≤ 25,000 and egg diameter > 2 mm) was 106 of 110 salmonid populations. It is not a good proxy for nest-guarding centrarchids.
  - Pike were put in the periodic group (2.75 mm eggs, 32,000 eggs).

  — [Rose, Cowan, Winemiller, Myers & Hilborn 2001, Fish and Fisheries 2:293–327](https://aquaticecology.tamu.edu/wp-content/uploads/sites/3/2012/07/Rose_etal_FishFisheries.pdf)
- Rose et al. (2001) expect compensation to be strongest in equilibrium strategists: those that invest in individual offspring, i.e. parental care. Compensatory reserve should be highest in periodic strategists. — [Rose et al. 2001](https://aquaticecology.tamu.edu/wp-content/uploads/sites/3/2012/07/Rose_etal_FishFisheries.pdf)
- Zimmermann et al. (2018, J. Anim. Ecol.) found density-dependent recruitment in about 70 % of populations analysed. Detection of density-dependent somatic growth depended on method (26 % vs 69 %). — [Zimmermann et al. 2018 (PDF)](https://iiasa-9.eprints-hosting.org/id/eprint/15087/1/Zimmermann_et_al-2018-Journal_of_Animal_Ecology.pdf) (search summary; full text not read)

**Largemouth bass stock–recruitment**
- Florida largemouth bass, four north-central Florida lakes, 2010–2013 (Shaw & Allen 2016, TAFS 145):
  - The density-independent (proportional) model had no support; the Ricker model had the most support (a = 2.2, b = 0.009; units not stated in the abstract).
  - Recruit density was predicted better by successful broods than by spawner density.
  - Recruitment falls directly only below about 5 successful broods/ha.

  — [AGRIS record](https://agris.fao.org/search/en/records/65de5cf70f3e94b9e5ce58ec) (southern system; not northern)
- In six 0.4-ha ponds stocked with 6–40 adult largemouth bass, stock abundance was unrelated to the number of age-0 fish in October. Prey abundance and age-0 growth both declined as age-0 density rose. — [Allen et al. 2011, TAFS 140:1093–1100 (USGS record)](https://pubs.usgs.gov/publication/70005855)
- In 15 Missouri reservoirs, a log-linear model was most parsimonious for largemouth bass and crappies, and the Ricker model was best for spotted bass. The authors note that strong stock–recruitment relationships are generally lacking for black basses. — [TAFS 142:119 abstract](https://academic.oup.com/tafs/article-abstract/142/1/119/7831896) (search summary)

**Yellow perch**
- Oneida Lake, NY (more than 40 years of data):
  - Mortality of age-0 perch is "no longer depensatory". In the 1960s it had been depensatory, because walleye consumption saturated at high perch density.
  - Growth has become density-dependent.
  - Compensation is delayed: larger fish at the end of the first year reduce winter mortality.

  — [Irwin et al. 2009, TAFS 138:99–110](https://academic.oup.com/tafs/article/138/1/99/7888582)
- An Oneida Lake model (Rose et al. 1999) was calibrated to the lake's long-term data; see Q4 for numbers. Halving or increasing egg mortality changed first-feeders 4.4-fold but recruitment by only about 8 %. — [Rose et al. 2001, Table 1](https://aquaticecology.tamu.edu/wp-content/uploads/sites/3/2012/07/Rose_etal_FishFisheries.pdf)
- Windermere perch (*Perca fluviatilis*, a related species) is modelled with a dome-shaped (Ricker) stock–recruitment relation (Craig & Kipling 1983; Ohlberger et al. 2014). The perch decline there was driven by recruitment failure; cannibalism is a density-dependent driver of juvenile survival. — [Langangen et al., "Six decades of pike and perch population dynamics in Windermere"](https://www.researchgate.net/publication/229420873_Six_decades_of_pike_and_perch_population_dynamics_in_Windermere) (search summary)

**Bluegill**
- In 38 Midwestern bass–bluegill ponds (0.5–6 acres), bluegill standing stocks of 100–150 lb/acre (about 112–168 kg/ha) produced the most age-0 fish by fall. Lower and higher stocks produced considerably fewer. This is a dome-shaped (Ricker-like) stock–recruitment pattern (Novinger & Legler 1978). — [WDNR Bluegill Literature Review (Neuswanger et al. 2015)](https://dnr.wisconsin.gov/sites/default/files/topic/Fishing/Pubs_BluegillLiteratureReviewFinal.pdf)
- Beyerle & Williams (1967) poisoned bluegill eggs and fry on nests with copper sulfate in four Michigan lakes (80–200 acres) for the whole spawning season (May 18–Aug 9).
  - Fall age-0 catch was slightly higher the year after treatment, and only marginally lower than in control lakes.
  - The investigators concluded that the poisoning killed few if any more bluegills than would have died naturally in the first year.
  - In effect, nest-stage losses were fully compensated later.

  — [WDNR review 2015](https://dnr.wisconsin.gov/sites/default/files/topic/Fishing/Pubs_BluegillLiteratureReviewFinal.pdf)
- Michigan pond experiments (Saline Fisheries Research Station) found recruitment failure in stunted bluegill ponds when standing crop exceeded 224 kg/ha. A separate experiment found year-class failure only at the highest age-1 stocking densities (16.8 and 23.5 kg/ha). — [Michigan DNR Research Report](https://www.dnr.state.mi.us/PUBLICATIONS/PDFS/DNRFishLibrary/ResearchReports/RR1901-RR2000/RR1990.pdf) (snippet; full text not read — scanned PDF)
- In a Michigan pond study, removing 60 % and 90 % of each new year class did not keep bluegill populations desirable; removal "seemed to stimulate" birth and survival of more young. — [search.library.wisc.edu record](https://search.library.wisc.edu/digital/ATD6RKN5AIUJQO8B/text/AC6CTLEOKS2SHK8O) (snippet; full text not read; source attribution uncertain)
- Growth density dependence in bluegill:
  - Wiener & Hanneman (1982), northern Wisconsin lakes: condition and back-calculated length were negatively correlated with relative bluegill density.
  - Osenberg et al. (1988), nine Michigan lakes: most growth variation was density-dependent competition rather than climate.
  - Beckman (1950), Michigan: growth rose after winterkill, but for only one year.

  — [WDNR review 2015](https://dnr.wisconsin.gov/sites/default/files/topic/Fishing/Pubs_BluegillLiteratureReviewFinal.pdf)
- Contradiction: Hoxmeier et al. (2009) found that bluegill density and harvest added little to growth models in Illinois reservoirs. A Minnesota analysis noted that density-dependent bluegill growth has rarely been shown across many lakes. — [WDNR review 2015](https://dnr.wisconsin.gov/sites/default/files/topic/Fishing/Pubs_BluegillLiteratureReviewFinal.pdf); [MN Legislative Library report](https://www.lrl.mn.gov/docs/pre2003/other/980004.pdf) (snippet)

**Smallmouth bass**
- Smallmouth bass:
  - Three field datasets show percent YOY survival falling as egg or YOY abundance rises: Nebish Lake WI 1979–81 (Serns 1984), Jones Bay of Lake Opeongo ON (Friesen 1998), and Neves 1975.
  - In an Ontario habitat model, more nests produced fewer age-1 recruits per nest.

  — [Chu 2001, MSc thesis, Univ. Toronto, Fig. 2.34](https://utoronto.scholaris.ca/server/api/core/bitstreams/4beb3aaa-bf92-48ed-ab14-11f2ba6ac752/content)
- Dong & DeAngelis (1998) built an individual-based smallmouth bass model with cannibalism and food competition by older juveniles:
  - Recruitment was Beverton–Holt-like at low juvenile density with weak between-cohort interactions.
  - It became Ricker-like (overcompensating) at high density with strong between-cohort interactions.
  - Cannibalism lowered maximum recruitment and moved overcompensation to lower densities.

  — [USGS record, TAFS 127:174](https://www.usgs.gov/publications/consequences-cannibalism-and-competition-food-a-smallmouth-bass-population-individual)

### Inferences
- For perch and bluegill, the evidence supports a Beverton–Holt or mildly dome-shaped (Ricker) relation from eggs to age 1–2, with a large plateau. In Oneida, recruits stayed within ±5 % over a 4.4-fold range in first-feeders. The bluegill nest-poisoning study implies near-complete compensation after the nest stage.
- Without a centrarchid entry in Myers, a reasonable prior for the annual maximum reproductive rate of sunfish and perch is about 1.5–5. The walleye (2.48) and pike (1.66) values are in this range.
- Converting to lifetime: lifetime rate = annual rate ÷ (1 − adult annual survival). With adult survival around 0.5–0.6, the lifetime rate is about 4–12. Under Beverton–Holt, steepness = lifetime rate ÷ (4 + lifetime rate), which gives about 0.5–0.75. These formulas are the standard Myers and Hilborn–Walters relations, not values fitted to these species.
- Practical consequence: at low adult density, a real population's recruits per spawner rise several-fold. A density-independent sim cannot reproduce this.

### Gaps
- No Myers (1999) estimates found for *Lepomis*, *Micropterus* or *Perca flavescens*. RAM Legacy entries for lake centrarchids were not checked; they are probably absent, since RAM is mostly marine.
- No fitted Ricker or Beverton–Holt parameters were found for northern-lake bluegill or pumpkinseed. The pond evidence is qualitative or uses biomass units.
- The Shaw & Allen units, and the full text of Langangen et al. (Windermere Ricker parameters), were not retrieved.

---

## 2. Mechanisms, their magnitudes, and which life stage carries the compensation

### Takeaway
In northern lakes, most compensation for percids and centrarchids happens after the larval stage:
1. Density-dependent juvenile growth in summer.
2. Size-dependent mortality, from predators and from winter starvation.
3. Cannibalism, and predation by older juveniles on eggs and fry.
4. For bluegill and smallmouth bass, adult-stage limits: nest sites and social suppression of spawning.

Larval mortality in Oneida yellow perch was not density-dependent, which supports keeping the sim's larval rate density-independent. Predator saturation (a type II response) makes mortality depensatory, not compensatory. This happened in Oneida in the 1960s and in low-biomass model food webs.

### Cited Findings

**Larval stage: little density dependence (Oneida)**
- Irwin et al. (2009), Oneida age-0 yellow perch, egg → 18 mm (about 29 days):
  - Daily mortality was unrelated to density in any interval (all P > 0.3). In the larval interval: N = 38, R² = 0.024, P = 0.353.
  - Larval growth from 8 to 18 mm (mean 0.48 ± 0.02 mm/day) was not density-dependent (R² = 0.129, P = 0.278).
  - Larval mortality between 8 and 18 mm was 0.042 ± 0.005 per day.

  — [Irwin et al. 2009](https://academic.oup.com/tafs/article/138/1/99/7888582)
- Irwin et al. (2009), later stages:
  - Growth in the open-water stage (18 mm → 1 Aug) was strongly density-dependent (R² = 0.507, P < 0.001); in the bottom-dwelling stage (1 Aug → 15 Oct) weakly so (R² = 0.136, P = 0.015).
  - A winter mortality index fell as October length increased (R² = 0.382, P < 0.001, N = 38).
  - The authors call this "delayed compensation… through the first winter and second spring".

  — [Irwin et al. 2009](https://academic.oup.com/tafs/article/138/1/99/7888582)
- Walleye predation was the main regulator of young perch in Oneida. In the 1960s, mortality fell at high perch density because walleye feeding rates reached a limit, which is depensatory. — [Irwin et al. 2009](https://academic.oup.com/tafs/article/138/1/99/7888582)
- A 1978 Virginia Tech thesis on an Oneida model also reported depensatory mortality of young perch. At high abundance and high turbidity, mortality fell to density-independent levels of about 3 %, and it switched between density-dependent and density-independent regimes. — [VTechWorks thesis](https://vtechworks.lib.vt.edu/handle/10919/37567) (snippet)
- Cowan et al. (2000) concluded that density-dependent regulation of cohort growth through prey depletion is more likely in the late-larval to juvenile stage than in the high-density early larval stage. — [Rose et al. 2001](https://aquaticecology.tamu.edu/wp-content/uploads/sites/3/2012/07/Rose_etal_FishFisheries.pdf)

**Juvenile stage: predator release and density-dependent growth (Oneida model)**
- In the Oneida model, survival from 18 mm to recruitment rose as 18-mm abundance fell (0.41 % → 0.85 % → 1.56 %), because walleye predation pressure dropped.
- Fewer juveniles grew faster and were longer, and predation risk falls with length. Mean recruit length was 141.8 → 144.5 → 151.8 mm.

— [Rose et al. 2001, Table 1](https://aquaticecology.tamu.edu/wp-content/uploads/sites/3/2012/07/Rose_etal_FishFisheries.pdf)

**Predator response: can be compensatory or depensatory (Lake Mendota model food webs)**
- Lake Mendota multispecies model (McDermot & Rose 2000), yearling perch survival against the number of entering yearlings:
  - Strongly negative (compensatory) in the 1-species food web (r² = 0.34) and the high-biomass 6-species web (r² = 0.49).
  - Very weak (r² = 0.04) or absent in others.
  - Positive (depensatory) in the low-biomass webs, where piscivore predation dominated.

  — [Rose et al. 2001](https://aquaticecology.tamu.edu/wp-content/uploads/sites/3/2012/07/Rose_etal_FishFisheries.pdf)

**Predation by conspecifics on eggs, larvae and fry (bluegill)**
- In Lake Opinicon, ON, 94 % of predation on bluegill nests from the water column was by conspecifics (Gross & MacMillan 1981).
  - Snails (11 %) and bullheads (7 %) preyed from the substrate.
  - Brood losses from nests at the edge of a colony were at least three times those from interior nests.

  — [WDNR review 2015](https://dnr.wisconsin.gov/sites/default/files/topic/Fishing/Pubs_BluegillLiteratureReviewFinal.pdf)
- Bluegill predation on bluegill:
  - Breck (1996) found a high rate of recruitment failure in stunted, high-density Michigan ponds, mainly from juvenile bluegill eating eggs, larvae and fry.
  - In Lake Caroline, VA, 83 % of fish caught near colonies with larvae in their guts were 1.5–5.0-inch bluegills (Bain & Helfrich 1983).

  — [WDNR review 2015](https://dnr.wisconsin.gov/sites/default/files/topic/Fishing/Pubs_BluegillLiteratureReviewFinal.pdf)
- Density of juvenile bluegill stocked in April was negatively correlated with the abundance of the following age-0 year class (Clark & Lockwood 1990). Bluegill larvae can starve within a few days of leaving the nest without suitable food. — [Michigan DNR report](https://www.dnr.state.mi.us/PUBLICATIONS/PDFS/DNRFishLibrary/ResearchReports/RR1901-RR2000/RR1990.pdf) (snippet)
- In a high-density pond, juvenile bluegill growth slowed when zooplankton fell below a threshold. Both the timing of the slowdown and the size reached by season's end were density-dependent (Breck 1997). — [WDNR review 2015](https://dnr.wisconsin.gov/sites/default/files/topic/Fishing/Pubs_BluegillLiteratureReviewFinal.pdf)

**Predation by other species**
- Young largemouth bass (about 179/acre ≥ age 3) consumed 58–93 % of littoral bluegill fry in Ridge Lake, IL (Santucci & Wahl 2003). Early-season fry suffered much higher mortality by fall. — [WDNR review 2015](https://dnr.wisconsin.gov/sites/default/files/topic/Fishing/Pubs_BluegillLiteratureReviewFinal.pdf)
- Escanaba Lake, WI:
  - When age-2+ walleye exceeded about 25/acre and northern pike became established, panfish catch rates crashed.
  - At about 15/acre, panfish catch rose to 0.04–0.06/hour.
  - "A small number of adult panfish" produced many juveniles that fed the predators, but very few reached adulthood (Kempinger & Carline 1977).

  — [WDNR review 2015](https://dnr.wisconsin.gov/sites/default/files/topic/Fishing/Pubs_BluegillLiteratureReviewFinal.pdf)

**Adult stage: limits on who spawns**
- Smallmouth bass: in Lake Opeongo, only 12–47 % of mature males spawned in a given year (Post 1982). — [Chu 2001](https://utoronto.scholaris.ca/server/api/core/bitstreams/4beb3aaa-bf92-48ed-ab14-11f2ba6ac752/content)
- Blueberry Pond, MI, has a very dense population of large bluegill (204/acre ≥ 8 in):
  - Only about 2 % of adults attempted to spawn, with 100–200 nests a year.
  - The same fish spawned normally when moved to low-density ponds. Social inhibition is suspected (Schneider 1999).
- Bluegill colonies hold 4–272 nests (Neff et al. 2004).
- Small parental males nest and spawn only when large parental males are absent (Jennings et al. 1997).

— [WDNR review 2015](https://dnr.wisconsin.gov/sites/default/files/topic/Fishing/Pubs_BluegillLiteratureReviewFinal.pdf)

**Timing of hatching**
- Birth date matters, and which cohorts survive is not consistent:
  - Lake Opinicon 1993: early-season bluegill fry were 17 % of fry production but 40 % of spring recruits (Cargnelli & Gross 1996).
  - Lake Opinicon 1998: most fall juvenile sunfish came from larvae produced after 12 June; about 40 % of larvae had appeared in open water by then. Embryo abundance on nests was unrelated to open-water larval density (Garvey, Herra & Leggett 2002, Ecol. Appl. 12:194–205).

  — [WDNR review 2015](https://dnr.wisconsin.gov/sites/default/files/topic/Fishing/Pubs_BluegillLiteratureReviewFinal.pdf); [QUBS project page](https://research.qubs.ca/projects/protracted-reproduction-in-sunfish-the-temporal-dimension-in-fish-recruitment-revisited)

### Inferences
- The sim's larval rate is consistent with Oneida, in both value and density independence. Integrating 0.08/L from 0.8 to 1.8 cm at 0.048 cm/day gives Z ≈ 1.35 (about 26 % survival). Oneida's 0.042/day × 29 days gives Z ≈ 1.22 (about 30 %). The missing compensation therefore belongs in:
  - (a) summer juvenile growth: food-limited and density-dependent;
  - (b) juvenile predation risk that falls with length and with predator saturation or switching;
  - (c) first-winter survival as a function of fall length;
  - (d) intraspecific predation by age-1+ conspecifics on eggs, larvae and fry, which is strongly density-dependent;
  - (e) nest and spawning suppression at high adult density, for bluegill and bass.
- A type II (saturating) predator response is depensatory. Unless predators switch prey or aggregate (type III), predation alone will not rescue a sparse sunfish population. Compensation at low density then comes from juveniles being larger, being less food-limited, and facing fewer conspecific cannibals.

### Gaps
- No lake data found that explicitly test a type III functional response of piscivores to larval-fish density in these species.
- Exact magnitudes for bluegill cannibalism or conspecific predation were not quantified per capita. The 94 % figure is a share of nest predation, not a rate.

---

## 3. Egg-to-age-1 survival at low and high spawner density; overwinter survival vs fall length

### Takeaway
Real survival from egg to age 1–2 is tiny and similar to the sim's: about 0.02 % egg → age 2 for Oneida perch. What differs is that it scales inversely with density. Overwinter survival depends strongly on size and predators:
- perch: threshold about 60–73 mm;
- largemouth bass: about 50–60 mm;
- bluegill: 20–30 mm fish lose more than 55 % over 150 days even when fed;
- smallmouth bass in Maine: 56–74 mm by fall, with about 200 days of winter starvation.

### Cited Findings

**Stage survival (Oneida yellow perch model, Rose et al. 1999, baseline vs ±egg mortality)**

| Quantity | Low egg mortality (0.06/d) | Baseline (0.11/d) | High egg mortality (0.15/d) |
|---|---|---|---|
| Egg mortality | 71 % | 90 % | 96 % |
| Eggs per ha | 0.80×10⁶ | 1.11×10⁶ | 1.35×10⁶ |
| First feeders per ha | 178,325 | 85,036 | 40,894 |
| 18 mm per ha | 60,594 | 30,329 | 15,325 |
| Survival 18 mm → age 2 | 0.41 % | 0.85 % | 1.56 % |
| Recruits (age 2) per ha | 205 | 210 | 221 |
| Adults per ha | 103 | 106 | 112 |
| Spawners per ha | 29.1 | 35.4 | 44.2 |
| % mature at age 4 | 24 | 41 | 54 |
| Eggs per spawner | 27,885 | 30,313 | 30,989 |
| Adult growth, mm/yr (age 4) | 18.5 | 20.9 | 22.0 |

The values are averages over the last 35 years of 50-year simulations; adult walleye were 20.2, 19.9 and 16.1 per ha. — [Rose et al. 2001, Table 1](https://aquaticecology.tamu.edu/wp-content/uploads/sites/3/2012/07/Rose_etal_FishFisheries.pdf)

**Bluegill overwinter survival**
- Michigan experimental ponds (0.5 acre), stocked with 1.1-inch age-0 bluegill at 4,348–8,502 per acre (Schneider & Breck 1997):
  - Overwinter mortality averaged 10 % with no predators (7 ponds) and 39 % with any predator.
  - With walleye as the only predator it was 55 % (range 25–89 %).
  - Walleye maintenance ration is 0.40 % body weight/day at 39 °F, so walleye keep feeding in winter.

  — [WDNR review 2015](https://dnr.wisconsin.gov/sites/default/files/topic/Fishing/Pubs_BluegillLiteratureReviewFinal.pdf)
- Survival fell to about 3 % under heavy walleye predation in pond trials, and density-independent mortality is reported to set in after about age 2. — [Michigan DNR abstracts](https://www.dnr.state.mi.us/PUBLICATIONS/PDFS/IFR/ifrlibra/Research/abstracts/1992abs.pdf) (snippet; full text not read)
- Shoup & Wahl (2011, TAFS 140:1298–1304) held age-0 bluegill of 20–30 mm and 50–60 mm TL at 4 and 9 °C, with or without food, for 150 days:
  - Mortality was strongly size-selective and tied to condition.
  - Small fish had more than 55 % mortality in all treatments, including fed ones.
  - Cold reduced activity and improved survival.

  — [OUP abstract](https://academic.oup.com/tafs/article-abstract/140/5/1298/7877534)
- With largemouth bass present, overwinter mortality rose by 16 % for large and 49 % for small age-0 bluegill relative to predator-free ponds (Shoup & Wahl 2008, TAFS 137). — [T&F record](https://www.tandfonline.com/doi/abs/10.1577/T07-038.1) (search summary)
- Contradiction: in Nebraska Sandhill lakes, bluegill abundance fell from fall to spring, but size-selective mortality was not detected in 10 of 10 cases. — [Jolley et al., SDSU](https://openprairie.sdstate.edu/nrm_pubs/94/) (search summary)

**Pumpkinseed overwinter survival**
- In a lab study of central Ontario fish, large age-0 pumpkinseed survived significantly longer than small ones, and density significantly shortened time to death (NAJFM 17:581, 1997). — [T&F record](https://www.tandfonline.com/doi/abs/10.1577/1548-8675(1997)017%3C0581:EOBSAP%3E2.3.CO;2) (search summary; abstract not retrieved)
- In a Canadian Shield lake, open-water age-0 pumpkinseed approached 35 mm TL in September, while littoral and shoreline fish were notably smaller. The threshold size for winter survival rises with winter length at higher latitude. — [Env. Biol. Fishes 2026](https://link.springer.com/article/10.1007/s10641-026-01836-6) (search summary)

**Yellow perch overwinter survival**
- An 18-lake study found size-selective overwinter survival, independent of lake size or predator community. Combined with earlier work, it proposed a 60 mm minimum length for surviving a Great Lakes-basin winter. — [Univ. Windsor thesis (2000)](https://scholar.uwindsor.ca/etd/1485) (search summary)
- Post & Evans (1989, CJFAS 46:1958–1968) showed size-dependent overwinter mortality of YOY perch in lab, in-lake enclosure and field experiments. — [Windsor thesis citation](https://scholar.uwindsor.ca/etd/1485) (search summary)
- In Lake Saint-Pierre, QC, overwinter survival probability is high above a pre-winter threshold of 66–73 mm. Size-selective mortality appeared in one year class and not another, which entered winter larger. — [Boussion 2025, UQAC thesis](https://constellation.uqac.ca/10286/1/Boussion_Imanol_2025_m%C3%A9moire.pdf) (search summary)
- Contradictions:
  - Nebraska Sandhill lakes: perch size-selective winter mortality went both ways.
  - Eurasian perch in central European lakes: no size-dependent winter mortality detected (Radke & Eckmann).

  — [Kaemingk/UNL](https://digitalcommons.unl.edu/natrespapers/681); [KOPS Konstanz](https://kops.uni-konstanz.de/entities/publication/902d8ca3-ead2-4ace-a0d1-dd7af0e07bb0) (search summaries)

**Largemouth bass overwinter survival**
- Post, Kitchell & Hodgson (1998, CJFAS 55:2588–2600) used 12 years of data from a northern-range lake:
  - Fish entering winter below roughly 50–60 mm were strongly affected, probably by starvation.
  - At high adult and juvenile density, predation controlled first-year survival.
  - At low density, survival depended on adult demography and on spawning date × growth × overwinter mortality.
  - The largest year classes needed only a moderate number of adults.
  - The repository record lists a different author string; verify the citation.

  — [Notre Dame repository record](https://curate.nd.edu/articles/journal_contribution/Interactions_among_adult_demography_spawning_date_growth_rate_predation_over_winter_mortality_and_recruitment_in_largemouth_bass_in_a_northern_lake/24723597) (search summary)
- Garvey, Wright & Stein (1998, CJFAS 55:2414–2424), Ohio:
  - Starved, 0.5× and 1.5× maintenance rations did not change overwinter survival of age-0 largemouth bass.
  - Small fish died at high rates only when predators were present.
  - Size-selective loss occurred in 2 of 8 ponds, probably from cannibalism.

  — [OSU Knowledge Bank](https://kb.osu.edu/items/1b18d408-ee3d-531d-99a6-dc2cda636eae)

**Smallmouth bass first-year survival (Maine and Ontario)**
- Maine smallmouth bass:
  - YOY reach 2.2–2.9 in (56–74 mm) by the end of the first season; some reach 4 in.
  - The northern range limit in Maine is set by surviving a winter starvation period of 200+ days below 50 °F.
  - Late re-nesting leaves progeny too small to survive the winter.

  — [Maine IF&W Black Bass Management Plan](https://www.maine.gov/ifw/docs/strategic-management-plans/blackbass.pdf)
- Smallmouth bass YOY stop feeding at about 7–10 °C and live on reserves (Shuter et al. 1980). Because stored energy rises faster with size than metabolic cost, survival is sigmoid in fall length. — [Chu 2001](https://utoronto.scholaris.ca/server/api/core/bitstreams/4beb3aaa-bf92-48ed-ab14-11f2ba6ac752/content)
- Shuter (1989) found a Q10 of 2.2 for starvation rate over 2.5–8 °C. At 17 °C, a starved 14-mm bass survived 8 days and a 62-mm bass 45 days. — [Wiley abstract](https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1095-8649.1989.tb03028.x); [TAFS 154:469 review](https://academic.oup.com/tafs/article/154/5/469/8209825) (search summaries)
- Smallmouth bass egg → black-fry mortality ranges 4–90 % (Carlander 1977; Friesen 1998). — [Chu 2001](https://utoronto.scholaris.ca/server/api/core/bitstreams/4beb3aaa-bf92-48ed-ab14-11f2ba6ac752/content)

**Bluegill management targets (Michigan)**
- One optimum (Beyerle 1977) is to limit young production to about 2,000 fall fingerlings per acre, with adult annual mortality near 50 %. — [Michigan DNR report 1961](https://www.dnr.state.mi.us/PUBLICATIONS/PDFS/IFR/ifrlibra/Research/reports/1961rr.pdf) (snippet)

### Inferences
- Oneida baseline: egg → age 2 survival ≈ 210 / 1.11×10⁶ ≈ 0.019 %, about 5.9 age-2 recruits per spawner per year. Across the three runs, 18-mm density × survival to age 2 stays nearly constant (≈ 240–260/ha). That is a Beverton–Holt plateau.
- So the sim's 0.02–0.05 % to spring is realistic as a level at high density. The defect is that survival does not rise when spawners are few. Expect real egg → age-1 survival to rise roughly 2–4-fold when density falls about 4-fold, as in the Oneida runs.
- For sunfish, a fall-length threshold of about 30–35 mm (pumpkinseed) to about 50 mm (bluegill) is plausible for a long northern winter. Below 20–30 mm, expect more than 50 % winter loss even with no predators.
- Late-hatched (July–August) fry will mostly fail, and early fry get the growing season. In practice this is a density-dependent filter, because crowding slows summer growth.

### Gaps
- No direct field estimates of egg → age-1 survival for northern-lake bluegill or pumpkinseed at contrasting spawner densities.
- Cargnelli & Gross (1996) overwinter size-survival numbers were not retrieved: the PDF link has moved.
- The 1997 NAJFM pumpkinseed overwinter paper: authors and numbers not retrieved (403).

---

## 4. How fish models implement compensation, with parameter values

### Takeaway
Process-rich models do not impose a stock–recruitment curve; compensation emerges from mechanisms:
- density-dependent growth from shared food, or home-range or space overlap;
- size-dependent daily mortality and predation risk;
- winter starvation from energy reserves by length;
- cannibalism;
- density-dependent maturity and fecundity.

Population-level models use Beverton–Holt or Ricker. The Beverton–Holt form follows from a juvenile mortality rate that rises linearly with the number in the cohort.

### Cited Findings

**Oneida perch–walleye IBM (Rose et al. 1999)**
- The model follows individual perch and walleye females and their progeny through egg, yolk-sac larva, feeding larva, YOY juvenile, yearling and adult.
- Density-dependent growth, survival and reproduction "emerge from the size-based interactions"; walleye predation is the main source of young perch mortality.
- Baseline egg mortality is 0.11/day; 0.06 and 0.15 were tested.
- Recruitment changed only 205 → 221 per ha. Compensation came from: walleye predation release for juveniles; density-dependent YOY growth, so longer recruits face less predation; faster adult growth, so 24 → 54 % mature at age 4; more spawners (29 → 44 per ha) and slightly higher fecundity.

— [Rose et al. 2001](https://aquaticecology.tamu.edu/wp-content/uploads/sites/3/2012/07/Rose_etal_FishFisheries.pdf)

**Lake Mendota multispecies IBM (McDermot & Rose 2000)**
- Six food webs were calibrated so that all species persist 100 years. Yearling perch density dependence ranged from strong (r² 0.34–0.49) to reversed, depending on food-web structure. — [Rose et al. 2001](https://aquaticecology.tamu.edu/wp-content/uploads/sites/3/2012/07/Rose_etal_FishFisheries.pdf)

**Smallmouth bass IBMs**
- Dong & DeAngelis (1998), smallmouth bass IBM: daily foraging, growth, survival and cannibalism, with age-1+ fish acting as both cannibals and competitors of age-0. This gave Beverton–Holt-like recruitment at low density and Ricker-like at high density. Length variation among age-0 fish increased with density. — [USGS record](https://www.usgs.gov/publications/consequences-cannibalism-and-competition-food-a-smallmouth-bass-population-individual)
- Chu (2001), smallmouth bass habitat/population model for Lake Opeongo and Long Point Bay. The OCR of the scanned thesis is partly garbled; flagged where relevant.
  - **Nest daily mortality** (Friesen 1998): 12.3 %/day as embryos, 7.9 %/day after hatch, 16 %/day during swim-up before metamorphosis.
  - **After metamorphosis:** daily % mortality decreases with length, from an empirical equation for YOY smallmouth bass (Houpt 1991). Its coefficients were not legible in the OCR.
  - **Overwinter:** a fish survives if its energy reserves, as a function of length, last longer than the winter (365 − ice-free days) (Shuter et al. 1980).
  - **Density-dependent growth** (adapted from Minns et al. 1996, northern pike): G_actual = G_max · AA^0.96 / (AA^0.96 + 0.0101 · THR^0.96).
    - AA is the habitat area available.
    - THR is the summed home range of all fish, with home range a function of length.
    - The 0.96 exponent gives G = 0.5·G_max at typical North American lake densities.
    - The 0.0101 gives G = 0.99·G_max when AA = THR.
    - The equation was reconstructed from garbled OCR. Pike keep about 90 % of maximum growth with under 20 % of their required home range.
  - **Juvenile and adult natural mortality:** 25 %/yr.
  - **Results:** a YOY bottleneck exists, and nesting habitat matters more than juvenile or adult habitat.

  — [Chu 2001](https://utoronto.scholaris.ca/server/api/core/bitstreams/4beb3aaa-bf92-48ed-ab14-11f2ba6ac752/content)

**Beverton–Holt origin and growth-based regulation**
- Beverton & Holt's original derivation contains explicit mortality terms: one that depends on cohort density (competition among recruits) and one that does not (environment, predation). — [Zimmermann, Enberg & Mangel 2021, ICES JMS (IMR record)](https://imr.brage.unit.no/imr-xmlui/handle/11250/2730307) (search summary)
- Lorenzen & Enberg (2002, Proc. R. Soc. B 269:49–54):
  - Density-dependent growth was significant in 9 of 16 populations with long size-at-age and biomass records.
  - The decline in asymptotic length per unit biomass is inversely related to mean biomass across populations.
  - Density-dependent growth alone is sufficient to regulate a population in a simple model. Density acts on L∞, not K, following Beverton & Holt.

  — [PMC abstract](https://pmc.ncbi.nlm.nih.gov/articles/PMC1690856)
- Density-dependent growth matters only if it changes survival or reproduction. Slower growth lengthens the time spent at vulnerable sizes, because mortality often falls with size. — [Rose et al. 2001](https://aquaticecology.tamu.edu/wp-content/uploads/sites/3/2012/07/Rose_etal_FishFisheries.pdf)

### Inferences

**The standard Beverton–Holt derivation (mathematical, not sourced)**
- If juvenile mortality is M(N) = M0 + M1·N over a stage of duration T, integrating dN/dt = −(M0 + M1·N)·N gives a recruitment curve of the form R = a·E / (1 + b·E):
  - a = e^(−M0·T)
  - b = (M1/M0)·(1 − e^(−M0·T))
- The form the brief proposes, M = M0·(1 + N/N50), is the same thing with M1 = M0/N50: at density N50 the per-capita mortality doubles.
- Alternatively, Ricker R = a·E·e^(−b·E) arises when mortality depends on initial cohort size or on cannibals, as in Dong & DeAngelis.

**Calibration anchor from Oneida**
- With 18-mm density about 30,000/ha and survival to age 2 of about 0.85 %, survival roughly doubles when density halves (0.41 → 0.85 → 1.56 %). This implies N50 is far below the operating density: the population is on the plateau.
- In the sim, set N50 so that a lake-wide YOY density of roughly 5–10 % of typical produces near-maximal (density-free) survival.

**Suggested mechanism set, in line with the sim's mechanistic philosophy**
1. Food-limited, density-dependent YOY growth, which the sim's FB4 scramble competition may already partly provide.
2. Size-dependent juvenile and predation mortality, e.g. daily M ∝ L^−1, or Lorenzen-type M ∝ W^−0.29. Lorenzen's allometric constant is from my prior knowledge and is not verified here.
3. A first-winter energy-reserve test against fall length.
4. Cannibalism and egg predation by age-1+ conspecifics, scaled by their density.
5. Optionally, a nest-site or social cap on the fraction of mature males that spawn: 12–47 % in Opeongo smallmouth bass, about 2 % at extreme bluegill density.

### Gaps
- Could not retrieve a primary source stating the M0 + M1·N → Beverton–Holt derivation; the search budget was exhausted.
- Houpt (1991) size-dependent mortality coefficients are illegible in the thesis OCR.
- No IBM parameter tables for bluegill or pumpkinseed density dependence. Breck's bluegill pond model and the Claessen/Persson perch cannibalism models were not retrieved.

---

## 5. Size and age at maturity, its plasticity, and how early maturity buffers populations

### Takeaway
Maturity in these species is highly plastic: slow-growing, crowded or heavily exploited populations mature younger and much smaller.
- **Pumpkinseed:** most northern (Ontario) fish mature in their third year (age 2→3) at about 50–70 mm SL. Stunted and winterkill populations mature 1–2 years earlier and more than 20 mm smaller.
- **Yellow perch:** males mature at ages 1–2, often near the minimum possible; females at 2–5 years. Great Lakes stocks mature at 144–233 mm (females); stunted Nova Scotia perch mature at age 2 near 95 mm.
- **Bluegill males:** parental males in northern lakes mature at ages 5–7 and 135–177 mm; cuckolders mature at age 2.
- **Female bluegill:** northern-lake L50 not found.

Earlier maturity at low density or high mortality is a major compensatory mechanism (Oneida model: 24 → 54 % mature at age 4).

### Cited Findings

**Bluegill**
- Lake Opinicon, ON (Gross & Charnov 1980):
  - Parental males usually mature at ages 7–8.
  - Cuckolders mature early: "sneakers" mainly at ages 2–3, "satellites" (female mimics) at ages 4–5.
  - Cuckolder testes are 5.6 % of body mass vs 1.2 % in parentals.
  - About 20 % of males mature as cuckolders, fairly constant even when growth varies (Ehlinger et al. 1997).

  — [WDNR review 2015](https://dnr.wisconsin.gov/sites/default/files/topic/Fishing/Pubs_BluegillLiteratureReviewFinal.pdf)
- Mature cuckolders grew 30 % more slowly and had 15 % of the survival of future parental males. Most cuckolders died by age 5; parentals lived to 11 (Gross 1982). — [WDNR review 2015](https://dnr.wisconsin.gov/sites/default/files/topic/Fishing/Pubs_BluegillLiteratureReviewFinal.pdf)
- Minnesota lakes, parental male bluegill (Jacobson 2005, NAJFM 25:203–210):
  - L50 was 135–156 mm in 1996 across 8 lakes, and 144–177 mm in 2001.
  - A50 was 6.1–6.8 years in 1996 and 4.8–6.5 years in 2001.
  - Reduced bag limits raised L50 by up to 25–29 mm in two lakes.
  - The author argues size, not age, governs bluegill maturation.

  — [Jacobson 2005 (WDNR copy)](https://dnr.wisconsin.gov/sites/default/files/topic/Fishing/Outreach_ReducedBGBagEvaluation.pdf)
- Stunted vs non-stunted Illinois populations (Aday et al. 2002):
  - In the stunted population all nesting males were < 6.3 in (160 mm); in non-stunted ones ≥ 7.1 in (180 mm).
  - Peak spawning in the stunted population was 3–4 weeks later.
  - Small parental males nested and spawned only without large males (Jennings et al. 1997).

  — [WDNR review 2015](https://dnr.wisconsin.gov/sites/default/files/topic/Fishing/Pubs_BluegillLiteratureReviewFinal.pdf)
- Exploitation and predation:
  - Drake et al. (1997): parental bluegill in heavily fished lakes matured younger and smaller. — [WDNR review 2015](https://dnr.wisconsin.gov/sites/default/files/topic/Fishing/Pubs_BluegillLiteratureReviewFinal.pdf)
  - Par Pond, SC, unexploited with abundant large bass: bluegill matured about 2 years older and 80 mm longer than in exploited reservoirs, starting at about 190 mm TL (Belk & Hales 1993). — [BYU ScholarsArchive](https://scholarsarchive.byu.edu/facpub/5488)
- Predator-induced delay of maturity (at age 1) occurred in only one of three populations, the one with a 30–40-year history of heavy predation (Belk 1998, Oecologia 113:203–209). Belk (1995) attributed variation in growth and age at maturity to environment, not genetics. — [BYU ScholarsArchive](https://scholarsarchive.byu.edu/facpub/5494); [WDNR review 2015](https://dnr.wisconsin.gov/sites/default/files/topic/Fishing/Pubs_BluegillLiteratureReviewFinal.pdf)
- Stunting and fecundity:
  - Minnesota stunted bluegill populations rarely exceed 90 mm and seldom live past age 4. — UMN Hatch Lab page (search summary; page now 404)
  - One stunted bluegill can produce 20,000–40,000 eggs a year. — [MSU Extension E1776 "My bluegills are stunted"](https://www.canr.msu.edu/resources/my_bluegills_are_stunted_help_e1776) (search summary)

**Pumpkinseed**
- Most pumpkinseed in native (Ontario) and introduced populations mature in their third year (age 2→3); 100 % maturity is reached between ages 2 and 5 (Fox 1994). — [Copp et al. 2004, Folia Zool. 53:237–254](https://www.reabic.net/publ/Copp_et%20al_2004_Lepomis%20gibbosus.pdf)
- Back-calculated mean standard length (SL) at ages 1/2/3 in Ontario populations:

  | Population | Age 1 (mm) | Age 2 (mm) | Age 3 (mm) |
  |---|---|---|---|
  | Lake Opinicon | 34 | 52 | 70 |
  | Plastic Lake | 25 | 48 | 66 |
  | Upper Beverly Lake | 25 | 46 | 61 |
  | Lower Dowsley Pond | 41 | 55 | 70 |
  | Upper Poole Pond | 30 | 60 | 95 |
  | Lac Vert, QC | 35 | 52 | 68 |

  — [Copp et al. 2004, Table 1](https://www.reabic.net/publ/Copp_et%20al_2004_Lepomis%20gibbosus.pdf)
- Ontario Freshwater Fishes Life History Database, pumpkinseed: age at maturity 2–3 years; fecundity 2,451–10,633 eggs; spawning at 17–26 °C; lifespan 7–10 years. — [ontariofishes.ca](https://www.ontariofishes.ca/fish_detail.php?FID=124)
- Fox (1994, Ecology) studied 27 pumpkinseed populations in eastern and central Ontario plus a transplant. Early maturity and higher gonad investment were associated with high density, contrary to the usual prediction of delayed maturity when crowded. — [QUBS project](https://research.qubs.ca/projects/growth-density-and-interspecific-influences-on-pumpkinseed-sunfish-life-histories); [Dunlop et al. (Harkness)](https://www.harkness.ca/PDFs/Contributions%202000s/Dunlop%20et%20al%20Diet%20and%20Divergence%20in%20introduced%20smb.pdf) (search summaries)
- Variation in pumpkinseed maturity:
  - Shallow winterkill ponds: fish matured 1–2 years earlier and more than 20 mm smaller than in an adjacent lake without winterkill (Fox & Keast).
  - Lake with poorer benthos: smaller fish that matured younger and smaller.
  - Native pumpkinseed in waters with piscivores mature later and larger, with lower gonadosomatic index (2013 Oecologia).

  — [QUBS project pages](https://research.qubs.ca/projects/effect-of-overwinter-mortality-in-reproductive-life-history-characteristics-of-pumpkinseed-lepomis-gibbosus-populations); [Springer s00442-013-2776-7](https://link.springer.com/article/10.1007/s00442-013-2776-7) (search summaries)
- Danylchuk & Fox (1994, Env. Biol. Fishes 39:119–127), two east-central Ontario lakes: in the stunted lake, a much smaller share of mature age-2 females actually spawned, and they spawned late. — [Springer](https://link.springer.com/article/10.1007/BF00004929)
- Other ranges:
  - Introduced English populations: mean age at maturity 2.0–3.9 years, strongly predicted by juvenile growth.
  - French populations: 1.3–2.3 years, earlier than Ontario lakes.

  — [CEFAS abstract](https://www.cefas.co.uk/data-and-publications/publications/list/publication-abstract/?id=14652); [QUBS](https://research.qubs.ca/projects/life-history-traits-of-pumpkinseed-lepomis-gibbosus-populations-introduced-into-warm-thermal-environments) (search summaries)

**Yellow perch**
- Feiner et al. (2017, CJFAS 74:2059), 13 Great Lakes stocks:
  - **Females:** A50 1.9 (Green Bay) to 5.2 years (southern Lake Michigan); most stocks about 2 or about 3 years. L50 144 mm (Saginaw Bay) to 233 mm (Lake Michigan); most 160–200 mm.
  - **Males:** A50 0.8 (western Lake Erie) to 3.0 years. L50 128 (southern Lake Michigan) to 190 mm (Les Cheneaux). Males mature smaller than females within each stock.
  - Faster-growing stocks matured younger but larger.
  - Males mature near the minimum physiologically possible age (1–2).

  — [Feiner et al. 2017 (NOAA repository PDF)](https://repository.library.noaa.gov/view/noaa/62247/noaa_62247_DS1.pdf)
- Long Lake, Nova Scotia (an overpopulated, stunted perch lake; Munro & MacMillan 2012):
  - Age at maturity was 2 years.
  - Mean TL was 95 mm at 2+, 110 mm at 3+, 124 mm at 4+, 134 mm at 5+.
  - A 1939 Nova Scotia stunted population was 92/108/125 mm at 2+/3+/4+.

  — [Proc. N.S. Inst. Sci. 47:131–141](https://ojs.library.dal.ca/nsis/article/download/nsisv47-1munro/3151)
- Other sources:
  - Michigan DNR: males mature at about 3 years, females at about 4. — [Michigan DNR yellow perch page](https://www.michigan.gov/dnr/education/michigan-species/fish-species/yellow-perch) (search summary)
  - FishBase: Lm 19.2 cm. — [FishBase](https://fishbase.se/summary/359)

**Smallmouth and largemouth bass (Maine)**
- Smallmouth bass:
  - Males mature at 3–4 years, females by 4–5; size at maturity 8–12 in (20–30 cm).
  - Effective fecundity is 2,000–3,000 eggs/lb (7,000–8,000/lb in the ovary).
  - Spawning runs mid-May to mid-June at 60–66 °F, with hatching in 5–8 days.
- Largemouth bass: 2,000–20,000 eggs/lb.

— [Maine IF&W Black Bass Management Plan](https://www.maine.gov/ifw/docs/strategic-management-plans/blackbass.pdf)

**Buffering by plastic maturity (Oneida model)**
- In the Oneida IBM, lower perch density raised adult growth (18.5 → 22.0 mm/yr at age 4) and length (205 → 221 mm at age 4).
- The share mature at age 4 rose from 24 to 54 %, and spawners per ha from 29.1 to 44.2.
- Egg production rose from 0.80 to 1.35 ×10⁶ per ha. This partly offset higher egg mortality and held adults at 103–112 per ha.

— [Rose et al. 2001, Table 1](https://aquaticecology.tamu.edu/wp-content/uploads/sites/3/2012/07/Rose_etal_FishFisheries.pdf)

### Inferences
- **Pumpkinseed, northern lake:** a 50 % maturity at about age 2–3 and about 60–80 mm TL (from the SL table, assuming TL ≈ 1.2–1.25 × SL; unverified conversion) fits Ontario. Stunted or crowded lakes can go down to about 50–60 mm TL at age 2.
- **Bluegill:** northern parental males are about 135–180 mm at 5–7 years. About 20 % of males (cuckolders) mature at age 2 at small size, probably about 70–90 mm, though no source was found for that length.
- **Yellow perch, Maine-type northern lake:** males about 80–130 mm at age 1–2; females about 110–180 mm at age 2–4. Stunted lakes are at the low end (about 95 mm at age 2).
- **For the sim:** maturity tied to length, using a probabilistic maturation reaction norm, rather than to a fixed age (`BIO` "matures ~1 yr" for minnows, etc.) automatically gives earlier maturity when growth is fast at low density. This buffers populations, as in the Oneida IBM.
- Sunfish complicate this, because crowding can make males mature earlier but suppress spawning (Blueberry Pond; Danylchuk & Fox). The net effect of crowding on egg output can therefore be negative, which is itself compensatory.

### Gaps
- No source found for female bluegill length at 50 % maturity in northern lakes. The Michigan DNR page (said to give "females 3–4 years") returned 403.
- Pumpkinseed sex-specific L50 in mm for Ontario lakes was not retrieved; Fox 1994 and Danylchuk & Fox 1994 full texts were paywalled.
- No Maine-specific maturity data for sunfish or perch were found. The Maine bass plan covers only bass.
