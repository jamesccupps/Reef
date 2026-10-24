using UnrealBuildTool;

// the game module: the walker (HotBrookCharacter), its game mode, and the live link to the simulation (HotBrookLink: a WebSocket
// client of ue/link/simhost.mjs on localhost)
public class HotBrook : ModuleRules
{
	public HotBrook(ReadOnlyTargetRules Target) : base(Target)
	{
		PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;
		PublicDependencyModuleNames.AddRange(new string[] { "Core", "CoreUObject", "Engine", "InputCore", "WebSockets", "Json", "ProceduralMeshComponent", "RHI", "RenderCore" });
	}
}
