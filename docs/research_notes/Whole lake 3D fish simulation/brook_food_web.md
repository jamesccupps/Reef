# The food web of a short, rocky lake-outlet brook (Hot Brook, Upper → Lower Hot Brook Lake)

Scope: a short (~150 m × ~8 m) cobble and boulder outlet stream carrying warm, soft, tea-coloured, oligo-mesotrophic lake surface water (TP ~9–10 µg/L, chl-a ~3 µg/L) from one lake into another. It has a ~1–1.2 m pool at its upper mouth, ~0.3 m riffles and a ~0.5 m run. Northern temperate sources come first. Anything from elsewhere is flagged. Where I converted a source's numbers into simulation-ready rates, the conversion is marked as an inference.

Method note: several primary papers were reachable only as abstracts or search-result snippets. BioOne full-text pages rendered empty to the fetcher. limnology-journal.org and timarit.is returned 403. Springer redirected to a login. Those blocks are listed under Gaps. Four PDFs (Robinson & Minshall 1990, Benfield 1997, Power 1987, Walters & Post 2011) and Romaniszyn et al. 2007 were read in full from their text layers.

---

## 1. Lake-outlet effects: filter feeders on the lake's outflowing seston

### Takeaway
Below lake outlets, filter feeders (net-spinning caddis, blackflies) reach very high densities and production. They typically peak 40–160 m below the outlet and fall to background within a few hundred metres to ~1 km. A 150-m brook is therefore an outlet reach along its whole length. Lake crustacean zooplankton is stripped from the outflow at roughly 40–50% per 100 m, mostly by fish by day. Phytoplankton is removed at about 20–30% per 100 m where blackfly larvae are dense. In Maine outlets, filter-feeder biomass did not track seston quantity, so in the sim, capture capacity (current, attachment space, quality) should limit them rather than supply.

