# How much of the lake bed carries weed stands: macrophyte area cover (PAC) in small, shallow, coloured, soft-water northern lakes, and a target for Hot Brook (2026-10-22)

Compiled for the 3-D Hot Brook lakes: Upper (369 ha, mean 3.0 m, max 5.5 m) and Lower (274 ha, mean 2.6 m, max 3.9–4.1 m).
Both have colour ~30–60 Pt-Co, Secchi ~3.5–4.5 m, soft water, no stratification, sandy or mucky bottoms and some rocky, wave-exposed shores.

The sim's July weed stands cover **~50 %** of the bed. The gate's check reads "about a fifth to a half (research ~20–30 %)".

**Where the gate's "~20–30 %" came from.** The figure traces to `weed_bed_structure.md` §1.
- That section **inferred** ~20 % of Upper and ~24 % of Lower vegetated.
- It multiplied point-frequency bands, taken from Adirondack and Midwest surrogates, by an older hypsography.
- No survey of either lake lies behind it.
- This note re-derives the target from the models (§1), measured lakes (§2), within-littoral fill (§3) and the frequency-to-area conversion (§4).

**What this extends** (read first; not repeated here):
- `weed_bed_structure.md` §1: Adirondack bed maps and rake hits, Rock Lake, Lake Vermilion, MN DNR, the Maine MNAP community types.
- `macrophytes.md` §2: depth limits from Secchi and colour, the light needed at the limit, and the old hypsography table.
- `weed_bed_controls.md`: slope, exposure, ice and substrate.
- `../Hot Brook populations and water/plant_species_hot_brook.md`: the NAIP and NWI evidence from the lakes themselves.

**Tags**
- [primary]: the full text was read (a PDF's text layer, or a rendered scan read by eye).
- [abstract]: abstract only (OpenAlex record).
- [data]: my own analysis of a public dataset (EPA National Lakes Assessment); scripts are in the session scratchpad, not the repo.
- [repo]: from an earlier note in this folder.
- [inf]: my arithmetic or judgement.
- SURROGATE: a lake type unlike Hot Brook (hard water, eutrophic, southern, European).

**How it was gathered.**
- The session's web-search budget was used up before this task began. So no new searching was possible: only known URLs, DOI lookups (OpenAlex), and data and reports linked from earlier notes.
- That is why no MDEP, Lake Stewards of Maine, NHDES or VT DEC plant-survey report was found.
- The **EPA National Lakes Assessment (NLA)** stands in for them. Its Maine, NH and VT lakes were surveyed by those states' crews with one protocol.
- Nothing was bypassed. maine.gov's MABP chapter 6 returned 403 (CloudFront) to both curl and WebFetch. ScienceDirect (Cheruvelil & Soranno 2008) returned 403. Unpaywall needs an email address, so it was not used.

---

## 0. Takeaways

1. **The light-only models predict "most of the bed could grow plants."** At Secchi 3.5–4.5 m, the clear-water regressions put the angiosperm limit at **3.9–5.8 m**. That is **~75–96 % of Upper's bed and ~100 % of Lower's** [primary/inf].
   - Canfield's humic **Finnish** regression gives only **2.9–3.3 m** (~45 % / ~57 %) [primary].
   - So does the coloured-water light limit (canopy at ~2.0–3.0 m; `macrophytes.md` §2.3), which gives **~30–40 %** of each bed [inf].
   - All of these are *potential* areas, not cover.
2. **Duarte, Kalff & Peters's (1986) cover models** (139 lakes) bracket Hot Brook at **20–75 %** of lake area in submerged plants. Lake size alone gives 20 %; light plus size gives 23–52 %; the linear %As model gives 60–75 % (SE ±11 points) [primary/inf].
   - Their "cover" is the **mapped area colonised**, measured by planimetry on vegetation maps.
   - Their literature lakes average **35 %** submerged and **44 %** total. That sample is weighted toward well-vegetated, harder-water lakes.
3. **Measured northeastern shallow lakes, nearshore band (NLA, 0–10 m from shore, ~1 m deep)** [data]:
   - Macrophytes are present at **~90–100 %** of plots.
   - Mean areal cover is lower. **Maine** shallow natural lakes have a median of **0.19** (NLA 2012 and 2007 alike; IQR ~0.1–0.5).
   - Coloured, soft, 2–8-m analogue lakes in New England and the Upper Midwest have a median of **0.39** (2012) and 0.23 (2007).
   - Bare plots are **5–8 %**. Plots dominated by rock carry about half the cover of soft-bottom plots (0.15 against 0.39–0.40, analogues).
4. **Inside the plants' depth range, the bed is far from full.** Point-intercept "littoral frequency" (any plant on the rake) reads:
   - **42 %** at Rock Lake, WI, where 35 % of all points were vegetated.
   - **~71 %** to 3.4 m at Lake Vermilion, MN. By depth band: 98 % at <0.9 m, 86 % at 0.9–1.5 m, 67 % at 1.8–2.4 m, 29 % at 2.7–3.4 m, 0 beyond.
   - **4–56 % (median 13 %)** for rake tosses in soft, coloured Adirondack lakes [primary/repo].
   - Most vegetated points are sparse. Rock Lake's mean rake fullness was 1.39 on the 1–3 scale.
5. **Frequency is presence, not cover.** Lake-wide point frequency estimates the share of the bed where a rake finds *any* plant (≈ PAC by presence). Areal cover ≈ frequency × the cover inside occupied patches, typically ~0.3–0.6.
   - The gate measures Σ min(1, B/Bmax) over the stand forms. That is a cover-like quantity, not presence, so it should sit well **below** PI frequency.
6. **Maine's own record says "scanty".**
   - Cooper (1941), 53 southern Maine lakes: vegetation "generally very scanty", mostly emergent [repo].
   - The USGS 43-lake study (1980): coloured lakes are mainly bulrush and floating-leaved plants; rocky, gravelly or sandy littorals carry sparse pipewort [primary].
   - MN DNR's "large, shallow, soft-water" lake class (Hot Brook's class) has **Low** relative SAV abundance [primary].
   - At Hot Brook, surface-reaching beds cover only **0.6 % (Upper) and 0.3 % (Lower)** of lake area (NAIP) [repo].
