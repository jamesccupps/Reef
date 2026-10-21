# Small zooplankton and the microbial loop: the food of first-feeding larvae (2026-10-21)

**Why.** In the 3-D sim the zooplankton is three biomass pools: Daphnia (`zooD`), copepods (`zooC`) and rotifers+nauplii (`zooR`).
- The rotifers eat only edible algae, with K_R 0.15. Their zero-growth food is ≈0.05 algae units, above Daphnia's ≈0.034 (`config.js` PLANKTON comments).
- They also lose to Daphnia interference (`DAPH_INTERF`) and to a density-dependent predation term (`M2_R`).
- They fall to ~0 µg/L in summer. First-feeding pumpkinseed then stall at ~7 mm for six weeks.

The question is what keeps the small prey alive in real lakes, and at what levels.

**Target lake.** Small, shallow (max 2.5–5.5 m), unstratified, soft, slightly humic. Secchi ~3.5–4.5 m, colour ~18–46, chl 3–5.5 µg/L, TP 9–12 µg/L (`../Hot Brook populations and water/maine_dep_lakes_data_2025.md`: Faulkner, North and Baskahegan lakes).

**STATUS: PARTIAL.**
- **Done:** a full read of the seven companion notes, and the first-feeding-larvae question (Q5).
- **Not done:** two literature sub-searches were still running when this note was handed off:
  - (A) rotifers and the microbial loop (Q1, Q4);
  - (B) nauplii, small cladocerans and *Chaoborus* (Q2, Q3, Q6).

  Sub-search B's results are now appended as **§5**, and §3 point 3 is revised to match. Sub-search A's results are **not** in this note yet.
- **Why so many gaps:** the session's shared web-search budget ran out during this pass. Q1–Q4 and Q6 below therefore rest on numbers already held in the companion notes (cited, not repeated in full) plus the gaps they leave.

**Companion notes (not repeated):**

| Code | Note | What it holds |
|---|---|---|
| ZD | `zooplankton_dynamics.md` | Biomass vs TP, P/B equations (Shuter & Ing; Stockwell & Johannsson), Bělehrádek development, length–weight, Daphnia thresholds, PEG |
| CDC | `copepod_daphnia_coexistence.md` | Thresholds, omnivory, the microbial-loop competition between Daphnia and copepods, winter, resting stages, LakePulse composition |
| FZC | `fish_zooplankton_coupling.md` | Larval prey ladder, gape, prey-density thresholds, larval mortality |
| FFE | `forage_fish_early_life.md` | Bluegill, pumpkinseed and perch early life |
| IPP | `../Hot Brook populations and water/invertebrates_plankton_plants.md` | LakePulse regional zooplankton, Adirondack rotifers, *Chaoborus* and benthos |
| DEP | `../Hot Brook populations and water/maine_dep_lakes_data_2025.md` | The nearby lakes' water |
| LJE | `larval_juvenile_energetics_panfish.md` | Larval Cmax, energy density, white perch on rotifers (Margulies 1989), Hart & Werner 1987 |

**Tags:**
- **[primary]**: full text read.
- **[secondary — X citing Y]**: read in X, which cites Y.
- **[abstract]**: abstract only (publisher page or the OpenAlex record).
- **[snippet]**: search-engine summary only.
- **[inf]**: my arithmetic or inference.
- **[repo CODE]**: held, with its own tag, in that companion note.
- **UNVERIFIED**: a background value that no source retrieved here supports. These are kept only where earlier notes already flagged them.

---

## 1. Takeaway table

