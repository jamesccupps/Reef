# Larval and early-juvenile mortality, stage survival and density in LAKES (yellow perch, white perch, alewife, sunfish, smallmouth bass)

Compiled 2026-10-22 for the Hot Brook lakes (Upper and Lower Hot Brook Lake, eastern Maine; 2.5–5.5 m deep, unstratified, clear softwater, oligo-mesotrophic; white perch, yellow perch, pumpkinseed, redbreast, smallmouth bass, chain pickerel, white sucker, brown bullhead, fallfish, banded killifish, blacknose dace; sea-run alewife spawning in the lakes).

**The sim problem this answers.**
- In June–July the model's young-of-year are too crowded.
- Young white perch run at ~2–6× the "field" late-summer density (taken as ~2,900–7,200/ha). Together with young alewife they crop the zooplankton until the young grow at ~⅓ of field rates.
- The model's larval mortality (natural + predation + starvation) is only ~0.04–0.05/d for 5–10-mm larvae.
- The only white perch field value at hand was the Hudson River estuary cohort median of ~0.27/d. This note collects **lake** values.

---

## Answers

**1. Daily instantaneous mortality (Z, /d) in lakes, first feeding → ~20–30 mm**

*Yellow perch*
- **Best value: ~0.05–0.15/d at 8–25 mm. Field range 0.017–0.52.**
- Large and uncrowded lakes sit at the low end:
  - Oneida pelagic fry 0.030–0.056 (Noble 1968) [review: Henderson 1977];
  - Oneida 0.042 [repo; Irwin et al. 2009].
- Crowded, food-poor or small-lake larvae sit at the high end:
  - West Blue Lake, Manitoba, 10–25 mm: **0.017** in an open basin at 0.44 fry/m² vs **0.140** in a crowded bay at 24 fry/m² (Henderson 1977, MSc thesis) [full text];
  - Pelican Lake, NE: 0.15–0.52, falling with zooplankton and temperature (Kaemingk et al. 2014, *TAFS* 143:845) [abstract].
- Lake Ontario embayment ponds: 0.22–0.28/d without alewife, **1.58/d** when adult alewife overlapped the larvae (Mason & Brandt 1996, *CJFAS* 53:1609) [abstract].
- Eurasian perch, two Scottish lochs: **0.063** (0.020–0.089); juveniles 0.021 (Treasurer 1989, *J. Fish Biol.* 34:913) [abstract].
- Oneida, 18 mm → 15 October: **≈0.034/d** [inf from full-text table].

*White perch*
- **No lake larval Z exists in any open source.** VanDeValk et al. 2016 (*TAFS* 145:416, Oneida) is paywalled, and its abstract has no rates.
- **Best lake estimate [inf]: ~0.1–0.2/d from first feeding to ~10 mm, then ~0.03–0.06/d from 10–20 mm to autumn.**
- The brackets:
  - Hudson cohorts 0.044–0.785 (median ~0.27) (Limburg et al. 1999, *Fish. Bull.* 97:80) [full text, repo];
  - Hudson 1976, from the post-yolk-sac peak to December: 3.6 %/d (Texas Instruments 1979) [full text]. From the peak to the mid-August and September juvenile estimates it is ≈0.03–0.06/d [inf];
  - Patuxent 0.03–0.08 [review, repo];
  - larval white bass in a Kansas reservoir, 0.02–0.15 (Quist et al. 2002, *NAJFM* 22:637) [abstract †].
- **The sim's 0.04–0.05/d at 5–10 mm is at the bottom of every estimate for that stage.** It equals only whole-season averages.

*Alewife in lakes*
- **Best value: 0.06–0.12/d.**
  - Lake Champlain young-of-year, 15–100 d after hatch: **0.12** (2007) and **0.10** (2008) (Simonin 2010, MS thesis) [full text]. The published version gives 5.5 %/d over the first 45 d, Z ≈ 0.057 (Simonin et al. 2016, *TAFS* 145:649) [abstract].
  - Bride Lake, CT: egg → emigrant survival 0.0013 % implies a mean of ≈0.11/d over ~100 d [inf from review].
  - Predator-free enclosures: 0–0.006/d even at 5 fish/m² (Post 2006, CT IWR report) [full text, figure †]. So the field Z is predation, not hunger.

*Bluegill and pumpkinseed*
- **0.11–0.39/d for the first 4 days off the nest, then 0.001–0.008/d** in predator-free Wisconsin lakes (Beard 1982) [full text, repo].
- With piscivores, nest fry → September survival is 0.0007–0.5 % (Z ≈ 0.06–0.10) (Carbine 1948) [full text, repo].
- No new lake values were found.

*Smallmouth bass*
- **In the nest: 0.08–0.11/d** (daily survival 0.90 for embryos, 0.92 for larvae) (Steinhart 2004) [full text †].
- **Egg → postlarva: 26–33 % (Z ≈ 0.05–0.065)** (Clady 1975, Katherine L., MI) [review: Forbes 1981, full text].
- **Swim-up → dispersal: ~0.15/d** (Knotek & Orth 1998 [abstract †]; ≈0.2 from Opeongo brood counts [inf †]).
- **Dispersal → fall: 0.02–0.04/d** [inf].
- Nest success in lakes is 44–96 %, and 67–88 % at South Branch Lake, Maine [review †].

*What drove the bad years*
- **Fish predation dominates lake larval Z:**
  - adult perch cannibalism (Treasurer);
  - adult alewife on perch larvae (Mason & Brandt; Kircheis 2002, Maine);
  - white perch on percid larvae in clear water (Oneida report; Ludsin et al. 2011);
  - young largemouth eating 58–93 % of bluegill fry.
- **Food-linked, density-dependent loss:** West Blue Lake's crowded bay; Pelican Lake.
- **Cold snaps at yolk-sac and first feeding:**
  - Hudson 1976: a drop to 12 °C killed the first spawn;
  - Patuxent 2004: a 10 °C storm;
  - Oneida perch: temperature and wind explain 87 % of egg → 8 mm survival;
  - bass nests fail below 10–15 °C.
- **Cyclopoids** only matter for thin larvae under 8 mm (alewife 3–8 mm; perch "immune") [abstract, repo].
- **No field evidence of *Chaoborus* or *Leptodora* eating fish larvae** (searches 2026-10-22); they act as competitors.

**2. Stage survival (fractions)**

*Yellow perch, Oneida*

| Stage | Survival | Source |
|---|---|---|
| Egg viability | > 0.95 | [review, repo] |
| Egg → 8 mm | 0.016–0.184, with 80+ % "base" loss | Clady 1976 [abstract] |
| Egg + yolk sac | ≈ 0.077 | [inf, repo] |
| Egg → 18 mm | ≈ 0.06 | [inf] |
| 18 mm → 15 Oct | ≈ 0.014 | [inf from full text] |
| **Egg → October** | **≈ 0.0009** | [inf] |

*Yellow perch, West Blue Lake, ~10 → 25 mm (21 d)*

| Area | Survival | Source |
|---|---|---|
| Open basin | 0.70 | [inf from full text] |
| Crowded bay | 0.05 | [inf from full text] |

*Eurasian perch:* egg 0.95 [abstract, repo].

*White perch:* no field value at any stage before ~20 mm.
- Lab hatch is 0.815 at its best.
- Hudson indices: post-yolk-sac peak → September juveniles ≈ 0.10, and → mid-August ≈ 0.045 [inf from full text].
- **A lake chain [inf, low confidence]:**

| Stage | Survival |
|---|---|
| Egg → hatch | 0.3–0.8 |
| Hatch → first feeding | 0.2–0.6 |
| First feeding → 20 mm | 0.02–0.15 |
| 20 mm → end of summer | 0.1–0.4 |
| **Egg → end of summer** | **~10⁻⁵–10⁻³** |

**3. Densities in lakes**

*Yellow perch*
- Oneida, larvae at 18 mm: a mean of **6.7/m²** (67,000/ha; 9.9/m² in 2022), falling to **0.095/m²** on 15 October [full text].
- West Blue Lake: **24 fry/m²** at the start of the pelagic phase in a crowded bay vs 0.44/m² in the open basin [full text].
- MN lakes: 0–4.8/m³ at 15–25 mm [full text, repo].
- An exceptional 42/m³ (Pigeon L.) [abstract, repo].

*White perch*
- **No lake larval density was found.**
- Late-summer young:

| Place | Young per ha | Source |
|---|---|---|
| Oneida | median ≈ 140 (mean ≈ 720, max ≈ 6,700), if the table's unstated unit is per acre | [full text + inf] |
| Western Lake Erie | 1,573 (2019); ten-year mean 2,961 | Forage Task Group 2020 [full text] |
| Hudson, September 1976 | ≈ 7,200 | [inf from full text] |

