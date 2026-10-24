# import_megascans.py — the Quixel Megascans 3-D scans the human added to the Fab library (ferns, grasses, mossy rocks and boulders, an
# embankment, small stones, mushrooms) into the project as Nanite static meshes, from the raw downloads the Epic launcher keeps
# (G:\EpicVaultCache\FabLibrary\<listing>\fbx\…: each variant's LOD0 FBX or the raw scan, and its 4K/8K JPEG maps):
#   - two master materials made here: M_MS_Rock (opaque: colour, normal, roughness, occlusion) and M_MS_Plant (masked, two-sided
#     foliage: the scan's opacity cuts the fronds and blades, its translucency map the light through them);
#   - per asset a material instance with its maps (capped at 2048² in memory) and its meshes (Nanite on; collision on the rocks);
#   - Import/megascans_meshes.json: name -> kind, mesh paths, size — what the ground-cover and shore scattering read.
# The scans stay out of the repository (Fab licence); this script is ours.
#   UnrealEditor-Cmd.exe G:\HotBrookUE\HotBrook.uproject -run=pythonscript -script=G:/HotBrookUE/Scripts/import_megascans.py
import glob, json, os, re
import unreal
L = unreal.MaterialEditingLibrary
EAL = unreal.EditorAssetLibrary
tools = unreal.AssetToolsHelpers.get_asset_tools()
VAULT = next((d for d in ('G:/EpicVaultCache/FabLibrary', 'C:/ProgramData/Epic/EpicGamesLauncher/VaultCache/FabLibrary') if os.path.isdir(d)), '')
DEST = '/Game/HotBrook/Megascans'
ASSETS = [   # (our name, the listing folder's prefix, kind)
    ('LadyFern', 'Lady_Fern-', 'plant'), ('BeechFern', 'Beech_Fern-', 'plant'),
    ('WildGrassA', 'Wild_Grass-50d9a417', 'plant'), ('WildGrassB', 'Wild_Grass-5848d16a', 'plant'), ('WheatGrass', 'Wheat_Grass-', 'plant'),
    ('MossyRocks', 'Mossy_Rocks-', 'rock'), ('MossyForestRock', 'Mossy_Forest_Rock-', 'rock'), ('MossyEmbankment', 'Mossy_Embankment-', 'rock'),
    ('SmallStones', 'Small_Stones_Pack-', 'rock'), ('BoleteMushrooms', 'Bolete_Mushrooms-', 'rock'),
]
bad = []
# (the legacy FBX importer, whose options these are — UE 5.8 sends FBX through Interchange by default)
unreal.SystemLibrary.execute_console_command(None, 'Interchange.FeatureFlags.Import.FBX 0')

# ---------- the master materials ----------
def master(name, plant):
    path = DEST + '/Materials/' + name
    if EAL.does_asset_exist(path): EAL.delete_asset(path)   # (made afresh each run, with its instances)
    m = tools.create_asset(name, DEST + '/Materials', unreal.Material, unreal.MaterialFactoryNew())
    # (drawn as Nanite instances: the usages must be set here — a game can't add them, it falls back to the default material)
    m.set_editor_property('used_with_nanite', True); m.set_editor_property('used_with_instanced_static_meshes', True)
    if plant:
        m.set_editor_property('blend_mode', unreal.BlendMode.BLEND_MASKED); m.set_editor_property('two_sided', True)
        m.set_editor_property('shading_model', unreal.MaterialShadingModel.MSM_TWO_SIDED_FOLIAGE)
    def tex(param, y, kind):
        t = L.create_material_expression(m, unreal.MaterialExpressionTextureSampleParameter2D, -600, y)
        t.set_editor_property('parameter_name', param)
        t.set_editor_property('sampler_type', {'color': unreal.MaterialSamplerType.SAMPLERTYPE_COLOR, 'normal': unreal.MaterialSamplerType.SAMPLERTYPE_NORMAL,
                                               'gray': unreal.MaterialSamplerType.SAMPLERTYPE_LINEAR_GRAYSCALE}[kind])
        t.set_editor_property('sampler_source', unreal.SamplerSourceMode.SSM_WRAP_WORLD_GROUP_SETTINGS)
        # (a default of the sampler's own type — the engine's colour default fails a normal or grayscale sampler's compile)
        if kind in DEFAULT_TEX: t.set_editor_property('texture', unreal.load_asset(DEFAULT_TEX[kind]))
        return t
    def out(a, ao, prop):
        if not L.connect_material_property(a, ao, prop): bad.append('%s %s.%s -> %s' % (name, a.get_name(), ao, prop))
    out(tex('BaseColor', -300, 'color'), 'RGB', unreal.MaterialProperty.MP_BASE_COLOR)
    out(tex('Normal', -100, 'normal'), 'RGB', unreal.MaterialProperty.MP_NORMAL)
    out(tex('Roughness', 100, 'gray'), 'R', unreal.MaterialProperty.MP_ROUGHNESS)
    out(tex('AO', 300, 'gray'), 'R', unreal.MaterialProperty.MP_AMBIENT_OCCLUSION)
    if plant:
        out(tex('Opacity', 500, 'gray'), 'R', unreal.MaterialProperty.MP_OPACITY_MASK)
        out(tex('Translucency', 700, 'color'), 'RGB', unreal.MaterialProperty.MP_SUBSURFACE_COLOR)
    L.recompile_material(m); EAL.save_asset(path)
    return m
