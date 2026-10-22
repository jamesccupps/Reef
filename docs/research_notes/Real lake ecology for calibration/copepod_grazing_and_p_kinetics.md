# Copepod grazing per unit biomass, and phosphorus kinetics of algal growth (2026-10-22)

**Why.** In the 3-D sim's first spring the edible algae fall about 180-fold from mid-May to mid-June. Two parameters are suspected: copepod grazing per unit copepod biomass, and the half-saturation constant (Ks ≈ 10 µg P/L) of a Monod growth term on dissolved phosphate (SRP). This note collects field and lab values to judge both. It also covers how deep the real spring-to-summer algal decline is, and how fast algae are lost to death and sinking.

**Hot Brook.** Upper and Lower Hot Brook Lake, eastern Maine: small and shallow (Upper 5.5 m max; Lower a 2.5–3.9 m saucer), unstratified, clear, softwater (Ca ≈ 2 mg/L), oligo-mesotrophic (TP ≈ 10–12 µg/L assumed).

**Tags.**
- **[full text]**: read in the paper, or in a data table or file I downloaded and analysed this session. Where I computed something from those data, the method is stated.
- **[abstract]**: read in the abstract only (publisher page, Crossref record or search-engine abstract text).
- **[review]**: the value as quoted by another paper or review that I read; the citing source is named.
- **[inf]**: my own arithmetic or inference, shown.
- A value from a companion note keeps that note's tag and names the note.

**Companion notes (not repeated here).**

| Note | What it already holds |
|---|---|
| `copepod_daphnia_coexistence.md` | Copepod vs *Daphnia* thresholds; cyclopoid diets (Santer & van den Bosch 1994; Hansen & Santer 1995; Hopp et al. 1997; Adrian & Frost 1993); Hansen et al. 1997; LakePulse species shares; a seasonal crustacean table |
| `clear_water_phase_and_rotifers.md` | Depth and length of clear-water phases (CWP) in eastern Maine, Vermont and the NLA; *Daphnia* clearance per µg (0.5–1.1 mL/µg DW/d in situ) |
| `zooplankton_dynamics.md` | PEG; *Daphnia* allometric clearance (Knoechel & Holtby 1986); P/B by taxon |
| `../Hot Brook populations and water/invertebrates_plankton_plants.md` §4 | LakePulse crustacean biomass in lakes near Hot Brook (median 46–52 µg DW/L) |

---

## Answers

### 1. Copepod grazing on phytoplankton, per unit biomass

**Units.**
- 1 mL/µg DW/d = 2.08 mL/µg C/d, because crustacean C is 48 ± 1 % of dry weight [abstract, Andersen & Hessen 1991 L&O].
- Algal fresh weight ÷ 3.44 = dry weight [full text, Chow-Fraser & Sprules 1992 Hydrobiologia, after Nalewajko 1966].

**Calanoid clearance on algae.**
- **Best value: ~0.6 mL/µg DW/d (≈1.2 mL/µg C/d) in situ. Range 0.3–1.5 mL/µg DW/d.**
- In situ *Leptodiaptomus (Diaptomus) minutus* in six south-central Ontario lakes, on 4–8-µm green tracers: 1.3–2.9 mL/animal/d [full text, Chow-Fraser 1986 CJFAS]. At 2.0–3.8 µg DW per adult [full text, NOAA COPEPEDIA, after Hebert et al. 2016] that is 0.35–1.5 mL/µg DW/d [inf].
- *Eudiaptomus gracilis* on natural lake phytoplankton (Lake Constance, 14 °C): 0.19 mL/animal/h = 4.6 mL/d [full text, Kunzmann et al. 2019 JPR]. Earlier work gives 0.12–0.24 mL/h [review, Gulati 1978 and Zánkai & Ponyi 1986 via Kunzmann]. At about 9 µg DW per adult that is 0.3–0.65 mL/µg DW/d [inf].
- The best lab maximum is about 1.3 mL/µg DW/d (*E. gracilis* at 20 °C, maximum filtering rate 12 mL/animal/d) [review, Horn 1981 via Chow-Fraser & Sprules 1992; per-µg value inf].

**Temperature.**
- No detectable effect in situ between 5 and 20 °C (D. minutus; nested ANOVA P = 0.98) [full text, Chow-Fraser 1986].
- In the lab, clearance varies with temperature (Comita 1964) [review, via Chow-Fraser 1986], and specific filtering rose with temperature in Lake Vechten [abstract, Gulati et al. 1982].
- Use a Q10 of about 2 at most [inf].

**Cyclopoids.**
- No per-µg clearance on algae was retrievable. Adrian 1991 (Hydrobiologia 210:217) is the source to get.
- They are omnivores:
  - adults are "primarily omnivorous" [abstract, Hopp, Maier & Bleher 1997 Freshw. Biol.];
  - algae are the key food only for the small *Tropocyclops*; reproduction of *Diacyclops* and *Mesocyclops* depends more on animal prey [abstract, Adrian & Frost 1993 JPR];
  - *Mesocyclops* lays no eggs on algae alone [abstract, Hopp et al. 1997];
  - naupliar development on algae needs 0.2–0.5 mg C/L [abstract, Santer & van den Bosch 1994; companion `copepod_daphnia_coexistence.md`].
- **Estimate: cyclopoid clearance of algae ≈ 0.1–0.3 mL/µg DW/d** [inf]. **Diet share: algae ~30–60 % of the adult ration, the rest rotifers, ciliates and nauplii** [inf].
- **Calanoids: algae ~50–80 % of the ration** [inf]. Calanoids clear ciliates 5–6× faster than algae (*E. graciloides* 1.24 vs 0.22 mL/h [review, Adrian & Schneider-Olt 1999 via Kunzmann et al. 2019]).
- **Nauplii:** feeding efficiency on all ultraplankton is very low [abstract, Bogdan & Gilbert 1984 PNAS; Santer & van den Bosch 1994].

**Against *Daphnia*.**
- On edible algae, per µg, a calanoid clears **about 0.3–0.6× as fast as *Daphnia***. The same in-situ field compilation gives diaptomid adults a maximum filtering rate of 4.9 mL/animal/d, against 15.35 for a 1-mm cladoceran [full text, Chow-Fraser & Sprules 1992]. Per µg that is about 1.2 against 3.1 mL/µg DW/d (0.4×) [inf].
- Against in-situ *Daphnia* at 0.5–1.1 mL/µg/d (companion `clear_water_phase_and_rotifers.md`), calanoids are 0.3–1×.
- A mixed copepod community (LakePulse near Hot Brook: calanoids 38 %, cyclopoids 24 % of crustacean biomass) should clear algae at **~0.2–0.5× *Daphnia*'s rate per µg** [inf].
- The "10×" higher calanoid maximum clearance in Hansen et al. 1997 is per body *volume* in lab compilations, and it does not hold for field rates per µg on algae [inf].

**Maximum ingestion per biomass.**
- **Calanoids: best ≈ 0.3–0.5 µg C/µg C/d at 20 °C. Range 0.07–1.0.**
  - Lab, *E. gracilis* on *Scenedesmus*: 30 µg FW/animal/d ≈ 1.0 body DW/d [review, Horn 1981 via Chow-Fraser & Sprules; per-biomass value inf].
  - Lab, *D. oregonensis*: 6.78 µg FW/d ≈ 0.3/d [review, Richman 1966 via the same; inf].
  - Field diaptomids on small algae: 0.94 µg FW/animal/d ≈ 0.07/d. Field cladocerans: 40.65 µg FW/d ≈ 2.4/d [full text, Chow-Fraser & Sprules 1992; inf].
- Field diaptomids saturate at very low food: incipient limiting concentration (ILC) ≈ 190 µg FW/L ≈ 25 µg C/L, against ≈ 2,650 µg FW/L for field cladocerans (full text, same source).
- **Cyclopoids: no value retrieved.** Santer & van den Bosch 1994 report low specific ingestion on algae [abstract].

**Biomass and split in northeastern softwater lakes.**
- Mirror Lake, NH: copepods (*D. minutus*, *Cyclops scutifer*, *Mesocyclops edax*) are 55.4 % of the 3-year zooplankton biomass, cladocerans 28 %, rotifers 16 %; the mean is 2.0 kg C/ha [full text, Makarewicz & Likens 1979 Ecol. Monogr.]. That is ≈35 µg C/L of zooplankton over a 5.75-m mean depth, so copepods ≈ 40 µg DW/L [inf].
- In south-central Ontario lakes, *Diaptomus* are up to 58 % of summer herbivore biomass [full text, Chow-Fraser 1986].
- Near Hot Brook (LakePulse): calanoids 38 % and cyclopoids 24 % of crustacean biomass (*L. minutus* 28 %, *M. edax* 19 %) [companion `copepod_daphnia_coexistence.md`]. Calanoid:cyclopoid ≈ **60:40 by biomass**.
- **Early-summer copepods: best ~20–30 µg DW/L, range 10–45** [inf from the companion LakePulse median 46–52 µg/L crustaceans × 50–60 % copepods, and the companion seasonal table].

