#   python tools/hotbrook/shallows.py   (after fetch_data.py and build_model.py; writes data/shallows.json, read by build_model.py)
# THE LAKES' SHALLOW SHELF FROM AERIAL PHOTOS — satellite-derived bathymetry for the margin the 1949 soundings never reached.
# The human, 2026-10-16: "could you estimate a more accurate depth by the shores by looking at aerial photos?" Only 4 of each
# lake's 63–83 soundings lie within 50 m of shore (median ~150 m out, fitted to the map at ~18 m), so the model's shelf was a
# uniform 50-m exponential taper everywhere. In the tea-coloured water the bottom shows through to ~1.5–2 m: the lighter band
# along every shore, wide over the flats, a thin line where the shore drops off.
#
#   NAIP (USDA, ~1 m, public domain): data/naip_hr/{upper,lower}_??.jpg (+ the near-infrared band, *NIR_??.jpg), each with its
#   extent; the lakes' water from the lidar's hydro-flattened surfaces (data/lidar_dem_2m.tif). For each image tile (NAIP's
#   flight strips differ in brightness):
#   - the DEEP water's brightness L∞ and its noise σ (water over > 3 m of the soundings' bed);
#   - the bottom's EXCESS brightness E = (R − R∞) + (G − G∞) (blue is lost in the brown water), 5 × 5 median against waves;
#   - floating leaves and emergent stems shine in the near-infrared (NIR > N∞ + VEG_N and NIR > red): weed beds — shallow, no depth;
#   - Beer–Lambert: the bottom's light comes back through the water twice, E = E0·e^(−g z). E0 the bright bottom at the
#     waterline about it (the 95th percentile of E within ~45 m: its own sand or mud, so the bottom's colour cancels); the
#     faintest bottom read, E_TH = K_SIG·σ, is the band's dark outer edge — at D_EDGE, the human's "chest height … where the
#     water gets darker" — so z = D_EDGE · ln(E0 / E) / ln(E0 / E_TH) where E > E_TH. (g from the clarity alone, Kd ≈
#     1.44/Secchi 3.9 m, would put that edge at 1.8–3 m: the excess is mostly red light, which brown water takes faster.)
#   Per 15-m cell of the model: its water pixels' mean z where half or more show the bottom; a cell near shore (≤ NEAR m)
#   where the bottom does not show is deeper than its fade depth (a steep shore). Checked against the soundings.
import json, math, base64, glob, os
import numpy as np
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__)); D = os.path.join(HERE, 'data')
Image.MAX_IMAGE_PIXELS = None
SECCHI = 3.9; G2 = 2 * 1.44 / SECCHI          # /m: the bottom signal's two-way attenuation from the clarity (reported only — see D_EDGE)
D_EDGE = 1.3                                   # m: the depth where the bottom fades into the dark water — the human (2026-10-16), on a
                                               #   shore of Upper: "a foot or two deep … go out a bit … maybe to chest height before it gets
                                               #   deeper, probably where the water gets darker". (The clarity's Kd put it at 1.8–3 m; the
                                               #   red light the excess mostly is fades faster: g ≈ 1.75/m ≈ 2 × 0.9 — red in brown water)
K_SIG, E_ABS = 3.0, 12.0                       # the faintest bottom read: K_SIG × the deep water's noise, and at least E_ABS DN (R + G)
                                               #   over the deep water — the darkening a person sees as the band's edge, the same in every
                                               #   tile (a calm tile's low noise would otherwise read a fainter, deeper bottom as the band)
VEG_N, VEG_NDVI = 10.0, 0.05                   # floating leaves / emergent stems: NIR this far above deep water AND more NIR than red
                                               #   (plants reflect the near-infrared, water absorbs it: wind-roughened water brightens both)
NEAR = 60.0                                    # m (real): a cell this near shore with no bottom showing is deeper than its fade depth
E0_R = 3                                       # cells (45 m) about a cell for the waterline's bottom brightness

