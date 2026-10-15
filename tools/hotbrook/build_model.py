#   python tools/hotbrook/build_model.py   (after fetch_data.py; writes data/hotbrook_model.json for viewer.html)
# Build a 3-D-ready model of the real Hot Brook landscape (Upper & Lower Hot Brook Lake, Hot Brook; Danforth/T8 R4, Maine)
# from public data:
#   lake outlines + brooks  — OpenStreetMap (Nominatim polygon_geojson), © OpenStreetMap contributors (ODbL)
#   elevation               — USGS 3DEP via AWS Terrain Tiles (terrarium, z14 ≈ 6.7 m/px here)
#   wetlands                — USFWS National Wetlands Inventory
#   land cover              — NLCD 2021 (MRLC WMS)
#   lake depths             — MDIFW lake survey / Lakes of Maine: Upper 360 ha, mean 3.35 m, max 5.5 m; Lower 277 ha, mean 2.74, max 4.0
# Bathymetry is APPROXIMATED (no digitised contours): depth rises with distance from shore, fitted to each lake's mean and max.
import json, math, base64, os, sys
import numpy as np
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
os.chdir(os.path.join(HERE, 'data'))   # fetch_data.py's output; the model is written here too
S, N, Wl, E = 45.575, 45.690, -67.975, -67.900
LAT0, LON0 = (S + N) / 2, (Wl + E) / 2
MX = 111320 * math.cos(math.radians(LAT0)); MY = 110540
CELL = 15.0                                          # m per grid cell
W_M, H_M = (E - Wl) * MX, (N - S) * MY
NX, NY = int(W_M / CELL), int(H_M / CELL)
print('grid', NX, NY, 'cells', NX * NY, 'area km', round(W_M / 1000, 2), round(H_M / 1000, 2))
# grid cell (i, j) → j row from the NORTH edge, i column from the WEST edge; local metres x east, y north from the centre
def ll2px(lon, lat): return ((lon - Wl) * MX / CELL, (N - lat) * MY / CELL)
def ll2m(lon, lat): return ((lon - LON0) * MX, (lat - LAT0) * MY)

# ---------- elevation: mosaic the terrarium tiles, then sample at every cell centre ----------
Z, x0, x1, y0, y1 = map(int, open('tiles/range.txt').read().split())
mos = np.zeros(((y1 - y0 + 1) * 256, (x1 - x0 + 1) * 256), dtype=np.float32)
for x in range(x0, x1 + 1):
    for y in range(y0, y1 + 1):
        a = np.asarray(Image.open(f'tiles/{Z}_{x}_{y}.png').convert('RGB'), dtype=np.float32)
        mos[(y - y0) * 256:(y - y0 + 1) * 256, (x - x0) * 256:(x - x0 + 1) * 256] = a[..., 0] * 256 + a[..., 1] + a[..., 2] / 256 - 32768
jj, ii = np.mgrid[0:NY, 0:NX]
lon = Wl + (ii + 0.5) * CELL / MX; lat = N - (jj + 0.5) * CELL / MY
tx = (lon + 180) / 360 * 2 ** Z * 256 - x0 * 256
r = np.radians(lat); ty = (1 - np.log(np.tan(r) + 1 / np.cos(r)) / np.pi) / 2 * 2 ** Z * 256 - y0 * 256
tx0 = np.clip(np.floor(tx).astype(int), 0, mos.shape[1] - 2); ty0 = np.clip(np.floor(ty).astype(int), 0, mos.shape[0] - 2)
fx = tx - tx0; fy = ty - ty0
elev = (mos[ty0, tx0] * (1 - fx) * (1 - fy) + mos[ty0, tx0 + 1] * fx * (1 - fy) + mos[ty0 + 1, tx0] * (1 - fx) * fy + mos[ty0 + 1, tx0 + 1] * fx * fy)
print('elevation m', float(elev.min()), float(elev.max()))

