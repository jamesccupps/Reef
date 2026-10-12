// src/glpost.js — browser-layer WebGL2 post-processing presenter (Graphics Pass 3, slice 1).
// Composites the already-rendered 2D scene canvas to the visible #tank canvas through GPU shaders.
// Feature-detects a REAL WebGL2 context; the smoke stub's getContext returns a 2D-ish object for any
// arg (no createProgram/TEXTURE_2D/createFramebuffer) so isRealGL2 is false -> Canvas2DPresenter.
// NEVER throws. Animation uses the render clock passed in params, never core.rand.

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

export function makePresenter(canvas, mkCanvas){
  let gl = null;
  try {
    gl = canvas.getContext('webgl2', { alpha:false, antialias:false, depth:false, stencil:false,
      premultipliedAlpha:false, preserveDrawingBuffer:false, powerPreference:'high-performance' });
  } catch(e){ gl = null; }
  if (!isRealGL2(gl)) return new Canvas2DPresenter(canvas);
  try { return new GLPost(canvas, gl); }
  catch(e){ if (typeof console !== 'undefined') console.warn('GLPost: WebGL2 init failed, falling back', e); return new Canvas2DPresenter(canvas); }
}

class Canvas2DPresenter {
  constructor(canvas){
    this.canvas = canvas; this.gl = null;
    try { this.ctx = canvas.getContext('2d'); } catch(e){ this.ctx = null; }
    if (this.ctx && this.ctx.imageSmoothingEnabled !== undefined) this.ctx.imageSmoothingEnabled = false;
  }
  resize(){}
  present(scene){ if (this.ctx) this.ctx.drawImage(scene, 0, 0); }
  dispose(){}
}

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

