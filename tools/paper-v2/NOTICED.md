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
