# make_water_material.py — the lakes' water (/Game/HotBrook/Materials/M_LakeWater): Unreal's Single Layer Water shading (the light
# absorbed and scattered through the water's depth, the bed seen through the shallows, Lumen's reflections of the shore and the sky on
# top) with the Hot Brook lakes' tea colour — water stained by the forest's dissolved organic matter absorbs blue most, then green, so
# the shallows over the cobbles go amber and the deep water dark brown-black (the human's photos) — and a light breeze's ripples (the
# Water plugin's tiling wave normals, three scales drifting across each other, as strong as the sim's wind makes them).
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
bad = []   # (connect_material_expressions reports a wrong pin name by returning False, not by raising: every link is checked)
def link(a, ao, b, bi):
    if not L.connect_material_expressions(a, ao, b, bi): bad.append('%s.%s -> %s.%s' % (a.get_class().get_name(), ao, b.get_class().get_name(), bi))
def out(a, ao, prop):
    if not L.connect_material_property(a, ao, prop): bad.append('%s.%s -> %s' % (a.get_class().get_name(), ao, prop))
def const3(r, g, b, x, y):
    n = node(unreal.MaterialExpressionConstant3Vector, x, y); n.set_editor_property('constant', unreal.LinearColor(r, g, b, 1)); return n
def const1(v, x, y):
    n = node(unreal.MaterialExpressionConstant, x, y); n.set_editor_property('r', v); return n
# the ripples: world-space UVs at three scales — the capillary ripples (35 cm a repeat), a chop (1.1 m) and the wind's longer waves
# (3.2 m) — drifting different ways, together as one slope; their strength by 'Chop' (0 a mirror calm, 1 a 6-m/s chop: the actor sets
# it from the sim's wind), 'Flow' (the brook: 1) driving them three times as fast. The two big repeats it had (2.6 and 7 m, at a tenth)
# read close to as slow glassy swells carrying broad sheets of the sky; the lakes' own ripples are centimetres to a few tens
nt = unreal.load_asset('/Water/Textures/Normals/T_Water_TilingNormal_Waves_02')
wp = node(unreal.MaterialExpressionWorldPosition, -1600, 0)
xy = node(unreal.MaterialExpressionComponentMask, -1400, 0); xy.set_editor_property('r', True); xy.set_editor_property('g', True); xy.set_editor_property('b', False); link(wp, '', xy, '')
def scalar(name, v, x, y):
    s = node(unreal.MaterialExpressionScalarParameter, x, y); s.set_editor_property('parameter_name', name); s.set_editor_property('default_value', v); return s
chop, flow = scalar('Chop', 0.4, -1400, 500), scalar('Flow', 0.0, -1600, 400)
tm = node(unreal.MaterialExpressionTime, -1600, 300)
fl = node(unreal.MaterialExpressionMultiply, -1400, 400); link(flow, '', fl, 'A'); fl.set_editor_property('const_b', 2.0)
fl1 = node(unreal.MaterialExpressionAdd, -1300, 400); link(fl, '', fl1, 'A'); fl1.set_editor_property('const_b', 1.0)
ft = node(unreal.MaterialExpressionMultiply, -1200, 350); link(tm, '', ft, 'A'); link(fl1, '', ft, 'B')
def ripple(scale, sx, sy, yy):
    d = node(unreal.MaterialExpressionMultiply, -1200, yy); link(xy, '', d, 'A'); d.set_editor_property('const_b', 1.0 / scale)
    p = node(unreal.MaterialExpressionPanner, -1000, yy); link(d, '', p, 'Coordinate'); link(ft, '', p, 'Time'); p.set_editor_property('speed_x', sx); p.set_editor_property('speed_y', sy)
    t = node(unreal.MaterialExpressionTextureSample, -800, yy); t.set_editor_property('texture', nt); t.set_editor_property('sampler_type', unreal.MaterialSamplerType.SAMPLERTYPE_NORMAL)
    link(p, '', t, 'UVs'); return t
r1, r2, r3 = ripple(35.0, 0.22, 0.13, -200), ripple(110.0, -0.07, 0.10, 0), ripple(320.0, 0.035, -0.02, 200)
nrm = node(unreal.MaterialExpressionCustom, -500, 0); nrm.set_editor_property('output_type', unreal.CustomMaterialOutputType.CMOT_FLOAT3)
nrm.set_editor_property('code', 'float2 d = N1.xy * (0.05 + 0.40 * Chop) + N2.xy * (0.03 + 0.32 * Chop) + N3.xy * (0.02 + 0.22 * Chop); return normalize(float3(d, 1.0));')
ins = []
for nm in ('N1', 'N2', 'N3', 'Chop'):
    ci = unreal.CustomInput(); ci.set_editor_property('input_name', nm); ins.append(ci)
nrm.set_editor_property('inputs', ins)
link(r1, 'RGB', nrm, 'N1'); link(r2, 'RGB', nrm, 'N2'); link(r3, 'RGB', nrm, 'N3'); link(chop, '', nrm, 'Chop')
out(nrm, '', unreal.MaterialProperty.MP_NORMAL)
out(const3(0.0, 0.0, 0.0, -200, -300), '', unreal.MaterialProperty.MP_BASE_COLOR)
out(const1(0.03, -200, -200), '', unreal.MaterialProperty.MP_ROUGHNESS)
out(const1(0.255, -200, -150), '', unreal.MaterialProperty.MP_SPECULAR)   # (F0 0.02: water's, n = 1.33)
# (Opacity, for Single Layer Water, is how much of the surface something lying ON the water covers — foam, scum — and the water's own
# light and what lies under it are shown through the rest. It defaults to 1: the lakes were drawn as a black skin carrying only
# reflections, opaque even at the shore's edge. Nothing floats on these lakes' surface: 0.)
out(const1(0.0, -200, -100), '', unreal.MaterialProperty.MP_OPACITY)
# the water itself: absorption and scattering (the node takes them per CENTIMETRE: per metre ÷ 100) — tea-coloured, blue absorbed
# fastest (per metre: red 0.42, green 0.62, blue 1.75; Secchi ~3–4 m), a little forward scattering — little scattering (per metre
# 0.009/0.008/0.004: a humic lake's deep water sends back ~1 % of the light — dark brown-black from above, amber over the shallows;
# 4× this glowed orange once the water showed). Its pins go by their property
# names (ScatteringCoefficients …), not the captions the editor shows.
slw = node(unreal.MaterialExpressionSingleLayerWaterMaterialOutput, 0, 300)
for nm, v in [('ScatteringCoefficients', const3(0.00009, 0.00008, 0.00004, -300, 300)), ('AbsorptionCoefficients', const3(0.0042, 0.0062, 0.0175, -300, 400)),
              ('PhaseG', const1(0.15, -300, 500)), ('ColorScaleBehindWater', const1(1.0, -300, 550))]:
    link(v, '', slw, nm)
L.recompile_material(m)
unreal.EditorAssetLibrary.save_asset(path + '/' + name)
unreal.log_warning('HB made %s/%s; links that failed: %s; normal texture %s' % (path, name, bad or 'none', bool(nt)))
