# The egg stage of the Hot Brook fishes: where eggs lie, how fast they develop, what kills them, and what guarding buys

Researched 2026-10-21 for the 3-D sim, which today turns a spawning straight into a swim-up school. In `fish3.js` `_spawn` / `seedSeason`, larvae = eggs × `sHatch` × `_hatchMul`, at `Lhatch`. This note gathers what an explicit egg stage needs:
- incubation as a function of temperature;
- hatch length and yolk-sac duration;
- egg mortality by cause, with rates;
- what nest guarding changes.

It covers the eleven resident species and the sea-run alewife.

**Already in the repo; cited here, not repeated:**
- [`spawning_on_plants.md`](spawning_on_plants.md):
  - where perch, pickerel, killifish, white perch and the nest builders lay;
  - the perch structure-vs-bare-bed hatch, 98.6 % vs 46.2 %;
  - perch depth vs DOC and wave exposure;
  - pike egg densities and egg → fingerling survival.
- [`fallfish_spawning_brook.md`](fallfish_spawning_brook.md): fallfish timing (15 °C onset, 17 °C optimum), mound nests, and the 138–144 h hatch at 17 °C; dace spawning habitat.
- [`habitat3d.md`](habitat3d.md): the spawning rows (depth, substrate, temperature) for every species.
- [`../Predator winter energetics/nest_guarding_costs.md`](../Predator%20winter%20energetics/nest_guarding_costs.md):
  - guarding durations and stages;
  - the cost to the male;
  - Mackereth's 34 % / 52 % of Opeongo broods kept to the juvenile stage;
  - Gravel's 71 % vs 100 % guard completion;
  - Steinhart 2008's abandonment thresholds;
  - bullhead biparental care.
- [`../Predator winter energetics/esocid_first_year_survival.md`](../Predator%20winter%20energetics/esocid_first_year_survival.md): pike egg → swim-up survival, 3–20 %, from Forney, Franklin & Smith, and Wright & Shoesmith; Inskip's incubation endpoints.
- [`../Hot Brook populations and water/sea_run_alewife.md`](../Hot%20Brook%20populations%20and%20water/sea_run_alewife.md) §2:
  - alewife incubation, days ≈ 25.1·e^(−0.089·T);
  - Edsall's 38 % best hatch;
  - Kellogg's 36-h egg mortality;
  - O₂ and pH limits;
  - yolk-sac 2–5 d;
  - Kissil's and Havey's egg → emigrant survival.
- [`../../reports/Maine lakes ponds and streams.md`](../../reports/Maine%20lakes%20ponds%20and%20streams.md): the Spednic Lake smallmouth model (Shuter et al. 1980 via Dudley & Trial 2014). Spawning when T > 15 °C after 10–150 degree-days > 10 °C. Egg-to-fry mortality 3.0 − 0.2·Tmin at 10–15 °C. About 40 % nest failure.
- Other repo notes used:
  - [`../Maine lakes ponds and streams/centrarchid_percid_esocid_parameters.md`](../Maine%20lakes%20ponds%20and%20streams/centrarchid_percid_esocid_parameters.md): Scott & Crossman hatch times and lengths; Siefert 1974 bass O₂; the Maine black-bass plan.
  - [`../Real lake ecology for calibration/forage_fish_early_life.md`](../Real%20lake%20ecology%20for%20calibration/forage_fish_early_life.md): bluegill egg viability 86.5 % → 57.4 % by day 4; Saprolegnia 38 % (solitary nests) vs 19 % (colonial); crayfish emptying small colonies; Clady 1976's perch egg → 8 mm survival, 1.6–18.4 %.
  - [`../Real lake ecology for calibration/largemouth_bass.md`](../Real%20lake%20ecology%20for%20calibration/largemouth_bass.md): largemouth nest success 0.45–0.77; egg survival 0–94 %; abandonment when the angled male is away.
  - [`../Real lake ecology for calibration/killifish_persistence_and_predators.md`](../Real%20lake%20ecology%20for%20calibration/killifish_persistence_and_predators.md): killifish hatch vs temperature (Penney et al. 2019).
  - [`../Maine lakes ponds and streams/recruitment_compensation_maturity.md`](../Maine%20lakes%20ponds%20and%20streams/recruitment_compensation_maturity.md): the Oneida IBM's 0.11/d egg mortality.
  - [`../Maine lakes ponds and streams/sucker_shiner_bullhead_trout_parameters.md`](../Maine%20lakes%20ponds%20and%20streams/sucker_shiner_bullhead_trout_parameters.md) and [`../Real lake ecology for calibration/bullhead_growth_and_young_white_perch.md`](../Real%20lake%20ecology%20for%20calibration/bullhead_growth_and_young_white_perch.md).
  - [`../Predator winter energetics/pickerel_population_dynamics.md`](../Predator%20winter%20energetics/pickerel_population_dynamics.md) and [`../Predator winter energetics/esocid_larval_energetics.md`](../Predator%20winter%20energetics/esocid_larval_energetics.md).
  - [`../Maine lake shores and catchment/weather_and_catchment_hydrology.md`](../Maine%20lake%20shores%20and%20catchment/weather_and_catchment_hydrology.md) §3: lake levels are highest at snowmelt and fall 30–60 cm through the year.

**Tags.**
- **[primary]**: I or a helper read the full text. That means HTML, OCR text, or a PDF that WebFetch had cached, read locally as text; see the access log.
- **[abstract]**: the abstract or record page only.
- **[secondary — X via Y]**: X as quoted in Y, which was read.
- **[snippet]**: a search-result summary only.
- **[inf]**: my inference or arithmetic.
- **(repo: file)**: already in the repo.

"Calendar" dates use the sim's `SEASON.TEMP_KNOTS` surface curve: 4 °C ≈ Apr 25, 10 °C ≈ May 12, 15 °C ≈ May 26, 20 °C ≈ Jun 15, 24 °C ≈ Jul 30. The days to hatch in Table B integrate each equation along that warming curve, with no weather and no diel swing [inf, script in the scratchpad].

---

## A. Per-species takeaway

