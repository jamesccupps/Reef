// HotBrookFarLand — the land beyond the landscape: the hills and ridges out to ~22 km about the lakes (ue/export/build_farland.py:
// USGS 3DEP ground with the forest's height on it, the Earth's curve, the aerial photo's colour), so the wind farm's ridges to the west
// stand under their turbines and the horizon is the one the lakes' photos show. Its colour by the season (M_HB_FarLand,
// Scripts/make_farland_material.py): the hardwoods' share of the canopy turning in early October and bare from late October to
// mid-May by the forest's own leaf calendar (hb.LeafDate shows another date's), snow on it while snow lies on the land.
#pragma once
#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "HotBrookFarLand.generated.h"

class UStaticMeshComponent;
class UMaterialInstanceDynamic;

UCLASS()
class HOTBROOK_API AHotBrookFarLand : public AActor
{
	GENERATED_BODY()
public:
	AHotBrookFarLand();
	virtual void BeginPlay() override;
	virtual void Tick(float Dt) override;
private:
	UPROPERTY() TObjectPtr<UStaticMeshComponent> Land;
	UPROPERTY() TObjectPtr<UMaterialInstanceDynamic> Mat;
};
