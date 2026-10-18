# Predator winter energetics: smallmouth bass, chain pickerel (via pike) and young brown bullhead through fall and winter

Calibration target: the sim's Fish Bioenergetics 4.0 (FB4) runs for Upper and Lower Hot Brook Lake (2.5–5.5 m deep, iced about Dec 1 – Apr 23, 208 days below 10 °C). In a simulated year, smallmouth bass, chain pickerel and young brown bullhead starve over fall and winter. These notes collect field and lab values to diagnose why, and to set targets.

Searched 2026-10-18.

**Source tags:**
- **[primary]:** full text read.
- **[primary abstract]:** the author's abstract, read from the publisher, Crossref or Europe PMC.
- **[via X]:** a value quoted by a secondary source; the primary was not read.
- **[snippet]:** seen only in a search-result summary.
- **[popular]:** a magazine or agency page with no primary citation.
- **(derived):** my own calculation, from the FB4 rows or from the numbers here. The scripts used FB4's equations exactly; prey energy is 4,184 J/g unless stated, and 13,560 J per g O₂.

**Units:** mg O₂ kg⁻¹ h⁻¹ for metabolic rate. To convert to FB4's g O₂ g⁻¹ d⁻¹, multiply by 24/10⁶. 10 mg O₂ kg⁻¹ h⁻¹ = 3.25 J g⁻¹ d⁻¹.

**Sources skipped.** Several sources returned 403, sat behind a sign-in redirect, or showed a bot check, and were skipped rather than worked around: Wiley (Shuter et al. 1989; Brownscombe 2024 abstract page), ResearchGate, cdnsciencepub, Springer, the MDIFW pickerel plan PDF, fisheries.org, and IIASA (an Anubis bot check). Where a legitimate open copy existed, I used that instead: Zenodo for Brownscombe et al. 2024, and the Carleton and Harkness lab PDFs.

**Related notes, not repeated here:**
- [centrarchid_percid_esocid_parameters.md](../Maine%20lakes%20ponds%20and%20streams/centrarchid_percid_esocid_parameters.md):
  - the FB4 rows (Q1);
  - the Shuter et al. 1980 young-of-year (YOY) survival thresholds as applied at Spednic Lake (Q4);
  - winter activity: perch and pickerel active, smallmouth inactive below about 10 °C (Q6).
- [perch_pickerel_smallmouth_pumpkinseed.md](../Seasonal%20fish%20habitat%20use/perch_pickerel_smallmouth_pumpkinseed.md): wintering sites and depths; Maine ice-fishing catch rates.
- [largemouth_bass.md](../Real%20lake%20ecology%20for%20calibration/largemouth_bass.md): first-winter loss of YOY largemouth; Wright et al. 1999.
- [northern_pike.md](../Real%20lake%20ecology%20for%20calibration/northern_pike.md): Diana 1979; the esocid model's overestimate.

---

## 0. What the sim's current FB4 sets do in the cold (derived)

### Respiration at 2–6 °C (mg O₂ kg⁻¹ h⁻¹)

Values are FB4 R with the set's own routine activity term; the bottom row is my recommended curve (see "For the sim").

| Set (sim use) | T | 5 g | 30 g | 127 g | 500 g | 1 kg |
|---|---|---|---|---|---|---|
| Whitledge et al. 2003 smallmouth (bass ≥ 30 g) | 2 °C | 633 | 163 | 55 | 19 | 12 |
|  | 4 °C | 734 | 189 | 64 | 23 | 13 |
|  | 6 °C | 849 | 219 | 74 | 26 | 15 |
| Rice et al. 1983 largemouth (bass < 30 g, YOY bullhead) | 2 °C | 213 | 113 | 68 | 42 | 33 |
|  | 4 °C | 227 | 120 | 72 | 44 | 35 |
|  | 6 °C | 242 | 128 | 77 | 47 | 37 |
| Bevelhimer et al. 1985 pike (pickerel) | 4 °C | 116 | 84 | 65 | 51 | 45 |
| Hartman et al. 2017 brown bullhead (adult bullhead) | 4 °C | 41 | 25 | 17 | 12 | 10 |
| *Recommended winter curve* (§ For the sim) | 4 °C | 51 | 36 | 27 | 20 | 18 |

### The three structural problems

1. **Whitledge respiration was measured only at 18–30 °C** (Whitledge et al. 2002, 2003, Missouri fish, as described by Brownscombe et al. 2024 [primary]).
   - Everything below 18 °C is extrapolation.
   - Its mass exponent RB = −0.756 is about three times steeper than typical (−0.15 to −0.3).
   - So the per-gram winter cost of a 127-g bass is 2.8× that of a 500-g bass, and a 5-g fish's is about 30×.
   - A search snippet says the set is recommended for fish over 50 g [snippet].
   - Its temperature dependence below 12 °C is ordinary: Q10 over 2–12 °C ≈ 2.0 (derived). The problem is the size scaling, not the temperature curve.
2. **The Rice largemouth set has almost no temperature dependence.**
   - Its RQ is 0.0313, so Q10 = e^0.313 = **1.37** (derived from the FB4 row).
   - At 4 °C, a 5-g fish on this set respires at 227 mg O₂ kg⁻¹ h⁻¹: 5.5× the brown bullhead's own FB4 set, and about 5–7× the field-consistent values below.
   - Fasting over a 208-day Hot Brook winter, that fish would burn energy equal to 370% of its body mass at 4,184 J/g (derived).
   - **Any fish on this set in winter (small bass, young bullhead) must starve.** This is the most direct cause of the YOY bullhead and small-bass winter die-off.
3. **Maintenance on the pike set at 1–4 °C needs 72–77% of Cmax** (derived; the sim quotes about 65%, probably because its prey energy is higher).
   - Lab tests show this esocid model overestimates winter consumption needs 2–4× (Chipps et al. 2000; § Q4).

### Cmax ratios (Whitledge set)
- Cmax at 4 °C is 3.7% of the 22 °C peak.
- Respiration at 4 °C is 31% of its 22 °C value; Q10 over 4–22 °C ≈ 1.9 (derived).
- The low cold Cmax is realistic: smallmouth stop feeding near 10 °C (§ Q1). The cold respiration is what is wrong.

---

## Q1. Adult smallmouth bass (20–40 cm) in northern lakes