| Species | Where and how eggs are laid; spawning °C → sim dates | Incubation (D = days to hatch, T in °C) | Hatch length; yolk-sac stage | Egg mortality by cause (rates) | Guarding; survival |
|---|---|---|---|---|---|
| **Yellow perch** | One gelatinous, accordion-folded ribbon holds a female's whole clutch. It is draped on rigid dead structure; in brown water mostly at 0–1 m (repo: spawning_on_plants §1). Eggs ≈ 1.6–1.8 mm, ≈ 280 per g of ribbon [inf from Linkenheld 2019, primary]. Spawns at 7–13 °C → **May 3–19** | **D50 = 97.0/(T − 4.9)** (Guma'a 1978, Eurasian perch) [abstract]. Hatchery yellow perch run ~20 % slower: 10–11 d at 16 °C (Linkenheld) [primary]. On the calendar: **10–18 d** | ≈ 5.0–5.3 mm (Linkenheld [primary]; repo). Yolk ~5 d (repo) | **Fish predation ≈ 0**: ribbons were refused by eel, white sucker, bullhead, perch and sticklebacks (Newsome & Tompkins 1985) [abstract]. **Wind**: one storm day stranded ~1 % of Oneida Lake's egg potential (Clady & Hutchinson 1975) [abstract]. Bare bed 0.47× (repo). High mortality below 8 and above 12 °C (Guma'a) [abstract]. A heat shock to 20 °C for 16 h left 19.9 % viable vs 49.6 % after a cold shock (Linkenheld) [primary]. Field viability "generally over 95 %" (Clady 1975) [secondary] | None |
| **White perch** | Adhesive, demersal, 0.86–0.92 mm eggs, broadcast over any firm bottom at 0–1.5 m or up streams; ~15 °C → **May 26–Jun 5** | **D(h) = 686.99·e^(−0.1402·T)**, fitted over 13–21 °C (Margulies 1989) [primary]: 3.5 d at 15 °C, 2.6 d at 17 °C | 2.4–2.8 mm SL. Yolk-sac **Dy(h) = 1745.3·e^(−0.1863·T)**: 4.4 d at 15 °C. First feeding at 3.45 mm SL [primary] | Hatch ~80 % at 13 °C, ~60 % at 17 °C, ~20 % at 21 °C [primary]. A sudden 2–3 °C drop kills some eggs, a 4–5 °C drop is lethal, and <10 °C causes significant mortality [secondary — Auclair 1960 / Hardy 1978 via Fischer et al. 1989]. Silt layer > 1.1–2 mm: 100 % dead; < 0.45 mm: no effect [abstract/primary] | None. White perch are themselves major egg predators |
| **Sea-run alewife** | Repo §2: night spawning at 0.15–3 m over any substrate; eggs adhesive < 24 h, then drift; 10.5–21 °C → **May 19–Jun 15** | Repo: 25.1·e^(−0.089·T) → **4–7 d** | Repo: 2.5–5 mm; yolk 2–5 d. Hatch spread within a batch: ~13 d at 7.8 °C, 2–3 d at 20–21 °C (Edsall 1970) [abstract] | Best lab hatch 38 % at 17.8 °C (repo). Eggs eaten by yellow and white perch (repo). No field rates | None |
| **Smallmouth bass** | Cleaned gravel/rubble nest at 0.5–3 m, near cover. Eggs 1.8–2.5 mm, adhesive; ~6,300 per nest (Nebish) [secondary]; 7,437 (Waugoshance, n = 2) [primary]. 15–19 °C → **May 25–Jun 10** | **D ≈ 32.2/(T − 9.6)** [inf; fit to Webster 1948: ~2¼ d at 23.9 °C, ~10 d at 12.8 °C, abstract]. ~4 d at 15–18 °C (Turner & MacCrimmon 1970) [abstract]. Calendar **3.5–5 d** | 5.6–5.9 mm; swim-up at 8.7–9.9 mm (repo), 8–11 d after hatch (Turner & MacCrimmon) [abstract] | **Whole-nest failure 14–55 % in lakes.** Neves 1975 (South Branch Lake, Maine): **67 % (1971) and 77 % (1972)** of nests succeeded; a water-level drop was the main cause in 1971 [abstract]. Latta (Waugoshance): 45–46 % of nests lost even in stable years. A drop to 10–10.6 °C emptied every nest within 2 d [primary]. **Inside successful nests**, egg → black fry is ~28 % (2,054 fry from 7,437 eggs) [primary]; 26–33 % (Clady 1975) [secondary]. Fungus killed whole nests with the male present (Saunders 2006) [primary]. Storm wind hours (Goff 1986) [abstract] | The male guards ~4 weeks (repo). An **unguarded nest is emptied in minutes**: up to 60 % of nests were raided within 1 min of male removal, > 90 % by *Lepomis* (Gravel & Cooke 2009) [secondary]. Angled nests succeeded 11–14 % vs 30 % for controls (Lake Erie) [abstract]. Natural abandonment 13–21 % [abstract] |
| **Pumpkinseed** | Colonial nests at < 1 m on sand or gravel. Eggs ~1 mm, amber, adhesive [snippet]. 1,500–15,000 fry per nest [snippet]. 17–26 °C → **Jun 3–Aug**, repeated broods | ~3 d at 28 °C [secondary — S&C via FishBase]; 3–5 d (repo); up to 11 d in cold weather [secondary]. Teletchea for a 1-mm egg: 3.3 d at 18 °C, 2.3 d at 22 °C [inf]. Bluegill surrogate (repo) | ~5 d on yolk [secondary] | Wind turbulence was the only important physical factor; nest success was lower in a planktivore-crowded lake (Popiel et al. 1996) [snippet]. Crayfish delayed reproduction (Dorn & Mittelbach 2004) [abstract]. Snapping turtles ate eggs in 2 of 9 nest inspections, and all 3 revisited nests were abandoned within 48 h (Studden et al. 2025) [primary]. Fungus as in bluegill (repo) | Male guards ~6 d at 21 °C (repo) |
| **Redbreast sunfish** | Solitary nests dug through plant mats to sand or gravel, ~43 cm deep, near rock or wood (repo). Eggs ~2 mm (COSEWIC) or 1.2 mm ova (Sandow 1975) [secondary]. ~20 °C → **mid-Jun–early Jul** | No measured data. Popular sources say 3–5 d. Teletchea for a 1.5-mm egg: 3.5 d at 20 °C [inf] | 4.6–5.1 mm (Buynak & Mohr 1978) [abstract]; 1–2 weeks in the nest (repo) | Stream: May nests all lost to floods; 30 of 51 later nests produced swim-up fry, 33 % overall (Lukas & Orth 1993) [abstract]. Eggs eaten by cyprinids and sunfishes [secondary — S&C via COSEWIC] | Male guards. 2–6 females per nest; > 90 % sired by the guard [abstract] |
| **Chain pickerel** | Adhesive 2–3 mm eggs scattered on dense, short (dead) vegetation at ≤ 1 m; no care (repo). 6–11 °C → **May 1–14** | **D ≈ 86.7·e^(−0.203·T)** [inf; fit to 2.5 d at 17.2 °C, 5 d at 14.4 °C and 11 d at 10 °C — Underhill 1948 / Jones et al. 1978 via FishBase, secondary]. Pike: 26 / 17 / 12 / 9 / 6 / 5 d at 6 / 8 / 10 / 12 / 14 / 16–20 °C [secondary — Swift 1965, Walker 1968 via Inskip 1982]. Calendar **7–12 d** | 5–7.9 mm, mode 7.2 [secondary — Jones et al. 1978 via FishBase] (repo: 4.2–7.0). Yolk 6–8 d, hanging on plants (repo) | **~10 % of eggs eaten by other fishes** (suckers, chubs, perch) [primary — Kendall 1917]. Storms wash eggs ashore [primary — Kendall]. Pike: normal-hatch TL50 6.9 / 19.2 °C (Hokanson et al. 1973) [abstract]. A sudden drop below 10 °C, or a long spell near 5 °C, kills ~100 % of early embryos; silt at 1 mm/d kills ≥ 97 % (Hassler 1970) [abstract]. 33 % O₂ saturation is inadequate (Siefert et al. 1973) [abstract]. Hatch 18 / 56 / 66 % at 3 / 6 / 10 °C (Bondarenko 2015) [abstract]. Pike egg → 0+ 0.037 % with natural level swings vs 0.399 % with a controlled level (Massé 1993) [abstract] | None |
| **Brown bullhead** | A spongy, adhesive egg mass of several hundred to > 1,000 eggs (~3 mm) in a saucer or burrow under roots, logs or banks, at 0.2–1.2 m [primary — Armstrong & Child 1962; Breder 1939]. 18–24 °C → **June** | Mean **8 d at 21.3 °C** (6–10), 5 d at 25 °C [primary — Breder 1939; secondary — NAS/NAE 1972]. Fit **D ≈ 8·e^(−0.127·(T − 21.3))** [inf]; Blumer's mean of 5.6 d (repo) implies ~24 °C | **7–8 mm** (Eycleshymer 1901) [primary]. Swim-up 5–7 d after hatch; ~15 d (10–26) on the nest (Breder 1939) [primary] | **All eggs die in < 24 h in still water**, so they need parental fanning and agitation (Breder 1935; Armstrong & Child 1962) [primary]. Mould spreads from dead eggs to neighbours [primary]. Parents eat eggs if disturbed [primary]. Minnows and sunfishes are the main nest intruders [abstract] | Biparental (repo). **With both parents removed, broods never reached the larval stage** (Blumer 1986) [abstract] |
| **White sucker** | Eggs scattered over brook gravel at < 30 cm in fast riffles. 2 mm laid, 3 mm water-hardened, > 90 % fertilized (Stewart 1926) [primary]. 710 eggs/m² in a riffle vs 0.5/m² in quiet water [abstract]. 10–15 °C → **May 12–25** | 21 d at 10.3 °C, "18–20 d normal" (Stewart 1926) [primary]; 16 d in the field (Corbett & Powles 1983) [abstract]. Fit **D ≈ 200·e^(−0.232·T)** [inf]. Normal hatch high at 9–17.2 °C, best at 15.2 °C, few at 6.2 °C, none at 24.1 °C (McCormick et al. 1977) [abstract]. Calendar **7–11 d** | ~8 mm [secondary — Reighard 1915 via Stewart]. Yolk 6–8 d, to 11 mm [primary]. Larvae drift 27–29 d after spawning [abstract] | **No egg predation detected** where walleye eggs at the same site were eaten heavily (Corbett & Powles 1986) [abstract]. Egg → migrant fry ~3 % [secondary — S&C via Dahlberg 1979]. Larval deaths are high at 10 °C [abstract]. pH ≤ 5.8 effects (Trojnar 1977) do not apply at Hot Brook's pH 6.6–7 [abstract] | None |
| **Fallfish** | Eggs buried in a pebble mound in slow water ≤ 0.5 m (repo). 15–19 °C → **May 25–Jun 12** | 138–144 h at 17 °C (repo) ≈ **100 °C·d above 0** [inf]. Creek chub: 6 d at 18.3 °C (Buynak & Mohr 1979) [abstract]. Calendar **5–6.5 d** | 6.8–7.5 mm [abstract]. Yolk 5–7 d, absorbed at ~9–9.7 mm [secondary/abstract] | No rates. Burial in the mound is the protection: associates' eggs are 84–97 % of the eggs in host *Nocomis* mounds [secondary]. Fallfish ≥ 100 mm eat exposed eggs (Johnson et al. 2009) [abstract] | None after the mound is capped |
| **Blacknose dace** | Eggs in gravel depressions or buried in finer gravel, in riffles < 25 cm at 20–45 cm/s (Bartnik 1970) [primary]. 15–22 °C during incubation [primary — Trial et al. 1983 HSI] → **mid–late Jun** | 5–8 d (aquarium) [secondary]. Longnose dace: 6 d at 18 °C, 7–10 d at 15.6 °C; speckled dace: 6–7 d at 18 °C, 4–5 d at 24 °C [secondary]. ≈ **100–115 °C·d above 0** [inf] | ~5 mm (repo, Traver 1929); congeners 5.9–6 mm. Embryos stick to the gravel 7–10 d and emerge at ~8 mm (congeners) [secondary] | Adults eat eggs (aquarium) [secondary]. No field rates | None |
| **Banded killifish** | Single eggs, 2.0–2.2 mm, each on an adhesive thread tangled in plants (*Potamogeton*), < ~1 m (repo). 5–10 eggs per clasp, ~50 per session, again within ~2 weeks [secondary]. ≥ 19–21 °C → **late Jun–Aug** | **11–12 d at 22–27 °C** [secondary — Cooper 1936 via Grant & Lee 2004]; 12.5 d at 22 °C (repo). ≈ **150 °C·d above 10 °C** [inf]. Calendar **11–13 d** | 5.3–6.4 mm TL [secondary — Hardy via Shute et al. 1983]; 7.1 mm SL (repo) | Temperature: 0 % hatch at 10 °C, ≤ 10 % at 16 °C (repo). Adults eat eggs (aquarium) [secondary]. No field rates | None |

### B. Incubation on the Hot Brook calendar [inf]
Each species' equation is integrated forward from the day the surface first reaches its spawning temperature. The "constant" column is D at that spawning temperature held fixed; the warming water shortens it.

