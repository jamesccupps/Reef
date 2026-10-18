# Chain pickerel population dynamics: survival by age, the first year, density, and what keeps a population stable

Compiled 2026-10-18 for the 3-D sim's pickerel decline.

**The sim's problem (from the caller).**
- Over one year, adult pickerel fall to 0.45× their starting number.
- Deaths among the 16,000 fish ≥ 7.5 cm (~25/ha) total ~70 %/yr:
  - ~5,500 eaten, ~5,000 of them by bigger pickerel (mostly fish < 20 cm);
  - ~5,200 from background natural mortality (0.5 × M, M = 0.62, × (L/43)^−0.87);
  - 400–700 starved.
- Only ~2,500 young reach 8 cm, out of ~0.8 M hatched: 82 % die of background mortality, 11 % are eaten, 0.3 % recruit.

**Not repeated here.** The adult-mortality estimators, pike surrogates, cannibal size ratios and densities already in `Whole lake 3D fish simulation/pickerel_mortality_cannibalism.md`. The growth, fecundity and spawning values already in `Maine lakes ponds and streams/centrarchid_percid_esocid_parameters.md` are cited only where they feed the arithmetic.

**Tags.**
- **[primary]**: full text read.
- **[secondary]**: cited in a document I read.
- **[abstract]**: abstract only.
- **[snippet]**: search-result text only.
- **[inf]**: my arithmetic or inference.
- **[unverified]**: a lead I know of but did not confirm this session; never used as a target.

**Region tags.** [N] northeast North America; [MW] Midwest; [EU] Europe; [S] southern US.

**Blocked or unreadable, skipped and not bypassed.**
- Biodiversity Heritage Library item page: 403. This was probably Coffie 1998, *Status of the chain pickerel in Canada*.
- New Brunswick chain pickerel sheet: it redirects to an unrelated property-assessment site.
- Guillory 1981 (Lake Conway reproduction): a scanned PDF with no text layer and no OCR available here, so only the abstract was used.
- University of Wisconsin digital-collection text pages: they render by JavaScript, so the PDF copy was used instead.

**Helper research.** Two parallel helper searches were run.
- **Pickerel mortality and density: reported, and folded in as §6b.** The helper read the sources itself, and its tags are kept. Numbers it derived are marked "derived (helper)".
- **Esocid first-year survival** (Grimm 1981, Kipling & Frost 1970, Haugen/Edeline/Langangen on Windermere): **had not reported when these notes were finalised**. Its leads stay open in §7.

---

## Summary

1. **Adult survival.**
   - **No catch-curve or tagging estimate of chain pickerel mortality** was found for any northeastern lake. The earlier note found none either. The one known study, Saila 1956 (Rhode Island ponds), is blocked.
   - **Estimator, chain pickerel:** the Then growth form on the New England vB fits gives adult **M 0.24–0.41**. A crude Nova Scotia catch curve gives **S ≈ 0.58** (§6b).
   - **Lightly fished pike:**
     - Ontario lakes: female A **median 35 %** (18–58 %); male A ~51 %.
     - Windermere adults: S **0.63–0.69**.
     - Savanne Lake, Ontario (364 ha, mean depth 2.6 m): **~7 mature pike/ha, 8.7 kg/ha**, low Z (§6b).
   - The best-supported targets for a lightly fished population (life-history estimators, pike, grass pickerel) are:
     - **adult (≥ 35 cm) annual survival S ≈ 0.55–0.70** (M ≈ 0.35–0.6);
     - **age-2 (~18–27 cm) S ≈ 0.45–0.55**;
     - **age-1 (~10–18 cm) S ≈ 0.30–0.45**.
2. **The whole ≥ 7.5-cm stock.** A stable population with those survivals, censused in late summer and including the new 8–12-cm young of the year, loses **~45–60 % a year** (§6). The sim's ~70 % is too high, but by a factor of only ~1.2–1.5.
3. **The bigger gap is recruitment.** To hold 16,000 fish ≥ 7.5 cm, the lakes need **~7,000–9,000 young of the year reaching 8–12 cm each fall**. The sim makes ~2,500, which is **3–4× too few**.
   - The sim's 0.8 M swim-ups are already as many or more than a stable stock of this size would produce (~0.3–0.75 M; §6).
   - So the shortfall is **swim-up → fall survival**: the sim has 0.3 %, and the target is **~1–2 %**.
4. **First year.**
   - **Egg → swim-up: ~3–20 %.** Pike in an English gravel-pit lake had 3–6 % from stage-1 eggs to fry, and 2.5–19 % hatching depending on substrate (Wright & Shoesmith 1988). The sim's `sHatch` 0.05 sits at the low end.
   - **Swim-up → December in ponds: 0.06–11 %** for pike, depending on density (0.7–81 yolk-sac fry/m²; Wright 1988).
   - **Pike stage survival** (Dahlberg 1979 review): eggs 0.18, yolk-sac 0.57, feeding post-larvae **0.29 over 22 days** (Z ≈ 0.056/day). That is ~3 % from egg to day 43.
   - Weedy vs bare gravel pit: **~2× the egg → November survival** in the weedy lake (Wright 1990; §6b).
   - **The first summer kills most of a cohort, and the larval weeks most of all.**
5. **Cannibalism in young pickerel is real but small in the field.**
   - Only **2 % of grass pickerel young-of-year stomachs (7 of 351)** held pickerel in Wisconsin, and no adult did. In Ontario it was 9 of 387 stomachs (Kleinert & Mraz 1966, citing Crossman 1962).
   - Tank and pond studies of pike fry give much higher cannibal shares. Those come from crowded, cover-poor settings.
   - **Target: cannibalism ≈ 10–30 % of age-0 deaths after swim-up, and ≤ 20–30 % of age-1 deaths.**
   - It should **not** be the largest single cause of death of fish ≥ 8 cm.
6. **Size after the first summer.**
   - Maine: **10–13 cm by September–October** (MDIFW).
   - Grass pickerel in Wisconsin lakes: 122–133 mm by mid-September; in ponds, 145–153 mm by early September.
   - Growth runs **~0.7–1.0 mm/day** from June to September [inf].
7. **Fecundity and spawning.**
   - Maine gives **10,000–12,000 eggs/lb (~24 eggs/g)**. A 43-cm female carries ~12,500 eggs.
   - Pike and pickerel are total, annual spawners. The only skipped-spawning figure found is **25 % of 20 pike females** in a Polish reservoir [snippet].
   - **Assume ~90–100 % of mature females spawn each year.**