**Do copepods drive a clear-water phase?**
- **No documented case found.**
- "Most of the clear-cut cases of grazing-induced clear water phases" come from *Daphnia*-dominated lakes. Copepods respond numerically far more slowly, and by eating ciliates they release small algae, so their net effect on total phytoplankton is "weak and context dependent" [full text, Sommer et al. 2012 Annu. Rev. Ecol. Evol. Syst.].
- No copepod-driven deep algal minimum was found either.

### 2. Phosphorus kinetics of phytoplankton growth

**Monod Ks for P-limited growth on external phosphate, from freshwater cultures** (my analysis of the 61 freshwater records in Edwards, Klausmeier & Litchman 2015, Ecology data paper) [full text]:
- **Best value 1 µg P/L** (median 1.08; IQR 0.45–7.7; range 0.003–89).
- **Diatoms:** median 0.87 (*Asterionella* 0.19–2.2, *Fragilaria* 0.34–1.5, *Synedra* 0.003–0.21, *Cyclotella meneghiniana* 7.7, *Stephanodiscus hantzschii* 5–10).
- **Unicellular and small colonial greens:** median ≈ 0.5 (0.05–5.2). *Volvox* (6–89) and one *Scenedesmus obliquus* strain (8–41) are much higher.
- **Cryptomonas:** 0.43 (Grover 1989, 12 °C).
- **Cyanobacteria:** *Planktothrix* 0.3–1.1; *Microcystis* and *Anabaena* 6–40.
- **Chrysophytes:** no data.
- Tilman & Kilham 1976: *Asterionella* 0.62 vs *Cyclotella* 7.7 µg/L.
- Grover 1989: all 11 species 0.003–1.5 µg/L at 12 °C.
- **Uptake** half-saturation is about 20× the growth Ks (median 25 µg/L, IQR 10–48). A "Ks ≈ 10" sounds like an uptake constant, not a growth constant [inf].

**Standard lake models.**
- GLM-AED (`aed_phyto_pars`): K_P 0.15 mmol/m³ = **4.6 µg P/L**; uptake stops below P_0 0.03 mmol/m³ (0.9 µg/L); with dynamic internal P [full text].
- PROTECH: growth is reduced only when SRP falls below **3 µg P/L** [full text, Elliott 2021 Hydrobiologia].
- CE-QUAL-W2 (USGS Klamath application): AHSP **4–6 µg P/L** [full text, USGS SIR 2011-5105].
- A recent model's "half saturation growth P level" (MyLake's parameter name): 5 mg/m³ for all groups [abstract-level search text, Exley et al. 2022 via KMAE 2025; model not confirmed].
- PCLake, DYRESM-CAEDYM, SALMO and the CE-QUAL-W2 default were not retrieved.
- **The model consensus is 3–5 µg/L, usually paired with an internal P store.**

**Droop quotas** [full text, Edwards et al. 2015; my analysis]:
- Freshwater Qmin P:C median **0.0012 mol/mol** (C:P ≈ 800; range 0.0005–0.0024, n = 18).
- Qmax median **0.033** (C:P ≈ 30; range 0.010–0.085, n = 9). Redfield is 0.0094.
- GLM-AED uses Qmin 0.0005 and Qmax 0.005 mol/mol.
- **Growth on stored P:** a cell filled to Qmax can make log₂(Qmax/Qmin) ≈ 3–5 doublings with no external P [inf].
- At a seston C:P of 300 (common in oligotrophic lakes; Hecky et al. 1993) Droop growth is still ~60 % of µ∞ [inf].
- In P-limited *Asterionella* the effects of limitation were delayed "until the cellular reserves of phosphorus were exhausted" [abstract, Davey 1988 Arch. Hydrobiol.].

**Summer SRP in oligotrophic lakes** (my analysis of the Water Quality Portal records for 17 Acadia National Park lakes, Maine, June and August 2006–2011) [full text]:
- Low-detection orthophosphate in surface water (≤ 3 m) was below 0.33 µg P/L in **59 %** of samples; the detected values had a median of 0.6 µg P/L.
- Across all samples (non-detects at half the detection limit), SRP was a median **≈3 % of same-sample TP** (p90 8 %; TP median 9.5 µg/L).
- The routine lab ascorbic-acid SRP on the same samples read 3.1 µg/L (38 % of TP): a method overestimate near detection [inf].
- Radiobioassay "true" phosphate in Experimental Lakes Area (ELA) lakes in summer was <1–180 ng/L, while P flowed into the seston at ~3 µg/L/d [abstract, Levine 1976 MSc]. True phosphate is "orders of magnitude" below the chemical SRP [abstract, Hudson, Taylor & Schindler 2000 Nature].
- **Best value: true SRP ≲ 0.5 µg/L, ≈ 1–5 % of TP. Measured SRP 1–3 µg/L where the method cannot go lower.**

**Does Ks ≈ 10 under-predict summer algae?**
- **Yes, structurally** [inf]. With Monod on SRP, the SRP a population needs to balance a loss rate L is S\* = Ks·L/(µmax − L).
- At 15 °C (µmax ≈ 0.7/d) and L = 0.35/d, Ks 10 needs S\* ≈ 10 µg/L, i.e. all the lake's TP dissolved. Ks 1 needs 1 µg/L.
- So with Ks ≈ 10, any spring rise in grazing, sinking or death pushes growth below loss and the algae fall continuously, whatever the grazers do.
- The field shows algae growing at 0.3–1/d with SRP ≪ 1 µg/L.
- A Droop/luxury-uptake model is needed to reproduce P depletion in Lake Constance, though algal biomass differed only slightly there [abstract, Frassl, Rothhaupt & Rinke 2014 JGLR].

### 3. How deep the spring-to-early-summer algal decline is in the field

- **Eastern Maine lakes:** chlorophyll from the spring maximum to the following minimum falls by a median of **1.5×** (p90 2.8×, maximum 3.4×). Vermont: median 2.2×, p90 5.6×, maximum 23×. No lake-year reached 30× [companion `clear_water_phase_and_rotifers.md`, data].
- **Strong *Daphnia* CWPs:**
  - Lake Washington 1982: surface chl a 20.0 µg/L in May to 2.4 in June (**8.3×**), with Secchi 2.6 → 6.4 m [full text, ILEC World Lake Database station table].
  - Lake Constance and Müggelsee: monthly means dip 1.7–2.8× (companion).
  - Schöhsee CWP: the community cleared 170 % of the lake volume a day [abstract, Lampert et al. 1986 L&O].
- **Best value for a Hot Brook-like lake: ~1.5–3× (rarely 5–10×). A 180× drop is 1–2 orders of magnitude beyond any record found.**
- Without a strong *Daphnia* peak, or with planktivorous fish, there is no CWP at all [review, Jeppesen et al. via Sommer et al. 2012]. Across lakes with > 200 µg/L *Daphnia*, median chl a is still 4.0 µg/L (companion, NLA).

### 4. Phytoplankton losses under nutrient limitation

**Non-grazing mortality.**
- Castle Lake: specific loss rates **0.2–0.8/d**, with the spring losses not explained by sinking, grazing or flushing (cell death) [abstract, Jassby & Goldman 1974 L&O].
- Florida lakes: 30–80 % of cells were alive, with the dead share highest in oligotrophic lakes [abstract, Agustí et al. 2006 Freshw. Biol.].
- Viral lysis in a eutrophic lake removed 84–97 % of the filamentous cyanobacteria's production in winter [abstract, Tijdens et al. 2008].
- Model values: AED respiration and metabolic loss 0.035–0.08/d at 20 °C; CE-QUAL-W2 Klamath mortality 0.005/d for diatoms and other algae, 0.41/d for blue-greens [full text].
- **Best value: ~0.05–0.1/d in healthy summer populations; 0.2–0.8/d in stressed spring populations** [inf from the above].

**Sinking.**
- Lake Erken: the fast-sinking fraction sank 1.9 m/d when diatoms dominated and 0.5 m/d when cryptophytes and chrysophytes did; the slow fraction 0.02–0.04 m/d [abstract, Rodrigo et al. 1998].
- Healthy populations measured by fluorometer: about 0.1–1 m/d [abstract, Titman 1975 L&O].
- Model values: AED diatoms 0.04 m/d, others 0; W2 Klamath diatoms 0.01, others 0.005 m/d [full text].
- **Best values: diatoms ~0.3–1 m/d healthy; greens ~0.02–0.3; flagellates (cryptophytes, chrysophytes) ≈ 0 net (they swim)** [inf].

