# Larval and juvenile esocid energetics, first feeding (~10 mm) to ~10 cm (2026-10-21)

**Why.** The sim runs young chain pickerel on the ADULT FB4 northern pike set (Bevelhimer et al. 1985). At larval size the set gives
full-ration growth of only 0.05–0.3 mm/d. Field young pickerel grow ~0.3–0.5 mm/d in May, 0.5–0.7 in June and 0.9–1.1 in July
(`pickerel_young_of_year.md`). This note collects measured larval and juvenile values for consumption, growth, metabolism, energy
density and losses. It then says which part of the set fails: Cmax, its mass exponent, respiration, or the temperature curve.

Companion notes in this folder: `pickerel_young_of_year.md` (diet, monthly growth, Maine targets) and `esocid_first_year_survival.md`.
The adult-pike FB4 set and the field tests of it are also discussed in `../Real lake ecology for calibration/northern_pike.md`.

**Tags.**
- **[primary]**: I read the full text (old scans were read as page images).
- **[secondary]**: the number comes from a source I read that cites the original; both are named.
- **[abstract]**: abstract only.
- **[snippet]**: a search-engine summary of the abstract or page.
- **[inf]**: my own inference or arithmetic.

**Units and conversions.**
- TL = total length, SL = standard length; pike TL ≈ 1.12 × SL at these sizes [inf].
- SGR = 100·ln(W2/W1)/days (weight); it is about 3–3.5 × the length-specific rate in larvae, because W ∝ L^≈3.5 between 12 and 22 mm (Górny's table) [inf].
- 1 mg O₂ = 13.56 J (FB4 uses 13,560 J/g O₂); 1 µmol O₂ = 32 µg; 1 ml O₂ = 1.429 mg.
- Larval dry matter is ~14 % of wet mass at first feeding: 1.69 mg dry (Woynárovich 1960) ÷ ~12 mg wet (Szczepkowski 2009; Wolska-Neja & Neja 2006) [inf].
- "%BW/d" is wet prey mass per wet fish mass per day.

---

## Takeaway table

| Quantity | Measured value | Size, temperature | Source [tag] |
|---|---|---|---|
| **Max growth, first-feeding pike on live zooplankton ad lib** | TL 0.45 / 0.56–0.65 / 0.64–0.82 / 0.68–0.96 / 0.80–1.21 / 0.68–1.11 mm/d. Weight SGR ≈ 11–14 / 14–19 / 14–20 / 15–23 / 16–27 / 14–24 %/d | 12.5 → 15.8–22.3 mm TL, ~7–12 d; at 12 / 15 / 18 / 21 / 24 / 27 °C | Górny 1992 [primary]; SGR [inf] (start mass ~12 mg assumed, days include the warm-up) |
| Max growth, pike, ad lib dry larval feed, 0–28 d post-hatch | SL 0.25 / 0.48 / 0.83 mm/d; best individual 1.28 mm/d | 9.5 → ~16.5 / 23 / 31 mm; at 10 / 15 / 22 °C | Fey & Greszkiewicz 2021 [primary] |
| Growth, pike, outdoor tanks, excess *Cyclops* then *Daphnia* | SGR 18 %/d (12.7 → 37 mg) at 17.5 °C; 20 %/d (37 → 152 mg) at 18.5 °C; 10 %/d (152 → 307 mg) at 16.6 °C; TL 0.75 mm/d over 26 d | 9.3 → 28–34 mm TL | Wolska-Neja & Neja 2006 [primary]; SGR [inf] |
| Growth, pike larvae in ponds | SGR falls 22.2 → 17.4 %/d (larval period, ~15 °C) and 24.1 → 16.0 %/d (early juvenile, ~19 °C) | ponds | Bry et al. 1991 [snippet] |
| Growth, pike, hatchery dry feed (rationed) | SGR ~17 %/d at 0.012 → 0.13 g; 16 %/d at 0.10 g; 12–13 %/d at 0.20 g; 9.2–9.7 %/d at 0.54 g; 4.2–4.7 %/d at 2.5 g (18 °C); 3.6 / 4.1 / 4.4 %/d at 5.7 g (20 / 24 / 28 °C) | most runs at ~18–22 °C | Szczepkowski 2006, 2009 [primary] |
| Larval growth optimum temperature | 26 °C (growth negligible < 7 °C; net biomass highest at 21 °C) | larvae (< 55 mm per Jacobson) | Hokanson et al. 1973 [abstract]; Jacobson 1992 [primary] |
| | 24–27 °C | 12–22 mm | Górny 1992 [primary] |
| | ≥ 22 °C | larvae and early fry | Greszkiewicz 2022 [primary abstract] |
| | 22–23 °C for young of the year | YOY | Casselman 1996 via Harvey 2009 [secondary] |
| **Measured daily ration, larvae on zooplankton** | ~30 %BW/d at 13–16 mm → ~20 %BW/d at 35–50 mm (wet, zooplankton + *Chaoborus*); temperature not seen | intensive culture | Grès, Lim & Belaud 1996 [abstract] |
| Ration implied by growth and conversion in tanks | ~60–80 %BW/d of wet zooplankton (corrected FCR 3.3–4 × SGR 18–20 %/d) | 13–150 mg, 17.5–18.5 °C | from Wolska-Neja & Neja 2006 [primary] → [inf] |
| Max ration, juvenile non-esocids on live zooplankton | 220 %BW/d wet (40 % dry) for dace at 0.6 g; ~500 % wet (140 % dry) for small cyprinids at 0.1 g | 15–90 mm | Marmulla & Rösch 1990 [abstract] |
| **Routine O₂, pike larvae at first feeding (unfed)** | 0.57 / 1.12 / 2.11 / 3.51 / 5.33 / 7.41 / 8.89 mg O₂ g dry⁻¹ h⁻¹, ≈ 0.16 / 0.30 / 0.50 / 0.75 / 1.04 mg O₂ g wet⁻¹ h⁻¹ at 5 / 10 / 15 / 20 / 25 °C. Q10 ≈ 2.5–2.6 | 12.7 mm, 1.69 mg dry; at 0.5 / 5 / 10 / 15 / 20 / 25 / 28 °C | Woynárovich 1960 [primary]; wet [inf] |
| Aerobic ceiling of growing larvae | 200–220 µmol O₂ g dry⁻¹ h⁻¹ ≈ 6.4–7.0 mg g dry⁻¹ h⁻¹ ≈ 0.9–1.2 mg g wet⁻¹ h⁻¹ | larvae, 15 °C | Wieser, Laich & Medgyesy 1992 [abstract]; wet [inf] |
| Mass scaling of metabolism | Mass-independent below ~10 mg wet; mass-specific exponent −0.154 above. Growth exponent −0.24 | larvae to early juveniles, 15 °C | Wieser et al. 1992 [abstract] |
| | Whole-body resting b = 0.80 (mass-specific −0.20) | 40–1,291 g, 15 °C | Armstrong, Priede & Lucas 1992 [abstract] |
| | b = 0.81–0.82; Q10 1.73–4.80 among studies; 2–4× spread | adults | Armstrong & Hawkins 2008 [snippet] |
| Routine metabolism, age-0 muskellunge | 0.10 (5 °C) to 0.24 (25 °C) mg O₂ g⁻¹ h⁻¹; lower in winter than spring or autumn at the same temperature | age 0 | Chipps, Clapp & Wahl 2000 [abstract] |
| Energy partition, larvae | 62 ± 3.7 % of metabolizable energy to growth, 38 % to metabolism; pike 7–17 % more efficient than whitefish | 15 °C | Wieser et al. 1992 [abstract] |
| Energy density, pike larvae | 26.6 → 24.8 J/mg dry, from day 6 to day 15 post-hatch on yolk ≈ 3.5 kJ/g wet at first feeding | 12 °C hatchery | Trabelsi 2011 [primary]; wet [inf] |
| **Only juvenile esocid FB4 set** | "Muskellunge juvenile": CEQ 2, CA 0.221, CB −0.18, CQ 2.53, CTO 26, CTM 34; REQ 1, RA 0.00246, RB −0.18, RQ 0.055, activity 1.04; SDA 0.14, FA 0.13, UA 0.0805; ED 3,874 J/g. "Needs their correction factor"; the uncorrected model's consumption error was 43 % for age-0 tiger muskie | age 0 | FB4 parameter table [primary]; Schoenebeck, Chipps & Brown 2008 [abstract] |
| **Size range behind the Bevelhimer pike set** | 9–53 g Ohio pike, fed fathead minnows ad lib for 2-week runs at 5–30 °C; 25 °C growth optimum | juveniles | Jacobson 1992 [primary, citing it]; Bevelhimer et al. 1985 [abstract] |
| Field and lab tests of the esocid set on age-0 fish | Consumption overestimated 39–52 %, growth underestimated 2–3×, field conversion efficiencies 39–63 % (Wahl & Stein 1991). Error +113 % at 10 °C and +328 % at 7.5 °C, but 4–58 % at 20–25 °C (Chipps, Einfalt & Wahl 2000) | age 0 | [abstract] |
| Wet mass at length, pike | 8.9 mg at 9.3 mm (with yolk); ~12 mg at 12–12.7 mm (first feeding); 0.10–0.14 g at 25 mm SL; 0.7 g at 43 mm SL; 5.7 g at 88 mm SL. The adult length–weight curve gives 1.9 mg at 9 mm and 5.4 mg at 12.5 mm, so it is 2–4× too light | — | [primary]; [inf] |
| Chain pickerel | Spawns at 6–11 °C; first feeds at ~10 mm (smaller than pike's 12–15). Young-of-year basal metabolism at 20–30 °C: chain 0.363, pike 0.425, muskie 0.419, grass pickerel 0.515 ml O₂ g⁻¹ h⁻¹ | — | Ontario Freshwater Fishes [primary page]; `pickerel_young_of_year.md`; AFS 2012 abstract [snippet] |

**Bottom line [inf, detailed in § Diagnosis].**
- **Respiration is not the main fault.**
  - At 15–25 °C the adult set's respiration for a 12-mg larva (0.63–1.09 mg O₂/g/h) is within 5–27 % of the measured routine rate (0.50–1.04).
  - Its Q10 is too shallow: 1.73 against the larva's measured 2.5. So in cold water (5–12 °C) it charges larvae 1.4–2.3× their measured metabolism.
- **The consumption ceiling fails.**
  - Measured larval growth needs roughly **30–37 %BW/d of zooplankton at 12 °C, 41–53 % at 15 °C, 44–61 % at 18 °C and 55–82 % at 24 °C**.
  - The adult set gives a 12-mg larva 14 / 21 / 30 / 45 %BW/d.
  - That is a shortfall of **×2.1–2.6 at 12 °C, ×2.0–2.5 at 15 °C and ×1.2–1.8 at 21–24 °C**.
- **Why the ceiling is short.**
  - The set was fitted on 9–53-g fish eating fathead minnows (~4–4.5 kJ/g). It is applied in grams to zooplankton (2.4–2.7 kJ/g) three orders of magnitude below its fitted size range.
  - The shortfall is largest at the cold end, where the CEQ-4 curve gives 24–31 % of the peak at 10–12 °C.
- **The mass exponent is a second, related fault [inf].** An exponent of −0.25 to −0.30 between the larva and ~10 g, instead of −0.18, would reproduce the needed larval ceilings. The measured growth exponent is −0.24.

---

## Q1. Maximum daily consumption by size and temperature

**Larvae (zooplankton eaters, ~12–50 mm)**

- **Grès, Lim & Belaud 1996** (Bull. Fr. Pêche Piscic. 343:153–174; [doi:10.1051/kmae:1996013](https://doi.org/10.1051/kmae:1996013)) [abstract, via search summaries of the KMAE listing; the full text was blocked]
  - 20,000 pike larvae reared for 35 d at 5,000–20,000 larvae/m³ on live zooplankton and *Chaoborus* from a sewage lagoon.
  - One feeding period a day, whatever the density or size.
  - Daily ration rose with pike weight in grams but fell as %BW: **~30 % fresh weight per day at 13–16 mm → ~20 % at 35–50 mm**. Density barely affected it.
  - Temperature and growth rates were not available to me.
  - These are rations in crowded intensive culture, not proven maxima [inf].
- **Wolska-Neja & Neja 2006** (Acta Ichthyol. Piscat. 36(2):105–112; [doi:10.3750/AIP2006.36.2.03](https://doi.org/10.3750/AIP2006.36.2.03)) [primary]
  - Outdoor 13-L tanks with no temperature control, starting 3 May 1997.
  - Fed from day 3: *Cyclops strenuus* (mostly stage-V copepodids) until day 7, then *Daphnia magna*. Larvae were "always surrounded by an excess of food".
  - Food **offered** per fish per day: 0.96 mg (day 3), 2.5 mg (day 5), 43–48 mg (days 7–9), 70–363 mg (days 15–20), 156–392 mg (days 22–27).
  - Wet-food conversion of food offered: 6.1 (days 7–13), 4.7 (13–20), 4.9 (whole run). The authors correct these for the 18–32 % of zooplankton that dies uneaten (from Marmulla & Rösch 1990) to a **true FCR of ~3.3–4**.
  - With SGR 18–20 %/d at 17.5–18.5 °C, that implies **~60–80 %BW/d of wet zooplankton eaten** [inf].
  - Older conversion ratios quoted there: cladocerans → juvenile pike 11.5 (Karzinkin 1952), copepods 17 (Scholz 1932) [secondary via Wolska-Neja & Neja].
- **Non-esocid context: Marmulla & Rösch 1990** (J. Fish Biol.; [doi:10.1111/j.1095-8649.1990.tb05628.x](https://doi.org/10.1111/j.1095-8649.1990.tb05628.x)) [abstract]
  - Juvenile cyprinids and perch (15–90 mm) on live natural zooplankton.
  - Maximum daily ration 220 %BW/d wet (40 % dry) for dace at 0.6 g; ~500 % wet (~140 % dry) for a roach/bream/bleak group at 0.1 g.
  - So wet-mass rations of watery zooplankton far above 30 %BW/d are normal in small fish [inf].
- **Szczepkowski 2009** (Arch. Pol. Fish. 17(3); [doi:10.2478/v10086-009-0010-3](https://doi.org/10.2478/v10086-009-0010-3)) [primary]
  - Hatchery rations of DRY feed, which are set by the operator, not measured maxima:
    - 20 % of biomass/d at first feeding (larvae ~12 mg);
    - 10–11 %/d at 0.1–0.2 g;
    - 4–8 %/d at 2.5 g;
    - 2–4 %/d at 5.7 g (18–28 °C).
  - **Feed-ration test at 2.5 g, 18.1 °C:** 4 / 6 / 8 % of biomass/d gave SGR 4.16 / 4.66 / 4.21 %/d, so the ceiling was reached by ~6 % dry feed per day.
  - The feeds carry 18.5–19.9 MJ/kg **digestible** energy (Table 3, manufacturer's data). So the ceiling is ≈ 1.1–1.2 kJ digestible g⁻¹ d⁻¹, comparable to ~25–35 %BW/d of 4–4.5 kJ/g fish prey [inf].

**Juveniles on fish (1–50 g)**

- **Bevelhimer, Stein & Carline 1985** (CJFAS 42:57–69; [doi:10.1139/f85-008](https://doi.org/10.1139/f85-008)) [abstract]
  - Ohio pike, muskellunge and tiger muskellunge.
  - Consumption, conversion efficiency and growth measured in 2-wk ad-lib runs on fathead minnows at 5, 15, 20, 22.5, 25, 27.5 and 30 °C.
  - Respirometry at 5, 15, 20, 25 and 30 °C; "little difference in metabolic rates among the three taxa".
  - Pike should outgrow muskellunge in cool water and be outgrown above 25 °C.
- **Size range:** "smaller northern pike (9–53 g)", 25 °C optimum, "still growing at 30 °C" [Jacobson 1992, primary, citing Bevelhimer et al.; [MN DNR IR 424](https://www.lrl.mn.gov/docs/pre2003/other/930346.pdf)].
  - So the FB4 "Northern pike (adult)" label covers fingerling fish.
  - At 2–12 mg the set is extrapolated 3–4 orders of magnitude below its data [inf].
- **Casselman 1978 Cmax refit by Jacobson 1992** [primary] (Kitchell form, from Casselman's figs. 18–20)
  - ac 0.322 g/g/d, bc −0.431, Q 3.30, T0 21.9 °C, Tm 29.4 °C.
  - The fish were 203–664 g Ontario pike; growth optimum 19 °C, growth stops at 27.5 °C, death at 29.4 °C.
  - Context only: the steep −0.431 exponent was fitted far above juvenile size and would be absurd if extrapolated to larvae (>200 %/d) [inf].
- **Johnson 1966** (JFRB 23:1495–1505; [doi:10.1139/f66-140](https://doi.org/10.1139/f66-140)) [abstract]
  - Pike fed minnows: maintenance 45 mg/g/d (late-June peak) to 25 mg/g/d (October–April).
  - Above maintenance, 1 g food → 0.437 g pike at ad lib; best conversion 0.485, reached below maximum intake.
  - Fish sizes were not in the abstract.
- **Hatchery feed conversion for muskie/pike on forage fish:** 2.75–3.5 kg food per kg gain [snippet; [Univ. Kentucky aquaculture sheet](https://aquaculture.o2.boa.ca.uky.edu/sites/aquaculture.ca.uky.edu/files/muskpike.pdf)].

**FB4 Cmax at larval sizes (adult pike set; juvenile musky set in brackets), %BW/d** [inf; computed from the FB4 table]

| W (g) | 8 °C | 10 | 12 | 15 | 18 | 21 | 24 |
|---|---|---|---|---|---|---|---|
| 0.002 | 12 [13] | 15 [17] | 19 [22] | 29 [31] | 42 [43] | 55 [55] | 62 [65] |
| 0.012 | 8 [10] | 11 [13] | 14 [16] | 21 [23] | 30 [31] | 40 [40] | 45 [47] |
| 0.05 | 7 [8] | 8 [10] | 11 [12] | 16 [18] | 23 [24] | 31 [31] | 35 [36] |
| 0.2 | 5 [6] | 6 [8] | 8 [10] | 13 [14] | 18 [19] | 24 [24] | 27 [28] |
| 1 | 4 [4] | 5 [6] | 6 [7] | 9 [10] | 14 [14] | 18 [18] | 20 [21] |
| 20 | 2 [3] | 3 [3] | 4 [4] | 6 [6] | 8 [8] | 10 [10] | 12 [12] |

- CEQ-4 f(T) relative to its 24 °C peak: 0.19 at 8 °C, 0.24 at 10, 0.31 at 12, 0.47 at 15, 0.67 at 18, 0.88 at 21; 1.0 at 24; 0.86 at 28; 0.68 at 30 [inf].
- The juvenile muskellunge set (Kitchell CTO 26 / CTM 34) has nearly the same curve and level [inf]. **Swapping to it would not rescue larvae.**

## Q2. Specific growth rates and growth versus temperature (fed to excess)

**Górny 1992** (Arch. Pol. Fish. 1(1):27–31; [FAL page](https://fal.infish.com.pl/index.php/FisheriesAndAquaticLife/article/view/553)) [primary, scanned]
- Pike larvae from one female, taken after yolk resorption at **12.5 mm TL**.
- 10 per dm³ in 13-dm³ flow-through containers, fed **live zooplankton ad libitum hourly for 16 h/d**.
- Warmed from 11.5 °C at 0.1–0.5 °C/h, then reared **7 d** at the test temperature.
- Initial weight not reported.

Final values (N = 30):

| °C | Survival % | Weight mg | TL mm | Biomass mg |
|---|---|---|---|---|
| 12 | 80.0 | 28.5 ± 5.8 | 15.76 ± 1.19 | 2,964 |
| 15 | 80.0 | 43.2 ± 8.9 | 17.27 ± 1.00 | 4,493 |
| 18 | 81.5 | 50.7 ± 19.8 | 18.67 ± 1.70 | 5,374 |
| 21 | 74.6 | 65.2 ± 28.7 | 19.98 ± 2.01 | 6,334 |
| 24 | 53.1 | 93.9 ± 55.8 | 22.25 ± 3.14 | 6,479 |
| 27 | 68.5 | 82.3 ± 44.7 | 21.68 ± 3.28 | 7,334 |

- Cannibalism: none at 12–15 °C, 0.7 % at 18, 14.6 % at 21, 26 % at 24, 12.3 % at 27 °C.
- Górny puts the rearing optimum at 24–27 °C, against the 15–20 °C or 18–20 °C used before.
- **Derived [inf]:** with a start mass of 11–13 mg (12 mg at 11 mm SL in Szczepkowski; 12.7 mg at ~12 mm in Wolska-Neja) and 7 d plus the warm-up:
  - TL growth 0.45 (12 °C), 0.56–0.65 (15), 0.64–0.82 (18), 0.68–0.96 (21), 0.80–1.21 (24), 0.68–1.11 (27) mm/d;
  - SGR 11–14, 14–19, 14–20, 15–23, 16–27 and 14–24 %/d.
  - Weight rose as ~TL^3.5 over this range.

**Fey & Greszkiewicz 2021** (Fish. Res. 236:105843; [doi:10.1016/j.fishres.2020.105843](https://doi.org/10.1016/j.fishres.2020.105843)) [primary; read as the reprint in [Greszkiewicz 2022 PhD, Univ. Gdańsk](https://old.oig.ug.edu.pl/sites/default/files/postepowania_naukowe/111968/praca/rozprawa_doktorska_m.greszkiewicz.pdf)]
- Larvae reared from hatch for 28 d at 10, 15 and 22 °C (warmed within 24–48 h), 12 h light.
- Fed ad libitum every 1.5 h in daylight on DRY larval feeds (ArtEX 2, then Perla Larva Proactive).
- SL-at-age slopes: **0.25 mm/d (10 °C), 0.48 (15 °C), 0.83 (22 °C)**. The slopes include the yolk-sac days, and the best individual reached 1.28 mm/d.
- Regressions: SL = 9.52 + 0.249·age (10 °C); 9.60 + 0.478·age (15 °C); 7.71 + 0.831·age (22 °C).
- They note 0.80 mm/d at 18 °C on artificial feed (Fey et al. 2018) and 0.81 mm/d at 13.5–18.5 °C on live zooplankton (Wolska-Neja & Neja) [secondary].
- Since live zooplankton gave equal growth at lower temperature, the dry-feed values are probably below the live-food maximum [inf].

**Greszkiewicz & Fey 2020** (Hydrobiologia; [doi:10.1007/s10750-020-04328-5](https://doi.org/10.1007/s10750-020-04328-5)) [primary, dissertation reprint]
- Same set-up, 9–32.5 mm SL, 45 d.
- Cannibalism began when the yolk was absorbed: 5 dph at 13 mm SL (22 °C), 10 dph at 13.4 mm (15 °C); none at 10 °C.
- Growth of cannibals vs prey: 0.57 vs 0.32 mm/d at 22 °C; 0.55 vs 0.43 mm/d at 15 °C.
- **Greszkiewicz 2022** dissertation abstract [primary]: growth rose across 10–22 °C, so the optimum is "22 °C or higher" ([abstract PDF](https://oig.ug.edu.pl/sites/oig.ug.edu.pl/files/_nodes/strona/62593/files/Abstract%20M.Greszkiewicz.pdf)).
- Timing quoted in the dissertation [secondary]:
  - exogenous feeding 9 dph at 12 °C, yolk absorbed 16–22 dph at 12 °C (Pospíšilová et al. 2019);
  - yolk resorbed 6 dph at 12 °C (Fey et al. 2019) and 10 dph at 10 °C (Demirci et al. 2017).

**Wolska-Neja & Neja 2006** [primary], Tables 2–3:
- Day 2: 9.32 mm TL; day 1: 8.90 mg (yolk-sac).
- Days 2–7 at 13.5 °C: 11.5–12.3 mm, 12.67 mg.
- Days 7–13 at 17.5 °C: 15.9–17.4 mm, 37.3 mg.
- Days 13–20 at 18.5 °C: 22.6–26.2 mm, 152.2 mg.
- Days 20–27 at 16.6 °C: 27.6–33.6 mm, 307.4 mg.
- Survival 92 % and 96 %; no cannibalism.
- **Derived SGR [inf]:** 5.9 %/d (yolk → first feeding), **18.0 %/d (17.5 °C), 20.1 %/d (18.5 °C)**, 10.0 %/d (16.6 °C, when *Daphnia* was the wrong food at that stage).
- TL growth ~0.5 mm/d (13.5 °C) → 0.75 → 1.1–1.25 → 0.8–1.06 mm/d.
- Literature they quote [secondary]:
  - natural larvae 0.5–0.7 mm/d over the first 20 d (Franklin & Smith 1963);
  - aquarium larvae 0.12–0.80 mm/d (Ivanova & Svirskaya 1995);
  - 1.8 mm/d on high-protein starter feed under full control (Wolnicki & Górny 1995).

**Bry, Hollebecq, Ginot, Israel & Manelphe 1991** (Aquaculture 97:155–168; [doi:10.1016/0044-8486(91)90262-6](https://doi.org/10.1016/0044-8486(91)90262-6)) [snippet]
- In ponds, SGR fell from **22.2 to 17.4 %/d in the larval period (~15 °C)** and from **24.1 to 16.0 %/d in the early juvenile period (~19 °C)**.

**Szczepkowski 2006, 2009** [primary; 2006 = [FAL 14(1)](https://fal.infish.com.pl/index.php/FisheriesAndAquaticLife/article/view/185), reprinted as experiment I of 2009]

Dry feed, hatchery rations (not true ad lib):

| Start (g) | SL (cm) | Days | °C | SGR %/d | Notes |
|---|---|---|---|---|---|
| 0.012 | 1.1 | 14 | ~18–22 (exp. VII; Table 2 alignment unclear) | ~17–18 (0.012 → 0.12–0.14 g; text: "about 18") | tank-shape trial |
| 0.101 | 2.3 | 12 | ~22 | 15.9–16.4 | SL 2.3 → 4.3 cm (1.7 mm/d) |
| 0.201 | 2.9 | 11 | ~20 | 12.1–12.8 | SL → 4.4 cm (1.4 mm/d) |
| 0.54 | 4.1 | 13 | ~18–20 | 9.2–9.7 | SL → 5.7 cm (1.25 mm/d) |
| 2.51 | 7.2 | 19 | 18.1 | 4.2–4.7 | 4 / 6 / 8 % dry ration; plateau at 6 % |
| 5.7 | 8.8 | 21 | 20 / 24 / 28 | 3.56 / 4.05 / 4.42 | SL 8.7 → 11.2–11.6 cm (1.2–1.4 mm/d); survival 90 / 87 / 99 % |
| 5.75 | 8.8 | 28 | ~17.6–20.5 (Table 2 alignment unclear) | 3.7–3.9 | feeding-period trial |

- The 5.7-g results show juvenile pike still gain from 20 → 28 °C.
- Across sizes, SGR scales ≈ W^−0.3 between 0.1 and 5.7 g [inf].

**Other temperature evidence**
- **Hokanson, McCormick & Jones 1973** (TAFS 102:89–100; [OUP page](https://academic.oup.com/tafs/article/102/1/89/7895587)) [abstract]
  - Larval growth peaked at **26 °C** and was negligible below **7 °C**.
  - Mortality rose in the first 2 weeks at 26 °C, so net biomass gain was highest at **21 °C**.
  - Yolk-sac larvae: 1-d upper TL50 28.4 °C (acclimated at 17.7 °C); survived 7 d at 3.2 °C.
  - "< 55 mm" is Jacobson's size label for these larvae [primary Jacobson 1992].
- **Casselman 1996**, via Harvey 2009 ([DFO synopsis](https://waves-vagues.dfo-mpo.gc.ca/Library/337844.pdf)) [secondary]:
  - YOY growth optimum 22–23 °C, above juveniles and sub-adults;
  - a Great Lakes rule of thumb of ~10 mm per week post-hatch;
  - first feeding at 12–15 mm after 6–10 d of yolk absorption (Bry 1996).
- **Tiger muskellunge**, Meade, Krise & Ort 1983 (Aquaculture 32:157–164; [doi:10.1016/0044-8486(83)90277-6](https://doi.org/10.1016/0044-8486(83)90277-6)) [abstract]:
  - 3–4 cm fish: growth, production and feed conversion greatest at 20–22 °C; cannibalism index peaked at 24 °C;
  - 12–13 cm fish: best at 23 °C.
- **Górny 1992** [primary, citing Hokanson 1973]: the greatest length and weight increment was at 26 °C and the greatest net biomass at 21 °C.

## Q3. Routine and standard metabolism by size and temperature; mass exponent at larval sizes

**Woynárovich 1960** (Annal. Biol. Tihany 27:183–191; [REAL-MTAK](https://real.mtak.hu/198328/)) [primary]
- Pike larvae from hatch to "ready to feed" (yolk used, gill respiration), in sealed vessels, 3–30 larvae per vessel.

| °C | I: hatchling (8.55 mm, 2.05 mg dry) | II: mid-yolk (11.05 mm, 1.75 mg dry) | III: ready to feed (12.7 mm, 1.69 mg dry) |
|---|---|---|---|
| | µg O₂ larva⁻¹ h⁻¹ (mg g dry⁻¹ h⁻¹) | | |
| 0.5 | 0.22 (0.11) | 0.70 (0.40) | 0.96 (0.57) |
| 5 | 0.44 (0.22) | 1.26 (0.72) | 1.89 (1.12) |
| 10 | 0.81 (0.39) | 2.03 (1.16) | 3.57 (2.11) |
| 15 | 1.48 (0.72) | 3.49 (2.00) | 5.94 (3.51) |
| 20 | 2.04 (1.00) | 5.34 (3.05) | 9.02 (5.33) |
| 25 | 2.53 (1.23) | 7.22 (4.13) | 12.53 (7.41) |
| 28 | 2.86 (1.40) | 7.90 (4.52) | 15.04 (8.89) |

- Q(25/5) per g dry: 5.6 (I), 5.7 (II), **6.6 (III)** → Q10 ≈ 2.4–2.6 [inf].
- Dry mass fell 17.6 % from hatch to first feeding.
- **Wet basis [inf]:** at ~12 mg wet (stage III) these are **0.16 / 0.30 / 0.50 / 0.75 / 1.04 mg O₂ g⁻¹ h⁻¹** at 5 / 10 / 15 / 20 / 25 °C, or 52 / 97 / 161 / 245 / 340 J g⁻¹ d⁻¹.

**Olifan 1940** (Doklady AN SSSR 29(8–9):627–630; [PDF](https://elib.gstu.by/bitstream/220612/33464/1/627-630.pdf)) [primary, figure read by eye]
- Unfed pike larvae at 17.5–18.5 °C, manometric and chemical methods.
- Diel rhythm with morning and evening peaks, 2–4× from minimum to maximum.
- Per larva: ~4–18 µL O₂/h at 6 d (yolk-sac), 8–30 µL/h at 10 d, 36–119 µL/h at 25 d.
- Masses not given. At ~13 mg (10 d) that is ≈ 0.9–3.3 mg O₂ g⁻¹ h⁻¹, at the high end of Woynárovich [inf].
- Pike larvae "hang motionless" in the water column, vibrating their pectoral fins, and dart at prey: a low-activity forager.

**Wieser, Laich & Medgyesy 1992** (J. Exp. Biol. 169:165–179; [doi:10.1242/jeb.169.1.165](https://doi.org/10.1242/jeb.169.1.165)) [abstract; full text blocked]
- Pike larvae and early juveniles at 15 °C, fed *Artemia* nauplii or roach larvae.
- Routine O₂ is mass-independent in the smallest larvae; above ~10 mg wet it scales with a mass-specific exponent of **−0.154** (whitefish −0.103).
- Routine, minimum and maximum metabolism are lower in pike than in whitefish.
- Mass-specific growth ∝ W^−0.24 (r 0.90).
- Yield ≈ 0.043 mg dry growth per µmol O₂.
- 62 ± 3.7 % of metabolizable energy goes to growth.
- **Aerobic maximum for growth ≈ 200–220 µmol O₂ g dry⁻¹ h⁻¹** (≈ 6.4–7.0 mg g dry⁻¹ h⁻¹, about 1.8–2× Woynárovich's unfed stage-III rate at 15 °C [inf]).
- Context, not pike: for whitefish and roach larvae, feeding-induced O₂ plateaus at 12.4 µmol g⁻¹ h⁻¹ above ~8 %/d growth at 15 °C (Wieser & Medgyesy 1990 [abstract], [doi:10.1098/rspb.1990.0102](https://doi.org/10.1098/rspb.1990.0102)).

**Juveniles and older fish**
- **Armstrong, Priede & Lucas 1992** (J. Fish Biol. 41 Suppl. B:65–75; [doi:10.1111/j.1095-8649.1992.tb03869.x](https://doi.org/10.1111/j.1095-8649.1992.tb03869.x)) [abstract]
  - 40–1,291 g at 15 °C: resting VO₂ ∝ W^0.80; maximum ∝ W^0.99.
  - Peak post-meal O₂ is a constant multiple of resting for meals up to 10 %BW.
  - In juveniles the post-meal peak can use the whole aerobic scope; in adults it cannot.
- **Armstrong & Hawkins 2008** (Hydrobiologia 601:83–90; [doi:10.1007/s10750-007-9268-x](https://doi.org/10.1007/s10750-007-9268-x)) [snippet]
  - Pike SMR Q10 differs among studies, **1.73–4.80**; size- and temperature-adjusted SMR differs 2–4×; mass exponents 0.81–0.82.
  - Halving SMR cut modelled intake by 19–42 %.
  - The adult FB4 set's RQ 0.055 is the bottom of that Q10 range (Q10 1.73) [inf].
- **Chipps, Clapp & Wahl 2000** (J. Fish Biol.; [doi:10.1006/jfbi.1999.1156](https://doi.org/10.1006/jfbi.1999.1156)) [abstract]: age-0 muskellunge 0.10 (5 °C) → 0.24 (25 °C) mg O₂ g⁻¹ h⁻¹, with winter values below spring and autumn at equal temperature.
- **Zakęś et al. 2007** (Arch. Pol. Fish. 15; [FAL](https://fal.infish.com.pl/index.php/FisheriesAndAquaticLife/article/view/204)) [primary]
  - Fed juvenile pike (pellets) at 66–91 g.
  - Mean daily O₂ consumption fell with size from 145 to 93 mg kg⁻¹ h⁻¹ at 20 °C and from 167 to 103 at 24 °C.
- **AFS 2012 abstract M-6-22** ([confex](https://afs.confex.com/afs/2012/webprogram/Paper9379.html)) [snippet; page unreachable]
  - Basal metabolism of four young-of-year esocids by static respirometry at 20, 23, 26, 28 and 30 °C.
  - Grass pickerel 0.515, chain pickerel **0.363**, northern pike 0.425, muskellunge 0.419 ml O₂ g⁻¹ h⁻¹ (≈ 0.74 / 0.52 / 0.61 / 0.60 mg).
  - Species × temperature interaction p = 0.023. Sizes not seen.
- **Diana 1983** (Can. J. Zool. 61:1968–1975; [doi:10.1139/z83-259](https://doi.org/10.1139/z83-259)) [abstract]
  - "Relative cost of maintenance was very low for age 0 fish (~60 %) and increased with age". The basis of the percentage is not stated in the abstract.
  - Diana's SMR: as 0.00140, b −0.18, m 0.16 (Q10 5.0, from only two temperatures, 1 and 18 °C). Jacobson refit it at Q10 2.3 (as 0.00478, m 0.0833). Egestion 0.13; SDA 0.104 [Jacobson 1992, primary].

**FB4 adult pike respiration vs measured, at 12 mg** [inf]

| °C | FB4 R (incl. activity ×1.13), mg O₂ g⁻¹ h⁻¹ | Measured, unfed first-feeder (Woynárovich) | FB4 ÷ measured |
|---|---|---|---|
| 5 | 0.36 | 0.16 | 2.3 |
| 10 | 0.48 | 0.30 | 1.6 |
| 15 | 0.63 | 0.50 | 1.27 |
| 20 | 0.83 | 0.75 | 1.10 |
| 25 | 1.09 | 1.04 | 1.05 |

- At 2 mg the FB4 values are 1.38× higher still (W^−0.18 from 12 to 2 mg). Wieser finds metabolism mass-independent below ~10 mg, so that extra is not supported. A 9–12-mm pike weighs 9–12 mg, not 2 mg [primary data above].
- For juveniles, FB4 at ~20–50 g gives 0.08–0.10 mg O₂/g/h at 5 °C and 0.24–0.29 at 25 °C, close to age-0 muskellunge's 0.10 and 0.24 [inf].

## Q4. Published bioenergetics sets for juvenile esocids; the Bevelhimer size range

FB4 esocid entries [primary: FB4 `Parameters_official.csv` as bundled in [fb4package](https://github.com/HansTtito/fb4package) `data/fish4_parameters.RData`; FB4 = Deslauriers et al. 2017, [doi:10.1080/03632415.2017.1377558](https://doi.org/10.1080/03632415.2017.1377558)]:

| FB4 entry | Consumption | Respiration | Losses | ED (J/g) | Source and FB4 note |
|---|---|---|---|---|---|
| Northern pike (adult) | CEQ 4: CA 0.0244, CB −0.18, CQ −0.024, CK1 0.0125, CK4 −0.000326 | REQ 1: RA 0.0026445, RB −0.18, RQ 0.055, RTO 0.1222, RK1 1, RK4 0 (activity e^0.1222 = 1.13) | SDA 0.175, FA 0.20, UA 0.0875 | 3,598 | Bevelhimer et al. 1985. "New CEQ=4 … adjusted UA and SDA for (C−F). Adjusted RA for log transform of fit" |
| Muskellunge (adult) | CEQ 4: CA 0.0126, CQ 0.06, CK1 0.0075, CK4 −0.000216 | as pike | as pike | 3,598 | Bevelhimer et al. 1985 |
| Tiger muskellunge (adult) | CEQ 4: CA 0.046, CQ 0.401, CK1 −0.014, CK4 0.000155 | as pike | as pike | 3,598 | Bevelhimer et al. 1985 |
| **Muskellunge (juvenile)** | **CEQ 2: CA 0.221, CB −0.18, CQ 2.53, CTO 26, CTM 34** | REQ 1: RA 0.00246, RB −0.18, RQ 0.055, RTO 0.03922 (activity 1.04) | **SDA 0.14, FA 0.13, UA 0.08046** | **3,874** | Schoenebeck et al. 2008. "CAUTION! This model needs their correction factor!" |

- **Schoenebeck, Chipps & Brown 2008** (TAFS 137; [doi:10.1577/T07-229.1](https://doi.org/10.1577/T07-229.1)) [abstract]
  - Age-0 tiger muskellunge.
  - A regression correction for initial weight, temperature and relative growth rate (cal g⁻¹ d⁻¹) explained 58 % of the consumption error.
  - Mean error 43 % uncorrected → 7 % corrected.
  - Fish sizes and the correction equation were not in the abstract.
- **Wahl & Stein 1991** (TAFS 120:230–246; [doi:10.1577/1548-8659(1991)120<0230:FCAGOT>2.3.CO;2](https://doi.org/10.1577/1548-8659(1991)120%3C0230:FCAGOT%3E2.3.CO;2)) [abstract]
  - Stocked young-of-year muskie, pike and tiger muskie in five Ohio reservoirs; they ate gizzard shad (77–97 % by weight).
  - The model **underestimated final mass 2–3×** and **overestimated consumption 39–52 %**.
  - Field **conversion efficiencies were 39–63 %**, above the lab values at maximum ration.
  - Thermoregulation or seasonal prey energy changed predictions by ≤ 2 %; seasonal and temperature adjustments to metabolism "substantially improved" them.
- **Chipps, Einfalt & Wahl 2000** (TAFS 129:186; [doi:10.1577/1548-8659(2000)129<0186:GAFCBT>2.0.CO;2](https://doi.org/10.1577/1548-8659(2000)129%3C0186:GAFCBT%3E2.0.CO;2)) [abstract; [USGS record](https://www.usgs.gov/publications/growth-and-food-consumption-tiger-muskellunge-effects-temperature-and-ration-level)]
  - Age-0 tiger muskie at 25–100 % Cmax and 7.5–25 °C.
  - Consumption overestimated **113 % at 10 °C and 328 % at 7.5 °C**, but 4–58 % at 20–25 °C. Errors are larger at low rations.
  - They advise modelling waste as a function of ration.
- **No larval esocid bioenergetics set was found.** The juvenile muskellunge set is the only juvenile one. At 2–12 mg its Cmax is 0–25 % above the adult pike set's, the most in cold water [inf, table in Q1]. So it does not fix larvae.
- Other relevant context:
  - Jacobson 1992's Minnesota set (Casselman Cmax, Diana and Brett & Groves metabolism) [primary], for larger fish;
  - Armstrong 2018, "Bioenergetics and individual growth of pike", in Skov & Nilsson (eds), *Biology and Ecology of Pike* (CRC), pp. 62–82 — not read; abstract only ([record](https://research-scotland.ac.uk/items/04cccc10-82aa-4961-874a-557a1b5a873e)).

## Q5. Energy density, assimilation and egestion

- **Pike larvae on yolk** (Trabelsi 2011, PhD Univ. Lorraine, [PDF](http://docnum.univ-lorraine.fr/public/SCD_T_2011_0128_TRABELSI_ZOUARI.pdf)) [primary]
  - Eggs incubated at 12.0 ± 0.5 °C.
  - At hatching: body dry mass 0.25–0.32 mg and 6.0–8.5 J per larva; yolk 1.33–1.44 mg dry and 36–39 J.
  - Whole-larva calorific value **26.6 J/mg dry (day 6) → 24.8 J/mg dry (day 15)**; ash 4–5 %, protein 68–71 % of dry mass.
  - **Wet basis [inf]:** 1.69 mg dry (Woynárovich) ÷ ~12 mg wet ≈ 14 % dry → **~3.5 kJ/g wet at first feeding**. Water content is uncertain by a few points, which moves this ±0.5 kJ/g.
- **Réalis-Doyelle et al. 2022** (KMAE 423; [doi:10.1051/kmae/2022007](https://doi.org/10.1051/kmae/2022007)) [abstract]
  - 8–16 °C; development 3× longer at 8 than at 16 °C.
  - At 16 °C the larvae were larger and had the most energy at first feeding.
  - Survival to first feeding 70–76 %. Values not read (KMAE blocked).
- **Juveniles:** FB4 juvenile muskellunge 3,874 J/g [primary FB4]; pike 4,391 J/g (Wahl & Stein 1991, via a Colorado report) [secondary, in `northern_pike.md`]; adult pike set 3,598 J/g.
- **Prey:** the sim's zooplankton is 2,300–2,700 J/g wet (`src/config.js` `PREY`). Whole fish are usually ~4.0–4.5 kJ/g wet (database median 4.2 kJ/g) [snippet, [Hermann et al. via NSF-PAR](https://par.nsf.gov/biblio/10654837)]. A 4.2-kJ/g fathead minnow ration therefore carries ~1.6× the energy of the same mass of zooplankton [inf].
- **Assimilation and losses**
  - No direct pike-larva absorption efficiency was found.
  - Wieser et al. 1992: 62 % of **metabolizable** energy goes to growth at 15 °C [abstract].
  - Juvenile and adult egestion: 0.13 (Diana 1983 via Jacobson; FB4 juvenile musky) vs 0.20 in the adult pike set.
  - SDA: 0.104 (Diana) or 0.14 (juvenile musky) vs 0.175 (adult set).
  - Larval guts are short and assimilation is lower at first feeding (Trabelsi 2011 review, French text [primary, qualitative]).
- **Model partition vs measured [inf]**
  - Adult set at Cmax on zooplankton, 12 mg, 15 °C: growth is 28 % of metabolizable energy (C·0.8·0.9125 = 389 J/g/d; growth 108).
  - Wieser measured 62 %. With a ration of ~1,500 J/g/d (~59 %BW/d zooplankton), Woynárovich respiration and FB4 losses give 66 %, about Wieser's value.

## Q6. Chain pickerel (and other pickerel) specifics

- **Spawning temperature:** 6–11 °C [primary page, [Ontario Freshwater Fishes](https://ontariofishes.ca/fish_detail.php?FID=89)]; 8–11 °C in Maine (`pickerel_young_of_year.md`).
- **Hatch and first feeding:** hatch at 4.2–7.0 mm; yolk absorbed and first feeding ~1 week after hatch at ~10 mm (10.2 mm, Underhill 1949) [`pickerel_young_of_year.md`].
  - That is smaller than pike (hatch 6–8 mm, first feeding 12–15 mm; Harvey 2009 [secondary]).
  - A ~10-mm first-feeding pickerel probably weighs ~6 mg, scaling the pike's 12 mg at 12.5 mm by ~L^3 [inf].
- **The adult length–weight curve** (log10 W = −5.824 + 3.243 log10 TL; TL mm, W g) gives **1.9 mg at 9 mm**, the sim's 2-mg larva. Pike larvae weigh 2–4× more at the same length (Q2) [inf].
- **Metabolism:** young-of-year chain pickerel basal metabolism at 20–30 °C is ~15 % below pike's (0.363 vs 0.425 ml O₂ g⁻¹ h⁻¹) [snippet, AFS 2012]. Preferred general habitat temperature 21–30 °C [Ontario page].
- **No chain-, grass- or redfin-pickerel larval consumption, growth-versus-temperature or bioenergetics study was found.** Pike larval data are the stand-in.
  - The lab pike growth rates at Maine May–July temperatures (0.25–0.5 mm/d at 10–15 °C; 0.6–0.9 at 18–22 °C; 0.8–1.2 at 21–24 °C) bracket the field pickerel targets (0.3–0.5 May, 0.5–0.7 June, 0.9–1.1 July) [inf]. The field target is physiologically ordinary for an esocid larva.

---

## Diagnosis: which part of the adult pike set fails at larval size [inf, from the measured values above]

FB4 adult pike set, 12-mg larva, prey zooplankton 2,550 J/g, losses as coded (net = 0.8·(1 − 0.0875 − 0.175) = 0.59 of intake); fish ED 3,598 J/g:

| °C | FB4 Cmax %BW/d | FB4 max SGR %/d | Same with measured respiration | Measured max SGR %/d | Cmax needed, %BW/d zooplankton (measured R; larval ED 3.0–3.5 kJ/g) | Shortfall |
|---|---|---|---|---|---|---|
| 10 | 11 | 0.2 | 1.8 | ~5–8 (Fey & G. 0.25 mm/d) | 16–25 | ×1.5–2.3 |
| 12 | 14 | 1.0 | 2.4 | 11–14 (Górny) | 30–37 | ×2.1–2.6 |
| 15 | 21 | 3.0 | 4.3 | 14–19 (Górny); 17–22 (Bry ponds) | 41–53 | ×2.0–2.5 |
| 18 | 30 | 5.9 | 6.7 | 14–20 (Górny); 18–20 (Wolska-Neja) | 44–61 | ×1.5–2.0 |
| 21 | 40 | 8.6 | 9.3 | 15–23 (Górny) | 49–68 | ×1.2–1.7 |
| 24 | 45 | 9.4 | 9.9 | 16–27 (Górny) | 55–82 | ×1.2–1.8 |

1. **Respiration level: roughly right at 15–25 °C.** FB4 is 1.05–1.27× the unfed routine rate. FB4's total cost (R + SDA at Cmax) is about equal to the measured aerobic ceiling of growing larvae (~1.0–1.2 mg O₂/g/h at 15 °C).
2. **Respiration temperature slope: too shallow for larvae.** RQ 0.055 (Q10 1.73) against the larva's Q10 ~2.5. FB4 overcharges 1.6× at 10 °C and 2.3× at 5 °C.
   - This explains why the sim's larvae starve in the 5–12 °C water they hatch into, where FB4 net growth at full ration is ≤ 1 %/d.
   - Fixing it alone lifts growth by only 1–2 %/d (column 4), so it is real but secondary.
   - Armstrong & Hawkins's 1.73–4.80 Q10 spread among adult studies shows RQ is poorly constrained in adults too.
3. **Cmax level at larval size: the main failure.**
   - Measured larval growth (11–27 %/d) needs intakes 1.2–2.6× the set's g/g ceiling.
   - The set comes from 9–53-g pike eating ~4.2 kJ/g fathead minnows. Applied in grams to 2.4–2.7 kJ/g zooplankton, it gives a 1.6× smaller **energy** ceiling. That alone closes most of the gap at 18–24 °C (e.g. 24 °C: 45 % × 1.6 ≈ 72 %, needed 55–82 %) but not at 12–15 °C.
   - Supporting measured rations:
     - ~60–80 %BW/d implied in Wolska-Neja's tanks;
     - 220–500 %BW/d wet zooplankton maxima in small cyprinids (Marmulla & Rösch);
     - the 62 % growth partition (Wieser), which needs intake ≫ respiration.
   - Conflicting: Grès et al.'s ~30 %BW/d at 13–16 mm, in crowded intensive culture at an unseen temperature.
4. **Cmax mass exponent: shallow.** Going from 12 mg (needed 44–61 % at 18 °C) to the fitted 10-g size (FB4 9 % at 18 °C) implies CB ≈ −0.25 (−0.30 using 12 °C).
   - Wieser's larval growth exponent is −0.24; the hatchery SGR exponent is ≈ −0.3 (0.1–5.7 g).
   - Above ~0.1 g on fish prey, the set is within ~±30 % of hatchery growth (e.g. FB4 13.7 %/d at 0.1 g and 24 °C vs 16 %/d measured), so the misfit is concentrated in the zooplankton-eating stage below ~0.1–0.3 g (≤ ~30–40 mm).
5. **Cmax temperature curve: too steep at the cold end for larvae.**
   - Needed Cmax at 12 °C is ~37–67 % (midpoints ~50 %) of that at 24 °C; CEQ-4 gives 31 %. Measured larval growth at 10–12 °C is 30–34 % of the 22–24 °C rate in mm/d.
   - The warm end is fine: larval growth rises to 24–26 °C (Hokanson; Górny), and CEQ-4 peaks at 24–25 °C.
6. **Losses:** FA 0.20 and SDA 0.175 are the adult set's. Diana and FB4's juvenile set use 0.13 and 0.10–0.14, and Johnson measured 0.44–0.49 g gain per g food above maintenance. Using them would lift net intake from 0.59 to ~0.68 of C, ~15 % [inf].
7. **Larval mass at length:** the sim's 2 mg at 9 mm is 4–6× too light (real: ~9 mg with yolk at 9.3 mm, ~12 mg at first feeding, 12–12.7 mm). With W^−0.18 this inflates both Cmax and R by ~1.3×, so it is roughly neutral for growth. It matters for gape, prey and predator size windows, and for the mass-independent metabolism Wieser finds below ~10 mg.

**What measured values support, without fitting [inf]:**
- a larval respiration Q10 of ~2.5 (Woynárovich), equal to FB4 at 20–25 °C;
- a larval intake ceiling expressed in energy, scaled from the fish-fed fit by prey energy density (~1.6×), plus a steeper mass exponent (−0.24 to −0.30) below ~1 g;
- larval losses nearer FA 0.13 / SDA 0.14.

Checks against measured larval growth (Górny; Fey & Greszkiewicz; Wolska-Neja; Bry):
- at 10 °C: ~0.25–0.45 mm/d;
- at 15 °C: ~0.5–0.65 mm/d;
- at 18–22 °C: ~0.6–0.95 mm/d;
- at 24 °C: ~0.8–1.2 mm/d;
- SGR 14–27 %/d at 15–24 °C for 12–100 mg larvae.

What remains uncertain:
- Grès et al.'s full ration and temperature table;
- Wieser et al.'s absolute feeding rates;
- the actual Bevelhimer fish sizes and fathead energy density (only via Jacobson);
- any pickerel-specific larval data.

---

## Access log (2026-10-21)

**Read in full**
- Górny 1992 (scan, page images).
- Wolska-Neja & Neja 2006.
- Szczepkowski 2009 (includes Szczepkowski 2006).
- Woynárovich 1960.
- Olifan 1940 (scan).
- Trabelsi 2011 thesis (relevant chapters).
- Fey & Greszkiewicz 2021 and Greszkiewicz & Fey 2020 (as reprints in the Greszkiewicz 2022 dissertation, Univ. Gdańsk).
- Jacobson 1992 (MN DNR IR 424).
- Zakęś et al. 2007.
- Harvey 2009 DFO synopsis.
- FB4 parameter table, by parsing `fish4_parameters.RData` from the fb4package GitHub repository; it is derived from FB4's `Parameters_official.csv`.

**Abstracts** (OpenAlex API, publisher abstract pages, or search summaries): Bevelhimer 1985; Wahl & Stein 1991; Chipps et al. 2000 (×2); Schoenebeck et al. 2008; Hokanson et al. 1973 (OUP page); Wieser et al. 1992; Armstrong et al. 1992; Johnson 1966; Diana 1983; Wright & Giles 1987; Marmulla & Rösch 1990; Meade et al. 1983; Réalis-Doyelle et al. 2022; Lemm & Rottiers 1986 (tiger muskie protein × 17/20/23 °C; no rates in abstract).

**Blocked or failed (not bypassed)**

| Site | What | Result |
|---|---|---|
| kmae-journal.org | Grès et al. 1996 PDF and abstract page; Réalis-Doyelle 2022 PDF | 403 / JavaScript challenge |
| limnology-journal.org | Lejolivet & Dauba 1988 (pike fry in cages, Pareloup) | 403 |
| journals.biologists.com / cob.silverchair.com | Wieser et al. 1992 PDF | Cloudflare "Just a moment" 403; only the abstract was obtained |
| cdnsciencepub.com | Bevelhimer et al. 1985 | 403 |
| link.springer.com | Greszkiewicz & Fey 2020 OA PDF; Armstrong & Hawkins 2008 | redirects to an idp "Client Challenge"; the 2020 paper was read in the dissertation instead |
| sciencedirect.com | Bry et al. 1991 | 403 |
| onlinelibrary.wiley.com | pdfdirect for the Aquaculture Research 2012 pike hatching-time paper | 403 |
| hal.inrae.fr, hal.univ-lorraine.fr | — | Anubis "Access Denied" |
| ideals.illinois.edu | 2012 muskellunge temperature/bioenergetics thesis | 403 |
| etheses.durham.ac.uk | Simms pike/salmon metabolism thesis | connection refused |
| search.napstic.cn | Chinese pike O₂ study at 3–18 °C | connection refused |
| afs.confex.com | AFS 2012 M-6-22 | DNS failure; search snippet only |
| documentation.eauetbiodiversite.fr | Grès record | 404 |

**Not read**
- OhioLink: Headrick 1985 PhD (Ohio pike bioenergetics). It downloaded, but it is an image-only scan and was not OCR'd. It may contain Ohio pike respiration data.
- Bevelhimer's own thesis and Wahl's 1988 PhD (OhioLink) were not opened.
- No online copy found:
  - Raat 1988 FAO synopsis;
  - Casselman 1978 OMNR;
  - Lindroth 1942;
  - Karzinkin 1952;
  - Underhill 1949;
  - Armstrong 2018 (chapter).
- Two Belarusian PDFs downloaded:
  - Astrenkov et al., rearing pike larvae: Cyrillic fonts unmapped, not read.
  - The Olifan 1940 Doklady paper: read as page images.

**No email address was given to any API.** OpenAlex and Semantic Scholar were queried without `mailto`; Unpaywall was not used. PDFs went only to the session scratchpad and tool-results folders; none were saved in the repository.