| Quantity | Value | Basis |
|---|---|---|
| Rotifers' share of the zooplankton | Adirondack lakes: rotifers 19.4 µg/L vs crustaceans 65.9 µg/L, so rotifers ≈ 0.29× the crustaceans | Siegfried & Sutherland 1989 [repo IPP] |
| Rotifers' share of production | **39.8 %** of zooplankton production in oligotrophic Mirror Lake, NH (copepods 55 % of biomass but 19 % of production) | Makarewicz & Likens 1979 [repo ZD] |
| | Rotifers 17–66 % of total zooplankton production in Lake Erie | Johannsson et al. 2000 [repo ZD] |
| Rotifer P/B (Shuter & Ing) | log10 P/B = −1.631 + 0.0434·T: **0.035 /d at 4 °C, 0.105 at 15 °C, 0.17 at 20 °C, 0.28 at 25 °C** | [repo ZD] |
| Rotifer generation time | ~8–10 d at 17 °C (Mirror Lake) | [repo ZD] |
| Under-ice rotifers | *Kellicottia* 12 % of community biomass, Lake Simoncouche, QC (TP 7 µg/L, mean depth 2.2 m) | Boulianne et al. 2025 [repo ZD] |
| Do rotifers vanish in summer? | **No evidence in the repo's sources that they vanish.** Mirror Lake's 40 % production share and the Adirondack 19 µg/L are lake means; the PEG summer is "small species and rotifers". A summer series for a comparable lake is still a gap (sub-search A). | [repo ZD, IPP]; [inf] |
| Daphnia suppresses rotifers, HNF and ciliates | Daphnia cut *Bosmina*, a rotifer and nauplii (Vanni 1986). Flagellate and ciliate growth near zero or negative, and rotifer growth usually lower, under Daphnia dominance (Pace & Vaqué 1994). | [repo CDC] |
| Release from fish | When fish are removed, rotifers and small cladocerans proliferate within ~2 weeks | Ersoy et al. 2019 [repo ZD] |
| Copepods eat rotifers | *Skistodiaptomus pallidus* clears rotifers 5.5–6.2× faster than algae. *Mesocyclops leuckarti* needs rotifers to finish development. | [repo CDC] |
| Nauplii + young copepodites | 7–11 ind/L and 3.8–5.0 µg DW/L in summer, Voyageurs NP soft-water lakes | Kerfoot et al. 2016 [repo ZD] |
| | Nauplii ≈ 34 % of community biomass at ice-melt, Simoncouche | Boulianne et al. 2025 [repo CDC] |
| Copepod nauplii on algae alone | Development threshold 0.2–0.5 mg C/L (4–10× Daphnia's). Summer lake water dominated by cladocerans "did not support naupliar growth". | Santer & van den Bosch 1994; Hansen & Santer 1995; Santer & Lampert 1995 [repo CDC] |
| Small cladocerans, regional | *Bosmina longirostris* 5.0 % and *Diaphanosoma* 4.0 % of crustacean biomass (LakePulse lakes ≤250 km of Hot Brook). *Holopedium* occurs in 43 % of those lakes. | [repo IPP] |
| | Atlantic Highlands median *Bosmina* only 1.2 µg/L | [repo IPP] |
| Small-cladoceran masses | *Bosmina* (W = 26.6·L^3.13): 0.35 µg at 0.25 mm, 1.5 µg at 0.4 mm, 3.0 µg at 0.5 mm | [repo ZD] |
| Plant-associated zooplankton | "Typically almost half" of total zooplankton biomass in 81 shallow lakes, set by macrophyte cover | Gyllström et al. 2005 [repo ZD] |
| First-feeding gapes | Yellow perch **322 × 318 µm** at 6.0 mm TL (NCRAC) [repo FZC] | |
| | Bluegill **~0.20 mm at 6 d, 0.27 mm at 9 d** post-hatch | Toetz 1966 [snippet, via a UW–Madison thesis] |
| First foods | Rotifers (*Polyarthra*), nauplii and small cyclopoids **0.1–0.3 mm** at 4.5–6.3 mm; cladocerans from ~8–12 mm | Keast 1980; Siefert 1972 [repo FZC] |
| | Smallmouth bass: **chironomids and copepods at ~9 mm**, a shift at ~15 mm | Easton 1992 [abstract] |
| | Chain pickerel: **cladocerans and *Cyclops* at ~10 mm** | [repo pickerel_young_of_year.md] |
| Prey densities larvae need, rotifer/nauplius-sized prey | **Pumpkinseed: measurable growth only above 0.25 plankters/mL (250/L); 10 % survival at 0.16/mL (160/L)** | Hart & Werner 1987 [abstract] |
| | White perch at 50 rotifers/L: G only 0.006–0.015 /d, against 0.14–0.20 /d at 800/L (17–21 °C) | Margulies 1989 [repo LJE] |
| Prey densities larvae need, crustacean prey | Bluegill growth 0.6 → 0.2 mm/d below ~50 crustaceans/L (Breck 1997) | [repo FZC] |
| | Walleye consumption saturates at 20–30 crustaceans/L (Hoxmeier et al. 2004) | [repo FZC] |
| | Yellow perch foraging success rose from 25 to 150 zooplankton/L, but only for larvae >10 mm (Martin, Wahl & Czesny 2012) | [abstract] |
| Biomass-equivalent threshold | Both rules come to ≈ **25–100 µg DW/L of size-appropriate prey**, which brackets the sim's K_FRY 30 | [inf] §5 |
| *Chaoborus* | Oneida Lake: 42/m² at 4 m, 430–627/m² at ≥11 m, >1,000/m² in late summer. Fishless or anoxic lakes: 6,000–30,000/m². | [repo ZD] |
| | Lac La Belle, WI: 7–460/m² | [repo IPP] |
| | Hot Brook-like lake (no anoxic refuge): ~50–500/m² | [repo IPP, inf] |

---

## 2. Findings by question

### Q1. Rotifers: biomass, genera, production, food, suppression, summer persistence
**Already held (cited):**
- **Standing stock and production:**
  - Adirondack lakes: 19.4 µg/L of rotifers vs 65.9 µg/L of crustaceans (Siegfried & Sutherland 1989) [repo IPP].
  - Mirror Lake: 39.8 % of zooplankton production; planktonic rotifer generation time 8–10 d at 17 °C (Makarewicz & Likens 1979) [repo ZD].
  - Lake Erie: rotifers 17–66 % of total zooplankton production (Johannsson et al. 2000) [repo ZD].
  - Florida lakes: microzooplankton (ciliates, rotifers, nauplii) "drove most of the biomass–trophic-state relationship" (Bays & Crisman 1983) [repo ZD, snippet].
- **Rate:** the Shuter & Ing rotifer P/B is the fastest of any group (Rotifera > Chydoroidea > Cyclopoida > Calanoida) [repo ZD].
- **Under ice:** *Kellicottia* is 12 % of Simoncouche's biomass. Rotifers and calanoids favour 3–4.5 m, while cyclopoids and cladocerans favour 7 m [repo ZD].
- **Suppression:**
  - Daphnia exploitation and the microbial loop: Pace & Vaqué 1994; Vanni 1986 [repo CDC].
  - Mechanical interference: Gilbert 1988 is cited in `config.js` but has **not been read** in any note; its numbers are a gap.
  - Copepod predation: Williamson & Butler 1986; Hansen & Santer 1995; Hopp et al. 1997 [repo CDC].
  - Larval fish: only a "minor impact" on rotifers (Mehner & Thiel 1999) [repo ZD].
- **Release:** without fish, rotifers and small cladocerans "proliferated" within ~2 weeks (Ersoy et al. 2019) [repo ZD].
- **Individual mass:** about 0.01–0.5 µg DW per rotifer. This is **UNVERIFIED** (flagged as such in ZD).

**Pending (sub-search A):**
- seasonal rotifer biomass and density series in comparable lakes, and whether there is a summer floor;
- the dominant genera by season;
- rotifer clearance of bacteria and their food thresholds;
- Daphnia interference rates (Gilbert 1988; MacIsaac & Gilbert);
- *Asplanchna* and cyclopoid predation rates.

**[inf] from what is held:**
- No source in the companion notes reports rotifers absent through a whole summer. The lake means (19 µg/L; ~40 % of production) are incompatible with a ~0 µg/L July–August.
- The sim's summer collapse is a model artefact, not a field pattern. Its structure (an algal-only diet with a threshold above Daphnia's, plus interference) guarantees exclusion whenever Daphnia graze the algae below ~0.05 units. That is the same "no trade-off" defect CDC diagnosed for copepods.

