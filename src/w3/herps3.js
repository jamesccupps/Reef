// THE HERPS AS CONSUMERS (E6b, E6c1 — docs/review/ECOSYSTEM_BUILD.md "E6"; research_notes/Maine lake shores and catchment/
// turtles_and_frogs.md): the painted turtles, the snapping turtles' and bullfrogs' food other than fish (their fish: E6a's WILD3
// rows in fish3), the green and mink frogs at the waterline, the red-spotted newts in the weeds. Each is a population by its
// habitat's measure (per ha of the weedy shallows, per metre of vegetated shore, per ha of the lakes — WILD3's counts for the two
// fish-eaters), eating its daily ration by the water's temperature from the pools the lakes keep: plants3's stands, littoral3's
// weed fauna, snails and crayfish, the surface's insects. The fauna are nutrient-neutral (as the fish); the plants they eat return
// their N and P as a dead plant's do (plants3 _die: excretion and faeces — a grazer speeds the return and holds none of it), so the
// budgets stay closed. Pure: no DOM; WILD3 read at call time.
import { HERP3, seasonalTemp } from '../config.js';
import { GEO, BODIES, LAND } from './geometry.js';
import { DAY3 } from './clock3.js';
import { FORMS3, NF3, PL3 } from './plants3.js';
import { WILD3, WILD_LAKE_HA } from './fish3.js';

const POOLS = ['plant', 'weed', 'small', 'snail', 'cray', 'surf'];

