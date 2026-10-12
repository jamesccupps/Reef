// ui.js — browser-only. HUD, census, charts, minimap, perf HUD, camera controls,
// persistence. Drives the loop's speed/pause flags.
import { SP, SPECIES } from './species.js';

const $ = id => document.getElementById(id);
const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
const dl = (name, text) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' })); a.download = name; a.click(); URL.revokeObjectURL(a.href); };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); return true; } catch { return false; } };
const lsGet = k => { try { return localStorage.getItem(k); } catch { return null; } };
const KEY = 'synapse-reef.champions';

// fish trophic roles, low→high, for the biomass spectrum (these share comparable summed-body-size units;
// producers/inverts live in their own count strip since their units aren't commensurable with fish biomass)
const TROPHIC = [
  { key: 'planktivore', label: 'planktivore', col: '#9fc7e8' },
  { key: 'omnivore', label: 'omnivore', col: '#ff9d4d' },
  { key: 'herbivore', label: 'herbivore', col: '#c9a23f' },
  { key: 'benthivore', label: 'benthivore', col: '#b07b3f' },
  { key: 'predator', label: 'predator', col: '#6fae5a' },
  { key: 'apex', label: 'apex', col: '#4c7a48' },
];
const EVO_GENES = ['gSize', 'gSpeed', 'gTol', 'gFin', 'gEye', 'gBody', 'gBrain'];

export class UI {
  constructor(world, renderer, inspector, camera) {
    this.world = world; this.renderer = renderer; this.inspector = inspector; this.camera = camera;
    this.paused = false; this.speed = 1; this.rate = 0;
    this.tempF = true;          // show temperature in °F (toggle by clicking the readout)
    this.relaxSpeed = 0.5;      // "relaxed" screensaver pace (½× sim time); auto-engaged in fullscreen
    this.chart = $('charts'); this.cctx = this.chart && this.chart.getContext('2d');
    this.depth = $('depthprofile'); this.dctx = this.depth && this.depth.getContext('2d');
    this.mini = $('minimap'); this.mctx = this.mini && this.mini.getContext('2d');
    this.dpr = Math.min((typeof window !== 'undefined' && window.devicePixelRatio) || 1, 2);
    this._buildCensus(); this._buildPondSpecies(); this._buildAddButtons();
    this._buildPyramid(); this._buildEvo(); this._wire();
    this._acc = 0;
  }

  togglePause() {
    this.paused = !this.paused;
    const b = $('btn-pause'); if (b) b.textContent = this.paused ? '▶ Resume' : '❚❚ Pause';
  }

  // set the sim-time multiplier and light up the matching speed button (relaxed / 1× / 2× / 4×)
  setSpeedVal(s) {
    this.speed = s; this.paused = false;
    document.querySelectorAll('#speed .seg').forEach(b => b.classList.toggle('on', Math.abs(+b.dataset.s - s) < 1e-6));
    const p = $('btn-pause'); if (p) p.textContent = '❚❚ Pause';
  }

  // temperature is simulated in °C; convert only here at the UI boundary
  fmtTemp(c, dp = 1) { return this.tempF ? Math.round(c * 9 / 5 + 32) + '°F' : c.toFixed(dp) + '°C'; }