### Q2. Copepod nauplii and copepodites as larval food
**Held:**
- **Density and biomass:**
  - Voyageurs NP: nauplii + young copepodites 11.2 ind/L (low-*Bythotrephes* lakes) and 6.9 ind/L (high); 5.0 and 3.8 µg DW/L [repo ZD].
  - Simoncouche: nauplii ≈ 34 % of community biomass at melt [repo CDC].
- **Timing:** *L. minutus* adults lay subitaneous eggs from February; nauplii hatch in March. Summer egg production is "quite low" (Cooley 1973) [repo CDC].
- **Naupliar physiology:**
  - Feeding efficiency is low and thresholds on algae are 0.2–0.5 mg C/L.
  - Summer, cladoceran-dominated lake water did not support *Cyclops* naupliar growth (Santer & Lampert 1995).
  - Naupliar survival to C1 was 40–90 % in calanoids at good food (Hart 1996) [repo CDC].
  - Daphnia reduced nauplii in Dynamite Lake (Vanni 1986) [repo CDC].
- **Production share:** copepods produce only ~19 % of zooplankton production in Mirror Lake [repo ZD]. The naupliar share of copepod production is a gap.

**Pending (sub-search B):** stage dry masses; seasonal naupliar density and biomass in small soft-water lakes; the naupliar share of copepod biomass and production; summer naupliar peaks of *Mesocyclops*, *Tropocyclops* and *Diacyclops*.

**[inf]:**
- In this region's lakes the summer naupliar supply comes from the summer-breeding cyclopoids (*M. edax* ≈ 19 % of crustacean biomass regionally), not from *L. minutus*, which breeds in late winter and spring.
- Voyageurs' 7–11 ind/L ≈ 4–5 µg/L is the only summer anchor. It is far below the ~160–250 plankters/L that pumpkinseed larvae need (Q5), so nauplii alone cannot carry them: rotifers and small cladocerans must supply most of the count.

### Q3. Small cladocerans (*Bosmina*, *Ceriodaphnia*, *Chydorus*, *Diaphanosoma*, *Holopedium*)
**Held:**
- **Regional shares** (LakePulse ≤250 km, % of crustacean biomass):
  - *B. longirostris* 5.0 %;
  - *Diaphanosoma* 4.0 %;
  - *Holopedium* 2.7 % (present in 43 % of lakes);
  - *Bosmina* 6–11 % by lake set; the Atlantic Highlands median is 1.2 µg/L [repo IPP].
- **Densities:** Krankesjön (shallow, TP 42) summer *Ceriodaphnia* 23.4, *Diaphanosoma* 5 and *Bosmina* 2 ind/L. Fish-free enclosures reached 188–745 cladocerans/L [repo ZD].
- **Under ice:** *Bosmina* 8 % of Simoncouche's biomass, up to 8 % egg-bearing in late winter. *Diaphanosoma* and *Holopedium* were absent under ice [repo ZD, CDC].
- **Masses:** *Bosmina* 0.35–3.0 µg at 0.25–0.5 mm. The *Chydorus* and *Holopedium* regressions are in ZD [repo ZD].
- **Development:** *Bosmina* egg development takes 2.4 d at 20 °C and 15.5 d at 4 °C [repo ZD].
- **Ecology:**
  - Smaller cladocerans have higher food thresholds (Gliwicz 1990) [repo ZD].
  - Fish shift communities toward small species in summer (PEG; Ersoy et al. 2019) [repo ZD].
  - *B. longirostris* was in 22 of 27 Finnish DOC lakes (Estlander & Horppila 2023) [repo CDC].
  - High colour shifted communities from *Bosmina* and small copepods toward large Daphnia and *Holopedium* (Wissel et al. 2003) [repo CDC].
  - Soft water favours *Holopedium*, *Bosmina* and copepods over Daphnia (jellification; PEARL) [repo IPP].
  - Cladoceran allochthony is 0.31 (Berggren et al. 2014): they eat bacteria and detritus directly [repo CDC].
  - Plant-associated taxa (chydorids and others) are ~half the biomass of shallow lakes [repo ZD].

**Pending (sub-search B):** *Bosmina* and *Ceriodaphnia* seasonal biomass in comparable lakes; bacterivory and thresholds against Daphnia (DeMott & Kerfoot 1982); how larval-fish models size-structure their prey.

**[inf] — should the model split them from Daphnia? Yes, for the larvae.**
- A 6–8 mm sunfish with a ~0.2–0.3 mm gape can take a 0.25–0.4 mm *Bosmina* (0.35–1.5 µg), a *Chydorus*, or a neonate *Ceriodaphnia*. It cannot take a 1–2 mm Daphnia (5–36 µg).
- The sim's single cladoceran field, with a fixed 0.3 small-animal share (`FRY_DAPH_MIN`), assumes small animals are a constant fraction of Daphnia biomass.
- In the field, the summer small-cladoceran stock *rises* when fish suppress Daphnia; it is not proportional to it.

### Q4. The microbial loop in humic lakes
**Held:**
- Daphnia graze heterotrophic flagellates and ciliates to near-zero growth (Pace & Vaqué 1994).
- Copepods take 20–60 µm ciliates, and the flagellates then rise (Zöllner et al. 2003). The four-link cascade is copepods → ciliates → heterotrophic nanoflagellates → *Synechococcus* (Sommer et al. 2003).
- Calanoids eat oligotrich ciliates, saturating at ~45 µg C/L of *Strobilidium* (Burns & Gilbert 1993).
- Cladoceran clearance falls with ciliate size, copepod clearance rises (Lu & Weisse 2022).
- Allochthony: Cladocera 0.31, cyclopoids 0.18, calanoids 0.16 across 18 Québec lakes (Berggren et al. 2014). Filter-feeding cladocerans rely least on phytoplankton in a brown-water lake (Poste et al. 2019).
- All of the above: [repo CDC].
- **The sim's own microbial loop** (`config.js` MICROBE): a DOM pool in N+P units, decomposed by implicit bacteria at BACT 0.05/s at 20 °C (Q10 2.3, O₂-Monod). It has **no bacterial biomass and feeds no animal**. Humic colour exists only as light attenuation (CHEM3 colour).