# ---------- rasterise polygons ----------
def poly_mask(rings_list):   # rings_list: list of polygons, each [outer, hole, hole...] in lon/lat
    im = Image.new('L', (NX, NY), 0); d = ImageDraw.Draw(im)
    for rings in rings_list:
        d.polygon([ll2px(*p) for p in rings[0]], fill=1)
        for h in rings[1:]: d.polygon([ll2px(*p) for p in h], fill=0)
    return np.asarray(im, dtype=bool)
def geo_rings(g):
    if g['type'] == 'Polygon': return [g['coordinates']]
    if g['type'] == 'MultiPolygon': return list(g['coordinates'])
    return []
up = json.load(open('Upper_Hot_Brook_Lake.json'))[0]['geojson']
lo = json.load(open('Lower_Hot_Brook_Lake.json'))[0]['geojson']
upper, lower = poly_mask(geo_rings(up)), poly_mask(geo_rings(lo))
lakes = upper | lower
print('lake cells', upper.sum(), lower.sum(), 'ha', round(upper.sum() * CELL * CELL / 1e4), round(lower.sum() * CELL * CELL / 1e4))

# ---------- land cover: NLCD (colour → class), NWI on top for wetlands ----------
NLCD = {(71, 107, 160): 'water', (221, 201, 201): 'dev_open', (216, 147, 130): 'dev_low', (237, 0, 0): 'dev_med', (170, 0, 0): 'dev_high',
        (178, 173, 163): 'barren', (104, 170, 99): 'deciduous', (28, 99, 48): 'evergreen', (181, 201, 142): 'mixed', (204, 186, 124): 'shrub',
        (226, 226, 193): 'grass', (219, 216, 61): 'pasture', (171, 108, 40): 'crops', (186, 216, 234): 'woody_wet', (112, 163, 186): 'emergent_wet'}
CLASSES = ['water', 'evergreen', 'mixed', 'deciduous', 'woody_wet', 'shrub_wet', 'emergent_wet', 'shrub', 'grass', 'pasture', 'crops', 'dev_open', 'dev_low', 'dev_med', 'dev_high', 'barren', 'beach', 'rock_shore', 'stream']
CI = {c: k for k, c in enumerate(CLASSES)}
nl = np.asarray(Image.open('nlcd.png').convert('RGB'), dtype=np.int32)
pal = np.array(list(NLCD.keys())); names = list(NLCD.values())
nh, nw = nl.shape[:2]
pi_ = np.clip(((lon - Wl) / (E - Wl) * nw).astype(int), 0, nw - 1); pj = np.clip(((N - lat) / (N - S) * nh).astype(int), 0, nh - 1)
px = nl[pj, pi_]
dist = ((px[..., None, :] - pal[None, None, :, :]) ** 2).sum(-1)
cover = np.array([CI.get(names[k], CI['mixed']) for k in range(len(names))], dtype=np.uint8)[dist.argmin(-1)]
nwi = json.load(open('nwi.geojson'))['features']
NWI_CLASS = {'Freshwater Forested/Shrub Wetland': None, 'Freshwater Emergent Wetland': 'emergent_wet', 'Freshwater Pond': 'water', 'Riverine': 'stream', 'Lake': 'water'}
for f in nwi:
    t = f['properties'].get('WETLAND_TYPE'); attr = f['properties'].get('ATTRIBUTE') or ''
    if t not in NWI_CLASS: continue
    k = NWI_CLASS[t]
    if k is None: k = 'shrub_wet' if attr.startswith('PSS') else 'woody_wet'   # PSS shrub swamp (alder/sweetgale/leatherleaf) vs PFO forested (cedar/spruce/maple swamp)
    m = poly_mask(geo_rings(f['geometry']))
    if k == 'water': cover[m & ~lakes] = CI['water']
    elif k == 'stream': cover[m & ~lakes] = CI['stream']
    else: cover[m & ~lakes] = CI[k]
