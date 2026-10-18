// data3.js — the 3-D lakes' DATA PAGE and CLICK-A-FISH (browser layer; docs/TRUE_SCALE.md T8). The human (2026-10-16): "we need
// the data and stats and everything page too along with this new full size environment".
// - The Data panel: while it is open the sim's worker sends the lakes' numbers every 2 s (render3/sim3worker.js sendStats):
//   the fish by species against the census (docs/FISH_CENSUS.md), by lake and size; the year's young and their fates; deaths
//   by cause and who eats whom; the spawnings and the brook's traffic; the water per lake; the weeds; and graphs over time.
// - Click a fish (or a school of young) in the view: its card — body, state, what it is doing, the water about it, its genes
//   and its brain's outputs — follows it each snapshot, and the camera can follow it too.
// Everything is built with the DOM API (no inline styles or scripts: the page's CSP); text is set as textContent.
import * as THREE from '../../../vendor/three-0.186.1/three.webgpu.min.js';
import { GEO, UPPER, LOWER } from '../geometry.js';
import { OUT3 } from '../fish3.js';
import { GENE_KEYS } from '../../core.js';

const FISH_STRIDE = 18, YOY_STRIDE = 12, PICK_PX = 22, HIST_MAX = 1500;
const fmt = (v, d = 0) => v === null || v === undefined || !Number.isFinite(v) ? '—' : v >= 1e6 ? (v / 1e6).toFixed(2) + ' M' : v >= 1e4 ? Math.round(v).toLocaleString() : v.toFixed(d);
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };
const MONTHS = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
const dateOf = yf => { const d = yf * 365, ML = [31, 30, 31, 30, 31, 31, 30, 31, 30, 31, 31, 28]; let r = d; for (let m = 0; m < 12; m++) { if (r < ML[m]) return `${MONTHS[m]} ${1 + Math.floor(r)}`; r -= ML[m]; } return 'Feb 28'; };
const surfY = (x, y) => GEO.levelAt(x, y) - GEO.SURF.upper;

