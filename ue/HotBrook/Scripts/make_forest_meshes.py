# make_forest_meshes.py — matches the forest's species (ue/export/export_forest.mjs codes) to the tree models imported into the project
# and writes Import/forest_meshes.json (species -> mesh paths) for AHotBrookForest. Quixel's Megaplants are European and Asian species,
# so each Maine tree takes its nearest look-alike: red spruce and balsam fir the Norway spruce (dense dark spires), white pine the Baltic
# (Scots) pine, northern white cedar the Japanese cypress (scale-leaved), paper birch the silver birch, quaking aspen the European aspen,
# red maple the Norway maple, American beech the European beech, speckled alder the black alder, beaked hazel the common hazel, the
# shore willows the goat willow, the snags the dead pine; the young hardwoods the maple, beech, rowan and aspen saplings. Each pack's finished
# variants (A, B, C … — skinned meshes Dynamic Wind bends, or static ones) are listed; the branch pieces they are built from are not.
#   UnrealEditor-Cmd.exe G:\HotBrookUE\HotBrook.uproject -run=pythonscript -script=G:/HotBrookUE/Scripts/make_forest_meshes.py
import json, os, re
import unreal
ML = '/Game/Megaplant_Library/'
SPECIES = {
    0: ['Tree_Norway_Spruce/Tree_Norway_Spruce_01'],          # red spruce
    1: ['Tree_Norway_Spruce/Tree_Norway_Spruce_01'],          # balsam fir
    2: ['Tree_Baltic_Pine/Tree_Baltic_Pine_01'],              # eastern white pine
    3: ['Tree_Japanese_Cypress/Tree_Japanese_Cypress_01'],    # northern white cedar
    4: ['Tree_Silver_Birch/Tree_Silver_Birch_01'],            # paper birch
    5: ['Tree_European_Aspen/Tree_European_Aspen_01'],        # quaking aspen
    6: ['Tree_Norway_Maple/Tree_Norway_Maple_Forest_01'],     # red maple
    7: ['Tree_European_Beech/Tree_European_Beech_01'],        # American beech
    8: ['Tree_Black_Alder/Tree_Black_Alder_01'],              # speckled alder
    9: ['Tree_Common_Hazel/Tree_Common_Hazel_01'],            # beaked hazel
    10: ['Tree_Goat_Willow/Tree_Goat_Willow_01'],             # willows
    11: ['Tree_Dead_Pine/Tree_Dead_Pine_01'],                 # snags
    12: ['Tree_Norway_Spruce/Tree_Norway_Spruce_01'],         # young conifers (until a conifer sapling pack is in)
    13: ['Tree_Norway_Maple/Tree_Norway_Maple_Saplings_01', 'Tree_European_Beech/Tree_EuropeanBeech_Saplings_01', 'Tree_Rowan/Tree_Rowan_Sapling_01',
         'Tree_European_Aspen/Tree_European_Aspen_Sapling_01'],
}
# the ground cover's plants from Megaplants (AHotBrookGroundCover): lowbush blueberry's stand-in the bilberry, the lingonberry, the
# forbs of the floor (Canada mayflower, starflower, bunchberry …) the wood anemone, the shore's low shrubs (sweetgale, leatherleaf:
# small leathery leaves, ~1 m) the huckleberry oak — the heather is in pink bloom, not a Maine shore —, the dead pine's bare pole
# variants the fallen logs
PLANTS = {
    'Bilberry': ['Plant_Bilberry/Plant_Bilberry_01'], 'Lingonberry': ['Plant_Lingonberry/Plant_LingonBerry01'],
    'WoodAnemone': ['Plant_Wood_Anemone/Plant_Wood_Anemone_01'], 'ShoreShrub': ['Shrub_Huckleberry_Oak/Shrub_Huckleberry_Oak_01'],
    'Log': ['Tree_Dead_Pine/Tree_Dead_Pine_01'],
}
reg = unreal.AssetRegistryHelpers.get_asset_registry()
out, report = {}, []
for sp, folders in SPECIES.items():
    paths = []
    for f in folders:
        for a in sorted(reg.get_assets_by_path(ML + f, recursive=False), key=lambda a: str(a.asset_name)):
            cls = str(a.asset_class_path.asset_name)
            # (the finished variants end _A, _B …; a pack's other meshes — a merged preview — don't)
            if cls in ('SkeletalMesh', 'StaticMesh') and re.search(r'_[A-Z]$', str(a.asset_name)): paths.append('%s.%s' % (a.package_name, a.asset_name))
    if paths: out[str(sp)] = paths
    report.append('%d: %d meshes (%s)' % (sp, len(paths), ', '.join(folders)))
plants = {}
for name, folders in PLANTS.items():
    paths = []
    for f in folders:
        for a in sorted(reg.get_assets_by_path(ML + f, recursive=False), key=lambda a: str(a.asset_name)):
            if str(a.asset_class_path.asset_name) in ('SkeletalMesh', 'StaticMesh') and re.search(r'_[A-Z]$', str(a.asset_name)): paths.append('%s.%s' % (a.package_name, a.asset_name))
    if name == 'Log': paths = [p for p in paths if p.endswith(('_D', '_E'))]   # (the bare poles: the snags fallen)
    if paths: plants[name] = paths
    report.append('ground %s: %d meshes' % (name, len(paths)))
with open(os.path.join(unreal.Paths.project_dir(), 'Import', 'groundcover_meshes.json'), 'w') as fh: json.dump(plants, fh, indent=1)
path = os.path.join(unreal.Paths.project_dir(), 'Import', 'forest_meshes.json')
with open(path, 'w') as fh: json.dump(out, fh, indent=1)
for r in report: unreal.log_warning('HB forest species ' + r)
unreal.log_warning('HB forest meshes: %d species mapped -> %s' % (len(out), path))
