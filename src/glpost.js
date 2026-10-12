// src/glpost.js — browser-layer WebGL2 post-processing presenter (Graphics Pass 3).
// Composites the already-rendered 2D scene canvas to the visible #tank canvas through GPU shaders.
// Feature-detects a REAL WebGL2 context; the smoke stub's getContext returns a 2D-ish object for any
// arg (no createProgram/TEXTURE_2D/createFramebuffer) so isRealGL2 is false -> Canvas2DPresenter.
// Animation uses the render clock passed in params, never core.rand.
//
// FAILURE MODEL (audit Tier 2 #9). A canvas has ONE context type: once getContext('webgl2') succeeds on #tank,
// getContext('2d') on it returns null forever. So:
//  - makePresenter PROBES WebGL2 on a THROWAWAY canvas (compiles + links every program, checks the render targets)
//    before it ever touches #tank; a probe failure leaves #tank context-free → the Canvas2D fallback can attach.
//  - every failure is logged (console.warn / console.error) — nothing is swallowed silently.
//  - a fatal runtime failure (present threw, restore rebuild failed) sets `failed`; a context loss sets `lost`/`lostAt`.
//    The Renderer polls `failed` / lost-too-long and swaps #tank for a FRESH canvas bound to a Canvas2DPresenter
//    (render.js _fallbackTo2D). A Canvas2DPresenter that cannot get a 2D context reports `needsCanvas`.
//
// ORIENTATION. The fullscreen pass sets vUv = p, gl_Position = p*2-1 and the scene is uploaded with UNPACK_FLIP_Y, so in
// texture/screen-UV space uv.y = 0 is the screen BOTTOM. Every depth-dependent term uses `dpt = 1 - uv.y` (0 = top =
// the water surface); the sun UV passed in params is in the same space (render.js sends v = 1 - sunScreenY/height).

function isRealGL2(gl){
  return !!gl
    && typeof gl.createProgram === 'function'
    && typeof gl.createFramebuffer === 'function'
    && typeof gl.texImage2D === 'function'
    && typeof gl.getExtension === 'function'
    && typeof gl.TEXTURE_2D === 'number'
    && typeof gl.FRAMEBUFFER === 'number'
    && typeof gl.COLOR_BUFFER_BIT === 'number';
}
const GL_ATTRS = { alpha:false, antialias:false, depth:false, stencil:false,
  premultipliedAlpha:false, preserveDrawingBuffer:false, powerPreference:'high-performance' };
const warn = (...a) => { if (typeof console !== 'undefined') console.warn(...a); };
const err = (...a) => { if (typeof console !== 'undefined') console.error(...a); };

// Shader clock wrap (audit: uTime unbounded → float32 precision decays over long screensaver runs). Every periodic term in
// FRAG_COMP is sin(k·t) with k ∈ {0.5,0.6,0.7,0.9,1.05,1.1,1.6,1.7,2.0}; k·(40π)/(2π) = 20k is an INTEGER for all of them,
// so wrapping t at a multiple of 40π keeps those terms exactly continuous. ×28 → a ~58.6-minute period. The only seam
// (once per period) is the slow non-periodic vnoise drift of the caustic-net domain warp and the per-frame grain seed.
export const SHADER_TIME_PERIOD = 40 * Math.PI * 28;
export function wrapShaderTime(t){ const p = SHADER_TIME_PERIOD; t = +t || 0; return ((t % p) + p) % p; }

// Alpha-BLEED (audit: GL fish dark fringe). Sprite texels are uploaded with STRAIGHT alpha and filtered bilinearly /
// mip-mapped; a transparent texel stored as (0,0,0,0) drags filtered edge colour toward black (C·w, then ×a again in the
// shader → C·w²). This floods each transparent (or near-transparent, colour-unreliable) texel's RGB from its nearest
// reliable neighbours (alpha-weighted mean, BFS layer by layer, O(pixels)); ALPHA IS NEVER CHANGED, so the coverage is
// identical — only the colour that filtering mixes in across the silhouette is now the edge's own colour. Works in the
// stored sRGB bytes; SRGB8_ALPHA8 decodes each texel before filtering, so a neighbour-colour fill is sRGB-correct.
// Bleeds `maxLayers` px out from the silhouette (covers the bilinear + first mip levels); texels beyond get the
// alpha-weighted MEAN sprite colour (what the deep mips average toward anyway). Pure (typed-array in/out) → smoke-tested.
export function bleedAlpha(d, w, h, minA = 8, maxLayers = 8){
  const n = w * h; if (n <= 0) return d;
  const st = new Uint8Array(n);           // 0 = needs colour, 1 = reliable/filled, 2 = queued
  const wt = new Float32Array(n);         // colour weight of a filled texel (its alpha if original, 64 if bled)
  let mr = 0, mg = 0, mb = 0, mw = 0;
  for (let i = 0, j = 0; i < n; i++, j += 4){ const a = d[j + 3]; if (a >= minA){ st[i] = 1; wt[i] = a; mr += d[j] * a; mg += d[j + 1] * a; mb += d[j + 2] * a; mw += a; } }
  if (mw === 0) return d;                 // nothing opaque → nothing to bleed
  let cur = new Int32Array(n), nxt = new Int32Array(n), nc = 0, nn = 0;
  const push = (arr, len, i) => { arr[len] = i; return len + 1; };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++){
    const i = y * w + x; if (st[i] !== 0) continue;
    const y0 = y > 0 ? -1 : 0, y1 = y < h - 1 ? 1 : 0, x0 = x > 0 ? -1 : 0, x1 = x < w - 1 ? 1 : 0;
    let near = false;
    for (let dy = y0; dy <= y1 && !near; dy++) for (let dx = x0; dx <= x1; dx++) if (st[i + dy * w + dx] === 1){ near = true; break; }
    if (near){ st[i] = 2; nc = push(cur, nc, i); }
  }
  const col = new Float32Array(4);
  for (let layer = 0; nc > 0 && layer < maxLayers; layer++){
    for (let k = 0; k < nc; k++){
      const i = cur[k], x = i % w, y = (i / w) | 0; col[0] = col[1] = col[2] = col[3] = 0;
      for (let dy = -1; dy <= 1; dy++){ const yy = y + dy; if (yy < 0 || yy >= h) continue;
        for (let dx = -1; dx <= 1; dx++){ const xx = x + dx; if (xx < 0 || xx >= w) continue; const j = yy * w + xx;
          if (st[j] !== 1) continue; const q = wt[j]; col[0] += d[j * 4] * q; col[1] += d[j * 4 + 1] * q; col[2] += d[j * 4 + 2] * q; col[3] += q; } }
      if (col[3] > 0){ d[i * 4] = col[0] / col[3]; d[i * 4 + 1] = col[1] / col[3]; d[i * 4 + 2] = col[2] / col[3]; }
    }
    nn = 0;
    for (let k = 0; k < nc; k++){ const i = cur[k]; st[i] = 1; wt[i] = 64; }   // finalize the whole layer (no order bias)
    for (let k = 0; k < nc; k++){
      const i = cur[k], x = i % w, y = (i / w) | 0;
      for (let dy = -1; dy <= 1; dy++){ const yy = y + dy; if (yy < 0 || yy >= h) continue;
        for (let dx = -1; dx <= 1; dx++){ const xx = x + dx; if (xx < 0 || xx >= w) continue; const j = yy * w + xx;
          if (st[j] === 0){ st[j] = 2; nn = push(nxt, nn, j); } } }
    }
    const t = cur; cur = nxt; nxt = t; nc = nn;
  }
  mr /= mw; mg /= mw; mb /= mw;           // the rest (far from the silhouette): the mean sprite colour
  for (let i = 0, j = 0; i < n; i++, j += 4) if (st[i] !== 1){ d[j] = mr; d[j + 1] = mg; d[j + 2] = mb; }
  return d;
}

