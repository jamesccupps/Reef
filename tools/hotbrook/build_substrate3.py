"""build_substrate3.py — THE LAKES' BED BY SUBSTRATE (docs/review/ECOSYSTEM_BUILD.md E1; the rule and every number from
docs/research_notes/Maine lake shores and catchment/littoral_substrate_and_wood.md §1 and "What the sim should model" (a)).

For each world's grid (src/w3/hotbrook3d.js, the 1/10 lakes, and src/w3/true/hotbrook3d.js, the true-size ones) it writes the
fractions of each water cell's bed that are boulder–cobble ('rock'), gravel, sand and coarse organic muck ('org'); the rest is
mud (gyttja). Static and derived from the geometry: no sim state, no save field, no random draw.

The rule (Rowan et al. 1992 / Cooley 1997; Hakanson's 21–24 % of the bed above the wave base for these lakes' shape):
  1. per lake cell, the fetch to the shore in 36 directions — in REAL metres (the 1/10 world's × 10); Fmax the longest;
  2. the critical wave base Zc = 0.77 × 1.66·√(Fmax km) m (~1.8 m here), r = the bed's depth / Zc;
  3. r < 0.35 the swash and ice-push band: boulder–cobble lag 0.6, gravel 0.3, sand 0.1; 0.35–0.6 the upper shelf: cobble 0.3,
     gravel 0.3, sand 0.4; 0.6–0.8 the mid shelf: gravel 0.2, sand 0.7, mud 0.1; 0.8–1 the shelf edge: sand 0.4, mud 0.4,
     organic detritus 0.2; r ≥ 1 gyttja — blended linearly between the bands' centres, not stepped;
  4. the shore's overrides: water within 50 m (real) of a wetland shore (woody, shrub or emergent wetland) and above the wave base
     is organic muck; a beach shore's water above 1.5 m is sand; a developed (camp) shore's shallows shift a fifth of their stone
     to sand (Deeds 2023: sand rises with shoreline disturbance);
  5. the brook (MDIFW "rocky and hard bottomed"; the human's photos): its riffles (< 0.4 m) cobble 0.5, gravel 0.4, sand 0.1;
     its runs and the pool sand 0.4, gravel 0.3, mud 0.3 [inf].
The printout checks the note's targets: hard bed (rock + gravel) 6–8 % of each lake, sand and mixed 8–15 %, mud + organic 75–80 %,
the bed above the wave base 21–25 %, the mud line's median depth 1.6–2.0 m.

  python tools/hotbrook/build_substrate3.py      (both worlds; writes src/w3/substrate3.js and src/w3/true/substrate3.js)
"""
import base64, re, sys, math, os
import numpy as np

ROOT = os.path.normpath(os.path.join(os.path.dirname(__file__), '..', '..'))
WET = ('woody_wet', 'shrub_wet', 'emergent_wet'); DEV = ('dev_open', 'dev_low', 'dev_med', 'dev_high'); BEACH = ('beach',)
# the bands' centres in r and each substrate's share there (rock, gravel, sand, organic; mud the rest)
KNOT_R = [0.0, 0.175, 0.475, 0.70, 0.90, 1.05]
KNOT = {'rock': [0.6, 0.6, 0.3, 0.0, 0.0, 0.0], 'grav': [0.3, 0.3, 0.3, 0.2, 0.0, 0.0], 'sand': [0.1, 0.1, 0.4, 0.7, 0.4, 0.0], 'org': [0.0, 0.0, 0.0, 0.0, 0.2, 0.0]}


def load(path):
    src = open(path, encoding='utf-8').read()
    def field(name): return base64.b64decode(re.search(r"\b" + name + r":\s*'([^']*)'", src).group(1))
    num = lambda k: float(re.search(k + r":\s*([\d.]+)", src).group(1))
    NX, NY, CELL = int(num('NX')), int(num('NY')), num('CELL')
    scales = [float(v) for v in re.findall(r"SCALE:\s*([\d.]+)", src)]
    classes = eval(re.search(r"CLASSES:\s*(\[[^\]]*\])", src).group(1))
    body = np.frombuffer(field('body'), dtype=np.uint8).reshape(NY, NX)
    cover = np.frombuffer(field('cover'), dtype=np.uint8).reshape(NY, NX)
    dep = np.frombuffer(field('depth_cm'), dtype='<u2').reshape(NY, NX).astype(float) / 100.0
    return dict(NX=NX, NY=NY, CELL=CELL, lakeScale=scales[0], brookScale=scales[1] if len(scales) > 1 else scales[0], classes=classes, body=body, cover=cover, dep=dep)


