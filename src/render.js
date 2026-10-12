// render.js — browser-only canvas renderer. Draws the world through a Camera with
// culling, level-of-detail, and a lazily-built sprite cache. Not imported by the
// headless sim test (a separate DOM-stub smoke test exercises it).
import { WORLD, GRID, THERMAL, MACRO, bedY } from './config.js';
import { SP } from './species.js';
import { clamp, lerp, hsl, angDiff, TAU } from './core.js';
import { makePresenter } from './glpost.js';

const W = WORLD.W, H = WORLD.H, FLOOR = WORLD.FLOOR;
const FCOLS = GRID.FIELD_COLS, FROWS = GRID.FIELD_ROWS, CW = W / FCOLS, CH = H / FROWS;
const rgb = c => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
const FISH_SCALE = 2.0; // world px per fish-unit, times species size

const SKY_NIGHT = [10, 18, 42], SKY_DAY = [38, 120, 138], SKY_DUSK = [150, 78, 52];
const ABYSS = [2, 7, 13];
const LETTERBOX = [3, 6, 11];

// LOD thresholds, in on-screen fish-scale px
const DOT_PX = 1.5;     // below this a fish is a single tinted dot

// relative brightness by depth — bright near the sunlit surface, dimmer toward the dark deep.
// (Day/night is handled separately via env.light; this is the *depth* component, so a deep fish
// reads as deeper, not just nighttime-dark.) 1.0 at the surface → ~0.34 at the bed.
const depthDim = y => 0.34 + 0.66 * Math.exp(-1.9 * clamp(y / H, 0, 1));

// Largest world-space half-extent any fish sprite can occupy (zoom-independent, since the
// sprite scales with the same Sworld). Used as the cull margin so a big fish (pike) whose
// CENTRE is just off-screen still draws its on-screen snout/tail instead of popping. Derived
// from the same extents SpriteCache._build uses (extX/BASE = L+tail+3, extY/BASE = Hh*2.8+3.34).
const MAX_FISH_EXTENT = (() => {
  let m = 0;
  for (const k in SP) {
    const sp = SP[k], P = sp.P, Sworld = sp.size * FISH_SCALE;       // grow=1 (adult) is the worst case
    const ex = (P.L + (P.tail ? P.tail.len : 1.2) + 3) * Sworld, ey = (P.Hh * 2.8 + 3.34) * Sworld;
    m = Math.max(m, ex, ey);
  }
  return Math.ceil(m) + 2;
})();
// ---------------------------------------------------------------------------
//  sprite cache — render each organism once into an offscreen bitmap, keyed by
//  (species, growth bucket, hue bucket, light bucket, animation frame); blit it
//  with rotation/scale. The blit uses imageSmoothing (anti-aliased), so the high-res
//  sprite scales to a smooth, shaded look at any zoom for the cost of one drawImage.
// ---------------------------------------------------------------------------
class SpriteCache {
  constructor(mkCanvas) {
    this.mk = mkCanvas; this.map = new Map();
    this.BASE = 14;       // sprite px per fish-unit (internal sprite resolution), up from the old 6 so the
                          // anti-aliased blit (imageSmoothing on) has real sub-pixel detail to interpolate — the
                          // fish read as smooth, shaded bodies instead of blocky pixel art. The blit math self-
                          // adjusts via sprite.base, so on-screen size is unchanged; only fidelity rises.
                          // Paired with a finer draw step (species.js drawFish su floor) so the extra px carry real detail.
    // FRAMES: finer animation cycle (smoother, slower-looking tail beat). LIGHTS: more brightness
    // buckets so the day/night × depth shading reads as a smooth gradient, not banding.
    this.FRAMES = 10; this.HUES = 16; this.GROWS = 3; this.LIGHTS = 6; this.DRIVES = 3;   // DRIVES: undulation-effort buckets (glide/cruise/sprint)
    this.max = 1200;      // LRU cap — at BASE 14 each cached sprite is several× the pixels of the old BASE-6 one
                          // (~80-210KB), so the cap is trimmed to keep resident memory ~bounded (≲200MB worst case).
                          // The population clusters under selection, so few buckets (species×grow×hue×light×frame×morph×drive) are live at once.
    this.built = 0;
  }
  _key(spKey, gB, hB, lB, fr, mB, dB) { return spKey + gB + ':' + hB + ':' + lB + ':' + fr + ':' + mB + ':' + dB; }
  // heritable MORPHOLOGY bucketed coarsely (3 levels/gene → ≤27 combos; the population clusters under selection so
  // few are live at once, like the 16 hue buckets) so per-fish fin/eye/body shape can be sprite-cached. A genomeless
  // corpse (or an older genome) falls back to the mid (baseline) bucket 13.
  _morphBucket(a) { const g = a.genes; if (!g || g.length < 6) return 13; const q = x => x < 0.88 ? 0 : x > 1.12 ? 2 : 1; return q(g[3]) * 9 + q(g[4]) * 3 + q(g[5]); }
  _morphVal(mB) { const r = [0.82, 1.0, 1.22]; return { fin: r[(mB / 9 | 0) % 3], eye: r[(mB / 3 | 0) % 3], body: r[mB % 3] }; }
  // undulation effort bucketed to 3 levels → glide (barely undulates) / cruise / sprint (thrashes). The continuous
  // `drive` is computed per-fish in _fish() from its real speed + thrust + action state; here it picks the sprite.
  _driveVal(dB) { return [0.12, 0.5, 0.9][dB]; }
  get(a, frameVal, light, drive) {
    const sp = a.sp;
    const gB = clamp(Math.round((((a.grow ?? 1) - 0.35) / 0.65) * (this.GROWS - 1)), 0, this.GROWS - 1);
    const hB = (((Math.round(a.hue / (360 / this.HUES))) % this.HUES) + this.HUES) % this.HUES;
    const lB = clamp(Math.round(light * (this.LIGHTS - 1)), 0, this.LIGHTS - 1);
    const fr = ((frameVal % this.FRAMES) + this.FRAMES) % this.FRAMES;
    const mB = this._morphBucket(a);
    const dB = clamp(Math.round((drive ?? 0.45) * (this.DRIVES - 1)), 0, this.DRIVES - 1);
    const k = this._key(sp.key, gB, hB, lB, fr, mB, dB);
    let s = this.map.get(k);
    if (s) { this.map.delete(k); this.map.set(k, s); return s; }   // LRU touch
    s = this._build(sp, gB, hB, lB, fr, mB, dB);
    this.map.set(k, s);
    if (this.map.size > this.max) { const first = this.map.keys().next().value; this.map.delete(first); }
    return s;
  }
  _build(sp, gB, hB, lB, fr, mB, dB) {
    const BASE = this.BASE;
    const grow = 0.35 + 0.65 * (gB / (this.GROWS - 1));
    const hue = hB * (360 / this.HUES) + (360 / this.HUES) / 2;
    const light = 0.12 + 0.88 * (lB / (this.LIGHTS - 1));
    const morph = this._morphVal(mB);
    const P = sp.P, L = P.L, Hh = P.Hh * morph.body, tlen = (P.tail ? P.tail.len : 1.2) * morph.fin;   // size the canvas for the evolved depth & fins
    // generous bounds so wave/dorsal/tail never clip
    const extX = (L + tlen + 2) * BASE + 6, extY = (Hh * 2.8 + 2) * BASE + 8;
    const w = Math.max(2, Math.ceil(extX * 2)), h = Math.max(2, Math.ceil(extY * 2));
    const cnv = this.mk(w, h), g = cnv.getContext('2d');
    if (g.imageSmoothingEnabled !== undefined) g.imageSmoothingEnabled = true;
    const cx = w / 2, cy = h / 2;
    // soft texel "dab": the draw step (su≈0.07 fish-units) lands texels ~1 sprite-px apart, so a 1px dab could
    // leave a faint stippled grid. A ≥2px dab makes neighbouring texels overlap into solid, smoothly-shaded
    // coverage; combined with the anti-aliased blit the body has no hard pixel edges.
    const DAB = Math.max(2, Math.round(0.1 * BASE));
    const put = (u, v, col, al) => { g.globalAlpha = al; g.fillStyle = rgb(col); g.fillRect(Math.round(cx + u * BASE), Math.round(cy + v * BASE), DAB, DAB); };
    const fake = { hue, energy: sp.reproEnergy * 0.82, grow, spd: 0, id: 0, thrustSmooth: 0.45 };
    const o = { scale: BASE, beat: (fr / this.FRAMES) * TAU, drive: this._driveVal(dB), morph };   // undulation amplitude scales with effort
    sp.draw(fake, put, 0, { light }, o);
    // VOLUMETRIC SHEEN — a top-lit dorsal highlight fading to a ventral shade, applied ONLY over the drawn body
    // ('source-atop' composites just where the sprite is already opaque). Turns the flat texel fill into a lit,
    // rounded 3-D body for the cost of one gradient rect per cached sprite. Top of the canvas = the fish's back.
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-atop';
    const sg = g.createLinearGradient(0, 0, 0, h);
    sg.addColorStop(0, 'rgba(255,255,255,0.17)'); sg.addColorStop(0.4, 'rgba(255,255,255,0)'); sg.addColorStop(1, 'rgba(0,12,24,0.22)');
    g.fillStyle = sg; g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = 'source-over';
    this.built++;
    return { canvas: cnv, cx, cy, base: BASE };
  }
  clear() { this.map.clear(); }
}

