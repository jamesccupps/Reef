# make_ground_material.py — the landscape's ground (/Game/HotBrook/Materials/M_Ground) from Quixel Megascans surfaces scanned from real
# forest floors (ue/export/megascans_surfaces.py puts them in Import/surfaces at 2048²; imported here to /Game/HotBrook/Surfaces):
#   - the floor under the trees: needle-and-moss floor and broadleaf litter, mixed in patches tens of metres across, with moss carpets;
#   - rocky floor on slopes past ~30° (the till's stones and boulders where the soil thins);
#   - THE LAKES' EDGES AND BEDS by the sim's substrate (Import/substrate.png: ue/export/export_substrate.mjs — per 5-m cell the shares of
#     boulder–cobble, gravel, sand and organic muck from each spot's wave exposure, the shore above the waterline as the water beside
#     it): the rocky floor's cobble, gravel, sand (Poly Haven's gravelly_sand, greyed to the lakes' granite sand) or mud, below ~1 m
#     above Upper's level and under the water, broken up by noise so the cells' squares don't show;
#   - past ~900 m from the eye, the aerial photos' canopy (Import/canopy_rgba.png) — the forest from afar, where the trees don't stream;
#   - SNOW over what faces up when /Game/HotBrook/Materials/MPC_HB_Season's 'Snow' is up (AHotBrookLink: with the lakes' ice), thinner
#     on steep ground, a little uneven.
# World-space (each surface tiles at its scanned size: 2 m, the moss and mud 1 m), so it covers the 5 × 10 km landscape without UVs;
# a broad brightness variation hides the repeats. Every link is checked: a wrong pin name fails silently in this API.
#   UnrealEditor-Cmd.exe G:\HotBrookUE\HotBrook.uproject -run=pythonscript -script=G:/HotBrookUE/Scripts/make_ground_material.py
import unreal
L = unreal.MaterialEditingLibrary
tools = unreal.AssetToolsHelpers.get_asset_tools()
EAL = unreal.EditorAssetLibrary
path, name = '/Game/HotBrook/Materials', 'M_Ground'
SURF = '/Game/HotBrook/Surfaces'
bad = []

# ---------- the textures ----------
def import_tex(file, dest_name, kind):
    t = unreal.AssetImportTask(); t.filename = unreal.Paths.project_dir() + 'Import/surfaces/' + file; t.destination_path = SURF
    t.destination_name = dest_name; t.automated = True; t.replace_existing = True; t.save = False
    tools.import_asset_tasks([t])
    tex = unreal.load_asset(SURF + '/' + dest_name)
    if not tex: bad.append('import ' + file); return None
    if kind == 'normal':
        tex.set_editor_property('compression_settings', unreal.TextureCompressionSettings.TC_NORMALMAP); tex.set_editor_property('srgb', False)
    elif kind == 'gray':
        tex.set_editor_property('compression_settings', unreal.TextureCompressionSettings.TC_GRAYSCALE); tex.set_editor_property('srgb', False)
    tex.set_editor_property('lod_group', unreal.TextureGroup.TEXTUREGROUP_WORLD)
    EAL.save_asset(SURF + '/' + dest_name)
    return tex
SURFACES = {'ForestFloorA': 2.0, 'ForestFloorB': 2.0, 'MossyFloor': 1.0, 'RockyFloor': 2.0, 'Mud': 1.0, 'Gravel': 2.0, 'Sand': 2.5}   # (metres a repeat: the scans' size)
TEX = {}
for s in SURFACES:
    TEX[s] = (import_tex(s + '_BaseColor.png', 'T_%s_BaseColor' % s, 'color'), import_tex(s + '_Normal.png', 'T_%s_Normal' % s, 'normal'),
              import_tex(s + '_Roughness.png', 'T_%s_Roughness' % s, 'gray'))

# ---------- the material ----------
if EAL.does_asset_exist(path + '/' + name): EAL.delete_asset(path + '/' + name)
m = tools.create_asset(name, path, unreal.Material, unreal.MaterialFactoryNew())
def node(cls, x, y): return L.create_material_expression(m, cls, x, y)
def link(a, ao, b, bi):
    if not L.connect_material_expressions(a, ao, b, bi): bad.append('%s.%s -> %s.%s' % (a.get_name(), ao, b.get_name(), bi))
def out(a, ao, prop):
    if not L.connect_material_property(a, ao, prop): bad.append('%s.%s -> %s' % (a.get_name(), ao, prop))