| Species (equation) | Spawning at | First such day | D at that constant T | Hatch on the warming calendar |
|---|---|---|---|---|
| Chain pickerel (86.7e^−0.203T) | 8 / 11 °C | May 6 / May 14 | 17.1 / 9.3 d | 11.0 / 7.0 d (May 17 / 21) |
| Yellow perch (97/(T−4.9)) | 7 / 10 / 13 °C | May 3 / 12 / 19 | 46 / 19 / 12 d | 17.9 / 12.9 / 9.9 d (May 21 / 24 / 29) |
| White sucker (200e^−0.232T) | 10 / 13 °C | May 12 / 19 | 19.7 / 9.8 d | 11.4 / 7.2 d |
| Alewife (25.1e^−0.089T) | 13 / 16 / 20 °C | May 19 / 29 / Jun 15 | 7.9 / 6.0 / 4.2 d | 7.1 / 5.6 / 4.1 d |
| White perch (Margulies) | 15 / 18 °C | May 25 / Jun 5 | 3.5 / 2.3 d | 3.3 / 2.2 d |
| Smallmouth bass (32.2/(T−9.6)) | 15 / 18 °C | May 25 / Jun 5 | 6.0 / 3.8 d | 5.2 / 3.6 d |
| Fallfish (100/T) | 15 / 18 °C | May 25 / Jun 5 | 6.7 / 5.6 d | 6.3 / 5.4 d |
| Brown bullhead (8e^−0.127(T−21.3)) | 18 / 21 °C | Jun 5 / 22 | 12.2 / 8.3 d | 10.4 / 7.8 d |
| Pumpkinseed (Teletchea, 1 mm) | 18 / 22 °C | Jun 5 / 30 | 3.3 / 2.3 d | 3.2 / 2.3 d |
| Blacknose dace (108/T) | 19 / 21 °C | Jun 9 / 22 | 5.7 / 5.1 d | 5.5 / 5.1 d |
| Banded killifish (150/(T−10)) | 21 / 23 °C | Jun 22 / Jul 10 | 13.6 / 11.5 d | 12.8 / 11.2 d |

What the table says:
- The **cold spawners are the long-exposure species**. Perch eggs sit 10–18 d, and pickerel and sucker eggs 7–12 d, in water that is still warming through 7–14 °C, which is where cold fronts, wind and stranding act.
- The **centrarchids and white perch are exposed for only 2–6 d** as eggs. Their risk is concentrated in the guard (desertion) and in the nest stage after hatch.

---

## 1. Findings by species (new to the repo)

### 1.1 Yellow perch
- **Incubation model.** Guma'a 1978 (*Freshw. Biol.* 8:221–227, [doi:10.1111/j.1365-2427.1978.tb01443.x](https://doi.org/10.1111/j.1365-2427.1978.tb01443.x)) [abstract, read via Crossref]:
  - Eurasian perch at 10 constant temperatures.
  - The heat sum to hatching was constant: **91.4 °C·d above 4.6 °C for 10 % hatched, 97.0 above 4.9 °C for 50 %, and 101.0 above 5.0 °C for 90 %**.
  - Mortality peaked in the eyed, pre-hatch stage, was "directly related" to incubation temperature, and early-stage mortality was high below 8 °C and above 12 °C.
  - This confirms the repo's unverified SRAC "95–108 °C·d above 5 °C".