  _buildCensus() {
    const host = $('census'); if (!host) return; host.innerHTML = '';
    this.countEls = {}; this.detEls = {};
    for (const k of SPECIES) {
      const sp = SP[k];
      const row = document.createElement('div'); row.className = 'crow';
      row.innerHTML = `<i style="background:${sp.tag}"></i><span class="cn">${sp.name}</span><small class="cdet" id="cd-${k}"></small><b id="c-${k}">0</b>`;
      row.title = `${sp.name}: ${sp.trophic} · prefers ${sp.tempOpt}°C`;
      host.appendChild(row); this.countEls[k] = $('c-' + k); this.detEls[k] = $('cd-' + k);
    }
  }
  _buildPondSpecies() {
    const host = $('ps-species'); if (!host) return; host.innerHTML = ''; this.psEls = {};
    for (const k of SPECIES) {
      const sp = SP[k];
      const el = document.createElement('span'); el.className = 'pss';
      el.innerHTML = `<i style="background:${sp.tag}"></i><b id="ps-${k}">0</b>`;
      host.appendChild(el); this.psEls[k] = $('ps-' + k);
    }
  }
  _buildAddButtons() {
    const host = $('add'); if (!host) return; host.innerHTML = '';
    for (const k of SPECIES) {
      const sp = SP[k];
      const btn = document.createElement('button'); btn.className = 'chip'; btn.textContent = '+ ' + sp.name;
      btn.style.setProperty('--c', sp.tag);
      btn.onclick = () => { this.world.addAgent(k, { fromBest: true }); this.toast(`added ${sp.name}`); };
      host.appendChild(btn);
    }
  }
  // trophic biomass bars (fish roles) — build the rows once; frame() updates the widths/values
  _buildPyramid() {
    const host = $('pyramid'); if (!host) return; host.innerHTML = ''; this.pyrEls = {};
    for (const t of TROPHIC) {
      const row = document.createElement('div'); row.className = 'pbar';
      const pl = document.createElement('span'); pl.className = 'pl'; pl.textContent = t.label;
      const pt = document.createElement('span'); pt.className = 'pt';
      const fill = document.createElement('i'); fill.style.background = t.col; pt.appendChild(fill);
      const pv = document.createElement('span'); pv.className = 'pv'; pv.textContent = '0';
      row.appendChild(pl); row.appendChild(pt); row.appendChild(pv); host.appendChild(row);
      this.pyrEls[t.key] = { fill, val: pv };
    }
  }
  // per-species mean-gene table — build the rows once; frame() updates each cell
  _buildEvo() {
    const host = $('evo'); if (!host) return; host.innerHTML = ''; this.evoEls = {};
    const head = document.createElement('div'); head.className = 'erow ehead';
    head.innerHTML = '<span></span><span>siz</span><span>spd</span><span>tol</span><span>fin</span><span>eye</span><span>bod</span><span>brn</span><span>gen</span><span>imm</span>';
    host.appendChild(head);
    for (const k of SPECIES) {
      const sp = SP[k], row = document.createElement('div'); row.className = 'erow';
      const name = document.createElement('span'); name.className = 'en';
      name.innerHTML = `<i style="background:${sp.tag}"></i>${sp.name.slice(0, 3).toLowerCase()}`;
      row.appendChild(name);
      const cells = {};
      for (const g of EVO_GENES) { const c = document.createElement('span'); c.className = 'ev'; c.textContent = '—'; row.appendChild(c); cells[g] = c; }
      const gen = document.createElement('span'); gen.className = 'eg'; gen.textContent = '—'; row.appendChild(gen); cells.gen = gen;
      const imm = document.createElement('span'); imm.className = 'ei'; imm.textContent = '—'; row.appendChild(imm); cells.imm = imm;
      host.appendChild(row); this.evoEls[k] = cells;
    }
  }

