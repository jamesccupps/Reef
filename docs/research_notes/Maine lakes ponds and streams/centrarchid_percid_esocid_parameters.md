# Bioenergetics and life-history parameters for the centrarchids, percid and esocid of Maine lakes: pumpkinseed, redbreast sunfish, yellow perch, chain pickerel, smallmouth bass and largemouth bass

**Scope and sourcing.**
- Collected 2026-10-15. Northern populations are preferred: Maine, New Brunswick, Nova Scotia, Ontario, Quebec and the upper Midwest. Southern values are marked **[S]** and given only for contrast or where nothing northern exists.
- **Read in full:**
  - the FB4 parameter file (downloaded and searched);
  - Wismer & Christie 1987;
  - the New England thermal database (Yoder 2012, MBI);
  - Doudoroff & Shumway 1970;
  - Cooper & Washburn 1946;
  - the ORNL thermal-metrics compilation;
  - the MDIFW black-bass and chain-pickerel plans;
  - the USFWS HSI reports for yellow perch and smallmouth bass;
  - the Scott & Crossman 1973 species accounts;
  - Dudley & Trial 2014;
  - Fernando et al. 2018;
  - Mittelbach et al. 1999;
  - the 2024 Quebec pumpkinseed CTmax paper;
  - the redbreast USFWS HSI (Aho et al. 1986);
  - FishBase population tables.
- **Lower-confidence sources:**
  - **"(via X)":** a value quoted by a secondary source; I did not read the primary.
  - **"[snippet]":** seen only in a search-result summary.
- **Derived values** are marked "(derived)": unit conversions, Ws converted to cm, M from maximum age, and FB4 curve evaluations.
- **The web-search budget ran out partway through the session.** Some threads could not be followed; they are listed under Gaps.
- **Related notes:**
  - `docs/research_notes/Real lake ecology for calibration/largemouth_bass.md` covers north-temperate largemouth bass spawning, nests and first year in more depth.
  - `northern_pike.md` in the same folder covers the pike that the chain pickerel model has to borrow from.

---

## Q1. Fish Bioenergetics 4.0 parameter sets, and the best available sets for pumpkinseed, redbreast and chain pickerel

### Takeaway
- **Species with their own FB4 sets.** Yellow perch, smallmouth bass and largemouth bass each have one, copied verbatim below.
- **No species-specific Wisconsin model exists for pumpkinseed, redbreast sunfish or chain pickerel**, and I found no published application that names a surrogate for them. The defensible defaults are:
  - **sunfishes:** the FB4 bluegill set (Kitchell et al. 1974);
  - **chain pickerel:** the FB4 northern pike set (Bevelhimer et al. 1985). The esocid model is known to overestimate consumption.
- **Pumpkinseed routine-metabolism data exist** (Roberts 1964 via FishBase). FB4's bluegill respiration curve runs **about 1.2–1.7× above** those data (derived).
- **Smallmouth bass: neither FB4 set is safe across all sizes.**
  - The Whitledge et al. 2003 set gives negative growth at maximum ration for fish of 5 g or less (derived).
  - The Shuter & Post 1990 row, as stored in FB4, gives negative growth at maximum ration at every size and temperature I tested (derived).

### Cited Findings

