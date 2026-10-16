# Aquatic plants for the 3-D Hot Brook lakes: sourced parameters for a bed biomass field

This note gathers sourced values for modelling aquatic plants as a field on the lake bed: biomass per bed patch per growth form, built from mechanisms. Compiled 2026-10-16.

**The lakes.** Upper and Lower Hot Brook Lake are shallow (5.5 and 3.9 m max), unstratified, coloured (about 30–60 SPU), soft (alkalinity about 3–6 mg/L CaCO₃) and mesotrophic. Secchi is 2.5–4 m. Ice lies from about Dec 1 to Apr 23.

**What this extends.** It builds on three earlier notes:
- `Hot Brook populations and water/invertebrates_plankton_plants.md` §6 (Maine community types, first biomass figures);
- `Maine lake shores and catchment/shore_geometry_and_vegetation.md` (shore zones, MNAP marsh types);
- `shallow_lake_3d_physics.md` §2 (weed-bed hydrodynamics).

**Tags.**
- [read]: the value was seen in the source text, a rendered table, or the abstract.
- [2°]: read in a review that cites the original.
- [snippet]: from a search summary only.
- (inf): my arithmetic or judgement.

Four parallel literature passes did the reading (light, biomass, nutrients, effects), plus my own reads.

---

## 0. Takeaways

1. **Colour sets the depth limit, and the depth limit decides most of these lakes.**
   - Clear-water Secchi regressions put angiosperms to 3.2–4.2 m at Secchi 3 m.
   - Stained water attenuates PAR about 45% faster at the same Secchi, so the 21%–10% light depths are only 1.7–2.6 m. The humic-lake (Finnish) regression gives 2.65 m.
   - On the 3-D model's bed, 2.3 m leaves about 30% of each lake vegetable; 4 m would give 78% of Upper and 100% of Lower.
   - Derive the limit from a light-driven carbon balance, not a Secchi formula.
2. **The water is soft (Hellquist Group I/II).** Expect *Potamogeton epihydrus*, *natans*, *spirillus*, *oakesianus*, *pulcher*, *amplifolius*, *robbinsii* and *gramineus*. There is no sago or curly-leaf pondweed and little *Chara*. *Nitella*, mosses and bladderworts are the deep and low forms, isoetids grow on sand and gravel, lilies on mud, and bulrush and pickerelweed at the edges.
3. **Five growth forms:** emergent, floating-leaved, submerged canopy, isoetid rosette, and deep low meadow. They differ ten-fold or more in light need, biomass, growth rate, litter quality and structure.
4. **Peak biomass** (g DW m⁻²):

   | Form | Peak | Note |
   |---|---|---|
   | Canopy stands | 50–150 | up to ~250 in sheltered coves |
   | Isoetids | 30–120 | |
   | *Nitella*/moss | 10–60 | |
   | Floating-leaved | 100–300 | ~75% below ground |
   | Emergent | 500–1,500 | ~half below ground |
5. **Season.**
   - Wintergreens grow from ice-out (~4 °C); rhizomes from ~8–10 °C; tubers ~13 °C.
   - Peak is late July–August, and senescence starts early to mid September.
   - About 20–30% of peak survives the winter (PCLake `fWinVeg` 0.3).
6. **Growth.**
   - Canopy net RGRmax is 0.05–0.10 d⁻¹ at 20 °C; isoetids 0.003–0.01 d⁻¹.
   - Base temperature is ~3 °C and Q10 is 2.3–3.5. The 28–32 °C optimum is never reached here.
   - A canopy needs about 6× a leaf's light to break even (106 against 16 µmol m⁻² s⁻¹).
7. **Nutrients.**
   - Tissue holds ~2% N and ~0.15% P (Droop limits 1.0–3.5% and 0.08–0.35%).
   - Roots supply 70–100% of the P (Carignan 1982 formula). Live shoots don't leak.
   - Litter is two-pool. Soft tissue is 60–72% labile (k ~0.1 d⁻¹); emergent litter is 84–88% refractory (k ~0.0026 d⁻¹).
8. **Effects.**

   | Effect | Threshold or size |
   |---|---|
   | Zooplankton refuge | appears above 15–20% plant volume inhabited (PVI); lost above ~1–4 small fish/m² |
   | Predator capture | collapses from 50 to 250 stems/m² |
   | Small-sunfish growth | best at ~50 g DW/m² |
   | Plant-dwelling invertebrates | ~5 mg DW per g plant |
   | Inside beds | current −90%; resuspension −35–65% |
   | Night hypoxia | only where the canopy fills more than half the depth |
9. **No Hot Brook plant survey was readable.** Ask the user, who fishes there, where the weeds and lilies are.

---

## 1. Community and growth forms

