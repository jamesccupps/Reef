# The sim's cross-section of the real Hot Brook system, built from the landscape model (data/hotbrook_model.json):
#   Upper's south shore (land) → Upper Hot Brook Lake → its outlet → the connecting brook → Lower Hot Brook Lake → Lower's
#   north shore (wetland).
# Each lake keeps its REAL centreline pattern (where it is deeper or shallower along the flow path: Upper's south basin,
# the narrows by the points, the deep north basin) but its depths are quantile-mapped onto the lake's HYPSOGRAPHY (the share
# of the whole lake's area at each depth), so the slice has the real proportion of shallows to basin and the real mean
# depth — a centreline alone over-represents deep water (Upper's is only 27 % ≤ 3 m against 44 % of the lake).
# The lakes are compressed horizontally (~90×: 3.2 km → 36 m); depths are true. The brook (154 m) is drawn from the
# angler's description (the deeper pool at its upper mouth, riffles, a shallower run) at ~11× compression.
#   python tools/hotbrook/slice_profile.py   → sim/slice.json (+ sim/slice.png, a picture at true vertical scale)
import json, base64, os, math
import numpy as np
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__)); os.chdir(HERE)
m = json.load(open('data/hotbrook_model.json'))
NX, NY = m['meta']['nx'], m['meta']['ny']
dec = lambda s, t: np.frombuffer(base64.b64decode(s), dtype=t)
depth = dec(m['depth_cm'], np.uint16).reshape(NY, NX) / 100; lake = dec(m['lake'], np.uint8).reshape(NY, NX)

# lengths in the sim (m) — see the docstring
LEN = {'bankL': 3.0, 'upper': 36.0, 'brook': 14.0, 'lower': 32.0, 'bankR': 3.0}
P = np.array(m['profile'])                       # [distance m, depth m, ground rel. m, cover] along the real path
runs = []; s = None
for k in range(len(P)):
    if P[k, 1] > 0 and s is None: s = k
    if (P[k, 1] <= 0 or k == len(P) - 1) and s is not None:
        if k - s > 5: runs.append((s, k))
        s = None
(ua, ub), (la, lb) = runs[0], runs[-1]

