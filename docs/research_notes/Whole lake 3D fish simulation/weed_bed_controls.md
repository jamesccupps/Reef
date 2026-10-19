# Where macrophyte beds sit within a lake: spatial controls, with parameters (2026-10-18)

Companion to `weed_bed_structure.md` §2 (whose own §2 holds only stopgap material) and `macrophytes.md`. A research helper's report,
kept as delivered (condensed lightly). **Tags:** [primary] full text read (scanned/OCR'd text via pdftotext or a repository text file —
OCR errors possible); [abstract] abstract only (mostly Crossref); [secondary] the number from a later paper citing the work; [snippet]
search-engine summary only; [inf] the helper's inference or arithmetic.

**The most useful find:** Carlos Duarte's 1987 McGill PhD thesis, *Biomass and distribution of submerged macrophytes in lakes*
(text layer: mcgill.scholaris.ca handle 20.500.14905/86054, doi:10.82308/9029). It holds the full Duarte & Kalff 1986 Lake
Memphremagog paper (ch. II), the 25-lake southern Quebec / northeastern US study (ch. III = Duarte & Kalff 1990, *CJFAS*) and the
Memphremagog fertilisation study (ch. IV = Duarte & Kalff 1988, *CJFAS*) — close regional analogues for Hot Brook; several of the 25
are soft-water Laurentian lakes (Bleu, alkalinity 7.2 mg/L CaCO₃; Croche 8.5; Cromwell 9.8).

## 1. Depth band: upper limit, depth of peak biomass, lower limit
- **Duarte thesis ch. III, 25 NE lakes, 1,400 site-depth observations [primary]:** biomass is dome-shaped with depth in every lake
  (wave/ice limitation in the shallows, light below the peak).
  - Depth of maximum colonisation `Zmc (m) = 1.9 + 0.63·Secchi` (r² 0.76); depth of maximum biomass `Zmb (m) = 1.1 + 0.4·Secchi`
    (r² 0.79). The regression tree splits "no plants" at Z > 1.95 + 0.63·Sd and deep/shallow models at Z > 1.13 + 0.39·Sd.
  - **Shallowest submerged vegetation 0.75–1.25 m**, unrelated to slope, exposure or transparency (P > 0.05): probably ICE SCOUR,
    eroding the shallowest sediments in all these lakes.
- **Memphremagog (ch. IV) [primary]:** upper growing depth 0.9 m (the most severe wave action); maximum biomass at 2.6 m; maximum
  colonisation 6.2 m; mean Secchi 4.4 m; normal summer drawdown 0.5 m.
- **Hot Brook, Secchi 3–4 m [inf]:** Zmc ≈ 3.8–4.4 m, Zmb ≈ 2.3–2.7 m (Zmb/Zmc ≈ 0.6), upper limit ~0.75–1.25 m: a band from ~1 to
  ~4 m peaking ~2.5 m. Most of Lower's 2.5–3.9-m saucer within plants' reach; Upper's basin below ~4 m bare. Colour (30–50 Pt-Co) may
  lower Zmc for a given Secchi (Chambers & Prepas 1988, in macrophytes.md).
- **Hudon, Lalonde & Gagnon 2000** (*CJFAS* 57 Suppl. 1: 31–42, doi:10.1139/f99-232; St Lawrence, Ottawa R.) [abstract]: maximum
  depth from Kd (r² 0.82) or Secchi (0.80); biomass ranked **wind/wave exposure > growth form > depth > light** (67 % of above-ground,
  74 % of total biomass variance).

## 2. Wave exposure and fetch
**Index formulas**
- Duarte & Kalff 1986 weighted effective fetch [primary, OCR]: distances to the farthest visible shore on 8 bearings plus radials at
  ±11.25° and ±22.5°: `F = Σ Di·cos i / 5` (km); `WEF = Σ Fi·wfi` (wfi the wind frequency from bearing i).
- Scheffer et al. 1992 (used by Randall et al. 2004) [primary]: for 16 directions `EF = Σ cos(a)·Fetch(a) / Σ cos(a)` over a = ±45°
  (km); site exposure = the maximum of the 16.
- Shore Protection Manual / Håkanson effective fetch (Mason et al. 2018; WEMo manual) [primary]: cosine-weighted mean of 9 radials
  about each heading (3° steps SPM, 11.25° WEMo; WEMo clips at 10 km).
- Keddy 1982 relative exposure index [secondary, via Mason et al. 2018]: effective fetch × wind speed (mean, or exceedance of 12 mph);
  predicted exposure better than raw or effective fetch. Operational form [secondary/inf]: `REI = Σi Ui·Pi·EFi` (U wind speed, P %
  frequency from heading i). Keddy's own formula not read.
