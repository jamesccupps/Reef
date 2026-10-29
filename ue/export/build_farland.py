# build_farland.py — THE LAND BEYOND THE LANDSCAPE for Unreal: the hills and ridges out to ~22 km about the lakes, where the 5 × 10 km
# landscape stops — the wind farm's ridges to the west and south-west (the turbines stood on nothing past its edge), the hills behind
# the far shores, the horizon the lakes' photos show. Made in Blender (5.1) from public data kept in the git-ignored
# tools/hotbrook/data/:
#   - the ground: USGS 3DEP elevation as the AWS Terrain Tiles serve it (terrarium PNG, zoom 12, ~27 m: tiles12/), each 40-m vertex
#     its bilinear sample;
#   - the forest on it: the aerial photo (USDA NAIP via the USGS National Map, ~20 m: far_naip/) read for cover — the trees' crowns
#     ~16 m over the ground where it is forest, none on water (the photo's near-black lakes and bogs) or open ground (fields, cuts,
#     roads: bright) — so the ridges' silhouettes carry their trees; ramped in over 600 m from the landscape's edge;
#   - the EARTH'S CURVE: each vertex dropped by d²/2R (with the air's usual refraction, ×0.87) beyond 3 km from the lakes — ~27 m at
#     20 km, what sinks the farthest hills;
#   - its colour: the same photo, as the mesh's texture (4096 × 2048 over the 48 × 47 km box).
# A hole where the landscape is (its extent from Import/heightmap.json), the far land's edge 120 m in under the landscape and 4 m
# below its ground, so the seam never shows. Sim metres (x east, y north) as Blender's x, y; z = height − 110 m (the landscape's
# datum): Unreal places it at the origin. Writes G:\HotBrookUE\Import\landmarks\farland.glb (HB_SET=landmarks HB_ONLY=farland
# Scripts/import_creatures.py imports it).
#   "C:\Program Files\Blender Foundation\Blender 5.1\blender.exe" -b --disable-autoexec -P ue/export/build_farland.py
import bpy, json, math, os
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__)); D = os.path.normpath(os.path.join(HERE, '..', '..', 'tools', 'hotbrook', 'data'))
IMPORT = 'G:/HotBrookUE/Import'; OUT = IMPORT + '/landmarks'
CELL, HALF = 40.0, 22000.0          # (the grid: 40 m over ±22 km)
CANOPY, RAMP, SEAM = 16.0, 600.0, 120.0
R_EARTH, REFRACT, FLAT = 6371000.0, 0.87, 3000.0

model = json.load(open(os.path.join(D, 'hotbrook_model.json')))
meta = model['meta']; LAT0, LON0, MX, MY = meta['lat0'], meta['lon0'], meta['mx'], meta['my']
P0 = next(s for s in model['streams'] if 'connecting' in s['name'])['pts'][0]   # (the sim's origin: the brook's upper mouth)
hm = json.load(open(IMPORT + '/heightmap.json'))
LX0, LX1 = hm['x0'], hm['x0'] + (hm['nx'] - 1) * hm['cell']; LY1 = hm['yNorth']; LY0 = LY1 - (hm['ny'] - 1) * hm['cell']

def pixels(path):
    """An image's RGB, rows from the top, 0–255 as stored (no colour management)."""
    im = bpy.data.images.load(path); im.colorspace_settings.name = 'Non-Color'; w, h = im.size
    a = np.empty(w * h * 4, np.float32); im.pixels.foreach_get(a); bpy.data.images.remove(im)
    return np.round(a.reshape(h, w, 4)[::-1, :, :3] * 255.0)

def bilinear(img, fx, fy):
    h, w = img.shape[:2]; fx = np.clip(fx, 0, w - 1.001); fy = np.clip(fy, 0, h - 1.001)
    x0, y0 = np.floor(fx).astype(int), np.floor(fy).astype(int); ax, ay = fx - x0, fy - y0
    if img.ndim == 3: ax, ay = ax[..., None], ay[..., None]
    return (img[y0, x0] * (1 - ax) * (1 - ay) + img[y0, x0 + 1] * ax * (1 - ay) + img[y0 + 1, x0] * (1 - ax) * ay + img[y0 + 1, x0 + 1] * ax * ay)