8. **Density and stability.**
   - No northeastern chain pickerel per-hectare estimate was found.
   - Southern rotenone surveys (§6b):
     - Lake Tohopekaliga, Florida, littoral: **5.7–22/ha and 3–17 kg/ha**; lake-wide ~10.6/ha and ~9 kg/ha.
     - North Carolina shallow littoral plots: **91–100/ha** of mostly young fish (4–7 kg/ha).
   - **Year-to-year CV of abundance indices ≈ 40–50 %**: Okefenokee 51 % over 10 years; a New Hampshire river pool ~50–70 %.
   - Grass pickerel in a 56-ha Wisconsin lake: **22–97 fish/ha and 1.2–3.9 kg/ha** in the fall over four years.
     - Numbers varied **4-fold** and biomass **3-fold**.
     - Two year-class failures caused it: stranding of the nursery in drought.
   - The sim's 25/ha at ~2–3 kg/ha is plausible.

---

## Q1. Annual survival and mortality by age

### Chain pickerel
- **No direct estimate found.** No catch curve, Petersen or Schnabel survival, or tagging Z for chain pickerel in a northeastern lake turned up this session.
  - The earlier note's search (MDIFW, PA, NJ, CT, NS) found none.
  - Ageing chain pickerel by scales is called "generally unreliable" by NY DEC, so lake surveys give length frequencies, not ages. That is one reason catch curves are rare ([NY DEC, Stoney Pond survey 2017](https://extapps.dec.ny.gov/docs/fish_marine_pdf/r7stonponr.pdf) [primary][N]).
- **Angling share.**
  - Maine anglers catch ~6–9 pickerel/ha/yr and keep ~0.6–1/ha/yr (earlier note, from MDIFW).
  - Pike hooking mortality is **~4.5 % (95 % CI 3.0–5.9 %)**, or 5.3 % including deaths from pike hooks (Minnesota DNR esocid review [snippet]). A family-level review gives 14.9 ± 7.0 % for Esocidae [snippet].
  - Applied to ~25 fish/ha, angling (harvest plus release deaths) is **F ≈ 0.03–0.05/yr** [inf]. Natural mortality dominates.
- **Grass pickerel (*E. americanus vermiculatus*), Pleasant Lake, Wisconsin** [primary][MW] (Kleinert & Mraz 1966, details in Q5):
  - Males older than age I were never found, so males live a shorter time.
  - Only 10 % of fish exceeded 10 in and < 1 % exceeded 12 in.
  - The spring spawning run in 1963 (fish ≥ 7 in) was 1,274 fish, **23.5 % of the previous fall's estimate** (which included young of the year).
  - These describe a short-lived species. No age-specific survival can be computed from them.

### Size-scaled natural mortality (estimators) [inf]
**Lorenzen (2022):** natural mortality falls about in proportion to 1/length through most of the juvenile and adult phases. Empirical exponents run −0.84 to −1.11 ([SEDAR copy of Lorenzen 2022, *Fish. Res.* 255:106454](https://sedarweb.org/documents/sedar76rd13_size-and-age-dependent-natural-mortality-in-fish-populations-biology-models-implications-and-a-generalized-length-inverse-mortality-paradigm-pdf) [abstract]). The sim's −0.87 is inside that range.

Total natural M by length, chain pickerel (Ws: W = 0.002624·L^3.243):

| Length | Lorenzen 1996 (3.00·W^−0.288) | Charnov et al. 2013, K(L/L∞)^−1.5, L∞ 65, K 0.2 | Length-inverse, anchored at M(43 cm) = 0.35–0.5 | Sim full M = 0.62·clamp((L/43)^−0.87, 0.5, 3) | Sim background (× 0.5) |
|---|---|---|---|---|---|
| 8 cm (2.2 g) | 2.4 | — | 1.9–2.7 | 1.86 (clamped) | 0.93 |
| 10 cm (4.6 g) | 1.9 | 3.3 | 1.5–2.2 | 1.86 (clamped) | 0.93 |
| 15 cm (17 g) | 1.3 | — | 1.0–1.4 | 1.55 | 0.78 |
| 20 cm (43 g) | 1.0 | 1.2 | 0.75–1.1 | 1.21 | 0.60 |
| 25 cm (88 g) | 0.85 | — | 0.6–0.86 | 0.99 | 0.50 |
| 30 cm (162 g) | 0.69 | 0.64 | 0.5–0.72 | 0.85 | 0.42 |
| 43 cm (521 g) | 0.50 | 0.37 | 0.35–0.5 | 0.62 | 0.31 |

- The sim's **full** M curve sits ~10–25 % above the central estimators.
- Its **background half** is below every estimator's total.

### By age: recommended targets [inf]
These rest on the table above, the pike and grass pickerel surrogates in the earlier note (Windermere M 0.30–0.42; Minnesota A 0.48 with exploitation 0.10; grass pickerel female A 26–46 %), and Maine's light harvest.

| Stage (Maine) | Length | Annual survival S | Z (/yr) |
|---|---|---|---|
| Age-0, fall → age-1, fall (first winter + second summer) | 10–13 → 15–20 cm | **0.35–0.55** | 0.6–1.05 |
| Age-1 → age-2 | ~15–20 → 20–27 cm | **0.40–0.50** | 0.7–0.9 |
| Age-2 → age-3 | ~20–27 → 27–34 cm | **0.50–0.60** | 0.5–0.7 |
| Age-3+ (maturing and adult, ≥ 33 cm) | 33–60 cm | **0.55–0.70** | 0.35–0.6 |

**Winter.** Pickerel feed under ice, and no winterkill is known in these lakes. Overwinter (Dec–Apr) loss of fish ≥ 10 cm should be small: **≤ 10–25 %** of the year's deaths in fish past their first summer [inf].

---

## Q2. First-year survival

### Egg → swim-up
- **Pike, Main Lake gravel pit (17 ha, little vegetation), Buckinghamshire** (Wright & Shoesmith 1988, *J. Fish Biol.* 33:623–636 [abstract][EU]; [GWCT record](https://gwct.org.uk/research/scientific-publications/1980-89/1988/wright1988a/)):
  - Eggs were clumped at **14–671 eggs/m²** on sand and silt, with a maximum of 729/m² on flooded grass.
  - Egg losses were **9–10 % per day**.
  - **Survival from stage-1 egg to fry was 3–6 %.**
  - Hatching success:
    - 1986: 11 % on sand and silt vs **2.5 % on aquatic plants**;
    - 1987: 18.9 % on undisturbed vs 7.9 % on disturbed sand and silt.
  - Population fecundity was 10.6 M eggs (1986) and 6.4 M (1987).
- **Grass pickerel, hatchery jars** (Kleinert & Mraz 1966 [primary][MW]):
  - Hatching was **9.7, 21.9 and 21.9 %** in three lots, with fry appearing 11–15 days after fertilisation at 46–48 °F.
  - In the wild, development from fertilisation to feeding took **2–5 weeks** at 34–65 °F. The young begin feeding at 10 mm.
- **Chain pickerel:** no egg-survival estimate found.
  - Incubation is 6–12 days. Eggs are broadcast over vegetation with no care (earlier notes).
- **Target:** egg → swim-up **≈ 5–15 %** (a central 8–10 %) [inf]. The sim's `sHatch` 0.05 is at the low end; that is defensible but conservative.

### Swim-up → end of the first summer
- **Pike yolk-sac fry stocked in experimental ponds** (Wright 1988, PhD thesis, Univ. Buckingham [abstract][EU]; [GWCT record](https://gwct.org.uk/research/scientific-publications/1980-89/1988/wright1988/)):
  - Fry stocked at **0.74–81.4 per m²** had **0.059–11.25 % survival by December**.
  - **Mortality peaked May–July.**
  - Yolk-sac fry showed density-dependent cannibalism in aquaria.
  - Age-0 survival was higher in the small, densely vegetated lake (St Peters, 2 ha) than in the exposed, plant-poor Main Lake in both 1986 and 1987. Main Lake's variable recruitment was put down mainly to too little vegetation for spawning and cover.
- **Grass pickerel, Pleasant Lake** [primary][MW]:
  - Fall shocker catches of young of the year were **178, 205, 42 and 78** fish in 1962–65.
  - The 1964 and 1965 year classes partly failed. Falling water levels cut the slough nursery off from the lake by early July, and the stranded fingerlings died as it dried. The rest died in winter oxygen depletion.
  - **Nursery-area loss gave a 3–4× drop in year-class size.** A fall population estimate's numbers swung 4-fold over the 4 years.
- **The sim's background rates on a Maine growth path [inf].** I ran the 3-D sim's YOY hazard: `FRY.M_LARVA`/L while L < 2 cm, `M_JUV` with its density factor and Q10, plus 0.5·M·(L/43)^−0.87 ≤ 30. The path: swim-up 15 May at 1 cm, 3 cm on 8 Jun, 8 cm on 15 Jul, 12 cm on 20 Sep. Survival from background alone:

  | Juvenile density factor | `M_JUV_B` | 3 cm | 8 cm | 12 cm (Sep) | Next spring |
  |---|---|---|---|---|---|
  | 1 | 0 | 40 % | 9.2 % | 0.8 % | 0.1 % |
  | 1 | 0.87 | 32 % | 9.3 % | 2.8 % | 0.9 % |
  | 0.5 | 0.87 | 42 % | 20 % | 10 % | 4.3 % |

  The sim's recruits reach 8 cm in late summer, later than this path. Each extra week at small size costs ~15–25 % at these rates. The observed 0.3 % to 8 cm must therefore come from slower growth, predation, or both.
- **Target [inf, §6]:** swim-up → fall (10–12 cm) **≈ 1–2 %** at the stock's equilibrium density, and higher when the stock is sparse (Q2 density-dependence below).
  - **Larval weeks (swim-up to ~3 cm, ~3–4 weeks):** Z ≈ 0.06–0.12/day, giving 10–25 % survival.
  - **Juvenile weeks (3 cm to fall, ~14–16 weeks):** Z ≈ 0.012–0.025/day, giving 5–20 % survival.
  - Because Z falls as the fish grow, the size-scaled `M_JUV_B` ≈ 0.87–1 suits a fast-growing young piscivore.

### First fall → age-1
- No esocid estimate was read this session; the Windermere and Minnesota sources are open leads (§7).
- The sim's own perch calibration takes the cold-water juvenile rate down ~10× (`M_JUV_Q10` 3; ~40–50 % lost over a first winter, Neuswanger et al. 2015 for centrarchids).
- A 10–13-cm pickerel that feeds under ice should do better than a 3–5-cm perch or sunfish.
- **Target [inf]: overwinter (Nov → mid-May) survival of 10–13-cm age-0 pickerel ≈ 0.6–0.8.**

### YOY density in fall
- No chain pickerel estimate was found.
- **Grass pickerel:** Carbine & Applegate (1948) recovered 369 grass pickerel by rotenone from a 14.8-acre (6 ha) Michigan lake, which is **24.9/acre (61.5/ha)**, **81.2 % young of the year**. That is **~50 YOY/ha** in fall against ~12/ha older fish [secondary, via Kleinert & Mraz 1966].
- Eschmeyer & Clark (1939) found **101 and 111 pickerel/acre (250–275/ha)** in two Michigan ponds [secondary, same].
- Pleasant Lake's young of the year were concentrated in the 15-acre (6 ha) vegetated East Bay and slough: **95.8 %** of fish < 7 in came from there in 1963. In the high-water falls, density in the bay was "at least four times greater" than in the low-water falls [primary].
- **Scaled to Hot Brook [inf].** The lakes' young of the year will sit in the weedy littoral, not spread over 643 ha. ~8,000 fall YOY over ~150–250 ha of weedy shallows is ~30–55/ha there, the same order as Carbine & Applegate's ~50/ha.

### Weed cover's effect
- **Pike:** age-0 survival was higher in the densely vegetated lake. The plant-poor lake's recruitment varied and was poor, with lack of vegetation for spawning and predator cover blamed (Wright 1988 [abstract]).
- **Grass pickerel:** young of the year stay in the vegetated nursery "the first summer of life, showing little dispersal". Year-class strength fell 3–4× when the vegetated nursery dried (Kleinert & Mraz 1966 [primary]).
- **Earlier note:** small-pike biomass is capped by vegetation through intraspecific predation (Grimm 1981 [snippet]). Large pike held structure and pushed small pike out (Skov & Koed 2004 [secondary]).
- **Maine:** largemouth bass prey on young-of-year pickerel in weed patches (MDIFW, earlier notes). Hot Brook has smallmouth, which use weeds less.
- **For the sim [inf]:** the refuge young pickerel get from weeds should be strong (`COVER.REFUGE`) against both cannibals and bass. Year-class size should scale with weedy-shallow nursery area (more than with egg numbers once eggs are plentiful).

### Cannibalism's share
- **Grass pickerel, Pleasant Lake** [primary]:
  - **7 of 351 young of the year < 112 mm (2.0 %)** had eaten pickerel.
  - No adult stomach held a pickerel.
  - The most dramatic case was a 37-mm fingerling with 13 pickerel fry (6.5–11.5 mm) in its stomach in late April: early fry-on-fry cannibalism within the nursery.
  - Crossman (1962, Ontario) found **9 cases in 387 stomachs**, all between 18 June and 20 August, not in the spring [secondary].
- **Converting the stomach share to a mortality share [inf].** With 2 % of stomachs holding a pickerel, a digestion time of ~1 day at summer temperatures, and the number of young-of-year cannibals ~10–50× the number of victims they need, cannibalism can plausibly remove **~0.5–2 %/day of the smallest fry** in the first weeks, but well under ~0.5 %/day later. That is a modest share (~10–30 %) of age-0 deaths after swim-up.
- **Pike:**
  - Cannibalism regulates mainly through young of the year and age-1 (Kipling & Frost 1970; Persson et al. 2004; earlier note).
  - In tanks, cannibals caused 54–96 % of daily deaths (Giles et al. 1986).
  - In unconfined fry, only 1–2 % turned cannibal (earlier note).
  - Crowded, cover-poor ponds (Wright 1988; Bry et al. 1992) are the high end.
- **Earlier note's adult finding:** the cannibal:victim size limit (victim ≤ ~0.5–0.55 of cannibal length) keeps adult-on-adult cannibalism near zero.
- **Target [inf]:**
  - **cannibalism ≈ 10–30 % of age-0 mortality after swim-up;**
  - **≈ 10–30 % of age-1 mortality;**
  - **≤ 10–20 % for fish ≥ 20 cm.**
- In a population with plenty of other prey, cannibalism should be **density-dependent**: rising steeply in a strong year class, which is where it regulates.

### Density-dependence (for the sim's juvenile compensation)
- Wright's ponds span a 110-fold range of stocked fry density (0.74–81 per m²) and a ~190-fold range of survival (0.06–11 %) [abstract]. The abstract does not say which end matched which density. In pike culture the usual pattern is lower survival at higher density, which would match strong compensation.
- Grass pickerel biomass varied less than numbers: 3-fold vs 4-fold over 4 years [primary]. That is consistent with compensatory growth or survival at low density.
- Pike's maximum annual reproductive rate is **1.66** spawners per spawner per year (Myers et al. 1999 via Froese & Luna 2004, already in `recruitment_compensation_maturity.md`).
  - With adult S 0.6, the lifetime rate is ~4.2 and the Beverton–Holt **steepness ≈ 0.5** [inf].
  - That means moderate compensation: recruits roughly halve when spawners fall to ~20 % of unfished.
  - The sim's `JUV_DREF`/`JUV_D50` form is suitable. The pickerel's compensation should not be *weaker* than this.

---

## Q3. Size at the end of the first summer, and YOY growth

| Source | Place | Value | Tag |
|---|---|---|---|
| MDIFW Chain Pickerel Assessment | Maine | **4–5 in (10–13 cm) at the end of the first growing season (Sep–Oct)**; diet mostly fish only after 7–9 in | [primary, earlier notes][N] |
| Kleinert & Mraz 1966: grass pickerel, Pleasant Lake, WI | lake | last week of May: **33.0, 33.5 and 28.0 mm** (1963–65); mid-September: **132.5, 122.5 and 126.0 mm** | [primary][MW] |
| same | Delafield ponds | first week of September: **152.5 mm** (1963), **145.0 mm** (1964) | [primary][MW] |
| same | Pleasant Lake, early Oct 1962 scale sample | mean TL **5.3 in (135 mm) at age 0**, 7.8 in at I, 9.8 in at II | [primary][MW] |
| Underhill 1949, New York, via ADW | — | ~18 cm at age 1; growth varies a lot between years | [secondary][N] |
| NJ lakes 1990–95 (NJDFW) | — | age-I mean 157 mm (back-calculated) | [secondary, earlier notes][N] |
| Hatching length | — | grass pickerel 5–6 mm at hatching, feeding by 10 mm; chain pickerel hatch 5.6 mm (4.2–7.0), ~10 mm when feeding starts | [primary][MW]; [earlier notes] |

**Growth rate [inf].**
- Grass pickerel: ~30 mm in late May to ~125–130 mm in mid-September is **~0.85–0.9 mm/day**.
- Maine chain pickerel: ~10 mm at first feeding in mid/late May to 100–130 mm by late September (~125 days) is **~0.7–1.0 mm/day**, faster in July and August.
- A Maine fish should pass 8 cm around early to mid-August, which matches the sim's late-summer recruits.

**Spring and fall cohorts.** Grass pickerel also hatch some young in the fall, seen as large "fall-hatched" fingerlings in May (Kleinert & Mraz [primary]). A secondary fall spawning of chain pickerel is reported from Pennsylvania (earlier notes). This can be ignored for Maine.

---

## Q4. Fecundity and spawning

- **Maine:** **10,000–12,000 eggs/lb** (~22–26.5 eggs/g); mature at age 3–4 and 33–41 cm; ~1.3 females per male (MDIFW, earlier notes).
  - This gives ~9,000–11,000 eggs at 40 cm and ~19,000–22,000 at 50 cm [earlier notes, inf].
  - The sim's `fec` gives ~12,500 at 43 cm, which is consistent.
- **Ontario:** 6,102–29,928 eggs (earlier notes).
- **Florida, Lake Conway:** mean **1,232 eggs per female**; the youngest spawners were age 2; spawning December–February; F:M ratio 1.1:1 (Guillory 1981, [SEAFWA abstract](https://d11.seafwa.org/journal/1981/reproductive-biology-chain-pickerel-lake-conway-florida) [abstract][S]). A small-bodied southern population; not for Maine.
- **Pike relative fecundity:** **17.6 and 19.4 eggs/g** in two English lakes (Wright & Shoesmith 1988 [abstract]). Chain pickerel's ~24/g fits a smaller-egged congener.
- **Grass pickerel:** 625–4,584 mature eggs per female at 6.3–12.8 in. The ovaries also hold immature eggs (~20 % of ovary volume) (Kleinert & Mraz [primary]).
- **Fraction of females spawning each year.**
  - No chain pickerel figure exists.
  - Pike in the Tresna Reservoir, Poland: **25 % of 20 females did not spawn**, and their eggs were being resorbed [snippet; Epler et al., *Acta Ichthyol. Piscat.* 16(2)].
  - Pike in a Labrador reservoir: "all pike did not spawn each year", with no percentage [snippet].
  - **Assume 0.9–1.0 for a well-fed Maine population.** Make skipping condition-dependent (the sim's `K_RESORB` gonad resorption already does this) rather than a fixed share.
- **Egg survival:** see Q2. Pike: 9–10 %/day egg loss and 3–6 % stage-1-to-fry. Hatching on plants was **2.5 %** vs 11 % on sand and silt in one year.

---

## Q5. Density, biomass and year-to-year stability

- **Chain pickerel:** no fish/ha or kg/ha estimate was found this session. The open leads (Carlander 1969 standing-crop compilation; rotenone surveys) are in §7.
  - Maine says pickerel keep "moderate to high density" wherever shallow weedy habitat exists (MDIFW).
- **Grass pickerel, Pleasant Lake, WI** (Kleinert & Mraz 1966, Table 3 [primary][MW]):
  - The lake is 138 acres = 56 ha (max 32 ft, mean 15 ft), with a 15-acre weedy east bay and slough.
  - Fall Schnabel estimates for 1962–65:
    - fish: **5,419; 3,121; 1,300; 1,240**, i.e. **39.3, 22.6, 9.4 and 9.0 per acre = 97, 56, 23 and 22 per ha**;
    - biomass: **483, 276, 152 and 193 lb**, i.e. **3.5, 2.0, 1.1 and 1.4 lb/acre = 3.9, 2.2, 1.2 and 1.6 kg/ha**.
  - The estimates include fall young of the year but under-sample them; shocking could not reach water < 2 ft or dense weeds.
  - **Stability:** numbers varied **4.4-fold** and biomass **3.2-fold** in 4 years. The fall from 1963 to 1964 came from **the poor 1964 year class** (drought stranding in the nursery).
  - Fall electrofishing in seven southeastern Wisconsin lakes gave 3.3–73.5 pickerel/h, averaging 17.8/h.
- **For comparison:** CT DEEP chain pickerel CPUE runs 1–45/h, and the best lakes 50–90/h (earlier note). NY's Stoney Pond gave **31/h** (range 20–48), with fish of 11–19 in ([NY DEC 2017](https://extapps.dec.ny.gov/docs/fish_marine_pdf/r7stonponr.pdf) [primary][N]).
- **For Hot Brook [inf].**
  - Chain pickerel are about 3–4× heavier at a given age than grass pickerel and longer-lived, so expect fewer fish per ha but similar or higher kg/ha.
  - **~15–40 fish ≥ 8 cm per ha and ~2–6 kg/ha** across the whole lake area is a reasonable band; the weedy littoral would hold several times the lake-wide mean.
  - The sim's ~25/ha (~2–3 kg/ha) sits inside it.
  - **Expect year-class strength, and with it ≥ 8-cm numbers, to swing ~2–4× over a few years**, driven by spring water level and nursery-weed conditions. Biomass swings less.

---

## Q6. How the numbers fit together: the replacement arithmetic [inf]

### Life table
**Assumptions:**
- Maine growth: 10–13 cm after season 1, then +6.4–8.9 cm/yr, slowing. That gives spring lengths at ages 1–9 of 12, 19, 27, 34, 42, 47, 51, 54 and 56 cm.
- A logistic maturity curve with 50 % at 37 cm.
- Ws weight; 24 eggs/g; 56.5 % females (1.3:1); all mature females spawn; tmax 9.
- Survival from spring age-1 onward: S1 (age 1→2), S2 (2→3), then S_ad.

The script is in the session scratchpad (`life.mjs`); the numbers below are its output.

| S1 | S2 | S_ad | Eggs per age-1 recruit | Egg → age-1 for replacement | Swim-up → age-1, if egg → swim-up = 5 % | … if 10 % |
|---|---|---|---|---|---|---|
| 0.35 | 0.50 | 0.60 | **1,391** | **0.072 %** | **1.44 %** | 0.72 % |
| 0.35 | 0.50 | 0.50 | 768 | 0.130 % | 2.61 % | 1.30 % |
| 0.35 | 0.50 | 0.70 | 2,416 | 0.041 % | 0.83 % | 0.41 % |
| 0.40 | 0.55 | 0.65 | 2,316 | 0.043 % | 0.86 % | 0.43 % |
| 0.30 | 0.45 | 0.55 | 802 | 0.125 % | 2.49 % | 1.25 % |

With the sim's own growth curve (vB L∞ 65, k 0.2, t0 −0.47; faster early growth), eggs per recruit are ~25 % higher: 1,772 at 0.35/0.50/0.60.

**Worked example (central case).**
- A female reaching age 1 has survivorships 1, 0.35, 0.175, 0.105, 0.063, 0.038, 0.023, 0.014 and 0.008 at ages 1–9.
- Eggs laid at ages 4–9:
  - age 4: 0.105 × 0.18 mature × 5,831 = 110;
  - age 5: 0.063 × 0.90 × 11,130 = 631;
  - age 6: 0.038 × 16,664 = 630;
  - age 7: 0.023 × 21,718 = 493;
  - age 8: 0.014 × 26,141 = 356;
  - age 9: 0.008 × 29,414 = 241.
- The sum, 2,461, × 0.565 females = **1,391 eggs per age-1 recruit**.
- For replacement, the egg → age-1 survival must be **1/1,391 = 0.072 %**.
- Split by stage:
  - egg → swim-up 8 % → **swim-up → age-1 0.9 %**;
  - overwinter 0.65 → **swim-up → first fall ≈ 1.4 %**.

### The ≥ 7.5-cm stock it implies
Censused in late summer, with S0 (age-0 fall → age-1 fall) = 0.5 and the central S1/S2/S_ad above:
- **Numbers per fall recruit by age 0–9:** 1, 0.50, 0.175, 0.087, 0.052, 0.032, 0.019, 0.011, 0.007, 0.004.
  - The total is **1.89 fish per fall recruit**.
  - The stock loses **53 %/yr**; the age-1+ part alone loses **56 %/yr**.
  - The range across the other survival sets is **45–61 %/yr**.
- **Recruits needed:** holding 16,000 fish ≥ 7.5 cm needs **16,000 / 1.89 ≈ 8,500 fall recruits a year**, or ~7,300–9,800 across the survival sets. The sim makes ~2,500: **3–4× short**.
- **Eggs that stock lays:** ~4,250 age-1 recruits × 1,391–1,772 eggs = **5.9–7.5 M eggs**.
  - At 5 % hatch that is 0.30–0.38 M swim-ups; at 10 % it is 0.6–0.75 M.
  - The sim's 0.8 M swim-ups are at or above that. **Egg supply is not the limit. Survival after swim-up is.**
- **Survival needed:** 8,500 / 0.8 M ≈ **1.1 %** from swim-up to the fall recruit size. The sim has 0.3 %.
  - At a stock nearer equilibrium (fewer spawners than the sim's starting stock), density compensation should lift it towards ~1.5–2.5 %.

### Where the sim's 70 % comes from
- Cannibalism takes ~5,000 of 16,000 fish ≥ 7.5 cm (31 %), mostly fish < 20 cm.
- If ~60 % of the stock is < 20 cm (the fall census above has ~70 % at ages 0–1), cannibalism alone takes **~50 %/yr of the small fish**.
- With their background hazard of ~0.8–0.93/yr (55–60 %/yr by itself), the < 20-cm fish lose **~75–85 %/yr** (S ≈ 0.15–0.25), where the target is S ≈ 0.35–0.55.
- Of the two causes, **the cannibalism is the anomaly**. The background rates sit at or below the size-scaled totals in Q1.

---

## 6b. Helper findings: mortality, density and stability (added after the helper reported)

### Chain pickerel mortality
- **Still no direct estimate.**
  - The key paper is **Saila 1956**, *Limnol. Oceanogr.* 1:195–201. It estimated mortality from age frequencies in an unexploited and an exploited Rhode Island pond. It is **blocked** (Wiley 403; [page](https://aslopubs.onlinelibrary.wiley.com/doi/10.4319/lo.1956.1.3.0195)). Its unexploited-pond Z would be natural M, so it is the paper to get by library.
- **Then et al. 2015 growth estimator on the FishBase vB rows** [primary rows; derived (helper)]:
  - **M = 0.41** for Massachusetts males;
  - 0.24 for Massachusetts females;
  - 0.31 for Rhode Island;
  - 0.35 for Quabbin;
  - 0.27 for Hopatcong.
  - That is adult A ≈ 0.21–0.34. ([FishBase growth list](https://www.fishbase.se/popdyn/PopGrowthList.php?ID=2712))
- **Crude catch curve, Nova Scotia** (Mitchell et al.; 17 fish aged by length):
  - Ages 2–6 numbered 6, 4, 4, 2 and 1 fish.
  - Chapman–Robson gives **S ≈ 0.58 (A 0.42, Z 0.55)** [primary data; derived (helper); weak: n = 17, introduced population]. ([PDF](https://novascotia.ca/fish/documents/special-management-areas-reports/impact-chain-pickerel.pdf))
- **Maine harvest** (MDIFW 1999 [primary]):
  - ~0.40 fish/acre/yr (**~1.0 fish/ha/yr**, ~0.54 kg/ha/yr) kept;
  - 79 % of the winter catch and 94 % of the summer catch released.

### Northern pike survival, lightly fished (fallback)
| Population | Survival / mortality | Tag |
|---|---|---|
| **Savanne Lake, Ontario**: 364 ha, mean depth 2.6 m, unexploited before study (**a close size and depth analog of Hot Brook**) | mature pike (age 4–14, > 45 cm) **6.9–7.2/ha**; ages 4–12 **8.69 kg/ha**; production 2.76 kg/ha/yr; P/B ≈ 0.32, implying Z ≈ 0.3 at steady state (derived). Later netting: female A (5+) **17, 45 and 35 %** in 1997, 2001 and 2002 | [abstract] [Mosindy 1981 thesis](https://knowledgecommons.lakeheadu.ca/items/4cf197bd-3d4b-44b7-a11b-2bb99017d200); [primary] FWIN below |
| **Ontario FWIN**: 434 lakes, 1993–2002, mostly lightly fished; Robson–Chapman, age 5+ | female A **mean 36 %, median 35 %, 5–95 % range 18–58 %** (n = 223); male A **mean 51 %** (27–80 %) | [primary] [Malette & Morgan 2005](https://laurentian.ca/assets/files/Living-With-Lakes/Reports/Provincial-Northern-Pike-Life-History-Parameters.pdf) |
| **Windermere**, pike > 55 cm, natural survival (culls accounted for) | annual S ≈ **0.63** (A 0.37), ≈ 0.69 for the better sex, at mean density. Survival **falls steeply with the density of age 3–9 pike** (logit slope −1.40 per SD in the south basin) | [primary] [Haugen et al. 2006](https://people.bu.edu/msoren/Haugen.pdf); derived (helper) |
| Murphy Flowage, Wisconsin, 1955–69 | natural mortality without angling **60 %**; total 66 % (47–90 %) | [snippet] |
| Bucks Lake, Wisconsin (stunted) | A 64 % (35–84 %) | [snippet] |
| Minnesota shallow bog lake (NAJFM 23:323) | age 2+ density 59/ha; A 63 %, mostly natural | [snippet] |
| Niobrara stream, Nebraska (introduced, unfished) | A 42 % (36–48), ages 0–8; recruitment "extremely stable" | [snippet] |

**Reading [inf].**
- Lightly fished adult pike lose ~35–40 %/yr (females) to ~50 % (males). The higher figures, 60–64 %, come from stunted, crowded waters.
- Survival is density-dependent among adults too (Windermere).
- This supports adult S 0.55–0.70 for pickerel; the pickerel is shorter-lived, so its S should sit at the lower half.

### Pike first-year survival (fallback)
- **Stage survival, pike** (Dahlberg 1979 review, *Mar. Fish. Rev.* 41(3) [primary]; [PDF](https://spo.nmfs.noaa.gov/sites/default/files/pdf-content/MFR/mfr413/mfr4131.pdf)):
  - eggs **0.18** over 13 days;
  - yolk-sac larvae **0.57** over 8 days;
  - post-larvae **0.29** over 22 days;
  - overall **~0.03 from egg to day 43**.
  - Also cited there [secondary]:
    - egg survival on vegetation 60–95 % (Franklin & Smith 1963);
    - 77 % egg viability, but only 16–19 % reaching yolk-sac larvae in a regulated marsh (Forney 1968).
  - **Derived:** feeding post-larvae Z ≈ −ln(0.29)/22 ≈ **0.056/day**. That is the low end of the larval Z range in §Q2, and the sim's larval target can sit at ~0.06–0.10/day.
- **Pike, English gravel pits** (Wright 1990 [abstract]; [GWCT](https://gwct.org.uk/research/scientific-publications/1990-99/1990/wright1990a/)):
  - survival from potential egg deposition to November was **0.00175 %** (Main Lake, little vegetation) and **0.00315 %** (St Peter's, weedy);
  - pike age ≥ 1 were 7.7 and 71/ha;
  - age-0 production was 6.6 and 23/ha.
  - **Why this is ~20–40× below the pickerel replacement figure [inf].** Pike carry 50,000–200,000 eggs per female and live long, so they need far less egg → age-1 survival (~10^−5) than the pickerel's ~7 × 10^−4 (§6).
  - The ratio between the lakes (weedy ≈ 1.8× the egg → November survival, and ~3.5× the age-0 production per ha) is the transferable part: **weed cover roughly doubles first-year survival**.

### Chain pickerel density and biomass (rotenone, southern lakes)
| Lake | Method | Density | Biomass | Tag |
|---|---|---|---|---|
| **Lake Tohopekaliga, Florida** (9,180 ha, ≤ 4.6 m), littoral, 1970–73 | 1-acre block-net rotenone, all sizes | **5.7–22/ha** (spring 1970: 22; the 1971–73 post-drawdown minimum: 5.7) | **3.0–17.3 kg/ha**; mean fish 0.79 kg | [primary] [Wegener](https://seafwa.org/sites/default/files/journal-articles/WEGENER-144.pdf) |
| same, open water | — | 0.25–3.0/ha | 0.4–3.5 kg/ha | [primary] |
| same, lake-wide spring 1970 | area-weighted | **~10.6/ha** | **~9.0 kg/ha** | derived (helper) |
| **Lake Ellis Simon, North Carolina** (607 ha), shallow littoral plots 0.6–0.9 m | 0.32 ha of rotenone plots | **91–100/ha** (mean 46 g; mostly juveniles) | 4.2–6.9 kg/ha | [primary] [Hulsh](https://seafwa.org/sites/default/files/journal-articles/HULSH-287-296.pdf) |
| West Point Reservoir, AL–GA (new reservoir) | cove rotenone | 20 → 2 → 0/ha (1975–77) | 1.4 → 0.5 kg/ha | [primary]; poor analog |

**Reading [inf].**
- Littoral densities of 6–100/ha and 3–17 kg/ha bracket the sim's ~25/ha.
- Lake-wide biomass is ~2–9 kg/ha, depending on how much of the lake is weedy littoral.
- The sim's ~2–3 kg/ha is at the low end; a more realistic size structure (more fish ≥ 35 cm) would raise it.

### Year-to-year stability
| Series | Years | CV | Tag |
|---|---|---|---|
| **Okefenokee Swamp, Georgia**, winter electrofishing CPUE (6.2, 2.5, 5.5, 10.5, 2.8, 1.6, 5.5, 6.8, 7.2, 3.7 /h) | 1992–2001 | **51 %** year to year (103 % between sites); called stable | [primary] [Herrington](https://seafwa.org/sites/default/files/journal-articles/Herrington-150-161.pdf) |
| **Hooksett Pool, Merrimack River, New Hampshire**, fish per 1,000 ft of shore | 11 years, 1972–2013 | 70 % (51 % without 1972; 49 % for 2010–13); no significant trend; small catches | [primary] Normandeau 2017 ([EPA docket PDF](https://yosemite.epa.gov/oa/eab_web_docket.nsf/Attachments%20By%20ParentFilingId/E7149AB7652CD9618525861C00415958/$FILE/44_AR-1551%20(Normandeau%202012-2013).pdf)) |
| Lake Tohopekaliga, littoral fall density (4.9, 2.9, 4.6, 6.3 /acre) | 1970–73 | ~30 % | [primary] |
| Ontario pike, catch per net | French R. 7 yr; Nipissing 5 yr | 38–40 % | [primary] FWIN |
| Grass pickerel, Pleasant Lake, fall Schnabel estimate | 1962–65 | 4.4-fold range | [primary] (Q5) |

**Reading [inf].** The year-to-year CV of a stable esocid population's abundance index is **~40–50 %**, which includes sampling noise. True ≥ 8-cm abundance probably varies ±25–40 %, with occasional 2–4× swings after a failed or strong year class.

---

## 7. Open leads (not reached or not verified this session)
- **Saila 1956** (Rhode Island ponds, unexploited-pond Z; Wiley 403): the most direct chain pickerel mortality estimate known to exist.

**First-year survival.**
- Franklin & Smith 1963, *TAFS* 92 (Minnesota marsh, egg → fingerling).
- Forney 1968, *NY Fish & Game J.* 15 (pike in a regulated marsh by Oneida Lake).
- Hunt & Carbine 1951, *TAFS* 80 (Houghton Lake).
- Grimm 1981 and Grimm & Klinge 1996 (age-0 pike per ha of vegetation).
- Skov et al. (age-0 pike stocking in Danish lakes).
- Haugen et al. 2007 and Edeline et al. 2008 (Windermere survival by size and density).
- Langangen et al. 2011 (Windermere stock–recruitment).
- These are where a direct esocid **swim-up → fall** and **fall → age-1** survival with densities would come from.

**Chain pickerel mortality and density.**
- Carlander 1969, *Handbook of Freshwater Fishery Biology* vol. 1 (standing crops and age compositions).
- Southeastern reservoir rotenone data.
- Virginia, Georgia and Florida catch curves.
- NS mercury-project age data ([NS 2021 progress report](https://novascotia.ca/fish/documents/2021-ffrc-chain-pickerel-mercury-accumulation-project.pdf), not opened).
- Underhill 1949 and Foote & Blake 1945, *J. Wildl. Manage.* (JSTOR; not attempted).
- Coffie 1998, *Can. Field-Nat.* 112 (BHL 403).

---

## For the sim

**1. Annual survival targets** (lightly fished Maine population; total, all causes):

| Stage | Length | S | Z (/yr) |
|---|---|---|---|
| Age-0, fall → age-1, fall | 10–13 → 15–20 cm | **0.35–0.55** (centre 0.45) | 0.6–1.05 |
| Age-1 | ~15–20 cm | **0.40–0.50** | 0.7–0.9 |
| Age-2 | ~20–27 cm | **0.50–0.60** | 0.5–0.7 |
| Adults | ≥ 33 cm | **0.55–0.70** (centre 0.62) | 0.35–0.6 |

- The whole ≥ 7.5-cm stock (late-summer census, young of the year included) should lose **~45–60 %/yr**, not ~70 %.
- At the current stock it needs **~7,000–9,000 fall recruits a year**.

**2. Young-of-year survival targets:**
- **Egg → swim-up:** 5–15 %. `sHatch` 0.05 is acceptable but at the low end; 0.08–0.10 is more central.
- **Swim-up → first fall (8–12 cm, Aug–Sep): ≈ 1–2 %** at equilibrium density, up to ~3–5 % when the stock is sparse. The sim's 0.3 % is 3–6× too low.
  - Larval weeks (to ~3 cm): Z ≈ 0.06–0.12/day.
  - Juveniles (3 cm → fall): Z ≈ 0.012–0.025/day, falling with size. A size-scaled `M_JUV_B` of ~0.87–1 is appropriate for the pickerel. At B = 0 the juvenile rate holds at the 4-cm perch value all the way to 12 cm, and the model gives 0.8 % by September (2.8 % with B = 0.87).
- **First fall → age-1 (spring, ~12 cm): ≈ 0.6–0.8.**
- **Egg → age-1 for replacement:** ~0.04–0.13 %, central **0.07 %** (1 in ~1,400 eggs).

**3. Cannibalism's share:**
- **≈ 10–30 % of age-0 deaths after swim-up.** It is concentrated in the nursery in the first 4–8 weeks (fry on fry) and density-dependent, so strong year classes cannibalise themselves.
- **≈ 10–30 % of age-1 deaths.**
- **≤ 10–20 % for fish ≥ 20 cm.**
- In the field, 2 % of young-of-year stomachs held a pickerel and no adult stomach did (grass pickerel).
- The sim's cannibalism (~5,000/yr, ~45 % of all deaths of fish ≥ 7.5 cm, and roughly half of all fish < 20 cm each year) is **2–4× too high**.
- Levers: the victim:cannibal length cap (≤ 0.5–0.55, from the earlier note), a strong weed refuge for fish < 20 cm, and cannibals preferring other prey when it is available.

**4. Background (non-simulated) mortality to keep, with predation and starvation simulated:**
- **Adults (≥ 33 cm): ~0.25–0.4/yr.** This is birds (bald eagle, osprey, heron), otter and mink, disease, post-spawn loss, and angling (F ≈ 0.03–0.05).
- **20–30 cm: ~0.35–0.6/yr.** Little fish predation is expected on these, so most of their M is non-simulated.
- **8–20 cm: ~0.5–0.9/yr.** About half of these fish's real M is predation, which the sim simulates.
- The current 0.5 × 0.62 × (L/43)^−0.87 gives **0.31 at 43 cm, 0.42 at 30 cm, 0.50 at 25 cm, 0.60 at 20 cm, 0.78 at 15 cm and 0.93 at ≤ 10 cm**. **That is inside these bands at every size.**

**5. Is 0.5 × M with the size factor too high for 20–30-cm pickerel?**
- **No, not by itself.** 0.42–0.60/yr is within the non-simulated band. The size-scaled total M for 20–30 cm is 0.6–1.1 (Lorenzen, Charnov, length-inverse), and real fish predation on fish this size is a small share of it.
- It would become too high only if the sim's emergent predation on 20–30-cm fish stays large. Total Z for 20–30 cm should end near **0.5–0.8/yr**, so emergent predation plus starvation there should stay **≤ ~0.1–0.2/yr**.
- If a single knob is wanted: the sim's *full* M at Lref (0.62) is ~10–25 % above the central estimators. Moving `M` to ~0.5, or `M_OTHER` to ~0.4, for the pickerel trims the background ~20 %. That is a second-order fix.
- **The first-order fixes:**
  1. raise swim-up → fall survival ~3–4× (size-scaled juvenile M, density compensation, weed refuge);
  2. cut cannibalism on fish ≥ 8 cm 2–4×.

**6. What the result should look like:**
- a stable stock at ~15–40 fish ≥ 8 cm per ha (~2–9 kg/ha lake-wide; southern rotenone data in §6b);
- year-class strength varying 2–4× with spring nursery conditions;
- a length structure with a real tail of 35–48-cm fish (Maine anglers keep fish averaging 43 cm).
- Judge with the young-of-year fate audit and ≥ 3 seeds, per CLAUDE.md.

---

## Sources

**Read this session (new)**
- Kleinert, S.J. & D. Mraz (1966). *Life history of the grass pickerel (Esox americanus vermiculatus) in southeastern Wisconsin.* Wisconsin Conservation Dept. Tech. Bull. 37. [UW Libraries PDF](https://asset.library.wisc.edu/1711.dl/JPQYSFG3QCFOM87/E/file-789f9.pdf) — [primary][MW]. Covers Schnabel estimates, year classes, young-of-year growth, cannibalism, fecundity and hatching; it also cites Carbine & Applegate 1948, Eschmeyer & Clark 1939 and Crossman 1962 [secondary].
- Wright, R.M. & E.A. Shoesmith (1988). The reproductive success of pike, *Esox lucius*: aspects of fecundity, egg density and survival. *J. Fish Biol.* 33:623–636. [GWCT record](https://gwct.org.uk/research/scientific-publications/1980-89/1988/wright1988a/) — [abstract][EU]
- Wright, R.M. (1988). *The population biology and reproductive success of pike in gravel pit lakes.* PhD thesis, Univ. Buckingham. [GWCT record](https://gwct.org.uk/research/scientific-publications/1980-89/1988/wright1988/) — [abstract][EU]
- Guillory, V. (1981). Reproductive biology of chain pickerel in Lake Conway, Florida. *Proc. SEAFWA*: 585–591. [SEAFWA page](https://d11.seafwa.org/journal/1981/reproductive-biology-chain-pickerel-lake-conway-florida) — [abstract][S]
- NY DEC (2017). Stoney Pond fisheries survey. [PDF](https://extapps.dec.ny.gov/docs/fish_marine_pdf/r7stonponr.pdf) — [primary][N]
- Lorenzen, K. (2022). Size- and age-dependent natural mortality in fish populations… *Fish. Res.* 255:106454. [SEDAR copy](https://sedarweb.org/documents/sedar76rd13_size-and-age-dependent-natural-mortality-in-fish-populations-biology-models-implications-and-a-generalized-length-inverse-mortality-paradigm-pdf) — [abstract/snippet]
- Esocid hooking mortality (Minnesota DNR review, 4.5 %; family-level 14.9 ± 7.0 %) — [snippet]; search result: [lrl.mn.gov 970377](https://www.lrl.mn.gov/docs/pre2003/other/970377.pdf) (not opened)
- Pike skipped spawning: Epler et al., *Acta Ichthyol. Piscat.* 16(2) — [snippet]; [PDF link from search](https://www.infish.com.pl/wydawnictwo/Archives/Fasc/work_pdf/Vol16Fasc2/Vol16-Fasc2%20-%20w04.pdf) (not opened)
- ADW, *Esox niger* (Underhill 1949, age-1 18 cm) — [secondary] https://animaldiversity.org/accounts/Esox_niger/
- Ontario Freshwater Fishes Life History Database, chain pickerel — [secondary] https://www.ontariofishes.ca/fish_detail.php?FID=89

**From the earlier notes (not re-read):** MDIFW *Chain Pickerel Assessment* (Brokaw 2001 / Lucas 2008); NJDFW; PFBC 2018; CT DEEP 2018; Craig 2008; Persson et al. 2006; van Kooten et al. 2010; Pierce et al. 1995; Kipling & Frost 1970; Giles et al. 1986; Bry et al. 1992; Then et al. 2015; Lorenzen 1996; Myers et al. 1999 via Froese & Luna 2004. Links are in `pickerel_mortality_cannibalism.md`, `centrarchid_percid_esocid_parameters.md` and `recruitment_compensation_maturity.md`.

**Estimators used [inf]:** Charnov, Gislason, Pope & Andersen (2013), *Fish Fish.* 14:213 (M = K(L/L∞)^−1.5). Not re-read this session.
