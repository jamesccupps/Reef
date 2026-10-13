// render.js — browser-only canvas renderer. Draws the world through a Camera with
// culling, level-of-detail, and a lazily-built sprite cache. Not imported by the
// headless sim test (a separate DOM-stub smoke test exercises it).
import { WORLD, GRID, THERMAL, MACRO, BIRD, bedY } from './config.js';
import { SP } from './species.js';
import { clamp, lerp, hsl, angDiff, TAU } from './core.js';
import { makePresenter, Canvas2DPresenter } from './glpost.js';
import { interpX, interpY, interpH } from './camera.js';

// ---- small pure helpers (exported for test/smoke.mjs) ----
// sprite hue bucket ↔ the hue it is PAINTED at: the key rounds to the NEAREST bucket centre, so the paint hue must be that
// centre (hB·360/HUES) — not centre + half a bucket (the old +11.25° bias that made colours pop at the dot↔sprite switch).
export const hueBucket = (hue, HUES) => (((Math.round(hue / (360 / HUES))) % HUES) + HUES) % HUES;
export const bucketHue = (hB, HUES) => hB * (360 / HUES);
// World-ALIGNED sample xs covering [x0,x1] (clamped to [lo,hi]): starts at floor(x0/s)·s, ends at ceil(x1/s)·s, ALWAYS
// includes the end — so a polyline (lake bed, surface ripple) reaches the screen edge (the old loop from x0 by `step`
// stopped up to one step short → a 44 px mean / 127 px worst unfilled strip at tour zooms) and its vertices are fixed in
// the world, so they don't wobble while panning. Reuses `out`.
export function alignedSamples(x0, x1, s, lo, hi, out = []) {
  out.length = 0;
  if (!(s > 0) || !(x1 >= x0)) return out;
  const a = Math.max(lo, Math.floor(x0 / s) * s), b = Math.min(hi, Math.ceil(x1 / s) * s);
  for (let x = a; x < b - 1e-9; x += s) out.push(x);
  out.push(b);
  return out;
}
// a power-of-two multiple of `base` ≥ `min` — quantized so the world-aligned grid only changes at discrete zoom thresholds
export const quantStep = (min, base) => { let s = base; while (s < min) s *= 2; return s; };
// Frame-loop guard (audit Tier 2 #8): re-arm the NEXT frame first, then run the body inside try/catch, so a single throw
// can never stop the loop. Used by main.js; exported here (render.js is importable by the smoke test, main.js is not).
export function makeGuardedLoop(raf, body, onError) {
  const loop = now => {
    raf(loop);
    try { body(now); }
    catch (e) { try { onError(e); } catch (e2) { if (typeof console !== 'undefined') console.error('frame-error handler failed', e2, e); } }
  };
  return loop;
}
const readDpr = () => Math.min((typeof window !== 'undefined' && window.devicePixelRatio) || 1, 2);
const GL_LOSS_TIMEOUT_MS = 3000;   // a WebGL context loss not restored within this long → swap #tank to Canvas2D
const nowMs = () => (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();

const W = WORLD.W, H = WORLD.H, FLOOR = WORLD.FLOOR;
const FCOLS = GRID.FIELD_COLS, FROWS = GRID.FIELD_ROWS, CW = W / FCOLS, CH = H / FROWS;
const rgb = c => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
const FISH_SCALE = 2.0; // world px per fish-unit, times species size

const SKY_NIGHT = [10, 18, 42], SKY_DAY = [38, 120, 138], SKY_DUSK = [150, 78, 52];
const ABYSS = [2, 7, 13];
const LETTERBOX = [3, 6, 11];

// LOD thresholds, in on-screen fish-scale px
const DOT_PX = 1.5;
// MOONLIGHT FLOOR (render-only): the sim's light is physically 0 at night, which turned the screen black for half of every
// day. Picture brightness uses visLight() instead — never darker than a moonlit lake — while the sim, the sun-dependent
// effects (sun disc, god-rays, caustics, dawn/dusk warmth) and the cool night grade still follow the real env.light.
const MOON = 0.24;
const visLight = l => MOON + (1 - MOON) * clamp(l, 0, 1);
// sprite RESOLUTION tier for a fish drawn at sPx screen px per fish-unit: 14 px/unit up to ~17, 28 up to ~34, then 56
// (≤ ~2× upscale at 1080p tour zooms instead of up to 7.7×). Blit size is unchanged — it divides by sprite.base.
const resTier = sPx => sPx > 34 ? 2 : sPx > 17 ? 1 : 0;     // below this a fish is a single tinted dot

// relative brightness by depth — bright near the sunlit surface, dimmer toward the dark deep.
// (Day/night is handled separately via env.light; this is the *depth* component, so a deep fish
// reads as deeper, not just nighttime-dark.) 1.0 at the surface → ~0.34 at the bed.
const depthDim = y => 0.34 + 0.66 * Math.exp(-1.9 * clamp(y / H, 0, 1));
// GL fish look for a light×depth `lit`: the sRGB brightness multiplier and saturation that species.js fishColors applies
// to the 2D sprite (dim 0.30+0.70·light, sat ×(0.35+0.65·light)), since GL sprites are built once at full light.
// The 0.12 floor matches the sprite light bucket's minimum. Exported for the smoke test.
export const fishLook = lit => { const l = 0.12 + 0.88 * clamp(lit, 0, 1); return { bright: 0.30 + 0.70 * l, sat: 0.35 + 0.65 * l }; };
// Drawn-body PITCH limit (render-only; the sim heading is untouched). Real fish seldom swim more than ~45° nose-up or
// nose-down, and a sprite pointing straight up or down reads as a falling cut-out. The pitch is soft-compressed (tanh)
// toward ±PITCH_MAX (~55°): level swimming is barely changed, vertical becomes ~51°. Left/right follows the swim
// direction with the same wide hysteresis as the sprite mirror (±0.30 cos): near vertical the previous facing
// (faceHint) holds, so a fish rising or sinking steeply can't flip-flop between the two sides.
const PITCH_MAX = 0.96;
export function displayHeading(h, faceHint) {
  const c = Math.cos(h), right = c > 0.30 || (c >= -0.30 && (faceHint ?? 1) > 0);
  const pc = PITCH_MAX * Math.tanh(Math.atan2(Math.sin(h), Math.abs(c)) / PITCH_MAX);
  return right ? pc : Math.PI - pc;
}

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
// Close-up sprites: the 2-px dab rasterizer leaves stair-stepped silhouettes that the ≤2× upscale shows as jaggies. Pull
// each edge texel's alpha down toward its 3×3 mean (never up, so the silhouette doesn't grow and no unbled colour leaks
// out): a ~1 px anti-aliased rim. Interior texels (every neighbour as opaque) are untouched.
function softenEdges(d, w, h) {
  const A = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) A[i] = d[i * 4 + 3];
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x, a = A[i]; if (a === 0) continue;
    const m = (A[i - w - 1] + A[i - w] + A[i - w + 1] + A[i - 1] + a + A[i + 1] + A[i + w - 1] + A[i + w] + A[i + w + 1]) / 9;
    if (m < a) d[i * 4 + 3] = m;
  }
}

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
    this.max = 1024;      // LRU cap — at BASE 14 a cached sprite averages ~120KB (≲160KB). The GL fish-texture cache is
                          // tied to this SAME cap (Renderer sets present.fishTexMax = max) so it can't thrash below it;
                          // on the GL path the light bucket is not part of the working set (dimming is in the shader).
                          // The population clusters under selection, so few buckets (species×grow×hue×light×frame×morph×drive) are live at once.
    this.built = 0;
    // RESOLUTION TIERS for close-ups (high-res screens): a fish drawn far larger than BASE px per fish-unit was a 2.5–7.7×
    // upscale at 1080p tour zooms (blurry). get(..., tier) picks a sprite built at TIERS[tier] px/unit; the big tiers have
    // their own small LRU caps (they're large and only the few closest fish use them). this.map / this.max stay tier 0.
    this.TIERS = [14, 28, 56]; this.maps = [this.map, new Map(), new Map()]; this.tierMax = [null, 160, 48];
    this.onEvict = null;   // Renderer hooks this to free the matching GL texture (bounded GPU memory)
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
  // still = the GL path's single straight-pose sprite per fish (FRAG_FISH animates the swim): frame and effort drop out of
  // the key. Per beat frame × effort (10 × 3) the close-up tiers needed 30 sprites PER FISH against caps of 160/48, so a
  // close shot rebuilt (rasterize + alpha-bleed + upload) sprites every frame: 20 fps with 100–230 ms stalls at 1080p.
  get(a, frameVal, light, drive, tier = 0, still = false) {
    const sp = a.sp;
    tier = clamp(tier | 0, 0, this.TIERS.length - 1);
    const gB = clamp(Math.round((((a.grow ?? 1) - 0.35) / 0.65) * (this.GROWS - 1)), 0, this.GROWS - 1);
    const hB = hueBucket(a.hue, this.HUES);
    const lB = clamp(Math.round(light * (this.LIGHTS - 1)), 0, this.LIGHTS - 1);
    const fr = still ? 's' : ((frameVal % this.FRAMES) + this.FRAMES) % this.FRAMES;
    const mB = this._morphBucket(a);
    const dB = still ? 0 : clamp(Math.round((drive ?? 0.45) * (this.DRIVES - 1)), 0, this.DRIVES - 1);
    const k = this._key(sp.key, gB, hB, lB, fr, mB, dB), map = this.maps[tier], cap = tier ? this.tierMax[tier] : this.max;
    let s = map.get(k);
    if (s) { map.delete(k); map.set(k, s); return s; }   // LRU touch
    s = this._build(sp, gB, hB, lB, still ? 0 : fr, mB, dB, tier ? this.TIERS[tier] : this.BASE, still);
    map.set(k, s);
    if (map.size > cap) { const first = map.keys().next().value, ev = map.get(first); map.delete(first); if (this.onEvict) this.onEvict(ev); }
    return s;
  }
  _build(sp, gB, hB, lB, fr, mB, dB, BASE = this.BASE, still = false) {
    const grow = 0.35 + 0.65 * (gB / (this.GROWS - 1));
    const hue = bucketHue(hB, this.HUES);   // the bucket CENTRE the key rounded to (no half-bucket bias)
    const light = 0.12 + 0.88 * (lB / (this.LIGHTS - 1));
    const morph = this._morphVal(mB);
    const P = sp.P, L = P.L, Hh = P.Hh * morph.body, tlen = (P.tail ? P.tail.len : 1.2) * morph.fin;   // size the canvas for the evolved depth & fins
    // generous bounds so wave/dorsal/tail never clip
    const extX = (L + tlen + 2) * BASE + 6, extY = (Hh * 2.8 + 2) * BASE + 8;
    const w = Math.max(2, Math.ceil(extX * 2)), h = Math.max(2, Math.ceil(extY * 2));
    // GL-fish path: GLPost reads each sprite back once (alpha-bleed before upload) — a CPU-backed canvas makes that a memcpy
    // instead of a ~40 ms GPU readback; the 2D path keeps the default (accelerated) canvas for its per-frame blits.
    const cnv = this.mk(w, h), g = this.readback ? cnv.getContext('2d', { willReadFrequently: true }) : cnv.getContext('2d');
    if (g.imageSmoothingEnabled !== undefined) g.imageSmoothingEnabled = true;
    const cx = w / 2, cy = h / 2;
    // soft texel "dab": the draw step (su≈0.07 fish-units) lands texels ~1 sprite-px apart, so a 1px dab could
    // leave a faint stippled grid. A ≥2px dab makes neighbouring texels overlap into solid, smoothly-shaded
    // coverage; combined with the anti-aliased blit the body has no hard pixel edges.
    // The draw step is ~1 sprite px at every resolution (species.js), so a 2px dab always overlaps into solid coverage.
    const DAB = 2;
    // Rasterize straight into an ImageData buffer (straight-alpha source-over per dab) — ~an order of magnitude cheaper
    // than thousands of fillRect calls with per-dab colour strings, which is what makes the high-res close-up tiers
    // affordable. Falls back to fillRect where ImageData isn't available (minimal canvas stubs).
    const img = typeof g.createImageData === 'function' ? g.createImageData(w, h) : null;
    let put;
    if (img) {
      const d = img.data;
      put = (u, v, col, al) => {
        const x0 = Math.round(cx + u * BASE), y0 = Math.round(cy + v * BASE), a = al === undefined ? 1 : clamp(al, 0, 1);
        if (a <= 0) return;
        const r = col[0], gc = col[1], b = col[2];
        for (let yy = Math.max(0, y0), y1 = Math.min(h, y0 + DAB); yy < y1; yy++) {
          for (let xx = Math.max(0, x0), x1 = Math.min(w, x0 + DAB); xx < x1; xx++) {
            const o = (yy * w + xx) * 4, da = d[o + 3] / 255, oa = a + da * (1 - a), k1 = a / oa, k2 = da * (1 - a) / oa;
            d[o] = r * k1 + d[o] * k2; d[o + 1] = gc * k1 + d[o + 1] * k2; d[o + 2] = b * k1 + d[o + 2] * k2; d[o + 3] = oa * 255;
          }
        }
      };
    } else put = (u, v, col, al) => { g.globalAlpha = al; g.fillStyle = rgb(col); g.fillRect(Math.round(cx + u * BASE), Math.round(cy + v * BASE), DAB, DAB); };
    const fake = { hue, energy: sp.reproEnergy * 0.82, grow, spd: 0, id: 0, thrustSmooth: 0.45 };
    const o = { scale: BASE, beat: (fr / this.FRAMES) * TAU, drive: this._driveVal(dB), morph, still };   // undulation amplitude scales with effort
    sp.draw(fake, put, 0, { light }, o);
    if (img && BASE > this.BASE) softenEdges(img.data, w, h);   // close-up tiers: anti-alias the dab-stepped silhouette
    if (img) g.putImageData(img, 0, 0);
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
    this.sprites = new SpriteCache(this.mkCanvas);
    this.onCanvasReplaced = null;   // main.js hook: re-wire input listeners when #tank is swapped for a fresh canvas
    this._frameNo = 0; this._alpha = 1; this._ovCmds = []; this._xs = [];
    this.present = makePresenter(canvas, this.mkCanvas, { texMax: this.sprites.max + this.sprites.tierMax[1] + this.sprites.tierMax[2] });
    // when the sprite cache evicts an entry, free its GL texture too (the hi-res tiers are big — keep GPU memory bounded)
    this.sprites.onEvict = e => { const pr = this.present; if (pr && typeof pr.dropFishTex === 'function') pr.dropFishTex(e); };   // GL texture cap ≥ sprite cap
    if (this.present && this.present.needsCanvas) this._fallbackTo2D('WebGL2 init failed after claiming the canvas');
    this.postInGL = !!(this.present && this.present.gl);   // GL applies bloom/grade/vignette → the 2D path skips them (no double-post)
    this.glFish = !!(this.present && this.present.gl && this.present.fishReady);   // Pass 3/slice 3: fish drawn as lit GL quads (else 2D)
    this.sprites.readback = this.glFish;   // GL path reads sprites back for the alpha-bleed upload → CPU-backed sprite canvases
    this.opts ={ oxygen: false, temp: false, phyto: false, vision: true, perf: false };
    this.dpr = readDpr();
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

  // GL can't present any more (init failure after claiming #tank, a fatal runtime error, or a context loss that was not
  // restored in time) → replace #tank with a FRESH canvas (same id/classes/attributes; a canvas that ever had a WebGL
  // context can never get a 2D one) bound to a Canvas2D presenter, and let main.js re-attach its input listeners.
  _fallbackTo2D(reason) {
    const old = this.canvas;
    if (typeof console !== 'undefined') console.warn('Renderer: ' + reason + ' → swapping #tank to a Canvas2D presenter');
    try { if (this.present && this.present.dispose) this.present.dispose(); } catch (e) { if (typeof console !== 'undefined') console.warn('Renderer: presenter dispose failed', e); }
    let fresh = null;
    try { fresh = old.cloneNode ? old.cloneNode(false) : null; } catch (e) { fresh = null; }
    if (fresh) {
      try { if (old.parentNode) old.parentNode.replaceChild(fresh, old); }
      catch (e) { if (typeof console !== 'undefined') console.error('Renderer: could not replace #tank', e); }
      this.canvas = fresh;
    }
    this.present = new Canvas2DPresenter(this.canvas);
    this.postInGL = false; this.glFish = false;
    if (this.sprites && this.sprites.readback) { this.sprites.readback = false; this.sprites.clear(); }   // rebuild as accelerated 2D-blit sprites
    this._glFallback = reason;
    this.resize();
    if (fresh && typeof this.onCanvasReplaced === 'function') {
      try { this.onCanvasReplaced(fresh, old); } catch (e) { if (typeof console !== 'undefined') console.error('Renderer: onCanvasReplaced failed', e); }
    }
  }
  // poll the presenter's health once per frame (cheap)
  _checkPresenter() {
    const pr = this.present; if (!pr || !pr.gl) return;
    if (pr.failed) this._fallbackTo2D('WebGL presenter failed (' + (pr.fatal || 'unknown') + ')');
    else if (pr.lost && nowMs() - (pr.lostAt || 0) > GL_LOSS_TIMEOUT_MS) this._fallbackTo2D('WebGL context lost and not restored within ' + GL_LOSS_TIMEOUT_MS + ' ms');
  }

  resize() {
    const c = this.canvas;
    this.dpr = readDpr();   // re-read every call (main.js calls resize() each frame) → a DPR change (zoom / monitor move) is picked up
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
      const dx = interpX(a, this._alpha) - wpt.x, dy = interpY(a, this._alpha) - wpt.y, d = dx * dx + dy * dy;   // the DRAWN (interpolated) pose
      const tol = Math.max(bd, rad * rad);
      if (d < tol && d < bd) { bd = d; best = a; }
    }
    // second pass that also accepts the fish's own body radius even if > pickR
    if (!best) {
      let bb = Infinity;
      for (const a of this.world.agents) {
        const rad = (5 + a.size * 3 * (0.6 + 0.4 * (a.grow ?? 1)));
        const dx = interpX(a, this._alpha) - wpt.x, dy = interpY(a, this._alpha) - wpt.y, d = dx * dx + dy * dy;   // the DRAWN (interpolated) pose
        if (d < rad * rad && d < bb) { bb = d; best = a; }
      }
    }
    return best ? best.id : null;
  }

  skyTop(env) {
    const vl = visLight(env.light);
    const c = [lerp(SKY_NIGHT[0], SKY_DAY[0], vl), lerp(SKY_NIGHT[1], SKY_DAY[1], vl), lerp(SKY_NIGHT[2], SKY_DAY[2], vl)];
    const dawn = Math.max(0, 1 - Math.abs(env.t - 0.25) / 0.07), dusk = Math.max(0, 1 - Math.abs(env.t - 0.75) / 0.07);
    const warm = Math.max(dawn, dusk) * (1 - env.light * 0.5);
    return [lerp(c[0], SKY_DUSK[0], warm), lerp(c[1], SKY_DUSK[1], warm), lerp(c[2], SKY_DUSK[2], warm)];
  }

  // t: render clock (s). alpha: render-interpolation fraction between the previous and current sim state (main.js
  // passes accumulator/DT; agents are drawn at lerp(prev, cur, alpha) — default 1 = the current state).
  draw(t, alpha = 1) {
    this._checkPresenter();   // GL dead / lost too long → swap to a Canvas2D presenter on a fresh #tank
    const ctx = this.ctx, world = this.world, env = world.env, cam = this.camera;
    const vL = visLight(env.light); this._vL = vL;   // moonlit picture brightness (see MOON)
    this._rdt = this._lastT === undefined ? 1 / 60 : clamp(t - this._lastT, 0, 0.1); this._lastT = t;
    this._alpha = clamp(+alpha || 0, 0, 1); this._frameNo++;
    // GL applies bloom/grade/vignette? Only while GL can actually present (not failed, not context-lost).
    const glOK = !!(this.present && this.present.gl && !this.present.failed && !this.present.lost);
    this.postInGL = glOK;
    // GL draws fish as lit quads? Re-read each frame so a context loss / fish-path failure reverts to the 2D fish.
    this.glFish = glOK && !!this.present.fishReady && !this.present.fishFailed;
    this._glLiving = this.glFish ? [] : null; this._glCorpse = this.glFish ? [] : null;   // per-frame GL fish/corpse quad collectors
    this._ovCmds.length = 0;   // GL-fish mode: overlay draw commands composited OVER the GL fish (ripple rings, …)
    const vw = this.scene.width, vh = this.scene.height, z = cam.zoom;
    // non-allocating world→screen for the hot loops (w2s allocates an object per call)
    const ox = cam.vw / 2 - cam.cx * z, oy = cam.vh / 2 - cam.cy * z;
    const X = wx => wx * z + ox, Y = wy => wy * z + oy;
    const amb = 0.25 + 0.75 * vL;
    // night vision for FLORA (as for fish): lightness and saturation drain with the light, so weed beds read as dim
    // silhouettes at night instead of glowing lime against near-black water
    const floraL = 0.40 + 0.60 * vL, floraS = 0.35 + 0.65 * vL;
    const top = this.skyTop(env);
    // seasonal tint: greener/warmer in summer, cooler/bluer in winter
    const summer = Math.sin((env.year || 0) * TAU), warm = Math.max(0, summer), cold = Math.max(0, -summer);
    top[0] = clamp(top[0] + 12 * warm - 6 * cold, 0, 255); top[1] = clamp(top[1] + 9 * warm + 2 * cold, 0, 255); top[2] = clamp(top[2] - 9 * warm + 13 * cold, 0, 255);
    // turbidity murk: blend the water toward a green-brown soup as it clouds up
    const murk = (env.turbidity || 0) * 0.6;
    top[0] = lerp(top[0], 64, murk); top[1] = lerp(top[1], 86, murk); top[2] = lerp(top[2], 52, murk);
    const vr = cam.visibleRect();
    const w2s = (x, y) => cam.worldToScreen(x, y);   // allocating; fine off the hot paths (X/Y above are the hot-path form)
    const _pt = this._pt || (this._pt = { x: 0, y: 0 });
    const pt = (x, y) => { _pt.x = X(x); _pt.y = Y(y); return _pt; };   // ONE reused point — never hold two at once

    // letterbox / out-of-world
    ctx.globalAlpha = 1; ctx.fillStyle = rgb(LETTERBOX); ctx.fillRect(0, 0, vw, vh);

    // world box on screen
    const tl = w2s(0, 0), br = w2s(W, H);
    const bx = tl.x, by = tl.y, bw = br.x - tl.x, bh = br.y - tl.y;

    // water column gradient (sunlit surface → surface → mid → abyss), clipped to the world box.
    // A bright sunlit band up top and a steeper ramp into the dark deep give a strong sense of depth.
    const surf = [lerp(top[0], 255, 0.10 * vL), lerp(top[1], 255, 0.12 * vL), lerp(top[2], 255, 0.10 * vL)];
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
        ctx.globalAlpha = a * (0.3 + s.s * 0.7) * (0.6 + 0.4 * Math.sin(t * 2 + s.x));
        ctx.fillRect(X(s.x) | 0, Y(s.y) | 0, Math.max(1, z * 0.5) | 0 || 1, Math.max(1, z * 0.5) | 0 || 1);
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
      const cellCol = (cx, cy) => { const i = cy * FCOLS + cx; return this.opts.temp ? tempColor(env.tempAt((cx + 0.5) * CW, (cy + 0.5) * CH)) : this.opts.phyto ? phytoColor(env.phyto[i]) : o2color(env.o2[i]); };
      // a smooth heat map: one pixel per field cell in a tiny offscreen image, drawn scaled with bilinear smoothing over
      // the world rect. (Per-cell translucent squares overlapped by a pixel and drew a visible MESH of grid lines.)
      if (!this._fieldC) { this._fieldC = this.mkCanvas(FCOLS, FROWS); this._fieldX = this._fieldC.getContext('2d'); }
      const fx = this._fieldX;
      if (fx && typeof fx.createImageData === 'function') {
        if (!this._fieldImg) this._fieldImg = fx.createImageData(FCOLS, FROWS);
        const d = this._fieldImg.data;
        for (let cy = 0; cy < FROWS; cy++) for (let cx = 0; cx < FCOLS; cx++) { const c = cellCol(cx, cy), o = (cy * FCOLS + cx) * 4; d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = 255; }
        fx.putImageData(this._fieldImg, 0, 0);
        const p0 = w2s(0, 0), p1 = w2s(W, H);
        ctx.save(); ctx.globalAlpha = 0.32; ctx.imageSmoothingEnabled = true;
        ctx.drawImage(this._fieldC, p0.x, p0.y, p1.x - p0.x, p1.y - p0.y);
        ctx.restore();
      } else {   // no ImageData (e.g. a minimal canvas stub): per-cell squares over the visible cells
        const cx0 = clamp((vr.x0 / CW) | 0, 0, FCOLS - 1), cx1 = clamp((vr.x1 / CW) | 0, 0, FCOLS - 1);
        const cy0 = clamp((vr.y0 / CH) | 0, 0, FROWS - 1), cy1 = clamp((vr.y1 / CH) | 0, 0, FROWS - 1);
        ctx.globalAlpha = 0.30;
        for (let cy = cy0; cy <= cy1; cy++) for (let cx = cx0; cx <= cx1; cx++) { const p = w2s(cx * CW, cy * CH); ctx.fillStyle = rgb(cellCol(cx, cy)); ctx.fillRect(p.x, p.y, CW * z, CH * z); }
        ctx.globalAlpha = 1;
      }
    }

    // WINTER ICE (env.ice): a pale translucent sheet at the surface — thicker and whiter as it grows (snow on top reads as a
    // bright underside), with faint world-anchored cracks; the light under it is already cut by the environment
    if (env.ice > 0.02) {
      const thick = 3 + 9 * env.ice, y0 = Y(0), y1 = Y(thick);
      const ig = ctx.createLinearGradient(0, y0, 0, y1 + 2);
      ig.addColorStop(0, `rgba(${(200 + 30 * vL) | 0},${(222 + 20 * vL) | 0},${(236 + 14 * vL) | 0},${0.55 + 0.35 * env.ice})`);
      ig.addColorStop(1, `rgba(170,200,222,${0.25 * env.ice})`);
      ctx.fillStyle = ig; ctx.fillRect(bx, y0, bw, y1 - y0 + 2);
      ctx.strokeStyle = `rgba(120,150,175,${0.35 * env.ice})`; ctx.lineWidth = Math.max(1, 0.6 * z); ctx.beginPath();
      for (let cxw = Math.floor(vr.x0 / 70) * 70; cxw < vr.x1 + 70; cxw += 70) {
        const j = Math.sin(cxw * 12.9898) * 43758.5453, f = j - Math.floor(j);   // stable per-crack pseudo-random
        ctx.moveTo(X(cxw + f * 40), y0); ctx.lineTo(X(cxw + f * 40 + (f - 0.5) * 30), Y(thick * (0.6 + 0.4 * f)));
      }
      ctx.stroke();
    }

    // the lake bed — a curved basin; earth fills below bedY(x)
    {
      const x0 = Math.max(0, vr.x0), x1 = Math.min(W, vr.x1);
      if (x1 > x0) {
        // world-ALIGNED, power-of-two-quantized grid that always includes the right end (no unfilled strip at the screen
        // edge, no vertex wobble while panning)
        const xs = alignedSamples(x0, x1, quantStep((x1 - x0) / 150, 5), 0, W, this._xs), pts = [];
        let topBedY = Infinity;
        for (const wx of xs) { const p = w2s(wx, bedY(wx)); pts.push(p); if (p.y < topBedY) topBedY = p.y; }
        const sg = ctx.createLinearGradient(0, topBedY, 0, br.y);
        sg.addColorStop(0, rgb([lerp(20, 46, amb), lerp(16, 34, amb), lerp(12, 22, amb)]));
        sg.addColorStop(1, rgb([8, 6, 5]));
        ctx.fillStyle = sg;
        ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
        ctx.lineTo(pts[pts.length - 1].x, br.y + 2); ctx.lineTo(pts[0].x, br.y + 2); ctx.closePath(); ctx.fill();
        // tall screens frame the lake at the top (camera._clamp) and leave spare height under the world box: continue the
        // deepest earth colour down to the screen bottom so it reads as more ground, not a navy letterbox band with a seam
        if (br.y < vh) { ctx.fillStyle = rgb([8, 6, 5]); ctx.fillRect(pts[0].x, br.y + 1, pts[pts.length - 1].x - pts[0].x, vh - br.y); }
        // SEDIMENT texture (clipped to the earth, so nothing spills into the water): a lighter silty band just under the
        // bed surface fading into the dark earth, plus faint strata that follow the bed contour — the bed was one flat
        // dark slab that filled a third of many views.
        {
          const sed = [lerp(50, 112, amb) | 0, lerp(40, 88, amb) | 0, lerp(26, 58, amb) | 0];
          const trace = dy => { ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y + dy); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y + dy); };
          ctx.save(); ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[pts.length - 1].x, br.y + 2); ctx.lineTo(pts[0].x, br.y + 2); ctx.closePath(); ctx.clip();
          ctx.lineJoin = 'round';
          for (const [wu, a] of [[30, 0.10], [16, 0.14], [7, 0.20]]) {   // wide → narrow: a soft falloff below the surface
            ctx.strokeStyle = `rgba(${sed[0]},${sed[1]},${sed[2]},${a})`; ctx.lineWidth = Math.max(2, wu * z * 2); trace(0); ctx.stroke();
          }
          ctx.lineWidth = Math.max(1, 1.3 * z);
          for (const [off, a] of [[40, 0.09], [92, 0.07], [160, 0.05]]) {   // strata: faint lines parallel to the bed
            ctx.strokeStyle = `rgba(${sed[0]},${sed[1]},${sed[2]},${a})`; trace(off * z); ctx.stroke();
          }
          ctx.restore();
        }
        ctx.strokeStyle = `rgba(120,96,64,${0.5 * amb})`; ctx.lineWidth = Math.max(1, z * 1.1);
        ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y); ctx.stroke();
        ctx.globalAlpha = 0.5 * amb; ctx.fillStyle = '#3a2c1e';
        for (let i = 0; i < 160; i++) { const wx = (i * 131) % W; if (wx < x0 || wx > x1) continue; ctx.fillRect(X(wx), Y(bedY(wx) + 2 + (i % 4)), Math.max(1, 2 * z), Math.max(1, z)); }
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
      ctx.fillStyle = `rgba(${lerp(30, 60, amb) | 0},${lerp(34, 58, amb) | 0},${lerp(40, 64, amb) | 0},1)`;   // constant per frame (hoisted)
      const mw = Math.max(1, 2.2 * z), mh = Math.max(1, 1.6 * z);
      for (const m of world.mussels) {
        if (m.x < vr.x0 - 30 || m.x > vr.x1 + 30) continue;
        for (let k = 0; k < m.n; k++) ctx.fillRect(X(m.x + (k - m.n / 2) * 2.4), Y(m.y - (k % 2)), mw, mh);
      }
    }
    // reed clumps on the shallow shores (cover)
    if (world.reeds) {
      for (const r of world.reeds) {
        if (r.x < vr.x0 - 40 || r.x > vr.x1 + 40) continue;
        const light = clamp((0.20 + 0.28 * amb) * floraL, 0, 0.6);   // ~48% L at noon: a living reed green (it peaked near-white before)
        const col = `hsl(95 ${38 * floraS}% ${light * 100}%)`, taper = z >= 2.4;   // close up: tapered stems, not flat-topped bars
        ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = Math.max(1, 1.4 * z);
        if (taper) ctx.beginPath();
        for (let b = 0; b < r.n; b++) {
          const bx = r.x + (b - r.n / 2) * 2.2, h = r.height * (0.7 + 0.3 * ((b * 7) % 5) / 5);
          const sway = Math.sin(t * 1.1 + r.x * 0.05 + b) * 4;
          if (!taper) { ctx.beginPath(); ctx.moveTo(X(bx), Y(r.baseY)); ctx.lineTo(X(bx + sway), Y(r.baseY - h)); ctx.stroke(); continue; }
          const ln = Math.hypot(sway, h) || 1, nx = h / ln, ny = sway / ln, wb = 0.8, wt = 0.1;   // unit normal to the stem
          ctx.moveTo(X(bx - nx * wb), Y(r.baseY - ny * wb)); ctx.lineTo(X(bx + sway - nx * wt), Y(r.baseY - h - ny * wt));
          ctx.lineTo(X(bx + sway + nx * wt), Y(r.baseY - h + ny * wt)); ctx.lineTo(X(bx + nx * wb), Y(r.baseY + ny * wb)); ctx.closePath();
        }
        if (taper) ctx.fill();
      }
    }
    // submerged weed beds — tall macrophyte cover bands reaching up into mid-water (pike/sunfish habitat)
    if (world.weedbeds) {
      ctx.globalAlpha = 0.82;                                  // soft translucent layering → a frond clump, not a wall of bars
      for (const wb of world.weedbeds) {
        if (wb.x < vr.x0 - wb.w - 20 || wb.x > vr.x1 + wb.w + 20) continue;
        const dim = depthDim((wb.top + wb.bot) * 0.5), light = clamp((0.18 + 0.30 * amb) * (0.55 + 0.45 * dim) * floraL, 0, 0.55);   // mid-green at noon
        // many thin blades instead of a few fat strokes; width capped low so a zoomed-in bed reads as grass, not slabs
        const strands = clamp((wb.w / 5) | 0, 9, 20);
        // close up (a blade ≥ ~4 px wide) each blade is a TAPERED RIBBON with a lighter midrib, like eelgrass/Vallisneria;
        // further out a plain stroke (same centreline), which is all a few pixels can show
        const ribbon = z >= 2.4, bw = 1.7;   // blade half-width at the base (world px)
        ctx.lineWidth = clamp(0.85 * z, 1, 3.2);
        for (let s = 0; s < strands; s++) {
          const sx = wb.x + (s - strands / 2) * (wb.w * 2 / strands), segs = ribbon ? 10 : 6;
          const col = `hsl(${128 + (s % 5) * 3} ${44 * floraS}% ${(light * (0.86 + 0.14 * ((s * 7) % 5) / 5)) * 100}%)`;   // faint blade-to-blade hue/shade variation
          const cx = this._bladeX || (this._bladeX = new Float64Array(16)), cy = this._bladeY || (this._bladeY = new Float64Array(16));
          for (let k = 0; k <= segs; k++) {
            const f = k / segs; cy[k] = wb.bot - (wb.bot - wb.top) * f; cx[k] = sx + Math.sin(t * 0.9 + wb.x * 0.04 + s + f * 2) * f * (7 + (s % 3) * 2);
          }
          if (!ribbon) {
            ctx.strokeStyle = col; ctx.beginPath(); ctx.moveTo(X(cx[0]), Y(cy[0]));
            for (let k = 1; k <= segs; k++) ctx.lineTo(X(cx[k]), Y(cy[k]));
            ctx.stroke(); continue;
          }
          // ribbon outline: offset the centreline along its normal by a half-width tapering to a point at the tip
          ctx.fillStyle = col; ctx.beginPath();
          for (let side = -1; side <= 1; side += 2) {
            for (let j = 0; j <= segs; j++) {
              const k = side < 0 ? j : segs - j, k0 = Math.max(0, k - 1), k1 = Math.min(segs, k + 1);
              const tx = cx[k1] - cx[k0], ty = cy[k1] - cy[k0], tl = Math.hypot(tx, ty) || 1, f = k / segs;
              const hw = bw * (1 - f) * (0.75 + 0.25 * Math.sin(Math.PI * Math.min(1, f * 1.6))) * side;
              const px = X(cx[k] - ty / tl * hw), py = Y(cy[k] + tx / tl * hw);
              if (j === 0 && side < 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
          }
          ctx.closePath(); ctx.fill();
          ctx.strokeStyle = `hsla(${118 + (s % 5) * 3} ${36 * floraS}% ${Math.min(80, light * 135) | 0}% / 0.45)`;   // pale midrib
          ctx.lineWidth = Math.max(1, 0.18 * z); ctx.beginPath(); ctx.moveTo(X(cx[0]), Y(cy[0]));
          for (let k = 1; k < segs; k++) ctx.lineTo(X(cx[k]), Y(cy[k]));
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
      // ~44% L at noon (was up to the 0.9 cap → near-WHITE stalks and pads, bleached-coral look), dim at night
      const llight = clamp((0.20 + 0.26 * amb + 0.06 * hgtF) * pdim * floraL, 0, 0.62);
      ctx.strokeStyle = `hsl(${hue} ${(form === 'mat' ? 30 : 45) * floraS}% ${llight * 100}%)`;
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
      // close up, a stalk's leaves are filled lance-shaped blades angled up from the stem; further out a short tick each
      const leafy = form === 'stalk' && z >= 2.4, leaves = leafy ? (this._leaves || (this._leaves = [])) : null;
      if (leaves) leaves.length = 0;
      ctx.beginPath(); ctx.moveTo(X(p.x), Y(p.baseY));
      for (let s = 1; s <= segs; s++) {
        const f = s / segs, ny = p.baseY - p.height * f, nx = p.x + Math.sin(t * 1.3 + p.x * 0.1 + f * 2) * f * f * 6;
        const cx2 = X(nx), cy2 = Y(ny); ctx.lineTo(cx2, cy2);
        if (form === 'stalk' && s % 2 === 0) {
          if (leafy) leaves.push(nx, ny, s % 4 ? 1 : -1);
          else { ctx.lineTo(X(nx + (s % 4 ? 4 : -4) * leafF), Y(ny + 2)); ctx.moveTo(cx2, cy2); }
        }
      }
      ctx.stroke();
      if (leafy && leaves.length) {
        const Lr = 2.4 * leafF;
        ctx.fillStyle = `hsl(${hue} ${45 * floraS}% ${Math.min(70, llight * 112) | 0}%)`; ctx.beginPath();
        for (let i = 0; i < leaves.length; i += 3) {
          const sd = leaves[i + 2], lx = leaves[i] + sd * 0.9 * Lr, ly = leaves[i + 1] - 0.43 * Lr;   // base at the stem, tip up and out
          const rot = -0.45 * sd, rx = Lr * z;   // start each sub-path exactly where its rotated ellipse begins (no joining sliver)
          ctx.moveTo(X(lx) + Math.cos(rot) * rx, Y(ly) + Math.sin(rot) * rx); ctx.ellipse(X(lx), Y(ly), rx, 0.7 * leafF * z, rot, 0, TAU);
        }
        ctx.fill();
      }
      if (form === 'pad') {
        // floating-leaved lily: a broad leaf pad at the top of the stalk (pad size scales with the evolved leaf gene)
        const tx = p.x + Math.sin(t * 1.3 + p.x * 0.1 + 2) * 6, topW = w2s(tx, p.baseY - p.height), r = clamp(p.height * 0.24 * leafF * z, 1.5, 13);
        ctx.fillStyle = `hsl(${hue} ${50 * floraS}% ${llight * 100}%)`; ctx.beginPath(); ctx.ellipse(topW.x, topW.y, r, r * 0.42, 0, 0, TAU); ctx.fill();
      }
    }

    // suspended particulates ("marine snow") — drifting motes through the water column that give the lake body &
    // depth. Position is a stateless function of the render clock (slow sink + sway), wrapped vertically; culled to
    // the visible rect and never drawn through the bed. Dimmer in the deep / murk. Cosmetic; never the seeded sim RNG.
    {
      const clar = env.clarity ? env.clarity() : 1, amb2 = 0.3 + 0.7 * vL;
      ctx.fillStyle = '#d2e8f0';
      for (const m of this.motes) {
        if (m.r * z * 0.5 < 0.4) continue;        // sub-pixel at this zoom → skip (invisible; saves arcs at whole-lake)
        const y = (m.y0 + t * m.spd) % H, x = m.x + Math.sin(t * m.swayF + m.ph) * m.swayA;
        if (x < vr.x0 || x > vr.x1 || y < vr.y0 || y > vr.y1 || y > bedY(x)) continue;
        const rr = Math.max(0.6, m.r * z * 0.5);
        ctx.globalAlpha = clamp(m.br * 0.5 * amb2 * clar * depthDim(y), 0, 0.7);
        ctx.beginPath(); ctx.arc(X(x), Y(y), rr, 0, TAU); ctx.fill();
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
        const px = X(x), py = Y(y), rr = Math.max(0.8, b.r * z * 0.5), a = clamp((0.18 + 0.5 * (1 - y / H)) * (0.4 + 0.6 * vL), 0, 0.7);
        ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(px, py, rr, 0, TAU); ctx.stroke();
        ctx.globalAlpha = a * 0.85; ctx.beginPath(); ctx.arc(px - rr * 0.32, py - rr * 0.32, Math.max(0.5, rr * 0.3), 0, TAU); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // plankton & detritus (culled)
    const pPx = clamp(z, 1, 3);
    // zooplankton are invisible at lake scale: at the whole-lake view ~2000 full-opacity 1-px specks read as snow/static
    // and drown out the fish, so fade them with zoom (faint overview → full as you close in, where they read as drift)
    const pFade = clamp((cam.zoom / cam.fitZoom - 1) / 4, 0.22, 1);
    ctx.fillStyle = '#bff0d8'; ctx.globalAlpha = (0.22 + 0.48 * vL) * pFade;
    for (const p of world.plankton) {
      if (p.x < vr.x0 || p.x > vr.x1 || p.y < vr.y0 || p.y > vr.y1) continue;
      ctx.fillRect(X(p.x) | 0, Y(p.y) | 0, pPx, pPx);
    }
    ctx.globalAlpha = 0.6; ctx.fillStyle = '#6b4a2a';
    for (const d of world.detritus) {
      if (d.x < vr.x0 || d.x > vr.x1 || d.y < vr.y0 || d.y > vr.y1) continue;
      ctx.fillRect(X(d.x) | 0, Y(d.y) | 0, pPx, pPx);
    }
    // benthic insect larvae — small specks on the bed, a touch brighter/greener as they near emergence
    if (world.larvae) { ctx.globalAlpha = 0.7;
      for (const L of world.larvae) {
        if (L.x < vr.x0 || L.x > vr.x1 || L.y < vr.y0 || L.y > vr.y1) continue;
        ctx.fillStyle = L.dev > 0.7 ? '#a89a44' : '#6f7a3c'; ctx.fillRect(X(L.x) | 0, Y(L.y) | 0, pPx, pPx);
      }
    }
    // emerged surface insects — pale drifting specks at the waterline that flutter (a visible hatch); fade as they age
    if (world.insects) { ctx.fillStyle = '#ece6c4';
      for (const I of world.insects) {
        if (I.x < vr.x0 || I.x > vr.x1) continue;
        const fy = I.y + Math.sin(t * 9 + I.wob) * 1.3;
        if (fy < vr.y0 || fy > vr.y1) continue;
        ctx.globalAlpha = (0.45 + 0.5 * vL) * clamp(I.life / 2, 0.3, 1);
        ctx.fillRect(X(I.x) | 0, Y(fy) | 0, Math.max(1, pPx), Math.max(1, pPx));
      }
    }
    // benthic snails — tiny shells crawling the lit bed (olive-tan domes; dim with depth)
    if (world.snails) {
      ctx.globalAlpha = 0.85;
      for (const sn of world.snails) {
        if (sn.x < vr.x0 - 6 || sn.x > vr.x1 + 6 || sn.y < vr.y0 - 6 || sn.y > vr.y1 + 6) continue;
        const p = pt(sn.x, sn.y), dim = 0.5 + 0.5 * depthDim(sn.y), r = clamp(1.7 * z, 1, 5);
        ctx.fillStyle = `hsl(50 ${Math.round(32 * floraS)}% ${Math.round(lerp(26, 48, amb) * dim * floraL)}%)`;
        ctx.beginPath(); ctx.ellipse(p.x, p.y - r * 0.5, r, r * 0.85, 0, 0, TAU); ctx.fill();
      }
    }
    // benthic crayfish — rusty omnivores on the bed; legs/claws wiggle. Far: a rust blob. Near: a little body + claws + tail.
    if (world.cray) {
      for (const cf of world.cray) {
        if (cf.x < vr.x0 - 16 || cf.x > vr.x1 + 16 || cf.y < vr.y0 - 16 || cf.y > vr.y1 + 16) continue;
        const p = pt(cf.x, cf.y), dim = 0.55 + 0.45 * depthDim(cf.y), col = `hsl(14 ${Math.round(52 * floraS)}% ${Math.round(lerp(30, 50, amb) * dim * floraL)}%)`;
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

    if (world.birds && world.birds.length) this._drawBirds(ctx, world, t, z, X, Y, vr);

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

    // OVERLAYS — burst ripple rings, selection ring, surface ripple line, rain, lightning. They must sit OVER the fish. On
    // the 2D fish path they draw straight into the scene (the fish are already in it). On the GL-fish path the fish are
    // composited later on the GPU, so the overlays draw into a small bbox-sized overlay canvas that GLPost blends over
    // the GL fish (then bloom/grade apply to everything together).
    const rainI = [0, 0, 0.6, 1][env.weather];
    const surfVis = by < vh && by + bh > 0;
    const al = this._alpha, selX = sel ? X(interpX(sel, al)) : 0, selY = sel ? Y(interpY(sel, al)) : 0;
    const selR = sel ? (sel.sp.ringR * (0.5 + 0.5 * (sel.grow ?? 1)) + 2 + Math.sin(t * 5) * 0.6) * z : 0;
    const drawOverlays = g => {
      for (const r of this._ovCmds) {   // GL mode only (2D mode draws these inline in _fish)
        g.globalAlpha = r.a; g.strokeStyle = 'rgba(214,238,255,1)'; g.lineWidth = r.lw;
        g.beginPath(); g.arc(r.x, r.y, r.r, 0, TAU); g.stroke();
      }
      g.globalAlpha = 1;
      if (sel) { g.globalAlpha = 0.9; g.strokeStyle = '#ffd27a'; g.lineWidth = 1.4; ring(g, selX, selY, selR); g.globalAlpha = 1; }
      // surface ripple + rain (surface band, world y≈1) — world-aligned samples that always reach the right edge
      if (surfVis) {
        g.strokeStyle = `rgba(${top[0] | 0},${top[1] | 0},${top[2] | 0},0.8)`; g.lineWidth = 1; g.beginPath();
        let s = 6; while (s * z > 10 && s > 0.375) s /= 2;   // ≤ ~10 px per segment; power-of-two → stable grid
        const xs = alignedSamples(Math.max(0, vr.x0), Math.min(W, vr.x1), s, 0, W, this._xs);
        for (let i = 0; i < xs.length; i++) {
          const x = xs[i], sx = X(x), sy = Y(1 + Math.sin(x * 0.15 + t * 2) * 1.2 * (1 + rainI));
          if (i === 0) g.moveTo(sx, sy); else g.lineTo(sx, sy);
        }
        g.stroke();
        if (rainI > 0) {
          g.strokeStyle = `rgba(195,220,240,${0.5 * rainI})`; g.beginPath();
          const drops = Math.min(160, (vr.x1 - vr.x0) * 0.03 * rainI) | 0;
          for (let i = 0; i < drops; i++) { const wx = lerp(Math.max(0, vr.x0), Math.min(W, vr.x1), Math.random()); const sx = X(wx), sy = Y(1 + Math.sin(wx * 0.15 + t * 2) * 1.2); g.moveTo(sx, sy - 2 * z); g.lineTo(sx, sy + 3 * z); }
          g.stroke();
        }
      }
      if (env.flash > 0) { g.globalAlpha = 1; const a = env.flash, lg = g.createLinearGradient(0, by, 0, by + bh * 0.72); lg.addColorStop(0, `rgba(228,236,255,${0.42 * a})`); lg.addColorStop(1, 'rgba(228,236,255,0)'); g.fillStyle = lg; g.fillRect(bx, by, bw, bh * 0.72); }
    };
    let overlay = null;
    if (this.glFish) {
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      const add = (ax0, ay0, ax1, ay1) => { if (ax0 < x0) x0 = ax0; if (ay0 < y0) y0 = ay0; if (ax1 > x1) x1 = ax1; if (ay1 > y1) y1 = ay1; };
      for (const r of this._ovCmds) add(r.x - r.r - 3, r.y - r.r - 3, r.x + r.r + 3, r.y + r.r + 3);
      if (sel && selX + selR > 0 && selX - selR < vw && selY + selR > 0 && selY - selR < vh) add(selX - selR - 3, selY - selR - 3, selX + selR + 3, selY + selR + 3);
      if (surfVis) add(bx, by - 3.4 * z - 4, bx + bw, by + 6.4 * z + 4);   // line ±2.4 units around y=1, rain −2z..+3z
      if (env.flash > 0) add(bx, by, bx + bw, by + bh * 0.72);
      x0 = Math.max(0, Math.floor(x0)); y0 = Math.max(0, Math.floor(y0)); x1 = Math.min(vw, Math.ceil(x1)); y1 = Math.min(vh, Math.ceil(y1));
      if (x1 > x0 && y1 > y0) {
        const ow = Math.min(vw, Math.ceil((x1 - x0) / 64) * 64), oh = Math.min(vh, Math.ceil((y1 - y0) / 64) * 64);   // rounded → few reallocs
        if (!this._ovC) { this._ovC = this.mkCanvas(ow, oh); this._ovG = this._ovC.getContext('2d'); }
        else if (this._ovC.width !== ow || this._ovC.height !== oh) { this._ovC.width = ow; this._ovC.height = oh; }
        const og = this._ovG;
        og.setTransform(1, 0, 0, 1, 0, 0); og.globalAlpha = 1; og.clearRect(0, 0, ow, oh);
        og.setTransform(1, 0, 0, 1, -x0, -y0); og.lineCap = 'round';
        drawOverlays(og);
        og.setTransform(1, 0, 0, 1, 0, 0);
        overlay = { canvas: this._ovC, x: x0, y: y0 };
      }
    } else drawOverlays(ctx);

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
      // Sun UV for the GL god-rays, in FRAG_COMP's uv space: the fullscreen pass has uv.y = 0 at the screen BOTTOM (vUv = p,
      // gl_Position = p*2-1, scene uploaded with UNPACK_FLIP_Y), so the screen-top-origin sun y MUST be inverted:
      // v = 1 - sp.y/height. sunInt ramps in as the disc climbs into frame & tracks day/night; sunUp gates the
      // caustics/sheen to "sun above water". (`sp`/`sunY` in scope.)
      const su = sp.x / this.scene.width, sv = 1 - sp.y / this.scene.height;
      let sunInt = clamp(env.light * 1.15, 0, 1) * clamp(sp.y / (this.scene.height * 0.18), 0, 1);
      // the shader's frame-fade zeroes the rays once the sun is ≥0.6 UV outside the frame → skip the 24-tap march entirely
      if (Math.max(-su, su - 1, -sv, sv - 1) >= 0.6) sunInt = 0;
      const sunUp = clamp(env.light, 0, 1) * clamp((26 - sunY) / 26 + 0.4, 0, 1);
      // GL-lit fish (Pass 3/slice 3): corpses first so they draw UNDER the living, matching the 2D order. The haze
      // params are the 2D depth-haze gradient's (hz/maxA over the world box by..by+bh) so a GL fish is hazed per pixel
      // exactly like a 2D fish under that gradient.
      const fishParams = this.glFish ? this._glCorpse.concat(this._glLiving) : null;
      this.present.present(this.scene, {
        // dawn/dusk warmth belongs near the surface: the GL grade warms the whole frame, which turned DEEP close-ups a
        // muddy brown at sunrise — scale it down as the top of the view sinks below the surface (full when it's in frame)
        time: t, light: vL, turbidity: env.turbidity || 0, night, warm: warmth * (1 - 0.85 * clamp((vr.y0 / H - 0.05) / 0.45, 0, 1)), flash: 0,
        zoom: cam.zoom / (cam.fitZoom || cam.zoom || 1),   // DPR- & size-independent zoom (1 = whole lake)
        dpr: this.dpr,
        secchiFrac: clamp((env.secchiDepth ? env.secchiDepth() : H) / H, 0, 1), clarity: env.clarity ? env.clarity() : 1,
        sunUV: [su, sv], sunInt, sunUp,
        fish: fishParams, overlay,
        hazeTint: [lerp(16, 30, murk), lerp(40, 54, murk), lerp(66, 40, murk)],
        hazeMax: clamp(0.14 + 0.5 * murk, 0.14, 0.5) * (0.35 + 0.65 * amb),
        hazeBox: [by, bh],
      });
    }
  }

  // a visiting LOON (world.birds): underwater it's seen whole — black head with a dagger bill and red eye, a checkered back,
  // white belly, the feet set far back kicking as it swims, a thin bubble trail; resting on the surface only its belly and
  // paddling feet show below the waterline (an underwater view of a floating bird). Render-only animation (Math.random).
  _drawBirds(ctx, world, t, z, X, Y, vr) {
    const L = BIRD.LEN, lit = 0.35 + 0.65 * (this._vL ?? 1);
    const shade = (r, g, b) => `rgb(${(r * lit) | 0},${(g * lit) | 0},${(b * lit) | 0})`;
    for (const b of world.birds) {
      if (b.x < vr.x0 - L || b.x > vr.x1 + L || b.y > vr.y1 + L) continue;
      const surf = b.st === 0, cx = X(b.x), cy = surf ? Y(-L * 0.07) : Y(b.y), ang = surf ? 0 : b.h;
      const flip = Math.cos(ang) < 0 ? -1 : 1, s = z;
      ctx.save();
      if (surf) { ctx.beginPath(); ctx.rect(cx - L * s, Y(0), L * 2 * s, L * s); ctx.clip(); }   // only what's below the waterline
      ctx.translate(cx, cy); ctx.rotate(ang); ctx.scale(s, s * flip);
      const kick = Math.sin(t * (surf ? 5 : 9) + b.x * 0.1);
      // feet: set far back, trailing and kicking (webbed lobes)
      ctx.strokeStyle = shade(40, 44, 48); ctx.lineWidth = L * 0.022;
      for (const side of [-1, 1]) {
        const fx = -L * 0.5 - L * 0.12, fy = L * 0.06 + side * kick * L * 0.07;
        ctx.beginPath(); ctx.moveTo(-L * 0.42, L * 0.06); ctx.lineTo(fx, fy); ctx.stroke();
        ctx.fillStyle = shade(36, 40, 44); ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx - L * 0.1, fy - L * 0.04); ctx.lineTo(fx - L * 0.1, fy + L * 0.05); ctx.closePath(); ctx.fill();
      }
      // body: dark back, white belly
      ctx.fillStyle = shade(24, 29, 34); ctx.beginPath(); ctx.ellipse(0, 0, L * 0.46, L * 0.15, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = shade(214, 220, 224); ctx.beginPath(); ctx.ellipse(L * 0.02, L * 0.07, L * 0.38, L * 0.075, 0, 0, TAU); ctx.fill();
      // checkered back: rows of small white spots
      ctx.fillStyle = shade(196, 204, 210);
      for (let i = 0; i < 7; i++) for (let j = 0; j < 2; j++) { const px = -L * 0.3 + i * L * 0.08 + j * L * 0.04, py = -L * 0.09 + j * L * 0.04; ctx.fillRect(px, py, L * 0.025, L * 0.02); }
      // neck + head, dagger bill, red eye, white necklace
      ctx.fillStyle = shade(18, 22, 26); ctx.beginPath(); ctx.ellipse(L * 0.4, -L * 0.08, L * 0.13, L * 0.085, -0.35, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(L * 0.52, -L * 0.13, L * 0.09, L * 0.07, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = shade(70, 76, 82); ctx.beginPath(); ctx.moveTo(L * 0.58, -L * 0.15); ctx.lineTo(L * 0.8, -L * 0.115); ctx.lineTo(L * 0.58, -L * 0.095); ctx.closePath(); ctx.fill();
      ctx.fillStyle = `rgb(${(170 * lit + 30) | 0},30,24)`; ctx.beginPath(); ctx.arc(L * 0.55, -L * 0.145, L * 0.018, 0, TAU); ctx.fill();
      ctx.strokeStyle = shade(190, 198, 204); ctx.lineWidth = L * 0.012; ctx.beginPath(); ctx.moveTo(L * 0.36, -L * 0.15); ctx.lineTo(L * 0.42, -L * 0.03); ctx.stroke();
      ctx.restore();
      // bubble trail while diving
      if (!surf) {
        ctx.fillStyle = `rgba(210,232,244,${0.35 * lit})`;
        for (let k = 1; k <= 5; k++) {
          const back = k * L * 0.18, wob = Math.sin(t * 3 + k * 1.7) * L * 0.05;
          const bx = b.x - Math.cos(b.h) * back + wob, by = b.y - Math.sin(b.h) * back - k * 1.5;
          ctx.beginPath(); ctx.arc(X(bx), Y(by), Math.max(0.7, (1.4 - k * 0.15) * z * 0.6), 0, TAU); ctx.fill();
        }
      }
    }
  }

  // returns 1 for sprite tier, 0 for dot tier
  _fish(ctx, a, t, env, cam) {
    const rdt = this._rdt, al = this._alpha, z = cam.zoom, ox = cam.vw / 2 - cam.cx * z, oy = cam.vh / 2 - cam.cy * z;
    // render pose = lerp(previous, current sim state, alpha) (render-only _px/_py/_ph snapshots taken by main.js)
    const ax = interpX(a, al), ay = interpY(a, al), ah = displayHeading(interpH(a, al), a.faceTarget);
    // ease the visual heading so sim snaps (wall redirects) read smoothly — but a fish that was NOT drawn last frame (it
    // just entered view after a pan / tour cut, or is new) SNAPS its heading & facing instead of spinning from a stale
    // value. `_rFrame` is a render-only last-drawn frame stamp (like rHeading/vis — never read by the sim, not saved).
    const fresh = a._rFrame !== this._frameNo - 1; a._rFrame = this._frameNo;
    if (fresh || a.rHeading === undefined) { a.rHeading = ah; a.faceTarget = a.facing = Math.cos(ah) < 0 ? -1 : 1; }
    else a.rHeading += angDiff(ah, a.rHeading) * (1 - Math.exp(-rdt * 10));
    // only a NEWBORN fades in. vis starts at 0 when a fish is created and used to ease up only once it was first DRAWN, so on
    // every tour cut / pan the fish born out of view since appeared as see-through ghosts materialising.
    if (a.vis === undefined || (fresh && (a.age ?? 99) > 2)) a.vis = 1;
    a.vis += (1 - a.vis) * (1 - Math.exp(-rdt * 2.5));

    const grow = a.grow ?? 1;
    const Sworld = a.size * FISH_SCALE * (0.42 + 0.58 * grow);
    const sPx = Sworld * z;
    const px = ax * z + ox, py = ay * z + oy;
    // FAR TIER: a tiny ORIENTED FISH GLYPH (body ellipse along the heading + a tail fin, in the species' own proportions)
    // instead of a square dot — so a zoomed-out lake reads as fish swimming somewhere, not specks. A minimum length that
    // scales with the screen (~4.5px small → ~8px at 1080p → 14px at 4K) keeps the overview legible on a big display.
    // The glyph→sprite switch happens exactly where the sprite's natural length reaches that minimum, so zooming in
    // doesn't make fish visibly SHRINK at the LOD boundary (no pop). Same night look as the sprites, dimmed with depth.
    // sprite geometry (species.js drawFish): body −L..+L (2L fish-units, half-height Hh) + a tail of tail.len behind; on
    // screen 1 fish-unit = sPx px, so the sprite's true length is sPx·(2L + tail) — the glyph uses the same proportions
    const P = a.sp.P || { L: 3, Hh: 1.2 }, tl0 = (P.tail && P.tail.len) || 1.5, tot = 2 * P.L + tl0;
    const minLen = clamp(cam.vw / 240, 4.5, 14), natLen = sPx * tot;
    if (sPx < DOT_PX || natLen < minLen) {
      const ang = a.rHeading, ca = Math.cos(ang), sa = Math.sin(ang);
      const len = Math.max(minLen, natLen), bodyL = len * (2 * P.L / tot), tailL = len * (tl0 / tot);
      const wid = Math.max(1.6, len * (2 * P.Hh / tot));
      const lgt = this._vL ?? env.light, Lb = (a.sp.lbase + 0.5 * a.sp.lrange) * (0.30 + 0.70 * lgt) * (0.55 + 0.45 * depthDim(ay));
      ctx.globalAlpha = clamp(0.72 + 0.2 * sPx, 0.72, 1) * a.vis;
      ctx.fillStyle = rgb(hsl(a.hue, 0.75 * a.sp.sat * (0.35 + 0.65 * lgt), Math.min(78, Lb + 8)));   // muted: distant fish, not confetti
      ctx.beginPath(); ctx.ellipse(px, py, bodyL * 0.5, wid * 0.5, ang, 0, TAU); ctx.fill();          // body centred on the fish, like the sprite
      const tx = px - ca * bodyL * 0.46, ty = py - sa * bodyL * 0.46, tl = tailL, tw = wid * 0.55;    // forked tail behind the body
      ctx.beginPath(); ctx.moveTo(tx, ty);
      ctx.lineTo(tx - ca * tl - sa * tw, ty - sa * tl + ca * tw); ctx.lineTo(tx - ca * tl + sa * tw, ty - sa * tl - ca * tw);
      ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1; return 0;
    }
    // swimming EFFORT (gait): how hard the fish is actually working = thrust + speed, boosted by an active
    // flee/strike burst and suppressed by a HIDE freeze. Drives both the tail-beat FREQUENCY (here) and the body
    // undulation AMPLITUDE (the sprite, via the drive bucket). Pure render (sim-state read).
    const act = a.act, flee = act ? act.flee : 0, strike = act ? act.strike : 0, hide = act ? act.hide : 0;
    const spdN = clamp(a.spd / (a.maxSpeed || 30), 0, 1);
    const drive = clamp(0.45 * (a.thrustSmooth ?? 0.4) + 0.55 * spdN + 0.45 * flee + 0.3 * strike - 0.85 * hide, 0.05, 1);
    const cphase = t * (0.8 + 2.6 * drive) + a.id * 1.7;   // beat rate rises with effort (glide ≈ slow, sprint ≈ fast)
    const frame = Math.floor((((cphase % TAU) + TAU) % TAU) / TAU * this.sprites.FRAMES);
    // depth-shaded + effort-coupled sprite. GL path: one FULL-LIGHT sprite per bucket (the light×depth dim is applied in
    // the shader via `bright`, continuous) → the light bucket drops out of the GL working set (no ~10×/day rebuild churn).
    const lit = (this._vL ?? env.light) * depthDim(ay);
    const sprite = this.sprites.get(a, frame, this.glFish ? 1 : lit, drive, resTier(sPx), this.glFish);
    // Keep the whole sprite inside the water body (the sim clamps the CENTRE to the bed/surface): inset the DRAW position
    // by the rotated body half-extent. Render-only: sim positions / determinism are untouched.
    const ich = Math.cos(a.rHeading), ish = Math.sin(a.rHeading);   // (P = a.sp.P, declared above for the LOD switch)
    const halfLen = (P.L + (P.tail ? P.tail.len : 1.2)) * Sworld;   // nose↔tail reach (world px)
    const halfHt = P.Hh * Sworld * 1.25;                           // body depth + headroom for body-gene & body wave
    const half = Math.abs(ish) * halfLen + Math.abs(ich) * halfHt; // vertical reach of the rotated body
    const ibed = bedY(ax), ilo = Math.min(half, ibed * 0.45), ihi = Math.max(ilo, ibed - half);
    const p2x = px, p2y = clamp(ay, ilo, ihi) * z + oy;
    // soft CONTACT SHADOW on the bed for a fish hovering near it — one cached soft-blob sprite stretched to the ellipse
    // (was a per-fish radial gradient + save/restore).
    const gapBed = ibed - ay;
    if (gapBed > -3 && gapBed < halfHt * 5) {
      const sh = clamp(1 - gapBed / (halfHt * 5), 0, 1) * a.vis;
      if (sh > 0.004) {
        const scx = px, scy = (ibed - 1) * z + oy, rx = Math.max(2, halfLen * 0.85 * z), ry = Math.max(1.2, halfHt * 0.5 * z);
        ctx.globalAlpha = 0.3 * sh; ctx.drawImage(this._shadowSprite(), scx - rx, scy - ry, rx * 2, ry * 2); ctx.globalAlpha = 1;
      }
    }
    // facing (left/right sprite mirror): EASE it through a quick belly-roll instead of an instant mirror snap. The TARGET
    // uses wide hysteresis (±0.30 cos) so a fish hovering near-vertical never flip-flops.
    const c = Math.cos(a.rHeading);
    let ft = a.faceTarget ?? 1; if (c < -0.30) ft = -1; else if (c > 0.30) ft = 1; a.faceTarget = ft;
    if (a.facing === undefined) a.facing = ft;
    a.facing += (ft - a.facing) * (1 - Math.exp(-rdt * 16));
    let vf = a.facing; if (Math.abs(vf) < 0.14) vf = vf < 0 ? -0.14 : 0.14;
    const s = sPx / sprite.base;
    if (this.glFish) {
      // collect a GL quad instead of the 2D blit; GLPost draws it as a lit textured quad (uses the SAME p2/heading/sPx/vf).
      // bright = the sprite's HSL light dim for this fish's light×depth, relative to the full-light sprite (=1).
      // the swim, continuous (no 10-frame quantization): drawFish's travelling wave + tail swing for this phase & effort,
      // in fish units, plus the sprite's extent in fish units so FRAG_FISH can map texels to body positions
      const m = this.sprites._morphVal(this.sprites._morphBucket(a)), Hb = P.Hh * m.body;
      const wave = [Hb * (0.09 + 0.20 * drive), cphase, Math.sin(cphase) * Hb * (0.35 + 0.5 * drive), P.L];
      const waveG = [(P.tail ? P.tail.len : 1.2) * m.fin, sprite.canvas.width / sprite.base, sprite.canvas.height / sprite.base];
      this._glLiving.push({ sprite, sx: p2x, sy: p2y, rot: a.rHeading, sPx, facing: vf, vis: a.vis, kind: 0, wave, waveG,
        ...fishLook(lit) });
    } else {
      ctx.save();
      ctx.globalAlpha = a.vis;
      ctx.translate(p2x, p2y); ctx.rotate(a.rHeading); ctx.scale(s, vf * s);
      ctx.drawImage(sprite.canvas, -sprite.cx, -sprite.cy);
      ctx.restore();
      ctx.globalAlpha = 1;
    }
    // strike / flee BURST → a quick expanding ripple ring, EDGE-triggered (fires once per lunge). `a._burst`/`a._fxAt` are
    // transient render fields (like `a.vis`). GL path: queued to the overlay so the ring sits OVER the GL fish.
    const burst = Math.max(strike, flee * 0.85);
    if (burst > 0.62 && !a._burst) { a._burst = 1; a._fxAt = t; } else if (burst < 0.4) a._burst = 0;
    if (a._fxAt !== undefined) {
      const age = t - a._fxAt;
      if (age >= 0 && age < 0.4) {
        const f = age / 0.4, rr = (halfLen * 0.7 + f * halfLen * 2.4) * z, ra = (1 - f) * 0.42 * a.vis, lw = Math.max(1, 2.2 * (1 - f));
        if (this.glFish) this._ovCmds.push({ x: p2x, y: p2y, r: rr, a: ra, lw });
        else {
          ctx.globalAlpha = ra; ctx.strokeStyle = 'rgba(214,238,255,1)'; ctx.lineWidth = lw;
          ctx.beginPath(); ctx.arc(p2x, p2y, rr, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1;
        }
      }
    }
    return 1;
  }
  // a soft black elliptical blob (alpha 1 → 0 radially), built once; stretched per fish for the contact shadow
  _shadowSprite() {
    if (!this._shC) {
      const S = 64, c = this.mkCanvas(S, S), g = c.getContext('2d');
      const rg = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
      rg.addColorStop(0, 'rgba(0,0,0,1)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = rg; g.fillRect(0, 0, S, S); this._shC = c;
    }
    return this._shC;
  }

  // a recently-dead body: static sprite, sinking, rolling belly-up, fading out
  _corpse(ctx, c, env, cam) {
    const grow = c.grow ?? 1, Sworld = c.size * FISH_SCALE * (0.42 + 0.58 * grow), sPx = Sworld * cam.zoom;
    const p = cam.worldToScreen(c.x, c.y), alpha = clamp(c.t / (c.t0 || 1.4), 0, 1);
    if (sPx < DOT_PX) {
      ctx.globalAlpha = alpha * 0.6;
      ctx.fillStyle = rgb(hsl(c.hue, Math.max(6, c.sp.sat - 18), (c.sp.lbase + 0.3 * c.sp.lrange) * (0.4 + 0.5 * (this._vL ?? env.light)) * depthDim(c.y)));
      const d = Math.max(2, Math.round(sPx * 1.5)); ctx.fillRect((p.x - d / 2) | 0, (p.y - d / 2) | 0, d, d);
      ctx.globalAlpha = 1; return;
    }
    const lit = (this._vL ?? env.light) * 0.85 * depthDim(c.y);
    const sprite = this.sprites.get(c, 0, this.glFish ? 1 : lit, 0.1, resTier(sPx));   // a dead fish barely undulates
    // same boundary inset as live fish, so a belly-up corpse resting on the bed doesn't sink into the bank
    const P = c.sp.P, ich = Math.cos(c.rHeading), ish = Math.sin(c.rHeading);
    const half = Math.abs(ish) * (P.L + (P.tail ? P.tail.len : 1.2)) * Sworld + Math.abs(ich) * P.Hh * Sworld * 1.25;
    const ibed = bedY(c.x), ilo = Math.min(half, ibed * 0.45), ihi = Math.max(ilo, ibed - half);
    const p2 = cam.worldToScreen(c.x, clamp(c.y, ilo, ihi));
    const vf = Math.cos(c.rHeading) < 0 ? -1 : 1, s = sPx / sprite.base;
    let ys = vf * (1 - 2 * clamp(c.roll, 0, 1)); if (Math.abs(ys) < 0.06) ys = 0.06 * (ys < 0 ? -1 : 1); // belly-up roll, never a 0-scale
    if (this.glFish) {
      // GL quad (drawn UNDER the living fish — corpses are collected first). facing carries the belly-roll y-sign.
      this._glCorpse.push({ sprite, sx: p2.x, sy: p2.y, rot: c.rHeading, sPx, facing: ys, vis: alpha * 0.92, kind: 1,
        ...fishLook(lit) });
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
    { const ml = visLight(env.light); mctx.fillStyle = rgb([lerp(8, 30, ml), lerp(16, 60, ml), lerp(30, 78, ml)]); } mctx.fillRect(0, 0, mw, mh);
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