- Duarte & Kalff 1990 [primary]: "exposure" E = the area of open water visible from the site (km²); within-lake variation small.

**Wave hindcast chain** (USGS UMESC wind–fetch–wave model, 2012 update, CEM/SPM equations) [primary]: `Cd = 0.001(1.1 + 0.035·UA)`;
`U* = Cd^½·UA`; `x̂ = g·x/U*²`; `Ĥm0 = 0.0413·x̂^½`, `Hm0 = Ĥm0·U*²/g`; `T̂p = 0.751·x̂^⅓`, `Tp = T̂p·U*/g`; `L = g·Tp²/2π`; bottom orbital
velocity `um = π·Hm0 / (Tp·sinh(2π·h/L))`; bed shear `τ = ρ·f·um²/2`, f = 0.032 (exponents ½, ⅓ the standard CEM values — garbled in
the source [inf]). Wind to 10 m height and a 1-h average; overland wind ×1.2. **um ≥ 0.10 m/s resuspends fine unconsolidated sediment**
(Håkanson & Jansson 1983) [secondary].

**Thresholds and effects**
- **Chambers 1987** (*CJFAS* 44: 1666–1669, doi:10.1139/f87-204) [abstract]: four southern Quebec lakes — the minimum depth of
  submersed macrophytes vs the depth of wave mixing (wind speed, fetch): r 0.86, slope and intercept not different from 1 and 0: **the
  upper limit equals the depth of wave mixing** (its definition not in the abstract; maybe L/2 [inf]). Conflicts with Duarte's
  no-exposure finding (ice) — both southern Quebec.
- **Duarte & Kalff 1990 / thesis Eq. 4–5** (25 lakes) [primary, OCR]: below Zmb `B^0.33 = −13.0 − 1.6 ln S − 0.45 ln E + 2.3 ln A +
  1.2 ln Si` (r² 0.31; B g fresh/m²; E km²; A alkalinity mg/L CaCO₃; Si % surface light); above Zmb `B^0.33 = −8.4 − 1.6 ln S − 0.3
  ln E + 2.0 (A·Z)^0.33` (r² 0.40); slope S probably in m/m [inf: % gives negative biomass]; the tree ~60 % of variance. The author:
  wave action's role in shallow water "may have been exaggerated"; ice scour matters more at 1 m.
- Memphremagog (ch. II) [primary]: r(biomass at Zmb, fetch) = −0.36 (fetch 0.18–9.9 km, mean 3.4); significant only at slopes < 2.2 %,
  dropped from the final models.
- Riis & Hawes 2003 (*Freshw. Biol.* 48: 75–87) [abstract; large deep NZ lake, surrogate]: the low mixed community only where the
  previous year's maximum depth of sediment motion < 8 m, wave run-up < 0.3 m, slope < 0.12 m/m, small-gravel cover < 78 %; wave
  disturbance explained 86 % of cover variance, 68 % of the upper and 58 % of the lower depth limit.
- Randall, Minns & Brousseau 2004 (DFO CSAS Res. Doc. 2004/087; Great Lakes, surrogate) [primary]: tree (PRE 0.62, n 92) — cover
  highest on fine substrate (index < 2.7: clay/silt 2, sand 3, gravel 4, cobble 5, boulder 6, bedrock 7) with maximum effective fetch
  < 12.6 km; terminal means 0 %, 30 %, 78 %.
- Sorrell & Hawes 2010 (*Ann. Bot.* 105: 165; emergents, 17 NZ lakes) [primary]: 95th-quantile maximum depth = 3.26 − 0.53·DSM (m).
- Schutten et al. 2004 (*Ann. Bot.* 93: 333) [primary]: wave pulling force `F = A′·S·v^1.5`; ~0.2-m waves ≈ 0.2 N a shoot; most
  limiting on soft sediments.
- Keddy 1983/1985 (Axe Lake, Ontario; 25 transects) [abstract]: species' depth ranges shift landward with exposure; richness peaks at
  intermediate exposure; exposure removes biomass and sorts the substrate (coarse, poor exposed shores; organic, fine sheltered ones);
  isoetid-type species increase with exposure.
- Counter-case, eutrophic lakes: Weisner et al. 1997 (*Oecologia* 109: 592) [snippet] — biomass rose with exposure (periphyton ~5×
  higher at sheltered sites).

## 3. Littoral slope
**Duarte & Kalff 1986** (*L&O* 31: 1072) [abstract]; thesis ch. II equations [primary, OCR]. Memphremagog, 44 sites; MSMB = biomass at
the depth of maximum biomass (g fresh, spin-dried), mid-August–mid-September, 0–2,614 (mean 554); slope 0.3–30.3 % (mean 8.3).