const FRAG_COMP = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 frag;
uniform sampler2D uScene; uniform sampler2D uBloom;
uniform vec2 uRes; uniform float uTime,uLight,uTurb,uNight,uWarm,uZoom,uFlash,uSecchi,uClarity,uBloomAmt;
uniform vec2 uSunUV; uniform float uSunInt, uRayExp, uSunUp, uCausAmt;   // Pass 3/slice 2: volumetric god-rays + caustics
uniform float uExposure;   // linear-HDR exposure (pre-tonemap); live-tunable for the grade eyeball-retune
vec3 aces(vec3 x){ const float a=2.51,b=0.03,c=2.43,d=0.59,e=0.14; return clamp((x*(a*x+b))/(x*(c*x+d)+e),0.0,1.0); }
float hash(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
// ---- volumetric water + light helpers (Pass 3/slice 2) — pure functions of uv/uTime, never the sim RNG ----
float h21(vec2 p){ p=fract(p*vec2(123.34,345.45)); p+=dot(p,p+34.345); return fract(p.x*p.y); }
float vnoise(vec2 p){
  vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  float a=h21(i), b=h21(i+vec2(1,0)), c=h21(i+vec2(0,1)), d=h21(i+vec2(1,1));
  return mix(mix(a,b,f.x), mix(c,d,f.x), f.y);
}
// ridged caustic NET: 3 octaves of crossed trig ridges, domain-warped by drifting noise
float causticNet(vec2 uv, float tt){
  vec2 p = uv*vec2(7.0,5.0);            // anisotropic so it reads as surface refraction, not a checker
  float net=0.0, amp=0.62, freq=1.0;
  for(int o=0;o<3;o++){
    vec2 q=p*freq;
    vec2 w=vec2(vnoise(q*0.5+tt*0.05), vnoise(q*0.5+7.3-tt*0.04))-0.5;   // slow refractive wobble
    q+=w*1.7;
    float r1=1.0-abs(sin(q.x+tt*0.6+sin(q.y*0.7)));
    float r2=1.0-abs(sin(q.y-tt*0.5+sin(q.x*0.8)));
    net += pow(r1*r2, 2.2)*amp;         // sharpen into thin bright veins
    amp*=0.55; freq*=1.9;
  }
  return clamp(net,0.0,1.0);
}
// volumetric god-rays: radial march of the half-res bloom bright-mask toward the sun UV
float godRays(sampler2D brightTex, vec2 uv, vec2 sunUV){
  const int STEPS=24; const float DENSITY=0.92, DECAY=0.965, WEIGHT=0.45;
  vec2 delta=(uv-sunUV)*(DENSITY/float(STEPS)), coord=uv;
  float illum=1.0, acc=0.0;
  float dither=fract(sin(dot(gl_FragCoord.xy, vec2(12.9898,78.233)))*43758.5453);   // de-band the 24 taps
  coord -= delta*dither;
  for(int i=0;i<STEPS;i++){
    coord -= delta;
    vec3 bc=texture(brightTex, clamp(coord,0.0,1.0)).rgb;
    acc += dot(bc, vec3(0.2126,0.7152,0.0722))*illum*WEIGHT; illum*=DECAY;
  }
  acc /= float(STEPS);
  acc *= exp(-distance(uv,sunUV)*1.6);   // brightest looking into the sun
  return acc;
}
void main(){
  vec2 uv=vUv; vec2 ctr=uv-0.5; float r2=dot(ctr,ctr);
  float surf=(1.0-smoothstep(0.0,max(0.18,uSecchi),uv.y))*uClarity; float tt=uTime;
  vec2 warp;
  warp.x = sin(uv.y*22.0+tt*0.9)*0.0011 + sin(uv.y*41.0-tt*1.1)*0.0007;
  warp.y = cos(uv.x*18.0+tt*0.7)*0.0010 + sin(uv.x*33.0+tt*0.9)*0.0006;
  float caustic=(0.5+0.5*sin(uv.x*90.0+tt*2.0))*(0.5+0.5*sin(uv.y*70.0-tt*1.7));
  warp += vec2(caustic-0.5)*0.0006;
  warp *= (0.4+0.6*surf)*(0.6+0.7*uLight)*(1.0+1.6*uTurb)/max(uZoom,0.6);
  vec2 wuv = clamp(uv+warp,0.0,1.0);
  float ca=(0.0010+0.0030*r2)/max(uZoom,0.6);
  vec2 dir=(r2>1e-6)?normalize(ctr):vec2(0.0);
  vec3 col;
  col.r=texture(uScene,clamp(wuv+dir*ca,0.0,1.0)).r;
  col.g=texture(uScene,wuv).g;
  col.b=texture(uScene,clamp(wuv-dir*ca,0.0,1.0)).b;
  float dofEdge=smoothstep(0.10,0.42,r2);
  float dofDeep=smoothstep(0.5,1.0,uv.y)*(0.4+0.6*(1.0-uSecchi));
  float dof=clamp(0.6*dofEdge+0.4*dofDeep,0.0,0.7);
  if(dof>0.001){
    vec2 px=1.5/uRes;
    vec3 b=texture(uScene,clamp(wuv+vec2(px.x,px.y),0.0,1.0)).rgb
          +texture(uScene,clamp(wuv+vec2(-px.x,px.y),0.0,1.0)).rgb
          +texture(uScene,clamp(wuv+vec2(px.x,-px.y),0.0,1.0)).rgb
          +texture(uScene,clamp(wuv+vec2(-px.x,-px.y),0.0,1.0)).rgb;
    col=mix(col,b*0.25,dof*0.6);
  }
  vec3 bloom=texture(uBloom,uv).rgb;
  col += bloom*uBloomAmt;

  // ---- VOLUMETRIC WATER + LIGHT (Pass 3/slice 2) — all added in linear HDR, PRE-ACES so the tonemap rolls off any
  // overshoot (no clipped white streaks). warp and surf from above are reused so the net and refraction agree. ----
  vec3 waterTint = mix(vec3(0.55,0.86,1.0), vec3(0.50,0.92,0.62), clamp(uTurb*1.3,0.0,1.0));   // blue→green with turbidity
  // (A) animated caustic NET — a multiplicative light net, brightest just under the surface, gone by the photic floor
  float causDepth = 1.0 - smoothstep(0.0, max(0.16, uSecchi), uv.y);    // 1 at surface(uv.y=0) → 0 at Secchi floor
  float caus = causticNet(uv + warp*8.0, uTime) * causDepth * uClarity * uLight * uSunUp;
  col *= 1.0 + caus * uCausAmt;                                         // brighten the veins (never flat-paint)
  col += waterTint * caus * uCausAmt * 0.45;                            // tint the veins to the water colour
  // (B) in-scattering glow — upper water glows, the deep stays moody; exponential depth extinction
  float scatter = exp(-uv.y * (2.4 + 2.2*(1.0-uClarity))) * uLight;
  col += waterTint * (scatter * (0.10 + 0.07*uTurb));
  // (C) reflective SURFACE band (Snell's window) — a bright shimmering ceiling at the very top, sky/sun tinted, day only.
  float surfBand = (1.0 - smoothstep(0.0, 0.07, uv.y)) * uSunUp;
  float ripple = (0.5 + 0.5*sin(uv.x*52.0 + uTime*1.6)) * (0.6 + 0.4*sin(uv.x*19.0 - uTime*1.05));
  vec3 skyCol = mix(vec3(0.62,0.82,0.98), vec3(1.0,0.90,0.66), uWarm*0.6);   // cool sky, warming at dawn/dusk
  col += skyCol * (surfBand * uClarity * (0.06 + 0.12*ripple));
  // (D) volumetric GOD-RAYS — additive in-scatter from the sun, only when it is up & near/above the surface
  if (uSunInt > 0.001){
    float ray = godRays(uBloom, uv, uSunUV);
    float depthFade = clamp(1.0 - uv.y*0.85, 0.0, 1.0);                 // strong at the surface, gone in the deep
    float turbFade  = 1.0 - 0.55*uTurb;                                // murk swallows the beams
    vec2  sd = max(vec2(0.0)-uSunUV, uSunUV-vec2(1.0));                 // per-axis distance outside [0,1]
    float frame = 1.0 - smoothstep(0.0, 0.6, clamp(max(sd.x,sd.y),0.0,0.6));   // fade rays as the sun leaves frame
    float amt = ray * uSunInt * uRayExp * uClarity * depthFade * turbFade * frame;
    vec3 shaftCol = mix(vec3(0.78,0.90,1.0), vec3(1.0,0.86,0.62), uWarm*0.5);  // cool, warmed at dawn/dusk
    col += shaftCol * amt;
  }

  col = aces(col*uExposure);
  col = mix(col, col*vec3(1.10,0.92,0.74), uWarm*0.30);
  col = mix(col, col*vec3(0.82,0.90,1.15), uNight*0.34);
  col = mix(col, col*vec3(0.96,1.03,0.88)+vec3(0.01,0.02,0.0), uTurb*0.22);
  col += vec3(0.9,0.93,1.0)*(uFlash*0.05)*(1.0-uv.y);
  // cinematic finish — a gentle filmic contrast S-curve + a warm-shallow → cool-deep split-tone (depth separation).
  col = mix(col, col*col*(3.0-2.0*col), 0.16);                        // smoothstep-shaped S-curve contrast
  float dsep = smoothstep(0.0, 0.92, uv.y);                           // 0 surface → 1 deep
  col = mix(col*vec3(1.05,1.01,0.95), col*vec3(0.93,0.99,1.10), dsep*0.45);   // warm shallow, cool teal deep
  float g=hash(gl_FragCoord.xy+fract(uTime)*131.0)-0.5;
  float lum=dot(col,vec3(0.299,0.587,0.114));
  col += g*0.028*(0.4+0.6*(1.0-lum))*(0.6+0.4*uNight);
  float vig=smoothstep(0.36,0.95,length(ctr*vec2(uRes.x/uRes.y,1.0)));
  col *= 1.0-vig*0.52;
  col = mix(col, vec3(0.008,0.030,0.060), vig*0.10);
  col = pow(clamp(col,0.0,1.0), vec3(1.0/2.2));   // LINEAR → sRGB encode — the FINAL op (decode was hardware sRGB on sample)
  float d1=hash(gl_FragCoord.xy+fract(uTime)*59.0), d2=hash(gl_FragCoord.xy+vec2(31.4,17.7)+fract(uTime)*59.0);
  col += (d1-d2)*(1.0/255.0);                     // TPDF ±1 LSB dither → kills 8-bit water-column/sky banding
  frag = vec4(clamp(col,0.0,1.0),1.0);
}`;

// ---- Pass 3/slice 3: GPU-lit fish quads ----
// opaque copy of the background scene texture into the scene FBO (reuses the attrib-less VERT)
const FRAG_BLIT = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 frag; uniform sampler2D uTex;
void main(){ frag = vec4(texture(uTex,vUv).rgb, 1.0); }`;
// per-fish quad: reproduce render.js's 2D affine (device-px center + half-extent + rotation + facing flip) on the GPU.
const VERT_FISH = `#version 300 es
layout(location=0) in vec2 aCorner;   // [-1,1]^2
layout(location=1) in vec2 aUv;       // [0,1]^2  (v=0 = canvas top = fish dorsal/back)
uniform vec2 uCenter;   // device px center (top-left origin, y down) = the inset p2
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
// directionally-lit textured fish: cylinder-normal half-Lambert + ambient floor + body-colour Fresnel rim + per-fish
// depth haze (copies the 2D water-haze math so a deep GL fish recedes into the same murk). Premultiplied-alpha output.
const FRAG_FISH = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 frag;
uniform sampler2D uTex;     // PREMULTIPLIED-alpha fish sprite (one cache bucket)
uniform vec2  uLightDir;    // screen-space light dir (normalized x,y); +y points toward the surface key
uniform float uWorldYN;     // a.y / WORLD.H  (0 surface .. 1 bed)
uniform float uSecchiFrac;  // secchiDepth / WORLD.H
uniform vec3  uHazeTint;    // water haze colour 0..1
uniform float uHazeMax;     // 2D haze strength at depth
uniform float uDepthDim;    // depthDim(a.y) 0.34..1.0
uniform float uLight;       // env.light 0..1
uniform float uNight;       // night factor 0..1
uniform float uVis;         // fade-in / corpse fade
uniform vec3  uTint;        // optional tint (default 1,1,1)
uniform float uKind;        // 0 living, 1 corpse
uniform float uBodyCurve, uRim, uAmbient, uSpec;
void main(){
  vec4 texel = texture(uTex, vUv);          // SRGB8_ALPHA8 → rgb hardware-decoded to LINEAR, alpha STRAIGHT
  if (texel.a < 0.012) discard;
  float v = vUv.y*2.0 - 1.0;                 // -1 back/top .. +1 belly/bottom
  float u = vUv.x*2.0 - 1.0;                 // -1 nose .. +1 tail
  float ny = -v;                             // +1 at the dorsal (faces the surface key)
  float nx = u * uBodyCurve;
  float nz2 = 1.0 - clamp(nx*nx + ny*ny, 0.0, 1.0);
  vec3 N = normalize(vec3(nx, ny, sqrt(max(nz2, 1e-3))));
  vec3 L = normalize(vec3(uLightDir, 0.85));
  float lambert = dot(N, L)*0.5 + 0.5;       // half-lambert wrap
  lambert = mix(uAmbient, 1.0, lambert);     // ambient floor → never below today's flat blit
  float fres = pow(1.0 - clamp(N.z, 0.0, 1.0), 3.0);
  float rim  = fres * uRim * (0.4 + 0.6*uLight) * (1.0 - 0.7*uKind);
  vec3 base = texel.rgb;                      // straight LINEAR body colour
  vec3 lit = base * lambert * uTint;
  lit += base * rim;                          // body-colour rim
  // crisp SPECULAR glint where the surface key meets the rounded dorsal — a wet, lit highlight
  vec3 Hh = normalize(L + vec3(0.0, 0.0, 1.0));
  float spec = pow(max(dot(N, Hh), 0.0), 32.0) * (0.3 + 0.7*uLight) * (1.0 - 0.85*uKind);
  lit += vec3(0.90, 0.95, 1.0) * (spec * uSpec);   // additive specular (straight; premult applied at output)
  lit *= uDepthDim;
  lit = mix(lit, lit * vec3(0.82,0.90,1.15), uNight * 0.34);
  float hazeT = uHazeMax * clamp(uWorldYN, 0.0, 1.0) * (0.35 + 0.65*uLight);
  hazeT += (1.0 - uSecchiFrac) * 0.10 * smoothstep(0.4, 1.0, uWorldYN);
  hazeT = clamp(hazeT, 0.0, 0.85);
  vec3 hazeLin = pow(uHazeTint, vec3(2.2));   // decode the sRGB haze colour → fish recede into the SAME linear murk as the bg
  lit = mix(lit, hazeLin, hazeT);             // straight
  frag = vec4(lit * texel.a * uVis, texel.a * uVis);   // premultiply at output (rgb & a both ×a×vis) for the premult-over blend
}`;

class GLPost {
  constructor(canvas, gl){
    this.canvas = canvas; this.gl = gl; this.failed = false; this.lost = false;
    this.w = 0; this.h = 0; this.bw = 0; this.bh = 0;
    this.rayExp = 1.6; this.causAmt = 0.40;   // volumetric tuning knobs (eyeballed; live-settable via renderer.present.rayExp/causAmt)
    this.exposure = 1.05;   // linear-HDR pre-tonemap exposure (live-settable; raise for a brighter overall image)
    this.fishAmbient = 0.42; this.fishRim = 0.40; this.fishSpec = 0.6;   // GL-fish lighting knobs (live-settable; spec = wet dorsal glint)
    this._onLost = (e)=>{ e.preventDefault(); this.lost = true; };
    this._onRestored = ()=>{ try { this._buildGL(); if (this.fishTexCache) this.fishTexCache.clear(); this.lost = false; this.failed = false; this.w = this.h = 0; } catch(er){ this.failed = true; } };
    if (typeof canvas.addEventListener === 'function'){
      canvas.addEventListener('webglcontextlost', this._onLost, false);
      canvas.addEventListener('webglcontextrestored', this._onRestored, false);
    }
    this._buildGL();
    this.resize(canvas.width || 2, canvas.height || 2);
  }
  _compile(type, src){
    const gl = this.gl, s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)){ const m = gl.getShaderInfoLog(s); gl.deleteShader(s); throw new Error('shader: '+m); }
    return s;
  }
  _link(fsSrc){
    const gl = this.gl, p = gl.createProgram();
    if (!this._vs) this._vs = this._compile(gl.VERTEX_SHADER, VERT);
    const fs = this._compile(gl.FRAGMENT_SHADER, fsSrc);
    gl.attachShader(p, this._vs); gl.attachShader(p, fs); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)){ const m = gl.getProgramInfoLog(p); throw new Error('link: '+m); }
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
  // ---- Pass 3/slice 3: GL-lit fish ----
  _linkPair(vsSrc, fsSrc){   // fish needs its OWN vertex shader (the shared _link reuses the attrib-less VERT)
    const gl = this.gl, p = gl.createProgram();
    const vs = this._compile(gl.VERTEX_SHADER, vsSrc), fs = this._compile(gl.FRAGMENT_SHADER, fsSrc);
    gl.attachShader(p, vs); gl.attachShader(p, fs); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('link: ' + gl.getProgramInfoLog(p));
    gl.deleteShader(vs); gl.deleteShader(fs); return p;
  }
  _buildFishGL(){   // NEVER throws out — on failure fishReady stays false and render.js keeps the 2D fish path
    const gl = this.gl;
    try {
      this.pBlit = this._link(FRAG_BLIT); this.uBlit = this._locs(this.pBlit, ['uTex']);
      this.pFish = this._linkPair(VERT_FISH, FRAG_FISH);
      this.uFish = this._locs(this.pFish, ['uCenter','uHalf','uRot','uFlip','uRes','uVis','uWorldYN','uSecchiFrac',
        'uHazeTint','uHazeMax','uDepthDim','uLight','uNight','uTint','uKind','uLightDir','uBodyCurve','uRim','uAmbient','uSpec','uTex']);
      const Q = new Float32Array([-1,-1,0,0, 1,-1,1,0, -1,1,0,1, 1,1,1,1]);
      this.quadVBO = gl.createBuffer(); this.fishVAO = gl.createVertexArray();
      gl.bindVertexArray(this.fishVAO); gl.bindBuffer(gl.ARRAY_BUFFER, this.quadVBO);
      gl.bufferData(gl.ARRAY_BUFFER, Q, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);
      gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);
      gl.bindVertexArray(null);
      this.fishTexCache = new Map(); this.fishTexMax = 512; this.fishFailed = false;
      this.sceneFBO = gl.createFramebuffer(); this.sceneFBOTex = null; this.sceneFmt = this.bloomFmt;
      this.fishReady = true;
    } catch(e){ this.fishReady = false; if (typeof console !== 'undefined') console.warn('GLPost fish init failed', e); }
  }
  _resizeFishFBO(w, h){
    const gl = this.gl;
    if (!this.sceneFBOTex) this.sceneFBOTex = this._tex(w, h, this.sceneFmt.internal, gl.RGBA, this.sceneFmt.type);
    else { gl.bindTexture(gl.TEXTURE_2D, this.sceneFBOTex); gl.texImage2D(gl.TEXTURE_2D, 0, this.sceneFmt.internal, w, h, 0, gl.RGBA, this.sceneFmt.type, null); }
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.sceneFBO);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.sceneFBOTex, 0);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE && this.sceneFmt.internal !== gl.RGBA8){
      this.sceneFmt = { internal: gl.RGBA8, type: gl.UNSIGNED_BYTE };
      gl.bindTexture(gl.TEXTURE_2D, this.sceneFBOTex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.sceneFBOTex, 0);
    }
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) this.fishFailed = true;
  }
  // sprite-canvas → GL texture, keyed by the SpriteCache ENTRY OBJECT identity (immutable once built → upload once, LRU-evict)
  _fishTex(entry){
    const gl = this.gl, cache = this.fishTexCache;
    let rec = cache.get(entry);
    if (rec){ cache.delete(entry); cache.set(entry, rec); return rec.tex; }   // LRU touch
    const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);            // uv handles orientation (row0 = canvas top = dorsal)
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false); // STRAIGHT alpha: SRGB8 decodes rgb→linear, FRAG_FISH premultiplies AFTER (premult-in-sRGB would dark-fringe AA edges)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.SRGB8_ALPHA8, gl.RGBA, gl.UNSIGNED_BYTE, entry.canvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    rec = { tex }; cache.set(entry, rec);
    if (cache.size > this.fishTexMax){ const k = cache.keys().next().value; gl.deleteTexture(cache.get(k).tex); cache.delete(k); }
    return tex;
  }
  _drawFishQuads(fish, p){
    const gl = this.gl; gl.useProgram(this.pFish); gl.bindVertexArray(this.fishVAO);
    gl.uniform2f(this.uFish.uRes, this.w, this.h);
    gl.uniform1f(this.uFish.uSecchiFrac, p.secchiFrac != null ? p.secchiFrac : 1);
    const hz = p.hazeTint || [16,40,66];
    gl.uniform3f(this.uFish.uHazeTint, hz[0]/255, hz[1]/255, hz[2]/255);
    gl.uniform1f(this.uFish.uHazeMax, p.hazeMax != null ? p.hazeMax : 0.3);
    gl.uniform1f(this.uFish.uLight, p.light || 0); gl.uniform1f(this.uFish.uNight, p.night || 0);
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
      gl.uniform1f(this.uFish.uWorldYN, f.worldYN != null ? f.worldYN : 0);
      gl.uniform1f(this.uFish.uDepthDim, f.depthDim != null ? f.depthDim : 1);
      gl.uniform1f(this.uFish.uKind, f.kind || 0);
      const t = f.tint; gl.uniform3f(this.uFish.uTint, t ? t[0] : 1, t ? t[1] : 1, t ? t[2] : 1);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    gl.bindVertexArray(null);
  }
  _buildGL(){
    const gl = this.gl; this._vs = null;
    this.pBright = this._link(FRAG_BRIGHT); this.pBlur = this._link(FRAG_BLUR); this.pComp = this._link(FRAG_COMP);
    this.uBright = this._locs(this.pBright, ['uScene','uThreshold','uKnee']);
    this.uBlur = this._locs(this.pBlur, ['uTex','uTexel','uDir']);
    this.uComp = this._locs(this.pComp, ['uScene','uBloom','uRes','uTime','uLight','uTurb','uNight','uWarm','uZoom','uFlash','uSecchi','uClarity','uBloomAmt','uSunUV','uSunInt','uRayExp','uSunUp','uCausAmt','uExposure']);
    this.vao = gl.createVertexArray();
    const ext = gl.getExtension('EXT_color_buffer_float');
    this.bloomFmt = ext ? { internal: gl.RGBA16F, type: gl.HALF_FLOAT } : { internal: gl.RGBA8, type: gl.UNSIGNED_BYTE };
    this.sceneTex = this._tex(1,1, gl.SRGB8_ALPHA8, gl.RGBA, gl.UNSIGNED_BYTE);   // sRGB internalformat → sampler hardware-decodes to LINEAR
    this.texA = this._tex(1,1, this.bloomFmt.internal, gl.RGBA, this.bloomFmt.type);
    this.texB = this._tex(1,1, this.bloomFmt.internal, gl.RGBA, this.bloomFmt.type);
    this.fboA = this._fbo(this.texA); this.fboB = this._fbo(this.texB);
    gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND);
    this._buildFishGL();   // GL-lit-fish machinery (own try/catch → fishReady false on failure, never blocks the post path)
  }
  resize(w,h){
    const gl = this.gl; if (this.failed) return; if (w === this.w && h === this.h) return;
    this.w = w; this.h = h; this.bw = Math.max(1, w >> 1); this.bh = Math.max(1, h >> 1);
    gl.bindTexture(gl.TEXTURE_2D, this.sceneTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.SRGB8_ALPHA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    for (const t of [this.texA, this.texB]){ gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, this.bloomFmt.internal, this.bw, this.bh, 0, gl.RGBA, this.bloomFmt.type, null); }
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fboA);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE){
      if (this.bloomFmt.internal !== gl.RGBA8){
        this.bloomFmt = { internal: gl.RGBA8, type: gl.UNSIGNED_BYTE };
        for (const t of [this.texA, this.texB]){ gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, this.bw, this.bh, 0, gl.RGBA, gl.UNSIGNED_BYTE, null); }
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fboA);
      }
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) this.failed = true;
    }
    if (this.fishReady) this._resizeFishFBO(w, h);   // the full-res scene FBO for the fish pass
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  present(scene, p){
    if (this.failed || this.lost) return;
    const gl = this.gl;
    try {
      const w = scene.width, h = scene.height; const realloc = (w !== this.w || h !== this.h);
      this.resize(w, h); if (this.failed) return;
      gl.bindVertexArray(this.vao); gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.sceneTex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      if (realloc) gl.texImage2D(gl.TEXTURE_2D, 0, gl.SRGB8_ALPHA8, gl.RGBA, gl.UNSIGNED_BYTE, scene);
      else gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, scene);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      // ---- Pass 3/slice 3: optional GL-lit fish — assemble (background + lit fish quads) into a scene FBO, then run the
      // existing bright→blur→composite on THAT so fish bloom/refract/grade with the water. No fish ⇒ sourceTex = sceneTex
      // (byte-identical to before). A per-frame failure sets fishFailed → render.js reverts to 2D fish next frame. ----
      const fishList = p && p.fish;
      const useFishFBO = !!(fishList && fishList.length) && this.fishReady && !this.fishFailed && !!this.sceneFBOTex;
      let sourceTex = this.sceneTex;
      if (useFishFBO){ try {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.sceneFBO); gl.viewport(0, 0, this.w, this.h);
        gl.disable(gl.BLEND); gl.useProgram(this.pBlit); gl.bindVertexArray(this.vao);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.sceneTex); gl.uniform1i(this.uBlit.uTex, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 3);                                   // background → scene FBO
        gl.enable(gl.BLEND); gl.blendEquation(gl.FUNC_ADD);
        gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);   // premultiplied over
        this._drawFishQuads(fishList, p);                                   // lit fish quads on top
        gl.disable(gl.BLEND);
        sourceTex = this.sceneFBOTex;
      } catch(eF){ this.fishFailed = true; sourceTex = this.sceneTex; if (typeof console !== 'undefined') console.warn('GLPost fish draw failed → 2D fish', eF); } }
      const bw = this.bw, bh = this.bh;
      gl.bindVertexArray(this.vao);                                         // restore the fullscreen-triangle VAO for the post
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.fboA); gl.viewport(0,0,bw,bh); gl.useProgram(this.pBright);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, sourceTex);
      gl.uniform1i(this.uBright.uScene, 0); gl.uniform1f(this.uBright.uThreshold, 0.62); gl.uniform1f(this.uBright.uKnee, 0.30);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.useProgram(this.pBlur); gl.uniform1i(this.uBlur.uTex, 0); gl.uniform2f(this.uBlur.uTexel, 1.0/bw, 1.0/bh);
      let srcTex = this.texA, dstFbo = this.fboB, dstTex = this.texB;
      const dirs = [[1,0],[0,1],[1,0],[0,1]];
      for (const d of dirs){
        gl.bindFramebuffer(gl.FRAMEBUFFER, dstFbo); gl.viewport(0,0,bw,bh);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, srcTex);
        gl.uniform2f(this.uBlur.uDir, d[0], d[1]); gl.drawArrays(gl.TRIANGLES, 0, 3);
        if (dstTex === this.texB){ srcTex = this.texB; dstFbo = this.fboA; dstTex = this.texA; }
        else { srcTex = this.texA; dstFbo = this.fboB; dstTex = this.texB; }
      }
      const bloomTex = srcTex;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0,0,this.w,this.h); gl.useProgram(this.pComp);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, sourceTex); gl.uniform1i(this.uComp.uScene, 0);   // bg, or bg+fish FBO
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, bloomTex); gl.uniform1i(this.uComp.uBloom, 1);
      gl.uniform2f(this.uComp.uRes, this.w, this.h);
      gl.uniform1f(this.uComp.uTime, p.time||0); gl.uniform1f(this.uComp.uLight, p.light||0);
      gl.uniform1f(this.uComp.uTurb, p.turbidity||0); gl.uniform1f(this.uComp.uNight, p.night||0);
      gl.uniform1f(this.uComp.uWarm, p.warm||0); gl.uniform1f(this.uComp.uZoom, p.zoom||1);
      gl.uniform1f(this.uComp.uFlash, p.flash||0);
      gl.uniform1f(this.uComp.uSecchi, p.secchiFrac!=null?p.secchiFrac:1);
      gl.uniform1f(this.uComp.uClarity, p.clarity!=null?p.clarity:1);
      gl.uniform1f(this.uComp.uBloomAmt, 0.55);
      // volumetric water + light (Pass 3/slice 2) — default-guarded so an older params object can't feed NaN
      gl.uniform2f(this.uComp.uSunUV, p.sunUV ? p.sunUV[0] : 0.5, p.sunUV ? p.sunUV[1] : 0.0);
      gl.uniform1f(this.uComp.uSunInt, p.sunInt || 0);
      gl.uniform1f(this.uComp.uSunUp, p.sunUp != null ? p.sunUp : 0);
      gl.uniform1f(this.uComp.uRayExp, this.rayExp);    // KNOB-B: god-ray master exposure (live-tunable via renderer.present.rayExp)
      gl.uniform1f(this.uComp.uCausAmt, this.causAmt);  // KNOB-C: caustic-net strength (live-tunable; keep < ~0.45 or it reads neon)
      gl.uniform1f(this.uComp.uExposure, this.exposure != null ? this.exposure : 1.05);  // KNOB-D: linear-HDR exposure
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindVertexArray(null);
    } catch(e){ this.failed = true; }
  }
  dispose(){
    const gl = this.gl;
    if (typeof this.canvas.removeEventListener === 'function'){
      this.canvas.removeEventListener('webglcontextlost', this._onLost);
      this.canvas.removeEventListener('webglcontextrestored', this._onRestored);
    }
    try {
      for (const pr of [this.pBright, this.pBlur, this.pComp, this.pBlit, this.pFish]) if (pr) gl.deleteProgram(pr);
      for (const t of [this.sceneTex, this.texA, this.texB, this.sceneFBOTex]) if (t) gl.deleteTexture(t);
      for (const f of [this.fboA, this.fboB, this.sceneFBO]) if (f) gl.deleteFramebuffer(f);
      if (this.vao) gl.deleteVertexArray(this.vao);
      if (this.fishVAO) gl.deleteVertexArray(this.fishVAO);
      if (this.quadVBO) gl.deleteBuffer(this.quadVBO);
      if (this.fishTexCache){ for (const rec of this.fishTexCache.values()) gl.deleteTexture(rec.tex); this.fishTexCache.clear(); }
    } catch(e){}
  }
}
