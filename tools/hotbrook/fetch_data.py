# Fetch the public data behind the Hot Brook landscape model (Upper & Lower Hot Brook Lake and Hot Brook, T8 R4 NBPP /
# Danforth, Maine) into tools/hotbrook/data/. Then run build_model.py. Polite to the public services: one request at a
# time, an identifying User-Agent, Nominatim spaced ≥ 1 s apart (its usage policy).
#   python tools/hotbrook/fetch_data.py
# Sources: OpenStreetMap via Nominatim (lake outlines, brooks; © OpenStreetMap contributors, ODbL) · USGS 3DEP elevation
# via the AWS Terrain Tiles (terrarium PNG, z14) · USFWS National Wetlands Inventory (ArcGIS REST) · NLCD 2021 land cover
# (MRLC WMS). (The Overpass API was at capacity when this was written, so the outlines come from Nominatim's polygons.)
import json, math, os, time, urllib.parse, urllib.request

D = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
os.makedirs(os.path.join(D, 'tiles'), exist_ok=True)
UA = 'synapse-reef-research/1.0 (personal ecology simulation)'
S, N, W, E = 45.575, 45.690, -67.975, -67.900          # the model's box (lat/lon)

def get(url, path, params=None):
    if params: url += '?' + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=120) as r, open(path, 'wb') as f: f.write(r.read())

# lake outlines and the brooks (Nominatim polygon_geojson)
for q in ['Upper Hot Brook Lake', 'Lower Hot Brook Lake', 'Hot Brook, Maine']:
    get('https://nominatim.openstreetmap.org/search', os.path.join(D, q.replace(' ', '_').replace(',', '_') + '.json'),
        {'q': q, 'format': 'json', 'polygon_geojson': 1, 'limit': 5, 'countrycodes': 'us'})
    time.sleep(2)

# elevation tiles (terrarium: metres = R·256 + G + B/256 − 32768)
Z = 14
tx = lambda lon: (lon + 180) / 360 * 2 ** Z
ty = lambda lat: (1 - math.log(math.tan(math.radians(lat)) + 1 / math.cos(math.radians(lat))) / math.pi) / 2 * 2 ** Z
x0, x1, y0, y1 = int(tx(W)), int(tx(E)), int(ty(N)), int(ty(S))
for x in range(x0, x1 + 1):
    for y in range(y0, y1 + 1):
        p = os.path.join(D, 'tiles', f'{Z}_{x}_{y}.png')
        if not os.path.exists(p): get(f'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{Z}/{x}/{y}.png', p)
open(os.path.join(D, 'tiles', 'range.txt'), 'w').write(f'{Z} {x0} {x1} {y0} {y1}')

# wetlands (NWI polygons with their Cowardin code and type)
get('https://fwspublicservices.wim.usgs.gov/wetlandsmapservice/rest/services/Wetlands/MapServer/0/query', os.path.join(D, 'nwi.geojson'),
    {'geometry': f'{W},{S},{E},{N}', 'geometryType': 'esriGeometryEnvelope', 'inSR': 4326, 'outSR': 4326, 'spatialRel': 'esriSpatialRelIntersects',
     'outFields': 'ATTRIBUTE,WETLAND_TYPE,ACRES', 'returnGeometry': 'true', 'f': 'geojson'})

# land cover (NLCD 2021, the standard legend colours; decoded by nearest colour in build_model.py)
get('https://www.mrlc.gov/geoserver/mrlc_display/NLCD_2021_Land_Cover_L48/wms', os.path.join(D, 'nlcd.png'),
    {'service': 'WMS', 'version': '1.1.1', 'request': 'GetMap', 'layers': 'NLCD_2021_Land_Cover_L48', 'styles': '', 'srs': 'EPSG:4326',
     'bbox': f'{W},{S},{E},{N}', 'width': 600, 'height': 1300, 'format': 'image/png'})
# an aerial photo (USDA NAIP via the USGS National Map, public domain) for the model's photo layer, 1792 x 2748 so the pixel grid matches the box in degrees — otherwise the service widens the extent to keep square pixels and the photo lands out of register (it did: 45.551–45.714 instead of 45.575–45.690); ≤ 4000 px per side
get('https://imagery.nationalmap.gov/arcgis/rest/services/USGSNAIPImagery/ImageServer/exportImage', os.path.join(D, 'naip.jpg'),
    {'bbox': f'{W},{S},{E},{N}', 'bboxSR': 4326, 'imageSR': 4326, 'size': '1792,2748', 'format': 'jpg', 'compressionQuality': 82, 'f': 'image'})

