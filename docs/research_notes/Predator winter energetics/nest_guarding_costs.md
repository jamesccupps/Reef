# Nest-guarding costs: smallmouth bass (largemouth as a check), pumpkinseed/bluegill, brown bullhead

**Why.** In the sim a guarding male smallmouth gets respiration × `BROOD.GUARD_METAB` 1.6 ("up to +60 %", Hinch & Collins 1991) and intake × `BROOD.GUARD_FEED` 0.2 for the whole ~29-day guard (`nestGuard: yr(0.08)`). It loses ~2 % of body energy a day, and ~14 % of adult bass starve in late June (hazard from K 0.78; 50 %/day at K 0.55). Real nesting males lose condition but are not reported to starve. These notes collect what the field data say.

Searched 2026-10-18.

**Source tags** (same as `predator_winter_energetics.md`):
- **[primary]:** full text read (lab/agency PDF or thesis).
- **[primary abstract]:** the author's abstract or synopsis, read from the publisher.
- **[via X]:** quoted by a secondary source; the primary was not read.
- **[snippet]:** seen only in a search-result summary.
- **[popular]:** agency/extension/encyclopedia page.
- **(derived):** my own calculation from numbers here or from the sim's FB4 row.

**Sources skipped (blocked; not worked around):**
- Taylor & Francis (Hinch & Collins 1991 full text): 403. The abstract was read on OUP's TAFS page instead.
- Wiley (Gillooly & Baylis 1999): 403.
- JEB / silverchair PDF (Zolderdo et al. 2016): 403. Its QUBS project-page abstract was used.
- maine.gov black bass plan PDF: 403. Only a search snippet was used.
- SFU Summit (a Coleman bluegill thesis): an Anubis bot check, so skipped.
- UMich Deep Blue (Blumer): 403.
- Springer: the abstract pages load after Springer's normal cookie redirect, which ends on a `?error=cookies_not_supported` page that shows the synopsis. That is the site's ordinary no-cookie fallback, not a bypass. Only synopses were read; no paywalled text.

---

## 1. Smallmouth bass

### 1a. How long males guard (northern lakes)

