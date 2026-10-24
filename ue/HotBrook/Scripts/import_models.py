# import_models.py — the animals' and the boat's models made uniform by ue/export/convert_models.py (Import/models/<name>.glb: a fish
# 1 m long along +X, its back up; a bird, a boat at its real size on its base) into the project:
#   - each .glb through Interchange into /Game/HotBrook/Models/<name>/: its mesh renamed SM_<name>, its textures;
#   - the fish's master material made here, M_HB_Fish: the model's colour and normal maps, wet-skin roughness, and the swim — the
#     body bent side to side by a wave that runs head to tail, growing toward the tail (to ~7% of the length at its tip: a
#     carangiform swimmer's tail beat; Videler 1993), its phase and strength per fish from the instance's custom data (0: the
#     phase, radians, advanced by the game at the fish's tail-beat rate; 1: the strength, ~1 cruising);
#   - per fish a material instance MI_<name> with its maps (no LODs yet: the engine's reduction isn't reachable from a commandlet —
#     each fish is ~12,000 triangles, cut so in Blender);
#   - the birds and the boat keep the materials Interchange made from their glTF.
# The models stay out of the repository (their licences; two are game rips the human uses privately); this script is ours.
#   UnrealEditor-Cmd.exe G:\HotBrookUE\HotBrook.uproject -run=pythonscript -script=G:/HotBrookUE/Scripts/import_models.py
import glob, json, os
import unreal
L = unreal.MaterialEditingLibrary
EAL = unreal.EditorAssetLibrary
tools = unreal.AssetToolsHelpers.get_asset_tools()
SRC = os.path.join(unreal.Paths.project_dir(), 'Import', 'models')
DEST = '/Game/HotBrook/Models'
FISH = ('smallmouth_bass', 'chain_pickerel', 'brown_bullhead', 'blacknose_dace', 'yellow_perch', 'white_sucker', 'banded_killifish',
        'white_perch', 'pumpkinseed')
bad = []

# ---------- the fish's master material ----------
def fish_master():
    path = DEST + '/Materials/M_HB_Fish'
    if EAL.does_asset_exist(path): EAL.delete_asset(path)
    m = tools.create_asset('M_HB_Fish', DEST + '/Materials', unreal.Material, unreal.MaterialFactoryNew())
    m.set_editor_property('used_with_instanced_static_meshes', True)
    def node(cls, x, y): return L.create_material_expression(m, cls, x, y)
    def link(a, ao, b, bi):
        if not L.connect_material_expressions(a, ao, b, bi): bad.append('fish %s.%s -> %s.%s' % (a.get_class().get_name(), ao, b.get_class().get_name(), bi))
    def out(a, ao, prop):
        if not L.connect_material_property(a, ao, prop): bad.append('fish %s.%s -> %s' % (a.get_class().get_name(), ao, prop))
    def const(v, x, y): c = node(unreal.MaterialExpressionConstant, x, y); c.set_editor_property('r', v); return c
    def scalar(name, v, x, y): s = node(unreal.MaterialExpressionScalarParameter, x, y); s.set_editor_property('parameter_name', name); s.set_editor_property('default_value', v); return s
    def op(cls, a, ao, b, bo, x, y):
        n = node(cls, x, y); link(a, ao, n, 'A'); link(b, bo, n, 'B'); return n
    # the look: its colour (tinted), its normal map, wet skin
    bc = node(unreal.MaterialExpressionTextureSampleParameter2D, -700, -400); bc.set_editor_property('parameter_name', 'BaseColor')
    tint = node(unreal.MaterialExpressionVectorParameter, -700, -200); tint.set_editor_property('parameter_name', 'Tint'); tint.set_editor_property('default_value', unreal.LinearColor(1, 1, 1, 1))
    out(op(unreal.MaterialExpressionMultiply, bc, 'RGB', tint, '', -400, -300), '', unreal.MaterialProperty.MP_BASE_COLOR)
    nm = node(unreal.MaterialExpressionTextureSampleParameter2D, -700, 0); nm.set_editor_property('parameter_name', 'Normal')
    nm.set_editor_property('sampler_type', unreal.MaterialSamplerType.SAMPLERTYPE_NORMAL); nm.set_editor_property('texture', unreal.load_asset('/Engine/EngineMaterials/DefaultNormal'))
    out(nm, 'RGB', unreal.MaterialProperty.MP_NORMAL)
    out(scalar('Roughness', 0.35, -400, 150), '', unreal.MaterialProperty.MP_ROUGHNESS)
    # the swim: u = 0 at the snout (+X, 50 cm out on the 1-m model) to 1 at the tail's tip; across its width (Y)
    #   A(u) * sin(2*pi*u - phase), A(u) = strength * TailAmp * 100 cm * (0.03 + 0.97 u^2) — then into the world (the instance's scale)
    lp = node(unreal.MaterialExpressionLocalPosition, -1500, 400)
    x = node(unreal.MaterialExpressionComponentMask, -1300, 400); x.set_editor_property('r', True); x.set_editor_property('g', False); x.set_editor_property('b', False); link(lp, '', x, '')
    u = node(unreal.MaterialExpressionSaturate, -900, 400)
    link(op(unreal.MaterialExpressionSubtract, const(0.5, -1300, 500), '', op(unreal.MaterialExpressionDivide, x, '', const(100.0, -1300, 600), '', -1100, 550), '', -1050, 450), '', u, '')
    ph = node(unreal.MaterialExpressionPerInstanceCustomData, -1300, 750); ph.set_editor_property('data_index', 0)
    st = node(unreal.MaterialExpressionPerInstanceCustomData, -1300, 900); st.set_editor_property('data_index', 1); st.set_editor_property('const_default_value', 1.0)
    arg = op(unreal.MaterialExpressionSubtract, op(unreal.MaterialExpressionMultiply, u, '', const(6.2832, -900, 550), '', -750, 450), '', ph, '', -600, 500)
    sn = node(unreal.MaterialExpressionSine, -450, 500); sn.set_editor_property('period', 6.2832); link(arg, '', sn, '')
    env = op(unreal.MaterialExpressionAdd, const(0.03, -750, 650), '', op(unreal.MaterialExpressionMultiply, op(unreal.MaterialExpressionMultiply, u, '', u, '', -750, 700), '', const(0.97, -750, 800), '', -600, 700), '', -450, 650)
    amp = op(unreal.MaterialExpressionMultiply, op(unreal.MaterialExpressionMultiply, st, '', scalar('TailAmp', 0.07, -600, 950), '', -450, 900), '', const(100.0, -450, 1000), '', -300, 900)
    side = op(unreal.MaterialExpressionMultiply, op(unreal.MaterialExpressionMultiply, sn, '', env, '', -300, 550), '', amp, '', -150, 700)
    v = node(unreal.MaterialExpressionAppendVector, 0, 700); link(const(0.0, -150, 600), '', v, 'A')
    v2 = node(unreal.MaterialExpressionAppendVector, 150, 700); link(v, '', v2, 'A'); link(side, '', v, 'B'); link(const(0.0, 0, 850), '', v2, 'B')
    tw = node(unreal.MaterialExpressionTransform, 300, 700)
    tw.set_editor_property('transform_source_type', unreal.MaterialVectorCoordTransformSource.TRANSFORMSOURCE_LOCAL)
    tw.set_editor_property('transform_type', unreal.MaterialVectorCoordTransform.TRANSFORM_WORLD)
    link(v2, '', tw, '')
    out(tw, '', unreal.MaterialProperty.MP_WORLD_POSITION_OFFSET)
    L.recompile_material(m); EAL.save_asset(path)
    return m
