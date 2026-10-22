// forest3.js — THE FOREST'S MAMMALS (E14; config FOREST3; research_notes/Maine lake shores and catchment/forest_mammals_bears_deer_moose.md):
// individual black bears, white-tailed deer and moose on the land around the lakes, at the field's densities over the REAL land the grid holds,
// each walking its home range by the season and the hour — the bears to their dens in the fall and out in April, the deer to their yard in the
// softwood once the snow is deep, to the water's edge at dawn and dusk; the moose into the weedy shallows on summer evenings. What they do to the
// lakes, by mechanism, × the world's share of the real lakes (fa — as WILD3's rows and PL3.MOOSE are):
//  - the bears fish the brook's riffles through the sucker run: fish3 WILD3.bear reads fishing() — the bears fishing now — as its count;
//  - the deer crop the edge's emergent and floating plants (plants3's shoots, as herps3 and the moose take them) and leave their dung on land:
//    the shoots' N and P go ashore (chem3's ledger outP / outN, as PL3.MOOSE's — the budgets closed);
//  - the moose wade where PL3.MOOSE's take falls (each bout's spot drawn from that take's own weights); the take stays plants3's.
// Each animal walks LEGS — a straight line to a target at its pace, or a spell in place (grazing, bedded, denned) — each ending at a time; a
// step of any length finishes the legs that ended within it and plans the next at their own end times (the hour and the season then), so the
// fine view steps and the half-hour blocks walk the same paths. Deterministic on its own stream (mulberry32, seeded from the weather's — itself
// from the sim's core.rand at the lake's opening — so the forest never shifts the fish's or the weather's draws). Pure: no DOM.
//
// THE VIEW'S INTERFACE: env.forest.animals — one stable object an animal, updated in place each step: { id, kind: 'bear'|'deer'|'moose', x, y
// (world m, the fish's frame), heading (rad: x += cos, y += sin), act ('walk' 'graze' 'browse' 'drink' 'wade' 'fish' 'bed' 'den'), young (the
// cubs, fawns or calves with her), len (m, nose to tail) } and the extras ylen (the young's length, m), sex ('f'/'m'), tx, ty, spd, t1 (the
// leg's end: it goes on toward (tx, ty) at spd m/s until sim time t1 — the view can carry it between the water's steps); env.forest.count(kind).
import { FOREST3, SEASON, WEATHER3, SPAWN } from '../config.js';
import { GEO, LAND, UPPER, LOWER, BROOK, BODIES, cellIndex } from './geometry.js';
import { CLOCK3 } from './clock3.js';
import { FORMS3, NF3, PL3 } from './plants3.js';
import { SP3 } from './species3.js';
import { WILD_LAKE_HA, F3 } from './fish3.js';

const DAY = 86400, YEAR = CLOCK3.YEAR_LEN;
const wrap1 = v => ((v % 1) + 1) % 1;
const inYf = (yf, w) => w[0] <= w[1] ? yf >= w[0] && yf < w[1] : yf >= w[0] || yf < w[1];   // (a window may wrap the year's end)
// a cover map by class name → weights by GEO.CLASSES index (0 where unnamed: water, stream, the dense town)
const coverW = o => Float32Array.from(GEO.CLASSES, n => o[n] ?? 0);

