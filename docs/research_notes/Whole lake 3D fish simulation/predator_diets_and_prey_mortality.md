# What chain pickerel and smallmouth bass eat, and how much yellow perch, brown bullhead and banded killifish lose to predators (Hot Brook check)

Compiled 2026-10-19 for the 3-D whole-lake sim of Upper and Lower Hot Brook Lake, Maine. The lakes are shallow (Upper: mean 3.35 m, max 5.5 m; Lower: max ~4 m), unstratified and weedy. Their fish are yellow perch, white perch, pumpkinseed, redbreast sunfish, brown bullhead, white sucker, smallmouth bass, chain pickerel, fallfish, banded killifish and blacknose dace. There is **no golden shiner**.

**What the sim did (the result being checked).**
- **The kill rule.** Adult piscivores kill with hazard ∝ Σ over prey within strike reach of capture × prey vulnerability × (1 − prey body depth / predator gape)² × concealment × n^0.5 for a school of n (`fish3.js` `_strike`).
- **Chain pickerel diet.** Over a simulated year, pickerel (mean 35 cm) ate by mass:
  - **~42 % crayfish**;
  - **~38 % young-of-year (YOY) fish**;
  - **~15 % older fish**.
- **Pickerel kills of older fish.** By prey:
  - 38 % banded killifish;
  - 28 % small brown bullhead (< 10 cm);
  - 14 % young smallmouth;
  - 8 % fallfish;
  - almost no yellow perch.
- **Yellow perch.** About 500/ha at ≥ 7.5 cm, 85 % of them ≥ 10 cm. They lost **< 1 %/yr** to predators.
- **Smallmouth bass.** They ate **~65 % crayfish**.
- **Bullhead and killifish.** Brown bullhead fell by **1/3** and banded killifish by **2/3** in a year.

---

## Summary: is it realistic?

| Sim result | Verdict | Field range | Key evidence |
|---|---|---|---|
| Pickerel, all fish (YOY + older) = 53 % of diet mass | **Too low** | **65–90 % fish by mass** for 30–50-cm pickerel in the Northeast | LaHave NS 85 % fish by weight; Kejimkujik isotopes ~72 % fish at 20–59 cm; Florida "almost exclusively" fish > 30 cm SL (§1) |
| Pickerel, crayfish 42 % | **High but possible** | ~10–30 % by mass expected; frequency of occurrence can reach 42 % | Raney 1942 NY: crayfish in 42 % of 234 stomachs; MA isotopes: crayfish still important ≥ 300 mm (§1) |
| Pickerel, older fish only 15 % | **Too low** (~2.5–4×) | Probably **35–60 % of total diet mass** | Realised prey ≈ 0.3 of pickerel length (Buntz); for a 35-cm fish that is 8–11 cm prey, mostly age-1+ fish in spring and early summer (§1.3) |
| **Yellow perch ≈ 0 % of pickerel kills** | **Unrealistic** — the largest error | Perch is **the first-named principal prey** in Maine. In pike lakes it is often 60–78 % of diet mass [surrogate] | MDIFW; 1958 Maine survey maps; Voyageurs and Minnesota pike (§1, §3) |
| White perch and sunfish missing from older-fish kills | **Unrealistic** | Centrarchids are 13–50 % of pickerel fish prey. White perch was the #2 fish prey in an NS lake | Raney, Buntz, Guillory, LaHave (§1) |
| Bullhead 28 % of older-fish kills | **High but plausible** | 13.8 % frequency of occurrence (NY). Large pickerel select small bullheads (electivity +0.65, FL) | Raney 1942; Guillory 1979. Aquarium pike refuse them (§4.2) |
| Killifish 38 % of older-fish kills | **Likely too high** for 35-cm pickerel | No northeastern diet record. A Florida congener is selected by small pickerel and avoided by those > 30 cm SL | Guillory 1979 (§5.2) |
| Perch predation loss < 1 %/yr | **10–40× too low** | Total natural mortality of age-1+ perch in lightly fished small lakes with esocids/bass **A ≈ 35–70 %/yr**. Fish predation probably accounts for **~15–35 %/yr** at 7.5–15 cm [inf] | Mill Lake MI 70 % (no fishing); Murphy Flowage WI natural ≈ 55 %; Sand Hills 38 %; Oneida: cormorants alone 7.7 %/yr (§3) |
| Smallmouth 65 % crayfish | **Right for a clear rocky lake, too high for Hot Brook** | Shallow, weedy, perch-rich lake: **~35–55 % crayfish, 35–50 % fish** | Tester 1932 Perch Lake ON: 39 % crayfish, 50 % fish; Nebish WI (rocky) 65–77 % crayfish (§2) |
| Bullhead −1/3 in a year | **Within natural adult mortality** | A ≈ 50 %/yr even in a pond **with no piscivorous fish** | Moe Pond NY 52 %; Murphy Flowage 50 % (§5.1). Check recruitment, not only predation |
| Killifish −2/3 in a year | **Within natural adult mortality** | Max age 3–4; A ≈ 65–90 %/yr. Persistence depends on recruitment and a very-shallow refuge | COSEWIC 2014; Hoenig/Then/Lorenzen (§5.2). An introduced pickerel did wipe out small fish in small NS lakes |

**The most likely causes in the sim, from reading the code.** In order:
1. **The squared size penalty** makes a 13-cm perch about 1/5 as killable per encounter as a 6-cm killifish (about 1/8 once vulnerability is included), before schooling. Field prey of adult pickerel average ~0.3 of their length.
2. **Perch schools** count only n^0.5.
3. **Perch sit offshore** by day while pickerel hold the weeds. In lakes whose deepest water is 4–5.5 m and whose weed beds reach ~3.5 m, real 8–15-cm perch overlap pickerel at the weed edge.

See §7 for targets and the suggested fixes.

---

## Conventions

**Tags.**
- **[primary]**: I or a sub-researcher read the full text (old scans via pdftotext; garbled OCR is flagged).
- **[abstract]**: an abstract or catalogue page only.
- **[review]**: the number comes from a secondary account (a review, a compilation like ADW or Wikipedia, or a citing paper); both are named.
- **[agency]**: a state or federal agency report or page.
- **[snippet]**: search-engine summary only, unverified.
- **[surrogate]**: a predator or prey species that is not in Hot Brook (northern pike, largemouth bass, walleye, Eurasian perch, channel catfish, bluegill), or a southern region (Florida).
- **[inf]**: my inference or arithmetic.

**Other notes.**
- Quotes are under 15 words.
- **Conversions.** Annual A to instantaneous Z = −ln(1 − A); weekly = 1 − (1 − A)^(1/52). Examples:

  | A (%/yr) | 30 | 35 | 40 | 50 | 60 | 70 |
  |---|---|---|---|---|---|---|
  | Z (/yr) | 0.36 | 0.43 | 0.51 | 0.69 | 0.92 | 1.20 |
  | Uniform %/wk | 0.68 | 0.83 | 0.98 | 1.32 | 1.75 | 2.29 |

- **Cross-references** (keeping their tags):
  - PMC = `pickerel_mortality_cannibalism.md`;
  - RF = `realtime_foraging.md`;
  - YPF = `young_piscivore_functional_response.md`;
  - SFN = `../Hot Brook populations and water/small_fish_numbers.md`;
  - HAB = `../Seasonal fish habitat use/perch_pickerel_smallmouth_pumpkinseed.md`;
  - NP = `../Real lake ecology for calibration/northern_pike.md`;
  - PWE = `../Predator winter energetics/predator_winter_energetics.md`.

**Method and access.** Four parallel sub-researchers plus my own searching. The session's shared limit of 200 web searches was used up, and a few final leads were followed by direct fetches only. Read in full (via pdftotext where needed):
- the MDIFW *Chain Pickerel Assessment*;
- Mitchell, LeBlanc & Heggelin (Nova Scotia);
- the LaHave River 2019 report;
- Guillory 1979, Buntz 1966, Lawrence 1958;
- Christensen et al. 2022;
- Tester 1932;
- Serns & Hoff 1984;
- Snow 1978 (Murphy Flowage);
- Schneider 1973 (Cassidy Lake);
- Beyerle & Williams 1965;
- COSEWIC 2014 (banded killifish);
- Lippert et al. 2007;
- Lantry et al. 2008;
- NYSDEC Oneida 2024;
- MN DNR IR576;
- GLFC TR39;
- Gaeta et al. 2018;
- Jolles et al. 2022.

Blocked or not found sources are listed in §8.

---

## 1. Chain pickerel adult diet

### Takeaway
- Adult chain pickerel (≥ ~20–25 cm) in northeastern lakes are **mainly piscivorous (≈ 65–90 % fish by mass)**. They also take crayfish where crayfish are common, plus odonate nymphs, frogs and the occasional bird or mammal.
- In Maine, the first-named principal prey is **yellow perch**, then white perch, sunfish, minnows and smelt.
- Prey are mostly **~0.1–0.4 of pickerel length (mean ≈ 0.3)**. Fusiform fish are taken up to ~0.55, sunfish up to ~0.37.
- Stomachs are often empty (17–62 %) and usually hold one prey item.
- Pickerel feed actively through the winter. In Maine, ice-fishing catch rates are 2–2.5× those of open water.
- **No northeastern under-ice stomach study exists.** The only seasonal stomach data are Floridian: more food in cool months.

### 1.1 Northeastern studies

