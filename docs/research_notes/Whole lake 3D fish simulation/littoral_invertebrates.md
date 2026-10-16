# The littoral invertebrate food web of small, shallow, coloured, soft-water northern lakes: plant-dwelling fauna, snails, young-fish diets, emergence, crayfish and predation (parameters for the Hot Brook 3-D sim)

Scope: numbers and mechanisms for the invertebrates on weeds and on the littoral bed, and for the fish that eat them, to parameterise the stage after the plant field (`src/w3/plants3.js`, forms EM emergent, FL floating-leaved, SC submerged canopy, IS isoetid rosettes, DM deep Nitella/moss meadow). Compiled 2026-10-16.

Conventions:
- Region tags: [ME], [NH], [VT], [NY], [NY-Adk], [ON], [QC], [NS], [MI], [WI], [EU], [other]. Water type is given where known (soft/hard, coloured/clear, trophic state).
- DW = dry weight, WW = wet weight, SL = standard length, TL = total length, CL = crayfish carapace length.
- Source status: "(full text)" read in full; "(abstract)" or "(summary page)" read from an abstract or a project page; "(snippet)" seen only through a search-engine summary, so treat it as a lead. "(my arithmetic)" marks my own calculations.

This note builds on, and does not repeat, these notes in this repository:
- `docs/research_notes/Hot Brook populations and water/invertebrates_plankton_plants.md` ("the invertebrates note"): crayfish densities and calendar, mussels, muddy-bed benthos (chironomids, *Chaoborus*, *Hexagenia*, *Hyalella*, odonates), zooplankton, plants.
- `docs/research_notes/Whole lake 3D fish simulation/macrophytes.md` ("the macrophytes note"), §5.3 and §7.4: first per-gram epiphytic numbers and the form factors.
- `docs/research_notes/Maine lake shores and catchment/land_lake_subsidies.md` ("the subsidies note"), §1 and §6: terrestrial insect fall-in, emergence magnitude and export.
- `docs/research_notes/Real lake ecology for calibration/fish_zooplankton_coupling.md` and `.../largemouth_bass.md`: fry diets and the first-winter starvation threshold.
- `docs/research_notes/Maine lakes ponds and streams/centrarchid_percid_esocid_parameters.md`: the smallmouth overwinter threshold for a Maine winter.
- `docs/research_notes/Seasonal fish habitat use/perch_pickerel_smallmouth_pumpkinseed.md` and `.../whiteperch_shiner_sucker_bullhead.md`: diel and seasonal habitat use.

## 1. Epiphytic (plant-dwelling) macroinvertebrates: density and biomass per gram of plant and per m² by growth form, seasons, production and the bare bed

### Takeaway
Submerged weeds in north-temperate lakes carry roughly **20–200 invertebrates per g plant DW** (most often 30–100). Measured extremes run from 3 to 680 per g.

- **Per m² of bed:** about **4,000–17,000 individuals** in summer. This is typically **7–20× the density of the adjacent bare bottom**, and 50–160× for snails.
- **Biomass:** a few mg DW per g plant. A *Potamogeton* bed in a eutrophic lake held 13.5 g DW/m² averaged over April–September, 8.3 of it leeches.
- **Growth form:** per gram, submerged plants carry more than floating-leaved or emergent plants. Finely dissected leaves do **not** reliably carry more per gram than broad leaves. Snails prefer broad leaves, and charophyte-type meadows can be very dense per gram.
- **Seasons:** the course depends on emergence and fish predation. In northern mesotrophic lakes with fish, biomass on plants falls about 2–2.5× from late spring to August, as midges and odonates emerge and fish crop the large prey. In a eutrophic Polish lake, oligochaete and chironomid density instead rose from an April minimum to an August maximum several hundred times higher.
- **Production:** P/B rises with temperature and falls with body size. Chironomids, amphipods and odonates run at roughly 4–9 per year, and the whole community at about 5 per year.
- **Coloured water:** humic lakes are relatively richer in chironomids and poorer in mayflies and stoneflies.

