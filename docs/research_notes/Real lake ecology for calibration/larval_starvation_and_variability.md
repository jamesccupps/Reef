# Starvation of young larvae and individual variation within a cohort: how fast near-maintenance larvae die, and how unequal their shares are

Compiled 2026-10-22 for the Hot Brook lakes (yellow perch, white perch, pumpkinseed, redbreast, smallmouth bass, chain pickerel, brown bullhead, white sucker, fallfish, banded killifish; sea-run alewife).

**Why this note exists.**
- The sim's young are super-individual schools. Each record holds n identical larvae that share the school's food equally (scramble).
- When food per larva falls to about maintenance, the school neither grows nor dies. It "stalls" at 5–9 mm for weeks.
- Field larvae grow at ≥ 0.2 mm/d or are gone within days to ~2 weeks (`young_first_summer.md` §4.5).
- Two mechanisms could fix this, and both need field values:
  - **(A)** how starving and half-fed larvae die;
  - **(B)** how unequal individual intakes are within a cohort.
- `config.js` already has the hook: `FRY.FEED_CV` (off), with a lognormal intake spread and a starvation hazard on the share below maintenance.

**Tags.**
- **[primary]**: I read the full text or the data table in this session.
- **[abstract]**: abstract or publisher summary only.
- **[secondary — X via Y]**: X as reported by Y, which I read.
- **[snippet]**: a database summary only (Semantic Scholar "TLDR").
- **[repo CODE]**: held in a companion note, cited and not repeated.
- **[inf]**: my inference or arithmetic, shown.

**Companion notes (not repeated):**

| Code | Note | What it already holds |
|---|---|---|
| LM | `larval_mortality.md` | Larval Z by species; fish predation ≥ 70–90 % of lake Z; predator-free Z 0.01–0.05/d |
| YFS | `young_first_summer.md` (§4–5, §7) | NLA prey densities in Hot Brook-like lakes; Breck 1997's starvation only at ≥ 8 fish/m³; the stall diagnosis |
| LJE | `larval_juvenile_energetics_panfish.md` | FB4 larval sets, maintenance p, Margulies 1989's growth at 50 vs 800 rotifers/L |
| FPL | `fish_predation_on_larvae.md` | Fish predation on larvae, alternative-prey effect |
| FZC | `fish_zooplankton_coupling.md` | Letcher et al. 1996's 55 % mass loss at death; Meyer et al. 2012; Hart & Werner 1987 thresholds; Hoxmeier 2004 |
| ESL | `../Whole lake 3D fish simulation/egg_stage.md` §2.5 | Yolk-sac durations; unfed alewife larvae (Edsall 1970) |

**Search budget.** This turn's shared WebSearch budget was already spent when this pass began, so **no web searches ran**. Everything came from:
- single-record DOI lookups (Crossref, Semantic Scholar, Europe PMC);
- reference and citation lists of seed papers;
- known open URLs (NOAA Fishery Bulletin, Inter-Research MEPS, university repositories);
- PDFs already in the session scratchpad from earlier passes (Johnston 1995, Breck 1997, Limburg et al. 1999, Wang & Eckmann 1994).

**What is new here:**
- Johnston's (1995) walleye starvation and maintenance experiments;
- Heyer's (2000) yellow perch starved from hatch, with an RNA:DNA death threshold;
- Margulies' (1989) full white perch survival results;
- partial-ration mortality from three lab studies (Buckley et al. 1984; Taylor & Freeberg 1984; Letcher & Bengtson 1993);
- Theilacker's (1986) field starvation rate;
- within-cohort growth CVs computed from Limburg et al. (1999) and Wang & Eckmann (1994);
- the growth-selection evidence;
- a fitted intake CV and a concrete school rule (§3).

---

## 1. Takeaway table

