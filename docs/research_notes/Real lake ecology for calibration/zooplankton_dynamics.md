# Crustacean zooplankton dynamics in north-temperate lakes (calibration notes)

Scope: standing stock, production, seasonal succession, mortality, refuges, grazing and patchiness of crustacean zooplankton (with rotifers where they enter totals), aimed at a ~0.07 ha, few-metre-deep mesotrophic lake slice with Daphnia and copepods eaten by bluegill, perch, minnows and fish larvae.

Conventions used throughout: DW = dry weight, WW = wet weight, C = carbon. 1 µg DW/L = 1 mg DW/m³ = 1 g DW per 1,000 m³. All "Inferences" arithmetic is mine, done from the cited equations, and is labelled as such.

Research limits for this pass: the shared web-search budget ran out partway through, so several classic sources were never read in full. These are Bottrell et al. 1976 (full text), the cladoceran constant of Shuter & Ing 1997, Lampert's DVM-cost papers, Burks et al. 2002, Folt & Burns 1999 and Cyr & Pace 1992. Numbers from them appear only where a readable primary or secondary text reproduced them. Anything not retrieved is listed under Gaps. Where useful, those entries add clearly labelled UNVERIFIED background values.

## Q1. Standing stock: biomass by trophic state and season, individual masses, conversion factors, densities

### Takeaway
Summer zooplankton biomass in small, shallow mesotrophic-to-eutrophic lakes is typically about 50–300 µg DW/L. The 81 shallow European lakes of Gyllström et al. (2005) had a median of 289 µg DW/L including rotifers. In Oneida Lake, May–October means were 97–315 µg DW/L total and 22–196 µg DW/L for Daphnia. Biomass scales with total phosphorus (TP) at a log–log slope of about 0.8–0.9. Carbon is 45–50% of dry weight, and dry weight is about 10% of wet weight. Under ice, zooplankton density averages about 25% of summer density across 101 lakes.

### Cited Findings

