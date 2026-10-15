# The MEASURED lake beds: the 1949 MDIFW lake-survey maps of Upper and Lower Hot Brook Lake (revised 1965, 2004) carry
# spot soundings in feet along transects. This finds the numbers on the scans (dark-pixel components grouped into numbers;
# their VALUES were read off the maps by eye and are listed below in map order), fits each scan onto today's OpenStreetMap
# outline (trimmed ICP: a similarity transform, then affine — a hand-drawn map is rarely to one scale both ways; scale-bar
# check and shore misfit printed), and writes data/soundings.json ([x_east_m, y_north_m, depth_m] in the model's frame).
#   python tools/hotbrook/soundings.py      (after fetch_data.py; then build_model.py)
# Fit (2026-10-15): Upper E–W 2.71 / N–S 2.78 m/px (bar 2.73), shore misfit median 18 m; Lower E–W 2.49 / N–S 2.70 m/px
# (bar 2.71 — the 1949 drawing is ~8 % too wide), median 18 m. Soundings: Upper 83 (max 18 ft, mean 3.25 m), Lower 63
# (max 13 ft, mean 2.71 m). One Upper sounding is illegible on the scan ("0b", row 3) and left out.
import json, math, os
import numpy as np
from PIL import Image
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data'))

def components(dark):
    H, W = dark.shape; parent = []; runs = []   # run = (y, x0, x1, label)
    def find(a):
        while parent[a] != a: parent[a] = parent[parent[a]]; a = parent[a]
        return a
    prev = []
    for y in range(H):
        row = dark[y]; cur = []
        xs = np.flatnonzero(np.diff(np.concatenate(([0], row.astype(np.int8), [0]))))
        for k in range(0, len(xs), 2):
            x0, x1 = xs[k], xs[k + 1] - 1; lab = len(parent); parent.append(lab)
            for (_, px0, px1, pl) in prev:
                if px0 <= x1 + 1 and px1 >= x0 - 1:
                    ra, rb = find(lab), find(pl)
                    if ra != rb: parent[max(ra, rb)] = min(ra, rb)
            cur.append((y, x0, x1, lab))
        runs.extend(cur); prev = cur
    comp = {}
    for (y, x0, x1, l) in runs:
        r = find(l); c = comp.setdefault(r, [10**9, 10**9, -1, -1, 0])
        c[0] = min(c[0], x0); c[1] = min(c[1], y); c[2] = max(c[2], x1); c[3] = max(c[3], y); c[4] += x1 - x0 + 1
    return comp, runs, find


S, N, Wl, E = 45.575, 45.690, -67.975, -67.900
LAT0, LON0 = (S + N) / 2, (Wl + E) / 2
MX = 111320 * math.cos(math.radians(LAT0)); MY = 110540
ll2m = lambda lon, lat: ((lon - LON0) * MX, (lat - LAT0) * MY)
MILE = 1609.344