- **The project's "field" band of 2,900–7,200/ha is eutrophic Lake Erie plus the Hudson estuary.** A clear softwater Maine lake should sit nearer Oneida's typical ~100–700/ha [inf]. So the sim's excess may be **more than** 2–6×.

*Alewife*
- Pelagic larvae are sparse:
  - 0.02–0.07/m³ (Claytor L., VA) [full text †];
  - 0–0.43/m³ (Lake Michigan) [abstract].
- Sea-run juveniles in August are dense inshore:
  - **0.10–0.75/m²** (CT lakes) [full text];
  - ≈ 0.7–1.1/m² [inf from figure †];
  - i.e. **~1,000–11,000/ha**.

*Sunfish*
- Pumpkinseed larvae peak at **~23/m³ in the littoral** and ~1–3/m³ elsewhere (Ashby L., ON) [full text, figure †].
- Bluegill under 13 mm reach 12.5–15.8/m³ (Nebraska) [abstract †].
- Littoral juvenile sunfish run 0.04–0.52/m² (Michigan lakes) [full text †].

*Smallmouth bass*
- 0.3–4.6 nests/ha and ~2,000 swim-up fry per successful nest.
- 31–327 fall fingerlings/ha (Nebish L.) [full text †].

*Bookkeeping*
- Oneida yellow perch: **111 eggs/m² → 6.7/m² at 18 mm → 0.095/m² in October** [inf].
- Bride Lake alewife: ~70,000 eggs/m² → ~0.9 emigrants/m² [inf from review].

**4. Larval alewife in lakes**

*Density, growth and mortality*
- Densities: as in Q3.
- Larval growth is 0.46–1.11 mm/d (Lake Michigan; 0.6–0.7 Champlain) [abstract; review].
- Juveniles in a sea-run CT lake grow 0.22–0.31 mm/d in length (TL slope) [full text †].
- Growth falls steeply with density: it halves by ~0.6 fish/m² and falls ~10× by ~2.5/m² in Linsley Pond enclosures [full text, figure †].
- Z: as in Q1.

*Zooplankton*
- Young sea-run alewife are gape-limited until **mid-June**. From then on they remove large zooplankton (Post et al. 2008, *Ecology* 89:2019) [full text]:
  - large cladocerans fall "precipitously" from late May to mid-June;
  - **none** are seen from the end of June to the end of October;
  - *Daphnia* are never seen after the end of July;
  - total crustacean biomass drops ~44 → ~6.5 µg/L (spring → summer) [inf from figure †];
  - mean cladoceran length drops 0.45 → 0.22 mm [figure †].
- Maine shows the same: smaller crustaceans and fewer cladocerans in 3 of 4 alewife lakes (Demi et al. 2015) [review]; Lake George, Maine (Kircheis et al. 2002) [full text †].

*Effects on other young*
- Adult alewife eat perch larvae: Z 1.58 [abstract]; perch made up 35 % of alewife food items in May at Lake George, Maine [full text †].
- Young largemouth bass grow slower and switch to fish later in alewife lakes (Boel et al. 2018) [abstract †].
- Damariscotta's juvenile alewife numbers are set by competition for zooplankton (Walton 1987) [review †].
- **Timing [inf]:** yellow perch larvae (May) feed before the collapse; white perch, bass and sunfish larvae (June–July) meet it.

**5. Field hatch of white perch eggs**
- **No in-situ hatch or egg → larva survival has ever been measured.** The only number is the lab maximum of **81.5 %** at 14 °C (Morgan & Rasin 1982) [review].
- Field killers:
  - **cold** [review: Fischer et al. 1989]:
    - a 2–3 °C drop kills some eggs; 4–5 °C is lethal; below 10 °C causes significant mortality (AuClair 1960, *Maine*; Hardy 1978);
    - the Hudson 1976 drop to 12 °C killed most of the first spawn at the yolk-sac stage (TI 1979) [full text].
  - **silt:** a 1.1-mm layer kills 100 % of eggs; 0.45 mm does not [review].
  - **egg predation** by adult white perch [abstract snippet †].
  - **acid pulses** to pH ~6.0 for under 48 h could severely cut larval survival (Klauda 1989) [review]. This is relevant to softwater.
- **Best guess [inf]: 0.3–0.8 egg → hatch in a lake.** That is lower than the lab's 0.8 in cold, windy springs. Analogues: walleye eggs on lake bottoms 2.4–35.7 % to the eyed stage; Eurasian perch ribbons 95 % [abstract, repo].

---

## 0. Conventions, method and companion notes

**Tags** (on every number):
- **[full text]**: read in the paper, thesis or report body or tables;
- **[abstract]**: abstract or record page only;
- **[review]**: as quoted by a secondary source (both named);
- **[inf]**: my arithmetic or inference, shown.
- **†** marks a value read in this session by one of three parallel helper passes and not re-read by me. Values without † I read myself.
- **"repo"** means the value is already held, with that tag, in a companion note named in the table below. It is cited, not re-researched.
- Figure-read values are approximate (±10–20 %).

**Units.**
- Z = ln(N₀/N_t)/t per day; survival S = e^(−Zt).
- 1 /m² = 10,000 /ha; 1 acre = 0.4047 ha.
- Per m³ becomes per m² of lake by multiplying by the occupied depth: ~2–3 m in Hot Brook.
- Field "peaks" are standing stocks. The sim's "per m² at swim-up" is cumulative production.

**Method.**
- I researched yellow perch myself:
  - Henderson 1977 thesis (full text);
  - the Oneida 2022 report (full text);
  - Crossref abstracts for Irwin, Clady, Kaemingk, Treasurer, VanDeValk, Simonin and Eppehimer.
- Three parallel helper passes covered:
  - white perch;
  - alewife;
  - centrarchids and bass.
- I re-checked the load-bearing helper values against the downloaded texts:
  - Simonin 2010 (Z table);
  - Post et al. 2008 (zooplankton text and Table 1);
  - CT DEEP 2018 (juvenile densities);
  - Lake Erie Forage Task Group 2020;
  - TI 1979 (3.6 %/d, the 12 °C kill, the critical period, 209 million juveniles);
  - the Oneida 2022 tables;
  - Forbes 1981 (Clady 1975 stages).
- Downloads are in the session scratchpad, not the repo.

**Companion notes (not repeated):**

| Code | Note | Holds |
|---|---|---|
| LM | `larval_mortality.md` | Walleye Z table (Johnston 1995), Hudson cohort Z, Beard, Carbine, cyclopoids, *Hydra*, Pepin, Houde; peak-density table |
| ESL | `egg_survival_and_larval_production.md` | Egg survival, Oneida 111 eggs/m², Kinord, white perch fecundity, adult stocks |
| FPL | `fish_predation_on_larvae.md` | Clearance and encounter rules for fish eating larvae |
| LSV | `larval_starvation_and_variability.md` | Starvation timing, within-cohort CVs, Margulies 1989 |
| YWG | `young_white_perch_growth_and_food.md` | Young white perch growth and diet; prey thresholds |
| YFS | `young_first_summer.md` | NLA prey densities; the stall diagnosis |
| FZC / FFE | `fish_zooplankton_coupling.md` / `forage_fish_early_life.md` | Mills & Forney *Daphnia* limits; Oneida stages; bluegill early life |
| SRA | `../Hot Brook populations and water/sea_run_alewife.md` | Run timing, Bride Lake bookkeeping, Love Lake (Maine) emigrants, Devine et al., Edsall, Heinrich |
| FWM | `first_winter_mortality.md` | Johnson & Evans white perch winter thresholds |

---

## 1. Daily mortality in lakes, by species and stage

### 1.1 Yellow perch

