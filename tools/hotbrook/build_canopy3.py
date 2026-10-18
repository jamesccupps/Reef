# THE FOREST FROM THE AERIAL PHOTOS (render-only; the human, 2026-10-18: "use the aerial photos for the real clearings").
#   python -I tools/hotbrook/build_canopy3.py [--look DIR]   → src/w3/true/canopy3.jpg + canopy3.js (its size)
# The true-size world's land cover is NLCD's 30-m pixels: its clearings were squares, its stands' edges straight, and a 30-m pixel
# often calls a clearing forest or the forest a clearing. USDA NAIP (public domain) sees the canopy itself: the ~1-m tiles about
# both lakes (data/naip_hr: colour and near-infrared), the ~4-m photo of the whole box beyond them (data/naip.jpg, colour only).
# For each 4-m cell of the far land's extent this makes
#   - TREE COVER, 0–1: whether crowns cover it. Under the tiles, from the vegetation index (NDVI): here the canopy is green from
#     above, even its darkest part, the conifers (NDVI ≥ ~0.16), where marsh is ~0.06 and roads, roofs and water lower; the
#     cover ramps between the two (each measured on NLCD's surest patches). Texture added nothing (NLCD's few open patches here
#     are as rough as the forest) and a fit on every measure marked the conifer stands — darker in the near-infrared — as thin.
#     On the colour photo: a logistic fit (forest vs open), ramped from its middle;
#   - CONIFER SHARE, 0–1: of the crowns about a cell (~12 m), how many are spruce, fir, pine, hemlock and cedar — darker in the
#     near-infrared and in colour than the summer hardwoods (leaves scatter near-infrared strongly; needles, in clumped shoots,
#     far less). A LOGISTIC fit on the photo's own cells labelled by NLCD where NLCD is surest — the middle of its patches, the
#     same class 30 m all round (evergreen vs deciduous) — so NLCD says what each looks like here and the photo says where each
#     one is. Its means by NLCD class (printed) come out as the renderer's NLCD shares: evergreen 0.84, mixed 0.52, deciduous 0.20;
#   - BARE ground, 0–1: roads, roofs, sand and gravel (the index near zero) — the ground's colour;
#   - TRUST, 0–1: 1 under the ~1-m tiles, 0.6 on the coarse colour photo, 0 off both (the renderer then keeps NLCD's classes).
# Output: one greyscale JPEG, four panels side by side (cover | conifer share | bare | trust), row 0 at the north edge, covering the
# far grid's extent exactly (like naip3.jpg); canopy3.js gives `CANOPY = { W, H, M }`.
import sys, os, re, json, glob, base64, math
import numpy as np
sys.stdout.reconfigure(encoding="utf-8")   # (python -I ignores PYTHONIOENCODING)
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
TRUE = os.path.join(ROOT, 'src', 'w3', 'true'); D = os.path.join(HERE, 'data')
LOOK = sys.argv[sys.argv.index('--look') + 1] if '--look' in sys.argv else None
CM = 4.0                                                  # m: the cell
# ---------- the world's frame (build_world3d.py at true scale: world = the model's local metres − the brook's upper mouth) ----------
mdl = json.load(open(os.path.join(D, 'hotbrook_model.json')))['meta']
LAT0, LON0, MX, MY = mdl['lat0'], mdl['lon0'], mdl['mx'], mdl['my']
P0 = next(s for s in json.load(open(os.path.join(D, 'hotbrook_model.json')))['streams'] if 'connecting' in s['name'])['pts'][0]
lonOf = lambda x: LON0 + (x + P0[0]) / MX; latOf = lambda y: LAT0 + (y + P0[1]) / MY
# ---------- the far grid (its extent is the output's) and NLCD's classes: the sim's band (5 m) inside it, the far land (20 m) ----------
far = open(os.path.join(TRUE, 'far3d.js'), encoding='utf-8').read()
fh = re.search(r'CELL: ([\d.]+), NX: (\d+), NY: (\d+), X0: ([-\d.]+), Y0: ([-\d.]+)', far)
FC, FNX, FNY, FX0, FY0 = float(fh[1]), int(fh[2]), int(fh[3]), float(fh[4]), float(fh[5])
fcover = np.frombuffer(base64.b64decode(re.search(r"cover: '([^']*)'", far)[1]), np.uint8).reshape(FNY, FNX)   # row 0 south
hb = open(os.path.join(TRUE, 'hotbrook3d.js'), encoding='utf-8').read()
hh = re.search(r'CELL: ([\d.]+), NX: (\d+), NY: (\d+), X0: ([-\d.]+), Y0: ([-\d.]+)', hb)
GC, GNX, GNY, GX0, GY0 = float(hh[1]), int(hh[2]), int(hh[3]), float(hh[4]), float(hh[5])
gdec = lambda k: np.frombuffer(base64.b64decode(re.search(k + r": '([^']*)'", hb)[1]), np.uint8).reshape(GNY, GNX)
gbody, gcover = gdec('body'), gdec('cover')
CLASSES = json.loads(re.search(r'CLASSES: (\[[^\]]*\])', hb)[1]); CI = {k: i for i, k in enumerate(CLASSES)}
W, H = int(round(FNX * FC / CM)), int(round(FNY * FC / CM))
xs = FX0 + (np.arange(W) + 0.5) * CM; ys = FY0 + FNY * FC - (np.arange(H) + 0.5) * CM    # cell centres; row 0 north
def nlcd_at(X, Y):   # NLCD's class at points (the band's where inside it, else the far land's); 255 on the band's water
    gi = np.floor((X - GX0) / GC).astype(int); gj = np.floor((Y - GY0) / GC).astype(int)
    inb = (gi >= 0) & (gi < GNX) & (gj >= 0) & (gj < GNY)
    fi = np.clip(np.floor((X - FX0) / FC).astype(int), 0, FNX - 1); fj = np.clip(np.floor((Y - FY0) / FC).astype(int), 0, FNY - 1)
    c = fcover[fj, fi].copy(); gi_, gj_ = np.clip(gi, 0, GNX - 1), np.clip(gj, 0, GNY - 1)
    c[inb] = np.where(gbody[gj_, gi_][inb] > 0, 255, gcover[gj_, gi_][inb]); return c