**Pending (sub-search A):**
- bacterial biomass and production in small humic lakes;
- bacterial growth efficiency;
- heterotrophic-flagellate and ciliate biomass;
- the share of rotifer and small-cladoceran diets that is bacteria;
- simple model formulations.

### Q5. First-feeding larvae of the sim's species: gape, prey, densities needed, nursery densities
**Already held, not repeated:**
- Keast 1980; Siefert 1972; Graeb et al. 2004; Fulford et al. 2006; Schael et al. 1991; Breck 1997; Hoxmeier et al. 2004; Partridge & DeVries 1999; Welker et al. 1994; the culture density of 10,000 rotifers/L [repo FZC].
- Beard 1982 (bluegill 5–10 mm on nauplii, *Daphnia*, *Bosmina*); Fisher & Willis 1997; McCullough & Hayes 2026 [repo FFE].
- Margulies 1989 (white perch first-feed at 3.4 mm SL on rotifers; 800 vs 50 rotifers/L) [repo LJE].
- Chain pickerel first feeding ~10 mm on *Simocephalus*, *Bosmina* and *Cyclops*; slough cladocerans of 0.2–38 per L did not change stomach counts [repo pickerel_young_of_year.md].
- Smallmouth swim-up at 8.5–9.5 mm [repo LJE].

