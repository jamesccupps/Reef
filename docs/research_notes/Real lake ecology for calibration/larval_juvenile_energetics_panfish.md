# Larval and juvenile energetics of the panfish and smallmouth: first feeding (~5–10 mm) to ~8 cm (2026-10-21)

**Why.** The sim's young grow too slowly to survive their first winter. It runs them on these FB4 sets:
- yellow perch and white perch: the FB4 yellow perch juvenile set;
- pumpkinseed and redbreast: the bluegill juvenile set (× `FRY.CMAX_LARVA` 1.5 to 2 cm);
- small smallmouth: Rice et al. 1983's largemouth set, with a respiration floor at 0.1 g.

At full ration on zooplankton (2,400 J/g wet), a 6-mm larva grows 0.2–0.5 mm/d. Young end the summer at:

| Species | Sim's first-autumn length (cm) |
|---|---|
| White perch | 4.4–5.5 |
| Pumpkinseed | 2.7–3.0 |
| Redbreast | 2.1–2.9 |
| Yellow perch | 6.2–7.7 |
| Smallmouth | 6–8.4 |

All of these are below the sim's first-winter thresholds.

This note asks two questions:
- Do the FB4 sets understate larval Cmax, or overstate larval metabolism?
- What first-summer growth does the field show in the north?

**STATUS: PARTIAL.**
- **Done:**
  - the FB4 parameter file (every relevant row, read twice);
  - the general larval-physiology literature;
  - percid and Morone larval analogue sets;
  - a full-ration growth analysis of every candidate set on the sim's own equations and Maine calendar (§4).
- **Not done:** three species-focused literature sub-searches were still running when this note was handed off. Their results are **not** in this note:
  - yellow perch: the Post 1990 tables, Worischka & Mehner 1998, Oneida/St. George growth by date, energy density;
  - centrarchids: larval Cmax, Coutant & DeAngelis 1983, DeAngelis et al. 1993, Shuter 1980 growth, northern YOY lengths;
  - white perch and banded killifish: Margulies 1989, Johnson 1995, striped-bass larval rations, killifish growth.
- The questions they cover are listed under **Gaps**. Field lengths below come from notes already in the repo, cross-referenced, not re-read.

**Companion notes (not repeated):**
- **FZC** `fish_zooplankton_coupling.md`: Breck 1997, Irwin et al. 2009, Mills & Forney 1981, Keast 1980's prey ladder, and the first FB4 Cmax table.
- **FWM** `first_winter_mortality.md`: Post & Evans 1989, Shuter et al. 1980, Johnson & Evans, Bernard & Fox, Shoup & Wahl.
- **BGW** `bullhead_growth_and_young_white_perch.md`: YOY white perch lengths in New York.
- **JRB** `juvenile_refuges_and_bass_young.md`: Ridgway 2002 (Opeongo YOY smallmouth).
- **CPE** `../Maine lakes ponds and streams/centrarchid_percid_esocid_parameters.md`: adult sets.
- **ELE** `../Predator winter energetics/esocid_larval_energetics.md`: the same question for pickerel. It found isometric larval metabolism and a larval Cmax far above the adult pike set's.

**Tags.**
- **[primary]**: I read the full text or data file.
- **[secondary]**: read in a source that cites it; both are named.
- **[abstract]**: abstract only (OpenAlex record or publisher page).
- **[snippet]**: search-engine summary only.
- **[inf]**: my inference or arithmetic.
- **[repo X]**: the value is held, with its own tag, in companion note X.

**Units.**
- W is grams wet (FB4 convention: "mass (W, in g)", FB4 User Guide [primary]).
- Cmax is g prey per g fish per day at the optimum temperature (CTO) unless a temperature is given.
- SGR = 100·ln(W₂/W₁)/days.
- mm are TL.
- 1 g O₂ = 13,560 J (FB4).
- The sim's length–weight relations (`species.js` `lw`, g and cm) are used for every conversion in §4. Masses for a 6 / 10 / 20 / 50 / 80-mm fish:

  | Species | 6 mm | 10 mm | 20 mm | 50 mm | 80 mm |
  |---|---|---|---|---|---|
  | Yellow perch | 1.3 mg | 7.0 mg | 66 mg | 1.26 g | 5.8 g |
  | White perch | 2.4 mg | 12 mg | 105 mg | 1.85 g | 8.0 g |
  | Pumpkinseed | 2.2 mg | 11 mg | 108 mg | 2.09 g | 9.6 g |
  | Redbreast | 4.5 mg | 21 mg | 168 mg | 2.65 g | 10.9 g |

---

## 1. Takeaway tables

### Yellow perch (*Perca flavescens*)