XX, YY = np.meshgrid(xs, ys)
CL = nlcd_at(XX, YY)
SURE = np.ones_like(CL, bool); SURE15 = np.ones_like(CL, bool)   # the middle of a patch: the same class 30 m away all round (15 m: the open's patches are small)
for dx, dy in ((30, 0), (-30, 0), (0, 30), (0, -30), (21, 21), (-21, 21), (21, -21), (-21, -21)): SURE &= nlcd_at(XX + dx, YY + dy) == CL; SURE15 &= nlcd_at(XX + dx / 2, YY + dy / 2) == CL
FOREST = np.isin(CL, [CI[k] for k in ('evergreen', 'mixed', 'deciduous')])
# (open: no crowns at all — fields, lawns, camps, roads, bare ground, marsh, shores. Not NLCD's shrub/scrub or the shrub swamps:
# young regrowth and alder are green and rough from above, and labelling them open teaches the photo nothing it can see)
OPEN = np.isin(CL, [CI[k] for k in ('grass', 'pasture', 'crops', 'dev_open', 'dev_low', 'dev_med', 'dev_high', 'barren', 'emergent_wet', 'beach', 'rock_shore')])
EVER, DECID = CL == CI['evergreen'], CL == CI['deciduous']
print(f'grid {W} × {H} cells of {CM:.0f} m; NLCD sure cells: forest {int((SURE & FOREST).sum())}, open {int((SURE15 & OPEN).sum())}, evergreen {int((SURE & EVER).sum())}, deciduous {int((SURE & DECID).sum())}')