| Study / lake | Duration | Conditions | Tag |
|---|---|---|---|
| **Cooke, Philipp, Wahl & Weatherhead 2006**, Lake Opinicon, ON (44.5 °N) | **28.4 ± 2.2 d** (n = 13 radio-tagged; tracked until the fry dispersed, including care after the brood leaves the nest) | mean water 19.8 °C during care; males 364.5 mm TL, 691.5 g | [primary] — [Oecologia 148:235–249, PDF](https://www.fecpl.ca/wp-content/uploads/2006/07/Oecol-Cooke-et-al-2006.pdf) |
| Lake Opeongo, ON (45.7 °N): Ridgway 1988; Ridgway & Friesen 1992 | **19–45 d** range | — | [via Friesen & Ridgway 2000, primary PDF](https://www.harkness.ca/PDFs/Contributions%202000s/Friesen%20Ridgway%202000.pdf) |
| Steinhart et al. 2008, citing Ridgway & Friesen 1992 and Knotek & Orth 1998 | **17–43 d** total care; 14–43 d elsewhere in the same paper. Their model assumed 20 d to independence | — | [primary, Evol. Ecol. Res. 10:351–371](https://www.harkness.ca/PDFs/Contributions%202000s/SMB%20Optimal%20Parental%20Decisions.pdf) |
| **Cooke, Philipp & Weatherhead 2002**, Lake Opinicon | stages: **egg 3 d, egg-sac fry 2 d, swim-up 2 d, free-swimming fry 15 d** = 22 d monitored. Monitoring stopped before the fry dispersed | ~18 °C; 15 May – 9 Jun 1998 | [primary, Can. J. Zool. 80:756–770, PDF](https://www.fecpl.ca/wp-content/uploads/2002/05/EMG-Parental-Care-MS.pdf) |
| Gravel thesis (Cooke lab), Upper Rideau Lake (low predation) | all 8 telemetered males were still guarding when visits stopped at **24 d** | eastern ON | [primary, Carleton PhD 2011](https://www.fecpl.ca/wp-content/uploads/2013/06/Gravel.pdf) |
| Mackereth et al. 1999, Lake Opeongo sample dates | 1991: embryo 27 May–5 Jun, larva 4–19 Jun, juvenile 18–24 Jun. 1992 (later year): embryo 5–15 Jun, larva 18 Jun–2 Jul, juvenile 6–16 Jul | ~4–5 weeks from embryo to juvenile in 1992 (derived) | [primary, Env. Biol. Fish. 56:263–275](https://www.harkness.ca/PDFs/Contributions%201990s/makereth%20et%20al%201999.pdf) |
| Hinch & Collins 1991 | egg-laying to larval swim-up "nearly 2 weeks" (videotaped) | — | [primary abstract, TAFS 120:657–663](https://academic.oup.com/tafs/article/120/5/657/7891610) |
| Coble 1975 | "as long as 6 weeks", 24 h a day | — | [via Steinhart et al. 2005](https://www.harkness.ca/PDFs/Contributions%202000s/steinhart2005.pdf) |
| Maine (MDIFW plan) | most spawn mid-May to mid-June; nests built above ~55 °F (12.8 °C); eggs laid at 60–66 °F (15.6–18.9 °C) | — | [snippet](https://www.maine.gov/IFW/docs/strategic-management-plans/blackbass.pdf) (PDF itself 403) |

**The intensity is front-loaded:**
- Defence rises from eggs to the egg-sac fry (wriggler) stage and falls after swim-up (Ridgway 1988; Cooke et al. 2002 [primary]).
- In Opeongo, males spent only **~10 % of a 5-min observation** within 2 body lengths of a juvenile brood (Mackereth 1999 [primary]).
- After hatching, males in both Erie and Opeongo spent significantly more time away from the nest (Steinhart 2005 [primary]).
- Small males (21–25 cm FL) did **no defence at all** at the juvenile stage (Mackereth 1999 [primary]).

### 1b. Metabolic and activity increase: average vs peak

| Source | What was measured | Increase | Tag |
|---|---|---|---|
| **Hinch & Collins 1991** (the sim's citation) | video fin-beat rates, egg to swim-up only (~2 weeks), converted with a **largemouth** respiration model | "**up to 60 %**" above non-guarding. This is a ceiling for the costliest stages, not a season average | [primary abstract](https://academic.oup.com/tafs/article/120/5/657/7891610) |
| Steinhart et al. 2005, quoting Hinch & Collins | — | "active metabolic rate **up to 50 %** higher" | [via, primary PDF](https://www.harkness.ca/PDFs/Contributions%202000s/steinhart2005.pdf) |
| **Cooke et al. 2002** | 24-h EMG telemetry over all 4 stages (22 d), Fish Bioenergetics 3.0 at 18 °C, 1000-g fish | specific respiration of nesting smallmouth **+17.6 %** vs non-nesting Lake Erie smallmouth. Largemouth **+52.6 %** vs pond largemouth. Mean daily swimming equivalent: nesting smallmouth **41 km/d** vs non-nesting Erie smallmouth ~27 km/d; Hinch & Collins's one male ~28 km/d. Activity "approximately double" non-nesting | [primary](https://www.fecpl.ca/wp-content/uploads/2002/05/EMG-Parental-Care-MS.pdf) |
| **Steinhart et al. 2005** | bioenergetics model fitted to measured start/end weight and energy density | **Lake Opeongo ACT = 1.2** (text: activity "28 % higher than standard metabolism"; low predation). **Lake Erie ACT = 3.1** ("up to 210 %"), driven by hyperabundant invasive round goby: 9× the chase rate | [primary](https://www.harkness.ca/PDFs/Contributions%202000s/steinhart2005.pdf) |
| Gravel thesis ch. 2 (6 Ontario lakes) | EMG, highest- vs lowest-predation lake | **+10 %** overall locomotor activity at the high-predation site; ~2× the burst swimming when guarding eggs (not significant, low power) | [primary](https://www.fecpl.ca/wp-content/uploads/2013/06/Gravel.pdf) |
| Cooke et al. 2006 (6 centrarchids) | video swim speeds → respiration | per unit mass, care was costliest for rock bass and smallmouth; bluegill wriggler-stage respiration was half that of smallmouth | [primary](https://www.fecpl.ca/wp-content/uploads/2006/07/Oecol-Cooke-et-al-2006.pdf) |

**Takeaway:** averaged over the whole guard, a low-predation northern-lake male runs about **+15–30 %** above a routinely active non-nester:
- Opeongo ACT 1.2–1.28.
- Cooke 2002: +17.6 % for smallmouth.
- The "+60 %" is a peak for the egg/wriggler stage.

Only an extreme nest-predator load (Lake Erie with gobies) gives ~3×.

### 1c. Weight and energy loss over guarding

| Source | Result | Tag |
|---|---|---|
| **Cooke et al. 2002, Table 2** (FB3 model with measured nesting activity, **zero food**, 22 d, 18 °C) | Smallmouth males lost **11.8–16.2 % of body mass**: S2 291 mm FL / 354 g → **16.2 %**; S5 296 mm / 396 g → 15.9 %; S3 307 mm / 430 g → 15.5 %; S4 336 mm / 496 g → 14.6 %; S6 350 mm / 642 g → 13.4 %; S1 374 mm / 926 g → 11.8 %. **Gross daily mass loss 2.6–5.0 g/d**; specific respiration **23.9–33.4 J g⁻¹ d⁻¹**. A standard 1000-g fish lost 115 g (11.5 %); a non-nesting fish with no food 98 g; non-nesting fish on 10 g/d gained 42 g. Proportional loss is larger in smaller fish. This is an **upper bound**: the authors assumed no feeding, though they note Opeongo males often have food | [primary](https://www.fecpl.ca/wp-content/uploads/2002/05/EMG-Parental-Care-MS.pdf) |
| (derived from that table) | ≈ **0.65–0.75 % of body mass per day** for 350–500-g males with zero food. Their energy per gram lost ≈ 4,185 J/g (10,886 J/d ÷ 2.601 g/d) | (derived) |
| **Steinhart et al. 2005, Table 1** (average-length male at start vs end of care; destructive samples, different fish) | **Opeongo** (19 d, 11–30 Jun): 585 → 571 g WW (−2.4 %), energy density 4,949 → 4,831 J/g (−2.4 %), so whole-body energy **≈ −4.7 % (≈ 0.25 %/d)** (derived). The authors found **no significant decline** in residual weight or energy in Opeongo. **Erie** (17 d, 13–30 Jun, gobies): 852 → 754 g (−11.5 %), 6,004 → 5,355 J/g (−10.8 %). The text says energy content "declined 11 %"; the table values multiply to ≈ −21 % (derived; the source does not explain the difference). Care costs per 350-mm male: **53 kJ total in Opeongo vs 381 kJ in Erie** (~20 kJ/d), i.e. >6× per day | [primary](https://www.harkness.ca/PDFs/Contributions%202000s/steinhart2005.pdf) |
| **Mackereth, Noakes & Ridgway 1999**, Opeongo, size classes 21–25 / 28–32 / 35–39 cm FL; n = 153 lipid samples | Lipid energy index (lipid kcal / FL³) fell from embryo to juvenile stage by **17.0 % (small), 30.4 % (medium), 45.5 % (large)**. The size × period interaction was not significant. Energy stores were **not built up before nesting**: spring is already near the annual low, after winter. Fall muscle lipid ≈ 1.5× spring; visceral lipid > 2× spring. 70–75 % of lipid energy is in muscle from spring through care. Note this is **lipid only**: total somatic energy (mostly protein) fell far less in percentage terms (the paper gives no total-energy figure) | [primary](https://www.harkness.ca/PDFs/Contributions%201990s/makereth%20et%20al%201999.pdf) |
| Gillooly & Baylis 1999, J. Fish Biol. 54:573–584 | Tracked individual males (electroconductivity): **lean tissue rather than fat** supplied most of the energy used in care, and greater lean-mass loss went with higher reproductive success. Cooke et al. 2002 say their absolute modelled losses "were similar" to Gillooly & Baylis's if the latter's 8-day interval is extended to 22 d. Gillooly & Baylis found no size effect on % mass loss | [snippet + via Cooke 2002](https://onlinelibrary.wiley.com/doi/10.1111/j.1095-8649.1999.tb00636.x) (Wiley 403) |
| Gravel thesis ch. 2 (6 Ontario lakes, lethal samples early vs late) | The weight difference between egg-stage and larva-stage males was explained by **body size, not mass loss**. Eviscerated whole-body lipid **did not change**; liver lipid rose; HSI and GSI fell. Energy indices declined in all populations, with no greater loss where predation was high | [primary](https://www.fecpl.ca/wp-content/uploads/2013/06/Gravel.pdf) |
| Gravel, Couture & Cooke 2010, J. Fish Biol. 76:280–300 | Across 36°, 44° and 48 °N: **northern males (Rainy Lake, 48 °N) were larger, had more whole-body lipid for their size through care, and tended to feed more** | [primary abstract (QUBS)](https://research.qubs.ca/projects/comparative-energetics-and-physiology-of-parental-care-in-smallmouth-bass-micropterus-dolomieu-across-a-latitudinal-gradient) |
| Cooke lab QUBS project (6 lakes, 2007–09) | Energy reserves declined over care; no evidence of a greater cost where predation was higher. Burst swimming took 21–24 % of time at the highest-predation lake vs 10–11 % at the lowest (not significant) | [primary abstract (QUBS)](https://research.qubs.ca/projects/does-nest-predation-pressure-influence-the-energetic-cost-of-nest-guarding-in-a-teleost-fish) |

**Size dependence is contradictory:**
- Cooke 2002 (model): smaller fish lose proportionally more.
- Mackereth 1999: large males draw down lipid faster, while small males rely more on food.
- Steinhart 2005: large males lost more in Erie; no size effect in Opeongo.
- Gillooly & Baylis 1999: no size effect on % mass loss.

### 1d. Feeding while guarding

| Source | Data | Tag |
|---|---|---|
| **Mackereth et al. 1999, Table 2** (angled off the nest by a diver; trap-net fish excluded) | **% of males with gut contents**: small 67 % / 78 % / 100 %; medium 83 % / 80 % / 75 %; large 83 % / 70 % / 60 % (embryo / larva / juvenile). This is independent of size and stage (χ², p = 0.99). Mean gut contents **0.47–1.33 g dry** (crayfish, aquatic insects, fish). "All parental males" fed | [primary](https://www.harkness.ca/PDFs/Contributions%201990s/makereth%20et%20al%201999.pdf) |
| **Steinhart et al. 2005** | Males with prey in the stomach: **Opeongo 64 %** (50 % guarding embryos → 77 % guarding juveniles); **Erie 21 %** (5 % → 30 %). Total consumption over care: **Opeongo 55 g in 19 d ≈ 2.9 g/d ≈ 0.5 % BW/d**; **Erie 34 g in 17 d ≈ 2 g/d ≈ 0.25 % BW/d** (derived from Table 1). Daily ration (Eggers) rose from ~1 g/d (embryo stage) to ~3–5 g/d (juvenile stage), and **consumption was negatively related to whole-body energy density (r² = 0.76)**: depleted males eat more | [primary](https://www.harkness.ca/PDFs/Contributions%202000s/steinhart2005.pdf) |
| Hinch & Collins 1991 | guarding males were "food-deprived" and could not get adequate daily rations | [primary abstract](https://academic.oup.com/tafs/article/120/5/657/7891610) |
| Hanson & Cooke 2009, J. Comp. Physiol. B 179:253–266 (Opinicon, 50 smallmouth / 41 largemouth) | In smallmouth, **plasma triglycerides fell over most of care (fasting)**; Ca²⁺ and Mg²⁺ rose near the end, suggesting **feeding resumed as the brood neared independence at ~3 weeks**. Glucose and chloride (stress) rose | [primary abstract (QUBS)](https://research.qubs.ca/projects/nutritional-condition-and-physiology-of-paternal-care-in-two-congeneric-species-of-black-bass-micropterus-spp-relative-to-stage-of-offspring-development) |
| Gravel thesis | smallmouth "drastically decrease their food intake during parental care and demonstrate voluntary anorexia" (Hinch & Collins 1991; Hanson et al. 2009) | [primary (review statement)](https://www.fecpl.ca/wp-content/uploads/2013/06/Gravel.pdf) |
| Cooke et al. 2002 | modelled **zero** intake, based on unpublished video | [primary](https://www.fecpl.ca/wp-content/uploads/2002/05/EMG-Parental-Care-MS.pdf) |

**Ration relative to non-guarding (derived):** Opeongo males' ~0.5 % BW/d is roughly **one-third to one-half of an ordinary summer field ration** (~1–1.5 % BW/d) and about one-sixth to one-tenth of Cmax. Intake is lowest early (eggs and wrigglers) and rises in the fry stage.

### 1e. Survival and mortality

- **During guarding, none of the field studies found reports any guarding male starving to death.**
  - Gravel telemetry: 0 deaths. Low-predation lake 8/8 completed ≥24 d. High-predation lake: 2 males abandoned (at 8 d and 21 d), 1 tag failed, so **71 % success vs 100 %** [primary].
  - Cooke 2002: all 11 telemetered males resumed care within 1 min of release; no mortality reported over 22 d [primary].
  - Hinch & Collins: one male disappeared early, consistent with **abandonment** "because of energy constraints" [primary abstract].
- **Nest survival.** By the juvenile period only **34 % (1991) and 52 % (1992)** of Opeongo nesting males still had broods, partly from storms. Mackereth et al. suggest the males that left may have had the lowest reserves, so end-of-care samples are biased toward males in better condition [primary].
- **Annual survival cost (Opeongo).** Steinhart et al. 2008 parameterised a **daily reduction in annual survival per day of care** from nesting vs non-nesting annual survival in Opeongo (Ridgway 1986; Dunlop et al. 2005) [primary; model input]:

  | Age | TL | Annual survival | Reduction per day of care | Over 20 d of care (derived) |
  |---|---|---|---|---|
  | 4 | 259 mm | 0.70 | 0.025 | −0.50 |
  | 5 | 280 mm | 0.60 | 0.015 | −0.30 |
  | 6 | 300 mm | 0.50 | 0.008 | −0.16 |
  | 7 | 322 mm | 0.45 | 0.0015 | −0.03 |
  | ≥ 8 | ≥ 350 mm | — | 0.001 | −0.02 |

  - The cost is concentrated in **small** males and is an **annual** (largely overwinter) cost, not death on the nest.
  - The model's growth cost is 0.5 mm TL per day of care in Opeongo (2 mm/d in Erie with gobies).
- **Supplemental feeding.** Ridgway & Shuter 1994 (Env. Biol. Fish. 39:201–207) fed parental males [primary abstract via Springer synopsis]:
  - Year 1: fed males survived better.
  - Year 2: fed males cared longer and raised more young, but survived worse than unfed males.
  - Reading: food limits nesting males, and they allocate extra energy either to the current brood or to their future.
- **Rock bass (Sabat 1994).** Males with greater weight loss over care were less likely to be recaptured in later years [via Mackereth 1999; Cooke 2006].
- **Small males (Mackereth 1999).** Lower reserves may lower their overwinter survival. This is the authors' hypothesis, not a measurement.

### 1f. Nest abandonment and condition
- **No published condition-factor threshold for abandonment was found.** The evidence is that males **abandon (or feed more) before they starve**:
  - Hinch & Collins: an energy-driven abandonment.
  - Gravel: the "abandonment threshold" concept, with abandonment rates rising with the cost of care (29 % at the high-predation lake vs 0 %).
  - **Zolderdo et al. 2016** (JEB 219:1237–1248, Opinicon): **supplemental feeding reduced early nest abandonment** and raised reproductive success; it did not change care behaviours [primary abstract (QUBS)](https://research.qubs.ca/projects/stress-nutrition-and-parental-care-in-a-teleost-fish-exploring-mechanisms-with-supplemental-feeding-and-cortisol-manipulation).
  - Steinhart 2005: as reserves fell, males foraged more and spent more time away from the nest.
  - Mackereth 1999: small males stopped defending by the juvenile stage.
- **Steinhart et al. 2008** dynamic-programming model [primary]:
  - Adult annual survival was the strongest driver of abandonment.
  - High care costs led males to abandon **larger** broods.
  - On day 1 an optimal age-4 male abandons only if his brood falls below **65 % (Erie) or 30 % (Opeongo)** of its starting size.
  - The thresholds fall as days of care accumulate.
- **Largemouth (Hanson & Cooke 2009).** Repeatedly handled males abandoned more often [primary abstract].

---

## 2. Largemouth bass (check)

- **Duration:**
  - **20.3 ± 1.0 d** at 20.3 °C, Lake Opinicon (n = 14; 352.8 mm TL, 597 g) [Cooke 2006, primary].
  - Brood independence at ~3 weeks [Hanson & Cooke 2009, primary abstract].
  - Southern extension sheets say 1–2 weeks [popular].
- **Activity:**
  - Mean **49 km/d** swimming equivalent vs ~12 km/d for non-nesting pond largemouth.
  - Activity, unlike smallmouth's, **rose again** at the free-swimming fry stage (patrolling a dispersing fry ball).
  - Specific respiration **+52.6 %** vs non-nesting (1000 g, 18 °C) [Cooke 2002, primary].
- **Modelled mass loss, zero food, 22 d, 18 °C:**
  - **12.0–15.8 %**: L1 436 g → 15.8 %; L5 640 g → 14.6 %; L2 766 g → 13.8 %; L3 712 g → 13.8 %; L4 844 g → 12.0 %.
  - A standard 1000-g fish lost 125 g.
  - Daily energy loss 13.5–20.1 kJ [Cooke 2002, primary].
- **Feeding and condition:**
  - Plasma suggests fasting during care [Hanson & Cooke 2009].
  - Cooke 2002 suggests largemouth may start to forage during the fry stage.
- **Who guards:** males only in northern populations [Cooke 2006].

---

## 3. Pumpkinseed and bluegill

- **Duration (Cooke et al. 2006, Lake Opinicon, telemetry until care ended)** [primary]:
  - **Pumpkinseed 6.0 ± 0.4 d** at 21.3 °C (n = 12; 190.5 mm TL, 140.7 g).
  - **Bluegill 4.3 ± 0.1 d** at 23.8 °C (n = 12; 129.9 g).
  - Rock bass 14.5 d; black crappie 10.7 d.
  - Pumpkinseed (and black crappie) kept **high, stable** care intensity from egg to wriggler: "short duration, but high intensity care".
  - Bluegill cut effort at the wriggler stage, as repeat nesters must.
  - Mass-specific costs: bluegill wriggler-stage respiration was half that of smallmouth.
  - Juveniles of the four species with short care disperse in a brief period, coinciding with the male leaving the nest.
- **Other duration sources (pumpkinseed)** [popular]:
  - FishBase: male guards the eggs ~7 d and the young until ~11 d after hatching, then readies the nest for another spawning ([FishBase](https://fishbase.se/summary/3372)).
  - Males breed every ~11 days through the season ([NJ DEP sheet](https://www.nj.gov/dep/fgw/pdf/delriver/artdel_sp_pumpkinseed.pdf)).
- **Feeding (Zięba et al. 2018, Sci. Nat. 105:26)** [primary abstract and text summary via Springer]:
  - Introduced pond population, Poland, 6 Jul 2013, full 24-h cycle; 39 parental males, 28 cuckolders, 56 females.
  - **Parental males had lower total stomach-content weight than females**, and fewer and lighter chironomids. Cuckolders did not differ from females.
  - Parental males more often contained conspecific eggs.
  - Per-group means are in a table not read; no % empty given.
  - Source: [Springer](https://link.springer.com/article/10.1007/s00114-018-1554-0).
- **Weight loss:**
  - **Bluegill:** parental males' body weight declined significantly during care, partly through stored lipid (Coleman & Fischer 1991, Ethology 87:177–188) [via Mackereth 1999]. No numbers recovered.
  - **Pumpkinseed:** parental males "can lose weight and show higher mortality" (Rios-Cardenas & Webster 2005) [via Zięba 2018]. No numbers recovered.
  - **Longear sunfish:** reduced somatic growth from reproductive investment (Jennings & Philipp 1992) [via Mackereth].
- **No quantitative pumpkinseed mass-loss figure was found.** With only ~6 d of care, the total cost is small even at bass-like daily rates (derived: 6 d × ≤0.7 %/d ≤ 4 %).

---

## 4. Brown bullhead

- **Who guards (Blumer 1985, 1986, Michigan):**
  - 56.2 % of broods biparental, 39.3 % male only, 4.5 % female only [via [Animal Diversity Web](https://animaldiversity.org/accounts/Ameiurus_nebulosus), popular].
  - Males are the primary caregivers and stay closer over the brood; females attend from farther away and chase intruders.
  - Both parents were together at the brood only **19 %** of the time.
  - Two caregivers raised more young than one.
  - Lone males attended more, so they bear higher costs ("starvation, reduced future reproduction") and are likelier to desert.
  - Sources: [Blumer 1985, Env. Biol. Fish. 12:231–236, primary abstract](https://link.springer.com/article/10.1007/BF00005153); [Blumer 1986, Behav. Ecol. Sociobiol. 19:97–104, primary abstract](https://link.springer.com/article/10.1007/BF00299944).
- **Condition cost (Blumer 1986):**
  - **Males fed little during breeding and care, yet showed only minor weight and condition losses.**
  - Females bore the larger initial cost of reproduction: weight, condition and GSI dropped at spawning.
  - The abstract gives no numbers. [primary abstract]
- **Duration:**
  - Maximum care 29 d; average 9.4 d to independence; juvenile stage to end of care averages 5 d [ADW summarising Blumer, popular].
  - Parents stay "until about 5 days after hatching" [[Missouri Dept. of Conservation](https://mdc.mo.gov/discover-nature/field-guide/brown-bullhead), popular].
  - Other guides say "several weeks" [popular].
  - Most spawning in Michigan fell in the first 16 days of June; larger males spawned earlier [snippet].

---

## 5. Checks against the sim (derived)

**Whitledge et al. 2003 smallmouth respiration (the sim's adult-bass FB4 row: RA 0.244, RB −0.756, RQ 1.8, RTO 30, RTM 37, ACT 1), routine, J g⁻¹ d⁻¹:**

| Mass | 18 °C | 20 °C | 22 °C | 20 °C × 1.6 | 20 °C × 1.25 |
|---|---|---|---|---|---|
| 250 g | 31.9 | 35.8 | 39.7 | 57.2 | 44.7 |
| 400 g | 22.4 | 25.1 | 27.8 | 40.1 | 31.3 |
| 500 g | 18.9 | 21.2 | 23.5 | 33.9 | 26.5 |
| 650 g | 15.5 | 17.4 | 19.3 | 27.8 | 21.7 |

- **The guard cost on its own is not what kills.** Whitledge routine × 1.6 for a 400–500-g male at 18–20 °C (30–40 J g⁻¹ d⁻¹) roughly equals Cooke 2002's zero-food nesting respiration (24–33 J g⁻¹ d⁻¹). That is **~0.6–0.8 % of body energy a day even with no food**: ~15 % over 22 d.
- **The sim's ~2 %/d is 2.5–3× that zero-food upper bound.** The extra must come from somewhere else. Candidates to check (I did not test them):
  1. **Double-counting activity.** The world step also multiplies respiration by `exp(BIOE.SWIM·(uAvg − uRoutine))` (up to ~4×). A guard that chases intruders or is pulled back by `GUARD_TETHER` pays that on top of `GUARD_METAB`. The published +18–60 % already **is** the activity cost of fanning and chasing.
  2. **Steep RB.** Whitledge's RB −0.756 makes small adults expensive: a 250-g male's routine cost is 1.7× a 500-g male's per gram (see `predator_winter_energetics.md` §0).
  3. **Effective intake far below 0.2.** `GUARD_FEED` caps both gut room and appetite, and a tethered guard finds little food within `GUARD_R`.
  4. **Low starting condition.** Real males start guarding near their annual lipid minimum (Mackereth 1999), but they are not starving.
- **On the sim's K scale** (K = W / 75th-percentile standard weight; populations average ~0.85–1.0), a real 5–15 % loss moves a male from ~0.9 to ~0.77–0.86. That only grazes `K_HAZARD` 0.78; it does not reach the 50 %/d level at 0.55.

---

## For the sim

**1. Average metabolic multiplier while guarding (`GUARD_METAB`).**
- **Smallmouth: 1.25** (range 1.15–1.5) for a low-to-moderate nest-predator lake like Hot Brook. Basis: Opeongo ACT 1.2–1.28 (Steinhart 2005); +17.6 % (Cooke 2002); Hinch & Collins's "up to 60 %" as the egg-stage peak.
- **Staged version (preferred):**
  - **× 1.4** for eggs → egg-sac fry → swim-up (first ~7–10 d, fanning plus peak defence);
  - **× 1.1–1.15** for the free-swimming fry stage (rest of the guard).
  - Time-weighted average over 28 d ≈ 1.2 (derived).
- **Only if guards already swim at routine:** `GUARD_METAB` should be the whole guarding activity cost. Either exempt guards from the `BIOE.SWIM` speed multiplier, or cut `GUARD_METAB` to ~1.0–1.1 and let the on-screen chasing pay the cost. Do not stack both.
- Largemouth (check only): ~1.5 average (Cooke 2002).
- Pumpkinseed: ~1.3 (short, high-intensity care).
- Brown bullhead: ~1.1 (males fed little yet lost little condition, Blumer 1986, which implies a low activity cost).

**2. Feeding fraction (`GUARD_FEED`, relative to a non-guarding fish's intake).**
- **Smallmouth: 0.3 average** (range 0.1–0.5).
- **Staged:** **0.1–0.15** for eggs and wrigglers, then **0.4–0.5** for free-swimming fry (Steinhart: 5–50 % of males feeding early → 30–77 % late; Hanson & Cooke: feeding resumes at ~3 weeks).
- **Make it condition-dependent:** raise intake as K falls (Steinhart: consumption vs energy density r² = 0.76). E.g. multiply by `1 + 2·clamp((0.9 − K)/0.15, 0, 1)`; this form is an inference, not a published equation.
- Field anchor: Opeongo guards eat **~0.5 % BW/d** (≈ 2.9 g/d for a ~580-g male); Erie guards ~0.25 % BW/d.
- Pumpkinseed: ~0.4 (less food than females, Zięba 2018; no fraction published). Brown bullhead: ~0.3 ("fed little").

**3. Guarding durations.**
- **Smallmouth: ~28 d** (keep `yr(0.08)` ≈ 29 d). Opinicon 28.4 ± 2.2 d at 19.8 °C; Opeongo 19–45 d. For a stochastic draw use 20–35 d, shorter in warm years and for small or depleted males. Stages at ~18–20 °C: eggs ~3 d, egg-sac fry ~2 d, swim-up ~2 d, free-swimming fry ~2–3 weeks.
- **Largemouth:** ~20 d.
- **Pumpkinseed:** ~6 d total (Cooke 2006). The sim's ~2 d (eggs and yolk-sac only, with schools starting at swim-up) is a reasonable simplification. Males can re-nest every ~11 d.
- **Bluegill:** ~4 d.
- **Brown bullhead:** typically ~1–2 weeks (ADW average 9.4 d to independence; MDC "until ~5 d after hatching"); maximum 29 d. The sim's `yr(0.06)` ≈ 22 d is on the long side. ~10–14 d is a better central value; this is a weak inference from popular summaries of Blumer.

**4. Expected total mass loss for a 30–35-cm male smallmouth** (~400–650 g; Ws 396 g at 300 mm and 649 g at 350 mm TL from the Kolander et al. 1993 smallmouth Ws, log₁₀W = −5.329 + 3.200 log₁₀TL, equation recalled rather than re-read — derived; the Opinicon guards in Cooke 2002 were 354 g at 306 mm and 496 g at 359 mm TL):
- **Typical (low predation, some feeding): ~3–8 % of body mass, ~5–10 % of body energy, over the whole ~4-week guard**, i.e. **~0.15–0.3 %/d**. Opeongo: ≈ −2.4 % mass and ≈ −4.7 % energy in 19 d, not significant (Steinhart 2005). Gravel's six Ontario lakes: no detectable mass loss beyond size and unchanged carcass lipid; liver and gonad indices fell.
- **Upper bound (zero food, or a heavy nest-predator load): 12–16 % of mass in 17–22 d, ≈ 0.7 %/d.** Cooke 2002 modelled no food (14.6–16.2 % for 354–496-g males). Lake Erie with gobies: −11.5 % mass in 17 d.
- Lipid stores can fall 17–45 % (Mackereth 1999), but lipid is a small share of total energy.
- **Target the sim at ≤ 0.3 %/d average and never > ~0.7 %/d**, versus ~2 %/d now. At these rates no male should cross into the starvation hazard on the nest unless it starts the season already near K 0.8.

**5. Condition threshold for abandoning the nest.**
- **No published K threshold exists.** The literature shows males desert or forage more **before** they starve: Hinch & Collins 1991; Gravel 2011 (abandonment 0 % vs 29 % with predation cost); Zolderdo 2016 (food reduces early abandonment); Ridgway & Shuter 1994 (food lengthens care in some years); Mackereth 1999 (small males quit defending first).
- **Recommended mechanism:** a guard **abandons** when its K falls below **~0.80**. That is just above `K_HAZARD` 0.78, so desertion happens before starvation risk. The threshold is an inference, roughly the condition left after the documented maximum 12–16 % loss from a K≈0.92–0.95 start.
- An equivalent rule: abandon once the guard has lost **~12–15 % of its starting mass**.
- Optionally make abandonment likelier for **small males** and for **shrunken broods**. Steinhart 2008's optimal-abandonment thresholds: brood < 30 % of its starting size (Opeongo-like lakes) for a young male early in care, with the threshold falling as care proceeds.
- Abandonment ends the guard: the male resumes normal feeding, and the fry lose `PROTECT`.
- **Survival cost:** rather than killing guards on the nest, any carry-over cost belongs in the following winter (lower reserves). Steinhart 2008's Opeongo annual-survival penalty is steep for males < 30 cm (−0.16 to −0.5 over 20 d of care) and negligible above ~32 cm (−0.02 to −0.03).
