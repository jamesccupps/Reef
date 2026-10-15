# Whole-lake energy flow, biomass and production benchmarks for small north-temperate warm-water lakes

Scope note: compiled 2026-10-14 for validating a ~0.07 ha simulated slice of a mesotrophic lake (sim: ~12–17 kg fish ≈ 170–240 kg/ha; crayfish ~9 g/m²; snails ~3 g/m²; benthic insect larvae; Daphnia/copepods). Units: 1 t/km² = 1 g/m² = 10 kg/ha; 1 lb/acre = 1.121 kg/ha (definitional conversions, applied by me where marked "≈"). Unless stated otherwise, fish and invertebrate biomasses are wet (fresh) weight. Several primary sources (Hanson & Leggett 1982, Downing et al. 1990, Swingle 1950, Plante & Downing 1989, Rasmussen & Kalff 1987, Shuter & Ing 1997) were reachable only as abstracts or secondary citations; those limits are flagged inline and under Gaps. The session's web-search budget ran out before the last planned searches (zooplankton/benthos fraction eaten by fish, Butkas et al. benthic production, snail biomass), so those remain gaps.

## Q1. Fish standing stock (kg/ha) in natural temperate lakes vs managed bass–bluegill ponds; relation to TP / chlorophyll / primary production; per-species numbers and size structure

### Takeaway
Total fish standing stock in productive north-temperate and warm-water lakes typically falls between ~100 and ~350 kg/ha wet. Averages: ~120 kg/ha in southern Minnesota, ~100–200 kg/ha in Michigan, ~350 kg/ha in southern Wisconsin, and 131 kg/ha (range 7–683) across 60 Florida lakes. Hypereutrophic lakes reach ~500 kg/ha (Lake Wingra 494 kg/ha), and fertilized bass–bluegill ponds carry ~340–560 kg/ha. Biomass rises with TP and chlorophyll, but trophic state explains only ~25% of the among-lake variance in a single region. Piscivores typically make up ~15–25% of fish biomass, and sunfish dominate. The sim's 170–240 kg/ha is mid-range for a mesotrophic–eutrophic Midwestern lake.

