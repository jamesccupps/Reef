# make_farland_material.py — M_HB_FarLand: the far land's colour through the year (AHotBrookFarLand, the mesh from
# ue/export/build_farland.py): its aerial photo (Import/landmarks/farland_photo.jpg → /Game/HotBrook/Textures/T_FarLand, 4096 × 2048)
# read for what each place is — the lakes (the photo's one dark tone), open ground (fields and cuts: bright), and the canopy, its
# hardwoods the lighter, yellower greens and its conifers the dark — then:
#   - AUTUMN (0–1, set by the actor from the leaf calendar): the hardwoods' share turned scarlet, orange or gold by stands ~90 m across;
#   - BARE (0–1): the hardwoods grey-brown twigs from late October to May;
#   - SNOW (MPC_HB_Season 'Snow', as the ground's): the open ground and the lakes' ice white, the bare hardwoods grey-white over it,
#     the conifers mostly dark;
#   - THE CANOPY CLOSE TO: over the forest, the photo's olive-grey (NAIP's) saturated back to a living green and darkened to a canopy's
#     (~0.03–0.06 of the light back, as from the side: ×0.42), and
#     a tile of crowns 64 m across (farland_canopy_a/_n.png from build_farland.py: their lit tops and dark gaps, and at half strength
#     their normals catching the sun) — taken from above, the photo read lawn-pale on the hills, darkened alone it went haze-grey;
#   - the skirt past the photo (its UV −1): the forest's average colour.
# Opaque, lit, rough; marked for Nanite.
#   UnrealEditor-Cmd.exe G:\HotBrookUE\HotBrook.uproject -run=pythonscript -script=G:/HotBrookUE/Scripts/make_farland_material.py
import unreal
L = unreal.MaterialEditingLibrary
EAL = unreal.EditorAssetLibrary
tools = unreal.AssetToolsHelpers.get_asset_tools()
path = '/Game/HotBrook/Materials/M_HB_FarLand'
bad = []
t = unreal.AssetImportTask(); t.filename = unreal.Paths.project_dir() + 'Import/landmarks/farland_photo.jpg'; t.destination_path = '/Game/HotBrook/Textures'
t.destination_name = 'T_FarLand'; t.automated = True; t.replace_existing = True; t.save = False
tools.import_asset_tasks([t])
tex = unreal.load_asset('/Game/HotBrook/Textures/T_FarLand')
if tex: tex.set_editor_property('max_texture_size', 4096); EAL.save_asset('/Game/HotBrook/Textures/T_FarLand')
else: bad.append('T_FarLand import')
def import_detail(file, dest, normal):
    t = unreal.AssetImportTask(); t.filename = unreal.Paths.project_dir() + 'Import/landmarks/' + file; t.destination_path = '/Game/HotBrook/Textures'
    t.destination_name = dest; t.automated = True; t.replace_existing = True; t.save = False
    tools.import_asset_tasks([t]); d = unreal.load_asset('/Game/HotBrook/Textures/' + dest)
    if not d: bad.append(dest + ' import'); return None
    if normal: d.set_editor_property('compression_settings', unreal.TextureCompressionSettings.TC_NORMALMAP); d.set_editor_property('srgb', False)
    else: d.set_editor_property('compression_settings', unreal.TextureCompressionSettings.TC_GRAYSCALE); d.set_editor_property('srgb', False)
    EAL.save_asset('/Game/HotBrook/Textures/' + dest); return d
tex_n = import_detail('farland_canopy_n.png', 'T_FarCanopyN', True)
tex_a = import_detail('farland_canopy_a.png', 'T_FarCanopyA', False)
if EAL.does_asset_exist(path): EAL.delete_asset(path)
m = tools.create_asset('M_HB_FarLand', '/Game/HotBrook/Materials', unreal.Material, unreal.MaterialFactoryNew())
for p, v in (('used_with_nanite', True), ('used_with_static_lighting', False)):
    try: m.set_editor_property(p, v)
    except Exception as ex: bad.append('%s: %s' % (p, ex))
