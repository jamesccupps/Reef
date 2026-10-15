# Life-history and bioenergetics parameters: white sucker, golden shiner, brown bullhead, brook trout, white perch (with brief notes on fallfish and banded killifish)

Scope: values for a Fish Bioenergetics 4.0 (FB4 / Wisconsin model) simulation plus life-history tables. Northern (Maine, New England, Ontario, Quebec) populations are preferred. Every value names its population and source where one was available. Searched 2026-10-15.

Unit conventions used below: FB4 consumption parameters are in g prey / g fish / day; respiration RA is in g O2 / g fish / day; energy density (ED) is in J / g wet mass; temperatures are in °C. Ontario log10 length–weight regressions use TL in mm and W in g. I checked this by back-calculating the database's own adult size/weight ranges (see Inferences).

## 1. FB4 parameter sets: brown bullhead and brook trout (official), and white sucker, golden shiner and white perch (no official set, so surrogates)

### Takeaway
The official FB4 table (`Parameters_official.csv`) has full sets for **brook trout** (Hartman & Sweka 2001; Hartman & Cox 2008) and **brown bullhead** ("Hartman et al. 2017"). It has **no set for white sucker, golden shiner or white perch**, and no Catostomidae, Notemigonus or Morone americana row at all. The defensible surrogates already in FB4 are:
- **white perch:** its congener striped bass (Hartman & Brandt 1995), or yellow perch (Kitchell et al. 1977);
- **golden shiner:** the northern-Quebec "Dace" set (He 1986; Trudel & Boisclair 1994), or fathead minnow (Duffy 1998);
- **white sucker:** no close analogue; a cool-water percid or coregonid curve, flagged.

### Cited Findings