**Biomass versus trophic state (regressions and cross-lake surveys)**
- **Gyllström et al. 2005, 81 shallow European lakes.** Lakes spanned 38–68°N; mean depth 0.4–3.9 m (mean 1.7, median 1.5); area 0.001–270 km² (median 0.24 km²). TP was 4–532 µg/L (mean 100, median 55) and chlorophyll a 0.5–378 µg/L (mean 39.6, median 20.8). Total zooplankton biomass, rotifers included, was 4.7–5,161 µg DW/L (mean 477, median 289).
  - Sampling: integrated shore-to-centre transects through a 50 µm net, mostly twice in 2000 (late June–late July, then late July–end September) and once in 2001.
  - Stepwise regression: log10 ZOO (µg DW/L) = 0.71 + 0.88·log10 TP (µg/L), plus a climate term; r² = 0.49, n = 65. The table text was garbled in extraction, so verify the exact coefficients against the PDF.
  - The 0.88 slope compares with a mean of 0.81 (range 0.5–1.5) in earlier studies.
  - Benthic and plant-associated taxa were "typically almost half the total zooplankton biomass" and responded mainly to macrophyte cover.
  - Carbon was converted to dry weight with a factor of 2.2. — [Gyllström et al. 2005, L&O 50:2008–2021, doi:10.4319/lo.2005.50.6.2008 (open PDF, Lund)](https://lup.lub.lu.se/search/files/4775628/625280.pdf)
- **Hanson & Peters 1984, 49 lakes.** Mean crustacean zooplankton biomass correlated best with mean TP (r² = 0.72), better than with chlorophyll a (r² = 0.57) or Secchi depth. Adding maximum depth raised R² to 0.75. The coefficients were not retrieved. — [Hanson & Peters 1984, CJFAS 41:439–445, doi:10.1139/f84-052](https://doi.org/10.1139/f84-052)
- **McCauley & Kalff 1981.** Across lakes, crustacean zooplankton biomass rises with phytoplankton biomass. The zooplankton:phytoplankton biomass ratio falls as phytoplankton biomass increases. — [McCauley & Kalff 1981, CJFAS 38:458–463, doi:10.1139/f81-063](https://doi.org/10.1139/f81-063)
- **Hessen et al. 1995, 342 large Norwegian lakes (disagreement).** Cladoceran, calanoid and daphnid biomasses were *poorly* correlated with lake productivity and fish predation. Species identity and average size shifted instead. Herbivorous cladocerans plus calanoids made up about three quarters of metazoan zooplankton biomass. This contrasts with the strong TP–biomass regressions above, and the lakes are large, oligotrophic and soft-water. — [Hessen, Andersen & Faafeng 1995, CJFAS 52:733–742, doi:10.1139/f95-073](https://doi.org/10.1139/f95-073)
- **Bays & Crisman 1983, 39 Florida lakes (different climate).** Crustacean biomass–trophic-state equations did not differ significantly between temperate and Florida databases. Microzooplankton (ciliates, rotifers, nauplii) drove most of the biomass–trophic-state relationship; macrozooplankton related only weakly to trophic state. This comes from a search-result summary, not the full text. — [Bays & Crisman 1983 (USF record)](https://digitalcommons.usf.edu/geo_facpub/1735)

**Long-term seasonal means (a warm-water fish lake with yellow perch)**
- **Oneida Lake, New York.** Weekly samples were taken with a 153 µm net, towed vertically from 0.5 m above the bottom to the surface. May–October means over 1975–2024 were 97–315 µg DW/L for total zooplankton and 22–196 µg DW/L for Daphnia spp., computed from Watkins et al. (2011) length–weight regressions. My range is read from Table A1, whose columns were partly misaligned in extraction.
  - Daphnia biomass trended down by −1.71 µg/L/yr (adjusted R² 0.37), and 2024 was the lowest year on record after the quagga mussel and Bythotrephes invasions.
  - 1975–84 is labelled the "eutrophic period".
  - "Historically, the clear water in early summer was associated with an increase in zooplankton, in particular Daphnia." — [NYSDEC/Cornell 2024, The Fisheries and Limnology of Oneida Lake 1957–2024](https://dec.ny.gov/sites/default/files/2024-05/oneidalkfisheries.pdf)
- **Lake Erie (large lake).** Crustacean biomass was dominated by Cladocera in summer, with copepods predominant in spring, in both Lake Erie and the Bay of Quinte (Lake Ontario). Mean individual dry weights varied seasonally for every taxon. — [Culver et al. 1985, CJFAS 42:1380–1390, doi:10.1139/f85-173](https://doi.org/10.1139/f85-173)

**Example densities (individuals per litre)**
- **Krankesjön, Sweden.** The lake is 3.4 km², with mean depth 1.5 m (max 3 m), spring–summer TP 42 µg/L and chlorophyll a 8–18 µg/L.
  - June–August 2006 lake cladoceran densities: *Ceriodaphnia* 23.4 ± 10, *Diaphanosoma* 5 ± 8, *Bosmina* 2 ± 2 ind/L.
  - Fish-free 380 L enclosures reached about 188 cladocerans/L at low resource and about 745/L at high resource. — [Nicolle et al. 2011, PLoS ONE 6:e16534, doi:10.1371/journal.pone.0016534](https://pmc.ncbi.nlm.nih.gov/articles/PMC3031578/)
- **Voyageurs NP lakes, MN/ON (Bythotrephes-invaded boundary waters).** These are soft-water lakes with mean August temperature 20.8–22.3 °C, ice-covered 5 months a year.
  - Calanoid copepods: about 12–15 ind/L.
  - Nauplii plus young copepodites: 11.2 ind/L in low-Bythotrephes lakes and 6.9 ind/L in high-Bythotrephes lakes.
  - Biomass, low- versus high-Bythotrephes lakes: diaptomids 28.5 vs 40.3 µg DW/L; *Holopedium* 0.39 vs 4.64 µg/L; nauplii plus early copepodites 5.0 vs 3.8 µg/L.
  - Total microcrustacean loss with Bythotrephes: 54.2 µg/L. — [Kerfoot et al. 2016, Biol. Invasions 18:1121–1145, doi:10.1007/s10530-015-1050-9](https://link.springer.com/article/10.1007/s10530-015-1050-9)
- **Oneida Lake water column overwinter.** Overwintering Daphnia ranged from 0 to 2.5 ind/L between years. — [Cáceres 1998, Ecology 79:1699–1710](https://publish.illinois.edu/cacereslab/files/2020/09/Interspecific-variation-in-the-abundance-production-and-emergence-of-Daphnia-diapausing-eggs.pdf)
- **Mirror Lake, New Hampshire (oligotrophic).** Mean annual zooplankton biomass was 1.4–2.6 kg C/ha (3-year mean 2.0 kg C/ha). Copepods made up 55.4% of zooplankton biomass. — [Makarewicz & Likens 1979, Ecol. Monogr. 49:109–127, doi:10.2307/1942575](https://doi.org/10.2307/1942575)

**Under ice and seasonal range**
- **Hampton et al. 2017, 101 lakes from 42 research groups.** Mean winter values were 25.3% of summer zooplankton density, 43.2% of summer chlorophyll a and 15.8% of summer phytoplankton biovolume. In lakes with longer time series, winter conditions influenced the following summer's zooplankton biomass. — [Hampton et al. 2017, Ecol. Lett. 20:98–111, doi:10.1111/ele.12699](https://experts.umn.edu/en/publications/ecology-under-lake-ice/)
- **Lake Simoncouche, Québec.** The lake is 0.8 km², mean depth 2.2 m, max 8 m, TP 7.2 µg/L (called "mesotrophic" by the authors, though oligotrophic by TP), ice-covered 5–6 months.
  - Under-ice biomass shares: *Leptodiaptomus minutus* 35%, *Cyclops scutifer* 15%, *Kellicottia* 12%, *Daphnia* 11%, *Bosmina* 8%.
  - *Mesocyclops edax*, *Diaphanosoma*, *Holopedium* and *Leptodora* were absent under ice.
  - Cyclopoids and cladocerans concentrated at 7 m in the warmer (about 4–5 °C) bottom water, where biomass was about 3× that at 0–1.5 m.
  - Copepod and cladoceran biomass reached its minimum in the melting season. — [Boulianne et al. 2025, J. Plankton Res. 47(5):fbaf035, doi:10.1093/plankt/fbaf035](https://academic.oup.com/plankt/article/47/5/fbaf035/8236566)
- **Lake Superior nearshore (very different system).** Crustacean density was 0.9 ± 0.6 ind/L in winter against 14.2 ± 15.1 ind/L in summer. Cladocerans dominated in summer; cyclopoids and calanoids dominated in fall, winter and spring. — [Shchapov & Ozersky 2023, L&O, doi:10.1002/lno.12355](https://repository.library.noaa.gov/view/noaa/58357/noaa_58357_DS1.pdf)

**Conversion factors (dry, wet, carbon)**
- **Carbon:dry.** Carbon was 48 ± 1% of DW with minor variation among species, measured in crustaceans from a humic lake.
  - Atomic C:N:P ranged from 85:14:1 in *Daphnia longispina* to 212:39:1 in *Acanthodiaptomus denticornis*.
  - P content did not change with starvation or feeding. — [Andersen & Hessen 1991, L&O 36:807–814, doi:10.4319/lo.1991.36.4.0807](https://doi.org/10.4319/lo.1991.36.4.0807)
- **Other carbon fractions used.** Johannsson et al. (2000) assumed 50% C in DW. An Ecology 96 appendix assumed C = 45% of Daphnia DM, citing Hessen 1990. Gyllström et al. (2005) used DW = 2.2 × C, which is about 45% C. — [Johannsson et al. 2000](https://www.reabic.net/publ/Johannsson_et%20al_2000_Dreissena.pdf); [ESA Ecological Archives E096-279 Appendix D](https://esapubs.org/archive/ecol/E096/279/appendix-D.pdf); [Gyllström et al. 2005](https://lup.lub.lu.se/search/files/4775628/625280.pdf)
- **Dry:wet.** Johannsson et al. (2000) assumed zooplankton dry mass = 10% of wet weight, "consistent with the associated literature". — [Johannsson et al. 2000, J. Great Lakes Res. 26:31–54](https://www.reabic.net/publ/Johannsson_et%20al_2000_Dreissena.pdf)

**Individual dry mass (length–weight regressions, W in µg DW, L in mm, W = a·L^b)**
- **Cladocerans, as tabulated in Johannsson et al. (2000) Appendix 1a.**

  | Taxon | a | b | Attributed source |
  |---|---|---|---|
  | *Bosmina/Eubosmina* | 26.6 | 3.13 | Bottrell et al. 1976 |
  | *Daphnia*, *Diaphanosoma*, *Sida* | 5.00 | 2.84 | Dumont et al. 1975 |
  | *Holopedium* | 11.21 | 3.04 | not attributed |
  | *Chydorus sphaericus* | 33.23 | 3.21 | not attributed |
  | *Bythotrephes* | 11.13 | 2.77 | not attributed |
  | *Leptodora* | 0.44 | 2.67 | not attributed |

  The source column was partly misaligned in the extracted text. The copepod rows were misaligned too, so I did not use them. — [Johannsson et al. 2000, Appendix 1a](https://www.reabic.net/publ/Johannsson_et%20al_2000_Dreissena.pdf)
- **Pooled Daphnia regressions (conflicting).** A pooled Daphnia regression ln W = 1.468 + 2.829 ln L (n = 1303) appears in an EPA-linked table. A different form, W = 11.705·L^2.52, is attributed to Bottrell et al. (1976) elsewhere. Both come from search-result excerpts; neither was verified. — [search excerpt: Bird & Prairie-type guidelines page](https://www.researchgate.net/publication/248392908_Practical_guidelines_for_the_use_of_zooplankton_length-weight_regression_equations)
- **Culver et al. 1985.** The paper gives 30 length–weight relationships for 14 taxa, separating ovigerous and non-ovigerous cladocerans and copepod nauplii, early copepodites and adult males and females, plus individual weights per copepod stage. — [Culver et al. 1985, doi:10.1139/f85-173](https://doi.org/10.1139/f85-173)
- **Typical adult Daphnia size.** In a mesotrophic Québec lake, *D. pulicaria* was about 2 mm and *D. mendotae* about 1.4 mm. — [Gélinas, Pinel-Alloul & Ślusarczyk 2007, Hydrobiologia 594:175, doi:10.1007/s10750-007-9078-1](https://doi.org/10.1007/s10750-007-9078-1)
- **D. magna neonates.** These weighed about 8 µg DW. *D. magna* is a large pond species, not typical of lakes. — [Boersma & Kreutzer 2002, Ecology 83:2552–2561](https://epic.awi.de/id/eprint/5157/1/Boe2002b.pdf)

### Inferences
- **Daphnia mass at length**, computed from W = 5.00·L^2.84, with the pooled ln W = 1.468 + 2.829 ln L in brackets:

  | Length (mm) | Dry mass (µg) |
  |---|---|
  | 0.5 | 0.70 (0.61) |
  | 0.6 (≈ neonate) | 1.2 (1.0) |
  | 0.8 | 2.7 (2.3) |
  | 1.0 | 5.0 (4.3) |
  | 1.2 | 8.4 (7.3) |
  | 1.5 | 15.8 (13.7) |
  | 2.0 | 35.8 (30.8) |
  | 2.5 | 67 (58) |

  Multiply by about 0.48 for µg C and about 10 for µg WW.
- **Bosmina mass at length** (W = 26.6·L^3.13):

  | Length (mm) | Dry mass (µg) |
  |---|---|
  | 0.25 | 0.35 |
  | 0.30 | 0.61 |
  | 0.40 | 1.5 |
  | 0.50 | 3.0 |

  This is the same order as a small Daphnia juvenile.
- **Predicted total zooplankton biomass from the Gyllström TP regression** (rotifers included, climate term ignored):

  | TP (µg/L) | Predicted biomass (µg DW/L) |
  |---|---|
  | 10 | ≈39 |
  | 20 | ≈72 |
  | 30 | ≈102 |
  | 50 | ≈160 |
  | 100 | ≈295 |

  A mesotrophic simulated lake (TP about 15–30 µg/L) should therefore hold about 50–150 µg DW/L zooplankton in summer, of which Daphnia is often 30–60% judging from Oneida's ratio.
- **Converting to the simulated slice** (700 m², 3 m mean depth, 2.1 × 10⁶ L):

  | Standing stock | DW per m² | DW in slice | Carbon in slice | Wet weight in slice |
  |---|---|---|---|---|
  | 50 µg DW/L | 0.15 g | 105 g | ≈50 g | ≈1.05 kg |
  | 100 µg DW/L | 0.30 g | 210 g | ≈100 g | ≈2.1 kg |
  | 200 µg DW/L | 0.60 g | 420 g | ≈200 g | ≈4.2 kg |
- **Implied Daphnia densities.** 50–150 µg DW/L of Daphnia at a mean mass of 5–16 µg (1.0–1.5 mm) means about 3–30 Daphnia/L in summer. That matches the order of Krankesjön's 23 *Ceriodaphnia*/L for the smaller-bodied genus.
- **Winter level.** Scaling summer by Hampton's 25% gives under-ice densities of roughly 1–8 Daphnia/L in such a lake. Cáceres found 0–2.5/L in Oneida, so winter Daphnia can also approach zero in some years.

### Gaps
- **Rotifer and copepod individual dry masses** (Dumont et al. 1975; Bottrell et al. 1976; Culver et al. 1985 stage weights) were not read in full.
  - UNVERIFIED background orders of magnitude, not from a source retrieved here: rotifers about 0.01–0.5 µg DW; copepod nauplii about 0.1–0.5 µg; cyclopoid copepodites and adults about 1–5 µg; calanoid adults about 2–10 µg; *Ceriodaphnia* adults about 1–3 µg.
  - Verify these against Dumont et al. 1975 (doi:10.1007/BF00377592) and the Watkins, Rudstam & Holeck (2011) Cornell compilation (hdl:1813/24566), which I could not download.
- **Hanson & Peters (1984) coefficients** and Pace (1986) size-structure versus trophic gradient were not retrieved.
- **Under-ice biomass** in small mesotrophic warm-water-fish lakes was not found. Hampton et al. report density, not biomass. Boulianne et al. report biomass only graphically.
- **Spring-peak versus midsummer standing stock** for a small mesotrophic lake was not found as a ratio. Oneida gives May–October means only.

## Q2. Production, turnover, development time, growth and food thresholds

### Takeaway
Weight-specific production is set mainly by temperature and taxon. Daily P/B at 20 °C is about 0.16/d for herbivorous cladocerans, 0.10/d for cyclopoids and 0.04/d for calanoids, and 0.03–0.04/d for cladocerans below 10 °C. Biomass, by contrast, is set by food and body size (Shuter & Ing 1997). Annual production runs from about 5 g DW/m²/yr in an oligotrophic lake (Mirror Lake) to 2–24 g DW/m² per May–October season in Lake Erie basins. Daphnia egg development takes about 20 d at 4 °C, 7.6 d at 10 °C and 2.7 d at 20 °C. The zero-growth food threshold for Daphnia is about 0.06–0.1 mg C/L on good food and 2–3× higher on P-poor food.

### Cited Findings

**Empirical production models**
- **Shuter & Ing 1997, 108 lake zooplankton populations.**
  - 76% of the variation in growing-season weight-specific production was explained by temperature, growing-season length and taxon. Rates ranked Rotifera > Chydoroidea (cladocerans) > Cyclopoida > Calanoida.
  - Within taxa, biomass density, individual body size and food availability had no detectable effect on P/B.
  - 58% of the variation in growing-season biomass density was explained by individual body size, mean chlorophyll and lake mean depth.
  - The authors' model: production rates are set by temperature, biomass levels by food and body size. — [Shuter & Ing 1997, CJFAS 54:359–377, doi:10.1139/cjfas-54-2-359](https://doi.org/10.1139/cjfas-54-2-359)
- **Shuter & Ing seasonal daily P/B equation, as applied by Johannsson et al. (2000):**
  log10(median daily P/B) = A + 0.04336·T(°C), with A = −1.844 for cyclopoids, −2.294 for calanoids and −1.631 for rotifers.
  - Against egg-ratio estimates from a Lake Ontario monitoring site, Shuter & Ing performed better for cyclopoids and Stockwell & Johannsson better for cladocerans. — [Johannsson et al. 2000, J. Great Lakes Res. 26:31–54](https://www.reabic.net/publ/Johannsson_et%20al_2000_Dreissena.pdf)
- **Shuter & Ing growing-season form:** log10(P/B_gs) = α + β·T_gs + Φ·log10(gs), with a separate α per taxon (cladocerans, cyclopoids, calanoids), T_gs the growing-season temperature and gs its length in days.
  - Kerfoot et al. applied it with T_gs = 19.9 °C over May–October, but the constants were not printed. — [Kerfoot et al. 2016](https://link.springer.com/article/10.1007/s10530-015-1050-9)
- **Stockwell & Johannsson 1997.** Body size explained 81% of the variance in daily P/B at ≤10 °C and 48% at >10 °C. The two regressions shared a slope and differed in elevation.
  - Applied to Lake Ontario, they matched egg-ratio estimates for cladocerans but ran 4× and 10× higher for two copepod species, and 2× higher for total production. — [Stockwell & Johannsson 1997, CJFAS 54:2350–2360, doi:10.1139/cjfas-54-10-2350](https://doi.org/10.1139/cjfas-54-10-2350)
- **Stockwell & Johannsson equations, as applied by Johannsson et al. (2000):**
  - log10(daily P/B) = −0.23·log10(W µg DW) − 0.73 when the mean seasonal temperature is >10 °C.
  - log10(daily P/B) = −0.26·log10 W − 1.36 when it is <10 °C.
  - For non-predatory cladocerans they used flat values of P/B = 0.162/d (>10 °C) and 0.042/d (<10 °C).
  - Dreissenid veligers: 0.10/d (0.04/d below 10 °C). — [Johannsson et al. 2000](https://www.reabic.net/publ/Johannsson_et%20al_2000_Dreissena.pdf)
- **Plante & Downing 1989, 164 invertebrate populations in 51 lakes.** Mean annual biomass, individual body mass and mean annual temperature explained 79% of the variance in log annual production.
  - P/B varied systematically with population biomass.
  - Littoral and open-water populations did not differ.
  - TP and other trophic indicators correlated positively with production. Coefficients were not retrieved. — [Plante & Downing 1989, CJFAS 46:1489–1498, doi:10.1139/f89-191](https://doi.org/10.1139/f89-191)
- **Zhang et al. 2022 (refinement).** A resource-based model ties cladoceran and copepod daily P/B to temperature, phytoplankton biomass and community composition, and feeding selectivity. In mesotrophic and hypereutrophic lakes, control of P/B shifts from physiological limits in cold periods to resource limits in warm periods. Temperature-only models miss this. — [Zhang et al. 2022, CJFAS, doi:10.1139/cjfas-2021-0071 (USGS record)](https://www.usgs.gov/publications/physiological-and-nutritional-constraints-zooplankton-productivity-due-eutrophication)

**Annual or seasonal production by lake type**
- **Mirror Lake, New Hampshire (oligotrophic).**
  - Zooplankton community production: 22.3–29.3 kg C/ha/yr (3-year mean 25.2), against a mean biomass of 2.0 kg C/ha.
  - Copepods: 55.4% of biomass but only 19.3% of production. Rotifers: 39.8% of production.
  - Planktonic rotifer generation time: about 8–10 d at 17 °C.
  - Community respiration: 79.9% of assimilation, ranging from 20.5 kg C/ha/month (April) to 96.0 kg C/ha/month (June).
  - The authors found a linear relationship between net phytoplankton and zooplankton production across lakes, with ecological efficiency rising with trophic status. — [Makarewicz & Likens 1979, doi:10.2307/1942575](https://doi.org/10.2307/1942575)
- **Lake Erie 1993–94, May–October total zooplankton production (TZP; crustaceans, rotifers and veligers; very large lake).**
  - TZP was 1.86–23.77 g DW/m² per season across stations.
  - *Daphnia retrocurva* alone produced 15.42 g DW/m² at the offshore western-basin station, 88% of macrozooplankton production there. At a nearshore station it produced 2.40 g DW/m²: 12% more abundant and 13% longer offshore gave a 543% increase in production.
  - Rotifers contributed 17–66% of TZP.
  - Makarewicz & Likens relation: log10 TZP (mg C/m²) = 3.032 + 0.0063·PP (g C/m²).
  - Erie multiple regression: TZP (g DW/m²/season) = −36.5 + 62.7·ZML + 0.111·PP (n = 8, adjusted R² 0.94), where ZML is summer zooplankton mean length (mm) and PP is May–October primary production (g C/m²). — [Johannsson et al. 2000](https://www.reabic.net/publ/Johannsson_et%20al_2000_Dreissena.pdf)
- **Invertebrate predator effect.** Bythotrephes cut microcrustacean biomass by 40–60% and secondary production by about 67%, partly because the community shifted toward slower-turnover calanoids. Effects were pronounced at 20–40 Bythotrephes/L. — [Kerfoot et al. 2016](https://link.springer.com/article/10.1007/s10530-015-1050-9)

**Egg and embryo development time versus temperature (Bělehrádek)**
- **Coefficients**, from Johannsson et al. (2000) Appendix 1b, in the form D = a·(T − α)^b:

  | Taxon | a | α | b |
  |---|---|---|---|
  | *Daphnia* spp. | 65,912 | −6.10 | −2.12 |
  | *Bosmina/Eubosmina* | 3,750,848 | −15.40 | −3.11 |
  | *Diaphanosoma* | 1,767 | −1.90 | −1.08 |
  | *Diacyclops/Tropocyclops* | 18,901 | −4.80 | −1.77 |
  | *Mesocyclops edax* | 19,318 | −0.48 | −1.79 |
  | *Cyclops vernalis* | 8,128 | −2.08 | −1.67 |
  | *Leptodiaptomus minutus*, *L. ashlandi* | 40,994 | −4.72 | −2.00 |
  | *L. sicilis* | 45,284 | −5.79 | −2.00 |

  Calanoid coefficients were derived from Cooley & Minns (1978). — [Johannsson et al. 2000](https://www.reabic.net/publ/Johannsson_et%20al_2000_Dreissena.pdf)

**Food thresholds and growth (Daphnia)**
- **Gliwicz 1990, 8 daphnid species.** The threshold food concentration at which assimilation equals respiration is lower for large-bodied than for small-bodied species, under steady-state, low-mortality conditions. The abstract gives no values. — [Gliwicz 1990, Nature 343:638, doi:10.1038/343638a0](https://doi.org/10.1038/343638a0)
- **Boersma & Kreutzer 2002, *D. magna* on *Scenedesmus* at 20 °C** (flow-through, 3-day somatic growth g = [ln M3 − ln M0]/3):
  - Threshold for zero somatic growth (C0) on P-sufficient food: 64 (54–76) and 104 (86–115) µg C/L in two experiments.
  - On P-limited food (C:P 1200): 127 (99–252) and 311 µg C/L.
  - Adding dissolved P just before feeding restored 65–95 µg C/L.
  - Neonates born under low P grew 0.038 ± 0.003/d on low quantities of low-P food. — [Boersma & Kreutzer 2002, Ecology 83:2552–2561](https://epic.awi.de/id/eprint/5157/1/Boe2002b.pdf)
- **Tropical cladocerans (different system), from a search summary.**
  - *Daphnia gessneri*: threshold about 0.1 mg C/L at 22 and 27 °C, rising to 0.25–0.50 mg C/L at 32 °C.
  - At 27 °C, thresholds ranged from 0.05 mg C/L (*Moina*) to 0.25 mg C/L (*Diaphanosoma*). — [SciELO, Acta Amazonica abstract](https://scielo.br/j/aa/a/dBqyTDRk77ybXxTxJ3WyhBQ/abstract/?lang=en)
- **Cauchie et al. 2000.** Juvenile *D. magna* reached maximum growth rates at 20.2 °C. Laboratory length–weight and growth regressions slightly overestimated in-situ biomass and production. The abstract gives no rates. — [Cauchie et al. 2000, Hydrobiologia 421:47, doi:10.1023/A:1003921401756](https://doi.org/10.1023/A:1003921401756)

### Inferences
- **Daily P/B by temperature**, from the cited equations:

  | Taxon (source) | 4 °C | 10 °C | 15 °C | 20 °C | 25 °C |
  |---|---|---|---|---|---|
  | Cyclopoids (Shuter & Ing) | 0.021 | 0.039 | 0.064 | 0.105 | 0.174 |
  | Calanoids (Shuter & Ing) | 0.008 | 0.014 | 0.023 | 0.037 | 0.062 |
  | Rotifers (Shuter & Ing) | 0.035 | 0.063 | 0.105 | 0.172 | 0.284 |
  | Herbivorous cladocerans (flat Stockwell & Johannsson values) | 0.042 | 0.042 (≤10 °C) | 0.162 | 0.162 | 0.162 |

  The flat cladoceran step at 10 °C is crude; a smooth Q10-type curve passing through those two levels is a reasonable simulation choice. A P/B of 0.16/d means biomass doubles in about 4.3 days with no mortality.
- **Daily P/B by individual dry mass** (Stockwell & Johannsson):

  | Dry mass (µg) | Typical animal | P/B >10 °C (/d) | P/B ≤10 °C (/d) |
  |---|---|---|---|
  | 0.1 | | 0.32 | 0.08 |
  | 1 | | 0.19 | 0.044 |
  | 5 | 1 mm Daphnia | 0.13 | 0.029 |
  | 30 | 2 mm Daphnia | 0.085 | 0.018 |
- **Egg development time in days**, assuming D is in hours (the Daphnia values reproduce the familiar ~3 d at 20 °C):

  | Taxon | 4 °C | 10 °C | 15 °C | 20 °C | 25 °C |
  |---|---|---|---|---|---|
  | *Daphnia* | 20.4 | 7.6 | 4.3 | 2.7 | 1.9 |
  | *Bosmina* | 15.5 | 6.7 | 3.8 | 2.4 | 1.6 |
  | *Diacyclops/Tropocyclops* | 16.8 | 6.7 | 4.0 | 2.7 | 1.9 |
  | *Mesocyclops edax* | 55 | 12.0 | 6.0 | 3.6 | 2.5 |
  | *L. minutus* | 22.5 | 7.9 | 4.4 | 2.8 | 1.9 |
- **Annual turnover in Mirror Lake** (carbon basis) is 25.2 / 2.0 ≈ 12.6 per year. Its production is about 2.5 g C/m²/yr, or about 5 g DW/m²/yr at 48% C.
- **Makarewicz–Likens predictions** (50% C assumed):

  | Primary production (g C/m²/season) | Predicted zooplankton production |
  |---|---|
  | 100 | ≈4.6 g C/m² (≈9 g DW/m²) |
  | 150 | ≈9.5 g C/m² (≈19 g DW/m²) |

  The function is exponential in PP, so do not extrapolate above about 200 g C/m².
- **Target for a small mesotrophic slice.** Annual crustacean production of roughly 5–20 g DW/m²/yr is a defensible range. That is about 1.5–6 kg DW, or 15–60 kg WW, per 700 m² per year. This range is interpolated between Mirror Lake and Lake Erie, not measured in a comparable lake.
- **Threshold for simulated Daphnia.** Use about 0.05–0.10 mg C/L for zero growth on good food, raised 2–3× when the algae are P-poor (C:P ≈ 1000). Thresholds of smaller cladocerans (*Bosmina*, *Ceriodaphnia*) should sit higher, per Gliwicz 1990.

### Gaps
- **The cladoceran α of Shuter & Ing and their β and Φ growing-season constants** were not retrieved. Only the seasonal daily form for cyclopoids, calanoids and rotifers (slope 0.04336/°C) was found.
- **Daphnia maximum intrinsic rate of increase (r_max) versus temperature and food**, the incipient limiting level (ILL), and maximum juvenile growth rates (Lampert & Trubetskova 1996, Funct. Ecol.; Orcutt & Porter 1984) were not retrieved.
  - UNVERIFIED background values: r_max about 0.2–0.5/d at about 20 °C with abundant high-quality food, near 0 at about 5 °C; ILL roughly 0.2–1 mg C/L (it varies with method and species); maximum juvenile somatic growth about 0.4–0.6/d at 20 °C.
- **Annual production for small (<100 ha) mesotrophic warm-water-fish lakes** in g DW/m²/yr was not found. The Morgan et al. (1980) IBP synthesis and Downing & Rigler (1984) were not accessible.
- **Bottrell et al. 1976** was not read in full. Its citation, as it appears in reference lists, is "A review of some problems in zooplankton production studies", Norwegian Journal of Zoology 24:419–456. It is the standard compilation of development-time functions (Bělehrádek-type and ln-polynomial). The related Bottrell 1975, Oecologia 18:63–84, gives temperature functions for littoral Cladocera and Copepoda. The Bělehrádek coefficients above come from Johannsson et al. (2000) instead.
- **Huntley & Lopez 1992** is a marine-copepod global synthesis and was not pursued as directly relevant.

## Q3. Seasonal succession: PEG model, clear-water phase, midsummer decline, autumn, overwintering, resting eggs

### Takeaway
In meso- and eutrophic lakes, spring Daphnia growth on small edible algae produces a clear-water phase (CWP). In the documented cases it falls mid-May to early June in Schöhsee and Lake Mendota, and June to early July in western Lake Erie. Community grazing at the CWP peak reaches 85–170% of the lake volume per day.

Daphnia then crashes, first from food limitation. Rising fish predation, especially 0+ perch above about 20–50 kg/ha, then keeps it low through July and August. Summer is dominated by smaller cladocerans, copepods and rotifers, and an autumn crustacean peak follows. Daphnia re-founds each spring from overwintering adults (0–2.5/L) and from ephippia, which hatch only in early spring and contribute little.

### Cited Findings

**PEG model (Sommer et al. 1986), as summarised in course notes (secondary source)**
- **Spring.** Phytoplankton grows freely, then herbivores rise from resting-stage hatching and high fecundity. Short-generation herbivores increase first, and growth is roughly exponential until grazing exceeds algal reproduction.
- **Clear-water phase.** A clear-water equilibrium lasts until inedible algae become significant.
- **Crash.** Grazers become food-limited, with lower body weight per length and lower fecundity. Fish predation drives herbivores "to very low levels" and shifts the survivors to smaller sizes.
- **Summer.** Large crustaceans are replaced by small species and rotifers, and small grazers coexist under persistent fish predation.
- **Autumn.** A mixing-adapted algal community develops and fish pressure falls, giving an autumn zooplankton maximum that includes larger forms.
- **Winter.** Fecundity falls with food and temperature. Some species form resting stages, and some cyclopoid copepods emerge from diapause to make up overwintering populations. — [PSU course notes on the PEG model](https://web.pdx.edu/~rueterj/courses/ESM473-573/peg.html)

**PEG revision (Sommer et al. 2012)**
- The review revisits PEG in light of overwintering of key organisms, the microbial food web, parasitism, food quality as a limiting factor, and an extended role for higher-order predators.
- These newer interactions have limited effects on gross seasonal biomass patterns but strong effects on species replacements. — [Sommer et al. 2012, Annu. Rev. Ecol. Evol. Syst. 43:429–448, doi:10.1146/annurev-ecolsys-110411-160251 (record)](https://umimpact.umt.edu/en/publications/beyond-the-plankton-ecology-group-peg-model-mechanisms-driving-pl/)
- Under PEG, a distinct clear-water phase separates spring and summer blooms under more eutrophic conditions, and Daphnia is the most important grazer behind it. — [Univ. Konstanz RTG project B1 description](https://www.rtg-resilience.uni-konstanz.de/research/research-2/r3/projects-b/projects-b1-b4/b1/)

**Clear-water phase: timing, magnitude and causes**
- **Schöhsee, Germany (moderately eutrophic).**
  - The CWP occurs in mid-May. Secchi depth rises quickly while chlorophyll and particulate organic carbon in the <35 µm fraction drop.
  - Maximum zooplankton biomass and community grazing (170% of volume cleared per day) coincided with maximum transparency.
  - The algal decline was not related to nutrient depletion or climatic events.
  - Small phytoplankton supplied up to 88% of primary production before the CWP; large particles mattered more after the zooplankton maximum.
  - In enclosures, small particles were always higher without zooplankton. — [Lampert, Fleckner, Rai & Taylor 1986, L&O 31:478–490, doi:10.4319/lo.1986.31.3.0478](https://doi.org/10.4319/lo.1986.31.3.0478)
- **Lake Mendota, Wisconsin, 1987 (eutrophic, Wisconsin warm/cool-water fish lake).**
  - Low consumption by yellow perch and cisco let *D. galeata* expand in spring, giving a CWP "from mid-May until early June".
  - The subsequent decline came from food limitation after Daphnia overexploited the algae.
  - Perch and cisco predation then held Daphnia at low densities through July and August despite more abundant algae. — [Luecke et al. 1990, L&O 35:1718–1733, doi:10.4319/lo.1990.35.8.1718](https://doi.org/10.4319/lo.1990.35.8.1718)
- **Western Lake Erie.**
  - *D. g. mendotae* biomass peaked between 20 June and 11 July in both 1988 and 1989; *D. retrocurva* was abundant only in early June.
  - Daphnia grazing peaked in June and early July, coinciding with high Secchi transparency, and edible algae fell below 5 mm³/L.
  - Grazing was at its minimum in August, when edible algae increased. — [Wu & Culver 1991, J. Great Lakes Res. 17:425–436](https://www.reabic.net/publ/Wu_Culver_1991.pdf)
- **Lake St. George, Ontario (8 m × 15 m limnocorrals).**
  - High spring Daphnia biomass coincided with a spring clear-water phase.
  - In 3 of 4 corrals, summer transparency declined 3–5 weeks *before* Daphnia declined, driven by poor-food *Gloeococcus* blooms. So the summer turbidity was not caused by the Daphnia decline, and the poor-food blooms were not necessary for the Daphnia collapse.
  - The collapses coincided with 0+ yellow perch reaching 30–50 kg/ha. — [McQueen & Post 1988, Hydrobiologia 159:277, doi:10.1007/BF00008241](https://doi.org/10.1007/BF00008241)
- **Chlorophyll drop (very different system).** In a Mediterranean hypertrophic lagoon (Albufera, Spain), a *D. magna* clear-water phase cut chlorophyll by an order of magnitude, from >200 to <10 µg/L. This comes from a search summary. — [Miracle et al. 2002 (UV repository)](https://www.uv.es/biodiver/EBA/Repositorio/2000/Miracle_2002_Daphnia_magna_Albufera_UV.pdf)

**Midsummer decline: causes**
- **Fish predation.** Fish keep post-CWP Daphnia low (Luecke et al. 1990). The Daphnia collapse tracks 0+ perch biomass (McQueen & Post 1988; Mills & Forney 1983; see Q4).
- **Food limitation.** Food limitation follows overgrazing (Luecke et al. 1990; PEG).
- **Not readily explained by food conditions.** In the highly eutrophic Bautzen Reservoir, survival of adult *D. galeata* in the laboratory, with predation excluded, dropped sharply exactly when the field population declined, whatever food was offered. The authors concluded that adult mortality is not a direct effect of being unable to adjust filter appendages to high seston after the CWP. — [Voigt & Hülsmann 2001, Hydrobiologia 442:253, doi:10.1023/A:1017580620344](https://doi.org/10.1023/A:1017580620344)

**Overwintering, diapause and resting eggs**
- **Oneida Lake egg bank (Cáceres 1998).**
  - Sediment egg banks held more than 2.5 × 10⁴ eggs/m² of *D. galeata mendotae* and 8.0 × 10⁴ eggs/m² of *D. pulicaria*. Eggs remain viable for 125 years or more.
  - New diapausing-egg production ranged from 0 to more than 10⁴ eggs/m²/yr. At the peak of sexual reproduction, typically 15% of adult females carried ephippia, while about 50% of adult females carried no eggs of either kind.
  - Emergence occurred only in early spring and had ceased by 9 weeks after ice-out. None was seen from late June to mid-November.
  - Annual emergence was 0–25 Daphnia/m², about 1% of the bank: 3.5 *D. g. mendotae* and 4.5 *D. pulicaria*/m² in 1994, and 15.6 *D. pulicaria*/m² in 1995, reaching 28/m² at 5 m stations.
  - That equals 0–0.006 Daphnia/L in 5 m water. Emergence is therefore negligible to the spring population in some years and considerable in others, against overwintering water-column densities of 0–2.5/L. — [Cáceres 1998, Ecology 79:1699–1710](https://publish.illinois.edu/cacereslab/files/2020/09/Interspecific-variation-in-the-abundance-production-and-emergence-of-Daphnia-diapausing-eggs.pdf)
- **Hatching cues (Radzikowski et al.).**
  - Temperate ephippia are mainly activated by light or photoperiod combined with temperature (Stross 1966).
  - Incubated at 6–21 °C under 16:8 L:D, eggs from deep lakes hatched 7–37%, best at 6–9 °C and inversely related to temperature. Eggs from temporary ponds hatched 30–56% at every temperature.
  - Spring bottom temperatures in deep temperate lakes "usually do not exceed 6–8 °C". Daphnia in shallow ponds may hatch through the year.
  - Carvalho & Wolf (1989) reached at most 14.4% hatching from the top 8 cm of sediment of two deep German lakes, under constant light at 12 °C; both 20 °C and 6 °C gave less. — [Radzikowski, Krupińska & Ślusarczyk (accepted 2017), Limnology, doi:10.1007/s10201-017-0520-4 (open PDF)](https://d-nb.info/1132430437/34)
- **Under-ice reproduction (Lake Simoncouche).**
  - Daphnia: 27% carried ephippia at autumn overturn and 13% in early winter. Egg-bearing fell to 0 in late winter, then rose to about 6% before ice-off and 21% at spring overturn.
  - *Bosmina*: up to 8% egg-bearing in late winter and 14% at spring overturn, with juveniles appearing in early and mid-winter.
  - *L. minutus*: 28% egg-bearing in the melting season and 44% at overturn. Nauplii peaked in the melting season in deep layers. — [Boulianne et al. 2025](https://academic.oup.com/plankt/article/47/5/fbaf035/8236566)

### Inferences
- **Simulation calendar for a small mesotrophic lake.**
  - Daphnia stays low under ice, at roughly 0–2 per litre with little reproduction, until spring overturn.
  - It grows near-exponentially once the water passes about 10 °C (egg development under 8 days) and food exceeds about 0.1 mg C/L.
  - It reaches a mid-May to mid-June peak (later for a cooler or larger lake) that clears the water for about 2–4 weeks, the Mendota example.
  - It crashes from starvation within about 1–3 weeks of the CWP.
  - It is held low in July and August by YOY fish, recovering partly in September and October as fish predation falls.
- **Ephippia as a recruitment pathway.** They should matter only after a population collapse or freeze-out. Per m² of bottom, Cáceres's emergence equals well under 0.01 Daphnia/L in a 3 m column. Overwintering adults are the main source in permanent lakes.
- **Resting-egg production** should be triggered at the autumn and early-winter decline, and at the post-CWP crash in some populations. Cáceres reports peak sexual reproduction as typically 15% of adult females carrying ephippia but does not give its season. The Simoncouche data show ephippia at autumn overturn and in early winter.

### Gaps
- **CWP statistics across many lakes** (onset date, duration, % chlorophyll drop) were not retrieved, including Matsuzaki et al. 2021 for Mendota and Monona, and Straile's Lake Constance phenology.
- **Copepod diapause specifics** (for example, *Cyclops vicinus* or *Diacyclops* copepodite IV/V in sediment over summer or winter; Santer & Lampert 1995) were not retrieved. Only the general PEG statement and the Simoncouche taxa list are cited.
- **Autumn peak magnitudes** relative to spring were not found as numbers.
- **The role of cyanobacteria and food quality** (for example, PUFA or sterol limitation) in the midsummer decline is mentioned in Sommer et al. 2012 but was not quantified here.

## Q4. Mortality: fish versus invertebrate predators versus starvation; collapses and rebound

### Takeaway
Fish are the decisive summer mortality source for Daphnia in warm-water lakes, and the clearest numbers are thresholds. In Oneida Lake, Daphnia tolerated about 10 kg/ha of age-0 yellow perch but collapsed above 20–40 kg/ha, when perch consumption exceeded Daphnia production. In limnocorrals, the collapse came at 30–50 kg/ha of 0+ perch. In Swedish enclosures it came at 10–20 YOY roach per m³ (0.09–0.39 g fish DW/m³).

Fish larvae under about 20 mm have little effect on large cladocerans. Large-juvenile YOY in late summer and autumn do. Adult omnivores may remove only about 1% of zooplankton biomass per day. Starvation causes the post-clear-water-phase decline. Invertebrate predators (*Chaoborus*, *Leptodora*, Bythotrephes) can dominate where fish are scarce or the hypolimnion is anoxic. Zooplankton biomass can rebound within about 2 weeks of release from fish predation, but large taxa may not return.

### Cited Findings

**Fish predation and collapses**
- **Oneida Lake, 1975–1979 (Mills & Forney 1983).**
  - *D. pulex* tolerated predation by 10 kg/ha of age-0 yellow perch, but reproduction could not compensate when YOY biomass exceeded 20–40 kg/ha.
  - Consumption by young perch exceeded *D. pulex* production in 1975 and 1977, when the daphnids disappeared. In 1976, when daphnids stayed abundant through late summer, maximum daily consumption was under 27% of production.
  - Since 1968, *D. pulex* has persisted through late summer in years when young perch were scarce and disappeared when they were abundant. — [Mills & Forney 1983, Trans. Am. Fish. Soc. 112:154–161, doi:10.1577/1548-8659(1983)112<154:IODPOP>2.0.CO;2](https://doi.org/10.1577/1548-8659(1983)112%3C154:IODPOP%3E2.0.CO;2)
- **Lake St. George limnocorrals.** Daphnia collapses coincided in all four limnocorrals with 0+ yellow perch reaching 30–50 kg/ha, and the perch selected by species and size. — [McQueen & Post 1988](https://doi.org/10.1007/BF00008241)
- **Krankesjön enclosures (Nicolle et al. 2011).**
  - Setup: 0+ roach at 0, 5, 10, 21 or 42 fish/m³, 19–29 mm long and 8–28 mg DW each, from 20 June to 2 August.
  - With high resources, cladocerans fell from 745/L (no fish) to about 156/L at 5 fish/m³, 76/L at 10 fish/m³ and under 8/L at ≥21 fish/m³.
  - The fish biomass that crashed cladocerans rose over the summer, from 0.09 g DW/m³ (5 July) to 0.36–0.39 g DW/m³ (late July and early August), as algal food increased.
  - Resources buffered predation only up to about 10 fish/m³. — [Nicolle et al. 2011](https://pmc.ncbi.nlm.nih.gov/articles/PMC3031578/)
- **Lake Mendota.** Spring fish consumption was low enough to allow the CWP. Summer predation by perch and cisco held *D. galeata* low. — [Luecke et al. 1990](https://doi.org/10.4319/lo.1990.35.8.1718)
- **Mehner & Thiel 1999, review of 18 temperate studies.**
  - Larval fish stocks have only a minor impact on small zooplankton (rotifers, copepodids, small cladocerans).
  - Stocks of 0+ juveniles can depress large cladocerans and copepods, "especially during late summer and autumn", owing to their larger gape and better prey detection.
  - Studies quantifying both 0+ consumption and zooplankton production are "very rare". — [Mehner & Thiel 1999, Env. Biol. Fish. 56:169–181, doi:10.1023/A:1007532720226](https://doi.org/10.1023/A:1007532720226)
- **Lake Aydat, France (eutrophic; adult fish).** Adult roach, perch and ruffe consumed about 1% of zooplankton biomass per day, mostly when other prey were scarce. Zooplankton made up 2.4% of the roach diet and 15.0% of the perch diet; macroinvertebrates and fish fry made up 41.8% each of the perch diet. — [Jamet 1994, Aquat. Sci. 56:376, doi:10.1007/BF00877183](https://doi.org/10.1007/BF00877183)
- **Feeding rate of juvenile perch (Ersoy et al. 2019).** Juvenile perch of 2–4 g eat about 4.5% of their body mass per day. At about 20 g WW of perch per m³, consumption was about 900 µg/L/d against about 500 µg/L of initial zooplankton biomass; the source does not say whether that biomass is wet or dry. — [Ersoy et al. 2019, PLoS ONE 14:e0212351, doi:10.1371/journal.pone.0212351](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0212351)
- **Stich & Lampert 1981, deep Lake Constance.**
  - Non-migrating *D. galeata* had a much higher birth rate than the migrating *D. hyalina*, but suffered high mortality near the surface.
  - The migrant *D. hyalina* was numerically dominant. — [Stich & Lampert 1981, Nature 293:396, doi:10.1038/293396a0](https://doi.org/10.1038/293396a0)

**Invertebrate predators**
- ***Chaoborus* in Oneida Lake, 2021–2024.**
  - Larvae averaged 42/m² at 4 m (Billington Bay) and 430–627/m² at stations 11 m and deeper. They exceed 1,000/m² in late summer and fall.
  - Fishless lakes and lakes with anoxic hypolimnia report 6,000–30,000/m².
  - Larvae migrate up at night to feed and return to the bottom by day.
  - The report suggests *Chaoborus* may have contributed to recent Daphnia declines. — [NYSDEC/Cornell 2024](https://dec.ny.gov/sites/default/files/2024-05/oneidalkfisheries.pdf)
- **Bythotrephes.** At 20–40 ind/L it reduced microcrustacean biomass by 40–60%, hitting cladocerans and cyclopoids hardest. Native *Bosmina* did not respond to its cues. — [Kerfoot et al. 2016](https://link.springer.com/article/10.1007/s10530-015-1050-9)
- **Morphological defences.** In a mesotrophic lake, helmet elongation in *D. mendotae* (1.4 mm) tracked the co-occurrence of *Chaoborus* and *Leptodora* plus YOY perch predation. The tail spine of *D. pulicaria* (2 mm) did not respond. — [Gélinas et al. 2007](https://doi.org/10.1007/s10750-007-9078-1)

**Starvation and other mortality**
- **Starvation.** After the clear-water phase, food limitation caused the Daphnia decline (Luecke et al. 1990). PEG step 6 says food-limited grazers lose body weight per length and fecundity (PEG notes).
- **Unexplained adult mortality.** In the midsummer decline, adult mortality rose independently of food conditions (Voigt & Hülsmann 2001).

**Rebound after release from predation**
- **Ersoy et al. 2019.** Plankton from Lake Müggelsee, nutrient-enriched, was held in about 1,000 L enclosures from 30 May to 11 July 2016. Perch at about 20 g WW/m³ fed for 4 days and were then removed.
  - Total zooplankton biomass recovered within about 2 weeks and finished above its pre-fish level.
  - Large calanoids did not reappear. Small cladocerans and rotifers proliferated, and phytoplankton stayed released from grazer control. — [Ersoy et al. 2019](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0212351)

### Inferences
- **Threshold scaled to the 0.07 ha slice.**

  | Case | YOY biomass | YOY in slice (wet) | Per m³ at 3 m depth (wet) |
  |---|---|---|---|
  | Tolerated (Oneida) | 10 kg/ha | ≈0.7 kg | |
  | Collapse (Oneida) | 20–40 kg/ha | 1.4–2.8 kg | ≈0.7–1.3 g |
  | Collapse (limnocorrals) | 30–50 kg/ha | 2.1–3.5 kg | ≈1.0–1.7 g |

  Nicolle's 0.09–0.39 g DW/m³ is about 0.4–2 g WW/m³, assuming fish DW of about 20% of WW; that 20% is my assumption. So three independent studies point to a collapse threshold of about 1–2 g WW of YOY planktivore per m³ in midsummer.
- **Consumption at the collapse threshold.** At 4.5% of body mass per day, 1–2 g WW of YOY per m³ eats about 45–90 mg WW/m³/d of zooplankton. That is about 4.5–9 µg DW/L/d, taking zooplankton DW as 10% of WW. Against 50–100 µg DW/L of Daphnia producing at about 0.13–0.16/d, which is 6.5–16 µg DW/L/d, fish would take roughly 30–140% of production. This is consistent with the observed tipping point.
- **Tuning target.** In a well-tuned simulation the fish's share of Daphnia production should swing from under about 30% in spring and in low-recruitment years (Mills & Forney 1983, 1976 data: <27%) to over 100% in high-YOY summers, ending in collapse.
- **Larval fish.** Before they reach about 20 mm they should eat mainly rotifers, nauplii and *Bosmina* and barely dent Daphnia (Mehner & Thiel 1999).

### Gaps
- **The share of annual zooplankton production consumed by invertebrate predators** (*Chaoborus*, *Leptodora*, cyclopoid copepods) versus fish versus starvation was not retrieved as a partitioned budget. Lunte & Luecke 1990 (*Leptodora* in Mendota), Neill 1981 (*Chaoborus*) and Hall et al. 1976 were not read.
- **Size-specific mortality rates** (per day) of Daphnia under fish predation were not retrieved. Egg-ratio death rates are commonly 0.1–0.3/d in midsummer, but that is UNVERIFIED.
- **Recovery time of large Daphnia after a summer collapse** in a whole lake, as opposed to a mesocosm, was not quantified. Mills & Forney imply recovery the following spring.

## Q5. Refuges that stabilise zooplankton under fish predation (DVM, hypolimnion and metalimnion, DHM into macrophytes, littoral, turbidity)

### Takeaway
Fish kairomones (5α-cyprinol sulfate from fish bile) induce Daphnia diel vertical migration (DVM). Its amplitude increases with fish density and is typically about 5–20 m in lakes. The cost is colder, food-poor daytime water, which slows egg development and lowers the birth rate.

A lake a few metres deep cannot offer an effective vertical refuge; one model suggests population growth drops when amplitude falls below about 6 m. In shallow lakes the macrophyte and littoral habitat matters more: plant-associated and benthic taxa make up about half of zooplankton biomass. Quantitative diel horizontal migration (DHM) data and the % of the population in refuge were not retrieved.

### Cited Findings
- **Gliwicz 1986, alpine Tatra lakes, Poland (*Cyclops abyssorum*).** DVM was absent in fishless lakes. Short-range migration appeared in lakes stocked with planktivores for decades, and long-range migration in lakes stocked for centuries to millennia. — [Gliwicz 1986, Nature 320:746, doi:10.1038/320746a0](https://doi.org/10.1038/320746a0)
- **Stich & Lampert 1981, deep Lake Constance.**
  - Migrating *D. hyalina* trades lower food, migration energy, prolonged egg development in cold water and a reduced birth rate for lower mortality.
  - It outnumbered the non-migrating *D. galeata*, which had higher births but high surface mortality. — [Stich & Lampert 1981](https://doi.org/10.1038/293396a0)
- **Hahn et al. 2019 (kairomone identity).**
  - The kairomone is 5α-cyprinol sulfate, a fish bile salt that induces DVM at picomolar concentrations.
  - DVM amplitude increases with fish density (citing Van Gool & Ringelberg 2002 and von Elert & Pohnert 2000).
  - Carp and trout bile at 0.4–3.9 nM CPS induced DVM indistinguishable from fish-incubation water at about 1 nM. — [Hahn et al. 2019, eLife (PMC6559785)](https://pmc.ncbi.nlm.nih.gov/articles/PMC6559785/)
- **Ahlers et al. 2024 (search-result summary, not full text).** In Lake Klostersee mesocosms, Daphnia did not migrate at 0.4–2 nmol/L CPS but did at 6.7–33 nmol/L, implying more than 2 nmol/L is needed in situ. This disagrees with the picomolar laboratory threshold. — [Ahlers et al. 2024, L&O Letters, doi:10.1002/lol2.10375](https://aslopubs.onlinelibrary.wiley.com/doi/10.1002/lol2.10375)
- **Individual-based DVM model (search-result summary, not verified against full text).**
  - DVM amplitudes are about 5–20 m in lakes, against hundreds of metres in the ocean.
  - Daphnia amplitude responds hyperbolically to fish biomass. At high fish biomass (2 g/m³) the standard amplitude is about 20 m.
  - Population growth declines once amplitude falls below about 6 m. — [Individual-based simulation of DVM of Daphnia, Limnologica 2008 (ScienceDirect S0075951108000297)](https://www.sciencedirect.com/science/article/pii/S0075951108000297)
- **Under-ice vertical distribution (Lake Simoncouche, 8 m max).** Cyclopoids and cladocerans concentrated at 7 m in warmer bottom water, with biomass about 3× that at 0–1.5 m, even though bottom O₂ fell to 2.5% saturation in mid-winter. — [Boulianne et al. 2025](https://academic.oup.com/plankt/article/47/5/fbaf035/8236566)
- **Macrophytes in shallow lakes (Gyllström et al. 2005).**
  - Benthic and plant-associated taxa were "typically almost half" of total zooplankton biomass, controlled mainly by macrophyte cover (PVI, the % of lake volume infested by plants).
  - Plants can act as a refuge for larger, mainly pelagic species, but the effect is non-linear: dense cover eventually harms pelagic taxa. — [Gyllström et al. 2005](https://lup.lub.lu.se/search/files/4775628/625280.pdf)
- ***Chaoborus* as a vertical migrant.** Larvae migrate into the water column at night and return to the bottom by day to avoid fish. — [NYSDEC/Cornell 2024](https://dec.ny.gov/sites/default/files/2024-05/oneidalkfisheries.pdf)

### Inferences
- **Cold-refuge cost.** Using the Daphnia Bělehrádek function (Q2), spending the day at 10 °C instead of 20 °C stretches egg development from about 2.7 to about 7.6 days, roughly 2.8× slower. This is the mechanism behind the "reduced birth rate" cost.
- **DVM in the simulated lake.** In a 3–5 m lake with a weak or absent hypolimnion, DVM can buy at most a few metres and little temperature contrast. Per the IBM excerpt, an amplitude under about 6 m gives little protection. So the simulation should not rely on DVM for Daphnia persistence.
- **More plausible refuges at this scale.**
  1. Diel horizontal migration into macrophyte beds by day.
  2. Daytime aggregation near the bottom or in low light.
  3. Turbidity or low light reducing fish reactive distance.
  4. Temporal refuge: spring, before YOY fish grow past about 20 mm.
- **Minimal simulation rule.** Let Daphnia daytime distribution shift toward depth or vegetation as a saturating (hyperbolic) function of local fish density (the kairomone proxy). Charge a growth cost through lower temperature and food in the refuge rather than a fixed penalty.

### Gaps
- **Quantified DVM costs** were not retrieved, for example the reduction in population growth rate from Loose & Dawidowicz 1994 (Ecology 75:2255) or Dawidowicz & Loose 1992 (L&O 37:1589). Nor were light thresholds or the relative rate of light change (Ringelberg 1999, Biol. Rev. 74:397) or the % of the population in the hypolimnion by day.
- **Diel horizontal migration** numbers (Burks et al. 2002, Freshwater Biol. 47:343; Lauridsen & Buenk 1996) were not retrieved, such as day versus night densities inside and outside macrophyte beds.
  - UNVERIFIED background: DHM is documented mainly in shallow eutrophic lakes, and is reversed or absent where littoral invertebrate or fish predators are dense.
- **Turbidity effects** on planktivore reactive distance were not retrieved (Vinyard & O'Brien 1976, J. Fish. Res. Board Can. 33:2845, bluegill), nor a hypolimnetic-refuge study in Michigan lakes (Tessier & Welser 1991, Freshwater Biol. 25:85; Leibold 1990, L&O 35:938).

## Q6. Grazing: clearance rates by Daphnia size and temperature; community grazing

### Takeaway
Individual Daphnia clearance follows the Knoechel & Holtby power law F ≈ 11.7·L^2.48 mL/ind/d (L in mm). That gives about 12 mL/d for a 1 mm animal, 32 mL/d at 1.5 mm and 65 mL/d at 2 mm, and the model may overestimate single-species rates by 20–50%. Filtering rises with temperature and size (Burns 1969), but no general temperature equation was retrieved. At a clear-water-phase peak the community clears about 85–170% of the lake volume per day: Daphnia alone cleared up to 86%/d in western Lake Erie, and the whole community cleared 170%/d in Schöhsee. In August it is far lower. Cladocerans supply over 85% of community grazing.

### Cited Findings
- **Knoechel & Holtby 1986 body-length model.** F = 11.695·L^2.48, with F in mL per animal per day and L in mm. Applied to Lake Erie *D. g. mendotae*, it gave filtering rates 20–50% higher than Wu & Culver's in-situ ³²P-yeast measurements. The authors attribute this to the model pooling a broad range of cladoceran taxa. — [Wu & Culver 1991, quoting Knoechel & Holtby 1986, L&O 31](https://www.reabic.net/publ/Wu_Culver_1991.pdf)
- **Lake Erie in-situ grazing (Wu & Culver 1991).**
  - Cladocerans contributed more than 85% of community grazing and copepods less than 15%, even where more than 80% of zooplankton were copepods (central and eastern basins).
  - Western-basin Daphnia grazing peaked above 200 mL/L/d in June and early July. Maximum rates were 140–855 mL/L/d, which equals filtering the whole volume every 1.2–7 days.
  - Edible algae were held below 5 mm³/L during those peaks.
  - Dreissenid veligers at a maximum of 100/L were estimated at only 2.9–64 mL/L/d. — [Wu & Culver 1991, J. Great Lakes Res. 17:425–436](https://www.reabic.net/publ/Wu_Culver_1991.pdf)
- **Schöhsee clear-water phase.** Community grazing reached 170% of the lake volume cleared per day at maximum zooplankton biomass. — [Lampert et al. 1986](https://doi.org/10.4319/lo.1986.31.3.0478)
- **Burns 1969 (search summary; abstract not read directly).** Maximum filtering rates of four Daphnia species were measured at 15, 20 and 25 °C. They increased with both temperature and body size, but no general length equation could be derived. Later work notes that filtering stops increasing above some temperature. This comes from a search-result summary of the abstract and of citing papers. — [Burns 1969, L&O 14:693–700, doi:10.4319/lo.1969.14.5.0693](https://doi.org/10.4319/lo.1969.14.5.0693)
- **Fluorescent microparticle method.** It gave *D. pulex* filtering, ingestion and gut-passage-time relationships with body length at several food levels, and diurnal changes in *D. longispina* filtering in situ, in agreement with published cell-count and radiotracer data. The abstract gives no numbers. — [Wiedner & Vareschi 1995, Hydrobiologia 302:89, doi:10.1007/BF00027033](https://doi.org/10.1007/BF00027033)

### Inferences
- **Per-animal clearance** (Knoechel & Holtby; reduce 20–50% for a single Daphnia species):

  | Length (mm) | Clearance (mL/ind/d) |
  |---|---|
  | 0.5 | 2.1 |
  | 1.0 | 11.7 |
  | 1.5 | 32 |
  | 2.0 | 65 |
  | 2.5 | 113 |
- **Community clearance in a simulated slice.**

  | Daphnia density and size | Clearance (mL/L/d) | Fraction of volume per day |
  |---|---|---|
  | 20/L at 1.5 mm | ≈640 | ≈64% (≈45% after the single-species correction) |
  | 2–5/L (fish-suppressed summer) | ≈60–160 | ≈6–16% |

  The first row is a clear-water-phase level, matching the Lake Erie and Schöhsee peaks. Mid-summer grazing then falls below typical algal growth rates of about 0.3–1/d, so algae escape control. That last figure is an UNVERIFIED background value.
- **Temperature.** The model has no temperature term. For a simulation, scaling clearance by a Q10 of about 2 below about 20 °C, and flattening or declining above about 25 °C, follows Burns' qualitative finding, but no coefficient was retrieved.

### Gaps
- **Temperature-explicit clearance equations** (Peters & Downing 1984, L&O 29:763; Burns 1969 values) and **community grazing across lakes** (Cyr & Pace 1992, CJFAS 49:1455; Haney 1973) were not retrieved.
- **Copepod and Bosmina clearance rates** in mL/ind/d were not retrieved.

## Q7. Spatial patchiness: patch and swarm densities and scales

### Takeaway
Little quantitative patch or swarm data was retrieved in this pass. The available evidence shows strong vertical structure: about 3× biomass at depth under ice. It also shows inshore–offshore differences: plant-associated taxa make up about half the biomass in shallow lakes, Daphnia emergence is higher inshore, and seasonal variability is larger at shallow stations. The classic syntheses (Folt & Burns 1999; Pinel-Alloul 1995) were not read.

### Cited Findings
- **Vertical (under ice, Lake Simoncouche).** Biomass at 7 m was about 3× that at 0–1.5 m. Rotifers and calanoids favoured 3–4.5 m, while cyclopoids and cladocerans favoured 7 m. — [Boulianne et al. 2025](https://academic.oup.com/plankt/article/47/5/fbaf035/8236566)
- **Horizontal (shallow lakes).** Plant-associated and benthic taxa were about half of total zooplankton biomass in 81 shallow lakes, scaling with macrophyte cover. — [Gyllström et al. 2005](https://lup.lub.lu.se/search/files/4775628/625280.pdf)
- **Inshore versus offshore emergence (Oneida).** In 1995, 28 *D. pulicaria*/m² emerged at the shallow 5 m stations, against 0.7/m² at the same stations in 1994. Inshore emergence drove the year-to-year increase. — [Cáceres 1998](https://publish.illinois.edu/cacereslab/files/2020/09/Interspecific-variation-in-the-abundance-production-and-emergence-of-Daphnia-diapausing-eggs.pdf)
- **Depth gradient (Lake Superior nearshore).** Zooplankton abundance and community composition were less seasonally variable at deeper stations than at shallower, more terrestrially influenced ones. — [Shchapov & Ozersky 2023](https://repository.library.noaa.gov/view/noaa/58357/noaa_58357_DS1.pdf)

### Inferences
- **Simulation structure.** Without patch-scale data, use two scales.
  1. A habitat scale (littoral and vegetated versus open water, near-bottom versus surface), with the littoral holding roughly half the biomass and local densities 1–3× the open-water mean.
  2. An optional behavioural swarm scale, used only cosmetically or for fish encounter rates, until real numbers are found.

### Gaps
- **Patch and swarm densities and length scales**, including Daphnia or *Bosmina* swarms and Langmuir-cell aggregation, were not retrieved. Sources to read are Folt & Burns 1999 (TREE 14:300–305), Pinel-Alloul 1995 (Hydrobiologia 300/301:17–42) and Kvam & Kleiven 1995 (Hydrobiologia 307:177, Daphnia swarms and DHM in response to *Chaoborus*).
  - UNVERIFIED background: littoral Daphnia swarms are reported at densities 10–100× the open-water mean, at metre scales.