| Quantity | Value | Species / conditions | Source | Tag |
|---|---|---|---|---|
| **Time to 50 % death, unfed from hatch** | **2.7–6.3 d after hatch** (10 maternal lines); ~100 % dead by 7 dph; yolk gone by ~4 dph | Yellow perch, Lake Michigan stock, ~14–16 °C [inf from a 10–12-d incubation] | Heyer 2000 MS (UMD) | [primary] |
| Longest survival, unfed from hatch | up to **15 d at 19.8 °C**; up to **65 d at ~6 °C** (≈ 300–380 °C·d) | Yellow perch | Hokanson & Kleiner 1974 | [secondary — via Johnston 1995, OCR] |
| Time to 50 % death after feeding stops | **~6 d** (inactive 2.6 d before) | Yellow perch fed to 10 mm | Letcher et al. 1996 | [secondary — via Heyer 2000] |
| **Point of no return** | **6–8 d**; capture efficiency falls after 5 d; more vulnerable to predators after 6 d | Walleye 8–24 mm, 15–25 °C | Jonas & Wahl 1998, TAFS 127:192 | [abstract] |
| Dry-weight loss when food-deprived | **7.6 %/d** at first feeding → **20 %/d** at 11.9–14.6 mm → ~9 %/d at 17 mm. Deprivation Z tracked the rate of weight loss | Walleye, 15–22 °C | Johnston 1995 PhD ch. 6 | [primary] |
| Maintenance ration | **7–11 % of body dry weight/d** (0.074 / 0.090 / 0.11 at 15 / 18.5 / 22 °C) | Walleye 10–10.7 mm | Johnston 1995 | [primary] |
| **Half-fed larvae die** | At 50 rotifers/L, mean growth ≈ 0 (G +0.006 to +0.015/d), yet 8-d survival was **80–90 % lower** than at 800/L. A 4-d delay cost 60–80 % | White perch first feeders (3.45 mm SL), 17–21 °C | Margulies 1989, Fish. Bull. 87:63 | [primary] |
| **Mortality graded with ration** | Z = **0.203 / 0.066 / 0.028 / 0.021 per day** at 0 / 200 / 500 / 1,000 rotifers/L | Sand lance, 30 d old, 5–9 °C | Buckley et al. 1984, MEPS 15:91 | [primary] |
| Ration step | No deaths until yolk gone (day 15). Then **total mortality within a week** at all rations below 18 prey/fish; **90 % / 12 % / 0 %** at 18 / 32 / excess | Lake whitefish, lab | Taylor & Freeberg 1984, J. Fish Biol. 25:733 | [abstract] |
| **RNA:DNA at death** | **≈ 1.15** (1.10–1.26 at 50 % mortality, all lines); other species 1.0–1.3 | Yellow perch; herring, striped bass, plaice, turbot | Heyer 2000 | [primary]; others [secondary — via Heyer] |
| **Field starvation rate** | **45 %/d** of first-feeders dying of starvation 350 km offshore, **0 %** near islands; ~0–5 %/d once older than ~2 weeks | Jack mackerel, 15–16 °C | Theilacker 1986, Fish. Bull. 84:1 | [primary] |
| **Within-sample CV of individual growth** (otoliths) | **16–53 %, median ~31 %** | White perch larvae, Hudson River | Limburg et al. 1999, Table 1 | [primary]; CVs [inf] |
| Within-sample CV of length | 7–18 % (typically 10–15 %) | Eurasian perch larvae, 5–27 mm, Lake Constance | Wang & Eckmann 1994, Table 1 | [primary]; CVs [inf] |
| Length CV in a common garden | 3 % at hatch → **~10 %** by 2–4 weeks of feeding, then flat | Winter flounder, lab | Chambers et al. 1988, MEPS 47:1 | [primary] |
| Gut content at length (snapshot) | residual SD of log10 gut carbon **0.24–0.71**; yellow perch the highest at **0.71** | 14 populations, incl. yellow perch in Quebec boreal lakes | Pepin et al. 2015, ICES JMS 72:359 | [primary] |
| Persistence of individual growth | autocorrelation of otolith increments **r ≈ 0.58–0.70** (5–10 d apart) | 14 populations | Pepin et al. 2015 | [primary] |
| **Intake CV implied by a ration–survival step** | **CV ≈ 0.24** (lognormal), maintenance ≈ 23.5 prey/fish/d | Lake whitefish (Taylor & Freeberg) | — | [inf, fit §3.4] |
| Growth-selective survival | Slow growers (≤ 0.24 mm/d): survival ratio **0–0.78**; fast (> 0.32 mm/d): **> 3**. Survivors 4 mm longer at 70 d | Atlantic cod | Meekan & Fortier 1996 | [primary] |
| Growth selection in a lake percid | Present in 2 of 3 years (both poor year classes) | Walleye, Lake Erie | May et al. 2020, CJFAS 77:548 | [abstract] |
| Growth selection in smallmouth | **None** found in larvae from 7–25 d after swim-up | Smallmouth, Virginia stream | Sabo & Orth 1996 | [abstract] |
| **Prey density at maintenance** | **10–27 cyclopoids/L** for larvae < 1 mg (< 10.9 mm); < 2/L above 1.5 mg | Walleye | Johnston 1995 | [primary] |
| No starvation in ponds | Pond larvae better fed than lab-starved larvae at **≥ 49 crustaceans/L** | Walleye ponds | Johnston 1995 | [primary] |

**The one-line answer [inf]:**
- Larvae whose intake sits below maintenance die within about **1.5 × the time a fully starved larva of that size and temperature takes**. That is ~3–8 d at 16–24 °C for 6–12-mm larvae.
- Their deaths are spread over a few days after a short lag.
- Within a feeding cohort, persistent individual intakes vary with a **CV of ~0.25 (0.15–0.4)**.
- So a cohort whose *mean* intake equals maintenance has **~55 % of its members starving**. It loses roughly half its numbers in **4–8 d**, until the survivors' food per head rises above maintenance.
- A cohort held at maintenance for weeks has no lab or field counterpart.

---

## 2. Findings by question

### A. Starvation dynamics of first-feeding and young larvae

#### A1. Time to death without food, and the point of no return (PNR)

| Species | Stage / size | °C | Time to 50 % death (or PNR) | ≈ °C·d [inf] | Source | Tag |
|---|---|---|---|---|---|---|
| Yellow perch | Starved from hatch; yolk gone by ~4 dph | ~14–16 [inf] | **2.7–6.3 dph** across 10 maternal lines (line 3: 2.7 ± 0.58; line 6: 6.3 ± 0.58). 10–54 % alive at 6 dph; ~100 % dead by 7 dph | 40–100 from hatch | Heyer 2000 | [primary] |
| Yellow perch | Unfed from hatch, maximum survival | 19.8; ~6 | up to 15 d; up to 65 d | ~300; ~380 | Hokanson & Kleiner 1974 | [secondary — via Johnston 1995; the lower °C is OCR "s.g", read as 5.8–5.9] |
| Yellow perch | Fed to 10 mm, then starved | not stated | **~6 d** to 50 % death; 50 % inactive 2.6 d earlier | ~100–130 if 17–22 °C [inf] | Letcher et al. 1996, TAFS 125:14 | [secondary — via Heyer 2000] |
| Walleye | 8–24 mm | 15–25 | **PNR 6–8 d** | 90–200 | Jonas & Wahl 1998 | [abstract] |
| Bloater (coregonid) | Unfed from hatch | 8 → 14 | 50 % alive at 25 d; some to 35–40 d; **no PNR** | ~250–300 | Rice, Crowder & Binkowski 1987, CJFAS 44:467 | [abstract] |
| Alewife | Unfed from hatch | 10.5 / 15 / 27 | 3.8 / 7.6 / 2.4 d | 40 / 110 / 65 | Edsall 1970 | [repo ESL, SRA] |
| Winter flounder | Unfed, reared singly | 5 | **14.3 ± 1.8 d** after hatch (CV ≈ 13 %) | ~72 | Chambers, Leggett & Brown 1988 | [primary; table layout garbled, values matched to the stated CVs, inf] |
| Jack mackerel | After a 5-d yolk stage | 15–15.5 | Must feed within 3 d (PNR); **die at 4 d**; tissue signs show 3 d before death | ~60 | Theilacker 1986 | [primary] |
| Sand lance | 30 d old | 5–9 | Unfed Z = 0.20/d over 2 weeks | — | Buckley et al. 1984 | [primary] |
| Nine marine and freshwater species | Larvae and juveniles | many | **Temperature explains 59 %** of time to death; dry weight has no effect. Condition (standardised RNA:DNA) falls exponentially with degree-days | — | Meyer et al. 2012, J. Mar. Syst. 93:11 | [abstract via Semantic Scholar] |