#### Official FB4 rows (verbatim values from the file)
- The FB4 official parameter file lives at the repo root (`Parameters_official.csv`, branch `master`). Its column order is: Species, Sci_Name, Family, Order, LifeStage, Source, CEQ, CA, CB, CQ, CTO, CTM, CTL, CK1, CK4, REQ, RA, RB, RQ, RTO, RTM, RTL, RK1, RK4, RK5, ACT, BACT, SDA, EGEQ, FA, FB, FG, EXEQ, UA, UB, UG, PREDEDEQ, ED, Alpha1, Beta1, Cutoff, Alpha2, Beta2 — [FB4 repo](https://github.com/jim-breck/FB4); [Parameters_official.csv](https://raw.githubusercontent.com/jim-breck/FB4/master/Parameters_official.csv)
- **Brook trout (juvenile & adult), *Salvelinus fontinalis*.** Source: "Elliot 1976; Hartman and Sweka 2003; Hartman and Cox 2008" — [Parameters_official.csv](https://raw.githubusercontent.com/jim-breck/FB4/master/Parameters_official.csv)
  - Consumption: CEQ=3, CA=0.3013, CB=−0.3055, CQ=7.274, CTO=20.9, CTM=21, CTL=24.05, CK1=0.5, CK4=0.203.
  - Respiration: REQ=2, RA=0.0132, RB=−0.265, RQ=4.5, RTO=20.2, RTM=25, RTL/RK1/RK4/RK5=NA, ACT=2.89, BACT=NA, SDA=0.172.
  - Egestion: EGEQ=2, FA=0.212, FB=−0.222, FG=0.631.
  - Excretion: EXEQ=2, UA=0.0314, UB=0.58, UG=−0.299.
  - Energy density: PREDEDEQ=1, and the ED field reads "4162 to 10871".
- **Brown bullhead (juvenile and adult), *Ameiurus nebulosus*.** Source: "Hartman et al. 2017" — [Parameters_official.csv](https://raw.githubusercontent.com/jim-breck/FB4/master/Parameters_official.csv)
  - Consumption: CEQ=3, CA=0.12, CB=−0.225, CQ=15, CTO=24, CTM=26, CTL=30, CK1=0.473, CK4=0.55.
  - Respiration: REQ=1, RA=0.0007, RB=−0.271, RQ=0.0915, RTO=0.4055, RTM=0, RTL=0, RK1=1, RK4=0, RK5=0, ACT=1, BACT=0, SDA=0.172.
  - Egestion and excretion: EGEQ=1, FA=0.2; EXEQ=1, UA=0.07.
  - Energy density: PREDEDEQ=1, ED=6700.

#### Where the bullhead and brook trout sets come from
- The bullhead set's development is documented only as conference work: a 2011 AFS poster (Porto, Hartman et al.).
  - They measured temperature-dependent metabolism, growth and consumption on fish of 2.5–130.7 g at 10–30 °C.
  - Maximum consumption and growth peaked between 20 and 25 °C.
  - The data were combined with published data in Fish Bioenergetics 3.0 — [AFS 2011 P-197](https://afs.confex.com/afs/2011/webprogram/Paper7183.html)
- A 2015 AFS talk by Hartman, "Bioenergetics of Brown Bullheads in a Changing Climate", describes the model as built from lab consumption and metabolism data and validated by independent lab experiments — [AFS 2015 abstract](https://afs.confex.com/afs/2015/webprogram/Paper21784.html)
- Brook trout:
  - Hartman & Sweka (2001, SEAFWA) built the Appalachian brook trout model.
  - Their lab validation estimated growth within −1.4% and underestimated consumption by −19.7% (±7.5%) — [SEAFWA 2001](https://seafwa.org/journal/2001/development-bioenergetics-model-appalachian-brook-trout)
  - Hartman & Cox (2008), "Refinement and Testing of a Brook Trout Bioenergetics Model", appeared in TAFS 137:357–363 (DOI 10.1577/T05-243.1) — [TAFS 137(1)](https://academic.oup.com/tafs/issue/137/1)
  - A 2025 Quebec brook charr paper says the refinement re-fit metabolism and activity, because the earlier version had assumed other charr's gastric evacuation rates (which are lower in brook charr) — [Chalifoux et al. 2025](https://semaphore.uqar.ca/3220/1/Virginie_Chalifoux_et_al_fevrier2025.pdf)

#### Surrogate rows in FB4 (verbatim values)
- **Striped bass (adult)**, Hartman & Brandt 1995 — [Parameters_official.csv](https://raw.githubusercontent.com/jim-breck/FB4/master/Parameters_official.csv)
  - Consumption: CEQ=3, CA=0.3021, CB=−0.2523, CQ=7.4, CTO=15, CTM=28, CTL=30, CK1=0.323, CK4=0.85.
  - Respiration: REQ=1, RA=0.0028, RB=−0.218, RQ=0.076, RTO=0.5002, RTM=0, RTL=0, RK1=1, RK4=0, RK5=0, ACT=1, BACT=0, SDA=0.172.
  - Egestion and excretion: FA=0.104 (EGEQ 1), UA=0.068 (EXEQ 1). ED=6488.
  - The age-0 row differs: CQ=2.6, CTO=21.6, CTM=22.7, CTL=28.3, CK1=0.047, CK4=0.713; RA=0.001456, RB=−0.2702, RQ=0.08339, RTO=0.9014; ED=5023.
  - The age-1 row has CQ=6.6, CTO=19, CK1=0.262; the age-2 row has CTO=18, CTM=29, CTL=32, CK1=0.255, CK4=0.9.
- **Yellow perch (adult)**, Kitchell et al. 1977. The juvenile row is identical except CTO=29, CTM=32, RTO=32, RTM=35 — [Parameters_official.csv](https://raw.githubusercontent.com/jim-breck/FB4/master/Parameters_official.csv)
  - Consumption: CEQ=2, CA=0.25, CB=−0.27, CQ=2.3, CTO=23, CTM=28.
  - Respiration: REQ=2, RA=0.0108, RB=−0.2, RQ=2.1, RTO=28, RTM=33, ACT=1, SDA=0.15.
  - Egestion: EGEQ=2, FA=0.158, FB=−0.222, FG=0.631.
  - Excretion: EXEQ=2, UA=0.0292, UB=0.58, UG=−0.299. ED=4186.
- **Dace (adult & juvenile, *Phoxinus* spp.)**, He 1986 and Trudel & Boisclair 1994 — [Parameters_official.csv](https://raw.githubusercontent.com/jim-breck/FB4/master/Parameters_official.csv)
  - Consumption: CEQ=2, CA=0.36, CB=−0.31, CQ=2.3, CTO=26, CTM=29.
  - Respiration: REQ=2, RA=0.0148, RB=−0.2, RQ=2.1, RTO=29, RTM=32, ACT=1, SDA=0.15.
  - Egestion and excretion: FA=0.4 (EGEQ 1), UA=0.1 (EXEQ 1). ED=5522.
- **Fathead minnow**, Duffy 1998 — [Parameters_official.csv](https://raw.githubusercontent.com/jim-breck/FB4/master/Parameters_official.csv)
  - Consumption: CEQ=2, CA=0.149, CB=−0.242, CQ=2.4, CTO=24, CTM=30.
  - Respiration: REQ=2, RA=0.0096, RB=−0.041, RQ=2.6, RTO=28, RTM=33, ACT=1, SDA=0.172.
  - Egestion and excretion: FA=0.1 (EGEQ 1), UA=0.1 (EXEQ 1). ED=4100.
- **Roach**, Karjalainen et al. 1997 — [Parameters_official.csv](https://raw.githubusercontent.com/jim-breck/FB4/master/Parameters_official.csv)
  - Consumption: CEQ=1, CA=0.043, CB=−0.382, CQ=0.0935.
  - Respiration: REQ=1, RA=0.00101, RB=−0.1273, RQ=0.1188, SDA=0.15.
  - Egestion and excretion: FA=0.2, UA=0.05. ED=NA.
- **Lake whitefish (adult)**, Madenjian et al. 2006 — [Parameters_official.csv](https://raw.githubusercontent.com/jim-breck/FB4/master/Parameters_official.csv)
  - Consumption: CEQ=2, CA=1.61, CB=−0.32, CQ=3.53, CTO=16.8, CTM=26.
  - Respiration: REQ=1, RA=0.00085, RB=−0.12, RQ=0.047, RTO=0.025, RK1=1, ACT=1, SDA=0.17.
  - Egestion and excretion: FA=0.25, UA=0.1.
  - Energy density: PREDEDEQ=2, with Alpha1=5211, Beta1=2.543, Cutoff=886.3, Alpha2=7192, Beta2=0.3078.
- A USGS lab evaluation of a lake whitefish bioenergetics model found it overestimated consumption by about 61% and underestimated growth by about 16%. The likely cause was overestimated respiration; after adjusting respiration, predictions came within 5–9% — [USGS](https://www.usgs.gov/publications/evaluation-a-lake-whitefish-bioenergetics-model)
- The FB4 species list contains no white sucker, no golden shiner and no white perch. The only Moronidae are striped bass (larvae, age-0, age-1, age-2, adult) and white bass (larvae) — [Parameters_official.csv](https://raw.githubusercontent.com/jim-breck/FB4/master/Parameters_official.csv)

#### Measured physiology for the species without sets
- **Golden shiner** (cultured, mean ~5.3 g), swim-tunnel respirometry:
  - standard metabolic rate 131.22 mg O2/kg/h;
  - minimum total cost of transport 0.36 cal/g/km at 40 cm/s, and net cost 0.085 cal/g/km — [Beecham et al. 2009, NAJA](https://onlinelibrary.wiley.com/doi/10.1577/A07-079.1)

  The test temperature was not visible in the abstract.
- **White perch** (Chesapeake Bay juveniles, lab):
  - Hypoxia at ≤40% saturation raised routine metabolic rate up to 4-fold, cut growth 3-fold and consumption 2-fold.
  - Salinity 16 lowered consumption and energy density — [Hanks & Secor 2011, Mar Biol 158:805–815](https://link.springer.com/article/10.1007/s00227-010-1608-0)
- **White perch maximum consumption** (University of Maryland Sea Grant student project, Behr 1993):
  - Cmax per gram declines with weight and rises with temperature.
  - The highest value recorded was about 0.42 g/g/d, for young-of-year at 25.1 °C — [MDSG](https://www.mdsg.umd.edu/reu/students/peter-behr-university-miami)
- **White sucker energy density.** Whole-body bomb calorimetry gave about 5,585 J/g wet, rising with fish mass. This is a Colorado reservoir population (Blue Mesa / Lake Dillon), not a northern one — [ResearchGate figure](https://www.researchgate.net/figure/Measured-energy-densities-of-A-Arctic-Char-B-Brown-Trout-C-kokanee-D-Lake_fig2_318870863)

### Inferences

#### Reading the FB4 codes
- The equation-type codes follow standard FB3/FB4 conventions; check them against the `FB4_User_Guide.pdf` in the repo.
  - CEQ 2 is the Kitchell et al. (1977) warm-water curve: CTO = optimum and CTM = maximum.
  - CEQ 3 is the Thornton–Lessem (1978) cool/cold-water curve: CK1 of Cmax at CQ, ~0.98 between CTO and CTM, falling to CK4 at CTL.
  - CEQ 1 is exponential, with no high-temperature decline.
  - REQ 1 is exponential in T with an activity term exp(RTO·VEL). REQ 2 is the Kitchell form, peaking at RTO and reaching 0 at RTM.
  - EGEQ/EXEQ 1 are constant fractions. EGEQ/EXEQ 2 are the Elliott (1976) temperature- and ration-dependent forms.
- **Bullhead activity is effectively a constant ×1.5.** With RK1=1, RK4=0, RK5=0 and RTL=0, VEL=1, so the activity multiplier is exp(0.4055) = 1.500.
  - Example: a 100 g bullhead at 20 °C respires 0.0007·100^−0.271·e^(0.0915·20)·1.5 ≈ 0.0019 g O2/g/d (≈78 mg O2/kg/h).
- **The bullhead Cmax curve is very warm-shifted.** It is 47% of maximum at 15 °C, at maximum from 24 to 26 °C, and still 55% of maximum at 30 °C.
  - Cmax(100 g) ≈ 0.12·100^−0.225 ≈ 0.043 g/g/d.
  - That is low per gram, which fits a sluggish benthic ictalurid.
- **The brook trout Cmax curve** is 50% of maximum at 7.3 °C, peaks from 20.9 to 21 °C, and drops to 20% of maximum by 24.05 °C. Respiration peaks at 20.2 °C, goes to 0 at 25 °C, and is multiplied by ACT 2.89.
  - Cmax(100 g) ≈ 0.074 g/g/d.
  - This lab (Appalachian) curve peaks well above the 13–16 °C growth optimum (Section 5), because growth = Cmax − costs and the costs rise steeply.
- **The brook trout ED field "4162 to 10871" is not a usable constant.** Use a size- or season-dependent ED, or a typical salmonid ~4,500–6,000 J/g wet. That range is my assumption, not from a source.
- **White perch → striped bass (Hartman & Brandt 1995) is the most defensible surrogate:**
  - same genus (congener);
  - Morone thermal physiology;
  - a size-staged set (larvae, age-0, age-1, age-2, adult).

  Scale its CA down if simulated white perch overshoot observed growth. Stunted Maine populations show food, not physiology, limits them (Section 2).
- **Golden shiner → the "Dace" set (Trudel & Boisclair 1994) is the best northern small-cyprinid surrogate:**
  - It comes from Quebec lakes.
  - Cmax peaks at 26 °C, consistent with golden shiner spawning at 20–27 °C and tolerating ~35 °C.
  - Cmax(10 g) ≈ 0.36·10^−0.31 ≈ 0.18 g/g/d.

  Fathead minnow (CTO 24, CTM 30, ED 4100) is the alternative. Avoid roach: its CEQ 1 has no thermal ceiling.
- **The golden shiner SMR is a usable check value.** Beecham's SMR (0.131 mg O2/g/h ≈ 0.0031 g O2/g/d for 5.3 g fish) is roughly half the fathead set's 20 °C respiration (≈0.0055 g O2/g/d at 5.3 g). Calibrate a shiner RA against it, after checking the test temperature.
- **White sucker has no good FB4 analogue.**
  - Lake whitefish is benthic but cold-water (CTO 16.8). Its CA=1.61 looks anomalously high (Cmax(100 g) ≈ 0.37 g/g/d) and it overestimates consumption in validation.
  - A Kitchell CEQ-2 curve shaped from yellow perch (CTO ~22–23, CTM ~28) better matches the sucker's 17–24 °C preferred range (Section 5).
  - Use ED ≈ 5,000–5,600 J/g.
  - All of this is inference; flag it as uncalibrated.

### Gaps
- I could not find a peer-reviewed publication for the FB4 "Hartman et al. 2017" brown bullhead set. Only the 2011 and 2015 AFS abstracts surfaced, so the equations' lab basis can't be inspected here.
- I could not access the Hartman & Cox (2008) full text, so I couldn't confirm what the brook trout ED range represents.
- I found no published bioenergetics model, Cmax or respiration curve for **white sucker**.
- I found no published bioenergetics model or Cmax curve for **golden shiner**. Beecham et al. give SMR only, at unknown temperature.
- I found no published white perch bioenergetics model. Kerr & Secor's Patuxent work may contain one, but I could not confirm its parameter source (striped bass?).
- I found no white perch or golden shiner energy-density values. Hartman & Brandt (1995, TAFS 124:347) on estimating fish energy density likely includes white perch, but I could not access it.

## 2. Length–weight, length-at-age, maximum size and age, natural mortality

### Takeaway
- **Length–weight:** usable regressions exist for white sucker and brown bullhead (Ontario database) and golden shiner (FishBase Bayesian). The white perch FishBase relation looks too light by about 2×, and I found no brook trout regression.
- **Growth:** Maine data exist for brook trout (age-3 lake mean 13.3 in) and white perch (stunting; age 6 only 4 in in bad waters).
- **Natural mortality:** almost no direct estimates; treat it as a gap.

### Cited Findings

#### Length–weight
- **White sucker (Ontario):** log10 W = −5.3314 + 3.1361·log10 TL. Adults are 25.4–50.8 cm TL and 0.2–1.4 kg; maximum 64.0 cm TL and 4.11 kg; Ontario record 61.0 cm, 2.65 kg; lifespan 15–25 yr — [Ontario Freshwater Fishes LHD](https://www.ontariofishes.ca/fish_detail.php?FID=19)
- **White sucker (Pueblo Reservoir, Colorado):** an alternative regression lists intercept −4.755 and slope 2.940. Its units and origin are unclear and it is not a northern population — [Pueblo Reservoir paper](https://arxiv.org/pdf/1305.1152)
- **Brown bullhead (Ontario):** log10 W = −5.1442 + 3.1077·log10 TL. Adults are 19.3–35.6 cm TL and 0.09–0.61 kg; maximum 55.0 cm and 3.35 kg; Ontario record 44.6 cm, 1.54 kg; lifespan 8–12 yr — [Ontario LHD](https://ontariofishes.ca/fish_detail.php?FID=77)
- **Golden shiner (FishBase Bayesian LWR):** a = 0.01023 (0.00679–0.01543), b = 3.07 (2.95–3.19), with TL in cm and W in g.
  - Maximum 32.0 cm TL; common length 14.4 cm; maximum reported age 9 yr; Lm 6.4 cm.
  - Resilience is medium: doubling time 1.4–4.4 yr, with tm=2, tmax=9 — [FishBase](https://www.fishbase.se/summary/Notemigonus-crysoleucas.html)
- **White perch (FishBase Bayesian LWR, based on family/body-shape priors):** a = 0.00447 (0.00184–0.01082), b = 3.13 (2.91–3.35), TL in cm.
  - Maximum 58.0 cm TL (likely an estuarine record); common length 13.5 cm; maximum weight 2.7 kg; maximum age 16 yr.
  - Resilience is low, with K = 0.07–0.13 — [FishBase](https://www.fishbase.se/summary/Morone-americana.html)

#### Growth and age
- **Brook trout, Maine:**
  - The statewide mean length at age 3 in lakes is 13.3 in (338 mm), ranging 7.5–17.5 in (190–445 mm) among lakes.
  - Age-3 trout from 38 streams (1959–62) averaged 7.8 in (198 mm).
  - Some high-elevation populations mature below 6 in (152 mm).
  - The most common age in lake catches is 3 yr (2 yr in streams); a few reach 4–6 yr.
  - Maine records include a 9-yr-old from Moosehead Lake (1961) and two 7-yr-olds from Chamberlain Lake.
  - The state record is 12.5 lb (Mooselookmeguntic, 1886) — [MDIFW, Biology & Management: Brook Trout](https://www.maine.gov/ifw/docs/Biology_and_Management.pdf)
- **Brook trout, Canada:** Scott & Crossman (as quoted by MDIFW) give age-3 brook trout in four Canadian lakes 6.8–15.2 in long — [MDIFW](https://www.maine.gov/ifw/docs/Biology_and_Management.pdf)
- **White perch, Maine:**
  - Average lifespan is 5–7 yr.
  - Overabundance stunts growth "so extreme that a 6-year-old perch may be only 4 inches long".
  - The perch occupy 514 Maine lakes totalling about 570,000 acres, and all populations are wild — [MDIFW White Perch Management Plan, 2002](https://www.maine.gov/ifw/docs/strategic-management-plans/whiteperch.pdf)
- **White perch:** a review cites a maximum age of 17 yr and TL 483 mm for a Maine white perch — [Virginia Tech thesis on invasive white perch](https://vtechworks.lib.vt.edu/server/api/core/bitstreams/8e7bf951-84ae-4a7e-9efe-42cb0efa708e/content)
- **Golden shiner:** maximum age 9 yr — [NJ DEP fact sheet](https://dep.nj.gov/njfw/wp-content/uploads/njfw/Golden-Shiner.pdf); [Fishing Ontario](https://www.couplesresort.ca/attractions/Articles/fish/GoldenShiner.html)
- **Brown bullhead:** maximum age 9 yr per FishBase; Missouri gives a 6–8 yr lifespan — [MDC](https://mdc.mo.gov/discover-nature/field-guide/brown-bullhead)
  - A Polish (invasive) population spans ages 1+ to 9+, with mean SL 14.4 ± 3.4 cm — [Sci Rep 2025](https://www.nature.com/articles/s41598-025-10597-8)

### Inferences
- **Units check on the Ontario regressions (TL mm, W g).** Using them on the database's own adult ranges reproduces its weights:
  - white sucker: 254 mm → 162 g and 508 mm → 1,428 g (stated 0.2–1.4 kg);
  - bullhead: 193 mm → 91 g and 356 mm → 610 g (stated 0.09–0.61 kg).

  So W(g) = 10^(a + b·log10 TL_mm).
- **The FishBase white perch LWR is probably too light.** It gives ~53 g at 20 cm TL, whereas an 8-inch white perch typically weighs ~110 g (my estimate, not sourced). Prefer fitting the white perch relation to Maine data, or borrowing the striped bass shape. Low confidence.
- **The FishBase golden shiner LWR looks right.** It gives ~42 g at 15 cm.
- **For the sim's L0 / length-at-age tables:**
  - brook trout in a Maine pond: age-3 ≈ 340 mm (lake) or ≈ 200 mm (stream);
  - white perch: highly density-dependent, so model growth as food-limited rather than hard-coding it.

### Gaps
- No **brook trout length–weight or Ws** equation was retrieved (Hyatt & Hubert's Ws is the usual standard, but not verified here).
- No **brown bullhead Ws** was verified. The Bister et al. 2000 Ws set for warmwater nongame species likely contains brown bullhead and white sucker, but its table was not accessible.
- A Quebec study reportedly proposes golden shiner Ws: log10 Ws = −5.593 + 3.302·log10 TL. It surfaced in search results, but I could not identify or verify the source page, so treat it as unconfirmed.
- No **von Bertalanffy parameters** were found for northern white sucker, golden shiner or bullhead.
- No **natural mortality (M)** estimates were found for any of the five species. Only indirect signals exist:
  - brook trout: "few surviving beyond 3 years" (MDIFW);
  - FishBase resilience classes.

## 3. Maturity, fecundity, and spawning temperature, timing and place

### Takeaway
- **White sucker:** spring stream runs (inlets, outlets, creeks) over gravel, starting near 10 °C and peaking about 11–15 °C. Matures at 2–4 yr. 12,500–140,000 eggs.
- **Golden shiner:** scatters adhesive eggs on plants or filamentous algae at about 20–27 °C over a prolonged season. Northern fish mature at 2–3 yr.
- **Brown bullhead:** nests under cover at 14–25 °C (most often around 18–21 °C, May–June) with parental guarding. 1,000–14,000 eggs.
- **Brook trout:** spawns late September–November over upwelling groundwater, mostly in streams but also on spring-fed pond shoals, as temperature falls below ~11 °C. Matures at 2+ to 3+.
- **White perch:** spawns in shallow water over any bottom at about 15 °C in May–June. 20,000–300,000 eggs.

### Cited Findings

#### White sucker
- **Ontario database:** spawns April–June at 10–20 °C in lacustrine and riverine habitat; a non-guarding open-substratum litho-pelagophil.
  - Fecundity 12,500–140,000.
  - Matures at 2–3 yr (males) and 3–4 yr (females) — [Ontario LHD](https://www.ontariofishes.ca/fish_detail.php?FID=19)
- **Spawning cue:** spawning begins near 10 °C — [DFO](https://www.dfo-mpo.gc.ca/species-especes/profiles-profils/white-sucker-meunier-noir-eng.html); [Vermont F&W](https://www.vtfishandwildlife.com/learn-more/vermont-critters/fish/white-sucker)
  - Vermont gives fecundity 36,000–139,000 adhesive eggs and maturity at 3–8 yr depending on location.
  - DFO gives 20,000–50,000 eggs.
- **Run peak:** Great Lakes lamprey-weir records show peak spawning migration of large white suckers at about 11–15 °C; smaller fish are less temperature-selective — [MSU thesis](https://d.lib.msu.edu/etd/15633/OBJ/download). This attribution comes from a search snippet; verify it.
- **Spawning habitat:** generally inlets, outlets, small creeks and rivers with swift, shallow water over gravel, at depths under 30 cm.
  - Velocity at spawning sites is 14–90 cm/s (citing Twomey et al. 1984, the FWS HSI model).
  - Spawning begins at 10 °C (citing Koster 1957) — [USFS white sucker species assessment](https://www.fs.usda.gov/rm/boise/AWAE/projects/fish_cattle/White%20sucker.pdf). This came via search snippet; the URL now redirects.
- **Run duration:** runs last about six weeks in spring, or into early summer farther north. Most fish are mature by age 3, males earlier — [ADW](https://www.animaldiversity.org/accounts/Catostomus_commersonii/)

#### Golden shiner
- **Spawning temperature and eggs:** spawns at 20–27 °C (Jones et al. 1978).
  - Eggs are adhesive, 1.0–1.4 mm, and hatch in 3–4 d at 17–24 °C.
  - Maturity from 7 months to 3 yr, with most maturing in the second year, at 50–70 mm.
  - Fecundity "up to 200,000" (Jones et al. 1978) — [Smithsonian NEMESIS](https://invasions.si.edu/nemesis/species_summary/163368)
- **Culture profile (southern):**
  - spawning at 68–80 °F (20–27 °C);
  - 10,000–20,000 eggs per female;
  - some fish mature at 7–8 months;
  - females grow larger than males — [Golden Shiner Culture: A Reference Profile](https://extension.rwfm.tamu.edu/wp-content/uploads/sites/8/2013/09/Golden-Shiner-Culture-A-Reference-Profile.pdf)
- **Per-season fecundity:** 2,700–4,700 sticky eggs per season (California) — [UC Davis CalFish](https://calfish.ucdavis.edu/species/?uid=55&ds=698)
- **Spawning substrate:** eggs are scattered over filamentous algae and rooted plants with no parental care. Eggs are sometimes dropped on largemouth bass nests. The season is prolonged with several spawning peaks (secondary sources) — [UC Davis CalFish](https://calfish.ucdavis.edu/species/?uid=55&ds=698); [Golden Shiner Culture profile](https://extension.rwfm.tamu.edu/wp-content/uploads/sites/8/2013/09/Golden-Shiner-Culture-A-Reference-Profile.pdf)
- **Ontario-area maturity:** adults mature at 2–3 yr; maximum age 9 — [Fishing Ontario](https://www.couplesresort.ca/attractions/Articles/fish/GoldenShiner.html)

#### Brown bullhead
- **Ontario database:** spawns May–June at 14–25 °C. Guarders, nest spawners, speleophils (nest in cavities). Fecundity 1,050–13,800. Matures at 2–3 yr — [Ontario LHD](https://ontariofishes.ca/fish_detail.php?FID=77)
- **New Hampshire:** spawns in late spring when water exceeds 65 °F (18 °C); both parents tend the nest — [NH Fish & Game](https://www.wildlife.nh.gov/fishing-new-hampshire/fish-species-nh/brown-bullhead)
- **Michigan:** in a 4-yr study (Blumer 1985), spawning peaked in the first 16 days of June.
  - Eggs hatched in up to 13 d, averaging 5.6 d.
  - Juveniles follow the adults in a compact school for several weeks.
  - Reproduction occurs at mean daily water temperatures of 14–29 °C.
  - Maturity at 3 yr — [ADW](https://animaldiversity.org/accounts/Ameiurus_nebulosus/)
- **Nests:** saucer-shaped, in sand, gravel or mud, under logs, rocks or roots in shallow water. One parent stays over the eggs continuously and fans them — [MDC](https://mdc.mo.gov/discover-nature/field-guide/brown-bullhead)
- **Invasive Polish population:** batch spawning from mid-April to mid-June. Mean absolute fecundity 3,227 oocytes, relative fecundity 46 oocytes/g. Some fish mature at 1+ — [Sci Rep 2025](https://www.nature.com/articles/s41598-025-10597-8)

#### Brook trout
- **Maine:**
  - Mature fish (typically II+ to III+) spawn in gravel over upwelling groundwater from late September to November, earliest at high elevations and northern latitudes.
  - Spawning is mostly in streams. Shore spawning succeeds in some ponds where spring-water inflows reach gravelly or sandy shallows.
  - Females lay 500–5,000 eggs depending on size.
  - Eggs overwinter in the gravel and hatch in early spring — [MDIFW](https://www.maine.gov/ifw/docs/Biology_and_Management.pdf)
- **Spawning temperature and incubation:** spawning occurs at 40–50 °F (4.4–10 °C); incubation takes at least 45 d; hatching runs February–April — [MDIFW species page](https://www.maine.gov/ifw/fish-wildlife/fisheries/species-information/brook-trout.html). This came from a search summary; the exact page wording is unverified.
- **Lake-spawning population (Ontario):** spawning spanned about 50 d. A ~15-d peak held 58% (1994) and 84% (1995) of all reproduction and coincided with water temperature falling below 11 °C and with rain — [Blanchfield & Ridgway 1997](https://www.harkness.ca/PDFs/Contributions%201990s/Blanchfield%20Ridgway%2097.pdf)
- **Groundwater at lake redds (9 Ontario lakes):**
  - Groundwater upwelling at redd sites is the general requirement.
  - Redds per lake ranged 1–53 (mean 30), mostly near shore.
  - Groundwater flow at redds averaged 20.0–107.9 mL·m⁻²·min⁻¹ by lake.
  - Sites used every year had stronger flow — [Ridgway & Blanchfield 1998](https://www.harkness.ca/PDFs/Contributions%201990s/Ridgway%20and%20Blanchfield%2098.pdf)
- **Female size and brood loss:** in a lake-spawning population, large females spawned earlier and dug deeper nests, and brood loss was lower (28–38%). Habitat-related egg survival reduced the fecundity advantage of large females — [Blanchfield & Ridgway 2005](https://www.harkness.ca/PDFs/Contributions%202000s/Blanchfield%20and%20Ridgway%202005.pdf)
- **Newfoundland ponds:** a mean of 236 eggs per female and a mean egg diameter of 3.23 mm — [MUN thesis (Lee)](https://research.library.mun.ca/10868/1/Lee_SH.pdf). The exact thesis attribution comes from search snippets.

#### White perch
- **Maine:**
  - Spawns mainly in spring at about 59–60 °F (15–15.6 °C), in shallow water over almost any bottom.
  - 20,000–300,000 eggs per female by size; a 6-inch (152 mm) female has about 22,000.
  - Eggs hatch in 4–5 d at 59–60 °F.
  - Year-class failures come only from major weather-induced mortality at spawning.
  - "Even small, slow-growing perch can mature and spawn successfully" — [MDIFW White Perch Plan](https://www.maine.gov/ifw/docs/strategic-management-plans/whiteperch.pdf)
- **New Hampshire:** spawning usually spans two weeks in May or June at about 60 °F (15 °C) — [NH Fish & Game](https://www.wildlife.nh.gov/fishing-new-hampshire/fish-species-nh/white-perch)
- **Landlocked populations:** spawn in both river and reservoir areas, moving from deep to shallow water at 15–20 °C.
  - Fecundity 20,000–150,000.
  - In fast-growing Nebraska reservoirs, maturity comes at age 1 and 102–127 mm TL — [VT thesis](https://vtechworks.lib.vt.edu/server/api/core/bitstreams/8e7bf951-84ae-4a7e-9efe-42cb0efa708e/content)
- **Maturity by sex:** fish stay immature until 2–4 yr, with males maturing at 72–80 mm and females at 90–98 mm — [ADW](https://animaldiversity.org/accounts/Morone_americana/); NJ gives males 2–3 yr and females 2–4 yr — [NJ DEP](https://dep.nj.gov/njfw/wp-content/uploads/njfw/White-Perch.pdf)

### Inferences
Sim calendar implications (year-fraction 0 = 1 March), with spawning places:

| Species | When | Temperature cue | Where |
|---|---|---|---|
| White sucker | mid-April to May | first rise past ~10 °C, peak 11–15 °C | out of the lake into inlet/outlet streams (or wave-swept gravel shoals where no stream exists) |
| White perch | late May–June | ~15 °C | lake shallows, any substrate |
| Brown bullhead | June | ~18–21 °C | nests under cover in the shallows, guarded through hatch (~6 d) and a few weeks of fry schooling |
| Golden shiner | June–August | above ~20 °C, multiple bouts | weed beds and algae; eggs hatch in 3–4 d |
| Brook trout | October–November | falling below ~11 °C (spawn 4–10 °C) | groundwater-upwelling gravel only; ≥45 d incubation, emergence in spring |

The brook trout constraint (upwelling gravel only) is a natural fit for a spring/seep habitat cell.

- **Fecundity scale** (rough per-female egg counts): sucker tens of thousands, perch tens to hundreds of thousands, shiner thousands to tens of thousands, bullhead a few thousand, brook trout hundreds to a few thousand.
- **Size-scaled fecundity.** A white perch scaling of ~22,000 at 152 mm, rising to ~300,000 for the largest fish, implies fecundity ∝ L^~3–4. That is my inference; there is no fitted equation.

### Gaps
- No **fecundity–length equations** were found for any of the five species in northern populations. Only ranges and point values are available.
- The number of **golden shiner spawning bouts per season in the north** is unknown. The "4–5 peaks" and "March–October" figures are southern or culture data.
- No Maine-specific dates were found for **white sucker runs**.
- No **egg-incubation degree-day** values were found for sucker, bullhead or perch, beyond the single-temperature hatch times above.

## 4. Diet by size

### Takeaway
- **White sucker:** larvae feed near the surface on plankton, then shift to benthic feeding (chironomids, microcrustaceans, detritus). It is a strong benthic competitor that pushes brook charr off benthic prey.
- **Golden shiner:** cladocera-dominated planktivore and omnivore (Daphnia, flying insects, chironomid pupae, filamentous algae).
- **Brown bullhead:** benthic omnivore.
- **Brook trout:** insects, becoming piscivorous only at about 250–300 mm.
- **White perch:** planktivore that becomes a generalist with size. Large perch eat small fish, including their own young. It switches to Daphnia whenever Daphnia are abundant.

### Cited Findings
- **White sucker:** trophic class invertivore/detritivore — [Ontario LHD](https://www.ontariofishes.ca/fish_detail.php?FID=19)
  - I found no white-sucker-specific study of the size at the larval switch to benthic feeding.
  - Related suckers in Upper Klamath Lake switch from planktonic to benthic prey (mostly chironomid larvae, chydorids, ostracods) at about 20–30 mm SL — [W. N. Am. Naturalist](https://scholarsarchive.byu.edu/wnan/vol66/iss4/11)
- **Golden shiner:** omnivorous, mainly plankton, insects and molluscs; trophic level 2.7 — [FishBase](https://www.fishbase.se/summary/Notemigonus-crysoleucas.html)
  - Diet includes zooplankton (especially Daphnia), small flying insects, benthic invertebrates, algae and occasionally small fishes — [NEMESIS](https://invasions.si.edu/nemesis/species_summary/163368)
  - A Keast & Webb (1966) diet summary gives cladocera to 90% by volume, flying insects 20% and chironomid pupae 30% (likely maxima by sample), with filamentous algae present — [Fishes of Texas](https://txstate.fishesoftexas.org/notemigonus%20crysoleucas.htm)
- **Brown bullhead:** trophic class invertivore/herbivore/carnivore, benthic — [Ontario LHD](https://ontariofishes.ca/fish_detail.php?FID=77)
- **Brook trout (Maine):**
  - The bulk of the diet is aquatic and terrestrial insects plus small fish.
  - Fish do not become important until 10–12 in (254–305 mm).
  - Small prey fish are often "more of a detriment to trout populations than a benefit", because they outcompete trout or eat juvenile trout — [MDIFW](https://www.maine.gov/ifw/docs/Biology_and_Management.pdf)
- **Brook charr and white sucker in 69 Quebec Shield lakes** (16 with white sucker): the share of charr that specialise on benthic prey fell from 41.3% (charr alone) to 19.7% (with creek chub) to 9.9% (with white sucker) — [Evol. Ecol. DOI 10.1023/A:1006530029418](https://dx.doi.org/10.1023/a:1006530029418). The authors were not verified; this is probably Bourke, Magnan & Rodríguez 1999.
- **White perch, Maine:** "Perch eat most small creatures that other fish eat, and large perch will eat most small fish including their own species" — [MDIFW](https://www.maine.gov/ifw/docs/strategic-management-plans/whiteperch.pdf)
  - Overabundant perch can deplete food and slow the growth of salmon, trout and bass — [MDIFW](https://www.maine.gov/ifw/docs/strategic-management-plans/whiteperch.pdf)
- **White perch, Lake Champlain (Missisquoi Bay) adults:**
  - ate large numbers of Daphnia when Daphnia exceeded 20 individuals/L and made up more than 50% of the zooplankton;
  - otherwise ate mostly benthic prey — [Couture & Watzin 2008, JGLR](https://bioone.org/journals/journal-of-great-lakes-research/volume-34/issue-3/0380-1330(2008)34[485:DOIAWP]2.0.CO;2/Diet-of-Invasive-Adult-White-Perch-Morone-americana-and-their/10.3394/0380-1330(2008)34[485:DOIAWP]2.0.CO;2.full)
- **White perch, Maine paleolimnology:**
  - White perch shift from strict planktivory to a generalist diet as they grow.
  - After white perch were introduced, cladoceran ephippia size rose by up to 50%, pointing to the piscivorous role as the main link to water quality — [UMaine thesis](https://digitalcommons.library.umaine.edu/etd/1140)

### Inferences
Diet tables by size for the sim:

| Species | Small fish | Larger fish |
|---|---|---|
| White sucker | <~25 mm: zooplankton (inferred from related suckers) | benthos and detritus (chironomids, ostracods, chydorids), with a high detritus share |
| Golden shiner | all sizes: Daphnia and cladocerans, emerging insects, algae; it eats plants, unusual among the sim's fish | larger adults (>~150 mm): a few larval fish |
| Brown bullhead | all sizes: benthic invertebrates (chironomids, crayfish, snails), plant and detrital matter, fish eggs and fish | — |
| Brook trout | <250 mm: insects, crustaceans, zooplankton (in lakes without benthic competitors) | >250–300 mm: adds fish |
| White perch | <~100 mm: zooplankton (Daphnia-preferring) | >~100–150 mm: adds benthos, then fish (smelt, young perch); cannibalism is real |

- **White sucker competition:** should displace brook trout from benthic prey (a niche-shift mechanism the sim can reproduce through `qPrey` competition).
- **White perch prey switching:** should be density-dependent on Daphnia, with a threshold near 20 per litre.

### Gaps
- The size threshold for the white sucker benthic shift was not found for the species itself.
- No golden shiner ontogenetic diet study from northern lakes was found.
- No length threshold was found for white perch piscivory in New England lakes.
- No quantitative brown bullhead diet-by-size data was retrieved.

## 5. Thermal and dissolved-oxygen tolerance, and summer refuges

### Takeaway
- **Brook trout:** the only truly cold-limited species here. Growth is optimal at 13–16 °C, slows above 16 °C, stress begins near 21–22 °C, and positive growth ends at 23.4 °C. Maine guidance is ≤20 °C for extended periods with O2 ≥5 mg/L.
- **White sucker:** cool-water, preferring 17–24 °C.
- **White perch:** warm-water, doing best where summer water reaches ≥24 °C. It is hypoxia-sensitive in growth and needs deep water that keeps O2 through winter.
- **Golden shiner:** warm-tolerant (to ~35 °C) and low-O2 tolerant.
- **Brown bullhead:** the extreme. Preferred 25–31 °C, tolerates 36 °C, upper lethal ~37.5 °C, and tolerates about 0.2 mg/L O2 by air-gulping and torpor, so it survives winterkill.

### Cited Findings

#### Brook trout
- **Lab growth limits:**
  - Growth slows above 16 °C and turns negative at 24 °C; the estimated upper limit for positive growth is 23.4 °C.
  - Cortisol rises 12× at 22 °C and 18× at 24 °C versus 16 °C; gill HSP70 rises 11× at 22 °C and 56× at 24 °C.
  - A daily 17–25 °C cycle cut growth 43% (length) and 35% (mass) relative to a constant 21 °C — [Chadwick & McCormick 2017, J Exp Biol 220:3976](https://pubs.usgs.gov/publication/70209864)
  - Earlier work identifies 13–16 °C as optimal for growth — [J Exp Biol PDF](https://cob.silverchair.com/jeb/article-pdf/220/21/3976/1900295/jeb161224.pdf)
- **Field stress onset:** stress markers rose at sites where mean daily temperature exceeded 21.0 °C, and brook trout densities were lowest at those sites — [Chadwick, Nislow & McCormick 2015](https://www.usgs.gov/publications/thermal-onset-cellular-and-endocrine-stress-responses-correspond-ecological-limits)
- **Maine guidance:**
  - The ideal upper temperature is often cited as 68 °F (20 °C), but the trout inhabit water up to 75 °F (24 °C).
  - Brook trout "can usually survive and grow" if water does not exceed 68 °F for extended periods and O2 stays at 5 ppm or above.
  - Eggs depend on groundwater flow through the gravel for oxygen and to avoid freezing — [MDIFW](https://www.maine.gov/ifw/docs/Biology_and_Management.pdf)
- **Older guidance:** DO no lower than 5 ppm, and maximum temperature not above 72 °F (22 °C) for long periods — [Michigan DNR RR1085](https://www.dnr.state.mi.us/publications/pdfs/DNRFishLibrary/ResearchReports/RR1001-RR1100/RR1085.pdf)
- **Summer heat delays spawning:** elevated summer temperatures delayed spawning and reduced redd construction in a New York mountain lake — [Warren et al. 2012](https://people-facstaff.forestry.oregonstate.edu/dana-warren/sites/people.forestry.oregonstate.edu.dana-warren/files/Warren_et_al_2012.pdf)

#### White sucker
- Preferred 17–24 °C; coolwater thermal regime; classed as "tolerant" of pollution and moderately tolerant of turbidity. No oxygen data given — [Ontario LHD](https://www.ontariofishes.ca/fish_detail.php?FID=19)

#### Golden shiner
- Temperature range 0–35 °C; tolerates low oxygen, high turbidity and high temperature — [FishBase](https://www.fishbase.se/summary/Notemigonus-crysoleucas.html)
- Maximum temperature tolerance 35 °C; "tolerates low oxygen levels" (Moyle 2002) — [NEMESIS](https://invasions.si.edu/nemesis/species_summary/163368)

#### Brown bullhead
- Preferred 25–31 °C; tolerates 0.2 mg/L DO and 36 °C — [Ontario LHD](https://ontariofishes.ca/fish_detail.php?FID=77)
- The final thermal preferendum is probably 29–31 °C — [Comp. Biochem. Physiol. 1975](https://www.sciencedirect.com/science/article/abs/pii/S0300962975801484)
- The experimental upper lethal temperature is 37.5 °C — [EOL](https://eol.org/pages/995106/articles). This is a secondary source and internally inconsistent: it also says 31.6 °C and 36 °C.
- **Low-oxygen survival:**
  - Survives DO down to 0.2 ppm, which makes it less threatened by winterkill — [Wikipedia](https://en.wikipedia.org/wiki/Brown_bullhead)
  - NH says DO below 1 ppm — [NH Fish & Game](https://www.wildlife.nh.gov/fishing-new-hampshire/fish-species-nh/brown-bullhead)
  - Bullheads often occur in large numbers in lakes that winterkill other fish — [MN DNR](https://www.dnr.state.mn.us/minnaqua/speciesprofile/bullheads.html)

#### White perch
- Temperature range 10–33 °C — [FishBase](https://www.fishbase.se/summary/Morone-americana.html)
- **Maine:**
  - White perch "do better in waters that reach a temperature of 75 degrees F. or higher in the summer months".
  - They persist in lakes of at least ~50 acres and ~25 ft deep "if the deeper water is not depleted of oxygen during the winter months" — [MDIFW](https://www.maine.gov/ifw/docs/strategic-management-plans/whiteperch.pdf)
- **Hypoxia** (≤40% saturation): routine metabolic rate up to ×4, growth ÷3, consumption ÷2 — [Hanks & Secor 2011](https://link.springer.com/article/10.1007/s00227-010-1608-0)
- An EPA power-plant document has white perch sections on early-development temperature needs and upper thermal tolerance (incipient lethal temperatures), but I saw only its contents page — [EPA AR-295](https://www3.epa.gov/region1/npdes/schillerstation/pdfs/AR-295.pdf)

### Inferences
- **Brook trout summer behaviour:**
  - Habitat suitability should drop above ~16 °C (growth) and become strongly aversive above ~21 °C.
  - A hard growth-zero sits near 23.4 °C, and lethality near 24–25 °C. FB4's respiration RTM is also 25 °C.
  - In stratified ponds the trout are squeezed between warm surface water and low-O2 hypolimnion, so they should seek spring seeps and stream mouths. That is the same groundwater feature that sets their spawning sites.
- **Brown bullhead** should be the last fish to die in a winterkill or summer anoxia event. Give it a lethal-O2 threshold near 0.2–1 mg/L, against roughly 3–5 mg/L for trout and perch (inferred).
- **Golden shiner** is in between but tolerant; set its critical O2 around ~1–2 mg/L. That is inference; no number was found.
- **White perch** is the most growth-sensitive warm-water species to hypoxia (consumption halves at ≤40% saturation). It needs winter O2 in deep water, which matches the sim's winterkill logic.

### Gaps
- No primary **CTmax or UILT** was found for white sucker, golden shiner or white perch (the white perch EPA section was not readable). The white sucker "28–32 °C" figure seen in a PMC table had unclear meaning and was not used.
- No measured **critical or lethal DO** values were found for white sucker, golden shiner or white perch.
- The bullhead 0.2 mg/L figure is traced only to secondary sources.
- A 1972 bioassay reporting white perch deaths within 36 h at 82–97 °F surfaced in search, but I could not identify the source, acclimation temperature or exact figures, so it is not used.

## 6. Roles as prey and competitors

### Takeaway
Golden shiner is a primary soft-rayed forage fish for bass and other piscivores, and it is vulnerable because of its size, open-water schooling and lack of spines. White perch overpopulate and stunt, so they act as both forage and food-web competitors. White sucker and other small fish are mainly competitors of brook trout rather than useful trout food. I found no quantitative data on white sucker as large prey.

### Cited Findings
- **Golden shiner as forage:** in South Twin Lake (Washington), large largemouth bass ate mainly golden shiner and crayfish in spring and summer. Consumption was estimated with Fish Bioenergetics 3.0 — [Lake Reserv. Manage. 2010](https://www.tandfonline.com/doi/full/10.1080/07438141.2010.504322)
- Golden shiner is "vulnerable to large predatory fishes" (Moyle 2002) — [NEMESIS](https://invasions.si.edu/nemesis/species_summary/163368)
- **Small fish as trout competitors (Maine):** small fish "are often more of a detriment to trout populations than a benefit as a food resource". The gravest threat to Maine brook trout is unauthorised introduction of competing species, and about 140 trout ponds have been reclaimed with rotenone since 1939 — [MDIFW](https://www.maine.gov/ifw/docs/Biology_and_Management.pdf)
- **White sucker vs brook charr:** white sucker had a stronger effect on brook charr diet than creek chub (Quebec, 69 lakes) — [DOI 10.1023/A:1006530029418](https://dx.doi.org/10.1023/a:1006530029418)
  - A New York lake survey called white suckers "a serious competitor" of brook trout and possibly harmful to stocking success — [NY DEC Tech. Bull. 5](https://www.dec.ny.gov/docs/fish_marine_pdf/tb5queer.pdf)
- **White perch:**
  - Large white perch eat small fish, including their own species. Overabundance depletes food and slows the growth of salmon, trout and bass.
  - Managers consider white perch introductions into coldwater waters undesirable — [MDIFW](https://www.maine.gov/ifw/docs/strategic-management-plans/whiteperch.pdf)

### Inferences
- **Golden shiner:** should be a high-energy, catchable forage fish for bass, pike and pickerel, and for trout over 250 mm. Its 20–27 °C summer spawning creates a pulse of young-of-year after bass have spawned.
- **White sucker:** its eggs and larvae during spring runs, and its young-of-year, are probably important prey. Adult suckers reach 400–500 mm, beyond the gape of most predators except large pike, so in the sim they function mainly as benthic competitors and a nutrient pathway. This is inference without a direct source.
- **White perch:** density-dependent stunting is the emergent behaviour to aim for. High recruitment and density-dependent growth should give many small perch that stay small, all of them prey-sized.

### Gaps
- No predation-vulnerability or catch-selectivity data was found for white sucker, brown bullhead or white perch in northern lakes.
- No contribution of golden shiner to bass or pickerel diets in Maine was quantified.

## 7. Fallfish and banded killifish (brief)

### Takeaway
- **Banded killifish:** appears on most Maine pond species lists retrieved, so it is a widespread small littoral forage fish. Its life-history values were not retrieved.
- **Fallfish:** a large stream-and-lake minnow. Males build gravel-mound nests in streams at ~14–15 °C (late April–June). It matures at age III+ (males) or IV+ (females), lives 10+ years and turns piscivorous above ~100 mm. It appears in fewer Maine pond lists.

### Cited Findings
- **Banded killifish** (*Fundulus diaphanus*) appeared in all 10 Maine pond species lists retrieved, for example Big Duck Pond. Fallfish appeared in 2 of the 10 — [Lakes of Maine: Big Duck Pond](https://lakesofmaine.org/lake-fish.html?m=2954); [Partridge Pond](https://lakesofmaine.org/lake-fish.html?m=4556)
- **Fallfish (Massachusetts study):**
  - Spawns late April–June at about 14.4 °C.
  - Fecundity F = 159.1 + 26.4·W (W presumably in g).
  - Eggs hatch in 138–144 h at 17.0 °C.
  - Males mature at III+, females at IV+.
  - Omnivorous (algae, fish, aquatic and terrestrial insects, crayfish) — [SciSpace topic summary](https://scispace.com/topics/fallfish-3o5slshq)
- **Fallfish nesting and size:**
  - The dominant male builds a gravel mound nest with his mouth, and many fish may spawn on one nest.
  - Up to 15,000 eggs.
  - Spawning around 59 °F (15 °C) — [NPS](https://irma.nps.gov/NPSpecies/Species/Profile/104941)
  - Adults are 155–431 mm; temperature range 6–27 °C; young live in faster currents — [ADW](https://animaldiversity.org/accounts/Semotilus_corporalis)
  - Grows to about 10 in and lives more than 10 years — [NH Fish & Game](https://wildlife.nh.gov/fishing-new-hampshire/fish-species-nh/fallfish)

### Inferences
- **Fallfish** is a stream or inlet-associated species that would use the same inflow habitat as sucker and trout spawning. Juveniles (chironomids and zooplankton) turn piscivorous above 100 mm. It is secondary in pond food webs; include it only if streams are modelled.
- **Banded killifish** is a likely small littoral forage species, the native counterpart of the sim's "minnow" role.

### Gaps
- No banded killifish life history (spawning, fecundity, growth, thermal or O2 limits) was retrieved.
- No abundance or biomass data exists for either species in Maine ponds. The lakesofmaine.org lists record presence only.
- The fallfish fecundity equation's units and the maximum age in the Massachusetts study were not verifiable from the summary.
