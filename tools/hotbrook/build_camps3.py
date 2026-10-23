# The camps, docks, roads and the launch at the Hot Brook lakes, for the 3-D sim and its view: from the verified dataset
# tools/hotbrook/data/camps_roads.json (docs/research_notes/Maine lake shores and catchment/camps_roads_docks_hot_brook.md — nine
# image dates, 2003–05 to the human's Google Earth 2020/2024 frames; the launch and the docks as the human corrected them) into each
# world's coordinates, the way build_world3d.py places the lakes: lon/lat → the landscape model's local metres → the world (x east,
# y north, origin at the brook's upper mouth; the 1/10 world's lakes × 1/10 and Lower moved out along the brook's line).
#   python -I tools/hotbrook/build_camps3.py          → src/w3/camps3d.js (1/10) and src/w3/true/camps3d.js (true size)
# What it keeps:
# - the buildings standing in the latest images (2023 / fall 2024); building lots with nothing built are left out;
# - a DOCK at every camp on the water or with a path to it (the human, 2026-10-23: "most camps on the lake or with a path to the
#   lake have a removable dock, a lot are smaller"): the docks seen in the summer images as seen (length, heading), the rest small
#   (4–8 m) straight out from the camp's own shore. Docks are in the water late May → mid-October (shoreline_development_effects.md §1);
# - the roads (paved Rt 169, the gravel town and camp roads, woods tracks), the launch (the head of Upper's east cove — the human),
#   the beaches.
import json, math, os, base64, hashlib, re
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
D = json.load(open(os.path.join(HERE, 'data', 'camps_roads.json'), encoding='utf-8'))
RECENT = {'2023', '2024fall-GE'}
HOME = ('camp', 'house', 'cabin', 'lodge', 'trailer', 'seasonal')   # (kinds that are lived in: they get docks)
DOCK_REACH = 100.0                                                   # m: a camp this near the water has a path to it and a dock

def h01(s, k=0):   # a stable hash in [0, 1) (cosmetic choices: an unseen dock's length)
    return int(hashlib.sha1(f'{s}:{k}'.encode()).hexdigest()[:8], 16) / 2 ** 32

# the 5-m model: the shore (each camp's nearest water and the way out into it)
m5 = json.load(open(os.path.join(HERE, 'data', 'hotbrook_model_5m.json')))
M5 = m5['meta']; NX5, NY5, C5 = M5['nx'], M5['ny'], M5['cell']; XW5, YN5 = M5.get('xw', -M5['w'] / 2), M5.get('yn', M5['h'] / 2)
LAKE5 = np.frombuffer(base64.b64decode(m5['lake']), dtype=np.uint8).reshape(NY5, NX5)
ll2m5 = lambda lon, lat: ((lon - M5['lon0']) * M5['mx'], (lat - M5['lat0']) * M5['my'])
m52ll = lambda x, y: (M5['lon0'] + x / M5['mx'], M5['lat0'] + y / M5['my'])
LID = {'upper': 1, 'lower': 2}

# each lake's edge cells (water beside land), for the nearest-shore lookups
EDGE = {}
for _lid in (1, 2):
    w = LAKE5 == _lid; nb = np.zeros_like(w)
    nb[1:, :] |= ~w[:-1, :]; nb[:-1, :] |= ~w[1:, :]; nb[:, 1:] |= ~w[:, :-1]; nb[:, :-1] |= ~w[:, 1:]
    jj, ii = np.nonzero(w & nb); EDGE[_lid] = (ii, jj, XW5 + (ii + 0.5) * C5, YN5 - (jj + 0.5) * C5)

