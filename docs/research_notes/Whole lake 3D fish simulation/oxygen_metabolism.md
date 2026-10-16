# Dissolved-oxygen metabolism benchmarks: gas exchange, GPP/R/NEP, sediment and water-column demand, weed beds, nitrification (for the 3-D lakes' O₂ budget)

**Scope.** This note gives real-lake numbers to recalibrate the O₂ budget of the 3-D Hot Brook lakes (`src/w3/chem3.js`, `config.js` `ENV`/`MICROBE`/`NCYCLE`/`SEDOM`).
- **The lakes:** Upper Hot Brook (360 ha, mean 3.05 m, max 5.5 m) and Lower (277 ha, mean 2.7 m, max 3.9 m). Both are polymictic, mesotrophic and tea-coloured: Secchi 3–4 m, colour 25–45 PCU, DOC 4–6 mg/L, TP 8–15 µg/L, about 35 % of the bed under macrophytes, summer surface 22–26 °C, elevation 129 m (424 ft).
- **The problem:** with no fish, June–August, the sim holds a lake-mean O₂ of only ~51–60 % of saturation. Its daily budget, in g O₂ m⁻² d⁻¹:

  | Term | Value |
  |---|---|
  | Algae, net | +0.4 |
  | Macrophytes, net | −0.4 (a known bug) |
  | Sediment + particle demand | −1.36 |
  | DOM respiration | −0.68 |
  | Nitrification | −0.27 |
  | Re-aeration | +2.25, at an effective k ≈ 0.5 m/d |

**Tags.**
- (full text): I read the paper's text.
- (abstract): I read the abstract only. "(abstract, Crossref)" means the publisher-deposited abstract in the Crossref metadata record.
- (code): read from a model's published source code.
- (data): read from a published data file.
- (model default): a model's default parameter, not a measurement.
- (figure): read off a figure.
- (arithmetic): my calculation on sourced values. The script is in the session scratchpad (`calc/o2calc.mjs`).
- (via X): quoted by another source or by an existing note in this repo.

**How this was researched.** The session's web-search allowance was already used up when this task started. Every source here was therefore reached by a direct page fetch:
- the GLEON LakeMetabolizer source on GitHub;
- Crossref metadata records;
- Springer, Nature and PMC article pages;
- USGS ScienceBase;
- Copernicus journals;
- Lake Stewards of Maine.

Wiley-hosted pages (L&O, GRL, Freshwater Biology) returned HTTP 403. I skipped them and used other sources, so several classic papers appear here at abstract level only. A follow-up with search could fill the gaps listed at the end.

**Units.**
- 1 g O₂ m⁻² d⁻¹ over the 3.05-m mean column = 0.33 mg O₂ L⁻¹ d⁻¹.
- Carbon is converted at PQ = RQ = 1, so 1 g C = 2.67 g O₂.
- Nitrification uses 4.57 g O₂ per g NH₄-N (arithmetic, below).

---

## Summary: the numbers that matter most

