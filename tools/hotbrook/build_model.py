#   python tools/hotbrook/build_model.py   (after fetch_data.py; writes data/hotbrook_model.json for viewer.html)
# Build a 3-D-ready model of the real Hot Brook landscape (Upper & Lower Hot Brook Lake, Hot Brook; Danforth/T8 R4, Maine)
# from public data:
#   lake outlines + brooks  — OpenStreetMap (Nominatim polygon_geojson), © OpenStreetMap contributors (ODbL)
#   elevation               — USGS 3DEP lidar (ME Eastern B1/B2 2017, its 1-m bare-earth DEM) when data/lidar_dem_box.tif is
#                             there (fetch_data.py), else the AWS Terrain Tiles (terrarium, z14 ≈ 6.7 m/px here)
#   lake outlines            — the same lidar's hydro-flattened lake surfaces (data/lidar_dem_2m.tif) when there, else OSM
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
# TRUE SCALE T1 (docs/TRUE_SCALE.md): HB_CELL (m) builds the model finer (5 m for the true-scale sim's shore); HB_CROP
# "W,S,E,N" (degrees) covers only that part of the box — the local metres stay those of the WHOLE box (x east, y north from its
# centre), so the soundings and the field notes keep their places; HB_MODEL_OUT / HB_SHALLOWS name the model written and the
# photo shallows read. The defaults build the 15-m whole-box model as before
CELL = float(os.environ.get('HB_CELL', CELL))
gW, gS, gE, gN = (map(float, os.environ['HB_CROP'].split(',')) if os.environ.get('HB_CROP') else (Wl, S, E, N))
MODEL_OUT = os.environ.get('HB_MODEL_OUT', 'hotbrook_model.json'); SHALLOWS_IN = os.environ.get('HB_SHALLOWS', 'shallows.json')
W_M, H_M = (gE - gW) * MX, (gN - gS) * MY
XW, YN = (gW - LON0) * MX, (gN - LAT0) * MY          # the grid's west edge and north edge in the box's local metres
NX, NY = int(W_M / CELL), int(H_M / CELL)
print('grid', NX, NY, 'cells', NX * NY, 'area km', round(W_M / 1000, 2), round(H_M / 1000, 2), 'cell', CELL)
# grid cell (i, j) → j row from the NORTH edge, i column from the WEST edge; local metres x east, y north from the box's centre
def ll2px(lon, lat): return ((lon - gW) * MX / CELL, (gN - lat) * MY / CELL)
def ll2m(lon, lat): return ((lon - LON0) * MX, (lat - LAT0) * MY)

# ---------- elevation: mosaic the terrarium tiles, then sample at every cell centre ----------
Z, x0, x1, y0, y1 = map(int, open('tiles/range.txt').read().split())
mos = np.zeros(((y1 - y0 + 1) * 256, (x1 - x0 + 1) * 256), dtype=np.float32)
for x in range(x0, x1 + 1):
    for y in range(y0, y1 + 1):
        a = np.asarray(Image.open(f'tiles/{Z}_{x}_{y}.png').convert('RGB'), dtype=np.float32)
        mos[(y - y0) * 256:(y - y0 + 1) * 256, (x - x0) * 256:(x - x0 + 1) * 256] = a[..., 0] * 256 + a[..., 1] + a[..., 2] / 256 - 32768
