# Young piscivores eating young fish: functional response, encounter, prey densities, rations, and cohort (super-individual) predation (2026-10-18)

**Purpose.** The sim's young fish are super-individual schools (`world.fry`; 3-D: `fish3.js` `_eatYoy`). Today a piscivore at a school takes `FRY.ATTACK × TS × capture × n/(n + FRY.N_HALF)`. That half-saturation counts fish in the school (`N_HALF` = 30 fish), not fish per m² or m³. These notes collect what is needed for a **density-based** rule: prey eaten per predator per unit time as a function of prey per m² or m³. Predators of interest are 3–15 cm esocids, bass and perch, plus adult panfish eating larvae.

**Tags.**
- [primary]: I read the full text (old scans as OCR; garbled OCR is flagged).
- [abstract]: abstract or catalogue record only.
- [secondary]: the number comes from another source that cites the original; both are named.
- [snippet]: search-engine summary only (unverified).
- [inf]: my arithmetic or inference.

**Cross-references.** Numbers already sourced in other notes are cited as (RF §x) etc., keeping the tag given there:
- RF = `realtime_foraging.md`; SI = `super_individuals.md`; SFN = `../Hot Brook populations and water/small_fish_numbers.md`;
- FFE = `../Real lake ecology for calibration/forage_fish_early_life.md`; LMB = `../Real lake ecology for calibration/largemouth_bass.md`;
- PYOY = `../Predator winter energetics/pickerel_young_of_year.md`; PMC = `pickerel_mortality_cannibalism.md`; MAC = `macrophytes.md`.

**Units.** a = clearance (attack) rate: volume (or area) searched per predator per unit time; N = prey density; h = handling time per prey. Holling II: intake = a·N/(1 + a·h·N); half-saturation N½ = 1/(a·h). r = prey length / predator length; lR = 1/r.

**Access notes.** The int-res (MEPS) archive returned HTTP 429 all session, so Fuiman & Gamble 1988, Cowan & Houde 1993 and Juanes & Conover 1994 were not read. PMC showed a reCAPTCHA; NCSU and HAL showed bot checks; Smithsonian, Deep Blue, MDPI and KMAE returned 403. None were bypassed.

---

## Summary: the numbers that matter most

| Quantity | Value | Basis |
|---|---|---|
| **Field (daily-averaged) clearance rate**, small piscivore at its best prey size | **~3–10 m³ per predator per day**. Perch cannibal: a = 400·L^0.6 L/d (L in mm) = 3.1 m³/d at 30 mm, 4.2 at 50 mm, 6.3 at 100 mm, 8.1 at 150 mm. Pikeperch 130–380 mm: 9.6 ± 2 m³/d at prey 0.19 × its length | Persson et al. 2004 [primary]; Persson & Brönmark 2002 [primary]; arithmetic [inf] |
| **In-bout (tank) clearance**, 6–19-cm predators on larvae | **~1–6 m³/h per predator**, i.e. 10–30 × the daily-averaged field value per hour of the day | Margulies 1989; Folkvord & Hunter 1986 [primary], derived [inf] |
| **Size window** (relative attack rate) | 0 below r ≈ 0.05–0.06; peak at r ≈ 0.10 (larvae; Paradis) to 0.16–0.20 (juveniles); 0 above r ≈ 0.42–0.5 | Paradis 1996 [abstract]; Persson 2004; Claessen 2002; Persson & Brönmark 2002 [primary] |
| **Capture success per attack** vs r | Larvae ≤ 1/15–1/17 of predator length → ~100 %. 50 % escape at r ≈ 0.16–0.20. Linear for juveniles: 1.0 − 1.0·r (soft prey) to 0.70 − 1.34·r (spiny prey). Esocids on deep-bodied sunfish 0.10–0.14 (RF) | Miller 1988; Folkvord & Hunter 1986; Scharf 2003 [primary]; RF §3.1 |
| **Mechanical handling** | ~2–10 s at r 0.1–0.3 (YOY bluefish: 1.7–3.1·e^(4.2–5.7·r) s); minutes for r > 0.4 (RF §3.3) | Scharf 2003 [primary] |
| **Digestion "handling"** (what limits a piscivore) | Perch: H = 5.0·x^−0.8 d per g prey (x = structural mass, g). Max intake 0.2·x^0.8 g/d ≈ 8–13 % of body mass per day at 1–10 g | Claessen 2002; Persson 2004 [primary]; arithmetic [inf] |
| **Ad-libitum rations, 19–24 °C** | Largemouth fingerlings (5.8 g, 84 mm) ≈ **15 %/d**. Tiger muskie fingerlings (8.9 cm, ~3–4 g) **6.2 fathead/d = 1.4 g (~35–45 %/d)** but only **2.0 bluegill/d = 0.6 g (~15–19 %/d)**. Pike larvae 13–16 mm 30 %/d, juveniles 35–50 mm 20 %/d (zooplankton diet) | Snow 1961 [primary]; Beyerle 1980 [primary]; Grès et al. 1996 [snippet]; % [inf] |
| **FB4 Cmax** for comparison | Largemouth (Rice 1983 set) at 22 °C: 0.255 g/g/d at 1 g, 0.15 at 5 g, 0.12 at 10 g. Pike (Bevelhimer set) at 19–22 °C: ~0.12–0.16 at 3 g | Codebase parameters; arithmetic [inf] |
| **Half-saturation density** N½ = 1/(a·h) | **~1–10 prey per m³** (or per m² over a ~1-m littoral) for 5–10-cm piscivores on 10–25-mm prey. Saturated inside fry schools (10²–10³ m⁻²); linear between schools | [inf] from the rows above |
| **Young-of-year densities** | Littoral totals ~0.5–2 fish/m², Sep peak (SFN). Bluegill fry 5–20 m⁻² four days after nest dispersal (FFE). Smallmouth broods ~100–600 larvae/m² in 0.8–5.8 m² (RF). Limnetic bluegill larvae ≤ 16 m⁻³ [snippet] | see §3.1 |

**Recommended rule (§5):** a multi-prey Holling II on local school density (per m³). The clearance is size-windowed, light-, cover- and capture-weighted. Handling is max(mechanical, prey mass / Imax). Removal is exponential, scaled by the predator super-individual's overlap with the school, and capped by gut room. It is checked against field young-of-year mortality (§3.3).

---

## 1. Attack (clearance) rates, handling times, half-saturation

### Takeaway
- **Few direct functional responses exist for 3–15-cm freshwater piscivores eating larval fish.** The best freshwater parameter sets come from size-structured perch and pikeperch models whose attack rates were measured in pools and enclosures (Persson, Claessen, Brönmark).
- **Their daily-averaged clearance is ~3–10 m³/d.** Tank trials with 6–19-cm marine predators on larvae give 1–6 m³/h while hunting.
- **Piscivore intake is limited by digestion,** not by mechanical handling. A Holling II needs "handling" = prey mass / maximum intake, or a type-I-to-a-cap (Breck 1993; RF §5.6).

### 1.1 Size-structured models with measured attack rates (density-based, cohort-to-cohort)