# ---------- box filters (summed-area tables) ----------
def box(a, r):   # mean over a (2r+1)² window, edges by the window's part inside
    p = np.pad(a, r + 1, mode='constant'); o = np.pad(np.ones_like(a), r + 1, mode='constant')
    s = p.cumsum(0).cumsum(1); so = o.cumsum(0).cumsum(1); k = 2 * r + 1
    f = lambda t: t[k:, k:] - t[:-k, k:] - t[k:, :-k] + t[:-k, :-k]
    return f(s)[:a.shape[0], :a.shape[1]] / np.maximum(f(so)[:a.shape[0], :a.shape[1]], 1)

# ---------- the ~1-m tiles: per cell, from SUB × SUB samples a metre apart ----------
SUB = 4
tiles = []   # (rgb uint8, nir uint8, extent)
for f in sorted(glob.glob(os.path.join(D, 'naip_hr', '*_[0-9][0-9].jpg'))):
    b = os.path.basename(f)
    if 'NIR' in b: continue
    fn = os.path.join(os.path.dirname(f), b.replace('_', 'NIR_', 1))
    e = json.load(open(f[:-4] + '.json'))['extent']; e2 = json.load(open(fn[:-4] + '.json'))['extent']
    assert all(abs(e[k] - e2[k]) < 1e-9 for k in ('xmin', 'xmax', 'ymin', 'ymax')), (f, fn)
    rgb, nir = np.asarray(Image.open(f).convert('RGB')), np.asarray(Image.open(fn).convert('L'))
    # (the tiles' seams: whole rows or columns of near-black — no data — at their joins)
    rowok = (rgb.mean((1, 2)) > 14) & (nir.mean(1) > 8); colok = (rgb.mean((0, 2)) > 14) & (nir.mean(0) > 8)
    print(f'  {b}: {int((~rowok).sum())} black rows, {int((~colok).sum())} black columns')
    tiles.append((rgb, nir, e, rowok, colok))
print('hi-res tiles:', len(tiles))
F = {k: np.full((H, W), np.nan, np.float32) for k in ('n', 'ndvi', 'lum', 'gr', 'tex', 'dark')}
HR = np.zeros((H, W), bool)
for r0 in range(0, H, 64):
    r1 = min(H, r0 + 64); nr = r1 - r0
    sy = FY0 + FNY * FC - r0 * CM - (np.arange(nr * SUB) + 0.5) * (CM / SUB); sx = FX0 + (np.arange(W * SUB) + 0.5) * (CM / SUB)
    lon = lonOf(sx)[None, :].repeat(len(sy), 0); lat = latOf(sy)[:, None].repeat(len(sx), 1)
    R = np.zeros(lon.shape, np.float32); G = R.copy(); B = R.copy(); N = R.copy(); ok = np.zeros(lon.shape, bool)
    for rgb, nir, e, rowok, colok in tiles:
        th, tw = nir.shape
        u = (lon - e['xmin']) / (e['xmax'] - e['xmin']) * tw; v = (e['ymax'] - lat) / (e['ymax'] - e['ymin']) * th
        inn = (u >= 0) & (u < tw) & (v >= 0) & (v < th) & ~ok   # (the tiles abut exactly: every pixel, to their edges)
        if not inn.any(): continue
        ui, vi = np.minimum(u[inn].astype(int), tw - 1), np.minimum(v[inn].astype(int), th - 1)
        px = rgb[vi, ui].astype(np.float32); nn = nir[vi, ui].astype(np.float32)
        good = rowok[vi] & colok[ui] & (px.sum(1) > 6)
        idx = np.flatnonzero(inn)[good]
        R.flat[idx], G.flat[idx], B.flat[idx], N.flat[idx] = px[good, 0], px[good, 1], px[good, 2], nn[good]; ok.flat[idx] = True
    if not ok.any(): continue
    cell = lambda a: a.reshape(nr, SUB, W, SUB).transpose(0, 2, 1, 3).reshape(nr, W, SUB * SUB)
    okc = cell(ok); full = okc.mean(2) > 0.7
    if not full.any(): continue
    def mean(a):
        c = cell(a); return np.where(full, (c * okc).sum(2) / np.maximum(okc.sum(2), 1), np.nan)
    n_, r_, g_, b_ = mean(N), mean(R), mean(G), mean(B)
    nd = (N - R) / (N + R + 1); lum = (R + G + B) / 3
    F['n'][r0:r1] = n_; F['ndvi'][r0:r1] = mean(nd); F['lum'][r0:r1] = mean(lum); F['gr'][r0:r1] = mean(G / (R + G + B + 1))
    nc = cell(N); m = n_[..., None]
    F['tex'][r0:r1] = np.where(full, np.sqrt(((nc - m) ** 2 * okc).sum(2) / np.maximum(okc.sum(2), 1)) / (n_ + 8), np.nan)   # (rough: crowns and their shadows)
    F['dark'][r0:r1] = mean((N < 70).astype(np.float32))   # (deep shadow between crowns)
    HR[r0:r1] = full
