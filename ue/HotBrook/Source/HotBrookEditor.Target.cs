using UnrealBuildTool;

public class HotBrookEditorTarget : TargetRules
{
	public HotBrookEditorTarget(TargetInfo Target) : base(Target)
	{
		Type = TargetType.Editor;
		DefaultBuildSettings = BuildSettingsVersion.Latest;
		IncludeOrderVersion = EngineIncludeOrderVersion.Latest;
		ExtraModuleNames.Add("HotBrook");
		ExtraModuleNames.Add("HotBrookEditor");
	}
}