7. **Target** (end of note): stands as the gate measures them, **Upper ≈ 15 % (8–25 %)** and **Lower ≈ 17 % (8–27 %)**. Any vegetation present, including the *Nitella*/moss meadow, ≈ **35–45 % (25–65 %)**. The sim's ~50 % of stands is ~3× too high.

---

## 1. Empirical models: what they predict for Hot Brook

### Takeaway
No published model predicts PAC directly from mean depth and Secchi for northeastern soft-water lakes. The usable chain has three steps:
1. Secchi gives the maximum depth of colonisation (MDC/Zc): Canfield et al. 1985; Chambers & Kalff 1985; Duarte 1987; Middelboe & Markager 1997.
2. The lake's hypsography turns that depth into the area light *could* support.
3. A fill fraction (§3) gives cover.

Duarte, Kalff & Peters (1986) is the one direct cover model. It predicts 20–75 % for Hot Brook depending on the form, a spread that shows how little it constrains a single lake.

Both of the coloured-water lines (Finnish regression, stained light) put the canopy limit at 2–3.3 m. That is where the clear-water regressions' 4–5 m potential collapses to ~30–57 %.

### Cited findings
**Maximum depth of colonisation from Secchi**
- **Canfield, Langeland, Linda & Haller 1985**, *J. Aquat. Plant Manage.* 23:25–28 ([PDF, APMS](https://apms.org/wp-content/uploads/japm-23-01-023.pdf)) [primary, rendered scan]:
  - Data: 27 Finnish, 26 Florida and 55 Wisconsin lakes. MDC was measured by fathometer in Florida and taken from the literature elsewhere.
  - Pooled: `log MDC = 0.61 log SD + 0.26` (r² 0.56). Its 95 % limit is **46–236 %** of the predicted value.
  - **Finland** (n 27, mostly humic): `0.51 log SD + 0.18` (r² 0.82).
  - **Florida**: `0.42 log SD + 0.41` (r² 0.71).
  - **Wisconsin**: `0.79 log SD + 0.25` (r² 0.57).
  - Light at the MDC was 0.46–1.2 % for *Hydrilla*, 1.9 % for *Nuphar* and 4.1–8.3 % for *Utricularia*.
  - **Their worked example (Fig. 2).** At SD 1.1 m (MDC 2.7 m), "if only light was limiting and macrophytes grew in all suitable areas", **68 %** of a 4-m-deep Florida lake would be colonised but only **20 %** of a 10-m one. At SD 0.5 (MDC 1.9 m), both would fall below 15 %. This is the potential-area method used below.
- **Chambers & Kalff 1985**, *CJFAS* 42:701 ([doi](https://doi.org/10.1139/f85-090)) [abstract]:
  - Angiosperms: `zc^0.5 = 1.33 log D + 1.40`.
  - Bryophytes: `zc^−0.5 = −0.48 log D + 0.81`.
  - Charophytes: `log zc = 0.87 log D + 0.31`.
  - Depth of maximum angiosperm biomass: `zb^0.5 = 0.54 log D + 1.15`.
  - Light at zc is ~21 % (angiosperms, bryophytes) and ~11 % (charophytes) of surface PAR.
- **Duarte 1987 thesis**, 25 southern Quebec and northeastern US lakes ([text](https://mcgill.scholaris.ca/server/api/core/bitstreams/fbe2e1a6-2d4d-4843-8413-240aef4b932e/content)) [primary, OCR]:
  - `Zmc = 1.9 + 0.63·Secchi` (r² 0.76) and `Zmb = 1.1 + 0.4·Secchi` (r² 0.79).
  - The shallowest submerged plants grow at 0.75–1.25 m, unrelated to slope, exposure or clarity. Duarte attributes this to ice scour (see `weed_bed_controls.md`).
- **Middelboe & Markager 1997**, *Freshw. Biol.* 37:553 ([doi](https://doi.org/10.1046/j.1365-2427.1997.00183.x)) [abstract; equations via `macrophytes.md` §2.1]:
  - Zc is linear in Secchi for 1–4 m.
  - Rosette plants have the shallowest Zc in every lake type.
  - Zc falls ~0.12 m per degree of latitude.
- **Colour.** For any Secchi, angiosperms reach deeper in low-colour lakes (Chambers & Prepas 1988). Stained lakes have a median Kd·SD of 2.70, against 1.86 for clear ones (Koenings & Edmundson 1991) [both repo, `macrophytes.md` §2.3].

**Direct models of cover: Duarte, Kalff & Peters 1986**, *CJFAS* 43:1900 ([doi](https://doi.org/10.1139/f86-235); full text as chapter I of the [Duarte thesis](https://mcgill.scholaris.ca/server/api/core/bitstreams/fbe2e1a6-2d4d-4843-8413-240aef4b932e/content)) [primary, OCR]
- The 139 lakes come from the literature: 58 in Europe and 62 in North America.
- **Cover is the mapped area colonised.** "When only vegetation maps were provided, macrophyte cover was determined by planimetry".
- Dataset means, as % of lake area:
  - total macrophytes **44.1 %** (n 104; 0–100);
  - submerged **35.0 %** (n 82);
  - emergent **12.3 %** (n 77).
  - Lakes: mean Secchi 2.8 m, mean ice cover 93 days.
- Equations (A = lake area in ha). The r² / n / SE alignment was re-read from the OCR'd table and is [inf]:
  - (1) `ln As = 0.91 ln A − 1.1` (r² 0.80, n 76, SE ln 1.47). Submerged cover is a smaller share of bigger lakes.
  - (3) `ln As = 0.94 ln A + 0.85 ln Iz − 3.7` (r² 0.89, n 51, SE ln 1.05; cross-validated r² 0.81, SE ln 0.99). The authors call it accurate to "approximately an order of magnitude".
  - (7) `%As = 1.4·Īz + 0.01·Lie − 24·Sal − 0.90` (r² 0.60, n 55, SE **11.2** percentage points).
    - Īz is the mean annual irradiance within the mean depth, in kcal cm⁻² yr⁻¹.
    - Lie is days of ice; Sal = 1 above 1000 µS/cm.
  - Inputs: k = 1.46/Secchi; Īz = I₀(1 − e^−kz̄)/(kz̄); I₀ = 0.9·(ice-free irradiance) + 0.1·(irradiance under ice).
  - Emergents: `ln Ae = 1.0 ln A − 2.6`. Emergents cover **~7 %** of lake area on average, independent of size.
- The abstract's summary: "Underwater light was found to be the best descriptor of the cover and biomass of submerged plants."

**Regional and agency relationships**
- **Minnesota DNR, Special Publication 160** ([PDF](https://www.lrl.mn.gov/docs/2004/other/040655.pdf)) [primary]:
  - **Lake classes.** Lakes are classed by size (500 acres), depth (% of area shallower than 15 ft, split at 80 %) and alkalinity. The SAV abundance came from a cluster analysis of 1,410 lake vegetation surveys (Table 1):
    - Type 1, "small, shallow, soft water" (991 lakes, north-central and NE MN): relative SAV abundance **Low**.
    - Type 5, "large, shallow, soft water" (34 lakes, NE): **Low**.
    - Hard-water classes: "Low to High".
  - Hot Brook falls in Type 5: Upper is 912 acres, ~85 % of its area is <15 ft, and the water is soft [inf].
  - Game fish do best at **10–60 %** basin SAV cover, preferred **18–40 %**.
  - "Naturally, lakes with > 60 % cover are shallow lakes."
  - MN's statutory "littoral" is the area shallower than 15 ft (4.6 m). By that definition Hot Brook is ~85 % (Upper) and 100 % (Lower) littoral [inf].
- **Wisconsin point-intercept convention** (Rock Lake report, [PDF](https://winchesterwi.com/wp-content/uploads/2026/05/Rock_PI_Report_2025.pdf)) [primary]: "littoral" means the area shallower than the maximum depth of plants found in that survey. The headline metric is the frequency of occurrence at those sites.
- **Søndergaard et al. 2010**, *Freshw. Biol.* 55:893, 300 Danish lakes ([doi](https://doi.org/10.1111/j.1365-2427.2009.02331.x)) [abstract]:
  - Coverage is usable as a metric only in shallow lakes, or the shallow parts of deep lakes.
  - At TP 0.03–0.07 mg/L, shallow-lake coverage ranged "from nearly 0 to 100 %".
  - At TP 0.10–0.20 mg/L, only 29 % of lakes had coverage above 10 %.
  - Hot Brook's TP of ~0.010 is below their range (SURROGATE: hard-water Danish lakes).
- Not accessed: the Florida PAC regressions (Canfield & Hoyer; Bachmann et al. 2002, *Hydrobiologia* 470:219, abstract elided) and Cheruvelil & Soranno 2008 (*Aquat. Bot.* 88:219, Michigan lake cover vs lake and landscape features: ScienceDirect 403).

### Inferences for the sim
**Hypsography, re-measured** [inf]. These figures come from the true-scale bed (`HB_WORLD=true`, `src/w3/geometry.js`); the 1/10 world agrees within 1 point. The shallows are now about twice what `macrophytes.md` §2.4 and `habitat3d.md` list (≤1 m: 5–6 %), probably because the lidar shallows were added since.

| Cumulative % of bed shallower than | 0.5 m | 1 m | 1.5 | 2 | 2.5 | 3 | 3.5 | 4 | 4.5 | 5 |
|---|---|---|---|---|---|---|---|---|---|---|
| Upper (mean 2.99 m) | 3.7 | 11.7 | 18.7 | 26.5 | 34.6 | 43.9 | 58.0 | 76.3 | 85.2 | 93.7 |
| Lower (mean 2.57 m) | 6.3 | 16.0 | 19.8 | 24.7 | 34.6 | 55.1 | 80.9 | 99.7 | 100 | 100 |

- The 0–10 m shore band is 3.5–3.6 % of each lake, mean depth 0.4–0.5 m. The 0–30 m band is 11 %.

**Predictions at Secchi 3.5 / 3.9 / 4.5 m** [inf; arithmetic on the equations above]:

| Model | Depth limit (m) | Upper: % of bed within reach (SD 3.9) | Lower |
|---|---|---|---|
| Chambers & Kalff, angiosperms | 4.51 / 4.78 / 5.15 | ~90 % | 100 % |
| — charophytes | 6.1 / 6.7 / 7.6 | 100 % | 100 % |
| — bryophytes | 3.3 / 3.6 / 4.1 | ~62 % | ~85 % |
| — depth of maximum biomass | 2.08 / 2.16 / 2.26 | | |
| Canfield pooled | 3.91 / 4.18 / 4.56 | ~80 % | 100 % |
| Canfield **Wisconsin** | 4.78 / 5.21 / 5.83 | ~96 % | 100 % |
| Canfield **Finland** (humic) | **2.87 / 3.03 / 3.26** | **~45 %** | **~57 %** |
| Duarte Zmc | 4.11 / 4.36 / 4.74 | ~83 % | 100 % |
| Light at 21 % (canopy), stained Kd = 2.70/SD [sim's Kd = 2.30/SD] | 2.02 / **2.25** / 2.60 [2.37 / 2.65 / 3.05] | **~31 %** [37 %] | **~30 %** [41 %] |
| Light at 11 % (charophytes), stained [sim's] | 2.86 / **3.19** / 3.68 [3.36 / 3.74 / 4.32] | **~49 %** [67 %] | **~65 %** [90 %] |

**Duarte, Kalff & Peters 1986 for Hot Brook** [inf]. Inputs: Ia 113–119 kcal cm⁻² yr⁻¹ (Maine global irradiance ~3.6–3.8 kWh m⁻² d⁻¹), ice 143 days, ~30 % of the year's light falling during the ice season, k = 1.46/SD.
- Eq. 1 (size only): **20 %** in both lakes (×/÷ ~4).
- Eq. 3 (size + light): **23–35 %** with irradiance *at* the mean depth, **42–52 %** with the mean irradiance *within* it. The OCR hides which one the paper meant.
- Eq. 7 (%As): **60–71 %** for Upper and **65–75 %** for Lower. Īz is 43–50 and 46–53 kcal; SE ±11 points.

**Reading.**
- Every clear-water line says plants *could* reach most of both beds.
- The coloured-water lines (Finnish regression, stained-light 21 % depth) cut the canopy's reach to **~30–57 %** of each bed. The charophyte and moss meadow could still reach ~50–90 %.
- Duarte's eq. 7 is the only line that puts *mapped* submerged cover near the sim's 50 %. It was fitted on a literature set whose mean Secchi was 2.8 m but whose lakes are mostly harder and better vegetated. Its cover also includes every sparse area inside the mapped outline.

### Gaps
- The Florida PAC models were not accessed: Canfield & Hoyer 1992; Bachmann et al. 2002; Hoyer & Canfield 1997.
- Cheruvelil & Soranno 2008 (Michigan) was blocked.
- No published regression of PAC on Secchi ÷ mean depth was found for soft or coloured lakes.

---

## 2. Measured cover in comparable lakes

### Takeaway
No Maine lake of Hot Brook's kind has a published whole-lake PAC. The best measured evidence is the NLA's nearshore littoral plots, collected by state crews in Maine, NH and VT among others.

In shallow natural Maine lakes, plants are present along almost all of the shore, but they cover only about **a fifth** of the nearshore bottom (median 0.19). Coloured, soft analogues across the Northern Appalachians and Upper Midwest run to about **a quarter to two-fifths**.

The whole-lake surveys of soft, coloured northeastern lakes (Adirondacks) put mapped beds on **3–39 %** of lake area and rake hits at **4–56 %** of littoral points. Maine's older surveys call the vegetation scanty.

### Cited findings
**EPA National Lakes Assessment: nearshore littoral plots** [data].
- Sources: [NLA 2012 PHab metrics](https://www.epa.gov/sites/default/files/2016-12/nla2012_wide_phabmet_10202016.csv), [station data](https://www.epa.gov/sites/default/files/2016-12/nla2012_wide_phab_08232016_0.csv), [site info](https://www.epa.gov/sites/default/files/2016-12/nla2012_wide_siteinfo_08232016.csv), [chemistry](https://www.epa.gov/sites/default/files/2016-12/nla2012_waterchem_wide.csv), [Secchi](https://www.epa.gov/sites/default/files/2016-12/nla2012_secchi_08232016.csv), [profiles](https://www.epa.gov/system/files/other-files/2024-09/nla2012_profile_wide.csv), plus the 2007 equivalents (metrics A, site info, Secchi, chemistry condition file) from the [NARS data page](https://www.epa.gov/national-aquatic-resource-surveys/data-national-aquatic-resource-surveys).
- **Method** ([PHab metadata](https://www.epa.gov/sites/default/files/2016-12/nla2012_wide_phab_meta_08232016.txt)) [primary]:
  - Each lake has 10 stations round the shore; the station sits **10 m off shore** (`DEPTH_AT_STATION`).
  - Each plot is classed 0 = 0 %, 1 = <10 %, 2 = 10–40 %, 3 = 40–75 %, 4 = >75 % for total, submergent, floating and emergent macrophytes. A further field records whether the macrophytes extend lakeward.
  - `AMFCALL` = mean fractional cover. Its agreement with the class midpoints 0 / 0.05 / 0.25 / 0.575 / 0.875 was checked against the station data [inf].
  - `AMFPALL` = the fraction of stations with any macrophytes.
  - The 15-m-wide plot size is from the NLA design, not re-read [inf].
- **Analogue lakes, NLA 2012** (n 25). Criteria: Northern Appalachians or Upper Midwest, natural lake, index-site depth 2–8 m, colour 15–80 PCU, ANC ≤ 600 µeq/L, Secchi 2–6 m. Their medians: depth 4.8 m, Secchi 2.8 m, colour 30, ANC 173 µeq/L, TP 16 µg/L, 17 ha.

  | Metric | q10 | q25 | median | q75 | q90 |
  |---|---|---|---|---|---|
  | Total cover (AMFCALL) | 0.07 | 0.15 | **0.39** | 0.63 | 0.78 |
  | Presence at stations | 0.78 | 0.90 | **1.00** | 1.00 | 1.00 |
  | Submergent cover | 0.03 | 0.09 | 0.17 | 0.36 | 0.57 |
  | Floating cover | 0.01 | 0.04 | 0.06 | 0.28 | 0.38 |
  | Emergent cover | 0.01 | 0.04 | 0.07 | 0.18 | 0.31 |
  | Station depth (m) | 0.67 | 0.77 | 1.10 | 1.33 | 1.69 |

- **NLA 2007 analogues** (n 17; DOC 4–12 mg/L stands in for colour): cover median **0.23** (IQR 0.12–0.32), presence 0.89.
- **Maine's shallow natural lakes** (index depth ≤ 8 m):
  - NLA 2012, 16 lakes: cover median **0.19**, IQR ~0.12–0.50.
  - NLA 2007, 14 lakes: median **0.19**, IQR 0.09–0.30.
  - Closest water analogue of Hot Brook: **Roderique Pond** (16 ha, 5 m, Secchi 3.8–3.9, colour 36, ANC 110–114), cover **0.15** (2012) and **0.12** (2007).
  - Coloured-pond analogue: **Second Buttermilk Pond**, named in `maine_dep_lakes_data_2025.md` (colour 55, Secchi 2.6), cover **0.23**.
  - Also: Skitacook 0.19, Webster 0.19, Hudson 0.11–0.15, Lower Middle Branch 0.12–0.23, Halfmile 0.23, Middle Chain 0.25.
  - Higher values: Tilden 0.44–0.50, Little Lake 0.52, Eighth Debsconeag 0.51, Nelson 0.67, Little Watchic 0.69.
  - **Fourth Machias Lake** (Washington Co.; 622 ha, 7.5 m, DOC 7.3), cover **0.45**.
- **NH and VT shallow lakes** (2012, n 12): median 0.41.
- **All 2–8-m natural NAP and UMW lakes**, any water (n 117): median 0.41, IQR 0.15–0.65.

**Whole-lake surveys**
- **Adirondack soft, coloured lakes** (AWI 2013; `weed_bed_structure.md` §1) [repo, primary there]:
  - Surface-mapped beds cover **3–39 %** of lake area: Little Tupper 3 %, Limekiln 3.4 %, Horseshoe 4.2 %, Hoel 9 %, Tupper 16 %, White 19 %, Eldon 38.6 %.
  - Rake tosses across the littoral hit plants at **4–56 %** (median ~13 %).
- **Rock Lake**, Vilas Co., WI, PI survey July 2025 ([PDF](https://winchesterwi.com/wp-content/uploads/2026/05/Rock_PI_Report_2025.pdf)) [primary]:
  - **306** sites, **107 vegetated** (35 % of all points).
  - Plants to 13 ft (4.0 m), most often at 3 ft.
  - Littoral frequency **42.3 %**, so ~83 % of the points lay within the plants' depth range [inf].
  - Mean rake fullness 1.39 (1–3 scale), "below moderate plant density". Muck dominated the vegetated sites.
- **Lake Vermilion**, MN, 2019 ([PDF](https://www.vermilionlakeassociation.org/wp-content/uploads/2019/09/2019-RMB-report-vermilion.pdf)) [primary; figure read off ±3 %]:
  - Mean Secchi ~8.5 ft (2.6 m); 526 points to 14 ft, in "designated sampling areas" (bays).
  - 150 points bare (**29 %**); none beyond 11 ft (3.4 m).
  - Frequency by depth: **<3 ft ~98 %, 3–5 ft ~86 %, 6–8 ft ~67 %, 9–11 ft ~29 %, >11 ft 0**.
  - Mean 1.6 plants per rake. "Plant abundance was greatest between one and eight feet of water."
- **Minnesota DNR**, mostly hard-water lakes (SURROGATE) [repo]: 0–15 ft zones vegetated at 49–99 % of sites. Quamba Lake: 77 % at 0–5 ft, 15 % deeper.
- **Kejimkujik, Nova Scotia** [repo, snippet]: clear Beaverskin Lake had beds over most of its bottom to 6.5 m. Humic Pebbleloggitch Lake had only a fringe shallower than ~1.8 m.

**Maine: qualitative**
- **USGS WRI 80-69**, 43 Maine lakes, 1974–76 ([PDF](https://pubs.usgs.gov/wri/1980/0069/report.pdf)) [primary, text layer]:
  - "The littoral area of the entire lake … was traversed by boat, and the distribution and estimated areal density of each plant type was sketched". Groups under 100 m² (OCR "100 m") and under 10 % density were not mapped.
  - Density classes: >10–25, >25–50, >50–75, >75 %.
  - "Highly colored lakes had plant communities primarily composed of *Scirpus* and floating-leaved plants".
  - "lakes with rocky-gravelly-sandy littoral zones do not usually have abundant populations of rooted aquatic plants … dominated by sparse populations of *Eriocaulon*".
  - Per-lake areas are only on the map figures, which have no text layer.
- **Cooper 1941**, 53 southern Maine lakes [repo, `fetched_sources_digest.md`]: aquatic vegetation "generally very scanty", mostly emergent, concentrated in sluggish waterways between ponds or around inlets and outlets.

**Hot Brook itself** [repo]
- NAIP near-infrared shows floating and emergent plants on **2.3 ha = 0.6 %** of Upper and **0.84 ha = 0.3 %** of Lower, all within ~15–45 m of shore at 0.3–1.0 m.
- NWI maps no littoral aquatic bed (none in the whole region; 1983 photography).
- The only water-plant records are *Nitella flexilis* and *N. tenuissima* (2015).
- MDIFW: the "bottom mostly muddy", the shores "mostly rocky with some areas of sand".

### Inferences for the sim
- **The NLA plot is Hot Brook's 0–10-m band** (3.5 % of each lake, mean depth 0.4–0.5 m) [inf]. Maine's median nearshore cover of ~0.2 (analogues to ~0.4) is the best-founded number for that band.
- **Cross-check against Hot Brook's own photos** [inf].
  - Maine NLA floating + emergent cover in the 0–10 m band is ~0.08–0.15 (medians 0.03–0.04 + 0.07–0.12).
  - Times 3.5 % of lake area, that gives **~0.3–0.5 %** of the lake in surface-reaching plants. NAIP measures **0.3–0.6 %**.
  - The two independent lines agree, so Hot Brook's shore looks like a typical Maine nearshore, not an unusually weedy one.
- **Maine sits at the low end of the region:** median 0.19 against 0.39–0.41 for NAP and UMW analogues and for NH and VT. This fits Cooper's and the USGS's "scanty" and MN's "soft water → Low SAV".

### Gaps
- No MDEP or Lake Stewards of Maine (VLMP) plant survey, Maine Center for Invasive Aquatic Plants survey, NHDES trophic-survey macrophyte map or VT DEC survey was located. Web search was unavailable, and maine.gov returned 403.
- The Lakes of Maine plant pages for MIDAS 1072 and 1076 sit behind a bot wall and were not attempted.
- NLA's plots reach only 10 m from shore: they say nothing about the 1–4 m bed.
- The USGS 1980 vegetation maps exist only as images in the report.

---

## 3. Within the littoral: how much of it actually carries stands

### Takeaway
Within the depth range plants can reach, the share of the bottom with plants falls steadily with depth. It is high near shore, falls past the depth of maximum biomass, and is near zero at the colonisation limit. On top of that, substrate and exposure cut holes in it.

At the scale of a 150-m² plot, almost every stretch of shore has *some* plants, but the mean cover is only ~0.2–0.4. Only **27–42 %** of plots exceed 40 % cover.

At rake scale, littoral frequencies run **42–71 %** in Midwest lakes and **~13 %** (median) in soft, coloured Adirondack lakes.

### Cited findings
- **NLA stations** [data] (cover classes as in §2):

  | | Analogue lakes 2012 (244 stations, 25 lakes) | Maine shallow natural 2012 (154, 16) |
  |---|---|---|
  | Class 0 % | 8 % | 5 % |
  | <10 % | 29 % | 41 % |
  | 10–40 % | 22 % | 27 % |
  | 40–75 % | 15 % | 14 % |
  | >75 % | 27 % | 14 % |
  | Mean cover (class midpoints) | 39 % | 29 % |
  | Macrophytes extend lakeward of the 10-m station | **69 %** | **66 %** |
  | Mean cover, stations ≥40 % rock (boulder, cobble, bedrock) | **15 %** (n 21) | 25 % (n 11) |
  | Mean cover, stations ≥40 % silt or organic | **39 %** (n 102) | 28 % (n 79) |
  | Mean cover, stations ≥40 % sand | 40 % (n 19) | 25 % (n 2) |

- **Depth.**
  - Vermilion (Secchi 2.6): 98 → 86 → 67 → 29 → 0 % from <0.9 m to >3.4 m [primary].
  - Rock Lake: frequency peaks at ~0.9 m [primary].
  - Duarte: biomass is dome-shaped with depth, peaking at Zmb ≈ 1.1 + 0.4·SD, and the shallowest submerged plants grow at 0.75–1.25 m (ice) [repo].
- **Substrate and exposure** [repo, `weed_bed_controls.md`]:
  - Great Lakes cover is **0 / 30 / 78 %** going from coarse and exposed to fine and sheltered (Randall et al. 2004).
  - Biomass ∝ slope^−0.81, with none above ~**15 %** slope (Duarte & Kalff).
  - Wave exposure explained 86 % of cover variance in a large NZ lake (Riis & Hawes 2003).
  - Barko & Smart: growth is best on fine inorganic sediment with ~5–15 % organic matter, and poor on clean sand and organic ooze.
- **Inside a bed** [repo, `weed_bed_structure.md`]:
  - Each species covers mostly 6–25 % (Adirondack abundance classes 1–3).
  - The MNAP pickerelweed marsh has total cover 30–100 %, typically above 50 %.
  - Isoetid lawns are "sparse to extensive", in "small patch, linear" stands.
  - The 1–2 largest beds hold 42–74 % of the mapped bed area.
- **Hot Brook's shore** [repo, `shore_geometry_and_vegetation.md`, inferred there]: rocky shores make up ~60–75 % of the perimeter. The user's dock shore is bare cobble to 0.6 m.

### Inferences for the sim
- **The nearshore band at Hot Brook** [inf]. Weight the NLA analogue contrast (rock 0.15, soft or sand 0.39) by ~60–75 % rocky shore. That gives a 0–10 m cover of **~0.21–0.24**, matching Maine's median of 0.19.
- **Fill by depth band at Hot Brook.** Vermilion's profile was rescaled by light: Hot Brook's stained Kd ≈ 0.6–0.7 m⁻¹ at SD 3.9, against ~0.8 at Vermilion. It was then discounted for soft, coloured water (Adirondack, MN class "Low", Maine NLA) [inf]:

  | Depth band | Any plant present (rake, incl. *Nitella*/moss) | Stands as cover (canopy + floating-leaved + emergent + rosette) | Why |
  |---|---|---|---|
  | 0–1 m | 0.55–0.9 (mid 0.7) | **0.15–0.35 (0.25)** | NLA presence ~0.9–1.0; Maine cover 0.19, analogues 0.39; rock halves it; ice scour |
  | 1–2 m | 0.55–0.85 (0.7) | **0.25–0.55 (0.4)** | around the depth of maximum biomass (C&K Zb 2.1–2.3 m, less in colour); Vermilion 86 % |
  | 2–3 m | 0.35–0.7 (0.5) | **0.08–0.3 (0.18)** | the canopy's light limit (21 %) at 2.0–3.0 m; *Nitella* continues |
  | 3–4 m | 0.1–0.45 (0.25) | **0–0.08 (0.03)** | charophyte and moss scatter only; Vermilion 29 % at 2.7–3.4 m |
  | 4–5 m | 0–0.2 (0.07) | ~0 | |
  | >5 m | 0–0.05 | 0 | |

### Gaps
- No depth-band survey exists for a soft, coloured Maine lake. Vermilion is harder and richer, and its points were in designated bays, so it is an upper-side surrogate.
- No measured relation between rake frequency and areal cover was found for the same lakes. The NLA plot-scale contrast (presence ~1.0, cover ~0.2–0.4) is the only paired evidence.

---

## 4. From point-intercept frequency to area

### Takeaway
"Frequency of occurrence" is a **presence** statistic at the rake's grain. Over all grid points it estimates the share of the bed where a rake would find any plant, which is PAC by presence. Over "littoral" points only, it must be multiplied by the littoral share of the lake.

It overstates areal **cover**: one *Nitella* sprig counts like a dense bed. How much it overstates grows with the sample's grain. Mapped "area colonised" (Duarte; USGS polygons) is coarser still, and larger again.

### Cited findings
- **Definitions** (Rock Lake, WDNR protocol) [primary]:
  - Frequency at sites shallower than the maximum depth of plants = vegetated sites ÷ sites in the littoral.
  - "Littoral" is defined by that survey's own maximum plant depth.
  - Each point is one rake drop, "spun around three times", rated 1–3 for fullness.
  - Plants seen within 6 ft but not raked are recorded as "visuals" and are not in the frequency.
- **Example:** Rock Lake 107/306 = 35 % lake-wide; ÷ 0.423 → ~253 littoral points = 83 % of the grid [primary/inf].
- **Fixed-depth littorals.** MN uses <15 ft (4.6 m); Vermilion's 38 % littoral area is on this basis [primary]. When plants stop shallower than that, MN's frequency is lower than WI's for the same bed.
- **Mapped area colonised.**
  - USGS 1980 skipped stands under ~100 m² and under 10 % density, and mapped density classes from 10 % up [primary].
  - Duarte, Kalff & Peters measured planimetry on whatever maps authors published [primary].
  - Both count the sparse interior of a mapped bed as "covered".
- **Plot scale (NLA, 150 m²).** Presence is ~0.9–1.0 while mean cover is 0.19–0.39 [data]. At this grain, presence is ~2.5–5× cover.

### Inferences for the sim
- **Conversions** [inf]:
  - PAC (presence) ≈ littoral frequency × littoral share.
  - Areal cover ≈ PAC (presence) × mean cover inside occupied rake footprints. Take ~0.4–0.6 for typical sparse to moderate rake fullness of ~1.4–1.7 out of 3, and ~0.8 for "rake full".
  - So a lake with 40 % presence-PAC has ~15–25 % areal cover.
- **What the gate measures.** The `w3.mjs` 7h check sums, for each bed cell, Σ min(1, B/Bmax) over every form except the deep *Nitella* meadow (DM), caps it at 1, and area-weights it.
  - That is a **cover-like** quantity: a cell at a fifth of Bmax counts 0.2.
  - Compare it with areal cover (NLA classes, the "stands as cover" column above), **not** with rake frequency or Duarte's mapped area.
  - A **presence** check would be the share of bed cells with any form above a detection threshold (e.g. ≥5 % of Bmax, or a few g DW m⁻²), including the meadow. That one *should* be compared with PI frequency and PAC.
- **The rosette lawn cannot carry the total.** Isoetids live at ~0.2–1.1 m (MNAP; *Lobelia* Zc ≈ SD/3 ≈ 1.2–1.3 m, 43 % light). That is ≤ ~13–17 % of either bed, and much of it is rock.
  - At ~0.3–0.6 cover on the sandy part, rosettes add **~1–4 %** of the bed [inf].

### Gaps
- Madsen 1999 (the USACE point-intercept technical note) and the WDNR baseline protocol (Hauxwell et al. 2010) could not be located without search.
- Their rake footprint, grid-spacing rules and the "95th-percentile maximum depth" convention are therefore from the Rock Lake report and earlier notes only.

---

## 5. Hot Brook by depth band: lake-wide totals

Band shares of the bed, from the hypsography above:
- Upper: 0–1 m 11.7 %, 1–2 m 14.8 %, 2–3 m 17.4 %, 3–4 m 32.4 %, 4–5 m 17.4 %, >5 m 6.3 %.
- Lower: 0–1 m 16.0 %, 1–2 m 8.7 %, 2–3 m 30.4 %, 3–4 m 44.6 %, >4 m 0.3 %.

Multiplied by §3's table [inf]:

| | Stands as cover (the gate's quantity) low / mid / high | Any plant present (incl. meadow) low / mid / high |
|---|---|---|
| Upper | 7 / **13** / 20 % | 24 / **37** / 54 % |
| Lower | 7 / **14** / 23 % | 29 / **44** / 63 % |

- **Light sensitivity** [inf]. With the sim's Kd·SD of 2.30 instead of a stained 2.70, the canopy reaches ~2.65 m, not ~2.25 m. Raising the 2–3 m band to 0.3 and the 3–4 m band to 0.1 lifts the mid stands to **~17 % (Upper) and ~21 % (Lower)**. The target therefore depends on the sim's own water clarity, as it should.
- **Old method, new bed.** The `weed_bed_structure.md` §1 bands (0–0.5 m 20–40 %, 0.5–1 40–70 %, 1–2 40–70 %, 2–3 15–40 %, 3–4 0–15 %) applied to the new hypsography still give **21 % (Upper) and 24 % (Lower)**. Those are presence-type frequencies set conservatively, so they fall between the two columns above.
- **Against the models.**
  - The stands column sits with Duarte et al.'s size-only eq. 1 (~20 %) and the low end of eq. 3.
  - The presence column sits with eq. 3 (23–52 %) and with the coloured-water potential area × a 0.5–0.7 fill (Finnish and stained-light limits).
  - Only the clear-water potential area (~80–100 %) and Duarte's eq. 7 (60–75 % mapped) exceed 50 %.

---

## Gaps (overall, and what would settle it)
- **No vegetation survey of either Hot Brook lake exists.** One summer point-intercept survey would replace everything above: ~300 points per lake, a rake, depth and substrate at each point.
- The Lakes of Maine plant lists for MIDAS 1072 and 1076, and DEP or LSM surveys of the Baskahegan-drainage lakes, are the next best. They sit behind bot walls and are not readable here.
- Not obtained:
  - Florida PAC regressions: Canfield & Hoyer; Bachmann et al. 2002.
  - Cheruvelil & Soranno 2008: 403.
  - Vestergaard & Sand-Jensen 2000; Radomski & Perleberg 2012 (MN macrophyte index, which uses littoral frequency): abstracts elided, no open copy.
  - Madsen 1999 and the WDNR 2010 point-intercept protocol: not located.
  - Wile et al. (Ontario soft-water lakes): BHL 403 in an earlier pass.
  - The MABP chapter 6 plot data (Cameron 2000, 30 Maine lakes): maine.gov 403.
- This session's web-search budget was exhausted. Maine, NH and VT agency survey reports were therefore not searched for, and are the most obvious follow-up.

---

## Target for the sim

The gate's "stands" are the summed relative biomass of canopy, floating-leaved, emergent and rosette forms (no *Nitella* meadow), capped at 1 per cell and area-weighted.

| Lake | Stands, central | Stands, plausible range | Any vegetation (incl. *Nitella*/moss meadow), central | Range |
|---|---|---|---|---|
| Upper | **~15 %** | **8–25 %** | **~35–40 %** | 25–55 % |
| Lower | **~17 %** | **8–27 %** | **~45 %** | 30–65 % |

- **Surface-reaching forms:** ~0.3–1 % (NAIP 0.6 % and 0.3 %).
- **The 0–10 m shore band:** mean cover ~0.2–0.25, with ~5–8 % of the shore bare. On rocky stretches cover runs at about half the rate it does on muck or sand.
- **Confidence:** low to moderate for the central values (±~8 points); no survey of either lake exists, and they rest on Maine NLA nearshore cover, Midwest and Adirondack point-intercept frequencies, the Secchi/colour depth limits and the re-measured hypsography. The **upper bound of ~30 % for stands is held with moderate confidence**: no line of evidence for a soft, coloured lake exceeds it, except clear-water potential area and Duarte's eq. 7 mapped-area model.
- **Against the sim:** today's ~50 % is about **three times** the central estimate. The gate's 0.15–0.5 band would accept it. A band of ~**0.08–0.30** for stands would match the evidence, with a separate presence check of ~**0.25–0.60** for any vegetation including the meadow.