DEFAULT_TEX = {'normal': '/Engine/EngineMaterials/DefaultNormal', 'gray': '/Engine/EngineMaterials/BaseFlattenGrayscaleMap'}
MASTER = {'rock': master('M_MS_Rock', False), 'plant': master('M_MS_Plant', True)}

# ---------- the textures ----------
REIMPORT = os.environ.get('HB_REIMPORT') == '1'
def existing(dest, file):
    name = os.path.splitext(os.path.basename(file))[0]
    return unreal.load_asset(dest + '/' + name) if not REIMPORT and EAL.does_asset_exist(dest + '/' + name) else None
def import_tex(file, dest, kind):
    ex = existing(dest, file)
    if ex: return ex
    t = unreal.AssetImportTask(); t.filename = file; t.destination_path = dest; t.automated = True; t.replace_existing = True; t.save = False
    tools.import_asset_tasks([t])
    paths = list(t.get_editor_property('imported_object_paths'))
    tex = unreal.load_asset(paths[0]) if paths else None
    if not tex: bad.append('texture ' + file); return None
    if kind == 'normal': tex.set_editor_property('compression_settings', unreal.TextureCompressionSettings.TC_NORMALMAP); tex.set_editor_property('srgb', False)
    elif kind == 'gray': tex.set_editor_property('compression_settings', unreal.TextureCompressionSettings.TC_GRAYSCALE); tex.set_editor_property('srgb', False)
    tex.set_editor_property('max_texture_size', 2048)
    EAL.save_asset(tex.get_path_name())
    return tex

# ---------- the meshes ----------
def import_mesh(file, dest, rock):
    ex = existing(dest, file)
    if ex: return [ex]
    t = unreal.AssetImportTask(); t.filename = file; t.destination_path = dest; t.automated = True; t.replace_existing = True; t.save = False
    o = unreal.FbxImportUI(); o.set_editor_property('import_mesh', True); o.set_editor_property('import_textures', False); o.set_editor_property('import_materials', False)
    o.set_editor_property('import_as_skeletal', False); o.set_editor_property('import_animations', False)
    sd = o.get_editor_property('static_mesh_import_data'); sd.set_editor_property('combine_meshes', True); sd.set_editor_property('auto_generate_collision', rock)
    try: sd.set_editor_property('build_nanite', True)
    except Exception: pass
    t.options = o
    tools.import_asset_tasks([t])
    return [unreal.load_asset(p) for p in t.get_editor_property('imported_object_paths')]

manifest = {}
for name, prefix, kind in ASSETS:
    dirs = sorted(glob.glob(os.path.join(VAULT, prefix + '*', 'fbx', '*', '*_extracted')))
    if not dirs: bad.append('missing ' + name); continue
    d = dirs[0]; dest = DEST + '/' + name
    maps = {}
    for key, kd in [('BaseColor', 'color'), ('Normal', 'normal'), ('Roughness', 'gray'), ('AO', 'gray'), ('Opacity', 'gray'), ('Translucency', 'color')]:
        f = [x for x in glob.glob(os.path.join(d, '*_%s.jpg' % key)) if 'Billboard' not in x]
        if f and (kind == 'plant' or key not in ('Opacity', 'Translucency')): maps[key] = import_tex(f[0], dest + '/Textures', kd)
    if EAL.does_asset_exist(dest + '/MI_' + name): EAL.delete_asset(dest + '/MI_' + name)
    mi = tools.create_asset('MI_' + name, dest, unreal.MaterialInstanceConstant, unreal.MaterialInstanceConstantFactoryNew())
    L.set_material_instance_parent(mi, MASTER[kind])
    for key, tex in maps.items():
        if tex: L.set_material_instance_texture_parameter_value(mi, key, tex)
    EAL.save_asset(mi.get_path_name())
    fbx = sorted(x for x in glob.glob(os.path.join(d, '*.fbx')) if not re.search(r'LOD[1-9]', x))
    meshes = []
    for f in fbx:
        for mesh in import_mesh(f, dest, kind == 'rock'):
            if not isinstance(mesh, unreal.StaticMesh): continue
            for i in range(len(mesh.get_editor_property('static_materials'))): mesh.set_material(i, mi)
            ns = mesh.get_editor_property('nanite_settings'); ns.set_editor_property('enabled', True); mesh.set_editor_property('nanite_settings', ns)
            EAL.save_asset(mesh.get_path_name())
            b = mesh.get_bounds(); meshes.append({'path': mesh.get_path_name(), 'size_cm': [round(b.box_extent.x * 2), round(b.box_extent.y * 2), round(b.box_extent.z * 2)],
                                                  'base_cm': round(b.origin.z - b.box_extent.z)})
    manifest[name] = {'kind': kind, 'meshes': meshes}
    unreal.log_warning('HB megascans %s: %d meshes, %d maps, e.g. %s' % (name, len(meshes), len(maps), meshes[0]['size_cm'] if meshes else '-'))
with open(os.path.join(unreal.Paths.project_dir(), 'Import', 'megascans_meshes.json'), 'w') as fh: json.dump(manifest, fh, indent=1)
unreal.log_warning('HB megascans imported: %d assets; problems: %s' % (len(manifest), bad or 'none'))
