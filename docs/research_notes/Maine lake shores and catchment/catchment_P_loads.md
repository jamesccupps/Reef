# Catchment phosphorus loads to small coloured Maine lakes: forms, storms, bioavailability, inlet fate and retention

Scope: the phosphorus that small forested and wetland streams deliver to small coloured lakes in Maine, the northeastern US and eastern Canada. The aim is to re-base the inflow chemistry of Upper and Lower Hot Brook Lake (Danforth/Weston), which the sim currently feeds about 14 µg/L total P with 94 % of it as dissolved phosphate.

The lakes as the sim has them:
- coloured (an estimated 30–60 Pt-Co) and mesotrophic;
- shallow and unstratified, with mean depths of 3.0 m (Upper) and 2.55 m (Lower);
- residence times of about 100 and 55 days;
- watersheds of about 66 and 77 km² of managed spruce–fir forest with wetlands.

Region flags on every number: **[ME-N]** northern/eastern Maine, **[ME]** elsewhere in Maine, **[NE]** other New England and New York, **[CA]** eastern Canada (Ontario/Quebec Shield, Maritimes), **[N-temp]** other northern temperate. Evidence flags: (full text), (abstract), (my computation) and **(not opened)**. "Not opened" marks a standard value or formula I am quoting from the literature as it is usually cited, without re-reading the source this session; verify those before relying on them.