print(f'hi-res cells: {int(HR.sum())} ({HR.mean() * 100:.0f} % of the grid)')
# the rougher texture over ~12 m too: crowns and gaps at a crown's scale
def nanbox(a, r):
    m = np.isfinite(a); return box(np.where(m, a, 0), r) / np.maximum(box(m.astype(np.float32), r), 1e-6)
F['tex12'] = np.where(HR, nanbox(F['tex'], 1), np.nan); F['n12sd'] = np.where(HR, np.sqrt(np.maximum(nanbox(F['n'] ** 2, 1) - nanbox(F['n'], 1) ** 2, 0)) / (F['n'] + 8), np.nan)
F['nd12'] = np.where(HR, nanbox(F['ndvi'], 1), np.nan); F['n12'] = np.where(HR, nanbox(F['n'], 1), np.nan)
if '--stats' in sys.argv:   # how each kind of land looks to the photo (the middle of NLCD's patches)
    groups = {'evergreen': SURE & EVER, 'deciduous': SURE & DECID, 'mixed': SURE & (CL == CI['mixed']), 'woody_wet': SURE15 & (CL == CI['woody_wet']),
              'shrub': SURE15 & (CL == CI['shrub']), 'shrub_wet': SURE15 & (CL == CI['shrub_wet']), 'emergent_wet': SURE15 & (CL == CI['emergent_wet']),
              'grass/pasture': SURE15 & np.isin(CL, [CI['grass'], CI['pasture'], CI['crops']]), 'developed': SURE15 & np.isin(CL, [CI[k] for k in ('dev_open', 'dev_low', 'dev_med', 'dev_high', 'barren')])}
    for k in ('ndvi', 'nd12', 'tex', 'tex12', 'n', 'lum', 'dark'):
        print(k)
        for g, m in groups.items():
            v = F[k][m & HR]; v = v[np.isfinite(v)]
            if len(v) > 30: print(f'   {g:14s} {len(v):7d}  p10 {np.percentile(v, 10):6.3f}  p50 {np.percentile(v, 50):6.3f}  p90 {np.percentile(v, 90):6.3f}')
    raise SystemExit

# ---------- logistic regression (Newton's method), on standardized features ----------
def fit(Xs, y, l2=10.0, it=30):
    mu, sd = Xs.mean(0), Xs.std(0) + 1e-9; Z = np.c_[np.ones(len(Xs)), (Xs - mu) / sd]; w = np.zeros(Z.shape[1])
    for _ in range(it):
        p = 1 / (1 + np.exp(-Z @ w)); g = Z.T @ (p - y) + l2 * w; Hm = (Z * (p * (1 - p))[:, None]).T @ Z + l2 * np.eye(len(w))
        w -= np.linalg.solve(Hm, g)
    return lambda X: 1 / (1 + np.exp(-(np.c_[np.ones(len(X)), (X - mu) / sd] @ w))), w
def balanced(pos, neg, cap=60000, seed=1):   # equal numbers of each label (the forest outnumbers the open ~30:1)
    rng = np.random.default_rng(seed); a, b = np.flatnonzero(pos), np.flatnonzero(neg); k = min(len(a), len(b), cap)
    return np.r_[rng.choice(a, k, replace=False), rng.choice(b, k, replace=False)], np.r_[np.ones(k), np.zeros(k)]