1. **Real lakes like these stay near saturation in summer.** Measured Maine lakes of similar size and colour:

   | Lake | Date | Depth | DOC | Profile | % saturation |
   |---|---|---|---|---|---|
   | Skitacook | 9 Aug 2017 | 5.2 m | 3.9 mg/L | 8.2–8.3 mg/L at 22.4 °C, every depth | 97 % |
   | Skitacook | 4 Sep 2012 | | 4.5 mg/L | 8.9–9.1 mg/L at 20.7 °C | 102 % |
   | Webster Pond | 17 Aug 2012 | 2.5 m | 6.8 mg/L | 7.3–7.6 mg/L at 23 °C, every depth | 86–89 % |

   - The profiles are from the EPA NLA, via `recent_maine_research.md`; the saturation percentages are my arithmetic.
   - In southern Quebec, about 75 % of 33 lakes were slightly *under*-saturated in summer. Metabolic balance fell at DOC 4–6 mg/L ([Prairie, Bird & Cole 2002](https://doi.org/10.4319/lo.2002.47.1.0316), abstract, Crossref).
   - **Target: a lake mean of 88–100 % saturation, not 51–60 %.**
2. **The sim's re-aeration velocity is a calm-pond value.**
   - 0.5 m/d equals Cole & Caraco's zero-wind intercept (2.07 cm/h = 0.50 m/d, code).
   - It also equals the 0.54 m/d average that Read et al. 2012 found for lakes **smaller than 10 ha** (abstract, Crossref).
   - For a 3.6-km² lake, Vachon & Prairie 2013 give k₆₀₀ = 1.6 / 2.2 / 3.3 / 4.7 m/d at U₁₀ = 2.5 / 4 / 6.5 / 10 m/s (arithmetic on the code's equation). For O₂ at 22 °C multiply by 1.12, which gives 1.8 / 2.5 / 3.6 / 5.2 m/d.
   - A measured 64-ha boreal lake averaged k₆₀₀ ≈ 1.4 m/d, about twice the Cole–Caraco prediction (Heiskanen et al. 2014, full text).
   - Night-time convection alone gives 0.3–0.9 m/d (arithmetic, surface-renewal model).
3. **Real summer NEP is small: about −0.9 to +0.3 g O₂ m⁻² d⁻¹.** In concentration terms that is −0.3 to +0.1 mg L⁻¹ d⁻¹ in the mixed layer.
   - NE North American lakes, late summer: R = 1.1·GPP + 0.2 mg O₂ L⁻¹ d⁻¹ ([Klug et al. 2012](https://doi.org/10.1021/es302063v), full text). That gives NEP ≈ −0.25 to −0.30 mg/L/d (arithmetic).
   - Lake Sunapee, NH: NEP medians +0.12 to −0.06 mg/L/d (Richardson et al. 2017, full text).
   - The sim's −2.3 g m⁻² d⁻¹ (all its terms together) is 2.5–10× too heterotrophic.
4. **Sediment O₂ demand (SOD) at 20 °C in shallow lakes: 0.14–1.46 g O₂ m⁻² d⁻¹, median 0.59** (USGS cores, data). With θ = 1.065, that is ~0.66 at 22 °C and ~0.75 at 24 °C, with a top end near 1.9 (arithmetic).
   - Models use 1–4 g m⁻² d⁻¹ (via Ladwig et al. 2021, full text), and a eutrophic lake's effective summer SOD was 1–1.5.
   - The sim's 1.36 (SOD + particle demand) is upper-middle for a mesotrophic lake.
   - Measured dark cores leave out benthic algal production. In clear shallow lakes that production is 5–80 % of the total, and can be 77 % (abstracts).
5. **Temperature dependence.**
   - SOD θ = 1.065 (Q₁₀ ≈ 1.9). This is consistent with USGS's 20 °C correction (arithmetic).
   - PCLake uses θ = 1.07 for water and sediment mineralisation and 1.08 for nitrification (model default).
   - Ecosystem respiration doubles every ~7.6 °C (Q₁₀ ≈ 2.5); GPP doubles only every ~14.8 °C (Q₁₀ ≈ 1.6) (via Wikipedia, citing Yvon-Durocher et al. 2012).
6. **Nitrification** used 15–20 % of total hypolimnetic O₂ depletion in mesotrophic Grasmere, split roughly equally between water and sediment (Hall & Jeffries 1984, abstract). The sim's share (12 %) is plausible; its absolute 0.27 g m⁻² d⁻¹ is at the high end (Q6).
7. **Macrophytes.** On a whole-lake basis, submerged plants are a small *net source* in the growing season. In clear *Chara*-lake Krankesjön, macrophyte NPP was 14 g C m⁻² over May–September, ≈ +0.24 g O₂ m⁻² d⁻¹ (abstract; arithmetic). The sim's −0.4 is the wrong sign.
8. **The sim's saturation curve** is right within ±2 % at 10–26 °C. It is **6–10 % low at 0–4 °C**: 12.9 against 14.4 mg/L at 0 °C (arithmetic). Winter O₂ margins are therefore understated.

---

## 1. Gas exchange: k₆₀₀ against wind, lake size, convection, Schmidt number, ice

### Takeaway
For a 3-km² lake, the best-supported wind model is Vachon & Prairie's lake-area form. Typical summer daily-mean kO₂ is then about 1.5–2.5 m/d. The calm-night floor is ~0.5–0.9 m/d, set by convective cooling. Under ice, k is ~0.

The Cole & Caraco curve was fitted on a 15-ha sheltered lake and reads about half of what was measured on a 64-ha lake. The sim's effective 0.5 m/d is the calm-floor value applied all day.

### Cited findings
**Wind formulas**

All formulas give k₆₀₀ in cm h⁻¹ with U₁₀ in m s⁻¹ at 10 m height. To get m/d, multiply by 0.24. Source for all four: the GLEON LakeMetabolizer R package (code): [`k.cole.R`](https://raw.githubusercontent.com/GLEON/LakeMetabolizer/master/R/k.cole.R), [`k.crusius.R`](https://raw.githubusercontent.com/GLEON/LakeMetabolizer/master/R/k.crusius.R), [`k.vachon.R`](https://raw.githubusercontent.com/GLEON/LakeMetabolizer/master/R/k.vachon.R).

- **Cole & Caraco 1998:** k₆₀₀ = 2.07 + 0.215·U₁₀^1.7 (code).
  - It was fitted on Mirror Lake, NH, 15 ha. There k₆₀₀ was 2.65 ± 0.12 cm/h (0.64 m/d), independent of wind over a 50-day stratified period ([Cole & Caraco 1998](https://doi.org/10.4319/lo.1998.43.4.0647), abstract, Crossref; m/d by arithmetic).
- **Crusius & Wanninkhof 2003** (code):
  - bilinear: k₆₀₀ = 0.72·U₁₀ for U₁₀ < 3.7, else 4.33·U₁₀ − 13.3;
  - power: k₆₀₀ = 0.228·U₁₀^2.2 + 0.168.
- **Vachon & Prairie 2013:** k₆₀₀ = 2.51 + 1.48·U₁₀ + 0.39·U₁₀·log₁₀(A), with A the lake area in km² (code).
  - It explained 68 % of the variance in individual k₆₀₀ measurements.
  - At 5 m/s it predicts 6 cm/h for a 1-ha lake and over 13 cm/h for 100 km² ([Vachon & Prairie 2013](https://doi.org/10.1139/cjfas-2013-0241), abstract, Crossref). The code formula reproduces both: 6.01 and 13.81 (arithmetic).
- **Cross-lake dataset** ([Klaus & Vachon 2020, Aquat. Sci.](https://link.springer.com/article/10.1007/s00027-020-00729-9), full text, equations as images):
  - k₆₀₀ from 0.01 to 57.6 cm/h; U₁₀ 0–13 m/s; lakes from 181 m² to 1,342 km².
  - k₆₀₀ was "generally < 10 cm h−1 for U10 < 2 m s−1 and > 10 cm h−1 for U10 > 8 m s−1".
  - Prediction errors reached 10 cm/h or more than 200 %, largest for lakes under 1 km² and winds under 2 m/s.
  - The lake-area effect was weaker than in Vachon & Prairie.

**Typical k for the Hot Brook lakes** (arithmetic from the formulas above; Upper 3.6 km², Lower 2.77 km²)

| U₁₀ (m/s) | Cole–Caraco k₆₀₀ | Crusius–W. bilinear | Crusius–W. power | Vachon–Prairie, Upper | Vachon–Prairie, Lower | **kO₂ at 22 °C, V–P Upper** |
|---|---|---|---|---|---|---|
| 0 (calm) | 0.50 | 0.00 | 0.04 | 0.60 | 0.60 | 0.67 |
| 2.5 | 0.74 | 0.43 | 0.45 | 1.62 | 1.59 | **1.81** |
| 4 | 1.04 | 0.96 | 1.20 | 2.23 | 2.19 | **2.49** |
| 6.5 | 1.74 | 3.56 | 3.40 | 3.25 | 3.18 | **3.63** |
| 10 | 3.08 | 7.20 | 8.71 | 4.68 | 4.57 | **5.22** |

All values are in m d⁻¹.

**Measured k on a small boreal lake** ([Heiskanen et al. 2014, Tellus B 66:22827](https://doi.org/10.3402/tellusb.v66.22827), full text)
- **Lake:** Kuivajärvi, Finland, 63.8 ha, 13.2 m max depth.
- Whole-study mean k₆₀₀: 6.0 cm/h (site) and 5.2 cm/h (footprint), i.e. 1.44 and 1.25 m/d (arithmetic). Single values ranged from near zero to over 25 cm/h.
- **Stratified period:**
  - with wind under 6 m/s, median k₆₀₀ ~7 cm/h (1.7 m/d), with little wind dependence until ~6 m/s;
  - under cooling, k_fp = −0.026·H_eff + 6.0 cm/h, where H_eff is the effective heat flux in W m⁻². k therefore rises as heat loss grows (H_eff < 0).
- **Overturn, U < 3 m/s:** median 3 cm/h.
- **Against Cole–Caraco:** its study mean was 2.2 cm/h, about half the measured k.

**Convection and lake size**
- Read et al. 2012 analysed 40 temperate lakes ([Read et al. 2012, GRL](https://doi.org/10.1029/2012GL051886), abstract, Crossref):
  - convection exceeded wind shear as the mixed-layer turbulence source (u*/w* < 0.75) in 18 of them;
  - all 11 lakes under 10 ha were convection-dominated;
  - their surface-renewal k averaged **0.54 m d⁻¹**.
- MacIntyre et al. 2010, from the abstract only ([MacIntyre et al. 2010, GRL](https://doi.org/10.1029/2010GL044164), abstract, Crossref; the regression coefficients are in the full text, which I could not reach):
  - k₆₀₀ is higher under surface cooling than under heating at low to moderate winds;
  - on low-wind nights k₆₀₀ depends on buoyancy flux, not wind;
  - a surface-renewal model using wind and buoyancy flux matched eddy-covariance k.
- **Surface-renewal forms** (code and full text):
  - Read et al. 2012, as in LakeMetabolizer [`k.read.R`](https://raw.githubusercontent.com/GLEON/LakeMetabolizer/master/R/k.read.R):
    - k₆₀₀ = 0.29·600^−½·(ε·ν)^¼, with ε in cm⁴ h⁻⁴ units;
    - ε = u*³/(κ·S_v) from wind plus −β from cooling;
    - κ = 0.41 and minimum wind 0.2 m/s.
  - Tedford et al. 2014, as used by [Erkkilä et al. 2018, Biogeosciences 15:429](https://bg.copernicus.org/articles/15/429/2018/):
    - ε = 0.56·u*w³/(κz) + 0.77·|β| when cooling, and 0.6·u*w³/(κz) when heating;
    - z = 0.15 m;
    - k = 0.5·(εν)^¼·Sc^−½.
  - The buoyancy flux is β = g·α·H_eff/(ρ·c_p) (full text, both papers).
- **Convection-only k₆₀₀ in calm conditions** (arithmetic; α = 2.2×10⁻⁴ K⁻¹ and ν = 0.955×10⁻⁶ m² s⁻¹ for 22 °C water, my standard values):

  | Net surface heat loss (W m⁻²) | Tedford constants (m/d) | Read constants (m/d) |
  |---|---|---|
  | 25 | 0.55 | 0.34 |
  | 50 | 0.65 | 0.41 |
  | 100 | 0.78 | 0.48 |
  | 200 | 0.93 | 0.57 |

- **Convection matters for O₂ in shallow water.** In ponds, overnight O₂ rises occurred on 45 % of sampled nights, averaging +22 % saturation. They were likely when the pond was ≥ 1.8 °C warmer than the air ([Holgerson, Zappa & Raymond 2016, GRL](https://doi.org/10.1002/2016GL070206), abstract, Crossref).

**Schmidt number for O₂**
- Sc_O₂ = 1568 − 86.04·T + 2.142·T² − 0.0216·T³, valid 4–35 °C (Raymond et al. 2012, via LakeMetabolizer [`getSchmidt.R`](https://raw.githubusercontent.com/GLEON/LakeMetabolizer/master/R/getSchmidt.R), code).
- kO₂ = k₆₀₀·(Sc/600)^−0.5. LakeMetabolizer uses n = 0.5 ([`k600.2.kGAS.R`](https://raw.githubusercontent.com/GLEON/LakeMetabolizer/master/R/k600.2.kGAS.R), code).

| T (°C) | 5 | 10 | 15 | 20 | 22 | 25 |
|---|---|---|---|---|---|---|
| Sc_O₂ | 1189 | 900 | 686 | 531 | 482 | 418 |
| kO₂ / k₆₀₀ | 0.71 | 0.82 | 0.94 | 1.06 | 1.12 | 1.20 |

These are arithmetic. At 0 °C the formula is extrapolated (Sc 1568, factor 0.62).

**O₂ solubility (for the saturation term)**
- Garcia & Gordon 1992 ("garcia-benson" fit), converted from mL/L to mg/L with ×1.42905 (USGS memo 2011.03), with a barometric-pressure correction ([`o2.at.sat.R`](https://raw.githubusercontent.com/GLEON/LakeMetabolizer/master/R/o2.at.sat.R), code).
- At 129 m elevation (arithmetic):

| T (°C) | 0 | 4 | 10 | 15 | 18 | 20 | 22 | 24 | 26 |
|---|---|---|---|---|---|---|---|---|---|
| Real saturation (mg/L) | 14.40 | 12.91 | 11.11 | 9.93 | 9.32 | 8.95 | 8.61 | 8.29 | 7.98 |
| Sim `9.5·clamp(1 − 0.02·(T−18), 0.5, 1.4)` | 12.92 | 12.16 | 11.02 | 10.07 | 9.50 | 9.12 | 8.74 | 8.36 | 7.98 |
| Sim / real | 90 % | 94 % | 99 % | 101 % | 102 % | 102 % | 102 % | 101 % | 100 % |

**Under ice**
- With full ice cover, air–water exchange is effectively zero. That is my reasoning, not a measurement; the sim already seals the surface.
- Winter O₂ is then set by demand alone. Under-ice depletion in shallow lakes runs 0.2–0.39 g m⁻² d⁻¹ (in `shallow_lake_3d_physics.md`, via Schwefel et al. 2023).
- Partial ice and shore moats should scale k by the open fraction. That is my inference; I found no numbers for it.

### Inference: what k does to saturation
At steady state, the % saturation = 1 − (net O₂ demand)/(kO₂·C_sat). Here C_sat = 8.61 mg/L at 22 °C and 129 m (arithmetic):

| kO₂ (m/d) | Net demand 0.25 g m⁻² d⁻¹ | 0.5 | 1.0 | 1.5 | 2.25 |
|---|---|---|---|---|---|
| 0.5 | 94 % | 88 % | 77 % | 65 % | **48 %** |
| 1.0 | 97 % | 94 % | 88 % | 83 % | 74 % |
| 1.5 | 98 % | 96 % | 92 % | 88 % | 83 % |
| 2.0 | 99 % | 97 % | 94 % | 91 % | 87 % |
| 3.0 | 99 % | 98 % | 96 % | 94 % | 91 % |

- The sim's pair (k 0.5, demand 2.25) gives 48 %, which matches its observed 51–60 %.
- A lake at 95 % saturation with kO₂ 1–2 m/d is running a net demand of only **0.43–0.86 g m⁻² d⁻¹**. At 90 % it is 0.86–1.7.
- **The sim has both a k that is too low and a net demand that is too high.**

The column re-equilibrates in h/k ≈ 1.5 days at k = 2 m/d and ≈ 6 days at 0.5 m/d (Upper; arithmetic).

---

## 2. Whole-lake metabolism (GPP, R, NEP) of small temperate lakes in summer

### Takeaway
- **Volume:** in the mixed layer, summer GPP and R in oligo- to mesotrophic north-temperate lakes are both ~0.3–1 mg O₂ L⁻¹ d⁻¹.
- **Area:** pelagic GPP is ~0.1–2.7 g O₂ m⁻² d⁻¹, median ~0.8, in boreal lakes with DOC near 6 mg/L. Shallow clear lakes add a large benthic share.
- **Coupling:** R tracks GPP closely, so NEP is a small residual. In summer it is about −0.3 to +0.1 mg L⁻¹ d⁻¹. Lakes with DOC above ~4–6 mg/L lean heterotrophic.
- **Saturation and diel swing:** surface O₂ sits within roughly ±10 % of saturation, with a diel swing under 1 mg/L in open water. Dense weed beds are the exception (§5).

### Cited findings
**Levels**
- **GLEON lakes worldwide:** mean annual GPP and R ranged from **0.1 to 5.0 mg O₂ L⁻¹ d⁻¹**.
  - "Background" respiration (R not supported by same-day GPP) was **0.017–2.1 mg O₂ L⁻¹ d⁻¹**.
  - Daily GPP explained 5–85 % of daily R variation after temperature correction.
  - Mean annual GPP and R were related to TP but not to DOC.
  - Source: [Solomon et al. 2013, L&O 58:849](https://doi.org/10.4319/lo.2013.58.3.0849), abstract, Crossref.
- **Lake Sunapee, NH** (16.6 km², mean 11.2 m, oligotrophic, chl 1.3 µg/L, DOC < 2.5 mg/L; DO sonde at 1 m, May–Oct 2008–2013; [Richardson et al. 2017, Aquat. Sci. 79:319](https://link.springer.com/article/10.1007/s00027-016-0499-7), full text):

  | Measure | Value (mg O₂ L⁻¹ d⁻¹ unless stated) |
  |---|---|
  | Annual median GPP | 0.38–0.90 |
  | Annual mean R | 0.26–1.05 |
  | Annual median NEP | +0.12 to −0.06 |
  | Daily NEP | −0.99 to +0.91 |
  | Days with NEP < 0 | 34 % |
  | R₂₀ | 1.06·GPP₂₀ − 0.11 (R² 0.85) |
  | Diel DO swing | "generally below 1 mg L−1" |
  | Surface O₂ | "at or near saturation at 1 m depth" |
  | Gas exchange used | Cole–Caraco k |

- **Seven NE North American lakes, 10 days before Tropical Storm Irene (late August 2011):** R = 1.1·GPP + 0.2 mg O₂ L⁻¹ d⁻¹ (r² 0.98).
  - Mixed-layer sondes at 0.5–2 m; Cole–Caraco k ([Klug et al. 2012, ES&T 46:11693](https://doi.org/10.1021/es302063v), full text, author copy at [hawksites.newpaltz.edu](https://bpb-us-w2.wpmucdn.com/hawksites.newpaltz.edu/dist/1/8098/files/2012/10/Klug2012-EST-HurricaneIrenePaper.pdf)).
  - Implied NEP = −0.1·GPP − 0.2, i.e. **−0.25 to −0.30 mg L⁻¹ d⁻¹** at GPP 0.5–1.0. Over 3.05 m that is −0.76 to −0.92 g m⁻² d⁻¹ (arithmetic).
- **Areal pelagic GPP in 75 boreal Norwegian lakes** (DOC 0.25–12.3, median 5.9 mg/L):
  - 45–993 mg C m⁻² d⁻¹, median 286, lowered by DOC shading (Thrane, Hessen & Andersen 2014, Ecosystems; full text, via `Maine lake shores and catchment/land_lake_subsidies.md`);
  - = 0.12–2.65, median 0.76 g O₂ m⁻² d⁻¹ (arithmetic).
- **Benthic share of primary production:**
  - from 5 to 80 % in lakes of intermediate TP, depending on morphometry and littoral habitat;
  - 80–98 % in shallow oligotrophic Greenland lakes;
  - nearly 0 % above TP 100 µg/L.
  - Source: [Vadeboncoeur et al. 2003, L&O 48:1408](https://doi.org/10.4319/lo.2003.48.4.1408), abstract, Crossref.
  - In a clear shallow Danish lake, epipelic algae made 77 % of annual production; total was 141 g C m⁻² yr⁻¹ ([Liboriussen & Jeppesen 2003, Freshw. Biol. 48:418](https://doi.org/10.1046/j.1365-2427.2003.01018.x), abstract, Crossref).
- **Bottle (plankton-only) measurements:**
  - In 12 oligo-mesotrophic Quebec Shield lakes the epilimnion had median P:R 1.7. R tracked photosynthesis, and DOC depressed both ([Carignan, Planas & Vis 2000, L&O 45:189](https://doi.org/10.4319/lo.2000.45.1.0189), abstract, Crossref).
  - In 20 southern Quebec lakes plankton R exceeded photosynthesis 2–8× in all oligo- and mesotrophic lakes. Excess R was 30–86 mg C m⁻³ d⁻¹, and the R-vs-P intercept was 27 mg C m⁻³ d⁻¹ ([del Giorgio & Peters 1994, L&O 39:772](https://doi.org/10.4319/lo.1994.39.4.0772), abstract, Crossref).
  - Those two studies disagree on the sign of NEP. Prairie et al. 2002 resolved it with DOC: net heterotrophic above DOC 4–6 mg/L, autotrophic below.

**Dependence on TP, DOC and colour**
- 25 Wisconsin–Michigan lakes ([Hanson et al. 2003, L&O 48:1112](https://doi.org/10.4319/lo.2003.48.3.1112), abstract, Crossref):
  - most lakes had negative NEP;
  - TP was linked to GPP, DOC to R;
  - at low DOC, GPP ≈ R, and the two diverged as DOC rose;
  - diel O₂ and CO₂ changed at a near 1:1 molar ratio.
  - The full text, with the fitted slopes, is Wiley-hosted and returned 403.
- 25 Danish lakes in summer: *all* had negative NEP ([Staehr et al. 2012, Aquat. Sci. 74:155](https://doi.org/10.1007/s00027-011-0207-6), abstract):
  - GPP and R rose with chlorophyll, DOC and TP, and fell with area and depth;
  - volumetric rates fell with lake size while areal rates stayed more constant;
  - depth + chl predicted GPP, and depth + DOC predicted R (57–63 % of the variance).
- **Summer net autotrophy in shallow lakes:**
  - In a nutrient-rich shallow Danish lake, summer (mid-May to mid-September) GPP:R was 1.10–1.14, the rest of the year 0.60–0.81, and the annual figure 1.01–1.04 ([Staehr & Sand-Jensen 2007, L&O 52:108](https://doi.org/10.4319/lo.2007.52.1.0108), abstract, Crossref).
  - In polymictic eutrophic Võrtsjärv (270 km², mean 2.8 m), GPP:R was above 1 from early spring to August–September and below it afterwards; the lake was CO₂-neutral over the year ([Laas et al. 2012, Hydrobiologia 694:57](https://doi.org/10.1007/s10750-012-1131-z), abstract).
- **Within-lake variation:** GPP and R varied 2.5–3.2-fold from site to site (up to 6–7-fold). About 40 % of epilimnetic GPP and R was benthic-littoral, and a single central sensor captured ~81 % of the lake-wide rates ([Van de Bogert et al. 2007, L&O Methods 5:145](https://doi.org/10.4319/lom.2007.5.145), abstract, Crossref).

**Saturation**
- About 75 % of 33 St. Lawrence Lowland lakes were O₂-undersaturated and CO₂-supersaturated in summer. Undersaturation grew with TP and TN (Prairie et al. 2002, abstract).
- Maine NLA lakes measured 86–102 % (Summary item 1).

### Inference: what this means for Hot Brook
With TP 8–15 µg/L, chl ~2–3.5 µg/L, DOC 4–6 mg/L and a lit bed over much of a 3-m-deep lake, I expect (my inference from the sources above):
- pelagic GPP ~0.3–1.5 g O₂ m⁻² d⁻¹;
- benthic GPP (periphyton, epipelon, plants) about as large again;
- R a little above GPP;
- **summer NEP about −0.9 to +0.3 g O₂ m⁻² d⁻¹, most likely −0.2 to −0.6**;
- surface O₂ at 88–100 % saturation, with an open-water diel swing of ~0.2–0.8 mg/L.

The two lakes sit right at Prairie's DOC 4–6 balance point. Upper's darker water (if colour ~45) should run a few points lower than Skitacook's.

---

## 3. Sediment oxygen demand (summer, 15–25 °C)

### Takeaway
- **Size at 20 °C:** SOD in shallow lakes runs ~0.15–1.5 g O₂ m⁻² d⁻¹, typically ~0.6.
- **Temperature:** it scales with θ ≈ 1.065–1.07 per °C (Q₁₀ ≈ 1.9–2.0), giving ~0.65–0.75 at 22–24 °C. Fresh summer deposition and deep organic muck push individual sites to ~1.5–2.
- **Controls:** it rises with vegetation and labile organic input, falls with depth and flow, and drops sharply when the near-bed water is still and O₂-depleted.
- **Measurement caveat:** dark-core SOD is a gross sink. On a lit bed, benthic algae offset part of it by day.

### Cited findings
- **USGS winter cores, Upper Mississippi backwater lakes** (12 lakes, Jan–Feb 2022; intact cores incubated 96 h at mean site temperature):
  - SOD was **0.04–0.44 g O₂ m⁻² d⁻¹** in situ and **0.14–1.46** corrected to 20 °C.
  - It was highest at vegetated low-flow sites; four of the five highest rates were vegetated.
  - It fell with water depth, flow, ice depth and sediment pH.
  - It had no significant relation to most sediment properties.
  - Sources: [USGS data release, Perner & Kreiling 2025](https://www.sciencebase.gov/catalog/item/67f0108bd4be02766d636802) (data and metadata); [Perner et al. 2025, River Res. Appl.](https://www.usgs.gov/publications/variation-and-controls-sediment-oxygen-demand-backwater-lakes-upper-mississippi-river) (abstract).
  - From the 36 rows: median in-situ SOD 0.175, median SOD₂₀ 0.59, mean SOD₂₀ 0.62 (arithmetic on the data).
  - Bottom water was 0–5 °C and sediment −0.3 to 4.8 °C. Organic (volatile) content was 1–14.5 %. (data)
  - **θ check (arithmetic):** SOD₂₀/SOD_in-situ is a near-constant 3.2–3.6. With θ = 1.065 that is a 19-°C correction from about 1 °C, consistent with the chamber temperatures. θ = 1.08 would imply ~4.4 °C and θ = 1.047 would imply −6 °C. USGS does not state its θ.
- **Under-ice depletion** in shallow Arctic lakes was 0.2–0.39 g m⁻² d⁻¹ (via `shallow_lake_3d_physics.md`, Schwefel et al. 2023). Scaled from 2–4 °C to 22 °C with θ 1.065, that is ~0.6–1.4 (arithmetic).
- **Eutrophic Lake Mendota** (deep, stratified; GLM-AED2 model):
  - the maximum SOD parameter was 100 mmol m⁻² d⁻¹ (3.2 g), temperature-scaled to an effective 1–1.5 g m⁻² d⁻¹ in summer;
  - total hypolimnetic depletion was ~1 g m⁻² d⁻¹, and a volumetric sink of 0.16 g m⁻³ d⁻¹;
  - "most studies" use 1–4 g m⁻² d⁻¹ for SOD;
  - a deductive fit gave an areal sink of 0.04 g m⁻² d⁻¹, against a Rippey & McSorley mean of ~0.08.
  - Source: [Ladwig et al. 2021, HESS 25:1009](https://hess.copernicus.org/articles/25/1009/2021/), full text. Their Arrhenius θ value is in the supplement, which I did not reach.
- **Near-bed physics controls the flux** ([Bryant et al. 2010, L&O 55:950](https://doi.org/10.4319/lo.2010.55.2.0950), abstract, Crossref; a mesotrophic lake, 12-h study):
  - Sediment O₂ uptake fell from 7.0 to 1.1 mmol m⁻² d⁻¹ (0.22 → 0.035 g, arithmetic) within hours as turbulence dropped (ε from 1.2×10⁻⁸ to 7.8×10⁻¹² W kg⁻¹).
  - The diffusive boundary layer was 1.0 mm before the shift, and the oxic sediment layer thinned from 2.2 to 0.3 mm.
- **Depth and littoral pattern** ([den Heyer & Kalff 1998, L&O 43:695](https://doi.org/10.4319/lo.1998.43.4.0695), abstract, Crossref; 9 Quebec lakes):
  - sediment mineralisation in the littoral averaged **3× the profundal**;
  - site depth explained 60 % of the variation in mean summer rates, depth standing in for temperature, substrate quality and supply;
  - the littoral produced 54–100 % of the sediments' DIC + CH₄.
- **Supply scaling:** sediment O₂ uptake correlates positively with primary production and inversely with mixed-layer depth; deposition goes as carbon input over mixed depth ([Hargrave 1973, JFRB 30:1317](https://doi.org/10.1139/f73-212), abstract, qualitative).
- **Model defaults** (PCLake, [FABM-PCLake `fabm-pclake.yaml`](https://raw.githubusercontent.com/fenjuan/pclaketestsrc/master/testcases/fabm-pclake.yaml)):
  - sediment detritus mineralisation 0.002 d⁻¹ with θ 1.07;
  - refractory fraction 0.15;
  - O₂ diffusion into the bed 2.6×10⁻⁵ m² d⁻¹, with θ 1.02 and a bioturbation factor of 5;
  - water-column detritus mineralisation 0.01 d⁻¹ with θ 1.07.
- **Temperature sensitivity in general:** relative to 15 °C, ecosystem R doubles with ~7.6 °C of warming and GPP needs ~14.8 °C ([Wikipedia, "Lake metabolism"](https://en.wikipedia.org/wiki/Lake_metabolism), summarising Yvon-Durocher et al. 2012, Nature 487:472). That is Q₁₀ ≈ 2.5 for R (θ ≈ 1.095) and 1.6 for GPP (arithmetic).
- **Sediment mineralisation rises with temperature** across boreal and other lakes, so burial falls with warming ([Gudasz et al. 2010, Nature 466:478](https://doi.org/10.1038/nature09186), abstract; no Q₁₀ in the abstract).

### Inference
Over 15–25 °C, a θ of 1.065–1.07 for SOD is well supported (USGS arithmetic, PCLake). With it, ~0.6 g m⁻² d⁻¹ at 20 °C becomes ~0.66 at 22 °C and ~0.75 at 24 °C.

The deep north basin's organic muck can sit at 1–2. Sandy or rocky shallows should be lower, but vegetated shallows are *higher* (USGS, den Heyer).

A lake-area mean of ~0.7–1.0 g m⁻² d⁻¹ in July–August is my best estimate for Hot Brook (inference). The sim's 1.36 ("sediment + particle demand" together) is about 1.4–2× that.

---

## 4. Water-column respiration and the sediment-vs-water split

### Takeaway
- **Plankton (water-column) respiration** in summer oligo- to mesotrophic lakes is ~0.1–0.5 mg O₂ L⁻¹ d⁻¹, about 0.3–1.5 g m⁻² d⁻¹ over 3 m.
- **The bulk terrestrial DOC pool respires slowly**: ~0.01 mg O₂ L⁻¹ d⁻¹ at 5 mg/L. Most bacterial respiration runs on the small labile pool of algal exudates and fresh DOM.
- **Split:** in shallow lakes, the sediments and the littoral carry roughly 40–50 % of total respiration.

### Cited findings
- **Plankton R from bottles:**
  - del Giorgio & Peters 1994: the R-vs-P intercept was 27 mg C m⁻³ d⁻¹ (**0.072 mg O₂ L⁻¹ d⁻¹**), and excess R 30–86 mg C m⁻³ d⁻¹ (**0.08–0.23 mg O₂ L⁻¹ d⁻¹**). Pelagic CO₂ production was 11–60 mmol m⁻² d⁻¹ (0.35–1.9 g O₂ m⁻² d⁻¹ at RQ 1). (abstract; conversions are arithmetic)
  - Their epilimnetic photosynthesis was 8–377 mg C m⁻³ d⁻¹ (0.02–1.0 mg O₂ L⁻¹ d⁻¹, arithmetic).
- **Bacteria** were ~10–90 % of total plankton respiration, the most in the most oligotrophic water. Bacterial growth efficiency was 4–40 %, lowest in oligotrophic systems (small Minnesota lakes and Lake Superior; [Biddanda, Ogdahl & Cotner 2001, L&O 46:730](https://doi.org/10.4319/lo.2001.46.3.0730), abstract, Crossref).
- **Bulk organic-carbon decay:**
  - across inland waters, decay rate falls with water retention time; the mean OC half-life is **2.5 ± 4.7 years** ([Catalán et al. 2016, Nat. Geosci. 9:501](https://doi.org/10.1038/ngeo2720), abstract);
  - that is k ≈ 7.6×10⁻⁴ d⁻¹, which for DOC 5 mg/L gives ~0.010 mg O₂ L⁻¹ d⁻¹ (~0.03 g m⁻² d⁻¹ over 3 m) (arithmetic);
  - the scatter is large, and short-residence lakes decay faster.
- **Sediment vs water split:**
  - ~40 % of epilimnetic GPP and R was benthic-littoral in Wisconsin lakes (Van de Bogert et al. 2007, abstract).
  - In Grasmere's hypolimnion, sediment and water column contributed "approximately equal" O₂ consumption (Hall & Jeffries 1984, below, abstract).
  - In stratified Quebec lakes, littoral sediments were under 20 % of the summed metabolism of the epilimnetic water and its sediments (den Heyer & Kalff 1998, abstract).
  - PCLake mineralises water-column detritus at 0.01 d⁻¹ against 0.002 d⁻¹ in the sediment, both θ 1.07, with an O₂ half-saturation for BOD of 1.0 mg/L (model default).
- Pace & Prairie's review chapter ("Respiration in lakes", 2005) is the standard synthesis. Its abstract only gives the global total (62–76 Tmol C yr⁻¹ respired in lakes, above lake GPP) and names trophic state as the main control, then temperature and DOC load ([Oxford Academic](https://academic.oup.com/book/34858/chapter/298130616), abstract).

### Inference
- **DOM respiration:** the sim's −0.68 g m⁻² d⁻¹ (≈ 0.22 mg L⁻¹ d⁻¹) is inside the plankton-R range. But it is *only* the DOM path. Algal respiration (inside "algae net"), particle demand and zooplankton come on top. If the sim's DOM pool includes refractory terrestrial DOC, its decay is far too fast for that part (inference).
- **Split:** the sim puts 59 % of its heterotrophic sink in the sediment + particle term (1.36 of 2.31). That is within the 40–60 % that shallow lakes support, so the *split* is fine. The *total* is high.

---

## 5. Macrophyte beds: net O₂ and diel swing

### Takeaway
- **In dense beds:** gross O₂ production is large, up to ~3 g O₂ m⁻² h⁻¹ at light saturation in the densest canopies. Respiration is also large, and night R falls through the night.
- **Day/night pattern:** beds supersaturate by day (up to ~2×) and can go hypoxic by dawn, especially where the canopy stratifies the water.
- **Whole lake:** on a whole-lake, whole-season basis submerged plants are a **small net source**, of order +0.1–0.3 g O₂ m⁻² d⁻¹ of lake area. They are never a net sink in summer.

### Cited findings
- **Upper limit for a canopy:** across 190 photosynthesis–irradiance experiments on macrophyte communities, gross production at 100 % light absorption reached at most **26.3 µmol O₂ m⁻² s⁻¹** (= 3.0 g O₂ m⁻² h⁻¹, arithmetic). It showed no saturation even at ~2,000 µmol photons m⁻² s⁻¹. Communities had much higher respiration and light-compensation points than single shoots ([Binzer, Sand-Jensen & Middelboe 2006, L&O 51:2722](https://doi.org/10.4319/lo.2006.51.6.2722), abstract, Crossref).
- **Whole-lake shares** ([Blindow et al. 2006, L&O 51:2711](https://doi.org/10.4319/lo.2006.51.6.2711), abstract, Crossref):
  - In clear-water Krankesjön (chl 10 µg/L), May–September NPP was phytoplankton 90–130, submerged macrophytes **14** and epiphyton 1.2 g C m⁻².
  - As daily lake-area means: +1.6–2.3, **+0.24** and +0.02 g O₂ m⁻² d⁻¹ (arithmetic, 153 days).
  - In turbid Börringesjön, phytoplankton NPP was −40 to +25 g C m⁻²: net respiration in a hypertrophic lake.
- **Respiration through the night:** in a macrophyte-rich shallow lake, ecosystem respiration declined during the night to 24–70 % of the sunset rate. Afternoon production was strongly depressed ([Kragh, Andersen & Sand-Jensen 2017, Oecologia 185:157](https://doi.org/10.1007/s00442-017-3931-3), abstract).
- **Diel extremes** (already in `macrophytes.md`):
  - In 0.24–0.41-m *Chara* ponds (319–813 g DW m⁻²), surface O₂ ran from 12–25 % saturation at sunrise to 205–235 % in early afternoon ([Andersen, Kragh & Sand-Jensen 2017, PMC5597838](https://pmc.ncbi.nlm.nih.gov/articles/PMC5597838/), full text).
  - Day surface was 143–176 % and day bottom 0.1–0.7 %; at night the surface was 34–58 % and the bottom 8–21 %. The bottom went anoxic around midday under 6–14 °C of daytime stratification.
- **Canopy stratification and bottom O₂ in Lake Monger** ([Vilas et al. 2017, PMC5727088](https://pmc.ncbi.nlm.nih.gov/articles/PMC5727088/), full text):
  - Bottom O₂ in the bed centre swung from ~18 mg/L by day to ~6 mg/L at night when unstratified.
  - Under a taller canopy it went fully anoxic at night.
  - The water stratified 7.7–12.3 h/day once the canopy reached half the depth; biomass was 459 g DW m⁻².
- **Model plant O₂** (PCLake, model default; already in `macrophytes.md`): 1.07 g O₂ per g DW produced; dark respiration 0.02 d⁻¹ at 20 °C with Q₁₀ 2.

### Inference
Per m² *of bed* in July, a moderately dense Hot Brook bed would show (inference):
- biomass ~100–300 g DW m⁻² (from `macrophytes.md`);
- R ≈ 2–6 g O₂ m⁻² d⁻¹ (PCLake 0.021 g g⁻¹ d⁻¹, arithmetic);
- gross production of the same order or more on sunny days.

That gives positive daily NEP on clear days and negative NEP on dull ones. Spread over ~35 % of the bed, the lake-area mean should be **≈ 0 to +0.3 g O₂ m⁻² d⁻¹**, against Krankesjön's +0.24. **The sim's −0.4 is outside every source**, consistent with the known bug.

---

## 6. Nitrification O₂ demand

### Takeaway
Full nitrification uses 4.57 g O₂ per g NH₄-N. In a mesotrophic lake it used **15–20 % of total O₂ depletion**. The sim's 0.27 g O₂ m⁻² d⁻¹ is 12 % of its sinks, so the share is plausible.

In absolute terms, 0.27 means nitrifying 59 mg N m⁻² d⁻¹, about **54–116 % of all the N its own SOD and DOM terms mineralise** (arithmetic). That is high for a low-N lake where plants and algae compete for NH₄. Expect ~0.1–0.2 g m⁻² d⁻¹ once the other sinks are corrected (inference).

### Cited findings
- **Stoichiometry:** 2 NH₄⁺ + 3 O₂ → 2 NO₂⁻ + …, then 2 NO₂⁻ + O₂ → 2 NO₃⁻ ([Wikipedia, "Nitrification"](https://en.wikipedia.org/wiki/Nitrification)). That makes 2 mol O₂ per mol N = **4.57 g O₂ g⁻¹ N** (arithmetic). PCLake uses the same 2 mol O₂ per mol NH₄⁺ (model default).
- **Grasmere** (mesotrophic, English Lake District): nitrification in the hypolimnetic water and the top 1 cm of profundal sediment "accounted for 15–20 % of the total oxygen depletion", with sediment and water column roughly equal ([Hall & Jeffries 1984, Microb. Ecol. 10:37](https://doi.org/10.1007/BF02011593), abstract).
- **Lake Superior** (oligotrophic): water-column ammonium oxidation averaged **18–34 nmol N L⁻¹ d⁻¹**, "two orders of magnitude" below rates reported from other lakes ([Small et al. 2013, L&O 58:276](https://doi.org/10.4319/lo.2013.58.1.0276), abstract, Crossref).
  - That is 1.2–2.2 µg O₂ L⁻¹ d⁻¹.
  - 100× that is 0.12–0.22 mg O₂ L⁻¹ d⁻¹ (arithmetic), likely eutrophic lakes.
- **O₂ control:** nitrification rose steeply with overlying O₂ from 0 to 100 % of air saturation and little beyond. Above ~100 %, coupled nitrification supplied most of the nitrate for denitrification ([Rysgaard et al. 1994, L&O 39:1643](https://doi.org/10.4319/lo.1994.39.7.1643), abstract, Crossref).
- **PCLake** (model default):
  - water nitrification 0.1 d⁻¹ and sediment 1.0 d⁻¹;
  - θ 1.08;
  - O₂ half-saturation 2.0 mg/L.

  The sim's `NITRIF_O2_HALF` 0.30 × `O2_MGL` 9.5 = 2.85 mg/L is close to PCLake's 2.0 (arithmetic).

### Arithmetic: is 0.27 g O₂ m⁻² d⁻¹ plausible?
- 0.27 g O₂ is 0.059 g N m⁻² d⁻¹ nitrified, i.e. 19 µg N L⁻¹ d⁻¹ over 3.05 m.
- The sim's SOD 1.36 g O₂ mineralises 0.51 g C, which releases 0.051–0.073 g N at C:N 10–7 by mass.
- Its DOM term (0.68 g O₂) releases another 0.026–0.036 g N.
- Total NH₄ released is 0.077–0.109 g N m⁻² d⁻¹. Nitrification therefore takes 54–77 % of all regenerated N.
- If SOD falls to ~0.8 and the DOM term to ~0.4, the same fraction gives ~0.15 g O₂ m⁻² d⁻¹, about 10–20 % of the corrected sinks. That matches Grasmere.

---

## 7. Measured O₂ in small Maine, New England and boreal lakes 3–6 m deep

### Takeaway
- **Typical summer state:** the measured shallow Maine lakes are mixed and near saturation top to bottom. The darker, smaller one (Webster, DOC 6.8) runs ~10–14 % below.
- **Calm spells:** short calm-weather stratification is expected in polymictic lakes. It is documented to cut bottom O₂, but I found no Maine-specific frequency.
- **Weed beds:** they are the places that really go hypoxic overnight.

### Cited findings
- **EPA NLA profiles near Hot Brook** (via `Hot Brook populations and water/recent_maine_research.md`; percentages are my arithmetic, Garcia–Benson solubility, assuming 100–150 m elevation, ±2 points):
  - Skitacook Lake (5.2 m): 9 Aug 2017, 22.4 → 22.2 °C, O₂ 8.2–8.3 mg/L at every depth (**97 %**); 4 Sep 2012, 20.9 → 20.5 °C, 8.9–9.1 mg/L (**102 %**).
  - Webster Pond (16 ha, ~2.5 m, DOC 6.8, TP 13): 17 Aug 2012, 23.5 → 22.8 °C, 7.45 → 7.3 mg/L (**89 → 86 %**).
- **Lake Sunapee, NH (deep):** "at or near saturation at 1 m". The diel swing was below 1 mg/L, and the epilimnion–hypolimnion difference was ~1 mg/L (Richardson et al. 2017, full text).
- **Maine volunteer guidance:** in shallow lakes stratification "may be brief", appearing during "warm, calm periods", and "chronic stress from stratification" is the main threat ([Lake Stewards of Maine, indicators](https://www.lakestewardsofmaine.org/volunteer-programs-tools/water-quality-monitoring/understanding-water-quality-indicators/), page text; no numbers).
- **Polymictic Müggelsee (Germany):** over 4 years of hourly profiles, two heatwave summers produced stratification events lasting "about 1 week to 2 months". Hypolimnetic O₂ "strongly decreased" and SRP rose ([Wilhelm & Adrian 2008, Freshw. Biol. 53:226](https://doi.org/10.1111/j.1365-2427.2007.01887.x), abstract, Crossref).
- **Small boreal lake:** Kuivajärvi (64 ha, 13 m max) stratifies in summer, and its k₆₀₀ was nearly wind-independent below 6 m/s (Heiskanen et al. 2014, full text). It is deeper than Hot Brook, so it is a gas-exchange analogue only.
- **Weed-bed and pond extremes:** §5 (Andersen et al. 2017; Vilas et al. 2017).

### Gaps
- No measured diel O₂ curve or season-long bottom-O₂ record was found for a 3–6-m Maine or New England lake.
- No count was found of how often such lakes go hypoxic at the bed in calm spells.
- Hot Brook itself has no DEP sampling station (`hot_brook_lake_records.md`).

---

## Benchmark vs the simulation's current values

| Quantity | Real-lake benchmark | Source tag | Sim now | Verdict |
|---|---|---|---|---|
| Summer lake-mean O₂ (% sat) | 86–102 % (Maine NLA); most temperate lakes slightly under 100 % | data/abstract; arithmetic | 51–60 % | **far too low** |
| kO₂, calm floor | k₆₀₀ 0.50 (Cole–Caraco) – 0.60 (Vachon–Prairie) m/d; convective nights 0.3–0.9 | code; arithmetic | 0.5 (all day) | OK only as a floor |
| kO₂ at typical summer wind (U₁₀ 2.5–4 m/s), 3-km² lake | 1.6–2.2 m/d k₆₀₀ (≈1.8–2.5 for O₂ at 22 °C); measured 64-ha lake mean 1.25–1.44 | arithmetic; full text | 0.5 | **3–5× too low** |
| kO₂ in storms (U₁₀ 6.5–10) | 3.2–4.7 m/d k₆₀₀ (V–P); C–W 3.4–8.7 | arithmetic | (weather states) | check |
| Summer NEP, whole lake | −0.9 to +0.3 g O₂ m⁻² d⁻¹ (−0.3 to +0.1 mg/L/d); likely −0.2 to −0.6 | full text; abstract; inference | −2.3 (sum of terms) | **too heterotrophic** |
| Pelagic GPP (areal) | 0.12–2.65, median 0.76 g O₂ m⁻² d⁻¹ (boreal, DOC median 5.9) | full text (via note); arithmetic | algae *net* +0.4 | not directly comparable; plausible net |
| Volumetric GPP / R in mixed layer | 0.4–0.9 / 0.3–1.05 mg O₂ L⁻¹ d⁻¹ (Sunapee) | full text | — | — |
| Benthic share of primary production | 5–80 % (intermediate TP); 77 % epipelon in a clear shallow lake | abstract | ~0 (no benthic algae term?) | **missing source term** |
| SOD at 20 °C | 0.14–1.46, median 0.59 g m⁻² d⁻¹ | data | — | — |
| SOD at 22–24 °C, lake mean | ~0.7–1.0 (sites up to ~2) g m⁻² d⁻¹ | arithmetic; inference | 1.36 (SOD + particles) | **~1.4–2× high** |
| SOD θ / Q₁₀ | θ 1.065–1.07 (Q₁₀ 1.9–2.0) | arithmetic; model default | (Q10 "about 12 °C" in `ENV.O2_SED`) | check value |
| Pelagic R | 0.1–0.5 mg O₂ L⁻¹ d⁻¹ (0.3–1.5 g m⁻² d⁻¹ over 3 m); bulk DOC alone ~0.01 mg/L/d | abstract; arithmetic | DOM −0.68 g m⁻² d⁻¹ (0.22 mg/L/d) + others | DOM alone OK-high |
| Sediment share of R | ~40–50 % in shallow / littoral settings | abstract | 59 % of sinks | OK |
| Nitrification share of O₂ demand | 15–20 % (mesotrophic Grasmere) | abstract | 12 % | OK |
| Nitrification absolute | ~0.1–0.2 g O₂ m⁻² d⁻¹ after other sinks are corrected | inference | 0.27 | slightly high |
| Macrophytes, lake-area net (growing season) | +0.24 g O₂ m⁻² d⁻¹ (Krankesjön); ≈ 0 to +0.3 | abstract; arithmetic | −0.4 | **wrong sign (bug)** |
| Night R in plant beds | falls to 24–70 % of the sunset rate | abstract | constant? | add |
| Open-water diel O₂ swing | < 1 mg/L | full text | ? | check |
| Weed-bed diel swing | 12–25 % → 205–235 % sat (dense *Chara*); 18 → 6 mg/L or anoxic at night (Monger) | full text | — | keep as target |
| Saturation curve, 10–26 °C | Garcia–Benson | code; arithmetic | within ±2 % | OK |
| Saturation curve, 0–4 °C | 14.4–12.9 mg/L at 129 m | arithmetic | 12.9–12.2 (−6 to −10 %) | **too low in winter** |
| Under-ice k | ≈ 0 (scale by open fraction for moats/leads) | reasoning | sealed | OK |

---

## Implications: what to change and to what range

1. **Replace the weather-state aeration with a lake-size wind law plus a convection floor.**
   - Wind: k₆₀₀ = 2.51 + 1.48·U₁₀ + 0.39·U₁₀·log₁₀(A_km²) cm/h (Vachon & Prairie 2013), with A = 3.6 for Upper and 2.77 for Lower.
   - Take the larger of that and a convective k₆₀₀ for net surface heat loss: 0.5·(0.77·|β|·ν)^¼·600^−½, i.e. ~0.55–0.95 m/d for 25–200 W/m² (Tedford form, §1).
   - Convert with (Sc_O₂/600)^−0.5 (Raymond 2012 polynomial).
   - **Targets:** summer daily-mean kO₂ ~1.5–2.5 m/d, calm nights ~0.6–0.9, storms 3.5–5, zero under full ice.
   - The connecting brook is a stream and needs a stream reaeration law, not this one (my note).
2. **Check that vertical mixing is not the bottleneck before raising k.**
   - Real shallow Maine lakes are within 0.1–0.3 mg/L top to bottom on summer days (Skitacook, Webster).
   - If the sim's 0.3-m surface cell sits near saturation while the column mean is ~55 %, the limit is the surface-row coupling (`AERATE_ROW1` and the vertical diffusivity), not k.
   - Diagnose by logging the surface-cell vs column-mean O₂ on a windy afternoon.
3. **Fix the macrophyte sign.** Target a summer lake-area net of **0 to +0.3 g O₂ m⁻² d⁻¹**: positive on sunny days, negative on dull ones.
   - Let bed respiration decay through the night to ~25–70 % of its dusk rate (Kragh et al. 2017).
   - Keep the in-bed extremes (supersaturated afternoons, hypoxic dawns under canopies that reach the surface).
4. **Add benthic microalgal production on lit sediments.** Secchi 3–4 m in a lake with a 3-m mean depth means much of the bed is lit.
   - Benthic GPP should be of the same order as pelagic GPP (5–80 % of the total; 77 % in a clear shallow lake), and should partly offset SOD by day.
   - This is the biggest *missing* source in the budget.
5. **Lower the sediment + particle demand.**
   - Target ~0.7–1.0 g O₂ m⁻² d⁻¹ lake-mean at 22–24 °C: ~0.6 at 20 °C reference, θ = 1.065–1.07.
   - Allow 1.5–2 in the deep north basin's muck and in vegetated shallows.
   - Keep the O₂ dependence (flux collapses when near-bed water stills and depletes; Bryant 2010).
   - The current ramp from 0.15× at the surface to full at depth under-weights vegetated shallows: USGS, and den Heyer & Kalff's littoral 3× profundal. Consider a vegetation/detritus term rather than depth alone.
6. **Keep DOM respiration at or below ~0.2 mg O₂ L⁻¹ d⁻¹ (≤ 0.6 g m⁻² d⁻¹).**
   - Total plankton R (DOM + algal + particle) should stay within 0.1–0.5 mg L⁻¹ d⁻¹ in summer.
   - If the DOM pool stands in for the lake's 4–6 mg/L of tea-coloured DOC, split off a refractory fraction that decays at ~10⁻³ d⁻¹ (half-life ~2.5 yr, Catalán 2016). Only the labile algal fraction should turn over in days.
7. **Nitrification:** keep the share at 10–20 % of total O₂ demand. That gives ~0.1–0.2 g O₂ m⁻² d⁻¹ after steps 4–6. Use θ ≈ 1.08 and an O₂ half-saturation of ~2 mg/L (PCLake); the sim's current 2.85 mg/L is fine.
8. **Calibration targets for June–August with no fish:**
   - lake-mean O₂ **88–100 %** of saturation;
   - net summer NEP **−0.2 to −0.6 g m⁻² d⁻¹**;
   - re-aeration flux = −NEP ≈ 0.2–0.9 g m⁻² d⁻¹, not 2.25;
   - open-water diel swing 0.2–0.8 mg/L;
   - bottom within ~0.3 mg/L of the surface on windy days;
   - deeper bottom-water drawdown only in multi-day calm, hot spells (Müggelsee-type events, scaled down).
   - Judge on ≥3 seeds and real 24-h days, as for other balance changes.
9. **Fix the winter saturation curve.**
   - Replace the linear `sat(T)` with Garcia–Benson (or a quadratic fit to it): 14.4 mg/L at 0 °C and 129 m, against the current 12.9.
   - That restores ~1–1.5 mg/L of winter headroom, which matters for winterkill margins and ice-angling realism.

---

## Gaps (for a follow-up with search)
- **Full texts not reached:**
  - MacIntyre et al. 2010: the heating/cooling k₆₀₀–U₁₀ regressions;
  - Hanson et al. 2003: the fitted GPP, R and NEP against TP and DOC;
  - den Heyer & Kalff 1998: the absolute rates and their temperature response;
  - Pace & Prairie 2005: the sediment vs plankton R shares.
- **Missing measurements:**
  - a direct *summer* in-situ SOD measurement from a small mesotrophic north-temperate lake;
  - a measured diel O₂ series from a 3–6-m Maine or New England polymictic lake, and the frequency of bed hypoxia during calm spells;
  - nitrification rates (mg N m⁻² d⁻¹) in sediments of oligo-mesotrophic softwater lakes.

## Sources
- GLEON LakeMetabolizer source: [k.cole](https://raw.githubusercontent.com/GLEON/LakeMetabolizer/master/R/k.cole.R), [k.crusius](https://raw.githubusercontent.com/GLEON/LakeMetabolizer/master/R/k.crusius.R), [k.vachon](https://raw.githubusercontent.com/GLEON/LakeMetabolizer/master/R/k.vachon.R), [k.read](https://raw.githubusercontent.com/GLEON/LakeMetabolizer/master/R/k.read.R), [k.macIntyre](https://raw.githubusercontent.com/GLEON/LakeMetabolizer/master/R/k.macIntyre.R), [getSchmidt](https://raw.githubusercontent.com/GLEON/LakeMetabolizer/master/R/getSchmidt.R), [k600.2.kGAS](https://raw.githubusercontent.com/GLEON/LakeMetabolizer/master/R/k600.2.kGAS.R), [o2.at.sat](https://raw.githubusercontent.com/GLEON/LakeMetabolizer/master/R/o2.at.sat.R)
- Cole & Caraco 1998, L&O 43:647 — https://doi.org/10.4319/lo.1998.43.4.0647
- Vachon & Prairie 2013, CJFAS 70:1757 — https://doi.org/10.1139/cjfas-2013-0241
- Klaus & Vachon 2020, Aquat. Sci. 82:53 — https://link.springer.com/article/10.1007/s00027-020-00729-9
- Heiskanen et al. 2014, Tellus B 66:22827 — https://doi.org/10.3402/tellusb.v66.22827
- Erkkilä et al. 2018, Biogeosciences 15:429 — https://bg.copernicus.org/articles/15/429/2018/
- Read et al. 2012, GRL 39:L09405 — https://doi.org/10.1029/2012GL051886
- MacIntyre et al. 2010, GRL 37:L24604 — https://doi.org/10.1029/2010GL044164
- Holgerson, Zappa & Raymond 2016, GRL 43:8044 — https://doi.org/10.1002/2016GL070206
- Solomon et al. 2013, L&O 58:849 — https://doi.org/10.4319/lo.2013.58.3.0849
- Hanson et al. 2003, L&O 48:1112 — https://doi.org/10.4319/lo.2003.48.3.1112
- Prairie, Bird & Cole 2002, L&O 47:316 — https://doi.org/10.4319/lo.2002.47.1.0316
- Carignan, Planas & Vis 2000, L&O 45:189 — https://doi.org/10.4319/lo.2000.45.1.0189
- del Giorgio & Peters 1994, L&O 39:772 — https://doi.org/10.4319/lo.1994.39.4.0772
- Richardson et al. 2017, Aquat. Sci. 79:319 — https://link.springer.com/article/10.1007/s00027-016-0499-7
- Klug et al. 2012, ES&T 46:11693 — https://doi.org/10.1021/es302063v
- Staehr et al. 2012, Aquat. Sci. 74:155 — https://doi.org/10.1007/s00027-011-0207-6
- Staehr & Sand-Jensen 2007, L&O 52:108 — https://doi.org/10.4319/lo.2007.52.1.0108
- Laas et al. 2012, Hydrobiologia 694:57 — https://doi.org/10.1007/s10750-012-1131-z
- Van de Bogert et al. 2007, L&O Methods 5:145 — https://doi.org/10.4319/lom.2007.5.145
- Vadeboncoeur et al. 2003, L&O 48:1408 — https://doi.org/10.4319/lo.2003.48.4.1408
- Liboriussen & Jeppesen 2003, Freshw. Biol. 48:418 — https://doi.org/10.1046/j.1365-2427.2003.01018.x
- Perner & Kreiling 2025, USGS data release (winter SOD) — https://www.sciencebase.gov/catalog/item/67f0108bd4be02766d636802 ; Perner et al. 2025 — https://www.usgs.gov/publications/variation-and-controls-sediment-oxygen-demand-backwater-lakes-upper-mississippi-river
- Ladwig et al. 2021, HESS 25:1009 — https://hess.copernicus.org/articles/25/1009/2021/
- Bryant et al. 2010, L&O 55:950 — https://doi.org/10.4319/lo.2010.55.2.0950
- den Heyer & Kalff 1998, L&O 43:695 — https://doi.org/10.4319/lo.1998.43.4.0695
- Hargrave 1973, JFRB 30:1317 — https://doi.org/10.1139/f73-212
- Gudasz et al. 2010, Nature 466:478 — https://doi.org/10.1038/nature09186
- Catalán et al. 2016, Nat. Geosci. 9:501 — https://doi.org/10.1038/ngeo2720
- Biddanda, Ogdahl & Cotner 2001, L&O 46:730 — https://doi.org/10.4319/lo.2001.46.3.0730
- Pace & Prairie 2005, "Respiration in lakes" — https://academic.oup.com/book/34858/chapter/298130616
- Binzer, Sand-Jensen & Middelboe 2006, L&O 51:2722 — https://doi.org/10.4319/lo.2006.51.6.2722
- Blindow et al. 2006, L&O 51:2711 — https://doi.org/10.4319/lo.2006.51.6.2711
- Kragh, Andersen & Sand-Jensen 2017, Oecologia 185:157 — https://doi.org/10.1007/s00442-017-3931-3
- Andersen, Kragh & Sand-Jensen 2017, Proc. R. Soc. B — https://pmc.ncbi.nlm.nih.gov/articles/PMC5597838/
- Vilas et al. 2017 — https://pmc.ncbi.nlm.nih.gov/articles/PMC5727088/
- Hall & Jeffries 1984, Microb. Ecol. 10:37 — https://doi.org/10.1007/BF02011593
- Small et al. 2013, L&O 58:276 — https://doi.org/10.4319/lo.2013.58.1.0276
- Rysgaard et al. 1994, L&O 39:1643 — https://doi.org/10.4319/lo.1994.39.7.1643
- Wilhelm & Adrian 2008, Freshw. Biol. 53:226 — https://doi.org/10.1111/j.1365-2427.2007.01887.x
- FABM-PCLake parameters — https://raw.githubusercontent.com/fenjuan/pclaketestsrc/master/testcases/fabm-pclake.yaml
- Wikipedia, "Lake metabolism" — https://en.wikipedia.org/wiki/Lake_metabolism ; "Nitrification" — https://en.wikipedia.org/wiki/Nitrification
- Lake Stewards of Maine, water-quality indicators — https://www.lakestewardsofmaine.org/volunteer-programs-tools/water-quality-monitoring/understanding-water-quality-indicators/
- EPA NLA Maine profiles (Skitacook, Webster) — via `docs/research_notes/Hot Brook populations and water/recent_maine_research.md`