  _wire() {
    const on = (id, ev, fn) => { const el = $(id); if (el) el[ev] = fn; };
    document.querySelectorAll('#speed .seg').forEach(b => b.onclick = () => this.setSpeedVal(+b.dataset.s));
    on('btn-pause', 'onclick', () => this.togglePause());

    // click the temperature readout to switch between °F and °C
    for (const id of ['env-temp', 'ps-temp']) { const el = $(id); if (el) { el.style.cursor = 'pointer'; el.title = 'click to switch °F / °C'; el.onclick = () => { this.tempF = !this.tempF; this._acc = 1; }; } }

    const fs = () => { const el = $('viewport'); if (!el) return; if (!document.fullscreenElement) (el.requestFullscreen || (() => {})).call(el)?.catch?.(() => {}); else document.exitFullscreen?.(); };
    on('btn-full', 'onclick', fs); on('btn-full-mini', 'onclick', fs);
    document.addEventListener('fullscreenchange', () => {
      const isOn = !!document.fullscreenElement; document.body.classList.toggle('isfull', isOn);
      this.renderer.resize();
      // fullscreen = screensaver mode: ease into a relaxed pace + cinematic tour; restore on exit
      if (isOn) { this._priorSpeed = this.speed; this.setSpeedVal(this.relaxSpeed); this.camera.startTour(); }
      else { this.camera.stopTour(); if (this._priorSpeed != null) { this.setSpeedVal(this._priorSpeed); this._priorSpeed = null; } }
    });

    // camera controls
    on('btn-overview', 'onclick', () => { this.camera.frameAll(); this.toast('whole lake'); });
    on('btn-tour', 'onclick', () => { if (this.camera.mode === 'tour') { this.camera.stopTour(); this.toast('tour off'); } else { this.camera.startTour(); this.toast('cinematic tour'); } });
    on('btn-follow', 'onclick', () => { if (this.world.selectedId != null) { this.camera.follow(this.world.selectedId); this.toast('following'); } else this.toast('select a fish first'); });
    on('btn-zoomin', 'onclick', () => this.camera.zoomAtScreen(this.renderer.canvas.width / 2, this.renderer.canvas.height / 2, 1.4));
    on('btn-zoomout', 'onclick', () => this.camera.zoomAtScreen(this.renderer.canvas.width / 2, this.renderer.canvas.height / 2, 0.7));
    // click the minimap to jump there
    if (this.mini) this.mini.onclick = e => {
      const r = this.mini.getBoundingClientRect();
      const wx = (e.clientX - r.left) / r.width * this.world.W, wy = (e.clientY - r.top) / r.height * this.world.H;
      this.camera.mode = 'free'; this.camera.followId = null; this.camera.tcx = wx; this.camera.tcy = wy; this.camera.setZoomRel(Math.max(6, this.camera.zoomFraction() * 64));
    };

    on('sel-weather', 'onchange', e => { const v = e.target.value, env = this.world.env; if (v === 'auto') env.forced = false; else env.setWeather(+v); });
    const exclusiveMap = pick => { for (const k of ['oxygen', 'temp', 'phyto']) { this.renderer.opts[k] = (k === pick); const el = $('tog-' + k); if (el) el.checked = (k === pick); } };
    on('tog-oxygen', 'onchange', e => e.target.checked ? exclusiveMap('oxygen') : this.renderer.opts.oxygen = false);
    on('tog-temp', 'onchange', e => e.target.checked ? exclusiveMap('temp') : this.renderer.opts.temp = false);
    on('tog-phyto', 'onchange', e => e.target.checked ? exclusiveMap('phyto') : this.renderer.opts.phyto = false);
    on('tog-vision', 'onchange', e => this.renderer.opts.vision = e.target.checked);
    on('tog-perf', 'onchange', e => { this.renderer.opts.perf = e.target.checked; const p = $('perf'); if (p) p.classList.toggle('show', e.target.checked); });

    on('btn-feed', 'onclick', () => { const vr = this.camera.visibleRect(); for (let i = 0; i < 40; i++) { const x = Math.max(6, Math.min(this.world.W - 6, vr.x0 + Math.random() * (vr.x1 - vr.x0))), y = Math.max(20, Math.min(this.world.FLOOR - 10, vr.y0 + Math.random() * (vr.y1 - vr.y0))); this.world.plankton.push(this.world._mkPlankton(x, y)); } this.toast('scattered plankton'); });
    on('btn-reset', 'onclick', () => { if (confirm('Reset the lake? Living brains will be lost (use Save brains first).')) { this.world.reset(); this.camera.frameAll(); this.toast('lake reset'); } });

    on('btn-save', 'onclick', () => { const data = JSON.stringify(this.world.champions()); if (lsSet(KEY, data)) this.toast('saved champion brains'); else { dl('synapse-reef-brains.json', data); this.toast('storage blocked here — downloaded brains file'); } });
    on('btn-load', 'onclick', () => { const data = lsGet(KEY); if (!data) return this.toast('no saved brains found — use Import'); try { this.world.seedFromChampions(JSON.parse(data)); this.toast('seeded saved champions'); } catch { this.toast('could not read saved brains'); } });
    on('btn-export', 'onclick', () => { dl('synapse-reef-state.json', JSON.stringify(this.world.toJSON())); this.toast('exported lake state'); });
    on('file-import', 'onchange', e => {
      const f = e.target.files[0]; if (!f) return;
      const r = new FileReader();
      r.onload = () => { try { const o = JSON.parse(r.result); if (o.agents) this.world.load(o); else this.world.seedFromChampions(o); this.camera.frameAll(); this.toast('imported ' + f.name); } catch { this.toast('that file could not be read'); } };
      r.readAsText(f); e.target.value = '';
    });
  }

