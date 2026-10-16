// clock3.js — the 3-D sim's clocks (pure). REAL TIME (the human, 2026-10-16: "real time + fast-forward"; the blueprint
// docs/W3_REALTIME_AUDIT.md): a sim second is a real second and a year is 365 days of 86,400 s. Every rate that integrates over
// time is per real second, so the fidelity ladder (fine steps for watching, coarse ones for the seasons, the gate and
// evolution) changes the STEP, never the clock. The 2-D sim's calibrated per-second rates (its year TIME.YEAR_LEN 1800 s)
// carry over × PER2D (= TS, its old name).
// The day is a real day (stage R2 step 5): 86,400 s, its night as long as the season's. OLD_S is the 1-hour year's real
// seconds per sim second, for the constants still calibrated on it (each marked "compat"; R3 replaces them).
import { TIME } from '../config.js';
export const OLD_S = 365 * 86400 / 3600;                   // 8,760: the 1-hour year's real seconds per sim second
export const CLOCK3 = { YEAR_LEN: 365 * 86400, DAY_LEN: 86400 };
export const PER2D = TIME.YEAR_LEN / CLOCK3.YEAR_LEN;       // a 2-D per-second rate → per real second (1/17,520)
export const TS = PER2D;
export const REAL_S = 1;                                    // real seconds per sim second (kept while formulas still say it)
export const DAY3 = CLOCK3.YEAR_LEN / 365;                  // a calendar (physiological) day: 86,400 s