### Cited Findings
**Empirical TP / productivity models**
- Hanson & Leggett (1982, *Can. J. Fish. Aquat. Sci.* 39:257–263, doi:10.1139/f82-036) compiled literature data. Total phosphorus was the best univariate predictor of fish biomass (r² = 0.75) and yield (r² = 0.84), better than the morphoedaphic index (MEI). Macrobenthos biomass/mean depth also predicted biomass (r² = 0.83) and yield (r² = 0.48). Coefficients were NOT retrieved. — [ResearchGate record](https://www.researchgate.net/publication/237181411_Empirical_Prediction_of_Fish_Biomass_and_Yield); [CJFAS DOI page](https://cdnsciencepub.com/doi/10.1139/f82-036)
- Downing, Plante & Lalonde (1990, *CJFAS* 47:1929–1936, doi:10.1139/f90-217):
  - Whole-community fish production was uncorrelated with the MEI.
  - It correlated with annual phytoplankton production (r² = 0.79), mean TP (r² = 0.67) and annual mean fish standing stock (r² = 0.67).
  - Phytoplankton → fish conversion was ~100× more efficient in oligotrophic than in hypereutrophic lakes.
  - Sustained yields were often only ~10% of community production.
  - Regression coefficients were NOT retrieved.
  - [CJFAS abstract](https://cdnsciencepub.com/doi/10.1139/f90-217); [UMN Experts record](https://experts.umn.edu/en/publications/fish-production-correlated-with-primary-productivity-not-the-morp/)
- Bachmann et al. (1996, *CJFAS* 53:842–855): 65 Florida lakes, oligotrophic → hypereutrophic. — [full text PDF](https://lake.wateratlas.usf.edu/upload/documents/f95-236.pdf)
  - **Sampling:** rotenone in 2–12 0.08-ha blocknets per lake (littoral and open water), warm season, 1986–1990/92.
  - **Total standing crop:** mean 131 kg/ha (range 7–683) in the 60 lakes with whole-lake estimates.
  - **Trophic-state fits:** fish crop increased with Chl a, TP and TN and decreased with Secchi depth, but r² was only 0.27, 0.24, 0.28 and 0.27. About 75% of the variance was unexplained. Crops rose about one order of magnitude from oligotrophic to hypereutrophic lakes, with no decline at the top.
  - **Bluegill:** average 38 kg/ha, ranked first. Threadfin shad ranked third at 21 kg/ha. Gizzard shad averaged 66 kg/ha in the lakes where it occurred.
  - **Piscivores** averaged ~22% of total fish biomass (range 0–73%); by trophic state 25, 28, 21 and 11% (oligo, meso, eu, hyper).
  - **Largemouth bass** averaged 15% of biomass (range 0–69%); by trophic state 20, 17, 16 and 4%.
  - **Centrarchids** averaged 66% of biomass (range 15–99%).
  - **Kautz (1980), quoted in Bachmann:** sport-fish crops of 52, 89 and 65 kg/ha in oligotrophic, meso–eutrophic and hypereutrophic Florida lakes; the differences were not significant.
  - **Same paper, Table 2:** log10 Chl a = 0.887·log10 TP − 0.174 (r² = 0.73; mg/m³).
  - **Context the paper cites:** Yurk & Ney (1989) found a strong standing-crop–TP correlation in 22 southern Appalachian reservoirs. Jones & Hoyer (1982) found sport-fish yield correlated with summer Chl a in 26 Iowa/Missouri lakes.

**Midwestern / north-temperate standing crops**
- Lake Wingra, Madison WI (eutrophic; Churchill 1976, WDNR Tech. Bull. 93; sampled 1972–74, part of IBP). Seen via library full-text search snippets. — [UW digital collection](https://search.library.wisc.edu/digital/AFT5MWSMAMSY3J86)
  - Mean standing crop of fish >75 mm ≈ 494 kg/ha; ~75% of it bluegill.
  - Bluegill >75 mm varied from 140 to 500 kg/ha between years.
  - Bluegill older than 2 years numbered 7,000–25,000 per ha, dominated by one strong 1971 year class with little recruitment in 1972–73.
  - The same bulletin cites Threinen & Helm (1952): ~325 lb/acre (≈350 kg/ha), excluding rough fish, as average for southern Wisconsin.
  - It also cites Moyle et al. (1950): 68 southern Minnesota game-fish lakes averaged ~110 lb/acre (≈120 kg/ha), maximum 444 lb/acre (≈490 kg/ha).
- Michigan (Schneider 1973, 64 lakes; via search snippet of MI DNR report).
  - Lakes with slow-growing bluegill had the highest total standing crop, 182 lb/acre (≈204 kg/ha).
  - "Normal" lakes averaged 88 lb/acre (≈99 kg/ha).
  - Lakes with only slow-growing yellow perch averaged 46 lb/acre (≈52 kg/ha).
  - A second snippet describes 12 Lower Peninsula lakes averaging 182 lb/acre with a maximum of 305 lb/acre (≈342 kg/ha). The two snippets describe the subset differently.
  - [MI DNR Research Report 1794](https://www2.dnr.state.mi.us/Publications/PDFS/DNRFishLibrary/ResearchReports/RR1701-RR1800/RR1794.pdf)
- Michigan pond experiment (MI DNR RR1788; via search snippet).
  - The control pond's mean fall standing crop over 5 years was 324 kg/ha.
  - Catchable bluegill rose from 45 to 351 per ha.
  - The authors suggested holding each new year class below 10,000 bluegill per ha to get faster growth.
  - [MI DNR abstract 1788](https://www.dnr.state.mi.us/publications/pdfs/IFR/ifrlibra/Research/abstracts/1788abs.htm)
- An Iowa paper cites Carlander (1950) for 100–400 lb/acre (≈112–450 kg/ha) as typical of most lakes and ponds. Carlander (1955, J. Fish. Res. Board Can.) was not retrieved. — [Proc. Iowa Acad. Sci. 58](https://scholarworks.uni.edu/pias/vol58/iss1/55)
- Bay of Quinte (Lake Ontario embayment, eutrophic–mesotrophic, 1994–2000) Ecopath fish groups sum to ≈16.5 t/km² ≈ 165 kg/ha. This is my sum of the group biomasses; see Q3 for the table. — [Blukacz-Richards & Koops supplement](https://aehms.org/wp-content/uploads/2018/08/Blukacz-Richards-and-Koops-Supplement.pdf)

**Managed bass–bluegill ponds (Swingle)**
- Swingle's 1950 Alabama Agric. Exp. Stn. Bulletin 274 is titled "Relationships and dynamics of balanced and unbalanced fish populations" (74 pp.). — [Houser reference list](https://seafwa.org/sites/default/files/journal-articles/HOUSER-193.pdf)
- Swingle (1951) estimated the carrying capacity of fertilized southeastern ponds at 300–500 lb/acre (≈336–560 kg/ha), averaging ~400 lb/acre (≈448 kg/ha). — [Schmittou (SEAFWA)](https://seafwa.org/sites/default/files/journal-articles/SCHMITTOU-311.pdf)
- Swingle (1949): annual bass + bluegill catch was <50 lb/acre (≈56 kg/ha) in unfertilized ponds and 175–200 lb/acre (≈196–224 kg/ha) in fertilized ponds. — [Schmittou](https://seafwa.org/sites/default/files/journal-articles/SCHMITTOU-311.pdf)
- Swingle (1951) stocking for fertilized ponds: 100 largemouth bass plus 1,000–1,500 bluegill per acre. "Balance" meant a yield sustained year after year in proportion to the water's fertility. — [Hooper (SEAFWA)](https://seafwa.org/sites/default/files/journal-articles/HOOPER-474.pdf)
- An overcrowded-bass Alabama farm pond had a forage-to-bass (F/C) weight ratio of 0.2, with 370.5 lb/acre (≈415 kg/ha) recovered on draining. — [Harders & Davies (SEAFWA)](https://seafwa.org/sites/default/files/journal-articles/HARDERS-777.pdf)
- Swingle indices (via a fisheries-techniques slide deck seen only as a search snippet; verify against Bulletin 274):
  - F/C (forage weight ÷ piscivore weight): desirable range 3–6.
  - Y/C (forage available to an average adult carnivore ÷ carnivore weight): 1–3.
  - AT (percent of total weight in harvestable-size fish): 60–85% for bass–bluegill.
  - [AFS Fisheries Techniques ch. 15 visuals](https://education.fisheries.org/wp-content/uploads//fisheriesTechniquesVisuals/Chap_15.pdf); [Sportfish Management in Alabama Ponds](https://extension.rwfm.tamu.edu/wp-content/uploads/sites/8/2013/10/Sportfish-Management-in-Alabama-Ponds.pdf)

**Per-species densities and biomasses**
- **Northern pike, north-central Minnesota (Pierce & Tomcko 2003, 2005, *TAFS* 134:231–241).** Pike >350 mm ran 3.2–59.0 fish/ha among lakes; pike >600 mm averaged only 1.6 fish/ha. Seen via a secondary summary. — [Gibson & Haedrich (Nature NL)](https://naturenl.ca/pike-population-in-minipi-lake-labrador/)
- **Northern pike, Nebraska Sandhill lake (2002 mark–recapture):** 35.8 fish/ha and 22.0 kg/ha. — [USGS pub 70025129](https://pubs.usgs.gov/publication/70025129)
- **Northern pike, three small South Dakota impoundments:** 5–14 kg/ha (1994) and 7–13 kg/ha (1995). — [SDSU thesis](https://openprairie.sdstate.edu/etd/447)
- **Northern pike, Savanne Lake, Ontario (ages 4–12, 1977–78):** biomass ~8.69 kg/ha, production ~2.76 kg/ha/yr. These are OCR-garbled decimals, so verify them. — [Lakehead thesis](https://knowledgecommons.lakeheadu.ca/handle/2453/2390)
- **Largemouth bass adults, Wisconsin (WDNR surveys):**
  - Machickanee Flowage: 4.1 per acre (≈10/ha), or 8.0 per acre (≈20/ha) with the Bailey modification. — [WDNR report](https://apps.dnr.wi.gov/doclink/lakes_fish-plant_reports/ocontomachickaneelake2003.pdf)
  - Mildred Lake: 2.9 per acre (≈7/ha). — [WDNR report](https://apps.dnr.wi.gov/doclink/lakes_fish-plant_reports/oneidamildredlake2005.pdf)
- **Largemouth bass, Florida:** a eutrophic-lake Ecopath model used 17.5 kg/ha for adults (from blocknets). Habitat-specific values were much higher, e.g. 242.4 and 98.8 kg/ha in bulrush (Bull et al. 1991). — [Rogers & Allen 2009 report](https://archives.waterinstitute.ufl.edu/news/publications/downloads/AllenLakeFishFinalReport.pdf)
- **Yellow perch, small southwestern Manitoba lakes (1978–79):** mean biomass 52.4 ± 51.2 kg/ha; sustainable yield 9.4 ± 12.1 kg/ha/yr. — [U. Manitoba thesis](https://mspace.lib.umanitoba.ca/handle/1993/3475)
- **Yellow perch, Cassidy Lake, Michigan (1964, pre-rotenone):** 24 lb/acre (≈27 kg/ha). Seen via a snippet of an MI DNR report. — [MI DNR RR1791](https://www.dnr.state.mi.us/PUBLICATIONS/PDFS/DNRFishLibrary/ResearchReports/RR1701-RR1800/RR1791.pdf)
- **Common carp, Upper Midwest:**
  - Damage threshold ~100 kg/ha (Bajer et al. 2009). At ~100 kg/ha native plant cover falls ~50%; above 200 kg/ha plants are nearly absent. — [RPBCWD carp page](https://rpbcwd.specialdistrict.org/carp)
  - South-central Minnesota lakes commonly carry 300–500 kg/ha. — [RPBCWD](https://rpbcwd.specialdistrict.org/carp); [Scott County Cedar Lake study](https://www.scottcountymn.gov/DocumentCenter/View/16280/2017-Cedar-Lake-Carp-Study)
  - Six Mile Creek lakes ranged 37–1,093 kg/ha; 9 of 15 exceeded 100 kg/ha. — [MCWD report](https://minnehahacreek.org/wp-content/uploads/agendas/8.1_-_Six_Mile_Creek_Carp_Assessment_Annual_Report_-_Fieldseth.pdf)
  - Normandale Lake: 163.8 kg/ha. — [NMCWD survey](https://www.ninemilecreek.org/wp-content/uploads/Normandale-Lake-2018-Fish-Survey-Summary.pdf)
  - Other Minnesota lakes: 13–400 carp/ha. — [Green Lake carp report](https://mn-chisagocounty2.civicplus.com/DocumentCenter/View/7724/2015-Green-Lake-Carp-Report-PDF)

### Inferences
- **The sim's total (170–240 kg/ha) is realistic** for a mesotrophic-to-eutrophic Midwestern lake. It sits above the Michigan "normal lake" mean (~99 kg/ha) and the southern Minnesota mean (~120 kg/ha), near the Michigan bluegill-dominated lakes (~204 kg/ha) and Bay of Quinte (~165 kg/ha), and below the southern Wisconsin average (~350 kg/ha) and hypereutrophic Lake Wingra (494 kg/ha). Anything persistently above ~400–500 kg/ha would read as a fertilized pond or a hypereutrophic, carp- or bluegill-stunted lake.
- **Sunfish dominance is realistic.** Bluegill made up ~75% of biomass in Lake Wingra, and centrarchids averaged 66% in Florida.
- **Piscivore share:** Florida averaged ~22% of biomass, Bay of Quinte ~19% (my sum: piscivores + walleye + smallmouth = 3.07 of 16.5 t/km²), and Swingle's F/C of 3–6 implies ~14–25%. A target of ~15–25% of fish biomass as bass + pike seems appropriate. Less than ~10% suggests unchecked panfish; more than ~35% is Swingle's "overcrowded bass" state.
- **Per-species plausibility for a 0.07 ha slice** (my arithmetic from the densities above):
  - Pike >350 mm at 3–59/ha → 0.2–4 pike; at 5–22 kg/ha → 0.35–1.5 kg of pike.
  - Adult bass at 7–20/ha → 0.5–1.4 adults. A slice this small cannot hold a stable adult piscivore population; it relies on immigration or a refuge, as the sim already does.
  - Bluegill >2 yr at Wingra densities (7,000–25,000/ha) → ~500–1,750 fish, i.e. at the top of the sim's fish budget.
  - Carp above ~7 kg in the slice (~100 kg/ha) would by itself predict macrophyte loss.
- **Bachmann's low r² values** mean that a single lake's fish biomass can sit 2–3× above or below what its TP or Chl predicts and still be realistic.

### Gaps
- Hanson & Leggett (1982) and Downing et al. (1990) regression coefficients were not retrievable (the CJFAS site returned 403). Carlander (1955) averages were not retrieved, and Bachmann et al.'s Fig. 2 regression lines (fish crop vs TP) are in a figure that was not extracted.
- No reliable kg/ha or fish/ha values were found for bullheads (black, brown, yellow) or for minnows/shiners in Midwestern lakes.
- No bluegill or perch length-frequency (size-structure) data beyond Wingra's year-class note and Bachmann's RSD-Q (stock-size proportion) statements.
- The Swingle F/C, Y/C and AT ranges come from secondary teaching material, not from Bulletin 274 itself.

## Q2. Production and turnover: fish production and P/B by species; zooplankton, benthic invertebrate and primary production by trophic state

### Takeaway
Lake fish communities produce on the order of 50–200 kg/ha/yr; the mean across 22 lakes was 82 kg/ha/yr. Community P/B is ~0.5–1.2 /yr and depends strongly on body size and on the share of young-of-year (YOY). Adult piscivores have P/B ~0.25–0.6; adult panfish ~0.4–0.8; YOY 2–9. Crustacean zooplankton turn over ~20–55 times a year (Ecopath P/B ~40–55 in Bay of Quinte), producing ~2–13 g C/m²/yr. Benthic macroinvertebrates produce ~1–11 g C/m²/yr: chironomid P/B ~10–14, snails ~3, crayfish ~1–1.5. Phytoplankton production spans ~7–25 g C/m²/yr in oligotrophic lakes and ~75–250 in eutrophic lakes. Small vegetated lakes add a comparable macrophyte/periphyton term.

### Cited Findings
**Fish production and P/B**
- Downing & Plante (1993, *CJFAS* 50:110–120, doi:10.1139/f93-013): 100 populations in 38 lakes worldwide. — [UMN Experts](https://experts.umn.edu/en/publications/production-of-fish-populations-in-lakes/)
  - log10 P = 0.32 + 0.94·log10 B − 0.17·log10 W (R² = 0.84), where P = annual production (kg/ha/yr), B = annual mean biomass (kg/ha) and W = maximum individual body mass (g).
  - Residuals rose with temperature, TP, Chl a, primary production and pH.
  - At a sustainable yield of ~10% of production, yield is <15% of standing biomass for most populations.
  - Exploited populations were ~70% more productive than unexploited ones at the same B and W.
- Randall, Minns & Kelso (1995): mean fish community production was 82 kg/ha/yr in 22 lakes vs 273 kg/ha/yr at 55 river sites. Mean fish weight and P/B were inversely correlated. — [OUCI record](https://ouci.dntb.gov.ua/works/40EMMM3l)
- Randall & Minns (2000, *CJFAS* 57:1657–1667) allometries, as applied in the Bay of Quinte Ecopath model:
  - P/B = 2.64·Wmat^−0.35 (Wmat = mean weight at maturity; units presumably g).
  - P/B = 4.22·Tmax^−0.982 (Tmax = longevity, yr).
  - Q/B was derived from P/B with "a simple modification of Ney's (1990) consumption equation", rendered in the PDF as Q/B = 2·(P/B) + 3 (extraction partly garbled).
  - [Blukacz-Richards & Koops supplement](https://aehms.org/wp-content/uploads/2018/08/Blukacz-Richards-and-Koops-Supplement.pdf); [FishBase reference](https://www.fishbase.se/References/FBRefSummary.php?ID=43367)
- Bay of Quinte Ecopath fish P/B (/yr) and Q/B (/yr). — [supplement Table 1](https://aehms.org/wp-content/uploads/2018/08/Blukacz-Richards-and-Koops-Supplement.pdf)

  | Group | P/B | Q/B |
  |---|---|---|
  | Walleye 5+ | 0.31 | 4.03 |
  | Walleye 4 | 0.52 | 5.16 |
  | Walleye 3 | 0.42 | 5.98 |
  | Walleye 2 | 0.86 | 7.59 |
  | Walleye 1 | 1.12 | 11.34 |
  | Walleye YOY | 5.90 | 33.60 |
  | Other piscivores | 0.41 | 4.90 |
  | Smallmouth bass | 0.35 | 4.07 |
  | Yellow perch 1+ | 0.58 | 3.85 |
  | Yellow perch YOY | 7.00 | 19.29 |
  | White perch 1+ | 0.56 | 4.24 |
  | White perch YOY | 8.00 | 25.61 |
  | Panfish 1+ | 0.44 | 3.73 |
  | Panfish YOY | 8.91 | 25.84 |
  | Invertivores | 0.35 | 2.87 |
  | Planktivores | 1.65 | 7.76 |
  | Trout-perch | 1.53 | 7.42 |
  | Freshwater drum | 0.25 | 4.08 |
  | Round goby | 1.51 | 5.16 |
  | Common carp | 0.11 | 3.45 |
  | Gizzard shad | 1.12 | 4.88 |
  | Alewife | 1.20 | 6.75 |

  Mapped using the PDF's raw text order. This mapping is internally consistent: YOY values are high, carp is low, and unassimilated fractions match the feeding modes.
- Florida eutrophic-lake Ecopath fish inputs (P/B, Q/B per yr). — [Rogers & Allen 2009](https://archives.waterinstitute.ufl.edu/news/publications/downloads/AllenLakeFishFinalReport.pdf)
  - Gar/bowfin/pickerel predators: 0.25, 4.0.
  - Largemouth bass: adult 0.63 (assumed U = 0.18, M = 0.4), 6.0; 6 mo–3 yr 1.00, 10.87; 0–6 mo 3.60, 41.64.
  - Black crappie: adult 1.50, 6.40; YOY 2.41, 16.21.
  - Bluegill/redear: adult 0.82, 6.50; YOY 2.00, 17.61.
  - Other centrarchids 1.80, 16.0; prey fish (killifish, mosquitofish) 2.42, 43.4; generalists (shiners, silversides) 2.00, 35.6; zoobenthivorous fish (shad, bullheads, chubsuckers) 2.12, 19.7.
  - Some P/B and Q/B values came from FishBase; some Q/B values were estimated by Ecopath.
- Northern pike, Savanne Lake: production ~2.76 kg/ha/yr on ~8.69 kg/ha (P/B ≈ 0.32, my division; OCR caveat). — [Lakehead thesis](https://knowledgecommons.lakeheadu.ca/handle/2453/2390)
- Two small shallow NE German lakes (Gollinsee, Schulzensee; reference and treatment halves, 2011): fish secondary production was only 0.023–0.047 g C/m²/yr. — [Mehner et al. 2022, Table 2](https://par.nsf.gov/biblio/10398700-trophic-transfer-efficiency-lakes)

**Zooplankton production**
- Bay of Quinte Ecopath zooplankton. — [supplement](https://aehms.org/wp-content/uploads/2018/08/Blukacz-Richards-and-Koops-Supplement.pdf)

  | Group | B (t/km²) | P/B | Q/B | Unassimilated |
  |---|---|---|---|---|
  | Herbivorous zooplankton | 3.68 | 51.98 | 189.07 | 0.6 |
  | Copepods | 0.85 | 46.67 | 125.40 | 0.4 |
  | Rotifers | 0.132 | 53.91 | 245.77 | 0.6 |
  | Predatory cladocerans | 0.027 | 39.73 | 91.66 | 0.2 |
  | *Cercopagis* | 0.013 | 26.52 | 217.04 | 0.2 |

  P/B came from Stockwell & Johannsson (1997) temperature-dependent allometric models; Q/P from Peters & Downing (1984).
- Gollinsee/Schulzensee: crustacean zooplankton production 3.47–12.77 g C/m²/yr. — [Mehner et al. 2022, Table 2](https://par.nsf.gov/biblio/10398700-trophic-transfer-efficiency-lakes)
- Compilation in Wotton (1994), reproduced on a UCL course page (g C/m²/yr). — [UCL chapter 6, Table 6.2](https://www.homepages.ucl.ac.uk/~ucbt212/chapter6.htm)
  - Eutrophic lake: Rotifera 1.0, Copepoda 1.8, Cladocera 1.9.
  - Herbivorous zooplankton in lakes: >1.8.
  - Herbivorous zooplankton in a fertilized pond: 22.7 per season.
- Shuter & Ing (1997, *CJFAS* 54:359–377), 108 lake zooplankton populations. Values were not retrieved. — [abstract index](https://acnpsearch.tweb-dev.unibo.it/singlejournalindex/6459965)
  - Weight-specific production was set mainly by temperature, growing-season length and taxon (rotifers > chydorids > cyclopoids > calanoids).
  - Biomass was set by body size, chlorophyll and mean depth; food and density had no detectable effect on the specific rate.
- Lake le Roux, South Africa (subtropical reservoir, NOT temperate): crustacean production 6–10 g dry/m²/yr; annual P/B ~20 for daphnids, ~55 for copepods, ~75 for *Moina*. — [Freshwater Biology 1987](https://onlinelibrary.wiley.com/doi/10.1111/j.1365-2427.1987.tb01315.x)
- Florida eutrophic-lake Ecopath: zooplankton appears to have P/B 20, Q/B 70 and EE 0.8, with biomass estimated by Ecopath. The column alignment in the extracted text is uncertain. — [Rogers & Allen 2009](https://archives.waterinstitute.ufl.edu/news/publications/downloads/AllenLakeFishFinalReport.pdf)

**Benthic invertebrate production**
- Bay of Quinte Ecopath benthos (B in t/km² ≈ g/m² wet; P/B, Q/B per yr). — [supplement](https://aehms.org/wp-content/uploads/2018/08/Blukacz-Richards-and-Koops-Supplement.pdf)

  | Group | B | P/B | Q/B | P/B source |
  |---|---|---|---|---|
  | Chironomids | 4.869 | 14.31 | 55.72 | Johnson & Brinkhurst 1971 |
  | Oligochaetes | 2.715 | 10.21 | 63.88 | Johnson & Brinkhurst 1971 |
  | Insects (other) | 2.046 | 5.22 | 34.47 | — |
  | Amphipods | 1.904 | 4.42 | 26.40 | — |
  | Gastropods | 0.913 | 3.32 | 13.42 | Tudorancea et al. 1979 |
  | Isopods | 0.782 | 5.18 | 36.33 | — |
  | Bivalves | 0.27 | 4.05 | 23.40 | — |
  | Other benthos | 0.154 | 4.96 | 25.80 | — |
  | Dreissenids | 225 | 1.33 | 6.83 | — |

  Crayfish P/B came from Parkyn et al. 2002, within the "insects" group sources.
- Crayfish *Orconectes virilis*, three Michigan lakes (Momot & Gowing 1977, *J. Fish. Res. Board Can.* 34:2041–2055; abstract seen via search, host URL not captured):
  - Standing biomass 46–213 kg/ha (4.6–21.3 g/m²); annual production 60–142 kg/ha/yr; turnover (P/B) 0.94–1.53.
  - Year-to-year changes were driven by density-dependent mortality and fecundity rather than by growth.
  - A related MI DNR report: trout ate 1–43% of age-0 crayfish production in three pothole lakes. — [MI DNR RR1706](https://www.dnr.state.mi.us/PUBLICATIONS/PDFS/DNRFishLibrary/ResearchReports/RR1701-RR1800/RR1706.pdf)
- Gollinsee/Schulzensee: benthic macroinvertebrate production 1.19–2.40 g C/m²/yr. — [Mehner et al. 2022, Table 2](https://par.nsf.gov/biblio/10398700-trophic-transfer-efficiency-lakes)
- Wotton (1994) compilation: Chironomidae in a eutrophic lake 11.2 g C/m²/yr; in a sewage lagoon 80.8 g C/m²/yr. — [UCL chapter 6](https://www.homepages.ucl.ac.uk/~ucbt212/chapter6.htm)
- Lake Aydat (France, eutrophic) Ecopath: zoobenthos (insect larvae, annelids, coelenterates, molluscs) given P/B ≈ 3 /yr and Q/B ≈ 11 /yr, assuming ~30% gross efficiency. The OCR is poor. — [Reyes-Marchant et al., ICES 1990 C.M. L:56](https://www.ices.dk/sites/pub/CM%20Doccuments/1990/L/1990_L56.pdf)

**Primary production by trophic state**
- Wotton (1994, "after authors"; UCL reproduction): plankton primary production of 7–25 g C/m²/yr in oligotrophic lakes, 75–250 in eutrophic lakes and 2,140 in a hypereutrophic lake. No mesotrophic row; 25–75 is commonly quoted, but only an unverified study aid gave it. — [UCL chapter 6, Table 6.1](https://www.homepages.ucl.ac.uk/~ucbt212/chapter6.htm)
- Vollenweider et al. (1974) classes, as quoted secondarily: total annual production ≤100 g C/m²/yr oligotrophic, 100–200 mesotrophic, >200 eutrophic. Rodhe (1969) used different bands. This conflicts with the Wotton/Likens-style bands above, presumably because of different definitions (total vs plankton-only, gross vs net). — [secondary source PDF](https://cord.uok.edu.in/Files/4701b853-a330-4f94-a00e-01555a32a0ff/Journal/55580455-ac0a-462c-9b10-6336e6ad4086.pdf)
- Three Central European lakes: daily phytoplankton production 157, 560 and 831 mg C/m²/d (oligotrophic, mesotrophic, eutrophic). — [Archiv für Hydrobiologie abstract](https://www.schweizerbart.de//papers/archiv_hydrobiologie/detail/146/86111/Phytoplanktonic_exudation_bacterial_reassimilation_and_production_for_three_diel_cycles_in_different_trophic_conditions)
- Layton's Lake, Nova Scotia (eutrophic): total 182 g C/m²/yr, of which 87 was plankton and 95 macrophytes. Long Lake, New Brunswick (oligo–mesotrophic): 36.4 g C/m²/yr, all phytoplankton. — [Dalhousie thesis](https://dalspace.library.dal.ca/handle/10222/35411)
- Gollinsee/Schulzensee: NPP of phytoplankton + macrophytes + epiphyton 122.9–208.7 g C/m²/yr, plus reeds 92–214 g C/m²/yr and allochthonous C 8–40 g C/m²/yr. — [Mehner et al. 2022, Table 2](https://par.nsf.gov/biblio/10398700-trophic-transfer-efficiency-lakes)
- Bay of Quinte phytoplankton Ecopath P/B ≈ 220–370 /yr across five functional groups. Edible phytoplankton: B = 7.01 t/km², P/B 257. Total phytoplankton biomass ≈ 10 t/km². Macrophytes 80.9 t/km²; epiphytes 6.3; periphyton 2.1. — [supplement](https://aehms.org/wp-content/uploads/2018/08/Blukacz-Richards-and-Koops-Supplement.pdf)

### Inferences
- **Downing & Plante (1993) applied to sim-like populations** (my calculations):
  - Bluegill: B = 100 kg/ha, W = 250 g → P ≈ 62 kg/ha/yr (P/B ≈ 0.62).
  - Minnows: B = 20 kg/ha, W = 10 g → P ≈ 24 kg/ha/yr (P/B ≈ 1.2).
  - Pike: B = 10 kg/ha, W = 5,000 g → P ≈ 4.3 kg/ha/yr (P/B ≈ 0.43).
- **Randall & Minns (2000) P/B = 2.64·Wmat^−0.35** (assuming grams): bluegill (Wmat ~30 g) ≈ 0.80; pike or walleye (Wmat ~1 kg) ≈ 0.24. The latter is close to Quinte walleye 5+ at 0.31.
- **For the sim's 12–17 kg of fish** at P/B 0.6–1.2, realistic annual fish production is ~7–20 kg per 0.07 ha (~100–290 kg/ha/yr). The lower half matches the 22-lake mean (82 kg/ha/yr) better. Values much above ~1.2 /yr imply unrealistically fast turnover unless YOY dominate.
- **Bay of Quinte production by level** (my B × P/B sums, t/km²/yr ≈ g wet/m²/yr):
  - Phytoplankton ≈ 2,650.
  - Zooplankton ≈ 240.
  - Non-dreissenid zoobenthos ≈ 125, of which chironomids alone ≈ 70; dreissenids add ≈ 300.
  - Fish ≈ 19.6. Community fish P/B ≈ 1.19, but ~58% of fish production is YOY stanzas (P/B 6–9).
- **Sim invertebrates:** crayfish at 9 g/m² × P/B ~1.2 → ~11 g/m²/yr, and snails at 3 g/m² × P/B ~3.3 → ~10 g/m²/yr. Both are small next to the zooplankton and chironomid production a real lake supplies (~100–350 g wet/m²/yr combined in Bay of Quinte). The sim crayfish standing stock (9 g/m² ≈ 90 kg/ha) sits inside Momot & Gowing's 46–213 kg/ha. The sim snail stock (3 g/m²) is ~3× Bay of Quinte's gastropods (0.91 g/m²), plausible for a vegetated littoral but unverified.
- **Zooplankton P/B of ~40–55 /yr** (Ecopath, warm-season-weighted) vs ~20 for daphnids in le Roux: a sim Daphnia population should turn over its biomass roughly every 1–2 weeks in summer and far more slowly in winter.

### Gaps
- Not retrieved: Plante & Downing (1989) benthic production model and P/B values, Rasmussen & Kalff (1987) zoobenthos biomass models, Butkas et al. (2011) whole-lake benthic production (search budget exhausted), and Shuter & Ing (1997) numeric rates.
- No temperate-lake field estimates of Daphnia or copepod production in g dry/m²/yr were found; only Ecopath parameters, a subtropical reservoir and g C values.
- Not retrieved: bluegill production (Gerking 1962, Wyland Lake IN; Patriarche 1967, Michigan) and Lake Wingra fish production (Magnuson & Kitchell 1971).
- Wetzel or Kalff primary-production tables were not accessed directly; the mesotrophic band conflicts between sources (25–75 vs 100–200 g C/m²/yr).
- No sourced C : dry : wet conversion factors were obtained. Lake Aydat used carbon → wet × 12 for bacteria; a common assumption for fish is C ≈ 10% of wet mass, but it is unverified here.

## Q3. Ecopath/Ecosim mass-balance models of small temperate lakes and reservoirs with bass/bluegill/perch/pike: B, P/B, Q/B, EE

### Takeaway
No public Ecopath model of a small (<100 ha) Upper-Midwest bass–bluegill–perch–pike lake was found. The closest usable full parameter sets are Bay of Quinte (Lake Ontario, 1994–2000) and a large eutrophic Florida lake (bass, bluegill, crappie). Lake Aydat (0.65 km², France, perch–roach–pike) is a small-lake analogue, and Lake Kawahara-oike (Japan) is a small bass–bluegill lake. These models put fish at ~15–40 g/m² (150–420 kg/ha) on zooplankton at ~5 g/m² and benthos at ~14 g/m² (excluding mussels). Adult fish P/B is ~0.1–0.8 and Q/B ~3–7; YOY P/B is ~2–9 and Q/B ~16–42. Typical consumer EE is ~0.3–0.6, and EE ≤ 1 is required for balance.

### Cited Findings
- **Bay of Quinte (Lake Ontario) Ecopath** (1994–2000; Koops et al. 2006 base model, modified by Blukacz-Richards & Koops). Biomass in t/km², P/B and Q/B per yr; unassimilated fraction 0.2 for fish. Diets from FishBase and Scott & Crossman (1998). — [supplement PDF](https://aehms.org/wp-content/uploads/2018/08/Blukacz-Richards-and-Koops-Supplement.pdf); [GLFC Quinte–Oneida project page](https://glfc.org/pubs/pdfs/research/reports/QuinteOneida.html)

  | Group | B (t/km²) | P/B | Q/B |
  |---|---|---|---|
  | Cormorants | 0.0059 | 0.44 | 96.3 |
  | Piscivores | 0.2 | 0.41 | 4.90 |
  | Walleye 5+ | 1.5 | 0.31 | 4.03 |
  | Walleye 4 | 0.332 | 0.52 | 5.16 |
  | Walleye 3 | 0.321 | 0.42 | 5.98 |
  | Walleye 2 | 0.279 | 0.86 | 7.59 |
  | Walleye 1 | 0.238 | 1.12 | 11.34 |
  | Walleye YOY | 0.144 | 5.90 | 33.6 |
  | Smallmouth bass | 0.06 | 0.35 | 4.07 |
  | Alewife | 0.65 | 1.20 | 6.75 |
  | Yellow perch 1+ | 3.2 | 0.58 | 3.85 |
  | Yellow perch YOY | 0.464 | 7.00 | 19.29 |
  | White perch 1+ | 1.9 | 0.56 | 4.24 |
  | White perch YOY | 0.386 | 8.00 | 25.61 |
  | Panfish 1+ | 1.2 | 0.44 | 3.73 |
  | Panfish YOY | 0.476 | 8.91 | 25.84 |
  | Invertivores | 3.3 | 0.35 | 2.87 |
  | Planktivores | 0.12 | 1.65 | 7.76 |
  | Trout-perch | 0.04 | 1.53 | 7.42 |
  | Freshwater drum | 0.51 | 0.25 | 4.08 |
  | Round goby | 0.025 | 1.51 | 5.16 |
  | Common carp | 0.33 | 0.11 | 3.45 |
  | Gizzard shad | 0.8 | 1.12 | 4.88 |

  Invertebrates are in the Q2 tables. Producers: phytoplankton groups ≈ 10 t/km² in total, P/B ≈ 220–370; macrophytes 80.89; epiphytes 6.26; periphyton 2.1. Pelagic detritus 22.67, sedimented detritus 6.8, DOC 21.45 t/km².
- **Large eutrophic Florida lake Ecopath/Ecosim/Ecospace** (Rogers & Allen 2009; biomass in kg/ha from blocknets unless marked as Ecopath-estimated). P/B and Q/B are listed in Q2. Fisheries were set as exploitation rates: bass U = 0.18, crappie 0.40, bluegill/redear 0.14. — [final report](https://archives.waterinstitute.ufl.edu/news/publications/downloads/AllenLakeFishFinalReport.pdf)

  | Group | B (kg/ha) |
  |---|---|
  | Predators (gars, bowfin, pickerel) | 66.0 |
  | Largemouth bass adult | 17.5 |
  | Largemouth bass 6 mo–3 yr | 9.25 (Ecopath-estimated) |
  | Largemouth bass 0–6 mo | 0.16 (Ecopath-estimated) |
  | Black crappie adult | 5.13 |
  | Black crappie 0–12 mo | 3.25 |
  | Bluegill/redear adult | 56.2 |
  | Bluegill/redear 0–12 mo | 4.06 |
  | Other centrarchids | 46.0 |
  | Prey fish | 73.0 |
  | Generalist fish | 76.0 |
  | Zoobenthivorous fish (incl. shad, bullheads) | 66.0 |

  Invertebrate and plant rows could not be aligned reliably in the extracted text.
- **Lake Aydat, France** (0.65 km² per EcoBase; eutrophic, dimictic; preliminary ECOPATH II model, Reyes-Marchant et al. 1990/1993). OCR quality is poor; treat the zooplankton numbers as indicative only. — [ICES C.M. 1990/L:56](https://www.ices.dk/sites/pub/CM%20Doccuments/1990/L/1990_L56.pdf); [EcoBase model list](http://sirs.agrocampus-ouest.fr/EcoBase/php/webser/soap-client_3.php)
  - Assuming 1.0 g/m² of top predators (pike, zander) gives perch biomass ≈ 3.3 g/m² and roach ≈ 0.62 g/m².
  - Annual mean zooplankton ≈ 35 g/m² herbivorous (rotifers + cladocerans) and ≈ 22 g/m² carnivorous (copepods).
  - Bacterioplankton P/B ≈ 160 /yr (Q/B 320).
  - Adult fish Q/B = 9.21 /yr; roach fry Q/B = 29.3 /yr.
  - Fish P/B was set equal to natural mortality M from Pauly's (1980) formula, because there is no fishery.
- **Lake Kawahara-oike, Nagasaki, Japan** (small; invasive largemouth bass and bluegill; 11-group EwE; Hossain thesis 2006 and Hossain et al.). — [Hokkaido U. thesis summary](https://www.lib.hokudai.ac.jp/gakui/2006/8248_md.pdf); [G. Perhar academia page (abstract)](https://utoronto.academia.edu/GPerhar)
  - Largemouth bass biomass was only 0.012 t/km² (0.12 kg/ha).
  - Most system biomass lay between trophic levels II and III.
  - Bass and bluegill were of low importance to total energy flow.
  - Bass could not exert significant top-down control on bluegill growth, and both coexisted at high numbers over native fish.
- **Lake Annecy (France; large, deep, oligotrophic)** Ecopath: most consumers had EE of 0.3–0.6. Seen as a search snippet only. — [HAL PDF](https://hal.inrae.fr/hal-02662272/file/47686_20110520023027265_1.pdf)
- **Ecopath balance criterion:** a model is considered balanced when all ecotrophic efficiencies are below 1. — [Zhang et al. 2023 supplement (Lake Erie)](https://graham.umich.edu/media/files/erie-models/Zhang-et-al-Supplemental-2023.pdf)
- **Bay of Quinte vs Oneida Lake:** an EwE comparison exists (Koops, Irwin, MacNeil, Millard & Mills 2006, GLFC completion report; Koops, Millard & Minns 2005, Bay of Quinte RAP report #14). Its tables were not online. — [GLFC project page](https://glfc.org/pubs/pdfs/research/reports/QuinteOneida.html)

### Inferences
- **Bay of Quinte pyramid** (t/km² ≈ g wet/m²; my sums): fish 16.5; zooplankton 4.7; non-dreissenid zoobenthos 13.6; phytoplankton ~10; macrophytes 81; dreissenids 225.
  - Fish biomass exceeds zooplankton biomass (an inverted biomass pyramid), while production stays strongly pyramidal: ~2,650 → ~365 → ~20.
  - The sim should show this pattern: fish standing stock larger than zooplankton standing stock is NOT a bug if zooplankton P/B is ~40–50 and fish P/B ~1.
- **Fish consumption in Bay of Quinte** (my B × Q/B sum) is ≈ 99 g/m²/yr, so community P/Q ≈ 0.20. Mostly invertivores, that implies fish eat roughly a quarter of non-dreissenid invertebrate production (99 of ~365 g/m²/yr). This is an upper-bound inference that ignores the piscivore share and diet detail.
- **Florida model totals** (my sums): fish ≈ 423 kg/ha, of which bass + other piscivores ≈ 22%, identical to Bachmann's 22% field mean. Implied fish production ≈ 660 kg/ha/yr (P/B ≈ 1.56) and consumption ≈ 8,900 kg/ha/yr (P/Q ≈ 0.07). That is a subtropical, long-season, prey-fish-heavy system and should be treated as an upper bound for a north-temperate lake.
- **The sim's ~170–240 kg/ha** sits between Bay of Quinte (~165) and the Florida model (~423), matching mesotrophic-to-eutrophic expectations.

### Gaps
- No Ecopath model of a small (<1 km²) Upper-Midwest or Ontario lake with a bluegill–bass–perch–pike community was located.
  - Not obtained: Hamilton Harbour (Hossain, Arhonditsis, Koops & Minns 2012, JGLR, doi:10.1016/j.jglr.2012.09.015), Oneida Lake, Kawahara-oike, Lake Simcoe and gravel-pit-lake models.
  - EcoBase's public list held only Lake Aydat as a small temperate lake.
- EE values for the Bay of Quinte groups (model outputs) are not in the supplement, which gives inputs only.
- Whether Bay of Quinte biomasses are wet weight is not stated in the supplement (Ecopath convention suggests wet).

## Q4. Transfer efficiencies, fraction of prey production eaten, predator:prey ratios, and gross conversion efficiencies (P/Q)

### Takeaway
The marine-derived "10% per trophic step" (Pauly & Christensen 1995) is the usual default. Measured lake values span orders of magnitude:
- Phytoplankton → zooplankton: ~0.5–25%, dropping to <0.2% where cyanobacteria dominate.
- Zooplankton/zoobenthos → fish: ~5–10%.
- Whole-food-chain primary → fish: ≤0.01–1%.

Fish gross growth efficiency (P/Q) is ~0.1–0.2 for adults and ~0.2–0.35 for YOY, with ~0.3–0.35 as a practical ceiling. A predator biomass of ~15–25% of total fish (F/C 3–6) characterizes "balanced" warm-water communities.

### Cited Findings
- Pauly & Christensen (1995): transfer efficiency between trophic levels in aquatic ecosystems, though highly variable, averages about 10%. — [FishBase "Ecopath modeling and some key results"](https://fishbase.se/Ecopath/ecopathm.htm); [Mehner et al. 2022](https://par.nsf.gov/biblio/10398700-trophic-transfer-efficiency-lakes)
- Mehner et al. (2022, *Ecosystems* 25:1628–1652, doi:10.1007/s10021-022-00776-3) Table 1, lake TTE estimates (text extracted from the accepted manuscript). — [NSF PAR record](https://par.nsf.gov/biblio/10398700-trophic-transfer-efficiency-lakes)
  - **Lake Constance** (pelagic, large, deep, mesotrophic; Gaedke & Straile): phytoplankton → herbivorous zooplankton 20–25% (seasonal average; 5–38% seasonally resolved); 2–10% from TL1 to TL3 (carnivorous zooplankton).
  - **Phytoplankton → zooplankton, other studies:**
    - Gladyshev et al. 2011: <1–13% (monthly means).
    - Ersoy et al. 2017 (mesocosms, predator–prey biomass ratio): 0.2–14%.
    - Grosbois et al. 2020 and 2022: 0.4% and 2.9%.
    - Karpowicz et al. 2020 (12 Polish lakes): 0.0005–0.14%, low because of inedible algae and cyanobacteria.
    - Feniova et al. 2021 (30 lakes): 6.5% mean (range 0.3–26%).
    - Lischke et al. 2017: 23% and 8% (pelagic autotrophs → zooplankton).
  - **Mehner et al. 2018** (two small shallow lakes split into halves): primary (bacterial + autotrophic) → secondary 1.85% (lake-half means 1–3.5%).
  - **Schulz et al. 2004** (deep oligotrophic lake, pelagic): phytoplankton → zooplankton 18%; zooplankton → planktivorous fish 5.5%.
  - **Vander Zanden et al. 2006** (Lake Tahoe, ecological efficiency from production): phytoplankton → zooplankton 3%; periphyton → zoobenthos 0.5–1%.
  - **Jonasson 1992** (ecological efficiency): phytoplankton → zooplankton 6.5%; periphyton → zoobenthos 6.5%; zooplankton/zoobenthos → fish 10%.
  - **Matthias et al. 2021** (whole-lake Ecopath): detritus up to fish (TL 1–7) 14% mean.
  - **Lischke et al. 2017** (two productive shallow lakes; the pairs of values are as printed):
    - Pelagic autotrophs + bacteria → zooplankton: 13% and 5.4%.
    - Benthic autotrophs → macroinvertebrates: 1.7% and 1.6%.
    - Benthic autotrophs + sediment bacteria → macroinvertebrates: 0.7% and 0.3%.
    - All producers → zooplankton + macroinvertebrates: 3.5% and 1.4%.
    - All producers → omnivorous fish: 0.002% and 0.01%.
    - All producers → piscivorous fish: 0.004% and 0.0004%.
- Mehner et al. (2022), main text:
  - Only two lake studies of food-chain TTE (primary production → fish) exist: <0.01% to omnivorous fish in two productive shallow lakes (Lischke et al. 2017), and ~1% from phytoplankton to planktivorous fish in the pelagic of a deep oligotrophic lake (Schulz et al. 2004).
  - Size-spectrum theory: with a biomass power-law exponent of −1.0 and a predator–prey mass ratio (PPMR) of 500, TTE ≈ 21%; exponent −0.9 or −1.1 gives 39% or 11%; PPMR 100 or 100,000 gives 32% or 6%.
  - The zooplankton:phytoplankton PPMR is ~500, but the zooplanktivorous fish:zooplankton PPMR is ~100,000, so the phyto → zoo link is energetically more efficient than zoo → fish.
  - [NSF PAR record](https://par.nsf.gov/biblio/10398700-trophic-transfer-efficiency-lakes)
- Mehner et al. (2022), Table 2 (Gollinsee/Schulzensee, g C/m²/yr): food-chain efficiencies relative to total NPP + allochthonous C were 0.91–4.84% for crustacean zooplankton, 0.31–0.91% for benthic macroinvertebrates and <0.01% for fish. Food-web efficiency excluding bacteria was 1.23–5.76%. — [NSF PAR record](https://par.nsf.gov/biblio/10398700-trophic-transfer-efficiency-lakes)
- Mehner et al. (2022) on efficiencies:
  - Gross growth efficiency K1 (production/ingestion) for energy rarely exceeds 30–35% under natural conditions and is often much lower.
  - Net growth efficiency K2 (production/assimilation) peaks around ~50% in small organisms and is much lower in large ectothermic fish.
  - Consumption efficiency (ingestion by the upper level ÷ production of the lower level) is low when prey are hard to ingest or digest, or when few consumers can exploit them.
  - [NSF PAR record](https://par.nsf.gov/biblio/10398700-trophic-transfer-efficiency-lakes)
- Lake Superior Ecopath (2005/06 data): system TTE was 0.14, vs an average of 0.09 for systems in a global review; the microbial loop TTE was >0.20. — [USGS pub 70220443](https://pubs.usgs.gov/publication/70220443)
- Downing et al. (1990): conversion of phytoplankton to fish production was ~100× more efficient in oligotrophic than in hypereutrophic lakes. — [CJFAS abstract](https://cdnsciencepub.com/doi/10.1139/f90-217)
- Fraction of prey production eaten: trout consumed 1–43% of annual age-0 crayfish production in three Michigan pothole lakes. — [MI DNR RR1706](https://www.dnr.state.mi.us/PUBLICATIONS/PDFS/DNRFishLibrary/ResearchReports/RR1701-RR1800/RR1706.pdf)
- Ecopath gross-efficiency assumptions in practice:
  - Lake Aydat used ~30% gross efficiency for zoobenthos (Q/B 11 from P/B 3) and 50% for bacteria. Fish P/B was capped where implied gross efficiency reached ≥30%. — [ICES 1990/L:56](https://www.ices.dk/sites/pub/CM%20Doccuments/1990/L/1990_L56.pdf)
  - Bay of Quinte fish P/Q values (from its table) are listed in the Inferences below. — [supplement](https://aehms.org/wp-content/uploads/2018/08/Blukacz-Richards-and-Koops-Supplement.pdf)
- Predator:prey ratios:
  - Swingle's F/C desirable range 3–6; an overcrowded-bass pond had F/C = 0.2. — [AFS ch. 15 visuals](https://education.fisheries.org/wp-content/uploads//fisheriesTechniquesVisuals/Chap_15.pdf); [Harders & Davies](https://seafwa.org/sites/default/files/journal-articles/HARDERS-777.pdf)
  - Florida lakes averaged 22% piscivores (0–73%). The piscivore share falls with eutrophication mainly because shad biomass is added; absolute piscivore biomass does not change with trophic state. — [Bachmann et al. 1996](https://lake.wateratlas.usf.edu/upload/documents/f95-236.pdf)
  - Persson et al. (1988), cited in Bachmann et al.: in 15 Swedish lakes, piscivores (perch) fell from ~70% of biomass in oligotrophic lakes to ~7% in mesotrophic and more productive lakes. — [Bachmann et al. 1996](https://lake.wateratlas.usf.edu/upload/documents/f95-236.pdf)
- Non-temperate comparison only: Lake Ziway (Ethiopia, shallow rift-valley lake) Ecopath mean TTE = 4.4%. — [AAU thesis record](https://etd.aau.edu.et/items/940657dd-7560-42b8-9f93-7b0e7d1982ad). An ~8.3% mean TTE with ~78% of flow via detritus was reported for an Asian lake Ecopath model, but search snippets attributed it inconsistently (Tonle Sap vs Lake Tai), so it is not relied on here.

### Inferences
- **Bay of Quinte P/Q from the Ecopath table** (my divisions):
  - Adult fish: walleye 5+ 0.077; smallmouth bass 0.086; panfish 1+ 0.118; invertivores 0.122; yellow perch 1+ 0.151; carp 0.032.
  - YOY: yellow perch 0.36; panfish 0.34; walleye 0.18; white perch 0.31.
  - Whole fish community P/Q ≈ 0.20.
  - A sim calibrated to FB4 bioenergetics should land in similar ranges: adult growth efficiency roughly 5–15%, YOY 20–35%. Sustained values above ~35% would be unrealistic.
- **Bay of Quinte TTEs** (my production ratios):
  - Zooplankton/phytoplankton ≈ 9%.
  - Fish/(zooplankton + non-dreissenid zoobenthos) ≈ 5.4%, or ≈ 2.9% including dreissenids.
  - Fish/phytoplankton ≈ 0.74%.
  - These sit inside the Mehner et al. compilation and slightly below the 10% default.
- **Practical sim target:** for every 1 kg of fish production, about 10–20 kg of invertebrate prey production (TTE 5–10%) and about 100–1,000 kg of algal production (wet) per year. If the sim's invertebrate production is much below ~10× fish production, fish growth must be coming from somewhere unrealistic.
- **Piscivore share:** predator biomass at 15–25% of total fish biomass (F/C 3–6) is the realistic "balanced" state. In eutrophic warm-water lakes the share often falls to ~10% as planktivorous or omnivorous biomass (shad, carp, stunted panfish) accumulates. Absolute piscivore kg/ha stays roughly constant with trophic state (Florida).

### Gaps
- No direct published estimate of the fraction of zooplankton production consumed by fish (or by yellow perch or bluegill) in a Midwestern lake was retrieved; the search budget was exhausted.
- No direct estimate for the fraction of benthic production eaten by fish beyond the crayfish example. Ecopath EE outputs for zooplankton and benthos in a comparable lake are needed.
- The Ney (1990) supply–demand predator:prey framework was not retrieved.
- The study behind Mehner et al.'s "Matthias et al. 2021" 14% Ecopath value (which lake) was not identified.

## Q5. Relative importance of benthic vs pelagic pathways in supporting fish production in small lakes

### Takeaway
In north-temperate lakes, fish draw roughly half to two-thirds of their energy from littoral–benthic pathways. Zoobenthos is ~50% of direct consumption and ~65% including fish that ate zoobenthos; isotopes give ~43–59%, and littoral reliance averages 57% across 546 populations. This holds even though benthic algae supply only ~36% of whole-lake primary production on average. Eutrophication shifts primary production from periphyton (80–98% in clear oligotrophic lakes) to phytoplankton (~100% at TP >100 µg/L), eroding the benthic pathway.

### Cited Findings
- Vander Zanden & Vadeboncoeur (2002, *Ecology* 83:2152–2161). — [Wright State CoreScholar](https://corescholar.libraries.wright.edu/biology/585)
  - Diet data from 470 populations of 15 species: zoobenthos made up ~50% of total prey consumption.
  - Eating fish that had fed on zoobenthos added ~15%, so total reliance on benthic secondary production was ~65%.
  - Stable-isotope estimates of zoobenthivory (90 populations, 11 species) ranged 43–59%.
  - Reliance varied considerably among populations of the same species.
- Vander Zanden, Vadeboncoeur & Chandra (2011, *Ecosystems* 14:894–903). — [CoreScholar](https://corescholar.libraries.wright.edu/biology/587); [LTER biblio](https://lternet.edu/biblio/fish-reliance-on-littoral-benthic-resources-and-the-distribution-of-primary-production-in-lakes)
  - δ13C data for 546 fish populations in 75 lakes: lake-mean littoral reliance averaged 57%, independent of lake morphometry and limnology.
  - Modeled benthic algae averaged 36% of whole-lake primary production.
  - Fish reliance and benthic production were only weakly related; reliance stayed high even in large deep lakes. The authors attribute this to the concentration of fish species in the littoral zone.
  - Each species was weighted equally, so 57% is NOT a share of fish biomass or production.
- Vadeboncoeur et al. (2003, *Limnol. Oceanogr.* 48:1408–1418, doi:10.4319/lo.2003.48.4.1408). — [CoreScholar](https://corescholar.libraries.wright.edu/biology/617)
  - Shallow oligotrophic Greenland lakes: periphyton supplied 80–98% of primary production.
  - Intermediate-P lakes: 5–80%, depending on morphometry and littoral habitat.
  - Eutrophic Danish lakes (TP >100 mg/m³): phytoplankton supplied ~100%.
  - Whole-lake benthic algal production fell along the P gradient while phytoplankton production rose. δ13C showed zoobenthos shifting from periphyton to plankton-derived carbon.
- Vadeboncoeur, McIntyre & Vander Zanden (2011, *BioScience*): >93% of lake species inhabit the littoral zone (via search summary). — [Wright State faculty page](https://people.wright.edu/yvonne.vadeboncoeur)
- Mehner et al. (2022):
  - Some lake studies find higher efficiency in benthic than in pelagic chains (Vander Zanden et al. 2011); others find no systematic difference (Vander Zanden et al. 2006; Lischke et al. 2017).
  - Fish couple benthic and pelagic chains through mixed diets and ontogenetic and diel habitat shifts.
  - Lischke et al. 2017: benthic autotroph → macroinvertebrate TTEs (0.3–1.7%) were lower than pelagic autotroph → zooplankton (5.4–23%) in two shallow lakes.
  - [NSF PAR record](https://par.nsf.gov/biblio/10398700-trophic-transfer-efficiency-lakes)
- Bay of Quinte Ecopath diets (illustrative; diet fractions as printed):
  - Panfish 1+ and YOY diets are dominated by chironomids, oligochaetes, insects and amphipods.
  - Yellow perch 1+ eat chironomids (0.276), oligochaetes (0.154), dreissenids (0.107), amphipods (0.076) and some zooplankton.
  - Young walleye and yellow perch YOY lean on herbivorous zooplankton (~0.55–0.64).
  - [supplement diet matrix](https://aehms.org/wp-content/uploads/2018/08/Blukacz-Richards-and-Koops-Supplement.pdf)
- Mehner et al. Table 2 (two small shallow German lakes): crustacean zooplankton production (3.5–12.8 g C/m²/yr) exceeded benthic macroinvertebrate production (1.2–2.4 g C/m²/yr) by ~3–5×, yet both were small relative to bacterial production (294–386 g C/m²/yr). — [NSF PAR record](https://par.nsf.gov/biblio/10398700-trophic-transfer-efficiency-lakes)

### Inferences
- **Fish diets:** in a small mesotrophic sim lake with macrophytes, roughly 50–65% of total fish food should be benthic or littoral (insect larvae, amphipods, snails, crayfish), most of the rest zooplankton, and ~10–15% fish. Sunfish and adult perch should be predominantly benthivorous; YOY of all species, plus minnows, predominantly zooplanktivorous.
- **Sim primary production:** for a mesotrophic lake (TP ~10–30 µg/L) of small area and depth, the benthic-algal share of primary production could plausibly be 20–60% (Vadeboncoeur 2003's "intermediate" 5–80% band, average 36%). Rising P should shift production toward phytoplankton and away from periphyton. A sim where eutrophication increases periphyton would contradict the evidence.
- **Littoral reliance needs littoral prey:** because fish reliance on littoral carbon stays high (~57%) even when benthic primary production is modest, sim fish should feed heavily on littoral invertebrates. That requires a substantial zoobenthos production term, around 100+ g wet/m²/yr by the Bay of Quinte analogy. Crayfish plus snails alone (~20 g/m²/yr at sim densities) would be insufficient; chironomid and other insect larval production must carry most of it.

### Gaps
- No whole-lake benthic production budget (Butkas et al. 2011) and no fish-production-weighted (rather than species-weighted) benthic share was retrieved for a small Midwestern lake.
- A search snippet reported that zoobenthos made up 86% of total secondary production (zooplankton + zoobenthos) in Mývatn and Hjarbæk Fjord. The underlying paper and URL could not be confirmed, so the figure is not used above.
- No snail biomass (g/m²) data for Wisconsin or Michigan littoral zones. Only a density note was seen: four snail species exceeded 100 individuals/m² in a Wisconsin macrophyte bed (Brown), and the paper was not confirmed. Osenberg (1988, MSU dissertation) and Klosiewski (1991, OSU thesis) are likely sources.