  toast(msg) {
    const t = $('toast'); if (!t) return; t.textContent = msg; t.classList.add('show');
    clearTimeout(this._tt); this._tt = setTimeout(() => t.classList.remove('show'), 1700);
  }

  setRate(r) { this.rate = r; }

  frame(dt) {
    const w = this.world, env = w.env;
    if (this.inspector) this.inspector.draw(w.inspectAgent());
    this._perf();

    this._acc += dt;
    if (this._acc < 0.12) return;       // ~8 Hz for text/charts/minimap
    this._acc = 0;
    const c = w.census(), sd = w.speciesDetail();
    let total = 0;
    for (const k of SPECIES) {
      if (this.countEls && this.countEls[k]) this.countEls[k].textContent = c[k];
      // per-species genetics: top generation reached · mean body-size gene (watch evolution live)
      if (this.detEls && this.detEls[k]) this.detEls[k].textContent = c[k] ? `g${sd[k].maxGen} · ${sd[k].gSize.toFixed(2)}×` : '';
      total += c[k];
    }
    const set = (id, v) => { const e = $(id); if (e) e.textContent = v; };
    set('stat-gen', w.maxGen); set('stat-pop', total);
    set('stat-sps', this.paused ? 'paused' : `${(this.rate / 1000).toFixed(1)}k steps/s`);

    const mins = Math.floor(env.t * 1440), hh = String((mins / 60 | 0)).padStart(2, '0'), mm = String(mins % 60).padStart(2, '0');
    const phase = env.light > 0.5 ? 'Day' : env.light > 0.08 ? (env.t < 0.5 ? 'Dawn' : 'Dusk') : 'Night';
    set('env-clock', `${hh}:${mm}`); set('env-phase', phase); set('env-weather', env.weatherName());
    set('env-month', env.monthName()); set('env-season', env.seasonName()); set('env-year', 'Year ' + (Math.floor(env.year) + 1));
    set('env-temp', this.fmtTemp(env.tempC, 1)); set('env-o2', (w.avgO2() * 100 | 0) + '%');
    set('env-clarity', (Math.max(0, 1 - env.turbidity) * 100 | 0) + '%');
    // expanded water-chemistry detail (depth-resolved)
    const ed = w.envDetail();
    set('env-o2deep', (ed.o2Deep * 100 | 0) + '%');
    set('env-strat', (ed.strat * 100 | 0) + '%' + (ed.strat > 0.5 ? ' ⬍' : ''));
    set('env-tempdeep', this.fmtTemp(ed.tempDeep, 1));
    set('env-nutrient', `N ${ed.nitrogen.toFixed(2)} · P ${ed.phosphate.toFixed(2)} (${ed.limiting}-lim)`);
    set('env-nitrate', (ed.nitrateFrac * 100 | 0) + '% NO₃');
    set('env-sedp', ed.sedP.toFixed(2));
    set('env-phyto', (ed.phyto * 100 | 0) + '%');
    set('env-cyano', (ed.cyano * 100 | 0) + '%' + (ed.cyano > 0.4 ? ' scum' : ''));
    set('env-dom', ed.dom.toFixed(2));
    set('env-secchi', (ed.secchi | 0) + 'px');

    set('ps-gen', 'gen ' + w.maxGen); set('ps-pop', total + ' fish'); set('ps-clock', `${hh}:${mm}`);
    set('ps-phase', phase); set('ps-season', `${env.monthName()} · ${env.seasonName()}`); set('ps-weather', env.weatherName()); set('ps-temp', this.fmtTemp(env.tempC, 0)); set('ps-o2', (w.avgO2() * 100 | 0) + '%');
    for (const k of SPECIES) if (this.psEls && this.psEls[k]) this.psEls[k].textContent = c[k];

    const sel = w.selectedId != null ? w.agents.find(a => a.id === w.selectedId) : null;
    const selEl = $('sel');
    if (selEl) {
      if (sel) {
        const pc = v => Math.round(v * 100), diet = Object.keys(sel.sp.diet).filter(k => sel.sp.diet[k]).join(', ');
        const stage = sel.grow >= 0.99 ? 'adult' : 'juvenile ' + pc(sel.grow) + '%';
        const zone = sel.y > w.bedY(sel.x) * 0.7 ? 'profundal/benthic' : (sel.x < w.W * 0.30 || sel.x > w.W * 0.70) ? 'littoral' : 'pelagic';
        selEl.innerHTML =
          `<b style="color:${sel.sp.tag}">${sel.sp.name}</b> · gen ${sel.gen} · ${stage} · in the ${zone}<br>` +
          `<span class="seldim">genes</span> size ${sel.genes[0].toFixed(2)}× · speed ${sel.genes[1].toFixed(2)}× · tolerance ${sel.genes[2].toFixed(2)}×<br>` +
          `<span class="seldim">body</span> ${sel.size.toFixed(2)} · <span class="seldim">top</span> ${sel.maxSpeed | 0}px/s · <span class="seldim">energy</span> ${sel.energy.toFixed(2)} · <span class="seldim">age</span> ${sel.age | 0}s · <span class="seldim">ate</span> ${sel.eaten}<br>` +
          `<span class="seldim">niche</span> comfort ${this.fmtTemp(sel.sp.tempOpt - sel.tempTol, 0)}–${this.fmtTemp(sel.sp.tempOpt + sel.tempTol, 0)} · needs O₂≥${pc(sel.o2Crit)}% · <span class="seldim">diet</span> ${diet}<br>` +
          `<span class="seldim">right here</span> ${this.fmtTemp(w.env.tempAt(sel.x, sel.y), 1)} · O₂ ${pc(w.oxygenAt(sel.x, sel.y))}%`;
      } else selEl.textContent = 'tap a fish to follow it and read its full detail — genes, niche, diet, condition';
    }

    this._foodweb(c); this._evo(c, sd); this._cognition();
    this._charts(); this._minimap(); this._depthProfile();
  }