| Lake (type) | Stage | Z (/d) | Method | Source | Tag |
|---|---|---|---|---|---|
| **West Blue Lake, MB** (160 ha; mean ~11 m, max ~31 m per the scanned text) — **bay** | Pelagic fry, ~9–10 → 25–30 mm, July 1975 | **0.140** | Miller high-speed trawl catch decline; ln N = −0.140·day + 3.19 | Henderson 1977, MSc thesis, U. Manitoba (hdl 1993/6294), Table 10 | [full text] |
| West Blue Lake — **basin 2** | Same | **0.017** | Same; ln N = −0.017·day − 0.80 | Same | [full text] |
| Oneida L., NY (20,700 ha, eutrophic) | Pelagic fry, 1965 / 1966 / 1967 | **0.030 / 0.056 / 0.051** | Larval tows (gear avoidance studied) | Noble 1968, PhD thesis, Cornell | [review: Henderson 1977] |
| Oneida | Interval 1 (see note) | 0.042 ± 0.005, density-independent | Long-term surveys | Irwin et al. 2009, *TAFS* 138:99, doi:10.1577/T07-256.1 | [repo, full text †]; interval [abstract] |
| Oneida | 18 mm (mean date ~11 June) → 15 Oct | **≈0.034** | 67,000/ha → 950/ha over ~126 d | VanDeValk et al. 2023 (2022 report), Table A13 + text | [inf from full text] |
| Pelican L., NE (332 ha, shallow) | 5–14 and 15–24 d old | **0.15–0.52**, falling with total zooplankton and temperature | Otolith cohorts, 2004–12 | Kaemingk, Graeb & Willis 2014, *TAFS* 143:845, doi:10.1080/00028487.2014.886622 | [abstract] |
| L. Ontario embayment ponds | Larvae | **0.22–0.28** (3 yr, no alewife); **1.58** with alewife (1985) | Cohort decline + predation model | Mason & Brandt 1996, *CJFAS* 53:1609, doi:10.1139/f96-076 | [abstract, repo] |
| Lochs Kinord & Davan (Scotland; Eurasian perch) | Larvae; 0+ juveniles | **0.063 (0.020–0.089)**; 0.021 | High-speed sampler, exponential decline | Treasurer 1989, *J. Fish Biol.* 34:913 | [abstract] |
| Lake Erie, western basin | Larvae | **No numeric Z found.** In an IBM, survival was higher in the turbid Maumee plume, more sensitive to predation than to starvation, and the named predator was white perch | Otolith/genetics + IBM | Ludsin et al. 2011, GLFC completion report | [abstract] |
| Lake Mendota, WI | Pelagic age-0 | **No Z found.** Perch dominated the pelagic age-0 fish in June, aggregated with CV 48–154 % among sites | Tows | Post, Rudstam & Schael 1995, *TAFS* 124:84 | [repo, abstract]; Z not in any open source |

**Notes.**
- **West Blue Lake is the cleanest small-lake contrast.** One lake, one year, the same gear, and two areas differing ~50× in fry density gave an **8× difference in Z**.
  - Bay fry fell 10.4 → 6.9 → 2.2 → 1.3 /m² on days 6, 9, 17 and 21 of the pelagic phase [full text].
  - Henderson tied the bay's high Z to low *Daphnia pulicaria* per fry and low energy intake, i.e. density-dependent food limitation.
  - He judged predation on pelagic fry "probably very low": walleye stayed on the shoreline, walleye fry were rare, and there are no zooplankton able to attack fry.
  - Fry ate ≤ 0.09 % of *Daphnia* numbers per day in the basin and up to 5.25 % in the bay [full text].
  - He treats his abundances as minima and his Z as maxima, because of trawl avoidance [full text].
  - Fry hatched in the littoral in early June, went pelagic at 9–10 mm (7–14 d), and returned to the littoral in mid-July at ~25–30 mm [full text].
- **Irwin et al. 2009, interval check.** The abstract defines interval 1 as **egg deposition → 18 mm**, interval 2 as 18 mm → 1 August and interval 3 as 1 August → 15 October [abstract, read via Crossref].
  - The repo records the 0.042 as "8 → 18 mm" (FZC §, sub-researcher).
  - Before using 0.042 as a larval-only rate, check which interval it belongs to. If it covers egg → 18 mm (~45 d), it is a low-mortality average including eggs [inf].
  - The abstract also says:
    - limnetic-stage (18 mm → 1 Aug) mortality **increased** over 40 years;
    - demersal-stage mortality decreased;
    - mortality is "no longer depensatory";
    - larger mean length did **not** lower daily mortality in two intervals.
- **Oneida's predators.** The 2022 report says young percid densities are limited partly by competition with white perch and by "direct predation on percid fry by white perch". The decline in adult white perch "likely contributed" to better larval percid survival (Jackson et al. 2020) [full text, VanDeValk et al. 2023].
- **Growth context.** Lake Itasca fry grew 0.50 mm/d for 40 d, then 0.43 mm/d; first food at 9–10 mm; pelagic until ~25 mm (Swindoll 1981, MS thesis, U. Tennessee) [full text: abstract and text, no mortality or density numbers].
- **Range summary [inf].** Lake yellow perch at 8–25 mm die at 0.02–0.06/d where larvae are sparse and food is ample (Oneida, West Blue basin, Kinord). They die at 0.14–0.5/d where larvae are crowded or food is short (West Blue bay, Pelican). Where an abundant planktivore overlaps them, Z exceeds 1/d (Mason & Brandt).

### 1.2 White perch

**No lake or reservoir larval Z was found in any open source.**
- VanDeValk et al. 2016 (*TAFS* 145:416, doi:10.1080/00028487.2015.1131743) analysed 44 years of Oneida larval (Miller sampler), age-0 (trawl) and recruit (gill net) densities [abstract]:
  - dense larval year-classes stayed dense;
  - they grew slower and died faster, "but mortality did not compensate for the higher initial densities";
  - recruitment was best explained by larval density plus predator biomass.
- The rates are in the paywalled paper.

