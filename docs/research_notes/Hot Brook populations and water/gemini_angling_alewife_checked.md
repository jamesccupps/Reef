# Checking two Gemini reports (angling; plankton and alewife) against their sources

**What was checked (2026-10-20).** The source is two Google Gemini reports that the user supplied:
- `docs/research_notes/fetched/gemini_2026-10-20_angling.txt` (§2 bass sizes, §4 ice catch rates, §5 rules);
- `docs/research_notes/fetched/gemini_2026-10-20_plankton_alewife.txt` (§3–4, alewife).

I looked for each claim in the source it cites, or in another primary source, and compared it with the existing notes:
- `sea_run_alewife.md`, `gemini_hot_brook_checked.md`, `hot_brook_lake_records.md`, `eastern_maine_relative_abundance.md` (this folder);
- `../fetched_sources_digest.md`;
- `../Maine lakes ponds and streams/centrarchid_percid_esocid_parameters.md`.

**Rules followed.** Nothing blocked was bypassed. There was no user-agent change, no mirror of a blocked document, and no challenge page clicked through.
- **www.maine.gov returned HTTP 403** to every fetch: the law books, the special-laws page, the Sebec Lake report, the Minor Sportfish Plan, the smallmouth page, *Maine Bass Waters* and the 2021 Fisheries Plan.
- **digitalmaine.com** (the MDIFW archive) and the **USM Digital Commons PDF** both served a Cloudflare "Just a moment…" challenge (HTTP 403).
- **Wiley (afspubs) and cdnsciencepub** returned 403. **OUP's TAFS page** showed the abstract only.
- Claims that rest only on these are marked **UNVERIFIABLE (blocked)**.
- Open-access copies on non-publisher hosts were *not* used: the UNH and NSF-PAR copies of Barber 2018, and the town and eRegulations copies of the law book.

