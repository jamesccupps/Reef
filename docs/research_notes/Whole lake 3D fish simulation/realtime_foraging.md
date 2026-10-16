# Real-time foraging and predation: reaction distance, search, attack, capture, ration (for the real-time 3-D fish)

**Scope.** This note covers the second-to-hour behaviour of the eight Hot Brook fish. It is for the move from the compressed clock to real time (`docs/W3_REALTIME_AUDIT.md`), whose listed research gaps it targets:
- per-hour attack rates and strike success;
- search volumes, reactive distances and bites per minute;
- larval swimming and kills of larvae;
- the timing of meals.

The two clocks it serves:
- **Fine mode:** dt 0.1 s, brains at 5 Hz. Strikes, captures and chases are events.
- **Coarse mode:** dt ≈ 60–900 s. The same mechanisms are integrated as rates.

**Species and surrogates.**
- Golden shiner (`minnow`); pumpkinseed (`sunfish`; surrogate **bluegill**).
- Yellow perch (`perch`; surrogate **Eurasian perch**); white sucker (`sucker`).
- Brown bullhead (`catfish`; surrogates **other ictalurids**); white perch (`whiteperch`).
- Smallmouth bass (`bass`; surrogate **largemouth bass, LMB**).
- Chain pickerel (`pike`; surrogates **northern pike, muskellunge, tiger muskellunge**).
- Prey surrogates: fathead minnow (FHM), roach and silvery minnow stand in for golden shiner as prey; bluegill (BG) stands in for pumpkinseed as prey.

**Tags.**
- [FT] full text read; [AB] abstract or repository record read; [SS] search-engine summary only (unverified).
- [fig.] read off a figure, about ±10 %; [derived] my arithmetic on sourced values; [via X] quoted by a citing paper.

**Where existing notes already hold a number,** this note cross-references them rather than repeating them. Abbreviations follow the audit's Appendix B:
- PIKE = `Real lake ecology for calibration/northern_pike.md`; LMB = `…/largemouth_bass.md`; FZC = `…/fish_zooplankton_coupling.md`; ZOO = `…/zooplankton_dynamics.md`;
- PPSP = `Seasonal fish habitat use/perch_pickerel_smallmouth_pumpkinseed.md`; WSSB = `Seasonal fish habitat use/whiteperch_shiner_sucker_bullhead.md`;
- FMG = `Whole lake 3D fish simulation/fish_movement_and_groups.md`.

The research for this note was split among four sub-researchers plus my own reading. Each says which sources it opened in full. Their PDFs and extracted text are in the session scratchpad.

---

## Summary: the numbers that matter most