def const3(r, g, b, x, y):
    n = node(unreal.MaterialExpressionConstant3Vector, x, y); n.set_editor_property('constant', unreal.LinearColor(r, g, b, 1)); return n
def mask(src, chans, x, y):
    n = node(unreal.MaterialExpressionComponentMask, x, y)
    for c in 'rgba': n.set_editor_property(c, c in chans)
    link(src, '', n, ''); return n
def op(cls, a, b, x, y):   # (a two-input node: b a node, or a constant)
    n = node(cls, x, y); link(a, '', n, 'A')
    if isinstance(b, (int, float)): n.set_editor_property('const_b', float(b))
    else: link(b, '', n, 'B')
    return n
def lerp(a, b, alpha, x, y):
    n = node(unreal.MaterialExpressionLinearInterpolate, x, y); link(a, '', n, 'A'); link(b, '', n, 'B'); link(alpha, '', n, 'Alpha'); return n
def smooth(v, lo, hi, x, y):
    n = node(unreal.MaterialExpressionSmoothStep, x, y); link(v, '', n, 'Value'); n.set_editor_property('const_min', lo); n.set_editor_property('const_max', hi); return n
def noise(scale, x, y):   # (gradient noise of the world position — the node's own default when its position isn't wired — 0–1; scale per cm)
    n = node(unreal.MaterialExpressionNoise, x, y); n.set_editor_property('scale', scale); n.set_editor_property('output_min', 0.0); n.set_editor_property('output_max', 1.0)
    n.set_editor_property('levels', 3); return n

wp = node(unreal.MaterialExpressionWorldPosition, -3000, 0)
wxy = mask(wp, 'rg', -2800, 0)
# each surface sampled at its own world scale: colour, normal, roughness (shared samplers — many textures in one material)
S = {}
y = -1600
for s, metres in SURFACES.items():
    uv = op(unreal.MaterialExpressionMultiply, wxy, 1.0 / (metres * 100.0), -2500, y)
    out3 = []
    for i, kind in enumerate(['color', 'normal', 'gray']):
        t = node(unreal.MaterialExpressionTextureSample, -2200, y + i * 120)
        tex = TEX[s][i]
        if tex: t.set_editor_property('texture', tex)
        t.set_editor_property('sampler_type', {'color': unreal.MaterialSamplerType.SAMPLERTYPE_COLOR, 'normal': unreal.MaterialSamplerType.SAMPLERTYPE_NORMAL,
                                               'gray': unreal.MaterialSamplerType.SAMPLERTYPE_LINEAR_GRAYSCALE}[kind])
        t.set_editor_property('sampler_source', unreal.SamplerSourceMode.SSM_WRAP_WORLD_GROUP_SETTINGS)
        link(uv, '', t, 'UVs'); out3.append(mask(t, 'r' if kind == 'gray' else 'rgb', -2050, y + i * 120))   # (RGB; the roughness its R)
    S[s] = out3; y += 420
def blend3(a, b, alpha, x, y):   # (colour, normal and roughness of two surfaces blended by alpha)
    return [lerp(a[i], b[i], alpha, x, y + 100 * i) for i in range(3)]

