# import_camps.py — the camps' buildings and docks (ue/export/build_camps.py: Import/camps/*.glb) into the project, with their materials:
#   - the texture sets (Import/textures/<slot>/, CC0 from ambientCG and Poly Haven — their manifest.json: maps, normal convention, the
#     real size a tile covers) into /Game/HotBrook/Camps/Textures/<slot>/: colour maps sRGB, the rest linear, normal maps as normals
#     (an OpenGL one's green flipped);
#   - one master material, M_HB_Building: its maps sampled at the surface's metres over the tile's real size (UV0 is in metres), the
#     colour either the texture's own times the vertex colour about white (wood, stone, brick, shingles) or, for a painted surface,
#     the texture's shading (its brightness over its mean) times the paint in the vertex colour; roughness, metalness, AO from the maps
#     or constants; and M_HB_Glass (dark, glossy: a window by day);
#   - an instance for each kind of surface the builder names (Siding_lap, Roof_metal, Trim, Glass, Deck, …: MI_HB_<kind>);
#   - each .glb through Interchange into /Game/HotBrook/Camps/Meshes/SM_<name>, its slots given those instances, Nanite on, collision
#     from its own triangles (the walker climbs the steps and walks the decks and docks).
# The textures stay out of the repo (downloads); this script is ours. Run after build_camps.py:
#   UnrealEditor-Cmd.exe G:\HotBrookUE\HotBrook.uproject -run=pythonscript -script=G:/HotBrookUE/Scripts/import_camps.py
import glob, json, os
import unreal
L = unreal.MaterialEditingLibrary
EAL = unreal.EditorAssetLibrary
tools = unreal.AssetToolsHelpers.get_asset_tools()
PROJ = unreal.Paths.project_dir()
SRC = os.path.join(PROJ, 'Import', 'camps'); TEX = os.path.join(PROJ, 'Import', 'textures')
DEST = '/Game/HotBrook/Camps'
bad = []

# ---------- the textures ----------
man = json.load(open(os.path.join(TEX, 'manifest.json'), encoding='utf-8')) if os.path.exists(os.path.join(TEX, 'manifest.json')) else {}   # (none yet: the vertex colours alone)
means = json.load(open(os.path.join(TEX, 'means.json'), encoding='utf-8')) if os.path.exists(os.path.join(TEX, 'means.json')) else {}
TX = {}
def import_tex(slot, key, fname, srgb, normal=False, flip=False):
    path = os.path.join(TEX, slot, fname); dest = DEST + '/Textures/' + slot
    t = unreal.AssetImportTask(); t.filename = path; t.destination_path = dest; t.automated = True; t.replace_existing = True; t.save = False
    tools.import_asset_tasks([t])
    name = os.path.splitext(os.path.basename(fname))[0].replace('.', '_').replace(' ', '_').replace('-', '_')
    a = None
    for p in EAL.list_assets(dest, recursive=False, include_folder=False):
        x = unreal.load_asset(p)
        if isinstance(x, unreal.Texture2D) and x.get_name().lower() == name.lower(): a = x
    if not a: bad.append('texture %s/%s' % (slot, fname)); return None
    a.set_editor_property('srgb', srgb)
    if normal:
        a.set_editor_property('compression_settings', unreal.TextureCompressionSettings.TC_NORMALMAP)
        a.set_editor_property('flip_green_channel', flip)
    elif not srgb: a.set_editor_property('compression_settings', unreal.TextureCompressionSettings.TC_MASKS)
    EAL.save_asset(a.get_path_name())
    return a
for slot, m in man.items():
    f = m.get('files', {}); d = {}
    if f.get('basecolor'): d['BaseColor'] = import_tex(slot, 'BaseColor', f['basecolor'], True)
    if f.get('normal'): d['Normal'] = import_tex(slot, 'Normal', f['normal'], False, normal=True, flip=(m.get('files', {}).get('normal_convention', 'DX').upper() == 'GL'))
    if f.get('roughness'): d['Roughness'] = import_tex(slot, 'Roughness', f['roughness'], False)
    if f.get('ao'): d['AO'] = import_tex(slot, 'AO', f['ao'], False)
    if f.get('metalness'): d['Metalness'] = import_tex(slot, 'Metalness', f['metalness'], False)
    TX[slot] = {k: v for k, v in d.items() if v}

# ---------- the master materials ----------
def new_material(name):
    path = DEST + '/Materials/' + name
    if EAL.does_asset_exist(path): EAL.delete_asset(path)
    return tools.create_asset(name, DEST + '/Materials', unreal.Material, unreal.MaterialFactoryNew()), path