Method notes (read these before the numbers):
- **The web search budget for the turn was exhausted before this note began.** Everything below came from direct fetches of known publications and government data services. Wiley/AGU/ASLO, Canadian Science Publishing, ScienceDirect, RSC and maine.gov all returned HTTP 403 to the fetch tool, and I did not try to get around those blocks. So Dillon & Molot 1997, Eimers et al. 2009 (Dorset), Kirchner & Dillon 1975, Larsen & Mercier 1976, Nürnberg 1984, Brett & Benjamin 2008, Ellison & Brett 2006, DePinto/Young/Sonzogni, and the Maine DEP TMDLs could not be opened. They are flagged where used.
- **Several key numbers are my own computations from USGS discrete samples** ([USGS Samples Data API](https://api.waterdata.usgs.gov/samples-data/results/narrow?monitoringLocationIdentifier=USGS-01434025&usgsPCode=00665&mimeType=text/csv)) **joined to daily flows** ([NWIS daily values](https://waterservices.usgs.gov/nwis/dv/?format=rdb&sites=01434025,01054200,01022500,01030350,01021480,01017550&parameterCd=00060&statCd=00003)). Three sites were used:
  - **Narraguagus River at Cherryfield** (01022500; 588 km², eastern Washington Co., coloured, DOC median 9 mg/L) [ME-N];
  - **Wild River at Gilead** (01054200; 180 km², White Mountains forest, DOC median 3.3 mg/L) [ME];
  - **Biscuit Brook** (01434025; 9.6 km², forested Catskills, intensively storm-sampled 1983–2011) [NE].
- **How the computations were done.**
  - C–Q exponents b (C ∝ Q^b) are maximum-likelihood fits of log C on log(Q/Q̄) that treat non-detects as censored (Tobit), not by deleting them.
  - Flow-weighted mean concentrations (FWMC) and event shares come from applying each fit to the daily flow record, with a lognormal bias correction.
  - PP = TP − TDP, and DOP = TDP − SRP.
  - Daily mean flows understate within-day storm peaks, so these event shares are conservative.
- The old USGS samples (1970s–80s) were reported to 0.01 mg/L, which is coarse for these waters. The Biscuit Brook and post-2010 Wild River samples have 1–6 µg/L detection limits.

Hydrology used throughout (my arithmetic from the stated depths and residence times, with lake areas of 912 and 713 acres from the hydrology note):

| | Area | Volume | Mean outflow | Areal water load qs | Flushing ρ | Unit runoff |
|---|---|---|---|---|---|---|
| Upper | 3.69 km² | 11.1 Mm³ | 1.28 m³/s | 11.0 m/yr | 3.65 /yr | 0.61 m/yr |
| Lower | 2.89 km² | 7.4 Mm³ | 1.55 m³/s | 16.9 m/yr | 6.64 /yr | 0.64 m/yr |

The runoff matches the regional 0.58–0.71 m/yr (weather_and_catchment_hydrology.md §2), which only works if Lower's 77 km² includes Upper's 66 km². In that case about 83 % of Lower's inflow is Upper's outflow and 17 % comes from about 11 km² of local brooks.

---

## 1. Concentrations of total, dissolved-reactive, dissolved-organic and particulate P in small forested/wetland streams

### Takeaway
Northeastern forested streams carry little phosphate.
- **SRP is usually 1–3 µg/L, and at or below detection most of the time, even in storms.** Flow-weighted SRP is about 2–3 µg/L.
- **Total P is about 4–10 µg/L at baseflow and 20–60 µg/L in storms**, with rare peaks of 100–440 µg/L in steep catchments.
- **Flow-weighted annual TP is about 10–16 µg/L.** The regional reference (25th-percentile) stream TP is 5–12 µg/L.

In coloured, wetland-rich and lake-buffered catchments, most TP is **dissolved organic P**:
- about two-thirds of TP is dissolved;
- 79 % in undisturbed boreal catchments, "mainly organic";
- DOP 50–95 % of TP in a New Hampshire forest brook.

In steep, clear, flashy catchments most of the annual load is **particulate**, about 70 % at Biscuit Brook, and nearly all of it moves in storms.

The sim's inflow, 94 % phosphate (≈13 µg/L SRP), has about 5× the regional flow-weighted SRP and 4–6× typical baseflow SRP. The total of about 14 µg/L, by contrast, is inside the regional range.

### Cited Findings
**Bear Brook Watershed in Maine [ME]** (acidified research catchment, eastern Maine).
- During high-discharge episodes (December 2001, February 2002), dissolved P stayed ≤ 0.1 µmol/L (≤ 3 µg/L) in both streams.
- Total P rose with discharge, reaching 1.7 µmol/L (≈ 53 µg/L) on the rising limb in treated West Bear, about 5× reference East Bear (so about 10 µg/L there).
- Total Al, Fe and P were positively correlated with discharge and fell together after the peak. The authors conclude that particulate Al, Fe and P are chemically linked in transport at high flow.
- Source (abstract): [Reinhardt, Norton, Handley & Amirbahman 2004, Water Air Soil Pollut: Focus 4:311](https://link.springer.com/article/10.1023/B:WAFO.0000028362.48966.17)

**Hubbard Brook, NH [NE]** (northern hardwood forest).
- Stream dissolved P export is about 0.01 kg P ha⁻¹ yr⁻¹, roughly 70 % inorganic phosphate and the rest DOP. Particulate P export is also about 0.01 kg ha⁻¹ yr⁻¹, about one-third organic and two-thirds mineral particles. Total stream loss is about 0.02 kg ha⁻¹ yr⁻¹.
- Soluble reactive P has been "at or near detection limits" in long-term records of WS1 and WS6.
- Most PP export happens in episodic high-flow events and probably comes largely from stream channels.
- The equilibrium P concentration of typical stream sediments is 2 µg P/L, and stream sediments adsorb P above it (Meyer & Likens 1979).
- Source (full text): [Hubbard Brook synthesis book, ch. 14 Phosphorus](https://hbr-lter.github.io/synthesisbook/Phosphorus.html); [ch. 15 Stream Ecosystems](https://hbr-lter.github.io/synthesisbook/StreamEcosystems.html)

**Livermore Cove Brook, Squam Lake tributary, NH [NE]** (1.77 km², 91.7 % forest, 3.4 % wetland; hourly sampling of three storms of 20–42 mm).
- "Most of TP is in the form of DOP, at all times, fluctuating between 95% (baseflow) to 50% (event flow)."
- TPP rose to as much as 46 % of TP in high event flows.
- SRP was about 15–20 % of TP at baseflow and a smaller share in events, and lagged discharge (a groundwater source). The baseflow shares as printed sum to more than 100 %.
- The three storms carried 0.009 kg TP/ha, 5–10 % of the annual TP yield. That implies an annual yield of about 0.09–0.18 kg ha⁻¹ yr⁻¹ (my arithmetic).
- Source (full text, conference poster): [Shrestha, Green & Boyer 2017, Plymouth State](https://plymouth.edu/sites/default/files/media/2023-12/phosphorus-transport-to-squam-lake-during-storm-events.pdf)

**Narraguagus River at Cherryfield, 1978–86 [ME-N]** (coloured; DOC median 9.0 mg/L, 10th–90th percentile 6.3–17.6) (my computation).
- TP: n = 59, 13 below 10 µg/L. Median 10 µg/L, 90th percentile 30, maximum 110.
- SRP was below 10 µg/L in 25 of 27 samples, and TDP below 10 µg/L in 34 of 56.
- TP shows no trend with flow (b ≈ 0).
- FWMCs: TP 15 µg/L; TDP 10 µg/L (68 % of TP); PP by difference about 5 µg/L (32 %); suspended sediment 9 mg/L (median 5).

**Wild River at Gilead [ME]** (my computation).
- 2010–2026: SRP was below the 4 µg/L detection limit in 162 of 171 samples, with an FWMC of about 2.4 µg/L.
- TP by flow class:
  - 17 of 21 samples below 4 µg/L when daily flow was under 0.5 × Q̄;
  - median 86 µg/L (maximum 186) at 2–5 × Q̄;
  - median 29 µg/L at over 5 × Q̄ (n = 7).
- Source: [USGS Samples Data](https://api.waterdata.usgs.gov/samples-data/results/narrow?monitoringLocationIdentifier=USGS-01054200&usgsPCode=00665&mimeType=text/csv)

**Biscuit Brook, 1983–2011 [NE]** (611 TP, 566 TDP and 761 SRP samples; my computation).
- Detected TP: median 8, 90th percentile 58, 99th percentile 240, maximum 440 µg/L.
- Median TP by flow class rose from 4 µg/L (under 0.5 × Q̄) to 14 µg/L (over 5 × Q̄). TDP stayed at 4–5 µg/L throughout.
- PP/TP rose from 0.18 at low flow to 0.71 above 5 × Q̄.
- FWMCs: TP 15.6, TDP 4.3, SRP 2.9 µg/L, so PP ≈ 11.3 (72 %), DOP ≈ 1.4 (9 %) and SRP ≈ 18 %.
- Source: [USGS Samples Data](https://api.waterdata.usgs.gov/samples-data/results/narrow?monitoringLocationIdentifier=USGS-01434025&usgsPCode=00665&mimeType=text/csv)

**PP content of suspended sediment** (my computation from the FWMCs above). It is the same at both sites: about 0.5 mg P per g of suspended sediment.
- Narraguagus: 4.9 µg/L PP ÷ 9.2 mg/L SSC = 0.53 mg P/g.
- Biscuit Brook: 11.3 ÷ 20.1 = 0.56 mg P/g.

**Undisturbed boreal catchments, Finland [N-temp]** (21 catchments of 0.07–14 km², peatland 0–88 %, mean 34 %; the best analogue found for wetland-rich coloured catchments).
- Mean TP export was 5 kg km⁻² yr⁻¹. About 79 % of TP was dissolved, and P was "exported mainly in organic form".
- In 18 low-deposition catchments, slope was the best single predictor of TP export (r² = 0.56).
- TOC export explained 61–73 % of the variance in TP export, so P rides with the coloured organic matter.
- Source (abstract): [Kortelainen et al. 2006, Aquatic Sciences 68:453](https://link.springer.com/article/10.1007/s00027-006-0833-6)

**EPA reference stream TP, Nutrient Ecoregion VIII [ME/NE]** (the 25th percentile of all streams, which EPA uses as a reference condition).
- Aggregate ecoregion: 10 µg/L.
- Subecoregion 58, Northeastern Highlands: 5 µg/L (149 streams; range 2–450).
- Subecoregion 82, Laurentian Plains and Hills (most of interior northern and eastern Maine; that it includes Danforth is my reading of the ecoregion map): 12 µg/L (only 6 streams; 10–34).
- Source (full text): [EPA 822-B-01-015, Ambient Water Quality Criteria Recommendations, Rivers and Streams in Nutrient Ecoregion VIII](https://www.epa.gov/sites/default/files/documents/rivers8.pdf)

**Export coefficients, for scale** (land_lake_subsidies.md §7 has the Maine DEP set: forest 0.04, wetland 0.10–0.20, harvested forest 0.40 kg ha⁻¹ yr⁻¹).
- New England SPARROW: forested land delivers 13.4 ± 3.8 kg km⁻² yr⁻¹ to streams. This is the report's text; in my PDF text extraction, Table 4's coefficient rows came out offset by one from their labels. — [Moore et al. 2004, USGS SIR 2004-5012](https://pubs.usgs.gov/sir/2004/5012/SIR2004-5012_report.pdf) (full text)
- Northeast SPARROW: natural mineral sources supply 11.0 kg km⁻² yr⁻¹ (90 % CI 8.0–14.1). Previous estimates for forest are 11.4 (Northeast) and 13.4 (New England). — [Ator 2019, USGS SIR 2019-5118](https://pubs.usgs.gov/sir/2019/5118/sir20195118.pdf) (full text)
- Ontario Shield forest: about 4.7 mg m⁻² yr⁻¹ on igneous geology and 11.7 on sedimentary (Dillon & Kirchner 1975). (not opened)
- After whole-tree harvest at Hubbard Brook, stream P losses were about 0.2 kg/ha over 3 years and returned to reference after 4–5 years. — [HB synthesis ch. 14](https://hbr-lter.github.io/synthesisbook/Phosphorus.html) (full text)

### Inferences for the sim
- **A flow-weighted TP_in of about 13 µg/L (range 8–20)** for the Upper lake's forest and wetland brooks.
  - Cross-check: 66 km² × about 0.08 kg ha⁻¹ yr⁻¹ ≈ 525 kg/yr. That rate lies between the Maine DEP coefficients and SPARROW's forest yield. Divided by 1.28 m³/s, it gives ≈ 13 µg/L.
  - The sim's 14 µg/L total is therefore defensible. Its 94 % SRP is not.
- **Annual load split by form** for a coloured, wetland, low-relief catchment (weighted toward Narraguagus, Squam and Finland rather than the flashy Biscuit Brook):
  - SRP about 15 % (≈ 2 µg/L FWMC; range 10–25 %);
  - DOP about 45 % (≈ 6 µg/L; range 30–60 %);
  - PP about 40 % (≈ 5 µg/L; range 25–60 %).
- **Baseflow vs storm composition:**
  - Baseflow: TP about 5–8 µg/L, roughly 20 % SRP (≈ 1–2 µg/L), 65 % DOP and 15 % PP.
  - Storm or freshet: TP about 20–60 µg/L (the sim could allow rare spikes near 100), roughly 5 % SRP, 35 % DOP and 60 % PP.
- **Carry suspended sediment with the PP.** Use an inflow SSC FWMC of about 5–10 mg/L with PP:SSC ≈ 0.5 mg P/g, so that particle settling in the lake moves the PP with it.
- **Lower lake.** About 83 % of its inflow is Upper's surface outflow, so its inflow chemistry should be Upper's lake water: TP ≈ Upper's lake TP, mostly algal and detrital PP plus DOP, with SRP ≤ 1–2 µg/L. Only the local 17 % should follow the brook recipe above.

### Gaps
- No measured stream P exists for any Hot Brook inflow, or for any small Washington/Aroostook County forest brook. USGS has no P samples for Old Stream (01021480), Wytopitlock or Williams Brook, and only 2–4 old samples at the Pleasant River and the St John.
- Not opened (403): Bear Brook ME load papers (Roy et al. 1999; SanClements et al.), Dorset streams (Dillon & Molot 1997; Eimers et al. 2009), Turkey Lakes, Kejimkujik and Quebec Shield streams (Prairie & Kalff 1988; Lamontagne et al. 2000). Their numbers are therefore not here.
- The Narraguagus TP has only 10 µg/L resolution, so its C–Q slope and form split are approximate.

---

## 2. Concentration–discharge (C–Q) exponents and the share of the load carried in storms

### Takeaway
Exponents b in C ∝ Q^b from the regional data:
- **PP ≈ 0.5–0.6** (up to about 1.2 in a steep mountain river);
- **suspended sediment ≈ 0.35–0.75**;
- **TP ≈ 0–0.5**: near 0 in a lake- and wetland-buffered coloured river, 0.5 in a flashy forest brook;
- **DOP ≈ 0.2, DOC ≈ 0.2–0.25**;
- **TDP and SRP ≈ 0–0.1**, i.e. chemostatic; SRP is diluted or lags in storms.

Event shares:
- On a northern Maine stream of Hot Brook's size, **the top 10 % of flow days carry about 40–47 % of the water**.
- With those exponents they carry **about 45 % of SRP, 50 % of DOP, 60–66 % of PP, 65–70 % of suspended sediment and about 55–60 % of TP**.
- At Hubbard Brook, two-thirds of annual P output left in 10 days of high flow.
- Hysteresis is clockwise for TP, PP and DOP (higher on the rising limb) and anticlockwise for SRP.

### Cited Findings
**C–Q exponents fitted with non-detects censored** (my computation; sources as in §1).
| Site | TP | TDP | SRP | PP | DOP | SSC | DOC |
|---|---|---|---|---|---|---|---|
| Biscuit Brook 1983–2011 [NE] | 0.50 (n 611) | 0.11 | 0.10 | 0.60 (n 267 pairs) | 0.22 | 0.74 (n 51) | – |
| Wild River 1970–99 [ME] | 0.05 | −0.07 | ≈0 | 0.15 (n 11) | – | 0.16 | 0.20 |
| Wild River 2010–26 [ME] | 1.2 (n 64, unstable) | – | 0.18 | – | – | 0.27 (all years) | 0.25 |
| Narraguagus 1978–86 [ME-N] | ≈0.0 | 0.11 | (non-detect) | 0.47 (n 19) | – | 0.35 (n 66) | – |

- The Wild River 1970–99 TP values were reported to 0.01 mg/L, which mutes the slope.
- Wild River colour: b = 0.29.

**Share of each constituent carried on the top 10 % of flow days.**

Biscuit Brook (fitted curves applied to 1983–2011 daily flows; my computation):
| | Water | SRP | TDP | DOP | TP | PP | SSC |
|---|---|---|---|---|---|---|---|
| Top 10 % of days | 45 % | 50 % | 51 % | 56 % | 70 % | 74 % | 79 % |

- Top 5 % of days: TP 58 %, PP 63 %.
- Top 15 % of days: TP 76 %, PP 80 %.
- Narraguagus (lake-buffered): water 36 %, TP 36 %, SSC 48 %.

**The same calculation on regional daily flows, for C ∝ Q^b** (my computation from [NWIS daily values](https://waterservices.usgs.gov/nwis/dv/?format=rdb&sites=01030350,01021480,01017550&parameterCd=00060&statCd=00003&startDT=1980-01-01&endDT=2025-12-31)):
| Gauge | Water (b = 0) | b = 0.1 | b = 0.2 | b = 0.35 | b = 0.5 | b = 0.6 | b = 0.75 |
|---|---|---|---|---|---|---|---|
| Wytopitlock Stream (127 km²) [ME-N] | 44 % | 48 % | 52 % | 58 % | 63 % | 66 % | 71 % |
| Old Stream (77 km², Washington Co.) [ME-N] | 40 % | 43 % | 47 % | 53 % | 58 % | 61 % | 66 % |
| Williams Brook (10 km²) [ME-N] | 47 % | 52 % | 57 % | 64 % | 71 % | 75 % | 80 % |

**Hubbard Brook (Bear Brook, NH) [NE].** "About two-thirds of annual P output leaves during just 10 days of high flow." On most days the stream retains P (processing mode); in floods it passes P through. — [HB synthesis ch. 15, after Meyer & Likens 1979](https://hbr-lter.github.io/synthesisbook/StreamEcosystems.html) (full text)

**Squam tributary [NE].**
- TP, TDP, TPP and DOP all had clockwise hysteresis (higher on the rising limb). SRP had anticlockwise hysteresis, from a different, groundwater source.
- Storms raise discharge, concentration and yield. — [Shrestha et al. 2017](https://plymouth.edu/sites/default/files/media/2023-12/phosphorus-transport-to-squam-lake-during-storm-events.pdf) (full text)

**Bear Brook ME [ME].** In snowmelt and rain-on-snow events, total P rose with discharge while dissolved P stayed ≤ 3 µg/L. — [Reinhardt et al. 2004](https://link.springer.com/article/10.1023/B:WAFO.0000028362.48966.17) (abstract)

**Swiss rivers [N-temp], for the general pattern.** TP shows "hydrological export" (enrichment) at high flows in about 90 % of catchments. DRP is chemostatic or diluting in most, and suspended solids enrich everywhere. — [Botter, Burlando & Fatichi 2019, HESS 23:1885](https://hess.copernicus.org/articles/23/1885/2019/) (full text, no numeric b in the text)

### Inferences for the sim
- **Inflow concentration by form:** C_f(t) = k_f · (Q(t)/Q̄)^b_f · s_f(month).
  - Choose k_f so that the annual flow-weighted mean equals the §1 target: k_f = FWMC_f · ΣQ / Σ(Q·(Q/Q̄)^b_f) over a typical year.
  - Exponents: b_SRP ≈ 0.05, b_DOP ≈ 0.2, b_PP ≈ 0.6 and b_SSC ≈ 0.5.
  - Upper's inflow brooks drain a wetland-rich 66 km², so the low end of the PP range fits; use b_PP = 0.5 with a 0.35–0.75 sensitivity range.
- **Hysteresis.** Put PP and DOP on the rising limb with an exhaustion factor: concentration at a given Q is about 1.5–2× higher rising than falling, and the first flush after a long dry spell is the largest. SRP lags flow by about a day.
- **Seasons.**
  - Freshet (April): the largest single PP and SSC pulse. Dissolved P stays low (Bear Brook).
  - Summer–autumn baseflow: SRP from groundwater at about 1–2 µg/L, and DOP rising with DOC/colour.
  - Leaf fall (October–November): a litter-leachate DOP term. Terrestrial detritus was 23 % of Bear Brook NH's P input (HB ch. 15).
- **Event share check** for an annual run: about 55–60 % of Upper's TP inflow, and about 60–70 % of its PP, should arrive on the wettest 10 % of days.

### Gaps
- No high-frequency (sub-daily) P record exists for a northern Maine brook. The event shares above use daily means and are probably low by several points.
- No DOP C–Q exists for a coloured Maine stream. The 0.2 comes from Biscuit Brook (clear water) and is consistent with DOC's 0.2–0.25 at Wild River.

---

## 3. Bioavailability of each P form to lake phytoplankton

### Takeaway
- **SRP is essentially fully available.** Below about 10 µg/L, the P that is *immediately* available can even be less than measured SRP.
- **Stream particulate P is mostly not available.**
  - Algal assays put tributary PP typically at about 10–30 % available. The NaOH-extractable fraction is the usual proxy.
  - Forest runoff ranks among the least available sources measured, alongside lake settling matter and bottom sediments.
- **Dissolved organic P in coloured water is largely unavailable on lake timescales.**
  - Much of it is high-molecular-weight humic, Fe and Al complexes.
  - USGS found that Maine lakes with colour above 30 units carry P "tied up with the color producing compounds", which degrades the TP–chlorophyll relation.
  - A working value is about 10–40 % available, released slowly by photolysis and phosphatase.

The sim's current 94 %-SRP inflow therefore delivers roughly **3× more algal-available P** than a realistic inflow with the same TP. Realistic: about 2 µg/L SRP + 0.25 × 6 DOP + 0.2 × 5 PP ≈ 4.5 µg/L bioavailable, against about 13.4.

### Cited Findings
**Boström, Persson & Broberg 1988 review [N-temp]** (abstract).
- In most studies NaOH-extractable P is the most algal-available particulate fraction, and for soil and tributary particulate matter NaOH-P often equals algal-extractable P.
- Only a minor proportion of the NaOH-P fraction was actually used in some assays.
- At low concentrations, immediately available P is often less than DRP: the abstract's figure is below 10 µg DRP/L.
- "Large fractions of dissolved P go unused and are mainly in the high molecular weight fraction."
- Source: [Hydrobiologia 170:133](https://link.springer.com/article/10.1007/BF00024902)

**Ekholm & Krogerus 2003 [N-temp, Finland]** (abstract; dual-culture algal assay on 172 samples).
- Potentially algal-available P ranged from 0 to 100 % of TP. Source means ranged from 3.4 % to 89 %.
- In descending order: rural wastewater, treated urban wastewater, dairy, chemically treated urban wastewater, field runoff, forest-industry effluent, fish-farm wastes, river water, field surface soil, **forest runoff**, lake settling matter and lake bottom sediments.
- Dissolved reactive P was highly available; particulate and dissolved unreactive P were less and variably available.
- Source: [Hydrobiologia 492:29](https://link.springer.com/article/10.1023/A:1024857626784)

**Maine coloured lakes [ME]** (full text).
- Among 43 Maine lakes, the TP–chlorophyll regression improved from r² 0.46 to 0.69 when lakes with colour above 30 units were dropped.
- "In lakes where color is greater than 30 units, phosphorus is tied up with the color producing compounds, such as humic acids, and not available for biological uptake."
- Colour hardly affected the TP–Secchi relation. Most Maine lake P was near or below the then-detection limit of 10 µg/L.
- Source: [Cowing & Scott 1980, USGS WRI 80-69](https://pubs.usgs.gov/wri/1980/0069/report.pdf)

**Bear Brook ME [ME].** In acidic high flows, stream PP travels bound to particulate Al and Fe. — [Reinhardt et al. 2004](https://link.springer.com/article/10.1023/B:WAFO.0000028362.48966.17) (abstract)

**Maine DEP practice [ME].** DEP reduced its road and shoreline-residential export coefficients "to reflect algal-available P", i.e. the state already discounts TP by availability. — land_lake_subsidies.md §7, from the Webber Pond PCAP.

**Classic algal-assay values (not opened):**
- Great Lakes tributary suspended sediments (DePinto et al. 1981; Young et al. 1985) and the Sonzogni et al. (1982) review are usually summarised as about 10–40 % of tributary PP being algal-available, most often about 20–30 %.
- Lake Erie loading work commonly uses about 26 % for PP.
- Humic Fe–P complexes in bog and humic lakes are UV-labile, releasing phosphate under sunlight (Francko & Heath 1982; Jones et al. 1988).
- I quote these from memory of the literature; verify before citing.

### Inferences for the sim
- **Bioavailable fractions:**
  - **SRP 1.0**, directly into the phosphate pool.
  - **PP 0.2** (range 0.1–0.3). Use the low end for forest PP from acidic, Al-rich Maine soils. The rest is refractory mineral or Al/Fe-bound P that goes to the bed.
  - **DOP 0.25** (range 0.1–0.4), released over weeks rather than instantly.
- **Mechanism rather than a constant.** Route inflow DOP into the existing DOM/colour pool. Release phosphate from it at a slow rate (about 0.5–2 % per day in the lit surface layer: photolysis plus phosphatase), raised when phosphate is scarce (phosphatase induction). This value is my inference.
- **Route PP to the particle pool.** Its labile 20 % (organic and NaOH-type) mineralises on the bed via the existing sedOM path. The Al/Fe-bound remainder is buried, except for an Fe-bound share that can return under low O₂ (§4).

### Gaps
- No algal-assay or NaOH-P data were found for any Maine or northern New England stream PP, and no DOP bioavailability data for coloured northeastern streams.
- Ellison & Brett 2006 (PP bioavailability vs land cover and flow), Li & Brett 2013 (DOP forms), Sonzogni 1982 and DePinto 1981 were not opened (403).

---

## 4. Fate of inflowing particulate P: settling near the inlet, passage to the outlet, internal release

### Takeaway
Sand and coarse silt, which carry little P, drop within tens to hundreds of metres of a brook mouth: the delta. PP is concentrated on the finest mineral particles (clay, fine silt) and on Al/Fe-oxide and organic coatings, and these settle at about 0.06–1.5 m/day.
- In a 2.5–3 m lake with 55–100 days' residence, **most incoming PP settles somewhere in the lake.** About half of it lands near the inlet at ordinary flows; in floods much less does, and the rest spreads lake-wide.
- **Roughly 15–30 % of the incoming PP leaves through the outlet**, more from Lower (shorter residence) and more in floods. This is an inference.
- **Internal release.** Inlet deposits are organic-rich. Their Fe-bound share can be released during warm, calm, low-O₂ spells at the sediment surface even in these polymictic lakes. The Al-bound share, likely large in acidic Maine catchments, is effectively permanent.

### Cited Findings
**SPARROW calibrations of P loss in lakes and impoundments.** Loss is modelled as an apparent settling velocity × reciprocal areal hydraulic load; it represents settling and burial of particulates plus benthic uptake.
- New England [NE/ME]: 109 m/yr (SE 64.5) for lakes and reservoirs ≤ 10 km². Loss in streams with mean flow ≤ 2.83 m³/s is 0.48 d⁻¹, a half-life of about 1.5 days. — [Moore et al. 2004](https://pubs.usgs.gov/sir/2004/5012/SIR2004-5012_report.pdf) (full text)
- Northeastern US, all impoundments [NE]: 9.84 m/yr (90 % CI 2.21–17.5). The model notes "the relatively insoluble nature of most phosphorus compounds and the consequent importance of particulate-phase transport". — [Ator 2019](https://pubs.usgs.gov/sir/2019/5118/sir20195118.pdf) (full text)

**Stream-channel source and processing [NE].** Hubbard Brook PP export comes mostly from stream channels in high-flow events. Debris dams and pools are P "hot spots", and sediments buffer dissolved P toward about 2 µg/L. — [HB synthesis ch. 14–15](https://hbr-lter.github.io/synthesisbook/StreamEcosystems.html) (full text)

**Al–Fe–P coupling in Maine [ME].** Particulate Al, Fe and P are "chemically linked" in Bear Brook storm transport. — [Reinhardt et al. 2004](https://link.springer.com/article/10.1023/B:WAFO.0000028362.48966.17) (abstract)
- Lake sediments with molar Al:Fe > 3 and Al:P > 25 are reported not to release P under anoxia (Kopáček et al. 2005, ES&T 39:8784, from work including Maine lakes). (not opened)

**Internal loading can rival external in a Maine lake [ME].** Eutrophic Webber Pond's internal sediment P release (537 kg/yr) was comparable to its whole external load (526 kg/yr). — land_lake_subsidies.md §7

**Shallow and tea-stained lakes are poorly predicted [CA].** Ontario's Lakeshore Capacity Model (calibrated on south-central Ontario Shield lakes) states that shallow lakes (mean depth under 5 m), tea-stained lakes (DOC over 10 mg/L) and lakes under 25 ha "may not model well". It assumes no long-term P retention in wetlands or river channels. — [Ontario Lakeshore Capacity Assessment Handbook, ch. 3](https://www.ontario.ca/document/lakeshore-capacity-assessment-handbook-protecting-water-quality-inland-lakes/applying-lakeshore-capacity-model) (full text)

**Stokes settling and Hazen's ideal-basin area A = Q/w for the Upper inlet** (my computation).
- Assumptions: mineral grains at Δρ = 1,650 kg/m³ and water at 10 °C. Hazen's A is the bed area needed to settle a size class fully at inflow Q; it is an idealisation that wind turbulence will spread out.
- Mean inflow 1.28 m³/s; storm 10 × Q̄.

| Grain | Settling | A at Q̄ | A at 10 × Q̄ |
|---|---|---|---|
| Fine sand 63 µm | 235 m/d | 470 m² | 4,700 m² |
| Coarse silt 20 µm | 24 m/d | 4,700 m² | 0.05 km² |
| Fine silt 5 µm | 1.5 m/d | 0.07 km² (2 % of the lake) | 0.74 km² (20 %) |
| Clay 2 µm | 0.24 m/d | 0.47 km² (13 %) | 4.7 km² (more than the whole lake) |
| Clay 1 µm | 0.06 m/d | 1.9 km² (50 %) | far more than the lake |

Settling 1-µm clay through 3 m takes about 50 days, so a large share of colloidal PP can pass through Lower (55 d) unless it flocculates. Organic floc and humic–Al–Fe flocs settle faster.

### Inferences for the sim
- **Split inflow PP by settling class at the inlet cell.** For example: 30 % fast (w ≥ 20 m/d; deposited in the delta cells), 50 % medium (about 1–2 m/d; deposited across the near-inlet basin), 20 % slow (about 0.1 m/d; lake-wide, and partly exported). Let wind mixing resuspend and spread it.
  - At mean flow this lays down about 50 % of PP within about 10 % of the lake near the mouth.
  - Floods push more PP lake-wide and to the outlet.
- **Consistency with the retention models (§5).** With PP 40 % of the load, R_PP ≈ 0.75–0.85 and dissolved-P retention ≈ 0.15–0.3 give R_TP ≈ 0.39–0.52. That brackets the empirical TP retention for these lakes.
- **Deposited PP should split three ways:**
  - labile organic P, about 20 %, into sedOM (mineralised);
  - Fe-bound P, about 20–30 %, to a redox-sensitive bed pool released when bed O₂ falls below about 1–2 mg/L in warm, calm spells;
  - Al-bound and refractory P, about 50–60 %, to permanent burial.
- **The connecting brook (Upper → Lower)** should strip little P except in its pool. SPARROW's 1.5-day half-life applies to whole small-stream networks, not a short channel.

### Gaps
- No field measurement was found of inlet-zone vs lake-wide P deposition, or of inflow-to-outflow PP passage, for a small northeastern lake.
- The particle-size distribution of PP in Maine forest streams is unknown.
- The Fe:Al:P ratios of Hot Brook sediments are unknown. Lake survey or core data would settle the release question.
- The Kopáček thresholds were not opened.

---

## 5. Phosphorus retention in small northern lakes with residence times of 0.1–0.5 years

### Takeaway
For these lakes (qs ≈ 11 and 17 m/yr; ρ ≈ 3.7 and 6.6 per year) the standard models give:
- **Upper: R ≈ 0.34–0.59, central about 0.45;**
- **Lower: R ≈ 0.28–0.49, central about 0.38.**

The New England SPARROW small-lake coefficient (109 m/yr) would give about 0.9, but its standard error is 60 % of the estimate, and the Northeast-wide 9.84 m/yr gives 0.47 and 0.37.

All of these retention coefficients are fitted to **total P** budgets (inflow TP vs outflow TP or lake TP), so they **include particulate P**, which is retained far more efficiently than dissolved P. Retention also rises with areal loading and with residence time.

A consistency check: with TP_in ≈ 13 µg/L and R ≈ 0.45, Upper's annual-mean TP is about 7 µg/L before internal loading (about 8 with direct atmospheric P). That is oligotrophic. If the lakes really are mesotrophic (10–20 µg/L), then either the inflow is nearer 18–25 µg/L (more wetland, harvesting or camps), or summer internal loading adds several µg/L. Both are plausible, and only a measurement decides.

### Cited Findings
**Retention coefficients computed for Upper and Lower** (my arithmetic).

| Model (form) | Upper (qs 11.0, τ 0.274 yr) | Lower (qs 16.9, τ 0.151 yr) | Status |
|---|---|---|---|
| Larsen & Mercier 1976: R = 1/(1+√ρ) | 0.34 | 0.28 | standard form (not opened) |
| Kirchner & Dillon 1975: R = 0.426 e^(−0.271 qs) + 0.574 e^(−0.00949 qs) | 0.54 | 0.49 | standard form (not opened) |
| Nürnberg 1984 (oxic lakes): R = 15/(18 + qs) | 0.52 | 0.43 | standard form (not opened) |
| Chapra 1975: R = v/(v + qs), v = 16 m/yr | 0.59 | 0.49 | (not opened) |
| Dillon–Kirchner settling velocity v = 12.4 m/yr | 0.53 | 0.42 | (not opened) |
| Brett & Benjamin 2008: TP = TP_in/(1 + 1.12 τ^0.47) | 0.38 | 0.32 | form recalled, not opened; verify |
| Northeast SPARROW, v = 9.84 m/yr (90 % CI 2.2–17.5) | 0.47 (0.17–0.61) | 0.37 (0.12–0.51) | full text |
| New England SPARROW, lakes ≤ 10 km², v = 109 m/yr (SE 64.5) | 0.91 | 0.87 | full text; poorly constrained |

Sources: [Ator 2019](https://pubs.usgs.gov/sir/2019/5118/sir20195118.pdf); [Moore et al. 2004](https://pubs.usgs.gov/sir/2004/5012/SIR2004-5012_report.pdf); standard forms from Kirchner & Dillon 1975 (WRR 11:182), Larsen & Mercier 1976 (JFRBC 33:1742), Nürnberg 1984 (L&O 29:111), Brett & Benjamin 2008 (Freshw. Biol. 53:194).

**54 lakes and reservoirs worldwide [N-temp]** (abstract).
- Waterbodies with higher areal P loading retained more P per m², but the retention coefficient was "largely independent" of loading.
- Longer residence times gave higher retained fractions, much more strongly in lakes over 25 km².
- Relative depth mattered only for large lakes with τ under 0.3 yr.
- Source: [Kõiv, Nõges & Laas 2011, Hydrobiologia 660:105](https://link.springer.com/article/10.1007/s10750-010-0411-8)

**93 lakes and 119 reservoirs [N-temp]** (abstract).
- Existing steady-state models predicted lake retention reasonably well but substantially under-predicted reservoir retention. Reservoirs have inflow-to-outflow P gradients (particles settling along their length).
- A recalibrated OECD-type equation (constants 1.43 and 0.88, in τ and inflow-weighted P) fitted both lakes and reservoirs.
- Source: [Hejzlar et al. 2006, Water Air Soil Pollut: Focus 6:487](https://link.springer.com/article/10.1007/s11267-006-9032-7)

**Measured central Ontario budgets [CA].** Dillon & Molot (1996, Water Research 30:2273) report long-term P budgets for the Dorset lakes and test the steady-state model, and they underlie Ontario's Lakeshore Capacity Model. (not opened; title from the [Ontario handbook's references](https://www.ontario.ca/document/lakeshore-capacity-assessment-handbook-protecting-water-quality-inland-lakes/conclusion-and-appendices))

### Inferences for the sim
- **A gate target, not a coded constant.** The sim's emergent annual TP retention (inflow TP − outflow TP, divided by inflow TP, over a full year) should land at **R ≈ 0.45 (0.35–0.55) for Upper and 0.38 (0.28–0.50) for Lower**. These numbers apply when the inflow forms and settling of §1–§4 are used.
  - A much higher value (over 0.7) would mean the inflow SRP is being taken up and buried too efficiently, or that settling is too strong.
  - A much lower value (under 0.25) would mean PP is passing through.
- **By form**, the emergent retention should be about 0.75–0.9 for PP, about 0.1–0.3 for DOP (mostly passes through), and for SRP whatever algal uptake and settling make of it.
- **Under ice** (Dec–Apr) little settles and flushing continues, so winter retention should be lower and late-summer retention higher. The models' annual R averages these.

### Gaps
- No measured TP budget or retention was found for any small Maine, New Brunswick or Nova Scotia lake with τ = 0.1–0.5 yr. National Eutrophication Survey (1970s) working papers for Maine lakes and Maine DEP TMDLs would have them, but were not reachable.
- The standard model forms are quoted from memory of the literature (not re-opened this session). The coefficients printed above are the commonly cited ones.

---

## 6. Atmospheric P deposition onto the lakes, and pollen

### Takeaway
Direct deposition onto the water is about **0.16 kg P ha⁻¹ yr⁻¹ (range 0.11–0.21), or 16 mg m⁻² yr⁻¹**, in Maine DEP practice. Bulk-collector measurements in New Hampshire are lower (0.04 kg ha⁻¹ yr⁻¹, thought to be an underestimate). A global synthesis gives 0.27.

For Upper this is about 59 kg/yr against about 525 kg/yr from the catchment, i.e. **about 10 % of the external load**. For Lower it is about 46 kg/yr. On top of this comes a **spring pollen pulse** of the same order (up to about 37 mg P m⁻² yr⁻¹ at a pine-shored Ontario lake, over about 45 days after ice-out), about half of which leaches as phosphate within days.

### Cited Findings
- Maine DEP lake TMDLs: atmospheric deposition on open water 0.16 kg ha⁻¹ yr⁻¹ (0.11–0.21) [ME]. — land_lake_subsidies.md §7 (Webber Pond PCAP, full text)
- Hubbard Brook bulk precipitation about 0.04 kg P ha⁻¹ yr⁻¹ (1972–80 concentrations) [NE]. The authors suspect it underestimates total input because dry deposition and particles are poorly sampled. Global mean 0.27 kg P ha⁻¹ yr⁻¹ (Tipping et al. 2014). — [HB synthesis ch. 14](https://hbr-lter.github.io/synthesisbook/Phosphorus.html) (full text)
- Pollen [CA], from land_lake_subsidies.md §4:
  - ELA Lake 373 received 11–56 µmol P m⁻² d⁻¹ over the 45 days after ice-out (about 37 mg P m⁻² yr⁻¹).
  - At Dorset, pine pollen is about 3 mg P/g and can be up to a third of bulk P deposition. Bulk collectors also catch insects and bird droppings, which can double apparent deposition.
  - About 50 % of pollen P leaches within days.
- Mirror Lake NH: atmospheric fallout greatly exceeded stream-derived P loading (Cole et al. 1990, via Vander Zanden & Gratton 2011) [NE]. That is a small lake with a tiny catchment, unlike Hot Brook's ratios of about 18:1 and 27:1. — land_lake_subsidies.md §4

### Inferences for the sim
- **Deposit 16 mg m⁻² yr⁻¹ on the open-water surface** during the ice-free months, plus snow-borne P released at ice-out. Treat it as about 50 % immediately available and the rest particulate or organic. That split is an inference; no Maine data on the forms was found.
- **Add the pollen pulse separately.** Late May–June, about 15–35 mg m⁻² over about 45 days, about 50 % leaching to phosphate. To avoid double counting, either lower the base atmospheric term to about 10–12 mg m⁻² yr⁻¹ when pollen is explicit, or keep 16 and add a smaller pollen increment.
- At Hot Brook's catchment-to-lake ratios, deposition matters less than at Mirror Lake but is not negligible: about 10 % of each lake's external P. For Lower: 46 kg against about 320 kg from Upper's outflow and about 110 kg from its local brooks.

### Gaps
- No Maine bulk-deposition P record, and no split of deposition into soluble and particulate forms, was found. Tipping et al. 2014 (RSC) returned 403.
- No pollen deposition has been measured on a Maine lake.

---

## Values for the sim

Concentrations are flow-weighted annual means unless stated. "Upper inflow" means the forest/wetland brooks entering Upper Hot Brook Lake. Lower's inflow is about 83 % Upper's outflow (use Upper's lake water) plus 17 % brooks on the Upper recipe.

| Quantity | Value | Range | Confidence | Basis |
|---|---|---|---|---|
| TP_in, flow-weighted (Upper inflow brooks) | **13 µg/L** | 8–20 | Medium | Narraguagus 15, Biscuit Brook 16 (my computation); EPA ecoregion 82 reference 12; export coefficients 0.05–0.13 kg ha⁻¹ yr⁻¹ ÷ 0.61 m runoff |
| TP at baseflow / in storms | 5–8 / 20–60 µg/L | storm peaks to ~100 (440 in steep catchments) | Medium | §1 sites; Bear Brook ME 10–53 µg/L in events |
| SRP share of the annual load (FWMC) | **15 % (≈2 µg/L)** | 10–25 % (1–3 µg/L) | Medium–high | SRP ≤ 3 µg/L Bear Brook ME; FWMC 2.4–2.9 at Wild River and Biscuit Brook; 15–20 % at baseflow (Squam) |
| DOP share | **45 % (≈6 µg/L)** | 30–60 % | Medium–low | 79 % dissolved, mainly organic (Finland); TDP 68 % (Narraguagus); DOP dominant (Squam); 9 % only in clear, flashy Biscuit Brook |
| PP share | **40 % (≈5 µg/L)** | 25–60 % (70 % in flashy, clear brooks) | Medium–low | Narraguagus 32 %; Hubbard Brook ~50 %; Biscuit Brook 72 % |
| Baseflow form mix (SRP/DOP/PP) | 20 / 65 / 15 % | – | Low–medium | Squam; Biscuit PP/TP 0.18 at low flow |
| Storm form mix (SRP/DOP/PP) | 5 / 35 / 60 % | PP to 70 % | Low–medium | Squam (TPP to 46 %); Biscuit PP/TP 0.71 above 5 × Q̄ |
| C–Q exponent b, PP | **0.6** | 0.45–1.2 | Medium | Biscuit 0.60; Narraguagus 0.47 |
| b, SSC | **0.5** | 0.35–0.75 | Medium | Narraguagus 0.35; Biscuit 0.74; Wild River 0.16–0.27 |
| b, DOP | **0.2** | 0.1–0.3 | Low–medium | Biscuit 0.22; DOC 0.20–0.25 at Wild River |
| b, SRP | **0.05** (chemostatic; lags flow) | −0.1 to 0.2 | Medium | Biscuit 0.10; Wild River ≈0–0.18; Squam anticlockwise |
| b, TP (emergent) | 0.3 | 0–0.5 | Medium | Narraguagus ≈0 (lake- and wetland-buffered); Biscuit 0.50 |
| Inflow SSC, flow-weighted; PP:SSC | 5–10 mg/L; **0.5 mg P/g** | 0.45–0.6 mg/g | Medium | Narraguagus 9 mg/L and 0.53; Biscuit 20 mg/L and 0.56 |
| Event share: top 10 % of flow days | water 40–45 %, SRP ~45 %, DOP ~50 %, PP 60–66 %, SSC 65–70 %, TP 55–60 % | TP to 70 %, PP to 74 % in flashy brooks | Medium | Wytopitlock and Old Stream flows × b (my computation); Biscuit 45/50/56/74/79/70 %; Hubbard Brook ⅔ of P in 10 days |
| Bioavailable fraction, SRP | 1.0 | – | High | Boström 1988; Ekholm & Krogerus 2003 |
| Bioavailable fraction, PP | **0.2** | 0.1–0.3 (low end for Al/Fe-bound forest PP) | Low–medium | NaOH-P ≈ available PP (Boström); forest runoff among the least available (Ekholm & Krogerus); classic ~20–30 % (not opened) |
| Bioavailable fraction, DOP (coloured) | **0.25**, released over weeks | 0.1–0.4 | Low | Colour > 30 → P humic-bound (Cowing & Scott, Maine); high-molecular-weight DOP unused (Boström) |
| Inflow PP settling near the inlet (within ~10 % of the lake) | **~50 % at ordinary flow**; ~20–40 % of flood loads | 30–60 % | Low | Stokes + Hazen (my computation); delta sand/silt within ≤ 0.05 km² |
| Inflow PP passing to the outlet | ~15–25 % (Upper), 25–35 % (Lower) | 10–40 % | Low | Inference; clay-size PP settles in ~50 days through 3 m |
| Deposited PP fate | ~20 % labile → sedOM; 20–30 % Fe-bound, redox-released; 50–60 % Al-bound or refractory, buried | – | Low | Bear Brook Al–Fe–P coupling; Kopáček Al:Fe / Al:P rule (not opened) |
| TP retention R, Upper (annual, emergent) | **0.45** | 0.34–0.59 | Medium | Larsen–Mercier 0.34, Brett–Benjamin 0.38, SPARROW-NE 0.47, Nürnberg 0.52, Kirchner–Dillon 0.54, Chapra 0.59 |
| TP retention R, Lower | **0.38** | 0.28–0.49 | Medium | 0.28 / 0.32 / 0.37 / 0.43 / 0.49 / 0.49 (same models) |
| Retention by form (emergent) | PP 0.75–0.9; DOP 0.1–0.3 | – | Low | Consistent with R_TP ≈ 0.4–0.5 at 40 % PP |
| Atmospheric P on open water | **16 mg m⁻² yr⁻¹** (~50 % available) | 11–21 (bulk 4; global 27) | Medium (rate); low (form split) | Maine DEP; Hubbard Brook; Tipping 2014 via HB |
| Pollen P pulse (late May–June) | 15–35 mg m⁻² over ~45 days, ~50 % leaching | to 37 | Low | ELA L373; Dorset (land_lake_subsidies.md §4) |
| Expected lake TP from the above (check) | Upper ~8, Lower ~6 µg/L before internal loading | – | Low | TP_in (1 − R) + deposition; if the lakes are mesotrophic, raise TP_in or add summer internal loading |

**Net change from the current sim:** keep TP_in near 13–14 µg/L but cut inflow SRP from about 13 µg/L to about 2 µg/L. Move the difference into DOP (about 6 µg/L, mostly unavailable and riding with colour) and into particle-borne PP (about 5 µg/L), and make both scale with flow. The sim's algal-available P supply then falls about 3× at the same TP.