def node(cls, x, y): return L.create_material_expression(m, cls, x, y)
def link(a, ao, b, bi):
    if not L.connect_material_expressions(a, ao, b, bi): bad.append('%s.%s -> %s.%s' % (a.get_name(), ao, b.get_name(), bi))
def scalar(name, v, x, y):
    s = node(unreal.MaterialExpressionScalarParameter, x, y); s.set_editor_property('parameter_name', name); s.set_editor_property('default_value', v); return s
CODE = r'''
float3 c = (UV.x < -0.5) ? float3(0.098, 0.131, 0.094) : C;   // (the skirt: the forest's average, linear)
float l = dot(pow(max(c, 0.0), 1.0 / 2.2), float3(0.3, 0.59, 0.11));   // (read in the photo's own sRGB terms)
float water = 1.0 - smoothstep(0.10, 0.15, l);
float open = smoothstep(0.42, 0.50, l) * (1.0 - water);
float hw = smoothstep(0.29, 0.40, l) * (1.0 - water) * (1.0 - open);   // (the canopy's hardwood share: its lighter, yellower greens)
float n = frac(sin(dot(floor(P.xy / 9000.0), float2(12.9898, 78.233))) * 43758.5453);   // (a stand ~90 m across)
float forest = 1.0 - max(water, open);
float lc = dot(c, float3(0.3, 0.59, 0.11));
float3 green = max(lc + (c - lc) * 1.8, 0.0);   // (the photo's olive-grey canopy back to a living green: NAIP greys it)
c = lerp(c, green * 0.42 * lerp(0.7, 1.15, A), forest);   // (the canopy from the side, ~0.03–0.06 of the light back: its gaps' shadow, its lit tops)
float3 aut = n < 0.4 ? lerp(float3(0.55, 0.10, 0.04), float3(0.75, 0.25, 0.05), n / 0.4) : lerp(float3(0.80, 0.42, 0.08), float3(0.78, 0.62, 0.15), (n - 0.4) / 0.6);
c = lerp(c, aut * (0.65 + 0.8 * l), Autumn * hw * 0.85);
c = lerp(c, float3(0.34, 0.31, 0.28) * (0.75 + 0.6 * l), Bare * hw * 0.85);
float sk = Snow * max(max(water, open * 0.95), lerp(0.18, 0.6, hw * Bare));
return lerp(c, float3(0.82, 0.85, 0.90), sk);
'''
ts = node(unreal.MaterialExpressionTextureSample, -900, 0)
if tex: ts.set_editor_property('texture', tex)
cu = node(unreal.MaterialExpressionCustom, -500, 0)
cu.set_editor_property('code', CODE); cu.set_editor_property('output_type', unreal.CustomMaterialOutputType.CMOT_FLOAT3)
ins = []
for nm in ('C', 'P', 'Autumn', 'Bare', 'Snow', 'UV', 'A'):
    ci = unreal.CustomInput(); ci.set_editor_property('input_name', nm); ins.append(ci)
