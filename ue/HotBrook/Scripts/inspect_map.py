# inspect_map.py — what /Game/Maps/HotBrook holds (actors, the landscape's components and bounds): a check after HotBrookBuild.
#   UnrealEditor-Cmd.exe G:\HotBrookUE\HotBrook.uproject -run=pythonscript -script=G:/HotBrookUE/Scripts/inspect_map.py
import unreal
unreal.EditorLoadingAndSavingUtils.load_map('/Game/Maps/HotBrook')
actors = unreal.get_editor_subsystem(unreal.EditorActorSubsystem).get_all_level_actors()
for a in actors:
    unreal.log_warning('HB actor %s "%s" at %s' % (a.get_class().get_name(), a.get_actor_label(), a.get_actor_location()))
    if isinstance(a, unreal.LandscapeProxy):
        comps = a.get_components_by_class(unreal.LandscapeComponent)
        cols = a.get_components_by_class(unreal.LandscapeHeightfieldCollisionComponent)
        unreal.log_warning('HB landscape: %d components, %d collision; scale %s' % (len(comps), len(cols), a.get_actor_scale3d()))
        if comps:
            o, e = comps[0].get_local_bounds() if hasattr(comps[0], 'get_local_bounds') else (None, None)
            unreal.log_warning('HB first component at %s' % comps[0].get_world_location())