| Study | Where, when | n, sizes | Diet | Tag |
|---|---|---|---|---|
| Raney 1942, *J. Wildl. Manage.* 6:58–66 | small New York pond, summer | 234 stomachs | Frequency of occurrence (FO): golden shiner 47.3 %, **crayfish (*Cambarus*) 42 %**, **brown bullhead 13.8 %**, pumpkinseed 13.2 %. Large pickerel are "lazy feeders" that prefer slow brown bullheads irrespective of abundance (Raney as paraphrased by Guillory) | [review] via [ADW](https://animaldiversity.org/accounts/Esox_niger) and [Guillory 1979](https://seafwa.org/sites/default/files/journal-articles/GUILLORY-507-517.pdf); JSTOR blocked |
| MDIFW *Chain Pickerel Assessment* (Brokaw 2001, updated Lucas 2008) | Maine statewide | — | Juveniles eat mostly aquatic insects. "Strongly piscivorous" after 7–9 in (18–23 cm). "Yellow perch, white perch, sunfish, minnows, and smelts comprise the principal prey species"; also crayfish, frogs, dragonfly nymphs. Brandy Pond 1989: stocked brown trout in 15 of 54 stomachs (28 %) of pickerel ≥ 15 in (from PMC) | [agency] [read in full](https://www1.maine.gov/ifw/docs/strategic-management-plans/pickerel.pdf) |
| MDIFW lake-survey maps, 1958 (Aroostook County) | northern Maine lakes | — | Yellow perch and suckers are "the main sources of food for the pickerel" | [agency][snippet] (maine.gov 403) |
| Feener & MacLeod 2020, LaHave River Invasive Species Project 2019 | Wentzells Lake, NS (introduced pickerel); 25 Apr–25 Aug 2019; non-lethal gastric lavage | 200 pickerel angled (CPUE 1.98/h); number lavaged not stated | By weight: **just under 85 % fish, 15 % invertebrates** (89 % of the invertebrate share was dragonfly nymphs; mayfly + dragonfly ≈ 97 %). **Atlantic salmon smolts were 59 % of the whole diet**, though present only ~4 weeks (May–early June). **White perch was the #2 fish prey** and was abundant in the lake. Also pickerel (cannibalism), brook trout and white sucker; amphibian and reptile remains under-weighted; alewife in earlier years; no crayfish | [primary] [PDF](https://novascotia.ca/fish/documents/2020-FFRC-Invasive-species-in-LaHave-River.pdf) |
| Swinemar, Campbell & Reid (Saint Mary's MSc, 2024), stable isotopes | Kejimkujik lakes, NS (Loon, Grafton, Big Dam West, Cobrielle) | two size clusters | 4.2–10.9 cm: Odonata 0.736 ± 0.079 of diet. **20.2–58.6 cm: native fish 0.724 ± 0.032** | [abstract] [MTRI](https://mtri.speciesatrisk.ca/node/36764) (SMU repository 403) |
| Mitchell, LeBlanc & Heggelin (NS Fisheries; 2010 sampling) | 3 small NS lakes with recently introduced pickerel (mean 15.8 ha, mean depth 2.7 m) | 17 stomachs, 14.5–54 cm | 17.6 % empty, **11.7 % fish** (vertebrae), 11.7 % digesta, **58.8 % insects** (mayfly up to 11 per stomach, Odonata; fish 14.5–38.5 cm). These lakes had almost no small fish left (§5.2). The SMU poster says NS lacks native crayfish, so "no crayfish" does not transfer to Maine | [primary] [PDF](https://novascotia.ca/fish/documents/special-management-areas-reports/impact-chain-pickerel.pdf); crayfish note: [SMU poster](https://www.ap.smu.ca/~lcampbel/SMU_Research_Expo_2024_Invasive.pdf) [agency/poster] |
| Christensen, Favata & Bressette 2022, *Urban Naturalist* 56 | Pequot Pond, Westfield MA, mid–late summer; IsoSource mixing model | n = 15 | ≤ 299 mm: mostly **crayfish and bluegill**. ≥ 300 mm: bluegill and **pumpkinseed** rise, crayfish falls but stays an important contributor. δ¹⁵N rises 0.008 ‰/mm | [primary] [PDF](https://www.eaglehill.us/urna-pdfs-regular/urna-056-Christensen.pdf); proportions in a figure only |
| Rohrer 1975, VCU MS thesis | Lake Anna VA, May 1973–Aug 1974 | 166 | Fish remains in 45.6–76.0 % of stomachs. Gizzard shad was the most frequent identified prey after a shad increase | [abstract] [VCU](https://scholarscompass.vcu.edu/etd/5278) |
| Warner, K. 1973. Spring food of chain pickerel in Maine lakes. *TAFS* 102:149–151 | **Maine** | ? | **The key Maine study. Not read:** no online abstract, OUP paywall, T&F 403. **Worth an interlibrary loan** | — |
| Foote & Blake 1945 (CT, Babcock Pond); Underhill 1949 | CT / New England | — | Diet switches from insects to fish across ~15–40 cm (Foote & Blake, as cited by Mitchell et al.). Underhill: no diet content found | [review]; JSTOR blocked |

### 1.2 Southern studies [surrogate: Florida/Arkansas] — prey size, selection, season
- **Guillory 1979**, Lake Conway, Orange Co., **Florida** (Jun 1976–Aug 1977; n = 521; lengths in mm SL) — [primary](https://seafwa.org/sites/default/files/journal-articles/GUILLORY-507-517.pdf):
  - **Shift to fish.** Fish dominate from **135–150 mm SL**. Macroinvertebrates vanish by 175–200 mm and reappear "in small numbers" above 300 mm SL (*Procambarus* crayfish).
  - **Empty stomachs** become more common with size. Larger pickerel eat fewer but larger prey.
  - **Pickerel > 300 mm SL** took 13 prey species. By number:
    - brook silverside 12.8 %, bluegill 8.6 %, threadfin shad 7.8 %, redear 5.7 %;
    - ***Lepomis* combined 32.8 %**.
  - **Bullhead.** Brown bullhead and lake chubsucker were eaten only by pickerel > 300 mm SL. **Brown bullhead electivity +0.65** at that size; bullhead were "strongly selected whenever available".
  - **Killifish.** **Killifishes** (bluefin; Seminole killifish *Fundulus seminolis*, a congener of banded) were **selected by 51–300-mm pickerel** (electivity +0.50, +0.04, +0.07) but **avoided above 300 mm SL (−0.81)**.
  - **Sunfish.** Warmouth was selected by every size class and bluespotted sunfish avoided.
  - **Selectivity overall.** Only 16 of 35 available species were eaten. Only 9 of 48 electivities fell within ±0.30. Diet tracked abundance at r = +0.50 for pickerel < 200 mm but r = −0.04 above 300 mm.
  - **Large pickerel are selective, not opportunistic.**
- **Buntz 1966**, seven south-central Florida lakes, n = 115 adults, mean 19.5 in (≈ 50 cm) — [primary](https://seafwa.org/sites/default/files/journal-articles/BUNTZ-315.pdf):
  - **Empty stomachs:** 61.7 %. 47 prey in 44 fish; only 2 stomachs held more than one item.
  - **Prey:** almost all fish; centrarchids 49.9 % of identified fish. Largemouth bass was the #2 identified prey, 80 % of those in August.
  - **Prey size:** mean prey 5.9 in (15 cm) for a 19.5-in predator, a **ratio ≈ 0.30**. Pickerel of 15–23 in also ate 2–5-in prey (0.1–0.3).
  - **Season:** **> 75 % had food in January vs 3–5 % in July**, and > 40 % during a 3-day August cool spell.
- **Keith & Barkley 1970**, Lake Ouachita, Arkansas: 54.5 % of pickerel ≥ 15 in, and 100 % of those ≥ 19 in, held stocked trout. [snippet] [SEAFWA](https://d11.seafwa.org/journal/1970/predation-stocked-rainbow-trout-chain-pickerel-and-largemouth-bass-lake-ouachita)
- **Pulse prey** (stocked trout in Brandy Pond and Arkansas; salmon smolts at LaHave) can dominate a season's diet. **Pickerel switch to whatever is abundant, slow or naive.**

### 1.3 Gape and prey size
- **Lawrence 1958**, *Proc. SE Assoc. Game & Fish Comm.* 11/12:257 — [primary](https://seafwa.org/sites/default/files/journal-articles/LAWRENCE-257.pdf):
  - **Swallowing rule.** Pickerel can swallow prey whose body depth is ≤ their own body depth. Lawrence says with the abdomen *not* distended; Guillory paraphrases it as "distended". This is a **conflict**.
  - **Table I limits:**

    | Pickerel TL | Max bluegill | Max golden shiner |
    |---|---|---|
    | 34.3 cm | 12.4 cm (r ≈ 0.36) | 18.9 cm (r ≈ 0.55) |
    | 36.8 cm | 13.5 cm (r ≈ 0.37) | 20.6 cm (r ≈ 0.56) |

    Green sunfish ≈ 0.39.
- **Realised prey size.** Mean ≈ 0.30 of length (Buntz). Across piscivores (pickerel not included):
  - **median prey 10–20 %** of predator length (IQR) and **maximum 32–46 %** (IQR; full range 32–57 %);
  - the pike maximum is roughly constant with size;
  - fusiform prey are taken larger than compressed prey;
  - ([Gaeta et al. 2018](https://pmc.ncbi.nlm.nih.gov/articles/PMC5854328/) [primary]; 784 pike diets with 2,233 prey; 201 smallmouth diets with 380 prey).
- **For a 35-cm Hot Brook pickerel [inf]:**
  - typical prey **~5–11 cm**;
  - maximum ~13 cm for sunfish-shaped prey, ~15–17 cm for perch (body depth between shiner and bluegill), ~19 cm for fallfish, dace and sucker.
  - **Yellow perch of 8–13 cm sit squarely in the window.**

### 1.4 Seasons and winter
- **Maine winter.** Pickerel "bite readily in the winter":
  - ice catch rates were 1.08 and 1.18 pickerel per angler-day (1994 and 1999 questionnaires);
  - in most regions, ice rates were **2–2.5× open-water rates**;
  - a 1950s warden census found 0.42 pickerel/h against 0.08 for all coldwater species.
  - (MDIFW [agency][read in full]; see also PWE.)
- **No under-ice stomach data** for any northeastern water. Buntz's Florida data (more food in cool months) are the only seasonal stomach data [surrogate].
- **Under-ice prey [inf from HAB].** At first ice, yellow perch gather in "shallow water in around healthy green vegetation" (MN DNR, via HAB), which is pickerel water. **Early-winter overlap of pickerel and perch is likely high.** Under ice, bass, sunfish and bullheads are inactive or buried. Crayfish are inactive (they burrow in the cold). So **in winter, perch and minnows should dominate pickerel diets** [inf].
- **Spring and early summer [inf].** No YOY exist yet; age-1+ fish and pulses (spawners, smolts) dominate. YOY perch reach ~5–7 cm, a usable size for 30–40-cm pickerel, only from July–August (HAB, SFN).

### 1.5 Realistic adult-pickerel diet for Hot Brook [inf, built from §1.1–1.4]

| Prey | % of annual diet mass, 30–45-cm pickerel | Notes |
|---|---|---|
| All fish | **65–85** | lower bound for crayfish-rich water, upper for NS/FL |
| — yellow perch (YOY + age 1–2) | **15–30** | MDIFW's first-named prey; dominant in winter |
| — white perch (small) | 5–15 | abundant in Hot Brook; #2 fish prey at LaHave |
| — sunfish (pumpkinseed, redbreast) | 5–15 | mostly ≤ 8 cm; deep-bodied, low capture success |
| — cyprinids (fallfish, dace), killifish, young suckers | 10–25 | the soft-rayed "shiner slot" (golden shiner was 47 % FO in NY) |
| — brown bullhead (5–12 cm) | 3–10 | selected by large pickerel (FL, NY), refused by small ones (§4.2) |
| — YOY smallmouth | 1–5 | Buntz, Guillory [surrogate]; Mauck & Coble put smallmouth in the high-vulnerability tier |
| — pickerel (cannibalism) | ≤ 3 | PMC |
| Crayfish | **10–30** | Raney 42 % FO; MA isotopes |
| Odonate nymphs, other insects | 3–10 (more below 30 cm) | NS, LaHave |
| Frogs, tadpoles, other | 1–5 | MDIFW, LaHave |

- **YOY vs older fish [inf].** YOY fish are usable prey from July to ice-on (late summer peak), so the annual split might be **~30–50 % of fish mass YOY, ~50–70 % older fish**. That puts older fish at ~35–60 % of total diet mass, against the sim's 15 %.

---

## 2. Smallmouth bass diet

### Takeaway
- Adult smallmouth in **clear, rocky, prey-poor** lakes eat **65–80 % crayfish by volume** (Ontario, Wisconsin).
- In a **small, warm, weedy lake rich in perch**, the best-studied analogue is **~40 % crayfish and ~50 % fish**, the fish mostly yellow perch.
- Crayfish peak in July–September. May is fish- and insect-heavy.
- Mid-sized bass eat the most crayfish; the smallest and largest eat more fish.
- Adult bass barely feed under ice (PWE).
- **No quantitative diet of adult smallmouth in a Maine lake was found.**
- **No record of smallmouth eating brown bullhead or banded killifish was found.**

### 2.1 Crayfish vs fish
- **Clear, rocky lakes (crayfish dominant):**
  - **Nebish Lake, WI** (38 ha, 15 m, clear, few plants; only other fish is yellow perch):
    - 567 angled stomachs, May–Sep 1977–81, mean bass ≈ 250 mm;
    - crayfish **64.7 % of volume pooled** (FO 37.2 %). The mean of the annual values is 77.1 % (68.6–84.2); the paper does not explain the gap (**conflict**);
    - bass ≥ 8 in: fish 11.3 % of volume, insects 11.6 %;
    - by month, crayfish % volume: May 14.4, Jun 61.9, Jul 83.4, Aug 80.6, Sep 83.2. In May, fish (perch 18.9 % + unidentified 31.8 %) were about half;
    - 79.5 % of stomachs held food;
    - (Serns & Hoff 1984, WDNR Tech. Bull. 149 [primary] [PDF](https://asset.library.wisc.edu/1711.dl/6PIENKBYYZYVP8K/E/file-0781b.pdf).)
  - **Ontario, Tester 1932** (540 bass, summers 1928–31) — [primary](https://www.harkness.ca/PDFs/OFRL%20Publications/Journal46.pdf):
    - Georgian Bay: crayfish **71.7 %** of volume (FO 75 %), fish 27.7 %;
    - Lake Nipissing (n = 109): crayfish **79.0 %** (FO 94 %);
    - mostly *Faxonius propinquus*, about 6 crayfish/m² on rocky shores. The fish eaten were mostly yellow perch;
    - summary for large lakes: ~75 % crayfish, 25 % fish.
  - **Clear Lake, WI** (Marinac 1976 thesis): crayfish 74 % by number, 65 % by volume. [abstract] [MINDS](https://minds.wisc.edu/items/63bc1cce-f6af-4b30-8cc7-11f73f884ca4/full)
  - **Little Moose Lake, Adirondacks NY** (Weidel et al. 2000, *J. Freshw. Ecol.* 15:411):
    - > 500 angled bass, Jun–Aug;
    - crayfish the most frequent item and the largest share by number;
    - crayfish, mayflies, odonates and fish made up 77 % of items;
    - shift to crayfish and fish at ~150 mm.
    - [abstract] [MSU](https://www.canr.msu.edu/resources/diet-and-prey-selection-naturalized-smallmouth-bass-oligotrophic-adirondack-la)
- **Small, warm, weedy, perch-rich lake (the closest analogue to Hot Brook):**
  - **Tester's Perch Lake, ON** (179 bass, 8.9–37.2 cm; 60 % with food) — [primary](https://www.harkness.ca/PDFs/OFRL%20Publications/Journal46.pdf):
    - **fish 49.7 % of volume** (yellow perch the top item; also small sucker, Iowa darter, minnow);
    - **crayfish 39.2 %** (FO 31 %; crayfish were scarcer along this shore);
    - insects ~5 % of volume but FO 66 % (≈ 80 % of them surface or flying); tadpoles 3.9 %; *Leptodora* 1.7 %;
    - medium-sized bass ate the most crayfish (72.4 % when fish were only 5.9 %); small and large bass ate mostly fish.
  - **Clady 1974**, two unproductive northern Michigan lakes: crayfish 31 % of volume in June, falling to 2 % in Aug–Sep. [review via Serns & Hoff]
  - **Older New York data** (in Tester's review) [primary review]:
    - Genesee system (n = 13): crayfish 56 %, fish 18.4 % (pumpkinseed, hog sucker, minnows), aquatic insects 24.2 %;
    - Finger Lakes/Oswego (n = 59): crayfish 40.7 %, insects 20.4 %.
  - **Oneida Lake, NY:** crayfish 47 % of items, small fish 41 %, insects 13 %. [snippet; source unnamed]
  - **Lake Erie before round goby:** crayfish FO 53.5 % (Crane & Einhouse 2016, via [NYSDEC 2024](https://dec.ny.gov/sites/default/files/2024-03/lakeeriebassperchdiet.pdf)). [agency]
- **Murphy Flowage, WI** (largemouth [surrogate]): crayfish **54.6 % by weight**, fish 38.8 % (mostly bluegill and bullhead). Bass exploitation rose in 1968–69 when crayfish, "their major food item", declined. (Snow 1971, WDNR Tech. Bull. 50 [snippet] [UW](https://search.library.wisc.edu/digital/AITM36RG6WRYDT8L); Snow 1978 [primary], §3.)

### 2.2 Which fish, and bullhead and killifish
- **Yellow perch** is the main fish prey in every Ontario, NY and WI lake that has it (Tester; Nebish).
- **Maine:**
  - Marks Lake: bass "preying extensively on abundant juvenile yellow perch";
  - Crawford Lake: forage is crayfish, YOY alewife, perch and sunfish;
  - [agency][snippet], maine.gov 403.
- **Oneida:** bass grew fastest in years with strong perch hatches (Forney). [snippet]
- **Other fish:** pumpkinseed, minnows, darters, sculpins, suckers and young pike all appear (Tester's review).
- **Bullhead:** no record of smallmouth eating brown bullhead. The only ictalurid is a stonecat (Forbes 1880, Illinois, n = 10, in Tester).
- **Killifish:** no record.
- **Contrast with largemouth [surrogate].** **Largemouth positively selected bullheads** at Murphy Flowage 1960–64. Bullhead size in the diet did not rise with bass size, so only small bullheads were taken (Snow 1971 [snippet]).

### 2.3 Prey size
- **Gaeta et al. 2018 (smallmouth from 9 MN/NY/WI lakes)** [primary]:
  - **relative maximum prey size falls as bass grow**;
  - the absolute maximum rose only 58 % from the 5th to the 95th percentile of bass length;
  - most prey 16–73 mm;
  - from the literature (Spirit Lake, IA): 90th percentile 35 %, maximum 78 %.
- **Tester's largest bass** (34.4 cm) held an 8-cm perch (r = 0.23).
- **Largemouth [surrogate]** (Hoyle & Keast 1987, *Can. J. Zool.* 65:1972; 474 trials, 18 bass of 70–285 mm, Lake Opinicon):
  - handling time at equal prey length: crayfish > bluegill > **yellow perch** > brook stickleback > bluntnose minnow > tadpole;
  - the length ratio that minimises handling time per gram is 0.22 (tadpole), **0.24 (perch, crayfish)**, 0.29 (bluegill);
  - wild bass took prey at or below these optima.
  - [abstract] [QUBS](https://research.qubs.ca/projects/the-effect-of-prey-morphology-and-size-on-handling-time-in-a-piscivore-the-largemouth-bass-micropterus-salmoides)

### 2.4 Seasons and winter
- **Season:** crayfish rise from 14 % (May) to 80–83 % (Jul–Sep) at Nebish. Clady's Michigan lakes show the reverse (31 % in June, 2 % in Aug–Sep), probably because YOY fish were abundant there.
- **Eastern Maine:**
  - late in the season, adult bass on the St. Croix lakes add fish and bed invertebrates [snippet, Willis 2008];
  - **YOY bass in 7 Maine/NB lakes** eat mostly cladocerans (Sididae > 90 % in Meddybemps) plus mayfly and midge larvae ([Willis 2006](https://www.cybrary.friendsofmerrymeetingbay.org/Alewife/MaineRiversStCroixReportFinal.pdf) [primary]).
- **Winter:**
  - adult bass "do absolutely nothing over the winter" (Ridgway, Ontario MNR, [popular](https://www.outdoorcanada.ca/keeping-fall-smallmouth-in-your-livewell-all-day-you-may-be-killing-them/));
  - stomachs are mostly empty from late fall to spring (PWE).

### 2.5 Consumption of perch by bass [surrogate regions]
- **South Dakota glacial lakes** (Dembkowski et al. 2015, *NAJFM* 35:736) — bioenergetics:
  - age-0 perch were **0–42 % of bass diet by weight** (2008) and 0–20 % (2012–13);
  - bass ate **0.06–0.33 kg/ha/week**, against perch production of 0.32–1.78 kg/ha/week, i.e. **1–34 % of age-0 perch production**.
  - [abstract] [SDSU](https://openprairie.sdstate.edu/nrm_pubs/54)
- **Lake Cascade, Idaho** (Marciniak et al. 2025, *NAJFM*, doi 10.1093/najfmt/vqaf062):
  - stomachs from 1,099 perch, 440 smallmouth and 980 pikeminnow;
  - perch eaten per predator per year: smallmouth 3.4 kg, perch (cannibals) 6.0 kg, pikeminnow 9.9 kg;
  - together up to **37 % of age-0 perch production**;
  - yellow perch ≈ 45 % of bass diet energy, crayfish 40 % (100–500-mm bass).
  - [abstract] [USGS](https://www.usgs.gov/publications/food-habits-yellow-perch-smallmouth-bass-and-northern-pikeminnow-lake-cascade-idaho)
- **Mille Lacs, MN** (n = 514 bass diets): smallmouth ate mainly crayfish and cisco, few perch ([MN DNR IR576](https://files.dnr.state.mn.us/publications/fisheries/investigational_reports/576.pdf) [agency][primary]).

### 2.6 Realistic adult-smallmouth diet for Hot Brook [inf]
- **Annual, by mass:**
  - **crayfish 35–55 %**;
  - **fish 35–50 %** (YOY and yearling yellow perch first, then white perch, sunfish, fallfish and dace, killifish, YOY suckers; bullhead ~0);
  - **insects, tadpoles and other 5–15 %**.
- **By season:** May fish- and insect-heavy; crayfish peak Jul–Sep; near-zero intake under ice.
- **The sim's 65 % crayfish** fits a clear rocky lake (Nebish, Nipissing) better than Hot Brook's weedy, perch- and white-perch-rich basins.
- **Caveat:** all the classic numbers are % by volume. Crayfish shell is poorly digestible, so crayfish are a smaller share of energy than of volume [inf, general].

---

## 3. Yellow perch mortality, and how much of it is predation

### Takeaway
- In lightly fished or unfished small lakes with esocids and/or bass, **age-1+ perch die at A ≈ 35–70 %/yr (Z ≈ 0.45–1.2)**, almost all of it natural.
- The best small-lake values:
  - **Mill Lake, MI, closed to fishing: 70 %**;
  - **Murphy Flowage, WI: natural ≈ 55 %**;
  - Nebraska Sand Hills mean 38 %;
  - South Dakota ~40 percentage points natural;
  - **Cassidy Lake, MI: 80–96 %** (some of it angling).
- Lake-wide predation shares are rarely measured. The evidence:
  - **cormorants alone took 7.7 %/yr** of adult Oneida perch;
  - pike were reported as ~19–45 % of natural mortality in Dauphin Lake [snippet, unverified];
  - predators **cut perch biomass by 69 %** across 18 recolonised Sudbury lakes;
  - bass ate 1–37 % of age-0 perch production in two studies.
- **The sim's < 1 %/yr is at least 10–40× too low.**

### 3.1 Annual mortality of age-1+ and adult perch

| System | Predators | Method | Perch A (%/yr) | Tag / source |
|---|---|---|---|---|
| **Mill Lake, MI** (Waterloo Area; closed to fishing) | largemouth 12 lb/acre; pike 2–9 lb/acre (Mill and Sugarloaf); bowfin ~3 lb/acre | catch curve | **70, all natural** (the slowest-growing perch, 14 lb/acre) | [primary] Schneider 1973 [MI DNR RR1792](https://www2.dnr.state.mi.us/Publications/PDFS/DNRFishLibrary/ResearchReports/RR1701-RR1800/RR1792.pdf) |
| **Cassidy Lake, MI** (19 ha, max 3.4 m, weedy; 1964) | largemouth 9.9 lb/acre; grass pickerel (356 fish, ~1 lb/acre); bowfin 81 fish (5.3 lb/acre); **no pike** | mark–recapture + rotenone; age frequency | **80–96** ("extremely high"; partly angling; uneven recruitment possible). Bluegill 63, pumpkinseed 68. Only ~4 perch/acre > 7 in | same [primary]. A sub-researcher could not read the scan; my pdftotext extraction had a usable text layer |
| **Murphy Flowage, WI** (73 ha flowage; compulsory creel 1955–69) | northern pike, largemouth | creel + population estimates (Snow 1978, Table 7) | total ≈ 61, angling ≈ 5, **natural ≈ 55** (garbled OCR row, decoded [inf]); Table 8 natural without fishing 61* (*insufficient data). Brown bullhead 50 / 2 / 48; bluegill 61 / 12 / 46; pumpkinseed 72 total, 60 natural; panfish natural mean 46 | [primary, OCR] [UW digital](https://digital.library.wisc.edu/1711.dl/KH4D4DMC2EZ3J9E) ([PDF](https://asset.library.wisc.edu/1711.dl/2B3XVRMR62PEK8V/E/file-11156.pdf)) |
| Nebraska Sand Hills, 30 lakes, 1998–99 | many with pike and largemouth | catch curves | **mean 37.9** ("similar to other lightly exploited" populations) | [abstract] Paukert, Willis & Glidden 2001, [Great Plains Res. 11](https://digitalcommons.unl.edu/greatplainsresearch/565/) |
| South Dakota glacial lakes | pike, walleye, bass | catch curves; East 81 Slough creel + tags | typically > 45. East 81 Slough: 48, of which ~40 points natural, exploitation 7 | [abstract] Isermann 2003 [thesis](https://openprairie.sdstate.edu/etd/478) |
| Oneida Lake, NY | walleye, cormorants | Rudstam et al. 2004 *Ecol. Appl.* | **cormorants alone 7.7 %/yr of adults** (walleye 1.1 %/yr from cormorants); subadult (age 1–2) mortality higher in the 1990s | [abstract] [USGS](https://www.usgs.gov/publications/cormorant-predation-and-population-dynamics-walleye-and-yellow-perch-oneida-lake); [NYSDEC 2024](https://dec.ny.gov/sites/default/files/2024-05/oneidalkfisheries.pdf) [agency] |
| Dauphin Lake, MB | northern pike | ? | natural ≈ 61; pike ≈ 19 % (♀) and 45 % (♂) of natural mortality | **[snippet, UNVERIFIED]** *TAFS* 120:739 (1991), [T&F](https://www.tandfonline.com/doi/abs/10.1577/1548-8659(1991)120%3C0739:ROPAPI%3E2.3.CO;2) (403) |
| Western Lake Erie model (GLFC TR39) | — | assumed (Red Lakes MN) | natural 22.5; 15 % at age III rising to 27–30 % at VII–VIII | [primary; assumed values] [GLFC](https://www.glfc.org/pubs/TechReports/Tr39.pdf) |
| Large or exploited systems (context) | — | — | Lake Michigan ♀ 4+: 60–69; Les Cheneaux MI 67–78 even after fishing collapsed; Lake St. Pierre QC Z ≈ 1.35–1.45; Albemarle Sound NC Z = 0.35; W. Lake Superior mostly natural, rising after maturity | [snippet/abstract]; [Fitzpatrick SEAFWA](https://seafwa.org/sites/default/files/journal-articles/Fitzpatrick-10-16.pdf); [Bronte et al. 1993](https://pubs.usgs.gov/publication/1000632) |

**Generic estimators [inf]** (for scale; not perch-specific measurements):
- **Lorenzen (1996), natural ecosystems, M = 3.0·W^−0.288:**

  | Perch | M (/yr) | A (%/yr) |
  |---|---|---|
  | 10 cm (~10 g) | 1.55 | 79 |
  | 13 cm (~22 g) | 1.23 | 71 |
  | 15 cm (~35 g) | 1.08 | 66 |
  | 20 cm (~85 g) | 0.83 | 57 |

- **Then et al. (2015), from maximum age:** tmax 9–11 gives M ≈ 0.54–0.65 (A 42–48 %).
- **Field and estimators agree on this:** small perch (8–15 cm) in a lake with piscivores should lose **well over a third, and more likely half or more, of their number each year**.

### 3.2 Share of mortality from predation; consumption
- **Whole-lake comparisons [surrogate predators]:**
  - **Sudbury, Ontario, 18 lakes recolonised by pike, walleye and smallmouth:**
    - Nordic gill nets: perch biomass **1,497 g/net with no predators (n = 6), 695 with recent predators (n = 4), 357 with established predators (n = 8)**, i.e. −69 %;
    - with predators, perch switched to benthos at 83 mm instead of 140 mm and took a littoral body form;
    - (Lippert, Gunn & Morgan 2007, *CJFAS* [primary] [PDF](https://laurentienne.ca/assets/files/Living-With-Lakes/Restoration%20Ecology/Lippert-2007-CJFAS.pdf).)
  - **West Long Lake, NE, after pike established** (35.8/ha, 22 kg/ha): perch abundance and size structure fell, growth rose (DeBates, Paukert & Willis 2003 [abstract] [USGS](https://www.usgs.gov/publications/fish-community-responses-establishment-a-piscivore-northern-pike-esox-lucius-a)).
  - **Sand Hills:** perch size structure is lower in lakes with pike (Paukert & Willis 2003 [abstract], and NP).
- **Pike diets [surrogate]** (more in NP):
  - Voyageurs NP: > 60 % fish by mass, mainly perch, in every season;
  - three southern Minnesota lakes: **60–78 % perch by mass** ([BSU](https://pines.bemidjistate.edu/j-earth-life-sci/18) [abstract]);
  - Mille Lacs: n = 1,029 pike diets, mainly perch (IR576 [agency]);
  - Spirit Lake, IA: perch preferred regardless of their abundance.
- **Walleye [surrogate]:** at Oneida in 1971–73, age-0 perch were > 90 % of walleye diet (2,653 stomachs; [Lantry et al. 2008](https://www.esf.edu/biology/faculty/documents/66.Lantryetal2008walleye.pdf) [primary]). Forney 1974: young-perch abundance governs walleye predation on other forage ([abstract](https://academic.oup.com/tafs/article-abstract/103/1/15/7895611)).
- **Windermere, Eurasian perch [surrogate]:**
  - of 3,103 perch tagged in 1943–44 only 3 % were recaptured, the loss attributed partly to "predation of pike and other causes"; 21 % of 9,726 tagged in 1948–53 were recaptured ([Kipling & Le Cren, FAO](https://www.fao.org/4/aa043b/AA043B17.htm) [primary]);
  - more pike shifted perch stock–recruitment from compensation to depensation (Langangen et al. 2011, *Fish. Res.* 109:131 [abstract] [NORA](https://nora.nerc.ac.uk/id/eprint/8997/));
  - the classic "pike ate X % of perch production" figure (Kipling & Frost 1970; Le Cren) was **not retrieved**.
- **Bass on age-0 perch:** 1–34 % (SD) and up to 37 % with three predators (ID) of production (§2.5).
- **Birds (relevant to Hot Brook).** Oneida cormorants 7.7 %/yr of adults. At Hot Brook the user has seen **bald eagles and a common merganser brood**. Loons are scripted in the sim.

### 3.3 Consumption check for Hot Brook [inf]
- **Pickerel consumption.** Piscivore consumption/biomass Q/B ≈ 4 /yr (Bay of Quinte smallmouth 4.07; Florida "gar/bowfin/pickerel" 4.0; whole_lake_energy_flow.md). A Maine pickerel with ~5 months of ice is perhaps 3–4.
- **Perch per kg of pickerel.** With 65–85 % fish and 15–35 % of the fish mass yellow perch (§1.5), each **kg of adult pickerel eats ~0.3–1.2 kg of perch a year**.
- **Lake-wide.**
  - At a pickerel biomass of 3–8 kg/ha (PMC: the sim's ~25/ha; pike in small lakes 5–22 kg/ha), that is **~1–10 kg/ha/yr of perch, central ~3**.
  - The sim's perch ≥ 7.5 cm (500/ha × ~15–25 g) are **~7–12 kg/ha**, with production at P/B ≈ 0.6 of ~4–7 kg/ha/yr.
- **Result.** Even after allowing that part of what pickerel eat is YOY perch, **pickerel alone should remove on the order of 10–40 % of age-1+ perch biomass a year**. Bass, large white perch and perch cannibals add to that.
- **The sim's < 1 %/yr equals < 0.1 kg/ha/yr**, i.e. 1–3 % of what the arithmetic predicts.

### 3.4 Age-0 perch (first year)
- **Oneida Lake 1961–2003** (Irwin et al. 2009, *TAFS* 138:99) — [primary](https://academic.oup.com/tafs/article/138/1/99/7888582):
  - larval mortality 8–18 mm: **Z = 0.042/day ± 0.005** (9 years);
  - limnetic mortality (18 mm to 1 Aug) rose over the decades; demersal mortality (1 Aug–15 Oct) fell;
  - the 1960s walleye-driven density dependence has disappeared;
  - winter mortality falls as end-of-year length rises (R² = 0.38).
- **Nebraska Sand Hills (5 lakes, 2004–10):** catch rates similar from fall to spring, so overwinter loss was small (Jolley et al. 2013 [abstract] [SDSU](https://openprairie.sdstate.edu/nrm_pubs/94)).
- **Post & Evans 1989** (*CJFAS* 46:1958): overwinter mortality is size-dependent and starvation-driven [review].
- **Fate of most perch (Saginaw Bay):** most perch die before reaching piscivorous size even with few walleye (MI DNR) [snippet].
- **Density-based YOY predation** is covered by YPF and by the stage-Y1 code. This note concerns the **≥ 7.5-cm** fish that the adult `_strike` rule handles.

---

## 4. Prey selection and vulnerability

### Takeaway
- **Esocids** rank prey roughly: soft-rayed fusiform (shiners, minnows, chubsuckers, shad, killifish, dace) > **yellow perch ≈ centrarchids** (for pike ≥ 30 cm) > bullheads.
- **Small pike** take perch much less readily than shiners: 2/10 vs 10/10.
- **Capture per strike** on deep-bodied sunfish is ~1/5 of that on minnows.
- **Bullhead spines** strongly deter pike in aquaria. In the field, large pickerel and largemouth still select small, slow bullheads.
- **Handling time** rises with prey body depth and spines.
- **Per-capita risk** falls with school size by less than 1/n.
- **No fish study fits an exponent.** A per-capita ∝ n^−0.5 to n^−0.7 is defensible for bass and perch predators. Esocids show little confusion: pike succeeded on 70 % of attacks on shiner schools.

### 4.1 Rankings, preferences and capture success
- **Beyerle & Williams 1965** (MI IFR 1704 = R&D Rep. 28; published *TAFS* 97:28, 1968) — aquarium trials, no cover, usually 10 prey per category [primary] [PDF](https://www.dnr.state.mi.us/PUBLICATIONS/PDFS/DNRFishLibrary/ResearchReports/RR1701-RR1800/RR1704.pdf):
  - **Soft-rayed vs spiny.** Pike of 6.2–7.9 in (n = 6) ate **golden shiner 10/10, bluegill 5/10, yellow perch 2/10** (P < 0.005).
  - **Perch vs sunfish, larger pike.** Pike of 12–14.5 in (n = 4) ate **green sunfish 9/12 and yellow perch 9/12** (no difference).
  - **Bullhead vs sunfish.** One 11.5-in pike ate green sunfish 10/10 and **bullheads 0/10** (P < 0.001). Pike watched swimming bullheads but would not attack. The only bullhead ever eaten was taken after the other food ran out; that pike "died soon after a pectoral spine punctured its stomach".
  - **Prey size.** Pike of 7–12 in took 1/50 of the largest pumpkinseeds (2.9–3.3 in): optimum ~1.5 in, maximum ~3 in. For 13–23-in pike: optimum ~2.5 in, maximum ~4.5 in (sunfish).
  - **The authors' summary:** minnows and chubsuckers over centrarchids and perch; no choice between centrarchids and perch; centrarchids over bullheads.
- **Mauck & Coble 1971** (correct citation *J. Fish. Res. Board Can.* 28:957–969, not *TAFS*), pike vulnerability tiers — via Guillory [review]:
  - **high:** gizzard shad, carp, bigmouth buffalo, fathead minnow, **smallmouth bass**;
  - **intermediate:** white sucker, green sunfish, largemouth, golden shiner, **yellow perch**;
  - **low:** channel catfish, northern pike, bluegill, **black bullhead**.
  - Pike kept selecting preferred prey as it was depleted.
- **Weithman & Anderson 1977** (*TAFS* 106:424): esocid vulnerability highest for gizzard shad, goldfish and golden shiner; intermediate for bluegill and largemouth; lowest for channel catfish. [review via Guillory]
- **Capture per strike** (detail in RF §3.1):
  - pike, muskellunge and tiger muskellunge: **bluegill 0.14, fathead 0.67, gizzard shad 0.78** (Wahl & Stein 1988). The snippet's "0A4" is 0.14; Moody et al. 1983 independently found ~0.13 on bluegill vs ~0.5 on fathead;
  - **pike on roach 0.15; 0.36 from ambush vs 0.12 in pursuit** (Turesson & Brönmark 2004);
  - chain pickerel caught 23 of 30 filmed strikes on goldfish and golden shiners (Rand & Lauder 1981).
- **Capture success vs relative size** (YPF): roughly **1.0 − 1.0·r for soft prey** and **0.70 − 1.34·r for spiny prey** (juvenile predators; Miller 1988, Scharf 2003).
- **Handling time.**
  - Largemouth: crayfish > bluegill > perch > stickleback > minnow > tadpole at equal length; optimal r 0.22–0.29 (Hoyle & Keast 1987 [abstract]).
  - Pike: handling time rises with prey body depth, and the bream–roach difference vanishes once depth is accounted for. Pike chose shallow-bodied roach and small prey, so vulnerability was set by risk, behaviour and pike preference, not by gape (Nilsson & Brönmark 2000, *Oikos* 88:539 [abstract] [LUP](https://lup.lub.lu.se/record/146726)).
- **Field preference** (Guillory, Florida): large pickerel are selective (§1.2).
  - **Not located:** Eklöv & Hamrin 1989, Christensen 1996, the Bean & Winfield 1995 "rudd > roach > perch" claim (the paper found is a habitat study), and Chapleau et al. 1997.

### 4.2 Bullhead spines
- **Pike in aquaria:** 0/10 bullheads eaten; one pike killed by a spine (Beyerle & Williams, above) [primary].
- **Channel catfish vs largemouth [surrogate]:**
  - intact catfish had **~3× the survival** of spine-clipped ones (Bosher, Newton & Fine 2006, *Ethology* 112:188, via the Fine et al. AFS Catfish Symposium review [snippet], [fisheries.org](https://fisheries.org/?p=76487), 403);
  - locked pectoral spines **more than double the fish's width** [snippet];
  - fewer catfish eaten than goldfish or bluegill, while bluegill spines gave no protection against bass (Sismour et al. 2013, *Copeia* 2013:277 [snippet]; 403);
  - ingestion order goldfish > bluegill > catfish; handling time catfish > bluegill > goldfish; fewer catfish eaten when other prey were present (Nellis 2010, VCU thesis [abstract] [VCU](https://scholarscompass.vcu.edu/etd/129)).
- **Sticklebacks [surrogate]** (Hoogland, Morris & Tinbergen 1957, *Behaviour* 10:205): one pike ate all 12 spineless cyprinids within 5 days and sticklebacks only slowly; de-spined sticklebacks were treated like the spineless fish [review] [UC Davis fishlab](https://fishlab.ucdavis.edu/?p=47).
- **Field (the counterweight):**
  - brown bullhead 13.8 % FO in 234 NY pickerel (Raney);
  - **electivity +0.65 in Florida pickerel > 300 mm SL** (Guillory);
  - **largemouth positively selected small bullheads** at Murphy Flowage (Snow 1971 [snippet]);
  - in Nova Scotia, bald eagle diets feature bullheads and suckers (Mitchell et al., citing Dunstan & Harper 1975 and Todd et al. 1982);
  - in Virginia, eagle-nest spines were only 4 % brown bullhead (Duvall 2007 [abstract] [VCU](https://scholarscompass.vcu.edu/etd/1297));
  - spines gave bullheads no advantage against otters in Poland [snippet].
- **Reconciling the two [inf].** Spines cut attack willingness and raise handling cost and injury risk, especially for small esocids. But bullheads are slow, bottom-bound and easy to reach. Large pickerel and bass take the small ones when they meet them. A **moderate per-encounter vulnerability for small bullheads (≈ 0.3–0.5 of soft-rayed)** plus a **wider effective body depth** (spines locked) fits both lines of evidence.

### 4.3 Group size and per-capita risk
- **Pike on golden shiner schools** (Jolles et al. 2022, *eLife* 11:e76344 [primary] [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC9348852)):
  - 13 pike of 22.4 cm on schools of 40 golden shiners of 8.5 cm;
  - **88 of 125 attacks (70 %) succeeded**; 63 % were launched from partly inside the school; the nearest fish was attacked 73 % of the time;
  - pike approached the largest groups;
  - the authors say the data cannot give the risk–group-size scaling.
- **Perch and largemouth suffer confusion; pike do not:**
  - perch success 0.20 on single prey vs 0.03 into schools; pike 0.15 regardless (Turesson & Brönmark 2004);
  - largemouth trials ending in a capture: 100 % with 1 prey, 17 % with 8, 11 % with 15 (Landeau & Terborgh 1986) (RF §6.2).
  - **Conflict:** Neill & Cullen 1974 reported falling capture per attack with prey number (1 → 6 → 20) including for pike [review].
- **Other studies:**
  - cichlid predators preferred the larger guppy shoal (2 v 5 up to 10 v 16), so per-capita risk falls by less than 1/n (Krause & Godin 1995 [snippet]);
  - rock bass on creek chub shoals of 2–13: no effect of shoal size on success (Krause, Ruxton & Rubenstein 1998 [snippet]);
  - with largemouth present, each bluntnose minnow was approached less in larger shoals of 3–20 (Morgan & Colgan 1987 [abstract]);
  - **banded killifish with white perch:** fish in larger groups and in the core were less likely to be eaten; no confusion detected (Morgan & Godin 1985 [snippet]);
  - water striders followed pure 1/N dilution (Foster & Treherne 1981 [snippet, surrogate]).
- **Exponent [inf].** If a school of n is encountered at a rate ∝ n^a (predators find and prefer big groups) and loses one fish per successful attack, per-capita risk ∝ n^(a−1). The data suggest **a ≈ 0.3–0.5** for confusable predators (bass, perch) and **higher (~0.5–0.8)** for esocids, whose capture success holds in schools. The sim's n^0.5 (per-capita n^−0.5) sits within that range. For perch schools of 50–200 it is still a large protection factor (×0.07–0.14).

---

## 5. Brown bullhead and banded killifish as prey

### 5.1 Brown bullhead
- **In predator diets:**
  - pickerel 13.8 % FO (NY);
  - selected by pickerel > 300 mm SL (FL) and by largemouth (WI);
  - **no record in smallmouth diets** (§2.2);
  - refused by pike in aquaria (§4).
- **Parental care and young** [agency/review]:
  - fry leave the nest ~7 days after hatching in a loose school of hundreds, guarded by one or both parents ([McGill Quebec pages](https://redpath-museum.mcgill.ca/Qbp/fish/specpages/brownbullhead.htm));
  - parents accompany the young to **~2 in (≈ 5 cm)** ([Michigan DNR](https://www.michigan.gov/dnr/education/michigan-species/fish-species/bullheads)); maximum care **29 days** ([ADW](https://animaldiversity.org/accounts/Ameiurus_nebulosus), citing Blumer);
  - removing the parents cut offspring survival, mainly through predation (Blumer 1985, *Env. Biol. Fish.* [review]). Care by both sexes 56.2 %, male only 39.3 %, female only 4.5 %;
  - **no field survival rate for juveniles after care ends was found.**
- **Adult mortality without and with piscivores:**
  - **Moe Pond, NY** (15.6 ha, mean 1.8 m, unexploited, **only brown bullhead and golden shiner, no piscivorous fish**): bullheads age 1+ 260/ha, 13 kg/ha; **annual survival of ages 2–5 = 48 % (A = 52 %)** (McCoy, Madenjian, Adams & Harman 2001, *J. Freshw. Ecol.* [abstract] [USGS](https://www.usgs.gov/publications/fish-community-a-small-impoundment-upstate-new-york));
  - **Murphy Flowage, WI** (pike + largemouth): **A = 50 % (23–68), angling 2 %, natural 48 % (23–67)** (Snow 1978 [primary]);
  - Cassidy Lake, MI: bullheads 18 lb/acre (brown + black 900 fish, 12.5 lb/acre) [primary].
  - **Natural loss of ~50 %/yr is normal whether or not piscivorous fish are present.**
- **Lorenzen M [inf]:**

  | Bullhead | M (/yr) | A (%/yr) |
  |---|---|---|
  | 8 cm (~6 g) | 1.79 | 83 |
  | 15 cm (~40 g) | 1.04 | 65 |

- **Prevalence:** brown bullhead is in 69 % of 203 northeastern US lakes (Whittier et al. 2001, *Northeast. Nat.* 8:455 [abstract] [NYSM](https://nysm.nysed.gov/bibcite/reference/21057)).
- **For the sim [inf]:** a **1/3 fall of adults in a year is within natural mortality**. What matters is whether YOY schools recruit enough to replace them. Small bullheads (5–12 cm) are the vulnerable stage, and the field says large pickerel and largemouth do eat them.

### 5.2 Banded killifish
- **Life history** (COSEWIC 2014 [agency][read] [PDF](https://wildlife-species.canada.ca/species-risk-registry/virtual_sara/files/cosewic/sr_Banded%20Killifish_2014_e.pdf)):
  - **matures at age 1; maximum age 4 (Newfoundland); "few live as long as 3 years" in Minnesota; generation time 1–2 years**;
  - YOY reach 49.5 mm by mid-October in Lake Opinicon (Keast & Eadie 1984);
  - maximum fecundity ~250 eggs (Carlander 1969);
  - lives in shallow, clear, slow, vegetated water;
  - **probably leaves the shallows for deeper water in autumn** (by analogy with the blackstripe topminnow). Fyke-net data suggest **night moves into deeper rocky water** (Chippett 2004);
  - known predators: salmonids, American eel, belted kingfisher, **common merganser**.
- **Habitat:** often in water under 6 in (15 cm) (CT DEEP [agency], via sub-researcher). In shallow seine hauls (≤ 1.2 m) killifish are 74–93 % of the catch (SFN).
- **Natural mortality [inf]:**
  - Hoenig/Then from tmax 3–4: **Z ≈ 1.1–1.8, A ≈ 66–83 %**;
  - Lorenzen at 2.5–5 g: M 1.9–2.3, A 85–90 %.
  - **A two-thirds loss of adults per year is normal; the population persists only through annual recruitment.**
- **Predator impact, Nova Scotia** (Mitchell, LeBlanc & Heggelin; read in raw text order, since the table in the layout extraction is shifted):
  - **Lakes:** 15 small lakes (mean 15.8 ha, mean depth 2.7 m), 1,572 trap-hours of gill net, fyke net and baited minnow traps, May–Oct 2010.
  - **Non-pickerel lakes held:**
    - **banded killifish in 3 lakes (1, 14 and 7 fish)**;
    - yellow perch in 4 (47, 5, 96, 27);
    - golden shiner in 7;
    - brown bullhead in 5 (11, 259, 5, 41, 17).
  - **The 3 lakes with introduced pickerel** (≈ 1998, 2002, 2007) held **only pickerel and large white suckers** (32–47 cm, mean 39.1, n = 14, vs 12.2–35.0 cm, mean 21.8, n = 72 elsewhere; i.e. no sucker recruitment).
  - **Catch rate:** 0.047 vs 1.04 fish per trap-hour (p = 0.031).
  - **Authors' conclusion:** "total loss of small bodied fish species".
  - **Caveats:**
    - pre-introduction communities are unknown;
    - one night per lake;
    - killifish are under-sampled by gill nets;
    - these were invasions of naive prey communities.
  - [primary]
- **Coexistence in the native range:** across northeastern US lakes, banded killifish occur in 26 % and chain pickerel in 45 % (Whittier et al. 1999/2001 [abstract]).
  - In Maine, pickerel are native only to the southwest. They were transplanted "routinely" through eastern Maine in the 1800s (MDIFW).
  - **Hot Brook's killifish have therefore coexisted with pickerel for over a century** (MDIFW's 1949 survey lists both) [inf].
- **Smallmouth effects [surrogate prey]:**
  - in 14 small Ontario lakes, those with bass had **2.3 fewer small-bodied species**. Fathead, *Phoxinus*, brook stickleback and pearl dace were absent from every bass lake. Pumpkinseed (4.76 vs ~1.0 per trap) and yellow perch (0.53 vs 0.28) were *more* abundant in bass lakes. Vulnerable species were more abundant in complex habitat (MacRae & Jackson 2001, *CJFAS* 58:342 [primary]; killifish not present);
  - removing > 90 % of smallmouth (47,682 fish) from a 271-ha Adirondack lake raised six native littoral species **4–90×** within 2 years (Weidel et al., *TAFS* 136:778 [snippet]).
- **Pickerel eating killifish specifically:** no northeastern record. The only quantified selection is Guillory's Florida congeners: selected by pickerel < 300 mm SL, avoided by larger ones (§1.2).
- **For the sim [inf]:**
  - a 2/3 annual loss of adult killifish is normal;
  - **persistence needs (a) a strong annual recruitment and (b) a refuge**: water < 15–30 cm in summer, below pickerel's 0.6–3-m range, plus dense vegetation;
  - in autumn and winter, when killifish move deeper and pickerel keep feeding, exposure should rise;
  - if the sim's killifish are falling because predators reach them in their summer shallows, the refuge is too weak.

---

## 6. Habitat overlap: perch of 8–15 cm vs pickerel
Most of the habitat evidence is already in HAB §1–2. New points from this pass:

- **Pickerel:**
  - weedy water 0.6–3 m most of the year;
  - **half of all depth-tag detections at 0.76–1.82 m** (Milipsigate Lake NS telemetry, HAB);
  - active under ice by day.
- **Adult perch > 22 cm in simple basins** sit offshore over open bottom and avoid weeds:
  - Lake Sinai SD: 57 adults of 230–268 mm, mean 6.1 m deep, 271 m from shore, **never located in vegetation**; smaller adults deeper (6.4 vs 4.7 m) (Bauer 2006 [abstract]);
  - Lake Madison SD: 1.2–4.3 m, summer mean 3.4 m and 344 m offshore; 92.6 m/h by day vs 27.6 at night (Radabaugh 2006 [abstract]).
- **Small perch (8–15 cm) under predation shift littoral:**
  - Sudbury perch with predators turned benthic at 83 mm instead of 140 mm and took a littoral body form (Lippert et al. 2007 [primary]);
  - age-0 Eurasian perch prefer vegetation when pike are present (Snickars et al. 2004 [abstract, surrogate]);
  - in pike lakes, perch were caught mainly along the littoral (Persson et al. 1996 [snippet, surrogate]).
- **No study showed yellow perch using open water as a refuge from pike or pickerel.**
- **Shallow unstratified analogue: Lake Opinicon, ON** (787 ha per Keast & Fox 1992; the QUBS page for Keast 1985 says 2,200 ha, a **conflict**; < 11 m, more than half < 5 m; plants to 3.5 m):
  - perch were one of five dominant offshore species, in gill nets at 1.5–7 m by day and night (Keast & Fox 1992 [abstract] [QUBS](https://research.qubs.ca/projects/space-use-and-feeding-patterns-of-an-offshore-fish-assemblage-in-a-shallow-mesotrophic-lake));
  - yet 80–90 % of all fish biomass lay at ≤ 2.5 m (Keast & Harker 1977, via HAB).
- **Early winter:** perch at first ice in "shallow water in around healthy green vegetation", later deeper (MN DNR, via HAB). Pickerel stay in the shallow weeds and feed (Maine ice catch rates).
- **For Hot Brook [inf]:**
  - Lower's maximum is ~4 m and Upper's 5.5 m, against plant growth to ~3–3.5 m in tea-coloured water. **There is little or no deep offshore refuge.**
  - 8–15-cm perch should spend much of the day at the weed edge or over open bottom in 1.5–4 m, at dawn and dusk moving inshore, and at night resting on the bottom inshore.
  - That overlaps pickerel at the outer weed edge for hours a day, and strongly at first ice.
  - A sim in which perch schools sit out of pickerel strike reach nearly all day misses that.

---

## 7. Implications for the sim

### 7.1 Target ranges

**Chain pickerel, 30–45 cm, annual diet by mass** (§1.5):

| Component | Target | Sim |
|---|---|---|
| All fish | **65–85 %** | 53 % |
| Older fish (age-1+) | **35–60 %** | 15 % |
| YOY fish | 20–40 % | 38 % |
| Crayfish | **10–30 %** | 42 % |
| Insects and odonates | 3–10 % | — |
| Frogs and other | 1–5 % | — |

**Within fish** (by mass; by number the small soft-rayed fish will rank higher):

| Prey | Target share of fish mass |
|---|---|
| Yellow perch | **15–35 %** |
| White perch | 5–20 % |
| Sunfish | 5–15 % |
| Fallfish, dace, killifish, young sucker | 15–35 % |
| Bullhead | 3–10 % |
| YOY smallmouth | 1–5 % |

- **Older-fish kills by number** (the statistic quoted from the sim): killifish ≤ 15–25 %, bullhead ≤ 10–20 %, **yellow perch ≥ 15–30 %**, white perch and sunfish together ≥ 10–20 % [inf].
- **Season:**
  - winter: perch- and minnow-heavy, with crayfish near zero;
  - May–June: age-1+ fish and pulses;
  - July–October: YOY rising;
  - stomachs often empty; usually one prey per meal.

**Smallmouth bass, adults, annual diet by mass** (§2.6):
- crayfish **35–55 %** (sim 65 %), peaking Jul–Sep;
- fish **35–50 %** (YOY and yearling perch first), insects and other 5–15 %;
- ~0 bullhead; killifish possible but unrecorded;
- near-zero intake under ice.

**Yellow perch (≥ 7.5 cm) mortality:**
- **total natural A ≈ 35–60 %/yr** (Z 0.45–0.9; uniform 0.8–1.75 %/wk). Up to ~70 % (Mill Lake) where fish are small and slow-growing.
- **Fish predation (pickerel + bass + cannibal and white perch) ≈ 15–35 %/yr at 7.5–15 cm** (≈ 0.3–0.8 %/wk averaged over the year).
  - Most of it falls in open water and at first ice.
  - It declines steeply above ~18–20 cm, as perch outgrow the gape of most pickerel (r > 0.45–0.5 for a 40-cm pickerel).
- Birds (Hot Brook has eagles and mergansers; the sim has a loon) add ~5–10 %/yr (Oneida cormorants 7.7 %).
- **The sim's < 1 %/yr is 15–35× below the fish-predation target.**
- **Consumption cross-check:** each kg of pickerel should eat ~0.3–1.2 kg of perch a year (§3.3).

**Brown bullhead:**
- adults A ≈ 45–55 %/yr (Moe Pond 52 % without piscivores; Murphy Flowage 50 %), mostly not from fish predators once > 15 cm;
- small bullheads (5–12 cm, after guarding ends at ~5 cm, ~1 month) carry most of the fish-predation risk;
- **a 1/3 annual fall in adults is acceptable only if recruitment replaces it.** Track YOY schools to age 1–2 (memory: stage-survival audit).

**Banded killifish:**
- adults A ≈ 65–85 %/yr (tmax 3–4), so **a 2/3 annual fall is normal**;
- the population must be refilled each year by recruitment;
- with pickerel present for 150 years, real Hot Brook killifish persist through a very-shallow refuge (< 0.15–0.3 m in summer) and dense plants;
- killifish should be prey mainly of small pickerel (< 30 cm), bass, white perch, mergansers and kingfishers, and in autumn when they move deeper.

### 7.2 Most defensible selectivity numbers
- **Relative per-attack vulnerability** (soft-rayed fusiform = 1.0), for esocids ≥ 30 cm:

  | Prey | Value | Basis |
  |---|---|---|
  | Killifish, dace, fallfish, young sucker | 1.0 | the reference: soft-rayed fusiform prey (Beyerle: golden shiner 10/10; Mauck & Coble high tier: fathead, shad). Note that Mauck & Coble put golden shiner and white sucker in the *same* intermediate tier as yellow perch |
  | Yellow perch | **0.6–0.9** | Beyerle: = sunfish for 30–37-cm pike; Mauck & Coble intermediate |
  | White perch | ~0.5–0.7 [inf] | deeper and spinier than yellow perch |
  | Sunfish | **0.2–0.5** | capture per strike 0.14/0.67 ≈ 0.2 (Wahl & Stein); Beyerle large pike: sunfish = perch |
  | Small bullhead | **0.3–0.5**, with spines widening the effective body (×1.5–2 width) [inf] | aquarium ~0; field positive electivity |
  | YOY smallmouth | 0.8–1.0 | Mauck & Coble high tier |

- **For small pickerel (< 25 cm):** perch drops to ~0.2–0.4 and bullheads to ~0 (Beyerle's small pike: perch 2/10 vs shiner 10/10).
- **The sim's present values:** perch 0.6, bullhead 0.4, killifish 1.0, pumpkinseed 0.35, fallfish 0.7, white perch 0.55. These are within or near these ranges. **Vulnerability is not the main problem.**
- **Size window (the main problem).**
  - **Realised prey length ratio:** median ~0.15–0.30, mean ~0.30 for adult pickerel. Maximum ~0.55 for fusiform prey, ~0.45–0.5 for perch [inf], ~0.37 for sunfish (Lawrence).
  - **The sim's (1 − bdep/gape)²** gives these weights for a 35-cm pickerel:

    | Prey | Size weight × vulnerability |
    |---|---|
    | killifish 6 cm (r 0.17) | 0.50 |
    | bullhead 8 cm | 0.17 |
    | perch 10 cm (r 0.29) | 0.14 |
    | perch 13 cm (r 0.37) | 0.07 |
    | white perch 13 cm | 0.01 |
    | pumpkinseed 8 cm | 0.04 |

    That is **~4–8× in favour of the small killifish over a 10–13-cm perch**, before schooling.
  - **Field-type size rules give a smaller gap.** Linear capture-success rules (soft 1 − r, spiny 0.70 − 1.34·r; YPF), with encounter rising with prey size (reaction distance ∝ prey length; RF §1.4), give a **~1.5–2.5× gap**, with a realised mean prey r near 0.25–0.3.
  - **Suggested replacement.** Use a size term that is roughly flat to r ≈ 0.25–0.3 and falls to 0 at the shape-specific maximum, e.g. sel = max(0, 1 − (r/r_max)^k) with k ≈ 2–3 [inf]. r_max comes from the existing depth/gape rule (bdep ≤ gape), optionally capped at 0.55. Alternatively keep (1 − bdep/gape) with exponent 1, and add a prey-size factor (∝ prey length) to the encounter weight.
- **School term.** Per-capita risk ∝ n^(a−1) with **a ≈ 0.5–0.8 for esocids** (no confusion; pike attack from inside schools at 70 % success) and **0.3–0.5 for bass and perch** [inf]. The current single 0.5 is acceptable for bass. It is protective for perch schools against pickerel; consider 0.6–0.7 for esocids.
- **Habitat.** Ensure 8–15-cm perch spend part of the day (dawn and dusk, and when foraging benthically) at the 1–3-m weed edge, and are shallow at first ice. Perch must not be fully separated from pickerel; the real lakes have no deep refuge.
- **Killifish refuge.** Strengthen the very-shallow refuge for fish < ~8 cm in water < 0.3 m in summer: real pickerel hold 0.6–3 m, and killifish are often in < 15 cm. Let killifish move deeper in autumn and winter. Today `SHALLOW_REFUGE` 0.6 × clamp((0.8 − bed)/0.6) gives at most 0.6 cover.
- **Bullhead.** Keep vulnerability ~0.4, and treat spine-locked width as an effective body depth ~1.5× `depthR` [inf]. The bullhead share of pickerel kills will then fall to the ~10–20 % range, and bass kills of bullheads stay near zero.

### 7.3 Checks to run (≥ 3 seeds, per CLAUDE.md)
1. **Pickerel diet by mass and by number** over a year, against §7.1; also by season.
2. **Annual loss of perch ≥ 7.5 cm to fish predators** (target 15–35 %/yr; currently < 1 %/yr), by size class (7.5–10, 10–15, > 15 cm).
3. **Killifish and bullhead:** separate adult mortality from recruitment (YOY → age-1 survival). A 2/3 or 1/3 adult loss is normal; a falling population is not, over 3–5 years.
4. **Consumption check:** perch eaten per kg of pickerel per year ≈ 0.3–1.2 kg.
5. **Smallmouth crayfish share** ~35–55 % by mass annual, with a summer peak.

### 7.4 Biggest uncertainties
- **Warner 1973** (Maine spring pickerel diet) was not read. It is the single most useful missing source.
- No under-ice pickerel stomach data.
- No pickerel-on-perch consumption measured anywhere.
- No Maine perch mortality.
- The Dauphin Lake pike share is unverified.
- The Murphy Flowage perch row was decoded from garbled OCR.

---

## 8. Access log
- **Read in full, or text extracted via pdftotext:** MDIFW *Chain Pickerel Assessment* (www1.maine.gov copy; the sub-researcher got 403 on other maine.gov pages); Mitchell et al. (novascotia.ca; also hosted by the author's lab at ap.smu.ca); LaHave 2019; Guillory 1979; Buntz 1966; Lawrence 1958; Christensen 2022; Tester 1932; Serns & Hoff 1984; Snow 1978; Schneider 1973; Beyerle & Williams 1965; COSEWIC 2014; Lippert 2007; Lantry 2008; NYSDEC Oneida 2024; MN DNR IR576; GLFC TR39; Gaeta 2018; Jolles 2022; Irwin 2009; Kipling & Le Cren (FAO).
- **Blocked (403, login or paywall), not bypassed:**
  - JSTOR (Raney 1942; Foote & Blake 1945; Underhill 1949);
  - T&F / OUP paywall (Warner 1973; Dauphin Lake 1991; Weidel 2000; Olson & Young 2003);
  - Canadian Science Publishing;
  - Wiley;
  - Springer;
  - the ASIH/BioOne Copeia page;
  - fisheries.org;
  - the MDIFW Black Bass plan and Orange Lake survey map;
  - the SMU repository;
  - UMass ScholarWorks;
  - Deep Blue;
  - BHL (Crossman 1973; Coffie 1998);
  - kb.osu.edu (Armbruster 1959);
  - core.ac.uk;
  - Cornell eCommons (429).
  - A proxy mirror of a Springer paper appeared in results and was not used.
- **Not found:** Eklöv & Hamrin 1989; Christensen 1996; Turner & Pitcher 1986; Chapleau et al. 1997; Kipling & Frost 1970 consumption figures; Scott & Crossman text; any northeastern under-ice pickerel diet; any Maine smallmouth diet study (the UMaine Digital Commons theses moved to "Specto" on 30 Jun 2026 and were not searched).
- **Search budget:** the shared limit of 200 web searches per turn was reached. Further searching needs a follow-up session.
