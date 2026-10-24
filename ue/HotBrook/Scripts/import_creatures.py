# import_creatures.py — the second batch of models (ue/export/convert_creatures.py and convert_people.py: Import/creatures/<name>.glb)
# into /Game/HotBrook/Creatures/<name>/ through Interchange:
#   - a skinned one as SK_<name>, its skeleton and one AnimSequence a clip (the ospreys', kingfishers', loon's and eagle's flight and
#     perch, the otter's swim, the anglers' sit / cast / reel / jig / walk);
#   - a scan as SM_<name> — the heavy ones (the turtles, the bullfrog, its tadpole) drawn by Nanite; the painted turtle wears its scan's
#     colour from its vertices (M_HB_VertexColour);
#   - every texture capped at 2048 (the bullfrog came with four 8k maps).
#   - every material marked for Nanite and instanced meshes (fix_usage.py), else the game draws it grey.
# Import/creatures_meshes.json lists each: its mesh, skeletal or not, its bounds (cm) and its clips by name — what the game loads.
# The models stay out of the repository (their licences — credited in ue/README.md); this script is ours.
#   UnrealEditor-Cmd.exe G:\HotBrookUE\HotBrook.uproject -run=pythonscript -script=G:/HotBrookUE/Scripts/import_creatures.py
import glob, json, os
import unreal
L = unreal.MaterialEditingLibrary
EAL = unreal.EditorAssetLibrary
tools = unreal.AssetToolsHelpers.get_asset_tools()
# (HB_SET=plants: the plants and the ground's pieces instead — convert_plants.py, build_reeds.py: Import/plants → /Game/HotBrook/Plants,
# Import/plants_meshes.json)
SET = os.environ.get('HB_SET', 'creatures')
SRC = os.path.join(unreal.Paths.project_dir(), 'Import', SET)
DEST = '/Game/HotBrook/' + SET.capitalize()
NANITE = ('snapping_turtle', 'painted_turtle', 'bullfrog', 'tadpole', 'stones_grass',   # (and the plants: thousands of them, their leaves cut-outs)
          'white_lily', 'lake_lily', 'lily_pads', 'pondweed', 'grass_lawn', 'grass_tuft_a', 'grass_tuft_b', 'fern_grass',
          'bass_boat', 'pontoon', 'utv',   # (HB_SET=vehicles: the camps' boats and machine)
          'turbine_tower', 'turbine_rotor')   # (HB_SET=landmarks: the wind farm's turbines)
VERTEX_COLOUR = ('painted_turtle',)
ONLY = [a for a in os.environ.get('HB_ONLY', '').split(',') if a]
bad = []

def vertex_colour_material():
    path = DEST + '/M_HB_VertexColour'
    if EAL.does_asset_exist(path): return unreal.load_asset(path)
    m = tools.create_asset('M_HB_VertexColour', DEST, unreal.Material, unreal.MaterialFactoryNew())
    vc = L.create_material_expression(m, unreal.MaterialExpressionVertexColor, -400, 0)
    if not L.connect_material_property(vc, '', unreal.MaterialProperty.MP_BASE_COLOR): bad.append('vertex colour base')
    r = L.create_material_expression(m, unreal.MaterialExpressionConstant, -400, 200); r.set_editor_property('r', 0.55)
    if not L.connect_material_property(r, '', unreal.MaterialProperty.MP_ROUGHNESS): bad.append('vertex colour roughness')
    L.recompile_material(m); EAL.save_asset(path)
    return m

manifest = {}
mpath = os.path.join(unreal.Paths.project_dir(), 'Import', SET + '_meshes.json')
if ONLY and os.path.exists(mpath):
    with open(mpath) as fh: manifest = json.load(fh)
for f in sorted(glob.glob(os.path.join(SRC, '*.glb'))):
    name = os.path.splitext(os.path.basename(f))[0]; dest = DEST + '/' + name
    if ONLY and name not in ONLY: continue
    if EAL.does_directory_exist(dest): EAL.delete_directory(dest)   # (made afresh each run)
    t = unreal.AssetImportTask(); t.filename = f; t.destination_path = dest; t.automated = True; t.replace_existing = True; t.save = False
    tools.import_asset_tasks([t])
    assets = [unreal.load_asset(p) for p in EAL.list_assets(dest, recursive=True, include_folder=False)]
    sk = [a for a in assets if isinstance(a, unreal.SkeletalMesh)]
    sm = [a for a in assets if isinstance(a, unreal.StaticMesh)]
    anims = [a for a in assets if isinstance(a, unreal.AnimSequence)]
    for a in assets:
        if isinstance(a, unreal.Texture2D):
            a.set_editor_property('max_texture_size', 2048); EAL.save_asset(a.get_path_name())
    if sk:
        mesh = sk[0]; pre = 'SK_'
    elif sm:
        mesh = sm[0]; pre = 'SM_'
    else:
        bad.append('no mesh from ' + name); continue
    if mesh.get_name() != pre + name:
        EAL.rename_asset(mesh.get_path_name(), dest + '/' + pre + name); mesh = unreal.load_asset(dest + '/' + pre + name)
    clips = {}
    for a in anims:
        n = a.get_name()
        clip = n.split('_Anim_')[-1] if '_Anim_' in n else n
        for k in ('sit', 'cast', 'reel', 'jig', 'walk', 'headTilt', 'wingFlap', 'fast_swim', 'Anim_0'):
            if k.lower() in n.lower(): clip = {'headTilt': 'idle', 'wingFlap': 'flap', 'fast_swim': 'swim', 'Anim_0': 'flap'}.get(k, k); break
        clips[clip] = a.get_path_name()
    if sm and not sk:
        if name in VERTEX_COLOUR:
            vm = vertex_colour_material()
            for i in range(len(mesh.get_editor_property('static_materials'))): mesh.set_material(i, vm)
        ns = mesh.get_editor_property('nanite_settings'); ns.set_editor_property('enabled', name in NANITE); mesh.set_editor_property('nanite_settings', ns)
    EAL.save_directory(dest)
    b = mesh.get_bounds()
    manifest[name] = {'mesh': mesh.get_path_name(), 'skeletal': bool(sk), 'size_cm': [round(b.box_extent.x * 2, 1), round(b.box_extent.y * 2, 1), round(b.box_extent.z * 2, 1)],
                      'origin_cm': [round(b.origin.x, 1), round(b.origin.y, 1), round(b.origin.z, 1)], 'clips': clips,
                      'materials': len(mesh.get_editor_property('materials' if sk else 'static_materials'))}
    unreal.log_warning('HB ' + SET[:-1] + ' %s: %s, %s cm at %s, clips %s' % (name, mesh.get_path_name(), manifest[name]['size_cm'], manifest[name]['origin_cm'], sorted(clips)))
with open(mpath, 'w') as fh: json.dump(manifest, fh, indent=1)
unreal.log_warning('HB %s imported: %d; problems: %s' % (SET, len(manifest), bad or 'none'))
# (their materials marked for Nanite and instanced meshes — in the game an unmarked one draws as Unreal's grey default: fix_usage.py)
import importlib.util
_spec = importlib.util.spec_from_file_location('fix_usage', os.path.join(unreal.Paths.project_dir(), 'Scripts', 'fix_usage.py'))
_fu = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(_fu); _fu.fix(DEST)
for f in _fu.fixed: unreal.log_warning('HB usage: ' + f)
