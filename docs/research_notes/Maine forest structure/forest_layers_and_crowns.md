# Forest layers, stem densities and crowns of the mixed forest around the Hot Brook lakes

**Scope.** Field values for stocking a first-person 3-D forest around small lakes in central and eastern Maine: Hot Brook Lakes, Danforth/Weston, Washington and Aroostook counties, in the Acadian transition between northern hardwoods and spruce–fir. The note covers five questions:
1. stem density by layer, basal area and canopy cover;
2. crown dimensions;
3. the shrub, herb and moss layers;
4. coarse woody debris and snags;
5. the lakeshore vegetation band.

Compiled 2026-10-23.

**Region flags.** Every number carries one:
- **[ME-E]**: eastern Maine (FIA plots in Aroostook, Penobscot and Washington counties).
- **[HB40]**: FIA plots within 40 km of 45.70 N, 67.90 W (around Hot Brook).
- **[ME]**: Maine.
- **[NE]**: other New England / New York.
- **[CA]**: Canada.
- **[other]**: anywhere else.

**What is new here.** Much of Q1–Q4 is my own summary of the raw USDA Forest Service FIA plot data for Maine. I recomputed those statistics from the published tables rather than taking them from a report. The method is in §0, so anyone can rerun it. Everything else comes from published sources, cited inline.

**Access notes.** Nothing below was obtained by getting around a block.
- **maine.gov (MNAP community pages, the 2005 Ecological Reserves update):** returned HTTP 403 to direct fetches. MNAP facts below come from search-engine summaries of those pages and are marked *(search summary)*.
  - The 2018 Ecological Reserves report was read in full from the copy the project deposited in the UVM Forest Ecosystem Monitoring Cooperative (FEMC) archive.
- **afs-journal.org:** served a bot check (DataDome CAPTCHA). Saunders & Wagner 2008, the central-Maine height–diameter models, was not read.
- **UMaine DigitalCommons:** has been retired (theses not reachable).
- **forest.umaine.edu:** TLS certificate rejected / 404.
- **Brissette 1996 PDF:** a scan with no text layer, so only its abstract numbers are used.

---

## Values to use (summary)

Medians with interquartile range (IQR) unless marked. "Mature" means FIA stand age ≥ 60 yr; "mid" means 30–59 yr. Forest type follows the softwood share of basal area (BA) in trees ≥ 10 cm: softwood ≥ 65 %, mixedwood 35–65 %, hardwood < 35 %.

| Layer / item | Value to use | Range | Source |
|---|---|---|---|
| **Landscape mix around Hot Brook** | 41 % softwood, 31 % mixedwood, 27 % hardwood stands; median stand age 55 yr; median softwood share of BA 56 % | IQR 32–77 % softwood | FIA 2021–25, 105 plots [HB40] |
| Canopy trees ≥ 10 cm dbh, mature mixedwood | **710 /ha** | 480–930 | FIA [ME-E] |
| …mature softwood / hardwood | 780 /ha / 560 /ha | 590–1,120 / 370–850 | FIA [ME-E] |
| …mid-successional softwood / mixedwood / hardwood | 1,020 / 820 / 640 /ha | 650–1,370 / 600–1,170 / 370–880 | FIA [ME-E] |
| …aspen–birch type, mid / mature | 850 / 850 /ha | 650–1,200 / 610–1,080 | FIA [ME-E] |
| Saplings 2.5–10 cm dbh, mature | **1,850 /ha** (soft- and mixedwood), 1,480 /ha (hardwood) | 740–3,330 | FIA [ME-E] |
| Saplings, mid-successional | 2,600–2,800 /ha (soft/mixed), 1,850 (hardwood) | 1,110–4,820 | FIA [ME-E] |
| "Sapling" ≥ 1.4 m tall and < 10 cm dbh (the layer as defined in the brief) | ≈ FIA saplings + 12 % of FIA seedlings ⇒ **~2,800–3,000 /ha** mature, ~3,500–4,000 /ha mid | — | derived (FIA 2013: 12 % of seedlings ≥ 1.5 m) [ME] |
| Seedlings < 2.5 cm dbh (conifers ≥ 15 cm, hardwoods ≥ 30 cm tall) | **8,000–10,000 /ha** | 4,500–16,500 | FIA [ME-E] |
| …of which balsam fir (mature soft/mixed) | 3,100–3,600 /ha mean; on 85–96 % of plots | — | FIA [ME-E] |
| Advance regeneration, research plots in spruce stands | balsam fir 11,900 /ha + red spruce 10,200 /ha at 0.1–0.5 m tall | 0–160,000 /ha (red spruce) | Dibble et al. 1999 [ME] |
| Total regeneration after partial harvest | 25,000–80,000 /ha (> 15 cm tall, < 1.3 cm dbh) | — | Brissette 1996 (PEF) [ME] |
| Basal area, live ≥ 10 cm | mature: 27 (softwood), 23 (mixed), 22 (hardwood) m²/ha | 15–33 | FIA [ME-E] |
| Basal area, all stems ≥ 2.5 cm | mature: 33 / 28 / 25 m²/ha | 19–40 | FIA [ME-E] |
| Basal area, unharvested reserves (≥ 12.7 cm) | 32 spruce–fir, 25 maple–beech–birch, 18 aspen–birch m²/ha | mean values | Kuehne et al. 2018 [ME] |
| Canopy cover | **90 %** live canopy cover | 86–92 % | FIA [ME-E] |
| Canopy openness at 0.6 m (fisheye) | **7–9 %** under closed mixed-conifer canopy | 6.6–12 % | PEF data (Olson et al. 2019) [ME] |
| Stems by height, mature mixedwood | per ha: 2–5 m 890 · 5–10 m 1,220 · 10–15 m 630 · 15–20 m 200 · 20–25 m 43 · > 25 m 4 | — | FIA [ME-E] |
| **Crown width** | lcw = mcw / (b1·D^b2), with mcw = a1·D^a2 (Table §2.1). At canopy size: crown width ≈ **0.27 × height** (fir, spruce); 0.25 (aspens); 0.3 (pine, cedar, red maple, paper birch); 0.4–0.45 (hemlock, yellow birch, beech) | — | Russell & Weiskittel 2012 [ME] + FIA heights |
| **Live crown ratio** (uncompacted, trees ≥ 10 cm) | balsam fir 0.50 · red spruce 0.50 · white pine 0.43 · cedar 0.59 · hemlock 0.63 · paper birch 0.42 · quaking aspen 0.38 · bigtooth aspen 0.39 · red maple 0.47 · beech 0.58 | — | FIA [ME] |
| Shrub cover, all heights (FIA "shrubs" include subshrubs) | 19 % mean (median 12 %); ~17 % lies in 0–0.6 m, 7 % in 0.6–1.8 m, 2 % in 1.8–4.9 m | — | FIA P2 vegetation [ME] |
| Fern / forb / graminoid cover | 15 / 22 / 9 % mean (medians 9 / 17 / 3 %) | aspen–birch highest (18 / 28 %) | FIA P2 vegetation [ME] |
| Herb layer under closed spruce–fir | **< 10 %** (2 % in PEF reference stands) | — | MNAP; PEF data [ME] |
| Moss / liverwort ground cover, conifer stands | **38 %** mean | 0–90 %; 14 % (dense uncut) to 51 % (selection-cut) | Dibble 1999; PEF data [ME] |
| Snags ≥ 12.7 cm dbh | mature softwood **74 /ha** (mean 86), mixedwood 45 (64), hardwood 30 (43), aspen–birch 89 | 15–119 | FIA [ME-E] |
| Snags, unharvested reserves | 99 /ha mean (spruce–fir 119); large (≥ 40 cm) 3.3 /ha; old-growth Big Reed 12 /ha large | — | Kuehne et al. 2018 [ME] |
| Downed logs (≥ 7.6 cm, ≥ 0.9 m) | **~580 logs /ha** in mature stands (spruce–fir 660) | 290–1,150 | FIA P3 2006–10 [ME] |
| CWD volume | mature: median 27–33, mean 38–48 m³/ha | reserves 45–54; Big Reed 82; central-Maine mixedwood 109 | FIA; Kuehne 2018; Fraver 2002 [ME] |
| Ground covered by downed wood > 2.5 cm | **11–19 %** | — | PEF data [ME] |
| Beech root-sucker thicket | thicket = ≥ 1 stem/m² (≥ 10,000 /ha) of beech ≥ 1.4 m tall; Maine mature hardwoods average 350–470 beech saplings/ha (on ~50 % of plots) | — | Cale et al. 2013 [NE]; FIA [ME-E] |
| Lakeshore shrub band | ~1 m-tall sweetgale/leatherleaf/meadowsweet with **> 80 % shrub cover**; alder 1–3 m tall | width: **not found in any source**. Estimate 1–5 m on exposed mineral shores, 5–50 m in sheltered peaty coves | MNAP; VT F&W; earlier project note [ME/NE] |

