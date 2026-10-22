# Houlton's daily precipitation, 1991–2020: the statistics the sky chain is fitted to (E9d)

Source: NOAA NCEI Global Historical Climatology Network – Daily, station USW00014609 (Houlton International Airport, ~70 km north of
Danforth), 1991-01-01 to 2020-12-31, PRCP / SNOW / TMAX / TMIN in metric units, via the NCEI access data service
(`https://www.ncei.noaa.gov/access/services/data/v1?dataset=daily-summaries&stations=USW00014609&dataTypes=PRCP,SNOW,TMAX,TMIN&startDate=1991-01-01&endDate=2020-12-31&format=csv&units=metric`).
10,958 days, 2 missing precipitation. Statistics computed by the probe `pstats.mjs` (the same function scores the model's daily series).
The raw file is not kept in the repository.

## Occurrence (a day is wet at ≥ 0.25 mm)

| Statistic | Houlton |
|---|---|
| Annual total | 995 mm (CV across years 0.15) |
| Wet days | 39 % (144 a year) |
| P(wet \| wet yesterday) | 0.50 |
| P(wet \| dry yesterday) | 0.32 |
| Mean wet spell | 2.00 days |
| Mean dry spell | 3.08 days (longest 20) |

So rain comes about every 5 days, in 1–2-day systems. The 2-D sky chain the 3-D lakes inherited cycled about every 27 days: a 10-day
wet spell and a 20-day dry one (the longest 201 days).

## Amounts

| Statistic | Houlton |
|---|---|
| Wet-day mean | 6.9 mm (CV 1.33) |
| Days a year ≥ 2.5 / 6.4 / 12.7 / 25.4 / 51 mm | 84 / 51 / 25.2 / 6.9 / 0.87 |
| The median year's wettest 1 / 2 / 7 days | 56 / 69 / 95 mm (NOAA Atlas 14's 1-year 24-h storm at Danforth: 57 mm) |

## Monthly totals (mean, CV across the 30 years)

Jan 66 (0.56) · Feb 50 (0.41) · Mar 68 (0.44) · Apr 74 (0.40) · May 88 (0.36) · Jun 102 (0.47) · Jul 92 (0.50) · Aug 89 (0.37) ·
Sep 86 (0.61) · Oct 103 (0.43) · Nov 90 (0.41) · Dec 85 (0.38). Mean monthly CV 0.44. No month in 30 years was dry.

## The air (the daily mean (TMAX+TMIN)/2)

Monthly mean (SD of the daily means within the month): Jan −10.6 (7.1) · Feb −9.5 (6.7) · Mar −3.6 (5.9) · Apr 3.7 (4.1) ·
May 10.7 (4.1) · Jun 15.7 (4.0) · Jul 19.0 (3.1) · Aug 18.0 (3.2) · Sep 13.4 (4.3) · Oct 6.8 (4.4) · Nov 0.6 (5.2) · Dec −6.2 (6.4).
Lag-1 autocorrelation of the anomalies 0.64. (E9a's air model: SDs 2.6–6.5 °C by month and a 3-day memory, consistent once the
within-month seasonal trend is allowed for.)