// Probe WebGL2 on a THROWAWAY canvas: build the whole pipeline (compile + link every program, allocate every render
// target) and release the context. #tank is only claimed if this succeeds.
function probeGL2(mkCanvas){
  let c = null, gl = null;
  try { c = mkCanvas(4, 4); gl = c && c.getContext ? c.getContext('webgl2', GL_ATTRS) : null; }
  catch(e){ return { ok:false, reason:'probe getContext threw: ' + (e && e.message || e) }; }
  if (!isRealGL2(gl)) return { ok:false, quiet:true, reason:'WebGL2 unavailable' };
  let p = null;
  try {
    p = new GLPost(c, gl, { probe:true });
    if (p.failed) return { ok:false, reason:'probe: ' + (p.fatal || 'render targets incomplete') };
    return { ok:true, fish: !!p.fishReady };
  } catch(e){ return { ok:false, reason:'probe build failed: ' + (e && e.message || e) }; }
  finally {
    try { if (p) p.dispose(); } catch(e){ warn('GLPost probe dispose failed', e); }
    try { const lc = gl.getExtension('WEBGL_lose_context'); if (lc) lc.loseContext(); } catch(e){ warn('GLPost probe loseContext failed', e); }
  }
}

export function makePresenter(canvas, mkCanvas, opts = {}){
  if (typeof mkCanvas === 'function'){
    const pr = probeGL2(mkCanvas);
    if (!pr.ok){
      if (pr.quiet){ if (typeof console !== 'undefined' && console.info) console.info('GLPost: ' + pr.reason + ' → Canvas2D presenter'); }
      else warn('GLPost: WebGL2 probe failed (' + pr.reason + ') → Canvas2D presenter');
      return new Canvas2DPresenter(canvas);
    }
  }
  let gl = null;
  try { gl = canvas.getContext('webgl2', GL_ATTRS); }
  catch(e){ warn('GLPost: getContext(webgl2) threw → Canvas2D presenter', e); gl = null; }
  if (!isRealGL2(gl)) return new Canvas2DPresenter(canvas);
  try { return new GLPost(canvas, gl, opts); }
  catch(e){
    // #tank is now GL-owned, so this fallback cannot get a 2D context: it reports needsCanvas and the Renderer swaps #tank.
    err('GLPost: WebGL2 init failed after claiming the canvas → Canvas2D on a fresh canvas', e);
    return new Canvas2DPresenter(canvas);
  }
}

export class Canvas2DPresenter {
  constructor(canvas){
    this.canvas = canvas; this.gl = null; this.ctx = null;
    try { this.ctx = canvas.getContext('2d'); } catch(e){ warn('Canvas2DPresenter: getContext(2d) threw', e); this.ctx = null; }
    this.needsCanvas = !this.ctx;   // canvas already owned by WebGL → the Renderer must swap in a fresh canvas
    if (this.needsCanvas) warn('Canvas2DPresenter: no 2D context on this canvas (already WebGL-owned) → needs a fresh canvas');
    if (this.ctx && this.ctx.imageSmoothingEnabled !== undefined) this.ctx.imageSmoothingEnabled = false;
  }
  resize(){}
  present(scene){ if (this.ctx) this.ctx.drawImage(scene, 0, 0); return !!this.ctx; }
  dispose(){}
}

// ---- shared GLSL: exact piecewise sRGB transfer functions (the hardware decode is exact sRGB, so the encode must be too
// or near-blacks don't round-trip) ----
const GLSL_SRGB = `
vec3 srgbEncode(vec3 c){ c = max(c, 0.0); return mix(c*12.92, 1.055*pow(c, vec3(1.0/2.4)) - 0.055, step(vec3(0.0031308), c)); }
vec3 srgbDecode(vec3 c){ c = max(c, 0.0); return mix(c/12.92, pow((c + 0.055)/1.055, vec3(2.4)), step(vec3(0.04045), c)); }`;

const VERT = `#version 300 es
out vec2 vUv;
void main(){ vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2)); vUv = p; gl_Position = vec4(p*2.0-1.0,0.0,1.0); }`;

const FRAG_BRIGHT = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 frag;
uniform sampler2D uScene; uniform float uThreshold; uniform float uKnee;
float luma(vec3 c){ return dot(c, vec3(0.2126,0.7152,0.0722)); }
void main(){
  vec3 c = texture(uScene, vUv).rgb; float l = luma(c);
  float kn = uKnee + 1e-5;
  float soft = clamp(l - uThreshold + kn, 0.0, 2.0*kn); soft = soft*soft/(4.0*kn);
  float contrib = max(soft, l - uThreshold)/max(l,1e-4);
  frag = vec4(c*clamp(contrib,0.0,1.0), 1.0);
}`;

const FRAG_BLUR = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 frag;
uniform sampler2D uTex; uniform vec2 uTexel; uniform vec2 uDir;
void main(){
  float w0=0.227027,w1=0.194595,w2=0.121622,w3=0.054054,w4=0.016216;
  vec3 acc = texture(uTex,vUv).rgb*w0;
  vec2 o1=uTexel*uDir,o2=uTexel*uDir*2.0,o3=uTexel*uDir*3.0,o4=uTexel*uDir*4.0;
  acc += texture(uTex,vUv+o1).rgb*w1; acc += texture(uTex,vUv-o1).rgb*w1;
  acc += texture(uTex,vUv+o2).rgb*w2; acc += texture(uTex,vUv-o2).rgb*w2;
  acc += texture(uTex,vUv+o3).rgb*w3; acc += texture(uTex,vUv-o3).rgb*w3;
  acc += texture(uTex,vUv+o4).rgb*w4; acc += texture(uTex,vUv-o4).rgb*w4;
  frag = vec4(acc,1.0);
}`;