# the ground: the terrarium mosaic (metres = R·256 + G + B/256 − 32768)
Z, TX0, TX1, TY0, TY1 = map(int, open(os.path.join(D, 'tiles12', 'range.txt')).read().split())
dem = np.zeros(((TY1 - TY0 + 1) * 256, (TX1 - TX0 + 1) * 256), np.float64)
for tx in range(TX0, TX1 + 1):
    for ty in range(TY0, TY1 + 1):
        p = pixels(os.path.join(D, 'tiles12', f'{Z}_{tx}_{ty}.png'))
        dem[(ty - TY0) * 256:(ty - TY0 + 1) * 256, (tx - TX0) * 256:(tx - TX0 + 1) * 256] = p[..., 0] * 256 + p[..., 1] + p[..., 2] / 256 - 32768
def ground(lon, lat):
    fx = ((lon + 180) / 360 * 2 ** Z - TX0) * 256 - 0.5
    fy = ((1 - np.log(np.tan(np.radians(lat)) + 1 / np.cos(np.radians(lat))) / np.pi) / 2 * 2 ** Z - TY0) * 256 - 0.5
    return bilinear(dem, fx, fy)

# the photo: four tiles (naip_<x><y>.jpg, x 0 west, y 0 south), one mosaic, rows from the north
tiles = {(a, b): (pixels(os.path.join(D, 'far_naip', f'naip_{a}{b}.jpg')), json.load(open(os.path.join(D, 'far_naip', f'naip_{a}{b}.json')))['extent'])
         for a in (0, 1) for b in (0, 1)}
photo = np.concatenate([np.concatenate([tiles[(0, b)][0], tiles[(1, b)][0]], axis=1) for b in (1, 0)], axis=0)
W, E = tiles[(0, 0)][1]['xmin'], tiles[(1, 0)][1]['xmax']; S, N = tiles[(0, 0)][1]['ymin'], tiles[(0, 1)][1]['ymax']
PH, PW = photo.shape[:2]
def box(img, k):
    """A (2k+1)² box mean by running sums (2-D or per channel)."""
    p = np.pad(img, ((k + 1, k), (k + 1, k)) + ((0, 0),) * (img.ndim - 2), mode='edge').cumsum(0).cumsum(1)
    return (p[2 * k + 1:, 2 * k + 1:] - p[:-2 * k - 1, 2 * k + 1:] - p[2 * k + 1:, :-2 * k - 1] + p[:-2 * k - 1, :-2 * k - 1]) / (2 * k + 1) ** 2
def luma_of(a): return (0.3 * a[..., 0] + 0.59 * a[..., 1] + 0.11 * a[..., 2]) / 255
# (the photo's strips were flown in different years and light: each place's colour scaled so its forest matches the whole's — the
# forest's mean over ~1.5 km about it — and Canada, past the border in the south-east where NAIP stops, filled with the forest's)
l0 = luma_of(photo); nodata = l0 < 0.03
f0 = (~nodata & (l0 > 0.2) & (l0 < 0.5) & (photo[..., 1] >= photo[..., 2])).astype(np.float64)
target = np.array([photo[..., c][f0 > 0].mean() for c in range(3)])
local = box(photo * f0[..., None], 80) / np.maximum(box(f0, 80), 1e-3)[..., None]
local = np.where(box(f0, 80)[..., None] > 0.05, local, target)
photo = np.clip(photo * np.clip(target / np.maximum(local, 1), 0.7, 1.4), 0, 255)
photo[nodata] = target
# (its cover, a little blurred so a vertex reads its neighbourhood: forest, water — the lakes near black and bluish — or open ground,
# fields and cuts and roads, bright or tan)
blur = box(photo, 3); luma = luma_of(blur); r, g, b = blur[..., 0] / 255, blur[..., 1] / 255, blur[..., 2] / 255
water = ((b > g) & (luma < 0.33)) | (luma < 0.13)
open_ = ~water & ((luma > 0.47) | ((r >= g) & (luma > 0.36)))
cover = np.where(water | open_, 0.0, 1.0)
photo[box((water & ~nodata).astype(np.float64), 1) > 0.5] = (26, 31, 38)   # (the lakes one dark tone: no glare baked in)

