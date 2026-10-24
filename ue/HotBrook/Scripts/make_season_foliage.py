# make_season_foliage.py — the hardwoods' leaves in autumn: for each deciduous species' trees in Import/forest_meshes.json (the paper
# birch, aspen, red maple, beech, alder, hazel, willows and the young hardwoods — not the conifers, not the snags), each foliage material
# their meshes wear gets a twin under /Game/HotBrook/Seasons, <name>_Season: a child of it with the Megaplants master's 'Seasons' switch
# on (MA_Foliage_Trees: the leaves coloured from its 'Season Color 1' and '2'). AHotBrookForest wears the twin, its colours set by the
# date, from the leaves' turning to their fall (a static switch can't be set in the game: the twin carries its own shaders), and the
# original in summer. The conifers' foliage gets its twin too: in winter, while snow lies, its 'turned' needles whitened (the same
# switch's colours set white: AHotBrookForest) — the snow on the boughs. Logs each twin it made.
#   UnrealEditor-Cmd.exe G:\HotBrookUE\HotBrook.uproject -run=pythonscript -script=G:/HotBrookUE/Scripts/make_season_foliage.py
import json, os
import unreal
L = unreal.MaterialEditingLibrary
EAL = unreal.EditorAssetLibrary
tools = unreal.AssetToolsHelpers.get_asset_tools()
DEST = '/Game/HotBrook/Seasons'
DECIDUOUS = ('4', '5', '6', '7', '8', '9', '10', '13')
CONIFERS = ('0', '1', '2', '3', '12')   # (the spruce, fir, pine, cedar and young conifers: their twins wear the snow — AHotBrookForest)
fm = json.load(open(os.path.join(unreal.Paths.project_dir(), 'Import', 'forest_meshes.json')))
done, made = set(), []
for sp in DECIDUOUS + CONIFERS:
    for path in fm.get(sp, []):
        mesh = unreal.load_asset(path.split('.')[0])
        if not mesh: continue
        mats = [m.get_editor_property('material_interface') for m in mesh.get_editor_property('materials')] if isinstance(mesh, unreal.SkeletalMesh) else \
               [m.get_editor_property('material_interface') for m in mesh.get_editor_property('static_materials')]
        for mi in mats:
            if not mi or 'Foliage' not in mi.get_name() or mi.get_path_name() in done: continue
            done.add(mi.get_path_name())
            name = mi.get_name() + '_Season'; dest = DEST + '/' + name
            if EAL.does_asset_exist(dest): EAL.delete_asset(dest)
            tw = tools.create_asset(name, DEST, unreal.MaterialInstanceConstant, unreal.MaterialInstanceConstantFactoryNew())
            L.set_material_instance_parent(tw, mi)
            L.set_material_instance_static_switch_parameter_value(tw, 'Seasons', True)
            L.set_material_instance_vector_parameter_value(tw, 'Season Color 1', unreal.LinearColor(0.75, 0.12, 0.03, 1))
            L.set_material_instance_vector_parameter_value(tw, 'Season Color 2', unreal.LinearColor(0.85, 0.6, 0.08, 1))
            L.update_material_instance(tw); EAL.save_asset(dest, only_if_is_dirty=False)
            made.append('%s (species %s) -> %s' % (mi.get_path_name().split('.')[0], sp, dest))
for m in made: unreal.log_warning('HB season: ' + m)
unreal.log_warning('HB season: %d twins' % len(made))
# THE BARE MONTHS' LEAVES: M_HB_Bare — masked away entirely (bare branches), but its colour a bare crown's twig grey-brown: far off,
# Nanite draws foliage as voxels, which take the material's colour and not its mask (black would leave dark masses on the hills)
BARE = DEST + '/M_HB_Bare'
if EAL.does_asset_exist(BARE): EAL.delete_asset(BARE)
b = tools.create_asset('M_HB_Bare', DEST, unreal.Material, unreal.MaterialFactoryNew())
b.set_editor_property('blend_mode', unreal.BlendMode.BLEND_MASKED); b.set_editor_property('two_sided', True)
for f in ('used_with_skeletal_mesh', 'used_with_nanite', 'used_with_instanced_static_meshes', 'used_with_voxels'): b.set_editor_property(f, True)
col = L.create_material_expression(b, unreal.MaterialExpressionConstant3Vector, -300, -100); col.set_editor_property('constant', unreal.LinearColor(0.16, 0.13, 0.11, 1))
L.connect_material_property(col, '', unreal.MaterialProperty.MP_BASE_COLOR)
rough = L.create_material_expression(b, unreal.MaterialExpressionConstant, -300, 50); rough.set_editor_property('r', 0.9); L.connect_material_property(rough, '', unreal.MaterialProperty.MP_ROUGHNESS)
op = L.create_material_expression(b, unreal.MaterialExpressionConstant, -300, 150); op.set_editor_property('r', 0.0); L.connect_material_property(op, '', unreal.MaterialProperty.MP_OPACITY_MASK)
L.recompile_material(b); EAL.save_asset(BARE, only_if_is_dirty=False)
unreal.log_warning('HB season: made ' + BARE)