FISH_M = fish_master()

# ---------- the models ----------
def textures_in(folder):
    out = {}
    for p in EAL.list_assets(folder, recursive=True, include_folder=False):
        a = unreal.load_asset(p)
        if isinstance(a, unreal.Texture2D):
            n = a.get_name().lower()
            key = 'Normal' if 'normal' in n else 'MR' if ('rough' in n or 'metal' in n or 'pbr' in n) else 'BaseColor'
            out.setdefault(key, a)
    return out

manifest = {}
for f in sorted(glob.glob(os.path.join(SRC, '*.glb'))):
    name = os.path.splitext(os.path.basename(f))[0]; dest = DEST + '/' + name
    if EAL.does_directory_exist(dest): EAL.delete_directory(dest)   # (made afresh each run)
    t = unreal.AssetImportTask(); t.filename = f; t.destination_path = dest; t.automated = True; t.replace_existing = True; t.save = False
    tools.import_asset_tasks([t])
    meshes = [unreal.load_asset(p) for p in EAL.list_assets(dest, recursive=True, include_folder=False)]
    meshes = [a for a in meshes if isinstance(a, unreal.StaticMesh)]
    if not meshes: bad.append('no mesh from ' + name); continue
    mesh = meshes[0]
    if mesh.get_name() != 'SM_' + name:
        EAL.rename_asset(mesh.get_path_name(), dest + '/SM_' + name); mesh = unreal.load_asset(dest + '/SM_' + name)
    if name in FISH:
        tx = textures_in(dest)
        mi = tools.create_asset('MI_' + name, dest, unreal.MaterialInstanceConstant, unreal.MaterialInstanceConstantFactoryNew())
        L.set_material_instance_parent(mi, FISH_M)
        for key in ('BaseColor', 'Normal'):
            if key in tx: L.set_material_instance_texture_parameter_value(mi, key, tx[key])
        if 'BaseColor' not in tx: bad.append('no colour map for ' + name)
        EAL.save_asset(mi.get_path_name())
        for i in range(len(mesh.get_editor_property('static_materials'))): mesh.set_material(i, mi)
    ns = mesh.get_editor_property('nanite_settings'); ns.set_editor_property('enabled', False); mesh.set_editor_property('nanite_settings', ns)
    EAL.save_directory(dest)
    b = mesh.get_bounds()
    manifest[name] = {'mesh': mesh.get_path_name(), 'size_cm': [round(b.box_extent.x * 2, 1), round(b.box_extent.y * 2, 1), round(b.box_extent.z * 2, 1)]}
    unreal.log_warning('HB model %s: %s, %s cm' % (name, mesh.get_path_name(), manifest[name]['size_cm']))
with open(os.path.join(unreal.Paths.project_dir(), 'Import', 'models_meshes.json'), 'w') as fh: json.dump(manifest, fh, indent=1)
unreal.log_warning('HB models imported: %d; problems: %s' % (len(manifest), bad or 'none'))