**Persson et al. 2004, Ecol. Monogr. 74:135 — Eurasian perch cannibalism, Lake Abborrtjärn 3** [primary, [PDF](https://staff.fnwi.uva.nl/a.m.deroos/downloads/pdf_pubs/world/EcolMon04.pdf)]
- **Cannibalistic attack rate on the optimal ridge:** β·c^σ, with β = **400 L d⁻¹ mm^−σ** ("cannibalistic voracity"), σ = **0.6**, c = cannibal length (mm).
  - Per predator [inf]: **3.1 m³/d at 30 mm, 4.2 at 50 mm, 6.3 at 100 mm, 8.1 at 150 mm.**
- **Victim window** (victim/cannibal length): lower **0.05**, optimum **0.16**, upper **0.45**.
  - The rise and fall are nonlinear, fitted to Lundvall et al. 1999 capture-rate experiments for two cannibal sizes (their Fig. 2).
- **Zooplankton attack rate:** dome-shaped, Â = **9×10³ L/d** at W_opt = 4.7 g, exponent 0.62.
- **Benthos:** b1 = 0.2 m² d⁻¹ g^−b2, b2 = 0.4.
- **Digestion ("handling") time per gram of prey:** H(x) = **5.0·x^−0.8 d/g** (x = irreversible mass, g); conversion efficiency 0.61.
- **Lake and habitat:** volume 3×10⁸ L; benthic area 3×10⁴ m²; 90-d season.
  - YOY move to the littoral on day 31.
  - Yearlings are confined to the littoral until day 20 by risk.
  - Large perch split littoral:pelagic 0.3:0.7 in the stunted phase.
  - Habitat compartments set who meets whom (§4).
- **Field outcome:** "early cannibalism by the abundant but slow-growing" perch ≥ 2 yr explained years with few yearlings.
  - September trap-net catches of YOY averaged 334 in good years vs 19 in poor years.
  - Cannibalism by yearlings on YOY was "restricted to a short period in June".

**Claessen et al. 2002, Ecology 83:1660 — same model family** [primary, [PDF](https://staff.fnwi.uva.nl/a.m.deroos/downloads/pdf_pubs/world/Ecology02.pdf)]
- **Defaults:** β = **200** L d⁻¹ mm^−σ (varied); σ = 0.6; window δ = **0.06**, ε = **0.45**, optimum φ = **0.2** (linear tent).
- **Planktivory:** Â = **3×10⁴ L/d** at 4.7 g.
- **Digestion:** ξ1 = 5.0, ξ2 = 0.8.
- **Functional response:** "Limitation by digestion capacity is assumed to result in a Holling type II functional response, in which the 'handling time' corresponds to the digestion time per gram of prey mass".
- **The lower window limit (δ) "mainly drives population dynamics"**; the upper limit shapes size structure ([abstract record](https://repository.rothamsted.ac.uk/id/eprint/12479)).

**Persson & Brönmark 2002, Ecology 83:3014 — pikeperch** [primary, [PDF](https://lup.lub.lu.se/search/files/4398124/625096.pdf)]
- **Set-up:** functional-response experiments in field enclosures and pools of 5, 28 and 100 m², at 16–20 °C, 3-day trials.
  - Predators: one 190–380-mm pikeperch or two of 130–165 mm. Prey: roach and bream of 20–150 mm.
  - Linear or type II fits per predator × prey combination.
- **Piscivory attack rate:** a(lR) = A·[(lR/l0)·exp(1 − lR/l0)]^α, with lR = predator/prey length.
  - **A = 9.6 ± 2 m³/d, l0 = 5.3 ± 0.6 (prey 0.19 × predator), α = 6.5 ± 3.**
  - Parameters were taken as independent of predator size once corrected for prey size.
  - Pikeperch ate all ratios tested, 2–14. In the model, fish prey are available only once lR ≥ 2 (gape 0.5).
- **Evaluated** [inf]:

  | Prey/predator r | 0.5 | 0.33 | 0.25 | 0.19 | 0.14 | 0.10 | 0.07 |
  |---|---|---|---|---|---|---|---|
  | a (m³/d) | 1.0 | 4.0 | 7.6 | **9.6** | 7.3 | 1.9 | 0.12 |

- **Planktivory:** A_Z = **13 ± 3 m³/d** at a 66 ± 10-mm pikeperch (Daphnia 0.93 mm, 60-L tanks, 18 °C). The caption gives α_Z 3.5 ± 3; Table 1 gives 6.0.
- **Handling:** taken from the Claessen perch digestion allometry. The handling-scalar row of Table 1 is garbled in the PDF text.
- **Comparison:** pikeperch's maximum piscivory attack rate is "in the upper range" of Claessen et al. 2000 and "higher than the value suggested for perch".

**Reading across [inf].** Three independent fits put the optimum prey at **0.16–0.20 of predator length**, the useless-small limit at **0.05–0.07**, and the gape/escape limit at **0.42–0.5**. Daily-averaged clearance at the optimum is **~4–10 m³/d**. For larvae, Paradis et al. (1996) put peak vulnerability at r ≈ **0.10** [abstract] (§2.3). Larvae are smaller relative to the predator, transparent and weak swimmers, so the encounter × capture optimum shifts to smaller r.

### 1.2 Lab trials of young or small predators on larvae → clearance [primary data, derived rates]
Per-predator clearance from depletion is a = −ln(1 − p)·V/(n_pred·t), with p the fraction eaten [inf]. These are **in-bout** rates: predators starved 10 h, prey released into view, small tanks.

| Predator (size, number per trial) | Prey | Arena, time | Fraction eaten p | Derived a (m³/h per predator) | Source |
|---|---|---|---|---|---|
| Juvenile white seabass 62–86 mm (mean 72), 3 | white seabass larvae, 5 per trial | 1.4 m³, 10 min, 17–19 °C | 0.80 yolk-sac (3 mm); 0.65 at 6 mm; 0.87 at 7.5 mm; 0.30 at 15 mm | **4.5; 2.9; 5.7; 1.0** | Margulies 1989 [primary, [PDF](https://spo.nmfs.noaa.gov/sites/default/files/pdf-content/1989/873/margulies.pdf)] |
| Adult northern anchovy 85–107 mm, 5 | same | same | 0.95 yolk-sac; 0.56 early juvenile (15 mm) | **5.0; 1.4** | same |
| Juvenile chub mackerel 191 mm SL, 3 | northern anchovy larvae 10–50 mm, 3 per trial | 1.35 m³, 5 min, 20.5–23.8 °C | "usually ate all larvae … within 5 min" (≥ 0.95) | **≥ 16** | Folkvord & Hunter 1986 [primary, [PDF](https://spo.nmfs.noaa.gov/sites/default/files/pdf-content/1986/844/folkvord.pdf)] |
| Esocids 150–225 mm | bluegill / fathead minnow / shad, 15 per trial | 700 L, 1 h | 0.5 / 1.9 / 1.0 eaten per h | ~0.02 / 0.09 / 0.05 | Wahl & Stein 1988 (RF §3.1) [inf] |
| Largemouth 33–37 cm | bluegill 35–44 mm, 35 (~9 m⁻³) | 2.4–3-m pools, 0 stems | ≈ 25 captures/h | ~2.8 | Savino & Stein 1982 (RF §3.1) [inf] |

- **Margulies' predators differed in style.** Juvenile white seabass attacked slowly and discontinuously ("approach, glide, then ingestion"; 0.05–0.20 m/s). Adult anchovy attacked fast and continuously (0.5–1.5 m/s).
  - Attack distances are printed in dm (anchovy 20–70, mean 36.6; seabass 5–30, mean 14.7). Only cm is possible in a 1.4-m³ tank [inf].
- **Escape and response rates** (Margulies 1989):
  - Larvae escaping anchovy rose from 3 % (yolk-sac) to 43 % (15 mm). Larvae escaping seabass rose from 8 % to 74 %.
  - Escape among larvae that responded: 21 % (3.1 mm) → 75 % against anchovy; 39 % → ~90 % against seabass.
- **Small larvae are often not seen.** In Folkvord & Hunter, both predator species swam within **2–3 dm** of 6-mm larvae without attacking. Anchovy consumption peaked on **8.5–15-mm** larvae (r ≈ 0.10–0.18) [primary].
- **Adult panfish on larvae.** Yearling bluegill eating white perch larvae killed "nearly 100 %" of larvae < 6 mm SL in 15 min, 30 % at 12 mm and 18 % at 14 mm. A 100-fold rise in Daphnia cut larval mortality by 75–90 % (Springer record [10.1007/BF00001672](https://link.springer.com/article/10.1007/BF00001672); author not shown; probably Margulies, Env. Biol. Fish.) [snippet].

**Field vs tank [inf].** Tank values of 1–6 m³/h would be **24–140 m³/d** if sustained all day, versus 3–10 m³/d in the enclosure/cohort fits. The difference is time spent not hunting, satiation, patchiness, cover, vigilant prey and arena effects:
- Scharf et al. (2003) found capture success significantly higher in 215-L than in 475- or 900-L tanks [primary].
- Use **daily-averaged values for coarse steps** and in-bout values only while a fish is actively hunting a school.

### 1.3 Rations at saturating prey density (what Imax looks like)
- **Largemouth fingerlings** — Snow 1961, Proc. SEAFWA 15:303 [primary, OCR, [PDF](https://seafwa.org/sites/default/files/journal-articles/SNOW-303.pdf)]:
  - fish of 5.8 g (4.4–9.5), 84 mm TL (77–95), 5 per compartment, July–October; mean 20–24.5 °C.
  - Live forage at 10 % of body weight daily "was inadequate to satisfy the bass" for the first weeks.
  - "In the range of 21–24 degrees C … the experimental bass would utilize forage fish of about **15 percent of their body weight daily**."
  - Food conversion was 3.2–5.6 g forage per g gain (efficiency 18–31 % [inf]).
  - Weight gain was 230–811 % in ~14 weeks.
  - Dominant fish monopolised food, and the smallest stopped growing after 10 weeks.
- **Tiger muskellunge fingerlings** — Beyerle 1980, Michigan DNR Tech. Rep. 1980-1 [primary, [PDF](https://www.dnr.state.mi.us/PUBLICATIONS/PDFS/DNRFishLibrary/TechnicalReports/TR80-1.pdf)]:
  - 20 fish of 8.9 cm (8.4–9.7) per trough (274 × 50 × 50 cm), 19 °C, 14 days.
  - Prey were kept at ~200 per trough: ≥ ~150 m⁻² of bottom, ~290 m⁻³ if full [inf].
  - They ate **6.2 fathead minnows/d (2.5 cm; 1.4 g)** but only **2.0 bluegills/d (3.0 cm; 0.6 g)**.
  - With an 8.9-cm esocid at ~3.2 g (chain pickerel Ws, as in `species.js` [inf]), that is **~44 %/d on minnows vs ~19 %/d on bluegill** [inf].
  - The ~2.3× difference at equal, saturating numeric density matches esocids' poor capture of deep-bodied, spiny sunfish (RF §3.1: 0.10–0.14 vs 0.6–0.8).
  - Caution: "consumed" was counted as prey missing.
- **Pike larvae and juveniles** (intensive rearing on zooplankton and Chaoborus): intake fell from **~30 %/d at 13–16 mm** to **~20 %/d at 35–50 mm**. Daily intake was little affected by stocking density, but survival, cannibalism and growth were. — Grès, Lim & Belaud 1996, Bull. Fr. Pêche Piscic. 343:153–174 [snippet; KMAE returned 403].
- **FB4 Cmax** (codebase parameter sets) [inf]:

  | Set | Fish mass | 20 °C | 22 °C | 24 °C |
  |---|---|---|---|---|
  | Largemouth, Rice et al. 1983 (`bioJuv`: CA 0.33, CB −0.325, CTO 27.5, CTM 37, CQ 2.65) | 1 g | 0.21 | 0.255 | 0.29 |
  | | 5 g | 0.13 | 0.15 | 0.17 |
  | | 10 g | 0.10 | 0.12 | 0.14 |
  | Pike, Bevelhimer et al. 1985 (CEQ 4) | 3.2 g | 0.13 (19 °C: 0.12) | 0.15 | 0.16 |

  - Snow's 15 %/d for a 5.8-g bass at 21–24 °C matches the largemouth Cmax.
  - The tiger muskie's ~44 %/d on minnows is **~3.5× the pike-set Cmax**. The pike set may under-predict ad-libitum feeding of fingerling esocids on soft prey [inf; single study].
- **Pickerel inferred from growth** [inf]:
  - From PYOY: 25–38 mm at the end of June to ~102 mm at the end of September (New York) gives ~0.09 g → ~4.9 g with the Ws length–weight curve.
  - Specific growth G ≈ ln(52.7)/92 d ≈ **4.3 %/d**.
  - With gross conversion 0.18–0.31 (Snow), the ration is **G/K ≈ 14–24 %/d** averaged over the summer.

### 1.4 Handling time: mechanical vs digestive
- **Mechanical, YOY bluefish 70–180 mm TL** — Scharf, Buckel, McGinn & Juanes 2003, JEMBE 294:41 [primary, [PDF](https://www.cmast.ncsu.edu/cmast-sites/buckel/scharf_JEMBE.pdf)]:
  - conditions: 475-L tanks, 3 predators, 15-min trials, 19–21 °C, prey 25–65 mm, r = 0.10–0.65;
  - time from contact to the end of rapid opercular movement; units read as s [inf];
  - bay anchovy **2.81·e^(4.23r)**, Atlantic silverside **1.68·e^(4.58r)**, menhaden **3.08·e^(4.80r)**, age-0 striped bass **2.26·e^(5.73r)**.
  - Age-1 striped bass (120–190 mm) predators: 1.30·e^(7.14r) and 1.08·e^(7.62r).
  - Species are assigned to equations in the PDF's column order, which matches the ranking in the text [inf].
  - At r = 0.2: 3–7 s. At r = 0.4: 10–22 s.
- **Mechanical, esocids and perch** (minutes): tiger muskie grasp-to-ingestion table, Wahl & Stein 3–6 min, perch 110–770 s (RF §3.3).
- **Digestion dominates.** With h_mech = 5 s, the Holling maximum is ~17,000 prey/d. The digestive maximum for a 1.5-g fish on 10-mg larvae (Imax ~0.3 g/d) is ~30/d [inf].
  - Perch: Imax = 1/H = **0.2·x^0.8 g/d**. With W ≈ 1.74x: **12.8 %/d at 1 g, 9.3 % at 5 g, 8.1 % at 10 g** [inf]. Perch are slower than bass (Snow 15 %).
  - Breck 1993: handling is "largely irrelevant" to a piscivore's daily ration; a type I up to a daily maximum may fit better (RF §5.6) [abstract].

### 1.5 Half-saturation densities [inf]
Use N½ = 1/(a·h_eff), with h_eff = prey mass / Imax.

| Predator | Prey | a (daily-averaged) | Imax | h_eff | **N½** |
|---|---|---|---|---|---|
| 5 cm, ~1.4 g | 10-mm larva, ~0.01 g | 4 m³/d (perch formula) | ~0.28 g/d (FB4 largemouth, 22 °C) | 0.036 d | **~7 m⁻³** |
| 10 cm, ~10 g | 25-mm juvenile, ~0.15 g | 6.3–9.6 m³/d | ~1.2 g/d | 0.125 d | **~0.8–1.3 m⁻³** |
| Same, in-bout | — | 3 m³/h (72 m³/d) | — | — | **~0.1–0.5 m⁻³** |

- Prey masses are rough length–weight values [inf].
- In a 0.5–1.5-m littoral, per m³ ≈ per m² within a factor of ~1–2.
- **Consequence:** inside a fry school (10²–10³ m⁻², §3.1) a young piscivore is fully saturated (gut-limited). Outside schools (lake-average ~0.5–2 m⁻² of all sizes, few in its window) it is near-linear. The school-finding step, not the within-school rate, sets most predation [inf].

### 1.6 Shape of the response
- **Type II** in every comparative-functional-response study of juvenile largemouth that I found [abstract]:
  - on guppies in artificial vegetation (Alexander, Kaiser, Weyl & Dick 2015, EBF 98:477): attack rates were *higher* in complex habitat but handling longer, so simpler habitat gave higher maximum feeding;
  - on mosquito larvae at 18, 24 and 30 °C (Khosa et al. 2020, EBF);
  - on tilapia fry with and without structure (Khosa et al. 2021, Afr. J. Aquat. Sci. 46:353);
  - on tilapia of three sizes (Cuthbert et al. 2020, Ecol. Evol. 10:5946): attack rates peaked at intermediate predator:prey mass ratios; handling fell as the ratio rose.
- **Type III for most piscivores** in a multispecies review ("nearly all responses were Holling type III", NOAA [snippet](https://repository.library.noaa.gov/view/noaa/29560/noaa_29560_DS1.pdf)).
  - Refuges and patch search produce type III-like behaviour at low density.
  - Small arenas force type II [inf].
- **0+ pike (165–220 mm) on roach at 5–13 °C:** type II in most conditions; a dome-shaped type IV in cold clear water, possibly from seasonal prey schooling (Nilsson-Örtman et al. 2026, J. Anim. Ecol. [abstract/snippet]; data on [Dryad](https://datadryad.org/dataset/doi:10.5061/dryad.kkwh70sjc)).
- **Captures come in bouts** (compound Poisson), consistent with prey met as schools (Petersen & DeAngelis 1992; RF §5.7).

### 1.7 Requested sources not reached, or reached only as abstracts
- Christensen 1996 (Oikos): not found.
- Bry et al. 1992 (EBF 35:75) [abstract]:
  - pond larvae at **6 vs 18 m⁻²**; no cannibalism at 13–35 mm;
  - at ~100 mm cannibals were **7.8 % vs 41.3 %** of juveniles (**15.5 % vs 65.9 %** of biomass);
  - prey were swallowed whole, head first, and size-limited by the mouth.
- Giles, Wright & Nord 1986 (JFB 29:107) [abstract]:
  - fry at **277, 555, 833 m⁻²** in 0.054-m³ tanks;
  - zooplanktivorous fry stopped growing at 22 mm; **1–4 %** turned cannibal at 5 weeks;
  - cannibalism began in all tanks when predator:prey size was **~2:1**.
- Wright & Giles 1987 (JFB 30:617) [abstract]: cannibalism at **5.45–81.4 fry/m²** in ponds; **≤ 5 fry/m²** advised.
- Skov et al. 2003 (Hydrobiologia 506:481) [abstract]: in 936 0+ pike (2–18 cm), fewer than half ate fish until **10.1–13.7 cm**, despite abundant 0+ roach, which used antipredator behaviour.
- Juanes, Buckel & Scharf 2002 chapter: scanned PDF, unreadable.
- Paradis, Pepin & Brown 1996 [abstract] (§2.3).
- Letcher et al. 1996 (CJFAS 53:787) [abstract]: predator size explained **83 %** of the variability in cohort survival in their generalized larval IBM; prey availability had only a minor effect.
- Rose, Cowan & Houde 1996 (ICES JMS 53:23) [abstract]: vulnerability is dome-shaped with larval size for invertebrates, and for fish only if they forage optimally by size.
- Madenjian & Carpenter 1991 (Ecol. Appl. 1:268) [abstract]: derived the link between an IBM encounter rate λ and a type II half-saturation κ for YOY walleye eating YOY perch. Values were not obtained.
- Not reached: Rice, Crowder & Binkowski; Hartman & Margraf; Persson & Eklöv 1995; Fuiman & Gamble; Cowan & Houde; Bailey & Houde; Breck & Gitter (equation obtained via DeAngelis 1993, §2.1).
- "Pothoven" was not identified as a larval-predation functional-response source.

---

## 2. Encounter models used in fish IBMs

### Takeaway
Encounter = scanned volume rate × prey density (Gerritsen–Strickler, RF §5.1–5.2). The scanned volume comes from reactive distance and the speed of predator or prey. Small larvae are detection-limited (transparent), so acuity formulas badly over-predict reactive distance for them. Capture per attack climbs to ~100 % once the predator is ≥ 15–17× the larva's length.

### 2.1 Reactive distance (RD)
- **Breck & Gitter 1983, as coded in DeAngelis et al. 1993's age-0 smallmouth IBM** [primary, OCR; [PDF](https://www.harkness.ca/PDFs/Contributions%201990s/deangelis%20et%20al%201993.pdf)]:
  - RD = prey length / (2·tan(θ/2)), θ = (2π/21,600)·exp(a) (arc-minutes → radians).
  - The OCR reads a = 9.14 − 2.14·ln(L_fish) + 0.229·…, with the squared term lost.
  - The usual form a = 9.14 − 2.4·ln L + 0.229·(ln L)², L in mm, gives θ ≈ 26′ for a 50-mm fish and RD ≈ 0.27 m for a 2-mm Daphnia [inf]. That is consistent with bluegill RDs in RF §1.1.
  - **Pitfall:** for a 10-mm larva the same formula gives RD > 1 m [inf]. Folkvord & Hunter's predators ignored 6-mm larvae at 20–30 cm [primary]. Piscivore RD is contrast-limited (Breck 1993; Aksnes & Utne in RF §5.3). Cap larval RD at ~0.1–0.3 m and scale by larval pigmentation and size.
- **Bass on fish:** RD ≈ 22·L_prey(cm) cm in bright light (Howick & O'Brien 1983), falling to ~30 cm at 0.2 lx. Smallmouth peak RD ~1 m at dawn light (Michels 2020). Both RF §1.4.
- **Larval fish (as prey, and as their own predators' RD):** log10 RD = **1.56·log10 L − 1.92** (n = 31, 3 species); search volume = **0.307·L − 1.237** (n = 51, 7 species). L in mm; the RD unit is unclear in the OCR, plausibly cm (≈ 0.44 cm at 10 mm) — Miller, Crowder, Rice & Marschall 1988, CJFAS 45:1657 [primary, OCR; [EPA copy](https://www.epa.gov/system/files/documents/2026-04/schiller-station-ar-326.pdf)].
- **Prey reaction distance** to an approaching young bluefish: **31–80 mm** by species. Anchovy and menhaden reacted late (30–40 mm); silverside and striped bass reacted at 80–90 mm (Scharf 2003 [primary]).

### 2.2 Search mode and speed
- **Cruising young piscivore (age-0 smallmouth IBM):** swimming speed **0.5 BL/s**, foraging **12 h/d**, daily Monte Carlo encounters from search volume (RD × speed) × prey density.
  - Larvae stay near the nest for 21 d after swim-up or until 20 mm (DeAngelis et al. 1993 appendix [primary]).
- **Ambushers (pike, pickerel):**
  - encounter is the flux of moving prey into the strike zone, Z = π·R²·N·u_prey (Gerritsen–Strickler limit; RF §5.1);
  - strike distance 0.15 m for a 25-cm pike vs 0.30 m for largemouth;
  - pike success 0.36 from ambush vs 0.12 in pursuit (RF §3.1–3.2).
  - Juvenile white seabass's slow, gliding stalk let 7–9-mm larvae evade more often than they did fast anchovy attacks (Margulies 1989 [primary]).
- **Larval swimming:** log10 speed = **1.07·log10 L − 1.11** (n = 93, 9 species; ≈ 0.9 cm/s ≈ 1 BL/s at 10 mm if speed is in cm/s and L in mm [inf]); burst = **3.33 + 0.71·L** (n = 16) (Miller et al. 1988 [primary, OCR]).
  - Juvenile prey bursts: **~100 cm/s at 30 mm, 150 cm/s at 50–55 mm** (fit 1.7–1.8·TL(mm) + 52–69 cm/s; Scharf 2003 [primary]).

### 2.3 Capture success and vulnerability vs predator:prey size
- **Larvae (pooled lab studies, fish and invertebrate predators):**
  - capture success rises with predator:prey length ratio; "a predator 15–17 times larger than its prey would experience 100 % success per attempt";
  - the maximum observed was 96 % (135-mm bloater on 10.9-mm bloater larvae, Rice et al. 1987a);
  - predators > 120 mm are "affected little" by larval size, but for predators < 50 mm larval size is "critically important";
  - the fitted equation is garbled in the OCR (Miller et al. 1988 [primary, OCR]).
- **Escape from attacks, Weibull N = K·(1 − exp(−(L/b)^A))** (Folkvord & Hunter 1986 [primary]):
  - against 85-mm anchovy: K = 0.93, **b = 17.85 mm**, A = 2.85. Escape was 8 % at 6 mm, **50 % at 17 mm (r = 0.20)** and 92 % at 33 mm.
  - Against 191-mm chub mackerel: 6 % at 6.7 mm → ~50 % at 30 mm (r = 0.16); 64 % of 50-mm juveniles escaped.
  - Responses (any evasive move): 16–26 % at 6 mm → ~100 % at 30 mm.
  - The predator field's upper limit is r ≈ **0.4–0.6** (their Table 2).
  - Predator error on non-evasive Artemia was 3.4 % (2.1 % in later trials).
- **Juveniles, linear in r** (Scharf 2003 [primary]; equation-to-species order [inf]):
  - YOY bluefish: anchovy **1.01 − 0.98r**; silverside **0.70 − 0.94r**; menhaden **1.12 − 1.66r**; age-0 striped bass (spiny) **0.70 − 1.34r**.
  - Age-1 striped bass predators: 0.77 − 1.29r and 0.49 − 1.15r.
  - Age-1 bluefish caught silversides better than age-0 bluefish, and caught both better near the bottom than at the surface (Bell, Buckel & Stoner 1999, JFB 55:990 [primary]).
- **Vulnerability (encounter × susceptibility), the review value:** dome-shaped, "maximal when fish larvae were 10 % of the length of the predator", for all predator types except cruising invertebrates (Paradis, Pepin & Brown 1996, CJFAS 53:1226 [abstract]).
  - Pepin 2016 (ICES JMS 73:196) repeats the ~10 % peak [primary].
- **Body form:** esocids catch soft-rayed fusiform prey 0.6–0.8 of the time but bluegill 0.10–0.14; bass catch small bluegill 0.6–0.8; perch catch 0.20 of singles and 0.03 of attacks into schools (RF §3.1, §6.2).

### 2.4 Vegetation
- **Largemouth on bluegill, rope stems at 0 / 50 / 250 / 1,000 per m²:** attacks/h ≈ 31 / 26 / 3 / ~0. Capture per attack holds (0.83 / 0.58 / 0.67). Stems act on encounter and attack, not capture (Savino & Stein 1982; RF §6.3).
  - ~130 natural *Potamogeton natans* stems/m² ≈ 250 rope stems/m² in cover (RF §6.3).
- **In a lake:** 0.15 vs 1.5 bluegill per bass per day in natural weed (113–203 stems/m²) vs cleared (Smith 1995; RF §3.1).
- **Patchiness matters as much as density** (half-cover pools; RF §6.3).
- **Juvenile-bass functional-response fits** in structure show *higher* fitted a and longer h (Alexander et al. 2015 [abstract]). This is probably an arena artefact; the sim should cut encounter rate or impose a refuge fraction, not raise a [inf].

---

## 3. Prey densities and rations, for checking a density rule

### 3.1 Young-of-year densities in north-temperate littorals

| Stage / time | Density | Source |
|---|---|---|
| Bluegill fry 4 d after nest dispersal (northern Wisconsin) | 54,000–205,000/ha (**5–20 m⁻²**) | Beard 1982 (FFE) [primary, via FFE] |
| Bluegill fry Z in those first 4 d | 0.109–0.385/d, then 0.001–0.008/d to autumn | Beard 1982 (RF §7.2) [primary] |
| Bluegill October fingerlings | 0.1–376,000/ha (≤ **38 m⁻²**) | Beard 1982 (FFE) |
| Fry produced per year, Deep Lake (MI, 6 ha) | bluegill 1.0–1.8 million/ha; bass 22,000–53,000/ha (2–5 m⁻²) | LMB note [primary, via LMB] |
| Smallmouth brood at first feeding | < 500 / 501–1,500 / > 1,500 larvae in **0.8 / 2.6 / 5.8 m²** (~100–600 m⁻² [inf]); 15–64 m² at 18.5 mm; dispersal at ~28 mm | Friesen & Ridgway 2000 (RF §7.3) [primary] |
| Limnetic bluegill larvae < 13 mm, peak | **12.5–15.8 m⁻³** (Nebraska Sandhill lakes, trawl); 0.28–0.51 m⁻³ (Claytor Lake, VA) | Chvala thesis [snippet](https://openprairie.sdstate.edu/etd/312); [VT thesis](https://vtechworks.lib.vt.edu/handle/10919/35261) [snippet] |
| Yellow perch, Oneida Lake | ~2.5×10⁵/ha at 18 mm (~25 m⁻²) → ≤ ~7×10³/ha by October (~0.7 m⁻²) | FFE [inf from chart axes] |
| Littoral totals, Spirit Lake, IA | mean 10,024/ha (~1 m⁻²). May–June lowest; September bluegill **2–3 orders higher** than in early months | Pierce et al. 2001 (SFN) [primary] |
| Pop nets in plant beds | **9.8 m⁻²** in intermediate mixed beds vs 1.8 in dense *Hydrilla* | Killgore et al. 1989 (MAC) [read] |
| Prairie wetland peaks | 107 fish m⁻² | Herwig & Zimmer 2007 (FZC) [abstract] |
| Young bass in a bluegill-fry lake | 179/acre (442/ha, 0.044 m⁻²); they ate **58–93 %** of littoral bluegill fry | Santucci & Wahl 2003 via Neuswanger 2015 (FFE) [secondary] |
| Bass fingerlings, mid-summer, Minnesota seine zone | 110–1,100/ha | LMB note |
| Pike fry ponds | 6–18 m⁻² (Bry); 5–81 m⁻² (Wright & Giles); cannibalism density-dependent | §1.7 [abstract] |
| Hot Brook design range | 0.5–2 fish/m² over weedy and sandy margins (late summer); 0.2–0.4 over rock; seasonal arc in SFN | SFN [inf] |

**Monthly arc for a Maine lake** (SFN synthesis + above) [inf]:
- **June:** larvae (perch and white perch limnetic, ~0.1–20 m⁻³; sucker; sunfish and bass in nests and broods at 10²–10³ m⁻² locally).
- **July:** fry schools disperse; tens per m² inside schools, a few per m² averaged over occupied weed.
- **August–September:** countable YOY peak at ~1 m⁻² of littoral.
- **October:** a few tenths per m².
- **Prey are clumped by 1–3 orders of magnitude relative to lake averages.**

### 3.2 Rations of young piscivores at 20–24 °C (fraction of body mass per day)

| Predator | Value | Source |
|---|---|---|
| Largemouth fingerling 5.8 g | ~0.15 (ad lib, live fish, 21–24 °C) | Snow 1961 [primary] |
| Tiger muskie 8.9 cm (~3–4 g) | ~0.35–0.45 on 2.5-cm minnows; ~0.15–0.19 on 3-cm bluegill (19 °C) | Beyerle 1980 [primary]; % [inf] |
| Pike larvae → juveniles (zooplankton diet) | 0.30 → 0.20 | Grès et al. 1996 [snippet] |
| Perch (cohort-model digestion cap) | 0.13 at 1 g; 0.08 at 10 g | Claessen 2002 [primary]; [inf] |
| FB4 largemouth Cmax, 22 °C | 0.255 (1 g), 0.15 (5 g) | [inf] |
| Chain pickerel, from growth (summer mean) | ~0.14–0.24 | [inf] |
| Adult/subadult largemouth (contrast) | ≈ 0 in mid-May → > 0.05 in late August | Cochran & Adelman 1982 (LMB) |

### 3.3 Consistency check of a density rule [inf]
- **Inputs:** young bass at 0.044 m⁻² (Santucci & Wahl) over a ~1-m littoral. a = 3.5 m³/d ≈ 3.5 m²/d. Bluegill fry at 10 m⁻². h_eff = 0.03 d (10-mg fry; Imax ~0.3 g/d).
- **Per-bass intake:** 3.5·10/(1 + 3.5·0.03·10) = 17 fry/d ≈ 0.17 g/d. That is ~9–11 %/d of a 1.5–2-g bass, inside Snow's 15 % cap.
- **Fry mortality:** μ = P·a/(1 + a·h·N) = 0.044·3.5/2.05 = **0.075/d**. Unsaturated (low N) it is **0.15/d**. Beard's early Z is 0.11–0.39/d. Over 14 d, 1 − e^(−0.075·14) = 65 %, inside Santucci & Wahl's 58–93 %.
- **Size dependence:** larval M ∝ L^−1.49 (ln Z = 0.163 − 1.49·ln L, n = 299 marine catch curves: Z = 0.11/d at 5 mm, 0.038 at 10 mm, 0.014 at 20 mm — Pepin 2016 [primary]).
  - The age-0 smallmouth IBM used 0.2·exp(−0.04·L mm)/d of size-dependent mortality plus a small size-independent term: 0.13 at 10 mm, 0.09 at 20 mm, 0.03 at 50 mm (DeAngelis et al. 1993, after Houpt 1991 [primary]).
  - Perch Z 0.042/d at 8–18 mm, 0.008–0.058/d in August–October (Irwin; RF §7.2).
- **So a ≈ 3–5 m³/d and digestion-limited h reproduce field fry mortality and young-bass rations without a free attack parameter.** In-bout tank rates applied all day would over-kill by ~10× [inf].

---

## 4. How cohort / super-individual models handle predation between cohorts

### Takeaway
The physiologically structured (cohort) models of the Persson–de Roos group are the most directly usable precedent. Every predator cohort eats every prey cohort through a size-windowed attack rate × prey *density* (per litre), inside a multi-prey Holling II with digestion as the handling term. Prey mortality is the sum over predator cohorts. Habitat compartments with time shares supply the overlap. IBMs with model individuals (DeAngelis, Rose) keep a fixed sample and rescale worth. OSMOSE uses cell co-occurrence with an eat-to-capacity rule (SI §2).

### 4.1 Cohort-to-cohort predation (Persson et al. 2004 Table 2; Claessen et al. 2002 Table 2) [primary]
- **Predator i's cannibalistic encounter rate (g/d):** η_c(i) = Σ_j A_c(ℓ_i, ℓ_j)·(x_j + y_j)·N_j. Here N_j is victims per litre, (x + y) is victim mass, and A_c is in L/d.
- **Intake:** I_i = η_i/(1 + H_i·η_i), with η_i the total over zooplankton, benthos and fish (encounter efficiencies e weight each).
- **Victim cohort j's cannibalism mortality (per day):** μ_c(j) = Σ_i e_c·A_c(ℓ_i, ℓ_j)·N_i/(1 + H_i·η_i).
  - The same saturation term appears in predator intake and prey mortality, so mass is conserved and predator saturation protects prey.
- **Overlap:** pelagic vs littoral compartments, with dates when cohorts shift habitat (YOY to the littoral on day 31) and time-share fractions (0.3:0.7).

### 4.2 Model individuals with a fixed sample (renormalization)
- **Age-0 smallmouth (DeAngelis et al. 1993)** [primary]:
  - "600 age-0 fish were simulated, representing the whole cohort … via a scaling factor" for cohorts of 50,000–2,000,000.
  - When a model fish died it was replaced by a random survivor, and the scaling factor fell.
  - Rose & Cowan (1993) found 500 model fish with renormalization agreed with runs of up to 500,000 individuals.
- **The resampling paper** (DeAngelis, Rose & Christensen 1993, Ecol. Model., doi 10.1016/0304-3800(93)90022-k [abstract]): predictions with vs without resampling differed by **< 1.5 %** for a suite of variables (YOY striped bass).
- **Predation in that IBM was a size-dependent hazard,** not explicit predators; prey were 7 zooplankton and 18 benthic size classes with logistic regrowth, and a carrying capacity of 70 mg m⁻³ and 49 g m⁻² dry [primary].
- **Explicit predators eating SIs:** OSMOSE (co-occurrence in a cell, size window, eat min(available, capacity), split over prey ∝ accessible biomass, random-order sub-steps); Shima's super-droplet pairing; Huse & Fiksen's vertical-overlap index (all SI §2).

### 4.3 Foraging-arena form (refuge and exchange) [inf: recalled from Walters, Christensen & Pauly 1997 / Ahrens, Walters & Christensen 2012 (Fish Fish. 13:41); not re-read this session]
- Prey split into vulnerable V and safe (N − V) pools exchanging at rate v. With predators P eating a·V·P: Q = a·v·N·P/(2v + a·P).
- Predation then saturates in *predator* density, a refuge-limited ratio dependence.
- This is a compact way to represent fry inside weed or near a guarding parent: v is the rate at which young leave cover, which is set by hunger and light.

### 4.4 Pitfalls [inf unless tagged]
1. **Wrong density.** A lake-average density makes predation too weak. The school's own head-count (today's `n/(n+30)`) ignores how spread out the school is.
   - Use two stages: (a) meeting the school (school density × scanned volume, or the agent's actual proximity); (b) feeding at the *local* density n_q/V_q inside it (RF §5.8; Petersen & DeAngelis clustering).
2. **Tank rates as field rates:** 10–30× too high (§1.2). Scharf 2003: small arenas inflate capture success [primary].
3. **Mechanical h without a gut cap.** Seconds of handling give thousands of prey per day. Use h = max(h_mech, W_prey/Imax) in one multi-prey denominator (zooplankton, insects, fish together), plus the gut-room cap already in the sim.
4. **Predator super-individual co-location.** If all n_a members of a predator agent act on one school, removal is concentrated n_a-fold (SI §2).
   - Multiply by the fraction of predator members overlapping the school.
   - Cap prey removed at min(n_q, n_a·room/W_q).
   - Never let a whole school die from one draw: use exponential survival over dt and Poisson/binomial with `core.rand`.
5. **The lower window limit drives dynamics** (Claessen 2002). Too small a δ lets every fish graze larvae at full rate. Paradis' peak at r ≈ 0.1 and Folkvord's undetected 6-mm larvae argue for a detection ramp below r ≈ 0.05–0.07 and for larvae < ~10 mm.
6. **Cover acts on encounter, not capture** (Savino & Stein), and patchiness matters. Represent it as a refuge fraction or reduced a, not lower capture.
7. **Guarding, diel timing and light:** broods next to a guarding male are mostly safe (sim `BROOD.PROTECT`). Bass detection collapses below ~1 lx while smallmouth keep 40 cm in the dark (RF §1.2, §1.4). Piscivory peaks at dawn and dusk.
8. **Order bias:** when several predators share a school in a step, compute total hazard first, then distribute deaths (OSMOSE sub-steps; PSPM sums), not first-come-first-served.

---

## 5. Recommended density-based rule for `_eatYoy` (both clocks) [inf, built from §1–4]

For predator agent or school a (n_a fish, length L_a, mass W_a, temperature T) and young school q (n_q, L_q, W_q, body depth, cover c_q, occupied volume V_q):

1. **Size window.** r = L_q/L_a, lR = 1/r.
   - w(r) = [(lR/5.3)·exp(1 − lR/5.3)]^6.5 (Persson & Brönmark), zero if body depth > gape (sim `gapeR`/`depthR`).
   - For larvae, use a peak nearer r ≈ 0.10 (Paradis) by multiplying by a detection ramp d(L_q): ~0.2 at 6 mm → 1 at ≥ 15 mm (Folkvord, Margulies).
   - Zero below r ≈ 0.04.
2. **Clearance.** a = a0(L_a)·w·d·φ_light·φ_cover·p_cap.
   - a0 (daily-averaged): 400·L_a(mm)^0.6 L/d, i.e. ~3–8 m³/d for 3–15 cm (range ×0.5–2; pikeperch peak 9.6).
   - Spread over the hours the species actually hunts (~12 h for a cruising young bass; crepuscular peaks for esocids and bass).
   - In fine (real-time) mode, while a fish is in a strike arena at a school, an in-bout ceiling of ~1–5 m³/h may apply, but the daily total must stay near a0.
   - φ_cover from stems: ≈ 1 / 0.85 / 0.1 / 0 at 0 / 50 / 250 / 1,000 rope-equivalent stems/m².
   - p_cap: 1.0 − 1.0·r for soft-rayed prey; 0.70 − 1.3·r for spiny or deep-bodied prey; ×0.2 for esocids on sunfish (existing `sp.capture × q.s.sp.vuln` can carry this).
3. **Local density.** D_q = n_q/V_q (m⁻³). V_q = footprint × layer thickness, e.g. a brood's 0.8–64 m² × ~0.5 m, or an open-water school's measured spread. The density per m³ inside schools is 10–10³.
4. **Handling.** h_q = max(h_mech(r), W_q/Imax), with Imax = FB4 Cmax(W_a, T) × W_a per foraging hour (or the Claessen perch cap 0.2·x^0.8 g/d for perch).
   - h_mech ≈ 2–3·e^(4.5–5.7r) s (Scharf), minutes for r > 0.4.
   - One denominator Σ over every prey type the fish is working (plankton and insects use their existing handling slots).
5. **Per-predator kill rate** k_q = a·D_q/(1 + Σ_j a_j·h_j·D_j).
   - **Prey hazard** μ_q = n_a·f_ov·k_q/n_q, with f_ov ∈ [0, 1] the fraction of the predator agent inside the school's footprint (1 for a single fish in range).
   - **Deaths** Δn ~ Poisson(n_q·(1 − e^(−μ_q·dt))), capped at min(n_q, n_a·room/W_q).
   - Add the prey's escape and refuge exchange (foraging arena) if weed cover is explicit.
6. **Coarse mode:** the same formula on per-cell Σ(n·mass) density tables (OSMOSE-like, SI §2), with f_ov = horizontal co-occurrence × vertical overlap (Huse & Fiksen).
7. **Calibrate against** (§3.3):
   - bluegill-fry Z 0.11–0.39/d for the first days after dispersal, then < 0.01/d;
   - perch larvae ~0.04/d; August–October YOY 0.008–0.06/d;
   - young bass removing 58–93 % of littoral fry;
   - young-piscivore rations 10–25 %/d at 20–24 °C, up to ~40 % on soft minnows;
   - M falling roughly ∝ L^−1.5 through the larval stage.

**What this changes vs today [inf].** `FRY.N_HALF = 30` fish becomes N½ ≈ 1/(a·h) ≈ 1–10 per m³ of the school's volume. A large school spread thin is then hunted less efficiently per fish than a small tight one. `FRY.ATTACK = 100 /s × TS` becomes a physically scaled clearance (m³/s) × density, saturated by the gut. Dilution then emerges: per-capita risk inside a saturated school ∝ 1/n_q.

---

## Gaps
- **No measured a or h for 3–15-cm esocids, bass or perch eating larval or juvenile fish at known densities.** Galarowicz & Wahl 2005 (CJFAS 62:2330, age-0 walleye), Lundvall et al. 1999 (CJFAS 56:1285), Christensen 1996 and Persson & Eklöv 1995 were not obtainable. The perch PSPM β·c^0.6 is from ≥ 30-mm fish; the pikeperch hump is from ≥ 130-mm fish. Extrapolating both to 3–6-cm predators is [inf].
- Clearance rates of adult panfish and killifish on larvae (Cowan & Houde 1993; Fuiman & Gamble 1988; Bailey & Houde 1989) were not read (MEPS rate-limited; review paywalled).
- Field densities of larval perch and white perch per m³ in small Maine-type lakes; a natural density for pike or pickerel fry nursery areas.
- The units of Miller et al. 1988's RD and speed regressions; Breck & Gitter's exact coefficients (OCR-garbled in DeAngelis 1993).
- Whether FB4's pike Cmax truly under-predicts fingerling esocid intake (Beyerle's single trial) or Beyerle's "consumed" includes prey lost other ways.

## Sources (opened this session)
- Persson L. et al. 2004. Ecol. Monogr. 74:135–157 — [PDF](https://staff.fnwi.uva.nl/a.m.deroos/downloads/pdf_pubs/world/EcolMon04.pdf) [primary]
- Claessen D., van Oss C., de Roos A.M., Persson L. 2002. Ecology 83:1660–1675 — [PDF](https://staff.fnwi.uva.nl/a.m.deroos/downloads/pdf_pubs/world/Ecology02.pdf) [primary]
- Persson A., Brönmark C. 2002. Ecology 83:3014–3022 — [PDF](https://lup.lub.lu.se/search/files/4398124/625096.pdf) [primary]
- Folkvord A., Hunter J.R. 1986. Fish. Bull. 84:859–869 — [PDF](https://spo.nmfs.noaa.gov/sites/default/files/pdf-content/1986/844/folkvord.pdf) [primary]
- Margulies D. 1989. Fish. Bull. 87:537–552 — [PDF](https://spo.nmfs.noaa.gov/sites/default/files/pdf-content/1989/873/margulies.pdf) [primary]
- Scharf F.S., Buckel J.A., McGinn P.A., Juanes F. 2003. JEMBE 294:41–59 — [PDF](https://www.cmast.ncsu.edu/cmast-sites/buckel/scharf_JEMBE.pdf) [primary]
- Bell G.W., Buckel J.A., Stoner A.W. 1999. J. Fish Biol. 55:990–1000 — [PDF](https://www.cmast.ncsu.edu/cmast-sites/buckel/JFB_bell_cannibalism.pdf) [primary]
- Miller T.J., Crowder L.B., Rice J.A., Marschall E.A. 1988. CJFAS 45:1657–1670 — [EPA copy](https://www.epa.gov/system/files/documents/2026-04/schiller-station-ar-326.pdf) [primary, OCR]
- DeAngelis D.L., Shuter B.J., Ridgway M.S., Scheffer M. 1993. TAFS 122:927–941 — [PDF](https://www.harkness.ca/PDFs/Contributions%201990s/deangelis%20et%20al%201993.pdf) [primary, OCR]
- Snow J.R. 1961. Proc. SEAFWA 15:303–313 — [PDF](https://seafwa.org/sites/default/files/journal-articles/SNOW-303.pdf) [primary, OCR]
- Beyerle G.B. 1980. Michigan DNR Fish. Tech. Rep. 1980-1 — [PDF](https://www.dnr.state.mi.us/PUBLICATIONS/PDFS/DNRFishLibrary/TechnicalReports/TR80-1.pdf) [primary]
- Pepin P. 2016. ICES J. Mar. Sci. 73:196–203 — [article](https://academic.oup.com/icesjms/article/73/2/196/2614195) [primary]
- Paradis A.R., Pepin P., Brown J.A. 1996. CJFAS 53:1226–1235 — [record](https://cdnsciencepub.com/doi/10.1139/f96-051) [abstract]
- Giles N., Wright R.M., Nord M.E. 1986 (JFB 29:107); Wright & Giles 1987 (JFB 30:617) — [GWCT](https://gwct.org.uk/research/scientific-publications/1980-89/1986/giles1986/) [abstract]
- Bry C. et al. 1992. EBF 35:75–84 [abstract]; Skov C. et al. 2003. Hydrobiologia 506:481 — [record](https://agris.fao.org/search/fr/records/65df9d824c5aef494fe393bd) [abstract]
- Grès P., Lim P., Belaud A. 1996. Bull. Fr. Pêche Piscic. 343:153–174 [snippet]
- Alexander M.E. et al. 2015. EBF 98:477–486 [abstract]; Khosa D. et al. 2020 (EBF), 2021 ([record](https://eprints.whiterose.ac.uk/id/eprint/180377/)) [abstract]; Cuthbert R.N. et al. 2020. Ecol. Evol. 10:5946 [abstract]
- Letcher B.H. et al. 1996. CJFAS 53:787 — [USGS](https://pubs.usgs.gov/publication/1014830) [abstract]; Rose K.A., Cowan J.H., Houde E.D. 1996 — [record](https://catalog.comses.net/publications/185173) [abstract]
- Madenjian C.P., Carpenter S.R. 1991 — [record](https://catalog.comses.net/publications/101749) [abstract]; DeAngelis, Rose & Christensen 1993 — [record](https://catalog.comses.net/publications/98792) [abstract]
- Chipps S.R., Einfalt L.M., Wahl D.H. 2000 (tiger muskellunge Cmax tests) — [USGS](https://www.usgs.gov/publications/growth-and-food-consumption-tiger-muskellunge-effects-temperature-and-ration-level) [abstract]: the model overestimated winter consumption by 113–328 %; errors were 4–58 % at 20–25 °C.
