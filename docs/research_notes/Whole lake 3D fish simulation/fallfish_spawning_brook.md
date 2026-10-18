# Fallfish spawning in a short lake-connecting brook, and fallfish predation on blacknose dace (Hot Brook)

Compiled 2026-10-18. This note backs a fix for one problem in the 3-D sim. In late May and June, about **5,400 ripe fallfish** (10% of the lakes' ~55,000 fish ≥ 7.5 cm) pack into the 154-m connecting brook. That is **~3.2 fish/m²** over its ~1,700 m². They eat **~5%/day** of the brook's ~1,000 blacknose dace. The note gathers real numbers so the fix can be a **mechanism**, not a target.

It builds on these notes and does not repeat them:
- `habitat3d_new_species.md` Q2 (fallfish by mode) and Q4 (dace by mode);
- `brook_food_web.md` §4 (dace production, riffle refuges, Power 1987, Schlosser 1987);
- `movement_between_lakes.md` (the sucker and pike runs between lakes);
- `Hot Brook populations and water/fish_numbers_and_new_species.md` (life history).

**Conventions:** as `habitat3d_new_species.md`.
- **Flags:**
  - [inf] my inference;
  - [sur] a surrogate species;
  - [ag] an agency page;
  - [ang] an angler or naturalist account;
  - [sec] a compilation (ADW, Ontario LHD, efish, Wikipedia, FishBase);
  - [abs] abstract only;
  - [snip] seen only in a search summary;
  - [ft] full text read (OCR or text layer).
- **Region tags:** [N] = New England, NY, Atlantic Canada, Quebec or Ontario; [S] = south of New Jersey.
- **Hot Brook settings:**
  - Upper Hot Brook Lake (369 ha) drains to Lower (274 ha) through a brook about 154 m long and 8–11 m wide.
  - The brook has a ~1-m pool at its upper mouth, ~0.3-m riffles and a ~0.5-m run.
  - It carries lake surface water.
  - On the sim calendar (`SEASON.TEMP_KNOTS`), the water reaches **15 °C about 25 May**, **17 °C about 3 June**, **19 °C about 12 June** and **21 °C about 20 June** (my conversion of the knots, yf 0 = 1 March).

**Method note (what was blocked):**
- The *Southeastern Fishes Council Proceedings* (Maurakis et al. 1990, "Pebble-nests of four *Semotilus* species") sits behind an Anubis bot wall, so it was skipped.
- These returned 403 and were skipped:
  - the full Magee (1989) thesis PDF;
  - HathiTrust and BHL (Adams & Hankinson 1928);
  - MassWildlife;
  - NH Fish & Game's page;
  - Noble (1965), as a PDF;
  - the full text of the Connecticut dace riffle paper.
- Springer (Ross 1983) redirects to a login.
- The two Connecticut River relicensing reports with fallfish nest tables are over 10 MB. They were not downloaded, so their numbers come from search summaries.
- **Read in full:**
  - Trial et al. 1983, the USFWS fallfish HSI (OCR, ARLIS copy);
  - Trial et al. 1983, the blacknose dace HSI (OCR);
  - USGS SIR 2009-5047 (Catskills) and SIR 2022-5121 (Mohawk tributaries);
  - the Northfield relicensing spawning table;
  - the GLFC 2023 sucker weir report.

---

## Key numbers at a glance

| Quantity | Value | Source |
|---|---|---|
| Fallfish spawning starts | after the water reaches **15 °C**; optimum **17 °C**; stops if it falls back below 15 °C | Reed 1971; Ross & Reed 1978 (via Trial et al. 1983) |
| Spawning window (New England) | **late April–June** (Massachusetts); 12–16.6 °C, late April–May (Hartel et al. 2002) | Reed 1971 [abs]; Northfield table [ag] |
| Hot Brook window (sim calendar) | ~25 May – ~12 June at 15–19 °C, about **3 weeks** | [inf] |
| Nest sites | stream edge under overhanging vegetation (single nests), or **midstream clusters of 2–3 nests a few metres apart**; depth **≤ 0.5 m**; near cover or pools; pool tails and slow deeper runs | Ross & Reed 1978 [abs]; Trial 1983 [ft]; WVDNR [ag, S] |
| Nest size | usually **30–50 cm wide, 10–20 cm high**; up to ~1.2–2 m across and 0.5–0.9 m high | ADW [sec]; NJ DFW [ag]; Smith 1985 via LCC [sec] |
| Males that build nests | **< 10 %** of mature males (the largest); most males breed only as satellites | Ross 1983 [snip abstract] |
| Fish per nest | **3–5 females** plus nearby males per spawning rush; **≥ 20 fish** may be associated with one nest; 1–2 satellite males per spawning | Ross (in press) via Trial 1983 [ft]; ADW [sec] |
| Lake fish spawning | "move from larger waters into streams to spawn" (Maine); also historically in "the shallow margins of lakes" (Oneida Lake, NY) | Trial 1983 [ft], citing Adams & Hankinson 1928 |
| Piscivory starts | ~**100 mm** (fallfish < 100 mm ate no salmonid fry) | Johnson et al. 2010 [snip] |
| Fish in the diet | summer: terrestrial invertebrates top at **30 %**; Quebec: mainly aquatic insects; with a pulse of naive fry: **48–63 %** fry (May) | Johnson 2015 [abs]; Lambert et al. 2026 [abs]; Johnson et al. 2010 [snip] |
| Blacknose dace density | **0.03–2.6 /m²** (Catskills); **0.2–5.2 /m²** (Mohawk tributaries); ~0.22 /m² (Shenandoah pools). The sim's 0.59/m² is mid-range | Mulvihill et al. 2009 [ft]; George et al. 2023 [ft]; Newman 1995 |
| Dace life span | 3–4 yr; mature at age II; "few fish reach age III" | Ontario LHD [sec]; Noble 1965 via Trial [ft] |
| Dace production (Maine river) | **37.7–52.7 kg ha⁻¹ yr⁻¹** | Garman & Moring 1993 (via `brook_food_web.md`) |
| Stream fish standing crop | community mean **11.2 g/m²** (Catskills); trout up to 22.3 g/m²; Mohawk maximum 10.6 g/m² | Mulvihill et al. 2009 [ft]; George et al. 2023 [ft] |
| Sim's brook at peak | 5,400 fallfish ≈ **3.2 fish/m²** ≈ **~380 g/m²** (at ~120 g per fish) | [inf] |

---

## Q1. Fallfish spawning: when, where, and how far

### Takeaway
- **When:** fallfish spawn once streams reach **15 °C** (optimum 17 °C). A cold snap below 15 °C halts spawning. Across southern New England the season is late April–June. On Hot Brook's calendar, the window is roughly the last week of May to mid-June.
- **Where:** nests go in **slow water at ≤ 0.5 m**, on pebble-gravel, near overhead cover or pools. The documented sites are pool tails, slower and deeper runs, and stream margins, not the fast heads of riffles.
- **Lake fish:** the Maine Cooperative Fishery Unit says lake fish move into streams to spawn. A 1928 New York source also reports spawning on the shallow margins of lakes.
- **Inlet vs outlet:** no source separates them. Gravel, slow current and cover are the stated needs, and both kinds of stream can supply them.
- **Distance:** no telemetry exists anywhere, so how far fallfish migrate is unknown.

### Cited Findings
**Temperature and timing**
- Spawning "typically occurs in the spring after water temperatures reach 15 °C" (Reed 1971). Once started, it "may cease if water temperature drops below 15 °C" (Ross & Reed 1978). The HSI curves set **15 °C as the minimum and 17 °C as the optimum**. Embryos usually incubate at **16–18 °C** and hatch in **138–144 h at 17 °C** (Reed 1971). [N] — [Trial, Wade, Stanley & Nelson 1983, FWS/OBS-82/10.48, Maine Coop. Fishery Research Unit](https://www.arlis.org/docs/vol1/AK_Heritage/FWS/OBS/82/FWS-OBS-82-10-48.pdf) [ft]
- Massachusetts, eight populations: spawning ran **late April to June, when water reached 14.4 °C**. Males matured at III+, females at IV+. Fecundity F = 159.1 + 26.4 W. [N] — [Reed 1971, *TAFS* 100:717–725](https://academic.oup.com/tafs/article-abstract/100/4/717/7894389) [abs]
- Massachusetts tabulation: "gravel in low velocity stream margins", nest builder with no guarding, **late April through May, 12–16.6 °C**. For comparison, white sucker: "gravel bars in tributary or shoals", mid-April to May, ~10 °C. [N] — [Northfield Mountain / Turners Falls relicensing Study 3.3.13 (2015), Table 1, citing Scott & Crossman 1973 and Hartel, Halliwell & Launer 2002](https://www.northfield-relicensing.com/content/Documents/2015_USRS_3_3_13.pdf) [ft]
- Other ranges:
  - 14–19 °C, May–June [sec] — [Ontario LHD](https://www.ontariofishes.ca/fish_detail.php?FID=74);
  - 14.4–19 °C, late April–June [sec, S] — [efish VA (Jenkins & Burkhead 1993)](https://www.efish.fishwild.vt.edu/families/fallfish.html);
  - water at 59 °F (15 °C), "quiet waters of streams" (Britt et al. 1993) [sec] — [NPS IRMA, Rock Creek Park](https://irma.nps.gov/NPSpecies/Species/Profile/104941);
  - spawning in April (West Virginia) [ag, S] — [WVDNR](https://wvdnr.gov/plants-animals/sportfish/fall-fish/).
- **Connecticut River, VT/NH (nearest dated field record):** 26 active fallfish nests were observed and measured **in late May**. Similar numbers were in tributary and island/bar habitats, and 12 were in impoundment tributaries. In the riverine reaches, 4 of 14 nests (29%) were, or would have been, dewatered at low water levels. [N] — [TransCanada (Great River Hydro) Study 14/15 Revised Final Report, 2016](https://relicensing.greatriverhydro.com/wp-content/uploads/simple-file-list/Documents/50-Study-Reports/130-Study-Reports-1-33/Study-14-and-15-Resident-Fish-Spawning/11-30-16-TC-Study-14_15-Revised-Final-Report.pdf) and [Interim Report, March 2016](https://relicensing.greatriverhydro.com/wp-content/uploads/simple-file-list/Documents/50-Study-Reports/130-Study-Reports-1-33/Study-14-and-15-Resident-Fish-Spawning/TC_S14_S15_Spawning_Interim_Report_2016_03_01.pdf) [snip; both PDFs are > 10 MB and were not opened]
- **Maine:** no dated Maine spawning record was found. A Holden, Maine stream held a fallfish mound "up to 6 feet across and 2½ feet tall", seen on a walk shortly before 3 July 2011 (the article gives no date for the walk, so it does not date the spawning). — [Bangor Daily News](https://www.bangordailynews.com/2011/07/03/outdoors/nesting-creatures-are-interesting-to-observe/) [ang]

**Where in the stream**
- **Mill River near Amherst, MA:** two kinds of site.
  - **Single nests at the stream edge, under overhanging vegetation.**
  - **Midstream sites where 2–3 nests sat a few metres apart.**
  - Dominant males gathered stones from **up to 5 m away**. [N] — [Ross & Reed 1978, *Copeia* 1978:215–221](https://doi.org/10.2307/1443553) (abstract via [OpenAlex](https://api.openalex.org/works/doi:10.2307/1443553)) [abs]
- **Nest depth and cover:**
  - Mill River nests were "in midstream or at the stream edge at depths of 0.5 m or less". The HSI treats **~0.5 m as optimal "because most nests occur at this depth"**.
  - Fallfish "usually construct nests in stream reaches where overhead cover, such as overhanging vegetation or dead brush, or pools occur near areas of suitable spawning substrate" (Ross pers. comm.).
  - In the HSI, cover near the substrate is required for optimum spawning habitat, and sand–gravel is the optimum substrate.
  - [N] — [Trial et al. 1983](https://www.arlis.org/docs/vol1/AK_Heritage/FWS/OBS/82/FWS-OBS-82-10-48.pdf) [ft]
- **Pool tails and runs:** mounds are built "in flowing water near the backs of pools and in slower, deeper runs". [S] — [WVDNR](https://wvdnr.gov/plants-animals/sportfish/fall-fish/) [ag]
- **Nest microhabitat (Virginia):**
  - *S. corporalis* pit-and-mound nests were significantly larger than other *Semotilus* nests and were found in **wider, deeper streams**.
  - They used a higher share of **stones ≥ 23 mm**, and 23 mm was the commonest size.
  - The mound acts as a breakwater, cutting flow in the downstream pit to near zero.
  - [S] — [Magee 1989, MS thesis, Univ. Richmond](https://scholarship.richmond.edu/masters-theses/554) [abs]
- **Stones and shape:** flat stones averaging ~2 in (5 cm), with a "keel-like crest" across or along the current. These stone-pile nests are built in fairly quiet water or riffles. — [Lake Champlain Committee note, quoting Smith 1985, *Inland Fishes of New York*](https://lakechamplaincommittee.org/learn/news/item/spring-natural-history-note-fish-spawning) [sec]
- **Riffle heads?** None of the sources names fast riffle heads as nest sites. The sites named are slow water: margins, pool tails, slower and deeper runs, and "quiet waters of streams". [inf]

**Lake fish, inlets, outlets and lake shoals**
- **Lake margins:** "Adams and Hankinson (1928) reported that fallfish spawn in the quiet waters of streams and in the shallow margins of lakes." That is Oneida Lake, NY. [N]
- **Maine:** "Our observations in Maine indicate that fallfish move from larger waters into streams to spawn." Also: "Juveniles occur in smaller streams than adults." The probability of finding larger fish rises with the size of the water body. [N]
- Both points are in [Trial et al. 1983](https://www.arlis.org/docs/vol1/AK_Heritage/FWS/OBS/82/FWS-OBS-82-10-48.pdf) [ft].
- **New Hampshire:** larger fish move into smaller streams to spawn, and spawning is communal. [N] — [NH Fish & Game fallfish page](https://www.wildlife.nh.gov/fishing-new-hampshire/fish-species-nh/fallfish) [ag][snip; the page returned 403]
- **Connecticut:** fallfish occur at low abundance in lakes that have significant tributary streams. [N] — [CT DEEP](https://portal.ct.gov/deep/fishing/freshwater/freshwater-fishes-of-connecticut/fallfish) [ag]
- **Northern vs southern:** northern populations use lakes; southern ones are restricted to streams. — [ADW](https://animaldiversity.org/accounts/Semotilus_corporalis/) [sec]
- **Inlet vs outlet:** no source distinguishes inlet from outlet streams. The Connecticut River nests were split between tributary mouths and main-stem island and bar habitats. [snip]

**How far**
- **No telemetry, home range or tagging study** of fallfish was found (as before; see `habitat3d_new_species.md` Q2 Gaps).
- Sources only call it potamodromous (FishBase), "migratory and very mobile" with "no true home range", and able to range through the whole stream (ADW [sec]).
- Growth depends on stream size and the density of other fallfish. [N] — [Victor & Brothers 1982, *Can. J. Zool.* 60:2543](https://api.openalex.org/works/doi:10.1139/z82-326) [abs]

### Inferences
- **Temperature order of the streams:** the connecting brook and Lower's outlet carry lake surface water, so they warm with the lakes. Upper's forested inlet streams, fed by groundwater and snowmelt, should reach 15 °C later. Spawning should therefore start in the outlet-type streams [inf].
- **Hot Brook's nest sites:** the ~0.5-m run, the tail of the 1-m mouth pool, and alder-shaded margins. The 0.3-m riffles are too fast and too shallow. The pool interior is too deep and slack for a mound [inf].

---

## Q2. Fallfish nests: size, density, attendance, communal spawning, season length

### Takeaway
- **Who builds:** one large male builds each mound in 1–4 days, and **fewer than 10% of mature males ever build one**.
- **How many spawn:** at each spawning rush, **3–5 females plus satellite males** spawn together. Twenty or more fallfish may hang around one nest. Common shiners join, up to ~100 at a nest.
- **Spacing:** nests are single, or in **clusters of 2–3 a few metres apart**.
- **Gaps:** no study gives nests per 100 m of stream or counts of spawning fallfish in a reach. The length of the season at one site was not found either.

### Cited Findings
**Size and build**
- **Typical mound:** 30–50 cm wide and 10–20 cm high, up to 2 m across. Nest building takes 1–4 days, and each spawning involves **one dominant male and 1–2 satellite males**. Females mature at 3–4 yr and males at 2–3 yr. There is no parental care. — [ADW](https://animaldiversity.org/accounts/Semotilus_corporalis/), citing Ross & Reed 1978, Ross 1983 and Maurakis & Woolcott 1992 [sec]
- **Other size reports:**
  - pyramids **4–18 in (10–46 cm) tall** [N] — [CT DEEP](https://portal.ct.gov/deep/fishing/freshwater/freshwater-fishes-of-connecticut/fallfish) [ag];
  - nests "4 feet wide and 1.5 feet tall" (1.2 × 0.46 m) [N] — [NJ DFW](https://www.nj.gov/dep/fgw/pdf/delriver/artdel_sp_fallfish.pdf) [ag, ft];
  - up to **6 ft (1.8 m) across and 3 ft (0.9 m) high** (Smith 1985 via [LCC](https://lakechamplaincommittee.org/learn/news/item/spring-natural-history-note-fish-spawning) [sec]), with "several thousand stones" ([NANFA, Johnson](https://www.nanfa.org/articles/acnests.shtml) [sec]);
  - two mounds 1.5–2 ft (0.45–0.6 m) across, with "lots of small fish around them" (New York angler, via search summary) [ang][snip].
- **Building and mate choice:** a male builds for up to four days, and females choose males by nest quality. [S] — [WVDNR](https://wvdnr.gov/plants-animals/sportfish/fall-fish/) [ag]

**Who spawns on a nest**
- "Each nest is constructed by a single male." The builder holds the highest status and the central position. Spawning "is always elicited by the dominant male, normally by dropping a stone on the nest". "Three to five females and nearby males rush onto the nest and spawn communally. Twenty or more fallfish may be associated with a single nest" (Ross, in press). [N] — [Trial et al. 1983](https://www.arlis.org/docs/vol1/AK_Heritage/FWS/OBS/82/FWS-OBS-82-10-48.pdf) [ft]; the same wording via Britt et al. 1993 at [NPS IRMA](https://irma.nps.gov/NPSpecies/Species/Profile/104941) [sec]
- **Behaviour at Mill River:**
  - Communal spawning drew **varying numbers of males and females** over the gravel, and neither sex clasped.
  - Males held a **strict hierarchy** (parallel swimming, lateral displays, head-butting), and size and reproductive success set rank.
  - Females were not aggressive and did not build.
  - **Non-nesting males often disrupted spawning**, and other species interfered with nesting males.
  - [N] — [Ross & Reed 1978](https://api.openalex.org/works/doi:10.2307/1443553) [abs]
- **Few males build:**
  - "The percentage of reproductively mature male fallfish that construct and defend nests is low (< 10 %)", and only the largest, presumably oldest, males nest.
  - Adult mortality suggests most males breed in their lifetime only as **satellites** at other males' nests.
  - Satellite behaviour is commoner than in creek chub, attributed to lower paternity certainty.
  - [N] — [Ross 1983, *Env. Biol. Fish.* 9:65–70](https://link.springer.com/article/10.1007/BF00001059) [snip of the abstract; the page redirected to a login]
- **Nest associates:**
  - common shiners use fallfish nests, "sometimes up to 100" at one nest — [MassWildlife, common shiner](https://www.mass.gov/info-details/common-shiner) [ag][snip];
  - "five to seven other native fish species" may use a nest at once — [Dark Skies Fly Fishing](https://darkskiesflyfishing.com/fallfish-on-the-fly/) [ang];
  - rainbow trout spawning on fallfish mounds — [Rodricks 2025, quoting guide K. Pavol](https://danrodricks.com/2025/08/09/a-large-minnow-that-builds-and-shares-a-spawning-bed/) [ang].
  - No source names blacknose dace as an associate.

**Nest density and counts**
- **Mill River:** single nests, or 2–3 nests a few metres apart (above). No count per reach was reported in the abstract.
- **Connecticut River relicensing:** 26 active nests across the Wilder, Bellows Falls and Vernon project reaches in late May. Surveys were "hampered by high flows and poor visibility", so this is not a density. [snip]
- **No nests-per-100-m or per-m² figure was found** in any source, agency report or thesis abstract.

**Season length**
- The regional season spans late April–June (Reed 1971), or late April–May (Hartel et al. 2002), about 4–8 weeks across sites and years.
- The active life of a single nest was not found. Building takes 1–4 days, then the dominant male elicits repeated spawning rushes [sec].

### Inferences
- **Nest capacity:** each nest needs pebble gravel and is supplied from up to ~5 m around it. Clusters hold 2–3 nests a few metres apart. A good site therefore holds **about 1 nest per 15–30 m²** of suitable slow-water gravel [inf].
- **Fish per nest:** about **10–25** at a time (3–5 females per rush, the builder, 1–2 satellites per rush, plus loiterers) [inf from Ross via Trial].

---

## Q3. Do spawning fallfish feed less? Adult diet, piscivory, and dace

### Takeaway
- **Feeding while spawning:** no study measured feeding by spawning fallfish. In a Lake Ontario tributary, though, fallfish ≥ 100 mm fed heavily on salmon fry in May–June, their own spawning season. So the population does not fast.
- **Nest-holding males:** they spend 1–4 days carrying stones, then display and fight. Their foraging must drop, but this has not been measured.
- **Normal diet:** adults are opportunistic omnivores, mostly eating terrestrial and aquatic insects. Fish make up a large share only when small, naive fish are superabundant.
- **Dace:** no primary record of fallfish eating blacknose dace was found. The congener creek chub is a documented dace predator.

### Cited Findings
**Adult diet**
- Fallfish are "opportunistic feeders; their diet includes aquatic insect larvae, terrestrial insects, crustaceans, and fish" (Kingsbury 1977). "Algae is also an important constituent" (Reed 1971). Adults are usually 155–255 mm (Richardson 1935), and Reed (1971) reports ages to XI. — [Trial et al. 1983](https://www.arlis.org/docs/vol1/AK_Heritage/FWS/OBS/82/FWS-OBS-82-10-48.pdf) [ft]
- **Salmon River, NY, summer diel study:** terrestrial invertebrates were the main fallfish food at **30.0%**. Fallfish had "a distinct feeding peak", while common shiner and cutlip minnow fed over longer periods. [N] — [Johnson 2015, *Am. Midl. Nat.* 173:326–334](https://www.usgs.gov/publications/summer-diel-diet-and-feeding-periodicity-four-species-cyprinids-salmon-river-new-york) [abs]
- **Jacques-Cartier River, Quebec:** fallfish were twice as abundant as brook trout. Stomachs suggested diets similar to trout's, mainly aquatic insects, and the fallfish isotopic niche lay inside the trout's. [N] — [Lambert, Cabana & Enders 2026, *Env. Biol. Fish.* 109](https://api.openalex.org/works/doi:10.1007/s10641-026-01860-6) [abs]
- **Massachusetts:** an omnivore eating "algae, fish, aquatic and terrestrial insects, and crayfish". — [Reed 1971](https://academic.oup.com/tafs/article-abstract/100/4/717/7894389) [abs]

**Piscivory: when and how much**
- **Salmon River, May–June 2009:**
  - In May, Chinook fry were **62.5% of the diet of large fallfish (≥ 150 mm) and 48.1% of medium fallfish (100–149 mm)**.
  - **Fallfish < 100 mm ate no salmonid fry.**
  - In June, steelhead fry were a major item for large and medium fallfish.
  - [N] — Johnson et al., AFS 2010 abstract (Paper 1726) [snip; afs.confex.com did not resolve]
- **Salmon River, 2009 consumption:**
  - Fallfish ate an estimated **2.9 million Chinook parr** (mean 44.5 mm in May) and **0.8 million** wild steelhead subyearlings.
  - The river's parr abundance is "often topping 10 million".
  - In 2010–12, hatchery yearlings took **13.8–15.3%** of the parr present.
  - [N] — [Johnson, Nack, Chalupnicki, Abbett & McKenna 2016, *NAJFM* 36:74–84](https://api.openalex.org/works/doi:10.1080/02755947.2015.1103821) [abs]
  - My reading: if 2009 parr numbered ~10–15 million, fallfish removed ~20–30% over ~8 weeks, roughly **3–4% per week**. Those prey were superabundant, naive, 4–5 cm, newly emerged fry, a far softer target than adult dace on a riffle [inf].
- **Eggs:** fallfish also eat salmon eggs. — [Johnson, Nack & Chalupnicki 2009, *J. Great Lakes Res.* 35:630](https://doi.org/10.1016/j.jglr.2009.08.001) [title and record only]
- **Size threshold:** from ~100 mm the diet shifts to small fish (including their own young), fish eggs and terrestrial insects. Juvenile and adult diets overlap little. — [Wikipedia, citing Johnson et al. 2009](https://en.wikipedia.org/wiki/Fallfish) [sec]
- **Prey size [inf]:** the 44.5-mm parr eaten by 100–150 mm fallfish give a prey:predator length ratio of about 0.3–0.45. Adult dace are 56–83 mm TL (Ontario LHD), so they are within reach of fallfish of roughly **≥ 15–25 cm**.

**Dace as prey**
- **No primary study** reports fallfish eating blacknose dace. One AI-generated encyclopedia (Grokipedia) says adults eat dace, but it cites nothing, so it is not used.
- **Creek chub** (*S. atromaculatus*, the fallfish's congener) eats dace:
  - Noble observed creek chub preying on dace in Iowa. — [Noble 1965, *Proc. Iowa Acad. Sci.* 72:282](https://scholarworks.uni.edu/pias/vol72/iss1/42) [abs]
  - Juvenile dace shift away from creek chub in artificial streams (Fraser & Emmons 1984; see Q4). [sur]

**Feeding during spawning**
- No fallfish data. Indirect evidence:
  - the Salmon River fallfish ate large numbers of fry in May–June above;
  - the ritual at the nest (stone carrying, hierarchy fights, displays) takes the builder's time;
  - non-nesting males hover at nests as satellites (Ross & Reed 1978; Ross 1983).
- In other fishes, spawners on the grounds usually keep feeding at reduced intensity: Lofoten cod have more empty stomachs on the spawning grounds than off them, and American shad feed at low, variable intensity. These are not cyprinids. [sur][snip]

### Inferences
- **Nest-holding males:** forage little while building and holding a nest [inf].
- **Satellites and females:** keep foraging near the nest. Eggs drifting from the mound (fallfish eat fish eggs) are an obvious food [inf].
- **Fish in the adult diet:** without a fry pulse, fish should be a minor share. Terrestrial invertebrates topped the summer diet at only 30% (Johnson 2015), so fish are probably ≤ 10–20% by mass [inf].

---

## Q4. Blacknose dace: densities, survival, predators with fallfish, refuges

### Takeaway
- **Density:** blacknose dace reach **0.2–5 fish/m²** in northeastern streams where they dominate. Hot Brook's 1,000 dace in 1,700 m² (0.59/m²) is ordinary.
- **Survival:** dace are short-lived (3–4 yr; few reach age III). That implies **~65–80% annual mortality of adults**, about **2–3% per week** averaged over the year, or ~4–6% per week if concentrated in the open-water months [inf].
- **Production cap:** a Maine river's dace produced **38–53 kg ha⁻¹ yr⁻¹**. On Hot Brook's ~0.17 ha that is only ~6–9 kg a year for **all** predators combined.
- **Refuges:** shallow, fast riffles (15–45 cm/s surface velocity, < 25 cm deep), silty slack margins for the young, and banks, roots and brush.
- **Behaviour:** dace avoid large moving fish day and night, and leave compartments that hold predators.

### Cited Findings
**Densities (three-pass depletion electrofishing)**
- **Catskill reference reaches, NY** (2002, 2004, 2006 means; fish per 0.1 ha → per m²):
  - Bear Kill BE02 **2,627 → 2.63/m²**; BE01 1,021.5 → 1.02/m²;
  - Batavia Kill BA05 1,778 → 1.78/m²;
  - Schenevus Creek SV01 734.5 → 0.73/m²;
  - Stony Clove SC01 34.3 → 0.03/m².
  - **Fallfish co-occurred at SV01 (4.7/0.1 ha = 0.005/m²) and BA05 (2.0/0.1 ha = 0.002/m²)**: summer resident fallfish were ~150–900× rarer than dace.
  - Community biomass averaged **11,223 g/0.1 ha (11.2 g/m²)**; trout reached 22,287 g/0.1 ha at CN01.
  - Drainage areas were 2.4–241 km².
  - [N] — [Mulvihill, Baldigo & Ernst 2009, USGS SIR 2009-5047](https://pubs.usgs.gov/sir/2009/5047/includes/SIR2009-5047.pdf) [ft]
- **Mohawk River tributaries, NY** (June–August 2019, 20 sites):
  - Crane Creek: community **7,182 fish/1,000 m²**, 72% dace → **~5.2 dace/m²**; biomass 10,588 g/1,000 m², the study maximum.
  - Crum Creek: 4,123/1,000 m², 60% dace → ~2.5/m².
  - Flat Creek: 595/1,000 m², 64% dace → ~0.38/m².
  - Auries Creek: 488/1,000 m², 40% dace → ~0.20/m².
  - Blacknose dace were at 17 of 20 sites and fallfish at 5.
  - [N] — [George, Winterhalter & Baldigo 2023, USGS SIR 2022-5121](https://doi.org/10.3133/sir20225121) [ft]
- **Shenandoah NP headwaters:** 22–23 dace per 100 m² in pools (~0.22/m²); production 0.3–2.4 kg/ha/yr in acidified streams. [S] — Newman 1995, Virginia Tech thesis (via `brook_food_web.md` §4)
- **Habitat and density:** dace are densest over gravel–cobble at surface velocities of **15–45 cm/s**. They are common at gradients of 11–23 m/km and avoid gradients < 5 m/km. They live "typically in the pools of small streams", rarely in lakes. Their upper incipient lethal temperature is **29.3 °C**. — [Trial, Stanley, Batcheller, Gebhart, Maughan & Nelson 1983, FWS/OBS-82/10.41 (blacknose dace HSI)](https://www.arlis.org/docs/vol1/AK_Heritage/FWS/OBS/82/FWS-OBS-82-10-41.pdf) [ft]
  - Hot Brook falls only ~0.3–0.4%, about 3–4 m/km (`hot_brook_lake_records.md`). That is below the dace's preferred gradient, so the riffles are the dace's best ground [inf].

**Survival and age**
- Dace mature at age II, and "few fish reach age III" (Noble 1965). Fry are 5 mm at hatching, 29 mm at age I and 45 mm at age II; adults seldom exceed 102 mm. — [Trial et al. 1983, dace HSI](https://www.arlis.org/docs/vol1/AK_Heritage/FWS/OBS/82/FWS-OBS-82-10-41.pdf) [ft]
- Life span **3–4 yr**, maturity at 2 yr, adults **5.6–8.3 cm TL**, 1–5 g. Spawning at 15.5–22 °C, May–June. Preferred temperature 19–25 °C. — [Ontario LHD](https://www.ontariofishes.ca/fish_detail.php?FID=69) [sec]
- Males usually mature at the end of the second year or during the third (948–1,426 dace examined, Doe Run, Kentucky). [S] — [Tarter 1969, *TAFS* 98:454](https://api.openalex.org/works/doi:10.1577/1548-8659(1969)98[454:saorit]2.0.co;2) [abs]
- No measured annual survival or mortality rate for blacknose dace was found. My estimate:
  - a population where few reach age III and the maximum is 3–4 implies adult annual survival of about **0.2–0.35**;
  - that is Z ≈ 1.0–1.6 yr⁻¹;
  - so **all-cause** mortality averages ~2–3% per week, or ~4–6% per week if packed into ~26 open-water weeks [inf].

**Production**
- **Piscataquis River, Maine:**
  - Blacknose dace production was **52.7 kg ha⁻¹ yr⁻¹** before logging and **37.7** the year after.
  - Dace could not switch to terrestrial prey, while creek chub could.
  - [N] — [Garman & Moring 1993, *Env. Biol. Fish.* 36:301](https://link.springer.com/article/10.1007/BF00001726) (abstract, via `brook_food_web.md` §4)

**Predators in streams**
- **Named predators:**
  - fish: smallmouth bass, brook, brown and rainbow trout;
  - birds: common merganser and great blue heron;
  - (Wikipedia, citing UNB) [sec].
  - Creek chub, observed by Noble 1965 [abs].
  - Fallfish is **not** named as a dace predator in any source found.
- **In Hot Brook's brook**, plausible dace predators are pickerel, smallmouth bass, larger yellow perch, fallfish, belted kingfisher, herons, mergansers and loons [inf].

**Refuges and avoidance behaviour**
- **Avoidance of large fish:**
  - Dace avoided predatory creek chub by day and by night. They also avoided harmless white suckers, but less, and mostly at night.
  - Below 6 °C the suckers went still and dace stopped avoiding them, but kept avoiding the active chub.
  - The authors conclude that dace **avoid all large, moving fish**.
  - — [Fraser & Mottolese 1984, *Z. Tierpsychol.* 66](https://api.openalex.org/works/doi:10.1111/j.1439-0310.1984.tb01358.x) [abs]
- **Response to predator density:**
  - At low creek chub density, juvenile dace did not avoid them by day but did at night, whatever the density.
  - Avoidance at night depended on **cover (structure) and predator density**.
  - **Predators caused dace to move to other compartments.** The authors note the benefit (escape, and not being trapped in pools with piscivores as water drops) and the cost (poorer feeding or crowding where they go).
  - — [Fraser & Emmons 1984, *CJFAS* 41:364–370](https://api.openalex.org/works/doi:10.1139/f84-039) [abs]
- **Habitat by life stage:**
  - Fry are densest over silt and sand at **< 15 cm/s**, on shoals and pool margins.
  - Juveniles use gravel with small rocks at 15–30 cm/s.
  - Dace spawn in riffles at **< 25 cm** depth and **20–45 cm/s**. In the north, spawning starts when water reaches **21 °C** (Raney 1940).
  - Cover is undercut banks, roots, brush, overhanging vegetation and shade (Trautman 1957).
  - — [Trial et al. 1983, dace HSI](https://www.arlis.org/docs/vol1/AK_Heritage/FWS/OBS/82/FWS-OBS-82-10-41.pdf) [ft]
- **Depth refuges:** in Power's (1987) streams, large bass held pools > 50 cm deep, and fish > 3–4 cm avoided water < 20 cm because of wading birds. With bass present, juveniles were confined to shallow riffles and raceways (Schlosser 1987). Details and sources are in `brook_food_web.md` §4.

### Inferences
- **Season order:** dace spawn at ~21 °C, around 20 June on the sim calendar. That is just after the fallfish window (15–19 °C, 25 May–12 June). So the two species' spawning crowds should not coincide in the brook [inf].
- **Brook refuges:** the ~0.3-m riffles at 15–45 cm/s and the slack silty margins are the dace's refuges. Large fallfish (20–30 cm, deep-bodied) should rarely hunt water < ~20–25 cm or the riffle cores [inf from Power 1987; Schlosser 1987].

---

## Q5. Fish densities in short lake-connecting streams during spring runs (Maine and the northeast)

### Takeaway
- **No fish-density survey of a Maine thoroughfare** during the white sucker or fallfish runs was found.
- **The closest analogues** are a pike run through a 5–15-m creek between Minnesota lakes, white sucker inlet runs in British Columbia and Michigan, and sucker commuting between Adirondack lakes.
- **What they show:** runs through small connecting creeks are **trickles spread over weeks** ("a few fish per day"). They involve a minority of each lake's adults, with short individual stays. They are not a simultaneous 10%-of-the-lake pulse.

### Cited Findings
- **Pike through Riley Creek, Minnesota** (5–15 m wide, ≤ 1 m deep; a close physical analogue of Hot Brook):
  - About **10–20% of Lake Riley's ~1,600 pike** migrated each year.
  - They were caught "nearly every day for 3 weeks" as the water warmed from 3 to 10 °C: a few fish per day.
  - 93–96% were back in their lakes by mid-May.
  - [sur] — Chizinski et al. 2016, *NAJFM* 36:769 [ft] (details in `movement_between_lakes.md`)
- **White sucker commuting, Adirondacks:** in June–July, a subset of mostly large suckers crossed a short, shallow channel between two lakes **nightly** (out at sunset, back before dawn). One fish made 29 round trips in 60 days. [N] — Marcy-Quay & Kraft 2021, *Northeastern Naturalist* 28:430 [abs] (in `movement_between_lakes.md`)
- **Sixteenmile Lake, British Columbia (inlet stream):**
  - Populations were about **800 white suckers and 2,000 longnose suckers**, with **25–50% of each spawning in a given year**.
  - Runs began at inlet maxima of ~5 and 10 °C.
  - Later migrants spent less time in the stream.
  - Spawning mortality was 10–40%.
  - [sur, west] — [Geen, Northcote, Hartman & Lindsey 1966, *JFRB Can.* 23](https://api.openalex.org/works/doi:10.1139/f66-161) [abs]
- **Boardman River, Michigan** (a Lake Michigan tributary ~22.5 m wide):
  - The 2022 spring run was estimated at **5,284 white suckers** (95% CI 3,602–8,445) and **12,170 longnose suckers**.
  - The run was already under way when trapping began on 22 April.
  - [N-ish, Great Lakes] — [GLFC FishPass Research Publication, Nov 2023](https://www.glfc.org/pubs/pdfs/research/FishPassResearchPublication2023-WeirEnumeration.pdf) [ft]
- **Maine white suckers:** 976 spawning suckers were sampled from six Maine lakes in 2014 (120–282 per lake) for a harvest study. The thesis gives no stream densities. [N] — [Begley 2016, UMaine MS thesis](https://digitalcommons.library.umaine.edu/etd/2553) [abs]
- **Sucker habitat for spawning:** gravel bars in tributaries or on shoals, mid-April–May, ~10 °C. — [Northfield Table 1](https://www.northfield-relicensing.com/content/Documents/2015_USRS_3_3_13.pdf) [ft]
- **MDIFW records:** MDIFW's trap-net and weir work on thoroughfares targets landlocked salmon and trout in autumn. Fallfish and suckers appear only as by-catch counts (e.g., 12 white suckers at the Crooked River weir). [N] — [MDIFW Crooked River weir report 2022](https://www.maine.gov/ifw/docs/Use%20of%20a%20Picket%20Weir%20and%20Passive%20Integrated%20Transponder%20Tags%20to%20Assess%20the%20Landlocked%20Atlantic%20Salmon%20Spawning%20Run%20in%20the%20Crooked%20River_%20Maine%202022.pdf) [snip]

### Inferences
- **A fraction is realistic:** 10–20% of a lake's adults using a connecting creek over a season is realistic (pike).
- **But not all at once:** with arrivals spread over 3 weeks and stays of days, the number present at any time is a small fraction of that [inf].

---

## What this means for the sim

All numbers here are proposals with reasons. They are meant as **checks on a mechanism**, not targets to tune to.

### 1. How many spawning fallfish the 154-m brook can hold at once: **~50–300 (best ~150), with a hard ceiling near 500**
- **Mechanism: nest sites are the limiting resource.**
  - A ripe male needs an unclaimed site to build: pebble gravel at ~0.3–0.6 m, in slow water (the run, the mouth pool's tail, the margins), within a few metres of overhead cover or a pool (Trial 1983; Ross & Reed 1978).
  - Sites hold single nests, or clusters of 2–3 a few metres apart (Ross & Reed 1978). Stones come from up to 5 m away.
  - Hot Brook has ~1,700 m² of water. If ~15–25% (250–425 m²) is slow, gravelly run or pool tail, then at ~1 nest per 15–30 m² it holds **~8–28 nests**. Cover cuts this to **~5–15 nests active at once** [inf].
- **Females and satellites join an existing nest** up to its attendance limit: ~3–5 females per rush, 1–2 satellites per rush, and ≤ ~20–25 fish associated (Ross via Trial; ADW). So the brook holds ~5–15 nests × ~10–25 fish = **~50–300** [inf].
  - That is ~0.03–0.18 fish/m² over the whole brook, clumped to ~1–3 fish/m² right at the nests.
- **Ross's < 10% nest-builders as a check:**
  - 5,400 ripe fish include ~2,700 males, so ~270 would-be builders.
  - The brook has sites for only 5–15 of them, about 2–6%.
  - The rest must spawn elsewhere or as satellites somewhere.
- **Biomass check:**
  - 150 fallfish × ~120 g ≈ 18 kg ≈ **11 g/m²**. That matches the whole fish community's standing crop in northeastern streams (11.2 g/m², Catskills; 10.6 g/m² maximum, Mohawk).
  - 500 fish (~35 g/m²) is a plausible short-lived spawning crowd.
  - The sim's 5,400 (~380 g/m²) is **~35× the stream norm** [inf; per-fish mass assumed].
- **Season throughput:**
  - Hot Brook is at 15–19 °C from ~25 May to ~12 June (~3 weeks), and spawning halts on any drop below 15 °C.
  - With stays of ~3–7 days (unmeasured for fallfish), ~150 at a time gives **~400–1,500 brook spawners per season**.
  - That is about **1–3% of the ≥ 7.5 cm census**, or perhaps 3–10% of the mature adults [inf].

### 2. Whether lake fallfish would use the inflow and outlet streams instead: **yes, mostly**
- **The alternatives are larger than the brook:**
  - **Lower's outlet** (Hot Brook, **2.95 km** to Baskahegan Stream, `drainage_species_and_eel.md`) is ~19× the connecting brook's length.
  - **Upper's inlets:** the main Hot Brook inflow at the south end and "several small tributaries" (MDIFW). Upper's basin is 65.8 km², so its main inlet is a real stream.
  - Both lie outside the map.
- **The evidence:**
  - Maine fallfish "move from larger waters into streams to spawn" (Trial 1983). Those are streams in general, not one particular stream.
  - Lake-margin spawning is also recorded: "the shallow margins of lakes" (Adams & Hankinson 1928 via Trial).
- **Suggested mechanism:**
  - Each ripe fish picks a destination by **distance and remaining capacity**:
    - the brook's nest sites (capacity-limited, as in item 1);
    - an **off-map stream sink**: Upper's south-end inlet for Upper fish, Lower's north-east outlet for Lower fish;
    - **gravelly lake margins** near inflows and rocky shores at ≤ ~0.5–1 m.
  - Fish that go off-map leave for their stay (days to ~2 weeks) and return. Their spawning is credited to recruitment.
  - A fish that reaches the brook and finds every site full either becomes a satellite at a nest below the attendance cap or leaves for the next option.
- **Timing:** outlet-type streams (the brook, Lower's outlet) warm with the lake surface and should open first. Upper's forest inlets should open later [inf].
- **The split is unknown:** no data give the shares among streams and lake margins. A distance-weighted choice with the capacity cap will give the brook the fish from Upper's north basin and Lower's south end, which is what the geography implies [inf].

### 3. Whether spawning fallfish should hunt less: **yes, by role, and fish stay a minor prey item**
- **Nest-holding males:** near-zero hunting while building (1–4 days) and while holding a nest (Ross & Reed 1978; Ross 1983; ADW) [inf on the size of the cut].
- **Satellites and ripe females at a nest:** reduced foraging, perhaps by about half, shifted toward drifting eggs [inf]. They do not fast: Salmon River fallfish ate fry heavily in May–June (Johnson et al. 2010, 2016).
- **All fallfish:**
  - **no piscivory below ~10 cm** (Johnson et al. 2010);
  - prey ≤ ~0.3–0.45 of the fallfish's length [inf from 44.5-mm parr eaten by 100–150-mm fallfish];
  - fish ≤ ~10–20% of adult diet mass unless naive fry are superabundant (Johnson 2015; Lambert et al. 2026) [inf].
- **Dace refuges:** large fallfish (≥ 20 cm) should not hunt in water < ~20–25 cm or in the riffle cores (15–45 cm/s). Those are the dace's refuges (Power 1987; Schlosser 1987; the dace HSI) [inf].
- **Dace response:** dace should move away from places crowded with large moving fish, by day and by night (Fraser & Mottolese 1984; Fraser & Emmons 1984).

### 4. A realistic weekly predation loss for the dace: **about 0.5–1.5% of the adults per week to fallfish during the spawning weeks**
- **All causes together:**
  - Dace live 3–4 yr and few reach age III, so total adult mortality is ~2–3% per week averaged over a year, or ~4–6% per week in the open-water season [inf].
  - That total is shared among pickerel, smallmouth, larger perch, kingfishers, herons, mergansers, disease and starvation.
- **Fallfish share:** about a quarter at most, even while fallfish crowd the brook. That gives **≤ ~0.5–1.5% per week (≈ 0.1–0.2% per day)** [inf].
- **The sim is far above this:** 5%/day is ~30% per week, **~20–60× too high**.
- **Production check:**
  - A Maine river's dace produced 38–53 kg ha⁻¹ yr⁻¹, so Hot Brook's ~0.17 ha yields ~6–9 kg of dace a year for all predators and all ages.
  - At 5%/day, four spawning weeks remove ~760 of 1,000 adults (~2.3 kg at ~3 g each). That is a quarter to a third of the brook's **annual** dace production, taken by one predator in one month [inf].
- **Item 1 alone may fix it:**
  - At the sim's current per-capita rate (50 dace/day among 5,400 fallfish, ≈ 0.009 dace per fallfish per day), capping the brook at ~150 fallfish gives 5% × 150/5,400 ≈ **0.14%/day ≈ 1% per week**. That is inside the realistic band.
  - Adding the spawning-time hunting cut and the riffle and margin refuges (item 3) would bring it to ~0.3–0.8% per week [inf].
- **Checks to run after the change** (not targets):
  - peak spawning fallfish in the brook ≤ ~300–500;
  - ≤ ~25 per nest;
  - adult dace loss to fallfish ≤ ~2% per week in June;
  - the dace persist across years with home-bred recruits.

---

## Gaps
- **Nest density:** no fallfish nest count per stream length or area, and no count of spawning fallfish per reach, was found.
  - The Mill River paper (Ross & Reed 1978) and the Connecticut River relicensing reports (> 10 MB) likely hold such numbers; only abstracts and summaries were seen.
  - Maurakis et al. 1990 (SFC Proceedings) was behind a bot wall, and the Magee 1989 thesis PDF returned 403.
- **Movement:** no fallfish telemetry, residence time at spawning sites, or migration distance anywhere.
- **Feeding while spawning:** no study of feeding or stomach fullness of spawning fallfish.
- **Dace as prey:** no primary record of fallfish eating blacknose dace, and no stream study of predation *rates* on dace by any predator.
- **Dace mortality:** no measured annual survival for blacknose dace. Reed & Moulton 1973 (Massachusetts age structure) and Cunjak & Power 1986 (winter biology, Ontario) were seen only as citations.
- **Lake-margin spawning:** no measured share of fallfish spawning on lake margins versus streams. Adams & Hankinson 1928 is known only through Trial 1983, because BHL returned 403.
- **Hot Brook itself:** no survey exists of Upper's inlet streams or Lower's outlet (gradient, gravel, cover, barriers). A Route 169 culvert above Upper is rated a "potential barrier", and a railroad crossing on the outlet is of unknown class (`drainage_species_and_eel.md`).
- **Maine thoroughfares:** no spring fish-density data were found for any Maine thoroughfare.