export class Renderer {
  constructor(canvas, world, camera) {
    this.world = world; this.canvas = canvas; this.camera = camera;
    this.mkCanvas = (w, h) => { const c = (canvas.ownerDocument || (typeof document !== 'undefined' ? document : null)).createElement('canvas'); c.width = w; c.height = h; return c; };
    // GRAPHICS Pass 3: the whole 2D scene is drawn to an OFFSCREEN canvas; a feature-detected WebGL2 presenter
    // (glpost.js) composites it to the visible #tank through GPU shaders (HDR bloom / filmic tonemap / underwater
    // refraction / chromatic aberration / fake DOF / grain / day-night grade / vignette). When real WebGL2 is absent
    // (the headless smoke stub, or a browser without it) makePresenter returns a Canvas2D blit presenter and the 2D
    // path keeps applying its own bloom/grade/vignette — byte-identical to before. A canvas has ONE context type, so
    // the scene MUST be an offscreen canvas: #tank is owned by the presenter (WebGL2, or 2D in fallback).
    this.scene = this.mkCanvas(2, 2);
    this.ctx = this.scene.getContext('2d');
    // Smooth, anti-aliased sprite blits (the de-pixelation): drawImage now interpolates the high-res sprites
    // instead of nearest-neighbour upscaling them into blocks. Only affects drawImage (fish/corpses); fillRect
    // dots, field overlays and the minimap are unaffected.
    this.ctx.imageSmoothingEnabled = true; this.ctx.imageSmoothingQuality = 'high';
    this.present = makePresenter(canvas, this.mkCanvas);
    this.postInGL = !!(this.present && this.present.gl);   // GL applies bloom/grade/vignette → the 2D path skips them (no double-post)
    this.glFish = !!(this.present && this.present.gl && this.present.fishReady);   // Pass 3/slice 3: fish drawn as lit GL quads (else 2D)
    this.sprites = new SpriteCache(this.mkCanvas);
    this.opts = { oxygen: false, temp: false, phyto: false, vision: true, perf: false };
    this.dpr = Math.min((typeof window !== 'undefined' && window.devicePixelRatio) || 1, 2);
    this.stars = Array.from({ length: Math.round(W * 0.05) }, () => ({ x: Math.random() * W, y: Math.random() * (FLOOR * 0.6), s: Math.random() }));
    // suspended particulates ("marine snow") — drifting motes that give the water body depth & life. World-anchored,
    // animated purely from the render clock (NEVER core.rand → no sim desync). Position is a stateless function of t
    // (initial pos + slow sink + sway), so it's frame-rate independent and needs no per-frame mutation.
    this.motes = Array.from({ length: Math.round(W * 0.06) }, () => ({
      x: Math.random() * W, y0: Math.random() * H, r: 0.5 + Math.random() * 1.6,
      spd: 2 + Math.random() * 7, swayA: 4 + Math.random() * 14, swayF: 0.1 + Math.random() * 0.4,
      ph: Math.random() * TAU, br: 0.25 + Math.random() * 0.6,
    }));
    // caustic cells — a sparse set of surface light-dapples that ripple over the top of the water column (day only).
    this.caustics = Array.from({ length: 26 }, (_, i) => ({
      x: (i / 26) * W + Math.random() * (W / 26), w: 60 + Math.random() * 140,
      f: 0.25 + Math.random() * 0.5, ph: Math.random() * TAU, depth: 0.12 + Math.random() * 0.16,
    }));
    // rising bubbles — sparse marsh/decay gas threading up the water column. Same stateless-clock animation as the
    // motes (rises + sways, wraps), never `core.rand`. Brighter near the surface; drawn as a ring + a tiny highlight.
    this.bubbles = Array.from({ length: Math.round(W * 0.022) }, () => ({
      x: Math.random() * W, y0: Math.random() * H, r: 0.8 + Math.random() * 2.2,
      spd: 14 + Math.random() * 26, swayA: 2 + Math.random() * 7, swayF: 0.4 + Math.random() * 1.0, ph: Math.random() * TAU,
    }));
    this.stats = { total: 0, drawn: 0, sprites: 0, dots: 0, simMs: 0, fps: 0 };
    this.resize();
  }

  resize() {
    const c = this.canvas;
    const cw = c.clientWidth || c.width || 1280, ch = c.clientHeight || c.height || 720;
    const bw = Math.max(1, Math.round(cw * this.dpr)), bh = Math.max(1, Math.round(ch * this.dpr));
    if (c.width !== bw || c.height !== bh) { c.width = bw; c.height = bh; }
    if (this.scene.width !== bw || this.scene.height !== bh) { this.scene.width = bw; this.scene.height = bh; }   // offscreen scene tracks the backing
    this.ctx.imageSmoothingEnabled = true; this.ctx.imageSmoothingQuality = 'high';   // re-assert: resizing a canvas resets its 2D ctx state
    if (this.present && this.present.resize) this.present.resize(bw, bh);
    this.camera.setViewport(bw, bh);
  }

  // map a pointer event to the nearest agent id (screen-space pick through the camera)
  pickAt(ev) {
    const r = this.canvas.getBoundingClientRect();
    const sx = (ev.clientX - r.left) / r.width * this.canvas.width;
    const sy = (ev.clientY - r.top) / r.height * this.canvas.height;
    const wpt = this.camera.screenToWorld(sx, sy);
    const pickR = 14 / this.camera.zoom;                 // ~14 screen px tolerance, in world units
    let best = null, bd = pickR * pickR;
    for (const a of this.world.agents) {
      const rad = (4 + a.size * 3 * (0.6 + 0.4 * (a.grow ?? 1)));
      const dx = a.x - wpt.x, dy = a.y - wpt.y, d = dx * dx + dy * dy;
      const tol = Math.max(bd, rad * rad);
      if (d < tol && d < bd) { bd = d; best = a; }
    }
    // second pass that also accepts the fish's own body radius even if > pickR
    if (!best) {
      let bb = Infinity;
      for (const a of this.world.agents) {
        const rad = (5 + a.size * 3 * (0.6 + 0.4 * (a.grow ?? 1)));
        const dx = a.x - wpt.x, dy = a.y - wpt.y, d = dx * dx + dy * dy;
        if (d < rad * rad && d < bb) { bb = d; best = a; }
      }
    }
    return best ? best.id : null;
  }

  skyTop(env) {
    const c = [lerp(SKY_NIGHT[0], SKY_DAY[0], env.light), lerp(SKY_NIGHT[1], SKY_DAY[1], env.light), lerp(SKY_NIGHT[2], SKY_DAY[2], env.light)];
    const dawn = Math.max(0, 1 - Math.abs(env.t - 0.25) / 0.07), dusk = Math.max(0, 1 - Math.abs(env.t - 0.75) / 0.07);
    const warm = Math.max(dawn, dusk) * (1 - env.light * 0.5);
    return [lerp(c[0], SKY_DUSK[0], warm), lerp(c[1], SKY_DUSK[1], warm), lerp(c[2], SKY_DUSK[2], warm)];
  }