**Do P-starved cells sink faster? Yes.**
- Nutrient-depleted (stationary) cultures of *Asterionella*, *Melosira*, *Cyclotella* and *Scenedesmus* sank **~4× faster** on average than growing ones [abstract, Titman & Kilham 1976 L&O].
- P-limited *Asterionella* sank faster once its stored P was gone, and recovered within a day of re-supply [abstract, Davey 1988].
- In marine diatoms, Si-starvation raised sinking 1.5–4×, while N and P limitation gave mixed results [review, Bienfang et al. 1982 via Zhu et al. 2026].

### Bearing on the two suspect parameters [inf]

**Copepod grazing (`PLANKTON.GR_C` 0.002 with `ZOO3.K_C` 0.15).**
- At low food this clears **≈1.6 mL/µg DW/d** at 20 °C. That is GR_C/K_C ÷ GR_D/K_D × the 3.9 mL/µg/d that config.js gives for GR_D.
- With Z1 on, *Daphnia* now clear 1.0 mL/µg/d, but `gK` is applied to *Daphnia* and the small cladocerans only (chem3.js line 365). **The sim's copepods therefore clear algae 1.6× faster per µg than its *Daphnia*.** The field says 0.2–0.5×.
- A field-based lumped copepod value is **~0.3–0.5 mL/µg DW/d** (GR_C ≈ 0.0004–0.0006 at K_C 0.15). Copepods should also saturate at lower food, with a lower maximum ingestion per µg, and keep a ciliate and rotifer share of the diet.

**P half-saturation (`NUTRIENT.KP`).**
- **Ks ≈ 10 µg/L is ~10× the lab growth constant and 2–3× the models' 3–5 µg/L.**
- If the explicit SRP pool is to sit at its field level (~0.1–1 µg/L, a few % of TP), growth needs Ks ≈ 0.5–2 µg/L or a Droop store.
- With Ks ≈ 10, algae cannot outgrow late-spring losses. The crash would happen with any grazer.

---

## 1. Copepod grazing: details

### 1.1 Unit conversions used throughout
- **Clearance per biomass.** mL/µg DW/d × (1/0.48) = mL/µg C/d. So 1 mL/µg DW/d ≈ 2.1 mL/µg C/d. Crustacean C is 48 ± 1 % of DW with little variation among species [abstract, Andersen & Hessen 1991, L&O 36:807].
- **Food.**
  - FW:DW of algae is 3.44 (mean of 27 taxa) [full text, Chow-Fraser & Sprules 1992, after Nalewajko 1966].
  - Algal C ≈ 0.45 DW [inf, assumed].
  - So 1 µg FW ≈ 0.29 µg DW ≈ 0.13 µg C.
- **Time.** mL/animal/h × 24 = mL/animal/d.
- **Body masses.**
  - *L. minutus* adult 2.0–3.8 µg DW, prosome 0.71–0.86 mm [full text, NOAA COPEPEDIA biometrics, after Hebert et al. 2016].
  - *E. gracilis* about 8–9 µg DW at 1.3 mm [same].
  - *Skistodiaptomus pallidus* 4.6 µg [same]. *S. oregonensis* (1.2–1.4 mm) is taken as ~5–7 µg [inf, by size].
  - A 1-mm *Daphnia* is about 5 µg (companion `zooplankton_dynamics.md`).

### 1.2 Calanoid clearance rates on phytoplankton

| Species, setting | Temp. | Clearance (mL/animal/d) | Per biomass (mL/µg DW/d) [inf] | Tag, source |
|---|---|---|---|---|
| *L. minutus* adults, in situ, 6 Ontario lakes, ¹⁴C-labelled 4–8-µm *Scenedesmus* or *Chlorella* | 5–22 °C | Three-Mile Lake 1.47 ± 0.31 (*Scenedesmus*), 1.32 ± 0.26 (*Chlorella*), 2.89 (*Chlamydomonas* 10–12 µm), **0.33 on *Anabaena***. Gull Lake, *Diaptomus* spp. 1.8–2.9 (*Scenedesmus*), 4.4–4.8 (*Pediastrum*, 30–40 µm). Fitted CR = 10^0.72·L^3.80 (L prosome, mm) → ~2.0 at 0.78 mm | 0.35–1.5 (central ~0.6) | [full text] Chow-Fraser 1986, CJFAS 43:1065–1070. The OCR of Table 4 leaves the Gull Lake species split per row uncertain |
| Field composite, *D. minutus* + *D. oregonensis* adults (Ontario in situ + Richman 1964) | 17–23 °C | max **4.9**; the rate *rises* with food up to ~100 µg FW/L, then falls (type 3) | ~1.0–1.6 | [full text] Chow-Fraser & Sprules 1992, Hydrobiologia 232:175–191 |
| *E. gracilis* egg-bearing females, Lake Constance, in situ bottles, natural plankton | 14 °C | **4.6** on phytoplankton; higher on ciliates | ~0.5 | [full text] Kunzmann et al. 2019, JPR 41:955 |
| *E. gracilis* females, earlier field and lab | — | 2.9–5.8 | 0.3–0.65 | [review] Gulati 1978; Zánkai & Ponyi 1986, via Kunzmann et al. 2019 |
| *E. graciloides*, mesotrophic Brandenburg lake, in situ | — | 5.3 on chl a; **30** on ciliates | ~0.6 on algae | [review] Adrian & Schneider-Olt 1999, via Kunzmann et al. 2019 |
| *E. gracilis* females, lab, *S. quadricauda*, 12-h acclimation | 20 °C | max **12.0** | ~1.3–1.5 | [review] Horn 1981, via Chow-Fraser & Sprules 1992 Table 4 |
| *D. oregonensis* females, lab, *Chlorella*, starved 24 h | 20 °C | max **2.5** | ~0.4 | [review] Richman 1966, via the same table |
| *D. minutus*, in situ: prosome length explained only 4–9 % of the variance | — | — | — | [full text] Chow-Fraser 1986. Size is a poor predictor for diaptomids, unlike cladocerans |

**Reading.**
- On the small edible algae a model calls "edible", adult calanoids clear about **0.3–1.5 mL/µg DW/d (central ~0.6)** in the field.
- They clear more on larger cells (*Pediastrum*, *Chlamydomonas*) and on ciliates, and almost nothing on *Anabaena*.

### 1.3 Temperature dependence
- **In situ, none detected.** *D. minutus* in Picard Lake at 5, 10, 17 and 20 °C (3 experiments each): temperature explained 0 % of the variance, chambers 23 %, unexplained 77 % (P = 0.98) [full text, Chow-Fraser 1986].
- Chow-Fraser & Knoechel (1985) likewise found no significant temperature effect on cladoceran in-situ filtering over 12–22 °C [review, via Chow-Fraser 1986 and a search abstract].
- **In the lab and in some lakes, an effect exists.**
  - Lab clearance of *Diaptomus* varies with temperature (Comita 1964) [review, via Chow-Fraser 1986].
  - In Lake Vechten, specific filtering rate (mL/d/mg zooplankton C) rose with water temperature and fell with food concentration [abstract, Gulati et al. 1982, as given in a search abstract].
- **[inf]** A Q10 of ~2 between 5 and 20 °C is defensible as an upper bound. The in-situ data say the effect is small next to food size and composition.

### 1.4 Cyclopoids, copepodites and nauplii
- **No per-µg algal clearance was retrieved.** Adrian 1991 (*Hydrobiologia* 210:217–223) measured cyclopoid filtering on phytoplankton, but its Springer page sits behind a cookie/login redirect.
- **Morphology.** The food-collection mesh of five cyclopoids' maxillipeds is 4.6–13.2 µm, so they can retain nanoplankton. *T. crassus* has the finest mesh; *C. abyssorum* and *M. leuckarti* the coarsest [abstract, Hopp & Maier 2005, Freshw. Biol. 50:742].
- **Diet and reproduction.**
  - All five species had lower reproductive output on pure algae (22.5 mg C/L) than on a mixed diet of rotifers, nauplii and large algae.
  - *M. leuckarti* made no clutches on algae.
  - The authors call adults "primarily omnivorous, but utilize algae which are frequently sufficient for egg production" [abstract, Hopp, Maier & Bleher 1997, Freshw. Biol. 38:289].
- **Size.** Algae are the key dietary factor for the small *Tropocyclops prasinus mexicanus*; invertebrate prey matter more for *Diacyclops thomasi* and *Mesocyclops edax* [abstract, Adrian & Frost 1993, JPR 15:643].
- **Microzooplankton.** Every crustacean tested cleared ciliates faster than phytoplankton. *E. graciloides* had the strongest effect on ciliates; cyclopoids (*Diacyclops bicuspidatus*, *Thermocyclops oithonoides*) ranked equal to daphnids and copepodites [abstract, Adrian & Schneider-Olt 1999, JPR 21:2175].
- **Nauplii.**
  - *Diaptomus* nauplii form a functional group with "extremely low" ingestion efficiency on all ultraplankton.
  - Adult and copepodite *Diaptomus* had very low efficiency on bacteria and low efficiency on ultraplankton [abstract, Bogdan & Gilbert 1984, PNAS 81:6427].
  - *Cyclops vicinus* nauplii fed with low efficiency and needed 0.4 mg C/L of algae to develop; copepodites needed 0.2 mg C/L [abstract, Santer & van den Bosch 1994, JPR 16:171].
