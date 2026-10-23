// HotBrookBuild — makes /Game/Maps/HotBrook from the world exporter's files (G:/HotBrookUE/Import, ue/export/export_world.mjs):
// the landscape (the lidar ground and the 1949 lake beds), the lakes as Unreal water bodies on their shorelines, the physical sky, the
// sun, volumetric clouds, the fog, and the walker's start on a shore.
//   UnrealEditor-Cmd.exe G:\HotBrookUE\HotBrook.uproject -run=HotBrookBuild
#pragma once
#include "CoreMinimal.h"
#include "Commandlets/Commandlet.h"
#include "HotBrookBuildCommandlet.generated.h"

UCLASS()
class UHotBrookBuildCommandlet : public UCommandlet
{
	GENERATED_BODY()
public:
	virtual int32 Main(const FString& Params) override;
};