cover[lakes] = CI['water']
cover[(cover == CI['water']) & ~lakes] = CI['water']

# ---------- distance to shore (two-pass chamfer, metres) and approximate bathymetry ----------
def dist_transform(mask):   # distance (m) from each True cell to the nearest False cell
    INF = 1e9; d = np.where(mask, INF, 0.0)
    a, b = CELL, CELL * math.sqrt(2)
    H, Wd = d.shape
    for j in range(H):
        row = d[j]
        if j > 0:
            up_ = d[j - 1]; row[:] = np.minimum(row, up_ + a)
            row[1:] = np.minimum(row[1:], up_[:-1] + b); row[:-1] = np.minimum(row[:-1], up_[1:] + b)
        for i in range(1, Wd): row[i] = min(row[i], row[i - 1] + a)
    for j in range(H - 1, -1, -1):
        row = d[j]
        if j < H - 1:
            dn = d[j + 1]; row[:] = np.minimum(row, dn + a)
            row[1:] = np.minimum(row[1:], dn[:-1] + b); row[:-1] = np.minimum(row[:-1], dn[1:] + b)
        for i in range(Wd - 2, -1, -1): row[i] = min(row[i], row[i + 1] + a)
    return d
def bathy(mask, dmax, dmean):
    dd = dist_transform(mask); dm = dd[mask].max()
    def depth(lam): return dmax * (1 - np.exp(-dd / lam)) / (1 - math.exp(-dm / lam))
    lo_, hi_ = 1.0, 5000.0
    for _ in range(60):   # bisection on λ so the mean depth matches
        lam = math.sqrt(lo_ * hi_); m = depth(lam)[mask].mean()
        if m > dmean: lo_ = lam
        else: hi_ = lam
    z = np.where(mask, depth(lam), 0.0)
    print('  bathy λ', round(lam), 'm  mean', round(float(z[mask].mean()), 2), 'max', round(float(z[mask].max()), 2), 'farthest from shore', round(float(dm)), 'm')
    return z, dd
print('Upper:'); zu, du = bathy(upper, 5.5, 3.35)
print('Lower:'); zl, dl = bathy(lower, 4.0, 2.74)
depth = zu + zl
# lake surface elevations from the DEM (flat water) — the median over cells well inside each lake
surf_u = float(np.median(elev[upper & (du > 60)])); surf_l = float(np.median(elev[lower & (dl > 60)]))
print('water surface m', round(surf_u, 2), round(surf_l, 2))
ground = elev.copy()
ground[upper] = surf_u; ground[lower] = surf_l   # (the DEM's flat lake surface; depth is drawn below it)
# a gently sloped shore: blend land elevation down toward the water within ~30 m so the DEM's lake-edge noise reads as a bank
landd = dist_transform(~lakes)
# shore type: MDIFW — both lakes mostly rocky; Upper has a large sandy beach on the NE; wetland shores where NWI wetlands touch
shore = (~lakes) & (landd <= CELL * 1.5)
cover[shore & np.isin(cover, [CI['evergreen'], CI['mixed'], CI['deciduous'], CI['shrub'], CI['grass'], CI['pasture'], CI['barren']])] = CI['rock_shore']
# the large sandy beach of Upper Hot Brook Lake's NE shore (MDIFW): the shore cells in the lake's north-east quarter
uy, ux = np.nonzero(upper); ucx, ucy = ux.mean(), uy.mean()
ne = shore & (ii > ucx) & (jj < ucy - (uy.max() - uy.min()) * 0.25)
nearU = dist_transform(~upper) <= CELL * 1.5
beach = ne & nearU
# keep it a single stretch ~300 m: the NE shore cells nearest the lake's NE extreme
bj, bi = np.nonzero(beach)
if len(bi):
    score = bi - bj   # north-east-most
    keep = np.argsort(-score)[:max(1, int(300 / CELL))]
    cover[bj[keep], bi[keep]] = CI['beach']