# the grid
xs = np.arange(-HALF, HALF + 0.1, CELL); NX = len(xs); X, Y = np.meshgrid(xs, xs)        # (row j: y, column i: x)
lon = LON0 + (X + P0[0]) / MX; lat = LAT0 + (Y + P0[1]) / MY
h = ground(lon, lat)
pu, pv = (lon - W) / (E - W), (lat - S) / (N - S)
c = bilinear(cover, pu * PW - 0.5, (1 - pv) * PH - 0.5)
flat = np.max(np.abs(np.stack([np.roll(h, s, a) - h for s in (1, -1) for a in (0, 1)])), axis=0) < 0.05   # (a lake: the lidar's water flattened)
c = np.where(flat, 0.0, c)
c = (c + np.roll(c, 1, 0) + np.roll(c, -1, 0) + np.roll(c, 1, 1) + np.roll(c, -1, 1)) / 5
dout = np.hypot(np.maximum(0, np.maximum(LX0 - X, X - LX1)), np.maximum(0, np.maximum(LY0 - Y, Y - LY1)))   # (how far outside the landscape)
inside = dout <= 0
ramp = np.clip(dout / RAMP, 0, 1); ramp = ramp * ramp * (3 - 2 * ramp)
d2 = X * X + Y * Y
z = h - 110.0 + CANOPY * c * ramp - np.maximum(0, d2 - FLAT * FLAT) / (2 * R_EARTH) * REFRACT
z = np.where(inside, h - 110.0 - 4.0, z)
# quads: all but those wholly under the landscape (SEAM m in from its edge)
deep = (X > LX0 + SEAM) & (X < LX1 - SEAM) & (Y > LY0 + SEAM) & (Y < LY1 - SEAM)
q = ~(deep[:-1, :-1] & deep[:-1, 1:] & deep[1:, :-1] & deep[1:, 1:])
jj, ii = np.nonzero(q)
v00 = jj * NX + ii; quads = np.stack([v00, v00 + 1, v00 + NX + 1, v00 + NX], axis=1).astype(np.int32)

# THE SKIRT past the photo's box, out to 60 km: the grid's edge carried out in rings at the land's mean height, sinking with the Earth's
# curve (~245 m at 60 km), so from a hilltop or the air there is land to the horizon and no edge; its UV off the photo (−1): the
# material colours it the forest's average
ring = np.concatenate([np.arange(0, NX - 1), (NX - 1) + NX * np.arange(0, NX - 1), (NX * NX - 1) - np.arange(0, NX - 1), NX * (NX - 1) - NX * np.arange(0, NX - 1)])
rx, ry = X.ravel()[ring], Y.ravel()[ring]; rz = z.ravel()[ring]; mean_g = float(np.median(h)) - 110.0 + CANOPY
pos = [np.stack([X, Y, z], axis=-1).reshape(-1, 3)]; uvl = [np.stack([pu.ravel(), pv.ravel()], axis=-1)]; prev = ring; nv = NX * NX; skirt = []
for R in (26000.0, 32000.0, 42000.0, 60000.0):
    s = R / HALF; ox, oy = rx * s, ry * s; d2r = ox * ox + oy * oy
    k = np.clip((R - HALF) / 8000.0, 0, 1)   # (from the edge's own heights to the mean within 8 km)
    oz = rz * (1 - k) + (mean_g - np.maximum(0, d2r - FLAT * FLAT) / (2 * R_EARTH) * REFRACT) * k if R < 30000 else mean_g - np.maximum(0, d2r - FLAT * FLAT) / (2 * R_EARTH) * REFRACT
    pos.append(np.stack([ox, oy, oz], axis=-1)); uvl.append(np.full((len(ring), 2), -1.0)); cur = nv + np.arange(len(ring)); nv += len(ring)
    nxt = np.roll(np.arange(len(ring)), -1)
    skirt.append(np.stack([prev, cur, cur[nxt], prev[nxt]], axis=1)); prev = cur   # (wound as the grid's: facing up)
quads = np.concatenate([quads] + skirt).astype(np.int32)
pos = np.concatenate(pos); uvall = np.concatenate(uvl)

for o in list(bpy.data.objects): bpy.data.objects.remove(o)
me = bpy.data.meshes.new('farland')
me.vertices.add(len(pos)); me.vertices.foreach_set('co', pos.astype(np.float32).ravel())
me.loops.add(quads.size); me.loops.foreach_set('vertex_index', quads.ravel())
me.polygons.add(len(quads)); me.polygons.foreach_set('loop_start', np.arange(0, quads.size, 4, dtype=np.int32))
me.polygons.foreach_set('use_smooth', np.ones(len(quads), bool))
uv = me.uv_layers.new(name='UVMap'); uvs = uvall[quads.ravel()]
uv.data.foreach_set('uv', uvs.astype(np.float32).ravel())
me.update(); me.validate()
ob = bpy.data.objects.new('farland', me); bpy.context.scene.collection.objects.link(ob)

