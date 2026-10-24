# inspect_megaplants.py — lists the vegetation packs added to the project (Quixel Megaplants under /Game/Megaplant_Library, and any
# other foliage packs): each finished plant asset's class, height, Nanite and wind skeleton, written to Import/megaplants_inventory.json
# so the forest's species can be matched to real models (ue/export/export_forest.mjs species codes -> Import/forest_meshes.json).
#   UnrealEditor-Cmd.exe G:\HotBrookUE\HotBrook.uproject -run=pythonscript -script=G:/HotBrookUE/Scripts/inspect_megaplants.py
import json, os, re
import unreal
reg = unreal.AssetRegistryHelpers.get_asset_registry()
out = []
for root in ['/Game/Megaplant_Library']:   # (other packs' meshes take a long while to build on first load: add them here when wanted)
    for a in reg.get_assets_by_path(root, recursive=True):
        cls = str(a.asset_class_path.asset_name)
        pkg = str(a.package_name)
        if cls not in ('StaticMesh', 'SkeletalMesh') or '/Instances/' in pkg: continue   # (the branch and leaf pieces a plant is built from)
        if not re.search(r'_[A-Z]$', str(a.asset_name)): continue   # (the finished variants only)
        e = {'path': pkg + '.' + str(a.asset_name), 'class': cls}
        m = unreal.load_asset(pkg)
        if m:
            try:
                b = m.get_bounds() if cls == 'StaticMesh' else m.get_bounds()
                e['size_cm'] = [round(b.box_extent.x * 2), round(b.box_extent.y * 2), round(b.box_extent.z * 2)]
                e['origin_z_cm'] = round(b.origin.z - b.box_extent.z)
            except Exception as ex: e['bounds_err'] = str(ex)
            try:
                ns = m.get_editor_property('nanite_settings'); e['nanite'] = bool(ns.get_editor_property('enabled'))
            except Exception: pass
            if cls == 'StaticMesh':
                try: e['lods'] = m.get_num_lods()
                except Exception: pass
        out.append(e)
path = os.path.join(unreal.Paths.project_dir(), 'Import', 'megaplants_inventory.json')
with open(path, 'w') as f: json.dump(out, f, indent=1)
for e in out: unreal.log_warning('HB plant %s' % json.dumps(e))
unreal.log_warning('HB megaplants inventory: %d plant meshes -> %s' % (len(out), path))