n_big, n_mid, n_var = noise(1.0 / 4000.0, -2000, 600), noise(1.0 / 900.0, -2000, 800), noise(1.0 / 2500.0, -2000, 1000)
# the floor: needles-and-moss vs broadleaf litter in patches ~40 m; moss carpets where the mid noise is high
floor = blend3(S['ForestFloorA'], S['ForestFloorB'], smooth(n_big, 0.35, 0.65, -1700, 600), -1400, -1600)
floor = blend3(floor, S['MossyFloor'], op(unreal.MaterialExpressionMultiply, smooth(n_mid, 0.68, 0.9, -1700, 800), 0.6, -1550, 800), -1100, -1600)
# rocky floor on slopes: the up component of the surface normal under ~0.86 (≈ 30°)
up = mask(node(unreal.MaterialExpressionVertexNormalWS, -2000, 1200), 'b', -1800, 1200)
flat = smooth(up, 0.78, 0.9, -1600, 1200)
ground = blend3(S['RockyFloor'], floor, flat, -800, -1600)
# the lakes' edges and beds: below ~1 m above Upper's level (Z 1893 cm; Lower's 1823) the substrate's mix — mud, then sand, gravel
# and the rocky floor's cobble over it where each is a fair share of the bed (each share nudged by the mid noise, ±0.15)
z = mask(wp, 'b', -2000, 1400)
dry = smooth(z, 1960.0, 2000.0, -1600, 1400)
SUB = '/Game/HotBrook/Textures/T_Substrate'
task = unreal.AssetImportTask(); task.filename = unreal.Paths.project_dir() + 'Import/substrate.png'; task.destination_path = '/Game/HotBrook/Textures'
task.destination_name = 'T_Substrate'; task.automated = True; task.replace_existing = True; task.save = False
tools.import_asset_tasks([task])
stex = unreal.load_asset(SUB)
if stex:
    stex.set_editor_property('srgb', False); stex.set_editor_property('compression_settings', unreal.TextureCompressionSettings.TC_VECTOR_DISPLACEMENTMAP)
    stex.set_editor_property('mip_gen_settings', unreal.TextureMipGenSettings.TMGS_NO_MIPMAPS)
    stex.set_editor_property('address_x', unreal.TextureAddress.TA_CLAMP); stex.set_editor_property('address_y', unreal.TextureAddress.TA_CLAMP)
    EAL.save_asset(SUB)
    import json as _json
    sj = _json.load(open(unreal.Paths.project_dir() + 'Import/substrate.json'))
    sx = mask(wp, 'r', -2600, 2600); sy = mask(wp, 'g', -2600, 2700)
    su = op(unreal.MaterialExpressionMultiply, op(unreal.MaterialExpressionAdd, op(unreal.MaterialExpressionMultiply, sx, 0.01, -2450, 2600), -sj['x0'], -2300, 2600), 1.0 / (sj['nx'] * sj['cell']), -2150, 2600)
    sv = op(unreal.MaterialExpressionMultiply, op(unreal.MaterialExpressionAdd, op(unreal.MaterialExpressionMultiply, sy, -0.01, -2450, 2700), -sj['y0'], -2300, 2700), 1.0 / (sj['ny'] * sj['cell']), -2150, 2700)
    suv = node(unreal.MaterialExpressionAppendVector, -2000, 2650); link(su, '', suv, 'A'); link(sv, '', suv, 'B')
    st = node(unreal.MaterialExpressionTextureSample, -1850, 2650); st.set_editor_property('texture', stex)
    st.set_editor_property('sampler_type', unreal.MaterialSamplerType.SAMPLERTYPE_LINEAR_COLOR); st.set_editor_property('sampler_source', unreal.SamplerSourceMode.SSM_CLAMP_WORLD_GROUP_SETTINGS)
    link(suv, '', st, 'UVs')
    jit = op(unreal.MaterialExpressionMultiply, op(unreal.MaterialExpressionSubtract, n_mid, 0.5, -1850, 2850), 0.3, -1700, 2850)
    def share(ch, x, y): return smooth(op(unreal.MaterialExpressionAdd, mask(st, ch, -1700, y), jit, -1550, y), 0.2, 0.45, -1400, y)
    edge = blend3(S['Mud'], S['Sand'], share('b', -1400, 2600), -1250, 2400)
    edge = blend3(edge, S['Gravel'], share('g', -1400, 2700), -1100, 2400)
    edge = blend3(edge, S['RockyFloor'], share('r', -1400, 2800), -950, 2400)
else:
    bad.append('no Import/substrate.png (ue/export/export_substrate.mjs): the edges cobbled, the beds mud')
    edge = blend3(S['Mud'], S['RockyFloor'], smooth(z, 1700.0, 1800.0, -1600, 1500), -650, 2400)
ground = blend3(edge, ground, dry, -500, -1600)
# a broad brightness variation (0.8–1.15) over the colour so the repeats don't show
var = node(unreal.MaterialExpressionLinearInterpolate, -1400, 1000); var.set_editor_property('const_a', 0.8); var.set_editor_property('const_b', 1.15); link(n_var, '', var, 'Alpha')
color = op(unreal.MaterialExpressionMultiply, ground[0], var, -200, -1600)
# THE SNOW (the season's collection, made here if it isn't yet: 'Snow' 0–1)
MPC = '/Game/HotBrook/Materials/MPC_HB_Season'
mpc = unreal.load_asset(MPC) if EAL.does_asset_exist(MPC) else None
if not mpc:
    mpc = tools.create_asset('MPC_HB_Season', path, unreal.MaterialParameterCollection, unreal.MaterialParameterCollectionFactoryNew())
    sp = unreal.CollectionScalarParameter(); sp.set_editor_property('parameter_name', 'Snow'); sp.set_editor_property('default_value', 0.0)
    mpc.set_editor_property('scalar_parameters', [sp]); EAL.save_asset(MPC)