  draw(t) {
    const ctx = this.ctx, world = this.world, env = world.env, cam = this.camera;
    this._rdt = this._lastT === undefined ? 1 / 60 : clamp(t - this._lastT, 0, 0.1); this._lastT = t;
    // GL applies bloom/grade/vignette? Re-read each frame so a mid-run WebGL context loss re-enables the 2D post.
    this.postInGL = !!(this.present && this.present.gl && !this.present.failed);
    // GL draws fish as lit quads? Re-read each frame so a context loss / fish-path failure reverts to the 2D fish.
    this.glFish = !!(this.present && this.present.gl && !this.present.failed && !this.present.lost && this.present.fishReady && !this.present.fishFailed);
    this._glLiving = this.glFish ? [] : null; this._glCorpse = this.glFish ? [] : null;   // per-frame GL fish/corpse quad collectors
    const vw = this.scene.width, vh = this.scene.height, z = cam.zoom;
    const amb = 0.25 + 0.75 * env.light;
    const top = this.skyTop(env);
    // seasonal tint: greener/warmer in summer, cooler/bluer in winter
    const summer = Math.sin((env.year || 0) * TAU), warm = Math.max(0, summer), cold = Math.max(0, -summer);
    top[0] = clamp(top[0] + 12 * warm - 6 * cold, 0, 255); top[1] = clamp(top[1] + 9 * warm + 2 * cold, 0, 255); top[2] = clamp(top[2] - 9 * warm + 13 * cold, 0, 255);
    // turbidity murk: blend the water toward a green-brown soup as it clouds up
    const murk = (env.turbidity || 0) * 0.6;
    top[0] = lerp(top[0], 64, murk); top[1] = lerp(top[1], 86, murk); top[2] = lerp(top[2], 52, murk);
    const vr = cam.visibleRect();
    const w2s = (x, y) => cam.worldToScreen(x, y);

    // letterbox / out-of-world
    ctx.globalAlpha = 1; ctx.fillStyle = rgb(LETTERBOX); ctx.fillRect(0, 0, vw, vh);

    // world box on screen
    const tl = w2s(0, 0), br = w2s(W, H);
    const bx = tl.x, by = tl.y, bw = br.x - tl.x, bh = br.y - tl.y;

    // water column gradient (sunlit surface → surface → mid → abyss), clipped to the world box.
    // A bright sunlit band up top and a steeper ramp into the dark deep give a strong sense of depth.
    const surf = [lerp(top[0], 255, 0.10 * env.light), lerp(top[1], 255, 0.12 * env.light), lerp(top[2], 255, 0.10 * env.light)];
    const mid = [lerp(ABYSS[0], top[0], amb * 0.32), lerp(ABYSS[1], top[1], amb * 0.36), lerp(ABYSS[2], top[2], amb * 0.42)];
    const g = ctx.createLinearGradient(0, by, 0, br.y);
    g.addColorStop(0, rgb(surf));
    g.addColorStop(0.16, rgb(top));
    g.addColorStop(0.52, rgb(mid));
    g.addColorStop(1, rgb(ABYSS));
    ctx.fillStyle = g; ctx.fillRect(bx, by, bw, bh);

    // stars at night (world-anchored)
    if (env.light < 0.32) {
      const a = (0.32 - env.light) / 0.32;
      ctx.fillStyle = '#cfe0ff';
      for (const s of this.stars) {
        if (s.x < vr.x0 || s.x > vr.x1 || s.y < vr.y0 || s.y > vr.y1) continue;
        const p = w2s(s.x, s.y);
        ctx.globalAlpha = a * (0.3 + s.s * 0.7) * (0.6 + 0.4 * Math.sin(t * 2 + s.x));
        ctx.fillRect(p.x | 0, p.y | 0, Math.max(1, z * 0.5) | 0 || 1, Math.max(1, z * 0.5) | 0 || 1);
      }
      ctx.globalAlpha = 1;
    }

    // sun / moon
    const sunX = (env.t * W * 1.6 - W * 0.3 + W) % W, sunY = 26 + Math.sin(env.t * Math.PI) * -14;
    const sp = w2s(sunX, Math.max(8, sunY));
    if (env.light > 0.06) { ctx.globalAlpha = 0.5 * env.light; ctx.fillStyle = '#ffe2a8'; disc(ctx, sp.x, sp.y, 6 * z); }
    else { const mp = w2s(W * 0.8, 22); ctx.globalAlpha = 0.5; ctx.fillStyle = '#d8e6ff'; disc(ctx, mp.x, mp.y, 5 * z); }
    ctx.globalAlpha = 1;

    // light shafts / godrays (day) — soft sunbeams that FADE OUT with depth (reach ~ the photic zone / Secchi
    // depth), not full-height lines. ADDITIVE ('lighter') blending so overlapping beams glow instead of darkening;
    // each beam has its own slow sway + brightness pulse. Cosmetic only; animation uses real time, never the sim RNG.
    if (!this.postInGL && env.light > 0.12) {   // Pass 3/slice 2: GL draws richer volumetric god-rays → skip the 2D polygons (no double)
      const reach = clamp(env.secchiDepth() * 0.95, H * 0.25, H * 0.66);     // shorter in murky water
      const surfY = w2s(0, 0).y, reachY = w2s(0, reach).y;
      const prevOp = ctx.globalCompositeOperation; ctx.globalCompositeOperation = 'lighter';
      const spacing = 190;
      for (let x = Math.floor(vr.x0 / spacing) * spacing; x < vr.x1 + spacing; x += spacing) {
        const sway = Math.sin(t * 0.18 + x * 0.006) * 26;                    // gentle drift
        const beam = 0.04 + 0.032 * (0.5 + 0.5 * Math.sin(t * 0.5 + x * 0.013)), a = env.light * beam;
        const lg = ctx.createLinearGradient(0, surfY, 0, reachY);
        lg.addColorStop(0, `rgba(198,236,255,${a})`); lg.addColorStop(0.6, `rgba(168,222,255,${a * 0.5})`); lg.addColorStop(1, 'rgba(168,222,255,0)');
        ctx.fillStyle = lg;
        const topW = 16 + 20 * (0.5 + 0.5 * Math.sin(x)), botW = topW * 2.8;
        const a0 = w2s(x + sway, 0), a1 = w2s(x + sway + topW, 0);
        const b0 = w2s(x + sway + botW + 48, reach), b1 = w2s(x + sway + 48, reach);
        ctx.beginPath(); ctx.moveTo(a0.x, a0.y); ctx.lineTo(a1.x, a1.y); ctx.lineTo(b0.x, b0.y); ctx.lineTo(b1.x, b1.y); ctx.closePath(); ctx.fill();
      }
      ctx.globalCompositeOperation = prevOp;
      ctx.globalAlpha = 1;
    }

    // surface caustics — rippling bright dapples just under the surface (day). Additive soft radial gradients that
    // animate from the render clock and fade with depth, light & clarity. Cosmetic; never the seeded sim RNG.
    if (!this.postInGL && env.light > 0.18) {   // Pass 3/slice 2: GL draws richer caustics when active
      const prevOp = ctx.globalCompositeOperation; ctx.globalCompositeOperation = 'lighter';
      const clar = env.clarity ? env.clarity() : 1;
      for (const cc of this.caustics) {
        if (cc.x < vr.x0 - cc.w || cc.x > vr.x1 + cc.w) continue;
        const wob = 0.5 + 0.5 * Math.sin(t * cc.f + cc.ph), drift = Math.sin(t * cc.f * 0.6 + cc.ph) * 40;
        const p = w2s(cc.x + drift, H * cc.depth), rad = cc.w * z * 0.5;
        if (rad < 1.5) continue;
        const a = env.light * clar * (0.045 + 0.09 * wob);
        const rg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad);
        rg.addColorStop(0, `rgba(212,240,255,${a})`); rg.addColorStop(1, 'rgba(212,240,255,0)');
        ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(p.x, p.y, rad, 0, TAU); ctx.fill();
      }
      ctx.globalCompositeOperation = prevOp;
      ctx.globalAlpha = 1;
    }

    // cyanobacteria surface scum — a buoyant blue-green mat hugging the water surface where it has bloomed.
    // Per-column opacity & thickness track the top-row cyano density; cosmetic (real-time sway, never sim RNG).
    if (env.cyano && env.meanCyano() > 0.04) {
      const sx0 = clamp((vr.x0 / CW) | 0, 0, FCOLS - 1), sx1 = clamp((vr.x1 / CW) | 0, 0, FCOLS - 1);
      for (let cx = sx0; cx <= sx1; cx++) {
        const d = Math.max(env.cyano[cx], env.cyano[FCOLS + cx] * 0.6);   // top two rows
        if (d < 0.06) continue;
        const wave = Math.sin(t * 0.5 + cx * 0.7) * 3, thick = 6 + 34 * Math.min(d, 1);
        const a = clamp(d * 0.8, 0, 0.62) * (0.5 + 0.5 * amb);            // dim with ambient light
        const p0 = w2s(cx * CW, 1 + wave), p1 = w2s((cx + 1) * CW, 1 + wave + thick);
        const sg = ctx.createLinearGradient(0, p0.y, 0, p1.y);
        sg.addColorStop(0, `rgba(120,200,120,${a})`);                    // blue-green scum, densest at the very surface
        sg.addColorStop(1, 'rgba(86,150,96,0)');
        ctx.fillStyle = sg; ctx.fillRect(p0.x, p0.y, (p1.x - p0.x) + 1, p1.y - p0.y);
      }
      ctx.globalAlpha = 1;
    }