| System | Stage | Z (/d) | Method | Source | Tag |
|---|---|---|---|---|---|
| Hudson R. tidal fresh water, 1994 | 6-d hatch cohorts, May → June | 0.785, 0.509, 0.328, 0.241, 0.304, 0.187, 0.044, 0.137; falling as water warmed 12 → 21 °C | Cohort catch curves | Limburg et al. 1999, *Fish. Bull.* 97:80 | [full text, repo] |
| Hudson, 1976 | Post-yolk-sac peak (2 billion, late June) → 3.86 million (1 Dec) | **3.6 %/d** average (TI's figure; ln-based ≈ 0.04) | Weekly standing crops | Texas Instruments 1979, *1976 Year-Class Report* (NRC ADAMS ML100250085) | [full text]; 0.04 [inf] |
| Hudson, 1976 | Post-yolk-sac peak (2.08 billion, 20–26 June) → 93 million juveniles (mid-Aug, gear-corrected) and → 209 million (Sept mark–recapture; 95 % CI 158–285 million) | ≈ **0.06** (to mid-Aug, ~52 d); ≈ **0.03** (to Sept, ~80 d) | Standing crops; mark–recapture | Same | [full text]; Z [inf] |
| Hudson, 1976 | Juvenile → end of yearling year | 89 %/yr (0.6 %/d) | Catch curve | TI 1977f in TI 1979 | [review] |
| Patuxent R., MD | Larvae, first 45 d | 0.03–0.08 | Otolith cohorts | Kerr 2008 | [review, repo] |
| Glen Elder Reservoir, KS — **white bass**, the nearest reservoir *Morone* | 3–35-d larvae | 0.02–0.15, no early-vs-late cohort difference (mean ≈ 0.09 per a search snippet) | Cohort catch curves on otolith-aged larvae; growth ≈ 0.32 mm/d | Quist et al. 2002, *NAJFM* 22:637 | [abstract †]; mean [snippet †] |

**What drives white perch's bad years:**
- **Cold at the yolk-sac → first-feeding transition (~4 mm).**
  - Hudson 1976: few larvae > 5 mm appeared from 2–29 May despite large egg catches. TI judged "the temperature drop to 12 °C" lethal to the developing larvae; the survivors came from the second spawn [full text].
  - TI placed a "critical period" at this transition, possibly lack of food at low temperature [full text].
  - Patuxent 2004: a storm cooled the water to ~10 °C, with high larval mortality and a record-low juvenile index (Lusk & Secor, Maryland Sea Grant project page) [abstract-level page †].
- **Fish predation.** Bluegill readily took small white perch larvae in the lab, and a 100-fold increase in *Daphnia* cut larval mortality by 75–90 % (Margulies 1990, *EBF* 27:187) [snippet †; Springer login not followed]. So food and predation interact.
- **Cyclopoids.** *Cyclops bicuspidatus thomasi* eats white perch larvae (Smith & Kernehan 1981, *Estuaries* 4:81) [review †]. No rates were obtained.

**Inference for a lake [inf].**
- White perch hatch at ~2.5 mm SL, first feed at ~4 mm and grow only ~0.2 mm/d (Limburg). So they spend ~25–30 d below 8–10 mm, the size range where:
  - perch-family larvae suffer their highest lake Z;
  - cyclopoids can still attack.
- The ~0.1–0.2/d best estimate for 4–10 mm is the lake perch "crowded or food-poor" band (0.14–0.5) and the Hudson cohorts' lower half. The ~0.03–0.06/d from 10–20 mm to autumn is Oneida's 18 mm → October value (0.034) and the Hudson post-yolk-sac → juvenile rates (0.03–0.06).

### 1.3 Alewife in lakes

| System | Stage | Z (/d) | Method | Source | Tag |
|---|---|---|---|---|---|
| Lake Champlain (landlocked, invasive) | Young-of-year aged 15–100 d (n = 234), hatch July | **0.12** (2007), **0.10** (2008); no difference by hatch date | ln abundance of weekly hatch-date cohorts (hydroacoustic density × otolith hatch dates) | Simonin 2010, MS thesis, U. Vermont, ch. 3 | [full text] |
| Same | First 45 d | **5.5 %/d** (smelt 3.4 %/d); growth 0.6–0.7 mm/d | Same | Simonin, Parrish, Rudstam, Pientka & Sullivan 2016, *TAFS* 145:649, doi:10.1080/00028487.2016.1143401 | [abstract]; Z ≈ 0.057 [inf] |
| Bride Lake, CT (sea-run; 29 ha per SRA) | Egg → emigrant, 1966 | Survival 0.0013 % ⇒ mean Z ≈ ln(77,000)/100 d ≈ **0.11** | Egg production vs emigrant count | Kissil 1974 via Fay et al. | [review, repo]; Z [inf] |
| Bride Lake | Juveniles, June → August | "Decrease by two orders of magnitude" ⇒ Z ≈ ln(100)/60 ≈ **0.077** | Personal communication (Post) in Gahagan 2010 | — | [review, repo]; Z [inf] |
| Linsley Pond, CT, enclosures without predators | Young-of-year, mid-June on, at 0.16–10.2 fish/m² | **0–0.006** | Census | Post 2006, CT Institute of Water Resources report B-038 | [full text, figure †] |
| Tar-Pamlico R., NC (river) | 7-d larval cohorts | 0.064–0.270 | Cohort catch curves | AFS 2010 abstract | [snippet †] |
| Lab | Larvae to 35.5 mm at 20 °C | 0.018 | — | Heinrich 1981 | [abstract, repo] |

**Reading [inf].**
- Lake alewife young die at ~0.06–0.12/d in their first 2–3 months, mostly by predation. Predator-free enclosures lose almost none, even at densities that stop growth.
- Lake Michigan values are in Höök et al. 2007 (*TAFS* 136:1298); its open copy sits behind a Cloudflare check, not bypassed.

### 1.4 Bluegill and pumpkinseed (no new lake Z)

- **Beard 1982** (Camp and Lamereau lakes, WI; 4 ha, bluegill only, no piscivores) [full text, repo]:
  - Z 0.109–0.385/d for days 0–4 after nest dispersal, then 0.001–0.008/d to fall;
  - the four days after dispersal set year-class strength.
- **Carbine 1948** (Deep L., MI, with piscivores) [full text, repo]: nest fry → September survival 0.0007–0.097 % for bluegill and 0.013–0.49 % for pumpkinseed (Z ≈ 0.06–0.10).
- **Lake Opinicon** (Garvey, Herra & Leggett 2002, *Ecol. Appl.* 12:194) [abstract; review: Neuswanger et al. 2015 WDNR, †]:
  - embryo numbers did not predict limnetic larval density;
  - most fall juveniles came from larvae appearing after mid-June;
  - survival was best above 23.5 °C;
  - in 1998 a cooling from 70 to 64 °F right after the late-May larval peak was followed by poor survival of early cohorts.
- **Cargnelli & Gross 1996** (*CJFAS* 53:360) [review †]: early fry were 17 % of production but 40 % of recruits.
- **Werner 1969** (Crane L., IN) [review †]: limnetic fry grew ~0.4 mm/d, returned to the littoral at 21–25 mm, and 23 % of stomachs were empty.
- **Predation:**
  - young largemouth bass ate 58–93 % of littoral bluegill fry at Ridge Lake, IL (Santucci & Wahl 2003) [review †];
  - 94 % of water-column predation on Opinicon bluegill nests was by bluegill themselves (Gross & MacMillan 1981) [review †];
  - *Saprolegnia* infected 38 % of eggs in solitary nests vs 19 % in colonies (Côté & Gross 1993) [review †].
- **Redbreast sunfish:** nothing for lakes.
- **Gap:** the Garvey 2002 full text (Opinicon Z and densities by date) is behind a Cloudflare check, not bypassed.

### 1.5 Smallmouth bass (lakes)

| Quantity | Value | Place | Source | Tag |
|---|---|---|---|---|
| Nest success (% of nests reaching free-swimming fry) | 44–96 % in lakes, lake median ~75 %. South Branch L., **Maine**: 67 % and 88 % in two years (Neves 1975, *TAFS* 104:83). Opeongo 47–82 %; Nebish 87–96 %; Opinicon 44–63 % | 26 studies | Steinhart 2004, PhD, Ohio State, Table 4 (layout garbled in extraction); Forbes 1981, WDNR RR 111, Table 1 (lakes 44–86 %) | [full text †]; Forbes [full text] |
| Deposited egg → postlarva | **26–33 %** (Katherine L., MI, 19.4 ha); 28 % (L. Michigan, Latta 1963) ⇒ Z ≈ 0.05–0.065 over ~21 d | — | Clady 1975, *J. Wildl. Manage.* 39:194, via Forbes 1981 | [review]; Z [inf] |
| Deposited egg → fall fingerling | **1–4 %**; females deposit 15–34 % of potential eggs | Katherine L. | Same | [review] |
| Daily survival in the nest | 0.90 embryos (days 1–13), 0.92 larvae (days 14–20) ⇒ Z 0.105 / 0.083 | Opeongo and others | Steinhart 2004, from Friesen 1998 and Knotek & Orth 1998 | [full text †] |
| Daily nest destruction by storms | 0.015 (Opeongo), 0.065 (Lake Erie) | — | Steinhart 2004 (Mayfield method) | [full text †] |
| Brood counts per nest | ~8,600–14,500 embryos → 3,300–8,700 larvae → 150–300 juveniles. Only 34 % (1991) and 52 % (1992) of males reached the juvenile stage | Opeongo 1992 | Mackereth, Noakes & Ridgway 1999, *EBF* 56:263, Fig. 5 | [full text, figure †]; Z ≈ 0.035 (embryo → larva), ≈ 0.2 (larva → juvenile, including dispersal) [inf †] |
| Stage Z, guarded broods (river) | Daily loss 6.7 % (egg → swim-up), 14.0 % (swim-up → metamorphosis), 9.1 % (→ juvenile) ⇒ Z 0.07 / 0.15 / 0.095 | North Anna R., VA | Knotek & Orth 1998 / Knotek 1995 | [abstract, repo] |
| Fall fingerlings | 31–327 /ha (mean 112), 1972–92; 36–226 per nest. Katherine L. 89–215 /ha (19–57 per nest) | Nebish L., WI (38 ha) | Kempinger et al. 1982, WDNR RR 119; Engel et al. 1999, WDNR RR 181 | [full text †]; per nest [inf †] |
| Swim-up → fall | ~2–11 % ⇒ Z ≈ 0.02–0.04 over ~100 d (with ~2,000 swim-up per successful nest) | — | Brown et al. 2009 DFO synopsis (Scott & Crossman) | [review †]; [inf †] |
| Nest density | 1.2–1.6 /ha in strong years and 0.3–0.4 /ha in weak (Nebish); 3.8–4.6 /ha (Katherine); 18–49 per km of shore (Opeongo Jones Bay); ≥ 71 per km of suitable shore (Big Lake, **Maine**, Watson 1955) | — | Forbes 1981; Rejwan et al. 1997, *CJFAS* 54:2007 | [review]/[full text †]; [inf] |
| Spawning cold rule (Maine) | Total nest loss if the 15-d minimum is below 10 °C; p = 3.0 − 0.2·T_min for 10–15 °C | Spednic L. (ME–NB) | Dudley & Trial 2014, USGS SIR 2014-5164 | [full text, repo] |

### 1.6 What drives the high-mortality years in lakes

| Driver | Lake evidence | Tag |
|---|---|---|
| **Fish predation (dominant)** | Kinord: adult perch cannibalism took most larvae (Treasurer 1989) | [abstract] |
| | Lake Ontario ponds: alewife pushed perch Z to 1.58 (Mason & Brandt 1996) | [abstract] |
| | Lake George, **Maine**: adult sea-run alewives ate larval yellow perch, 35 % of food items in May 1992; 101 perch larvae in 9 of 17 adults in May 1991 (Kircheis et al. 2002, MDIFW Interagency Rep. 02-1) | [full text †] |
| | Lake Erie: clear-water larvae die faster from predation by white perch (Ludsin et al. 2011) | [abstract] |
| | Oneida: white perch eat percid fry (2022 report) | [full text] |
| | Ridge Lake: young largemouth took 58–93 % of bluegill fry | [review †] |
| | Champlain smelt: cannibalism killed early hatchers at Z 0.41 vs < 0.05 for late ones (Simonin 2010) | [full text] |
| | Walleye in lakes 0.20–0.35 vs predator-free enclosures 0.012–0.046 (Johnston 1995) | [full text, repo] |
| **Food (density-dependent)** | West Blue Lake bay vs basin, Z 0.140 vs 0.017 (Henderson 1977) | [full text] |
| | Pelican L.: Z falls with zooplankton biomass (Kaemingk 2014) | [abstract] |
| | Oneida: growth density-dependent but mortality not (Irwin 2009) | [abstract] |
| | Alewife enclosures: crowding stops growth, not survival (Post 2006) | [full text, figure †] |
| **Cold snaps at yolk-sac / first feeding** | Hudson 1976 drop to 12 °C (white perch, striped bass) | [full text] |
| | Patuxent 2004 storm to ~10 °C | [abstract-level †] |
| | Oneida: temperature (+) and wind (−) explain 87 % of perch egg → 8 mm survival; low temperature kills prolarvae (Clady 1976) | [abstract] |
| | Opinicon 1998 cooling after the larval peak | [review †] |
| | Bass nests: 10–15 °C rule | [full text, repo] |
| **Wind and storms** | Oneida eggs stranded by wind (Clady) | [abstract] |
| | Loch Davan: turbulence on exposed shallow spawning grounds twice eliminated a year class (Treasurer) | [abstract] |
| | Bass nest storms 0.015–0.065/d | [full text †] |
| **Invertebrate predators** | Cyclopoids (*Diacyclops thomasi*, *Acanthocyclops vernalis*) attacked 3–8-mm alewife larvae in July; yellow perch "apparently immune" (Hartig, Jude & Evans 1982); at Pigeon L., MI, newly hatched perch were attacked at up to 8,740 attacks per 1000 m³ (Hartig & Jude 1984) | [abstract, repo] |
| | *Hydra* at sunfish nests (up to 20 % of a colony's larvae within 2 m) | [abstract, repo] |
| | ***Chaoborus* and *Leptodora*:** no field or lab record of them eating fish larvae was found (searches 2026-10-22). Both eat zooplankton, so they compete with larvae | [inf from search] |

---

## 2. Stage-specific survival (fractions)

### 2.1 Yellow perch

| Stage | Survival | Place | Source | Tag |
|---|---|---|---|---|
| Egg viability | > 0.95 (Oneida); 0.953 (Kinord, Eurasian perch) | — | Clady via Dahlberg 1979; Treasurer 1983 | [review, repo]; [abstract, repo] |
| Egg → 8 mm | **0.016–0.184**, "80+ % base mortality" every year | Oneida 1969–75 | Clady 1976, *JFRBC* 33:1887, doi:10.1139/f76-241 | [abstract] |
| Egg + yolk sac (~25 d) | ≈ **0.077** | Oneida | Dahlberg 1979 + Rose et al. IBM | [inf, repo] |
| Egg → 18 mm | ≈ **0.06** (67,000 per 1.11 M eggs/ha) | Oneida | ESL eggs; 2022 report | [inf] |
| ~10 → ~25 mm, pelagic phase (~21 d) | **0.70** (basin, 0.44 fry/m²) vs **0.053** (bay, 24 fry/m²) | West Blue L., MB | Henderson 1977 | [inf from full text] |
| 18 mm → 15 Oct | **≈ 0.014** (long-term 67,000 → 950 /ha); 2022: 99,400 → 825 /ha = 0.0083 | Oneida | VanDeValk et al. 2023 | [full text]; ratio [inf] |
| 15 Oct → 1 May (yearling) | 2021 class: 19 /ha in May | Oneida | Same | [full text] |
| **Egg → 15 Oct** | **≈ 0.0009** (0.06 × 0.014) | Oneida | — | [inf] |
| Larval Z → whole larval stage | 0.063/d (Kinord) ⇒ ~0.15 survival over 30 d | Scotland | Treasurer 1989 | [abstract]; [inf] |

### 2.2 White perch

| Stage | Survival | Basis | Tag |
|---|---|---|---|
| Egg → hatch, lab | 0.815 maximum at 14 °C, 0 ppt (Morgan & Rasin 1982); optimum 14.1 °C | Lab | [review: Fischer, Hall & Sullivan 1989] |
| Egg → hatch, field | **Not measured anywhere** (§5) | — | — |
| Egg → yolk-sac larva (Hudson index) | Index slope 0.41 (1974–91) → 0.94 (1992–2013). Duration-weighted arithmetic gives 0.26–0.85, but the same arithmetic for yolk-sac → post-yolk-sac exceeds 1, so the indices are not survival | Gallagher 2016, MS thesis, U. Maryland (DRUM 1903/18959) | [full text †]; [inf †] |
| Post-yolk-sac peak → mid-Aug juveniles | ≈ **0.045** (2.08 billion → 93 million, gear-corrected) | TI 1979 (1976 year class) | [full text]; [inf] |
| Post-yolk-sac peak → Sept juveniles | ≈ **0.10** (2.08 billion → 209 million by mark–recapture). The peak standing crop is itself after the early losses, so this is an upper bound on survival from first feeding | Same | [full text]; [inf] |
| Mean young/post-yolk-sac crop | 0.71/709 = 0.001 (different gears; index only) | Gallagher 2016 | [inf †] |
| Juvenile → end of yearling year | 0.11–0.25/yr | TI 1977f; Central Hudson 1977, both in TI 1979 | [review] |
| First winter (lab, Great Lakes young) | 68.4 % dead after 150 d at 2.5 °C; 40.6 % dead after 180 d at 4 °C if starved, 0 % if fed | Johnson & Evans 1990, *TAFS* 119:301 | [abstract †; repo FWM] |

**A lake chain for white perch [inf, low confidence].** These are the analogue ranges that the evidence above allows, not measurements:
- **egg → hatch 0.3–0.8.** The lab gives 0.8. Lake demersal-egg analogues (walleye, smelt) are far lower. White perch's 2.5–4-d incubation limits exposure;
- **hatch → first feeding (~4 mm) 0.2–0.6.** This is the documented critical period. Cold years sit at the low end;
- **first feeding → 20 mm (~60–80 d at 0.2–0.3 mm/d) 0.02–0.15.** That is Z 0.03–0.06 averaged over the stage, higher early;
- **20 mm → end of summer 0.1–0.4;**
- **so egg → end of summer ≈ 10⁻⁵–10⁻³.** Oneida yellow perch's 0.0009 sits at the top of that band.

---

## 3. Larval and juvenile densities in lakes

### 3.1 Yellow perch

| Lake | Stage | Density | Tag |
|---|---|---|---|
| Oneida (Miller sampler, corrected for avoidance; Noble 1970) | 18 mm (~11–14 June) | Long-term mean **27,200/acre = 67,000/ha = 6.7/m²**; 2022: 40,200/acre = 99,400/ha (9.9/m²); chart axis to ~160,000/acre (~40/m²) | [full text: VanDeValk et al. 2023] |
| Oneida | 15 Oct (trawl regression) | Long-term **385/acre = 950/ha** (0.095/m²); 2022 334/acre = 825/ha | [full text] |
| Oneida | Spring yearlings | 2021 class 7.7/acre = 19/ha | [full text] |
| West Blue L., MB | Start of the pelagic phase (~10 mm) → end (~25 mm) | **Bay 24 → 1.3 /m²**; basin 0.44 → 0.35 /m² | [full text] |
| Pigeon L., MI | Newly hatched | 41.9/m³ (exceptional spawning) | [abstract, repo] |
| 7 MN lakes (207–1,923 ha) | 15–25 mm, limnetic neuston | 0–4.76/m³ | [full text, repo] |
| L. Constance (Eurasian perch) | Larvae → juveniles | 0.012–0.365/m³ | [full text, repo] |

**Bookkeeping, Oneida** [inf]:
- 111 eggs/m² (35 spawners/ha × 30,313 eggs; ESL) → ~8.5 first feeders/m² → 6.7/m² at 18 mm → 0.095/m² in October.

### 3.2 White perch

| System | Stage | Density | Tag |
|---|---|---|---|
| Oneida (20,700 ha; Aug–Sep area-swept trawl, no avoidance correction) | Age-0 | Table A14, 1961–2022 (n = 62): **median 56.5, mean 293, 75th percentile 322, max 2,699**. The unit is unstated, but every neighbouring table is per acre ⇒ **median ≈ 140/ha, mean ≈ 720/ha, max ≈ 6,700/ha**. 1990–2022: median 33, mean 120 per acre. Recent years mostly 1–22 per acre (2017: 363) | [full text: VanDeValk et al. 2023, Table A14]; stats [inf †, spot-checked]; per ha [inf] |
| Western Lake Erie (eutrophic; August interagency bottom trawl) | Young-of-year | **1,573/ha (2019)**, down 50 % from 2018; **ten-year mean 2,961/ha**. Yellow perch 555/ha (ten-year mean 400) | [full text: Lake Erie Forage Task Group 2020] |
| Hudson R. (RM 12–152, ~29,200 ha) | September 1976 juveniles | 209.2 million ⇒ **≈ 7,160/ha**, 20 kg/ha at 2.75 g | [full text: TI 1979]; per ha [inf from TI's own area] |
| Hudson 1976 | Peak post-yolk-sac standing crop (late June) | 2.08 billion ⇒ **≈ 7.1/m²** (gear efficiency taken as 1, so a minimum) | [full text]; [inf] |
| Hudson 1994 | Cohort N₀ (back-calculated) | ~0.3–16 /m³, early cohort to ~265 /m³ | [full text, repo] |
| Upper Chesapeake turbidity maximum | Yolk-sac larvae at the densest stations | ≤ ~400 /m² | [full text, repo †] |
| **Any lake, larvae per m³** | — | **None found.** The western Lake Erie mid-June larval peak was partly *Morone* (DeBruyne et al. 2024), but the full text was unavailable | [abstract †] |

**Where "2,900–7,200/ha" comes from [inf].**
- These are exactly the western Lake Erie ten-year mean (2,961) and the Hudson 1976 September estimate (≈ 7,160).
- Both are productive or turbid systems with huge spawning stocks.
- Oneida, a eutrophic lake with abundant white perch, has a typical late-summer density of only ~100–700/ha, reaching ~5,000–6,700/ha only in its best years (1980, 1982, 1983, 1987).
- For clear, softwater, oligo-mesotrophic Hot Brook, **~100–1,000/ha** is the defensible late-summer target, with strong years to a few thousand.

**Bookkeeping.**
- No eggs per m² of white perch spawning ground exist for any water.
- Fecundity: 56,200 eggs/kg in one spawning (AuClair 1956, Maine); 53,647 eggs at age 3–4 (Hudson, TI 1979); 69,379 oocytes mean (Choptank; Shaner et al. 2024, *Fish. Bull.* 122:133) [review/full text †].
- The ESL note's sim-side estimate is ~600 eggs/m² at 450 adults/ha.

### 3.3 Alewife

| System | Stage | Density | Tag |
|---|---|---|---|
| Claytor L., VA (reservoir, landlocked; surface neuston net) | Larvae 4.9–32 mm | Peaks 0.045–0.065/m³; season means 0.019–0.023/m³; none after early August. Crustaceans never below 250–400/L | [full text †: Small 2002, MS thesis, Virginia Tech] |
| Lake Michigan, July 2015 (24 sites) | Larvae | **0–42.57 per 100 m³ (0–0.43/m³)**; 67 % of stomachs empty | [abstract: Eppehimer et al. 2019, *TAFS* 148:755] |
| Lake Michigan 1978 / 1979 | Larvae | Mean peaks 2.6 / 0.62 /m³ | [snippet †; MSU thesis access-limited] |
| Lake Champlain (hydroacoustics + Tucker trawl) | Age-0 | 0–0.38/m³, higher in near-shore schools, in the 15–23 °C epilimnion | [full text †: Simonin 2010] |
| Bride L., Dodge Pond, Rogers L., CT (night purse seine enclosing 100 m²) | Sea-run juveniles, August 2017, inshore | **0.75, 0.28, 0.10 /m²** | [full text: Post & Palkovacs 2018, CT DEEP T-15-R-1] |
| Rogers L. (106 ha) | Whole-lake August juveniles | 2017 ≈ 350,000 landlocked + 70,000 sea-run + 23,000 hybrids ⇒ ≈ 4,200/ha (≈ 660/ha sea-run); 2016 ≈ 910/ha | [full text †]; per ha [inf †] |
| Bride, Dodge, Gorton (Gorton 21.5 ha, max 3.4 m) | YOY biomass | July ≈ 0.7 g/m², August ≈ 2.0 g/m² ⇒ ≈ 0.7–1.1 fish/m² at 46–57 mm (7–20 kg/ha) | [full text, figure †: Post et al. 2008]; numbers [inf †] |
| Bride L. 1966 | Eggs → emigrants | 2.05×10¹⁰ eggs from 184,151 adults ⇒ ~70,000 eggs/m² over 29 ha → 257,000 emigrants (~0.9/m²) | [review, repo SRA]; [inf] |
| Love Lake, **Maine** (272 ha) | Emigrants | 220–439,062 a year (12–3,209 per female) ⇒ up to ~1,600/ha | [review, repo SRA] |

### 3.4 Sunfish and smallmouth

| System | Stage | Density | Tag |
|---|---|---|---|
| Ashby L., ON (259 ha, 36.6 m; surface trawl in the top 2 m) | Pumpkinseed larvae | **~23/m³ littoral peak (~24 June)**, second pulse ~7/m³; shoreline ~3/m³; pelagic ~1/m³; first seen 3 June, gone by the third week of July | [full text, figure †: Sobchak, Colborne & Robinson 2026, *EBF* 109:65] |
| Cozad L. (38 ha) and Pelican L. (323 ha), NE | Bluegill < 13 mm | Peaks **12.5 and 15.8 /m³** | [abstract †: Chvala 2000, MS, SDSU] |
| Claytor L., VA | *Lepomis* larvae | 0.28–0.51/m³ | [full text †: Small 2002] |
| Lake Opinicon | Offshore vs inshore limnetic larvae | Offshore = 8 % of inshore | [review †] |
| Three SW Michigan lakes (15–22 ha), seine, May–Sept | Juvenile bluegill (≤ 60 mm SL); pumpkinseed | Bluegill **0.13–0.52 /m²** of littoral; pumpkinseed 0.04–0.10 /m² with bluegill, 1.77 /m² without (juveniles 0.32) | [full text †: Osenberg, Mittelbach & Wainwright 1992, *Ecology* 73:255, Table 1] |
| Beard's WI lakes (no piscivores) | Bluegill fry leaving nests → 4 d later → fall | 64.5 /m² → 5.4–20.5 /m² → up to 37.6 /m² | [full text, repo] |
| Nebish L., WI | Smallmouth fall fingerlings | 31–327 /ha | [full text †] |

---

## 4. Larval and young alewife in lakes: growth, zooplankton and other larvae's food

### 4.1 Growth

| System | Stage | Growth | Tag |
|---|---|---|---|
| Lake Michigan | Larvae | 0.84–0.89 mm/d (2001–02, Höök et al. 2007); ~0.64–1.11 (2005–06, Weber et al. 2015); **0.50 mm/d** mean in 2015, "at least 40 % slower" than earlier decades, explained by age and zooplankton density | [review †: Bunnell 2018 GLFC slides]; 2015 [abstract] |
| Lake Champlain | Age-0 | 0.6 (early hatchers) – 0.7 (late) mm/d | [abstract] |
| Bride L., CT, 2021–22 | Juveniles (TL vs date slope) | **0.31 mm/d**, and **0.22 mm/d** in the drought year when the young were trapped in the lake; ~0.55–0.75 mm/d over the first 100 d | [full text †: Burgess et al. 2026, *Front. Mar. Sci.* 13, doi:10.3389/fmars.2026.1721762]; [inf †] |
| Bride L. 2006 | Migrants vs non-migrants | 28–75 mm (mean 41) vs 22–57 mm (mean 38). Migrants had 11 % greater length-at-age | [full text †: Gahagan et al. 2010, *TAFS* 139:1069] |
| Linsley Pond enclosures, 2005 (no predators) | YOY from mid-June | ~0.11–0.24 g/d at 0.16–0.32 /m²; ~0.075 at 0.64; ~0.045 at 1.27; ~0.01–0.02 at 2.55–5.1. **Growth halves by ~0.6 /m² and falls ~10× by ~2.5 /m²**. Absolute values look high; trust the shape | [full text, figure †: Post 2006, CT IWR B-038] |
| Eleven New England lakes | Juveniles | 0.56–1.41 mm/d, falling with juvenile density, rising with zooplankton | [abstract, repo: Devine et al. 2024] |

### 4.2 Effects on zooplankton

**Post, Palkovacs, Schielke & Dodson 2008** (*Ecology* 89:2019, doi:10.1890/07-1216.1). Nineteen CT lakes, biweekly in 2005; sea-run lakes include Bride 18.2 ha, Dodge 13.9 ha, and Gorton 21.5 ha / max 3.4 m [full text unless marked].
- **Timing.**
  - Young are gape-limited "until June". They take zooplankton (gape > 1.0 mm) "from mid-June through fall".
  - Large zooplankton therefore have a refuge "from December to early June, roughly half the year".
  - Adults present in March–April "typically do not feed" before or during spawning.
- **Collapse.**
  - In sea-run lakes, large-cladoceran biomass was "relatively high in April and May", then "fell precipitously from late May to mid-June".
  - **No large cladocerans from the end of June to the end of October 2005.**
  - "We have never seen *Daphnia* spp. in anadromous lakes after the end of July."
  - *Mesocyclops edax* was collected regularly all summer and stays in the diet.
- **Magnitudes** [figure †]:
  - large cladocerans peak ~37 µg/L in mid-May, then ~4 by mid-June and 0 from July;
  - spring (Mar–Apr) → summer (Jul–Sep) totals: ~44 → ~6.5 µg/L (−85 %) in sea-run lakes;
  - no-alewife lakes: ~18 → 39 µg/L; landlocked lakes: ~16.5 → 15 µg/L.
- **Sizes** [figure †]:
  - mean cladoceran length 0.45 → 0.22 mm in sea-run lakes, vs 0.55 → 0.68 mm in no-alewife lakes;
  - cladoceran length began falling at the end of May and copepod length ~2 weeks later [full text].

**Other lakes:**
- **Brooks & Dodson 1965** (*Science* 150:28) [full text †]. Crystal Lake, CT, before vs after landlocked *Alosa*:
  - modal zooplankton length 0.785 → 0.285 mm;
  - nothing > 1 mm in 1964;
  - *Daphnia catawba*, *Mesocyclops*, *Epischura* and *Leptodora* eliminated.
- **Howeth et al. 2013** (*Ecol. Evol.* 3:5031, doi:10.1002/ece3.878) [full text †]: in 12 CT/MA lakes, *Daphnia* was abundant in spring in no-alewife and sea-run lakes but rare in summer in sea-run lakes.
- **Maine:**
  - Demi et al. 2015 (*Hydrobiologia* 758:47) [review †: Maine Alewife Interaction Committee literature review]:
    - in 8 lakes (4 with alewife), young-of-year cut the mean length of cladoceran and copepod biomass from spring to summer;
    - cladoceran biomass fell in 3 of 4 alewife lakes;
    - effects weakened as fertility increased.
  - Lake George, Maine, stocked at only 2.4 adults/ha (Kircheis et al. 2002) [full text †]:
    - summer cladoceran density fell and the late-summer cladoceran peak shifted to fall;
    - *Daphnia* species and *Holopedium* declined; *Bosmina* 0.43 → 0.36 mm;
    - recovery came within 3 years after stocking stopped.
  - Damariscotta Lake: Daphniidae fell sharply soon after the juveniles appeared [abstract †].

### 4.3 Effects on other larvae's food and survival

- **Direct predation by adults** on perch larvae in May:
  - Lake George, Maine (Kircheis) [full text †];
  - Lake Ontario ponds, Z 1.58 (Mason & Brandt) [abstract].
  - In 1984 at the Lake Ontario ponds, alewives arrived 3 weeks after the perch hatch peak and no predation occurred [abstract, repo]. **Timing decides it.**
- **Competition via zooplankton:**
  - young largemouth bass grew fastest and switched to fish earliest in no-alewife lakes, slowest in landlocked lakes, with sea-run lakes in between (Boel, Brodersen, Koed, Baktoft & Post 2018, *Oikos* 127:1800, doi:10.1111/oik.05556) [abstract †];
  - bluegill from sea-run and no-alewife lakes grow better on large *Daphnia* (1.47 mm) than on *Ceriodaphnia* (0.44 mm) (Huss et al. 2014, *Proc. R. Soc. B* 281:20140275) [full text †];
  - Damariscotta juvenile alewife abundance is "controlled by competition for zooplankton" rather than parental stock (Walton 1987) [review †: ASMFC 2009].
- **Where larvae are sparse there is no effect:**
  - Claytor Lake at 0.02–0.07 alewife larvae/m³ and 0.28–0.51 *Lepomis*/m³ showed overlapping diets (*Diaphanosoma*, nauplii) but no depletion of zooplankton [full text †];
  - Lake George, Maine: young rainbow smelt grew faster than young alewife, with low diet overlap (Morisita 0.46) [full text †].
- **Synthesis for Hot Brook [inf].**
  - Yellow perch larvae (mid-May) are exposed to adult-alewife predation while the adults are in the lakes. They can feed on the spring large-zooplankton peak before the young alewife reach the 1-mm gape in mid-June.
  - White perch, sunfish and bass larvae (late May–July) meet the collapse directly.
  - Field crowding at which growth suffers: alewife enclosures ~0.6 young/m²; age-0 perch at Oneida > 20–40 kg/ha (FZC).

---

## 5. White perch eggs in the field

**Spawning and eggs:**
- Demersal, adhesive eggs, broadcast over shallows (0–1.5 m in lakes, Hardy 1978) [review: Stanley & Danie 1983, FWS/OBS-82/11.7 (NRC ML083380621), †].
- Maine lakes must hold 18–21 °C for several days before spawning (AuClair 1956) [review †].
- Hatch takes 96–108 h at 15 °C and 30 h at 20 °C (Thoits & Mullan 1973).
- Prolarvae stay at the site 4–13 d, growing 1.7–3.0 → 3–4 mm (Mansueti 1964) [review †].

**In-situ hatch success: not measured in any water.** The searches covered lakes, the Hudson, the Chesapeake and Lake Erie, through 2026-10-22. The values available:

| Quantity | Value | Source | Tag |
|---|---|---|---|
| Lab hatch | **81.5 %** maximum at 14 °C, 0 ppt; optimum 14.1 °C; eggs tolerate 0–10 ppt | Morgan & Rasin 1982 | [review: Fischer, Hall & Sullivan 1989, JHU APL synthesis (govinfo CZIC-sh171-s94-1989)] |
| Cold | Sudden drops of **2–3 °C cause mortality; 4–5 °C lethal**; < 10 °C significant mortality; 7 °C lethal | AuClair 1960 (Maine); Hardy 1978 | [review: Fischer et al. 1989] |
| Field cold kill | 1976: large egg catches 2–29 May but few larvae > 5 mm; the drop to 12 °C "lethal to the developing larvae"; the first spawn died mostly as yolk-sac larvae | TI 1979, Hudson | [full text] |
| Silt | A **1.1-mm deposited layer = 100 % egg mortality**; 0.45 mm no significant effect; 1,000 mg/L of fine sediment reduced hatch | Schubel et al. 1977; Auld & Schubel 1974 | [review: Fischer et al. 1989] |
| Suspended sediment | 50–5,250 mg/L for 12 h: no change in hatch, but a 24-h delay at 5,250 | Morgan et al. 1983 | [review] |
| Acid pulses | pH 6.0 for < 48 h "could severely" reduce larval survival; reproduction could fall at pH 6.5–6.7 with 25 µg/L monomeric Al and 2 mg/L Ca for 7 d | Klauda 1989 | [review: Fischer et al. 1989] |
| Egg predation | Adult white perch ate white bass and white perch eggs in May (Sandusky R. / western Lake Erie) | Schaeffer & Margraf 1987, *EBF* 18:77 | [snippet †; Springer login not followed] |
| Hudson egg → yolk-sac index | Not interpretable as survival (§2.2) | Gallagher 2016 | [full text †] |

**Lake analogues** [repo ESL]:
- walleye eggs on lake bottoms 2.4–35.7 % to the eyed stage (25 % on gravel–rubble, 0.6 % on muck);
- Maine lakeshore smelt hatch 1.1 %;
- Eurasian perch ribbons 95 %.

**Best estimate for Hot Brook [inf]:**
- egg → hatch **0.3–0.8**, central ~0.5;
- low in cold springs with 2–5 °C drops after spawning, which are common in Maine's May–early June;
- low on silty bottoms;
- high in steady warm spells.
- Hot Brook's softwater adds an acid-pulse risk. It is probably small by late May, after snowmelt, but unmeasured.

---

## 6. What this means for the sim [inf]

This section is inference. It is built from the mechanisms above, in the spirit of "realism over compensation": build the documented causes, then audit the outcome.

1. **The target is lower than assumed.**
   - For a clear Maine lake, late-summer young white perch should be ~100–1,000/ha, not 2,900–7,200 (§3.2). So the sim's excess is larger than 2–6×.
2. **The mortality the sim lacks is concentrated in the first 2–4 weeks.**
   - The required mean Z from swim-up (~60/m² = 600,000/ha, ESL) to ~1 September (~80 d):
     - ln(600,000/2,900)/80 = 0.067/d (to Lake Erie's mean);
     - ln(600,000/7,200)/80 = 0.055/d (to the Hudson);
     - ln(600,000/700)/80 = 0.084/d and ln(600,000/140)/80 = 0.105/d (to Oneida's mean and median).
   - The field shape (§1) puts most of that early:
     - **~0.1–0.2/d below ~10 mm** (cold and food at first feeding; fish and cyclopoid predation on thin larvae);
     - **~0.03–0.05/d above.**
   - Example: 0.15/d for 25 d, then 0.04/d for 55 d, gives 600,000 × e^(−3.75 − 2.2) ≈ 1,560/ha.
   - The sim's 0.04–0.05/d at 5–10 mm, falling as 1/L, is the field's *later-stage* rate applied to the most vulnerable stage.
3. **Where the extra deaths come from, mechanistically** (in order of evidence):
   - **(a) Fish predation on small larvae.** Adult white and yellow perch are the main cannibals and intraguild predators (Kinord, Oneida, Lake Erie). Clear water raises it (Ludsin). Adult sea-run alewife take perch larvae in May (Maine, Lake Ontario).
     - The sim's fish-on-larvae clearance is known to be very low (FPL: 0.002–0.004/d at 60 larvae/m²). Raising it to a mechanistic encounter rate is the documented fix.
   - **(b) Temperature shocks at the yolk-sac → first-feeding transition.** Kill eggs and yolk-sac larvae on 2–5 °C drops, and below ~10–12 °C (AuClair, Hardy, TI 1976). Maine springs supply these.
   - **(c) Density-dependent loss when food per larva is low.** West Blue Lake's crowded bay had 8× the basin's Z. In the sim this should come from the starvation hazard of unequal shares (LSV), not a fixed rate.
   - **(d) A small background** (≤ 0.02–0.03/d at ≥ 1 cm; LM §3.1).
4. **Alewife.**
   - Young alewife in the field die at 0.06–0.12/d. If the sim's young alewife die at the background rate only, they too will be too many.
   - Sea-run lakes run 0.1–1 young/m² in summer at runs of thousands of adults per ha. Hot Brook's suggested run (~15 adults/acre; SRA) should give far fewer.
   - Large cladocerans should vanish from late June to October in Lower if the young are dense. That is real (Post 2008) and is no reason to add food.
5. **Check the zooplankton crash against density, not against food.**
   - Growth at ~⅓ of field is what alewife enclosures show at ~1–2.5 young/m².
   - Bring the young to field densities first, then re-judge growth.

---

## 7. Gaps

- **White perch:**
  - no lake larval Z, no lake larval density and no field egg hatch anywhere;
  - VanDeValk et al. 2016 (Oneida) is the key paywalled source;
  - AuClair 1956/1960 (Maine) is not online; the UMaine repository closed 30 June 2026.
- **Yellow perch:**
  - Lake Mendota larval densities and Z (Post et al. 1992 Springer chapter; Post et al. 1995 TAFS; Luecke et al. 1992 chapter): not open;
  - Lake Erie numeric larval Z (Ludsin group theses: the U. Windsor ETD links now redirect to the repository home page);
  - Lake Opeongo yellow perch larval Z: none found;
  - Whiteside et al. 1985 (Lake Itasca factors): not read;
  - Irwin et al. 2009 interval definitions: check the full text.
- **Alewife:**
  - Höök et al. 2007 (Lake Michigan vs Muskegon Lake Z) behind Cloudflare;
  - Kissil 1974, Havey 1973, Walton 1987 and Cooper 1961 not open;
  - no per-m³ larval density from any sea-run lake.
- **Centrarchids:**
  - Garvey et al. 2002 full text (Cloudflare);
  - Kaemingk et al. 2011 (Cloudflare);
  - Rettig 1999 (access-limited);
  - redbreast sunfish: nothing.
- **Invertebrates:** no evidence either way on *Chaoborus* or *Leptodora* eating fish larvae in the field.

**Blocked sources** are appended to `../blocked_sources_to_fetch.md`, section "Appended 2026-10-22: larval mortality and density in lakes" (IDs LMD01–LMD28).

**Injected instructions seen.** One fetched response (an OpenAlex rate-limit JSON seen by the alewife helper) contained text addressed to AI agents. It suggested sending the user's email to obtain an API key. It was ignored: no email was sent, and OpenAlex was not used again.

---

## 8. Sources read in this pass

**Full text, read by me:**
- Henderson, M. A. 1977. *Growth, mortality, production and feeding of yellow perch fry … West Blue Lake.* MSc thesis, U. Manitoba. http://hdl.handle.net/1993/6294
- VanDeValk, A., T. Brooking, N. Saavedra, L. Rudstam, K. Holeck & C. Hotaling. 2023. *The fisheries and limnology of Oneida Lake, 2022.* NYSDEC F-63-R, Cornell Biological Field Station (Tables A13, A14, text).
- Texas Instruments. 1979. *1976 Year-Class Report for the Multiplant Impact Study of the Hudson River Estuary.* NRC ADAMS ML100250085.
- Simonin, P. 2010. MS thesis, U. Vermont (ch. 3, YOY smelt and alewife hatch dates and mortality).
- Post, D. M., E. P. Palkovacs, E. G. Schielke & S. I. Dodson. 2008. *Ecology* 89:2019–2032. doi:10.1890/07-1216.1
- Post, D. M. & E. P. Palkovacs. 2018. CT DEEP State Wildlife Grant T-15-R-1 final report.
- Lake Erie Forage Task Group. 2020. Executive summary (2019 data), Great Lakes Fishery Commission.
- Forbes, A. M. 1981. WDNR Research Report 111 (smallmouth first-year survival review).
- Swindoll, M. 1981. MS thesis, U. Tennessee (Lake Itasca perch fry).

**Abstracts read by me (via Crossref):**
- Irwin et al. 2009, *TAFS* 138:99, doi:10.1577/T07-256.1
- Clady 1976, *JFRBC* 33:1887, doi:10.1139/f76-241
- Kaemingk, Graeb & Willis 2014, *TAFS* 143:845, doi:10.1080/00028487.2014.886622
- Treasurer 1989, *J. Fish Biol.* 34:913, doi:10.1111/j.1095-8649.1989.tb03374.x
- VanDeValk et al. 2016, *TAFS* 145:416, doi:10.1080/00028487.2015.1131743
- Simonin et al. 2016, *TAFS* 145:649, doi:10.1080/00028487.2016.1143401
- Eppehimer et al. 2019, *TAFS* 148:755, doi:10.1002/tafs.10171
- Ludsin et al. 2011, GLFC completion report (glfc.org)
- Fischer, Hall & Sullivan 1989, white perch water-quality synthesis (govinfo CZIC-sh171-s94-1989; a review of lab studies, read in full)

**Read by helpers (†), from full texts in the session scratchpad unless marked:**
- Steinhart 2004 (OSU PhD)
- Mackereth, Noakes & Ridgway 1999, *EBF* 56:263
- Rejwan et al. 1997, *CJFAS* 54:2007
- Kempinger et al. 1982 (WDNR RR 119)
- Engel et al. 1999 (WDNR RR 181)
- Osenberg et al. 1992, *Ecology* 73:255
- Sobchak et al. 2026, *EBF* 109:65
- Brown et al. 2009 (DFO MS Rep. 2887)
- Neuswanger et al. 2015 (WDNR bluegill review)
- Small 2002 (VT MS)
- Post 2006 (CT IWR B-038)
- Brooks & Dodson 1965
- Kircheis et al. 2002 (MDIFW 02-1)
- Gahagan et al. 2010
- Howeth et al. 2013
- Huss et al. 2014
- Burgess et al. 2026 (via fetch summary)
- Gallagher 2016 (U. Maryland MS)
- Stanley & Danie 1983 (NRC ML083380621)
- Barnthouse et al. 1982 (ORNL)
- Shaner et al. 2024
- Abstract-level: Quist et al. 2002; Johnson & Evans 1990/1991; Boel et al. 2018; Demi et al. 2015 (review); Chvala 2000.
