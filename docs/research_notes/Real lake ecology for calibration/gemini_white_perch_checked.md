# Gemini report on white perch, their predators and small fish: checked against the sources (Hot Brook)

Checked 2026-10-20. The source is a Google Gemini Deep Research report the user supplied: `../fetched/gemini_2026-10-20_white_perch_predators_small_fish.txt`. Each claim below was checked against the primary source itself, or its open abstract.

**How it was checked.**
- Blocked pages were not bypassed:
  - Cloudflare challenge: Stony Brook's Digital Commons.
  - Plain 403s: SMU repository, Canadian Science Publishing, Wiley/ESA, maine.gov, UNL Digital Commons.
  - Paywalls: OUP full texts.
- The publications.gc.ca 1938 manuscript reports sit behind an "archived on the Web" notice. Its "Continue to publication" link was clicked once in the built-in browser. The PDF arrived as a download the pane could not show, and nothing further was tried.
- One request to the Unpaywall API went out with a placeholder address (`test@example.com`, not the user's). It was refused (422) and not repeated. Every other lookup used APIs that need no address (NCBI E-utilities, OpenAlex, Crossref, Semantic Scholar).
- No fetched page or file contained instructions aimed at the reader.

**Tags.**
- [FT] full text read;
- [ABS] abstract only;
- [SEC] search-engine digest; the page itself was not read;
- [derived] my arithmetic; [inf] my inference.
- Quotes are under 15 words.

**Cross-references.**
- WPHP = `white_perch_habitat_and_predation.md`;
- FWM = `first_winter_mortality.md`;
- KPP = `killifish_persistence_and_predators.md`;
- WPR = `../Whole lake 3D fish simulation/white_perch_regulation.md`;
- WSSB = `../Seasonal fish habitat use/whiteperch_shiner_sucker_bullhead.md`;
- FSD = `../fetched_sources_digest.md`;
- FSRM = `../fetched_sources_read_by_me.md`.

---

## Verdicts

| # | Gemini's claim | Verdict | What the source says | Read at | New? |
|---|---|---|---|---|---|
| 1 | "Vecchio et al. 2014" (TAFS) and Divver 2012: white perch offshore/deeper by day, inshore/shallower at night. Diel movement on 49.4–57.5 % of summer days and 13.8 % of winter days. A lag of 11.8 h (SD 1.4). Channel 0.9–2.4 m. "46.0 day vs 84.7 night" | **PARTLY; the authors and the habitat framing are WRONG** | The authors are **McCauley (née Divver), Cerrato, Sclafani & Frisk 2014**, *TAFS* 143:1330–1340, doi 10.1080/00028487.2014.938193; no Vecchio. Details below the table | [OUP abstract](https://academic.oup.com/tafs/article/143/5/1330/7832272) [ABS]; [Divver 2012 thesis PDF](https://repo.library.stonybrook.edu/xmlui/bitstream/handle/11401/71204/Divver_grad.sunysb_0771M_11059.pdf?sequence=1&isAllowed=y) [FT] | **NEW** to the repo (no "McCauley", "Divver" or "Carmans" anywhere) |
| 2 | Johnson & Evans 1991 (CJFAS 48:672): young white perch stay active at 2.5–4 °C. Mortality 71.2 % at 2.5 °C vs 11.1 % at 4 °C over 150 d | **CONFIRMED**, for the **1991 CJFAS** paper | Details below the table | 1991: abstract via [OpenAlex](https://api.openalex.org/works/doi:10.1139/f91-084) (CSP 403; Semantic Scholar shows the abstract elided). 1990: [OUP abstract](https://academic.oup.com/tafs/article/119/2/301/7891805) | **1991 numbers NEW**: FWM had 1991 as "blocked". The 1990 abstract was already in FWM and WPR |
| 3 | Swinemar 2024 (SMU MSc): pickerel diet white perch 0.25 and yellow perch 0.32 across four lakes. In "lake CP2", banded killifish 13 % (4 of 31 items), golden shiner 10 %, yellow perch 23 %, Odonata 55 % ("Table 14, p. 86") | **UNVERIFIABLE (blocked), and partly WRONG** | **"CP2" is not a lake.** It is a pickerel size cluster. CP1 = 4.2–10.9 cm TL: Odonata 0.736 ± 0.079 of the diet. CP2 = 20.2–58.6 cm TL: native fish 0.724 ± 0.032. These are isotope mixing models, not stomach counts. The four lakes are Loon, Grafton, Big Dam West and Cobrielle, Kejimkujik NS. Kejimkujik holds white perch, yellow perch, golden shiner and killifish (Parks Canada [SEC]), so the figures are plausible but unseen | [Swinemar abstract PDF (MTRI)](https://mtri.speciesatrisk.ca/sites/mtri.speciesatrisk.ca/files/agendafiles/Swinemar_Delbert.pdf) [FT of abstract]; thesis at library2.smu.ca → 403 | Abstract **already known** (PDPM; `perch_pickerel_smallmouth_pumpkinseed.md`). The 0.25 / 0.32 / 13 % figures stay unverified |
| 4 | Warner 1973 (TAFS 102:149): 117 stomachs from 18 Maine lakes; spring diet led by yellow perch, white perch and smelt; percentages via "MDIFW 2001 Squaretails" | **UNVERIFIABLE** | The repo's own p. 149 (`../fetched/tafs_102_1_tafs0149.pdf.gif`) is the introduction only: no "117", no "18 lakes", no results. No "Squaretails" document was found. The MDIFW pickerel assessment (Brokaw 2001, updated 2008) on maine.gov returned 403. A search digest of it gives prey (yellow perch, white perch, sunfish, minnows, smelt) and a switch to fish at ~7–9 in, with no percentages [SEC] | p. 149 [FT, local]; maine.gov 403 | No |
| 5 | Schoenebeck et al. 2008 (Nebraska): white perch become piscivorous at ~160 mm | **UNVERIFIABLE; probably misattributed** | No white perch paper by Schoenebeck was found. The repo's "Schoenebeck et al. 2008" is a juvenile tiger-muskellunge bioenergetics source (`centrarchid_percid_esocid_parameters.md`). The Nebraska white perch predation work is Gosch et al. 2010 and Gosch & Pope 2011 (already in WPHP), and their abstracts give no 160 mm. KPP has sourced sizes: fish > 110 mm ate killifish (Tedford, Smith 1947 via Scott & Crossman [SEC]); ~35 % fish at 178 mm and ~70 % at 216–254 mm (Leach 1962 [SEC]) | searches only | No |
| 6 | Fitzgerald et al. 2006 (PMID 16937813): Oneida age-0 white perch winter mortality scales with predator biomass | **CONFIRMED** | Fitzgerald, Forney, Rudstam, Irwin & VanDeValk 2006, *Ecol. Appl.* 16:1487–1501, "Gizzard shad put a freeze on winter mortality of age-0 yellow perch but not white perch". Details below the table | [NCBI E-utilities abstract](https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=16937813&rettype=abstract&retmode=text) [ABS]; ESA full text 403 | **NEW**: FWM listed it as "not located" |
| 7 | Smith 1938/1939 (Atlantic Biological Station annual reports), NS copper-sulphate lakes: Boar's Back 17.0 lb/acre, Trefry's 17.7, Tedford 36.0 (white perch and killifish dominant) | **PARTLY CONFIRMED**, from a different, open Smith paper | Smith, M. W. 1939, "The fish population of Lake Jesse, Nova Scotia", *Proc. N.S. Inst. Sci.* 19:389–427, Table 2: **Boar's Back** 55.8 ac, 7 species, 498 fish/acre, **17.0 lb/acre**; **Tedford** 52.0 ac, 7 species, 1,658/acre, **36.0 lb/acre**. Smith cites them to his *TAFS* 67 (1938) paper (paywalled), not to the annual reports. **Trefry's 17.7 lb/acre: not seen** (MS report 190C was not retrieved). Tedford's species split was not seen. **Lake Jesse's own full census is the find** (§ Lake Jesse) | [Dalhousie repository PDF](https://dal.scholaris.ca/bitstreams/5941f0a2-c167-4e0a-8caa-d4b76c8e11b1/download) [FT, scan read by eye]; [MS 190B record](https://publications.gc.ca/site/eng/9.955650/marcXml.html?MODS=1), [MS 190C record](https://publications.gc.ca/site/eng/9.955657/marcXml.html?MODS=1) | **NEW**: only Lake Jesse yellow perch growth was in the repo (via Scott & Crossman) |
| 8 | Gardner, Coghlan, Zydlewski & Saunders 2011 (RRA): Maine stream densities 0.1–3.2 fish/m², blacknose dace and fallfish common | **PARTLY / UNVERIFIABLE** | The author order is **Zydlewski, Coghlan, Gardner & Saunders** (USGS record; doi 10.1002/rra.1572, *RRA* 29:65–78, online 2011). Its abstract gives no densities or species. A digest of the related UMaine thesis abstract gives Sedgeunkedunk Stream (Penobscot tributary) minima of **2.7 fish/m²** below the lower dam and **0.9** just above it before removal, then **0.7** and **5.0** after [SEC]. **0.1–3.2 was not found**; the species ranking was not seen | [USGS record](https://www.usgs.gov/publications/distribution-and-abundance-stream-fishes-relation-barriers-implications-monitoring) [ABS]; Wiley and UNL 403; the UMaine repository is retired | Densities **NEW** but [SEC]; `small_fish_numbers.md` says the abstracts give none |
| 9a | Saila 1956 (L&O 1:195) is open access | **UNVERIFIABLE (blocked)** | Wiley returned 403. Crossref gives a standard Wiley licence, not an open one. The Crossref abstract has no mortality numbers: Z from age frequencies in an exploited and an unexploited Rhode Island pond; growth from 32 ponds; best minimum size ~12 in; < 39 % of production cropped | [Crossref](https://api.crossref.org/works/10.4319/lo.1956.1.3.0195) [ABS] | Abstract details NEW; the mortality numbers are still missing (`pickerel_population_dynamics.md`) |
| 9b | AuClair's white perch chapter in MDIFW *Fishes of Maine* is open | **CONFIRMED (open), but on the Internet Archive** | The white perch account is by **Roger P. AuClair** in Everhart's *Fishes of Maine*, 2nd ed., 1958, pp. 73–74. A DigitalMaine copy was not seen. It has **no winter habits**; the content is in § AuClair | [Internet Archive OCR text](https://archive.org/download/fishesofmaine02ever/fishesofmaine02ever_djvu.txt) [FT] | **NEW** (Everhart 1958 had been used only for killifish) |
| 9c | Neves 1975 (TAFS 104:83), South Branch Lake smallmouth fry: abstract open, PDF paywalled | **CONFIRMED** | 1971–72: **nesting success 67 % and 77 %**; **mean 3,943 fry emerged per nest**. Fanning males reduced sac-fry mortality but not egg mortality. Egg mortality was highest under males < 400 mm with large egg deposits. A water-level drop was the suspected cause of the poorer 1971 | [OUP abstract](https://academic.oup.com/tafs/article/104/1/83/7895274) [ABS] | **NEW** numbers (the repo had Neves only as a compensation example) |
| 10 | Weimer & Brown **2004**, *Prairie Naturalist* **36:37**: pumpkinseed annual survival 25 % at ages 3–5 | **Numbers CONFIRMED; citation WRONG** | It is **2006, *Prairie Naturalist* 38(2):101–111**. The sample was 88 fish trap-netted in May 2003 in Indian Bay, Enemy Swim Lake, SD. Ages 2–5; **annual survival 0.25 for ages 3–5**; L∞ 223 mm, K 0.38. The population is low-density at the edge of the range (0.4–2.9 fish per trap-net night) | [UNL record](https://digitalcommons.unl.edu/tpn/474) [ABS] | NEW (repo's "Weimer 2004" is a bluegill thesis) |

**Claim 1 in full.**
- **Frequencies and lags.**
  - Diel cycling: **13.8 % of winter days, 49.4 % in summer 2010, 57.5 % in summer 2011** (thesis 57.4 %); fall 25.3 %, spring 34.3 %.
  - **The 11.8 h lag is not in the abstract or the thesis.** The thesis gives autocorrelation peaks at **10.5 h (SD 1.5) and 21.3 h (SD 2.9)**. The TAFS full text is paywalled.
- **"0.9–2.4 m channel" was not found.** The thesis gives only a **0.9 m (below mean low tide) overwintering site**, citing Zaikowski et al. 2008.
- **"46.0 vs 84.7 m" is a misreading.** In thesis Table 3, 46 is the degrees of freedom. Summer 2010 mean hourly distance was **84.7 m by day and 131.2 m by night**.
- **There is no offshore or inshore movement.** The movement is **up- and downriver** in a 5–5.5-km tidal river. In summer and fall the fish went upriver at night; in winter, downriver at night.

**Claim 2 in full.**
- **1991 abstract:** after 150 d, white perch mortality was **71.2 % at 2.5 °C and 11.1 % at 4.0 °C**; yellow perch **0.8 % and 17.7 %**. Small fish died first.
- White perch had **3.3×** the mortality of similar-sized yellow perch in Great Lakes-type winters.
- White perch "remained active throughout the winter period", while yellow perch rested on the bottom. Yellow perch used **25.8 % less O₂** (4 °C) and lost **24.6 % less dry weight** (2.5 °C).
- **The 1990 abstract gives no size in mm.** It has only the FL-continuous PMORT models: 68.4 % at 2.5 °C after 150 d; 40.6 % after 180 d starved at 4 °C; 0 % when fed.

**Claim 6 in full.**
- White perch mortality was "directly associated with total predator biomass".
- It also rose with the **autumn white perch abundance**, and fell with **yellow perch abundance** (a buffer species), but not with gizzard shad.
- **Winter severity was not significant.** A starvation model **was correlated** with observed white perch mortality.
- Authors' conclusion: both predation and starvation act on white perch; predation dominates for yellow perch.

**Other errors seen in passing (not on the list):**
- **Coleback Lake (Rupp & DeRoche 1965).** Gemini says "47.6–50.0 kg/ha total, 18 ha". The repo read the full text (FSD §8): Coleback is **20 ac (8.1 ha), 117.1 kg/ha total**. The **47.6 kg/ha is the eels alone** (41 % of the weight).
- **Gemini's winter synthesis is not in any cited source.** It says white perch under ice "congregate in nomadic schools over the deepest basin… just off the bottom". Johnson & Evans is a tank study, and the telemetry study is a river.
- **Unchecked.** Cairns 1998 (bird diets), Todd et al. 1982 (eagles), Santucci & Wahl 2003 and the COSEWIC redbreast figures were not checked.

---

## The new primary material in detail

### Lake Jesse, Nova Scotia: a shallow unstratified white perch, yellow perch and killifish lake (Smith 1939) [FT]
- **The lake.**
  - 45 acres (18.2 ha), max depth 6.6 m, mean 2.4 m. **Not stratified in summer**; circulated by any strong wind. Soft water, pH 6.3–6.5. A headwater lake of the Salmon River, Yarmouth County.
  - This is a close physical analogue of Hot Brook (Upper: max 5.5, mean 3.3; Lower: max 3.9, mean 2.4).
  - It had **no pickerel or bass** (the species list has neither). White and yellow perch were the piscivores.
- **The census.** Copper sulphate, 3 August 1934. Dead fish were counted on measured shore sections (one-eleventh of the shoreline) and scaled up. Some eels survived.
- **Table 1, standing crop**, with per-ha conversions [derived: × 2.471 for number, × 1.121 for weight]:

  | Species | Number | % | lb/acre | per ha | kg/ha | Mean weight [derived] |
  |---|---|---|---|---|---|---|
  | Yellow perch | 14,177 | 40.5 | 4.6 | 778 | 5.2 | 6.6 g |
  | **Banded killifish** | **10,098** | **28.8** | 1.6 | **554** | **1.8** | 3.2 g (2.5–9.2 cm, mean 6.9) |
  | **White perch** | **5,781** | **16.5** | 5.5 (4.9 after a shrinkage correction) | **316** | **6.2 (5.5)** | 19.6 g (mean 11.2 cm) |
  | Golden shiner | 2,611 | 7.5 | 2.0 | 143 | 2.2 | 15.8 g |
  | Brown bullhead | 1,179 | 3.4 | 5.1 | 64 | 5.7 | 88.5 g |
  | American eel | 1,095 | 3.1 | 0.7 | 59 | 0.8 | small; survivors not counted |
  | Brook trout, creek chub, white sucker, ninespine stickleback | 29, 22, 22, 11 | < 0.1 each | 0.4 (trout) | — | — | — |
  | **Total** | **35,025** | | **19.9** | **1,918** | **22.3** | |

  The abstract prints 36,035; Table 1 sums to 35,025.

- **Killifish recruitment.** Few killifish young of the year were in the August sample. Smith says this "likely reflects the predator action of the dominant perch".
  - Caveat [inf]: 3 August is early in the killifish's July spawning, so the young were tiny.
  - The killifish's length mode was ~5.5 cm (age 1+).
- **White perch age structure** (Table 12, n = 229):
  - age 1+ 32.7 %, 2+ 35.4 %, 3+ 21.4 %, 4+ 6.6 %, 5+ 3.1 % [derived from the counts]; two fish of age 8–9 at 27–30 cm.
  - Lengths at age: 1+ 9.1–9.2 cm (9.1 g); 2+ 10.9–11.1 (17.2 g); 3+ 12.6–12.8 (25.1 g); 4+ 13.7–13.9 (32.7 g); 5+ 15.4–15.6 (47.1 g). Severely stunted.
  - From the 2+ to 5+ counts (81 → 49 → 15 → 7), Z ≈ 0.82 and S ≈ 0.44 per year [derived; catch curve, steady recruitment assumed].
- **No white perch young of the year at all in 1934.** Smith offers two explanations: spawning failed, or the population was made of immigrants. He says the same "apparently obtained" in neighbouring Tedford Lake.
- **Distribution.** Most white perch (and golden shiner) were found at the north end, "adjacent to the deepest water". Smith notes the wind drift was also toward that end.
- **Comparison lakes (Table 2).**
  - Boar's Back: 17.0 lb/acre ≈ **19.1 kg/ha**, 1,231 fish/ha, 7 species.
  - Tedford: 36.0 lb/acre ≈ **40.4 kg/ha**, 4,097 fish/ha, 7 species.
  - Both are Yarmouth County lakes, treated in 1936.

### AuClair in Everhart 1958, *Fishes of Maine* (white perch, Maine) [FT]
- **Spawning.**
  - Large schools go to "a tributary stream, a shallow cove, or the upper portion of a river estuary".
  - They spawn when the water is "up to 60° F" (≈ 15.6 °C), usually in **June** in Maine.
  - Spawning spreads over **10–14 days**. A one-pound female releases ~150,000 eggs, which hatch within a week.
  - A sudden drop of 4–5 °F (≈ 2–3 °C) can kill all the eggs deposited.
- **Young.** Fish of 1–3 in (2.5–7.6 cm) can be seined by the thousand **in the evening along sandy beaches** where they come in to feed. Young of the year are "a principal food item of many game fishes including larger white perch".
- **Adults.** They feed on insects and crustaceans in spring, take more fish through summer, and by late summer eat "almost entirely" fish (yellow perch, smelt, white perch).
- **Growth.** A 6-year-old is > 12 in and > 1 lb in one pond but < 7 in in another. Large areas of shallow, warm water give the fastest growth.
- **Numbers.** White perch "usually become the most abundant" species. Fluctuations come from unfavourable temperature soon after spawning, not from angling.
- **Pickerel (same book).** Yellow perch, white perch and minnows are their important food in Maine.

---

## What changes for the simulation

### (a) Where white perch should be by day, night and season in a 3–5.5-m lake
1. **The day/night bands in WPHP §A are unchanged.** No new source gives white perch depth or distance from shore in a lake. The telemetry study is a tidal river, so its "where" does not transfer. Its **timing** does transfer [inf]:
   - **The night shift happens on about half of summer days, not every night.** Diel cycling was seen on 49–57 % of summer days, 25–34 % in fall and spring, and 14 % in winter.
     - Let each fish make the dusk inshore move with a daily probability of ~0.5 in summer (~0.3 in spring and fall) and stay on the day ground otherwise.
     - That softens the all-at-once inshore pulse and leaves some white perch over open bottom at night.
   - **Temperature gate.** Diel cycling was "greatly reduced" below 8 °C. The thesis' break points are 3, 7 and 20 °C, with a dip above 20 °C.
     - So switch the diel move off below ~7–8 °C: from late October, under ice, and until about mid-May.
     - Let it dip, but not vanish, at the 22–24 °C late-July peak.
   - **Fish move more at night.** Summer hourly distance was 85 m by day and 131 m by night; over the year, 130 and 194 m. Night swimming should be ~1.5× day, not near rest.
2. **The young come in at dusk** along sandy, unvegetated shore (AuClair, Maine). This agrees with WPHP's young-of-year band of 0.5–2.5 m by day and 0.3–1.5 m at night. Add an evening feeding pulse on open sand (not in the weeds) for 2.5–7.6-cm fish.
3. **Spawning.**
   - **Trigger at ~15–16 °C**, which AuClair's own 1958 text gives (see Conflicts); in Hot Brook's calendar that is late May to early June.
   - Spread it over **10–14 days**, in tributary streams and shallow coves (Upper's inlet, the connecting brook).
   - Kill the eggs if the water drops ≥ 2–3 °C during incubation. This is AuClair's year-class-failure mechanism. Lake Jesse had no 1934 young at all.
4. **Under ice, white perch stay active** (Johnson & Evans 1991: active in tanks at 2.5–4 °C, unlike yellow perch).
   - Keep them swimming and roaming over the basin. No torpor or bed-resting state like yellow perch.
   - The cost comes through bioenergetics (feeding [d.]).
   - Diel movement should be rare (~14 % of days).

### (b) What share of pickerel and bass diets white perch should be
- **No new verified number.** Keep WPHP §C (Cooper 1941, Maine): white perch **40–60 %** of food volume for pickerel ≥ 30 cm and for smallmouth ≥ 22 cm, mostly 5–12-cm fish.
- **Do not use** Gemini's 0.25 white perch / 0.32 yellow perch / 13 % killifish (Swinemar). They are unseen, and the "lake CP2" label shows the passage was misread.
- **Corroboration.**
  - Swinemar's isotopes: Nova Scotia pickerel of 20–59 cm got 0.72 of their diet from fish, and those of 4–11 cm 0.74 from Odonata. That supports the sim's switch from insects to fish somewhere between ~11 and ~20 cm.
  - MDIFW's 7–9 in (18–23 cm) [SEC] sits at the upper end.
  - AuClair: young white perch are a principal food of Maine game fish.
- **Adult white perch as predators.**
  - AuClair says Maine adults eat "almost entirely" fish by late summer. That is stronger than Cooper's 26 % (summer, ≥ 15 cm).
  - A **seasonal rise in white perch piscivory from June to September** reconciles the two [inf]. The prey should be young yellow perch and young white perch, offshore or at the edge, not killifish (KPP).

### (c) First-winter mortality of young white perch, by size and temperature
1. **Water temperature matters as much as winter length.** Over 150 days, 71 % died at 2.5 °C against 11 % at 4.0 °C (1991). The 1990 models give the same contrast.
   - So the sim's first-winter hazard should key on **the temperature where the young winter**, not only on the days below a threshold.
   - Water nearer 4 °C over the bed is the mild case; mid-water at ~1–2.5 °C is the harsh case.
   - Use FWM's two J&E 1990 curves. At 4 °C and a 161-day winter: 50 % die at ~57 mm FL, 10 % at ~72 mm. At 2.5 °C: ~64 % at 70 mm, ~47 % at 80 mm, ~25 % at 100 mm [derived in FWM].
2. **White perch have ~3.3× the winter mortality of yellow perch** of the same size (1991). They burn reserves faster because they stay active. The sim's white perch first-winter threshold should be higher than the yellow perch's, as FWM already suggests.
3. **Add predation and density** (Fitzgerald 2006, Oneida, field). Over-winter loss of age-0 white perch rose with total predator biomass and with the cohort's own autumn abundance. It fell when yellow perch (alternative prey) were plentiful, and was not tied to winter severity.
   - Form [inf]: first-winter loss = starvation(size, T, days) + predation ∝ (predator biomass) × (own density) ÷ (1 + alternative prey).
   - This is a density-dependent brake that works even in mild winters, and it is the compensation WPR wants.
4. **Year-class failures are real.** Lake Jesse had none of the 1934 year class (Smith), and AuClair blames temperature soon after spawning. The sim should allow occasional near-zero white perch cohorts, from cold snaps at spawning and a cold, long winter for small autumn young, rather than every year recruiting.

### (d) How the small fish persist
1. **Killifish coexist in large numbers with dense white and yellow perch** in a lake the size and depth of Hot Brook's.
   - Lake Jesse held **~550 killifish/ha (1.8 kg/ha)** alongside ~316 white perch/ha and ~780 yellow perch/ha in early August. These are minimums (shore counts after poisoning).
   - Targets [inf]:
     - **adult plus yearling killifish of ~300–600/ha in late summer** (the sim founds 233/ha);
     - killifish biomass **~1–2 kg/ha**;
     - **few young of the year visible by early August**, more by autumn.
   - Lake Jesse had no pickerel or bass, so Hot Brook's numbers may sit lower. The killifish's long coexistence with pickerel in Hot Brook (KPP) argues against far lower.
2. **The whole small-lake community is light.** Lake Jesse 22 kg/ha, Boar's Back 19 kg/ha, Tedford 40 kg/ha (soft brown Nova Scotia lakes); white perch were 6 kg/ha in Jesse. These fall at or below the low end of FSD's Maine 45–117 kg/ha. The sim's white perch at 35–39 kg/ha stays far too high, and WPR's 15–35 kg/ha target looks generous for a soft-water lake.
3. **Pumpkinseed.** Annual survival of **~0.25 at ages 3–5** is a single low-density South Dakota sample. Use it as a floor for adults, not a target. Coleback's 6,385/ha, mostly young (FSD), is the Maine density guide.
4. **The stream** (Hot Brook between the lakes). Maine Penobscot-tributary electrofishing gave **~0.7–5 fish/m²** of all species [SEC]. A per-m² density of order 1 fish/m² for the brook's dace, fallfish and young sucker is the order of magnitude [inf]. The species split is unverified.
5. **Redbreast sunfish and fallfish:** nothing verified here.

---

## Conflicts with existing notes
1. **White perch spawning temperature.**
   - WSSB and WPR cite AuClair 1956 (via Stanley & Danie 1983) for 18–21 °C held for several days.
   - **AuClair's own 1958 Maine account says "up to 60° F" (≈ 15.6 °C), usually June.** That agrees with the MDIFW plan's 59–60 °F (FSRM).
   - Prefer ~15–16 °C. The 18–21 °C attribution may be Stanley & Danie's summary of the thesis, or a Sebasticook-specific observation.
2. **Gemini's habitat framing against WPHP.** Gemini presents the estuary telemetry as proof that lake white perch are offshore and deep by day and inshore at night. The source says no such thing (upriver and downriver only). WPHP's "no lake telemetry or hydroacoustic study of white perch found" still stands.
3. **Johnson & Evans numbers.** FWM's 68.4 % at 2.5 °C after 150 d (1990) and Gemini's 71.2 % (1991) are both right for their own papers: two separate experiments. FWM's "1991: blocked" is now filled from the open abstract.
4. **Fitzgerald et al. 2006.** FWM listed it as "not located; title recalled, unverified". It exists. Its finding (predation and density matter, winter severity does not, at Oneida's 43° N) qualifies FWM's starvation-only framing for white perch.
5. **Coleback Lake.** Gemini's "47.6–50.0 kg/ha total, 18 ha" contradicts FSD's full-text 117.1 kg/ha and 20 ac. FSD is right: 47.6 kg/ha is the eels alone.
6. **Killifish density.** KPP and SFN say "no density per m² exists". Lake Jesse gives a whole-lake ~550/ha (August, minimum), which complements Onondaga's ~0.34/m² of seined shore (KPP addendum).
7. **Adult white perch piscivory.** Cooper (via KPP and FSD) gives 26 % fish for white perch ≥ 15 cm in summer. AuClair says "almost entirely" fish by late summer. The difference is the season, not a contradiction [inf]; a seasonal ramp fits both.

## Still open (not bypassed)
- The TAFS 2014 full text (OUP paywall) is the 11.8 h lag source if it exists.
- Swinemar's thesis tables (SMU 403).
- Warner 1973 pp. 150–151.
- Saila 1956 (Wiley 403).
- Smith's *TAFS* 67 (1938) Boar's Back and Tedford species tables.
- MS reports 190B and 190C (archived publications.gc.ca PDFs, not displayed).
- Zydlewski et al. 2011 full text (Wiley 403).