m = json.load(open(os.path.join(D, 'hotbrook_model.json'))); M = m['meta']; NX, NY, C = M['nx'], M['ny'], M['cell']
S_, N_, W_, E_ = M['bbox'][1], M['bbox'][3], M['bbox'][0], M['bbox'][2]
MX = 111320 * math.cos(math.radians((S_ + N_) / 2)); MY = 110540
dec = lambda k, t: np.frombuffer(base64.b64decode(m[k]), dtype=t).reshape(NY, NX)
lake = dec('lake', np.uint8); depth = dec('depth_cm', np.uint16) / 100
# the distance (m) from each lake cell to the shore (chamfer on the model grid)
def dist_shore(mask):
    d = np.where(mask, 1e9, 0.0); a, b = C, C * math.sqrt(2)
    for _ in range(2):
        for j in range(NY):
            if j: d[j] = np.minimum(d[j], d[j - 1] + a); d[j, 1:] = np.minimum(d[j, 1:], d[j - 1, :-1] + b); d[j, :-1] = np.minimum(d[j, :-1], d[j - 1, 1:] + b)
            for i in range(1, NX): d[j, i] = min(d[j, i], d[j, i - 1] + a)
        for j in range(NY - 1, -1, -1):
            if j < NY - 1: d[j] = np.minimum(d[j], d[j + 1] + a); d[j, 1:] = np.minimum(d[j, 1:], d[j + 1, :-1] + b); d[j, :-1] = np.minimum(d[j, :-1], d[j + 1, 1:] + b)
            for i in range(NX - 2, -1, -1): d[j, i] = min(d[j, i], d[j, i + 1] + a)
    return d
dsh = dist_shore(lake > 0)
# the lidar's water (hydro-flattened at each lake's level)
hd = np.asarray(Image.open(os.path.join(D, 'lidar_dem_2m.tif')), dtype=np.float32); hx = json.load(open(os.path.join(D, 'lidar_dem_2m.json')))['extent']
LV = {1: M['surf']['upper'], 2: M['surf']['lower']}

