# The spring clear-water phase and the rotifers through it (2026-10-22)

**Why.** In the 3-D sim's first spring (late May–early June), Daphnia reach ~250 µg DW/L and graze the edible algae down ~260-fold (to ~0.4 % of the spring level). The rotifers fall from ~550/L to ~3/L in three weeks and stay at 3–6/L all summer under the fish larvae's grazing. Field lakes like Hot Brook hold 270–470 rotifers/L in summer (`young_first_summer.md` §1). This note asks how deep and how long real clear-water phases (CWPs) are, what the rotifers do through them, and what keeps algae and rotifers from being grazed out.

**Hot Brook:** Upper and Lower Hot Brook Lake, eastern Maine. Small, shallow (mean ~3 m, max 5.5 m), unstratified, soft (Ca ~2 mg/L, alkalinity ~5 mg/L), moderately coloured (22–27 PCU), TP ~9–10 µg/L, Secchi 3.4–4.4 m, ice-out ~late April.

**Tags.**
- **[primary]**: read in the full text (or its figures) in this session.
- **[data]**: my own analysis of a public data set downloaded this session (method stated).
- **[abstract]**: publisher or OpenAlex abstract only.
- **[secondary — X via Y]**: X as given in Y, which I read.
- **[repo CODE]**: held in a companion note; cited, not re-read.
- **[inf]**: my inference or arithmetic, shown.

**Companion notes (not repeated):**

| Code | Note | What it holds |
|---|---|---|
| ZD | `zooplankton_dynamics.md` §Q3, §Q6 | PEG; Schöhsee, Mendota, Erie, St. George CWPs; Knoechel & Holtby clearance; Cáceres egg bank |
| DSL | `daphnia_summer_limits.md` | NLA 2012 summer Daphnia (median 3 µg/L), inedible algae (58 %), YOY planktivory, Ca |
| SZM | `small_zooplankton_and_microbial_loop.md` §6 | Rotifer thresholds (Keratella 0.02–0.03 mg C/L), Gilbert's interference abstracts, bacteria pool values |
| YFS | `young_first_summer.md` §1, §4, §7.1 | NLA 2012–2022 rotifers by month and depth (Hot Brook analogues 270–470/L), larval grazing budget |
| CDC | `copepod_daphnia_coexistence.md` | Daphnia C* 0.04–0.06 mg C/L, Vanni 1986, copepods on rotifers |

**Search budget.** This turn's shared WebSearch budget was already spent when this pass began (0 searches ran). Everything below came from DOI lookups (OpenAlex single records, Crossref), open repositories, and three public data portals (EPA NARS, the Water Quality Portal, USGS Publications). The NTL LTER data (EDI) were behind a login challenge and were not used (access log).

---

## 1. Takeaway table

| Quantity | Field value | The sim now | Source |
|---|---|---|---|
| **CWP depth: spring chl maximum ÷ the following minimum (by mid-July), per lake-year** | **Eastern Maine (23 lakes, 78 lake-years): median 1.5×, p90 2.8×, max 3.4×.** Vermont inland lakes (150 lake-years, TP 5–35): median 2.2×, p90 5.6×, max 23×; TP 8–20: median 2.0×, p90 4.7×, max 11×. Lakes Champlain + Memphremagog: median 3.3×, p90 7.6×, max 30×. **No lake-year ≥ 30×** | ~260× (edible algae) | [data] Water Quality Portal, Passamaquoddy Tribe and Vermont DEC records (§2 Q1) |
| Chl a at the minimum | Eastern Maine: median 2.0 µg/L, half-month p10 1.1–1.4; Vermont: median 1.9 (p10 0.8) | ~0.4 % of spring | [data] same |
| Chl a in lakes holding > 200 µg DW/L Daphnia (May–June snapshots, NE + Upper Midwest, TP 5–35) | **median 4.0 µg/L, p10 1.65, minimum of 44 visits 0.75** (vs 4.6 µg/L where Daphnia < 1 µg/L) | — | [data] NLA 2012/2017/2022 (§2 Q1) |
| Edible (small, non-colonial, non-cyanobacterial) algae at > 200 µg/L Daphnia | **median 0.34 mg/L fresh (p10 0.045)**, vs 0.25 (p10 0.034) where Daphnia < 1 µg/L: **not depleted** across lakes | grazed ~260-fold | [data] NLA phytoplankton counts |
| Edible algae during peak Daphnia grazing, western Lake Erie | 1–8 mm³/L (minimum ~0.5) while Daphnia (300–800 µg/L) cleared 140–855 mL/L/d; 10–32 mm³/L after the August release | — | [primary] Wu & Culver 1991 figs 3–5 |
| Monthly-mean phytoplankton dip at the CWP (1979–94) | Lake Constance: June 1.8× below May, 2.8× below July. Müggelsee: 1.7× below April | — | [primary] Straile & Adrian 2000 fig. 2 |
| Secchi through a strong CWP | Lake Constance 1993: ~2–4 m in the May bloom → ~12–15 m at the CWP (early June) → ~5–8 m by late June | — | [primary] Straile 2002 fig. 1 |
| CWP duration | Vermont dips below half the spring maximum: **median 22 d (p75 30)**; TP 8–20: 15 d (p75 28); Champlain 12 d (p75 21–27). Mendota mid-May → early June (~3 wk); Constance Secchi peak 2–3 weekly samples | — | [data]; [abstract] Luecke et al. 1990; [primary] Straile 2002 |
| CWP timing | Eastern Maine minimum DOY 168 (IQR 155–184); Vermont DOY 180 (172–193); Müggelsee DOY 147; Constance DOY 165; 28 central-European lakes ≈ DOY 140–180 | late May–early June | [data]; [primary] Straile & Adrian 2000; Straile 2002 |
| Does a CWP occur? | Eastern Maine: **no CWP signal in the half-month medians** (chl 2.0–3.0 µg/L, Secchi 5.1–5.9 m all season); a dip below half the spring maximum in only 19 % of lake-years. Vermont: below-half dip in 50–55 % (any cause). Strong fish planktivory removes it (Jeppesen et al. 1997); ultra-oligotrophic Tahoe's zooplankton grazing negligible; oligotrophic Lake Constance still has one | strong CWP every first spring | [data]; [secondary — Jeppesen 1997 via Sommer et al. 2012]; [abstract] Elser & Goldman 1991; Tirok & Gaedke 2006 |
| **Rotifers at a Daphnia peak** | NLA May–June visits with Daphnia > 200 µg/L: **median 214/L, p10 25/L; < 10/L in 10 %**. Daphnia ≥ 100 µg/L of mean length > 1.2 mm (Jun–Aug): median 126/L | **~3/L** | [data] NLA |
| Rotifers where Daphnia are scarce (< 1 µg/L), May–June | median 556/L (p10 127) | 550/L before the crash | [data] NLA |
| Size of the rotifer dip at a Daphnia peak | **~2–3.5× in the median, ~5× at p10** | ~180× | [data] NLA |
| Microzooplankton dip at the CWP (Lake Constance ciliates) | June nadir 160 mg C/m² (0–20 m) vs 400–600 in April–October: **~2.5–4×** | — | [primary] Gaedke & Wickham 2004 |
| Daphnia interference kill rates on rotifers | *K. cochlearis* 0.79–1.14 /d at 16 *D. pulex*/L; *Synchaeta*, *Campanella* 0.23–0.33; *K. crassa*, *P. vulgaris* 0.14–0.28; *Asplanchna*, *P. euryptera*, *Trichocerca* unaffected. *D. galeata mendotae* and *Bosmina*: no effect. Kills only by Daphnia > 1.2 mm | `DAPH_INTERF` 0.05 /d per g/cell on the large share | [abstract] Gilbert 1989; Wickham & Gilbert 1991; Burns & Gilbert 1986 |
| Rotifer starvation time | 0.4–5.0 d (9 species; shorter for species that keep reproducing, and when acclimated to low food) | — | [abstract] Kirk 1997 |
| Daphnia clearance at very low food | **No threshold and no fall in clearance** at low food (type II); feeding ∝ concentration below the incipient limiting level | type II | [abstract] Porter et al. 1982; Muck & Lampert 1980; McMahon & Rigler 1965 |
| Daphnia clearance per unit biomass (20 °C) | In situ *D. g. mendotae* (Lake Erie): F = 3.84·L^1.34 mL/ind/d → **~0.6–0.8 mL/µg DW/d**; CWP-peak community: 140–855 mL/L/d at 300–800 µg/L → **0.5–1.1 mL/µg/d**; Knoechel & Holtby allometry 2.0–2.3 mL/µg/d (20–50 % high) | check (§3) | [primary] Wu & Culver 1991; [repo ZD]; [inf] |
| Daphnia survival with no food (20 °C) | t = 2.95·w^0.25 d (w µg DW): **3.0 d at 1 µg, 4.4 d at 5 µg, 6.2 d at 20 µg**; lipid-rich neonates live ~2× longer | (R_D + M_D) 0.11 /d at 20 °C ≈ 0.06 /d at 15 °C | [abstract] Threlkeld 1976; Tessier et al. 1983 |
| Daphnia decline after the CWP | Constance 1993: 5.6 → 0.6 ×10⁵/m² in ~3 wk (**−0.10 /d**). Western Lake Erie: −0.14 to −0.2 /d (*D. g. mendotae* 400 → 20 µg/L in 3 wk; *D. retrocurva* 800 → 100 in 2 wk) | — | [primary] Straile 2002 fig. 1; Wu & Culver 1991 fig. 3 |
| Spring (June) Daphnia in Hot Brook-like lakes | Hot Brook analogues (≤ 6 m, colour 15–100, TP 8–30; n = 40): **median 0.6, p75 16, p90 158, max 621 µg DW/L**. NE lakes ≤ 6 m (n = 30): median 0.6, p90 47, max 341. NE + UMW TP 5–35 (n = 119): median 12, p75 101, p90 327 | ~250 µg/L | [data] NLA |
| Algal recruitment from the sediment | 32 % of algal taxa recruit; recruitment adds **10–50 % a day** to their abundance, mostly where the bed is < 8 m deep; grazing removes 10–50 %/d; sinking an order lower | none | [abstract] Hansson 1996 |
| Bacteria through Daphnia maxima | Bacteria "only slightly affected" (5–20 ×10⁶/mL, fluctuating irregularly) while HNF were suppressed (550 to > 30,000/mL) | E2a bacteria pool | [abstract] Jürgens & Stolpe 1995 |