# soundings (feet) by map row, matched in order to the detected number centres (px); 'skip' = illegible on the scan
UPPER = [
    [(898, 296, 3), (922, 296, 4), (958, 296, 5), (988, 296, 4)],
    [(843, 404, 9), (886, 404, 16), (931, 403, 17), (980, 403, 16), (1024, 402, 15)],
    [(819, 532, 10), (860, 531, 15), (907, 531, 16), (954, 530, 18), (1000, 530, 18), (1050, 529, 18), (1094, 528, 17), (1139, 528, 15)],
    [(911, 676, 8), (963, 676, 10), (1015, 676, 16), (1058, 675, 16), (1102, 675, 15), (1144, 674, 13)],
    [(964, 788, 13), (1002, 788, 16), (1034, 788, 14), (1070, 788, 5)],
    [(714, 910, 7), (756, 910, 11), (806, 910, 12), (912, 914, 8), (964, 913, 12), (1006, 913, 11), (1047, 912, 13), (1098, 912, 14)],
    [(581, 1004, 8), (624, 1004, 11), (676, 1004, 11), (742, 1003, 12), (812, 1002, 12), (939, 1006, 13), (988, 1006, 13), (1034, 1006, 12), (1088, 1006, 13), (1136, 1005, 12)],
    [(583, 1084, 6), (630, 1084, 10), (678, 1084, 11), (736, 1084, 12), (786, 1083, 12), (837, 1082, 12), (878, 1082, 9), (938, 1082, 12), (995, 1081, 12), (1050, 1080, 14), (1094, 1080, 13), (1146, 1079, 13)],
    [(592, 1216, 3), (622, 1216, 4), (668, 1216, 10), (708, 1216, 12), (749, 1215, 12), (794, 1215, 12), (918, 1222, 4), (960, 1222, 12), (998, 1222, 13), (1036, 1221, 13), (1078, 1221, 12)],
    [(594, 1330, 4), (633, 1330, 5), (668, 1330, 9), (704, 1330, 4), (741, 1330, 3), (784, 1328, 2), (822, 1328, 8), (864, 1328, 8), (918, 1328, 2), (972, 1327, 10), (1023, 1326, 10), (1062, 1326, 9), (1100, 1328, 9), (1134, 1326, 8), (1172, 1326, 4)],
]
LOWER = [
    [(324, 374, 7), (358, 360, 8), (392, 346, 8)],
    [(284, 473, 7), (320, 464, 9), (362, 461, 11), (408, 451, 11), (470, 442, 12), (526, 432, 12)],
    [(272, 575, 5), (320, 568, 11), (369, 560, 11), (425, 552, 12), (482, 545, 12), (540, 532, 12), (588, 524, 11), (626, 518, 6)],
    [(223, 734, 6), (282, 726, 11), (346, 716, 12), (411, 704, 12), (487, 688, 12), (556, 675, 11), (608, 667, 11), (658, 658, 9), (719, 645, 4)],
    [(188, 901, 5), (234, 893, 7), (287, 891, 8), (329, 885, 9), (380, 883, 10), (425, 874, 12), (477, 868, 10)],
    [(228, 1048, 6), (282, 1048, 9), (333, 1047, 11), (404, 1045, 12), (480, 1044, 13), (540, 1043, 12), (576, 1043, 6)],
    [(355, 1149, 7), (390, 1148, 9), (437, 1147, 11), (488, 1142, 11), (542, 1138, 11), (592, 1134, 6)],
    [(388, 1254, 6), (440, 1252, 9), (486, 1251, 8), (532, 1250, 11), (578, 1250, 11), (620, 1250, 5)],
    [(448, 1358, 6), (491, 1358, 8), (530, 1358, 9), (566, 1356, 8), (598, 1356, 8), (632, 1356, 7)],
    [(494, 1425, 5), (535, 1424, 6), (569, 1424, 6), (616, 1424, 5), (650, 1424, 4)],
]
# scale bars: 0.5 mile between these x pixels; the lake's ink lies inside this box (title, arrow and scale bar excluded)
CFG = {'upper': {'snd': UPPER, 'bar': (248, 543), 'box': (440, 180, 1264, 1584), 'osm': 'Upper_Hot_Brook_Lake.json'},
       'lower': {'snd': LOWER, 'bar': (803, 1100), 'box': (100, 200, 820, 1584), 'osm': 'Lower_Hot_Brook_Lake.json'}}

def osm_rings(f):
    g = json.load(open(f))[0]['geojson']; polys = [g['coordinates']] if g['type'] == 'Polygon' else g['coordinates']
    pts = []
    for poly in polys:
        for ring in poly:
            r = np.array([ll2m(*p) for p in ring])
            for a, b in zip(r[:-1], r[1:]):   # densify to ~5 m
                n = max(1, int(np.hypot(*(b - a)) / 5)); pts.extend(a + (b - a) * t / n for t in range(n))
    return np.array(pts)

def umeyama(A, B):   # similarity s, R, t minimising |s R A + t − B|
    ma, mb = A.mean(0), B.mean(0); A0, B0 = A - ma, B - mb
    U, Sg, Vt = np.linalg.svd(B0.T @ A0 / len(A)); D = np.eye(2); D[1, 1] = np.sign(np.linalg.det(U @ Vt))
    R = U @ D @ Vt; s = (Sg * np.diag(D)).sum() / (A0 ** 2).sum() * len(A); t = mb - s * R @ ma
    return s, R, t