export const FRAG_COMP = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 frag;
uniform sampler2D uScene; uniform sampler2D uBloom;
uniform vec2 uRes; uniform float uTime,uLight,uTurb,uNight,uWarm,uZoom,uFlash,uSecchi,uClarity,uBloomAmt,uDpr;
uniform vec2 uSunUV; uniform float uSunInt, uRayExp, uSunUp, uCausAmt;   // volumetric god-rays + caustics (uSunUV in uv space)
uniform float uExposure;   // linear-HDR exposure (pre-tonemap); live-tunable
${GLSL_SRGB}
vec3 aces(vec3 x){ const float a=2.51,b=0.03,c=2.43,d=0.59,e=0.14; return clamp((x*(a*x+b))/(x*(c*x+d)+e),0.0,1.0); }
float hash(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float h21(vec2 p){ p=fract(p*vec2(123.34,345.45)); p+=dot(p,p+34.345); return fract(p.x*p.y); }
float vnoise(vec2 p){
  vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  float a=h21(i), b=h21(i+vec2(1,0)), c=h21(i+vec2(0,1)), d=h21(i+vec2(1,1));
  return mix(mix(a,b,f.x), mix(c,d,f.x), f.y);
}
// ridged caustic NET: 3 octaves of crossed trig ridges, domain-warped by drifting noise
float causticNet(vec2 uv, float tt){
  vec2 p = uv*vec2(7.0,5.0);
  float net=0.0, amp=0.62, freq=1.0;
  for(int o=0;o<3;o++){
    vec2 q=p*freq;
    vec2 w=vec2(vnoise(q*0.5+tt*0.05), vnoise(q*0.5+7.3-tt*0.04))-0.5;
    q+=w*1.7;
    float r1=1.0-abs(sin(q.x+tt*0.6+sin(q.y*0.7)));
    float r2=1.0-abs(sin(q.y-tt*0.5+sin(q.x*0.8)));
    net += pow(max(r1*r2, 0.0), 2.2)*amp;
    amp*=0.55; freq*=1.9;
  }
  return clamp(net,0.0,1.0);
}
// volumetric god-rays: radial march of the half-res bloom bright-mask toward the sun UV
float godRays(sampler2D brightTex, vec2 uv, vec2 sunUV){
  const int STEPS=24; const float DENSITY=0.92, DECAY=0.965, WEIGHT=0.45;
  vec2 delta=(uv-sunUV)*(DENSITY/float(STEPS)), coord=uv;
  float illum=1.0, acc=0.0;
  float dither=fract(sin(dot(gl_FragCoord.xy, vec2(12.9898,78.233)))*43758.5453);
  coord -= delta*dither;
  for(int i=0;i<STEPS;i++){
    coord -= delta;
    vec3 bc=texture(brightTex, clamp(coord,0.0,1.0)).rgb;
    acc += dot(bc, vec3(0.2126,0.7152,0.0722))*illum*WEIGHT; illum*=DECAY;
  }
  acc /= float(STEPS);
  acc *= exp(-distance(uv,sunUV)*1.6);
  return acc;
}
void main(){
  vec2 uv=vUv; vec2 ctr=uv-0.5; float r2=dot(ctr,ctr);
  float dpt = 1.0 - uv.y;                 // DEPTH coordinate: 0 = screen top (water surface) .. 1 = screen bottom (deep)
  float surf=(1.0-smoothstep(0.0,max(0.18,uSecchi),dpt))*uClarity; float tt=uTime;
  vec2 warp;
  warp.x = sin(dpt*22.0+tt*0.9)*0.0011 + sin(dpt*41.0-tt*1.1)*0.0007;
  warp.y = cos(uv.x*18.0+tt*0.7)*0.0010 + sin(uv.x*33.0+tt*0.9)*0.0006;
  float caustic=(0.5+0.5*sin(uv.x*90.0+tt*2.0))*(0.5+0.5*sin(dpt*70.0-tt*1.7));
  warp += vec2(caustic-0.5)*0.0006;
  // LENS CHARACTER grows WITH magnification (uZoom = zoom/fitZoom, DPR- & size-independent): 0 at the whole-lake view, 1
  // from ~5× in. The shimmer, colour fringing and fake DOF used to scale with 1/zoom, i.e. they were STRONGEST at the
  // overview, where ~5 px of warp and 2–5 px of R/B fringing smeared fish that are only ~8 px long (blurry when zoomed out).
  // A wide shot is crisp with deep focus; the close-up keeps its underwater-camera character.
  float lens=clamp((uZoom-1.0)/4.0,0.0,1.0);
  warp *= (0.4+0.6*surf)*(0.6+0.7*uLight)*(1.0+1.6*uTurb)*mix(0.12,0.6,lens);
  vec2 wuv = clamp(uv+warp,0.0,1.0);
  float ca=(0.0002+0.0014*r2)*mix(0.5,1.0,lens);
  vec2 dir=(r2>1e-6)?normalize(ctr):vec2(0.0);
  vec3 col;
  col.r=texture(uScene,clamp(wuv+dir*ca,0.0,1.0)).r;
  col.g=texture(uScene,wuv).g;
  col.b=texture(uScene,clamp(wuv-dir*ca,0.0,1.0)).b;
  float dofEdge=smoothstep(0.10,0.42,r2);
  float dofDeep=smoothstep(0.5,1.0,dpt)*(0.4+0.6*(1.0-uSecchi));
  float dof=clamp(0.6*dofEdge+0.4*dofDeep,0.0,0.7)*lens;   // no fake depth-of-field on the wide view
  if(dof>0.001){
    vec2 px=1.5*uDpr/uRes;                // tap offset in CSS px (scaled by DPR) so the blur radius is DPR-independent
    vec3 b=texture(uScene,clamp(wuv+vec2(px.x,px.y),0.0,1.0)).rgb
          +texture(uScene,clamp(wuv+vec2(-px.x,px.y),0.0,1.0)).rgb
          +texture(uScene,clamp(wuv+vec2(px.x,-px.y),0.0,1.0)).rgb
          +texture(uScene,clamp(wuv+vec2(-px.x,-px.y),0.0,1.0)).rgb;
    col=mix(col,b*0.25,dof*0.6);
  }
  vec3 bloom=texture(uBloom,uv).rgb;
  col += bloom*uBloomAmt;

  // ---- VOLUMETRIC WATER + LIGHT — added in linear HDR, PRE-ACES so the tonemap rolls off any overshoot ----
  vec3 waterTint = mix(vec3(0.55,0.86,1.0), vec3(0.50,0.92,0.62), clamp(uTurb*1.3,0.0,1.0));
  // (A) animated caustic NET — brightest just under the surface (dpt=0), gone by the photic floor
  float causDepth = 1.0 - smoothstep(0.0, max(0.16, uSecchi), dpt);
  float caus = causticNet(vec2(uv.x, dpt) + warp*8.0, uTime) * causDepth * uClarity * uLight * uSunUp;
  col *= 1.0 + caus * uCausAmt;
  col += waterTint * caus * uCausAmt * 0.45;
  // (B) in-scattering glow — upper water glows, the deep stays moody
  float scatter = exp(-dpt * (2.4 + 2.2*(1.0-uClarity))) * uLight;
  col += waterTint * (scatter * (0.10 + 0.07*uTurb));
  // (C) reflective SURFACE band (Snell's window) — a bright shimmering ceiling at the very top, day only
  float surfBand = (1.0 - smoothstep(0.0, 0.07, dpt)) * uSunUp;
  float ripple = (0.5 + 0.5*sin(uv.x*52.0 + uTime*1.6)) * (0.6 + 0.4*sin(uv.x*19.0 - uTime*1.05));
  vec3 skyCol = mix(vec3(0.62,0.82,0.98), vec3(1.0,0.90,0.66), uWarm*0.6);
  col += skyCol * (surfBand * uClarity * (0.06 + 0.12*ripple));
  // (D) volumetric GOD-RAYS — CPU sends uSunInt=0 when the sun is too far off-frame (skips the 24-tap march)
  if (uSunInt > 0.001){
    float ray = godRays(uBloom, uv, uSunUV);
    float depthFade = clamp(1.0 - dpt*0.85, 0.0, 1.0);
    float turbFade  = 1.0 - 0.55*uTurb;
    vec2  sd = max(vec2(0.0)-uSunUV, uSunUV-vec2(1.0));
    float frame = 1.0 - smoothstep(0.0, 0.6, clamp(max(sd.x,sd.y),0.0,0.6));
    float amt = ray * uSunInt * uRayExp * uClarity * depthFade * turbFade * frame;
    vec3 shaftCol = mix(vec3(0.78,0.90,1.0), vec3(1.0,0.86,0.62), uWarm*0.5);
    col += shaftCol * amt;
  }

  col = aces(col*uExposure);
  col = mix(col, col*vec3(1.10,0.92,0.74), uWarm*0.30);
  col = mix(col, col*vec3(0.82,0.90,1.15), uNight*0.34);
  col = mix(col, col*vec3(0.96,1.03,0.88)+vec3(0.01,0.02,0.0), uTurb*0.22);
  col += vec3(0.9,0.93,1.0)*(uFlash*0.05)*(1.0-dpt);
  col = mix(col, col*col*(3.0-2.0*col), 0.16);                        // gentle filmic S-curve
  float dsep = smoothstep(0.0, 0.92, dpt);                            // 0 surface → 1 deep
  col = mix(col*vec3(1.05,1.01,0.95), col*vec3(0.93,0.99,1.10), dsep*0.45);   // warm shallow, cool teal deep
  float vig=smoothstep(0.36,0.95,length(ctr*vec2(uRes.x/uRes.y,1.0)));
  col *= 1.0-vig*0.52;
  col = mix(col, vec3(0.008,0.030,0.060), vig*0.10);
  col = srgbEncode(clamp(col,0.0,1.0));    // LINEAR → sRGB: exact piecewise OETF (decode was hardware sRGB on sample)
  // film GRAIN in sRGB space (after the encode → a perceptually even amplitude, no 9-12-level dark-end blow-up)
  float g=hash(gl_FragCoord.xy+fract(uTime)*131.0)-0.5;
  float lum=dot(col,vec3(0.299,0.587,0.114));
  col += g*0.018*(0.5+0.5*(1.0-lum))*(0.6+0.4*uNight);
  float d1=hash(gl_FragCoord.xy+fract(uTime)*59.0), d2=hash(gl_FragCoord.xy+vec2(31.4,17.7)+fract(uTime)*59.0);
  col += (d1-d2)*(1.0/255.0);                     // TPDF ±1 LSB dither → kills 8-bit banding
  frag = vec4(clamp(col,0.0,1.0),1.0);
}`;

// exact sRGB → linear (the EOTF the SRGB8_ALPHA8 sampler applies in hardware)
const SRGB_TO_LIN = `vec3 srgbToLin(vec3 c){ return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c)); }`;
// opaque copy of the background scene into the (linear) scene FBO, decoding sRGB on the way (reuses the attrib-less VERT).
// The canvas is uploaded to a plain RGBA8 texture because Chrome can only GPU-copy a canvas into non-sRGB formats: an
// SRGB8_ALPHA8 target forced a CPU readback of every 1080p frame (≈24 fps → ≈130 fps on an RTX 3060). The blit is 1:1
// (texel centres), so decoding after the fetch is exact.
const FRAG_BLIT = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 frag; uniform sampler2D uTex;
${SRGB_TO_LIN}
void main(){ frag = vec4(srgbToLin(texture(uTex,vUv).rgb), 1.0); }`;
// per-quad affine: reproduce render.js's 2D affine (device-px center + half-extent + rotation + facing flip). Canvas top
// (device y=0) maps to clip +1, i.e. the top of the scene FBO, matching the flipped scene upload. Also used for overlays.
const VERT_FISH = `#version 300 es
layout(location=0) in vec2 aCorner;   // [-1,1]^2
layout(location=1) in vec2 aUv;       // [0,1]^2  (v=0 = canvas top = fish dorsal/back)
uniform vec2 uCenter;   // device px center (top-left origin, y down)
uniform vec2 uHalf;     // device px half-extent magnitudes (already scaled)
uniform float uRot;     // body heading (rad)
uniform float uFlip;    // -1 mirrors vertically (eased facing / corpse belly-roll sign)
uniform vec2 uRes;      // scene-FBO size in px
out vec2 vUv;
void main(){
  vec2 ext = vec2(uHalf.x * aCorner.x, uHalf.y * aCorner.y * uFlip);
  float ca = cos(uRot), sa = sin(uRot);
  vec2 dev = uCenter + vec2(ext.x*ca - ext.y*sa, ext.x*sa + ext.y*ca);
  gl_Position = vec4(dev.x/uRes.x*2.0 - 1.0, 1.0 - dev.y/uRes.y*2.0, 0.0, 1.0);
  vUv = aUv;
}`;
// directionally-lit textured fish. Brightness MATCHES the 2D path: the sprite (built at full light) is scaled by the
// per-fish light×depth factor uBright in sRGB space (exactly what fishColors' HSL dim does for L≤50%), and the depth haze is
// the same per-pixel vertical gradient the 2D path paints over its fish, mixed in sRGB like canvas blending. Night tint is
// NOT applied here (FRAG_COMP grades the whole frame). Only the directional shading (lambert/rim/spec) differs from 2D.
const FRAG_FISH = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 frag;
uniform sampler2D uTex;     // STRAIGHT-alpha, alpha-bled, mip-mapped SRGB8_ALPHA8 fish sprite
uniform vec2  uLightDir;    // screen-space light dir (normalized x,y); +y points toward the surface key
uniform vec2  uHazeBox;     // device-px y of world y=0 and the world-box height (the 2D haze gradient's span)
uniform vec2  uRes;         // scene-FBO size in px
uniform vec3  uHazeTint;    // water haze colour (sRGB 0..1)
uniform float uHazeMax;     // 2D haze alpha at the bed (already includes the ambient factor)
uniform float uBright;      // light×depth brightness factor (sRGB-space multiplier, 1 = sprite as built)
uniform float uSat;         // light×depth saturation factor (1 = as built; low at night → a greyish silhouette)
uniform float uLight;       // env.light 0..1 (rim/spec strength only)
uniform float uVis;         // fade-in / corpse fade
uniform vec3  uTint;        // optional tint (default 1,1,1)
uniform float uKind;        // 0 living, 1 corpse
uniform float uBodyCurve, uRim, uAmbient, uSpec;
${GLSL_SRGB}
void main(){
  vec4 texel = texture(uTex, vUv, -0.5);    // rgb hardware-decoded to LINEAR, alpha STRAIGHT. −0.5 mip bias: small fish stay crisp (trilinear minification read soft)
  if (texel.a < 0.012) discard;
  float v = vUv.y*2.0 - 1.0;                 // -1 back/top .. +1 belly/bottom
  float u = vUv.x*2.0 - 1.0;                 // -1 nose .. +1 tail
  float ny = -v;
  float nx = u * uBodyCurve;
  float nz2 = 1.0 - clamp(nx*nx + ny*ny, 0.0, 1.0);
  vec3 N = normalize(vec3(nx, ny, sqrt(max(nz2, 1e-3))));
  vec3 L = normalize(vec3(uLightDir, 0.85));
  float lambert = dot(N, L)*0.5 + 0.5;
  lambert = mix(uAmbient, 1.0, lambert);
  float fres = pow(1.0 - clamp(N.z, 0.0, 1.0), 3.0);
  float rim  = fres * uRim * (0.4 + 0.6*uLight) * (1.0 - 0.7*uKind);
  vec3 sb = srgbEncode(texel.rgb) * uBright;                 // light×depth dim, applied like the 2D sprite's HSL dim
  sb = mix(vec3(dot(sb, vec3(0.299, 0.587, 0.114))), sb, uSat);   // …and its desaturation (colour drains at night)
  vec3 base = srgbDecode(sb);
  vec3 lit = base * lambert * uTint;
  lit += base * rim;
  vec3 Hh = normalize(L + vec3(0.0, 0.0, 1.0));
  float spec = pow(max(dot(N, Hh), 0.0), 32.0) * (0.3 + 0.7*uLight) * (1.0 - 0.85*uKind);
  lit += vec3(0.90, 0.95, 1.0) * (spec * uSpec * uBright);
  // the 2D depth-haze gradient (alpha 0 at the surface → 0.4·max at 55% depth → max at the bed), per pixel, sRGB mix
  float yN = clamp(((uRes.y - gl_FragCoord.y) - uHazeBox.x) / max(uHazeBox.y, 1.0), 0.0, 1.0);
  float hazeT = yN < 0.55 ? uHazeMax*0.4*(yN/0.55) : uHazeMax*(0.4 + 0.6*(yN-0.55)/0.45);
  lit = srgbDecode(mix(srgbEncode(lit), uHazeTint, hazeT));
  frag = vec4(lit * texel.a * uVis, texel.a * uVis);   // premultiply at output for the premult-over blend
}`;
// overlay canvas (selection ring, burst ripples, surface line, rain, lightning) drawn OVER the GL fish: 1:1 texels
// (NEAREST), straight alpha → premultiplied output.
const FRAG_OVER = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 frag; uniform sampler2D uTex;
${SRGB_TO_LIN}
void main(){ vec4 t = texture(uTex, vUv); frag = vec4(srgbToLin(t.rgb) * t.a, t.a); }`;   // RGBA8 upload (fast GPU copy), NEAREST 1:1 → exact decode

