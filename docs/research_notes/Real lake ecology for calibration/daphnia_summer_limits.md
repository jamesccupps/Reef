# What limits summer *Daphnia* (and cladoceran) biomass in small, shallow, soft-water lakes (Hot Brook calibration)

Compiled 2026-10-21 for the Hot Brook lakes: Upper (max 5.5 m) and Lower (max ~4 m, mean ~2.4 m). Both are unstratified and soft (alkalinity ~5–8 mg/L CaCO₃), slightly coloured (~20–46 PCU) and oligo-mesotrophic (TP ~9–12 µg/L). Their fish include yellow perch, white perch and pumpkinseed, with sea-run alewife recorded in Lower.

**The question.** The sim holds *Daphnia* at 200–370 µg DW/L all summer. The *Daphnia* graze the edible algae to almost nothing and suppress rotifers and bacteria. Which mechanisms hold real lakes far lower? This note gives **mechanisms with numbers, not tuning targets.** The field ranges below are for checking the result.

**Tags on every number:**
- **[primary]**: read in the full text of the cited work, or computed by me directly from a primary dataset (the EPA National Lakes Assessment raw files).
- **[abstract]**: from the publisher, Crossref or OpenAlex abstract only.
- **[snippet]**: from a secondary source, meaning another paper's text that quotes the cited work, or an earlier research note in this repo. It was not read in the cited work itself.
- **[inf]**: my own inference or arithmetic, with the inputs stated.

**Units.** DW = dry weight. µg DW/L = mg DW/m³. Wet:dry ≈ 10:1 for zooplankton; C ≈ 45–50 % of DW (zooplankton_dynamics.md Q1).

**Method note.** The shared web-search budget was used up after the second search of this session. Everything else came from:
- OpenAlex, Crossref and Europe PMC (abstracts and metadata);
- EPA's National Lakes Assessment 2012 data files (downloaded and analysed);
- open PDFs from author and agency repositories.

Blocked sources are listed in the access log at the end.

---

## 0. The answer in one paragraph

In the closest field analogues (48 NLA 2012 lake-visits, described below), summer *Daphnia* biomass is usually tiny:
- median **3 µg DW/L**; p75 **46**; p90 **95**;
- only **8 %** of lake-visits exceed 200 µg/L, and **none** in lakes shallower than 4 m;
- copepods dominate the crustaceans (*Daphnia* are a median **7 %** of crustacean biomass) [primary, my analysis].

The algae there are *not* grazed down. Grazing-resistant forms make up a median **~58 %** of summer phytoplankton biovolume, and edible forms only **~21–26 %** [primary, my analysis].

Real lakes hold *Daphnia* low by combining:
1. **A pulse of young-of-year (YOY) fish planktivory in July–August.** It is large and does not saturate. In strong-YOY years it eats more than the *Daphnia* produce: Oneida, Erie, Mendota, Lacawac.
2. **A grazing-resistant algal pool.** It takes up the nutrients and light but does not feed *Daphnia*.
3. **Invertebrate predators of juveniles.** *Leptodora*, cyclopoids and *Chaoborus* add to the losses.
4. **Food quality, as P stoichiometry and algal taxon.** Weaker in small lakes than energy (quantity) limitation.
5. **Low calcium.** At Hot Brook's likely ~2 mg/L it is a near-threshold, modest direct effect. It acts mostly through species composition (*D. catawba*, *Holopedium*) and through greater juvenile vulnerability to *Chaoborus*.

A back-of-envelope steady state [inf]: *Daphnia* biomass ≈ (edible production × conversion) / per-capita loss.
- Halving the edible supply (the resistant pool) gives a factor of ~2.
- Raising summer losses from ~0.03–0.05 /d to the field's ~0.1–0.3 /d gives a factor of 3–5.
- Together they cut biomass ~6–10× (2 × 3–5). That moves 200–370 µg/L to ~20–60 µg/L, the NLA analogues' p50–p75 band.

---

## Takeaway table

| # | Quantity | Field value for Hot Brook-like lakes | Sim now | Tag and source |
|---|---|---|---|---|
| 1 | Summer *Daphnia* biomass | median 3, p25 0.1, p75 46, p90 95 µg DW/L; 8 % > 200; none > 100 in lakes < 4 m | 200–370 all summer | [primary] NLA 2012, my analysis (§Q6) |
| 2 | Summer crustacean biomass | median 129 (p25 32, p75 230) µg DW/L; copepods ≥ half; *Daphnia* share median 7 % (IQR 0.4–32 %) | — | [primary] NLA 2012 (§Q6) |
| 3 | *Daphnia* density | median 0.3/L, p75 9, p90 16, max 55/L | ≈ 40–75/L at ~5 µg each [inf] | [primary] NLA 2012 |
| 4 | Grazing-resistant share of summer phytoplankton | median 58 % of biovolume (IQR 28–85 %); edible 21–26 % (IQR ~10–50 %) | none (all algae edible) | [primary/inf] NLA 2012 phytoplankton, my classification (§Q3) |
| 5 | Edible algal standing stock | ~0.2 mg/L fresh (IQR 0.1–0.4–0.5) ≈ 0.02–0.03 mg C/L | grazed to ~0 | [inf] from NLA biovolume × 0.1–0.15 pg C/µm³ |
| 6 | YOY perch biomass that collapses *D. pulex* | tolerated at 10 kg/ha; collapse at > 20–40 kg/ha | check sim YOY kg/ha | [abstract] Mills & Forney 1983 |
| 7 | Fish share of *Daphnia* mortality | ~100 % of large-*Daphnia* mortality in the second half of summer; 50–100 % at the start of the midsummer decline | type III adults; YOY type II | [primary] Wu & Culver 1994; Boersma et al. 1996; [snippet] Luecke et al. 1990 |
| 8 | Implied summer death rate from YOY fish | ~0.08–0.33 /d at 50 µg/L *Daphnia*; only ~0.01–0.06 /d if the *Daphnia* stood at 300 µg/L (predator saturation) | ≈ 0.03 background + small | [inf] (§Q5) |
| 9 | Total summer mortality (non-*Daphnia* reference) | ~0.13 /d total; non-predation 0.015 /d (*Bosmina*); *Daphnia* non-predation 0.002–0.18 /d | M_D 0.03 | [primary] Dubovskaya et al. 2015 and sources it cites |
| 10 | Realised per-capita growth in Shield lakes, fishless mesocosms | mean 0.009–0.034 /d (range −0.07 to 0.11); lab 0.14–0.58 /d | G_D 0.6 (max) | [primary] Arnott, Azan & Ross 2017 |
| 11 | Egg ratio needed for b = 0.6 /d at 20 °C | ~4 eggs per individual; b of 0.1 / 0.2 / 0.3 /d needs 0.3 / 0.7 / 1.25 | — | [inf] Bottrell egg time 2.7 d |
| 12 | Seston C:P and the *Daphnia* threshold | 38 % of 276 lake means > 300; critical C:P 225–375 (TER ~155–230) | no C:P | [abstract] Brett et al. 2000; Anderson & Hessen 2005; Khattak et al. 2018 |
| 13 | Growth penalty of P-poor food | 0.54 → 0.17 /d as food C:P goes 120 → 900, i.e. −16 % at 300 and −24 % at 400 [inf] | none | [abstract] DeMott, Gulati & Siewertsen 1998 |
| 14 | Hot Brook calcium | likely 1.8–2.6 mg/L (median 2.0) | none | [inf] NLA ME/NH/VT lakes of the same alkalinity |
| 15 | Ca thresholds | survival 0.1–0.5 mg/L (lab); reproduction falls below 1.5; r drops sharply 1.5 → 1.0; low food or warmth raises the threshold to 1.5; field survival 1.26–1.69 | — | [abstract] Ashforth & Yan 2008; [snippet] Cairns 2010 via Arnott et al. 2017 |
| 16 | Ca effect at 1.2–2.5 mg/L in field mesocosms | none detected | — | [primary] Arnott et al. 2017 |
| 17 | Low Ca × *Chaoborus* | below 1.5 mg/L, juvenile *Daphnia* 50–186 % more vulnerable | — | [abstract] Riessen et al. 2012 |
| 18 | *Holopedium* | in 27/48 analogues; median 1.3 % of cladoceran biomass (p75 14 %, max 78 %); 1/10 the Ca and 1/2 the P of daphniids | absent | [primary] NLA; [primary] Jeziorski et al. 2015 |
| 19 | Invertebrate predators | *Leptodora* can explain all *D. mendotae* mortality in late June–early July; *Mesocyclops* ≤ 17 %/d of its preferred prey; *Chaoborus* 2–9 % of prey standing crop | M_D 0.03 lumps them | [abstract] Lunte & Luecke 1990; Williamson 1984; Fedorenko 1975 |

---

## The field dataset used here (NLA 2012 analogue set)