cu.set_editor_property('inputs', ins)
rgb = node(unreal.MaterialExpressionComponentMask, -700, 0)
for ch in ('r', 'g', 'b'): rgb.set_editor_property(ch, True)
link(ts, 'RGB', rgb, ''); link(rgb, '', cu, 'C')
wp = node(unreal.MaterialExpressionWorldPosition, -900, 200); link(wp, '', cu, 'P')
link(scalar('Autumn', 0.0, -900, 300), '', cu, 'Autumn'); link(scalar('Bare', 0.0, -900, 380), '', cu, 'Bare')
mpc = unreal.load_asset('/Game/HotBrook/Materials/MPC_HB_Season')
sn = node(unreal.MaterialExpressionCollectionParameter, -900, 460)
if mpc: sn.set_editor_property('collection', mpc); sn.set_editor_property('parameter_name', 'Snow')
else: bad.append('no MPC_HB_Season (make_ground_material.py makes it)')
link(sn, '', cu, 'Snow')
tc = node(unreal.MaterialExpressionTextureCoordinate, -1100, 560); link(tc, '', cu, 'UV')
# (the crown tile in world space, 64 m: its brightness into the colour, its normals into the lighting where it is forest)
wxy = node(unreal.MaterialExpressionComponentMask, -1100, 650); wxy.set_editor_property('r', True); wxy.set_editor_property('g', True); link(wp, '', wxy, '')
duv = node(unreal.MaterialExpressionDivide, -950, 650); link(wxy, '', duv, 'A'); duv.set_editor_property('const_b', 6400.0)
ta = node(unreal.MaterialExpressionTextureSample, -800, 650)
if tex_a: ta.set_editor_property('texture', tex_a); ta.set_editor_property('sampler_type', unreal.MaterialSamplerType.SAMPLERTYPE_LINEAR_GRAYSCALE)
link(duv, '', ta, 'UVs')
am = node(unreal.MaterialExpressionComponentMask, -650, 650); am.set_editor_property('r', True); am.set_editor_property('g', False); am.set_editor_property('b', False); am.set_editor_property('a', False); link(ta, '', am, ''); link(am, '', cu, 'A')
tn = node(unreal.MaterialExpressionTextureSample, -800, 800)
if tex_n: tn.set_editor_property('texture', tex_n); tn.set_editor_property('sampler_type', unreal.MaterialSamplerType.SAMPLERTYPE_NORMAL)
link(duv, '', tn, 'UVs')
# (the normals only on the forest: the photo's luma in sRGB terms, as the code reads it)
fm = node(unreal.MaterialExpressionCustom, -650, 900); fm.set_editor_property('output_type', unreal.CustomMaterialOutputType.CMOT_FLOAT1)
fm.set_editor_property('code', 'float l = dot(pow(max(C, 0.0), 1.0 / 2.2), float3(0.3, 0.59, 0.11)); return (UV.x < -0.5) ? 1.0 : smoothstep(0.10, 0.15, l) * (1.0 - smoothstep(0.42, 0.50, l));')
fins = []
for nm in ('C', 'UV'):
    ci = unreal.CustomInput(); ci.set_editor_property('input_name', nm); fins.append(ci)
fm.set_editor_property('inputs', fins); link(rgb, '', fm, 'C'); link(tc, '', fm, 'UV')
nl = node(unreal.MaterialExpressionLinearInterpolate, -450, 800); nl.set_editor_property('const_a', 0.0)
flat = node(unreal.MaterialExpressionConstant3Vector, -650, 750); flat.set_editor_property('constant', unreal.LinearColor(0, 0, 1, 0))
half = node(unreal.MaterialExpressionMultiply, -450, 950); link(fm, '', half, 'A'); half.set_editor_property('const_b', 0.5)   # (half strength: whole, it read as rubble)
link(flat, '', nl, 'A'); link(tn, 'RGB', nl, 'B'); link(half, '', nl, 'Alpha')
if not L.connect_material_property(nl, '', unreal.MaterialProperty.MP_NORMAL): bad.append('normal')
if not L.connect_material_property(cu, '', unreal.MaterialProperty.MP_BASE_COLOR): bad.append('base colour')
r = node(unreal.MaterialExpressionConstant, -500, 250); r.set_editor_property('r', 0.95)
if not L.connect_material_property(r, '', unreal.MaterialProperty.MP_ROUGHNESS): bad.append('roughness')
sp = node(unreal.MaterialExpressionConstant, -500, 330); sp.set_editor_property('r', 0.25)
if not L.connect_material_property(sp, '', unreal.MaterialProperty.MP_SPECULAR): bad.append('specular')
L.recompile_material(m); EAL.save_asset(path, only_if_is_dirty=False)
unreal.log_warning('HB far land material: %s; problems: %s' % (path, bad or 'none'))
