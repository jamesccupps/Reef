# Maine lake monitoring data (2025 tables): the lakes around Hot Brook

Source: Maine DEP / Volunteer Lake Monitoring Program, *Lakes Data Tables 2025*. The human downloaded it on 2026-10-16 and supplied it as `LakesDataTables2025.zip`. It holds seven tables:
- `OVERALL_SUMMARIES`;
- `ANNUAL_SUMMARIES`;
- `GENERAL` (Secchi by date);
- `CHEM`;
- `CHLORO`;
- `PHOS`;
- `DO_TEMP_PROFILES`.

The raw tables (61 MB) are not in the repository; this note holds what was extracted for the sim. Units: Secchi depth in m; colour in SPU (≈ PCU); chlorophyll-a in µg/L; total phosphorus (TP) in µg/L; alkalinity in mg/L as CaCO₃; conductivity in µS/cm. "To bottom" means the Secchi disk was still visible on the bottom, so the true transparency is at least that.

## Upper and Lower Hot Brook Lake: no data

Neither lake (MIDAS 1076 / 1072) appears in any table, by number or by name. This confirms the earlier finding (`recent_maine_research.md`) that no water measurement of either lake exists since the 1949 MDIFW survey. The nearest monitored lakes, in the same towns and watershed, are the best stand-ins.

## The nearby lakes (OVERALL_SUMMARIES; ANNUAL_SUMMARIES for the years)

| Lake (MIDAS, town) | Secchi mean (range of yearly means) | Colour | Chl-a | TP | pH / alk / cond | Notes |
|---|---|---|---|---|---|---|
| **Faulkner Lake** (1064, Weston — Hot Brook's own town) | 4.0 (3.5–4.5; 2003–06), often to bottom | 18 | 3.6–5.5 | 9–12 | 6.8–7.0 / 8.4 / 30 | shallow (profiles to 4 m) |
| **North Lake** (1063, Orient) | 3.7–3.9 (3.3–4.6; 1992–2014, 2 stations), to bottom | – | – | – | – | 22-year volunteer record |
| **Baskahegan Lake** (1078, Brookton Twp — downstream, the sim's chemistry analogue) | 4.1 (3.7–4.7; 2001–11) | 46 | 3.1–3.3 | 9–10 | 6.6 / 5.5 / 26 | |
| Brackett Lake (1068, Weston) | 7.2 (6.7–7.6) | 16–20 | 1.7–2.6 | 6.5–9.5 | 7.2 / 11.4 / 40 | deeper (8–10 m) |
| East Grand Lake (1070, Weston) | 6.1–8.3 by station | 10 | 1.3–2.1 | 5–6 | 6.6–7.2 / 11–12 / 30–38 | large, deep, clear |
| Drews Lake (1736, Linneus) | 5.3 | 16.5 | 4.3 | 8.7 | 7.0 / 11.5 / 33 | |
| Mattawamkeag Lake (1686, Island Falls) | 3.4–3.7 | 52–88 | 2.0–3.0 | 11–14 | 6.8–7.0 / 14–19 / 48–62 | coloured, downstream system |
| Burden Pond / 2nd Buttermilk Pond (Bowerbank) | 2.9–3.5 | 36–51 | 2.9–4.5 | 10 | 6.4–6.5 / 6–9 | small coloured ponds |

**For Hot Brook** (shallow, unstratified, soft, tea-coloured; 1949: "slightly turbid", brown water):
- The closest analogues are Faulkner, North and Baskahegan lakes.
- Read together: **Secchi ≈ 3.5–4.5 m** (mean ~3.9, the shallow ones often to bottom), **colour ~18–46**, **chlorophyll 3–5.5 µg/L**, **TP 9–12 µg/L**, **pH 6.6–7.0**, **alkalinity 5.5–8.4 mg/L**.
- The sim's water: Secchi ~3.2 m (CHEM3.KD_COLOUR 0.5), colour 30–60. That agrees with the human's "the water is a bit clearer": raise the sim toward Secchi ~3.9 m.

## Late-summer oxygen and temperature profiles (DO_TEMP_PROFILES)

| Lake | Date | Surface | Bottom |
|---|---|---|---|
| Baskahegan | 2004-08-23 | 20.7 °C, 8.7 mg/L | 5 m: 20.7 °C, 8.7 (fully mixed) |
| Baskahegan | 2011-08-22 | 23.4 °C, 7.7 | 7 m: 22.5 °C, 7.6 (mixed) |
| Faulkner | 2004-09-03 | 20.4 °C, 8.1 | 4 m: 20.1 °C, 7.9 |
| Faulkner | 2006-08-24 | 20.2 °C, 8.9 | 4 m: 19.3 °C, 8.6 |
| North Lake | 2006-08-24 | 20.5 °C, 8.6 | 7 m: 19.4 °C, 7.8 |
| Brackett (8–10 m) | 1996-08-20 / 2005-08-08 | 21.8–23.8 °C, 8.5–9.0 | 13.5–18.8 °C, **0.2–0.4** (stratified) |
| Brackett | 2002-08-22 / 2011-08-24 | 21.6–23.7 °C | 21.6–23.3 °C, 8.9–9.6 (mixed) |

**For the sim:**
- Lakes of Hot Brook's depth (4–7 m) stay mixed and oxygenated top to bottom in late summer: 19–23 °C, 7.6–8.9 mg/L at the bottom.
- The sim's summer agrees: unstratified, summer O₂ 93–94 % of saturation, bottom minimum 7.2 mg/L.
- Only the deeper Brackett (8–10 m) sometimes stratifies and goes anoxic at the bottom.
- Late-August surface water ran 20–23.8 °C in these years. The sim's 24 °C peak (end of July) is consistent.

## Gaps

- No winter (under-ice) profiles were found for these lakes in the extract. The sim's late-winter O₂ (lake mean ~2–3 mg/L by March) remains unchecked against data.
- Faulkner, North and Baskahegan have no profile from June or July. The profiles are late-August/September only.