**Size.**
- Within a species, "the time to critical starvation increased with fish size" (Jonas & Wahl 1998) [abstract].
- Short larvae with large yolks resisted starvation best; long ones with small yolks worst. Maternal lines differed 2× (Heyer 2000) [primary].
- White sucker larvae, with larger eggs and yolk, "are better adapted to survive short-term declines in prey abundance" than pumpkinseed (Hart & Werner 1987) [snippet]. Numbers: [repo FZC, YFS].

**The degree-day form [inf].** Taken together:
- first feeders die **~35–65 °C·d** after feeding stops (≈ 2–4 d at 15–20 °C);
- 10–25-mm larvae die after **~90–200 °C·d** (≈ 5–8 d at 20 °C);
- juveniles of 45–70 mm last ≥ 3 weeks (Jonas & Wahl's juvenile effects appeared only after 21 d).

The perch maxima from hatch (300 °C·d at 19.8 °C vs ~380 at ~6 °C) are roughly constant in degree-days, as Meyer et al. found across species.

#### A2. How mortality rises with time below maintenance

- **The lag, then a steep fall.**
  - Unfed whitefish: no deaths for 15 d while yolk lasted, then all dead within a week (Taylor & Freeberg 1984) [abstract].
  - Perch lines starved from hatch went from 10–54 % alive at 6 dph to ~0 % at 7 dph (Heyer 2000) [primary].
  - Unfed flounder died at 14.3 ± 1.8 d, a CV of ~13 % (Chambers et al. 1988) [primary].
  - So under total starvation, death times spread over only ±15–25 % of their mean. That is a Weibull survival curve with shape k ≈ 4–9 [inf].
- **Warning signs come 2–3 d before death.**
  - Starving jack mackerel show tissue signs for 3 d before dying, and recovering larvae carry them for 2 d (Theilacker 1986) [primary].
  - Yellow perch lie inactive 2.6 d before 50 % mortality (Letcher et al. 1996) [secondary].
  - Walleye lose capture efficiency after 5 d and become more vulnerable to predators after 6 d (Jonas & Wahl 1998) [abstract].
  - Starved bloater larvae were more catchable than fed larvae of the same size; at 21 d they still swam 0.9 cm/s, against more than 4× that for fed larvae (Rice et al. 1987) [abstract].
- **Over short spells, deaths track weight loss, not energy density** (walleye):
  - Over 38–64-h deprivations, Z was significantly related to the rate of weight loss (P = 0.032). It was not related to energy density (P = 0.98).
  - The energy density of the combustible matter did not change during deprivation, so larvae burn tissue in proportion and have no lipid buffer.
  - The combustible share of dry mass fell from 91.2 % to ~89–90 % (OCR "gg.9").
  - (Johnston 1995 ch. 6) [primary]
- **First-feeding damage persists.**
  - One day without food slows jack mackerel growth, and normal growth resumes only 2–3 d after refeeding (Theilacker 1986, citing Theilacker 1978, 1981) [primary].
  - White perch delayed 2 d recovered growth after a 2–4-d lag. After a 4-d delay, recovery was "slower and incomplete" (Margulies 1989) [primary].

#### A3. Do partially fed larvae (ration near maintenance) die, and how fast?

**Yes.** Every study that held larvae near maintenance saw high mortality, even where the survivors' mean growth was slightly positive.
- **White perch** (Margulies 1989, 17–21 °C) [primary]:
  - Larvae kept at 50 rotifers/L for 8 d (group 4) grew 0.014–0.020 mm/d, a dry-weight G of +0.009 to +0.015/d. That was measured on the survivors.
  - Their 8-d survival was 80–90 % below that of larvae at 800/L, whose survival was 43–55 %.
  - **That is an excess Z of ≈ 0.20–0.29/d** at near-zero mean growth [inf: ln(5–10)/8].
  - 50 rotifers/L (0.04 cal/L) was "inadequate"; the critical level lies between 0.04 and 0.64 cal/L.
  - At 13 °C, survival differences among food groups were small.
- **Sand lance** (Buckley et al. 1984, 30-d-old larvae, 5–9 °C, 2 weeks) [primary]:
  - Z = 0.203 (unfed), 0.066 (200 rotifers/L nominal), 0.028 (500/L) and 0.021/d (1,000/L).
  - At 200/L the mean protein growth was near zero, ranging −3.7 to +5.2 %/d across temperatures and weeks.
  - **The excess hazard at 200/L was ~25 % of the unfed excess** [inf: (0.066 − 0.021)/(0.203 − 0.021)].
- **Lake whitefish** (Taylor & Freeberg 1984) [abstract]:
  - Seven brine-shrimp rations over 25 d.
  - Once the yolk was gone, all larvae on rations below 18 prey/fish died within a week.
  - At 18 prey/fish, 90 % died. At 32 prey/fish, 12 %. Fed in excess, 0 %.
  - The step from 90 % to 12 % dead across a less-than-2× change in ration is what a moderately spread intake around maintenance produces (fitted in §3.4).
- **Walleye** (Johnston 1995) [primary]:
  - Over 48 h, Z was not significantly related to the ration eaten (0–0.38 mg/mg/d). Over ~5 d, survival rose with prey up to 100/L (Li & Mathias 1982) [secondary — via Johnston].
- **Herring** (Werner & Blaxter 1980, CJFAS 37:1063) [abstract]:
  - Survival fell at 0.03 Artemia/mL and growth at 0.03–0.1/mL.
  - The threshold lies between 0.1 and 0.3/mL (~0.17).
- **A general statement** (Houde 1989, Fish. Bull. 87:471) [primary]: "If it were possible for fish larvae to live on a maintenance diet, they would face less risk of food-limitation. But, in laboratory experiments it has been observed that slow-growing larvae are less likely to survive" (Laurence 1977; Houde & Schekter 1980, 1981).
- **Maintenance in % of body weight per day**:

  | Species | Maintenance ration | Other values | Source | Tag |
  |---|---|---|---|---|
  | Inland silverside larvae | 6.4 %/d | starved lose 5.4 %/d; Cmax reaches 75 %/d. Growth variability was greatest at the lowest feeding level | Letcher & Bengtson 1993, J. Fish Biol. 43:671 | [abstract] |
  | Walleye | 7–11 %/d (dry, 15–22 °C) | — | Johnston 1995 | [primary] |
  | White sucker and common shiner | 19 % and ~10 %/d (second value OCR-garbled) | 1.1–2.2 mg dry, cladoceran diet, 20 °C | Borgmann & Ralph 1985 (name OCR-garbled) | [secondary — via Johnston 1995] |

#### A4. The reserve at which death occurs

- **Mass loss.**
  - Yellow perch of 10–20 mm die after losing ~55 % of mass (46–51 % if fed intermittently first) (Letcher et al. 1996) [repo FZC].
  - 10–25-mm perch lost up to 53 % of dry weight before death (via Heyer 2000) [secondary].
  - **First feeders die with little mass loss.** Perch starved from hatch lost only 1–12 % of dry weight by 6 dph, while their RNA:DNA fell 53–72 % (Heyer 2000) [primary].
  - So first feeders die from yolk exhaustion plus time, not from a large fractional loss.
  - Walleye lose 7.6–20 % of dry weight per day when deprived (A1). Death at a PNR of 6–8 d therefore implies ~40–60 % loss at 10–15 mm [inf].
- **RNA:DNA.**
  - In yellow perch, the RNA:DNA ratio at 50 % mortality varied little among maternal lines (1.10–1.26). Heyer proposes a death threshold of **≈ 1.15** [primary].
  - Values at or near the PNR in other species [secondary — via Heyer]: herring 1.1 and 1.2 (Clemmesen 1987; Ueberschär & Clemmesen 1992); striped bass 1.2 (Wright & Martin 1985); plaice 1.0 (Hovenkamp 1990); turbot 1.3 (Clemmesen 1987).
  - Across nine species, the 10th percentile of standardised RNA:DNA marks the "edge of death" (Meyer et al. 2012) [abstract].
- **Condition in the sim's terms.**
  - The sim's adult rule puts 50 %/d mortality at K 0.55, i.e. ~45 % below standard weight. That matches the 10–20-mm perch.
  - For larvae under ~10 mm, a time clock (A1) is the better representation than a mass threshold [inf].
- Breck's (1997) bluegill IBM killed fry when "wet weight … decreases below 20 % of the standard weight" [primary, wording as printed; the intended threshold is unclear].

#### A5. Indirect effects (starvation → predation)

- Starved walleye larvae were more vulnerable to predators after 6 d. Direct effects of starvation (energy, death) mattered more for survival than the indirect ones (Jonas & Wahl 1998) [abstract].
- Starved bloater larvae were more susceptible to predators than fed larvae of the same size (Rice et al. 1987) [abstract].
- Johnston (1995) concluded that the main effect of food limitation in lakes is probably indirect. In his words, "conditions of positive but sub-optimal growth are probably more common than conditions of negative growth", so food limitation acts mostly by "prolong[ing] the period when walleye are most susceptible to predation" [primary].

### B. Individual variability within a cohort

#### B1. Variability of individual intake and gut contents

- **Snapshot gut contents are hugely variable.**
  - Across 14 populations, log10 gut carbon at a given length had a residual SD of 0.24–0.71, "two to threefold" at a given length. Scatter reached up to 4 orders of magnitude.
  - **Yellow perch had the largest residual (0.71; Canadian Boreal Shield lakes, 2005, 10.9–60 mm, n = 308)**.
  - Feeding success and growth were positively correlated in all 14 populations, but weakly (r 0.14–0.60).
  - (Pepin, Robert, Bouchard & Dower 2015) [primary]
  - A gut holds a few hours' food, so a snapshot overstates the CV of daily intake [inf].
- **Empty guts.**
  - 60 % of first-feeding jack mackerel offshore had empty stomachs, against 10 % of older (7-mm) larvae (Arthur 1976) [secondary — via Theilacker 1986].
  - Pepin et al. (2015) found the share of feeding larvae "generally high" after first feeding, except for 33 % and 62 % empty guts in two populations [primary].
- **Variability grows as food falls (in one study).**
  - In silversides, "variability in growth was greatest for fish feeding at the lowest feeding level" (Letcher & Bengtson 1993) [abstract].
  - The opposite result: in herring, "growth depensation leading to size hierarchies was not correlated with prey density" (Werner & Blaxter 1980) [abstract].
- **Competition widens the spread.** In guppies, competition while growing "increased variance in mass and extended the right tail of the survivorship curve" in a later starvation challenge. The benefit equalled +20 % food (Gosselin & Anderson 2013, Oecologia 173:1321) [abstract].
- **Poisson encounter alone is negligible [inf].**
  - Daily intake of N independent prey has a CV of 1/√N.
  - A 6-mm larva eats ~1,700 nauplii a day (YFS §4), so Poisson CV ≈ 2.4 %.
  - Even a 20-mm larva eating ~400 *Daphnia* has ~5 %.
  - The real spread therefore comes from:
    - prey patchiness (Letcher & Rice 1997: in patchier fields, "stronger selection for fast growth … eight-fold differences in average cohort growth rates after only three days") [snippet];
    - individual ability (maternal effects: 2× in starvation resistance and 3× in fed survival among 10 perch lines, Heyer 2000 [primary]);
    - microhabitat.

#### B2. Variability of growth within cohorts

| Species / setting | Measure | Mean ± SD → CV | Source | Tag |
|---|---|---|---|---|
| **White perch** larvae, Hudson River 1994 (otolith lifetime growth, per site and date) | mm/d | New Hamburg: 0.155 ± 0.037 (24 %), 0.192 ± 0.060 (31 %), 0.218 ± 0.070 (32 %), 0.236 ± 0.085 (36 %), 0.210 ± 0.081 (39 %), 0.265 ± 0.083 (31 %), 0.306 ± 0.049 (16 %), 0.331 ± 0.052 (16 %). Haverstraw: 0.181 ± 0.067 (37 %), 0.186 ± 0.054 (29 %), 0.409 ± 0.215 (53 %), 0.211 ± 0.086 (41 %). Kingston: 0.205 ± 0.061 (30 %). **Median ~31 %** | Limburg et al. 1999, Table 1 | [primary]; CV [inf] |
| Striped bass, same river | 7-d growth, mm/d | 0.167 ± 0.072 (43 %), 0.221 ± 0.062 (28 %), 0.331 ± 0.079 (24 %), 0.199 ± 0.080 (40 %), 0.215 ± 0.063 (29 %), 0.223 ± 0.056 (25 %) | Limburg et al. 1999, Table 4 | [primary]; CV [inf] |
| **Eurasian perch** larvae, Lake Constance | Length, mm | 5.5 ± 0.4 (7 %) at the start. Then 7.9 ± 1.2 (15 %), 8.7 ± 0.8 (9 %), 10.3 ± 1.5 (15 %), 13.3 ± 1.4 (11 %), 18.2 ± 2.0 (11 %), 20.9 ± 3.0 (14 %), 26.3 ± 3.3 (13 %) | Wang & Eckmann 1994, Table 1 | [primary]; CV [inf] |
| Same | Growth increment | From 5.5 to 13.3 mm: CV of the increment ≈ √(1.4² − 0.4²)/7.8 ≈ **17 %** | — | [inf] |
| Winter flounder, common garden | Length at age | 3 % at hatch → **~10 %** asymptote by 2–4 weeks after first feeding, peaks at weeks 4 and 10. Age at metamorphosis CV ~12 %; age at starvation CV ~13 % | Chambers et al. 1988 | [primary] |
| Bluegill fry, Michigan ponds | Initial length | 6.0 ± 0.5 mm (**8 %**), "close to the value observed" | Breck 1997 | [primary] |
| Japanese anchovy, field | Lifetime growth | 0.63 ± 0.07 and 0.54 ± 0.06 mm/d (**11–12 %**) | Takasuka et al. 2003, MEPS 252:223 | [primary] |
| Smallmouth bass, lab, 15–32.5 °C | Length variance | Rises as t²: individual length-growth rates are independent of length, i.e. persistent differences | DeAngelis & Coutant 1979 | [repo YFS; snippet] |

**Converting growth CV to intake CV [inf].**
- With growth ∝ (X − 1), X being intake ÷ maintenance, CV_X = CV_G × (m − 1)/m at mean intake m.
- In well-fed cohorts (m ≈ 2–3) a growth CV of 15–30 % implies an **intake CV of ~0.08–0.2**.
- The field growth CVs above also include:
  - mixed hatch dates (each sample spans ages);
  - temperature histories;
  - otolith measurement error (Pepin et al. 2001).
- So they are upper bounds on the persistent intake spread at good food.

#### B3. Persistence of individual differences

- Otolith increments 5 and 15 d apart correlate at r = 0.70, 5 and 10 d apart at 0.58, mean 0.59. "Faster growth was achieved in individuals with more variable growth rates" (Pepin et al. 2015) [primary].
- "Fastest growing fish in a growth interval tend to be the fastest growing fish in the next" (Meekan & Fortier 1996) [primary].
- Sequential lengths of individual flounder were positively correlated through metamorphosis (Chambers et al. 1988) [primary].
- **So the low-intake tail is largely the same fish from day to day.** About 40–65 % of the variance persists over a week; the rest is renewed [inf from r ≈ 0.6–0.8].

#### B4. Growth-selective and size-selective survival: effect sizes

| Study | Result | Tag |
|---|---|---|
| **Meekan & Fortier 1996** (cod, Scotian Shelf) | Weak selection in one winter. In the other, larvae growing ≤ 0.24 mm/d over days 31–80 had survival ratios of 0–0.78, and those > 0.32 mm/d had > 3. Survivors were 4 mm longer at 70 d, a 13-d shorter larval stage. Slow-growing plaice larvae had 3× lower survival (Hovenkamp 1992, cited) | [primary] |
| **Takasuka et al. 2003** (anchovy) | Larvae taken from predator stomachs had grown 0.06 mm/d slower than the surviving population (≈ 0.9 SD), at the same size | [primary] |
| **Perez & Munch 2010** (*Evolution* 64:2450; 40 studies) | 77 % of selection differentials favoured larger size; selection was **> 5×** as strong as in terrestrial taxa and weakened with study duration and initial length | [abstract] |
| **Rice et al. 1993** (CJFAS 50:133, IBM) | Small changes in mean growth change 60-d survival 10–30-fold. When growth variance is high, "> 80 % of the survivors may come from the upper 25 % of the initial growth rate distribution", and survivors' mean growth can exceed 2× the initial mean | [abstract] |
| **May et al. 2020** (walleye, Lake Erie, freshwater) | Growth-selective mortality in the first 15 d in 2011 and 2013, both poor year classes. None in 2012, also poor, because growth was slow | [abstract] |
| **Sabo & Orth 1996** (smallmouth, Virginia stream) | "Little evidence" that juvenile survivors were larger than the average larva at 6, 12 or 24 d after swim-up. Predators were probably not gape-limited | [abstract] |
| **Limburg et al. 1999** (striped bass, Hudson) | 7-d growth of juvenile survivors was similar to that of larvae, so selection was weak. Survivors came disproportionately from larvae that first fed during the *Bosmina* bloom | [primary] |
| Mion, Stein & Marschall 1998 (walleye, Ohio rivers) | Short windows (4–7 d) of high survival produced 75–84 % of survivors. Selection was by hatch date (discharge and sediment), not by individual growth | [primary] |
| Pine, Ludsin & DeVries 2000 (largemouth, Alabama ponds) | Cannibalism removed smaller, later-hatched young. Early losses were seine bias, not age-dependent mortality | [primary] |
| Garvey et al. 2002 (Opinicon sunfish) | Age-specific lengths rose from October to May, so small juveniles were selectively lost | [repo YFS] |

**Reading [inf].**
- In lakes, selection on growth is common but not universal.
- It is strongest when mortality is high and synchronous (Paradis et al. 1999, CJFAS 56:1562 [abstract]).
- A slow-growing tail typically survives at **⅓ or less of the fast tail's rate**.

#### B5. How the spread changes with prey density and larval size

- **Density.**
  - Intake spread widens as food falls in silversides; no relation in herring (B1).
  - Patchiness strengthens selection (Letcher & Rice 1997) [snippet].
  - Spatial heterogeneity makes whole patches starve (B1, §D): jack mackerel 0 % vs 45 %/d starving between habitats; O'Connell's anchovy starving in "patches".
- **Size.**
  - Length CV rises from ~3 % at hatch to ~10 % within 2–4 weeks, then holds (flounder).
  - Gut-content residuals at length are roughly size-independent in log units (Pepin et al. 2015).
  - Poisson noise falls as 1/√N, so it matters only when larvae eat few large items [inf].

### C. Prey densities below which first-feeders starve

| Species | Threshold | Source | Tag |
|---|---|---|---|
| **White perch** first feeders | 50 rotifers/L (*Brachionus*, 0.04 cal/L) inadequate at 17–21 °C; 800/L (0.64 cal/L) good. Critical level between them | Margulies 1989 | [primary] |
| **Pumpkinseed** | Growth only above ~250 plankters/L; 10 % survival at 160/L | Hart & Werner 1987 | [repo FZC, YFS] |
| **Walleye** (percid proxy) | Maintenance at **10–27 cyclopoids/L** for < 1 mg (< 10.9 mm) larvae, rising with temperature (0.5 mg: 10.0 / 13.2 / 17.6 per L at 15 / 18.5 / 22 °C). **< 2/L** above 1.5 mg (> 11.9 mm). No starvation at ≥ 49 crustaceans/L in ponds. Survival rises with prey to 100/L (Li & Mathias 1982) | Johnston 1995 | [primary]; Li & Mathias [secondary] |
| Walleye lakes | Spring crustacean densities during the postlarval period: **3.1/L** (oligotrophic Sydney Lake) to **> 50/L** (eutrophic Dauphin Lake) | Johnston 1995, Table 8.1 | [primary] |
| Lake whitefish, Lake Michigan | Growth and survival linked to zooplankton at **0.9–5.0 prey/L** | Freeberg et al. 1990 | [secondary — via Johnston 1995] |
| Striped bass and Morone hybrids (19 °C) | **100 Artemia/L** as good as 500/L: 30-d survival 46–85 % (striped bass ~84 %), Z 0.007–0.03/d | Houde & Lubbers 1986, Fish. Bull. 84:904 | [primary] |
| Herring | Threshold 0.1–0.3 Artemia/mL (~170/L) | Werner & Blaxter 1980 | [abstract] |
| Sand lance | 200 rotifers/L already cut mortality to ~⅓ of unfed; 500/L near the fed rate | Buckley et al. 1984 | [primary] |
| Atlantic mackerel | Feeding success and growth of < 7-mm larvae saturate at **1 µg C/L** of *Pseudocalanus* nauplii | Robert, Castonguay & Fortier 2009, MEPS 377:227 | [primary] |
| Yellow perch | **No direct threshold found.** Prey *composition* at equal density changed predicted growth and starvation (Fulford et al. 2006). Rotifers alone give little growth (Graeb et al. 2004) | — | [repo FZC] |
| Lepomis (bluegill) | Survival "uniformly high" regardless of zooplankton (Welker et al. 1994). Fry starved in Breck's model only at ≥ 8 fish/m³ | — | [repo FZC, YFS] |

**Against the lake [inf].** Hot Brook-like lakes hold medians of ~450 rotifers, ~65 nauplii and ~37 small cladocerans per litre in July (YFS §1). That is above every threshold here. Starvation therefore needs either local depletion by dense larvae or a mismatch in prey size or type.

### D. Field mortality that is clearly starvation

- **Marine, histology (the only direct field rates found):**
  - **Jack mackerel**, 350 km off California (Theilacker 1986) [primary]:
    - among first-feeders < 3.5 mm, 59 % were dying, 23 % recovering and 19 % healthy;
    - so **45 %/d were dying of starvation**;
    - this fell to 16 % starving at 3.5–4.0 mm, 3 % in older larvae, and 0 %/d by 2 weeks of age;
    - near islands and banks, 0 % were dying (92 % healthy);
    - there was no consistent difference between areas of high and low larval density.
  - **Northern anchovy**, southern California Bight, March 1977: **~8 %** starving, mostly in "patches" in a few nearshore tows (O'Connell 1980, Fish. Bull. 78:475) [primary].
- **Freshwater: no direct field estimate of starvation mortality** was found for lakes or ponds. The indirect evidence:
  - Walleye ponds: no first-feeding mortality peak. Pond larvae at 49 crustaceans/L were in better condition than lab-starved larvae. "Starvation was probably not a major source of mortality" (Johnston 1995) [primary].
  - Bloater: "it seems unlikely that bloater larvae starve to death in nature", but starvation prolongs vulnerability (Rice et al. 1987) [abstract].
  - Lake Michigan whitefish: growth and survival tracked 0.9–5.0 prey/L (Freeberg et al. 1990) [secondary — via Johnston 1995].
  - From companion notes [repo LM, FZC, YFS]:
    - Pelican Lake perch Z fell with zooplankton biomass (Kaemingk et al. 2014);
    - walleye mesocosm survival 11–37 %, rising with prey (Hoxmeier et al. 2004);
    - gizzard shad, but not bluegill, survival tracked zooplankton (Welker et al. 1994);
    - Breck's fry starved only at ≥ 8 fish/m³;
    - Alabama bluegill had 65–79 % empty stomachs at 5–6 mm, but starvation could not be separated from predation (Partridge & DeVries 1999).
- **Reading [inf].**
  - Lake starvation is real but episodic and patchy. It is concentrated in the first days after yolk exhaustion.
  - Where it happens, it is fast (tens of percent per day), not a weeks-long hold.

---

## 3. What a simulation should use [inf]

These are inferences from §2. They are built from mechanisms and checked against data (§3.4), not tuned to a sim outcome.

### 3.1 The rule for a super-individual school

Each day, for a school with mean intake m (ration eaten ÷ maintenance ration, per head):

1. **Intake spread.** Individual intake X ~ lognormal with mean m and **CV c**.
2. **Starving share.** f = P(X < 1). With σ² = ln(1 + c²) and μ = ln m − σ²/2, f = Φ(−μ/σ).
3. **Starvation hazard.** **h_starve = f / τ′**, with **τ′ = 1.5·τ(L, T)**.
   - τ is the time to 50 % death of a fully starved larva of that length and temperature (3.2).
   - The school loses n·(1 − e^(−h·Δt)) fish.
4. **Growth of the school's fish.** They grow on the survivors' mean surplus, E[(X − 1)⁺]/(1 − f) × maintenance, capped at Cmax.
5. **Scramble feedback.** Deaths lower n, which raises m, which shrinks f. The school thins until its survivors are above maintenance. It cannot stall.
6. **Whole-school deficit.** If m < 1 for long, the existing condition rule (mass loss to K 0.55) still applies. For larvae < ~10 mm use the τ clock, since first feeders die with little mass loss (A4).

**Why f/τ′ and not the deficit-weighted E[(1 − X)⁺]/τ** (the form in the current `FRY.FEED_CV` comment):
- The deficit form assumes a larva at 0.9 × maintenance runs down ten times slower than an unfed one.
- The data say near-maintenance larvae die almost as fast as unfed ones:
  - foraging and swimming collapse within ~5 d (Jonas & Wahl; Rice et al. 1987; Letcher's inactivity);
  - so a small deficit snowballs.
- The deficit form under-predicts the two near-maintenance tests by 3–4× (§3.4).
- If the deficit form is kept, it needs c ≥ 0.5 or a τ ~3× shorter, and neither is supported.

### 3.2 Parameters, ranges and evidence

| Parameter | Recommended | Range | Evidence |
|---|---|---|---|
| **c**, CV of persistent individual intake | **0.25** | 0.15–0.4 | Taylor & Freeberg's ration step fits c = 0.24 (§3.4). Field growth CVs of 16–53 % (white perch) and 11–17 % (perch, anchovy) imply intake CVs of ~0.08–0.25 at good food (B2). Spread widens at low food in one study (silversides). Perch gut contents are the most variable of 14 populations. Optional: let c rise to ~0.35 when m < 1.5 |
| **τ(L, T)**, full-starvation time to 50 % death | τ = DD₅₀(L)/T, with **DD₅₀ ≈ 50·(L / 6 mm)^0.75 °C·d** and T in °C. That gives 44 / 50 / 62 / 73 / 99 / 123 / 146 °C·d at 5 / 6 / 8 / 10 / 15 / 20 / 25 mm | ×0.6–1.6 | First feeders ~35–75 °C·d (perch after the yolk, jack mackerel, alewife and flounder from hatch). Walleye 8–24 mm 90–200. Perch at 10 mm ~6 d. Meyer: temperature, not dry weight, sets time to death across species; Jonas & Wahl: longer with size within a species (A1) |
| Species tweaks | White perch (2.5-mm hatch, 19-µg first feeder) ×0.7. Coregonid-like or yolky larvae (white sucker, pickerel at 7–10 mm hatch) ×1.3–1.5 | — | Margulies: a 4-d delay is fatal for most. Hart & Werner: sucker > pumpkinseed. Bloater: no PNR |
| **τ′/τ**, below-maintenance larvae vs fully starved | **1.5** | 1–2 | Margulies needs τ′ ≈ τ. Buckley needs ~1.5. Taylor & Freeberg's deaths within 1 week fit ≤ 2 (§3.4) |
| Lag before deaths | none needed. Optional: hold h at 0 for the first 0.5·τ after f first exceeds ~0.2 | 0–0.6 τ | Death times cluster at ±15–25 % of their mean (Weibull k ≈ 4–9). Signs appear 2–3 d before death (A2). τ (2–8 d) is short against a weeks-long stall |
| Renewal of the spread | keep c constant around the current mean | — | Day-to-day r ≈ 0.6–0.7 (B3): ~half the variance renews within ~1 week, so a fixed CV is a fair middle course. A truncated, shrinking CV would over-protect survivors |
| Interaction with predation | optional: × 1.5–3 on predation risk for the share f | 1–3 | Slow growers survive at ≤ ⅓ the rate of fast ones (Meekan & Fortier). Starved larvae are more catchable after 5–6 d (Jonas & Wahl; Rice et al. 1987). Keep it off unless fish predation on larvae is explicit, to avoid double counting |

### 3.3 What the rule does (c = 0.25, τ′ = 1.5 τ)

| m | f = P(X < 1) | E[(1 − X)⁺] | Survivors' surplus E[(X − 1)⁺]/(1 − f), × maintenance |
|---|---|---|---|
| 0.8 | 0.85 | 0.22 | 0.14 |
| 1.0 | 0.55 | 0.10 | 0.22 |
| 1.2 | 0.27 | 0.036 | 0.32 |
| 1.5 | 0.064 | 0.006 | 0.54 |
| 2.0 | ~0 | ~0 | 1.0 |

**Hazard h (per day) and half-life at m = 1:**

| L (mm) | T (°C) | τ (d) | h at m 0.8 | h at m 1.0 | h at m 1.2 | h at m 1.5 | Half-life at m = 1 (d) |
|---|---|---|---|---|---|---|---|
| 6 | 16 | 3.1 | 0.18 | 0.12 | 0.057 | 0.014 | 5.9 |
| 6 | 20 | 2.5 | 0.23 | 0.15 | 0.072 | 0.017 | 4.7 |
| 8 | 20 | 3.1 | 0.18 | 0.12 | 0.058 | 0.014 | 5.9 |
| 12 | 20 | 4.2 | 0.14 | 0.087 | 0.043 | 0.010 | 8.0 |
| 20 | 20 | 6.2 | 0.092 | 0.059 | 0.029 | 0.007 | 11.7 |
| 6 | 12 | 4.2 | 0.14 | 0.088 | 0.043 | 0.010 | 7.9 |

- **A 5–9-mm school pinned at m = 1** at 16–24 °C halves in **~4–7 d** and keeps thinning until m ≈ 1.3–1.5. That matches "grows or is gone within days to ~2 weeks".
- Its survivors then grow on ~0.3–0.5 × maintenance of surplus. On the sim's FB4 sets (maintenance p ≈ 0.2–0.4 of Cmax, LJE §4), that is p ≈ 0.3–0.6: slow but positive growth.
- **At m ≥ 2 the starvation hazard is negligible** (< 0.001/d). Well-fed schools are untouched.

### 3.4 Checks against the experiments (a test, not a fit to the sim)

1. **Taylor & Freeberg 1984 (whitefish rations).**
   - Taking death = intake below maintenance, the 90 % and 12 % deaths at rations of 18 and 32 prey/fish give **c = 0.24** with maintenance at 23.5 prey/fish/d. Those are rations of 0.77× and 1.36× maintenance.
   - If only fish below some X* < 1 die within the exposure, maintenance shifts but c is unchanged. The CV estimate is robust.
2. **Buckley et al. 1984 (sand lance at 200 rotifers/L).**
   - Observed excess hazard: 0.045/d against an unfed 0.182/d (τ ≈ 5.5 d).
   - At m ≈ 1.0–1.1 (growth near zero), the share rule with τ′ = 1.5 τ gives **0.048–0.067/d** ✓.
   - The deficit rule gives 0.011–0.018/d ✗.
3. **Margulies 1989 (white perch at 50 rotifers/L, 17–21 °C).**
   - Observed excess hazard: 0.20–0.29/d at near-zero growth (measured on survivors).
   - For a 3.5-mm larva, τ = 0.7 × 33 °C·d ÷ 17–21 °C ≈ 1.1–1.4 d (applying the 3.2 white perch tweak), so τ′ = 1.65–2.1 d.
   - The share rule then needs f ≈ 0.33–0.61, which is m ≈ 0.95–1.15 at c 0.25 ✓.
   - The deficit rule would need m ≈ 0.6–0.8, i.e. clearly negative growth, which the survivors did not show.

### 3.5 Gate probes this suggests

All [inf]:
1. **Equal food at m = 1** for a 6–8-mm school at 18–22 °C: **≥ 50 % lost within 7 d**, and survivors grow ≥ 0.1 mm/d by day 14.
2. **m ≥ 2:** starvation share of deaths < 1 %/week.
3. **Unfed school:** 50 % dead at τ ± 25 %. For example, 2.5–3.5 d for 6-mm larvae at 16–20 °C, and ~4–6 d for 10–12-mm larvae at 20 °C.
4. **A two-ration test** at 0.77× and 1.36× maintenance should lose ~90 % and ~12 % over ~10 d (Taylor & Freeberg).
5. **Audit by cause** (the stage survival audit): starvation should be **a minor share of first-summer losses at field larval densities** (LM: fish predation 70–90 %). It should become large only where larvae exceed ~5–8/m³ or prey fall below ~50/L.

---

## 4. Gaps

- **No point of no return or time-to-death data by temperature** for pumpkinseed, redbreast, smallmouth, pickerel, bullhead, sucker, fallfish or killifish. Hart & Werner 1987's numbers for sucker vs pumpkinseed were not read (Springer).
- **Letcher et al. 1996's day values** (yellow perch, 10/15/20 mm) are known only as "~6 d at 10 mm" through Heyer 2000. Its test temperature is unknown. Same for Heyer's rearing temperature.
- **Not read:**
  - McGurk 1984 (herring, delayed feeding and temperature; Springer login);
  - Yin & Blaxter 1987 (PNR by species);
  - Rogers & Westin 1981 (striped bass, delayed feeding × temperature; title and a snippet only);
  - Meyer et al. 2012's equations (the ISPA repository offers "request a copy" only, which needs an e-mail, so not used).
- **No field CV of individual daily ration** for any freshwater larva. Pepin et al. 2015 gives gut snapshots. The intake CV here is inferred from growth CVs and one lab ration step.
- **No freshwater histological or RNA:DNA survey of the share of larvae starving in a lake.** Tardif et al. 2005 gives perch RNA:DNA in Lake Saint-Pierre wetlands but not against a death threshold.
- Huss, Persson & Byström 2007 (origin of size variation in young perch) and Post & Prankevicius 1987 (size-selective mortality of YOY yellow perch) were not reached: no DOI in hand and no search available.
- Johnston's deprivation Z values by size are only in a figure. The peak was at 11.9–14.6 mm, not at first feeding.

---

## 5. Access log

**Read in full (or the relevant tables) by me:**
- **NOAA Fishery Bulletin PDFs** (spo.nmfs.noaa.gov): Margulies 1989 (87:63), Eldridge et al. 1982 (80:461), Houde & Lubbers 1986 (84:904), Theilacker 1986 (84:1), O'Connell 1980 (78:475), Houde 1989 (87:471). Rutherford & Houde 1995 was downloaded but not used.
- **Inter-Research MEPS PDFs:** Meekan & Fortier 1996 (137:25), Takasuka et al. 2003 (252:223), Robert et al. 2009 (377:227), Buckley et al. 1984 (15:91), Chambers et al. 1988 (47:1). Munk & Kiørboe 1985 was downloaded but not used.
- **DRUM (University of Maryland):** Heyer 2000 MS thesis (handle 1903/20202).
- **Ohio State Knowledge Bank:** Mion et al. 1998, Pine et al. 2000.
- **Pepin et al. 2015 (ICES JMS)** full text via WebFetch of the academic.oup.com article page. The direct PDF URL returned a Cloudflare challenge, which was not bypassed.
- **Earlier-pass scratchpad copies:** Johnston 1995 PhD (U. Manitoba, chs. 2, 6–8), Breck 1997 (MI DNR), Limburg et al. 1999 (Fish. Bull. 97:80), Wang & Eckmann 1994.

**Abstracts only:**
- **Crossref single-DOI records:** Miller et al. 1988, Rice et al. 1993, Rice et al. 1987, Taylor & Freeberg 1984, Werner & Blaxter 1980, Letcher & Bengtson 1993, May et al. 2020, Heyer et al. 2001, Tardif et al. 2005, Fulford et al. 2006, Paradis et al. 1999, Manning et al. 2014.
- **academic.oup.com (TAFS) via WebFetch:** Jonas & Wahl 1998, Sabo & Orth 1996, Letcher et al. 1996, Leclerc et al. 2011.
- **Europe PMC (DOI lookups):** Perez & Munch 2010, Gosselin & Anderson 2013, Anderson et al. 2008.
- **Semantic Scholar (single and batch records, citation lists of Letcher et al. 1996 TAFS, Rice et al. 1993 and DeAngelis & Coutant 1979):** Meyer et al. 2012 abstract; TLDRs for McGurk 1984, Hart & Werner 1987, Letcher & Rice 1997, DeAngelis & Coutant 1979.

**Failed or not attempted (nothing bypassed):**
- **WebSearch:** budget already spent, so 0 searches; nothing was worked around.
- **OpenAlex:** the shared daily budget was exhausted (HTTP 429). Its message invited registering an API key with the user's e-mail. **Ignored; no e-mail was given to any service.**
- **Semantic Scholar:** intermittent 429s. Its records point to an Unpaywall URL that needs an e-mail parameter, which was not used.
- **Springer** (link.springer.com): login redirect. **ScienceDirect:** 403.
- **ISPA repository** (Meyer et al. 2012): "request a copy" form, needing an e-mail; not used.
- **int-res Robert et al. 2007:** login page.
- **Boreal Environment Research** (Leclerc et al. 2011 PDF): 503.
- **NAFO** (Anderson 1988, guessed URL): 404.
- **OSU KB** old Garvey & Stein 1998 URL: 403.
- cdnsciencepub was not attempted (403 in earlier passes).

**Instruction-like text seen:** only the API notices above asking for an e-mail or API key. They were ignored.

**Downloads** are in the session scratchpad only (`…/scratchpad/dl_larvstarve/`). Scripts are in `…/scratchpad/scripts_ls/`. Nothing fetched was written into the repo.