**1. How far fish see prey.**
- *Zooplankton:* a few centimetres to ~30 cm.
  - Age-0 yellow perch: 5.0 cm at 3,000 lx; 2.8 cm in the dark ([Richmond et al. 2004](https://doi.org/10.1111/j.0022-1112.2004.00444.x)).
  - Pumpkinseed: 20 cm for a 1.9-mm *Daphnia* ([Confer et al. 1978](https://doi.org/10.2307/3543380), via Richmond).
  - Bluegill: 25 cm for a 2.0-mm *Daphnia* ([Vinyard & O'Brien 1976](https://doi.org/10.1139/f76-342), via Richmond). It rises with fish size: reaction angle (mrad) = 1.7 + 18.9/SL(cm) ([Li et al. 1985](https://ecommons.cornell.edu/server/api/core/bitstreams/fd2c486d-4d7b-467f-8a54-2ce61767516d/content)).
- *Prey fish:* about a metre for bass and pike in good light.
  - Smallmouth on benthic fish: peak 84–108 cm, maximum 159 cm; 40 cm in the dark ([Michels 2020](https://conservancy.umn.edu/items/f32b5a41-ee5f-4774-9fe0-77ead86687fa)).
  - Largemouth on 5-cm bluegill: ≈110 cm at 3,340 lx, ≈67 cm at 1.5 lx, ≈29 cm at 0.2 lx ([Howick & O'Brien 1983](https://doi.org/10.1577/1548-8659(1983)112%3C508:PFBOLB%3E2.0.CO;2)).
  - Pike modelled at 1.5 m in clear water, 1.0 m in moderately brown water and 0.5 m in heavily brown water ([Nilsson-Örtman et al. 2026](https://pmc.ncbi.nlm.nih.gov/articles/PMC13145305/), from [Ranåker et al. 2012](https://doi.org/10.1111/j.1365-2427.2012.02836.x)).

**2. Light.** Fish see far better in dim light than the sim assumes.
- Feeding thresholds: yellow perch 2–5 lx, bluegill 10 lx, pumpkinseed 25 lx.
- Largemouth bass catch > 95 % of prey down to moonlight (3×10⁻³ lx) ([McMahon & Holanov 1995](https://doi.org/10.1111/j.1095-8649.1995.tb01599.x)).
- The sim's vision ramp (`PLANKTON.VIS_I0` 0.002 → `VIS_I1` 0.1 of noon surface light, about 200 → 10,000 lx taking summer noon as ~100,000 lx) goes blind 40–100× too early for perch and sunfish, and far earlier still for bass. Its daylight curve also drops to zero at sunset, with no twilight. [derived; §1.2, §9]

**3. The strike** is short and close.
- Chain pickerel start the strike at **0.14–0.37 body lengths (BL)** and reach the prey in **0.05–0.11 s** ([Rand & Lauder 1981](https://sites.harvard.edu/glauder/files/2022/03/RandLauder1981CJZ.pdf)).
- Strike distance was 0.15 m for 23–27-cm pike and 0.30 m for 23–27-cm largemouth ([Savino & Stein 1989](https://kb.osu.edu/server/api/core/bitstreams/a76575f9-ea9c-5d34-8d40-9adf1458122e/content)).
- The sim's `strikeR` (pickerel 1.2 m, bass 1.0 m) is 3–8× the real strike distance. In real time the distance between detection (~1 m) and the strike (~0.15–0.4 m) is the stalk, and that is where prey get away.

**4. Capture per strike** depends on prey type, predator and prey school, not on vegetation.
- Esocids: **0.67** on fathead minnow, **0.78** on gizzard shad, **0.14** on bluegill ([Wahl & Stein 1988](https://kb.osu.edu/server/api/core/bitstreams/c6475317-58f9-5b99-886d-a6ac29cacf8a/content)). This corrects PIKE's "0.44?" and its inference that deep-bodied prey are half to two-thirds as catchable: they are about one-fifth.
- Largemouth bass on small bluegill (12–16 % of bass length): **≈0.57–0.83**, ≈70 % over 476 attacks ([Savino & Stein 1982](https://kb.osu.edu/server/api/core/bitstreams/eb6b8bd3-2250-5e62-a996-86fd33ebebcd/content)).
- Eurasian perch on roach: **0.20 on singles vs 0.03 into a school**. Pike: **0.36 from ambush vs 0.12 in pursuit**, with no school effect ([Turesson & Brönmark 2004](https://lup.lub.lu.se/search/files/2802910/624603.pdf)).
- Planktivores: *Daphnia* **0.76–0.96** vs copepods **0.07–0.28** (suction model; [Drenner 1977](https://kuscholarworks.ku.edu/entities/publication/5e60163e-3a80-4ce4-925c-7bb2e471419d)).

**5. Cover** cuts encounters and attacks, not capture per strike.
- Bass captures of bluegill per hour: ≈25, 16, 2.5 and ~1 at 0, 50, 250 and 1,000 rope stems/m².
- Capture per attack stayed ≈0.6–0.8 ([Savino & Stein 1982](https://kb.osu.edu/server/api/core/bitstreams/eb6b8bd3-2250-5e62-a996-86fd33ebebcd/content)).
- In a real lake, natural weed at ~164 stems/m² cut bass predation tenfold: 0.15 vs 1.5 bluegill per bass per day ([Smith 1995](https://www2.dnr.state.mi.us/Publications/PDFS/DNRFishLibrary/ResearchReports/RR1901-RR2000/RR2000.pdf)).

**6. Handling time.**
- About **1 s per zooplankter**: H = 0.536·e^(18.488·l/L) s, constant below l/L = 0.034 (Mittelbach 1981, [via Walton et al. 1992](https://ecommons.cornell.edu/server/api/core/bitstreams/4d8460bc-b706-4c25-9db2-4df5fda4a052/content)).
- **Minutes per fish:** esocids 3.3–6.2 min ([Wahl & Stein 1988](https://kb.osu.edu/server/api/core/bitstreams/c6475317-58f9-5b99-886d-a6ac29cacf8a/content)); yellow perch 110–770 s including recovery ([Paszkowski & Tonn 1994](https://ualberta.scholaris.ca/items/2934db41-9b42-47af-83a3-2e9b039416af/full)).

**7. Rations and meals.**
- Yellow perch 5.5–6.7 %BW/day in July ([Nakashima & Leggett 1978](https://doi.org/10.1139/f78-249)). That is ≈4,300 1.5-mm *Daphnia* a day for a 10-g perch [derived].
- Pike are meal feeders. They clear a meal in 48 h in summer and 12 days in winter, with ~2 prey per non-empty stomach and 47 % of stomachs empty ([Diana 1979 thesis](https://ualberta.scholaris.ca/handle/123456789/97485)).
- Smallmouth over 30 cm hold 1–2 crayfish per stomach ([Austen & Orth 1985](https://seafwa.org/sites/default/files/journal-articles/AUSTEN-97-107.pdf)).

**8. Encounter rate in coarse mode.**
- Cruising visual forager: e = ½·π·RD²·v·N.
- Ambusher: π·R²·u·N, with u the speed of the prey.
- RD comes from light and turbidity via R²·e^(cR) = C·A·E′·E_b/(K_e + E_b).
- Intake = Σλp/(1 + Σλph), capped by gut room. Fish kills come as clustered Poisson events (§5).

---

## 1. Reaction distance (RD)

### Takeaway
- **Zooplankton.** RD grows linearly with prey size and in a saturating way with fish size and light.
  - Juvenile sunfish see a 1-mm *Daphnia* at 3–14 cm; a 10-cm bluegill sees a 1.5-mm *Daphnia* at about 27 cm.
  - Yellow perch measured short (5 cm) in a shallow tank. The authors think this is an underestimate.
- **Fish prey.** Piscivore RD reaches about 1 m in good light and hardly depends on prey size. It falls steeply below ~1–5 lx, and in turbid or brown water.
- **Non-visual floors.**
  - Perch detect *Daphnia* at 2.8 cm in total darkness.
  - Smallmouth react to prey fish at a mean 14 cm (peak 40 cm) in the dark.
  - Bullheads track food by taste over distance.
- **Brown water** cuts piscivore RD more than planktivore RD, but less than clay turbidity does. Strike distance is unchanged.
- **Direct measurements exist only for yellow perch, pumpkinseed (one value) and smallmouth bass.** Golden shiner, white sucker, brown bullhead and white perch have none.

### 1.1 Zooplankton prey

**Yellow perch, direct** — [Richmond, Hrabik & Mensinger 2004, J. Fish Biol. 65:195–205](https://doi.org/10.1111/j.0022-1112.2004.00444.x) [FT]
- Conditions: age-0 perch of 30–88 mm TL; *D. pulicaria* of mean 1.6 mm; 20 °C; an arena 7 cm deep; 0–3,400 lx; 657 trials.
- RD:
  - maximum mean 5.0 ± 0.8 cm at 3,000 lx;
  - 4.4 ± 0.4 cm between 5 and 3,000 lx;
  - 3.0 ± 0.4 cm between 0 and 2 lx;
  - 2.8 ± 0.1 cm in the dark.
- The light threshold lies between 2 and 5 lx. Fish length had no significant effect on RD.
- Foraging success was **94 %** across all light levels. Most attacks fell within ±30° of straight ahead.
- Fit: **RD (cm) = 4.3·I/(0.1 + I)**, with I in lx (r² = 0.7).
- The authors expect their small aquaria and naive fish shortened RD. They cite Confer et al. (1978) showing that long, narrow tanks raise yellow perch RD by about 30 %.

**Earlier lab values compiled in Richmond et al.'s Table II** [FT, secondary]:

| Predator | Size | Prey | Threshold light | RD | Original |
|---|---|---|---|---|---|
| Bluegill | 65 mm TL | *D. pulex* 2.0 mm | 10 lx | 25 cm | [Vinyard & O'Brien 1976](https://doi.org/10.1139/f76-342) |
| **Pumpkinseed** | 110 mm SL | *D. pulex* 1.9 mm | 25 lx | **20 cm** | [Confer et al. 1978, Oikos 31:27](https://doi.org/10.2307/3543380) |
| White crappie | 110 mm TL | *D. magna* 0.9 mm | 10 lx | 15 cm | Wright & O'Brien 1984 |
| Lake trout | 80 mm SL | *D. magna* 2.5 mm | 50 lx | 10 cm | Confer et al. 1978 |
| Brook trout | 100 mm SL | *D. pulex* 1.9 mm | 25 lx | 10 cm | Confer et al. 1978 |

The pumpkinseed row is the only pumpkinseed RD found.

**Bluegill RD as a function of fish size** — [Li, Wetterer & Hairston 1985, Ecology 66:1729](https://ecommons.cornell.edu/server/api/core/bitstreams/fd2c486d-4d7b-467f-8a54-2ce61767516d/content) [FT]
- A hyperbola fitted to the reaction angles of Hairston et al. (1982) and [Breck & Gitter 1983](https://doi.org/10.1139/f83-026):
  - **Angle (mrad) = 1.7 + 18.9/SL**, or 5.85 + 65.01/SL in minutes of arc, with SL in cm.
  - The angle is measured to the mean prey *diameter*, taken as 0.64 × *Daphnia* length.
  - So RD ≈ 0.64·L_prey / angle [derived].
- Derived RD for a 1.5-mm *Daphnia* in bright, clear water: about 17.5 cm at SL 5 cm, 26.7 cm at SL 10 cm and 32.4 cm at SL 15 cm.
- The fit reproduces the juvenile values below: an 11.2-mm fish and a 0.82-mm *Daphnia* give 28 mm, against 29 mm measured [derived].
- For a 110-mm SL fish and a 1.9-mm *Daphnia* the fit gives about 36 cm, against the pumpkinseed's measured 20 cm [derived]. Pumpkinseed, a snail specialist, may simply have shorter RD than bluegill.
- Breck & Gitter (abstract): at a given fish size the visual angle at reaction is nearly constant, so RD is proportional to prey size. RD rises with fish size (27–162 mm SL) but levels off in large fish.

**Juvenile sunfish (80 % bluegill, 20 % pumpkinseed)** — [Walton, Hairston & Wetterer 1992, Ecology 73:429, Table 1](https://ecommons.cornell.edu/server/api/core/bitstreams/4d8460bc-b706-4c25-9db2-4df5fda4a052/content) [FT]

Small, medium and large *Daphnia* were ≈0.82, 1.58 and 2.16 mm for fish of 10–19 mm, and 1.27, 1.82 and 2.53 mm for fish of 25–33 mm.

| Fish SL | RD small / medium / large | Capture success small / medium / large |
|---|---|---|
| 11.2 mm | 2.9 / 5.6 / 7.7 cm | 0.60 / 0.10 / 0 |
| 14.1 mm | 3.7 / 7.1 / 9.7 cm | 0.72 / 0.32 / 0.13 |
| 16.6 mm | 4.3 / 8.4 / 11.4 cm | 0.79 / 0.65 / 0.28 |
| 29.3 mm | 13.6 / 19.5 / 27.1 cm | 1.0 / 1.0 / 1.0 |

**Golden shiner: no RD measured.**
- Close relative, emerald shiner: RD about 50 % lower at 20 NTU than in clear water ([Nieman & Gray 2018](https://doi.org/10.1111/jfb.13878)) [AB].
- Adults either pick prey by sight or filter-feed dense zooplankton without visual cues (Ehlinger 1989, CJFAS 46:1250, [via Reebs 2002](https://gambusia.bsp.ncsu.edu/readings/Reebs%202002.pdf)) [secondary].

**White perch, white sucker, brown bullhead:** no zooplankton RD found.

### 1.2 Light

**Form of the light response.** It saturates (Michaelis–Menten) in every fish measured.

| Species | Light response | Source |
|---|---|---|
| Yellow perch | RD = 4.3·I/(0.1 + I) cm (I in lx); threshold 2–5 lx | [Richmond 2004](https://doi.org/10.1111/j.0022-1112.2004.00444.x) [FT] |
| Walleye, age-0 > 125 mm TL, FHM prey (a percid, not in the lake) | RD = 29.27·I/(0.0319 + I) cm; dark 12.5 ± 2.0 cm (0.94 BL); plateau ≈29 cm at ≥ 1 lx | [Michels 2024 dissertation](https://conservancy.umn.edu/server/api/core/bitstreams/789afcc3-103d-490e-84ab-005ce8fc4e35/content) [FT]; [Michels et al. 2025](https://doi.org/10.1007/s10641-024-01650-y) [AB] |
| Smallmouth bass | see §1.4 (peaks near sunrise-level light) | [Michels 2020](https://conservancy.umn.edu/items/f32b5a41-ee5f-4774-9fe0-77ead86687fa) [FT] |
| Bluegill | threshold 10 lx | [via Richmond Table II](https://doi.org/10.1111/j.0022-1112.2004.00444.x) |
| Pumpkinseed | threshold 25 lx | [via Richmond Table II](https://doi.org/10.1111/j.0022-1112.2004.00444.x) |
| Largemouth bass | RD not obviously lower until < 5 lx | [Howick & O'Brien 1983](https://doi.org/10.1577/1548-8659(1983)112%3C508:PFBOLB%3E2.0.CO;2) [FT] |
| Largemouth bass | capture success > 95 % from 243 lx down to 3×10⁻³ lx (moonlight); 62 % at 2×10⁻⁴ lx (starlight); ~0 % in darkness | [McMahon & Holanov 1995](https://doi.org/10.1111/j.1095-8649.1995.tb01599.x) [AB] (also PPSP:90–91) |
| Larval bluegill (12.5 mm TL) | turbidity cut zooplankton intake only where light was below ~450 lx | [Miner & Stein 1993](https://kb.osu.edu/items/8c7a41ac-f5b9-5873-be13-bd0dfb61bca1) [FT] |
| Lake trout (functional-form reference only) | RD < 25 cm at 0.17 lx, rising to ~100 cm at a 17.8-lx threshold | [Vogel & Beauchamp 1999](https://doi.org/10.1139/f99-071) [AB] |

**Light reference values** — [Hänel et al. 2018 (arXiv 1709.09558), Table 2](https://arxiv.org/pdf/1709.09558) [FT]
- In the PDF's text layer the condition labels sit two rows below their values. I realigned them by the references and units [derived]:
  - direct sunlight 129,000 lx; overcast day 100–2,000 lx;
  - end of civil twilight (clear) **3.4 lx**; end of nautical twilight (clear) **8.1 mlx**;
  - typical summer full moon 50–100 mlx, at most 320 mlx at zenith;
  - natural starlit night 0.6–0.9 mlx.
- Over civil twilight the horizontal illuminance drops from ~585–410 lx to ~3.5–2 lx ([AMS Glossary](https://glossary.ametsoc.org/wiki/civil-twilight/)) [SS].

**Implied timing [derived].**
- A perch at 1 m in the Hot Brook water (Kd ≈ 0.85 /m, `chem3.js`) reaches its 2–5 lx threshold when the surface is ~5–12 lx. That happens late in civil twilight.
- Largemouth and smallmouth keep hunting well into nautical twilight and under the moon.

**Unit conflict.** The smallmouth and walleye studies used a 510-nm LED and photon units.
- One sub-researcher read Michels (2024) as equating 3.16×10¹³ photons m⁻² s⁻¹ with about 1 lx.
- For monochromatic 510-nm light I get 1 lx ≈ 7.5×10¹⁵ photons m⁻² s⁻¹ [derived]: V(510 nm) = 0.503, so 343.6 lm/W, at 3.9×10⁻¹⁹ J per photon.
- That is a factor of about 240 apart. I use my conversion below; check the dissertation before relying on either.

### 1.3 Turbidity and water colour (brown water)

**Clay or algal turbidity** cuts piscivore RD steeply:
- **Smallmouth bass** (juveniles of mean 99 mm TL, eating fly larvae): RD fell "exponentially … from 65 cm in clear water to 10 cm at the highest turbidity" (~40 NTU per Michels 2020). Turbidity lowered the probability of reacting, but not capture success once the fish reacted ([Sweka & Hartman 2003](https://doi.org/10.1023/A:1025835031366)) [AB].
- **Bluegill detecting a largemouth bass:** about 210 cm in clear water vs about 35 cm at 5 NTU (Miner & Stein 1996, [via De Robertis et al. 2003](https://doi.org/10.1139/f03-123)) [FT, secondary]. Planktivory is far less sensitive to turbidity than piscivory (same source).
- **Largemouth bass on crayfish:** RD rose with crayfish size and movement in clear water, but not at ~17–19 NTU ([Crowl 1989](https://doi.org/10.1007/BF00018718)) [AB]. The NTU range is from Shoup & Wahl 2009.
- **Tiger muskellunge** consumption fell at Secchi 26 and 18 cm vs > 53 cm ([Snow et al. 2018](https://doi.org/10.1002/nafm.10053)) [FT].
- **Secchi ↔ NTU for bentonite clay:** 5 NTU ≈ 48 cm, 10 NTU ≈ 30 cm, 40 NTU ≈ 12 cm ([Shoup & Wahl 2009](https://doi.org/10.1577/T09-015.1)) [FT]. The Hot Brook Secchi of ~3 m is therefore colour, not turbidity, in these terms.
- **Kaolin turbidity to beam attenuation:** c ≈ 0.40·NTU (m⁻¹, 660 nm), from Hansen et al. 2013 as reported by [Rohan et al.](https://repository.library.noaa.gov/view/noaa/32042) [FT].

**Humic (brown) water**, which is the Hot Brook case:
- **Pike on roach:**
  - Visual range was set to 25–200 cm with algae, clay or humic stain.
  - RD fell as visual range fell, more steeply with clay or algae than with humic stain.
  - **Strike distance was unaffected.**
  - Source: [Ranåker et al. 2012](https://doi.org/10.1111/j.1365-2427.2012.02836.x) [AB]; cm values not obtained.
- **A 2026 pike model built on those data** sets RD to **1.5 m (clear), 1.0 m (moderately brown), 0.5 m (heavily brown)** over Abs₄₂₀/5 cm 0.01–0.40 ([Nilsson-Örtman et al. 2026](https://pmc.ncbi.nlm.nih.gov/articles/PMC13145305/)) [FT].
- **Pike encounter rates** fell in both turbid and brown water.
  - Capture success was unaffected by turbidity but U-shaped against humic colour.
  - Selection for small prey disappeared in turbid water but held in brown water.
  - Source: [Jönsson et al. 2013](https://doi.org/10.1139/cjfas-2013-0150) [AB].
- **Young-of-year pike:** RD to *Daphnia* *increased* in degraded water, while RD to larval roach was "severely reduced" ([Jönsson et al. 2012](https://doi.org/10.1111/j.1600-0633.2012.00565.x)) [AB].
- **Eurasian perch** appear to be poorer zooplankton foragers in highly coloured water ([Estlander et al. 2010](https://doi.org/10.1111/j.1095-8649.2010.02682.x)) [AB].
- **Gillnet catch per net** fell with colour for perch and pike across 78 Finnish lakes of 18.9–380 mg Pt/L ([Horppila et al. 2025](https://doi.org/10.1007/s10021-024-00954-5)) [AB].
- **Yellow perch ingestion vs NTU** (prey/h; [Manning et al. 2014, Table 1](https://www.utoledo.edu/nsm/lec/research/im/docs/cjfas-2013-0528.pdf)) [FT; table partly garbled in extraction]:
  - juvenile in sediment turbidity: −0.359·NTU + 86.975;
  - juvenile in algal turbidity: −0.449·NTU + 35.919.
- **Conflict.** [Wellington et al. 2010](https://www.utoledo.edu/nsm/lec/research/be/docs/wellington2010.pdf) say yellow perch RD and consumption fall below 10 lx, citing Granqvist & Mattila 2004. But [Granqvist & Mattila's abstract](https://doi.org/10.1023/B:hydr.0000018210.66762.3b) reports no significant drop:
  - Eurasian perch of 4–7.7 cm eating mysids;
  - at 1–30 NTU, in daylight (64–71 µmol m⁻² s⁻¹), twilight (1.0–1.2 µmol) and darkness;
  - in 3-h trials.

### 1.4 Fish and benthic prey (piscivores)

**Smallmouth bass, direct** — [Michels 2020, MS thesis](https://conservancy.umn.edu/items/f32b5a41-ee5f-4774-9fe0-77ead86687fa) [FT]; [Michels et al. 2021, TAFS 150:361](https://doi.org/10.1002/tafs.10293) [AB]
- Conditions: adult bass of 352–379 mm TL eating round goby and mottled sculpin on the bottom; 510-nm LED light matched to 10 m depth. RD did not differ between the two prey.

| Light (photons m⁻² s⁻¹; ≈ lx [derived]) | Peak RD (cm) | Mean RD (cm) | Maximum RD (cm) |
|---|---|---|---|
| Dark, 8.45×10⁸ (≈1×10⁻⁷ lx) | 40.1 ± 2.7 | 14.2 ± 2.5 | 55 |
| CT-6, 5.27×10¹⁰ (≈7×10⁻⁶ lx) | 67.5 ± 6.5 | — | — |
| CT-4, 6.32×10¹² (≈8×10⁻⁴ lx) | 100.0 ± 5.3 | — | — |
| Sunrise, 8.78×10¹³ (≈0.012 lx) | 108.2 ± 7.0 | 36.1 ± 3.2 | **159** |
| Midmorning, 8.94×10¹⁵ (≈1.2 lx) | 84.1 ± 6.0 | 44.0 ± 6.4 | 114 |

- Fits:
  - Michaelis–Menten Rmax = 101.5 cm, half-saturation 1.33×10⁹ photons m⁻² s⁻¹ (R² = 0.71);
  - parabola **RD = −434.33 + 78.13·L − 2.85·L²** (cm; L = log₁₀ photons m⁻² s⁻¹; R² = 0.90).
- The parabola peaks at ≈101 cm at L ≈ 13.7, about 5×10¹³ photons m⁻² s⁻¹ [derived].
- 1,510 "reactions" produced 164 captures, **10.9 % per reaction**. A reaction is not a strike.
- In the dark, > 90 % of reactions were within 45 cm. The thesis's "11.2 % of TL" looks like a slip for ≈1.1 BL (40 cm ÷ 35.2 cm) [derived].

**Largemouth bass (surrogate)** — [Howick & O'Brien 1983, TAFS 112:508](https://doi.org/10.1577/1548-8659(1983)112%3C508:PFBOLB%3E2.0.CO;2) [FT]
- Conditions: a 500-cm tank 15–20 cm deep, filtered water; RD in cm; L = prey TL in cm.
- The PDF's table text was garbled. The sub-researcher assigned slopes and intercepts to light levels from the significance letters and the text.
- Motionless bluegill at 3,340 lx:
  - 35-cm bass: RD = 24.1·L − 17.6;
  - 29-cm bass: 22.7·L − 3.98;
  - 13-cm bass: 16.1·L + 26.3.
  - Bass size did not change the slope significantly.
- 29-cm bass on a 5-cm bluegill by light [derived from the fits]:
  - 3,340 lx ≈ 110 cm; 103 lx ≈ 109 cm; 5.59 lx ≈ 131 cm;
  - **1.49 lx ≈ 67 cm; 0.195 lx ≈ 29 cm.**
- Redfin shiner prey at 3,340 lx: stationary RD = 38.3·L − 76.2; moving at 25 cm/s, RD = 20.2·L + 49.6. Movement raised RD only for small prey.
- Bass react at a constant visual angle of ≈2.7°. The movement threshold is ≈7.5° s⁻¹ of angular velocity. Maximum RD is ≈2 m.
- **Prey detecting the bass:** a bluegill sees a 29-cm bass at 200 cm (3,340 lx), 121 cm (103 lx), 77.6 cm (5.59 lx) and 33.2 cm (1.49 lx). Bluegill out-see bass in bright light; bass win below ~5 lx.
- **Crayfish prey:** RD rises with crayfish size and movement in clear water ([Crowl 1989](https://doi.org/10.1007/BF00018718)) [AB]; no cm values obtained.

**Chain pickerel: no direct RD.** Pike values are in §1.3. Strike distances are in §3.2.

**Salmonid functional-form references** (not lake species):
- [Hansen et al. 2013](https://doi.org/10.1080/00028487.2013.785978): cutthroat trout reach 187.1 cm above 18.0 lx; Chinook salmon 122.1 cm above 24.9 lx; Chinook RD declines exponentially beyond 1.65 NTU.
- [Mazur & Beauchamp 2003](https://doi.org/10.1023/A:1025807711512): lake char reach an asymptote 65 % above the trouts'; predation peaked at 0.50–0.75 lx. [AB]

### 1.5 Non-visual detection (lateral line, taste, smell)
- **Yellow perch:** in the dark, RD to *Daphnia* was 2.8 cm. With the lateral line blocked (cobalt chloride), RD at 3,000 lx fell from 5.0 to 3.1 ± 0.3 cm ([Richmond 2004](https://doi.org/10.1111/j.0022-1112.2004.00444.x)) [FT].
- **Ruffe vs yellow perch:** ruffe detected *D. magna* and *Hexagenia* farther than perch in darkness ([Janssen 1997](https://doi.org/10.1111/j.1095-8649.1997.tb01531.x)) [AB]. A search summary says the distances were under one BL; unverified.
- **Smallmouth in the dark:** mean 14.2 cm, peak 40 cm, maximum 55 cm ([Michels 2020](https://conservancy.umn.edu/items/f32b5a41-ee5f-4774-9fe0-77ead86687fa)). Largemouth, by contrast, catch ~0 % in total darkness ([McMahon & Holanov 1995](https://doi.org/10.1111/j.1095-8649.1995.tb01599.x)).
- **Modelling convention:** many models cap non-visual RD at one predator BL. Rohan et al. note that this fits some data (Richmond 2004) but that many predators exceed it ([NOAA manuscript](https://repository.library.noaa.gov/view/noaa/32042)) [FT].
- **Ictalurids (bullhead surrogates):**
  - They "can find distant chemical clues by means of taste alone" and use true gradient search even in still water. Blocking smell did not impair searching; removing taste on one side made them circle toward the intact side ([Bardach, Todd & Crickmer 1967](https://doi.org/10.1126/science.155.3767.1276)) [AB].
  - Facial-nerve taste (skin, barbels, lips) locates food and triggers pick-up, as "a true distance receptor" ([Atema 1971](https://doi.org/10.1159/000125438)) [AB].
- **Brown bullhead in a flume:** 100 % located an odour source in still water and 57 % in flow ([Sherman & Moore 2001](https://doi.org/10.1023/A:1012239222761)) [AB]. The arena distance is not in the abstract.
- **Bullheads switch to daytime activity** when daylight is dimmed to ~1 lx (Eriksson 1978, [via Reebs 2002](https://gambusia.bsp.ncsu.edu/readings/Reebs%202002.pdf)). This is the basis of the sim's "< 1 lux" cue.

### Gaps
- The full Vinyard & O'Brien constants and the Breck & Gitter regression.
- Golden shiner, white perch and white sucker RD.
- Pike RD in cm from Ranåker 2012, and pike night ability.
- Any bullhead search distance in metres.

---

## 2. Search mode, search speed, time budget and diel feeding

### Takeaway
Three search modes:
- **Saltatory (pause–travel) planktivores:** larval golden shiner, white crappie, sunfish. They scan only during pauses.
- **Active roving:** perch in groups; bass, which search for 70–90 % of their active time.
- **Ambush:** pickerel and pike, motionless > 70 % of the time in visual contact with prey, and inactive in > 80 % of 5-min intervals overall.

Fish forage in bouts:
- perch by day, with dawn and dusk peaks;
- shiners within ~1 h after sunset;
- bullheads at night;
- pumpkinseed largely by day, but with night strikes > 75 % of the day's rate;
- pike at dawn and dusk, almost never at night.

The diel habitat side is already in PPSP and WSSB.

### 2.1 Search mode
- **Golden shiner larvae** search saltatorily, scanning only during the stationary pauses between swimming bursts.
  - Only 1–10 % of pauses were followed by an attack.
  - Swimming speed, pursuit speed and prey-location distance all rose with fish size.
  - Source: Browman & O'Brien 1992, CJFAS 49:813–819 ([search](https://scholar.google.com/scholar?q=Browman+O%27Brien+1992+golden+shiner+larvae+search)) [SS].
- **White crappie** (a centrarchid planktivore) never cruise-search on zooplankton. They "move in a stop and go pattern, searching only while paused".
  - With large prey they move farther and faster after an unsuccessful pause and pause for less time.
  - Sources: [O'Brien, Evans & Browman 1989, Oecologia 80:100](https://link.springer.com/article/10.1007/BF00789938) [AB]; larvae do the same ([Browman & O'Brien 1992, EBF 34:181](https://link.springer.com/article/10.1007/BF00002393)) [AB].
- **Pause and move durations in seconds were not obtained.** They are in O'Brien et al. 1990 (Am. Sci. 78:152) and O'Brien, Evans & Howick 1986 (CJFAS 43:1894).
  - Across 18 saltatory species, pause and move rates span 0.1–100 Hz with no size trend ([Bénichou et al. 2005](https://arxiv.org/pdf/cond-mat/0504107)) [FT].
  - Intermittent locomotors pause ~50 % of locomotion time, with a range of 6–94 % (Kramer & McLaughlin 2001) [SS].
- **Bluegill, field swimming** — [Coughlin et al. 2025, J. Plankton Res. 47:fbae048](https://doi.org/10.1093/plankt/fbae048) [FT]
  - Lake Waban, MA; mean TL 14 cm; 20–30 °C; only bouts > 0.5 BL/s kept.
  - **1.26 ± 0.48 BL/s**; tail-beat 1.6 Hz; glides of 0.67 ± 0.51 s; glide duty factor 0.31.
  - Pelagic 1.19 BL/s vs littoral 1.35 BL/s. The authors read the littoral swimming as Ehlinger & Wilson's "hovering–searching".
  - These are not feeding bouts.
- **Bluegill learn their search speed by habitat:** they search faster in open water and slower in vegetation (Ehlinger 1989, Anim. Behav. 38:643) [SS]. Re-learning after a habitat switch takes 3–5 days (Ehlinger & Wilson 1988, PNAS 85:1878) [SS].
- **Mittelbach's bluegill model** used swimming speeds of **1.1 m/min while searching and 0.5 m/min while handling** (Mittelbach 1981, [via Walton et al. 1992](https://ecommons.cornell.edu/server/api/core/bitstreams/4d8460bc-b706-4c25-9db2-4df5fda4a052/content)) [FT].
  - 1.1 m/min is 1.8 cm/s. This is net progress while searching saltatorily, not burst speed.
  - Mittelbach's bluegill encounter rate on *Daphnia* (captures per unit search time) rose as the square of fish length ([via Li et al. 1985](https://ecommons.cornell.edu/server/api/core/bitstreams/fd2c486d-4d7b-467f-8a54-2ce61767516d/content)).
- **Perch hunt actively in groups.** They swim faster and move more often than pike (Eklöv 1992, Anim. Behav. 44:313) [SS].
  - Near a vegetated prey refuge both perch and pike were stationary; perch held in pairs in the vegetation patches ([Eklöv & Diehl 1994](https://link.springer.com/article/10.1007/BF00324223)) [AB].
- **Bass searched for 70–90 % of their activity; pike were motionless > 70 % of visual-contact time** ([Savino & Stein 1989, EBF](https://kb.osu.edu/server/api/core/bitstreams/a76575f9-ea9c-5d34-8d40-9adf1458122e/content)) [FT].
  - Bass switch from searching to ambushing as stems get denser; pike ambush throughout ([Savino & Stein 1989, Anim. Behav.](https://pubs.usgs.gov/publication/1000538)) [SS].
- **Chain pickerel stalk.** On ice-angler video one hovered ~5 min before a slow strike (PPSP:383) [angler].

### 2.2 Speeds (BL/s)

| Species | Speed | Conditions | Source |
|---|---|---|---|
| Yellow perch (Eurasian, surrogate) | day 10.4 cm/s ≈ 0.41 BL/s; night 6.0 cm/s ≈ 0.24 BL/s [derived BL]; activity peaks at sunrise and sunset | 7 perch of 247–265 mm FL; fixes every ~180 s, so true path speed is underestimated | [Zamora & Moreno-Amich 2002](https://link.springer.com/article/10.1023/A:1021396016424) [AB] |
| Smallmouth bass | moving 28 % of 24 h (42 % of daylight + twilight); 4.2 m/min while moving (≈0.16 BL/s [derived]); 825–3,477 m/day | Tennessee reservoir, > 28 °C shallows, manual tracking | [Bevelhimer 1995](https://seafwa.org/sites/default/files/journal-articles/BEVELHIMER-240-249.pdf) [FT] |
| Smallmouth bass | 27.4 ± 4.1 km/day ≈ 31.7 cm/s around the clock (≈0.8 BL/s [derived]) | EMG telemetry, ~18 °C, a power-station forebay (may inflate searching) | [Cooke et al. 2001](https://www.fecpl.ca/wp-content/uploads/2013/06/EMG_Comp_Move_JFB.pdf) [FT] (FMG:62–67) |
| Largemouth bass, cold water | 0.107 m/s (0.26 BL/s) at 5.9 °C; 0.060 (0.12) at 5.1 °C; 0.191 (0.47) at 7.7 °C; < 0.3 BL/s > 90 % of winter time | Warner Lake, ON, whole-lake array, 15-s fixes | [Hanson et al. 2007](https://www.fecpl.ca/wp-content/uploads/2007/07/HB-Hanson-et-al-2007.pdf) [FT] |
| Northern pike (pickerel surrogate) | travel bouts 23.1 ± 2.6 cm/s = **0.45 BL/s** (max 0.91); 5.5 cm/s including rests (Poddubny 1970, quoted) | Lac Ste. Anne, AB; 5-min fixes | [Diana 1979 thesis](https://ualberta.scholaris.ca/handle/123456789/97485) [FT] |
| Bluegill | 1.26 BL/s in swimming bouts | Lake Waban | [Coughlin et al. 2025](https://doi.org/10.1093/plankt/fbae048) [FT] |
| Golden shiner, white sucker, brown bullhead, white perch | **not found** | | |

**The two smallmouth sources disagree by ~5×** (0.16 BL/s while moving, manual vs 0.8 BL/s round the clock, EMG). Coarse-fix and manual tracking undercount distance: in Cooke et al., mark–recapture gave 47.5 m/day and conventional telemetry 77.1 m/day against 27,408 m/day by EMG.

### 2.3 Time budget
- **Pike** (Lac Ste. Anne) — [Diana 1979 thesis](https://ualberta.scholaris.ca/handle/123456789/97485) [FT]:
  - inactive (moved < 5 m) in > 80 % of 5-min intervals;
  - active intervals by period:

    | Period | Summer | Winter |
    |---|---|---|
    | Sunrise | 22 % | 23 % |
    | Day | 17 % | 19 % |
    | Sunset | 21 % | 35 % |
    | Night | **2 %** | 2 % |
    | Overall | **16 %** | 21 % |

  - pike sometimes did not move for 24 h.
- **River pike:** active ~5 % of the time. Long activity events were often followed by > 24 h of quiet and are linked to feeding. Events peaked at dawn and dusk ([Beaumont et al. 2005](http://www.fao.org/docrep/pdf/008/y5999e/y5999e23.pdf)) [FT].
- **Smallmouth:** moving 6.7 h a day ([Bevelhimer 1995](https://seafwa.org/sites/default/files/journal-articles/BEVELHIMER-240-249.pdf)) [FT].
- **Pumpkinseed:** the best lead for a foraging time budget is Collins & Hinch 1993 (TAFS 122:357), but no hours were obtained. Night passes were about half the day and twilight rate, and night strikes were > 75 % of the day's (PPSP:721–723).

### 2.4 Diel feeding periodicity (stomach fullness)
- **Lake Opinicon, early summer** — [Keast & Welsh 1968](https://doi.org/10.1139/f68-099) [AB]; peak hours [via Baumann 1972](https://minds.wisc.edu/bitstreams/b490a33b-92c4-4673-8192-b205f1c648cd/download) [FT, secondary]:
  - yellow perch diurnal;
  - pumpkinseed peaks at **08:00 and 18:00**, with a lower peak at 03:00;
  - bluegill stomachs fullest at 15:00, feeding resuming 20:30;
  - rock bass equally day and night.
- **Lake Wingra, 17–18 Sept 1970** — [Baumann 1972](https://minds.wisc.edu/bitstreams/b490a33b-92c4-4673-8192-b205f1c648cd/download) [FT]:
  - bluegill 75–95 mm peaked at > 1.2 %BW at 19:00 (daily ration 3.9 %);
  - bluegill 105–125 mm peaked at 0.7 % at 16:00 (daily ration 1.8 %);
  - no night feeding; minimum ~04:00;
  - pumpkinseed stomachs held only ~0.1–0.3 %BW [fig.].
- **Yellow perch:**
  - diurnal, with dusk and dawn peaks tied to shoreward moves (Keast & Welsh 1968; Helfman 1979 [SS]);
  - fry of 9–30 mm filled their stomachs all day to a 21:00 maximum and fed little 23:00–05:00 ([Wong 1972](https://mspace.lib.umanitoba.ca/bitstreams/d0894e01-62f3-49f2-8c87-04d92d839d88/download)) [FT];
  - large Eurasian perch were crepuscular in a clear lake and active round the clock in a turbid one ([Jacobsen et al. 2015](https://www.fiskepleje.dk/-/media/sites/fiskepleje/nyheder/2015/juni/behavioural-strategy-of-large-perch-perca-fluviatilis-varies-between-a-mesotrophic-and-a-hypereutrop.pdf)) [FT].
- **Golden shiner** — Hall et al. 1979 ([JFRBC 36:1029](https://doi.org/10.1139/f79-145)) [AB]; WSSB:167–192:
  - zooplankton eaten mostly within ~1 h after sunset as schools leave the littoral zone;
  - little at night, some at dawn;
  - young-of-year feed by day.
- **Brown bullhead:**
  - nocturnal, using shallow water at night ([Dedual 2002](https://link.springer.com/article/10.1023/A:1021319310063)) [AB];
  - captive bullheads fed mostly around dawn and dusk (Eriksson 1978, [via Reebs 2002](https://gambusia.bsp.ncsu.edu/readings/Reebs%202002.pdf)).
- **White sucker:**
  - feeds near sunrise and sunset, inshore ([Scott & Crossman 1973](https://archive.org/details/micro_IA40242807_1274)) [OCR];
  - in the lab, groups were active by day and singles at night (Kavaliers 1980, [via Reebs 2002](https://gambusia.bsp.ncsu.edu/readings/Reebs%202002.pdf)).
- **White perch:** feeding peaks in low light (WSSB:34–56); lake stomach time series not found.
- **Smallmouth:** an afternoon activity peak, minimal at night ([Bevelhimer 1995](https://seafwa.org/sites/default/files/journal-articles/BEVELHIMER-240-249.pdf)). In a river in October, consumption rose to a 20:00 peak ([Johnson & Dropkin 1993](https://www.usgs.gov/publications/dieldrin-variation-diet-composition-a-riverine-fish-community)) [AB].
- **Pike and pickerel:**
  - dawn and dusk peaks; ~2 % active at night ([Diana 1979](https://ualberta.scholaris.ca/handle/123456789/97485));
  - grass pickerel stomachs held fresh food in 32 %, 61 % and 10 % of mid-afternoon, evening and dawn samples [SS];
  - chain pickerel in West Virginia fed at all hours (Lewis 1971, [via Crossman & Lewis 1973](https://archive.org/details/annotatedbiblio00cros)).

### 2.5 Winter and under ice
- **Keeler Bay, Lake Champlain, 2018–19 (angled fish)** — [Block, Stockwell & Marsden, draft](https://vmc.w3.uvm.edu/vmcdevel/attachments/project/1628/Block_et_al__-_Draft_4.docx) [FT, draft]:
  - empty stomachs: yellow perch 34 %, pumpkinseed 76 %, bluegill 51 %;
  - summer consumption over winter: perch 6.0×, pumpkinseed 10.6×, bluegill 17.8×;
  - perch still gained energy under ice; the sunfishes lost it.
- **Fish Lake, ON, at 4 °C** — [Keast 1968](https://doi.org/10.1139/f68-105) [AB]:
  - perch: 10–50 % had food;
  - in spring, active feeding began at 6.5 °C (brown bullhead) and 8.5 °C (pumpkinseed).
- **Pike** were day-active in every season, including winter (Baktoft et al. 2012, EFF 21:386) [AB].

### Gaps
- Pause and move durations for any of the eight species.
- Swimming or search speeds for shiner, sucker, bullhead and white perch.
- A pumpkinseed foraging time budget in hours.
- Chain pickerel activity numbers (the pike values stand in).

---

## 3. Attack and capture

### Takeaway
- Capture per strike is set by the predator's mode and the prey's body form and escape behaviour:
  - esocids catch soft-rayed fusiform prey 0.6–0.8 of the time, but deep-bodied, spiny bluegill only 0.10–0.14;
  - bass catch small bluegill 0.6–0.8 of the time;
  - perch catch 0.2 of single roach but only 0.03 of attacks into a school.
- Cover lowers encounters and attacks; capture per attack holds.
- Strikes start at 0.1–1.2 BL and last 0.05–0.1 s.
- Handling is ~1 s for a zooplankter and 1–10 min for a fish, rising steeply with prey depth relative to the predator.
- All attack rates per hour come from small pools with prey at ~1–10 per m³. They are in-bout rates, not field rates.

### 3.1 Piscivore attack rates and capture success

| Predator (size) | Prey (size) | Conditions | Attacks/h | Capture per strike or attack | Source |
|---|---|---|---|---|---|
| Largemouth 33–37 cm | bluegill 35–44 mm (12 % of length) | pools 2.4–3 m across, 0.7 m deep, 35 prey (~9/m³ [derived]), 16–24 °C, bass starved 24 h; **0 stems/m²** | ≈31 (median) | ≈0.83; "about 70 %" over all 476 attacks | [Savino & Stein 1982](https://kb.osu.edu/server/api/core/bitstreams/eb6b8bd3-2250-5e62-a996-86fd33ebebcd/content) [FT, fig.] |
| same | same | 50 / 250 / 1,000 rope stems/m² | ≈26 / 3 / ~0 | ≈0.58 / 0.67 / — (per-attack success did not change with stems) | same |
| Largemouth 23–27 cm | bluegill 35–45 mm | half the pool at 1,000 stems/m², 20 °C, 35 prey (~8/m²) | 7 (3–10) | ≈0.57 (4 captures/h) | [Savino & Stein 1989, EBF 24:287](https://kb.osu.edu/server/api/core/bitstreams/a76575f9-ea9c-5d34-8d40-9adf1458122e/content) [FT] |
| Largemouth 23–27 cm | FHM 50–60 mm | same | 6 (4–8) | ≈0.67 | same |
| Pike 23–27 cm | bluegill / FHM | same | 1 / 2 | ≈1 (small counts) | same |
| Pike, muskellunge, tiger muskellunge, 150–225 mm | bluegill / FHM / gizzard shad at "optimal" size (25–43 % of length) | 700-L tank, 15 prey, 18–23 °C, 1-h trials | 5.8 / 3.2 / 1.4 per trial | **0.14 / 0.67 / 0.78** (pike alone ≈0.10 / 0.62 / 0.77); prey eaten per h 0.5 / 1.9 / 1.0 | [Wahl & Stein 1988](https://kb.osu.edu/server/api/core/bitstreams/c6475317-58f9-5b99-886d-a6ac29cacf8a/content) [FT] |
| Tiger muskellunge 180–232 mm | FHM / bluegill | 700-L, 17–21 °C, 10–16 prey | — | 2.0 vs **7.5** strikes per capture (≈0.50 vs 0.13); pursuit 1.0 vs 3.0 s; time to capture 185 vs 390 s | [Moody, Helland & Stein 1983](https://kb.osu.edu/server/api/core/bitstreams/c115fd33-97a7-59ba-8579-d859b08e7452/content) [FT] |
| Tiger muskellunge 170 mm, pellet-reared | 60-mm minnows | lab and pond | — | 1.3 strikes per capture if experienced, 2.0 if naive; bluegill 2.0 (lab) and 4.3 (pond); median time to capture 75 vs 540 s | [Gillen, Stein & Carline 1981](https://kb.osu.edu/server/api/core/bitstreams/ad5efed6-642e-5011-945c-07ef865c717b/content) [FT] |
| Eurasian perch 190–235 mm | roach (0.27 of length) | 2.44-m pools with a brick refuge, 17.6 °C, 1,000–5,000 lx, 1–16 prey | 199 attacks in 35 trials | **0.18 overall; 0.20 on singles; 0.03 into schools**; attacks needed for the first capture ≈ 4.31 + 0.69·log₂(n prey); first move to attack 1.14 s; a predation cycle ~2 min | [Turesson & Brönmark 2004](https://lup.lub.lu.se/search/files/2802910/624603.pdf) [FT] |
| Pike 182–221 mm | roach (0.30) | same, 19.7 °C | 166 attacks in 35 trials | **0.15 overall; 0.36 from ambush, 0.12 in pursuit**; not density-dependent; median latency to first move 112 s | same |
| Smallmouth 352–379 mm | round goby, sculpin | lab, light matched to 10 m depth | — | 10.9 % per *reaction* (not per strike) | [Michels 2020](https://conservancy.umn.edu/items/f32b5a41-ee5f-4774-9fe0-77ead86687fa) [FT] |
| Chain pickerel 216–273 mm | goldfish, golden shiners | 40–90-L tanks, 21 °C, high-speed film | — | 23 of 30 filmed strikes caught (not designed to measure success) | [Rand & Lauder 1981](https://sites.harvard.edu/glauder/files/2022/03/RandLauder1981CJZ.pdf) [FT] |
| Yellow perch 156–210 mm | FHM 43–80 mm | 1.5-m tanks, 14–20 °C, 8-day group trials | — | each perch caught **one FHM per 35 h** on average | [Paszkowski & Tonn 1994](https://ualberta.scholaris.ca/items/2934db41-9b42-47af-83a3-2e9b039416af/full) [FT] |

**Field, not lab** — [Smith 1995, Michigan DNR RR 2000](https://www2.dnr.state.mi.us/Publications/PDFS/DNRFishLibrary/ResearchReports/RR1901-RR2000/RR2000.pdf) [FT]
- Lake enclosures with largemouth of 8–14 in eating bluegill of 1–4.9 in.
- **0.15 bluegill per bass per day** in natural weed at 113–203 stems/m², vs **1.5** with the weeds removed.
- Two cleared strips (60 ft of edge) gave 4.4× the predation of one strip (30 ft).

**Conflict.** Smith cites Savino & Stein 1982 as "about 1.0 bluegill per day at 1,000 stems/m²". The sub-researcher read ≈6 per 24 h off their figure 1A. I have not settled which is right.

**Correction to PIKE (Q4 Inferences).** Wahl & Stein's bluegill value printed "0A4" is **0.14**, not 0.44:
- it means 5× as many strikes per capture;
- Moody et al. found 0.13 independently.

So esocid success on deep-bodied sunfish is about one-fifth of that on minnows, not half to two-thirds. The audit (B1) already uses 0.14.

**Correction to PIKE (Q4 Gaps).** These are the attack rates per hour PIKE lists as missing. They are still lab in-bout values, not field rates.

### 3.2 Strike distance and kinematics
- **Chain pickerel** — [Rand & Lauder 1981](https://sites.harvard.edu/glauder/files/2022/03/RandLauder1981CJZ.pdf) [FT]:
  - fish of 216–273 mm FL;
  - strike begins at **0.37 BL** (SD 0.20, n = 23) in the fast "S-start" pattern, and **0.14 BL** (SD 0.08, n = 7) after a slow S-posture;
  - the mouth opens 0.28–0.35 BL from the prey;
  - first movement to reaching the prey: 0.092 s (A, caught), 0.114 s (A, missed), 0.051 s (B);
  - peak velocity 7–9 BL/s (≈1.6–2.0 m/s for a 22-cm fish [derived]); mean 2.7–4.0 BL/s; acceleration 81–121 BL/s² over the first 50 ms;
  - opening the mouth too early was a main cause of misses.
- **Pike and largemouth, 23–27 cm:** strike distance **0.15 m** (pike, 95 % CI 0.10–0.20, n = 15) and **0.30 m** (largemouth, 0.25–0.35, n = 58) ([Savino & Stein 1989](https://kb.osu.edu/server/api/core/bitstreams/a76575f9-ea9c-5d34-8d40-9adf1458122e/content)) [FT].
- **Largemouth 33–37 cm** attacked bluegill "within about 0.5 m". Attacked bluegill were ≈0.35–0.45 m away whatever the stem density ([Savino & Stein 1982](https://kb.osu.edu/server/api/core/bitstreams/eb6b8bd3-2250-5e62-a996-86fd33ebebcd/content)) [FT, fig.].
- **Pike of mean 0.38 m:** strike distance 0.087–0.439 m, shrinking as the prey's apparent size grows from 2.6° to 9.9° (r² = 0.75) ([Harper & Blake 1991](https://cob.silverchair.com/jeb/article-pdf/155/1/175/2578620/jexbio_155_1_175.pdf)) [SS].
- **Maximum attack speed and acceleration:** pike 4.0 m/s and 120 m/s²; largemouth 1.0 m/s; perch 1.15 m/s and 24 m/s² ([Jeschke & Tollrian 2007](https://www.ruhr-uni-bochum.de/ecoevo/Bilder/pubs/tollrianpu/Jeschke%20&%20Tollrian%202007.pdf), citing Harper & Blake) [FT].
- **Smallmouth turning radius** in attacks: 0.11 ± 0.02 L ([Webb 1983](https://www.umesc.usgs.gov/data_library/fisheries/fish_passage/webb.html)) [AB].
- **Follow distance before the strike** (esocids): FHM 23 cm, shad 17 cm, bluegill 38 cm. Where strikes landed on FHM: 67 % mid-body, 20 % tail, 13 % head ([Wahl & Stein 1988](https://kb.osu.edu/server/api/core/bitstreams/c6475317-58f9-5b99-886d-a6ac29cacf8a/content)) [FT].
- **Hesitation before pursuit:** 1–5 s. Only ~50 % of bluegill follows led to pursuit; every FHM follow did ([Moody et al. 1983](https://kb.osu.edu/server/api/core/bitstreams/c115fd33-97a7-59ba-8579-d859b08e7452/content)) [FT].

### 3.3 Handling time, satiation and refractory time
- **Esocids** handled optimal-size prey for FHM ≈3.3 min, shad ≈4.5 min and bluegill ≈6.2 min ([Wahl & Stein 1988](https://kb.osu.edu/server/api/core/bitstreams/c6475317-58f9-5b99-886d-a6ac29cacf8a/content)) [FT, fig.].
- **Tiger muskellunge, grasp to ingestion** (s; 100-L aquaria, 19–23 °C) — [Gillen et al. 1981, fig. 3](https://kb.osu.edu/server/api/core/bitstreams/ad5efed6-642e-5011-945c-07ef865c717b/content) [FT, fig.]:

| Predator | Minnow 30 mm | Minnow 50 mm | Minnow 70 mm | Minnow 80 mm | Bluegill 30 mm | Bluegill 50 mm | Bluegill 60 mm | Bluegill 67 mm | Bluegill 78–80 mm |
|---|---|---|---|---|---|---|---|---|---|
| 90 mm | ≈75 | ≈285 | | | | | | | |
| 150 mm | ≈10 | ≈40 | ≈120 | ≈245 | | | | | |
| 170 mm | ≈10 | ≈30 | ≈70 | ≈105 | ≈15 | ≈55 | ≈170 | ≈240 | |
| 250 mm | ≈5 | | | ≈35 | | | | | ≈125 |
| 310 mm | | | | ≈45 | | | | | ≈135 |

- **Body depth:** minnow BD = 1.13 + 0.14·BL; bluegill BD = 3.38 + 0.36·BL (mm) ([Gillen et al. 1981](https://kb.osu.edu/server/api/core/bitstreams/ad5efed6-642e-5011-945c-07ef865c717b/content)) [FT].
- **Yellow perch eating FHM, capture to normal breathing and swimming** — [Paszkowski & Tonn 1994](https://ualberta.scholaris.ca/items/2934db41-9b42-47af-83a3-2e9b039416af/full) [FT, fig.]:
  - perch of 198–210 mm on FHM of 43–55, 60–66 and 71–80 mm: ≈150, 310 and 770 s;
  - perch of 156–189 mm on the same prey: ≈110, 245 and 650 s;
  - 87 % of prey were swallowed head first.
- **Largemouth, 70–285 mm FL** — [Hoyle & Keast 1987](https://research.qubs.ca/projects/the-effect-of-prey-morphology-and-size-on-handling-time-in-a-piscivore-the-largemouth-bass-micropterus-salmoides) [AB]:
  - handling = 1 + a·exp(b·L_prey/L_pred); a and b not retrieved;
  - at equal prey length, longest first: crayfish > bluegill > yellow perch > stickleback > bluntnose minnow > tadpole;
  - handling per gram is least at a length ratio of 0.22–0.29.
- **Pike handling** rises with prey body depth, not length; head-first strikes shorten it ([Nilsson & Brönmark](https://lup.lub.lu.se/record/146726)) [AB]. Two intermediate-size prey cannot fit at once (PIKE:140).
- **Satiation and refractory time:**
  - perch averaged one fathead per 35 h in group trials ([Paszkowski & Tonn 1994](https://ualberta.scholaris.ca/items/2934db41-9b42-47af-83a3-2e9b039416af/full));
  - river pike rested > 24 h after long activity events ([Beaumont et al. 2005](http://www.fao.org/docrep/pdf/008/y5999e/y5999e23.pdf));
  - pike are meal feeders: feeding is brief relative to the interval between meals ([Diana 1979](https://doi.org/10.1139/z79-279)).
- **After a miss** the predator strikes again within seconds:
  - perch average 4–7 attacks per capture within a ~2-min predation cycle ([Turesson & Brönmark 2004](https://lup.lub.lu.se/search/files/2802910/624603.pdf));
  - tiger muskellunge needed 7.5 strikes per bluegill caught ([Moody et al. 1983](https://kb.osu.edu/server/api/core/bitstreams/c115fd33-97a7-59ba-8579-d859b08e7452/content)).

### 3.4 Planktivores: capture and handling
- **Handling** is ~1 s per small *Daphnia* whatever the fish's size.
  - Werner (1974)'s regressions give 1.02 s (7.6-cm SL bluegill, 1.16-mm *Daphnia*) to 1.72 s (3.8-cm fish, 2.01-mm prey) ([Li et al. 1985](https://ecommons.cornell.edu/server/api/core/bitstreams/fd2c486d-4d7b-467f-8a54-2ce61767516d/content)) [FT].
- **Mittelbach's (1981) bluegill fit:** **H = 0.536·e^(18.488·l/L) s**, with l/L prey length over fish length. Below l/L = 0.034 it is constant (≈1.0 s) ([via Walton et al. 1992](https://ecommons.cornell.edu/server/api/core/bitstreams/4d8460bc-b706-4c25-9db2-4df5fda4a052/content)) [FT].
  - The OCR reads "el 8.488". The exponent 18.488 is the reading consistent with Li et al.'s ~1 s values [derived].
  - Fish under 20 mm SL take about twice as long, fitted by H = 0.566·e^(21.83·l/L) up to l/L ≈ 0.13.
- **Capture probability for a simulated suction feeder** (10 mL through a 1-cm tube in 0.4 s) — [Drenner 1977, the basis of Drenner, Strickler & O'Brien 1978](https://kuscholarworks.ku.edu/entities/publication/5e60163e-3a80-4ce4-925c-7bb2e471419d) [AB]:
  - *Ceriodaphnia* 0.96, *D. galeata* 0.92, *D. pulex* 0.76;
  - cyclopoids 0.28, *Cyclops scutifer* 0.24, *Diaptomus pallidus* **0.07**.
- **Lake herring** (a generic planktivore): cladocerans 86.7 % per reaction, copepods 48.9 % ([Link 1996](https://digitalcommons.mtu.edu/michigantech-p/13570)) [AB] (FZC:602).
- **Age-0 yellow perch:** **94 %** on *D. pulicaria* ([Richmond 2004](https://doi.org/10.1111/j.0022-1112.2004.00444.x)). "Nearly 100 %" on daphnids at 30–35 mm TL, when they switch from *Diaptomus* to *Daphnia* ([Mills, Confer & Ready 1984](https://pure.psu.edu/en/publications/prey-selection-by-young-yellow-perch-the-influence-of-capture-suc/)) [AB].
- **Juvenile sunfish:** 0–0.6 at 11 mm SL, rising to 1.0 above 20 mm (§1.1 table).
- **Bluegill among stems** (50–60 mm, chironomids fixed on stems, 25 °C): captures per 5 min fell from ≈21 to ≈16, ≈13.5 and ≈12 as stems rose from 17 to 99, 452 and 964 per m² ([Savino, Marschall & Stein 1992](https://kb.osu.edu/server/api/core/bitstreams/59f9d37b-4f56-582f-ad73-764c54b02eb4/content)) [FT, fig.].

### Gaps
- Stein 1977 (smallmouth on crayfish by crayfish size and sex) and Probst et al. 1984 (smallmouth crayfish rations).
- Christensen & Persson 1993; Neill & Cullen 1974; Webb & Skadsen 1980; Hoyle & Keast's constants.
- Any attack or capture data for white perch, bullhead or sucker as predators.
- A yellow perch strike distance.

---

## 4. Daily ration, meal frequency and gastric evacuation

### Takeaway
- **Planktivores** take thousands of zooplankters a day, in feeding bouts. At summer *Daphnia* densities their intake is limited by handling and the gut, not by encounters (§9 worked example).
- **Piscivores** take one to a few prey a day, or fewer:
  - pike clear a meal in 2 days in summer and 12 days in winter;
  - half their stomachs are empty.
- **Smallmouth** carry 1–2 crayfish at a time.
- **Evacuation** is exponential in time and its rate rises exponentially with temperature:
  - white perch 90 % empty in ~10 h at 20 °C;
  - perch take 12 h for a 2 % fish meal at 22 °C but 72 h at 8 °C;
  - crayfish take about twice as long as fish.

### 4.1 By species

**Yellow perch**
- **Field ration** (Lake Memphremagog) — [Nakashima & Leggett 1978](https://doi.org/10.1139/f78-249) [AB] (FZC:481):
  - **5.5–6.7 %BW/day in July; 2.2–2.4 % in October**;
  - the Keast & Welsh method came out ~50 % low.
- **Lab** (juveniles 5–24 g) — [Schneider 1973, Michigan DNR RR 1802](https://www.dnr.state.mi.us/PUBLICATIONS/pdfs/DNRFishLibrary/ResearchReports/RR1801-RR1900/RR1802.pdf) [FT]:
  - appetite 7.6 %BW/day on excess food; best 7–8 % at 21–25 °C;
  - maintenance on fish 2.0 %/day (1.2 % at 10 °C; 3.0 % at 26.8 °C).
- **Digestion of single meals** (perch 9.7–105.8 g) — [Schneider 1973, RR 1803](https://www.dnr.state.mi.us/PUBLICATIONS/PDFS/DNRFishLibrary/ResearchReports/RR1801-RR1900/RR1803.pdf) [FT; checked]:
  - **7.8 °C:** a 2.1 %BW fish meal was ~50 % digested at 24 h and 100 % at 72 h, for perch of every size;
  - **14.4 °C:** a 1.9 % fish meal was 90 % digested in 20 h; a 1.5 % crayfish meal took 32 h; a 0.09 % meal was > 90 % gone in 2 h;
  - **22.2 °C:** a 2.3 % meal was 53 % digested at 4 h, 74 % at 8 h and 100 % at 12 h;
  - between 14 and 27 °C each +1 °C cuts digestion time by about 1.2 h.
- **Age-0 perch** eating zooplankton continuously: evacuation depends on fish length, prey size and number, with a break at 36.5 mm ([Mills et al. 1984](https://doi.org/10.1139/f84-061)) [AB; coefficients not obtained].
- **Eurasian perch:** exponential evacuation, with the rate rising exponentially over 4.0–21.7 °C. Zooplankton, chironomids, *Chaoborus* and *Gammarus* empty at the same rate ([Persson 1979](https://doi.org/10.1111/j.1365-2427.1979.tb01493.x)) [AB; coefficients not obtained].
- **Prey size by age** (Lake Opinicon): age 0 ~0.1 mg; age II 0.5–1.0 mg; age ≥ V 100–250 mg (odonates, crayfish, fish) ([Keast 1977](https://doi.org/10.1007/BF00001416)) [AB].
- **Items per day [derived]:**
  - a 200-g age-V perch at 5.5–6.7 % eats 11–13 g/day, about **45–130 prey of 100–250 mg**;
  - a 10-g age-1 perch at 6 % eats 0.6 g, about **4,300 *Daphnia* of 1.5 mm**. This takes *Daphnia* as ≈14 µg dry (ZOO: ln W = 1.468 + 2.829 ln L) and dry as 10 % of wet (ZOO:397).

**Pumpkinseed (bluegill surrogate)**
- **Lab bluegill** (8–22 g): appetite 4.3 %BW/day; maintenance 1.3 %/day ([Schneider 1973, RR 1802](https://www.dnr.state.mi.us/PUBLICATIONS/pdfs/DNRFishLibrary/ResearchReports/RR1801-RR1900/RR1802.pdf)) [FT].
- **Field bluegill:** 2.5 %/day in June (Keast & Welsh, via Schneider); 1.8–3.9 %/day in September ([Baumann 1972](https://minds.wisc.edu/bitstreams/b490a33b-92c4-4673-8192-b205f1c648cd/download)) [FT].
- **Evacuation:** bluegill 17–19 h at 21 °C (Windell 1967); largemouth 17.5 h at 24–25 °C (Hunt 1960). Both [via Austen & Orth 1985](https://seafwa.org/sites/default/files/journal-articles/AUSTEN-97-107.pdf) [FT, secondary].
- **Field evacuation** (bluegill 50–90 mm, Lake Opinicon) rises with temperature over 10–25 °C, with high variance ([Booth 1990](https://doi.org/10.1139/z90-084)) [AB].

**Smallmouth bass (largemouth surrogate for ration)**
- **Largemouth ration,** age III, Lake Rebecca: from ~0 in mid-May to > 5 %BW/day in late August ([Cochran & Adelman 1982](https://doi.org/10.1007/BF00002501)) [AB] (LMB:373).
- **New River stomachs** — [Austen & Orth 1985](https://seafwa.org/sites/default/files/journal-articles/AUSTEN-97-107.pdf) [FT]:
  - mean crayfish per stomach 0.11–0.75 at 152–228 mm, 0.38–1.00 at 229–304 mm, **1.0–2.0 above 304 mm**;
  - 6–12.7 insects per stomach at 152–228 mm in summer;
  - crayfish eaten averaged 40–48 mm TL, fish 45–50 mm, about 17–21 % of bass TL;
  - empty stomachs 0–78 % by sample.
- **Crayfish consumed by bass** — [Rabeni 1992](https://doi.org/10.1139/f92-190) [AB]; [Roell & Orth 1993](https://doi.org/10.1577/1548-8659(1993)122<0046:TBOPOS>2.3.CO;2) [SS]:
  - in an Ozark stream, smallmouth and rock bass ate about a third of crayfish production in the vulnerable period;
  - in the New River, smallmouth ate 35 % of age-1 and age-2 crayfish production (bioenergetics estimate).

**Chain pickerel (pike surrogate)**
- **Pike, Lac Ste. Anne** (n = 1,290) — [Diana 1979, thesis](https://ualberta.scholaris.ca/handle/123456789/97485) [FT]; [CJZ 57:2121](https://doi.org/10.1139/z79-279) [AB]:
  - **47 % of stomachs empty overall** (29–62 % by month);
  - **~2 prey per non-empty stomach**;
  - evacuation **48 h in summer, 12 days in winter**;
  - ~65 % of the year's energy gain made 1 May–31 July;
  - rare large prey dominate energy intake.
- **Young-of-year esocids** (Ohio reservoirs) fed continuously, day and night ([Wahl & Stein 1991](https://kb.osu.edu/items/ac9adeb2-98cc-5060-b8b4-439ed2a28c68)) [FT].
- **Chain pickerel** — [Crossman & Lewis 1973 annotations](https://archive.org/details/annotatedbiblio00cros) [annotations read]:
  - fed throughout 24 h (Lewis 1971);
  - fish in 47.6 % and crayfish in 44.8 % of stomachs of fish aged ≥ 1 (Raney 1942);
  - 38 % of 115 Florida adults contained food (Buntz 1967);
  - 381–584-mm pickerel took prey of 51–127 mm.
- **Nova Scotia pickerel:** 17.6 % empty (PPSP:352).
- **No pickerel ration or evacuation rate exists** in the literature indexed to 1973 (same bibliography).

**White perch**
- **Evacuation** (Lake Erie, lab and field): **R = 0.028·e^(0.106·T)** (per hour, exponential model) ([Parrish & Margraf 1990](https://doi.org/10.1007/BF00005032)) [AB].
- Time to 90 % empty, ln 10 / R [derived]: ~28 h at 10 °C, ~17 h at 15 °C, ~10 h at 20 °C, ~6 h at 25 °C.
- **Ration not found.**

**Golden shiner, white sucker, brown bullhead: no ration or evacuation rate found.**
- Golden shiner (Lake Opinicon): cladocerans 20–90 % of diet volume by month ([Keast & Webb 1966, via Scott & Crossman](https://archive.org/details/micro_IA40242807_1274)).
- Juvenile white sucker: 95 % microcrustaceans in July, > 90 % detritus by October ([Ahlgren 1990](https://doi.org/10.1139/f90-004)) [AB].

### 4.2 Items a day for the sim's sizes [derived]
Body masses use the length–weight equations in `species.js`.

| Fish | Ration | Items/day |
|---|---|---|
| Chain pickerel 40 cm (411 g) | 1–3 %BW/day (PIKE:101) | 4–12 g/day ≈ **0.7–2 golden shiners of 8 cm** (6.1 g), or **1–3 pumpkinseed of 6 cm** (3.8 g) |
| Large pike (Diana's counts) | ~2 prey per non-empty stomach, 53 % non-empty, 2-day evacuation | ≈ **0.5 prey/day**, with large prey |
| Smallmouth 35 cm (648 g) | 2–5 %BW/day (largemouth's late-summer range) | 13–32 g/day ≈ **1–3 crayfish** of 12 g (`PREY.CRAY_G`); matches 1–2 per stomach and ~1-day evacuation |
| Yellow perch | see §4.1 | thousands of *Daphnia* (10-g fish) or tens of large items (200-g fish) |

### Gaps
- Field rations for golden shiner, white sucker, brown bullhead, white perch and chain pickerel.
- The Persson and Mills evacuation coefficients.
- Probst 1984 smallmouth crayfish per day.
- Zooplankters per stomach for shiner, perch and pumpkinseed.

---

## 5. Encounter models for a coarse time step

### Takeaway
A visual fish's encounter rate is the volume it scans per second times the prey density:
- for a cruising fish, a half-cylinder of radius RD swept at its search speed;
- for an ambusher, the flux of moving prey into its strike sphere.

Gerritsen & Strickler (1977) cover both cases in one formula. RD comes from a light- and turbidity-limited visual-range model (Aksnes & Giske 1993; Aksnes & Utne 1997).

Multiply by capture probability and divide by (1 + Σ encounter × capture × handling time) to get intake. This is Holling's disc equation for many prey.

For piscivores, handling hardly limits intake; digestion does (Breck 1993). Captures come in bursts, not as a smooth Poisson stream (Petersen & DeAngelis 1992).

### 5.1 Gerritsen & Strickler (1977): random-direction swimmers in 3-D

**Z = (π R² N / 6) · [(u + v)³ − |u − v|³] / (u v)**

- Z: encounters per predator per second; R: encounter radius (m); N: prey density (m⁻³); u: prey speed; v: predator speed (m/s).
- As reproduced in the [IntechOpen chapter by Lemus-Santana et al.](https://www.intechopen.com/chapters/56972) (x = prey, y = predator) [FT, garbled extraction; the form checked algebraically].
- The original (J. Fish. Res. Board Can. 34:73–82) was not read.

Cases [derived]:
- **v ≥ u:** Z = π R² N (u² + 3v²)/(3v).
- **u > v:** Z = π R² N (v² + 3u²)/(3u).
- **Still prey (u → 0):** Z = π R² N v. A cruising fish sweeps a cylinder.
- **Still predator (v → 0, an ambusher):** Z = π R² N u. Prey swim into its sphere.

In turbulent water the same chapter replaces each speed by √(speed² + w²), with w the turbulent velocity (Rothschild–Osborn).

### 5.2 A forward-looking visual fish
Fiksen et al. (2002, eq. 1) use a half cylinder:

**e = ½·π·R²·N·V**

with R the visual range and V the relative velocity, swimming plus turbulence ([Fiksen, Aksnes, Flyum & Giske 2002, Hydrobiologia 484:49](https://bio.uib.no/te/papers/Fiksen_2002_The_influence.pdf)) [FT].

### 5.3 Visual range from light and turbidity (Aksnes & Utne 1997)
As written in Fiksen et al. 2002 (eq. 2) ([Fiksen et al. 2002](https://bio.uib.no/te/papers/Fiksen_2002_The_influence.pdf)) [FT]:

**R²·exp(c·R) = C·A_p·E′·E_b / (K_e + E_b)**

- C: the prey's inherent contrast.
- A_p: prey area (m²; 0.1·L² for a fish larva).
- E′: the eye's sensitivity, E_max/S_e. Fiksen et al. set it to 10⁴ for a planktivorous fish predator.
- E_b: background irradiance at the fish's depth, E_b = E_s·exp(−K·z).
- K_e: the saturation parameter, the half-saturation irradiance.
- c: the beam attenuation coefficient. Fiksen et al. take c = 3K (Kirk 1980) for turbid sea water.
- Symbols as in Rohan et al. ([NOAA manuscript](https://repository.library.noaa.gov/view/noaa/32042)) [FT].

**Consequences:**
- **In clear water (c·R ≪ 1),** R ∝ √(C·A_p) ∝ prey length. That is the linear RD-vs-prey-size relation measured in §1.1.
- **The exp(cR) term bites hardest on long reaction distances.** Worked example [derived]:
  - Hot Brook's stained water has Kd ≈ 0.85 m⁻¹ (`chem3.js`: Kd·SD ≈ 2.55, Secchi ~3 m).
  - The c/K ratio is lower in humic (absorbing) water than in clay (scattering) water, so c lies somewhere between ≈K and 3K. Here that is c ≈ 1–2.5 m⁻¹.
  - Compare against clear water (c = 0.3 m⁻¹):

    | Forager | Clear-water RD | At c = 1.0 | At c = 2.5 |
    |---|---|---|---|
    | Piscivore | 1.5 m | ≈1.09 m (−27 %) | ≈0.75 m (−50 %) |
    | Planktivore | 0.30 m | ≈0.27 m (−9 %) | ≈0.235 m (−22 %) |

  - The pike model's "moderately brown" 1.0 m (from 1.5 m clear; §1.3) falls in this range.
- **Experimental agreement:** declining light and rising turbidity cut "reaction distances, search volumes, and prey encounters at disproportionately higher rates for piscivores than for planktivores". Capture success per encounter *improved* in degraded optical conditions ([Beauchamp, Hansen & Schoen, AFS 2011 abstract](https://afs.confex.com/afs/2011/webprogram/Paper4473.html)) [AB].

### 5.4 Diet shares when prey are taken as met
The reactive-field-volume model (Eggers 1982) gives the share of prey j in the diet:

**F_j = RD_j²·N_j / Σ_k RD_k²·N_k**

- This is for a cruising fish. A stationary fish scanning a sphere weights RD³.
- Source: [Wetterer & Bishop 1985, Ecology 66:457, eq. 2](https://math.stonybrook.edu/~bishop/papers/Wetterer-PlanktivorePreySelection-1985.pdf) [FT].
- Larger juvenile and adult sunfish are *more* selective for big *Daphnia* than this predicts ([Li et al. 1985](https://ecommons.cornell.edu/server/api/core/bitstreams/fd2c486d-4d7b-467f-8a54-2ce61767516d/content); [Walton et al. 1992](https://ecommons.cornell.edu/server/api/core/bitstreams/4d8460bc-b706-4c25-9db2-4df5fda4a052/content)). Small ones follow it.

### 5.5 Intake with capture and handling (multi-prey Holling type II)
Items eaten per unit foraging time:

**I = Σ_i λ_i·p_i / (1 + Σ_i λ_i·p_i·h_i)**

- λ_i: encounter rate (5.1–5.2); p_i: capture probability per attack (§3); h_i: handling time (§3.3–3.4).
- Mittelbach (1981) built his bluegill model from measured encounter rates (∝ fish length²) and handling times. Walton et al. use energy costs while searching and handling on top of this.
- In food-web notation the same form is g_ij = a_ij·N_j / (1 + Σ_k b_ik·N_k).

### 5.6 Piscivores: digestion, not handling, limits intake
Breck (1993) argues ([TAFS 122:902](https://catalog.comses.net/publications/167896)) [AB]:
- piscivore RD depends much less on prey size than a planktivore's, because it is contrast-limited, not acuity-limited;
- handling time is largely irrelevant to a piscivore's daily ration, which is limited by digestion or encounter;
- a type I response up to a daily maximum may fit better than a type II.

### 5.7 Captures cluster in time
- Petersen & DeAngelis (1992) modelled northern pikeminnow eating juvenile salmon ([CJFAS 49:2551](https://www.usgs.gov/publications/functional-response-and-capture-timing-individual-based-model-predation-northern)) [AB].
- Type II and type III responses fit equally well.
- Captures by individual predators were **clustered**: a compound-Poisson "feeding bout" model fit, a plain Poisson renewal process did not.
- The authors read this as prey being met in schools or patches.

### 5.8 From a rate to a step [derived]
- For a step Δt with constant rate λ, events ~ Poisson(λ·Δt), and P(≥ 1) = 1 − e^(−λΔt).
- For prey in schools:
  - draw the schools met, Poisson(λ_school·Δt), with λ_school from 5.1–5.2 using the school density (N/n) and the radius R + r_school;
  - then draw kills per school met from the in-bout attack count and per-attack success (§3, §6).
- This reproduces the clustering in 5.7.

---

## 6. Anti-predator behaviour in real time

### Takeaway
Prey see bass sooner than bass see prey in good light (2 m vs 1 m), but not below ~5 lx. Prey keep 0.4–1.2 m from predators and flee at 15–25 cm from an esocid.

Escape latency is 0.08–0.26 s, longer than a pickerel strike (0.05–0.11 s). So a prey fish's safety comes from distance and cover before the strike, not from reacting to it.

Schooling cuts per-attack success for perch (0.20 → 0.03) and bass (capture in 100 % of trials with one prey vs 11 % with 15). It does not for pike. Dense stems cut encounters and attacks, not per-attack success.

### 6.1 Detection, flight distance and spacing
- **Bluegill detecting a 29-cm bass:** 200 cm at 3,340 lx, 121 at 103 lx, 77.6 at 5.59 lx, 33.2 at 1.49 lx ([Howick & O'Brien 1983](https://doi.org/10.1577/1548-8659(1983)112%3C508:PFBOLB%3E2.0.CO;2)). Turbidity: 210 cm clear vs 35 cm at 5 NTU (Miner & Stein 1996, [via De Robertis et al. 2003](https://doi.org/10.1139/f03-123)).
- **Flight from a tiger muskellunge:** FHM schools fled at ~**15 cm**, bluegill at ~**25 cm**. Fleeing bluegill swam ~75 cm, surface to bottom, or froze within 0–1 cm of a wall ([Moody et al. 1983](https://kb.osu.edu/server/api/core/bitstreams/c115fd33-97a7-59ba-8579-d859b08e7452/content)) [FT].
- **Median distance from predator to the nearest prey not attacked** — [Savino & Stein 1989](https://kb.osu.edu/server/api/core/bitstreams/a76575f9-ea9c-5d34-8d40-9adf1458122e/content) [FT]:

  | Prey | From bass | From pike |
  |---|---|---|
  | Bluegill schools | 1.2 m | 1.2 m |
  | Dispersed bluegill | 0.8 m | 0.4 m |
  | FHM schools | 0.9 m | 0.8 m |
  | Dispersed FHM | 0.7 m | 0.4 m |

- **Schooling share with and without predators** (same source):

  | Prey | No predator | With bass | With pike |
  |---|---|---|---|
  | Bluegill schooling | 31 % | 35 % | 0 % |
  | FHM schooling | 40 % | 68 % | 48 % |
  | Bluegill in cover | 65 % | 100 % | 82 % |

- **With a bass present,** the nearest bluegill school stayed ≈1.05–1.55 m away. Schooling was ≈75 % at 0–50 stems/m² and ≈25 % at 1,000 stems/m² ([Savino & Stein 1982](https://kb.osu.edu/server/api/core/bitstreams/eb6b8bd3-2250-5e62-a996-86fd33ebebcd/content)) [FT, fig.].
- **FHM struck by different predators** — [Webb 1982](https://link.springer.com/article/10.1007/BF00609671) [SS]:
  - 75–90 % responded to strikes by trout, smallmouth or rock bass, but only 28 % to tiger muskellunge;
  - 54–94 % of responses escaped;
  - the esocid's looming-rate threshold was 15–80× higher, the stealth of a slow S-posture approach.
- **Escape latency** (golden grey mullet, a generic surrogate): first responders 82 ± 30 ms, others 255 ± 190 ms ([Marras & Domenici 2013](https://pmc.ncbi.nlm.nih.gov/articles/PMC3680440/)) [FT].
- **Golden shiner groups of 40:** alarm substance cut nearest-neighbour distance by 2.04 cm and enlarged startle cascades by 0.95 fish. The response had habituated by the third exposure ([Sosna et al. 2019](https://kops.uni-konstanz.de/handle/123456789/73406)) [FT].
- **Lasting fear:** johnny darters cut activity to 6 % of control with smallmouth (125–140 mm) present, and stayed low for ≥ 24 h after a 30-min exposure ([Rahel & Stein 1988](https://kb.osu.edu/server/api/core/bitstreams/3fdbb4d6-7c80-5f24-9b60-94f63bb9fc26/content)) [FT].

### 6.2 Schools: confusion and dilution
- **Largemouth on silvery minnows** — [Landeau & Terborgh 1986](https://scholars.duke.edu/publication/801906) [AB]:
  - bass were "stymied" at ≥ 8 fish;
  - trials ending in a capture: **100 % with 1 prey, 17 % with 8, 11 % with 15** ([via Penry-Williams et al.](https://ueaeprints.uea.ac.uk/67382/1/Penry_Williams_Oddity.pdf)) [FT, secondary].
- **Perch suffer confusion; pike do not:**
  - perch per-attack success 0.20 on singles vs 0.03 into schools; attacks needed rise from 4.3 (1 prey) to 7.1 (16 prey);
  - pike stayed at 0.15 whatever the group size ([Turesson & Brönmark 2004](https://lup.lub.lu.se/search/files/2802910/624603.pdf)) [FT];
  - perch compensate by singling out one prey and attacking it repeatedly.
- **White perch on banded killifish** (Morgan & Godin 1985) is listed as "unclear" for confusion ([Jeschke & Tollrian 2007](https://www.ruhr-uni-bochum.de/ecoevo/Bilder/pubs/tollrianpu/Jeschke%20&%20Tollrian%202007.pdf)) [FT].
- **Schooled share of attacked bluegill:** only 6 % with largemouth in the 1982 pools (n = 302), but 52 % in the 1989 half-cover pools (FHM 35 %) ([Savino & Stein 1982](https://kb.osu.edu/server/api/core/bitstreams/eb6b8bd3-2250-5e62-a996-86fd33ebebcd/content); [1989](https://kb.osu.edu/server/api/core/bitstreams/a76575f9-ea9c-5d34-8d40-9adf1458122e/content)).

### 6.3 Vegetation density
- **Largemouth on bluegill, rope stems** — [Savino & Stein 1982](https://kb.osu.edu/server/api/core/bitstreams/eb6b8bd3-2250-5e62-a996-86fd33ebebcd/content) [FT, fig.]:

  | Stems/m² | 0 | 50 | 250 | 1,000 |
  |---|---|---|---|---|
  | Follows/h | ≈54 | 46 | 14 | 4 |
  | Attacks/h | ≈31 | 26 | 3 | ~0 |
  | Captures in 1 h | ≈25 | 16 | 2.5 | ~1 |
  | Attacks per follow | ≈59 % | 68 % | 23 % | 0 |
  | Captures per attack | ≈0.83 | 0.58 | 0.67 | — |

  - Capture rate breaks above ~15 % cover; dispersed bluegill are safe at ~40 % cover.
  - Cover from stem counts: rope 2.68 + 0.04·stems; *Potamogeton natans* 4.93 + 0.06·stems.
  - **≈130 natural *P. natans* stems/m² ≈ 250 rope stems/m²** in cover; 40 % cover ≈ 1,000 rope or ≈ 600 natural stems/m² [derived].
- **Half cover** (a 1,000-stem patch over half the pool): bass still caught 4 bluegill/h. Encounters were twice those in uniform 250 or 1,000 stems/m² ([Savino & Stein 1989](https://kb.osu.edu/server/api/core/bitstreams/a76575f9-ea9c-5d34-8d40-9adf1458122e/content)) [FT]. Patchiness matters as much as density.
- **At 1,000 stems/m²** both bass and pike still caught minnows, but not bluegill ([Savino & Stein 1989, Anim. Behav.](https://pubs.usgs.gov/publication/1000538)) [SS].
- **Natural weed in a lake:** 113–203 stems/m² gave 0.15 bluegill per bass per day vs 1.5 with weeds removed ([Smith 1995](https://www2.dnr.state.mi.us/Publications/PDFS/DNRFishLibrary/ResearchReports/RR1901-RR2000/RR2000.pdf)) [FT].
- **Bluegill choose a refuge patch at 516 stems/m²** (Gotceitas & Colgan 1989, [via Shoup & Broderius 2018](https://academic.oup.com/najfm/article/38/3/630/7817463)). A bass-success threshold of 276 stems/m² is [SS, unverified].
- **Pike chose structured habitat only below 600 stems/m²;** pike success ran rudd > roach > perch ([Bean & Winfield 1995](https://eprints.gla.ac.uk/187862)) [AB].
- **Age-0 perch** used vegetation when pike were present, but high turbidity cancelled the effect ([Snickars et al. 2004](https://research.slu.se/en/publications/antipredator-behaviour-of-0-year-perca-fluviatilis-effect-of-vege/)) [AB].
- **Bluegill's own foraging among stems** fell from ≈21 to ≈12 chironomids per 5 min between 17 and 964 stems/m² (§3.4).

---

## 7. Young-of-year (YOY)

### Takeaway
- Larvae see only a few centimetres and catch large *Daphnia* poorly until ~20 mm, when capture success reaches 1.0.
- Perch larvae swim < 3 cm/s until 9.5 mm, then 3–4 BL/s.
- Mortality is fastest in the first days:
  - bluegill Z 0.11–0.39/day in the 4 days after leaving the nest, then < 0.01/day;
  - perch larvae Z ≈ 0.04/day from 8 to 18 mm, falling to 0.01–0.06/day by autumn.
- Schooling and care by species:
  - smallmouth and bullhead fry stay in guarded balls or broods;
  - perch and white perch fry school in open water;
  - pickerel fry are solitary in the weeds;
  - golden shiner and sucker get no care.

### 7.1 Swimming, RD and capture
- **Yellow perch:**
  - Swimming: larvae < 9.5 mm TL sustain < 3.0 cm/s for 1 h; above 9.5 mm, an asymptotic 3–4 BL/s ([Houde 1969](https://doi.org/10.1139/f69-148)) [AB]. Newly hatched larvae swim ~1 cm/s ([Beletsky et al. 2007](https://www.glerl.noaa.gov/pubs/fulltext/2007/20070041.pdf)) [FT, secondary].
  - Acuity improves from 174′ of arc at hatching to 9–12′ in adults. In Oneida Lake they shift from pelagic to bottom at 24–31 mm SL ([Wahl et al. 1993](https://doi.org/10.1139/f93-085)) [AB].
  - Larvae of 9–15 mm: light from 0.1 to 60 µmol m⁻² s⁻¹ did not change foraging success. Raising prey from 25 to 150 per litre helped, but only above 10 mm ([Martin et al. 2012](https://doi.org/10.1111/j.1600-0633.2012.00580.x)) [AB].
  - Prey by size: copepods and nauplii best at 5–12 mm; small cladocerans above 12 mm ([Graeb et al. 2004](https://doi.org/10.1577/T03-050.1)). Zooplankton at 20 mm, benthos at 40–60 mm, fish from 80 mm ([Graeb et al. 2006](https://doi.org/10.1577/T05-063.1)) [AB].
- **Juvenile sunfish:** RD 2.9–27 cm and capture 0–1.0 by size (§1.1 table).
- **Larval bluegill** (12.5 mm) took ~70 % cyclopoids and nauplii. Larval largemouth gut passage is ~2 h at 22–23 °C (Laurence 1971, [via Miner & Stein 1993](https://kb.osu.edu/items/8c7a41ac-f5b9-5873-be13-bd0dfb61bca1)) [FT, secondary].
- **Larval cyprinids** (roach, bleak and blue bream, 8–50 mm SL; surrogates for golden shiner): RD grows exponentially with size ([Wanzenböck & Schiemer 1989](https://doi.org/10.1139/f89-129)) [AB; no values].
- **Golden shiner larvae** attack after only 1–10 % of pauses (§2.1).
- **Smallmouth fry** hold station without tiring up to 15 cm/s. At 20–25 mm they cannot hold above 20 cm/s. Activity falls at 20 °C and greatly at 10 °C (Larimore & Duever 1968, [via USFWS 1983](https://archive.org/details/DTIC_ADA323294)) [FT, secondary].

### 7.2 Mortality and predation on young
- **Yellow perch, Oneida Lake 1961–2003** — [Irwin 2006 thesis](https://ecommons.cornell.edu/entities/publication/f672b11a-2b48-4e91-85b7-4df1ae11cf00) [FT]; [Irwin et al. 2009](https://doi.org/10.1577/T07-256.1) [AB]:
  - egg to 18 mm: Z = 0.074–0.223/day;
  - larvae of 8–18 mm: Z = **0.042 ± 0.005/day** (9 years), growing 0.48 mm/day;
  - 18 mm to 1 August (28–42 mm): Z = 0.020–0.084/day;
  - 1 August to 15 October (48–76 mm, on the bottom): Z = 0.008–0.058/day;
  - daily mortality was unrelated to density;
  - [derived] this is ~4 %, 2–8 % and 1–6 % lost per day.
- **Bluegill, northern Wisconsin** — [Beard 1982](https://digital.library.wisc.edu/1711.dl/TD6RKN5AIUJQO8B) [FT]:
  - fry leave the nest at ~5 mm;
  - Z = **0.109–0.385/day** from dispersal to day 4, then 0.001–0.008/day to autumn;
  - year-class strength is probably set in those first 4 days;
  - fry are limnetic for 30–40 days, then return to the littoral zone at 15–20 mm.
- **Esocids on 15 prey in 1-h trials** ate 0.5 bluegill, 1.9 FHM and 1.0 shad per hour ([Wahl & Stein 1988](https://kb.osu.edu/server/api/core/bitstreams/c6475317-58f9-5b99-886d-a6ac29cacf8a/content)). This is the only per-predator rate on young-sized prey found, and it is an in-bout lab rate.
- **Population-level targets** are already in the audit (B3): young bass ate 58–93 % of littoral bluegill fry, from `forage_fish_early_life.md`.
- **Pickerel fry are very vulnerable to largemouth bass,** and are cannibalistic when crowded ([Crossman & Lewis 1973](https://archive.org/details/annotatedbiblio00cros); [Scott & Crossman 1973](https://archive.org/details/micro_IA40242807_1274)).

### 7.3 Fry schooling and care by species
- **Smallmouth bass** — [Friesen & Ridgway 2000](https://www.harkness.ca/PDFs/Contributions%202000s/Friesen%20Ridgway%202000.pdf) [FT]:
  - the male alone guards for 19–45 days;
  - swim-up at 9.5 mm TL; dispersal from the nest at ~28 mm;
  - brood area at first feeding 0.8 / 2.6 / 5.8 m² for broods of < 500 / 501–1,500 / > 1,500; 14.8 / 36.7 / 64.1 m² at metamorphosis (18.5 mm);
  - broods spread out at dawn and regroup at the nest at dusk;
  - fish at the brood's edge sit 33–57 % farther apart than central fish;
  - < 10 % of first-feeding larvae made no strike in 2 min.
- **Brown bullhead:** "shepherded about for several weeks in a loose sphere by one or both of the parents" until ~51 mm, then the school breaks up ([Scott & Crossman 1973](https://archive.org/details/micro_IA40242807_1274)) [OCR].
- **Pumpkinseed:** the male guards up to 11 days, carrying strays back in his mouth ([Scott & Crossman 1973](https://archive.org/details/micro_IA40242807_1274)).
- **Yellow perch** — [Scott & Crossman 1973](https://archive.org/details/micro_IA40242807_1274); [Post & McQueen 1988](https://doi.org/10.1139/f88-214) [AB]:
  - no care;
  - "large, compact schools of young" in the first summer;
  - groups of 50–200 sorted by size;
  - larger larvae move inshore by day and offshore at dusk, and live only nearshore by ~30 mm.
- **White perch:** no care. "At times very dense schools" that rise toward the surface at night ([Scott & Crossman 1973](https://archive.org/details/micro_IA40242807_1274)).
- **White sucker:** fry leave the gravel after 1–2 weeks and feed near the surface, then become bottom feeders at 16–18 mm ([Scott & Crossman 1973](https://archive.org/details/micro_IA40242807_1274)).
- **Chain pickerel:** larvae cling to plants by an adhesive gland until ~10 mm, then live as "solitary fish, hiding almost motionless in the vegetation" ([Scott & Crossman 1973](https://archive.org/details/micro_IA40242807_1274)).
- **Golden shiner:** eggs scattered over vegetation, no care ([Scott & Crossman 1973](https://archive.org/details/micro_IA40242807_1274)). When fry begin to school was not found.

### Gaps
- YOY mortality for shiner, smallmouth, sucker, white perch and pickerel.
- Field predation rates of predators on young perch.
- Golden shiner fry schooling onset.

---

## 8. Per-species parameter tables

S = surrogate. "—" = not found. Every value is sourced in §§1–7; links point to the main source.

### 8a. Detection and search

| Species | RD to zooplankton (bright → dim) | RD to fish or benthic prey (bright → dim → dark) | Light threshold | Search mode and speed | Active time and diel feeding |
|---|---|---|---|---|---|
| **Golden shiner** | — (S emerald shiner: −50 % at 20 NTU); can filter-feed dense prey without vision ([Reebs 2002](https://gambusia.bsp.ncsu.edu/readings/Reebs%202002.pdf)) | n/a | — | saltatory as larvae; adults roving schools; speed — | plankton within ~1 h after sunset, some at dawn; young by day ([Hall 1979](https://doi.org/10.1139/f79-145)) |
| **Pumpkinseed** | 20 cm for a 1.9-mm *Daphnia* (110 mm SL) ([Confer 1978](https://doi.org/10.2307/3543380)); S bluegill angle 1.7 + 18.9/SL mrad ([Li 1985](https://ecommons.cornell.edu/server/api/core/bitstreams/fd2c486d-4d7b-467f-8a54-2ce61767516d/content)) | n/a | 25 lx (S bluegill 10 lx) | hover–search in weeds, glide in open water; S bluegill 1.26 BL/s in bouts, glides 0.67 s ([Coughlin 2025](https://doi.org/10.1093/plankt/fbae048)); 1.1 m/min net while searching (Mittelbach) | peaks 08:00 and 18:00 (+03:00); night strikes > 75 % of day's ([Keast & Welsh 1968](https://doi.org/10.1139/f68-099); PPSP) |
| **Yellow perch** | 5.0 cm (3,000 lx) → 3.0 cm (≤ 2 lx) → 2.8 cm dark; RD = 4.3·I/(0.1 + I) ([Richmond 2004](https://doi.org/10.1111/j.0022-1112.2004.00444.x)); likely ~30 % short | — (S walleye: 29 cm plateau ≥ 1 lx, 12.5 cm dark) | 2–5 lx | active, group pursuit; S Eurasian perch 0.41 BL/s day, 0.24 night ([Zamora 2002](https://link.springer.com/article/10.1023/A:1021396016424)) | diurnal with dawn and dusk peaks; fry to 21:00; day-active under ice |
| **White sucker** | — | — | — | benthic; — | inshore near sunrise and sunset; more active at night (WSSB) |
| **Brown bullhead** | — | taste gradient search, 100 % found an odour in still water ([Sherman & Moore 2001](https://doi.org/10.1023/A:1012239222761)) | night; switches to day at ~1 lx | — | nocturnal; captive fish fed at dawn and dusk; feeds from 6.5 °C in spring |
| **White perch** | — | — | — | — | low-light feeding peaks; inshore at night (WSSB) |
| **Smallmouth bass** | n/a | peak 84–108 cm, max 159 cm (light) → 40 cm peak, 14 cm mean (dark) ([Michels 2020](https://conservancy.umn.edu/items/f32b5a41-ee5f-4774-9fe0-77ead86687fa)); 65 → 10 cm clear → ~40 NTU (juveniles) | very low (RD still 40 % of max in "dark") | active roving; 0.16 BL/s moving (manual) to 0.8 BL/s (EMG, 24 h) | moving 28 % of 24 h; afternoon peak, little at night |
| **Chain pickerel** | n/a | S pike: 1.5 m clear, 1.0 m moderately brown, 0.5 m heavily brown ([Nilsson-Örtman 2026](https://pmc.ncbi.nlm.nih.gov/articles/PMC13145305/)) | — (S pike: day-active even in winter) | ambush; S pike motionless > 70 % of visual contact; bouts 0.45 BL/s ([Diana 1979](https://ualberta.scholaris.ca/handle/123456789/97485)) | S pike active 16 % (summer) to 21 % (winter) of intervals; 2 % at night; dawn and dusk peaks |

### 8b. Attack, capture, handling and ration

| Species | Strikes/h (lab, in bout) | Capture per strike | Strike distance and duration | Handling time | Daily ration (summer) and items/day |
|---|---|---|---|---|---|
| **Golden shiner** | larvae attack after 1–10 % of pauses | S *Daphnia* 0.76–0.96, copepods 0.07–0.28 (suction model) | — | S ~1 s per zooplankter | — |
| **Pumpkinseed** | — | S juveniles 0–1.0 on *Daphnia* by size; 1.0 above 20 mm ([Walton 1992](https://ecommons.cornell.edu/server/api/core/bitstreams/4d8460bc-b706-4c25-9db2-4df5fda4a052/content)) | — | S H = 0.536·e^(18.488·l/L) s (≈1 s) | S bluegill 1.8–3.9 %BW (field), 4.3 % maximum (lab); a 36-g fish at 2.5 % ≈ 6,400 *Daphnia*-equivalents [derived] |
| **Yellow perch** | S 199 attacks in 35 trials on roach | 0.94 on *Daphnia* (age 0); ~1.0 at 30–35 mm; S 0.20 on single fish, 0.03 into schools ([Turesson 2004](https://lup.lub.lu.se/search/files/2802910/624603.pdf)) | S first move to attack 1.14 s | 110–770 s per FHM including recovery ([Paszkowski & Tonn 1994](https://ualberta.scholaris.ca/items/2934db41-9b42-47af-83a3-2e9b039416af/full)) | 5.5–6.7 %BW in July ([Nakashima & Leggett 1978](https://doi.org/10.1139/f78-249)): 10-g fish ≈ 4,300 *Daphnia*; 200-g fish ≈ 45–130 large prey; piscivorous perch ≈ 1 FHM per 35 h |
| **White sucker** | — | — | — | — | — |
| **Brown bullhead** | — | — | — | — | — |
| **White perch** | — | confusion "unclear" (Jeschke & Tollrian) | — | — | — (evacuation R = 0.028·e^(0.106T)/h) |
| **Smallmouth bass** | S largemouth 31/h (no stems), 6–7/h (half cover) | S largemouth on small bluegill 0.57–0.83; on FHM ≈0.67; smallmouth 10.9 % per reaction on benthic fish | S largemouth 0.30 m (23–27 cm) to 0.35–0.45 m (33–37 cm) ≈ 1.1–1.3 BL | S largemouth: crayfish longest of six prey types | S largemouth up to > 5 %BW late Aug; 1–2 crayfish per stomach above 30 cm ([Austen & Orth 1985](https://seafwa.org/sites/default/files/journal-articles/AUSTEN-97-107.pdf)); 35-cm fish ≈ 1–3 crayfish/day [derived] |
| **Chain pickerel** | S esocids 1.4–5.8 per 1-h trial; S pike 1–2/h (half cover) | S esocids: FHM 0.67, shad 0.78, bluegill **0.14** ([Wahl & Stein 1988](https://kb.osu.edu/server/api/core/bitstreams/c6475317-58f9-5b99-886d-a6ac29cacf8a/content)); S pike 0.36 from ambush vs 0.12 in pursuit | **0.14–0.37 BL**, 0.05–0.11 s ([Rand & Lauder 1981](https://sites.harvard.edu/glauder/files/2022/03/RandLauder1981CJZ.pdf)); S pike 0.15 m (23–27 cm) | S esocids 3.3–6.2 min at optimal size; S tiger muskellunge 5–285 s by size | S pike 1–3 %BW; 40-cm pickerel ≈ 0.7–2 shiners or 1–3 small pumpkinseed a day [derived]; S pike 47 % empty, ~2 prey per full stomach, 48-h evacuation (12 days in winter) |

---

## 9. Implications for the simulation

How each finding maps to a mechanism in (a) the real-time event model (dt 0.1 s, brains at 5 Hz) and (b) the coarse integrated-rate model (dt 60–900 s). Audit items (`docs/W3_REALTIME_AUDIT.md`) are named where they apply. Depths, densities and fish sizes in the 1/10-scale world are real (HOT_BROOK_3D.md:28, 35), so every distance below is in true metres.

### 9.1 Light (prerequisite for both modes; audit D9)
**What the sim does now** [derived]:
- `PLANKTON.VIS_I0` / `VIS_I1` (0.002 → 0.1 of noon surface light) map to roughly 200 → 10,000 lx.
- The daylight curve (`env3.js` `daylight`) is a sine arch that is zero from sunset to sunrise.

**What the data say:**
- Perch thresholds are 2–5 lx; largemouth succeed > 95 % at 3×10⁻³ lx; smallmouth react at ~1 m from about 10⁻³ lx (§1.2, §1.4).
- Real light at sunset is ~400–600 lx, 3.4 lx at the end of civil twilight and 0.008 lx at the end of nautical twilight.

**Mechanism:**
- Give the sky a twilight tail on a log-lux scale, from sun elevation down to −12°.
- Give each species its own saturating light curve, RD(I) = RD_max·I/(I + K_I):
  - K_I ≈ 0.1 lx for perch (Richmond);
  - ≈ 0.03 lx for a percid piscivore (walleye);
  - ≈ 10⁻⁴ lx or lower for bass (largemouth still succeed 62 % of the time at 2×10⁻⁴ lx; the smallmouth Michaelis–Menten half-saturation is ~2×10⁻⁷ lx-equivalent [derived]);
  - ~10 and ~25 lx thresholds for bluegill and pumpkinseed.
- Add a non-visual floor: perch 2.8 cm; smallmouth ~0.4 BL; bullhead by taste.

Without this, real-time dusk feeding (shiners after sunset, perch dusk peaks, bullheads after dark) cannot emerge.

### 9.2 Detection (both modes)

**(a) Real time.** Each decision tick (0.2 s), a fish scans its forward hemisphere out to RD for each prey type:
- **Zooplankton:** RD ≈ k_sp·0.64·L_prey/angle(SL).
  - Use Li et al.'s bluegill angle as the template.
  - k_sp ≈ 1 for bluegill-like fish, ≈ 0.6 for pumpkinseed (20 vs ~36 cm at 110 mm SL), and ≈ 0.25–0.35 for perch (5–6.5 cm measured vs ~19 cm from the bluegill angle at 50 mm SL). The perch value is uncertain: the tank effect may be +30 %.
- **Prey fish:** RD_max ≈ 1.0–1.1 m for bass (≈3 BL) and ≈1.5 m for pickerel in clear water. Prey size has little effect for piscivores (Breck 1993; Howick & O'Brien: ~+20 cm per cm of prey).
- **Turbidity and colour:** reduce RD by solving R²e^(cR) = R₀²e^(c₀R₀) with c ≈ 1–2.5 m⁻¹ for Hot Brook (§5.3). The pike model's "moderately brown" 1.0 m sits in that range.
- **Prey detecting predators** uses the same machinery, at ~2 m for bluegill seeing a bass in bright light. Detection by prey falls faster with light than detection by bass (§6.1). This is what gives bass their twilight advantage.

**(b) Coarse.** RD enters the encounter rate (§9.4) at the step's mean light at the fish's depth. Steps that span dusk (dt ≥ 300 s) should sub-sample light, because RD changes 3–4× within 30 min of sunset.

### 9.3 Search, stalk and strike (real time)
- **Planktivores (shiner, pumpkinseed, perch, white perch): saltatory.**
  - Brain thrust alternates short moves with pauses of ~0.5–1 s, scanning in the pauses (bluegill glides 0.67 s).
  - Pause and move durations are not in the literature found; tune them.
  - Zooplankton is too numerous for one event per item: at the §4 rations a 10-g perch makes ~4,300 captures a day. Treat it as a continuous intake within the tick, at the type II rate below. Keep discrete events for fish, crayfish, large nymphs and snails.
- **Bass: active search.**
  - Detect at ≤ RD, follow, then strike from ~1–1.3 BL.
  - Pursuit is short (1–3 s).
  - In dense stems, switch to ambush (Savino & Stein 1989).
- **Pickerel: ambush.**
  - Hold still in cover (> 70 % of contact time motionless).
  - Approach slowly; stalks can last minutes.
  - **Strike only within 0.14–0.37 BL** (≈ 6–15 cm for a 40-cm fish).
- **`strikeR` should shrink to these body-length distances:** ≈ 0.4 BL for pickerel, ≈ 1.2 BL for bass, perch unknown (~0.5–1 BL as a prior). Detection stays at RD.
  - The gap between RD and strike distance becomes a real approach phase, during which the prey can see the predator and leave.
  - That is the mechanism behind the 0.4–1.2-m spacing prey keep (§6.1).
- **The strike resolves inside one 0.1-s step** (pickerel 0.05–0.11 s; prey escape latency 0.08–0.26 s). So:
  - it is a single Bernoulli outcome at strike onset;
  - the prey's state then (alert or not, schooled or not, in cover or not, its body form) sets p;
  - the prey cannot dodge a strike it did not anticipate.
- **Outcome probability p by predator × prey type** (base values, before the factors below):

  | Predator | Prey | p |
  |---|---|---|
  | Pickerel | shiner-like soft-rayed prey | 0.65–0.8 |
  | Pickerel | pumpkinseed / perch-like spiny, deep-bodied prey | 0.10–0.15 |
  | Bass | small sunfish (≤ ~15 % of bass length) | 0.6–0.8 |
  | Bass | FHM-like prey | ≈0.65 |
  | Perch | single fish | 0.20 |
  | Perch | *Daphnia* | ~0.95 |
  | Planktivores | *Daphnia* | 0.8–0.95 |
  | Planktivores | cyclopoids | ~0.25–0.5 |
  | Planktivores | calanoids | ~0.07–0.4 |
  | Juvenile sunfish | *Daphnia*, by size | §1.1 table |

  - Ambush vs pursuit: × ~3 for an ambush strike relative to a chase (pike 0.36 vs 0.12).
  - In the sim's current terms `capture × vuln`: the pickerel–sunfish product (0.6 × 0.35 = 0.21) is about 1.5× high, and bass–sunfish (0.4 × 0.35 = 0.14) is about 5× low.
- **Confusion is species-specific:**
  - perch × ~0.15 when striking into a school (0.03/0.20);
  - bass: capture in 100 % → 17 % → 11 % of trials with 1 → 8 → 15 prey, so roughly × n^(−0.8) per encounter [derived];
  - pickerel and pike: no confusion. They pick off edge fish and singles.
  - Dilution needs no factor in event mode: one strike takes one fish.
  - Today's `SCHOOL_EXP` 0.5 for every predator should become these predator-specific per-strike factors (audit B1, step 5).
- **Vegetation multiplies encounter and attack initiation, not p.**
  - Fit to Savino & Stein: attacks/h fall to ≈0.85×, 0.1× and ~0 of open water at 50, 250 and 1,000 rope stems/m². In natural stems by cover, that is ≈ 26, 130 and 600/m².
  - Bass switch to ambush in dense stems; pickerel keep using stands below ~600 stems/m².
  - In the lake, 164 natural stems/m² cut bass predation 10×.
- **After a miss:** re-strike within 1–5 s while the prey is in range. Perch make 4–7 strikes per capture in a ~2-min cycle; esocids on sunfish 5–7.5.
- **After a kill:** busy for the handling time, during which the predator cannot strike:
  - ~1 s per zooplankter: H = 0.536·e^(18.488·l/L);
  - 0.5–6 min for a fish, rising with prey depth relative to the predator (the Gillen and Paszkowski tables).
  - Then the gut gates hunting (audit B14: replaces the 29-min `MISS_CD`).
  - Hunting resumes when gut room ≥ the next prey's mass.
  - Pike and pickerel then rest: real pike are inactive for most of the time between meals, and > 24 h after big ones.
- **Prey response:**
  - flee when a detected predator closes to ~15–25 cm (esocid; prey schools flee earlier);
  - keep 0.4–1.2 m spacing, wider from bass than from pike for dispersed prey;
  - school more and use cover more when a predator is present (bluegill 100 % in cover with bass);
  - fear decays over hours, not seconds: darter activity stayed low ≥ 24 h after 30 min near a bass. `F3.FEAR_DECAY` 0.5/s is too fast for that lasting component, but fine for the moment-to-moment startle.

### 9.4 The coarse integrated-rate model
**Encounter per prey type i** (audit B1, B2):
- Cruising forager: λ_i = ½·π·RD_i²·v_search·N_i·f_active.
- Ambusher: λ_i = π·R_s²·u_i·N_i·f_active, where R_s is the radius within which it will stalk.
- Saltatory foragers: use net search speed (Mittelbach's 1.1 m/min for juvenile bluegill) with the hemisphere volume scanned per pause; otherwise v·RD² overstates the volume.

**f_active, the share of the step spent foraging** — species- and time-of-day-specific from §2, gated by gut room:
- pickerel ~0.16–0.21 overall, ~0.02 at night;
- smallmouth ~0.28 moving;
- perch by day, plus dawn and dusk peaks;
- bullhead and sucker at night or dusk;
- shiner in the hour after sunset.

**Intake:** I = Σ λ_i·p_i·m_i / (1 + Σ λ_i·p_i·h_i) per foraging second.
- Capped by gut room.
- Gut emptied by exponential evacuation R(T):
  - white perch 0.028·e^(0.106T)/h;
  - perch fish meals ~12 h at 22 °C and 72 h at 8 °C;
  - crayfish ~2× slower;
  - pike 48 h in summer, 12 days in winter.
- The daily total then cannot exceed FB4 Cmax; this matches audit B9's "handling-limited instantaneous cap".

**Discrete prey (fish, crayfish):**
- Kills ~ Poisson.
- For schooling prey, use the two-stage draw of §5.8 (schools met, then kills per school), which gives the clustered captures that field data show.
- Each kill fills the gut and blocks hunting until room returns.

**Modifiers of λ (not p):**
- vegetation (§9.3 factors on encounter);
- light (RD);
- prey cover choice (dispersed bluegill safe at ~40 % cover).

**Prey's per-capita risk:** Σ over predators of λ·p, divided by school size for dilution, times the predator-specific confusion factor.

**Worked check, planktivore** [derived]. A 10-g yellow perch: RD 5–6.5 cm to 1.5-mm *Daphnia*, search 4 cm/s (0.4 BL/s), p 0.94, h 1 s.
- Swept volume: ½·π·0.06²·0.04 ≈ 0.23 L/s.
- At **10 *Daphnia*/L:** λ ≈ 2.3/s, so intake ≈ 0.68 *Daphnia*/s. The 4,300-*Daphnia* July ration (6 %BW) takes ~1.8 h. Feeding is handling- and gut-limited, so real perch can feed in dawn and dusk bouts.
- At **1/L:** intake ≈ 0.175/s, so ~6.8 h. Encounter starts to limit.
- Mesotrophic summer densities are ~3–30 crustaceans/L (ZOO:124). The ration is reachable in daylight, and the zooplankton density at which fish stop being satiated is ~1–3/L. That is a calibration target for `K_ZOO`.

**Worked check, piscivore** [derived]. A 40-cm pickerel ambushing golden shiners swimming at ~10 cm/s at a littoral density of 0.1 per m³, stalk radius 0.5 m:
- λ = π·0.25·0.1·0.1 ≈ 0.008/s ≈ 28 encounters/h.
- At p ≈ 0.7, the 1–2 shiners a day it needs come within minutes of hunting.
- So pickerel intake is gut- and evacuation-limited, and the time budget (16 % active) follows from satiation, as Breck (1993) and Diana (1979) imply.
- Check this emerges in the sim: empty-stomach share ~18–50 %, and meals of 1–2 prey separated by 1–2 days in summer.

**Calibration targets for both modes:**
- rations (%BW/day, §4);
- empty-stomach shares: pike 29–62 %; pickerel 18 % (Nova Scotia) to 62 % (Florida); smallmouth 0–78 %;
- prey per non-empty stomach: pike ~2; smallmouth 1–2 crayfish;
- YOY Z per day (§7.2).

The audit's equivalence test applies: kills per predator per day in fine runs ≈ coarse runs, on ≥ 3 seeds.

### 9.5 Young-of-year (audit B3, B4)
- **(a) Real time.** A predator at a school of young strikes at an in-bout rate of one strike per few seconds while engaged, with p from §9.3.
  - For larvae, p falls with the young's size and the size of their school.
  - Smallmouth and bullhead broods are guarded: the brood stays within GUARD_R, spreads at dawn and regroups at dusk.
  - Perch and white perch fry school offshore and come inshore by size: perch at 24–31 mm, bluegill at 15–25 mm.
  - Pickerel fry are single, hidden in weeds.
  - Larval perch below 9.5 mm move < 3 cm/s, so `YOY_VMAX` 0.25 m/s is far too fast for them. Above 9.5 mm they reach 3–4 BL/s (≈ 4–12 cm/s for 1.2–3-cm fry).
- **(b) Coarse.** The school's daily mortality from predation plus starvation should reproduce:
  - perch larvae Z ≈ 0.04/day (8–18 mm), 0.02–0.08/day to August, 0.01–0.06/day to October;
  - bluegill Z ≈ 0.1–0.4/day in the 4 days after leaving the nest, then < 0.01/day.
  - Larval feeding: RD 3–14 cm (juvenile sunfish, by size) and capture 0–1.0 by size (§1.1) set encounter-limited growth below ~20 mm. Prey density mattered only above 10 mm (perch).

### 9.6 What stays a calibration knob
- **Pause and move durations** for the saltatory foragers.
- **Field attack rates per hour:** lab rates are at ~1–10 prey/m³, far above lake densities. Use the encounter formula with real densities instead.
- **RD for shiner, sucker, bullhead and white perch.** Use the surrogates above.
- **The crayfish day/night split** (audit B12).
- **Evacuation for golden shiner, sucker and bullhead:** use the perch or white perch R(T) as a prior.

---

## 10. Conflicts and corrections found
1. **Esocid capture per strike on bluegill is 0.14 (0.10 for pike alone), not ≈0.44** (Wahl & Stein 1988 full text; Moody 1983's 0.13). PIKE Q4's inference ("half to two-thirds" of the soft-rayed value) should read "about one-fifth".
2. **Largemouth bass on small bluegill catch 0.57–0.83 per attack.** Prey size relative to the predator, and predator mode, matter as much as body form. The sim's bass–sunfish product (0.14) is low.
3. **Savino & Stein 1982 at 1,000 stems/m²:** Smith (1995) cites ~1 bluegill per day; the figure reading is ~6 per 24 h. Unresolved.
4. **Yellow perch below 10 lx:** Wellington et al. (2010) cite Granqvist & Mattila (2004) for an RD drop, but Granqvist & Mattila's abstract reports none (Eurasian perch on mysids).
5. **Smallmouth speed:** 0.16 BL/s while moving (manual tracking) vs 0.8 BL/s round the clock (EMG). Coarse tracking undercounts.
6. **Photon-to-lux conversion** in the Michels studies: a reported 3.16×10¹³ photons m⁻² s⁻¹ ≈ 1 lx vs my 7.5×10¹⁵ for 510-nm light. Unresolved; I used mine.
7. **Mittelbach's handling exponent** reads "el 8.488" in the OCR. 18.488 is consistent with the ~1-s handling times reported elsewhere.
8. **The Vinyard & O'Brien RD formula** found in a search summary is garbled: it gives negative slopes at 215 lx. Do not use it without the original paper.
