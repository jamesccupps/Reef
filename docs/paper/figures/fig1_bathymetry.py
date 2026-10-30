# fig1_bathymetry.py — Figure 1 of the paper (docs/paper/hot_brook_lakes.md): the depth of Upper and Lower Hot Brook Lake and Hot
# Brook as the model's true-scale world holds it (src/w3/true/hotbrook3d.js: the 1949 MDIFW soundings fitted to the 2017 lidar
# shoreline, 5-m cells), shaded by depth with 1-m contours. Land is drawn plain. Needs Python 3 with numpy and Pillow.
#   python docs/paper/figures/fig1_bathymetry.py        (writes docs/paper/figures/fig1_bathymetry.png)
import base64, json, os, re
import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.normpath(os.path.join(HERE, '..', '..', '..', 'src', 'w3', 'true', 'hotbrook3d.js'))
js = open(SRC, encoding='utf-8').read()
num = lambda k: float(re.search(k + r':\s*(-?[\d.]+)', js).group(1))
NX, NY, CELL, X0, Y0 = int(num('NX')), int(num('NY')), num('CELL'), num('X0'), num('Y0')
grid = lambda k, dt: np.frombuffer(base64.b64decode(re.search(k + r":\s*'([^']*)'", js).group(1)), dtype=dt).reshape(NY, NX)
body, depth = grid(r'\bbody', np.uint8), grid(r'\bdepth_cm', np.uint16).astype(np.float32) / 100.0
stats = json.loads(re.search(r'STATS:\s*(\{.*?\}\}),', js).group(1))

# the water's extent, with a margin; rows flipped so north is up
wet = body > 0
rows, cols = np.nonzero(wet)
r0, r1, c0, c1 = max(0, rows.min() - 20), min(NY, rows.max() + 21), max(0, cols.min() - 20), min(NX, cols.max() + 21)
B, D = body[r0:r1, c0:c1][::-1], np.where(body > 0, depth, 0)[r0:r1, c0:c1][::-1]
S = 2                                                     # (pixels a cell: 10 m a pixel → 2.5 m)
H, W = B.shape
# the colours: land a pale grey-green; water from pale (0 m) to deep blue (5.5 m)
ramp = np.array([[214, 234, 242], [158, 202, 225], [107, 174, 214], [66, 146, 198], [33, 113, 181], [8, 81, 156], [8, 48, 107]], np.float32)
t = np.clip(D / 5.5, 0, 1) * (len(ramp) - 1); i = np.minimum(t.astype(int), len(ramp) - 2); f = (t - i)[..., None]
rgb = ramp[i] * (1 - f) + ramp[i + 1] * f
rgb[B == 0] = (236, 236, 228)
# 1-m contours: a cell whose 1-m band differs from a neighbour's (water only), drawn darker
band = np.floor(D).astype(int)
edge = np.zeros_like(B, bool)
edge[:-1] |= (band[:-1] != band[1:]) & (B[:-1] > 0) & (B[1:] > 0)
edge[:, :-1] |= (band[:, :-1] != band[:, 1:]) & (B[:, :-1] > 0) & (B[:, 1:] > 0)
rgb[edge] = rgb[edge] * 0.55
shore = np.zeros_like(B, bool)
shore[:-1] |= (B[:-1] > 0) != (B[1:] > 0); shore[:, :-1] |= (B[:, :-1] > 0) != (B[:, 1:] > 0)
rgb[shore] = (90, 90, 90)
img = Image.fromarray(rgb.astype(np.uint8)).resize((W * S, H * S), Image.NEAREST)

# a legend panel on the right
PAD = 420
out = Image.new('RGB', (W * S + PAD, H * S), (255, 255, 255)); out.paste(img, (0, 0))
d = ImageDraw.Draw(out)
def font(size):
    for f in ('arial.ttf', 'DejaVuSans.ttf', 'LiberationSans-Regular.ttf'):
        try: return ImageFont.truetype(f, size)
        except OSError: pass
    return ImageFont.load_default()
F1, F2, F3 = font(34), font(26), font(22)
xL = W * S + 30
d.text((xL, 40), 'Upper and Lower', font=F1, fill=(0, 0, 0)); d.text((xL, 82), 'Hot Brook Lake', font=F1, fill=(0, 0, 0))
d.text((xL, 132), 'depth (m), 1-m contours', font=F2, fill=(40, 40, 40))
for k in range(6):   # the depth key
    y = 180 + k * 46; tt = min(k / 5.5 * (len(ramp) - 1), len(ramp) - 1.001); ii = int(tt); ff = tt - ii
    col = tuple(int(v) for v in ramp[ii] * (1 - ff) + ramp[ii + 1] * ff)
    d.rectangle([xL, y, xL + 60, y + 36], fill=col, outline=(90, 90, 90)); d.text((xL + 75, y + 4), f'{k}–{k + 1} m' if k < 5 else '5–5.5 m', font=F2, fill=(0, 0, 0))
u, l = stats['upper'], stats['lower']
lines = ['Upper (south):', f"  {u['area_m2'] / 1e4:.0f} ha, mean {u['mean']:.1f} m,", f"  max {u['max']:.1f} m",
         'Lower (north):', f"  {l['area_m2'] / 1e4:.0f} ha, mean {l['mean']:.1f} m,", f"  max {l['max']:.1f} m",
         'Hot Brook between them:', '  ~155 m, to ~1.1 m deep']
for k, s in enumerate(lines): d.text((xL, 470 + k * 34), s, font=F3, fill=(0, 0, 0))
# a 500-m scale bar and the north arrow
sb = int(500 / CELL * S); y = H * S - 120
d.rectangle([xL, y, xL + sb, y + 14], fill=(0, 0, 0)); d.text((xL, y + 22), '500 m', font=F2, fill=(0, 0, 0))
ax, ay = xL + 30, y - 220
d.polygon([(ax, ay), (ax - 18, ay + 60), (ax + 18, ay + 60)], fill=(0, 0, 0)); d.text((ax - 10, ay + 66), 'N', font=F2, fill=(0, 0, 0))
d.text((xL, H * S - 44), 'Sources: MDIFW 1949 soundings;', font=font(16), fill=(80, 80, 80)); d.text((xL, H * S - 24), 'USGS 3DEP lidar (2017)', font=font(16), fill=(80, 80, 80))
# the names on the map, on the land beside each water (placed from each body's extent)
def place(bid, text, dx):
    rr, cc = np.nonzero(B == bid)
    if len(rr): d.text((int(cc.min() * S) + dx, int(rr.mean() * S)), text, font=F2, fill=(60, 60, 60))
rr, cc = np.nonzero(B == 2); d.text((10, 8), 'Lower Hot Brook Lake (north)', font=F2, fill=(60, 60, 60))
rr, cc = np.nonzero(B == 1); d.text((int(cc.min() * S) + 10, int(rr.max() * S) + 6), 'Upper Hot Brook Lake (south)', font=F2, fill=(60, 60, 60))
rr, cc = np.nonzero(B == 3); d.text((int(cc.max() * S) + 20, int(rr.mean() * S) - 12), '← Hot Brook', font=F3, fill=(60, 60, 60))
out.save(os.path.join(HERE, 'fig1_bathymetry.png'), optimize=True)
print('fig1_bathymetry.png', out.size, 'Upper', u, 'Lower', l)