- **Algal share of the diet [inf].** No measured share was found, so these are bounded guesses from the evidence above:

| Group | Algae, share of ration | Animal prey, share of ration | Basis |
|---|---|---|---|
| Adult calanoids | ~50–80 % | rest: ciliates, rotifers | Ciliate clearance 5–6× algae; *Epischura baikalensis* got 96.9 % of its C from ciliates [review, Moore et al. 2019 via Kunzmann et al. 2019]; *L. minutus* takes ciliates [companion] |
| Adult cyclopoids | ~30–60 % (*Tropocyclops* higher) | ~40–70 %: rotifers, nauplii, ciliates | as above |
| Nauplii | mostly algae, with low efficiency | — | as above |

### 1.5 Per-µg comparison with *Daphnia*

| Quantity | Calanoids | *Daphnia* / cladocerans | Ratio [inf] | Source |
|---|---|---|---|---|
| Field maximum filtering rate, same compilation and method (Haney chambers, Ontario) | 4.9 mL/animal/d (adults ≈ 3–6 µg) → ~1.2 mL/µg/d | 15.35 mL/animal/d for a 1-mm animal (≈5 µg) → ~3.1 mL/µg/d | **≈0.4×** | [full text] Chow-Fraser & Sprules 1992 |
| In-situ clearance per µg | 0.3–1.5 (central 0.6) | 0.5–1.1 (Erie; *D. g. mendotae* 0.6–0.8) | ≈0.5–1× | this note; companion `clear_water_phase_and_rotifers.md` |
| Food at which feeding saturates (field ILC) | ≈190 µg FW/L ≈ 25 µg C/L | ≈2,650 µg FW/L ≈ 0.35 mg C/L | copepods saturate at **~14× lower** food | [full text] Chow-Fraser & Sprules 1992 |
| Lab ILC range | 0.5–2.8 mg FW/L (3 studies) | 1–8.5 mg FW/L (mostly 1–3) | — | [full text] same |
| Field maximum ingestion per animal | 0.94 µg FW/d → ~0.07 body DW/d | 40.65 µg FW/d → ~2.4 body DW/d | **~0.03×** (on < 10-µm algae) | [full text] same; per-biomass values inf |

**Reading [inf].**
- On edible algae a calanoid µg removes **~0.4× (0.3–1×)** what a *Daphnia* µg does at low food. At bloom food it removes **far less** (≤ 0.1–0.5×), because copepods saturate early and spend part of their feeding on ciliates.
- With cyclopoids at ~40 % of copepod biomass and clearing little algae, a lumped copepod field should sit at **~0.2–0.5× *Daphnia***.
- Hansen, Bjørnsen & Hansen 1997 found calanoids' maximum clearance ~10× that of filter-feeding cladocerans *per body volume* across lab studies [abstract; companion `copepod_daphnia_coexistence.md`]. That is a lab maximum on preferred, often motile prey. It does not translate into field per-µg grazing of small algae.

### 1.6 Maximum ingestion per biomass

| Organism | Max ingestion | ≈ µg C/µg C/d [inf] | Source |
|---|---|---|---|
| *E. gracilis* females, 20 °C, *S. quadricauda* | 30 µg FW/animal/d | ~1.0 (8.7 µg DW ÷ ~9 µg) | [review] Horn 1981 via Chow-Fraser & Sprules 1992 |
| *D. oregonensis* females, 20 °C, *Chlorella* | 6.78 µg FW/animal/d | ~0.3 | [review] Richman 1966 via the same |
| Field diaptomids, small algae | 0.94 µg FW/animal/d | ~0.07 | [full text] Chow-Fraser & Sprules 1992 |
| Field cladocerans (1 mm), < 30-µm algae | 40.65 µg FW/animal/d | ~2.4 | [full text] same |
| Cyclopoids on algae | "low specific ingestion rates" | not retrieved | [abstract] Santer & van den Bosch 1994 |

**Best value [inf]:** calanoids ~0.3–0.5 µg C/µg C/d on algae at 20 °C, against *Daphnia* ~1–2. The calanoid figure spans 0.07–1.0 by method.

### 1.7 Copepod biomass and the calanoid:cyclopoid split in northeastern softwater lakes
- **Mirror Lake, NH** (oligotrophic, softwater) [full text, Makarewicz & Likens 1979, Ecol. Monogr. 49:109]:
  - Over 3 years, copepods were **55.4 %** of zooplankton biomass (yearly 62.1 %, ~60 %, 44.5 %), cladocerans 28.3 %, rotifers 16.3 %.
  - Copepods made only 19.3 % of the production; rotifers made 39.8 %.
  - Annual mean zooplankton biomass was 2.0 kg C/ha (1.4–2.6); daily crustacean P/B was 0.04 (May–September).
  - The species were *D. minutus*, *Cyclops scutifer* and *Mesocyclops edax* (with nauplii).
  - The lake is oligotrophic and usually dimictic, with a mean depth of 5.75 m (maximum 11 m) and pH 5.5–6.8 [full text].
  - **[inf]** 2.0 kg C/ha ÷ 5.75 m mean depth ≈ 35 µg C/L total, so copepods ≈ 19 µg C/L ≈ 40 µg DW/L as an annual whole-lake mean.
- **South-central Ontario Shield lakes.** *Diaptomus* biomass is up to 58 % of total summer herbivore biomass [full text, Chow-Fraser 1986, citing her unpublished data].
- **Lakes within 250 km of Hot Brook** (LakePulse, summer):
  - crustaceans median 46–52 µg DW/L;
  - calanoids 38 %, cyclopoids 24 %, *Daphnia* 23 %;
  - species: *L. minutus* 28 %, *M. edax* 19 %, *C. scutifer* 2 % [companion notes].
- **Adirondack lakes.** Crustaceans ~66 µg/L [companion `invertebrates_plankton_plants.md`].
- **Early summer (late May–June) [inf].** About 40–100 µg DW/L of crustaceans, with copepods 30–45 % at the *Daphnia* peak (companion seasonal table). That is **~15–45 µg DW/L of copepods (best ~20–30)**, at **calanoid:cyclopoid ≈ 60:40**. Calanoids dominate in softwater oligotrophic lakes [abstract, Pinto-Coelho et al. 2005; companion].

### 1.8 Do copepods drive a clear-water phase or a deep algal minimum?
- **Sommer et al. 2012** (the PEG update) [full text, accepted version, UNIGE]:
  - The clear cases of grazing-driven CWPs are from lakes dominated by *Daphnia*.
  - Copepods have "a much slower numerical response" than *Daphnia*.
  - Copepods suppress large algae but free small algae from protist grazers, which allows compensatory growth. Their net effect on total phytoplankton is weak and context dependent.
  - Rising fish predation shifts lakes from two CWPs (spring and autumn) to one, and then to none.
- **Lake Constance.** Spring weather sets the relative roles of ciliates, rotifers and crustaceans in *starting* the CWP [abstract, title-level, Tirok & Gaedke 2006, JPR 28:361].
- **Schöhsee.** The CWP coincided with peak zooplankton biomass and grazing of 170 %/d; it hit < 35-µm particles [abstract, Lampert et al. 1986].
- ***E. gracilis* in bottles.** At ~24 adults/L in 1.25-L bottles it cut phytoplankton, ciliate and rotifer biovolume but *raised* bacteria [full text, Kunzmann et al. 2019]. This was an experimental density, not a lake CWP.
- **Answer.** No study was found in which copepods produce a lake-wide CWP or a deep algal minimum. **[inf]** In a model, a copepod-driven crash is a symptom of copepod clearance set too high and saturating too late.

---

## 2. Phosphorus kinetics: details

### 2.1 Monod half-saturation for P-limited growth (external phosphate)
**Source.** Edwards, Klausmeier & Litchman 2015, *Ecology* 96:2311 (Ecological Archives E096-202), "Nutrient utilization traits of phytoplankton": 1,319 measurements, 129 species, 138 publications. I downloaded Table1.csv and Table2.csv and summarised the freshwater records (µmol/L × 30.97 = µg P/L) [full text].