jj, ii = np.mgrid[0:NY, 0:NX]
lon = gW + (ii + 0.5) * CELL / MX; lat = gN - (jj + 0.5) * CELL / MY
tx = (lon + 180) / 360 * 2 ** Z * 256 - x0 * 256
r = np.radians(lat); ty = (1 - np.log(np.tan(r) + 1 / np.cos(r)) / np.pi) / 2 * 2 ** Z * 256 - y0 * 256
tx0 = np.clip(np.floor(tx).astype(int), 0, mos.shape[1] - 2); ty0 = np.clip(np.floor(ty).astype(int), 0, mos.shape[0] - 2)
fx = tx - tx0; fy = ty - ty0
elev = (mos[ty0, tx0] * (1 - fx) * (1 - fy) + mos[ty0, tx0 + 1] * fx * (1 - fy) + mos[ty0 + 1, tx0] * (1 - fx) * fy + mos[ty0 + 1, tx0 + 1] * fx * fy)
print('elevation m', float(elev.min()), float(elev.max()))
# THE LIDAR (2026-10-16; the human: "see if there's any lidar for that area too"): USGS 3DEP, ME Eastern B1/B2 2017 (QL2), its
# 1-m bare-earth DEM via the 3DEP ImageServer over the whole box at ~3.5 × 5 m (fetch_data.py). Each cell takes the area mean
# of the lidar under it (3 × 3 samples). Against the terrain tiles: 0.35 m higher on average, 1.8 m RMS, −3.1…+2.5 m (5–95 %)
def lidar_sample(arr, ext, n=3):   # the area mean of a lon/lat raster over each cell (n × n samples)
    LH, LW = arr.shape; acc = np.zeros((NY, NX)); off = [(k + 0.5) / n - 0.5 for k in range(n)]
    for a in off:
        for b in off:
            px = ((lon + a * CELL / MX - ext['xmin']) / (ext['xmax'] - ext['xmin']) * LW).astype(int).clip(0, LW - 1)
            py = ((ext['ymax'] - (lat + b * CELL / MY)) / (ext['ymax'] - ext['ymin']) * LH).astype(int).clip(0, LH - 1)
            acc += arr[py, px]
    return acc / (n * n)
ELEV_SRC = 'USGS 3DEP via AWS Terrain Tiles (z14)'
if os.path.exists('lidar_dem_box.tif'):
    Image.MAX_IMAGE_PIXELS = None
    elev = lidar_sample(np.asarray(Image.open('lidar_dem_box.tif'), dtype=np.float64), json.load(open('lidar_dem_box.json'))['extent'])
    ELEV_SRC = 'USGS 3DEP lidar, ME Eastern B1/B2 2017 (1-m bare-earth DEM via the 3DEP ImageServer)'
    print('elevation (lidar) m', round(float(elev.min()), 2), round(float(elev.max()), 2))

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
SHORE_SRC = 'OpenStreetMap'
# the lakes' 2017 water from the lidar: lakes are hydro-flattened (one level each — Upper 128.93 m, Lower 128.23 m), so a cell
# is water when half of it lies on its lake's flat level (5 × 5 samples of data/lidar_dem_2m.tif, ~1.4 × 1.8 m). The same cells
# as OSM's outline but for a one-cell fringe (97–98 % in common; OSM's 375 / 279 ha vs the lidar's 369 / 274, MDIFW 360 / 277)
if os.path.exists('lidar_dem_2m.tif'):
    hd = np.asarray(Image.open('lidar_dem_2m.tif'), dtype=np.float64); hx = json.load(open('lidar_dem_2m.json'))['extent']; HH, HW = hd.shape
    pad = np.pad(hd, 1, mode='edge'); win = [pad[i:i + HH, j:j + HW] for i in range(3) for j in range(3)]
    flat = (np.max(win, axis=0) - np.min(win, axis=0)) < 1e-3
    lv, cnt = np.unique(np.round(hd[flat], 2), return_counts=True)
    new = {}
    for v in lv[np.argsort(-cnt)][:4]:   # the biggest flat levels: which OSM lake each one is
        wf = lidar_sample(np.where(flat & (np.abs(hd - v) < 0.02), 1.0, 0.0), hx, 5) >= 0.5
        ov = [int((wf & upper).sum()), int((wf & lower).sum())]
        if max(ov) > 0.5 * wf.sum() and (0 if ov[0] >= ov[1] else 1) not in new: new[0 if ov[0] >= ov[1] else 1] = (wf, float(v))
    if len(new) == 2:
        def main_body(mk):   # (each lake's one connected water — a flat patch at its level off by itself, e.g. up the inflow, is not it)
            from collections import deque
            lab = np.zeros(mk.shape, np.int32); best, bn, k = 0, 0, 0
            for j0, i0 in zip(*np.nonzero(mk)):
                if lab[j0, i0]: continue
                k += 1; q = deque([(j0, i0)]); lab[j0, i0] = k; n = 0
                while q:
                    j, i = q.popleft(); n += 1
                    for dj, di in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        jj_, ii_ = j + dj, i + di
                        if 0 <= jj_ < NY and 0 <= ii_ < NX and mk[jj_, ii_] and not lab[jj_, ii_]: lab[jj_, ii_] = k; q.append((jj_, ii_))
                if n > bn: bn, best = n, k
            return lab == best
        upper, lower = main_body(new[0][0] & ~new[1][0]), main_body(new[1][0])
        SHORE_SRC = f'USGS 3DEP lidar 2017 (hydro-flattened lake surfaces: Upper {new[0][1]:.2f} m, Lower {new[1][1]:.2f} m)'
        print('lake outlines from the lidar:', SHORE_SRC)
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
# MEASURED lake beds where the 1949 MDIFW soundings are available (soundings.py → soundings.json). Depth = a shore taper
# f(d) = 1 − e^(−d/λ) of the distance d from today's shoreline (so the bed meets the water's edge at 0) × a basin depth g
# spread between the soundings by inverse-distance weighting, g = sounding / f(d at the sounding). Exact at every sounding;
# the taper keeps the shallows. (A harmonic/Laplace fill was tried first: point soundings barely pull against a 0 shore in
# 2-D, so it sagged to a 1.9 m mean against the published 3.35 m.)
LAM_SHORE = 50.0   # m: the shore taper (soundings 30–60 m off the beach are already 2–3 m: a fairly steep first slope)
def from_soundings(mask, dshore, pts):
    P = np.array([p for p in pts if 0 <= int((p[0] - XW) / CELL) < NX and 0 <= int((YN - p[1]) / CELL) < NY])
    pi_ = ((P[:, 0] - XW) / CELL).astype(int); pj = ((YN - P[:, 1]) / CELL).astype(int)
    f = lambda d: 1 - np.exp(-np.maximum(d, 0) / LAM_SHORE)
    ds = np.maximum(dshore[pj, pi_], 25.0)                     # (a sounding the map fit put on land or the beach: ≥ 25 m out)
    g = P[:, 2] / f(ds)
    jj_, ii_ = np.nonzero(mask); X = XW + (ii_ + 0.5) * CELL; Y = YN - (jj_ + 0.5) * CELL
    D2 = (X[:, None] - P[None, :, 0]) ** 2 + (Y[:, None] - P[None, :, 1]) ** 2
    w = 1 / (D2 + 15.0 ** 2); k = np.argsort(D2, 1)[:, 10:]; np.put_along_axis(w, k, 0, 1)   # IDW, power 2, 10 nearest
    gz = (w * g[None, :]).sum(1) / w.sum(1)
    z = np.zeros(mask.shape); z[jj_, ii_] = f(dshore[jj_, ii_]) * gz
    print(f'  measured bed: {len(P)} soundings, mean {z[mask].mean():.2f} m, max {z[mask].max():.2f} m, '
          f'area ≤ 1 m {100 * (z[mask] <= 1).mean():.0f} %, ≤ 3 m {100 * (z[mask] <= 3).mean():.0f} %')
    return z