| Quantity | Value | Size, temperature | Source [tag] |
|---|---|---|---|
| **FB4 juvenile set (the sim's)**, confirmed | CEQ 2, CA 0.25, CB −0.27, **CQ 2.3**, CTO 29, CTM 32; REQ 2, RA 0.0108, RB −0.2, **RQ 2.1**, RTO 32, RTM 35, ACT 1, SDA 0.15; EGEQ 2 (FA 0.158, FB −0.222, FG 0.631); EXEQ 2 (UA 0.0292, UB 0.58, UG −0.299); ED 4186 | adult set identical except CTO 23, CTM 28, RTO 28, RTM 33 | Kitchell et al. 1977 via [FB4 Parameters_official.csv](https://github.com/jim-breck/FB4/blob/master/Parameters_official.csv) [primary] |
| **FB4 larval set** | CEQ 2, **CA 0.51, CB −0.42**, CQ 2.3, CTO 29, CTM 32; REQ 2, **RA 0.0065**, RB −0.2, RQ 2.1, RTO 32, RTM 35, **ACT 1** (4.4 in earlier versions); SDA 0.15; FA 0.15, UA 0.15 (constant); **ED 2,512 J/g** | "larvae" | Post 1990; Hewett & Johnson 1992; Worischka & Mehner 1998, via FB4 file [primary]. Also in CPE. |
| Larval set at full ration [inf] | **5.1 / 9.6 mm/d at 6 mm, 2.5 / 4.0 at 20 mm** (15 / 21 °C; Cmax 3.6 / 5.6 g/g/d at 6 mm). Physically impossible. Field growth of 0.5 mm/d needs p **0.11–0.32**. | §4 | sim equations [inf] |
| In-situ YOY perch (Post 1990) | Adult allometry "inappropriate" for larvae and juveniles. YOY active metabolism has the adult mass slope but is **4.4 × standard** (adults 1–2 ×). YOY consumption is higher than adult allometry predicts. | YOY, Lake St. George, ON | [Post 1990, CJFAS 47:554–560, doi 10.1139/f90-063](https://doi.org/10.1139/f90-063) [abstract] |
| **Age-0 percid analogue: walleye** | Cmax and resting-metabolism intercepts higher than adults'; slopes the same. Best fit with ACT 3 or activity tied to prey biomass. The adult model "was a poor predictor" of age-0 growth. | 8–49 mm, 0.0021–0.82 g; ponds at 10–50 fish/m³ | [Madon & Culver 1993, TAFS 122:797–813](https://doi.org/10.1577/1548-8659(1993)122%3C0797:BMFLAJ%3E2.3.CO;2) [abstract] |
| Its FB4 row | CA **0.45**, CB −0.27, CQ 2.3, CTO 25, CTM 28; RA **0.0138**, RB −0.22, RTO 27, RTM 32, **ACT 3**, SDA 0.10, FA 0.25, UA 0.05, ED 3,349 | larval and juvenile | FB4 file [primary]. Against the adult percid set (CA 0.25, RA 0.0108): **Cmax 1.8 ×, resting R 1.28 ×, × 3 activity** [inf] |
| Field larval growth (Oneida) | 0.48 mm/d from 8 to 18 mm; implied ration ~0.45 g/g/d ≈ 0.9 × FB4 juvenile Cmax at 12 mm, 20 °C | Oneida L., NY | Irwin et al. 2009 [repo FZC] |
| YOY ration, energetics (Oneida) | Intake averaged 23 % of body energy (presumably per day); assimilation ~68 %; gross efficiency ~27 % | 20–50 mm, on *D. pulex* | Mills & Forney 1981, TAFS 110:479 [repo FZC, abstract] |
| First-year length–weight (Red Lakes, MN) | W = 0.6198 × 10⁻⁵ L^3.1251 (units not given in the abstract; mm and g fit). First-season growth varies widely between years and tracks food. | first year | [Pycha & Smith 1955, TAFS 84:249–260](https://pubs.usgs.gov/publication/1000346) [abstract] |
| First-winter threshold | 60.7 ± 4.7 mm → 76 % die; 71.4 → 42 % (154 winter days) | L. St. George | Post & Evans 1989 [repo FWM] |
| Sim's ramp at 208 winter days [inf] | everything below **50 mm** dies; none above **80 mm**; 50 % at 65 mm | `WINTER0.K.perch` [1.04, 0.87] | config.js [inf] |

### White perch (*Morone americana*)

| Quantity | Value | Size, temperature | Source [tag] |
|---|---|---|---|
| FB4 white perch set | **none** | — | FB4 file [primary] |
| **FB4 Morone larval set** (striped bass larvae = white bass larvae) | CEQ 2, **CA 0.48, CB −0.252, CQ 2.8615, CTO 28.3, CTM 31.3**; REQ 2, RA 0.0132, RB −0.265, RQ 2.1059 (white bass 2.1056), RTO 31.3, RTM 34.3, **ACT 1.5**, SDA 0.172, FA 0.15, UA 0.10, **ED 3,349** | larvae | "Johnson 1995" (a thesis), via FB4 file [primary] |
| FB4 striped bass age-0 | CEQ 3, CA 0.3021, CB −0.2523, CQ 2.6, CTO 21.6, CTM 22.7, CTL 28.3, CK1 0.047, CK4 0.713; REQ 1, RA 0.001456, RB −0.2702, RQ 0.08339, RTO 0.9014, RK1 1, ACT 1, SDA 0.172, FA 0.104, UA 0.068, ED 5,023 | age-0 | Hartman & Brandt 1995, via FB4 file [primary] |
| Morone larval vs the perch juvenile set [inf] | Cmax **1.4 × at 6 mm, 1.6–1.7 × at 20–80 mm** (21 °C). Full-ration growth 0.74 / 0.96 / 1.17 mm/d at 6 / 20 / 50 mm (21 °C), against the perch set's 0.47 / 0.50 / 0.52. | §4 | [inf] |
| Field YOY lengths | Cayuga: 57.5 mm on 30 Sep, 68 mm (41–93) on 10 Oct. Onondaga: August means 42–60 mm; late Sept 68 mm. | NY | [repo BGW] |
| Sim's ramp [inf] | the same as yellow perch: **50–80 mm** | — | config.js |

### Pumpkinseed (*Lepomis gibbosus*) and redbreast (*L. auritus*)

| Quantity | Value | Size, temperature | Source [tag] |
|---|---|---|---|
| FB4 bluegill juvenile set (the sim's), confirmed | CEQ 2, CA 0.182, CB −0.274, CQ 2.3, CTO 31, CTM 37; REQ 2, RA 0.0154, RB −0.2, RQ 2.1, RTO 37, RTM 41, ACT 1, SDA 0.172; EGEQ 2 (0.158, −0.222, 0.631); EXEQ 2 (UA 0.0253, 0.58, −0.299); ED 4186 | adult set: CTO 27, CTM 36, RTO 36, RTM 40 | Kitchell et al. 1974 via FB4 file [primary] |
| Pumpkinseed or larval *Lepomis* FB4 set | **none** | — | FB4 file [primary] |
| **Field-fitted larval bluegill** (Michigan ponds) | CA had to be raised **50 %, to 0.273**. Respiration replaced by RA 0.00272 g O₂/g/d, RB −0.269, RQ 0.0589 (Evans 1984 × 2). ED 2,300 J/g for age-0 bluegill. Growth ~0.6 mm/d for 30–40 d, then ~0.2. Low-density pond: 5 → 99 mm by late October (~0.64 mm/d). | YOY | Breck 1997, Michigan DNR RR1995 [repo FZC] |
| Bluegill juvenile set at full ration [inf] | **cannot reach 0.5 mm/d at any size at 21 °C**: needs p **1.9** (pumpkinseed weight–length) and **1.9–2.5** (redbreast). × 1.5 Cmax needs p 1.13; Breck's set needs p 1.0. | §4 | [inf] |
| Northern YOY autumn length | ~25–45 mm in Ontario; "up to 5 cm" in Wisconsin | — | [repo FWM, CPE] |
| Sim's ramps at 208 days [inf] | pumpkinseed **25–42 mm**; redbreast **27.5–46 mm** | `WINTER0.K` | config.js |
| Redbreast weight–length artefact [inf] | The sim's redbreast `lw` (a 0.0209, b 3.01, Alabama adults) makes a 6-mm larva **4.5 mg**, twice a pumpkinseed's 2.2 mg. At the same Cmax per gram it grows ~15–20 % fewer mm/d (0.20 vs 0.24 mm/d at 21 °C). | — | §4 [inf] |

### Smallmouth bass (*Micropterus dolomieu*)

| Quantity | Value | Size, temperature | Source [tag] |
|---|---|---|---|
| FB4 smallmouth rows | **Whitledge et al. 2003** (sub-adult and adult): CA 0.339, CB −0.31, CQ 4.2 (T ≤ 26) / 1.95 (T > 26), CTO 22, CTM 37; RA 0.244, RB −0.756, RQ 1.8, RTO 30, RTM 37, ACT 1, SDA 0.15848, FA 0.104, UA 0.0882, ED 4184. **Shuter & Post 1990** (adult): CA 0.25, CB −0.31, CQ 3.8, CTO 29, CTM 36; RA 0.03, RB −0.21, RQ 3.3, RTO 30, RTM 37, ACT 2, SDA 0.16, ED 4186. **No YOY or larval bass row.** | — | FB4 file [primary] |
| Rice et al. 1983 largemouth (the sim's young-bass stand-in) | CEQ 2, CA 0.33, CB −0.325, CQ 2.65, CTO 27.5, CTM 37; REQ 1, RA 0.008352, RB −0.355, RQ 0.0313, RTO 0.0196, RK1 1, ACT 1, SDA 0.15848, FA 0.104, UA 0.08817, ED 4184 | adult | FB4 file [primary] |
| Rice set (R floor W ≥ 0.1 g) at full ration [inf] | 21 °C: **1.32 mm/d at 6 mm, 1.07 at 10, 0.61 at 20, 0.52 at 30, 0.55 at 50**. 15 °C: 0.24 at 15 mm, **~0 at 20–30 mm** (Cmax falls with T; the Rice respiration hardly does). | §4 | [inf] |
| Field YOY | Opeongo, early September: **48–53 mm**. Spednic L., Maine, measured: **71–76 mm** (36–49 % modelled winter loss) | — | Ridgway 2002 [repo JRB]; Dudley & Trial 2014 [repo FWM] |
| Sim's ramp at 208 days | **48–92 mm** (Shuter et al. 1980) | — | config.js; [repo FWM] |

### Banded killifish (*Fundulus diaphanus*)

Nothing on larval or juvenile energetics was reached in this pass; that sub-search was still running. The sim runs them on the FB4 fathead set (`species3.js`).

---

## 2. Findings by question

### Q1. Maximum consumption of larvae and juveniles, and its mass exponent

**The FB4 file has larval and age-0 sets that the sim does not use** [primary, read twice]:
- yellow perch larvae (Post 1990 lineage);
- walleye larvae and juveniles (Madon & Culver 1993);
- striped bass and white bass larvae (Johnson 1995);
- striped bass age-0 (Hartman & Brandt 1995);
- Eurasian perch "larvae & YOY" (Karjalainen et al. 1997);
- also, for other taxa: alewife larval (Klumb et al. 2004), vendace, European whitefish and smelt larvae and juveniles.

Every one has a **higher Cmax intercept** than the adult set of its family, as the table shows.

| Set | CA | CB | Cmax at 1 g, CTO | Cmax at 10 mg, CTO [inf] |
|---|---|---|---|---|
| Yellow perch juvenile/adult (Kitchell 1977) | 0.25 | −0.27 | 0.25 | 0.87 |
| **Yellow perch larvae** | **0.51** | **−0.42** | 0.51 | **3.5** |
| **Walleye larvae & juvenile** | **0.45** | −0.27 | 0.45 | 1.57 |
| **Morone larvae** | **0.48** | −0.252 | 0.48 | 1.53 |
| Striped bass age-0 (CEQ 3) | 0.30 | −0.252 | 0.30 | 0.96 |
| Bluegill (Kitchell 1974) | 0.182 | −0.274 | 0.18 | 0.64 |
| Breck 1997 bluegill fit | 0.273 | −0.274 | 0.27 | 0.96 |
| Largemouth (Rice 1983) | 0.33 | −0.325 | 0.33 | 1.48 |

**The percid evidence points the same way** for intercepts. The slopes differ:
- **Post 1990** [abstract]: YOY yellow perch consumption measured in situ exceeded adult allometry.
- **Madon & Culver 1993** [abstract]: age-0 walleye (8–49 mm) had higher Cmax and resting-metabolism intercepts than adults, with **the same slopes**. Their FB4 row keeps CB −0.27.
- So in the walleye work the larval excess is an intercept (~1.8 ×), not a steeper exponent [inf].
- FB4's larval perch row instead steepens the slope to −0.42. That makes the excess grow without bound toward small sizes: 3.5 g/g/d at 10 mg and 29 °C [inf].

**The FB4 larval yellow perch set cannot be a full-ration Cmax** [inf, §4]:
- At p = 1 it grows a 6-mm larva 5–13 mm/d and a 50-mm juvenile 1.6–3.1 mm/d (15–24 °C).
- It would carry a perch to 23 cm by October.
- Even with ED 4,186 instead of its 2,512, it still gives 2.7–6.0 mm/d at 6 mm.
- Matching the field's ~0.5 mm/d needs p ≈ 0.11–0.32, and maintenance is p 0.02–0.13.
- Either it was fitted for use with in-situ p-values (Post's 'in situ estimates'), or a unit or transcription issue lies between Post 1990 and FB4. FB4's own note records that RA and ACT were already revised once.
- Do **not** adopt it before Post 1990's tables are read. Note also that FB4's Eurasian perch larval row pairs CEQ 1 with CQ 2.3, which gives e^(2.3·T). That row is evidently garbled as well.

**Lepomis:**
- No measured larval Cmax was reached in this pass.
- The one field fit (Breck 1997) needed CA × 1.5, and paired it with a lower, Evans-based respiration [repo FZC].
- On the sim's equations, the unmodified bluegill set cannot produce the 0.4–0.7 mm/d of limnetic bluegill larvae at any p ≤ 1 (§4) [inf].
- So for the sunfishes the FB4 set clearly **understates larval and juvenile Cmax**: at least the 1.5 × that the sim already applies, and that only to 2 cm. Breck applied it across the whole first summer.

**Bass:** no larval or YOY consumption data were reached in this pass. Coutant & DeAngelis 1983 and DeAngelis et al. 1993 were assigned to the pending sub-search.

### Q2. Larval metabolism against the FB4 extrapolation

- **Post & Lee 1996**, CJFAS 53:910–923, doi 10.1139/f95-278 [abstract, via OpenAlex]:
  - Mass-specific metabolic slopes in early life range from **−0.45 to +0.14**.
  - Whole-life series (carp, rainbow trout, red sea bream) are **biphasic**, with a species-specific inflection that is not tied to metamorphosis.
  - Active and routine metabolism inflect together (trout).
- **Yagi & Oikawa 2014**, Sci. Rep. 4:7135, [PMC4238301](https://pmc.ncbi.nlm.nih.gov/articles/PMC4238301) [primary] (Japanese flounder, 0.26 mg–0.9 g, 18 °C):
  - Whole-animal exponents by phase: **0.68** (0.41–1.5 mg), **0.825** (2.5–9.9 mg), **0.875** (16–140 mg), **0.782** (0.24–0.9 g).
  - Phase shifts at ~2 mg, ~10 mg and ~0.2 g. The shared intra-phase exponent is 0.831, but the intercept steps up at each shift, so the overall exponent is **0.915**.
  - From 0.26 to 5.5 mg, b ≈ 1, i.e. isometric.
  - The paper cites Giguère et al. 1988, Oikawa et al. 1991, Post & Lee 1996 and Bochdansky & Leggett 2001 for larval isometry or near-isometry.
  - In mass-specific terms: ~0 slope for larvae, −0.1 to −0.2 for juveniles [inf].
- **FB4 RB −0.2** (perch, bluegill) is therefore close to the juvenile phase and modestly too steep for the first ~10 mg [inf]. Applied as W^−0.2 from 1 mg, it overstates mass-specific standard respiration at 1–5 mg by about (0.01/W)^0.2 ≈ 1.4–1.6 ×, if larval metabolism is flat to ~10 mg [inf].
- **Rice RB −0.355** is far too steep for larvae [inf]. The sim's `FRY.R_WMIN` 0.1 g floor for steep sets is consistent with the isometric-larva evidence [repo audit_physiology].
- **Activity is the larger term:**
  - YOY perch run at **4.4 ×** standard (Post 1990 [abstract]);
  - age-0 walleye fit best at **ACT 3** (Madon & Culver 1993 [abstract]).
  - FB4's larval perch row has ACT 1 with RA 0.0065. That is 0.6 × the juvenile's RA with no activity multiplier, low against Post's 4.4 × [inf].
  - So the larval sets are **high-consumption, high-activity** budgets. Raising Cmax alone, without the activity cost, would overshoot (Breck 1997 instead lowered respiration while raising Cmax, for bluegill; FZC already noted the stacking risk).
- **Freshwater vs marine larvae** (Houde 1994, ICES J. Mar. Sci. 51:91–97):
  - After temperature correction, freshwater larvae had **lower metabolic demand** and lower mortality than marine larvae, with similar growth rates and growth efficiencies.
  - Survival to metamorphosis was ~5.3 % (freshwater) vs ~0.12 % (marine).
  - [snippet; full text at an EPA URL that now redirects]
- **Houde 1989**, Fish. Bull. 87:471–495, [PDF](https://spo.nmfs.noaa.gov/sites/default/files/pdf-content/1989/873/houde.pdf) [snippet of the abstract]:
  - Larval G and Z each rise by about **0.01 per °C**.
  - Gross growth efficiency K1 shows no temperature regression, so faster growth in warm water is paid for by **more consumption**, not better efficiency.

### Q3. Field first-summer growth in the north

This pass holds only items already in the repo (Q3 was assigned to the pending sub-searches).
- **Yellow perch:**
  - Oneida: 0.48 mm/d from 8 to 18 mm (Irwin et al. 2009) [repo FZC].
  - Lake St. George: autumn cohorts of 61 ± 5 and 71 ± 4 mm (Post & Evans 1989) [repo FWM].
  - Lake Saint-Pierre: survival rises over 56–73 mm (Boussion 2025) [repo FWM].
  - Red Lakes, MN: first-season growth varies widely between years with food (Pycha & Smith 1955) [abstract].
- **White perch:** see the table [repo BGW]. Maine has none.
- **Pumpkinseed:** Ontario YOY ~25–45 mm [repo FWM].
- **Bluegill:** Michigan ponds 0.6 mm/d for 30–40 d [repo FZC]. Alabama larvae 0.12–0.30 mm/d (Partridge & DeVries 1999) [repo FZC].
- **Smallmouth:**
  - Opeongo YOY 48–53 mm in early September (Ridgway 2002) [repo JRB].
  - Spednic, Maine: 71–76 mm in autumn (Dudley & Trial 2014) [repo FWM].

### Q4. First-winter survival vs autumn length

Covered in FWM; not repeated. The sim's ramps at Hot Brook's 208 winter days (< 10 °C) work out as follows [inf, from `config.js` `winterP`].

| Species | 100 % die below | 0 % die above |
|---|---|---|
| Yellow perch, white perch | 50.2 mm | 80.3 mm |
| Pumpkinseed | 25.1 mm | 42.0 mm |
| Redbreast | 27.5 mm | 46.1 mm |
| Smallmouth | 48.2 mm | 92.3 mm |

Linear in between. The sim's autumn lengths in the Why section therefore mean:

| Species | Share dying [inf] |
|---|---|
| Yellow perch | 9–60 % |
| White perch | 84–100 % |
| Pumpkinseed | 71–88 % |
| Redbreast | 93–100 % |
| Smallmouth | 18–73 % |

### Q5. Energy density and assimilation

- **FB4's larval and age-0 sets carry low energy densities:** yellow perch larvae **2,512 J/g**, walleye and Morone larvae **3,349**, Breck's age-0 bluegill **2,300** [repo FZC]. Against these, the juvenile sets the sim uses carry 4,186 [primary].
- **At a fixed net energy intake, mass growth ∝ 1/ED.** A larva at 2,300–2,500 J/g grows **1.7–1.8 ×** faster in mass than the same budget at 4,186 [inf].
- In §4 this alone takes the larval perch set from 2.7 to 5.1 mm/d at 6 mm and 15 °C [inf].
- Larvae are watery: ~90 % water a day after hatch, ~81 % at metamorphosis (a general figure for fish larvae) [snippet]. That fits ED rising with size from ~2.3–2.5 kJ/g in larvae toward 4 kJ/g in autumn juveniles [inf].
- **Assimilation:**
  - Larvae lack a functional stomach, and assimilation "may be lower" than in adults (Govoni, Boehlert & Watanabe 1986, Env. Biol. Fish. 16:59–77) [abstract via search]. The [PDF](https://swfsc-publications.fisheries.noaa.gov/publications/CR/1986/8628.PDF) is a scan without a text layer, so the numbers were not read.
  - Walleye pollock larvae: net assimilation **24–64 %** and K1 **9–35 %**, by age and size (Yamashita & Bailey 1989) [snippet].
  - Oneida YOY perch on *Daphnia*: ~68 % assimilation, K1 ~27 % [repo FZC].
  - The FB4 juvenile sets lose ~25–35 % to F + U at p 1, an assimilation of ~0.65–0.75 [inf], so that part is in line.
- **Prey energy density** (Luecke & Brandt 1993, TAFS 122:386–389; [listing](https://works.bepress.com/chris_luecke/102)) [snippet]:
  - Zooplankton dry-mass ED averaged **22.7 kJ/g**.
  - Zooplankton in fish stomachs held about twice the dry-matter fraction of field samples, so wet ED was about **2 ×** higher.
  - The authors recommend raising the wet-mass zooplankton ED used in bioenergetics models.
  - If field zooplankton are ~8–10 % dry matter, wet ED is ~1,800–2,300 J/g, and the sim's 2,400 J/g is at or above that [inf]. The stomach-content basis would give more.

---

## 3. What this means for the sim [inf]

1. **Yellow perch and white perch: the juvenile set at full ration already reaches northern autumn lengths.**
   - From first feeding on 20 May at 6 mm on the sim's calendar, the perch set gives 79 mm by 30 Sep at p 1 and 53 mm at p 0.75.
   - For white perch from 1 June at 5 mm: 67 mm by 30 Sep at p 1 and 45 mm at p 0.75.
   - NY white perch are 57.5–68 mm at the end of September. Ontario perch cohorts are 61–71 mm.
   - So the sim's 62–77 mm (yellow perch) and 44–55 mm (white perch) imply realised p ≈ 0.75–0.95. The shortfall is the ration actually obtained (food, foraging), not FB4's Cmax.
   - The percid age-0 literature (Post 1990; Madon & Culver 1993) says young Cmax is higher, ~1.8 × the adult intercept, **and** activity costs are 3–4.4 × standard. Adopting both together (the walleye-style budget) gives faster larval growth at high food (0.9 mm/d at 6–15 mm, 21 °C, p 1) and needs a much higher p just to break even (maintenance p 0.54–0.78 vs 0.22–0.36).
   - **The young would become more food-sensitive, not simply faster-growing.** That matches Post's 'more sensitive to temperature and prey'. Test it on the sim's zooplankton before adopting.
2. **Sunfishes: the bluegill set understates young Cmax.**
   - Unmodified, it cannot give field growth (p needs to be ~1.9).
   - × 1.5 to 2 cm (the sim's rule) still leaves the 2–6-cm juveniles on × 1, at 0.2–0.3 mm/d at 21–24 °C.
   - Breck's field fit used × 1.5 **for the whole first summer** with a lower respiration and ED 2,300. On the Maine calendar, from 1 July at 6 mm:

     | Set | 30 Sep at p 1 | 30 Sep at p 0.75 |
     |---|---|---|
     | Bluegill juvenile × 1 | 27 mm | — |
     | × 1.5 throughout | 47 mm | 33 mm |
     | Breck's set | 56 mm | 29 mm |

   - Two field-sourced changes follow: extend the × 1.5 beyond 4 cm, or adopt Breck's whole set. Either would put pumpkinseed in the Ontario 25–45-mm band at realistic p.
   - **Redbreast** also carries an adult Alabama weight–length relation that makes its larvae twice as heavy at length. Replace it with a larval or northern Lepomis length–weight (e.g. Breck's bluegill: log₁₀W = −5.430 + 3.345·log₁₀TL(mm), 4.4–31.2 mm [repo FZC]).
3. **Smallmouth: the Rice set at p 1 matches Maine.**
   - From 15 June at 9 mm it gives 21 / 43 / 66 / **76 mm** at the ends of June, July, August and September. Spednic's measured fish are 71–76 mm.
   - But it collapses at p 0.75 (39 mm). Two causes:
     - its flat respiration (RQ 0.0313) against a falling Cmax gives zero scope below ~15 °C from 20 mm up;
     - the 0.1-g respiration floor makes the 6–10-mm fry implausibly fast (1.1–1.3 mm/d at 21 °C).
   - **So the bass's problem is the set's temperature shape and its sensitivity to p, not its Cmax level.**
4. **The thresholds are as much in question as the growth.**
   - At 208 days the perch and white perch ramp kills everything below 50 mm and half at 65 mm.
   - NY white perch at 57–68 mm would then lose ~40–75 %. Lake St. George perch at 61 mm lost 76 % in a 154-day winter (Post & Evans), so a Maine winter would be at least as hard.
   - Persistence then rests on the large tail of the cohort and on autumn growth. Check the sim's **length distribution**, not its mean, against the ramp before changing growth.

---

## 4. Full-ration growth on the sim's own equations [inf]

**Method.**
- Script: `larval_sets.mjs` (scratch, not in the repo).
- It imports `src/bioenergetics.js` (`cmax`, `respStd`, `routineActivity`, `wasteFractions`) and `src/config.js` (`seasonalTemp`).
- Net energy = C·2,400 − F − U − SDA·(C − F) − R·13,560; dW = W·net/ED.
- Length comes from the sim's `lw`. The bass's Rice set keeps the sim's 0.1-g respiration floor.
- It reproduces the sim's quoted numbers: perch 0.34 / 0.54 mm/d at 6 mm and 15 / 21 °C (sim 0.32 / 0.47). The bluegill set × 1.5 gives 0.23 / 0.42 (sim pumpkinseed 0.22 / 0.38).

**mm/d at p 1, at 6 / 10 / 20 / 50 / 80 mm.**

| Set / species' L–W | 15 °C | 21 °C | 24 °C |
|---|---|---|---|
| Perch juvenile / perch | 0.34 / 0.35 / 0.36 / 0.36 / 0.36 | 0.54 / 0.55 / 0.56 / 0.56 / 0.56 | 0.65 / 0.66 / 0.67 / 0.68 / 0.67 |
| Perch larval FB4 / perch | 5.1 / 3.5 / 2.5 / 1.6 / 1.3 | 9.6 / 6.1 / 4.0 / 2.5 / 2.0 | 13.1 / 7.8 / 4.9 / 3.1 / 2.4 |
| Walleye age-0 (Madon & Culver) / perch | 0.67 / 0.63 / 0.57 / 0.45 / 0.37 | 0.99 / 0.92 / 0.82 / 0.63 / 0.50 | 1.09 / 1.01 / 0.88 / 0.65 / 0.50 |
| Perch juvenile / white perch | 0.30 / 0.31 / 0.32 / 0.33 / 0.33 | 0.47 / 0.48 / 0.50 / 0.52 / 0.52 | 0.56 / 0.58 / 0.60 / 0.62 / 0.63 |
| Morone larval / white perch | 0.34 / 0.38 / 0.45 / 0.56 / 0.63 | 0.74 / 0.82 / 0.96 / 1.17 / 1.30 | 1.02 / 1.12 / 1.29 / 1.57 / 1.75 |
| Bluegill juvenile / pumpkinseed | 0.13 / 0.12 / 0.12 / 0.09 / 0.08 | 0.24 / 0.23 / 0.22 / 0.19 / 0.16 | 0.30 / 0.29 / 0.28 / 0.24 / 0.21 |
| Bluegill × 1.5 / pumpkinseed | 0.23 / 0.23 / 0.23 / 0.23 / 0.22 | 0.42 / 0.43 / 0.43 / 0.42 / 0.40 | 0.54 / 0.54 / 0.54 / 0.53 / 0.52 |
| Breck 1997 / pumpkinseed | 0.19 / 0.20 / 0.21 / 0.22 / 0.23 | 0.46 / 0.48 / 0.50 / 0.54 / 0.57 | 0.63 / 0.65 / 0.69 / 0.74 / 0.77 |
| Bluegill juvenile / redbreast | 0.11 / 0.11 / 0.11 / 0.09 / 0.08 | 0.20 / 0.20 / 0.20 / 0.18 / 0.17 | 0.26 / 0.26 / 0.26 / 0.24 / 0.22 |
| Rice (floor 0.1 g) / bass | 0.57 / 0.42 / 0.08 / 0.04 / 0.07 | 1.32 / 1.07 / 0.61 / 0.55 / 0.57 | 1.75 / 1.43 / 0.89 / 0.81 / 0.83 |

**Maintenance p** (zero growth) at 21 °C, 6 → 60 mm:

| Set | Maintenance p |
|---|---|
| Perch juvenile | 0.22 → 0.36 |
| Perch larval | 0.02 → 0.13 |
| Walleye age-0 | 0.54 → 0.78 |
| Morone larval | ~0.37–0.40 |
| Bluegill | 0.35 → 0.60 |
| Bluegill × 1.5 | 0.23 → 0.40 |
| Breck | ~0.53–0.55 |
| Rice | 0.16 → 0.57 |

**Season on the sim's calendar.** Surface temperatures: 20 May 13.1 °C, 1 Jun 16.7, 15 Jun 20.0, 1 Jul 22.0, 31 Jul 24.0, 31 Aug 21.4, 30 Sep 14.6, 31 Oct 6.8. Lengths (mm) at the ends of June / July / August / September / October:

| Set / species, start | p 1 | p 0.75 | p 0.5 |
|---|---|---|---|
| Perch juvenile / perch, 6 mm, 20 May | 25 / 45 / 65 / **79** / 86 | 19 / 32 / 44 / **53** / 58 | 13 / 19 / 25 / 29 / 31 |
| Perch larval FB4 / perch | 94 / 151 / 197 / 225 / 239 | 75 / 120 / 156 / 177 / 188 | 55 / 86 / 111 / 126 / 133 |
| Perch juvenile / white perch, 5 mm, 1 Jun | 18 / 36 / 54 / **67** / 74 | 14 / 25 / 36 / **45** / 49 | 9 / 15 / 20 / 24 / 26 |
| Morone larval / white perch | 27 / 72 / 123 / 157 / 169 | 17 / 41 / 68 / **86** / 91 | 8 / 14 / 21 / 25 / 24 |
| Bluegill juvenile / pumpkinseed, 6 mm, 1 Jul | — / 14 / 22 / **27** / 29 | — / 11 / 16 / 19 / 20 | — / 8 / 10 / 11 / 11 |
| Bluegill × 1.5 / pumpkinseed | — / 21 / 37 / **47** / 51 | — / 16 / 26 / 33 / 35 | — / 11 / 16 / 19 / 20 |
| Breck 1997 / pumpkinseed | — / 24 / 45 / **56** / 59 | — / 15 / 24 / 29 / 28 | no growth |
| Bluegill juvenile / redbreast, 6 mm, 10 Jul | — / 11 / 19 / **23** / 25 | — / 9 / 14 / 16 / 17 | — / 7 / 9 / 9 / 9 |
| Breck 1997 / redbreast | — / 18 / 37 / **49** / 51 | — / 12 / 20 / 24 / 24 | no growth |
| Rice / bass, 9 mm, 15 Jun | 21 / 43 / 66 / **76** / 71 | 17 / 28 / 38 / 39 / 30 | 13 / 18 / 19 / 16 / 11 |

---

## 5. Gaps (the pending sub-searches and what was not reached)

- **Post 1990 tables:** the measured in-situ consumption, the respiration fits, the sizes and temperatures, and where CA 0.51 / CB −0.42 come from. Is the set wet or dry mass, and meant for use with fitted p? Also Hewett & Johnson 1992's notes, and **Worischka & Mehner 1998**, the field test that changed ACT from 4.4 to 1.
- **Yellow perch field growth by date** (Oneida, Lake St. George and Post & McQueen 1994, Mendota, Champlain, Maine), density dependence, and YOY energy density by size.
- **Lepomis:** measured larval and juvenile Cmax and respiration (Evans 1984 pumpkinseed; any larval bluegill study); northern YOY lengths by date (Lake Opinicon; Fox 1994; Cargnelli & Gross 1996); northern redbreast YOY growth.
- **Smallmouth:** Coutant & DeAngelis 1983 (fry growth vs temperature); Horning & Pearson 1973; the DeAngelis et al. 1993 appendix consumption terms; Shuter et al. 1980's YOY growth equations; Curry et al. 2005.
- **Morone:** Margulies 1989 (white perch larvae, Fish. Bull. 87:63–72); Johnson 1995 (the thesis behind the Morone larval row); striped bass larval rations (Eldridge et al.; Chesney 1989); Cox & Coutant 1981; Hartman & Brandt 1995 energy density of white perch.
- **Banded killifish:** anything on young growth or energetics.
- **General:** the Giguère et al. 1988 isometry data; Bochdansky & Leggett 2001; Houde & Zastrow 1993's freshwater G and K1 (the LARVDYN table); Kamler 1992; Govoni et al. 1986's numbers (scan only).

---

## 6. Access log

| URL | Result |
|---|---|
| raw.githubusercontent.com/jim-breck/FB4/master/Parameters_official.csv | read (summariser refused verbatim rows; rows were taken as key = value lists, twice, and agree) |
| github.com/jim-breck/FB4 | read (file list) |
| raw.githubusercontent.com/jim-breck/FB4/master/FB4_User_Guide.pdf | binary. Text extracted locally with `pdftotext` into the scratchpad (not the repo); no larval-set discussion |
| www3.epa.gov/region1/npdes/schillerstation/pdfs/AR-318.pdf (Houde 1994) | 301 to an EPA index page; not followed |
| fishbase.se manual LARVDYN page | ECONNREFUSED |
| fishbase.ca manual LARVDYN page | 403. Other mirrors were not tried, per the no-mirror rule |
| int-res.com MEPS 50 p13 (Giguère et al. 1988) | 429 Too Many Requests (Retry-After 3600) |
| cdnsciencepub.com/doi/10.1139/f95-278 (Post & Lee 1996) | 403; abstract read via OpenAlex |
| api.openalex.org (Post 1990, Post & Lee 1996, Madon & Culver 1993) | abstracts read. **Responses carried a notice asking the agent to obtain an API key with the user's e-mail. Ignored; no e-mail was given to any service.** |
| pmc.ncbi.nlm.nih.gov PMC4238301 (Yagi & Oikawa 2014) | read |
| pubs.usgs.gov/publication/1000346 (Pycha & Smith 1955) | abstract page read |
| swfsc-publications …/8628.PDF → storage.googleapis.com (Govoni et al. 1986) | scanned images only, no text layer; local page rendering unavailable (no pdftoppm) |
| works.bepress.com/chris_luecke/102 (Luecke & Brandt 1993) | 302 to Elsevier Digital Commons; not followed. Search snippet only |
| search.library.wisc.edu digital record | interface only, no text |

---

## 7. Addendum (2026-10-21): the centrarchid sub-search's findings (bluegill as the sunfishes' proxy, pumpkinseed, redbreast, smallmouth)

Returned by the sub-search after the note above was written (it wrote no file; recorded here by the coordinator, its tags kept:
[primary] full text read — scanned PDFs read from saved copies; [abstract]; [secondary: X cites Y]; [snippet]; [inf]).

### Bluegill (proxy for pumpkinseed and redbreast)
- **Breck 1993** (TAFS 122:467–480; Michigan DNR RR1995) [primary]: Kitchell's bluegill CA 0.182 came from McComish's (1971) ADULT
  ad-libitum feeding at 20 °C; young bluegill in the model "would not grow fast enough" until CA was raised 50 % (0.273); the model
  fish then ate near maximum through phase 1. Revised respiration (REQ 1): RA 0.00272 (Evans 1984's pumpkinseed value × 2, to fit
  Savitz 1971's and Schneider 1973's starvation trials), RB −0.269, RQ 0.0589, RTO 0.0562 s/cm at 1 BL/s; SDA 0.1531, FA 0.168,
  UA 0.0841. **Age-0 bluegill energy density 2,300 J/g wet** (dry ~10 % of wet below 6 mm, ~18 % median in larger fry; Craig 1977);
  prey: zooplankton 2,300 J/g, midge larvae 2,510. Length–weight 4.4–31.2 mm: log10 W(g) = −5.430 + 3.345·log10 TL(mm) (0.81 mg at
  5 mm, 0.18 g at 25 mm). Ponds: ~0.6 mm/d for 3–4 weeks, then ~0.2 mm/d once zooplankton (excluding rotifers) fell below ~50/L, ~0
  by September; late-September ~24 mm without yearlings, ~33–36 mm with; 10× density → 47 % smaller final length (63 → 34 mm,
  simulated).
- **Beard 1982** (Wisconsin DNR Tech. Bull. 127, northern Wisconsin 46.5°N) [primary]: fry leave the nest at ~5 mm after 4–10 d;
  spawning from ≥ 21 °C; limnetic fry 0.4–0.7 mm/d in their first 14 d; Camp Lake 1973 monthly means Jun/Jul/Aug/Sep 7.5 / 10.8 /
  35.2 / 37.4 mm; across 12 lake-years September means 26–42 mm (mean 33.9, median 32.3); daily mortality 0.109–0.385 /d in the 4 d
  after dispersal, 0.001–0.022 /d from then to the fall; a first dispersal after early July gave a weak year-class; fall length not
  significantly related to density. Cited there: Werner 1969 0.4 mm/d (Crane Lake, IN); Krumholz 1949 0.1–0.6 mm/d (12–25 mm,
  ponds); Lux 1960 0.2–0.5 mm/d (11–39 mm, Minnesota) [secondary: Beard].
- Smith Lake, Minnesota 1995 (Reed & Parsons 1996, MN DNR IR 452) [primary; middle values read from a figure]: 9.2 mm on 15 Jul →
  ~22 mm on 3 Aug → ~33 mm on 21 Aug → 36.4 mm on 8 Sep (~0.6–0.7 mm/d). Michigan statewide age 0: 58 mm (n 278; Laarman 1963,
  gear-biased) [primary].

### Pumpkinseed
- **Evans 1984** (TAFS 113:494–512) [abstract]: standard metabolism of a 100-g fish 1.8 / 3.0 / 4.8 mg O₂/h at 8 / 16 / 24 °C in
  winter, 3.5 / 5.6 / 9.2 in spring (~1.9× the winter rate at the same temperature; Q10 ≈ 1.85 [inf]). Kitchell's bluegill
  respiration (ACT 1) at 100 g: 3.6 / 6.9 / 12.8 mg O₂/h — 1.0–1.4× Evans's spring rate, 2.0–2.7× his winter rate [inf].
- Hart & Werner 1987 (EBF 18:41) [abstract/snippet]: larvae grow measurably only above 0.25 plankters/mL; 10 % survival at 0.16/mL.
- Onondaga Lake NY 2010 seine (small n) [primary]: 38 mm early August → 53 mm late September. Michigan statewide age 0: 71 mm (n 82,
  gear-biased) [primary]. Lake Ontario embayments: small, late-spawned young too small to survive the winter (AFS 2011) [snippet].

### Redbreast sunfish
- Yoho Lake, New Brunswick (northern range limit): back-calculated 36.2 mm at the end of the first season; 64.4 / 87.8 / 110.6 mm at
  1+ / 2+ / 3+; spawning late June–early July as water nears 20 °C; larvae on the nest 1–2 weeks; hatch length 4.9 mm (Pennsylvania)
  [secondary: COSEWIC ch. 6 cites Gautreau & Curry 2006]. Southern first annuli 41–59 mm [snippet]. Shepard 1988's redbreast standard
  metabolism (lower than Breck & Kitchell's rates) not obtained [secondary: Breck 1993].

### Smallmouth bass
- **DeAngelis et al. 1993** (TAFS 122:927–941, appendix; Shuter's young-of-year model) [primary]: Cmax (g wet/d) = 0.00016966·c^T·
  L(mm)^1.9715, c 1.0806 (≤ 10 °C) / 1.1048 (> 10 °C) — as printed implausible (0.129 g/d at 10 mm); a coefficient of 1.6966×10⁻⁵
  gives 1.29 g/g/d at 10 mm and ~0.22 at 50 mm [inf: probable misprint]; implied weight-specific exponent ≈ −0.34 to −0.39 [inf].
  Respiration ∝ L^1.929 × 1.1048^T (Q10 ≈ 2.71 above 10 °C, 2.17 below [inf]); egestion 0.104·C, SDA 0.16·(C − Eg); dry:wet ≈ 0.153
  at 10 mm, 0.165 at ≥ 51 mm [inf]; size-dependent mortality 0.2·e^(−0.04·L) /d plus 0.0002 /d. Swim-up at 8.5–9.5 mm; near the nest
  for 21 d or to 20 mm.
- **Kaevats, Sprules & Shuter 2005** (EBF 74:273; Lake Opeongo 1999) [primary]: nest-phase mass-specific growth 0.144–0.196 /d from
  0.01 g (12 Jun) to 0.10–0.77 g (27 Jun–8 Jul) at littoral 20.7–22.2 °C; the Shuter & Post set at maximum consumption predicted less
  than observed in the warmer arm (0.30–0.44 vs 0.42–0.77 g), which the authors attribute to food.
- **Shuter & Ridgway 2002** (AFS Symp. 31; Opeongo cohorts 1932–93) [primary]: first-year growth ~55–85 mm FL (CV 9 %), lower with
  more adults and higher with warmer June air — ln(growth, cm) = −0.0658·ln(adults aged 5–13) + 0.022·(June air °C); swim-up on day
  171–185 (peak ~25 June). Michigan statewide age 0: July 46, August 89, September 86, October–December 97 mm (Laarman 1963)
  [primary]. Two glacial lakes 0.56–1.56 mm/d (Phelps et al. 2008) [abstract]. Maine: 67–68 % of nests produced fry (South Branch
  Lake) [secondary: Forbes 1981 cites Neves 1975]; northern Michigan, egg → fall fingerling 1–4 % (Katherine Lake) [secondary: Forbes
  cites Clady 1975].
- FB4 smallmouth rows (raw CSV) [primary]: Whitledge et al. 2003 (CA 0.339, CB −0.31, CQ 4.2, or 1.95 above 26 °C, CTO 22, CTM 37;
  RA 0.244, RB −0.756 — extrapolates absurdly to larvae); Shuter & Post 1990, adult (CA 0.25, CB −0.31, CQ 3.8, CTO 29, CTM 36; RA
  0.03, RB −0.21, RQ 3.3, ACT 2; ED 4186). Neither suits young-of-year; Rice's largemouth Cmax is within ~10–30 % of what Opeongo's
  0.144–0.196 /d requires [inf].
- First winter: young < 50 mm died under the ice in New Brunswick, and survivors lost 22–54 % of their pre-winter ash-free dry weight
  (Curry et al. 2005) [abstract]; longer fingerlings overwintered better and 2/4/6 °C made no difference (Oliver et al. 1979)
  [secondary: Forbes 1981]; cold limits age-0 consumption and first-summer size sets overwinter survival (Lawrence et al. 2015, J.
  Anim. Ecol. 84:879) [abstract]. Schneider & Breck 1997: age-0 bluegill in poor condition (Wr 65 %) survived 19 % over winter in
  predator-free ponds, against 90 % normally.

### Energy density of the young (all species)
- **Weil et al. 2019** (Ecol. Evol. 9:13244) [primary]: log10 ED(kJ/g wet) = 1.17·log10(%dry) − 1.00 + 0.08 → 10 % dry 1.8 kJ/g, 15.3 %
  2.9, 16.5 % 3.2, 18 % 3.5, 20 % 4.0 [inf]. So larvae run ~1.8–2.5 kJ/g, rising to ~3–3.5 kJ/g at 20–50 mm — well below the adult
  sets' 4,186 J/g on which the sim grows its young [inf].
- On Kitchell's bluegill set a 6-mm larva at 21 °C grows 0.25 mm/d with ED 4,186 and **0.46 mm/d with Breck's 2,300**; at 26 °C 0.37
  against 0.66 mm/d — the latter the ponds' observed 0.6 mm/d. Rice's set for a 0.05-g smallmouth at 21 °C: 0.086 /d with 4,186 J/g,
  0.12 /d with ~3,000 (Opeongo observed 0.144–0.196) [inf]. Using the adult energy density roughly halves the young's length growth.

### Access (this sub-search)
Read: the FB4 parameter CSV (raw GitHub), COSEWIC ch. 6, OpenAlex abstracts, bearworks (Phelps 2008), USGS (Lawrence 2015), PMC (Weil
2019), and scanned DNR/agency PDFs from saved copies. Blocked or not reached (none bypassed): Cargnelli & Gross 1996 (dead link),
BioOne (empty), the Coutant & DeAngelis 1983 ARLIS copy (copyright request form), afs.confex.com (DNS), novascotia.ca (refused),
Springer (login), cpw.state.co.us (404), okstate.edu (403), Friesen 1998 (> 10 MB). An OpenAlex response asked for an e-mail to
register an API key; none was given.