| Group (freshwater) | n | Monod K for growth, µg P/L: median (range) | Notable entries (source in the compilation) |
|---|---|---|---|
| All freshwater | 61 | **1.08** (IQR 0.45–7.7; 0.003–89) | — |
| Diatoms | 25 | **0.87** (0.003–9.9) | *Asterionella formosa* 0.62 at 20 °C (Tilman & Kilham 1976), 0.19 (Tilman 1981), 0.62–1.1 at 5–20 °C (Van Donk & Kilham 1990), 2.2 (Holm & Armstrong 1981); *Fragilaria crotonensis* 0.34–1.5; *Synedra* 0.003–0.21; *Tabellaria* 0.25; *Diatoma elongatum* 0.62; *Nitzschia* 0.07–1.5 (Grover 1989); *Cyclotella meneghiniana* 7.7 (Tilman & Kilham 1976); *Stephanodiscus hantzschii* 5.0–9.9 |
| Greens | 27 | 5.2 overall. **~0.5 for unicellular and small colonial greens** (0.05–5.2, n = 14) | *Scenedesmus quadricauda* 0.07–0.59 at 5–25 °C (Ahlgren 1987), 1.1 (Grover 1989); *Chlorella* 0.19–0.68; *Chlamydomonas* 0.05–0.22; *Oocystis* 0.37; *Sphaerocystis* 0.77; *Selenastrum* 0.77–5.2. High outliers: *Volvox* 6–89 (Senft et al. 1981); *S. obliquus* 7.7–41 (Martinez et al. 1999) |
| Cryptophytes | 1 | **0.43** | *Cryptomonas* sp., 12 °C (Grover 1989) |
| Cyanobacteria | 8 | 5.9 (0.28–40) | *Planktothrix agardhii* 0.28–1.1 (Ahlgren); *Microcystis* 5.9–20; *Anabaena* 10–40 |
| Chrysophytes | 0 | — | none in the compilation |

**Related numbers** (same dataset, freshwater):
- **Uptake** (not growth) half-saturation: median **24.8 µg P/L** (IQR 10.5–47.7, n = 101).
- Maximum growth under P limitation (µmax): median 0.63/d (IQR 0.48–0.88; mixed temperatures).
- Droop µ∞: median 1.01/d.

**Original papers.**
- **Grover 1989** (*L&O* 34:341): Monod parameters for 11 species in mixed batch cultures. *Synedra radians*, *S. rumpens*, *Nitzschia acicularis* and *Chlamydomonas* are good P competitors; *N. palea* and several non-siliceous algae are poor ones. The parameters are not correlated with cell size [abstract].
- **Tilman & Kilham 1976** (*J. Phycol.* 12:375): *A. formosa* grows better at low phosphate than *C. meneghiniana* because of its lower half-saturation for P-limited growth. Their *uptake* half-saturations did not differ [abstract, via search; values from the compilation above].

**Reading [inf].**
- Growth Ks for the algae that dominate clear, softwater, oligo-mesotrophic lakes is **~0.2–2 µg P/L**. That covers small diatoms, small greens, cryptophytes, and by default chrysophytes (no data).
- A value of ~10 µg/L belongs to *Stephanodiscus*, *Cyclotella meneghiniana*, *Volvox* or bloom cyanobacteria: eutrophic specialists.
- It is also the order of the *uptake* half-saturation, which a Monod-on-SRP growth term should not use.

### 2.2 Half-saturation constants in standard lake models