cp = node(unreal.MaterialExpressionCollectionParameter, -1700, 1700); cp.set_editor_property('collection', mpc); cp.set_editor_property('parameter_name', 'Snow')
snow_k = op(unreal.MaterialExpressionMultiply, op(unreal.MaterialExpressionMultiply, cp, smooth(up, 0.55, 0.8, -1600, 1800), -1450, 1750),
            smooth(op(unreal.MaterialExpressionAdd, n_mid, op(unreal.MaterialExpressionMultiply, cp, 0.6, -1600, 1900), -1450, 1900), 0.35, 0.75, -1300, 1900), -1200, 1800)
snow_c = op(unreal.MaterialExpressionMultiply, const3(0.82, 0.85, 0.9, -1300, 2000), var, -1150, 2000)
snow_r = node(unreal.MaterialExpressionConstant, -900, 2300); snow_r.set_editor_property('r', 0.8)   # (snow's roughness)
color = lerp(color, snow_c, snow_k, -50, -1600)
ground = [ground[0], lerp(ground[1], const3(0, 0, 1, -900, 2100), op(unreal.MaterialExpressionMultiply, snow_k, 0.8, -900, 2200), -700, -1500),
          lerp(ground[2], snow_r, snow_k, -700, -1400)]

# THE FOREST FROM AFAR (the trees stream only within ~1.2 km): the aerial photos' canopy (Import/canopy_rgba.png: RGB its colour, A the
# cover) over the far grid's extent — x −2880…2440 m, y −4920…5040 m, row 0 north — blended in past ~900 m from the eye
task = unreal.AssetImportTask(); task.filename = unreal.Paths.project_dir() + 'Import/canopy_rgba.png'; task.destination_path = '/Game/HotBrook/Textures'
task.destination_name = 'T_Canopy'; task.automated = True; task.replace_existing = True; task.save = True
tools.import_asset_tasks([task])
tex = unreal.load_asset('/Game/HotBrook/Textures/T_Canopy')
if tex:
    tex.set_editor_property('address_x', unreal.TextureAddress.TA_CLAMP); tex.set_editor_property('address_y', unreal.TextureAddress.TA_CLAMP)
    EAL.save_asset('/Game/HotBrook/Textures/T_Canopy')
    wx, wy = mask(wp, 'r', -1700, 2000), mask(wp, 'g', -1700, 2100)
    u = op(unreal.MaterialExpressionMultiply, op(unreal.MaterialExpressionAdd, op(unreal.MaterialExpressionMultiply, wx, 0.01, -1500, 2000), 2880.0, -1350, 2000), 1.0 / 5320.0, -1200, 2000)
    v = op(unreal.MaterialExpressionMultiply, op(unreal.MaterialExpressionAdd, op(unreal.MaterialExpressionMultiply, wy, 0.01, -1500, 2100), 5040.0, -1350, 2100), 1.0 / 9960.0, -1200, 2100)
    uv = node(unreal.MaterialExpressionAppendVector, -1050, 2050); link(u, '', uv, 'A'); link(v, '', uv, 'B')
    ts = node(unreal.MaterialExpressionTextureSample, -900, 2050); ts.set_editor_property('texture', tex); link(uv, '', ts, 'UVs')
    can = op(unreal.MaterialExpressionMultiply, mask(ts, 'rgb', -700, 2000), var, -550, 2000)
    cam = node(unreal.MaterialExpressionCameraPositionWS, -1100, 2300)
    dist = node(unreal.MaterialExpressionDistance, -900, 2300); link(cam, '', dist, 'A'); link(wp, '', dist, 'B')
    far = smooth(dist, 90000.0, 140000.0, -700, 2300)
    k = node(unreal.MaterialExpressionMultiply, -500, 2250); link(ts, 'A', k, 'A'); link(far, '', k, 'B')   # (the cover: the texture's alpha)
    color = lerp(color, can, k, 100, -1500)
else:
    bad.append('canopy texture import')
out(color, '', unreal.MaterialProperty.MP_BASE_COLOR)
out(ground[1], '', unreal.MaterialProperty.MP_NORMAL)
out(ground[2], '', unreal.MaterialProperty.MP_ROUGHNESS)
L.recompile_material(m)
EAL.save_asset(path + '/' + name)
unreal.log_warning('HB made %s/%s from %d surfaces; links/imports that failed: %s' % (path, name, len(SURFACES), bad or 'none'))