---

## 0. Method for the FIA-derived numbers

**Data.** USDA Forest Service Forest Inventory and Analysis DataMart, Maine CSV tables, downloaded 2026-10-23 — [FIA DataMart CSV](https://apps.fs.usda.gov/fia/datamart/CSV/). Tables used:
- `ME_PLOT`, `ME_COND`, `ME_TREE`, `ME_SEEDLING`;
- `ME_COND_DWM_CALC`, `ME_P2VEG_SUBP_STRUCTURE`;
- `REF_SPECIES`.

**Plot selection.**
- Latest measurement of each plot from 2021–2025: one full 5-year panel cycle, standard design.
- Kept only plots that are a single forested condition covering ≥ 99 % of the plot. This removes edges, roads and water.
- That leaves 2,095 plots statewide, 857 in Aroostook + Penobscot + Washington, and 105 within 40 km of Hot Brook.

**Stand class.**
- FIA stand age (`STDAGE`): young < 30 yr, mid 30–59 yr, mature ≥ 60 yr.
- FIA forest-type group (`FORTYPCD`), and separately the softwood share of BA in trees ≥ 10 cm (softwood ≥ 65 %, mixedwood 35–65 %, hardwood < 35 %).

**Per-hectare values.**
- Sums of `TPA_UNADJ` × 2.471.
- Trees ≥ 12.7 cm (5 in) are tallied on four 7.3 m-radius subplots (672 m²).
- Saplings 2.5–12.7 cm are tallied on four 2.1 m-radius microplots (54 m²).
- Seedlings are counted on the same microplots: < 2.5 cm dbh and at least 15 cm tall (conifers) or 30 cm tall (hardwoods).
- Snags: `STATUSCD` 2 and `STANDING_DEAD_CD` 1, ≥ 12.7 cm dbh.
- Canopy cover: `COND.LIVE_CANOPY_CVR_PCT`.

**Statistics.**
- These are plot-level medians, IQRs and means; they are not FIA's stratified population estimates.
- Because the plots are an equal-probability grid, they describe a typical stand. Statewide totals should still come from FIA's own estimates.

**Crowns and heights.**
- Live trees with intact tops (`ACTUALHT` = `HT`), statewide 2021–25 plots.
- `CR` is FIA's *compacted* crown ratio.
- `UNCRCD` is the *uncompacted* crown ratio: the share of total height that carries live foliage, gaps included. This is the "fraction of height with live branches" the renderer wants.

**Where the work lives.** Scripts and intermediate outputs were kept in the session scratchpad only, not the repo. The paragraphs above are enough to redo them.

---

## 1. Stem density by layer, basal area and canopy cover

### Takeaway
A mature Acadian mixedwood near Hot Brook has the following per hectare:
- about 700–800 canopy-sized stems (≥ 10 cm dbh);
- about 1,800–2,400 saplings 2.5–10 cm dbh;
- about 8,000–10,000 counted seedlings;
- 23–27 m²/ha BA in stems ≥ 10 cm, about 30 m²/ha with saplings;
- a 90 % closed canopy.

Mid-successional stands (30–59 yr) have more and smaller stems: ~800–1,000 /ha ≥ 10 cm and 2,600–3,500 saplings, at lower BA (18–21 m²/ha).

Unmanaged reserves and old growth carry more BA (28–32 m²/ha) and many more big and dead trees.

Balsam fir dominates the sapling and seedling layers in every type except hardwood. In hardwoods, beech (root suckers), red maple, sugar maple and striped maple take over.

### 1.1 FIA plot summaries (my analysis, §0)

**Eastern Maine [ME-E], per hectare: median (IQR).**

| Stand class | plots | trees ≥ 10 cm | saplings 2.5–10 cm | seedlings | BA ≥ 10 cm m²/ha | BA all ≥ 2.5 cm | canopy cover % | snags ≥ 12.7 cm |
|---|---|---|---|---|---|---|---|---|
| Softwood, mature | 204 | 780 (590–1,120) | 1,850 (930–3,330) | 8,710 (4,630–16,490) | 27 (19–33) | 33 (25–40) | 90 (88–92) | 74 (30–119) |
| Mixedwood, mature | 95 | 710 (480–930) | 1,850 (930–2,960) | 8,150 (4,630–13,890) | 23 (17–29) | 28 (24–34) | 90 (89–92) | 45 (15–89) |
| Hardwood, mature | 122 | 560 (370–850) | 1,480 (740–2,220) | 10,000 (4,450–18,900) | 22 (15–26) | 25 (19–29) | 91 (90–92) | 30 (15–59) |
| Aspen–birch type, mature | 28 | 850 (610–1,080) | 1,580 (930–2,960) | 5,280 (3,150–9,260) | 25 (20–30) | — | 90 | 89 (45–119) |
| Softwood, mid | 184 | 1,020 (650–1,370) | 2,780 (1,480–4,820) | 5,930 (2,220–12,600) | 21 (14–30) | — | 91 | 30 (15–45) |
| Mixedwood, mid | 85 | 820 (600–1,170) | 2,590 (1,480–3,890) | 9,450 (4,080–13,520) | 18 (13–23) | — | 90 | 30 (15–45) |
| Hardwood, mid | 94 | 640 (370–880) | 1,850 (1,110–3,330) | 13,990 (6,300–22,600) | 14 (9–18) | — | 90 | 15 (0–30) |
| Aspen–birch type, mid | 48 | 850 (650–1,200) | 2,130 (1,480–3,890) | 8,060 (4,450–12,410) | 18 (14–23) | — | 90 | 30 (15–45) |

**Statewide by FIA forest-type group, mature [ME].**
- **Spruce–fir** (n = 324): trees ≥ 10 cm 830 /ha (590–1,100); saplings 1,850; seedlings 8,800; BA 27 m²/ha (18–35); snags 89 /ha.
- **Maple–beech–birch** (n = 581): 580 /ha (420–810); saplings 1,300; seedlings 9,080; BA 23 (17–29); snags 45 /ha.
- **Aspen–birch** (n = 64): 840 /ha; saplings 1,390; BA 26; snags 89 /ha.
- **White pine–hemlock** (n = 109): 580 /ha; saplings 1,110; BA 30 m²/ha.

**Around Hot Brook (105 plots within 40 km) [HB40].**
- Median stand age 55 yr (IQR 41–80). This is a working forest: young and mid-aged stands dominate.
- By FIA type group: maple–beech–birch 48 %, spruce–fir 34 %, aspen–birch 11 %.
- By BA share: softwood 41 %, mixedwood 31 %, hardwood 27 %.
- Trees ≥ 10 cm 800 /ha (570–1,170); saplings 2,400 (1,300–3,700); seedlings 8,000 (4,800–15,700); BA 20 m²/ha (14–26); canopy cover 91 %; snags 30 /ha (mean 50).
- Mature stands only (n = 47): 750 trees/ha, BA 22 m²/ha (16–30), snags 45 /ha.

**Vertical structure (stems ≥ 2.5 cm dbh per ha by total height), mature [ME-E].** Useful when placing trees by height. Stems shorter than 2.5 cm dbh but over 1.4 m tall are not in this table (see seedlings).

| Stand class | 2–5 m | 5–10 m | 10–15 m | 15–20 m | 20–25 m | > 25 m |
|---|---|---|---|---|---|---|
| Softwood | 1,290 | 1,210 | 570 | 180 | 36 | 3 |
| Mixedwood | 890 | 1,220 | 630 | 200 | 43 | 4 |
| Hardwood | 420 | 1,080 | 500 | 200 | 54 | 4 |
| Aspen–birch type | 850 | 1,230 | 710 | 210 | 71 | 5 |
| Mixedwood, mid-aged | 930 | 1,900 | 900 | 180 | 8 | 1 |

**By dbh class, mature mixedwood [ME-E], per ha.**

| dbh class | 2.5–10 cm | 10–20 cm | 20–30 cm | 30–40 cm | 40–50 cm | ≥ 50 cm |
|---|---|---|---|---|---|---|
| stems/ha | 2,240 | 540 | 150 | 51 | 14 | 6 |

**Who is in the canopy (stems ≥ 10 m tall, mature) [ME-E].**
- **Mixedwood** (880 /ha): red maple 31 %, balsam fir 15 %, yellow birch 12 %, paper birch 8 %, red spruce 5 %, hemlock 4 %, beech 3 %, cedar 3 %, the two aspens 6 %.
- **Softwood** (790 /ha): balsam fir 23 %, northern white-cedar 17 %, red maple 15 %, red spruce 9 %, hemlock 7 %, black spruce 7 %, white pine 4 %.
- **Hardwood** (760 /ha): red maple 22 %, sugar maple 18 %, beech 17 %, yellow birch 11 %.

The 2–10 m subcanopy is balsam fir: 38–53 % of stems in soft- and mixedwoods. In hardwoods it is beech: 21–30 %.

**Saplings (2.5–10 cm), mean per ha, mature [ME-E].**
- **Softwood:** balsam fir 1,060; cedar 300; red maple 235; red spruce 215; hemlock 210; black spruce 100.
- **Mixedwood:** balsam fir 780; red maple 390; hemlock 160; beech 150; yellow birch 140; red spruce 120; striped maple 57.
- **Hardwood:** beech 470; red maple 220; balsam fir 200; sugar maple 180; striped maple 120; yellow birch 84; hophornbeam 61.

**Seedlings, mean per ha, mature [ME-E].** FIA seedlings are < 2.5 cm dbh, conifers ≥ 15 cm tall and hardwoods ≥ 30 cm tall.
- **Softwood:** cedar 3,220; balsam fir 3,140; black spruce 960; hemlock 910; red spruce 850; red maple 750; mountain maple 290.
- **Mixedwood:** balsam fir 3,630; red maple 980; sugar maple 780; hemlock 710; red spruce 620; mountain maple 590; striped maple 470; yellow birch 400; beech 370.
- **Hardwood:** sugar maple 3,800; beech 2,150; balsam fir 1,640; striped maple 1,320; yellow birch 1,010; mountain maple 980; red maple 970.

**How often each species is present (share of plots), mature [ME-E].**
- Balsam fir seedlings: 91 % (softwood) and 96 % (mixedwood) of plots; balsam fir saplings: 67–78 %.
- Red spruce seedlings: 48–60 %; red spruce saplings: 29–35 %.
- In hardwoods:
  - beech saplings on 55 % of plots and seedlings on 71 %;
  - striped maple saplings on 33 % and seedlings on 66 %;
  - mountain maple seedlings on 38 %;
  - red maple saplings on 33 % and seedlings on 47 %.

### 1.2 Published Maine figures
- **Maine Forests 2013** — McCaskill, Albright, Barnett, Butler, Crocker et al. (USDA FS), Resource Bulletin NRS-103, 2016 — [rb_nrs103.pdf](https://www.fs.usda.gov/nrs/pubs/rb/rb_nrs103.pdf) [ME]
  - Totals on 17.6 million acres of forest:
    - about 24.5 billion live trees ≥ 2.5 cm (1 in) dbh, ≈ 3,440 /ha (my division);
    - about 3.2 billion trees ≥ 12.7 cm (5 in), ≈ 450 /ha.
  - Seedlings:
    - 192 billion seedlings, "just over 10,000 seedlings per acre" (≈ 27,000 /ha);
    - almost half are < 1 ft tall, 41 % are 1.0–4.9 ft and **12 % are ≥ 5 ft (1.5 m)**;
    - balsam fir, red maple and sugar maple are over half of the seedling pool;
    - striped maple, mountain maple, pin cherry and chokecherry are among the top seedling counts.
  - Saplings: balsam fir, red maple and red spruce make up 60.2 % of saplings (12.8 billion). Red spruce, paper birch and beech are in the top-5 sapling pool but not in the top-5 seedlings.
  - Seedling abundance is "somewhat uniform across Maine", with no geographic pattern.
- **Ecological Reserves in Maine: Initial Results of Long-Term Monitoring** — Kuehne, Puhlick & Weiskittel (UMaine / TNC), General Technical Report, 2018 — [FEMC archive copy](https://www.uvm.edu/femc/attachments/project/1383/1383-Initial_Long-Term_Monitoring_Results_.pdf) (the [maine.gov copy](https://www.maine.gov/dacf/mnap/reservesys/Maine%20ERM%20GTR%202018_Final.pdf) returned 403) [ME]
  - Live BA, trees ≥ 12.7 cm, means:
    - reserves 124 ft²/ac (28.5 m²/ha);
    - non-harvested reserve plots 122 ft²/ac (28.0 m²/ha);
    - managed FIA plots 76 ft²/ac (17.4 m²/ha).
  - Reserve plots by forest type:
    - spruce–fir 140 ft²/ac (32.1 m²/ha; IQR 95–178 ft²/ac), mean canopy-tree age 95 yr;
    - maple–beech–birch 109 ft²/ac (25.0 m²/ha), age 86 yr;
    - aspen–white birch 80 ft²/ac (18.4 m²/ha), age 68 yr;
    - white–red pine 183 ft²/ac (42 m²/ha).
  - Very large live trees (≥ 51 cm): 2.69 /ac (6.6 /ha) in reserves vs 1.43 /ac (3.5 /ha) managed; 4.48 /ac (11 /ha) in the Big Reed old growth.
  - FIA managed plots, all trees ≥ 2.5 cm dbh (Appendix D Table 4):
    - spruce–fir: mean 1,821, median 1,201 trees/ac (4,500 and 2,970 /ha); BA mean 123 ft²/ac (28 m²/ha);
    - maple–beech–birch: mean 1,095 trees/ac (2,710 /ha); BA 94 ft²/ac (21.6 m²/ha);
    - aspen–white birch: mean 1,481 trees/ac (3,660 /ha).
- **Penobscot Experimental Forest (PEF), Bradley ME: average pre-treatment stand, 1950s** — Kenefic, "Long-term U.S. Forest Service research at the PEF", Silviculture Institute field tour handout, 2017 — [UNH Extension PDF](https://extension.unh.edu/resources/files/Resource006766_Rep9754.pdf) [ME]
  - Overstory (≥ 11.4 cm dbh): 343 trees/ac (848 /ha), BA 26.2 m²/ha.
  - Saplings (< 11.4 cm): 1,004 /ac (2,480 /ha), BA 5.9 m²/ha.
  - Regeneration in the 1960s, stems/ha and plot stocking:
    - balsam fir 5,710 (56 % stocking);
    - hemlock 3,830 (36 %);
    - red maple 2,750 (29 %);
    - spruce 790 (19 %);
    - cedar 190 (5 %);
    - paper birch ≈ 4,200 (28 %) — the column alignment in the PDF text is ambiguous for this value.
  - Four treated units measured in 2001–2016 held 1,370–6,850 balsam fir/ha of regeneration.
- **Brissette 1996**, "Effects of intensity and frequency of harvesting on abundance, stocking and composition of natural regeneration in the Acadian Forest of eastern North America", *Silva Fennica* 30(2–3): 301–314 — [doi:10.14214/sf.a9242](https://doi.org/10.14214/sf.a9242) (abstract only; the PDF is an image scan) [ME, PEF]
  - Partial harvests left 15–24 m²/ha residual BA under hemlock–spruce–fir.
  - Regeneration (> 15 cm tall, < 1.3 cm dbh) ran from **over 25,000 to nearly 80,000 stems/ha** whatever the treatment.
  - Angiosperms were 10–52 % of it at ~5 yr and 11–33 % at 10 yr.
- **Dibble, Brissette & Hunter 1999**, "Putting community data to work: some understory plants indicate red spruce regeneration habitat", *Forest Ecology and Management* 114: 275–291 — [Treesearch PDF](https://research.fs.usda.gov/download/treesearch/39988.pdf) [ME]
  - 50 plots of 0.0625 ha in red-spruce stands at 8 Maine sites, including Third Machias Lake (Washington Co.) and Round Pond (Aroostook).
  - Seedlings 0.1–0.5 m tall:
    - red spruce mean 1.02 /m² (≈ 10,200 /ha; SD 2.36; max 16 /m²);
    - balsam fir 1.19 /m² (≈ 11,900 /ha; max 7.7 /m²).
  - Small red spruce were most abundant in mature stands partially cut more than 80 years ago, and few were found in clearcuts.
- **Howland Forest** (Penobscot Co., mature spruce–hemlock): about 30 m²/ha BA and ~76 Mg C/ha live biomass before a shelterwood — Scott et al. 2004, *Environmental Management* 33 (Suppl. 1) — [doi:10.1007/s00267-003-9114-5](https://dx.doi.org/10.1007/s00267-003-9114-5) (search summary) [ME]
- **Beech root suckers (beech-bark-disease aftermath)** — Cale, McNulty, Teale & Castello 2013, "The impact of beech thickets on biodiversity", *Biological Invasions* 15: 699–706 — [FEMC PDF](https://www.uvm.edu/femc/attachments/project/1076/cale_et_al_2012_beechthickets.pdf) [NE, Adirondacks]
  - A "thicket" was defined as ≥ 1 beech stem/m² (≥ 10,000 /ha) among stems < 5 cm dbh and ≥ 1.4 m tall; "non-thicket" was ≤ 0.5 /m².
  - Measured means: 0.55 /m² (5,500 /ha) in thicket plots vs 0.12 /m² (1,200 /ha) in non-thicket plots.
  - No Maine thicket densities were found. FIA [ME-E] mature hardwoods average 470 beech saplings and 2,150 beech seedlings per ha.
- **Canopy cover**
  - FIA: live canopy cover median 90 % (IQR 86–92 %) in mid and mature stands of every type. Young stands (< 30 yr) are lower: median 79–85 %, IQR down to 50–68 % in hardwoods [ME].
  - MNAP Lower-elevation Spruce–Fir Forest: red spruce usually > 60 % cover; canopy closed (> 75 %) — [MNAP PDF](https://www1.maine.gov/DACF/mnap/features/communities/lower_elevation_spruce_fir_forest.pdf) *(search summary)* [ME].
  - MNAP Spruce–Northern Hardwoods: conifers and hardwoods each > 25 % of canopy cover — [MNAP](https://www.maine.gov/dacf/mnap/features/communities/sprucenorthernhardwood.htm) *(search summary)* [ME].

**Caveat.** FIA and the research plots count different things.
- FIA counts seedlings ≥ 15 cm (conifers) or ≥ 30 cm (hardwoods) on 54 m² per plot, across all stands.
- Dibble's plots were chosen in spruce stands.

For a render that also wants very small conifer germinants (< 15 cm), FIA understates the count. Treat 10,000–25,000 /ha of fir + spruce below 0.5 m as plausible under mature conifer.

---

## 2. Crown dimensions

### Takeaway
Use the Maine-fitted crown-width equations of Russell & Weiskittel together with FIA's own Maine heights:
- In closed stands, canopy conifers have crowns about 0.27 × their height (fir, spruce).
- Pine and cedar are about 0.3 × height; hemlock about 0.4.
- Canopy hardwoods are 0.3–0.45 × height, widening with size; beech and yellow birch are the widest.

Live crowns (uncompacted) cover about half the stem in fir and spruce, about 60 % in cedar, hemlock and beech, and only 38–43 % in aspens, paper birch and white pine.

### 2.1 Crown-width equations fitted on Maine trees
**Source.** Russell & Weiskittel 2012, "Estimating tree crown widths for the primary Acadian species in Maine". In: *Proceedings 2010 Joint Meeting of the FIA Symposium and Southern Mensurationists*, e-GTR SRS-157 — [Treesearch PDF](https://research.fs.usda.gov/download/treesearch/40971.pdf) [ME]. The journal version is Russell & Weiskittel 2011, *Northern Journal of Applied Forestry* 28(2): 84–91.

**Data.** Penobscot Experimental Forest, Cooperative Forestry Research Unit thinning plots and Forest Health Monitoring plots across Maine. Crown width is the quadratic mean of the widest axis and its perpendicular. dbh is in cm and widths are in m.

**Equations.**
- Maximum (open-grown, 99th percentile) crown width: `mcw = a1 · D^a2`.
- Largest (forest-grown) crown width: `lcw = mcw / (b1 · D^b2)`. Where b1 was not significant, b1 = 1.

| Species | a1 | a2 | b1 | b2 | data dbh range (cm) | lcw MAE (m) |
|---|---|---|---|---|---|---|
| Balsam fir | 1.37 | 0.572 | 1.49 | 0.105 | 1.1–40 | 0.58 |
| Red spruce | 1.80 | 0.461 | 4.33 | −0.264 | 1.2–57 | 0.77 |
| Eastern white pine | 1.24 | 0.585 | 1 | 0.147 | 1.4–92 | 1.18 |
| Northern white-cedar | 1.63 | 0.436 | 2.19 | −0.080 | 1.6–60 | 0.77 |
| Eastern hemlock | 2.44 | 0.408 | 1.90 | −0.057 | 1.3–57 | 1.01 |
| Paper birch | 1.48 | 0.623 | 2.10 | −0.035 | 1.3–37 | 1.00 |
| Quaking aspen (use for bigtooth aspen too: *not fitted for it*) | 1.31 | 0.586 | 2.65 | −0.157 | 1.3–45 | 0.87 |
| Red maple | 2.17 | 0.491 | 2.63 | −0.132 | 1.3–55 | 1.05 |
| American beech | 2.93 | 0.434 | 1 | 0.194 | **11.9**–43 | 1.52 |
| Sugar maple | 3.31 | 0.356 | 1 | 0.161 | **12.7**–74 | 1.44 |
| Yellow birch | 4.04 | 0.308 | 4.23 | −0.294 | 1.5–54 | 1.33 |

**Caveats.**
- Beech and sugar maple were fitted only on trees ≥ 12 cm. The equations overpredict small stems: they give a 4 m crown at 4 cm dbh. Below 12 cm, use about 0.5 × height instead (*my judgement*).
- The authors report percent canopy cover from lcw correlating with plot BA at r = 0.70 on the PEF plots.

### 2.2 Height, forest-grown crown width and live crown in Maine (my analysis, §0)
Each cell gives **median height (m) / forest-grown crown width lcw (m)**, at the dbh-class midpoint. Heights are the median of Maine FIA trees with intact tops, 2021–25. Widths are from the equations above.

| Species | 6 cm | 12.5 cm | 22.5 cm | 35 cm | 45 cm | 55 cm |
|---|---|---|---|---|---|---|
| Balsam fir | 5.8 / 2.2 | 11.3 / 3.0 | 14.6 / 3.9 | 17.4 / 4.8 | — | — |
| Red spruce | 5.5 / 1.6 | 10.4 / 2.6 | 14.3 / 4.0 | 18.9 / 5.5 | 20.7 / 6.6 | 23.5 / 7.6 |
| Eastern white pine | 6.1 / 2.8 | 11.0 / 3.7 | 15.5 / 4.8 | 20.4 / 5.9 | 23.2 / 6.6 | 27.1 / 7.2 |
| Northern white-cedar | 5.2 / 1.9 | 8.5 / 2.7 | 11.6 / 3.7 | 14.9 / 4.7 | 16.2 / 5.3 | 18.3 / 5.9 |
| Eastern hemlock | 5.8 / 3.0 | 9.8 / 4.2 | 13.4 / 5.5 | 17.4 / 6.7 | 20.1 / 7.5 | 22.6 / 8.3 |
| Paper birch | 8.5 / 2.4 | 13.1 / 3.7 | 16.5 / 5.5 | 19.5 / 7.3 | 21.3 / 8.6 | — |
| Quaking aspen | 9.1 / 1.9 | 14.6 / 3.2 | 18.6 / 5.0 | 21.6 / 6.9 | 22.9 / 8.4 | — |
| Bigtooth aspen (QA eq.) | 8.2 / 1.9 | 15.2 / 3.2 | 19.2 / 5.0 | 22.4 / 6.9 | 24.4 / 8.4 | 27.4 / 9.7 |
| Red maple | 8.5 / 2.6 | 13.4 / 4.0 | 16.8 / 5.7 | 19.8 / 7.6 | 21.6 / 8.8 | 22.6 / 10.0 |
| American beech | 7.3 / (≈3.5) | 11.0 / 5.4 | 14.0 / 6.2 | 17.4 / 6.9 | 20.1 / 7.3 | — |

**Height spread and sample size.** The 10th–90th percentile spread of height in a class is about ±2–4 m. For example, balsam fir 10–15 cm runs 9–14 m. Sample sizes are 100–7,000 trees per cell.

**Open-grown crowns.** Lakeshore edges and openings are wider: use mcw, which is 1.6–2× lcw. For example, a 35 cm white pine has mcw 9.9 m vs lcw 5.9 m, and a 22.5 cm red maple has 10.0 vs 5.7 m.

**Live crown ratio (Maine FIA 2021–25, trees ≥ 10 cm, all crown classes).** UNCR (uncompacted) is the share of height with live foliage. CR (compacted) is FIA's main field. n is the number of uncompacted readings.

| Species | UNCR (n) | CR | CR dominant / codominant / intermediate / overtopped | CR saplings < 10 cm |
|---|---|---|---|---|
| Balsam fir | 0.50 (2,092) | 0.41 | 0.47 / 0.41 / 0.40 / 0.41 | 0.34 |
| Red spruce | 0.50 (1,403) | 0.41 | 0.44 / 0.41 / 0.40 / 0.40 | 0.42 |
| Eastern white pine | 0.43 (405) | 0.35 | 0.42 / 0.35 / 0.34 / 0.31 | 0.45 |
| Northern white-cedar | 0.59 (700) | 0.43 | 0.48 / 0.45 / 0.41 / 0.37 | 0.48 |
| Eastern hemlock | 0.63 (387) | 0.50 | 0.54 / 0.50 / 0.49 / 0.51 | 0.45 |
| Paper birch | 0.42 (461) | 0.34 | 0.34 / 0.35 / 0.30 / 0.25 | 0.31 |
| Quaking aspen | 0.38 (118) | 0.33 | 0.34 / 0.34 / 0.27 / 0.26 | 0.35 |
| Bigtooth aspen | 0.39 (93) | 0.33 | 0.32 / 0.33 / 0.26 / 0.21 | 0.35 |
| Red maple | 0.47 (1,138) | 0.38 | 0.36 / 0.39 / 0.36 / 0.35 | 0.38 |
| American beech | 0.58 (414) | 0.47 | — / 0.47 / 0.47 / 0.45 | 0.49 |
| Sugar maple | 0.53 (398) | 0.42 | 0.46 / 0.43 / 0.40 / 0.40 | 0.40 |
| Yellow birch | 0.54 (467) | 0.45 | 0.44 / 0.45 / 0.43 / 0.43 | 0.41 |
| Striped maple | 0.51 (21) | 0.40 | — | 0.40 |
| Mountain maple | — | — | — | 0.38 |

**Reading the table.**
- Crown base height ≈ (1 − UNCR) × height. For example:
  - a 14.6 m balsam fir carries live branches from about 7.3 m up;
  - a 16.5 m paper birch from about 9.5 m;
  - a 14.9 m cedar from about 6 m.
- Shade-tolerant conifers keep a ~0.4 compacted crown ratio even when overtopped. Intolerant aspen and birch fall to 0.21–0.26 when overtopped, so suppressed intolerants have short, high crowns.

**Field check on cedar.** Hofmeyer, Seymour & Kenefic 2010, "Production ecology of *Thuja occidentalis*", *Canadian Journal of Forest Research* 40: 1155–1164 — [Treesearch PDF](https://research.fs.usda.gov/download/treesearch/35255.pdf) [ME, northern Maine]. In 25 destructively sampled cedars (crown class not checked), live crown length / height was:

| Site class | dbh (cm) | height (m) | live crown (m) | ratio |
|---|---|---|---|---|
| Good | 34 | 16.7 | 11.3 | 0.68 |
| Poor | 30 | 13.4 | 8.3 | 0.62 |
| Wet | 28 | 15.5 | 10.6 | 0.68 |

These sit a little above the FIA all-class uncompacted mean of 0.59.

**FEIS on cedar** — [FEIS *Thuja occidentalis*](https://www.fs.usda.gov/database/feis/plants/tree/thuocc/all.html) [other]:
- usually 12–15 m tall and 30–60 cm dbh;
- a "narrow, almost columnar crown";
- open-grown trees keep branches to the ground.

**Speckled alder** (no crown equation exists) — [FEIS *Alnus incana*](https://www.fs.usda.gov/database/feis/plants/tree/alninc/all.html) [NE/other]:
- up to 9 m tall, but typically 1.5–4 m;
- stems up to 12 cm diameter;
- stems live 7–31 yr (mean 14), while clones may reach ~100 yr;
- thicket density 7,850 stems/ha on New York stream banks, up to 40,000–74,000 /ha in Ontario cutovers;
- crown closure 40–80 % after clearcutting.

No clump-width figure was found. A clump 1.5–4 m across is my estimate only.

**Height–diameter curves not used.** The FVS Northeast-variant height curves are fitted on Southern-variant data. Rijal et al. 2012 found FVS-NE biased about 1–4 m low for all 15 Acadian species (e.g. −1.4 m fir, −1.6 spruce, −2.9 pine, −3.0 cedar, −3.1 paper birch) — [FVS NE overview](https://www.fs.usda.gov/fmsc/ftp/fvs/docs/overviews/FVSne_Overview.pdf); [Rijal & Weiskittel 2010 slides](https://www.umoncton.ca/umce-foresterie/sites/umce-foresterie.prod.umoncton.ca/files/wf/ERijal.pdf). The FIA medians above replace both.

---

## 3. Shrub, herb and moss layers

### Takeaway
**Under closed conifer** (spruce–fir–hemlock, ~7–9 % canopy openness):
- the ground is mostly needle litter and moss;
- herbs are sparse, under 10 % cover (2 % in the uncut PEF reference stands);
- typical herbs are Canada mayflower, starflower, bunchberry, wild sarsaparilla, bluebead lily, goldthread, wood-sorrel, creeping snowberry, twinflower and wood ferns;
- mosses cover 14–51 %: broom moss (*Dicranum*), Schreber's moss (*Pleurozium*), stair-step moss and the liverwort *Bazzania*.

**Spruce–northern hardwood** stands have a 20–40 % sapling/shrub layer (striped maple, hobblebush, tree saplings) and > 15 % herbs.

**Hardwood** stands have fewer shrubs proper. Their understory is tree regeneration (beech suckers, sugar maple, striped maple) plus ferns and forbs.

**Aspen–birch** has the most forb and fern cover (bracken, lowbush blueberry, beaked hazel, shadbush, raspberry).

**Statewide FIA averages** (all stands): shrubs ~19 %, ferns ~15 %, forbs ~22 %, graminoids ~9 % (means; medians lower).

### 3.1 Cover by growth form and height layer: Maine FIA P2 vegetation (my analysis, §0)
**Data.** Latest visit, 2012–2025, per plot. Mean % cover with the median in brackets, averaged over each plot's four 168 m² subplots.

**Growth forms.** FIA's "shrubs" are woody plants, including subshrubs and woody vines (e.g. blueberries, wintergreen). I did not check how FIA classes bunchberry and twinflower. "Tally trees" are tree species of any size. Mosses are not recorded.

**Mature stands (≥ 60 yr), statewide, n = 223.**

| Growth form | 0–0.6 m | 0.6–1.8 m | 1.8–4.9 m | > 4.9 m | total (aerial) |
|---|---|---|---|---|---|
| Tree species (regeneration + canopy) | 25 [21] | 27 [24] | 44 [44] | 67 [72] | 80 [85] |
| Shrubs | 17 [11] | 7 [2] | 2 [0] | 0 | 19 [12] |
| Ferns | 14 [8] | 5 [2] | 0 | 0 | 15 [9] |
| Forbs | 20 [17] | 6 [2] | 0 | 0 | 22 [17] |
| Graminoids | 9 [3] | 2 [0] | 0 | 0 | 9 [3] |

**Total cover by forest-type group (all ages) [ME].** Read the canopy-type contrast here.

| Group | n | shrubs | ferns | forbs | graminoids | tree regen 0–1.8 m (0–0.6 / 0.6–1.8) |
|---|---|---|---|---|---|---|
| Spruce–fir | 136 | 20 [13] | 9 [4] | 17 [12] | 10 [3] | 20 / 24 |
| Maple–beech–birch | 158 | 17 [12] | 15 [10] | 22 [19] | 7 [3] | 28 / 30 |
| Aspen–birch | 37 | 19 [14] | 18 [10] | 28 [20] | 11 [5] | 24 / 26 |
| White pine–hemlock | 30 | 17 [9] | 12 [8] | 19 [17] | 7 [2] | 22 / 27 |

**Eastern Maine, all stands (n = 164):** shrubs 21 [15], ferns 10 [5], forbs 18 [12], graminoids 8 [3]. In young stands (< 30 yr) shrubs rise to 23–29 % (small samples: n = 22 statewide, 12 in the east).

### 3.2 Species-level cover in Maine stands: Penobscot Experimental Forest
**Data.** Olson, Kenefic, Zukswert, Langley, Dibble & Muñoz Delgado 2019, *Understory vegetation and site condition data from the "Nonnative Invasive Plants" study at the PEF*. USDA FS Research Data Archive — [doi:10.2737/RDS-2019-0016](https://doi.org/10.2737/RDS-2019-0016) [ME, Penobscot Co.].
- 654 milacre plots (4.05 m² each) in 24 stands, 2006–07.
- Cover was recorded in classes. I averaged the class midpoints: < 5 % classes at 0.5–2.5 %, then 15, 38, 63 and 88 %.
- Canopy openness was measured with a fisheye photo 0.6 m above the floor.

**Unharvested reference stands** (mature mixed conifer, n = 40):
- Canopy openness: **8.2 %** mean (median 7.4).
- Ground: herb cover 2 %, woody cover 2 %, bryophytes 13.5 % (on every plot), **downed wood > 2.5 cm covering 15 % of the ground**, softwood litter 72 %, hardwood litter 51 % (the classes overlap).
- Herbs, mean cover (frequency): wild sarsaparilla 3.3 % (35 %); Canada mayflower 1.0 % (55 %); starflower 0.1 % (18 %); bunchberry 0.4 % (5 %); goldthread (8 %); winterberry (12 %).
- Bryophytes: *Bazzania* 2.9 % (68 %); *Dicranum* 2.4 % (72 %); *Pleurozium* 0.9 %; *Cladonia* lichens on 58 % of plots.
- Tree seedlings < 0.6 m: balsam fir 1.4 /m² (85 % of plots), red maple 2.1 /m², hemlock 1.1 /m².

**Single-tree selection stands** (5–20 yr cycles; closed but repeatedly gapped; n = 210):
- Openness 8.5 % (median 6.6).
- Herbs 20 %, woody 16 %, **bryophytes 51 %**: *Pleurozium* 15 %, *Dicranum* 14 %, *Bazzania* 9 %, *Sphagnum* 4 %.
- Canada mayflower 4.2 % (86 %, 5.5 shoots/m²); bracken 4.3 % (25 %); bunchberry 3.7 % (30 %); wild sarsaparilla 3.0 % (39 %); starflower 1.9 % (64 %).
- Balsam fir seedlings 2.6 /m²; hemlock 1.4 /m²; red spruce 0.7 /m².
- Downed wood covers 11 % of the ground.

**Heavy cuts** (diameter-limit / commercial clearcut, regrown; n = 210):
- Openness 12 %.
- Herbs 41 %, bryophytes 41 %.
- Bunchberry 9.0 %; Canada mayflower 7.8 % (92 %, 8 shoots/m²); wild sarsaparilla 7.1 %; bracken 6.7 %; starflower 3.0 % (82 %).
- Downed wood covers 18 % of the ground.

**Old field turned hardwood** (n = 64):
- Herbs 52 %.
- Dwarf red blackberry 12 %, sensitive fern 9 %, spinulose wood fern 3 %, raspberry 3 %.
- Invasive glossy buckthorn on 73 % of plots — the old-field legacy.

### 3.3 Community descriptions and species lists
- **MNAP Lower-elevation Spruce–Fir Forest (Spruce–Fir–Broom-moss Forest)** [ME] — [MNAP PDF](https://www1.maine.gov/DACF/mnap/features/communities/lower_elevation_spruce_fir_forest.pdf) *(search summary)*
  - Herb layer sparse, "well under 10 %": scattered Canada mayflower, starflower, bunchberry.
  - Dwarf shrubs nearly absent except patchy lowbush blueberry.
  - Bare conifer litter covers most of the ground. Bryophytes are patchy to full cover, "especially in Downeast Maine"; broom mosses are the most frequent.
- **MNAP Spruce–Northern Hardwoods Forest** [ME] — [MNAP](https://www.maine.gov/dacf/mnap/features/communities/sprucenorthernhardwood.htm) *(search summary)*
  - Sapling/shrub layer "fairly well developed (20–40 % cover)", with striped maple and canopy saplings. Hobblebush is listed as diagnostic for this community.
  - Herb layer usually > 15 %, split between forbs, ferns and tree seedlings; dwarf shrubs virtually absent.
  - Bryoids patchy, with three-lobed *Bazzania* frequent.
  - Many past-cut sites now look like Beech–Birch–Maple, with spruce and fir mostly in the understory.
- **MNAP Beech–Birch–Maple Forest** [ME] — [MNAP](https://www.maine.gov/dacf/mnap/features/communities/beechbirchmap.htm) *(search summary)*
  - Herbs sparse, usually < 15 %, and often dominated by tree seedlings.
  - Shrub layer variable and dominated by tree regeneration; striped maple is a common subcanopy tree.
- **MNAP Early Successional (Aspen–Birch) Forest** [ME] — [MNAP PDF](https://www.maine.gov/DACF/mnap/features/communities/early_successional_forest.pdf) *(search summary)*
  - Canopy runs from open woodland to closed forest.
  - Shrubs usually < 50 % cover; shadbush and gray birch are the most consistent.
  - Lowbush blueberry and black huckleberry patches are common.
  - Bracken is the most characteristic herb, and herb cover rises as the canopy opens.
- **MNAP Spruce–Fir Wet Flat (Spruce–Fir–Cinnamon Fern)** [ME] — [MNAP](https://www.maine.gov/dacf/mnap/features/communities/sprucefirwetflat.htm) *(search summary)*
  - Cinnamon fern and three-seeded sedge are typical.
  - In northern Maine, herbs and shrubs are sparse over a Sphagnum floor.
- **Dibble et al. 1999** [ME], 50 red-spruce plots (link in §1)
  - Bryophyte ground cover averaged **38 %** (SD 26; range 0–90 %); it was similar in mature and partially cut stands and lower in clearcuts.
  - Species on ≥ 25 of 50 plots, most frequent first: Canada mayflower (42 plots), starflower, bunchberry, bluebead lily, lowbush/velvetleaf blueberry, wood ferns (*Dryopteris campyloptera / carthusiana / intermedia*), creeping snowberry, twinflower, goldthread, red raspberry.
  - Species tied to dense, spruce-rich stands: creeping snowberry, wood-sorrel, twinflower, painted trillium, starflower, and the liverwort *Bazzania trilobata*.
  - Bracken "often dominated" where present. Raspberry fills clearcuts in dense, continuous masses.
- **FIA tree-list shrubs (Maine 2021–25)** [ME-E]
  - Striped maple and mountain maple are tallied as trees, so they have densities:
    - striped maple saplings 120–190 /ha in mature hardwoods (on 33–38 % of plots), seedlings 1,300 /ha (on 64–66 %);
    - in mixedwood, striped maple saplings 57–65 /ha and seedlings 470–610 /ha;
    - mountain maple seedlings 290 (softwood) to 980 (hardwood) /ha, on 17–38 % of plots;
    - mountain maple rarely reaches 2.5 cm dbh in FIA plots (on 1–11 % of plots).
- **Beaked hazel** — [FEIS *Corylus cornuta*](https://www.fs.usda.gov/database/feis/plants/shrub/corcor/all.html) [other, mostly MN/ON/QC]
  - 4–6 m tall at maturity; clumps about 1.4 m across, up to 2.4 m at 38 yr.
  - Density: > 3,000 stems/acre (> 7,400 /ha) in mature understories and up to 60,000 /acre in seral stands. In a 20-yr Quebec fir–yellow birch clearcut, about 300 vs 25 stems/acre in mature forest.
  - Most prevalent where ≥ 30 % of full sun reaches the floor; light under hazel thickets is 2–7 %.
  - Cover is greater under aspen–birch and pine than under spruce–fir or maple. Quebec cover fell from 31 % at 26 yr after fire to 0.1 % at 143 yr.
- **Canada yew** — [FEIS *Taxus canadensis*](https://www.fs.usda.gov/database/feis/plants/shrub/taxcan/all.html) [other]
  - 0.3–0.9 m tall (occasionally ~1.8 m), with branches spreading to 2 m.
  - An old-growth, cool-moist indicator under spruce–fir, hemlock and northern hardwoods.
  - Heavily browsed by deer and moose, and eliminated by heavy harvest. No Maine densities were found.
- **Mountain maple** — [FEIS *Acer spicatum*](https://www.fs.usda.gov/database/feis/plants/shrub/acespi/all.html) [CA/other]
  - Usually up to 6 m in the north.
  - Scattered clumps under closed spruce–fir; after canopy removal it can "dominate the site within 5 to 10 years".
- **Not found with Maine numbers:** hobblebush cover, hay-scented fern cover, cinnamon/interrupted fern cover, Canada yew density. Nyland et al. 2006 (*NJAF* 23: 53–61) reviews beech, striped maple and hobblebush, but its text was not reachable.
  - Hobblebush is diagnostic of the 20–40 % shrub layer of spruce–northern hardwoods (MNAP), but its own cover is unknown.

**How light and canopy type change things.**
- **Conifer.** Openness ~7–9 % (PEF fisheye). Litter plus moss forms the floor; herbs < 10 % (MNAP, PEF). FIA forbs 17 %, ferns 9 %.
- **Hardwood.** More forbs (22 %) and ferns (15 %). Shrubs about the same (FIA). The understory is dominated by tree regeneration: beech suckers, sugar maple, striped maple.
- **After opening** (heavy cut, gap, budworm), the shrub and herb layers swell:
  - PEF herb cover rises from 2 % (reference) to 41 % (heavy cuts);
  - raspberry, bracken, beaked hazel and mountain maple take over;
  - young (< 30 yr) FIA stands carry 23–29 % shrubs.

---

## 4. Coarse woody debris and snags

### Takeaway
A typical mature Maine stand has the following on the ground and standing:
- **~600 logs/ha** (pieces ≥ 7.6 cm across and ≥ 0.9 m long);
- **~25–35 m³/ha** of coarse wood (median; means 38–48);
- downed wood covering 11–19 % of the ground;
- **45–90 snags/ha ≥ 12.7 cm**, most of them small fir.

Unharvested reserves carry about 50 m³/ha of CWD and about 100 snags/ha. Old growth (Big Reed) carries about 80 m³/ha and 12 large snags/ha (≥ 40 cm). A central-Maine mixedwood (Acadian Forest Ecosystem Research Program, AFERP) measured 109 m³/ha.

### Cited findings
**Downed-log counts and volume, Maine FIA (my analysis, §0).**
- **Logs per ha** come from FIA P3 down-woody-material transects in 2006–2010, forested conditions only. Pieces counted are ≥ 7.6 cm in diameter at the transect and ≥ 0.9 m long.
  - All forest: median 541 (IQR 294–960), mean 686 logs/ha; n = 205.
  - Mature stands: median 576 (294–940), mean 693.
  - Spruce–fir: all ages 688 (382–1,145); mature 660 (341–1,145), mean 840.
  - Maple–beech–birch, mature: 507 (202–960), mean 668.
  - Aspen–birch, mature: 873, mean 734 (n = 9).
  - Average piece ≈ 0.06 m³ (e.g. 16 cm × 3 m).
  - The 2012–25 Maine DWM records carry no piece lengths, so pieces per ha cannot be computed for those years.
- **CWD volume, m³/ha** (P2+ transects, latest visit 2012–2025, n = 371):
  - All forest: median 23 (IQR 10–43), mean 34.
  - Mature: 27 (14–46), mean 39.
  - Eastern Maine, mature: 28 (15–51), mean 46.
  - Spruce–fir, mature: 33 (20–51), mean 48.
  - Maple–beech–birch, mature: 25 (12–46), mean 38.
- **Snags ≥ 12.7 cm dbh, per ha, mature stands, 2021–25** [ME-E]:
  - softwood: median 74, mean 86;
  - mixedwood: 45, mean 64;
  - hardwood: 30, mean 43;
  - aspen–birch type: 89.
  - Spruce–fir group statewide, mature: median 89, mean 98.
  - Snags ≥ 25 cm: 9–20 /ha mean. Snags ≥ 40 cm: 1–3 /ha mean.

**Maine Forests 2013 (FIA, 2010 data)** — McCaskill et al. 2016 (link in §1) [ME]
- CWD volume:
  - 780 ft³/ac (≈ 55 m³/ha) on private land;
  - 762 ft³/ac (≈ 53 m³/ha) on federal land;
  - 569 ft³/ac (≈ 40 m³/ha) on state and local land;
  - Aroostook and Piscataquis counties: about 1,000 ft³/ac (≈ 70 m³/ha).
- Snags: 402 million standing dead trees ≥ 12.7 cm, **23 /ac (57 /ha)** statewide; 31 /ac (77 /ha) public, 22 /ac (55 /ha) private.
  - Over 85 % of snags are < 28 cm dbh and 45 % are 12.7–17.5 cm; only 2 % are > 43 cm.
  - Balsam fir alone is 117 million of them.
  - The middle decay class (only limb stubs present) is the most common, at 27 %.

**Ecological Reserves report** — Kuehne et al. 2018 (link in §1) [ME]

| Measure | Managed FIA plots | Reserves | Non-harvested reserves | Big Reed old growth (25 plots) |
|---|---|---|---|---|
| Standing dead ≥ 12.7 cm | 22 /ac (54 /ha) | 40 /ac (99 /ha) | 42 /ac (104 /ha) | — |
| Large snags ≥ 40 cm | 0.70 /ac (1.7 /ha) | 1.33 /ac (3.3 /ha) | — | **4.97 /ac (12.3 /ha)** |
| Downed CWD | 557 ft³/ac (39 m³/ha) | 644 ft³/ac (45 m³/ha) | 708 ft³/ac (49.5 m³/ha) | **1,166 ft³/ac (82 m³/ha)** |
| Large CWD (≥ 40 cm) | 26 ft³/ac (1.8 m³/ha) | 70 ft³/ac (4.9 m³/ha) | — | — |

- Reserve plots by forest type:
  - spruce–fir: 48 snags/ac (119 /ha) and 765 ft³/ac CWD (53.5 m³/ha; median 40);
  - maple–beech–birch: 28 /ac (69 /ha) and 662 ft³/ac (46 m³/ha);
  - aspen–birch: 43 /ac (106 /ha) and 330 ft³/ac (23 m³/ha).
- Spruce–fir has more snags. Maple–beech–birch has more large snags and large logs.

**Other sources.**
- **Fraver, Wagner & Day 2002**, "Dynamics of coarse woody debris following gap harvesting in the Acadian forest of central Maine", *Canadian Journal of Forest Research* 32: 2094–2105 — [AGRIS record](https://agris.fao.org/search/en/records/65e012460f3e94b9e5defb30) (abstract via search summary) [ME]
  - Pre-harvest CWD was **108.9 m³/ha** (23.2 Mg/ha) in AFERP mixedwood stands.
  - The wood held 18.5 m³ of water per ha.
- **Ground covered by downed wood > 2.5 cm** — PEF data (Olson et al. 2019, §3.2) [ME]
  - Reference stands 15 %, selection 11 %, heavy cuts 18 %, old field 19 % (class midpoints).
  - Use as the fraction of the forest floor occluded by logs and branches.

---

## 5. Lakeshore vegetation of small Maine lakes

### Takeaway
Between open water and the upland forest, small Maine lakes have a shrub border. It takes one of three forms:
1. **Exposed sand, gravel and cobble shores** (the commonest type on medium and large Maine lakes): a narrow, often broken fringe of sweetgale and other low shrubs, with speckled alder, gray birch, red maple, white pine and juniper on the ice-push berm.
2. **Sheltered peaty coves, inlets and outlets:** a ~1 m-tall, dense (> 80 % cover) sweetgale–leatherleaf–meadowsweet fen, often a floating mat, grading inland into speckled-alder thicket (1–3 m) and then a cedar, spruce or red-maple swamp edge.
3. **Rocky or steep shores:** forest comes almost to the water.

Northern white-cedar is typical along lake and stream edges because it survives ice push and escapes fire there. Most of its area in the Northeast is on Maine lowlands.

**No source gives a measured band width.** My estimate, flagged as such:
- **1–5 m** of shrubs on exposed mineral shores, set by the summer high-water and ice-push zone;
- **5–50 m** in sheltered coves with peat. This comes from the project's earlier shore note.

Calibrate against the Hot Brook aerial photo already in the repo rather than trusting either number.

### Cited findings
- **MNAP Sweetgale Mixed Shrub Fen** [ME] — [MNAP](https://www.maine.gov/DACF/mnap/features/communities/sweetgalefen.htm) *(search summary)*
  - Shrubs "typically about 1 m high": taller than bog shrubs, shorter than most alder thickets.
  - Dominated by sweetgale, leatherleaf and meadowsweet/hardhack; alder present but not dominant.
  - Basin wetlands along open water or in beaver flowages, with slow-moving water usually at the edge.
  - The USNVC association it belongs to occurs on stream, lake and pond margins, with the shrub layer "usually > 80 % cover" (search summary of the USNVC description).
- **Vermont Sweet Gale Shoreline Swamp** [NE] — [VT Fish & Wildlife fact sheet](https://vtfishandwildlife.com/conserve/conservation-planning/natural-community-fact-sheets/sweet-gale-shoreline-swamp)
  - "Frequently a narrow zone between open water and other community types."
  - Often a floating sedge–peat mat bound by shrub roots, too weak near the water to bear a person.
  - Meadowsweet and leatherleaf common; stunted northern white-cedar saplings on more mineral-rich shores; red maple and speckled alder in low abundance.
  - No widths are given.
- **MNAP Alder Shrub Thicket** [ME] (in the earlier project note): speckled alder 1–3 m tall at > 20 % cover, usually > 40 %. FEIS densities for alder thickets are in §2.
- **MNAP Lakeshore Beach** [ME] — [MNAP PDF](https://www.maine.gov/DACF/mnap/features/communities/lakeshore_beach.pdf) *(search summary)*
  - The most frequent lakeshore type on medium and large Maine lakes.
  - Sweetgale grows among the herbs on cobble and gravel.
  - Berms carry a sparse canopy of common juniper, speckled alder, red maple, white pine and gray birch.
- **MNAP cedar wetlands** [ME] *(search summary)*
  - **Northern White Cedar Swamp:** cedar up to 95 % cover, hummock–hollow floor, alder frequent — [MNAP](https://www.maine.gov/DACF/mnap/features/communities/northernwhitecedarswamp.htm).
  - **Cedar–Spruce Seepage Forest:** canopy 70–95 % — [MNAP PDF](https://www.maine.gov/DACF/mnap/features/communities/evergreen_seepage_forest.pdf).
  - **Northern White Cedar Woodland Fen:** canopy 20–60 %, locally dense shrubs, scattered winterberry, alder and mountain holly; sometimes along a peatland outlet stream — [MNAP](https://www.maine.gov/DACF/mnap/features/communities/cedarwoodlandfen.htm).
- **Silvicultural Guide for Northern White-Cedar** — Boulfroy et al. 2012, USDA FS GTR NRS-98 — [Treesearch PDF](https://research.fs.usda.gov/download/treesearch/41699.pdf) [ME/CA]
  - "In the boreal forest, cedar is often present around lakes because of the protection against forest fires and its capacity to resist the mechanical effect of ice."
  - More than 400,000 ha (88 %) of the Northeast's cedar forest type is in Maine:
    - 75 % of it on lowlands (54 % flatwoods, 21 % swamps and bogs);
    - about 20 % on rolling uplands.
  - Maine holds 83 % of the region's cedar growing-stock trees.
- **FEIS *Thuja occidentalis*** [other]: lowland sites "include swamps, streambanks, and lakeshores"; lake shores and islands are long-lived refuges where fire is rare (Lake Duparquet, QC). Link in §2.
- **FIA cedar in eastern Maine [ME-E], mature softwood stands:**
  - 17 % of stems ≥ 10 m tall;
  - 300 saplings/ha;
  - **3,220 seedlings/ha**, the most abundant seedling there.

  Cedar regenerates heavily in the wet softwood zone that lines lakes and streams. Deer browse it hard (FEIS).
- **Winterberry, highbush blueberry, meadowsweet.**
  - Winterberry is on 12 % of the PEF reference milacres and is listed for cedar woodland fens.
  - Meadowsweet is a co-dominant of the sweetgale fen.
  - No Maine cover or density figures were found for highbush blueberry.
- **Hot Brook specifics and shore geometry** are in [Shore geometry and shoreline vegetation](../Maine%20lake%20shores%20and%20catchment/shore_geometry_and_vegetation.md):
  - ice-push ramparts with alder and sweetgale behind them;
  - a fen mat 0–0.3 m above water rising into sweetgale/leatherleaf (~1 m), then alder (1–3 m), then spruce, fir and cedar;
  - fens 5–50 m wide in coves;
  - alder floodplain along the brook.

**How to fill the width gap.** Measure it on the Hot Brook aerial imagery already in the repo (`src/w3/true/naip3.jpg`, `canopy3.jpg`). The width of the low, non-tree band between waterline and canopy edge would give lake-specific values. This note does not do that.
