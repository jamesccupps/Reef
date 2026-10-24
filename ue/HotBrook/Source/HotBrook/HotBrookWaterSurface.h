// HotBrookWaterSurface — the lakes' surfaces: each lake's shoreline (Import/lakes.json, the waterline the sim ends at) pushed a few
// metres out under the banks, triangulated, and laid flat at the lake's level (Upper 128.93 m, Lower 128.23 m) with the lakes' water
// material (M_LakeWater: Single Layer Water, tea-coloured). The ground the banks rise to hides the surface where it runs under them,
// so the shore you see is where the land meets the water — as games draw calm lakes. (Unreal's Water plugin bodies were tried first:
// built headless, their editor hooks into the landscape crashed the build and never drew in the game.)
#pragma once
#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "HotBrookWaterSurface.generated.h"

class UProceduralMeshComponent;

UCLASS()
class HOTBROOK_API AHotBrookWaterSurface : public AActor
{
	GENERATED_BODY()
public:
	AHotBrookWaterSurface();
	virtual void BeginPlay() override;
	UPROPERTY(EditAnywhere, Category = "HotBrook") float BankOverlap = 12.f;   // m the surface runs under the banks (the shoreline is the 0.25-m depth line: on a gentle beach the water reaches metres past it)
private:
	UPROPERTY() TObjectPtr<UProceduralMeshComponent> Mesh;
};