def builder(m, tag):
    def node(cls, x, y): return L.create_material_expression(m, cls, x, y)
    def link(a, ao, b, bi):
        if not L.connect_material_expressions(a, ao, b, bi): bad.append('%s %s.%s -> %s.%s' % (tag, a.get_class().get_name(), ao, b.get_class().get_name(), bi))
    def out(a, ao, prop):
        if not L.connect_material_property(a, ao, prop): bad.append('%s %s.%s -> %s' % (tag, a.get_class().get_name(), ao, prop))
    def const(v, x, y): c = node(unreal.MaterialExpressionConstant, x, y); c.set_editor_property('r', v); return c
    def scalar(name, v, x, y): s = node(unreal.MaterialExpressionScalarParameter, x, y); s.set_editor_property('parameter_name', name); s.set_editor_property('default_value', v); return s
    def vec(name, v, x, y): s = node(unreal.MaterialExpressionVectorParameter, x, y); s.set_editor_property('parameter_name', name); s.set_editor_property('default_value', unreal.LinearColor(*v)); return s
    def op(cls, a, ao, b, bo, x, y): n = node(cls, x, y); link(a, ao, n, 'A'); link(b, bo, n, 'B'); return n
    def tex(name, x, y, uv, sampler=None, default=None):
        t = node(unreal.MaterialExpressionTextureSampleParameter2D, x, y); t.set_editor_property('parameter_name', name)
        if sampler is not None: t.set_editor_property('sampler_type', sampler)
        if default: t.set_editor_property('texture', unreal.load_asset(default))
        link(uv, '', t, 'UVs'); return t
    def lerp(a, ao, b, bo, alpha, x, y): n = node(unreal.MaterialExpressionLinearInterpolate, x, y); link(a, ao, n, 'A'); link(b, bo, n, 'B'); link(alpha, '', n, 'Alpha'); return n
    return node, link, out, const, scalar, vec, op, tex, lerp

def building_master():
    m, path = new_material('M_HB_Building')
    node, link, out, const, scalar, vec, op, tex, lerp = builder(m, 'building')
    M = unreal.MaterialExpressionMultiply; D = unreal.MaterialExpressionDivide; A = unreal.MaterialExpressionAdd
    # the UV: the surface's metres over the tile's real size, turned a quarter where the texture's grain runs the other way
    uv0 = node(unreal.MaterialExpressionTextureCoordinate, -2200, 0)
    sw = node(unreal.MaterialExpressionComponentMask, -2000, 100); sw.set_editor_property('r', False); sw.set_editor_property('g', True); link(uv0, '', sw, '')
    su = node(unreal.MaterialExpressionComponentMask, -2000, 0); su.set_editor_property('r', True); su.set_editor_property('g', False); link(uv0, '', su, '')
    swapped = node(unreal.MaterialExpressionAppendVector, -1800, 100); link(sw, '', swapped, 'A'); link(su, '', swapped, 'B')
    uvr = lerp(uv0, '', swapped, '', scalar('Rotate90', 0.0, -1800, 250), -1600, 50)
    size = vec('TileSize', (2.0, 2.0, 0, 0), -1600, 250)
    sm = node(unreal.MaterialExpressionComponentMask, -1400, 250); sm.set_editor_property('r', True); sm.set_editor_property('g', True); link(size, '', sm, '')
    uv = op(D, uvr, '', sm, '', -1200, 100)
    bc = tex('BaseColor', -900, -300, uv, default='/Engine/EngineResources/WhiteSquareTexture')
    vc = node(unreal.MaterialExpressionVertexColor, -900, -500)
    tint = vec('Tint', (1, 1, 1, 1), -900, -650)
    # natural: texture × vertex colour; painted: (texture's brightness / its mean) × the paint in the vertex colour
    lum = node(unreal.MaterialExpressionDesaturation, -650, -200); link(bc, 'RGB', lum, '')
    shade = node(unreal.MaterialExpressionClamp, -450, -200)
    link(op(D, lum, '', scalar('TexMean', 0.5, -650, -50), '', -500, -120), '', shade, '')
    shade.set_editor_property('min_default', 0.0); shade.set_editor_property('max_default', 2.0)
    natural = op(M, bc, 'RGB', vc, '', -450, -400)
    painted = op(M, shade, '', vc, '', -300, -250)
    base = lerp(natural, '', painted, '', scalar('Paint', 0.0, -300, -100), -150, -300)
    out(op(M, base, '', tint, 'RGB', 0, -350), '', unreal.MaterialProperty.MP_BASE_COLOR)
    nm = tex('Normal', -900, 50, uv, sampler=unreal.MaterialSamplerType.SAMPLERTYPE_NORMAL, default='/Engine/EngineMaterials/DefaultNormal')
    flat = node(unreal.MaterialExpressionConstant3Vector, -650, 200); flat.set_editor_property('constant', unreal.LinearColor(0, 0, 1, 1))
    out(lerp(flat, '', nm, 'RGB', scalar('NormalStrength', 1.0, -650, 300), -450, 150), '', unreal.MaterialProperty.MP_NORMAL)
    rg = tex('Roughness', -900, 400, uv, sampler=unreal.MaterialSamplerType.SAMPLERTYPE_MASKS, default='/Engine/EngineResources/WhiteSquareTexture')
    rr = op(A, op(M, rg, 'R', scalar('RoughnessScale', 1.0, -650, 500), '', -450, 420), '', scalar('RoughnessAdd', 0.0, -650, 600), '', -300, 450)
    rc = node(unreal.MaterialExpressionClamp, -150, 450); link(rr, '', rc, ''); rc.set_editor_property('min_default', 0.04); rc.set_editor_property('max_default', 1.0)
    out(rc, '', unreal.MaterialProperty.MP_ROUGHNESS)
    mt = tex('Metalness', -900, 750, uv, sampler=unreal.MaterialSamplerType.SAMPLERTYPE_MASKS, default='/Engine/EngineResources/WhiteSquareTexture')
    out(op(M, mt, 'R', scalar('Metallic', 0.0, -650, 850), '', -450, 780), '', unreal.MaterialProperty.MP_METALLIC)
    ao = tex('AO', -900, 1050, uv, sampler=unreal.MaterialSamplerType.SAMPLERTYPE_MASKS, default='/Engine/EngineResources/WhiteSquareTexture')
    out(lerp(const(1.0, -650, 1150), '', ao, 'R', scalar('AOStrength', 1.0, -650, 1250), -450, 1100), '', unreal.MaterialProperty.MP_AMBIENT_OCCLUSION)
    out(scalar('Specular', 0.5, -300, 1300), '', unreal.MaterialProperty.MP_SPECULAR)
    L.recompile_material(m); EAL.save_asset(path); return m