**New in this pass:**
- **Hart & Werner 1987**, *Environ. Biol. Fishes* 18:41–50, [doi:10.1007/BF00002326](https://doi.org/10.1007/BF00002326).
  - Basis [abstract, as relayed by a search summary of the Springer abstract; the full text is behind a Springer login, and the OpenAlex record has no abstract].
  - Laboratory study of pumpkinseed and white sucker larvae.
  - Mortality was greatest at the switch from yolk to exogenous food. For pumpkinseed it was high after yolk absorption.
  - Growth and mortality were "directly related to prey density".
  - The **minimum density for 10 % pumpkinseed survival was 0.16 plankters/mL (160/L)**, and **significant growth occurred only above 0.25 plankters/mL (250/L)**.
  - The authors attribute the pumpkinseed's vulnerability to small yolk reserves, set against a protracted, intermittent spawning season.
  - The prey type ("plankters") and temperature were not visible.
  - A later review cites white sucker survival of 54 % at ~550 organisms/L/larva/day [snippet].
- **Toetz 1966** (Investigations of Indiana Lakes and Streams). As relayed by a University of Wisconsin digital-collections thesis (record ATD6RKN5AIUJQO8B; probably Beard 1982, Wis. DNR Tech. Bull. 127) [snippet; the original was not read]:
  - bluegill fry mouth gape ≈ **0.20 mm at 6 days** and **0.27 mm at 9 days**;
  - "mouth gape limited the size of food organisms consumed when the fry first leave the nest".
  - Note: Werner 1974's gape equation (G = 0.217 + 0.093·SL mm) [repo FZC] would give ~0.68 mm at 5 mm SL. It does **not** extrapolate to first feeders [inf].
- **Bremigan & Stein 1994**, *CJFAS* 51:913–922, [doi:10.1139/f94-090](https://doi.org/10.1139/f94-090) [abstract].
  - Bluegill of 10–26 mm TL ate progressively larger zooplankton as they grew, and as larger zooplankton became available.
  - Gizzard shad of 18–31 mm took only small prey (<0.60 mm).
- **Martin, Wahl & Czesny 2012**, *Ecol. Freshw. Fish* 21:588–596, [doi:10.1111/j.1600-0633.2012.00580.x](https://doi.org/10.1111/j.1600-0633.2012.00580.x) [abstract]. Yellow perch of 9–15 mm:
  - raising prey from **25 to 150 zooplankton/L** improved foraging success only in larvae **>10 mm**;
  - light of 0.1–60 µmol/m²/s PAR made no difference.
- **Easton 1992**, MS thesis, Virginia Tech, New River WV, [vtechworks 10919/45017](https://vtechworks.lib.vt.edu/handle/10919/45017) [abstract]. Smallmouth bass of 8.5–85 mm:
  - **first foods at ~9 mm TL were chironomids and copepods**;
  - the diet shifted at ~15 mm, attributed to mouth width and fins;
  - mayflies rose with size.
- **Smallmouth bass, older sources** [snippet; the original papers were not read]. A review quotes Wickliff 1920 (Lake Erie) for an almost pure copepod-and-cladoceran diet to 15 mm, and Hayford 1921 for cyclopoids, *Simocephalus* and *Chydorus* in the first weeks.
- **Mills, Confer & Kretchmer 1986**, *TAFS* 115:716–725, [doi:10.1577/1548-8659(1986)115<716:ZSBYYP>2.0.CO;2](https://doi.org/10.1577/1548-8659(1986)115%3C716:ZSBYYP%3E2.0.CO;2) [abstract]. Age-0 Oneida perch:
  - above ~230 lx, the median prey size depended on fish length only (R² 0.65), not on prey density;
  - in dim light they took mainly the larger Daphnia.
- **Garvey, Herra & Leggett 2002**, *Ecol. Appl.* 12:194–205 [abstract]. Lake Opinicon pumpkinseed and bluegill:
  - ~40 % of larvae were in open water by 12 June;
  - larval survival was "generally unrelated to zooplankton abundance" and often highest above 23.5 °C;
  - most fall juveniles came from later hatches.
- **Welker, Pierce & Wahl 1994**, *TAFS* 123:703–717 [abstract]:
  - bluegill larvae selected smaller items in June and larger cladocerans and copepods in July;
  - zooplankton fell sharply after the gizzard shad peak and stayed low while the bluegill were present;
  - bluegill growth tracked prey, but their survival was uniformly high.
- **Lake Michigan nearshore yellow perch** [snippet; the original was not identified with certainty]:
  - June zooplankton of **6–50 ind/L** went with poor larval survival;
  - several nearshore areas averaged **<6 ind/L** in June 2014–16.

**[inf] Sizes and densities in one frame:**
- **Prey widths.** First-feeders with 0.2–0.32 mm gapes take prey of ≲0.1–0.2 mm body width: rotifers, nauplii and small copepodites. Small cladocerans (*Bosmina*, *Chydorus*, neonate *Ceriodaphnia*, 0.25–0.4 mm long) follow from ~8 mm, as the gape passes ~0.4 mm. Daphnia above ~1 mm follow from ~12–15 mm (bluegill 13.5 mm takes a 1.2 mm cladoceran [repo FZC]).
- **Density thresholds as biomass.**

  | Rule | Count | Assumed individual mass | Biomass |
  |---|---|---|---|
  | Hart & Werner 1987 | 160–250 plankters/L | 0.1–0.3 µg (UNVERIFIED rotifer and nauplius masses) | **≈16–75 µg DW/L** |
  | Breck 1997; Hoxmeier et al. 2004 | 20–50 crustaceans/L | 1–2 µg | **≈20–100 µg DW/L** |

  The two rules agree within their uncertainty. The sim's K_FRY 30 µg/L (half-saturation of fry intake) sits at their low end, which is appropriate as a half-saturation. The sim's fault is *what is counted as available to a 6–8 mm larva*, not K_FRY.
- **What a 7-mm sunfish meets in the sim's midsummer** [inf, from `config.js` settings]:
  - rotifers ~0;
  - the cladoceran field at ~0.3–0.5 of its biomass (`FRY_DAPH_MIN` 0.3, ramping from 0.6 to 1.0 cm);
  - the copepod field at `FRY_COPE` 0.3.

  With Daphnia held at 5–15 µg/L by young fish and copepods at 15–40 µg/L (the CDC summer targets), the exposed small prey is ≈ (0.4 × 10) + (0.3 × 25) ≈ 10–12 µg/L, against K_FRY 30. That gives intake ≈ 0.25–0.3 of maximum, which is near or below maintenance. So the stall follows directly from the missing small prey.

### Q6. *Chaoborus* in small humic fish lakes
**Held:**
- **Densities:** Oneida 42/m² at 4 m and 430–627/m² at ≥11 m, >1,000/m² late summer; fishless or anoxic lakes 6,000–30,000/m²; Lac La Belle 7–460/m² [repo ZD, IPP].
- **Maine:** *C. punctipennis* is abundant in all but the deepest (>40 m) Maine lakes (USGS WRI 80-69) [repo IPP].
- **Behaviour and refuges:**
  - Larvae migrate up at night and hide by day; fish take mainly instars 3–4.
  - Anoxic sediment or hypolimnion is the daytime refuge (North Twin Lake) [repo IPP].
  - High colour → more *Chaoborus* (Wissel et al. 2003) [repo CDC].
  - Daphnia helmets track *Chaoborus* + *Leptodora* + young perch (Gélinas et al. 2007) [repo ZD].
- **Hot Brook estimate:** ~50–500/m², with no anoxic refuge, so they hide in the mud and are depressed by fish [repo IPP, inf].

**Pending (sub-search B):** instar prey sizes, daily ration and predation impact on rotifers, nauplii and small cladocerans in humic fish lakes.

---

## 3. What the sim should model [inf — design suggestions; values provisional until sub-searches A and B are appended]

1. **Rotifers persist in summer.**
   - **Target:** a lake-mean summer floor of **≈10–25 µg DW/L** (≈0.25–0.35× a 30–80 µg/L crustacean stock), never below ~5 µg/L in open water.
   - **Under ice:** **≈2–5 µg/L** (Kellicottia ≈12 % of a 10–20 µg/L winter community).
   - **Rates:** realised P/B of **0.17/d at 20 °C and 0.035/d at 4 °C** (Shuter & Ing) as the check on G_R − losses.
   - **Mechanisms**, in order of evidence:
     - **(a) A food channel Daphnia cannot strip.** Today rotifers eat only edible algae, with a threshold above Daphnia's, so exclusion is certain. Give them a food term like the copepods' `LIT_FOOD`:
       - bacteria, small flagellates and detritus, supplied in proportion to the DOM decomposition the sim already computes (MICROBE) and to the weeds (periphyton and detritus);
       - weighted ~0.3–0.5 of their diet (cladoceran allochthony 0.31 is the nearest held number; the rotifer share is pending A).
     - **(b) Lower interference where Daphnia are scarce.** The sim already holds Daphnia off the shore (`SHORE` 0.25), so littoral and weedy cells should hold most of the rotifers in midsummer. Scale `DAPH_INTERF` by local Daphnia biomass (it is already per g/cell); check that the littoral cells actually keep rotifers.
     - **(c) Route `M2_R` into copepod growth** (CDC's recommendation, at 0.3–0.5 assimilation). Then the predation that caps rotifers also feeds the cyclopoids. That makes rotifer abundance and cyclopoid growth coupled, not a sink.
2. **Expose nauplii separately to larvae.**
   - Keep `zooC` as one pool, but give fry access to a seasonal naupliar share: **≈0.3 at ice-out → spring** (Simoncouche ≈34 % at melt) and **≈0.1–0.2 in summer** (cyclopoid breeding). The summer value is [inf, pending B].
   - Fry catch this share at ~0.8–1.0, rather than applying `FRY_COPE` 0.3 to the whole pool.
   - Anchor: summer nauplii + young copepodites ≈ **4–5 µg/L, 7–11 ind/L**.
3. **Split small cladocerans from Daphnia** (a fourth pool, `zooS`: *Bosmina*, *Ceriodaphnia*, *Chydorus*, *Diaphanosoma*).
   - **Masses:** 0.35–3 µg (0.25–0.5 mm).
   - **Growth:** egg development as *Bosmina* (2.4 d at 20 °C).
   - **Threshold: about equal to Daphnia's, ≈1.0–1.2× K_D.** This replaces the 1.2–1.5× first proposed from Gliwicz 1990. DeMott 1982 finds *Bosmina*'s weight-specific ingestion at low food 1.6–4.8× Daphnia's (§5 addendum). The small-cladoceran advantage should come from size-selective fish predation and the low calcium that limits Daphnia, not from food [inf].
   - **Food:** a bacterial and detrital share like the rotifers' (allochthony 0.31).
   - **Losses:**
     - fish capture lower per encounter than for Daphnia (smaller and less visible), so they are released when fish suppress Daphnia (PEG; Ersoy et al. 2019);
     - Daphnia interference and exploitation, the same as for rotifers (Vanni 1986).
   - **Littoral:** chydorids belong in the weeds (`LIT_FOOD`; plant-associated taxa ≈ half of the biomass of shallow lakes).
   - **Targets:** ≈10 % of summer crustacean biomass in open water (LakePulse), more in the weeds. Fry eat them fully from ~0.8 cm. `FRY_DAPH_MIN` then applies only to neonate Daphnia.
4. **Fry access ladder by gape** (replacing fixed shares):

   | Fry length | Prey taken |
   |---|---|
   | 4.5–8 mm | rotifers + nauplii (full) |
   | 8–12 mm | + small cladocerans and copepodites |
   | 12–15 mm | + Daphnia ≤1.2 mm |
   | 30–35 mm | perch prefer Daphnia |

   Smallmouth fry (first feeding ~9 mm) and pickerel (~10 mm) start at the second rung. White perch (3.4 mm SL) and pumpkinseed and yellow perch (5–6 mm) start at the first.
5. **Keep K_FRY ≈ 30 µg/L, applied to the prey a larva can take.** Expected outcome: with (1)–(3), a 7-mm sunfish in July meets ≈ rotifers 10–25 + nauplii ~4–5 + small cladocerans ~3–8 µg/L ≈ **17–38 µg/L** of takeable prey, against ≈10–12 µg/L now. Intake rises to ≈0.4–0.55 of maximum, above maintenance, so growth resumes at a reduced rate. That fits the field, where larval growth tracks prey but survival is often density-independent (Welker et al. 1994; Garvey et al. 2002).
6. ***Chaoborus* (optional, later):** an implicit night-time loss on rotifers, nauplii and small cladocerans, scaled by ~50–500 larvae/m² (fish-suppressed, no anoxic refuge). Rates are pending B.
7. **Validation (multi-seed):**
   - summer lake-mean rotifers 10–25 µg/L;
   - nauplii present in summer;
   - small cladocerans ≈10 % of crustaceans;
   - pumpkinseed larvae growing ≥0.2–0.4 mm/d through 7–12 mm in July (field limnetic bluegill 0.4–0.7 mm/d in their first 14 days, Beard 1982 [repo LJE]; 0.12–0.30 mm/d in food-poor ponds, Partridge & DeVries [repo FZC]);
   - no six-week stall.

---

## 4. Access log
- **Read in full (repo):** the seven companion notes listed above; `src/config.js` PLANKTON, ZOO3, MICROBE and FRY settings; `src/w3/chem3.js` `_zooplankton`.
- **Abstract only:**
  - OpenAlex records for Bremigan & Stein 1994, Martin et al. 2012, Mills et al. 1986, DeVries et al. 1998 (no numbers), Welker et al. 1994 and Garvey et al. 2002;
  - Virginia Tech record for Easton 1992.
- **Search-summary only:** Hart & Werner 1987 (the Springer abstract as relayed); Toetz 1966 via the UW thesis; Wickliff and Hayford via a review; Lake Michigan 6–50/L.
- **Blocked or unreadable** (none bypassed):
  - Springer (login redirect);
  - Ohio State Knowledge Bank (HTTP 403, twice);
  - MSU ETD (access-restricted);
  - NCSU repository (HTTP 503);
  - fisherybulletin.nmfs.noaa.gov (redirected to an index page);
  - the UW digital-collections text page (navigation only).
- **Beard 1982 PDF:** the WebFetch tool cached a copy *outside the repo* (`~/.claude/projects/.../tool-results/`). Its text layer could not be decoded, so it was not used. No PDF was saved in the repo.
- **Search budget:** exhausted mid-pass (shared across agents); nothing was worked around.
- **Other:** no email address was given to any service. No fetched page contained instructions aimed at the agent.

---

## 5. Addendum (2026-10-21): sub-search B — nauplii, small cladocerans, *Chaoborus* (Q2, Q3, Q6)

This sub-search reported after §1–4 were written. The coordinator recorded it here with the sub-search's own tags.

**Coverage.** The sub-search's web-search budget ran out after 13 searches. After that it only fetched records it already knew of, by DOI (OpenAlex or Europe PMC) or by URL; it did not search through any other route. It gave no email anywhere, met no CAPTCHA and bypassed no block.

**Source weight.** The CMU "Zooplankton of the Great Lakes" pages are a teaching site that cites Balcer et al. 1984 and others. Treat them as secondary and coarse.

### Q2. Nauplii and copepodites
- **Pace 1986** (L&O 31:45, [doi:10.4319/lo.1986.31.1.0045](https://doi.org/10.4319/lo.1986.31.1.0045)) [abstract]:
  - 12 Québec sites.
  - Seasonal-mean nauplii, rotifers, ciliates, cladocerans and cyclopoids all rise with TP; calanoids do not.
  - **Microzooplankton (ciliates + rotifers + nauplii) ≈ 40 % of total zooplankton biomass on average.** The share does not change with trophic state: the micro and macro regressions on TP do not differ (r² 0.72 and 0.86).
- **Nauplius masses:**
  - Cyclopoid nauplius W(µg) = 2.5968·L(mm)^1.6349 [snippet — a larval-fish prey review table citing Culver et al. 1985; not verified]. That gives [inf]:

    | Length (mm) | Dry mass (µg) |
    |---|---|
    | 0.1 | 0.06 |
    | 0.2 | 0.19 |
    | 0.3 | 0.36 |
    | 0.4 | 0.58 |

  - A default nauplius dry mass of 0.40 µg [snippet — EPA GLNPO SOP LG403 citing Bottrell et al. 1976 and Dumont et al. 1975; unverified].
  - Culver et al. 1985 ([doi:10.1139/f85-173](https://doi.org/10.1139/f85-173)) [abstract] has the stage tables, but they were not obtained.
- **Adult cyclopoid dry masses** [secondary — NOAA COPEPEDIA citing the Hébert et al. 2016 trait compilation]:

  | Species | Dry mass (µg) | Length (mm) |
  |---|---|---|
  | *Mesocyclops edax* | ≈5.5 (3.8–7.2) | 0.91 |
  | *Tropocyclops prasinus* | 1.5 | 0.55–0.67 |
  | *Diacyclops thomasi* | 4.5 | — |
  | *Cyclops vernalis* | 4.9 | — |

- ***Mesocyclops edax*** [secondary — CMU citing Balcer et al. 1984 and others]:
  - Warm-water: scarce below 8 °C in spring and after the water cools below 13 °C.
  - Bivoltine. It overwinters as diapausing CV and reproduces in spring, so **nauplii come in spring and summer**.
  - About 70 days from egg to adult.
  - Up to 22 ind/L.
  - Omnivore: rotifers, *Diaphanosoma*, *Daphnia* and other copepods.
- ***Diacyclops*** copepodids arrest development when algae are scarce (Hansen & Hairston 1998, [doi:10.1007/s004420050523](https://doi.org/10.1007/s004420050523)) [secondary — CMU citing it].
- ***Chaoborus* on nauplii:** they ate a mean **2 %** of the naupliar standing crop in Eunice Lake, BC (Fedorenko 1975, [doi:10.4319/lo.1975.20.2.0250](https://doi.org/10.4319/lo.1975.20.2.0250)) [abstract].

### Q3. Small cladocerans
- **DeMott 1982** (L&O 27:518, [doi:10.4319/lo.1982.27.3.0518](https://doi.org/10.4319/lo.1982.27.3.0518)) [abstract]:
  - *Bosmina longirostris* selects algae over bacteria: its clearance selectivity, algae : bacteria, is **2.8–13.7**. *Daphnia rosea* does not select.
  - At low food (500–10,000 *Chlamydomonas* cells/mL), *Bosmina*'s weight-specific ingestion is **1.6–4.8× Daphnia's**. At high food the two are equal.
- **Gliwicz & Lampert 1990** (Ecology 71:691, [doi:10.2307/1940323](https://doi.org/10.2307/1940323)) [abstract]:
  - Food thresholds rise from *D. pulicaria* < *D. hyalina* < *D. cucullata*.
  - The order reverses when cyanobacterial filaments are present.
  - The abstract gives no threshold values.
- ***B. longirostris* at the lowest food level** of a life-table study: few matured, all were dead by the 3rd adult instar, and r = −0.136/d [snippet; the source is probably Sci. Rep. 2018, attribution uncertain].
- **Brendelberger 1991** (L&O 36:884, [doi:10.4319/lo.1991.36.5.0884](https://doi.org/10.4319/lo.1991.36.5.0884)) [abstract]:
  - Bacteria-sized particles were retained at 33–154 % of the rate for *Scenedesmus*, across *D. magna*, *D. pulex*, *Simocephalus* and *Diaphanosoma*.
  - Coarser filter mesh means lower retention of bacteria; juveniles retain small particles better than adults.
- **Small-cladoceran species notes** [secondary — CMU pages citing Balcer et al. 1984, Fryer 1968 and others]:
  - ***Bosmina longirostris*:**
    - females 0.4–0.6 mm;
    - 9–12 eggs/female in early June, with numbers rising **7× by mid-July**;
    - eats 1–3 µm algae and protozoa;
    - summer density 1–100/L [inf from 10³–10⁵/m³].
  - ***Chydorus sphaericus*:**
    - 0.3–0.5 mm; lives in the littoral and on the bed, entering the plankton at night;
    - **peaks in August and November**; overwinters as adults and breeds under the ice;
    - 8–15/L, up to 1,400/L near the bottom;
    - eats detritus and diatoms.
  - ***Ceriodaphnia*:**
    - 0.4–1.4 mm; parthenogenetic in summer only, with an optimum at 20–22 °C;
    - *C. lacustris* clears bacteria at 0.31 mL/animal/h;
    - in open water by day, the littoral by night.
- **Jeziorski et al. 2015** (Proc. R. Soc. B 282:20142449, [doi:10.1098/rspb.2014.2449](https://doi.org/10.1098/rspb.2014.2449)) [primary]:
  - **Daphniids are impaired below 1.5–2 mg/L Ca.** Hot Brook's neighbours run 2–4 mg/L.
  - *Holopedium* needs ~1/10 the Ca and ~1/2 the P of daphniids, and its clutches are 2× larger.
  - A Ca drop from 3 to 1 mg/L raises its probability of occurrence by ~34 %.
  - Ontario median density rose from 0.3 to 0.6/L between the 1980s and 2004–05.
  - Its jelly capsule largely protects it from *Chaoborus*. Planktivorous fish eat it "with relative ease"; larval fish were not studied.
- **Hessen et al. 1995** ([doi:10.1139/f95-073](https://doi.org/10.1139/f95-073)) [abstract]: in poor lakes, pH and Ca decide which herbivore species wins.
- **Shuter & Ing 1997** [abstract]: production per unit biomass ranks Rotifera > Chydoroidea (small cladocerans) > Cyclopoida > Calanoida.
- **Vijverberg 1980** (Freshw. Biol. 10:317, [doi:10.1111/j.1365-2427.1980.tb01206.x](https://doi.org/10.1111/j.1365-2427.1980.tb01206.x)) [abstract]:
  - Fits ln D = ln a + b·(ln T)² for the durations of the egg, naupliar and copepodite stages and of adult life.
  - Species: *Bosmina*, *Chydorus*, *Ceriodaphnia*, *Diaphanosoma*, *M. leuckarti* and *Diacyclops*.
  - The coefficients were not obtained; this paper is the best target for them.
- **Models.** Letcher et al. 1996 (CJFAS 53:787, [doi:10.1139/f95-241](https://doi.org/10.1139/f95-241)) [abstract], a generalized larval-fish IBM:
  - Whether a larva dies of starvation or predation depends mainly on its metabolism, its starvation resistance and **the density of the smallest prey type**.
  - Predator size explains 83 % of the variance in survival.
- **Lake Hiidenvesi** (Horppila et al. 2000) [snippet]: with smelt and *C. flavicans* present, cladocerans stay below 50 µg C/L all summer.

### Q6. *Chaoborus*
- **Lencioni 2006** (J. Young Investigators; Campus Lake, IL) [primary, student journal]:
  - Lake: 16 ha, 4.8 m maximum depth, with bluegill and bass.
  - **0.32 larvae/L at midnight, <0.06/L at noon; ~4,100/m² in the sediment.**
  - Field predation **1.7 prey/larva/day**: rotifers 0.90, copepods 0.03.
  - Selectivity: Manly's α for *Keratella* 0.943; *Bosmina*, Daphnia and copepods were not selected.
  - Removal ≈0.54 prey/L/d [inf].
- **Schröder 2013** (PLoS ONE 8:e75839, [doi:10.1371/journal.pone.0075839](https://doi.org/10.1371/journal.pone.0075839)) [primary]:
  - Lake: a fishless bog lake of 0.42 ha, 7 m maximum depth, TP 8.3 µg/L.
  - Autumn *C. flavicans* 0–131 larvae/m³.
  - Over winter, survival fell from 80 % to 56 % as density rose. Small larvae survived 25 % and the largest 85 %.
  - Early instars eat rotifers; later instars eat small cladocerans.
- **Fedorenko 1975** [abstract]: mean share of each prey's standing crop eaten:

  | Prey | Share eaten |
  |---|---|
  | Nauplii | 2 % |
  | *Diaptomus tyrelli* | 3 % |
  | *D. kenai* | 9 % |
  | *Diaphanosoma* | 4 % |

  Seasonal, spatial and size mismatches reduced the predation.
- **Yan et al. 1991** (Ecol. Appl. 1:52, [doi:10.2307/1941847](https://doi.org/10.2307/1941847)) [abstract]: in a fishless acid lake, *Bosmina*'s production rarely exceeded its loss to *Chaoborus*, while *Keratella*'s almost always exceeded what *Chaoborus* ate.
- **Croteau et al. 2003** ([doi:10.1127/0003-9136/2003/0158-0057](https://doi.org/10.1127/0003-9136/2003/0158-0057)) [abstract]: *C. punctipennis* feeds only at night in the water column; *C. americanus* feeds day and night.
- **Crisman & Beaver 1990** ([doi:10.1080/03680770.1989.11898796](https://doi.org/10.1080/03680770.1989.11898796)) [abstract]:
  - The regions studied include **Maine lakes**.
  - *Chaoborus* abundance, mainly *C. punctipennis*, is unrelated to pH or trophic state; depth is the best predictor.
  - The Maine numbers were not obtained.
- **Feeding mechanics** [snippet]:
  - *C. punctipennis* 4th instars pause 2.5 ± 1.0 h to digest each prey (Kauffman, UTK dissertation).
  - Assimilation ≈80 % at 24 °C (SFU thesis).

### What this changes in §3 [inf]
- **The micro share (point 1).** Rotifers + nauplii + ciliates ≈ 40 % of zooplankton biomass (Pace 1986), and about 34 % at ice-melt (Boulianne 2025). Read against a 30–80 µg/L crustacean summer stock, that supports a summer micro pool of roughly **15–50 µg/L**. The §3 rotifer floor of 10–25 µg/L sits inside this range.
- **Small-cladoceran threshold (point 3).** Now ≈1.0–1.2× Daphnia's, not higher (DeMott 1982); point 3 above is edited to match. Their summer success comes from warm-water breeding (*Ceriodaphnia*, *Diaphanosoma*; *Bosmina* ×7 by mid-July; *Chydorus* peaking in August), from size-selective fish predation, and from Ca limiting Daphnia.
- **Nauplii (point 2).** Summer nauplii come from *Mesocyclops* and other warm-water cyclopoids, not from *L. minutus*. If the copepod pool's naupliar share is seasonal, its summer value should be set by cyclopoid breeding above ~8–13 °C. The 0.1–0.2 guess still stands, unmeasured.
- ***Holopedium*.** Ca of 2–4 mg/L sits at the daphniid limit, so a *Holopedium* share is realistic: ~0.3–0.6/L and 1.5–2.2 mm (≈40–120 µg [inf, from the ZD length–weight]). The jelly protects it from *Chaoborus*, and larval fish cannot take it. If it is added, it belongs with the large-cladoceran pool, out of the fry's reach.
- ***Chaoborus* (point 6).**
  - Type: *C. punctipennis*, burrowing in the mud by day.
  - Density: 40–4,000/m² (Campus Lake ~4,100/m² is the upper bound for a shallow fish lake).
  - Ration: ~1–2 prey/larva/day in the field.
  - Prey: rotifers first (*Keratella* strongly selected), then *Bosmina*.
  - Impact: small on nauplii (~2–3 % of standing crop); meaningful only for rotifers and *Bosmina*.
  - Verdict: a second-order term, lower priority than points 1–5.
- **Model support (Letcher et al. 1996).** The density of the *smallest* prey type decides whether larvae starve, which supports a separate micro pool.

### Gaps that remain from sub-search B
- Stage-specific nauplius and copepodite masses (Culver 1985 tables; Bottrell 1976; Dumont 1975).
- The naupliar share of copepod production; freshwater naupliar mortality.
- Stage-duration coefficients (Vijverberg 1980).
- Seasonal densities of nauplii and *Bosmina* in small humic north-eastern lakes.
- The numbers of Gliwicz 1990, DeMott & Kerfoot 1982 and Romanovsky & Feniova 1985.
- The prey groupings of Rose et al. 1999, Hoxmeier and Madenjian & Carpenter.
- Crisman & Beaver's Maine densities.

### Access (sub-search B)
- **Read in full:** PMC3790810 (Schröder 2013); PMC4262185 (Jeziorski 2015); the JYI page (Lencioni 2006); NOAA COPEPEDIA; the CMU Great Lakes zooplankton pages.
- **Abstract or metadata only:** the rest, via OpenAlex or Europe PMC by DOI, with no email given.
- **Blocked, none bypassed:**
  - HTTP 403: SUNY SOAR, Wiley, DOAJ, Notre Dame CURATE, UMN Conservancy.
  - HTTP 429: int-res.
  - UBC Open Collections: block notice.
  - Springer: auth redirect, not followed.
- **Cached PDFs:** three scanned PDFs were cached automatically by the fetch tool, outside the repo; they were not opened or used.
- **No PDF was saved in the repo.** No fetched page contained instructions aimed at the agent.
