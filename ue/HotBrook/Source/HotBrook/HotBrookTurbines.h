// HotBrookTurbines — the wind farm on the ridges south-west of the lakes, seen from the water: the Stetson wind farm and its expansion
// (55 GE 1.5-77s: 80-m hubs, 77-m rotors), each where the US Wind Turbine Database puts it (Import/turbines.json: ue/export/
// export_turbines.mjs) — on the landscape where it reaches, else at its ground's own height (the USGS elevation service's), beyond the
// world's edge on the ridges you see from the lakes. Each one yawed slowly into the sim's wind, its rotor turning as a GE 1.5's does at
// that wind at its hub (the surface wind × (80/10)^0.14): still below the 3.5-m/s cut-in, 10 to 20 turns a minute up to its rated
// speed; by night the red aviation beacons on a third of them (the rows' ends, every third) flashing together, 30 a minute.
#pragma once
#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "HotBrookTurbines.generated.h"

class UStaticMeshComponent;
class UMaterialInstanceDynamic;

UCLASS()
class HOTBROOK_API AHotBrookTurbines : public AActor
{
	GENERATED_BODY()
public:
	AHotBrookTurbines();
	virtual void BeginPlay() override;
	virtual void Tick(float Dt) override;
	int32 Num() const { return Turbines.Num(); }
private:
	struct FTurbine { TObjectPtr<UStaticMeshComponent> Tower, Rotor, Beacon; FVector Base; float Yaw = 0.f, YawOff = 0.f, Angle = 0.f; bool bSet = false; };
	TArray<FTurbine> Turbines;
	UPROPERTY() TArray<TObjectPtr<UObject>> Held;
	UPROPERTY() TObjectPtr<UMaterialInstanceDynamic> BeaconMat;
	float Rpm = 0.f;
};
