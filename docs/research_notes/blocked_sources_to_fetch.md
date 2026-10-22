| C43 (still wanted (Cargnelli & Gross 1996, CJFAS 53:360)) || B04 (identified: Bernard & Fox 1997 — abstract read (first_winter_mortality.md); full text still wanted) || A10 (still wanted: Shuter et al. 1989 lab endurance; the bass rule comes from Shuter 1980 via USGS SIR 2014-5164) || A07 (abstract formula used in first_winter_mortality.md — PMORT(WD, FL) at 4 and 2.5 °C; full text still wanted) || A06 (abstract-level numbers in first_winter_mortality.md; full text still wanted) |# Blocked sources to fetch

This is every source the project's research could not read because of a paywall, a login, an HTTP 401/402/403/429 error, a bot check or CAPTCHA, a dead host, a scanned PDF with no text, or a file too large for the fetch tool. It was compiled on 2026-10-19 from the notes alone (`docs/research_notes/**` and `docs/reports/`), with no new web access. Duplicates across notes are merged into one row.

The ranking is by use to the Hot Brook simulation. Maine sources come first, then the sources the current problem needs: the first multi-year runs collapse in years 2–3, so natural mortality, first-winter survival and predation come next.

## How to send fetched files back
- Put each file in `docs/research_notes/fetched/` and name it after its row, e.g. `A01_Warner1973.pdf` or `B24_MarcyQuay2021.pdf`.
- For a web page, such as Lakes of Maine, save it as PDF or HTML, or paste its text into `A02_LakesOfMaine_1076.txt`.
- Then tell Claude which rows you dropped in, e.g. "fetched A01, A06, B24". Claude will read them and update the notes that cite them.
- Replies to data requests (bottom of the page) go in the same folder.

## Before you start
- **maine.gov** refuses scripted fetches but opened in the app's built-in browser (`recent_maine_research.md`). Claude may be able to read the MDIFW plans and survey sheets itself if you allow the built-in browser. Try that before fetching them by hand.
- **A library login gets most of the rest.** Wiley, Taylor & Francis, Canadian Science Publishing, Springer, JSTOR and OUP account for most rows. The old journal papers (1941–1973) are good interlibrary-loan requests.
- **Some rows only need a download.** Several files were simply over the fetch tool's 10 MB limit (marked "> 10 MB").
- **Cited in** gives note file names under `docs/research_notes/<folder>/`. "report:" means `docs/reports/`.

---

## A. Most useful (20)

