// HotBrookWaterSurface — the lakes' surfaces: each lake's shoreline (Import/lakes.json, the waterline the sim ends at) pushed a few
// metres out under the banks, triangulated, and laid flat at the lake's level (Upper 128.93 m, Lower 128.23 m) with the lakes' water
// material (M_LakeWater: Single Layer Water, tea-coloured). The ground the banks rise to hides the surface where it runs under them,
// so the shore you see is where the land meets the water — as games draw calm lakes. (Unreal's Water plugin bodies were tried first:
// built headless, their editor hooks into the landscape crashed the build and never drew in the game.) Under the surface — the
// camera's, the walker's diving or a shot's — the water is seen from inside: M_HB_Underwater (Scripts/make_underwater_material.py),
// switched on while the camera is under, given the surface over it and the daylight on the water. The BROOK between the lakes: the
// water grid's wet cells along its course and a ring of cells under its banks, each corner at the brook's own level there (it falls
// ~0.7 m from Upper to Lower), sunk a few cm under a lake's surface where that reaches over it (the two would flicker).
#pragma once
#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "HotBrookWaterSurface.generated.h"

class UProceduralMeshComponent;
class UPostProcessComponent;
class UMaterialInstanceDynamic;

UCLASS()
class HOTBROOK_API AHotBrookWaterSurface : public AActor
{
	GENERATED_BODY()
public:
	AHotBrookWaterSurface();
	virtual void BeginPlay() override;
	virtual void Tick(float Dt) override;
	UPROPERTY(EditAnywhere, Category = "HotBrook") float BankOverlap = 12.f;   // m the surface runs under the banks (the shoreline is the 0.25-m depth line: on a gentle beach the water reaches metres past it)
private:
	UPROPERTY() TObjectPtr<UProceduralMeshComponent> Mesh;
	UPROPERTY() TObjectPtr<UPostProcessComponent> Under;
	UPROPERTY() TObjectPtr<UMaterialInstanceDynamic> UnderMat;
	UPROPERTY() TObjectPtr<class ADirectionalLight> Sun;
};