export class Forest3 {
  constructor(env) {
    this.env = env; this.G = env.G; this.F = FOREST3;
    this._s = ((env._wx ^ 0x85EBCA6B) | 0) || 1;   // (its own stream, from the weather's seed: no draw of core.rand's)
    this.fa = (BODIES[0].area + BODIES[1].area) / 1e4 / WILD_LAKE_HA;   // (the world's share of the real lakes: 1 at true scale, ~0.01 at 1/10)
    this.S = GEO.SCALE; this.step0 = Math.max(GEO.CELL, FOREST3.PATH_STEP * GEO.SCALE);
    this._statics();
    // the weights (by cover class) each kind chooses its home, its feeding and its bed by
    const B = FOREST3.bear, D = FOREST3.deer, M = FOREST3.moose;
    this.W = { bear: { home: coverW(B.HOME), cover: B.COVER.map(coverW), bed: coverW(B.BED) }, deer: { home: coverW(D.HOME), cover: [coverW(D.COVER)], bed: coverW(D.BED) },
      moose: { home: coverW(M.HOME), cover: M.COVER.map(coverW), bed: coverW(M.BED) } };
    this.stats = { fishS: 0, deerAte: 0, deerWant: 0, deerShoreS: 0, wadeS: 0, edgeVisits: 0, drinks: 0 };   // (bear-seconds fishing; g DW the deer cropped / wanted; deer-seconds cropping at the edge; moose-seconds wading)
    this.snowCm = 0; this.runOn = false; this.runT = 0; this._env();
    // THE CENSUS: each kind at its density over the real land the grid holds; ids in order
    this.animals = []; this._sh = new Map(); let id = 0; const T = env.time;
    for (const kind of FOREST3.KINDS) { const n = Math.round(FOREST3[kind].PER_KM2 * this.landKm2); for (let k = 0; k < n; k++) this.animals.push(this._make(id++, kind, T)); }
    this._t = T;
  }
  _r() { this._s = (this._s + 0x6D2B79F5) | 0; let t = Math.imul(this._s ^ (this._s >>> 15), 1 | this._s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
  _u(a, b) { return a + (b - a) * this._r(); }
  count(kind) { let n = 0; for (const a of this.animals) if (kind === undefined || a.kind === kind) n++; return n; }
  // the bears fishing the brook now (fish3 WILD3.bear's count, × fa there)
  fishing(kind = 'bear') { let n = 0; for (const a of this.animals) if (a.kind === kind && a.act === 'fish') n++; return n; }

  // ---------- the land's statics: its area, the shore's edge points, the brook's riffles, the deer's yards ----------
  _statics() {
    const N = GEO.N, NX = GEO.NX, NY = GEO.NY, C = GEO.CELL, body = GEO.body, env = this.env;
    let land = 0; for (let i = 0; i < N; i++) if (body[i] === LAND) land++;
    this.landKm2 = land * C * C / (GEO.SCALE * GEO.SCALE) / 1e6;   // (the real land the grid holds)
    // the SHORE: each land cell beside a lake's or the brook's water — the edge point between them (where an animal stands to drink or crop),
    // the water's column (env3: the bed cells it crops), its body
    const sx = [], sy = [], sc = [], sb = [], si = [];
    for (let i = 0; i < N; i++) {
      if (body[i] !== LAND) continue; const r = Math.floor(i / NX), q = i % NX;
      for (const [dq, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const qq = q + dq, rr = r + dr; if (qq < 0 || rr < 0 || qq >= NX || rr >= NY) continue; const k = rr * NX + qq; if (body[k] === LAND) continue;
        const [x0, y0] = GEO.cellCentre(i), [x1, y1] = GEO.cellCentre(k);
        sx.push((x0 + x1) / 2); sy.push((y0 + y1) / 2); sc.push(env.colAt(x1, y1)); sb.push(body[k]); si.push(x0, y0); break;
      }
    }
    this.shX = Float32Array.from(sx); this.shY = Float32Array.from(sy); this.shCol = Int32Array.from(sc); this.shBody = Uint8Array.from(sb); this.shL = Float32Array.from(si);   // (shL: the land cell's centre, x y pairs — dry footing)
    // the BROOK's riffles (its cells with water ≤ FISH.RIFFLE m; all of it if none) — where a bear stands to fish
    const rx = [], ry = []; for (const lim of [FOREST3.bear.FISH.RIFFLE, 99]) { for (let i = 0; i < N; i++) if (body[i] === BROOK && GEO.depth[i] <= lim) { const [x, y] = GEO.cellCentre(i); rx.push(x); ry.push(y); } if (rx.length) break; }
    this.rfX = Float32Array.from(rx); this.rfY = Float32Array.from(ry);
    // the lakes' water at the brook's two mouths (the sucker run's cue: where the runners stage) — each lake's column nearest its end of the brook
    const BP = GEO.BROOK_PATH, G = this.G, near = (x, y, b) => { let best = 1e18, k = -1; for (let c = 0; c < G.NC; c++) if (G.body[c] === b) { const d = (G.cx[c] - x) ** 2 + (G.cy[c] - y) ** 2; if (d < best) { best = d; k = c; } } return k; };
    this.mouthCols = [near(BP[0][0], BP[0][1], UPPER), near(BP[BP.length - 1][0], BP[BP.length - 1][1], LOWER)].filter(c => c >= 0);
    // the DEER'S YARDS: blocks of YARD_BLOCK m real, each its share of softwood (evergreen, wooded swamp) — a deer winters in the best block
    // near its home (_make)
    const bs = Math.max(2, Math.round(FOREST3.deer.YARD_BLOCK * GEO.SCALE / C)), BX = Math.ceil(NX / bs), BY = Math.ceil(NY / bs);
    const soft = new Float32Array(BX * BY), all = new Float32Array(BX * BY);
    for (let i = 0; i < N; i++) { if (body[i] !== LAND) continue; const b = Math.floor(Math.floor(i / NX) / bs) * BX + Math.floor((i % NX) / bs); all[b]++; if (GEO.cover[i] === 1 || GEO.cover[i] === 4) soft[b]++; }
    this.yards = []; for (let b = 0; b < BX * BY; b++) if (all[b] >= 0.5 * bs * bs) this.yards.push({ x: GEO.X0 + ((b % BX) + 0.5) * bs * C, y: GEO.Y0 + (Math.floor(b / BX) + 0.5) * bs * C, s: soft[b] / all[b] });
    // the plants' bed cells by water column (the deer's edge take; the moose's spots)
    const P = env.plants; this.colBed = null;
    if (P) { this.colBed = Array.from({ length: this.G.NC }, () => []); for (let i = 0; i < P.cells.length; i++) this.colBed[P.col[i]].push(i);
      this.dPref = FORMS3.map(F => FOREST3.deer.PREF[F.key] || 0); this.mPref = FORMS3.map(F => PL3.MOOSE_PREF[F.key] || 0); }
  }
  // ---------- the season's land: the snow, the sucker run's cue ----------
  _env() {
    const e = this.env, yf = e.yearFrac();
    if (WEATHER3.HYDRO) this.snowCm = (e.swe || 0) / FOREST3.SNOW_RHO * 100;
    else { const K = FOREST3.SNOW_CAL, x = yf < K[0][0] ? yf + 1 : yf; let s = 0; for (let k = 0; k < K.length - 1; k++) if (x >= K[k][0] && x < K[k + 1][0]) s = K[k][1] + (K[k + 1][1] - K[k][1]) * (x - K[k][0]) / (K[k + 1][0] - K[k][0]); this.snowCm = s; }
    // THE RUN is on while the lakes' surface at the brook's mouths is in the suckers' own ripeness window — the water fish3 _ripe reads over
    // their ground, spawnT less SPAWN_LEAD to spawnT + SPAWN.EDGE — in spring (the bears learn the run's time; the riffles then hold it)
    let t = 0; for (const c of this.mouthCols) t += e.temp[this.G.cell0[c]]; this.runT = this.mouthCols.length ? t / this.mouthCols.length : 0;
    const sT = SP3.sucker.spawnT; this.runOn = inYf(yf, FOREST3.bear.FISH.SPRING) && this.runT >= sT[0] - F3.SPAWN_LEAD && this.runT <= sT[1] + SPAWN.EDGE;
  }

  // ---------- the clock: the year's fraction, the hour, the light's phase ----------
  _yf(T) { return wrap1(T / YEAR); }
  _tod(T) { return wrap1(this.env.t + (T - this.env.time) / DAY); }   // (env3's time of day — 0.5 noon — carried to T)
  _dayFrac(yf) { const s = 0.5 + 0.5 * Math.cos(2 * Math.PI * (yf - SEASON.SOLSTICE)); return SEASON.DAY_FRAC[0] + (SEASON.DAY_FRAC[1] - SEASON.DAY_FRAC[0]) * s; }   // (env3 seasonalSun's)
  // the phase at T — 0 dawn, 1 day, 2 dusk, 3 night — and the seconds to the next boundary (with extra clock hours: the moose's bouts)
  _phase(T, extra) {
    const yf = this._yf(T), tod = this._tod(T), df = this._dayFrac(yf), r = 0.5 - df / 2, s = 0.5 + df / 2, tw = FOREST3.TW / 24;
    const hr = wrap1(tod - r + 0.5) - 0.5, hs = wrap1(tod - s + 0.5) - 0.5;
    const ph = Math.abs(hr) <= tw ? 0 : Math.abs(hs) <= tw ? 2 : hr > 0 && hs < 0 ? 1 : 3;
    let nb = 1; for (const b of [r - tw, r + tw, s - tw, s + tw, ...(extra || [])]) { const d = wrap1(b - tod); if (d > 1e-6 && d < nb) nb = d; }
    return { yf, tod, ph, toB: nb * DAY };
  }

  // ---------- an animal ----------
  _make(id, kind, T) {
    const K = FOREST3[kind], sex = this._r() < K.MALE ? 'm' : 'f', S = this.S;
    const a = { id, kind, x: 0, y: 0, heading: this._u(0, 2 * Math.PI), act: 'bed', young: 0, len: K.LEN[sex === 'm' ? 1 : 0] * this._u(0.92, 1.08), ylen: 0, sex, tx: 0, ty: 0, spd: 0, t1: T,
      x0: 0, y0: 0, t0: T, next: null, edge: -1, eat: 0, yBorn: 0, litYr: -9, breed: sex === 'f' && this._r() < (K.BREED ?? 0), yT: T };
    // the home range: a centre on the land by the kind's habitat, its radius from its area (× SCALE)
    const hr = kind === 'bear' ? K.HR[sex === 'm' ? 1 : 0] : kind === 'moose' ? K.HR[0] : K.HR;
    a.hr = Math.sqrt(hr * 1e6 / Math.PI) * S;
    // (a moose's summer range holds water: they summer by the ponds and the weedy bays — the land beyond a range's width from water × NEAR)
    const hw = this.W[kind].home, h = kind === 'moose' ? this._landPtNear(a.hr, hw, K.NEAR) : this._landPt(0.5 * (GEO.X0 + GEO.XMAX), 0.5 * (GEO.Y0 + GEO.YMAX), 1e9, hw, 400); a.hx = h[0]; a.hy = h[1];
    // the shore within its range (the edge points' indices) — where it drinks and crops
    const sh = []; for (let k = 0; k < this.shX.length; k++) if (Math.hypot(this.shX[k] - a.hx, this.shY[k] - a.hy) <= a.hr) sh.push(k); this._sh.set(a, Int32Array.from(sh));   // (off the animal's object: what the view clones stays small)
    if (kind === 'bear') {
      let d = 1e9; for (let k = 0; k < this.rfX.length; k++) d = Math.min(d, Math.hypot(this.rfX[k] - a.hx, this.rfY[k] - a.hy)); a.brook = d <= a.hr;   // (the run within its range)
      // its den: in the forest, DEN_WATER m real from water, within its range
      const bw = this.W.bear.bed, dw = K.DEN_WATER * S; let best = null;
      for (let k = 0; k < 60 && !best; k++) { const p = this._landPt(a.hx, a.hy, a.hr, bw, 20); const i = cellIndex(p[0], p[1]); if (i >= 0 && GEO.toWater[i] >= dw && GEO.cover[i] >= 1 && GEO.cover[i] <= 4) best = p; }
      [a.dx, a.dy] = best || this._landPt(a.hx, a.hy, a.hr, bw, 40);
      a.inYf = this._u(...K.DEN_IN[sex === 'm' ? 1 : 0]); a.brk = this._u(...K.BREAK_YF); a.fishT = -1e12;
      if (a.breed) a.litYr = Math.floor(T / YEAR) - (this._r() < 0.5 ? 0 : 1);   // (half of the breeders with this spring's cubs, half with yearlings: a litter every other year)
      this._denOut(a, T);
    } else if (kind === 'deer') {
      // its yard: the softwood block that is best by its share against the walk to it (~a home range's width per halving [inf])
      let best = null, bv = -1; for (const y of this.yards) { const v = y.s * Math.pow(0.5, Math.hypot(y.x - a.hx, y.y - a.hy) / (2 * a.hr)); if (v > bv) { bv = v; best = y; } }
      const p = best ? this._landPt(best.x, best.y, FOREST3.deer.YARD_BLOCK * S / 2, coverW({ evergreen: 1, woody_wet: 1 }), 30) : [a.hx, a.hy];
      a.yx = p[0]; a.yy = p[1]; a.yr = Math.sqrt(K.YARD_HR * 1e6 / Math.PI) * S; a.yarded = false; a.drankT = T - this._u(0, DAY); a.shoreT = -1e12;
      a.byYf = this._u(...K.FAWN_YF);
    } else { a.byYf = this._u(...K.CALF_YF); a.aqDay = -1; a.bouts = 0; a.aqToday = false; }
    this._place(a, T);
    return a;
  }
  // a bear's next emergence (yf, by what she will bring out) — drawn as it dens
  _denOut(a, T) {
    const K = FOREST3.bear, spring = Math.floor(T / YEAR) + (this._yf(T) >= 0.5 ? 1 : 0), cubs = a.sex === 'f' && a.breed && (spring - a.litYr >= 2 || spring === a.litYr);   // (a litter due, or this spring's already counted: a lake opened in April)
    a.outYf = this._u(...K.DEN_OUT[a.sex === 'm' ? 1 : cubs ? 2 : 0]); a.denned = false;
  }
  // set an animal down at T in the season's place (a new lake, or a date jump): the young it has now, then its first leg
  _place(a, T) {
    const yf = this._yf(T), K = FOREST3[a.kind];
    if (a.kind === 'bear') { a.denned = false; a.fishT = -1e12; } else if (a.kind === 'deer') a.yarded = false;
    this._young(a, T, true);
    if (a.kind === 'bear' && inYf(yf, [a.inYf, a.outYf])) { a.x = a.dx; a.y = a.dy; }
    else if (a.kind === 'deer' && this.snowCm >= K.YARD_IN) { a.yarded = true; [a.x, a.y] = this._landPt(a.yx, a.yy, a.yr, this.W.deer.bed, 20); }
    else [a.x, a.y] = this._landPt(a.hx, a.hy, a.hr, this.W[a.kind].bed, 20);
    a.next = null; a.edge = -1; a.eat = 0; a.t0 = T; a.t1 = T; this._plan(a, T);
  }
  jump() { const T = this.env.time; this._env(); for (const a of this.animals) this._place(a, T); this._t = T; }   // (env3 primeSeason: the date moved)

  // ---------- the young: born in their season, carried, lost ----------
  // (a breeding female's young: yr the year-index of T — yf 0 is 1 March — and litYr the year her young were born into: a bear's the spring
  // her cubs first come out, a doe's or cow's the summer of the birth)
  _young(a, T, init = false) {
    const K = FOREST3[a.kind], yf = this._yf(T), yr = Math.floor(T / YEAR);
    if (a.sex !== 'f' || !a.breed) { a.young = 0; a.ylen = 0; a.yT = T; return; }
    if (a.kind === 'bear') {
      // THE CUBS: born in the den in January (BIRTH_YF of the year-index before their spring), out with her in April, wintering with her, out
      // again as yearlings and leaving her in June (brk) — she bears every other winter (the litter's spring 2 after the last)
      if (init) {
        const k = yr - a.litYr; a.young = 0;
        if (k === 0 || (k === 1 && !(yf >= a.brk && yf < 0.5))) { a.young = this._litter(K.LITTER); a.yBorn = (a.litYr - 1 + K.BIRTH_YF) * YEAR; }
        if (yf >= K.BIRTH_YF && k >= 1) { a.litYr = yr + 1; a.young = this._litter(K.LITTER); a.yBorn = (yr + K.BIRTH_YF) * YEAR; }   // (born in the den this winter)
        a.yT = T;
      }
      if (a.young > 0 && yr - a.litYr >= 1 && yf >= a.brk && yf < 0.5) a.young = 0;   // (the family breaks up; she breeds again)
    } else {
      // FAWNS AND CALVES at her date (byYf) each year; last year's leave her as she gives birth
      const tb = (yr + a.byYf) * YEAR, n = () => 1 + (this._r() < K.TWIN ? 1 : 0);
      if (init) { const ly = T >= tb ? yr : yr - 1; a.litYr = ly; a.yBorn = (ly + a.byYf) * YEAR; a.young = n(); a.yT = a.yBorn; }
      else if (T >= tb && a.litYr !== yr) { a.litYr = yr; a.yBorn = tb; a.young = n(); a.yT = tb; }
    }
    // the young's losses: their field survival as a flat hazard over its span (cubs CUB_S a year; fawns FAWN_S to November, then the winter's;
    // calves CALF_S a year)
    const dd = Math.max(0, T - a.yT) / DAY; a.yT = T;
    if (a.young > 0 && dd > 0) {
      const age = (T - a.yBorn) / DAY;
      const s = a.kind === 'bear' ? Math.pow(K.CUB_S, dd / 365) : a.kind === 'deer' ? Math.pow(age < 165 ? K.FAWN_S[0] : K.FAWN_S[1], dd / (age < 165 ? 165 : 200)) : Math.pow(K.CALF_S, dd / 365);
      let m = 0; for (let k = 0; k < a.young; k++) if (this._r() < s) m++;
      if (m === 0 && a.kind === 'bear' && yr - a.litYr === 0 && yf < 0.45) a.litYr = yr - 1;   // (a mother who lost her cubs by July breeds this summer)
      a.young = m;
    }
    const [l0, dl, lMax] = K.YLEN; a.ylen = a.young > 0 ? Math.min(lMax, l0 + dl * Math.max(0, (T - a.yBorn) / DAY / 30.4)) : 0;
  }
  _litter(sh) { const u = this._r(); let c = 0; for (let k = 0; k < sh.length; k++) { c += sh[k]; if (u < c) return k + 1; } return sh.length; }

  // ---------- places on the land ----------
  // a land point within r of (cx, cy) chosen by the cover weights w (the best of `tries` draws by weight × a random factor); the centre if none
  _landPt(cx, cy, r, w, tries = 12) {
    let bx = cx, by = cy, bv = -1;
    for (let k = 0; k < tries; k++) {
      const ang = this._u(0, 2 * Math.PI), d = r < 1e8 ? r * Math.sqrt(this._r()) : 0;
      const x = r < 1e8 ? cx + Math.cos(ang) * d : this._u(GEO.X0, GEO.XMAX), y = r < 1e8 ? cy + Math.sin(ang) * d : this._u(GEO.Y0, GEO.YMAX);
      const i = cellIndex(x, y); if (i < 0 || GEO.body[i] !== LAND) continue;
      const v = w[GEO.cover[i]] * this._r(); if (v > bv) { bv = v; bx = x; by = y; }
    }
    if (bv < 0) { const i = cellIndex(cx, cy); if (i < 0 || GEO.body[i] !== LAND) { const k = this._nearShore(cx, cy); if (k >= 0) return [this.shX[k], this.shY[k]]; } }
    return [bx, by];
  }
  // a home on the land by the weights w, × far beyond r from water (the whole grid's land: the best of 400 draws)
  _landPtNear(r, w, far) {
    let bx = 0, by = 0, bv = -1;
    for (let k = 0; k < 400; k++) { const x = this._u(GEO.X0, GEO.XMAX), y = this._u(GEO.Y0, GEO.YMAX), i = cellIndex(x, y); if (i < 0 || GEO.body[i] !== LAND) continue;
      const v = w[GEO.cover[i]] * (GEO.toWater[i] <= r ? 1 : far) * this._r(); if (v > bv) { bv = v; bx = x; by = y; } }
    return [bx, by];
  }
  _shPick(a) { const s = this._sh.get(a); return s[Math.floor(this._r() * s.length)]; }   // (a shore point of its range, at random)
  _nearShore(x, y) { let b = -1, d = 1e18; for (let k = 0; k < this.shX.length; k++) { const q = (this.shX[k] - x) ** 2 + (this.shY[k] - y) ** 2; if (q < d) { d = q; b = k; } } return b; }
  // can it walk the straight line: no water deeper than maxD on it (checked every PATH_STEP), inside the grid
  _pathOK(x0, y0, x1, y1, maxD) {
    const L = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.ceil(L / this.step0));
    for (let k = 1; k <= n; k++) { const f = k / n, i = cellIndex(x0 + (x1 - x0) * f, y0 + (y1 - y0) * f); if (i < 0) return false; if (GEO.body[i] !== LAND && GEO.depth[i] > maxD) return false; }
    return true;
  }

  // ---------- legs ----------
  _leg(a, T, act, tx, ty, dur) {
    dur = Math.max(30, dur); const dx = tx - a.x, dy = ty - a.y, d = Math.hypot(dx, dy);
    a.x0 = a.x; a.y0 = a.y; a.t0 = T; a.tx = tx; a.ty = ty; a.t1 = T + dur; a.act = act; a.spd = d / dur; if (d > 0.05) a.heading = Math.atan2(dy, dx);
  }
  // walk to (tx, ty) at its pace, then the leg `then` ({ act, dur, tx, ty, edge, eat }); a straight line it cannot walk: a nearer point on it, or stay
  _walk(a, T, tx, ty, then, maxD) {
    const K = FOREST3[a.kind]; maxD = maxD ?? K.MAX_D;
    let ok = this._pathOK(a.x, a.y, tx, ty, maxD);
    for (let f = 0.5; !ok && f > 0.1; f *= 0.5) { const x = a.x + (tx - a.x) * f, y = a.y + (ty - a.y) * f; if (this._pathOK(a.x, a.y, x, y, maxD) && GEO.bodyAt(x, y) === LAND) { tx = x; ty = y; ok = true; then = null; } }
    if (!ok) { tx = a.x; ty = a.y; then = null; }
    const d = Math.hypot(tx - a.x, ty - a.y);
    if (d < 0.5) { if (then) this._start(a, T, then); else this._leg(a, T, 'bed', a.x, a.y, this._u(600, 1800)); return; }
    this._leg(a, T, 'walk', tx, ty, d / K.WALK); a.next = then;
  }
  _start(a, T, L) { a.edge = L.edge ?? -1; a.eat = L.eat ?? 0; this._leg(a, T, L.act, L.tx ?? a.x, L.ty ?? a.y, L.dur); }
  // a spell in place or drifting slowly: to a point within `r` of where it is (by the weights), at most its foraging pace
  _spell(a, T, act, dur, w, r) {
    const K = FOREST3[a.kind]; let [x, y] = r > 0 ? this._landPt(a.x, a.y, r, w, 6) : [a.x, a.y];
    const d = Math.hypot(x - a.x, y - a.y), dMax = K.FORAGE * dur; if (d > dMax) { x = a.x + (x - a.x) * dMax / d; y = a.y + (y - a.y) * dMax / d; }
    if (!this._pathOK(a.x, a.y, x, y, K.MAX_D)) { x = a.x; y = a.y; }
    a.edge = -1; a.eat = 0; this._leg(a, T, act, x, y, dur);
  }
  // the leg that ended at T is done: its effects (the deer's crop), then what comes next
  _done(a, T) {
    const dur = T - a.t0;
    if (a.act === 'fish') this.stats.fishS += dur;
    else if (a.act === 'wade') this.stats.wadeS += dur;
    else if (a.act === 'graze' && a.eat && a.edge >= 0) { this.stats.deerShoreS += dur; this._crop(a, dur); }
    else if (a.act === 'drink') { this.stats.drinks++; a.drankT = T; }
    a.x = a.tx; a.y = a.ty; a.edge = -1; a.eat = 0;
    if (a.next) { const L = a.next; a.next = null; this._start(a, T, L); return; }
    this._plan(a, T);
  }

  // ---------- each step: the legs that ended within it, then where each is now ----------
  step(dt) {
    const T = this.env.time; this._env();
    if (T - this._t > FOREST3.JUMP) { for (const a of this.animals) this._place(a, T); this._t = T; return; }
    for (const a of this.animals) {
      let guard = 0; while (a.t1 <= T && guard++ < 400) this._done(a, a.t1);
      const f = a.t1 > a.t0 ? Math.min(1, Math.max(0, (T - a.t0) / (a.t1 - a.t0))) : 1;
      a.x = a.x0 + (a.tx - a.x0) * f; a.y = a.y0 + (a.ty - a.y0) * f;
    }
    this._t = T;
  }

  // ---------- what each does next ----------
  _plan(a, T) {
    this._young(a, T);
    // out of the water first (a moose after its bout, a bear off the riffle): to the nearest edge of its shore
    if (GEO.bodyAt(a.x, a.y) !== LAND && GEO.depthAt(a.x, a.y) > 0.15) {
      let b = -1, d = 1e18; for (const k of this._sh.get(a)) { const q = (this.shX[k] - a.x) ** 2 + (this.shY[k] - a.y) ** 2; if (q < d) { d = q; b = k; } }
      if (b < 0) b = this._nearShore(a.x, a.y);
      if (b >= 0) { this._walk(a, T, this.shL[2 * b], this.shL[2 * b + 1], null, 99); return; }
    }
    if (a.kind === 'bear') this._bear(a, T); else if (a.kind === 'deer') this._deer(a, T); else this._moose(a, T);
  }
  _bear(a, T) {
    const K = FOREST3.bear, P = this._phase(T), yf = P.yf;
    // THE DEN: from its day in the fall to its day in spring; she brings out what she bore in January
    if (a.denned) {   // (out of the den: a litter due was born in it in January — she brings it out)
      a.denned = false; const Y = Math.floor(T / YEAR);
      if (a.sex === 'f' && a.breed && Y - a.litYr >= 2) { a.litYr = Y; a.young = this._litter(K.LITTER); a.yBorn = (Y - 1 + K.BIRTH_YF) * YEAR; a.yT = T; this._young(a, T); }
      a.inYf = this._u(...K.DEN_IN[a.sex === 'm' ? 1 : 0]); a.brk = this._u(...K.BREAK_YF);
    } else if (inYf(yf, [a.inYf, a.outYf])) {
      this._denOut(a, T); const out = Math.floor(T / YEAR) * YEAR + a.outYf * YEAR, t1 = out > T ? out : out + YEAR, d = Math.hypot(a.x - a.dx, a.y - a.dy);
      if (d > 1) this._walk(a, T, a.dx, a.dy, { act: 'den', dur: t1 - T - d / K.WALK }, 99); else this._leg(a, T, 'den', a.x, a.y, t1 - T);
      a.denned = true; return;
    }
    if (Math.hypot(a.x - a.hx, a.y - a.hy) > 1.2 * a.hr) { const p = this._landPt(a.hx, a.hy, a.hr * 0.6, this.W.bear.home, 8); this._walk(a, T, p[0], p[1], null, 99); return; }
    const fall = yf >= K.FALL_YF && yf < 0.75, pAct = K.ACT[fall ? 1 : 0][P.ph], cw = this.W.bear.cover[yf < K.SUMMER_YF || yf > 0.9 ? 0 : yf < K.FALL_YF ? 1 : 2];
    // THE SUCKER RUN: at dusk, in the dark and at dawn, to a riffle of the brook, fishing a bout along it
    // (one bout a spell — dusk, the night, dawn — GAP h apart: ~2.4 bouts, ~2.6 h a day)
    if (this.runOn && a.brook && P.ph !== 1 && T - a.fishT > K.FISH.GAP * 3600 && this._r() < K.FISH.P[P.ph === 3 ? 1 : 0]) {
      const k = Math.floor(this._r() * this.rfX.length), x = this.rfX[k] + this._u(-0.4, 0.4) * GEO.CELL, y = this.rfY[k] + this._u(-0.4, 0.4) * GEO.CELL;
      const k2 = Math.floor(this._r() * this.rfX.length), dur = this._u(...K.FISH.BOUT) * 60, r2 = Math.hypot(this.rfX[k2] - x, this.rfY[k2] - y) <= 15 * this.S + GEO.CELL ? k2 : k;
      a.fishT = T; this._walk(a, T, x, y, { act: 'fish', dur, tx: this.rfX[r2], ty: this.rfY[r2] }, K.MAX_D); return;
    }
    if (this._r() < pAct) {
      if (this._sh.get(a).length && this._r() < K.DRINK) { const k = this._shPick(a); this._walk(a, T, this.shX[k], this.shY[k], { act: 'drink', dur: this._u(120, 300) }); return; }
      const dur = Math.min(this._u(30, 90) * 60, Math.max(600, P.toB));
      if (this._r() < 0.4) { const p = this._landPt(a.hx, a.hy, a.hr, cw, 10); this._walk(a, T, p[0], p[1], { act: 'graze', dur }); return; }   // (to a new patch)
      this._spell(a, T, 'graze', dur, cw, 200 * this.S + 10); return;
    }
    this._spell(a, T, 'bed', Math.min(this._u(60, 180) * 60, Math.max(900, P.toB)), this.W.bear.bed, 30 * this.S);
  }
  _deer(a, T) {
    const K = FOREST3.deer, P = this._phase(T), yf = P.yf;
    if (!a.yarded && this.snowCm >= K.YARD_IN) a.yarded = true; else if (a.yarded && this.snowCm < K.YARD_OUT) a.yarded = false;
    const [cx, cy, r] = a.yarded ? [a.yx, a.yy, a.yr] : [a.hx, a.hy, a.hr];
    if (Math.hypot(a.x - cx, a.y - cy) > 1.2 * r) { const p = this._landPt(cx, cy, r * 0.6, this.W.deer.bed, 8); this._walk(a, T, p[0], p[1], null, 99); return; }   // (to the yard or home: across the ice or swimming if the lake is between)
    const pAct = (a.yarded ? K.ACT_YARD : K.ACT)[P.ph];
    if (this._r() < pAct) {
      // AT THE WATER at dawn and dusk: in late spring and early summer to crop the edge, else to drink — or when it has not drunk all day
      if (!a.yarded && this._sh.get(a).length && (P.ph === 0 || P.ph === 2) && T - a.shoreT > 6 * 3600) {   // (once a twilight at most)
        const aq = inYf(yf, K.AQ_YF), warm = yf > 0.12 && yf < 0.7, thirsty = warm && T - a.drankT > K.DRINK_H * 3600;
        if (this._r() < K.P_SHORE[aq ? 1 : 0] || thirsty) {
          a.shoreT = T;
          const k = this._shPick(a), crop = aq && this._r() < 0.6 && this.shBody[k] !== BROOK;
          this.stats.edgeVisits++;
          this._walk(a, T, this.shX[k], this.shY[k], crop ? { act: 'graze', dur: this._u(...K.GRAZE_MIN) * 60, edge: k, eat: 1 } : { act: 'drink', dur: this._u(...K.DRINK_MIN) * 60 }); return;
        }
      }
      const dur = Math.min(this._u(20, 60) * 60, Math.max(600, P.toB)), act = a.yarded || yf > 0.65 || yf < 0.15 ? 'browse' : this._r() < 0.6 ? 'graze' : 'browse';
      if (this._r() < 0.3) { const p = this._landPt(cx, cy, r, this.W.deer.cover[0], 8); this._walk(a, T, p[0], p[1], { act, dur }); return; }
      this._spell(a, T, act, dur, this.W.deer.cover[0], 60 * this.S + 5); return;
    }
    this._spell(a, T, 'bed', Math.min(this._u(60, 200) * 60, Math.max(900, P.toB)), this.W.deer.bed, 20 * this.S);
  }
  _moose(a, T) {
    const K = FOREST3.moose, yf = this._yf(T), summer = inYf(yf, PL3.MOOSE_YF), winter = inYf(yf, K.WINTER_YF);
    const P = this._phase(T, summer ? [K.AQ_H[0][0] / 24, K.AQ_H[1][0] / 24] : null), hr = winter ? Math.sqrt(K.HR[1] / K.HR[0]) * a.hr : a.hr;
    if (Math.hypot(a.x - a.hx, a.y - a.hy) > 1.2 * hr) { const p = this._landPt(a.hx, a.hy, hr * 0.6, this.W.moose.home, 8); this._walk(a, T, p[0], p[1], null, 99); return; }
    // IN THE SHALLOWS: a bout in the late afternoon and one at night on most summer days, where the take's weights put it
    if (summer) {
      const day = Math.round((T - wrap1(P.tod - 0.5) * DAY) / DAY);   // (the day by its last noon: an afternoon's bout and the night's after it the same day)
      if (a.aqDay !== day) { a.aqDay = day; a.aqToday = this._r() < K.AQ_P; a.bouts = 0; }
      const h = P.tod * 24, h2 = h < 12 ? h + 24 : h;
      for (let b = 0; b < 2; b++) {
        const [h0, h1] = K.AQ_H[b]; if (!a.aqToday || (a.bouts & (1 << b)) || !(h2 + 1e-3 >= h0 && h2 < h1)) continue;
        a.bouts |= 1 << b; const s = this._spot(a, hr); if (!s) break;   // (h2 + 1e-3: a plan at the bout's own boundary)
        const dur = this._u(...K.AQ_MIN) * 60; this._walk(a, T, s[0], s[1], { act: 'wade', dur, tx: s[2], ty: s[3] }, 99); return;   // (wading and swimming to it)
      }
    }
    const pAct = K.ACT[winter ? 1 : 0][P.ph], cw = this.W.moose.cover[winter ? 1 : 0];
    if (this._r() < pAct) {
      if (!summer && this._sh.get(a).length && this._r() < 0.05) { const k = this._shPick(a); this._walk(a, T, this.shX[k], this.shY[k], { act: 'drink', dur: this._u(120, 400) }); return; }
      const dur = Math.min(this._u(30, 90) * 60, Math.max(600, P.toB));
      if (this._r() < 0.3) { const p = this._landPt(a.hx, a.hy, hr, cw, 8); this._walk(a, T, p[0], p[1], { act: 'browse', dur }); return; }
      this._spell(a, T, 'browse', dur, cw, 80 * this.S + 5); return;
    }
    this._spell(a, T, 'bed', Math.min(this._u(60, 180) * 60, Math.max(900, P.toB)), this.W.moose.bed, 20 * this.S);
  }
  // a moose's feeding spot: a bed cell drawn by PL3.MOOSE's own weights (the shoots × MOOSE_PREF × the MOOSE_Z reach × the bed's area) among
  // those within its range (the nearest weedy water if none), then a point in its column at that cell's depth: [x, y, x2, y2] — the spot and
  // where it drifts to over the bout; null if no water within reach
  _spot(a, r) {
    const P = this.env.plants, G = this.G, [z0, z1] = PL3.MOOSE_Z;
    let pick = -1;
    if (P) {
      const pr = this.mPref; let tot = 0; const w = this._sw || (this._sw = new Float64Array(P.cells.length));
      for (let pass = 0; pass < 2 && pick < 0; pass++) {
        const R = pass ? 1e9 : r + 0.5 * G.COL; tot = 0;
        for (let i = 0; i < P.cells.length; i++) {
          const z = P.zb[i], v = z <= z0 ? 1 : z >= z1 ? 0 : (z1 - z) / (z1 - z0), c = P.col[i]; w[i] = 0; if (!(v > 0)) continue;
          if (Math.hypot(G.cx[c] - a.hx, G.cy[c] - a.hy) > R) continue;
          let s = 0; for (let f = 0; f < NF3; f++) if (pr[f] > 0) s += P.Bs[f][i] * pr[f]; w[i] = s * v * G.bedA[P.cells[i]]; tot += w[i];
        }
        if (tot > 0) { let u = this._r() * tot; for (let i = 0; i < P.cells.length; i++) { u -= w[i]; if (u <= 0 && w[i] > 0) { pick = i; break; } } if (pick < 0) for (let i = P.cells.length - 1; i >= 0; i--) if (w[i] > 0) { pick = i; break; } }
      }
    }
    // a point within h of (cx, cy) at the cell's depth (± a layer's half), within the moose's reach; and where it drifts over the bout — a
    // few metres (DRIFT m real) along the same water
    const pt = (cx, cy, h, zb) => { let bx = NaN, by = NaN, bd = 1e9;
      for (let k = 0; k < 16; k++) { const x = cx + this._u(-h, h), y = cy + this._u(-h, h), b = GEO.bodyAt(x, y); if (b === LAND) continue; const d = GEO.depthAt(x, y); if (!(d > 0.2 && d <= z1)) continue; const e = Math.abs(d - zb); if (e < bd) { bd = e; bx = x; by = y; } if (e < 0.25) break; }
      return Number.isNaN(bx) ? null : [bx, by]; };
    const two = (c, zb) => { const p = pt(G.cx[c], G.cy[c], 0.5 * G.COL, zb); if (!p) return null; const q = pt(p[0], p[1], FOREST3.moose.DRIFT * this.S + 0.5, zb) || p; return [p[0], p[1], q[0], q[1]]; };
    if (pick >= 0) { const s = two(P.col[pick], P.zb[pick]); if (s) return s; }
    // no plants (or none placeable): the shallow water nearest its home
    for (let k = 0; k < 40; k++) { const s = this._sh.get(a).length ? this._shPick(a) : this._nearShore(a.hx, a.hy); if (s < 0) break; const c = this.shCol[s]; if (c < 0 || this.shBody[s] === BROOK) continue; const q = two(c, 1.0); if (q) return q; }
    return null;
  }
  // a deer's crop at the water's edge over dur s: GRAZE g dry a minute (× fa: the world's share), from the shoots of the edge column's bed cells
  // within its reach (water ≤ Z m) by its preference — each cell giving in proportion to what it holds, at most TAKE_MAX of it; the shoots' N and
  // P go ashore with its dung (the ledger's outP / outN, as PL3.MOOSE's; what each float32 store actually lost — the budgets exact)
  _crop(a, dur) {
    const P = this.env.plants, ch = this.env.chem, K = FOREST3.deer; if (!P || !ch || !this.colBed) return;
    const c = this.shCol[a.edge]; if (c < 0) return;
    const want = K.GRAZE * dur / 60 * this.fa, cells = this.colBed[c], pr = this.dPref, G = this.G; this.stats.deerWant += want;
    let have = 0; for (const i of cells) { if (P.zb[i] > K.Z) continue; const A = G.bedA[P.cells[i]]; for (let f = 0; f < NF3; f++) if (pr[f] > 0) have += P.Bs[f][i] * pr[f] * A; }
    if (!(have > 0)) return; const phi = Math.min(K.TAKE_MAX, want / have);
    let got = 0, dP = 0, dN = 0;
    for (const i of cells) { if (P.zb[i] > K.Z) continue; const A = G.bedA[P.cells[i]];
      for (let f = 0; f < NF3; f++) { if (!(pr[f] > 0)) continue; const B = P.Bs[f], b0 = B[i], t = b0 * phi * pr[f]; if (!(t > 0)) continue; B[i] = b0 - t; const tt = b0 - B[i]; got += tt * A; dP += tt * A * FORMS3[f].P * PL3.P_UNIT; dN += tt * A * FORMS3[f].N * PL3.N_UNIT; } }
    ch.ledger.outP += dP; ch.ledger.outN += dN; this.stats.deerAte += got;
  }
}