  // food web: the resource-base count strip + the fish trophic-biomass bars
  _foodweb(c) {
    const w = this.world, rc = w.resourceCounts(), resEl = $('reslist');
    if (resEl) resEl.innerHTML = [['zoo', rc.zooplankton], ['larvae', rc.larvae], ['insects', rc.insects], ['snails', rc.snails], ['crayfish', rc.crayfish], ['mussels', rc.mussels], ['detritus', rc.detritus], ['plants', rc.plants]]
      .map(([n, v]) => `<span class="res">${n}<b>${v}</b></span>`).join('');
    if (this.pyrEls) {
      const bm = w.biomassByTrophic(); let maxB = 1e-6;
      for (const t of TROPHIC) maxB = Math.max(maxB, bm[t.key] || 0);
      for (const t of TROPHIC) { const e = this.pyrEls[t.key]; if (!e) continue; const v = bm[t.key] || 0; e.fill.style.width = (v / maxB * 100).toFixed(1) + '%'; e.val.textContent = v >= 10 ? (v | 0) : v.toFixed(1); }
    }
  }

  // per-species mean trait genes (highlight drift from the 1.0 baseline), generation, immigrant %
  _evo(c, sd) {
    if (!this.evoEls) return;
    for (const k of SPECIES) {
      const e = this.evoEls[k], s = sd[k]; if (!e) continue;
      if (c[k]) {
        for (const g of EVO_GENES) { const v = s[g], cell = e[g]; cell.textContent = v.toFixed(2); cell.classList.toggle('up', v > 1.04); cell.classList.toggle('dn', v < 0.96); }
        e.gen.textContent = 'g' + s.maxGen; e.imm.textContent = Math.round(s.immFrac * 100) + '%';
      } else { for (const g of EVO_GENES) { e[g].textContent = '—'; e[g].classList.remove('up', 'dn'); } e.gen.textContent = '—'; e.imm.textContent = '—'; }
    }
  }

