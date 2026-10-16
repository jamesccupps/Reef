# The 3-D sim's world: both Hot Brook lakes and the connecting brook, from the landscape model (data/hotbrook_model.json),
# at the scale the human chose (2026-10-15): every horizontal length × 1/10 (Upper ~196 × 344 m), depths TRUE; the brook
# at × 1/2 (~77 m) so its pools stay pool-sized — Lower moves out along the brook's line to make room. A band of the real
# shore and land rings each lake (elevation, land cover) for the banks, the shore and the renderer.
#   python tools/hotbrook/build_world3d.py   → src/w3/hotbrook3d.js (+ sim/world3d.png, a depth map to check by eye)
# World coordinates: x east, y north, metres, origin at the brook's upper mouth (Upper's outlet); depth z below the local
# water surface, metres, positive down.
import json, base64, os, math
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
m = json.load(open(os.path.join(HERE, 'data', 'hotbrook_model.json')))
M = m['meta']; NXR, NYR, CR = M['nx'], M['ny'], M['cell']
dec = lambda s, t: np.frombuffer(base64.b64decode(s), dtype=t).reshape(NYR, NXR)
lake = dec(m['lake'], np.uint8); depth = dec(m['depth_cm'], np.uint16).astype(np.float64) / 100
elev = dec(m['elev_dm'], np.uint16).astype(np.float64) / 10 + M['e0']; cover = dec(m['cover'], np.uint8)
CLASSES = m['classes']; STREAM_C = CLASSES.index('stream')
SURF = {1: M['surf']['upper'], 2: M['surf']['lower']}

SCALE, BROOK_SCALE = 0.1, 0.5      # lakes, brook (horizontal)
CELL = CR * SCALE                   # 1.5 m: one model cell per world cell
MARGIN = 30.0                       # m of land kept around each lake (world)
BROOK_W = 4.0                       # m channel width (world: a ~8-m brook at half scale)
rx = lambda i: (i + 0.5) * CR - M['w'] / 2          # model cell centre → real metres (x east)
ry = lambda j: M['h'] / 2 - (j + 0.5) * CR          # (y north; row 0 is the north edge)

brook = next(s for s in m['streams'] if 'connecting' in s['name'])
P = np.array(brook['pts'], dtype=np.float64); P0 = P[0]
inflow = next(s for s in m['streams'] if 'inflow' in s['name']); outlet = next(s for s in m['streams'] if 'outlet' in s['name'])
T = (P[-1] - P0) * (BROOK_SCALE - SCALE)            # Lower's shift: the brook's end lands on Lower's inlet at half scale
def to_world(xr, yr, lid): return ((xr - P0[0]) * SCALE + (T[0] if lid == 2 else 0), (yr - P0[1]) * SCALE + (T[1] if lid == 2 else 0))

# the crop rectangle (model cells) of each lake ± the margin, and the world bounds that hold both
crops = {}
for lid in (1, 2):
    jj, ii = np.nonzero(lake == lid); mc = int(math.ceil(MARGIN / CELL))
    crops[lid] = (max(0, ii.min() - mc), min(NXR - 1, ii.max() + mc), max(0, jj.min() - mc), min(NYR - 1, jj.max() + mc))
xs, ys = [], []
for lid, (i0, i1, j0, j1) in crops.items():
    for i, j in ((i0, j0), (i1, j1)):
        x, y = to_world(rx(i), ry(j), lid); xs.append(x); ys.append(y)
X0 = math.floor(min(xs) / CELL) * CELL - CELL; Y0 = math.floor(min(ys) / CELL) * CELL - CELL
NX = int(math.ceil((max(xs) - X0) / CELL)) + 2; NY = int(math.ceil((max(ys) - Y0) / CELL)) + 2
# world grid: row 0 is the SOUTH edge (y increases with the row), column 0 the west edge
W_body = np.zeros((NY, NX), np.uint8); W_depth = np.zeros((NY, NX)); W_elev = np.zeros((NY, NX)); W_cover = np.zeros((NY, NX), np.uint8)
# every world cell looks up the real model twice — under Upper's placement and under Lower's (shifted) one. Water comes from
# its own lake's placement only; land comes from the placement of the NEARER lake, blended across the seam between them, so
# each lake keeps its own real shore and the land runs on without crop edges
cc_, rr_ = np.meshgrid(np.arange(NX), np.arange(NY)); wx = X0 + (cc_ + 0.5) * CELL; wy = Y0 + (rr_ + 0.5) * CELL
def model_ij(lid):
    xr = (wx - (T[0] if lid == 2 else 0)) / SCALE + P0[0]; yr = (wy - (T[1] if lid == 2 else 0)) / SCALE + P0[1]
    i = np.clip(np.round((xr + M['w'] / 2) / CR - 0.5).astype(int), 0, NXR - 1); j = np.clip(np.round((M['h'] / 2 - yr) / CR - 0.5).astype(int), 0, NYR - 1)
    return i, j
