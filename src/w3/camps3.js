// camps3.js — the camps, docks, roads and the launch at the Hot Brook lakes (pure: no DOM; the sim and the view both read it).
// The world shown's generated data (tools/hotbrook/build_camps3.py → camps3d.js / true/camps3d.js, from the verified dataset —
// docs/research_notes/Maine lake shores and catchment/camps_roads_docks_hot_brook.md) and the calendar its people keep:
// - the docks go in late May and come out mid-October (Maine: after ice-out, by Memorial Day; out mid-Sept → mid-Oct —
//   shoreline_development_effects.md §5);
// - a seasonal camp is lived in on a given day with the month's share (May 0.1, June 0.4, July–August 0.75, September 0.35,
//   October 0.1, none from November to April but a few ice-fishing day visits), weekends twice the weekdays (§5: ~75–95 days a
//   year); a year-round home most days.
// Positions are the world's metres (x east, y north); `CAMPS.scale` is the world's horizontal scale (the docks' lengths are this
// world's: × scale, as its shores are).
import { WORLD_TRUE } from './geometry.js';
const { CAMPS3D } = WORLD_TRUE ? await import('./true/camps3d.js') : await import('./camps3d.js');
export const CAMPS = CAMPS3D;

// yf 0 = March 1 (config SEASON): the docks are in from May 25 to October 15
export const DOCK_IN = (31 + 30 + 24) / 365, DOCK_OUT = (31 + 30 + 31 + 30 + 31 + 31 + 30 + 14) / 365;
export const docksIn = yf => yf >= DOCK_IN && yf < DOCK_OUT;

// the share of seasonal camps lived in on a day, by month (index 0 = March … 11 = February)
export const OCC_MONTH = [0, 0, 0.1, 0.4, 0.75, 0.75, 0.35, 0.1, 0, 0, 0, 0];
export const OCC_YEARROUND = 0.85;
const hash = (a, b) => { let h = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(b + 0x6b43a9b5, 0xc2b2ae35); h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; return (h >>> 0) / 4294967296; };
// day: whole days since the sim's clock began (time / 86400); its weekday — day 0 a Sunday (March 1, 2026 was), 0 and 6 the weekend
export function occShare(yf, day) {
  const m = Math.min(11, Math.floor(yf * 12)), f = OCC_MONTH[m], wk = day % 7, weekend = wk === 0 || wk === 6;
  return Math.min(0.98, f * (weekend ? 14 / 9 : 7 / 9));   // (weekday f·7/9, weekend twice that: the month's mean is f)
}
// is camp i lived in on that day (a stable draw per camp and day — not the sim's random stream, so it draws nothing from it)
export function occupied(i, yf, day) {
  const c = CAMPS.camps[i]; if (!c || !c.home) return false;
  return hash(i + 1, day) < (c.yr ? OCC_YEARROUND : occShare(yf, day));
}
