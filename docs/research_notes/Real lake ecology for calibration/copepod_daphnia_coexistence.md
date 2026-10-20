# Copepod–Daphnia coexistence: thresholds, mechanisms, winter, resting stages (calibration notes)

Compiled 2026-10-19 for Synapse Reef. Problem being fixed: in the sim, *Daphnia* competitively excludes the lumped "copepods" field (≈50 → ≈1 µg DW/L by August, even with fish preferring *Daphnia*), and crustaceans collapse to ≈1–3 µg/L under the ice. Target system: small, shallow (mean ≈3 m), coloured, soft-water (Ca ≈2–4 mg/L nearby), mesotrophic Maine lakes, ice ≈Dec–late Apr.

Companion notes (not repeated here):
- `zooplankton_dynamics.md`: biomass, P/B by taxon (Shuter & Ing), Bělehrádek egg-development coefficients, *Daphnia* thresholds (Boersma & Kreutzer), Cáceres egg bank.
- `fish_zooplankton_coupling.md` §5: fish selectivity and copepod escape.
- `../Hot Brook populations and water/invertebrates_plankton_plants.md` §4: the LakePulse regional composition (lakes ≤250 km of Hot Brook: calanoids 38%, cyclopoids 24%, *Daphnia* 23% of summer crustacean biomass).

Source tags: **[FT]** full text read by me; **[ABS]** abstract only (publisher page or the OpenAlex abstract record); **[FIG]** value read off a published figure by me; **[SEC]** secondary (as cited by another paper); **[INF]** my own arithmetic or inference.

Access notes:
- Blocked, so not read:
  - Wiley/ASLO PDFs (*Limnology & Oceanography*, *Freshwater Biology*): Cloudflare "Just a moment" check.
  - PubMed Central: reCAPTCHA.
  - AWI ePIC: Anubis bot check.
  - McMaster MacSphere: "not authorized".
  - pure.mpg.de and UMich Deep Blue: HTTP 403.
  - int-res.com book pages: HTTP 429.
  - None of these were bypassed.
- Read in full:
  - Kreutzer & Lampert 1999 (scanned course copy, read page by page).
  - Sommer et al. 2003.
  - Hampton et al. 2017 (Helsinki repository copy).
  - Grosbois et al. 2017 (Sci. Rep., open access).
  - Wærvågen & Nilssen 2010.
  - Estlander & Horppila 2023.
  - Cooley 1973 (Dalhousie thesis; the scan has OCR noise).
- No instructions directed at the agent were found in any fetched content.

---

## 1. Food thresholds, maximum growth and metabolism: copepods vs *Daphnia*

### Takeaway
The textbook idea that copepods are "gleaners" with a lower algal threshold than *Daphnia* is only weakly supported by the numbers I could retrieve.

**Calanoids on algae:** zero-growth (population) thresholds are about the same as large *Daphnia*, or slightly higher.
- Calanoid population-increase threshold: 46–79 µg C/L at 17 °C.
- *Daphnia*:
  - equilibrium C\* 40–58 µg C/L at 20 °C;
  - individual C₀ 17–55 µg C/L.

**Cyclopoids on algae alone:** thresholds are 4–10× higher than *Daphnia*'s.
- Naupliar development needs 0.2–0.5 mg C/L.
- They depend on animal prey (rotifers, ciliates).

**Growth:** copepods grow far more slowly. Field P/B at 20 °C:

| Group | P/B (/day) | Relative to herbivorous cladocerans |
|---|---|---|
| Herbivorous cladocerans | ≈0.16 | 1 |
| Cyclopoids | ≈0.10 | ≈0.65× |
| Calanoids | ≈0.04 | ≈0.25× |

So on a single algal resource with equal losses, *Daphnia* should win at every food level. That is exactly what the sim does.

**What lets copepods persist in real lakes:**
- much lower losses (fish capture, background mortality, winter survival);
- a broader and different diet;
- different phenology (sections 2–4).

**Calanoid traits that do favour low-food or low-quality conditions:**
- no feeding threshold down to 1 µg C/L;
- maximum clearance per body volume about 10× that of filter-feeding cladocerans;
- selective feeding that pays off on poor-quality (cyanobacteria-rich) seston.

### Cited Findings