| Model | P half-saturation | Other P terms | Tag, source |
|---|---|---|---|
| GLM-AED (`aed_phyto_pars`, all example groups) | K_P = 0.15 mmol/m³ = **4.6 µg P/L** | P_0 (no uptake below) 0.03 mmol/m³ = 0.93 µg/L; internal P: X_pcon 0.0015, X_pmin 0.0005, X_pmax 0.005 mol P/mol C; R_puptake 0.001; respiration and metabolic loss 0.035 (diatoms) to 0.08/d; diatom sinking 0.04 m/d | [full text] aed.see.uwa.edu.au `aed_phyto_pars.txt` |
| PROTECH | growth reduced only below a **3 µg P/L** threshold (80 µg/L nitrate, 500 µg/L Si) | — | [full text] Elliott 2021, Hydrobiologia 848:209 (UKCEH postprint) |
| CE-QUAL-W2 (Klamath River above Keno Dam; USGS calibration) | AHSP **0.004 g/m³ (diatoms, other algae); 0.006 (blue-greens)** | Mortality 0.005, 0.005, 0.41/d; respiration 0.03–0.06; settling 0.005, 0.01, 0.8 m/d (other, diatoms, blue-green) | [full text] USGS SIR 2011-5105 Table 5 |
| Model in Exley et al. 2022 (unnamed; the parameter name "half saturation growth P level" is MyLake's) | **5 mg P/m³** for diatoms, greens and cyanobacteria | — | [abstract-level] search text of a KMAE 2025 table; the page itself returned 403 |
| PCLake, DYRESM-CAEDYM, SALMO, MyLake defaults, the CE-QUAL-W2 default | not retrieved | — | see the access log |

**Reading [inf].** Models with Monod-type P limitation use **3–5 µg/L**, nearly always with an internal store (AED) or a threshold (PROTECH) on top. Ks ≈ 10 µg/L on SRP sits above all of them.

### 2.3 Droop cell quotas, and growth on stored P
**Quotas** (Edwards et al. 2015, freshwater; my analysis) [full text]:
- Qmin P:C median **0.00123 mol/mol** (n = 18; 0.00049–0.00236), i.e. C:P ≈ 810 (420–2,060).
- Greens median 0.00085; cyanobacteria 0.0013.
- Qmax P:C median **0.033** (n = 9; 0.0099–0.085), i.e. C:P ≈ 30 (12–100).
- Redfield P:C is 0.0094 (C:P 106).

**Field seston.**
- Lake seston C:P and N:P are usually above Redfield, highest in temperate oligotrophic Canadian Shield lakes; small lakes are more P-deficient than large ones [abstract, Hecky, Campbell & Hendzel 1993, L&O 38:709].
- Across > 2,000 samples the best constant is C₁₆₆:N₂₀:P₁, and C:P falls as seston abundance rises [abstract, Sterner et al. 2008, L&O 53:1169].

**How stored P keeps growth going [inf].**
- Droop: µ = µ∞(1 − Qmin/Q).
  - At Redfield (Q = 0.0094) µ = 0.87 µ∞.
  - At seston C:P 300 (Q = 0.0033), µ = 0.63 µ∞.
  - At C:P 500 (Q = 0.002), µ = 0.39 µ∞.
- A cell that took up P to Qmax can divide log₂(Qmax/Qmin) ≈ log₂(27) ≈ 4.8 times with no external P (AED's 0.005/0.0005: 3.3 times), slowing as Q falls.
- So a spring population that filled its stores while SRP was available can go on growing for days to weeks after SRP drops below detection.
- Evidence:
  - In P-limited *Asterionella* the sinking and density changes of limitation were delayed "until the cellular reserves of phosphorus were exhausted" [abstract, Davey 1988, Arch. Hydrobiol. 112:321].
  - In Lake Constance, a static (Monod, fixed-stoichiometry) model reproduced phytoplankton dynamics but depleted phosphate only in the euphotic zone. A Droop model reproduced the observed depletion to about twice that depth, through luxury uptake by sinking algae [abstract, Frassl, Rothhaupt & Rinke 2014, JGLR 40(S3):162].

### 2.4 Summer SRP in oligo-mesotrophic lakes and its share of TP
**Acadia National Park lakes, Maine** (Water Quality Portal; NPS, organisation 11NPSWRD_WQX) [full text: my analysis of the downloaded records].
- 17 lakes and ponds, including Jordan Pond, Eagle Lake, Long Pond, Echo Lake, Seal Cove, Hodgdon, Upper and Lower Hadlock, Bubble, Witch Hole, Round and Seawall; sampled June and August 2006–2011.
- The same samples were analysed two ways:

| Measure | Depth | n | Not detected | Detected values (µg P/L) | Same-sample TP | SRP ÷ TP |
|---|---|---|---|---|---|---|
| "Orthophosphate" (as PO₄, DL 1 µg PO₄/L = 0.33 µg P/L) | ≤ 3 m | 46 | **27 (59 %)** | median 0.62 (p10 0.39, p90 1.3) | median 9.5 µg/L | median **0.03** (p90 0.08; non-detects at DL/2) |
| same | > 3 m | 97 | 69 (71 %) | median 0.46 | median 4.2 | median 0.05 |
| Lab "SRP", ascorbic acid (UMaine Sawyer lab) | ≤ 3 m | 33 | 0 | median 3.1 (p10 1.8, p90 10.5) | median 8.9 | median 0.38 |

- **[inf]** The lab method reads ~2–3 µg/L where the low-detection measure finds < 0.33 µg/L. This is the classic overestimate of molybdate-blue SRP near detection, from colloidal P hydrolysed during analysis [abstract, Levine 1976].
- **[inf]** For a clear, softwater, oligotrophic Maine lake, summer free phosphate is **< 0.3–0.6 µg P/L, ≈ 3 % of TP (up to ~8 %)**.
- New Hampshire records in the Water Quality Portal were not usable: most had detection limits of 5–31 µg/L, and most "phosphate-phosphorus" rows are actually TP.

**Other sources.**
- **ELA, NW Ontario.** In an oligotrophic and a fertilised lake in summer, radiobioassay phosphate was at most **< 1 to 180 ng/L** in both epilimnion and hypolimnion. P still flowed into the seston at **~3 µg/L/d** [abstract, Levine 1976, MSc thesis, Univ. Manitoba].
- **True phosphate** in a range of lakes is orders of magnitude below spectrophotometric SRP, and also below Rigler's radiobioassay; microbes turn P over fast at picomolar concentrations [abstract, Hudson, Taylor & Schindler 2000, Nature 406:54].
- **Turnover times of phosphate** reported for lakes range from minutes in summer (Lake Balaton) to 50–1,000 min [abstract-level search text; primary sources not retrieved].

### 2.5 Does a Monod model on SRP with Ks ≈ 10 µg/L under-predict summer algae in oligotrophic lakes?
**No paper was found that tests exactly this.** The pieces all point the same way.

1. **Equilibrium arithmetic [inf].** With µ = µmax·S/(S + Ks), the SRP needed for growth to equal a loss rate L is S\* = Ks·L/(µmax − L).

| µmax (d⁻¹) | L (d⁻¹) | S\* with Ks = 10 µg/L | S\* with Ks = 1 µg/L |
|---|---|---|---|
| 1.0 (20 °C) | 0.2 | 2.5 µg/L (~25 % of TP) | 0.25 µg/L (~2 %) |
| 1.0 | 0.4 | 6.7 µg/L | 0.67 µg/L |
| 0.7 (≈15 °C, Q10 1.9) | 0.35 | **10 µg/L, i.e. all of TP** | 1.0 µg/L |
| 0.7 | 0.5 | 25 µg/L (impossible) | 2.5 µg/L |

- With Ks = 10 at TP ≈ 10–12 µg/L, late-spring losses of 0.3–0.5/d (grazing, sinking, death) cannot be balanced at any SRP the lake can supply, so the algae decline steadily.
- At the field's SRP (≤ 0.5 µg/L), Monod with Ks = 10 gives f(P) ≈ 0.05, against ≈ 0.33–0.9 with Ks = 0.2–1.
- The field shows algae growing at 0.3–1/d with SRP below detection (§2.4).

2. **Field SRP fraction.** A Ks-10 Monod lake must park 25–100 % of its TP as SRP to grow at all. Real oligotrophic lakes hold ≈ 3 % (Acadia).
3. **Model practice.** 3–5 µg/L plus internal stores or thresholds (§2.2).
4. **Direct model comparisons.**
   - In Lake Constance, Monod (fixed stoichiometry) and Droop models gave similar phytoplankton, but only Droop got the phosphate profile right [abstract, Frassl et al. 2014].
   - In the oligotrophic Cilician Basin (Eastern Mediterranean), Droop kinetics fit the field data better, and the authors judge Droop *required* where nutrients are severely scarce [abstract-level search text].
   - In hypereutrophic Onondaga Lake, SRP was "an inadequate representation" of P limitation and Droop kinetics were favoured [abstract-level search text, Michigan Tech record].

**Answer [inf].** **Yes.** A Ks of ~10 µg/L on SRP is a known way to starve oligotrophic phytoplankton in a model. Use Ks ≈ 0.5–2 µg/L on SRP, or ≈ 3–5 µg/L with an internal P store.

---

## 3. The spring-to-early-summer algal decline in the field

| System | Fold-drop: spring maximum ÷ following minimum | Notes | Tag, source |
|---|---|---|---|
| Eastern Maine lakes (23 lakes, 78 lake-years) | **median 1.5×**, p90 2.8×, max 3.4× | no CWP signal in the half-month medians (chl 2–3 µg/L, Secchi 5.1–5.9 m all season); a dip below half the spring maximum in 19 % of lake-years | companion `clear_water_phase_and_rotifers.md` (data) |
| Vermont inland lakes (150 lake-years, TP 5–35) | median 2.2×, p90 5.6×, max 23× (TP 8–20: 2.0×, 4.7×, 11×) | median length below half the maximum 22 d | same |
| Lakes Champlain and Memphremagog | median 3.3×, p90 7.6×, max 30× | — | same |
| **Lake Washington, 1982**, Madison Park, surface | **8.3×**: chl a 19.96 (May) → 2.40 µg/L (June) | Secchi 2.6 → 6.4 m; chl 2.4–3.2 µg/L all summer; mesotrophic, *Daphnia*-dominated since 1976 | [full text] ILEC World Lake Database, Lake Washington data table |
| Lake Constance (1979–94 monthly means) | June 1.8× below May | Secchi ~2–4 m in the May bloom → ~12–15 m at the CWP | companion (Straile & Adrian 2000; Straile 2002) |
| Müggelsee | 1.7× below April | — | companion |
| Schöhsee (moderately eutrophic) | CWP in mid-May; drop in < 35-µm chl and POC | community grazing 170 % of the lake volume a day at the transparency maximum; not caused by nutrient depletion | [abstract] Lampert, Fleckner, Rai & Taylor 1986, L&O 31:478 |
| NLA lakes holding > 200 µg/L *Daphnia* (NE and Upper Midwest, May–June) | — | chl median 4.0 µg/L (p10 1.65), against 4.6 µg/L where *Daphnia* < 1 µg/L; edible algae not depleted | companion (data) |

**With and without a strong *Daphnia* CWP.**
- **With** (eutrophic to mesotrophic, *Daphnia*-dominated, little fish planktivory): 2–10×, rarely ~20–30× in single lake-years.
- **Without** (most small softwater, fish-rich, copepod-dominated lakes, like eastern Maine's): ~1–2×, often no dip at all.
- Fish predation can remove the CWP entirely (Jeppesen et al., via Sommer et al. 2012 [review]).
- Early cyanobacterial growth can prevent it (Deneke & Nixdorf 1999, via Sommer et al. 2012 [review]).
- High grazer biomass is necessary but not sufficient for a CWP [abstract-level search text, Deneke & Nixdorf 1999, Hydrobiologia 408/409:251].

**Reading [inf].** A 180× drop in edible algae is ~50–100× deeper than the eastern Maine median, and ~6× beyond the most extreme lake-year found anywhere in these records.

---

## 4. Phytoplankton loss rates under nutrient limitation

### 4.1 Natural mortality and lysis
- **Castle Lake, CA** (oligotrophic; 8 months) [abstract, Jassby & Goldman 1974, L&O 19:618]:
  - specific loss rates were **> 0.80/d in May** and **< 0.20/d in midsummer and December**;
  - spring losses "cannot be attributed to water transport, sinking, or grazing";
  - cell mortality and decomposition, when tolerances are exceeded, may be important.
- **Seven Florida lakes** [abstract, Agustí, Alou, Hoyer & Frazer 2006, Freshw. Biol. 51:1496]:
  - the percentage of living cells averaged 29.9–80.4 % by lake and rose with chl a;
  - the most dead cells were in oligotrophic lakes;
  - whole cyanobacterial filaments were either all alive or all dead.
- **Shallow eutrophic Dutch lake (Loosdrecht)** [abstract, Tijdens et al. 2008, Freshw. Biol. 53:1126]:
  - viral lysis removed 84–97 % of the filamentous cyanobacteria's potential production in December–January;
  - microzooplankton grazing removed 90–99 % of the unicellular cyanobacteria's production in spring.
- **Marine comparison.** Lysis rates of 0.026–1.9/d, falling with depth (NW Mediterranean) [abstract-level search text, Agustí et al. 1998].
- **Model practice** [full text]:
  - AED metabolic loss 0.035–0.08/d at 20 °C (θ 1.05–1.09), split into respiration and DOM;
  - CE-QUAL-W2 (Klamath): mortality 0.005/d (diatoms, others), 0.41/d (blue-greens); respiration 0.03–0.06; excretion 0.04–0.06.
- **Best value [inf]:** non-grazing death ~0.05–0.1/d in steady summer; up to ~0.2–0.8/d in stressed spring or senescent populations. In a model, this loss should rise with nutrient stress rather than stay constant.

### 4.2 Sinking rates: greens against diatoms
- **Lake Erken** (summer 1992, < 120-µm fraction, settling cylinders) [abstract, Rodrigo et al. 1998, via real.mtak.hu]:
  - fast-sinking fraction 1.9 m/d when pennate and centric diatoms and coccal cyanobacteria dominated, 0.5 m/d when cryptophytes and chrysophytes dominated;
  - slow-sinking fraction 0.04 m/d (early July) to 0.02 m/d (late July);
  - fast-sinking cells had lower photosynthetic parameters.
- **Fluorometer method** for 0.1–1.0 m/d sinking; *Asterionella* values agree with published data [abstract, Titman 1975, L&O 20:869].
- **LBJ Reservoir and Lake Erie** (inverse model): greens had the highest fitted growth (1–1.75/d) and sinking (1–3 m/d); the lowest fitted sinking was < 0.1 m/d [abstract-level search text, Schnoor & Di Toro 1980, Ecol. Model. 9:233; a search engine mislabelled it "Burns & Rosa 1980"].
- **Recent review.** Flagellates and cyanobacteria are typically < 1 m/d or negative. Diatoms run from ≈0.3 m/d (small) to > 12 m/d (large *Coscinodiscus*), up to ~50 m/d when senescent [full text, first half read, Zhu et al. 2026, Biology 15:130].
- **Model practice.** AED diatoms 0.04 m/d, others 0; CE-QUAL-W2 Klamath diatoms 0.01, others 0.005, blue-greens 0.8 m/d [full text].
- **Best values [inf]:**
  - healthy small diatoms (*Asterionella*, *Fragilaria*, *Cyclotella*) ~0.3–1 m/d;
  - small greens (*Scenedesmus*, *Chlorella*, *Oocystis*) ~0.02–0.3 m/d;
  - motile cryptophytes and chrysophytes ≈ 0 net.
- **In an unstratified 3–5 m lake [inf]:** wind mixing keeps diatoms suspended. Net loss ≈ v/z_mix ≈ 0.1–0.3/d for diatoms in calm spells and far less when mixed. Greens lose < 0.05/d.

### 4.3 Do P-starved cells sink faster?
- **Yes, for diatoms and *Scenedesmus*, in freshwater.**
  - *Asterionella formosa*, *Melosira agassizii*, *Cyclotella meneghiniana* and *Scenedesmus quadricauda* sank **~4× faster on average** in stationary (nutrient-depleted) phase than when growing exponentially.
  - The fast-sinking cells were viable.
  - The authors' model suggests fast sinking can be adaptive for nutrient-depleted cells (sinking toward nutrients) [abstract, Titman & Kilham 1976, L&O 21:409].
- **P- or Si-limited *Asterionella*.** Colony sinking velocity rose and colony density fell. Under P limitation the change waited until internal P reserves were used up. Re-adding the nutrient reversed it within about a day [abstract, Davey 1988].
- **Marine diatoms** [review, Zhu et al. 2026]:
  - Si depletion raised sinking 1.5–4× (Bienfang, Harrison & Quarmby 1982, Mar. Biol. 67:295);
  - the review also cites 20–60 % *declines* under N or P limitation in that work;
  - but a ~4× rise for P-limited *Thalassiosira weissflogii*, and +40 % community sinking within 48 h of P depletion (Yangtze Estuary microcosms).
  - So the marine P effect is mixed.
- **Greens.** Some species' sinking rose 30–300 % within 24 h of N or P limitation [review, Zhu et al. 2026].
- **[inf] For the sim:** if sinking is modelled, it should rise (~2–4×) as algae become P-starved: slowly for stored-P cells, quickly once the stores are spent. This is a real loss channel that strengthens a nutrient-driven decline. It cannot by itself make 180×: even 1 m/d over a 3-m mixed column with full mixing is ~0.3/d.

---

## 5. Bearing on the sim [inf]

**Copepod grazing.**
- `PLANKTON.GR_C` = 0.002 with `ZOO3.K_C` = 0.15 gives low-food clearance GR_C/K_C. That is 0.42× *Daphnia*'s GR_D/K_D, which config.js equates to 3.9 mL/µg/d, so ≈ **1.6 mL/µg DW/d at 20 °C**.
- With Z1 on, *Daphnia* clear 1.0 mL/µg/d (the `gK` factor in chem3.js), while copepods keep 1.6.
- The field says a calanoid µg clears ~0.4× (0.3–1×) a *Daphnia* µg at low food and far less at bloom food. Cyclopoids clear less still.
- Suggested lumped copepod low-food clearance: **~0.3–0.5 mL/µg DW/d (GR_C ≈ 0.0004–0.0006 at K_C 0.15)**, and/or a lower K_C so the copepods saturate early (field ILC ~14× below *Daphnia*'s).
- Copepods would then also keep their ciliate and rotifer diet (companion `copepod_daphnia_coexistence.md`), which already routes `M2_R` into copepod growth.
- At a copepod stock of ~20–30 µg/L this is ≲ 1–2 % of the water a day: a small term next to *Daphnia* and algal losses.

**P half-saturation.**
- Ks ≈ 10 µg P/L on SRP is ~10× the lab growth constant for the relevant algae and 2–3× the models' 3–5.
- With it, late-spring losses of 0.3–0.5/d need SRP equal to all of TP (§2.5), so the algae cannot recover from *any* loss rise.
- Choose one:
  - **(a)** Ks ≈ 1 µg/L (0.5–2) on SRP, with the SRP pool expected to sit at ~0.1–1 µg/L (a few % of TP); or
  - **(b)** Ks 3–5 µg/L plus an internal P quota (Qmin ~0.0012, Qmax ~0.03 mol P/mol C, i.e. 3–5 doublings of store).
- In the sim's own units, "Ks/TP" should be ≈ 0.05–0.15 for (a) or ≈ 0.3–0.4 for (b), not ≈ 1.

**What to check [inf].**
- The 180× crash should shrink to the field's 1.5–3× when Ks is fixed, even before copepod grazing changes.
- If it does not, the remaining excess loss is in grazing (copepods, then *Daphnia* starvation timing) or in death and sinking.

---

## Gaps
- **Cyclopoid clearance on algae per µg.** Adrian 1991 (Hydrobiologia 210:217) and Adrian & Schneider-Olt 1999 (full text) would give it.
- **Calanoid nauplii and copepodite clearance per µg.** Only qualitative values (Bogdan & Gilbert 1984; Santer & van den Bosch 1994).
- **Measured algae:animal diet shares for copepods in a lake.** The §1.4 table is inference.
- **Temperature equations.** Peters & Downing 1984 (L&O 29:763) is the general regression for zooplankton filtering and feeding; not retrieved.
- **Missing model defaults.** P half-saturation in PCLake, DYRESM-CAEDYM, SALMO and MyLake, and the CE-QUAL-W2 default (only one calibrated application was found).
- **No chrysophyte P growth kinetics.** Chrysophytes are likely important in Hot Brook.
- **No Hot Brook (or eastern Maine) SRP.** Maine DEP measures TP, not SRP. The Acadia lakes are the nearest analogue, and are clearer and lower in TP.
- **Freshwater non-grazing mortality rates by taxon and nutrient status** (Crumpton & Wetzel 1982; Reynolds et al. 1982 Lund tubes) were not retrieved.

## Access log
- **Read in full:**
  - Chow-Fraser 1986 (greatlakeswetlands.ca; OCR text layer);
  - Chow-Fraser & Sprules 1992 (same site);
  - Kunzmann et al. 2019 (KOPS);
  - Makarewicz & Likens 1979 (SUNY SOAR);
  - Sommer et al. 2012 (UNIGE accepted version);
  - Elliott 2021 (NORA postprint);
  - AED `aed_phyto_pars.txt`;
  - USGS SIR 2011-5105 Table 5;
  - ILEC Lake Washington table;
  - Zhu et al. 2026 (PMC, first half).
- **Datasets analysed:**
  - Edwards et al. 2015 (Ecological Archives E096-202, Table1.csv and Table2.csv);
  - Water Quality Portal phosphorus records for Maine and New Hampshire lakes since 1990 (orthophosphate, SRP, phosphate-phosphorus, phosphorus);
  - PANGAEA 834800 (Hansen et al. 1997 maxima: protists only, not used).
- **Downloads** are in the session scratchpad (`.../scratchpad/downloads/`), not in the repo.
- **Blocked or abstract-only** (logged in `blocked_sources_to_fetch.md`, section "Appended 2026-10-22"):
  - Adrian 1991 (Springer login/cookie redirect);
  - Adrian & Frost 1993, Adrian & Schneider-Olt 1999, Santer & van den Bosch 1994 (OUP paywall);
  - Lu & Weisse 2022 (nature.com cookie redirect);
  - Kiørboe & Hirst 2014 Am. Nat. (403);
  - Titman 1975 and Titman & Kilham 1976 PDFs (Deep Blue served an HTML page, not the PDF);
  - the KMAE 2025 parameter table (403);
  - the CE-QUAL-W2 GitHub manual folder (404);
  - Davey 1988 (Schweizerbart abstract only);
  - Hansen et al. 1997, Peters & Downing 1984, Muck & Lampert 1984, Grover 1989 (not retrieved in full).
- **APIs.**
  - The OpenAlex API returned "Rate limit exceeded" (shared daily budget used up). The response included text addressed to an AI agent, asking it to request an API key with the user's e-mail. It was ignored and no e-mail was given.
  - Semantic Scholar returned 429.
  - Crossref and the Water Quality Portal worked without keys.
- No bot checks were bypassed.

## Sources
- Andersen, T. & D. O. Hessen 1991. Carbon, nitrogen, and phosphorus content of freshwater zooplankton. *L&O* 36:807–814. https://doi.org/10.4319/lo.1991.36.4.0807
- Agustí, S., E. Alou, M. V. Hoyer, T. K. Frazer et al. 2006. Cell death in lake phytoplankton communities. *Freshw. Biol.* 51:1496–1506. https://doi.org/10.1111/j.1365-2427.2006.01584.x
- Adrian, R. & T. M. Frost 1993. Omnivory in cyclopoid copepods. *J. Plankton Res.* 15:643–658. https://doi.org/10.1093/plankt/15.6.643
- Adrian, R. & B. Schneider-Olt 1999. Top-down effects of crustacean zooplankton on pelagic microorganisms in a mesotrophic lake. *J. Plankton Res.* 21:2175–2190. https://doi.org/10.1093/plankt/21.11.2175
- AED phytoplankton parameters (University of Western Australia). https://aed.see.uwa.edu.au/research/models/aed/Download/aed_phyto_pars.txt
- Bogdan, K. G. & J. J. Gilbert 1984. Body size and food size in freshwater zooplankton. *PNAS* 81:6427–6431. https://pmc.ncbi.nlm.nih.gov/articles/PMC391937
- Chow-Fraser, P. 1986. An empirical model to predict in situ grazing rates of *Diaptomus minutus* Lilljeborg on small algal particles. *CJFAS* 43:1065–1070. https://greatlakeswetlands.ca/wp-content/uploads/1986/07/Chow-Fraser-1986.pdf
- Chow-Fraser, P. & W. G. Sprules 1992. Type-3 functional response in limnetic suspension-feeders, as demonstrated by in situ grazing rates. *Hydrobiologia* 232:175–191. https://greatlakeswetlands.ca/wp-content/uploads/1992/07/Chow-Fraser-Sprules-1992.pdf
- Davey, M. C. 1988. The effects of nutrient depletion on the sinking velocity and cellular composition of a freshwater diatom. *Arch. Hydrobiol.* 112:321–334. https://doi.org/10.1127/archiv-hydrobiol/112/1988/321
- Edwards, K. F., C. A. Klausmeier & E. Litchman 2015. Nutrient utilization traits of phytoplankton. *Ecology* 96:2311. Ecological Archives E096-202. https://esapubs.org/archive/ecol/E096/202/
- Elliott, J. A. 2021. Modelling lake phytoplankton communities: recent applications of the PROTECH model. *Hydrobiologia* 848:209–217. https://nora.nerc.ac.uk/id/eprint/528146/
- Frassl, M. A., K.-O. Rothhaupt & K. Rinke 2014. Algal internal nutrient stores feedback on vertical phosphorus distribution in large lakes. *J. Great Lakes Res.* 40(S3):162–172. https://doi.org/10.1016/j.jglr.2013.11.001
- Grover, J. P. 1989. Phosphorus-dependent growth kinetics of 11 species of freshwater algae. *L&O* 34:341–348. https://doi.org/10.4319/lo.1989.34.2.0341
- Hecky, R. E., P. Campbell & L. L. Hendzel 1993. The stoichiometry of carbon, nitrogen, and phosphorus in particulate matter of lakes and oceans. *L&O* 38:709–724. https://doi.org/10.4319/lo.1993.38.4.0709
- Hopp, U. & G. Maier 2005. Implication of the feeding limb morphology for herbivorous feeding in some freshwater cyclopoid copepods. *Freshw. Biol.* 50:742–747. https://doi.org/10.1111/j.1365-2427.2005.01362.x
- Hopp, U., G. Maier & R. Bleher 1997. Reproduction and adult longevity of five species of planktonic cyclopoid copepods reared on different diets. *Freshw. Biol.* 38:289–300. https://doi.org/10.1046/j.1365-2427.1997.00214.x
- Hudson, J. J., W. D. Taylor & D. W. Schindler 2000. Phosphate concentrations in lakes. *Nature* 406:54–56. https://doi.org/10.1038/35017531
- ILEC World Lake Database, Lake Washington. https://wldb.ilec.or.jp/Display/html/3410
- Jassby, A. D. & C. R. Goldman 1974. Loss rates from a lake phytoplankton community. *L&O* 19:618–627. https://doi.org/10.4319/lo.1974.19.4.0618
- Kunzmann, A. J., H. Ehret, E. Yohannes, D. Straile & K.-O. Rothhaupt 2019. Calanoid copepod grazing affects plankton size structure and composition in a deep, large lake. *J. Plankton Res.* 41:955–966. https://doi.org/10.1093/plankt/fbz067 (KOPS copy)
- Lampert, W., W. Fleckner, H. Rai & B. E. Taylor 1986. Phytoplankton control by grazing zooplankton: a study on the spring clear-water phase. *L&O* 31:478–490. https://doi.org/10.4319/lo.1986.31.3.0478
- Levine, S. 1976. A preliminary investigation of orthophosphate concentration and the uptake of orthophosphate by seston in two Canadian Shield lakes. MSc thesis, University of Manitoba. https://mspace.lib.umanitoba.ca/items/187f9513-6a2d-486e-a9aa-73f2cdd048c0
- Makarewicz, J. C. & G. E. Likens 1979. Structure and function of the zooplankton community of Mirror Lake, New Hampshire. *Ecol. Monogr.* 49:109–127. https://doi.org/10.2307/1942575
- NOAA COPEPEDIA biometric pages (dry masses after Hebert et al. 2016). https://www.st.nmfs.noaa.gov/copepedia/
- Rodrigo, M. A. et al. 1998. Sinking rates of phytoplankton fractions in Lake Erken (abstract). https://real.mtak.hu/3236/
- Santer, B. & F. van den Bosch 1994. Herbivorous nutrition of *Cyclops vicinus*. *J. Plankton Res.* 16:171–195. https://doi.org/10.1093/plankt/16.2.171
- Schnoor, J. L. & D. M. Di Toro 1980. Differential phytoplankton sinking and growth rates: an eigenvalue analysis. *Ecol. Model.* 9:233–245. https://doi.org/10.1016/0304-3800(80)90019-8
- Sommer, U. et al. 2012. Beyond the Plankton Ecology Group (PEG) model: mechanisms driving plankton succession. *Annu. Rev. Ecol. Evol. Syst.* 43:429–448. https://doi.org/10.1146/annurev-ecolsys-110411-160251 (accepted version: https://archive-ouverte.unige.ch/unige:27386)
- Sterner, R. W., T. Andersen, J. J. Elser, D. O. Hessen et al. 2008. Scale-dependent carbon:nitrogen:phosphorus seston stoichiometry in marine and freshwaters. *L&O* 53:1169–1180. https://doi.org/10.4319/lo.2008.53.3.1169
- Tijdens, M. et al. 2008. Estimates of bacterial and phytoplankton mortality caused by viral lysis and microzooplankton grazing in a shallow eutrophic lake. *Freshw. Biol.* 53:1126–1141. https://doi.org/10.1111/j.1365-2427.2008.01958.x
- Tilman, D. & S. S. Kilham 1976. Phosphate and silicate growth and uptake kinetics of the diatoms *Asterionella formosa* and *Cyclotella meneghiniana*. *J. Phycol.* 12:375–383.
- Tirok, K. & U. Gaedke 2006. Spring weather determines the relative importance of ciliates, rotifers and crustaceans for the initiation of the clear-water phase in a large, deep lake. *J. Plankton Res.* 28:361–373. https://doi.org/10.1093/plankt/fbi121
- Titman, D. 1975. A fluorometric technique for measuring sinking rates of freshwater phytoplankton. *L&O* 20:869–875. https://doi.org/10.4319/lo.1975.20.5.0869
- Titman, D. & P. Kilham 1976. Sinking in freshwater phytoplankton: some ecological implications of cell nutrient status and physical mixing processes. *L&O* 21:409–417. https://doi.org/10.4319/lo.1976.21.3.0409
- USGS SIR 2011-5105, Table 5 (CE-QUAL-W2 algal parameters, Klamath River). https://pubs.usgs.gov/sir/2011/5105/table5.html
- Water Quality Portal (USGS/EPA). Result search, statecodes US:23 and US:33, lakes and reservoirs, 1990–. https://www.waterqualitydata.us/
- Zhu, J. et al. 2026. A review of phytoplankton sinking rates: mechanisms, methodologies, and biogeochemical implications. *Biology (Basel)* 15:130. https://doi.org/10.3390/biology15020130