def report(name, p, pos, neg):
    tp = (p[pos] > 0.5).mean(); tn = (p[neg] <= 0.5).mean(); q = lambda m: ' '.join(f'{v:.2f}' for v in np.percentile(p[m], [10, 25, 50, 75, 90]))
    print(f'  {name}: NLCD-sure {pos.sum()} vs {neg.sum()}; agrees {tp * 100:.0f} % / {tn * 100:.0f} %; p10–90 {q(pos)} | {q(neg)}')

# TREE COVER under the tiles: from the vegetation index alone. Here (--stats) the canopy is green from above, the darkest of it —
# the conifers — at NDVI ≥ ~0.16 (NLCD's evergreen, 10th percentile), the marsh at ~0.06 and the roads, roofs and water lower; the
# texture tells nothing more (NLCD's few open patches are as rough as the forest), and a fit on all the measures marked the
# conifer stands (darker in the near-infrared) as thin. So the cover ramps from the marsh's median to the conifers' 10th
# percentile, on the index half at 4 m (the edges) and half over 12 m (a crown's shadow is not a gap); the shrub swamps'
# alder, as green, counts as cover — the renderer keeps NLCD's shrub swamps low (their stocking)
KG = ['ndvi', 'nd12', 'n', 'lum', 'gr', 'n12', 'tex12']
good = np.isfinite(np.stack([F[k].ravel() for k in KG], 1)).all(1) & HR.ravel()
T_LO = float(np.median(F['ndvi'][SURE15 & (CL == CI['emergent_wet']) & HR])); T_HI = float(np.percentile(F['nd12'][SURE & EVER & HR], 10))
ramp = lambda a, lo, hi: np.clip((a - lo) / (hi - lo), 0, 1)
cover = ramp(0.5 * F['ndvi'] + 0.5 * F['nd12'], T_LO, T_HI).ravel()
print(f'tree cover, hi-res: NDVI ramp {T_LO:.3f} → {T_HI:.3f}')
report('cover', cover, good & (SURE & FOREST).ravel(), good & (SURE15 & OPEN).ravel())
for g in ('evergreen', 'deciduous', 'mixed', 'woody_wet', 'shrub_wet', 'emergent_wet', 'dev_open', 'dev_low'):
    m = good & (SURE15 & (CL == CI[g])).ravel()
    if m.sum() > 30: print(f'    {g:12s} mean cover {cover[m].mean():.2f}')
# BARE ground (roads, roofs, sand, gravel): the index near or below zero
bare = (1 - ramp(F['ndvi'], T_LO * 0.2, T_LO * 1.5)).ravel()
KE = ['n', 'ndvi', 'lum', 'gr', 'n12', 'nd12', 'tex12']
Xe = np.stack([F[k].ravel() for k in KE], 1)
idx, y = balanced(good & (SURE & EVER).ravel(), good & (SURE & DECID).ravel())
pe, we = fit(Xe[idx], y)
conif = np.full(H * W, np.nan, np.float32); conif[good] = pe(Xe[good]); print('conifer, hi-res: weights', dict(zip(['1'] + KE, np.round(we, 2))))
report('conifer', conif, good & (SURE & EVER).ravel(), good & (SURE & DECID).ravel())
for g in ('evergreen', 'mixed', 'deciduous', 'woody_wet'):
    m = good & (CL == CI[g]).ravel() & (cover > 0.5)
    if m.sum() > 30: print(f'    {g:12s} mean conifer share {conif[m].mean():.2f} (all its cells under the tiles, {int(m.sum())})')