**Daphnia thresholds (the reference values)**
- **Kreutzer & Lampert 1999**, *Ecology* 80:2348–2357, [doi:10.1890/0012-9658(1999)080[2348:ECIDSD]2.0.CO;2](https://doi.org/10.1890/0012-9658(1999)080[2348:ECIDSD]2.0.CO;2) **[FT]** (Table 5, Fig. 2, text).
  - Setup: flow-through equilibria on *Scenedesmus acutus* at 20 °C. The equilibrium food level a population grazes down to (C\*, analogous to Tilman's R\*) is compared with literature C₀ (zero individual growth). All values µg C/L:

    | Species | C\* (this study) | C₀ Gliwicz 1990 | C₀ Achenbach & Lampert 1997 | C₀ Lampert 1994 (uncorrected) |
    |---|---|---|---|---|
    | *D. pulicaria* | 40 ± 2 | 17 (16–20) | 29 (5–32) | 35 |
    | *D. galeata* | 54 ± 4 | 28 (25–32) | 37 (23–46) | 52 |
    | *D. ambigua* | 58 ± 4 | 31 (27–37) | 42 (33–56) | 55 |

  - C\* should exceed C₀ because it includes natural mortality.
  - In mixed culture, *D. galeata* starved once algae fell below its C\* (0.054 mg C/L). *D. pulicaria* held the food at 0.048 ± 0.003 mg C/L and excluded it within about 27 days.
  - "The incipient limiting concentration is ~0.25 mg C/L" (citing Lampert 1987).
- **Sim mapping.** The sim already maps *Daphnia*'s zero growth to ≈0.05–0.1 mg C/L (`config.js` PLANKTON comments; Boersma & Kreutzer 2002 in `zooplankton_dynamics.md`). That is consistent with these values.

**Calanoid copepod thresholds**
- **Hart 1996**, *L&O* 41:648–658, [doi:10.4319/lo.1996.41.4.0648](https://doi.org/10.4319/lo.1996.41.4.0648) **[ABS]**. Species: *Tropodiaptomus spectabilis* and *Metadiaptomus meridianus*, at 17 °C, seven *Cryptomonas* levels from 0.05 to 2.5 mg C/L.
  - Food thresholds (µg C/L), *T. spectabilis* / *M. meridianus*:

    | Process | *T. spectabilis* | *M. meridianus* |
    |---|---|---|
    | Maturation | 11 | 5 |
    | Egg production | 18 | 60 |
    | Population increase | 46 | 79 |

  - Development responses saturated at about 0.35 mg C/L (*M. meridianus*); survival asymptotes at about 0.35–0.5 mg C/L.
  - Naupliar mortality was high: maximum overall survival was 40% in *M. meridianus* vs 90% in *T. spectabilis*.
  - These are African calanoids, the only freshwater calanoid demographic thresholds I could retrieve with numbers. Note the saturation level (≈0.35–0.5 mg C/L) is higher than *Daphnia*'s ILL (≈0.25).
- **Muck & Lampert 1980**, *J. Plankton Res.* 2:367–379, [doi:10.1093/plankt/2.4.367](https://doi.org/10.1093/plankt/2.4.367) **[ABS]**.
  - *Eudiaptomus gracilis* and *Daphnia longispina* were fed down to 1 µg C/L at 7 °C and 19 °C.
  - A feeding threshold (cessation of filtering) was found only once, for *Daphnia* at 19 °C on *Stichococcus*.
  - Neither species stops feeding at very low food. This is not a growth threshold.
- **Lampert & Muck 1985** (*Arch. Hydrobiol. Beih. Ergebn. Limnol.* 21:311–322) and **Muck & Lampert 1984** (*Arch. Hydrobiol. Suppl.* 66:157–179), the classic *Daphnia–Eudiaptomus* comparisons: no abstract or full text was retrievable. A later review cites Lampert & Muck 1985 together with Richman & Dodson 1983 for the point that "food quality may also play an important role in the relative abundance of calanoids versus cladocerans" **[SEC]** (ScienceDirect topic page, Macrocyclops).
- **Richman & Dodson 1983**, *L&O* 28:948–956, [doi:10.4319/lo.1983.28.5.0948](https://doi.org/10.4319/lo.1983.28.5.0948) **[ABS]**.
  - Organisms: *Daphnia pulex* vs *Diaptomus siciloides* in Green Bay water with varying blue-green fractions.
  - Ratios of filtering or ingestion to respiration were higher for *Daphnia* on high-quality food, which the authors read as a *Daphnia* advantage in oligo- and mesotrophic lakes.
  - Ratios were higher for *Diaptomus* on low-quality (cyanobacteria-rich) food, which they read as a copepod advantage in eutrophic lakes.
  - The authors propose a two-dimensional niche model: food quality × food quantity.
- **Hansen, Bjørnsen & Hansen 1997**, *L&O* 42:687–704, [doi:10.4319/lo.1997.42.4.0687](https://doi.org/10.4319/lo.1997.42.4.0687) **[ABS]**.
  - Literature compilation of about 60 species. Maximum specific clearance and ingestion scale with body volume^−0.23.
  - "Calanoid copepods have maximum clearance rates that exceed those of filter-feeding cladocerans … by a factor of 10." A steep initial slope of the functional response is the gleaner trait.
- **Pace 1986**, *L&O* 31:45–55, [doi:10.4319/lo.1986.31.1.0045](https://doi.org/10.4319/lo.1986.31.1.0045) **[ABS]**. Across 12 Quebec sites, cladoceran and cyclopoid abundance and biomass rose with trophic state, but "calanoid copepod abundance and biomass varied independently of lake trophy."
- **Pinto-Coelho et al. 2005**, *CJFAS* 62:348–361, [doi:10.1139/f04-178](https://doi.org/10.1139/f04-178) **[ABS]**. "Cladocerans and cyclopoids were more abundant in eutrophic lakes and reservoirs, whereas calanoids were more abundant in temperate oligotrophic lakes."

**Cyclopoid thresholds: herbivory is costly for them**
- **Santer & van den Bosch 1994**, *J. Plankton Res.* 16:171–195, [doi:10.1093/plankt/16.2.171](https://doi.org/10.1093/plankt/16.2.171) **[ABS]**. *Cyclops vicinus* on a pure algal diet:
  - threshold for naupliar development 0.4 mg C/L;
  - threshold for copepodite development 0.2 mg C/L;
  - continuous egg production only above 0.5 mg C/L;
  - feeding efficiency low, especially in nauplii;
  - summer diapause interpreted as avoiding starvation of the juveniles.
- **Hansen & Santer 1995**, *J. Plankton Res.* 17:631–646, [doi:10.1093/plankt/17.3.631](https://doi.org/10.1093/plankt/17.3.631) **[ABS]**.
  - Naupliar development threshold on *Chlamydomonas reinhardtii*: 0.3 mg C/L (*Mesocyclops leuckarti*) vs 0.5 mg C/L (*C. vicinus*). On *Cryptomonas*: 0.3 mg C/L. On *C. sphaeroides*: below 0.2 mg C/L.
  - *M. leuckarti* needed rotifers (*Brachionus rubens*) to complete copepodite development, and its egg production was low on algae alone.
- **Hopp & Maier 2005**, *Freshwater Biol.* 50:1454–1463, [doi:10.1111/j.1365-2427.2005.01417.x](https://doi.org/10.1111/j.1365-2427.2005.01417.x) **[ABS]**.
  - Flow-through, *C. reinhardtii* at 1×10⁴–4.5×10⁵ cells/mL (≈0.5–22.5 mg C/L).
  - *Cyclops abyssorum* and *C. vicinus* nauplii died at intermediate-to-low and low food respectively.
  - *Acanthocyclops robustus*, *M. leuckarti* and *Thermocyclops crassus* survived at all concentrations.
  - So even ≈0.5 mg C/L was lethal to *C. vicinus* nauplii.
- **Hopp, Maier & Bleher 1997**, *Freshwater Biol.* 38:289–300, [doi:10.1046/j.1365-2427.1997.00214.x](https://doi.org/10.1046/j.1365-2427.1997.00214.x) **[ABS]**.
  - In all 5 cyclopoids, reproduction was lower on pure algae (22.5 mg C/L) than on a mixed natural diet (rotifers, nauplii, large algae).
  - *M. leuckarti* produced no clutches on algae, and unfed females produced no eggs.
  - The authors' conclusion: adults are "primarily omnivorous, but utilize algae which are frequently sufficient for egg production".
- **Adrian & Frost 1993**, *J. Plankton Res.* 15:643–658, [doi:10.1093/plankt/15.6.643](https://doi.org/10.1093/plankt/15.6.643) **[ABS]**. Algae are the key food for the small *Tropocyclops prasinus mexicanus*. Invertebrate prey matter more for the reproduction of *Diacyclops thomasi* and *Mesocyclops edax*.

**Maximum growth and life-history speed**
- **Allan 1976**, *Am. Nat.* 110:165–180, [doi:10.1086/283056](https://doi.org/10.1086/283056) **[ABS]**.
  - Rotifers and cladocerans "attain high rates of increase relative to copepods".
  - Copepods "consume food in a wider range of particle sizes, exhibit a greater capacity for selective feeding, and possess a greater ability in predator avoidance".
  - Opportunism ranks rotifers > cladocerans > copepods.
  - Allan's r_max table was not retrieved.
- **Shuter & Ing 1997** daily P/B equations (in `zooplankton_dynamics.md`), at 20 °C: cladocerans ≈0.16/d, cyclopoids ≈0.105/d, calanoids ≈0.037/d. **[INF]** Ratios to cladocerans: cyclopoids 0.65, calanoids 0.23.
- **Stockwell & Johannsson 1997** (in `zooplankton_dynamics.md`). Their size-based P/B regression matched egg-ratio estimates for cladocerans but ran 4× and 10× too high for two copepods. Copepods produce less per unit biomass than a cladoceran of the same size.
- **Banse 1982**, *MEPS* 9:281–297, [doi:10.3354/meps009281](https://doi.org/10.3354/meps009281) **[ABS]**. A counterpoint: "intrinsic growth rates of pelagic freshwater cladocerans are independent of adult mass and not clearly higher than those of the few pelagic copepods studied." This is laboratory r_max on ample food, not field rates.
- **Bělehrádek egg development** (Johannsson et al. 2000 coefficients, in `zooplankton_dynamics.md`) **[INF]**:

  | Taxon | 4 °C | 20 °C | Implied Q10 over 4–20 °C |
  |---|---|---|---|
  | *Daphnia* | 20.4 d | 2.7 d | ≈3.5 |
  | *Leptodiaptomus minutus* | 22.5 d | 2.8 d | ≈3.7 |

  Copepod development is not intrinsically faster in the cold.
- **Daphnia population growth.** *D. similoides* innate capacity of increase was 0.13–1.01/d from 10 to 35 °C, rising linearly with temperature (Chen et al. 2009, *J. Freshwater Ecol.* 24:545–551, [doi:10.1080/02705060.2009.9664331](https://doi.org/10.1080/02705060.2009.9664331)) **[ABS]**. This is a subtropical species and only an order-of-magnitude check.

**Respiration / mass-specific metabolism**
- **Epp & Lewis 1980**, *Ecology* 61:259–264, [doi:10.2307/1935183](https://doi.org/10.2307/1935183) **[ABS]**.
  - Copepod nauplii: log metabolism vs log weight has slope ≈1, so weight-specific QO₂ is roughly constant with size.
  - Copepodids: slope below 1, so QO₂ declines with size.
  - There is an abrupt QO₂ jump at the nauplius → copepodid transition.
- **Banse 1982** (above): respiration exponents ≈0.75 in all small invertebrate taxa.
- No paired copepod-vs-*Daphnia* respiration numbers at 20 °C were retrievable. Richman & Dodson 1983 measured both, but the PDF was behind Cloudflare.
- **Indirect evidence that copepods spend less at rest:**
  - Lipid stores: *L. minutus* 18% → 76% of dry mass by late January, against 22–33% in *Daphnia* (Grosbois et al. 2017, §3).
  - Starvation survival: *L. minutus* survived 66 days at 4 °C (§3).
  - Arctic copepods: "winter active species [can] have as low metabolic rates as dormant species" (Karlsson & Søreide 2023, *Mar. Biol.* 170, [doi:10.1007/s00227-023-04309-x](https://doi.org/10.1007/s00227-023-04309-x)) **[ABS]**.

### Inferences
- **[INF] Calanoid vs *Daphnia* thresholds.** On algae alone, a calanoid's zero-population-growth threshold is about 1.0–1.5× that of a large *Daphnia* (46–79 vs 40–58 µg C/L). This is not lower, so a pure gleaner–opportunist trade-off on one algal resource is *not* what keeps copepods in lakes.
- **[INF] Cyclopoid thresholds.** For cyclopoids on algae the ratio is 4–10× (0.2–0.5 vs 0.04–0.06 mg C/L). Cyclopoids persist only through animal food and through diapause timed around the *Daphnia* season.
- **[INF] Two separate copepod advantages.** Calanoids win on low *quality* food (selective feeding; Richman & Dodson), and their very high clearance (Hansen et al. 1997) means they lose less than *Daphnia* when food is patchy or dilute. Both are relevant in coloured lakes, where much of the seston is detritus and terrestrial particles.

### Gaps
- Freshwater calanoid (*Eudiaptomus*, *Leptodiaptomus*, *Skistodiaptomus*) ZPG thresholds measured side by side with *Daphnia* (Muck & Lampert 1984; Lampert & Muck 1985) were not retrievable.
- Paired respiration rates (Richman & Dodson 1983) were not retrievable.
- Allan's (1976) r_max table was not retrieved.
- Gliwicz 2003 (*Excellence in Ecology* 12) probably tabulates copepod thresholds, but it was not accessible.

---

## 2. Coexistence mechanisms documented between copepods and *Daphnia*

### Takeaway
Six documented mechanisms, ranked by how much each plausibly matters in a small Maine lake. Ranking is **[INF]**.

1. **Loss-rate asymmetry.**
   - Fish catch 76–96% of cladocerans they attack vs 7–28% of copepods (simulated suction); herring 87% vs 49%.
   - Adult copepods live for months.
   - Overwintering *L. minutus* adults lost only ~9% over November–May in a Nova Scotia lake.
2. **Diet partitioning by size and type.**
   - *Daphnia* clears small algae, bacteria and small protists, with a maximum particle size of ≈22·L(mm) + 5 µm.
   - Copepods take larger algae, 20–60 µm ciliates and rotifers.
   - In mesocosms the two groups suppress *different* algae and compensate for each other.
3. **Omnivory.** Rotifers and ciliates enhance calanoid reproduction. Cyclopoids barely reproduce without animal prey.
4. **Phenology and dormancy.**
   - Cyclopoids skip the *Daphnia* season in sediment diapause: *Cyclops* in summer, *Mesocyclops* over winter.
   - Calanoids breed under the ice and in spring, ahead of *Daphnia*.
5. **Food quality and toxicity.** Selective copepods do better on cyanobacteria-rich seston, but some calanoids are also more toxin-sensitive.
6. **Water colour.** Effects are mixed: the omnivore (copepod) share rises with DOC in Finland, but colour can also favour large *Daphnia* by impairing fish feeding.

*Daphnia* can and does suppress copepods (especially nauplii) when it is abundant and fish are few (Vanni 1986). The sim reproduces that half; it is missing the other five.

### Cited Findings

**Fish predation and escape**
- **Drenner, Strickler & O'Brien 1978**, *JFRBC* 35:1370–1373, [doi:10.1139/f78-215](https://doi.org/10.1139/f78-215) **[ABS]**. Capture probability by a simulated fish suction intake: 0.76–0.96 for cladocerans, 0.07–0.28 for copepods. Gizzard shad feeding tests confirmed that this alone produces apparent selectivity for cladocerans.
- **Drenner, de Noyelles & Kettle 1982**, *L&O* 27:965–968, [doi:10.4319/lo.1982.27.5.0965](https://doi.org/10.4319/lo.1982.27.5.0965) **[ABS]**. In ponds, gizzard shad suppressed nauplii and cyclopoids but *enhanced* *Diaptomus pallidus* copepodids and adults. The community shifted "toward the more evasive prey".
- **Further fish-selectivity numbers** (Link 1996 herring 87% vs 49%; Vinyard 1980 sunfish select *Daphnia* over larger copepods; Hoffman et al. 2001 age-0 perch Ivlev −0.75 for *D. pulicaria* vs +0.50 for copepods at 15–20 mm) are in `fish_zooplankton_coupling.md` §5.

**Daphnia suppresses copepods when fish are few**
- **Vanni 1986**, *L&O* 31:1039–1056, [doi:10.4319/lo.1986.31.5.1039](https://doi.org/10.4319/lo.1986.31.5.1039) **[ABS]**.
  - In enclosures in eutrophic Larimore Pond, introduced *D. pulex* cut phytoplankton by an order of magnitude and "drastically reduced" *Tropocyclops prasinus* and *Mesocyclops edax*.
  - In oligo-mesotrophic Dynamite Lake it reduced *Bosmina*, a rotifer and copepod nauplii.
  - Effects were stronger in eutrophic water, and nutrient addition let small taxa partly escape.
- **Pace & Vaqué 1994**, *L&O* 39:985–996, [doi:10.4319/lo.1994.39.5.0985](https://doi.org/10.4319/lo.1994.39.5.0985) **[ABS]**. Heterotrophic flagellate and ciliate growth was "near zero or negative" when *D. pulex* or *D. galeata* dominated. Rotifer growth was also usually lower. *Daphnia* competes for, and eats, the microbial loop too.

**Food-size partitioning and compensation**
- **Sommer et al. 2003**, *Oecologia* 135:639–647, [doi:10.1007/s00442-003-1214-7](https://doi.org/10.1007/s00442-003-1214-7) **[FT]**.
  - Setup: summer phytoplankton of mesotrophic Schöhsee, under gradients of *D. hyalina×galeata* (0.8–2.4 mm) or copepods. More than 50% of the copepods were *Eudiaptomus gracilis* and *E. gracilioides*; the cyclopoids were *Mesocyclops leuckarti*, *Diacyclops bicuspidatus* and *Thermocyclops*.
  - Total phytoplankton, chlorophyll and primary production barely responded.
  - Copepods "suppressed large phytoplankton, while nanoplanktonic algae increased with increasing copepod density". *Daphnia* "suppressed small algae, while larger species compensated".
  - Eukaryotic algae of 30–3,000 µm³ declined with *Daphnia* and increased with copepods. The 3,600–4,000 µm³ class was a transition zone.
  - For 8 species the responses had opposite signs.
  - Gelatinous colonial algae were fostered by both groups.
  - *Daphnia* invaded the copepod mesocosms after about 10 days.
  - The authors propose a four-link cascade: copepods → ciliates → heterotrophic nanoflagellates → *Synechococcus*.
- **Zöllner et al. 2003**, *Freshwater Biol.* 48:2174–2193, [doi:10.1046/j.1365-2426.2003.01158.x](https://doi.org/10.1046/j.1365-2426.2003.01158.x) **[ABS]**.
  - Copepods selectively suppressed medium (20–40 µm) oligotrich ciliates, and nanoflagellates then increased.
  - *Daphnia* reduced ciliates of all sizes and nanoflagellates directly.
  - Bacterial activity fell with *Daphnia* and rose with copepods.
- **Lu & Weisse 2022**, *Sci. Rep.* 12:10501, [doi:10.1038/s41598-022-14301-y](https://doi.org/10.1038/s41598-022-14301-y) **[ABS]**. Clearance of freshwater cladocerans *decreases* with ciliate size, while that of freshwater copepods *increases* with ciliate size. This is a size-based split of the ciliate resource.
- **Burns 1968**, *L&O* 13:675–678, [doi:10.4319/lo.1968.13.4.0675](https://doi.org/10.4319/lo.1968.13.4.0675) **[ABS]**. Largest bead ingested (µm) = 22 × carapace length (mm) + 4.87. **[INF]** That is ≈27 µm for a 1-mm *Daphnia* and ≈49 µm for a 2-mm one.
- **Geller & Müller 1981**, *Oecologia* 49:316–321, [doi:10.1007/BF00347591](https://doi.org/10.1007/BF00347591). Title only (cladoceran filter mesh sizes and food selectivity); numbers not retrieved.

**Omnivory: rotifers and ciliates as copepod food**
- **Williamson & Butler 1986**, *L&O* 31:393–402, [doi:10.4319/lo.1986.31.2.0393](https://doi.org/10.4319/lo.1986.31.2.0393) **[ABS]**. The small calanoid *Diaptomus* (*Skistodiaptomus*) *pallidus* cleared rotifers 5.5–6.2× faster than algae at the same concentration. Adding rotifers to a "threshold algal diet" substantially enhanced survival and reproduction.
- **Burns & Gilbert 1993**, *Freshwater Biol.* 30:377–393, [doi:10.1111/j.1365-2427.1993.tb00822.x](https://doi.org/10.1111/j.1365-2427.1993.tb00822.x) **[ABS]**.
  - In a mesotrophic lake in summer, *Epischura lacustris*, *Diaptomus minutus* (= *Leptodiaptomus minutus*, the dominant calanoid near Hot Brook) and *D. pygmaeus* efficiently removed oligotrich ciliates, especially *Strobilidium velox* (about 43 µm).
  - Ciliates "contributed substantially to the diet of female *D. minutus*".
  - About 1.6 adult *Epischura*/L, or 16 adult female *Diaptomus*/L, could halt *S. velox* population growth.
  - Predation saturated at 5 *S. velox*/mL (45 ng C/mL ≈ 45 µg C/L) and did not change with a 10-fold increase in algal food.
- **Cyclopoid omnivory:** Hopp et al. 1997; Hansen & Santer 1995; Adrian & Frost 1993 (all above).
- **Copepod predation on Daphnia** (intraguild): Gliwicz & Stibor 1993, *Oecologia* 95:295, "Egg predation by copepods in *Daphnia* brood cavities", [doi:10.1007/BF00323503](https://doi.org/10.1007/BF00323503). Title only.

**Phenology and diapause as a temporal niche** (details in §3–4)
- **Santer & Lampert 1995**, *J. Anim. Ecol.* 64:600–613, [doi:10.2307/5803](https://doi.org/10.2307/5803) **[ABS]**.
  - Three *Cyclops* species spend summer as fourth-instar copepodites (C-IV) in anoxic sediment.
  - Lake water from late spring and early summer, when cladocerans dominated, "did not support naupliar growth". Nauplii of two species died before reaching C1.
  - Water from late winter (Feb/Mar) supported quick development, and spring/summer water supplemented with flagellates gave nearly optimal development.
  - Conclusion: summer diapause avoids a food bottleneck for nauplii created by cladoceran grazing.
- **Hopp & Maier 2005** (above). *Cyclops* species grow in spring and diapause in summer, while *Acanthocyclops*, *Mesocyclops* and *Thermocyclops* grow in summer "when they face poorer food conditions and more competition from Cladocera". Their nauplii tolerate low food.
- **Santer & Hansen 2006**, *Hydrobiologia* 560:217–226, [doi:10.1007/s10750-005-1067-7](https://doi.org/10.1007/s10750-005-1067-7) **[ABS]**.
  - In eutrophic Lake Søbygård, *C. vicinus* occurs in both sediment and open water all year.
  - About 30% entered diapause in darkness, and pure algal food raised direct development.
  - Diapause there is a "risk-spreading strategy modified by food".

**Food quality and toxicity**
- **Richman & Dodson 1983** (§1): copepods are favoured on cyanobacteria-rich seston.
- **DeMott, Zhang & Carmichael 1991**, *L&O* 36:1346, [doi:10.4319/lo.1991.36.7.1346](https://doi.org/10.4319/lo.1991.36.7.1346) **[ABS]**. *Diaptomus birgei* was the *most* sensitive to microcystin-LR (48-h LC50 0.45–1.00 µg/mL) vs *D. pulicaria* 21.4 µg/mL. Survival with toxic *Microcystis* depended on both sensitivity and feeding behaviour (copepods avoid it).

**Water colour (DOC) and soft water**
- **Estlander & Horppila 2023**, *Hydrobiologia* 850:4015–4027, [doi:10.1007/s10750-023-05284-6](https://doi.org/10.1007/s10750-023-05284-6) **[FT]**.
  - 27 Finnish lakes; DOC 2.9–36.9 mg/L, TP 5–61 µg/L.
  - Total zooplankton biomass (1–790 µg C/L) was unrelated to DOC.
  - The herbivore biomass share fell and the omnivore share ("copepods") rose with DOC (R² = 0.24).
  - Diversity fell, and some herbivorous taxa were absent above about 20 mg/L DOC.
  - Common crustaceans: *Mesocyclops leuckarti* (25 lakes), *Bosmina longirostris* (22), *Eudiaptomus*.
- **Berggren et al. 2014**, *Ecology* 95:1947–1959, [doi:10.1890/13-0615.1](https://doi.org/10.1890/13-0615.1) **[ABS]**. Across 18 Quebec lakes, mean allochthony was Cladocera 0.31, Cyclopoida 0.18, Calanoida 0.16. The "microbial-loop / terrestrial-carbon" path feeds cladocerans at least as much as copepods (cladocerans eat bacteria and detritus directly; calanoids select algae).
- **Poste et al. 2019** (brown-water boreal lake), *Sci. Total Environ.* 674:9–18, [doi:10.1016/j.scitotenv.2019.03.446](https://doi.org/10.1016/j.scitotenv.2019.03.446) **[ABS]**. Dietary reliance on phytoplankton was "highest in the selective-feeding calanoid copepods, and lowest in filter feeding cladocerans".
- **Wissel, Boeing & Ramcharan 2003**, *L&O* 48:1965–1976, [doi:10.4319/lo.2003.48.5.1965](https://doi.org/10.4319/lo.2003.48.5.1965) **[ABS]**. A contrary effect: in highly coloured water *Chaoborus* was more abundant and zooplankton shifted from *Bosmina* and small copepods to large *Daphnia* and *Holopedium*. Colour impairs fish foraging.
- **Weyhenmeyer et al. 2019**, *Sci. Rep.* 9:10450, [doi:10.1038/s41598-019-46838-w](https://doi.org/10.1038/s41598-019-46838-w) **[ABS]**. 1.5 mg Ca/L is "a threshold considered critical for the survival of many Ca-demanding organisms" (*Daphnia*); 20.7% of global samples are at or below it. Lakes near Hot Brook measure 2.1–4.0 mg/L (`recent_maine_research.md`): low, but above that line.

**Theory**
- **Yamamichi & Letten 2022**, *J. Anim. Ecol.* 91:2163–2170, [doi:10.1111/1365-2656.13813](https://doi.org/10.1111/1365-2656.13813) **[ABS]**.
  - Gleaner–opportunist coexistence on one fluctuating resource needs the gleaner to grow faster at low resource and the opportunist faster at high resource.
  - It is *stable* only if the opportunist dampens fluctuations (more linear functional response) while the gleaner amplifies them (more saturating response): relative nonlinearity, the Armstrong–McGehee mechanism.
  - Fluctuations must be present: seasons, the clear-water-phase crash.

### Inferences
- **[INF] The sim's current trade-off.**
  - The copepod half-saturation (K_C = 0.2) is *higher* than *Daphnia*'s (K_D = 0.15), and G_C/G_D = 0.5. Copepods are therefore worse at both low and high food: there is no gleaner–opportunist crossover at all.
  - With the sim's R and M, the zero-growth food (A\* = K·L/(G−L), L = R + M) is A\*_D = 0.034 and A\*_C = 0.061 algae units, a ratio of 1.8.
  - Fish preference for *Daphnia* only flips the outcome once fish remove about 0.18/day of *Daphnia* (with copepods at 0.3× that), which is unrealistically intense all summer.
- **[INF] Most defensible fixes.** Lower copepod *losses* (fish, background, winter), plus a copepod-only food channel (rotifers and large ciliates or algae), rather than simply a lower algal threshold (see Implications).

---

## 3. Winter: under-ice crustacean composition and biomass

### Takeaway
Across 36 stations (Hampton et al. 2017), crustacean density under ice averages about 25% of summer: 27.8 vs 110 ind/L. Composition shifts toward copepods.

**[FIG] Crustacean composition by density (Hampton Fig. 3):**

| Season | Calanoids | Cyclopoids | *Daphnia* | Other cladocerans | Copepods total |
|---|---|---|---|---|---|
| Winter | 28% | 52% | 14% | 6% | ≈80% |
| Summer | 20% | 43% | 19% | 17% | ≈63% |

**[INF] Densities implied by those means:**

| Group | Winter (ind/L) | Summer (ind/L) | Winter as share of summer |
|---|---|---|---|
| Copepods | ≈22 | ≈70 | ≈32% |
| *Daphnia* | ≈4 | ≈21 | ≈19% |
| Other cladocerans | — | — | ≈9% |

**In small boreal lakes like Hot Brook (Simoncouche, Bluff Lake):**
- *Leptodiaptomus minutus* overwinters as active adults with huge lipid stores (up to 76% of dry mass) and breeds under the ice from February.
- *Cyclops scutifer* overwinters active as C-IV.
- *Mesocyclops edax* leaves the water column (November–May) for sediment diapause.
- *Daphnia* persists at low density, stops egg production in late winter and resumes near ice-out.
- Adult *L. minutus* winter mortality is close to zero in the field: about 9% over November–May in Bluff Lake.

### Cited Findings
- **Hampton et al. 2017**, *Ecol. Lett.* 20:98–111, [doi:10.1111/ele.12699](https://doi.org/10.1111/ele.12699) **[FT]** (Helsinki repository copy).
  - Density counts crustaceans only (*Daphnia*, other cladocerans, cyclopoids, calanoids); rotifers were excluded from the density analysis. 36 stations.
  - Mean winter density 27.8 ± 11.2 ind/L vs summer 110 ± 30.8 ind/L (P < 0.001). The mixed-model (LME) fit gives a typical summer value of 54.8 ind/L and a winter difference of −41.8 ± 5.8 (Table 1).
  - Winter composition differed (PERMANOVA P = 0.05), "with cladocerans generally more abundant in summer". The Fig. 3 proportions are my read-off **[FIG]** (table above).
  - Zooplankton was lower in winter at 10 of 11 long-series sites; the exception was Trout Bog, WI.
  - "Several copepod species in high-latitude lakes of Europe and Canada have been shown to reach peak density in mid-winter … undergoing diapause during summer" (citing Rigler et al. 1974; Rautio et al. 2000).
  - Lipids in a Finnish lake's zooplankton fell from over 60% in early winter to about 20% in late winter (citing Syväranta & Rautio 2010).
- **Grosbois, Mariash, Schneider & Rautio 2017**, *Sci. Rep.* 7:11543, [doi:10.1038/s41598-017-10956-0](https://doi.org/10.1038/s41598-017-10956-0) **[FT]**.
  - Lake Simoncouche, QC: 83 ha, mean depth 2.2 m, max 8 m; DOC peaks at 6.6 mg C/L in September; ice from November to late April or early May.
  - Annual mean densities and shares of crustacean abundance:

    | Taxon | Annual mean (ind/L) | Share |
    |---|---|---|
    | *L. minutus* | 12.9 ± 4.9 | 58% |
    | *Daphnia* spp. | 4.9 ± 2.8 | 22% |
    | *C. scutifer* | 3.3 ± 1.7 | 15% |
    | *M. edax* | 1.0 ± 1.1 | 5% |

  - *L. minutus* adults overwinter in the water column. *C. scutifer* was entirely C-IV from November to April. *M. edax* was absent from the water column from November to May.
  - *Daphnia*: relatively abundant until 12 December, low until mid-May. Overwintering females carried parthenogenetic young in late January.
  - Lipid as % of dry weight:

    | Taxon | Range | Peak |
    |---|---|---|
    | *L. minutus* | 18% (mid-Sep) → 76% (late Jan) | 76% |
    | *C. scutifer* | 21% (May) → 50% (Jan) | 50% |
    | *M. edax* | 28 ± 9% | 47% (May) |
    | *Daphnia* | 22 ± 5% | 33% (Feb) |

  - Starvation experiment: adult *L. minutus*, 4 °C, dark, 164 days, 6 × 50 per treatment.
    - Starved and fed animals survived equally for 66 days.
    - Starved survivors then crashed from 32 ± 6 to 3 ± 2 between days 66 and 73.
    - On day 163, survivors out of 50: 0.2 ± 0.4 starved vs 21 ± 7 fed. **[INF]** The fed group lost ≈0.5%/day in the lab.
  - Phytoplankton fatty acids were highly available (2.6 µg/L) in the first month under ice, and copepods stored them.
- **Boulianne, Kivilä, Beisner & Rautio 2025**, *J. Plankton Res.* 47(5):fbaf035, [doi:10.1093/plankt/fbaf035](https://doi.org/10.1093/plankt/fbaf035) **[FT, text only; values are in figures]**.
  - Lake Simoncouche, winter 2020–21: 5 depths, 6 dates from autumn to spring overturn. TP is given as 7.2 µg/L (labelled dissolved).
  - Surface water was 1.3 °C in early winter and 4.8 °C during melt; the deepest layer stayed at 4–5 °C.
  - Biomass shares over the study period, total zooplankton including rotifers: *L. minutus* 35%, *C. scutifer* 15%, *Kellicottia* 12%, *Daphnia* 11%, *Bosmina* 8%. **[INF]** Copepods are ≈72% of crustacean biomass.
  - *Mesocyclops edax*, *Diaphanosoma*, *Holopedium* and *Leptodora* were absent all winter; the authors say they make up more than 15% of summer crustacean production.
  - *Epischura lacustris* was abundant in early winter and gone by mid-winter (resting eggs).
  - Egg-bearing: *L. minutus* 28% during melt and 44% at spring overturn.
  - *Daphnia*: ephippia on 27% of females in autumn and 13% in early winter; egg-bearing was 0 in late winter, ≈6% just before ice-off and 21% at spring overturn.
  - Nauplii were ≈34% of community biomass during melt. Copepod and cladoceran biomass were at their minimum during melt, then rose sharply by overturn.
  - Biomass at 7 m was about 3× that at 0–1.5 m.
- **Cooley 1973**, PhD thesis, Dalhousie University, "The life history, population dynamics and production of *Leptodiaptomus minutus* … in Bluff Lake, Nova Scotia" ([DalSpace PDF](https://dal.scholaris.ca/bitstreams/d31c02fa-f1b3-48a8-9d4e-e535267c2dbe/download)) **[FT, OCR-degraded scan]**.
  - Bluff Lake: 4.8 ha, oligotrophic, about 75% of the lake shallower than 4 m and unstratified. It is about 600 km from Hot Brook, in the same Acadian region.
  - The overwintering population was "almost entirely adults".
  - They began producing subitaneous eggs in February, which hatched in March. That first generation developed slowly and matured from mid-August; a second, mostly unsuccessful generation followed in September.
  - From mid-October all eggs were diapausing eggs.
  - Smoothed adult numbers (Appendix, "Cor" column; units ×10²–10³/m², the exponent is illegible): 580 on 15 November 1970, 580 through February, 560 in March, 540–550 in April, 530 in mid-May, 490 on 4 June, ≈20 by 17 August. **[INF]** That is ≈9% loss over November → mid-May, ≈0.0005/day; the overwintered adults then die off in June–August.
  - Mortality was highest from May to October, attributed to predation by *Epischura nordenskioldi* and *Mesocyclops edax*.
- **Kers et al. 2024**, *J. Plankton Res.* 46:323–337, [doi:10.1093/plankt/fbae018](https://doi.org/10.1093/plankt/fbae018) **[ABS]**.
  - Subarctic Lake Kilpisjärvi.
  - *C. scutifer* overwintered as C-IV to C-V. *Eudiaptomus graciloides* *reproduced under ice*.
  - Lipids fell over winter: *E. graciloides* 60% → 38% of dry weight, *C. scutifer* 73% → 33%.
  - The omnivore *C. scutifer* kept accumulating lipids until January. The herbivorous *E. graciloides* accumulated lipid from *under-ice* primary production late in winter.
- **Wærvågen & Nilssen 2010**, *J. Limnol.* 69:311–332, [doi:10.4081/jlimnol.2010.311](https://doi.org/10.4081/jlimnol.2010.311) **[FT]**.
  - Oligotrophic boreal Lake Gjerstadvann, Norway.
  - *E. gracilis* (3 generations/yr) overwintered as C-V and adults in the plankton. There was no reproduction after the adults matured in September–October; reproduction resumed after ice-break. The 3rd generation was about 14% of the winter population. Up to 40% of females carried eggs in May and early August.
  - *C. scutifer* (1 generation/yr) overwintered as late copepodites under the ice: "active diapause", delayed development in profundal water.
  - *Mesocyclops leuckarti* entered diapause from early October as C-V (some C-IV) in *littoral* sediment, for about 7 months. Densities in sediment exceeded 25×10³/m² in one winter and were below 10×10³/m² in others.
  - *Thermocyclops oithonoides* diapaused as C-V in *profundal* sediment for about 5 months, at below 5×10³ to above 250×10³/m².
- **Daphnia overwintering:**
  - **Cáceres 1998** (`zooplankton_dynamics.md`): 0–2.5 ind/L overwintering in Oneida Lake.
  - **Hampton, Romare & Seiler 2006**, *J. Plankton Res.* 28:399–406, [doi:10.1093/plankt/fbi125](https://doi.org/10.1093/plankt/fbi125) **[ABS]**. In Lake Washington, winter abundance of *D. pulicaria* (with spring conditions) predicted the date of its spring increase, indicating "greater reliance on pelagic population dynamics (versus diapause hatch)" than *D. thorata*.
  - **Larsson & Wathne 2006**, *Arch. Hydrobiol.* 167:265–280, [doi:10.1127/0003-9136/2006/0167-0265](https://doi.org/10.1127/0003-9136/2006/0167-0265) **[ABS]**. In an alpine pond, about 10% of *D. umbra* females carried ephippia in October; the rest stored lipid and overwintered active, but "very few winter-active daphnids had survived until the ice melted".
  - **Ślusarczyk 2009**, *Freshwater Biol.* 54:2252–2262, [doi:10.1111/j.1365-2427.2009.02256.x](https://doi.org/10.1111/j.1365-2427.2009.02256.x) **[ABS]**. In a fishless alpine lake, one *D. pulicaria*-like lineage lived 13–14 months on lipid reserves, active all winter, while another overwintered only as ephippia.
- **Cyclopoid winter predation:** cyclopoids may prey on other zooplankton under ice (Hampton et al. 2017, citing Ventura & Catalan 2008).

### Inferences
- **[INF] Winter targets for a Hot Brook-like lake** (from the Hampton ratios, the Simoncouche shares, and the ≈50 µg/L summer stock in `invertebrates_plankton_plants.md`):
  - Under-ice crustacean biomass ≈10–20 µg DW/L, i.e. 20–40% of summer, rather than 1–3. Biomass should hold up better than numbers, because the winter stock is lipid-rich adults and late copepodites, not nauplii.
  - Copepods should be ≥70–80% of that biomass.
  - *Daphnia* should be ≈1–3 µg/L (≈0.3–3 ind/L).
- **[INF] Winter active share.**
  - Of a Maine-like copepod assemblage (LakePulse ≤250 km: *L. minutus* 28%, *M. edax* 19%, other calanoids about 9%, *C. scutifer* 2%, other cyclopoids, all as % of total crustacean biomass), about 60–70% of copepod biomass overwinters *active*: *Leptodiaptomus*, *Skistodiaptomus*, *Cyclops scutifer*, *Diacyclops*.
  - About 30–40% overwinters *dormant*: *Mesocyclops edax* as C-IV/C-V in sediment (October–May) and *Epischura* as resting eggs.
  - Active overwinterers lose only ≈0.05–0.5%/day.

### Gaps
- No Maine or New England small-lake under-ice crustacean biomass series was found; Mirror Lake NH winter data were not retrieved.
- The Boulianne 2025 biomass values are only in figures.
- *Diacyclops thomasi* winter densities in small lakes were not found.

---

## 4. Resting stages: *Daphnia* ephippia and copepod diapause

### Takeaway
**Daphnia egg banks:**
- They are large (10⁴–10⁵ eggs/m²), but only about 1% hatch per year (0–25 neonates/m²/yr).
- Hatching happens only in the first ≈9 weeks after ice-out.
- Even 0.25 cm of sediment cover can completely block it.
- Spring *Daphnia* comes mainly from overwintering females; ephippia are a backstop after collapse or freeze-out.
- Ephippia are made by about 13–27% of females in autumn and early winter.

**Calanoids** (*L. minutus*, *S. oregonensis*):
- They switch to diapausing eggs in October and build egg banks of about 10⁵ eggs/m² per cm of sediment (Oneida).
- Eggs hatch in March–April alongside eggs of the overwintering females.
- In Bluff Lake the fall's diapausing eggs were ≈8–17% as many as the spring subitaneous eggs, so the active adults carry the population.
- Most of one fall's diapausing eggs hatch the next spring **[INF]**, and some survive ≥2 years.

**Cyclopoids** diapause as copepodites (C-IV/C-V), not eggs:
- *Cyclops* species in summer.
- *Mesocyclops* and *Thermocyclops* in winter.
- Emergence is seasonal and tracks plankton peaks closely (short-lived stages).

### Cited Findings
- **Cáceres 1998**, *Ecology* 79:1699–1710 (details in `zooplankton_dynamics.md` §Q3) **[FT earlier]**.
  - Oneida Lake bank: more than 2.5×10⁴ (*D. g. mendotae*) and 8×10⁴ (*D. pulicaria*) eggs/m².
  - Emergence 0–25 /m²/yr, about 1% of the bank, only in early spring, ceasing by 9 weeks after ice-out.
  - About 15% of adult females carry ephippia at the peak of sexual reproduction.
- **Radzikowski, Sikora & Ślusarczyk 2016**, *J. Limnol.*, [doi:10.4081/jlimnol.2016.1345](https://doi.org/10.4081/jlimnol.2016.1345) **[ABS]**.
  - The annual hatch from lake *Daphnia* egg banks "is usually extremely low (from zero to a few dozens animals per square meter per year)".
  - In the lab, "even the thinnest tested layer (0.25 cm)" of sediment "may completely inhibit hatching".
- **Radzikowski et al.** (hatching cues, in `zooplankton_dynamics.md`): ephippia from deep lakes hatch 7–37% when incubated, best at 6–9 °C under long days. That is the potential of exposed eggs, not the field rate.
- **Hairston & Van Brunt 1994**, *Hydrobiologia* 292/293:209–218, [doi:10.1007/BF00229943](https://doi.org/10.1007/BF00229943) **[ABS]**.
  - *Skistodiaptomus oregonensis* and *L. minutus* in Oneida Lake switch from subitaneous to diapausing eggs in October. Large lakes switch later than small lakes, and ponds earlier still.
  - The sediment holds about 10⁵ diapausing eggs/m² per cm, down to 5 cm, densest under the deepest water.
  - *L. minutus* eggs survived at least 2 years, and the population recovered after a year with no new diapausing eggs. Survival over decades is "probable".
- **Hairston, Hansen & Schaffner 2000**, *Freshwater Biol.* 45:133–145, [doi:10.1046/j.1365-2427.2000.00386.x](https://doi.org/10.1046/j.1365-2427.2000.00386.x) **[ABS]**.
  - Oneida Lake emergence traps, May–August.
  - Three cladocerans and three calanoids emerged "predominantly" in spring.
  - Three cyclopoids had distinct seasonal emergence periods matching their plankton peaks.
  - The authors find variable dependence on emergence for long-lived diapausing eggs (rotifers, cladocerans, calanoids) and "much closer dependence" for short-lived diapausing immature stages (cyclopoids).
- **Cooley 1973** (Bluff Lake, §3) **[FT, OCR]**.
  - Diapausing eggs deposited by *L. minutus*: 376 (fall 1970) and 452 (fall 1971), in ×10²–10³/m².
  - Subitaneous eggs laid by overwintering adults: 4,384 (1971) and 2,280 (1972), in the same units. **[INF]** So diapausing eggs equal ≈9–17% of the spring subitaneous eggs; sediment traps suggested the true diapausing-egg number may be about half that.
  - Diapausing eggs hatched in March, alongside the subitaneous eggs.
  - Lab experiments (Table 13, Fig. 8), *L. minutus* diapausing eggs collected 28 Oct–4 Nov:
    - At least ≈1 month must pass before any egg hatches, even if moved to warmer water sooner.
    - Hatching came sooner and in greater numbers at a moderate ≈14 °C than at 4 or 8 °C, *but* eggs held at 14 °C never hatched without a prior cold (4 °C) treatment.
    - In the dark at 8 °C, hatching began after 6 months.
    - Light sped hatching at 4 °C.
    - So the eggs need a winter chill, then hatch in spring warmth.
  - Cooley's view: "production of diapausing eggs does not appear to be absolutely necessary for the continuation of the species".
  - **[INF]** In 1972 the first-cohort N1 (2,633) exceeded the subitaneous eggs (2,279) by ≈354, against 452 diapausing eggs laid the previous fall. That implies ≈60–80% of one fall's diapausing eggs hatched the next spring. This is a noisy inference.
- **Copepod egg-hatching temperature (coastal Baltic, marine; different system):** hatching of overwintering copepod eggs had a threshold-like onset between 6 and 9 °C; nauplii appeared above 6.8 °C. Svahn, Hall & Hylander 2025, *Marine Ecology* 46, [doi:10.1111/maec.70012](https://doi.org/10.1111/maec.70012) **[ABS]**.
- **Chen & Folt 1996**, *L&O* 41:1077–1086, [doi:10.4319/lo.1996.41.5.1077](https://doi.org/10.4319/lo.1996.41.5.1077) **[ABS]**. In a New Hampshire-region lake:
  - *Epischura lacustris* overwinters as resting eggs, which fall warming above 15 °C could hatch prematurely (a lost cohort).
  - Fall warming could switch *Daphnia catawba* from sexual (ephippial) back to asexual reproduction.
  - Chen & Folt 2002, *J. Plankton Res.* 24:579–589 ([doi:10.1093/plankt/24.6.579](https://doi.org/10.1093/plankt/24.6.579)) **[ABS]**: *E. lacustris* has a lower temperature tolerance than *D. catawba*, which explains its earlier (spring and fall) phenology.
- **Cyclopoid diapause:** Santer & Lampert 1995 (C-IV in summer, anoxic sediment); Wærvågen & Nilssen 2010 (*Mesocyclops* C-V in littoral sediment from early October, ≈7 months); Grosbois et al. 2017 (*M. edax* absent November–May) (all above).
- **Adrian, Wilhelm & Gerten 2006**, *Global Change Biol.* 12:652–661, [doi:10.1111/j.1365-2486.2006.01125.x](https://doi.org/10.1111/j.1365-2486.2006.01125.x) **[ABS]**. In Müggelsee, *Daphnia* and diatoms advanced about 1 month with warming. Copepods, with longer, complex life cycles, responded species-specifically, depending on whether warming matched their thermal requirements at "emergence from diapause".

### Inferences
- **[INF] Ephippia.** Hatching should be ≈1% of the *Daphnia* egg bank per year, confined to roughly ice-out + 9 weeks at about 6–9 °C under lengthening days. Only the surface ≈0.25 cm of the bank is hatchable.
- **[INF] Calanoid resting eggs.** They should be a minor recruitment path, ≈10–15% of spring nauplii, mostly from last autumn's eggs (a large share hatching each March–April at ≈4–6 °C), with a slowly decaying older bank.
- **[INF] Cyclopoid "resting stage".** It is the animal itself: C-IV/C-V copepodites, with mass conserved apart from slow respiration. It is not a lossy conversion into eggs.

### Gaps
- No field emergence fraction per year for copepod egg banks was retrieved; the Hairston et al. 2000 numbers were not accessible.
- Cyclopoid emergence densities (/m²) were not found apart from the Gjerstadvann sediment densities.

---

## 5. Copepod share of crustacean biomass and its seasonal pattern

### Takeaway
In small north-temperate soft-water lakes, copepods are about half to two-thirds of summer crustacean biomass and 70–80% under ice. The seasonal pattern:
- **Winter:** copepods dominate.
- **Ice-out and spring:** a copepod (nauplius) pulse from under-ice and early-spring breeding.
- **Late May–June:** a *Daphnia* peak (the clear-water phase), when the copepod share dips.
- **July–August:** copepods (*Mesocyclops*, calanoids) and small cladocerans; *Daphnia* falls under young-of-year fish.
- **Autumn:** a modest crustacean recovery, then calanoids switch to resting eggs (mid-October), *Mesocyclops* enters sediment (early October), and *Daphnia* make ephippia.

### Cited Findings
- **LakePulse regional summer data** (my earlier analysis, `invertebrates_plankton_plants.md` §4) **[INF]**:

  | Lake set | Calanoid share | Cyclopoid share | Copepods | *Daphnia* |
  |---|---|---|---|---|
  | ≤250 km of Hot Brook | 38% | 24% | 62% | 23% |
  | Atlantic Maritime | 34% | 14% | 48% | 38% |
  | Boreal Shield | 24% | 20% | 44% | 45% |

- **Makarewicz & Likens 1979**, *Ecol. Monogr.* 49:109–127, [doi:10.2307/1942575](https://doi.org/10.2307/1942575) **[ABS]**. Mirror Lake, NH (oligotrophic): copepods were 55.4% of total zooplankton biomass but only 19.3% of production ("slow growth over an entire year"); rotifers produced 39.8%.
- **Grosbois et al. 2017** (§3): Simoncouche annual crustacean abundance is 78% copepods, 22% *Daphnia*.
- **Hampton et al. 2017** (§3) **[FIG]**: copepods are ≈63% of summer and ≈80% of winter crustacean density across 36 stations.
- **Culver et al. 1985** and **Shchapov & Ozersky 2023** (in `zooplankton_dynamics.md`): cladocerans dominate in summer; copepods dominate in spring, fall and winter (Lake Erie, Lake Superior).
- **Cooley 1973** (§3): in Bluff Lake, *L. minutus* breeds "intensely late in winter under ice or early in spring". Summer egg production is "quite low" and may rise again in autumn. Cooley says this is consistent across the species' range.
- **Pace 1986** and **Pinto-Coelho et al. 2005** (§1): calanoids are relatively most important in oligo- and mesotrophic lakes; cladocerans and cyclopoids rise with trophic state.
- **Sommer et al. 1986 PEG model and Sommer et al. 2012** (`zooplankton_dynamics.md` §Q3): spring herbivore build-up, the clear-water phase, the *Daphnia* crash, a summer mix of small grazers, an autumn peak, and cyclopoids emerging from diapause to form overwintering populations.

### Inferences
**[INF] Seasonal target table for the sim.** Rows are calendar periods; values are crustacean biomass in µg DW/L, rough.

| Period | Total crustaceans | Copepod share | *Daphnia* |
|---|---|---|---|
| Jan–Mar (ice) | 10–20 | 70–80%; *L. minutus* adults egg-bearing from Feb | 0.5–3 |
| Ice-out–mid-May | 15–40 | 60–80%; nauplii boom, cyclopoids rising | starts growing above ≈8–10 °C |
| Late May–June | 40–100 | 30–45% | peak, clear-water phase |
| Jul–Aug | 30–60 | 50–70% (*Mesocyclops*, calanoids) | 5–15, YOY-fish-limited |
| Sep–Oct | 30–60 | 50–65% | autumn recovery, ephippia |
| Nov (pre-ice) | 15–30 | 65–80% | — |

---

## Implications for the simulation (recommended values)

All ratios are copepods relative to *Daphnia*, for the lumped `zooC` field, read against `config.js` PLANKTON (per real day at 20 °C, ×Q10). They are evidence-weighted **[INF]**; uncertainty is noted.

### Why the current set excludes copepods
- G_C = 0.3 (0.5×), K_C = 0.2 (1.33×), R_C + M_C = 0.07 (0.64×).
- That gives A\*_C = 0.061 vs A\*_D = 0.034 algae units: a **1.8× higher threshold *and* a lower maximum**, so there is no trade-off.
- Winter makes it worse. At 2 °C the copepod losses are (R + M)·2^−1.8 ≈ 0.020/day, against almost no growth on under-ice algae: **[INF]** ≈8% survive 140 days of ice.
- `DORM_C` 0.015/day from October to the solstice puts ≈65% of copepods into "resting eggs" at EGG_EFF 0.3. This destroys ≈45% of the autumn stock and parks the rest as eggs, leaving **[INF]** ≈3% active at ice-out. That reproduces the observed 1–3 µg/L collapse.

### Recommended parameters

| Quantity | Recommendation | Evidence |
|---|---|---|
| **Algal zero-growth threshold**, copepods ÷ *Daphnia* (no fish) | **≈1.0–1.3×** (not 1.8×). For example G_C 0.27, R_C 0.04, M_C 0.012, K_C ≈ 0.15 → A\*_C ≈ 0.036 vs A\*_D 0.034 (1.06×) | Calanoid population threshold 46–79 vs *Daphnia* C\* 40–58 µg C/L (Hart 1996; Kreutzer & Lampert 1999); calanoid clearance 10× (Hansen et al. 1997). Cyclopoids on algae alone would be 4–10×, but they are omnivores (next row) |
| **Copepod-only food** | Let copepods eat **rotifers (`env.zooR`)**: route part of the existing `M2_R` loss (the sim already attributes it to "cyclopoid copepods, Chaoborus, Asplanchna") into copepod growth at ≈0.3–0.5 assimilation. Give copepods access to a **large-cell algal share** (most diatoms and large colonies that *Daphnia* (<≈30–50 µm) cannot take), and optionally a ciliate proxy. Target: animal prey ≈20–40% of copepod summer ration **[INF, not measured]** | Rotifer clearance 5.5–6.2× algae, survival and reproduction "substantially enhanced" (Williamson & Butler 1986); ciliates "substantial" in *L. minutus* diet (Burns & Gilbert 1993); cyclopoid reproduction needs animal food (Hopp et al. 1997; Hansen & Santer 1995); size partitioning (Sommer et al. 2003; Zöllner et al. 2003; Lu & Weisse 2022; Burns 1968) |
| **Maximum growth** G_C ÷ G_D | **0.4–0.5×** (keep G_C 0.25–0.30) | Field P/B: calanoid 0.23×, cyclopoid 0.65× of cladocerans (Shuter & Ing); regional mix (38% calanoid : 24% cyclopoid) → ≈0.39× |
| **Maintenance** R_C ÷ R_D at 20 °C | **≈0.5×** (R_C ≈ 0.04) | Weak: lipid storage and starvation endurance (Grosbois 2017; Kers 2024). No paired respiration data retrieved |
| **Background mortality** M_C ÷ M_D, open water | **≈0.3–0.5×** (M_C ≈ 0.01–0.015) | Adult copepods live months, overwintered *L. minutus* adults to the next summer (Cooley 1973); predation is ≈2/3–3/4 of adult copepod mortality in the sea (Hirst & Kiørboe 2002, *MEPS* 230:195, [doi:10.3354/meps230195](https://doi.org/10.3354/meps230195), [ABS]). *Daphnia* adult lifespan of weeks at 20 °C is general knowledge, not sourced here. The ratio is **[INF]** |
| **Fish capture** per strike, copepods ÷ *Daphnia* | **≈0.2–0.5** (`COPE_ESCAPE` 0.5 → **0.6–0.7** for a calanoid-heavy mix) | 0.07–0.28 vs 0.76–0.96 (Drenner et al. 1978); herring 49% vs 87% (Link 1996) |
| **Winter losses of active copepods** at 1–4 °C | Total **≈0.001–0.005/day** (≈50–90% survive Nov→Apr). E.g. Q10 for copepod maintenance ≈3.5 instead of `Q10_L` 2, or an explicit "lipid-fuelled" winter state with M_C ≈ 0.001/day | Bluff Lake adults 580 → 530 (Nov → mid-May, ≈0.0005/day; Cooley 1973); fed lab survival 42% over 163 days at 4 °C (Grosbois 2017) |
| **Winter active share** of copepods | **≈65–70% of autumn copepod biomass stays active** (calanoid adults and C-V, *Cyclops*/*Diacyclops* C-IV) | Grosbois 2017; Boulianne 2025; Wærvågen & Nilssen 2010; LakePulse taxa shares |
| **Copepod dormancy** | **≈30–35% dormant as copepodites** (*Mesocyclops*: enter early Oct at ≤≈12 °C on shortening days; emerge May–June when bottom water >≈10–12 °C), with mass conserved minus slow respiration (`EGG_EFF`-equivalent ≈0.8–0.9, not 0.3). `DORM_C` should apply only to this fraction | *M. edax* absent Nov–May (Grosbois 2017); *Mesocyclops* C-V in littoral sediment ≈7 months from early Oct (Wærvågen & Nilssen 2010) |
| **Calanoid resting eggs** | Switch mid-Oct. Small mass, eggs ≈10–15% of next spring's nauplii. ≈50–80% of last fall's eggs hatch Mar–Apr at ≈4–6 °C; the older bank decays slowly (eggs survive ≥2 yr) | Cooley 1973; Hairston & Van Brunt 1994; Hairston et al. 2000 |
| **Under-ice reproduction** | Allow copepod egg production from about Feb at 1–4 °C, fuelled partly by stored reserves; ≈30–45% of females egg-bearing by melt and overturn. *Daphnia* egg production ≈0 in late winter (keep `DAPH_T`), ≈6% before ice-off, ≈20% at overturn | Cooley 1973; Boulianne 2025; Kers 2024 |
| ***Daphnia* winter** | Overwintering females ≈0.5–3 ind/L (≈1–3 µg/L), ≈15–20% of summer density | Cáceres 1998; Hampton 2017 **[FIG/INF]**; Simoncouche |
| **Ephippia** | Production ≈13–27% of females carrying ephippia in autumn and early winter. **Hatching ≈1% of the bank per year**, only in ≈9 weeks after ice-out at ≈6–9 °C (`HATCH_D` ≈0.0002/day over that window, vs the current 0.005/day ≈ 25–30%/yr). Hatchable fraction = top ≈0.25 cm | Cáceres 1998; Radzikowski et al. 2016; Boulianne 2025 |
| **Temperature dependence of growth** | Keep Q10 ≈3 for both groups; copepods are *not* faster in the cold. Their cold advantage is low losses, reserves and adult stage structure | Egg development Q10 ≈3.5 (*Daphnia*) vs ≈3.7 (*L. minutus*), 4–20 °C (Bělehrádek coefficients) |

**Check on the proposed set [INF].**
- **No fish:** thresholds are about equal (1.06×) and *Daphnia* grows 2× faster, so *Daphnia* wins the spring bloom (clear-water phase), as in fishless or early-season lakes.
- **Summer fish:** with fish adding mortality F_D to *Daphnia* and 0.3·F_D to copepods, the copepod threshold drops below *Daphnia*'s once F_D ≳ 0.02/day. That is a realistic summer rate (YOY perch can eat more than 100% of *Daphnia* production; Mills & Forney 1983). So copepods should win July–August and *Daphnia* should rebound in autumn as fish predation eases, which is the PEG sequence. Add the rotifer and large-cell food and copepods persist even in years with few fish.
- **Winter:** about 65–70% active × 50–90% survival ≈ **35–60% of the autumn copepod stock active at ice-out** (vs ≈3% now), plus about 30% emerging from sediment in May–June. That gives the ≈10–20 µg/L under-ice target.

### Validation targets (multi-seed, per `balance.mjs` practice)
- Summer copepod share of crustacean biomass: 50–65%.
- Under-ice crustaceans: 20–40% of the summer mean, ≥70% copepods.
- *Daphnia* spring peak in late May–June, then a decline under YOY fish.
- *Daphnia* winter: 0.5–3 ind/L.
- Copepod nauplius pulse March–May.

---

## Sources list (DOIs)
- Kreutzer & Lampert 1999, Ecology 80:2348: [doi](https://doi.org/10.1890/0012-9658(1999)080[2348:ECIDSD]2.0.CO;2) (read via the UNH course copy, cfb.unh.edu/ZoopEco)
- Hart 1996 L&O: [10.4319/lo.1996.41.4.0648](https://doi.org/10.4319/lo.1996.41.4.0648)
- Muck & Lampert 1980 JPR: [10.1093/plankt/2.4.367](https://doi.org/10.1093/plankt/2.4.367)
- Richman & Dodson 1983 L&O: [10.4319/lo.1983.28.5.0948](https://doi.org/10.4319/lo.1983.28.5.0948)
- Hansen, Bjørnsen & Hansen 1997 L&O: [10.4319/lo.1997.42.4.0687](https://doi.org/10.4319/lo.1997.42.4.0687)
- Santer & van den Bosch 1994 JPR: [10.1093/plankt/16.2.171](https://doi.org/10.1093/plankt/16.2.171)
- Hansen & Santer 1995 JPR: [10.1093/plankt/17.3.631](https://doi.org/10.1093/plankt/17.3.631)
- Hopp & Maier 2005 FWB: [10.1111/j.1365-2427.2005.01417.x](https://doi.org/10.1111/j.1365-2427.2005.01417.x)
- Hopp, Maier & Bleher 1997 FWB: [10.1046/j.1365-2427.1997.00214.x](https://doi.org/10.1046/j.1365-2427.1997.00214.x)
- Adrian & Frost 1993 JPR: [10.1093/plankt/15.6.643](https://doi.org/10.1093/plankt/15.6.643)
- Santer & Lampert 1995 J Anim Ecol: [10.2307/5803](https://doi.org/10.2307/5803)
- Santer & Hansen 2006 Hydrobiologia: [10.1007/s10750-005-1067-7](https://doi.org/10.1007/s10750-005-1067-7)
- Allan 1976 Am Nat: [10.1086/283056](https://doi.org/10.1086/283056)
- Banse 1982 MEPS: [10.3354/meps009281](https://doi.org/10.3354/meps009281)
- Epp & Lewis 1980 Ecology: [10.2307/1935183](https://doi.org/10.2307/1935183)
- Pace 1986 L&O: [10.4319/lo.1986.31.1.0045](https://doi.org/10.4319/lo.1986.31.1.0045)
- Pinto-Coelho et al. 2005 CJFAS: [10.1139/f04-178](https://doi.org/10.1139/f04-178)
- Drenner et al. 1978 JFRBC: [10.1139/f78-215](https://doi.org/10.1139/f78-215)
- Drenner et al. 1982 L&O: [10.4319/lo.1982.27.5.0965](https://doi.org/10.4319/lo.1982.27.5.0965)
- Vanni 1986 L&O: [10.4319/lo.1986.31.5.1039](https://doi.org/10.4319/lo.1986.31.5.1039)
- Pace & Vaqué 1994 L&O: [10.4319/lo.1994.39.5.0985](https://doi.org/10.4319/lo.1994.39.5.0985)
- Sommer et al. 2003 Oecologia: [10.1007/s00442-003-1214-7](https://doi.org/10.1007/s00442-003-1214-7)
- Zöllner et al. 2003 FWB: [10.1046/j.1365-2426.2003.01158.x](https://doi.org/10.1046/j.1365-2426.2003.01158.x)
- Lu & Weisse 2022 Sci Rep: [10.1038/s41598-022-14301-y](https://doi.org/10.1038/s41598-022-14301-y)
- Burns 1968 L&O: [10.4319/lo.1968.13.4.0675](https://doi.org/10.4319/lo.1968.13.4.0675)
- Williamson & Butler 1986 L&O: [10.4319/lo.1986.31.2.0393](https://doi.org/10.4319/lo.1986.31.2.0393)
- Burns & Gilbert 1993 FWB: [10.1111/j.1365-2427.1993.tb00822.x](https://doi.org/10.1111/j.1365-2427.1993.tb00822.x)
- DeMott, Zhang & Carmichael 1991 L&O: [10.4319/lo.1991.36.7.1346](https://doi.org/10.4319/lo.1991.36.7.1346)
- Estlander & Horppila 2023 Hydrobiologia: [10.1007/s10750-023-05284-6](https://doi.org/10.1007/s10750-023-05284-6)
- Berggren et al. 2014 Ecology: [10.1890/13-0615.1](https://doi.org/10.1890/13-0615.1)
- Wissel et al. 2003 L&O: [10.4319/lo.2003.48.5.1965](https://doi.org/10.4319/lo.2003.48.5.1965)
- Weyhenmeyer et al. 2019 Sci Rep: [10.1038/s41598-019-46838-w](https://doi.org/10.1038/s41598-019-46838-w)
- Yamamichi & Letten 2022 J Anim Ecol: [10.1111/1365-2656.13813](https://doi.org/10.1111/1365-2656.13813)
- Hampton et al. 2017 Ecol Lett: [10.1111/ele.12699](https://doi.org/10.1111/ele.12699) (full text: [Helda repository](https://helda.helsinki.fi/server/api/core/bitstreams/48cfb0e1-9991-4f2a-8f1c-e8cbfc193fc8/content))
- Grosbois et al. 2017 Sci Rep: [10.1038/s41598-017-10956-0](https://doi.org/10.1038/s41598-017-10956-0)
- Boulianne et al. 2025 JPR: [10.1093/plankt/fbaf035](https://doi.org/10.1093/plankt/fbaf035)
- Kers et al. 2024 JPR: [10.1093/plankt/fbae018](https://doi.org/10.1093/plankt/fbae018)
- Wærvågen & Nilssen 2010 J Limnol: [10.4081/jlimnol.2010.311](https://doi.org/10.4081/jlimnol.2010.311)
- Cooley 1973 thesis (Dalhousie): [DalSpace](https://dal.scholaris.ca/bitstreams/d31c02fa-f1b3-48a8-9d4e-e535267c2dbe/download)
- Hampton, Romare & Seiler 2006 JPR: [10.1093/plankt/fbi125](https://doi.org/10.1093/plankt/fbi125)
- Larsson & Wathne 2006 Arch Hydrobiol: [10.1127/0003-9136/2006/0167-0265](https://doi.org/10.1127/0003-9136/2006/0167-0265)
- Ślusarczyk 2009 FWB: [10.1111/j.1365-2427.2009.02256.x](https://doi.org/10.1111/j.1365-2427.2009.02256.x)
- Radzikowski, Sikora & Ślusarczyk 2016 J Limnol: [10.4081/jlimnol.2016.1345](https://doi.org/10.4081/jlimnol.2016.1345)
- Hairston & Van Brunt 1994 Hydrobiologia: [10.1007/BF00229943](https://doi.org/10.1007/BF00229943)
- Hairston, Hansen & Schaffner 2000 FWB: [10.1046/j.1365-2427.2000.00386.x](https://doi.org/10.1046/j.1365-2427.2000.00386.x)
- Chen & Folt 1996 L&O: [10.4319/lo.1996.41.5.1077](https://doi.org/10.4319/lo.1996.41.5.1077)
- Chen & Folt 2002 JPR (the bibliographic index lists only C. Y. Chen): [10.1093/plankt/24.6.579](https://doi.org/10.1093/plankt/24.6.579)
- Adrian, Wilhelm & Gerten 2006 GCB: [10.1111/j.1365-2486.2006.01125.x](https://doi.org/10.1111/j.1365-2486.2006.01125.x)
- Makarewicz & Likens 1979 Ecol Monogr: [10.2307/1942575](https://doi.org/10.2307/1942575)
- Gillooly 2000 JPR (generation time vs size and temperature; abstract only, no numbers): [10.1093/plankt/22.2.241](https://doi.org/10.1093/plankt/22.2.241)
- Moore, Folt & Stemberger 1996 Arch Hydrobiol (warm water favours small forms): [10.1127/archiv-hydrobiol/135/1996/289](https://doi.org/10.1127/archiv-hydrobiol/135/1996/289)