iU, jU = model_ij(1); iL, jL = model_ij(2)
wetU = lake[jU, iU] == 1; wetL = (lake[jL, iL] == 2) & ~wetU
W_body[wetU] = 1; W_body[wetL] = 2
W_depth[wetU] = depth[jU, iU][wetU]; W_depth[wetL] = depth[jL, iL][wetL]
def dist_to(mask):   # Euclidean-ish distance (m) to the nearest True cell (two-pass chamfer)
    INF = 1e9; d = np.where(mask, 0.0, INF); s2 = CELL * 1.4142
    for r in range(NY):
        if r: d[r] = np.minimum(d[r], d[r - 1] + CELL); d[r, 1:] = np.minimum(d[r, 1:], d[r - 1, :-1] + s2); d[r, :-1] = np.minimum(d[r, :-1], d[r - 1, 1:] + s2)
        for c in range(1, NX): d[r, c] = min(d[r, c], d[r, c - 1] + CELL)
    for r in range(NY - 1, -1, -1):
        if r < NY - 1: d[r] = np.minimum(d[r], d[r + 1] + CELL); d[r, 1:] = np.minimum(d[r, 1:], d[r + 1, :-1] + s2); d[r, :-1] = np.minimum(d[r, :-1], d[r + 1, 1:] + s2)
        for c in range(NX - 2, -1, -1): d[r, c] = min(d[r, c], d[r, c + 1] + CELL)
    return d
dU, dL = dist_to(W_body == 1), dist_to(W_body == 2)
def land_elev(i, j, lid):   # the real ground; where a placement lands on the OTHER lake's (moved) water, a low flat by it
    e = elev[j, i].copy(); other = lake[j, i] == (2 if lid == 1 else 1); e[other] = SURF[2 if lid == 1 else 1] + 0.4; return e
eU, eL = land_elev(iU, jU, 1), land_elev(iL, jL, 2)
BLEND = 15.0                                   # m: the width of the seam where the two placements' land is blended
wL = np.clip(0.5 + (dU - dL) / (2 * BLEND), 0, 1)      # 0 → Upper's land, 1 → Lower's
land = W_body == 0
W_elev[land] = (eU * (1 - wL) + eL * wL)[land]
W_cover[land] = np.where(wL >= 0.5, cover[jL, iL], cover[jU, iU])[land]
W_elev[W_body == 1] = SURF[1]; W_elev[W_body == 2] = SURF[2]
W_cover[W_body > 0] = cover[jU, iU][W_body > 0]
W_cover[W_body == 2] = cover[jL, iL][W_body == 2]

# the brook: the real path at half scale from Upper's outlet; its profile from the angler's description (slice_profile.py):
# the outlet lip → the deeper pool at the upper mouth (3–4 ft) → riffle → a shallower run (sunfish) → riffle → Lower's lip
BROOK = [(0.0, 0.45), (1.0, 0.7), (2.0, 1.05), (4.0, 1.15), (5.0, 0.9), (6.0, 0.4), (7.0, 0.32), (8.0, 0.5), (10.0, 0.62),
         (11.0, 0.5), (12.0, 0.33), (13.0, 0.36), (14.0, 0.5)]
BP = (P - P0) * BROOK_SCALE                                            # world polyline
seg = np.hypot(*np.diff(BP, axis=0).T); cum = np.concatenate([[0], np.cumsum(seg)]); BL = cum[-1]
def brook_at(x, y):
    """(distance from the path, fraction along it) for a world point"""
    best = (1e9, 0.0)
    for k in range(len(BP) - 1):
        a, b = BP[k], BP[k + 1]; ab = b - a; t = np.clip(np.dot([x - a[0], y - a[1]], ab) / np.dot(ab, ab), 0, 1)
        d = math.hypot(x - a[0] - t * ab[0], y - a[1] - t * ab[1])
        if d < best[0]: best = (d, (cum[k] + t * seg[k]) / BL)
    return best
bdepth = lambda u: float(np.interp(u * 14.0, [p[0] for p in BROOK], [p[1] for p in BROOK]))
for r in range(NY):
    for c in range(NX):
        x, y = X0 + (c + 0.5) * CELL, Y0 + (r + 0.5) * CELL
        d, u = brook_at(x, y)
        if d > BROOK_W / 2 + CELL: continue
        if W_body[r, c] in (1, 2): continue                            # the lakes keep their own water at the mouths
        if d <= BROOK_W / 2:
            prof = bdepth(u) * (1 - (d / (BROOK_W / 2)) ** 2 * 0.6)     # a rounded channel: shallower at the edges
            W_body[r, c] = 3; W_depth[r, c] = max(0.15, prof); W_cover[r, c] = STREAM_C
            W_elev[r, c] = SURF[1] + (SURF[2] - SURF[1]) * u           # the water surface falls 0.6 m along the brook
        else:
            W_elev[r, c] = max(W_elev[r, c], SURF[1] + (SURF[2] - SURF[1]) * u + 0.3)   # its banks stand above the water