bathy_src = 'approximated (distance from shore, fitted to the published mean and max)'
if os.path.exists('soundings.json'):
    snd = json.load(open('soundings.json'))
    print('Upper (soundings):'); zu = from_soundings(upper, du, snd['upper']['soundings'])
    print('Lower (soundings):'); zl = from_soundings(lower, dl, snd['lower']['soundings'])
    bathy_src = 'measured: interpolated from the 1949 MDIFW soundings (83 Upper, 63 Lower), today\'s shoreline at 0'
depth = zu + zl
# THE SHALLOW FRINGE FROM AERIAL PHOTOS (shallows.py → shallows.json; the human, 2026-10-16: "could you estimate a more accurate
# depth by the shores by looking at aerial photos?"). Tested against the soundings left out one at a time (21 at ≤ 3 m with
# photo depths about them): at 1–3 m the photo's depths carry no skill (r −0.01; the bottom's light is near the noise there and
# the 1949 map fits to ~18 m) while the taper × IDW bed does (r 0.55, RMS 0.71 m) — so the photos are used only for the visible
# band itself, 0 at the waterline to D_EDGE 1.3 m where it darkens (the human's shore: "a foot or two deep … out a bit … chest
# height before it gets deeper, where the water gets darker"), the fringe no sounding reached: the wide flats, the steep shores.
# A cell's photo depth replaces the bed fully at ≤ PH_FULL m, fading to none by PH_NONE; floating-leaved beds cap it at PH_WEED
PH_FULL, PH_NONE, PH_WEED = 1.0, 1.5, 1.8
if os.path.exists(SHALLOWS_IN):
    shl = json.load(open(SHALLOWS_IN)); nph = 0
    # (only the fringe joined to the shore: a lone 'bottom' cell out in open water is waves or glint, not a shoal)
    bot = np.zeros(lakes.shape, bool)
    for lid, j, i, zp, kind, *_ in shl['cells']:
        if kind == 'bottom' and zp is not None and zp < PH_NONE: bot[j, i] = True
    edge =lakes & (np.roll(~lakes, 1, 0) | np.roll(~lakes, -1, 0) | np.roll(~lakes, 1, 1) | np.roll(~lakes, -1, 1))
    joined = bot & edge
    for _ in range(40):   # grow along the 'bottom' cells from the shore's edge
        g = joined | (bot & (np.roll(joined, 1, 0) | np.roll(joined, -1, 0) | np.roll(joined, 1, 1) | np.roll(joined, -1, 1)))
        if (g == joined).all(): break
        joined = g
    for lid, j, i, zp, kind, *_ in shl['cells']:
        if not lakes[j, i]: continue
        if kind == 'bottom' and zp is not None and zp < PH_NONE and joined[j, i]:
            w = min(1.0, max(0.0, (PH_NONE - zp) / (PH_NONE - PH_FULL))); depth[j, i] = w * max(0.15, zp) + (1 - w) * depth[j, i]; nph += 1
        elif kind == 'weeds': depth[j, i] = min(depth[j, i], PH_WEED)
    for nm, mk in (('Upper', upper), ('Lower', lower)):
        print(f'  shallow fringe from the photos ({nph} cells): {nm} mean {depth[mk].mean():.2f} m, area ≤ 1 m {100 * (depth[mk] <= 1).mean():.0f} %, ≤ 3 m {100 * (depth[mk] <= 3).mean():.0f} %')
    bathy_src += '; the 0–1.2 m fringe from aerial photos (USDA NAIP, satellite-derived depth: shallows.py)'
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
    i_ = int((x - XW) / CELL); j_ = int((YN - y) / CELL)
    return float(arr[min(max(j_, 0), NY - 1), min(max(i_, 0), NX - 1)])