**FB4 rows, copied verbatim from `Parameters_official.csv`** — [FB4 parameter file (github.com/jim-breck/FB4)](https://github.com/jim-breck/FB4/blob/master/Parameters_official.csv); downloaded raw from [raw CSV](https://raw.githubusercontent.com/jim-breck/FB4/master/Parameters_official.csv).

| Set (source) | CEQ | CA | CB | CQ | CTO | CTM | REQ | RA | RB | RQ | RTO | RTM | ACT | SDA | EGEQ / FA (FB, FG) | EXEQ / UA (UB, UG) | ED J/g |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Yellow perch adult (Kitchell et al. 1977) | 2 | 0.25 | −0.27 | 2.3 | 23 | 28 | 2 | 0.0108 | −0.2 | 2.1 | 28 | 33 | 1 | 0.15 | 2 / 0.158 (−0.222, 0.631) | 2 / 0.0292 (0.58, −0.299) | 4186 |
| Yellow perch juvenile (Kitchell et al. 1977) | 2 | 0.25 | −0.27 | 2.3 | **29** | **32** | 2 | 0.0108 | −0.2 | 2.1 | **32** | **35** | 1 | 0.15 | as adult | as adult | 4186 |
| Yellow perch larvae (Post 1990; Hewett & Johnson 1992; Worischka & Mehner 1998) | 2 | 0.51 | −0.42 | 2.3 | 29 | 32 | 2 | 0.0065 | −0.2 | 2.1 | 32 | 35 | 1 | 0.15 | 1 / 0.15 | 1 / 0.15 | 2512 |
| Smallmouth bass, subadult/adult, T ≤ 26 °C (Whitledge et al. 2003) | 2 | 0.339 | −0.31 | **4.2** | 22 | 37 | 2 | 0.244 | −0.756 | 1.8 | 30 | 37 | 1 | 0.15848 | 1 / 0.104 | 1 / 0.0882 | 4184 |
| Smallmouth bass, subadult/adult, T > 26 °C (Whitledge et al. 2003) | 2 | 0.339 | −0.31 | **1.95** | 22 | 37 | 2 | 0.244 | −0.756 | 1.8 | 30 | 37 | 1 | 0.15848 | 1 / 0.104 | 1 / 0.0882 | NA |
| Smallmouth bass adult (Shuter & Post 1990) | 2 | 0.25 | −0.31 | 3.8 | 29 | 36 | 2 | 0.03 | −0.21 | 3.3 | 30 | 37 | **2** | 0.16 | 1 / 0.104 | 1 / 0.0882 | 4186 |
| Largemouth bass adult (Rice et al. 1983) | 2 | 0.33 | −0.325 | 2.65 | 27.5 | 37 | **1** | 0.008352 | −0.355 | RQ 0.0313 | RTO 0.0196 | RTM 0 | 1 | 0.15848 | 1 / 0.104 | 1 / 0.08817 | 4184 |
| Bluegill adult (Kitchell et al. 1974) | 2 | 0.182 | −0.274 | 2.3 | 27 | 36 | 2 | 0.0154 | −0.2 | 2.1 | 36 | 40 | 1 | 0.172 | 2 / 0.158 (−0.222, 0.631) | 2 / 0.0253 (0.58, −0.299) | 4186 |
| Bluegill juvenile (Kitchell et al. 1974) | 2 | 0.182 | −0.274 | 2.3 | **31** | **37** | 2 | 0.0154 | −0.2 | 2.1 | **37** | **41** | 1 | 0.172 | as adult | as adult | 4186 |
| Northern pike adult (Bevelhimer et al. 1985) | **4** | 0.0244 | −0.18 | −0.024 (CK1 0.0125, CK4 −0.000326) | – | – | 1 | 0.0026445 | −0.18 | RQ 0.055 | RTO 0.1222 | RTL 0, RK1 1, RK4 0 | 1 | 0.175 | 1 / 0.2 | 1 / 0.0875 | 3598 |
| Muskellunge adult (Bevelhimer et al. 1985) | 4 | 0.0126 | −0.18 | 0.06 (CK1 0.0075, CK4 −0.000216) | – | – | 1 | 0.0026445 | −0.18 | 0.055 | 0.1222 | – | 1 | 0.175 | 1 / 0.2 | 1 / 0.0875 | 3598 |
| Tiger muskellunge juvenile (Schoenebeck et al. 2008) | 2 | 0.221 | −0.18 | 2.53 | 26 | 34 | 1 | 0.00246 | −0.18 | 0.055 | 0.03922 | – | 1 | 0.14 | 1 / 0.13 | 1 / 0.08046 | 3874 |

**Notes stored in the FB4 file:**
- **Perch larvae:** RA was changed from 0.0962 to 0.0065, and ACT from 4.4 to 1.0, relative to earlier versions — [FB4 file](https://github.com/jim-breck/FB4/blob/master/Parameters_official.csv)
- **Smallmouth (Whitledge):** UA was converted from 0.068 of C to 0.08817 of C − F; SDA was changed from 0.16 to 0.15848 — [FB4 file](https://github.com/jim-breck/FB4/blob/master/Parameters_official.csv)
- **Largemouth:** "SDA & UA reflect use of (C − F) instead of C; corrected RA & RQ" — [FB4 file](https://github.com/jim-breck/FB4/blob/master/Parameters_official.csv)
- **Pike and muskellunge:** the new CEQ 4 uses ft = exp(CQ·T + CK1·T² + CK4·T³); UA and SDA were adjusted for (C − F); RA was adjusted for the log-transform of the fit — [FB4 file](https://github.com/jim-breck/FB4/blob/master/Parameters_official.csv)
- **Tiger muskellunge juvenile:** "CAUTION! This model needs their correction factor!" — [FB4 file](https://github.com/jim-breck/FB4/blob/master/Parameters_official.csv)

**What else is in the file:**
- No pumpkinseed, redbreast or chain pickerel rows. The only *Lepomis* entry is bluegill — [FB4 file](https://github.com/jim-breck/FB4/blob/master/Parameters_official.csv)
- The fb4package R database (105 models, 73 species) likewise lists only bluegill among *Lepomis* — [fb4package species database](https://cran.r-project.org/web/packages/fb4package/vignettes/fb4-species-database.html)
- Eurasian perch (Karas & Thoresson 1992) has separate 1 g and 100 g sets:
  - CA 0.4, CB −0.27 for both;
  - CQ 2.8 / 3.9, CTO 28 / 23, CTM 32 / 28;
  - RQ 2.0 / 2.8, RTO 32 / 28, RTM 35 / 33.

  — [FB4 file](https://github.com/jim-breck/FB4/blob/master/Parameters_official.csv)

**How well the yellow perch model performs.** Bajer, Whitledge, Hayward & Zweifel 2003 (J. Fish Biol. 62:436–454) tested the Wisconsin and Karas–Thoresson perch models in the lab, on age-2 perch at 21 °C:
- Neither model was consistently better.
- Both mis-estimated resting routine metabolism.
- Growth errors were strongly correlated with feeding rate.

— [Bajer et al. 2003 (UMN Experts page)](https://experts.umn.edu/en/publications/laboratory-evaluation-of-two-bioenergetics-models-applied-to-yell/)

**Pumpkinseed metabolism measurements:**
- **Roberts 1964**, via Altman & Dittmer 1971 and FishBase. Routine O₂ consumption of 30 g pumpkinseed:

  | Temperature | Raw rate (mg O₂/kg/h) | g O₂/g/d (derived, ×24/10⁶) |
  |---|---|---|
  | 5 °C | 22.9 | 0.00055 |
  | 10 °C | 48.6 | 0.00117 |
  | 15 °C | 72.9 | 0.00175 |
  | 20 °C | 85.7 | 0.00206 |
  | 25 °C | 120.0 | 0.00288 |

  Q10 over 5–25 °C is about 2.3 (derived). FishBase's "at 20 °C" column is temperature-standardised by an unstated method; do not use it. — [FishBase oxygen-consumption list, *L. gibbosus*](https://www.fishbase.se/physiology/OxygenDataList.php?ID=3372&GenusName=Lepomis&SpeciesName=gibbosus&fc=302&StockCode=3568)
- **O'Hara 1968**, 10 g fish, routine rate: 180 mg O₂/kg/h at 25 °C and 290 at 30 °C — [FishBase oxygen list](https://www.fishbase.se/physiology/OxygenDataList.php?ID=3372&GenusName=Lepomis&SpeciesName=gibbosus&fc=302&StockCode=3568)
- **44.9 g fish at 20 °C:** standard 45.0 and active 408 mg O₂/kg/h. A [snippet] attributes these to Brett & Sutherland 1965 — [FishBase oxygen list](https://www.fishbase.se/physiology/OxygenDataList.php?ID=3372&GenusName=Lepomis&SpeciesName=gibbosus&fc=302&StockCode=3568)
- **Seasonal feeding:** pumpkinseed forage less in winter, especially below 15 °C (Collins & Hinch 1993, an Ontario pond). Feeding peaks at dawn and dusk. Nesting males forage less and lose weight in June–July — [DFO pumpkinseed synopsis (Jordan et al. 2009, Can. MS Rep. 2886)](https://waves-vagues.dfo-mpo.gc.ca/Library/337845.pdf)
- **Not obtained:** Evans 1984 (TAFS 113:494–512, "temperature independence of the annual cycle of standard metabolism in the pumpkinseed"). It is the key pumpkinseed respiration paper; the title is confirmed, no values — [DFO synopsis](https://waves-vagues.dfo-mpo.gc.ca/Library/337845.pdf)

**Redbreast sunfish:**
- No FB4 set, no Cmax, no respiration data.
- The USFWS habitat model assumes its physiology resembles bluegill or largemouth bass — [Aho, Anderson & Terrell 1986, USFWS Biol. Rep. 82(10.119)](https://19january2017snapshot.epa.gov/www3/region1/npdes/merrimackstation/pdfs/ar/AR-783.pdf)

**Chain pickerel:**
- No Wisconsin-model application, measured daily ration, respiration rate or energy density was found. AnAge states that no metabolic data exist — [AnAge, *Esox niger*](https://genomics.senescence.info/species/entry.php?species=Esox_niger)
- **Known biases of the esocid (Bevelhimer) model:**
  - It overestimates consumption, especially in winter and at low ration. Tiger muskellunge, Chipps et al. 2000, TAFS 129:186 — [Chipps et al. 2000](https://onlinelibrary.wiley.com/doi/abs/10.1577/1548-8659(2000)129%3C0186:GAFCBT%3E2.0.CO;2)
  - A 2008 juvenile-esocid revision reports a 39–52% overestimate (TAFS 137(6)) — [T07-229.1](https://www.tandfonline.com/doi/abs/10.1577/T07-229.1). Both were seen as abstracts or summaries.
- **Nova Scotia invasion work** is stable-isotope only, with no consumption estimates — [Swinemar 2024 MSc, Saint Mary's](https://library2.smu.ca/handle/01/32068)
- **Unverified lead:** a search snippet said young-of-year chain pickerel respiration was "significantly lower" than in northern pike and muskellunge. The paper could not be identified (helper report; no URL).

### Inferences
- **Pumpkinseed against the bluegill curve** (derived; FB4 bluegill adult respiration at 30 g with ACT 1, against the Roberts 1964 routine rates):

  | Temperature | Bluegill model (g O₂/g/d) | Measured pumpkinseed | Ratio |
  |---|---|---|---|
  | 5 °C | 0.00093 | 0.00055 | 1.69 |
  | 10 °C | 0.00141 | 0.00117 | 1.21 |
  | 15 °C | 0.00212 | 0.00175 | 1.21 |
  | 20 °C | 0.00314 | 0.00206 | 1.53 |
  | 25 °C | 0.00453 | 0.00288 | 1.57 |

  - A pumpkinseed run on the bluegill set therefore pays about 20–70% more maintenance than this one dataset implies.
  - The bluegill RTO of 36 °C also means its respiration keeps rising to 36 °C.
  - **Caveat:** this is a single study with unknown acclimation (likely photoperiod-acclimated fish at 5–25 °C), so treat it as a sensitivity range, not a correction.
- **Consumption curves at 100 g** (derived from the FB4 rows: Cmax in g/g/d at 4 / 10 / 20 / 25 °C):

  | Set | 4 °C | 10 °C | 20 °C | 25 °C |
  |---|---|---|---|---|
  | Perch adult | 0.018 | 0.032 | 0.067 | 0.067 |
  | Bluegill | 0.007 | 0.014 | 0.038 | 0.050 |
  | Largemouth bass | 0.0055 | 0.014 | 0.048 | 0.069 |
  | Smallmouth bass (Whitledge) | 0.003 | 0.015 | 0.076 | 0.068 |
  | Northern pike | 0.012 | 0.021 | 0.072 | 0.089 |

  - The pike (CEQ 4) curve peaks at **24.6 °C**.
  - Perch and pike keep a sizeable winter Cmax (1–2 %/d at 4 °C); the basses fall to about 0.3–0.5 %/d. This matches the field picture under Q6: perch and pickerel feed under ice, bass are torpid.
- **The smallmouth sets do not cover the whole life cycle** (derived energy budget: C at Cmax with prey at 4000 J/g; F, U and SDA as in each row; R × 13,560 J/g O₂):
  - **Whitledge et al. 2003:**
    - Net energy is positive for 100 g fish at 15–30 °C (+60 to +134 J/g/d) and about 0 at 10 °C. That fits the "growth begins at 10–14 °C" in the HSI report (Q6).
    - It is **negative at every temperature for 5 g fish** (−168 J/g/d at 20 °C). R exceeds Cmax at 1 g, because RB is −0.756.
    - Use it only for subadults and adults, as its title says.
  - **Shuter & Post 1990, as stored in FB4:** negative at Cmax for both 5 g and 100 g at 10–30 °C (for example −57 J/g/d at 100 g, 20 °C). The RA 0.03 with ACT 2 pairing appears inconsistent with its CA, or carries a convention I could not trace. Do not use it unverified.
  - **For young-of-year smallmouth,** the empirical Shuter et al. 1980 growth and overwinter equations (Q4) are a better-documented option. So is a juvenile centrarchid set, for example the largemouth set the sim already uses as a stand-in.
- **Chain pickerel:**
  - The pike set is the closest documented surrogate (same genus; FB4's only esocid sets). Its known bias is to over-predict consumption.
  - Chain pickerel adults are mostly 0.3–1.5 kg, about pike-juvenile sizes. The tiger-muskellunge juvenile set (CEQ 2, CTO 26, CTM 34) is a possible alternative for small esocids, but the FB4 file flags that it needs the authors' correction factor.
  - **Energy density:** take pike's 3598 J/g.

### Gaps
- No Cmax or respiration study for chain pickerel; the young-of-year respiration comparison was not traced.
- No Cmax, gastric evacuation or body energy density (J/g wet) for pumpkinseed or redbreast.
- Evans 1984 pumpkinseed standard-metabolism values were not obtained.
- Whitledge et al. 2003 and Shuter & Post 1990 were not read. I could not check whether the Shuter & Post row's RA/ACT pairing is a transcription issue in FB4 or an intended convention.
- Abstracts of Bevelhimer et al. 1985 were not reached. Which three esocids it covers (assumed pike, muskellunge, tiger muskellunge) is unconfirmed.

---

## Q2. Length–weight (standard weight Ws) and growth (von Bertalanffy or mean length-at-age) in Maine and northern populations

### Takeaway
**Standard-weight (Ws) equations exist for all six species,** each the 75th-percentile benchmark. Converted to the sim's W(g) = a·L(cm)^b (derived):

| Species | a | b |
|---|---|---|
| Pumpkinseed | 0.011429 | 3.237 |
| Redbreast sunfish | 0.013183 | 3.1218 |
| Yellow perch | 0.006982 | 3.230 |
| Chain pickerel | 0.002624 | 3.243 |
| Smallmouth bass | 0.007430 | 3.200 |
| Largemouth bass | 0.005559 | 3.273 |

**Maine growth data are thin**, but each species has something:
- **Smallmouth and largemouth:** FishBase has state-level Maine von Bertalanffy rows (smallmouth L∞ 56.4 cm, k 0.14; largemouth L∞ 53.8 cm, k 0.22).
- **Smallmouth young-of-year:** measured in Spednic Lake (71–76 mm in September–October).
- **Chain pickerel:** MDIFW gives first-year length and age-3–5 lengths.
- **Pumpkinseed:** the best northern growth data are Ontario lakes (L∞ about 15–22 cm SL).
- **Redbreast:** the only northern data are from New Brunswick.

### Cited Findings

**Ws equations** (metric; log10 Ws(g) = a + b·log10 TL(mm), with minimum TL) — [FSA package WSlit table](https://github.com/fishR-Core-Team/FSA/blob/master/data-raw/WSlit.csv):

| Species | a | b | Minimum TL | Source | Method |
|---|---|---|---|---|---|
| Pumpkinseed | −5.179 | 3.237 | 50 mm | Liao et al. 1995 | RLP |
| Redbreast sunfish | −5.0018 | 3.1218 | 80–300 mm | Bonvechio et al. 2023 | EmP |
| Yellow perch | −5.386 | 3.230 | 100 mm | Willis et al. 1991 | RLP |
| Chain pickerel | −5.824 | 3.243 | 150 mm | Neumann & Flammang 1997 | RLP |
| Smallmouth bass | −5.329 | 3.200 | 150 mm | Kolander et al. 1993 | RLP |
| Largemouth bass | −5.528 | 3.273 | 150 mm | Henson 1991 | RLP |
| Bluegill (for reference) | −5.374 | 3.316 | 80 mm | Hillman 1982 | — |

**Attribution conflict for the largemouth Ws.** FSA attributes −5.528 + 3.273 to Henson 1991, and so does the sim's `species.js` comment. The repo's existing `largemouth_bass.md` note calls the same coefficients Wege & Anderson 1978 — [FSA WSlit](https://github.com/fishR-Core-Team/FSA/blob/master/data-raw/WSlit.csv). The numbers agree either way.

**Other length–weight relationships:**
- **Pumpkinseed:**
  - Ontario database: log a = −5.2279, b = 3.2276 (TL) — [Ontario Freshwater Fishes Life History Database, pumpkinseed](https://www.ontariofishes.ca/fish_detail.php?FID=124)
  - Upper Beverly Lake, ON: a = 0.00737, b = 3.262 (n = 144)
  - Lower Beverly Lake, ON: a = 0.00514, b = 3.321 (n = 152)
  - Alanconnie Lake, PA: a = 0.0112, b = 3.262 (n = 629). All in cm and g.
  — [FishBase L–W list, *L. gibbosus*](https://www.fishbase.se/popdyn/LWRelationshipList.php?ID=3372&GenusName=Lepomis&SpeciesName=gibbosus&fc=302)
- **Chain pickerel:**
  - Carlander-data refits (W = 1000·(TL_mm/l1)^b): mean b = 3.151, l1 = 544.0 mm; Massachusetts (M146) b = 3.190, l1 = 515.3 mm — [Daviscourt et al. 2011, arXiv 1107.3112](https://arxiv.org/pdf/1107.3112)
  - Stilwell Reservoir, NY: W(kg) = (FL/53.336 cm)^2.846; mean Wr 88.1% — [Dexter et al. 2011, arXiv 1107.0406](https://arxiv.org/pdf/1107.0406)
- **Smallmouth bass:** log W(g) = −3.1176 + 3.0699·log FL(mm) (Rowan 1962, via Scott & Crossman) — [Scott & Crossman 1973, Bull. 184, part 7](https://waves-vagues.dfo-mpo.gc.ca/Library/52369_Pt7.pdf)
- **Largemouth bass:** log W(lb) = −3.8384 + 3.4859·log TL(in) (Lewis 1965, Lake Opinicon, via Scott & Crossman) — [Scott & Crossman part 7](https://waves-vagues.dfo-mpo.gc.ca/Library/52369_Pt7.pdf)
- **Redbreast:**
  - Alabama a = 0.0209, b = 3.01 (n = 3,937, cm/g) — [FishBase L–W, *L. auritus*](https://www.fishbase.se/popdyn/LWRelationshipList.php?ID=3370&GenusName=Lepomis&SpeciesName=auritus&fc=302) **[S]**
  - New Brunswick adults (Gautreau & Curry 2006): Yoho Lake 126 ± 26 mm TL, 42.4 g; Oromocto Lake 143 ± 33 mm, 80.9 g — [COSEWIC redbreast sunfish, ch. 6](https://www.canada.ca/en/environment-climate-change/services/species-risk-public-registry/cosewic-assessments-status-reports/redbreast-sunfish/chapter-6.html)

**Growth — pumpkinseed (northern lakes)**
- **Von Bertalanffy rows** (mostly SL, cm; Copp et al. 2004 compilation):

  | Lake | L∞ (cm SL) | k | t0 |
  |---|---|---|---|
  | Upper Poole Pond, ON | 14.6 | 0.21 | −0.21 |
  | Lac Vert, QC | 15.3 | 0.16 | −0.05 |
  | Crosson Lake, ON | 16.8 | 0.17 | 0.15 |
  | Plastic Lake, ON | 18.0 | 0.16 | 0.12 |
  | Lake Opinicon, ON | 18.5 | 0.14 | −0.65 |
  | Upper Beverly Lake, ON | 21.9 | 0.13 | −0.03 |
  | Flora Lake, WI | 20.6 | 0.16 | −0.33 |
  | Houghton Lake, MI | 25.6 | 0.20 | 0.47 |

  FishBase flags many rows "questionable", and Copp et al. note that the asymptotes are unrealistic for many populations — [FishBase growth list, *L. gibbosus*](https://www.fishbase.se/popdyn/PopGrowthList.php?ID=3372&GenusName=Lepomis&SpeciesName=gibbosus&fc=302)
- **First-year length:** up to 5 cm (Holtan 1998, Wisconsin DNR, via DFO) — [DFO pumpkinseed synopsis](https://waves-vagues.dfo-mpo.gc.ca/Library/337845.pdf)
- **SL to TL** for centrarchids generally: TL = 2.761 + 1.202·SL (mm) — [Fernando, Hecke & Eggleton 2018](https://eaglehill.us/SENAonline/articles/SENA-17-2/20-Fernando.shtml)

**Growth — redbreast sunfish (New Brunswick)**
- Yoho Lake back-calculated mean TL: 36.2, 64.4, 87.8, 110.6, 127.2, 140.9 mm for the six age classes "0+"–"5+". These may actually be lengths at annuli 1–6.
- Caught age-2+ fish averaged 91 mm and age-3+ fish 117 mm.
- No von Bertalanffy parameters.

— [COSEWIC redbreast ch. 6](https://www.canada.ca/en/environment-climate-change/services/species-risk-public-registry/cosewic-assessments-status-reports/redbreast-sunfish/chapter-6.html)

**Growth — yellow perch**
- **Mean length at age** (Scott & Crossman table; column alignment reconstructed by the helper and checked against the text):
  - Lake Jesse, NS (stunted), FL: 0+ 36, 1+ 77, 2+ 92, 3+ 108, 4+ 125 mm.
  - Heming Lake, MB (slow, northern), FL: 0+ 48, 1+ 71, 2+ 86, 3+ 124, 4+ 142, 5+ 170, 6+ 213, 7+ 231, 8+ 259, 9+ 302 mm.
  - Lake Erie, TL: 2+ 168 … 7+ 279 mm.
  - "Stunting often occurs in crowded populations with adults never exceeding 6 inches."

  — [Scott & Crossman part 8](https://waves-vagues.dfo-mpo.gc.ca/Library/52369_Pt8.pdf)
- **Von Bertalanffy rows** (TL, cm):

  | Population | L∞ | k | t0 |
  |---|---|---|---|
  | Lake Jesse, NS | 14.6 | 0.429 | −0.23 |
  | Lac Saint-Louis, QC (males) | 25.9 | 0.290 | −0.13 |
  | Lac Saint-Louis, QC (females) | 29.0 | 0.291 | −0.04 |
  | Lake Mendota, WI | 27.9 | 0.422 | −0.43 |
  | Western Lake Erie | 27.0 | 0.424 | 0.20 |

  — [FishBase growth list, *P. flavescens*](https://www.fishbase.se/popdyn/PopGrowthList.php?ID=359)
- **Maine:** perch normally run 6–12 in (15–30 cm) and 1/4–1 lb; fish up to 15 in and 1.6 lb are occasionally caught. No age data — [MDIFW yellow perch page](https://www.maine.gov/ifw/fish-wildlife/fisheries/species-information/yellow-perch.html)

**Growth — chain pickerel**
- **Maine:**
  - 4–5 in (10–13 cm) at the end of the first season.
  - Annual increments "likely" 2.5–3.5 in (6.4–8.9 cm).
  - 845 fish kept by ice anglers averaged 17.0 in (43 cm) and 1.2 lb.
  - State record (Androscoggin Lake, 1992): 28.3 in (71.9 cm), 6 lb 13 oz.

  — [MDIFW chain pickerel assessment (Brokaw 2001, upd. 2008)](https://www.maine.gov/ifw/docs/strategic-management-plans/pickerel.pdf)
- **Maine, typical catch:** most fish are age 3–5 at 14–19 in (36–48 cm) — [MDIFW chain pickerel page](https://www.maine.gov/ifw/fish-wildlife/fisheries/species-information/chain-pickerel.html)
- **Von Bertalanffy rows** (TL; FishBase lost the column alignment, so the sex labels are uncertain):

  | Population | L∞ (cm) | K | t0 |
  |---|---|---|---|
  | Massachusetts ponds, male | 53.4 | 0.26 | – |
  | Massachusetts ponds, female | 81.2 | 0.15 | – |
  | Rhode Island | 67.1 | 0.19 | – |
  | Lake Hopatcong, NJ (female) | 90.1 | 0.18 | −0.67 |

  — [FishBase growth list, *E. niger*](https://www.fishbase.se/popdyn/PopGrowthList.php?ID=2712&GenusName=Esox&SpeciesName=niger)
- **New Jersey lakes, 1990–95,** mean TL at ages I–VI: 157, 256, 372, 423, 513, 638 mm — [NJDFW chain pickerel](https://dep.nj.gov/njfw/wp-content/uploads/njfw/Chain-Pickerel.pdf)

**Growth — smallmouth bass**
- **FishBase state-level von Bertalanffy rows** (TL; source compilation not identified):

  | State | L∞ (cm) | k |
  |---|---|---|
  | **Maine** | 56.4 | 0.14 |
  | New Brunswick | 49.9 | 0.16 |
  | Ontario | 53.2 | 0.17 |
  | Massachusetts | 50.5 | 0.25 |
  | New York | 60.8 | 0.16 |

  — [FishBase growth list, *M. dolomieu*](https://www.fishbase.se/popdyn/PopGrowthList.php?ID=3382)
- **Potter's Lake, New Brunswick** (introduced population next to Maine; Smith 1942), FL: 38, 124, 198, 244, 277, 302, 325, 343 mm, apparently from age 0+ — [Scott & Crossman part 7](https://waves-vagues.dfo-mpo.gc.ca/Library/52369_Pt7.pdf)
- **Maine young-of-year:**
  - End of first season 2.2–2.9 in (56–74 mm), some to 4 in — [MDIFW Black Bass Management Plan (Jordan 2001)](https://www.maine.gov/ifw/docs/strategic-management-plans/blackbass.pdf)
  - Spednic Lake measured means: 73.0 mm (1 Sep 1988) and 70.7–76.3 mm (3 Oct 1995). A temperature-only model predicted 80–95 mm — [Dudley & Trial 2014, USGS SIR 2014-5164](https://pubs.usgs.gov/sir/2014/5164/pdf/sir2014-5164.pdf)
- **Maine adults:** "Bass grow slowly in Maine"; a 20-in (51 cm) bass may be about 20 years old — [MDIFW smallmouth page](https://www.maine.gov/ifw/fish-wildlife/fisheries/species-information/smallmouth-bass.html)

**Growth — largemouth bass**
- **FishBase rows** (TL): Maine L∞ 53.8 cm, k 0.22; Ontario 56.0, 0.19; New York 52.9, 0.22; Connecticut 56.5, 0.22 — [FishBase growth list, *M. salmoides*](https://www.fishbase.se/popdyn/PopGrowthList.php?ID=3385)
- **Lake Simcoe, ON,** TL at ages 1–15: 102, 203, 254, 305, 343, 368, 419, 432, 445, 457, 483, 503, 518, 533, 544 mm — [Scott & Crossman part 7](https://waves-vagues.dfo-mpo.gc.ca/Library/52369_Pt7.pdf)
- **Maine:** typical adults 12–16 in and 1–3 lb; growth "slow"; a 20-in fish may be about 20 years old — [MDIFW largemouth page](https://www.maine.gov/ifw/fish-wildlife/fisheries/species-information/largemouth-bass.html)

### Inferences
- **Ws weights at round lengths** (derived from the converted Ws):
  - At 10 cm: pumpkinseed 19.7 g, redbreast 17.5, perch 11.9, smallmouth 11.8, largemouth 10.4, chain pickerel 4.6.
  - At 30 cm: pumpkinseed 691 g (beyond its real size range), perch 412, smallmouth 396, largemouth 380, pickerel 162.
  - At 50 cm: pickerel 849 g, smallmouth 2.03 kg, largemouth 2.02 kg.
  - The chain pickerel figure fits the Maine average: a 43 cm fish kept by anglers weighs 1.2 lb (0.54 kg), against Ws(43 cm) ≈ 0.52 kg.
- **Pumpkinseed von Bertalanffy for a Maine-like lake:** use a northern-lake curve with L∞ ≈ 18 cm SL (≈ 22 cm TL by the Fernando conversion), k ≈ 0.15–0.2 and t0 ≈ 0. That gives roughly 3–4 cm TL at age 1 and 12–14 cm TL by age 5 (derived). This is slightly below the up-to-5 cm first-year growth reported from Wisconsin.
- **Pumpkinseed von Bertalanffy for a stunted pond:** L∞ ≈ 14–15 cm SL (≈ 17–18 cm TL).
- **Smallmouth in Maine lakes:** k ≈ 0.14 with young-of-year of 56–76 mm. This is markedly slower than the Michigan averages the sim currently uses for bass.

### Gaps
- No MDIFW age–length table for pumpkinseed, perch, chain pickerel or largemouth in Maine; only agency summaries and FishBase state rows. The source compilation behind the FishBase "Maine" rows was not identified.
- No von Bertalanffy parameters for redbreast; no northern (Maine) redbreast growth data.
- The Neumann & Flammang 1997 and Liao et al. 1995 originals were not read; coefficients are from the FSA table.

---

## Q3. Size and age at maturity, fecundity–length relationships and eggs

### Takeaway
**Northern populations mature late:**
- **Pumpkinseed:** age 2–3, earlier and more than 20 mm smaller in stunted winterkill ponds.
- **Yellow perch:** males 2–3 yr, females 3–4 yr at about 17–23 cm TL.
- **Chain pickerel (Maine):** age 3–4 at 33–41 cm.
- **Smallmouth bass (Maine):** males 3–4 yr, females 4–5 yr at 20–30 cm.
- **Largemouth bass (Canada):** males 3–4 yr, females 4–5 yr.

**Fecundity–length regressions** were found only for perch (Indiana Lake Michigan, Pennsylvania). For the other species only per-kg or range values exist.

### Cited Findings

**Pumpkinseed**
- **Age at maturity:** 2–3 yr in Ontario; mean tm 2.5 — [Ontario database](https://www.ontariofishes.ca/fish_detail.php?FID=124); [FishBase PopChar list](https://www.fishbase.se/popdyn/PopCharList.php?ID=3372&GenusName=Lepomis&SpeciesName=gibbosus&fc=302)
- **Winterkill ponds vs Lake Opinicon:** fish in two winterkill ponds beside Lake Opinicon, ON, matured **1–2 yr earlier and >20 mm smaller** than in the lake (Fox & Keast 1991, CJFAS 48:1792) — [QUBS project page](https://research.qubs.ca/projects/effect-of-overwinter-mortality-in-reproductive-life-history-characteristics-of-pumpkinseed-lepomis-gibbosus-populations)
- **Fecundity:**
  - 2,451–10,633 eggs per female, Ontario — [Ontario database](https://www.ontariofishes.ca/fish_detail.php?FID=124)
  - 1,500–7,000 per female; one nest yields 1,500–15,000 fry, mean 8,000 (Holtan 1998, via DFO) — [DFO synopsis](https://waves-vagues.dfo-mpo.gc.ca/Library/337845.pdf)
  - **Conflict:** the FishBase summary says "up to 1000 eggs".
- **Stunted Little Round Lake, ON** (Danylchuk & Fox 1994, Env. Biol. Fish. 39:119): fewer mature age-2 females spawned, and those that did spawned late. Deacon & Keast 1987 found that the low-food lake had earlier, smaller maturity and different fecundity–weight relationships. Neither was quantified here — [DFO synopsis](https://waves-vagues.dfo-mpo.gc.ca/Library/337845.pdf) (helper report; the originals were not read)

**Redbreast sunfish**
- **Maturity:** first mature at age II; most fish older than III spawn (Aho et al. 1986, citing Davis 1972, Bass & Hitt 1974 and Sandow 1974) — [Aho et al. 1986](https://19january2017snapshot.epa.gov/www3/region1/npdes/merrimackstation/pdfs/ar/AR-783.pdf)
- **No Canadian data:** COSEWIC reports no Canadian data on maturity or fecundity — [COSEWIC ch. 6](https://www.canada.ca/en/environment-climate-change/services/species-risk-public-registry/cosewic-assessments-status-reports/redbreast-sunfish/chapter-6.html)
- **Fecundity [S]:** North Carolina 963–8,250 eggs at 139–235 mm TL (Davis 1972); Florida 1,396–4,138 at 100–175 mm (Bass & Hitt 1974) — [Aho et al. 1986](https://19january2017snapshot.epa.gov/www3/region1/npdes/merrimackstation/pdfs/ar/AR-783.pdf)
- **Eggs:** about 2 mm (Lukas & Orth 1993) — [COSEWIC ch. 6](https://www.canada.ca/en/environment-climate-change/services/species-risk-public-registry/cosewic-assessments-status-reports/redbreast-sunfish/chapter-6.html) (helper report)

**Yellow perch**
- **Age at maturity:**
  - Females 3–4 yr, one year later than males, in Canada and the northern US — [USFWS HSI yellow perch (Krieger et al. 1983)](https://www.arlis.org/docs/vol1/AK_Heritage/FWS/OBS/82/FWS-OBS-82-10-55.pdf)
  - Males 3 yr, females 4 yr; Lake Erie yearling males are often fertile — [Scott & Crossman part 8](https://waves-vagues.dfo-mpo.gc.ca/Library/52369_Pt8.pdf)
- **Length at maturity:** southern Lake Michigan males 16.2 cm TL at age 2, females 22.7 cm at age 3; western Lake Erie 18.8 cm; St. Marys River females 17–18 cm — [FishBase maturity list, *P. flavescens*](https://www.fishbase.se/Reproduction/MaturityList.php?ID=359)
- **Fecundity:**
  - Lake Ontario: 3,035–61,465 eggs at 131–257 mm FL.
  - Egg masses hold 2,000–90,000 eggs, average about 23,000.
  - Shed and swollen eggs are about 3.5 mm.
  - The egg strand is a gelatinous, accordion-folded tube up to 2.1 m long. There is no parental care.

  — [Scott & Crossman part 8](https://waves-vagues.dfo-mpo.gc.ca/Library/52369_Pt8.pdf)
- **Fecundity regressions [snippet]:**
  - Lake Michigan (Indiana): log10 F = −3.220 + 3.223·log10 TL(mm), females 172–332 mm.
  - Pymatuning, PA: F = −66,980 + 399·TL(mm).

  (helper report; no fetched URL — low confidence)
- **Stunted perch [snippet]:** Alberta stunted perch had higher relative fecundity and GSI; Henderson Lake, ON stunted perch matured more slowly (Ritchie 1984 thesis). Lengths at maturity not obtained (helper report; no fetched URL).

**Chain pickerel**
- **Maine:**
  - Mature at age 3–4, 13–16 in (33–41 cm) TL.
  - About 1.3 females per male.
  - Fecundity **10,000–12,000 eggs per lb** (≈22,000–26,500 per kg, derived).

  — [MDIFW pickerel assessment](https://www.maine.gov/ifw/docs/strategic-management-plans/pickerel.pdf)
- **Other compilations:**
  - Maturity 3.5 yr (3–4; Scott & Crossman); 42 cm (38–46), 0.55 kg (Coffie 1998).
  - Fecundity about 30,000 eggs/kg (Mittelbach & Persson 1998).

  — [StoreFish, *Esox niger*](https://storefish.org/species/esox-niger)
- **Ontario:** fecundity 6,102–29,928; maturity 3–5 yr — [Ontario database, chain pickerel](https://ontariofishes.ca/fish_detail.php?FID=89)
- **Eggs and larvae:** oocyte 2.0 mm; water-hardened egg 2.6 mm; hatch at 5.6 mm (4.2–7.0) — [StoreFish](https://storefish.org/species/esox-niger)

**Smallmouth bass**
- **Maine:** males mature at 3–4 yr and females by 4–5 yr, at 8–12 in (203–305 mm) — [MDIFW Black Bass Plan](https://www.maine.gov/ifw/docs/strategic-management-plans/blackbass.pdf)
- **Canada:** males in their 3rd–5th year, females in their 4th–6th — [Scott & Crossman part 7](https://waves-vagues.dfo-mpo.gc.ca/Library/52369_Pt7.pdf)
- **Northern limit:** age VI in the north (Fraser 1955; Turner & MacCrimmon 1970) — [USFWS HSI smallmouth (Edwards et al. 1983)](https://www.arlis.org/docs/vol1/AK_Heritage/FWS/OBS/82/FWS-OBS-82-10-36.pdf)
- **Fecundity, Maine:**
  - Effective 2,000–3,000 eggs/lb; total ovarian 7,000–8,000 eggs/lb.
  - Females do not release all their eggs each spring.

  — [MDIFW Black Bass Plan](https://www.maine.gov/ifw/docs/strategic-management-plans/blackbass.pdf)
- **Fecundity, Canada:** 5,000–14,000 eggs per female (about 7,000/lb); eggs 1.2–2.5 mm, adhesive — [Scott & Crossman part 7](https://waves-vagues.dfo-mpo.gc.ca/Library/52369_Pt7.pdf)

**Largemouth bass**
- **Maturity:** males 3–4 yr, females 4–5 yr; females probably spawn every year from 5 to 12 — [Scott & Crossman part 7](https://waves-vagues.dfo-mpo.gc.ca/Library/52369_Pt7.pdf)
- **Fecundity, Canada:** 2,000–109,314 eggs per female, or 2,000–7,000/lb; fertilized eggs 1.5–1.7 mm — [Scott & Crossman part 7](https://waves-vagues.dfo-mpo.gc.ca/Library/52369_Pt7.pdf)
- **Fecundity, Maine:** 2,000–20,000 eggs/lb — [MDIFW Black Bass Plan](https://www.maine.gov/ifw/docs/strategic-management-plans/blackbass.pdf)

### Inferences
- **Pumpkinseed maturity length:** for a northern lake, about 8–10 cm TL at age 2–3 is consistent with the growth curves above. For a stunted, winterkill-prone pond, subtract about 2 cm and 1 year (Fox & Keast 1991).
- **Chain pickerel fecundity per female** (derived from Maine eggs/lb and Ws):
  - 40 cm (≈ 0.41 kg): about 9,000–11,000 eggs;
  - 50 cm (≈ 0.85 kg): about 19,000–22,000 eggs.
  - These sit within the Ontario 6,100–29,900 range.
- **Smallmouth "effective" fecundity** (about 4,400–6,600 eggs/kg) is the figure to use for eggs actually laid in nests. The ovarian count (about 15,000–17,600/kg) overstates the eggs spawned, as the largemouth note already found for that species.

### Gaps
- No fecundity–length regression for pumpkinseed, redbreast, chain pickerel or the basses from a northern population.
- Length at maturity by sex for pumpkinseed.
- Stunted-perch maturity sizes.
- The Fox 1994 and Deacon & Keast 1987 numbers were not obtained.
- Redbreast maturity and fecundity from any northern water.

---

## Q4. Spawning: temperatures, timing in Maine, nests and male guarding, number of bouts, egg and larval development, first-year size and overwinter survival

### Takeaway
**The six species spawn in a predictable order after ice-out.** Largemouth are listed before smallmouth because, in lakes with both, their shallow sites warm first, even though smallmouth start nests at a lower temperature:

| Order | Species | Temperature | Timing |
|---|---|---|---|
| 1 | Chain pickerel | about 8–11 °C | right after ice-out |
| 2 | Yellow perch | about 7–13 °C, peak about 9–11 °C | April–May |
| 3 | Largemouth bass | nests from 15.6 °C, eggs at 16.7–18.3 °C | — |
| 4 | Smallmouth bass | nests from 12.8 °C, eggs at 15.6–18.9 °C | mid-May to mid-June in Maine |
| 5 | Pumpkinseed | 17–26 °C | protracted, May–August |
| 6 | Redbreast sunfish | about 20 °C | late June–early July in New Brunswick |

- **Parental care:** pickerel and perch give none. The basses and sunfishes have male-guarded nests:
  - **Basses:** care lasts about 3–6 weeks in total.
  - **Pumpkinseed:** males guard about 1–2 weeks per brood and can re-nest.
- **Smallmouth at their northern limit** are set by first-summer growth against a roughly 200-day winter. The Shuter et al. 1980 survival-threshold equations, as applied to a Maine lake, are directly usable.

### Cited Findings

**Chain pickerel**
- **Maine:**
  - Spawns "shortly after ice-out" in swampy, flooded vegetation.
  - Several males attend each female.
  - Eggs are broadcast; no nest, no parental care.
  - Incubation 1–2 weeks.

  — [MDIFW pickerel assessment](https://www.maine.gov/ifw/docs/strategic-management-plans/pickerel.pdf)
- **Temperatures:**
  - Spawner window 8.3–11.1 °C (Scott & Crossman) and 5.8–18.3 °C (Jones 1978).
  - Embryo window 10–17.2 °C.
  - Optimum spawning temperature 9.7 °C (Hasnain et al. 2013).

  — [ORNL thermal tolerance metrics compilation](https://hydrosource.ornl.gov/?p=732) (data: [xlsx](https://hydrosource.s3.us-east-2.amazonaws.com/files/data/datasets/GMLC_Thermal_Metrics/thermal_tolerance_metrics_freshwater_fish_v1.xlsx))
- **Ontario:** 6–11 °C, April–May — [Ontario database](https://ontariofishes.ca/fish_detail.php?FID=89)
- **Incubation:**
  - 6–12 days, mean 9 (Scott & Crossman; Underhill 1949); 90 degree-days (70–110).
  - Fry cling to vegetation by an adhesive snout gland; yolk absorbed 6–8 days after hatching.

  — [StoreFish](https://storefish.org/species/esox-niger); [ADW](https://animaldiversity.org/accounts/Esox_niger/)
- **New Jersey:** 8–11 °C; incubation 11–12 days — [NJDFW](https://dep.nj.gov/njfw/wp-content/uploads/njfw/Chain-Pickerel.pdf)
- **Fall spawning:** a secondary fall spawning is reported (Pennsylvania; Coffie 1998); no northern-lake detail — [StoreFish](https://storefish.org/species/esox-niger)

**Yellow perch**
- **Timing and temperature:**
  - Spawning migrations in April–June at 7–13 °C.
  - Peak spawning at 9 °C (Harrington 1947), 7.2–11.1 °C (Herman et al. 1964) and 10 °C (Clugston et al. 1978).
  - Best gamete viability at 8–11 °C.

  — [USFWS HSI yellow perch](https://www.arlis.org/docs/vol1/AK_Heritage/FWS/OBS/82/FWS-OBS-82-10-55.pdf)
- **Winter chill for gonads:**
  - Gonads need 145–175 days at 4–10 °C; a 10 °C winter minimum is near the upper limit for maturation (Hokanson 1977; Jones et al. 1977).
  - Embryos develop at 7–20 °C; embryo TL50 is 6.8 °C (low) and 19.9 °C (high) (Hokanson & Kleiner 1974).
  - Strands are laid at 1.0–3.7 m depth.

  — [USFWS HSI yellow perch](https://www.arlis.org/docs/vol1/AK_Heritage/FWS/OBS/82/FWS-OBS-82-10-55.pdf)
- **Canada:**
  - Usually 15 April to early May at 8.9–12.2 °C, at night and early morning.
  - Hatching takes 8–10 days, but up to 27 days at 8.3 °C.
  - Larvae hatch at about 5 mm and absorb the yolk over about 5 days.

  — [Scott & Crossman part 8](https://waves-vagues.dfo-mpo.gc.ca/Library/52369_Pt8.pdf)
- **Thermal windows:** spawners Tmin 5–7 °C and Tmax 11–14 °C; embryos about 5.4–10 to 19.7–20 °C; larvae 3–28 °C (Dahlke et al. dataset) — [ORNL compilation](https://hydrosource.ornl.gov/?p=732)
- **First winter [snippet]:** Post & Evans 1989 (CJFAS 46:1958) showed size-dependent overwinter mortality of young-of-year perch. A secondary thesis proposes 60 mm as the minimum length to survive winter in the Great Lakes basin (helper report; no URL — low confidence).

**Smallmouth bass**
- **Maine:**
  - Most spawn mid-May to mid-June.
  - Nests are built once water exceeds 55 °F (12.8 °C); eggs are laid at 60–66 °F (15.6–18.9 °C).
  - Hatch in about 5–8 days.
  - Males guard eggs and fry "for a few weeks".
  - Drawdown or cooling causes nest abandonment and re-nesting; late broods may be too small to survive winter.

  — [MDIFW Black Bass Plan](https://www.maine.gov/ifw/docs/strategic-management-plans/blackbass.pdf)
- **Maine, guarding:** males "can spend weeks guarding the eggs and juvenile bass" — [MDIFW smallmouth page](https://www.maine.gov/ifw/fish-wildlife/fisheries/species-information/smallmouth-bass.html)
- **Canada:**
  - Populations spawn over 6–10 days, from late May to early July.
  - Nests are started at 12.8–20.0 °C; most eggs are laid at 16.1–18.3 °C.
  - "Often 40% of the nests are failures"; successful nests yield about 2,000 fry.
  - Eggs hatch in 4–10 days at 5.6–5.9 mm. Fry rise about 12 days later at 8.7–9.9 mm and begin leaving the nest 5–7 days after that.

  — [Scott & Crossman part 7](https://waves-vagues.dfo-mpo.gc.ca/Library/52369_Pt7.pdf)
- **Embryo tolerances:**
  - Embryos develop normally at 13–25 °C; a cold snap can trigger a second spawning.
  - 42% of embryos survived more than 14 days at 4.4 ppm O₂ and 20 °C; none survived below 2.5 ppm (Siefert et al. 1974).

  — [USFWS HSI smallmouth](https://www.arlis.org/docs/vol1/AK_Heritage/FWS/OBS/82/FWS-OBS-82-10-36.pdf)
- **Spednic Lake, Maine–New Brunswick border** (Dudley & Trial 2014, implementing Shuter et al. 1980):
  - **Spawning trigger:** daily temperature above 15 °C and at most 27 °C, with more than 10 and fewer than 150 degree-days above 10 °C. A delay SD = 8.0 − 0.055·DD days is added.
  - **Modelled dates:** start median 28 May (range 22 May–4 June); end median 10 June. The spawning period averaged 12 days.
  - **Assumed** 15 days from fertilization to swim-up.
  - **Egg-to-fry mortality,** by the minimum daily temperature Tmin over those 15 days:

    | Tmin | Mortality probability |
    |---|---|
    | < 10 °C or > 30 °C | 1 |
    | 10–15 °C | 3.0 − 0.2·Tmin |
    | 15–27 °C | 0 |
    | 27–30 °C | 0.33·Tmin − 9 |

  - **Swim-up** at 9.1 mm.
  - **Daily growth (mm/day) by temperature T** (temperature-limited only):

    | T | Growth |
    |---|---|
    | < 14.2 °C or > 35 °C | 0 |
    | 14.2–25.5 °C | 0.12·T − 1.7 |
    | 25.5–31.5 °C | 1.4 |
    | 31.5–35 °C | 14 − 0.4·T |

  - **Winter days (WD):** days below 10 °C, averaging 208 ± 4 at Spednic.
  - **Survival thresholds:**
    - Cmax = 0.3375·WD + 22.083 mm (all fish longer survive);
    - Cmin = 0.1938·WD + 7.917 mm (all fish shorter die);
    - mortality in between = (Cmax − L)/(Cmax − Cmin).
    - At Spednic: Cmax ≈ 92 mm, Cmin ≈ 48 mm.
  - **Year-class failures** followed the cold, wet summers of 1986 and 1996.

  — [Dudley & Trial 2014](https://pubs.usgs.gov/sir/2014/5164/pdf/sir2014-5164.pdf)
- **Maine overwinter starvation:** Maine young-of-year face "approximately 200+ day" periods below 50 °F, which sets the species' limit in northern Maine — [MDIFW Black Bass Plan](https://www.maine.gov/ifw/docs/strategic-management-plans/blackbass.pdf)
- **Cost of guarding** (Lake Opinicon, ON):
  - Guarding males in the energetics model ate nothing; a 1,000 g smallmouth loses about 115 g over 22 days at 18 °C (largemouth 125 g).
  - Nesting raises respiration 17.6% in smallmouth and 52.6% in largemouth.

  — [Cooke, Philipp & Weatherhead 2002, Can. J. Zool. 80:756](https://www.fecpl.ca/wp-content/uploads/2002/05/EMG-Parental-Care-MS.pdf)

**Largemouth bass**
- **Maine:** spawning starts once water exceeds 60 °F (15.6 °C); eggs are laid at about 63 °F (17.2 °C); males guard eggs and fry "for several weeks"; temperature swings cause nests to be abandoned — [MDIFW Black Bass Plan](https://www.maine.gov/ifw/docs/strategic-management-plans/blackbass.pdf)
- **Canada:**
  - Nests start within a few days of a mean 15.6 °C; spawning at 16.7–18.3 °C.
  - In lakes with both, largemouth spawn slightly before smallmouth.
  - Eggs hatch in 3–5 days at about 3 mm; fry rise after 6–7 days at 5.9–6.3 mm; the brood stays together up to 31 days.

  — [Scott & Crossman part 7](https://waves-vagues.dfo-mpo.gc.ca/Library/52369_Pt7.pdf)
- **More detail** for Michigan and Minnesota lakes is in `largemouth_bass.md`: nests about 5,000 eggs, total care 2–5 weeks, nest success 45–77%.

**Pumpkinseed**
- **Ontario:** spawning at 17–26 °C, May–August — [Ontario database](https://www.ontariofishes.ca/fish_detail.php?FID=124)
- **Great Lakes temperatures:** spawning 20–29 °C (Brown 1974, a New York lake); 13–18 °C and 20–27.8 °C (Georgian Bay; Scheider et al. 1975). The OCR layout is partly scrambled, so the column assignment is uncertain — [Wismer & Christie 1987, GLFC Spec. Pub. 87-3](http://www.glfc.org/pubs/SpecialPubs/Sp87_3.pdf)
- **Thermal windows:** spawners 13–27.8 °C; embryos about 21–28.3 °C (Dahlke et al. dataset) — [ORNL compilation](https://hydrosource.ornl.gov/?p=732)
- **Nests and care:**
  - Nests sit in water under 1 m deep, in colonies of up to 15, 10–38 cm across.
  - Eggs hatch in 3–5 days.
  - Males may spawn repeatedly with one or several females; females may use several nests.
  - Care is by the male only (Holtan 1998, via DFO).

  — [DFO synopsis](https://waves-vagues.dfo-mpo.gc.ca/Library/337845.pdf)
- **Guarding duration:** the male guards eggs about 7 days and young until about 11 days after hatching, then re-nests — [FishBase summary, *L. gibbosus*](https://www.fishbase.se/summary/Lepomis-gibbosus.html)
- **Lake Opinicon, ON** (bluegill and pumpkinseed pooled): about 40% of larvae had reached open water by 12 June. Most autumn juveniles came from larvae produced after that date, and larva-to-juvenile survival was often highest above 23.5 °C (Garvey, Herra & Leggett 2002) — [QUBS project page](https://research.qubs.ca/projects/protracted-reproduction-in-sunfish-the-temporal-dimension-in-fish-recruitment-revisited)

**Redbreast sunfish**
- **New Brunswick** (Yoho and Oromocto lakes; Gautreau & Curry 2006):
  - Spawning late June–early July as water approaches 20 °C.
  - Nests 50.9 ± 10.1 cm across, in 43.2 ± 8.4 cm of water.
  - Guarding males 15.7–16.6 cm FL.

  — [COSEWIC ch. 6](https://www.canada.ca/en/environment-climate-change/services/species-risk-public-registry/cosewic-assessments-status-reports/redbreast-sunfish/chapter-6.html)
- **General:**
  - Most active spawning at 20–25 °C.
  - Fish move to the shallows above 16.7 °C.
  - Redbreast "appear to spawn only once during the summer" (a pers. comm. from Georgia, so weak).

  — [Aho et al. 1986](https://19january2017snapshot.epa.gov/www3/region1/npdes/merrimackstation/pdfs/ar/AR-783.pdf)

### Inferences
- **Male care durations for the sim:**
  - **Smallmouth:** about 25–35 days in total (derived by summing Scott & Crossman's stages; a [snippet] gives 4–6 weeks).
  - **Largemouth:** about 2–5 weeks.
  - **Pumpkinseed:** about 10–18 days per brood, with re-nesting, giving several broods per male per summer. That supports protracted May–August recruitment.
- **Smallmouth nest failure:** a base failure probability of about 40% (Scott & Crossman), plus Shuter's cold-snap mortality during the 15 days after fertilization, is well documented for Maine-like lakes.
- **Smallmouth overwinter threshold:** about 48–92 mm for a 208-day winter. Applied to measured Maine young-of-year (71–76 mm), it implies about 40% first-winter loss (derived; helper calculation). In the sim this belongs on young-of-year schools as length-dependent winter mortality.
- **Perch:** without a winter of 145+ days below 10 °C, perch should not spawn. This is irrelevant in Maine but a useful sanity check for the sim's thermal regime.

### Gaps
- Ice-out dates and spring warming rates for Maine lakes (needed to place these windows on a calendar). The search budget ran out before I could obtain them.
- The Post & Evans 1989 perch overwinter threshold (only a secondary 60 mm figure).
- Ridgway & Friesen 1992 nest-abandonment rates; spawning bouts per female for any centrarchid here.
- Pumpkinseed egg size and cuckolder frequency.
- Redbreast incubation time.
- The redbreast single-spawning claim is unverified.

---

## Q5. Diet shifts by size, and gape

### Takeaway
- **Pumpkinseed** switch from soft-bodied prey to snails at **about 59–80 mm SL** (≈ 74–99 mm TL) in snail-rich lakes, and a larger crushing muscle lets them switch smaller.
- **Yellow perch** go zooplankton → littoral benthos (amphipods, chironomids) → insects, crayfish and fish above about 120–150 mm.
- **Chain pickerel** in Maine turn strongly piscivorous after **7–9 in (18–23 cm)**.
- **Smallmouth** shift from plankton to insects by 20 mm, to fish and crayfish by 50 mm, and as adults eat mostly crayfish (60–90%).
- **Largemouth** start eating fish from **about 50 mm**.
- **Gape:** about 0.08·TL in pumpkinseed and bluegill, 0.10–0.12·TL in the basses.

### Cited Findings

**Pumpkinseed**
- **Snail shift, Three Lakes, Michigan:**
  - All fish under 59 mm SL ate mainly soft-bodied prey; fish over 80 mm SL ate mainly snails.
  - In snail-rich lakes the shift generally falls between about 50 and 80 mm SL (Mittelbach 1984; Osenberg et al. 1992).
  - Snail specialists had about twice the shell-crushing (levator posterior) muscle mass at a given size; the response is largely plastic.

  — [Mittelbach, Osenberg & Wainwright 1999, Evol. Ecol. Res. 1:111](https://fishlab.ucdavis.edu/wp-content/uploads/sites/397/2020/06/Mittelbach-et-al-1999.pdf)
- **Lake Opinicon, ON** (Keast 1978; 2,435 stomachs):
  - Cladocera mattered only for the very young.
  - Chironomid larvae were a staple; molluscs and isopods were major prey.
  - Diet overlap with bluegill was 0.52–0.57.

  — [QUBS project page](https://research.qubs.ca/projects/feeding-interrelations-between-agegroups-of-pumpkinseed-lepomis-gibbosus-and-comparisons-with-bruegil-l-mauochirus)
- **Gape and body depth** (mm; n = 6, a southern specimen set) — [Fernando et al. 2018](https://eaglehill.us/SENAonline/articles/SENA-17-2/20-Fernando.shtml):
  - gape = −1.249 + 0.083·TL;
  - body depth = −5.357 + 0.421·TL;
  - mean gape/SL 0.083.
  - Bluegill for comparison (n = 191): gape = −1.205 + 0.082·TL; depth = −11.334 + 0.455·TL.

**Redbreast sunfish**
- A generalist invertivore: aquatic insect nymphs, terrestrial insects, decapods and some fish. Larvae eat gape-limited zooplankton. No snail specialisation — [Aho et al. 1986](https://19january2017snapshot.epa.gov/www3/region1/npdes/merrimackstation/pdfs/ar/AR-783.pdf)
- Yoho Lake, NB: mainly caddisflies, ants, beetles, and young-of-year sunfish — [COSEWIC ch. 6](https://www.canada.ca/en/environment-climate-change/services/species-risk-public-registry/cosewic-assessments-status-reports/redbreast-sunfish/chapter-6.html)

**Yellow perch**
- **Diet sequence** (Ward & Robinson 1974; Kelso & Ward 1977):
  1. Larvae of about 6 mm eat nauplii, cyclopoids and cladocerans.
  2. Settled juveniles eat amphipods, ostracods and chironomids.
  3. Perch over 120 mm eat aquatic insects, fish and crayfish.

  — [USFWS HSI yellow perch](https://www.arlis.org/docs/vol1/AK_Heritage/FWS/OBS/82/FWS-OBS-82-10-55.pdf)
- **Lake Opinicon:**
  - Perch over 150 mm: decapods up to 70% and small fish up to 75% of stomach volume.
  - Perch feed 07:00–18:00 with little feeding at night, and feed actively all winter.

  — [Scott & Crossman part 8](https://waves-vagues.dfo-mpo.gc.ca/Library/52369_Pt8.pdf)

**Chain pickerel**
- **Maine:**
  - Juveniles eat mostly immature aquatic insects; the diet becomes "strongly piscivorous" after 7–9 in.
  - Prey: yellow perch, white perch, sunfish, minnows, smelt, plus crayfish, frogs and dragonfly nymphs.
  - Brandy Pond: stocked yearling brown trout were in 28% of stomachs.

  — [MDIFW pickerel assessment](https://www.maine.gov/ifw/docs/strategic-management-plans/pickerel.pdf)
- **Nova Scotia** (East River, 17 fish of 15–54 cm): 58.8% insects (mayflies, Odonata) and 11.7% fish — [Mitchell, LeBlanc & Heggelin 2010](https://www.ap.smu.ca/~lcampbel/impact-chain-pickerel.pdf)
- **Massachusetts** (isotope mixing model):
  - Pickerel ≤ 299 mm: crayfish 40–65%.
  - Pickerel ≥ 300 mm: bluegill and pumpkinseed dominate.

  — [Christensen, Favata & Bressette 2022, Urban Naturalist 56](https://www.eaglehill.us/urna-pdfs-regular/urna-056-Christensen.pdf)
- **[S] Florida:**
  - Zooplankton at 25–50 mm SL; no fish eaten below 50 mm SL; fish dominate from 135–150 mm SL.
  - Pickerel can swallow fish whose body depth is at most their own body depth (Lawrence 1960).

  — [Guillory 1981, SEAFWA Proc. 33:507](https://seafwa.org/sites/default/files/journal-articles/GUILLORY-507-517.pdf)

**Smallmouth bass**
- **Ontario** (Tester 1932a):
  - From plankton to insects by 20 mm; fish and crayfish become important by 50 mm.
  - Adults: crayfish 60–90% of volume, fish 10–30%, insects 0–10%; yellow perch is the most often identified fish prey.
  - Feeding begins in spring at 8.5 °C.

  — [Scott & Crossman part 7](https://waves-vagues.dfo-mpo.gc.ca/Library/52369_Pt7.pdf)
- **Maine:** adults eat fish, crayfish, frogs, newts and dragonflies — [MDIFW smallmouth page](https://www.maine.gov/ifw/fish-wildlife/fisheries/species-information/smallmouth-bass.html)
- **Gape** (n = 33): gape = −1.828 + 0.120·TL; body depth = −3.086 + 0.245·TL (mm); gape/SL 0.126 — [Fernando et al. 2018](https://eaglehill.us/SENAonline/articles/SENA-17-2/20-Fernando.shtml)

**Largemouth bass**
- **Lake Opinicon** (Keast & Webb 1966):
  - "Fishes enter in the diet from about 2 inches (50 mm)."
  - Over 80 mm: fish 50–90%, crayfish 10–40%.
  - Feeding is restricted below 10 °C.

  — [Scott & Crossman part 7](https://waves-vagues.dfo-mpo.gc.ca/Library/52369_Pt7.pdf)
- **Gape:**
  - gape = −0.888 + 0.101·TL (n = 156); body depth = −3.392 + 0.306·TL (Fernando et al.).
  - Lawrence 1958, piecewise by TL: 0.078·TL + 1.88 (31–99 mm) rising to 0.196·TL − 29.41 (400–499 mm).
  - Hill et al. 2004: −5.590 + 0.140·TL.

  — [Fernando et al. 2018](https://eaglehill.us/SENAonline/articles/SENA-17-2/20-Fernando.shtml)

### Inferences
- **Pumpkinseed snail switch in the sim:** a length threshold of about 7.5–10 cm TL, earlier where snails are abundant. It is a natural place to use the sim's snail resource.
- **Pumpkinseed vs bluegill as prey:** at 10 cm TL a pumpkinseed's body depth is about 37 mm (Fernando: −5.4 + 0.421·100), close to bluegill's 34 mm. A bass needs a gape of about 37 mm to swallow it head-first. By the Fernando gape equations that is about 32 cm TL for a smallmouth and about 38 cm for a largemouth. Hence the deep-bodied sunfish's escape from gape-limited bass by its second or third year.
- **Chain pickerel:**
  - Piscivory from about 18–23 cm in Maine; northern pickerel under 15 cm are insectivores.
  - A gape roughly equal to own body depth is consistent with the sim's pike treatment (gapeR ≈ depthR).

### Gaps
- No adult gape equation for yellow perch (larval only) or for chain pickerel; no prey-length/predator-length ratio for pickerel.
- Warner 1973, "Spring food of chain pickerel in Maine lakes" (TAFS 102:149), was not retrieved.
- No redbreast gape data.

---

## Q6. Thermal tolerance (preferred, optimum, UILT, CTmax), low-oxygen tolerance, and cold-season activity

### Takeaway
**Thermal limits** (UILT = upper incipient lethal temperature; CTmax = critical thermal maximum):

| Species | Key values | Rank |
|---|---|---|
| Yellow perch | UILT about 26–32 °C; CTmax about 35 °C; optimum growth about 25 °C; preferred about 18–24 °C | least heat-tolerant |
| Smallmouth bass | UILT about 35–36 °C; CTmax about 36–37 °C | — |
| Largemouth bass | UILT about 32–36 °C; CTmax about 37–40 °C | — |
| Pumpkinseed | UILT about 32–35 °C; CTmax 31 °C at 10 °C acclimation, 35 at 20, about 40.7 at 30 | warm-tolerant |
| Chain pickerel | one 28.4 °C lethal value at 17.7 °C acclimation; an unsourced 36.7 °C "UILT" | poorly known |
| Redbreast sunfish | — | essentially unmeasured |

**Under-ice oxygen.** Cooper & Washburn's 1946 Michigan field study gives the most usable thresholds:
- largemouth bass and bluegill tolerate down to about 0.6 mg/L;
- perch, mud pickerel (*Esox americanus*), pumpkinseed and northern pike down to about 0.3–0.4 mg/L.

Moore's 1942 caged-fish winter values are 2–5× higher and were rejected as unreliable by Doudoroff & Shumway.

**Winter activity.** Perch and pickerel feed actively under ice. Smallmouth go inactive at about 10 °C. Largemouth feed little below 10 °C but stay somewhat more active than smallmouth.

### Cited Findings

**Thermal metrics compiled by Hasnain et al. 2013** (CJFAS 70:964; species means, °C), extracted from the ORNL compilation — [ORNL thermal tolerance metrics (hydrosource)](https://hydrosource.ornl.gov/?p=732) ([xlsx](https://hydrosource.s3.us-east-2.amazonaws.com/files/data/datasets/GMLC_Thermal_Metrics/thermal_tolerance_metrics_freshwater_fish_v1.xlsx)); [Hasnain et al. 2013](https://doi.org/10.1139/cjfas-2012-0217)

| Species | Optimum growth temp. | Final preferendum | UILT | CTmax | Optimum spawning temp. | Optimum egg temp. |
|---|---|---|---|---|---|---|
| Pumpkinseed | 25.0 | 27.7 | 31.7 | 37.6 | 26.0 | 28.0 |
| Yellow perch | 25.4 | 17.6 | 25.6 | 35.0 | 9.1 | 15.0 |
| Chain pickerel | – | 25.5 | 36.7 | – | 9.7 | – |
| Smallmouth bass | 26.0 | 25.0 | 36.0 | 36.3 | 18.0 | 21.0 |
| Largemouth bass | 26.6 | 28.6 | 31.9 | 38.4 | 19.2 | 20.0 |

- Redbreast is absent from this table. Its only entry in the ORNL compilation is a spawner preferred temperature of 27.8 °C (Hardy 1978, via Dahlke et al.).
- **Spread of the individual estimates behind these means** (same compilation):
  - Pumpkinseed UILT 24.5–37.0 (n = 15) and preferendum 22.9–31.7 (n = 23).
  - Perch UILT 18.0–32.3 (n = 10), preferendum 5.4–27.0 (n = 33), optimum growth 23–28 (n = 4).

**CTmax by acclimation temperature** (Beitinger et al. 2000 table, via ORNL; °C):

| Species | Acclimation | CTmax | Source study |
|---|---|---|---|
| Pumpkinseed | 10 | 30.1 | Becker & Genoway 1979 |
| Pumpkinseed | 20 | 35.1 | Becker & Genoway 1979 |
| Smallmouth bass | 10 | 34.8 (onset of spasms) | Lutterschmidt & Hutchison 1997 |
| Smallmouth bass | 26 | 36.9 | Smale & Rabeni 1995 |
| Largemouth bass | 10 | 33.4 | Lutterschmidt & Hutchison 1997 |
| Largemouth bass | 20 | 36.7 | Smith & Scott 1975 |
| Largemouth bass | 26 | 36.3 | Smale & Rabeni 1995 |
| Largemouth bass | 28 | 40.1 | Smith & Scott 1975 |

— [ORNL compilation](https://hydrosource.ornl.gov/?p=732)

**Pumpkinseed, Lake Cromwell, Quebec** (7.3–8.1 cm TL; ramp about 0.3 °C/min):
- CTmax 31.20 ± 0.46 °C at 10 °C acclimation, about 40.66 °C at 30 °C; it rises about 0.47 °C per °C of acclimation.
- CTmin about 0.6 °C at 10 °C acclimation, rising to 8.66 °C at 30 °C acclimation.

— [Conservation Physiology 2024, coae015 (PMC11020239)](https://pmc.ncbi.nlm.nih.gov/articles/PMC11020239/)

**Pumpkinseed, Lake Monona, WI** (Neill & Magnuson 1974, as tabulated in the New England database):
- Behavioural optimum (body temperature): 27–29.1 °C by day, 28.5–32 °C at night.
- Upper avoidance temperature: 30.4 °C by day, 32.2 °C at night.
- Ultimate upper incipient lethal temperature: 37.5 °C.

— [Yoder 2012, MBI New England thermal tolerance database, Appendix A-1](https://www.vermontlaw.edu/sites/default/files/Assets/enrlc/cases/vermont-yankee/2012-05-25%20MBI%20Report%20Appendix.pdf) (the PDF layout is partly scrambled)

**Chain pickerel** — every thermal value is weakly sourced:
- **Lethal:** Cvancara et al. 1977 (Pennsylvania, adults acclimated to 17.7 °C): 24-h, 96-h and >96-h TL50 all 28.4 °C — [MBI appendix](https://www.vermontlaw.edu/sites/default/files/Assets/enrlc/cases/vermont-yankee/2012-05-25%20MBI%20Report%20Appendix.pdf)
- **Preference** (Coutant 1977, citing Reynolds unpublished): final preferendum 24 °C; avoidance 20–27 °C — [ORNL compilation](https://hydrosource.ornl.gov/?p=732)
- **Ontario database:** "tolerant of high temperature, 36.7 °C", with no source or endpoint; preferred range 21–30 °C — [Ontario database](https://ontariofishes.ca/fish_detail.php?FID=89)

**Yellow perch:**
- Preferred 17.6–25 °C; 19–24 °C optimal.
- Growth begins at 6–10 °C.
- Upper lethal 32.3 °C (Ferguson 1958); ultimate UILT 29.2–35 °C (Hokanson 1977).

— [USFWS HSI yellow perch](https://www.arlis.org/docs/vol1/AK_Heritage/FWS/OBS/82/FWS-OBS-82-10-55.pdf)

**Smallmouth bass:**
- Growth begins at 10–14 °C (Coble 1975).
- Preferred 21–27 °C in the field and 28–31 °C in the lab; fastest growth at 26–29 °C.
- At about 10 °C they become inactive and seek shelter; at 6–7 °C most are under rocks.
- Fry: lower lethal about 4 °C.

— [USFWS HSI smallmouth](https://www.arlis.org/docs/vol1/AK_Heritage/FWS/OBS/82/FWS-OBS-82-10-36.pdf)

**Largemouth bass:**
- Field preferendum 26.6–27.7 °C, lab 30–32 °C.
- Upper lethal ranges from 28.9 °C (acclimated to 20–21 °C) to 36.4 °C (acclimated to 30 °C).

— [Scott & Crossman part 7](https://waves-vagues.dfo-mpo.gc.ca/Library/52369_Pt7.pdf)

**Redbreast sunfish:**
- Preference and CTmax are "not well known for any life history stage". The inferred CTmax is about 36 °C; best growth about 25–30 °C.
- Observed in South Carolina reservoirs at 33–35 °C **[S]**.

— [Aho et al. 1986](https://19january2017snapshot.epa.gov/www3/region1/npdes/merrimackstation/pdfs/ar/AR-783.pdf)

**Low oxygen**
- **Cooper & Washburn 1946** (southern Michigan winterkills, 1944–45):
  - Heavy winterkills occurred only where DO fell to about 0.6 ppm or less.
  - The toleration threshold was about 0.6 ppm for largemouth bass and bluegill, and about 0.4 to 0.3 ppm for perch, mud pickerel, pumpkinseed, northern pike and chubsuckers.
  - Bullheads and golden shiners survived below 0.3–0.2 ppm.
  - At 0.3–0.1 ppm the kill was very heavy for largemouth, bluegill, pumpkinseed, perch and black crappie, but perch and mud pickerel survived well in some lakes.
  - They quote Moore's 1942 winter thresholds: largemouth and pike 2.3, perch 1.5, black crappie 1.4, pumpkinseed 0.9, bluegill 0.6, black bullhead 0.3 ppm.

  — [Cooper & Washburn 1946, Michigan IFR Report 1078](https://www2.dnr.state.mi.us/publications/pdfs/DNRFishLibrary/ResearchReports/RR1001-RR1100/RR1078.pdf)
- **Doudoroff & Shumway 1970:**
  - They "cannot accept as valid" Moore's 1942 thresholds (caged fish, sudden exposure), contrasting them with Cooper & Washburn's natural thresholds.
  - **Smallmouth** (4 g, declining O₂, 11–27 °C; Burdick et al. 1954): first deaths at 0.9–1.6 mg/L, 50% at 0.6–1.2, 100% at 0.5–1.0. Lethal levels rose about 40–62% from the lowest to the highest test temperature.
  - **Largemouth** (4–14 g, 25–35 °C; Moss & Scott 1961): 24-h tolerance limits 0.9–1.4 mg/L at constant O₂ and 0.8–1.2 mg/L under gradually declining O₂.
  - **Yellow perch:** Burdick, Dean & Harris 1957 measured lethal levels at 12–21 °C.

  — [Doudoroff & Shumway 1970, FAO Fish. Tech. Pap. 86](https://ir.library.oregonstate.edu/downloads/rv042t98q?locale=en) (catalogue: [FAO](https://www.fao.org/inland-fisheries/tools/detail/en/c/1149239))
- **Yellow perch:**
  - 0.2–1.5 mg/L is lethal in winter; below 3.1 mg/L is lethal at 26 °C (Moore 1942).
  - Growth falls at 2 mg/L; spawning is poor below 3 mg/L.

  — [USFWS HSI yellow perch](https://www.arlis.org/docs/vol1/AK_Heritage/FWS/OBS/82/FWS-OBS-82-10-55.pdf)
- **Smallmouth:** more than 6 ppm for best growth; fish die near 1 ppm at 20–25 °C — [USFWS HSI smallmouth](https://www.arlis.org/docs/vol1/AK_Heritage/FWS/OBS/82/FWS-OBS-82-10-36.pdf)
- **Largemouth:** avoids 1.5 mg/L or less and is prone to winterkill — [Scott & Crossman part 7](https://waves-vagues.dfo-mpo.gc.ca/Library/52369_Pt7.pdf)
- **Chain pickerel:**
  - No lethal DO found. Tolerates pH down to 3.8 (Lee et al. 1980) — [USGS NAS factsheet](https://nas.er.usgs.gov/queries/factsheet.aspx?SpeciesID=681)
  - Described as tolerant of low oxygen, with no number — [WV DNR](https://wvdnr.gov/plants-animals/sportfish/chain-pickerel/)
- **Redbreast:** no data; the habitat model assumes bluegill values (prolonged exposure below 1.0 mg/L is lethal) — [Aho et al. 1986](https://19january2017snapshot.epa.gov/www3/region1/npdes/merrimackstation/pdfs/ar/AR-783.pdf)

**Cold-season activity**
- **Yellow perch:** "active all winter under ice", in both shallow and deeper water — [Scott & Crossman part 8](https://waves-vagues.dfo-mpo.gc.ca/Library/52369_Pt8.pdf)
- **Chain pickerel, Maine:** ice-fishing catch was 1.18 per angler-day, against 0.49 in summer (1999 angler survey). Pickerel feed actively under ice — [MDIFW pickerel assessment](https://www.maine.gov/ifw/docs/strategic-management-plans/pickerel.pdf)
- **Smallmouth bass:**
  - In winter they gather near the bottom, are very inactive and eat little — [Scott & Crossman part 7](https://waves-vagues.dfo-mpo.gc.ca/Library/52369_Pt7.pdf)
  - In Maine, feeding and growth stop below 50 °F (10 °C) — [MDIFW Black Bass Plan](https://www.maine.gov/ifw/docs/strategic-management-plans/blackbass.pdf)
- **Largemouth bass:** in winter they move to the bottom and stay more active than smallmouth; ice anglers catch them in the northern US — [Scott & Crossman part 7](https://waves-vagues.dfo-mpo.gc.ca/Library/52369_Pt7.pdf)
- **Pumpkinseed:** foraging decreases in winter, especially below 15 °C — [DFO synopsis](https://waves-vagues.dfo-mpo.gc.ca/Library/337845.pdf)
- **Redbreast:** aggregates in deeper water below 5 °C (Breder & Nigrelli 1935) — [COSEWIC ch. 6](https://www.canada.ca/en/environment-climate-change/services/species-risk-public-registry/cosewic-assessments-status-reports/redbreast-sunfish/chapter-6.html)

### Inferences
- **Lethal O₂ under ice** (adopting Cooper & Washburn's natural thresholds):

  | Species | Threshold under ice |
  |---|---|
  | Pumpkinseed, perch, chain pickerel (via mud pickerel and pike) | about 0.3–0.4 mg/L |
  | Largemouth bass | about 0.6 mg/L |
  | Smallmouth bass | probably about 0.6–1.0 mg/L (no winter field data; summer lab 0.5–1.2 mg/L) |

  Summer acute lethal levels sit around 0.8–1.5 mg/L for the basses. The sim's convention of an acute lethal value at 25 °C × e^(0.055·(T − 25)) is consistent with this pattern.
- **Suggested `uilt` values** (sim field, °C):

  | Species | uilt | Basis |
  |---|---|---|
  | Pumpkinseed | 33–34 | species mean UILT 31.7, Monona UUILT 37.5; same as the current bluegill-based 34 |
  | Yellow perch | 29–30 | current value fine; Hokanson's ultimate UILT 29.2–35 |
  | Smallmouth bass | 35–36 | — |
  | Largemouth bass | 35–36 | current 35.5 |
  | Chain pickerel | about 29–31 | pike is 29.5 in the sim |

  The chain pickerel value is the most uncertain: the single 28.4 °C TL50 was measured at a low 17.7 °C acclimation, so the true ultimate value is higher. The unsourced 36.7 °C should not be used without a source.
- **Seasonal sequence:** the documented winter activity (perch and pickerel active, smallmouth torpid below 10 °C) is already implied by the FB4 Cmax curves (Q1 inferences).

### Gaps
- No measured CTmax or UILT with acclimation for chain pickerel; the source of the Ontario 36.7 °C is untraced.
- No redbreast thermal or DO measurements at all.
- No lethal DO for chain pickerel.
- No winter field threshold for smallmouth bass.
- Farwell et al. 2007 (pumpkinseed vs bluegill hypoxia tolerance) was not obtained.
- Beitinger et al. 2000 was used only through the ORNL extraction; it lists only two acclimation points for pumpkinseed.

---

## Q7. Natural mortality, maximum age in northern populations, and vulnerability as prey

### Takeaway
- **No direct northern estimate of natural mortality (M)** was found for any of the six species. M must come from longevity estimators.
- **Northern maximum ages:**

  | Species | Maximum age |
  |---|---|
  | Pumpkinseed | 9–12 yr (Ontario lakes mostly 5–9) |
  | Redbreast sunfish | 8 yr |
  | Yellow perch | 11 yr |
  | Chain pickerel | 9 (8–10) yr |
  | Smallmouth bass | about 15 yr in Canada; MDIFW cites about 20 yr for a 20-in Maine fish |
  | Largemouth bass | at least 15 yr (Lake Simcoe); MDIFW likewise about 20 yr |

- **Implied M** (Hamel & Cope 5.4/tmax to Then et al. 4.899·tmax^−0.916):

  | Species | M (per year) |
  |---|---|
  | Pumpkinseed | 0.45–0.65 |
  | Redbreast sunfish | about 0.68–0.73 |
  | Yellow perch | 0.49–0.55 |
  | Chain pickerel | 0.60–0.66 |
  | Smallmouth and largemouth bass | 0.27–0.41 |

- **Vulnerability as prey:** deep bodies and spines protect sunfish from gape-limited predators. Yellow perch are eaten by almost every predator despite their spines.

### Cited Findings

**Longevity estimators**
- **Then et al. 2015:** M = 4.899·tmax^−0.916, recommended as the best maximum-age estimator (cross-validated prediction error 0.32) — [Then, Hoenig, Hall & Hewitt 2015, ICES JMS 72:82](https://pubs.usgs.gov/publication/70129652)
- **Hamel & Cope 2022:** M = 5.4/tmax (Fisheries Research 256:106477); recommended where reasonable estimates of maximum age exist — [Hamel & Cope 2022 (SEDAR76 RD15)](https://sedarweb.org/documents/sedar76rd15_development-and-considerations-for-application-of-a-longevity-based-prior-for-the-natural-mortality-rate-pdf)

**Maximum ages**
- **Pumpkinseed:**
  - Ontario populations: Crosson 6, Opinicon 7, Lower Dowsley 5, Plastic 6, Upper Beverly 9, Upper Poole 5, one "Ontario" row 10; Lac Vert, QC 6 — [FishBase PopChar](https://www.fishbase.se/popdyn/PopCharList.php?ID=3372&GenusName=Lepomis&SpeciesName=gibbosus&fc=302)
  - Maximum reported age 12 — [FishBase summary](https://www.fishbase.se/summary/Lepomis-gibbosus.html)
  - The only FishBase M (0.54 at 25.5 °C) sits on a mislabelled row (Spain / "Mid Lake, WI"); do not use it — [FishBase PopChar](https://www.fishbase.se/popdyn/PopCharList.php?ID=3372&GenusName=Lepomis&SpeciesName=gibbosus&fc=302) (helper report)
- **Redbreast sunfish:** maximum 8 yr; average lifespan 4–5 yr — [Aho et al. 1986](https://19january2017snapshot.epa.gov/www3/region1/npdes/merrimackstation/pdfs/ar/AR-783.pdf)
- **Yellow perch:**
  - Usually 9–10 yr in Canada and the northern US — [USFWS HSI yellow perch](https://www.arlis.org/docs/vol1/AK_Heritage/FWS/OBS/82/FWS-OBS-82-10-55.pdf)
  - Oldest recorded: a Lake Erie female aged 11+ at 310 mm — [Scott & Crossman part 8](https://waves-vagues.dfo-mpo.gc.ca/Library/52369_Pt8.pdf)
- **Chain pickerel:**
  - 9 yr — [FishBase summary](https://www.fishbase.se/summary/Esox-niger.html); [AnAge](https://genomics.senescence.info/species/entry.php?species=Esox_niger)
  - 8–10 yr — [Ontario database](https://ontariofishes.ca/fish_detail.php?FID=89)
  - MDIFW notes that low harvest leads to "large losses of pickerel due to natural mortality", without a rate — [MDIFW pickerel assessment](https://www.maine.gov/ifw/docs/strategic-management-plans/pickerel.pdf)
- **Smallmouth bass:**
  - About 15 yr in Canada; a McCauley Lake female was 13 yr old and 584 mm FL — [Scott & Crossman part 7](https://waves-vagues.dfo-mpo.gc.ca/Library/52369_Pt7.pdf)
  - Fish over 7 yr are uncommon — [USFWS HSI smallmouth](https://www.arlis.org/docs/vol1/AK_Heritage/FWS/OBS/82/FWS-OBS-82-10-36.pdf)
  - Maine: a 20-in bass "may be around 20 years old" — [MDIFW smallmouth page](https://www.maine.gov/ifw/fish-wildlife/fisheries/species-information/smallmouth-bass.html)
- **Largemouth bass:**
  - Lake Simcoe fish reach 15+ yr — [Scott & Crossman part 7](https://waves-vagues.dfo-mpo.gc.ca/Library/52369_Pt7.pdf)
  - Maine: same 20-in / about 20-yr statement — [MDIFW largemouth page](https://www.maine.gov/ifw/fish-wildlife/fisheries/species-information/largemouth-bass.html)

**Vulnerability as prey**
- **Yellow perch:** almost all warm- and cool-water predators eat perch, adults included; bird predators include gulls, mergansers, loons and kingfishers — [Scott & Crossman part 8](https://waves-vagues.dfo-mpo.gc.ca/Library/52369_Pt8.pdf)
- **Smallmouth diet:** yellow perch is the fish most often identified in Ontario smallmouth stomachs — [Scott & Crossman part 7](https://waves-vagues.dfo-mpo.gc.ca/Library/52369_Pt7.pdf)
- **Pumpkinseed:**
  - Deep, narrow body; 10–11 dorsal spines; 3 anal spines.
  - Largemouth predation on pumpkinseed "ceases at around 7.0 cm" (Ohanjanian 1988; Arendt & Wilson 1999). This is surprisingly small and should be treated with caution.

  — [DFO synopsis](https://waves-vagues.dfo-mpo.gc.ca/Library/337845.pdf)
- **Chain pickerel as prey:** largemouth bass are believed to be serious predators of young-of-year pickerel in Maine weed beds, and pickerel decline where bass establish — [MDIFW pickerel assessment](https://www.maine.gov/ifw/docs/strategic-management-plans/pickerel.pdf)
- **Chain pickerel as predator in Maine:** a common predator of stocked salmonids. In the late 1960s it was the most common predator of newly stocked salmon, and salmon smolts were in 21% of pickerel over 10 in at Beddington Lake — [MDIFW pickerel assessment](https://www.maine.gov/ifw/docs/strategic-management-plans/pickerel.pdf)
- **Redbreast predators** in New Brunswick are likely chain pickerel, smallmouth bass, brown bullhead and American eel — [COSEWIC ch. 6](https://www.canada.ca/en/environment-climate-change/services/species-risk-public-registry/cosewic-assessments-status-reports/redbreast-sunfish/chapter-6.html)

### Inferences
- **M from maximum age** (derived; Hamel & Cope → Then et al.):

  | Species | tmax used | M (per year) |
  |---|---|---|
  | Pumpkinseed | 9–12 | 0.60 → 0.45 (Hamel & Cope); 0.65 → 0.50 (Then) |
  | Redbreast sunfish | 8 | 0.68 / 0.73 |
  | Yellow perch | 11 | 0.49 / 0.55 |
  | Chain pickerel | 9 | 0.60 / 0.66 |
  | Smallmouth bass | 15–20 | 0.36–0.27 / 0.41–0.32 |
  | Largemouth bass | 15–20 | 0.36–0.27 / 0.41–0.32 |

  The sim currently uses M 0.54 for sunfish, 0.50 for perch and 0.40 for bass. These fall inside or near these ranges.
- **Chain pickerel** is shorter-lived and faster-turnover than pike (the sim's pike M is 0.30). Its M should be about twice pike's.
- **Pumpkinseed vulnerability:** a deep-bodied, spiny pumpkinseed should carry a low prey-vulnerability score like the sim's bluegill (0.35). Above about 10 cm TL, Maine's gape-limited predators can barely take it; Q5 shows a bass needs about 32–38 cm TL for a 10 cm pumpkinseed.

### Gaps
- No direct estimate of M (from tagging or catch curves of unexploited stocks) for any of the six species in northern waters. Beamesderfer & North 1995 (bass) was not retrieved.
- No study quantifying how perch or pumpkinseed spines lower predator capture success (for example, predator capture or rejection rates on spiny vs soft-rayed prey). The sim's current `vuln` values remain priors.
- The size at which largemouth stop eating pumpkinseed (7 cm, DFO synopsis) is unverified.
