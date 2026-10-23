# make_water_material.py — the lakes' water (/Game/HotBrook/Materials/M_LakeWater): Unreal's Single Layer Water shading (the light
# absorbed and scattered through the water's depth, the bed seen through the shallows, Lumen's reflections of the shore and the sky on
# top) with the Hot Brook lakes' tea colour — water stained by the forest's dissolved organic matter absorbs blue most, then green, so
# the shallows over the cobbles go amber and the deep water dark brown-black (the human's photos) — and a light breeze's ripples (the
# Water plugin's tiling wave normals, two scales drifting across each other).
#   UnrealEditor-Cmd.exe G:\HotBrookUE\HotBrook.uproject -run=pythonscript -script=G:/HotBrookUE/Scripts/make_water_material.py
import unreal
L = unreal.MaterialEditingLibrary
tools = unreal.AssetToolsHelpers.get_asset_tools()
path, name = '/Game/HotBrook/Materials', 'M_LakeWater'
if unreal.EditorAssetLibrary.does_asset_exist(path + '/' + name): unreal.EditorAssetLibrary.delete_asset(path + '/' + name)
m = tools.create_asset(name, path, unreal.Material, unreal.MaterialFactoryNew())
m.set_editor_property('shading_model', unreal.MaterialShadingModel.MSM_SINGLE_LAYER_WATER)
m.set_editor_property('blend_mode', unreal.BlendMode.BLEND_OPAQUE)
m.set_editor_property('two_sided', True)
def node(cls, x, y): return L.create_material_expression(m, cls, x, y)
def const3(r, g, b, x, y):
    n = node(unreal.MaterialExpressionConstant3Vector, x, y); n.set_editor_property('constant', unreal.LinearColor(r, g, b, 1)); return n
def const1(v, x, y):
    n = node(unreal.MaterialExpressionConstant, x, y); n.set_editor_property('r', v); return n
# the ripples: world-space UVs at two scales, panning in two directions, the normals averaged and flattened
nt = unreal.load_asset('/Water/Textures/Normals/T_Water_TilingNormal_Waves_02')
wp = node(unreal.MaterialExpressionWorldPosition, -1600, 0)
xy = node(unreal.MaterialExpressionComponentMask, -1400, 0); xy.set_editor_property('r', True); xy.set_editor_property('g', True); xy.set_editor_property('b', False); L.connect_material_expressions(wp, '', xy, '')
def ripple(scale, sx, sy, yy):
    d = node(unreal.MaterialExpressionMultiply, -1200, yy); L.connect_material_expressions(xy, '', d, 'A'); d.set_editor_property('const_b', 1.0 / scale)
    p = node(unreal.MaterialExpressionPanner, -1000, yy); L.connect_material_expressions(d, '', p, 'Coordinate'); p.set_editor_property('speed_x', sx); p.set_editor_property('speed_y', sy)
    t = node(unreal.MaterialExpressionTextureSample, -800, yy); t.set_editor_property('texture', nt); t.set_editor_property('sampler_type', unreal.MaterialSamplerType.SAMPLERTYPE_NORMAL)
    L.connect_material_expressions(p, '', t, 'UVs'); return t
r1, r2 = ripple(900.0, 0.012, 0.007, -100), ripple(2600.0, -0.006, 0.009, 150)
avg = node(unreal.MaterialExpressionAdd, -550, 0); L.connect_material_expressions(r1, 'RGB', avg, 'A'); L.connect_material_expressions(r2, 'RGB', avg, 'B')
flat = node(unreal.MaterialExpressionFlattenNormal, -350, 0) if hasattr(unreal, 'MaterialExpressionFlattenNormal') else None
nrm = node(unreal.MaterialExpressionLinearInterpolate, -350, 0)
L.connect_material_expressions(const3(0, 0, 1, -550, 200), '', nrm, 'A'); L.connect_material_expressions(avg, '', nrm, 'B'); nrm.set_editor_property('const_alpha', 0.22)
L.connect_material_property(nrm, '', unreal.MaterialProperty.MP_NORMAL)
L.connect_material_property(const3(0.0, 0.0, 0.0, -200, -300), '', unreal.MaterialProperty.MP_BASE_COLOR)
L.connect_material_property(const1(0.03, -200, -200), '', unreal.MaterialProperty.MP_ROUGHNESS)
L.connect_material_property(const1(0.5, -200, -150), '', unreal.MaterialProperty.MP_SPECULAR)
# the water itself: absorption and scattering per metre (tea-coloured: blue absorbed fastest; Secchi ~3–4 m), forward scattering
out = node(unreal.MaterialExpressionSingleLayerWaterMaterialOutput, 0, 300)
pins = {}
for nm, v in [('Scattering Coefficients', const3(0.035, 0.03, 0.015, -300, 300)), ('Absorption Coefficients', const3(0.42, 0.62, 1.75, -300, 400)),
              ('Phase G', const1(0.15, -300, 500)), ('Color Scale Behind Water', const1(1.0, -300, 550))]:
    try: L.connect_material_expressions(v, '', out, nm); pins[nm] = 'ok'
    except Exception as e: pins[nm] = str(e)
L.recompile_material(m)
unreal.EditorAssetLibrary.save_asset(path + '/' + name)
unreal.log_warning('HB made %s/%s; water pins %s; normal texture %s' % (path, name, pins, bool(nt)))