# ---------- brooks (OSM lines), split at the lakes ----------
hb = {e['osm_id']: e['geojson']['coordinates'] for e in json.load(open('Hot_Brook__Maine.json')) if e['osm_id'] in (1041445614, 1041445613, 98262031)}
def inside(lon_, lat_, m):
    i_, j_ = ll2px(lon_, lat_); i_, j_ = int(i_), int(j_)
    return 0 <= i_ < NX and 0 <= j_ < NY and m[j_, i_]
streams = []
for oid, name in [(98262031, 'Hot Brook (inflow)'), (1041445614, 'Hot Brook (connecting)'), (1041445613, 'Hot Brook (outlet)')]:
    seg = []
    for p in hb[oid]:
        if inside(p[0], p[1], lakes):
            if len(seg) > 1: streams.append({'name': name, 'pts': [ll2m(*q) for q in seg]})
            seg = []
        else: seg.append(p)
    if len(seg) > 1: streams.append({'name': name, 'pts': [ll2m(*q) for q in seg]})
for s_ in streams:
    L = sum(math.dist(s_['pts'][k], s_['pts'][k + 1]) for k in range(len(s_['pts']) - 1)); s_['len'] = round(L)
    print('stream', s_['name'], 'pieces len m', s_['len'])
# the sim's slice path: the river centreline from Upper's south shore, through both lakes and the connecting brook, to Lower's outlet
cl = hb[98262031] + hb[1041445614]
first = next(k for k, p in enumerate(cl) if inside(p[0], p[1], upper))
last = max(k for k, p in enumerate(cl) if inside(p[0], p[1], lower))
path = [ll2m(*p) for p in cl[max(0, first - 1): last + 2]]
# its real cross-section: sample depth / ground every 15 m along the path
prof = []; acc = 0.0
def sample(arr, x, y):
    i_ = int((x + W_M / 2) / CELL); j_ = int((H_M / 2 - y) / CELL)
    return float(arr[min(max(j_, 0), NY - 1), min(max(i_, 0), NX - 1)])
for k in range(len(path) - 1):
    (ax, ay), (bx, by) = path[k], path[k + 1]; seg = math.dist(path[k], path[k + 1]); n = max(1, int(seg / 15))
    for t in range(n):
        x = ax + (bx - ax) * t / n; y = ay + (by - ay) * t / n
        prof.append([round(acc + seg * t / n), round(sample(depth, x, y), 2), round(sample(ground, x, y) - (surf_u if sample(upper, x, y) else surf_l), 2), int(sample(cover, x, y))])
    acc += seg
print('slice path length m', round(acc))