# a lake's water must reach the brook: open a short channel through any land between a mouth and the brook's ends
for lid, u in ((1, 0.0), (2, 1.0)):
    bx, by = np.interp(u * BL, cum, BP[:, 0]), np.interp(u * BL, cum, BP[:, 1])
    rr, cc = np.nonzero(W_body == lid); wx = X0 + (cc + 0.5) * CELL; wy = Y0 + (rr + 0.5) * CELL
    k = int(np.argmin(np.hypot(wx - bx, wy - by))); tx, ty = wx[k], wy[k]; L_ = math.hypot(tx - bx, ty - by)
    for s in np.linspace(0, 1, max(2, int(L_ / (CELL * 0.5)) + 1)):
        x, y = bx + (tx - bx) * s, by + (ty - by) * s
        for dx in np.arange(-BROOK_W / 2, BROOK_W / 2 + 1e-9, CELL * 0.5):
            for dy in np.arange(-BROOK_W / 2, BROOK_W / 2 + 1e-9, CELL * 0.5):
                if dx * dx + dy * dy > (BROOK_W / 2) ** 2: continue
                c = int((x + dx - X0) / CELL); r = int((y + dy - Y0) / CELL)
                if 0 <= r < NY and 0 <= c < NX and W_body[r, c] == 0:
                    W_body[r, c] = 3; W_depth[r, c] = bdepth(u); W_cover[r, c] = STREAM_C; W_elev[r, c] = SURF[lid]
    print(f'mouth of lake {lid}: brook end {L_:.1f} m from its nearest water cell')

# distance to the nearest shore (m) for every water cell: littoral/shore behaviour and the renderer's shoreline
def dist_to_land(body):
    INF = 1e9; d = np.where(body > 0, INF, 0.0)
    for _ in range(2):
        for r in range(NY):
            for c in range(NX):
                if d[r, c] == 0: continue
                if r: d[r, c] = min(d[r, c], d[r - 1, c] + CELL)
                if c: d[r, c] = min(d[r, c], d[r, c - 1] + CELL)
                if r and c: d[r, c] = min(d[r, c], d[r - 1, c - 1] + CELL * 1.4142)
                if r and c < NX - 1: d[r, c] = min(d[r, c], d[r - 1, c + 1] + CELL * 1.4142)
        for r in range(NY - 1, -1, -1):
            for c in range(NX - 1, -1, -1):
                if d[r, c] == 0: continue
                if r < NY - 1: d[r, c] = min(d[r, c], d[r + 1, c] + CELL)
                if c < NX - 1: d[r, c] = min(d[r, c], d[r, c + 1] + CELL)
                if r < NY - 1 and c < NX - 1: d[r, c] = min(d[r, c], d[r + 1, c + 1] + CELL * 1.4142)
                if r < NY - 1 and c: d[r, c] = min(d[r, c], d[r + 1, c - 1] + CELL * 1.4142)
    return d
SHORE = np.where(W_body > 0, dist_to(W_body == 0), 0.0)

# the stream ends (inflow into Upper's south end, outlet from Lower's north end) and the angler's sunfish spots
def stream_end(s, lid, last):
    p = np.array(s['pts'][-1 if last else 0]); return [round(v, 2) for v in to_world(p[0], p[1], lid)]
inflow_xy = stream_end(inflow, 1, True); outlet_xy = stream_end(outlet, 2, False)
def note_xy(n):
    x, y = n['xy']
    if 'brook' in n['t'].lower():     # on the brook: its fraction along the real path, placed on the half-scale path
        d, u = min(((math.hypot(x - P[k][0], y - P[k][1]), k) for k in range(len(P))))[0], 0
        kk = int(np.argmin(np.hypot(P[:, 0] - x, P[:, 1] - y))); u = np.concatenate([[0], np.cumsum(np.hypot(*np.diff(P, axis=0).T))])[kk] / brook['len']
        u = 0.22 if 'upper mouth' in n['t'].lower() or 'pool' in n['t'].lower() else max(u, 0.5)
        return [round(float(np.interp(u * BL, cum, BP[:, 0])), 2), round(float(np.interp(u * BL, cum, BP[:, 1])), 2)]
    return [round(v, 2) for v in to_world(x, y, 1 if y < 40 else 2)]