# its colour: the photo, 4096 × 2048 (rows from the south, as Blender keeps them)
TW, TH = 4096, 2048
gx, gy = np.meshgrid((np.arange(TW) + 0.5) / TW * PW - 0.5, (1 - (np.arange(TH) + 0.5) / TH) * PH - 0.5)
rgb = bilinear(photo, gx, gy) / 255.0
img = bpy.data.images.new('farland_photo', TW, TH)
rgba = np.concatenate([rgb[::-1], np.ones((TH, TW, 1))], axis=-1).astype(np.float32)
img.pixels.foreach_set(rgba.ravel()); img.filepath_raw = OUT + '/farland_photo.jpg'; img.file_format = 'JPEG'; img.save()
m = bpy.data.materials.new('FarLand'); m.use_nodes = True; nt = m.node_tree
b = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED'); b.inputs['Roughness'].default_value = 0.95
tex = nt.nodes.new('ShaderNodeTexImage'); tex.image = bpy.data.images.load(OUT + '/farland_photo.jpg'); nt.links.new(tex.outputs['Color'], b.inputs['Base Color'])
me.materials.append(m)

# THE CANOPY CLOSE TO: a tile 64 m across of crowns (a spruce–fir–hardwood mix, ~5 m apart: cones and domes 2.5–5 m in radius), its
# height made into a normal map (the crowns catching the sun on one side) and a brightness (their tops lit, the gaps between them dark)
# — farland_canopy_n.png, farland_canopy_a.png; the material tiles them over the forest so the far hills read as canopy, not lawn
TS, TM = 512, 64.0; rng = np.random.default_rng(7); ppm = TS / TM
gy_, gx_ = np.mgrid[0:TS, 0:TS] / ppm; hgt = np.zeros((TS, TS))
for _ in range(int(TM * TM / 22)):
    cx, cy, rad = rng.uniform(0, TM), rng.uniform(0, TM), rng.uniform(2.5, 5.0); cone = rng.random() < 0.6; top = rng.uniform(0.7, 1.0)
    dx = (gx_ - cx + TM / 2) % TM - TM / 2; dy = (gy_ - cy + TM / 2) % TM - TM / 2; rr = np.sqrt(dx * dx + dy * dy) / rad
    hgt = np.maximum(hgt, np.where(rr < 1, top * (1 - rr if cone else np.sqrt(np.clip(1 - rr * rr, 0, 1))), 0))
sx = (np.roll(hgt, -1, 1) - np.roll(hgt, 1, 1)) * ppm / 2 * 4.0; sy = (np.roll(hgt, -1, 0) - np.roll(hgt, 1, 0)) * ppm / 2 * 4.0
nrm = np.stack([-sx, sy, np.ones_like(sx)], axis=-1); nrm /= np.linalg.norm(nrm, axis=-1, keepdims=True)
def save_png(name, rgb):
    im = bpy.data.images.new(name, TS, TS); im.colorspace_settings.name = 'Non-Color'
    im.pixels.foreach_set(np.concatenate([rgb[::-1], np.ones((TS, TS, 1))], axis=-1).astype(np.float32).ravel())
    im.filepath_raw = OUT + '/' + name + '.png'; im.file_format = 'PNG'; im.save()
save_png('farland_canopy_n', nrm * 0.5 + 0.5)
bright = 0.25 + 0.75 * hgt / hgt.max(); save_png('farland_canopy_a', np.repeat(bright[..., None], 3, axis=-1))

bpy.ops.object.select_all(action='DESELECT'); ob.select_set(True); bpy.context.view_layer.objects.active = ob
bpy.ops.export_scene.gltf(filepath=OUT + '/farland.glb', export_format='GLB', use_selection=True, export_apply=True, export_materials='EXPORT')
print('farland: %d vertices (+ the skirt), %d quads; ground %.0f–%.0f m; landscape x %.0f…%.0f, y %.0f…%.0f; photo %d×%d (W %.3f E %.3f S %.3f N %.3f); forest %.0f %%'
      % (NX * NX, len(quads), h.min(), h.max(), LX0, LX1, LY0, LY1, PW, PH, W, E, S, N, 100 * c[~inside].mean()))