export class Herps3 {
  constructor(env) {
    this.env = env; this.G = env.G; this.chem = env.chem; this.plants = env.plants; this.lit = env.lit;
    const P = this.plants, G = this.G, nb = P.cells.length;
    this.lakeHa = (BODIES[0].area + BODIES[1].area) / 1e4; this.fa = this.lakeHa / WILD_LAKE_HA;   // (the world's share of the real lakes)
    // each bed cell's area (m², world) and the plant-form preferences
    this.A = new Float64Array(nb); for (let i = 0; i < nb; i++) this.A[i] = G.bedA[P.cells[i]];
    this.prefPT = FORMS3.map(F => HERP3.PLANT_PREF[F.key] ?? 0);
    this.ate = {}; this.n = {}; for (const k of HERP3.KINDS) { this.ate[k] = Object.fromEntries(POOLS.map(p => [p, 0])); this.n[k] = 0; }
    this.want = 0; this.got = 0; this._n = 0;
  }
  // the vegetated shore (world m, littoral3's bank: each column's land edges × their cover) and its sum
  _shoreM() { if (this._sh === undefined) { let s = 0; for (const b of this.lit.bank) s += b; this._sh = s; } return this._sh; }
  // the whole shore (world km: the water cells' land edges × 0.8, as fish3 _shoreKm — WILD3's per-km counts)
  _shoreKm() { if (this._km === undefined) { let m = 0; const NX = GEO.NX, NY = GEO.NY; for (let i = 0; i < GEO.N; i++) { if (GEO.body[i] === LAND) continue; const r = Math.floor(i / NX), q = i % NX; for (const [dq, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const qq = q + dq, rr = r + dr; if (qq < 0 || rr < 0 || qq >= NX || rr >= NY) continue; if (GEO.body[rr * NX + qq] === LAND) m += GEO.CELL * 0.8; } } this._km = m / 1000; } return this._km; }
  step(dt) { if (!HERP3.ON || !this.lit) return; if (++this._n >= HERP3.SLOW) { this._feed(dt * this._n); this._n = 0; } }
  // the ration (g wet a day for one animal) at T °C: Q10 about 20 °C, nothing below the first threshold, ramped to the second
  _ration(r, T, act) { if (!(T > act[0])) return 0; return r * Math.pow(HERP3.Q10, (T - 20) / 10) * Math.min(1, (T - act[0]) / Math.max(1e-9, act[1] - act[0])); }
  _feed(ds) {
    const e = this.env, H = HERP3, P = this.plants, L = this.lit, G = this.G, T = e.temp, nb = P.cells.length, dd = ds / DAY3, yf = e.yearFrac();
    if (e.iceMean > 0.9) { for (const k of H.KINDS) this.n[k] = 0; return; }   // (under full ice: all of them in the bed, torpid)
    // the shallows' mean temperature (the herps' water)
    let tS = 0, aS = 0; for (let i = 0; i < nb; i++) if (P.zb[i] < 2) { tS += T[P.cells[i]] * this.A[i]; aS += this.A[i]; }
    const Tl = aS > 0 ? tS / aS : seasonalTemp(yf);
    for (const k of H.KINDS) {
      const d = H[k]; let n = 0, ration = 0, zMax = d.z ?? 2, edge = false, fish = 0;
      if (d.wild) {   // E6a's fish-eaters: their count and season as WILD3's, the food that is not fish
        const w = WILD3[d.wild], [y0, y1] = w.yf; if (!(yf >= y0 && yf < y1)) { this.n[k] = 0; continue; }
        n = w.perHa ? w.perHa * this.lakeHa : w.perKm * this._shoreKm() / GEO.SCALE * this.fa;   // (fish3 _wildN)
        const cold = Math.min(1, Math.max(0, (15 - seasonalTemp(yf)) / 12)); fish = w.fish[1] + (w.fish[0] - w.fish[1]) * cold;
        ration = w.need * (1 - fish) * (Tl > d.act[0] ? 1 : 0); zMax = w.b[1]; edge = !!d.edge;
      } else if (d.perHa) { let a = 0; for (let i = 0; i < nb; i++) if (P.zb[i] <= zMax) a += this.A[i]; n = d.perHa * a / 1e4; ration = this._ration(d.ration, Tl, d.act); }
      else if (d.perM) { n = d.perM * this._shoreM() / GEO.SCALE * this.fa; ration = this._ration(d.ration, Tl, d.act); edge = true; }
      this.n[k] = n; if (!(n > 0 && ration > 0)) continue;
      const total = n * ration * dd;   // g wet over ds
      this.want += total;
      for (const pool of POOLS) { const s = d.diet[pool] || 0; if (s > 0) this.got += this._take(k, pool, total * s, zMax, edge); }
    }
  }
  // take g (wet) of a pool from the herps' cells — the shallows to zMax by bed area (edge: the shore's columns by their bank), each
  // cell giving in proportion to what it holds, at most TAKE_MAX of it a step; returns what was taken (the plants: what each float32
  // store actually lost, tt — the N and P budgets exact)
  _take(k, pool, g, zMax, edge) {
    const P = this.plants, L = this.lit, G = this.G, ch = this.chem, nb = P.cells.length, H = HERP3, cap = H.TAKE_MAX;
    const wOf = i => (P.zb[i] <= zMax ? 1 : 0) * (edge ? (L.bank[P.col[i]] > 0 ? 1 : 0) : 1);
    let have = 0;
    if (pool === 'plant') {   // g wet → g dry; each form by its preference; the eaten shoots return as a dying shoot does (plants3 _die), summed over the forms a cell (one float32 add each)
      const want = g * H.PLANT_DW, pr = this.prefPT; for (let i = 0; i < nb; i++) { const w = wOf(i); if (!w) continue; for (let f = 0; f < NF3; f++) if (pr[f] > 0) have += P.Bs[f][i] * pr[f] * this.A[i]; }
      if (!(have > 0)) return 0; const phi = Math.min(cap, want / have); let got = 0;
      for (let i = 0; i < nb; i++) { const w = wOf(i); if (!w) continue; const j = P.cells[i];
        let m = 0, p = 0, n = 0; const A = this.A[i];
        for (let f = 0; f < NF3; f++) { if (!(pr[f] > 0)) continue; const B = P.Bs[f], b0 = B[i], t = b0 * phi * pr[f]; if (!(t > 0)) continue; B[i] = b0 - t; const tt = b0 - B[i]; m += tt; p += tt * A * FORMS3[f].P * PL3.P_UNIT; n += tt * A * FORMS3[f].N * PL3.N_UNIT; }
        if (m > 0) { ch.phos[j] += p * PL3.DEATH_DISS / ch.w[j]; ch.sedP[j] += p * (1 - PL3.DEATH_DISS) / ch.a[j]; ch.nh4[j] += n / ch.w[j]; ch.sedOM[j] += m * A / ch.a[j]; got += m * A; } }
      this.ate[k].plant += got / H.PLANT_DW; return got / H.PLANT_DW;
    }
    if (pool === 'surf') {   // the surface's insects (emerging and fallen) over the columns of those cells
      const seen = new Uint8Array(G.NC); let cols = []; for (let i = 0; i < nb; i++) if (wOf(i)) { const c = P.col[i]; if (!seen[c]) { seen[c] = 1; cols.push(c); } }
      for (const c of cols) have += (L.surfA[c] + L.surfT[c]) * G.area[c];
      if (!(have > 0)) return 0; const phi = Math.min(cap, g / have);
      for (const c of cols) { L.surfA[c] -= L.surfA[c] * phi; L.surfT[c] -= L.surfT[c] * phi; }
      this.ate[k].surf += phi * have; return phi * have;
    }
    const arr = pool === 'weed' ? L.L : pool === 'small' ? L.S : pool === 'snail' ? L.sn : L.crA;
    for (let i = 0; i < nb; i++) if (wOf(i)) have += arr[i] * this.A[i];
    if (!(have > 0)) return 0; const phi = Math.min(cap, g / have);
    for (let i = 0; i < nb; i++) if (wOf(i)) arr[i] -= arr[i] * phi;
    this.ate[k][pool] += phi * have; return phi * have;
  }
}