    // oxygen / temperature / phytoplankton field overlays (visible cells only)
    if (this.opts.oxygen || this.opts.temp || this.opts.phyto) {
      const cx0 = clamp((vr.x0 / CW) | 0, 0, FCOLS - 1), cx1 = clamp((vr.x1 / CW) | 0, 0, FCOLS - 1);
      const cy0 = clamp((vr.y0 / CH) | 0, 0, FROWS - 1), cy1 = clamp((vr.y1 / CH) | 0, 0, FROWS - 1);
      ctx.globalAlpha = 0.30;
      for (let cy = cy0; cy <= cy1; cy++) for (let cx = cx0; cx <= cx1; cx++) {
        const i = cy * FCOLS + cx, wx = (cx + 0.5) * CW, wy = (cy + 0.5) * CH, p = w2s(cx * CW, cy * CH);
        const col = this.opts.temp ? tempColor(env.tempAt(wx, wy)) : this.opts.phyto ? phytoColor(env.phyto[i]) : o2color(env.o2[i]);
        ctx.fillStyle = rgb(col); ctx.fillRect(p.x, p.y, CW * z + 1, CH * z + 1);
      }
      ctx.globalAlpha = 1;
    }

    // the lake bed — a curved basin; earth fills below bedY(x)
    {
      const x0 = Math.max(0, vr.x0), x1 = Math.min(W, vr.x1);
      if (x1 > x0) {
        const stepW = Math.max(5, (x1 - x0) / 150), pts = [];
        let topBedY = Infinity;
        for (let wx = x0; wx <= x1 + 1e-3; wx += stepW) { const p = w2s(wx, bedY(wx)); pts.push(p); if (p.y < topBedY) topBedY = p.y; }
        const sg = ctx.createLinearGradient(0, topBedY, 0, br.y);
        sg.addColorStop(0, rgb([lerp(20, 46, amb), lerp(16, 34, amb), lerp(12, 22, amb)]));
        sg.addColorStop(1, rgb([8, 6, 5]));
        ctx.fillStyle = sg;
        ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
        ctx.lineTo(pts[pts.length - 1].x, br.y + 2); ctx.lineTo(pts[0].x, br.y + 2); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = `rgba(120,96,64,${0.5 * amb})`; ctx.lineWidth = Math.max(1, z * 1.1);
        ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y); ctx.stroke();
        ctx.globalAlpha = 0.5 * amb; ctx.fillStyle = '#3a2c1e';
        for (let i = 0; i < 160; i++) { const wx = (i * 131) % W; if (wx < x0 || wx > x1) continue; const p = w2s(wx, bedY(wx) + 2 + (i % 4)); ctx.fillRect(p.x, p.y, Math.max(1, 2 * z), Math.max(1, z)); }
        ctx.globalAlpha = 1;
      }
    }

    // submerged logs lying on the bed (cover for prey)
    if (world.logs) {
      ctx.strokeStyle = `rgba(${lerp(40, 96, amb) | 0},${lerp(28, 66, amb) | 0},${lerp(18, 40, amb) | 0},1)`;
      ctx.lineCap = 'round';
      for (const lg of world.logs) {
        if (lg.x < vr.x0 - 60 || lg.x > vr.x1 + 60) continue;
        const a0 = w2s(lg.x - Math.cos(lg.ang) * lg.len / 2, lg.y - Math.sin(lg.ang) * lg.len / 2);
        const b0 = w2s(lg.x + Math.cos(lg.ang) * lg.len / 2, lg.y + Math.sin(lg.ang) * lg.len / 2);
        ctx.lineWidth = Math.max(1.5, 5 * z); ctx.beginPath(); ctx.moveTo(a0.x, a0.y); ctx.lineTo(b0.x, b0.y); ctx.stroke();
      }
    }
    // round, smooth strokes for all the flora below (reeds / weed beds / macrophytes) — no hard mitred corners or
    // square stalk-tips, so the vegetation reads as soft fronds instead of blocky lines.
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // mussel beds on the bed (filter feeders)
    if (world.mussels) {
      for (const m of world.mussels) {
        if (m.x < vr.x0 - 30 || m.x > vr.x1 + 30) continue;
        for (let k = 0; k < m.n; k++) {
          const p = w2s(m.x + (k - m.n / 2) * 2.4, m.y - (k % 2));
          ctx.fillStyle = `rgba(${lerp(30, 60, amb) | 0},${lerp(34, 58, amb) | 0},${lerp(40, 64, amb) | 0},1)`;
          ctx.fillRect(p.x, p.y, Math.max(1, 2.2 * z), Math.max(1, 1.6 * z));
        }
      }
    }
    // reed clumps on the shallow shores (cover)
    if (world.reeds) {
      for (const r of world.reeds) {
        if (r.x < vr.x0 - 40 || r.x > vr.x1 + 40) continue;
        const light = clamp(0.28 + 0.5 * amb, 0, 0.85);
        ctx.strokeStyle = `hsl(95 38% ${light * 100}%)`; ctx.lineWidth = Math.max(1, 1.4 * z);
        for (let b = 0; b < r.n; b++) {
          const bx = r.x + (b - r.n / 2) * 2.2, h = r.height * (0.7 + 0.3 * ((b * 7) % 5) / 5);
          const sway = Math.sin(t * 1.1 + r.x * 0.05 + b) * 4;
          const base = w2s(bx, r.baseY), tip = w2s(bx + sway, r.baseY - h);
          ctx.beginPath(); ctx.moveTo(base.x, base.y); ctx.lineTo(tip.x, tip.y); ctx.stroke();
        }
      }
    }
    // submerged weed beds — tall macrophyte cover bands reaching up into mid-water (pike/sunfish habitat)
    if (world.weedbeds) {
      ctx.globalAlpha = 0.82;                                  // soft translucent layering → a frond clump, not a wall of bars
      for (const wb of world.weedbeds) {
        if (wb.x < vr.x0 - wb.w - 20 || wb.x > vr.x1 + wb.w + 20) continue;
        const dim = depthDim((wb.top + wb.bot) * 0.5), light = clamp((0.26 + 0.42 * amb) * (0.55 + 0.45 * dim), 0, 0.72);
        // many thin blades instead of a few fat strokes; width capped low so a zoomed-in bed reads as grass, not slabs
        const strands = clamp((wb.w / 5) | 0, 9, 20);
        ctx.lineWidth = clamp(0.85 * z, 1, 3.2);
        for (let s = 0; s < strands; s++) {
          const sx = wb.x + (s - strands / 2) * (wb.w * 2 / strands), segs = 6;
          ctx.strokeStyle = `hsl(${128 + (s % 5) * 3} 44% ${(light * (0.86 + 0.14 * ((s * 7) % 5) / 5)) * 100}%)`;   // faint blade-to-blade hue/shade variation
          let prev = w2s(sx, wb.bot); ctx.beginPath(); ctx.moveTo(prev.x, prev.y);
          for (let k = 1; k <= segs; k++) {
            const f = k / segs, ny = wb.bot - (wb.bot - wb.top) * f, nx = sx + Math.sin(t * 0.9 + wb.x * 0.04 + s + f * 2) * f * (7 + (s % 3) * 2);
            const cur = w2s(nx, ny); ctx.lineTo(cur.x, cur.y);
          }
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    }

    // plants — per-variety swaying macrophytes (culled to visible x range): stalks (pondweed/milfoil),
    // floating-leaved pads (lily), and low benthic tufts (chara/muskgrass) — each its own form & hue.
    const padX = 60;
    for (const p of world.plants) {
      if (p.x < vr.x0 - padX || p.x > vr.x1 + padX) continue;
      const mv = MACRO[p.v] || MACRO[0], hgtF = p.height / p.maxHeight;
      const hue = p.hue != null ? p.hue : mv.hue, form = p.form || mv.form, leafF = p.leaf || 1;   // per-plant evolved colour / form / leaf-area
      const pdim = 0.55 + 0.45 * depthDim(p.baseY - p.height * 0.5);   // deep weeds are darker
      const llight = clamp((0.30 + 0.55 * amb + 0.1 * hgtF) * pdim, 0, 0.9);
      ctx.strokeStyle = `hsl(${hue} ${form === 'mat' ? 30 : 45}% ${llight * 100}%)`;
      ctx.lineWidth = clamp((p.height / 26) * z, 0.6, 6);
      if (form === 'mat') {
        // low benthic mat (chara): a few short tufts hugging the bed
        for (let s = 0; s < 4; s++) {
          const bx = p.x + (s - 1.5) * 3, base = w2s(bx, p.baseY);
          const tip = w2s(bx + Math.sin(t + p.x * 0.1 + s) * 2, p.baseY - p.height * (0.55 + 0.45 * ((s * 3) % 4) / 4));
          ctx.beginPath(); ctx.moveTo(base.x, base.y); ctx.lineTo(tip.x, tip.y); ctx.stroke();
        }
        continue;
      }
      const segs = Math.max(2, (p.height / 6) | 0);
      let prev = w2s(p.x, p.baseY); ctx.beginPath(); ctx.moveTo(prev.x, prev.y);
      for (let s = 1; s <= segs; s++) {
        const f = s / segs, ny = p.baseY - p.height * f, nx = p.x + Math.sin(t * 1.3 + p.x * 0.1 + f * 2) * f * f * 6;
        const cur = w2s(nx, ny); ctx.lineTo(cur.x, cur.y);
        if (form === 'stalk' && s % 2 === 0) { const leaf = w2s(nx + (s % 4 ? 4 : -4) * leafF, ny + 2); ctx.lineTo(leaf.x, leaf.y); ctx.moveTo(cur.x, cur.y); }
      }
      ctx.stroke();
      if (form === 'pad') {
        // floating-leaved lily: a broad leaf pad at the top of the stalk (pad size scales with the evolved leaf gene)
        const tx = p.x + Math.sin(t * 1.3 + p.x * 0.1 + 2) * 6, topW = w2s(tx, p.baseY - p.height), r = clamp(p.height * 0.24 * leafF * z, 1.5, 13);
        ctx.fillStyle = `hsl(${hue} 50% ${llight * 100}%)`; ctx.beginPath(); ctx.ellipse(topW.x, topW.y, r, r * 0.42, 0, 0, TAU); ctx.fill();
      }
    }

    // suspended particulates ("marine snow") — drifting motes through the water column that give the lake body &
    // depth. Position is a stateless function of the render clock (slow sink + sway), wrapped vertically; culled to
    // the visible rect and never drawn through the bed. Dimmer in the deep / murk. Cosmetic; never the seeded sim RNG.
    {
      const clar = env.clarity ? env.clarity() : 1, amb2 = 0.3 + 0.7 * env.light;
      ctx.fillStyle = '#d2e8f0';
      for (const m of this.motes) {
        if (m.r * z * 0.5 < 0.4) continue;        // sub-pixel at this zoom → skip (invisible; saves arcs at whole-lake)
        const y = (m.y0 + t * m.spd) % H, x = m.x + Math.sin(t * m.swayF + m.ph) * m.swayA;
        if (x < vr.x0 || x > vr.x1 || y < vr.y0 || y > vr.y1 || y > bedY(x)) continue;
        const p = w2s(x, y), rr = Math.max(0.6, m.r * z * 0.5);
        ctx.globalAlpha = clamp(m.br * 0.5 * amb2 * clar * depthDim(y), 0, 0.7);
        ctx.beginPath(); ctx.arc(p.x, p.y, rr, 0, TAU); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // rising bubbles — threads of gas drifting up the column (stateless clock animation; wraps; never the sim RNG).
    {
      ctx.strokeStyle = 'rgba(205,238,252,0.6)'; ctx.fillStyle = 'rgba(238,250,255,0.7)'; ctx.lineWidth = Math.max(1, 0.55 * z);
      for (const b of this.bubbles) {
        if (b.r * z * 0.5 < 0.5) continue;        // sub-pixel at this zoom → skip
        const y = ((b.y0 - t * b.spd) % H + H) % H, x = b.x + Math.sin(t * b.swayF + b.ph) * b.swayA;
        if (x < vr.x0 || x > vr.x1 || y < vr.y0 || y > vr.y1 || y > bedY(x)) continue;
        const p = w2s(x, y), rr = Math.max(0.8, b.r * z * 0.5), a = clamp((0.18 + 0.5 * (1 - y / H)) * (0.4 + 0.6 * env.light), 0, 0.7);
        ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(p.x, p.y, rr, 0, TAU); ctx.stroke();
        ctx.globalAlpha = a * 0.85; ctx.beginPath(); ctx.arc(p.x - rr * 0.32, p.y - rr * 0.32, Math.max(0.5, rr * 0.3), 0, TAU); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // plankton & detritus (culled)
    const pPx = clamp(z, 1, 3);
    ctx.fillStyle = '#bff0d8';
    for (const p of world.plankton) {
      if (p.x < vr.x0 || p.x > vr.x1 || p.y < vr.y0 || p.y > vr.y1) continue;
      const s = w2s(p.x, p.y); ctx.globalAlpha = 0.25 + 0.55 * env.light; ctx.fillRect(s.x | 0, s.y | 0, pPx, pPx);
    }
    ctx.globalAlpha = 0.6; ctx.fillStyle = '#6b4a2a';
    for (const d of world.detritus) {
      if (d.x < vr.x0 || d.x > vr.x1 || d.y < vr.y0 || d.y > vr.y1) continue;
      const s = w2s(d.x, d.y); ctx.fillRect(s.x | 0, s.y | 0, pPx, pPx);
    }
    // benthic insect larvae — small specks on the bed, a touch brighter/greener as they near emergence
    if (world.larvae) { ctx.globalAlpha = 0.7;
      for (const L of world.larvae) {
        if (L.x < vr.x0 || L.x > vr.x1 || L.y < vr.y0 || L.y > vr.y1) continue;
        const s = w2s(L.x, L.y); ctx.fillStyle = L.dev > 0.7 ? '#a89a44' : '#6f7a3c'; ctx.fillRect(s.x | 0, s.y | 0, pPx, pPx);
      }
    }
    // emerged surface insects — pale drifting specks at the waterline that flutter (a visible hatch); fade as they age
    if (world.insects) { ctx.fillStyle = '#ece6c4';
      for (const I of world.insects) {
        if (I.x < vr.x0 || I.x > vr.x1) continue;
        const fy = I.y + Math.sin(t * 9 + I.wob) * 1.3;
        if (fy < vr.y0 || fy > vr.y1) continue;
        const s = w2s(I.x, fy); ctx.globalAlpha = (0.45 + 0.5 * env.light) * clamp(I.life / 2, 0.3, 1);
        ctx.fillRect(s.x | 0, s.y | 0, Math.max(1, pPx), Math.max(1, pPx));
      }
    }
    // benthic snails — tiny shells crawling the lit bed (olive-tan domes; dim with depth)
    if (world.snails) {
      ctx.globalAlpha = 0.85;
      for (const sn of world.snails) {
        if (sn.x < vr.x0 - 6 || sn.x > vr.x1 + 6 || sn.y < vr.y0 - 6 || sn.y > vr.y1 + 6) continue;
        const p = w2s(sn.x, sn.y), dim = 0.5 + 0.5 * depthDim(sn.y), r = clamp(1.7 * z, 1, 5);
        ctx.fillStyle = `hsl(50 32% ${Math.round(lerp(26, 48, amb) * dim)}%)`;
        ctx.beginPath(); ctx.ellipse(p.x, p.y - r * 0.5, r, r * 0.85, 0, 0, TAU); ctx.fill();
      }
    }
    // benthic crayfish — rusty omnivores on the bed; legs/claws wiggle. Far: a rust blob. Near: a little body + claws + tail.
    if (world.cray) {
      for (const cf of world.cray) {
        if (cf.x < vr.x0 - 16 || cf.x > vr.x1 + 16 || cf.y < vr.y0 - 16 || cf.y > vr.y1 + 16) continue;
        const p = w2s(cf.x, cf.y), dim = 0.55 + 0.45 * depthDim(cf.y), col = `hsl(14 52% ${Math.round(lerp(30, 50, amb) * dim)}%)`;
        ctx.globalAlpha = 0.95; ctx.fillStyle = col; ctx.strokeStyle = col;
        if (z < 1.4) { const L = clamp(z, 0.8, 4); ctx.fillRect(p.x - L, p.y - L * 1.3, L * 2, L * 1.3); continue; }   // far: a small rust blob
        const dir = cf.vx >= 0 ? 1 : -1, by = p.y - 1.6 * z, wig = Math.sin(t * 5 + cf.ph) * 0.9 * z;
        ctx.lineWidth = Math.max(1, 1.1 * z);
        ctx.beginPath(); ctx.moveTo(p.x - dir * 3 * z, by); ctx.lineTo(p.x - dir * 5.6 * z, by + wig * 0.4); ctx.stroke();   // tail
        for (let lg = -1; lg <= 1; lg++) { const lx = p.x + lg * 1.7 * z; ctx.beginPath(); ctx.moveTo(lx, by + 0.4 * z); ctx.lineTo(lx + wig * 0.5, by + 2 * z); ctx.stroke(); }   // legs
        for (const sgn of [-1, 1]) { ctx.beginPath(); ctx.moveTo(p.x + dir * 3 * z, by); ctx.lineTo(p.x + dir * 5.2 * z, by + sgn * 1.7 * z + wig * 0.3); ctx.stroke(); }   // claws
        ctx.beginPath(); ctx.ellipse(p.x, by, 3.2 * z, 1.7 * z, 0, 0, TAU); ctx.fill();   // body
      }
    }
    ctx.globalAlpha = 1;

    // vision overlay for the inspected fish
    const sel = world.selectedId != null ? world.agents.find(a => a.id === world.selectedId) : null;
    if (sel && this.opts.vision) this._vision(ctx, sel, world, w2s);

    // fish — culled + LOD (pad by the largest possible sprite extent so big fish don't pop at edges)
    const padW = MAX_FISH_EXTENT;
    // fading, sinking bodies of the recently-dead (drawn under the living)
    if (world.corpses) for (const c of world.corpses) {
      if (c.x < vr.x0 - padW || c.x > vr.x1 + padW || c.y < vr.y0 - padW || c.y > vr.y1 + padW) continue;
      this._corpse(ctx, c, env, cam);
    }
    let drawn = 0, nsprite = 0, ndot = 0;
    for (const a of world.agents) {
      if (a.x < vr.x0 - padW || a.x > vr.x1 + padW || a.y < vr.y0 - padW || a.y > vr.y1 + padW) continue;
      const tier = this._fish(ctx, a, t, env, cam);
      drawn++; if (tier === 1) nsprite++; else ndot++;
    }
    this.stats.total = world.agents.length; this.stats.drawn = drawn; this.stats.sprites = nsprite; this.stats.dots = ndot;

    // DEPTH HAZE (atmospheric perspective) — a vertical fog that thickens toward the deep so distant/deep things recede
    // into the murk. Its tint is SPECTRAL: blue in clear water, green as turbidity/algae rise (the eutrophic shift).
    {
      const hz = [lerp(16, 30, murk), lerp(40, 54, murk), lerp(66, 40, murk)];   // clear=blue → turbid=green
      const maxA = clamp(0.14 + 0.5 * murk, 0.14, 0.5) * (0.35 + 0.65 * amb);
      const fg = ctx.createLinearGradient(0, by, 0, br.y);
      fg.addColorStop(0, `rgba(${hz[0] | 0},${hz[1] | 0},${hz[2] | 0},0)`);
      fg.addColorStop(0.55, `rgba(${hz[0] | 0},${hz[1] | 0},${hz[2] | 0},${(maxA * 0.4).toFixed(3)})`);
      fg.addColorStop(1, `rgba(${hz[0] | 0},${hz[1] | 0},${hz[2] | 0},${maxA.toFixed(3)})`);
      ctx.fillStyle = fg; ctx.fillRect(bx, by, bw, bh);
    }

    // selection ring
    if (sel) {
      const p = w2s(sel.x, sel.y); ctx.globalAlpha = 0.9; ctx.strokeStyle = '#ffd27a'; ctx.lineWidth = 1.4;
      ring(ctx, p.x, p.y, (sel.sp.ringR * (0.5 + 0.5 * (sel.grow ?? 1)) + 2 + Math.sin(t * 5) * 0.6) * z); ctx.globalAlpha = 1;
    }

    // surface ripple + rain (surface band, world y≈1)
    const rainI = [0, 0, 0.6, 1][env.weather];
    if (env.light >= 0 && by < vh && by + bh > 0) {
      ctx.strokeStyle = `rgba(${top[0] | 0},${top[1] | 0},${top[2] | 0},0.8)`; ctx.lineWidth = 1; ctx.beginPath();
      let first = true;
      for (let x = Math.max(0, vr.x0); x <= Math.min(W, vr.x1); x += 6) {
        const p = w2s(x, 1 + Math.sin(x * 0.15 + t * 2) * 1.2 * (1 + rainI)); if (first) { ctx.moveTo(p.x, p.y); first = false; } else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
      if (rainI > 0) {
        ctx.strokeStyle = `rgba(195,220,240,${0.5 * rainI})`; ctx.beginPath();
        const drops = Math.min(160, (vr.x1 - vr.x0) * 0.03 * rainI) | 0;
        for (let i = 0; i < drops; i++) { const wx = lerp(Math.max(0, vr.x0), Math.min(W, vr.x1), Math.random()); const p = w2s(wx, 1 + Math.sin(wx * 0.15 + t * 2) * 1.2); ctx.moveTo(p.x, p.y - 2 * z); ctx.lineTo(p.x, p.y + 3 * z); }
        ctx.stroke();
      }
    }
    if (env.flash > 0) { ctx.globalAlpha = 1; const a = env.flash, lg = ctx.createLinearGradient(0, by, 0, by + bh * 0.72); lg.addColorStop(0, `rgba(228,236,255,${0.42 * a})`); lg.addColorStop(1, 'rgba(228,236,255,0)'); ctx.fillStyle = lg; ctx.fillRect(bx, by, bw, bh * 0.72); }

    // dawn/dusk warmth + night factors — computed unconditionally (both the 2D grade below AND the GL composite use them).
    const dawn = Math.max(0, 1 - Math.abs(env.t - 0.25) / 0.08), dusk = Math.max(0, 1 - Math.abs(env.t - 0.75) / 0.08);
    const warmth = Math.max(dawn, dusk), night = clamp(1 - env.light * 1.5, 0, 1);

    // POST (bloom + colour grade + vignette). When the WebGL2 presenter is active it does ALL of this on the GPU
    // (HDR bloom, ACES tonemap, refraction, chromatic aberration, fake DOF, grade, vignette, grain) far more cheaply —
    // so the canvas-2D post is SKIPPED to avoid double-applying. In fallback (no WebGL2) the 2D post runs as before.
    if (!this.postInGL) {
      // cheap BLOOM — downscale the scene into a small offscreen (the smoothing blurs it), add it back additively so
      // bright areas (sun, godrays, caustics, glints) bleed a soft glow. Limited to the lit upper band to halve cost.
      if (this.opts.bloom !== false && vw > 8 && vh > 8 && vw * vh <= 3.8e6) {   // auto-skip the bloom blits on 4K+ backings
        const region = Math.max(1, Math.round(vh * 0.58));
        const bw2 = Math.max(1, vw >> 2), bh2 = Math.max(1, region >> 2);
        if (!this._bloomC || this._bloomC.width !== bw2 || this._bloomC.height !== bh2) {
          this._bloomC = this.mkCanvas(bw2, bh2); this._bloomG = this._bloomC.getContext('2d');
          if (this._bloomG.imageSmoothingEnabled !== undefined) this._bloomG.imageSmoothingEnabled = true;
        }
        const bg2 = this._bloomG;
        bg2.clearRect(0, 0, bw2, bh2);
        bg2.drawImage(this.scene, 0, 0, vw, region, 0, 0, bw2, bh2);   // SOURCE is the offscreen scene (not #tank)
        const prevOp = ctx.globalCompositeOperation; ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.2;
        ctx.drawImage(this._bloomC, 0, 0, bw2, bh2, 0, 0, vw, region);
        ctx.globalAlpha = 1; ctx.globalCompositeOperation = prevOp;
      }
      // cinematic colour grade — warms toward dawn/dusk, cools/deepens at night.
      if (warmth > 0.01) { ctx.fillStyle = `rgba(255,150,72,${(0.06 * warmth).toFixed(3)})`; ctx.fillRect(0, 0, vw, vh); }
      if (night > 0.01) { ctx.fillStyle = `rgba(18,38,86,${(0.11 * night).toFixed(3)})`; ctx.fillRect(0, 0, vw, vh); }
      // vignette — softer falloff, faintly cool-tinted toward the corners for a lensed, underwater feel.
      const vg = ctx.createRadialGradient(vw / 2, vh / 2, Math.min(vw, vh) * 0.36, vw / 2, vh / 2, Math.max(vw, vh) * 0.66);
      vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(0.7, 'rgba(2,9,18,0.16)'); vg.addColorStop(1, 'rgba(2,9,18,0.52)');
      ctx.fillStyle = vg; ctx.fillRect(0, 0, vw, vh);
    }

    // present the finished scene → #tank: through the WebGL2 post pipeline (GPU bloom/tonemap/refraction/grade/…), or
    // a 1:1 blit in fallback. `flash: 0` because the 2D lightning flash is already baked into the scene above.
    if (this.present && this.present.present) {
      // Sun screen-UV for the GL god-rays. uv.y=0 is the TOP/surface in FRAG_COMP (matches surf/dofDeep/flash), so DO NOT
      // invert: v = sp.y/height (sp = the sun's screen point from the sun/moon block above). sunInt ramps in as the disc
      // climbs into frame & tracks day/night; sunUp gates the caustics/sheen to "sun above water". (`sp`/`sunY` in scope.)
      const su = sp.x / this.scene.width, sv = sp.y / this.scene.height;
      const sunInt = clamp(env.light * 1.15, 0, 1) * clamp(sp.y / (this.scene.height * 0.18), 0, 1);
      const sunUp = clamp(env.light, 0, 1) * clamp((26 - sunY) / 26 + 0.4, 0, 1);
      // GL-lit fish (Pass 3/slice 3): corpses first so they draw UNDER the living, matching the 2D order. The haze
      // params mirror the 2D depth-haze (hz/maxA) so a deep GL fish recedes into the same murk as the background.
      const fishParams = this.glFish ? this._glCorpse.concat(this._glLiving) : null;
      this.present.present(this.scene, {
        time: t, light: env.light, turbidity: env.turbidity || 0, night, warm: warmth, zoom: cam.zoom, flash: 0,
        secchiFrac: clamp((env.secchiDepth ? env.secchiDepth() : H) / H, 0, 1), clarity: env.clarity ? env.clarity() : 1,
        sunUV: [su, sv], sunInt, sunUp,
        fish: fishParams,
        hazeTint: [lerp(16, 30, murk), lerp(40, 54, murk), lerp(66, 40, murk)],
        hazeMax: clamp(0.14 + 0.5 * murk, 0.14, 0.5) * (0.35 + 0.65 * amb),
      });
    }
  }

  // returns 1 for sprite tier, 0 for dot tier
  _fish(ctx, a, t, env, cam) {
    // ease the visual heading & a fade-in so sim snaps (wall redirects, spawns) read smoothly
    const rdt = this._rdt;
    if (a.rHeading === undefined) a.rHeading = a.heading;
    a.rHeading += angDiff(a.heading, a.rHeading) * (1 - Math.exp(-rdt * 10));
    if (a.vis === undefined) a.vis = 1;
    a.vis += (1 - a.vis) * (1 - Math.exp(-rdt * 2.5));

    const grow = a.grow ?? 1;
    const Sworld = a.size * FISH_SCALE * (0.42 + 0.58 * grow);
    const sPx = Sworld * cam.zoom;
    const p = cam.worldToScreen(a.x, a.y);
    if (sPx < DOT_PX) {
      // keep far-zoom fish legible: a min 2px dot with a touch more contrast (so a whole-lake view still reads as populated)
      ctx.globalAlpha = clamp(0.55 + sPx, 0.5, 1) * a.vis;
      ctx.fillStyle = rgb(hsl(a.hue, a.sp.sat, (a.sp.lbase + 0.5 * a.sp.lrange) * (0.45 + 0.55 * env.light) * depthDim(a.y)));
      const d = Math.max(2, Math.round(sPx * 1.6)); ctx.fillRect((p.x - d / 2) | 0, (p.y - d / 2) | 0, d, d);
      ctx.globalAlpha = 1; return 0;
    }
    // swimming EFFORT (gait): how hard the fish is actually working = thrust + speed, boosted by an active
    // flee/strike burst and suppressed by a HIDE freeze. Drives both the tail-beat FREQUENCY (here) and the body
    // undulation AMPLITUDE (the sprite, via the drive bucket) — so a gliding/hiding fish is near-still while a
    // fleeing sprinter thrashes hard & fast, instead of every fish wiggling identically. Pure render (sim-state read).
    const act = a.act, flee = act ? act.flee : 0, strike = act ? act.strike : 0, hide = act ? act.hide : 0;
    const spdN = clamp(a.spd / (a.maxSpeed || 30), 0, 1);
    const drive = clamp(0.45 * (a.thrustSmooth ?? 0.4) + 0.55 * spdN + 0.45 * flee + 0.3 * strike - 0.85 * hide, 0.05, 1);
    const cphase = t * (0.8 + 2.6 * drive) + a.id * 1.7;   // beat rate rises with effort (glide ≈ slow, sprint ≈ fast)
    const frame = Math.floor((((cphase % TAU) + TAU) % TAU) / TAU * this.sprites.FRAMES);
    const sprite = this.sprites.get(a, frame, env.light * depthDim(a.y), drive);   // depth-shaded + effort-coupled sprite
    // Keep the whole sprite inside the water body. The sim clamps a fish's CENTRE to the bed/surface
    // (world.js), so a bottom-hugging or drop-off-wall-pressed fish would otherwise draw its lower half
    // into the brown bank — reads as "swimming out of the lake". Inset the DRAW position by the rotated
    // body half-extent. Render-only: sim positions / determinism are untouched.
    const P = a.sp.P, ich = Math.cos(a.rHeading), ish = Math.sin(a.rHeading);
    const halfLen = (P.L + (P.tail ? P.tail.len : 1.2)) * Sworld;   // nose↔tail reach (world px)
    const halfHt = P.Hh * Sworld * 1.25;                           // body depth + headroom for body-gene & body wave
    const half = Math.abs(ish) * halfLen + Math.abs(ich) * halfHt; // vertical reach of the rotated body
    const ibed = bedY(a.x), ilo = Math.min(half, ibed * 0.45), ihi = Math.max(ilo, ibed - half);
    const p2 = cam.worldToScreen(a.x, clamp(a.y, ilo, ihi));
    // soft CONTACT SHADOW on the bed for a fish hovering near it — grounds bottom-dwellers (catfish/carp) instead of
    // leaving them floating. A soft elliptical radial-gradient blob beneath the fish, fading with the gap to the bed.
    const gapBed = ibed - a.y;
    if (gapBed > -3 && gapBed < halfHt * 5 && sPx > DOT_PX) {
      const sh = clamp(1 - gapBed / (halfHt * 5), 0, 1) * a.vis;
      const sc = cam.worldToScreen(a.x, ibed - 1), rx = Math.max(2, halfLen * 0.85 * cam.zoom), ry = Math.max(1.2, halfHt * 0.5 * cam.zoom);
      ctx.save(); ctx.translate(sc.x, sc.y); ctx.scale(1, ry / rx);
      const rg = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
      rg.addColorStop(0, `rgba(0,0,0,${(0.3 * sh).toFixed(3)})`); rg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(0, 0, rx, 0, TAU); ctx.fill(); ctx.restore();
      ctx.globalAlpha = 1;
    }
    // facing (left/right sprite mirror): EASE it through a quick belly-roll instead of an instant mirror snap.
    // An instantaneous flip is a literal one-frame "twitch"; easing it over ~0.15s reads as a natural banking
    // turn. The TARGET uses wide hysteresis (±0.30 cos) so a fish hovering near-vertical never flip-flops; the
    // eased `a.facing` smooths the actual transition. A small floor keeps the roll from a zero-height sliver.
    const c = Math.cos(a.rHeading);
    let ft = a.faceTarget ?? 1; if (c < -0.30) ft = -1; else if (c > 0.30) ft = 1; a.faceTarget = ft;
    if (a.facing === undefined) a.facing = ft;
    a.facing += (ft - a.facing) * (1 - Math.exp(-rdt * 16));
    let vf = a.facing; if (Math.abs(vf) < 0.14) vf = vf < 0 ? -0.14 : 0.14;
    const s = sPx / sprite.base;
    if (this.glFish) {
      // collect a GL quad instead of the 2D blit; GLPost draws it as a lit textured quad (uses the SAME p2/heading/sPx/vf).
      this._glLiving.push({ sprite, sx: p2.x, sy: p2.y, rot: a.rHeading, sPx, facing: vf, vis: a.vis,
        worldYN: clamp(a.y / H, 0, 1), depthDim: depthDim(a.y), kind: 0 });
    } else {
      ctx.save();
      ctx.globalAlpha = a.vis;
      ctx.translate(p2.x, p2.y); ctx.rotate(a.rHeading); ctx.scale(s, vf * s);
      ctx.drawImage(sprite.canvas, -sprite.cx, -sprite.cy);
      ctx.restore();
      ctx.globalAlpha = 1;
    }
    // strike / flee BURST → a quick expanding ripple ring, EDGE-triggered (fires once per lunge, not every frame it
    // holds the action). `a._burst`/`a._fxAt` are transient render fields (like `a.vis`); `t` is the monotonic render clock.
    const burst = Math.max(strike, flee * 0.85);
    if (burst > 0.62 && !a._burst) { a._burst = 1; a._fxAt = t; } else if (burst < 0.4) a._burst = 0;
    if (a._fxAt !== undefined) {
      const age = t - a._fxAt;
      if (age >= 0 && age < 0.4) {
        const f = age / 0.4, rr = (halfLen * 0.7 + f * halfLen * 2.4) * cam.zoom;
        ctx.globalAlpha = (1 - f) * 0.42 * a.vis; ctx.strokeStyle = 'rgba(214,238,255,1)'; ctx.lineWidth = Math.max(1, 2.2 * (1 - f));
        ctx.beginPath(); ctx.arc(p2.x, p2.y, rr, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1;
      }
    }
    return 1;
  }

  // a recently-dead body: static sprite, sinking, rolling belly-up, fading out
  _corpse(ctx, c, env, cam) {
    const grow = c.grow ?? 1, Sworld = c.size * FISH_SCALE * (0.42 + 0.58 * grow), sPx = Sworld * cam.zoom;
    const p = cam.worldToScreen(c.x, c.y), alpha = clamp(c.t / (c.t0 || 1.4), 0, 1);
    if (sPx < DOT_PX) {
      ctx.globalAlpha = alpha * 0.6;
      ctx.fillStyle = rgb(hsl(c.hue, Math.max(6, c.sp.sat - 18), (c.sp.lbase + 0.3 * c.sp.lrange) * (0.4 + 0.5 * env.light) * depthDim(c.y)));
      const d = Math.max(2, Math.round(sPx * 1.5)); ctx.fillRect((p.x - d / 2) | 0, (p.y - d / 2) | 0, d, d);
      ctx.globalAlpha = 1; return;
    }
    const sprite = this.sprites.get(c, 0, env.light * 0.85 * depthDim(c.y), 0.1);   // a dead fish barely undulates
    // same boundary inset as live fish, so a belly-up corpse resting on the bed doesn't sink into the bank
    const P = c.sp.P, ich = Math.cos(c.rHeading), ish = Math.sin(c.rHeading);
    const half = Math.abs(ish) * (P.L + (P.tail ? P.tail.len : 1.2)) * Sworld + Math.abs(ich) * P.Hh * Sworld * 1.25;
    const ibed = bedY(c.x), ilo = Math.min(half, ibed * 0.45), ihi = Math.max(ilo, ibed - half);
    const p2 = cam.worldToScreen(c.x, clamp(c.y, ilo, ihi));
    const vf = Math.cos(c.rHeading) < 0 ? -1 : 1, s = sPx / sprite.base;
    let ys = vf * (1 - 2 * clamp(c.roll, 0, 1)); if (Math.abs(ys) < 0.06) ys = 0.06 * (ys < 0 ? -1 : 1); // belly-up roll, never a 0-scale
    if (this.glFish) {
      // GL quad (drawn UNDER the living fish — corpses are collected first). facing carries the belly-roll y-sign.
      this._glCorpse.push({ sprite, sx: p2.x, sy: p2.y, rot: c.rHeading, sPx, facing: ys, vis: alpha * 0.92,
        worldYN: clamp(c.y / H, 0, 1), depthDim: depthDim(c.y), kind: 1 });
    } else {
      ctx.save();
      ctx.globalAlpha = alpha * 0.92;
      ctx.translate(p2.x, p2.y); ctx.rotate(c.rHeading); ctx.scale(s, ys * s);
      ctx.drawImage(sprite.canvas, -sprite.cx, -sprite.cy);
      ctx.restore();
      ctx.globalAlpha = 1;
    }
  }

  _vision(ctx, a, world, w2s) {
    ctx.lineWidth = 1;
    const line = (tt, col) => { if (!tt) return; const p0 = w2s(a.x, a.y), p1 = w2s(tt.item.x, tt.item.y); ctx.strokeStyle = col; ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke(); };
    if (a.sp.diet.plankton) line(world.qPlankton(a.x, a.y, a.senseRange ?? a.sp.senseRange), '#bff0d8');
    if (a.sp.diet.plants) line(world.qPlant(a.x, a.y, a.senseRange ?? a.sp.senseRange), '#79d17a');
    if (a.sp.diet.detritus) line(world.qDetritus(a.x, a.y, a.senseRange ?? a.sp.senseRange), '#c79a6a');
    if (a.sp.diet.fish) line(world.qPrey(a), '#ff7a6a');
    line(world.qThreat(a), '#ff4d6d');
    const grad = world.oxygenGrad(a.x, a.y), p0 = w2s(a.x, a.y), p1 = w2s(a.x, a.y - clamp(grad * 30, -12, 12));
    ctx.strokeStyle = '#7ad1ff'; ctx.globalAlpha = 0.6; ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // ---- minimap: whole lake + camera rect + agent density. Drawn by the UI each frame. ----
  drawMinimap(mctx, mw, mh) {
    const world = this.world, cam = this.camera, env = world.env;
    const sx = mw / W, sy = mh / H;
    mctx.clearRect(0, 0, mw, mh);
    // water + curved basin bed
    mctx.fillStyle = rgb([lerp(8, 30, env.light), lerp(16, 60, env.light), lerp(30, 78, env.light)]); mctx.fillRect(0, 0, mw, mh);
    mctx.fillStyle = '#241a12'; mctx.beginPath(); mctx.moveTo(0, mh);
    for (let i = 0; i <= 48; i++) { const wx = i / 48 * W; mctx.lineTo(wx * sx, bedY(wx) * sy); }
    mctx.lineTo(mw, mh); mctx.closePath(); mctx.fill();
    // agents as species-tinted dots
    for (const a of world.agents) {
      mctx.fillStyle = a.sp.tag; mctx.globalAlpha = 0.8;
      mctx.fillRect(a.x * sx - 0.5, a.y * sy - 0.5, a.sp.diet.fish ? 2 : 1.4, a.sp.diet.fish ? 2 : 1.4);
    }
    mctx.globalAlpha = 1;
    // camera view rectangle
    const vr = cam.visibleRect();
    mctx.strokeStyle = '#ffd27a'; mctx.lineWidth = 1;
    mctx.strokeRect(clamp(vr.x0, 0, W) * sx, clamp(vr.y0, 0, H) * sy, Math.min(vr.x1, W) * sx - clamp(vr.x0, 0, W) * sx, Math.min(vr.y1, H) * sy - clamp(vr.y0, 0, H) * sy);
  }
}

function disc(ctx, x, y, r) { if (r <= 0) return; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill(); }
function ring(ctx, x, y, r) { if (r <= 0) return; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.stroke(); }
function o2color(o) {
  o = clamp(o, 0, 1);
  if (o < 0.5) return [lerp(210, 230, o * 2), lerp(60, 170, o * 2), 60];
  return [lerp(230, 70, (o - 0.5) * 2), lerp(170, 200, (o - 0.5) * 2), lerp(60, 190, (o - 0.5) * 2)];
}
// temperature heatmap: cold (deep blue) → mild (teal/green) → warm (amber/red), ~6–30 °C
function tempColor(t) {
  const u = clamp((t - 6) / 24, 0, 1);
  if (u < 0.5) return [lerp(40, 70, u * 2), lerp(90, 200, u * 2), lerp(210, 180, u * 2)];
  return [lerp(70, 230, (u - 0.5) * 2), lerp(200, 130, (u - 0.5) * 2), lerp(180, 60, (u - 0.5) * 2)];
}
// phytoplankton heatmap: clear → algal green
function phytoColor(b) { const u = clamp(b, 0, 1); return [lerp(20, 90, u), lerp(40, 200, u), lerp(60, 70, u)]; }