### Takeaway
- **Over winter, adults lose roughly half of their stored lipid,** about 15–25% of body energy and about 5–15% of body mass. They live mostly on reserves laid down in a fall feeding peak.
  - **No adult smallmouth mass-loss study was found.** The figures above are assembled from:
    - fall-versus-spring lipid in Lake Opeongo males;
    - a biologger study of wild largemouth in an Ontario lake that holds the same prey community as Hot Brook (perch, pumpkinseed, bullhead, golden shiner, white sucker).
- **Resting metabolic rate (RMR) at 2–6 °C:**
  - **Two measurements, 2.5× apart:**
    - the only smallmouth respirometry near the cold end, a swim tunnel at 6 °C, extrapolates to a high RMR of about 72 mg O₂ kg⁻¹ h⁻¹ for a 1-kg fish;
    - largemouth tunnel data give 29 at 5 °C.
  - **Field energy budgets** (lipid loss, mass loss, survival) are only consistent with about **15–30 mg O₂ kg⁻¹ h⁻¹** for 0.5–1 kg adults.
  - **Thermal sensitivity in the cold is passive:** Q10 ≈ 1.5–2.2.
- **No true metabolic depression beyond Q10.** Winter savings come from:
  - inactivity;
  - choosing cold water;
  - lowered RMR when fasting (30–75% lower in largemouth).
- **Feeding:**
  - Lake Opeongo bass forage actively at 10–15 °C in fall.
  - Feeding declines from about 15 °C and **stops at about 10 °C**.
  - Stomachs are mostly empty from late fall through winter.
  - Maine ice anglers catch bass at about a quarter of the open-water rate.

### Cited Findings

