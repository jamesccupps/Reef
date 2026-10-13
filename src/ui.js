// ui.js — browser-only. HUD, census, charts, minimap, perf HUD, camera controls,
// persistence. Drives the loop's speed/pause flags.
//
// SAFETY: imported files and localStorage are untrusted. Anything data-derived that reaches innerHTML goes through
// escapeHTML() or a numeric formatter (fmtNum/fmtInt), and colours are applied through the CSSOM (el.style), never as
// inline style attributes — the page's Content-Security-Policy blocks those (index.html / serve.py / serve.mjs).
import { SP, SPECIES } from './species.js';
import { WORLD, PLANKTON, TIME, scaleCount } from './config.js';

const $ = id => document.getElementById(id);
const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);

// ---- safe formatting for anything that ends up in innerHTML ----
const HTML_ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const escapeHTML = v => String(v).replace(/[&<>"']/g, c => HTML_ESC[c]);
// numbers from a save file can be strings/objects: coerce, and show '—' for anything non-finite
export const fmtNum = (v, dp = 0) => { const n = Number(v); return Number.isFinite(n) ? n.toFixed(dp) : '—'; };
export const fmtInt = v => { const n = Number(v); return Number.isFinite(n) ? String(Math.trunc(n)) : '—'; };

// current device-pixel ratio (re-read every use: it changes when the window moves between monitors or the page zooms)
const curDPR = () => Math.min((typeof window !== 'undefined' && window.devicePixelRatio) || 1, 2);
// size a canvas backing store to its CSS box × dpr (rounded: a fractional dpr must not re-size — and clear — every frame)
const fitCanvas = (c, w, h, dpr) => { const bw = Math.round(w * dpr), bh = Math.round(h * dpr); if (c.width !== bw || c.height !== bh) { c.width = bw; c.height = bh; } };

export const DL_REVOKE_MS = 60000;               // keep a download's blob URL alive this long (a synchronous revoke can cancel it)
export const MAX_IMPORT_BYTES = 50 * 1024 * 1024; // refuse bigger "state" files before reading them into memory
const dl = (name, text) => {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const a = document.createElement('a'); a.href = url; a.download = name; a.rel = 'noopener';
  const host = document.body || document.documentElement; if (host) host.appendChild(a);
  a.click(); if (a.remove) a.remove();
  const t = setTimeout(() => URL.revokeObjectURL(url), DL_REVOKE_MS); if (t && t.unref) t.unref();
};
const lsSet = (k, v) => { try { localStorage.setItem(k, v); return true; } catch { return false; } };
const lsGet = k => { try { return localStorage.getItem(k); } catch { return null; } };
const KEY = 'synapse-reef.champions';
const plural = (n, one, many = one + 's') => `${n} ${n === 1 ? one : many}`;

// a colour swatch built through the DOM + CSSOM (no inline style attribute → CSP-clean)
const swatch = col => { const i = document.createElement('i'); i.style.background = col; return i; };
const textEl = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; e.textContent = text; return e; };

// Champion brains come from localStorage or an imported file → keep only known species and plain numbers so nothing
// script-shaped or non-finite reaches the world (World.seedFromChampions also validates; this is the UI's own guard).
export function sanitizeChampions(o) {
  const out = {};
  if (!o || typeof o !== 'object' || Array.isArray(o)) return out;
  for (const k of SPECIES) {
    if (!Object.prototype.hasOwnProperty.call(o, k)) continue;
    const c = o[k]; if (!c || typeof c !== 'object') continue;
    const gen = Number(c.gen), hue = Number(c.hue);
    const w = Array.isArray(c.w) ? c.w.slice(0, 1 << 20).map(v => { const n = Number(v); return Number.isFinite(n) ? n : 0; }) : [];
    out[k] = { gen: Number.isFinite(gen) && gen >= 0 ? Math.floor(gen) : 0, hue: Number.isFinite(hue) ? ((hue % 360) + 360) % 360 : 0, w };
  }
  return out;
}

// fish trophic roles, low→high, for the biomass spectrum (these share comparable summed-body-size units;
// producers/inverts live in their own count strip since their units aren't commensurable with fish biomass)
const TROPHIC = [
  { key: 'planktivore', label: 'planktivore', col: '#9fc7e8' },
  { key: 'omnivore', label: 'omnivore', col: '#ff9d4d' },
  { key: 'mesopredator', label: 'mesopredator', col: '#d6c04a' },
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
    this._buildCensus(); this._buildPondSpecies(); this._buildAddButtons();
    this._buildPyramid(); this._buildEvo(); this._buildLegend(); this._wire();
    this.syncWeatherUI(true);
    this._acc = 0;
  }

  get dpr() { return curDPR(); }

  _setPaused(p) {
    this.paused = !!p;
    const b = $('btn-pause'); if (b) b.textContent = this.paused ? '▶ Resume' : '❚❚ Pause';
  }
  togglePause() { this._setPaused(!this.paused); }

  // set the sim-time multiplier and light up the matching speed button (relaxed / 1× / 2× / 4×)
  setSpeedVal(s) {
    this.speed = s; this._setPaused(false);
    document.querySelectorAll('#speed .seg').forEach(b => b.classList.toggle('on', Math.abs(+b.dataset.s - s) < 1e-6));
  }

  // temperature is simulated in °C; convert only here at the UI boundary
  fmtTemp(c, dp = 1) { const n = Number(c); if (!Number.isFinite(n)) return '—'; return this.tempF ? Math.round(n * 9 / 5 + 32) + '°F' : n.toFixed(dp) + '°C'; }

  _buildCensus() {
    const host = $('census'); if (!host) return; host.innerHTML = '';
    this.countEls = {}; this.detEls = {};
    for (const k of SPECIES) {
      const sp = SP[k];
      const row = document.createElement('div'); row.className = 'crow';
      const det = textEl('small', 'cdet', ''); det.id = 'cd-' + k;
      const cnt = textEl('b', '', '0'); cnt.id = 'c-' + k;
      row.appendChild(swatch(sp.tag)); row.appendChild(textEl('span', 'cn', sp.name)); row.appendChild(det); row.appendChild(cnt);
      row.title = `${sp.name}: ${sp.trophic} · prefers ${sp.tempOpt}°C`;
      host.appendChild(row); this.countEls[k] = cnt; this.detEls[k] = det;
    }
  }
  _buildPondSpecies() {
    const host = $('ps-species'); if (!host) return; host.innerHTML = ''; this.psEls = {};
    for (const k of SPECIES) {
      const sp = SP[k];
      const el = document.createElement('span'); el.className = 'pss';
      const cnt = textEl('b', '', '0'); cnt.id = 'ps-' + k;
      el.appendChild(swatch(sp.tag)); el.appendChild(cnt);
      host.appendChild(el); this.psEls[k] = cnt;
    }
  }
  _buildAddButtons() {
    const host = $('add'); if (!host) return; host.innerHTML = '';
    for (const k of SPECIES) {
      const sp = SP[k];
      const btn = document.createElement('button'); btn.className = 'chip'; btn.textContent = '+ ' + sp.name;
      btn.style.setProperty('--c', sp.tag);
      btn.onclick = () => this.addSpecies(k);
      host.appendChild(btn);
    }
  }
  // the species legend under the tank (was an inline <script> in index.html; moved here so the CSP can forbid inline script)
  _buildLegend() {
    const host = $('legend'); if (!host) return; host.innerHTML = '';
    for (const k of SPECIES) {
      const li = document.createElement('li');
      li.appendChild(swatch(SP[k].tag)); li.appendChild(textEl('span', '', SP[k].name));
      host.appendChild(li);
    }
    // the visiting loon (a diving fish-eater, not a brain-driven fish — it has no chip or census row)
    // the scripted wildlife (no brains: they live by simple rules) — loon, frogs, turtles, dragonflies
    for (const [col, name] of [['#5d6b70', 'Loon (visitor)'], ['#5c8a3e', 'Frog'], ['#3a4630', 'Turtle'], ['#4a9ec8', 'Dragonfly']]) {
      const li = document.createElement('li');
      li.appendChild(swatch(col)); li.appendChild(textEl('span', '', name));
      host.appendChild(li);
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
      name.appendChild(swatch(sp.tag)); name.appendChild(textEl('span', '', sp.name.slice(0, 3).toLowerCase()));
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

    // click (or Enter/Space on) a temperature readout to switch between °F and °C. #ps-temp sits on the water overlay,
    // whose box is pointer-events:none so drags reach the tank; styles.css re-enables pointer events on this one span.
    // stopPropagation keeps the click from also reaching the tank/viewport (no fish select/deselect, no pause on Space).
    const flipUnits = () => { this.tempF = !this.tempF; this._acc = 1; };
    for (const id of ['env-temp', 'ps-temp']) {
      const el = $(id); if (!el) continue;
      el.style.cursor = 'pointer'; el.title = 'click to switch °F / °C';
      if (el.setAttribute) el.setAttribute('role', 'button');
      el.tabIndex = 0;
      el.onpointerdown = e => { if (e && e.stopPropagation) e.stopPropagation(); };
      el.onpointerup = e => { if (e && e.stopPropagation) e.stopPropagation(); };
      el.onclick = e => { if (e && e.stopPropagation) e.stopPropagation(); flipUnits(); };
      el.onkeydown = e => { if (e && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); e.stopPropagation(); flipUnits(); } };
    }

    const fs = () => { const el = $('viewport'); if (!el) return; if (!document.fullscreenElement) (el.requestFullscreen || (() => {})).call(el)?.catch?.(() => {}); else document.exitFullscreen?.(); };
    on('btn-full', 'onclick', fs); on('btn-full-mini', 'onclick', fs);
    document.addEventListener('fullscreenchange', () => this._onFullscreenChange());
    // SCREENSAVER: in fullscreen the chrome (stats, minimap, camera bar, buttons) and the cursor fade away after a few idle
    // seconds and come back on any input (frame() toggles .idle on the viewport; the fade itself is CSS)
    this._lastActive = typeof performance !== 'undefined' ? performance.now() : 0; this._idle = false;
    const poke = () => { this._lastActive = typeof performance !== 'undefined' ? performance.now() : 0; };
    for (const ev of ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart']) document.addEventListener(ev, poke, { passive: true });

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

    on('sel-weather', 'onchange', e => { const v = e.target.value, env = this.world.env; if (v === 'auto') env.forced = false; else env.setWeather(+v); this.syncWeatherUI(true); });
    const exclusiveMap = pick => { for (const k of ['oxygen', 'temp', 'phyto']) { this.renderer.opts[k] = (k === pick); const el = $('tog-' + k); if (el) el.checked = (k === pick); } };
    on('tog-oxygen', 'onchange', e => e.target.checked ? exclusiveMap('oxygen') : this.renderer.opts.oxygen = false);
    on('tog-temp', 'onchange', e => e.target.checked ? exclusiveMap('temp') : this.renderer.opts.temp = false);
    on('tog-phyto', 'onchange', e => e.target.checked ? exclusiveMap('phyto') : this.renderer.opts.phyto = false);
    on('tog-vision', 'onchange', e => this.renderer.opts.vision = e.target.checked);
    on('tog-perf', 'onchange', e => { this.renderer.opts.perf = e.target.checked; const p = $('perf'); if (p) p.classList.toggle('show', e.target.checked); });

    on('btn-feed', 'onclick', () => this.scatterFood());
    on('btn-reset', 'onclick', () => { if (confirm('Reset the lake? Living brains will be lost (use Save brains first).')) { this.world.reset(); this._afterWorldReplaced(); this.toast('lake reset'); } });

    on('btn-save', 'onclick', () => { const data = JSON.stringify(this.world.champions()); if (lsSet(KEY, data)) this.toast('saved champion brains'); else { dl('synapse-reef-brains.json', data); this.toast('storage blocked here — downloaded brains file'); } });
    on('btn-load', 'onclick', () => this.loadSavedBrains());
    on('btn-export', 'onclick', () => { dl('synapse-reef-state.json', JSON.stringify(this.world.toJSON())); this.toast('exported lake state'); });
    on('file-import', 'onchange', e => {
      const input = e.target, f = input.files && input.files[0]; input.value = '';
      if (!f) return;
      if (!(f.size <= MAX_IMPORT_BYTES)) return this.toast(`${f.name} is too large to import (${(f.size / 1048576).toFixed(0)} MB; the limit is ${MAX_IMPORT_BYTES / 1048576} MB)`);
      const r = new FileReader();
      r.onerror = () => this.toast(`${f.name} could not be read`);
      r.onload = () => this.importText(String(r.result), f.name);
      r.readAsText(f);
    });
  }

  // WINDOW SCREENSAVER (#screensaver in the URL, set by "Synapse Reef - Screensaver.bat"): the lake fills the browser
  // window (body.ss; the browser itself is full screen) and behaves exactly like element fullscreen — relaxed pace,
  // tour, idle chrome fade. Element fullscreen needs a user gesture, so a launcher can't request it; this needs none.
  setWindowScreensaver(on) {
    this._ss = !!on;
    if (document.body) document.body.classList.toggle('ss', this._ss);
    this._onFullscreenChange();
  }
  screensaverOn() { return !!document.fullscreenElement || !!this._ss; }

  // fullscreen = screensaver mode: ease into a relaxed pace + cinematic tour; on exit restore the speed AND the paused
  // state from before fullscreen (setSpeedVal always unpauses). If the user paused during fullscreen, stay paused.
  // Element fullscreen and the window screensaver can overlap; only the overall on/off edge changes pace and tour.
  _onFullscreenChange() {
    const isOn = this.screensaverOn();
    if (document.body) document.body.classList.toggle('isfull', isOn);
    this.renderer.resize();
    if (isOn === !!this._ssActive) return;
    this._ssActive = isOn;
    if (isOn) {
      if (this._priorSpeed == null) { this._priorSpeed = this.speed; this._priorPaused = this.paused; }
      this.setSpeedVal(this.relaxSpeed); this.camera.startTour();
    } else {
      this.camera.stopTour();
      const wasPaused = !!this._priorPaused || this.paused;
      if (this._priorSpeed != null) this.setSpeedVal(this._priorSpeed);
      this._setPaused(wasPaused);
      this._priorSpeed = null; this._priorPaused = null;
    }
  }

  // reflect the environment's weather mode in the dropdown: "Auto" unless a weather is forced. Called after reset /
  // import / a change, and at ~8 Hz from frame(); skipped while the user has the dropdown focused (unless forced).
  syncWeatherUI(force = false) {
    const el = $('sel-weather'), env = this.world && this.world.env; if (!el || !env) return;
    const want = env.forced ? String(env.weather) : 'auto';
    if (el.value !== want && (force || document.activeElement !== el)) el.value = want;
  }

  // the world was replaced wholesale (reset / successful import): clear the selection, reframe, re-sync the controls
  _afterWorldReplaced() {
    this.world.selectedId = null;
    this.camera.frameAll();
    this.syncWeatherUI(true);
    this._acc = 1;   // refresh the readouts on the next frame
  }

  // ---- adding life: every path respects the global agent cap / the plankton cap ----
  addSpecies(k) {
    const w = this.world, cap = WORLD.GLOBAL_MAX, sp = SP[k];
    const full = () => { this.toast(`the lake is full (${cap} fish) — no room for another ${sp.name}`); return false; };
    if (w.agents.length >= cap) return full();
    if (!w.addAgent(k, { fromBest: true })) return full();   // World.addAgent returns null at GLOBAL_MAX
    this.toast(`added ${sp.name}`); return true;
  }
  scatterFood(n = 40) {
    const w = this.world, cap = scaleCount(PLANKTON.CAP), room = cap - w.plankton.length;
    if (room <= 0) { this.toast(`plenty of plankton already (${cap} max)`); return 0; }
    const k = Math.min(n, room), vr = this.camera.visibleRect();
    for (let i = 0; i < k; i++) {
      const x = Math.max(6, Math.min(w.W - 6, vr.x0 + Math.random() * (vr.x1 - vr.x0))), y = Math.max(20, Math.min(w.FLOOR - 10, vr.y0 + Math.random() * (vr.y1 - vr.y0)));
      w.plankton.push(w._mkPlankton(x, y));
    }
    this.toast(k < n ? `scattered ${k} plankton (at the ${cap} cap)` : 'scattered plankton');
    return k;
  }
  // seed champion brains, capped at GLOBAL_MAX. Works with both World.seedFromChampions contracts: the older one returns
  // nothing and ignores the cap (the overflow — all just-added fish at the array's tail — is dropped here), the hardened
  // one returns { added, reseeded } and respects the cap itself.
  _seedChampions(champs) {
    const w = this.world, cap = WORLD.GLOBAL_MAX, before = w.agents.length;
    if (before >= cap) return { added: 0, reseeded: 0, full: true, trimmed: 0 };
    const ret = w.seedFromChampions(champs);
    let trimmed = 0;
    if (w.agents.length > cap) { trimmed = w.agents.length - cap; w.agents.length = cap; }
    const r = ret && typeof ret === 'object' ? Number(ret.reseeded) : NaN;
    return { added: Math.max(0, w.agents.length - before), reseeded: Number.isFinite(r) ? r : 0, full: false, trimmed };
  }
  _championToast(res, what) {
    if (res.full) return this.toast(`the lake is full (${WORLD.GLOBAL_MAX} fish) — no room to seed ${what}`);
    let msg = `seeded ${plural(res.added, 'fish', 'fish')} from ${what}`;
    if (res.reseeded > 0) msg += ` · ${plural(res.reseeded, 'brain')} didn't fit this version and ${res.reseeded === 1 ? 'was' : 'were'} reseeded`;
    if (res.trimmed > 0 || (res.added > 0 && this.world.agents.length >= WORLD.GLOBAL_MAX)) msg += ` · lake now full (${WORLD.GLOBAL_MAX})`;
    this.toast(msg);
  }
  loadSavedBrains() {
    const data = lsGet(KEY); if (!data) { this.toast('no saved brains found — use Import'); return null; }
    let champs;
    try { champs = sanitizeChampions(JSON.parse(data)); } catch { this.toast('could not read saved brains'); return null; }
    if (!Object.keys(champs).length) { this.toast('the saved brains are empty or unreadable'); return null; }
    try { const res = this._seedChampions(champs); this._championToast(res, 'saved champions'); return res; }
    catch (err) { console.error(err); this.toast('could not seed the saved brains'); return null; }
  }
  // Import state: a full lake (has `agents`) or a champions file. UI state (camera, selection, weather control) is only
  // touched AFTER the world accepted the data, so a failed import leaves the UI as it was.
  importText(text, name = 'file') {
    let o;
    try { o = JSON.parse(text); } catch { this.toast(`${name} isn't a valid JSON file`); return false; }
    if (!o || typeof o !== 'object' || Array.isArray(o)) { this.toast(`${name} isn't a Synapse Reef lake or brains file`); return false; }
    try {
      if (o.agents) {
        // a count left in the file's stats by an earlier session must not be reported as this load's
        if (o.stats && typeof o.stats === 'object') delete o.stats.brainsReseeded;
        this.world.load(o);
        this._afterWorldReplaced();
        const re = Number(this.world.stats && this.world.stats.brainsReseeded) || 0;
        let msg = `imported ${name} — ${plural(this.world.agents.length, 'fish', 'fish')}`;
        if (re > 0) msg += ` · ${plural(re, 'brain')} didn't fit this version and ${re === 1 ? 'was' : 'were'} reseeded`;
        this.toast(msg);
        return true;
      }
      const champs = sanitizeChampions(o);
      if (!Object.keys(champs).length) { this.toast(`${name} has no lake state or champion brains`); return false; }
      const res = this._seedChampions(champs);
      this._championToast(res, `${name}'s champions`);
      return !res.full;
    } catch (err) {
      console.error('import failed:', err);
      this.toast(`${name} could not be loaded` + (err && err.message ? ` — ${String(err.message).slice(0, 90)}` : ''));
      return false;
    }
  }

  toast(msg) {
    const t = $('toast'); if (!t) return; t.textContent = msg; t.classList.add('show');
    clearTimeout(this._tt); this._tt = setTimeout(() => t.classList.remove('show'), clamp(String(msg).length * 45, 1700, 6000));
  }

  setRate(r) { this.rate = r; }

  frame(dt) {
    const w = this.world, full = this.screensaverOn();
    // fullscreen / the window screensaver hide the side panels: skip the brain view and the panel refresh there
    if (this.inspector && !full) this.inspector.draw(w.inspectAgent());
    this._perf();
    // screensaver idle state (fullscreen or the window screensaver only): 3.5 s without input → fade the chrome + hide the cursor
    const now = typeof performance !== 'undefined' ? performance.now() : 0;
    const idle = typeof document !== 'undefined' && full && now - this._lastActive > 3500;
    if (idle !== this._idle) { this._idle = idle; const vp = $('viewport'); if (vp && vp.classList) vp.classList.toggle('idle', idle); }

    // ~8 Hz refresh of the text, charts and minimap, SPREAD over consecutive frames (one slice per frame): run as one
    // block it was a 3–6 ms burst eight times a second, a visible periodic hitch at 1080p. Slices that read layout
    // (the canvases' getBoundingClientRect) run in later frames than the text writes, so they never force a layout.
    this._acc += dt;
    if (this._acc >= 0.12) { this._acc = 0; this._uiSlot = 0; }
    if (this._uiSlot == null) return;
    const slot = this._uiSlot++;
    if (slot === 0) { this._c = w.census(); this._sd = w.speciesDetail(); this._readouts(this._c, this._sd, full); }
    else if (slot === 1) this._minimap();
    else if (full) this._uiSlot = null;   // hidden panels: done
    else if (slot === 2) this._selection();
    else if (slot === 3) { this._foodweb(this._c); this._evo(this._c, this._sd); this._cognition(); }
    else if (slot === 4) this._charts();
    else if (slot === 5) this._depthProfile();
    else this._uiSlot = null;
  }

  // the text readouts: the side panels (skipped while they're hidden in fullscreen) and the lake overlay's stats box
  _readouts(c, sd, full) {
    const w = this.world, env = w.env;
    let total = 0;
    for (const k of SPECIES) total += c[k];
    const set = (id, v) => { const e = $(id); if (e) e.textContent = v; };
    const mins = Math.floor(env.t * 1440), hh = String((mins / 60 | 0)).padStart(2, '0'), mm = String(mins % 60).padStart(2, '0');
    const sunH = env.sun ?? env.light;   // the sun's height, not the light reaching the water (cloud and ice dim that)
    const phase = sunH > 0.35 ? 'Day' : sunH > 0.04 ? (env.t < 0.5 ? 'Dawn' : 'Dusk') : 'Night';
    set('ps-gen', 'gen ' + fmtInt(w.maxGen)); set('ps-pop', total + ' fish'); set('ps-clock', `${hh}:${mm}`);
    set('ps-phase', phase); set('ps-season', `${env.monthName()} · ${env.seasonName()}`); set('ps-weather', env.weatherName()); set('ps-temp', this.fmtTemp(env.tempC, 0)); set('ps-o2', (w.avgO2() * 100 | 0) + '%');
    for (const k of SPECIES) if (this.psEls && this.psEls[k]) this.psEls[k].textContent = c[k];
    if (full) return;
    for (const k of SPECIES) {
      if (this.countEls && this.countEls[k]) this.countEls[k].textContent = c[k];
      // per-species genetics: top generation reached · mean body-size gene (watch evolution live)
      if (this.detEls && this.detEls[k]) this.detEls[k].textContent = c[k] ? `g${fmtInt(sd[k].maxGen)} · ${fmtNum(sd[k].gSize, 2)}×` : '';
    }
    set('stat-gen', fmtInt(w.maxGen)); set('stat-pop', total);
    // the live rate is ~30–240 steps/s (60 at 1×), so show the integer; "k" only if a fast machine ever runs that far ahead
    set('stat-sps', this.paused ? 'paused' : this.rate >= 1000 ? `${(this.rate / 1000).toFixed(1)}k steps/s` : `${Math.round(this.rate)} steps/s`);
    this.syncWeatherUI();

    set('env-clock', `${hh}:${mm}`); set('env-phase', phase); set('env-weather', env.weatherName());
    set('env-month', env.monthName()); set('env-season', env.seasonName()); set('env-year', 'Year ' + (Math.floor(env.year) + 1));
    set('env-temp', this.fmtTemp(env.tempC, 1)); set('env-o2', (w.avgO2() * 100 | 0) + '%');
    set('env-clarity', (Math.max(0, 1 - env.turbidity) * 100 | 0) + '%');
    // expanded water-chemistry detail (depth-resolved)
    const ed = w.envDetail();
    set('env-o2deep', (ed.o2Deep * 100 | 0) + '%');
    set('env-strat', (ed.strat * 100 | 0) + '%' + (ed.strat > 0.5 ? ' ⬍' : ''));
    set('env-ice', ed.ice > 0.01 ? (ed.ice * 100 | 0) + '%' : 'open');
    set('env-diatom', (ed.diatom * 100 | 0) + '%');
    set('env-birds', String(ed.birds));
    set('env-zoo', `${ed.daphnia} Daphnia · ${ed.copepods} copepods`);
    set('env-odo', `${ed.nymphs} nymphs · ${ed.dragonflies} flying`);
    set('env-frogs', `${ed.frogs} · ${ed.tadpoles} tadpoles`);
    set('env-turtles', String(ed.turtles));
    set('env-tempdeep', this.fmtTemp(ed.tempDeep, 1));
    set('env-nutrient', `N ${ed.nitrogen.toFixed(2)} · P ${ed.phosphate.toFixed(2)} (${ed.limiting}-lim)`);
    set('env-nitrate', (ed.nitrateFrac * 100 | 0) + '% NO₃');
    set('env-sedp', ed.sedP.toFixed(2));
    set('env-phyto', (ed.phyto * 100 | 0) + '%');
    set('env-cyano', (ed.cyano * 100 | 0) + '%' + (ed.cyano > 0.4 ? ' scum' : ''));
    set('env-dom', ed.dom.toFixed(2));
    set('env-secchi', (ed.secchi | 0) + 'px');
  }

  // the click-a-fish readout. Agent fields can come straight from an imported file (gen, eaten, …), so every value is
  // coerced to a number or HTML-escaped before it reaches innerHTML; the species colour goes through the CSSOM.
  _selection() {
    const w = this.world, selEl = $('sel'); if (!selEl) return;
    const sel = w.selectedId != null ? w.agents.find(a => a.id === w.selectedId) : null;
    if (!sel) { selEl.textContent = 'tap a fish to follow it and read its full detail — genes, niche, diet, condition'; return; }
    const esc = escapeHTML, pc = v => fmtInt(Math.round(Number(v) * 100)), sp = sel.sp, gn = sel.genes || [];
    const diet = Object.keys(sp.diet).filter(k => sp.diet[k]).join(', ');
    const stage = (sel.mature ? (sel.sex === 1 ? 'adult male' : 'adult female') : 'juvenile') + (sel.gon > 0 && sel.mature ? ' (ripening)' : '');
    const zone = sel.y > w.bedY(sel.x) * 0.7 ? 'profundal/benthic' : (sel.x < w.W * 0.30 || sel.x > w.W * 0.70) ? 'littoral' : 'pelagic';
    if (selEl.style && selEl.style.setProperty) selEl.style.setProperty('--sp', sp.tag);
    selEl.innerHTML =
      `<b class="spname">${esc(sp.name)}</b> · gen ${fmtInt(sel.gen)} · ${esc(stage)} · in the ${esc(zone)}<br>` +
      `<span class="seldim">genes</span> maturation size ${fmtNum(gn[0], 2)}× · speed ${fmtNum(gn[1], 2)}× · tolerance ${fmtNum(gn[2], 2)}×<br>` +
      `<span class="seldim">body</span> ${fmtNum(sel.L, 1)} cm · ${Number(sel.W) >= 100 ? fmtInt(sel.W) : fmtNum(sel.W, 1)} g · condition ${fmtNum(sel.K, 2)} · <span class="seldim">age</span> ${fmtNum(Number(sel.age) / TIME.YEAR_LEN, 1)} yr · <span class="seldim">feeding</span> ${pc(sel.pAvg || 0)}% of max<br>` +
      `<span class="seldim">niche</span> comfort ${esc(this.fmtTemp(sp.tempOpt - sel.tempTol, 0))}–${esc(this.fmtTemp(sp.tempOpt + sel.tempTol, 0))} · needs O₂≥${pc(sel.o2Crit)}% · <span class="seldim">diet</span> ${esc(diet)}<br>` +
      `<span class="seldim">right here</span> ${esc(this.fmtTemp(w.env.tempAt(sel.x, sel.y), 1))} · O₂ ${pc(w.oxygenAt(sel.x, sel.y))}%`;
  }

  // food web: the resource-base count strip + the fish trophic-biomass bars
  _foodweb(c) {
    const w = this.world, rc = w.resourceCounts(), resEl = $('reslist');
    if (resEl) resEl.innerHTML = [['zoo', rc.zooplankton], ['larvae', rc.larvae], ['insects', rc.insects], ['snails', rc.snails], ['crayfish', rc.crayfish], ['mussels', rc.mussels], ['detritus', rc.detritus], ['plants', rc.plants]]
      .map(([n, v]) => `<span class="res">${n}<b>${fmtInt(v)}</b></span>`).join('');
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
        for (const g of EVO_GENES) { const v = s[g], cell = e[g]; cell.textContent = fmtNum(v, 2); cell.classList.toggle('up', v > 1.04); cell.classList.toggle('dn', v < 0.96); }
        e.gen.textContent = 'g' + fmtInt(s.maxGen); e.imm.textContent = fmtInt(Math.round(s.immFrac * 100)) + '%';
      } else { for (const g of EVO_GENES) { e[g].textContent = '—'; e[g].classList.remove('up', 'dn'); } e.gen.textContent = '—'; e.imm.textContent = '—'; }
    }
  }

  // fleet-wide cognition: internal drives, the brain-gated action mix, recurrent-memory strength, contaminant burden
  _cognition() {
    const el = $('cog'); if (!el) return;
    const g = this.world.cognitionDetail();
    const cell = (label, val, cls) => `<div class="cg ${cls || ''}"><label>${label}</label><b>${val}</b></div>`;
    const pct = v => fmtInt(Math.round(Number(v) * 100)) + '%';
    let html = cell('hunger', fmtNum(g.meanHunger, 2)) + cell('fear', fmtNum(g.meanFear, 2)) + cell('memory', fmtNum(g.meanMemory, 2))
      + cell('striking', pct(g.pStrike), 'act') + cell('fleeing', pct(g.pFlee), 'act') + cell('hiding', pct(g.pHide), 'act');
    if (g.meanTox > 0.001) html += cell('contaminant', fmtNum(g.meanTox, 2));   // only when a pollution scenario is loaded (AMBIENT>0)
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
    fitCanvas(host, Wd, Hd, dpr);
    this.mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.renderer.drawMinimap(this.mctx, Wd, Hd);
  }

  _charts() {
    const ctx = this.cctx; if (!ctx) return;
    const host = this.chart, dpr = this.dpr;
    const r = host.getBoundingClientRect(), Wd = Math.max(220, r.width | 0), Hd = Math.max(120, r.height | 0);
    fitCanvas(host, Wd, Hd, dpr);
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
    fitCanvas(host, Wd, Hd, dpr);
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