def mapped(seg, lid, n, start=0.0, end=0.0):
    """resample a centreline run to n points and quantile-map its depths onto the lake's area distribution; `start`/`end`
    = the depth at the run's two ends (0 at a shore; the channel depth where the lake meets the brook)"""
    k = 7; seg = np.convolve(np.pad(seg, k // 2, mode='edge'), np.ones(k) / k, mode='valid')   # ~100 m running mean (15 m samples)
    x = np.linspace(0, 1, len(seg)); xs = np.linspace(0, 1, n)
    d = np.interp(xs, x, seg)
    d = np.concatenate(([0.0], d[1:-1], [0.0]))   # the shores
    area = np.sort(depth[lake == lid])             # the whole lake's depths (its hypsography)
    ranks = np.argsort(np.argsort(d, kind='stable'), kind='stable') / (n - 1)
    out = np.quantile(area, ranks); out[0] = start; out[-1] = end
    # no near-dry bar inside the lake: a lake's lowest area quantiles (its 0–0.3 m fringe) belong at its shores, which the
    # slice meets only at the ends — interior points keep at least the brook's riffle depth
    out[1:-1] = np.maximum(out[1:-1], 0.32)
    return out
dx = 0.25                                        # m between profile points
nU, nL = int(LEN['upper'] / dx) + 1, int(LEN['lower'] / dx) + 1
up = mapped(P[ua:ub, 1], 1, nU, 0.0, 0.45); lo = mapped(P[la:lb, 1], 2, nL, 0.5, 0.0)   # Upper's south shore … outlet; Lower's inlet … north shore
# the brook: Upper's outlet lip → the deeper pool at the upper mouth (3–4 ft, the angler) → riffle → a shallower run
# (sunfish) → riffle → Lower's inlet lip; riffles 0.35 m (the sim's STREAM.DEPTH; Hot Brook is "rocky and hard bottomed")
BROOK = [(0.0, 0.45), (1.0, 0.7), (2.0, 1.05), (4.0, 1.15), (5.0, 0.9), (6.0, 0.4), (7.0, 0.32), (8.0, 0.5), (10.0, 0.62),
         (11.0, 0.5), (12.0, 0.33), (13.0, 0.36), (14.0, 0.5)]
nB = int(LEN['brook'] / dx) + 1; xb = np.linspace(0, LEN['brook'], nB)
br = np.interp(xb, [p[0] for p in BROOK], [p[1] for p in BROOK])
# land at both ends: Upper's south shore (rocky till rising ~1.2 m) and Lower's north shore (a low wetland margin, ~0.3 m)
nb = int(LEN['bankL'] / dx) + 1
bankL = -np.linspace(1.2, 0.0, nb) ** 1.0         # negative depth = ground above the water
bankR = -np.minimum(0.35, np.linspace(0.0, 0.6, nb))
# join: the lake shore points (depth 0) meet the brook lips with a short shallow ramp
seq = [('bankL', bankL[:-1]), ('upper', up), ('brook', br), ('lower', lo), ('bankR', bankR[1:])]
prof, segs, x0 = [], {}, 0.0
for name, arr in seq:
    segs[name] = [round(x0, 2), round(x0 + (len(arr) - 1) * dx, 2)]
    prof += [[round(x0 + i * dx, 2), round(float(v), 3)] for i, v in enumerate(arr)]
    x0 += len(arr) * dx
W_m = prof[-1][0]
_inner = [p[1] for p in prof if segs['upper'][0] < p[0] < segs['lower'][1]]
print('shallowest point between the two shores (m):', min(_inner))
def stats(arr):
    a = np.array(arr); a = a[a > 0]
    return {'mean': round(float(a.mean()), 2), 'max': round(float(a.max()), 2), 'le1': round(float((a <= 1).mean()), 3), 'le3': round(float((a <= 3).mean()), 3)}
out = {'dx': dx, 'width_m': W_m, 'segments': segs, 'profile': prof,
       'upper': stats(up), 'lower': stats(lo), 'brook': stats(br),
       'real': {'upper': {'mean': round(float(depth[lake == 1].mean()), 2), 'le3': round(float((depth[lake == 1] <= 3).mean()), 3)},
                'lower': {'mean': round(float(depth[lake == 2].mean()), 2), 'le3': round(float((depth[lake == 2] <= 3).mean()), 3)}},
       'compression': {'upper': round(float(P[ub - 1, 0] - P[ua, 0]) / LEN['upper'], 1), 'lower': round(float(P[lb - 1, 0] - P[la, 0]) / LEN['lower'], 1), 'brook': round(154 / LEN['brook'], 1)}}
os.makedirs('sim', exist_ok=True); json.dump(out, open('sim/slice.json', 'w'), indent=1)
print(json.dumps({k: out[k] for k in ['width_m', 'segments', 'upper', 'lower', 'brook', 'real', 'compression']}, indent=1))

# a picture at TRUE vertical scale against the same width: the new slice over the sim's current one
sim = m['sim']['profile']
PX = 16; Wpx = int(W_m * PX); Hrow = int(16 * PX)
img = Image.new('RGB', (Wpx + 40, Hrow * 2 + 60), (14, 20, 22)); d = ImageDraw.Draw(img)
def draw(row, pts, wid, label):
    top = 30 + row * (Hrow + 20); sx = PX
    y = lambda dep: top + 2 * PX + dep * PX   # 2 m of air above the water line
    R = 20 + wid * sx
    d.rectangle([20, top, R, top + Hrow], fill=(160, 190, 205))            # sky
    d.rectangle([20, y(0), R, top + Hrow], fill=(54, 106, 128))            # water
    ground = [(20 + p[0] * sx, y(p[1])) for p in pts]
    d.polygon(ground + [(R, top + Hrow), (20, top + Hrow)], fill=(110, 84, 58))
    d.text((24, top + 4), label, fill=(240, 240, 235))
draw(0, prof, W_m, f'NEW: Hot Brook slice, {W_m:.0f} m wide, true depths (Upper 5.5 m, brook pools 1.1 m, Lower 3.9 m)')
draw(1, sim, m['sim']['widthM'], f"NOW: generic lake + stream + pond, {m['sim']['widthM']:.0f} m wide (lake 14.4 m) - same scale")
img.save('sim/slice.png'); print('wrote sim/slice.png', img.size)

# ---------- the sim's data module (src/hotbrook_profile.js): pure data, imported by config.js ----------
segs_js = ', '.join(f"{k}: [{v[0]}, {v[1]}]" for k, v in segs.items())
vals = [p[1] for p in prof]
lines = []
for i in range(0, len(vals), 20): lines.append('    ' + ', '.join(f'{v:.3f}'.rstrip('0').rstrip('.') if v != 0 else '0' for v in vals[i:i + 20]) + ',')
js = f"""// hotbrook_profile.js — GENERATED by tools/hotbrook/slice_profile.py from the Hot Brook landscape model; do not edit by hand.
// The sim's cross-section of the REAL Upper and Lower Hot Brook Lake (T8 R4 NBPP / Danforth, Maine), left to right:
// Upper's south shore (land) → Upper Hot Brook Lake → the connecting brook → Lower Hot Brook Lake → Lower's north shore.
// DEPTH in metres every DX m along the slice (negative = ground above the water). Depths are true; each lake is its real
// centreline (the 1949 MDIFW soundings fitted to today's shoreline) quantile-mapped onto the lake's real area-at-depth
// (Upper: mean {out['upper']['mean']} m, {round(100 * out['upper']['le3'])} % ≤ 3 m, max {out['upper']['max']} m; Lower: mean {out['lower']['mean']} m,
// {round(100 * out['lower']['le3'])} % ≤ 3 m, max {out['lower']['max']} m), compressed horizontally ~{out['compression']['upper']}× (Upper) and ~{out['compression']['lower']}× (Lower); the brook (154 m,
// ~{out['compression']['brook']}×) from the angler's description: the deeper pool at its upper mouth (3–4 ft), riffles, a shallower run.
export const HOTBROOK = {{
  DX: {dx},
  SEGMENTS: {{ {segs_js} }},   // m along the slice
  DEPTH: [
{chr(10).join(lines)}
  ],
}};
"""
open(os.path.join(HERE, '..', '..', 'src', 'hotbrook_profile.js'), 'w', encoding='utf-8', newline='\n').write(js)
print('wrote src/hotbrook_profile.js', len(vals), 'points')