export function makeData3({ LIVE, camera, canvas, rig }) {
  // ---------- the button, the panel, the card ----------
  const btn = el('button', 'card', 'Data'); btn.id = 'databtn'; btn.title = 'The lakes in numbers: the fish, the young, the water, the weeds, the brook — and graphs';
  const panel = el('section', 'card'); panel.id = 'data'; panel.hidden = true; panel.setAttribute('aria-label', 'The lakes in numbers');
  const head = el('header'); const h2 = el('h2', null, 'The lakes in numbers'); const close = el('button', 'x', '×'); close.title = 'Close';
  head.append(h2, close); const when = el('div', 'when', 'waiting for the lakes…');
  const tabs = el('div', 'row tabs'), body = el('div', 'dbody');
  const TABS = ['Fish', 'Young', 'Water & weeds', 'Brook', 'Graphs']; let tab = 'Fish';
  for (const t of TABS) { const b = el('button', null, t); b.dataset.tab = t; b.setAttribute('aria-pressed', String(t === tab)); b.addEventListener('click', () => { tab = t; for (const x of tabs.children) x.setAttribute('aria-pressed', String(x.dataset.tab === t)); render(); }); tabs.append(b); }
  panel.append(head, when, tabs, body);
  const card = el('section', 'card'); card.id = 'fishcard'; card.hidden = true; card.setAttribute('aria-label', 'The fish you picked');
  document.body.append(btn, panel, card);
  const open = on => { panel.hidden = !on; btn.setAttribute('aria-pressed', String(on)); LIVE.worker?.postMessage({ type: 'stats', on }); };
  btn.addEventListener('click', () => open(panel.hidden)); close.addEventListener('click', () => open(false));

  // ---------- the numbers and their history ----------
  let last = null; const hist = [];
  function onStats(m) {
    last = m;
    const tot = Object.values(m.sp).reduce((s, r) => s + r.n, 0), kg = Object.values(m.sp).reduce((s, r) => s + r.kgHa, 0);
    if (!hist.length || m.time - hist[hist.length - 1].t > 30) {   // (a point every simulated half minute at least)
      hist.push({ t: m.time, yf: m.yf, n: Object.fromEntries(Object.entries(m.sp).map(([k, r]) => [k, r.n])), yoy: Object.fromEntries(Object.entries(m.sp).map(([k, r]) => [k, r.yoyN])), tot, kg,
        w: [m.water[UPPER], m.water[LOWER]].map(w => [w.tS, w.tB, w.oS, w.oB]) });
      if (hist.length > HIST_MAX) hist.splice(0, hist.length - HIST_MAX);
    }
    render();
  }
  const table = (cols, rows) => {
    const t = el('table', 'dt'), tr = el('tr'); for (const c of cols) tr.append(el('th', null, c)); t.append(tr);
    for (const r of rows) { const row = el('tr'); r.forEach((v, i) => { const td = el('td'); if (i === 0 && v && v.tag) { const sw = el('i', 'sw'); sw.style.setProperty('--sw', v.tag); td.append(sw, v.name); } else td.textContent = v; row.append(td); }); t.append(row); }
    return t;
  };
  const note = text => el('p', 'hint', text);
  function render() {
    if (panel.hidden || !last) return;
    const m = last, sp = Object.entries(m.sp);
    when.textContent = `${dateOf(m.yf)} · ${fmt(m.agents)} agents, ${fmt(m.yoySchools)} schools of young · the lakes ${fmt(m.lakeHa)} ha · Secchi ${m.secchi.toFixed(1)} m`;
    body.replaceChildren();
    if (tab === 'Fish') {
      const tot = sp.reduce((s, [, r]) => s + r.n, 0), kg = sp.reduce((s, [, r]) => s + r.kgHa, 0);
      body.append(note(`${fmt(tot)} fish (${fmt(tot / m.lakeHa)} a hectare, ${kg.toFixed(0)} kg/ha) in ${fmt(m.agents)} agents. The census column is docs/FISH_CENSUS.md's estimate for these lakes (fish ≥ 7.5 cm a hectare; the dace: the brook's).`));
      body.append(table(['Species', 'Fish', '/ha', 'census /ha', 'kg/ha', 'mean cm', 'mature %', 'Upper', 'Lower'],
        sp.map(([, r]) => [r, fmt(r.n), fmt(r.perHa), fmt(r.target), r.kgHa.toFixed(1), r.L.toFixed(1), fmt(100 * r.mature / Math.max(1, r.n)), fmt(r.up), fmt(r.low)])));
      body.append(el('h3', null, 'By size (fish)'));
      const E = m.sizeCl; body.append(table(['Species', `< ${E[0]} cm`, `${E[0]}–${E[1]}`, `${E[1]}–${E[2]}`, `${E[2]}–${E[3]}`, `≥ ${E[3]}`], sp.map(([, r]) => [r, ...r.size.map(v => fmt(v))])));
      body.append(el('h3', null, 'Deaths since the lake opened (fish)'));
      const causes = ['starve', 'eaten', 'heat', 'hypoxia', 'other', 'old', 'stranded'];
      body.append(table(['Species', ...causes], sp.map(([, r]) => [r, ...causes.map(c => fmt(r.died[c] || 0))])));
      body.append(el('h3', null, 'Who eats whom (kills of followed fish)'));
      body.append(table(['Predator → prey', 'kills'], m.eaten.map(([k, n]) => { const [a, b] = k.split('>'); return [`${m.sp[a]?.name || a} → ${m.sp[b]?.name || b}`, fmt(n)]; })));
    } else if (tab === 'Young') {
      body.append(note('The year’s young live as schools of identical fish until they recruit (their first year or spring). Larvae hatched, and their fates since the lake opened.'));
      body.append(table(['Species', 'young now', 'schools', 'mean cm', 'spawnings', 'hatched', 'eaten', 'starved', 'natural', 'recruited'],
        sp.map(([, r]) => [r, fmt(r.yoyN), fmt(r.yoySchools), r.yoyL.toFixed(1), fmt(r.spawns), fmt(r.fry.hatched), fmt(r.fry.eaten), fmt(r.fry.starve), fmt(r.fry.natural), fmt(r.fry.recruited)])));
    } else if (tab === 'Water & weeds') {
      const W = m.water; body.append(table(['', 'Upper', 'Lower'], [
        ['area (ha)', fmt(W[UPPER].ha, 1), fmt(W[LOWER].ha, 1)],
        ['surface °C', W[UPPER].tS.toFixed(1), W[LOWER].tS.toFixed(1)], ['bottom °C', W[UPPER].tB.toFixed(1), W[LOWER].tB.toFixed(1)],
        ['surface O₂ mg/L', W[UPPER].oS.toFixed(1), W[LOWER].oS.toFixed(1)], ['bottom O₂ mg/L', W[UPPER].oB.toFixed(1), W[LOWER].oB.toFixed(1)],
        ['algae (index)', W[UPPER].algae.toFixed(3), W[LOWER].algae.toFixed(3)], ['zooplankton µg/L', W[UPPER].zoo.toFixed(0), W[LOWER].zoo.toFixed(0)],
        ['ice cover', (100 * W[UPPER].ice).toFixed(0) + ' %', (100 * W[LOWER].ice).toFixed(0) + ' %']]));
      body.append(el('h3', null, 'Weeds (shoots, kg dry a hectare of lake)'));
      body.append(table(['Species', 'kg/ha'], m.weeds.map(w => [w.name, w.kgHa.toFixed(1)])));
      body.append(note(`Freshwater mussels: ${fmt(m.mussels)} (${fmt(m.mussels / m.lakeHa)} a hectare).`));
    } else if (tab === 'Brook') {
      body.append(note('Hot Brook joins the lakes. Fish in it now; and since the lake opened, those that reached the other lake (crossed), moved home there (settled), or went on a trip to it.'));
      body.append(table(['Species', 'in the brook', 'crossed', 'settled', 'trips'], sp.map(([, r]) => [r, fmt(r.brook), fmt(r.cross), fmt(r.settle), fmt(r.trips)])));
    } else if (tab === 'Graphs') {
      body.append(el('h3', null, 'Fish by species (log scale)'));
      body.append(chart(hist.map(h => h.t), sp.map(([k, r]) => ({ col: r.tag, v: hist.map(h => h.n[k]) })), { log: true }));
      body.append(el('h3', null, 'Fish biomass (kg/ha)'));
      body.append(chart(hist.map(h => h.t), [{ col: '#8fe3b5', v: hist.map(h => h.kg) }], {}));
      body.append(el('h3', null, 'Water: Upper surface / bottom °C (solid), Lower (dashed)'));
      body.append(chart(hist.map(h => h.t), [{ col: '#ffb070', v: hist.map(h => h.w[0][0]) }, { col: '#7090ff', v: hist.map(h => h.w[0][1]) }, { col: '#ffb070', v: hist.map(h => h.w[1][0]), dash: true }, { col: '#7090ff', v: hist.map(h => h.w[1][1]), dash: true }], {}));
      body.append(el('h3', null, 'Water: O₂ mg/L, surface (green) and bottom (red); Lower dashed'));
      body.append(chart(hist.map(h => h.t), [{ col: '#8fe3b5', v: hist.map(h => h.w[0][2]) }, { col: '#ff7070', v: hist.map(h => h.w[0][3]) }, { col: '#8fe3b5', v: hist.map(h => h.w[1][2]), dash: true }, { col: '#ff7070', v: hist.map(h => h.w[1][3]), dash: true }], {}));
      if (hist.length < 2) body.append(note('The graphs fill in as the lakes run (a point every simulated half minute or more; fast-forward to see seasons).'));
    }
  }
  // a line chart on a canvas: x the sim's time, series {col, v[], dash}
  function chart(t, series, { log = false }) {
    const cv = el('canvas', 'chart'), W = Math.max(280, (panel.clientWidth || 520) - 30), H = 150, dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
    const g = cv.getContext('2d'); g.scale(dpr, dpr); g.fillStyle = 'rgba(255,255,255,0.03)'; g.fillRect(0, 0, W, H);
    if (t.length < 2) return cv;
    const f = v => log ? Math.log10(Math.max(1, v)) : v;
    let lo = Infinity, hi = -Infinity; for (const s of series) for (const v of s.v) if (Number.isFinite(v)) { lo = Math.min(lo, f(v)); hi = Math.max(hi, f(v)); }
    if (!(hi > lo)) { hi = lo + 1; } const pad = (hi - lo) * 0.08; lo -= pad; hi += pad;
    const t0 = t[0], t1 = t[t.length - 1], X = v => 34 + (v - t0) / Math.max(1e-9, t1 - t0) * (W - 40), Y = v => H - 16 - (f(v) - lo) / (hi - lo) * (H - 24);
    g.strokeStyle = 'rgba(255,255,255,0.12)'; g.fillStyle = '#9fb3ab'; g.font = '10px system-ui'; g.lineWidth = 1;
    for (let q = 0; q <= 3; q++) { const vv = lo + (hi - lo) * q / 3, y = H - 16 - q / 3 * (H - 24); g.beginPath(); g.moveTo(34, y); g.lineTo(W - 6, y); g.stroke(); const span = hi - lo; g.fillText(log ? fmt(10 ** vv) : vv.toFixed(span < 1 ? 2 : span < 10 ? 1 : 0), 2, y + 3); }
    const days = (t1 - t0) / 86400; g.fillText(days >= 2 ? `${days.toFixed(0)} days` : `${((t1 - t0) / 3600).toFixed(1)} h`, W - 60, H - 3);
    for (const s of series) { g.strokeStyle = s.col; g.lineWidth = 1.5; g.setLineDash(s.dash ? [5, 4] : []); g.beginPath(); s.v.forEach((v, i) => { if (!Number.isFinite(v)) return; const x = X(t[i]), y = Y(v); if (i === 0) g.moveTo(x, y); else g.lineTo(x, y); }); g.stroke(); }
    g.setLineDash([]); return cv;
  }

  // ---------- click a fish ----------
  let down = null, selected = null, follow = false;
  canvas.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY, performance.now()]; });
  canvas.addEventListener('pointerup', e => {
    if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5 || performance.now() - down[2] > 400) return;
    const hit = pick(e.clientX, e.clientY); if (hit) select(hit);
  });
  const v3 = new THREE.Vector3();
  function pick(cx, cy) {   // the drawn fish or young school nearest the click on screen (its current place)
    const s = LIVE.snap; if (!s) return null;
    const r = canvas.getBoundingClientRect(); let best = null, bd = PICK_PX;
    const test = (x, y, z, id, kind) => { v3.set(x, surfY(x, y) - z, -y).project(camera); if (v3.z > 1) return; const sx = (v3.x + 1) / 2 * r.width + r.left, sy = (1 - v3.y) / 2 * r.height + r.top, d = Math.hypot(sx - cx, sy - cy); if (d < bd) { bd = d; best = { id, kind }; } };
    for (let i = 0; i < s.nf; i++) { const o = i * FISH_STRIDE; test(s.fish[o + 5], s.fish[o + 6], s.fish[o + 7], s.fish[o + 15], 'fish'); }
    for (let i = 0; i < s.ny; i++) { const o = i * YOY_STRIDE; test(s.yoy[o + 3], s.yoy[o + 4], s.yoy[o + 5], s.yoy[o + 9], 'yoy'); }
    return best;
  }
  function select(hit) { selected = hit; LIVE.worker?.postMessage({ type: 'select', id: hit ? hit.id : -1, kind: hit ? hit.kind : 'fish' }); card.hidden = !hit; if (!hit) follow = false; }
  // the card, from the snapshot's sel
  function onSel(f) {
    if (!f || !selected || f.id !== selected.id) return;
    card.replaceChildren();
    const top = el('header'); const t = el('h2', null, f.kind === 'yoy' ? `${f.name} — a school of young` : f.n > 1 ? `${f.name} — a school` : f.name);
    const x = el('button', 'x', '×'); x.title = 'Let it go'; x.addEventListener('click', () => select(null)); top.append(t, x); card.append(top);
    if (f.gone) { card.append(el('p', 'hint', f.cause === 'gone' ? 'No longer in the lakes (merged into a school, recruited, or died).' : `It died (${f.cause}).`)); follow = false; return; }
    const kv = [];
    if (f.n > 1) kv.push(['fish in it', fmt(f.n)]);
    kv.push(['length', `${f.L.toFixed(1)} cm`], ['weight', f.W >= 1000 ? `${(f.W / 1000).toFixed(2)} kg` : `${f.W.toFixed(f.W < 10 ? 2 : 0)} g`], ['age', f.age < 1 ? `${Math.round(f.age * 365)} days` : `${f.age.toFixed(1)} years`]);
    if (f.kind === 'fish') {
      kv.push(['sex', f.n > 1 ? 'mixed' : f.sex === 2 ? 'female' : f.sex === 1 ? 'male' : '—'], ['mature', f.mature ? (f.ripe ? 'yes — ripe' : 'yes') : 'no'], ['condition (K)', f.K.toFixed(2)],
        ['doing', f.doing], ['depth', `${f.z.toFixed(1)} m (bed ${f.bed.toFixed(1)} m)`], ['water', `${f.T.toFixed(1)} °C · O₂ ${f.o2.toFixed(1)} mg/L`],
        ['home lake', f.lake === UPPER ? 'Upper' : f.lake === LOWER ? 'Lower' : '—'], ['lived', f.near ? 'second by second' : 'in blocks (away from the view)'], ['generation', String(f.gen)]);
    } else kv.push(['depth', `${f.z.toFixed(1)} m (bed ${f.bed.toFixed(1)} m)`], ['water', f.T !== null ? `${f.T.toFixed(1)} °C · O₂ ${f.o2.toFixed(1)} mg/L` : '—'], ['guarded', f.guarded ? 'yes, by a parent on its nest' : 'no']);
    const dl = el('dl', 'kv'); for (const [k, v] of kv) dl.append(el('dt', null, k), el('dd', null, v)); card.append(dl);
    if (f.kind === 'fish') {
      const bars = (title, items) => { card.append(el('h3', null, title)); const box = el('div', 'bars'); for (const [k, v, lo, hi] of items) { const row = el('div', 'brow'), b = el('span', 'bar'), i = el('i'); i.style.setProperty('--w', `${(100 * Math.min(1, Math.max(0, (v - lo) / (hi - lo)))).toFixed(0)}%`); b.append(i); row.append(el('span', 'bl', k), b, el('span', 'bv', v.toFixed(2))); box.append(row); } card.append(box); };
      bars('State', [['hunger', f.hunger, 0, 1], ['fear', f.fear, 0, 1], ['energy', f.energy, 0, 1], ['ration', f.p, 0, 1]]);
      bars('Its brain now (outputs)', OUT3.map((k, q) => [k, f.out[q] ?? 0, q < 2 ? -1 : 0, 1]));   // (turn and pitch −1…1; the rest 0…1)
      if (f.genes.length) bars('Its genes (1 = the species’ mean)', GENE_KEYS.map((k, q) => [k, f.genes[q] ?? 1, 0.7, 1.35]));
    }
    const lab = el('label', 'tog'), cb = el('input'); cb.type = 'checkbox'; cb.checked = follow; cb.addEventListener('change', () => { follow = cb.checked; }); lab.append(cb, ' Follow it with the camera'); card.append(lab);
    lastSel = f;
  }
  let lastSel = null;
  function update() {   // each frame: the camera follows the picked fish
    if (!follow || !lastSel || lastSel.gone) return;
    rig.goal.target.set(lastSel.x, surfY(lastSel.x, lastSel.y) - lastSel.z, -lastSel.y);
  }
  return { onStats, onSel, update, isOpen: () => !panel.hidden };
}