def fetch(W, k):
    """per cell of lake k: the fetch to its shore in 36 directions (grid m), and the land class where the shortest ray lands"""
    lake = W['body'] == k; NX, NY, C = W['NX'], W['NY'], W['CELL']
    jj, ii = np.nonzero(lake); n = len(ii); nd = 36
    F = np.zeros((nd, n)); cls = np.full((nd, n), -1)
    for t in range(nd):
        th = 2 * math.pi * t / nd; dx, dy = math.cos(th), math.sin(th)
        alive = np.ones(n, bool); s = 0.0
        while alive.any() and s < 4000.0 / C:
            s += 0.7
            x = np.round(ii + dx * s).astype(int); y = np.round(jj + dy * s).astype(int)
            out = (x < 0) | (x >= NX) | (y < 0) | (y >= NY)
            xc = np.clip(x, 0, NX - 1); yc = np.clip(y, 0, NY - 1)
            hit = alive & (out | ~lake[yc, xc])
            F[t, hit] = s * C
            cls[t, hit] = np.where(out[hit], -1, W['cover'][yc[hit], xc[hit]].astype(np.int16))   # (NumPy 2: the uint8 cover widened for the −1)
            alive &= ~hit
        F[t, alive] = s * C
    tmin = F.argmin(axis=0)
    return jj, ii, F.max(axis=0), F.min(axis=0), cls[tmin, np.arange(n)]


def build(W, tag):
    NX, NY = W['NX'], W['NY']; out = {k: np.zeros((NY, NX)) for k in ('rock', 'grav', 'sand', 'org')}
    names = W['classes']; idx = lambda group: [names.index(c) for c in group if c in names]
    wet, dev, beach = idx(WET), idx(DEV), idx(BEACH)
    for k, nm in ((1, 'Upper'), (2, 'Lower')):
        jj, ii, Fmax, Fmin, near = fetch(W, k)
        sc = W['lakeScale']; Fk = Fmax / sc / 1000.0; dshore = Fmin / sc   # (REAL km and m)
        z = W['dep'][jj, ii]; zc = 0.77 * 1.66 * np.sqrt(np.maximum(Fk, 1e-3)); r = z / zc
        f = {s: np.interp(r, KNOT_R, KNOT[s]) for s in KNOT}
        org = np.isin(near, wet) & (dshore <= 50.0) & (r < 1.0)
        for s in ('rock', 'grav', 'sand'): f[s] = np.where(org, 0.0, f[s])
        f['org'] = np.where(org, 1.0, f['org'])
        bch = np.isin(near, beach) & (z < 1.5) & ~org
        f['rock'] = np.where(bch, 0.0, f['rock']); f['grav'] = np.where(bch, 0.1, f['grav']); f['sand'] = np.where(bch, 0.9, f['sand']); f['org'] = np.where(bch, 0.0, f['org'])
        dv = np.isin(near, dev) & (r < 1.0) & ~org & ~bch
        mv = 0.2 * (f['rock'] + f['grav'])
        f['sand'] = np.where(dv, f['sand'] + mv, f['sand']); f['rock'] = np.where(dv, f['rock'] * 0.8, f['rock']); f['grav'] = np.where(dv, f['grav'] * 0.8, f['grav'])
        for s in out: out[s][jj, ii] = f[s]
        n = len(z); hard = (f['rock'] + f['grav']).sum() / n; sand = f['sand'].sum() / n; orgm = 1 - hard - sand
        mudline = np.median(zc)
        print(f'{tag} {nm}: {n} cells — hard (rock + gravel) {100*hard:.1f} %, sand {100*sand:.1f} %, mud + organic {100*orgm:.1f} % '
              f'(organic muck {100*org.mean():.1f} %, beach {100*bch.mean():.1f} %, camp shore {100*dv.mean():.1f} %); above the wave base {100*(r < 1).mean():.1f} %; '
              f'median wave base {mudline:.2f} m; median Fmax {np.median(Fk):.2f} km')
    brook = W['body'] == 3; zb = W['dep'][brook]; rif = zb < 0.4
    out['rock'][brook] = np.where(rif, 0.5, 0.0); out['grav'][brook] = np.where(rif, 0.4, 0.3); out['sand'][brook] = np.where(rif, 0.1, 0.4)
    print(f'{tag} brook: {brook.sum()} cells, riffles {100*rif.mean():.0f} %')
    return out


def write(out, W, path, src_rel):
    enc = lambda a: base64.b64encode(np.clip(np.round(a * 255), 0, 255).astype(np.uint8).tobytes()).decode()
    with open(path, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(f"// substrate3.js — GENERATED by tools/hotbrook/build_substrate3.py from {src_rel}; do not edit by hand.\n")
        fh.write("// The bed's substrate per grid cell (docs/review/ECOSYSTEM_BUILD.md E1): fractions × 255 of boulder–cobble (rock), gravel,\n")
        fh.write("// sand and coarse organic muck (org); mud (gyttja) is the rest. Row 0 at the SOUTH edge, as hotbrook3d.js.\n")
        fh.write(f"export const SUB3 = {{\n  NX: {W['NX']}, NY: {W['NY']},\n")
        for k in ('rock', 'grav', 'sand', 'org'): fh.write(f"  {k}: '{enc(out[k])}',\n")
        fh.write("};\n")


if __name__ == '__main__':
    for rel, dst, tag in (('src/w3/hotbrook3d.js', 'src/w3/substrate3.js', '1/10'), ('src/w3/true/hotbrook3d.js', 'src/w3/true/substrate3.js', 'true')):
        W = load(os.path.join(ROOT, rel)); out = build(W, tag); write(out, W, os.path.join(ROOT, dst), rel)
        print(f'  wrote {dst}')
