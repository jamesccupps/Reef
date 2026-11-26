# Noticed in passing

Problems the source-pass readers saw in the paper beyond their own entries. Each is checked in the §3 line-by-line pass (brief,
Phase 1) or in the rewrite, and marked done here with what was decided.

| From | Section (v1.1) | What the reader saw | State |
|---|---|---|---|
| pilot | §3.5.3 | Calls redbreast sunfish rare in lakes; Cooper 1941's "Red-bellied Sunfish (*Lepomis auritus*)" is redbreast, 19 by gill net and 177 by seine in the surveyed lakes, plus 13 hybrids | open |
| pilot | §3.5.4; §4.2 | "Spednic Lake in Washington County" and "~30 km east" are not in Dudley & Trial 2014: the geography needs its own source | open |
| pilot | §3.7.9 | "Soft-water" Maine lakes: Cooper 1941 says nothing of hardness (the claim needs its own source) | open |
| pilot | §3.5.2 | Cooper 1941's "62–128 vs 7–46" deep/shallow comparison picks four shallow lakes; three others caught 16–45, inside the deep lakes' range | open |
| pilot | Table 3.7-3; §3.7.5; §3.5.5 | Cooper 1941: golden shiner count legible (3); the bass sample includes the October Pushaw Pond fish; "paired" gill nets not in the source; Table XIV is already total length (no SL→TL conversion), and the young ages' lengths are biased up by the nets | open |
| pilot | §3.7 (diet) | Cooper 1941 Appendix A: smallmouth in Anasagunticook Lake ate 45 % crayfish — a counterexample to "crayfish rare" in the bass's diet | open |
| t1-01 | §3.7.3 | Buntz 1966 via Crossman & Lewis: 38.3 % of 115 adults held food, no seasons; the paper's "> 75 % in January vs 3–5 % in July" must be checked in Buntz itself | open |
| t1-01 | §3.7.7 | Buck & Thoits 1967 (via Crossman & Lewis): pickerel fry and fingerlings "highly vulnerable to predation by largemouth bass" — could stand beside Brokaw 2001 | open |
| t1-01 | `src/species.js:250` | "accepted by Doudoroff & Shumway 1970 over caged-fish values" is not from Cooper & Washburn: check with Doudoroff_Shumway_1970 | open |
| t1-01 | §3.5.6 | "At least a week below 0.5 ppm" was Third Sister Lake, where no heavy mortality occurred: "in winterkill lakes" fits loosely | open |
| t1-01 | references | Lewis 1971 can be completed: Lewis, G. E. 1971a, food habits of chain pickerel in Patterson Creek, West Virginia, WV DNR, 22 p. (from Crossman & Lewis 1973) | open |
| t1-02 | §2.1 | "MDIFW fisheries Region F (Penobscot)" is uncited; both fishing guides (2016 p. 27, 2024 p. 35) support it | open |
| t1-02 | research notes | `macrophytes.md` §2.1–2.2 marks Chambers & Kalff 1985 "[read]"; only its abstract was read | open |
| t1-06 | §3.6.5 | Cargnelli & Gross 1996 via Neuswanger: "the earliest third of bluegill fry rose 231 %" misworded — 17 % of fry production vs 40 % of spring-1994 recruits (~2.3× the share), the 1993 year class counted in 1994 | open |
| t1-06 | §3.6.8 | Yellow and Eurasian perch range limits credited jointly to Shuter et al. 1980 and Shuter & Post 1990; the 1980 abstract covers smallmouth only | open |
| t1-06 | §3.6.4 vs Table 3.6-3 | "Seven times denser": the table's own figure-read values (23 vs 1 offshore) give ~20× against offshore, ~7× against the shoreline | open |
| t1-06 | Table 3.6-1 | Pumpkinseed row: Sobchak et al. 2026 give male care 11–21 d (mean 15; Danylchuk & Fox 1996), hatching 5–8 d (Cargnelli & Neff 2006), nests on soft substrates — the table has 6.0 ± 0.4 d, 3–5 d, sand or gravel | open |
| t1-06 | §3.6.2 | "Fishes (mostly bullheads)" (Gross & MacMillan via Neuswanger) is the paper's gloss; the review says "*Ictalurus* spp." | open |
| t1-06 | §3.6.6 | Post 1990: young perch active metabolism "4.4 times adult standard respiration" (abstract); the paper drops "adult" | open |
| t1-07 | §3.6.1 (`03_…md:538`) | "Clady, via Dahlberg 1979" twice with no year; the research note says it is almost certainly Clady 1976 (JFRBC 33: 1887–1893), not the 1975 bass paper | open |
| t1-07 | Table 3.5-3, `03_…md:234` vs `src/species.js:376` | The 39–52 % overestimate of juvenile esocid consumption: Wahl & Stein 1991 (TAFS 120(2)) in the paper, "TAFS 137(6), 2008" in the code — one is wrong | open |
| t1-07 | Barr 1996 | The notes say Wisconsin; a (unverified) search summary gives the author at Guelph, Ontario — check the study site when it is read | open |
| t1-10 | §3.6.7 | "The fry disperse at about 28 mm (Opeongo)" has no source of its own and is not in Ridgway 2002; Ridgway (p. 57) does support young bass "as single fish or in small groups" (credited only to Hubbs & Bailey via Forbes) | open |
| t1-10 | §3.5.7 | "Homed from a mean 6.7 km": cite Ridgway & Shuter 1996 alone (not with Ridgway 2002) | open |
| t1-10 | `src/config.js:350` | Guards "lose 3–8 % of their mass over ~4 weeks": Steinhart et al.'s Lake Erie males (round gobies present) lost 11.5 % in 17 d — the range holds only where nest predators are scarce | open |
| t1-10 | Table 3.6-7, Opeongo | Ridgway's 48–53 mm is total length (1992 only); the same cell's 55–85 mm (Shuter & Ridgway 2002) is fork length — say so | open |
| t1-10 | (Steinhart et al. 2005 itself) | Its p. 432 swaps the day counts (Erie 17, Opeongo 19 per its Table 1): anyone quoting the kJ figures should use the table | note |
| t1-04 | §3.5.2 | 261 fish/ha and 20.8 kg/ha divide Jordan's 1981 statewide stock by MDIFW's 2002 acreage (~230,700 ha): arithmetic right, years mismatched; the acreage (Smith 2002) needs its own check | open |
| t1-04 | Table 3.6-1 (white perch) | Leads with ~15 °C (AuClair 1958); Stanley & Danie report AuClair's 1956 thesis as 18–21 °C held "for several days" — reconcile when AuClair 1958 is read | open |
| t1-04 | §3.7.8 | "Mostly from small lakes and reservoirs" fits Bevelhimer's Melton Hill poorly (a 2,270-ha, 71-km river reservoir ≤ 0.6 km wide, which itself limits distance from shore) | open |
| t1-04 | `config.js` WINTER0.JE, `fish3.js` F3.WIN_JE | Johnson & Evans's constant-4.0 °C laboratory model applied to field "days below 4 °C"; under-ice water is often 1–3 °C and the paper's own 2.5 °C model is harsher — a model question for §4/§5.8 | open |
| t1-04 | §3.6.6, `species.js` | Breck 1997's revised bluegill respiration is 1.7–2.9× FB4's bluegill set (the reader's arithmetic) — note when comparing sets | open |
| t1-04 | Table 3.5-3 (white perch diet) | Stanley & Danie: white perch > 22 cm "eat fish almost exclusively" — could stand beside Warner's "fish regular only above ~200 mm" | note |
| t1-08 | §3.5.4; Hartman et al. 2017 entry | "Documented only in conference work (no peer-reviewed paper was found)" for the bullhead set is wrong: Hartman, K. J. 2017, TAFS 146(4): 634–644, doi:10.1080/00028487.2017.1293563 (single author; cited in FB4's references). Lead passed to the w2-06 reader | open |
| t1-08 | §4.5; `environment.js:360`, `fish3.js:2108, 2265` | "Moved between open water and sediments within days" belongs to Werner, Mittelbach, Hall & Gilliam 1983, *Ecology* 64(6): 1525–1539, doi:10.2307/1937507 — missing from the references | open |
| t1-08 | Table 4.3 vs `species.js` juvW, §3.5.4 | Smallmouth's switch from Rice's to Whitledge's set: 250 g in Table 4.3 (the 3-D code), ~30 g in species.js and §3.5.4 — reconcile in the text | open |
| t1-08 | `src/w3/species3.js` FATHEAD | Energy density 4186 J/g where FB4's Parameters_official.csv has 4100 | open |
| t1-08 | §3.5.4 | The Whitledge break-even sizes hold only for prey of ~3,600–4,000 J/g: state the prey energy density used | open |
| t1-05 | `fish3.js:730, 2356` vs §3.7.1, `fish3.js:144` | Savino & Stein 1982 cited both for cover cutting capture success and for success per attack not changing; the COVER_CS path is off — settle when the paper is read | open |
| t1-05 | §4.5 | "Cuts a perch-like predator's success to 0.15" reads as an absolute value; the code multiplies by 0.15 (`fish3.js:2356`) | open |
| t1-05 | `fish3.js:988` vs §3.7.1 | Largemouth success 0.57–0.83 in the code, 0.58–0.83 in the paper; the esocid spiny-rayed value is anchored on pike attacking roach (soft-rayed) | open |
| t1-05 | Table 3.6-1 (bullhead) | Incubation 6–10 d (mean 8), ~3-mm eggs, 7–8-mm hatchlings vs ADW (citing Blumer's 1985 study): hatching at day 5.6 on average; 2.2–2.7-mm eggs, 4–8-mm larvae (uncited) — reconcile | open |
| t1-05 | Blumer 1985 entry | Probably the wrong 1985 Blumer paper: ADW credits its numbers to "Reproductive natural history of the brown bullhead", *Am. Midl. Nat.* 114(2): 318–330, doi:10.2307/2425607 | open |
| t1-05 | §4.5, §5.8 | Chipps et al. 2000 measured over-predicted consumption in age-0 tiger muskellunge in the lab (113 % at 10 °C, 328 % at 7.5 °C); "winter costs 2–5×" and the ×0.5 pickerel respiration cut are project inference | open |
| t1-05 | §3.8.7 | "No exuviae on seawalls, beaches or lawns" rests only on the Burnham, Howe & Merrell slides; Merrell et al. 2009 does not split developed sites by shore type | open |
| t1-03 | §4.5 vs §3.6.1 | §4.5 calls hatch fractions "field survivals where these are known" with "white perch 0.45 on a lake bed"; §3.6.1 says no field white perch egg survival was found and `config.js` EGG3 marks 0.45 [inf] (walleye, smelt analogs) — §4.5 must say inference | open |
| t1-03 | §2.2 | The sounding ranges (9–12 ft; eastern bay 4–11 ft) are from the 1949 sheet, not the 2024 chart (contours only); the 2024 chart's 684 ac and 6.7 mi equal DEP's, so it does not confirm the area independently | open |
| t1-03 | Table 3.6-1 (pickerel) | Scott & Crossman give 8.3–11.1 °C as the spawning temperature (not a "peak") and 3–10 ft depth; "mostly very shallow" is not theirs | open |
| t1-03 | `config.js:300` (DETECT_L) | Cites Margulies 1989 for how well predators detect small larvae; the paper has no such data | open |
| t1-09 | §3.6.2 | Forbes 1981 credits the 28 % deposited-egg-to-postlarva figure to Latta (1963); the paper cites Latta 1957 — same data in two papers? | open |
| t1-09 | §3.6.2 | Clady's 15–34 % and 26–33 % are cited straight to Clady 1975 (abstract-only): say "via Forbes 1981" or read Clady | open |
| t1-09 | §3.6.2 | Forbes's nest-success range 44–86 % vs the paper's 44–96 % (Steinhart 2004): different compilations — say which | note |
| t1-09 | §3.6.8, `fish3.js:746` | Johnson & Evans 1991's "3.3 times greater mortality" is a regression prediction, not an observed rate ("died at 3.3 times") | open |
| t1-09 | `littoral3.js:71` | Credits Keast 1980 with "76–91 % of food from vegetation in sunfish < 75 mm", which the paper's Table 3.6-2 gives to Mittelbach 1984 | open |
| t1-09 | `config.js:1591, 1489` | Boulianne et al. 2025: nauplii are 34 % of the whole zooplankton (not of the copepods); ephippia 27 % of the whole Daphnia population at autumn overturn, 13 % under early ice (not "13–27 % of females") | open |
| t1-09 | §3.6.7 | Young bass "live singly or in small groups": Forbes says "solitary after dispersal" (and Ridgway p. 57 supports small groups — t1-10) | open |
| w2-05 | Table 3.6-1, §5.2 | Edsall 1970's eggs were landlocked Lake Michigan alewives, presented as sea-run alewife values | open |
| w2-05 | Table 3.6-9 | A ~35-mm first-winter threshold credited to Fox & Keast 1991 (via Sobchak et al. 2026) is not in its abstract | open |
| w2-05 | §3.6.3 | "(Graeb et al. 2004, abstract)" for "rotifers gave little or no growth" — not in the abstract; it is in the IISG final report on the same experiments (newly hatched larvae fed *Brachionus* only): cite that | open |
| w2-05 | `config.js:1447`; `PLANKTON.K_R` (1449) vs `ROT` (1513–14), §3.3.8 | Gilbert 1988 gives a lower Daphnia threshold only as a possibility; the comments disagree on where the rotifers' zero-growth food level sits (above Daphnia's vs 0.6 of it) | open |
| w2-05 | `config.js:1428` | "Fish take only ~10–30 % of zooplankton production" contradicts Mills & Forney 1983: young perch ate more than the *D. pulex* production in 1975 and 1977, < 27 % only in 1976 | open |
| w2-05 | §3.1.4; `ICE_SLOPE_V` | Malm et al. 1997 abstract: sediment heat flux 1–4.5 W m⁻² early winter, 0.5–3 late — the 0.6 lower bound is not Malm's; nothing supports the "few mm/s" down-slope current | open |
| w2-05 | Table 3.8-3, `fish3.js:927` | Harding 1997 cited as if read; the entry admits it is "cited only via VHS" — say so in the text and code | open |
| w2-05 | §5.2 | "Only 25–50 % of adult suckers spawn in a given year" uncited; it is Geen et al. 1966's abstract figure, possibly the two sucker species pooled | open |
| w2-03 | §3.6.1 | "Laid mainly on dead pondweed and reed": Čech 2012 names dead common reed and worm weed; "dead pondweed" can only be Čech et al. 2009 (abstract) | open |
| w2-03 | §3.5.7 | "The only Maine telemetry found" (Cole & Moring 1997) is too broad: Rapid River smallmouth radio-tracking (2005, *J. Freshwater Ecology*) and a second Green Lake paper (*Fisheries Research* 31(3): 269–273) exist — narrow to "the only Maine lake telemetry" | open |
| w2-03 | `species3`/model, Lorenzen 1996 | Lorenzen suggests non-predation mortality scales more steeply with size (b ≈ −0.43) — matters for the model's size-scaled "unsimulated M" | note |
| w2-03 | Rice et al. 1983 (FB4) | FB4 labels the set "adult" and notes "corrected RA & RQ"; the model applies it to young bass only — cite "as corrected in FB4" and say how it is used | open |
| w2-02 | `shoreline_development_effects.md` §1 → `config.js:803` | The note's Garrison figures (3.8 % vs 41 % light; 7.7 vs 157.2 g; 75.5 vs 140.8 invertebrates) came from a search summary and are not in the report (it gives 38–44 % at controls, 5/3/2 % under piers; 5 vs 107 g; 23 vs 61) — the light figures reached the code | open |
| w2-02 | §3.7.2, §5.4, `world.js:84`, `fish3.js:535` | Gaeta et al. 2018: "median 10–20 %, max 32–46 %" are interquartile ranges; the full ranges are 9–25 % and 32–57 % — the code's "field maxima" 0.32–0.46 are not maxima | open |
| w2-02 | §3.2.9, §4.6 (camps) | Shoreline lots 0.15–0.2 kg available P a year; Maine DEP's current guide (Stormwater Manual Vol. II, Table 3.2) gives 0.04–0.15 kg per new lot — the model's value is at or above its top | open |
| w2-02 | `src/species.js:293` | Credits Feiner et al. 2017 with maturity "females 11–18 cm, males 8–13"; Feiner gives female L50 14.4–23.3 cm, male 12.8–19 cm | open |
| w2-02 | `fish3.js:534` vs §3.7.2 | "Lawrence 1958" for "a pickerel can swallow any fish as deep as itself"; §3.7.2 cites Lawrence 1960 for pickerel gape — which paper holds it? | open |
| w2-02 | Tables 3.6-6, 3.6-7 (killifish) | "Linear growth to 49.5 mm by mid-October" (via COSEWIC 2014) conflicts with Keast & Eadie's abstract (plateau by early September; last sample early October) | open |
| w2-02 | `config.js:1361, 1580` | Gyllström 2005: the "crustacean 45–100 µg/L" is their total-zooplankton regression (rotifers included) at TP 12–30; "typically almost half" is the whole littoral group in shore-to-centre samples, not "chydorids up to half the zooplankton of weedy shallows" | open |
| w2-02 | §3.5.4 | Reeve et al. 2022: bass did not all stop feeding at ≤ 4 °C (by 2.2 °C all but one had; some fed at the coldest); "cooled to ~2.5 °C" is the respirometry experiment | open |
| w2-08 | Table 3.5-3 vs §4 (`04_…md:200`), `species.js:332` | White perch bioenergetics: the synthesis names striped bass (Hartman & Brandt 1995); the model uses FB4's yellow perch set and says the striped bass set was tried and rejected — Phase 2 item 5 | open |
| w2-08 | §3.6.10 | "The centrarchids compensate strongly after the egg stage" leans on Beyerle & Williams 1967, whose authors explain their null result by incomplete kill (re-spawning, new colonies), not compensation (Michigan IFR Report 1711, read in full) | open |
| w2-08 | §3.7.3 | Armstrong & Schindler 2011: the median population spends 18–53 % of days below a maintenance ration — they argue against reading low empty-stomach rates (Arrington et al. 2002) as energy balance; could stand beside them | open |
| w2-08 | §3.5.6 | "Radabaugh 2006, thesis abstract" may have a journal version (Radabaugh, Bauer & Brown 2010, NAJFM 30(1): 179–190) — unverified | open |
| w2-08 | `egg_stage.md` §1.8 | Breder's mean 21.3 °C and 6–10 d are pooled aquarium + pool values, not "outdoor pool data" (the pool nests alone: 7–9 d at 20.8 °C) | open |
| w2-08 | `config.js:858` | The 25–42 mm threshold credited to Bernard & Fox 1997 is the project's inference | open |
| w2-07 | §4.5, `fish3.js:8` | Super-individual rules credited to Scheffer et al. 1995: only the super-individual and "losses take a fraction of n" are Scheffer's. A strike taking one fish, crowding from Σn × mass and a merged school keeping one parent's genome are not (Scheffer's merge is the cluster centroid, p. 163; below n = 1 a daily 0.1 draw decides extinction) — Parry & Evans 2008 to check | open |
| w2-07 | §5.8, `fish3.js:550` (PIKE_JUV) | Wieser et al. 1992's −0.24 is the exponent of ad-lib specific growth rate (8–1,600 mg, 15 °C, eq. 5), not a Cmax exponent; the data stop at 1.6 g, not 10 g. The note `esocid_larval_energetics.md` said "growth exponent"; the paper and code made it "Cmax exponent" | open |
| w2-07 | §3.2.2; `shoreline_development_effects.md` | Robertson et al. 2019: nitrate-N 0.1–76 mg/L is the 13 non-calcareous sites only; all sites 0.1–107 (Table 3, p. 645). `config.js:827`'s 95 % retention is a project value between the source's 90 % and 97 % | open |
| w2-07 | `config.js:1307, 1320` | Vander Zanden & Vadeboncoeur 2002: 65 % is total reliance including prey fish fed by bottom invertebrates, not "food from the bottom" | open |
| w2-07 | Table 4.3 (alewife) | Stewart & Binkowski 1986: Lake Michigan fish ≤ 73 g (sea-run adults ~230 g); Cmax exponent −0.30 assumed; "landlocked" not in the source; a constant ED 5,400 J/g sits in a 5,000–9,500 J/g cycle (the authors report −45 % to +104 % errors within seasons with ED held constant) | open |
| w2-07 | §4.5 | The f⁴ foraging-split rule credited near Wu & Culver 1992 looks like the project's own construction | open |
| w2-07 | Table 3.6-9 (lead for Post_Evans_1989) | Boussion 2025 (p. 33) relays Post & Evans: young perch reaching 70 mm had low winter starvation mortality | note |
| w2-06 | §5.4; §4.5 | Persson et al. 2004: the perch cannibal window peaks at φ 0.16 (range 0.05–0.45), not 0.19; the code credits 0.19 to Persson & Brönmark 2002 — cite that alone, fix §5.4's "19 %" | open |
| w2-06 | `plants3.js:206` | Randall et al. 2004's 0 % cover on exposed coarse beds uses a 12.4-km maximum fetch; at Hot Brook's < 3-km fetches coarse beds fall in the 30 % node — weak support for no plants on boulder–cobble | open |
| w2-06 | §3.7.8, `fish3.js:396` | Lippert et al. 2007: 83 mm is a six-lake mean, driven by recently invaded lakes; habitat use was never measured (body form only); 6 of the 18 lakes had no predators | open |
| w2-06 | `config.js:488`, §3.6.2 (Neves 1975) | Forbes 1981 Table 1 relays South Branch Lake nest success 67–68 % (15–30 nests); the paper and code say 67 % and 77 % — needs the article | open |
| w2-06 | Table 3.5-3 (bullhead) vs `fish3.js:710–715` | Energy density 6,700 J/g (FB4) in the table; the model switches to 5,000 J/g | open |
| w2-06 | `config.js:488` | Smallmouth whole-nest success "45–86 %": Forbes 1981 Table 1 spans 44–86 % (Millen Bay 44 %) | open |
| w2-06 | Krieger et al. 1983 entry; code | The title reads "Habitat suitability information: yellow perch"; maturity females 3–4 yr, males a year earlier; "schools sorted by size" is not in the report (a New Jersey fact sheet) | open |
| w2-06 | Hartman & Brandt 1995 (Phase 2 item 5) | FB4's rows credited to it (striped bass adult, age-0, -1, -2; bluefish 0–2; weakfish age-0) are in its evidence notes; Cmax for 100 g at 18.5 °C 0.093 g/g/d; the abstract: the model over-estimated striped bass consumption by 20–46 % at 6.9 °C | note |