### Cited Findings
**Where filter feeders sit, and how fast they decline**
- Hydropsychid caddis larvae averaged **6,500/m² in a lake outlet** (Glacier NP, Montana), **1,427/m² at 200 m** and **209/m² at 3,400 m** downstream. The authors attribute the high outlet density to stable substrate, discharge and temperature plus high-quality food. Seston protein and ATP were higher at the outlet when the lake was productive and decreased downstream. Food *quantity* differed between sites on only 3 of 13 dates. — [Valett & Stanford 1987, CJFAS 44:77–82](https://umimpact.umt.edu/en/publications/food-quality-and-hydropsychid-caddisfly-density-in-a-lake-outlet-/)
- Below three *oligotrophic* lake outlets (Idaho), filter-feeder density and biomass **peaked 40–160 m below the outlet** (Pettit; 80 m at Yellowbelly) and **"declined rapidly within 160–400 m"**. In August they "virtually disappeared" downstream. Filterers were low *immediately* below the outlet, where current was slower (**26–29 cm/s** vs **33–40 cm/s** farther down) and the substrate changed within 40 m. The decline from peak was faster than the Sheldon & Oswood (1977) log-log model predicts, which supports the idea that oligotrophic lakes support a shorter filter-feeder zone than meso- or eutrophic lakes. Total density, biomass and richness kept increasing downstream with benthic organic matter, and the whole community "recovered" within 20 m to >900 m depending on outlet and flow. — [Robinson & Minshall 1990, Great Basin Naturalist 50:303–311 (full text)](https://scholarsarchive.byu.edu/gbn/vol50/iss4/3)
- At four northern Swedish outlets, most filter feeders deviated from the Sheldon & Oswood linear log-log decline. A **quadratic decline was common**, and total filter feeders and blackflies were **hump-shaped**, which was attributed to slower current next to the lake. Total seston often does *not* fall with distance, but seston *quality* does (zooplankton, protein, ATP, sometimes chl-a). — [Eriksson 2001, Ann. Limnol. (abstract and secondary summary; PDF blocked 403)](https://www.limnology-journal.org/articles/limn/abs/2001/03/limno20013p199/limno20013p199.html)
- Newfoundland (8 hydropsychid species): "Distribution of Newfoundland Hydropsychidae was strongly influenced by lake outlets." Outlets were warmer and richer in nutrients. *Cheumatopsyche pettiti* and *Hydropsyche betteni* declined rapidly below outlets, *H. slossonae* stayed constant, and *H. sparna* *increased* downstream. Zooplankton, *H. betteni* and total hydropsychids followed similar longitudinal trends. — [Fietsch 2006, PhD thesis, Memorial Univ.](https://memorial.scholaris.ca/items/79f4af6d-b6a1-47c9-ab1f-55af4295d6ba)
- In 34 riffles below 16 southern Quebec lake outlets, overwintering blackfly biomass correlated with current velocity, depth, periphyton, distance from the lake, and indices of seston quantity and quality. — [Morin & Peters 1988, L&O 33:431–446 (abstract via search)](https://simuliidae.myspecies.info/node/312)

**Maine evidence**
- In six Maine lake–outlet pairs, there was no relationship between filter-feeder biomass or community structure and seston quantity, which suggests that stream communities "probably were not strongly regulated by seston availability". — [Demi, Simon, Coghlan, Saunders & Anderson 2012, Freshwater Science 31:973–985 (abstract via search; full text did not render)](https://bioone.org/journals/freshwater-science/volume-31/issue-3/11-124.1/Anadromous-alewives-in-linked-lakestream-ecosystems--do-trophic-interactions/10.1899/11-124.1.full); citation confirmed in [Maine Alewife Interaction Committee literature review](https://www11.maine.gov/ifw/docs/AlewifeInteractionCommittee_LiteratureReview.pdf)
- Maine DEP biomonitoring lists *Hydropsyche* (incl. *H. morosa*, *H. sparna*) as collector-filterers in Maine streams. — [Maine DEP biomonitoring report](https://www.maine.gov/dep/gis/datamaps/lawb_biomonitoring/reports/log_2816.html)

**Production below outlets and impoundments**
- *Cheumatopsyche analis* production was **18.2 g m⁻² yr⁻¹ immediately below a 4.85-ha impoundment**, against 7.2–9.5 at sites above and 1 km below. *H. betteni* peaked at **2.5 g m⁻² yr⁻¹ 1 km downstream** (0.3–0.7 elsewhere). Upham Brook, Virginia (flagged: southern; units probably dry mass, not confirmed). — [Alexander & Smock 2005, Northeastern Naturalist 12:433](https://complete.bioone.org/journals/northeastern-naturalist/volume-12/issue-4/1092-6194(2005)012[0433:LHAPOC]2.0.CO;2/Life-Histories-and-Production-of-Cheumatopsyche-analis-and-Hydropsyche-betteni/10.1656/1092-6194(2005)012[0433:LHAPOC]2.0.CO;2.full) (numbers from the search abstract)
- *Simulium vittatum* in the Laxá outlet of Lake Mývatn (flagged: subarctic Iceland, eutrophic lake) produced **~867–1,231 g wet m⁻² yr⁻¹** in 1976–78. Production fell to **~312–437** in 1978–82 when the lake's algal bloom failed and rose to **~1,504** in 1983–84. Outlet production therefore tracks lake phytoplankton. — [timarit.is record, as summarised by search (page itself returned 403)](https://timarit.is/page/4261253)
- Wotton's lake-outlet blackfly work: "Very high secondary production at a lake outlet" (Freshwater Biology 20:341–346, 1988) and "Feeding by blackfly larvae forming dense aggregations at lake outlets" (*Simulium noelleri*, Freshwater Biology 27:139–149, 1992). The numbers could not be retrieved. — [AGRIS record](https://agris.fao.org/search/en/records/64775a7705d624aee89a2bc3)

**How much seston is removed per distance**
- Removing early-instar blackfly larvae from three oligotrophic southern Quebec outlet streams showed that larvae **reduce phytoplankton but not bacterioplankton**. Phytoplankton ingested per metre of stream was **0.35 %/m and 0.24 %/m** in 2 of 3 streams, and bacterioplankton was **<0.081 %/m**. Downstream declines continued without larvae, and **factors other than blackflies caused 0–55% of the total phytoplankton loss rate**. — [Parkes, Kalff, Boisvert & Cabana 2004, JNABS 23:780 (abstract via search)](https://bioone.org/journals/journal-of-the-north-american-benthological-society/volume-23/issue-4/0887-3593(2004)023<0780:FBBFDL>2.0.CO;2/Feeding-by-black-fly-Diptera-Simuliidae-larvae-causes-downstream-losses/10.1899/0887-3593(2004)023<0780:FBBFDL>2.0.CO;2.full)
- Four Polish lake outlets of almost exactly Hot Brook's size: **4.1–6.1 m wide, 0.20–0.40 m deep, 0.22–0.30 m/s, 0.27–0.71 m³/s**. Zooplankton was reduced over a **200-m** section by: large cladocerans **60.6–74.7%**, copepods **62.2–68.2%**, small cladocerans **46.8–69.0%**, *Asplanchna* 21.5–65.0%, nauplii 13.7–17.5%, pelagic rotifers 9.6–13.0%. Benthic rotifers *increased* (washed off macrophytes). Reduction was greatest **by day**, and at night and dawn it was only 15–31% for crustaceans. The authors attribute it mainly to **fish predation (cyprinid fry)**. Macrozoobenthic filter feeders had a "rather small" impact. The widest, deepest and most turbid outlets showed the least reduction. — ["Diurnal changes of zooplankton community reduction rate at lake outlets and related environmental factors", open-access, PMC4938256 (full text; Polish authors who build on Czerniawski & Domagała's earlier outlet work)](https://pmc.ncbi.nlm.nih.gov/articles/PMC4938256/)
- In 12 oligotrophic Rocky Mountain lakes (flagged: alpine Colorado), **95% of exported zooplankton biomass was lost within 500 m** of the lake, with the **greatest loss rate in the first 10 m**. Large zooplankton were lost much faster than small. Export was much higher at night (diel vertical migration). Fishless lakes exported 5× more zooplankton biomass. Filtering and gathering collectors were dense near outlets and less so where streams held fish. — [Detmer, McCutchan & Lewis 2017, Inland Waters 7:440–448](https://repository.library.noaa.gov/view/noaa/68860)
- Chandler (1937) found lake plankton declined downstream in three Michigan outlet streams, with macrophytes acting as sinks. — [Univ. Michigan record](https://deepblue.lib.umich.edu/items/f6123f81-6c2b-4f55-ba03-c4a4ee1131b1)

**Unionid mussels**
- Clearance rates of a stream unionid (*Villosa iris*) vary with seston concentration, which may help partition niches within a mussel bed. — [Gatenby et al. 2013, Walkerana 16(1) (via search summary)](https://molluskconservation.org/PUBLICATIONS/WALKERANA/Vol16_1-Full/Wlkrna16_1_Gatenby4.pdf)
- A rare published reach density of an *E. complanata*-dominated community (flagged: large tidal Virginia river, not an outlet) is **1.25 ± 0.21 mussels/m²**. — [Rappahannock survey, FMBC](https://molluskconservation.org/PUBLICATIONS/FMBC/EARLY%20VIEW/FRMCFMBC-D-25-00009_ED.pdf) (via search summary)

### Inferences
- **Per-100-m removal rates for the sim** (my exponential conversions of the figures above):
  - Crustacean zooplankton: 65% per 200 m (Polish) gives **~41% per 100 m**, so **~55% over a 150-m brook** (range 27–50% per 100 m across taxa and sites). Detmer's "95% in 500 m" gives **~45% per 100 m**, front-loaded in the first 10 m.
  - Rotifers and nauplii: ~5–9% per 100 m.
  - Phytoplankton removed by blackflies alone: 0.24–0.35 %/m gives **21–30% per 100 m (30–41% over 150 m)**. This applies only when dense early-instar larvae are present (spring). The total loss rate can be up to ~2× higher once other sinks (settling, other filterers) are added.
  - Bacterioplankton and DOC: **<8% per 100 m**.
- **Capture rules for the model.** Large zooplankton are taken mainly by visual fish by day, so it is drift food for dace, fallfish young and sunfish in the pool. Phytoplankton and fine seston go to the attached filterers. Removal should drop when flow is high or the water is turbid.
- **Spatial layout.** Hot Brook's whole length (150 m) sits inside the outlet peak zone (peaks at 40–160 m). Filterer density should not be highest *at* the lip but just below, where current reaches roughly ≥30 cm/s on stable cobble and boulder: the head of the first riffle. Density should be lower in the slow upper-mouth pool. Hydropsychids fall by ~53% per 100 m in the first 200 m (Valett & Stanford: ×0.47 per 100 m), but a 150-m brook ends before the background is reached.
- **Production magnitude.** For an oligo-mesotrophic lake (chl-a 3 µg/L), outlet filterer production should sit nearer the impoundment-tailwater value (~10–20 g dry m⁻² yr⁻¹ for a dominant hydropsychid) than Mývatn's eutrophic ~150–250 g dry m⁻² yr⁻¹. The Mývatn wet-to-dry conversion assumes ~15–20% dry, which is my assumption. Filterer production should be coupled to lake chl-a (Mývatn production fell ~65% when the bloom failed) and to current, not to raw seston concentration (Demi et al. 2012 in Maine).
- **Supply far exceeds demand.** Upper Hot Brook Lake's outflow discharge is not in my sources. As a formula: phyto-C flux = Q × chl-a × C:chl. At Q = 0.3 m³/s, chl-a 3 mg/m³ and C:chl ~50 (assumed), that is ~3.9 kg C/day. Removing ~30% gives ~1 kg C/day over 1,200 m², or **~1 g C m⁻² d⁻¹ captured**, which is orders of magnitude above typical stream invertebrate demand. Filterers are therefore limited by attachment space, current and density-dependence, not by supply, which matches the Maine result.

### Gaps
- Richardson & Mackay 1991 (Oikos 62:370–380): only the citation was found. Its hypotheses (food quality, current, lake buffering of temperature and discharge) are paraphrased via Eriksson 2001 and Valett & Stanford. Cushing 1963 (Montreal River, TAFS 92:216–219) and Maciolek & Tunzi 1968 (Ecology 49:60–75) are cited in Robinson & Minshall, but I found no numbers.
- Hieber, Robinson, Uehlinger & Ward 2002 (Arch. Hydrobiol. 154:199–223, "Are alpine lake outlets less harsh than other alpine streams?"): no abstract retrieved.
- Morin et al. 1988 (CJFAS 45:705–714) blackfly seston-transport budget: no numbers retrieved.
- Wotton 1987/1988/1992: outlet blackfly densities (reportedly up to very high per-m² values) and production were not retrieved, so I give no number.
- No outlet-specific *Elliptio* density or bed-clearance number was found for Maine or New England. No data were found on freshwater sponges (Spongillidae) at lake outlets.
- Unverified (search-result summaries whose source page I could not pin down):
  - *Elliptio complanata* filtration peaks on ~3–4 µm particles (Paterson 1984, New Brunswick);
  - unionid clearance is not saturated at natural seston (Pusch et al. 2001; Vanderploeg et al. 1995);
  - bed-scale removal by a mussel bed is capped by how fast water delivers particles (zebra-mussel areal model);
  - Boggero et al. 2006 (36 inlets and 44 outlets of Swiss and Italian alpine lakes): filter feeders did *not* increase significantly at outlets.
  
  Check these before using them.
- Demi et al. 2012 full text (BioOne did not render): filterer biomass values for the six Maine outlets are not extracted.
- Hot Brook's own discharge (mean, summer low) is needed to scale seston flux. It is not in these sources.

---

## 2. Riffle and pool invertebrates, periphyton and litter in small northeastern streams

### Takeaway
Small forested northeastern streams are low-production systems: whole-stream invertebrate production is about **2–4 g AFDM m⁻² yr⁻¹** (Hubbard Brook, Bear Brook ME), with **72–92% of it eaten by invertebrate predators**. Production is mostly detritus-based. Algae supports only 5% of primary consumers under a closed canopy and 28% in an open channel. Riffles hold filterers and scrapers, while pools hold shredders and engulfing predators. Direct litterfall into small deciduous-forest streams is roughly **400–700 g m⁻² yr⁻¹**, and open-canopy periphyton runs **~5–17 mg chl-a/m²**.

### Cited Findings
**Whole-stream secondary production**
- Bear Brook, Hubbard Brook (NH): 2nd order, closed canopy, **4.2 g AFDM m⁻² yr⁻¹**. Main Hubbard Brook: 5th order, open canopy, **3.0 g AFDM m⁻² yr⁻¹**. Algae supported **5% (BB) and 28% (HB)** of primary-consumer production, and detritus supported the rest. **Predators consumed ~72–92% of total secondary production.** — [Hall, Likens & Malcom 2001, JNABS 20:432–447](https://umimpact.umt.edu/en/publications/trophic-basis-of-invertebrate-production-in-2-streams-at-the-hubb/)
- Southern Appalachian trout streams (flagged: southern) produce **5–21 g AFDM m⁻² yr⁻¹** of benthic invertebrates. Invertebrate predator production there is 0.5–1.3 g AFDM m⁻² yr⁻¹. — [Romaniszyn, Hutchens & Wallace 2007, Freshwater Biology 52:1–11, citing Wohl et al. 1995 and Grubaugh et al. 1997 (full text)](https://ww2.coastal.edu/jjhutche/Pubs/Romaniszyn%20et%20al%202007%20aquatic%20&%20terr%20invert%20drift.pdf)
- For comparison, Illinois headwater streams produced 24.9–26.2 g AFDM m⁻² yr⁻¹ in year one and 15.1–17.6 in year two (habitat-weighted). — [Big Creek study, Freshwater Science 30(2)](https://bioone.org/journals/Freshwater-Science/volume-30/issue-2/10-006.1/Secondary-production-in-a-southern-Illinois-headwater-stream--relationships/10.1899/10-006.1.full) (via search summary)

**Riffle vs pool, by functional group** (Appalachian mountain stream, flagged)
- Annual production, mg m⁻² yr⁻¹:
  - collector-filterers: bedrock outcrop **1,920**, riffle **278**, pool **32**;
  - shredders: pool **2,616**, riffle **1,657**, bedrock 579;
  - scrapers: highest in riffles, **905**;
  - engulfing predators: highest in pools, **2,313**.
  
  — [Huryn & Wallace 1987, as summarised in search results](https://agris.fao.org/search/ar/records/65debb7b63b8185d9ca95732)
- Connecticut 2nd–3rd order pool-riffle streams (1–4 m wide, 5–20 cm deep, pebble and cobble, 0.015–0.040 m³/s summer): the dominant families in the biomass decline were mayflies (Heptageniidae, Leptophlebiidae) and caddisflies (Hydropsychidae). **Insect density fell in riffles but not in pools** under low flow, and riffle percentage plus stream width explained 79% of variation in reach insect biomass. — [Walters & Post 2011, Ecol. Appl. 21:163–174 (full text)](https://wyocoopunit.org/wp-content/uploads/2024/12/Walters_and_Post_2011.pdf)

**Litter (allochthonous) inputs**
- In Benfield's 33-stream compilation, direct litterfall ranged from 0 to 843 g m⁻² yr⁻¹, mostly within ~400–740 for small deciduous and coniferous forest streams. It **declined with latitude (r² = 0.30)**, showed **no consistent relation to stream order** within mixed deciduous sites, and fell to ~2–30 g in big rivers (e.g., 9th-order Moisie, Quebec). The row for a 2nd-order, 44°N mixed deciduous stream (Bear Brook NH) reads **594 g m⁻² yr⁻¹** (direct; lateral not measured). Lateral movement adds ~24% (southern Appalachians) to 66% (Oregon) of total input. Non-leaf litter averages ~30% of litterfall worldwide. Temperate deciduous litter arrives mostly in autumn, with lateral inputs through the rest of the year. — [Benfield 1997, JNABS 16:104–108 (full text; table layout partly garbled in extraction, Bear Brook row matched by order and latitude)](https://andrewsforest.oregonstate.edu/sites/default/files/lter/pubs/pdf/pub2370.pdf)
- Bear Brook energy flow (Fisher & Likens 1973, Ecol. Monogr. 43:421–439) showed that allochthonous organic matter dominates the energy base of a New Hampshire forest stream. — [LTER record](https://lternet.edu/biblio/energy-flow-in-bear-brook-new-hampshire-an-integrative-approach-to-stream-ecosystem-metabolism)

**Periphyton**
- In 13 wadeable Massachusetts and New Hampshire streams (Jun–Sep 2001), **open-canopy periphyton chl-a had a median of ~17 mg/m²** and a 25th percentile of **5.2 mg/m²**. Reference (unimpaired) open sites had a 75th percentile of **16 mg/m²**. Closed-canopy sites had less, and light, not nutrients or substrate, made the difference. — [USGS WRIR 03-4191](https://pubs.usgs.gov/wri/wri034191/html/summary.html)
- Low flow raised periphyton AFDM in Connecticut streams. — [Walters & Post 2011](https://wyocoopunit.org/wp-content/uploads/2024/12/Walters_and_Post_2011.pdf)

### Inferences
- **Hot Brook's base is unlike a closed headwater.** It is 8 m wide, so it is largely open to the sky, and it is fed warm, nutrient- and plankton-bearing lake water. Expect the Hubbard Brook mainstem pattern (≥28% algal support) plus the outlet filterer subsidy. Total benthic production above the 2–4 g AFDM baseline is plausible, perhaps ~5–20 g AFDM m⁻² yr⁻¹ (my estimate, bracketing northeastern headwaters and southern Appalachian or impoundment-tailwater values).
- Suggested habitat split for the sim:
  - **riffle** (0.3 m, fast): filterers (hydropsychids, blackflies in spring), scrapers (heptageniid mayflies, on periphyton 5–17 mg chl-a/m²), small chironomids;
  - **pool** (1–1.2 m, upper mouth): shredders on trapped litter, engulfing predators (dragonfly nymphs, stoneflies, crayfish), settling fine organic matter;
  - **run**: intermediate.
- **Litter.** A forested 8-m channel would receive less than a 2-m headwater per m² of bed. A rough value of ~200–500 g m⁻² yr⁻¹ (direct + lateral) is my estimate between Bear Brook's 594 and larger-river values. It should be pulsed in October, mostly trapped in the pool and run, and processed through winter.
- **Predators take most production.** Invertebrate predators eat 72–92% of it, so fish get only a fraction of benthic production unless they also eat the predators. That is a key reason a "lake-bed" model starves dace (see Q4).

### Gaps
- No secondary-production study of a Maine or New England *lake-outlet* brook was found. Benke 1993 and Benke & Huryn 2010 ranges were not retrieved (BioOne did not render). Huryn & Wallace 2000 (Annu. Rev. Entomol.) was not retrieved.
- Gross primary production (g O₂ or C m⁻² d⁻¹) for New England softwater streams: none found.
- Crayfish biomass and production in Maine streams: not covered here.
- Unverified (search-result summary; exact source not pinned): first-order intermittent streams at the Bear Brook Watershed in **Maine** produced 1.7–2.3 g AFDM m⁻² yr⁻¹ of invertebrates. This is consistent with Hubbard Brook, but verify before use.
- Fine and coarse particulate organic matter (FPOM, CPOM) standing stocks for outlet brooks: not found.

---

## 3. Invertebrate drift

### Takeaway
Drift is a nightly conveyor. Densities in northern trout streams are typically **~1–6 animals/m³** (annual mean), with mid-summer 24-h totals reaching ~20/m³ (Colorado). Night drift is **up to 10× day**, rising about an hour after sunset. Terrestrial insects add a daytime and autumn component of roughly **3 g AFDM m⁻² yr⁻¹**. Fish take most invertebrate production that becomes available to them. Bioenergetic budgets commonly assume **80% of available prey ingested and 20% gross conversion efficiency**.

### Cited Findings
- In a central Wisconsin brook-trout stream (northern temperate), mean annual drift density was **614, 273 and 130 organisms/100 m³** at three sites, i.e. **1.3–6.1/m³**. Drift biomass was highest in August, at **4.00, 1.34 and 0.07 g wet/100 m³** downstream. Detritus drift was 13.7–34.2 g dry/100 m³, and invertebrate density correlated with detritus drift (r = 0.824). — [Braatz 1974, UW-Stevens Point thesis](https://minds.wisc.edu/items/a66a2b01-44cc-4916-bd66-92271fa019d1/full)
- In a Colorado Rocky Mountain stream (flagged), drift was ~10× higher at night, and 24-h totals approached **~2,000/100 m³ (~20/m³)** in mid-summer. — [search summary of Gunnison insects page](https://gunnisoninsects.org/ephemeroptera/baetis_bicaudatus.html)
- Night drift "can be up to 10 times higher" than day (Benke et al. 1986). Scud (*Gammarus*) drift rose ~1 h after sunset and fell ~1 h before sunrise in all seasons, and after sunset reached **100-fold** the level a few hours earlier (Walters 1962). The day-night difference persists year-round but is weaker outside summer. — [Wikipedia: Invertebrate drift (secondary)](https://en.wikipedia.org/wiki/Invertebrate_drift)
- Southern Appalachian drift (flagged: southern):
  - aquatic larval drift was greatest at **sunset**;
  - terrestrial inputs exceeded aquatic larvae in biomass at **midday** and in **autumn**, and peaked in early summer;
  - terrestrial invertebrates supplied **~2.86 ± 0.42 g AFDM m⁻² yr⁻¹** to drift.
  
  The trout budget assumed:
  - trout ingest **80% of available benthic prey** (Huryn 1996);
  - **food conversion efficiency 20%** (Waters 1988);
  - **1 g AFDM = 5.55 g wet**.
  
  Benthos plus terrestrial inputs could then support **3.3–18.2 g wet m⁻² yr⁻¹** of trout production, against 10–30 for "productive" streams. When drift is scarce, trout switch to benthic foraging. Terrestrial prey made up 33% of annual trout diet in western North Carolina (Tebo & Hassler 1963). — [Romaniszyn et al. 2007 (full text)](https://ww2.coastal.edu/jjhutche/Pubs/Romaniszyn%20et%20al%202007%20aquatic%20&%20terr%20invert%20drift.pdf)
- In Stoney Brook, NH (northern temperate), brook trout ate five mayfly taxa in similar numbers and were more size- and mayfly-selective by day than by night. High trout density raised *night* drift of *Baetis* and *Paraleptophlebia*. Feeding rates by weight did not differ between day and night. — [Forrester 1992, UNH dissertation](https://scholars.unh.edu/dissertation/1706)
- Brown trout activity tracked drift, which peaked at dusk and dawn (Belgium). — [Giroux et al., ORBi](https://orbi.uliege.be/handle/2268/5854) (via search summary)
- Doubling discharge below Glen Canyon Dam raised pool and detritus taxa drift >10× but cut blackfly drift by >80% (flagged: regulated large river). — [GCDAMP drift summary](https://gcdamp.com/index.php/Drift_and_Food_Availability_Studies)
- Elliott (1971, Oecologia 6:350–379) measured drift distances for 18 taxa. Distances were constant per taxon at a given velocity and unaffected by day or night or season. Values were not retrieved. — [record](https://continenticola.myspecies.info/node/1712)

### Inferences
- **Drift flux in Hot Brook** (my arithmetic). A riffle 0.3 m deep at ~0.3 m/s passes ~7,800 m³ per metre of width per day. At 1–6 animals/m³ that is **~8,000–47,000 drifting animals per m width per day**. Most resettle within metres, so this is transport, not loss.
- **Biomass flux.** At Wisconsin's 0.07–4.0 g wet/100 m³, that is ~5–310 g wet per m width per day, a 60-fold range set by productivity.
- **Diel schedule for the sim.** Aquatic drift ×1 by day, ramping to ×5–10 from ~1 h after sunset, with a smaller dawn peak. Lake zooplankton export is also higher at night (Detmer 2017), but fish remove more of it by day (Polish outlets).
- **Terrestrial component.** ~3 g AFDM m⁻² yr⁻¹ falling under the forested banks, peaking in early summer and dominating biomass in autumn.
- **Fish share.** In the trout budgets, fish eat ~80% of the prey *available to them*, but invertebrate predators eat 72–92% of benthic production first (Q2). A reasonable sim rule: drift-feeding fish can harvest most drift that passes within their reactive distance at dusk and dawn, but the drift pool is only the ~10–30% of production not consumed by invertebrate predators, plus terrestrial and lake inputs.

### Gaps
- No New England drift study gave paired day and night densities in per-m³ units. The Adirondack 1982 diel-foraging paper was not retrieved.
- No figure was found for the daily fraction of benthos drifting, and Elliott's distances were not retrieved.
- The western North American DRIFteRS dataset (Toskey, Naman, Rosenfeld et al., Ecology 2026) exists but was not mined. — [NOAA repository record](https://repository.library.noaa.gov/view/noaa/76515)
- No quantitative fraction of drift eaten by *dace, fallfish or sunfish* (rather than trout) was found.

---

## 4. Fish production, dace food limitation, predation and riffle refuges

### Takeaway
Blacknose dace are benthic-insect specialists. In a Maine river they produced **~53 kg/ha/yr (5.3 g wet m⁻² yr⁻¹)**, falling 28% when benthic prey declined, because unlike creek chub they could not switch to terrestrial prey. That production needs roughly **4–5 g AFDM m⁻² yr⁻¹ of prey**, about the *entire* production of a Hubbard Brook-type stream. Dace at 1–2/m² therefore need the outlet's lake-fed subsidy. Piscivorous centrarchids sit in pools deeper than ~50 cm and push small fish into shallow riffles. Those riffles are a real but imperfect refuge, and they expose larger fish (>3–4 cm) to wading and diving birds in water shallower than ~20 cm.

### Cited Findings
**Dace production, diet and growth**
- In the Piscataquis River, Maine, blacknose dace production was **52.7 kg ha⁻¹ yr⁻¹ before logging and 37.7 the year after**. Diet composition and gut fullness changed with benthic prey availability. The dace were "morphologically constrained to feed on a declining aquatic prey resource". Creek chub switched to terrestrial arthropods and rose from 8.6 to 17.4 kg ha⁻¹ yr⁻¹. — [Garman & Moring 1993, Env. Biol. Fish. 36:301–311 (abstract)](https://link.springer.com/article/10.1007/BF00001726)
- Shenandoah NP headwaters (flagged: Virginia; acidified streams): dace pool density was **23.2 and 22 fish/100 m² (~0.22/m²)**, production **0.3–2.4 kg/ha/yr**, increasing with acid-neutralizing capacity. Both dace and brook char used **pools more than riffles**. Species richness was 3–7, and only those two occurred in all three watersheds. — [Newman 1995, Virginia Tech MS thesis](https://vtechworks.lib.vt.edu/items/503118b9-52e7-46a1-841d-a8a9add5432f)
- Iowa dace mature at age II. Age-0 fish reach 24–27 mm and age I 49–50 mm, with fastest growth in May–July. — [Iowa Academy of Science](https://scholarworks.uni.edu/pias/vol72/iss1/42)
- FishBase gives a maximum age of 3 years and a common length of 5.7 cm TL. — [FishBase](https://fishbase.org/summary/2943)
- In Manitoba, the blacknose/longnose dace pair is abundant at high gradient (~7 m/km), with fast water, gravel and rock beds, and plant detritus feeding their insect prey. Longnose dace nest in water >45 cm/s over large stones, and blacknose in slower water over smaller stones. Both use shallow, silty, slack margins briefly in early summer. — [Gibbons 1971 thesis, Univ. Manitoba](https://mspace.lib.umanitoba.ca/handle/1993/5822)
- In the North Pine River, Manitoba, fingerling brook trout competed with dace for food and grew more slowly where dace were denser. Yearling and larger trout did not compete with dace. — [Schlick 1966 thesis](https://mspace.lib.umanitoba.ca/xmlui/handle/1993/5420)

**Predators**
- **Chain pickerel** (Maine): juveniles eat invertebrates and become strongly piscivorous at **7–9 in (18–23 cm)**. Principal prey are yellow perch, white perch, sunfish, minnows and smelt. — [MDIFW pickerel plan](https://www.maine.gov/ifw/docs/strategic-management-plans/pickerel.pdf)
- Pickerel favour small-stream pools with vegetation and wood and ambush from undercut banks, logs and weeds. — [WVDNR](https://wvdnr.gov/plants-animals/sportfish/chain-pickerel/); [Virginia DWR](https://dwr.virginia.gov/wildlife/fish/chain-pickerel/)
- **Fallfish**: juveniles eat chironomids and zooplankton. From **~100 mm** they eat small fish, including their own young, plus fish eggs and insects. Adults are omnivorous (algae, fish, aquatic and terrestrial insects, crayfish). They favour swift currents and the bases of falls, and growth depends on stream size and conspecific density. — [Mass.gov fallfish](https://www.mass.gov/info-details/fallfish); [Wikipedia: Fallfish](https://EN.wikipedia.com/wiki/Fallfish); [Guidesly](https://guidesly.com/fishing/fish-species/fallfish) (secondary sources, via search summary)

**Riffles as refuges**
- In Schlosser's 1987 experiment (warmwater Midwest stream, 15 species), young of all species and adult small minnows were concentrated in shallow riffles and raceways, while large adults (suckers, sunfish) stayed in pools. **With bass present, juveniles were largely restricted to shallow riffle and raceway refugia. Without bass they preferred pools**, even though benthic insects were denser in riffles, so they gave up food to avoid predation. Bass still took prey in the refuges, and **white suckers were the most vulnerable** prey, smallmouth bass the least. — [Schlosser 1987, as summarised in search results](https://agris.fao.org/search/en/records/65dfb19fb766d82b1802e4d7)
- Power 1987 (Oklahoma and Panama, full text):
  - large bass occupied pools **>50 cm deep on 72 of 75 pool-dates**;
  - fish **>3–4 cm** avoided water **<20 cm**;
  - age-0 *Campostoma* (2–3 cm SL) used water <20 cm;
  - **tethered fish in water <18 cm were all taken by herons or kingfishers within 24 h (0/6 survived), against 10/14 in water >18 cm**;
  - bird predation caused a 77% decrease in fish concentrated in shallow water.
  
  This gives a "bigger-deeper" rule: small fish shallow to avoid fish, large fish deep to avoid birds. — [Power 1987, in Predation: Direct and Indirect Impacts (full text)](https://ib.berkeley.edu/labs/power/publications/Power_1987_PredatorAvoidance.pdf)
- Juvenile blacknose dace avoided places holding adult predatory fish, and structural cover was the strongest settlement factor. — [Colorado water board document, as summarised](https://dnrweblink.state.co.us/CWCB/0/doc/133175/Page6.aspx)
- During drying in an Ozark stream, refuge use was species-dependent: creek chub favoured pools, while bigeye shiners survived better in riffles. — [USGS](https://www.usgs.gov/publications/refuge-habitats-fishes-during-seasonal-drying-intermittent-stream-movement-survival)

### Inferences
**Dace energy budget for the sim** (my arithmetic on the cited numbers):
- 5.27 g wet m⁻² yr⁻¹ ÷ 5.55 = **~0.95 g AFDM m⁻² yr⁻¹ of dace production**. At 20% gross conversion that needs **~4.7 g AFDM m⁻² yr⁻¹ of prey eaten**.
- That equals or exceeds the *total* invertebrate production of Bear Brook NH (4.2), of which invertebrate predators take 72–92%. A Hot Brook fed like a lake bed (worms and scuds on settled organic matter, ~2–4 g AFDM total) **cannot** sustain dace at Maine-river production, which matches the sim's starvation.
- Hot Brook: 1,200 m² × 1–2 dace/m² = **1,200–2,400 dace**. At ~2 g each (my assumption for a ~5.7-cm minnow), that is 2–4 g wet/m² standing stock. At an assumed P/B of ~1.5–2 for a 3-year fish, production is ~3–8 g wet m⁻² yr⁻¹, consistent with Garman & Moring. They need **~2.7–7 kg AFDM of prey per year** across the brook.
- Feed them from:
  1. outlet filterers (hydropsychids and blackflies, which dace pick from cobble);
  2. riffle grazers and chironomids;
  3. lake crustacean zooplankton in the drift (by day; ~40–50% removed per 100 m);
  4. terrestrial drop-in (~3 g AFDM m⁻² yr⁻¹; less useful to dace, which are benthic specialists).

**Predation rules:**
- The 1–1.2-m upper-mouth pool and the 0.5-m run are piscivore habitat: pickerel ≥18–23 cm, smallmouth, and fallfish ≥10 cm.
- Riffles at 0.2–0.3 m are the dace refuge from fish, with reduced but nonzero capture.
- Shallow margins (<18–20 cm) expose fish >3–4 cm to herons, kingfishers and the loon/eagle analogues.
- When riffles shrink in low flow, the refuge disappears (Q5).
- The sim's "eaten out within a year" outcome is expected if dace are scored as available to pool piscivores everywhere. It should drop sharply if dace stay in riffles and piscivores stay in water deeper than ~50 cm.

**Densities.** The 1–2 dace/m² target is high next to Shenandoah pools (0.22/m²) but plausible for an outlet riffle with subsidised food. Dace density should depend on riffle area and food, not pool area.

### Gaps
- No blacknose dace bioenergetics parameters (Cmax, respiration) or field daily ration were found. A redside shiner FB4 model is the nearest template. — [USGS redside shiner model](https://pubs.usgs.gov/publication/70239884)
- No removal-based blacknose dace density (fish/m²) from a northeastern stream was found, nor dace density for any lake outlet.
- No stream study quantified predation *rates* on dace by pickerel, smallmouth or fallfish. Schlosser 1987 and Power 1987 give habitat shifts, not consumption.
- Fraser & Cerri 1982, Gilliam & Fraser 1987 and Harvey et al. 1988 were not retrieved.
- The Gibbons 1971 thesis PDF exceeded the fetch size limit, so diet percentages and velocity preferences are not extracted.
- Redbreast and pumpkinseed sunfish use of outlet pools, and white sucker larvae drift, were not researched here.
- Unverified (search-result summaries; source page not pinned):
  - in the Adirondacks, blacknose dace, pearl dace and brook trout had the most benthos-linked, mutually similar diets, while creek chub was distinct;
  - in outdoor streams, minnow movement across fast riffles was low and rose from 7.2% to 20.2% with caged predators in pools (Schaefer 2001).

---

## 5. Low flow: when the lake drops and the outlet nearly stops

### Takeaway
When the lake level drops toward the outlet sill, flow, depth and wetted width all shrink. Riffles are lost first, so filter feeders (collector-filterers), gatherers and scrapers collapse, while predators persist and pool communities change little. Drift jumps briefly. In a lake-outlet brook carrying 24–25 °C surface water, isolated pools heat and lose oxygen, and fish mortality tracks low dissolved oxygen and depth. Prey are also crowded into the pools where piscivores already sit.

### Cited Findings
- Diverting **38–84%** of August flow (summer exceedance up to 99.9%) in Connecticut pool-riffle streams caused:
  - a sharp drop in total insect biomass;
  - a fall in **riffle** density with **no change in pool density**;
  - significant biomass losses for **collector-filterers, collector-gatherers and scrapers**;
  - **predators and shredders** were resistant;
  - smaller individuals in Hydropsychidae, Polycentropodidae and Simuliidae;
  - unchanged family richness;
  - a decrease in **FPOM export** despite higher FPOM concentration.
  
  The best predictor for filterers was % riffle habitat (R² 0.90). These shaded, groundwater-fed streams did **not** warm, temperature actually fell ~5%, and some wetted habitat always remained, which the authors credit with preventing worse effects. One study stream was a reservoir outlet. — [Walters & Post 2011 (full text)](https://wyocoopunit.org/wp-content/uploads/2024/12/Walters_and_Post_2011.pdf)
- From the same experiment (2009 NABS abstract): lowered flow reduced univoltine, drift-prone, weak-crawling, small-to-medium, erosional-habitat insects. — [NABS 2009 abstract](https://nabs.confex.com/nabs/2009/techprogram/P4526.HTM)
- Review: reduced discharge decreases velocity, depth and wetted width, increases sedimentation, and changes temperature and chemistry. **Drift often increases immediately after flow reduction.** Natural and artificial low flows have similar effects, with severity set by duration and magnitude. — [Dewson, James & Death 2007, JNABS 26:401–415 (abstract)](https://hero.epa.gov/hero/index.cfm/reference/details/reference_id/1290594)
- In a Precambrian Shield lake chain, snowmelt raised lakes above their outlet elevations to generate outflow. Summer evaporation then drew storage **below the outflow thresholds, so outflow ceased** and lakes disconnected, and summer rain was insufficient to reconnect them. — [McMaster Experts record (search snippet)](https://experts.mcmaster.ca/scholarly-works/1727611)
- Organisms trapped in isolated pools face higher water temperature and lower dissolved oxygen, which raise mortality and shift community composition (citing Magoulick 2004). — [NM WRRI report](https://nmwrri.nmsu.edu/nm-wrri-supported-research/documents/2022-2023/Brittany%20Pulcini%20NMWRRI%20Final%20Report.pdf) (via search summary; flagged: arid system)
- Some drought refuges on the Rio Grande hold water but are ecological traps because of poor water quality. — [Van Horn et al. 2022](https://webapps.usgs.gov/mrgescp/documents/Van-Horn-et-al_2022_Water-Quality-in-Three-Potential-Drought-Refuges-in-an-Arid-Land-River.pdf) (via search summary; flagged: arid)
- In San Antonio Creek, California, pool fish mortality correlated closely with DO and depth, and temperature spikes were followed by mass mortality. — [probable source: Mosqueda 2011, UC Berkeley ES196 project](https://nature.berkeley.edu/classes/es196/projects/2011final/MosquedaC_2011.pdf) (attribution from search summary not verified; flagged: Mediterranean climate)
- Pools, perennial reaches and off-channel habitat are the main drought refuges for fish, and they supply recolonists (Magoulick & Kobza 2003, Freshwater Biology 48:1186–1198). — [Wikipedia: Drought refuge](https://en.wikipedia.org/wiki/Drought_refuge) (secondary)
- Low lake levels warm the shallows and lower oxygen (lake-association observation, non-peer-reviewed). — [Winnipesaukee forum](https://www.winnipesaukee.com/forums/archive/index.php/t-29818.html)

### Inferences
- **Sequence for Hot Brook in a dry year** (built from the above):
  1. As lake stage approaches the sill, discharge falls and the riffles (0.3 m) shrink and slow first.
  2. Hydropsychids and blackflies lose their feeding current, drift out or die. Outlet filterer biomass should fall in proportion to riffle area and velocity, and to near zero at no flow.
  3. Drift spikes briefly, then collapses.
  4. Seston delivery stops, so the lake subsidy is cut at the moment dace need it most.
  5. Dace lose their riffle refuge and crowd into the upper-mouth pool and run, where pickerel, smallmouth and large fallfish sit. Predation rates should rise.
  6. Unlike Walters & Post's shaded streams, Hot Brook's water *is* lake surface water at up to ~24–25 °C. Isolated pools will warm further and lose DO at night, so add a hypoxia/heat hazard for pool-bound fish and drying of exposed mussels.
  7. Recovery comes from the lakes. Fallfish and sucker runs, plus dace recolonising from any perennial pool, re-seed the brook. Filterers recolonise quickly by drift and oviposition once flow returns.
- **Model trigger.** Tie brook discharge to Upper lake stage above the sill elevation (threshold outflow). Below the sill, flow = 0 and the brook becomes a chain of pools. Mussels need wetted bed, and filterers need velocity of roughly ≥0.25–0.3 m/s (from the Robinson & Minshall outlet velocities; my threshold).

### Gaps
- No study was found that measured invertebrates or fish in a *lake-outlet* stream during lake-level disconnection.
- No Maine data were found on Hot Brook stage, sill elevation or dry-year outflow.
- Mussel (*Elliptio*) mortality from exposure during outlet drying: not found.
- Dewson et al. 2007 and James et al. full texts (drift numbers under 80–95% flow reduction in NZ streams <4 m wide) were not retrieved, because BioOne did not render.