for k in range(len(path) - 1):
    (ax, ay), (bx, by) = path[k], path[k + 1]; seg = math.dist(path[k], path[k + 1]); n = max(1, int(seg / 15))
    for t in range(n):
        x = ax + (bx - ax) * t / n; y = ay + (by - ay) * t / n
        prof.append([round(acc + seg * t / n), round(sample(depth, x, y), 2), round(sample(ground, x, y) - (surf_u if sample(upper, x, y) else surf_l), 2), int(sample(cover, x, y))])
    acc += seg
print('slice path length m', round(acc))

# ---------- labels ----------
def centroid(m): j_, i_ = np.nonzero(m); return (XW + (i_.mean() + 0.5) * CELL, YN - (j_.mean() + 0.5) * CELL)
deep_u = np.unravel_index(np.argmax(zu), zu.shape); deep_l = np.unravel_index(np.argmax(zl), zl.shape)
cxy = lambda jj_, ii_: (XW + (ii_ + 0.5) * CELL, YN - (jj_ + 0.5) * CELL)
labels = [
    {'t': 'Upper Hot Brook Lake', 's': '360 ha · mean 3.4 m · max 5.5 m (18 ft)', 'xy': centroid(upper), 'z': surf_u},
    {'t': 'Lower Hot Brook Lake', 's': '277 ha · mean 2.7 m · max 4.0 m (13 ft)', 'xy': centroid(lower), 'z': surf_l},
    {'t': 'deepest ~5.5 m', 's': '', 'xy': cxy(*deep_u), 'z': surf_u},
    {'t': 'deepest ~4.0 m', 's': '', 'xy': cxy(*deep_l), 'z': surf_l},
]
for s_ in streams:
    p = s_['pts'][len(s_['pts']) // 2]; labels.append({'t': s_['name'], 's': f"{s_['len']} m", 'xy': p, 'z': sample(ground, *p)})
if len(bi): labels.append({'t': 'sandy beach', 's': '', 'xy': cxy(int(bj[keep].mean()), int(bi[keep].mean())), 'z': surf_u})

# ---------- field notes (the human's first-hand observations), placed by landmark ----------
def field_notes():
    f = os.path.join(HERE, 'field_notes.json')
    if not os.path.exists(f): return []
    snd = json.load(open('soundings.json')) if os.path.exists('soundings.json') else {}
    out = []
    for n in json.load(open(f, encoding='utf-8')):
        at = n['at']; xy = None
        if 'stream' in at:
            s_ = next((s for s in streams if at['stream'] in s['name']), None)
            if s_:
                pts = s_['pts']; seg = [math.dist(pts[k], pts[k + 1]) for k in range(len(pts) - 1)]; L = sum(seg); goal = L * at['f']; acc = 0
                for k, d in enumerate(seg):
                    if acc + d >= goal: t_ = (goal - acc) / (d or 1); xy = (pts[k][0] + (pts[k + 1][0] - pts[k][0]) * t_, pts[k][1] + (pts[k + 1][1] - pts[k][1]) * t_); break
                    acc += d
        elif 'map' in at and at['map'] in snd and 'affine' in snd[at['map']]:
            M = np.array(snd[at['map']]['affine']); q = np.array([at['px'][0], -at['px'][1], 1.0]) @ M; xy = (float(q[0]), float(q[1]))
        if xy: out.append({'t': n['t'], 's': n['s'], 'xy': [round(xy[0], 1), round(xy[1], 1)], 'z': round(sample(ground, *xy), 2)})
    print('field notes placed', len(out))
    return out

# ---------- write ----------
def b64(a): return base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()
e0 = float(ground.min())
model = {
    'meta': {'name': 'Hot Brook lakes, T8 R4 NBPP / Danforth, Maine', 'cell': CELL, 'nx': NX, 'ny': NY, 'w': W_M, 'h': H_M, 'lat0': LAT0, 'lon0': LON0,
             'xw': XW, 'yn': YN, 'mx': MX, 'my': MY,   # (the grid's west and north edges in the local metres; metres per degree)
             'bbox': [gW, gS, gE, gN], 'surf': {'upper': surf_u, 'lower': surf_l}, 'e0': e0, 'bathy': bathy_src,
             'sources': [f'Lake outlines: {SHORE_SRC}', 'Brooks: © OpenStreetMap contributors (ODbL)', f'Elevation: {ELEV_SRC}',
                         'Wetlands: USFWS National Wetlands Inventory', 'Land cover: NLCD 2021 (MRLC)', 'Lake areas and depths: MDIFW lake surveys; Lakes of Maine (MIDAS 1076, 1072)',
                         'Shore: MDIFW survey notes (mostly rocky; a large sandy beach on Upper\'s NE shore)',
                         'Lake beds: the 1949 MDIFW lake-survey soundings (revised 1965, 2004), digitised and fitted to today\'s shoreline',
                         'Aerial photo: USDA NAIP via the USGS National Map (public domain)']},
    'classes': CLASSES,
    'elev_dm': b64(np.round((ground - e0) * 10).astype(np.uint16)),     # ground/water-surface elevation above e0, decimetres
    'depth_cm': b64(np.round(depth * 100).astype(np.uint16)),           # lake depth below the surface, cm (approximated bathymetry)
    'cover': b64(cover.astype(np.uint8)),
    'lake': b64((upper * 1 + lower * 2).astype(np.uint8)),
    'streams': [{'name': s_['name'], 'len': s_['len'], 'pts': [[round(x, 1), round(y, 1)] for x, y in s_['pts']]} for s_ in streams],
    'path': [[round(x, 1), round(y, 1)] for x, y in path], 'profile': prof, 'labels': [{**l, 'xy': [round(l['xy'][0], 1), round(l['xy'][1], 1)]} for l in labels],
    'soundings': {k: v['soundings'] for k, v in (json.load(open('soundings.json')).items() if os.path.exists('soundings.json') else [])},
    'notes': field_notes(),
}
json.dump(model, open(MODEL_OUT, 'w'), separators=(',', ':'))
print('wrote', MODEL_OUT, round(os.path.getsize(MODEL_OUT) / 1e6, 2), 'MB')
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
    model['sim'] = json.loads(out.stdout); json.dump(model, open(MODEL_OUT, 'w'), separators=(',', ':')); print('added the sim cross-section')
else: print('node failed (sim cross-section left out):', out.stderr[:300])