### Cited Findings
**Density per gram of plant and per m² of bed**
- [NY, Onondaga Lake: 1,200 ha, urban, saline, high calcium, recovering toward mesotrophy] Kirby & Ringler 2015 sampled epiphytic invertebrates in late July–early August 2010 and 2011. (full text) — [Kirby & Ringler 2015, Northeastern Naturalist 22(4):672–689](https://www.eaglehill.us/NENAonline/articles/NENA-22-4/12-Kirby.shtml)

  | Bed | Per m² (2010 / 2011) | Per g plant DW (2010 / 2011) |
  |---|---|---|
  | Heterogeneous (*Elodea*, *Ceratophyllum*, *Myriophyllum spicatum*) | 6,052 / 4,635 | 63 / 20 |
  | Mixed pondweeds (*P. foliosus*, *P. pusillus*) | 17,080 / 6,494 | 70 / 46 |
  | Stonewort (*Chara*) | 3,876 / 7,431 | 184 / 78 |
  | Sago pondweed (*Stuckenia*) | 15,862 / 11,535 | 87 / 64 |

  Per-gram values are converted from the paper's per-kg figures (my arithmetic). Gastropods and amphipods dominated the *Chara* and heterogeneous beds; chironomids, oligochaetes and coenagrionid damselflies dominated sago pondweed. The authors flag inconsistencies between their table and text on which beds ranked highest.
- [compiled in the same paper] Literature comparisons per m² of bed:
  - Lake St. Clair, MI: <5,000;
  - Veluwemeer (NL): 6,000; Westeinderplassen (NL): 15,000;
  - Lake Seminole, GA: 12,855; Orange and Henderson lakes, FL: 12,257–17,596;
  - Potomac River: 27,960.

  Per kg plant DW: Lake Mendota, WI (Andrews & Hasler 1943) 20,000–52,000 (= 20–52 per g); Montezuma marsh, NY (Krull 1970) 3,060–20,590 (= 3–21 per g). — [Kirby & Ringler 2015](https://www.eaglehill.us/NENAonline/articles/NENA-22-4/12-Kirby.shtml)
- [QC/NY-Adk, St. Lawrence and Adirondack lakes, summer 2005] Results on native and exotic milfoils (full text) — [Wilson & Ricciardi 2009, CJFAS 66:18–30](https://www.redpath-staff.mcgill.ca/ricciardi/Wilson&Ricciardi2009.pdf):
  - Gastropods were more than 60% of epiphytic invertebrate biomass at three of four sites.
  - Total invertebrate biomass per g plant declined from June to August on both milfoils at Lac St-Louis.
  - Native *M. sibericum* carried 1.5–2.2× the density of Eurasian milfoil in late summer. The native *M. alterniflorum* carried 1.8–2.2× fewer animals than Eurasian milfoil, but larger ones.
  - Per-gram values appear only in figures. The macrophytes note gives their range as 25–676 per g, mostly 36–100.
- [ON, Lake Opinicon: hard water, mesotrophic, 750 ha] Plant surface area per g DW: *Myriophyllum exalbescens* 761 ± 98 cm², *Potamogeton richardsonii* 546 ± 28, *Vallisneria americana* 1,417 ± 67. Invertebrate density ranked *Myriophyllum* > *Potamogeton* > *Vallisneria* (no values on the page). Plants were set at 2 m and sampled June–October 1974. (summary page) — [Gerrish & Bristow 1979, J. Great Lakes Res. 5:69–72 (QUBS page)](https://research.qubs.ca/projects/macroinvertebrate-associations-with-aquatic-macrophytes-and-artificial-substrates)
- [QC] Cyr & Downing 1988 (macrophytes note, abstract):
  - Epiphytic abundance rises with plant biomass per m², sediment organic matter and TP, and falls with depth.
  - Dissected leaves do not generally carry more per gram: *Myriophyllum* > *P. amplifolius* > *P. robbinsii* ≈ *Vallisneria*.
  - Source: [Cyr & Downing 1988a, CJFAS 45:976](https://doi.org/10.1139/f88-120); [1988b, Freshwater Biol. 20:365](https://doi.org/10.1111/j.1365-2427.1988.tb00462.x)
- [MI, 6 southern lakes, 53–197 ha, TP 17–32 µg/L, chl 3.6–11.6 µg/L] Epiphytic biomass per g plant was measured on 13 stems per species per lake in early July and late August 1999 (full text) — [Cheruvelil, Soranno & Madsen 2001, J. Aquat. Plant Manage. 39:67–72](https://apms.org/wp-content/uploads/japm-39-01-067.pdf):
  - In July, biomass per g fell along the Eurasian-milfoil cover gradient (20–95%).
  - On milfoil itself, biomass per g fell as milfoil cover rose (r² = 0.54, p = 0.098).
  - *Ceratophyllum*, *P. zosteriformis* and *P. illinoensis* carried biomass similar to milfoil.
  - In the lake with the least milfoil, density and biomass fell from July to August, "likely due to an emergence" of odonates and chironomids.
- [MI] A companion MSc thesis found higher density and biomass on dissected than on undissected plants. (snippet) — [Cheruvelil MSc, Michigan State](https://d.lib.msu.edu/etd/30420)
- [VA] Invertebrates per g were highest on highly dissected milfoils, then moderately dissected plants, then floating-leaved plants. Lakes lacking dissected plants had lower per-gram density. (snippet) — [VCU thesis](https://scholarscompass.vcu.edu/etd/5604)
- [QC, Lac Saint-Pierre] Over more than ten species, submerged plants hosted significantly more invertebrates per g DW than emergent or floating-leaved plants. Complex architecture did not host more *biomass*; the authors attribute this to snails preferring *Vallisneria*. (snippet) — [Lac Saint-Pierre study](https://belsp.uqtr.ca/id/eprint/162/)
- [WI, Carroll Lake] In lab colonisation (snails per plant), snails chose broad-leaved *Potamogeton* over thin-leaved plants: *Ceratophyllum* 1.6, *Elodea* 3.5, *P. robbinsii* 8.0, *P. richardsonii* 12.6. (full text, OCR) — [Brown 1997, Am. Malacol. Bull. 14:27–33](https://archive.org/stream/biostor-143333/biostor-143333_djvu.txt)
- [US] Phytomacrofauna density did not consistently track fluctuations in plant surface area across natural stands. (snippet) — [Brown et al. 1988, USGS record](https://www.usgs.gov/publications/relationships-phytomacrofauna-surface-area-naturally-occurring-macrophyte-stands)
- [WY, saline lakes; flagged: not a soft-water analogue] Epiphytic biomass per unit lake area was lowest in emergents. (snippet) — [UNH record](https://scholars.unh.edu/faculty_pubs/496)
- [GA/FL, Lake Seminole; warm water] Total density was lowest on the floating-leaved *Nymphaea odorata* (5,931/m²) and highest on *Hydrilla* (12,855/m²). (snippet) — [ERDC record](https://erdc-library.erdc.dren.mil/jspui/handle/11681/6399)
- [NL, oxbow] Richness, density and biomass were "considerably higher" in a *Nymphoides peltata* (floating-leaved) biotope than in the plant-free area. (snippet) — [Hydrobiologia record](https://link.springer.com/doi/10.1007/BF02272235)

**Biomass per m², and the bare bed by comparison**
- [EU, PL, Lake Zbęchy: eutrophic, polymictic, 109 ha, mean depth 4.2 m] *Potamogeton perfoliatus* beds, April–September 1981–82 (full text) — [Kasprzak 1985, Acta Hydrobiol. 27:63–73](https://www.rcin.org.pl//Content/206996/PDF/KR038_183698_r1985-t27-no1_AH-Kasprzak-63-73.pdf):
  - mean density and biomass (individuals/m², g DW/m²): Naididae 10,661 / 0.6; Chironomidae 9,369 / 4.4; Gastropoda 461 / 0.1; Hirudinea 150 / 8.3; mayflies, caddis, odonates and amphipods each ≤ 56 / < 0.1;
  - total 13.5 g DW/m² of bed;
  - spread over the whole lake bottom, 1.76 g DW/m²;
  - mean individual mass: phytophages 0.18 mg DW, predators 2.05 mg DW;
  - April minimum of 0.1 g DW/m² (145 individuals/m²); oligochaete and chironomid density peaked in August at "several hundred times" the minimum.
- [WI, Eau Galle Lake, 1992] Mean benthic invertebrate density was 13× higher under *Ceratophyllum* and 7× higher under *P. nodosus* than in nearby bare sediment. *Amnicola limosa* and *Gyraulus parvus* were 162× and 48× denser under *Ceratophyllum*. (snippet; attribution to the ERDC record not verified) — [ERDC record](https://erdc-library.erdc.dren.mil/jspui/handle/11681/6399)
- [US] *P. nodosus* beds held 34,000–44,000/m² against 1,700–3,300/m² on bare bottom (macrophytes note §5.3). — [USACE TR A-89-3](https://apcrp.el.erdc.dren.mil/elpubs/pdf/tra89-3.pdf)
- [ON, Lake Opinicon, 1980] At 1.0–1.3 m in late summer (summary page) — [Keast 1984, Can. J. Zool. (QUBS page)](https://research.qubs.ca/projects/the-introduced-aquatic-macrophyte-myriophyllum-spicatum-as-habitat-for-fish-and-their-prey):
  - native plant foliage carried about twice as many invertebrates per m² as Eurasian milfoil;
  - benthic prey under native beds were "several times" more abundant;
  - insect emergence was about twice as high.
  - Where milfoil took over the 2–3.5 m zone, isopods, chironomid and caddis larvae, and mayfly nymphs declined.

**Seasonal course**
- [MI] Non-snail prey on plants fell about 2.5× from May to August (macrophytes note). — [Mittelbach 1981, CJFAS 38:896](https://doi.org/10.1139/f81-121)
- [MI] Biomass fell from July to August with odonate and chironomid emergence. — [Cheruvelil et al. 2001](https://apms.org/wp-content/uploads/japm-39-01-067.pdf)
- [QC/NY] Biomass declined from June to August. — [Wilson & Ricciardi 2009](https://www.redpath-staff.mcgill.ca/ricciardi/Wilson&Ricciardi2009.pdf)
- [EU, eutrophic] Density was at a minimum in April–May and a maximum in August. — [Kasprzak 1985](https://www.rcin.org.pl//Content/206996/PDF/KR038_183698_r1985-t27-no1_AH-Kasprzak-63-73.pdf)
- [EU, DE shallow eutrophic lakes] Epiphyton (the algal film) was 100–400 µg chl a per g plant DW in summer, rising to 1,700 in autumn. Differences between plant species and lakes were few. (snippet) — [AGRIS record](https://agris.fao.org/search/en/records/65df1d837c7033e84becdf59)
- [NE NA] Epiphyton peaks near TP 39 µg/L. Snails graze it, which benefits the host plant (macrophytes note). — [CJFAS 1991](https://doi.org/10.1139/f91-268)

**Production, P/B, temperature**
- [review, 37 standing waters] Iwakuma 1986 (abstract) — [Iwakuma 1986, Jpn. J. Ecol. 36:169–187](https://www.jstage.jst.go.jp/browse/seitai/36/3/_contents):
  - From 39 herbivorous and detritivorous chironomid species, P/B rose with annual mean bottom temperature and fell with the maximum mass of 4th-instar larvae.
  - Production fell with mean depth.
  - Lake herbivore-plus-detritivore production was about 10% of primary production.
  - The emergence:production ratio was 0.2–0.5.
  - Annual chironomid production ≈ 2.8 × annual emerging biomass.
- [ES, Lake Banyoles] A bivoltine chironomid had annual P/B of 4.1–6.1. Production was 215–270 mg DW m⁻² yr⁻¹ at the shallow station and 44–70 at the deep one. (snippet) — [Cladopelma virescens in Lake Banyoles](https://redi.cedia.edu.ec/document/334238)
- [ON] *Hyalella* P/B 3.9–4.0 (invertebrates note). — [Lindeman 1982](https://knowledgecommons.lakeheadu.ca/server/api/core/bitstreams/b1d24004-2629-4a9f-9903-55d02e55cbfd/content)
- [global review] Lentic odonates: biomass 87 mg/m² and production 748 mg m⁻² yr⁻¹ (invertebrates note), i.e. P/B ≈ 8.6 (my arithmetic). — [PMC11277287](https://pmc.ncbi.nlm.nih.gov/articles/PMC11277287/)
- [NH, Mirror Lake] Whole zoobenthos: 2.5 g DW/m² mean biomass and 14 g DW m⁻² yr⁻¹ production, so P/B ≈ 5.6 (my arithmetic from the invertebrates note). — [Strayer 1985](https://web.nies.go.jp/chiiki1/protoz/refere/id1999/1861.htm)
- [WI, Sparkling Lake] Among production methods, the Plante & Downing (1989) regression had the lowest coefficient of variation: 0.17 at habitat scale and 0.08 at whole-lake scale. Size-frequency estimates were highest and Banse & Mosher lowest. (snippet) — [Butkas et al. 2011, Aquatic Sciences](https://corescholar.libraries.wright.edu/biology/580)
- [US, TX thesis; warm] Epiphytic macroinvertebrate production was about 1.39 g AFDW m⁻² yr⁻¹ on two macrophytes, with cohort P/B about 4.3 and annual P/B about 10.2. (snippet) — [UNT thesis](https://digital.library.unt.edu/ark:/67531/metadc500077/m2/1/high_res_d/thesis.pdf)

**Coloured and soft water**
- [FI, 26 lakes: 16 humic, 10 clear] Chironomids were more abundant in humic lakes; stoneflies and mayflies in clear lakes. Polyunsaturated fatty acid content of several taxa was higher in clear lakes, so prey in humic lakes are lower-quality food. (abstract) — [Kesti et al. 2021, Hydrobiologia](https://link.springer.com/article/10.1007/s10750-021-04760-1)
- [PL, 25 soft-water lakes] Isoetid population area shrank sharply as humic matter rose. The settlement index fell from 85.4 to < 0.001 g DW/m² for *Isoetes* and from 8.4 to 6.2 for *Lobelia*. (snippet) — [Acta Soc. Bot. Pol. 2004](https://pbsociety.org.pl/journals/index.php/asbp/article/view/asbp.2004.023)

### Inferences
**Per gram of plant, by the sim's growth forms.** These are summer values (individuals per g DW; my synthesis):
- **SC** (pondweeds, bladderwort): 30–100, central 60.
- **DM** (*Nitella*/moss meadow): similar to SC or higher (*Chara* gave 78–184/g). Use 60–100 but treat it as uncertain.
- **FL** (lilies, watershield): about 0.4–0.6× of SC, i.e. 25–35 per g. Most of these animals live on the petioles, the leaf undersides and the root mat.
- **IS** (isoetid rosettes): no data. Use the bed fauna under a sparse canopy, about 0.5× of SC.
- **EM** (emergent): about 0.25× of SC. This agrees with the macrophytes note's form factors 1 / 0.4 / 0.25. I would raise DM from the implied 0.8 to about 1.

**Biomass per gram.** Mean individual mass on plants runs about 0.06 mg DW (naidids) to 0.5 mg DW (chironomids) (Kasprzak; my arithmetic). At 60 per g, that is **about 3–10 mg DW per g plant**, consistent with the macrophytes note's ≈ 5 mg DW/g.

**Per m² of bed.** With the SC Bmax of 150 g DW/m², a full canopy carries about 9,000 per m² and **about 0.5–1.5 g DW/m²** of epiphytic fauna, plus the bed fauna under it. That is on the order of Kirby's 4,000–17,000 per m² and well under the eutrophic Zbęchy 13.5 g/m², which leeches dominate. Leeches are a mostly predatory, little-eaten pool to leave out or keep small.

**Bed fauna under weeds.** The bed fauna (the existing `BENTHOS` worms and scuds, and the chironomids) should be **about 5–15× denser under a weed canopy than on bare sand or mud at the same depth**, and snails 50–150×. A simple way to get this is a habitat multiplier that rises with plant biomass, saturating at about 50–100 g DW/m².

**Season** (Maine calendar):
- Ice-out to May: low on plants. New shoots are bare; the fauna overwinters in the bed and on the evergreen IS and DM forms and FL rhizome mats.
- Late May–June: peak biomass on plants, carried by large overwintered larvae (chironomids, mayflies, odonates, caddis).
- July–August: a 2–2.5× drop through emergence and fish cropping, while numbers of small new-generation larvae rise.
- September: partial recovery in biomass as the cohort grows.
- October: transfer to the bed as shoots senesce.
- Under ice: about zero growth. Keep the stock on IS and DM and in the bed with low mortality.

**Turnover.** Use a temperature-dependent P/B, since warmer and smaller means faster (Iwakuma). At Hot Brook's season this means an annual P/B of about:
- 5–7 for chironomids and naidids;
- 4 for amphipods;
- 6–9 for small odonates;
- 2–3 for snails;
- **about 5 for the community**.

With Q10 = 2 and Hot Brook's May–October monthly water temperatures (about 12, 18, 23, 22, 17 and 10 °C), the season-mean rate factor relative to 20 °C is about 0.86. Annual P/B ≈ r₂₀ × 0.86 × 184 days ≈ 158 r₂₀. So a daily specific production at 20 °C of **r₂₀ ≈ 0.03/day** gives the community P/B ≈ 5, and **≈ 0.05/day** gives the odonate and small-chironomid value of about 8 (my arithmetic).

**Food source.** The epiphytic fauna eats the epiphyton and fine detritus on the leaves. A capacity of about 5–10 mg DW of fauna per g plant, modulated by the periphyton, is a defensible carrying-capacity form. Snail grazing should feed back positively on the plants by cleaning the epiphyton.

**Coloured water.** For a tea-coloured lake, weight the community toward chironomids and away from mayflies, and give the prey a slightly lower food quality.

### Gaps
- No epiphytic density or biomass per gram from a soft, coloured Maine or New England lake. Every per-gram value above is from hard-water, saline or eutrophic systems, or from a range compiled without water chemistry.
- No data at all for invertebrates on isoetid rosettes (*Eriocaulon*, *Isoetes*, *Lobelia*), *Nitella*, aquatic moss or *Utricularia* in North America. Bladderwort is itself a predator of small invertebrates; no consumption rate was found.
- Cyr & Downing 1988 per-gram values, Dvořák & Best 1982 (Lake Vechten seasonal biomass per gram), Rasmussen 1988 (littoral zoobenthic biomass regressions, CJFAS 45:1436) and the Plante & Downing 1989 production equation's coefficients were all paywalled (403 or 303). Only their qualitative conclusions were obtained.
- No winter (under-ice) census of plant-dwelling invertebrates was found.

## 2. Snails in soft-water lakes: calcium limits, densities, genera, pumpkinseed molluscivory and what pumpkinseed eat when snails are few

### Takeaway
Calcium and pH together set the snail fauna.
- **New England soft-water lakes (Vermont, Ca 0.86–2.8 mg/L):** lakes at **pH ≥ 6** still held strong snail and fingernail-clam populations. Below **pH 6 with Ca < 1.5 mg/L**, only the limpet *Ferrissia* and *Fossaria* (a small lymnaeid) persisted.
- **Calcium thresholds:** most gastropods are said to need Ca > 3 mg/L. Below 5 mg/L, snail and crayfish growth and diversity drop. "Soft-water" species get most of their calcium from food.
- **Hot Brook:** a coloured, circumneutral Maine lake with Ca of probably 2–5 mg/L (unmeasured) should hold **a modest, small-bodied, thin-shelled snail fauna**: *Amnicola*, *Gyraulus*, *Ferrissia*, *Physa*, small *Helisoma/Planorbella*, *Valvata*, *Fossaria*.
- **Density:** in a soft-ish Wisconsin weed bed, snails ran **470–1,770/m²** (*Amnicola limosa* dominant).
- **Pumpkinseed:** they switch to snails at **about 75–80 mm SL**. They eat >80% snails where snails are plentiful but <5% where pumpkinseed density has already depleted them, and a dense pumpkinseed population can hold snails at very low density (snails rise about 4–10× when fish are excluded). The crushing muscle is **plastic**: about 2.3–3× larger on a snail diet. Where snails are few, pumpkinseed eat chironomids, isopods, amphipods, caddis and mayflies, and in some lakes a pelagic form eats zooplankton.

### Cited Findings
**Calcium, pH and snail presence**
- [VT, 26 acid-sensitive soft-water lakes, Ca 0.86–2.8 mg/L, some coloured] Vermont DEC survey (full text) — [Vermont DEC 1987, Macroinvertebrate survey of softwater, pH-sensitive lakes](https://anrweb.vt.gov/PubDocs/DEC/WSMD/Mapp/Docs/mp_macroinvertebrate_survey_softwater_ph_sensitive_lakes.pdf):
  - Crustacea + Mollusca richness fell significantly as pH fell from 7.0 to below 5.0 and Ca from 3.0 to below 1.0 mg/L.
  - Only two gastropod taxa occurred at pH < 6: *Fossaria* (pH 5.61) and *Ferrissia* (pH 4.75). "No other Gastropods were found in lakes with median pH below 6.00 and calcium levels below 1.5 mg/l."
  - *Pisidium* was found at pH 4.66 and Ca 0.86 (a coloured lake).
  - Crayfish occurred only in two lakes with pH well above 6 and Ca above 2.0 mg/L, where they were "abundant". From the literature: decapods disappear below pH 6.0 and Ca 3.5 mg/L, but breeding populations occur at pH < 5 where Ca ≥ 3 mg/L.
  - *Hyalella* was absent below pH 5.18. The larger amphipod *Crangonyx richmondensis* inhabited coloured lakes below pH 6 and was suggested as an alternative fish food there.
  - pH 6.0 was critical for the Crustacea–Mollusca and pH 5.5 for mayflies.
  - In coloured lakes (> 30 Pt-Co), the effects of pH were weaker. All nine lakes with pH > 6 except two supported a rich mollusc, crustacean or mayfly fauna.
- [Norway, about 1,000 lakes] pH 6.0 was critical for snails and fingernail clams, and high Ca lessened the low-pH effect (Økland & Økland 1980, 1982, as summarised in the Vermont report). — [VT DEC 1987](https://anrweb.vt.gov/PubDocs/DEC/WSMD/Mapp/Docs/mp_macroinvertebrate_survey_softwater_ph_sensitive_lakes.pdf); book record: [Økland 1990, Lakes and Snails](https://conchsoc.org/node/1988)
- [NY] "Most freshwater gastropods are restricted to waters with calcium concentrations greater than 3 mg/liter" (NatureServe 2013). (snippet) — [NYSDEC freshwater mollusc account](https://extapps.dec.ny.gov/docs/wildlife_pdf/spcnfreshmollusk.pdf)
- [physiology review] Two groups are distinguished. Soft-water species take most of their Ca from food; calciphiles need at least about 20 mg/L of environmental Ca. In Ontario, *Lymnaea stagnalis* in soft water (2.0–13.2 mg/L Ca) was sparse, with no large adults, against more than 6× the abundance in hard water. (snippet) — [J. Exp. Biol. 213:1471 (2010)](https://cob.silverchair.com/jeb/article-pdf/213/9/1471/1274585/1471.pdf)
- [lab] Juvenile *Planorbella trivolvis* reared at 0.64–5.1 mg/L Ca had reduced shell Ca below 2.5 mg/L. Body size and mass were unaffected over 60 days. (snippet) — [Buffalo State thesis](https://digitalcommons.buffalostate.edu/biology_theses/46)
- [global/ON] Ca below 5 mg/L "can dramatically reduce" snail and crayfish growth and diversity; ≤ 1.5 mg/L is critical for many Ca-demanding organisms. (snippet) — [IISD-ELA blog](https://www.iisd.org/ela/blog/calcium-matters-fresh-water-happens-not-enough/)
- [ON] Lakes with Ca above about 2 mg/L had higher macroinvertebrate densities. Mollusc and crustacean abundance was lowest at Plastic Lake (Ca 0.96 mg/L). (snippet; a draft thesis) — [Piquette, Nipissing University](https://nipissingu.academia.edu/StevenPiquette)
- [ME] Maine lake conductivity examples: about 24 µS/cm (a Hancock County lake) and 52.7 µS/cm (a Cumberland County pond). (snippet; lakesofmaine.org is bot-protected) — [Lakes of Maine chemistry page](https://lakesofmaine.org/lake-chemistry.html?m=4514); [Little Watchic Pond](https://www.lakesofmaine.org/lake-chemistry.html?m=3398)
- [ME] Maine has 57 freshwater snail species, but survey effort is "very limited" (invertebrates note). — [MABP Ch. 6](https://www.maine.gov/dacf/mnap/publications/aquatic/chapter_6_6.5to6.10.pdf)

**Densities and genera in weed beds**
- [WI, Carroll Lake: Vilas County, circumneutral, mesotrophic; 2–3 °C in winter, about 20 °C late summer] Brown 1997 sampled a 500 m² weed-bed plot (full text, OCR) — [Brown 1997](https://archive.org/stream/biostor-143333/biostor-143333_djvu.txt):
  - total snails 473–1,765/m² across sampling dates;
  - by depth stratum: 170→622/m² (shallow), 523→3,748/m² (intermediate), about 925/m² (deep), rising through the season;
  - *Amnicola limosa* up to 1,360/m²; *Valvata tricarinata* 96–661/m²; *Physa gyrina* 37–207/m²; *Helisoma anceps* 22–127/m²; *Gyraulus parvus* also above 100/m²;
  - most species were under 10 mm in shell length;
  - recruitment is in spring and early summer, so numbers rise by late summer;
  - a 60% lower mean in one year;
  - fish (pumpkinseed) were proposed to remove the large, thin-shelled species, leaving small thick-shelled ones dominant.
- [MN] Snails sort by plant and depth: *G. parvus* and *V. tricarinata* on deep *Nitella*; *A. limosa* in mid-depth mixed plants; *H. anceps* in shallow rocky-bottom plants; adult *Helisoma* and *Physa* where vegetation is absent. (snippet) — [J. Minn. Acad. Sci. 35(2)](https://digitalcommons.morris.umn.edu/jmas/vol35/iss2/6)
- [other] Gastropods averaged 3,636/m² in 26 lakes where present, and were scarce with molluscivorous fish (invertebrates note). — [J. Freshwater Ecol. 2003](https://www.tandfonline.com/doi/pdf/10.1080/02705060.2003.9663993)

**Pumpkinseed molluscivory and its plasticity**
- [MI] Pumpkinseed ≤ 75 mm SL took 76–91% of their diet from vegetation-dwelling prey. Above 75 mm SL they specialised on snails in the weeds (perch/pickerel note). — [Mittelbach 1984, Ecology 65:499](https://doi.org/10.2307/1941412)
- [MI, Three Lakes vs Wintergreen Lake, about 7 km apart] Adults ate more than 80% snails in Three Lakes and less than 5% in Wintergreen (Osenberg et al. 1992). Raising fish on a snail diet made the snail-crushing muscle (levator posterior) about 230–300% larger than on soft prey, with no effect of parental lake. Winterkills in 1976–77 removed bluegill and largemouth bass from Wintergreen; pumpkinseed then increased and "maintain[ed] snail densities at very low levels", and snails "increased dramatically" in cages without pumpkinseed. (full text) — [Mittelbach, Osenberg & Wainwright 1999, Evol. Ecol. Res.](https://fishlab.ucdavis.edu/wp-content/uploads/sites/397/2020/06/Mittelbach-et-al-1999.pdf)
- [MI] Snails increased 4-fold where fish were excluded in Wintergreen (fish–zooplankton note). — [Osenberg, Mittelbach & Wainwright 1992, Ecology 73:255](https://doi.org/10.2307/1938737)
- [MI] An encounter–refuge–attack foraging model explained 47–71% of the variance in pumpkinseed prey selection among snails. The largest snail species suffered the highest mortality, because they were encountered most. (snippet) — [Osenberg 1988, MSU dissertation](https://d.lib.msu.edu/etd/23550)
- [MI] Without redear sunfish, adult pumpkinseed diets were more than 80% snails. With redear, snails were about 30% of pumpkinseed prey biomass, and snail biomass was about 69% lower in lakes with introduced redear. (snippet) — [Huckins, Osenberg & Mittelbach 2000](https://digitalcommons.mtu.edu/michigantech-p/660); [Huckins dissertation](https://d.lib.msu.edu/etd/25984)
- [TN, Bays Mountain Lake, 24 m² enclosures over 16 months] With sunfish (large redear plus small sunfish), snail biomass was more than 10× lower than in fish-free enclosures by late summer, with effects cascading to periphyton and macrophytes. (snippet) — [ETSU record](https://dc.etsu.edu/etsu-works/12215)

**What pumpkinseed eat when snails are few**
- [ON, Lake Opinicon, 2,435 stomachs, May–November 1971–73] Chironomid larvae, molluscs and isopods formed the bulk of the diet, with fewer amphipods, caddis and mayflies. Cladocerans were important only to the very young. Overlap between year classes peaked in July and in October, when isopods peaked. Winter feeding was negligible. (summary page) — [Keast 1978, JFRBC 35:12](https://research.qubs.ca/projects/feeding-interrelations-between-agegroups-of-pumpkinseed-lepomis-gibbosus-and-comparisons-with-bruegil-l-mauochirus)
- [ON, 5 lakes] Littoral and pelagic pumpkinseed differed in morphology in 4 of 5 lakes. Littoral fish had larger molars (pharyngeal teeth) and wider gill-raker spacing; pelagic fish eat less hard-bodied prey. (snippet) — [Gillespie & Fox 2003, J. Fish Biol.](https://ilse.kobv.de/KobvIndexRecord/nat_lic_papers_NLZ243249802)
- [NY, Paradox Lake] In lakes without bluegill, pumpkinseed can be trophically polymorphic, with a planktivorous limnetic form. (snippet) — [Evol. Ecol. Res. abstract](https://evolutionary-ecology.com/abstracts/v16/2921.html)
- [Lake Ontario embayment] Subyearling pumpkinseed fed mainly on amphipods. (snippet) — [USGS record](https://pubs.usgs.gov/publication/70179782)

### Inferences
**Snail stock for Hot Brook.** Treat it as present but limited:
- **weed beds 100–1,000 snails/m²**, mostly 2–6 mm hydrobiid and planorbid snails;
- **bare mud about 5–50/m²**;
- biomass of order **0.5–5 g WW/m² in beds**, the lower part of the sim's earlier 1–30 g/m² bracket.

Calcium, not food, caps body size: few snails over 10 mm, and *Lymnaea* and large *Helisoma* rare. A calcium multiplier on the snail carrying capacity (e.g. a logistic with half-effect at Ca ≈ 2 mg/L, near-zero below 1 mg/L, full above 10 mg/L), with a pH gate at 6, would make this a mechanism rather than a constant (my synthesis of the VT, NYSDEC and JEB values).

**Snail biology:**
- recruitment May–July, after ice-out and once the water is above about 10 °C;
- one generation a year for most, two for *Physa*;
- graze epiphyton, so they help the host plants;
- prefer broad leaves (FL petioles, broad SC pondweeds) over dissected leaves;
- in winter, move to the bed and deeper water.

**Pumpkinseed rule for the sim:**
- below about 75 mm SL: plant-dwelling insects and crustaceans, plus zooplankton when under about 25 mm;
- above 75–80 mm SL: snails, with handling ability set by a plastic "crushing" state that tracks recent snail intake (about 3× range), so a population that rarely meets snails stays poor at eating them;
- because pumpkinseed can deplete snails, the snail field must be prey with its own dynamics, not a fixed resource.
- In a soft-water lake, adult pumpkinseed diets should therefore be mostly chironomids, isopods, amphipods, odonates and caddis, with snails perhaps 10–40%. Expect slower adult growth than in hard-water snail lakes.

**Redbreast sunfish** (to come): it is an insectivore (see §3), not a molluscivore, so it competes with small pumpkinseed for plant insects but not with large pumpkinseed for snails.

### Gaps
- Hot Brook's calcium, alkalinity and pH are unmeasured (lakesofmaine.org is bot-protected). The 2–5 mg/L Ca range is an inference from Maine conductivity examples and regional geology.
- No snail density or biomass from a Maine lake. No snail biomass (g/m²) for the Carroll Lake densities.
- Lodge et al. 1987 (Am. Malacol. Bull. 5:73–84), Økland 1983/1990 and Bendell & McNicol 1993 (NE Ontario gastropods vs acidity) were found only as bibliographic records. Their exact Ca thresholds were not read.
- No pumpkinseed diet study from a soft-water New England lake.

## 3. Young-of-year and juvenile diets: smallmouth bass ontogeny and slow growth, juvenile pumpkinseed, perch and shiner use of littoral invertebrates vs zooplankton, and adult bass and perch use of insects and crayfish

### Takeaway
- **Age-0 smallmouth** (central Ontario, Lake Opeongo) start feeding about 4–5 days after hatching and swim up at about 10 mm to eat zooplankton. They shift steadily up the food chain between 17 and 46 mm, and above about 30 mm they eat a mainly **benthic** diet whose carbon signature matches crayfish. They reach 38–46 mm by late July. The general sequence is copepods → cladocerans → mayflies and other macroinvertebrates → fish and crayfish, with broad opportunism from about 50 mm.
- **Older smallmouth:** shift from mayflies to **crayfish and fish at about 150 mm TL**.
- **Why age-0 smallmouth fail in northern lakes:** growth is set by the first summer's temperature and food. Fish that are too small by autumn starve over a long winter. The overwinter threshold is already in other notes: about 48–92 mm for a 208-day Maine winter.
- **Yellow perch:** prefer zooplankton at about 20 mm, benthos at 40–60 mm and fish from about 80 mm (lab). In the field individuals vary, and many stay on zooplankton and benthos longer.
- **Juvenile sunfish and shiners:** juvenile sunfish feed in the weeds on chironomids and small crustaceans. Golden shiners mix zooplankton, chironomids and surface insects. No littoral species is purely planktivorous.

### Cited Findings
**Smallmouth bass, age-0 and juvenile**
- [ON, Lake Opeongo, Jones Bay; 6 nests tracked June 19–July 24, 1995] (full text) — [Vander Zanden, Hulshof, Ridgway & Rasmussen 1998, TAFS 127:729–739](https://www.harkness.ca/PDFs/Contributions%201990s/van%20der%20zanden%20et%20al%201998.pdf):
  - post-hatch embryos were 4–5 mm TL;
  - δ¹⁵N fell from about 9‰ to about 2‰ by 15 mm, consistent with a 4–5-day mixed-feeding period;
  - a slight δ¹³C dip at about 10 mm matches swim-up, "when larvae lose their yolk sac and ascend into the water column to feed on zooplankton";
  - trophic position rose between 17 and 46 mm;
  - a 3–4‰ δ¹³C enrichment in bass over 30 mm indicates "a shift from a mixed pelagic–benthic diet to a primarily benthic diet". Bass over 30 mm matched crayfish (−21‰), whereas adults were pelagic-signed (−26‰);
  - by July 24, fish were 38–46 mm;
  - the authors note juveniles that reach the largest size by winter survive winter starvation better (citing Oliver et al. 1979; Shuter et al. 1980; Cargnelli & Gross 1996).
- [general] Targeted prey progress from microcrustaceans (copepods) to larger zooplankters (cladocerans) to macroinvertebrates such as ephemeropterans. Above about 50 mm TL, juveniles become opportunistic on aquatic macroinvertebrates and prey fish (citing Easton & Orth 1992). (snippet) — [Prairie Naturalist note, SDSU](https://openprairie.sdstate.edu/nrm_pubs/112)
- [NY-Adk, Little Moose Lake: oligotrophic, introduced smallmouth; more than 500 fish angled June–August] (abstract) — [Weidel, Josephson & Krueger 2000, J. Freshwater Ecol. (MSU summary)](https://www.canr.msu.edu/resources/diet-and-prey-selection-naturalized-smallmouth-bass-oligotrophic-adirondack-la):
  - crayfish were the most frequent item and the largest share by number;
  - crayfish, mayflies, odonates and fish were 77% of items, excluding zooplankton;
  - the diet shifted from mayflies to crayfish and fish "as smallmouth bass approached 150 mm", and crayfish per stomach rose with bass length.
- [SD lakes] Bass longer than 280 mm ate mainly crayfish in all months. Bass under 180 mm took most of the age-0 yellow perch eaten. (snippet; the two summaries differ on the size break) — [SDSU thesis](https://openprairie.sdstate.edu/etd/280)
- [VA, Shenandoah River] Annual smallmouth diet: aquatic insects 32–48%, crayfish 19–31%, fish 22–29%, terrestrial insects 0.1–2.6%. The share of stomachs with food fell from 93% in spring to 26% in winter (subsidies note). — [Murphy et al. 2005, Proc. SEAFWA](https://seafwa.org/sites/default/files/journal-articles/murphy-325-335.pdf)
- [ME] Overwinter threshold about 48–92 mm for a 208-day winter. Measured Maine young-of-year (71–76 mm) imply about 40% first-winter loss. Starvation Q10 is 2.2 at 2.5–8 °C. See `centrarchid_percid_esocid_parameters.md` (Q4) and `recruitment_compensation_maturity.md` (§3). — [Shuter et al. 1980, TAFS 109:1](https://arlis.org/susitnadocfinder/Record/dbtw4279/Details)

**Yellow perch**
- [lab] Age-0 perch preferred zooplankton at about 20 mm TL, benthic invertebrates at 40 and 60 mm, and both benthos and fish at about 80 mm. Prey density did not change the pattern; energetic return explained the shifts. (abstract) — [Graeb et al. 2006, TAFS 135:1493–1498](https://experts.illinois.edu/en/publications/ontogenetic-changes-in-prey-preference-and-foraging-ability-of-ye/)
- [MI, Saginaw Bay] There was weak evidence of an ontogenetic shift. Individuals specialised on either zooplankton (*Daphnia*, calanoids) or benthos (chironomid larvae, chydorids). (snippet) — [Illinois record](https://experts.illinois.edu/en/publications/spatio-temporal-ontogenetic-and-interindividual-variation-of-age--2/)
- [EU, pond enclosures] Perch stocked at three densities, with and without dense submerged vegetation (abstract via AGRIS) — [Diehl 1992, Ecology 73:1646](https://agris.fao.org/search/fr/records/65df49ac6eef00c2cea25f71):
  - in vegetation, perch "fed almost entirely on macroinvertebrates";
  - without vegetation, microcrustaceans rose in the diet over summer;
  - perch ate predatory and non-predatory invertebrates but not molluscs.
- [ON] Perch was the main summer prey for pike and pickerel (see the existing perch/pickerel note). Perch winter diets in the existing note: *Chaoborus* and chironomids, then caddis by March.

**Juvenile sunfish, golden shiner, white perch, redbreast**
- [ON, Lake Opinicon: 787 ha, mean depth 4.9 m; weeded littoral to 2 m] Six littoral planktivorous fishes; "No species was exclusively planktivorous", and "chironomid larvae were a regular item of diet of most species". Small specialists took *Chydorus* even when rare; bluegill took *Bosmina*. (summary page) — [Keast 1985, CJFAS 42:1114–1126](https://research.qubs.ca/projects/planktivory-in-a-littoral-dwelling-lake-fish-association-prey-selection-and-seasonality)
- [ON, Opinicon] A summer weedbed community of nine juvenile species was "not food limiting", with low diet overlap (fish–zooplankton note). — [Keast 1985, Environ. Biol. Fishes 13:211](https://doi.org/10.1007/BF00000933)
- [MI, Lawrence Lake] Juvenile pumpkinseed and bluegill were caged in the vegetated littoral (3-m² cages, 2–12 fish, 50 days). Growth of both fell linearly with bluegill density and rose with the density of large invertebrates left at the end. Mean invertebrate size fell as fish density rose. (abstract via AGRIS) — [Mittelbach 1988, Ecology 69:614–623](https://agris.fao.org/search/en/records/65dfe1d04c5aef494fe62825)
- [QC] Golden shiner larvae of 5–10 mm stay at the surface at the edge of the littoral; 10–30 mm larvae school in vegetated littoral (Faber 1980). In one lake shiners fed by day on flying insects (Gascon & Leggett 1977). See the white perch/shiner note. — [ADW](https://animaldiversity.org/accounts/Notemigonus_crysoleucas/)
- [Lake Ontario embayment] Young-of-year golden shiner ate benthic tipulids in summer (subsidies note). — [USGS record](https://pubs.usgs.gov/publication/70179782)
- [Lake Ontario, May–October] White perch ate mainly amphipods, with chironomids and caddis regularly, fish eggs in early summer, and fish above 300 mm. (snippet) — [USGS record](https://www.usgs.gov/publications/food-white-perch-rock-bass-and-yellow-perch-eastern-lake-ontario)
- [VT/QC, Missisquoi Bay, Lake Champlain] Adult white perch ate *Daphnia* in large numbers when *Daphnia* exceeded 20/L and made up more than 50% of zooplankton; otherwise they ate mostly benthos. (snippet) — [J. Great Lakes Res. 34:485](https://bioone.org/journals/journal-of-great-lakes-research/volume-34/issue-3/0380-1330(2008)34[485:DOIAWP]2.0.CO;2/Diet-of-Invasive-Adult-White-Perch-Morone-americana-and-their/10.3394/0380-1330(2008)34[485:DOIAWP]2.0.CO;2.full)
- [NC, AL streams] Redbreast sunfish are insectivores: larger mayfly, odonate and beetle larvae, plus terrestrial insects and regular crustaceans. (snippet) — [SEAFWA 1971](https://seafwa.org/journal/1971/spawning-behavior-fecundity-rates-and-food-habits-redbreast-sunfish-southeastern-north); [SEAFWA 1982](https://seafwa.org/journal/1982/diet-overlap-redbreast-and-longear-sunfishes-small-streams-east-central-alabama)
- [ON, Lake Opinicon] 80–90% of fish biomass lay along the margins at ≤ 2.5 m (habitat notes). — [Keast & Harker 1977](https://research.qubs.ca/projects/fish-distribution-and-benthic-invertebrate-biomass-relative-to-depth-in-an-ontario-lake)

### Inferences
**Smallmouth diet ladder for the sim** (lengths TL; Maine timing assumes spawning in early June at 15–18 °C):

| Length | Season | Diet |
|---|---|---|
| < 10 mm | late June | yolk, then mixed feeding |
| 10–25 mm | early–mid July | copepods, then cladocerans and chironomid larvae; open water near the nest, then the weed edge |
| 25–50 mm | mid July–August | mainly benthic and plant-dwelling insects (mayfly nymphs, chironomids, small odonates, amphipods) |
| 50–150 mm | autumn of year 0 and later | insects plus small fish and age-0 crayfish |
| > 150 mm | adults | crayfish and fish dominant |

Age-0 crayfish (6 mm CL when released in early July, about 14 mm by September; invertebrates note) are exactly the right size for 50–100 mm bass in August–September.

**Why age-0 smallmouth grow slowly or starve in northern lakes:**
- a late spawn after a cold spring;
- few degree-days above about 15 °C;
- a mid-summer gap between the zooplankton peak and the next cohort of large insect larvae, after the June emergence;
- autumn feeding stops at about 7–10 °C (other notes).

In the sim, these should emerge from the bioenergetics plus the epiphytic field's emergence trough, not from a hard-coded rule.

**Perch:** zooplankton to about 30–40 mm; benthos (chironomids, amphipods, *Chaoborus* in the basin) from about 40 mm; occasional fish from 80 mm, but mainly invertebrates until well over 150 mm; inside weeds, almost entirely macroinvertebrates.

**Pumpkinseed:** cladocerans only below about 25 mm; plant-dwelling chironomids, isopods and amphipods to 75 mm SL; snails above that, where available (§2).

**Golden shiner:** surface and zooplankton feeding as larvae; weed-bed chironomids and cladocerans as juveniles; adults mix *Daphnia* at dusk, chironomids and surface insects.

**White perch:** switch between zooplankton (when *Daphnia* exceeds about 20/L) and benthos (amphipods, chironomids, pupae). This is a clean density-dependent rule.

### Gaps
- No age-0 smallmouth diet-by-length table from a lake (Easton & Orth 1992 is a river study and was not read). No Maine age-0 diet.
- No seasonal crayfish share (by mass) for adult smallmouth, yellow perch or chain pickerel in a northeastern lake. Weidel et al. 2000 gives numbers only by count; its PDF would not load.
- The golden shiner and white perch diets above are not from soft, coloured lakes.

## 4. Insect emergence and surface feeding: timing, emerging fraction and biomass, terrestrial fall-in, and which fish take them

### Takeaway
The subsidies note already gives the magnitudes:
- lake emergence ≈ **0.30 of insect production** (0.30 ± 0.04 over 49 whole-lake estimates; Iwakuma's range is 0.2–0.5, and production ≈ 2.8 × emergence);
- about **0.5–2 g DW m⁻² yr⁻¹** from a mesotrophic littoral;
- terrestrial fall-in of about **50 mg DW per metre of forested shore per day** at the summer peak, spread over the first about 5–15 m of water.

What this section adds is timing and mechanism:
- Chironomids start emerging even before the ice is fully off, and a late thaw cuts a year's emergence to about a fifth.
- Odonate emergence at 63 °N ran from **May 31 to July 19**. "Spring species" emerge synchronously after a winter diapause; "summer species" emerge in a prolonged, asynchronous way.
- *Hexagenia* in Maine ponds hatches late June–mid-July at 18–21 °C (invertebrates note).
- The pupal ascent is the moment fish take emergers. More fish means fewer and smaller midges reach the surface, and trout lakes show about 20× less emergence.

### Cited Findings
- [WA, Findley Lake: subalpine, 27.5 m; floating traps 1972–75] Several common chironomids "started to emerge before the lake had completely thawed". In a late-thaw year, only a fifth as many emerged. *Procladius* contributed the most emerged biomass every year. (snippet) — [Hydrobiologia record](https://link.springer.com/article/10.1007/BF00014135)
- [EU, three German lakes] Chironomids dominated emergence, which was unimodal or bimodal (spring, summer or early-autumn peaks) and tracked water temperature, not nutrients. Up to 1.8 g m⁻² yr⁻¹ emerged from the Lake Constance littoral (subsidies note). — [Salvarina et al. 2017](https://kops.uni-konstanz.de/entities/publication/a38a7017-821a-4130-97a6-56ebdbc696b2/full)
- [RU, Lake Shira] Annual chironomid export was 0.61 g WW/m² from the littoral, plus about 1 g WW/m² estimated from the profundal. Emergence varied with depth and sediment type. (snippet) — [J. Siberian Fed. Univ.](https://journal.sfu-kras.ru/en/article/110378)
- [ON, Experimental Lakes Area fens] Emergence began in early May and was "virtually completed by late July–early August" (invertebrates note). — [Ecography 1988](https://nsojournals.onlinelibrary.wiley.com/doi/10.1111/j.1600-0587.1988.tb00777.x)
- [review] Iwakuma 1986 (abstract) — [Iwakuma 1986](https://www.jstage.jst.go.jp/browse/seitai/36/3/_contents):
  - E/P 0.2–0.5, falling as production rises;
  - emerging chironomid biomass was 0.1–1.6% of primary production plus allochthonous input;
  - production ≈ 2.8 × emergence.
- [SE, 21 lakes near Umeå, 63°50′N] Exuviae of 17 odonate species overlapped broadly. *Leucorrhinia rubicunda* emerged first (May 31) and *Sympetrum danae* last (July 19). (snippet) — [Odonatologica (natuurtijdschriften)](https://natuurtijdschriften.nl/pub/592689)
- [review] In Corbet's scheme, "spring species" overwinter in diapause in the last larval stages and emerge in a synchronous mass. "Summer species" overwinter at mixed stages and emerge asynchronously over a long period. The category is now viewed as a property of a population, not a species. (snippet) — [Norling, Int. J. Odonatol. 24](https://worlddragonfly.org/wp-content/uploads/ijo/tijo20.v024/tijo20.v024.a1_Norling/tijo20.v024.a1_Norling.pdf)
- [MI] Odonate and chironomid emergence between early July and late August cut plant-dwelling biomass. — [Cheruvelil et al. 2001](https://apms.org/wp-content/uploads/japm-39-01-067.pdf)
- [ON] Insect emergence over native weed beds was about twice that over milfoil. — [Keast 1984 (QUBS)](https://research.qubs.ca/projects/the-introduced-aquatic-macrophyte-myriophyllum-spicatum-as-habitat-for-fish-and-their-prey)
- [ME] The *Hexagenia* hatch on Maine ponds runs late June–mid-July at 65–70 °F, near dusk, lasting about 10–14 days per pond (invertebrates note). — [Bangor Daily News 2022](https://www.bangordailynews.com/2022/07/06/outdoors/fishing-fly-hatch-joam40zk0w/)
- [IT, high-altitude lake] Fish density was positively related to midge abundance but negatively related to midge size and to the proportion reaching the surface. (snippet) — [UNIMI record](https://air.unimi.it/handle/2434/465286)
- [historical] The period of pupation and pupal ascent is "the most favourable one" for fish consumption of chironomids (a 1963 Soviet study, DFO translation). (snippet) — [DFO translation](https://waves-vagues.dfo-mpo.gc.ca/Library/108645.pdf)
- [CA, Sierra Nevada] Lakes with trout had about 20× less emergence (subsidies note). — [Vander Zanden & Gratton 2011](https://jvzlab.limnology.wisc.edu/wp-content/uploads/sites/104/2022/10/Vander-ZandenGratton_11_CJFAS_blowin.pdf)

**Terrestrial insects and surface feeders.** These come from the subsidies note §1 and are not repeated in detail:
- summer fall-in F ≈ 50 (20–120) mg DW per m of forested shore per day, peaking July–August, near zero mid-November to April;
- an exponential kernel with λ ≈ 5–15 m;
- surface cyprinids are dominated by terrestrial prey in late summer;
- smallmouth 0.1–2.6% terrestrial annually and redbreast 1.9–8%, with summer beetle pulses.
- Sources: [Mehner et al. 2005](https://doi.org/10.4319/lo.2005.50.6.2022); [Murphy et al. 2005](https://seafwa.org/sites/default/files/journal-articles/murphy-325-335.pdf); [Cloe & Garman 1996](https://link.springer.com/article/10.1007/BF02028848)

### Inferences
**Emergence calendar for Hot Brook** (ice-out about April 23; 15 °C by late May; 24 °C at the end of July):

| Taxon | When | Share or notes |
|---|---|---|
| Chironomids | a small pulse right after ice-out (late April–early May); the main pulse mid-May–June at about 10–18 °C; a second smaller pulse August–September (multivoltine littoral species) | 60–80% of emerged biomass |
| *Chaoborus* | late May–July | |
| Odonates | Zygoptera and "spring" Anisoptera (*Epitheca*, *Leucorrhinia*, *Libellula*) late May–June, synchronous over 1–3 weeks; "summer" species (*Aeshna*, *Sympetrum*) late June–August, asynchronous | |
| Mayflies | *Caenis* and others June–August; *Hexagenia* late June–mid-July at 18–21 °C | |
| Caddis | June–August | |

**Mechanism.** Each larval cohort that reaches its final size and a temperature cue converts to pupae. Pupae rise through the water column to the surface over a short window, most at dusk and night. There they are exposed to every fish, and the cue that draws fish is "prey at the surface". The adults that are not eaten leave the lake: an N and P export (subsidies note §6). A small share of females returns as eggs.

**Scale.** At an epiphytic and bed insect production of about 2–5 g DW m⁻² yr⁻¹ in the vegetated littoral (P/B ≈ 5 × 0.5–1 g DW/m²), emergence is about 0.6–1.5 g DW m⁻² yr⁻¹, consistent with the subsidies note.

**Which fish take emergers and fallen insects:**
- golden shiner (surface-feeding, daytime and dusk);
- pumpkinseed and redbreast (beetles, mayfly subimagos);
- smallmouth (the *Hexagenia* hatch and summer beetles);
- white perch (pupae and dusk surface feeding: Maine's surface-schooling white perch);
- yellow perch (pupae near the bed);
- rarely bullhead, sucker or pickerel.

A simple surface-prey field (emergers plus fall-in), seen only by fish in the top about 0.5–1 m, implements this.

### Gaps
- No New England lake emergence time series (mg m⁻² d⁻¹ by month), and no Maine chironomid or odonate emergence dates.
- No measured fraction of emerging pupae eaten by fish in a north-temperate lake.
- No lake measurement of terrestrial fall-in versus distance from shore (still the subsidies note's gap).

## 5. Crayfish mechanisms beyond the existing note: habitat, temperature and activity, predation and the size refuge, and grazing on macrophytes

### Takeaway
Virile crayfish:
- prefer about **21–26 °C** and do not moult or grow at about 10 °C or below;
- are physiologically plastic over 5–25 °C and survive near-freezing winters inactive (invertebrates note: in deeper water, under ice).

Predation is **size-selective**:
- fish prefer small crayfish;
- at equal size, virile crayfish are more vulnerable than rusty or northern clearwater crayfish;
- a few millimetres of carapace length already lowers predation;
- shelter (cobble, dense weed) lowers predation, and crayfish use more shelter under fish risk.

Bass take crayfish increasingly above about 150 mm TL. Small chain pickerel (15–40 cm) in small Nova Scotia lakes ate insects (mayfly and dragonfly nymphs), not crayfish.

Grazing: crayfish reduce macrophytes significantly only at high biomass (about 140–190 g WW/m² in experiments) or at high local densities, and they hit small, soft-leaved plants hardest. At Hot Brook's whole-lake 5–20 g/m², the effect on plants should be local, not lake-wide. Crayfish also prey on snails and on fish eggs and fry.

### Cited Findings
- [lab, 2007] Thermal preference (full text; authors not captured from the page) — [Keller et al., Northeastern Naturalist 17(4), 2010](https://www.eaglehill.us/NENAonline/articles/NENA-17-4/17-Keller.shtml):
  - *O. virilis* selected about 21 °C (similar to *O. propinquus*), against about 22 °C for *O. rusticus*;
  - literature values for virile crayfish: 22–26 °C (Peck 1985);
  - virile crayfish survive near-freezing water (Aiken 1968);
  - "*O. virilis* and *O. immunis* do not molt or grow at 10 °C".
- [MB] Virile crayfish showed "a high degree of plasticity" between 5 and 25 °C. (snippet) — [U. Manitoba MSc thesis](https://mspace.lib.umanitoba.ca/items/8a34fe8b-bc39-4f0c-8c96-8cc986590203)
- [WI/OH experiments] Fish prefer small crayfish. At equal size virile crayfish were more susceptible to largemouth bass than the invaders. All species used more shelter under predation risk, and virile crayfish were excluded from limited shelter by invaders. (snippet) — [Garvey, Stein & Thomas 1994 (AGRIS)](https://agris.fao.org/search/en/records/65df247c63b8185d9cab1012)
- [lab stream] Smallmouth ate equal numbers of equal-sized *O. rusticus* and *O. sanborni*. When rusty crayfish were 4 mm larger, as in the field, fewer were eaten. (snippet) — [Mather & Stein 1993 (OSU record)](https://kb.osu.edu/items/84ebb493-1ffb-5620-82a0-78435a6e69a9)
- [MI] Brook trout ate only age-0 crayfish, and age-0 mortality was 60–91% per summer, mostly not from fish (invertebrates note). — [MI DNR RR1811](https://www.dnr.state.mi.us/PUBLICATIONS/PDFS/DNRFishLibrary/ResearchReports/RR1801-RR1900/RR1811.pdf)
- [NY-Adk] Smallmouth bass shifted to crayfish and fish at about 150 mm, with crayfish per stomach rising with bass length. — [Weidel et al. 2000 (MSU summary)](https://www.canr.msu.edu/resources/diet-and-prey-selection-naturalized-smallmouth-bass-oligotrophic-adirondack-la)
- [NS, 15 small lakes: mean 15.8 ha, mean depth 2.7 m, mean pH 6.55; pickerel introduced] Of 17 pickerel stomachs (14.5–38.5 cm), 3 were empty, 2 held fish and 10 held insects: Ephemeroptera larvae (up to 11 per stomach) and Odonata. No crayfish were reported. From the literature, the switch to fish comes at 15–40 cm (Foote & Blake 1945), or above 8 cm (Meyers & Muncy 1962). (full text) — [Mitchell, LeBlanc & Heggelin, chain pickerel in Nova Scotia](https://www.ap.smu.ca/~lcampbel/impact-chain-pickerel.pdf)
- [MI, UMBS enclosures] *O. virilis* and *O. rusticus* had similar effects on macrophytes at equal density. Both fed selectively, and high densities reduced macrophytes. (snippet) — [Stafford 1991](https://deepblue.lib.umich.edu/items/e1f20a86-7d8c-4b55-9680-781eb621303b)
- [lab microcosm] Rusty crayfish almost eliminated the small *Najas guadalupensis* but reduced larger species only modestly, with a seasonal component. (snippet) — [Curtis 2010, Hood College](https://mdsoar.org/items/e8920e18-e86b-40ce-93c4-813946dfc562)
- [AB] Chambers et al. 1990 (*O. virilis*) found that males cut macrophyte length and growth (invertebrates note). *O. immunis* above 140–150 g/m² cut macrophyte biomass. — [USFWS ERSS](https://www.fws.gov/sites/default/files/documents/Ecological-Risk-Screening-Summary-Virile-crayfish.pdf); Chambers et al. 1990 (Freshwater Biol. 24:81–91) is cited in [a 2022 Hydrobiologia article](https://link.springer.com/doi/10.1007/s10750-022-04969-8) (citation only, not read)
- [EU, ponds, *Procambarus clarkii* at 150 g WW/m²] *Elodea nuttallii* and *Chara* biomass were "strongly reduced"; lake densities reached 191 g WW/m². (full text) — [PMC3813481](https://pmc.ncbi.nlm.nih.gov/articles/PMC3813481/)
- [WI, Plum Lake, *O. rusticus* in 9-m² cages] Macrophyte and snail densities declined in crayfish enclosures and rose in exclosures. (snippet) — [Lodge et al. 1994, Ecology (AGRIS)](https://agris.fao.org/search/ar/records/65df7fe490674e46e653bad6)
- [lab] *O. virilis* feeds on young lake trout; rock size (crevice size) changes the outcome (title-level only). — [USGS record](https://pubs.usgs.gov/publication/1000587)
- [VT] Crayfish were found only in lakes with pH > 6 and Ca > 2 mg/L (§2). Malley (1980): crayfish at pH 5.75 had difficulty taking up Ca at moult. — [VT DEC 1987](https://anrweb.vt.gov/PubDocs/DEC/WSMD/Mapp/Docs/mp_macroinvertebrate_survey_softwater_ph_sensitive_lakes.pdf)

### Inferences
**Activity and growth:**
- Scale crayfish activity, feeding and moulting with a thermal curve peaking at 21–24 °C.
- Zero growth and moult at ≤ 10 °C; near-zero activity below about 5 °C.
- At Hot Brook that gives a growing season of roughly late May to late September. Winter is spent inactive in deeper water or buried, as in the invertebrates note.

**Predation risk.** A crayfish's risk from a fish should fall with:
- the crayfish's size relative to the fish's gape (a steep logistic in CL / predator gape);
- shelter: rock, woody debris or stem density, using the plants' S50 cover function with a lower S50 for crayfish, which hide inside the bed;
- intermoult state: soft crayfish are much more exposed (popular sources only).

**Predators by species:**
- smallmouth: age-0 crayfish from about 50 mm TL, a crayfish-dominated diet above about 150 mm;
- yellow perch and white perch: small crayfish only;
- chain pickerel: few crayfish, mainly insects and fish;
- brown bullhead: scavenged and moulting crayfish (inference).

**Plant grazing.** Model crayfish grazing on macrophytes as a small part of their omnivorous diet, concentrated on soft, fine-leaved SC plants and the DM meadow. It matters only where local crayfish biomass approaches about 100+ g/m², which at Hot Brook means cobble shores next to weed beds. Crayfish also eat snails, fish eggs on nests, and fry in crevices.

**Soft water.** Low Ca slows crayfish moulting. At Hot Brook's assumed 2–5 mg/L, moderate densities with slower growth are plausible.

### Gaps
- No virile-crayfish feeding rate (g food per g crayfish per day) against temperature, and no macrophyte consumption rate per crayfish.
- Stein 1977 (Ecology 58:1237), Chambers et al. 1990/1991 and Hill & Lodge 1994 were seen only as citations. Their quantitative size-selection curves were not read.
- No Maine or New England crayfish predation study (bass, perch or pickerel diet by mass).

## 6. Fish predation effects on littoral invertebrates, the refuge in dense weeds, and invertebrate predators (odonates) on smaller invertebrates and fish larvae

### Takeaway
Fish depress littoral invertebrates, but selectively:
- large, mobile, exposed and predatory taxa (odonates, megalopterans, large chironomids, large thin-shelled snails, *Chaoborus*) fall;
- the mean size of the prey community falls;
- small epiphytic grazers and detritivores (small chironomids, naidids) are often unchanged.

Effect sizes: snail biomass was more than 10× lower with sunfish in enclosures and rose about 4× with fish excluded; non-snail prey fell about 2.5× over a summer under bluegill; chironomids were 3.7–5.1× lower in high-fish ponds. Dense vegetation slows this depletion and raises invertebrate biomass. Fish feeding success collapses at high stem densities, and bluegill grow best at intermediate plant density (about 100 stems/m²).

Odonate larvae (about 100/m² in lentic littorals) eat zooplankton, chironomids and each other. They are themselves suppressed by fish, so fishless lakes have more of them. They take fish larvae only when the larvae are small; quantitative rates on larval fish in north-temperate lakes were not found.

### Cited Findings
**Fish on invertebrates**
- [MI, pond, bluegill at three densities, artificial plants, one year] Plants increased the species richness and density of most macroinvertebrates. Fish predation affected the number of benthic species and some groups (the predatory chironomid *Clinotanypus* responded strongly). Fish had no significant effect on most macrophyte-dwelling invertebrates. (snippet) — [Gilinsky 1984, Ecology 65:455 (AGRIS)](https://agris.fao.org/search/en/records/65df59fe4c5aef494fe1fbc6)
- [EU, pond enclosures] Predatory invertebrate biomass (especially *Sialis*) fell as perch density rose, with or without vegetation. Perch density did not change non-mollusc herbivores and detritivores. Vegetation raised macroinvertebrate biomass and appeared to slow the perch-driven decline of predators. (abstract via AGRIS) — [Diehl 1992](https://agris.fao.org/search/fr/records/65df49ac6eef00c2cea25f71)
- [MI] In vegetated cages, mean invertebrate size decreased as fish density increased. Fish growth tracked the density of large invertebrates remaining. — [Mittelbach 1988 (AGRIS)](https://agris.fao.org/search/en/records/65dfe1d04c5aef494fe62825)
- [MI] Non-snail prey on plants fell about 2.5× from May to August under sunfish foraging (macrophytes note). — [Mittelbach 1981](https://doi.org/10.1139/f81-121)
- [TN] Snail biomass was more than 10× lower in enclosures with sunfish by late summer. — [ETSU record](https://dc.etsu.edu/etsu-works/12215)
- [MI] Snails rose 4× with fish excluded, and dense pumpkinseed held snails at very low levels. — [Osenberg et al. 1992](https://doi.org/10.2307/1938737); [Mittelbach et al. 1999](https://fishlab.ucdavis.edu/wp-content/uploads/sites/397/2020/06/Mittelbach-et-al-1999.pdf)
- [other] Monthly chironomid densities were 3.7–5.1× higher in low-fish than high-fish ponds in May–June (invertebrates note). — [Limnologica 2019](https://www.sciencedirect.com/science/article/pii/S0075951119301197)
- [LA, Atchafalaya, *Hydrilla* exclosures] Bed position and predation structured the macroinvertebrates, and plant architecture mattered little. The taxa most common in fish diets were denser in the bed interior, so beds act as a refuge. (snippet) — [LSU record](https://repository.lsu.edu/agrnr_pubs/443)
- [MN/MI] Bluegill grew best at an intermediate macrophyte density of 111 stems/m² (Crowder & Cooper 1979 ponds, secondhand). In later trials at 100, 250 and 500 stems/m², the densest setting significantly reduced juvenile bluegill foraging success. (snippet) — [MN legislative report](https://www.leg.mn.gov/docs/pre2003/other/920467.pdf); [QUBS threshold study](https://research.qubs.ca/projects/predator-foraging-success-and-habitat-complexity-quantitative-test-of-the-threshold-hypothesis)
- [ON] Littoral fish biomass falls in late summer as fish move offshore (perch/pickerel note). — [Keast et al. 1978 (QUBS)](https://research.qubs.ca/projects/nearshore-fish-habitat-utilization-and-species-associations-in-lake-opinicon-ontario-canada)

**Odonates as predators, and their own predation**
- [global review] Lentic odonates: about 104 ± 55/m², 87 mg/m² and 748 mg m⁻² yr⁻¹. Zygoptera averaged 124/m² and Anisoptera 35/m² (invertebrates note). — [PMC11277287](https://pmc.ncbi.nlm.nih.gov/articles/PMC11277287/)
- [other] In enclosures, odonates at 35–55/m² reduced *Daphnia*, less so in dense macrophytes (invertebrates note). — [J-NABS](https://www.journals.uchicago.edu/doi/10.2307/1468092)
- [ON/SE/MI] Odonates were more abundant around fishless lakes. *Leucorrhinia dubia* occurred only in fishless lakes, and some *Enallagma* only in fish lakes (invertebrates note). — [Hydrobiologia](https://link.springer.com/article/10.1007/BF00027038)
- [EU] *Aeshna viridis* larvae were less susceptible to fish predation on the dense plant *Stratiotes*. Larger *Aeshna* larvae preyed intensely on similar-sized congeners (asymmetric intraguild predation). (snippet) — [Oecologia 2004](https://link.springer.com/article/10.1007/s00442-004-1559-6)
- [MI ponds] *Anax junius* preyed differentially on *Enallagma* damselflies, *E. traviatum* more than *E. aspersum*, in a study with bluegill. (snippet) — [Kentucky bibliography record](https://soc.as.uky.edu/bibcite/reference/3603)
- [EU, microcosm 1989] *Aeshna grandis* larvae preyed on juvenile crayfish (*Astacus*), and mortality was lowest where the young had hiding places. (snippet) — [marineinfo record](https://marineinfo.org/doc/publication/15072)
- [tropical, flagged] *Orthetrum abbotti* nymphs ate catfish and tilapia fry in the lab. About 9% of *Clarias* larval mortality in an earthen pond (Cameroon) was attributed to aquatic insects in general. (snippet) — [IJAB](https://distantreader.org/stacks/journals/ijab/ijab-219.pdf)
- [general, popular source] Odonate nymphs take fish and tadpoles up to about their own length, and their weak jaws often lose larger fish. (snippet) — [TFH Magazine](https://www.tfhmagazine.com/articles/freshwater/tiny-terrors-pond-insects-and-other-invert-invaders)

### Inferences
**Fish predation on the epiphytic field.** Make fish foraging on plant-dwelling prey:
1. **size-selective**: the largest available prey first, so the field needs at least two size classes, small grazers and detritivores and large insects and predators;
2. **refuge-limited**: capture efficiency × 1/(1 + (S/S50)³) with the plants' stems S. The existing S50 is about 150 stems/m² for searching predators; a somewhat higher S50 (about 250) suits small sunfish picking prey off leaves, since they forage inside beds;
3. **seasonally strongest in June–August**, when young-of-year sunfish, perch and shiners crowd the weeds.

Targets that this mechanism should reproduce, not impose:
- large-insect biomass in weeds falls 2–3× from June to August;
- snails are an order of magnitude lower where adult pumpkinseed are dense;
- small chironomids and naidids are roughly unchanged by fish;
- odonate densities are lower in fish lakes;
- bare-bed prey are hit harder than weed-bed prey.

**Consumption scale.** In a weedy littoral, fish production should be supported by an invertebrate production of a few g DW m⁻² yr⁻¹ (§1). With Keast's "not food limiting" summer weedbeds and Mittelbach's density-dependent growth, food limitation should appear when young-of-year densities are high (tens per m² of bed) rather than at average densities. Per-fish rations come from the sim's FB4 bioenergetics; note the existing caution that Keast–Welsh-type field ration estimates run about 50% low (fish–zooplankton note).

**Invertebrate predators.** Add odonate larvae (the existing `ODONATA` nymphs) as consumers on the epiphytic small-prey class and on zooplankton within weeds, at roughly **15–25% of their body mass per day at 20 °C**. This is my arithmetic: a daily specific production of about 0.05/day at 20 °C (from P/B about 8, §1), divided by an *assumed* gross growth efficiency of 20–30%; I found no source for that efficiency. The review's P/B may be inflated, so 10–20% per day is a safer start. Let them prey on fish larvae under about 15 mm only, with a small per-encounter success. Fish predation on odonates, strongest on bare bed and weaker in dense plants, closes the loop.

### Gaps
- No north-temperate measurement of odonate predation on larval fish (rate per nymph per day or share of larval mortality).
- No per-fish consumption rate of plant-dwelling invertebrates (mg per fish per day) from a field study, beyond the bioenergetics models.
- Crowder & Cooper 1982 and Gilinsky 1984 full texts were not read; their numbers come from secondary summaries.
