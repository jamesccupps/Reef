# Largemouth bass (Micropterus salmoides) in north-temperate bass–bluegill lakes: spawning, first year, adult feeding and condition, population

Scope and sourcing. The notes favour the Upper Midwest, Great Lakes and Ontario (Michigan, Wisconsin and Minnesota lakes). Southern ponds and reservoirs (Alabama, Virginia, Ohio, Oklahoma, Mississippi) are used only where no northern data exist, and they are flagged as **[S]**. Abstracts were read from the publisher's or OpenAlex's records. Full texts were read for the Michigan DNR reports (Carbine 1948; Laarman & Merna 1980; Goudy 1981; Laarman & Schneider 1985; Wagner 1988; Bremigan et al. 2008), the Wisconsin DNR species account and lake surveys, and Ludsin & DeVries 1997.

Unit conversions are mine:
- 60 °F = 15.6 °C; 62–65 °F = 16.7–18.3 °C; 50 °F = 10 °C.
- 1 in = 25.4 mm; 1 lb = 0.4536 kg; 1 acre = 0.4047 ha.

Model note for the reader:
- The sim's "condition K" is W / Ws(L) (`bioenergetics.js`). It is therefore **Wr/100 (relative weight), not Fulton's K**.
- In the units used for Fulton's K (g, cm TL), a largemouth bass at standard weight has a Fulton's K of about 1.4–1.55 (see the Population section).
- The sim's bass Ws (`a = 0.005559, b = 3.273`, cm) is numerically the Wege & Anderson (1978) equation (log10 W = −5.528 + 3.273·log10 TL mm), not Henson's (1991). The two differ by under 3 % over 250–450 mm.

---

## Q1. Spawning: temperature and timing, nests, fecundity, hatch and swim-up, male guarding, nest success, and the role of condition (Wr/K) and skipped spawning

### Takeaway
North-temperate largemouth bass:
- **Timing.** Males build nests once water passes about **15.6 °C (60 °F)**; eggs are laid at **16.7–18.3 °C (62–65 °F)**. Bass are **always the first centrarchid to spawn**: in a Michigan lake they finished in some years before bluegill even started. Spawning runs from early May to mid-June in southern Michigan and to late June–July in the Upper Peninsula.
- **Nest output and care.** A nest holds about **5,000 eggs**, roughly 5,600 fry. Eggs hatch in 3–7 days; fry swim up about a week later at about **6 mm**. The male guards the brood for **2–5 weeks in total**, until the fry are about **15–20 mm** or more.
- **Nest success.** Whole-lake nest success in Michigan lakes is **45–77 %**.
- **Condition.** Female condition and growth modulate *how many* eggs are produced: in a poor-growth year ovaries were 4.7 % of body mass vs 6.6–10.9 % normally. Only a fraction of adults nest in any year. I found **no northern study of wild largemouth bass that shows wholesale skipped spawning driven by Wr < 80**, and spring Wr in real Michigan populations sits around **89–100**.