| Eq. | Model | Data | r² | n |
|---|---|---|---|---|
| 1 | `MSMB = 122 + 986·slope^−0.81` | all | 0.72 | 44 |
| 2 | `MSMB = 103.7 + 885·slope^−0.81` | slope < 2.2 % (echosounder) | 0.67 | 13 |
| 3 | `MSMB = −26.34 + 1517·slope^−0.81` | slope > 2.2 % (echosounder) | 0.47 | 31 |
| 4 | `MSMB = 34 + 12.3·OM% + 979·slope^−0.81` | all | 0.76 | 44 |
| 5 | `MSMB = −29.8 + 1403·slope^−0.81` | slope > 5.3 % (map) | 0.60 | 28 |
| 6 | `MSMB = 13.2 + 3434·slope^−0.81` | slope < 5.3 % (map) | 0.79 | 16 |

- Echosounder slopes perpendicular to shore; map slopes from the 10-m isobath (the abstract's 5.33 % break is for map slopes; 2.2 % with
  the echosounder). The abstract's OM model (r² 0.72 → 0.88) differs from the thesis's (0.76). Temperate lakes with Secchi > 2 m.
- **Critical slope, 25 lakes: ~14.8 % — steeper slopes have no biomass** [primary] (Kolada et al. 2024 cite the same [secondary]).
  Within lakes the CV of biomass tracks the CV of slope (r 0.45).
- Duarte, Kalff & Peters 1986 (*CJFAS* 43: 1900; 139 lakes) [abstract]: submerged cover best predicted by underwater light, emergent
  cover by mean basin slope (thesis ch. I: `%As = 1.4·Iz + 0.01·Lie − 24·Sal − 0.90`, r² 0.60).
- Surrogates: He et al. 2019 (Erhai) — highest biomass at 0–1 % slope and 2–4 m; Kolada et al. 2024 (16 hard-water Polish lakes) —
  slope and exposure weak, cover vs slope r −0.19 to −0.25.

## 4. Substrate
- **Barko & Smart 1986** (USACE Tech. Rep. A-86-1; 40 sediments, 17 N. American lakes; *Myriophyllum*, *Hydrilla*) [primary]: growth
  fell 10- and 20-fold as sediment OM rose to ~20 % of dry mass, uniformly low above; on fine sediments r(growth, OM) < −0.66,
  r(growth, density) > 0.78; sands (> 75 % sand) also poor; poor at density ~0.9–1.3 g/mL (sands) and < 0.2 g/mL (organic) — density,
  not OM itself, the driver. Best: fine inorganic sediment with ~5–15 % OM [inf].
- Memphremagog: OM 1.0–45.4 % (mean 7.5), positive in Eq. 4 (cause unresolved).
- Isoetids: *Lobelia dortmanna* loses root length or dies at ~2.4 % degradable OM (Sand-Jensen et al. 2008) [snippet]; more ice
  disturbance replaced large isoetids with small erosion-resistant species (Hellsten 2000, Finland) [abstract].