**Source.** EPA National Lakes Assessment 2012:
- zooplankton counts and metrics, phytoplankton counts, key variables, water chemistry and site info;
- downloaded from the [EPA NARS data page](https://www.epa.gov/national-aquatic-resource-surveys/data-national-aquatic-resource-surveys) as CSV;
- zooplankton biomass is "µg dry weight/L", coarse (150 µm) and fine (50 µm) net samples combined, as in the [metadata](https://www.epa.gov/system/files/other-files/2023-03/nla12_wide_zooplankton.txt).

**Filter (mine).**
- Ecoregions Northern Appalachians (NAP) + Upper Midwest (UMW).
- Index-site depth 1.5–8 m; TP 5–25 µg/L; Ca ≤ 8 mg/L.
- Result: **n = 48 lake-visits** across CT, MA, ME, MI, MN, NH, NY, PA, RI, VT and WI, sampled June–September 2012.
- A stricter Northeast-only subset (ME, NH, VT, NY, MA; Ca ≤ 5 mg/L; n = 30) has:
  - median TP 13.5 µg/L, chl-a 2.6 µg/L, Ca 2.2 mg/L, colour 26 PCU;
  - depth 4.4 m, area 13 ha.

  It is Hot Brook's chemistry almost exactly, in smaller lakes [primary].

**Caveats.**
- These are single summer snapshots of one year (2012), from vertical net tows at the deepest point.
- Day tows miss *Chaoborus* and probably *Leptodora*.
- Biomass uses NLA's own length–weight equations. The median *Daphnia* individual mass is 4.6 µg (IQR 2.4–11.5 µg). By W = 5.0·L^2.84 that is ~1.0 mm (0.8–1.3 mm) [inf].

---

## Q1. Calcium

### Takeaway
Hot Brook probably has **~2 mg/L Ca**. That is inside the transition band where *Daphnia* communities shift, but above the lab survival thresholds (0.1–0.5 mg/L) and close to the reproduction threshold (~1.5 mg/L, higher on low food and in warm water).
- The direct effect on *Daphnia* growth at 2 mg/L is **probably small**: field mesocosms found none at 1.2–2.5 mg/L.
- The real effects are on **which species** persist (*D. catawba*, *D. ambigua*, *D. parvula*, *Holopedium*, *Bosmina*, copepods) and on **juvenile defences against *Chaoborus***.
- In the analogue lakes the direct Ca signal is not visible in *Daphnia* biomass.

### Findings

**Hot Brook's likely calcium.**
- In NLA 2012 lakes in ME, NH and VT with ANC 70–180 µeq/L (≈ 3.5–9 mg/L as CaCO₃, which brackets Hot Brook's alkalinity of ~5–8), Ca had a median **2.0 mg/L (IQR 1.7–2.6, n = 22)**.
- At ANC 90–130 µeq/L, Ca was 1.8–2.2 mg/L (n = 7) [primary, my analysis of `nla2012_waterchem_wide.csv`].
- Hot Brook's earlier estimate (2–4 mg/L; Pleasant/Skitacook analogues) is probably at the high end [inf].

**Laboratory thresholds.**
- *D. pulex* was reared at 7 Ca levels (0.1–10 mg/L), two foods (high 30 and low 3 µg chl/L) and four temperatures (20–32 °C) [abstract]:
  - the minimum Ca for survival and reproduction was 0.1–0.5 mg/L;
  - animals at 0.1 mg/L lived ≤ 10 d without reproducing;
  - reproduction was reduced below 1.5 mg/L, through delayed maturity and smaller and fewer broods;
  - **r "decreased dramatically between 1.5 and 1 mg Ca L⁻¹"**;
  - "higher temperatures and reduced algal biomass … [raised] the reproductive threshold to 1.5 mg Ca L⁻¹";
  - no reproduction occurred at 32 °C. — [Ashforth & Yan 2008, L&O 53:420–432, doi:10.4319/lo.2008.53.2.0420](https://doi.org/10.4319/lo.2008.53.2.0420)
- *D. magna* [abstract]:
  - survival threshold 0.1–0.5 mg Ca/L even at constant ionic strength;
  - growth retarded at 0.5–1.0 mg/L above the incipient limiting food level, with a less clear effect at low food;
  - age-specific egg production "strongly reduced at Ca concentrations < 10 mg Ca l⁻¹";
  - the authors caution that *D. magna* may not represent other *Daphnia*. — [Hessen, Alstad & Skardal 2000, J. Plankton Res. 22:553, doi:10.1093/plankt/22.3.553](https://doi.org/10.1093/plankt/22.3.553)
- *D.* cf. *pulex* from a 1 mg/L lake [primary]:
  - reproduction saturated above ~1 mg/L;
  - zero population growth Ca was 0.27 mg/L (high food, 17.5 °C) and 0.17 (21 °C);
  - **on low food (0.2 mg C/L), r was negative at most Ca levels**, and output was ≤ ~1 offspring per individual in 19 d;
  - age at maturity was 12.6 d on low food vs 7.0 d on high. — [Ramos-Rodríguez et al. 2022, Biology 11:1539, doi:10.3390/biology11101539](https://pmc.ncbi.nlm.nih.gov/articles/PMC9598739/)
- **Ca × P:** dietary P explained more of the variation in *Daphnia* growth and population response than Ca, at levels "commonly found on the Canadian Shield" [abstract]. — [Prater, Wagner & Frost 2016, L&O 61:268–278, doi:10.1002/lno.10208](https://doi.org/10.1002/lno.10208)

**Body calcium.**
- *Daphnia* hold 2–8 % of DW as Ca; copepods and non-daphniid cladocerans 0.2–0.4 % [abstract, Jeziorski & Yan 2006, CJFAS 63:1007, doi:10.1139/f06-019](https://doi.org/10.1139/f06-019).
- Norwegian *Daphnia* hold 0.8–4.4 %, rising with species body size, so large species need the most [abstract, Wærvågen, Rukke & Hessen 2002, Freshw. Biol. 47:1866, doi:10.1046/j.1365-2427.2002.00934.x](https://doi.org/10.1046/j.1365-2427.2002.00934.x).
- *Holopedium* holds 0.1–0.5 % DW [primary, quoting Azan et al. 2015, in Arnott et al. 2017].

**Field thresholds and paleo-evidence.**
- 62 % (47–81 % by region) of Shield lakes examined are "approaching or below" the lab threshold [primary]:
  - in 43 Muskoka lakes, daphniid relative abundance (pre-1850 vs today) **fell in 60 % of lakes < 1.5 mg/L and 67 % of lakes 1.5–< 2.0 mg/L, but rose in all lakes > 2.5 mg/L**;
  - Plastic Lake's Ca fell from ~2.2 (1980) to ~1.4 mg/L (2006), and daphniid remains tracked it (r = 0.95);
  - 35 % (12–51 %) of lakes are < 1.5 mg/L. — [Jeziorski et al. 2008, Science 322:1374–1377, doi:10.1126/science.1164949](https://queensu.ca/pearl/media/Calcium/Jeziorskietal2008Science.pdf)
- A field survey found **survival thresholds of 1.26–1.69 mg Ca/L** for several Ca-rich daphniids [snippet: Cairns 2010 thesis, quoted in Arnott et al. 2017].
- A lake survey found no Ca–cladoceran community association across 1.0–3.1 mg/L, but a shift across 1.0–24 mg/L [snippet: Jeziorski et al. 2012, quoted in Arnott et al. 2017].
- **Field mesocosms** (three experiments, Shield lakes, chl 1.4–4.3 µg/L) [primary]:
  - **no Ca effect on per-capita growth across 1.2–2.5 mg/L (Havelock)**;
  - lower growth for daphniids, bosminids and copepods at 0.6–0.9 mg/L;
  - the authors infer a community threshold between 0.9 and 1.2 mg/L. — [Arnott, Azan & Ross 2017, Can. J. Zool. 95:323–333, doi:10.1139/cjz-2016-0105](https://utoronto.scholaris.ca/bitstreams/5e9226a0-5135-4ab6-9898-a92a586823e9/download) (accepted manuscript)
- **Ca × predators:** below 1.5 mg/L, *D. pulex* cannot build its *Chaoborus*-induced defences (larger size, neck spines, stronger carapace), giving "a **50–186 % increase in the vulnerability** of the smaller juvenile instars" [abstract]. — [Riessen et al. 2012, PNAS 109:15377–15382, doi:10.1073/pnas.1209938109](https://doi.org/10.1073/pnas.1209938109)

**In the analogue lakes.** NLA *Daphnia* biomass did not fall with Ca (my binning, NAP + UMW, depth 1.5–8 m, TP 5–25):

| Ca band (mg/L) | n | median *Daphnia* (µg/L) | lake-visits with > 1 µg/L |
|---|---|---|---|
| < 1.5 | 5 | 9.5 | 80 % |
| 1.5–2.5 | 15 | 5.3 | 60 % |
| 2.5–4 | 15 | 0.4 | 40 % |
| 4–8 | 13 | 6.9 | 62 % |
| 8–20 | 20 | 5.7 | 70 % |

The sample is small and confounded [primary]. **Inference:** at ~2 mg/L, Ca is not what keeps summer *Daphnia* low in these lakes [inf].

**Size of the direct effect at 2–4 mg/L [inf].** Summary of the above:
- 0 % at ≥ 2.5 mg/L (Jeziorski 2008; Arnott 2017);
- perhaps 5–20 % lower birth rate near 2 mg/L on low food and in warm water (Ashforth & Yan's threshold shift);
- steep only below ~1.5 mg/L.

**Which *Daphnia* persist.**
- **NLA analogues [primary]**, mean biomass and lakes present (of 48):

  | Species | mean µg/L | present in |
  |---|---|---|
  | ***D. catawba*** | **37** | **18** |
  | *D. ambigua* | 3.6 | 5 |
  | *D. parvula* | 1.5 | 5 |
  | *D. retrocurva* | 0.07 | 6 |
  | *D. dubia* | — | 2 |
  | *D. galeata mendotae* | — | 2 |
  | *D. pulicaria* | — | 1 |
  | *D. dentifera* | — | 1 |
  | *D. minnehaha* | — | 1 |

  *D. catawba* is the analogue lakes' summer *Daphnia*.
- **Kejimkujik**, the best soft-water analogue: *D. catawba* is in 53 % of lakes at a mean 2.3/L, only at pH ≥ 5.5 [snippet: research note `Hot Brook populations and water/plankton_microbes_plants_evidence.md`, from Nussbaumer et al. 2014].
- **Shield lakes < 8 m deep with fish** [abstract]:
  - fewer *D. pulex*, *D. g. mendotae* and *D. dubia*, and more *Leptodiaptomus minutus*, than deeper lakes;
  - attributed to small-fish predation in small shallow lakes;
  - *C. americanus* marks fishless lakes. — [Keller & Conlon 1994, CJFAS 51:2424–2434, doi:10.1139/f94-242](https://doi.org/10.1139/f94-242)
- **Ca-sensitivity by species** (21-d lab trials at 1.0–5.0 mg Ca/L) [abstract]:
  - *D. catawba* and *D. pulex/pulicaria* survival depended on Ca; the smaller *D. ambigua*'s did not;
  - all species died early (< 10 d) below 2.5 mg/L, but the author suspects an artefact: the mother cultures had been acclimated to 2.5 mg/L. — [Corrigan 2014, Queen's undergraduate thesis, hdl:1974/12132](http://hdl.handle.net/1974/12132)
- **Most sensitive to Ca decline (expected)** [abstract]: *D. retrocurva* and *D. pulicaria*. — [Azan, Arnott & Yan 2015, Environ. Rev. 23:395, doi:10.1139/er-2015-0027](https://doi.org/10.1139/er-2015-0027)

**Holopedium** (*H. glacialis* / *H. atlanticum*; jelly-coated).
- **Needs and traits** [primary]:
  - ~1/10 the Ca and ~1/2 the P of daphniids; clutch 2× that of daphniid competitors;
  - "relatively invulnerable" to predators: the jelly protects against *Chaoborus*, and the SEM effect of *Chaoborus* was not different from zero.
- **Spread with Ca decline** [primary]:
  - Ontario regional median density rose from 304 to 607 animals/m³ (0.30 → 0.61/L) between the 1980s and 2004–05;
  - a Ca drop from 3 to 1 mg/L raises its probability of occurrence by ~34 %. — [Jeziorski et al. 2015, Proc. R. Soc. B 282:20142449, doi:10.1098/rspb.2014.2449](https://pmc.ncbi.nlm.nih.gov/articles/PMC4262185/)
- **Lake Lacawac, PA** [abstract]:
  - *Holopedium* was abundant in early and midsummer, *D. catawba* in spring and late summer;
  - food restricted *Holopedium* "at most times"; its summer energy reserves and fecundity were near zero;
  - fish predation on adult *Holopedium* was negligible, but neonates were occasionally eaten heavily;
  - in late summer the two compete. — [Tessier 1986, Ecology 67:285–302, doi:10.2307/1938573](https://doi.org/10.2307/1938573)
- **Mesocosms:** *H. glacialis* had **negative growth in most enclosures, unrelated to Ca** [primary, Arnott et al. 2017]. *Holopedium* is not simply a Ca-favoured winner.
- **Share in the analogue lakes [primary]:**
  - present in **27/48**; median 0.4 µg/L (p75 2.7, max 98);
  - **median 1.3 % of cladoceran biomass** (p75 14 %, max 78 %).
- **In Maine:** Kezar Lake densities were 0–0.066/L in a 40-m-deep basin [primary, Cousins & Webster 2008, below].

---

## Q2. Food quality and stoichiometry

### Takeaway
In small oligo-mesotrophic lakes, *Daphnia* growth is limited mainly by **food quantity (energy)**. P limitation is real but "weak and sporadic". Seston C:P often exceeds the *Daphnia* threshold (~200–300), but bioassays in small lakes rarely show strong P limitation.
- Expect a **0–25 % growth penalty** from P-poor food at Hot Brook's TP of 9–12 µg/L [inf].
- Algal taxon matters more than C:P: diatoms and cryptophytes are good food, greens intermediate, small cyanobacteria very poor.
- Coloured water lowers zooplankton production through its terrestrial carbon.

### Findings

**Seston C:P and thresholds.**
- **Brett, Müller-Navarra & Park 2000** [abstract]:
  - across 276 lake means, **38 % of seston C:P values exceed 300**;
  - from 91 growth responses, the true *Daphnia* critical threshold is **225–375**;
  - "the production of most zooplankton taxa would not be expected to be limited by mineral P in a large proportion of lakes";
  - by quality: diatoms and cryptophytes high, chlorophytes intermediate, small cyanophytes very low;
  - composition shifts explained **4× more** of the variation in *Daphnia* growth than C:P. — [L&O 45:1564–1575, doi:10.4319/lo.2000.45.7.1564](https://doi.org/10.4319/lo.2000.45.7.1564)
- **Anderson & Hessen 2005:** the threshold elemental ratio (TER) for *Daphnia* is ~230 at low food and ~200 at high intake. "Seston C:P often exceeds 230, particularly in oligotrophic lakes where … detritus dominates the diet" [abstract]. — [Freshw. Biol. 50:2063–2075, doi:10.1111/j.1365-2427.2005.01450.x](https://doi.org/10.1111/j.1365-2427.2005.01450.x)
- **Khattak et al. 2018:** an empirical TER of **155 ± 14** for *D. magna*, lower than earlier estimates [abstract]. — [Sci. Rep. 8, doi:10.1038/s41598-018-27758-7](https://doi.org/10.1038/s41598-018-27758-7)
- **Hessen et al. 2003**, 109 temperate lakes [abstract]:
  - seston C:P 59–553 (**mean 207**);
  - mean POC 960 µg C/L vs mean phytoplankton C 217 µg C/L, so algae are ~23 % of POC [inf from the two means];
  - live phytoplankton "rarely exceed 40 % of total POC";
  - allochthonous detritus C:P is ~2.7× phytoplankton's (≈ 330 vs 123);
  - "**judged from algal biomass alone, Daphnia would face severe food limitation in a majority of lakes, while if we were to include total seston, Daphnia would be above threshold food levels in all lakes.**" — [L&O 48:1289–1296, doi:10.4319/lo.2003.48.3.1289](https://doi.org/10.4319/lo.2003.48.3.1289)
- **Hecky, Campbell & Hendzel 1993:** particulate C:N:P is higher than Redfield in most lakes, highest in temperate oligotrophic Shield lakes, and "small lakes are generally more N and P deficient than large lakes" [abstract]. — [L&O 38:709–724, doi:10.4319/lo.1993.38.4.0709](https://doi.org/10.4319/lo.1993.38.4.0709)

**Size of the growth penalty.**
- **DeMott, Gulati & Siewertsen 1998** [abstract]:
  - with dietary C:P from 120 to 900, *D. magna* mass growth fell **from 0.54 ± 0.01 to 0.17 ± 0.02 d⁻¹**, linear in body P (r² = 0.92);
  - C assimilation efficiency fell as food C:P rose. — [L&O 43:1147–1161, doi:10.4319/lo.1998.43.6.1147](https://doi.org/10.4319/lo.1998.43.6.1147)
  - A linear interpolation gives about −16 % growth at C:P 300 and −24 % at 400 [inf].
- **Urabe, Clasen & Sterner 1997:** supplying inorganic P directly raised *D. magna* growth on P-deficient algae (C:P > 300) but not on P-sufficient algae [abstract]. — [L&O 42:1436–1443, doi:10.4319/lo.1997.42.6.1436](https://doi.org/10.4319/lo.1997.42.6.1436)
- **Sterner et al. 1993:** severely P-limited *Scenedesmus* gave slow growth even at 3 mg DW/L, as if "no amount of low quality food would support rapid Daphnia growth"; clearance was also lower on P-limited cells [abstract]. — [L&O 38:857–871, doi:10.4319/lo.1993.38.4.0857](https://doi.org/10.4319/lo.1993.38.4.0857)
- **DeMott & Gulati 1999**, three hypereutrophic Dutch lakes: annual mean *D. cucullata* fell from 104 to 0.7/L as mean seston C:P rose from ~250 to 500. *Bosmina* and cyclopoids did not respond. Strong fish predation also acted [abstract]. — [L&O 44:1557–1564, doi:10.4319/lo.1999.44.6.1557](https://doi.org/10.4319/lo.1999.44.6.1557)

**Field tests in small lakes (the closest evidence).**
- **DeMott, Edington & Tessier 2004**, small stratified Michigan lakes [abstract]:
  - growth assays showed "**strong energy limitation and weak and sporadic P limitation, despite seston C:P ratios in the upper depth strata above the predicted threshold**";
  - food limitation did not depend on trophic state;
  - "**strong food limitation was associated with high Daphnia biomass (> 100 µg L⁻¹) and Daphnia grazing > 20 % per day**." — [L&O 49:1408–1416, doi:10.4319/lo.2004.49.4_part_2.1408](https://doi.org/10.4319/lo.2004.49.4_part_2.1408)
- **Persson et al. 2007**, empirical models across trophic state [abstract]:
  - *Daphnia* growth peaks at **TP 10–25 µg/L**, which is Hot Brook;
  - food quantity dominates at TP ≤ 4;
  - P limitation increases as TP falls but is "never predicted to be the dominant constraining factor";
  - EPA (20:5ω3) limitation appears at both ends. — [Persson, Brett, Vrede & Ravet 2007, Oikos 116:1152–1163, doi:10.1111/j.0030-1299.2007.15639.x](https://doi.org/10.1111/j.0030-1299.2007.15639.x)
- **Tessier & Woodruff 2002**, 19 lakes [abstract]: more fish planktivory gave more phytoplankton food *from the grazer's perspective*, through composition rather than biomass. — [Ecology 83:1263, doi:10.1890/0012-9658(2002)083[1263:CTCAAG]2.0.CO;2](https://doi.org/10.1890/0012-9658(2002)083[1263:ctcaag]2.0.co;2)
- **PUFA/EPA:** EPA content predicts carbon transfer from producers to *Daphnia* (no abstract numbers retrieved). — [Müller-Navarra et al. 2000, Nature 403:74–77, doi:10.1038/47469](https://doi.org/10.1038/47469)

**Colour and terrestrial carbon** (Hot Brook is moderately coloured).
- Across 10 lakes, total and group zooplankton production fell as terrestrial organic carbon rose, through less light and poorer food [abstract]. — [Kelly, Solomon, Weidel & Jones 2014, Ecology 95:1236–1242, doi:10.1890/13-1586.1](https://doi.org/10.1890/13-1586.1)
- Brown water raises *Chaoborus* and shifts zooplankton toward larger species (*Daphnia*, *Holopedium*), from enclosures and a two-lake comparison [abstract]. — [Wissel, Boeing & Ramcharan 2003, L&O 48:1965–1976, doi:10.4319/lo.2003.48.5.1965](https://doi.org/10.4319/lo.2003.48.5.1965)

---

## Q3. Inedible (grazing-resistant) algae

### Takeaway
In the Hot Brook-like NLA lakes, a **median ~58 % of summer phytoplankton biovolume is grazing-resistant** (IQR 28–85 %). Most of it is *Peridinium*, filamentous and desmid greens (*Mougeotia*, *Staurastrum*) and colonial cyanobacteria (*Anabaena*). Only **~21–26 %** is clearly edible. The edible standing stock is ~0.2 mg/L fresh, ≈ 0.02–0.03 mg C/L [inf], which is at or below *Daphnia*'s threshold.
- The edible pool does not scale with TP (Watson et al. 1992).
- Late summer is when resistant algae take over (DeMott 1983; Threlkeld 1979).

This is how real lakes keep 2–4 µg chl/L standing *while* their *Daphnia* are food-limited. A sim in which all algae are edible lets *Daphnia* convert the whole primary production.

### Findings

**My NLA 2012 analysis** (48 analogue lake-visits; integrated phytoplankton samples; biovolume per mL from NLA counts) [primary data / inf classification].
- Genera were classed by Sommer/Wu & Culver-style criteria: "edible" = flagellates, small diatoms, non-filamentous greens; "inedible" = filamentous diatoms and greens, spiny greens, bluegreens (Wu & Culver 1994).
- I added large dinoflagellates and large desmids to "inedible", and put colonial chrysophytes (*Dinobryon*, *Synura*, *Uroglena*), *Cosmarium*, *Eunotia*, *Phacus* and *Euglena* in "uncertain".
- Results (two sample types, PHYX and PHYL; each lake has both):

  | Share of biovolume | PHYX median (IQR) | PHYL median (IQR) |
  |---|---|---|
  | Edible | **21 %** (11–51) | **26 %** (8–42) |
  | Inedible | **58 %** (28–85) | **58 %** (39–83) |
  | Uncertain | ~5 % | ~5 % |
  | Cyanobacteria | 3 % | 5 % |

  - Total classified biovolume: median 0.9–1.0 mg/L fresh.
  - **Edible biovolume: median 0.2 mg/L (IQR 0.1–0.4/0.5).**
  - Pooled across lakes, the largest genera by biovolume were *Peridinium* 19 %, *Mougeotia* 9 %, *Staurastrum* 8 %, *Dinobryon* 6 %, *Anabaena* 5 % and *Cryptomonas* 3.5 %. Unidentified "cysts", 23 % of biovolume, were excluded.
- **Carbon conversion [inf].** At 0.1–0.15 pg C/µm³ (Menden-Deuer & Lessard-type volume–carbon factors for 10²–10³ µm³ cells; not re-fetched this session), 0.2 mg/L ≈ **0.02–0.03 mg C/L of edible algae**.
  - That is below the sim's *Daphnia* zero-growth food (0.034 units ≈ 0.05–0.1 mg C/L by `config.js`'s own mapping).
  - So field *Daphnia* must also live on detritus, bacteria and picoplankton, consistent with Hessen et al. 2003 above.
  - Light microscopy misses picoplankton, so the true edible fraction is somewhat higher.

**Edible vs inedible across lakes.**
- **Watson, McCauley & Downing 1992:** "the large inedible fraction exhibits a strong, nonlinear response to increasing nutrient levels, while the **small edible algae do not vary systematically with phosphorus**" [abstract]. — [CJFAS 49:2605–2610, doi:10.1139/f92-288](https://doi.org/10.1139/f92-288)
- **Watson, McCauley & Downing 1997** [abstract]:
  - 91 north-temperate lakes; all six groups rise with TP but over different ranges;
  - curves converge at TP ~10–30 µg/L, where groups are most equitable, which is Hot Brook's range. — [L&O 42:487–495, doi:10.4319/lo.1997.42.3.0487](https://doi.org/10.4319/lo.1997.42.3.0487)

**Late-summer shift to resistant algae.**
- **DeMott 1983**, a small Vermont lake: spring food was "mostly highly edible flagellates", while "resistant" algae (mostly gelatinous greens) predominated in late summer and autumn. Competition, not fish, limited *Daphnia* growth there [abstract]. — [Ecol. Monogr. 53:321–340, doi:10.2307/1942534](https://doi.org/10.2307/1942534)
- **Threlkeld 1979**, Wintergreen Lake, MI: *D. pulicaria* reproduction "greatly reduced for a 6-day period in mid-July", from high temperatures, declining small algae and rising *Anabaena*, *Ceratium* and *Volvox*. Bluegills preyed heavily on both *Daphnia* [abstract]. — [Ecology 60:165–179, doi:10.2307/1936478](https://doi.org/10.2307/1936478)
- **Wu & Culver 1994**, western Lake Erie [primary]: *Daphnia* birth rates were lowest when edible phytoplankton was lowest. Edible biomass below ~4 g/m³ fresh suppressed birth rates and started the midsummer decline. — [J. Great Lakes Res. 20:537–545, doi:10.1016/S0380-1330(94)71170-9](https://www.reabic.net/publ/Wu_Culver_1994.pdf)
- **Digestion-resistant algae:** *Oocystis* survives gut passage. *Daphnia* population growth, reproduction and survival were "much lower" with it even where growth assays showed no P limitation [abstract]. — [DeMott & Van Donk 2012, Oecologia 171:175–186, doi:10.1007/s00442-012-2404-y](https://doi.org/10.1007/s00442-012-2404-y)

**What a *Daphnia* can eat.**
- The largest bead ingested is y (µm) = **22·x + 4.87**, with x = carapace length in mm [abstract]. So a 1.0 mm *Daphnia* takes particles up to ~27 µm, and 1.5 mm up to ~38 µm [inf]. — [Burns 1968, L&O 13:675–678, doi:10.4319/lo.1968.13.4.0675](https://doi.org/10.4319/lo.1968.13.4.0675)

**Hot Brook-specific candidates** (from the repo's earlier evidence notes) [snippet]:
- ***Gloeotrichia*** is in 26 of 27 low-nutrient New England lakes; Maine peaks are 58–192 colonies/L.
- ***Peridinium***, desmids (*Staurastrum*, *Staurodesmus*) and colonial chrysophytes (*Dinobryon*, *Uroglena*, *Synura*) are expected in summer.
- ***Gonyostomum*** is probably rare in unstratified lakes. — `Hot Brook populations and water/plankton_microbes_plants_evidence.md` §2

---

## Q4. Invertebrate predators of *Daphnia*

### Takeaway
Invertebrate predators remove **juveniles**. In fish lakes they are usually second to fish, but in some windows they explain all *Daphnia* mortality: *Leptodora* in late June–early July in Mendota.
- Rates are at most a few to ~17 % of the preferred prey's standing crop per day.
- *Mesocyclops edax* is in 34/48 analogue lakes. It eats mostly rotifers, nauplii and newborn cladocerans.
- *Chaoborus* in fish lakes (*C. punctipennis*) hides in the sediment by day, so day tows miss it.
- Low Ca (< 1.5 mg/L) strips juvenile *Daphnia* of their *Chaoborus* defences.

A summer juvenile mortality of **~0.02–0.1 /d** from invertebrates is a reasonable order of magnitude [inf from the rates below]. Usable whole-lake rates for small Northeast fish lakes were not found.

### Findings

**Leptodora.**
- **Lunte & Luecke 1990**, Lake Mendota enclosures plus field data [abstract]:
  - *Leptodora* fed on small and large *Daphnia*, *Diaphanosoma*, *Conochilus* and nauplii;
  - it "**could account for all of the mortality calculated for *Daphnia galeata mendotae* in late June to early July**", but was too scarce earlier;
  - because fish eat both *Leptodora* and daphnids, fewer planktivores could *raise* *Daphnia* mortality through more *Leptodora*. — [L&O 35:1091–1100, doi:10.4319/lo.1990.35.5.1091](https://doi.org/10.4319/lo.1990.35.5.1091)
- **Boersma, van Tongeren & Mooij 1996**, Tjeukemeer [primary]:
  - assuming ~10 prey per *Leptodora* per day (Browman et al. 1989), *Leptodora* was too scarce to explain the high mortality of small *Daphnia* (< 0.5 mm);
  - that mortality was "most probably" starvation, since fish ate almost none of that size class;
  - in mesotrophic Lake Vechten, small-*Daphnia* mortality was attributed to *Chaoborus flavicans* and *Leptodora* [snippet: Hovenkamp 1990, cited there]. — [CJFAS 53:18–28, doi:10.1139/cjfas-53-1-18](https://epic.awi.de/id/eprint/5065/1/Boe1996e.pdf)
- *Leptodora* caused a 100-fold *Bosmina* decline in Lake Michigan. *Epischura* and *Limnocalanus* had no measurable effect [abstract]. — [Branstrator & Lehman 1991, L&O 36:483–495, doi:10.4319/lo.1991.36.3.0483](https://doi.org/10.4319/lo.1991.36.3.0483)
- *Leptodora* is itself regulated by predation from 0+ fish [abstract]. — [Vijverberg, Koelewijn & van Densen 2005, L&O 50:455–464, doi:10.4319/lo.2005.50.2.0455](https://doi.org/10.4319/lo.2005.50.2.0455)
- **In the analogue lakes:** *Leptodora* was in 5/48 NLA analogue samples [primary] and in 13 % of Kejimkujik lakes (July–September) [snippet].

**Cyclopoids on neonates.**
- ***Acanthocyclops*** at 40–50/L: in five cladoceran species, 1-d-old neonates were the most vulnerable. Large *Daphnia* became almost immune after 3–5 d and fully immune as 7-d adults; small species stayed vulnerable until maturity [abstract]. — [Gliwicz & Umana 1994, L&O 39:419–424, doi:10.4319/lo.1994.39.2.0419](https://doi.org/10.4319/lo.1994.39.2.0419)
- ***Mesocyclops edax***, enclosures with natural prey [abstract]:
  - it "may ingest fifty or more prey per predator per day, accounting for **up to 17 % of the standing crop of its preferred prey species per day**";
  - gut contents were rotifers, cladocerans, copepods and algae. — [Williamson 1984, Freshw. Biol. 14:575–585, doi:10.1111/j.1365-2427.1984.tb00177.x](https://doi.org/10.1111/j.1365-2427.1984.tb00177.x)
- *M. edax* on *Diaptomus* copepodites: 0.07–1.30 prey per predator per day, removing 1–6 % of the copepodite standing crop per day; it chose copepodites over cladocerans [abstract]. — [Confer 1971, L&O 16:663–666, doi:10.4319/lo.1971.16.4.0663](https://doi.org/10.4319/lo.1971.16.4.0663)
- **In the analogue lakes:** *M. edax* was in **34/48**, mean 12.5 µg DW/L, the second-largest crustacean biomass after *D. catawba* [primary].

**Chaoborus.**
- **Fedorenko 1975**, Eunice Lake, BC (*C. americanus* and *C. trivittatus*) [abstract]:
  - estimated mean percentage of the prey standing crop eaten: 2 % for nauplii, 3 % for *Diaptomus tyrelli*, 9 % for *D. kenai* and 4 % for *Diaphanosoma*. The abstract gives no time unit. A UBC thesis record on the same lake ([cIRcle doi:10.14288/1.0101206](https://doi.org/10.14288/1.0101206)) says *Chaoborus* "could potentially remove" 3–20 % of the prey standing crop;
  - predation was reduced by seasonal and spatial segregation and by size mismatch. — [L&O 20:250–258, doi:10.4319/lo.1975.20.2.0250](https://doi.org/10.4319/lo.1975.20.2.0250)
- ***C. americanus* on *D. pulex*:** Type II functional response, with the attack rate highest on intermediate-sized *Daphnia*. Attack rate rose with temperature and handling time fell [abstract]. — [Spitze 1985, Ecology 66:938–949, doi:10.2307/1940556](https://doi.org/10.2307/1940556)
- **Michigan lake enclosures:** *Chaoborus* significantly cut *D. pulicaria* population growth even with bluegill, and the two effects were additive. On smaller *Daphnia* the *Chaoborus* effect was weaker when fish were present [abstract]. — [González & Tessier 1997, Freshw. Biol. 38:179–191, doi:10.1046/j.1365-2427.1997.00204.x](https://doi.org/10.1046/j.1365-2427.1997.00204.x)
- **Field rates in a 4.8-m bass–bluegill lake:** 0.32 larvae/L at midnight; 1.7 prey per larva per day, mostly rotifers; *Daphnia* not selected [snippet: Lencioni 2006, in `small_zooplankton_and_microbial_loop.md` Q6].
- **In the analogue lakes:** *Chaoborus* appeared in 6/48 NLA day tows [primary]. That is an underestimate, because larvae in shallow fish lakes rest in the sediment by day [inf].

**Polyphemus and Epischura.**
- *Polyphemus* was in 2/48 NLA analogues [primary]. It is littoral, and fish select it [snippet].
- *Epischura* was in 5/48 [primary]. It had no measurable effect on *Bosmina* in Lake Michigan (Branstrator & Lehman 1991).

---

## Q5. Fish planktivory

### Takeaway
**The best-supported mechanism the sim lacks** is a large, short, size-selective pulse of YOY planktivory in July–August.
- In strong year-classes it eats more than *Daphnia* production. Once *Daphnia* are low, fish keep them low even when algae recover.
- Adult planktivory is small by comparison.
- The pulse comes from YOY yellow perch (pelagic from ~10 mm to ~20–35 mm, selecting *Daphnia* from ~30 mm), YOY white perch and, in Lower, YOY alewife from mid-July.
- Size selection keeps summer *Daphnia* small: NLA analogue mean ~1.0 mm [inf]; Kezar 0.67–0.98 mm; Maine North Pond cladocerans 0.41 mm in late summer with alewife.
- Implied fish-caused death rates are **~0.1–0.3 /d** at field *Daphnia* densities, but only **~0.01–0.06 /d** if *Daphnia* stood at 300 µg/L, because the predators saturate [inf]. The sim's high *Daphnia* stock may be self-sustaining because it outgrows its predators.

### Findings

**Oneida Lake (yellow perch).**
- **Mills & Forney 1983** [abstract]:
  - *D. pulex* "could tolerate predation by **10 kg of young fish·hectare⁻¹** but reproduction could not compensate … when biomass of young exceeded **20–40 kg·hectare⁻¹**";
  - in 1975 and 1977, YOY consumption exceeded *D. pulex* production and the daphnids disappeared;
  - in 1976 maximum daily consumption was < 27 % of production, and *Daphnia* stayed abundant. — [TAFS 112:154–161, doi:10.1577/1548-8659(1983)112<154:IODPOP>2.0.CO;2](https://doi.org/10.1577/1548-8659(1983)112%3C154:IODPOP%3E2.0.CO;2)
- **Mills et al. 1987:** "In years when the density of age 0+ yellow perch exceeds **14,000/ha in August**, *Daphnia pulex* disappears" [snippet: quoted in an EPA report, in `fetched_sources_digest.md`].

**Western Lake Erie** (Wu & Culver 1994) [primary].
- Larval perch < 20 mm selected copepods. After ~6 July (perch > 30 mm), selection for *D. g. mendotae* rose sharply.
- Bioenergetics:
  - YOY yellow perch accounted for **all** *D. g. mendotae* mortality on 4–11 July, and **~50 %** during the decline;
  - consumption fell to near zero in late July–August, when the perch moved to benthos.
- YOY white perch were the most abundant YOY there. Extrapolating perch parameters to them gave **> 100 %** of observed mortality.
- Egg development time was D = 1/(0.00041T² + 0.0108T − 0.0163) d (from Luecke et al. 1990). That is 2.75 d at 20 °C and 2.1 d at 24 °C [inf arithmetic]. — [doi:10.1016/S0380-1330(94)71170-9](https://www.reabic.net/publ/Wu_Culver_1994.pdf)

**Lake Mendota** (perch and cisco).
- Low spring consumption allowed a clear-water phase. The *D. galeata* decline that followed came from food depletion. Then "predation by perch and cisco was sufficient to keep populations … at low densities during July and August **in spite of more abundant algal food**" [abstract]. — [Luecke et al. 1990, L&O 35:1718–1733, doi:10.4319/lo.1990.35.8.1718](https://doi.org/10.4319/lo.1990.35.8.1718)
- Fish consumption equalled "**2 % of Daphnia mortality during the midsummer decline, but … essentially 100 %** of the observed Daphnia mortality in late July and August" [snippet: Luecke et al. 1990 as summarised in Wu & Culver 1994].

**Lake Lacawac, PA** (20 ha, max 12 m, mesotrophic; the closest analogue with *D. catawba* and yellow perch).
- *D. catawba* peaks in spring and autumn. In summer it is suppressed by two consecutive YOY yellow-perch cohorts:
  - the first cohort fed on *D. catawba* in June, then moved to the littoral at ~20 mm;
  - the second fed on it in August.
- When predation relaxed, *D. catawba* fecundity rose.
- Perch larvae > 10 mm eat adult *D. catawba*, and take almost no prey < 0.5 mm (Wahl et al. 1993, cited). Only juvenile *Holopedium* were eaten [primary: Kasparson & Polishchuk 2023, re-analysing Tessier 1986]. — [J. Limnol. 82:2142, doi:10.4081/jlimnol.2023.2142](https://doi.org/10.4081/jlimnol.2023.2142); [Tessier 1986](https://doi.org/10.2307/1938573)

**Tjeukemeer** (0+ fish). In the second half of 1990 and 1991, "**all of the mortality in the larger size-classes of the daphnids can be explained by predation by 0+ fish**". Small *Daphnia* (< 0.5 mm) died at high rates without being eaten [primary, Boersma et al. 1996].

**Northern Poland** (roach). Summer *Daphnia* density stayed in a narrow band:
- mean *D. cucullata* 11.5 ± 2.5/L and *D. hyalina* 1.1 ± 0.5/L, despite "markedly changing fecundity";
- "**Food availability merely sets the rate of population increase, while the actual population density … reflects the species' vulnerability to predation**" [abstract]. — [Gliwicz 2000, J. Plankton Res. 22:1539–1557, doi:10.1093/plankt/22.8.1539](https://doi.org/10.1093/plankt/22.8.1539)

**Counter-examples** (food, not fish).
- Dynamite Lake, IL (bluegill): food manipulations changed zooplankton densities far more than fish did; fish mainly reduced *Ceriodaphnia* and body size [abstract]. — [Vanni 1987, Ecol. Monogr. 57:61–88, doi:10.2307/1942639](https://doi.org/10.2307/1942639)
- DeMott 1983 (a Vermont lake): competition, not fish [abstract].

**Alewife** (planned for Lower; see `SESSION_STATE.md`).
- Lake Michigan alewives ate a mean of **~8 % of crustacean biomass per day in August–September** (mid-1970s) and 2.3 %/d in the mid-1980s. The peak 1966 population would potentially have eaten 20 %/d, which the authors tie to that population's severe mortality. Larvae and YOY did 50 % of total consumption [abstract]. — [Hewett & Stewart 1989, TAFS 118:581–596, doi:10.1577/1548-8659(1989)118<0581:ZBAILM>2.3.CO;2](https://doi.org/10.1577/1548-8659(1989)118%3C0581:zbailm%3E2.3.co;2)
- **Maine, East and North Ponds** (Belgrade Lakes; shallow, mesotrophic, white perch) [abstract]:
  - 2004–06 mean cladoceran biomass was **31.4 µg/L (East) and 23.4 µg/L (North)**;
  - North Pond's mean cladoceran size fell from 0.72 mm (June–early July) to **0.41 mm (mid-August–October)**, attributed to alewife;
  - **YOY white perch ate mainly large cladocerans such as *Daphnia***, more than juvenile yellow perch did, and selected for *Daphnia*. — [Trinko 2008, MS thesis, University of Maine (DigitalCommons ETD 1150)](https://digitalcommons.library.umaine.edu/etd/1150)
- Young alewives cut cladoceran and copepod size, and cladoceran biomass fell in 3 of 4 Maine alewife lakes [snippet: Demi et al. 2015, Hydrobiologia 758:47–59, doi:10.1007/s10750-015-2264-7, via `plankton_microbes_plants_evidence.md`].

**Pumpkinseed and littoral perch.** In littoral enclosures [abstract]:
- yellow perch alone ate < 1 % microcrustaceans;
- with pumpkinseed (the superior competitor for macroinvertebrates) they ate **30–53 % microcrustaceans by weight**. — [Hanson & Leggett 1986, CJFAS 43:1363–1372, doi:10.1139/f86-170](https://doi.org/10.1139/f86-170)

**Body size under predation.**
- **Long Lake, MI:** the end of the clear-water phase came with severe size-selective loss of *D. pulicaria* 0.8–1.8 mm. Perch of 15–20 mm *avoided* *Daphnia* (Ivlev −0.75) and chose copepods (+0.50) [abstract]. — [Hoffman, Smith & Lehman 2001, Freshw. Biol. 46:759–775, doi:10.1046/j.1365-2427.2001.00716.x](https://doi.org/10.1046/j.1365-2427.2001.00716.x)
- **Indicator:** a mean crustacean length of ~0.8 mm (153 µm net) indicates a balanced piscivore/planktivore community [snippet: Mills & Schiavone 1982, Mills, Green & Schiavone 1987, and an EPA SOLEC sheet, via `fish_zooplankton_coupling.md`].
- **NLA analogue *Daphnia*:** median 4.6 µg, i.e. ~1.0 mm (IQR ~0.8–1.3 mm) [primary/inf].
- **Kezar Lake, ME** (deep basin, 2004–07): mean *Daphnia* length 0.67–0.98 mm, weighted cladoceran length 0.60–0.85 mm [primary].

**Implied summer death rate from YOY fish [inf].**
- Inputs:
  - YOY perch at the Oneida collapse threshold, 20–40 kg wet/ha;
  - zooplankton ration 0.10–0.20 g/g/d for 20–50 mm perch in July (FB4-scale, from `fish_zooplankton_coupling.md`);
  - so fish eat 2–8 kg wet/ha/d = 0.2–0.8 kg DW/ha/d = 20–80 mg DW/m²/d;
  - half of the diet is *Daphnia* (between Lake Erie's early-July 100 % and later ~0).
- The *Daphnia* stock over Lower's 2.4-m mean depth:
  - 50 µg/L → 120 mg DW/m² → **d ≈ 0.08–0.33 /d**;
  - **300 µg/L → 720 mg/m² → d ≈ 0.014–0.056 /d**.
- To impose d = 0.2 /d on 300 µg/L would take ~75–150 kg/ha of YOY at a 10–20 % ration, several times the field collapse threshold.
- **Conclusion:** at the sim's stock the predators are swamped. At field stocks the same fish dominate the losses.

---

## Q6. Field seasonal values in lakes like Hot Brook

### Takeaway
- **Summer *Daphnia* biomass** in small Northeast and Upper Midwest soft-water lakes is **usually 0–50 µg DW/L** (NLA median 3, p75 46).
- **Total crustaceans** are **~30–230 µg DW/L** (NLA p25–p75), with copepods half or more.
- **Maine pond means** (cladocerans 23–31 µg/L) and **Cooper's 1940 August survey of Maine lakes** (~32 crustaceans/L ≈ 90 µg/L) agree.
- **Seasonal shape:** a spring *Daphnia* peak (May–June, a clear-water phase in more productive lakes), a **midsummer trough (July–August)** under YOY predation and resistant algae, and an **autumn recovery** (September–October).

### Findings

**NLA 2012 analogues** (n = 48; NAP + UMW, depth 1.5–8 m, TP 5–25, Ca ≤ 8) [primary, my analysis].

All values µg DW/L, except *Daphnia* density (per L):

| Quantity | p10 | p25 | median | p75 | p90 | mean |
|---|---|---|---|---|---|---|
| Daphniid biomass | 0 | 0.1 | **3.0** | 45.8 | 94.8 | 43.5 |
| Cladocera | 0.6 | 1.8 | 25.7 | 91.6 | 199 | 65.6 |
| Copepoda | 5.7 | 15.7 | 53.4 | 119 | 183 | 79.4 |
| Crustacea | 7.2 | 31.5 | **129** | 230 | 280 | 145 |
| Rotifera | 1.4 | 2.5 | 5.9 | 23.6 | 43.5 | 17.9 |
| *Daphnia* density (/L) | — | — | 0.29 | 9.2 | 15.5 | max 55 |

- Lakes < 4 m deep (n = 17): *Daphnia* median 0.6, p90 49, **never > 100 µg/L**. Lakes 4–8 m deep (n = 31): median 5.3, p90 248; 13 % > 200.
- *Daphnia* exceeded copepods in only 10/48.
- **By month** (cross-sectional; different lakes in each month):

  | Month | n | *Daphnia* median (µg/L) | crustacean median (µg/L) |
  |---|---|---|---|
  | June | 9 | 3.0 | 31 |
  | July | 17 | 0.7 | 88 |
  | August | 11 | 0.5 | 132 |
  | September | 11 | 6.9 | 174 |

  That is a midsummer *Daphnia* trough while copepods build.
- **Northeast-only subset** (ME, NH, VT, NY, MA; Ca ≤ 5; n = 30):
  - crustaceans median 151 (IQR 64–234); *Daphnia* median 1.2 (IQR 0–69);
  - the four lake-visits > 200 µg/L *Daphnia* were all 5.7–7 m deep (MA-105, NY-0106, NY-0111, NH-101);
  - Maine lake-visits (n = 11, August–September) had *Daphnia* 0–75 µg/L (zero in 6 of them) and crustaceans 6–314 µg/L.

**Maine field surveys.**
- **Cooper's 1940 survey** (August, 53 lakes, 0–15 ft): copepods 613/ft³ and cladocerans 271/ft³, ≈ 22 and 10 per L ≈ **~90 µg DW/L** [snippet: Fish Survey Report No. 4, read in `fetched_sources_digest.md`; the µg figure is that note's inference]. *Cyclops* outnumbered *Diaptomus*; *Bosmina* and *Daphnia* were the commonest cladocerans.
- **East and North Ponds, Belgrade Lakes:** mean cladoceran biomass 31.4 and 23.4 µg/L, 2004–06 [abstract, Trinko 2008].
- **Kezar Lake, ME** (deep, oligotrophic; 80 µm net, ~40 m tows, so densities are diluted by the hypolimnion) [primary]:
  - total crustaceans 0.8–3.2/L; *Daphnia* 0–0.55/L;
  - *Holopedium* 0–0.066/L; *Leptodora* trace. — [Cousins & Webster 2008, KLWA report](https://kezarwatershed.org/s/Kezar_ZooplanktonFinal_Cousins_29FEB08-2.pdf)

**Shield, New Hampshire and Pennsylvania.**
- **Yan 1986**, 16 nutrient-poor Shield lakes: TP is the best long-term predictor of crustacean biomass, and TN the best within a season. Coefficients were not retrieved [abstract]. — [CJFAS 43:788–796, doi:10.1139/f86-097](https://doi.org/10.1139/f86-097)
- **Yan et al. 2008**, Dorset: mean cladoceran length rose from 0.6 to 1.0 mm in seven lakes between 1980 and 2003. Causes were falling TP, rising pH and DOC, and changed predation [abstract]. — [CJFAS 65:862–877, doi:10.1139/f07-197](https://doi.org/10.1139/f07-197)
- **Mirror Lake, NH** (oligotrophic): annual zooplankton biomass 1.4–2.6 kg C/ha (mean 2.0). Copepods are 55 % of biomass but only 19 % of production; rotifers are 40 % of production [abstract]. — [Makarewicz & Likens 1979, Ecol. Monogr. 49:109, doi:10.2307/1942575](https://doi.org/10.2307/1942575)
  - At a ~5.75 m mean depth, 2.0 kg C/ha ≈ 35 µg C/L ≈ 70 µg DW/L [inf].
- **Lake Lacawac, PA:** see Q5. *D. catawba* has spring and autumn peaks and a summer trough under YOY perch [primary, via Kasparson & Polishchuk 2023].

**More productive references.**
- **Oneida:** May–October means were 22–196 µg/L *Daphnia* and 97–315 µg/L total [snippet: `zooplankton_dynamics.md` Q1].
- **Shallow European lakes:** median 289 µg/L total including rotifers, at a median TP of 55 [snippet, same note]. Both are richer than Hot Brook.

---

## Q7. Realised summer birth rates

### Takeaway
Direct summer egg-ratio birth rates for Hot Brook-like lakes were **not retrieved** (gap). Indirect evidence:
- **Realised per-capita growth in Shield-lake water in fishless mesocosms:** mean **0.01–0.03 /d** (max ~0.11), against lab maxima of 0.14–0.58 /d.
- **Total zooplankton mortality:** ~0.13 /d (seasonal).
- **Non-predation mortality:** ~0.015 /d (*Bosmina*).
- **The egg ratio implied by b = 0.6 /d** at 20 °C is ~4 eggs per individual. The field's b of 0.05–0.3 /d needs 0.15–1.25 [inf].

So the sim's G_D = 0.6 is a reasonable *maximum*, the lab upper end. In real summer water the realised birth rate is perhaps 3–10× lower, set by the edible food.

### Findings

**Arnott, Azan & Ross 2017** [primary] (chl 1.4–4.3 µg/L):
- mean per-capita growth across 18–20 taxa was **0.012 /d** (range −0.069 to 0.114; Havelock), 0.009–0.025 /d (Lumsden) and 0.012–0.034 /d (Dorset);
- *D. pulex/pulicaria* averaged **−0.32 /d** and *H. glacialis* −0.41 /d even at ~2.4 mg Ca/L in the Dorset experiment;
- "because of low food availability, per capita growth rates … were lower than published laboratory values … **0.14 to 0.58 /day at ~20 °C** (Lynch 1980)."

**Dubovskaya et al. 2015** [primary]:
- *Bosmina* non-predation mortality was 0.015 /d (0.018–0.056 by variants) in midsummer in an oligo-mesotrophic lake.
- From the sources the authors cite:
  - total mortality ~0.13 /d (assumed, and Ivanova's seasonal average for a Russian lake);
  - *Daphnia* non-predation mortality in Lake Constance 0.002–0.18 /d (Gries & Güde);
  - "physiological death" 0.01–0.05 /d. — [PLoS ONE 10:e0131431, doi:10.1371/journal.pone.0131431](https://pmc.ncbi.nlm.nih.gov/articles/PMC4492990/)

**Egg ratio → birth rate [inf].**
- Paloheimo: b = ln(1 + E)/D, where E is eggs per individual.
- Bottrell et al. (1976) give ln D = 3.3956 + 0.2193·lnT − 0.3414·(lnT)². That is D = 2.7 d at 20 °C and 1.9 d at 24 °C, matching `config.js`'s 2.7 d.
- At 20 °C:

  | b (/d) | E needed (eggs per individual) |
  |---|---|
  | 0.05 | 0.15 |
  | 0.1 | 0.31 |
  | 0.2 | 0.72 |
  | 0.3 | 1.25 |
  | 0.6 | 4.0 |

- At 24 °C, b = 0.6 still needs E ≈ 2.1.
- *D. catawba* first clutches are a few eggs per *female* (lab clutches 4–9 eggs in *D.* cf. *pulex* on high food; Ramos-Rodríguez 2022).
- A whole-population E of ~4 needs nearly every animal to be an adult with a large clutch. Field summer populations with juveniles and food-limited clutches cannot sustain it [inf].

**Qualitative field birth-rate evidence.**
- Lake Erie birth rates were lowest at the edible-algae minimum (Wu & Culver 1994, figure only) [primary].
- At Lacawac:
  - *D. catawba* fecundity rose whenever YOY predation thinned the population (relaxed food limitation);
  - *Holopedium* fecundity was "near zero" in summer (Tessier 1986 [abstract]; Kasparson & Polishchuk 2023 [primary]).
- Polish lakes: fecundity changed markedly while density did not (Gliwicz 2000) [abstract].

---

## What the simulation should model (ordered by strength of evidence)

These are mechanisms with literature parameter values, not knobs to turn until the field ranges appear. The field ranges in the takeaway table are for checking afterwards.

**1. A summer, size-selective, non-saturating YOY planktivory pulse.** Strongest evidence: Oneida, Erie, Mendota, Lacawac, Tjeukemeer and the Polish lakes all agree.
- **Who.** Model it through the existing YOY schools.
- **Yellow perch YOY:**
  - take adult *D. catawba* from ~10 mm (Tessier 1986 via Kasparson & Polishchuk 2023);
  - select *Daphnia* from 30–35 mm (Mills et al. 1984, in `fish_zooplankton_coupling.md`);
  - copepods first below ~20 mm (Wu & Culver 1994; Hoffman et al. 2001).
- **White perch YOY:** take large cladocerans preferentially, more than perch YOY do (Trinko 2008).
- **Pumpkinseed YOY:** littoral.
- **Alewife YOY in Lower** from mid-July (when stage A lands): ~8 %/d of crustacean biomass is the Lake Michigan August–September scale (Hewett & Stewart 1989).
- **Diagnostics, not knobs.** Log the summer YOY planktivore biomass in kg/ha and the *Daphnia* death rate split into fish, other and starvation. Field references:
  - YOY perch tolerated at 10 kg/ha; *D. pulex* collapses at > 20–40 kg/ha (Mills & Forney 1983);
  - fish ≈ 100 % of large-*Daphnia* mortality in late July–August (Luecke et al. 1990; Boersma et al. 1996);
  - implied d_fish ≈ 0.1–0.3 /d at field *Daphnia* stocks [inf].
- **The response shape.**
  - Keep YOY as type II (`PLANKTON.K_FRY` 30 µg/L), which is consistent with the Oneida thresholds.
  - Check that adult type III (`K_ADULT` 25) does not hand *Daphnia* a predation-free refuge *above* ~25 µg/L. In the field, density is held at the predation-set level whatever the fecundity (Gliwicz 2000).
  - If YOY biomass in the sim is near the field's and *Daphnia* still sit at 300 µg/L, the missing piece is (2), not more fish.
- **Size.** If *Daphnia* body size is or becomes a state, fish should take > ~0.8–1.0 mm. Expected summer mean ~1.0 mm (NLA), 0.6–1.0 mm in Maine lakes.

**2. A grazing-resistant phytoplankton pool.** Strong evidence: Watson et al. 1992 and 1997; DeMott 1983; Threlkeld 1979; NLA analogues.
- Split the algae into:
  - **edible:** < ~30 µm; flagellates, cryptophytes, small diatoms, small greens (Burns 1968: max particle = 22·L(mm) + 4.87 µm);
  - **resistant:** large dinoflagellates (*Peridinium*, *Ceratium*), filamentous and desmid greens, gelatinous colonies, colonial cyanobacteria (*Anabaena*, *Gloeotrichia*), large colonial chrysophytes.
- The resistant pool:
  - takes N, P and light;
  - grows more slowly;
  - is barely grazed (rejected, or passes the gut viable: DeMott & Van Donk 2012);
  - sinks or dies to the detritus.
- **Values to check, not tune:**
  - summer resistant share ~58 % of biovolume (IQR 28–85 %); edible 21–26 %; edible stock ~0.2 mg/L fresh (NLA analogues);
  - edible algae roughly independent of TP (Watson et al. 1992);
  - seasonal shift from edible-dominated spring to resistant-dominated late summer.
- **Effect:** *Daphnia* run into their food threshold while chl stays at 2–4 µg/L, as in real lakes.
- **The sim already has** cyanobacteria with a `DAPH_CYANO` penalty, which is a partial version. This mechanism generalises it to the eukaryotic resistant algae that dominate soft-water lakes.

**3. Juvenile-*Daphnia* mortality from invertebrate predators.** Moderate evidence; the rates are poorly constrained.
- Add a juvenile- or neonate-weighted loss from *Mesocyclops* (34/48 analogue lakes), *Leptodora* (July–September) and *Chaoborus* (night; shallow-lake larvae in the sediment by day).
- Order of magnitude 0.02–0.1 /d in summer [inf], from:
  - *Leptodora* = all *D. mendotae* mortality for ~2 weeks (Lunte & Luecke 1990);
  - *M. edax* ≤ 17 %/d of its preferred prey (Williamson 1984);
  - *Chaoborus* 2–9 % of prey standing crop (Fedorenko 1975).
- Large *Daphnia* (> 3–7 d old) are immune to cyclopoids (Gliwicz & Umana 1994).
- If explicit predator fields are too costly, a summer, temperature-dependent juvenile loss term is the minimal version.
- These predators also eat rotifers and nauplii, which bears on the sim's rotifer problem.

**4. Food quality: P stoichiometry and algal taxon.** Moderate evidence for the mechanism, weak for a large effect at Hot Brook.
- If algal P quotas exist, multiply *Daphnia* assimilation or growth by a TER rule:
  - TER ≈ 200–300 molar C:P (Anderson & Hessen 2005; Brett et al. 2000; 155 for *D. magna*, Khattak et al. 2018);
  - the slope from DeMott et al. 1998: growth 0.54 → 0.17 /d over C:P 120 → 900, i.e. −16 % at 300 and −24 % at 400 [inf].
- At TP 9–12 µg/L expect a 0–25 % penalty in midsummer [inf]. In small lakes energy limitation dominates (DeMott, Edington & Tessier 2004; Persson et al. 2007).
- Taxon quality is probably larger than C:P (Brett et al. 2000: 4× more variance): diatoms and cryptophytes good, greens intermediate, cyanobacteria poor. This can live in the edible-pool composition (mechanism 2).
- **Colour:** terrestrial carbon depresses zooplankton production (Kelly et al. 2014). Hot Brook's colour is moderate, so the effect is small.

**5. Calcium.** Strong evidence for the threshold, weak for a big effect at ~2 mg/L.
- Add a fixed lake Ca, ~2.0 mg/L for both lakes [inf from NLA alkalinity analogues; measure if possible].
- Apply a birth (and juvenile-survival) multiplier f_Ca that is:
  - 1 at ≥ 2.5 mg/L;
  - falling toward ~0.5 by 1.0 mg/L, with r "decreasing dramatically between 1.5 and 1" (Ashforth & Yan 2008);
  - 0 at ≤ 0.3–0.5 mg/L.
- Shift the curve up by ~0.5 mg/L on low food and in warm water (Ashforth & Yan: the threshold rises to 1.5 mg/L).
- At 2 mg/L this gives f_Ca ≈ 0.8–1.0 [inf]: a small direct effect. Field mesocosms found none at 1.2–2.5 mg/L (Arnott et al. 2017).
- Its larger roles:
  1. **Species composition:** *Daphnia* vs Ca-poor *Bosmina*, *Holopedium* and copepods (Jeziorski et al. 2008: daphniids fell in 60–67 % of lakes < 2.0 mg/L);
  2. **×1.5–2.9 juvenile vulnerability to *Chaoborus*** below 1.5 mg/L (Riessen et al. 2012).

**6. Holopedium as a second large cladoceran.** Optional, for realism of composition.
- Traits:
  - ~1/10 the Ca and ~1/2 the P of *Daphnia*; clutch 2× (Jeziorski et al. 2015);
  - adults nearly immune to fish and *Chaoborus*; neonates eaten (Tessier 1986);
  - food-limited for most of the season, with fecundity near zero in summer (Tessier 1986);
  - poor mesocosm survival (Arnott et al. 2017).
- **Expected share:** small (median ~1 % of cladoceran biomass, p75 14 %, up to ~78 % in some lakes).
- It does not fix the biomass problem.

**7. Background (non-predation) mortality.** Keep `M_D` 0.03 /d. It sits inside the field's non-predation range: 0.015 /d (*Bosmina*), 0.002–0.18 /d (*Daphnia*, Lake Constance), "physiological death" 0.01–0.05 /d (Dubovskaya et al. 2015). Do **not** raise it to stand in for predation (mechanisms 1 and 3).

**8. Lower confidence (note only).**
- **Fungal epidemics** (*Metschnikowia*) in late summer and autumn in small lakes. Fish cull infected hosts; *Chaoborus* spread spores (Strauss et al. 2016, Ecol. Monogr. 86:393, doi:10.1002/ecm.1222) [abstract]. No usable rates.
- **No diel-migration refuge** in 2.5–5.5 m lakes. Already in the sim.

**Checks after implementing (field ranges, not targets).**

| Check | Field range | Source |
|---|---|---|
| July–August *Daphnia* | ~0–50 µg DW/L typical; < 100 in < 4-m lakes; occasional 200–350 in 5–7-m lakes | NLA |
| Crustaceans | ~30–230 µg/L, copepods ≥ half | NLA |
| Rotifers | ~2–24 µg/L | NLA, fine net |
| Edible algae | 20–50 % of summer biovolume | NLA |
| *Daphnia* density | ≤ ~15/L at p90 | NLA |
| Seasonal sequence | spring *Daphnia* peak → July–August trough → September–October recovery | Lacawac; Mendota; NLA months |

---

## Gaps (not retrieved this session)

- **Field egg-ratio birth rates** for *Daphnia* in small Northeast or Shield lakes in summer. Not found:
  - Tessier 1986 figures;
  - Hall 1964 (Base Line Lake) values;
  - Luecke et al. 1990 and Lampert 1988 rates.
- Numeric ***Chaoborus*/*Leptodora*-caused *Daphnia* death rates** (per day) in small fish lakes.
- **Seston C:P** for Maine or Hot Brook-like lakes; **measured Ca** for Upper and Lower Hot Brook (an NLA-based estimate is used).
- **Coefficients** of Yan 1986 (crustacean biomass vs TP in Shield lakes); Persson et al. 2007 predicted growth rates; Demi et al. 2015 (Maine alewife lakes) numbers.
- **The full Trinko 2008 thesis** (East and North Ponds, Maine). UMaine's repository has moved; see the access log.
- **NLA caveats:** a single summer (2012), single-visit snapshots, day tows.

---

## Access log (blocked or limited sources; nothing was bypassed)

| Source | What it holds | Result |
|---|---|---|
| WebSearch | — | Shared per-turn budget exhausted at the 2nd search; switched to OpenAlex, Crossref and Europe PMC APIs and direct URLs, as instructed |
| Wiley / ASLO (`aslopubs.onlinelibrary.wiley.com/doi/pdf/…`, `onlinelibrary.wiley.com/doi/pdfdirect/…`) | Luecke et al. 1990; DeMott, Edington & Tessier 2004; Lunte & Luecke 1990; Wissel et al. 2003; Prater et al. 2016 | HTTP 403, and a Cloudflare "Just a moment…" challenge. Not attempted further; abstracts used |
| University of Michigan Deep Blue (`deepblue.lib.umich.edu/handle/2027.42/179501`) | Hall 1962 thesis (*D. g. mendotae* dynamics) | HTTP 403 |
| MPG.PuRe (`pure.mpg.de/pubman/item/item_3647837`) | Lampert 1988, food vs predation in two *Daphnia* | HTTP 403 |
| UMaine DigitalCommons (`digitalcommons.library.umaine.edu/...etd/1150`) | Trinko 2008 thesis | Repository "sunset June 30, 2026"; the successor ("Specto") needs an interactive catalogue search. Not pursued; OpenAlex abstract used |
| EDI / PASTA (`pasta.lternet.edu`, NTL-LTER zooplankton) | Wisconsin lake seasonal series | "not authorized" for the public revision listing. Not pursued |
| OUP *J. Plankton Res.* (Gliwicz 2000; Hessen et al. 2000) | — | Abstract only (paywall) |
| CJFAS (cdnsciencepub), JSTOR (*Ecology*, *Ecol. Monogr.*), Springer (*Hydrobiologia*, *Oecologia*) | — | Paywalled; abstracts via OpenAlex/Crossref |
| *J. Limnol.* HTML galley | Kasparson & Polishchuk 2023 | Shell page only. The PDF galley (`/article/download/2142/1973`) worked |

**Read in full:**
- Jeziorski et al. 2008 (Queen's PEARL PDF);
- Arnott, Azan & Ross 2017 (U Toronto accepted manuscript);
- Wu & Culver 1994 (reabic.net);
- Boersma et al. 1996 (AWI ePIC);
- Kasparson & Polishchuk 2023 (J. Limnol. PDF);
- Ramos-Rodríguez et al. 2022, Dubovskaya et al. 2015 and Jeziorski et al. 2015 (PMC);
- the Kezar Lake report (KLWA);
- the EPA NLA 2012 data files: zooplankton counts and metrics, phytoplankton counts, key variables, water chemistry and site info.

PDFs and data were saved only to the session scratchpad, not the repo.