def shore_of(lon, lat, lid):   # the nearest water (edge) cell of lake lid, as the shore point (lon/lat), the unit way out into the water, the distance
    x, y = ll2m5(lon, lat); ii, jj, ex, ey = EDGE[lid]; d2 = (ex - x) ** 2 + (ey - y) ** 2; k = int(np.argmin(d2)); i, j, cx, cy = ii[k], jj[k], ex[k], ey[k]
    # the way out: the mean direction to the lake's cells within 30 m of the shore cell (nearer ones weigh more)
    sx = sy = 0.0
    for dj in range(-6, 7):
        for di in range(-6, 7):
            j2, i2 = j + dj, i + di
            if 0 <= j2 < NY5 and 0 <= i2 < NX5 and LAKE5[j2, i2] == lid and (di or dj): w = 1 / math.hypot(di, dj); sx += di * w; sy += -dj * w
    n = math.hypot(sx, sy) or 1
    lon_s, lat_s = m52ll(cx - sx / n * C5 / 2, cy - sy / n * C5 / 2)   # (half a cell back toward the land from the edge cell's centre)
    return lon_s, lat_s, sx / n, sy / n, math.sqrt(float(d2[k]))

def nearer_lake(lon, lat):
    x, y = ll2m5(lon, lat); return min((1, 2), key=lambda l: float(((EDGE[l][2] - x) ** 2 + (EDGE[l][3] - y) ** 2).min()))

def world(model_file, scale, brook_scale):
    m = json.load(open(os.path.join(HERE, 'data', model_file))); M = m['meta']
    P = np.array(next(s for s in m['streams'] if 'connecting' in s['name'])['pts'], dtype=np.float64); P0 = P[0]
    T = (P[-1] - P0) * (brook_scale - scale)
    def to(lon, lat, lid):
        xr, yr = (lon - M['lon0']) * M['mx'], (lat - M['lat0']) * M['my']
        return [round((xr - P0[0]) * scale + (T[0] if lid == 2 else 0), 2), round((yr - P0[1]) * scale + (T[1] if lid == 2 else 0), 2)]
    return to

def recent(rec):
    ys = set(rec.get('years_seen', [])); return bool(ys & RECENT)

SIZE = (('trailer', (3.5, 11)), ('outbuilding', (4, 5)), ('garage', (6, 7)), ('lodge', (18, 19)), ('house', (9, 12)), ('cabin', (6, 7)))
def wlr(c):   # the footprint as width × length (m) and rotation (deg, from north): the data's fit, else its polygon, else a size in its
    # notes ("~21x20 m"), else the kind's usual size
    f = c.get('footprint_wlr')
    if isinstance(f, dict) and f.get('w'): return f['w'], f['l'], f.get('rot') or 0
    fp = c.get('footprint')
    if isinstance(fp, list) and len(fp) >= 3:
        pts = [ll2m5(*p) for p in fp]; xs, ys = [p[0] for p in pts], [p[1] for p in pts]; return round(max(xs) - min(xs), 1), round(max(ys) - min(ys), 1), 0
    mm = re.search(r'(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*m', c.get('notes') or '')
    if mm: return float(mm.group(1)), float(mm.group(2)), 0
    k = c.get('kind', 'camp'); return next((v for key, v in SIZE if key in k), (7, 9)) + (0,)

