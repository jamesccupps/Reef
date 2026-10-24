# import_animals.py — the forest's black bear and moose (downloaded by the human to Import/sketchfab: FBX, each a skinned body with
# its animations — the bear's 81 takes: walks, trot, run, sprint, standing, eating, sitting, lying; the moose's idle and walk) into
# /Game/HotBrook/Animals/<name>/ as a skeletal mesh, its skeleton, its materials and textures and one AnimSequence a take, through
# the FBX importer; Import/animals_meshes.json lists what came in (the mesh, its bounds, the takes) for AHotBrookAnimals.
# The bear's gaits carry it forward (their root moves): root motion is switched on for each take, so the game can lock the body in
# place and move it itself. M_HB_Invisible (masked away) is made for what an animal shouldn't show — a cow moose's antlers, a bull's
# after he drops them.
# These two are for the human's own use only (one is a game's model): never committed, published or credited as free models.
#   UnrealEditor-Cmd.exe G:\HotBrookUE\HotBrook.uproject -run=pythonscript -script=G:/HotBrookUE/Scripts/import_animals.py
import glob, json, os
import unreal
EAL = unreal.EditorAssetLibrary
tools = unreal.AssetToolsHelpers.get_asset_tools()
SRC = os.path.join(unreal.Paths.project_dir(), 'Import', 'sketchfab')
DEST = '/Game/HotBrook/Animals'
ANIMALS = {'bear': 'realistic-animated-bear-3d-model/**/*.fbx', 'moose': 'moose-realistic-3d-model-demo-free/**/*.fbx'}
unreal.SystemLibrary.execute_console_command(None, 'Interchange.FeatureFlags.Import.FBX 0')   # (the FBX importer these options are for)
bad = []; manifest = {}
L = unreal.MaterialEditingLibrary
def invisible():
    path = DEST + '/M_HB_Invisible'
    if EAL.does_asset_exist(path): return unreal.load_asset(path)
    m = tools.create_asset('M_HB_Invisible', DEST, unreal.Material, unreal.MaterialFactoryNew())
    m.set_editor_property('blend_mode', unreal.BlendMode.BLEND_MASKED); m.set_editor_property('used_with_skeletal_mesh', True)
    # (also the forest's bare hardwoods' leaves — AHotBrookForest: Nanite skinned trees, their foliage drawn as voxels far off)
    for f in ('used_with_nanite', 'used_with_instanced_static_meshes', 'used_with_voxels'): m.set_editor_property(f, True)
    c = L.create_material_expression(m, unreal.MaterialExpressionConstant, -300, 0); c.set_editor_property('r', 0.0)
    if not L.connect_material_property(c, '', unreal.MaterialProperty.MP_OPACITY_MASK): bad.append('M_HB_Invisible opacity')
    L.recompile_material(m); EAL.save_asset(path)
    return m
invisible()
for name, pattern in ANIMALS.items():
    files = sorted(glob.glob(os.path.join(SRC, pattern), recursive=True))
    if not files: bad.append('no FBX for ' + name); continue
    dest = DEST + '/' + name
    if EAL.does_directory_exist(dest): EAL.delete_directory(dest)
    t = unreal.AssetImportTask(); t.filename = files[0]; t.destination_path = dest; t.automated = True; t.replace_existing = True; t.save = False
    o = unreal.FbxImportUI()
    o.set_editor_property('import_mesh', True); o.set_editor_property('import_as_skeletal', True); o.set_editor_property('import_animations', True)
    o.set_editor_property('import_materials', True); o.set_editor_property('import_textures', True); o.set_editor_property('create_physics_asset', False)
    o.set_editor_property('mesh_type_to_import', unreal.FBXImportType.FBXIT_SKELETAL_MESH)
    sk = o.get_editor_property('skeletal_mesh_import_data'); sk.set_editor_property('import_morph_targets', False)
    an = o.get_editor_property('anim_sequence_import_data'); an.set_editor_property('animation_length', unreal.FBXAnimationLengthImportType.FBXALIT_EXPORTED_TIME)
    an.set_editor_property('import_bone_tracks', True)
    t.options = o
    tools.import_asset_tasks([t])
    assets = [unreal.load_asset(p) for p in EAL.list_assets(dest, recursive=True, include_folder=False)]
    meshes = [a for a in assets if isinstance(a, unreal.SkeletalMesh)]
    anims = sorted(a.get_name() for a in assets if isinstance(a, unreal.AnimSequence))
    if not meshes: bad.append('no skeletal mesh from ' + name); continue
    for a in assets:
        if isinstance(a, unreal.AnimSequence): unreal.AnimationLibrary.set_root_motion_enabled(a, True); EAL.save_asset(a.get_path_name())
    # (maps repainted for Maine — the bear a black bear, the moose darker: ue/export/recolor_animals.py — over the models' own, same names)
    for f in sorted(glob.glob(os.path.join(unreal.Paths.project_dir(), 'Import', 'animals_recolor', '*.png'))):
        if not EAL.does_asset_exist(dest + '/' + os.path.splitext(os.path.basename(f))[0]): continue
        rt = unreal.AssetImportTask(); rt.filename = f; rt.destination_path = dest; rt.automated = True; rt.replace_existing = True; rt.save = True
        tools.import_asset_tasks([rt]); unreal.log_warning('HB animal %s: repainted %s' % (name, os.path.basename(f)))
    # (fur is rough: the FBX's materials come with none set, and shone white where the sun glanced off a back)
    for a in assets:
        if isinstance(a, unreal.Material) and not L.get_material_property_input_node(a, unreal.MaterialProperty.MP_ROUGHNESS):
            c = L.create_material_expression(a, unreal.MaterialExpressionConstant, -400, 300); c.set_editor_property('r', 0.85)
            c2 = L.create_material_expression(a, unreal.MaterialExpressionConstant, -400, 400); c2.set_editor_property('r', 0.25)
            if not (L.connect_material_property(c, '', unreal.MaterialProperty.MP_ROUGHNESS) and L.connect_material_property(c2, '', unreal.MaterialProperty.MP_SPECULAR)): bad.append('roughness ' + a.get_name())
            L.recompile_material(a); EAL.save_asset(a.get_path_name())
    m = meshes[0]
    if m.get_name() != 'SK_' + name:
        EAL.rename_asset(m.get_path_name(), dest + '/SK_' + name); m = unreal.load_asset(dest + '/SK_' + name)
    EAL.save_directory(dest)
    b = m.get_bounds()
    manifest[name] = {'mesh': m.get_path_name(), 'size_cm': [round(b.box_extent.x * 2), round(b.box_extent.y * 2), round(b.box_extent.z * 2)],
                      'origin_cm': [round(b.origin.x), round(b.origin.y), round(b.origin.z)], 'anims': anims,
                      'materials': [s.get_editor_property('material_slot_name').__str__() for s in m.get_editor_property('materials')]}
    unreal.log_warning('HB animal %s: %s, %s cm, %d takes' % (name, m.get_path_name(), manifest[name]['size_cm'], len(anims)))
with open(os.path.join(unreal.Paths.project_dir(), 'Import', 'animals_meshes.json'), 'w') as fh: json.dump(manifest, fh, indent=1)
unreal.log_warning('HB animals imported: %d; problems: %s' % (len(manifest), bad or 'none'))