class GLPost {
  constructor(canvas, gl, opts = {}){
    this.canvas = canvas; this.gl = gl; this.failed = false; this.fatal = null; this.lost = false; this.lostAt = 0;
    this.probe = !!opts.probe; this.noFloat = !!opts.noFloat;
    this.w = 0; this.h = 0; this.bw = 0; this.bh = 0;
    this.rayExp = 1.6; this.causAmt = 0.40;   // volumetric tuning knobs (live-settable via renderer.present.rayExp/causAmt)
    this.exposure = 1.05;   // linear-HDR pre-tonemap exposure (live-settable)
    this.fishAmbient = 0.42; this.fishRim = 0.40; this.fishSpec = 0.6;   // GL-fish lighting knobs (live-settable)
    this.fishTexMax = opts.texMax || 1024;   // the Renderer sets this ≥ its SpriteCache cap (no texture-cache thrash)
    this.texUploads = 0;
    this._onLost = (e)=>{ e.preventDefault(); this.lost = true; this.lostAt = nowMs(); warn('GLPost: WebGL context lost — waiting for restore'); };
    this._onRestored = ()=>{
      try { this._buildGL(); if (this.fishTexCache) this.fishTexCache.clear(); this.w = this.h = 0; this.resize(this.canvas.width || 2, this.canvas.height || 2);
        if (!this.failed){ this.lost = false; if (typeof console !== 'undefined' && console.info) console.info('GLPost: WebGL context restored'); } }
      catch(er){ this._fail('context-restore rebuild failed', er); }
    };
    if (!this.probe && typeof canvas.addEventListener === 'function'){
      canvas.addEventListener('webglcontextlost', this._onLost, false);
      canvas.addEventListener('webglcontextrestored', this._onRestored, false);
    }
    this._buildGL();
    this.resize(canvas.width || 2, canvas.height || 2);
  }
  _fail(where, e){
    if (!this.failed) err('GLPost: ' + where + ' — GL presenting stopped' + (this.probe ? '' : '; the Renderer will fall back to Canvas2D'), e || '');
    this.failed = true; this.fatal = where;
  }
  _compile(type, src){
    const gl = this.gl, s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)){ const m = gl.getShaderInfoLog(s); gl.deleteShader(s); throw new Error('shader: '+m); }
    return s;
  }
  _link(fsSrc){   // shares one attrib-less VERT across the fullscreen programs (deleted once all are linked, in _buildGL)
    const gl = this.gl, p = gl.createProgram();
    if (!this._vs) this._vs = this._compile(gl.VERTEX_SHADER, VERT);
    const fs = this._compile(gl.FRAGMENT_SHADER, fsSrc);
    gl.attachShader(p, this._vs); gl.attachShader(p, fs); gl.linkProgram(p);
    const ok = gl.getProgramParameter(p, gl.LINK_STATUS), m = ok ? '' : gl.getProgramInfoLog(p);
    gl.detachShader(p, fs); gl.deleteShader(fs);
    if (!ok){ gl.deleteProgram(p); throw new Error('link: '+m); }
    return p;
  }
  _linkPair(vsSrc, fsSrc){
    const gl = this.gl, p = gl.createProgram();
    const vs = this._compile(gl.VERTEX_SHADER, vsSrc), fs = this._compile(gl.FRAGMENT_SHADER, fsSrc);
    gl.attachShader(p, vs); gl.attachShader(p, fs); gl.linkProgram(p);
    const ok = gl.getProgramParameter(p, gl.LINK_STATUS), m = ok ? '' : gl.getProgramInfoLog(p);
    gl.detachShader(p, vs); gl.detachShader(p, fs); gl.deleteShader(vs); gl.deleteShader(fs);
    if (!ok){ gl.deleteProgram(p); throw new Error('link: ' + m); }
    return p;
  }
  _locs(prog, names){ const gl = this.gl, m = {}; for (const n of names) m[n] = gl.getUniformLocation(prog, n); return m; }
  _tex(w,h,internal,format,type){
    const gl = this.gl, t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, type, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }
  _fbo(tex){ const gl = this.gl, f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0); return f; }
  // Render-target format chain (audit: no float RT → RGBA8 holding LINEAR values bands the darks): RGBA16F (via
  // EXT_color_buffer_float or EXT_color_buffer_half_float) → SRGB8_ALPHA8 (colour-renderable in core WebGL2; stores linear
  // values sRGB-encoded → far finer dark steps than RGBA8) → RGBA8 (last resort).
  _rtChain(){
    const gl = this.gl, chain = [];
    const f16 = { internal: gl.RGBA16F, type: gl.HALF_FLOAT, name: 'RGBA16F' };
    if (!this.noFloat && (gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float'))) chain.push(f16);
    chain.push({ internal: gl.SRGB8_ALPHA8, type: gl.UNSIGNED_BYTE, name: 'SRGB8_ALPHA8' });
    chain.push({ internal: gl.RGBA8, type: gl.UNSIGNED_BYTE, name: 'RGBA8' });
    return chain;
  }
  // allocate `texs` at w×h in the first format of `chain` (from index `start`) whose FBO is complete; returns the index or -1
  _allocRT(texs, fbo, w, h, chain, start){
    const gl = this.gl;
    for (let i = Math.max(0, start); i < chain.length; i++){
      const f = chain[i];
      for (const t of texs){ gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, f.internal, w, h, 0, gl.RGBA, f.type, null); }
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE) return i;
      warn('GLPost: render target ' + f.name + ' incomplete → trying the next format');
    }
    return -1;
  }
  _buildFishGL(){   // NEVER throws out — on failure fishReady stays false and render.js keeps the 2D fish path
    const gl = this.gl;
    try {
      this.pBlit = this._link(FRAG_BLIT); this.uBlit = this._locs(this.pBlit, ['uTex']);
      this.pFish = this._linkPair(VERT_FISH, FRAG_FISH);
      this.uFish = this._locs(this.pFish, ['uCenter','uHalf','uRot','uFlip','uRes','uVis','uHazeBox','uHazeTint','uHazeMax',
        'uBright','uSat','uLight','uTint','uKind','uLightDir','uBodyCurve','uRim','uAmbient','uSpec','uTex']);
      this.pOver = this._linkPair(VERT_FISH, FRAG_OVER);
      this.uOver = this._locs(this.pOver, ['uCenter','uHalf','uRot','uFlip','uRes','uTex']);
      const Q = new Float32Array([-1,-1,0,0, 1,-1,1,0, -1,1,0,1, 1,1,1,1]);
      this.quadVBO = gl.createBuffer(); this.fishVAO = gl.createVertexArray();
      gl.bindVertexArray(this.fishVAO); gl.bindBuffer(gl.ARRAY_BUFFER, this.quadVBO);
      gl.bufferData(gl.ARRAY_BUFFER, Q, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);
      gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);
      gl.bindVertexArray(null);
      this.fishTexCache = new Map(); this.fishFailed = false;
      this.sceneFBO = gl.createFramebuffer(); this.sceneFBOTex = null; this.sceneFmtIdx = this.bloomFmtIdx;
      this.ovTex = null; this.ovW = 0; this.ovH = 0;
      this.fishReady = true;
    } catch(e){ this.fishReady = false; warn('GLPost: fish init failed → 2D fish', e); }
  }
  _resizeFishFBO(w, h){
    const gl = this.gl;
    if (!this.sceneFBOTex) this.sceneFBOTex = this._tex(1, 1, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.sceneFBO);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.sceneFBOTex, 0);
    const i = this._allocRT([this.sceneFBOTex], this.sceneFBO, w, h, this.rt, this.sceneFmtIdx);
    if (i < 0){ this.fishFailed = true; warn('GLPost: no complete scene-FBO format → 2D fish'); } else this.sceneFmtIdx = i;
  }
  // sprite-canvas → GL texture, keyed by the SpriteCache ENTRY OBJECT identity (immutable once built → upload once, LRU-evict).
  // Alpha-bled straight-alpha SRGB8_ALPHA8 + a full mip chain (stops minification shimmer at whole-lake zoom).
  // the Renderer's SpriteCache evicted this sprite entry → free its texture now (hi-res close-up sprites are large)
  dropFishTex(entry){
    const c = this.fishTexCache, gl = this.gl; if (!c || !gl) return;
    const rec = c.get(entry); if (rec) { gl.deleteTexture(rec.tex); c.delete(entry); }
  }
  _fishTex(entry){
    const gl = this.gl, cache = this.fishTexCache;
    let rec = cache.get(entry);
    if (rec){ cache.delete(entry); cache.set(entry, rec); return rec.tex; }   // LRU touch
    const cnv = entry.canvas, w = cnv.width, h = cnv.height;
    const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);            // uv handles orientation (row0 = canvas top = dorsal)
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false); // STRAIGHT alpha; FRAG_FISH premultiplies after lighting
    let img = null;
    try { const g = cnv.getContext('2d'); img = g && g.getImageData ? g.getImageData(0, 0, w, h) : null; }
    catch(e){ warn('GLPost: sprite readback failed → un-bled upload', e); img = null; }
    if (img){
      bleedAlpha(img.data, w, h);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.SRGB8_ALPHA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(img.data.buffer, img.data.byteOffset, img.data.byteLength));
    } else gl.texImage2D(gl.TEXTURE_2D, 0, gl.SRGB8_ALPHA8, gl.RGBA, gl.UNSIGNED_BYTE, cnv);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    this.texUploads++;
    rec = { tex }; cache.set(entry, rec);
    while (cache.size > this.fishTexMax){ const k = cache.keys().next().value; gl.deleteTexture(cache.get(k).tex); cache.delete(k); }
    return tex;
  }
  _drawFishQuads(fish, p){
    const gl = this.gl; gl.useProgram(this.pFish); gl.bindVertexArray(this.fishVAO);
    gl.uniform2f(this.uFish.uRes, this.w, this.h);
    const hb = p.hazeBox || [0, this.h];
    gl.uniform2f(this.uFish.uHazeBox, hb[0], hb[1]);
    const hz = p.hazeTint || [16,40,66];
    gl.uniform3f(this.uFish.uHazeTint, hz[0]/255, hz[1]/255, hz[2]/255);
    gl.uniform1f(this.uFish.uHazeMax, p.hazeMax != null ? p.hazeMax : 0.3);
    gl.uniform1f(this.uFish.uLight, p.light || 0);
    gl.uniform1f(this.uFish.uBodyCurve, 0.35); gl.uniform1f(this.uFish.uRim, this.fishRim); gl.uniform1f(this.uFish.uAmbient, this.fishAmbient);
    gl.uniform1f(this.uFish.uSpec, this.fishSpec);
    const lx = (p.sunUV ? (p.sunUV[0]-0.5)*0.6 : 0.0), ll = Math.hypot(lx, 1.0);
    gl.uniform2f(this.uFish.uLightDir, lx/ll, 1.0/ll);   // +y = key from the surface (screen-up) → lights the dorsal
    gl.activeTexture(gl.TEXTURE0); gl.uniform1i(this.uFish.uTex, 0);
    for (let i = 0; i < fish.length; i++){
      const f = fish[i], sprite = f.sprite;
      if (!sprite || !sprite.canvas || !sprite.base) continue;
      const w = sprite.canvas.width, h = sprite.canvas.height, s = f.sPx / sprite.base, sFy = (f.facing != null ? f.facing : 1);
      gl.bindTexture(gl.TEXTURE_2D, this._fishTex(sprite));
      gl.uniform2f(this.uFish.uCenter, f.sx, f.sy);
      gl.uniform2f(this.uFish.uHalf, (w*0.5)*s, (h*0.5)*s*Math.abs(sFy));
      gl.uniform1f(this.uFish.uFlip, sFy < 0 ? -1 : 1);
      gl.uniform1f(this.uFish.uRot, f.rot || 0);
      gl.uniform1f(this.uFish.uVis, f.vis != null ? f.vis : 1);
      gl.uniform1f(this.uFish.uBright, f.bright != null ? f.bright : 1); gl.uniform1f(this.uFish.uSat, f.sat != null ? f.sat : 1);
      gl.uniform1f(this.uFish.uKind, f.kind || 0);
      const t = f.tint; gl.uniform3f(this.uFish.uTint, t ? t[0] : 1, t ? t[1] : 1, t ? t[2] : 1);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    gl.bindVertexArray(null);
  }
  // overlay = { canvas, x, y } (device px, top-left origin; drawn 1:1). Straight-alpha upload, NEAREST, premult-over.
  _drawOverlay(ov){
    const gl = this.gl, c = ov.canvas, w = c.width, h = c.height;
    if (!this.ovTex){ this.ovTex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, this.ovTex);
      for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.NEAREST], [gl.TEXTURE_MAG_FILTER, gl.NEAREST], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v); }
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.ovTex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    if (w !== this.ovW || h !== this.ovH){ gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, c); this.ovW = w; this.ovH = h; }
    else gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, c);
    gl.useProgram(this.pOver); gl.bindVertexArray(this.fishVAO);
    gl.uniform2f(this.uOver.uRes, this.w, this.h);
    gl.uniform2f(this.uOver.uCenter, ov.x + w * 0.5, ov.y + h * 0.5);
    gl.uniform2f(this.uOver.uHalf, w * 0.5, h * 0.5);
    gl.uniform1f(this.uOver.uRot, 0); gl.uniform1f(this.uOver.uFlip, 1); gl.uniform1i(this.uOver.uTex, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindVertexArray(null);
  }
  _buildGL(){
    const gl = this.gl; this._vs = null;
    this.pBright = this._link(FRAG_BRIGHT); this.pBlur = this._link(FRAG_BLUR); this.pComp = this._link(FRAG_COMP);
    this.uBright = this._locs(this.pBright, ['uScene','uThreshold','uKnee']);
    this.uBlur = this._locs(this.pBlur, ['uTex','uTexel','uDir']);
    this.uComp = this._locs(this.pComp, ['uScene','uBloom','uRes','uTime','uLight','uTurb','uNight','uWarm','uZoom','uFlash','uSecchi','uClarity','uBloomAmt','uDpr','uSunUV','uSunInt','uRayExp','uSunUp','uCausAmt','uExposure']);
    this.vao = gl.createVertexArray();
    this.rt = this._rtChain(); this.bloomFmtIdx = 0;
    this.sceneTex = this._tex(1,1, gl.SRGB8_ALPHA8, gl.RGBA, gl.UNSIGNED_BYTE);   // sRGB internalformat → sampler hardware-decodes to LINEAR (fallback path only: slow canvas upload)
    this.sceneRaw = this._tex(1,1, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE);          // fast path: raw sRGB bytes, decoded by FRAG_BLIT into the scene FBO
    this.texA = this._tex(1,1, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE);
    this.texB = this._tex(1,1, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE);
    this.fboA = this._fbo(this.texA); this.fboB = this._fbo(this.texB);
    gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND);
    this._buildFishGL();   // own try/catch → fishReady false on failure, never blocks the post path
    if (this._vs){ gl.deleteShader(this._vs); this._vs = null; }   // flagged; freed with the programs it is attached to
  }
  get rtFormat(){ return this.rt && this.rt[this.bloomFmtIdx] ? this.rt[this.bloomFmtIdx].name : null; }
  get bloomFmt(){ return this.rt ? this.rt[this.bloomFmtIdx] : null; }
  resize(w,h){
    const gl = this.gl; if (this.failed) return; if (w === this.w && h === this.h) return;
    this.w = w; this.h = h; this.bw = Math.max(1, w >> 1); this.bh = Math.max(1, h >> 1);
    gl.bindTexture(gl.TEXTURE_2D, this.sceneTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.SRGB8_ALPHA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindTexture(gl.TEXTURE_2D, this.sceneRaw);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    const i = this._allocRT([this.texA, this.texB], this.fboA, this.bw, this.bh, this.rt, this.bloomFmtIdx);
    if (i < 0){ this._fail('no complete bloom render-target format'); gl.bindFramebuffer(gl.FRAMEBUFFER, null); return; }
    this.bloomFmtIdx = i;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fboB);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE){ this._fail('bloom FBO B incomplete'); gl.bindFramebuffer(gl.FRAMEBUFFER, null); return; }
    if (this.fishReady) this._resizeFishFBO(w, h);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  // returns true if a frame was presented
  present(scene, p){
    if (this.failed || this.lost) return false;
    const gl = this.gl; p = p || {};
    try {
      const w = scene.width, h = scene.height; const realloc = (w !== this.w || h !== this.h);
      this.resize(w, h); if (this.failed) return false;
      gl.bindVertexArray(this.vao); gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND);
      // Upload the 2D scene. FAST PATH (scene FBO available): the canvas goes into the RGBA8 sceneRaw (a GPU-side copy)
      // and FRAG_BLIT decodes it into the linear scene FBO, which then takes the lit fish quads and the overlay on top.
      // FALLBACK (no scene FBO, or the fish path failed): the old SRGB8_ALPHA8 sceneTex upload, which Chrome does
      // through a CPU readback (slow at 1080p, but correct). A per-frame failure sets fishFailed → render.js reverts to
      // 2D fish (and draws its overlays into the scene) next frame.
      const upload = (tex, internal, re) => {
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        if (re) gl.texImage2D(gl.TEXTURE_2D, 0, internal, gl.RGBA, gl.UNSIGNED_BYTE, scene);
        else gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, scene);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      };
      const fishList = p.fish, ov = p.overlay && p.overlay.canvas ? p.overlay : null;
      let sourceTex = null;
      if (this.fishReady && !this.fishFailed && this.sceneFBOTex){ try {
        upload(this.sceneRaw, gl.RGBA8, realloc);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.sceneFBO); gl.viewport(0, 0, this.w, this.h);
        gl.disable(gl.BLEND); gl.useProgram(this.pBlit); gl.bindVertexArray(this.vao);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.sceneRaw); gl.uniform1i(this.uBlit.uTex, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 3);                                   // background (sRGB-decoded) → scene FBO
        gl.enable(gl.BLEND); gl.blendEquation(gl.FUNC_ADD);
        gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);   // premultiplied over
        if (fishList && fishList.length) this._drawFishQuads(fishList, p);  // lit fish quads on top
        if (ov) this._drawOverlay(ov);                                      // overlays OVER the fish
        gl.disable(gl.BLEND);
        sourceTex = this.sceneFBOTex;
      } catch(eF){ this.fishFailed = true; gl.disable(gl.BLEND); warn('GLPost: fish draw failed → 2D fish', eF); } }
      if (!sourceTex){ upload(this.sceneTex, gl.SRGB8_ALPHA8, realloc); sourceTex = this.sceneTex; }
      const bw = this.bw, bh = this.bh;
      gl.bindVertexArray(this.vao);
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.fboA); gl.viewport(0,0,bw,bh); gl.useProgram(this.pBright);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, sourceTex);
      gl.uniform1i(this.uBright.uScene, 0); gl.uniform1f(this.uBright.uThreshold, 0.62); gl.uniform1f(this.uBright.uKnee, 0.30);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.useProgram(this.pBlur); gl.uniform1i(this.uBlur.uTex, 0); gl.uniform2f(this.uBlur.uTexel, 1.0/bw, 1.0/bh);
      let srcTex = this.texA, dstFbo = this.fboB, dstTex = this.texB;
      for (let k = 0; k < 4; k++){
        gl.bindFramebuffer(gl.FRAMEBUFFER, dstFbo); gl.viewport(0,0,bw,bh);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, srcTex);
        gl.uniform2f(this.uBlur.uDir, (k & 1) ? 0 : 1, (k & 1) ? 1 : 0); gl.drawArrays(gl.TRIANGLES, 0, 3);
        if (dstTex === this.texB){ srcTex = this.texB; dstFbo = this.fboA; dstTex = this.texA; }
        else { srcTex = this.texA; dstFbo = this.fboB; dstTex = this.texB; }
      }
      const bloomTex = srcTex;
      // final pass → the default framebuffer, sized by the REAL drawing buffer (can be smaller than canvas.width/height)
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, gl.drawingBufferWidth || this.w, gl.drawingBufferHeight || this.h); gl.useProgram(this.pComp);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, sourceTex); gl.uniform1i(this.uComp.uScene, 0);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, bloomTex); gl.uniform1i(this.uComp.uBloom, 1);
      gl.uniform2f(this.uComp.uRes, this.w, this.h);
      gl.uniform1f(this.uComp.uTime, wrapShaderTime(p.time)); gl.uniform1f(this.uComp.uLight, p.light||0);
      gl.uniform1f(this.uComp.uTurb, p.turbidity||0); gl.uniform1f(this.uComp.uNight, p.night||0);
      gl.uniform1f(this.uComp.uWarm, p.warm||0); gl.uniform1f(this.uComp.uZoom, p.zoom||1);
      gl.uniform1f(this.uComp.uFlash, p.flash||0); gl.uniform1f(this.uComp.uDpr, p.dpr||1);
      gl.uniform1f(this.uComp.uSecchi, p.secchiFrac!=null?p.secchiFrac:1);
      gl.uniform1f(this.uComp.uClarity, p.clarity!=null?p.clarity:1);
      gl.uniform1f(this.uComp.uBloomAmt, 0.55);
      gl.uniform2f(this.uComp.uSunUV, p.sunUV ? p.sunUV[0] : 0.5, p.sunUV ? p.sunUV[1] : 1.0);
      gl.uniform1f(this.uComp.uSunInt, p.sunInt || 0);
      gl.uniform1f(this.uComp.uSunUp, p.sunUp != null ? p.sunUp : 0);
      gl.uniform1f(this.uComp.uRayExp, this.rayExp);
      gl.uniform1f(this.uComp.uCausAmt, this.causAmt);
      gl.uniform1f(this.uComp.uExposure, this.exposure != null ? this.exposure : 1.05);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindVertexArray(null);
      return true;
    } catch(e){ this._fail('present threw', e); return false; }
  }
  dispose(){
    const gl = this.gl;
    if (typeof this.canvas.removeEventListener === 'function'){
      this.canvas.removeEventListener('webglcontextlost', this._onLost);
      this.canvas.removeEventListener('webglcontextrestored', this._onRestored);
    }
    try {
      for (const pr of [this.pBright, this.pBlur, this.pComp, this.pBlit, this.pFish, this.pOver]) if (pr) gl.deleteProgram(pr);
      for (const t of [this.sceneTex, this.sceneRaw, this.texA, this.texB, this.sceneFBOTex, this.ovTex]) if (t) gl.deleteTexture(t);
      for (const f of [this.fboA, this.fboB, this.sceneFBO]) if (f) gl.deleteFramebuffer(f);
      if (this.vao) gl.deleteVertexArray(this.vao);
      if (this.fishVAO) gl.deleteVertexArray(this.fishVAO);
      if (this.quadVBO) gl.deleteBuffer(this.quadVBO);
      if (this.fishTexCache){ for (const rec of this.fishTexCache.values()) gl.deleteTexture(rec.tex); this.fishTexCache.clear(); }
    } catch(e){ warn('GLPost: dispose failed', e); }
  }
}
function nowMs(){ return (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now(); }