  // fleet-wide cognition: internal drives, the brain-gated action mix, recurrent-memory strength, contaminant burden
  _cognition() {
    const el = $('cog'); if (!el) return;
    const g = this.world.cognitionDetail();
    const cell = (label, val, cls) => `<div class="cg ${cls || ''}"><label>${label}</label><b>${val}</b></div>`;
    let html = cell('hunger', g.meanHunger.toFixed(2)) + cell('fear', g.meanFear.toFixed(2)) + cell('memory', g.meanMemory.toFixed(2))
      + cell('striking', Math.round(g.pStrike * 100) + '%', 'act') + cell('fleeing', Math.round(g.pFlee * 100) + '%', 'act') + cell('hiding', Math.round(g.pHide * 100) + '%', 'act');
    if (g.meanTox > 0.001) html += cell('contaminant', g.meanTox.toFixed(2));   // only when a pollution scenario is loaded (AMBIENT>0)
    el.innerHTML = html;
  }

  _perf() {
    const el = $('perf'); if (!el || !this.renderer.opts.perf) return;
    const s = this.renderer.stats, cam = this.camera;
    el.textContent = `${s.fps.toFixed(0)} fps · ${s.drawn}/${s.total} drawn · ${s.sprites} spr ${s.dots} dot · sim ${s.simMs.toFixed(1)}ms · ${(this.rate / 1000).toFixed(1)}k st/s · zoom ${cam.zoom < cam.fitZoom * 1.4 ? 'lake' : (cam.zoom / cam.fitZoom).toFixed(1) + '×'} · cache ${this.renderer.sprites.map.size}`;
  }

  _minimap() {
    if (!this.mctx) return;
    const host = this.mini, dpr = this.dpr;
    const r = host.getBoundingClientRect(), Wd = Math.max(80, r.width | 0), Hd = Math.max(45, r.height | 0);
    if (host.width !== Wd * dpr) { host.width = Wd * dpr; host.height = Hd * dpr; }
    this.mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.renderer.drawMinimap(this.mctx, Wd, Hd);
  }

  _charts() {
    const ctx = this.cctx; if (!ctx) return;
    const host = this.chart, dpr = this.dpr;
    const r = host.getBoundingClientRect(), Wd = Math.max(220, r.width | 0), Hd = Math.max(120, r.height | 0);
    if (host.width !== Wd * dpr) { host.width = Wd * dpr; host.height = Hd * dpr; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, Wd, Hd);
    const S = this.world.series; if (S.length < 2) return;

    const popH = Hd * 0.66, envH = Hd - popH - 6;
    let maxP = 8; for (const s of S) for (const k of SPECIES) if (s[k] > maxP) maxP = s[k];
    const x = i => (i / (S.length - 1)) * Wd;
    ctx.lineWidth = 1.2;
    for (const k of SPECIES) {
      ctx.strokeStyle = SP[k].tag; ctx.globalAlpha = 0.92; ctx.beginPath();
      for (let i = 0; i < S.length; i++) { const y = popH - (S[i][k] / maxP) * (popH - 4) - 2; i ? ctx.lineTo(x(i), y) : ctx.moveTo(x(i), y); }
      ctx.stroke();
    }
    ctx.globalAlpha = 1; ctx.fillStyle = '#5b7d86'; ctx.font = '8px "Space Mono", monospace'; ctx.textAlign = 'left';
    ctx.fillText('population', 2, 9); ctx.textAlign = 'right'; ctx.fillText(maxP + '', Wd - 2, 9); ctx.textAlign = 'left';

    const ey0 = popH + 6;
    const band = (key, scale, col, dash) => { ctx.strokeStyle = col; ctx.globalAlpha = 0.9; ctx.setLineDash(dash || []); ctx.beginPath(); for (let i = 0; i < S.length; i++) { const v = Math.min(1, (S[i][key] || 0) / scale); const y = ey0 + envH - v * envH; i ? ctx.lineTo(x(i), y) : ctx.moveTo(x(i), y); } ctx.stroke(); ctx.setLineDash([]); };
    ctx.fillStyle = 'rgba(255,255,255,0.03)'; ctx.fillRect(0, ey0, Wd, envH);
    band('o2', 1.1, '#5fd0ff'); band('temp', 1, '#ffae5a'); band('light', 1, '#dfe8ee');
    // lower food web — phytoplankton + cyanobacteria (scaled up since they sit low); dashed to set them apart
    band('phyto', 0.5, '#6fdc6f', [3, 2]); band('cyano', 0.5, '#9bd6c0', [3, 2]);
    ctx.globalAlpha = 1; ctx.fillStyle = '#5b7d86'; ctx.fillText('O₂·temp·light · phyto·cyano', 2, ey0 + 9);
  }