Sources I read directly:
- the project's own PDFs (`fetched/blackbass.pdf`, `fetched/BassTechnicalWorkGroupNov2019.pdf`, both Hot Brook survey sheets), read with pymupdf;
- the Maine DMR *River Herring SFMP 2024* (ASMFC copy);
- Barber et al. 2018 (open access on OUP, the journal's publisher);
- Fay et al. 1983 (USFWS FWS/OBS-82/11.9, public domain; its USGS host has gone, so I used the njscuba.net copy);
- Willis 2006 (Maine Rivers report; FOMB cybrary copy, as in the existing notes);
- Crossref abstracts for West 2010, Gahagan 2010 and Walters 2009;
- the USM thesis record page;
- *Game & Fish* 2008/2009, the *Bangor Daily News* (2023) and the Maine statutes index.

**Instructions in fetched content:** none were found in any fetched page or in the two reports.

**Verdicts:** CONFIRMED, PARTLY, WRONG, UNVERIFIABLE. The last column compares with the existing notes: NEW, KNOWN or CONFLICTING. "Derived" = my arithmetic. [SEC] = a secondary or press source, or a search-engine excerpt.

---

## Verdict table

| # | Gemini claim | Verdict | What the source says | URL / file actually read | vs notes |
|---|---|---|---|---|---|
| A1 | Downeast (Washington & Hancock) bass: "25 bass lakes, >6,000 bass sampled since 1987" (MDIFW 2003 *Fisheries & Hatcheries Research and Management Report*, p. 5) | **UNVERIFIABLE (blocked)** | digitalmaine.com served a Cloudflare challenge. No search excerpt showed the sentence. Willis 2006 confirms that MDIFW holds Region C bass data: YOY electrofishing in 10 lakes (1994–2005) and about 100 angled adults a year for scales in 3 lakes (1989–2004) | [digitalmaine 1183 (403)](https://digitalmaine.com/cgi/viewcontent.cgi?article=1183&context=ifw_docs); [Willis 2006](https://www.cybrary.friendsofmerrymeetingbay.org/Alewife/MaineRiversStCroixReportFinal.pdf) Table 1 | NEW claim, unconfirmed |
| A2 | Length at age: 4 = 8–9 in, 5 = 10 in, 6 = 12 in, 8+ ≥ 14 in | **PARTLY**: consistent, but its own source was not read | **Willis 2006 Fig. 6:** MDIFW scale back-calculation, Big Lake, Grand Falls and Woodland flowages (Washington Co.). Annual growth bars (read from the figure by pixel, ± ~0.5 mm), averaged over years: 66, 59, 55, 51, 46 mm at ages 1–5. Cumulated (derived): **6.7, 12.6, 18.1, 23.2, 27.7 cm** at annuli 1–5, i.e. 9.1 in at 4 and 10.9 in at 5. ***Game & Fish* 2008** (Maine section, which quotes MDIFW's R. Jordan; the sentence itself is unattributed): a 12-in bass is "about five years old in southern Maine, or six years old in northern Maine" [SEC]. A VB fit through these points gives 37 cm (14.6 in) at age 8. **The Black Bass Plan and the 2019 slides contain no length-at-age table** (read in full) | `fetched/blackbass.pdf`; `fetched/BassTechnicalWorkGroupNov2019.pdf`; Willis 2006 p. 25; [G&F 2008](https://www.gameandfishmag.com/editorial/fishing_bass-fishing_ng_0408_01/241600) | **NEW** (the Willis growth figure was not extracted before) |
| A3 | Maximum age 15–20 yr; 15–20-in fish take 10–15+ yr | **PARTLY** | The fitted curve below gives 15 in at ≈ 8.4 yr, 18 in at ≈ 12 yr and 20 in at ≈ 17 yr (derived). The existing note quotes MDIFW: a 20-in bass may be about 20 years old (page now 403). A search excerpt of the MDIFW 2021 Fisheries Plan V3 says trophy (≥ 18 in) smallmouth may be 15–20+ years old [SEC; PDF 403] | [smallmouth page (403)](https://www.maine.gov/ifw/fish-wildlife/fisheries/species-information/smallmouth-bass.html); [Fisheries Plan V3 (403)](https://www.maine.gov/ifw/docs/21-MDIFW-8-Fisheries-Plan_V3.pdf) | KNOWN (20 in ≈ 20 yr); the rest NEW |
| A4 | Downeast "typical adult weight 2–3 lbs" | **WRONG** | Bass Plan p. 13: the size objective of 11 in and 0.6 lb for bass caught in eastern and northern Maine "was met". Table 12 (p. 24): **harvested** bass average **12.4 in and 1.0 lb in Region C** (12.0 in and 1.2 lb in Region F). On many eastern Maine waters, 20–33% of the bass caught exceed 12 in | `fetched/blackbass.pdf` pp. 13, 24 | KNOWN (digest §4); CONFLICTING with Gemini |
| A5 | Green Lake (Hancock Co.): bass fishing best after June 10 (Jordan, *G&F* 2009) | **CONFIRMED** [SEC] | Jordan: one of the last lakes to warm, so best after June 10 | [G&F 2009](https://www.gameandfishmag.com/editorial/fishing_bass-fishing_ng_0409_01/241581) | NEW (minor) |
| B1 | Hot Brook Lakes: white perch bag 25 | **CONFIRMED** | Both sheets: "special 25 fish bag limit on white perch" | `fetched/hot_brook_lake_upper.pdf`, `..._lower.pdf` | KNOWN |
| B2 | Oct 1–Dec 31: **S-4**, no live fish as bait | **WRONG** (per the project's earlier verbatim reads; not re-readable today) | The 2019, 2023 and 2026 law books, read in an earlier session, give "From October 1 – December 31: **ALO, S-7**": artificial lures only, with trout, salmon and togue released. No S-4 appears | [2019 law book (403)](https://www.maine.gov/ifw/docs/2019_MaineFishingLaws.pdf); `hot_brook_lake_records.md`, `recent_maine_research.md` | **CONFLICTING**: the notes are right |
| B3 | 2019 law book: "all bass must be released alive at once", framed as **historical** | **CONFIRMED** (the rule); **WRONG** (the "historical") | The same entry is unchanged in 2023 and 2026 (earlier reads), so it is current law | as B2 | KNOWN; Gemini's framing conflicts |
| B4 | 2004 sheet: "open through November 30" (as a bass rule) | **PARTLY** | The sheets say "the lake remains open to fishing until November 30" (revised 2004). This is the whole lake's season, not a bass rule. Bass enter only through "managed for a larger than average size bass fishery and has special regulations" | survey sheets | KNOWN |
| B5 | South Zone general law: chain pickerel bag 10, no length limit (2024 law book) | **PARTLY: likely outdated** | *BDN* 2023 (Mallard) [SEC]: the 10-fish general-law pickerel limit held until 2018, then was dropped. In the Maine statutes, 12 MRSA §2703 "Pickerel; daily limit" is REPEALED. The 2024 law book itself is 403 | [BDN 21 Mar 2023](https://www.bangordailynews.com/2023/03/21/outdoors/redfin-pickerel-no-bag-limits/); [12 MRSA ch. 323 index](https://www.mainelegislature.org/legis/statutes/12/title12ch323sec0.html) | NEW |
| B6 | South Zone black bass: 2 fish, no minimum length, only 1 over 14 in | **CONFIRMED** | 2019 Work Group slide 5: Southern Region 2 fish, no minimum length, only one over 14 in. (The 2001 plan's 10-in minimum for Washington and Aroostook Counties is the older rule) | `fetched/BassTechnicalWorkGroupNov2019.pdf` slide 5; `blackbass.pdf` p. 19 | KNOWN |
| C1 | Sebec Lake smallmouth: 0.060 legal fish/angler-h in open water, 0.013 through the ice (Seiders 2013) | **UNVERIFIABLE (blocked)** | The report is 403, and search excerpts lack the numbers. For context, the Bass Plan's 1998–99 statewide survey (Table 13) gives bass caught per angler-**day**: Region C 1.43 summer and 0.34 winter; Region F 1.35 and 0.14; state 1.66 and 0.46. Plan p. 25: in Washington and Hancock Counties "bass are almost never caught by winter anglers" | [sebeclake.pdf (403)](https://www.maine.gov/ifw/docs/fisheries-reports/2013/sebeclake.pdf); `blackbass.pdf` pp. 25–26 | Region-day rates KNOWN (digest) |
| C2 | Statewide 0.072 legal bass/angler-h (Boucher 2006) | **UNVERIFIABLE** | No source or excerpt found | — | — |
| C3 | 1999 bullhead survey, Region F: 1,330 ± 2,414 angler-days, 0.36 caught/day (Minor Sportfish Plan 2002, Table 2) | **UNVERIFIABLE (blocked)** | The plan is 403. As quoted, the SE exceeds the estimate, so Region F's bullhead effort is statistically indistinguishable from zero | [minorsportfish.pdf (403)](https://www.maine.gov/ifw/docs/strategic-management-plans/minorsportfish.pdf) | NEW claim, unconfirmed |
| D1a | DMR escapement target **35 adults/acre** (86.5/ha), as the "baseline for lake restoration runs" (Union River / Ellsworth filing) | **PARTLY** | SFMP 2024 §6: Maine's sustainability threshold is "an escapement number equal to 35-fish per surface acre of spawning habitat". It is the **minimum escapement a commercial fishery must pass** or close. **Restoration uses 6/acre.** Union River: at least 315,000 alewives stocked a year above the dams into Graham and Leonard Lakes. The 35 → 86.5/ha conversion is right. The Ellsworth DEP filing itself is 403 | [ME River Herring SFMP 2024](https://www.asmfc.org/wp-content/uploads/2025/01/ME_RiverHerringSFMP_2024.pdf) PDF pp. 22, 25–26, 56; [DEP filing (403)](https://mobile.maine.gov/dep/ftp/HYDRO/WaterQualityCertifications/Ellsworth/Agency%20Comments/archive/BBHP%20to%20MDEP%20Response%20to%20MDMR%20Comments.pdf) | KNOWN; the "restoration" framing conflicts |
| D1b | 235 adults/acre (DMR) | **CONFIRMED** (as production) | SFMP 2024: 100 lb/acre commercial yield at 0.5 lb a fish is 200 adults, taken at 85% exploitation, so "the total production is 235 adult alewives/acre". **Derived:** 15% of 235 ≈ 35, so the 35/acre threshold equals the escapement at full production | SFMP 2024 PDF pp. 22, 26 | KNOWN (the 35 = 15% × 235 link NEW) |
| D2a | In-lake adult spawning mortality, Long Pond, ME: 41% | **CONFIRMED** | Fay 1983, citing Havey 1961: post-spawning mortality averaged 41%, range 32–67%, over 6 years | [Fay et al. 1983](https://njscuba.net/wp-content/uploads/biology/pdf/usfws_alewife_blueback_herring_0116.pdf) | KNOWN |
| D2b | Love Lake, ME: **83%** (66–100%) | **WRONG** (mean); range right | Fay 1983, citing Havey 1973: "Total adult freshwater mortality averaged 90.7% and ranged from 66% to 100%" over 11 years. (Gemini's own §4 also has "up to 83%" for Bride Lake with cormorants, a likely source of the mix-up) | Fay 1983 | **CONFLICTING**: `sea_run_alewife.md` (90.7%) is right |
| D2c | St. Croix model: 45% | **PARTLY** | Barber et al. 2018 used "The average of those reported values (45%)", from Kissil 1974 (Bride Lake, CT) and Durbin et al. 1979 (RI), applied in a St. Croix model. It is **not a Maine measurement**. They note that Durbin used 37.5% and West 56%. Table 1: M_spawn = 2.391 (instantaneous). Long Pond and Love Lake mortality are not in the paper; Havey 1973 is cited only for juvenile mass | [Barber et al. 2018, OUP](https://academic.oup.com/mcf/article/10/2/236/7826999) | NEW |
| D3a | Juvenile emigrants 28–75 mm, mean 41 ± 0.4 mm (Gahagan et al. 2010) | **PARTLY** | The abstract gives only that migrants were 1–12 mm longer, 2–14 d older, 11% longer at age and 14% heavier at length. The 28–75 mm range comes from an earlier full-text pass. **The 41 ± 0.4 mm mean is unverified** (OUP paywall) | [Crossref abstract](https://api.crossref.org/works/10.1577/T09-128.1); [OUP (abstract only)](https://academic.oup.com/tafs/article/139/4/1069/7877612) | range KNOWN; mean NEW, unconfirmed |
| D3b | Emigration "mid-June through October" (Bride Lake) | **WRONG** for this study | The abstract says about 320,000 juveniles left **from mid-June to mid-August** 2006, more than 80% of them in 3 pulses of 1–2 d. (Bride Brook dried 14–29 Aug, per the existing note.) Maine runs are later: mid-July to early December (Kircheis) | Crossref abstract | KNOWN; conflicts with Gemini |
| D3c | In-lake YOY fall 100-fold from June to August | **CONFIRMED** (earlier read; not re-read) | Post, personal communication, quoted in Gahagan (full text, earlier session) | `sea_run_alewife.md` §2 | KNOWN |
| D4a | P: 0.68 g per dying adult (160 g, 0.42% P); 0.18 g per survivor (0.12 excretion + 0.06 gametes) (West 2010; Walters 2009) | **CONFIRMED** (0.68, 0.18, 67% excretion); the rest **derived or unverified** | West 2010 abstract: 0.68 g P per fish from mortality, 0.18 g P per surviving fish, 67% of it excretion. Alewives supply 23% of Bride Lake's annual P load, and 1960s runs supplied 2.5 times more. "160 g" is not in the abstract (0.68 / 0.0042 ≈ 162 g, derived). "33% gametes" is not stated. Barber Table 2: carcass P 0.0147 of dry mass × DW/WW 0.288 ≈ 0.42% of wet mass (derived) | [Crossref, West 2010](https://api.crossref.org/works/10.1139/f10-059); Barber 2018 Table 2 | KNOWN |
| D4b | Alewife P < 5% of summer TP in China Lake, Highland Lake, Togus Pond (USM thesis) | **CONFIRMED**, with a correction | Thurrell 2022 (USM MBioSci) abstract: alewives supplied under 5% of **mean epilimnetic P** in 2017 in four of seven lakes (China, Highland, Togus, **Pawtuckaway NH**). Warwick 3.6–11.19%, Webber 8.67–23.86%, Carr 11.43–93.67% of summer epilimnetic TP | [USM record](https://digitalcommons.usm.maine.edu/etd/414); [PDF (403)](https://digitalcommons.usm.maine.edu/cgi/viewcontent.cgi?article=1431&context=etd) | KNOWN (Warwick NEW) |

---

## Bass length-at-age target for the sim

**The best Maine data I could verify** is MDIFW's own Region C scale data, as analysed by Willis (2006, Fig. 6).
- **Waters:** Big Lake (41.7 km², mean depth 3.7 m), Grand Falls Flowage (27.1 km², 3.0 m) and Woodland Flowage (4.75 km², 4.6 m), all in Washington County.
- **Fit to Hot Brook:** all three are shallow, mesotrophic Downeast waters, a good match for Hot Brook (mean 2.4–3.3 m).
- **Method:** adults were angled in spring before the year's growth began, and their scales back-calculated (Fraser–Lee, intercept 21 mm) to age 5.
- **Reading the ages.** The report gives growth per year by age. Its dating ("growth data … back to 1984 for five-year-olds caught in 1989") means the "Age 1" bar is the first season's growth. That bar, about 66 mm, matches Maine's measured autumn YOY of 56–76 mm (Bass Plan; Spednic Lake).
- **Not a published table.** The lengths below are my cumulation of bar heights read by pixel, not values Willis printed.

| Age (annuli; spring length, before that year's growth) | Region C, all years (cm, derived) | No-alewife years | Alewife years | **Fit: L∞ 56.4, k 0.136, t₀ +0.11** | Sim now (`species.js` vb: 56.4, 0.14, t₀ −0.5) | Other checks |
|---|---|---|---|---|---|---|
| 1 | 6.7 | 6.3 | 7.0 | 6.4 | 10.7 | autumn YOY 5.6–7.6 cm (MDIFW plan; Spednic) |
| 2 | 12.6 | 11.8 | 13.5 | 12.8 | 16.7 | — |
| 3 | 18.1 | 17.0 | 19.5 | 18.3 | 21.8 | males mature at 3–4 yr at 8–12 in (MDIFW) |
| 4 | 23.2 | 22.0 | 24.9 | 23.2 | 26.4 | Gemini 8–9 in (20–23 cm) |
| 5 | 27.7 | 26.6 | 29.2 | 27.4 | 30.3 | Gemini 10 in (25 cm) |
| 6 | — | — | — | 31.1 | 33.7 | 12 in ≈ age 6 in northern Maine (G&F 2008 [SEC]); fit gives 12 in at 5.8 yr |
| 8 | — | — | — | 37.1 | 39.2 | Gemini ≥ 14 in (35.6 cm) |
| 12 | — | — | — | 45.2 | 46.6 | 18 in at ≈ 12 yr (fit) |
| 17–20 | — | — | — | 51–53 | 52–53 | 20 in ≈ 20 yr (MDIFW page, existing note) |

**Readings.**
- **The curve.** The fit keeps the sim's Maine L∞ 56.4 and k ≈ 0.14 (FishBase's Maine row) and moves only t₀, from −0.5 to about +0.1. Through the five points its RMSE is 0.23 cm. It also lands on the two independent anchors: 12 in at about 6 years and 20 in at about 17–20 years.
- **The sim's ages 1–4 are 3–4 cm too long.** Read as years since hatch at the spring annulus, the sim's curve is about 0.6 yr ahead. At age 1 that is 10.7 against 6.4 cm, roughly 5× the weight at Ws. From age 8 on, the gap closes.
- **Where it matters.** `lengthAtAge` / `vbLength` only sets **founder and immigrant starting lengths** (`fish3.js` `add`, `world.js`). After that, growth is the bioenergetics'. The table is also the right **judging target** for the length-at-age audits (FINDINGS; HOT_BROOK_3D).
- **No single curve fits both seasons.** A continuous VB cannot match both the autumn YOY (≈ 7 cm at 0.4 yr) and the spring annulus lengths, because bass do not grow from October to May. Compare sim and field at matching seasons: spring lengths from this table, autumn = spring + that summer's increment (≈ 5–6 cm at ages 1–3, ≈ 4.5 at 5).
- **Alewives.** Growth was equal or slightly better in alewife years (Willis). For a Hot Brook without a substantial run, the no-alewife column, about 1 cm lower, is the conservative target.

**Not verified:** Gemini's own source for the Downeast table (MDIFW 2003, digitalmaine 1183). If the user can open it by hand, its table should replace the derived column.

---

## Alewife numbers for stage A

| Item | Value | Source (verdict) | Use |
|---|---|---|---|
| Run presets | 6/acre (restoration stocking), **35/acre** (DMR minimum commercial escapement), 235/acre (DMR total production). Escapement of 40–60/acre already lowered progeny per parent at Damariscotta (Walton 1987) | SFMP 2024 (read) | Keep `sea_run_alewife.md`'s 15/acre colonising default; 35/acre is a defensible "established run" preset |
| Production arithmetic | 235 = 200 harvested (100 lb/acre at 0.5 lb) ÷ 0.85; the escapement share is ≈ 35/acre | SFMP 2024 (read; the 35 link derived) | 235 is the whole run at full production, not a spawning target |
| Adult mass, St. Croix (Downeast) | ♀ 171 g at age 4 (n 204), 189 g at 5 (n 195), 247 g at 6; ♂ 161, 177, 199 g (DFO et al. 1981–2016) | Barber 2018 Table 2 (read) | Downeast adults run ~160–250 g, lighter than the Maine mean of ≈ 230 g in the notes. Use ~180 g |
| In-lake adult mortality | Long Pond 41% (32–67); **Love Lake 90.7% (66–100)**; Bride 57.4 / 48.6%; models used 37.5% (Durbin), 45% (Barber), 56% (West) | Fay 1983 (read); Barber 2018 (read) | Default 0.5, drawn from 0.3–0.9. Love Lake is the nearest analogue (Washington Co., ≈ Lower's size), which argues for the upper half |
| P per adult | 0.68 g P per adult that dies; 0.18 g P per survivor (67% excretion) | West 2010 abstract (read) | Carcass P to `sedOM`/water; excretion over residence |
| Body P | 0.0147 of dry mass × 0.288 dry/wet ≈ 0.42% of wet mass; excretion 2.17 µg P g⁻¹ h⁻¹ | Barber Table 2 (read) | Consistent with the notes |
| Emigrant P | Age-0 0.0058 g P per g wet; emigrant mass 3.5 g (Havey 1973, Love Lake) → ≈ 20 mg P per emigrant (derived) | Barber Table 2 (read) | **Break-even ≈ 21 emigrants per adult** at 50% adult mortality (derived; see conflicts) |
| Lake TP share | < 5% of mean epilimnetic P in 4 of 7 lakes (China, Highland, Togus, Pawtuckaway; 2017); Webber 8.7–23.9%; Carr 11–94% | Thurrell 2022 abstract (read) | At colonising runs, the alewives' P is a check that should stay small |
| Juvenile emigration (CT) | ≈ 320,000 from mid-June to mid-August 2006, > 80% in 3 pulses of 1–2 d; dawn early in the season, night later; migrants larger, older and fatter | Gahagan 2010 abstract (read) | The pulse model in `sea_run_alewife.md` stands. Maine's season is mid-July to early December |
| Emigrant size | 28–75 mm (Bride, earlier full-text pass); the mean of 41 mm is unverified | — | Use 30–110 mm in Maine (Kircheis), smaller in oligotrophic, tea-coloured lakes |

---

## Conflicts with existing notes

1. **Love Lake adult mortality.** Gemini says 83%; `sea_run_alewife.md` says **90.7%** (66–100%). The note is right (Fay 1983 reviewing Havey 1973, re-read today).
2. **Hot Brook's Oct–Dec rule.** Gemini gives S-4 (no live bait). The notes (2019/2023/2026 law books) give **ALO, S-7**. The notes are right.
3. **"All bass released alive."** Gemini calls it historical; it is still the rule in the 2026 law book (`recent_maine_research.md`).
4. **The 35/acre figure.** Gemini calls it a restoration baseline. It is DMR's **minimum escapement for a commercial fishery**; restoration is 6/acre. `sea_run_alewife.md` ("sustainability floor") is right. **New:** 35 equals the 15% escapement inside DMR's 235/acre production figure, while the 2008 Penobscot plan used 45% (≈ 106/acre; `gemini_hot_brook_checked.md`). The two documents differ; neither is wrong.
5. **Emigrant phosphorus and the break-even point.**
   - **The conflict:** `sea_run_alewife.md` §7 uses 0.43% P (Post) and a 3-g emigrant, ≈ 13 mg P each. That gives a break-even of ≈ 40–70 emigrants per adult. Barber 2018 uses 0.58% and 3.5 g, ≈ 20 mg P, which gives ≈ 21 at 50% adult mortality.
   - **Not settled.** Both come from primary authors.
   - **Effect:** the lakes are net P importers at colonising runs either way.
6. **Love Lake emigrant mass.** `sea_run_alewife.md` derives ≈ 7 g per emigrant from Fay's biomass and counts. Barber cites Havey 1973 for **3.5 g**. Unresolved, since Havey 1973 itself was not read; the two may be different years or summaries.
7. **Downeast adult alewife size.** St. Croix adults (Barber Table 2) average about 160–250 g, against the ≈ 230 g Maine mean in `sea_run_alewife.md`. That mean comes from Damariscotta and Kircheis. For the Penobscot or Downeast frontier, the lighter values may fit better.
8. **Gahagan's season.** Gemini says mid-June through October; the abstract (and the note) say mid-June to mid-August.
9. **Bass size.** Gemini says Downeast adults run 2–3 lb. The Bass Plan says caught fish average 0.6 lb in eastern/northern Maine, and harvested fish 1.0 lb in Region C.
10. **The sim's bass growth curve.**
    - **Where it is cited:** `species.js` (`vb` comment "~11, 17, 22, 26, 30 cm at 1–5") and `../Real lake ecology for calibration/juvenile_refuges_and_bass_young.md` ("Maine length-at-age in the sim: ~11, 17, 22, 26 cm").
    - **The conflict:** the Region C back-calculated spring lengths are **6.7, 12.6, 18.1, 23.2, 27.7 cm**. The sim's founders at ages 1–4 start about one year's growth too large (see the table above).
11. **Ice fishing for bass.** Gemini (§1, §4) has Maine bass "surging" through the ice in March. The Bass Plan says Washington and Hancock bass are almost never caught by winter anglers (Region C winter 0.34 bass per angler-day, against 1.43 in summer). This agrees with `fetched_sources_digest.md` §4.
12. **Chain pickerel bag 10.** No existing note covers it. The general-law 10-fish limit appears to have been dropped in 2018 (*BDN* [SEC]; the statute is repealed).

**Worth getting by hand (blocked to me):**
- MDIFW 2003 *Fisheries & Hatcheries Research and Management Report* (digitalmaine ifw_docs 1183): the Downeast bass table and the "25 lakes / 6,000 bass" claim.
- Seiders 2013 *Sebec Lake* report and Lucas 2002 *Minor Sportfish Plan* (maine.gov): the C1 and C3 catch rates.
- The 2024–26 law book's general-law table: the pickerel limit.
- Gahagan et al. 2010 full text (OUP paywall): the mean emigrant length.
- Thurrell 2022 thesis PDF (USM): which mortality and P values it used.