notes = [{'t': n['t'], 's': n['s'], 'xy': note_xy(n)} for n in m['notes']]

# stats (world): areas, depths, the share of shallow water — against the real lakes (× 1/100 area)
st = {}
for lid, nm in ((1, 'upper'), (2, 'lower'), (3, 'brook')):
    msk = W_body == lid; d = W_depth[msk]
    st[nm] = {'area_m2': round(float(msk.sum() * CELL * CELL)), 'mean': round(float(d.mean()), 2), 'max': round(float(d.max()), 2),
              'le3': round(float((d <= 3).mean()), 3), 'cells': int(msk.sum())}
print(json.dumps({'grid': [NX, NY], 'cell': CELL, 'origin': [X0, Y0], 'lower_shift': [round(T[0], 2), round(T[1], 2)],
                  'brook_len_m': round(BL, 1), **st, 'inflow': inflow_xy, 'outlet': outlet_xy, 'notes': [n['xy'] for n in notes]}, indent=1))

# ---------- the data module (pure data, imported by src/w3/geometry.js) ----------
b64 = lambda a: base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()
e0 = float(np.floor(W_elev.min()))
js = f"""// hotbrook3d.js — GENERATED by tools/hotbrook/build_world3d.py from the Hot Brook landscape model; do not edit by hand.
// Both lakes at 1/10 of their real horizontal size, TRUE depths (the 1949 MDIFW soundings fitted to today's shore), the
// connecting brook at 1/2 (~{BL:.0f} m) with the angler's pool at its upper mouth; a {MARGIN:.0f}-m band of real shore and land around
// each lake. Grid: {NX} × {NY} cells of {CELL} m, row 0 at the SOUTH edge, column 0 at the west; x east, y north (m), origin at
// the brook's upper mouth. body: 0 land, 1 Upper Hot Brook Lake, 2 Lower Hot Brook Lake, 3 the brook. depth_cm: below the
// local water surface. elev_cm: the ground (land) or the water surface (water), above E0 (m).
export const HB3 = {{
  SCALE: {SCALE}, BROOK_SCALE: {BROOK_SCALE}, CELL: {CELL}, NX: {NX}, NY: {NY}, X0: {X0}, Y0: {Y0}, E0: {e0},
  SURF: {{ upper: {SURF[1]:.3f}, lower: {SURF[2]:.3f} }},
  CLASSES: {json.dumps(CLASSES)},
  BROOK: {{ len: {BL:.2f}, width: {BROOK_W}, path: {json.dumps([[round(float(a), 2), round(float(b), 2)] for a, b in BP])} }},
  INFLOW: {json.dumps(inflow_xy)}, OUTLET: {json.dumps(outlet_xy)},
  NOTES: {json.dumps(notes, ensure_ascii=False)},
  STATS: {json.dumps(st)},
  body: '{b64(W_body.astype(np.uint8))}',
  depth_cm: '{b64(np.round(W_depth * 100).astype(np.uint16))}',
  elev_cm: '{b64(np.round((W_elev - e0) * 100).astype(np.uint16))}',
  cover: '{b64(W_cover.astype(np.uint8))}',
}};
"""
os.makedirs(os.path.join(HERE, '..', '..', 'src', 'w3'), exist_ok=True)
out = os.path.join(HERE, '..', '..', 'src', 'w3', 'hotbrook3d.js')
open(out, 'w', encoding='utf-8', newline='\n').write(js); print('wrote src/w3/hotbrook3d.js', round(os.path.getsize(out) / 1e3), 'kB')

try:   # a depth map to check by eye
    from PIL import Image
    img = np.zeros((NY, NX, 3), np.uint8)
    land = W_body == 0; img[land] = np.stack([np.clip(60 + (W_elev[land] - e0) * 4, 0, 255)] * 3, -1).astype(np.uint8) * np.array([0.55, 0.62, 0.45])
    wat = ~land; dn = np.clip(W_depth[wat] / 5.6, 0, 1)
    img[wat] = np.stack([(170 - 150 * dn), (215 - 150 * dn), (235 - 120 * dn)], -1).astype(np.uint8)
    img[W_body == 3] = [230, 120, 40]
    for n in notes:
        c = int((n['xy'][0] - X0) / CELL); r = int((n['xy'][1] - Y0) / CELL)
        img[max(0, r - 2):r + 3, max(0, c - 2):c + 3] = [255, 40, 40]
    Image.fromarray(img[::-1]).resize((NX * 3, NY * 3), Image.NEAREST).save(os.path.join(HERE, 'sim', 'world3d.png')); print('wrote sim/world3d.png')
except ImportError:
    pass