- **Yellow perch checks against Guma'a.**
  - 27 d at 8.3 °C (repo), against a predicted 28.5 d [inf].
  - Linkenheld 2019 (UW–Milwaukee MS thesis, [dc.uwm.edu/etd/2215](https://dc.uwm.edu/etd/2215)) [primary; the PDF WebFetch cached, read locally]:
    - 16 °C constant: hatch began 10 d after fertilization and finished at 11 d.
    - 12 °C rising 1–2 °C every 3–4 d: 12–13 d.
    - A cold shock (10 °C for 16 h on day 6) delayed hatch to 13 d. Guma'a predicts 8.7 d at 16 °C, so yellow perch here ran ~20 % slower [inf].
  - 11–13 d at 15 °C [secondary — Hardy 1978 via Fischer, Hall & Sullivan 1989, [govinfo CZIC-sh171-s89-1989](https://www.govinfo.gov/content/pkg/CZIC-sh171-s89-1989/html/CZIC-sh171-s89-1989.htm)].
  - Field, Lake Lacawac (DOC 4.7 mg/L): surface eggs (mean 13.3 °C, warming 0.40 °C/d) hatched in 9 d; deeper eggs at 7.7–11 °C took 19–35 d (Huff et al. 2004) [abstract].
  - "2 d at 18.2 °C … 30.5 d at 3.3 °C" attributed to Hokanson & Kleiner 1974 [secondary via Fischer 1989]. This is inconsistent with all other points, possibly a hatch span or a rising-temperature regime; it is not used.
- **The eggs** (Linkenheld [primary]):
  - Five female ribbons (293–326 mm females) were split into 72.5–90.9 g sections holding 18,500–30,960 eggs each, i.e. ≈ 280 eggs/g of ribbon [inf].
  - Egg volume 2.1–3.2 mm³, i.e. Ø ≈ 1.6–1.8 mm [inf, sphere].
  - Hatch length 4.96–5.30 mm.
  - At the end of incubation, viable larvae were 19.9–49.6 %, dead eggs 49–65 % and failed (eyed but dead) larvae 0.8–22.9 % by treatment. Hatchery yields are lower than field viability.
- **Temperature shocks** (Linkenheld [primary]):
  - The heat shock (20 °C for 16 h on day 6) gave the fewest viable larvae (19.9 %) and wiped out three replicates.
  - The cold shock (10 °C for 16 h) gave the most (49.6 %).
  - Perch embryos tolerate a cold snap better than a warm spell.
  - VanDeHey et al. 2013 (*J. Appl. Ichthyol.* 29:364) [abstract]: yolk-sac fry survived −4 and −8 °C drops (90 % control, 91 %, 97 %).
- **Wind** (Clady & Hutchinson 1975, *TAFS* 104:524–525, [doi:10.1577/1548-8659(1975)104<524:EOHWOE>2.0.CO;2](https://doi.org/10.1577/1548-8659(1975)104%3C524:EOHWOE%3E2.0.CO;2)) [abstract]: after one day of high winds, a single windrow on Oneida Lake's windward shore held "almost one percent of the estimated egg potential". Damage was worst over rubble. This is the number the repo lacked.
- **Predators refuse the ribbon** (Newsome & Tompkins 1985, *Can. J. Zool.* 63:2882, [doi:10.1139/z85-430](https://doi.org/10.1139/z85-430)) [abstract]:
  - In feeding trials, eel, white sucker, brown bullhead, yellow perch, and three- and nine-spined sticklebacks never ate egg masses, though they ate other food.
  - Eels and suckers caught at spawning sites held none.
  - The ribbon is "unpalatable rather than toxic".
- **Field egg viability** "generally over 95 %" (Clady 1975) [secondary — via Dahlberg 1979, *Mar. Fish. Rev.* 41(3):1–12, [PDF](https://fisherybulletin.nmfs.noaa.gov/sites/default/files/pdf-content/MFR/mfr413/mfr4131.pdf), read locally]. Dahlberg credits "the unique egg mass envelopes".
- **Acid** [secondary — via Fischer 1989]. Not a Hot Brook risk at pH 6.6–7.0 [inf].
  - Hatch was 86.2 % in a pH 6.6 lake vs 3.8 % at pH 5.0 (Schofield & Driscoll 1987).
  - Lab baseline loss was 40–45 % over 15 d at pH 5.5–7.0 (Janicki & Greening 1988).
- **Suspended sediment** [secondary — Schubel et al. via Fischer 1989]: < 500 mg/L no effect (100–500 mg/L delays hatch 6–12 h); 1,000 mg/L may reduce hatch.
- **Oxygen.** Alam et al. (WAS abstract): all embryos arrested or dead within 43 h at 3–4 mg/L and 16.8 °C; < 3.5 mg/L is strongly harmful [abstract; the authors' figures look internally inconsistent]. No measurements of O₂ inside a ribbon were found.

### 1.2 White perch
- **Margulies 1989** (*Fish. Bull.* 87:63–72, [PDF](https://fisherybulletin.nmfs.noaa.gov/sites/default/files/pdf-content/1989/871/margulies.pdf)) [primary, read locally]. Potomac and Patuxent stock, at 13, 17 and 21 °C:
  - Egg stage: **DE (h) = 686.990·e^(−0.1402·T), r² 0.99**.
  - Yolk-sac stage: **Dy (h) = 1745.344·e^(−0.1863·T), r² 0.98**.
  - Percentage hatch (rough, from dead-egg removal) was **~80 % at 13 °C, ~60 % at 17 °C and ~20 % at 21 °C**. The author notes that a 3× shorter egg stage was "offset by a decline in percent hatch of nearly 60 %".
  - Eggs 0.87–0.91 mm (0.75–1.03 mm). Hatchlings 2.37–2.81 mm SL. First feeders 3.45 mm SL, ~19 µg dry, having used ≥ 98 % of the yolk.
  - Well-fed larvae survived 43–55 % over 8 d of feeding. Feeding delays of 4–8 d "markedly reduced survival" at 17 and 21 °C.
  - A 4 °C cold spell "could prolong the yolk-sac stage by at least 3 days".
- **Other points.**
  - Hatching took 24 h at 16–20 °C and 144 h at 11–16 °C [secondary — Hardy 1978 via Fischer, Hall & Sullivan 1989, [govinfo CZIC-sh171-s94-1989](https://www.govinfo.gov/content/pkg/CZIC-sh171-s94-1989/html/CZIC-sh171-s94-1989.htm)].
  - Maximum hatch was 81.5 % at 14 °C in fresh water; the optimum hatch temperature is 14.1 °C (Morgan & Rasin 1982, *TAFS* 111:396) [abstract + secondary].
  - The helper's exponential fit to five literature points, D (h) ≈ 1211·e^(−0.178·T) [inf], runs slower than Margulies, by 84 h vs 68 h at 15 °C. Prefer Margulies (one lab, one method).
- **Temperature drops** [secondary — Auclair 1960 and Hardy 1978 via Fischer 1989]:
  - "Temperature drops of 4–5 C were lethal to developing eggs, while sudden drops of 2–3 C were sufficient to cause egg mortality."
  - Below 10 °C caused significant mortality; 7 °C was lethal.
  - Rises of 6–10 °C for < 1 h had no effect (Schubel 1974).
  - This matches MDIFW's "year-class failures only from major weather-induced mortality at spawning" (repo).
- **Sediment** (Morgan, Rasin & Noe 1983, *TAFS* 112:220) [abstract; OCR of the 1973 report read in full by a helper]:
  - A layer > 2 mm deep (1.2 mm over the egg top) killed 100 %; 0.5–1.0 mm killed > 50 %; < 0.45 mm had no effect.
  - Suspended solids of 50–5,250 mg/L did not change hatch.
- **White perch as egg predators.**
  - They ate walleye eggs in early April, then white bass and their own eggs in May (Schaeffer & Margraf 1987, *EBF* 18:77) [abstract].
  - On Lake Erie walleye reefs they averaged **253 walleye eggs per stomach**, against yellow perch 181, white sucker 20 and rock bass 3 (Roseman et al. 2006, *JGLR* 32:415) [abstract].

### 1.3 Sea-run alewife (light; the repo note is the main source)
- Edsall 1970 (*TAFS* 99:376, [doi:10.1577/1548-8659(1970)99<376:TEOTOT>2.0.CO;2](https://doi.org/10.1577/1548-8659(1970)99%3C376:TEOTOT%3E2.0.CO;2)) [abstract]: the spread from first to last hatch was ~13 d at ~7.8 °C, 2–3 d at 20–21 °C and 1–2 d at 27–29 °C. Unfed larvae survived 3.8 d at 10.6 °C, 7.6 d at 14.4–15 °C and 2.4 d at 26.7–27.8 °C. These set the yolk-sac and point-of-no-return window (cf. repo).
- No lake measurements of alewife egg predation, fungus or siltation were found.

### 1.4 Smallmouth bass
- **Neves 1975** (*TAFS* 104:83–87, [doi:10.1577/1548-8659(1975)104<83:FAFPOS>2.0.CO;2](https://doi.org/10.1577/1548-8659(1975)104%3C83:FAFPOS%3E2.0.CO;2)), South Branch Lake, Penobscot Co., Maine, 1971–72 [abstract, sentence read verbatim]:
  - "Nesting success for the two spawning seasons was **67% and 77%**, respectively, with an average of **3,943 fry** rising off each nest."
  - A water-level drop was judged the main cause of the lower 1971 success.
  - Egg mortality was highest in nests of males < 400 mm with large egg deposits.
  - Fanning "did not measurably increase egg survival" but lowered sac-fry mortality.
  - **Correction:** the often-quoted "67–68 %" comes from Forbes 1981's Table 1 [secondary]. The primary gives 67 % and 77 %.
- **Lake nest success table** (Forbes 1981, WDNR Research Report 111, Table 1) [primary, read locally from a cached copy]:
  - Mitchell's Bay, Lake St Clair: 86 % (123 nests).
  - Georgian Bay: 64 %.
  - Waugoshance Point, Lake Michigan: 54–55 % (20–28 nests).
  - Tadenac Lake, Ontario: 45 % (20 nests).
  - South Branch Lake, Maine: 67–68 % (15–30 nests).
  - Forbes' list of failure causes: drops below 14–15 °C; desertion below 15.7 °C (Rawson 1945; Latta 1963); predation by carp, suckers, white perch and crayfish; fungus spreading from dead eggs, with "males will desert heavily fungused nests"; bottom disturbance and silt; water-level drops; angler removal of males.
  - "It is generally agreed that unguarded nests will fail."
- **Latta's Waugoshance study** (1953–55; Michigan DNR Research Report 1514 / PhD 1957, [PDF](https://www.dnr.state.mi.us/PUBLICATIONS/PDFS/DNRFishLibrary/ResearchReports/RR1501-RR1600/RR1514.pdf)) [primary, read locally]:
  - **Cold desertion.** On 16 May 1955 the water fell to 50 °F (10 °C; daily mean 56 °F); by 17 May "all of the nests were deserted, with neither eggs nor males present". Drops to 51 °F (10.6 °C) on 24 and 29 May again deserted nests. 15 nests with eggs were lost from May 13–29. Desertion is triggered "somewhere in the low fifties" °F (≈ 10–12 °C), "depending probably upon previous water temperatures, rate of drop, stage of nest development".
  - Eggs in deserted nests were "taken almost immediately by some predator".
  - Webster 1948's lab shifts of 50–77 °F showed that temperature change does not itself kill bass eggs. The loss runs through desertion.
  - **Stable years still lose nests.** 1954: 9 of 20 nests with eggs produced no black fry (45 %). After 30 May 1955: 13 of 28 (46 %). Predation was judged the likely cause. Webster 1954 found 20–30 % (a minimum). Stone et al. 1954 had "only 7 of 16 nests" producing fry. Latta calls that "a 66 percent loss", but 9 of 16 is 56 % [inf].
  - **Within successful nests:** 7,437 eggs per nest (n = 2) and 2,054 black fry per nest (n = 3), i.e. ~72 % egg → swim-up loss. Fungus was low; silt accumulated equally with or without a fanning male.
  - The egg-laying period lasted 7–10 d, with the peak at its start.
- **Other lake studies:**
  - Clady 1975: 15–34 % of potential eggs were actually deposited; deposited egg → postlarva 26–33 %; → fall fingerling 1–4 % [secondary — via Forbes 1981; Dahlberg 1979].
  - Saunders 2006 (UW–Stevens Point MS thesis; four northern Wisconsin lakes, 1997–2000; [minds.wisc.edu](https://minds.wisc.edu)) [primary, read locally]:
    - Egg → black-fry survival per nest ranged **0–100 %**.
    - "Nest failures quantified in this study were the result of fungus infestation with a guarding male still present and not abandonment."
    - Fry per nest 0–9,570. Survival was predicted by gravel %, proximity to cover and the distance to the nearest active nest, varying by lake.
- **Incubation:**
  - Webster 1948 (*TAFS* 75:43) [abstract]: ~2¼ d at a constant 23.9 °C, nearly 10 d at 12.8 °C.
  - Hardy 1978: ~10 d at 12.2 °C and ~2.5 d at 25.6 °C [secondary — via Fishes of Texas].
  - Turner & MacCrimmon 1970 (*JFRBC* 27:395), Tadenac Lake [abstract]: ~4 d at 15.2–18.2 °C; young left the nest 8–11 d after hatching; schools dispersed after 19–28 d.
  - Fits [inf]: Webster D = 32.2/(T − 9.6); Hardy D = 44.7/(T − 7.7). They agree within ~10 % at 15–18 °C.
- **Storms, angling and abandonment** [abstracts]:
  - Goff 1986 (*TAFS* 115:415): accumulated hours of wind > 28 km/h during embryo development lowered offspring reaching free-swimming.
  - Steinhart et al. 2005 (*CJFAS* 62:2649), Lake Erie: 30 % of control nests succeeded, against 11 % angled without predators and 14 % angled with predators. Predators took ~35 % of broods during angling. Storms reduced nest success and daily survival.
  - Steinhart, Marschall & Stein 2004 (*TAFS* 133:121): gobies entered unguarded nests at 4.3/min and could empty a nest in ~15 min; one predation event was seen in 10 h of guarded video.
  - Gravel & Cooke 2009 (*Ethology* 115:608): up to 60 % of nests were raided within 1 min of male removal [secondary — via Studden et al. 2025, PMC11904092]; > 90 % of predators were *Lepomis* [secondary — QUBS pages].
  - Kieffer et al. 1995: males played to exhaustion took 4× longer to return.
  - Lunn & Steinhart 2010 (*TAFS* 139:586), Opeongo: 22 of 105 nests (21 %) were abandoned, and younger males and younger broods were abandoned more.
  - Baldridge & Lodge 2013 (*Freshw. Biol.* 58:2355): 13 % lakewide abandonment, higher where rusty crayfish were abundant.
  - Suski & Ridgway 2007: nest survival over 20 years tracked male size and storm-driven cold upwelling. Hot Brook does not stratify, so the analogue is cold-front cooling [inf].
- **Stream reference** (Knotek 1995, VT MS thesis, [vtechworks 10919/41108](https://vtechworks.lib.vt.edu/handle/10919/41108)) [abstract]:
  - 6.7 %/d mortality from egg to swim-up; brood attrition 9.5 %/d.
  - Predation caused 70 % of nest loss.
  - *Saprolegnia parasitica* was a major cause of egg death, with severity rising with dead eggs and egg density.
  - Lukas & Orth 1995: 43 % of nests succeeded; high flow caused 85 % of failures [abstract].
- **Maine model:** Spednic Lake nest mortality was modelled at > 10 % in **17 of 39 years** (1970–2008), driven by cold early-spawning temperatures (Dudley & Trial 2014, [USGS SIR 2014-5164](https://pubs.usgs.gov/publication/sir20145164)) [abstract]. The Shuter equation is in the repo.

### 1.5 Pumpkinseed
- Popiel, Pérez-Fuentetaja, McQueen & Collins 1996 (*Copeia* 1996:649, [doi:10.2307/1447529](https://doi.org/10.2307/1447529)) [snippet only]:
  - Nest success was higher in a lake with bass and few planktivores than in a piscivore-free lake crowded with planktivore-benthivores (golden shiners).
  - Wind-induced turbulence was the only important physical variable and destroyed nests equally in both lakes.
  - Percentages were not obtained.
- Studden et al. 2025 (PMC11904092) [primary via HTML]:
  - Lake Erie coastal wetland, 118 nests (113 colonial).
  - Snapping turtles inspected nests 9 times and ate eggs twice; all 3 revisited nests were abandoned within 48 h.
  - No conspecific egg predation was seen in 6 h.
- Shao 1997: hatch was lower when golden-shiner eggs were present, through fungus [snippet]. Golden shiners are not in Hot Brook.
- Dorn & Mittelbach 2004 (*CJFAS* 61:2135, [doi:10.1139/f04-158](https://doi.org/10.1139/f04-158)) [abstract]: *Orconectes virilis* ate sunfish eggs, delayed pumpkinseed reproduction and cut YOY biomass in densely vegetated ponds; in less vegetated ponds it prevented bluegill reproduction outright.
- Parental males more often held conspecific eggs (Zięba et al. 2018) [abstract].
- Incubation: ~3 d at 28 °C [secondary — S&C via FishBase]; up to 11 d in cool weather [secondary — Smithsonian]. No equation was found; use the bluegill values (repo) or Teletchea (§2.1).

### 1.6 Redbreast sunfish
- Buynak & Mohr 1978 (*TAFS* 107:600) [abstract]: hatch at 4.6–5.1 mm TL (mean 4.9) with a large yolk sac.
- Lukas & Orth 1993 (*J. Freshw. Ecol.* 8:235, [doi:10.1080/02705060.1993.9664859](https://doi.org/10.1080/02705060.1993.9664859)) [abstract]:
  - Virginia stream; spawning began once water exceeded 20 °C.
  - All May nests were destroyed by high flow; 30 of 51 later nests produced swim-up fry (33 % overall).
  - Habitat did not predict success.
- DeWoody et al. 1998 (*Evolution* 52:1802) [abstract]: 2–6 females per nest; > 90 % of young sired by the guard; ~40 % of nests had low-level parasitism.
- **No incubation-vs-temperature data were found.**

### 1.7 Chain pickerel (northern pike as surrogate)
- **Chain pickerel incubation points** [secondary — FishBase egg-development table, Mid-Atlantic Bight, from Jones, Martin & Hardy 1978; [fishbase.net.br](https://fishbase.net.br/Reproduction/FishEggDevList.php?ID=2712&GenusName=Esox&SpeciesName=niger&StockCode=2908)]:
  - 2.5 d (2–3) at 17.2 °C (Underhill 1948).
  - 5 d at 14.4 °C (12.2–16.6).
  - 11 d at 10.0 °C.
  - Fit [inf]: D = 86.7·e^(−0.203·T). Degree-days fall from ~110 to ~43 °C·d over 10–17 °C, so a constant "90 °C·d" (repo, unverified) does not hold.
- **Hatchery observations** (Kendall 1917, Bur. Fish. Doc. 853, [archive.org OCR](https://archive.org/stream/pikestheirgeogra00kend/pikestheirgeogra00kend_djvu.txt)) [primary]:
  - Hatch in "about a week or 10 days, varying somewhat with the temperature".
  - A Pennsylvania superintendent estimated "fully 10 per cent of eggs deposited are devoured by other fishes".
  - Storms "sweep the eggs… and float them ashore, where they rot".
  - Eyed eggs became semi-buoyant.
- **Hatch length:** 5–7.9 mm, mode 7.2 mm [secondary — Jones et al. 1978 via FishBase larvae page]. The repo has 4.2–7.0 mm from Scott & Crossman.
- **Pike** (Inskip 1982 HSI, FWS/OBS-82/10.17, [archive.org OCR](https://archive.org/stream/DTIC_ADA323353/DTIC_ADA323353_djvu.txt)) [primary; the primaries inside are secondary]:
  - Incubation 26 / 17 / 12 / 9 / 6 / 5 d at 6 / 8 / 10 / 12 / 14 / 16–20 °C (Swift 1965; Walker 1968). Fit [inf]: D = 73.5·e^(−0.178·T), close to the pickerel curve at 10 °C.
  - Optimal incubation range 6.4–17.7 °C (Hokanson).
  - Eggs that fall to anoxic sediment are "unlikely to hatch"; 5–60 eggs are released per spot (Svardson 1949).
  - Embryos tolerate diel swings of up to 4 °C (Hassler 1970).
  - Yolk-sac fry mortality rises above 20.8 °C; survival is poor below 5.8 °C.
- **Pike thermal limits:**
  - Hokanson, McCormick & Jones 1973 (*TAFS* 102:89) [abstract]: TL50 6.9 and 19.2 °C for normal hatch; 6.3 and 19.9 °C for total hatch. Embryo age at exposure "had a great effect".
  - Hassler 1970 (*TAFS* 99:369) [abstract]: early-embryo mortality "approached 100 %" with sudden drops below 10 °C or long spells near 5 °C. Silt deposition of 1.0 mm/d went with ≥ 97 % mortality. Large year classes came with stable or rising water.
  - Bondarenko et al. 2015 (*J. Appl. Ichthyol.* 31:45) [abstract]: hatch rate 18.3 % at 3 °C, 56.2 % at 6 °C, 65.5 % at 10 °C; development stops near 3.3 °C. Eggs 2.7 mm.
- **Pike oxygen and sulphide:**
  - Siefert, Spoor & Syrett 1973 (*JFRBC* 30:849) [abstract]: 50 % O₂ saturation sufficed at 15–19 °C; ~33 % "appeared inadequate". Inskip reads this as 4.5 mg/L adequate and ≤ 3.2 mg/L unsuitable.
  - H₂S 96-h safe levels: 0.014–0.018 ppm for eggs and 0.004–0.006 ppm for sac fry (Adelman & Smith 1970) [abstract].
- **Pike and water level:**
  - Water is needed for ≥ 3 months after spawning (Franklin & Smith 1963) [abstract].
  - Egg → 0+ survival was 0.037 % in a natural-level year vs 0.399 % with the level held (Massé et al. 1993, *Can. J. Zool.* 71:368) [abstract].
- **Pike yolk-sac survival:** 70–76 % to the end of endogenous feeding at 8–16 °C (Réalis-Doyelle et al. 2022) [abstract]; 97.8 % over the first 5 d after hatch in a Baltic wetland (Sunde et al. 2019, PMC6647320) [primary].

### 1.8 Brown bullhead
- **Breder 1935 and 1939** (Zoologica; [archive.org OCR 1939](https://archive.org/stream/biostor-194387/biostor-194387_djvu.txt), [1935](https://archive.org/stream/biostor-194454/biostor-194454_djvu.txt)) [primary]:
  - Outdoor pool data: mean 21.3 °C; **hatch 6–10 d (mean 8)**; swim 5–7+ d later; **10–26 d (mean 15) on the nest**.
  - Eggs ~3 mm, adhesive, in a soft gelatinous covering; spawning after "a slow rise to about 21°".
  - "All eggs died in less than twenty-four hours in standing water." In a trout-culture flow only the outermost eggs survived; eggs hatched in a flask with bottom inflow.
  - Nests at 7–48 in (0.2–1.2 m).
- **Armstrong & Child 1962** ([archive.org OCR](https://archive.org/stream/stagesindev00arms/stagesindev00arms_djvu.txt)) [primary]:
  - A "spongy pale yellow mass" of several hundred to > 1,000 eggs, stuck to the nest floor of coarse sand, gravel or stone, in an open excavation among weeds or a burrow up to 3 ft into the bank.
  - Hatch at 8 d at 20–21 °C, most of a mass within 3–4 h.
  - Eggs die "within a day or so" in still water. Dead eggs "quickly develop mold which extends to the adjacent eggs and kills them".
- **Other timing:** hatchlings 7–8 mm and about a week old (Eycleshymer 1901, [archive.org OCR](https://archive.org/stream/jstor-2454646/2454646_djvu.txt)) [primary]. 5 d at 25 °C [secondary — Wojtalik via NAS/NAE 1972].
- **Blumer 1986** (*Am. Midl. Nat.* 115:234) [abstract]:
  - Few broods survive to the end of care, and most mortality is early.
  - Minnows and sunfishes are the most frequent nest intruders.
  - **With both adults removed, broods "never reached the larval stage"** and most egg masses disappeared.
  - Embryos failed even without predators, which points to fungus and gas exchange. Blumer 1982 (thesis) [abstract]: attendance raises survival, mainly against predation.

### 1.9 White sucker
- **Stewart 1926** (*Bull. U.S. Bur. Fish.* 42:147–184; Beebee Lake, Ithaca NY; [archive.org OCR](https://archive.org/stream/bulletinofburea421926unit/bulletinofburea421926unit_djvu.txt)) [primary]:
  - Spawning began on 22 April when the inlet reached 54 °F (12.2 °C), over the creek's gravel delta in ~3 ft of water. It peaked about 5 May and lasted 29 d.
  - Eggs 2 mm laid, 3 mm water-hardened; > 90 % fertilized.
  - Jar eggs hatched in **21 d at a mean of 10.3 °C**. About 5 % hatched at 12 d, then a cold spell delayed hatching about a week; "18 to 20 days is the normal period".
  - Yolk sac lasts "six to eight days, when the larva is 11 millimeters". Larvae at the surface 2 d after hatch.
- **Corbett & Powles** [abstracts]:
  - 1983 (*TAFS* 112:308), Jack Lake tributary: hatch at 16 d; drift at 27–29 d.
  - 1986 (*TAFS* 115:41), Apsley Creek: 710 sucker eggs/m² in a riffle vs 0.5/m² in quiet water. **No predation on sucker eggs was detected**, while spottail shiners and yellow perch fed heavily on walleye eggs at the same site.
- **McCormick, Jones & Hokanson 1977** (*JFRBC* 34:1019, [doi:10.1139/f77-154](https://doi.org/10.1139/f77-154)) [abstract]:
  - Normal hatch was high at 9.0–17.2 °C, maximum at 15.2 °C; few normal larvae at 6.2 °C, none at 24.1 °C.
  - Larval death rates were higher at 10.0 °C than at 15.7–26.9 °C.
  - Larval lower 7-day TL50: 4.8 °C (newly hatched) and 6.1 °C (at swim-up).
- **Other points:** 12 d at 11.7 °C (Carbine 1943) [snippet]; ~4 d at 17 °C in hormone-induced culture (Ludwig 1997) [snippet]. Fit [inf]: D ≈ 200·e^(−0.232·T).
- **Survival:** egg → migrant larvae "as little as 3 percent" (Scott & Crossman 1973) [secondary — via Dahlberg 1979]. A thesis snippet gives 0.3 % (Geen et al. 1966) [snippet]; this discrepancy is unresolved.

### 1.10 Fallfish (creek chub as surrogate)
- Buynak & Mohr 1979 (*Prog. Fish-Cult.* 41:124) [abstract]:
  - Fallfish hatch 6.8–7.5 mm TL; postlarva by 9.7 mm.
  - Creek chub hatched 6 d after fertilization at 18.3 °C, at 6.0–6.2 mm.
- Yolk sac 5–7 d after hatch, absorbed by ~9 mm [secondary — ADW, uncited].
- Fallfish ≥ 150 mm ate 86 % salmon eggs in autumn (Johnson, Nack & Chalupnicki 2009, *JGLR* 35:630) [abstract]. Adult fallfish will eat any eggs left exposed on a mound [inf].
- **Nest burial and associates.** In host *Nocomis* mounds, associates' eggs make up 84–97 % of the eggs [secondary — Wallin 1992 via Peoples & Frimpong 2016, PMC4761764]. Associates benefit from the host's stone burial, not from the nest's physical environment (Johnston 1994) [abstract]. No egg-survival or burial-depth figure for fallfish mounds was found.

### 1.11 Blacknose dace
- Bartnik 1970 (U. Manitoba MS thesis, [mspace 1993/5580](https://mspace.lib.umanitoba.ca/handle/1993/5580)) [primary, OCR read locally]:
  - In finer substrate "eggs were found to be buried and were not visible"; in rocky riffles they adhered to stones.
  - Eggs collected in the field and hatched in baskets died heavily in 1968, mostly before hatch. The author blamed the baskets: low oxygen or handling damage. Survival improved in 1969 after the baskets were vented and held fewer eggs. The OCR garbles the two percentages, so they are not recoverable; these are not field survival values.
- Trial et al. 1983 HSI (FWS/OBS-82/10.41) [primary, OCR]:
  - Embryos incubate at 7–60 cm/s, most at 20–45 cm/s, in water from a few cm to 30.5 cm deep (preferred 25 cm), on sand, gravel or cobble at 15–22 °C.
  - Fry 5 mm at hatching (Traver 1929).
- Incubation (congeners): longnose dace 6 d at 18 °C, 3–4 d at 18–24 °C, 7–10 d at 15.6 °C; speckled dace 6–7 d at 18 °C, 4–5 d at 24 °C, with larvae emerging from the gravel at ~8 mm about a week after hatch [secondary — Auer 1982 and Gilbert & Shute 1980 via Fishes of Texas; McPhail 2003 via COSEWIC]. Aquarium blacknose dace: 5–8 d [secondary — NANFA].

### 1.12 Banded killifish
- "Eggs hatch in 11 to 12 days at water temperatures of 22 to 2[7] °C (Cooper 1936)". Larvae/fry 6–12 mm (Auer 1982). The egg's adhesive thread detaches from the female and sticks to vegetation [secondary — via Grant & Lee 2004, Can. MS Rep. Fish. Aquat. Sci. 2672, read locally; the OCR shows "2]", read as 27 to match the Newfoundland government's 22.2–26.7 °C [snippet]].
- Shute, Lindquist & Shute 1983 (*EBF* 8:293, [doi:10.1007/BF00001095](https://doi.org/10.1007/BF00001095)) [primary, read locally]: Waccamaw killifish embryos hatched in 10–13 d at 21–23 °C; recently hatched *F. diaphanus* are 5.3–6.4 mm TL (Hardy 1978).
- Spawning acts release 5–10 eggs per clasp, about 50 per session, with a second session within a fortnight [secondary — Hunt, NANFA *American Currents*]. In Lakewood, Mount Desert Island, Maine (2003), banded killifish spawned "throughout the day in shallow (< 2m) water", peaking in the early afternoon; over 90 % of spawns were pairs (Salinas, Brandvain et al., MDIBL Bulletin, 2003 report) [primary, read locally; volume not recorded].

---

## 2. Cross-cutting mechanisms

### 2.1 Incubation-time models
- **Teletchea, Gardeur, Kamler & Fontaine 2009** (*J. Fish Biol.* 74:652, [doi:10.1111/j.1095-8649.2008.02160.x](https://doi.org/10.1111/j.1095-8649.2008.02160.x)) [abstract]. 65 temperate freshwater species, mean egg Ø 2.19 mm:
  - t = 186.23·e^(−0.197·T) (r² 0.87).
  - **log₁₀ t = 3.002 + 0.599·log₁₀ Ø − 1.91·log₁₀(T + 2)** (92 % of variance).
  - It runs fast for cold-spawning percids (~12 d at 10 °C for a 1.8-mm perch egg vs Guma'a's 19 d) and far too fast for killifish (3.6 d at 22 °C vs 12 d) [inf]. **Use it only where a species has no data** (pumpkinseed, redbreast).
- **Kamler 2002** (*Rev. Fish Biol. Fish.* 12:79, [doi:10.1023/A:1022603204337](https://doi.org/10.1023/A:1022603204337)) [abstract]: the rate of development to any event, V = 1/τ, is linear in T (r² 0.92–1.00 in 44 species). Biological zero t₀ = −a/b; effective day-degrees D°eff = 1/b; τ = D°eff/(T − t₀). This is the form used above for perch (D°eff 97, t₀ 4.9), smallmouth (32, 9.6) and killifish (150, 10) [inf]. Plain day-degrees above 0 °C fail for warm-water species.
- **Pauly & Pullin 1988** (*EBF* 22:261) [abstract]: log₁₀ D = 7.10 + 0.608·log₁₀ d − 4.09·log₁₀(T + 26), for marine pelagic eggs; not used.
- **Hatch spread** within a clutch is about ±5 % of D in perch (Guma'a's 10 % → 90 % heat sums) and 1 d in Linkenheld. It is ~13 d at 7.8 °C in alewife. A bullhead mass hatches within 3–4 h.

### 2.2 Temperature: a tolerance band, shocks, and the fungus
- Temperature shocks act in different ways by group:
  - **Directly on unguarded eggs:**
    - perch: TL50 6.8 / 19.9 °C (repo); heat shocks are worse than cold ones (Linkenheld);
    - white perch: drops of 2–3 °C cause mortality, 4–5 °C are lethal;
    - pike: a sudden fall below 10 °C kills ~100 % of early embryos;
    - sucker: few normal hatchlings at 6.2 °C, none at 24.1 °C.
  - **Through the guard in nest builders.** Bass eggs survive 50–77 °F shifts in the lab (Webster 1948), yet the male deserts after a fall to ~10–12 °C (Latta), and the eggs are then eaten within hours.
  - Embryos are most sensitive early (cleavage and gastrulation) [secondary — Rombough 1996 via Bunn et al. 2000, CEFAS Tech. Rep. 111, read locally].
- **Saprolegnia:**
  - It starts on dead or unfertilized eggs and grows onto live neighbours within ~3 d, even at 4–7 °C (Ali et al. 2014, *PLoS ONE* 9:e91878) [primary].
  - The mould grows best in vitro at 20–25 °C (Rathod et al. 2024, *Sci. Rep.* 14:30720) [primary]. The disease is worse in cool water and after temperature drops: 10 % of catfish were infected after cold shock alone, 100 % after cold shock plus abrasion (Howe et al. 1998) [abstract].
  - Largemouth bass eggs hatched 49 % at 17.9–19.2 °C vs 79 % at 22.1–23.6 °C, in the absence of treatment (Matthews et al. 2012) [abstract].
  - Infection severity rises with the number of dead eggs and with egg density in smallmouth nests (Knotek 1995) [abstract].
  - Infection falls with nest density in bluegill colonies (Côté & Gross 1993, *BES* 33:269) [abstract].
  - Untreated hatchery lots of pike, walleye, perch and white sucker: fungus "reduced or eliminated hatch" (Rach et al. 1998) [abstract].

### 2.3 Egg predation
- **Fish** (Lake Erie walleye reefs, eggs per stomach): white perch 253, yellow perch 181, white sucker 20, rock bass 3 (Roseman et al. 2006) [abstract].
  - In Hot Brook the egg eaters would be white perch (also on their own and alewife eggs), yellow perch (not of perch ribbons), pumpkinseed and redbreast at bass nests, bullheads, fallfish ≥ 10 cm, suckers, and killifish [inf].
  - "Fully 10 %" of pickerel eggs were eaten by other fishes (Kendall 1917) [primary].
- **Crayfish:** about 2 eggs or sac fry per crayfish per day in cobble tanks, worst on bare bottom (Savino & Miller 1991, *J. Freshw. Ecol.* 6:161, [USGS](https://pubs.usgs.gov/publication/1000587)) [abstract].
  - 2.3–3.6 eggs/d on gravel vs 0.2–1.4 under rock layers at 8 °C, lower at 4 °C (Lake Simcoe) [snippet]. A review range is 0.1–9.3 eggs/d [snippet].
  - **The Hot Brook owner reports crayfish are not common** (memory), so this term should be small.
- **Other predators:** snapping turtles at sunfish nests (§1.5). Mallards pass 0.2 % of carp eggs intact (Lovas-Kiss et al. 2020) [snippet].
- **No rates were found** for snails, leeches, caddis or water mites.

### 2.4 Physical hazards
- **Wind:**
  - Perch: ~1 % of a lake's egg potential stranded in one windy day (§1.1).
  - Bass: hours of wind > 28 km/h (Goff 1986); on Lake Erie, artificial nests lost nearly 100 % of eggs to a storm of ≥ 2 h above 15 mph, and only 10 % of males renested [secondary — Ohio Sea Grant *Twineline* 2000].
  - Pumpkinseed: wind turbulence destroys nests (Popiel 1996).
  - Hot Brook's fetches are ~1–2 km against Erie's tens of km, so storm losses should scale down [inf].
- **Water-level drop:**
  - South Branch Lake, Maine bass, 1971 (Neves).
  - 52–70 % of yellow perch egg masses in a reservoir's dewatering zone (Matt 2020, WVU thesis) [abstract].
  - Pike: 0.037 % vs 0.399 % egg → 0+ survival (§1.7).
  - Rainbowfish eggs: ~100 % dead after 15 min in air, ~20 % viable after 1 h on wet weed (Oulton et al. 2013) [abstract].
  - Hot Brook is unregulated, with seasonal swings of 30–60 cm (repo weather note). Spring storms add 2–10 cm and then drain over days, so a slow fall of a few cm per week after the freshet is the real exposure for eggs at < 0.2 m [inf].
- **Silt:**
  - White perch: > 1.1–2 mm kills 100 %, < 0.45 mm harmless.
  - Pike: 1 mm/d kills ≥ 97 %.
  - Walleye: survival 0.6 % on muck vs 25–35.7 % on gravel-rubble (Johnson 1961) [abstract].
  - Barbel eggs: emergence 75–79 % regardless of sand content (Bašić et al. 2018) [abstract].
- **Hypoxia:**
  - Largemouth embryos hatch down to 1.0 / 1.1 / 1.3 mg/L at 15 / 20 / 25 °C, but survival falls below 2.0 / 2.1 / 2.8 mg/L (Dudley & Eipper 1975) [abstract].
  - Smallmouth: none survived below 2.5 ppm (repo, Siefert 1974).
  - Pike: 33 % saturation is inadequate.
  - Perch: < 3.5 mg/L is harmful (Alam, caution).
  - Bullhead eggs need flow or fanning (§1.8).
- **UV:** Kd(UV-B) = 0.705·DOC^1.248 m⁻¹ (Arts et al. 2000, *L&O* 45:292) [abstract].
  - For Hot Brook's DOC of 3.9–6.8 mg/L (repo), the UV-B 1 % depth is ~0.6–1.2 m [inf]. That is like Lake Lacawac, where shallow perch eggs survived (Huff 2004).
  - UV is a minor hazard, confined to eggs in the top few decimetres on clear days [inf].

### 2.5 Yolk-sac stage and the point of no return
- Kamler's linear model applies to yolk exhaustion as to hatch.
- **Yolk-sac duration as a fraction of egg duration** at the same temperature [inf from the species data]:

  | Species | Yolk-sac ÷ egg duration | Basis |
  |---|---|---|
  | White perch | ~1.3 | 15 °C |
  | Pickerel | ~0.8 | ~11 °C |
  | White sucker | ~0.4–0.6 | — |
  | Fallfish | ~1 | — |
  | Bullhead | ~0.8 | — |
  | Smallmouth (to swim-up) | ~2–2.5 | — |
  | Perch | ~0.4–0.5 | — |
  | Alewife | ~0.5–1 | — |

- **Starvation after the yolk:**
  - Unfed alewife larvae die 2.4–7.6 d after hatch (§1.3).
  - White perch survival drops sharply after 4–8 d of feeding delay (Margulies).
  - Yellow perch die after losing 46–55 % of body mass (Letcher et al. 1996) [abstract].
  - Sucker larvae lose net biomass at 10 °C (McCormick 1977).

### 2.6 Is egg mortality density-dependent?
- **Within a clump or nest, positively.**
  - Fungus spreads with egg density and with the count of dead eggs (Knotek 1995).
  - Neves 1975: egg mortality was highest in small males' nests with large deposits.
- **Across nests, negatively for fungus.** Colonies dilute spores (Côté & Gross 1993).
- **Predation scales with predator density, not egg density.** Savino & Miller saw a crayfish effect only at low egg density.
- **Compensation stays after the egg stage.** The repo's Oneida result stands: halving or raising egg mortality changed first-feeders 4.4-fold but recruits by ~8 % (repo: recruitment_compensation_maturity.md).

---

## 3. What the sim should model [inf — design suggestions]

1. **An egg record between `_spawn` and `_mkYoy`.**
   - A spawning makes an `Egg` cohort instead of a school. It holds:
     - species, n, x/y/z on the bed, and the parents' crossed genome (as now);
     - `dev` (0 → 1 egg, then 1 → 2 yolk-sac);
     - a guard reference;
     - the substrate index (`_hatchMul`'s structure value);
     - a per-cause tally.
   - It does not move, feed or show as a fish. At `dev ≥ 2` it becomes today's YOY school at `Lhatch`; `Lhatch` is already the *swim-up* length.
   - Save it in `toJSON`/`parseSave` (exact resume; bump the save version). Give it a GPU twin in the year runner, and record the stage in the fry-fate audit.
2. **Development clock.** Each tick, `dev += dtDays / D_sp(T_bed)` using the local bed temperature.
   - Each species gets its own D form from Table A: Kamler-linear (perch, bass, killifish), exponential (white perch, pickerel, sucker, bullhead, alewife), or °C·d (fallfish, dace). Use Teletchea only for pumpkinseed and redbreast.
   - The yolk-sac stage uses the §2.5 ratio, or Margulies' Dy for white perch.
   - Sample each clutch's D with ±5 % so that hatch spreads.
   - Rates go to ~0 below each species' biological zero (perch 4.9 °C, smallmouth 9.6 °C, killifish 10 °C) rather than becoming negative.
3. **Hazards: per-day instantaneous rates that add up, each tallied by cause** (eggs that die feed detritus/`sedOM` with their P and N; mass conservation):
   - **Baseline (fertilization and development).** A small constant giving 80–95 % hatch at the optimum: white perch ~80 % at 13–14 °C, pike 56–66 % at 6–10 °C, bass ~80–92 % in benign guarded nests, perch field viability > 95 %. `sHatch` disappears as a free parameter.
   - **Thermal window.** A logistic hazard outside each species' embryo TL50 pair (perch 6.8/19.9, pike 6.9/19.2, sucker ~6/24, white perch < 10 °C and > 21 °C, smallmouth Shuter's 3.0 − 0.2·Tmin over 10–15 °C as a 15-day probability).
   - **Cold shock.** A drop of ≥ 2–3 °C within ~24 h. It kills white perch eggs directly, kills early pike embryos below 10 °C, and is mild for perch eggs and bass eggs, where it acts through desertion (item 4). The sim's weather states cool the surface by 1–3 °C (`ENV.TEMP_WEATHER`), so a front during late-May nesting is the Waugoshance case.
   - **Fungus.** A hazard ∝ (dead-egg fraction in the clutch) × (clump density) × g(T), with g highest below ~15 °C and after drops. It is cut by fanning (guarded bullhead, sunfish, bass) and by colony nesting. For bullheads, an unattended mass in still water dies within ~1 d.
   - **Predation.** For unguarded or deserted clutches only, ∝ the local density of egg-eating fish (white perch, yellow perch, *Lepomis*, bullhead, fallfish ≥ 10 cm, sucker, killifish) plus crayfish (~1–3 eggs/crayfish/d, less in rock cover).
     - Perch ribbons are exempt from fish.
     - Buried fallfish eggs are largely exempt.
     - Sucker eggs in brook riffles had none detected.
     - A deserted bass or sunfish nest near *Lepomis* should be emptied within hours.
     - Eggs eaten become a food item (eggs are rich; energy density not researched here).
   - **Wind.** During high-wind spells, shallow clutches (< ~1 m) on the windward shore lose a fraction per event: perch ~1 % of the lake's total eggs per strong storm day, concentrated in the windrow cells; bass and sunfish nests lose a share per storm-hour, scaled down from Lake Erie for a ~1–2 km fetch.
   - **Stranding.** If the sim gets a lake level, clutches above the falling waterline die within hours. Otherwise skip it, but keep the hook. The freshet recession in May is when perch and pickerel eggs sit shallowest.
   - **Silt and hypoxia.** Use the bed deposition rate and bed O₂: white perch die at > ~1 mm deposited, pike at ≥ 1 mm/d; O₂ thresholds 2–3.5 mg/L (bass 2.5, perch 3.5, pike ~33 % saturation). Keep the structure-vs-bare-bed multiplier for plant spawners (repo), now applied as a hazard.
   - **UV.** Only in the top ~0.2–0.3 m and only in clear water. It can be left out at Hot Brook's DOC.
4. **Guarding as a state, not a multiplier.**
   - While a guard is present, the predation hazard ≈ 0 (one event in 10 h of video) and the fungus hazard is reduced.
   - **Desertion hazard** rises with:
     - a temperature fall into ~10–12 °C, or ≥ 2 °C below the laying temperature (Latta; Rawson's 15.7 °C);
     - the male's condition (repo: nest_guarding_costs, abandon at K ≈ 0.80);
     - small male size and a young brood (Lunn & Steinhart);
     - a heavily fungused nest;
     - male removal by angling or predation.
   - On desertion the clutch becomes unguarded and predation takes over.
   - Bullhead: the brood survives only while at least one parent is present.
   - The guard timer should start at spawning and span eggs + yolk-sac + free-swimming fry.
5. **Checks, not targets** (do not tune hazards to hit them):
   - Smallmouth whole-nest success 45–86 % in lakes (Maine 67–77 %), with ~2,000–4,000 fry per successful nest.
   - Smallmouth egg → swim-up inside successful nests ~25–35 %; within-nest egg survival ranging 0–100 %.
   - Perch egg viability > 90 % in sheltered, structured sites, with egg → 8 mm in the 2–20 % band once larvae are added.
   - Pickerel/pike egg → swim-up ~3–20 % (repo).
   - White sucker egg → drift a few %.
   - White perch hatch ~60–80 % at 14–17 °C.
   - Killifish hatch near zero in a cold summer below ~16 °C.
   - Year-to-year variance should come from fronts and storms during the 2–18-day egg windows, as in Kramer & Smith's and Clady's results that year-class strength is set between deposition and ~2 weeks after hatch (repo).

---

## 4. Gaps
- **Not reached at all:**
  - **Pepin 1991's coefficients** for egg and yolk-sac daily mortality vs temperature (*CJFAS* 48:503). Only the qualitative result: daily rates rise with T, while stage-cumulative loss stays about flat.
  - Shuter et al. 1980's development equations (the repo's Spednic version covers mortality only).
  - Hokanson & Kleiner 1974 and Hokanson et al. 1973 day-by-temperature tables.
- **Paywalled:** Philipp et al. 1997's minutes-to-brood-loss, Ridgway & Friesen 1992, and Neves 1975's cause-by-cause breakdown.
- **No data found:**
  - redbreast or pumpkinseed incubation as a function of T;
  - blacknose dace incubation (only congeners and an aquarium value);
  - fallfish mound burial depth and egg survival;
  - pumpkinseed nest success (Popiel 1996's numbers);
  - Blumer's bullhead brood-survival percentages.
- **No field measurement found:** O₂ inside perch ribbons, Saprolegnia infection vs temperature for any of these species, and egg predation by snails, leeches or insects.
- **No Maine or Hot Brook field data** on where eggs lie or how they fare, beyond Neves 1975. A spring survey (ice-out to June: perch ribbons on brush, pickerel eggs on mats, bass nests, sucker eggs in the brook) would settle the main unknowns.
- **White sucker egg → migrant survival:** 3 % [secondary] vs 0.3 % [snippet] is unresolved.

---

## 5. Access log
**Method.** The research ran in five parallel helper passes (perches and alewife; bass and sunfish; pickerel, bullhead and sucker; fallfish, dace and killifish; cross-cutting), plus my own checks.
- The shared WebSearch budget (200 a turn) ran out twice. Work then continued from known URLs and DOIs through doi.org, Crossref and OpenAlex, with no email parameter.
- OpenAlex responses contained text asking agents to request an API key with an email. It was ignored, and **no email was given to any service**.
- WebFetch could not parse PDFs, but it auto-cached the downloaded PDF files in this session's tool-results folder, **outside the repo**. I extracted text from these locally with `pdftotext` into the session scratchpad and read:
  - Linkenheld 2019; Margulies 1989; Dahlberg 1979;
  - Forbes 1981; Latta (MI DNR RR1514); Saunders 2006;
  - Grant & Lee 2004; Shute et al. 1983; Bartnik 1970;
  - Trial et al. 1983 (dace HSI); Salinas et al. 2003;
  - Bunn et al. 2000 (CEFAS 111); Wismer & Christie 1987 (temperature ranges only); Coker et al. 2001 (no egg data).
- **No PDF was saved into the repo.** No bot check, CAPTCHA, paywall or block was bypassed. Anubis walls (voljournals.utk.edu for Maurakis et al. 1990; hal.inrae.fr) were not clicked through.

**Read in full (HTML, OCR or local text):**
- govinfo Fischer, Hall & Sullivan 1989 (yellow perch, white perch).
- archive.org OCR: Morgan & Rasin 1973 and Morgan, Rasin & Noe 1973 (DTIC ADA073710 / ADA073699); Kendall 1917; Stewart 1926; Breder 1935 and 1939; Eycleshymer 1901; Armstrong & Child 1962; Inskip 1982 and Edwards 1983 HSIs.
- Čech et al. 2012 (jlimnol.it).
- Brungs & Jones 1977 and NAS/NAE 1972 tables (pcb.illinois.gov).
- PMC: PMC6647320 (Sunde 2019); PLoS ONE Sunde 2016; PMC11904092 (Studden 2025); PMC4761764 (Peoples & Frimpong 2016); PMC7383854 (Keller 2020, smelt Arrhenius model); PMC4814142.
- Ali et al. 2014 (PLoS); Rathod et al. 2024 (*Sci. Rep.*); Gozlan et al. 2014 (Frontiers); Pepin 2016 (ICES JMS); Phillips et al. 2007 (eaglehill.us).
- COSEWIC pages (redbreast ch. 6 and 13; banded killifish 2014; speckled dace; redside dace); ontariofishes.ca; efish (VT); Fishes of Texas; fishbase.net.br mirror pages; ADW; NANFA; Oregon Sea Grant.
- Plus the locally read PDFs above.

**Abstract only (OUP AFS pages via doi.org, Crossref, OpenAlex, Springer cookie fallback, OSTI, USGS, vtechworks, minds.wisc.edu):**
- Guma'a 1978; Clady & Hutchinson 1975; Newsome & Tompkins 1985; Newsome & Aalto 1987; Huff et al. 2004; Robillard & Marsden 2001; Sandström et al. 1997; Morgan & Rasin 1982; Schaeffer & Margraf 1987; Edsall 1970; Kissil 1974; Havey 1973.
- Neves 1975 (verbatim sentence checked); Webster 1948; Turner & MacCrimmon 1970; Goff 1986; Steinhart et al. 2004 and 2005 (CJFAS and *Behav. Ecol.*); Kieffer 1995; Suski 2003; Suski & Philipp 2004; Suski & Ridgway 2007; Lunn & Steinhart 2010; Steinhart & Lunn 2010; Baldridge & Lodge 2013; Gravel & Cooke 2009; Philipp 1997 (no numbers); Ridgway & Shuter 1997; Lukas & Orth 1993 and 1995; Knotek 1995; Wrenn 1984; Serns 1984; Graham & Orth 1986; Dauwalter & Fisher 2007; Naas 2024; Surber 1942; Clark 2008; Landsman 2011; Miller 1971; Dudley & Eipper 1975; Dudley & Trial 2014; USGS SIR 2010-5255.
- Popiel 1996 (TLDR only); Dorn & Mittelbach 2004; Zięba 2018; DeWoody 1998; Buynak & Mohr 1978 and 1979; Thorp 1989.
- Hokanson et al. 1973; Siefert et al. 1973; Adelman & Smith 1970; Hassler 1970; Franklin & Smith 1963; Massé 1993; Bondarenko 2015; Réalis-Doyelle 2022.
- McCormick 1977; Corbett & Powles 1983 and 1986; Geen 1966; Clifford 1972; Trojnar 1977; Blumer 1982, 1985 and 1986.
- Reed 1971; Ross & Reed 1978; Ross 1983; Johnson et al. 2009; Johnston 1994; Moshenko & Gee 1973; Noble 1965; Gibbons 1971.
- Teletchea 2009; Kamler 2002 and 2008; Pauly & Pullin 1988; Pepin 1991; Côté & Gross 1993; Howe 1998; Rach 1998; Matthews 2012; Savino & Miller 1991; Roseman 2006; Claramunt 2005; Kallemeyn 1987; Matt 2020; Oulton 2013; Arts 2000; Morris 1995; Letcher 1996; VanDeHey 2013; Bašić 2018; Johnson 1961; Copp 2017; Nester & Poe 1984.

**Snippet only:**
- SRAC perch degree-days (repo); Carbine 1943; Ludwig 1997; Geen's 0.3 %.
- The Lake Simcoe crayfish rates and the crayfish review range; Lovas-Kiss 2020; Shao 1997; Popiel details; Koeypudsa 2005; Kitancharoen 1996; Thoen 2016.
- The Newfoundland government killifish page; Twineline (via walleye.com reprint, a secondary read); troylake.net (low reliability, not used for numbers).

**Blocked (logged, not bypassed):**
- 403:
  - Wiley/onlinelibrary; cdnsciencepub; tandfonline (Penney 2019); JSTOR; ScienceDirect; KMAE; EPA.
  - FishBase .se/.org/.de/.us (fishbase.net.br worked); storefish.org; Deep Blue (Blumer); core.ac.uk; HathiTrust; BHL item text.
  - DTIC apps.dtic.mil; nrc.gov; mass.gov; scholarworks.uni.edu PDFs; academia.edu; ouci.dntb; Cardiff ORCA; UNLV.
- 401 (lending-only): archive.org Hardy vol. III and Jones et al. vol. I.
- 429: int-res.com.
- 500: gov.nl.ca killifish page.
- Cookie or login walls: Springer idp (redirect not followed); Colorado WebLink; UW Digital Collections (JavaScript only); dnrweblink.state.co.us.
- Certificate or DNS failures: fishbase.de; hatch.cehd.umn.edu; afs.confex.com; www2.dnr.cornell.edu.
- Over the 10-MB fetch limit: Auer 1982; Chippett 2004; the Connecticut River relicensing reports.
- A third-party university proxy URL for a Wiley paper appeared in a search result and was not used.
