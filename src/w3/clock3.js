// clock3.js — the 3-D sim's clocks (pure). The human chose a 1-hour year (2026-10-15): YEAR_LEN 3600 s, a day–night cycle of
// 120 s (still 30 visible days and nights a year, each standing for ~12 real days). Every rate that integrates over time runs
// on the calendar (365 physiological days a year); the day–night cycle only modulates. The 2-D sim's calibrated per-second
// rates (its YEAR 1800 s, DAY 60 s) carry over × TS.
export const CLOCK3 = { YEAR_LEN: 3600, DAY_LEN: 120 };
export const TS = 1800 / CLOCK3.YEAR_LEN;                  // the 2-D sim's per-second rates → this clock
export const REAL_S = 365 * 86400 / CLOCK3.YEAR_LEN;        // real seconds per sim second (~2.4 h)
export const DAY3 = CLOCK3.YEAR_LEN / 365;                  // sim seconds per physiological (calendar) day (~9.9 s)