def build(to, scale):
    camps, docks = [], []
    for c in D['camps']:
        kind = c.get('kind', 'camp')
        if kind.startswith('lot') or not recent(c): continue
        lid = LID.get(c['lake']) or (1 if c['lake'] == 'brook' else None)
        if lid is None:   # inland: the nearer lake
            lid = nearer_lake(c['lon'], c['lat'])
        lon_s, lat_s, ox, oy, dw = shore_of(c['lon'], c['lat'], lid)
        w, l, rot = wlr(c); home = any(k in kind for k in HOME)
        rec = {'id': c['id'], 'lake': lid, 'kind': kind, 'xy': to(c['lon'], c['lat'], lid), 'w': w, 'l': l, 'rot': rot, 'roof': c.get('roofType') or 'dark',
               'shore': to(lon_s, lat_s, lid), 'out': [round(ox, 3), round(oy, 3)], 'toWater': round(c.get('dist_to_water_m') or dw, 1), 'home': home, 'yr': home and 'year' in (c.get('use_guess') or '').lower()}   # (yr: lived in all year, by the review's guess)
        camps.append(rec)
        seen = [k for k in (c.get('docks') or ([c['dock']] if c.get('dock') else [])) if k]
        if seen:
            for k in seen:
                hd = math.radians(k.get('heading_deg', 0)); dx, dy = math.sin(hd), math.cos(hd)
                if dx * ox + dy * oy < 0.2: dx, dy = ox, oy   # (a heading that doesn't point out into the water: the shore's own way out)
                b = shore_of(k['lon'], k['lat'], lid)
                docks.append({'camp': c['id'], 'lake': lid, 'base': to(b[0], b[1], lid), 'dir': [round(dx, 3), round(dy, 3)], 'len': round(k.get('length_m_est', 8) * scale, 2), 'seen': True})
        elif home and c['lake'] != 'inland' and (c.get('dist_to_water_m') or dw) <= DOCK_REACH:
            docks.append({'camp': c['id'], 'lake': lid, 'base': rec['shore'], 'dir': rec['out'], 'len': round((4 + 4 * h01(c['id'])) * scale, 2), 'seen': False})
    roads = []
    for r in D['roads']:
        pts = []
        for lon, lat in r['coords']:
            lid = nearer_lake(lon, lat)
            pts.append(to(lon, lat, lid))
        roads.append({'id': r['id'], 'kind': r['kind'], 'pts': pts})
    L = D['launch']; ll = shore_of(L['lon'], L['lat'], 1)
    launch = {'lake': 1, 'shore': to(ll[0], ll[1], 1), 'out': [round(ll[2], 3), round(ll[3], 3)]}
    beaches = []
    for b in D['beaches']:
        lid = LID.get(b['lake'], 1); cs = b.get('coords') or [[b['lon'], b['lat']]]
        beaches.append({'id': b['id'], 'lake': lid, 'pts': [to(lon, lat, lid) for lon, lat in cs], 'len': b.get('length_m', 20)})
    # (scale: the world's horizontal scale — the docks' lengths are this world's, × scale, as its shores are; the buildings' sizes stay true)
    return {'scale': scale, 'camps': camps, 'docks': docks, 'roads': roads, 'launch': launch, 'beaches': beaches}

HEAD = """// Generated by tools/hotbrook/build_camps3.py from tools/hotbrook/data/camps_roads.json — do not edit by hand.
// The camps, docks, roads, the launch and the beaches at the Hot Brook lakes ({world}): buildings standing in the latest images
// (2023 / fall 2024), a dock at every camp on the water or with a path to it (seen ones as seen, the rest small), in this world's
// coordinates (m; x east, y north, origin at the brook's upper mouth). docs/research_notes/Maine lake shores and catchment/
// camps_roads_docks_hot_brook.md; the sim's use: src/w3/camps3.js.
export const CAMPS3D = """
for name, model, sc, bs, out in (('the 1/10 world', 'hotbrook_model.json', 0.1, 0.5, os.path.join(ROOT, 'src', 'w3', 'camps3d.js')),
                                 ('the true-size world', 'hotbrook_model_5m.json', 1.0, 1.0, os.path.join(ROOT, 'src', 'w3', 'true', 'camps3d.js'))):
    data = build(world(model, sc, bs), sc)
    open(out, 'w', encoding='utf-8', newline='\n').write(HEAD.replace('{world}', name) + json.dumps(data, separators=(',', ':')) + ';\n')
    print(f"{name}: {len(data['camps'])} buildings ({sum(c['home'] for c in data['camps'])} lived in), {len(data['docks'])} docks "
          f"({sum(k['seen'] for k in data['docks'])} seen), {len(data['roads'])} roads -> {os.path.relpath(out, ROOT)}")