def glass_master():
    m, path = new_material('M_HB_Glass')
    node, link, out, const, scalar, vec, op, tex, lerp = builder(m, 'glass')
    out(vec('Color', (0.012, 0.014, 0.016, 1), -400, 0), '', unreal.MaterialProperty.MP_BASE_COLOR)
    out(const(0.0, -400, 150), '', unreal.MaterialProperty.MP_METALLIC)
    out(scalar('Roughness', 0.06, -400, 250), '', unreal.MaterialProperty.MP_ROUGHNESS)
    out(scalar('Specular', 0.5, -400, 350), '', unreal.MaterialProperty.MP_SPECULAR)
    # (a lit window by night: AHotBrookCamps sets the custom primitive data later; 0 by day)
    out(op(unreal.MaterialExpressionMultiply, vec('Lamp', (1.0, 0.55, 0.25, 1), -400, 500), '', scalar('LampOn', 0.0, -400, 650), '', -150, 550), '', unreal.MaterialProperty.MP_EMISSIVE_COLOR)
    L.recompile_material(m); EAL.save_asset(path); return m

BM = building_master(); GM = glass_master()

# ---------- the kinds of surface ----------
# kind -> (texture slot, paint?, extra: tile scale, rotate, roughness add/scale, metallic, tint, normal strength)
KINDS = {
    'Siding_lap':       ('siding_lap', True, {}),
    'Siding_board':     ('siding_board', False, {}),
    'Siding_log':       ('siding_log', False, {'rot': True, 'size': (1.75, 1.75)}),   # (its logs run up the texture: turned; 25-cm logs)
    'Siding_trailer':   ('siding_lap', True, {'scale': 0.7, 'rough_add': -0.15}),
    'Roof_metal':       ('roof_metal', True, {}),
    'Roof_shingle':     ('roof_shingle', False, {'size': (2.0, 2.0), 'rough_add': 0.15}),   # (slate tiles for shingles: 3-tab courses, dull)
    'Trim':             ('trim_paint', True, {}),
    'Door':             ('trim_paint', True, {'rough_add': -0.1}),
    'Foundation_block': ('foundation_block', False, {'size': (1.6, 1.6), 'tint': (2.6, 2.6, 2.5, 1)}),   # (20-cm US block courses; the scan's weathered block lightened to newer grey)
    'Foundation_stone': ('stone_wall', False, {}),
    'Brick':            ('brick', False, {}),
    'Stone':            ('stone_wall', False, {}),
    'Deck':             ('deck_planks', False, {}),
    'Alu':              ('metal_alu', False, {'metallic': 1.0}),
    'PipeMetal':        ('metal_alu', False, {'metallic': 0.6, 'tint': (0.06, 0.06, 0.065, 1), 'rough_add': 0.25}),
    'Road':             ('gravel_road', False, {}),   # (AHotBrookCamps' roads: the vertex colours tint the tracks, the crown, the verges)
}
MI = {}
for kind, (slot, paint, x) in KINDS.items():
    path = DEST + '/Materials/MI_HB_' + kind
    if EAL.does_asset_exist(path): EAL.delete_asset(path)
    mi = tools.create_asset('MI_HB_' + kind, DEST + '/Materials', unreal.MaterialInstanceConstant, unreal.MaterialInstanceConstantFactoryNew())
    L.set_material_instance_parent(mi, BM)
    t = TX.get(slot, {})
    if not t: bad.append('no textures for %s (%s)' % (kind, slot))
    for k, v in t.items(): L.set_material_instance_texture_parameter_value(mi, k, v)
    mm = man.get(slot, {}); sz = x.get('size') or mm.get('size_m') or [2.0, 2.0]; s = x.get('scale', 1.0)
    L.set_material_instance_vector_parameter_value(mi, 'TileSize', unreal.LinearColor(sz[0] * s, sz[1] * s, 0, 0))
    L.set_material_instance_scalar_parameter_value(mi, 'Rotate90', 1.0 if x.get('rot') else 0.0)
    L.set_material_instance_scalar_parameter_value(mi, 'Paint', 1.0 if paint else 0.0)
    L.set_material_instance_scalar_parameter_value(mi, 'TexMean', float(means.get(slot, 0.5)))
    L.set_material_instance_scalar_parameter_value(mi, 'RoughnessAdd', x.get('rough_add', 0.0))
    L.set_material_instance_scalar_parameter_value(mi, 'Metallic', x.get('metallic', 0.0) if 'Metalness' not in t else 1.0)
    if 'tint' in x: L.set_material_instance_vector_parameter_value(mi, 'Tint', unreal.LinearColor(*x['tint']))
    EAL.save_asset(path); MI[kind] = mi