| # | Source | Link | Blocked by | Cited in | What it would settle |
|---|---|---|---|---|---|
| A01 | Warner, K. 1973. Spring food of chain pickerel in Maine lakes. *TAFS* 102:149–151 — **Fetched ✓ (see fetched_sources_digest.md): p. 149 only; pp. 150–151 still needed** | none in notes (TAFS vol. 102, p. 149) | OUP paywall; T&F 403; no online abstract | predator_diets_and_prey_mortality ("the single most useful missing source"; "worth an interlibrary loan"); centrarchid_percid_esocid_parameters | What Maine pickerel eat after ice-out (perch, sucker, sunfish, crayfish shares) |
| A02 | Lakes of Maine pages for Upper (MIDAS 1076) and Lower (1072) Hot Brook Lake: overview, water quality, chemistry, mussels | [1076](https://www.lakesofmaine.org/lake-overview.html?m=1076); [1072](https://www.lakesofmaine.org/lake-overview.html?m=1072) | bot check ("verify you are not a bot"); blocked the fetch tool, curl and the browser | hot_brook_lake_records, recent_maine_research, invertebrates_plankton_plants, maine_limnology_streams, maine_fish_community_hot_brook, littoral_invertebrates (+6 more) | Any measured Secchi, colour, TP, chl-a, pH, DO; mean depth, flushing, watershed area; which mussels |
| A03 | MDIFW lake survey sheets, Upper and Lower Hot Brook Lake (surveyed Aug 1949; revised 1965, 2004) — **Fetched ✓ (see fetched_sources_digest.md)** | [Upper](https://www.maine.gov/IFW/docs/lake-survey-maps/washington/hot_brook_lake_upper.pdf); [Lower](https://www.maine.gov/IFW/docs/lake-survey-maps/washington/hot_brook_lake_lower.pdf) | maine.gov 403 (quoted in an earlier pass) | drainage_species_and_eel, eastern_maine_relative_abundance, lake_outlet_stream_ecology, weather_and_catchment_hydrology | The 1949 netting methods and effort (what "absent" means), and whether there is an outlet dam |
| A04 | MDIFW *White Perch Management Plan* (M. R. Smith, 2002) — **Fetched ✓ (see fetched_sources_digest.md)** | [whiteperch.pdf](https://www.maine.gov/ifw/docs/strategic-management-plans/whiteperch.pdf) | maine.gov 403 since an early partial read (a mirror was deliberately not used) | white_perch_regulation, size_structure_whiteperch_sucker_bullhead, eastern_maine_relative_abundance, movement_between_lakes, species_numbers_northern_lakes | Maine white perch growth, length at age, stunting, spawning: the lakes' most numerous fish |
| A05 | Cooper 1941. MDIFW *Fish Survey Report No. 4* (Androscoggin and Kennebec drainages) — **Fetched ✓ (see fetched_sources_digest.md)** | digitalmaine.com (no URL in notes) | digitalmaine.com 403 | size_structure_whiteperch_sucker_bullhead, white_perch_regulation | Maine white perch growth tables and adult mortality (A ≈ 0.50–0.56 against the sim's ~0.30) |
| A06 | Johnson & Evans 1991. *CJFAS* 48:672–680 (winter behaviour, energetics and mortality of young white vs yellow perch) | none in notes (CJFAS 48:672) | Canadian Science Publishing 403 | white_perch_regulation | White perch's higher winter cost, which `species.js` cites unread |
| A07 | Johnson & Evans 1990. *TAFS* 119:301–313 (first-winter survival of young white perch, lab) | [OUP](https://academic.oup.com/tafs/article/119/2/301/7891805) | abstract only; full text paywalled | white_perch_regulation | Sizes tested and feeding at 2.5 °C, giving the age-0 survival curve by size and winter length |
| A08 | Saila 1956. *Limnol. Oceanogr.* 1:195–201 (pickerel age frequencies, exploited vs unexploited Rhode Island ponds) | [doi 10.4319/lo.1956.1.3.0195](https://aslopubs.onlinelibrary.wiley.com/doi/10.4319/lo.1956.1.3.0195) | Wiley 403 | pickerel_population_dynamics ("the paper to get by library") | The only known natural mortality (Z) for chain pickerel |
| A09 | Raney 1942. *J. Wildl. Manage.* 6:58–66 (chain pickerel in a small New York pond; 234 stomachs; young of year) | none in notes (JSTOR) | JSTOR | predator_diets_and_prey_mortality, pickerel_young_of_year, pickerel_mortality_cannibalism, species_numbers_northern_lakes | First-hand pickerel diet (crayfish 42 %, bullhead preference) and young-pickerel growth |
| A10 | Shuter, Ihssen, Wales & Snucins 1989. *J. Fish Biol.* 35:765–780 (young smallmouth bass over winter) | [Wiley](https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1095-8649.1989.tb03028.x) | Wiley 403 | predator_winter_energetics | First-winter starvation of young bass by size and temperature (the equations are not in the abstract) |
| A11 | MDIFW *Black Bass Management Plan* (R. Jordan, 2001) — **Fetched ✓ (see fetched_sources_digest.md)** | [blackbass.pdf](https://www.maine.gov/IFW/docs/strategic-management-plans/blackbass.pdf) | maine.gov 403 (snippets only) | eastern_maine_relative_abundance, nest_guarding_costs, predator_diets_and_prey_mortality | Maine bass nest timing, first-winter rule (~200 days below 50 °F), the data sections |
| A12 | MDIFW Bass Technical Work Group slides, Nov 2019 — **Fetched ✓ (see fetched_sources_digest.md)** | [BTWG](https://www.maine.gov/ifw/docs/BassTechnicalWorkGroupNov2019.pdf) | maine.gov 403 | eastern_maine_relative_abundance | Maine smallmouth catch per hour and size structure |
| A13 | MDIFW yellow perch plan | [yellowperch.pdf](https://www.maine.gov/ifw/docs/yellowperch.pdf) | maine.gov 403 | eastern_maine_relative_abundance | Maine yellow perch length at age |
| A14 | Rupp & DeRoche 1965. *TAFS* 94:9 (rotenone standing crops, three small Maine lakes) — **Fetched ✓ (see fetched_sources_digest.md)** | [OUP](https://academic.oup.com/tafs/article/94/1/9/7894050); [scan](https://arc.lib.montana.edu/robert-behnke/objects/2491-36-10.pdf) | scan > 10 MB; abstract has no numbers | report: Maine lakes ponds and streams; white_perch_regulation; fish_numbers_and_new_species; species_numbers_northern_lakes | The only Maine whole-lake fish standing crop (kg/ha) |
| A15 | Dudley & Trial 2014. USGS SIR 2014-5164 (Spednic Lake, Washington Co.) — **Fetched ✓ (see fetched_sources_digest.md)** | [record](https://pubs.usgs.gov/publication/sir20145164); [PDF](https://pubs.usgs.gov/sir/2014/5164/pdf/sir2014-5164.pdf) | HTTP 500 on the later pass (the PDF was read earlier for days below 10 °C) | eastern_maine_relative_abundance; report: Maine lakes ponds and streams | Growth and mortality of under-yearling bass, 1970–2008, in a nearby lake |
| A16 | Begley, Coghlan & Zydlewski 2017. *NAJFM* 37:510–523 (harvested vs reference Maine white suckers) | [doi 10.1080/02755947.2017.1290719](https://doi.org/10.1080/02755947.2017.1290719) | T&F 403 | size_structure_whiteperch_sucker_bullhead | Maine sucker growth, age structure and mortality in unfished lakes |
| A17 ✓ (fetched 2026-10-19 eve; read — fetched_sources_read_by_me.md, second batch) | Zydlewski, Begley & Coghlan 2019. *J. Freshw. Ecol.* (modelling white sucker harvest) | [USGS record](https://www.usgs.gov/publications/modeling-white-sucker-catostomus-commersonii-populations-assess-commercial-harvest) | T&F 403 | size_structure_whiteperch_sucker_bullhead | Sucker survival parameters; spawning-run age structure (4 % ≥ age 10) |
| A18 | AuClair 1956/1960 (Sebasticook Lake, Maine; white perch thesis) | none in notes | UMaine Digital Commons retired (moved to "Specto") | whiteperch_shiner_sucker_bullhead ("the key Maine source"), white_perch_regulation | Maine white perch spawning temperature (18–21 °C vs 15 °C), winter depth, catch curves |
| A19 | Bryant 1972 (South Branch Lake, Maine; white perch) | none in notes | UMaine repository retired; grey literature | white_perch_regulation | A Maine landlocked white perch catch curve |
| A20 | Hines 1981 (a stunted eutrophic Maine pond; white perch) | none in notes | UMaine repository retired; grey literature | white_perch_regulation | Stunted Maine white perch growth and mortality |

---

## B. Useful (51)

| # | Source | Link | Blocked by | Cited in | What it would settle |
|---|---|---|---|---|---|
| B01 | MDIFW survey sheets for nearby lakes: Baskahegan, Crawford, Long, Marks, Meddybemps, Southwest Pond, Pleasant River Lake; Webb, Burntland, Third, Pierce, George, South Branch; Little Fish Pond; Orange Lake; 1958 Aroostook maps | [index](https://www.maine.gov/IFW/docs/lake-survey-maps/) | maine.gov 403 | drainage_species_and_eel, eastern_maine_relative_abundance, size_structure_whiteperch_sucker_bullhead, movement_between_connected_lakes, predator_diets_and_prey_mortality | Regional fish lists (eel, shiner records), white perch sizes, pickerel food, beaver dams as barriers |
| B02 | MDIFW non-sport and commercial species plan | [nonsportcommercial.pdf](https://www.maine.gov/IFW/docs/strategic-management-plans/nonsportcommercial.pdf) | maine.gov 403 | size_structure_whiteperch_sucker_bullhead, eastern_maine_relative_abundance | The "5–8 in" Maine sucker maturity `species.js` cites; minnow and killifish statements |
| B03 | MDIFW species pages: white perch, redbreast sunfish, chain pickerel | [white perch](https://www.maine.gov/ifw/fish-wildlife/fisheries/species-information/white-perch.html); [redbreast](https://www.maine.gov/ifw/fish-wildlife/fisheries/species-information/redbreast-sunfish.html) | maine.gov 403 | size_structure_whiteperch_sucker_bullhead, habitat3d_new_species, pickerel_mortality_cannibalism | Maine sizes at age; redbreast as the brook's sunfish |
| B04 | Pumpkinseed overwinter survival by size and density (central Ontario, lab). *NAJFM* 17:581 (1997) | [T&F](https://www.tandfonline.com/doi/abs/10.1577/1548-8675(1997)017%3C0581:EOBSAP%3E2.3.CO;2) | T&F 403; authors not seen | recruitment_compensation_maturity | Age-0 sunfish winter survival vs size and crowding |
| B05 | Todd, Young, Owen & Gramlich 1982. Food habits of bald eagles in Maine. *J. Wildl. Manage.* 46:636–645 | [citation](https://speciesconnect.com/?p=272544) | tables not obtained | maine_fish_community_hot_brook, pickerel_mortality_cannibalism | Which fish Maine eagles take, and how many |
| B06 | Whittier & Kincaid 1999. *TAFS* 128:769–783 | [OUP issue](https://academic.oup.com/tafs/issue/128/5) | OUP; full paper not obtained | maine_fish_community_hot_brook | How introduced bass and pickerel cut minnows in Northeast lakes |
| B07 | Hinch & Collins 1991. *TAFS* 120:657 (smallmouth nest guarding) | [OUP abstract](https://academic.oup.com/tafs/article/120/5/657/7891610) | T&F 403 (abstract read) | nest_guarding_costs, largemouth_bass | Guarding males' ration and energy loss |
| B08 | Gillooly & Baylis 1999. *J. Fish Biol.* 54:573–584 | [Wiley](https://onlinelibrary.wiley.com/doi/10.1111/j.1095-8649.1999.tb00636.x) | Wiley 403 | nest_guarding_costs | Lean vs fat loss in nesting bass |
| B09 | Evans 1984. *TAFS* 113:494–512 (pumpkinseed standard metabolism through the year) | [DFO synopsis](https://waves-vagues.dfo-mpo.gc.ca/Library/337845.pdf) | not obtained | centrarchid_percid_esocid_parameters | Pumpkinseed winter respiration |
| B10 | Fox 1994. *Ecology* 75:1157–1171 (27 pumpkinseed populations) | [QUBS summary](https://research.qubs.ca/projects/growth-density-and-interspecific-influences-on-pumpkinseed-sunfish-life-histories) | paywalled | recruitment_compensation_maturity, species_numbers_northern_lakes, forage_fish_early_life | Pumpkinseed density vs growth; size at maturity |
| B11 | Danylchuk & Fox 1994. *Env. Biol. Fish.* 39:119 (stunted pumpkinseed) | — | paywalled | recruitment_compensation_maturity, centrarchid_percid_esocid_parameters | Female L50 and spawning in a stunted lake |
| B12 | Shuter & Post 1990. *TAFS* (smallmouth bioenergetics) | — | blocked | largemouth_bass, centrarchid_percid_esocid_parameters | Whether FB4's smallmouth row (negative growth at full ration) is a typo |
| B13 | Hartman & Brandt 1995. *TAFS* 124:347 (estimating fish energy density) | — | could not access | sucker_shiner_bullhead_trout_parameters | White perch energy density |
| B14 | Chen & Harvey 1995 (*TAFS* 124:262–271) and 1999 | [1995 record](https://researchconnect.stonybrook.edu/en/publications/growth-abundance-and-food-supply-of-white-sucker/) | not accessible; 1999 page 403 | fish_numbers_and_new_species, species_numbers_northern_lakes | White sucker numbers per hectare |
| B15 | Trippel & Harvey 1987 (white sucker) | — | not accessible; not found online | fish_numbers_and_new_species, species_numbers_northern_lakes | White sucker numbers per hectare |
| B16 | NH Fish & Game 2017. *Assessment of white perch, Lake Winnipesaukee 2016* | [PDF](https://www.wildlife.nh.gov/sites/g/files/ehbemt746/files/inline-documents/sonh/assessment-white-perch-winnipesaukee-2016.pdf) | 403 | species_numbers_northern_lakes, size_structure_whiteperch_sucker_bullhead | New England white perch growth and size structure |
| B17 | Coffie 1998. *Can. Field-Nat.* 112 (status of the chain pickerel in Canada) | BHL (no URL) | BHL 403 | pickerel_population_dynamics, predator_diets_and_prey_mortality | A compiled pickerel life history |
| B18 | Foote & Blake 1945. *J. Wildl. Manage.* 9:89–96 (Babcock Pond, CT) | — | JSTOR | pickerel_young_of_year, predator_diets_and_prey_mortality, pickerel_mortality_cannibalism | Pickerel switching from insects to fish by size |
| B19 | Underhill 1949. *J. Wildl. Manage.* 13:377–391 (and Underhill 1948, Cornell PhD) | — | JSTOR | pickerel_young_of_year, predator_diets_and_prey_mortality | Monthly pickerel growth in New York |
| B20 | Carlander 1969. *Handbook of Freshwater Fishery Biology*, vol. 1 | archive.org lending | restricted lending copy | pickerel_young_of_year, pickerel_population_dynamics, forage_fish_early_life | Standing crops, growth and age tables for every species in the lakes |
| B21 | Helfman 1981. *CJFAS* 38:1405–1420 (twilight activity) | — | 403 / paywalled | whiteperch_shiner_sucker_bullhead, perch_pickerel_smallmouth_pumpkinseed | Dawn and dusk activity by species, possibly pickerel |
| B22 | Emery 1973. *JFRBC* 30:761–774 (day vs night in Ontario lakes) | — | 403 / paywalled | whiteperch_shiner_sucker_bullhead, perch_pickerel_smallmouth_pumpkinseed | Night habits of each species |
| B23 | Magnuson et al. 1985 (winter hypoxia behaviour); Klinger, Magnuson & Gallepp 1982 | — | paywalled / 403 | whiteperch_shiner_sucker_bullhead, perch_pickerel_smallmouth_pumpkinseed | How fish move under ice as O₂ falls |
| B24 | Marcy-Quay & Kraft 2021. *Northeast. Nat.* 28:430–443 (suckers commuting between two lakes) | [abstract](https://www.eaglehill.us/NENAonline/articles/NENA-28-4/11-Marcy-Quay.shtml) | paywall; NY AFS page 403 | movement_between_lakes, whiteperch_shiner_sucker_bullhead | How many suckers cross a short channel nightly, and the channel's size |
| B25 | Daniels et al. 2008. *Northeast. Nat.* 15(4):577 (fish movement among Adirondack lakes) | [abstract](https://www.eaglehill.us/NENAonline/articles/NENA-15-4/18-Daniels.shtml) | RPI DSpace 403 | movement_between_lakes; report: Fish in streams connecting lakes | Tag and recapture counts per species between lakes |
| B26 | Schmitt & Hubert 1983. *Proc. Iowa Acad. Sci.* 90:103–106 (Okoboji yellow perch) | [UNI](https://scholarworks.uni.edu/pias/vol90/iss3/8) | PDF 403 | movement_between_lakes | How many perch shift between connected lakes in autumn and spring |
| B27 | Parsons & Reed 2005. *NAJFM* 25:689–695 (Minnesota lake chain) | [abstract](https://informahealthcare.com/doi/abs/10.1577/M04-021.1) | 403 | movement_between_lakes | Sunfish emigration rates; channel types |
| B28 | Lake Ontario tributary smallmouth telemetry (*J. Freshw. Ecol.* 1988; 1985–86) | [SUNY SOAR](https://soar.suny.edu/entities/publication/cef37268-63b2-4fbf-9e14-87e9fea7c510) | 403 | bass_pickerel_in_connecting_streams, movement_between_connected_lakes | Authors, distances, how many bass stay in a stream all summer |
| B29 | Harvey 1991; Harvey & Stewart 1991 (predation on stream minnows) | — | Springer login | minnows_and_sunfish_in_connecting_streams | Field predation rates on brook minnows |
| B30 | Connecticut River relicensing reports with fallfish nest tables (Great River Hydro Study 14/15, 2016; Northfield) | [final report](https://relicensing.greatriverhydro.com/wp-content/uploads/simple-file-list/Documents/50-Study-Reports/130-Study-Reports-1-33/Study-14-and-15-Resident-Fish-Spawning/11-30-16-TC-Study-14_15-Revised-Final-Report.pdf); [interim](https://relicensing.greatriverhydro.com/wp-content/uploads/simple-file-list/Documents/50-Study-Reports/130-Study-Reports-1-33/Study-14-and-15-Resident-Fish-Spawning/TC_S14_S15_Spawning_Interim_Report_2016_03_01.pdf) | > 10 MB | fallfish_spawning_brook | Fallfish nest counts, sizes and dewatering |
| B31 | Adams & Hankinson 1928 (Oneida Lake fishes) | HathiTrust / BHL | 403 | fallfish_spawning_brook | Fallfish spawning on lake margins vs streams |
| B32 | Ross 1983. *Env. Biol. Fish.* 9:65–70 (fallfish) | [Springer](https://link.springer.com/article/10.1007/BF00001059) | Springer login | fallfish_spawning_brook, habitat3d_new_species | Fallfish nest-building details |
| B33 | Borowiec et al. 2020. *J. Exp. Biol.* 223:jeb209692 (*Fundulus* hypoxia tolerance) | [JEB](https://cob.silverchair.com/jeb/article/223/4/jeb209692/223791/Interspecific-variation-in-hypoxia-tolerance-and) | PMC bot check | habitat3d_new_species | Banded killifish O₂ limits in mg/L |
| B34 | Lake–stream transition zones and unionid mussels: a 35-year study (2021) | [INIS](https://inis.iaea.org/records/8bv40-we758) | 402 | lake_outlet_stream_ecology | Mussel density at lake outlets (the brook mouth) |
| B35 | Hanson & Leggett 1982. *CJFAS* 39:257–263 (also Downing et al. 1990) | [doi 10.1139/f82-036](https://cdnsciencepub.com/doi/10.1139/f82-036) | CSP 403 | whole_lake_energy_flow, species_numbers_northern_lakes | Fish biomass from total P: the coefficients |
| B36 | Pierce, Rasmussen & Leggett 1994. *CJFAS* 51:1128 (also Pierce et al. 1990, *CJFAS* 47:1004) | [1994](https://cdnsciencepub.com/doi/10.1139/f94-112); [1990](https://cdnsciencepub.com/doi/10.1139/f90-115) | CSP 403 | small_fish_numbers | Littoral fish per m², with seine-efficiency corrections |
| B37 | Rasmussen & Kalff 1987; Rasmussen 1988 (*CJFAS* 45:1436) | — | 403 / paywalled | invertebrates_plankton_plants, littoral_invertebrates, whole_lake_energy_flow | Bed-invertebrate biomass vs depth, slope, chlorophyll |
| B38 | Cyr & Downing 1988 (invertebrates on plants) | — | paywalled (403) | littoral_invertebrates, invertebrates_plankton_plants, plant_species_traits | Invertebrates per gram of plant, by species |
| B39 | Momot & Gowing 1977 (*JFRBC* 34:2041); France 1985 (*CJFAS* 42:1096) | — | paywalled | invertebrates_plankton_plants | Virile crayfish per m², rock vs mud |
| B40 | Chambers & Kalff 1985 (*CJFAS* 42:701); Canfield et al. 1985 | — | paywalled / 403 | invertebrates_plankton_plants, maine_limnology_streams | Plant depth limit from Secchi |
| B41 | Babin & Prepas 1985 (under-ice O₂ depletion) | — | could not be retrieved | weather_and_catchment_hydrology | Winter O₂ loss rate for a shallow lake |
| B42 | Warner & Saros (storm DOC pulses in Maine lakes) | [UMaine Mitchell Center](https://umaine.edu/mitchellcenter/?p=18747) | not accessible | weather_and_catchment_hydrology | DOC (mg/L) after storms in Maine lakes |
| B43 | Deeds et al. 2023 (Maine littoral habitat; NLA data) | [PMC10642257](https://pmc.ncbi.nlm.nih.gov/articles/PMC10642257/) | PMC reCAPTCHA; abstract only | shore_geometry_and_vegetation; report: Maine lake shores and catchment | Littoral slope, sand cover, bank types of Maine lakes |
| B44 | Francis & Schindler 2009. *Oikos* 118:1872 | [doi 10.1111/j.1600-0706.2009.17723.x](https://doi.org/10.1111/j.1600-0706.2009.17723.x) | 403 / Cloudflare | land_lake_subsidies | Insect fall-in flux vs distance from shore |
| B45 | Gasith & Hasler 1976 (*L&O* 21:253); France & Peters 1995 | [doi 10.4319/lo.1976.21.2.0253](https://doi.org/10.4319/lo.1976.21.2.0253) | not accessible | land_lake_subsidies | Leaf-litter input per metre of shore vs distance |
| B46 | Barr 1996. *Hydrobiologia* 321:119–144 (common loon) | [record](https://wicri-demo.istex.fr/Wicri/Eau/explor/LotaV3/Site/fr/Main/Exploration/bibRecord.php?hk=001142) | not accessible (abstract only) | shore_birds_and_mammals | Loon prey sizes and species shares |
| B47 | Biodiversity Research Institute (BRI) Maine loon reports | — | could not be opened | shore_birds_and_mammals | Maine loon numbers and chick success |
| B48 | Hunter et al. *Maine Amphibians and Reptiles* (1999 and 3rd ed.) | — | book; not accessible | turtles_and_frogs | Maine painted turtle nesting dates, distances, predation |
| B49 | Marchand & Litvaitis 2004 (New Hampshire painted turtles) | [UNH](https://scholars.unh.edu/nhaes/202) | densities not accessible | turtles_and_frogs | Painted turtle density in New England |
| B50 | Consortium of Northeastern Herbaria (holds the UMaine herbarium) | portal.neherbaria.org | connection failed | plant_species_hot_brook | Plant specimens from Danforth or Weston not in GBIF |
| B51 | PEARL (pearl.maine.edu) | pearl.maine.edu | refused connections | recent_maine_research, shore_geometry_and_vegetation | Any Maine water-quality or shoreline survey of the lakes |

---

## C. Nice to have (99)

Several rows here bundle related papers that share a blocker and a purpose; every paper is named in its row.

### C1. Fish life history, movement and behaviour

| # | Source | Link | Blocked by | Cited in | What it would settle |
|---|---|---|---|---|---|
| C01 | Oliveira & McCleave 2000. *Env. Biol. Fish.* (Maine river eels) | [Springer](https://link.springer.com/article/10.1023/A:1007631108201) | Springer sign-in | drainage_species_and_eel | Yellow-eel density and growth in Maine |
| C02 | Oliveira, McCleave & Wippelhauser 2001. *J. Fish Biol.* 58:943–952 | [doi](https://doi.org/10.1111/j.1095-8649.2001.tb00546.x) | full text not read | drainage_species_and_eel | Eel sex ratio vs lake area |
| C03 | Maine DMR trap counts 2024 | [PDF](https://www.maine.gov/dmr/sites/maine.gov.dmr/files/inline-files/Trap%20Counts%20for%20Web%20Page%202024.pdf) | 403 | drainage_species_and_eel | Penobscot alewife and eel passage |
| C04 | Lower Hot Brook real-estate listings (low reliability) | [LandBroker](https://www.landbrokermls.com/property/583577/log-cabin-on-lower-hot-brook-lake) | 429; sister page 404 | drainage_species_and_eel, eastern_maine_relative_abundance | Whether anyone claims trout or salmon (unverified) |
| C05 | MDIFW 2016 angler survey | [PDF](https://www.maine.gov/IFW/docs/anglerreport_2016.pdf) | maine.gov 403 | eastern_maine_relative_abundance | Angler effort by species |
| C06 | Tabor et al. 2012. *Northwest Science* 86(2) (Ship Canal smallmouth) | [BioOne](https://complete.bioone.org/journals/Northwest-Science/volume-86/issue-2/046.086.0205/Seasonal-Movements-of-Smallmouth-Bass-in-the-Lake-Washington-Ship/10.3955/046.086.0205.full) | BioOne empty page | bass_pickerel_in_connecting_streams, movement_between_lakes | Bass movement through a canal between lakes |
| C07 | Grass pickerel movement, Beaver Creek, Ontario. *Movement Ecology* 2023 | [doi 10.1186/s40462-023-00420-2](https://movementecologyjournal.biomedcentral.com/articles/10.1186/s40462-023-00420-2) | Springer login redirect | bass_pickerel_in_connecting_streams | Pickerel dispersal distances in channels |
| C08 | Clear Lake, Iowa, sunfish homing (1964) | [CORE](https://core.ac.uk/works/64833382) | 403 | movement_between_connected_lakes, minnows_and_sunfish_in_connecting_streams | Sunfish home-site fidelity |
| C09 | Relocated blacknose dace. *J. Appalachian Studies* 21:49 | [link](https://scholarlypublishingcollective.org/uip/jas/article/21/1/49/225708/Dispersal-and-Reproduction-of-Relocated-Blacknose) | 403 | minnows_and_sunfish_in_connecting_streams | Dace dispersal |
| C10 | MassWildlife fallfish and blacknose dace pages | [fallfish](https://www.mass.gov/info-details/fallfish) | 403 | minnows_and_sunfish_in_connecting_streams, eastern_maine_relative_abundance, fallfish_spawning_brook | Agency life-history notes |
| C11 | NH Fish & Game fallfish page; NH minnow ID poster | [fallfish](https://www.wildlife.nh.gov/fishing-new-hampshire/fish-species-nh/fallfish) | 403 | fallfish_spawning_brook, habitat3d_new_species, minnows_and_sunfish_in_connecting_streams | Fallfish spawning movement |
| C12 | Hill & Grossman 1987. *Copeia* 1987:376–380 | [LTER](https://lternet.edu/biblio/home-range-estimates-for-three-north-american-stream-fishes) | host did not resolve | minnows_and_sunfish_in_connecting_streams | Stream-fish home ranges |
| C13 | Gerking 1953 (fish home ranges review) | [PDF](https://www.fs.usda.gov/biology/nsaec/fishxing/fplibrary/Gerking-1953.pdf) | scan, no text layer | minnows_and_sunfish_in_connecting_streams, movement_between_connected_lakes | Primary sunfish and bullhead fidelity numbers |
| C14 | Magee 1989. MS thesis, Univ. Richmond (fallfish) | [record](https://scholarship.richmond.edu/masters-theses/554) | PDF 403 | fallfish_spawning_brook | Fallfish nest numbers |
| C15 | Maurakis et al. 1990. *SFC Proceedings* (pebble nests of *Semotilus*) | — | Anubis bot wall | fallfish_spawning_brook | Fallfish nest size |
| C16 | Noble 1965 (PDF) | — | 403 | fallfish_spawning_brook | Fallfish spawning |
| C17 | Connecticut dace riffle paper (full text) | — | 403 | fallfish_spawning_brook | Dace crossing riffles |
| C18 | Johnson et al. 2010, AFS abstract (Paper 1726) | afs.confex.com | DNS failure | fallfish_spawning_brook | Fallfish (abstract only) |
| C19 | Fish 1982. MS thesis, Loyola Univ. Chicago (= Fish & Savitz 1983, *TAFS* 112:147) | [record](https://ecommons.luc.edu/luc_theses/3310) | PDF 403 | fish_movement_and_groups | Home range and speeds of bass, perch, pumpkinseed |
| C20 | York River white perch home range (*TAFS*, doi 10.1577/T08-176.1); grass pickerel tagging (*Fishes* 4(3):43) | [TAFS](https://www.tandfonline.com/doi/abs/10.1577/T08-176.1); [MDPI](https://www.mdpi.com/2410-3888/4/3/43) | could not be opened | fish_movement_and_groups | Confirms home-range numbers seen in digests |
| C21 | Penney, Litt & Purchase 2019. *J. Freshw. Ecol.* (killifish hatching temperature) | [DOAJ](https://doaj.org/article/83663b7cde4b4cfd9c8970ab0e61c635) | DOAJ 403 | habitat3d_new_species | Killifish hatch success by temperature |
| C22 | Chippett 2004. MUN thesis (Indian Bay killifish) | — | > 10 MB | small_fish_numbers, habitat3d_new_species | Killifish habitat area and night movement |
| C23 | Catamaran Brook diel paper (*J. Fish Biol.* 2013) | openpolar.no | certificate error | habitat3d_new_species | Dace diel behaviour |
| C24 | Katopodis & Gervais 2016. DFO swimming-performance database (~550 pp) | — | > 10 MB | habitat3d_new_species, movement_between_lakes | Burst speeds of the lakes' species |
| C25 | Winant 2019. Plymouth State thesis (Mirror Lake, NH) | [record](https://summit.plymouth.edu/items/32f1a602-aed0-46e5-9548-e38ffe47ef83) | 403 | fish_numbers_and_new_species | NH perch and pumpkinseed numbers |
| C26 | Mazsa 1973. Cornell | — | 403 | fish_numbers_and_new_species | NH perch, pumpkinseed, bass estimates |
| C27 | Sowards et al. 2021. *NAJFM* (white perch gill-net selectivity) | — | OSU PDF 403 | size_structure_whiteperch_sucker_bullhead | Correcting net samples of small white perch |
| C28 | Rubec & Qadri 1982 | BHL | 403 | size_structure_whiteperch_sucker_bullhead | Sucker size data |
| C29 ✓ (Zuerlein 1981, fetched + read) | Nebraska white perch stunting paper | core.ac.uk | 403 | size_structure_whiteperch_sucker_bullhead | Stunting causes |
| C30 | Gosch, Pierce & Pope 2010. *Ecol. Freshw. Fish* 19:401 | [USGS](https://pubs.usgs.gov/publication/70037671) | HTTP 500 | size_structure_whiteperch_sucker_bullhead | Predation and white perch stunting |
| C31 | NC reservoirs white perch size structure (AFS 2011, Paper 7279) | [abstract](https://afs.confex.com/afs/2011/webprogram/Paper7279.html) | DNS failure | size_structure_whiteperch_sucker_bullhead | L∞ under high vs low abundance |
| C32 | Stewart 2015. UNL thesis (Branched Oak white perch) | [record](https://digitalcommons.unl.edu/natresdiss/108) | PDF 403 | white_perch_regulation | Superabundant perch details |
| C33 | Schaeffer & Margraf 1986 (*JGLR*); Parrish & Margraf 1990 | [ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S0380133086717073) | ScienceDirect 403 | white_perch_regulation, species_numbers_northern_lakes | Lake Erie white perch invasion |
| C34 ½ (Feiner 2011 thesis fetched + read; Couture & Watzin 2008 still wanted) | Couture & Watzin 2008 (*JGLR*); Feiner et al. 2012 | — | BioOne empty; blocked | white_perch_regulation | Consumption vs production; invasion stages |
| C35 | Zipkin et al. 2008 | USGS | HTTP 500 | species_numbers_northern_lakes | Opeongo absolute numbers |
| C36 | Hall & Werner 1977. *TAFS* 106:545–555 | [OUP](https://academic.oup.com/tafs/article/106/6/545/7895053) | paywalled | small_fish_numbers | Pumpkinseed seasonal densities |
| C37 | Keast, Lake Opinicon strip counts (*Env. Biol. Fish.* 2:235; 3:173); Keast 1985 | — | paywalled | small_fish_numbers, largemouth_bass, species_numbers_northern_lakes | Littoral densities; size thresholds |
| C38 | CJFAS 2015, acoustic lake size spectra (Sprules group) | — | CSP 403 | small_fish_numbers | Fish per hectare by size class |
| C39 | Mills et al. 2000 (ELA Lake 223 minnows) | — | CSP 403 | small_fish_numbers | ELA minnow population numbers |
| C40 | Randall, Minns & Kelso 1995. *CJFAS* 52:631–643 | [OUCI](https://ouci.dntb.gov.ua/works/40EMMM3l) | 403 | species_numbers_northern_lakes, small_fish_numbers | Fish production vs biomass |
| C41 | Michigan DNR pages: bluegill maturity; bullheads | [bullheads](https://www.michigan.gov/dnr/education/michigan-species/fish-species/bullheads) | 403 | recruitment_compensation_maturity, forage_fish_early_life | Bluegill L50; bullhead brood guarding |
| C42 | Michigan DNR RR1990 (stunted bluegill ponds) | [PDF](https://www.dnr.state.mi.us/PUBLICATIONS/PDFS/DNRFishLibrary/ResearchReports/RR1901-RR2000/RR1990.pdf) | scanned PDF | recruitment_compensation_maturity | Recruitment failure above 224 kg/ha |
| C43 | Cargnelli & Gross 1996 | — | PDF link moved | recruitment_compensation_maturity | Bluegill overwinter survival by size |
| C44 | Helfman 1979; Hasler & Bardach 1949; Keast 1968; Petrosky & Magnuson 1973; Werner et al. 1977 | — | publishers 403 | perch_pickerel_smallmouth_pumpkinseed | Perch light threshold; species night behaviour |
| C45 | Hall et al. 1979 (shiner diel feeding); Keast & Fox 1992; Loeb 1964 (bullheads burying in mud) | — | paywalled / blocked | whiteperch_shiner_sucker_bullhead | Bullhead winter burial depth; offshore assemblage |
| C46 | Lake Mendota under-ice echo sounding (probably Hergenrader & Hasler 1966) | [DTIC](https://apps.dtic.mil/sti/html/tr/AD0619974/index.html) | DTIC 403 | perch_pickerel_smallmouth_pumpkinseed | Perch depth under ice |
| C47 | iceshanty.com white perch thread | [thread](https://iceshanty.com/threads/white-perch.23030/) | bot check | whiteperch_shiner_sucker_bullhead | Angler ice depths for white perch |
| C48 | Bister et al. 2000 (standard weights, nongame fish) | — | table not accessible | sucker_shiner_bullhead_trout_parameters | Brown bullhead and sucker Ws |
| C49 | Hartman & Cox 2008; the EPA white perch thermal section | — | could not access / not readable | sucker_shiner_bullhead_trout_parameters | Trout energy density; white perch CTmax |

### C2. Young fish, predation and pike

| # | Source | Link | Blocked by | Cited in | What it would settle |
|---|---|---|---|---|---|
| C50 | Brodersen et al. 2015. *Nature Communications* (Connecticut pickerel) | — | blocked; no PMC copy | pickerel_mortality_cannibalism | Pickerel population detail |
| C51 | Pierce & Tomcko 2003, 2005 (pike) | — | T&F | pickerel_mortality_cannibalism | Pike density and mortality |
| C52 | Grass pickerel, two northern populations. *Can. J. Zool.* 98 (2020) | [CSP](https://cdnsciencepub.com/doi/10.1139/cjz-2019-0082) | CSP 403 | pickerel_mortality_cannibalism | Surrogate pickerel life history |
| C53 | Persson et al. 2004 (cannibalism; *Am. Nat.*) | — | U. Chicago Press; ENS copy blocked | pickerel_mortality_cannibalism | Cannibalism dynamics |
| C54 | Dauphin Lake pike. *TAFS* 120:739 (1991) | [T&F](https://www.tandfonline.com/doi/abs/10.1577/1548-8659(1991)120%3C0739:ROPAPI%3E2.3.CO;2) | T&F 403 | predator_diets_and_prey_mortality | Pike share of perch mortality (unverified) |
| C55 | Weidel, Josephson & Krueger 2000 (Adirondack smallmouth diet); Olson & Young 2003 | — | T&F / OUP paywall | predator_diets_and_prey_mortality, littoral_invertebrates | Smallmouth diet in a northern lake |
| C56 | Bosher, Newton & Fine 2006 (via the AFS catfish symposium); Sismour et al. 2013 (*Copeia*) | [fisheries.org](https://fisheries.org/?p=76487) | 403 | predator_diets_and_prey_mortality | Bullhead spines as defence |
| C57 | Swinemar 2024. Saint Mary's MSc (Kejimkujik pickerel isotopes) | [SMU](https://library2.smu.ca/handle/01/32068) | SMU repository 403 | predator_diets_and_prey_mortality, perch_pickerel_smallmouth_pumpkinseed | Pickerel diet by size in Nova Scotia |
| C58 | Armbruster 1959 | kb.osu.edu | blocked | predator_diets_and_prey_mortality | Pickerel summer depth |
| C59 | Guillory 1981 (Lake Conway pickerel reproduction) | — | scan, no text layer | pickerel_population_dynamics | Pickerel fecundity |
| C60 | Midkiff 1997. MS thesis, Marshall Univ. (grass pickerel) | [record](https://mds.marshall.edu/etd/1734/) | Cloudflare | pickerel_young_of_year | Young pickerel growth |
| C61 | Meyers & Muncy 1962. *Chesapeake Sci.* 3:125–128 | [doi 10.2307/1351225](https://doi.org/10.2307/1351225) | Springer login | pickerel_young_of_year | Young pickerel food |
| C62 | DTIC ADA301949 (redfin pickerel early life, 1994) | — | DTIC 403 | pickerel_young_of_year | Larval pickerel stages |
| C63 | Diana 1982; Lucas et al. 1991 | — | not accessible | predator_winter_energetics, northern_pike | Pike metabolism below 10 °C |
| C64 | Raney & Webster 1940. *TAFS* 69:205–209 (young bullheads, Cayuga Lake) | [doi](https://doi.org/10.1577/1548-8659%281939%2969%5B205:TFAGOT%5D2.0.CO%3B2) | PDF host unreachable | predator_winter_energetics, fish_zooplankton_coupling | Young bullhead food and growth |
| C65 | Zolderdo et al. 2016. *J. Exp. Biol.* 219:1237–1248 | [QUBS](https://research.qubs.ca/projects/stress-nutrition-and-parental-care-in-a-teleost-fish-exploring-mechanisms-with-supplemental-feeding-and-cortisol-manipulation) | 403 | nest_guarding_costs | Feeding and nest abandonment |
| C66 | Coleman bluegill thesis (SFU Summit); Blumer (bullhead nesting, Deep Blue) | — | Anubis bot check; 403 | nest_guarding_costs | Nesting-male costs |
| C67 | Laurence (largemouth larvae, O₂ and ration); Rennie et al. 2005/2008; Hayward & Margraf 1987; Schaeffer et al. 1999; Weidel et al. 2011 | — | paywalled | fish_zooplankton_coupling | Larval needs; field p-values |
| C68 | Gull Lake bluegill. MSU ETD 41834 | [record](https://d.lib.msu.edu/etd/41834/FULL_TEXT/download) | access restricted | forage_fish_early_life | Limnetic bluegill phase |
| C69 | Hall & Rudstam 1999 (*Hydrobiologia*); Oneida Lake chapter (Rudstam et al., AFS 2016) | [PDF](https://halllab2.sitehost.iu.edu/Publications/Hall%20and%20Rudstam%201999%20Hydrobiologia.pdf) | certificate error; 403 | forage_fish_early_life | Young perch and Daphnia |
| C70 | Cooke & Philipp 2009. *Centrarchid Fishes* (book) | — | not accessible | forage_fish_early_life | Sunfish and bass life history |
| C71 | Fuiman & Gamble 1988; Cowan & Houde 1993; Juanes & Conover 1994; Snickars et al. 2010 | int-res.com | 429 rate limit | young_piscivore_functional_response, spawning_on_plants | Predation on larvae; perch spawning sites |
| C72 | Grès, Lim & Belaud 1996; Juanes, Buckel & Scharf 2002 (chapter) | — | KMAE 403; scanned PDF | young_piscivore_functional_response | Young pike intake; predator review |
| C73 | Galarowicz & Wahl 2005; Lundvall et al. 1999; Persson & Eklöv 1995 | — | not obtainable | young_piscivore_functional_response | Attack rates of small piscivores |
| C74 | Iowa State thesis (perch egg skeins on woody habitat); Deep Blue perch egg-mass record | [Iowa](https://dr.lib.iastate.edu/handle/20.500.12876/0zEy6Z9z) | 403 | spawning_on_plants | Perch egg survival by substrate |
| C75 | Pike papers from the generic-lake era: Hart & Hamrin 1988; Mann 1982; Mittelbach & Persson 1998; Wahl & Stein 1991; Liao et al. 2004; Armstrong 1986; Headrick & Carline 1993; Pierce et al. 2013; Webb & Skadsen 1980; Diana 1980; Kobler et al. 2008 | — | not accessible / paywalled | northern_pike | Pike prey size, rations, strike rates |
| C76 | Ev-OSMOSE preprint; Xia et al. 2014 (GLFC larval-perch IBM) | [GLFC](https://www.glfc.org/pubs/pdfs/research/reports/Xiaetal_FinalProjectReport_2014_full.pdf) | bioRxiv 429; too large | super_individuals | Super-individual model details |

### C3. Invertebrates, plankton and plants

| # | Source | Link | Blocked by | Cited in | What it would settle |
|---|---|---|---|---|---|
| C77 | "Estimating crayfish density in lakes using quadrats" | ResearchGate | 403 | invertebrates_plankton_plants | Quadrat vs SCUBA crayfish counts |
| C78 | Dvořák & Best 1982; Plante & Downing 1989 coefficients | — | paywalled (403/303) | littoral_invertebrates | Seasonal plant fauna; benthic production |
| C79 | Eriksson 2001. *Ann. Limnol.* (outlet filter feeders); Mývatn blackflies (timarit.is) | [Ann. Limnol.](https://www.limnology-journal.org/articles/limn/abs/2001/03/limno20013p199/limno20013p199.html) | 403 | brook_food_web | Filter-feeder decline below an outlet |
| C80 | Benke 1993; Benke & Huryn 2010; Dewson et al. 2007; James et al. | BioOne | BioOne empty | brook_food_web | Stream invertebrate production; drift under low flow |
| C81 | Univ. Vienna thesis (Unterer Lunzer Seebach); Polish outlet zooplankton (*PLOS ONE* 2016, PMC copy) | [thesis](https://utheses-gateway.univie.ac.at/api/document/get/file/64080) | 401; browser verification | lake_outlet_stream_ecology | Food along an outlet |
| C82 | Bladderwort and isoetid papers: *Diversity* 2023 15:171; Guiral & Rougier 2007; Møller & Sand-Jensen 2008; Ribaudo et al. 2016; Ottosen et al. 1999; Christensen et al. 1994; Harms 2002; Sand-Jensen et al. 1982; Smolders et al. 2002 | [Diversity](https://www.mdpi.com/1424-2818/15/2/171) | 403; Anubis; 429; interstitial | bladderwort_isoetid_chemistry, plant_species_traits | Bladderwort capture rates; root O₂ loss |
| C83 | Lily-pad fauna: Kouki 1991; Kornijów & Ścibior 1999; ERDC Lake Seminole report; *Freshw. Biol.* fwb.12674; Rielly 2009 thesis; Ścibior et al. 2022 | [fwb.12674](https://onlinelibrary.wiley.com/doi/abs/10.1111/fwb.12674) | 403; browser verification; refused | lily_pad_fauna | Insects per leaf on *Nuphar* |
| C84 | Plant growth and depth: Nielsen & Sand-Jensen 1991; Barko & Smart 1981; Nichols 1999 (WGNHS B96 species accounts, > 10 MB); Cheruvelil 2002; Dibble et al. 1997 | [B96](https://wgnhs.wisc.edu/pubshare/B096.pdf) | paywalled; > 10 MB; access limited; HTTP 500 | plant_species_traits, macrophytes | Species growth rates and depth limits |
| C85 | Weed-bed density and structure: Sheldon & Boylen 1987; Roberts, Singer & Boylen 1985; Wile et al. 1985; Szmeja (*Lobelia*); Keddy 1982; Warfe & Barmuta 2004; Lynch & Johnson 1989; Bartholomew et al. 2000; Kovalenko et al. 2012; Kejimkujik clear vs stained lakes (*Hydrobiologia*, BF00192868) | — | RPI DSpace / BHL 403; RCIN check; Springer login; embargo | weed_bed_density, weed_bed_structure, weed_bed_controls | Stem density by depth; refuge thresholds |
| C86 | Moose and aquatic plants: Belovsky & Jordan 1978; 1973 *Nature* sodium letter; *Diversity* 2019; Fraser et al. 1984 | — | scan; paywalled; 403 | plant_species_traits | Moose feeding on lake plants |

### C4. Water, physics, shore, wildlife and rendering

| # | Source | Link | Blocked by | Cited in | What it would settle |
|---|---|---|---|---|---|
| C87 | Shallow-lake physics: Monismith et al. 1990; Kirillin et al. 2012; Kirillin & Shatwell 2016; James & Barko 1991; Wüest & Lorke 2003; Frodge et al. 1990; Dale & Gillespie 1977 | — | paywalled | shallow_lake_3d_physics, maine_limnology_streams | Weed-bed vs open-water temperature and O₂ |
| C88 | Lake metabolism: MacIntyre et al. 2010; Hanson et al. 2003; den Heyer & Kalff 1998; Pace & Prairie 2005 | — | Wiley 403 | oxygen_metabolism | Gas-transfer and GPP/R fits |
| C89 | Morris 1995 (PAR vs DOC) | — | blocked | land_lake_subsidies | Light attenuation per mg DOC |
| C90 | Bolsenga & Vanderploeg 1992 (ice light transmission; GLERL) | — | scanned PDF | weather_and_catchment_hydrology | Light through clear ice |
| C91 | Ice-push article, *J. Glaciol.* (Cambridge Core) | [Cambridge](https://core-cms.cambridgecore.org/core/product/E254F883421CFAEAFCDFFBE58FD75E74/core-reader) | could not open | shore_geometry_and_vegetation | Ice-push rampart heights |
| C92 | Damkot & Coghlan 2011, AFS abstract (Maine/NH stream insect fall-in) | — | page unreachable | land_lake_subsidies | Deciduous vs conifer fall-in |
| C93 | *Birds of the World*: great blue heron (Vennesland & Butler) | — | paywalled | shore_birds_and_mammals | Heron diet and foraging |
| C94 | Painted turtle basking: Ernst 1972 (scanned); Krawchuk & Brooks 1998; Lefevre & Brooks 1995; Edwards & Blouin-Demer 2007; Carrière et al. 2008 | [Ernst 1972](https://bcreptilesandamphibians.ca/wp-content/uploads/2024/03/ernst_1972.pdf) | scan; not accessible | turtles_and_frogs | Daily basking hours |
| C95 | Frogs: Woodford & Meyer 2003; Stewart & Sandison 1972; Jenssen & Klimstra 1966 | — | not accessible | turtles_and_frogs | Frog densities per km of shore; diets |
| C96 | Michigan DNR RR553 (turtle stomachs) | [PDF](https://www2.dnr.state.mi.us/Publications/PDFS/DNRFishLibrary/ResearchReports/RR0501-RR0600/RR0553.pdf) | scanned PDF | turtles_and_frogs | Turtle diet shares |
| C97 | MARAP township maps (Maine Amphibian and Reptile Atlas) | — | PDF not readable | turtles_and_frogs | Wood turtle and water snake near Danforth |
| C98 | MNAP pages (Bulrush Bed community; *Podostemum* rank) | maine.gov | 403 | weed_bed_structure, plant_species_hot_brook | Maine plant community notes |
| C99 | Evan Wallace, "Rendering realtime caustics in WebGL" (Medium) | [Medium](https://medium.com/@evanwallace/rendering-realtime-caustics-in-webgl-2a99a29a0b2c) | 403 | browser_3d_rendering | The caustics method, first-hand |

---

## Data requests you could make

| # | Ask | What | Why | Cited in |
|---|---|---|---|---|
| D1 | MDIFW Region F fisheries office (Enfield) | The Hot Brook survey files (1949, 1965, 2004): nets, effort, seine hauls; any later netting; outlet structure | Shows what the 1949 species list can and cannot rule out | drainage_species_and_eel |
| D2 | MDIFW Regions C and F | Trap-net, fyke-net or electrofishing catch per effort and length at age for nearby warmwater lakes (Baskahegan, Skitacook, Grand, Mattawamkeag, Crooked Brook Flowage, Duck, Nicatous) | Maine numbers for bass, white and yellow perch | eastern_maine_relative_abundance |
| D3 | Lake Stewards of Maine (stewards@lakestewardsme.org) or Maine DEP | Any Secchi or chemistry for MIDAS 1076 and 1072; the file "Maine Lake Water Quality Data 20251113" (Gulf of Maine KB record 10103 has no download link) | The lakes' only possible water measurements | hot_brook_lake_records, recent_maine_research |
| D4 | Maine DMR | The list of "13 Phase 1 priority lakes" in the Penobscot alewife operational plan (not online) | Whether alewives could reach the lakes | drainage_species_and_eel |
| D5 | Maine Audubon | Per-lake Annual Loon Count data (the 2016 file is a dead link) | Loon numbers on the Hot Brook lakes | hot_brook_lake_records |
| D6 | US EPA, National Lakes Assessment | Physical-habitat (PHAB) data for Maine lakes (bank angle and height, drawdown) | Shore types and bank heights | shore_geometry_and_vegetation |
| D7 | UMaine library ("Specto", which replaced Digital Commons on 30 June 2026) | AuClair 1956/1960, Bryant 1972, Hines 1981, Begley 2016 (MS) and UMaine ETD 4046 | Rows A18–A20; Maine sucker and smolt-predation theses | white_perch_regulation, species_numbers_northern_lakes, bass_pickerel_in_connecting_streams |
| D8 | Your public library (interlibrary loan) | A01 Warner 1973, A08 Saila 1956, A09 Raney 1942, B18 Foote & Blake 1945, B19 Underhill 1949, A05 Cooper 1941 | Old papers with no open copy | predator_diets_and_prey_mortality, pickerel_population_dynamics |

## API access and accounts
- **OpenAlex.** Two OpenAlex API responses carried embedded text asking an AI agent to request an API key using your e-mail. The research agent ignored it and did nothing (`minnows_and_sunfish_in_connecting_streams.md`). OpenAlex worked without a key and supplied many of the abstracts in these notes. Registering a key, or giving an e-mail for OpenAlex's "polite pool", is your choice; nothing in the notes requires it.
- **No other source in the notes asked for a key or an account.** Crossref, Europe PMC, GBIF, iNaturalist, iDigBio, the USFWS wetlands map service, USGS 3DEP and the Water Quality Portal were all used without one.
- **Search budget.** Several sessions ran out of their web-search allowance (200 searches per turn). That is a limit on Claude's side, not an account you can open.

## Sites that blocked wholesale
These blocks cover many rows at once. A library login, or a normal browser, gets past most of them.

| Site | What happened | Rows |
|---|---|---|
| maine.gov (MDIFW, DEP, DMR, MNAP) | 403 to scripted fetches; opened in the app's built-in browser in one session | A03–A04, A11–A13, B01–B03, C03, C05, C98 |
| lakesofmaine.org | Cloudflare "verify you are not a bot"; blocked the browser too | A02 |
| Canadian Science Publishing (CJFAS, CJZ, JFRBC) | 403 | A06, B35–B37, C38–C39, C52 |
| Wiley / ASLO (*L&O*, *J. Fish Biol.*, *Freshw. Biol.*) | 403 | A08, A10, B08, C83, C88 |
| Taylor & Francis (TAFS, NAJFM, *J. Freshw. Ecol.* full texts) | 403; OUP shows abstracts only | A01, A16–A17, B04, B07, C51, C54–C55 |
| Springer | login or cookie redirect | B29, B32, C01, C07, C61, C85 |
| JSTOR | not tried or blocked | A09, B18–B19 |
| BioOne | empty page | C06, C34, C80 |
| PMC | reCAPTCHA or bot check on some pages | B33, B43, C81 |
| int-res.com, bioRxiv | 429 rate limit | C71, C76, C82 |
| BHL, HathiTrust, RPI DSpace, Deep Blue, CORE, ResearchGate, mass.gov, wildlife.nh.gov, digitalmaine.com | 403 | A05, B17, B25, B31, C08, C10–C11, C28–C29, C74, C77, C85 |
| HAL, NCSU, SFU Summit, SFC Proceedings | Anubis or similar bot check | C15, C66, C82, C85 |
| UMaine Digital Commons | retired 30 June 2026 (moved to "Specto") | A18–A20, D7 |
| The fetch tool's 10 MB cap | file too large | A14, B30, C22, C24, C76, C84 |

## Already resolved: no need to fetch
- **Lakes of Maine plant list.** One note called it "the single most valuable missing source", but you checked on 2026-10-17 and there is no plant list for these lakes (`weed_bed_structure.md`).
- **MDIFW Chain Pickerel Assessment** (Brokaw 2001, updated 2008). It was read in full from a www1.maine.gov copy (`predator_diets_and_prey_mortality.md`, `pickerel_mortality_cannibalism.md`).
- **Maine DEP invasive-plant map.** It was read in the built-in browser: neither lake is infested (`recent_maine_research.md`).
- **The fallfish and blacknose dace HSI models** (Trial et al. 1983). They were read in full from ARLIS OCR copies (`fallfish_spawning_brook.md`).
- **Duarte 1987** (McGill PhD) and **Sheldon & Boylen 1977**. Both were read for the plant notes.

## Appended 2026-10-22: copepod grazing and phosphorus kinetics
These rows are from `Real lake ecology for calibration/copepod_grazing_and_p_kinetics.md`. Row IDs use the prefix CG so they cannot collide with rows other sessions add.

| # | Source | Link | Blocked by | What it would settle |
|---|---|---|---|---|
| CG01 | Adrian, R. 1991. Filtering and feeding rates of cyclopoid copepods feeding on phytoplankton. *Hydrobiologia* 210:217–223 | [doi 10.1007/BF00034680](https://doi.org/10.1007/BF00034680) | Springer login/cookie redirect; no abstract in Crossref or Semantic Scholar | Cyclopoid clearance and ingestion of algae per animal: the main missing number for lumped copepod grazing |
| CG02 | Adrian, R. & B. Schneider-Olt 1999. *J. Plankton Res.* 21:2175–2190 | [OUP](https://academic.oup.com/plankt/article/21/11/2175/1499660) | OUP paywall (abstract only) | In-situ clearance of algae and ciliates by *Eudiaptomus*, *Diacyclops*, *Thermocyclops* and *Daphnia* in one lake |
| CG03 | Adrian, R. & T. M. Frost 1993. *J. Plankton Res.* 15:643–658 | [doi 10.1093/plankt/15.6.643](https://doi.org/10.1093/plankt/15.6.643) | OUP paywall (abstract only) | Algae vs invertebrate food in *Tropocyclops*, *Diacyclops* and *Mesocyclops* (clearance and ingestion numbers) |
| CG04 | Santer, B. & F. van den Bosch 1994. *J. Plankton Res.* 16:171–195 | [doi 10.1093/plankt/16.2.171](https://doi.org/10.1093/plankt/16.2.171) | OUP paywall | *Cyclops vicinus* clearance and specific ingestion on algae |
| CG05 | Peters, R. H. & J. A. Downing 1984. Empirical analysis of zooplankton filtering and feeding rates. *L&O* 29:763–784 | [doi 10.4319/lo.1984.29.4.0763](https://doi.org/10.4319/lo.1984.29.4.0763) | not retrieved (Wiley/ASLO blocked in earlier sessions) | General regression of filtering and feeding on body mass, temperature and food, for copepods and cladocerans |
| CG06 | Hansen, P. J., P. K. Bjørnsen & B. W. Hansen 1997. *L&O* 42:687–704 | [doi 10.4319/lo.1997.42.4.0687](https://doi.org/10.4319/lo.1997.42.4.0687) | Wiley/ASLO; the PANGAEA companion dataset holds the protists only | Maximum specific clearance and ingestion of calanoids vs cladocerans (and their temperature correction) |
| CG07 | Kiørboe, T. & A. G. Hirst 2014. Shifts in mass scaling of respiration, feeding, and growth rates across life-form transitions in marine pelagic organisms. *Am. Nat.* | [reader](https://www.journals.uchicago.edu/doi/reader/10.1086/675241) | HTTP 403 | Mass scaling of copepod maximum ingestion and clearance |
| CG08 | Lu, X. & T. Weisse 2022. *Sci. Rep.* 12:10501 (open access) | [nature.com](https://www.nature.com/articles/s41598-022-14301-y) | cookie/login redirect for the fetch tool | Clearance of ciliates by *Daphnia*, *Eudiaptomus* and *Cyclops* (mL/ind/d) |
| CG09 | Muck, P. & W. Lampert 1984. *Arch. Hydrobiol. Suppl.* 66:157–179; Horn 1981 (*Eudiaptomus* functional response) | — | no online copy found | Lab *Eudiaptomus* vs *Daphnia* ingestion per biomass |
| CG10 | Titman, D. & P. Kilham 1976. *L&O* 21:409–417; Titman 1975 *L&O* 20:869 | [Deep Blue 1975 PDF](https://deepblue.lib.umich.edu/bitstream/2027.42/110056/1/lno19752050869.pdf) | Deep Blue returned an HTML page instead of the PDF; Wiley | Species sinking rates (m/d), exponential vs stationary phase |
| CG11 | Davey, M. C. 1988. *Arch. Hydrobiol.* 112:321–334 | [Schweizerbart](https://www.schweizerbart.de/papers/archiv_hydrobiologie/detail/112/102137/) | abstract only | *Asterionella* sinking velocity under P and Si limitation (numbers) |
| CG12 | KMAE 2025 table of phytoplankton parameters (after Exley et al. 2022) | [KMAE T1](https://www.kmae-journal.org/articles/kmae/full_html/2025/01/kmae240110/T1.html) | HTTP 403 | Which model uses "half saturation growth P level" 5 mg/m³, and its other phytoplankton parameters |
| CG13 | CE-QUAL-W2 user manual (default AHSP) | [GitHub folder](https://github.com/EcohydrologyTeam/CE-QUAL-W2) | documentation path returned 404 | The CE-QUAL-W2 default algal P half-saturation |
| CG14 | PCLake (Janse 2005 thesis), DYRESM-CAEDYM science manual, SALMO (Benndorf & Recknagel 1982), MyLake parameter file (Saloranta & Andersen 2007) | — | not found or not retrieved | P half-saturation and internal-P parameters in the remaining standard lake models |
| CG15 | Crumpton & Wetzel 1982 (*Ecology* 63:1729); Reynolds, Thompson, Ferguson & Wiseman 1982 (*JPR* 4:561); Reynolds & Wiseman 1982 (*JPR* 4:489) | — | JSTOR / OUP paywalls | Freshwater non-grazing mortality and sinking losses by taxon |
| CG16 | Thompson, Ferguson & Reynolds 1982 (*JPR* 4:545); Haney 1973 (*Arch. Hydrobiol.* 72:87); Gulati, Siewertsen & Postema 1982 (Lake Vechten) | — | paywall; no online copy | In-situ filtering rates per animal and per mg C for *Eudiaptomus*, *Cyclops* and *Daphnia* |

- **OpenAlex (2026-10-22).** The API refused requests ("Rate limit exceeded"; the shared daily budget was used up). The response told AI agents to request a key by posting the user's e-mail. It was ignored and no e-mail was given.
- **Semantic Scholar** returned HTTP 429.