# per model cell accumulators
nW = np.zeros((NY, NX)); nB = np.zeros((NY, NX)); nV = np.zeros((NY, NX)); zS = np.zeros((NY, NX)); fadeS = np.zeros((NY, NX))
report = {}
for name, lid in (('upper', 1), ('lower', 2)):
    for f in sorted(glob.glob(os.path.join(D, 'naip_hr', f'{name}_??.jpg'))):
        ext = json.load(open(f[:-4] + '.json'))['extent']
        rgb = np.asarray(Image.open(f).convert('RGB'), dtype=np.float32); H, W = rgb.shape[:2]
        nir = np.asarray(Image.open(f.replace(name + '_', name + 'NIR_')).convert('L'), dtype=np.float32)
        if nir.shape != (H, W): nir = np.asarray(Image.open(f.replace(name + '_', name + 'NIR_')).convert('L').resize((W, H)), dtype=np.float32)
        jj, ii = np.mgrid[0:H, 0:W]
        lon = ext['xmin'] + (ii + 0.5) / W * (ext['xmax'] - ext['xmin']); lat = ext['ymax'] - (jj + 0.5) / H * (ext['ymax'] - ext['ymin'])
        ci = ((lon - W_) * MX / C).astype(int); cj = ((N_ - lat) * MY / C).astype(int)
        inb = (ci >= 0) & (ci < NX) & (cj >= 0) & (cj < NY); ci = ci.clip(0, NX - 1); cj = cj.clip(0, NY - 1)
        hpx = ((lon - hx['xmin']) / (hx['xmax'] - hx['xmin']) * hd.shape[1]).astype(int).clip(0, hd.shape[1] - 1)
        hpy = ((hx['ymax'] - lat) / (hx['ymax'] - hx['ymin']) * hd.shape[0]).astype(int).clip(0, hd.shape[0] - 1)
        water = inb & (np.abs(hd[hpy, hpx] - LV[lid]) < 0.02) & (lake[cj, ci] == lid)
        # (2 px in from the edge: the shoreline pixels mix in the bank and its overhanging trees)
        wim = Image.fromarray((water * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(5)); water = np.asarray(wim) > 0
        deep = water & (depth[cj, ci] > 3.0) & (dsh[cj, ci] > 120)
        if deep.sum() < 500: print(os.path.basename(f), 'too little deep water — skipped'); continue
        Linf = np.median(rgb[deep], 0); Ninf = np.median(nir[deep]); sig = float(np.std((rgb[..., 0] + rgb[..., 1])[deep]))
        Ex = (rgb[..., 0] - Linf[0]) + (rgb[..., 1] - Linf[1])
        Ex = np.asarray(Image.fromarray(np.clip(Ex + 64, 0, 255).astype(np.uint8)).filter(ImageFilter.MedianFilter(5)), dtype=np.float32) - 64
        veg = water & (nir > Ninf + VEG_N) & ((nir - rgb[..., 0]) / np.maximum(1, nir + rgb[..., 0]) > VEG_NDVI)
        th = max(K_SIG * sig, E_ABS)
        # the waterline's bottom brightness about each cell: the 95th percentile of E per cell, then the max over ±E0_R cells
        e95 = np.zeros((NY, NX))
        idx = cj * NX + ci; wb = water & ~veg & (Ex > th)
        if wb.any():
            order = np.argsort(idx[wb]); vals = Ex[wb][order]; keys = idx[wb][order]
            starts = np.r_[0, np.nonzero(np.diff(keys))[0] + 1]; ends = np.r_[starts[1:], len(keys)]
            for s, e in zip(starts, ends): e95.flat[keys[s]] = np.percentile(vals[s:e], 95)
        E0 = e95.copy()
        for dj in range(-E0_R, E0_R + 1):
            for di in range(-E0_R, E0_R + 1): E0 = np.maximum(E0, np.roll(np.roll(e95, dj, 0), di, 1))
        e0 = np.maximum(E0[cj, ci], th * 1.5)
        z = D_EDGE * np.log(e0 / np.maximum(Ex, th)) / np.log(e0 / th); fade = np.log(e0 / th) / G2   # (the band's darkening edge at D_EDGE)
        np.add.at(nW, (cj[water], ci[water]), 1); np.add.at(nB, (cj[wb], ci[wb]), 1); np.add.at(nV, (cj[veg], ci[veg]), 1)
        np.add.at(zS, (cj[wb], ci[wb]), z[wb]); np.add.at(fadeS, (cj[water], ci[water]), fade[water])
        report[os.path.basename(f)] = {'Linf': Linf.round(1).tolist(), 'Ninf': float(Ninf), 'sigma': round(sig, 2), 'deep_px': int(deep.sum()), 'bottom_px': int(wb.sum()), 'veg_px': int(veg.sum())}
        print(os.path.basename(f), report[os.path.basename(f)])

# the cells' estimates
cells = []
for lid in (1, 2):
    sel = (lake == lid) & (nW > 20)
    for j, i in zip(*np.nonzero(sel)):
        fb, fv = nB[j, i] / nW[j, i], nV[j, i] / nW[j, i]; fd = fadeS[j, i] / nW[j, i]
        if fb >= 0.5: cells.append([int(lid), int(j), int(i), round(float(zS[j, i] / nB[j, i]), 2), 'bottom', round(fb, 2), round(fv, 2), round(fd, 2)])
        elif fv >= 0.5: cells.append([int(lid), int(j), int(i), None, 'weeds', round(fb, 2), round(fv, 2), round(fd, 2)])
        elif fb + fv < 0.15 and dsh[j, i] <= NEAR: cells.append([int(lid), int(j), int(i), None, 'deeper', round(fb, 2), round(fv, 2), round(fd, 2)])
out = {'note': 'satellite-derived depths of the shallow shelf (tools/hotbrook/shallows.py); z in m below the surface',
       'g': G2, 'secchi': SECCHI, 'k_sig': K_SIG, 'tiles': report, 'cells': cells,
       'fields': ['lake', 'row', 'col', 'z (bottom cells)', 'kind', 'share showing the bottom', 'share weeds', 'fade depth m']}
json.dump(out, open(os.path.join(D, 'shallows.json'), 'w'))
kinds = {k: sum(1 for c in cells if c[4] == k) for k in ('bottom', 'weeds', 'deeper')}
zb = np.array([c[3] for c in cells if c[4] == 'bottom']); fd = np.array([c[7] for c in cells])
print('cells', kinds, 'bottom z mean', round(float(zb.mean()), 2), 'p10/p50/p90', np.percentile(zb, [10, 50, 90]).round(2), '| fade depth p10/p50/p90', np.percentile(fd, [10, 50, 90]).round(2))
# against the soundings (the model metres → cells; ±1 cell for the map fit's ~18 m)
snd = json.load(open(os.path.join(D, 'soundings.json')))
by = {(c[1], c[2]): c for c in cells}
for name in ('upper', 'lower'):
    rows = []
    for x, y, d in snd[name]['soundings']:
        i = int((x + M['w'] / 2) / C); j = int((M['h'] / 2 - y) / C)
        near = [by[(j + a, i + b)] for a in (-1, 0, 1) for b in (-1, 0, 1) if (j + a, i + b) in by]
        if near:
            zs = [c[3] for c in near if c[4] == 'bottom']; kinds_ = {c[4] for c in near}
            rows.append((d, round(float(np.mean(zs)), 2) if zs else None, sorted(kinds_)))
    rows.sort(key=lambda r: r[0])
    print(name, 'soundings with an optical cell about them:', len(rows))
    for r in rows: print('   sounding', r[0], 'm  optical', r[1], r[2])