gp = DEST + '/Materials/MI_HB_Glass'
if EAL.does_asset_exist(gp): EAL.delete_asset(gp)
MI['Glass'] = tools.create_asset('MI_HB_Glass', DEST + '/Materials', unreal.MaterialInstanceConstant, unreal.MaterialInstanceConstantFactoryNew())
L.set_material_instance_parent(MI['Glass'], GM); EAL.save_asset(gp)

# ---------- the meshes ----------
MD = DEST + '/Meshes'
if EAL.does_directory_exist(MD): EAL.delete_directory(MD)   # (made afresh each run)
made = 0
for f in sorted(glob.glob(os.path.join(SRC, '*.glb'))):
    name = os.path.splitext(os.path.basename(f))[0]; tmp = MD + '/_in/' + name
    t = unreal.AssetImportTask(); t.filename = f; t.destination_path = tmp; t.automated = True; t.replace_existing = True; t.save = False
    tools.import_asset_tasks([t])
    meshes = [unreal.load_asset(p) for p in EAL.list_assets(tmp, recursive=True, include_folder=False)]
    meshes = [a for a in meshes if isinstance(a, unreal.StaticMesh)]
    if not meshes: bad.append('no mesh from ' + name); continue
    mesh = meshes[0]
    EAL.rename_asset(mesh.get_path_name(), MD + '/SM_' + name); mesh = unreal.load_asset(MD + '/SM_' + name)
    for i, sm in enumerate(mesh.get_editor_property('static_materials')):
        k = str(sm.get_editor_property('material_slot_name'))
        k = max((kk for kk in MI if kk.lower() in k.lower()), key=len, default=None)   # (Interchange may prefix the glTF's names)
        if k: mesh.set_material(i, MI[k])
        else: bad.append('%s: no material for slot %s' % (name, sm.get_editor_property('material_slot_name')))
    ns = mesh.get_editor_property('nanite_settings'); ns.set_editor_property('enabled', True); mesh.set_editor_property('nanite_settings', ns)
    bs = mesh.get_editor_property('body_setup')
    if bs: bs.set_editor_property('collision_trace_flag', unreal.CollisionTraceFlag.CTF_USE_COMPLEX_AS_SIMPLE)
    EAL.save_asset(mesh.get_path_name()); made += 1
    EAL.delete_directory(tmp)   # (Interchange's own materials and the empty folder)
EAL.save_directory(DEST)
unreal.log_warning('HB camps imported: %d meshes, %d materials; problems: %s' % (made, len(MI), bad or 'none'))