# ---------- labels ----------
def centroid(m): j_, i_ = np.nonzero(m); return ((i_.mean() + 0.5) * CELL - W_M / 2, H_M / 2 - (j_.mean() + 0.5) * CELL)
deep_u = np.unravel_index(np.argmax(zu), zu.shape); deep_l = np.unravel_index(np.argmax(zl), zl.shape)
cxy = lambda jj_, ii_: ((ii_ + 0.5) * CELL - W_M / 2, H_M / 2 - (jj_ + 0.5) * CELL)
labels = [
    {'t': 'Upper Hot Brook Lake', 's': '360 ha · mean 3.4 m · max 5.5 m (18 ft)', 'xy': centroid(upper), 'z': surf_u},
    {'t': 'Lower Hot Brook Lake', 's': '277 ha · mean 2.7 m · max 4.0 m (13 ft)', 'xy': centroid(lower), 'z': surf_l},
    {'t': 'deepest ~5.5 m', 's': '', 'xy': cxy(*deep_u), 'z': surf_u},
    {'t': 'deepest ~4.0 m', 's': '', 'xy': cxy(*deep_l), 'z': surf_l},
]
for s_ in streams:
    p = s_['pts'][len(s_['pts']) // 2]; labels.append({'t': s_['name'], 's': f"{s_['len']} m", 'xy': p, 'z': sample(ground, *p)})
if len(bi): labels.append({'t': 'sandy beach', 's': '', 'xy': cxy(int(bj[keep].mean()), int(bi[keep].mean())), 'z': surf_u})

# ---------- write ----------
def b64(a): return base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()
e0 = float(ground.min())
model = {
    'meta': {'name': 'Hot Brook lakes, T8 R4 NBPP / Danforth, Maine', 'cell': CELL, 'nx': NX, 'ny': NY, 'w': W_M, 'h': H_M, 'lat0': LAT0, 'lon0': LON0,
             'bbox': [Wl, S, E, N], 'surf': {'upper': surf_u, 'lower': surf_l}, 'e0': e0,
             'sources': ['Lake outlines, brooks: © OpenStreetMap contributors (ODbL)', 'Elevation: USGS 3DEP via AWS Terrain Tiles (z14)',
                         'Wetlands: USFWS National Wetlands Inventory', 'Land cover: NLCD 2021 (MRLC)', 'Lake areas and depths: MDIFW lake surveys; Lakes of Maine (MIDAS 1076, 1072)',
                         'Shore: MDIFW survey notes (mostly rocky; a large sandy beach on Upper\'s NE shore)']},
    'classes': CLASSES,
    'elev_dm': b64(np.round((ground - e0) * 10).astype(np.uint16)),     # ground/water-surface elevation above e0, decimetres
    'depth_cm': b64(np.round(depth * 100).astype(np.uint16)),           # lake depth below the surface, cm (approximated bathymetry)
    'cover': b64(cover.astype(np.uint8)),
    'lake': b64((upper * 1 + lower * 2).astype(np.uint8)),
    'streams': [{'name': s_['name'], 'len': s_['len'], 'pts': [[round(x, 1), round(y, 1)] for x, y in s_['pts']]} for s_ in streams],
    'path': [[round(x, 1), round(y, 1)] for x, y in path], 'profile': prof, 'labels': [{**l, 'xy': [round(l['xy'][0], 1), round(l['xy'][1], 1)]} for l in labels],
}
json.dump(model, open('hotbrook_model.json', 'w'), separators=(',', ':'))
print('wrote hotbrook_model.json', round(os.path.getsize('hotbrook_model.json') / 1e6, 2), 'MB')
from collections import Counter
cc = Counter(cover.ravel().tolist()); print({CLASSES[k]: round(v * CELL * CELL / 1e4) for k, v in sorted(cc.items(), key=lambda t: -t[1])})

# the simulation's current cross-section (src/config.js bedY), for the viewer's comparison strip
import subprocess
js = ("const C = await import(process.argv[1]); const { WORLD, bedY, LANDSCAPE } = C, P = WORLD.PX_PER_M; const prof = [];"
      "for (let x = 0; x <= WORLD.W; x += 16) prof.push([+(x / P).toFixed(2), +(bedY(Math.min(x, WORLD.W - 1)) / P).toFixed(2)]);"
      "console.log(JSON.stringify({ profile: prof, lakeW: LANDSCAPE.LAKE_W / P, streamW: LANDSCAPE.STREAM_W / P, pondW: LANDSCAPE.POND_W / P, widthM: WORLD.W / P }));")
cfg = 'file:///' + os.path.abspath(os.path.join(HERE, '..', '..', 'src', 'config.js')).replace(os.sep, '/')
out = subprocess.run(['node', '--input-type=module', '-e', js, cfg], capture_output=True, text=True)
if out.returncode == 0:
    model['sim'] = json.loads(out.stdout); json.dump(model, open('hotbrook_model.json', 'w'), separators=(',', ':')); print('added the sim cross-section')
else: print('node failed (sim cross-section left out):', out.stderr[:300])