# ---------- the coarse colour photo beyond the tiles (~4 m a pixel; no near-infrared): the same, weaker ----------
S_, N_, W_, E_ = 45.575, 45.690, -67.975, -67.900
nimg = np.asarray(Image.open(os.path.join(D, 'naip.jpg')).convert('RGB')).astype(np.float32); IH, IW = nimg.shape[:2]
u = np.clip(((lonOf(XX) - W_) / (E_ - W_) * IW).astype(int), 0, IW - 1); v = np.clip(((N_ - latOf(YY)) / (N_ - S_) * IH).astype(int), 0, IH - 1)
inbox = (lonOf(XX) > W_) & (lonOf(XX) < E_) & (latOf(YY) > S_) & (latOf(YY) < N_)
cR, cG, cB = (nimg[v, u, k] for k in range(3)); clum = (cR + cG + cB) / 3
C = {'lum': clum, 'gr': cG / (cR + cG + cB + 1), 'rb': (cR - cB) / (cR + cB + 1), 'lum12': box(clum, 1), 'sd12': np.sqrt(np.maximum(box(clum ** 2, 2) - box(clum, 2) ** 2, 0)) / (box(clum, 2) + 8)}
C['gr12'] = box(C['gr'], 1)
KR = ['lum', 'gr', 'rb', 'lum12', 'sd12', 'gr12']
Xr = np.stack([C[k].ravel() for k in KR], 1); gr = inbox.ravel()
idx, y = balanced(gr & (SURE & FOREST).ravel(), gr & (SURE15 & OPEN).ravel())
pcr, _ = fit(Xr[idx], y); coverR = pcr(Xr)
report('cover, colour photo', coverR, gr & (SURE & FOREST).ravel(), gr & (SURE15 & OPEN).ravel())
idx, y = balanced(gr & (SURE & EVER).ravel(), gr & (SURE & DECID).ravel())
per, _ = fit(Xr[idx], y); conifR = per(Xr)
report('conifer, colour photo', conifR, gr & (SURE & EVER).ravel(), gr & (SURE & DECID).ravel())

# ---------- together: the tiles where they are (feathered ~40 m into the colour photo), the colour photo where it is ----------
hrw = np.clip(nanbox(HR.astype(np.float32), 5) * 2 - 1, 0, 1) * HR   # (0 at the tiles' edge → 1 ten cells in)
hrw = hrw.ravel(); TR_R = 0.6   # (the colour photo's trust: it tells forest from open about as well, a crown's texture less)
coverR = ramp(coverR, 0.3, 0.7)   # (the colour photo's probability, from its middle — its forest's median is 0.78, its open's 0.13)
cov = np.where(good, hrw * np.nan_to_num(cover) + (1 - hrw) * coverR, coverR)
con = np.where(good, hrw * np.nan_to_num(conif) + (1 - hrw) * conifR, conifR)
trust = np.where(gr, np.maximum(hrw, TR_R), 0).astype(np.float32)
cov = np.where(gr, cov, 0); con = np.where(gr, con, 0.5); bare = np.where(good, hrw * np.nan_to_num(bare), 0)
# (the conifer share of a stand, not of a 4-m cell's pixels: over ~12 m, by the crowns there — a road's edge says nothing)
cw = np.maximum(cov, 0.02).reshape(H, W); con = (box(con.reshape(H, W) * cw, 1) / box(cw, 1)).ravel()
out = np.concatenate([np.clip(a.reshape(H, W) * 255, 0, 255).astype(np.uint8) for a in (cov, con, bare, trust)], axis=1)
Image.fromarray(out, 'L').save(os.path.join(TRUE, 'canopy3.jpg'), quality=88, optimize=True)
print('wrote src/w3/true/canopy3.jpg', out.shape, f'{os.path.getsize(os.path.join(TRUE, "canopy3.jpg")) / 1e6:.2f} MB')
open(os.path.join(TRUE, 'canopy3.js'), 'w', encoding='utf-8', newline='\n').write(
    "// canopy3.js — GENERATED by tools/hotbrook/build_canopy3.py; render-only (browser layer). canopy3.jpg is the forest from the\n"
    f"// aerial photos: four {W} × {H} panels side by side (tree cover, conifer share, bare ground, trust; 0–255), {CM:.0f} m a cell, over the far\n"
    "// grid's extent exactly (far3d.js), row 0 at the north edge.\n"
    f"export const CANOPY = {{ W: {W}, H: {H}, M: {CM} }};\n")
