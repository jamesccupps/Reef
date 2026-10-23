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
# THE FOREST FROM AFAR (the trees stream only within ~1.2 km): the aerial photos' canopy (Import/canopy_rgba.png: RGB its colour, A the
# cover) over the far grid's extent — x −2880…2440 m, y −4920…5040 m, row 0 north — blended in past ~900 m from the eye
task = unreal.AssetImportTask(); task.filename = unreal.Paths.project_dir() + 'Import/canopy_rgba.png'; task.destination_path = '/Game/HotBrook/Textures'
task.destination_name = 'T_Canopy'; task.automated = True; task.replace_existing = True; task.save = True
tools.import_asset_tasks([task])
tex = unreal.load_asset('/Game/HotBrook/Textures/T_Canopy')
if tex:
    tex.set_editor_property('address_x', unreal.TextureAddress.TA_CLAMP); tex.set_editor_property('address_y', unreal.TextureAddress.TA_CLAMP)
    unreal.EditorAssetLibrary.save_asset('/Game/HotBrook/Textures/T_Canopy')
    def mask(src, ch, x, y):
        n = node(unreal.MaterialExpressionComponentMask, x, y)
        for c in 'rgba': n.set_editor_property(c, c == ch)
        L.connect_material_expressions(src, '', n, ''); return n
    def scalar_op(cls, a_node, const, x, y):   # (a node of a_node with a constant B)
        n = node(cls, x, y); L.connect_material_expressions(a_node, '', n, 'A'); n.set_editor_property('const_b', const); return n
    wx, wy = mask(wp, 'r', -1700, 1000), mask(wp, 'g', -1700, 1100)
    u = scalar_op(unreal.MaterialExpressionMultiply, scalar_op(unreal.MaterialExpressionAdd, scalar_op(unreal.MaterialExpressionMultiply, wx, 0.01, -1500, 1000), 2880.0, -1350, 1000), 1.0 / 5320.0, -1200, 1000)
    v = scalar_op(unreal.MaterialExpressionMultiply, scalar_op(unreal.MaterialExpressionAdd, scalar_op(unreal.MaterialExpressionMultiply, wy, 0.01, -1500, 1100), 5040.0, -1350, 1100), 1.0 / 9960.0, -1200, 1100)
    uv = node(unreal.MaterialExpressionAppendVector, -1050, 1050); L.connect_material_expressions(u, '', uv, 'A'); L.connect_material_expressions(v, '', uv, 'B')
    ts = node(unreal.MaterialExpressionTextureSample, -900, 1050); ts.set_editor_property('texture', tex); L.connect_material_expressions(uv, '', ts, 'UVs')
    shade = node(unreal.MaterialExpressionLinearInterpolate, -700, 1000); shade.set_editor_property('const_a', 0.8); shade.set_editor_property('const_b', 1.15); L.connect_material_expressions(n1, '', shade, 'Alpha')
    can = node(unreal.MaterialExpressionMultiply, -550, 1000); L.connect_material_expressions(ts, 'RGB', can, 'A'); L.connect_material_expressions(shade, '', can, 'B')
    cam = node(unreal.MaterialExpressionCameraPositionWS, -1100, 1300)
    dist = node(unreal.MaterialExpressionDistance, -900, 1300); L.connect_material_expressions(cam, '', dist, 'A'); L.connect_material_expressions(wp, '', dist, 'B')
    far = node(unreal.MaterialExpressionSmoothStep, -700, 1300); L.connect_material_expressions(dist, '', far, 'Value'); far.set_editor_property('const_min', 90000.0); far.set_editor_property('const_max', 140000.0)
    k = node(unreal.MaterialExpressionMultiply, -500, 1250); L.connect_material_expressions(ts, 'A', k, 'A'); L.connect_material_expressions(far, '', k, 'B')
    l5 = node(unreal.MaterialExpressionLinearInterpolate, 100, 100); L.connect_material_expressions(l4, '', l5, 'A'); L.connect_material_expressions(can, '', l5, 'B'); L.connect_material_expressions(k, '', l5, 'Alpha')
    L.connect_material_property(l5, '', unreal.MaterialProperty.MP_BASE_COLOR)
else:
    unreal.log_warning('HB the canopy texture did not import: the ground without the far forest')
    L.connect_material_property(l4, '', unreal.MaterialProperty.MP_BASE_COLOR)
rough = node(unreal.MaterialExpressionConstant, -100, 200); rough.set_editor_property('r', 0.92); L.connect_material_property(rough, '', unreal.MaterialProperty.MP_ROUGHNESS)
L.recompile_material(m)
unreal.EditorAssetLibrary.save_asset(path + '/' + name)
unreal.log_warning('HB made ' + path + '/' + name)