**The one-paragraph answer [inf].** Real north-temperate lakes, and above all the soft, coloured, oligo-mesotrophic lakes of eastern Maine, have CWPs that cut chlorophyll ~1.5–3× (rarely 5–10×, never in these data 30×) for ~2–4 weeks. Across lakes, high Daphnia biomass coexists with ordinary chlorophyll (~4 µg/L) and unreduced edible algae. Rotifers dip ~2–3.5× at Daphnia peaks, not ~180×. The sim's 260-fold algal collapse and its 3/L rotifer floor are both 1–2 orders of magnitude outside the field. The likely causes, in order: (1) no algal floor (the grazing-resistant pool, the bed's algae and resting stages, fast cryptophytes); (2) Daphnia clearance per unit biomass perhaps above the field's 0.5–1.1 mL/µg/d (check the units, §3); (3) Daphnia that decline at about half the field's post-CWP rate; (4) a rotifer pool that cannot shift to the interference-resistant species, and whose bacterial food may be stripped with the algae; (5) in summer, the larval fish at 17–53/m³ where the field holds ≤ 1–5/m³ (YFS §4).

---

## 2. Findings by question

### Q1. Depth and duration of the spring clear-water phase; does it occur in lakes like Hot Brook?

**Eastern Maine lakes: the regional data** [data].
- **Source:** the US Water Quality Portal (waterqualitydata.us, `Result/search`, Maine, site type Lake/Reservoir, chlorophyll a, Secchi, total phosphorus, 1975–2023). Almost all spring-to-summer series are the **Passamaquoddy Tribe's** (organization `PTI_ITS_WQX`, method 10200-H): 1,932 chlorophyll values from 23 lakes and ponds of Washington County, 2006–2023, sampled about every 2–3 weeks from early May to October.
- **The lakes** are Hot Brook's neighbours: Big, Lewey, Long, Grand Falls Flowage, Scraggly, Junior, Pocumcus, West Grand, Sysladobsis, Pleasant, East and West Musquash, Side Pistol, Killman, the Chain lakes and others. Summer medians: TP 3–12 µg/L, chl 1.4–4.2 µg/L, Secchi 3.8–11 m. The closest to Hot Brook (TP 9–11 µg/L, Secchi 4.0–4.9 m) are Long, Lewey, Big, Killman, Upper and Middle Chain, and Grand Falls Flowage (chl 2.2–3.4 µg/L).
- **Half-month medians, all lakes** (n per half-month 100–240):

  | Half-month | Chl a median (p10–p90), µg/L | Secchi median, m | TP median, µg/L |
  |---|---|---|---|
  | early May | 2.5 (1.7–3.6) | 5.1 | 7 |
  | late May | 2.0 (1.1–3.4) | 5.25 | 7 |
  | early June | 2.0 (1.4–3.1) | 5.45 | 8 |
  | late June | 2.4 (1.4–4.0) | 5.1 | 8 |
  | early July | 2.6 (1.6–4.4) | 5.45 | 8 |
  | late July | 2.85 (1.6–4.2) | 5.3 | 8 |
  | August | 2.8–3.0 (1.7–4.1) | 5.3–5.9 | 8 |
  | September | 2.6–2.9 (1.7–4.7) | 5.2–5.6 | 7 |

  The late-May–early-June chlorophyll is only 20 % below early May, and Secchi does not peak. **No CWP is visible in the regional medians.**
- **Per lake-year** (≥ 5 samples between DOY 105 and 205, the first by DOY 160, no gap > 28 d; spring maximum = the highest value to DOY 170; minimum = the lowest after it, to DOY 205): n = 78 lake-years in 18 lakes.
  - Spring maximum median 2.9 µg/L (IQR 2.3–3.4) on DOY 138; the following minimum median 2.0 (p10 1.3) on DOY 168 (IQR 155–184).
  - **max ÷ min: median 1.5, IQR 1.3–1.9, p90 2.8, max 3.4.** Only 9 % of lake-years reached 3×, none 5×.
  - A dip below half the spring maximum happened in 19 % of lake-years; where it did, it lasted a median 24 d.
- **Caveats [inf].**
  - Sampling every 2–3 weeks can miss a 1–2-week CWP, and the first sample (early May) can miss a bloom right after ice-out (late April).
  - Values are often reported to 0.1–1 µg/L, which compresses ratios near 1–2 µg/L.
  - The metric also counts dips from other causes (diatom sinking, silica), so it is an *upper* bound on the grazing-caused CWP.

**Vermont lakes: denser series** [data].
- **Source:** the same portal, Vermont DEC (`1VTDECWQ`), 56,091 chlorophyll values 2000–2022. Inland lakes are sampled ~weekly from late May (Lay Monitoring); Lakes Champlain and Memphremagog from April.
- Criteria: ≥ 5 samples between DOY 105 and 205, the first by DOY 152 (June 1), no gap > 21 d. Lake TP = the median June–August total P.

  | Set | Lake-years (lakes) | Spring max, µg/L (DOY) | Following min, µg/L (DOY) | max ÷ min: median (IQR), p90, max | Share ≥ 3× / ≥ 10× | Below-half dip: share; duration median (p75) |
  |---|---|---|---|---|---|---|
  | Inland, TP 5–35 | 148 (50) | 4.1 (155) | 1.93 (180) | **2.3 (1.5–3.4), 5.7, 22.6** | 33 % / 3 % | 55 %; 22 d (30) |
  | Inland, TP 8–20 | 112 (41) | 3.8 (156) | 1.83 (180) | **2.0 (1.4–3.0), 4.7, 10.9** | 26 % / 1 % | 50 %; 15 d (28) |
  | Inland, strict (first sample by May 20) | 28 (16) | 10.7 (144) | 2.86 (176) | 3.0 (1.3–5.4), 9.2, 22.6 | 50 % / 11 % | 57 %; 27 d (40) |
  | Champlain + Memphremagog | 135 (17 stations) | 6.6 (149) | 2.05 (174) | **3.3 (2.4–4.8), 7.6, 29.6** | 55 % / 7 % | 84 %; 12 d (21) |

- Relaxing the rules (first sample by DOY 160; or gaps ≤ 28 d) gave the same picture: inland median 1.8–2.2×, p90 4.7–5.7×, max 22.6×; no lake-year ≥ 30×.
- The minimum is ~0.8 µg/L at p10 in every set.
- **Caveat:** inland sampling starts around Memorial Day, so the true ice-out maximum is often missed. The strict subset (n = 28) catches it and gives a median of 3.0× and a maximum of 23×.

**Maine, 1975: five lakes over one open season** [primary, USGS WRI 80-69].
- Three of five lakes showed vernal and autumnal maxima with a midsummer minimum of total phytoplankton cell area:
  - Pleasant Pond: June 112 → July 15 mm²/L (7.5×);
  - Forest Lake: late April–early May 519 → mid-June 251 → July 85 (6×), the vernal peak 90 % *Ochromonas*;
  - Brewer Lake: early June 340 → July 64 (5×).