### Cited Findings
**Temperature and timing**
- Kramer & Smith 1962, Lake George and sloughs, Anoka County, Minnesota:
  - spawning first occurred **2–5 days after the mean daily water temperature exceeded 60 °F (15.6 °C)**;
  - **266 nests** were found on needlerush, waterlily roots, humps of fibrous material, vegetation and sand, in **10–62 in (25–157 cm)** of water;
  - "water temperature was directly related to egg survival and nest success"; **wind was the most important single factor** in year-class formation;
  - egg survival was highest on needlerush and lowest on sand;
  - two-thirds of successful nests were deeper than the median nest depth.
  — [Kramer & Smith 1962, TAFS 91:29–41](https://doi.org/10.1577/1548-8659(1962)91[29:FOYCIL]2.0.CO;2)
- Wisconsin:
  - spawning runs from **late April to early July**, and fish in the north of the state spawn **about 2 weeks later** than in the south;
  - nest-site selection begins at **60 °F**, and egg laying occurs at **62–65 °F**;
  - nests are usually on sand or gravel in **about 18 in (46 cm)** of water, swept up to **3 ft (0.9 m)** across and 1 ft deep, at least **30 ft (9 m) apart**, in sheltered bays.
  — [Wisconsin DNR 2008, PUBL-FM-709 08](https://dnr.wisconsin.gov/sites/default/files/topic/Fishing/Species_lmbass.pdf)
- Michigan:
  - bass move to warm shallow shorelines "shortly after spring ice-out";
  - nest building does not begin until the water exceeds **60 °F**;
  - spawning runs **early May–mid June** in southern Michigan and **late May–late June (or mid July)** in the Upper Peninsula;
  - nests are in **1–4 ft (0.3–1.2 m)** of water, on sand, marl or soft mud, and are often clustered in warmer, wave-protected or covered sites.
  — [Bremigan et al. 2008, Michigan DNR Fisheries Special Report 44](https://www2.dnr.state.mi.us/publications/pdfs/DNRFishLibrary/Special-ManagementReports/SR44.pdf)
- Deep Lake, Oakland County, Michigan (14.84 acres = 6.0 ha), 1938–41:
  - "largemouth bass was always the first species to spawn": first spawning was just before 28 May (1938), 12 May (1939), 28 May–1 June (1940) and **1 May (1941)**;
  - bluegill were "always the last of the four species to start spawning";
  - in 1938 bass had **completed** spawning before bluegills started;
  - Table 13 bass windows: 1939 May 12–28; 1940 May 28–June 15; 1941 May 1–June 20. Bluegill windows ran to August each year;
  - the bass spawning season averaged **26 days (range 17–51)**, against **65 days (44–78)** for bluegill;
  - mean nest depth was 27.6 in (70 cm) and mean nest diameter 13.9 in (35 cm);
  - **23–56 bass nests per year** (3.8–9.3 nests/ha).
  — [Carbine 1948, Michigan DNR Fisheries Research Report 1166](https://www2.dnr.state.mi.us/publications/pdfs/DNRFishLibrary/ResearchReports/RR1101-RR1200/RR1166.pdf)
- Nest sites in Wisconsin's Northern Highland lakes:
  - bass nested under or near coarse woody habitat (CWH) where it was abundant;
  - in low-CWH lakes, nests used smaller wood and were **deeper**;
  - no nest was closer to a dock than to CWH.
  — [Lawson, Gaeta & Carpenter 2011, NAJFM 31:666–670](https://doi.org/10.1080/02755947.2011.608990)
- **[S, hatchery fact sheet]** Nesting success falls if the water drops **below 60 °F**, which "usually causes the male to leave the nest". — [Davis & Lock 1997, SRAC Publication 200](https://www.srac.msstate.edu/pdfs/Fact%20Sheets/200%20Largemouth%20Bass-%20Biology%20and%20Life%20History.pdf)
- **[S]** In Alabama ponds, swim-up ran 21 March–14 May at 11.6–25.8 °C, but the cohorts that survived to July swam up at **14.6–21.0 °C**. — [Ludsin & DeVries 1997, Ecological Applications 7:1024–1038](https://kb.osu.edu/bitstreams/db60d33d-cd41-5c78-9b2c-2e84dd26c9c8/download)
- Larger adults spawn earlier:
  - Larger females reached a higher maturity index and spawned first (Mississippi reservoirs) — [Miranda & Muncy 1987, NAJFM 7:131–137](https://doi.org/10.1577/1548-8659(1987)7<131:ROYLBI>2.0.CO;2) **[S]**;
  - larvae from larger parents swam up earlier (ponds) — [Goodgame & Miranda 1993, TAFS 122:131–138](https://doi.org/10.1577/1548-8659(1993)122<0131:EGASOA>2.3.CO;2) **[S]**;
  - Bremigan et al. (2008) note that Ohio reservoirs showed no such pattern (Garvey et al. 1998b) — [SR44](https://www2.dnr.state.mi.us/publications/pdfs/DNRFishLibrary/Special-ManagementReports/SR44.pdf).

**Fecundity, eggs per nest, maturity**
- Michigan, Saline ponds, wild-origin stock, sampled in mid-May before spawning:
  - females produced **about 30,000 eggs per lb (≈66,000 eggs/kg)**, counting ova larger than 0.75 mm;
  - log10 eggs = −0.4254 + 3.2857·log10 TL (cm): a 9-in (229 mm) female carries about **11,000** eggs and a 15-in (381 mm) female about **59,000**;
  - weight explained 73 % of the variation and length 71 %; age had no effect beyond size;
  - in **1983**, after very poor growth the previous year and an April–May 6.9 °F (3.8 °C) below normal, fecundity was significantly lower, ovaries were **4.7 % of body weight vs 6.6–10.9 %** in other years, and spawning was later;
  - the smallest mature fish were 7.8 in (198 mm) for females and 8.1 in for males; the largest immature fish were 8.7 in (221 mm); **all fish over 9.0 in and age II or older were mature**;
  - "not all mature eggs are laid" (citing Clady 1970).
  — [Laarman & Schneider 1985, Michigan DNR FRR 1931](https://www2.dnr.state.mi.us/publications/pdfs/DNRFishLibrary/ResearchReports/RR1901-RR2000/RR1931.pdf)
- Other maturity estimates, as summarized in the same report:
  - Clady (1970), slow-growing Upper Peninsula population: females mature at **age IV–V and about 10 in (254 mm)**, with about **35 % fewer eggs** (about 10,000 per female);
  - Kramer & Smith (1962), Minnesota: **males mature at 11.5 in (292 mm), females at 12.2 in (310 mm)**;
  - Scott & Crossman (1973), Canada: males mature at **3–4 yr**, females at **4–5 yr**.
  — [Laarman & Schneider 1985](https://www2.dnr.state.mi.us/publications/pdfs/DNRFishLibrary/ResearchReports/RR1901-RR2000/RR1931.pdf)
- Michigan ponds: mature eggs = −39,123 + 2,191·TL (cm), r = 0.85, giving 15,652 ± 2,319 eggs at 25 cm and 26,607 ± 3,259 at 30 cm. Carlander (1977) reports 2,000–109,314 eggs per female. — [Laarman & Merna 1980, Michigan DNR FRR 1886](https://www2.dnr.state.mi.us/publications/pdfs/DNRFishLibrary/ResearchReports/RR1801-RR1900/RR1886.pdf)
- Maine: individual fecundity **5,000–82,000 ova**; production appears to decline in fish older than 7 yr. — [Kelley 1962, TAFS 91:23–28](https://doi.org/10.1577/1548-8659(1962)91[23:SMAFOT]2.0.CO;2)
- Fecundity ranges compiled in SR44:
  - Scott & Crossman (1973): 2,000–109,000 eggs per female, or **2,000–7,000 eggs/lb (4,400–15,400/kg)**;
  - Heidinger (1975): up to 80,000/lb;
  - successful nests hold **about 5,000–43,000 eggs** (Mraz et al. 1963; Heidinger 1975);
  - fecundity appears density-dependent: females at low density produce more eggs per lb.
  — [Bremigan et al. 2008](https://www2.dnr.state.mi.us/publications/pdfs/DNRFishLibrary/Special-ManagementReports/SR44.pdf)
- **[S]** About 4,000 eggs/lb on average; females release about half their eggs in the first spawn, and a third spawn up to 1 month later is common. — [Davis & Lock 1997, SRAC 200](https://www.srac.msstate.edu/pdfs/Fact%20Sheets/200%20Largemouth%20Bass-%20Biology%20and%20Life%20History.pdf). This conflicts by about 7× with the Michigan ovarian count of 30,000/lb. The gap is mostly ova in the ovary vs eggs actually deposited per spawn, and the difficulty of judging which ova are mature.
- Wisconsin: each nest holds "about 5,000 pale yellow eggs" at the end of spawning; males spawn with several females, and females use several nests. — [WDNR 2008](https://dnr.wisconsin.gov/sites/default/files/topic/Fishing/Species_lmbass.pdf)
- Deep Lake, Michigan: fry counted from **11 bass nests averaged 5,654 (range 751–12,502)**. — [Carbine 1948](https://www2.dnr.state.mi.us/publications/pdfs/DNRFishLibrary/ResearchReports/RR1101-RR1200/RR1166.pdf)
- Lake George, Minnesota: fingerlings per brood 2 weeks after rising from the nest ranged **500–12,715**, with a mean of **5,600 (1956–57)** and **3,600 (1958)**. — [Kramer & Smith 1962](https://doi.org/10.1577/1548-8659(1962)91[29:FOYCIL]2.0.CO;2)

**Hatching, swim-up and guarding**
- Wisconsin:
  - eggs hatch in **3–7 days**; fry stay on the nest bottom until the yolk is absorbed, "usually in about a week", then rise;
  - they may remain in a swarm "**for up to a month**, guarded by the male";
  - swarms from **2–5 nests** merge into schools;
  - after a few days with the school, the male leaves and the school disperses.
  — [WDNR 2008](https://dnr.wisconsin.gov/sites/default/files/topic/Fishing/Species_lmbass.pdf)
- Michigan review:
  - eggs hatch in **5–7 days** "with stable water temperatures"; males do not actively forage while guarding;
  - males guard nest and fry "up to **28 days** after the eggs hatch", and continue for **2–3 weeks after the fry leave the nest** (Ridgway 1988). Total guarding is **3, 4 or even 6 weeks** past spawning (Kubacki et al. 2002);
  - swim-up fry are about **0.25 in (6 mm)** (Brown 1984), and broods are guarded until the fry reach about **0.75 in (15–20 mm)**;
  - age-0 bass as small as **10–11 mm** can cannibalize swim-up fry, and fry up to half their own length (Johnson & Post 1996).
  — [Bremigan et al. 2008](https://www2.dnr.state.mi.us/publications/pdfs/DNRFishLibrary/Special-ManagementReports/SR44.pdf)
- **[S, hatchery]** At 68 °F (20 °C) mouthparts develop in about 190 h; fry swim up at about 8 days old and remain 2–7 more days before dispersing; guarding lasts "2 weeks or more depending on temperatures". — [Davis & Lock 1997](https://www.srac.msstate.edu/pdfs/Fact%20Sheets/200%20Largemouth%20Bass-%20Biology%20and%20Life%20History.pdf)
- Laboratory energy budget: yolk energy met the larva's needs until a slight deficit late in yolk absorption, **288 h (12 d) after fertilization**, by which time more than 50 % of larvae could feed. — [Laurence 1969, TAFS 98:398–405](https://doi.org/10.1577/1548-8659(1969)98[398:TEEOLB]2.0.CO;2)
- Male energetics:
  - activity of nesting males was **about double** that of non-nesting fish, raising respiration in a bioenergetics model;
  - unlike smallmouth bass, largemouth males showed **no decline** in overall activity late in nesting. — [Cooke, Philipp & Weatherhead 2002, Can. J. Zool. 80:756–770](https://doi.org/10.1139/z02-048)
  - Nutritional indicators show fasting through most of the care period, with feeding resuming after about **3 weeks of care**. That evidence is from smallmouth bass; plasma glucose declined across care in largemouth bass. Chronic-stress indicators rose. — [Hanson & Cooke 2009, J. Comp. Physiol. B 179:253–266](https://doi.org/10.1007/s00360-008-0309-1)

**Nest success, abandonment and its causes**
- Five Michigan lakes, 2004:
  - the probability that a nest produced swim-up fry fell from **0.77** in the lake with the fewest dwellings to **0.45** in the lake with the most (8–22 dwellings/km; P = 0.018);
  - local nest habitat (substrate, cover) did **not** predict success.
  — [Wagner, Jubar & Bremigan 2006, TAFS 135:843–852](https://doi.org/10.1577/T05-198.1)
- Lake George, Minnesota: egg survival to hatching ranged **0–94 %**; the share of successful nests from a single spawning period ranged **0–100 %**. — [Kramer & Smith 1962](https://doi.org/10.1577/1548-8659(1962)91[29:FOYCIL]2.0.CO;2)
- Nest predators and abandonment:
  - predators include cyprinids, catostomids, ictalurids, juvenile panfish (bluegill), crayfish, yellow perch and older bass;
  - nest abandonment may exceed **50 %** when an angled male is away more than 5 min (Philipp et al. 1997);
  - for smallmouth, abandonment rose from **16 % to 75 %** as a male was angled 1–3 times;
  - removing the male before about 10 days after swim-up means total brood loss (Ridgway 1988, smallmouth).
  — [Bremigan et al. 2008](https://www2.dnr.state.mi.us/publications/pdfs/DNRFishLibrary/Special-ManagementReports/SR44.pdf)
- Illegal pre-season catch-and-release angling in southeastern Ontario lakes was large enough in some waters to reduce fry production. — [Philipp et al. 1997, NAJFM 17:557–567](https://doi.org/10.1577/1548-8675(1997)017<0557:TIOCAR>2.3.CO;2)
- **54 %** of nesting male largemouth bass were hooked in angling trials. Males with more eggs were more aggressive and more likely to be caught. — [Suski & Philipp 2004, TAFS 133:1100–1106](https://doi.org/10.1577/T03-079.1)
- **Baseline abandonment within 24 h was 9.5 %** in unhandled males (n = 42) and **41 %** after electrofishing (n = 34), in an Illinois lake. — [Siepker et al. 2006, NAJFM 26:631–635](https://doi.org/10.1577/M05-066.1)
- Locomotor activity over 24 h after angling was **63 % of basal** in nesting males and 98 % in non-nesting males (ponds). — [Cooke et al. 2000, NAJFM 20:968–977](https://doi.org/10.1577/1548-8675(2000)020<0968:LIONML>2.0.CO;2)
- **[S]** Reservoir nest success: **30–40 %** (Briery Creek Lake, Virginia) — [DiCenzo et al. 2016, Open Fish Sci. J. 9:51–56](https://doi.org/10.2174/1874401X01609010051); **53 %** vs **31 %** in two Virginia reservoirs — [Ray 2008, MS thesis, Virginia Tech](https://vtechworks.lib.vt.edu/bitstreams/88974a98-243c-4980-9c39-981ab1affba4/download).

**Condition, energy reserves and skipped spawning**
- Only part of the adult stock reproduces each year:
  - "the percentage of adults … that attempt to spawn in a given year is variable and often represents a small fraction of the total" (Kubacki et al. 2002, citing Raffetto et al. 1990);
  - in smallmouth bass in Nebish Lake, Wisconsin, only **39 % of adult males nested (range 17–55 %)**, and only **27 % of nests (11–33 %)** received eggs;
  - at Michigan's state-average growth, "not all sexually mature bass spawn each year".
  — [Bremigan et al. 2008](https://www2.dnr.state.mi.us/publications/pdfs/DNRFishLibrary/Special-ManagementReports/SR44.pdf)
- A poor-growth year cut ovary mass to 4.7 % of body weight (vs 6.6–10.9 %) and lowered fecundity, but **eggs collected at the usual time in mid-May appeared normal**. This is reduced, not skipped, reproduction. — [Laarman & Schneider 1985](https://www2.dnr.state.mi.us/publications/pdfs/DNRFishLibrary/ResearchReports/RR1901-RR2000/RR1931.pdf)
- A non-condition cause of non-spawning: the bass tapeworm "attacks the reproductive organs and renders the fish sterile". — [WDNR 2008](https://dnr.wisconsin.gov/sites/default/files/topic/Fishing/Species_lmbass.pdf)
- Spring condition of real northern populations:
  - six Upper Peninsula lakes, weighed during **pre-season (May) electrofishing**: log10 W = −5.5952 + 3.2860·log10 L (mm, g) — [Wagner 1988, Michigan DNR FRR 1945](https://www2.dnr.state.mi.us/publications/pdfs/DNRFishLibrary/ResearchReports/RR1901-RR2000/RR1945.pdf);
  - Michigan average (Latta 1974): log10 W = −5.1689 + 3.1274·log10 L;
  - three southeastern Michigan lakes, April–August 1980:
    - Pontiac: −6.0408 + 3.4697·log10 L;
    - Whitmore: −6.4271 + 3.6157·log10 L;
    - Kent: −5.7093 + 3.3512·log10 L.
    — [Goudy 1981, Michigan DNR FRR 1896](https://www2.dnr.state.mi.us/publications/pdfs/DNRFishLibrary/ResearchReports/RR1801-RR1900/RR1896.pdf)
  - The Wr values these equations imply are under Inferences.
- In an unexploited Michigan population followed for 10 years, with a more than threefold change in density, **body condition was inversely correlated with population size**, while aggregate diet did not change. — [Schindler, Hodgson & Kitchell 1997, Oecologia 110:592–600](https://doi.org/10.1007/s004420050200)

### Inferences
- **Real spring Wr in Midwestern populations.** I applied Henson's (1991) Ws, log10 Ws = −5.316 + 3.191·log10 TL (mm, g), to the regressions above at 300–450 mm:
  - slow-growing Upper Peninsula lakes in May: **Wr ≈ 90–94**;
  - Michigan average: **Wr ≈ 95–98**;
  - southeastern Michigan lakes: **Wr ≈ 87–108**. Only the smallest Whitmore fish fall to about 81 at 250 mm.
  - In sim units that is K ≈ 0.87–1.05. A population averaging **K 0.70–0.80 (Wr 70–80) in spring is well below every Midwestern population I found**, including slow-growing, food-limited ones.
- **Fulton's K check.** Fulton's K (100·W/L³, g and cm TL) at Ws is 1.39 (250 mm), 1.44 (300), 1.48 (350), 1.52 (400) and 1.55 (450). If anyone compares the sim's 0.8 with literature "K" values, note that a literature Fulton's K of 0.8 would be Wr ≈ 55 (an emaciated fish).
- **The sim's K_READY = 0.8 threshold.**
  - Its existence is defensible: poor growth reduces gonads and fecundity, and only a fraction of adults nest.
  - What is unrealistic is a population that sits *at* that threshold so that most adults skip.
  - Real data show reduced investment (lower GSI, fewer eggs, later spawning) and a variable fraction of nesting males, not the near-total skipping seen in the sim.
- **Timing against bluegill.** Bass begin about 1–4 weeks before bluegill (Deep Lake) and finish within about 2–7 weeks; bluegill keep producing fry for 6–11 weeks. A bass cohort therefore has a head start of weeks over most bluegill fry. That head start drives the size advantage in Q2.
- **Guarding duration.** About 2–5 weeks from spawning, to fry of roughly 15–20 mm (Michigan review) or longer (Wisconsin's "up to a month" of swarming). Bass fry of 11–15 mm should still be inside a guarded school in reality.

### Gaps
- No primary northern study found that quantifies skipped spawning in wild largemouth bass as a function of Wr or Fulton's K, or that gives a Wr threshold for spawning. The Michigan pond study (1983) is the closest. Ridgway & Shuter's supplemental-feeding work on smallmouth males was not retrieved.
- No paper gave hatch time as a function of temperature for northern fish (only 3–7 d in Wisconsin and 5–7 d in Michigan), nor timing in days after ice-out.
- I did not obtain male mass loss over the nest period for largemouth bass (only plasma and activity indicators). Smallmouth studies (Hinch & Collins 1991; Mackereth et al. 1999) were not retrieved.
- Henson's (1991) Ws coefficients were taken from a compendium table (Coker et al. 2001) and not re-verified against the original paper.

---

## Q2. Early diet and growth: size at first feeding, ontogenetic diet shifts, the bluegill link, fry food needs and starvation, first-summer growth, size-dependent overwinter mortality

### Takeaway
- **First feeding.** Swim-up fry of about 6 mm feed first on **microcrustaceans**: cladocerans (Bosmina, Chydorus, Daphnia, Diaphanosoma) and cyclopoid and calanoid copepods, with some rotifers.
- **Diet shift.** They move to larger invertebrates (Hyalella, midge larvae, insects) and then to fish. The switch is typically at **about 50 mm** when prey fish of suitable size exist, and **about 100 mm** when they do not. Its timing depends on how fast bass grow in the invertebrate stage relative to **YOY bluegill**, their main fish prey.
- **First-summer size.** Northern autumn sizes are about **56–85 mm** (Minnesota) and about **41–102 mm, mean 69 mm** (southern Michigan, mid-September).
- **Overwinter mortality** is strongly size-dependent: below about **50–60 mm** in a northern Michigan lake, and below about 100 mm in southern systems.
- **Competition with bluegill is real** but acts on *growth* and the *timing of piscivory*. In the one northern study that examined it, food, growth and condition did **not** set year-class strength.

### Cited Findings
**First foods and the diet sequence**
- Michigan ponds, bass only:
  - bass **< 10 cm ate primarily zooplankton**; larger fingerlings shifted to **crayfish, fish (including cannibalism) and insects**;
  - from 17 August, midge larvae and pupae became important;
  - prey genera in stomachs were mainly Bosmina, Chydorus, Daphnia, Diaphanosoma and Cyclops, plus Diaptomus;
  - cladocerans and copepods were eaten in the ratio found in the plankton (79 % and 19 %);
  - fingerling density **did not depress zooplankton** (r = −0.31). By contrast, bluegill fry in the same ponds made zooplankton "virtually disappear by mid-July" (Latta & Merna 1977);
  - Kramer & Smith (1960) are cited for a shift from cladocerans, copepods and rotifers to Hyalella, insects and fish.
  — [Laarman & Merna 1980, Michigan DNR FRR 1886](https://www2.dnr.state.mi.us/publications/pdfs/DNRFishLibrary/ResearchReports/RR1801-RR1900/RR1886.pdf)
- **[S, hatchery]** Fry begin "feeding on zooplankton (cladocerans, rotifers, copepods)", feed about every 3 h, and add insect larvae and fish "when about **2 inches** (≈50 mm)". — [Davis & Lock 1997](https://www.srac.msstate.edu/pdfs/Fact%20Sheets/200%20Largemouth%20Bass-%20Biology%20and%20Life%20History.pdf)
- Michigan lakes, over 2 years:
  - YOY cohorts differed in how fast they consumed invertebrates, which made growth diverge early;
  - where invertebrate-stage growth was fast, bass gained a **size advantage over YOY bluegill, their primary fish prey**, and became piscivorous as soon as those bluegill were available;
  - slow growth **delayed or prevented piscivory in the first year**;
  - in **1992, low temperatures** cut growth so that the size advantage failed in all but one lake;
  - bass grew much faster after switching.
  — [Olson 1996, Ecology 77:179–190](https://doi.org/10.2307/2265667)
- Paul Lake, Michigan (Upper Peninsula, unexploited), 1994 cohort:
  - only **a few** fish shifted to and sustained piscivory in their first summer; most "would have to wait until their **second summer**";
  - growth diverged after **18 June**, the first date of possible piscivory, after which early piscivores grew **nearly twice** as fast;
  - early piscivory required **at least 10 days** of hatch-date advantage **plus** above-average growth.
  — [Post 2003, Ecology 84:1298–1310](https://doi.org/10.1890/0012-9658(2003)084[1298:IVITTO]2.0.CO;2)
- Competition between predator and prey:
  - in a divided pond, **YOY bass growth was reduced by both bass and bluegill neighbours**, whereas bluegill growth was affected mainly by other bluegill;
  - "Bluegill had strong competitive effects on bass despite substantial resource partitioning", acting through the size structure of invertebrate prey in open water and vegetation;
  - data from **seven Michigan lakes** show that this juvenile competition matters in nature;
  - once bass become piscivorous, bluegill become their resource.
  — [Olson, Mittelbach & Osenberg 1995, Ecology 76:1758–1771](https://doi.org/10.2307/1940708)
- Across 27 piscivore species, those born larger and with larger gapes become piscivorous earlier and at smaller sizes. Size at piscivory carries over into size at age 1. — [Mittelbach & Persson 1998, CJFAS 55:1454–1465](https://doi.org/10.1139/cjfas-55-6-1454)
- Connecticut lakes: YOY bass "depend on zooplankton in the early life stages"; where alewife depress zooplankton, bass grow slower and switch to piscivory later. — [Boel et al. 2018, Oikos 127:1800–1811](https://doi.org/10.1111/oik.05556)
- **[S]** Alabama ponds, July:
  - piscivorous YOY averaged **80 mm** vs **57 mm** for non-piscivores;
  - growth was **0.81 vs 0.59 mm/d**;
  - YOY under about 100 mm "had essentially" little available sunfish prey;
  - early-hatched fish became piscivorous first, and had more lipid and better winter survival.
  — [Ludsin & DeVries 1997](https://kb.osu.edu/bitstreams/db60d33d-cd41-5c78-9b2c-2e84dd26c9c8/download)
- **[S]** Virginia reservoir:
  - diet overlap between age-0 bass and bluegill exceeded **60 % in June**;
  - small copepods (0.42 vs 0.71 mm) went with **0.8 vs 1.2 mm/d** June growth and a June recruitment bottleneck.
  — [Ray 2008](https://vtechworks.lib.vt.edu/bitstreams/88974a98-243c-4980-9c39-981ab1affba4/download)
- **[S]** Illinois ponds: early cohorts reduce survival of later cohorts through asymmetric exploitative competition for invertebrates (Ephemeroptera). — [Pope 2012, MS thesis, University of Illinois](http://hdl.handle.net/2142/29775)

**Fry food needs and starvation**
- Lake George, Minnesota:
  - growth over the first 2 weeks after rising was directly related to the amount of food in the stomachs;
  - later in the season growth tracked the ratio of large to small organisms;
  - Kn differed between years, inversely with fingerling abundance.
  — [Kramer & Smith 1960, TAFS 89:222–233](https://doi.org/10.1577/1548-8659(1960)89[222:FGOTLB]2.0.CO;2)
- Yet in the same lake, "cannibalism, predation, **food habits, growth rate, and condition were not factors in determining year-class strength**"; strength "was set after egg deposition and before fingerlings were 2 weeks old" (wind and temperature). — [Kramer & Smith 1962](https://doi.org/10.1577/1548-8659(1962)91[29:FOYCIL]2.0.CO;2)
- Yolk reserves carry larvae to about 288 h after fertilization. — [Laurence 1969](https://doi.org/10.1577/1548-8659(1969)98[398:TEEOLB]2.0.CO;2)

**First-summer growth (north)**
- Lake George, Minnesota (about 45.3° N), 4 years:
  - total length at the **end of the season 56–85 mm**;
  - this length was contingent on length on 1 August, which was directly related to the total temperature experience up to that date.
  — [Kramer & Smith 1960](https://doi.org/10.1577/1548-8659(1960)89[222:FGOTLB]2.0.CO;2)
- Deep Lake, Michigan, at rotenone (12 September 1941):
  - the 1941 year class measured **1.6–4.0 in (41–102 mm), mean 2.7 in (69 mm)**;
  - the 1940 year class measured 4.7–7.5 in (119–191 mm), mean 5.9 in (150 mm).
  - These values were read from a poorly OCR'd Table 20.
  — [Carbine 1948](https://www2.dnr.state.mi.us/publications/pdfs/DNRFishLibrary/ResearchReports/RR1101-RR1200/RR1166.pdf)
- Michigan ponds, at the fall draining: YOY were **bimodal**, with a gap at 8–9.9 cm in seven ponds; mean length was density-dependent (r = −0.86 on log scales). — [Laarman & Merna 1980](https://www2.dnr.state.mi.us/publications/pdfs/DNRFishLibrary/ResearchReports/RR1801-RR1900/RR1886.pdf)
- Michigan growth is seasonal, **June–September**; "feeding and growth cease below 50 °F (10 °C)" (Mraz et al. 1963). — [Bremigan et al. 2008](https://www2.dnr.state.mi.us/publications/pdfs/DNRFishLibrary/Special-ManagementReports/SR44.pdf)
- In a common garden, northern bass from south-central Wisconsin grew fastest in one year and Florida bass in the other. "Prey availability and age-0 density can overwhelm" any latitudinal predisposition. — [Slaughter, Wright & DeVries 2008, NAJFM 28:993–1000](https://doi.org/10.1577/M07-041.1)

**Size-dependent overwinter mortality**
- Paul Lake, Michigan, 12 years:
  - "Overwinter mortality was size dependent, strongly affecting bass entering the winter at **<50–60 mm** in length, and likely the result of starvation";
  - at high adult and juvenile density, predation regulated first-year survival;
  - at low density, adult demographics plus spawning date × growth × overwinter mortality regulated it.
  — [Post, Kitchell & Hodgson 1998, CJFAS 55:2588–2600](https://doi.org/10.1139/f98-139)
- Simulated winters for Alabama, Ohio and **Wisconsin (46° N)**:
  - age-0 energy density declined in the high- and mid-latitude winters;
  - **both bioenergetics models underestimated growth at < 6 °C**; resting metabolism had to be cut by about **16 %** to fit;
  - "current bioenergetics models perform poorly at the cold temperatures (<6 °C) … typical of high-latitude lakes, likely because metabolic costs are overestimated".
  — [Wright, Garvey, Fullerton & Stein 1999, TAFS 128:603–612](https://doi.org/10.1577/1548-8659(1999)128<0603:PHWAEO>2.0.CO;2)
- **[S/Ohio]** Starved, 0.5× and 1.5× maintenance rations in pools did **not** change survival, although starved fish lost substantial weight and energy. "Only when predators were present did small individuals die at high rates"; small fish (< 100 mm) died more in one reservoir. — [Garvey, Wright & Stein 1998, CJFAS 55:2414–2424](https://doi.org/10.1139/f98-124)
- **[S]** Alabama ponds:
  - the first winter was a bottleneck, with population declines of **0–80 %**;
  - in **8 of 11 pond-winters** more than half of YOY died;
  - mortality was greater for fish **< 100 mm** than for fish > 150 mm;
  - small fish used about **60 %** of their triglyceride vs **44 %** in large fish;
  - Bay Springs Reservoir, Mississippi: 80 % reduction (Miranda & Hubbard 1994);
  - Bull Shoals: complete loss of fish < 100 mm (Aggus & Elliott 1975).
  — [Ludsin & DeVries 1997](https://kb.osu.edu/bitstreams/db60d33d-cd41-5c78-9b2c-2e84dd26c9c8/download)
- **[S]** Early-hatched cohorts likely form the year class; summer cannibalism removed smaller, later-hatched fish (Alabama ponds of 2–5 ha). — [Pine, Ludsin & DeVries 2000, TAFS 129:504–513](https://doi.org/10.1577/1548-8659(2000)129<0504:FSSOLB>2.0.CO;2)

### Inferences
- Implied northern growth rate: about 6 mm at swim-up (late May–June) to 56–85 mm by late September is roughly **0.5–0.7 mm/d** averaged over about 110 days. Southern ponds run 0.6–1.2 mm/d.
- **The sim's mass starvation of bass fry at 11–15 mm looks unrealistic.** Five lines of evidence:
  1. Real fry at 11–15 mm are still in guarded schools, at most about 2–3 weeks past swim-up, and yolk carries them to about 12 days after fertilization.
  2. Bass spawn weeks before bluegill (Deep Lake: always first, sometimes finished before bluegill began). Most bluegill fry therefore appear when bass are already tens of mm long.
  3. Bluegill fry depleting zooplankton is documented by **mid-July** (ponds). By then northern YOY bass should be about 30–60 mm and moving to insects, Hyalella and fish.
  4. In the classic northern year-class study, food, growth and condition did **not** set year-class strength; wind and temperature acting on eggs and nests did.
  5. Competition with bluegill shows up as slower growth and delayed or failed first-year piscivory (Olson 1995, 1996; Post 2003), and then as size-selective winter loss below about 50–60 mm. It does not show up as starvation of all fry at 1–1.5 cm.
- Deep Lake numbers for comparison (6.0 ha):
  - bluegill fry: **6.0–11.0 million per year (≈1.0–1.8 million/ha)**;
  - bass fry: **130,000–317,000 (≈22,000–53,000/ha)**;
  - so there were roughly **20–85 bluegill fry per bass fry**, and bass still recruited.
  - So **250,000 bluegill fry in the sim is not, by itself, an extreme ratio**. The sim seems to be missing the temporal and spatial partitioning (bass first and littoral; bluegill later and partly limnetic) rather than having the wrong numbers.
- Overwinter: if the sim's FB4 respiration at < 6 °C is applied as published, Wright et al. (1999) suggest **winter metabolic costs are overestimated by about 16 % for age-0 fish**. That bias could also drain adult condition over winter and help explain why adults enter spring at K 0.70–0.80. This is untested for adults.

### Gaps
- I could not retrieve Keast (1985, Lake Opinicon, Ontario) size thresholds; the abstract gives none. Shuter & Post (1990) and Fullerton et al. (2000) full texts were blocked.
- No northern study gave a starvation time to death for first-feeding bass larvae (a point of no return) or prey densities needed per larva.
- The size at which bluegill larvae leave the littoral zone and the limnetic phase (Werner 1967 and others) was not retrieved here. That is the spatial half of the partitioning argument above.
- I found no Michigan or Wisconsin table of state-average age-0 autumn length. A Michigan survey-manual table (state average about 4.2 in at the end of the first season) appeared in search snippets, but the source file returned 404 and was not verified.

---

## Q3. Survival and recruitment: egg to swim-up, swim-up to autumn, first winter; autumn YOY densities; drivers of year-class strength

### Takeaway
- **Egg to hatch:** **0–94 %**.
- **Nest success:** **45–77 %** of nests produce swim-up fry in Michigan lakes; 0–100 % per spawning bout in Minnesota.
- **Fry to autumn and beyond:** in a Michigan lake, only **about 0.01–0.25 %** of fry produced were recovered as year-class survivors (a minimum estimate). In Minnesota, mid-summer fingerlings were **about 1–10 per 1,000 ft² (≈110–1,100/ha of seined littoral)**, and yearlings the next summer were **about 0.05–0.93 per 1,000 ft² (≈5–100/ha)**, i.e. about 4–9 % fingerling-to-yearling survival.
- **Drivers:** spring temperature and wind during nesting; adult number (a moderate stock is needed but not sufficient); predation at high density; hatch date × first-summer growth; and size-dependent winter mortality at low density. Missing or weak year classes are common in northern lakes.

### Cited Findings
- Lake George, Minnesota, 1955–58:
  - **fingerlings** per 1,000 ft² of bag-seine catch: **1.0, 5.5, 10.0 and 1.3**;
  - **yearlings** at the start of the second summer: **0.05, 0.42, 0.93 and < 0.05** per 1,000 ft²;
  - year classes were weak in 1955 and 1958 and strong in 1956–57;
  - strength was **set between egg deposition and 2 weeks after rising**;
  - wind was the most important single factor;
  - water temperature was directly related to egg survival and nest success.
  — [Kramer & Smith 1962](https://doi.org/10.1577/1548-8659(1962)91[29:FOYCIL]2.0.CO;2)
- Deep Lake, Michigan, 1938–41:
  - estimated bass fry production was **130,000–317,000 per year** (**8,800–21,300 per acre**), from 23–56 nests × 5,654 fry per nest;
  - "percentage survival for each year class ranged from **0.0123 to 0.2518**", to the time of whole-lake rotenone on 12 September 1941;
  - the author notes these are **minimum** values because recovery was incomplete.
  - Bluegill: 5.99–11.03 million fry per year, survival 0.0007–0.0970 %.
  — [Carbine 1948](https://www2.dnr.state.mi.us/publications/pdfs/DNRFishLibrary/ResearchReports/RR1101-RR1200/RR1166.pdf)
- Michigan ponds (0.20–0.30 ha), 1978:
  - fall fingerlings per pond ranged **170–7,553** against an egg potential of **55,254–328,198**;
  - the relationship was **negative**: the pond with the lowest egg potential produced the most fingerlings;
  - growth was density-dependent;
  - cannibalism appeared from mid-August, once fingerlings reached about 8 cm.
  — [Laarman & Merna 1980](https://www2.dnr.state.mi.us/publications/pdfs/DNRFishLibrary/ResearchReports/RR1801-RR1900/RR1886.pdf)
- Nest success: whole-lake probabilities of producing swim-up fry were **0.45–0.77**. — [Wagner, Jubar & Bremigan 2006](https://doi.org/10.1577/T05-198.1)
- Paul Lake, Michigan:
  - "The largest recruitment events required at least a moderate number of adults, but a large number of adults was not sufficient";
  - predation was controlled by adult and juvenile bass numbers and "was not strongly correlated with reproductive output";
  - overwinter mortality applies below about 50–60 mm.
  — [Post, Kitchell & Hodgson 1998](https://doi.org/10.1139/f98-139)
- Six Upper Peninsula, Michigan, lakes:
  - "Reproduction was not successful every year as some age groups were missing or poorly represented in all study lakes";
  - Chicago Lake had no bass younger than age VI in spring, yet **more than 200 YOY** were caught in fall fyke nets in Chicago and Tepee lakes;
  - year-class success was not synchronous between nearby lakes.
  — [Wagner 1988](https://www2.dnr.state.mi.us/publications/pdfs/DNRFishLibrary/ResearchReports/RR1901-RR2000/RR1945.pdf)
- Recruitment is the product of fertilized-egg abundance × nesting success × first summer–winter survival:
  - there is "no strong relationship between stock size and number of recruits, except at very low levels of stock size";
  - summer temperature drives smallmouth year-class strength (July–August temperatures explained **46 %** of variation in eastern Lake Ontario; Casselman et al. 2002).
  — [Bremigan et al. 2008](https://www2.dnr.state.mi.us/publications/pdfs/DNRFishLibrary/Special-ManagementReports/SR44.pdf)
- Earlier spawning by large adults gives larger fingerlings that are better prepared to become piscivorous when prey fish hatch. — [Miranda & Muncy 1987](https://doi.org/10.1577/1548-8659(1987)7<131:ROYLBI>2.0.CO;2) **[S]**; [Goodgame & Miranda 1993](https://doi.org/10.1577/1548-8659(1993)122<0131:EGASOA>2.3.CO;2) **[S]**
- **[S]** First-winter survival:
  - Alabama ponds: 0–80 % loss — [Ludsin & DeVries 1997](https://kb.osu.edu/bitstreams/db60d33d-cd41-5c78-9b2c-2e84dd26c9c8/download);
  - Ohio: size-selective winter mortality was driven largely by predation — [Garvey et al. 1998](https://doi.org/10.1139/f98-124).

### Inferences
- **Minnesota fingerling-to-yearling survival.** Ratios of yearlings to fingerlings in the seine data give about **5 %, 8 %, 9 % and < 4 %** for the four year classes. Seine-zone densities convert to about **108–1,076 fingerlings/ha** and **5–100 yearlings/ha** of shoreline habitat. These are not whole-lake densities.
- **Deep Lake YOY in September.** If the 1941 year class corresponds to the 0.25 % survival figure (the column order is ambiguous in the OCR), about 570 YOY were recovered from 226,000 fry, i.e. **≥ about 95 YOY/ha** by mid-September.
- **A plausible northern chain** from these sources:
  - egg → hatch 0–94 %;
  - nest → swim-up 45–77 % of nests;
  - swim-up → autumn of the order of 0.1–several %;
  - autumn → spring strongly size-dependent: near zero for fish < 50 mm, and much higher for fish > 80–100 mm.
- **The sim's sHatch of 0.4** (egg to swim-up) is within the product of egg survival and nest success. The sim's failure is downstream of that.

### Gaps
- No northern study gave direct fractions of swim-up → autumn survival with fry counts and autumn population estimates in the same lake. The Deep Lake figures are minima.
- No autumn YOY densities per km of shoreline from northern electrofishing indices were retrieved (e.g. Wisconsin fall YOY CPUE).
- Shuter & Post (1990), on climate, first-year size and the northern range limit, could not be accessed.

---

## Q4. Adult feeding: diet by season and size, field consumption (bioenergetics p and ration), macrophytes and foraging, seasonal condition, adult growth

### Takeaway
- **Diet.** Adults in northern bass–bluegill lakes are opportunistic:
  - fish, mostly YOY and small bluegill, YOY bass (cannibalism), perch and golden shiner;
  - crayfish, aquatic and terrestrial insects, frogs and other vertebrates;
  - individuals specialize when density is high.
- **Feeding season.** It is short and back-loaded: rations are **near zero in mid-May–early June** and reach **> 5 % of body weight per day in late August** (Minnesota). Growth occurs from June to September and stops below about 10 °C.
- **Bioenergetics fit.** The FB4 model fits field growth well, but a single constant p is inappropriate.
- **Macrophytes.** Foraging success collapses at high plant-stem densities (≥ 250 stems/m²) and peaks at moderate cover.
- **Adult growth.** Northern bass reach about 300 mm at age 4–5 and 356 mm (14 in) at about age 5 on the Michigan average. Food-limited lakes take 7+ years, and their fish stay at Wr ≈ 90.

### Cited Findings
**Diet**
- Lake Rebecca, Minnesota, May–October 1978, subadult (mostly age-III) bass:
  - **daily ration ranged from almost zero in mid-May and early June to over 5 % in late August**;
  - weight gain and annulus formation did not occur "until the diet shifted from large bluegills and insects to age-0 largemouth bass and bluegills";
  - "A growth-limiting lack of suitably-sized forage fish apparently occurred in the early part of the growing season".
  — [Cochran & Adelman 1982, Env. Biol. Fish. 7:265–275](https://doi.org/10.1007/BF00002501)
- Peter and Paul lakes, Michigan's Upper Peninsula:
  - adult diets ranged "from zooplankton (e.g., Daphnia) to vertebrates (fishes, amphibians, reptiles and small mammals)";
  - after a partial winterkill cut bass by **up to 50 %**, diets narrowed to larger prey, low-ranked prey such as Daphnia declined, and **growth rates rose**.
  — [Hodgson & Kitchell 1987, Am. Midl. Nat. 118:323](https://doi.org/10.2307/2425789)
- Individual specialists in Michigan lakes:
  - some bass foraging in the pelagic zone held a mean of **249 Chaoborus per gut** vs 68 in littoral foragers, attributed to heavy intraspecific competition — [VandeVoort, Hodgson & Seekell 2011, J. Freshwater Ecol. 26:435–439](https://doi.org/10.1080/02705060.2011.562001);
  - water mites, up to **780 per stomach**, in a small unproductive Upper Peninsula lake — [Hodgson et al. 2008, J. Freshwater Ecol. 23:327–331](https://doi.org/10.1080/02705060.2008.9664205).
- Wisconsin: adults hunt for "crayfish, frogs, large insects, fish — including golden shiners, bluegills and other largemouth bass"; they feed little as temperatures fall in late fall and stay in deep water over winter. — [WDNR 2008](https://dnr.wisconsin.gov/sites/default/files/topic/Fishing/Species_lmbass.pdf)
- Wisconsin lake basins with less coarse woody habitat: bass had **larger home ranges**, spent more time deep, were **more selective**, had **lower consumption rates**, and shifted from sit-and-wait to active search. — [Ahrenstorff, Sass & Helmus 2009, Hydrobiologia 623:223–233](https://doi.org/10.1007/s10750-008-9660-1)
- **[Pacific NW, non-native]** Bass ≤ 299 mm ate mainly invertebrates including crayfish; large bass ate golden shiner and crayfish in spring–summer; maximum fish prey was **58 % of bass length**. — [Christensen & Moore 2010, Lake Reserv. Manage. 26:200–211](https://doi.org/10.1080/07438141.2010.504322)

**Bioenergetics and consumption**
- The FB4/Rice et al. largemouth bass model was tested against Lake Rebecca, Minnesota:
  - predicted masses fell within 2 SE on 7 of 9 dates;
  - cumulative consumption was within **8.5 %** of the field extrapolation;
  - "Estimation of consumption rate as a **constant proportion of maximum ration** for the whole season was shown to be **inappropriate**; however, three intervals that used different constant proportions … fit the data and corresponded to observed changes in bass diet".
  — [Rice & Cochran 1984, Ecology 65:732–739](https://doi.org/10.2307/1938045)
- **[S, stocked ponds]** Juvenile bass growing fast on bluegill had modelled **p = 0.98–1.04**, consuming **132–171 kg of bluegill per ha per year**. This was taken from the abstract via search results and the full text was not read. — [Sammons et al. 2005, Proc. SEAFWA](https://seafwa.org/sites/default/files/journal-articles/sammons-241-250.pdf)
- **[S, hatchery rule of thumb]** "About 5 pounds of live forage are required for annual maintenance, and 10 pounds of forage are required to add 1 pound of gain". — [Davis & Lock 1997](https://www.srac.msstate.edu/pdfs/Fact%20Sheets/200%20Largemouth%20Bass-%20Biology%20and%20Life%20History.pdf)

**Macrophytes and foraging success**
- Laboratory pools at 0, 50, 250 and 1,000 stems/m²: bass captures of bluegill were similar at 0 and 50 stems/m² and fell to **near zero at 250 and 1,000 stems/m²**, through visual barriers and changed bluegill behaviour. — [Savino & Stein 1982, TAFS 111:255–266](https://doi.org/10.1577/1548-8659(1982)111<255:PIBLBA>2.0.CO;2)
- Age-0 bass had shorter search times and higher attack and consumption rates in **moderate** than dense plants, and in **diverse** stands than in canopy monocultures such as Eurasian watermilfoil. Bluegill density did not matter. — [Valley & Bremigan 2002, TAFS 131:234–244](https://doi.org/10.1577/1548-8659(2002)131<0234:EOMBAO>2.0.CO;2)
- Enclosures: juvenile bass switched to piscivory in the second week at 0, 50 and 500 stems/m² but **did not fully switch at 250 stems/m²**, and grew less there. — [Broderius 2015, MS thesis, Oklahoma State](http://hdl.handle.net/11244/45342) **[S]**
- Northern Wisconsin, **108 lakes** and 186 lake-years (2005–2018): electrofishing CPUE and PSD-Memorable of bass were **positively** related to macrophyte coverage. — [Mrnak, Bass & Sass 2025, Aquaculture Fish & Fisheries 5:e70133](https://doi.org/10.1002/aff2.70133)

**Seasonal condition and adult growth**
- Michigan:
  - growth occurs **June–September**; feeding and growth cease below **50 °F**;
  - state-average **size in May**: **7.1 in (180 mm) at age 2, 9.4 in (239 mm) at age 3, 11.6 in (295 mm) at age 4, 13.2 in (335 mm) at age 5** (Schneider et al. 2000);
  - 14 in (356 mm) is reached at about age 5;
  - 22-in fish are likely more than 10 years old;
  - across 698 populations (Beamesderfer & North 1995) the age at 300 mm ranged **1–10 yr**, rising with latitude.
  — [Bremigan et al. 2008](https://www2.dnr.state.mi.us/publications/pdfs/DNRFishLibrary/Special-ManagementReports/SR44.pdf)
- Wisconsin average length and weight at age (1 to 7):

  | Age | Length (in) | Length (mm) | Weight (lb) | Weight (g) |
  |---|---|---|---|---|
  | 1 | 6.7 | 170 | 0.18 | 82 |
  | 2 | 8.7 | 221 | 0.38 | 172 |
  | 3 | 11.3 | 287 | 0.85 | 386 |
  | 4 | 12.6 | 320 | 1.2 | 544 |
  | 5 | 13.7 | 348 | 1.5 | 680 |
  | 6 | 15.4 | 391 | 2.3 | 1,043 |
  | 7 | 16.8 | 427 | 3.0 | 1,361 |

  Bass mature in 3–4 years at 10–12 in. Females live about 9 years and males about 6. — [WDNR 2008](https://dnr.wisconsin.gov/sites/default/files/topic/Fishing/Species_lmbass.pdf)
- Upper Peninsula lakes were **3–6 cm shorter** than the state average at ages IV–X; this was attributed to low nutrients (Clady 1975). — [Wagner 1988](https://www2.dnr.state.mi.us/publications/pdfs/DNRFishLibrary/ResearchReports/RR1901-RR2000/RR1945.pdf)
- North Sand Lake, Wisconsin:
  - growth has declined with each survey since 1988; it now takes **more than 7 growing seasons** to reach 14 in, against more than 16–17 in at age 7 in 1988–93;
  - the lake fails the WDNR **minimum growth standard of > 12 in (305 mm) at age 5**;
  - bass abundance was 4.5/acre (> 8 in).
  — [WDNR 2006 North Sand Lake survey](https://apps.dnr.wi.gov/doclink/lakes_fish-plant_reports/burnettnorthsandlake2006.pdf)
- Body condition was inversely related to bass density over 10 years in an unexploited Michigan lake. — [Schindler, Hodgson & Kitchell 1997](https://doi.org/10.1007/s004420050200)
- In aquaria with Wisconsin-type winters, age-0 bass lost energy density; models overestimate metabolism below 6 °C. — [Wright et al. 1999](https://doi.org/10.1577/1548-8659(1999)128<0603:PHWAEO>2.0.CO;2)

### Inferences
- **Implied p from the sim's own FB4 bass parameters** (Rice et al. 1983 as coded in `species.js`):
  - Cmax for a 250-g bass is about **3.5 %/d at 20 °C, 4.9 %/d at 24 °C and 5.5 %/d at 27.5 °C**;
  - for a 600-g bass it is 2.7, 3.7 and 4.1 %/d.
  - Cochran & Adelman's subadult ration therefore implies **p ≈ 0 in May–early June, rising to about 0.9–1+ in late August**.
  - Rice & Cochran (1984) found a single seasonal p inappropriate and needed three intervals.
- **So a seasonal mean p of about 0.2–0.4 is not by itself unrealistic for a northern lake.** Two things are unrealistic:
  - p staying low through the warm late-summer window, when YOY bluegill and bass become available;
  - the low intake showing up as **condition loss (K 0.70–0.80)** rather than **slow growth at Wr about 90–100**, which is how food-limited Midwestern populations actually present (Upper Peninsula lakes, North Sand Lake).
- **The key late-summer prey is the new year class** of bluegill and bass, 20–60 mm. A sim in which bass fry all die, and in which YOY bluegill may sit in refuges (dense plants at ≥ 250 stems/m²), removes adults' main late-summer food. That couples the two problems.
- **Winter.** FB4 overestimates metabolism below 6 °C by about 16 % for age-0 fish. If applied to adults, the sim may produce excessive overwinter mass loss and thus low spring K.

### Gaps
- I found no published northern-lake FB4 application that tabulates **annual p or annual consumption per kg of bass** (e.g. Paul Lake, or Wisconsin climate studies). The Wisconsin Little John Lake bioenergetics study (2025 Midwest F&W conference) was only an abstract without results.
- No retrieved study gives seasonal diet *percentages* (fish vs crayfish vs insects vs frogs) for northern bass–bluegill lakes. Kelling et al. (2016) and Gaeta et al. (2018) were not retrieved.
- Typical northern summer daily ration in % body weight per day for adults (as opposed to Cochran & Adelman's subadults) is missing.
- No source quantified the adult seasonal condition cycle: spring pre-spawn peak, post-spawn trough, autumn recovery and overwinter loss.

---

## Q5. Population: adult density and biomass, mortality, age at maturity, predator:prey ratios

### Takeaway
- **Density.** Natural Midwestern lakes hold roughly **5–25 adult bass/ha** (> 200 mm). Legal-size densities are **0.6–2.7/ha** in nutrient-poor Upper Peninsula lakes and **2.5–10/ha** in southern Michigan.
- **Biomass.** Adult biomass is **about 1–2 kg/ha** in Upper Peninsula lakes and **about 9 kg/ha** (≥ 254 mm) in southern Michigan.
- **Mortality.** Total annual mortality of adults is about **30–53 %** in exploited lakes, and natural mortality alone is **about 0.1–0.3/yr**. An unfished Wisconsin lake had about 70 % annual survival.
- **Maturity.** Bass mature at **age 2–5 and about 200–310 mm**, later and larger in the north.
- **Predator:prey ratios.** Good quantitative northern predator:prey ratios were not found.

### Cited Findings
- Six Upper Peninsula, Michigan, lakes (20–78 ha), 1983–85, pre-season Petersen estimates:
  - **legal (≥ 305 mm) bass 0.6–2.7/ha (mean 1.6)**, standing crop **0.47–1.99 kg/ha (mean 0.97)**;
  - **bass 226–304 mm: 0 to 14.9/ha**;
  - catch-curve **total annual mortality A = 0.51** (Z = 0.70) for age IV and older;
  - **annual natural mortality of legal bass v = 0.11**; fishing mortality u = 0.40 (legal), 0.095 (254–304 mm) and 0.018 (226–253 mm);
  - three southern Michigan lakes had **2.5–10.1 legal bass/ha (mean 6.7)**;
  - abundance was about 4× and biomass about 5× higher in southern than in Upper Peninsula lakes.
  — [Wagner 1988](https://www2.dnr.state.mi.us/publications/pdfs/DNRFishLibrary/ResearchReports/RR1901-RR2000/RR1945.pdf)
- Pontiac, Whitmore and Kent lakes, southeastern Michigan:
  - standing crop of bass ≥ 254 mm was **8.9 and 8.7 kg/ha**, against **9.4 kg/ha** in unexploited Mill Lake;
  - one population held **20.2 bass/ha ≥ 254 mm**;
  - exploitation was **18–48 %** and **total mortality 31–53 %**;
  - mean weights: 0.43–0.76 kg for bass ≥ 254 mm and 0.59–0.95 kg for bass ≥ 304 mm.
  — [Goudy 1981](https://www2.dnr.state.mi.us/publications/pdfs/DNRFishLibrary/ResearchReports/RR1801-RR1900/RR1896.pdf)
- Michigan review:
  - **Mill Lake** (136 acres) went from about **14.4 to 8 legal bass/acre (≈36 → 20/ha)** within 3 days of re-opening, with 35 % of 1,958 bass harvested (Schneider 1973);
  - **Little Rock Lake, northern Wisconsin**, closed to fishing 1984–90: bass did not become more abundant, but **annual survival rose from 20 % to 70 %**;
  - the review states "9 to 50 bass per acre" (Goudy 1981) and "1 to 40 per acre, mean 15.3 per acre" (Wagner 1988). Both primary reports give much lower figures **per hectare**, so these look like unit or summary errors; trust the primaries.
  — [Bremigan et al. 2008](https://www2.dnr.state.mi.us/publications/pdfs/DNRFishLibrary/Special-ManagementReports/SR44.pdf)
- Northwestern Wisconsin lakes, adults > 8 in (203 mm):
  - North Sand Lake: **4.5/acre (11/ha)**, 4,364 fish, with growth below the state standard — [WDNR 2006](https://apps.dnr.wi.gov/doclink/lakes_fish-plant_reports/burnettnorthsandlake2006.pdf);
  - Pipe Lake: **8.9/acre (22/ha)**, up **323 %** from 2.1/acre (5.2/ha) in 1995, with 87 % of fish < 13.9 in. Walleye declined as bass rose — [WDNR 2004–05](https://apps.dnr.wi.gov/doclink/lakes_fish-plant_reports/polkpipenorthlakes2004-2005.pdf);
  - Magnor Lake: **5.3/acre (13/ha)** — [WDNR 2007–08](https://apps.dnr.wi.gov/doclink/lakes_fish-plant_reports/MagnorLake0708.pdf).
- Range-wide mortality: fishing mortality averaged **0.35 (1976–89)** and **0.18 (1990–2003)**, with total mortality falling as voluntary release grew. — [Allen, Walters & Myers 2008, NAJFM 28:418–427](https://doi.org/10.1577/M06-264.1)
- Maturity:
  - Michigan ponds: all fish > 9 in (229 mm) at age ≥ II were mature;
  - Upper Peninsula (Clady 1970): age V at 10 in (254 mm);
  - Minnesota: males at 292 mm, females at 310 mm;
  - Canada: males 3–4 yr, females 4–5 yr;
  - Heidinger (1976): females about 25 cm, males about 22 cm.
  — [Laarman & Schneider 1985](https://www2.dnr.state.mi.us/publications/pdfs/DNRFishLibrary/ResearchReports/RR1901-RR2000/RR1931.pdf)
- Predator–prey structure:
  - modelled northern (Montana) bass had **PSD 12** vs 50 in the south;
  - adult bluegill in southern ponds were nearly **twice as vulnerable** to bass predation as in northern ponds.
  — [Modde & Scalet 1985, NAJFM 5:227–232](https://doi.org/10.1577/1548-8659(1985)5<227:LGEOPI>2.0.CO;2) **[ponds]**
- Stage structure: bass populations split into "two functionally distinct stages": juveniles that compete with bluegill, and piscivores that eat them. These respond differently across a gradient of bluegill density. — [Olson, Mittelbach & Osenberg 1995](https://doi.org/10.2307/1940708)
- Bass are near the northern edge of their range in Wisconsin and the Upper Peninsula, and are susceptible to **winterkill** in shallow weedy lakes (Tonn & Magnuson 1982). — [WDNR 2008](https://dnr.wisconsin.gov/sites/default/files/topic/Fishing/Species_lmbass.pdf); [Bremigan et al. 2008](https://www2.dnr.state.mi.us/publications/pdfs/DNRFishLibrary/Special-ManagementReports/SR44.pdf)

### Inferences
- **Model parameters against the field data:**
  - **Natural mortality.** If the sim's bass `M: 0.40` is an instantaneous annual natural mortality, it equals about 33 % per year. That sits above the Upper Peninsula natural-mortality estimate (about 11 %) and the unfished Little Rock Lake total (about 30 %). It is at the high end for a lake without anglers.
  - **Maturity.** The sim's maturity (Lmat 28 cm females, 25 cm males, matureAge about 4 yr) falls inside the northern range of 200–310 mm and age 2–5.
- **Bass:bluegill ratios.** Deep Lake fry production was about 20–85 bluegill fry per bass fry (Q2), and southern Michigan adult bass biomass was about 9 kg/ha. Typical Midwestern bluegill biomass from other sources (not retrieved here) would be needed to form the bass:bluegill biomass ratio.

### Gaps
- No primary source was retrieved for **Swingle's F/C ratio** (balanced pond values of about 3–6) or for north-temperate bass:bluegill **biomass ratios**. Bass PSD 40–70 with bluegill PSD 20–60 is the usual "balanced" pond target, but no source was retrieved for it. These pond-derived indices may not transfer to natural lakes.
- No whole-lake northern estimate of age-0 or age-1 bass density per km of shoreline was found.
- **Method note.** The web-search budget for this session was exhausted part-way through (a shared limit across agents), so several targeted papers were not retrieved:
  - Keast 1985;
  - Shuter & Post 1990;
  - Fullerton et al. 2000;
  - Kelling et al. 2016;
  - Swingle 1950;
  - Heidinger 1975;
  - Carlander 1977;
  - Cooke & Philipp 2009.

  Findings above come from sources already in hand or fetched by direct URL.