# the MDIFW lake-survey maps (1949, revised 1965/2004): page 2 of each PDF is the map with the depth soundings — the
# scans are plain JPEG image streams, extracted without a PDF library
import io, re
from PIL import Image
os.makedirs(os.path.join(D, 'ifw'), exist_ok=True)
for name in ['upper', 'lower']:
    pdf = os.path.join(D, 'ifw', f'hot_brook_lake_{name}.pdf')
    get(f'https://www.maine.gov/ifw/docs/lake-survey-maps/washington/hot_brook_lake_{name}.pdf', pdf)
    data = open(pdf, 'rb').read()
    for n, m in enumerate(re.finditer(rb'<<([^<>]*?/Subtype/Image[^<>]*?)>>\s*stream\r?\n', data, re.S)):
        L = int(re.search(rb'/Length (\d+)', m.group(1)).group(1))
        Image.open(io.BytesIO(data[m.end(): m.end() + L])).save(os.path.join(D, 'ifw', f'{name}_p{n}.png'))
# THE LIDAR (2026-10-16; USGS 3DEP, ME Eastern B1/B2 2017, QL2 — its 1-m bare-earth DEM, served by the 3DEP ImageServer). The
# service makes the image (f=json) and returns a link to it; its grid must match the box in degrees, as for the photo. The
# whole box at ~3.5 × 5 m (the model's terrain) and the lakes at ~1.4 × 1.8 m (their hydro-flattened water: the outlines)
import json as _json
def export(url, path, params):
    r = urllib.request.urlopen(urllib.request.Request(url + '?' + urllib.parse.urlencode({**params, 'f': 'json'}), headers={'User-Agent': UA}), timeout=300)
    meta = _json.load(r); get(meta['href'], path); _json.dump(meta, open(path.rsplit('.', 1)[0] + '.json', 'w')); time.sleep(2)
DEP = 'https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer/exportImage'
export(DEP, os.path.join(D, 'lidar_dem_box.tif'), {'bbox': f'{W},{S},{E},{N}', 'bboxSR': 4326, 'imageSR': 4326, 'size': '1663,2542',
       'format': 'tiff', 'pixelType': 'F32', 'interpolation': 'RSP_BilinearInterpolation'})
export(DEP, os.path.join(D, 'lidar_dem_2m.tif'), {'bbox': '-67.959,45.597,-67.917,45.668', 'bboxSR': 4326, 'imageSR': 4326, 'size': '2334,3945',
       'format': 'tiff', 'pixelType': 'F32', 'interpolation': 'RSP_BilinearInterpolation'})
# the lakes' aerial photos at ~1 m (NAIP, RGB and the near-infrared band) for the shallow shelf (shallows.py), 2 × 2 tiles a
# lake (larger requests time out)
NAIP = 'https://imagery.nationalmap.gov/arcgis/rest/services/USGSNAIPImagery/ImageServer/exportImage'
os.makedirs(os.path.join(D, 'naip_hr'), exist_ok=True)
for name, (w0, e0, s0, n0) in {'upper': (-67.954, -67.923, 45.600, 45.636), 'lower': (-67.951, -67.922, 45.630, 45.666)}.items():
    for tx in (0, 1):
        for ty in (0, 1):
            x0, x1 = w0 + (e0 - w0) * tx / 2, w0 + (e0 - w0) * (tx + 1) / 2; y0, y1 = s0 + (n0 - s0) * ty / 2, s0 + (n0 - s0) * (ty + 1) / 2
            px = {'bbox': f'{x0},{y0},{x1},{y1}', 'bboxSR': 4326, 'imageSR': 4326, 'size': f'{round(2000 * (x1 - x0) / (y1 - y0))},2000', 'format': 'jpg', 'compressionQuality': 92}
            export(NAIP, os.path.join(D, 'naip_hr', f'{name}_{tx}{ty}.jpg'), px)
            export(NAIP, os.path.join(D, 'naip_hr', f'{name}NIR_{tx}{ty}.jpg'), {**px, 'bandIds': 3})
print('fetched into', D)