  // a limnological depth profile down the column UNDER THE CAMERA — pan to compare the littoral shelf vs the
  // deep basin. Plots temp / O₂ / N / P / phyto / cyano vs depth (surface at top) over a sunlit→abyss backdrop,
  // so the thermocline, the hypoxic deep, the nutricline, and the buoyant surface scum are all legible.
  _depthProfile() {
    const ctx = this.dctx; if (!ctx) return;
    const host = this.depth, dpr = this.dpr, W = this.world.W;
    const r = host.getBoundingClientRect(), Wd = Math.max(150, r.width | 0), Hd = Math.max(120, r.height | 0);
    if (host.width !== Wd * dpr) { host.width = Wd * dpr; host.height = Hd * dpr; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, Wd, Hd);
    const cx = clamp(this.camera ? this.camera.cx : W * 0.5, 8, W - 8);
    const prof = this.world.depthProfile(cx, 28);
    const padL = 6, padR = 6, padT = 12, padB = 12, plotW = Wd - padL - padR, plotH = Hd - padT - padB;
    // the water column itself: sunlit surface → dark abyss
    const bg = ctx.createLinearGradient(0, padT, 0, padT + plotH);
    bg.addColorStop(0, 'rgba(120,180,210,0.20)'); bg.addColorStop(1, 'rgba(8,14,30,0.34)');
    ctx.fillStyle = bg; ctx.fillRect(padL, padT, plotW, plotH);
    const yOf = f => padT + f * plotH, xOf = v => padL + clamp(v, 0, 1) * plotW;
    const trace = (norm, col) => { ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.95; ctx.beginPath(); prof.samples.forEach((s, i) => { const x = xOf(norm(s)), y = yOf(s.frac); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke(); };
    trace(s => (s.tempC - 5) / 27, '#ff8a5c');   // temperature 5–32°C
    trace(s => s.o2 / 1.2, '#5cd8ff');           // dissolved O₂
    trace(s => s.din / 1.5, '#ffd25c');          // inorganic N (nh4+no3)
    trace(s => s.phos / 0.3, '#ff6fae');         // phosphate
    trace(s => s.phyto, '#6fdc6f');              // green phytoplankton
    trace(s => s.cyano, '#9bd6c0');              // cyanobacteria (surface scum)
    trace(s => s.dom / 0.6, '#c9a86a');          // dissolved organic matter (accumulates in the cold deep)
    ctx.globalAlpha = 0.65; ctx.fillStyle = '#9fb4c8'; ctx.font = '8px "Space Mono", monospace'; ctx.textBaseline = 'top'; ctx.textAlign = 'left';
    ctx.fillText(`column · ${cx < W * 0.3 || cx > W * 0.7 ? 'littoral' : 'mid-lake'}`, padL, 2);
    ctx.textAlign = 'right'; ctx.fillText('surface', Wd - padR, 2); ctx.textBaseline = 'bottom'; ctx.fillText('bed', Wd - padR, Hd - 1); ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillText(`${(prof.bed / this.world.H * 100) | 0}% deep`, padL, Hd - 10);
    ctx.globalAlpha = 1;
  }
}