out = {}
for name, c in CFG.items():
    a = np.asarray(Image.open(os.path.join('ifw', f'{name}_p1.png')).convert('L')); dark = a < 140
    comp, runs, find = components(dark)
    x0b, y0b, x1b, y1b = c['box']; keep = set()
    for r, (x0, y0, x1, y1, n) in comp.items():
        if max(x1 - x0, y1 - y0) > 120 and x0 >= x0b and y0 >= y0b and x1 <= x1b and y1 <= y1b: keep.add(r)   # long ink lines = shore
    pts = np.array([(x, y) for (y, xa, xb, l) in runs if find(l) in keep for x in range(xa, xb + 1, 3)], dtype=float)
    pts = pts[::max(1, len(pts) // 3000)]
    mpp = 0.5 * MILE / (c['bar'][1] - c['bar'][0])          # metres per pixel from the scale bar
    A = np.stack([pts[:, 0], -pts[:, 1]], 1)                 # image y down → north up
    B = osm_rings(c['osm'])
    s, R, t = mpp, np.eye(2), B.mean(0) - mpp * A.mean(0)
    for it in range(60):
        P = (s * (R @ A.T)).T + t
        d2 = ((P[:, None, :] - B[None, :, :]) ** 2).sum(-1); j = d2.argmin(1); dist = np.sqrt(d2[np.arange(len(P)), j])
        k = dist <= np.quantile(dist, 0.8)                   # trimmed: ignore the worst 20 % (inlet/outlet lines, map errors)
        s, R, t = umeyama(A[k], B[j[k]])
    P = (s * (R @ A.T)).T + t; d2 = ((P[:, None, :] - B[None, :, :]) ** 2).sum(-1); dist = np.sqrt(d2.min(1))
    rot = math.degrees(math.atan2(R[1, 0], R[0, 0]))
    print(f'{name}: similarity scale {s:.3f} m/px (bar {mpp:.3f}), rotation {rot:+.1f}°, shore misfit median {np.median(dist):.0f} m, 80th pct {np.quantile(dist, 0.8):.0f} m')
    # then AFFINE (separate E–W and N–S stretch and shear): a 1949 hand-drawn map is rarely to one scale in both directions
    Ah = np.hstack([A, np.ones((len(A), 1))]); M = np.vstack([(s * R).T, t])          # P = Ah @ M
    for it in range(60):
        P = Ah @ M; d2 = ((P[:, None, :] - B[None, :, :]) ** 2).sum(-1); j = d2.argmin(1); dist = np.sqrt(d2[np.arange(len(P)), j])
        k = dist <= np.quantile(dist, 0.8)
        M = np.linalg.lstsq(Ah[k], B[j[k]], rcond=None)[0]
    P = Ah @ M; dist = np.sqrt(((P[:, None, :] - B[None, :, :]) ** 2).sum(-1).min(1))
    sx, sy = np.hypot(*M[0, :2]), np.hypot(*M[1, :2])
    print(f'  affine: E–W {sx:.3f} m/px, N–S {sy:.3f} m/px (bar {mpp:.3f}), shore misfit median {np.median(dist):.0f} m, 80th pct {np.quantile(dist, 0.8):.0f} m')
    snd = []
    for row in c['snd']:
        for (x, y, ft) in row:
            q = np.array([x, -y, 1.0]) @ M; snd.append([round(float(q[0]), 1), round(float(q[1]), 1), round(ft * 0.3048, 2)])
    out[name] = {'soundings': snd, 'affine': M.tolist(), 'misfit_med': float(np.median(dist))}
    print(f'  {len(snd)} soundings, max {max(p[2] for p in snd):.2f} m, mean of soundings {np.mean([p[2] for p in snd]):.2f} m')
json.dump(out, open('soundings.json', 'w'))
