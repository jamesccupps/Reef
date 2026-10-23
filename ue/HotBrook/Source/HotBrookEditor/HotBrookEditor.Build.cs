using UnrealBuildTool;

// the editor module: HotBrookBuild, the commandlet that makes the level from the world exporter's files (Import/)
public class HotBrookEditor : ModuleRules
{
	public HotBrookEditor(ReadOnlyTargetRules Target) : base(Target)
	{
		PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;
		PrivateDependencyModuleNames.AddRange(new string[] { "Core", "CoreUObject", "Engine", "UnrealEd", "Landscape", "Water", "Json", "HotBrook" });
	}
}