**Fall fattening and winter lipid depletion: Lake Opeongo, ON (45°42′N)** [primary] — [Mackereth, Noakes & Ridgway 1999, Environ. Biol. Fishes 56:263–275](https://www.harkness.ca/PDFs/Contributions%201990s/makereth%20et%20al%201999.pdf)
- **Fish:** 153 males, 21–39 cm fork length, in three size classes.
- **Sampling:**
  - spring, 7–25 May (after fish moved inshore);
  - during parental care;
  - fall, 21 Sep – 1 Oct; 1991–92.
- **Fall vs. spring lipid:**
  - Fall muscle lipid (% of dry weight) was about **1.5×** the spring level.
  - Fall visceral lipid was **more than 2×** the spring level.
  - In fall about **50%** of lipid energy sat in the viscera, against 25–30% in spring.
- **Interpretation:** the authors identify two depletion periods, winter (the large fall-to-spring drop) and parental care. Reserves were not rebuilt before nesting.
- **Parental care:** the energy index (lipid kcal / FL³) fell 45.5% in large males, 30.4% in medium and 17.0% in small males from the embryo to the juvenile period.
- **Inference (derived):** combining muscle ×1.5 with the viscera's share rising from about 27% to 50%, total lipid energy in late September is about **2.0–2.3×** the May value. So roughly **50–55% of fall lipid is spent between October and May.** Absolute lipid percentages are in the figures only.

**Fall is the season of fastest energy gain** [primary] — [Suski & Ridgway 2009, J. Zool.](https://www.harkness.ca/PDFs/Contributions%202000s/Suski%20and%20Ridgway%20J%20Zoology%202009.pdf)
- During fall cooling, Opeongo bass go from about 6 m in early October to a mean of 12 m in November, with 5–7 m daily depth ranges. They are still active.
- **Fall is the annual peak in energy gain** as fish build lipid (citing Mackereth et al. 1999).
- Deeper use may let them forage at **10–15 °C**, the operating range also seen in spring warming (Ridgway, Shuter & Post 1991).
- The winter that follows is one of relatively little feeding (citing Keast 1968).
- Under ice, bass at below 2 °C still showed daily depth ranges over 1.5 m early in winter, shrinking later. The authors call them quiescent, not dormant.

**Winter temperatures bass choose: Smoke Lake, Algonquin Park, ON** [primary thesis] — [Jones 2025, MSc, U. Windsor](https://uwindsor.scholaris.ca/bitstreams/8e7d977d-f1bc-49d8-af42-6b4e8195b546/download)
- 13 adults, 315–482 mm and 494–1,838 g, tracked over three winters.
- **Temperatures experienced:**
  - 2.34 ± 0.20 °C at 9.0 ± 6.6 m in 2021–22;
  - 2.26 ± 0.36 °C at 14.9 ± 6.9 m in 2022–23;
  - 1.84 ± 0.24 °C at 7.8 ± 5.0 m in 2023–24, the short-ice year. In that year bass stayed colder than they needed to.
- Activity was low but not zero. Oxygen stayed above 6 mg/L.
- He notes that no lab study has held centrarchids at the 1.5 °C his fish experienced. Smallmouth have never been tested below 4 °C.

**Smallmouth respirometry: the only cold data point** [primary, open copy] — [Brownscombe, Smith & Bzonek 2024, J. Fish Biol. 105:254–264](https://doi.org/10.1111/jfb.15774); open copy on [Zenodo](https://zenodo.org/records/17004619)
- **Fish and test:** Ontario smallmouth of 0.67–2.05 kg (383–525 mm), swim tunnel at 6, 12, 18 and 24 °C (n = 10, 10, 11, 8).
- **Measured MO₂ across all swim speeds:**

  | Temperature | MO₂ mean ± SD (range), mg O₂ kg⁻¹ h⁻¹ |
  |---|---|
  | 6 °C | 85 ± 14 (61–102) |
  | 12 °C | 159 ± 23 |
  | 18 °C | 219 ± 38 |
  | 24 °C | 242 ± 41 |

- **Critical swimming speed (Ucrit):** 58 cm/s at 6 °C, 93 cm/s at 24 °C.
- **RMR model** (MO₂ at zero swimming speed): ln RMR = 4.04 − 0.15·ln(mass, kg) + 0.04·T.
  - For a 1-kg fish (derived): **61 at 2 °C, 67 at 4 °C, 72 at 6 °C, 78 at 8 °C**.
  - Q10 = e^0.4 = 1.49.
  - The fish swam at 40 cm/s or more, so this is an extrapolation. The authors caution that tunnel estimates may be raised by stress.
- **Peaks:** maximum metabolic rate peaked at 22 °C and aerobic scope (AS) at 20 °C. AS was over 90% of maximum at 17–24 °C and over 50% at 11–28 °C, and falls to **zero at 3 °C** (extrapolated).
- They expect smallmouth to be largely dormant below 5 °C, with very little scope left for activity or digestion.
- **On the FB4 set:** its metabolism component comes from small fish at 18–30 °C (Whitledge 2002, 2003).

**Largemouth RMR at winter temperatures** [primary] — [Reeve et al. 2024, Comp. Biochem. Physiol. A 297:111708](https://www.fecpl.ca/wp-content/uploads/2024/07/1-s2.0-S1095643324001351-main.pdf)
- 17 Ontario largemouth, 345–565 mm and 454–2,010 g (mean 837 g); swim tunnel at 5, 10 and 15 °C.
- **Per-kg rates** (the text-extracted table was scrambled; values were assigned by matching the reported Q10s — derived):

  | Temperature | RMR (n) | MMR (n) |
  |---|---|---|
  | 5 °C | **29.0 ± 5.4** (7) | 48.4 ± 8.5 (7) |
  | 10 °C | 38.9 ± 5.6 (14) | 79.8 ± 6.3 (16) |
  | 15 °C | 53.0 ± 9.0 (10) | 129.6 ± 5.0 (11) |

- **Q10:**
  - RMR: **1.78** (5–10 °C), 1.82 (5–15 °C), 1.86 (10–15 °C), i.e. partial thermal compensation.
  - MMR: 2.62–2.64.
  - AS: 5.84 below 10 °C.
- Five fish refused to swim at 5 °C.
- **Lemons & Crawshaw 1985** (measured 3–17 °C in 2 °C steps, 18–120 g fish) gave RMR about **half** these values after mass correction [via Reeve et al. 2024]. That is about **15 mg O₂ kg⁻¹ h⁻¹ at 5 °C for 1 kg**.
- Existing bioenergetics practice assumes **zero activity cost below 10 °C** (Trebitz 1991; Wright et al. 1999) [via Reeve et al. 2024].

**Free-swimming largemouth over winter: Warner Lake, ON** (44°31′N, 18.2 ha, maximum 7 m) [primary] — [Reeve, LaRochelle, Bihun, Brownscombe & Cooke 2025, CJFAS 82:1–16](https://www.fecpl.ca/wp-content/uploads/2024/11/Winter-behaviour-and-energetics-of-free-swimming-largemouth-bass.pdf)
- **Community:** the lake holds yellow perch, pumpkinseed, **brown bullhead, golden shiner and white sucker**, essentially Hot Brook's prey set.
- **Tags:** 63 adults of at least 300 mm, with accelerometer or heart-rate loggers, 2020–23.
- **Mass change:**
  - 825 ± 174 g at release (mean 11 Nov) and 788 ± 146 g at recapture (mean 8 Jun).
  - Overall mean change **−3.56 ± 1.35%**, range −18% to +15%.
  - Fish released in fall and recaptured in spring: **−5.3 ± 1.8%** (−18.3% to +7.6%).
- **Winter conditions, Dec–Mar:**
  - water **4.1–5.7 °C**;
  - accelerometer-based MO₂ **25.7–33.2 mg O₂ kg⁻¹ h⁻¹**;
  - heart-rate-based MO₂ 32–68;
  - heart rate 4–26 bpm;
  - speed 0.31–0.37 body lengths per second (BL/s), against 0.89 in September;
  - inactive only about 0.2–3% of the time;
  - late-winter dissolved oxygen fell to 2.1–3.4 mg/L.
- **Digestion:** 110 h for a meal at 5 °C (Molnár & Tölg 1962) [via].
- **Consumption needed to explain the mass change** over the period below 10 °C (prey 4,000 J/g):

  | Model | p | g fish/day |
  |---|---|---|
  | Original Rice set | 0.62 ± 0.04 | 1.9 |
  | Updated set | 0.53 ± 0.02 | 1.7 |
  | Biologger-informed | 0.37 ± 0.04 | 1.1 |

  - That is **0.13–0.23% of body weight a day**, or **18.8–28.7% of prewinter body mass eaten over about 150 days** (derived).
- **Fasting simulations** (p = 0 below 10 °C) predicted larger losses than were observed (observed 8.9 ± 1.9% for these 11 fish):

  | Model | Predicted mass loss |
  |---|---|
  | Original Rice set | 27.9 ± 2.8% |
  | Updated set | 18.8 ± 2.4% |
  | Biologger-informed | 15.9 ± 3.3% |
  | Biologger-informed, with a 30% fasting cut in metabolic rate | 11.9 ± 2.5% |

- **Conclusion:** most largemouth feed a little all winter, and some fast through it. Smaller and leaner fish ate proportionally more.
- **Why a 30% cut:** the authors cite 38% lower RMR on maintenance rations (Ranney et al. 2023) and 75% lower when fasted versus ad libitum (Gingerich et al. 2010).
- **Wright et al. 1999** found the original model overestimated winter costs by **more than 20%** [via Reeve et al. 2025]. The older note gives about 16% for age-0 fish.
- **Updated largemouth respiration parameters** (Table 1):

  | Parameter | Updated | Rice original |
  |---|---|---|
  | RA | 0.0035 | 0.008352 |
  | RB | −0.292 (not significant; −0.355 kept) | −0.355 |
  | RQ | 0.0529 (Q10 1.70) | 0.0313 |
  | RTO | 0.0217 per cm/s | 0.0196 |
  | Swim speed U | 1.4343·W^0.3162·e^(0.069·T) cm/s, for T ≤ RTL = 20 °C | — |
  | RK1 | 5.7058 | — |

  - At 825 g and 5 °C the speed equation gives **0.45 BL/s and R ≈ 25 mg O₂ kg⁻¹ h⁻¹** (derived), matching the field values.

**Heart rate of winter-quiescent largemouth at 3 °C** [primary] — [Cooke, Grant, Schreer, Philipp & DeVries 2003, Comp. Biochem. Physiol. A 134:157–165](https://www3.carleton.ca/fecpl/pdfs/CBP%20Winter%20Quiescence%20MS.pdf)
- Fish of about 611 g, acclimated to natural winter conditions at 3 ± 1 °C.
- **Basal values:** heart rate **7.6 ± 0.3 bpm** (about 50% of the winter-active white bass) and cardiac output 9.0 ± 0.7 ml min⁻¹ kg⁻¹.
- Largemouth are sluggish below 8 °C and stop feeding in the lab (Johnson & Charlton 1960) and in the field (Keast 1968; Sullivan 1985) [via].

**No metabolic depression beyond Q10:**
- **Reeve, Rowsey & Speers-Roesch 2022** [primary] — [J. Exp. Biol. 225:jeb243407](https://pmc.ncbi.nlm.nih.gov/articles/PMC9124485/)
  - Pumpkinseed, mummichog and eel were cooled to about 2.5 °C and held 4–6 weeks.
  - Standard metabolic rate (SMR) Q10 stayed below 3.5, i.e. passive.
  - Pumpkinseed were minimally active at 7.9 °C or below and fasted at 4.0 °C or below, but never became fully inactive.
  - Earlier high Q10s (pumpkinseed 6.0, Roberts 1964) were confounded by activity.
  - Crawshaw's largemouth and bullhead work gave Q10 ≈ 2–3, i.e. dormancy as inactivity at SMR [via].
- **Speers-Roesch, Norin & Driedzic 2018** reached the same conclusion for cunner: inactivity plus cold, not depression [primary abstract via search] — [PMC6158517](https://pmc.ncbi.nlm.nih.gov/articles/PMC6158517)
- **Feeding history (largemouth):** after 9 weeks on alternating maintenance or ad libitum rations (fish 104–108 g), specific O₂ use was **38% lower** on maintenance (0.094 vs 0.152 mg O₂ g⁻¹ h⁻¹). The model overestimated maintenance-fed fish's consumption by **65%** [primary abstract] — [Ranney, Chipps & Wahl 2023, Can. J. Zool.](https://www.usgs.gov/publications/effect-feeding-history-metabolic-rate-largemouth-bass-micropterus-nigricans)
- **Lemons & Crawshaw 1985:** largemouth choosing 3 °C instead of 5 °C had lower metabolic rate, energy use and activity [via Jones 2025].

**When feeding stops:**
- **Lab:** at 10 °C, fingerlings became inactive and stopped feeding (Oliver, Holeton & Chua 1979) [via [NW Power & Conservation Council, Vol. III ch. 8](https://www.nwcouncil.org/sites/default/files/Vol._III_Ch._8__Smallmouth_Bass.pdf)].
- **Maine:** feeding and growth stop below 50 °F (10 °C) — MDIFW black bass plan (existing note).
- **Habitat (HSI) report:** fish become inactive and seek shelter at about 10 °C; at 6–7 °C most are under rocks (existing note).
- **Spring:** fish move to warmer shallows at about 8.5 °C for a brief pre-spawn feeding window (Keast 1968) [via Jones 2025].
- **Stomachs:** in north-temperate lakes they are predominantly empty from late fall through winter (Keast 1968) [via Jones 2025]. Ridgway is quoted as saying northern lake bass do not eat in winter and suffer up to 35% overwinter mortality [via, popular] (existing note).
- **Maine catch rates:** 0.46 bass per angler-day through the ice against 1.7 in open water, a ratio of about 0.27 (existing note).

### Inferences (derived)
- **Which metabolic estimate fits the field.**
  - A fasting adult at Brownscombe's 67 mg O₂ kg⁻¹ h⁻¹ (4 °C) for 150 days would burn about 3,300 J/g, roughly 60% of body energy. That is incompatible with about 50% lipid loss and spring survival.
  - At 15–30 mg O₂ kg⁻¹ h⁻¹ the same winter costs about 700–1,500 J/g, i.e. 13–27% of body energy at 5,500 J/g, matching the Opeongo lipid budget and the Warner Lake mass change.
  - So the tunnel RMR is an upper bound. Field-consistent winter metabolism for a quiescent adult is **15–30 mg O₂ kg⁻¹ h⁻¹ at 2–6 °C**.
- **The Whitledge set is fine at 0.5–1 kg in winter** (19–26 and 12–15 mg O₂ kg⁻¹ h⁻¹), but **2–4× too high at about 100–150 g** (55–74).
  - The failing 127-g bass is exactly the size class the steep RB distorts.
- **Mass versus energy.** Winter loss is mostly lipid (39.5 kJ/g), and water replaces it.
  - Fullerton et al. 2000: fed age-0 largemouth sometimes lost up to 40% of energy density while wet weight held [snippet].
  - Breck 2008 models how energy density tracks water fraction [primary abstract] — [TAFS 137:340–356](https://catalog.comses.net/publications/137315)
  - A constant-energy-density model (the sim's bass ED is 4,184 J/g) turns a 20% energy loss into a 25–35% mass loss. Real fish lose 5–15% of mass.
- **Fall p.** No field measurement was found (gap).
  - To reach the Opeongo pattern (lipid doubling by late September), net intake must stay well above maintenance through September–October at 12–20 °C.
  - With a corrected cold respiration, maintenance is p ≈ 0.15–0.35 at those temperatures for 100–500 g fish. So fall p ≈ **0.6–0.8** gives growth plus storage.
  - With the uncorrected Whitledge set, a 127-g fish needs p = 0.81 just to hold weight at 10 °C, so it cannot fatten in October at all.

### Gaps
- No measured overwinter mass or energy loss for adult smallmouth anywhere. The Mackereth lipid values are in figures only.
- No respirometry on smallmouth below 6 °C.
- No field-measured fall ration for smallmouth.

---

## Q2. Young-of-year smallmouth bass

### Takeaway
- Survivors of a northern winter lose **22–54% of their energy reserves**, and fish **under about 50 mm** die.
- For Hot Brook's 208-day winter, the Shuter et al. 1980 thresholds give **all die below 48 mm, all survive above 92 mm**.
- Starvation rate has **Q10 = 2.2 over 2.5–8 °C** and rises as body size falls.
- A respiration of about 30–55 mg O₂ kg⁻¹ h⁻¹ for 1–5-g fish at 2–4 °C reproduces the measured depletion. The sim's Rice stand-in (213–242) and Whitledge (633–849) are 4–20× too high for YOY.

### Cited Findings

**Shuter, Ihssen, Wales & Snucins 1989, J. Fish Biol. 35:765–780** [primary abstract via search; Wiley blocked] — [Wiley record](https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1095-8649.1989.tb03028.x)
- Lab winter starvation of YOY.
- Starvation rate varies systematically with body size, temperature, pH and hardness.
- **Q10 = 2.2 over 2.5–8 °C.**
- Water chemistry:
  - the rate at pH 4.9 is about 1.25× the rate at pH 7;
  - the rate at 80 mg Ca/L is about 0.80× the rate at 1 mg/L.
- Stored energy rises faster with size than starvation rate does, so lifetime under starvation lengthens with size.
- **Body condition at death is a fixed function of body size** across conditions, i.e. a size-specific lethal reserve level.
- A secondary review gives survival at **17 °C of 8 days for a 14-mm fish and 45 days for a 62-mm fish** [snippet; unverified attribution].

**Shuter & Post 1990, TAFS 119:314–336** [primary abstract] — [OUP](https://academic.oup.com/tafs/article/119/2/314/7891812)
- Smaller fish have higher weight-specific metabolism without proportionally larger stores, so they tolerate starvation less.
- First-year growth against winter length explains the northern limits of yellow perch and smallmouth.
- The equations were not reached; the abstract has none.

**Oliver, Holeton & Chua 1979, TAFS 108:130–136** [via the Wisconsin and NW Council reviews]
- Hatchery fingerlings were wintered September 1975 – May 1976.
- Longer fingerlings survived better, suggesting a critical reserve level.
- Final winter temperatures of **2, 4 and 6 °C did not change mortality**.
- MacLean et al. 1980 refit the data: survival is lower below about 5 cm [via].

**Shuter et al. 1980 thresholds as implemented for Spednic Lake, Maine–New Brunswick** (Dudley & Trial 2014; details in the parameter notes Q4)
- Cmin = 0.1938·WD + 7.917 mm; Cmax = 0.3375·WD + 22.083 mm; WD = days below 10 °C.
- Mortality is linear in between.
- For WD = 208: **48 mm and 92 mm**.

**Curry, Currie, Arndt & Bielak 2005, Environ. Biol. Fishes** [primary abstract] — [Melbourne record](https://findanexpert.unimelb.edu.au/scholarlywork/1091057-winter-survival-of-age-0-smallmouth-bass--micropterus-dolomieu--in-north-eastern-lakes); [doi:10.1007/s10641-004-6582-2](https://doi.org/10.1007/s10641-004-6582-2)
- New Brunswick lakes at the range limit; pre- and post-winter collections over 3 years.
- **Fish under 50 mm TL died under the ice.**
- In lake enclosures, small fish survived better at warmer exposure temperatures, but the largest survived worse.
- **Survivors lost 22–54% of pre-winter energy reserves** (ash-free dry weight), the same as wild fish caught in spring.

**Maine** (existing note, MDIFW): YOY face roughly a 200+ day starvation period below 50 °F.

### Inferences (derived)
- **A 5-g YOY over a 208-day winter** (30 days cooling 10 → 4 °C, 150 days at 3 °C, 28 days warming):

  | Respiration | Energy spent over winter | Share of a 4,300 J/g body |
  |---|---|---|
  | Recommended curve × 0.7 (fasting, inactive) | 2,460 J/g | 57% |
  | Recommended curve × 1.0 | 3,500 J/g | 82% |
  | Rice set | 15,500 J/g | 360% |
  | Whitledge set | 50,600 J/g | 1,180% |

  - The first rows match Curry's 22–54% for survivors (who fed a little in the shoulder months) and death of the smallest. The last two are impossible.
- **Size dependence follows from the mass exponent.** With b ≈ −0.2, a 2-g fish (about 55 mm) spends about 20% more per gram than a 5-g fish (about 75 mm). Small YOY also carry less energy per gram. That produces Shuter's 48 → 92 mm ramp.

---

## Q3. How FB4 users handle centrarchids, and the esocid model, in the cold

### Takeaway
- The standard bass models were fit at summer temperatures. Every winter test finds them **overestimating winter costs**:
  - largemouth, age 0: by more than 20% (Wright et al. 1999);
  - largemouth adults in the field: fasting losses predicted at about 28% against about 9% observed (Reeve 2025);
  - age-0 tiger muskellunge: consumption overestimated by 113% at 10 °C and 328% at 7.5 °C (Chipps 2000).
- **Common fixes in the literature:**
  1. set consumption to 0 below 10 °C and treat days below 10 °C as a starvation period (Shuter et al. 1980; Reeve 2025's fasting runs);
  2. set activity cost to 0 below 10 °C, i.e. metabolism = resting (Trebitz 1991; Wright et al. 1999);
  3. set consumption to maintenance below 10 °C (Jacobson 1992, Minnesota pike — existing note);
  4. refit RQ and activity on winter data (Reeve 2025: RQ 0.0529; swim speed rising with T);
  5. cut metabolism 30% after 2 weeks of fasting (Reeve 2025, based on Ranney 2023 and Gingerich 2010);
  6. let metabolism depend on feeding history (Ranney 2023: −38% on maintenance rations).
- Nobody I found uses a published "winter activity multiplier" for smallmouth. The Whitledge set has ACT = 1 at all temperatures.

### Cited Findings and leads
- **The Shuter & Post row in FB4 is probably a unit error.**
  - FB4 stores the 1990 smallmouth set with **RA = 0.03** (REQ 2, RB −0.21, RQ 3.3, ACT 2). The earlier notes found that this row gives negative growth at full ration at every size.
  - The Minnesota DNR's Mille Lacs bioenergetics used **the same set with RA = 0.009** (and UA 0.068) — [Ahrenstorff & Holbrook 2016, MN DNR Investigational Report 576, Table 1](https://files.dnr.state.mn.us/publications/fisheries/investigational_reports/576.pdf) [primary]
  - 0.03 / 3.24 (kcal per g O₂) = 0.0093. **FB4's RA is probably in calorie-equivalent units, not g O₂** (derived hypothesis).
  - With RA = 0.009 the set is viable in summer (maintenance p 0.45–0.67 at 20–25 °C for 30 g to 1 kg).
  - In winter it gives very low respiration: **3–9 mg O₂ kg⁻¹ h⁻¹** at 2–6 °C for 127 g to 1 kg. That is a torpor-like lower bound, below the measured largemouth RMR.
- **A newer pike set: "Bean 2010"**, as used by Ahrenstorff & Holbrook 2016 [primary table; Bean 2010 not found]:
  - CEQ 2: CA 0.2045, CB −0.18, CQ 2.59, CTO 24, CTM 34.
  - REQ 2: RA 0.0153, RB −0.3954, RQ 2.29, RTO 28.5, RTM 30, ACT 1.849.
  - SDA 0.14; FA 0.2; UA 0.07.
  - Column alignment in the extracted table was checked against the walleye and smallmouth columns.
  - In the cold this set gives maintenance at p ≈ **0.40 (500 g) to 0.54 (127 g) at 4 °C**, against 0.77 for the Bevelhimer set (derived).
- **No channel catfish set exists in FB4.** The official parameter file (105 rows) has no Ictalurus row; brown bullhead (Hartman et al. 2017) is the only ictalurid — [Parameters_official.csv](https://raw.githubusercontent.com/jim-breck/FB4/master/Parameters_official.csv) [primary, downloaded 2026-10-18]. The fb4package database also lists brown bullhead — [CRAN vignette](https://cran.r-project.org/web/packages/fb4package/vignettes/fb4-species-database.html)
- **Warm vs cool guilds:** a review found no significant difference in winter lipid change between warm-, cool- and coldwater species (Fernandes & McMeans 2019, Ecography 42:1–16) [via Ellman 2023].
- **Lipid storage by species** (Sullivan 1986 synopsis) [primary abstract via search] — [Springer chapter](https://link.springer.com/chapter/10.1007/978-94-017-1158-6_22)
  - Largemouth store lipid in muscle and viscera; their winter starvation tolerance depends on that store.
  - Yellow perch keep feeding through winter and hold lipid roughly constant.

---

## Q4. Chain pickerel and northern pike in winter

### Takeaway
- **Esocids feed under the ice, but slowly.**
  - Pike gastric evacuation takes **48 h in summer and 12 days in winter**.
  - Lac Ste. Anne daily ration was very low in winter, and females ate 1.5–2.3× as much as males in winter as in summer.
- **No measured winter %BW/d was found** for either species.
- Two independent derivations give **about 0.2–0.4% of body weight per day at 1–4 °C** for a 0.3–1 kg fish: the evacuation-limited ration, and a summer ration divided by the 6× slower evacuation. That is about **25–50% of the Bevelhimer Cmax** (0.8–1.1%/d at 2–4 °C).
- **Somatic energy holds or rises in winter.**
  - Male pike gain body energy over winter.
  - Females divert intake into ovaries, whose energy density rises over winter.
  - Both lose energy only around the March–May spawn.
- **The FB4 pike set's maintenance in the cold is overestimated 2–4×** (Chipps 2000). Real maintenance at 1–4 °C is probably about 0.2–0.35 of Cmax.
- **Winter diet:** yellow perch dominate pike diets where present; also minnows and shiners, suckers and burbot. Pickerel are caught on live minnows set near bottom.
- **No chain-pickerel energetics** (Cmax, respiration, winter ration) exist.

### Cited Findings
- **Diana 1979, Can. J. Zool. 57:2121–2127** [primary abstract via Crossref] — [cdnsciencepub record](https://cdnsciencepub.com/doi/abs/10.1139/z79-279)
  - 1,290 pike, Lac Ste. Anne, Alberta.
  - Diet by number: yellow perch, spottail shiner, burbot, white sucker. By calories: perch, sucker, burbot; rare large prey matter.
  - **Gastric evacuation 48 h in summer, 12 days in winter.**
  - Daily ration was high May–August (peak in June) and **very low in winter**.
  - Both sexes fast for the late-April spawn.
  - Female ration was 1.5–2.3× male in both summer and winter.
- **Diana 1983, Can. J. Zool. 61:1968–1975** [primary abstract via search] — [doi](https://doi.org/10.1139/z83-259)
  - Females took in 1.1–1.3× more energy a year than males, mostly into ovaries.
  - **Male body energy rose over summer and winter; female body energy rose only in summer, with ovarian growth mostly in winter.**
  - Both sexes lost energy during the March–May spawn.
  - Field ration data were judged inaccurate.
- **Murphy 1989, MSc, U. Alaska** [primary abstract] — [ScholarWorks](https://scholarworks.alaska.edu/uaf_grad_fisheries/391)
  - Minto Flats pike: ovarian energy density was 21.78 kJ/g after spawning and 21.89 kJ/g in fall, then **rose to 24.80 kJ/g over winter**.
  - The author calls winter a critical period for both sexes.
- **Chipps, Einfalt & Wahl 2000, TAFS 129:186–193** [primary abstract] — [USGS](https://www.usgs.gov/publications/growth-and-food-consumption-tiger-muskellunge-effects-temperature-and-ration-level)
  - Age-0 tiger muskellunge at rations of 25, 50, 75 and 100% Cmax and 7.5–25 °C.
  - The model **overestimated winter consumption by about 113% at 10 °C and 328% at 7.5 °C**, against 4–58% at 20–25 °C.
  - The authors attribute this to seasonal changes in esocid metabolism that the model ignores. Errors were worst at low ration and low growth.
- **Casselman, as reported by In-Fisherman** [popular] — [In-Fisherman](https://www.in-fisherman.com/editorial/Understanding-Winter-Pike/387779)
  - Pike winter growth is about **3.9% of maximum** (the article does not attribute this figure).
  - Pike stop feeding below about **2 ppm O₂** (22% saturation); 0.84 ppm is lethal; they survive 0.3 ppm in shallow weedy lakes but are inactive.
  - Activity peaks at 300–700 lux, about the under-ice midday light in January.
- **Maine pickerel** (existing note): 1.18 pickerel per angler-day through the ice against 0.49 in summer; 1.0–2.0 in shallow warmwater lakes; ice-caught fish average 43 cm and 1.2 lb.
  - Caveat: tip-ups with live minnows and fish concentrated by habitat inflate ice catch rates. They show feeding, not a higher ration than in summer.
- **Nova Scotia pickerel stomachs** (summer only, n = 17): 59% contained insects (mayfly and odonate larvae), 12% fish, 18% empty [primary] — [Mitchell, LeBlanc & Heggelin](https://novascotia.ca/fish/documents/special-management-areas-reports/impact-chain-pickerel.pdf)

### Inferences (derived)
- **Evacuation-limited ration.** A typical meal of about 3–5% of body weight, cleared in about 12 days, caps intake at about 0.25–0.4 %BW/d if feeding is continuous.
  - Alberta summer rations were about 1–3 %BW/d with 48-h evacuation; at a 6× slower winter evacuation the same stomach fullness implies about 0.2–0.5 %BW/d.
  - Both match the sim's "about 40% of Cmax" (Bevelhimer Cmax 0.8–1.1%/d at 2–4 °C for 0.13–0.5 kg).
- **So the sim's pickerel are fed realistically.** They lose weight only because the pike set's cold respiration (45–65 mg O₂ kg⁻¹ h⁻¹ at 4 °C, Q10 1.73) is too high.
  - Halving it at 8 °C and below brings maintenance to p ≈ 0.35–0.4. Pickerel would then hold weight on 40% of Cmax, matching Diana's somatic gain in males and Casselman's slight winter growth.

### Gaps
- No under-ice consumption estimate (%BW/d) for any esocid.
- No pike or pickerel SMR measured below 10 °C was reached (Diana 1982 and Lucas et al. 1991 were not accessible).
- No winter diet study of chain pickerel.
- The source of the "Bean 2010" pike set is unverified.

---

## Q5. Young-of-year brown bullhead

### Takeaway
- **First-fall size:** YOY reach **about 55–70 mm by late September and October** in New York (Cayuga Lake), and about 64–102 mm (2.5–4 in) by the end of the first year in Iowa. Wisconsin gives 2.8 in (71 mm) at age 1 for bullheads generally. Mass is about 2–5 g (Ws a 0.01069, b 3.105).
- **Growth season:** Lake Opinicon growth is concentrated June–September. Lab growth was best at 20–30 °C across 5–30 °C, and food was not limiting in Opinicon.
- **Winter behaviour:** bullheads stop feeding, become sluggish and **bury in soft bottom ooze**. In a 2 °C Connecticut pond they did not eat at all.
  - Some do feed below about 6.5–8 °C (Keast 1968, Ontario).
  - A non-native European population still preyed on fish at 3 °C, at night, with a sharp increase between 3 and 4.5 °C.
- **Winter metabolism:** dormancy is inactivity at SMR, with a typical Q10 of about 2–3 (Crawshaw et al. 1982); there is no special depression.
  - The bullhead's own FB4 set gives **41 mg O₂ kg⁻¹ h⁻¹ for 5 g at 4 °C, with Q10 2.5**.
  - The sim's YOY stand-in (Rice largemouth) gives 227.
- **No overwinter survival or weight-loss data for YOY bullhead were found.**

### Cited Findings
- **Raney & Webster 1940** (TAFS 69:205–209, Cayuga Lake, NY, 1938 YOY): mean 57.5 mm on 30 Sep; **68.0 mm (range 41–93, n = 53) on 10 Oct** [snippet of a species profile reproducing their table; the source PDF host was unreachable]
- **Keast 1985, Can. J. Zool. 63:1510–1515** [primary abstract via Crossref] — [doi](https://doi.org/10.1139/z85-224)
  - Year-0 and year-2 bullheads from Lake Opinicon, after summer growth, held 8 weeks at six temperatures from 5 to 30 °C.
  - Ration rose with temperature.
  - Instantaneous growth was best at 20–30 °C; for year-0 fish it was higher at 30 °C than at 20–25 °C.
  - Conversion efficiency peaked at 10–30 °C (small fish) and 15–25 °C (large fish).
  - Field growth was greatest June–September (length growth high June–August) and matched lab rates; food was not limiting.
- **Wisconsin DNR** [agency] — [Species_bullheads.pdf](https://dnr.Wisconsin.gov/sites/default/files/topic/Fishing/Species_bullheads.pdf)
  - Appetite falls with winter; fish stop feeding, turn sluggish and often bury in leafy ooze along shore with only mouth and gills exposed. This lets them survive winterkill.
  - Bullheads 2.80 in at age 1, 7.70 at age 2.
- **Massengill 1973:** brown bullheads did not eat at all in a 2 °C Connecticut pond; in a nearby heated effluent they ate fish, zooplankton, worms and molluscs [via [Ellman 2023, MSc, U. Minnesota](https://conservancy.umn.edu/server/api/core/bitstreams/b6d7919f-c2d9-4d31-bb04-5ed113fb8564/content)]
- **Fritsch et al. 2025, J. Fish Biol. 107:1889–1897** [primary abstract via Europe PMC] — [Wiley record](https://onlinelibrary.wiley.com/doi/10.1111/jfb.70189)
  - Predation occurred down to 3 °C, strictly nocturnal.
  - Handling time changed between 3 and 4.5 °C, and predation impact rose sharply over that interval.
  - The paper cites Keast 1968 for gut-content evidence of feeding below 6.5–8 °C in a Canadian lake [via].
- **Crawshaw et al. 1982**, J. Comp. Physiol. B 148:41–47 ([doi](https://doi.org/10.1007/bf00688886)): low-temperature dormancy in brown bullhead; metabolic Q10 about 2–3, read as inactivity at SMR [via Reeve et al. 2022]
- **FB4 brown bullhead set** (Hartman et al. 2017; development on fish of 2.5–130.7 g at 10–30 °C — existing note):
  - Thornton–Lessem consumption with CQ 15 °C and CK1 0.473: Cmax at 4 °C is 0.7% of peak, i.e. essentially no feeding below about 6–8 °C.
  - Respiration Q10 is 2.5.

### Inferences (derived)
- **A 3–5 g YOY bullhead over the 208-day winter:**

  | Respiration | Energy spent | Share of body energy (about 4,300 J/g) |
  |---|---|---|
  | Hartman set ×1.0, fasting throughout | about 2,800 J/g | about 65% |
  | Hartman set ×0.7 (dormant) | about 2,000 J/g | about 45% |
  | Rice set (the sim's stand-in) | 15,500 J/g | — certain death |

  - Feeding at low rates in October–November and late April–May, when water is above 4–5 °C, would cut the net loss to perhaps 25–35%.
  - So the bullhead's own respiration curve is survivable; the Rice stand-in is not.
- The size dependence should resemble smallmouth: the smallest YOY, below about 40–45 mm, most at risk. This is unmeasured, an analogy only.

---

## Related: the same winter in other Hot Brook species (context)
- **Juvenile pumpkinseed (Ontario):** 88% had food in their stomachs in winter (Rooke & Fox 2020) [via Ellman 2023].
- **Lake Champlain, Keeler Bay** (Block et al. draft; later published as a Hydrobiologia paper, not verified) [primary draft] — [UVM docx](https://vmc.w3.uvm.edu/vmcdevel/attachments/project/1628/Block_et_al__-_Draft_4.docx)
  - Yellow perch foraged all winter (34% empty stomachs in winter vs 8–10% spring–summer) and grew.
  - Pumpkinseed and bluegill ate infrequently, lost lipid and condition, and costs exceeded intake in winter months.
  - Seasonal ratios from the bioenergetics runs:

    | Species | Consumption, summer peak ÷ February | Metabolism, summer peak ÷ February |
    |---|---|---|
    | Perch | 6.0 | 5.3 |
    | Pumpkinseed | 10.6 | 5.7 |
    | Bluegill | 17.8 | 6.2 |

- **Yellow perch** feed actively all winter and keep lipid about constant (Sullivan 1986 synopsis); largemouth lose lipid.

---

## For the sim

**Diagnosis.** Winter starvation is mostly an artifact of three things:
- **(a) Respiration sets fit at summer temperatures:**
  - Whitledge's steep mass exponent at about 100–150 g;
  - the Rice set's Q10 of 1.37 for every fish on `bioJuv`, i.e. small bass and YOY bullhead;
  - the esocid set's 2–4× winter overestimate.
- **(b) A constant energy density**, which turns lipid-dominated energy loss into 1.5–2× too much mass loss.
- **(c) Little fall fattening.**

Real Cmax in the cold is low, and that part is realistic.

### Smallmouth bass

1. **Winter metabolic rate at 2–6 °C (targets the model must hit):**

   | Fish size | Target, mg O₂ kg⁻¹ h⁻¹ (central value) | Basis |
   |---|---|---|
   | Adults, 300–1,000 g | **15–30** (about 20 at 500 g, 4 °C) | field energy budgets |
   | 100–150 g | 20–35 | — |
   | YOY, 1–10 g | 30–55 | Curry 2005 depletion |
   | Torpor lower bound (Shuter & Post with RA 0.009) | 3–9 | — |
   | Tunnel upper bound (Brownscombe 1-kg RMR) | 61–78 | — |

   - **Q10 ≈ 2.0** (1.8 for largemouth RMR; 2.2 for YOY starvation rate). No depression beyond Q10.
   - **Mechanism:** below about 15 °C, compute R from an empirical curve and blend linearly into the FB4 set between 15 and 18 °C, Whitledge's lowest fitted temperature. Do this for every bass, including the `bioJuv` (Rice) fish:

     R = 30 mg O₂ kg⁻¹ h⁻¹ × (W/100 g)^−0.2 × 2.0^((T−5)/10) × f_q

     - f_q = **0.7** when the fish is quiescent and not feeding (range 0.5–1.0), 1.0 when feeding.
     - The 0.7 reflects inactivity plus the 30–75% fasting drop in RMR. It is applied after about 2 weeks without food, as Reeve 2025 did.
   - For fish at or above 500 g this is close to Whitledge in winter. For fish under 150 g it cuts winter cost about 2–4×. For YOY, about 4–6× versus Rice.
2. **Energy-to-mass conversion over winter.** Either let energy density fall with condition (Breck 2008: energy density is linear in water fraction), or convert winter deficits at the energy density of the tissue actually lost: **about 7–9 kJ/g for an adult with fall reserves, about 5–6 kJ/g for YOY**, instead of 4,184 J/g. Otherwise mass loss is overstated by about 1.5–2×.
3. **Expected overwinter loss** (Oct 16 – May 12, the sim's 208 days below 10 °C):
   - **Adults:** mass −5 to −15%, energy −15 to −25%, lipid about −50%. Warner Lake largemouth: −5.3 ± 1.8% fall to spring, while still eating a little. Opeongo smallmouth: fall lipid about 2× spring.
   - **YOY:** survivors lose 22–54% of energy. Mortality is a size ramp: **all below 48 mm die, all above 92 mm survive**, linear in between (Shuter et al. 1980 for WD 208). In the energy model this should emerge from a size-specific lethal condition (Shuter 1989), with the curve above.
4. **Feeding cessation:**
   - fall feeding declines from about 15 °C and **stops at about 10 °C**;
   - under ice, smallmouth intake is about 0–0.1 %BW/d (p ≈ 0–0.2 of the cold Cmax; ice catch is about a quarter of open-water). For comparison, the more active largemouth eat 0.13–0.23 %BW/d;
   - feeding restarts when water passes about 8.5–10 °C in spring.
5. **Fall p ≈ 0.6–0.8** in September–October (12–20 °C), so fish build about 2× spring lipid by early October. Fall YOY perch, shiners and crayfish must be available to them, which is a prey question.

### Chain pickerel

- **Winter ration about 0.2–0.4 %BW/d** at 1–4 °C, about 25–50% of the Bevelhimer Cmax. The sim's current about 40% is realistic; keep it.
- **Mechanism:** multiply pike-set respiration by **0.5 at 8 °C and below**, ramping to 1.0 by 15 °C (Chipps 2000: winter consumption overestimated 2–4×).
  - Maintenance then sits at p ≈ 0.35–0.4, and pickerel hold or slightly gain somatic mass in winter.
  - Females should route winter surplus to the ovary (Diana 1983; Murphy 1989); weight loss belongs to March–May spawning.
- **Alternative:** test the "Bean 2010" pike set (maintenance p 0.40–0.54 at 4 °C), but its source is unverified.
- Keep daytime visual feeding under ice, and **stop feeding below about 2 mg/L O₂**.

### Young brown bullhead

- **Size by first winter:** 55–70 mm (about 2–5 g) by early October.
- **Respiration:** at T < about 15 °C, switch YOY from the Rice stand-in to the bullhead's own FB4 respiration (Hartman: 41 mg O₂ kg⁻¹ h⁻¹ at 5 g and 4 °C, Q10 2.5), or to the curve above. Apply f_q ≈ 0.7 while buried and fasting.
  - The Rice set (227 at 4 °C) alone guarantees starvation.
- **Feeding:** none below about 4 °C (Massengill, 2 °C); low nocturnal feeding at 4–8 °C (Keast 1968; Fritsch 2025); normal above about 10 °C. Hartman's Cmax already does this.
- **Expected first winter:** energy −25 to −45%. Losses are concentrated in the smallest fish (below about 40–45 mm), by analogy with smallmouth; there are no bullhead data.
- **A check for the sim:** the bullhead is the most hypoxia- and winterkill-tolerant fish in the lakes, so its YOY should not die where perch and pumpkinseed YOY survive.