- Pleasant River Lake peaked in July; Upper Lead Mountain Pond's pattern was "much more subdued".
- The authors ascribed the summer minima to **silica depletion and diatom settling**, not grazing (no zooplankton data in that analysis). The minima fell in **July**, after stratification, not in late May–June. — [Cowing & Scott 1980, USGS WRI 80-69](https://pubs.usgs.gov/wri/1980/0069/report.pdf)

**Across lakes at the moment of high Daphnia: NLA snapshots** [data].
- **Source:** EPA National Lakes Assessment 2012, 2017 and 2022 zooplankton counts (fine 50-µm and coarse 150-µm nets, each taxon from its own net, as in YFS §1), chlorophyll a, TP, colour, index depth. Phytoplankton counts (biovolume, µm³/mL) are from the same visits.
- Set: NE (ME, NH, VT, MA, NY, CT, RI) + Upper Midwest (MN, WI, MI), TP 5–35 µg/L; 562 visits (May 1, June 119, July 191, August 172, September 79).
- **Chlorophyll by Daphnia biomass class:**

  | Daphnia, µg DW/L | Visits (all months) | Chl median (p10–p75), µg/L | Chl ÷ TP | May–June visits: chl median (p10) | Rotifers /L, May–June: median (p10) |
  |---|---|---|---|---|---|
  | < 1 | 211 | 5.1 (1.7–8.4) | 0.33 | 4.6 (1.3) | 556 (127) |
  | 1–10 | 91 | 4.5 (1.9–7.7) | 0.28 | 4.5 (1.7) | 299 (137) |
  | 10–30 | 68 | 3.6 (1.8–8.1) | 0.32 | 2.8 (1.4) | 110 (26) |
  | 30–100 | 112 | 3.7 (1.7–6.2) | 0.29 | 3.8 (1.7) | 177 (44) |
  | 100–200 | 36 | 4.2 (1.2–6.2) | 0.28 | 4.0 (0.9) | 202 (104) |
  | > 200 | 44 | **4.2 (1.7–9.2)** | 0.26 | **4.0 (1.65)** | **214 (25)** |

  - The 44 visits with > 200 µg/L Daphnia (up to 1,250 µg/L) had a minimum chlorophyll of 0.75 µg/L (Wisconsin, June 2017).
  - Chl ÷ TP falls only ~20 % (0.33 → 0.26) from the lowest to the highest Daphnia class.
- **Edible algae by Daphnia class** (edible = units < 1,000 µm³, not cyanobacteria, not in a list of colonial, filamentous, gelatinous, desmid and large dinoflagellate genera; mg/L fresh):

  | Daphnia, µg/L | Edible median (p10–p90) | Cryptophytes median | Edible share of biovolume |
  |---|---|---|---|
  | < 1 | 0.25 (0.034–1.25) | 0.12 | 21 % |
  | 30–100 | 0.25 (0.029–1.22) | 0.15 | 18 % |
  | 100–200 | 0.23 (0.043–1.36) | 0.16 | 26 % |
  | > 200 | **0.34 (0.045–1.42)** | 0.19 | 22 % |

  June only, > 200 µg/L (n = 20): edible median 0.34, p10 0.078.
- **Caveat [inf].** These are one-visit snapshots of different lakes, so a short CWP is caught only by chance. Lakes with much Daphnia may also be more productive (TP medians were similar: 14–18 µg/L). Still, the snapshots show no state anywhere near "Daphnia 250 µg/L, edible algae ~0".

**The classic CWP lakes.**
- **Lake Constance** (large, deep, meso- to oligotrophic) [primary, Straile 2002 fig. 1]:
  - in 1993 the May bloom cut Secchi to a few metres;
  - the CWP in early–mid June brought it back to ~12–15 m for 2–3 weekly samples;
  - Daphnia peaked at 5.6 ×10⁵/m² and fell to 0.6 ×10⁵/m² within ~3 weeks;
  - summer Daphnia then ranged 0.4–2.5 ×10⁵/m².
- **Monthly means 1979–94, Constance and Müggelsee** (shallow, hypertrophic) [primary, Straile & Adrian 2000 fig. 2]:
  - log₁₀ phytoplankton biovolume, Constance: April 0.98, May 1.18, **June 0.93**, July 1.38;
  - Müggelsee: April 1.88, May 1.77, **June 1.65**, July 1.86;
  - mean CWP date (minimum biovolume after the spring maximum): Müggelsee DOY 147 ± 3.6, Constance DOY 165 ± 3.6.
  - Daphnia (log₁₀ n/m²) rose ~1.5–2 log units from April to May–June and stayed within ~2.5× of the peak all summer.
- **28 central European lakes, 136 seasons** [primary, Straile 2002 fig. 5]: CWP dates (date of maximum Secchi) ≈ DOY 140–180, ~2 weeks earlier since 1970. **Only lakes "that exhibited typical clearwater phases" were used**, so the paper gives no frequency.
- **Constance under ciliates** [abstract, Tirok & Gaedke 2006]:
  - "A CWP occurred regularly, even if daphnid biomass was still very low";
  - in about half the years the grazing that started it came from ciliates, rotifers and copepods rather than daphnids.
- **Constance, oligotrophic vs eutrophic** [primary, Straile 2015]: the cladoceran spring peak (May/June) appeared in all three trophic periods (TP_mix ~7 µg/L in 2008–12 and 81 µg/L in 1979–84). Spring cladoceran biomass tracked May temperature (slope 0.377 log₁₀ per °C) more than TP. **Oligotrophy alone does not remove a CWP from a lake where Daphnia dominate the spring.**
- **Western Lake Erie** [primary, Wu & Culver 1991]:
  - *D. g. mendotae* peaked at 300–700 µg/L (20 June–11 July) and *D. retrocurva* at 800 µg/L (early June 1989);
  - grazing was 140–855 mL/L/d;
  - Secchi rose to 2–6.5 m offshore, against ~1–1.5 m in August;
  - edible algae held at ~1–8 mm³/L (minimum ~0.5), rising to 10–32 mm³/L when grazing fell in August.
- **Schöhsee**: community grazing 170 % of volume a day at the CWP; < 35 µm chl and POC fell [repo ZD; abstract Lampert et al. 1986]. **Mendota**: CWP "from mid-May until early June" [repo ZD]. Fold drops were not retrieved for either (§5).
- **English lakes** [abstract, Talling 2003]:
  - cladoceran maxima were "generally associated with a minimum in Chl";
  - in Esthwaite Water the principal chl minimum is "ascribable to grazing by *Daphnia*";
  - the inverse relationship "is lost in some years when relatively inedible large phytoplankters (e.g. colonial chrysomonads, filamentous cyanophytes) are abundant and Chl minima are less pronounced".
- **Mendota, Monona, 38 years** [abstract, Matsuzaki et al. 2021]: a higher share of large *D. pulicaria* gave earlier, longer and clearer CWPs; warmer water advanced the dates but not the depth.

**Does a CWP occur in oligotrophic, soft, coloured or fish-rich lakes?**
- **Fish:** "With increasing fish predation, there is a shift from a bimodal clearing phase … over unimodal … to no clear water phase at all" [secondary — Jeppesen et al. 1997 via Sommer et al. 2012]. Hot Brook has yellow and white perch, pumpkinseed, sea-run alewife (Lower) and perch-dominated YOY.
- **Edibility:** an early cyanobacterial start can prevent a CWP [secondary — Deneke & Nixdorf 1999 via Sommer et al. 2012].
- **Ultra-oligotrophic lakes:** in Lake Tahoe, ambient zooplankton had "negligible grazing impacts" (though added Daphnia did graze). The coupling is "strongest in lakes of intermediate productivity" [abstract, Elser & Goldman 1991].
- **Hot Brook-like lakes have little Daphnia in June:** NLA Hot Brook analogues held a median of 0.6 µg/L (p75 16) (Q5). Without a large spring Daphnia population there is no grazer to make a CWP [inf].
- **Eastern Maine** shows no CWP signal in medians and a ≥ 3× dip in only 9 % of lake-years (above) [data].
- **[inf] Conclusion for Hot Brook:** expect a weak or absent CWP: a 1.5–3× chlorophyll dip lasting 2–4 weeks around early–mid June, in some years none. A 5–10× CWP would be an exceptional, high-Daphnia, low-fish year.

### Q2. Rotifers and nauplii through the CWP

**Field densities at Daphnia peaks** [data, NLA; set as in Q1].
- **May–June, Daphnia > 200 µg DW/L (n = 20):** rotifers median 214/L (p10 25, p90 441), 4.8 µg DW/L. 10 % of visits < 10/L, 20 % < 50/L. Nauplii median 45/L.
- **May–June, Daphnia < 1 µg/L (n = 36):** rotifers 556/L (p10 127), 16 µg/L. Nauplii 45/L.
- **June–August, by Daphnia size** (mean mass → length by W = 5.0·L^2.84):

  | Daphnia class | Visits | Rotifers median /L (mean) | Nauplii median /L | Chl median |
  |---|---|---|---|---|
  | < 1 µg/L | 177 | 450 | 49 | 5.1 |
  | 1–30 | 135 | 231 (498) | 40 | 4.1 |
  | 30–100 | 95 | 178 (371) | 35 | 3.7 |
  | ≥ 100, mean length ≤ 1.2 mm | 44 | 234 (389) | 50 | 5.0 |
  | **≥ 100, mean length > 1.2 mm** | 31 | **126 (194)** | **24** | 2.9 |

  All months, mean length > 1.2 mm and > 30 µg/L (n = 73): rotifers 113/L, p10 13/L, 9.6 % < 10/L. Mean length ≤ 1.0 mm and > 30 µg/L (n = 70): 265/L, p10 57/L, 1.4 % < 10/L.
- **[inf]** The dip at a Daphnia peak is ~2–3.5× in the median and ~5× at p10. Large Daphnia double the dip, as Gilbert predicts, but even they leave a median > 100/L. The sim's 550 → 3/L (180×, a net −0.25 /d for 21 d) is outside ~90 % of field visits.

**Which taxa persist** [data, NLA, June–August; share of rotifer numbers].
- At every Daphnia class: *Keratella* 30–46 %, *Polyarthra* 11–27 %, *Conochilus* 9–42 % (a few dense visits). *Kellicottia* was 1 % where Daphnia < 1 µg/L but 6–9 % wherever Daphnia were present.
- Under ≥ 100 µg/L of large Daphnia, *Synchaeta* rose to 11 % (3 % without Daphnia). *Ptygura*, *Collotheca* and *Conochiloides* fell from 1–4 % to ≤ 0.2 %.
- The 44 > 200 µg/L visits held *Keratella* 0.3–1,200/L, *Polyarthra* 0–1,900/L, *Kellicottia* 0–416/L and *Conochilus* 0–911/L.
- Gilbert 1989's bottle experiment adds species detail [abstract]: interference cut *K. cochlearis*'s relative abundance by 61–77 % and raised *K. crassa* and *Trichocerca* by up to 100 %. *Asplanchna*, *P. euryptera* and *Trichocerca similis* were unaffected.

**Microzooplankton through a CWP: Lake Constance's ciliates** [primary, Gaedke & Wickham 2004].
- Ciliate spring peaks were ~1,000 mg C/m² (0–20 m ≈ 50 µg C/L).
- Monthly means were 400–600 mg C/m² from April to October, except **June (the CWP), a nadir of 160 mg C/m² (≈ 8 µg C/L)**. Ciliates "quickly recovered during early summer".
- Low ciliate biomass coincided with high daphnid biomass around the CWP.
- Rotifers held ~20 % of ciliate biomass and < 5 % of crustacean biomass on the long-term average.
- Daphnids prey on ciliates once above 25–50 µg C/L (500–1,000 mg C/m²) [primary, Tirok & Gaedke 2007].
- **[inf]** The monthly-mean dip of a microzooplankton group at a strong CWP is ~2.5–4×, matching the NLA rotifer dip.

**What rotifers eat then.**
- **Bacteria persist through Daphnia maxima.** In shallow eutrophic Grosser Binnensee, Daphnia maxima "coincided with clearwater phases" and were negatively correlated with POC, HNF and phytoplankton. Bacterial abundance "was only slightly affected" (5–20 ×10⁶/mL, fluctuating irregularly). HNF ranged from 550 to > 30,000/mL and were suppressed by daphnids [abstract, Jürgens & Stolpe 1995].
- But **large Daphnia can take most bacterial production.** In Upton Lake, *D. galeata* "consumed most of the bacterial production" except in winter and autumn; "ciliates and rotifers were never important bacterial grazers" there [abstract, Pace et al. 1990]. *D. rosea* showed no preference between algae and bacteria [abstract, DeMott 1982].
- **The microbial share:** 10–40 % of rotifer food; *Keratella*, *Kellicottia* and *Conochilus* eat 0.5-µm particles; *Polyarthra* and *Synchaeta* need algae and ciliates [repo SZM §6].
- **Spring bloom:** > 50 % of primary production went through the microbial loop in Constance; bacterial C was 21 % of phytoplankton C and bacterial production 18 % of particulate PP. Rotifers + nauplii took ~7 % of PP [abstract, Weisse et al. 1990].
- **Edible algae in Constance's spring:** 0.01–0.1 mg C/L (200–2,000 mg C/m²), "within the range of threshold food values" for many ciliates [primary, Tirok & Gaedke 2007]. *Keratella*'s zero-growth food is 0.02–0.03 mg C/L, below Daphnia's 0.04–0.06 [repo SZM, CDC].
- **[inf]** At the CWP, rotifers live on what Daphnia leave plus bacteria fed by DOC. Bacterial production does not depend on the edible algae's standing stock: in a coloured lake much of it is terrestrial carbon (repo SZM: bacterial production 2–13 µg C/L/d, 35–70 % allochthonous).

**How fast rotifers die without food.** Starvation time 0.4–5.0 d across nine species. Species that keep reproducing while starving die soonest, and animals acclimated to low food starve sooner [abstract, Kirk 1997]. Threlkeld's allometry gives ~1.2 d for a 0.025-µg rotifer and 1.7 d at 0.1 µg [inf]. So a rotifer pool whose food really goes to ~0 empties in days. That rotifers persist at > 100/L means their food does not go to ~0 [inf].

### Q3. What keeps the algae and the rotifers from being grazed out

**(a) Daphnia do *not* slow their filtering at low food.**
- *D. magna* from 0 to 20 mg C/L: "Daphnia has no feeding threshold or reduced filtering activity at low concentrations"; a Holling type 2 or Ivlev curve without threshold fits [abstract, Porter et al. 1982].
- *D. longispina* and *Eudiaptomus* down to 1 µg C/L: a threshold was found in only one experiment, and depressed filtering only in two (19 °C), which the authors put down to the experimental conditions [abstract, Muck & Lampert 1980].
- Below the incipient limiting level, feeding rate is proportional to concentration (constant clearance). Starved animals briefly filter at the maximum rate [abstract, McMahon & Rigler 1965].
- **[inf]** The sim's type II grazing is right. The algae's refuge must come from algal traits, space and the grazers' numbers, not from Daphnia sparing them.

**(b) How much water field Daphnia clear per unit biomass.**
- **In situ, Lake Erie, *D. g. mendotae*** (August 1987): F = 3.837·L^1.343 mL/ind/d in the western basin (mean 4.3 mL/ind/d at 0.95 mm; range 0.6–10.6). Central basin: F = 1.496·L^1.142. Eastern basin: F = 1.371·L^0.424 [primary, Wu & Culver 1991 table 2].
  - With W = 5.0·L^2.84 µg [repo ZD], western-basin animals clear **0.77 mL/µg DW/d at 1.0 mm and 0.58 at 1.2 mm**; the central basin ~0.16 at 1.5 mm [inf].
- **The Knoechel & Holtby allometry** (11.7·L^2.48; reads 20–50 % high) gives **2.3 mL/µg/d at 1.0 mm and 2.0 at 1.5 mm** [repo ZD; inf].
- **Western Erie at its CWP:** 140–855 mL/L/d at 300–800 µg/L → **~0.5–1.1 mL/µg/d** [inf from Wu & Culver figs 3–4].
- **[inf] At 250 µg DW/L of ~1-mm Daphnia** these give a community clearance of **~0.15–0.55 L/L/d** (15–55 % of the water a day) at ~20 °C. That is less at the 12–16 °C of a Maine late May (no temperature equation retrieved; ZD suggests Q10 ~2).

**(c) Daphnia starve, stop breeding and decline within 1–3 weeks.**
- **Survival with no food** at 20 °C: t = 2.95·w^0.25 d (w in µg DW) [abstract, Threlkeld 1976].

  | Body mass | Survival |
  |---|---|
  | 1 µg (neonate) | 3.0 d |
  | 2 µg | 3.5 d |
  | 5 µg (~1 mm) | 4.4 d |
  | 8.4 µg (1.2 mm) | 5.0 d |
  | 20 µg | 6.2 d |

  Older animals die sooner than predicted. At 15 °C, with Q10 ~2, multiply by ~1.4 [inf].
- **Reserves.** Adults in late intermolt starve sooner because their reserves go to the ovaries. *D. magna* neonates with high maternal lipid survive ~2× as long [abstract, Tessier et al. 1983]. Lipid reserves sustain reproduction for a lag after food falls, then "many individuals, primarily juveniles, starve and die" [abstract, Goulden & Hornig 1980].
- **Low food is not no food.** At the lowest food level tested, *D. galeata* still grew at r = 0.082 /d and *D. magna* at 0.143; *Bosmina* fell at −0.136 [abstract, Goulden et al. 1982].
- **Field sequence (Bautzen).** During the CWP "fecundity declines and hence, recruitment is low"; adult mortality rises when the peak cohort reaches its (starvation-shortened) life span; then fish predation takes over [abstract, Hülsmann 2000].
- **Field decline rates.** Constance 1993: −0.10 /d over ~3 weeks [primary fig.]. Western Erie: *D. g. mendotae* 400 → ~20 µg/L in 3 weeks (−0.14 /d), 620 → 140 µg/L in a week (−0.2 /d); *D. retrocurva* 800 → 100 µg/L in 2 weeks (−0.15 /d) [primary, Wu & Culver 1991 fig. 3; inf].
- **[inf] The sim.** With food ≈ 0 the sim's Daphnia lose only (R_D + M_D)·q = 0.11 /d at 20 °C, ≈ 0.06 /d at 15 °C (Q10_LD 3.0), plus the E2b invertebrate loss. That is about half the field's post-CWP decline, so the grazers stay at strength longer while the algae are already down.

**(d) Algal refuges.**
- **Inedible and grazing-resistant algae.** Real spring CWPs strip the < 35 µm fraction while larger algae rise. In Schöhsee bags, zooplankton "stimulated the growth of large (> 35 µm) algae" [abstract, Lampert et al. 1986]. Mendota's CWP community was colonial greens, edible only to Daphnia [abstract, Vanni & Temte 1990]. Summer NLA analogues are ~58 % inedible [repo DSL]. The edible share in eastern US lakes is ~17–26 % in every Daphnia class [data, Q1].
- **Fast-growing edible flagellates.** In Lake Mendota "intense grazing promoted the transition … to similarly edible, cryptophyte flagellates" during the CWP [abstract, Sarnelle 1993]. Nutrients did not limit growth during the CWP [abstract, Vanni & Temte 1990]; dissolved nutrients often rise during it [primary, Sommer et al. 2012]. Algae at the CWP grow fast and are held only by grazing; they rebound as soon as Daphnia fall [inf].
- **Recruitment from the sediment and resting stages.**
  - In four low-productivity basins, 32 % of algal taxa recruited from the sediment, adding 10–50 % a day to their abundance, mostly where the bed was < 8 m deep. Grazing removed 10–50 % a day; sinking was an order lower [abstract, Hansson 1996].
  - Dinoflagellates delay excystment when zooplankton exudates are present: "a temporal escape from herbivory" [abstract, Rengefors et al. 1998].
  - **[inf]** In Hot Brook (max 5.5 m, Secchi 3.4–4.4 m) the whole bed is in the photic zone. The bed's algal resting stages, the periphyton and resuspended benthic diatoms are a seed Daphnia cannot reach.
- **Littoral and macrophytes.** Open-water Daphnia avoid the shore (sim `SHORE` 0.25). In shallow lakes the large cladocerans may hide in macrophytes by day and graze the open water at night [abstract, Timms & Moss 1984; Burks et al. 2002], which *raises* open-water grazing. No numeric algal refuge in the littoral was retrieved.

**(e) Refuges for the rotifers.**
- **Shallow, weedy water.** Index sites ≤ 2 m deep held 453 rotifers/L in July–August (430–790/L by month) with Daphnia ~0/L [repo YFS §1].
- **Interference-resistant species** take over (Q2).
- **Bacteria** keep feeding them (Q2).
- **Daphnia that fish keep small** (< 1.2 mm) do not interfere (Q4).

### Q4. Daphnia–rotifer interactions

**Interference: mechanical damage.**
- *D. galeata mendotae* and *D. rosea* "inhibit population growth of … *K. cochlearis* even when shared food is abundant". *Keratella* swept into the branchial chamber are killed, mortally wounded or lose their eggs [abstract, Gilbert & Stemberger 1985].
- **Size rule.** At body lengths > 1.2 mm, five Daphnia species killed *Keratella* at y = 0.485·L(mm) − 0.588 *Keratella* per Daphnia per hour, with no species differences. *Keratella* mortality was independent of its density over 125–1,000/L. Daphnia cleared live *Keratella* at ~3× their rate on *Cryptomonas*. Large daphnids (> 2 mm) at ≳ 1–5/L "could have a major impact" [abstract, Burns & Gilbert 1986a].
- **Lethal encounters** rose with Daphnia size and fell at algal concentrations above the incipient limiting level [abstract, Burns & Gilbert 1986b].
- **Field-water bottles** (small eutrophic lake; *D. pulex* 16/L; food added; 2 d) [abstract, Gilbert 1989]. Daphnia-induced death rates:

  | Taxon | Death rate, /d |
  |---|---|
  | *K. cochlearis* | **0.79–1.14** |
  | *S. pectinata*, *Campanella* (ciliate) | 0.23–0.33 |
  | *K. crassa*, *P. vulgaris* | 0.14–0.28 |
  | *Asplanchna*, *P. euryptera*, *T. similis* | 0 |

- **Storrs Pond, NH (lab and field enclosures)** [abstract, Wickham & Gilbert 1991]:
  - *Bosmina* did not depress rotifers or ciliates;
  - *D. galeata mendotae* "had no effect on any of the rotifers in either experiment";
  - *D. pulex* depressed ciliates and the vulnerable rotifers (*P. vulgaris* only at lab densities);
  - phytoplankton and bacteria were not reduced, so the mechanism was interference or predation, not exploitation.
- **[inf] A per-biomass interference rate.** Assume Gilbert's *D. pulex* were ~2 mm (~36 µg DW by W = 5.0·L^2.84):
  - 0.79–1.14 /d at 16/L is ~**0.0014–0.002 L per µg Daphnia per day** for *K. cochlearis*;
  - ~0.0002–0.0005 for *K. crassa* and *Polyarthra*;
  - 0 for the resistant taxa.

  A summer community of ~30–45 % *Keratella* (part of it *K. crassa*) and ~20–25 % *Polyarthra* (Q2) averages perhaps ~0.0005–0.0009 L µg⁻¹ d⁻¹, and only for animals > 1.2 mm. The sim's `DAPH_INTERF` of 0.05 /d per g/cell is ≈ 0.0012 L µg⁻¹ d⁻¹ *if* 1 g wet/cell ≈ 40 µg DW/L (the 2-D `PLANKTON.START_D` mapping; check the 3-D cell volume). That is the vulnerable-*Keratella* end of the range applied to a pool that cannot shift species.

**Exploitative competition.**
- *D. pulex* excluded *Brachionus calyciflorus* and *K. cochlearis* in 1–3 weeks in daily-renewed cultures by taking "increasingly disproportionate shares of the daily algal food supply, leaving the rotifer populations to gradually starve". Rotifers "are unlikely to abound … with large cladocerans unless food is abundant or environmental factors differentially inhibit the cladocerans" [abstract, Gilbert 1985].
- Exploitation bites only below the rotifers' saturating food [repo SZM, MacIsaac & Gilbert 1991].
- In enclosures, *D. pulex* cut phytoplankton 10× in eutrophic Larimore Pond and reduced *Bosmina*, *Trichocerca* and nauplii in oligo-mesotrophic Dynamite Lake. The effects on rotifers and copepods were stronger in the eutrophic pond [abstract, Vanni 1986].
- Suspended clay cut cladoceran ingestion of algae by 13–83 % but not rotifers', shifting competition toward rotifers [abstract, Kirk 1991]. Hot Brook is clear, so this is minor.

**Field evidence at given Daphnia biomasses.**
- **Gilbert 1988's review** [abstract]: rotifers "cannot become abundant" beside Daphnia ≳ 1.2 mm, even at 1–5 ind/L; small cladocerans "often co-occur with them at high densities". Removing Daphnia raised rotifer fertility and abundance. Adding fish removed Daphnia and raised rotifers.
- **NLA** [data; Q2; YFS §1]:
  - July–August medians: 450/L at < 1 µg/L Daphnia, 293 at 1–10, 229 at 10–30, 178 at 30–100, 222 at > 100;
  - ≥ 100 µg/L of > 1.2-mm Daphnia: 126/L;
  - the summer Daphnia mean length is 0.97 mm (IQR 0.78–1.21).
- **[inf] Rule of thumb from the field:** the rotifer median ≈ 450/L × (0.4–0.5 at 30–> 200 µg/L of ~1-mm Daphnia; ~0.25–0.3 when the same biomass is > 1.2 mm). The p10 stays ≥ 13–30/L.

### Q5. Spring Daphnia peaks in lakes like Hot Brook

**NLA, June visits** [data]:

| Set | Visits | Daphnia µg DW/L: p25 / median / p75 / p90 / max | Density /L: median, p90 | Share > 100 / > 200 µg/L |
|---|---|---|---|---|
| Hot Brook analogues (NE + UMW, ≤ 6 m, colour 15–100, TP 8–30) | 40 | 0 / **0.6** / 16 / **158** / 621 | 0.26, 26 | 12 % / 8 % |
| NE lakes ≤ 6 m, TP 5–35 | 30 | 0 / 0.6 / 20 / **47** / 341 | 0.26, 14 | 3 % / 3 % |
| NE + UMW, TP 5–35, all depths | 119 | 0.4 / 12 / 101 / 327 / 989 | 3.2, 44 | 25 % / 17 % |
| Maine, all (June) | 8 | 0 / 0 / 0.1 / 12 / 40 | 0, 2.3 | 0 / 0 |

- **July–August,** Hot Brook analogues: median 0.3, p75 12, p90 78 µg/L.
- **Maine's highest of 80 visits:** a 3-m pond (TP 48) with 1,712 µg/L in July (rotifers 513/L, chl 2.6), and an 8-m lake (TP 23) with 1,252 µg/L. Ten others were at 75–360 µg/L.
- **Caveat [inf].** The NLA visits fall in June–September, mostly mid-to-late June. A late-May peak would be missed, so these percentiles understate spring maxima somewhat. The earlier Hot Brook-analogue set of YFS (Daphnia ≥ 1/L only) gave a June median of 37 µg/L (IQR 15–164) [repo YFS §1].

**Other lakes.**
- Western Lake Erie (eutrophic): *D. g. mendotae* 300–700 µg/L, *D. retrocurva* 800 µg/L (June) [primary, Wu & Culver 1991].
- Lake Constance: CWP daphnids > 500 mg C/m² over 0–20 m (≈ 25 µg C/L ≈ 50 µg DW/L) [primary, Tirok & Gaedke 2007; inf at C = 0.5 DW].
- Mirror Lake, NH (oligotrophic, soft): total zooplankton 1.4–2.6 kg C/ha (≈ 70 µg DW/L annual mean); copepods 55 % of biomass, rotifers 40 % of production [abstract; repo DSL].
- Overwintering Daphnia at ice-out: 0–2.5/L; ephippial emergence negligible [repo ZD, Cáceres 1998].
- **Ca ~2 mg/L** favours small daphniids, *Holopedium*, *Bosmina* and copepods over large Daphnia [repo DSL].

**[inf] For Hot Brook,** a typical spring Daphnia maximum is ~10–60 µg DW/L. A 100–200 µg/L year is plausible but uncommon. The sim's ~250 µg/L sits near or above the p90 of June field values for analogue lakes, and its animals would be mostly ≤ 1.2 mm under the lakes' planktivores (summer NLA mean 0.97 mm).

---

## 3. What a simulation should use [inf]

These are mechanisms with field parameter values, ordered by strength of evidence. They are not targets to tune toward. The field ranges in §4 are for checking afterwards.

**1. Keep the larval fish at field densities before touching the rotifers' own rates.** Strong; this is the summer floor.
- Field larval standing densities are ≲ 0.1–5/m³ per species and ≲ 10–40/m² for all species; at those densities larvae take ~1–30 % of small-prey production [repo YFS §4, §7.4].
- The sim's 17–53/m³ take ~15–300 %. This alone explains rotifers held at 3–6/L all summer; no rotifer mechanism will survive it.
- Check the larval density first (the stage survival audit).

**2. An algal floor that Daphnia cannot graze.** Strong for the existence of the mechanism; moderate for its size.
- **Grazing-resistant pool** (as DSL mechanism 2): colonial, filamentous, gelatinous and large algae that take nutrients and light and are barely grazed.
  - At a CWP it carries the chlorophyll. Lampert's > 35 µm fraction grew *with* zooplankton; Talling's minima were "less pronounced" when inedible algae were abundant; Mendota's CWP was colonial greens.
  - Field edible shares are ~20 % in summer and higher in spring (DeMott 1983: spring algae "mostly highly edible flagellates" [repo DSL]).
- **Bed recruitment and resting stages:** a flux from the bed to the water for part of the community, up to 10–50 % of their abundance a day where the bed is < 8 m (Hansson 1996). Make it independent of the water's algae (cysts, resting cells, resuspended benthic diatoms), and ungrazed while on the bed.
  - The rate is the weakest number here; scale it so recruiting taxa can double in ~2–7 days from the bed alone, and record what it does.
- **Fast regrowth:** the edible pool's maximum growth at CWP temperatures must not be food-web-limited. Nutrients are replete during the CWP (Vanni & Temte; Sommer 2012), so the algae rebound within days once grazing eases.
- **What the field says it should produce:** edible algae at a CWP of ~0.03–0.35 mg/L fresh (≈ 0.003–0.05 mg C/L), i.e. ~10–30 % of the pre-CWP level, not ~0.4 %.

**3. Daphnia clearance per unit biomass at field values; type II to zero food.** Strong (direct measurements).
- Clearance at low food = maximum clearance, with no threshold (Porter 1982; Muck & Lampert 1980; McMahon & Rigler 1965).
- **Size it:** ~0.5–1.1 mL per µg DW per day at ~20 °C (CWP-peak communities in Erie; in situ *D. g. mendotae* 0.6–0.8). The upper allometric bound is ~2.0–2.3 (Knoechel & Holtby, 20–50 % high). Scale down below 20 °C (Q10 ~2; no equation retrieved).
- **Check the sim:** compute `PLANKTON.GR_D × TS / K_D` as volume cleared per µg DW per day at low food (chem3.js line 348). I could not resolve `TS` and the 3-D cell volume here, so this is a check, not a finding. At 250 µg/L the field rate clears ~15–55 % of the water a day. If the sim clears ≥ 100 %/d at that biomass, it is outside the field.
- Daphnia also eat bacteria (EPS_D 0.5; Kankaala's 26–92 % of the algal rate [repo SZM]), so they do not need to strip the algae to stay fed.

**4. Daphnia that stop breeding and starve on the field's time scale.** Moderate to strong.
- **Fecundity:** when ingestion falls below maintenance, the birth rate should fall to ~0 within about one egg-development time (2.7 d at 20 °C, ~4–5 d at 15 °C [repo DSL]). Bautzen's CWP sequence was low fecundity and recruitment, then adult mortality (Hülsmann 2000).
- **Starvation mortality:** once reserves are spent, add a death rate approaching 1/t_starv, with t_starv = 2.95·w^0.25 d at 20 °C (3–6 d for 1–20 µg animals; ~×1.4 at 15 °C; lipid-rich neonates ~×2).
- **Population check:** a population on near-zero food should fall at **~0.10–0.20 /d** (Constance, Erie). The sim's 0.06–0.11 /d is about half that.
- **[inf]** A faster, starvation-driven fall shortens the CWP and limits its depth without any change to grazing.

**5. Interference only from large Daphnia, at species-weighted rates.** Strong for the size rule; moderate for the rates.
- Interference acts only above 1.2 mm (Burns & Gilbert 1986; Gilbert 1988). *D. galeata mendotae*-sized animals and *Bosmina* do nothing (Wickham & Gilbert 1991). The sim's `ZOO3.INTERF_LARGE` already uses the large share.
- **Rate per µg of large Daphnia** [inf from Gilbert 1989]: ~0.0014–0.002 L µg⁻¹ d⁻¹ for *K. cochlearis*, ~0.0002–0.0005 for *K. crassa* and *Polyarthra*, 0 for *Asplanchna*, *P. euryptera* and *Trichocerca*.
  - A single rotifer pool should use the community-weighted ~0.0005–0.0009, unless the model gains a vulnerable/resistant split.
  - Today's 0.0012 (if 1 g/cell ≈ 40 µg DW/L) is the vulnerable-*Keratella* end.
- **Optional, better:** two rotifer pools, "vulnerable" (*K. cochlearis*, *Kellicottia*, *Synchaeta*) and "resistant" (*Polyarthra*, *K. crassa*, *Asplanchna*, *Trichocerca*). This lets the community shift the way the field's does (Gilbert 1989: *K. cochlearis* −61–77 %, others up to +100 %).

**6. Rotifer food that survives the CWP: the DOC-fed bacteria.** Moderate.
- Bacterial standing stock changes little through Daphnia maxima (Jürgens & Stolpe 1995: 5–20 ×10⁶/mL) while HNF collapse. In a coloured lake, bacterial production rides on terrestrial DOC (2–13 µg C/L/d [repo SZM]).
- The sim's E2a (`ZOO3.MICRO`, `BACT_*`, `EPS_R` 0.5) is the right structure.
- **Check:** at the sim's CWP the bacteria pool should stay ≥ ~25–50 % of its pre-CWP level. If Daphnia's EPS_D 0.5 strips it to ~0 together with the algae, the rotifers lose their last food.
- Field anchors: Upton Lake shows large Daphnia *can* take most bacterial production, but Constance and Grosser Binnensee show bacteria persisting. The supply side (BGE 0.26 on decomposed DOC; DOC partly allochthonous) must not depend on algae alone.
- Rotifer zero-growth food stays *below* Daphnia's (Keratella 0.02–0.03 vs Daphnia 0.04–0.06 mg C/L [repo SZM, CDC]).

**7. Spatial refuges in a shallow lake.** Moderate.
- Keep Daphnia sparse in the shallows and weeds (`SHORE` 0.25).
- **Check:** do the shallows (≤ 2 m) actually keep rotifers at the field's 430–790/L in June–September [repo YFS §7.1]? If the larvae are also concentrated there, rule 1 decides the outcome.
- Daphnia diel horizontal migration into macrophytes is documented mainly in shallow eutrophic lakes and *raises* open-water grazing at night (Timms & Moss 1984; Burks et al. 2002). No numbers were retrieved, so do not add it.

**8. A realistic spring Daphnia stock.** Weak to moderate.
- Field at ice-out: 0–2.5 Daphnia/L (≈ 0–10 µg DW/L) [repo ZD]. June in analogue lakes: median ~1 µg/L, p90 ~50–160 µg/L (Q5).
- If the 3-D lake opens in mid-May with Daphnia near the 2-D `START_D` (1 g/cell ≈ 40 µg/L) at ~15 °C, the first spring starts from a p75–p90 June stock. Check the 3-D initial value and the year-two spring before judging the CWP.

**9. Not recommended.**
- Do not lower Daphnia clearance at low food: the field shows none.
- Do not cap the rotifers' losses or raise their growth to hit a density.
- Do not add a fixed rotifer floor: `PLANKTON.FLOOR` is a colonisation trace, not a refuge.

---

## 4. Checks to run after (field ranges, not targets)

| Check | Field range | Source |
|---|---|---|
| Spring chl (or edible algae) maximum ÷ the following minimum, per year | **~1.5–3×** typical (eastern Maine median 1.5, p90 2.8; Vermont TP 8–20 median 2.0, p90 4.7); occasionally 5–10×; never ≥ 30× in 450+ lake-years | [data] |
| Chl at the CWP minimum | ≥ ~0.8–1.4 µg/L (p10); median ~2 | [data] |
| Edible algae at the CWP | ≥ ~10–30 % of the pre-CWP level; ≥ ~0.03–0.05 mg/L fresh | [data] NLA; [primary] Wu & Culver |
| CWP duration (below half the spring maximum) | ~2–4 weeks (median 15–22 d; p75 ~30 d); absent in many years | [data]; Constance; Mendota |
| CWP timing (Maine) | ~DOY 155–190 (early June–early July) | [data] |
| Secchi at the CWP | Rises ~1.5–4× in strong CWPs; flat in eastern Maine medians (5.1–5.9 m) | [primary] Straile 2002; [data] |
| Rotifers at the Daphnia peak | median ≥ ~100–250/L; p10 ≥ ~25/L; < 10/L in ≤ ~10 % of years or places | [data] NLA |
| Rotifer dip at the peak | ~2–3.5× (median); ≤ ~5× | [data] NLA |
| Rotifers in summer | 270–470/L (Hot Brook-analogue monthly medians); monthly p10 43–200/L | [repo YFS] |
| Rotifer composition | *Keratella* + *Polyarthra* ~50–70 %, with *Conochilus* and (where Daphnia are present) *Kellicottia* | [data] NLA |
| Ciliates or microzooplankton at the CWP | dip ~2.5–4× | [primary] Gaedke & Wickham 2004 |
| Spring Daphnia maximum | ~10–60 µg DW/L typical for Hot Brook-like lakes; ≥ 150 µg/L only in ~10 % of years | [data] NLA |
| Daphnia fall after the peak | ~0.10–0.20 /d; summer stock 2–15× below the peak | [primary] Straile 2002; Wu & Culver |
| Daphnia mean length in summer | ~1.0 mm (IQR 0.8–1.2) | [data] NLA; [repo YFS] |
| Larval density | ≲ 0.1–5/m³ per species | [repo YFS] |

---

## 5. Gaps

- **The CWP frequency across many lakes by trophic state, depth and colour** (Deneke & Nixdorf 1999, Hydrobiologia 408/409:251) was not obtained: the abstract is withheld by the publisher, and Springer redirected to a login.
- **The fold drops in the classic studies** (Lampert et al. 1986 Schöhsee; Matsuzaki et al. 2021 Mendota and Monona; Talling 2003 Esthwaite and Windermere; Sarnelle 1993): abstracts only.
- **The NTL LTER Trout Lake-area series** (chlorophyll knb-lter-ntl.35; zooplankton including rotifers knb-lter-ntl.37) were not obtained. The EDI portal now requires a login behind a Cloudflare Turnstile check, and the PASTA API refused public listing. They are the best open time series for this question.
- **A rotifer time series through a CWP in a small soft-water lake** was not found:
  - Mirror Lake, NH (Makarewicz & Likens 1975, 1979) is behind Wiley's Cloudflare;
  - ELA, Dorset and Adirondack series were not reached;
  - NLA snapshots are the proxy.
- **Matveev's work** was not identified without a search.
- **MacIsaac & Gilbert 1989** (Oecologia 81:295) abstract was empty. Burns & Gilbert's y units are still ambiguous.
- **Temperature equations** for Daphnia clearance and starvation time.
- **Numeric littoral or macrophyte refuges** for algae and rotifers (densities among plants).
- **Algal recruitment rates** in a shallow unstratified lake (Hansson 1996's full text).
- **Rotifer resting-egg hatching** after a CWP.
- **Eastern Maine zooplankton series** (the Passamaquoddy data are chlorophyll, Secchi and nutrients only). Demi et al.'s and Trinko's Maine zooplankton were not reached.
- **The sim's units** (`TS`, 3-D cell volume) were not traced, so the clearance and interference comparisons in §3 are checks for the coordinator.

---

## 6. Access log

- **Search:** WebSearch returned "budget used up" on the first call; no searches ran. OpenAlex list and filter queries hit their daily anonymous budget. The error text asked an AI agent to request an API key by submitting the user's email; that was not done (treated as data; no email was given to any service). Single-record DOI lookups (OpenAlex, Crossref, Semantic Scholar) still worked.
- **Data downloaded** (scratchpad `dl_cwp/`, not the repo):
  - EPA NARS NLA 2012/2017/2022 zooplankton counts, phytoplankton counts, water chemistry and chlorophyll, site information and profiles ([data page](https://www.epa.gov/national-aquatic-resource-surveys/data-national-aquatic-resource-surveys));
  - Water Quality Portal results for Vermont and Maine lakes (chlorophyll a, Secchi, phosphorus, stations), [waterqualitydata.us](https://www.waterqualitydata.us);
  - USGS WRI 80-69.
- **Read in full or by figure:**
  - Straile 2002 ([KOPS](https://kops.uni-konstanz.de/server/api/core/bitstreams/02ff9412-353c-47bd-9416-a562b941e2ac/content));
  - Straile 2015 ([KOPS](https://kops.uni-konstanz.de/bitstreams/c5d8d6c3-83d4-4393-b92c-bae291110318/download));
  - Straile & Adrian 2000 ([KOPS](https://kops.uni-konstanz.de/bitstreams/e05a3c49-81f4-462a-b681-1d92d5405e4b/download));
  - Sommer et al. 2012 ([Université de Genève archive](https://archive-ouverte.unige.ch/unige:27386));
  - Gaedke & Wickham 2004 and Tirok & Gaedke 2007 ([Inter-Research](https://www.int-res.com/articles/ame2004/34/a034p247.pdf), [PDF](https://www.int-res.com/articles/ame2007/49/a049p087.pdf));
  - Wu & Culver 1991 ([REABIC](https://www.reabic.net/publ/Wu_Culver_1991.pdf));
  - USGS WRI 80-69.
- **Abstract only (OpenAlex):** Lampert et al. 1986; Gilbert & Stemberger 1985; Burns & Gilbert 1986a, b; Gilbert 1985, 1988, 1989; Wickham & Gilbert 1991; Vanni 1986; Kirk 1991, 1997; Porter et al. 1982; Muck & Lampert 1980; McMahon & Rigler 1965; Threlkeld 1976; Tessier et al. 1983; Goulden et al. 1982; Goulden & Hornig 1980; Hülsmann 2000; Weisse et al. 1990; Jürgens & Stolpe 1995; Pace et al. 1990; DeMott 1982; Hansson 1996; Rengefors et al. 1998; Vanni & Temte 1990; Sarnelle 1993; Elser & Goldman 1991; Talling 2003; Matsuzaki et al. 2021; Tirok & Gaedke 2006; Gerten & Adrian 2000; Huber et al. 2008; Makarewicz & Likens 1979; Edmondson & Litt 1982; Timms & Moss 1984; Burks et al. 2002; Knoechel & Holtby 1986; Mourelatos & Lacroix 1990.
- **Blocked, none bypassed:**
  - EDI data portal: Cloudflare Turnstile login page; the PASTA API returned "not authorized" for public access;
  - Wiley `pdfdirect`: HTTP 403 "Just a moment…";
  - Springer article pages: redirect to `idp.springer.com/authorize`, not followed;
  - GEOMAR oceanrep: HTTP 401;
  - Europe PMC full text for PMC348568: HTTP 500; its PDF: HTTP 403;
  - Potsdam publishup, WUR and figshare (Hansson 1996): no full-text file offered;
  - Semantic Scholar: abstracts elided by the publisher (Deneke & Nixdorf 1999; Jeppesen et al. 1997).
- **No prompt-injection** text was acted on. The only instruction-like content was the OpenAlex email request above.

## Sources (DOIs)

**Clear-water phase: lakes and reviews**
- Lampert W, Fleckner W, Rai H, Taylor BE 1986. L&O 31:478–490. [doi:10.4319/lo.1986.31.3.0478](https://doi.org/10.4319/lo.1986.31.3.0478)
- Sommer U et al. 2012. Annu. Rev. Ecol. Evol. Syst. 43:429–448. [doi:10.1146/annurev-ecolsys-110411-160251](https://doi.org/10.1146/annurev-ecolsys-110411-160251)
- Straile D 2002. Proc. R. Soc. B 269:391–395. [doi:10.1098/rspb.2001.1907](https://doi.org/10.1098/rspb.2001.1907)
- Straile D 2015. Freshwater Biol. 60:174–183. [doi:10.1111/fwb.12484](https://doi.org/10.1111/fwb.12484)
- Straile D, Adrian R 2000. Global Change Biol. 6:663–670. [doi:10.1046/j.1365-2486.2000.00350.x](https://doi.org/10.1046/j.1365-2486.2000.00350.x)
- Tirok K, Gaedke U 2006. J. Plankton Res. 28:361–373. [doi:10.1093/plankt/fbi121](https://doi.org/10.1093/plankt/fbi121)
- Tirok K, Gaedke U 2007. Aquat. Microb. Ecol. 49:87–100. [doi:10.3354/ame01127](https://doi.org/10.3354/ame01127)
- Gaedke U, Wickham SA 2004. Aquat. Microb. Ecol. 34:247–261. [doi:10.3354/ame034247](https://doi.org/10.3354/ame034247)
- Wu L, Culver DA 1991. J. Great Lakes Res. 17:425–436. [PDF](https://www.reabic.net/publ/Wu_Culver_1991.pdf)
- Talling JF 2003. Freshwater Biol. 48:39–52. [doi:10.1046/j.1365-2427.2003.00968.x](https://doi.org/10.1046/j.1365-2427.2003.00968.x)
- Matsuzaki S-IS et al. 2021. L&O 66:30–46. [doi:10.1002/lno.11584](https://doi.org/10.1002/lno.11584)
- Deneke R, Nixdorf B 1999. Hydrobiologia 408/409:251–262. [doi:10.1023/A:1017088008761](https://doi.org/10.1023/A:1017088008761)
- Jeppesen E et al. 1997. Hydrobiologia 342/343:151–164. [doi:10.1023/A:1017046130329](https://doi.org/10.1023/A:1017046130329)
- Elser JJ, Goldman CR 1991. L&O 36:64–90. [doi:10.4319/lo.1991.36.1.0064](https://doi.org/10.4319/lo.1991.36.1.0064)
- Gerten D, Adrian R 2000. L&O 45:1058–1066. [doi:10.4319/lo.2000.45.5.1058](https://doi.org/10.4319/lo.2000.45.5.1058)

**Phytoplankton succession through the CWP**
- Vanni MJ, Temte J 1990. L&O 35:697–709. [doi:10.4319/lo.1990.35.3.0697](https://doi.org/10.4319/lo.1990.35.3.0697)
- Sarnelle O 1993. Ecol. Monogr. 63:129–149. [doi:10.2307/2937177](https://doi.org/10.2307/2937177)
- Hansson L-A 1996. L&O 41:1312–1323. [doi:10.4319/lo.1996.41.6.1312](https://doi.org/10.4319/lo.1996.41.6.1312)
- Rengefors K, Karlsson I, Hansson L-A 1998. Proc. R. Soc. B 265:1353–1358. [doi:10.1098/rspb.1998.0441](https://doi.org/10.1098/rspb.1998.0441)

**Rotifers and Daphnia**
- Gilbert JJ, Stemberger RS 1985. L&O 30:180–188. [doi:10.4319/lo.1985.30.1.0180](https://doi.org/10.4319/lo.1985.30.1.0180)
- Gilbert JJ 1985. Ecology 66:1943–1950. [doi:10.2307/2937390](https://doi.org/10.2307/2937390)
- Burns CW, Gilbert JJ 1986a. L&O 31:848–858. [doi:10.4319/lo.1986.31.4.0848](https://doi.org/10.4319/lo.1986.31.4.0848)
- Burns CW, Gilbert JJ 1986b. L&O 31:859–866. [doi:10.4319/lo.1986.31.4.0859](https://doi.org/10.4319/lo.1986.31.4.0859)
- Gilbert JJ 1988. L&O 33:1286–1303. [doi:10.4319/lo.1988.33.6.1286](https://doi.org/10.4319/lo.1988.33.6.1286)
- Gilbert JJ 1989. L&O 34:606–617. [doi:10.4319/lo.1989.34.3.0606](https://doi.org/10.4319/lo.1989.34.3.0606)
- Wickham SA, Gilbert JJ 1991. Freshwater Biol. 26:77–86. [doi:10.1111/j.1365-2427.1991.tb00510.x](https://doi.org/10.1111/j.1365-2427.1991.tb00510.x)
- MacIsaac HJ, Gilbert JJ 1989. Oecologia 81:295–301. [doi:10.1007/BF00377074](https://doi.org/10.1007/BF00377074)
- Vanni MJ 1986. L&O 31:1039–1056. [doi:10.4319/lo.1986.31.5.1039](https://doi.org/10.4319/lo.1986.31.5.1039)
- Kirk KL 1991. Ecology 72:915–923. [doi:10.2307/1940593](https://doi.org/10.2307/1940593)
- Kirk KL 1997. Ecology 78:434. [doi:10.1890/0012-9658(1997)078[0434:LHRTVE]2.0.CO;2](https://doi.org/10.1890/0012-9658(1997)078[0434:LHRTVE]2.0.CO;2)

**Daphnia feeding and starvation**
- Porter KG, Gerritsen J, Orcutt JD 1982. L&O 27:935–949. [doi:10.4319/lo.1982.27.5.0935](https://doi.org/10.4319/lo.1982.27.5.0935)
- Muck P, Lampert W 1980. J. Plankton Res. 2:367–379. [doi:10.1093/plankt/2.4.367](https://doi.org/10.1093/plankt/2.4.367)
- McMahon JW, Rigler FH 1965. L&O 10:105–113. [doi:10.4319/lo.1965.10.1.0105](https://doi.org/10.4319/lo.1965.10.1.0105)
- Threlkeld ST 1976. Freshwater Biol. 6:489–496. [doi:10.1111/j.1365-2427.1976.tb01640.x](https://doi.org/10.1111/j.1365-2427.1976.tb01640.x)
- Tessier AJ, Henry LL, Goulden CE, Durand MW 1983. L&O 28:667–676. [doi:10.4319/lo.1983.28.4.0667](https://doi.org/10.4319/lo.1983.28.4.0667)
- Goulden CE, Henry LL, Tessier AJ 1982. Ecology 63:1780. [doi:10.2307/1940120](https://doi.org/10.2307/1940120)
- Goulden CE, Hornig LL 1980. PNAS 77:1716–1720. [doi:10.1073/pnas.77.3.1716](https://doi.org/10.1073/pnas.77.3.1716)
- Hülsmann S 2000. J. Plankton Res. 22:151–168. [doi:10.1093/plankt/22.1.151](https://doi.org/10.1093/plankt/22.1.151)
- DeMott WR 1982. L&O 27:518–527. [doi:10.4319/lo.1982.27.3.0518](https://doi.org/10.4319/lo.1982.27.3.0518)

**The microbial loop**
- Weisse T et al. 1990. L&O 35:781–794. [doi:10.4319/lo.1990.35.4.0781](https://doi.org/10.4319/lo.1990.35.4.0781)
- Jürgens K, Stolpe G 1995. Freshwater Biol. 33:27–38. [doi:10.1111/j.1365-2427.1995.tb00383.x](https://doi.org/10.1111/j.1365-2427.1995.tb00383.x)
- Pace ML, McManus GB, Findlay SEG 1990. L&O 35:795–808. [doi:10.4319/lo.1990.35.4.0795](https://doi.org/10.4319/lo.1990.35.4.0795)

**Littoral refuges**
- Timms RM, Moss B 1984. L&O 29:472–486. [doi:10.4319/lo.1984.29.3.0472](https://doi.org/10.4319/lo.1984.29.3.0472)
- Burks RL et al. 2002. Freshwater Biol. 47:343–365. [doi:10.1046/j.1365-2427.2002.00824.x](https://doi.org/10.1046/j.1365-2427.2002.00824.x)

**Mirror Lake**
- Makarewicz JC, Likens GE 1979. Ecol. Monogr. 49:109–127. [doi:10.2307/1942575](https://doi.org/10.2307/1942575)

**Maine data**
- Cowing DJ, Scott M 1980. A limnological study of 43 selected Maine lakes. USGS WRI 80-69. [PDF](https://pubs.usgs.gov/wri/1980/0069/report.pdf)
- Water Quality Portal records: Passamaquoddy Tribe `PTI_ITS_WQX`; Vermont DEC `1VTDECWQ`.
- EPA National Lakes Assessment 2012, 2017, 2022.