# ---------- the sim's banks (TRUE world): the photo's tree cover on each 5-m cell of the sim's band — src/w3/true/shore3.js, read by
# geometry.js as GEO.canopy (0–255), so the insects falling in and the wood in the shallows follow the real treeline (littoral3,
# plants3). The band lies wholly under the ~1-m tiles (its trust is 1)
gcx = GX0 + (np.arange(GNX) + 0.5) * GC; gcy = GY0 + (np.arange(GNY) + 0.5) * GC          # row 0 south (the sim's grid)
GXX, GYY = np.meshgrid(gcx, gcy)
fu = (GXX - FX0) / CM - 0.5; fv = (FY0 + FNY * FC - GYY) / CM - 0.5                      # (the canopy grid's row 0 is north)
i0 = np.clip(np.floor(fu).astype(int), 0, W - 2); j0 = np.clip(np.floor(fv).astype(int), 0, H - 2); au = np.clip(fu - i0, 0, 1); av = np.clip(fv - j0, 0, 1)
C2 = cov.reshape(H, W); TR = trust.reshape(H, W)
bil = lambda A: (A[j0, i0] * (1 - au) + A[j0, i0 + 1] * au) * (1 - av) + (A[j0 + 1, i0] * (1 - au) + A[j0 + 1, i0 + 1] * au) * av
gcov = np.where(gbody == 0, bil(C2), 0); gtr = bil(TR)
print(f'the band: its land cells under the tiles {(gtr[gbody == 0] > 0.99).mean() * 100:.1f} %; mean tree cover on land {gcov[gbody == 0].mean():.2f}')
shore = base64.b64encode(np.clip(gcov * 255, 0, 255).astype(np.uint8).tobytes()).decode()
open(os.path.join(TRUE, 'shore3.js'), 'w', encoding='utf-8', newline='\n').write(
    "// shore3.js \u2014 GENERATED by tools/hotbrook/build_canopy3.py (the sim's data: pure). The aerial photos' tree cover on each cell of\n"
    f"// the true world's band ({GNX} x {GNY} cells of {GC:.0f} m, row 0 at the south edge; 0-255; 0 on the water): geometry.js GEO.canopy.\n"
    f"export const SHORE3 = {{ NX: {GNX}, NY: {GNY}, canopy: '{shore}' }};\n")
# ---------- by eye: the hi-res area's photo beside what was made of it ----------
if LOOK:
    for name, (cx, cy, half) in {'canopy_a.png': (850, -1500, 250), 'canopy_b.png': (1000, 1500, 250), 'canopy_c.png': (330, 960, 250), 'canopy_d.png': (700, 1500, 350)}.items():
        c0, c1 = int((cx - half - FX0) / CM), int((cx + half - FX0) / CM); r0_, r1_ = int((FY0 + FNY * FC - cy - half) / CM), int((FY0 + FNY * FC - cy + half) / CM)
        pv = lambda a: np.clip(a.reshape(H, W)[r0_:r1_, c0:c1] * 255, 0, 255).astype(np.uint8)
        clc = CL[r0_:r1_, c0:c1]; lut = np.zeros((256, 3), np.uint8); lut[CI['evergreen']] = (20, 70, 35); lut[CI['mixed']] = (70, 120, 50); lut[CI['deciduous']] = (140, 190, 80); lut[CI['shrub']] = (190, 170, 90); lut[CI['grass']] = (220, 220, 120)
        lut[CI['woody_wet']] = (60, 110, 110); lut[CI['shrub_wet']] = (120, 150, 120); lut[CI['emergent_wet']] = (150, 190, 170); lut[CI['dev_open']] = (230, 190, 190); lut[CI['dev_low']] = (220, 140, 120); lut[255] = (40, 60, 120)
        rgbp = np.stack([np.nan_to_num(F['lum'])[r0_:r1_, c0:c1]] * 3, 2).astype(np.uint8)
        im = np.concatenate([rgbp, np.stack([pv(cov)] * 3, 2), np.stack([pv(con)] * 3, 2), np.stack([pv(bare)] * 3, 2), lut[clc]], axis=1)
        Image.fromarray(im).resize((im.shape[1] * 2, im.shape[0] * 2), Image.NEAREST).save(os.path.join(LOOK, name))
