# make_ground_material.py — a first ground for the landscape (/Game/HotBrook/Materials/M_Ground), until the Megascans surfaces are
# imported: the forest floor's browns and greens broken up by noise at two scales, grey rock on slopes past ~35°, wet dark mud and sand
# low by the water. World-space, so it tiles over the 5 × 10 km landscape without UVs.
#   UnrealEditor-Cmd.exe G:\HotBrookUE\HotBrook.uproject -run=pythonscript -script=G:/HotBrookUE/Scripts/make_ground_material.py
import unreal
L = unreal.MaterialEditingLibrary
tools = unreal.AssetToolsHelpers.get_asset_tools()
path, name = '/Game/HotBrook/Materials', 'M_Ground'
if unreal.EditorAssetLibrary.does_asset_exist(path + '/' + name): unreal.EditorAssetLibrary.delete_asset(path + '/' + name)
m = tools.create_asset(name, path, unreal.Material, unreal.MaterialFactoryNew())
def node(cls, x, y): return L.create_material_expression(m, cls, x, y)
def const3(r, g, b, x, y):
    n = node(unreal.MaterialExpressionConstant3Vector, x, y); n.set_editor_property('constant', unreal.LinearColor(r, g, b, 1)); return n
wp = node(unreal.MaterialExpressionWorldPosition, -1600, 0)
def noise(scale, x, y):   # (gradient noise of the world position at a scale, 0–1)
    n = node(unreal.MaterialExpressionNoise, x, y); n.set_editor_property('scale', scale); n.set_editor_property('output_min', 0.0); n.set_editor_property('output_max', 1.0)
    n.set_editor_property('levels', 4); L.connect_material_expressions(wp, '', n, 'Position'); return n
n1, n2 = noise(0.0015, -1300, -200), noise(0.02, -1300, 100)
floorA, floorB, moss = const3(0.085, 0.07, 0.045, -1000, -400), const3(0.05, 0.06, 0.03, -1000, -300), const3(0.045, 0.075, 0.03, -1000, -200)
l1 = node(unreal.MaterialExpressionLinearInterpolate, -700, -350); L.connect_material_expressions(floorA, '', l1, 'A'); L.connect_material_expressions(floorB, '', l1, 'B'); L.connect_material_expressions(n1, '', l1, 'Alpha')
l2 = node(unreal.MaterialExpressionLinearInterpolate, -500, -300); L.connect_material_expressions(l1, '', l2, 'A'); L.connect_material_expressions(moss, '', l2, 'B'); L.connect_material_expressions(n2, '', l2, 'Alpha')
# slope: the world normal's up component; rock where it is below ~0.82
vn = node(unreal.MaterialExpressionVertexNormalWS, -1300, 400)
mask = node(unreal.MaterialExpressionComponentMask, -1100, 400); mask.set_editor_property('r', False); mask.set_editor_property('g', False); mask.set_editor_property('b', True); L.connect_material_expressions(vn, '', mask, '')
sm = node(unreal.MaterialExpressionSmoothStep, -900, 400); L.connect_material_expressions(mask, '', sm, 'Value')
sm.set_editor_property('const_min', 0.72); sm.set_editor_property('const_max', 0.86)
rock = const3(0.18, 0.17, 0.15, -700, 500)
l3 = node(unreal.MaterialExpressionLinearInterpolate, -300, -100); L.connect_material_expressions(rock, '', l3, 'A'); L.connect_material_expressions(l2, '', l3, 'B'); L.connect_material_expressions(sm, '', l3, 'Alpha')
# the water's edge: below the lakes' level (Z under ~1950 cm: Upper 1893, Lower 1823) dark wet mud, the rest as above
z = node(unreal.MaterialExpressionComponentMask, -1300, 700); z.set_editor_property('r', False); z.set_editor_property('g', False); z.set_editor_property('b', True); L.connect_material_expressions(wp, '', z, '')
wet = node(unreal.MaterialExpressionSmoothStep, -1100, 700); L.connect_material_expressions(z, '', wet, 'Value'); wet.set_editor_property('const_min', 1850.0); wet.set_editor_property('const_max', 2000.0)
mud = const3(0.06, 0.05, 0.035, -700, 800)
l4 = node(unreal.MaterialExpressionLinearInterpolate, -100, 0); L.connect_material_expressions(mud, '', l4, 'A'); L.connect_material_expressions(l3, '', l4, 'B'); L.connect_material_expressions(wet, '', l4, 'Alpha')
L.connect_material_property(l4, '', unreal.MaterialProperty.MP_BASE_COLOR)
rough = node(unreal.MaterialExpressionConstant, -100, 200); rough.set_editor_property('r', 0.92); L.connect_material_property(rough, '', unreal.MaterialProperty.MP_ROUGHNESS)
L.recompile_material(m)
unreal.EditorAssetLibrary.save_asset(path + '/' + name)
unreal.log_warning('HB made ' + path + '/' + name)