- **The mud line from exposure** — Rowan, Kalff & Rasmussen 1992 (*CJFAS* 49: 2490; thesis [primary, OCR]): 1,260 sites in 54 lakes;
  the deposition boundary depth (coarse → fine, 23 µm or 60 % water content), set by the year's several biggest storms:
  `EB23 (m) = 2.291·F^0.549` (F maximum fetch, km) or `2.685·E^0.305` (E exposure, km²); theoretical `3.076·F^0.549`. Slopes < 3 %
  no effect; steeper, coarse sediment extends deeper; fines rare on slopes > 7.5 % (large lakes), > 10 % (small). (The logistic DBD
  equation's operator is lost in OCR — do not use it.)
- Hot Brook [inf]: EB23 ≈ 1.6 / 2.3 / 3.4 / 4.2 m for fetch 0.5 / 1 / 2 / 3 km — exposed shores sand, gravel or rock to ~2–3.5 m, mud
  below and in the coves (a relative gradient: coloured lakes may lay organic gyttja shallower — "bottom mostly muddy").

## 5. Ice
- Duarte thesis [primary]: the 0.75–1.25-m minimum depth is likely ice scour; at 1.0 m the plants' response to fertilisation was
  unrelated to exposure — ice scour, "relatively homogeneous" round the shore, may erode shallow sediments more than waves; nutrient
  limitation strongest in the ice-scoured shallows in spring.
- Halverson Lake, WI (probably Engel 1985, WDNR; unverified) [snippet]: maximum ice ~0.4 m ≈ the maximum depth of the plant-poor
  margin; shoots frozen into the ice torn out at ice-out.
- Rørslett (NIVA 1985; *Aquat. Bot.* 1984) [snippet]: upper limits from ice scour, lower from light.
- Hot Brook [inf]: ice 0.5–0.8 m → a shore-wide bare or sparse zone to ~0.75–1.25 m, deepest on exposed shores.

## 6. Sheltered vs exposed
- Duarte ch. IV, Memphremagog, 256 plots [primary]: at 2.5 m the response to fertilisation = 214 − 7.7·Earea(km²) − 0.35·control
  biomass (r² 0.32, n 49) — steep or exposed sites could not use added nutrients; fertilised plants gained 2.1× on average.
- Randall 2004: 0 / 30 / 78 % cover from coarse + exposed to fine + sheltered.

## 7. The brook
French & Chambers 1997 (*CJFAS*, Nechako River) [primary]: bottom cover (%) = 5.86·speed^−2.62 (r² 0.80, n 26); cross-sectional biomass
(g/m²) = 0.15·speed^−9.83 (r² 0.82), speed the mean summer channel speed (m/s): abundance falls steeply from 0.4 to 0.8 m/s, uniformly
low above. Chambers et al. 1991 (Bow River): a linear decline over 0–1 m/s [secondary].

## 8. A placement rule for Hot Brook [inf]
Bed suitability = the product of:
- **depth window:** zero above ~1.0 m (ice; on exposed shores the greater of that and the wave depth), rising to a peak at Zmb ≈ 1.1 +
  0.4·Sd, falling to zero at Zmc ≈ 1.9 + 0.63·Sd;
- **slope:** ∝ slope^−0.81 (Duarte), zero above ~15 %;
- **wave/bed stress:** a penalty where the storm um > 0.10 m/s (a 10 m/s storm, deep-water equations: fetch 2 km → Hm0 ≈ 0.22 m, Tp ≈
  1.5 s, L ≈ 3.5 m, um below 0.10 m/s at ~1.2–1.3 m, L/2 ≈ 1.8 m; fetch 0.5 km → L/2 ≈ 0.7 m, ice dominates);
- **substrate:** best on fine mineral sediment with ~5–15 % OM; poor on clean sand, very soft organic ooze (> 20 % OM) and rock; coarse
  shallower than EB23; rosettes on exposed sand and gravel;
- **alkalinity:** Duarte's 25-lake models give near-zero CANOPY biomass at 3–6 mg/L (Eq. 5, A 5, Z 2 m, E 1 km²: ~0.3 g FW/m² at 5 %
  slope, ~36 at 1 %) — but those biomasses came from echosounder canopy heights, which miss low isoetid lawns: expect canopy beds in
  sheltered, gently sloping muddy coves and rosette lawns on exposed sand.

## Not accessed
Keddy 1982 full text (403); Spence 1982; Jupp & Spence 1977; Pearsall 1920; Renman 1989; Rørslett 1984 full text; Madsen et al. 2001
(abstract only: low–moderate flow helps, high hurts); Fonseca & Bell 1998 (HTTP 429; a snippet: 50 % seagrass cover at ~25 cm/s, REI
≈ 3×10⁶ — unverified); the published Duarte & Kalff 1986 equations (image only); Wilson 1986 thesis (no text layer); Hudon 2000,
Chambers 1987, Riis & Hawes 2003 abstracts only.

## Sources
Duarte thesis text: https://mcgill.scholaris.ca/server/api/core/bitstreams/fbe2e1a6-2d4d-4843-8413-240aef4b932e/content ·
Rowan thesis text: https://mcgill.scholaris.ca/server/api/core/bitstreams/2899d071-0925-4aff-91e0-4c2a73b16f8c/content ·
Barko & Smart 1986: https://apcrp.el.erdc.dren.mil/elpubs/pdf/tra86-1.pdf · Randall et al. 2004: https://waves-vagues.dfo-mpo.gc.ca/Library/315789.pdf ·
Mason et al. 2018: https://pmc.ncbi.nlm.nih.gov/articles/PMC6298251/ · WEMo V4: https://cdn.coastalscience.noaa.gov/page-attachments/products/WEMo/WEMo_V4_manual.pdf ·
USGS wind–fetch–wave 2012: https://www.umesc.usgs.gov/management/dss/wind_fetch_wave/wind_fetch_wave_2012update/wind_wave_2012_update_070814.pdf ·
Sorrell & Hawes 2010: https://pmc.ncbi.nlm.nih.gov/articles/PMC2794052/ · Schutten et al. 2004: https://pmc.ncbi.nlm.nih.gov/articles/PMC4242204 ·
Kolada et al. 2024: https://www.frontiersin.org/journals/plant-science/articles/10.3389/fpls.2023.1307453/full ·
He et al. 2019: https://www.frontiersin.org/journals/plant-science/articles/10.3389/fpls.2019.00169/full ·
French & Chambers 1997: https://www.neef.ca/uploads/library/470_FrenchChambers1997_FlowsMacrophytes.pdf · Hellsten 2000: https://oulurepo.oulu.fi/handle/10024/37066