**Soft water.** [Hellquist 1980](https://archive.org/download/biostor-138628/biostor-138628_djvu.txt) (Rhodora 82:331; 321 New England sites) [read] gives mean alkalinity by drainage as mg HCO₃⁻/L.
- Kennebec + Penobscot **10.9**, Androscoggin 6.5, St John (limestone Aroostook) 56.4.
- Hot Brook drains to the Penobscot. Its analogue Baskahegan Lake has 5.5 mg CaCO₃/L ≈ 6.7 mg HCO₃⁻, which is Group I (0–18.3).

Species medians (mg HCO₃⁻/L):

| Species | Median | Range or n |
|---|---|---|
| *P. confervoides* | 4.3 | |
| *P. bicupulatus* | 5.5 | |
| *P. oakesianus* | 6.1 | |
| *P. pulcher* | 10.4 | |
| *P. spirillus* | 13.4 | |
| *P. epihydrus* var. *ramosus* | 13.4 | n 154 |
| *P. natans* | 20.7 | from 3.1 |
| *P. robbinsii* | 25.6 | from 3.7 |
| *P. amplifolius* | 28.1 | from 4.3 |
| *P. crispus* | 93 | |
| *P. pectinatus* | 113 | minimum 36.6 |

Twelve species grow below pH 6. The mechanism: bicarbonate users are disadvantaged, while CO₂-only plants and isoetids are favoured. *Lobelia* takes 46–98% of its CO₂ from the sediment ([Winkel & Borum 2009](https://pmc.ncbi.nlm.nih.gov/articles/PMC2707917/)) [read].

**Maine.**
- Cameron/MNAP found four types: pipewort–lobelia on mineral soil under 1 m; water-lily beds on organic soil at 0.5–1.5 m; pickerelweed beds; and a circumneutral pondweed–*Vallisneria*–*Elodea* suite.
- Highland Lake frequencies: *P. epihydrus* 81%, *Eriocaulon* 77%, *Nymphoides* 47%, *Brasenia* 31%, *Utricularia intermedia* 26%, *Lobelia* 24%, *Nuphar* 20%, *Nymphaea* 13%, *Isoetes* 13% (earlier note; [MNAP ch. 6](https://www.maine.gov/dacf/mnap/publications/aquatic/chapter_6_6.1to6.4.pdf)).
- "Highly colored lakes had plant communities primarily composed of *Scirpus* and floating-leaved plants" ([USGS WRI 80-69](https://pubs.usgs.gov/wri/1980/0069/report.pdf)).
- Maine's invasive threat is variable milfoil. Hot Brook is "none known" [snippet].

**Five forms.** Depths are from Wisconsin's survey ([Nichols 1999, WGNHS B96](https://wgnhs.wisc.edu/pubshare/B096.pdf); maxima read off boxplots ±10 cm) [read] and clear Lake George NY ([Sheldon & Boylen 1977](https://dspace.rpi.edu/server/api/core/bitstreams/4d586e94-41ec-494c-9030-71f5094a1cdc/content)) [read].

| Form | Hot Brook members | Depth (typical; maximum) | Bed |
|---|---|---|---|
| **EM emergent** | pickerelweed, bulrushes, bur-reed, arrowhead, spikerush; cattail in marsh coves | 0–1 m; *Typha* ≤ 1.2, *Sparganium angustifolium* 1.5, *Pontederia* 1.9; none ≥ 2 m (Lake George) | organic, sheltered |
| **FL floating-leaved** | *Nuphar variegata*, *Nymphaea odorata*, *Brasenia*, *P. natans*, *P. epihydrus*, *Nymphoides* | median ~1 m, Maine beds 0.5–1.5; *Nuphar* ~2.1, others ~2.9 | organic mud, coves |
| **SC submerged canopy** | *P. amplifolius*/*robbinsii*/*spirillus*, *Elodea*, native milfoils, *Najas flexilis*, *Vallisneria*, *Utricularia* (rootless), *Schoenoplectus subterminalis* | 0.5 m → light limit; WI maxima 3.2–4.5; Lake George 7–12 | soft mud |
| **IS isoetid rosette** | *Eriocaulon*, *Lobelia*, *Isoetes*, *Littorella*, rosette *Sagittaria graminea*, *Eleocharis acicularis* | 0–1.5; WI maxima 2.4–3 | sand and gravel, wave-washed |
| **DM deep low meadow** | *Nitella*, mosses (*Fontinalis*), rare *Chara* | below SC to the deepest lit bed | organic mud |

---

## 2. Depth limits and light

### 2.1 Secchi regressions at Hot Brook's Secchi (m, log₁₀)

| Source | Equation | Zc at SD 2.5 / 3 / 4 |
|---|---|---|
| [Chambers & Kalff 1985](https://doi.org/10.1139/f85-090), angiosperms [read] | Zc^0.5 = 1.33 log SD + 1.40 | 3.72 / 4.14 / 4.84 |
| — bryophytes | Zc^−0.5 = −0.48 log SD + 0.81 | 2.61 / 2.96 / 3.68 |
| — charophytes | log Zc = 0.87 log SD + 0.31 | 4.53 / 5.31 / 6.82 |
| — depth of maximum biomass | Zb^0.5 = 0.54 log SD + 1.15 | 1.86 / 1.98 / 2.18 |
| [Canfield et al. 1985](https://apms.org/wp-content/uploads/japm-23-01-023.pdf), pooled [read, rendered scan] | log Zc = 0.61 log SD + 0.26 (r² 0.56; 95% CL 46–236%) | 3.18 / 3.56 / 4.24 |
| — **Finland** (27, mostly humic) | 0.51 log SD + 0.18 (r² 0.82) | **2.42 / 2.65 / 3.07** |
| — Wisconsin (55); Florida (26) | 0.79/0.25; 0.42/0.41 | WI 3.67 / 4.24 / 5.32 |
| [Middelboe & Markager 1997](https://doi.org/10.1046/j.1365-2427.1997.00183.x), Table 3 via [DCE 2018 p.16](https://dce.au.dk/fileadmin/dce.au.dk/Udgivelser/Notater_2018/Light_requirements_of_marine_rooted_macrophytes.pdf) [read] | caulescent 0.37 + 0.95 SD; charophytes 0.17 + 1.19 SD; bryophytes 0.56 + 0.73 SD; *Isoetes* 0.58 + 0.59 SD; rosettes 0.88 + 0.38 SD | at SD 3: 3.22, 3.74, 2.75, 2.35, 2.02 |
| [Azzella et al. 2014](https://jlimnol.it/jlimnol/article/download/jlimnol.2014.932/639/3830), Italian clear lakes [read] | Zc = 1.39 SD + 1.37 | 4.84 / 5.54 / 6.93 |

Middelboe & Markager [read abstract]:
- Zc is linear in SD over 1–4 m.
- **Rosette plants have the shallowest Zc in every lake type.**
- The light requirement rises about 0.04% of surface light per degree of latitude.

Søndergaard et al. 2013 (757 European lakes) [read abstract] trust Zc as an indicator only below 60 mg Pt/L colour, which is Hot Brook's edge.

### 2.2 Light at the limit, and photosynthesis parameters

**Light at the depth limit**
- Chambers & Kalff 1985 [read] give the growing-season mean as **21%** of surface light for angiosperms and bryophytes and **11%** for charophytes.
- Other estimates:
  - "at least 10%" (Florida; [IFAS FA163](https://ask.ifas.ufl.edu/publication/fa163)) [2°];
  - "more commonly 5–10%" ([Barko et al. 1984, TR A-84-3](https://apcrp.el.erdc.dren.mil/elpubs/pdf/tra84-3.pdf)) [read];
  - Florida spot readings at Zc of 0.46–8.7% (*Hydrilla* 0.46–1.2%; Canfield Table 2) [read].
- *Lobelia* (25 Polish soft-water lakes) has median Zc 0.8 m (0.1–2.2), Zc ≈ SD/3, at **~43%** (34–50%) of subsurface PAR ([Borowiak et al. 2017](https://doi.org/10.1515/limre-2017-0016)) [read].
- *Nitella flexilis* grows at 2.2% (≈190 mol m⁻² yr⁻¹, inf) ([1981](https://doi.org/10.1002/iroh.19810660506)) [read], and bryophytes on 20–95 mol m⁻² yr⁻¹ [read].
- The "15/5/2%" per-group figures attributed to Middelboe & Markager were not verified [snippet].

**Photosynthesis versus light**
- [Binzer et al. 2006](https://doi.org/10.4319/lo.2006.51.6.2722) (via DCE) [read]: compensation is a median **16** µmol m⁻² s⁻¹ for tissue (5–52) but **106** for communities (40–226). Ik is 128 against 407, and communities are not saturated at about 2,000.
- Lake George shoots at 20 °C, compensation / K½ ([Madsen et al.](https://dspace.rpi.edu/server/api/core/bitstreams/a7a8bb06-0c45-44b0-94c1-2eb34b701a2e/content); read off a figure ±2) [read]:

  | Species | Compensation | K½ |
  |---|---|---|
  | *Vallisneria* | 10 | 26 |
  | *Elodea* | 12 | 26 |
  | *P. amplifolius* | 12 | 31 |
  | *P. robbinsii* | 20 | 38 |
  | *P. gramineus* | 22 | 43 |
  | *M. spicatum* | **37** | **92** |

  *M. spicatum* is the most light-demanding.
- Other compensation points:
  - *Hydrilla* 15, *Ceratophyllum* 35, *Cabomba* 55 (Van et al. 1976, in Canfield) [read].
  - *Chara*/*Nitella* 4–20 (Ik 29–130) and deep *Nitella* 1.5–2.3 [snippet].
  - K½ < 10 for whole shoots at low or high alkalinity ([Kahara & Vermaat 2003](https://www.vliz.be/imisdocs/publications/ocrd/57141.pdf)) [read].
- Model defaults:
  - CHARISMA: light K½ **100 µE m⁻² s⁻¹** (30 for *P. pectinatus*); periphyton takes 20% of light; PAR is 50% of shortwave; reflection 10% ([manual](https://www.projectenaew.wur.nl/charisma/download/charisma_manual.pdf)) [read].
  - PCLake: `hLRefVeg` 17 W m⁻² PAR at 20 °C ≈ 78 µmol (inf), scaled by the production temperature function. Its light limit is integrated over the canopy as (1/(Kd·h))·ln[(1+I_top/K)/(1+I_bot/K)] ([FABM-PCLake source](https://github.com/fenjuan/pclaketestsrc)) [read].
- Self-shading:
  - *M. spicatum* ~0.006 and *Vallisneria* 0.013–0.019 m² g⁻¹ DW ([Titus & Adams 1979](https://www.doi.org/10.1007/BF00345324)) [snippet];
  - CHARISMA 0.01–0.02 and PCLake `cExtSpVeg` 0.01 [read].
- Epiphytes cause about 50% of light attenuation at the leaf in enriched lakes (Sand-Jensen & Søndergaard 1981) [read abstract]. At mesotrophic levels they out-produce their hosts only in spring and autumn ([Cattaneo & Kalff 1980](https://doi.org/10.4319/lo.1980.25.2.0280)) [read].

### 2.3 Coloured water

- **Attenuation per Secchi.** [Koenings & Edmundson 1991](https://doi.org/10.4319/lo.1991.36.1.0091) [read] give median Kd·SD of **1.86 for clear lakes and 2.70 for stained lakes** (1.81–3.83), against 0.93 for turbid lakes. The 3-D sim uses Secchi = ln10/Kd (Kd·SD 2.30; `chem3.js`).
- **Depth for a given Secchi.** "For any Secchi depth, aquatic angiosperms colonized to greater depths in lakes with low colour" ([Chambers & Prepas 1988](https://doi.org/10.1139/f88-124)) [read abstract].
- **Light budget.** CDOM absorbs a mean 57% of PAR photons (37–76%), almost all the blue. Water absorbs 29.5% and phytoplankton 6.6% ([Thrane et al. 2014](https://link.springer.com/content/pdf/10.1007/s10021-014-9776-2.pdf), 75 boreal lakes) [read]. Deep light is orange-red (inf).
- **Kd from Secchi, not DOC.**
  - Brezonik 1978, 1/SD = 0.106 + 0.128·NTU + 0.0025·colour, gives SD 2.9 m at colour 45 and 1 NTU ([in Brezonik et al. 2019](https://www.lccmr.mn.gov/projects/2016/finals/2016_04i_EcologicalApplication.pdf)) [read]. That is consistent with Hot Brook's analogue.
  - Morris et al. 1995, Kd = 0.22·DOC + 0.07·chl − 0.05 ([via Zwart 2015](https://esapubs.org/archive/ecol/E096/197/appendix-A.pdf)) [read], gives Kd 1.55 at DOC 6: too dark for SD 3.
  - So drive Kd from Secchi (≈ 2.4–2.7/SD).

**Depth (m) of key light levels** (inf; stained Kd = 2.70/SD, with the sim's 2.30/SD in brackets):

| SD | 43% (*Lobelia*) | 21% (angiosperms) | 11% (charophytes) | 5% | 2.2% (*Nitella*) |
|---|---|---|---|---|---|
| 2.5 | 0.78 | 1.45 (1.70) | 2.04 (2.40) | 2.77 (3.26) | 3.53 |
| **3.0** | **0.94** | **1.73 (2.04)** | **2.45 (2.88)** | **3.33 (3.91)** | **4.24** |
| 4.0 | 1.25 | 2.31 (2.71) | 3.27 (3.84) | 4.44 (5.21) | 5.65 |

**Predicted limits at SD 3 m, colour ~45** (inf):

| Form | Depth limit |
|---|---|
| Canopy angiosperms | 2.0–2.7 m (Finnish 2.65; clear-water 3.2–4.1 as the upper bound) |
| *Nitella*/moss | 2.8–3.5 m, sparse to ~4.2 |
| *Isoetes* | ~2 m |
| *Lobelia*/*Eriocaulon* | 0.9–1.2 m |
| Floating-leaved | ~2.5 m, set by petiole reach |
| Emergent | ≤ 1–1.5 m |

### 2.4 What the limit means for these basins

These figures come from the 3-D model's bed (`src/w3/geometry.js`, the 1949 soundings) (inf). Each cell is the % of bed shallower than the column depth:

| Lake | 1 m | 1.5 | 2 | 2.5 | 3 | 3.5 | 4 | 4.5 |
|---|---|---|---|---|---|---|---|---|
| Upper | 5 | 15 | 24 | 34 | 44 | 59 | 78 | 86 |
| Lower | 6 | 12 | 22 | 34 | 56 | 83 | 100 | — |

- A canopy limit of ~2.3 m vegetates about 30% of each bed.
- A *Nitella*/moss meadow to ~3.3 m reaches about 53% of Upper and 72% of Lower.
- Clear-water regressions would vegetate 65–85% of Upper and 90–100% of Lower.

Lower's 2.5–3.9 m saucer sits at the angiosperm margin. A year's colour, algae or snow flips its centre between sparse beds and bare mud, which is a testable emergent property of the model.

### 2.5 Under ice

- Ten of 26 Lake George species held density and productivity through winter, with maximum winter photosynthesis 10–20% of summer ([Boylen & Sheldon 1976](https://doi.org/10.1126/science.194.4267.841)) [read].
- *P. amplifolius* deeper than 3 m and *P. robbinsii* stay productive. *Vallisneria* does not ([memos](https://dspace.rpi.edu/server/api/core/bitstreams/e742a406-372f-4003-b2da-24e78f70a891/content)) [read].
- Snow has albedo 0.74–0.92 and attenuates at 14–25 m⁻¹. Clearing snow raises under-ice PAR 2.5–20×, and clear ice passes ~87% ([data](https://kirj.ee/public/va_ge/geo-2006-1-1.pdf)) [snippet]. The sim's `ICE.LIGHT_CUT` 0.6 is generous (HOT_BROOK_3D §3).

---

## 3. Biomass, season, growth

### 3.1 Standing biomass (g DW m⁻²)

**Submerged canopy**
- Lake George (oligotrophic, soft): *P. amplifolius* 80 g AFDW at 3 m and *P. robbinsii* 50 at 7 m ([Clesceri et al. 1975](https://dspace.rpi.edu/server/api/core/bitstreams/e52f5fd4-ea7e-4877-8185-f811390b0cee/content)) [read], ≈ 90–100 g DW (inf).
- USACE model calibration series [read]:
  - *Vallisneria* (Chenango Lake NY) 50 g on Aug 8 ([VALLA](https://web.archive.org/web/2010id_/http://el.erdc.usace.army.mil/elpubs/pdf/srel01-1.pdf));
  - sago 78.5 g on Aug 21, at a "Maine-like" climate site ([POTAM](https://web.archive.org/web/2010id_/http://el.erdc.usace.army.mil/elpubs/pdf/srel03-1.pdf));
  - *M. spicatum* (eutrophic Lake Wingra) 220 g in mid-September ([MILFO](https://web.archive.org/web/2010id_/http://el.erdc.usace.army.mil/elpubs/pdf/ira99-1.pdf)).
- *P. perfoliatus* 17 g (poor site) to 200 g (rich site), at 90–210 ramets m⁻² ([Wolfer 2008](https://edepot.wur.nl/122044)) [read].
- Hard-water Minnesota marl lakes ([USGS OFR 93-143](https://pubs.usgs.gov/of/1993/0143/report.pdf)) [read], by depth band: 0–1 m 171–637; 1–2 m 410–441; 2–3 m 318–430; 3–4 m 244–280; 4–5 m 112–125; 5–6 m 29–61. The bed-wide mean is ~250–280 (inf), and cover reached 55% of Williams Lake. Treat these as an upper bound for soft water.
- Lake-average biomass rises with alkalinity and with gentler slope. Slope explained 72% of maximum biomass in Lake Memphremagog, and 88% with sediment organic matter (Duarte & Kalff 1986, 1990) [snippet]. Hot Brook's flat floors favour biomass per vegetated m² (inf).

**Isoetids and charophytes**
- Lake Kalgaard: isoetids covered 40% of the bed, at 66–112 g organic DW and with little seasonal swing ([Sand-Jensen & Søndergaard 1979](https://doi.org/10.1111/j.1365-2427.1979.tb01481.x)) [read].
- Lake Baciver: *Isoetes* 120–460, lower in the ice-scoured shallows; *Nitella* 11; lake mean 140 [snippet].
- *Chara*: 209 to over 2,000, but that is hard water [snippet].

**Floating-leaved**
- European lilies ([Klok & van der Velde 2017](https://pmc.ncbi.nlm.nih.gov/articles/PMC5410161/)) [read]:
  - leaf blades 51–215 (*Nuphar*) and 139–183 (*Nymphaea*) g AFDW;
  - leaf production 96–447 g AFDW yr⁻¹; P/Bmax 1.35–2.25; LAI 0.4–2.8;
  - leaves live 38–48 d on average (7–92 d).
- *Nuphar* (NC): 115–300 total, 77% below ground [snippet].
- *P. epihydrus*: 94 (81 above ground) ([Heisey & Damman 1982](https://pure.psu.edu/en/publications/biomass-and-production-of-pontederia-cordata-and-potamogeton-epih/)) [read].

**Emergent**
- *Pontederia*: 1,212 at peak (524 above, 688 below), 100–150 days after spring growth from 497 overwintered. Below:above rises from 0 to 1.71 by autumn (Heisey & Damman) [read].
- *Typha* (Minnesota): shoots 583–2,115 (mean 1,371), about 27 g per shoot (inf). Peak is mid–late August, and shoots are 26% below peak by mid-October ([Pratt et al. 1980](https://www.lrl.mn.gov/docs/2009/other/091102.pdf)) [read].

### 3.2 Season and overwintering

**Growth onset**
- Lake George [read]:
  - *P. amplifolius* starts **right after ice-out** (mid-April), has floating leaves by early July, and dies back in early autumn.
  - *Vallisneria* starts in **mid-June** and dies back in September.
  - *Najas* (annual) germinates in late June and dies in late August.
  - Plants deeper than ~5 m stay vegetative under ice.
- Start temperatures:
  - growth base 3 °C (USACE) [read]; PCLake onset 9 °C [read];
  - tubers sprout at 13 °C (*Vallisneria*) and 15 °C (*Hydrilla*) [snippet];
  - *P. crispus* turions: 5.6 °C base plus 178 degree-days [snippet];
  - *Elodea* regrows below 5 °C [snippet];
  - *P. nodosus* makes floating leaves only at 20–32 °C [read].
- European lily leaves appear from Apr 28 to Jun 7, limited by temperature, not light [read].

**End of season**
- PCLake [read]: the growing season ends on day 259 (Sep 16), followed by 15 days of reallocation. Then mortality leaves `fWinVeg` 0.3. The root fraction is 0.1 in summer and 0.6 in winter.
- Measured winter carry-over [read]:
  - *M. spicatum*: ~50 g live shoots + 50 g root crown against a 220 peak, ≈ 23% green (inf).
  - Sago tubers: ~25%.
  - *P. perfoliatus* turions: 5%, formed ~Sep 7 and sprouting ~Apr 24.
- *Utricularia* turions end dormancy around late October and are 9–70% starch ([Adamec 2011](https://www.butbn.cas.cz/adamec/FAL11Turions.pdf)) [read].
- Evergreens:
  - *Lobelia* makes and loses leaves all year ([Farmer 1987](https://doi.org/10.1111/j.1469-8137.1987.tb00144.x)) [read].
  - *Nitella gracilis* survives under ice, while *N. opaca* is annual [snippet].
- MNAP: pickerelweed, bulrush and lilies die back below the water in late September–October.

**Hot Brook calendar** (inf):

| When | What happens |
|---|---|
| Ice-out (~Apr 23, ~4 °C) | evergreens grow |
| Early–mid May (~8–10 °C) | rhizome species start |
| Late May (~13 °C) | tubers sprout |
| June | *Najas* germinates; floating leaves reach the surface late May–June |
| Late July–August | peak |
| Early–mid September | storage forms |
| October | shoots senesce |
| Ice-on (~Dec 1) | annual shoots gone |

Carry-over is ~20–30% for canopy plants, 40–75% for rhizome plants (emergent and floating-leaved), and 70–100% for evergreens.

### 3.3 Growth rates and temperature

- *Potamogeton* RGR is 0.057–0.070 d⁻¹ [snippet].
- Model rates:
  - CHARISMA [read]: gross pMax 0.01 g g⁻¹ h⁻¹ at 20 °C; respiration 0.024 d⁻¹ (Q10 2). That gives a net ~0.04–0.06 d⁻¹ at half-saturating light over a long day (inf).
  - PCLake [read]: `cMuMaxVeg` 0.2 d⁻¹ default (0.1 in the FABM test); dark respiration 0.02 d⁻¹.
  - USACE models [read]: Pmax 0.0165–0.019 g CO₂ g⁻¹ h⁻¹; shoot death 0.021–0.047 d⁻¹ at ≤ 19 °C, doubling by 30 °C.
- Temperature multipliers on Pmax (USACE) [read]:

  | Species | 5 °C | 10 °C | 15 °C | 20 °C | 25 °C |
  |---|---|---|---|---|---|
  | *M. spicatum* | 0.18 | 0.23 | 0.40 | 0.63 | 0.78 |
  | *Vallisneria* | 0.12 | — | 0.42 | 0.57 | 0.74 |
  | Sago | — | 0.03 | — | 0.53 | — |

- The CHARISMA/MEGAPLANT Hill function f(T) = 1.35T³/(T³+14³) gives 0.06, 0.36, 0.75, 1.00 and 1.13 at 5, 10, 15, 20 and 24 °C [read; computed].
- Growth Q10 is 2.3–3.5 over 5–15 °C, and *Elodea* growth is "nearly arrested" at 5 °C ([Madsen & Brix 1997](https://link.springer.com/doi/10.1007/s004420050165)) [snippet].
- The optimum is 28–32 °C, and *Vallisneria* is "severely restricted" below 20 °C (Barko et al. 1984) [read].
- PCLake's production Q10 of 1.2 is too flat against these data (inf).
- **Isoetids** produce 5–425 g m⁻² yr⁻¹, against 300–1,500 for other submerged plants. *I. echinospora* turns its leaves over 1.5–1.6 times a year, and 30–50% of production goes below ground ([Chappuis et al. 2016](https://limnetica.com/documentos/limnetica/limnetica-35-2-p-373.pdf)) [read]. That implies RGR ~0.003–0.01 d⁻¹ (inf).
- *Pontederia* (whole plant): ~0.007 d⁻¹ mean over the season (inf).

### 3.4 Canopy architecture

- *M. spicatum* holds 68% of its shoot mass in the top 30 cm; *Vallisneria* holds 62% in the bottom 30 cm [snippet].
- *P. amplifolius* reaches the surface in 0–3 m but grows only 1–3 m tall at 3–5 m. *P. robbinsii* is under 0.5 m, and *Vallisneria* and *Najas* 0.3–0.6 m [read].
- *P. perfoliatus* reached 285 cm at a rich site and 48 cm at a poor one [read].
- Growth allocation (leaves/stems/roots) [read]: sago 0.73/0.18/0.09; milfoil 0.47/0.47/0.06; *Vallisneria* 0.72/0.16/0.12.
- **Stems per gram** (inf): ~0.2–1 g DW per shoot at peak (*P. perfoliatus*). So 100 stems m⁻² ≈ 20–100 g and 1,000 ≈ 200–1,000 g. Lake George *P. robbinsii* and *Isoetes* beds held 100–1,000 plants m⁻² [read].

---

## 4. Nutrients, carbon, oxygen, litter

### 4.1 Tissue

- Critical contents are **1.3% N and 0.13% P**. Field P often sat at or below critical, while N did not ([Gerloff & Krombholz 1966](https://doi.org/10.4319/lo.1966.11.4.0529)) [read].
- Leaf means by form, from 707 samples in arid NW China lakes ([Gong et al. 2018](https://doi.org/10.3389/fpls.2018.01398)) [read]:

  | Form | C | N | P |
  |---|---|---|---|
  | Submerged | 36.5% | 2.05% | 0.15% |
  | Floating-leaved | 40.1% | 2.66% | 0.20% |
  | Emergent | 41.6% | 2.12% | 0.14% |

- Minnesota plants: N ≈ 2.0%, P 0.25% [snippet].
- *Lobelia* has the lowest contents of the plants tested ([Sand-Jensen et al. 2005](https://doi.org/10.1093/aob/mci214)) [read]. On organic mud, iron plaques on its roots bind P ([Christensen & Sand-Jensen 1998](https://doi.org/10.1139/b98-181)) [read]. This is one reason isoetids lose there.
- PCLake [read]:
  - Droop bounds N 0.010–0.035 and P 0.0008–0.0035 g/g DW; C 0.4–0.45.
  - Uptake Vmax 0.01 mg P (0.1 mg N) per mg DW per day, half-saturation 0.05 mg P/L (0.5 mg N/L), shut off near the maximum quota.
- Dry mass is 4–16% of fresh mass, and ash mostly 15–30% of dry mass ([FAO FTP 531](https://fao.org/4/i1141e/i1141e06.pdf)) [read].

### 4.2 Roots or shoots

- In situ, sediment supplied all of the P in mesotrophic water and 72% under hypertrophic water ([Carignan & Kalff 1980](https://doi.org/10.1126/science.207.4434.987)) [read].
- [Carignan 1982](https://doi.org/10.1139/f82-034) [read] gives the root share = 99.8/(1 + 2.66·(s/w)^−0.83), where s/w is the ratio of pore-water to open-water dissolved reactive P. PCLake uses it for both N and P. It gives 27% at s/w = 1, 72% at 10 and 94% at 100 (inf).
- *M. spicatum* in Lake Wingra [read] ([Smith & Adams 1986](https://doi.org/10.4319/lo.1986.31.6.1312)):
  - It took 3.0 g P m⁻² yr⁻¹, 2.2 g of it through roots.
  - Healthy shoots released insignificant P.
  - Shoot turnover moved ~2 g P m⁻² yr⁻¹ from sediment to water.
- P is released by decay, not excretion ([Barko & Smart 1980](https://doi.org/10.1111/j.1365-2427.1980.tb01198.x)) [read].
- *Nuphar* pumps P from roots to leaves at about 4× the reverse flow, and secretes it in summer ([Twilley et al. 1977](https://doi.org/10.4319/lo.1977.22.6.1022)) [read].
- Foliar N uptake exceeds root uptake once water NH₄ is around 0.1 mg/L ([Nichols & Keeney 1976](https://doi.org/10.1111/j.1365-2427.1976.tb01598.x)) [read].
- Isoetid roots supply 87% of the plant's P [read]. More than 97% of *Lobelia*'s O₂ exits through its roots, so an isoetid lawn oxidises the bed [read].
- Emergents resorb up to 82% of their P before senescence [2°].

### 4.3 Plants in the P cycle

- Decaying milfoil carried about half the dissolved P and DOM flux from the littoral to open water in Lake Wingra ([Carpenter 1980](https://doi.org/10.2307/1936834)) [read].
- Senescing milfoil supplied up to 18% of a reservoir's annual P load but no more than 2.2% of its N ([Landers 1982](https://doi.org/10.4319/lo.1982.27.3.0428)) [read].
- Oxic sediment P release rose from under 0.5 mg m⁻² d⁻¹ at pH 7 to 2–3 at pH 8.5 ([James et al. 2001](https://apps.dnr.wi.gov/doclink/lakes_grants_reports/Half%20Moon%20Lake%20Report%202000%20f.pdf)) [read]. This is unlikely in Hot Brook's soft water except inside dense beds (inf).

### 4.4 Oxygen

- PCLake [read]: 1.07 g O₂ per g DW produced (PQ 1, C 0.4); respiration 0.02 d⁻¹ at 20 °C ≈ 0.021 g O₂ g⁻¹ d⁻¹, Q10 2.
- The photosynthetic quotient is ~0.5 when charophytes calcify ([Pedersen et al. 2013](https://pmc.ncbi.nlm.nih.gov/articles/PMC3659369/)) [read].

### 4.5 Litter

Two-pool fits to Godshalk & Wetzel 1978 ([Cunha-Santino & Bianchini 2006](https://www.revistas.ufrj.br/index.php/oa/article/view/5655)) [read; rows rebuilt from a garbled table; incubation temperature not stated]:

| Litter | Labile % | k (d⁻¹) | Refractory % | k (d⁻¹) |
|---|---|---|---|---|
| *M. heterophyllum* | 60 | 0.14 | 40 | 0.0041 |
| *Najas flexilis* | 65 | 0.09 | 35 | 0.0021 |
| *Nuphar variegata* | 72 | 0.13 | 28 | 0.0034 |
| *Scirpus subterminalis* | 52 | 0.02 | 48 | 0.0026 |
| *Scirpus acutus* (emergent) | 16 | 0.59 | 84 | 0.0026 |
| *Typha latifolia* | 12 | 1.50 | 88 | 0.0026 |

- Single-pool k (d⁻¹):
  - *Elodea* 0.026, *P. crispus* 0.021, *Typha* 0.007 ([Hill & Webster 1982](https://experts.umn.edu/en/publications/aquatic-macrophyte-breakdown-in-an-appalachian-river/)) [read];
  - *P. pectinatus* 0.0205, losing 60% of its P in 7 days ([Howard-Williams & Davies 1979](https://doi.org/10.1111/j.1365-2427.1979.tb01482.x)) [read].
- *P. crispus* lost 40% of its P in 2 days [read].
- Submerged *Typha* lost half in 325 days ([Davis & van der Valk 1978](https://doi.org/10.1139/b78-073)) [read].
- Decay Q10 is ~3 ([Carpenter & Adams 1979](https://doi.org/10.4319/lo.1979.24.3.0520)) [read].
- PCLake [read]:
  - 25% of the N and P is released dissolved at death.
  - 10% of dead shoots go to water detritus, the rest to the bed.
  - Detritus decays at 0.01 d⁻¹ (water) and 0.002 d⁻¹ (bed) at 20 °C.
  - 15% of decomposed bed detritus becomes humus, decaying at 10⁻⁵ d⁻¹.

---

## 5. Ecological effects

### 5.1 Zooplankton refuge

**When the refuge holds**
- [Schriver et al. 1995](https://doi.org/10.1111/j.1365-2427.1995.tb01166.x) [read], eighteen 100-m² enclosures:
  - Large cladocerans and clear water held when **PVI exceeded 15–20%** and fish were below CPUE 10 (about 2 fry m⁻²).
  - Without plants zooplankton stayed low at any fish density.
  - Biomass fell with fish × PVI.
- [Perrow et al. 1999](https://doi.org/10.1023/A:1017005803941) [read]:
  - PVI of 30–40% may be needed.
  - 0.2 fry m⁻² can crash spring *Daphnia*.
  - At 1 fish m⁻², with perch in the plants and roach outside, the refuge is nullified.
- The refuge "almost disappeared" above ~4 fish m⁻². Lilies and reeds give little refuge because their stems are sparse (Jeppesen et al. 1998, [FAO ch. 5](https://www.fao.org/4/X7580E/X7580E05.htm)) [2°].
- Open-water cladocerans packed a 2-m bed by day (3,430 L⁻¹) and left at night, so the bed edge is the refuge. Plant-dwelling *Simocephalus* reached 11–171 L⁻¹ and *Eurycercus* 7–28 L⁻¹ ([Lauridsen et al. 1996](https://doi.org/10.1093/plankt/18.12.2283)) [read].

**Behaviour and predators**
- *Daphnia* avoid plants without fish cues: 80% stayed in the open zone ([Lauridsen & Lodge 1996](https://doi.org/10.4319/lo.1996.41.4.0794)) [read].
- The refuge worked against roach but not perch, which forage inside plants ([Burks et al. 2001](https://doi.org/10.4319/lo.2001.46.2.0230)) [read]. Juvenile perch were unaffected at 600 stems m⁻², while rudd planktivory fell above 200 (Winfield 1986) [2°].
- Insect and shrimp predators living in the plants removed ~80% of cladocerans ([González Sagrario & Balseiro 2009](https://doi.org/10.1111/j.1365-2427.2008.02152.x)) [read].

**Coloured and lily-stand lakes**
- 31 North American and New Zealand lakes showed **no diel horizontal migration** ([Lauridsen et al. 1999](https://doi.org/10.1007/978-94-017-2986-4_26)) [read]. North American *Daphnia* stayed pelagic and *Ceriodaphnia* littoral. *Daphnia* persisted at fish levels that eliminated it in New Zealand, with colour suggested as the reason. **Colour is itself a lake-wide refuge.**
- Water by a lily stand held under 10 µg/L chlorophyll against more than 100 in the adjacent basin, with cladocerans sheltering among the lilies by day ([Timms & Moss 1984](https://doi.org/10.4319/lo.1984.29.3.0472)) [read].

### 5.2 Fish

**Stem density and predation**
- Bass captures of bluegill were similar at 0 and 50 stems m⁻² and **near zero at 250 and 1,000** ([Savino & Stein 1982](https://doi.org/10.1577/1548-8659(1982)111<255:PIBLBA>2.0.CO;2)) [read].
- Bluegill fled to 1,000 stems m⁻² and ignored 50–100 as refuges ([Gotceitas & Colgan 1987](https://doi.org/10.1577/1548-8659(1987)116<40:SBDOAV>2.0.CO;2)) [read]. Predator success is logistic in stem density [read abstract].
- Pike ambushed every prey type, while bass searched for bluegill ([Savino & Stein 1989](https://doi.org/10.1007/BF00001402)) [read]. Pike beat perch around refuges ([Eklöv & Diehl 1994](https://doi.org/10.1007/BF00324223)) [read].
- Perch foraging fell little with plant complexity but fell with darkness ([Diehl 1988](https://doi.org/10.2307/3566064)) [read].
- Young pickerel survived better under ~75% cover [2°].

**Foraging and growth of small fish**
- Small bluegill under bass fed in vegetation at one third of the open-water return, grew 27% less, but survived ([Werner et al. 1983](https://doi.org/10.2307/1937508)) [read].
- Open-water risk was **40–80× higher** ([Werner & Hall 1988](https://doi.org/10.2307/1941633)) [read].
- Growth peaked at intermediate density: 111–177 stems m⁻² (Crowder & Cooper) [read/2°], or ~52 g DW m⁻² (Wiley et al. 1984) [2°].
- Pumpkinseed under 75 mm take 76–91% of their diet from plant fauna (Mittelbach 1984) [read]. Above 80 mm they take more than 80% snails ([Mittelbach et al. 1999](https://fishlab.ucdavis.edu/wp-content/uploads/sites/397/2020/06/Mittelbach-et-al-1999.pdf)) [read].

**Nurseries and whole-lake cover**
- Pop nets caught 9.8 fish m⁻² in intermediate mixed beds against 1.8 in dense *Hydrilla*. The catch was bullhead, banded killifish, pumpkinseed, bass and yellow perch, with white perch throughout ([Killgore et al. 1989](https://doi.org/10.1577/1548-8675(1989)009<0101:DAAOFA>2.3.CO;2)) [read].
- Fish under 120 mm sheltered in beds denser than 200 g DW m⁻² (Engel) [2°].
- Yellow perch were commonest in patchy, species-rich vegetation, and smallmouth on bare ground ([Weaver et al. 1997](https://doi.org/10.1139/f97-130)) [read].
- Game fish do best at **18–40% basin cover** and worse below 10% or above 60% ([MN DNR SP 160](https://www.lrl.mn.gov/docs/2004/other/040655.pdf)) [read].

### 5.3 Invertebrates and periphyton on plants

- Epiphytic invertebrates run 25–676 per g plant (mostly 36–100), and snails are more than 60% of their biomass at most sites ([Wilson & Ricciardi 2009](https://www.redpath-staff.mcgill.ca/ricciardi/Wilson&Ricciardi2009.pdf)) [read]. Coontail held 26.6 g⁻¹ DW ([Colon-Gaud et al. 2004](https://apms.org/wp-content/uploads/japm-42-02-085.pdf)) [read].
- [Cyr & Downing 1988](https://doi.org/10.1139/f88-120) [read abstract]: abundance rises with plant biomass m⁻², sediment organic matter and TP, and falls with depth. Dissected leaves don't generally carry more per gram: *Myriophyllum* > *P. amplifolius* > *P. robbinsii* ≈ *Vallisneria* ([FWB](https://doi.org/10.1111/j.1365-2427.1988.tb00462.x)).
- *P. nodosus* beds held 34,000–44,000 invertebrates m⁻² of bottom, against 1,700–3,300 on bare bottom ([USACE TR A-89-3](https://apcrp.el.erdc.dren.mil/elpubs/pdf/tra89-3.pdf)) [read].
- Non-snail prey fell 2.5× from May to August ([Mittelbach 1981](https://doi.org/10.1139/f81-121)) [read].
- Epiphyton peaks near TP 39 µg/L ([CJFAS 1991](https://doi.org/10.1139/f91-268)) [read]. Snails graze it, which helps the host plant (Brönmark 1989) [read].

### 5.4 Water movement, sediment, oxygen

**Flow and sediment**
- Inside beds the flow was ~0.07 cm/s; a 30 cm/s outside current died within 10–15 cm (Losee & Wetzel 1993) [read].
- Under 525 g m⁻² of milfoil, near-bed shear was ~0. At ~10 g m⁻² it was half the bare value ([James et al. 2004](https://apcrp.el.erdc.dren.mil/elpubs/pdf/apcea-03.pdf)) [read].
- Resuspension fell 53–66% inside beds ([Horppila & Nurminen 2001](https://doi.org/10.1046/j.1365-2427.2001.00765.x)) [read]. Beds accumulate 2–20× more sediment ([Benoy & Kalff 1999](https://doi.org/10.4319/lo.1999.44.4.1081)) [read].
- Clarity improves only once cover reaches 30–50% (Canfield & Hoyer) [2°].

**Stratification and oxygen**
- Canopy stratification needs plants filling at least half the depth (Vilas 2017; physics note) [read].
- In very shallow *Chara* ponds, O₂ ran from 205–235% of saturation in the afternoon to 12–25% at dawn, with pH 9.4–9.6 ([Andersen et al. 2017](https://pmc.ncbi.nlm.nih.gov/articles/PMC5597838/)) [read].
- DO was under 1 mg/L inside dense vegetation at ~50% cover in 0.6–1.3 m bays, while open water stayed above 8 at under 20% cover ([Miranda et al. 2000](https://doi.org/10.1023/A:1003999929094)) [read].
- Floating-leaved *Trapa* beds fell below 2.5 mg/L up to 40% of the time, while *Vallisneria* beds never fell below 5 (Caraco & Cole 2002, Ecol. Appl.) [read]. Floating leaves block reaeration.

### 5.5 Spawning substrate

- Pickerel, golden shiner, banded killifish and yellow perch spawn on plants (FAO ch. 2) [2°].
- Pickerel spawn at 8–11 °C over flooded, mostly dead, vegetation [snippet]. Perch prefer dead submerged stems (Čech 2009) [snippet].
- Killifish attach eggs to plants at 19–24 °C [snippet].

---

## 6. Hot Brook: what is and isn't known

**State and federal records**
- **MDIFW sheets** (1949, revised 1965 and 2004; scans in `tools/hotbrook/data/ifw/`) [read]:
  - They contain no plant record.
  - Both lakes are a "typical warm water lake with excellent spawning and adult habitat for bass, perch, and pickerel". MDIFW says pickerel do well "as long as a lake contains relatively shallow, weedy habitat".
  - The shoreline is "mostly rocky with some areas of sand … and mud but the lake bottom is mostly muddy". Upper has a large sandy beach in the NE.
  - Wetlands lie on Upper's S and W sides and Lower's N and E.
- **Lakes of Maine** gives "invasive: none known" for both lakes [snippet]. Its plant pages (MIDAS 1076 and 1072) are bot-walled (403); I did not try to get around that.
- **NWI** (`tools/hotbrook/data/nwi.geojson`) (inf):
  - Each lake is one open-water polygon (L1UBH; 898 and 682 acres), with **no littoral aquatic-bed or emergent polygons**.
  - Marsh (PEM1, ~120 acres across the model box) and shrub and forested swamps line the coves and brooks.
  - NWI often lumps beds into open water, so this is weak evidence.

**My reading of the NAIP aerial photo** (~3.3 m/px, `tools/hotbrook/data/naip.jpg`) (inf):
- A continuous tan fringe 30–60 m wide (~100 m in coves) shows the shallow bed through tea-coloured water.
- Mottled grey-green patches in Upper's S and SW coves by the inlet wetland are consistent with lily or emergent beds but unidentifiable at this resolution.

**Analogues and user knowledge**
- Baskahegan Lake, in the same drainage, has colour 46, Secchi 3.7–4.7 m and alkalinity 5.5 mg/L. That fits the soft-water flora above.
- **The user's own knowledge** of where weed beds, lilies and bulrush grow is the best available anchor.

---

## 7. Suggested mechanisms

These are inferences.

### 7.1 State and growth

- **State per bed patch × form:** shoot biomass Bs, storage Br (rhizome, tuber or turion), and Droop N and P quotas.
- **Growth:** μ = μmax · f(T) · f(L) · min(Droop N, Droop P) · (1 − B/Bmax), minus respiration and mortality.
- **Light, f(L):** use PCLake's canopy-integrated Monod with K ≈ 80–100 µmol m⁻² s⁻¹.
  - The light at canopy top comes from the sim's Kd, ice and snow, floating-leaf cover and periphyton (20–50%).
  - Self-shading is 0.006–0.02 m² g⁻¹.
- **Calibrate so the depth limit emerges** where daily production equals respiration:
  - 15–21% of surface light for canopy plants;
  - 5–11% for *Nitella* and moss;
  - ~40% for *Lobelia* rosettes.
- **Temperature, f(T):** the Hill function or Q10 2–3, with base 3 °C.

### 7.2 Phenology and placement

- **Phenology.**
  - Storage feeds the new shoot at up to 10% d⁻¹ (CHARISMA), from a start temperature per form.
  - From early to mid September, reallocate to storage over ~15 d; shoots die back to 20–30% carry-over.
  - Evergreens lose little.
- **Floating-leaved and emergent forms.** Place them by a **depth window** (petiole or emergence reach), not by bed light. A floating-leaved sprout must reach the surface on its stores.
- **Substrate.**
  - Isoetids grow on mineral beds and lose on organic mud (iron plaques, competition).
  - Lilies, canopy plants and *Nitella* grow on mud.
  - Rock is poor for all forms (inf).
- **Disturbance.**
  - Wave mortality, with half-saturation depth 0.15 m (CHARISMA).
  - Ice scour of wintering shoots shallower than the ice (~0.4–0.6 m) [snippet: ice ~0.4 m matched the scoured marginal zone of a Wisconsin lake].
  - Crayfish grazing above ~140 g m⁻² (earlier note).
  - Clonal spread into neighbouring patches; no rate was researched.

### 7.3 Mass balance

- **Uptake.** Roots take from the bed's pore pool and shoots from the water, split by Carignan 1982. *Utricularia* takes from the water only (plus the zooplankton it traps; not quantified).
- **Death and litter.** 25% of the N and P is released dissolved. Litter enters `sedOM` as two pools, decaying at Q10 2–3. Living shoots don't leak.
- **Oxygen.** Production is 1.07 g O₂ g⁻¹ DW and respiration 0.02 d⁻¹ at 20 °C, both in the plant's own cell. Isoetid O₂ goes to the bed, which should cut the bed's P release.

### 7.4 Outputs other subsystems read

- **Zooplankton refuge.** PVI = Σ cover × height/depth.
  - Refuge = 0.8 · logistic(PVI: 0 below 10%, ½ at 20%, saturating at 30–40%) × 1/(1 + (F/1.5)³), with F the small fish per m².
  - Perch and sunfish get 0.3–0.5 of the refuge's protection against them.
  - Floating-leaved and emergent forms count 0.3×.
  - The 3-D sim already has `plantMap` and `PLANKTON.WEED_REF` 0.5.
- **Stems.** Stems = B / (0.2–1 g). Capture multiplier = 1/(1 + (S/S₅₀)³), with S₅₀ ≈ 150 stems m⁻² for a searching bass, and higher for the ambushers pickerel and perch. Stems also feed the brains' cover input.
- **Epiphytic invertebrates.** ≈ 5 mg DW per g plant. Form factors: dissected 1, broad 0.7, ribbon 0.5, floating 0.4, isoetid 0.8, emergent 0.25. They peak in May–June and fall 2.5× by August.
- **Current.** Current × (1 − 0.9·min(1, cover)). Wind mixing is off where canopy height exceeds half the depth.
- **Resuspension.** × 0.35–0.5.
- **Floating-leaf cover.** Shades the bed by ~0.9 × cover (inf) and blocks reaeration.

### 7.5 Four seasons on paper

- **Winter.**
  - Only isoetids, *Nitella*/moss and deep pondweeds are green, at 10–20% of summer photosynthesis where snow is thin.
  - Plants add to under-ice O₂ demand: clear macrophyte lakes run lower winter O₂ (physics note).
- **Spring.**
  - Stores sprout at 4–13 °C.
  - Pickerel and perch spawn on last year's stems.
  - PVI stays under 10%, so the spring *Daphnia* peak has no plant refuge, as in real lakes.
- **Summer.**
  - Beds cover ~30% of the bed, with PVI 15–30% in the coves.
  - They are the nursery for young sunfish, shiners and killifish, and the home of *Ceriodaphnia*/*Simocephalus*.
  - Cove beds swing O₂ on calm nights.
- **Autumn.**
  - Senescence sends a litter and P pulse to bed and water.
  - Lilies and pickerelweed die back below the water.
  - Fish leave the thinning beds.

### 7.6 The 2-D sim's plant table against this evidence

These are observations only.
- `MACRO` makes milfoil the deep, shade-tolerant form, but *M. spicatum* is the most light-demanding species in Lake George.
- It gives muskgrass the highest `lightMin`, but charophytes need less light than angiosperms. In soft Maine water the deep low form is *Nitella* or moss.
- `PLANT.GROW_TEMP_MIN` 14 °C is far above the 3–10 °C starts the data show.
- `STRUCTURE.WEED_D` [0.8, 5.0] m follows clear-water regressions. Coloured water suggests canopy plants to ~2–2.7 m and *Nitella*/moss to ~3.5 m.

---

## 8. Model parameters

Biomass is g DW m⁻² at the summer peak. Rates are per real day. (inf) marks a value judged for Hot Brook from the cited ranges.

| | **EM emergent** | **FL floating-leaved** | **SC submerged canopy** | **IS isoetid rosette** | **DM deep low meadow** |
|---|---|---|---|---|---|
| **Depth range** | 0–1.0 m (max 1.2–1.9) | 0.3–2.5 m, densest ~1 (max 2.9) | 0.5 m → light limit ≈ 2.0–2.7 m at SD 3 (inf); peak biomass ~1–2 m | 0–1.5 m on sand/gravel (*Lobelia* Zc ≈ SD/3; *Isoetes* ~2 m) | below SC to ~3–3.5 m, sparse to ~4.2 (inf) |
| **Depth set by** | emergence window | petiole window; stores lift the first leaf | light: 15–21% of surface (season mean); margin 5–10% | light ~40% (34–50%); organic mud excludes | light ~5–11% (*Nitella* to ~2%) |
| **Light parameters** | not bed-limited | leaves in full light; LAI 0.4–2.8 shades the bed | leaf compensation 10–22 µmol (*M. spicatum* 37); canopy ~106; K½ 80–100 | CO₂ from the sediment (46–98%) | compensation 1.5–20; Ik 29–130 |
| **Peak biomass (stand)** | 500–1,500 total (*Pontederia* 1,212, 43% above ground; *Typha* shoots 583–2,115) | 100–300 total, ~75% below ground; leaves 50–215 AFDW | 50–150 (≤ 250 in sheltered mud) (inf); Lake George 80–100 | 30–120 (inf); Kalgaard 66–112; Baciver 120–460 | 10–60 (inf); *Nitella* 11 |
| **Max net growth, 20 °C** | ~0.01–0.03 d⁻¹ for shoots (inf); whole plant ~0.007 | ~0.02–0.04 d⁻¹ (inf); leaves live 31–48 d; P/Bmax 1.35–2.25 | 0.05–0.10 d⁻¹ | 0.003–0.01 d⁻¹ | ~0.01–0.03 d⁻¹ (inf) |
| **Temperature and start** | shoots from ~8–10 °C (inf); peak mid–late Aug | leaves from ~8–10 °C; limited by temperature | base 3 °C; Hill(14 °C) or Q10 2–3; optimum 28–32; start at ice-out (wintergreens) or 10–13 °C (tubers) | grows all year, fastest Jun–Jul | grows from ice-out |
| **Overwintering** | rhizomes, 40–60% of peak; shoots die back Sep–Oct | rhizomes (~75% of mass) | 20–30% of peak (turions 5–25%); deep wintergreens keep shoots | evergreen, ~70–100% (inf); ice scour in the shallows | evergreen (*N. gracilis*) |
| **Root:shoot** | 0.8–1.7 (autumn) | ~3 (*Nuphar*); 0.17 (*P. epihydrus*) | 0.06–0.15 in summer; 0.6 root fraction in winter | ~1 | ~0.1 (inf) |
| **N / P / C, % DM** | 2.1 / 0.14 / 42; ≤ 82% of P resorbed | 2.7 / 0.20 / 40 | 2.0 (1.0–3.5) / 0.15 (0.08–0.44) / 36–37; critical 1.3 / 0.13 | lowest of all forms (not quantified); iron plaques bind P | ~2 / ~0.15 / 35–40 (inf) |
| **P from sediment** | ~100% | ≥ 80–90% (inf); pumps P up | Carignan 27% (s/w 1) → 94% (s/w 100); ~90–97% on mud | 87% | low (inf) |
| **Litter (labile / refractory)** | 12–16% (k 0.6–1.5) / 84–88% (k 0.0026); single-pool 0.001–0.007 | 72% (k 0.13) / 28% (k 0.0034); single-pool 0.009 | 60–65% (k 0.09–0.14) / 35–40% (k 0.002–0.004); single-pool 0.007–0.026; 40–60% of P leaches in 2–7 d | slow, ~0.002–0.005 (inf) | ~0.007 [snippet] |
| **Effects** | edge cover; weak refuge (0.3×); odonate emergence stems; pickerel and perch spawning in flooded stems; turtles and frogs | shade; blocks reaeration (low DO beneath); overhead cover for bass, pickerel and sunfish; weak zooplankton refuge (0.3×); P pump | main zooplankton refuge (PVI); stem cover (capture collapses from 50 to 250 stems m⁻²); nursery (best ~50 g m⁻²); invertebrates ~5 mg/g; current −90%; canopy stratification when taller than ½ depth; perch, shiner and killifish eggs | little structure (5–15 cm); oxidises the bed, so less P release | stabilises mud; invertebrate habitat (inf); little refuge |

**Shared parameters**

| Parameter | Value | Source |
|---|---|---|
| Kd from Secchi | 2.4–2.7/SD in stained water | Koenings & Edmundson |
| Self-shading | 0.006–0.02 m² g⁻¹ | |
| Epiphyte light cut | 20–50% | |
| Respiration | 0.02–0.024 d⁻¹ at 20 °C, Q10 2 | |
| O₂ yield | 1.07 g O₂ g⁻¹ DW | |
| Litter decay Q10 | 2–3 | |
| Death release | 25% of N and P dissolved | |
| Spring feed from storage | ≤ 10% d⁻¹ | |
| Wave mortality | half-saturation depth 0.15 m | |
| Zooplankton refuge | PVI 15–20% (on) to 30–40% (saturated); fails at 1–4 small fish m⁻² | |
| Fish optimum | 18–40% cover | |
| Bed hypoxia | canopy > ½ depth, B ≳ 300, calm and warm, depth ≲ 1.5 m | |

---

## 9. Weakest values

1. **The depth limit in coloured water.**
   - No Maine, New England or Quebec humic-lake Zc survey was found.
   - The colour penalty rests on Alaskan Kd·SD medians and Canfield's Finnish regression.
   - ±0.7 m swings Lower's vegetated bed between about a third and three quarters. Check it against how deep the user sees weeds.
2. **Hot Brook's species and bed locations.** No readable plant list exists; the NWI and NAIP evidence is indirect.
3. **Biomass in soft, coloured, mesotrophic water.** It is interpolated from oligotrophic Lake George and from hard-water or eutrophic sites. Northeastern isoetid, *Nitella*, *Brasenia* and *Nymphaea odorata* biomass was not found.
4. **Growth rates.** Canopy RGRmax rests on one snippet plus model calibrations; Nielsen & Sand-Jensen 1991 and Barko & Smart 1981 were paywalled. Emergent and floating-leaved RGRs are inferred.
5. **Percent light at the limit.** The averaging basis (season vs instant) changes the number. The Middelboe & Markager 15/5/2% figures are unverified. Calibrate against the sim's own Kd rather than fixing a number.
6. **Start and senescence temperatures in Maine.** No local phenology was found. PCLake's 9 °C and the 10–13 °C tuber thresholds come from elsewhere.
7. **Isoetid and charophyte tissue contents and litter decay.** Not found.
8. **Effect thresholds.** PVI, fish density, hypoxia and the stems-per-gram conversion come mostly from warmer, eutrophic, clearer waters. The conversion is inferred, and Crowder & Cooper's densities are second-hand.
9. **Light under lily leaves.** Only *Trapa* (~95% intercepted) [snippet] was found.
10. **Grazing.** Crayfish, waterfowl and muskrat grazing, and *Utricularia*'s zooplankton capture, were not quantified.
