// export_turbines.mjs — THE WIND FARM ON THE RIDGES SOUTH-WEST OF THE LAKES for Unreal: the Stetson wind farm (2009, 38 turbines) and
// its expansion (2010, 17) — GE 1.5-77s, 80-m hubs, 77-m rotors — from the US Wind Turbine Database (energy.usgs.gov/api/uswtdb/v1,
// public), each one's ground from the USGS elevation point service (epqs.nationalmap.gov), both saved locally as
// tools/hotbrook/data/turbines_uswtdb.json (fetched 2026-10-24); placed in the sim's metres as export_camps.mjs places the lawns (the
// model's lon/lat origin and the connecting brook's first point). Writes Import/turbines.json: { turbines: [{ x, y, ground (m above sea
// level), hub, rotor (m), farm, lit }] } — lit: the ones carrying the red aviation beacon (the FAA lights a wind farm's outline and
// every ~800 m within it: here the ends of each row and every third turbine).
//   node ue/export/export_turbines.mjs [out dir, default G:/HotBrookUE/Import]
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const OUT = process.argv[2] || 'G:/HotBrookUE/Import';
const data = JSON.parse(readFileSync(new URL('../../tools/hotbrook/data/turbines_uswtdb.json', import.meta.url), 'utf8'));
const model = JSON.parse(readFileSync(new URL('../../tools/hotbrook/data/hotbrook_model.json', import.meta.url), 'utf8'));
const { lat0, lon0, mx, my } = model.meta, P0 = model.streams.find(s => s.name.includes('connecting')).pts[0];
const r2 = v => Math.round(v * 100) / 100;
const byFarm = {};
for (const t of data) {
  if (!(t.ground > 0)) continue;
  (byFarm[t.p_name] = byFarm[t.p_name] || []).push({ x: r2((t.xlong - lon0) * mx - P0[0]), y: r2((t.ylat - lat0) * my - P0[1]), ground: r2(t.ground), hub: t.t_hh || 80, rotor: t.t_rd || 77, farm: t.p_name });
}
const turbines = [];
for (const [farm, L] of Object.entries(byFarm)) {
  L.sort((a, b) => a.y - b.y);   // (the rows run roughly north–south along their ridges)
  L.forEach((t, i) => { t.lit = i === 0 || i === L.length - 1 || i % 3 === 0; turbines.push(t); });
}
writeFileSync(join(OUT, 'turbines.json'), JSON.stringify({ source: 'USGS US Wind Turbine Database; USGS EPQS ground', turbines }, null, 1));
console.log(`turbines: ${turbines.length} (${Object.entries(byFarm).map(([k, v]) => `${k} ${v.length}`).join(', ')}), ${turbines.filter(t => t.lit).length} lit → ${OUT}`);
