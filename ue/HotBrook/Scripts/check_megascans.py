# check_megascans.py — what each imported scan's mesh actually wears: its material slots, their parent, and the textures the
# instance sets (a diagnostic for import_megascans.py; logs only).
#   UnrealEditor-Cmd.exe G:\HotBrookUE\HotBrook.uproject -run=pythonscript -script=G:/HotBrookUE/Scripts/check_megascans.py
import json, os
import unreal
L = unreal.MaterialEditingLibrary
man = json.load(open(os.path.join(unreal.Paths.project_dir(), 'Import', 'megascans_meshes.json')))
for name, e in man.items():
    m = unreal.load_asset(e['meshes'][0]['path'])
    mats = [s.get_editor_property('material_interface') for s in m.get_editor_property('static_materials')]
    mi = mats[0] if mats else None
    info = []
    if isinstance(mi, unreal.MaterialInstanceConstant):
        for p in L.get_texture_parameter_names(mi):
            t = L.get_material_instance_texture_parameter_value(mi, p)
            info.append('%s=%s' % (p, t.get_name() if t else None))
        parent = mi.get_editor_property('parent')
        unreal.log_warning('HB check %s: %d slots, %s (parent %s) %s' % (name, len(mats), mi.get_name(), parent.get_name() if parent else None, ', '.join(info)))
    else:
        unreal.log_warning('HB check %s: %d slots, material %s' % (name, len(mats), mi.get_name() if mi else None))
